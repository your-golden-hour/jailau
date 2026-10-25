/* ============================================================
   Jailau — App router & shell (hash-based, vanilla JS)
   Routes:
     #/login                    (auth: login/register tabs)
     #/passenger/home           (online drivers by village)
     #/passenger/new-request    (create ride request)
     #/passenger/my-requests    (list + statuses)
     #/driver/feed              (open requests in zone)
     #/driver/my-requests       (accepted/completed trips)
     #/admin                    (approve/block drivers, zones, tariffs, settings)
   ============================================================ */

(function () {
  "use strict";

  var t = window.I18N.t;
  var API = window.JAILAU_API;
  var SCREENS = window.JAILAU_SCREENS;

  var elScreen, elNav, toastBox;
  var currentUser = null;
  var bootstrapped = false;

  /* ---------------- Route table ---------------- */

  var ROUTES = {
    "#/login": {
      public: true,
      nav: null,
      render: function (c) { SCREENS.auth.render(c, { mode: "login" }); }
    },
    "#/passenger/home": {
      roles: ["passenger"],
      nav: "home",
      render: function (c) { SCREENS.passenger.renderHome(c); }
    },
    "#/passenger/new-request": {
      roles: ["passenger"],
      nav: "new",
      render: function (c) { SCREENS.passenger.renderNewRequest(c); }
    },
    "#/passenger/my-requests": {
      roles: ["passenger"],
      nav: "mine",
      render: function (c) { SCREENS.passenger.renderMyRequests(c); }
    },
    "#/driver/feed": {
      roles: ["driver"],
      nav: "feed",
      render: function (c) { SCREENS.driver.renderFeed(c); }
    },
    "#/driver/my-requests": {
      roles: ["driver"],
      nav: "mine-driver",
      render: function (c) { SCREENS.driver.renderMyRequests(c); }
    },
    "#/admin": {
      roles: ["admin"],
      nav: "admin",
      render: function (c) { SCREENS.admin.render(c); }
    }
  };

  function homeHashFor(user) {
    if (!user) return "#/login";
    if (user.role === "driver") return "#/driver/feed";
    if (user.role === "admin") return "#/admin";
    return "#/passenger/home";
  }

  /* ---------------- Bottom navigation ---------------- */

  var NAV_ITEMS = {
    passenger: [
      { hash: "#/passenger/home", key: "nav_home", icon: "🏠", id: "home" },
      { hash: "#/passenger/new-request", key: "nav_new_request", icon: "➕", id: "new" },
      { hash: "#/passenger/my-requests", key: "nav_my_requests", icon: "🧾", id: "mine" },
      { hash: "#logout", key: "nav_logout", icon: "🚪", id: "logout" }
    ],
    driver: [
      { hash: "#/driver/feed", key: "nav_feed", icon: "🛰️", id: "feed" },
      { hash: "#/driver/my-requests", key: "nav_driver_requests", icon: "🚗", id: "mine-driver" },
      { hash: "#logout", key: "nav_logout", icon: "🚪", id: "logout" }
    ],
    admin: [
      { hash: "#/admin", key: "nav_admin", icon: "🛠️", id: "admin" },
      { hash: "#logout", key: "nav_logout", icon: "🚪", id: "logout" }
    ]
  };

  function renderNav(activeId) {
    if (!currentUser || !ROUTES[window.location.hash] || ROUTES[window.location.hash].public) {
      elNav.classList.add("hidden");
      elNav.innerHTML = "";
      return;
    }
    var items = NAV_ITEMS[currentUser.role] || [];
    elNav.classList.remove("hidden");
    elNav.innerHTML = items.map(function (it) {
      return '<a class="nav-item' + (it.id === activeId ? " active" : "") + '" href="' + it.hash + '">' +
        '<span class="nav-icon">' + it.icon + '</span>' +
        '<span data-i18n="' + it.key + '"></span>' +
        '<span class="nav-indicator"></span>' +
      '</a>';
    }).join("");
    window.I18N.applyAttributes(elNav);

    elNav.querySelectorAll('a[href="#logout"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        doLogout();
      });
    });
  }

  /* ---------------- Router ---------------- */

  function route() {
    var hash = window.location.hash || "#/login";
    // Normalize unknown hashes
    if (!ROUTES[hash]) {
      window.location.hash = currentUser ? homeHashFor(currentUser) : "#/login";
      return;
    }
    var def = ROUTES[hash];

    // Auth guard
    if (!def.public && !currentUser) {
      window.location.hash = "#/login";
      return;
    }
    // Already logged in but on login page → go home
    if (def.public && currentUser) {
      window.location.hash = homeHashFor(currentUser);
      return;
    }
    // Role guard
    if (!def.public && def.roles && currentUser && def.roles.indexOf(currentUser.role) === -1) {
      window.location.hash = homeHashFor(currentUser);
      return;
    }

    // Stop driver feed auto-refresh timer when leaving the screen
    if (SCREENS.driver && SCREENS.driver.clearTimers && hash !== "#/driver/feed") {
      SCREENS.driver.clearTimers();
    }

    elScreen.classList.toggle("no-nav", !!def.public);
    renderNav(def.nav);
    elScreen.innerHTML = "";
    try {
      def.render(elScreen);
    } catch (err) {
      elScreen.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
      if (window.console) console.error("Render error:", err);
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- Toast ---------------- */

  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastBox.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity 0.3s ease";
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------------- Login / logout hooks ---------------- */

  function onLogin(user) {
    currentUser = user;
    var target = homeHashFor(user);
    toast(t("ph_home_hello", { name: user.name }), "success");
    if (window.location.hash === target) {
      route(); // same hash won't fire hashchange
    } else {
      window.location.hash = target;
    }
  }

  function doLogout() {
    if (SCREENS.driver && SCREENS.driver.clearTimers) SCREENS.driver.clearTimers();
    API.signOut().then(function () {
      currentUser = null;
      window.location.hash = "#/login";
      route();
    });
  }

  /* ---------------- Bootstrap ---------------- */

  function bootstrap() {
    elScreen = document.getElementById("screen");
    elNav = document.getElementById("bottom-nav");
    toastBox = document.getElementById("toast-container");

    // DEMO banner is forced visible while running on mock data
    var banner = document.getElementById("demo-banner");
    if (banner && !window.JAILAU_CONFIG.DEMO_MODE) banner.classList.add("hidden");

    document.getElementById("lang-toggle").addEventListener("click", function () {
      window.I18N.toggleLang();
    });

    // Re-render current screen on language change so all dynamic text updates
    window.addEventListener("jailau:langchange", function () {
      document.title = t("app_name") + " — Jailau";
      window.I18N.applyAttributes(document);
      route();
    });

    window.addEventListener("hashchange", route);
    window.I18N.applyAttributes(document);

    API.getCurrentUser().then(function (user) {
      currentUser = user;
      if (!window.location.hash || !ROUTES[window.location.hash]) {
        window.location.hash = user ? homeHashFor(user) : "#/login";
      }
      route();
    });

    bootstrapped = true;
  }

  window.JAILAU_APP = {
    toast: toast,
    onLogin: onLogin,
    logout: doLogout,
    getCurrentUser: function () { return currentUser; },
    isBootstrapped: function () { return bootstrapped; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
