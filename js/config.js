/* ============================================================
   Jailau — Configuration
   ------------------------------------------------------------
   Only public connection details live here. Never add a
   service_role key, secret key, password, or private user data.
   ============================================================ */

(function () {
  "use strict";

  window.JAILAU_CONFIG = {
    // --- Public Supabase project details; never put secrets here ---
    SUPABASE_URL: "https://ubjcvqqxkgshguiwikqu.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_YXWZ6JHO4rsqnbUtYoVt6w_8Z74TxdJ",
    // Explicit selector: credentials alone never switch a demo into real mode.
    BACKEND: "demo", // "demo" or "supabase"

    get DEMO_MODE() {
      return this.BACKEND === "demo";
    },

    // --- App constants ---
    DEFAULT_LANG: "ru",
    SUPPORTED_LANGS: ["ru", "kz"],
    CURRENCY: "₸",             // Kazakh tenge
    CITY_NAME_KEY: "city_shymkent",

    // --- Demo accounts (mock only, safe fake data) ---
    DEMO_ACCOUNTS: {
      passenger: { phone: "+70000000001", password: "demo1234" },
      driver:    { phone: "+70000000002", password: "demo1234" },
      admin:     { phone: "+70000000003", password: "demo1234" }
    }
  };
})();
