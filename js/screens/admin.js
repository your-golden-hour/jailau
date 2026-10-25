/* ============================================================
   Jailau — Admin panel
   Exposes: window.JAILAU_SCREENS.admin.render(container)
   Tabs: drivers | zones & villages | tariffs | settings
   ============================================================ */

(function () {
  "use strict";

  var t = window.I18N.t;
  var ln = window.I18N.localizedName;
  var API = window.JAILAU_API;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var activeTab = "drivers";

  function render(container) {
    container.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';

    API.getCurrentUser().then(function (user) {
      if (!user) { window.location.hash = "#/login"; return; }
      if (user.role !== "admin") {
        container.innerHTML = '<div class="empty-state"><span class="empty-icon">⛔</span>' + esc(t("error_generic")) + '</div>';
        return;
      }

      container.innerHTML = '' +
        '<h1 class="screen-title">' + esc(t("ad_title")) + '</h1>' +
        '<div class="admin-tabs" id="admin-tabs">' +
          tabBtn("drivers", t("ad_tab_drivers")) +
          tabBtn("zones", t("ad_tab_zones")) +
          tabBtn("tariffs", t("ad_tab_tariffs")) +
          tabBtn("settings", t("ad_tab_settings")) +
        '</div>' +
        '<div id="admin-body"></div>';

      container.querySelectorAll(".admin-tab").forEach(function (btn) {
        btn.addEventListener("click", function () {
          activeTab = btn.getAttribute("data-tab");
          container.querySelectorAll(".admin-tab").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          renderTab(container);
        });
      });

      renderTab(container);
    }).catch(function () {
      container.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  function tabBtn(id, label) {
    return '<button type="button" class="admin-tab' + (id === activeTab ? " active" : "") + '" data-tab="' + id + '">' + esc(label) + '</button>';
  }

  function renderTab(container) {
    var body = container.querySelector("#admin-body");
    if (!body) return;
    if (activeTab === "drivers") renderDrivers(body);
    else if (activeTab === "zones") renderZones(body);
    else if (activeTab === "tariffs") renderTariffs(body);
    else renderSettings(body);
  }

  /* ================= DRIVERS TAB ================= */

  var driverFilter = "pending";

  function renderDrivers(body) {
    body.innerHTML =
      '<div class="seg mb-8" style="max-width:280px">' +
        '<button type="button" data-dfilter="pending" class="' + (driverFilter === "pending" ? "active" : "") + '">' + esc(t("ad_drivers_pending")) + '</button>' +
        '<button type="button" data-dfilter="all" class="' + (driverFilter === "all" ? "active" : "") + '">' + esc(t("ad_drivers_all")) + '</button>' +
      '</div>' +
      '<div id="drivers-table"><p class="muted">' + esc(t("loading")) + '</p></div>';

    body.querySelectorAll("[data-dfilter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        driverFilter = btn.getAttribute("data-dfilter");
        renderDrivers(body);
      });
    });

    loadDriverRows(body);
  }

  function statusBadgeClass(st) {
    return { pending: "badge-pending", active: "badge-active", rejected: "badge-rejected", blocked: "badge-blocked" }[st] || "badge-pending";
  }
  function statusLabel(st) {
    return { pending: t("ad_status_pending"), active: t("ad_status_active"), rejected: t("ad_status_rejected"), blocked: t("ad_status_blocked") }[st] || st;
  }

  function loadDriverRows(body) {
    API.adminListDrivers(driverFilter).then(function (rows) {
      var box = body.querySelector("#drivers-table");
      if (!box) return;
      if (!rows.length) {
        box.innerHTML = '<div class="empty-state">' + esc(t("ad_no_drivers")) + '</div>';
        return;
      }
      box.innerHTML =
        '<div class="table-wrap"><table class="data-table">' +
          '<thead><tr>' +
            '<th>' + esc(t("ad_col_name")) + '</th>' +
            '<th>' + esc(t("ad_col_phone")) + '</th>' +
            '<th>' + esc(t("ad_col_car")) + '</th>' +
            '<th>' + esc(t("ad_col_seats")) + '</th>' +
            '<th>' + esc(t("ad_col_zone")) + '</th>' +
            '<th>' + esc(t("ad_col_status")) + '</th>' +
            '<th>' + esc(t("ad_col_actions")) + '</th>' +
          '</tr></thead>' +
          '<tbody>' + rows.map(function (d) {
            var actions = "";
            if (d.approval_status === "pending") {
              actions =
                '<button class="btn btn-primary btn-sm" data-approve="' + d.user_id + '">' + esc(t("ad_approve")) + '</button> ' +
                '<button class="btn btn-danger btn-sm" data-reject="' + d.user_id + '">' + esc(t("ad_reject")) + '</button>';
            } else if (d.approval_status === "active") {
              actions = '<button class="btn btn-danger btn-sm" data-block="' + d.user_id + '">' + esc(t("ad_block")) + '</button>';
            } else if (d.approval_status === "blocked" || d.approval_status === "rejected") {
              actions = '<button class="btn btn-secondary btn-sm" data-unblock="' + d.user_id + '">' + esc(t("ad_unblock")) + '</button>';
            }
            return '<tr>' +
              '<td>' + esc(d.name) + (d.is_online ? ' <span class="badge badge-online">●</span>' : '') + '</td>' +
              '<td>' + esc(d.phone) + '</td>' +
              '<td>' + esc(d.car_brand) + '<br><span class="small muted">' + esc(d.plate) + '</span></td>' +
              '<td>' + d.seats + '</td>' +
              '<td>' + esc(d.zone_name ? ln(d.zone_name) : "—") + '</td>' +
              '<td><span class="badge ' + statusBadgeClass(d.approval_status) + '">' + esc(statusLabel(d.approval_status)) + '</span></td>' +
              '<td>' + actions + '</td>' +
            '</tr>';
          }).join("") + '</tbody></table></div>';

      bindDriverActions(box, body);
    }).catch(function () {
      var box = body.querySelector("#drivers-table");
      if (box) box.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  function bindDriverActions(box, body) {
    var ACTIONS = [
      { selector: "[data-approve]", attr: "approve", fn: API.adminApproveDriver },
      { selector: "[data-reject]",  attr: "reject",  fn: API.adminRejectDriver },
      { selector: "[data-block]",   attr: "block",   fn: API.adminBlockDriver },
      { selector: "[data-unblock]", attr: "unblock", fn: API.adminUnblockDriver }
    ];
    ACTIONS.forEach(function (a) {
      box.querySelectorAll(a.selector).forEach(function (btn) {
        btn.addEventListener("click", function () {
          btn.disabled = true;
          a.fn(btn.getAttribute(a.attr)).then(function (res) {
            window.JAILAU_APP.toast(t(res.messageKey), "success");
            loadDriverRows(body);
          }).catch(function () {
            btn.disabled = false;
            window.JAILAU_APP.toast(t("error_generic"), "error");
          });
        });
      });
    });
  }

  /* ================= ZONES & VILLAGES TAB ================= */

  function renderZones(body) {
    body.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';
    API.listZonesAndVillages().then(function (zones) {
      body.innerHTML =
        '<div class="card">' +
          '<div class="card-title">' + esc(t("ad_add_zone")) + '</div>' +
          '<form id="zone-form">' +
            '<div class="two-col">' +
              '<div class="form-field"><label class="form-label" for="z-ru">' + esc(t("ad_zone_name_ru")) + '</label><input class="form-input" id="z-ru" required></div>' +
              '<div class="form-field"><label class="form-label" for="z-kz">' + esc(t("ad_zone_name_kz")) + '</label><input class="form-input" id="z-kz"></div>' +
            '</div>' +
            '<button class="btn btn-primary btn-sm" type="submit">＋ ' + esc(t("ad_add_zone")) + '</button>' +
          '</form>' +
        '</div>' +

        zones.map(function (z) {
          return '<div class="card">' +
            '<div class="card-title">🗺️ ' + esc(ln(z.name)) + '</div>' +
            (z.villages.length
              ? '<div class="table-wrap"><table class="data-table">' +
                  '<thead><tr>' +
                    '<th>' + esc(t("ad_village_name_ru")) + ' / ' + esc(t("ad_village_name_kz")) + '</th>' +
                    '<th>' + esc(t("ad_village_lat")) + '</th>' +
                    '<th>' + esc(t("ad_village_lng")) + '</th>' +
                    '<th>' + esc(t("ad_village_km")) + '</th>' +
                  '</tr></thead><tbody>' +
                  z.villages.map(function (v) {
                    return '<tr><td>' + esc(v.name.ru) + ' / ' + esc(v.name.kz) + '</td>' +
                      '<td>' + v.lat.toFixed(4) + '</td><td>' + v.lng.toFixed(4) + '</td>' +
                      '<td>' + v.km_to_city + '</td></tr>';
                  }).join("") +
                '</tbody></table></div>'
              : '<div class="card-meta muted">—</div>') +
            '<form class="mt-8" data-village-form="' + z.id + '">' +
              '<div class="section-title small">' + esc(t("ad_add_village")) + ' → ' + esc(ln(z.name)) + '</div>' +
              '<div class="two-col">' +
                '<div class="form-field"><label class="form-label">' + esc(t("ad_village_name_ru")) + '</label><input class="form-input" name="name_ru" required></div>' +
                '<div class="form-field"><label class="form-label">' + esc(t("ad_village_name_kz")) + '</label><input class="form-input" name="name_kz"></div>' +
                '<div class="form-field"><label class="form-label">' + esc(t("ad_village_lat")) + '</label><input class="form-input" name="lat" type="number" step="0.0001" required></div>' +
                '<div class="form-field"><label class="form-label">' + esc(t("ad_village_lng")) + '</label><input class="form-input" name="lng" type="number" step="0.0001" required></div>' +
                '<div class="form-field"><label class="form-label">' + esc(t("ad_village_km")) + '</label><input class="form-input" name="km_to_city" type="number" min="1" required></div>' +
              '</div>' +
              '<button class="btn btn-secondary btn-sm" type="submit">＋ ' + esc(t("ad_add_village")) + '</button>' +
            '</form>' +
          '</div>';
        }).join("");

      body.querySelector("#zone-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var ru = body.querySelector("#z-ru").value.trim();
        var kz = body.querySelector("#z-kz").value.trim();
        if (!ru) return;
        API.adminAddZone(ru, kz).then(function () {
          window.JAILAU_APP.toast(t("ad_added"), "success");
          renderZones(body);
        }).catch(function () { window.JAILAU_APP.toast(t("error_generic"), "error"); });
      });

      body.querySelectorAll("[data-village-form]").forEach(function (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var payload = {
            zone_id: form.getAttribute("data-village-form"),
            name_ru: form.querySelector('[name="name_ru"]').value.trim(),
            name_kz: form.querySelector('[name="name_kz"]').value.trim(),
            lat: form.querySelector('[name="lat"]').value,
            lng: form.querySelector('[name="lng"]').value,
            km_to_city: form.querySelector('[name="km_to_city"]').value
          };
          if (!payload.name_ru || !payload.lat || !payload.lng || !payload.km_to_city) {
            window.JAILAU_APP.toast(t("ad_err_num"), "error");
            return;
          }
          API.adminAddVillage(payload).then(function () {
            window.JAILAU_APP.toast(t("ad_added"), "success");
            renderZones(body);
          }).catch(function () { window.JAILAU_APP.toast(t("error_generic"), "error"); });
        });
      });
    }).catch(function () {
      body.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  /* ================= TARIFFS TAB ================= */

  function renderTariffs(body) {
    body.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';
    API.listZonesAndVillages().then(function (zones) {
      var html = "";
      zones.forEach(function (z) {
        html += '<div class="card">' +
          '<div class="card-title">💰 ' + esc(t("ad_villages_of_zone", { zone: ln(z.name) })) + '</div>';
        if (!z.villages.length) html += '<div class="card-meta muted">—</div>';
        z.villages.forEach(function (v) {
          html += '<form class="switch-row" data-tariff-form="' + v.id + '">' +
            '<div>' +
              '<div style="font-weight:600">' + esc(ln(v.name)) + '</div>' +
              '<div class="small muted">' + v.km_to_city + ' ' + esc(t("km")) + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;align-items:center">' +
              '<input class="form-input" style="width:110px" type="number" min="100" step="100" name="price" value="' + (v.suggested_price != null ? v.suggested_price : "") + '" placeholder="1500">' +
              '<button class="btn btn-secondary btn-sm" type="submit">' + esc(t("ad_save_tariff")) + '</button>' +
            '</div>' +
          '</form>';
        });
        html += '</div>';
      });
      body.innerHTML = html;

      body.querySelectorAll("[data-tariff-form]").forEach(function (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var vid = form.getAttribute("data-tariff-form");
          var price = form.querySelector('[name="price"]').value;
          API.adminSetTariff(vid, price).then(function () {
            window.JAILAU_APP.toast(t("ad_tariff_saved"), "success");
          }).catch(function () {
            window.JAILAU_APP.toast(t("ad_err_num"), "error");
          });
        });
      });
    }).catch(function () {
      body.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  /* ================= SETTINGS TAB ================= */

  function renderSettings(body) {
    body.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';
    API.getSettings().then(function (s) {
      body.innerHTML =
        '<form id="settings-form" class="card">' +
          '<div class="form-field">' +
            '<label class="form-label" for="set-fuel">' + esc(t("ad_setting_fuel_price")) + '</label>' +
            '<input class="form-input" id="set-fuel" name="fuel" type="number" min="1" step="1" value="' + s.fuel_price_tenge_per_liter + '">' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="form-label" for="set-coef">' + esc(t("ad_setting_road_coef")) + '</label>' +
            '<input class="form-input" id="set-coef" name="coef" type="number" min="1" step="0.05" value="' + s.road_coefficient + '">' +
            '<div class="form-hint">1.3 = +30% к расстоянию за бездорожье/гравий</div>' +
          '</div>' +
          '<div class="form-field">' +
            '<label class="form-label" for="set-cons">' + esc(t("ad_setting_fuel_default")) + '</label>' +
            '<input class="form-input" id="set-cons" name="cons" type="number" min="1" step="0.5" value="' + s.default_fuel_consumption + '">' +
          '</div>' +
          '<button class="btn btn-primary btn-block" type="submit">' + esc(t("save")) + '</button>' +
        '</form>';

      body.querySelector("#settings-form").addEventListener("submit", function (e) {
        e.preventDefault();
        API.adminSaveSettings({
          fuel_price_tenge_per_liter: body.querySelector("#set-fuel").value,
          road_coefficient: body.querySelector("#set-coef").value,
          default_fuel_consumption: body.querySelector("#set-cons").value
        }).then(function () {
          window.JAILAU_APP.toast(t("ad_settings_saved"), "success");
        }).catch(function () {
          window.JAILAU_APP.toast(t("ad_err_num"), "error");
        });
      });
    }).catch(function () {
      body.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  window.JAILAU_SCREENS = window.JAILAU_SCREENS || {};
  window.JAILAU_SCREENS.admin = { render: render };
})();
