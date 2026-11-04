/* DigiYar V8 — profile form recovery, completion and taxonomy safety net */
(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var card,form,store,cat,sub,toggle;
function setOpen(open){
 if(!card||!form)return;
 card.classList.toggle('is-open',!!open);
 form.hidden=false;form.setAttribute('aria-hidden',String(!open));form.style.display='block';
 if(toggle){toggle.setAttribute('aria-expanded',String(!!open));toggle.setAttribute('aria-label',open?'بستن جزئیات خرید':'باز کردن جزئیات خرید');var h=card.querySelector('.section-title h2');if(h)h.setAttribute('aria-expanded',String(!!open));}
 var catField=cat&&cat.closest('.v5-field'),subField=sub&&sub.closest('.v5-field');
 var budget=$('budgetMax'),budgetField=budget&&budget.closest('.v5-field'),dyn=$('v5DynamicFields');
 if(catField)catField.hidden=!open;
 if(subField)subField.hidden=!open||!cat.value;
 if(budgetField)budgetField.hidden=!open||cat.value!=='digital';
 if(dyn){dyn.hidden=!open||!dyn.children.length;dyn.style.display=open&&dyn.children.length?'grid':'none';}
 if(!open){if(cat)cat.disabled=true;if(sub)sub.disabled=true;}
 else if(cat)cat.disabled=!store.value;
}
function clearSearch(){
 var input=$('v5SmartSearchInput');
 if(input){input.value='';input.disabled=false;input.placeholder='';input.dispatchEvent(new Event('input',{bubbles:true}));}
 ['v5SmartSearchResults','v6StoreSimulatorResults'].forEach(function(id){var n=$(id);if(n)n.remove();});
}
function resetProfile(){
 if(!card||!form)return false;
 if(store)store.value='';
 if(cat){cat.value='';cat.disabled=true;cat.innerHTML='<option value="">ابتدا فروشگاه را انتخاب کنید</option>';}
 if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">ابتدا دسته‌بندی را انتخاب کنید</option>';}
 ['v6BrandField','v6UsageField'].forEach(function(id){var n=$(id);if(n)n.remove();});
 ['budgetMax','budgetMin','v6BudgetRange'].forEach(function(id){var n=$(id);if(n){n.value='';if(n.tagName==='SELECT')n.selectedIndex=0;}});
 var dyn=$('v5DynamicFields');if(dyn){dyn.innerHTML='';dyn.hidden=true;dyn.style.display='none';}
 var result=$('resultSection');if(result){result.hidden=true;result.classList.remove('is-open');}
 ['digiyar-products','recommendations','v6ResultRecommendations'].forEach(function(id){var n=$(id);if(n)n.innerHTML='';});
 var summary=$('needSummary');if(summary){summary.innerHTML='';summary.hidden=true;summary.classList.add('empty');}
 var status=$('v8ProfileSearchStatus');if(status)status.textContent='';
 clearSearch();
 if(window.DigiYarStoreSelection&&typeof window.DigiYarStoreSelection.clear==='function')window.DigiYarStoreSelection.clear();
 setOpen(true);
 return true;
}
function ensureDynamicFields(){
 if(!sub||!sub.value)return;
 var dyn=$('v5DynamicFields'),budget=$('v6BudgetRange'),budgetField=budget&&budget.closest('.v5-field');
 if(!$('v6BrandField')){
  var brand=document.createElement('label');brand.id='v6BrandField';brand.className='v5-field full';
  brand.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option><option value="any">فرقی نمی‌کند</option></select>';
  if(budgetField&&budgetField.parentNode)budgetField.parentNode.insertBefore(brand,budgetField);
  else if(dyn)dyn.appendChild(brand);
 }
 var existingBrand=$('v6Brand');
 if(existingBrand&&!Array.from(existingBrand.options).some(function(o){return o.value==='any';})){var any=document.createElement('option');any.value='any';any.textContent='فرقی نمی‌کند';existingBrand.appendChild(any);}
 if(!$('v6UsageField')){
  var usage=document.createElement('label');usage.id='v6UsageField';usage.className='v5-field full';
  usage.innerHTML='<span>نوع استفاده</span><select id="v6Usage"><option value="">نوع استفاده</option><option value="daily">استفاده روزمره</option><option value="work">کار و استفاده تخصصی</option><option value="family">استفاده خانوادگی</option><option value="gift">هدیه</option><option value="other">سایر موارد</option></select>';
  if(budgetField&&budgetField.parentNode)budgetField.parentNode.insertBefore(usage,budgetField.nextSibling);
  else if(dyn)dyn.appendChild(usage);
 }
 if(dyn){dyn.hidden=false;dyn.style.display='grid';}
}
function ensureSubcategory(){
 if(!cat||!cat.value||!sub)return;
 if(sub.options.length<=1){
  var label=cat.options[cat.selectedIndex]&&cat.options[cat.selectedIndex].textContent||'این دسته';
  sub.innerHTML='';
  var ph=document.createElement('option');ph.value='';ph.textContent='انتخاب زیر دسته';sub.appendChild(ph);
  var fallback=document.createElement('option');fallback.value=cat.value;fallback.textContent='سایر موارد مرتبط با '+label;sub.appendChild(fallback);
  sub.disabled=false;
 }
}
function bind(){
 card=$('v7ProfileSearchHost');form=$('profileForm');store=$('storeSelect');cat=$('v5Category');sub=$('v5Subcategory');toggle=$('v5Step4Toggle');
 if(!card||!form||!store||!cat||!toggle)return false;
 window.DigiYarResetProfileForm=resetProfile;
 if(!window.__dyProfileRecoveryEvents){
  window.__dyProfileRecoveryEvents=true;
  window.addEventListener('digiyar:v7-hooshyar-cleared',resetProfile);
  window.addEventListener('digiyar:hooshyar-results-ready',function(){setOpen(false);});
  document.addEventListener('click',function(e){
   var reset=e.target&&e.target.closest&&e.target.closest('#resetProfile');
   if(reset){e.preventDefault();e.stopImmediatePropagation();resetProfile();return;}
  },true);
 }
 var heading=card.querySelector('.section-title h2');
 if(heading&&!heading.dataset.dyToggleBound){
  heading.dataset.dyToggleBound='1';heading.tabIndex=0;heading.setAttribute('role','button');heading.setAttribute('aria-expanded',toggle.getAttribute('aria-expanded')||'false');
  heading.style.cursor='pointer';
  function flip(){var open=toggle.getAttribute('aria-expanded')==='true';setOpen(!open);heading.setAttribute('aria-expanded',String(!open));}
  heading.addEventListener('click',function(e){e.preventDefault();flip();});
  heading.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});
  toggle.addEventListener('click',function(){heading.setAttribute('aria-expanded',toggle.getAttribute('aria-expanded')||'false');});
 }
 if(!cat.dataset.dyRecoveryBound){
  cat.dataset.dyRecoveryBound='1';
  cat.addEventListener('change',function(){setTimeout(function(){ensureSubcategory();setOpen(true);},120);});
 }
 if(sub&&!sub.dataset.dyRecoveryBound){
  sub.dataset.dyRecoveryBound='1';
  sub.addEventListener('change',function(){setTimeout(function(){ensureDynamicFields();setOpen(true);},120);});
 }
 if(!form.dataset.dyRecoverySubmitBound){
  form.dataset.dyRecoverySubmitBound='1';
  form.addEventListener('submit',function(){setTimeout(function(){setOpen(false);},0);},false);
 }
 return true;
}
function boot(){if(bind())return;setTimeout(boot,100);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
var retries=0;var retry=setInterval(function(){if(bind()||++retries>30)clearInterval(retry);},250);
})();
