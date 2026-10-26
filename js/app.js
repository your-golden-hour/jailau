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
    "#/terms": {
      public: true,
      nav: null,
      render: function (c) {
        c.innerHTML = '<div class="terms-page"><a class="text-link" href="' + (currentUser ? homeHashFor(currentUser) : '#/login') + '">← ' + esc(t("nav_home")) + '</a>' +
          '<h1 class="screen-title">' + esc(t("terms_title")) + '</h1>' +
          '<p class="terms-intro">' + esc(t("terms_updated")) + '</p>' +
          '<div class="card terms-copy"><p>' + esc(t("terms_service")) + '</p><p>' + esc(t("terms_payment")) + '</p><p>' + esc(t("terms_data")) + '</p><p>' + esc(t("terms_warning")) + '</p><p>' + esc(t("terms_unverified")) + '</p></div></div>';
      }
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
    "#/profile": {
      roles: ["passenger", "driver", "admin"],
      nav: "profile",
      render: function (c) { SCREENS.profile.render(c, false); }
    },
    "#/profile/complete": {
      roles: ["incomplete"],
      nav: null,
      render: function (c) { SCREENS.profile.render(c, true); }
    },
    "#/admin": {
      roles: ["admin"],
      nav: "admin",
      render: function (c) { SCREENS.admin.render(c); }
    }
  };

  function homeHashFor(user) {
    if (!user) return "#/login";
    if (user.role === "incomplete") return "#/profile/complete";
    if (user.role === "driver") return "#/driver/feed";
    if (user.role === "admin") return "#/admin";
    return "#/passenger/home";
  }

  /* ---------------- Bottom navigation ---------------- */

  var NAV_ITEMS = {
    passenger: [
      { hash: "#/passenger/home", key: "nav_home", icon: "⌂", id: "home" },
      { hash: "#/passenger/new-request", key: "nav_new_request", icon: "+", id: "new" },
      { hash: "#/passenger/my-requests", key: "nav_my_requests", icon: "▤", id: "mine" },
      { hash: "#/profile", key: "nav_profile", icon: "◯", id: "profile" }
    ],
    driver: [
      { hash: "#/driver/feed", key: "nav_feed", icon: "≡", id: "feed" },
      { hash: "#/driver/my-requests", key: "nav_driver_requests", icon: "▤", id: "mine-driver" },
      { hash: "#/profile", key: "nav_profile", icon: "◯", id: "profile" }
    ],
    admin: [
      { hash: "#/admin", key: "nav_admin", icon: "▦", id: "admin" },
      { hash: "#/profile", key: "nav_profile", icon: "◯", id: "profile" }
    ]
  };

  function renderNav(activeId) {
    var currentRoute = window.location.hash.split("?")[0];
    if (!currentUser || !ROUTES[currentRoute] || ROUTES[currentRoute].public) {
      elNav.classList.add("hidden");
      elNav.innerHTML = "";
      return;
    }
    var items = NAV_ITEMS[currentUser.role] || [];
    if (!items.length) { elNav.classList.add("hidden"); return; }
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
    var hash = (window.location.hash || "#/login").split("?")[0];
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
    if (hash === "#/login" && currentUser) {
      window.location.hash = homeHashFor(currentUser);
      return;
    }
    if (currentUser && currentUser.role === "incomplete" && hash !== "#/profile/complete" && hash !== "#/terms") {
      window.location.hash = "#/profile/complete";
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
    if (SCREENS.passenger && SCREENS.passenger.clearTimers && hash !== "#/passenger/my-requests") {
      SCREENS.passenger.clearTimers();
    }

    var freshScreen = elScreen.cloneNode(false);
    elScreen.replaceWith(freshScreen);
    elScreen = freshScreen;
    elScreen.classList.toggle("no-nav", !!def.public);
    elScreen.classList.toggle("auth-screen", hash === "#/login");
    renderNav(def.nav);
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
    if (user.role !== "incomplete") toast(t("ph_home_hello", { name: user.name }), "success");
    if (window.location.hash === target) {
      route(); // same hash won't fire hashchange
    } else {
      window.location.hash = target;
    }
  }

  function doLogout() {
    if (SCREENS.driver && SCREENS.driver.clearTimers) SCREENS.driver.clearTimers();
    if (SCREENS.passenger && SCREENS.passenger.clearTimers) SCREENS.passenger.clearTimers();
    API.signOut().then(function () {
      currentUser = null;
      window.location.hash = "#/login";
      route();
    }).catch(function () {
      toast(t("error_generic"), "error");
    });
  }

  /* ---------------- Bootstrap ---------------- */

  function bootstrap() {
    elScreen = document.getElementById("screen");
    elNav = document.getElementById("bottom-nav");
    toastBox = document.getElementById("toast-container");

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
    document.getElementById("lang-toggle").textContent = window.I18N.getLang() === "ru" ? "KZ" : "RU";

    Promise.resolve(window.JAILAU_API_READY).then(function () { return API.getCurrentUser(); }).then(function (user) {
      currentUser = user;
      if (!window.location.hash || !ROUTES[window.location.hash]) {
        window.location.hash = user ? homeHashFor(user) : "#/login";
      }
      route();
    }).catch(function (err) {
      if (!window.JAILAU_REAL_BACKEND_READY) {
        elScreen.innerHTML = '<div class="empty-state">' + esc(t(err && err.message === "err_config" ? "err_config" : "err_backend_unavailable")) + '</div>';
        return;
      }
      currentUser = null;
      window.location.hash = "#/login";
      route();
      toast(t("error_generic"), "error");
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
