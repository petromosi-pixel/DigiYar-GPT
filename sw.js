/* =========================================================
   DigiYar V6
   Service Worker
   Cache Version: 6.0.25
   ========================================================= */

const CACHE_VERSION = "digiyar-v6-6.0.25";

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
  "./assets/store-logos/%D9%86%D8%B4%D8%A7%D8%B7%20%D8%B1%D8%AE.webp",
  "./assets/store-logos/%D9%85%D8%AB%D8%A8%D8%AA%20%D8%B3%D8%A8%D8%B2.webp",
  "./assets/store-logos/%D8%B4%D8%A7%D9%88%D8%A7%D8%B2.webp",
  "./assets/store-logos/%D8%AC%DB%8C%D9%86%20%D9%88%D8%B3%D8%AA.webp",
  "./assets/store-logos/%D8%A7%DB%8C%D8%B3%D9%85%DB%8C%D9%86%D8%A7%D8%B1.webp",
  "./assets/store-logos/%D8%B3%D9%81%D8%B1%20%D9%85%DB%8C.webp",
  "./assets/store-logos/%D8%A8%D9%87%20%D8%B1%D9%88%D8%B2%20%DA%A9%D8%A7%D9%84%D8%A7.webp",
  "./assets/store-logos/%D9%85%DA%A9%D8%AA%D8%A8%20%D8%AE%D9%88%D9%86%D9%87.webp",
  "./assets/store-logos/%D8%AF%D8%A7%D8%B1%D9%88%D8%AE%D8%A7%D9%86%D9%87%20%D8%A2%D9%86%D9%84%D8%A7%DB%8C%D9%86.webp",
  "./assets/store-logos/%DA%AF%D9%88%D8%B4%DB%8C%20%D8%B4%D8%A7%D9%BE.webp",
  "./assets/store-logos/%DA%A9%D8%A7%D8%B1%D9%86%D8%A7%D9%85%D9%87.webp",
  "./assets/store-logos/%D8%AA%DA%A9%D9%86%D9%88%D9%84%D8%A7%DB%8C%D9%81.webp",
  "./assets/store-logos/%D8%B3%D9%88%D9%84%D9%88%20%DA%A9%D8%A7%D9%84%D8%A7.webp"
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
