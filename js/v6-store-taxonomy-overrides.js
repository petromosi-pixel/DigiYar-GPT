/* DigiYar V6 — Per-store taxonomy overrides
   Store #2: SnappShop
   Sources reviewed: SnappShop public category descriptions and current indexed references.
*/
(function(){
  'use strict';
  var STORE='snappshop';
  var ROOTS=[
    ['digital','کالای دیجیتال'],['home','خانه و آشپزخانه'],['beauty','زیبایی و سلامت'],['fashion','مد و پوشاک'],['culture','فرهنگ و هنر'],['mother-kid','مادر و کودک'],['auto-tools','ابزار و لوازم خودرو'],['sports','ورزش و سفر'],['supermarket','کالاهای روزمره و سوپرمارکتی'],['pet','پت‌شاپ و حیوانات خانگی']
  ];
  var SUBS={
    digital:[['mobile','موبایل و تبلت'],['laptop','لپ‌تاپ و کامپیوتر'],['headphones','هدفون و هندزفری'],['accessories','لوازم جانبی دیجیتال'],['tv','تلویزیون و نمایشگر'],['gaming','کنسول و بازی'],['smart-home','گجت و خانه هوشمند']],
    home:[['appliance','لوازم خانگی برقی'],['kitchen','لوازم آشپزخانه و پذیرایی'],['decoration','دکوراسیون و روشنایی'],['cleaning','نظافت و شست‌وشو'],['sleep','خواب و حمام']],
    beauty:[['skin','مراقبت پوست'],['hair','مراقبت مو'],['makeup','آرایشی'],['personal','بهداشت و مراقبت شخصی'],['health','سلامت و مکمل'],['perfume','عطر و ادکلن']],
    fashion:[['women','پوشاک زنانه'],['men','پوشاک مردانه'],['kids','پوشاک کودک و نوجوان'],['shoes','کفش'],['bags','کیف و اکسسوری']],
    culture:[['book','کتاب'],['stationery','لوازم تحریر'],['art','صنایع دستی و هنر'],['toy','بازی و سرگرمی']],
    'mother-kid':[['baby','نوزاد و کودک'],['mother','مادر و بارداری'],['toy','اسباب‌بازی'],['school','لوازم کودک و آموزشی']],
    'auto-tools':[['auto','لوازم مصرفی خودرو'],['tools','ابزار'],['care','نگهداری و تجهیزات خودرو']],
    sports:[['fitness','ورزش و بدنسازی'],['outdoor','کمپ و سفر'],['clothing','پوشاک ورزشی'],['equipment','تجهیزات ورزشی']],
    supermarket:[['food','مواد غذایی'],['beverage','نوشیدنی'],['household','کالاهای مصرفی خانه'],['personal','بهداشت شخصی']],
    pet:[['food','غذای حیوانات'],['accessoriesPet','لوازم و اکسسوری حیوانات'],['health','بهداشت و مراقبت حیوانات']]
  };
  var BRANDS={
    mobile:['سامسونگ','شیائومی','اپل','پوکو','آنر','هواوی','نوکیا','ریلمی'], laptop:['لنوو','ایسوس','اچ‌پی','ایسر','دل','ام‌اس‌آی','اپل'],
    headphones:['جی‌بی‌ال','انکر','سامسونگ','اپل','سونی','شیائومی','هایلو'], accessories:['بیسوس','انکر','یوگرین','شیائومی','سامسونگ','اپل','تسکو'],
    tv:['سامسونگ','ال‌جی','سونی','TCL','هایسنس','دوو','اسنوا'], gaming:['سونی','مایکروسافت','نینتندو','ایسوس','لاجیتک','ریزر'],
    'smart-home':['شیائومی','سامسونگ','فیلیپس','گوگل','آمازون','ت‌پی-لینک'], appliance:['سامسونگ','ال‌جی','بوش','دوو','اسنوا','پاکشوما','جی‌پلاس','فیلیپس'],
    kitchen:['فیلیپس','بوش','مولینکس','تفال','کنوود','پارس‌خزر','گوسونیک'], decoration:['ایکیا','هوم‌سنتر','چشمه‌نور','بلانتون'], cleaning:['فیلیپس','بوش','کرشر','پارس‌خزر','پاکشوما'], sleep:['رویا','خوشخواب','ایکیا'],
    skin:['لورآل','نیوا','اوریاژ','لاروش پوزای','سینره','مای','کامان'], hair:['لورآل','شوارتسکف','پنتن','او جی ایکس','مای','سینره'], makeup:['مک','میبلین','لورآل','بورژوا','کالیستا','مای'], personal:['نیوا','داو','ژیلت','فیلیپس','مای','کامان'], health:['دکتر ژیلا','سینره','کامان','مای','فیروز'], perfume:['لورآل','آرماف','دیویدوف','بولگاری','لالیک'],
    women:['جین‌وست','مانگو','ال‌سی‌وایکیکی','دورس'], men:['جین‌وست','ال‌سی‌من','تن‌درست','آر‌ان‌اس'], kids:['ال‌سی‌وایکیکی','چیکو','نیلی','فیورلا'], shoes:['نایک','آدیداس','پوما','اسکیچرز','سالومون'], bags:['دیوید جونز','آدیداس','نایک','چرم مشهد'],
    book:['نشر چشمه','افق','امیرکبیر','ققنوس','نشر نی'], stationery:['پاپکو','پنتر','استدلر','فابرکاستل'], art:['فابرکاستل','استدلر','پنتل','روترینگ'], toy:['لگو','مگا بلاکس','هاسبرو','متل','فانکو'], baby:['چیکو','فیلیپس اونت','مولفیکس','مای بیبی','جانسون'], mother:['چیکو','فیلیپس اونت','بیبی‌لند','مای بیبی'], school:['پاپکو','پنتر','فابرکاستل','استدلر'],
    auto:['ایساکو','بوش','دنسو','والئو','کروز'], tools:['بوش','ماکیتا','دیوالت','رونیکس','توسن','آروا'], care:['ایساکو','بوش','دنسو','والئو','کروز'],
    fitness:['نایکی','آدیداس','ریبوک','شیائومی','گارمین'], outdoor:['کچوا','کلمبیا','نورث‌فیس','سالومون','هامتو'], clothing:['نایکی','آدیداس','پوما','ریبوک'], equipment:['نایکی','آدیداس','ریبوک','تکنوجیم'],
    food:['یک‌ویک','گلستان','چین‌چین','تبرک','کاله'], beverage:['سن‌ایچ','رانی','کاله','میهن'], household:['گلرنگ','تاژ','اکتیو','هوم‌کر'], pet:['رفاه','جوسرا','رویال کنین','مونلو','فربینا'], accessoriesPet:['پت‌پارس','پتی‌لند','کوچولو'], other:['سامسونگ','شیائومی','فیلیپس','بوش']
  };
  var $=function(id){return document.getElementById(id)};
  function selectedStore(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function setCategoryOptions(){var cat=$('v5Category');if(!cat||!selectedStore())return;cat.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');cat.disabled=false;var sub=$('v5Subcategory');if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function updateSub(){if(!selectedStore())return;var cat=$('v5Category'),sub=$('v5Subcategory');if(!cat||!sub)return;var list=SUBS[cat.value]||[];sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sub.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function updateBrand(){if(!selectedStore())return;var sub=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!sub||!sub.value)return;var brands=BRANDS[sub.value]||BRANDS.other;var old=$('v6BrandField');if(old)old.remove();var field=document.createElement('label');field.id='v6BrandField';field.className='v5-field full';field.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(field,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(field,dyn)}
  function bind(){var store=$('storeSelect'),cat=$('v5Category'),sub=$('v5Subcategory');if(!store||!cat)return false;if(!store.dataset.v6SnappTaxonomy){store.dataset.v6SnappTaxonomy='1';store.addEventListener('change',function(){if(selectedStore())setTimeout(setCategoryOptions,30)})}if(!cat.dataset.v6SnappTaxonomy){cat.dataset.v6SnappTaxonomy='1';cat.addEventListener('change',function(){setTimeout(updateSub,30)})}sub=sub||$('v5Subcategory');if(sub&&!sub.dataset.v6SnappBrand){sub.dataset.v6SnappBrand='1';sub.addEventListener('change',function(){setTimeout(updateBrand,30)})}if(selectedStore())setCategoryOptions();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
