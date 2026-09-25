/* DigiYar V6 — Hooshyar simulated store browser */
(function(){
'use strict';
const VERSION='6.0.0-store-browser.18';
const SEARCH={
 torob:q=>'https://torob.com/search/?query='+encodeURIComponent(q),basalam:q=>'https://basalam.com/search?q='+encodeURIComponent(q),esam:q=>'https://esam.ir/search/?kw='+encodeURIComponent(q), digikala:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(q),snappshop:q=>'https://snappshop.ir/search?query='+encodeURIComponent(q),technolife:q=>'https://www.technolife.com/product/list/search?keywords='+encodeURIComponent(q),digido:q=>'https://www.digido.ir/search?s='+encodeURIComponent(q),gooshishop:q=>'https://gooshishop.com/search?q='+encodeURIComponent(q),berozkala:q=>'https://berozkala.com/search?q='+encodeURIComponent(q),janebi:q=>'https://janebi.com/search?q='+encodeURIComponent(q),khanoumi:q=>'https://www.khanoumi.com/search?q='+encodeURIComponent(q),banimode:q=>'https://www.banimode.com/search?q='+encodeURIComponent(q),modiseh:q=>'https://www.modiseh.com/search?q='+encodeURIComponent(q),pinket:q=>'https://pinket.com/search?q='+encodeURIComponent(q),solokala:q=>'https://solokala.com/search?q='+encodeURIComponent(q)
};
const HOME={digikala:'https://www.digikala.com/',snappshop:'https://snappshop.ir/',torob:'https://torob.com/',basalam:'https://basalam.com/',technolife:'https://www.technolife.ir/',digido:'https://digido.ir/',gooshishop:'https://gooshishop.com/',berozkala:'https://berozkala.com/',janebi:'https://janebi.com/',khanoumi:'https://khanoumi.com/',banimode:'https://banimode.com/',modiseh:'https://modiseh.com/',esam:'https://esam.ir/',pinket:'https://pinket.com/',solokala:'https://solokala.com/'};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function affiliateUrl(storeId,url){
 const campaigns={digikala:'https://aflo.ir/TrvNHEN8'};
 const base=campaigns[String(storeId||'').toLowerCase()];
 return base&&url?base+'?p='+encodeURIComponent(url):url;
}
function storeSearchQuery(q){
 let s=String(q||'').trim();
 s=s.replace(/(?:از\s*)?\d[\d۰-۹.,]*\s*(?:تا|الی|-)?\s*\d[\d۰-۹.,]*\s*(?:میلیون|م|هزار|تومان|ریال)\s*(?:تومان|ریال)?/gi,' ');
 s=s.replace(/(?:تا|زیر|حدود|حداکثر|حداقل)\s*\d[\d۰-۹.,]*\s*(?:میلیون|م|هزار|تومان|ریال)?/gi,' ');
 s=s.replace(/\b(?:برای|جهت)\s+(?:محل\s+کار|کار|خانه|خونه|دفتر|استفاده|دانشگاه|دانشجویی|بازی|گیم|عکاسی|فیلم|اداری)\b/gi,' ');
 s=s.replace(/\s+/g,' ').replace(/[،,؛;]+/g,' ').trim();
 var hit=window.DigiYarStoreEligibility&&typeof window.DigiYarStoreEligibility.domainForQuery==='function'
   ? window.DigiYarStoreEligibility.domainForQuery(s) : null;
 var requestedAccessory=/\b(?:لوازم\s*جانبی|اکسسوری|قاب|کاور|گلس|شارژر|کابل|پاوربانک|هندزفری|هدفون|کیف|پایه|محافظ)\b/i.test(s);
 var strict={
   digital:['لوازم جانبی','اکسسوری','قاب','کاور','گلس','شارژر','کابل','پاوربانک','هندزفری','هدفون','پایه','محافظ'],
   home:['دکوراتیو','اکسسوری'],
   beauty:['هدیه'],
   furniture:['دکوراتیو','اکسسوری'],
   computer:['کیف','کوله','ماوس','کیبورد','پایه','هاب'],
   av:['کابل','ریموت','پایه','محافظ'],
   auto:['اسپری','شوینده','خوشبوکننده'],
   sports:['پوشاک','اکسسوری'],
   kids:['پوشاک','اکسسوری'],
   books:['هدیه','اکسسوری']
 };
 var terms=hit&&strict[hit.domain];
 if(terms&&!requestedAccessory){
   s+=' '+terms.map(function(x){return '-'+x}).join(' ');
 }
 return s||String(q||'').trim();
}
function stores(){const a=window.DigiYarPopularAffiliateStores;if(Array.isArray(a)&&a.length)return a.filter(x=>x&&x.id&&x.name);const s=document.getElementById('storeSelect');return s?Array.from(s.options).filter(o=>o.value&&o.value!=='all').map(o=>({id:o.value,name:o.textContent.trim()})):[];}
function style(){
 if(document.getElementById('v6-auto-store-style'))return;
 const s=document.createElement('style');s.id='v6-auto-store-style';s.textContent=`
.v6-auto-store{--v6-bg:#fff;--v6-surface:#f7f9fc;--v6-surface-2:#f3f5f8;--v6-text:#172033;--v6-muted:#596579;--v6-border:rgba(0,0,0,.12);--v6-border-soft:rgba(0,0,0,.08);--v6-accent:#2563eb;margin:0 0 12px;border:1px solid var(--v6-border);border-radius:16px;overflow:hidden;background:var(--v6-bg);color:var(--v6-text);box-shadow:0 2px 10px rgba(0,0,0,.04)}
.v6-auto-head{padding:12px;background:var(--v6-surface);font-weight:800;font-size:13px;color:var(--v6-text);text-align:center;line-height:1.9}
.v6-auto-status{text-align:center;line-height:1.9}
.v6-auto-actions{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:10px;flex-wrap:wrap}
.v6-auto-actions .v6-auto-link{margin:0!important;text-align:center}
.v6-auto-tabs{display:flex;gap:6px;padding:8px;overflow-x:auto;border-bottom:1px solid var(--v6-border-soft);background:var(--v6-bg);scrollbar-width:thin}
.v6-auto-tab{flex:0 0 auto;border:1px solid var(--v6-border);border-radius:10px;padding:7px 11px;background:var(--v6-surface-2);color:var(--v6-text);font-size:11px;font-weight:800;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}
.v6-auto-tab:hover{transform:translateY(-1px)}
.v6-auto-tab.active{background:var(--v6-accent);color:#fff;border-color:var(--v6-accent)}
.v6-auto-body{padding:10px;background:var(--v6-bg)}
.v6-auto-frame{display:block;width:100%;height:500px;border:1px solid var(--v6-border-soft);border-radius:12px;background:var(--v6-bg);color-scheme:light}
.v6-auto-status{font-size:11px;margin:6px 0;color:var(--v6-muted)}
.v6-auto-actions{display:flex;gap:7px;margin-top:7px;flex-wrap:wrap}
.v6-auto-link{display:inline-flex;padding:7px 11px;border-radius:9px;background:var(--v6-accent);color:#fff;text-decoration:none;font-size:11px;font-weight:800}
.v6-auto-home{background:var(--v6-surface-2);color:var(--v6-text)}
.v6-auto-low{opacity:.82}
/* App theme is authoritative: do not let the device/OS color scheme override it. */
html.dark .v6-auto-store,body.dark .v6-auto-store,[data-theme="dark"] .v6-auto-store{--v6-bg:#0b1220;--v6-surface:#121c2d;--v6-surface-2:#1a2639;--v6-text:#f8fafc;--v6-muted:#b7c2d3;--v6-border:rgba(255,255,255,.15);--v6-border-soft:rgba(255,255,255,.1);box-shadow:0 4px 18px rgba(0,0,0,.4)}
html.dark .v6-auto-head,body.dark .v6-auto-head,[data-theme="dark"] .v6-auto-head{color:#f8fafc}
html.dark .v6-auto-tabs,body.dark .v6-auto-tabs,[data-theme="dark"] .v6-auto-tabs{background:#0b1220}
html.dark .v6-auto-tab,body.dark .v6-auto-tab,[data-theme="dark"] .v6-auto-tab{color:#f8fafc;background:#1a2639;border-color:rgba(255,255,255,.15)}
html.dark .v6-auto-body,body.dark .v6-auto-body,[data-theme="dark"] .v6-auto-body{background:#0b1220}
html.dark .v6-auto-status,body.dark .v6-auto-status,[data-theme="dark"] .v6-auto-status{color:#b7c2d3}
html.dark .v6-auto-frame,body.dark .v6-auto-frame,[data-theme="dark"] .v6-auto-frame{color-scheme:dark}
`;document.head.appendChild(s);
}
function ensureHost(){const existing=document.getElementById('v6StoreSimulatorResults');if(existing)return existing;let anchor=document.getElementById('v5SmartSearchResults');if(!anchor){const form=document.getElementById('v5SmartSearchForm');if(!form||!form.parentNode)return null;anchor=document.createElement('div');anchor.id='v5SmartSearchResults';anchor.className='v5-smart-search-results';form.parentNode.appendChild(anchor);}const host=document.createElement('div');host.id='v6StoreSimulatorResults';host.className='v5-smart-search-results v6-store-simulator-results';anchor.parentNode.insertBefore(host,anchor.nextSibling);return host;}
function openBrowser(query,list){
 const host=ensureHost();if(!host)return;
 host.style.marginTop='11.34px';
 host.style.marginBottom='0';
 style();
 list=Array.isArray(list)?list:stores();
 if(window.DigiYarStoreEligibility&&typeof window.DigiYarStoreEligibility.storesForQuery==='function')
   list=window.DigiYarStoreEligibility.storesForQuery(query,list);
 const usable=list.filter(x=>SEARCH[x.id]);
 if(!usable.length){host.innerHTML='<div class="v6-auto-store"><div class="v6-auto-head">برای این جستجو فروشگاه دارای جستجوی مستقیم پیدا نشد.</div></div>';return host;}
 const box=document.createElement('section');box.className='v6-auto-store';
 box.innerHTML='<div class="v6-auto-head">طبق خواسته‌ات فروشگاه‌های محصول مورد نظرت رو برات لیست کردم</div>';
 const tabs=document.createElement('div');tabs.className='v6-auto-tabs';
 const body=document.createElement('div');body.className='v6-auto-body';box.append(tabs,body);host.innerHTML='';host.appendChild(box);
 let active=usable[0];
 async function render(){
   tabs.querySelectorAll('.v6-auto-tab').forEach(t=>t.classList.toggle('active',t.dataset.id===active.id));
   const searchQuery=storeSearchQuery(query);
   const u=SEARCH[active.id](searchQuery);
   body.innerHTML='<div class="v6-auto-status">با انتخاب اسم هر فروشگاه از سربرگ و لمس دکمه پایین ، نتایج ظاهر میشن</div><div class="v6-auto-actions"><a class="v6-auto-link" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(active.id,u))+'">مشاهده نتایج در '+esc(active.name)+'</a></div>';
 }
 usable.forEach(x=>{const t=document.createElement('button');t.type='button';t.className='v6-auto-tab';t.dataset.id=x.id;t.textContent=x.name;t.addEventListener('click',()=>{active=x;render();});tabs.appendChild(t);});
 render();return host;
}
window.DigiYarStoreBrowser={version:VERSION,open:openBrowser};
})();
