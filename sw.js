/* =========================================================
   DigiYar V6
   Service Worker
   Cache Version: 6.0.26
   ========================================================= */

const CACHE_VERSION = "digiyar-v6-6.0.26";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/v5-splash.css",
  "./css/v5-step2-header.css",
  "./css/v5-ui.css",
  "./css/v5-step4.css",
  "./css/v5-step4-toggle-direction.css",
  "./css/v5-smart-search.css",
  "./js/product-data.js",
  "./js/product-retrieval-integration.js",
  "./js/v5-catalog-adapter.js",
  "./js/v5-price-engine.js",
  "./js/v5-candidate-retrieval.js",
  "./js/v5-offer-affiliate-engine.js",
  "./js/app.js",
  "./js/platforms.js",
  "./css/v5-page-harmony.css",
  "./js/v5-ui.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_VERSION; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  event.respondWith(
    fetch(request)
      .then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            return cache.put(request, clone);
          }).catch(function () {});
        }
        return response;
      })
      .catch(function () { return caches.match(request); })
  );
});
