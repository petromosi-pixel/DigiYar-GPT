/* DigiYar V7 — Dayan Shop taxonomy
   Source: public Dayan Shop category references.
   Flow: category -> subcategory -> brand (when available) -> budget.
*/
(function(){
'use strict';
var STORE='dayan';
var ROOTS=[['men','لباس مردانه'],['shoes','کفش مردانه'],['women','پوشاک زنانه'],['accessories','اکسسوری']];
var SUBS={men:[['jacket','کاپشن و کت'],['knitwear','بافت، پلیور، ژاکت'],['shirt','پیراهن'],['tshirt','تیشرت'],['set','ست مردانه'],['trousers','شلوار'],['hoodie','هودی و سویشرت'],['sweatshirt','بلوز و دورس'],['tank','رکابی مردانه']],shoes:[['sport','کفش اسپرت و ورزشی'],['ankle-boots','نیم بوت'],['casual','کفش روزمره و راحتی'],['formal','کفش رسمی و مجلسی'],['sandal','صندل مردانه']],women:[['women','پوشاک زنانه']],accessories:[['watch-set','ست ساعت مچی'],['analog-watch','ساعت مچی عقربه‌ای'],['eyewear','عینک']]};
var BRANDS={
 jacket:['اسپان'],knitwear:['اسپان'],shirt:['اسپان'],tshirt:['اسپان'],set:['اسپان'],trousers:['اسپان'],hoodie:['اسپان'],sweatshirt:['اسپان'],tank:['اسپان'],
 sport:['Araz','Adidas','Imaz','Dior','Kenzo','Nike'], 'ankle-boots':['Cat','Maran'],casual:['Araz','Maran','Nike'],formal:['Clarks','Carlo','Nika'],sandal:['Lima','Nike'],
 women:[],accessories:[]
};
function $(id){return document.getElementById(id)}function ensureOption(){var s=$('storeSelect');if(!s||Array.from(s.options).some(function(o){return o.value===STORE}))return;var o=document.createElement('option');o.value=STORE;o.textContent='دایان شاپ';s.appendChild(o)}

function selected(){var s=$('storeSelect');return s&&s.value===STORE}
function setRoots(){var cat=$('v5Category');if(!cat||!selected())return;cat.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');cat.disabled=false;var sub=$('v5Subcategory');if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
function setSubs(){if(!selected())return;var cat=$('v5Category'),sub=$('v5Subcategory');if(!cat||!sub)return;var list=SUBS[cat.value]||[];sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sub.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
function setBrand(){if(!selected())return;var sub=$('v5Subcategory');if(!sub||!sub.value)return;var brands=BRANDS[sub.value]||[];if(!brands.length)return;var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field'),dyn=$('v5DynamicFields');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function bind(){ensureOption();var s=$('storeSelect'),c=$('v5Category'),sub=$('v5Subcategory');if(!s||!c)return false;if(!s.dataset.v7DayanTax){s.dataset.v7DayanTax='1';s.addEventListener('change',function(){if(selected())setTimeout(setRoots,30)})}if(!c.dataset.v7DayanTax){c.dataset.v7DayanTax='1';c.addEventListener('change',function(){setTimeout(setSubs,30)})}if(sub&&!sub.dataset.v7DayanTax){sub.dataset.v7DayanTax='1';sub.addEventListener('change',function(){setTimeout(setBrand,30)})}if(selected())setRoots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();