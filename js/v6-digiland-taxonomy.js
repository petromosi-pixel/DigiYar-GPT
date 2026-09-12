/* DigiYar V6 — Store #10: DigiLand (دیجی‌لند)
   Taxonomy: category → subcategory → brand → budget.
   Based on DigiLand's current digital, computer and gaming product activity.
*/
(function(){
'use strict';
var STORE='digiland';
var ROOTS=[
 ['mobile','موبایل و تبلت'],['laptop','لپ‌تاپ و کامپیوتر'],['monitor','مانیتور'],['peripherals','تجهیزات جانبی کامپیوتر'],['gaming','گیمینگ و کنسول'],['audio','صوتی و تصویری'],['storage','حافظه و ذخیره‌سازی'],['camera','دوربین و تجهیزات'],['accessories','لوازم جانبی دیجیتال'],['smart','ساعت و گجت هوشمند'],['office','تجهیزات اداری'],['network','شبکه و تجهیزات ارتباطی']
];
var SUBS={
 mobile:[['phone','گوشی موبایل'],['tablet','تبلت'],['mobile-accessories','لوازم جانبی موبایل و تبلت'],['mobile-parts','قطعات موبایل']],
 laptop:[['laptop','لپ‌تاپ'],['computer','کامپیوتر و کیس'],['parts','قطعات کامپیوتر'],['laptop-accessories','لوازم جانبی لپ‌تاپ']],
 monitor:[['gaming-monitor','مانیتور گیمینگ'],['office-monitor','مانیتور اداری'],['design-monitor','مانیتور طراحی']],
 peripherals:[['keyboard','کیبورد'],['mouse','موس'],['mouse-keyboard','ست موس و کیبورد'],['speaker','اسپیکر'],['microphone','میکروفن'],['headset','هدست'],['webcam','وب‌کم']],
 gaming:[['console','کنسول بازی'],['playstation','پلی‌استیشن'],['xbox','ایکس‌باکس'],['games','بازی کنسول و کامپیوتر'],['controller','دسته بازی'],['gaming-accessories','لوازم جانبی کنسول'],['gaming-chair','صندلی گیمینگ'],['vr','واقعیت مجازی']],
 audio:[['earbuds','هندزفری و ایرباد'],['headphone','هدفون و هدست'],['speaker','اسپیکر'],['soundbar','ساندبار و سینمای خانگی']],
 storage:[['ssd','SSD'],['hdd','هارد دیسک'],['external','هارد اکسترنال'],['flash','فلش مموری'],['memory-card','کارت حافظه'],['ram','حافظه رم']],
 camera:[['camera','دوربین'],['lens','لنز'],['tripod','سه‌پایه و تجهیزات'],['camera-accessories','لوازم جانبی دوربین']],
 accessories:[['charger','شارژر'],['cable','کابل و مبدل'],['powerbank','پاوربانک'],['holder','هولدر و پایه'],['case','قاب و کاور'],['screen','محافظ صفحه و گلس']],
 smart:[['smartwatch','ساعت هوشمند'],['smartband','مچ‌بند هوشمند'],['smart-gadget','گجت هوشمند']],
 office:[['printer','پرینتر'],['scanner','اسکنر'],['ups','UPS و برق اضطراری'],['office-accessories','لوازم جانبی اداری']],
 network:[['router','روتر'],['modem','مودم'],['network-accessories','لوازم شبکه'],['security','تجهیزات نظارتی و امنیتی']]
};
var BRANDS={
 phone:['اپل','سامسونگ','شیائومی','آنر','هواوی','موتورولا','نوکیا','وان‌پلاس','اوپو','ریلمی','ناتینگ'],tablet:['سامسونگ','اپل','شیائومی','لنوو','هواوی','مایکروسافت'],
 'mobile-accessories':['انکر','شیائومی','سامسونگ','اپل','بیسوس','یوگرین','بلکین','گرین‌لاین','مک‌دودو'],'mobile-parts':['سامسونگ','اپل','شیائومی','هواوی','آنر'],
 laptop:['ایسوس','لنوو','HP','ایسر','MSI','اپل','دل','مایکروسافت'],computer:['ایسوس','MSI','گیگابایت','HP','لنوو','دل','اپل'],parts:['ایسوس','MSI','گیگابایت','گرین','دیپ‌کول','کورسیر'],
 'laptop-accessories':['لاجیتک','ریزر','رپو','ای‌فورتک','ردراگون','گرین','لنوو','HP'],
 'gaming-monitor':['سامسونگ','LG','ایسوس','MSI','AOC','بنکیو'], 'office-monitor':['سامسونگ','LG','ایسوس','AOC','دل'], 'design-monitor':['LG','سامسونگ','بنکیو','دل','ایسوس'],
 keyboard:['تسکو','لاجیتک','ای‌فورتک','ردراگون','ریزر','گرین'],mouse:['لاجیتک','ای‌فورتک','تسکو','ردراگون','ریزر'],'mouse-keyboard':['لاجیتک','تسکو','ای‌فورتک','ردراگون'],
 speaker:['JBL','سونی','انکر','تسکو','هویت'],microphone:['Rode','Shure','Fifine','Maono','هویت'],headset:['سونی','JBL','لاجیتک','ریزر','ردراگون'],webcam:['لاجیتک','تسکو','هویت','مایکروسافت'],
 console:['سونی','مایکروسافت','نینتندو'],playstation:['سونی'],xbox:['مایکروسافت'],games:['سونی','مایکروسافت','نینتندو','EA','Ubisoft'],controller:['سونی','مایکروسافت','نینتندو','8BitDo','ریزر','لاجیتک'],'gaming-accessories':['ریزر','لاجیتک','ردراگون','ایسوس','MSI','کورسیر','HyperX'],'gaming-chair':['گرین','DXRacer','ردراگون','تسکو'],vr:['Meta','سونی','HTC'],
 earbuds:['اپل','سامسونگ','JBL','انکر','شیائومی','QCY','هایلو'],headphone:['سونی','JBL','انکر','شیائومی','تسکو'],soundbar:['سامسونگ','LG','سونی','JBL','Harman Kardon'],
 ssd:['Samsung','Western Digital','Crucial','ADATA','Kingston'],hdd:['Western Digital','Seagate','Toshiba'],external:['Western Digital','Seagate','ADATA','Silicon Power','Toshiba'],flash:['SanDisk','Kingston','ADATA','Verity'],'memory-card':['SanDisk','Samsung','Kingston','ADATA'],ram:['Kingston','G.Skill','ADATA','Corsair','Crucial'],
 camera:['Canon','Nikon','Sony','Fujifilm','GoPro','DJI','Insta360'],lens:['Canon','Nikon','Sony','Sigma','Tamron'],tripod:['Manfrotto','Joby','Ulanzi','Benro'],'camera-accessories':['Ulanzi','Manfrotto','Joby','نیلکین'],
 charger:['بیسوس','انکر','سامسونگ','اپل','شیائومی','یوگرین'],cable:['بیسوس','انکر','یوگرین','مک‌دودو','نیلکین'],powerbank:['بیسوس','انکر','شیائومی','سامسونگ','پرومیت'],holder:['بیسوس','مک‌دودو','جویروم','پرومیت'],case:['نیلکین','اسپیگن','بیسوس','مک‌دودو','سامسونگ','اپل'],screen:['نیلکین','اسپیگن','بیسوس','مک‌دودو'],
 smartwatch:['اپل','سامسونگ','شیائومی','هواوی','آمازفیت','گارمین','آنر'],smartband:['شیائومی','هواوی','آمازفیت'], 'smart-gadget':['شیائومی','سامسونگ','اپل','بیسوس'],
 printer:['HP','Canon','Epson','Brother','Xerox','Samsung'],scanner:['Canon','Epson','HP','Brother'],ups:['Faran','Green','APC'],'office-accessories':['تسکو','گرین','بیسوس','یوگرین'],
 router:['TP-Link','MikroTik','Tenda','D-Link','Asus','Huawei'],modem:['TP-Link','D-Link','Huawei','Zyxel','Tenda','Nokia'],'network-accessories':['TP-Link','D-Link','Ubiquiti','MikroTik','Tenda'],security:['Hikvision','Dahua','Xiaomi','Imou','EZVIZ']
};
function selected(){return document.getElementById('storeSelect')&&document.getElementById('storeSelect').value===STORE}
function setCats(){if(!selected())return;var c=document.getElementById('v5Category');if(!c)return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=document.getElementById('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=document.getElementById('v6BrandField');if(b)b.remove()}
function setSubs(){if(!selected())return;var c=document.getElementById('v5Category'),s=document.getElementById('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=document.getElementById('v6BrandField');if(b)b.remove()}
function setBrand(){if(!selected())return;var s=document.getElementById('v5Subcategory');if(!s||!s.value)return;var list=BRANDS[s.value]||['سامسونگ','شیائومی','اپل','بیسوس','انکر'];var old=document.getElementById('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(x){return '<option value="'+x+'">'+x+'</option>'}).join('')+'</select>';var dyn=document.getElementById('v5DynamicFields');if(dyn)dyn.appendChild(f);else s.parentNode.appendChild(f);if(typeof window.DigiYarV6EnsureBudget==='function')window.DigiYarV6EnsureBudget()}
function bind(){var store=document.getElementById('storeSelect'),cat=document.getElementById('v5Category'),sub=document.getElementById('v5Subcategory');if(!store)return;if(!store.dataset.digilandTaxBound){store.dataset.digilandTaxBound='1';store.addEventListener('change',function(){if(selected())setCats()})}if(cat&&!cat.dataset.digilandTaxBound){cat.dataset.digilandTaxBound='1';cat.addEventListener('change',function(){if(selected())setSubs()})}if(sub&&!sub.dataset.digilandTaxBound){sub.dataset.digilandTaxBound='1';sub.addEventListener('change',function(){if(selected())setBrand()})}if(selected())setCats()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(bind,0)});else setTimeout(bind,0);
window.DigiYarDigilandTaxonomy={bind:bind,roots:ROOTS,subcategories:SUBS,brands:BRANDS};
})();