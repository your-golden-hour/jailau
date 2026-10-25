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
  w.JAILAU_APP = {toast(){},getCurrentUser:() => ({name:'Test',phone:'+70000000001',email:'test@example.com',role:'passenger'})};
  for (const file of ['config','i18n','screens/passenger','screens/profile']) w.eval(fs.readFileSync(`js/${file}.js`,'utf8'));
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
  } finally { dom.window.close(); }
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
