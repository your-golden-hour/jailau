begin;
set local statement_timeout='15s';
select set_config('jailau.test_passenger',gen_random_uuid()::text,true),
set_config('jailau.test_driver',gen_random_uuid()::text,true),
set_config('jailau.test_other_driver',gen_random_uuid()::text,true),
set_config('jailau.test_pending',gen_random_uuid()::text,true),
set_config('jailau.test_zone',gen_random_uuid()::text,true),
set_config('jailau.test_other_zone',gen_random_uuid()::text,true),
set_config('jailau.test_village',gen_random_uuid()::text,true);
insert into public.zones(id,name) values
(current_setting('jailau.test_zone')::uuid,'{"ru":"Rollback test zone","kz":"Rollback test zone"}'),
(current_setting('jailau.test_other_zone')::uuid,'{"ru":"Rollback other zone","kz":"Rollback other zone"}');
insert into public.villages(id,zone_id,name,lat,lng,km_to_city) values
(current_setting('jailau.test_village')::uuid,current_setting('jailau.test_zone')::uuid,'{"ru":"Rollback village","kz":"Rollback village"}',0,0,22);
insert into auth.users(id,phone) values
(current_setting('jailau.test_passenger')::uuid,'70000000081'),
(current_setting('jailau.test_driver')::uuid,'70000000082'),
(current_setting('jailau.test_other_driver')::uuid,'70000000083'),
(current_setting('jailau.test_pending')::uuid,'70000000084');
set local role authenticated;
do $test$
declare n integer; r uuid; card jsonb;
begin
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_passenger'),true);
 perform public.complete_profile('Rollback passenger','passenger');
 begin
   update public.users set role='admin';
   raise exception 'ASSERT: role escalation allowed';
 exception when insufficient_privilege then null; end;
 perform set_config('jailau.test_request',public.create_request('village_to_city',
 current_setting('jailau.test_village')::uuid,'Rollback landmark','asap',null,2,null,true,'')::text,true);
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_driver'),true);
 perform public.complete_profile('Rollback driver','driver',null,
 jsonb_build_object('zone_id',current_setting('jailau.test_zone'),'car_brand','Test','plate','TEST','seats',4));
 begin
   perform public.accept_request(current_setting('jailau.test_request')::uuid);
   raise exception 'ASSERT: pending driver accepted';
 exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_other_driver'),true);
 perform public.complete_profile('Rollback other driver','driver',null,
 jsonb_build_object('zone_id',current_setting('jailau.test_other_zone'),'car_brand','Test','plate','TEST','seats',4));
 select count(*) into n from public.users;
 if n<>1 then raise exception 'ASSERT: other user visible'; end if;
end;
$test$;
reset role;
update public.driver_profiles set approval_status='active'
where user_id in(current_setting('jailau.test_driver')::uuid,current_setting('jailau.test_other_driver')::uuid);
set local role authenticated;
do $test$
declare card jsonb; n integer;
begin
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_other_driver'),true);
 perform public.set_driver_online(true);
 select count(*) into n from public.list_requests('feed');
 if n<>0 then raise exception 'ASSERT: cross-zone feed'; end if;
 begin
   perform public.accept_request(current_setting('jailau.test_request')::uuid);
   raise exception 'ASSERT: wrong zone accepted';
 exception when raise_exception then if sqlerrm<>'df_already_taken' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_driver'),true);
 perform public.set_driver_online(true);
 select x into card from public.list_requests('feed') x;
 if card is null or card->>'passenger_phone' is not null then raise exception 'ASSERT: phone before accept'; end if;
 perform public.accept_request(current_setting('jailau.test_request')::uuid);
 select x into card from public.list_requests('driver') x;
 if card->>'passenger_phone' is distinct from '+70000000081' then raise exception 'ASSERT: accepted contact missing'; end if;
 begin
   perform public.confirm_trip_done(current_setting('jailau.test_request')::uuid);
   raise exception 'ASSERT: driver confirmed trip';
 exception when raise_exception then if sqlerrm<>'error_generic' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_passenger'),true);
 select x into card from public.list_requests('mine') x;
 if card->>'driver_phone' is distinct from '+70000000082' then raise exception 'ASSERT: passenger contact missing'; end if;
 perform public.confirm_trip_done(current_setting('jailau.test_request')::uuid);
 begin
   perform public.confirm_trip_done(current_setting('jailau.test_request')::uuid);
   raise exception 'ASSERT: duplicate confirmation allowed';
 exception when raise_exception then if sqlerrm<>'error_generic' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',current_setting('jailau.test_driver'),true);
 select completed_trips into n from public.driver_profiles where user_id=auth.uid();
 if n<>1 then raise exception 'ASSERT: counter not exactly one'; end if;
 begin
   perform jailau_private.request_json(current_setting('jailau.test_request')::uuid);
   raise exception 'ASSERT: private formatter callable';
 exception when insufficient_privilege then null; end;
end;
$test$;
reset role;
set local role anon;
do $test$
begin
 perform count(*) from public.zones;
 begin
   perform count(*) from public.users;
   raise exception 'ASSERT: anonymous users access';
 exception when insufficient_privilege then null; end;
 begin
   perform public.accept_request(current_setting('jailau.test_request')::uuid);
   raise exception 'ASSERT: anonymous RPC allowed';
 exception when insufficient_privilege then null; end;
end;
$test$;
reset role;
rollback;
select 'PASS: rollback SQL access, contact, approval, zone, completion checks' as result,
(select count(*) from auth.users) as remaining_auth_accounts,
(select count(*) from public.users) as remaining_app_users,
(select count(*) from public.requests) as remaining_requests;
