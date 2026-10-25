/* ============================================================
   Jailau — Configuration
   ------------------------------------------------------------
   ONLY placeholders here. NO secrets, NO real keys.
   When the Supabase backend is ready, paste your project URL
   and the PUBLIC anon key (never the service_role key) into
   the two values below, or override via a local untracked file.
   ============================================================ */

(function () {
  "use strict";

  window.JAILAU_CONFIG = {
    // --- Supabase placeholders (intentionally empty / fake) ---
    SUPABASE_URL: "YOUR_SUPABASE_URL",       // e.g. https://xyzcompany.supabase.co
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY", // public anon key only

    // This build ONLY implements the in-memory API. Keys cannot enable a backend.
    get DEMO_MODE() {
      return true;
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
