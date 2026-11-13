/* DigiYar V6 — Store #15: درمان کالا taxonomy
   Structure: category → subcategory → brand → budget
*/
(function(){
'use strict';
var STORE='darmankala';
var ROOTS=[['medical','تجهیزات پزشکی'],['orthopedic','ارتوپدی و توانبخشی'],['home-health','سلامت و مراقبت در منزل'],['beauty-hygiene','آرایشی و بهداشتی'],['mother-child','مادر و کودک'],['dental','تجهیزات و ملزومات دندانپزشکی'],['fitness','تناسب اندام و زیبایی']];
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
 diagnostic:['Beurer','Omron','Rossmax','Yuwell','زنیت‌مد','امسیگ'],respiratory:['Beurer','Yuwell','زنیت‌مد','امسیگ'],hospital:['زنیت‌مد','امسیگ','طب و صنعت'], 'home-medical':['Beurer','Omron','Rossmax','Yuwell'],consumable:['آوا پزشک','طب و صنعت','سایر'],
 mobility:['طب و صنعت','Tynor','Orliman','OPPO','Verna'],support:['طب و صنعت','Tynor','Orliman','Verna'],compression:['Sigvaris','Tynor','Verna','طب و صنعت'],rehab:['طب و صنعت','Tynor','Orliman'],cushion:['طب و صنعت','Tynor','Verna'],
 'blood-pressure':['Beurer','Omron','Rossmax','Yuwell','زنیت‌مد'],thermometer:['Beurer','Omron','Rossmax','امسیگ'],oxygen:['Beurer','Yuwell','زنیت‌مد','امسیگ'],'air-care':['Beurer','Philips','Honeywell'],massage:['Beurer','Medisana','Zenithmed'],
 skin:['لافارر','پریم','آردن','ویتالیر','سان‌سیف','هیدرودرم','مای'],hair:['سریتا','لافارر','پریم','آردن','هیدرودرم'],sun:['سان‌سیف','آردن سولاریس','ساین اسکین','ویتالیر','ژوت'],oral:['میسویک','سیگنال','اورال‌بی','کرست'],personal:['کامان','مای','دافی','نیوا'],cosmetic:['مای','کالیستا','پریم'],body:['کامان','داو','هیدرودرم'],
 'baby-food':['آپتامیل','نان','هیپ','بیومیل'], 'baby-care':['چیکو','فیلیپس اونت','جانسون','پدیابست'],pregnancy:['یوروویتال','پدیابست','دانا'], 'baby-medical':['فیلیپس اونت','چیکو','زنیت‌مد'],
 'dental-equipment':['Woodpecker','NSK','Dentsply Sirona','Coltene'], 'dental-consumable':['3M','Dentsply Sirona','Coltene'], 'oral-care':['میسویک','سیگنال','اورال‌بی'],
 exercise:['Reebok','Aptonia','Powertec','Technogym'], 'weight-loss':['Beurer','Aptonia','کارن','نوتریمد'], 'beauty-equipment':['Beurer','Medisana','Philips']
};
function $(id){return document.getElementById(id)}
function selected(){var s=$('storeSelect');return s&&s.value===STORE}
function setOptions(el,items,placeholder){if(!el)return;el.innerHTML='';var p=document.createElement('option');p.value='';p.textContent=placeholder;el.appendChild(p);(items||[]).forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];el.appendChild(o)})}
function roots(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;setOptions(c,ROOTS,'انتخاب دسته‌بندی');c.disabled=false;setOptions(s,[],'انتخاب زیردسته');s.disabled=true;removeBrand()}
function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];setOptions(s,list,'انتخاب زیردسته');s.disabled=!list.length;removeBrand()}
function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||['سایر'];removeBrand();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function removeBrand(){var b=$('v6BrandField');if(b)b.remove()}
function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c||!s)return false;if(!st.dataset.v6Darmankala){st.dataset.v6Darmankala='1';st.addEventListener('change',function(){setTimeout(function(){if(selected())roots()},20)})}if(!c.dataset.v6Darmankala){c.dataset.v6Darmankala='1';c.addEventListener('change',function(){setTimeout(subs,20)})}if(!s.dataset.v6Darmankala){s.dataset.v6Darmankala='1';s.addEventListener('change',function(){setTimeout(brand,20)})}if(selected())roots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
window.DigiYarDarmankalaTaxonomy={apply:roots,roots:ROOTS,subcategories:SUBS,brands:BRANDS};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
