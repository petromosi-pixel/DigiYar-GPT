/* DigiYar V6 — Unified taxonomy guard */
(function(){
  'use strict';
  var STORES=['digikala','snappshop','torob','basalam','banimode','modiseh','technolife','meghdadit'];
  var LEGACY=['موبایل و کالای دیجیتال','گوشی موبایل','اندروید','iOS'];
  var DIGITAL='کالای دیجیتال';
  var MEGHDAD={id:'meghdadit',name:'مقداد آی‌تی',tagline:'فروشگاه تخصصی کالای دیجیتال و قطعات',logo:'assets/store-logos/meghdadit-temp.svg',mark:'MI',url:'https://meghdadit.com/',accent:'#1f3b68',dealLabel:'خرید کالای دیجیتال',dealText:'لپ‌تاپ، کامپیوتر، قطعات و تجهیزات دیجیتال',dealIcon:'⌁'};
  function $(id){return document.getElementById(id)}
  function text(o){return (o&&o.textContent||'').trim()}
  function cleanSelect(select){if(!select)return;Array.from(select.options).forEach(function(o){if(LEGACY.indexOf(text(o))>=0)o.remove()})}
  function ensureMeghdadStore(){
    var stores=window.DigiYarPopularAffiliateStores;
    if(Array.isArray(stores)&&!stores.some(function(s){return s&&s.id==='meghdadit'})){
      var item=Object.assign({},MEGHDAD),techIndex=stores.findIndex(function(s){return s&&s.id==='technolife'});
      if(techIndex>=0)stores.splice(techIndex+1,0,item);else stores.push(item);
    }
    var select=$('storeSelect');
    if(select&&!Array.from(select.options).some(function(o){return o.value==='meghdadit'})){
      var option=document.createElement('option');option.value='meghdadit';option.textContent='مقداد آی‌تی';
      var tech=Array.from(select.options).find(function(o){return o.value==='technolife'});
      if(tech&&tech.nextSibling)select.insertBefore(option,tech.nextSibling);else if(tech)select.appendChild(option);else select.appendChild(option);
    }
    var grid=$('platforms');
    if(grid&&!grid.querySelector('[data-store="meghdadit"]')){
      var a=document.createElement('a');a.className='platform';a.href=MEGHDAD.url;a.target='_blank';a.rel='noopener noreferrer';a.dataset.store='meghdadit';a.setAttribute('aria-label','ورود به مقداد آی‌تی');
      a.innerHTML='<div class="platform-main"><span class="platform-logo platform-logo-new" aria-hidden="true"><img src="'+MEGHDAD.logo+'" alt="" loading="lazy" decoding="async"><span class="platform-mark" style="display:none">MI</span></span><span class="platform-name">مقداد آی‌تی</span><span class="platform-tag">'+MEGHDAD.tagline+'</span></div><span class="platform-btn">ورود به فروشگاه</span>';
      var techCard=grid.querySelector('[data-store="technolife"]');
      if(techCard&&techCard.nextSibling)grid.insertBefore(a,techCard.nextSibling);else if(techCard)grid.appendChild(a);else grid.appendChild(a);
    }
  }
  function loadScript(path){
    if(document.querySelector('script[src$="/'+path+'"]'))return;
    var s=document.createElement('script');
    s.src=new URL(path,document.baseURI).href;
    s.async=false;
    document.head.appendChild(s);
  }
  function loadTaxonomies(){
    loadScript('js/v6-store-taxonomy-overrides.js');
    loadScript('js/v6-technolife-taxonomy.js');
    loadScript('js/v6-meghdadit-taxonomy.js');
  }
  function normalizeCategory(){
    var store=$('storeSelect'),cat=$('v5Category');
    if(!store||!cat||!store.value||STORES.indexOf(store.value)<0)return;
    cleanSelect(cat);
    if(store.value==='technolife'||store.value==='meghdadit')return;
    var digital=Array.from(cat.options).find(function(o){return o.value==='digital'});
    if(digital){digital.textContent=DIGITAL;return}
    digital=document.createElement('option');digital.value='digital';digital.textContent=DIGITAL;cat.insertBefore(digital,cat.options[1]||null);
  }
  function loadProductOptions(){
    if(window.DigiYarV6ProductOptionsReady||document.querySelector('script[src$="/js/v6-product-options.js"]')){
      loadTaxonomies();
      return;
    }
    var s=document.createElement('script');
    s.src=new URL('js/v6-product-options.js',document.baseURI).href;
    s.async=false;
    s.onload=function(){window.DigiYarV6ProductOptionsReady=true;loadTaxonomies();loadScript('js/v6-category-budget-brand-fix.js')};
    s.onerror=function(){loadTaxonomies();loadScript('js/v6-category-budget-brand-fix.js')};
    document.head.appendChild(s);
  }
  function bind(){
    var store=$('storeSelect'),cat=$('v5Category');
    if(!store||!cat)return false;
    ensureMeghdadStore();
    if(!store.dataset.v6UnifiedBound){store.dataset.v6UnifiedBound='1';store.addEventListener('change',function(){setTimeout(normalizeCategory,0)})}
    if(!cat.dataset.v6UnifiedBound){cat.dataset.v6UnifiedBound='1';cat.addEventListener('change',function(){setTimeout(normalizeCategory,0)})}
    cleanSelect(cat);normalizeCategory();loadProductOptions();
    if(window.DigiYarV6ProductOptionsReady){loadTaxonomies();loadScript('js/v6-category-budget-brand-fix.js')}
    return true;
  }
  function boot(){if(bind()){
    var attempts=0;
    var syncTimer=setInterval(function(){ensureMeghdadStore();if(++attempts>=20)clearInterval(syncTimer)},250);
    return;
  }setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
  window.DigiYarV6Taxonomy={normalizeCategory:normalizeCategory};
})();
