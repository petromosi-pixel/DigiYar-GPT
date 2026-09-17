/* DigiYar V6 — single controller for «دنبال چی می‌گردی؟» → Hooshyar */
(function(){
  'use strict';

  function byId(id){ return document.getElementById(id); }
  function textOf(id){
    var node=byId(id);
    if(!node) return '';
    if(node.tagName==='SELECT'){
      var option=node.options[node.selectedIndex];
      return option ? String(option.textContent||'').trim() : '';
    }
    return String(node.value||'').trim();
  }
  function validText(value){
    var v=String(value||'').trim();
    return v && !/^(?:انتخاب|ابتدا|برای این دسته)/.test(v) ? v : '';
  }
  function addPart(parts,value){
    var v=validText(value);
    if(v && parts.indexOf(v)<0) parts.push(v);
  }
  function profileQuery(){
    var parts=[];
    addPart(parts,textOf('v5Category'));
    addPart(parts,textOf('v5Subcategory'));
    addPart(parts,textOf('v6Brand'));
    var budget=byId('v6BudgetRange');
    if(budget && budget.value){
      var option=budget.options[budget.selectedIndex];
      addPart(parts,option&&option.textContent);
    }
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }
  function ensureResultHost(){
    var host=byId('v5SmartSearchResults');
    if(host) return host;
    var form=byId('v5SmartSearchForm');
    if(!form || !form.parentElement) return null;
    host=document.createElement('div');
    host.id='v5SmartSearchResults';
    host.className='v5-smart-search-results';
    form.parentElement.appendChild(host);
    return host;
  }
  function loadStoreBrowser(){
    if(window.DigiYarStoreBrowser) return Promise.resolve(window.DigiYarStoreBrowser);
    var existing=document.querySelector('script[data-digiyar-store-browser]');
    if(existing){
      return new Promise(function(resolve){
        if(window.DigiYarStoreBrowser){ resolve(window.DigiYarStoreBrowser); return; }
        existing.addEventListener('load',function(){resolve(window.DigiYarStoreBrowser);},{once:true});
      });
    }
    return new Promise(function(resolve,reject){
      var script=document.createElement('script');
      script.src=new URL('js/v6-store-browser.js?v=6.0.0-store-browser.5',document.baseURI).href;
      script.async=false;
      script.dataset.digiyarStoreBrowser='1';
      script.onload=function(){resolve(window.DigiYarStoreBrowser);};
      script.onerror=function(){reject(new Error('Hooshyar store browser failed to load'));};
      document.head.appendChild(script);
    });
  }
  function syncInput(query){
    var input=byId('v5SmartSearchInput');
    if(!input) return null;
    input.value=query;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    return input;
  }
  function stores(){
    var list=window.DigiYarPopularAffiliateStores;
    if(Array.isArray(list)&&list.length) return list.filter(function(x){return x&&x.id&&x.name;});
    var select=byId('storeSelect');
    if(!select) return [];
    return Array.from(select.options||[]).filter(function(o){return o.value&&o.value!=='all';}).map(function(o){return {id:o.value,name:String(o.textContent||'').trim()};});
  }
  function launch(query){
    var smartForm=byId('v5SmartSearchForm');
    if(!smartForm) return false;
    ensureResultHost();
    syncInput(query);
    return loadStoreBrowser().then(function(browser){
      if(browser && typeof browser.open==='function' && !byId('v5SmartSearchResults')) ensureResultHost();
      if(typeof smartForm.requestSubmit==='function') smartForm.requestSubmit();
      else smartForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      var host=byId('v5SmartSearchResults');
      if(host) host.scrollIntoView({behavior:'smooth',block:'start'});
      return true;
    }).catch(function(error){
      console.error('DigiYar Hooshyar purchase search:',error);
      var host=ensureResultHost();
      if(host) host.innerHTML='<div class="v5-smart-search-empty">جستجوی هوش‌یار در دسترس نیست؛ دوباره امتحان کن.</div>';
      return false;
    });
  }
  function handleSubmit(event){
    var form=event.target;
    if(!form || form.id!=='profileForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var query=profileQuery();
    var input=byId('v5SmartSearchInput');
    var typed=String(input&&input.value||'').trim();
    query=typed||query;
    if(!query){
      console.warn('DigiYar Hooshyar: purchase profile has no searchable values');
      return;
    }
    launch(query);
  }
  function handleReset(event){
    var target=event.target;
    var button=target&&target.closest?target.closest('#resetProfile'):null;
    if(!button) return;
    setTimeout(function(){
      var sub=byId('v5Subcategory');
      var brand=byId('v6Brand');
      var range=byId('v6BudgetRange');
      [sub,brand,range].forEach(function(node){if(node){node.value='';node.selectedIndex=0;}});
      var budget=byId('budgetMax');
      var min=byId('budgetMin');
      if(budget) budget.value='';
      if(min) min.value='';
    },0);
  }
  function boot(){
    if(document.documentElement.dataset.v6PurchaseSearch==='1') return;
    document.documentElement.dataset.v6PurchaseSearch='1';
    document.addEventListener('submit',handleSubmit,true);
    document.addEventListener('click',handleReset,true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.DigiYarV6PurchaseSearch={version:'1.0.0',query:profileQuery,launch:launch};
})();