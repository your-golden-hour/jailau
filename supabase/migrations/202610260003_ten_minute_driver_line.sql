-- Keep driver availability and UI aligned to a ten-minute line lease.
begin;

create or replace function jailau_private.can_read_request(r public.requests) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    jailau_private.is_admin() or r.passenger_id = auth.uid() or exists (
      select 1 from public.driver_profiles d join public.villages v on v.id = r.village_id
      where d.user_id = auth.uid() and d.approval_status <> 'blocked'
        and (r.driver_id = auth.uid() or
          (d.approval_status = 'active' and d.zone_id = v.zone_id
           and r.status = 'open' and d.is_online
           and d.online_since > now() - interval '10 minutes'
           and d.online_location = case when r.direction = 'village_to_city' then 'village' else 'city' end))
    )
  );
$$;

create or replace function public.accept_request(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare d public.driver_profiles; wanted public.requests; result_id uuid;
  trip_start timestamptz; occupied integer;
begin
  select * into d from public.driver_profiles where user_id = auth.uid() for update;
  if not found or d.approval_status <> 'active' or not d.is_online
    or d.online_since <= now() - interval '10 minutes' then
    raise exception 'df_need_approved' using errcode = '42501';
  end if;
  select * into wanted from public.requests where id = p_request_id for update;
  if not found or wanted.status <> 'open'
    or (wanted."when" = 'scheduled' and wanted.datetime <= now())
    or not exists(select 1 from public.villages v where v.id = wanted.village_id and v.zone_id = d.zone_id)
    or d.online_location <> (case when wanted.direction = 'village_to_city' then 'village' else 'city' end) then
    raise exception 'df_already_taken';
  end if;
  if wanted.seats > d.seats then raise exception 'df_no_seats'; end if;
  trip_start := case when wanted."when" = 'scheduled' then wanted.datetime else now() end;
  select coalesce(sum(r.seats),0) into occupied from public.requests r
    where r.driver_id = d.user_id and r.status in ('offered','accepted')
      and coalesce(r.datetime,r.accepted_at,r.offered_at) < trip_start + interval '2 hours'
      and coalesce(r.datetime,r.accepted_at,r.offered_at) + interval '2 hours' > trip_start;
  if occupied + wanted.seats > d.seats then raise exception 'df_no_seats'; end if;
  update public.requests set status = 'offered',driver_id = d.user_id,offered_at = now()
    where id = p_request_id and status = 'open' returning id into result_id;
  if result_id is null then raise exception 'df_already_taken'; end if;
  return result_id;
end;
$$;

create or replace function public.set_driver_online(p_online boolean,p_location text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d public.driver_profiles;
begin
  if p_online and p_location not in ('village','city') then raise exception 'line_location_required'; end if;
  update public.driver_profiles set
    is_online = p_online,
    online_location = case when p_online then p_location else null end,
    online_since = case when not p_online then null
      when is_online and online_location = p_location and online_since > now() - interval '10 minutes'
        then online_since else now() end
    where user_id = auth.uid() and approval_status = 'active' returning * into d;
  if not found then raise exception 'df_need_approved' using errcode = '42501'; end if;
  return jsonb_build_object('is_online',d.is_online,'online_since',d.online_since,
    'online_location',d.online_location);
end;
$$;

create or replace function public.list_requests(p_kind text,p_limit integer default 50,
  p_offset integer default 0) returns setof jsonb
language sql stable security definer set search_path = '' as $$
  select jailau_private.request_json(r.id) from public.requests r
  where jailau_private.can_read_request(r) and (
    (p_kind = 'mine' and r.passenger_id = auth.uid()) or
    (p_kind = 'driver' and r.driver_id = auth.uid() and r.status in ('offered','accepted','done')) or
    (p_kind = 'feed' and r.status = 'open' and exists(
      select 1 from public.driver_profiles dp where dp.user_id = auth.uid()
        and dp.approval_status = 'active' and dp.is_online
        and dp.online_since > now() - interval '10 minutes'))
  ) order by r.created_at desc,r.id limit greatest(0,least(coalesce(p_limit,50),100))
    offset greatest(0,coalesce(p_offset,0));
$$;

create or replace function public.list_online_drivers(p_village_id uuid,p_location text default 'village') returns table(
  name text,car_brand text,seats integer,online_since timestamptz,completed_trips integer)
language sql stable security definer set search_path = '' as $$
  select u.name,d.car_brand,d.seats,d.online_since,d.completed_trips
  from public.driver_profiles d join public.users u on u.id = d.user_id
  join public.villages v on v.zone_id = d.zone_id
  where v.id = p_village_id and p_location in ('village','city')
    and d.approval_status = 'active' and d.is_online and d.online_location = p_location
    and d.online_since > now() - interval '10 minutes'
    and exists(select 1 from public.users viewer where viewer.id = auth.uid()
      and (viewer.role <> 'driver' or exists(select 1 from public.driver_profiles own
        where own.user_id = viewer.id and own.approval_status = 'active' and own.zone_id = v.zone_id)))
  order by d.online_since,d.user_id limit 100;
$$;

create or replace function public.online_driver_counts(p_zone_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('village',count(*) filter (where online_location = 'village'),
    'city',count(*) filter (where online_location = 'city'))
  from public.driver_profiles d
  where d.zone_id = p_zone_id and d.is_online and d.approval_status = 'active'
    and d.online_since > now() - interval '10 minutes'
    and exists(select 1 from public.driver_profiles own where own.user_id = auth.uid()
      and own.zone_id = p_zone_id and own.approval_status = 'active');
$$;

commit;
