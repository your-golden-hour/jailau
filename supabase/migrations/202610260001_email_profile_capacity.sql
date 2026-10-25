-- Upgrade the existing Jailau project. Apply once after reviewing the local schema tests.
begin;

grant update(phone) on public.users to authenticated;

-- Keep the old signature temporarily for rollback, but make it inaccessible.
revoke all on function public.complete_profile(text,text,uuid,jsonb) from public,anon,authenticated;
create function public.complete_profile(p_phone text,p_name text,p_role text,p_village_id uuid default null,
  p_driver jsonb default null) returns public.users
language plpgsql security definer set search_path = '' as $$
declare u public.users;
begin
  if auth.uid() is null or p_role is null or p_role not in ('passenger','driver') then
    raise exception 'error_generic' using errcode = '42501';
  end if;
  insert into public.users(id,name,phone,role,village_id)
    values(auth.uid(),p_name,p_phone,p_role,p_village_id) returning * into u;
  if p_role = 'driver' then
    insert into public.driver_profiles(user_id,zone_id,car_brand,plate,seats,fuel_consumption)
    values (u.id,(p_driver->>'zone_id')::uuid,p_driver->>'car_brand',p_driver->>'plate',
      (p_driver->>'seats')::integer,coalesce((p_driver->>'fuel_consumption')::numeric,
        (select default_fuel_consumption from public.settings where id = 'default')));
  end if;
  return u;
end;
$$;

create or replace function public.accept_request(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare d public.driver_profiles; wanted public.requests; result_id uuid;
  trip_start timestamptz; occupied integer;
begin
  select * into d from public.driver_profiles where user_id = auth.uid() for update;
  if not found or d.approval_status <> 'active' or not d.is_online then
    raise exception 'df_need_approved' using errcode = '42501';
  end if;
  select * into wanted from public.requests where id = p_request_id for update;
  if not found or wanted.status <> 'open' or wanted.seats > d.seats
    or (wanted."when" = 'scheduled' and wanted.datetime <= now())
    or not exists(select 1 from public.villages v where v.id = wanted.village_id and v.zone_id = d.zone_id) then
    raise exception 'df_already_taken';
  end if;
  trip_start := case when wanted."when" = 'scheduled' then wanted.datetime else now() end;
  select coalesce(sum(r.seats),0) into occupied from public.requests r
    where r.driver_id = d.user_id and r.status = 'accepted'
      and coalesce(r.datetime,r.accepted_at) < trip_start + interval '2 hours'
      and coalesce(r.datetime,r.accepted_at) + interval '2 hours' > trip_start;
  if occupied + wanted.seats > d.seats then
    raise exception 'df_no_seats';
  end if;
  update public.requests r set status = 'accepted',driver_id = d.user_id,accepted_at = now()
    where r.id = p_request_id and r.status = 'open' returning r.id into result_id;
  if result_id is null then raise exception 'df_already_taken'; end if;
  return result_id;
end;
$$;

create or replace function public.confirm_trip_done(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare assigned_driver uuid; result_id uuid;
begin
  select driver_id into assigned_driver from public.requests
    where id = p_request_id and passenger_id = auth.uid() and status = 'accepted';
  if assigned_driver is null then raise exception 'error_generic'; end if;
  perform 1 from public.driver_profiles where user_id = assigned_driver for update;
  update public.requests set status = 'done',done_at = now()
    where id = p_request_id and passenger_id = auth.uid() and status = 'accepted'
      and driver_id = assigned_driver
      and now() >= greatest(accepted_at,coalesce(datetime,accepted_at)) + interval '1 hour'
    returning id into result_id;
  if result_id is null then raise exception 'trip_too_early'; end if;
  update public.driver_profiles set completed_trips = completed_trips + 1
    where user_id = assigned_driver;
  return result_id;
end;
$$;

revoke all on function public.complete_profile(text,text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.complete_profile(text,text,text,uuid,jsonb) to authenticated;
commit;
