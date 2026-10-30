const CACHE_VERSION="digiyar-v8-8.0.0-shell.4";
const MEDIA_CACHE="digiyar-media-v1";
const APP_SHELL=["./","./index.html","./manifest.json","./css/v8-base.css","./css/v8-splash.css","./css/v8-step2-header.css","./css/v8-ui.css","./css/v8-step4.css","./css/v8-step4-toggle-direction.css","./css/v8-smart-search.css","./css/v8-hooshyar.css","./css/v8-hooshyar-hero.css","./css/v8-deals-redesign.css","./js/v8-splash.js","./assets/logos/Splash logo.png"];
const isRuntimeAsset=request=>{const u=new URL(request.url);return u.origin===self.location.origin&&(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")||u.pathname.endsWith(".js")||u.pathname.endsWith(".css")||u.pathname.endsWith(".json"))};
const isLocalImage=request=>{const u=new URL(request.url);return u.origin===self.location.origin&&/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(u.pathname)&&(u.pathname.includes("/assets/")||u.pathname.includes("/icon/"))};
const cached=request=>caches.match(request,{ignoreSearch:true});
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_VERSION).then(cache=>cache.addAll(APP_SHELL)).catch(error=>console.warn("DigiYar shell precache incomplete",error)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_VERSION&&key!==MEDIA_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).then(response=>{if(response&&response.status===200){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put("./index.html",copy)).catch(()=>{});}return response;}).catch(async()=>{return (await cached("./index.html"))||(await cached("./"))||new Response("صفحه آفلاین در دسترس نیست",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});}));
  return;
 }
 if(isLocalImage(request)){
  event.respondWith(caches.open(MEDIA_CACHE).then(async cache=>{const hit=await cache.match(request,{ignoreSearch:true});if(hit)return hit;const response=await fetch(request);if(response&&response.status===200&&response.type==="basic")await cache.put(request,response.clone());return response;}).catch(async()=>{return (await cached(request))||new Response("",{status:504});}));
  return;
 }
 if(isRuntimeAsset(request)){
  event.respondWith((async()=>{const hit=await cached(request);if(hit)return hit;try{const response=await fetch(request);if(response&&response.status===200&&response.type==="basic")await (await caches.open(CACHE_VERSION)).put(request,response.clone());return response;}catch(error){return (await cached(request))||new Response("",{status:504});}})());
  return;
 }
 event.respondWith(fetch(request).then(response=>{if(response&&response.status===200&&response.type==="basic")caches.open(CACHE_VERSION).then(cache=>cache.put(request,response.clone())).catch(()=>{});return response;}).catch(async()=>{return (await cached(request))||new Response("",{status:504});}));
});