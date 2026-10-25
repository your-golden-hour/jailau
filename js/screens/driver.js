/* ============================================================
   Jailau — Driver screens
   Exposes: window.JAILAU_SCREENS.driver.renderFeed(container)
            window.JAILAU_SCREENS.driver.renderMyRequests(container)
   ============================================================ */

(function () {
  "use strict";

  var t = window.I18N.t;
  var ln = window.I18N.localizedName;
  var API = window.JAILAU_API;

  var REFRESH_SECONDS = 20;
  var refreshTimer = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmtMoney(v) {
    if (v == null) return "";
    return Number(v).toLocaleString("ru-RU") + " " + t("currency");
  }

  function fmtDateTime(isoStr) {
    if (!isoStr) return "";
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear() +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function clearTimer() {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  /* ================= FEED ================= */

  function renderFeed(container) {
    clearTimer();
    container.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';

    Promise.all([API.getCurrentUser(), API.listZonesAndVillages()])
      .then(function (res) {
        var user = res[0];
        if (!user) { window.location.hash = "#/login"; return; }

        container.innerHTML = '' +
          '<h1 class="screen-title">' + esc(t("df_title")) + '</h1>' +
          '<div class="feed-header">' +
            '<div id="online-box"></div>' +
            '<button id="btn-refresh" class="btn btn-ghost btn-sm">⟳ ' + esc(t("df_manual_refresh")) + '</button>' +
          '</div>' +
          '<p class="refresh-note" id="refresh-note"></p>' +
          '<div id="feed-list"><p class="muted">' + esc(t("loading")) + '</p></div>';

        var currentProfile = { is_online: false, zoneName: "", fuel_consumption: null };

        function renderOnlineBox(profileInfo, zoneName) {
          var box = container.querySelector("#online-box");
          if (!box) return;
          box.innerHTML = '' +
            '<div class="card-row" style="margin-bottom:0">' +
              '<div>' +
                '<div class="card-title small">' + esc(t("df_online_toggle")) + '</div>' +
                '<div class="card-meta">' + esc(zoneName ? t("df_zone_label") + ": " + zoneName : "") + '</div>' +
              '</div>' +
              '<button id="online-switch" class="switch' + (profileInfo.is_online ? " on" : "") + '" aria-label="' + esc(t("df_online_toggle")) + '"></button>' +
            '</div>' +
            '<div class="card-meta mt-8">' + esc(profileInfo.is_online ? t("df_online_on") : t("df_online_off")) + '</div>';
          box.classList.add("card");
          box.querySelector("#online-switch").addEventListener("click", function () {
            API.setDriverOnline(!currentProfile.is_online).then(function (updated) {
              currentProfile.is_online = updated.is_online;
              renderOnlineBox({ is_online: currentProfile.is_online }, currentProfile.zoneName);
              loadFeed();
            }).catch(function () {
              window.JAILAU_APP.toast(t("df_need_approved"), "error");
            });
          });
        }

        function loadFeed() {
          var list = container.querySelector("#feed-list");
          if (!list) return;
          API.listOpenRequestsForDriver().then(function (requests) {
            if (!container.querySelector("#feed-list")) { clearTimer(); return; }

            var note = container.querySelector("#refresh-note");
            if (note) note.textContent = t("df_auto_refresh", { sec: REFRESH_SECONDS });

            if (!requests.length) {
              list.innerHTML = '<div class="empty-state"><span class="empty-icon">🛰️</span>' +
                esc(currentProfile.is_online ? t("df_empty") : t("df_must_be_online")) + '</div>';
              return;
            }
            list.innerHTML = requests.map(function (r) { return feedCardHtml(r, currentProfile.fuel_consumption); }).join("");
            bindFeedActions(container, list);
          }).catch(function (err) {
            if (!container.querySelector("#feed-list")) return;
            var key = err && err.message === "df_need_approved" ? "df_need_approved" : "error_generic";
            list.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span>' + esc(t(key)) + '</div>';
          });
        }

        API.getDriverStatus().then(function (status) {
          if (!container.querySelector("#feed-list")) return;
          if (status.approval_status !== "active") {
            container.querySelector("#online-box").innerHTML =
              '<div class="privacy-note">⚠️ ' + esc(t("df_need_approved")) + '</div>';
            container.querySelector("#feed-list").innerHTML =
              '<div class="empty-state"><span class="empty-icon">⏳</span>' + esc(t("df_need_approved")) + '</div>';
            return;
          }
          currentProfile.is_online = status.is_online;
          currentProfile.fuel_consumption = status.fuel_consumption;
          currentProfile.zoneName = status.zone_name ? ln(status.zone_name) : "";
          renderOnlineBox({ is_online: currentProfile.is_online }, currentProfile.zoneName);
          loadFeed();
          clearTimer();
          refreshTimer = setInterval(loadFeed, REFRESH_SECONDS * 1000);
        }).catch(function () {
          if (!container.querySelector("#feed-list")) return;
          container.querySelector("#feed-list").innerHTML =
            '<div class="empty-state"><span class="empty-icon">⚠️</span>' + esc(t("df_need_approved")) + '</div>';
        });

        var refreshBtn = container.querySelector("#btn-refresh");
        if (refreshBtn) refreshBtn.addEventListener("click", function () { loadFeed(); });
      })
      .catch(function () {
        container.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
      });
  }

  function feedCardHtml(r, consumption) {
    var dirLabel = r.direction === "village_to_city" ? t("df_direction_to_city") : t("df_direction_from_city");
    var dirClass = r.direction === "village_to_city" ? "" : " reverse";
    var whenText = r.when === "asap" ? t("df_when_asap") : fmtDateTime(r.datetime);
    var priceHtml = r.negotiable
      ? '<span class="price-tag negotiable">' + esc(t("mr_price_negotiable")) + '</span>'
      : '<span class="price-tag">' + esc(fmtMoney(r.price)) + '</span>';

    var tariffHtml = r.suggested_tariff != null
      ? '<div class="tariff-hint">💡 ' + esc(t("df_tariff_suggested", { price: fmtMoney(r.suggested_tariff) })) + '</div>'
      : "";

    var calc = API.estimateFuelCost(r.km_to_city || 0, consumption);
    var calcHtml = '<div class="calc-line">' + esc(t("df_calc_line", {
      km: calc.km,
      coef: calc.coefficient,
      fuel: calc.consumption,
      fuelPrice: calc.fuel_price,
      cost: calc.cost_tenge.toLocaleString("ru-RU")
    })) + '</div>';

    return '' +
      '<div class="card" data-request-id="' + r.id + '">' +
        '<div class="card-row">' +
          '<span class="direction-badge' + dirClass + '">📍 ' + esc(dirLabel) + '</span>' +
          priceHtml +
        '</div>' +
        '<div class="card-meta mt-8">🏘️ ' + esc(ln(r.village_name)) +
          (r.pickup_spot ? " · " + esc(r.pickup_spot) : "") + '</div>' +
        '<div class="card-meta">🕐 ' + esc(whenText) + ' · 👥 ' + esc(t("df_seats", { n: r.seats })) + '</div>' +
        '<div class="card-meta">👤 ' + esc(t("df_passenger", { name: r.passenger_name })) + '</div>' +
        '<div class="card-meta small muted">🔒 ' + esc(t("df_phone_hidden")) + '</div>' +
        (r.comment ? '<div class="card-meta">💬 ' + esc(r.comment) + '</div>' : "") +
        tariffHtml +
        calcHtml +
        '<div class="btn-group">' +
          '<button class="btn btn-primary btn-block" data-accept="' + r.id + '">' + esc(t("df_accept")) + '</button>' +
        '</div>' +
      '</div>';
  }

  function bindFeedActions(container, list) {
    list.querySelectorAll("[data-accept]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-accept");
        btn.disabled = true;
        API.acceptRequest(id).then(function () {
          window.JAILAU_APP.toast(t("df_accepted_msg"), "success");
          renderFeed(container);
        }).catch(function (err) {
          btn.disabled = false;
          var key = err && err.message === "df_already_taken" ? "df_already_taken" : "error_generic";
          window.JAILAU_APP.toast(t(key), "error");
          renderFeed(container);
        });
      });
    });
  }

  /* ================= MY TRIPS (driver) ================= */

  function renderMyRequests(container) {
    clearTimer();
    container.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';

    API.listDriverAcceptedRequests().then(function (reqs) {
      var active = reqs.filter(function (r) { return r.status === "accepted"; });
      var history = reqs.filter(function (r) { return r.status === "done"; });

      var html = '<h1 class="screen-title">' + esc(t("dt_title")) + '</h1>';

      html += '<h2 class="section-title">' + esc(t("dt_active")) + '</h2>';
      if (active.length) html += active.map(driverTripCardHtml).join("");
      else html += '<div class="empty-state">' + esc(t("dt_empty")) + '</div>';

      if (history.length) {
        html += '<h2 class="section-title">' + esc(t("dt_history")) + '</h2>';
        html += history.map(function (r) { return driverTripCardHtml(r, true); }).join("");
      }

      html += '<div class="privacy-note">💵 ' + esc(t("dt_payment_note")) + '</div>';
      container.innerHTML = html;

      container.querySelectorAll("[data-release]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-release");
          btn.disabled = true;
          API.releaseRequest(id).then(function () {
            window.JAILAU_APP.toast(t("df_release") + " ✓", "success");
            renderMyRequests(container);
          }).catch(function () {
            btn.disabled = false;
            window.JAILAU_APP.toast(t("error_generic"), "error");
          });
        });
      });
    }).catch(function () {
      container.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  function driverTripCardHtml(r, readonly) {
    var from = r.direction === "village_to_city" ? ln(r.village_name) : t("city_shymkent");
    var to = r.direction === "village_to_city" ? t("city_shymkent") : ln(r.village_name);
    var whenText = r.when === "asap" ? t("df_when_asap") : fmtDateTime(r.datetime);
    var priceHtml = r.negotiable
      ? '<span class="price-tag negotiable">' + esc(t("mr_price_negotiable")) + '</span>'
      : '<span class="price-tag">' + esc(fmtMoney(r.price)) + '</span>';

    var contactLine = r.passenger_phone
      ? '📞 ' + esc(t("df_phone_revealed", { phone: r.passenger_phone }))
      : '🔒 ' + esc(t("df_phone_hidden"));

    var actions = readonly ? "" : '' +
      '<div class="btn-group">' +
        '<button class="btn btn-secondary btn-sm" data-release="' + r.id + '">' + esc(t("df_release")) + '</button>' +
        '<span class="small muted">' + esc(t("trip_waiting_passenger")) + '</span>' +
      '</div>';

    return '' +
      '<div class="card">' +
        '<div class="card-row">' +
          '<div class="card-title">🚗 ' + esc(t("dt_route", { from: from, to: to })) + '</div>' +
          priceHtml +
        '</div>' +
        '<div class="card-meta">🕐 ' + esc(whenText) + ' · 👥 ' + esc(t("df_seats", { n: r.seats })) + '</div>' +
        '<div class="card-meta">👤 ' + esc(t("df_passenger", { name: r.passenger_name })) + '</div>' +
        (r.pickup_spot ? '<div class="card-meta">📍 ' + esc(r.pickup_spot) + '</div>' : "") +
        (r.comment ? '<div class="card-meta">💬 ' + esc(r.comment) + '</div>' : "") +
        '<div class="card-meta mt-8">' + contactLine + '</div>' +
        actions +
      '</div>';
  }

  window.JAILAU_SCREENS = window.JAILAU_SCREENS || {};
  window.JAILAU_SCREENS.driver = {
    renderFeed: renderFeed,
    renderMyRequests: renderMyRequests,
    clearTimers: clearTimer
  };
})();
