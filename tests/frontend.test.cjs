const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');

function load() {
  const dom = new JSDOM('<html><body><div id="screen"></div><button id="lang-toggle"></button></body></html>',
    {runScripts:'outside-only',url:'http://localhost/'});
  const w = dom.window;
  w.setTimeout = cb => { queueMicrotask(cb); return 1; };
  w.JAILAU_APP = {toast(){}};
  for (const file of ['config','i18n','api','screens/driver','screens/passenger']) w.eval(fs.readFileSync(`js/${file}.js`,'utf8'));
  return dom;
}
test('mock privacy, authorization, passenger completion and fuel calculation',async()=>{
  const dom=load(), w=dom.window, api=w.JAILAU_API;
  try {
    assert.equal(w.JAILAU_CONFIG.DEMO_MODE,true);
    w.JAILAU_CONFIG.SUPABASE_URL='https://example.invalid';
    assert.equal(w.JAILAU_CONFIG.DEMO_MODE,true);
    const a=w.JAILAU_CONFIG.DEMO_ACCOUNTS;
    await assert.rejects(api.signUp({name:'Attack',phone:'+70000000999',password:'test-only',role:'admin'}));
    await api.signIn(a.driver.phone,a.driver.password);
    let feed=await api.listOpenRequestsForDriver();
    assert.ok(feed.length>0);
    assert.ok(feed.every(r=>r.passenger_phone===null));
    const r=feed[0];
    await assert.rejects(api.acceptRequest('r-2')); // foreign zone
    await api.setDriverOnline(false);
    await assert.rejects(api.acceptRequest(r.id));
    await api.setDriverOnline(true);
    const accepted=await api.acceptRequest(r.id);
    assert.equal(accepted.passenger_phone,a.passenger.phone);
    await assert.rejects(api.acceptRequest(r.id));
    await assert.rejects(api.confirmTripDone(r.id));
    const driverContainer=w.document.getElementById('screen');
    w.JAILAU_SCREENS.driver.renderMyRequests(driverContainer);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(driverContainer.querySelector('[data-done]'),null);
    await api.signIn(a.passenger.phone,a.passenger.password);
    assert.ok((await api.listMyRequests()).find(x=>x.id===r.id).driver_phone);
    w.JAILAU_SCREENS.passenger.renderMyRequests(driverContainer);
    await new Promise(resolve=>setImmediate(resolve));
    assert.ok(driverContainer.querySelector('[data-confirm-done]'));
    await api.confirmTripDone(r.id);
    await assert.rejects(api.confirmTripDone(r.id));
    await api.signIn(a.driver.phone,a.driver.password);
    assert.equal((await api.getDriverStatus()).completed_trips,1);
    assert.equal((await api.getDriverStatus()).fuel_consumption,7.5);
    assert.equal(api.estimateFuelCost(22,7.5).cost_tenge,504);
    assert.throws(()=>api.estimateFuelCost(-1,8));
    w.I18N.setLang('kz');
    assert.equal(w.document.documentElement.lang,'kk');
    assert.notEqual(w.I18N.t('trip_waiting_passenger'),'trip_waiting_passenger');
    await api.signOut();
    await assert.rejects(api.listOpenRequestsForDriver('u-d1'));
  } finally {dom.window.close();}
});

test('rendered passenger-controlled text cannot become executable markup',async()=>{
  const dom=load(),w=dom.window,api=w.JAILAU_API;
  try {
    const a=w.JAILAU_CONFIG.DEMO_ACCOUNTS;
    await api.signIn(a.passenger.phone,a.passenger.password);
    await api.createRequest({direction:'village_to_city',village_id:'v-orkhovo',when:'asap',seats:1,
      negotiable:true,pickup_spot:'<img src=x onerror="window.pwned=1">',comment:'<script>window.pwned=1</script>'});
    const c=w.document.getElementById('screen');
    w.JAILAU_SCREENS.passenger.renderMyRequests(c);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(c.querySelector('img,script'),null);
    assert.ok(c.textContent.includes('<img'));
    assert.equal(w.pwned,undefined);
  } finally {dom.window.close();}
});

test('both dictionaries contain all literal UI and error keys',()=>{
  const dom=load(),w=dom.window;
  try {
    const files=['api','app','screens/auth','screens/passenger','screens/driver','screens/admin'];
    const keys=new Set();
    for(const file of files) {
      const src=fs.readFileSync(`js/${file}.js`,'utf8');
      for(const m of src.matchAll(/(?:\bt|\bfail)\("([a-z][a-z0-9_]+)"/g))keys.add(m[1]);
    }
    for(const lang of ['ru','kz']) {
      w.I18N.setLang(lang);
      for(const key of keys)assert.notEqual(w.I18N.t(key),key,`${lang}: missing ${key}`);
    }
  } finally {dom.window.close();}
});
