/* ============================================================
   Jailau — Configuration
   ------------------------------------------------------------
   Only public connection details live here. Never add a
   service_role key, secret key, password, or private user data.
   ============================================================ */

(function () {
  "use strict";

  window.JAILAU_CONFIG = {
    VERSION: "v0.0.1",
    // --- Public Supabase project details; never put secrets here ---
    SUPABASE_URL: "https://ubjcvqqxkgshguiwikqu.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_YXWZ6JHO4rsqnbUtYoVt6w_8Z74TxdJ",

    // --- App constants ---
    DEFAULT_LANG: "ru",
    SUPPORTED_LANGS: ["ru", "kz"],
    CURRENCY: "₸",             // Kazakh tenge
    CITY_NAME_KEY: "city_shymkent"
  };
})();
