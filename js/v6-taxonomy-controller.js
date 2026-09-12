/* DigiYar V6 — Unified taxonomy guard */
(function(){
  'use strict';
  var STORES=['digikala','snappshop','torob','basalam'];
  var LEGACY=['موبایل و کالای دیجیتال','گوشی موبایل','اندروید','iOS'];
  var DIGITAL='کالای دیجیتال';
  function $(id){return document.getElementById(id)}
  function text(o){return (o&&o.textContent||'').trim()}
  function cleanSelect(select){if(!select)return;Array.from(select.options).forEach(function(o){if(LEGACY.indexOf(text(o))>=0)o.remove()})}
  function loadScript(path){
    if(document.querySelector('script[src$="/'+path+'"]'))return;
    var s=document.createElement('script');
    s.src=new URL(path,document.baseURI).href;
    s.async=false;
    document.head.appendChild(s);
  }
  function normalizeCategory(){
    var store=$('storeSelect'),cat=$('v5Category');
    if(!store||!cat||!store.value||STORES.indexOf(store.value)<0)return;
    cleanSelect(cat);
    var digital=Array.from(cat.options).find(function(o){return o.value==='digital'});
    if(digital){digital.textContent=DIGITAL;return}
    digital=document.createElement('option');digital.value='digital';digital.textContent=DIGITAL;cat.insertBefore(digital,cat.options[1]||null);
  }
  function loadProductOptions(){
    if(window.DigiYarV6ProductOptionsReady||document.querySelector('script[src$="/js/v6-product-options.js"]'))return;
    var s=document.createElement('script');
    s.src=new URL('js/v6-product-options.js',document.baseURI).href;
    s.async=false;
    s.onload=function(){window.DigiYarV6ProductOptionsReady=true;loadScript('js/v6-category-budget-brand-fix.js')};
    s.onerror=function(){loadScript('js/v6-category-budget-brand-fix.js')};
    document.head.appendChild(s);
  }
  function bind(){
    var store=$('storeSelect'),cat=$('v5Category');
    if(!store||!cat)return false;
    if(!store.dataset.v6UnifiedBound){store.dataset.v6UnifiedBound='1';store.addEventListener('change',function(){setTimeout(normalizeCategory,0)})}
    if(!cat.dataset.v6UnifiedBound){cat.dataset.v6UnifiedBound='1';cat.addEventListener('change',function(){setTimeout(normalizeCategory,0)})}
    cleanSelect(cat);normalizeCategory();loadProductOptions();
    if(window.DigiYarV6ProductOptionsReady)loadScript('js/v6-category-budget-brand-fix.js');
    return true;
  }
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
  window.DigiYarV6Taxonomy={normalizeCategory:normalizeCategory};
})();
