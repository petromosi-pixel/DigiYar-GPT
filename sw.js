const CACHE_VERSION="digiyar-v8-8.0.0-shell.104";
const MEDIA_CACHE="digiyar-media-v1";
const APP_SHELL=["./","./index.html","./manifest.json","./css/v8-base.css","./css/v8-splash.css","./css/v8-step2-header.css","./css/v8-ui.css","./css/v8-step4.css","./css/v8-step4-toggle-direction.css","./css/v8-smart-search.css","./css/v8-hooshyar.css","./css/v8-hooshyar-hero.css","./css/digiyar-theme-system.css?v=1.3.10","./css/v8-deals-redesign.css","./js/v8-splash.js?v=8.0.0-splash.4","./js/v8-menu-page.js?v=8.0.0-menu.4","./js/v8-price-watch.js?v=8.0.0-price-watch.3","./js/v8-hooshyar-input.js?v=8.0.0-hooshyar-input.10","./js/v8-product-result-source.js?v=8.0.0-product-result-source.3","./js/v8-persian-language-dictionary.js?v=1.4.0-persian-commerce-ontology","./js/v8-product-result-producer.js?v=8.0.0-product-result-producer.3","./js/v8-hooshyar-engine.js?v=8.0.0-hooshyar-engine.17","./js/v9-hooshyar-assistant.js?v=9.2.0-hooshyar-headless.2","./assets/logos/Splash logo.png"];
const isRuntimeAsset=request=>{const u=new URL(request.url);return u.origin===self.location.origin&&(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")||u.pathname.endsWith(".js")||u.pathname.endsWith(".css")||u.pathname.endsWith(".json"))};
const isLocalImage=request=>{const u=new URL(request.url);return u.origin===self.location.origin&&/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(u.pathname)&&(u.pathname.includes("/assets/")||u.pathname.includes("/icon/"))};
const cached=request=>caches.match(request);
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_VERSION).then(cache=>cache.addAll(APP_SHELL)).catch(error=>console.warn("DigiYar shell precache incomplete",error)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_VERSION&&key!==MEDIA_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request,{cache:"no-store"}).then(response=>{if(response&&response.status===200){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put("./index.html",copy)).catch(()=>{});}return response;}).catch(async()=>{return (await cached("./index.html"))||(await cached("./"))||new Response("صفحه آفلاین در دسترس نیست",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});}));
  return;
 }
 if(isLocalImage(request)){
  event.respondWith(caches.open(MEDIA_CACHE).then(async cache=>{const hit=await cache.match(request,{ignoreSearch:true});if(hit)return hit;const response=await fetch(request);if(response&&response.status===200&&response.type==="basic")await cache.put(request,response.clone());return response;}).catch(async()=>{return (await cached(request))||new Response("",{status:504});}));
  return;
 }
 if(isRuntimeAsset(request)){
  event.respondWith((async()=>{try{const response=await fetch(request,{cache:"no-store"});if(response&&response.status===200&&response.type==="basic")await (await caches.open(CACHE_VERSION)).put(request,response.clone());return response;}catch(error){return (await cached(request))||new Response("",{status:504});}})());
  return;
 }
 event.respondWith(fetch(request).then(response=>{if(response&&response.status===200&&response.type==="basic")caches.open(CACHE_VERSION).then(cache=>cache.put(request,response.clone())).catch(()=>{});return response;}).catch(async()=>{return (await cached(request))||new Response("",{status:504});}));
});