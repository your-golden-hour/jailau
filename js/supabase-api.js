/* Supabase adapter. All ride mutations go through database RPCs. */
(function () {
  "use strict";

  var cfg = window.JAILAU_CONFIG;
  var api = window.JAILAU_API = {};
  ["signIn", "signUp", "signInWithGoogle", "getCurrentUser", "createRequest"].forEach(function (name) {
    api[name] = function () { return Promise.reject(new Error("err_backend_unavailable")); };
  });

  function validConfig() {
    try {
      var url = new URL(cfg.SUPABASE_URL);
      return url.protocol === "https:" &&
        /^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(cfg.SUPABASE_PUBLISHABLE_KEY);
    } catch (_) { return false; }
  }

  if (!validConfig()) {
    window.JAILAU_API_READY = Promise.reject(new Error("err_config"));
    return;
  }

  var client;
  var settings = { fuel_price_tenge_per_liter: 235, road_coefficient: 1.3, default_fuel_consumption: 8 };

  function codeFor(error) {
    var code = String(error && (error.code || error.message) || "");
    if (/^(df_need_approved|df_already_taken|df_no_seats|trip_too_early|mr_cancel_not_possible|err_datetime_required|err_village_required|err_seats_range|err_price_invalid|ad_err_num)$/.test(code)) return code;
    if (/phone_exists|user_already_exists|already.registered|duplicate key.*phone/i.test(code)) return "err_phone_exists";
    if (/invalid_credentials|invalid.login|invalid.grant/i.test(code)) return "err_login_failed";
    if (/email_not_confirmed|email.not.confirmed/i.test(code)) return "email_confirmation_required";
    if (/provider.*not.enabled|unsupported.provider/i.test(code)) return "google_unavailable";
    return "error_generic";
  }

  function unwrap(result) {
    if (result.error) throw new Error(codeFor(result.error));
    return result.data;
  }

  function normalizePhone(phone) { return String(phone || "").replace(/[\s()-]/g, ""); }

  async function authUser() {
    var session = unwrap(await client.auth.getSession()).session;
    if (!session) return null;
    return unwrap(await client.auth.getUser()).user;
  }

  async function ownProfile() {
    var auth = await authUser();
    if (!auth) return null;
    var row = unwrap(await client.from("users").select("id,name,phone,role,village_id").eq("id", auth.id).maybeSingle());
    if (!row) return { id: auth.id, email: auth.email || "", role: "incomplete", name: "", phone: "", provider: auth.app_metadata && auth.app_metadata.provider || "email" };
    if (row.role === "driver") {
      var driver = unwrap(await client.from("driver_profiles").select("approval_status").eq("user_id", auth.id).maybeSingle());
      if (driver && driver.approval_status === "blocked") {
        await client.auth.signOut();
        throw new Error("err_login_failed");
      }
    }
    return Object.assign({}, row, { email: auth.email || "", provider: auth.app_metadata && auth.app_metadata.provider || "email" });
  }

  async function signUp(email) {
    unwrap(await client.auth.signInWithOtp({ email: email, options: {
      shouldCreateUser: true,
      emailRedirectTo: window.location.origin + window.location.pathname
    } }));
    return { needsConfirmation: true };
  }

  async function signIn(email, password) {
    unwrap(await client.auth.signInWithPassword({ email: email, password: password }));
    return ownProfile();
  }

  async function signInWithGoogle() {
    return unwrap(await client.auth.signInWithOAuth({ provider: "google", options: {
      redirectTo: window.location.origin + window.location.pathname
    } }));
  }

  async function completeProfile(payload) {
    var phone = normalizePhone(payload.phone);
    if (!/^\+7\d{10}$/.test(phone)) throw new Error("err_phone_invalid");
    if (!payload.name || !String(payload.name).trim()) throw new Error("err_name_required");
    if (payload.role !== "passenger" && payload.role !== "driver") throw new Error("error_generic");
    if (payload.role === "driver" && (!payload.driver || !payload.driver.zone_id)) throw new Error("err_village_required");
    unwrap(await client.rpc("complete_profile", {
      p_phone: phone, p_name: String(payload.name).trim(), p_role: payload.role,
      p_village_id: payload.village_id || null,
      p_driver: payload.role === "driver" ? payload.driver : null
    }));
    return ownProfile();
  }

  async function updateProfile(payload) {
    var user = await authUser();
    if (!user) throw new Error("err_login_failed");
    var phone = normalizePhone(payload.phone);
    if (!/^\+7\d{10}$/.test(phone)) throw new Error("err_phone_invalid");
    if (!payload.name || !String(payload.name).trim()) throw new Error("err_name_required");
    unwrap(await client.from("users").update({ name: String(payload.name).trim(), phone: phone }).eq("id", user.id));
    return ownProfile();
  }

  async function changePassword(password) {
    if (String(password || "").length < 8) throw new Error("err_password_short");
    unwrap(await client.auth.updateUser({ password: password }));
    return true;
  }

  async function signOut() {
    unwrap(await client.auth.signOut());
    return true;
  }

  async function listZonesAndVillages() {
    var results = await Promise.all([
      client.from("zones").select("id,name").order("id"),
      client.from("villages").select("id,zone_id,name,lat,lng,km_to_city").order("id"),
      client.from("tariffs").select("village_id,suggested_price")
    ]);
    var zones = unwrap(results[0]);
    var villages = unwrap(results[1]);
    var tariffs = unwrap(results[2]);
    var tariffByVillage = Object.fromEntries(tariffs.map(function (row) { return [row.village_id, row.suggested_price]; }));
    return zones.map(function (zone) {
      return { id: zone.id, name: zone.name, villages: villages.filter(function (v) {
        return v.zone_id === zone.id;
      }).map(function (v) {
        return Object.assign({}, v, { suggested_price: tariffByVillage[v.id] ?? null });
      }) };
    });
  }

  async function getSettings() {
    var row = unwrap(await client.from("settings").select("fuel_price_tenge_per_liter,road_coefficient,default_fuel_consumption").eq("id", "default").single());
    settings = row;
    return row;
  }

  async function setUserVillage(villageId) {
    var user = await authUser();
    if (!user) throw new Error("err_login_failed");
    unwrap(await client.from("users").update({ village_id: villageId || null }).eq("id", user.id));
    return ownProfile();
  }

  async function listRequests(kind) {
    return unwrap(await client.rpc("list_requests", { p_kind: kind, p_limit: 100, p_offset: 0 })) || [];
  }

  async function mutationWithList(name, args, kind) {
    var id = unwrap(await client.rpc(name, args));
    var rows = await listRequests(kind);
    return rows.find(function (row) { return row.id === id; }) || { id: id };
  }

  async function createRequest(payload) {
    return mutationWithList("create_request", {
      p_direction: payload.direction, p_village_id: payload.village_id,
      p_pickup_spot: payload.pickup_spot || "", p_when: payload.when,
      p_datetime: payload.datetime || null, p_seats: payload.seats,
      p_price: payload.negotiable ? null : payload.price,
      p_negotiable: !!payload.negotiable, p_comment: payload.comment || ""
    }, "mine");
  }

  async function cancelRequest(id) { return mutationWithList("cancel_request", { p_request_id: id }, "mine"); }
  async function acceptRequest(id) { return mutationWithList("accept_request", { p_request_id: id }, "driver"); }
  async function confirmTripDone(id) { return mutationWithList("confirm_trip_done", { p_request_id: id }, "mine"); }
  async function releaseRequest(id) {
    unwrap(await client.rpc("release_request", { p_request_id: id }));
    return { id: id, status: "open" };
  }

  async function getDriverStatus() {
    var user = await authUser();
    if (!user) throw new Error("err_login_failed");
    var row = unwrap(await client.from("driver_profiles").select("user_id,zone_id,approval_status,is_online,online_since,car_brand,seats,fuel_consumption,completed_trips").eq("user_id", user.id).single());
    var zone = unwrap(await client.from("zones").select("name").eq("id", row.zone_id).single());
    await getSettings();
    return Object.assign({}, row, { zone_name: zone.name });
  }

  async function setDriverOnline(online) {
    return unwrap(await client.rpc("set_driver_online", { p_online: !!online }));
  }

  async function listOnlineDriversByVillage(villageId) {
    return unwrap(await client.rpc("list_online_drivers", { p_village_id: villageId })) || [];
  }

  function estimateFuelCost(kmToCity, consumption) {
    var km = Number(kmToCity), cons = Number(consumption || settings.default_fuel_consumption);
    if (!Number.isFinite(km) || km < 0 || !Number.isFinite(cons) || cons <= 0) throw new Error("ad_err_num");
    var coef = Number(settings.road_coefficient), price = Number(settings.fuel_price_tenge_per_liter);
    var liters = km * coef * cons / 100;
    return { km: km, coefficient: coef, consumption: cons, fuel_price: price,
      liters: Math.round(liters * 10) / 10, cost_tenge: Math.round(liters * price) };
  }

  async function adminListDrivers(filter) {
    var results = await Promise.all([
      client.from("driver_profiles").select("user_id,zone_id,car_brand,plate,seats,fuel_consumption,approval_status,is_online"),
      client.from("users").select("id,name,phone"),
      client.from("zones").select("id,name")
    ]);
    var profiles = unwrap(results[0]), users = unwrap(results[1]), zones = unwrap(results[2]);
    return profiles.filter(function (d) { return !filter || filter === "all" || d.approval_status === filter; }).map(function (d) {
      var u = users.find(function (item) { return item.id === d.user_id; });
      var z = zones.find(function (item) { return item.id === d.zone_id; });
      return Object.assign({}, d, { name: u ? u.name : "?", phone: u ? u.phone : "?", zone_name: z ? z.name : null });
    });
  }

  async function changeDriverStatus(id, status, messageKey) {
    unwrap(await client.rpc("admin_set_driver_status", { p_user_id: id, p_status: status }));
    var rows = await adminListDrivers("all");
    return { ok: true, messageKey: messageKey, driver: rows.find(function (r) { return r.user_id === id; }) };
  }

  async function adminAddZone(ru, kz) {
    return unwrap(await client.from("zones").insert({ name: { ru: ru, kz: kz } }).select("id,name").single());
  }

  async function adminAddVillage(payload) {
    return unwrap(await client.from("villages").insert({
      zone_id: payload.zone_id, name: { ru: payload.name_ru, kz: payload.name_kz },
      lat: Number(payload.lat), lng: Number(payload.lng), km_to_city: Number(payload.km_to_city)
    }).select("id,zone_id,name,lat,lng,km_to_city").single());
  }

  async function adminSetTariff(villageId, price) {
    unwrap(await client.from("tariffs").upsert({ village_id: villageId, suggested_price: Number(price) }));
    return { ok: true };
  }

  async function adminSaveSettings(payload) {
    var row = unwrap(await client.from("settings").update({
      fuel_price_tenge_per_liter: Number(payload.fuel_price_tenge_per_liter),
      road_coefficient: Number(payload.road_coefficient),
      default_fuel_consumption: Number(payload.default_fuel_consumption)
    }).eq("id", "default").select("fuel_price_tenge_per_liter,road_coefficient,default_fuel_consumption").single());
    settings = row;
    return row;
  }

  function install() {
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    Object.assign(api, {
      signUp: signUp, signIn: signIn, signInWithGoogle: signInWithGoogle,
      completeProfile: completeProfile, updateProfile: updateProfile,
      changePassword: changePassword, signOut: signOut, getCurrentUser: ownProfile,
      listZonesAndVillages: listZonesAndVillages, getSettings: getSettings,
      setUserVillage: setUserVillage, createRequest: createRequest,
      listMyRequests: function () { return listRequests("mine"); },
      cancelRequest: cancelRequest,
      listOpenRequestsForDriver: async function () {
        var status = await getDriverStatus();
        if (status.approval_status !== "active") throw new Error("df_need_approved");
        return listRequests("feed");
      },
      acceptRequest: acceptRequest, releaseRequest: releaseRequest,
      confirmTripDone: confirmTripDone, setDriverOnline: setDriverOnline,
      getDriverStatus: getDriverStatus,
      listDriverAcceptedRequests: function () { return listRequests("driver"); },
      listOnlineDriversByVillage: listOnlineDriversByVillage,
      estimateFuelCost: estimateFuelCost,
      adminApproveDriver: function (id) { return changeDriverStatus(id, "active", "ad_driver_approved"); },
      adminRejectDriver: function (id) { return changeDriverStatus(id, "rejected", "ad_driver_rejected"); },
      adminBlockDriver: function (id) { return changeDriverStatus(id, "blocked", "ad_driver_blocked"); },
      adminUnblockDriver: function (id) { return changeDriverStatus(id, "active", "ad_driver_unblocked"); },
      adminListDrivers: adminListDrivers, adminAddZone: adminAddZone,
      adminAddVillage: adminAddVillage, adminSetTariff: adminSetTariff,
      adminSaveSettings: adminSaveSettings
    });
    window.JAILAU_REAL_BACKEND_READY = true;
  }

  window.JAILAU_API_READY = new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = "vendor/supabase-js/supabase.js";
    script.onload = function () {
      try { install(); resolve(); } catch (_) { reject(new Error("err_backend_unavailable")); }
    };
    script.onerror = function () { reject(new Error("err_backend_unavailable")); };
    document.head.appendChild(script);
  });
})();
