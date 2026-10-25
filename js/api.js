/* ============================================================
   Jailau — Mock API layer (SINGLE point for all data access)
   ------------------------------------------------------------
   Everything is IN-MEMORY only. No browser persistence, no network calls.
   When Supabase integration arrives, replace the internals of
   these functions with real calls; keep the same signatures so
   screens don't change.
   All functions return Promises to mimic a real async backend.
   ============================================================ */

(function () {
  "use strict";

  var t = function (key, params) { return window.I18N.t(key, params); };

  /* ---------------- In-memory database ---------------- */

  var db = {
    users: [
      { id: "u-p1", name: "Айгүл Сәрсенова", phone: "+77010000001", passwordHash: "demo1234", role: "passenger", village_id: "v-orkhovo", created_at: iso(-10) },
      { id: "u-d1", name: "Ерлан Оспанов",  phone: "+77010000002", passwordHash: "demo1234", role: "driver",    village_id: "v-orkhovo", created_at: iso(-8) },
      { id: "u-a1", name: "Админ Жайлау",   phone: "+77010000003", passwordHash: "demo1234", role: "admin",     village_id: null,        created_at: iso(-30) },
      { id: "u-d2", name: "Болат К.",       phone: "+77021112233", passwordHash: "demo1234", role: "driver",    village_id: "v-kazygurt", created_at: iso(-5) },
      { id: "u-d3", name: "Сергей П.",      phone: "+77035556677", passwordHash: "demo1234", role: "driver",    village_id: "v-kyzyldere", created_at: iso(-4) }
    ],
    driver_profiles: [
      { user_id: "u-d1", zone_id: "z-shardara", car_brand: "Hyundai Accent", plate: "560 ABC 03", seats: 4, fuel_consumption: 7.5, approval_status: "active", is_online: true, online_since: isoMinutesAgo(42) },
      { user_id: "u-d2", zone_id: "z-sayram",   car_brand: "Kia Spectra",    plate: "123 DEF 03", seats: 4, fuel_consumption: 8.0, approval_status: "pending", is_online: false, online_since: null },
      { user_id: "u-d3", zone_id: "z-kazygurt", car_brand: "ВАЗ 2107",       plate: "777 GHI 03", seats: 3, fuel_consumption: 9.5, approval_status: "active",  is_online: true,  online_since: isoMinutesAgo(15) }
    ],
    zones: [
      { id: "z-shardara", name: { ru: "Шардара", kz: "Сарыағаш" } },
      { id: "z-sayram",   name: { ru: "Сайрам",  kz: "Сайрам" } },
      { id: "z-kazygurt", name: { ru: "Казыгурт", kz: "Қазығұрт" } }
    ],
    villages: [
      { id: "v-orkhovo",   zone_id: "z-shardara", name: { ru: "Орехово",   kz: "Орехово"   }, lat: 42.8121, lng: 69.3782, km_to_city: 22 },
      { id: "v-kyzyldere", zone_id: "z-shardara", name: { ru: "Кызылдерё", kz: "Қызылдірі" }, lat: 42.8503, lng: 69.4512, km_to_city: 30 },
      { id: "v-sayram",    zone_id: "z-sayram",   name: { ru: "Сайрам",    kz: "Сайрам"    }, lat: 42.2905, lng: 69.4113, km_to_city: 35 },
      { id: "v-acbait",    zone_id: "z-sayram",   name: { ru: "Ақбай",     kz: "Ақбай"     }, lat: 42.3211, lng: 69.5021, km_to_city: 28 },
      { id: "v-kazygurt",  zone_id: "z-kazygurt", name: { ru: "Казыгурт",  kz: "Қазығұрт"  }, lat: 41.9863, lng: 69.2485, km_to_city: 65 },
      { id: "v-zertis",    zone_id: "z-kazygurt", name: { ru: "Зертіс",    kz: "Зертіс"    }, lat: 42.0124, lng: 69.3310, km_to_city: 58 }
    ],
    tariffs: [
      { village_id: "v-orkhovo",   suggested_price: 1500 },
      { village_id: "v-kyzyldere", suggested_price: 2000 },
      { village_id: "v-sayram",    suggested_price: 2500 },
      { village_id: "v-acbait",    suggested_price: 2000 },
      { village_id: "v-kazygurt",  suggested_price: 4000 },
      { village_id: "v-zertis",    suggested_price: 3500 }
    ],
    requests: [
      {
        id: "r-1", direction: "village_to_city", village_id: "v-orkhovo", pickup_spot: "у мечети",
        when: "asap", datetime: null, seats: 2, price: null, negotiable: true,
        comment: "Есть небольшой багаж", status: "open",
        passenger_id: "u-p1", driver_id: null,
        created_at: isoMinutesAgo(25), accepted_at: null, done_at: null
      },
      {
        id: "r-2", direction: "city_to_village", village_id: "v-kazygurt", pickup_spot: "",
        when: "scheduled", datetime: isoInHours(5), seats: 3, price: 4000, negotiable: false,
        comment: "", status: "open",
        passenger_id: "u-p1", driver_id: null,
        created_at: isoMinutesAgo(60), accepted_at: null, done_at: null
      },
      {
        id: "r-3", direction: "village_to_city", village_id: "v-sayram", pickup_spot: "центральный магазин",
        when: "scheduled", datetime: isoInHours(20), seats: 1, price: 2500, negotiable: false,
        comment: "Нужно утром", status: "accepted",
        passenger_id: "u-p1", driver_id: "u-d3",
        created_at: isoHoursAgo(3), accepted_at: isoHoursAgo(1), done_at: null
      }
    ],
    settings: {
      fuel_price_tenge_per_liter: 235,
      road_coefficient: 1.3,
      default_fuel_consumption: 8.0
    },
    seq: 100
  };

  /* ---------------- Helpers ---------------- */

  function iso(daysOffset) {
    var d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString();
  }
  function isoMinutesAgo(mins) {
    return new Date(Date.now() - mins * 60000).toISOString();
  }
  function isoHoursAgo(h) {
    return new Date(Date.now() - h * 3600000).toISOString();
  }
  function isoInHours(h) {
    return new Date(Date.now() + h * 3600000).toISOString();
  }
  function nextId(prefix) {
    db.seq += 1;
    return prefix + "-" + db.seq;
  }
  function delay(value, ms) {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve(value); }, ms || 120);
    });
  }
  function fail(code, ms) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () { reject(new Error(code)); }, ms || 120);
    });
  }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function publicUser(u) {
    if (!u) return null;
    return { id: u.id, name: u.name, phone: u.phone, role: u.role, village_id: u.village_id };
  }

  function findVillage(id) {
    for (var i = 0; i < db.villages.length; i++) if (db.villages[i].id === id) return db.villages[i];
    return null;
  }
  function findZone(id) {
    for (var i = 0; i < db.zones.length; i++) if (db.zones[i].id === id) return db.zones[i];
    return null;
  }
  function findUser(id) {
    for (var i = 0; i < db.users.length; i++) if (db.users[i].id === id) return db.users[i];
    return null;
  }
  function findProfile(userId) {
    for (var i = 0; i < db.driver_profiles.length; i++) if (db.driver_profiles[i].user_id === userId) return db.driver_profiles[i];
    return null;
  }
  function tariffFor(villageId) {
    for (var i = 0; i < db.tariffs.length; i++) if (db.tariffs[i].village_id === villageId) return db.tariffs[i].suggested_price;
    return null;
  }

  /* Session is in-memory ONLY (never persisted). */
  var currentUserId = null;

  /* ---------------- Auth ---------------- */

  function signUp(payload) {
    // payload: { name, phone, password, role, village_id?, driver?: {car_brand, plate, seats, fuel_consumption, zone_id} }
    var phone = String(payload.phone || "").replace(/[\s()-]/g, "");
    if (!payload.name || !phone || !payload.password) {
      return fail("err_name_required");
    }
    var exists = db.users.some(function (u) { return u.phone.replace(/[\s()-]/g, "") === phone; });
    if (exists) return fail("err_phone_exists");

    var user = {
      id: nextId("u"),
      name: payload.name,
      phone: phone,
      passwordHash: payload.password, // MOCK only — never do this in production
      role: payload.role || "passenger",
      village_id: payload.village_id || null, // passengers pick their home village here
      created_at: new Date().toISOString()
    };
    db.users.push(user);

    if (user.role === "driver") {
      var d = payload.driver || {};
      db.driver_profiles.push({
        user_id: user.id,
        zone_id: d.zone_id || db.zones[0].id,
        car_brand: d.car_brand || "—",
        plate: d.plate || "—",
        seats: d.seats || 4,
        fuel_consumption: d.fuel_consumption || db.settings.default_fuel_consumption,
        approval_status: "pending", // needs admin approval
        is_online: false,
        online_since: null
      });
    }
    currentUserId = user.id;
    return delay(publicUser(user));
  }

  function signIn(phone, password) {
    var clean = String(phone || "").replace(/[\s()-]/g, "");
    var user = db.users.find(function (u) {
      return u.phone.replace(/[\s()-]/g, "") === clean && u.passwordHash === password;
    });
    if (!user) return fail("err_login_failed");
    if (user.role === "driver") {
      var prof = findProfile(user.id);
      if (prof && prof.approval_status === "blocked") return fail("err_login_failed");
    }
    currentUserId = user.id;
    return delay(publicUser(user));
  }

  function signOut() {
    currentUserId = null;
    return delay(true);
  }

  function getCurrentUser() {
    return delay(currentUserId ? publicUser(findUser(currentUserId)) : null);
  }

  /** Let a passenger/driver pick their home village (in-memory only). */
  function setUserVillage(villageId) {
    var user = currentUserId ? findUser(currentUserId) : null;
    if (!user) return fail("error_generic");
    if (villageId && !findVillage(villageId)) return fail("err_village_required");
    user.village_id = villageId || null;
    return delay(publicUser(user));
  }

  /* ---------------- Reference data ---------------- */

  function listZonesAndVillages() {
    var zones = db.zones.map(function (z) {
      return {
        id: z.id,
        name: clone(z.name),
        villages: db.villages
          .filter(function (v) { return v.zone_id === z.id; })
          .map(function (v) {
            return {
              id: v.id, zone_id: v.zone_id, name: clone(v.name),
              lat: v.lat, lng: v.lng, km_to_city: v.km_to_city,
              suggested_price: tariffFor(v.id)
            };
          })
      };
    });
    return delay(zones);
  }

  /* ---------------- Passenger ---------------- */

  function createRequest(payload) {
    // payload: { direction, village_id, pickup_spot, when, datetime, seats, price, negotiable, comment }
    var user = currentUserId ? findUser(currentUserId) : null;
    if (!user || user.role !== "passenger") return fail("error_generic");
    if (!payload.village_id || !findVillage(payload.village_id)) return fail("err_village_required");
    var seats = parseInt(payload.seats, 10);
    if (!(seats >= 1 && seats <= 4)) return fail("err_seats_range");

    var req = {
      id: nextId("r"),
      direction: payload.direction === "city_to_village" ? "city_to_village" : "village_to_city",
      village_id: payload.village_id,
      pickup_spot: payload.pickup_spot || "",
      when: payload.when === "scheduled" ? "scheduled" : "asap",
      datetime: payload.when === "scheduled" ? payload.datetime : null,
      seats: seats,
      price: payload.negotiable ? null : parseInt(payload.price, 10) || null,
      negotiable: !!payload.negotiable,
      comment: payload.comment || "",
      status: "open",
      passenger_id: user.id,
      driver_id: null,
      created_at: new Date().toISOString(),
      accepted_at: null,
      done_at: null
    };
    if (req.negotiable) req.price = null;
    if (!req.negotiable && !(req.price > 0)) return fail("err_price_invalid");
    db.requests.unshift(req);
    return delay(clone(req));
  }

  function listMyRequests() {
    var user = currentUserId ? findUser(currentUserId) : null;
    if (!user) return delay([]);
    var mine = db.requests
      .filter(function (r) { return r.passenger_id === user.id; })
      .map(function (r) { return decorateRequest(r, "passenger"); });
    return delay(mine);
  }

  /* ---------------- Driver ---------------- */

  function listOpenRequestsForDriver(driverUserId) {
    var uid = driverUserId || currentUserId;
    var profile = uid ? findProfile(uid) : null;
    if (!profile || profile.approval_status !== "active") {
      return fail("df_need_approved");
    }
    if (!profile.is_online) return delay([]);

    var zoneVillageIds = db.villages
      .filter(function (v) { return v.zone_id === profile.zone_id; })
      .map(function (v) { return v.id; });

    var open = db.requests
      .filter(function (r) { return r.status === "open" && zoneVillageIds.indexOf(r.village_id) !== -1; })
      .map(function (r) { return decorateRequest(r, "driver"); });
    return delay(open);
  }

  function acceptRequest(requestId) {
    var uid = currentUserId;
    var profile = uid ? findProfile(uid) : null;
    if (!profile || profile.approval_status !== "active") return fail("df_need_approved");

    var req = db.requests.find(function (r) { return r.id === requestId; });
    if (!req) return fail("error_generic");
    if (req.status !== "open") return fail("df_already_taken"); // race guard
    req.status = "accepted";
    req.driver_id = uid;
    req.accepted_at = new Date().toISOString();
    return delay(decorateRequest(req, "driver-owner"));
  }

  /** Passenger cancels their own still-open request. */
  function cancelRequest(requestId) {
    var user = currentUserId ? findUser(currentUserId) : null;
    if (!user || user.role !== "passenger") return fail("error_generic");
    var req = db.requests.find(function (r) { return r.id === requestId; });
    if (!req || req.passenger_id !== user.id) return fail("error_generic");
    if (req.status !== "open") return fail("mr_cancel_not_possible");
    req.status = "cancelled";
    return delay(decorateRequest(req, "passenger"));
  }

  function releaseRequest(requestId) {
    var uid = currentUserId;
    var req = db.requests.find(function (r) { return r.id === requestId; });
    if (!req || req.driver_id !== uid) return fail("error_generic");
    if (req.status !== "accepted") return fail("error_generic");
    req.status = "open";
    req.driver_id = null;
    req.accepted_at = null;
    return delay(decorateRequest(req, "driver-owner"));
  }

  function confirmTripDone(requestId) {
    var uid = currentUserId;
    var req = db.requests.find(function (r) { return r.id === requestId; });
    if (!req || req.driver_id !== uid) return fail("error_generic");
    if (req.status !== "accepted") return fail("error_generic");
    req.status = "done";
    req.done_at = new Date().toISOString();
    return delay(decorateRequest(req, "driver-owner"));
  }

  /** Driver's own status: approval, online state, zone (no sensitive data). */
  function getDriverStatus() {
    var uid = currentUserId;
    var profile = uid ? findProfile(uid) : null;
    if (!profile) return fail("error_generic");
    var zone = findZone(profile.zone_id);
    return delay({
      is_online: !!profile.is_online,
      online_since: profile.online_since,
      approval_status: profile.approval_status,
      zone_id: profile.zone_id,
      zone_name: zone ? clone(zone.name) : null,
      car_brand: profile.car_brand,
      seats: profile.seats
    });
  }

  /** Requests this driver has accepted or completed. Passenger phone revealed (accepted by them). */
  function listDriverAcceptedRequests() {
    var uid = currentUserId;
    if (!uid) return delay([]);
    var rows = db.requests
      .filter(function (r) { return r.driver_id === uid && (r.status === "accepted" || r.status === "done"); })
      .map(function (r) { return decorateRequest(r, "driver-owner"); });
    return delay(rows);
  }

  function setDriverOnline(isOnline) {
    var uid = currentUserId;
    var profile = uid ? findProfile(uid) : null;
    if (!profile) return fail("error_generic");
    if (profile.approval_status !== "active") return fail("df_need_approved");
    profile.is_online = !!isOnline;
    profile.online_since = isOnline ? new Date().toISOString() : null;
    return delay({ is_online: profile.is_online, online_since: profile.online_since });
  }

  function listOnlineDriversByVillage(villageId) {
    var village = findVillage(villageId);
    if (!village) return delay([]);
    var drivers = db.driver_profiles
      .filter(function (p) {
        return p.is_online && p.approval_status === "active" && p.zone_id === village.zone_id;
      })
      .map(function (p) {
        var u = findUser(p.user_id);
        return {
          user_id: p.user_id,
          name: u ? u.name : "?",
          car_brand: p.car_brand,
          seats: p.seats,
          online_since: p.online_since
          // NOTE: phone intentionally NOT included (privacy until request accepted)
        };
      });
    return delay(drivers);
  }

  /* ---------------- Admin ---------------- */

  function requireAdmin() {
    var user = currentUserId ? findUser(currentUserId) : null;
    return user && user.role === "admin";
  }

  function setDriverStatus(userId, newStatus, successCode) {
    if (!requireAdmin()) return fail("error_generic");
    var profile = findProfile(userId);
    var user = findUser(userId);
    if (!profile || !user) return fail("error_generic");
    profile.approval_status = newStatus;
    if (newStatus === "blocked" || newStatus === "rejected") {
      profile.is_online = false;
      profile.online_since = null;
    }
    return delay({ ok: true, messageKey: successCode, driver: adminDriverRow(profile, user) });
  }

  function adminApproveDriver(userId) { return setDriverStatus(userId, "active", "ad_driver_approved"); }
  function adminRejectDriver(userId)  { return setDriverStatus(userId, "rejected", "ad_driver_rejected"); }
  function adminBlockDriver(userId)   { return setDriverStatus(userId, "blocked", "ad_driver_blocked"); }
  function adminUnblockDriver(userId) { return setDriverStatus(userId, "active", "ad_driver_unblocked"); }

  function adminListDrivers(statusFilter) {
    if (!requireAdmin()) return fail("error_generic");
    var rows = db.driver_profiles.map(function (p) {
      return adminDriverRow(p, findUser(p.user_id));
    }).filter(function (row) {
      if (!statusFilter || statusFilter === "all") return true;
      return row.approval_status === statusFilter;
    });
    return delay(rows);
  }

  function adminDriverRow(profile, user) {
    var zone = findZone(profile.zone_id);
    return {
      user_id: profile.user_id,
      name: user ? user.name : "?",
      phone: user ? user.phone : "?", // visible to admin only
      car_brand: profile.car_brand,
      plate: profile.plate,
      seats: profile.seats,
      fuel_consumption: profile.fuel_consumption,
      zone_id: profile.zone_id,
      zone_name: zone ? clone(zone.name) : null,
      approval_status: profile.approval_status,
      is_online: profile.is_online
    };
  }

  /* Zones / villages / tariffs / settings management (admin) */

  function adminAddZone(nameRu, nameKz) {
    if (!requireAdmin()) return fail("error_generic");
    var zone = { id: nextId("z"), name: { ru: nameRu, kz: nameKz || nameRu } };
    db.zones.push(zone);
    return delay(clone(zone));
  }

  function adminAddVillage(payload) {
    // payload: { zone_id, name_ru, name_kz, lat, lng, km_to_city }
    if (!requireAdmin()) return fail("error_generic");
    if (!findZone(payload.zone_id)) return fail("error_generic");
    var v = {
      id: nextId("v"),
      zone_id: payload.zone_id,
      name: { ru: payload.name_ru, kz: payload.name_kz || payload.name_ru },
      lat: parseFloat(payload.lat),
      lng: parseFloat(payload.lng),
      km_to_city: parseFloat(payload.km_to_city)
    };
    db.villages.push(v);
    return delay(clone(v));
  }

  function adminSetTariff(villageId, price) {
    if (!requireAdmin()) return fail("error_generic");
    var p = parseInt(price, 10);
    if (!(p > 0)) return fail("ad_err_num");
    var existing = db.tariffs.find(function (t0) { return t0.village_id === villageId; });
    if (existing) existing.suggested_price = p;
    else db.tariffs.push({ village_id: villageId, suggested_price: p });
    return delay({ ok: true });
  }

  function adminSaveSettings(payload) {
    if (!requireAdmin()) return fail("error_generic");
    var fuel = parseFloat(payload.fuel_price_tenge_per_liter);
    var coef = parseFloat(payload.road_coefficient);
    var defCons = parseFloat(payload.default_fuel_consumption);
    if (!(fuel > 0) || !(coef > 0) || !(defCons > 0)) return fail("ad_err_num");
    db.settings.fuel_price_tenge_per_liter = fuel;
    db.settings.road_coefficient = coef;
    db.settings.default_fuel_consumption = defCons;
    return delay(clone(db.settings));
  }

  function getSettings() { return delay(clone(db.settings)); }

  /* ---------------- Request decoration & privacy ---------------- */

  /**
   * Privacy rules enforced HERE (single point):
   * - passenger phone hidden from driver views until request accepted by that driver
   * - driver phone hidden from everyone except: the driver themselves and a
   *   passenger whose accepted request they hold
   */
  function decorateRequest(r, viewer) {
    var village = findVillage(r.village_id);
    var zone = village ? findZone(village.zone_id) : null;
    var passenger = findUser(r.passenger_id);
    var driver = r.driver_id ? findUser(r.driver_id) : null;
    var profile = r.driver_id ? findProfile(r.driver_id) : null;

    var out = {
      id: r.id,
      direction: r.direction,
      village_id: r.village_id,
      village_name: village ? clone(village.name) : null,
      zone_id: village ? village.zone_id : null,
      zone_name: zone ? clone(zone.name) : null,
      km_to_city: village ? village.km_to_city : null,
      suggested_tariff: tariffFor(r.village_id),
      pickup_spot: r.pickup_spot,
      when: r.when,
      datetime: r.datetime,
      seats: r.seats,
      price: r.price,
      negotiable: r.negotiable,
      comment: r.comment,
      status: r.status,
      created_at: r.created_at,
      accepted_at: r.accepted_at,
      done_at: r.done_at,
      passenger_name: passenger ? passenger.name : "?",
      passenger_phone: null, // privacy default
      driver_name: driver ? driver.name : null,
      driver_phone: null,    // privacy default
      driver_car_brand: profile ? profile.car_brand : null,
      driver_plate: profile ? profile.plate : null
    };

    if (viewer === "passenger") {
      // Passenger always sees their own phone implicitly (not returned here),
      // and driver's phone only once accepted/done by that driver.
      if (driver && (r.status === "accepted" || r.status === "done")) {
        out.driver_phone = driver.phone;
      }
    } else if (viewer === "driver") {
      // Feed view: no phones at all.
    } else if (viewer === "driver-owner") {
      // This driver has accepted it → reveal passenger phone.
      if (passenger && (r.status === "accepted" || r.status === "done") && r.driver_id === currentUserId) {
        out.passenger_phone = passenger.phone;
      }
    }
    return out;
  }

  /* ---------------- Fuel cost helper (for driver feed) ---------------- */

  function estimateFuelCost(kmToCity, fuelConsumptionPer100) {
    var s = db.settings;
    var cons = fuelConsumptionPer100 || s.default_fuel_consumption;
    var effectiveKm = kmToCity * s.road_coefficient;
    var liters = (effectiveKm * cons) / 100;
    var cost = Math.round(liters * s.fuel_price_tenge_per_liter);
    return {
      km: kmToCity,
      coefficient: s.road_coefficient,
      consumption: cons,
      fuel_price: s.fuel_price_tenge_per_liter,
      liters: Math.round(liters * 10) / 10,
      cost_tenge: cost
    };
  }

  /* ---------------- Public API ---------------- */

  window.JAILAU_API = {
    // auth
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    getCurrentUser: getCurrentUser,
    // reference
    listZonesAndVillages: listZonesAndVillages,
    getSettings: getSettings,
    setUserVillage: setUserVillage,
    // passenger
    createRequest: createRequest,
    listMyRequests: listMyRequests,
    cancelRequest: cancelRequest,
    // driver
    listOpenRequestsForDriver: listOpenRequestsForDriver,
    acceptRequest: acceptRequest,
    releaseRequest: releaseRequest,
    confirmTripDone: confirmTripDone,
    setDriverOnline: setDriverOnline,
    getDriverStatus: getDriverStatus,
    listDriverAcceptedRequests: listDriverAcceptedRequests,
    listOnlineDriversByVillage: listOnlineDriversByVillage,
    estimateFuelCost: estimateFuelCost,
    // admin
    adminApproveDriver: adminApproveDriver,
    adminRejectDriver: adminRejectDriver,
    adminBlockDriver: adminBlockDriver,
    adminUnblockDriver: adminUnblockDriver,
    adminListDrivers: adminListDrivers,
    adminAddZone: adminAddZone,
    adminAddVillage: adminAddVillage,
    adminSetTariff: adminSetTariff,
    adminSaveSettings: adminSaveSettings
  };
})();
