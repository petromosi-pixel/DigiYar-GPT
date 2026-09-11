/* DigiYar V6 — keep "فروشگاهتو انتخاب کن" names synchronized with "فروشگاه‌های منتخب" */
(function(){
  'use strict';
  function sync(){
    var select=document.getElementById('storeSelect');
    var stores=window.DigiYarPopularAffiliateStores;
    if(!select || !Array.isArray(stores)) return;
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
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
})();
