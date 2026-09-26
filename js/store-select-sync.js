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
    script.src='js/v6-store-browser.js?v=6.0.0-store-browser.27';
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
    var profileHost=el('v7ProfileSearchHost');
    if(profileHost) profileHost.dataset.activeStore=String(select.value||'');
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

  function profileParts(){
    var parts=[];
    var sub=optionText('v5Subcategory');
    var brand=optionText('v6Brand');
    var budget=optionText('v6BudgetRange');
    var usage=optionText('v6Usage');
    if(sub && !/^انتخاب/.test(sub)) parts.push(sub);
    if(brand && !/^انتخاب/.test(brand)) parts.push(brand);
    if(budget && !/^چقدر/.test(budget)) parts.push(budget);
    if(usage && !/^انتخاب/.test(usage)) parts.push(usage);
    return parts;
  }

  function profileQuery(){
    return profileParts().join(' ').replace(/\s+/g,' ').trim();
  }

  function profileComplete(){
    return ['v5Subcategory','v6Brand','v6BudgetRange','v6Usage'].every(function(id){
      var v=value(id);
      return !!v && !/^انتخاب/.test(v);
    });
  }

  function persistProfile(){
    if(!window.DigiYarUserProfile || typeof window.DigiYarUserProfile.save!=='function') return;
    try{
      window.DigiYarUserProfile.save(window.DigiYarUserProfile.normalize({
        category:'',
        budgetMax:value('budgetMax'),
        priorities:'',
        usage:value('v6Usage'),
        requirements:'',
        constraints:''
      }));
    }catch(error){ console.warn('DigiYar Profile save:',error); }
  }

  function syncHooshyarHint(){
    var input=el('v5SmartSearchInput');
    var hint=el('v5SmartSearchHint');
    if(!input||!hint) return;
    var hasText=!!String(input.value||'').trim();
    hint.style.opacity=hasText?'0':'1';
    hint.style.visibility=hasText?'hidden':'visible';
    hint.style.display=hasText?'none':'';
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function launchHooshyar(){
    var smartInput=el('v5SmartSearchInput');
    var query=profileQuery();
    if(!profileComplete()){
      var missing=[];
      [['v5Subcategory','زیر دسته'],['v6Brand','برند'],['v6BudgetRange','بودجه'],['v6Usage','نوع استفاده']].forEach(function(pair){
        if(!value(pair[0])) missing.push(pair[1]);
      });
      if(smartInput){
        smartInput.value='';
        smartInput.placeholder='ابتدا '+missing.join('، ')+' را کامل کن';
        syncHooshyarHint();
        setTimeout(function(){smartInput.placeholder='';},2600);
      }
      return false;
    }
    if(!query || !smartInput) return false;

    var oldResults=el('v5SmartSearchResults');
    if(oldResults) oldResults.remove();
    var oldSimulator=el('v6StoreSimulatorResults');
    if(oldSimulator) oldSimulator.remove();
    smartInput.value=query;
    syncHooshyarHint();
    /* Keep the original bridge: the profile card submits through the Hooshyar search form. */
    if(smartInput.form && typeof smartInput.form.requestSubmit==='function'){
      smartInput.form.requestSubmit();
    }else{
      loadStoreBrowser(function(browser){
        try{
          var host=browser.open(query);
          requestAnimationFrame(function(){
            var target=host||el('v6StoreSimulatorResults');
            if(target && typeof target.scrollIntoView==='function') target.scrollIntoView({behavior:'smooth',block:'start'});
          });
        }catch(error){ console.error('DigiYar Hooshyar browser:',error); }
      });
    }
    return true;
  }

  function clearResultsAndQuery(){
    var input=el('v5SmartSearchInput');
    if(input){
      input.value='';
      input.disabled=false;
      input.placeholder='';
      syncHooshyarHint();
    }
    var result=el('v5SmartSearchResults');
    if(result) result.remove();
    var simulator=el('v6StoreSimulatorResults');
    if(simulator) simulator.remove();
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

  function handleResetClick(event){
    var target=event.target;
    var button=target&&target.closest ? target.closest('#resetProfile') : null;
    if(!button) return;
    var usage=el('v6Usage');
    if(usage) usage.value='';
    setTimeout(clearResultsAndQuery,0);
  }

  function connectProfileToHooshyar(){
    if(document.documentElement.dataset.v6HooshyarDelegated==='1') return true;
    document.documentElement.dataset.v6HooshyarDelegated='1';
    document.addEventListener('click',handlePurchaseAction,true);
    document.addEventListener('submit',handleProfileSubmit,true);
    document.addEventListener('click',handleResetClick,true);
    return true;
  }

  function boot(){
    var store=el('storeSelect');
    if(store && !store.dataset.v7IsolationBound){
      store.dataset.v7IsolationBound='1';
      store.addEventListener('change',function(){
        var host=el('v7ProfileSearchHost');
        if(host) host.dataset.activeStore=String(store.value||'');
      });
    }
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
    if(attempts>=12) clearInterval(retry);
  },500);
})();