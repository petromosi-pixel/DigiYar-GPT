/* DigiYar V6 — synchronize selected stores and purchase-profile search with Hooshyar */
(function(){
  'use strict';

  function el(id){ return document.getElementById(id); }
  function value(id){
    var node=el(id);
    return node ? String(node.value||'').trim() : '';
  }
  function optionText(id){
    var node=el(id);
    if(!node) return '';
    if(node.tagName==='SELECT'){
      var option=node.options[node.selectedIndex];
      return option ? String(option.textContent||'').trim() : '';
    }
    return value(id);
  }

  function loadStoreBrowser(callback){
    if(window.DigiYarStoreBrowser){ callback(window.DigiYarStoreBrowser); return; }
    var existing=document.querySelector('script[data-digiyar-store-browser]');
    if(existing){
      existing.addEventListener('load',function(){ callback(window.DigiYarStoreBrowser); },{once:true});
      return;
    }
    var script=document.createElement('script');
    script.src='js/v6-store-browser.js?v=6.0.0-store-browser.6';
    script.async=false;
    script.dataset.digiyarStoreBrowser='1';
    script.onload=function(){ callback(window.DigiYarStoreBrowser); };
    script.onerror=function(){ console.error('DigiYar Hooshyar: failed to load store browser'); };
    document.head.appendChild(script);
  }

  function syncStores(){
    var select=el('storeSelect');
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
    var valid=desired.some(function(store){ return store.id===current; });
    select.value=valid ? current : 'all';
    return true;
  }

  function profileQuery(){
    var parts=[];
    ['v5Category','v5Subcategory','v6Brand'].forEach(function(id){
      var text=optionText(id);
      if(text && !/^انتخاب|^ابتدا دسته/.test(text) && parts.indexOf(text)<0) parts.push(text);
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
    }catch(error){ console.warn('DigiYar Profile save:',error); }
  }

  function launchHooshyar(){
    var smartInput=el('v5SmartSearchInput');
    var typed=String(smartInput&&smartInput.value||'').trim();
    var query=typed || profileQuery();
    if(!query){
      console.warn('DigiYar Hooshyar: no purchase-profile query found');
      return false;
    }
    if(smartInput) smartInput.value=query;
    loadStoreBrowser(function(browser){
      if(!browser || typeof browser.open!=='function') return;
      var stores=window.DigiYarPopularAffiliateStores;
      if(!Array.isArray(stores) || !stores.length){
        var select=el('storeSelect');
        stores=select ? Array.from(select.options).filter(function(o){return o.value&&o.value!=='all';}).map(function(o){return {id:o.value,name:o.textContent.trim()};}) : [];
      }
      browser.open(query,stores.filter(function(x){return x&&x.id&&x.name;}));
      var resultHost=el('v5SmartSearchResults');
      if(resultHost) resultHost.scrollIntoView({behavior:'smooth',block:'start'});
    });
    return true;
  }

  function handlePurchaseAction(event){
    var target=event.target;
    if(!target) return;
    var form=target.closest ? target.closest('#profileForm') : null;
    if(!form) return;
    var button=target.closest ? target.closest('button[type="submit"],input[type="submit"]') : null;
    if(!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    persistProfile();
    launchHooshyar();
  }

  function handleProfileSubmit(event){
    var form=event.target;
    if(!form || form.id!=='profileForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    persistProfile();
    launchHooshyar();
  }

  function connectProfileToHooshyar(){
    if(document.documentElement.dataset.v6HooshyarDelegated==='1') return true;
    document.documentElement.dataset.v6HooshyarDelegated='1';
    document.addEventListener('click',handlePurchaseAction,true);
    document.addEventListener('submit',handleProfileSubmit,true);
    return true;
  }

  function boot(){
    syncStores();
    connectProfileToHooshyar();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  var attempts=0;
  var retry=setInterval(function(){
    attempts+=1;
    syncStores();
    connectProfileToHooshyar();
    if(attempts>=40) clearInterval(retry);
  },250);
})();