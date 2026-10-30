const CACHE_VERSION="digiyar-v8-8.0.0-carousel-media.1";
const APP_SHELL=["./","./index.html","./manifest.json","./css/v8-base.css","./css/v8-splash.css","./css/v8-step2-header.css","./css/v8-ui.css","./css/v8-step4.css","./css/v8-step4-toggle-direction.css","./css/v8-smart-search.css","./css/v8-hooshyar.css","./css/v8-hooshyar-hero.css","./css/v8-deals-redesign.css"];
const CAROUSEL_MEDIA=["دیجی کالا.webp","تکنولایف.webp","بانی مد.webp","خانومی.webp","شهروند.webp","علی بابا.webp","مثبت سبز.webp","مدیسه.webp","اسپرت لند.webp","ایران ستکور.webp","یدک مارکت.webp","۳۰ بوک.webp","فروشگاه های بیشتر.webp"];
const MEDIA_URLS=CAROUSEL_MEDIA.flatMap(name=>["./assets/slider-photos/"+encodeURIComponent(name),"./assets/store-logos/"+encodeURIComponent(name)]);
const isRuntimeAsset=request=>{const u=new URL(request.url);return u.pathname.endsWith("/index.html")||u.pathname.endsWith("/")||u.pathname.endsWith(".js")||u.pathname.endsWith(".css")||u.pathname.endsWith(".json")};
const isCarouselMedia=request=>{const u=new URL(request.url);return u.pathname.includes("/assets/slider-photos/")||u.pathname.includes("/assets/store-logos/")};
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL.concat(MEDIA_URLS)).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
  if(isRuntimeAsset(r)){
    e.respondWith(fetch(new Request(r,{cache:"reload"})).then(res=>{if(res&&res.status===200&&res.type==="basic")caches.open(CACHE_VERSION).then(c=>c.put(r,res.clone())).catch(()=>{});return res}).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res&&res.status===200&&res.type==="basic")caches.open(CACHE_VERSION).then(c=>c.put(r,res.clone())).catch(()=>{});return res}).catch(()=>caches.match(r)));
});
