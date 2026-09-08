/* =========================================================
   DigiYar V6
   Service Worker
   Cache Version: 6.0.14
   ========================================================= */

const CACHE_VERSION = "digiyar-v6-6.0.14";

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
  "./js/product-retrieval.js",
  "./js/price-policy.js",
  "./js/product-price-bridge.js",
  "./js/search-engine.js",
  "./js/product-scoring.js",
  "./js/smart-recommendation-engine.js",
  "./js/user-profile.js",
  "./js/need-engine.js",
  "./js/platforms.js",
  "./js/app.js",
  "./js/conversation-engine.js",
  "./js/price-policy-bridge.js",
  "./js/product-retrieval-integration.js",
  "./js/web-conversation-ui.js",
  "./js/v5-splash-fix.js",
  "./js/v5-ui.js",
  "./js/v5-step4-final.js",
  "./js/v5-step4-patch.js",
  "./js/v5-footer.js",
  "./js/v5-smart-search.js",
  "./js/v5-catalog-adapter.js",
  "./js/v5-price-engine.js",
  "./js/v5-candidate-retrieval.js",
  "./js/v5-offer-affiliate-engine.js",
  "./js/v5-price-availability-resolver.js",
  "./icon/icon-512.png",
  "./assets/logos/Splash%20logo.png",
  "./assets/store-logos/%D8%AF%DB%8C%D8%AC%DB%8C%20%DA%A9%D8%A7%D9%84%D8%A7.webp",
  "./assets/store-logos/%D8%A7%D8%B3%D9%86%D9%BE%20%D8%B4%D8%A7%D9%BE.webp",
  "./assets/store-logos/%D8%AA%D8%B1%D8%A8.webp",
  "./assets/store-logos/%D8%A8%D8%A7%D8%B3%D9%84%D8%A7%D9%85.webp",
  "./assets/store-logos/%D8%AE%D8%A7%D9%86%D9%88%D9%85%DB%8C.webp",
  "./assets/store-logos/%D8%A8%D8%A7%D9%86%DB%8C%20%D9%85%D8%AF.webp",
  "./assets/store-logos/%D8%AF%D8%B1%D9%85%D8%A7%D9%86%20%DA%A9%D8%A7%D9%84%D8%A7.webp",
  "./assets/store-logos/%D8%AF%DB%8C%D8%AC%DB%8C%20%D8%AF%D9%88.png",
  "./assets/store-logos/%D8%AC%D8%A7%D9%86%D8%A8%DB%8C.webp",
  "./assets/store-logos/%D8%AA%D8%AE%D9%81%DB%8C%D9%81%D8%A7%D9%86.webp",
  "./assets/store-logos/%D8%B4%D8%A8.webp",
  "./assets/store-logos/%D9%85%D8%AF%DB%8C%D8%B3%D9%87.webp",
  "./assets/store-logos/%D9%BE%DB%8C%D9%86%DA%A9%D8%AA.webp",
  "./assets/store-logos/%D8%A7%DB%8C%D8%B3%D8%A7%D9%85.webp",
  "./assets/store-logos/%D8%AF%D8%A7%D8%B1%D9%88%DA%A9%D8%AF%D9%87.webp"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) { return cache.addAll(APP_SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (cacheName) { return cacheName !== CACHE_VERSION; })
            .map(function (cacheName) { return caches.delete(cacheName); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

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