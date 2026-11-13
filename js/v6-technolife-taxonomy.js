/* DigiYar V6 — Store #7: Technolife taxonomy
   category → subcategory → brand → budget
*/
(function(){
  'use strict';
  var STORE='technolife';
  var ROOTS=[
    ['digital','کالای دیجیتال'],['mobile','موبایل و تبلت'],['laptop','لپ‌تاپ و کامپیوتر'],['audio','صوتی و تصویری'],['gaming','گیمینگ و کنسول'],['camera','دوربین و تجهیزات'],['wearable','گجت و پوشیدنی'],['accessories','لوازم جانبی دیجیتال'],['home','لوازم خانگی و آشپزخانه'],['office','اداری و ماشین‌های اداری'],['storage','حافظه و ذخیره‌سازی']
  ];
  var SUBS={
    digital:[['tablets','تبلت'],['ebook','کتابخوان'],['monitor','مانیتور'],['network','شبکه و تجهیزات ارتباطی'],['power','تجهیزات برق و شارژ']],
    mobile:[['phones','گوشی موبایل'],['tablets-mobile','تبلت'],['mobile-accessories','لوازم جانبی موبایل']],
    laptop:[['laptops','لپ‌تاپ'],['desktop','کامپیوتر و آل‌این‌وان'],['mini-pc','مینی‌پی‌سی'],['laptop-accessories','لوازم جانبی لپ‌تاپ']],
    audio:[['headphone','هدفون و هندزفری'],['speaker','اسپیکر'],['soundbar','ساندبار و سینمای خانگی'],['tv','تلویزیون'],['player','پخش‌کننده صوتی و تصویری']],
    gaming:[['console','کنسول بازی'],['gamepad','دسته و لوازم بازی'],['game','بازی'],['gaming-accessories','لوازم جانبی گیمینگ']],
    camera:[['camera','دوربین عکاسی و فیلمبرداری'],['lens','لنز'],['action','دوربین ورزشی'],['tripod','سه‌پایه و تجهیزات']],
    wearable:[['smartwatch','ساعت هوشمند'],['smartband','مچ‌بند هوشمند'],['tracker','ردیاب و گجت هوشمند']],
    accessories:[['case','قاب و کاور'],['charger','شارژر و کابل'],['powerbank','پاوربانک'],['holder','پایه و نگهدارنده'],['memory','کارت حافظه و فلش'],['adapter','هاب، مبدل و دانگل']],
    home:[['refrigerator','یخچال و فریزر'],['washing','ماشین لباسشویی'],['dishwasher','ماشین ظرفشویی'],['vacuum','جاروبرقی و نظافت'],['kitchen','لوازم برقی آشپزخانه'],['coffee','قهوه‌ساز و نوشیدنی‌ساز'],['cooking','پخت‌وپز'],['air','تهویه و تصفیه هوا']],
    office:[['printer','پرینتر'],['scanner','اسکنر'],['calculator','ماشین حساب'],['office-accessories','لوازم جانبی اداری']],
    storage:[['ssd','SSD'],['hdd','هارد دیسک'],['flash','فلش مموری'],['memory-card','کارت حافظه'],['nas','ذخیره‌ساز شبکه']]
  };
  var BRANDS={
    phones:['سامسونگ','شیائومی','اپل','پوکو','آنر','هواوی','نوکیا','موتورولا','ریلمی'],
    tablets:['سامسونگ','شیائومی','اپل','لنوو','هواوی'],
    'mobile-accessories':['بیسوس','انکر','یوگرین','نیلکین','تسکو','شیائومی'],
    laptops:['لنوو','ایسوس','اچ‌پی','ایسر','دل','ام‌اس‌آی','اپل','مایکروسافت'],
    desktop:['ایسوس','لنوو','اچ‌پی','اپل'], 'mini-pc':['ایسوس','لنوو','اینتل','MSI'], 'laptop-accessories':['تسکو','بیسوس','انکر','یوگرین'],
    headphone:['جی‌بی‌ال','انکر','سونی','اپل','سامسونگ','شیائومی','هایلو'],
    speaker:['جی‌بی‌ال','انکر','سونی','شیائومی','تسکو'], 'soundbar':['سامسونگ','ال‌جی','سونی','جی‌بی‌ال'],
    tv:['سامسونگ','ال‌جی','سونی','TCL','هایسنس','دوو','اسنوا'], player:['سونی','پاناسونیک','سامسونگ','ال‌جی'],
    console:['سونی','مایکروسافت','نینتندو'], gamepad:['سونی','مایکروسافت','لاجیتک','8BitDo'], game:['سونی','نینتندو','مایکروسافت'], 'gaming-accessories':['لاجیتک','ریزر','ایسوس','کورسیر'],
    camera:['کانن','نیکون','سونی','فوجی‌فیلم','پاناسونیک'], lens:['کانن','نیکون','سونی','سیگما','تامران'], action:['گوپرو','DJI','Insta360'], tripod:['مانفروتو','بنرو','گودکس'],
    smartwatch:['اپل','سامسونگ','شیائومی','هواوی','امیزفیت','گارمین'], smartband:['شیائومی','هواوی','امیزفیت'], tracker:['شیائومی','سامسونگ','اپل'],
    case:['نیلکین','اسپیگن','بیسوس','کینگ‌کنگ'], charger:['انکر','بیسوس','سامسونگ','اپل','یوگرین'], powerbank:['انکر','بیسوس','شیائومی','سامسونگ'], holder:['یوگرین','بیسوس','تسکو','نیلکین'], memory:['سن‌دیسک','سامسونگ','کینگستون','لکسار'], adapter:['یوگرین','انکر','بیسوس','تسکو'],
    refrigerator:['ال‌جی','سامسونگ','دوو','اسنوا','جی‌پلاس'], washing:['ال‌جی','سامسونگ','دوو','اسنوا','پاکشوما'], dishwasher:['ال‌جی','بوش','دوو','اسنوا'], vacuum:['بوش','فیلیپس','پارس‌خزر','کرشر','شیائومی'], kitchen:['فیلیپس','بوش','مولینکس','تفال','پارس‌خزر'], coffee:['دلونگی','نوا','فیلیپس','گوسونیک'], cooking:['تفال','فیلیپس','پارس‌خزر','گوسونیک'], air:['شیائومی','فیلیپس','ال‌جی','سامسونگ'],
    printer:['اچ‌پی','کانن','اپسون','برادر','سامسونگ'], scanner:['کانن','اپسون','برادر'], calculator:['کاسیو','سیتیزن'], 'office-accessories':['تسکو','رپو','لاجیتک'],
    ssd:['سامسونگ','وسترن دیجیتال','کینگستون','سن‌دیسک','ای‌دیتا'], hdd:['وسترن دیجیتال','سیگیت','توشیبا'], flash:['سن‌دیسک','کینگستون','سیلیکون پاور','سن‌دیسک'], 'memory-card':['سن‌دیسک','سامسونگ','لکسار','کینگستون'], nas:['سینولوژی','کیونپ'],
    ebook:['آمازون','بوکس','شیائومی'], monitor:['سامسونگ','ال‌جی','ایسوس','ام‌اس‌آی','AOC'], network:['تی‌پی‌لینک','تندا','دی‌لینک','میکروتیک'], power:['انکر','بیسوس','یوگرین'],
    other:['سامسونگ','شیائومی','اپل','لنوو','ایسوس']
  };
  var $=function(id){return document.getElementById(id)};
  function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function roots(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||BRANDS.other;var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
  function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6TechnolifeTaxonomy){st.dataset.v6TechnolifeTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(roots,30)})}if(!c.dataset.v6TechnolifeTaxonomy){c.dataset.v6TechnolifeTaxonomy='1';c.addEventListener('change',function(){setTimeout(subs,30)})}if(s&&!s.dataset.v6TechnolifeBrand){s.dataset.v6TechnolifeBrand='1';s.addEventListener('change',function(){setTimeout(brand,30)})}if(selected())roots();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();