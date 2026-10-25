-- Initial migration for a NEW, empty Supabase project. Run once as postgres.
-- No people, passwords, credentials, or geographic demo fixtures are seeded.
begin;

create schema jailau_private;
revoke all on schema jailau_private from public, anon, authenticated;
grant usage on schema jailau_private to authenticated;

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null check (jsonb_typeof(name) = 'object'
    and length(btrim(name->>'ru')) between 1 and 120
    and length(btrim(name->>'kz')) between 1 and 120
    and name ?& array['ru','kz'] and jsonb_typeof(name->'ru') = 'string'
    and jsonb_typeof(name->'kz') = 'string')
);
create table public.villages (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id),
  name jsonb not null check (jsonb_typeof(name) = 'object'
    and name ?& array['ru','kz'] and length(btrim(name->>'ru')) between 1 and 120
    and length(btrim(name->>'kz')) between 1 and 120
    and jsonb_typeof(name->'ru') = 'string' and jsonb_typeof(name->'kz') = 'string'),
  lat numeric(9,6) not null check (lat between -90 and 90),
  lng numeric(9,6) not null check (lng between -180 and 180),
  -- Straight-line kilometers, NOT road kilometers. Apply road_coefficient once.
  km_to_city numeric(6,1) not null check (km_to_city between 0 and 2000)
);
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  phone text not null unique check (phone ~ '^\+7[0-9]{10}$'),
  role text not null check (role in ('passenger','driver','admin')),
  village_id uuid references public.villages(id),
  created_at timestamptz not null default now()
);
create table public.driver_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  zone_id uuid not null references public.zones(id),
  car_brand text not null check (length(btrim(car_brand)) between 1 and 80),
  plate text not null check (length(btrim(plate)) between 1 and 20),
  seats integer not null check (seats between 1 and 4),
  fuel_consumption numeric(4,1) not null check (fuel_consumption between 1 and 50),
  approval_status text not null default 'pending'
    check (approval_status in ('pending','active','rejected','blocked')),
  is_online boolean not null default false,
  online_since timestamptz,
  completed_trips integer not null default 0 check (completed_trips >= 0),
  check ((is_online and online_since is not null and approval_status = 'active')
    or (not is_online and online_since is null))
);
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.users(id),
  direction text not null check (direction in ('village_to_city','city_to_village')),
  village_id uuid not null references public.villages(id),
  pickup_spot text not null default '' check (length(pickup_spot) <= 120),
  "when" text not null check ("when" in ('asap','scheduled')),
  datetime timestamptz,
  seats integer not null check (seats between 1 and 4),
  price integer check (price between 1 and 1000000),
  negotiable boolean not null default true,
  comment text not null default '' check (length(comment) <= 500),
  status text not null default 'open' check (status in ('open','accepted','done','cancelled')),
  driver_id uuid references public.driver_profiles(user_id),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  done_at timestamptz,
  check (("when" = 'asap' and datetime is null) or ("when" = 'scheduled' and datetime is not null)),
  check ((negotiable and price is null) or (not negotiable and price is not null)),
  check ((status in ('open','cancelled') and driver_id is null and accepted_at is null and done_at is null)
    or (status = 'accepted' and driver_id is not null and accepted_at is not null and done_at is null)
    or (status = 'done' and driver_id is not null and accepted_at is not null and done_at is not null))
);
create table public.tariffs (
  village_id uuid primary key references public.villages(id),
  suggested_price integer not null check (suggested_price between 1 and 1000000)
);
create table public.settings (
  id text primary key default 'default' check (id = 'default'),
  fuel_price_tenge_per_liter numeric(6,2) not null default 235
    check (fuel_price_tenge_per_liter between 1 and 9999),
  road_coefficient numeric(4,2) not null default 1.3 check (road_coefficient between 1 and 3),
  default_fuel_consumption numeric(4,1) not null default 8
    check (default_fuel_consumption between 1 and 50)
);
insert into public.settings(id) values ('default');

create index on public.villages(zone_id);
create index on public.requests(status,village_id,created_at desc);
create index on public.requests(passenger_id,created_at desc);
create index on public.requests(driver_id,created_at desc);
create index on public.driver_profiles(zone_id,is_online);

-- Authorization uses the protected table, never user-editable Auth metadata.
create function jailau_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.users where id = auth.uid() and role = 'admin');
$$;
create function jailau_private.can_read_request(r public.requests) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    jailau_private.is_admin() or r.passenger_id = auth.uid() or exists (
      select 1 from public.driver_profiles d join public.villages v on v.id = r.village_id
      where d.user_id = auth.uid() and d.approval_status = 'active' and d.zone_id = v.zone_id
        and ((r.status = 'open' and d.is_online) or r.driver_id = auth.uid())
    )
  );
$$;

alter table public.zones enable row level security;
alter table public.villages enable row level security;
alter table public.users enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.requests enable row level security;
alter table public.tariffs enable row level security;
alter table public.settings enable row level security;

create policy zones_read on public.zones for select to anon,authenticated using (true);
create policy villages_read on public.villages for select to anon,authenticated using (true);
create policy tariffs_read on public.tariffs for select to anon,authenticated using (true);
create policy settings_read on public.settings for select to anon,authenticated using (true);
create policy zones_admin on public.zones for all to authenticated
  using (jailau_private.is_admin()) with check (jailau_private.is_admin());
create policy villages_admin on public.villages for all to authenticated
  using (jailau_private.is_admin()) with check (jailau_private.is_admin());
create policy tariffs_admin on public.tariffs for all to authenticated
  using (jailau_private.is_admin()) with check (jailau_private.is_admin());
create policy settings_admin on public.settings for update to authenticated
  using (jailau_private.is_admin()) with check (jailau_private.is_admin());
create policy users_read on public.users for select to authenticated
  using (id = auth.uid() or jailau_private.is_admin());
create policy users_edit_self on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy driver_read on public.driver_profiles for select to authenticated
  using (user_id = auth.uid() or jailau_private.is_admin());
create policy requests_read on public.requests for select to authenticated
  using (jailau_private.can_read_request(requests));

-- Clear Supabase's default grants for THESE tables only. No client can change
-- roles, phones, approval, counters, request ownership, or request status directly.
revoke all on public.zones,public.villages,public.users,public.driver_profiles,
  public.requests,public.tariffs,public.settings from public,anon,authenticated;
grant select on public.zones,public.villages,public.tariffs,public.settings to anon,authenticated;
grant select on public.users,public.driver_profiles,public.requests to authenticated;
grant update(name,village_id) on public.users to authenticated;
grant insert,update,delete on public.zones,public.villages,public.tariffs to authenticated;
grant update(fuel_price_tenge_per_liter,road_coefficient,default_fuel_consumption)
  on public.settings to authenticated;

-- Call after Supabase Auth signup/signin. Phone comes only from auth.users;
-- requesting the admin role or completing an existing profile is forbidden.
create function public.complete_profile(p_name text,p_role text,p_village_id uuid default null,
  p_driver jsonb default null) returns public.users
language plpgsql security definer set search_path = '' as $$
declare u public.users; phone_value text;
begin
  if auth.uid() is null or p_role is null or p_role not in ('passenger','driver') then
    raise exception 'error_generic' using errcode = '42501';
  end if;
  select '+' || ltrim(a.phone,'+') into phone_value from auth.users a where a.id = auth.uid();
  insert into public.users(id,name,phone,role,village_id)
    values(auth.uid(),p_name,phone_value,p_role,p_village_id) returning * into u;
  if p_role = 'driver' then
    insert into public.driver_profiles(user_id,zone_id,car_brand,plate,seats,fuel_consumption)
    values (u.id,(p_driver->>'zone_id')::uuid,p_driver->>'car_brand',p_driver->>'plate',
      (p_driver->>'seats')::integer,coalesce((p_driver->>'fuel_consumption')::numeric,
        (select default_fuel_consumption from public.settings where id = 'default')));
  end if;
  return u;
end;
$$;

create function public.create_request(p_direction text,p_village_id uuid,p_pickup_spot text,
  p_when text,p_datetime timestamptz,p_seats integer,p_price integer,p_negotiable boolean,
  p_comment text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare request_id uuid;
begin
  if not exists(select 1 from public.users where id = auth.uid() and role = 'passenger') then
    raise exception 'error_generic' using errcode = '42501';
  end if;
  if p_when = 'scheduled' and (p_datetime is null or p_datetime <= now()) then
    raise exception 'err_datetime_required';
  end if;
  insert into public.requests(passenger_id,direction,village_id,pickup_spot,"when",datetime,
    seats,price,negotiable,comment)
  values(auth.uid(),p_direction,p_village_id,coalesce(p_pickup_spot,''),p_when,
    case when p_when = 'asap' then null else p_datetime end,p_seats,
    case when p_negotiable then null else p_price end,p_negotiable,coalesce(p_comment,''))
    returning id into request_id;
  return request_id;
end;
$$;

create function public.accept_request(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare d public.driver_profiles; result_id uuid;
begin
  -- Serialize approval/block/online changes with acceptance.
  select * into d from public.driver_profiles where user_id = auth.uid() for update;
  if not found or d.approval_status <> 'active' or not d.is_online then
    raise exception 'df_need_approved' using errcode = '42501';
  end if;
  -- PostgreSQL locks the request row and rechecks status after a concurrent UPDATE.
  -- There is no separate read-then-write race window.
  update public.requests r set status = 'accepted',driver_id = d.user_id,accepted_at = now()
    where r.id = p_request_id and r.status = 'open' and r.seats <= d.seats
      and exists(select 1 from public.villages v where v.id = r.village_id and v.zone_id = d.zone_id)
    returning r.id into result_id;
  if result_id is null then raise exception 'df_already_taken'; end if;
  return result_id;
end;
$$;

create function public.cancel_request(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result_id uuid;
begin
  update public.requests set status = 'cancelled'
    where id = p_request_id and passenger_id = auth.uid() and status = 'open'
    returning id into result_id;
  if result_id is null then raise exception 'mr_cancel_not_possible'; end if;
  return result_id;
end;
$$;

create function public.release_request(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result_id uuid;
begin
  -- Blocked drivers may relinquish a request, but cannot read its phone or take more.
  perform 1 from public.driver_profiles where user_id = auth.uid() for update;
  update public.requests set status = 'open',driver_id = null,accepted_at = null
    where id = p_request_id and driver_id = auth.uid() and status = 'accepted'
    returning id into result_id;
  if result_id is null then raise exception 'error_generic'; end if;
  return result_id;
end;
$$;

create function public.confirm_trip_done(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare assigned_driver uuid; result_id uuid;
begin
  select driver_id into assigned_driver from public.requests
    where id = p_request_id and passenger_id = auth.uid() and status = 'accepted';
  if assigned_driver is null then raise exception 'error_generic'; end if;
  -- Use profile -> request lock order, as in accept/release.
  perform 1 from public.driver_profiles where user_id = assigned_driver for update;
  update public.requests set status = 'done',done_at = now()
    where id = p_request_id and passenger_id = auth.uid() and status = 'accepted'
      and driver_id = assigned_driver returning id into result_id;
  if result_id is null then raise exception 'error_generic'; end if;
  update public.driver_profiles set completed_trips = completed_trips + 1
    where user_id = assigned_driver;
  return result_id;
end;
$$;

create function public.set_driver_online(p_online boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d public.driver_profiles;
begin
  update public.driver_profiles set is_online = p_online,
    online_since = case when p_online then coalesce(online_since,now()) else null end
    where user_id = auth.uid() and approval_status = 'active' returning * into d;
  if not found then raise exception 'df_need_approved' using errcode = '42501'; end if;
  return jsonb_build_object('is_online',d.is_online,'online_since',d.online_since);
end;
$$;

create function public.admin_set_driver_status(p_user_id uuid,p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not jailau_private.is_admin() then raise exception 'error_generic' using errcode = '42501'; end if;
  if p_status is null or p_status not in ('active','rejected','blocked') then
    raise exception 'error_generic';
  end if;
  update public.driver_profiles set approval_status = p_status,
    is_online = case when p_status = 'active' then is_online else false end,
    online_since = case when p_status = 'active' then online_since else null end
    where user_id = p_user_id;
  if not found then raise exception 'error_generic'; end if;
end;
$$;

-- Only the formatter can join other users' phones. It checks the caller itself;
-- it is also private and has no client EXECUTE grant.
create function jailau_private.request_json(p_request_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(r) || jsonb_build_object(
    'village_name',v.name,'zone_id',v.zone_id,'zone_name',z.name,
    'km_to_city',v.km_to_city,'suggested_tariff',t.suggested_price,
    'passenger_name',p.name,
    'passenger_phone',case when r.status in ('accepted','done') and
      (r.driver_id = auth.uid() or jailau_private.is_admin()) then p.phone else null end,
    'driver_name',d.name,'driver_car_brand',dp.car_brand,'driver_plate',dp.plate,
    'driver_phone',case when r.status in ('accepted','done') and
      (r.passenger_id = auth.uid() or jailau_private.is_admin()) then d.phone else null end)
  from public.requests r join public.villages v on v.id = r.village_id
  join public.zones z on z.id = v.zone_id join public.users p on p.id = r.passenger_id
  left join public.users d on d.id = r.driver_id
  left join public.driver_profiles dp on dp.user_id = r.driver_id
  left join public.tariffs t on t.village_id = r.village_id
  where r.id = p_request_id and jailau_private.can_read_request(r);
$$;

create function public.list_requests(p_kind text,p_limit integer default 50,
  p_offset integer default 0) returns setof jsonb
language sql stable security definer set search_path = '' as $$
  select jailau_private.request_json(r.id) from public.requests r
  where jailau_private.can_read_request(r) and (
    (p_kind = 'mine' and r.passenger_id = auth.uid()) or
    (p_kind = 'driver' and r.driver_id = auth.uid() and r.status in ('accepted','done')) or
    (p_kind = 'feed' and r.status = 'open' and exists(
      select 1 from public.driver_profiles dp where dp.user_id = auth.uid()
        and dp.approval_status = 'active' and dp.is_online))
  ) order by r.created_at desc,r.id limit greatest(0,least(coalesce(p_limit,50),100))
    offset greatest(0,coalesce(p_offset,0));
$$;

create function public.list_online_drivers(p_village_id uuid) returns table(
  name text,car_brand text,seats integer,online_since timestamptz,completed_trips integer)
language sql stable security definer set search_path = '' as $$
  select u.name,d.car_brand,d.seats,d.online_since,d.completed_trips
  from public.driver_profiles d join public.users u on u.id = d.user_id
  join public.villages v on v.zone_id = d.zone_id
  where v.id = p_village_id and d.approval_status = 'active' and d.is_online
    and exists(select 1 from public.users viewer where viewer.id = auth.uid()
      and (viewer.role <> 'driver' or exists(select 1 from public.driver_profiles own
        where own.user_id = viewer.id and own.approval_status = 'active')))
  order by d.online_since,d.user_id limit 100;
$$;

-- Scope revocations to this migration's functions, preserving other project code.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as signature from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'jailau_private' or (n.nspname = 'public' and p.proname = any(array[
      'complete_profile','create_request','accept_request','cancel_request','release_request',
      'confirm_trip_done','set_driver_online','admin_set_driver_status','list_requests','list_online_drivers']))
  loop
    execute format('revoke all on function %s from public, anon, authenticated',f.signature);
    if f.signature::text not like '%request_json%' then
      execute format('grant execute on function %s to authenticated',f.signature);
    end if;
  end loop;
end;
$$;
commit;
