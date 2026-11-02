/* DigiYar V8 — synchronize selected stores and directly run Hooshyar profile search */
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

  function syncStores(){
    var select=el('storeSelect');
    var stores=typeof window.DigiYarGetSelectableStores==='function' ? window.DigiYarGetSelectableStores() : window.DigiYarPopularAffiliateStores;
    if(!select || !Array.isArray(stores) || !stores.length) return false;
    var profileHost=el('v7ProfileSearchHost');
    if(profileHost) profileHost.dataset.activeStore=String(select.value||'');
    var current=select.value || 'all';
    var desired=[{id:'all',name:'همه فروشگاه‌های متصل'}];
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

  function setProfileSearchStatus(message,isError){
    var form=el('profileForm');if(!form)return;
    var status=el('v8ProfileSearchStatus');
    if(!status){status=document.createElement('div');status.id='v8ProfileSearchStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='grid-column:1/-1;margin-top:8px;font-size:12px;line-height:1.7;font-weight:700;color:#2a4169';var actions=form.querySelector('.form-actions');if(actions)actions.insertAdjacentElement('afterend',status);else form.appendChild(status);}
    status.textContent=message||'';status.style.color=isError?'#c0392b':'';
  }
  window.DigiYarProfileSearchStatus=setProfileSearchStatus;

  function launchHooshyar(){
    var smartInput=el('v5SmartSearchInput');
    var typed=smartInput?String(smartInput.value||'').trim():'';
    var fromProfile=!typed;
    var query=typed||profileQuery();
    if(!query||!smartInput){
      setProfileSearchStatus('ابتدا عبارت کالا یا خدمت موردنظرت را در کادر هوش‌یار وارد کن؛ سپس «نمایش نتایج» را بزن.',true);
      if(smartInput){smartInput.focus();smartInput.scrollIntoView({behavior:'smooth',block:'center'});}
      return false;
    }
    if(fromProfile){
      smartInput.value=query;
      syncHooshyarHint();
    }
    var refinements=(fromProfile?[]:['v5Category','v5Subcategory','v6Brand']).map(optionText).filter(function(part){
      return part&&!/^انتخاب/.test(part)&&!/^ابتدا/.test(part)&&part!=='دسته‌بندی';
    });
    query=[query].concat(refinements).join(' ').replace(/\s+/g,' ').trim();
    var discovery=window.DigiYarPopularStoreDiscovery;
    if(!discovery||typeof discovery.setSearchContext!=='function'){
      setProfileSearchStatus('موتور نتایج هنوز آماده نشده است؛ یک‌بار صفحه را تازه‌سازی کن و دوباره تلاش کن.',true);
      return false;
    }
    var oldResults=el('v5SmartSearchResults');if(oldResults)oldResults.remove();
    var oldSimulator=el('v6StoreSimulatorResults');if(oldSimulator)oldSimulator.remove();
    var filters=window.DigiYarStoreSelection&&typeof window.DigiYarStoreSelection.getFilters==='function'?window.DigiYarStoreSelection.getFilters():null;
    try{
      var result=discovery.setSearchContext(query,filters);
      var count=result&&Array.isArray(result.storeIds)?result.storeIds.length:0;
      setProfileSearchStatus(count?'جست‌وجو انجام شد؛ '+count+' فروشگاه مرتبط از میان فروشگاه‌های انتخابی پیدا شد.':'جست‌وجو انجام شد؛ در فروشگاه‌های انتخابی نتیجهٔ مرتبطی پیدا نشد. عبارت یا انتخاب فروشگاه‌ها را تغییر بده.',!count);
      var panel=el('popularDiscoveryPanel');
      if(panel){panel.hidden=false;setTimeout(function(){panel.scrollIntoView({behavior:'smooth',block:'start'});},80);}
      return true;
    }catch(error){
      console.error('DigiYar profile search failed:',error);
      setProfileSearchStatus('اجرای جست‌وجو با خطا روبه‌رو شد؛ دوباره تلاش کن.',true);
      return false;
    }
  }

  function handleProfileSubmit(event){
    if(!event.target||event.target.id!=='profileForm')return;
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
    var form=el('profileForm');
    if(form&&form.dataset.v8HooshyarSubmitBound!=='1'){
      form.dataset.v8HooshyarSubmitBound='1';
      form.addEventListener('submit',handleProfileSubmit);
    }
    var showButton=form&&form.querySelector('.form-actions button[type="submit"]');
    if(showButton&&showButton.dataset.v8HooshyarClickBound!=='1'){
      showButton.dataset.v8HooshyarClickBound='1';
      showButton.addEventListener('click',function(event){event.preventDefault();launchHooshyar();});
    }
    if(document.documentElement.dataset.v6HooshyarResetDelegated!=='1'){
      document.documentElement.dataset.v6HooshyarResetDelegated='1';
      document.addEventListener('click',handleResetClick,true);
    }
    return !!form;
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