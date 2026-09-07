/* =========================================================
   DigiYar V6
   Service Worker
   Cache Version: 6.0.11
   ========================================================= */

const CACHE_VERSION = "digiyar-v6-6.0.11";

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
  "./assets/logos/logo.png",
  "./assets/v6-stores/khanoumi.svg",
  "./assets/v6-stores/banimode.svg",
  "./assets/v6-stores/modiseh.svg",
  "./assets/v6-stores/esam.svg",
  "./assets/v6-stores/pinket.svg",
  "./assets/v6-stores/darukade.svg",
  "./assets/v6-stores/darmankala.svg",
  "./assets/v6-stores/digido.svg",
  "./assets/v6-stores/janebi.svg",
  "./assets/v6-stores/takhfifan.svg",
  "./assets/v6-stores/shab.svg"
];

const STORE_LOGO_REPLACEMENTS = {
  "https://www.khanoumi.com/favicon.ico": "./assets/v6-stores/khanoumi.svg",
  "https://www.banimode.com/favicon.ico": "./assets/v6-stores/banimode.svg",
  "https://www.modiseh.com/favicon.ico": "./assets/v6-stores/modiseh.svg",
  "https://esam.ir/favicon.ico": "./assets/v6-stores/esam.svg",
  "https://pinket.com/favicon.ico": "./assets/v6-stores/pinket.svg",
  "https://darukade.com/favicon.ico": "./assets/v6-stores/darukade.svg",
  "https://darmankala.com/favicon.ico": "./assets/v6-stores/darmankala.svg",
  "https://www.digido.ir/favicon.ico": "./assets/v6-stores/digido.svg",
  "https://janebi.com/favicon.ico": "./assets/v6-stores/janebi.svg",
  "https://takhfifan.com/main-logo.svg": "./assets/v6-stores/takhfifan.svg",
  "https://www.shab.ir/favicon.ico": "./assets/v6-stores/shab.svg"
};

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

  const replacement = STORE_LOGO_REPLACEMENTS[request.url];
  if (replacement) {
    event.respondWith(
      fetch(new URL(replacement, self.location.origin))
        .then(function (response) {
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "public, max-age=31536000, immutable"
            }
          });
        })
    );
    return;
  }

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