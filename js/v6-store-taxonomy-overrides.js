/* DigiYar V6 — Per-store taxonomy overrides
   Store #3: Torob
   Taxonomy is intentionally structured for Torob's marketplace/search model:
   category → subcategory → brand → budget.
*/
(function(){
  'use strict';
  var STORE='torob';
  var ROOTS=[
    ['digital','کالای دیجیتال'],['home','خانه و آشپزخانه'],['fashion','مد و پوشاک'],['beauty','زیبایی و سلامت'],['supermarket','کالاهای روزمره'],['auto','خودرو و ابزار'],['sports','ورزش و سفر'],['culture','فرهنگ و هنر'],['mother-kid','مادر و کودک']
  ];
  var SUBS={
    digital:[['mobile','موبایل و تبلت'],['laptop','لپ‌تاپ و کامپیوتر'],['audio','هدفون و هندزفری'],['accessories','لوازم جانبی'],['tv','تلویزیون و نمایشگر'],['camera','دوربین و تجهیزات'],['gaming','کنسول و تجهیزات بازی'],['smartwatch','ساعت و دستبند هوشمند']],
    home:[['appliance','لوازم خانگی'],['kitchen','لوازم آشپزخانه'],['tv-home','تلویزیون و صوتی‌تصویری'],['cleaning','نظافت و شست‌وشو'],['decoration','دکور و روشنایی'],['sleep','خواب و حمام']],
    fashion:[['women','پوشاک زنانه'],['men','پوشاک مردانه'],['kids','پوشاک کودک و نوجوان'],['shoes','کفش'],['bags','کیف و اکسسوری'],['sportswear','پوشاک ورزشی']],
    beauty:[['skin','مراقبت پوست'],['hair','مراقبت مو'],['makeup','آرایشی'],['personal','بهداشت شخصی'],['perfume','عطر و ادکلن'],['health','سلامت و تجهیزات پزشکی']],
    supermarket:[['food','مواد غذایی'],['beverage','نوشیدنی'],['household','کالاهای مصرفی خانه'],['personal','بهداشت شخصی']],
    auto:[['parts','قطعات خودرو'],['accessoriesAuto','لوازم و تجهیزات خودرو'],['tools','ابزار'],['oil','روغن و مواد مصرفی']],
    sports:[['fitness','ورزش و بدنسازی'],['outdoor','کمپ و سفر'],['equipment','تجهیزات ورزشی'],['clothing','پوشاک ورزشی']],
    culture:[['book','کتاب'],['stationery','لوازم تحریر'],['music','موسیقی و صوت'],['game','بازی و سرگرمی']],
    'mother-kid':[['baby','نوزاد و کودک'],['mother','مادر و بارداری'],['toy','اسباب‌بازی'],['school','لوازم کودک و آموزشی']]
  };
  var BRANDS={
    mobile:['سامسونگ','شیائومی','اپل','پوکو','آنر','هواوی','نوکیا','ریلمی','موتورولا'],
    laptop:['لنوو','ایسوس','اچ‌پی','ایسر','دل','ام‌اس‌آی','اپل'],
    audio:['جی‌بی‌ال','انکر','سامسونگ','اپل','سونی','شیائومی','هایلو'],
    accessories:['بیسوس','انکر','یوگرین','شیائومی','سامسونگ','اپل','تسکو'],
    tv:['سامسونگ','ال‌جی','سونی','TCL','هایسنس','دوو','اسنوا','جی‌پلاس'],
    camera:['کانن','نیکون','سونی','فوجی‌فیلم','گوپرو','DJI'],
    gaming:['سونی','مایکروسافت','نینتندو','ایسوس','لاجیتک','ریزر'],
    smartwatch:['اپل','سامسونگ','شیائومی','هواوی','امیزفیت','گارمین'],
    appliance:['سامسونگ','ال‌جی','بوش','دوو','اسنوا','پاکشوما','جی‌پلاس','فیلیپس'],
    kitchen:['فیلیپس','بوش','مولینکس','تفال','کنوود','پارس‌خزر','گوسونیک'],
    'tv-home':['سامسونگ','ال‌جی','سونی','TCL','دوو','اسنوا'],
    cleaning:['فیلیپس','بوش','کرشر','پارس‌خزر','پاکشوما'],
    decoration:['ایکیا','چشمه‌نور','بلانتون'], sleep:['رویا','خوشخواب','ایکیا'],
    women:['جین‌وست','مانگو','ال‌سی‌وایکیکی','دورس'], men:['جین‌وست','ال‌سی‌من','تن‌درست','RNS'], kids:['ال‌سی‌وایکیکی','چیکو','نیلی'], shoes:['نایک','آدیداس','پوما','اسکیچرز','سالومون'], bags:['دیوید جونز','آدیداس','نایک','چرم مشهد'], sportswear:['نایک','آدیداس','پوما','ریبوک'],
    skin:['لورآل','نیوا','اوریاژ','لاروش پوزای','سینره','مای','کامان'], hair:['لورآل','شوارتسکف','پنتن','OGX','مای','سینره'], makeup:['مک','میبلین','لورآل','بورژوا','کالیستا','مای'], personal:['نیوا','داو','ژیلت','فیلیپس','مای','کامان'], perfume:['لورآل','آرماف','دیویدوف','بولگاری','لالیک'], health:['بی‌براون','مدی‌سان','زنیت‌مد','امسیگ'],
    food:['یک‌ویک','گلستان','چین‌چین','تبرک','کاله'], beverage:['سن‌ایچ','رانی','کاله','میهن'], household:['گلرنگ','تاژ','اکتیو','هوم‌کر'],
    parts:['ایساکو','بوش','دنسو','والئو','کروز'], accessoriesAuto:['ایساکو','کروز','گلد','اسپرتیج'], tools:['بوش','ماکیتا','دیوالت','رونیکس','توسن','آروا'], oil:['ایرانول','بهران','اسپیدی','کاسپین'],
    fitness:['نایکی','آدیداس','ریبوک','شیائومی','گارمین'], outdoor:['کچوا','کلمبیا','نورث‌فیس','سالومون','هامتو'], equipment:['نایکی','آدیداس','ریبوک','تکنوجیم'], clothing:['نایکی','آدیداس','پوما','ریبوک'],
    book:['نشر چشمه','افق','امیرکبیر','ققنوس','نشر نی'], stationery:['پاپکو','پنتر','استدلر','فابرکاستل'], music:['سونی','پایونیر','جی‌بی‌ال'], game:['لگو','هاسبرو','متل','فانکو'],
    baby:['چیکو','فیلیپس اونت','مولفیکس','مای بیبی','جانسون'], mother:['چیکو','فیلیپس اونت','بیبی‌لند','مای بیبی'], toy:['لگو','مگا بلاکس','هاسبرو','متل'], school:['پاپکو','پنتر','فابرکاستل','استدلر'], other:['سامسونگ','شیائومی','فیلیپس','بوش']
  };
  var $=function(id){return document.getElementById(id)};
  function selectedStore(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function setCategoryOptions(){var cat=$('v5Category');if(!cat||!selectedStore())return;cat.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');cat.disabled=false;var sub=$('v5Subcategory');if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function updateSub(){if(!selectedStore())return;var cat=$('v5Category'),sub=$('v5Subcategory');if(!cat||!sub)return;var list=SUBS[cat.value]||[];sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sub.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function updateBrand(){if(!selectedStore())return;var sub=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!sub||!sub.value)return;var brands=BRANDS[sub.value]||BRANDS.other;var old=$('v6BrandField');if(old)old.remove();var field=document.createElement('label');field.id='v6BrandField';field.className='v5-field full';field.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(field,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(field,dyn)}
  function bind(){var store=$('storeSelect'),cat=$('v5Category'),sub=$('v5Subcategory');if(!store||!cat)return false;if(!store.dataset.v6TorobTaxonomy){store.dataset.v6TorobTaxonomy='1';store.addEventListener('change',function(){if(selectedStore())setTimeout(setCategoryOptions,30)})}if(!cat.dataset.v6TorobTaxonomy){cat.dataset.v6TorobTaxonomy='1';cat.addEventListener('change',function(){setTimeout(updateSub,30)})}if(sub&&!sub.dataset.v6TorobBrand){sub.dataset.v6TorobBrand='1';sub.addEventListener('change',function(){setTimeout(updateBrand,30)})}if(selectedStore())setCategoryOptions();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
