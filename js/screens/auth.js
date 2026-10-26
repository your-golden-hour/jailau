/* Email and Google authentication. Contact phones are collected separately. */
(function () {
  "use strict";
  var t = window.I18N.t;
  var API = window.JAILAU_API;
  function esc(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function message(err) {
    var key = err && err.message || "error_generic";
    return t(key) === key ? t("error_generic") : t(key);
  }
  function render(container, opts) {
    var register = opts && opts.mode === "register";
    container.innerHTML = '<div class="auth-simple"><div class="auth-intro">' +
      '<p class="eyebrow">ЖАЙЛАУ · ШЫМКЕНТ</p><h1>' + esc(t("auth_simple_title")) + '</h1>' +
      '<p>' + esc(t("auth_simple_subtitle")) + '</p></div>' +
      '<div class="card auth-form-card"><div class="auth-tabs" role="tablist">' +
      '<button type="button" class="auth-tab' + (register ? '' : ' active') + '" data-mode="login">' + esc(t("tab_login")) + '</button>' +
      '<button type="button" class="auth-tab' + (register ? ' active' : '') + '" data-mode="register">' + esc(t("tab_register")) + '</button></div>' +
      '<form id="auth-form"><label class="form-label" for="auth-email">' + esc(t("field_email")) + '</label>' +
      '<input class="form-input" id="auth-email" type="email" autocomplete="email" required>' +
      (register ? '' : '<label class="form-label mt-16" for="auth-password">' + esc(t("field_password")) + '</label>' +
      '<input class="form-input" id="auth-password" type="password" autocomplete="current-password" required>') +
      (register ? '<p class="form-hint">' + esc(t("email_check_note")) + '</p>' : '') +
      '<button class="btn btn-primary btn-block mt-16" type="submit">' + esc(t(register ? "btn_register" : "btn_login")) + '</button></form>' +
      '<div class="auth-divider">' + esc(t("auth_or")) + '</div>' +
      '<button class="btn btn-secondary btn-block" id="auth-google" type="button">' + esc(t("auth_google")) + '</button>' +
      '<p id="auth-message" class="form-hint" role="status"></p>' +
      '<a class="text-link terms-link" href="#/terms">' + esc(t("terms_link")) + '</a></div>' +
      '<p class="auth-version">' + esc(t("beta_version", { version: window.JAILAU_CONFIG.VERSION })) + '</p></div>';
    container.querySelectorAll("[data-mode]").forEach(function (button) {
      button.addEventListener("click", function () { render(container, { mode: button.dataset.mode }); });
    });
    var form = container.querySelector("#auth-form");
    var status = container.querySelector("#auth-message");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.querySelector("#auth-email").value.trim();
      var passwordInput = form.querySelector("#auth-password");
      var password = passwordInput ? passwordInput.value : "";
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      status.textContent = "";
      var request = register ? API.signUp(email) : API.signIn(email, password);
      request.then(function (result) {
        if (register) status.textContent = t("email_sent");
        else window.JAILAU_APP.onLogin(result);
      }).catch(function (err) { status.textContent = message(err); })
        .finally(function () { button.disabled = false; });
    });
    container.querySelector("#auth-google").addEventListener("click", function () {
      API.signInWithGoogle().catch(function (err) { status.textContent = message(err); });
    });
  }
  window.JAILAU_SCREENS = window.JAILAU_SCREENS || {};
  window.JAILAU_SCREENS.auth = { render: render };
})();
