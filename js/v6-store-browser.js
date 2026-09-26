/* DigiYar V6 — Hooshyar simulated store browser */
(function(){
'use strict';
const VERSION='6.0.0-store-browser.29';
const SEARCH={
 torob:q=>'https://torob.com/search/?query='+encodeURIComponent(q),basalam:q=>'https://basalam.com/search?q='+encodeURIComponent(q),esam:q=>'https://esam.ir/search/?kw='+encodeURIComponent(q), digikala:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(q),snappshop:q=>'https://snappshop.ir/search?query='+encodeURIComponent(q),technolife:q=>'https://www.technolife.com/product/list/search?keywords='+encodeURIComponent(q),digido:q=>'https://www.digido.ir/search?s='+encodeURIComponent(q),gooshishop:q=>'https://gooshishop.com/search?q='+encodeURIComponent(q),berozkala:q=>'https://berozkala.com/search?q='+encodeURIComponent(q),janebi:q=>'https://janebi.com/search?q='+encodeURIComponent(q),khanoumi:q=>'https://www.khanoumi.com/search?q='+encodeURIComponent(q),banimode:q=>'https://www.banimode.com/search?q='+encodeURIComponent(q),modiseh:q=>'https://www.modiseh.com/search?q='+encodeURIComponent(q),pinket:q=>'https://pinket.com/search?q='+encodeURIComponent(q),solokala:q=>'https://solokala.com/search?q='+encodeURIComponent(q),dayan:q=>'https://dayanshop.com/search/?q='+encodeURIComponent(q),memarket:q=>'https://memarket-eshopfa.ir/?s='+encodeURIComponent(q)
};
const HOME={digikala:'https://www.digikala.com/',snappshop:'https://snappshop.ir/',torob:'https://torob.com/',basalam:'https://basalam.com/',technolife:'https://www.technolife.ir/',digido:'https://digido.ir/',gooshishop:'https://gooshishop.com/',berozkala:'https://berozkala.com/',janebi:'https://janebi.com/',khanoumi:'https://khanoumi.com/',banimode:'https://banimode.com/',modiseh:'https://modiseh.com/',esam:'https://esam.ir/',pinket:'https://pinket.com/',solokala:'https://solokala.com/'};
const CATEGORY={
 dayan:{jacket:'https://dayanshop.com/products/men-warm-jacket',knitwear:'https://dayanshop.com/products/men-knitwear',shirt:'https://dayanshop.com/products/men-shirts',tshirt:'https://dayanshop.com/products/men-tshirts',set:'https://dayanshop.com/products/men-sets',trousers:'https://dayanshop.com/products/men-trousers',hoodie:'https://dayanshop.com/products/men-sweatshirts-hoodies',sweatshirt:'https://dayanshop.com/products/men-blouse',tank:'https://dayanshop.com/products/men-tops',sport:'https://dayanshop.com/products/men-sports-shoes','ankle-boots':'https://dayanshop.com/products/men-boots',casual:'https://dayanshop.com/products/men-casual-shoes',formal:'https://dayanshop.com/products/men-formal-shoes',sandal:'https://dayanshop.com/products/men-sandals'},
 memarket:{clothes:'https://memarket24.ir/search/clothes',shirt:'https://memarket24.ir/search/shirt',knitwear:'https://memarket24.ir/search/knitwear',outfit:'https://memarket24.ir/search/outfit',couple:'https://memarket24.ir/search/couple',trousers:'https://memarket24.ir/search/trousers',tshirt:'https://memarket24.ir/search/tshirt',outwear:'https://memarket24.ir/search/outwear',coat:'https://memarket24.ir/search/coat',shoes:'https://memarket24.ir/search/shoes',boots:'https://memarket24.ir/search/boots','formal-shoes':'https://memarket24.ir/search/formal-shoes','sport-shoes':'https://memarket24.ir/search/sport-shoes','flat-shoes':'https://memarket24.ir/search/flat-shoes',college:'https://memarket24.ir/search/college',sandal:'https://memarket24.ir/search/sandal',bag:'https://memarket24.ir/search/bag',watch:'https://memarket24.ir/search/watch',jewelry:'https://memarket24.ir/search/jewelry',household:'https://memarket24.ir/search/household',digital:'https://memarket24.ir/search/digital',personal:'https://memarket24.ir/search/personal',adult:'https://memarket24.ir/search/adult',sale:'https://memarket24.ir/search/sale','one-size':'https://memarket24.ir/search/one-size'}
};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function affiliateUrl(storeId,url){
 const campaigns={digikala:'https://aflo.ir/TrvNHEN8'};
 const base=campaigns[String(storeId||'').toLowerCase()];
 return base&&url?base+'?p='+encodeURIComponent(url):url;
}
function storeSearchQuery(q){
 let s=String(q||'').trim();
 s=s.replace(/(?:از\\s*)?\\d[\\d۰-۹.,]*\\s*(?:تا|الی|-)??\\s*\\d[\\d۰-۹.,]*\\s*(?:میلیون|م|هزار|تومان|ریال)\\s*(?:تومان|ریال)?/gi,' ');
 s=s.replace(/(?:تا|زیر|حدود|حداکثر|حداقل)\\s*\\d[\\d۰-۹.,]*\\s*(?:میلیون|م|هزار|تومان|ریال)?/gi,' ');
 s=s.replace(/\\b(?:برای|جهت)\\s+(?:محل\\s+کار|کار|خانه|خونه|دفتر|استفاده|دانشگاه|دانشجویی|بازی|گیم|عکاسی|فیلم|اداری)\\b/gi,' ');
 s=s.replace(/\\s+/g,' ').replace(/[،,؛;]+/g,' ').trim();
 return s||String(q||'').trim();
}
function stores(){const a=window.DigiYarPopularAffiliateStores;if(Array.isArray(a)&&a.length)return a.filter(x=>x&&x.id&&x.name);const s=document.getElementById('storeSelect');return s?Array.from(s.options).filter(o=>o.value&&o.value!=='all').map(o=>({id:o.value,name:o.textContent.trim()})):[];}
function style(){
 if(document.getElementById('v6-auto-store-style'))return;
 const s=document.createElement('style');s.id='v6-auto-store-style';s.textContent=`
.v6-auto-processing{text-align:right;direction:rtl;margin:0 0 4px;color:var(--v6-muted);font-size:11px;line-height:1.7}.v6-auto-processing-title{font-weight:800;font-size:11px;margin-bottom:3px;color:var(--v6-text);text-align:right}.v6-auto-processing-toggle{display:flex;align-items:center;justify-content:flex-start;gap:4px;width:100%;padding:0;border:0;background:transparent;color:var(--v6-muted);font:inherit;font-weight:800;font-size:12px;line-height:1.7;text-align:right;direction:rtl;cursor:pointer}.v6-auto-processing-chevron{display:inline-block;font-size:17px;line-height:1;transition:transform .18s ease;transform:rotate(0deg)}.v6-auto-processing-toggle[aria-expanded="true"] .v6-auto-processing-chevron{transform:rotate(90deg)}.v6-auto-processing-details{display:none;margin:2px 0 0;padding:0 2px;text-align:right}.v6-auto-processing-details.is-open{display:block}.v6-auto-processing ul{display:block;margin:0;padding:0;list-style:none;text-align:right}.v6-auto-processing li{margin:2px 0;white-space:nowrap;font-size:11px;font-weight:400;opacity:.55;line-height:1.65}.v6-auto-processing-done{font-weight:800;font-size:12px;line-height:1.7;text-align:right;color:var(--v6-muted)}.v6-auto-store{margin-top:0!important}
.v6-auto-store{--v6-bg:#fff;--v6-surface:#f7f9fc;--v6-surface-2:#f3f5f8;--v6-text:#172033;--v6-muted:#596579;--v6-border:rgba(0,0,0,.12);--v6-border-soft:rgba(0,0,0,.08);--v6-accent:#2563eb;margin:0 0 12px;border:1px solid var(--v6-border);border-radius:16px;overflow:hidden;background:var(--v6-bg);color:var(--v6-text);box-shadow:0 2px 10px rgba(0,0,0,.04)}
.v6-auto-head{padding:10px 12px;background:var(--v6-surface);font-weight:800;font-size:10px;color:var(--v6-text);text-align:center;line-height:1.65;position:relative;z-index:1}
.v6-auto-status{text-align:center;line-height:1.9}
.v6-auto-actions{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:10px;flex-wrap:wrap}
.v6-auto-actions .v6-auto-link{margin:0!important;text-align:center}
.v6-auto-tabs{display:flex;gap:6px;padding:8px;overflow-x:auto;border-bottom:1px solid var(--v6-border-soft);background:var(--v6-bg);scrollbar-width:thin}
.v6-auto-tab{flex:0 0 auto;border:1px solid var(--v6-border);border-radius:10px;padding:7px 11px;background:var(--v6-surface-2);color:var(--v6-text);font-size:11px;font-weight:800;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}
.v6-auto-tab:hover{transform:translateY(-1px)}
.v6-auto-tab.active{background:var(--v6-accent);color:#fff;border-color:var(--v6-accent)}
.v6-auto-body{padding:10px;background:var(--v6-bg)}
.v6-auto-frame{display:block;width:100%;height:500px;border:1px solid var(--v6-border-soft);border-radius:12px;background:var(--v6-bg);color-scheme:light}
.v6-auto-status{font-size:11px;margin:6px 0;color:var(--v6-muted);line-height:1.7}
.v6-auto-actions{display:flex;gap:7px;margin-top:7px;flex-wrap:wrap}
.v6-auto-link{display:inline-flex;padding:7px 11px;border-radius:9px;background:var(--v6-accent);color:#fff;text-decoration:none;font-size:11px;font-weight:800}
.v6-auto-home{background:var(--v6-surface-2);color:var(--v6-text)}
.v6-auto-low{opacity:.82}
/* App theme is authoritative: do not let the device/OS color scheme override it. */
body.v6-dark .v6-auto-store{--v6-bg:#0b1220;--v6-surface:#121c2d;--v6-surface-2:#1a2639;--v6-text:#f8fafc;--v6-muted:#b7c2d3;--v6-border:rgba(255,255,255,.15);--v6-border-soft:rgba(255,255,255,.1);box-shadow:0 4px 18px rgba(0,0,0,.4)}
body.v6-dark .v6-auto-head{color:#f8fafc;background:#111827;border-color:#263449;border-radius:12px}
body.v6-dark .v6-auto-tabs{background:#0b1220;border-color:rgba(255,255,255,.1)}
body.v6-dark .v6-auto-tab{color:#f8fafc;background:#1a2639;border-color:rgba(255,255,255,.15)}
body.v6-dark .v6-auto-tab.active{background:#2563eb;color:#fff;border-color:#2563eb}
body.v6-dark .v6-auto-body{background:#0b1220;color:#f8fafc}
body.v6-dark .v6-auto-status{color:#b7c2d3}
body.v6-dark .v6-auto-link{background:#2563eb;color:#fff}
body.v6-dark .v6-auto-home{background:#1a2639;color:#f8fafc}
body.v6-dark .v6-auto-store{border-color:#263449}
html.dark .v6-auto-store,body.dark .v6-auto-store,[data-theme="dark"] .v6-auto-store{--v6-bg:#0b1220;--v6-surface:#121c2d;--v6-surface-2:#1a2639;--v6-text:#f8fafc;--v6-muted:#b7c2d3;--v6-border:rgba(255,255,255,.15);--v6-border-soft:rgba(255,255,255,.1);box-shadow:0 4px 18px rgba(0,0,0,.4)}
html.dark .v6-auto-head,body.dark .v6-auto-head,[data-theme="dark"] .v6-auto-head{color:#f8fafc}
html.dark .v6-auto-tabs,body.dark .v6-auto-tabs,[data-theme="dark"] .v6-auto-tabs{background:#0b1220}
html.dark .v6-auto-tab,body.dark .v6-auto-tab,[data-theme="dark"] .v6-auto-tab{color:#f8fafc;background:#1a2639;border-color:rgba(255,255,255,.15)}
html.dark .v6-auto-body,body.dark .v6-auto-body,[data-theme="dark"] .v6-auto-body{background:#0b1220}
html.dark .v6-auto-status,body.dark .v6-auto-status,[data-theme="dark"] .v6-auto-status{color:#b7c2d3}
html.dark .v6-auto-frame,body.dark .v6-auto-frame,[data-theme="dark"] .v6-auto-frame{color-scheme:dark}
`;document.head.appendChild(s);
}
function ensureHost(){const existing=document.getElementById('v6StoreSimulatorResults');if(existing)return existing;let anchor=document.getElementById('v5SmartSearchResults');if(!anchor){const form=document.getElementById('v5SmartSearchForm');if(!form||!form.parentNode)return null;anchor=document.createElement('div');anchor.id='v5SmartSearchResults';anchor.className='v5-smart-search-results';anchor.style.margin='0';anchor.style.minHeight='0';form.parentNode.appendChild(anchor);}const host=document.createElement('div');host.id='v6StoreSimulatorResults';host.className='v5-smart-search-results v6-store-simulator-results';anchor.parentNode.insertBefore(host,anchor.nextSibling);return host;}
function openBrowser(query,list){
 const host=ensureHost();if(!host)return;
 host.style.setProperty('margin-top','3mm','important');host.style.position='relative';host.style.zIndex='1';
 host.style.marginBottom='0';
 style();

 const messages=[
   'دارم عبارت جستجو رو دقیق‌تر تحلیل می‌کنم...',
   'دسته و نوع کالای درخواستی رو با فروشگاه‌ها تطبیق می‌دم...',
   'فروشگاه‌های نامرتبط رو کنار می‌ذارم...',
   'دارم گزینه‌های مرتبط‌تر رو برایت آماده می‌کنم...',
   'تقریباً آماده‌ست؛ نتایج مرتبط رو نمایش می‌دم...'
 ];

 const box=document.createElement('section');box.className='v6-auto-store';
 box.innerHTML='<div class="v6-auto-head">هوش‌یار در حال بررسی فروشگاه‌های مرتبط با درخواست توست...</div>';
 const body=document.createElement('div');body.className='v6-auto-body';
 box.appendChild(body);

 const processing=document.createElement('div');
 processing.className='v6-auto-processing';
 processing.setAttribute('aria-live','polite');
 processing.innerHTML='<div class="v6-auto-processing-title">هوش‌یار در حال پردازش درخواست توست...</div><div class="v6-auto-processing-details"><ul></ul></div>';
 const processingList=processing.querySelector('ul');

 function finishProcessing(onComplete){
   const savedTitle=processing.querySelector('.v6-auto-processing-title');
   const savedDetails=processing.querySelector('.v6-auto-processing-details');
   processing.innerHTML='';
   const liveBox=document.createElement('div');
   liveBox.className='v6-auto-processing-live';
   if(savedTitle)liveBox.appendChild(savedTitle);
   if(savedDetails)liveBox.appendChild(savedDetails);
   const toggle=document.createElement('button');
   toggle.type='button';
   toggle.className='v6-auto-processing-toggle';
   toggle.setAttribute('aria-expanded','false');
   toggle.innerHTML='<span class="v6-auto-processing-chevron" aria-hidden="true">›</span><span class="v6-auto-processing-done">هوش یار به مدت ۷ ثانیه پردازش کرد</span>';
   processing.appendChild(liveBox);
   processing.appendChild(toggle);
   liveBox.style.display='none';
   toggle.addEventListener('click',function(){
     const open=this.getAttribute('aria-expanded')==='true';
     this.setAttribute('aria-expanded',String(!open));
     liveBox.style.display=open?'none':'block';
   });
   if(typeof onComplete==='function')onComplete();
 }

 let processingIndex=0;
 function typeProcessingMessage(textValue,done){
   const li=document.createElement('li');
   processingList.appendChild(li);
   let charIndex=0;
   const step=function(){
     if(charIndex<textValue.length){
       li.textContent=textValue.slice(0,++charIndex);
       setTimeout(step,18);
     }else if(done)done();
   };
   step();
 }
 function showNextProcessingMessage(){
   const message=messages[processingIndex++];
   typeProcessingMessage(message,function(){
     if(processingIndex<messages.length)setTimeout(showNextProcessingMessage,120);
     else finishProcessing(renderResults);
   });
 }
 host.innerHTML='';
 host.appendChild(processing);
 host.appendChild(box);
 box.style.display='none';

 function renderResults(){
   try{
     let sourceList=Array.isArray(list)?list:stores();
     if(window.DigiYarStoreEligibility&&typeof window.DigiYarStoreEligibility.storesForQuery==='function'){
       sourceList=window.DigiYarStoreEligibility.storesForQuery(query,sourceList);
     }
     const usable=sourceList.filter(x=>x&&SEARCH[x.id]);
     if(!usable.length){
       box.style.display='block';
       box.innerHTML='<div class="v6-auto-head">برای این جستجو هنوز فروشگاه مرتبطی در فهرست دیجی‌یار شناسایی نشده.</div>';
       return;
     }
     box.style.display='block';
     tabsAndResults(usable);
   }catch(error){
     console.error('DigiYar Store Browser render:',error);
     box.style.display='block';
     box.innerHTML='<div class="v6-auto-head">در نمایش نتایج مشکلی پیش آمد؛ دوباره جستجو کن.</div>';
   }
 }


 function tabsAndResults(usable){
   box.innerHTML='<div class="v6-auto-head">طبق خواسته‌ات فروشگاه‌های مرتبط با محصول مورد نظرت رو برات لیست کردم</div>';
   const tabs=document.createElement('div');tabs.className='v6-auto-tabs';
   const resultBody=document.createElement('div');resultBody.className='v6-auto-body';
   box.append(tabs,resultBody);
   let active=usable[0];
   function render(){
     tabs.querySelectorAll('.v6-auto-tab').forEach(t=>t.classList.toggle('active',t.dataset.id===active.id));
     const searchQuery=storeSearchQuery(query);
     const sub=document.getElementById('v5Subcategory');
     const selectedSub=sub&&sub.value?String(sub.value):'';
     const categoryUrl=CATEGORY[active.id]&&CATEGORY[active.id][selectedSub];
     const u=categoryUrl||SEARCH[active.id](searchQuery);
     resultBody.innerHTML='<div class="v6-auto-status">با انتخاب اسم هر فروشگاه از سربرگ و لمس دکمه پایین، نتایج ظاهر میشن</div><div class="v6-auto-actions"><a class="v6-auto-link" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(active.id,u))+'">مشاهده نتایج در '+esc(active.name)+'</a></div>';
   }
   usable.forEach(x=>{const t=document.createElement('button');t.type='button';t.className='v6-auto-tab';t.dataset.id=x.id;t.textContent=x.name;t.addEventListener('click',()=>{active=x;render();});tabs.appendChild(t);});
   render();
 }
 return host;
}
window.DigiYarStoreBrowser={version:VERSION,open:openBrowser};
})();
