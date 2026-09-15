/* DigiYar V6 — keep "فروشگاهتو انتخاب کن" names synchronized with "فروشگاه‌های منتخب" */
(function(){
  'use strict';
  function loadStoreBrowser(){
    if(window.DigiYarStoreBrowser || document.querySelector('script[data-digiyar-store-browser]')) return;
    var script=document.createElement('script');
    script.src='js/v6-store-browser.js?v=6.0.0-store-browser.1';
    script.async=false;
    script.dataset.digiyarStoreBrowser='1';
    document.head.appendChild(script);
  }
  function sync(){
    var select=document.getElementById('storeSelect');
    var stores=window.DigiYarPopularAffiliateStores;
    if(!select || !Array.isArray(stores)) { loadStoreBrowser(); return; }
    var current=select.value;
    select.innerHTML='';
    var all=document.createElement('option');
    all.value='all';
    all.textContent='همه فروشگاه‌های منتخب';
    select.appendChild(all);
    stores.forEach(function(store){
      if(!store || !store.id || !store.name) return;
      var option=document.createElement('option');
      option.value=store.id;
      option.textContent=store.name;
      select.appendChild(option);
    });
    if(current==='all' || stores.some(function(store){return store && store.id===current;})){
      select.value=current;
    }else{
      select.value='all';
    }
    loadStoreBrowser();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
})();
