/* DigiYar V6 — Unified taxonomy guard
 * One taxonomy policy for all four stores.
 * The existing Step-4 controller remains responsible for rendering its
 * native category trees; this controller only normalizes the shared
 * digital root and blocks legacy taxonomy from returning.
 */
(function(){
  'use strict';

  var STORES=['digikala','snappshop','torob','basalam'];
  var LEGACY=['موبایل و کالای دیجیتال','گوشی موبایل','اندروید','iOS'];
  var DIGITAL=['کالای دیجیتال'];
  var BRAND_NAMES=['سامسونگ','شیائومی','اپل','نوکیا','ریلمی','آنر','موتورولا','هواوی','گوگل پیکسل','پوکو','وان‌پلاس','ناتینگ فون','تکنو'];

  function $(id){return document.getElementById(id)}
  function text(o){return (o&&o.textContent||'').trim()}
  function isLegacy(o){return LEGACY.indexOf(text(o))>=0}

  function cleanSelect(select){
    if(!select)return;
    Array.from(select.options).forEach(function(o){if(isLegacy(o))o.remove()});
  }

  function normalizeCategory(){
    var store=$('storeSelect'),cat=$('v5Category');
    if(!store||!cat||!store.value||STORES.indexOf(store.value)<0)return;

    cleanSelect(cat);
    var digital=Array.from(cat.options).find(function(o){return o.value==='digital'});
    if(!digital){
      digital=document.createElement('option');
      digital.value='digital';
      digital.textContent=DIGITAL[0];
      cat.insertBefore(digital,cat.options[1]||null);
    }else{
      digital.textContent=DIGITAL[0];
    }
  }

  function cleanLegacyDOM(){
    document.querySelectorAll('select').forEach(cleanSelect);
    document.querySelectorAll('[data-digikala-taxonomy],[data-digikala-taxonomy-field="1"],.digikala-taxonomy,.v6-digikala-taxonomy').forEach(function(e){e.remove()});
  }

  function ensureBrand(){
    var sub=$('v5Subcategory'),dyn=$('v5DynamicFields');
    if(!sub||!dyn||sub.value!=='mobile')return;
    var old=document.getElementById('v6UnifiedBrandField');
    if(old)old.remove();
    var field=document.createElement('label');
    field.id='v6UnifiedBrandField';
    field.className='v5-field v5-final-function full';
    field.innerHTML='<span>برند</span><select id="v6UnifiedBrand"><option value="">برند</option>'+BRAND_NAMES.map(function(b,i){return '<option value="'+i+'">'+b+'</option>'}).join('')+'</select>';
    dyn.appendChild(field);
  }

  function bind(){
    var store=$('storeSelect'),cat=$('v5Category'),sub=$('v5Subcategory');
    if(!store||!cat)return false;

    if(!store.dataset.v6UnifiedBound){
      store.dataset.v6UnifiedBound='1';
      store.addEventListener('change',function(){window.setTimeout(function(){cleanLegacyDOM();normalizeCategory()},0)});
    }
    if(!cat.dataset.v6UnifiedBound){
      cat.dataset.v6UnifiedBound='1';
      cat.addEventListener('change',function(){window.setTimeout(function(){cleanLegacyDOM();normalizeCategory()},0)});
    }
    sub=$('v5Subcategory');
    if(sub&&!sub.dataset.v6UnifiedBound){
      sub.dataset.v6UnifiedBound='1';
      sub.addEventListener('change',function(){window.setTimeout(ensureBrand,0)});
    }

    cleanLegacyDOM();
    normalizeCategory();
    ensureBrand();
    return true;
  }

  function boot(){
    cleanLegacyDOM();
    if(bind()){
      var root=document.querySelector('.v5-profile-card')||document.body;
      var observer=new MutationObserver(function(){
        cleanLegacyDOM();
        normalizeCategory();
      });
      observer.observe(root,{childList:true,subtree:true});
      [50,300,1000].forEach(function(ms){window.setTimeout(function(){cleanLegacyDOM();bind()},ms)});
    }else window.setTimeout(boot,100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else window.setTimeout(boot,0);

  window.DigiYarV6Taxonomy={normalizeCategory:normalizeCategory,cleanLegacyDOM:cleanLegacyDOM};
})();
