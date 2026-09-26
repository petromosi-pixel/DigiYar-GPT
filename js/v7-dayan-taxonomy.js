/* DigiYar V7 — Dayan Shop taxonomy
   Source: public Dayan Shop category references.
   Flow: category -> subcategory -> brand (when available) -> budget.
*/
(function(){
'use strict';
var STORE='dayan';
var ROOTS=[
 ['men','پوشاک مردانه'],
 ['women','پوشاک زنانه'],
 ['kids','پوشاک بچگانه'],
 ['accessories','اکسسوری'],
 ['digital','لوازم دیجیتال'],
 ['home','لوازم منزل']
];
var SUBS={
 men:[
  ['sets','ست‌های مردانه'],['shirts','پیراهن مردانه'],['tshirts','تیشرت و پولو شرت مردانه'],
  ['trousers','شلوار مردانه'],['shorts','شلوارک مردانه'],['underwear','لباس زیر مردانه'],
  ['sports','پوشاک و لوازم ورزشی مردانه'],['shoes','کفش مردانه'],['bags','کیف مردانه'],
  ['outerwear','کاپشن و لباس گرم مردانه']
 ],
 women:[
  ['mantle','مانتو'],['scarf','شال و روسری'],['dress','پیراهن و لباس مجلسی زنانه'],
  ['tshirts','تیشرت و تونیک زنانه'],['trousers','شلوار زنانه'],['sets','ست زنانه'],
  ['couple','ست عاشقانه دونفره'],['outerwear','کاپشن، بافت و سویشرت زنانه'],
  ['shoes','کفش زنانه'],['bags','کیف زنانه']
 ],
 kids:[
  ['girls','پوشاک دخترانه'],['boys','پوشاک پسرانه'],['baby','لباس نوزادی'],
  ['shoes','کفش بچگانه'],['toys','اسباب‌بازی']
 ],
 accessories:[
  ['gift','پک هدیه مناسبتی'],['sunglasses','عینک آفتابی و روزمره'],['watch-analog','ساعت مچی عقربه‌ای'],
  ['watch-set','ست ساعت مچی'],['watch-digital','ساعت مچی دیجیتال'],['gadget','گجت'],
  ['perfume','عطر و ادکلن'],['jewelry','زیورآلات']
 ],
 digital:[
  ['mobile-accessories','لوازم جانبی موبایل'],['handsfree','هندزفری'],['monopod','مونوپاد'],
  ['powerbank','پاوربانک'],['charger','شارژر'],['speakers','اسپیکر و صوتی'],
  ['gaming','لوازم و تجهیزات گیمینگ'],['camera','دوربین و تجهیزات']
 ],
 home:[
  ['decor','دکوراسیون'],['wall-clock','ساعت دیواری'],['utility','لوازم کاربردی'],['food','مواد غذایی']
 ]};
var BRANDS={};
function $(id){return document.getElementById(id)}
function selected(){var s=$('storeSelect');return s&&s.value===STORE}
function setRoots(){var cat=$('v5Category');if(!cat||!selected())return;cat.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');cat.disabled=false;var sub=$('v5Subcategory');if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
function setSubs(){if(!selected())return;var cat=$('v5Category'),sub=$('v5Subcategory');if(!cat||!sub)return;var list=SUBS[cat.value]||[];sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sub.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
function setBrand(){if(!selected())return;var sub=$('v5Subcategory');if(!sub||!sub.value)return;var brands=BRANDS[sub.value]||[];var old=$('v6BrandField');if(old)old.remove();if(!brands.length)return;var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field'),dyn=$('v5DynamicFields');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function bind(){var s=$('storeSelect'),c=$('v5Category'),sub=$('v5Subcategory');if(!s||!c)return false;if(!s.dataset.v7DayanTax){s.dataset.v7DayanTax='1';s.addEventListener('change',function(){if(selected())setTimeout(setRoots,30)})}if(!c.dataset.v7DayanTax){c.dataset.v7DayanTax='1';c.addEventListener('change',function(){setTimeout(setSubs,30)})}if(sub&&!sub.dataset.v7DayanTax){sub.dataset.v7DayanTax='1';sub.addEventListener('change',function(){setTimeout(setBrand,30)})}if(selected())setRoots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();