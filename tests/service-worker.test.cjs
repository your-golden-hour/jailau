const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');

function worker() {
  const handlers={},deleted=[],put=[],responses=[];
  const cache={addAll:async assets=>assets.forEach(a=>assert.ok(a==='./'||fs.existsSync(a))),
    put:async(key)=>put.push(key),match:async()=>null};
  const context={URL,Promise,console,caches:{open:async()=>cache,match:async()=>({offline:true}),
    keys:async()=>['other-app-cache','jailau-shell-v1','jailau-shell-v2'],
    delete:async key=>deleted.push(key)},fetch:async()=>({ok:true,status:200,type:'basic',clone(){return this;}}),
    self:{location:{origin:'http://localhost',href:'http://localhost/service-worker.js'},
      addEventListener:(key,fn)=>handlers[key]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}}};
  vm.runInNewContext(fs.readFileSync('service-worker.js','utf8'),context);
  return {handlers,context,deleted,put,responses};
}
test('service worker precaches valid shell files and preserves unrelated caches',async()=>{
  const w=worker();
  const waits=[];
  w.handlers.install({waitUntil:p=>waits.push(p)});
  w.handlers.activate({waitUntil:p=>waits.push(p)});
  await Promise.all(waits);
  assert.deepEqual(w.deleted,['jailau-shell-v1']);
});
test('service worker ignores private API responses and falls back when offline',async()=>{
  const w=worker(),responses=[],waits=[];
  const event=url=>({request:{url,method:'GET',mode:'cors'},respondWith:p=>responses.push(p),waitUntil:p=>waits.push(p)});
  w.handlers.fetch(event('http://localhost/api/profile'));
  w.handlers.fetch(event('https://example.invalid/rest/v1/users'));
  assert.equal(responses.length,0);
  w.context.fetch=async()=>{throw new Error('offline');};
  const nav=event('http://localhost/');nav.request.mode='navigate';
  w.handlers.fetch(nav);
  assert.equal((await responses[0]).offline,true);
  await Promise.all(waits);
});
