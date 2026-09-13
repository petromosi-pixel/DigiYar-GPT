/* DigiYar V6 — Store #12: Esam taxonomy
   Source: Esam category structure / marketplace scope
   Structure: category → subcategory → brand → budget
*/
(function(){
  'use strict';
  var STORE='esam';
  var ROOTS=[
    ['digital','کالای دیجیتال'],['fashion','مد و پوشاک'],['beauty','آرایشی و بهداشتی'],['home','خانه و آشپزخانه'],
    ['collectibles','قدیمی و کلکسیونی'],['auto-moto','ماشین و موتور'],['culture-art','فرهنگ و هنر'],['tools','لوازم و ابزار آلات'],
    ['sport-travel','ورزش و سفر'],['toys-kids','اسباب‌بازی و کودک'],['other','سایر کالاها']
  ];
  var SUBS={
    digital:[['mobile','گوشی موبایل'],['laptop','لپ‌تاپ و کامپیوتر'],['tablet','تبلت'],['camera','دوربین و تجهیزات عکاسی'],['audio','صوتی و تصویری'],['gaming','کنسول و بازی'],['network','شبکه و تجهیزات ارتباطی'],['accessories','لوازم جانبی دیجیتال']],
    fashion:[['clothing','لباس'],['shoes','کفش'],['bags','کیف'],['jewelry','زیورآلات و بدلیجات'],['watches','ساعت'],['accessories','اکسسوری']],
    beauty:[['makeup','آرایشی'],['skin-care','مراقبت پوست'],['hair-care','مراقبت و زیبایی مو'],['perfume','عطر و ادکلن'],['personal-care','بهداشت شخصی'],['health','محصولات سلامت']],
    home:[['kitchen','لوازم آشپزخانه'],['appliances','لوازم خانگی'],['furniture','مبلمان و دکوراسیون'],['lighting','روشنایی'],['home-textile','منسوجات و کالای خواب'],['decoration','تزئینات خانه']],
    collectibles:[['coins-banknotes','سکه، اسکناس و تمبر'],['antiques','عتیقه و اشیای قدیمی'],['memorabilia','یادگاری و کلکسیونی'],['vintage','کالاهای نوستالژیک']],
    'auto-moto':[['car-parts','قطعات و لوازم خودرو'],['car-accessories','لوازم جانبی خودرو'],['motorcycle','موتورسیکلت و لوازم'],['tools','ابزار خودرو']],
    'culture-art':[['books','کتاب و مجله'],['music','موسیقی و ساز'],['art','صنایع دستی و آثار هنری'],['stationery','لوازم‌التحریر']],
    tools:[['hand-tools','ابزار دستی'],['power-tools','ابزار برقی'],['industrial','تجهیزات صنعتی'],['measurement','ابزار اندازه‌گیری']],
    'sport-travel':[['fitness','بدنسازی و تناسب اندام'],['sports','لوازم ورزشی'],['camping','کمپینگ و کوهنوردی'],['travel','سفر و گردشگری']],
    'toys-kids':[['toys','اسباب‌بازی'],['baby','کالاهای نوزاد و کودک'],['educational','آموزشی و فکری'],['kids-clothing','پوشاک کودک']],
    other:[['misc','کالاهای متفرقه']]
  };
  var BRANDS={
    mobile:['سامسونگ','شیائومی','اپل','هواوی','نوکیا'],laptop:['ایسوس','لنوو','اچ‌پی','دل','اپل','ایسر'],tablet:['سامسونگ','اپل','شیائومی','لنوو'],camera:['کانن','نیکون','سونی','فوجی‌فیلم'],audio:['سونی','جی‌بی‌ال','پاناسونیک','انکر'],gaming:['سونی','مایکروسافت','نینتندو','ایسوس'],network:['TP-Link','دی‌لینک','هواوی','شیائومی'],
    accessories:['بیسوس','انکر','یوگرین','شیائومی','سامسونگ'],
    clothing:['ال‌سی‌وایکیکی','جین‌وست','زارا'],shoes:['نایک','آدیداس','پوما','اسکیچرز'],bags:['سامسونت','دیوید جونز','چرم مشهد'],jewelry:['ژوپینگ','سواروسکی'],watches:['کاسیو','سیکو','سیتیزن'],
    makeup:['کالیستا','مای','نوت','اسنس'], 'skin-care':['سینره','کامان','هیدرودرم','بیودرما'], 'hair-care':['سینره','لافارر','پریم','لورآل'],perfume:['لالیک','دیویدوف','بولگاری','آرماف'],'personal-care':['داو','نیوا','کامان'],'health':['یوروویتال','هلث اید'],
    kitchen:['بوش','فیلیپس','مولینکس','پارس خزر'],appliances:['ال‌جی','سامسونگ','بوش','اسنوا'],furniture:['چوبین‌فر','هوم‌کت'],lighting:['افشارنیک','پارس‌شهاب'], 'home-textile':['نساجی بروجرد','گلستان'],decoration:['ایکیا','هوم‌لوکس'],
    'coins-banknotes':['بانک مرکزی','سکه بهار آزادی'],antiques:['دست‌ساز','قدیمی'],memorabilia:['کلکسیونی'],vintage:['نوستالژیک'],
    'car-parts':['ایساکو','کروز','سایپا'], 'car-accessories':['رنو','پژو','ایران خودرو'],motorcycle:['هوندا','یاماها','کاوازاکی'],tools:['بوش','ماکیتا','دیوالت'],
    books:['نشر چشمه','نشر نی','امیرکبیر'],music:['یاماها','رولند','کاسیو'],art:['دست‌ساز','ایرانی'],stationery:['پاپکو','پنتر'],
    fitness:['نایکی','آدیداس','دکاتلون'],sports:['نایکی','آدیداس','پوما'],camping:['کچوا','کلمبیا'],travel:['سامسونت','دلسی'],
    toys:['لگو','ماتل','هاسبرو'],baby:['چیکو','فیلیپس اونت','مولفیکس'],educational:['لگو','فکرآوران'], 'kids-clothing':['ال‌سی‌وایکیکی','جین‌وست'],
    'hand-tools':['بوش','ایران پتک','رونیکس'],'power-tools':['بوش','ماکیتا','رونیکس'],'industrial':['هیوندای','رونیکس'],'measurement':['مگنت','توسن'],
    misc:['متفرقه']
  };
  function $(id){return document.getElementById(id)}
  function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function roots(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||BRANDS.misc;var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
  function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6EsamTaxonomy){st.dataset.v6EsamTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(roots,30)})}if(!c.dataset.v6EsamTaxonomy){c.dataset.v6EsamTaxonomy='1';c.addEventListener('change',function(){setTimeout(subs,30)})}if(s&&!s.dataset.v6EsamBrand){s.dataset.v6EsamBrand='1';s.addEventListener('change',function(){setTimeout(brand,30)})}if(selected())roots();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();
