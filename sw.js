const CACHE_VERSION="digiyar-v8-8.0.0-shell.3";
const MEDIA_CACHE="digiyar-media-v1";
const APP_SHELL=["./","./index.html","./manifest.json","./css/v8-base.css","./css/v8-splash.css","./css/v8-step2-header.css","./css/v8-ui.css","./css/v8-step4.css","./css/v8-step4-toggle-direction.css","./css/v8-smart-search.css","./css/v8-hooshyar.css","./css/v8-hooshyar-hero.css","./css/v8-deals-redesign.css"];
const isRuntimeAsset=request=>{const u=new URL(request.url);return u.origin===self.location.origin&&(u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")||u.pathname.endsWith(".js")||u.pathname.endsWith(".css")||u.pathname.endsWith(".json"))};
const isLocalImage=request=>{const u=new URL(request.url);return u.origin===self.location.origin&&/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(u.pathname)&&(u.pathname.includes("/assets/")||u.pathname.includes("/icon/"))};
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION&&k!==MEDIA_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
  if(isLocalImage(r)){
    e.respondWith(caches.open(MEDIA_CACHE).then(async c=>{const cached=await c.match(r);if(cached)return cached;const response=await fetch(r);if(response&&response.status===200&&response.type==="basic")await c.put(r,response.clone());return response}).catch(()=>caches.match(r)));
    return;
  }
  if(isRuntimeAsset(r)){
    e.respondWith(fetch(new Request(r,{cache:"reload"})).then(res=>{if(res&&res.status===200&&res.type==="basic")caches.open(CACHE_VERSION).then(c=>c.put(r,res.clone())).catch(()=>{});return res}).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res&&res.status===200&&res.type==="basic")caches.open(CACHE_VERSION).then(c=>c.put(r,res.clone())).catch(()=>{});return res}).catch(()=>caches.match(r)));
});
