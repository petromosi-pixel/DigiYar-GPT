const CACHE_VERSION="digiyar-v6-6.0.30";
const APP_SHELL=["./","./index.html","./manifest.json","./css/style.css","./css/v5-splash.css","./css/v5-step2-header.css","./css/v5-ui.css","./css/v5-step4.css","./css/v5-step4-toggle-direction.css","./css/v5-smart-search.css"];
const isRuntimeAsset=request=>{const u=new URL(request.url);return u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")||u.pathname.endsWith(".js")||u.pathname.endsWith(".css")||u.pathname.endsWith(".json")};
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
  if(isRuntimeAsset(r)){
    e.respondWith(fetch(new Request(r,{cache:"reload"})).then(res=>{if(res&&res.status===200&&res.type==="basic")caches.open(CACHE_VERSION).then(c=>c.put(r,res.clone())).catch(()=>{});return res}).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res&&res.status===200&&res.type==="basic")caches.open(CACHE_VERSION).then(c=>c.put(r,res.clone())).catch(()=>{});return res}).catch(()=>caches.match(r)));
});