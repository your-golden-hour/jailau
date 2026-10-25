/* Profile and first-login contact details. */
(function () {
  "use strict";
  var t = window.I18N.t;
  var API = window.JAILAU_API;
  function esc(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function msg(err) {
    var key = err && err.message || "error_generic";
    return t(key) === key ? t("error_generic") : t(key);
  }
  function phone(value) { return String(value || "").replace(/[\s()-]/g, ""); }
  function confirmPhone(value) {
    return window.confirm(t("phone_confirm", { phone: value }));
  }
  function render(container, complete) {
    var user = window.JAILAU_APP.getCurrentUser();
    if (!user) { window.location.hash = "#/login"; return; }
    var editing = !complete;
    container.innerHTML = '<div class="profile-page"><h1 class="screen-title">' + esc(t(complete ? "profile_finish" : "profile_title")) + '</h1>' +
      '<div class="card profile-card"><p class="profile-identity">' + esc(user.email || "") + '</p>' +
      '<p class="form-hint">' + esc(user.provider === "google" ? t("profile_google") : t("profile_email")) + '</p>' +
      '<form id="profile-form"><label class="form-label" for="profile-name">' + esc(t("field_name")) + '</label>' +
      '<input class="form-input" id="profile-name" maxlength="80" required value="' + esc(user.name || "") + '">' +
      '<label class="form-label mt-16" for="profile-phone">' + esc(t("field_phone")) + '</label>' +
      '<input class="form-input" id="profile-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7XXXXXXXXXX" required value="' + esc(user.phone || "") + '">' +
      '<p class="form-hint">' + esc(t("profile_phone_note")) + '</p>' +
      (complete && user.provider !== "google" ?
        '<label class="form-label mt-16" for="profile-password">' + esc(t("profile_create_password")) + '</label>' +
        '<input class="form-input" id="profile-password" type="password" autocomplete="new-password" minlength="8" required>' +
        '<label class="form-label mt-16" for="profile-password-again">' + esc(t("field_confirm_password")) + '</label>' +
        '<input class="form-input" id="profile-password-again" type="password" autocomplete="new-password" minlength="8" required>' : '') +
      (complete ? '<div class="form-field"><label class="form-label" for="profile-role">' + esc(t("field_role")) + '</label>' +
        '<select class="form-select" id="profile-role"><option value="passenger">' + esc(t("role_passenger")) + '</option><option value="driver">' + esc(t("role_driver")) + '</option></select></div>' +
        '<div id="profile-driver" class="hidden"><label class="form-label" for="driver-zone">' + esc(t("df_zone_label")) + '</label>' +
        '<select class="form-select" id="driver-zone"></select>' +
        '<label class="form-label mt-16" for="driver-car">' + esc(t("ad_col_car")) + '</label><input class="form-input" id="driver-car" maxlength="80">' +
        '<label class="form-label mt-16" for="driver-plate">' + esc(t("field_plate")) + '</label><input class="form-input" id="driver-plate" maxlength="20">' +
        '<label class="form-label mt-16" for="driver-seats">' + esc(t("nr_seats")) + '</label><select class="form-select" id="driver-seats"><option>1</option><option>2</option><option>3</option><option selected>4</option></select></div>' : '') +
      '<button class="btn btn-primary btn-block mt-16" type="submit">' + esc(t("profile_save")) + '</button></form>' +
      '<p id="profile-message" class="form-hint" role="status"></p></div>' +
      (editing ? '<div class="card profile-card"><h2 class="section-title">' + esc(t("profile_password")) + '</h2>' +
        '<form id="password-form"><label class="form-label" for="new-password">' + esc(t("profile_new_password")) + '</label>' +
        '<input class="form-input" id="new-password" type="password" autocomplete="new-password" minlength="8" required>' +
        '<button class="btn btn-secondary btn-block mt-16" type="submit">' + esc(t("profile_change_password")) + '</button></form></div>' +
        '<div class="profile-links"><button type="button" class="btn btn-ghost" data-placeholder="support">' + esc(t("profile_support")) + '</button>' +
        '<button type="button" class="btn btn-ghost" data-placeholder="feedback">' + esc(t("profile_feedback")) + '</button>' +
        '<button type="button" class="btn btn-ghost" id="profile-logout">' + esc(t("nav_logout")) + '</button></div>' : '') +
      '</div>';
    if (complete) {
      var role = container.querySelector("#profile-role");
      role.addEventListener("change", function () {
        container.querySelector("#profile-driver").classList.toggle("hidden", role.value !== "driver");
      });
      API.listZonesAndVillages().then(function (zones) {
        var select = container.querySelector("#driver-zone");
        if (!select) return;
        select.innerHTML = '<option value="">—</option>' + zones.map(function (z) {
          return '<option value="' + esc(z.id) + '">' + esc(window.I18N.localizedName(z.name)) + '</option>';
        }).join("");
      }).catch(function () { container.querySelector("#profile-message").textContent = t("error_generic"); });
    }
    container.querySelector("#profile-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.target;
      var value = phone(form.querySelector("#profile-phone").value);
      var status = container.querySelector("#profile-message");
      if (!/^\+7\d{10}$/.test(value)) { status.textContent = t("err_phone_invalid"); return; }
      if ((complete || value !== user.phone) && !confirmPhone(value)) return;
      var payload = { name: form.querySelector("#profile-name").value.trim(), phone: value };
      if (complete) {
        var passwordField = form.querySelector("#profile-password");
        if (passwordField) {
          var newPassword = passwordField.value;
          if (newPassword.length < 8) { status.textContent = t("err_password_short"); return; }
          if (newPassword !== form.querySelector("#profile-password-again").value) {
            status.textContent = t("err_passwords_mismatch"); return;
          }
        }
        payload.role = form.querySelector("#profile-role").value;
        if (payload.role === "driver") {
          payload.driver = { zone_id: form.querySelector("#driver-zone").value,
            car_brand: form.querySelector("#driver-car").value.trim(), plate: form.querySelector("#driver-plate").value.trim(),
            seats: Number(form.querySelector("#driver-seats").value), fuel_consumption: 8 };
          if (!payload.driver.zone_id || !payload.driver.car_brand || !payload.driver.plate) {
            status.textContent = t("profile_driver_required"); return;
          }
        }
      }
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      var save = complete ?
        (passwordField ? API.changePassword(newPassword).then(function () { return API.completeProfile(payload); }) : API.completeProfile(payload)) :
        API.updateProfile(payload);
      save.then(function (updated) {
        window.JAILAU_APP.onLogin(updated);
        if (!complete) { status.textContent = t("profile_saved"); }
      }).catch(function (err) { status.textContent = msg(err); }).finally(function () { button.disabled = false; });
    });
    if (editing) {
      container.querySelector("#password-form").addEventListener("submit", function (event) {
        event.preventDefault();
        var password = event.target.querySelector("#new-password").value;
        API.changePassword(password).then(function () {
          container.querySelector("#profile-message").textContent = t("profile_password_saved");
          event.target.reset();
        }).catch(function (err) { container.querySelector("#profile-message").textContent = msg(err); });
      });
      container.querySelectorAll("[data-placeholder]").forEach(function (button) {
        button.addEventListener("click", function () { window.JAILAU_APP.toast(t("profile_coming_soon")); });
      });
      container.querySelector("#profile-logout").addEventListener("click", window.JAILAU_APP.logout);
    }
  }
  window.JAILAU_SCREENS = window.JAILAU_SCREENS || {};
  window.JAILAU_SCREENS.profile = { render: render };
})();
