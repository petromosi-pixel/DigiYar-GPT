/* DigiYar V6 — Hooshyar Store Browser
 * Keeps Hooshyar focused on the stores already selected in DigiYar.
 * It does not crawl, proxy, bypass, or scrape protected pages.
 * It opens each store's public search page inside a lightweight in-app browser shell.
 */
(function(){
  'use strict';

  const VERSION = '6.0.0-store-browser.1';
  const STORE_SEARCH = {
    digikala: q => 'https://www.digikala.com/search/?q=' + encodeURIComponent(q),
    snappshop: q => 'https://snappshop.ir/search?query=' + encodeURIComponent(q),
    torob: q => 'https://torob.com/search/?query=' + encodeURIComponent(q),
    basalam: q => 'https://basalam.com/search?q=' + encodeURIComponent(q),
    technolife: q => 'https://www.technolife.ir/search?q=' + encodeURIComponent(q),
    digido: q => 'https://digido.ir/search?q=' + encodeURIComponent(q),
    gooshishop: q => 'https://gooshishop.com/search?q=' + encodeURIComponent(q),
    berozkala: q => 'https://berozkala.com/search?q=' + encodeURIComponent(q),
    janebi: q => 'https://janebi.com/search?q=' + encodeURIComponent(q),
    khanoumi: q => 'https://khanoumi.com/search?q=' + encodeURIComponent(q),
    banimode: q => 'https://banimode.com/search?q=' + encodeURIComponent(q),
    modiseh: q => 'https://modiseh.com/search?q=' + encodeURIComponent(q),
    esam: q => 'https://esam.ir/search/?q=' + encodeURIComponent(q),
    pinket: q => 'https://pinket.com/search?q=' + encodeURIComponent(q),
    solokala: q => 'https://solokala.com/search?q=' + encodeURIComponent(q)
  };

  function esc(v){return String(v ?? '').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  function selectedStores(){
    const stores = window.DigiYarPopularAffiliateStores;
    if(Array.isArray(stores) && stores.length) return stores.filter(s => s && s.id && s.name);
    const select = document.getElementById('storeSelect');
    if(!select) return [];
    return Array.from(select.options).filter(o => o.value && o.value !== 'all').map(o => ({id:o.value,name:o.textContent.trim()}));
  }

  function ensureStyle(){
    if(document.getElementById('v6-store-browser-style')) return;
    const s=document.createElement('style');
    s.id='v6-store-browser-style';
    s.textContent=`
      .v6-store-browser{width:100%;margin:12px 0 0;border:1px solid rgba(0,0,0,.14);border-radius:16px;overflow:hidden;background:#fff;box-sizing:border-box;box-shadow:0 3px 14px rgba(20,35,60,.08)}
      .v6-store-browser-head{display:flex;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid rgba(0,0,0,.1);background:#f7f9fc}
      .v6-store-browser-title{font-weight:800;font-size:13px;flex:1;color:#172033}
      .v6-store-browser-close{border:0;background:transparent;font-size:18px;cursor:pointer;color:#687386}
      .v6-store-browser-tabs{display:flex;gap:6px;padding:8px;overflow:auto;border-bottom:1px solid rgba(0,0,0,.08)}
      .v6-store-browser-tab{flex:0 0 auto;border:1px solid rgba(0,0,0,.13);border-radius:10px;background:#fff;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer;color:#27344a}
      .v6-store-browser-tab.active{background:#2563eb;color:#fff;border-color:#2563eb}
      .v6-store-browser-frame{display:block;width:100%;height:520px;border:0;background:#fff}
      .v6-store-browser-fallback{padding:18px;text-align:center;color:#5d687a;font-size:13px;line-height:1.9}
      .v6-store-browser-open{display:inline-flex;margin-top:10px;padding:9px 16px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700}
      html.dark .v6-store-browser,body.dark .v6-store-browser,[data-theme="dark"] .v6-store-browser{background:#161b24;border-color:rgba(255,255,255,.14);box-shadow:0 4px 16px rgba(0,0,0,.3)}
      html.dark .v6-store-browser-head,body.dark .v6-store-browser-head,[data-theme="dark"] .v6-store-browser-head{background:#1c2330;border-color:rgba(255,255,255,.1)}
      html.dark .v6-store-browser-title,body.dark .v6-store-browser-title,[data-theme="dark"] .v6-store-browser-title{color:#f8fafc}
      html.dark .v6-store-browser-tab,body.dark .v6-store-browser-tab,[data-theme="dark"] .v6-store-browser-tab{background:#202938;color:#e5e7eb;border-color:rgba(255,255,255,.14)}
      html.dark .v6-store-browser-tab.active,body.dark .v6-store-browser-tab.active,[data-theme="dark"] .v6-store-browser-tab.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
    `;
    document.head.appendChild(s);
  }

  function openBrowser(query, storeList){
    const host=document.getElementById('v5SmartSearchResults');
    if(!host) return;
    ensureStyle();
    const stores=storeList.filter(s=>STORE_SEARCH[s.id]);
    if(!stores.length){
      host.innerHTML='<div class="v5-smart-search-empty">برای فروشگاه‌های فعلی مسیر جستجوی عمومی تعریف نشده است.</div>';
      return;
    }
    let active=stores[0];
    const box=document.createElement('section');
    box.className='v6-store-browser';
    box.innerHTML='<div class="v6-store-browser-head"><div class="v6-store-browser-title">مرورگر فروشگاه‌های دیجی‌یار · '+esc(query)+'</div><button class="v6-store-browser-close" type="button" aria-label="بستن">×</button></div><div class="v6-store-browser-tabs"></div><div class="v6-store-browser-view"></div>';
    host.innerHTML='';host.appendChild(box);
    const tabs=box.querySelector('.v6-store-browser-tabs');
    const view=box.querySelector('.v6-store-browser-view');
    function render(){
      Array.from(tabs.children).forEach((el,i)=>el.classList.toggle('active',stores[i].id===active.id));
      const url=STORE_SEARCH[active.id](query);
      view.innerHTML='<iframe class="v6-store-browser-frame" title="جستجو در '+esc(active.name)+'" loading="lazy" referrerpolicy="no-referrer" src="'+esc(url)+'"></iframe><div class="v6-store-browser-fallback">اگر '+esc(active.name)+' اجازه نمایش داخل برنامه را ندهد، همین جستجو را مستقیم در سایت فروشگاه باز کن.<br><a class="v6-store-browser-open" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">باز کردن در '+esc(active.name)+'</a></div>';
    }
    stores.forEach(store=>{
      const b=document.createElement('button');b.type='button';b.className='v6-store-browser-tab';b.textContent=store.name;b.addEventListener('click',()=>{active=store;render();});tabs.appendChild(b);
    });
    box.querySelector('.v6-store-browser-close').addEventListener('click',()=>box.remove());
    render();
  }

  function intercept(){
    document.addEventListener('submit',function(e){
      const form=e.target;
      if(!form || form.id!=='v5SmartSearchForm') return;
      const input=document.getElementById('v5SmartSearchInput');
      const query=String(input && input.value || '').trim();
      if(!query) return;
      /* Hooshyar is now a store-search browser first. Existing Product Index/Core remains available elsewhere. */
      e.preventDefault();
      e.stopImmediatePropagation();
      if(input) input.disabled=false;
      const stores=selectedStores();
      const results=document.getElementById('v5SmartSearchResults') || (function(){const x=document.createElement('div');x.id='v5SmartSearchResults';x.className='v5-smart-search-results';form.parentElement.appendChild(x);return x;})();
      results.innerHTML='<div class="v5-smart-search-loading">در حال آماده‌سازی جستجوی فروشگاه‌ها<span class="v6-hooshyar-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>';
      setTimeout(()=>openBrowser(query,stores),80);
    },true);
  }

  window.DigiYarStoreBrowser={version:VERSION,open:openBrowser};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',intercept,{once:true}); else intercept();
})();
