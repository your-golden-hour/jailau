/* ============================================================
   Jailau — Passenger screens
   Exposes: window.JAILAU_SCREENS.passenger.renderHome(container)
            window.JAILAU_SCREENS.passenger.renderNewRequest(container)
            window.JAILAU_SCREENS.passenger.renderMyRequests(container)
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

  function fmtTimeOnly(isoStr) {
    if (!isoStr) return "";
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function statusBadgeKey(status) {
    return { open: "mr_status_open", accepted: "mr_status_accepted", done: "mr_status_done", cancelled: "mr_status_cancelled" }[status] || "mr_status_open";
  }
  function statusBadgeClass(status) {
    return { open: "badge-open", accepted: "badge-accepted", done: "badge-done", cancelled: "badge-cancelled" }[status] || "badge-open";
  }

  /* ================= HOME ================= */

  function renderHome(container) {
    container.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';

    Promise.all([API.getCurrentUser(), API.listZonesAndVillages()])
      .then(function (res) {
        var user = res[0];
        var zones = res[1];
        if (!user) { window.location.hash = "#/login"; return null; }

        var villageId = user.village_id || (zones[0] && zones[0].villages[0] ? zones[0].villages[0].id : null);

        container.innerHTML = '' +
          '<h1 class="screen-title">' + esc(t("ph_home_hello", { name: user.name })) + '</h1>' +
          '<p class="screen-subtitle">' + esc(t("ph_home_subtitle")) + '</p>' +

          '<div class="card">' +
            '<div class="form-field" style="margin-bottom:0">' +
              '<label class="form-label" for="home-village">' + esc(t("ph_village_label")) + '</label>' +
              '<select class="form-select" id="home-village"></select>' +
            '</div>' +
          '</div>' +

          '<button id="btn-new-request" class="btn btn-primary btn-block">' + esc(t("ph_create_request_cta")) + '</button>' +

          '<h2 class="section-title">' + esc(t("ph_online_drivers")) + '</h2>' +
          '<div id="drivers-list"><p class="muted">' + esc(t("loading")) + '</p></div>' +

          '<div class="privacy-note">🔒 ' + esc(t("ph_privacy_note")) + '</div>' +
          '<p class="small muted text-center mt-16">' + esc(t("legal_disclaimer")) + '</p>';

        // Village select
        var sel = container.querySelector("#home-village");
        var html = "";
        zones.forEach(function (z) {
          var group = "";
          z.villages.forEach(function (v) {
            group += '<option value="' + v.id + '"' + (v.id === villageId ? " selected" : "") + '>' + esc(ln(v.name)) + '</option>';
          });
          if (group) html += '<optgroup label="' + esc(ln(z.name)) + '">' + group + '</optgroup>';
        });
        sel.innerHTML = html;

        function loadDrivers(vid) {
          var box = container.querySelector("#drivers-list");
          if (!box) return;
          box.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';
          API.listOnlineDriversByVillage(vid).then(function (drivers) {
            if (!container.querySelector("#drivers-list")) return; // screen changed
            if (!drivers.length) {
              box.innerHTML = '<div class="empty-state"><span class="empty-icon">🚕</span>' + esc(t("ph_no_drivers")) + '</div>';
              return;
            }
            box.innerHTML = drivers.map(function (d) {
              return '' +
                '<div class="card">' +
                  '<div class="card-row">' +
                    '<div>' +
                      '<div class="card-title">👤 ' + esc(d.name) + '</div>' +
                      '<div class="card-meta">' + esc(t("ph_driver_card", { brand: esc(d.car_brand), seats: d.seats })) + '</div>' +
                      '<div class="card-meta">' + esc(t("ph_driver_since", { time: fmtTimeOnly(d.online_since) })) + '</div>' +
                    '</div>' +
                    '<span class="badge badge-online">● online</span>' +
                  '</div>' +
                '</div>';
            }).join("");
          });
        }

        sel.addEventListener("change", function () {
          API.setUserVillage(sel.value).then(function () { loadDrivers(sel.value); });
        });
        loadDrivers(villageId);

        container.querySelector("#btn-new-request").addEventListener("click", function () {
          window.location.hash = "#/passenger/new-request";
        });
      })
      .catch(function () {
        container.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
      });
  }

  /* ================= NEW REQUEST ================= */

  function renderNewRequest(container) {
    container.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';

    Promise.all([API.getCurrentUser(), API.listZonesAndVillages()])
      .then(function (res) {
        var user = res[0];
        var zones = res[1];
        if (!user) { window.location.hash = "#/login"; return; }

        var allVillages = [];
        zones.forEach(function (z) {
          z.villages.forEach(function (v) { allVillages.push({ zone: z, village: v }); });
        });
        var preselected = user.village_id || (allVillages[0] ? allVillages[0].village.id : "");

        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = today.getMonth() + 1;
        var minDate = yyyy + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (today.getDate() < 10 ? "0" + today.getDate() : today.getDate());

        container.innerHTML = '' +
          '<h1 class="screen-title">' + esc(t("nr_title")) + '</h1>' +
          '<p class="screen-subtitle">' + esc(t("nr_subtitle")) + '</p>' +

          '<form id="nr-form" class="card" novalidate>' +
            // Direction
            '<div class="form-field" data-field="direction">' +
              '<label class="form-label">' + esc(t("nr_direction")) + '</label>' +
              '<div class="radio-row">' +
                dirChip("village_to_city", t("nr_dir_to_city"), true) +
                dirChip("city_to_village", t("nr_dir_from_city"), false) +
              '</div>' +
            '</div>' +

            // Village
            '<div class="form-field" data-field="village_id">' +
              '<label class="form-label" for="nr-village">' + esc(t("nr_village")) + '</label>' +
              '<select class="form-select" id="nr-village" name="village_id">' +
                '<option value="">—</option>' +
                allVillages.map(function (x) {
                  return '<option value="' + x.village.id + '"' + (x.village.id === preselected ? " selected" : "") + '>' +
                    esc(ln(x.village.name)) + ' · ' + esc(ln(x.zone.name)) + ' · ' + x.village.km_to_city + ' ' + esc(t("km")) +
                    '</option>';
                }).join("") +
              '</select>' +
              '<div class="form-hint" id="nr-tariff-hint"></div>' +
              '<div class="form-error"></div>' +
            '</div>' +

            // Pickup spot
            '<div class="form-field">' +
              '<label class="form-label" for="nr-pickup">' + esc(t("nr_pickup")) + '</label>' +
              '<input class="form-input" id="nr-pickup" name="pickup_spot" type="text" data-i18n-placeholder="nr_pickup_placeholder">' +
            '</div>' +

            // When
            '<div class="form-field" data-field="when">' +
              '<label class="form-label">' + esc(t("nr_when")) + '</label>' +
              '<div class="seg" role="group">' +
                '<button type="button" class="active" data-when="asap">' + esc(t("nr_when_asap")) + '</button>' +
                '<button type="button" data-when="scheduled">' + esc(t("nr_when_scheduled")) + '</button>' +
              '</div>' +
            '</div>' +

            '<div id="nr-datetime" class="two-col hidden">' +
              '<div class="form-field" data-field="date">' +
                '<label class="form-label" for="nr-date">' + esc(t("nr_date")) + '</label>' +
                '<input class="form-input" id="nr-date" name="date" type="date" min="' + minDate + '">' +
                '<div class="form-error"></div>' +
              '</div>' +
              '<div class="form-field" data-field="time">' +
                '<label class="form-label" for="nr-time">' + esc(t("nr_time")) + '</label>' +
                '<input class="form-input" id="nr-time" name="time" type="time">' +
                '<div class="form-error"></div>' +
              '</div>' +
            '</div>' +

            // Seats
            '<div class="form-field" data-field="seats">' +
              '<label class="form-label">' + esc(t("nr_seats")) + '</label>' +
              '<div class="radio-row" id="nr-seats">' +
                [1, 2, 3, 4].map(function (n) {
                  return '<label class="radio-chip' + (n === 1 ? " checked" : "") + '"><input type="radio" name="seats" value="' + n + '"' + (n === 1 ? " checked" : "") + '>' + n + '</label>';
                }).join("") +
              '</div>' +
              '<div class="form-error"></div>' +
            '</div>' +

            // Price
            '<div class="form-field" data-field="price">' +
              '<label class="form-label">' + esc(t("nr_price_block")) + '</label>' +
              '<div class="seg" role="group">' +
                '<button type="button" class="active" data-price="negotiable">' + esc(t("nr_price_negotiable")) + '</button>' +
                '<button type="button" data-price="fixed">' + esc(t("nr_price_fixed")) + '</button>' +
              '</div>' +
              '<div id="nr-price-wrap" class="hidden mt-8">' +
                '<input class="form-input" id="nr-price" name="price" type="number" min="100" step="50" inputmode="numeric" placeholder="1500">' +
              '</div>' +
              '<div class="form-error"></div>' +
            '</div>' +

            // Comment
            '<div class="form-field">' +
              '<label class="form-label" for="nr-comment">' + esc(t("nr_comment")) + '</label>' +
              '<textarea class="form-textarea" id="nr-comment" name="comment" data-i18n-placeholder="nr_comment_placeholder"></textarea>' +
            '</div>' +

            '<button class="btn btn-primary btn-block" type="submit">' + esc(t("nr_submit")) + '</button>' +
          '</form>';

        window.I18N.applyAttributes(container);

        var state = { when: "asap", priceMode: "negotiable" };

        // Direction chips
        bindRadioChips(container, "direction");

        // When segment
        container.querySelectorAll('[data-when]').forEach(function (btn) {
          btn.addEventListener("click", function () {
            container.querySelectorAll('[data-when]').forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            state.when = btn.getAttribute("data-when");
            container.querySelector("#nr-datetime").classList.toggle("hidden", state.when !== "scheduled");
          });
        });

        // Price segment
        container.querySelectorAll('[data-price]').forEach(function (btn) {
          btn.addEventListener("click", function () {
            container.querySelectorAll('[data-price]').forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            state.priceMode = btn.getAttribute("data-price");
            container.querySelector("#nr-price-wrap").classList.toggle("hidden", state.priceMode !== "fixed");
          });
        });

        // Seats chips visual
        container.querySelectorAll('#nr-seats input').forEach(function (r) {
          r.addEventListener("change", function () {
            container.querySelectorAll('#nr-seats .radio-chip').forEach(function (c) { c.classList.remove("checked"); });
            r.closest(".radio-chip").classList.add("checked");
          });
        });

        // Tariff hint on village change
        var villageSel = container.querySelector("#nr-village");
        var hintEl = container.querySelector("#nr-tariff-hint");
        function updateTariffHint() {
          var found = allVillages.find(function (x) { return x.village.id === villageSel.value; });
          if (found && found.village.suggested_price != null) {
            hintEl.textContent = t("nr_price_suggested", { price: fmtMoney(found.village.suggested_price) });
            var priceInput = container.querySelector("#nr-price");
            if (state.priceMode === "fixed" && !priceInput.value) priceInput.value = found.village.suggested_price;
          } else {
            hintEl.textContent = "";
          }
        }
        villageSel.addEventListener("change", updateTariffHint);
        updateTariffHint();

        // Submit
        container.querySelector("#nr-form").addEventListener("submit", function (e) {
          e.preventDefault();
          var form = e.target;
          form.querySelectorAll(".form-field.invalid").forEach(function (f) { f.classList.remove("invalid"); });

          var ok = true;
          var direction = form.querySelector('input[name="direction"]:checked').value;
          var village_id = form.querySelector('[name="village_id"]').value;
          var seats = parseInt(form.querySelector('input[name="seats"]:checked').value, 10);
          var dateVal = form.querySelector('[name="date"]').value;
          var timeVal = form.querySelector('[name="time"]').value;
          var priceVal = parseInt(form.querySelector('[name="price"]').value, 10);

          function mark(field, key) {
            var w = form.querySelector('[data-field="' + field + '"]');
            if (w) { w.classList.add("invalid"); var er = w.querySelector(".form-error"); if (er) er.textContent = t(key); }
            ok = false;
          }

          if (!village_id) mark("village_id", "err_village_required");
          if (!(seats >= 1 && seats <= 4)) mark("seats", "err_seats_range");
          if (state.when === "scheduled" && (!dateVal || !timeVal)) mark("date", "err_datetime_required");
          if (state.priceMode === "fixed" && !(priceVal > 0)) mark("price", "err_price_invalid");
          if (!ok) return;

          var payload = {
            direction: direction,
            village_id: village_id,
            pickup_spot: form.querySelector('[name="pickup_spot"]').value.trim(),
            when: state.when,
            datetime: state.when === "scheduled" ? new Date(dateVal + "T" + timeVal).toISOString() : null,
            seats: seats,
            negotiable: state.priceMode === "negotiable",
            price: state.priceMode === "fixed" ? priceVal : null,
            comment: form.querySelector('[name="comment"]').value.trim()
          };

          API.createRequest(payload).then(function () {
            window.JAILAU_APP.toast(t("nr_created"), "success");
            window.location.hash = "#/passenger/my-requests";
          }).catch(function (err) {
            var key = err && err.message ? err.message : "error_generic";
            window.JAILAU_APP.toast(t(key) !== key ? t(key) : t("error_generic"), "error");
          });
        });
      })
      .catch(function () {
        container.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
      });
  }

  function dirChip(value, label, checked) {
    return '<label class="radio-chip' + (checked ? " checked" : "") + '">' +
      '<input type="radio" name="direction" value="' + value + '"' + (checked ? " checked" : "") + '>' +
      esc(label) + '</label>';
  }

  function bindRadioChips(container, groupName) {
    container.querySelectorAll('input[name="' + groupName + '"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var wrap = r.closest(".radio-row");
        if (!wrap) return;
        wrap.querySelectorAll(".radio-chip").forEach(function (c) { c.classList.remove("checked"); });
        r.closest(".radio-chip").classList.add("checked");
      });
    });
  }

  /* ================= MY REQUESTS ================= */

  function renderMyRequests(container) {
    container.innerHTML = '<p class="muted">' + esc(t("loading")) + '</p>';

    API.listMyRequests().then(function (reqs) {
      if (!reqs.length) {
        container.innerHTML = '' +
          '<h1 class="screen-title">' + esc(t("mr_title")) + '</h1>' +
          '<div class="empty-state"><span class="empty-icon">🧾</span>' + esc(t("mr_empty")) + '</div>' +
          '<button class="btn btn-primary btn-block mt-16" id="mr-new">' + esc(t("ph_create_request_cta")) + '</button>';
        container.querySelector("#mr-new").addEventListener("click", function () {
          window.location.hash = "#/passenger/new-request";
        });
        return;
      }

      container.innerHTML = '<h1 class="screen-title">' + esc(t("mr_title")) + '</h1>' +
        reqs.map(requestCardHtml).join("");

      container.querySelectorAll("[data-cancel]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-cancel");
          API.cancelRequest(id).then(function () {
            window.JAILAU_APP.toast(t("mr_cancelled_msg"), "success");
            renderMyRequests(container);
          }).catch(function () {
            window.JAILAU_APP.toast(t("mr_cancel_not_possible"), "error");
          });
        });
      });
    }).catch(function () {
      container.innerHTML = '<div class="empty-state">' + esc(t("error_generic")) + '</div>';
    });
  }

  function requestCardHtml(r) {
    var dirLabel = r.direction === "village_to_city" ? t("nr_dir_to_city") : t("nr_dir_from_city");
    var dirClass = r.direction === "village_to_city" ? "" : " reverse";
    var priceHtml = r.negotiable
      ? '<span class="price-tag negotiable">' + esc(t("mr_price_negotiable")) + '</span>'
      : '<span class="price-tag">' + esc(fmtMoney(r.price)) + '</span>';

    var driverBlock = "";
    if (r.driver_name) {
      driverBlock = '' +
        '<ul class="card-list">' +
          '<li>' + esc(t("mr_driver_assigned", { name: r.driver_name })) + '</li>' +
          '<li>' + esc(t("mr_driver_car", { brand: r.driver_car_brand || "—", plate: r.driver_plate || "—" })) + '</li>' +
          '<li>' + esc(r.driver_phone
            ? t("mr_contact_revealed", { phone: r.driver_phone })
            : t("mr_contact_hidden")) + '</li>' +
        '</ul>';
    }

    var cancelBtn = r.status === "open"
      ? '<button class="btn btn-danger btn-sm" data-cancel="' + r.id + '">' + esc(t("mr_btn_cancel")) + '</button>'
      : "";

    var whenText = r.when === "asap" ? t("df_when_asap") : fmtDateTime(r.datetime);

    return '' +
      '<div class="card">' +
        '<div class="card-row">' +
          '<span class="direction-badge' + dirClass + '">📍 ' + esc(dirLabel) + '</span>' +
          '<span class="badge ' + statusBadgeClass(r.status) + '">' + esc(t(statusBadgeKey(r.status))) + '</span>' +
        '</div>' +
        '<div class="card-row mt-8">' +
          '<div class="card-meta">' + esc(ln(r.village_name)) +
            (r.pickup_spot ? " · " + esc(r.pickup_spot) : "") + '</div>' +
          priceHtml +
        '</div>' +
        '<div class="card-meta mt-8">' +
          esc(whenText) + ' · ' + esc(t("mr_seats_n", { n: r.seats })) +
        '</div>' +
        (r.comment ? '<div class="card-meta">💬 ' + esc(r.comment) + '</div>' : "") +
        driverBlock +
        '<div class="card-meta small mt-8">' + esc(t("mr_created_at", { datetime: fmtDateTime(r.created_at) })) + '</div>' +
        (cancelBtn ? '<div class="btn-group">' + cancelBtn + '</div>' : "") +
      '</div>';
  }

  window.JAILAU_SCREENS = window.JAILAU_SCREENS || {};
  window.JAILAU_SCREENS.passenger = {
    renderHome: renderHome,
    renderNewRequest: renderNewRequest,
    renderMyRequests: renderMyRequests
  };
})();
