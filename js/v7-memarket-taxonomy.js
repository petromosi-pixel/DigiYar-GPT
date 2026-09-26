/* DigiYar V7 — MeMarket taxonomy
   Source: published MeMarket category listing.
   Flow: category -> subcategory -> brand (when available) -> budget.
*/
(function(){
'use strict';
var STORE='memarket';
var ROOTS=[
 ['men','مردانه'],['women','زنانه'],['bags','کیف و کوله'],['watch','ساعت مچی'],
 ['jewelry','زیورآلات'],['home','لوازم خانگی'],['digital','کالای دیجیتال'],
 ['beauty','آرایشی و بهداشتی'],['adult','محصولات زناشویی'],['sale','شگفت‌انگیزها'],['one-size','تک‌سایزها']
];
var SUBS={
 men:[
  ['clothes','پوشاک مردانه'],['shirt','پیراهن'],['knitwear','بافت'],['outfit','ست مردانه'],
  ['couple','ست دونفره'],['trousers','شلوار و شلوارک'],['tshirt','تیشرت و پولوشرت'],
  ['outwear','سوییشرت و کاپشن'],['coat','کت مردانه'],['shoes','کفش مردانه'],
  ['boots','بوت و نیم‌بوت مردانه'],['formal-shoes','کفش رسمی مردانه'],['sport-shoes','کفش ورزشی مردانه'],
  ['flat-shoes','کفش تخت مردانه'],['college','کالج مردانه'],['sandal','صندل مردانه']
 ],
 women:[
  ['clothes','پوشاک زنانه'],['shoes','کفش زنانه'],['bags','کیف زنانه']
 ],
 bags:[['bag','کیف و کوله']],
 watch:[['watch','ساعت مچی']],
 jewelry:[['jewelry','زیورآلات']],
 home:[['household','لوازم خانگی']],
 digital:[['digital','کالای دیجیتال']],
 beauty:[['personal','آرایشی و بهداشتی']],
 adult:[['adult','محصولات زناشویی']],
 sale:[['sale','شگفت‌انگیزها']],
 'one-size':[['one-size','تک‌سایزها']]
};
var BRANDS={};
function $(id){return document.getElementById(id)}function ensureOption(){var s=$('storeSelect');if(!s||Array.from(s.options).some(function(o){return o.value===STORE}))return;var o=document.createElement('option');o.value=STORE;o.textContent='می‌مارکت';s.appendChild(o)}

function selected(){var s=$('storeSelect');return s&&s.value===STORE}
function setRoots(){var cat=$('v5Category');if(!cat||!selected())return;cat.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');cat.disabled=false;var sub=$('v5Subcategory');if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
function setSubs(){if(!selected())return;var cat=$('v5Category'),sub=$('v5Subcategory');if(!cat||!sub)return;var list=SUBS[cat.value]||[];sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sub.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
function setBrand(){if(!selected())return;var sub=$('v5Subcategory');if(!sub||!sub.value)return;var brands=BRANDS[sub.value]||[];var old=$('v6BrandField');if(old)old.remove();if(!brands.length)return;var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field'),dyn=$('v5DynamicFields');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function bind(){ensureOption();var s=$('storeSelect'),c=$('v5Category'),sub=$('v5Subcategory');if(!s||!c)return false;if(!s.dataset.v7MeMarketTax){s.dataset.v7MeMarketTax='1';s.addEventListener('change',function(){if(selected())setTimeout(setRoots,30)})}if(!c.dataset.v7MeMarketTax){c.dataset.v7MeMarketTax='1';c.addEventListener('change',function(){setTimeout(setSubs,30)})}if(sub&&!sub.dataset.v7MeMarketTax){sub.dataset.v7MeMarketTax='1';sub.addEventListener('change',function(){setTimeout(setBrand,30)})}if(selected())setRoots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();