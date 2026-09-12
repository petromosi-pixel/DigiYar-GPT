/* DigiYar V6 — category budget/brand presentation + reset fix */
(function(){
  'use strict';
  function $(id){return document.getElementById(id)}
  function centerSelect(select){
    if(!select)return;
    select.style.textAlign='center';
    select.style.textAlignLast='center';
    Array.from(select.options||[]).forEach(function(o){o.style.textAlign='center'});
  }
  function resetPurchaseFields(){
    var brand=$('v6Brand');
    var range=$('v6BudgetRange');
    var budget=$('budgetMax');
    var budgetMin=$('budgetMin');
    if(brand){brand.selectedIndex=0;brand.value='';}
    if(range){range.selectedIndex=0;range.value='';}
    if(budget)budget.value='';
    if(budgetMin)budgetMin.value='';
  }
  function bindReset(){
    var reset=$('resetProfile');
    if(!reset||reset.dataset.v6ResetFix)return false;
    reset.dataset.v6ResetFix='1';
    reset.addEventListener('click',function(){
      resetPurchaseFields();
      requestAnimationFrame(resetPurchaseFields);
      setTimeout(resetPurchaseFields,50);
      setTimeout(resetPurchaseFields,150);
      setTimeout(resetPurchaseFields,300);
    },true);
    return true;
  }
  function fix(){
    var card=document.querySelector('.v5-profile-card');
    var cat=$('v5Category');
    var budget=$('budgetMax');
    bindReset();
    if(!card||!cat||!budget)return false;
    var budgetField=budget.closest('.v5-field');
    if(budgetField && cat.value && card.classList.contains('is-open')){
      budgetField.hidden=false;
      budgetField.style.display='flex';
    }
    var range=$('v6BudgetRange');
    if(range){centerSelect(range);range.style.width='100%';range.style.boxSizing='border-box'}
    var brand=$('v6Brand');
    if(brand){
      centerSelect(brand);
      brand.style.width='100%';
      brand.style.boxSizing='border-box';
      var brandField=$('v6BrandField');
      if(brandField)brandField.style.textAlign='center';
    }
    return true;
  }
  function bind(){
    var cat=$('v5Category'),sub=$('v5Subcategory'),store=$('storeSelect');
    if(!cat)return false;
    if(!cat.dataset.v6BudgetBrandFix){cat.dataset.v6BudgetBrandFix='1';cat.addEventListener('change',function(){setTimeout(fix,0)})}
    if(sub&&!sub.dataset.v6BudgetBrandFix){sub.dataset.v6BudgetBrandFix='1';sub.addEventListener('change',function(){setTimeout(fix,0)})}
    if(store&&!store.dataset.v6BudgetBrandFix){store.dataset.v6BudgetBrandFix='1';store.addEventListener('change',function(){setTimeout(fix,50)})}
    bindReset();
    fix();
    return true;
  }
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
  setInterval(fix,500);
  window.DigiYarV6BudgetBrandFixReady=true;
})();
