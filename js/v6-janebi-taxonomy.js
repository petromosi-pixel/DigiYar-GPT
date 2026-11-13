/* DigiYar V6 — Store #9: Janebi (جانبی)
   Taxonomy: category → subcategory → brand → budget.
   Based on Janebi's current specialty in mobile/tablet/laptop accessories and related digital products.
*/
(function(){
'use strict';
var STORE='janebi';
var ROOTS=[
 ['mobile','موبایل و لوازم جانبی'],
 ['tablet','تبلت و لوازم جانبی'],
 ['laptop','لپ‌تاپ و لوازم جانبی'],
 ['audio','صوتی و تصویری'],
 ['power','شارژر، کابل و برق'],
 ['storage','حافظه و ذخیره‌سازی'],
 ['computer','لوازم جانبی کامپیوتر'],
 ['wearable','ساعت و گجت هوشمند'],
 ['gaming','گیمینگ و کنسول'],
 ['camera','دوربین و تجهیزات'],
 ['car','لوازم جانبی خودرو'],
 ['home','لوازم خانگی و سبک زندگی'],
 ['tools','ابزار و تجهیزات دیجیتال'],
 ['personal','لوازم شخصی و سلامت'],
 ['fashion','اکسسوری و کالاهای متفرقه']
];
var SUBS={
 mobile:[['case','قاب و کاور گوشی'],['screen','محافظ صفحه و گلس'],['lens','محافظ لنز دوربین'],['holder','هولدر و پایه نگهدارنده'],['accessories','سایر لوازم جانبی موبایل']],
 tablet:[['case','کیف و کاور تبلت'],['screen','محافظ صفحه تبلت'],['holder','پایه و هولدر تبلت'],['accessories','لوازم جانبی تبلت']],
 laptop:[['bag','کیف و کوله لپ‌تاپ'],['stand','پایه و استند لپ‌تاپ'],['cooling','کول‌پد و خنک‌کننده'],['charger','شارژر لپ‌تاپ'],['accessories','سایر لوازم جانبی لپ‌تاپ']],
 audio:[['earbuds','هندزفری و ایرباد'],['headphone','هدفون و هدست'],['speaker','اسپیکر'],['microphone','میکروفون'],['audio-accessories','لوازم جانبی صوتی']],
 power:[['wall-charger','شارژر دیواری'],['car-charger','شارژر فندکی'],['powerbank','پاوربانک'],['cable','کابل و رابط'],['wireless','شارژر و داک بی‌سیم'],['power-strip','چندراهی و محافظ برق']],
 storage:[['flash','فلش مموری'],['memory-card','کارت حافظه'],['card-reader','رم‌ریدر'],['external-drive','هارد اکسترنال'],['otg','مبدل و OTG']],
 computer:[['mouse','ماوس'],['keyboard','کیبورد'],['mouse-keyboard','ست ماوس و کیبورد'],['hub','هاب و USB'],['webcam','وب‌کم'],['pad','ماوس‌پد'],['computer-cable','کابل و تبدیل کامپیوتر']],
 wearable:[['smartwatch','ساعت هوشمند'],['smartband','مچ‌بند هوشمند'],['watch-accessories','بند و لوازم جانبی ساعت'],['smart-gadget','گجت هوشمند']],
 gaming:[['gamepad','دسته بازی و گیم‌پد'],['console','کنسول بازی'],['console-accessories','لوازم جانبی کنسول'],['gaming-headset','هدست گیمینگ'],['vr','واقعیت مجازی']],
 camera:[['tripod','سه‌پایه و مونوپاد'],['camera-bag','کیف دوربین'],['camera-accessories','لوازم جانبی دوربین'],['action','دوربین ورزشی و اکشن']],
 car:[['car-holder','هولدر خودرو'],['car-charger','شارژر فندکی خودرو'],['car-audio','لوازم صوتی خودرو'],['car-accessories','سایر لوازم جانبی خودرو']],
 home:[['fan','پنکه و خنک‌کننده'],['lighting','چراغ و روشنایی'],['appliance','لوازم برقی کوچک'],['lifestyle','کالاهای سبک زندگی']],
 tools:[['repair','ابزار تعمیرات دیجیتال'],['screwdriver','پیچ‌گوشتی و ابزار دستی'],['meter','ابزار اندازه‌گیری'],['cleaning','ابزار نظافت دیجیتال']],
 personal:[['grooming','ماشین اصلاح و لوازم شخصی'],['health','سلامت و مراقبت'],['massager','ماساژور']],
 fashion:[['watch','ساعت مچی'],['eyewear','عینک'],['bag','کیف و اکسسوری'],['misc','سایر کالاها']]
};
var BRANDS={
 case:['نیلکین','اسپیگن','بیسوس','مک دودو','کینگ‌کنگ','سامسونگ','اپل','شیائومی'],
 screen:['نیلکین','اسپیگن','بیسوس','مک دودو','یوسامز'],
 lens:['نیلکین','اسپیگن','بیسوس','مک دودو'],
 holder:['بیسوس','مک دودو','نیلکین','پرومیت','جویروم','ارلدام'],
 accessories:['بیسوس','مک دودو','جویروم','ارلدام','نیلکین','پرومیت'],
 bag:['کینگ‌استار','نیلکین','بیسوس','مک دودو','جویروم'],
 stand:['بیسوس','مک دودو','جویروم','ارلدام'],
 cooling:['تسکو','گرین','هویت','دیپ‌کول'],
 charger:['بیسوس','انکر','سامسونگ','اپل','شیائومی','یوگرین'],
 earbuds:['اپل','سامسونگ','انکر','شیائومی','QCY','هایلو','ارلدام'],
 headphone:['سونی','جی‌بی‌ال','انکر','شیائومی','ارلدام','تسکو'],
 speaker:['جی‌بی‌ال','بیسوس','نیلکین','شیائومی','انکر','تسکو'],
 microphone:['هویت','تسکو','میکروفون گیمینگ','بیسوس'],
 'audio-accessories':['بیسوس','نیلکین','مک دودو','جویروم'],
 'wall-charger':['بیسوس','انکر','سامسونگ','اپل','شیائومی','یوگرین','ارلدام'],
 'car-charger':['بیسوس','ارلدام','جویروم','شیائومی','مک دودو'],
 powerbank:['بیسوس','انکر','شیائومی','سامسونگ','جویروم','ارلدام','پاوراد'],
 cable:['بیسوس','نیلکین','انکر','یوگرین','مک دودو','سامسونگ','اپل'],
 wireless:['بیسوس','انکر','سامسونگ','اپل','شیائومی','پرومیت'],
 'power-strip':['پاوراد','تسکو','هدرون','بیسوس'],
 flash:['سن‌دیسک','کینگستون','ای‌دیتا','توشیبا','وریـتی'],
 'memory-card':['سن‌دیسک','سامسونگ','کینگستون','ای‌دیتا','وریـتی'],
 'card-reader':['اوریکو','بیلکین','بیسوس','یوگرین'],
 'external-drive':['وسترن دیجیتال','سیگیت','ای‌دیتا','توشیبا','سیلیکون پاور'],
 otg:['بیسوس','اوریکو','یوگرین','وریـتی','مک دودو'],
 mouse:['تسکو','لاجیتک','ای‌فورتک','هویت','بیسوس'],
 keyboard:['تسکو','لاجیتک','ای‌فورتک','ریزر','هویت'],
 'mouse-keyboard':['تسکو','لاجیتک','ای‌فورتک'],
 hub:['بیسوس','یوگرین','اوریکو','مک دودو','هویت'],
 webcam:['لاجیتک','تسکو','هویت','مایکروسافت'],
 pad:['تسکو','گرین','ردراگون','لاجیتک'],
 'computer-cable':['اوریکو','بیسوس','یوگرین','تسکو'],
 smartwatch:['اپل','سامسونگ','شیائومی','هواوی','آمازفیت','هایلو'],
 smartband:['شیائومی','هواوی','آمازفیت'],
 'watch-accessories':['سامسونگ','اپل','شیائومی','آمازفیت'],
 'smart-gadget':['شیائومی','سامسونگ','اپل','بیسوس'],
 gamepad:['سونی','مایکروسافت','نینتندو','8BitDo','ردراگون'],
 console:['سونی','مایکروسافت','نینتندو'],
 'console-accessories':['سونی','مایکروسافت','نینتندو','مک دودو','بیسوس'],
 'gaming-headset':['سونی','جی‌بی‌ال','لاجیتک','ریزر','ردراگون'],
 vr:['سامسونگ','متا','سونی'],
 tripod:['Ulanzi','Manfrotto','Joby','بیسوس'],
 'camera-bag':['نیلکین','بیسوس','کینگستون'],
 'camera-accessories':['نیلکین','بیسوس','جویروم','مک دودو'],
 action:['گوپرو','DJI','اینستا360'],
 'car-holder':['بیسوس','جویروم','مک دودو','پرومیت'],
 'car-audio':['بیسوس','جویروم','تسکو'],
 'car-accessories':['بیسوس','جویروم','مک دودو'],
 fan:['بیسوس','شیائومی','جویروم'],
 lighting:['بیسوس','شیائومی','یوگرین'],
 appliance:['بیسوس','شیائومی','فیلیپس'],
 lifestyle:['بیسوس','شیائومی','نیلکین'],
 repair:['اوریکو','بیسوس','یوگرین','مک دودو'],
 screwdriver:['اوریکو','بیسوس','یوگرین'],
 meter:['آتومن','شیائومی','بوش'],
 cleaning:['بیسوس','شیائومی','یوگرین'],
 grooming:['فیلیپس','براون','شیائومی','رمینگتون'],
 health:['امرون','شیائومی','فیلیپس'],
 massager:['شیائومی','فیلیپس','بیسوس'],
 watch:['کاسیو','سیکو','شیائومی','سامسونگ'],
 eyewear:['شیائومی','ری‌بن','آفتاب'],
 bag:['نیلکین','بیسوس','جویروم'],
 misc:['بیسوس','مک دودو','جویروم','نیلکین']
};
var $=function(id){return document.getElementById(id)};
function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
function setCats(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
function setSubs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
function setBrand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||['سامسونگ','شیائومی','اپل','بیسوس','انکر'];var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(x){return '<option value="'+x+'">'+x+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6Janebi){st.dataset.v6Janebi='1';st.addEventListener('change',function(){if(selected())setTimeout(setCats,30)})}if(!c.dataset.v6Janebi){c.dataset.v6Janebi='1';c.addEventListener('change',function(){setTimeout(setSubs,30)})}if(s&&!s.dataset.v6JanebiBrand){s.dataset.v6JanebiBrand='1';s.addEventListener('change',function(){setTimeout(setBrand,30)})}if(selected())setCats();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();