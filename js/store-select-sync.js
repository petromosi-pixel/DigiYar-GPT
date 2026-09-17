/* DigiYar V6 — synchronize selected stores and purchase-profile search with Hooshyar */
(function(){
  'use strict';

  function value(id){
    var el=document.getElementById(id);
    return el ? String(el.value||'').trim() : '';
  }

  function loadStoreBrowser(callback){
    if(window.DigiYarStoreBrowser){
      callback(window.DigiYarStoreBrowser);
      return;
    }
    var existing=document.querySelector('script[data-digiyar-store-browser]');
    if(existing){
      existing.addEventListener('load',function(){callback(window.DigiYarStoreBrowser);},{once:true});
      return;
    }
    var script=document.createElement('script');
    script.src='js/v6-store-browser.js?v=6.0.0-store-browser.6';
    script.async=false;
    script.dataset.digiyarStoreBrowser='1';
    script.onload=function(){callback(window.DigiYarStoreBrowser);};
    script.onerror=function(){console.error('DigiYar Hooshyar: failed to load store browser');};
    document.head.appendChild(script);
  }

  function syncStores(){
    var select=document.getElementById('storeSelect');
    var stores=window.DigiYarPopularAffiliateStores;
    if(!select || !Array.isArray(stores) || !stores.length) return false;

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
    return true;
  }

  function profileQuery(){
    var parts=[];
    ['v5Category','v5Subcategory','v6Brand'].forEach(function(id){
      var v=value(id);
      if(v && parts.indexOf(v)<0) parts.push(v);
    });
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }

  function persistProfile(){
    if(!window.DigiYarUserProfile || typeof window.DigiYarUserProfile.save!=='function') return;
    try{
      window.DigiYarUserProfile.save(window.DigiYarUserProfile.normalize({
        category:value('v5Category'),
        budgetMax:value('budgetMax'),
        priorities:'',
        usage:'',
        requirements:'',
        constraints:''
      }));
    }catch(error){
      console.warn('DigiYar Profile save:',error);
    }
  }

  function launchHooshyar(){
    var smartInput=document.getElementById('v5SmartSearchInput');
    var typed=String(smartInput&&smartInput.value||'').trim();
    var query=typed || profileQuery();
    if(!query) return false;

    if(smartInput) smartInput.value=query;

    loadStoreBrowser(function(browser){
      if(!browser || typeof browser.open!=='function') return;
      browser.open(query,(function(){
        var stores=window.DigiYarPopularAffiliateStores;
        if(Array.isArray(stores) && stores.length) return stores.filter(function(x){return x&&x.id&&x.name;});
        var select=document.getElementById('storeSelect');
        return select ? Array.from(select.options).filter(function(o){return o.value&&o.value!=='all';}).map(function(o){return {id:o.value,name:o.textContent.trim()};}) : [];
      })());
      var resultHost=document.getElementById('v5SmartSearchResults');
      if(resultHost) resultHost.scrollIntoView({behavior:'smooth',block:'start'});
    });
    return true;
  }

  function connectProfileToHooshyar(){
    var form=document.getElementById('profileForm');
    if(!form || form.dataset.v6HooshyarSync==='2') return false;
    form.dataset.v6HooshyarSync='2';

    /* Capture the purchase action before legacy profile handlers can swallow it. */
    form.addEventListener('submit',function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      persistProfile();
      launchHooshyar();
    },true);
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

  /* The selected-store layer may populate its list asynchronously. */
  var attempts=0;
  var retry=setInterval(function(){
    attempts+=1;
    var storesReady=syncStores();
    var formReady=connectProfileToHooshyar();
    if((storesReady && formReady) || attempts>=40) clearInterval(retry);
  },250);
})();