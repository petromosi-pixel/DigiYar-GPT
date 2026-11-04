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
 if(budgetField)budgetField.hidden=!open||!cat.value;
 if(dyn){dyn.hidden=!open||!dyn.children.length;dyn.style.display=open&&dyn.children.length?'grid':'none';}
 if(open){
  if(cat)cat.disabled=false;
  if(sub)sub.disabled=!cat||!cat.value||sub.options.length<=1;
  form.querySelectorAll('input,select,textarea,button').forEach(function(field){
   if(field.id==='resetProfile'||field.type==='submit')return;
   if(field!==sub||cat&&cat.value)field.disabled=false;
  });
 }
}
function resetProfile(){
 if(!card||!form)return false;
 // Reset only controls owned by the profile form; do not touch Hooshyar search or results.
 if(window.DigiYarStoreSelection&&typeof window.DigiYarStoreSelection.clear==='function')window.DigiYarStoreSelection.clear();
 if(store){store.value='all';store.dispatchEvent(new Event('change',{bubbles:true}));}
 if(cat){cat.value='';cat.disabled=false;}
 if(sub){sub.value='';sub.disabled=true;}
 form.querySelectorAll('input,select,textarea').forEach(function(field){
  if(field.id==='storeSelect'||field.id==='v5Category'||field.id==='v5Subcategory')return;
  if(field.tagName==='SELECT')field.selectedIndex=0;
  else field.value='';
 });
 var status=$('v8ProfileSearchStatus');if(status&&form.contains(status))status.textContent='';
 setOpen(false);
 return true;
}
function clearProfileResults(){
 var result=$('resultSection');if(result){result.hidden=true;result.classList.remove('is-open');}
 var box=$('v6ResultRecommendations');if(box)box.innerHTML='';
 var summary=$('needSummary');if(summary){summary.innerHTML='';summary.classList.add('empty');summary.hidden=true;}
 var hint=$('resultHint');if(hint)hint.textContent='بر اساس اولویت‌های انتخابی تو به ترتیب زیر پیشنهاد میشن';
}
function showRequiredMessage(message){
 var node=$('v8ProfileRequiredMessage');
 if(!node){
  node=document.createElement('div');node.id='v8ProfileRequiredMessage';node.setAttribute('role','alert');node.setAttribute('aria-live','assertive');
  node.style.cssText='display:none;margin:9px 0 0;padding:9px 12px;border:1px solid rgba(220,38,38,.28);border-radius:10px;background:rgba(220,38,38,.07);color:#d32f2f;text-align:center;font-size:12px;font-weight:800;line-height:1.8';
  var anchor=sub&&sub.closest('.v5-field')||cat&&cat.closest('.v5-field');
  if(anchor&&anchor.parentNode)anchor.insertAdjacentElement('afterend',node);else form.appendChild(node);
 }
 node.textContent=message;node.style.display='block';
}
function hideRequiredMessage(){var node=$('v8ProfileRequiredMessage');if(node)node.style.display='none';}
function validateRequiredProfileFields(){
 if(!cat||!sub)return true;
 var missingCategory=!String(cat.value||'').trim();
 var missingSubcategory=!missingCategory&&!String(sub.value||'').trim();
 if(!missingCategory&&!missingSubcategory){hideRequiredMessage();return true;}
 setOpen(true);
 if(missingCategory){
  showRequiredMessage('برای نمایش نتایج، تکمیل فیلدهای ستاره دار الزامیست.');
  cat.focus();cat.scrollIntoView({behavior:'smooth',block:'center'});
 }else{
  sub.disabled=false;var field=sub.closest('.v5-field');if(field)field.hidden=false;
  showRequiredMessage('برای نمایش نتایج، تکمیل فیلدهای ستاره دار الزامیست.');
  sub.focus();sub.scrollIntoView({behavior:'smooth',block:'center'});
 }
 return false;
}
window.DigiYarValidateRequiredProfileFields=validateRequiredProfileFields;
function markRequiredField(field){
 if(!field)return;
 field.removeAttribute('required');field.setAttribute('aria-required','true');
 var wrap=field.closest('.v5-field');if(!wrap)return;
 wrap.style.position='relative';
 if(!wrap.querySelector('.v8-required-star')){
  var star=document.createElement('small');star.className='v8-required-star';star.textContent='*';
  star.setAttribute('aria-hidden','true');star.title='تکمیل این کادر الزامی است';
  star.style.cssText='position:absolute;top:-8px;right:-8px;z-index:3;color:#e53935;font-size:19px;font-weight:900;line-height:1;pointer-events:none;text-shadow:0 0 1px rgba(255,255,255,.75)';
  wrap.appendChild(star);
 }
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
 markRequiredField(cat);markRequiredField(sub);
 window.DigiYarResetProfileForm=resetProfile;
 if(!window.__dyProfileRecoveryEvents){
  window.__dyProfileRecoveryEvents=true;
  window.addEventListener('digiyar:v7-hooshyar-cleared',clearProfileResults);
  window.addEventListener('digiyar:hooshyar-results-ready',function(){setOpen(false);});
  window.addEventListener('digiyar:profile-search-started',function(){setOpen(false);});
  document.addEventListener('click',function(e){
   var reset=e.target&&e.target.closest&&e.target.closest('#resetProfile');
   if(reset){e.preventDefault();e.stopImmediatePropagation();resetProfile();return;}
   var icon=e.target&&e.target.closest&&e.target.closest('#v5Step4Toggle');
   if(icon)setTimeout(function(){setOpen(toggle.getAttribute('aria-expanded')==='true');},0);
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
  cat.addEventListener('change',function(){hideRequiredMessage();setTimeout(function(){ensureSubcategory();if(sub)sub.disabled=false;setOpen(true);},120);});
 }
 if(sub&&!sub.dataset.dyRecoveryBound){
  sub.dataset.dyRecoveryBound='1';
  sub.addEventListener('change',function(){hideRequiredMessage();setTimeout(function(){ensureDynamicFields();setOpen(true);},120);});
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
