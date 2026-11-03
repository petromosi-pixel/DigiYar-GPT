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

  function selectedOptionText(id){
    var form=el('profileForm'),node=el(id);
    if(!form||!node||!form.contains(node)||node.tagName!=='SELECT'||!String(node.value||'').trim())return '';
    var option=node.options[node.selectedIndex];
    var selected=option?String(option.textContent||'').replace(/\\s+/g,' ').trim():'';
    if(!selected||/^(انتخاب|ابتدا|چقدر)/.test(selected))return '';
    return selected;
  }

  function profileParts(){
    // These four controls alone define the requested Hooshyar search phrase.
    return ['v5Subcategory','v6Brand','v6BudgetRange','v6Usage']
      .map(selectedOptionText)
      .filter(function(part,index,parts){return !!part&&parts.indexOf(part)===index;});
  }

  function profileQuery(){
    return profileParts().filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
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
    var searchForm=el('v5SmartSearchForm');
    var query=profileQuery();
    if(!query||!smartInput||!searchForm){
      setProfileSearchStatus('برای جست‌وجو، گزینه‌های خرید را در فیلدهای زیر دسته، برند، بودجه و نوع استفاده انتخاب کن.',true);
      return false;
    }

    // The profile form hands the selected criteria to Hooshyar itself.
    // Its own submit handler performs the search and applies the exact store-picker filters.
    smartInput.value=query;
    syncHooshyarHint();
    setProfileSearchStatus('',false);
    smartInput.scrollIntoView({behavior:'smooth',block:'center'});
    if(typeof searchForm.requestSubmit==='function') searchForm.requestSubmit();
    else searchForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    return true;
  }

  function handleProfileSubmit(event){
    if(!event.target||event.target.id!=='profileForm')return;
    event.preventDefault();
    event.stopPropagation();
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
    if(form&&document.documentElement.dataset.v8HooshyarSubmitDelegated!=='1'){
      document.documentElement.dataset.v8HooshyarSubmitDelegated='1';
      document.addEventListener('submit',handleProfileSubmit,true);
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