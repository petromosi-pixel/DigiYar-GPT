/* DigiYar V6 — درمان کالا taxonomy */
(function(){
'use strict';
var ID='darmankala';
var ROOTS=[
 {id:'medical',name:'تجهیزات پزشکی'},
 {id:'orthopedic',name:'ارتوپدی و توانبخشی'},
 {id:'home-health',name:'سلامت و مراقبت در منزل'},
 {id:'beauty-hygiene',name:'آرایشی و بهداشتی'},
 {id:'mother-child',name:'مادر و کودک'},
 {id:'dental',name:'تجهیزات و ملزومات دندانپزشکی'},
 {id:'fitness',name:'تناسب اندام و زیبایی'}
];
var SUBS={
 medical:[['diagnostic','تجهیزات تشخیصی و اندازه‌گیری'],['respiratory','تجهیزات تنفسی'],['hospital','تجهیزات بیمارستانی و کلینیکی'],['home-medical','تجهیزات پزشکی خانگی'],['consumable','ملزومات مصرفی پزشکی']],
 orthopedic:[['mobility','وسایل کمک حرکتی'],['support','بریس و ساپورت‌های طبی'],['compression','جوراب و محصولات فشاری'],['rehab','توانبخشی و فیزیوتراپی'],['cushion','بالش و تشک طبی']],
 'home-health':[['blood-pressure','فشارسنج و متعلقات'],['thermometer','تب‌سنج'],['oxygen','اکسیژن‌ساز و پالس‌اکسی‌متر'],['air-care','بخور، تصفیه و مراقبت هوای منزل'],['massage','ماساژور و مراقبت حرکتی']],
 'beauty-hygiene':[['skin','مراقبت پوست'],['hair','مراقبت مو'],['sun','ضدآفتاب'],['oral','مراقبت دهان و دندان'],['personal','بهداشت شخصی'],['cosmetic','آرایشی'],['body','مراقبت بدن']],
 'mother-child':[['baby-food','غذای کودک'],['baby-care','مراقبت و بهداشت کودک'],['pregnancy','مادر باردار و شیرده'],['baby-medical','لوازم پزشکی مادر و کودک']],
 dental:[['dental-equipment','تجهیزات دندانپزشکی'],['dental-consumable','مواد و ملزومات مصرفی دندانپزشکی'],['oral-care','بهداشت و مراقبت دهان و دندان']],
 fitness:[['exercise','لوازم ورزشی و تناسب اندام'],['weight-loss','لاغری و کنترل وزن'],['beauty-equipment','تجهیزات زیبایی و مراقبت تخصصی']]
};
var BRANDS={
 medical:['Beurer','زنیت‌مد','Zenithmed','Rossmax','Omron','Yuwell'],
 orthopedic:['طب و صنعت','Tynor','Orliman','OPPO','Verna'],
 'home-health':['Beurer','Omron','Rossmax','Yuwell','زنیت‌مد'],
 'beauty-hygiene':['لافارر','مای','پریم','کامان','سریتا','الارو','آردن','ویتالیر','سان‌سیف','هیدرودرم'],
 'mother-child':['Nestlé','PediaBest','Fisher Kinder','Aptamil','Nan','Humana'],
 dental:['Woodpecker','NSK','Dentsply Sirona','Coltene','3M'],
 fitness:['Beurer','Aptonia','Powertec','Reebok','Technogym']
};
function norm(v){return String(v||'').trim()}
function fill(select,items,placeholder){if(!select)return;select.innerHTML='';if(placeholder){var p=document.createElement('option');p.value='';p.textContent=placeholder;select.appendChild(p)}(items||[]).forEach(function(x){var o=document.createElement('option');o.value=x[0]||x.id;o.textContent=x[1]||x.name;select.appendChild(o)})}
function find(id){return document.getElementById(id)}
function rootList(){return ROOTS.map(function(x){return [x.id,x.name]})}
function apply(){var store=find('storeSelect');if(!store||store.value!==ID)return false;var cat=find('v5Category'),sub=find('v5Subcategory'),brand=find('v6BrandField');fill(cat,rootList(),'انتخاب دسته‌بندی');if(!cat.dataset.dkBound){cat.dataset.dkBound='1';cat.addEventListener('change',function(){applySub();})}if(!sub.dataset.dkBound){sub.dataset.dkBound='1';sub.addEventListener('change',applyBrand)}applySub();return true}
function applySub(){var cat=find('v5Category'),sub=find('v5Subcategory');if(!cat||!sub)return;fill(sub,SUBS[cat.value]||[],'انتخاب زیردسته');applyBrand()}
function applyBrand(){var cat=find('v5Category'),sub=find('v5Subcategory'),brand=find('v6BrandField');if(!brand)return;var brands=BRANDS[cat&&cat.value]||[];if(brands.length){fill(brand,brands.map(function(x){return [x,x]}),'انتخاب برند')}else fill(brand,[],'انتخاب برند')}
function boot(){if(apply())return;setTimeout(boot,150)}
window.DigiYarDarmankalaTaxonomy={apply:apply,roots:ROOTS,subcategories:SUBS,brands:BRANDS};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
