/* DigiYar V6 — Unified store taxonomy controller
 * Single owner of the visible Store → Category → Subcategory → Brand flow.
 * It deliberately rebuilds the digital branch for all connected stores so
 * legacy "موبایل و کالای دیجیتال" trees cannot survive in the live DOM.
 */
(function(){
  'use strict';
  var STORES={
    digikala:{digital:'کالای دیجیتال'},
    snappshop:{digital:'کالای دیجیتال'},
    torob:{digital:'کالای دیجیتال'},
    basalam:{digital:'کالای دیجیتال'}
  };
  var DIGITAL=[
    ['mobile','موبایل'],['laptop','لپ‌تاپ'],['tablet','تبلت'],
    ['headphones','هدفون و هندزفری'],['tv','تلویزیون'],['camera','دوربین'],
    ['accessories','لوازم جانبی'],['gaming','کنسول و گیم']
  ];
  var BRANDS=['سامسونگ','شیائومی','اپل','نوکیا','ریلمی','آنر','موتورولا','هواوی','گوگل پیکسل','پوکو','وان‌پلاس','ناتینگ فون','تکنو','موتورولا'];
  var LEGACY=['موبایل و کالای دیجیتال','گوشی موبایل','اندروید','iOS'];
  var bound=false, busy=false;
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c]})}
  function cleanSelect(select){
    if(!select)return;
    Array.from(select.options).forEach(function(o){if(LEGACY.indexOf((o.textContent||'').trim())>=0)o.remove()});
  }
  function fill(select,list,placeholder){
    if(!select)return;
    select.innerHTML='<option value="">'+esc(placeholder)+'</option>'+list.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('');
    select.disabled=!list.length;
    select.value='';
  }
  function ensureSub(){
    var sub=$('v5Subcategory'),cat=$('v5Category');
    if(sub)return sub;
    if(!cat)return null;
    var label=document.createElement('label');label.id='v6UnifiedSubcategoryField';label.className='v5-field full';
    label.innerHTML='<span>زیر دسته</span><select id="v5Subcategory" disabled><option value="">ابتدا دسته‌بندی را انتخاب کنید</option></select>';
    var grid=cat.closest('.form-grid');if(grid)grid.insertBefore(label,$('v5DynamicFields'));else cat.parentElement.appendChild(label);
    return label.querySelector('#v5Subcategory');
  }
  function ensureBrand(){
    var dyn=$('v5DynamicFields');if(!dyn)return null;
    var old=document.getElementById('v6UnifiedBrandField');if(old)old.remove();
    var f=document.createElement('label');f.id='v6UnifiedBrandField';f.className='v5-field v5-final-function full';
    f.innerHTML='<span>برند</span><select id="v6UnifiedBrand" disabled><option value="">ابتدا موبایل را انتخاب کنید</option></select>';
    dyn.appendChild(f);return f.querySelector('select');
  }
  function removeDynamic(){
    var dyn=$('v5DynamicFields');if(!dyn)return;
    Array.from(dyn.querySelectorAll('[data-digikala-taxonomy-field="1"],.digiyar-digikala-taxonomy')).forEach(function(e){e.remove()});
    var b=document.getElementById('v6UnifiedBrandField');if(b)b.remove();
  }
  function apply(){
    if(busy)return;busy=true;
    try{
      var store=$('storeSelect'),cat=$('v5Category'),sub=ensureSub(),dyn=$('v5DynamicFields');
      if(!store||!cat)return;
      cleanSelect(store);cleanSelect(cat);cleanSelect(sub);
      var sid=store.value;
      if(!sid||!STORES[sid]){
        cat.innerHTML='<option value="">ابتدا فروشگاه را انتخاب کنید</option>';cat.disabled=true;
        if(sub){sub.innerHTML='<option value="">ابتدا دسته‌بندی را انتخاب کنید</option>';sub.disabled=true}
        removeDynamic();return;
      }
      cat.innerHTML='<option value="">دسته‌بندی</option><option value="digital">'+esc(STORES[sid].digital)+'</option><option value="home">خانه و آشپزخانه</option><option value="fashion">مد و پوشاک</option><option value="other">سایر</option>';
      cat.disabled=false;
      if(cat.value!=='digital'){
        if(sub){sub.innerHTML='<option value="">ابتدا دسته‌بندی را انتخاب کنید</option>';sub.disabled=true}
        removeDynamic();return;
      }
      fill(sub,DIGITAL,'زیر دسته');
      removeDynamic();
    }finally{busy=false}
  }
  function onSub(){
    var sub=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!sub||!dyn)return;
    var old=document.getElementById('v6UnifiedBrandField');if(old)old.remove();
    if(sub.value!=='mobile')return;
    var brand=ensureBrand();if(brand)fill(brand,BRANDS.map(function(x,i){return[String(i),x]}),'برند');
  }
  function hardClean(){
    document.querySelectorAll('select').forEach(cleanSelect);
    document.querySelectorAll('[data-digikala-taxonomy],.digikala-taxonomy,.v6-digikala-taxonomy').forEach(function(e){e.remove()});
  }
  function bind(){
    var store=$('storeSelect'),cat=$('v5Category'),sub=$('v5Subcategory');if(!store||!cat)return false;
    if(!store.dataset.v6UnifiedBound){store.dataset.v6UnifiedBound='1';store.addEventListener('change',function(){apply()})}
    if(!cat.dataset.v6UnifiedBound){cat.dataset.v6UnifiedBound='1';cat.addEventListener('change',function(){apply();onSub()})}
    sub=ensureSub();
    if(sub&&!sub.dataset.v6UnifiedBound){sub.dataset.v6UnifiedBound='1';sub.addEventListener('change',onSub)}
    apply();onSub();return true;
  }
  function boot(){
    hardClean();
    if(bind()){
      var observer=new MutationObserver(function(){
        hardClean();
        var store=$('storeSelect'),cat=$('v5Category');
        if(store&&cat&&store.value&&cat.value==='digital'){
          var sub=$('v5Subcategory');
          if(sub&&sub.options.length&&sub.options[0].textContent!=='زیر دسته')apply();
        }
      });
      observer.observe(document.querySelector('.v5-profile-card')||document.body,{childList:true,subtree:true});
      window.setTimeout(function(){hardClean();bind()},50);
      window.setTimeout(function(){hardClean();bind()},300);
      window.setTimeout(function(){hardClean();bind()},1000);
    }else window.setTimeout(boot,100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
  window.DigiYarV6Taxonomy={apply:apply,hardClean:hardClean};
})();