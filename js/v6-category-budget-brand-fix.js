/* DigiYar V6 — category budget/brand presentation fix */
(function(){
  'use strict';
  function $(id){return document.getElementById(id)}
  function centerSelect(select){
    if(!select)return;
    select.style.textAlign='center';
    select.style.textAlignLast='center';
    Array.from(select.options||[]).forEach(function(o){o.style.textAlign='center'});
  }
  function fix(){
    var card=document.querySelector('.v5-profile-card');
    var cat=$('v5Category');
    var budget=$('budgetMax');
    if(!card||!cat||!budget)return false;

    var budgetField=budget.closest('.v5-field');
    if(budgetField && cat.value && card.classList.contains('is-open')){
      budgetField.hidden=false;
      budgetField.style.display='flex';
    }

    var range=$('v6BudgetRange');
    if(range){
      centerSelect(range);
      range.style.width='100%';
      range.style.boxSizing='border-box';
    }

    var brand=$('v6Brand');
    if(brand){
      centerSelect(brand);
      brand.style.width='100%';
      brand.style.boxSizing='border-box';
      var brandField=$('v6BrandField');
      if(brandField){brandField.style.textAlign='center'}
    }
    return true;
  }
  function bind(){
    var cat=$('v5Category'),sub=$('v5Subcategory'),store=$('storeSelect');
    if(!cat)return false;
    if(!cat.dataset.v6BudgetBrandFix){
      cat.dataset.v6BudgetBrandFix='1';
      cat.addEventListener('change',function(){setTimeout(fix,0)});
    }
    if(sub&&!sub.dataset.v6BudgetBrandFix){
      sub.dataset.v6BudgetBrandFix='1';
      sub.addEventListener('change',function(){setTimeout(fix,0)});
    }
    if(store&&!store.dataset.v6BudgetBrandFix){
      store.dataset.v6BudgetBrandFix='1';
      store.addEventListener('change',function(){setTimeout(fix,50)});
    }
    fix();
    return true;
  }
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
  setInterval(fix,500);
  window.DigiYarV6BudgetBrandFixReady=true;
})();
