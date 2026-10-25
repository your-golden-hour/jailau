/* ============================================================
   Jailau — Auth screens (login / register)
   Exposes: window.JAILAU_SCREENS.auth.render(container, opts)
   opts.mode: "login" | "register"
   ============================================================ */

(function () {
  "use strict";

  var t = window.I18N.t;
  var API = window.JAILAU_API;
  var CFG = window.JAILAU_CONFIG;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function phoneRegexOk(v) {
    var digits = String(v).replace(/[\s()-]/g, "");
    return /^\+7\d{10}$/.test(digits);
  }

  function renderAuth(container, opts) {
    var mode = (opts && opts.mode) === "register" ? "register" : "login";
    var zonesPromise = mode === "register" ? API.listZonesAndVillages() : Promise.resolve(null);

    container.innerHTML = buildShell(mode);
    bindStaticHandlers(container, mode);

    zonesPromise.then(function (zones) {
      if (container.isConnected && mode === "register" && zones) fillZoneSelect(container, zones);
    }).catch(function () {
      if (container.isConnected) window.JAILAU_APP.toast(t("error_generic"), "error");
    });
  }

  function buildShell(mode) {
    var html = '' +
      '<div class="auth-layout">' +
        '<section class="auth-hero" aria-label="' + esc(t("app_tagline")) + '">' +
          '<div class="auth-hero-inner">' +
            '<p class="eyebrow">' + esc(t("hero_eyebrow")) + '</p>' +
            '<h1>' + esc(t("hero_title")) + '</h1>' +
            '<p class="hero-description">' + esc(t("hero_description")) + '</p>' +
            '<div class="hero-route" aria-hidden="true"><span class="route-point">●</span><span class="route-track"></span><span class="route-point route-destination">◆</span></div>' +
            '<ol class="hero-steps"><li>' + esc(t("hero_step_one")) + '</li><li>' + esc(t("hero_step_two")) + '</li><li>' + esc(t("hero_step_three")) + '</li></ol>' +
          '</div>' +
        '</section>' +
        '<section class="auth-panel"><div class="auth-card">' +
          '<p class="eyebrow panel-eyebrow">' + esc(t("app_name")) + '</p>' +
          '<h2 class="screen-title">' + esc(t(mode === "login" ? "login_title" : "register_title")) + '</h2>' +
          '<p class="screen-subtitle">' + esc(t("auth_welcome")) + '</p>' +
          '<div class="auth-tabs" role="tablist">' +
            '<button type="button" role="tab" aria-selected="' + (mode === "login") + '" class="auth-tab' + (mode === "login" ? " active" : "") + '" data-mode="login">' + esc(t("tab_login")) + '</button>' +
            '<button type="button" role="tab" aria-selected="' + (mode === "register") + '" class="auth-tab' + (mode === "register" ? " active" : "") + '" data-mode="register">' + esc(t("tab_register")) + '</button>' +
          '</div>' +
          '<form id="auth-form" class="card" novalidate autocomplete="on">' +
            (mode === "register" ? registerFields() : loginFields()) +
          '</form>' +
          (!CFG.DEMO_MODE && mode === "register" ? '<p class="auth-warning">' + esc(t("terms_unverified")) + '</p>' : '') +
          (CFG.DEMO_MODE ? demoAccountsBlock() : "") +
          '<a class="text-link terms-link" href="#/terms">' + esc(t("terms_link")) + '</a>' +
          '<p class="small muted legal-line">' + esc(t("legal_disclaimer")) + '</p>' +
        '</div></section>' +
      '</div>';
    return html;
  }

  function field(name, label, attrs, hint) {
    return '' +
      '<div class="form-field" data-field="' + name + '">' +
        '<label class="form-label" for="f-' + name + '">' + esc(label) + '</label>' +
        '<input class="form-input" id="f-' + name + '" name="' + name + '" ' + (attrs || "") + '>' +
        (hint ? '<div class="form-hint">' + esc(hint) + '</div>' : "") +
        '<div class="form-error"></div>' +
      '</div>';
  }

  function loginFields() {
    return '' +
      field("phone", t("field_phone"), 'type="tel" inputmode="tel" placeholder="+7 XXX XXX XX XX" required') +
      field("password", t("field_password"), 'type="password" autocomplete="current-password" required') +
      '<button class="btn btn-primary btn-block" type="submit">' + esc(t("btn_login")) + '</button>';
  }

  function registerFields() {
    return '' +
      field("name", t("field_name"), 'type="text" autocomplete="name" required') +
      field("phone", t("field_phone"), 'type="tel" inputmode="tel" placeholder="+7 XXX XXX XX XX" required', t("field_phone_hint")) +
      field("password", t("field_password"), 'type="password" autocomplete="new-password" minlength="6" required') +
      field("confirm_password", t("field_confirm_password"), 'type="password" autocomplete="new-password" minlength="6" required') +

      '<div class="form-field" data-field="role">' +
        '<label class="form-label">' + esc(t("field_role")) + '</label>' +
        '<div class="radio-row">' +
          roleChip("passenger", t("role_passenger"), true) +
          roleChip("driver", t("role_driver"), false) +
        '</div>' +
        '<div class="form-error"></div>' +
      '</div>' +

      '<div id="driver-extra" class="hidden">' +
        '<div class="form-field" data-field="car_brand">' +
          '<label class="form-label" for="f-car_brand">' + esc(t("ad_col_car")) + '</label>' +
          '<input class="form-input" id="f-car_brand" name="car_brand" type="text" placeholder="Hyundai Accent">' +
        '</div>' +
        '<div class="form-field" data-field="plate">' +
          '<label class="form-label" for="f-plate">' + esc(t("field_plate")) + '</label>' +
          '<input class="form-input" id="f-plate" name="plate" type="text" placeholder="560 ABC 03">' +
        '</div>' +
        '<div class="form-field" data-field="zone_id">' +
          '<label class="form-label" for="f-zone_id">' + esc(t("df_zone_label")) + '</label>' +
          '<select class="form-select" id="f-zone_id" name="zone_id"></select>' +
        '</div>' +
      '</div>' +

      '<div class="form-field" data-field="village_id">' +
        '<label class="form-label" for="f-village_id">' + esc(t("nr_village")) + '</label>' +
        '<select class="form-select" id="f-village_id" name="village_id"></select>' +
      '</div>' +

      '<button class="btn btn-primary btn-block" type="submit">' + esc(t("btn_register")) + '</button>';
  }

  function roleChip(value, label, checked) {
    return '' +
      '<label class="radio-chip' + (checked ? " checked" : "") + '">' +
        '<input type="radio" name="role" value="' + value + '"' + (checked ? " checked" : "") + '>' +
        esc(label) +
      '</label>';
  }

  function demoAccountsBlock() {
    var a = CFG.DEMO_ACCOUNTS;
    return '' +
      '<div class="demo-chooser">' +
        '<div class="demo-chooser-title"><span class="demo-dot"></span>' + esc(t("demo_choose_role")) + '</div>' +
        '<div class="demo-role-grid">' +
          quickBtn("passenger") + quickBtn("driver") + quickBtn("admin") +
        '</div>' +
        '<p class="demo-caption">' + esc(t("demo_accounts_hint")) + '</p>' +
      '</div>';
  }

  function quickBtn(role) {
    var labelKey = { passenger: "demo_acc_passenger", driver: "demo_acc_driver", admin: "demo_acc_admin" }[role];
    var icon = { passenger: "→", driver: "↗", admin: "⌘" }[role];
    return '<button type="button" class="demo-role" data-quick-login="' + role + '"><span class="demo-role-icon">' + icon + '</span><span>' +
      esc(t(labelKey)) + '</span></button>';
  }

  /* ---------------- Handlers ---------------- */

  function bindStaticHandlers(container, mode) {
    // Tab switching
    container.querySelectorAll(".auth-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        renderAuth(container, { mode: btn.getAttribute("data-mode") });
      });
    });

    // Quick login buttons
    container.querySelectorAll("[data-quick-login]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var role = btn.getAttribute("data-quick-login");
        var acc = CFG.DEMO_ACCOUNTS[role];
        API.signIn(acc.phone, acc.password)
          .then(function (user) { window.JAILAU_APP.onLogin(user); })
          .catch(function () { window.JAILAU_APP.toast(t("err_login_failed"), "error"); });
      });
    });

    // Role chips visual state
    container.querySelectorAll('input[name="role"]').forEach(function (r) {
      r.addEventListener("change", function () {
        container.querySelectorAll(".radio-chip").forEach(function (c) { c.classList.remove("checked"); });
        r.closest(".radio-chip").classList.add("checked");
        var extra = container.querySelector("#driver-extra");
        if (extra) extra.classList.toggle("hidden", r.value !== "driver");
      });
    });

    var form = container.querySelector("#auth-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);
      if (mode === "login") doLogin(form);
      else doRegister(form);
    });
  }

  function fillZoneSelect(container, zones) {
    var villageSel = container.querySelector("#f-village_id");
    var zoneSel = container.querySelector("#f-zone_id");
    if (villageSel) {
      var vHtml = '<option value="">—</option>';
      zones.forEach(function (z) {
        z.villages.forEach(function (v) {
          vHtml += '<option value="' + v.id + '">' + esc(window.I18N.localizedName(v.name)) + ' (' + esc(window.I18N.localizedName(z.name)) + ')</option>';
        });
      });
      villageSel.innerHTML = vHtml;
    }
    if (zoneSel) {
      var zHtml = '<option value="">—</option>';
      zones.forEach(function (z) {
        zHtml += '<option value="' + z.id + '">' + esc(window.I18N.localizedName(z.name)) + '</option>';
      });
      zoneSel.innerHTML = zHtml;
      if (!zones.length) zoneSel.insertAdjacentHTML("afterend", '<p class="form-hint">' + esc(t("no_villages_yet")) + '</p>');
    }
  }

  function setError(form, fieldName, msgKey) {
    var wrap = form.querySelector('[data-field="' + fieldName + '"]');
    if (!wrap) return;
    wrap.classList.add("invalid");
    var err = wrap.querySelector(".form-error");
    if (err) err.textContent = t(msgKey);
  }

  function clearErrors(form) {
    form.querySelectorAll(".form-field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
  }

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function doLogin(form) {
    var phone = val(form, "phone");
    var password = val(form, "password");
    var ok = true;
    if (!phoneRegexOk(phone)) { setError(form, "phone", "err_phone_invalid"); ok = false; }
    if (!password) { setError(form, "password", "err_password_short"); ok = false; }
    if (!ok) return;

    API.signIn(phone, password)
      .then(function (user) { window.JAILAU_APP.onLogin(user); })
      .catch(function (err) {
        if (err && err.message === "profile_incomplete") {
          renderAuth(form.closest(".screen"), { mode: "register" });
          window.JAILAU_APP.toast(t("profile_incomplete"), "error");
          return;
        }
        setError(form, "phone", err.message || "err_login_failed");
      });
  }

  function doRegister(form) {
    var name = val(form, "name");
    var phone = val(form, "phone");
    var pw = val(form, "password");
    var pw2 = val(form, "confirm_password");
    var roleEl = form.querySelector('input[name="role"]:checked');
    var role = roleEl ? roleEl.value : "passenger";
    var ok = true;

    if (!name) { setError(form, "name", "err_name_required"); ok = false; }
    if (!phoneRegexOk(phone)) { setError(form, "phone", "err_phone_invalid"); ok = false; }
    if (pw.length < 6) { setError(form, "password", "err_password_short"); ok = false; }
    if (pw !== pw2) { setError(form, "confirm_password", "err_passwords_mismatch"); ok = false; }
    if (!ok) return;

    var payload = {
      name: name,
      phone: phone,
      password: pw,
      role: role,
      village_id: val(form, "village_id") || null
    };
    if (role === "driver") {
      payload.driver = {
        car_brand: val(form, "car_brand") || "—",
        plate: val(form, "plate") || "—",
        seats: 4,
        fuel_consumption: 8.0, // default; admin settings hold the global default
        zone_id: val(form, "zone_id") || null
      };
    }

    API.signUp(payload)
      .then(function (user) { window.JAILAU_APP.onLogin(user); })
      .catch(function (err) { setError(form, "phone", err.message || "error_generic"); });
  }

  window.JAILAU_SCREENS = window.JAILAU_SCREENS || {};
  window.JAILAU_SCREENS.auth = { render: renderAuth };
})();
