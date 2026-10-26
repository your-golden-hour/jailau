const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');

function load() {
  const dom = new JSDOM('<html><body><div id="screen"></div><button id="lang-toggle"></button></body></html>',
    {runScripts:'outside-only',url:'http://localhost/'});
  const w = dom.window;
  w.JAILAU_API = {
    getCurrentUser: async () => ({name:'Test',phone:'+70000000001',village_id:'v1'}),
    listZonesAndVillages: async () => [{id:'z1',name:{ru:'Зона',kz:'Аймақ'},villages:[{id:'v1',name:{ru:'Село',kz:'Ауыл'},km_to_city:22}]}],
    listOnlineDriversByVillage: async () => [], setUserVillage: async () => ({}),
    listMyRequests: async () => [], createRequest: async () => ({})
  };
  w.JAILAU_APP = {toast(){},onLogin(){},getCurrentUser:() => ({name:'Test',phone:'+70000000001',email:'test@example.com',role:'passenger'})};
  for (const file of ['config','i18n','screens/auth','screens/passenger','screens/profile','screens/driver']) w.eval(fs.readFileSync(`js/${file}.js`,'utf8'));
  return dom;
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('home shows contact phone and both route directions', async () => {
  const dom=load(),w=dom.window;
  try {
    w.JAILAU_SCREENS.passenger.renderHome(w.document.getElementById('screen'));
    await flush();
    assert.match(w.document.body.textContent,/\+70000000001/);
    assert.ok(w.document.querySelector('a[href="#/passenger/new-request?direction=village_to_city"]'));
    assert.ok(w.document.querySelector('a[href="#/passenger/new-request?direction=city_to_village"]'));
    assert.equal(w.document.querySelector('.quick-header .eyebrow'),null);
    assert.equal(w.document.querySelector('a[href="#/passenger/new-request?direction=village_to_city"] img').getAttribute('src'),'icons/city.svg');
    assert.equal(w.document.querySelector('a[href="#/passenger/new-request?direction=city_to_village"] img').getAttribute('src'),'icons/yurt.svg');
  } finally { dom.window.close(); }
});

test('driver trip count appears beside seats only when positive', async () => {
  const dom=load(),w=dom.window;
  try {
    let count=0;
    w.JAILAU_API.listOnlineDriversByVillage=async (_,mode) => mode==='village'
      ? [{name:'Driver',car_brand:'Car',seats:4,completed_trips:count,online_since:new Date().toISOString()}] : [];
    w.JAILAU_SCREENS.passenger.renderHome(w.document.getElementById('screen'));
    await flush(); await flush();
    assert.match(w.document.querySelector('.driver-card').textContent,/4 мест/);
    assert.doesNotMatch(w.document.querySelector('.driver-card').textContent,/Поездок:/);
    count=3;
    w.document.querySelector('#home-village').dispatchEvent(new w.Event('change'));
    await flush(); await flush();
    assert.match(w.document.querySelector('.driver-card').textContent,/4 мест · Поездок: 3/);
  } finally {dom.window.close();}
});

test('registration asks only for email and sends a confirmation link', async () => {
  const dom=load(),w=dom.window;
  try {
    let sent;
    w.JAILAU_API.signUp=async email => { sent=email; return {needsConfirmation:true}; };
    w.JAILAU_SCREENS.auth.render(w.document.getElementById('screen'),{mode:'register'});
    assert.match(w.document.querySelector('.auth-version').textContent,/v0\.0\.1/);
    const form=w.document.querySelector('#auth-form');
    assert.equal(form.querySelector('#auth-password'),null);
    form.querySelector('#auth-email').value='new@example.com';
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    await flush();
    assert.equal(sent,'new@example.com');
    assert.match(w.document.querySelector('#auth-message').textContent,/Проверьте почту/);
  } finally {dom.window.close();}
});

test('request form refuses phone numbers in public comments', async () => {
  const dom=load(),w=dom.window;
  try {
    w.JAILAU_SCREENS.passenger.renderNewRequest(w.document.getElementById('screen'));
    await flush();
    const form=w.document.querySelector('#nr-form');
    form.querySelector('#nr-comment').value='Позвоните +7 701 123 45 67';
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    assert.ok(form.querySelector('[data-field="comment"].invalid'));
  } finally {dom.window.close();}
});

test('passenger cannot see completion button before one hour', async () => {
  const dom=load(),w=dom.window;
  try {
    w.JAILAU_API.listMyRequests=async () => [{id:'r1',status:'accepted',direction:'city_to_village',
      village_name:{ru:'Село',kz:'Ауыл'},negotiable:true,when:'asap',seats:1,
      accepted_at:new Date().toISOString(),driver_name:'Driver'}];
    w.JAILAU_SCREENS.passenger.renderMyRequests(w.document.getElementById('screen'));
    await flush();
    assert.equal(w.document.querySelector('[data-confirm-done]'),null);
    assert.match(w.document.body.textContent,/Подтверждение доступно после/);
  } finally {dom.window.close();}
});

test('after one hour passenger can keep an unfinished ride active', async () => {
  const dom=load(),w=dom.window;
  try {
    let status='accepted',doneCalls=0;
    w.JAILAU_API.listMyRequests=async () => [{id:'ride-check',status,direction:'village_to_city',
      village_name:{ru:'Село',kz:'Ауыл'},negotiable:true,when:'asap',seats:1,
      accepted_at:new Date(Date.now()-70*60000).toISOString(),driver_name:'Driver'}];
    w.JAILAU_API.confirmTripDone=async () => {doneCalls++;status='done';};
    const screen=w.document.getElementById('screen');
    w.JAILAU_SCREENS.passenger.renderMyRequests(screen);
    await flush();
    assert.match(screen.querySelector('.trip-check-dialog').textContent,/Поездка состоялась\?/);
    screen.querySelector('[data-trip-no]').click();
    assert.match(screen.querySelector('.trip-check-dialog').textContent,/Оставить заявку активной\?/);
    screen.querySelector('[data-trip-keep]').click();
    assert.equal(doneCalls,0);
    assert.ok(screen.querySelector('[data-confirm-done]'));
    screen.querySelector('[data-confirm-done]').click();
    screen.querySelector('[data-trip-yes]').click();
    await flush(); await flush();
    assert.equal(doneCalls,1);
    assert.match(screen.textContent,/Выполнена/);
  } finally {w.JAILAU_SCREENS.passenger.clearTimers();dom.window.close();}
});

test('after an unfinished ride passenger can cancel instead of keeping it', async () => {
  const dom=load(),w=dom.window;
  try {
    let status='accepted',cancelCalls=0,doneCalls=0;
    w.JAILAU_API.listMyRequests=async () => [{id:'ride-cancel',status,direction:'village_to_city',
      village_name:{ru:'Село',kz:'Ауыл'},negotiable:true,when:'asap',seats:1,
      accepted_at:new Date(Date.now()-70*60000).toISOString(),driver_name:'Driver'}];
    w.JAILAU_API.cancelRequest=async () => {cancelCalls++;status='cancelled';};
    w.JAILAU_API.confirmTripDone=async () => {doneCalls++;};
    const screen=w.document.getElementById('screen');
    w.JAILAU_SCREENS.passenger.renderMyRequests(screen);
    await flush();
    screen.querySelector('[data-trip-no]').click();
    screen.querySelector('[data-trip-cancel]').click();
    await flush(); await flush();
    assert.equal(cancelCalls,1);
    assert.equal(doneCalls,0);
    assert.match(screen.textContent,/Отменена/);
    assert.equal(screen.querySelector('[data-confirm-done]'),null);
  } finally {w.JAILAU_SCREENS.passenger.clearTimers();dom.window.close();}
});

test('driver history labels completed rides clearly', async () => {
  const dom=load(),w=dom.window;
  try {
    w.JAILAU_API.listDriverAcceptedRequests=async () => [{id:'done-ride',status:'done',direction:'village_to_city',
      village_name:{ru:'Село',kz:'Ауыл'},negotiable:true,when:'asap',seats:1,
      done_at:new Date().toISOString(),passenger_name:'Passenger'}];
    w.JAILAU_SCREENS.driver.renderMyRequests(w.document.getElementById('screen'));
    await flush();
    assert.match(w.document.querySelector('.badge-done').textContent,/Выполнена/);
    assert.match(w.document.body.textContent,/Выполнена \d\d\.\d\d\./);
  } finally {dom.window.close();}
});

test('passenger must accept or decline a driver offer before contacts appear', async () => {
  const dom=load(),w=dom.window;
  try {
    let response;
    w.JAILAU_API.listMyRequests=async () => [{id:'r2',status:'offered',direction:'village_to_city',
      village_name:{ru:'Село',kz:'Ауыл'},negotiable:true,when:'asap',seats:2,
      driver_name:'Test driver',driver_phone:null,driver_car_brand:'Test car'}];
    w.JAILAU_API.respondToOffer=async (id,accept) => {response={id,accept};return {};};
    w.JAILAU_SCREENS.passenger.renderMyRequests(w.document.getElementById('screen'));
    await flush();
    assert.equal(w.document.querySelector('[data-confirm-done]'),null);
    assert.ok(w.document.querySelector('[data-offer-response][data-accept="true"]'));
    assert.ok(w.document.querySelector('[data-offer-response][data-accept="false"]'));
    assert.doesNotMatch(w.document.body.textContent,/\+70000000001/);
    w.document.querySelector('[data-offer-response][data-accept="false"]').click();
    await flush();
    assert.deepEqual(response,{id:'r2',accept:false});
  } finally {dom.window.close();}
});

test('driver switches village and city line without extending the same lease', async () => {
  const dom=load(),w=dom.window;
  try {
    const calls=[];
    w.JAILAU_API.getDriverStatus=async () => ({approval_status:'active',is_online:false,
      online_since:null,online_location:null,zone_id:'z1',zone_name:{ru:'Зона',kz:'Аймақ'},fuel_consumption:8});
    w.JAILAU_API.listOpenRequestsForDriver=async () => [];
    w.JAILAU_API.onlineDriverCounts=async () => ({village:1,city:2});
    w.JAILAU_API.setDriverOnline=async (online,mode) => {
      calls.push({online,mode});
      return {is_online:online,online_location:online?mode:null,online_since:online?new Date().toISOString():null};
    };
    w.JAILAU_SCREENS.driver.renderFeed(w.document.getElementById('screen'));
    await flush(); await flush();
    assert.match(w.document.querySelector('#online-counts').textContent,/село 1.*город 2/);
    w.document.querySelector('[data-line-mode="village"]').click();
    await flush();
    assert.deepEqual(calls[0],{online:true,mode:'village'});
    assert.ok(w.document.querySelector('[data-line-mode="village"].active'));
    w.document.querySelector('[data-line-mode="city"]').click();
    await flush();
    assert.deepEqual(calls[1],{online:true,mode:'city'});
    w.document.querySelector('[data-line-mode="city"]').click();
    await flush();
    assert.deepEqual(calls[2],{online:false,mode:'city'});
  } finally {w.JAILAU_SCREENS.driver.clearTimers();dom.window.close();}
});

test('driver zone change asks for confirmation and awaits admin approval', async () => {
  const dom=load(),w=dom.window;
  try {
    w.JAILAU_APP.getCurrentUser=() => ({name:'Driver',phone:'+70000000001',email:'driver@example.com',role:'driver'});
    w.JAILAU_API.getDriverStatus=async () => ({zone_id:'z1',approval_status:'active'});
    w.JAILAU_API.listZonesAndVillages=async () => [
      {id:'z1',name:{ru:'Первый',kz:'Бірінші'}},{id:'z2',name:{ru:'Второй',kz:'Екінші'}}];
    let changed;
    w.JAILAU_API.requestDriverZone=async id => {changed=id;return {zone_id:id,approval_status:'pending'};};
    w.confirm=() => true;
    w.JAILAU_SCREENS.profile.render(w.document.getElementById('screen'),false);
    await flush();
    w.document.querySelector('#profile-zone').value='z2';
    w.document.querySelector('#driver-zone-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    await flush();
    assert.equal(changed,'z2');
    assert.match(w.document.querySelector('#zone-message').textContent,/ожидает одобрения/);
  } finally {dom.window.close();}
});

test('request text is escaped and cannot inject markup', async () => {
  const dom=load(),w=dom.window;
  try {
    w.JAILAU_API.listMyRequests=async () => [{id:'r1',status:'open',direction:'village_to_city',
      village_name:{ru:'Село',kz:'Ауыл'},negotiable:true,when:'asap',seats:1,
      pickup_spot:'<img src=x onerror=alert(1)>',comment:'<script>alert(1)</script>'}];
    w.JAILAU_SCREENS.passenger.renderMyRequests(w.document.getElementById('screen'));
    await flush();
    assert.equal(w.document.querySelector('img,script'),null);
    assert.match(w.document.body.textContent,/<script>/);
  } finally {dom.window.close();}
});

test('profile asks for phone confirmation before writing', async () => {
  const dom=load(),w=dom.window;
  try {
    let writes=0;
    w.confirm=() => false;
    w.JAILAU_API.updateProfile=async () => { writes++; return {}; };
    w.JAILAU_SCREENS.profile.render(w.document.getElementById('screen'),false);
    const form=w.document.querySelector('#profile-form');
    form.querySelector('#profile-phone').value='+77011234567';
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    await flush();
    assert.equal(writes,0);
  } finally {dom.window.close();}
});

test('name and password changes require separate confirmation', async () => {
  const dom=load(),w=dom.window;
  try {
    const prompts=[];
    let nameWrites=0,passwordWrites=0;
    w.confirm=text => {prompts.push(text);return false;};
    w.JAILAU_API.updateProfile=async () => {nameWrites++;return {};};
    w.JAILAU_API.changePassword=async () => {passwordWrites++;};
    w.JAILAU_SCREENS.profile.render(w.document.getElementById('screen'),false);
    const form=w.document.querySelector('#profile-form');
    form.querySelector('#profile-name').value='Changed';
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    assert.match(prompts[0],/Changed/);
    assert.equal(nameWrites,0);
    const passwordForm=w.document.querySelector('#password-form');
    passwordForm.querySelector('#new-password').value='new-password';
    passwordForm.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    assert.match(prompts[1],/Изменить пароль/);
    assert.equal(passwordWrites,0);
  } finally {dom.window.close();}
});

test('driver profile hides zero trip count and shows a positive count', async () => {
  const dom=load(),w=dom.window;
  try {
    let trips=0;
    w.JAILAU_APP.getCurrentUser=() => ({name:'Driver',phone:'+70000000001',email:'driver@example.com',role:'driver'});
    w.JAILAU_API.getDriverStatus=async () => ({zone_id:'z1',approval_status:'active',completed_trips:trips});
    const screen=w.document.getElementById('screen');
    w.JAILAU_SCREENS.profile.render(screen,false);
    await flush();
    assert.equal(screen.querySelector('.driver-trip-count'),null);
    trips=2;
    w.JAILAU_SCREENS.profile.render(screen,false);
    await flush();
    assert.match(screen.querySelector('.driver-trip-count').textContent,/Поездок: 2/);
  } finally {dom.window.close();}
});

test('verified email setup creates password before saving profile', async () => {
  const dom=load(),w=dom.window;
  try {
    const calls=[];
    w.confirm=() => true;
    w.JAILAU_APP.getCurrentUser=() => ({name:'',phone:'',email:'new@example.com',role:'incomplete',provider:'email'});
    w.JAILAU_API.changePassword=async value => {calls.push(['password',value]);};
    w.JAILAU_API.completeProfile=async value => {calls.push(['profile',value]);return {role:'passenger',name:value.name};};
    w.JAILAU_SCREENS.profile.render(w.document.getElementById('screen'),true);
    const form=w.document.querySelector('#profile-form');
    form.querySelector('#profile-name').value='New user';
    form.querySelector('#profile-phone').value='+77011234567';
    form.querySelector('#profile-password').value='long-test-password';
    form.querySelector('#profile-password-again').value='long-test-password';
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    await flush();
    assert.deepEqual(calls.map(x=>x[0]),['password','profile']);
  } finally {dom.window.close();}
});

test('Russian and Kazakh contain every literal screen key', () => {
  const dom=load(),w=dom.window;
  try {
    const files=['app','screens/auth','screens/profile','screens/passenger','screens/driver','screens/admin'];
    const keys=new Set();
    for(const file of files) for(const m of fs.readFileSync(`js/${file}.js`,'utf8').matchAll(/\bt\("([a-z][a-z0-9_]+)"/g)) keys.add(m[1]);
    for(const lang of ['ru','kz']) {
      w.I18N.setLang(lang);
      for(const key of keys) assert.notEqual(w.I18N.t(key),key,`${lang}: missing ${key}`);
    }
  } finally {dom.window.close();}
});
