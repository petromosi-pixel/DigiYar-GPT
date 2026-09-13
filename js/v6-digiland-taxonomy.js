/* DigiYar V6 — Store #10: DigiLand
   Clean dedicated taxonomy: category → subcategory → brand → budget.
*/
(function(){
'use strict';
var STORE='digiland';
var ROOTS=[
 ['stock','سیستم استوک'],
 ['console','کنسول بازی'],
 ['laptop','لپ‌تاپ'],
 ['monitor','مانیتور'],
 ['computer','تجهیزات کامپیوتر'],
 ['gaming','تجهیزات گیمینگ'],
 ['case','کیس'],
 ['accessories','لوازم جانبی'],
 ['mobile','موبایل و تبلت'],
 ['audio','صوتی و تصویری'],
 ['smart','ساعت و گجت هوشمند']
];
var SUBS={
 stock:[['stock-case','کیس استوک'],['stock-monitor','مانیتور استوک'],['stock-laptop','لپ‌تاپ استوک']],
 console:[['xbox','ایکس‌باکس'],['xbox-one','ایکس‌باکس وان'],['playstation','پلی‌استیشن'],['console-games','بازی‌های کنسول'],['console-accessories','لوازم جانبی کنسول']],
 laptop:[['laptop-use','دسته‌بندی کاربردی'],['laptop-acer','لپ‌تاپ Acer'],['laptop-asus','لپ‌تاپ ASUS'],['laptop-dell','لپ‌تاپ Dell'],['laptop-hp','لپ‌تاپ HP'],['laptop-lenovo','لپ‌تاپ Lenovo'],['laptop-msi','لپ‌تاپ MSI'],['laptop-macbook','Apple MacBook']],
 monitor:[['monitor-use','دسته‌بندی کاربردی'],['monitor-asus','مانیتور ASUS'],['monitor-lg','مانیتور LG'],['monitor-msi','مانیتور MSI'],['monitor-samsung','مانیتور Samsung']],
 computer:[['keyboard','کیبورد'],['mouse','موس'],['speaker','اسپیکر'],['microphone','میکروفن'],['headset','هدست'],['storage','حافظه و ذخیره‌سازی']],
 gaming:[['controller','دسته بازی'],['gaming-chair','صندلی گیمینگ'],['gaming-wheel','فرمان بازی'],['gaming-desk','میز گیمینگ']],
 case:[['computer-case','کیس کامپیوتر']],
 accessories:[['computer-accessories','لوازم جانبی کامپیوتر'],['cable','کابل و مبدل'],['charger','شارژر و آداپتور'],['holder','پایه و هولدر']],
 mobile:[['phone','گوشی موبایل'],['tablet','تبلت'],['mobile-accessories','لوازم جانبی موبایل و تبلت']],
 audio:[['earbuds','هندزفری و ایرباد'],['headphone','هدفون و هدست'],['audio-speaker','اسپیکر'],['soundbar','ساندبار و سینمای خانگی'],['tv','تلویزیون']],
 smart:[['smartwatch','ساعت هوشمند'],['smartband','مچ‌بند هوشمند'],['smart-gadget','گجت هوشمند']]
};
var BRANDS={
 'stock-case':['Acer','Dell','HP','Lenovo'],
 'stock-monitor':['Dell','HP','Lenovo','LG','Samsung'],
 'stock-laptop':['Dell','HP','Lenovo'],
 xbox:['مایکروسافت'],
 'xbox-one':['مایکروسافت'],
 playstation:['سونی'],
 'console-games':['سونی','مایکروسافت','نینتندو'],
 'console-accessories':['سونی','مایکروسافت'],
 'laptop-use':['ایسوس','لنوو','HP','ایسر','MSI','اپل','دل'],
 'laptop-acer':['Acer'],
 'laptop-asus':['ASUS'],
 'laptop-dell':['Dell'],
 'laptop-hp':['HP'],
 'laptop-lenovo':['Lenovo'],
 'laptop-msi':['MSI'],
 'laptop-macbook':['Apple'],
 'monitor-use':['ASUS','LG','MSI','Samsung','AOC','BenQ'],
 'monitor-asus':['ASUS'],
 'monitor-lg':['LG'],
 'monitor-msi':['MSI'],
 'monitor-samsung':['Samsung'],
 keyboard:['تسکو','لاجیتک','ای‌فورتک','ردراگون','ریزر','گرین'],
 mouse:['لاجیتک','ای‌فورتک','تسکو','ردراگون','ریزر'],
 speaker:['JBL','سونی','انکر','تسکو','هویت'],
 microphone:['Rode','Shure','Fifine','Maono'],
 headset:['سونی','JBL','لاجیتک','ریزر','ردراگون'],
 storage:['Kingston','SanDisk','ADATA','Samsung','Western Digital'],
 controller:['Sony','Microsoft','Nintendo','8BitDo','Razer','Logitech'],
 'gaming-chair':['Green','DXRacer','Redragon','TSCO'],
 'gaming-wheel':['Logitech','Thrustmaster','PXN'],
 'gaming-desk':['Green','TSCO','Cooler Master'],
 'computer-case':['Green','DeepCool','Cooler Master','Thermaltake','MSI','ASUS'],
 'computer-accessories':['تسکو','لاجیتک','بیسوس','یوگرین','گرین'],
 cable:['بیسوس','انکر','یوگرین','مک‌دودو'],
 charger:['بیسوس','انکر','سامسونگ','اپل','شیائومی'],
 holder:['بیسوس','مک‌دودو','جویروم'],
 phone:['اپل','سامسونگ','شیائومی','آنر','هواوی','موتورولا','نوکیا','وان‌پلاس','اوپو','ریلمی'],
 tablet:['سامسونگ','اپل','شیائومی','لنوو','هواوی'],
 'mobile-accessories':['بیسوس','انکر','شیائومی','سامسونگ','اپل','یوگرین','مک‌دودو'],
 earbuds:['اپل','سامسونگ','JBL','انکر','شیائومی','QCY','هایلو'],
 headphone:['سونی','JBL','انکر','شیائومی','تسکو'],
 'audio-speaker':['JBL','سونی','انکر','تسکو','هویت'],
 soundbar:['سامسونگ','LG','سونی','JBL'],
 tv:['سامسونگ','LG','سونی','TCL'],
 smartwatch:['اپل','سامسونگ','شیائومی','هواوی','آمازفیت','گارمین','آنر'],
 smartband:['شیائومی','هواوی','آمازفیت'],
 'smart-gadget':['شیائومی','سامسونگ','اپل']
};
function $(id){return document.getElementById(id)}
function selected(){var s=$('storeSelect');return !!(s&&s.value===STORE)}
function removeBrand(){var b=$('v6BrandField');if(b)b.remove()}
function setRoots(){if(!selected())return;var c=$('v5Category');if(!c)return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.innerHTML='<option value="">انتخاب زیر دسته</option>';s.value='';s.disabled=true}removeBrand()}
function setSubs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.value='';s.disabled=!list.length;removeBrand()}
function setBrand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||['سامسونگ','شیائومی','اپل'];removeBrand();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';if(dyn)dyn.appendChild(f);else s.parentNode.insertBefore(f,s.nextSibling);if(typeof window.DigiYarV6EnsureBudget==='function')window.DigiYarV6EnsureBudget();var budget=$('v6BudgetRange');if(dyn&&budget&&budget.parentNode!==dyn)dyn.appendChild(budget);if(dyn&&budget)dyn.insertBefore(f,budget)}
function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.digilandCleanTaxonomy){st.dataset.digilandCleanTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(setRoots,20)},true)}if(!c.dataset.digilandCleanTaxonomy){c.dataset.digilandCleanTaxonomy='1';c.addEventListener('change',function(){if(selected())setTimeout(setSubs,20)},true)}if(s&&!s.dataset.digilandCleanTaxonomy){s.dataset.digilandCleanTaxonomy='1';s.addEventListener('change',function(){if(selected())setTimeout(setBrand,20)},true)}if(selected())setRoots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
window.DigiYarDigilandTaxonomy={bind:bind,roots:ROOTS,subcategories:SUBS,brands:BRANDS};
})();