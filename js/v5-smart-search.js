/* DigiYar V6 — Hooshyar internal Product Search UI */
(function(){'use strict';
const hints=['چی می‌خوای بخری؟','مثلاً: گوشی سامسونگ تا ۱۵ میلیون','دنبال لپ‌تاپ مناسب می‌گردی؟','اسم محصولت رو بنویس...'];
let i=0,timer,retrievalReady=null,parserReady=null,coreReady=null,resolverReady=null;
function ensureParser(){
 if(window.DigiYarHooshyarQueryParser)return Promise.resolve();
 if(parserReady)return parserReady;
 parserReady=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=new URL('js/v6-hooshyar-query-parser.js',document.baseURI).href;s.async=false;
  s.onload=()=>window.DigiYarHooshyarQueryParser?resolve():reject(Error('Hooshyar query parser unavailable'));
  s.onerror=()=>reject(Error('Hooshyar query parser failed to load: '+s.src));document.head.appendChild(s);
 });return parserReady;
}
function ensureCore(){
 if(window.DigiYarHooshyarSearchCore)return Promise.resolve();
 if(coreReady)return coreReady;
 coreReady=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=new URL('js/v6-hooshyar-search-core.js',document.baseURI).href;s.async=false;
  s.onload=()=>window.DigiYarHooshyarSearchCore?resolve():reject(Error('Hooshyar Search Core unavailable'));
  s.onerror=()=>reject(Error('Hooshyar Search Core failed to load: '+s.src));document.head.appendChild(s);
 });return coreReady;
}
function ensureResolver(){
 const version='6.4.1';
 if(window.DigiYarHooshyarLiveResolver&&window.DigiYarHooshyarLiveResolver.version===version)return Promise.resolve();
 if(resolverReady)return resolverReady;
 resolverReady=new Promise((resolve,reject)=>{
  document.querySelectorAll('script[src*="js/v6-hooshyar-live-resolver.js"]').forEach(el=>el.remove());
  const s=document.createElement('script');s.src=new URL('js/v6-hooshyar-live-resolver.js?v='+version+'&r='+Date.now(),document.baseURI).href;s.async=false;
  s.onload=()=>window.DigiYarHooshyarLiveResolver&&window.DigiYarHooshyarLiveResolver.version===version?resolve():reject(Error('Hooshyar Live Resolver unavailable or stale'));
  s.onerror=()=>reject(Error('Hooshyar Live Resolver failed to load: '+s.src));document.head.appendChild(s);
 });return resolverReady;
}
function ensureRetrieval(){
 if(window.DigiYarProductRetrieval)return Promise.resolve();
 if(retrievalReady)return retrievalReady;
 retrievalReady=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=new URL('js/product-retrieval.js',document.baseURI).href;s.async=false;
  s.onload=()=>window.DigiYarProductRetrieval?resolve():reject(Error('Product Retrieval engine unavailable'));
  s.onerror=()=>reject(Error('Product Retrieval engine failed to load: '+s.src));document.head.appendChild(s);
 });return retrievalReady;
}
function isDirectProductUrl(url){
 const engine=window.DigiYarOfferAffiliate;if(engine&&typeof engine.isDirectProductUrl==='function')return engine.isDirectProductUrl(url);
 return /^https:\/\/(?:www\.)?(?:digikala\.com|snappshop\.ir|torobshop\.com|technolife\.com|digizo\.shop|mobile\.ir|bprshop\.com|basalam\.com|elecamp\.ir)\/(?!search(?:\/|\?|$)|category(?:\/|\?|$))/i.test(String(url||''));
}
function purchaseUrl(product){const affiliate=String(product&&product.affiliateUrl||'').trim();const direct=String(product&&product.productUrl||'').trim();return affiliate||(isDirectProductUrl(direct)?direct:'');}
function priceValue(product){const live=Number(product&&product.live&&product.live.priceToman);if(Number.isFinite(live)&&live>0)return live;const value=Number(product&&product.priceToman);if(Number.isFinite(value)&&value>0)return value;const fallback=Number(product&&product.price);return Number.isFinite(fallback)&&fallback>0?fallback:0;}
function canonicalLabel(query){if(!query)return'';const parts=[];const cat=query.taxonomy&&query.taxonomy.categoryLabel;const sub=query.taxonomy&&query.taxonomy.subcategoryLabel;const brand=query.taxonomy&&query.taxonomy.brandLabel;if(sub||cat)parts.push(sub||cat);if(brand)parts.push(brand);if(query.budget&&query.budget.max)parts.push('تا '+(query.budget.max/1000000).toLocaleString('fa-IR')+' میلیون');return parts.join(' · ')||'درخواست خرید';}
function init(){
 const form=document.getElementById('v5SmartSearchForm'),input=document.getElementById('v5SmartSearchInput'),hint=document.getElementById('v5SmartSearchHint');if(!form||!input||!hint)return;
 const stale=document.getElementById('v5SmartSearchResults');if(stale)stale.remove();hint.textContent=hints[0];
 timer=setInterval(()=>{if(!input.value.trim()){i=(i+1)%hints.length;hint.classList.remove('v5-hint-show');void hint.offsetWidth;hint.textContent=hints[i];hint.classList.add('v5-hint-show')}},2600);
 const syncHint=()=>{const hasText=!!input.value.trim();hint.style.opacity=hasText?'0':'1';hint.style.visibility=hasText?'hidden':'visible'};input.addEventListener('input',syncHint);input.addEventListener('focus',syncHint);input.addEventListener('blur',syncHint);syncHint();
 form.addEventListener('submit',async e=>{
  e.preventDefault();const q=input.value.trim();if(!q)return;hint.style.opacity='0';hint.style.visibility='hidden';const old=input.placeholder;input.placeholder='در حال جستجو در ایندکس دیجی‌یار...';input.disabled=true;
  let box=document.getElementById('v5SmartSearchResults');if(!box){box=document.createElement('div');box.id='v5SmartSearchResults';box.className='v5-smart-search-results';form.parentElement.appendChild(box)}box.innerHTML='<div class="v5-smart-search-loading">🔎 در حال جستجو در ایندکس داخلی دیجی‌یار...</div>';
  try{
   await ensureParser();const parser=window.DigiYarHooshyarQueryParser;const query=parser.parse(q);window.DigiYarHooshyarLastQuery=query;
   await ensureCore();let products=[];try{products=await window.DigiYarHooshyarSearchCore.searchIndexes(query,{limit:8});}catch(coreErr){console.warn('DigiYar Hooshyar Search Core:',coreErr);}
   if(!products.length){await ensureRetrieval();products=await DigiYarProductRetrieval.search(q,{remote:true,hooshyarQuery:query});}
   if(!products.length){box.innerHTML='<div class="v5-smart-search-empty">برای «'+esc(q)+'» فعلاً نتیجه قابل استفاده‌ای پیدا نشد.</div>';return}
   await ensureResolver();
   try{products=await window.DigiYarHooshyarLiveResolver.resolveProducts(products,{limit:8});}catch(resolveErr){console.warn('DigiYar Hooshyar Live Resolver:',resolveErr);}
   const usable=products.filter(p=>purchaseUrl(p));
   if(!usable.length){box.innerHTML='<div class="v5-smart-search-empty">برای «'+esc(q)+'» لینک مستقیم محصول پیدا نشد.</div>';return}
   box.innerHTML='<div class="v5-smart-search-result-head">نتایج هوش‌یار برای «'+esc(q)+'»<small class="v5-smart-search-canonical">درخواست تشخیص‌داده‌شده: '+esc(canonicalLabel(query))+'</small></div>'+usable.slice(0,8).map(renderProduct).join('');
  }catch(err){console.error('DigiYar Hooshyar smart search:',err);box.innerHTML='<div class="v5-smart-search-empty">اتصال به جستجوی هوش‌یار برقرار نشد. دوباره امتحان کن.</div>';
  }finally{input.disabled=false;input.placeholder=old;syncHint();}
 });
}
function renderProduct(p){const attrs=Object.entries(p.features||p.attributes||{}).slice(0,4).map(([k,v])=>esc(k)+': '+esc(v)).join(' · ');const url=purchaseUrl(p),price=priceValue(p),liveOk=!!(p.live&&p.live.ok),availability=liveOk?p.live.availability:'unknown';const storeName={digikala:'دیجی‌کالا',snappshop:'اسنپ‌شاپ',torobshop:'ترب'}[String(p.store||p.storeId||'').toLowerCase()]||'فروشگاه متصل';const category=p.category==='mobile'?'موبایل':p.category==='laptop'?'لپ‌تاپ':p.category||'محصول';const priceText=price>0?price.toLocaleString('fa-IR')+' تومان':'قیمت فعلاً در دسترس نیست';return '<article class="v5-smart-result"><div class="v5-smart-result-title">'+esc(p.name)+'</div><div class="v5-smart-result-meta">'+esc(category)+(p.brand?' · '+esc(p.brand):'')+'</div><div class="v5-smart-result-price"><strong>'+esc(priceText)+'</strong> · '+esc(storeName)+'</div><div class="v5-smart-result-meta">'+(liveOk?'قیمت زنده':price>0?'قیمت ایندکس':'قیمت زنده فعلاً قابل دریافت نیست')+' · '+(availability==='in_stock'?'موجود':availability==='out_of_stock'?'ناموجود':'موجودی نامشخص')+'</div><div class="v5-smart-result-meta">'+(attrs||'اطلاعات محصول موجود است')+'</div><a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">مشاهده و خرید</a></article>';}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
