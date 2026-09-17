/* DigiYar V6 — synchronize selected stores and purchase-profile search with Hooshyar */
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

  function syncStores(){
    var select=document.getElementById('storeSelect');
    var stores=window.DigiYarPopularAffiliateStores;
    if(!select || !Array.isArray(stores) || !stores.length){
      loadStoreBrowser();
      return false;
    }

    var current=select.value || 'all';
    var desired=[{id:'all',name:'همه فروشگاه‌های منتخب'}];
    var seen={};
    stores.forEach(function(store){
      if(!store || !store.id || !store.name || seen[store.id]) return;
      seen[store.id]=true;
      desired.push({id:String(store.id),name:String(store.name)});
    });

    var actual=Array.from(select.options||[]).map(function(option){
      return {id:String(option.value||''),name:String(option.textContent||'')};
    });
    var same=actual.length===desired.length && actual.every(function(option,index){
      return option.id===desired[index].id && option.name===desired[index].name;
    });

    if(!same){
      select.innerHTML='';
      desired.forEach(function(store){
        var option=document.createElement('option');
        option.value=store.id;
        option.textContent=store.name;
        select.appendChild(option);
      });
    }

    var valid=desired.some(function(store){return store.id===current;});
    select.value=valid ? current : 'all';
    loadStoreBrowser();
    return true;
  }

  function value(id){
    var el=document.getElementById(id);
    return el ? String(el.value||'').trim() : '';
  }

  function profileQuery(){
    var parts=[];
    ['v5Category','v5Subcategory','v6Brand'].forEach(function(id){
      var v=value(id);
      if(v && parts.indexOf(v)<0) parts.push(v);
    });
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }

  function connectProfileToHooshyar(){
    var form=document.getElementById('profileForm');
    if(!form || form.dataset.v6HooshyarSync==='1') return false;
    form.dataset.v6HooshyarSync='1';

    /* Bubble phase: the purchase card keeps its native submit behavior. */
    form.addEventListener('submit',function(){
      setTimeout(function(){
        var smartForm=document.getElementById('v5SmartSearchForm');
        var smartInput=document.getElementById('v5SmartSearchInput');
        if(!smartForm || !smartInput) return;

        var typed=String(smartInput.value||'').trim();
        var query=typed || profileQuery();
        if(!query) return;

        smartInput.value=query;
        if(typeof smartForm.requestSubmit==='function'){
          smartForm.requestSubmit();
        }else{
          smartForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
        }
      },0);
    },false);
    return true;
  }

  function boot(){
    syncStores();
    connectProfileToHooshyar();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }

  /* Some store lists are populated asynchronously by the selected-stores layer. */
  var attempts=0;
  var retry=setInterval(function(){
    attempts+=1;
    var storesReady=syncStores();
    var formReady=connectProfileToHooshyar();
    if((storesReady && formReady) || attempts>=40) clearInterval(retry);
  },250);
})();
