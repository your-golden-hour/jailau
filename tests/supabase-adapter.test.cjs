const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');

function setup() {
  const dom = new JSDOM('<html><head></head><body></body></html>', {
    runScripts: 'outside-only', url: 'https://jailau.example/'
  });
  const w = dom.window;
  w.I18N = {t: key => key};
  for (const file of ['config']) w.eval(fs.readFileSync(`js/${file}.js`, 'utf8'));
  w.JAILAU_CONFIG.SUPABASE_URL = 'YOUR_SUPABASE_URL';
  w.JAILAU_CONFIG.SUPABASE_PUBLISHABLE_KEY = 'YOUR_SUPABASE_PUBLISHABLE_KEY';
  return dom;
}

test('vendored browser SDK exposes the official createClient entry point', () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync('vendor/supabase-js/supabase.js', 'utf8'), context);
  assert.equal(typeof context.supabase.createClient, 'function');
});

test('real mode fails closed when public configuration is missing', async () => {
  const dom = setup(), w = dom.window;
  try {
    w.eval(fs.readFileSync('js/supabase-api.js', 'utf8'));
    await assert.rejects(w.JAILAU_API_READY, {message: 'err_config'});
    await assert.rejects(w.JAILAU_API.signIn('test@example.com', 'test-password'), {message: 'err_backend_unavailable'});
    assert.equal(w.document.querySelector('script[src*="supabase.js"]'), null);
  } finally { dom.window.close(); }
});

test('real adapter uses Supabase Auth and atomic RPC, never mock request mutations', async () => {
  const dom = setup(), w = dom.window;
  try {
    const calls = [];
    let options;
    w.JAILAU_CONFIG.SUPABASE_URL = 'https://example.supabase.co';
    w.JAILAU_CONFIG.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test_public_key';
    w.eval(fs.readFileSync('js/supabase-api.js', 'utf8'));
    const script = w.document.querySelector('script[src="vendor/supabase-js/supabase.js"]');
    assert.ok(script);
    await assert.rejects(w.JAILAU_API.signIn('test@example.com', 'test-password'), {message: 'err_backend_unavailable'});
    w.supabase = {createClient: (_url, _key, config) => {
      options = config;
      return {
        auth: {
          getSession: async () => ({data: {session: {user: {id: 'person-1'}}}, error: null}),
          getUser: async () => ({data: {user: {id: 'person-1',email:'test@example.com',app_metadata:{provider:'email'}}}, error: null}),
          signInWithPassword: async credentials => { calls.push(['signIn', credentials]); return {data: {}, error: null}; },
          signInWithOtp: async payload => { calls.push(['signInWithOtp',payload]); return {data:{user:null,session:null},error:null}; },
          signOut: async () => ({data: {}, error: null})
        },
        from: table => {
          calls.push(['from', table]);
          if (table !== 'users') throw new Error(`Unexpected table: ${table}`);
          const query = {select: () => query, eq: () => query,
            maybeSingle: async () => ({data: {id: 'person-1', name: 'Test', phone: '+70000000001', role: 'passenger'}, error: null})};
          return query;
        },
        rpc: async (name, args) => {
          calls.push(['rpc', name, args]);
          if (name === 'accept_request') return {data: 'request-1', error: null};
          if (name === 'list_requests') return {data: [{id: 'request-1', status: 'accepted', passenger_phone: '+70000000001'}], error: null};
          throw new Error(`Unexpected RPC: ${name}`);
        }
      };
    }};
    script.onload();
    await w.JAILAU_API_READY;
    const user = await w.JAILAU_API.signIn('test@example.com', 'test-password');
    assert.equal(user.role, 'passenger');
    assert.equal(calls[0][0], 'signIn');
    assert.equal(calls[0][1].email, 'test@example.com');
    const signup = await w.JAILAU_API.signUp('new@example.com');
    assert.equal(signup.needsConfirmation,true);
    const otp = calls.find(row => row[0] === 'signInWithOtp');
    assert.equal(otp[1].email,'new@example.com');
    assert.equal(otp[1].options.shouldCreateUser,true);
    assert.equal('password' in otp[1],false);
    const request = await w.JAILAU_API.acceptRequest('request-1');
    assert.equal(request.status, 'accepted');
    assert.ok(calls.some(row => row[0] === 'rpc' && row[1] === 'accept_request' && row[2].p_request_id === 'request-1'));
    assert.ok(calls.some(row => row[0] === 'rpc' && row[1] === 'list_requests' && row[2].p_kind === 'driver'));
    assert.ok(!calls.some(row => row[0] === 'from' && row[1] === 'requests'));
    assert.equal(options.auth.persistSession, true);
    assert.equal(options.auth.detectSessionInUrl, true);
  } finally { dom.window.close(); }
});
