const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

test('PostgreSQL schema: roles, RLS, contacts, lifecycle and exactly-once counter', async () => {
  const db = new PGlite();
  const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  const as = async (user, sql, params = [], role = 'authenticated') => {
    await db.exec(`begin; set local role ${role};`);
    try {
      await db.query("select set_config('request.jwt.claim.sub', $1, true)", [user || '']);
      const result = await db.query(sql, params);
      await db.exec('commit');
      return result.rows;
    } catch (e) { await db.exec('rollback'); throw e; }
  };
  const denied = (user, sql, params) => assert.rejects(as(user, sql, params));
  try {
    // Minimal Supabase identity boundary; no imitation of Auth HTTP or JWT signing.
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key, phone text);
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth,public to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
      alter default privileges in schema public grant all on tables to anon,authenticated;
      alter default privileges in schema public grant execute on functions to anon,authenticated;`);
    await db.exec(fs.readFileSync('supabase/schema.sql', 'utf8'));
    await db.exec(fs.readFileSync('supabase/migrations/202610260002_driver_lines_and_offers.sql', 'utf8'));
    await db.exec(fs.readFileSync('supabase/migrations/202610260003_ten_minute_driver_line.sql', 'utf8'));
    await db.query('insert into public.zones(id,name) values ($1,$3),($2,$3)', [id(1),id(2),{ru:'Test zone',kz:'Test zone'}]);
    await db.query(`insert into public.villages(id,zone_id,name,lat,lng,km_to_city)
      values($1,$2,$3,0,0,22),($4,$5,$3,0,0,30)`,[id(11),id(1),{ru:'Test village',kz:'Test village'},id(12),id(2)]);
    for (let n = 21; n <= 29; n++) {
      await db.query('insert into auth.users values ($1,$2)',[id(n),`700000000${n}`]);
    }
    for (const n of [21,22,29]) await as(id(n),'select public.complete_profile($1,$2,$3)',[`+700000000${n}`,`Passenger ${n}`,'passenger']);
    for (const [n,zone,seats] of [[23,1,4],[24,1,4],[25,2,4],[26,1,4],[27,1,1]]) {
      await as(id(n),'select public.complete_profile($1,$2,$3,null,$4)',[`+700000000${n}`,`Driver ${n}`,'driver',
        {zone_id:id(zone),car_brand:'Test car',plate:'DEMO',seats,fuel_consumption:7.5}]);
    }
    await as(id(28),'select public.complete_profile($1,$2,$3)',['+70000000028','Owner','passenger']);
    await db.query("update public.users set role='admin' where id=$1",[id(28)]);
    for (const n of [23,24,25,27]) {
      await as(id(28),"select public.admin_set_driver_status($1,'active')",[id(n)]);
      await as(id(n),"select public.set_driver_online(true,'village')");
    }
    await assert.rejects(as(id(21),'select public.complete_profile($1,$2,$3)',['+70000000021','Attack','admin']));
    await denied(id(29),'select public.complete_profile($1,$2,$3)',['+70000000029','Overwrite','driver']);
    assert.equal((await as(id(21),'select * from public.users')).length,1);
    await denied(id(21),"update public.users set role='admin' where id=$1",[id(21)]);
    await denied(id(23),"update public.driver_profiles set approval_status='active',completed_trips=99");
    assert.equal((await as(id(21),"update public.users set phone='+70000000999' where id=$1 returning id",[id(22)])).length,0);
    await denied(id(21),"update public.users set phone='+70000000022' where id=$1",[id(21)]);
    await as(id(21),"update public.users set phone='+70000000999' where id=$1",[id(21)]);
    await as(id(21),"update public.users set phone='+70000000021' where id=$1",[id(21)]);
    assert.equal((await as(id(21),'update public.users set name=$1 where id=$2 returning id',['Other',id(22)])).length,0);
    assert.equal((await as(null,'select * from public.zones',[],'anon')).length,2);
    await assert.rejects(as(null,'select * from public.users',[],'anon'));
    await assert.rejects(as(null,"select public.list_requests('feed')",[],'anon'));
    await denied(id(21),'select jailau_private.request_json($1)',[id(99)]);
    await denied(id(21),'select public.admin_set_driver_status($1,$2)',[id(26),'active']);
    const create = async (village, seats = 2) => (await as(id(21),`select public.create_request(
      'village_to_city',$1,'Test landmark','asap',null,$2,null,true,'') as id`,[id(village),seats]))[0].id;
    const r = await create(11);
    const hidden = (await as(id(23),"select public.list_requests('feed') as r"))[0].r;
    assert.equal(hidden.passenger_phone,null);
    assert.equal(hidden.driver_phone,null);
    assert.equal((await as(id(25),"select public.list_requests('feed')")).length,0);
    assert.equal((await as(id(22),'select * from public.requests')).length,0);
    await denied(id(26),'select public.accept_request($1)',[r]); // pending
    await denied(id(25),'select public.accept_request($1)',[r]); // wrong zone
    await denied(id(27),'select public.accept_request($1)',[r]); // insufficient seats
    await as(id(23),'select public.set_driver_online(false)');
    await denied(id(23),'select public.accept_request($1)',[r]);
    await as(id(23),"select public.set_driver_online(true,'village')");
    await denied(id(23),"update public.requests set status='accepted',driver_id=$1 where id=$2",[id(23),r]);
    await as(id(23),'select public.accept_request($1)',[r]);
    await denied(id(24),'select public.accept_request($1)',[r]); // first driver wins
    assert.equal((await as(id(23),"select public.list_requests('driver') as r"))[0].r.passenger_phone,null);
    assert.equal((await as(id(21),"select public.list_requests('mine') as r"))[0].r.driver_phone,null);
    await denied(id(22),'select public.respond_to_offer($1,true)',[r]);
    await as(id(21),'select public.respond_to_offer($1,true)',[r]);
    assert.equal((await as(id(23),"select public.list_requests('driver') as r"))[0].r.passenger_phone,'+70000000021');
    assert.equal((await as(id(21),"select public.list_requests('mine') as r"))[0].r.driver_phone,'+70000000023');
    assert.equal((await as(id(24),'select * from public.users where id=$1',[id(21)])).length,0);
    await denied(id(24),'select public.release_request($1)',[r]);
    await denied(id(23),'select public.confirm_trip_done($1)',[r]);
    await denied(id(22),'select public.confirm_trip_done($1)',[r]);
    await denied(id(21),'select public.cancel_request($1)',[r]);
    await as(id(23),'select public.release_request($1)',[r]);
    assert.equal((await as(id(21),"select public.list_requests('mine') as r"))[0].r.driver_phone,null);
    assert.equal((await as(id(23),"select public.list_requests('feed') as r"))[0].r.passenger_phone,null);
    await as(id(24),'select public.accept_request($1)',[r]);
    await as(id(21),'select public.respond_to_offer($1,true)',[r]);
    await denied(id(21),'select public.confirm_trip_done($1)',[r]);
    await db.query("update public.requests set accepted_at=now()-interval '2 hours' where id=$1",[r]);
    await as(id(21),'select public.confirm_trip_done($1)',[r]);
    await denied(id(21),'select public.confirm_trip_done($1)',[r]);
    const count = await db.query('select completed_trips from public.driver_profiles where user_id=$1',[id(24)]);
    assert.equal(count.rows[0].completed_trips,1);
    const r2 = await create(11);
    await as(id(23),'select public.accept_request($1)',[r2]);
    const r3 = await create(11,3);
    await assert.rejects(as(id(23),'select public.accept_request($1)',[r3]), {message:'df_no_seats'});
    await as(id(23),'select public.release_request($1)',[r2]);
    await as(id(23),'select public.accept_request($1)',[r3]);
    await as(id(23),'select public.release_request($1)',[r3]);
    await as(id(21),'select public.cancel_request($1)',[r3]);
    await as(id(23),'select public.accept_request($1)',[r2]);
    await as(id(21),'select public.respond_to_offer($1,true)',[r2]);
    const future = (await as(id(21),`select public.create_request(
      'city_to_village',$1,'Test landmark','scheduled',now()+interval '3 hours',4,null,true,'') as id`,[id(11)]))[0].id;
    await as(id(23),"select public.set_driver_online(true,'city')");
    await as(id(23),'select public.accept_request($1)',[future]); // later full car fits
    await as(id(23),'select public.release_request($1)',[future]);
    await as(id(21),'select public.cancel_request($1)',[future]);
    await as(id(28),"select public.admin_set_driver_status($1,'blocked')",[id(23)]);
    assert.equal((await as(id(23),"select public.list_requests('driver')")).length,0);
    assert.equal((await as(id(23),'select * from public.requests')).length,0);
    await denied(id(23),'select public.accept_request($1)',[await create(11)]);
    await as(id(23),'select public.release_request($1)',[r2]);
    await as(id(21),'select public.cancel_request($1)',[r2]);
    await denied(id(21),'select public.cancel_request($1)',[r2]);
    const listing = await as(id(22),'select * from public.list_online_drivers($1)',[id(11)]);
    assert.ok(listing.length > 0);
    assert.ok(listing.every(x => !('phone' in x) && !('plate' in x)));
    assert.equal((await as(id(21),'select * from public.driver_profiles')).length,0);
    assert.equal((await as(id(28),'select * from public.driver_profiles')).length,5);
    await denied(id(21),'insert into public.zones(name) values ($1)',[{ru:'Attack',kz:'Attack'}]);
    await denied(id(21),`select public.create_request('village_to_city',$1,'','scheduled',now()-interval '1 hour',2,null,true,'')`,[id(11)]);
    await denied(id(24),'update public.driver_profiles set zone_id=$1 where user_id=$2',[id(2),id(24)]);
    const testVillage = await create(11);
    await db.query("update public.driver_profiles set online_since=now()-interval '9 minutes' where user_id=$1",[id(24)]);
    assert.equal((await as(id(24),"select public.list_requests('feed')")).length > 0,true);
    await db.query("update public.driver_profiles set online_since=now()-interval '11 minutes' where user_id=$1",[id(24)]);
    assert.equal((await as(id(24),"select public.list_requests('feed')")).length,0);
    await denied(id(24),'select public.accept_request($1)',[testVillage]);
    assert.ok(!(await as(id(22),'select * from public.list_online_drivers($1)',[id(11)])).some(x => x.name === 'Driver 24'));
    await as(id(24),"select public.set_driver_online(true,'village')");
    assert.equal((await as(id(24),"select public.list_requests('feed')")).length > 0,true);
    await as(id(24),"select public.set_driver_online(true,'city')");
    assert.equal((await as(id(24),"select public.list_requests('feed')")).length,0);
    await denied(id(24),'select public.accept_request($1)',[testVillage]);
    const cityRequest = (await as(id(21),`select public.create_request(
      'city_to_village',$1,'Test landmark','asap',null,1,null,true,'') as id`,[id(11)]))[0].id;
    await as(id(24),'select public.accept_request($1)',[cityRequest]);
    assert.equal((await as(id(24),"select public.list_requests('driver') as r")).find(x => x.r.id === cityRequest).r.passenger_phone,null);
    assert.equal((await as(id(21),"select public.list_requests('mine') as r")).find(x => x.r.id === cityRequest).r.driver_phone,null);
    await as(id(21),'select public.respond_to_offer($1,false)',[cityRequest]);
    assert.equal((await as(id(21),"select public.list_requests('mine') as r")).find(x => x.r.id === cityRequest).r.status,'open');
    const counts = (await as(id(24),'select public.online_driver_counts($1) as value',[id(1)]))[0].value;
    assert.ok(counts.city >= 1 && counts.village >= 1);
    await as(id(24),'select public.request_driver_zone($1)',[id(2)]);
    assert.equal((await as(id(24),'select approval_status from public.driver_profiles'))[0].approval_status,'pending');
    await denied(id(24),"select public.set_driver_online(true,'city')");
    await denied(id(24),'select public.accept_request($1)',[cityRequest]);
    assert.equal((await as(id(24),'select * from public.list_online_drivers($1)',[id(11)])).length,0);
    await as(id(28),"select public.admin_set_driver_status($1,'active')",[id(24)]);
    await as(id(24),"select public.set_driver_online(true,'city')");
    assert.equal((await as(id(24),"select public.list_requests('feed')")).length,0);
    console.log('SQL assertions passed: access, role escalation, zone, seats, approval, phones, release, cancel, counter.');
  } finally { await db.close(); }
});
