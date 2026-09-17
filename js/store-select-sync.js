/* DigiYar V6 — keep "فروشگاهتو انتخاب کن" names synchronized with "فروشگاه‌های منتخب" and Hooshyar */
(function(){
  'use strict';
  function loadStoreBrowser(){
    if(window.DigiYarStoreBrowser || document.querySelector('script[data-digiyar-store-browser]')) return;
    var script=document.createElement('script');
    script.src='js/v6-store-browser.js?v=6.0.0-store-browser.6';
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
  function value(id){
    var el=document.getElementById(id);
    return el ? String(el.value||'').trim() : '';
  }
  function profileQuery(){
    var parts=[];
    ['v5Category','v5Subcategory','v6Brand'].forEach(function(id){var v=value(id);if(v)parts.push(v);});
    var dyn=document.getElementById('v5DynamicFields');
    if(dyn) dyn.querySelectorAll('select,input[type="text"],input[type="search"]').forEach(function(el){var v=String(el.value||'').trim();if(v && parts.indexOf(v)<0)parts.push(v);});
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }
  function bindHooshyarProfile(){
    document.addEventListener('submit',function(event){
      var form=event.target;
      if(!form || form.id!=='profileForm') return;
      var smartForm=document.getElementById('v5SmartSearchForm');
      var smartInput=document.getElementById('v5SmartSearchInput');
      if(!smartForm || !smartInput) return;
      var query=String(smartInput.value||'').trim() || profileQuery();
      if(!query) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      smartInput.value=query;
      smartForm.requestSubmit();
    },true);
  }
  function boot(){sync();bindHooshyarProfile();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
