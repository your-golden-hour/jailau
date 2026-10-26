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
  var leaseTimer = null;

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
    if (leaseTimer) { clearInterval(leaseTimer); leaseTimer = null; }
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
          '<a class="home-phone" href="#/profile">' + esc(t("home_your_phone", { phone: user.phone })) + '</a>' +
          '<div class="feed-header">' +
            '<div id="online-box"></div>' +
            '<div class="feed-tools"><div id="online-counts" class="small muted"></div>' +
            '<button id="btn-refresh" class="btn btn-ghost btn-sm">⟳ ' + esc(t("df_manual_refresh")) + '</button></div>' +
          '</div>' +
          '<p class="refresh-note" id="refresh-note"></p>' +
          '<div id="feed-list"><p class="muted">' + esc(t("loading")) + '</p></div>';

        var currentProfile = { is_online: false, online_since: null, online_location: null,
          zoneName: "", zone_id: null, fuel_consumption: null };

        function isActive() {
          return currentProfile.is_online && currentProfile.online_since &&
            Date.now() - new Date(currentProfile.online_since).getTime() < 30 * 60 * 1000;
        }

        function renderCountdown() {
          var note = container.querySelector("#line-countdown");
          if (!note) return;
          if (!currentProfile.is_online) { note.textContent = t("df_online_off"); return; }
          var remaining = Math.max(0, Math.ceil((new Date(currentProfile.online_since).getTime() + 30 * 60 * 1000 - Date.now()) / 60000));
          if (!isActive()) {
            currentProfile.is_online = false;
            note.textContent = t("df_line_expired");
            container.querySelectorAll("[data-line-mode]").forEach(function (button) { button.classList.remove("active"); });
            return;
          }
          note.textContent = t("df_line_remaining", { minutes: remaining });
        }

        function loadCounts() {
          if (!currentProfile.zone_id) return;
          API.onlineDriverCounts(currentProfile.zone_id).then(function (counts) {
            var node = container.querySelector("#online-counts");
            if (node) node.textContent = t("df_online_counts", { village: counts.village || 0, city: counts.city || 0 });
          }).catch(function () {
            var node = container.querySelector("#online-counts");
            if (node) node.textContent = t("error_generic");
          });
        }

        function renderOnlineBox() {
          var box = container.querySelector("#online-box");
          if (!box) return;
          box.innerHTML = '' +
            '<div class="card-title">' + esc(t("df_online_toggle")) + '</div>' +
            '<div class="card-meta">' + esc(currentProfile.zoneName) + '</div>' +
            '<div class="line-modes" role="group" aria-label="' + esc(t("df_online_toggle")) + '">' +
              '<button type="button" class="line-mode' + (isActive() && currentProfile.online_location === "village" ? " active" : "") + '" data-line-mode="village">' + esc(t("df_line_village")) + '</button>' +
              '<button type="button" class="line-mode' + (isActive() && currentProfile.online_location === "city" ? " active" : "") + '" data-line-mode="city">' + esc(t("df_line_city")) + '</button>' +
            '</div>' +
            '<p id="line-countdown" class="card-meta mt-8" role="status"></p>';
          box.classList.add("card", "line-card");
          renderCountdown();
          box.querySelectorAll("[data-line-mode]").forEach(function (button) {
            button.addEventListener("click", function () {
              var mode = button.getAttribute("data-line-mode");
              var turnOn = !(isActive() && currentProfile.online_location === mode);
              box.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
              API.setDriverOnline(turnOn, mode).then(function (updated) {
                currentProfile.is_online = updated.is_online;
                currentProfile.online_since = updated.online_since;
                currentProfile.online_location = updated.online_location;
                renderOnlineBox(); loadFeed(); loadCounts();
              }).catch(function (err) {
                window.JAILAU_APP.toast(t(err && err.message || "error_generic"), "error");
                renderOnlineBox();
              });
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
                esc(isActive() ? t("df_empty") : t("df_must_be_online")) + '</div>';
              return;
            }
            list.innerHTML = requests.map(function (r) { return feedCardHtml(r, currentProfile.fuel_consumption); }).join("");
            bindFeedActions(container, list);
          }).catch(function (err) {
            if (!container.querySelector("#feed-list")) return;
          var key = err && (err.message === "df_need_approved" || err.message === "df_upgrade_required") ? err.message : "error_generic";
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
          currentProfile.online_since = status.online_since;
          currentProfile.online_location = status.online_location;
          currentProfile.zone_id = status.zone_id;
          currentProfile.fuel_consumption = status.fuel_consumption;
          currentProfile.zoneName = status.zone_name ? ln(status.zone_name) : "";
          renderOnlineBox();
          loadFeed(); loadCounts();
          clearTimer();
          refreshTimer = setInterval(function () { loadFeed(); loadCounts(); }, REFRESH_SECONDS * 1000);
          leaseTimer = setInterval(renderCountdown, 10000);
        }).catch(function (err) {
          if (!container.querySelector("#feed-list")) return;
          container.querySelector("#feed-list").innerHTML =
            '<div class="empty-state"><span class="empty-icon">⚠️</span>' +
              esc(t(err && err.message === "df_upgrade_required" ? "df_upgrade_required" : "error_generic")) + '</div>';
        });

        var refreshBtn = container.querySelector("#btn-refresh");
        if (refreshBtn) refreshBtn.addEventListener("click", function () { loadFeed(); loadCounts(); });
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
        (r.comment ? '<div class="card-meta">💬 ' + esc(r.comment) + '</div>' : "") +
        '<div class="btn-group">' +
          '<button class="btn btn-primary btn-block" data-accept="' + r.id + '">' + esc(t("df_offer")) + '</button>' +
        '</div>' +
      '</div>';
  }

  function bindFeedActions(container, list) {
    list.querySelectorAll("[data-accept]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-accept");
        btn.disabled = true;
        API.acceptRequest(id).then(function () {
          window.JAILAU_APP.toast(t("df_offered_msg"), "success");
          renderFeed(container);
        }).catch(function (err) {
          btn.disabled = false;
          var key = err && (err.message === "df_already_taken" || err.message === "df_no_seats") ? err.message : "error_generic";
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
      var offered = reqs.filter(function (r) { return r.status === "offered"; });
      var active = reqs.filter(function (r) { return r.status === "accepted"; });
      var history = reqs.filter(function (r) { return r.status === "done"; });

      var html = '<h1 class="screen-title">' + esc(t("dt_title")) + '</h1>';

      if (offered.length) {
        html += '<h2 class="section-title">' + esc(t("dt_offered")) + '</h2>';
        html += offered.map(driverTripCardHtml).join("");
      }
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
        '<span class="small muted">' + esc(t(r.status === "offered" ? "dt_waiting_offer" : "trip_waiting_passenger")) + '</span>' +
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
