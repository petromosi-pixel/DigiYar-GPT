/* DigiYar V6 — Per-store taxonomy overrides
   Store #4: Basalam
   Taxonomy: category → subcategory → brand → budget.
*/
(function(){
  'use strict';
  var STORE='basalam';
  var ROOTS=[
    ['digital','کالای دیجیتال'],['home','خانه و آشپزخانه'],['fashion','مد و پوشاک'],['beauty','زیبایی و سلامت'],['food','خوراکی و نوشیدنی'],['handicraft','صنایع دستی و هنر'],['culture','کتاب و فرهنگ'],['mother-kid','مادر و کودک'],['sports','ورزش و سفر'],['tools','ابزار و تجهیزات'],['pet','حیوانات خانگی']
  ];
  var SUBS={
    digital:[['mobile','موبایل و تبلت'],['laptop','لپ‌تاپ و کامپیوتر'],['audio','هدفون و هندزفری'],['accessories','لوازم جانبی دیجیتال'],['tv','تلویزیون و نمایشگر'],['camera','دوربین و تجهیزات'],['gaming','گیمینگ و کنسول'],['smart','گجت و پوشیدنی']],
    home:[['appliance','لوازم خانگی'],['kitchen','لوازم آشپزخانه و پذیرایی'],['decoration','دکوراسیون و روشنایی'],['cleaning','نظافت و شست‌وشو'],['sleep','خواب و حمام']],
    fashion:[['women','پوشاک زنانه'],['men','پوشاک مردانه'],['kids','پوشاک کودک و نوجوان'],['shoes','کفش'],['bags','کیف و اکسسوری'],['traditional','پوشاک سنتی']],
    beauty:[['skin','مراقبت پوست'],['hair','مراقبت مو'],['makeup','آرایشی'],['personal','بهداشت شخصی'],['perfume','عطر و ادکلن'],['health','سلامت و تجهیزات پزشکی']],
    food:[['staples','خواربار و مواد غذایی'],['sweets','شیرینی و تنقلات'],['traditional','خوراکی‌های سنتی و محلی'],['beverage','نوشیدنی'],['organic','محصولات ارگانیک']],
    handicraft:[['wood','صنایع دستی چوبی'],['textile','بافته و دست‌بافت'],['pottery','سفال و سرامیک'],['metal','صنایع دستی فلزی'],['decor','هنر و دکور دست‌ساز']],
    culture:[['book','کتاب'],['stationery','لوازم تحریر'],['music','موسیقی و محصولات فرهنگی'],['game','بازی و سرگرمی']],
    'mother-kid':[['baby','نوزاد و کودک'],['mother','مادر و بارداری'],['toy','اسباب‌بازی'],['school','لوازم کودک و آموزشی']],
    sports:[['fitness','ورزش و بدنسازی'],['outdoor','کمپ و سفر'],['equipment','تجهیزات ورزشی'],['clothing','پوشاک ورزشی']],
    tools:[['hand','ابزار دستی'],['power','ابزار برقی و شارژی'],['auto','ابزار و تجهیزات خودرو'],['garden','ابزار باغبانی']],
    pet:[['food','غذای حیوانات'],['accessoriesPet','لوازم و اکسسوری حیوانات'],['healthPet','بهداشت و مراقبت حیوانات']]
  };
  var BRANDS={
    mobile:['سامسونگ','شیائومی','اپل','پوکو','آنر','هواوی','نوکیا','ریلمی'],laptop:['لنوو','ایسوس','اچ‌پی','ایسر','دل','ام‌اس‌آی','اپل'],audio:['جی‌بی‌ال','انکر','سامسونگ','اپل','سونی','شیائومی','هایلو'],accessories:['بیسوس','انکر','یوگرین','شیائومی','سامسونگ','اپل','تسکو'],tv:['سامسونگ','ال‌جی','سونی','TCL','هایسنس','دوو','اسنوا'],camera:['کانن','نیکون','سونی','فوجی‌فیلم','گوپرو','DJI'],gaming:['سونی','مایکروسافت','نینتندو','ایسوس','لاجیتک','ریزر'],smart:['اپل','سامسونگ','شیائومی','هواوی','امیزفیت','گارمین'],
    appliance:['سامسونگ','ال‌جی','بوش','دوو','اسنوا','پاکشوما','جی‌پلاس','فیلیپس'],kitchen:['فیلیپس','بوش','مولینکس','تفال','کنوود','پارس‌خزر','گوسونیک'],decoration:['ایکیا','چشمه‌نور','بلانتون'],cleaning:['فیلیپس','بوش','کرشر','پارس‌خزر','پاکشوما'],sleep:['رویا','خوشخواب','ایکیا'],
    women:['جین‌وست','مانگو','ال‌سی‌وایکیکی','دورس'],men:['جین‌وست','ال‌سی‌من','تن‌درست','RNS'],kids:['ال‌سی‌وایکیکی','چیکو','نیلی'],shoes:['نایک','آدیداس','پوما','اسکیچرز'],bags:['دیوید جونز','آدیداس','نایک','چرم مشهد'],traditional:['تن‌درست','چرم مشهد'],
    skin:['لورآل','نیوا','اوریاژ','لاروش پوزای','سینره','مای','کامان'],hair:['لورآل','شوارتسکف','پنتن','OGX','مای','سینره'],makeup:['مک','میبلین','لورآل','بورژوا','کالیستا','مای'],personal:['نیوا','داو','ژیلت','فیلیپس','مای','کامان'],perfume:['لورآل','آرماف','دیویدوف','بولگاری','لالیک'],health:['سینره','کامان','مای','فیروز'],
    staples:['گلستان','یک‌ویک','چین‌چین','کاله'],sweets:['شیرین‌عسل','مزمز','چی‌توز','تبرک'],traditional:['گلستان','یک‌ویک','کاله'],beverage:['سن‌ایچ','رانی','کاله','میهن'],organic:['رضوان','گلستان'],
    wood:['منبت‌کاری ایرانی','گلیم سیرجان'],textile:['ترمه رضایی','گلیم سیرجان'],pottery:['لالجین','میبد'],metal:['اصفهان'],decor:['سفال لالجین','میناکاری اصفهان'],
    book:['نشر چشمه','افق','امیرکبیر','ققنوس','نشر نی'],stationery:['پاپکو','پنتر','استدلر','فابرکاستل'],music:['سونی','پایونیر','جی‌بی‌ال'],game:['لگو','هاسبرو','متل'],
    baby:['چیکو','فیلیپس اونت','مولفیکس','مای بیبی'],mother:['چیکو','فیلیپس اونت','بیبی‌لند','مای بیبی'],toy:['لگو','مگا بلاکس','هاسبرو','متل'],school:['پاپکو','پنتر','فابرکاستل','استدلر'],
    fitness:['نایکی','آدیداس','ریبوک','شیائومی','گارمین'],outdoor:['کچوا','کلمبیا','نورث‌فیس','سالومون','هامتو'],equipment:['نایکی','آدیداس','ریبوک'],clothing:['نایکی','آدیداس','پوما','ریبوک'],
    hand:['رونیکس','توسن','آروا'],power:['بوش','ماکیتا','دیوالت','رونیکس'],auto:['ایساکو','بوش','دنسو','والئو'],garden:['بوش','ماکیتا','رونیکس'],
    food:['رویال کنین','جوسرا','مونلو','فربینا'],accessoriesPet:['پت‌پارس','پتی‌لند'],healthPet:['رویال کنین','جوسرا'],other:['سامسونگ','شیائومی','فیلیپس','بوش']
  };
  var $=function(id){return document.getElementById(id)};
  function selectedStore(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function setCategoryOptions(){var cat=$('v5Category');if(!cat||!selectedStore())return;cat.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');cat.disabled=false;var sub=$('v5Subcategory');if(sub){sub.value='';sub.disabled=true;sub.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function updateSub(){if(!selectedStore())return;var cat=$('v5Category'),sub=$('v5Subcategory');if(!cat||!sub)return;var list=SUBS[cat.value]||[];sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');sub.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function updateBrand(){if(!selectedStore())return;var sub=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!sub||!sub.value)return;var brands=BRANDS[sub.value]||BRANDS.other;var old=$('v6BrandField');if(old)old.remove();var field=document.createElement('label');field.id='v6BrandField';field.className='v5-field full';field.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(field,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(field,dyn)}
  function bind(){var store=$('storeSelect'),cat=$('v5Category'),sub=$('v5Subcategory');if(!store||!cat)return false;if(!store.dataset.v6BasalamTaxonomy){store.dataset.v6BasalamTaxonomy='1';store.addEventListener('change',function(){if(selectedStore())setTimeout(setCategoryOptions,30)})}if(!cat.dataset.v6BasalamTaxonomy){cat.dataset.v6BasalamTaxonomy='1';cat.addEventListener('change',function(){setTimeout(updateSub,30)})}if(sub&&!sub.dataset.v6BasalamBrand){sub.dataset.v6BasalamBrand='1';sub.addEventListener('change',function(){setTimeout(updateBrand,30)})}if(selectedStore())setCategoryOptions();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
