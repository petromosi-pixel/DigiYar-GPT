/* DigiYar V6 — Hooshyar simulated store browser */
(function(){
'use strict';
const VERSION='6.0.0-store-browser.13';
const SEARCH={
 digikala:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(q),snappshop:q=>'https://snappshop.ir/search?query='+encodeURIComponent(q),torob:q=>'https://torob.com/search/?query='+encodeURIComponent(q),basalam:q=>'https://basalam.com/search?q='+encodeURIComponent(q),technolife:q=>'https://www.technolife.ir/search?q='+encodeURIComponent(q),digido:q=>'https://digido.ir/search?q='+encodeURIComponent(q),gooshishop:q=>'https://gooshishop.com/search?q='+encodeURIComponent(q),berozkala:q=>'https://berozkala.com/search?q='+encodeURIComponent(q),janebi:q=>'https://janebi.com/search?q='+encodeURIComponent(q),khanoumi:q=>'https://khanoumi.com/search?q='+encodeURIComponent(q),banimode:q=>'https://banimode.com/search?q='+encodeURIComponent(q),modiseh:q=>'https://modiseh.com/search?q='+encodeURIComponent(q),esam:q=>'https://esam.ir/search/?q='+encodeURIComponent(q),pinket:q=>'https://pinket.com/search?q='+encodeURIComponent(q),solokala:q=>'https://solokala.com/search?q='+encodeURIComponent(q)
};
const HOME={digikala:'https://www.digikala.com/',snappshop:'https://snappshop.ir/',torob:'https://torob.com/',basalam:'https://basalam.com/',technolife:'https://www.technolife.ir/',digido:'https://digido.ir/',gooshishop:'https://gooshishop.com/',berozkala:'https://berozkala.com/',janebi:'https://janebi.com/',khanoumi:'https://khanoumi.com/',banimode:'https://banimode.com/',modiseh:'https://modiseh.com/',esam:'https://esam.ir/',pinket:'https://pinket.com/',solokala:'https://solokala.com/'};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function affiliateUrl(storeId,url){
 const campaigns={digikala:'https://aflo.ir/TrvNHEN8',snappshop:'https://aflo.ir/YPN05dL7'};
 const base=campaigns[String(storeId||'').toLowerCase()];
 return base&&url?base+'?p='+encodeURIComponent(url):url;
}
function stores(){const a=window.DigiYarPopularAffiliateStores;if(Array.isArray(a)&&a.length)return a.filter(x=>x&&x.id&&x.name);const s=document.getElementById('storeSelect');return s?Array.from(s.options).filter(o=>o.value&&o.value!=='all').map(o=>({id:o.value,name:o.textContent.trim()})):[];}
function style(){
 if(document.getElementById('v6-auto-store-style'))return;
 const s=document.createElement('style');s.id='v6-auto-store-style';s.textContent=`
.v6-auto-store{--v6-bg:#fff;--v6-surface:#f7f9fc;--v6-surface-2:#f3f5f8;--v6-text:#172033;--v6-muted:#596579;--v6-border:rgba(0,0,0,.12);--v6-border-soft:rgba(0,0,0,.08);--v6-accent:#2563eb;margin:12px 0;border:1px solid var(--v6-border);border-radius:16px;overflow:hidden;background:var(--v6-bg);color:var(--v6-text);box-shadow:0 2px 10px rgba(0,0,0,.04)}
.v6-auto-head{padding:11px;background:var(--v6-surface);font-weight:800;font-size:13px;color:var(--v6-text)}
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
 style();
 list=Array.isArray(list)?list:stores();
 if(window.DigiYarStoreEligibility&&typeof window.DigiYarStoreEligibility.storesForQuery==='function')
   list=window.DigiYarStoreEligibility.storesForQuery(query,list);
 const usable=list.filter(x=>SEARCH[x.id]||HOME[x.id]);
 if(!usable.length){host.innerHTML='<div class="v6-auto-store"><div class="v6-auto-head">برای این جستجو فروشگاه فعالی پیدا نشد.</div></div>';return host;}
 const box=document.createElement('section');box.className='v6-auto-store';
 box.innerHTML='<div class="v6-auto-head">نتایج جستجوی فروشگاه‌های دیجی‌یار برای «'+esc(query)+'»</div>';
 const tabs=document.createElement('div');tabs.className='v6-auto-tabs';
 const body=document.createElement('div');body.className='v6-auto-body';box.append(tabs,body);host.innerHTML='';host.appendChild(box);
 let active=usable[0];
 const LIVE={digikala:'https://digiyar-v6.petromosi.workers.dev/api/search',snappshop:'https://digiyar-v6.petromosi.workers.dev/api/search',torob:'https://digiyar-v6.petromosi.workers.dev/api/store-search',basalam:'https://digiyar-v6.petromosi.workers.dev/api/store-search',esam:'https://digiyar-v6.petromosi.workers.dev/api/store-search'};
 function card(item){
   const p=Number(item&&item.priceToman)||0;
   const price=p>0?new Intl.NumberFormat('fa-IR').format(p)+' تومان':'قیمت نامشخص';
   const name=esc(item&&item.name||'محصول');
   const url=esc(item&&item.productUrl||'');
   return '<article class="v6-live-card" style="border:1px solid var(--v6-border-soft);border-radius:12px;padding:10px;margin:7px 0;background:var(--v6-surface)">'+
     '<div style="font-weight:800;font-size:12px;line-height:1.8">'+name+'</div>'+
     '<div style="margin-top:4px;font-size:11px;color:var(--v6-muted)">'+esc(price)+'</div>'+
     (url?'<a class="v6-auto-link" style="margin-top:7px" target="_blank" rel="noopener noreferrer" href="'+url+'">مشاهده محصول</a>':'')+
     '</article>';
 }
 function fallback(store,u,message){
   body.innerHTML='<div class="v6-auto-status">'+esc(message||('اتصال زنده '+store.name+' برقرار نشد؛ می‌توانی نتایج مستقیم را ببینی.'))+'</div>'+
     '<div class="v6-auto-actions"><a class="v6-auto-link" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(store.id,u))+'">مشاهده مستقیم نتایج</a><a class="v6-auto-link v6-auto-home" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(store.id,HOME[store.id]||u))+'">ورود به '+esc(store.name)+'</a></div>';
 }
 async function render(){
   tabs.querySelectorAll('.v6-auto-tab').forEach(t=>t.classList.toggle('active',t.dataset.id===active.id));
   const u=SEARCH[active.id]?SEARCH[active.id](query):HOME[active.id];
   if(LIVE[active.id]){
     body.innerHTML='<div class="v6-auto-status">در حال دریافت زنده نتایج '+esc(active.name)+'...</div>';
     try{
       const response=await fetch(LIVE[active.id]+'?store='+encodeURIComponent(active.id)+'&q='+encodeURIComponent(query),{headers:{Accept:'application/json'},cache:'no-store'});
       if(!response.ok)throw Error('HTTP '+response.status);
       const data=await response.json();
       if(data&&data.results&&data.results.length){
         body.innerHTML='<div class="v6-auto-status">نتایج زنده '+esc(active.name)+' — '+data.results.length+' مورد</div>'+data.results.map(card).join('');
         return;
       }
       fallback(active,u,'نتیجه زنده‌ای از '+active.name+' دریافت نشد؛ نتایج مستقیم در دسترس است.');
     }catch(error){ fallback(active,u,'اتصال زنده '+active.name+' برقرار نشد؛ نتایج مستقیم در دسترس است.'); }
     return;
   }
   body.innerHTML='<div class="v6-auto-status">نتیجه زنده‌ای از '+esc(active.name)+' دریافت نشد؛ نتایج مستقیم در دسترس است.</div><div class="v6-auto-actions"><a class="v6-auto-link" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(active.id,u))+'">مشاهده مستقیم نتایج</a><a class="v6-auto-link v6-auto-home" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(active.id,HOME[active.id]||u))+'">ورود به '+esc(active.name)+'</a></div>';
 }
 usable.forEach(x=>{const t=document.createElement('button');t.type='button';t.className='v6-auto-tab';t.dataset.id=x.id;t.textContent=x.name;t.addEventListener('click',()=>{active=x;render();});tabs.appendChild(t);});
 render();return host;
}
window.DigiYarStoreBrowser={version:VERSION,open:openBrowser};
})();
