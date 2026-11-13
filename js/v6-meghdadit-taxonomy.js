/* DigiYar V6 — Store #8: Meghdad IT taxonomy
   category → subcategory → brand → budget
*/
(function(){
  'use strict';
  var STORE='meghdadit';
  var ROOTS=[
    ['digital','کالای دیجیتال'],
    ['computer','کامپیوتر و قطعات'],
    ['laptop','لپ‌تاپ'],
    ['mobile','موبایل و تبلت'],
    ['camera','دوربین و تجهیزات'],
    ['network','شبکه و تجهیزات ارتباطی'],
    ['office','ماشین‌های اداری'],
    ['gaming','بازی و سرگرمی'],
    ['home','خانه و آشپزخانه'],
    ['beauty','زیبایی و سلامت'],
    ['sports','ورزش و سفر']
  ];
  var SUBS={
    digital:[['monitor','مانیتور و نمایشگر'],['storage','حافظه و ذخیره‌سازی'],['accessories','لوازم جانبی دیجیتال'],['audio','صوتی و تصویری'],['wearable','گجت و پوشیدنی']],
    computer:[['cpu','پردازنده'],['motherboard','مادربرد'],['gpu','کارت گرافیک'],['ram','رم'],['power','پاور'],['case','کیس و تجهیزات کیس'],['cooling','خنک‌کننده'],['pc','کامپیوتر آماده و آل‌این‌وان']],
    laptop:[['laptop','لپ‌تاپ'],['laptop-accessories','لوازم جانبی لپ‌تاپ'],['stock','لپ‌تاپ استوک']],
    mobile:[['phone','گوشی موبایل'],['tablet','تبلت'],['mobile-accessories','لوازم جانبی موبایل']],
    camera:[['camera','دوربین عکاسی و فیلمبرداری'],['lens','لنز'],['action','دوربین ورزشی'],['accessories','لوازم جانبی دوربین']],
    network:[['router','مودم و روتر'],['switch','سوئیچ شبکه'],['wireless','تجهیزات بی‌سیم'],['security','تجهیزات امنیت شبکه'],['rack','رک و تجهیزات شبکه']],
    office:[['printer','پرینتر'],['scanner','اسکنر'],['copier','کپی و چندکاره'],['projector','ویدئو پروژکتور'],['calculator','ماشین حساب'],['office-accessories','لوازم جانبی ماشین اداری']],
    gaming:[['console','کنسول بازی'],['game','بازی'],['gamepad','دسته و کنترلر'],['gaming-accessories','لوازم جانبی گیمینگ']],
    home:[['tv','تلویزیون'],['appliance','لوازم خانگی'],['kitchen','لوازم آشپزخانه'],['vacuum','نظافت و جارو'],['air','تهویه و تصفیه هوا']],
    beauty:[['personal-care','لوازم شخصی و برقی'],['health','سلامت و مراقبت']],
    sports:[['fitness','ورزش و بدنسازی'],['travel','سفر و کمپینگ']]
  };
  var BRANDS={
    monitor:['سامسونگ','ال‌جی','ایسوس','ام‌اس‌آی','AOC','بنکیو'],storage:['وسترن دیجیتال','سیگیت','سامسونگ','کینگستون','سن‌دیسک','لکسار'],accessories:['تسکو','بیسوس','انکر','یوگرین','شیائومی'],audio:['جی‌بی‌ال','سونی','انکر','سامسونگ','شیائومی'],wearable:['اپل','سامسونگ','شیائومی','هواوی','امیزفیت'],
    cpu:['اینتل','AMD'],motherboard:['ایسوس','گیگابایت','ام‌اس‌آی','ASRock'],gpu:['ایسوس','گیگابایت','ام‌اس‌آی','زوتاک','پالیت'],ram:['کینگستون','کورسییر','گ.اسکیل','ای‌دیتا'],power:['گرین','کورسیر','کولرمستر','تسکو'],case:['گرین','تسکو','کولرمستر','دیپ‌کول'],cooling:['دیپ‌کول','کولرمستر','گرین','Thermalright'],pc:['گرین','ایسوس','لنوو','اچ‌پی'],
    laptop:['لنوو','ایسوس','اچ‌پی','ایسر','دل','ام‌اس‌آی','اپل','مایکروسافت'], 'laptop-accessories':['تسکو','بیسوس','انکر','یوگرین'],stock:['دل','لنوو','اچ‌پی','ایسوس'],
    phone:['سامسونگ','شیائومی','اپل','پوکو','آنر','هواوی','نوکیا','موتورولا','ریلمی'],tablet:['سامسونگ','شیائومی','اپل','لنوو','هواوی'], 'mobile-accessories':['بیسوس','انکر','یوگرین','نیلکین','تسکو','شیائومی'],
    camera:['کانن','نیکون','سونی','فوجی‌فیلم','پاناسونیک'],lens:['کانن','نیکون','سونی','سیگما','تامران'],action:['گوپرو','DJI','Insta360'],
    router:['تی‌پی‌لینک','تندا','دی‌لینک','میکروتیک','ایسوس'],switch:['سیسکو','تی‌پی‌لینک','دی‌لینک','میکروتیک'],wireless:['میکروتیک','یوبیکیوتی','تی‌پی‌لینک','تندا'],security:['میکروتیک','یوبیکیوتی','داهوا'],rack:['پادرا','الکتروپژواک','پایا'],
    printer:['اچ‌پی','کانن','اپسون','برادر','سامسونگ'],scanner:['کانن','اپسون','برادر'],copier:['شارپ','توشیبا','کانن','ریکو'],projector:['اپسون','بنکیو','شیائومی','ایسر'],calculator:['کاسیو','سیتیزن'],'office-accessories':['تسکو','رپو','لاجیتک'],
    console:['سونی','مایکروسافت','نینتندو'],game:['سونی','نینتندو','مایکروسافت'],gamepad:['سونی','مایکروسافت','لاجیتک','8BitDo'],'gaming-accessories':['لاجیتک','ریزر','ایسوس','کورسیر'],
    tv:['سامسونگ','ال‌جی','سونی','TCL','هایسنس','دوو','اسنوا'],appliance:['سامسونگ','ال‌جی','بوش','دوو','اسنوا'],kitchen:['فیلیپس','بوش','مولینکس','تفال','پارس‌خزر'],vacuum:['بوش','فیلیپس','پارس‌خزر','کرشر','شیائومی'],air:['شیائومی','فیلیپس','ال‌جی','سامسونگ'],
    'personal-care':['فیلیپس','پاناسونیک','براون','شیائومی'],health:['فیلیپس','شیائومی','بیورر'],fitness:['شیائومی','گارمین','نایکی','آدیداس'],travel:['کچوا','کلمبیا','سالومون','هامتو'],
    other:['سامسونگ','شیائومی','لنوو','ایسوس','اچ‌پی']
  };
  var $=function(id){return document.getElementById(id)};
  function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function roots(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||BRANDS.other;var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
  function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6MeghdaditTaxonomy){st.dataset.v6MeghdaditTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(roots,30)})}if(!c.dataset.v6MeghdaditTaxonomy){c.dataset.v6MeghdaditTaxonomy='1';c.addEventListener('change',function(){setTimeout(subs,30)})}if(s&&!s.dataset.v6MeghdaditBrand){s.dataset.v6MeghdaditBrand='1';s.addEventListener('change',function(){setTimeout(brand,30)})}if(selected())roots();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();