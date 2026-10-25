/* ============================================================
   Jailau — Service Worker (offline app shell)
   Strategy:
     - Precache the static shell (HTML/CSS/JS/manifest/icon).
     - cache-first for same-origin static assets.
     - network-first with cache fallback for pages (so updates land).
   Mock data lives in memory, so offline = last loaded shell only.
   ============================================================ */

"use strict";

var CACHE_NAME = "jailau-shell-v1";

var SHELL_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/config.js",
  "./js/i18n.js",
  "./js/api.js",
  "./js/app.js",
  "./js/screens/auth.js",
  "./js/screens/passenger.js",
  "./js/screens/driver.js",
  "./js/screens/admin.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch third parties

  // Navigations: network-first, fall back to cached index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put("./index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
