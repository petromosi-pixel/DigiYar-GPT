/* DigiYar V6 — Product options bridge */
(function(){
'use strict';

var BRANDS={
 mobile:['سامسونگ','شیائومی','اپل','نوکیا','ریلمی','آنر','موتورولا','هواوی','گوگل پیکسل','پوکو','وان‌پلاس','ناتینگ فون','تکنو'],
 laptop:['لنوو','ایسوس','اچ‌پی','دل','ایسر','اپل','مایکروسافت','ام‌اس‌آی','سامسونگ','هواوی'],
 tablet:['اپل','سامسونگ','شیائومی','لنوو','هواوی','مایکروسافت','نوکیا'],
 headphones:['اپل','سامسونگ','سونی','جی‌بی‌ال','انکر','شیائومی','هواوی','بیتس','سنهایزر','هایلو'],
 tv:['سامسونگ','ال‌جی','سونی','هایسنس','TCL','شیائومی','دوو','اسنوا','ایکس‌ویژن'],
 camera:['کانن','نیکون','سونی','فوجی‌فیلم','پاناسونیک','گوپرو','دی‌جی‌آی'],
 accessories:['انکر','شیائومی','سامسونگ','اپل','بیسوس','آکی','یوگرین','روموس','گرین','تسکو'],
 gaming:['سونی','مایکروسافت','نینتندو','ایسوس','لنوو','ام‌اس‌آی','لاجیتک','ریزر'],
 'smart-home':['شیائومی','سامسونگ','آمازون','گوگل','فیلیپس','ت‌پی-لینک'],
 appliance:['سامسونگ','ال‌جی','بوش','فیلیپس','دوو','اسنوا','پاکشوما','جی‌پلاس','هیمالیا'],
 kitchen:['فیلیپس','بوش','مولینکس','تفال','کنوود','پارس‌خزر','گوسونیک','سنکور'],
 decoration:['ایکیا','هوم‌سنتر','چشمه‌نور','بلانتون','کیاور'],
 cleaning:['فیلیپس','بوش','کرشر','پارس‌خزر','پاکشوما','اسنوا'],
 furniture:['ایکیا','هوم‌سنتر','چشمه‌نور','بالسا','مبلیران','نیک‌آذین'],
 office:['اچ‌پی','کانن','اپسون','برادر','لنوو'],
 sleep:['رویا','خوشخواب','ایکیا','ویتالی'],
 men:['ال‌سی‌من','جین‌وست','تن‌درست','نیکتا','آر‌ان‌اس'],
 women:['دورس','جوتی‌جینز','شیک‌پوش','تن‌درست','مانگو'],
 kids:['ال‌سی‌وایکیکی','چیکو','زرافه','نیلی','فیورلا'],
 shoes:['نایک','آدیداس','پوما','اسکیچرز','سالومون','هامتو','کفش ملی'],
 bags:['سامسونت','آدیداس','نایک','دیوید جونز','چرم مشهد'],
 skin:['نیوا','لورآل','اوریاژ','لاروش پوزای','سینره','مای','کامان'],
 hair:['لورآل','شوارتسکف','او جی ایکس','پنتن','مای','سینره'],
 makeup:['مک','میبلین','لورآل','بورژوا','کالیستا','مای','این‌لی'],
 personal:['نیوا','داو','ژیلت','فیلیپس','مای','کامان'],
 health:['نیچرم','دکتر ژیلا','سینره','کامان','مای','فیروز'],
 medical:['بیورر','امسیگ','زنیت مد','مدی‌سان','رزمکس'],
 personalCare:['نیوا','داو','کامان','مای','سینره'],
 fitness:['نایکی','آدیداس','ریبوک','شیائومی','گارمین','فیت‌فلکس'],
 outdoor:['کچوا','کلمبیا','نورث‌فیس','سالومون','هامتو'],
 clothing:['نایکی','آدیداس','پوما','ریبوک','جک‌ولف‌اسکین'],
 equipment:['نایکی','آدیداس','ریبوک','تکنوجیم','پروفورم'],
 book:['نشر چشمه','نشر نی','امیرکبیر','افق','ققنوس'],
 stationery:['پاپکو','پنتر','استدلر','فابرکاستل','کلیپس'],
 art:['فابرکاستل','استدلر','پنتل','روترینگ','کوه‌ای‌نور'],
 baby:['چیکو','فیلیپس اونت','جانسون','مولفیکس','مای بیبی'],
 toy:['لگو','مگا بلاکس','هاسبرو','متل','فانکو'],
 school:['پاپکو','پنتر','فابرکاستل','استدلر'],
 auto:['ایساکو','بوش','دنسو','والئو','کروز'],
 car:['ایران‌خودرو','سایپا','بهمن','کرمان‌موتور','مدیران خودرو'],
 tools:['بوش','ماکیتا','دیوالت','رونیکس','توسن','آروا'],
 motorcycle:['هوندا','یاماها','باجاج','TVS','کاوازاکی'],
 care:['ایساکو','بوش','دنسو','والئو','کروز'],
 food:['یک‌ویک','گلستان','چین‌چین','تبرک','کاله'],
 beverage:['سن‌ایچ','رانی','شیرین‌عسل','کاله','میهن'],
 household:['گلرنگ','هوم‌کر','پاکشوما','تاژ','اکتیو'],
 rice:['گلستان','محسن','طبیعت','هاشمی'],
 oil:['طبیعت','اوین','لاله','غنچه'],
 snacks:['چی‌توز','مزمز','شیرین‌عسل','آیدین'],
 drinks:['سن‌ایچ','رانی','میهن','کاله'],
 herbal:['گل‌دارو','دینه','سینا','زردبند'],
 tea:['گلستان','شهرزاد','دوغزال','محمود'],
 natural:['سی‌گل','سینره','کامان','مای'],
 craft:['سنتی','دست‌ساز','ایرانی'],
 gift:['کادویی','ایرانی','دست‌ساز'],
 traditional:['صنایع دستی ایرانی','سنتی','دست‌ساز'],
 desktop:['لنوو','اچ‌پی','دل','ایسوس','ایسر'],
 parts:['ایسوس','ام‌اس‌آی','گیگابایت','بایواستار','لنوو'],
 audio:['سونی','جی‌بی‌ال','بوز','پایونیر','سامسونگ'],
 projector:['اپسون','بنکیو','شیائومی','ووسون','ایسر'],
 mother:['چیکو','فیلیپس اونت','بیبی‌لند','مای بیبی'],
 general:['سامسونگ','شیائومی','فیلیپس','بوش','پارس‌خزر'],
 other:['سامسونگ','شیائومی','فیلیپس','بوش','پارس‌خزر']
};

/* Every visible main category has a real subcategory path ending in a brand field. */
var SUBS={
 digital:[['mobile','موبایل'],['laptop','لپ‌تاپ'],['tablet','تبلت'],['headphones','هدفون و هندزفری'],['tv','تلویزیون'],['camera','دوربین'],['accessories','لوازم جانبی'],['gaming','کنسول و گیم'],['smart-home','خانه هوشمند']],
 home:[['appliance','لوازم خانگی'],['kitchen','لوازم آشپزخانه'],['decoration','دکوراسیون'],['cleaning','نظافت و شست‌وشو']],
 furniture:[['furniture','مبلمان منزل'],['office','مبلمان اداری'],['decoration','دکور و اکسسوری'],['sleep','تخت و خواب']],
 fashion:[['men','پوشاک مردانه'],['women','پوشاک زنانه'],['kids','پوشاک کودک'],['shoes','کفش'],['bags','کیف و اکسسوری']],
 beauty:[['skin','مراقبت پوست'],['hair','مراقبت مو'],['makeup','آرایشی'],['personal','بهداشت و مراقبت شخصی']],
 health:[['health','مکمل و ویتامین'],['medical','تجهیزات پزشکی'],['personalCare','بهداشت و مراقبت شخصی'],['fitness','سلامت و تناسب اندام']],
 sports:[['fitness','ورزش و بدنسازی'],['outdoor','کمپ و سفر'],['clothing','پوشاک ورزشی'],['equipment','تجهیزات ورزشی']],
 supermarket:[['food','مواد غذایی'],['beverage','نوشیدنی'],['household','کالاهای مصرفی خانه'],['personal','بهداشت شخصی']],
 books:[['book','کتاب'],['stationery','لوازم تحریر'],['art','هنر و ابزار هنری']],
 kids:[['baby','نوزاد'],['toy','اسباب‌بازی'],['school','کودک و آموزشی']],
 'tools-auto':[['auto','لوازم خودرو'],['tools','ابزار'],['motorcycle','موتورسیکلت']],
 'auto-tools':[['auto','لوازم خودرو'],['tools','ابزار'],['care','نگهداری خودرو']],
 local:[['food','محصولات غذایی محلی'],['handmade','صنایع دستی'],['traditional','محصولات سنتی']],
 computer:[['laptop','لپ‌تاپ'],['desktop','کامپیوتر رومیزی'],['parts','قطعات و لوازم جانبی'],['office','تجهیزات اداری']],
 av:[['tv','تلویزیون'],['audio','صوتی'],['projector','پروژکتور']],
 auto:[['car','خودرو'],['parts','قطعات و لوازم'],['accessories','لوازم جانبی']],
 food:[['rice','برنج و غلات'],['oil','روغن و حبوبات'],['snacks','تنقلات'],['drinks','نوشیدنی']],
 herbal:[['herbal','گیاهان دارویی'],['tea','دمنوش و چای'],['natural','محصولات طبیعی']],
 handmade:[['craft','صنایع دستی'],['home','محصولات دست‌ساز خانه'],['gift','هدیه']],
 culture:[['book','کتاب'],['art','هنر'],['gift','محصولات فرهنگی']],
 'mother-kid':[['baby','نوزاد'],['mother','مادر'],['toy','اسباب‌بازی']],
 other:[['general','کالاهای عمومی'],['gift','هدیه'],['other','سایر']]
};

/* Curated root categories: health and furniture are restored as real categories; duplicate/empty paths are not shown. */
var ROOTS={
 digikala:[['digital','کالای دیجیتال'],['home','خانه و آشپزخانه'],['furniture','مبلمان'],['fashion','مد و پوشاک'],['supermarket','کالاهای خوراکی و اساسی'],['beauty','زیبایی و سلامت'],['health','سلامت و پزشکی'],['books','کتاب، لوازم تحریر و هنر'],['kids','اسباب‌بازی، کودک و نوزاد'],['sports','ورزش و سفر'],['tools-auto','ابزار، خودرو و موتورسیکلت'],['local','محصولات بومی و محلی'],['other','سایر']],
 snappshop:[['digital','کالای دیجیتال'],['home','خانه و آشپزخانه'],['furniture','مبلمان'],['fashion','مد و پوشاک'],['beauty','زیبایی و سلامت'],['health','سلامت و پزشکی'],['culture','فرهنگ و هنر'],['mother-kid','مادر و کودک'],['sports','ورزش و سفر'],['auto-tools','ابزار و لوازم خودرو'],['supermarket','کالاهای روزمره و سوپرمارکتی'],['other','سایر']],
 torob:[['digital','کالای دیجیتال'],['computer','لپ‌تاپ، کامپیوتر و اداری'],['supermarket','هایپرمارکت'],['home','لوازم خانگی'],['furniture','مبلمان'],['fashion','مد و پوشاک'],['beauty','زیبایی و بهداشت'],['health','سلامت و پزشکی'],['av','صوتی و تصویری'],['auto','خودرو و سایر وسایل نقلیه'],['sports','ورزش و سرگرمی'],['other','سایر']],
 basalam:[['digital','کالای دیجیتال'],['food','مواد غذایی'],['herbal','عطاری'],['beauty','آرایشی و بهداشتی'],['health','سلامت و پزشکی'],['handmade','صنایع دستی'],['fashion','پوشاک'],['culture','محصولات فرهنگی'],['home','لوازم خانگی'],['furniture','مبلمان'],['sports','ورزش و سفر'],['local','محصولات محلی و سنتی'],['other','سایر']]
};

var USAGE={
 mobile:[['daily','برای استفاده روزمره'],['photo-video','برای عکاسی و فیلمبرداری'],['gaming','برای بازی و گیمینگ'],['content','برای تولید محتوا و طراحی'],['work','برای کار و برنامه‌نویسی'],['study','برای درس و مطالعه'],['travel','برای سفر'],['communication','برای تماس و ارتباط'],['outdoor','برای استفاده در فضای باز']],
 laptop:[['work','برای کار و برنامه‌نویسی'],['study','برای درس و مطالعه'],['gaming','برای بازی و گیمینگ'],['content','برای تولید محتوا و طراحی'],['office','برای کار اداری'],['daily','برای استفاده روزمره'],['travel','برای سفر'],['education','برای آموزش']],
 tablet:[['study','برای درس و مطالعه'],['work','برای کار و مطالعه'],['content','برای طراحی و یادداشت‌برداری'],['entertainment','برای فیلم و سرگرمی'],['daily','برای استفاده روزمره'],['travel','برای سفر'],['reading','برای مطالعه و کتاب‌خوانی']],
 headphones:[['music','برای موسیقی و شنیدن صدا'],['daily','برای استفاده روزمره'],['gaming','برای بازی و گیمینگ'],['work','برای کار و تماس'],['sport','برای ورزش'],['travel','برای سفر'],['study','برای درس و مطالعه']],
 tv:[['movie','برای فیلم و سریال'],['gaming','برای بازی و گیمینگ'],['daily','برای استفاده روزمره'],['family','برای استفاده خانوادگی'],['sport','برای تماشای ورزش'],['streaming','برای تماشای محتوای آنلاین']],
 camera:[['photo-video','برای عکاسی و فیلمبرداری'],['content','برای تولید محتوا'],['travel','برای سفر'],['work','برای کار حرفه‌ای'],['family','برای ثبت خاطرات خانوادگی'],['sport','برای عکاسی ورزشی'],['nature','برای عکاسی طبیعت']],
 accessories:[['daily','برای استفاده روزمره'],['work','برای کار و مطالعه'],['travel','برای سفر'],['gaming','برای بازی و گیمینگ'],['content','برای تولید محتوا و طراحی'],['charging','برای شارژ و برق‌رسانی'],['protection','برای محافظت از دستگاه']],
 gaming:[['gaming','برای بازی و گیمینگ'],['competitive','برای بازی رقابتی'],['content','برای تولید محتوا و استریم'],['family','برای بازی خانوادگی'],['daily','برای استفاده روزمره'],['online','برای بازی آنلاین']],
 'smart-home':[['home','برای هوشمندسازی خانه'],['security','برای امنیت خانه'],['energy','برای مدیریت مصرف انرژی'],['comfort','برای آسایش و کنترل محیط'],['daily','برای استفاده روزمره'],['lighting','برای نورپردازی هوشمند']],
 appliance:[['family','برای استفاده خانوادگی'],['daily','برای استفاده روزمره'],['cooking','برای آشپزی و پخت‌وپز'],['cleaning','برای شست‌وشو و نظافت'],['energy','برای کاهش مصرف انرژی'],['professional','برای استفاده حرفه‌ای']],
 kitchen:[['daily','برای آشپزی روزمره'],['baking','برای پخت شیرینی و کیک'],['family','برای استفاده خانوادگی'],['beverage','برای تهیه نوشیدنی'],['professional','برای آشپزی حرفه‌ای'],['quick','برای آماده‌سازی سریع غذا']],
 decoration:[['home','برای دکوراسیون منزل'],['office','برای دکوراسیون محل کار'],['gift','برای هدیه'],['seasonal','برای دکور مناسبتی'],['minimal','برای دکور مینیمال']],
 cleaning:[['home','برای نظافت منزل'],['office','برای نظافت محل کار'],['professional','برای نظافت حرفه‌ای'],['daily','برای نظافت روزانه'],['car','برای نظافت خودرو']],
 furniture:[['home','برای منزل'],['office','برای محل کار'],['family','برای استفاده خانوادگی'],['sleep','برای استراحت و خواب'],['storage','برای نظم و نگهداری وسایل']],
 office:[['work','برای کار اداری'],['study','برای مطالعه'],['professional','برای استفاده حرفه‌ای'],['home','برای دفتر کار خانگی'],['meeting','برای جلسه و ارائه']],
 sleep:[['sleep','برای خواب و استراحت'],['home','برای اتاق خواب'],['comfort','برای آسایش و استراحت'],['health','برای بهبود کیفیت خواب']],
 men:[['daily','برای استفاده روزمره'],['work','برای محل کار'],['formal','برای استفاده رسمی'],['sport','برای ورزش'],['party','برای مهمانی'],['travel','برای سفر']],
 women:[['daily','برای استفاده روزمره'],['work','برای محل کار'],['formal','برای استفاده رسمی'],['sport','برای ورزش'],['party','برای مهمانی'],['travel','برای سفر']],
 kids:[['daily','برای استفاده روزمره'],['school','برای مدرسه'],['sport','برای ورزش'],['play','برای بازی و سرگرمی'],['travel','برای سفر']],
 shoes:[['daily','برای استفاده روزمره'],['sport','برای ورزش'],['formal','برای استفاده رسمی'],['work','برای محیط کار'],['travel','برای سفر'],['outdoor','برای طبیعت‌گردی']],
 bags:[['daily','برای استفاده روزمره'],['work','برای کار'],['travel','برای سفر'],['school','برای مدرسه'],['sport','برای ورزش'],['formal','برای استفاده رسمی']],
 skin:[['daily','برای مراقبت روزانه'],['beauty','برای زیبایی'],['sensitive','برای پوست حساس'],['hydration','برای آبرسانی'],['anti-aging','برای مراقبت ضدپیری']],
 hair:[['daily','برای مراقبت روزانه'],['beauty','برای زیبایی و حالت‌دهی'],['damage','برای موهای آسیب‌دیده'],['color','برای موهای رنگ‌شده'],['repair','برای ترمیم مو']],
 makeup:[['daily','برای آرایش روزانه'],['party','برای مهمانی'],['professional','برای آرایش حرفه‌ای'],['formal','برای آرایش مجلسی'],['natural','برای آرایش طبیعی']],
 personal:[['daily','برای استفاده روزمره'],['travel','برای سفر'],['gift','برای هدیه'],['family','برای استفاده خانوادگی'],['sport','برای ورزش']],
 health:[['daily','برای مصرف روزانه'],['fitness','برای ورزش و تناسب اندام'],['wellness','برای سلامت و تندرستی'],['family','برای استفاده خانوادگی'],['sport','برای فعالیت ورزشی']],
 medical:[['home','برای استفاده در منزل'],['professional','برای استفاده حرفه‌ای'],['care','برای مراقبت و پایش سلامت'],['rehab','برای توانبخشی'],['elderly','برای مراقبت از سالمندان']],
 fitness:[['fitness','برای ورزش و بدنسازی'],['home','برای تمرین در خانه'],['outdoor','برای ورزش در فضای باز'],['professional','برای تمرین حرفه‌ای'],['rehab','برای تمرین توانبخشی']],
 outdoor:[['travel','برای سفر و کمپ'],['sport','برای ورزش در فضای باز'],['daily','برای استفاده روزمره'],['camping','برای کمپینگ'],['hiking','برای کوهنوردی و طبیعت‌گردی']],
 clothing:[['sport','برای ورزش'],['daily','برای استفاده روزمره'],['travel','برای سفر'],['outdoor','برای فضای باز'],['work','برای محیط کار']],
 equipment:[['fitness','برای ورزش و بدنسازی'],['professional','برای استفاده حرفه‌ای'],['home','برای تمرین در خانه'],['outdoor','برای ورزش در فضای باز'],['rehab','برای توانبخشی']],
 book:[['study','برای درس و مطالعه'],['leisure','برای مطالعه آزاد'],['gift','برای هدیه'],['education','برای آموزش'],['professional','برای مطالعه تخصصی']],
 stationery:[['school','برای مدرسه'],['study','برای درس و مطالعه'],['office','برای کار اداری'],['art','برای طراحی و هنر'],['home','برای استفاده در خانه']],
 art:[['art','برای طراحی و هنر'],['study','برای آموزش و تمرین'],['professional','برای کار حرفه‌ای'],['hobby','برای سرگرمی و هنر'],['school','برای مدرسه']],
 baby:[['daily','برای استفاده روزمره نوزاد'],['care','برای مراقبت از نوزاد'],['gift','برای هدیه'],['feeding','برای تغذیه نوزاد'],['travel','برای سفر با نوزاد']],
 toy:[['play','برای بازی و سرگرمی'],['education','برای آموزش'],['gift','برای هدیه'],['creative','برای خلاقیت و ساخت‌وساز'],['outdoor','برای بازی در فضای باز']],
 school:[['school','برای مدرسه'],['study','برای درس و مطالعه'],['art','برای هنر و خلاقیت'],['office','برای لوازم آموزشی و اداری'],['gift','برای هدیه']],
 auto:[['daily','برای استفاده روزمره خودرو'],['maintenance','برای نگهداری خودرو'],['travel','برای سفر'],['safety','برای ایمنی خودرو'],['performance','برای بهبود عملکرد خودرو']],
 car:[['daily','برای استفاده روزمره'],['family','برای استفاده خانوادگی'],['travel','برای سفر'],['sport','برای رانندگی اسپرت'],['work','برای کار و جابه‌جایی']],
 tools:[['home','برای کارهای خانه'],['professional','برای کار حرفه‌ای'],['auto','برای تعمیر و نگهداری خودرو'],['workshop','برای کارگاه'],['maintenance','برای تعمیر و نگهداری']],
 motorcycle:[['daily','برای استفاده روزمره'],['travel','برای سفر'],['sport','برای تفریح و ورزش'],['delivery','برای پیک و جابه‌جایی'],['maintenance','برای نگهداری و تعمیر']],
 care:[['maintenance','برای نگهداری خودرو'],['daily','برای استفاده روزمره'],['professional','برای استفاده حرفه‌ای'],['safety','برای ایمنی خودرو'],['repair','برای تعمیر خودرو']],
 food:[['daily','برای مصرف روزانه'],['family','برای مصرف خانوادگی'],['gift','برای هدیه'],['party','برای مهمانی'],['travel','برای سفر']],
 beverage:[['daily','برای مصرف روزانه'],['family','برای مصرف خانوادگی'],['party','برای مهمانی'],['travel','برای سفر'],['gift','برای هدیه']],
 household:[['daily','برای مصرف روزانه'],['family','برای استفاده خانوادگی'],['cleaning','برای نظافت خانه'],['kitchen','برای آشپزخانه'],['office','برای محل کار']],
 rice:[['daily','برای مصرف روزانه'],['family','برای مصرف خانوادگی'],['party','برای مهمانی'],['gift','برای هدیه']],
 oil:[['daily','برای مصرف روزانه'],['family','برای مصرف خانوادگی'],['cooking','برای آشپزی'],['gift','برای هدیه']],
 snacks:[['daily','برای مصرف روزانه'],['party','برای مهمانی'],['gift','برای هدیه'],['school','برای مدرسه و میان‌وعده'],['travel','برای سفر']],
 drinks:[['daily','برای مصرف روزانه'],['family','برای مصرف خانوادگی'],['party','برای مهمانی'],['travel','برای سفر'],['gift','برای هدیه']],
 herbal:[['wellness','برای سلامت و تندرستی'],['daily','برای مصرف روزانه'],['gift','برای هدیه'],['care','برای مراقبت شخصی'],['relaxation','برای آرامش و ریلکسیشن']],
 tea:[['daily','برای مصرف روزانه'],['family','برای مصرف خانوادگی'],['gift','برای هدیه'],['relaxation','برای آرامش و پذیرایی'],['party','برای مهمانی']],
 natural:[['daily','برای مراقبت روزانه'],['wellness','برای سلامت و تندرستی'],['gift','برای هدیه'],['beauty','برای زیبایی'],['care','برای مراقبت شخصی']],
 craft:[['home','برای خانه'],['gift','برای هدیه'],['decoration','برای دکوراسیون'],['hobby','برای سرگرمی و هنر'],['professional','برای کار هنری']],
 gift:[['gift','برای هدیه'],['home','برای خانه'],['personal','برای استفاده شخصی'],['formal','برای هدیه رسمی'],['family','برای هدیه خانوادگی']],
 traditional:[['gift','برای هدیه'],['home','برای خانه'],['decoration','برای دکوراسیون'],['collection','برای کلکسیون'],['cultural','برای استفاده فرهنگی']],
 desktop:[['work','برای کار و برنامه‌نویسی'],['gaming','برای بازی و گیمینگ'],['content','برای تولید محتوا و طراحی'],['office','برای کار اداری'],['professional','برای کار حرفه‌ای'],['study','برای درس و مطالعه']],
 parts:[['gaming','برای بازی و گیمینگ'],['work','برای کار و برنامه‌نویسی'],['upgrade','برای ارتقای سیستم'],['professional','برای کار حرفه‌ای'],['office','برای کار اداری']],
 audio:[['music','برای موسیقی و شنیدن صدا'],['movie','برای فیلم و سریال'],['gaming','برای بازی و گیمینگ'],['party','برای مهمانی'],['professional','برای کار صوتی حرفه‌ای']],
 projector:[['movie','برای فیلم و سریال'],['presentation','برای ارائه و آموزش'],['gaming','برای بازی و گیمینگ'],['office','برای جلسات و کار اداری'],['education','برای آموزش']],
 mother:[['care','برای مراقبت از مادر و نوزاد'],['daily','برای استفاده روزمره'],['gift','برای هدیه'],['feeding','برای تغذیه'],['travel','برای سفر']],
 general:[['daily','برای استفاده روزمره'],['work','برای کار و مطالعه'],['family','برای استفاده خانوادگی'],['gift','برای هدیه'],['travel','برای سفر']],
 other:[['daily','برای استفاده روزمره'],['work','برای کار و مطالعه'],['family','برای استفاده خانوادگی'],['gift','برای هدیه'],['travel','برای سفر']]
};

var BUDGETS=[[0,20000000,'تا ۲۰ میلیون تومان'],[20000000,40000000,'۲۰ تا ۴۰ میلیون تومان'],[40000000,60000000,'۴۰ تا ۶۰ میلیون تومان'],[60000000,80000000,'۶۰ تا ۸۰ میلیون تومان'],[80000000,120000000,'۸۰ تا ۱۲۰ میلیون تومان'],[120000000,200000000,'۱۲۰ تا ۲۰۰ میلیون تومان'],[200000000,300000000,'۲۰۰ تا ۳۰۰ میلیون تومان'],[300000000,400000000,'۳۰۰ تا ۴۰۰ میلیون تومان'],[400000000,600000000,'۴۰۰ تا ۶۰۰ میلیون تومان'],[600000000,800000000,'۶۰۰ تا ۸۰۰ میلیون تومان'],[800000000,1000000000,'۸۰۰ میلیون تا ۱ میلیارد تومان']];

function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function unique(list){var seen={};return (list||[]).filter(function(x){var k=x[0]+'|'+x[1];if(seen[k])return false;seen[k]=1;return true})}

function setRoots(cat,store){
 var roots=ROOTS[store]||ROOTS.digikala;
 cat.innerHTML=roots.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('');
 cat.insertAdjacentHTML('afterbegin','<option value="">انتخاب دسته‌بندی</option>');
 cat.value='';cat.disabled=false;
}
function ensureSubField(){
 var grid=$('v5Subcategory')&&$('v5Subcategory').closest('.v5-field')?$('v5Subcategory').closest('.v5-field'):null;
 if(grid)return $('v5Subcategory');
 var cat=$('v5Category'),dyn=$('v5DynamicFields');if(!cat)return null;
 var parent=cat.closest('.form-grid')||cat.parentElement;
 var field=document.createElement('label');field.id='v6SubcategoryField';field.className='v5-field full';
 field.innerHTML='<span>زیر دسته</span><select id="v5Subcategory" disabled><option value="">ابتدا دسته‌بندی را انتخاب کنید</option></select>';
 if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(field,dyn);else if(parent)parent.appendChild(field);
 return $('v5Subcategory');
}
function renderBrand(sub){
 var existing=$('v6BrandField');if(existing)existing.remove();
 var store=$('storeSelect')&&$('storeSelect').value;
 /* Dayan/MeMarket have their own taxonomy scripts; never let the generic
    product-options bridge paint unrelated brands over them. */
 if(store==='dayan'||store==='memarket')return;
 var brands=BRANDS[sub]||BRANDS.general;
 var subSel=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!subSel)return;
 var field=document.createElement('label');field.id='v6BrandField';field.className='v5-field full';
 field.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+brands.map(function(b){return '<option value="'+esc(b)+'">'+esc(b)+'</option>'}).join('')+'</select>';
 var budgetField=$('v6BudgetRange')&&$('v6BudgetRange').closest('.v5-field');
 if(budgetField&&budgetField.parentNode)budgetField.parentNode.insertBefore(field,budgetField);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(field,dyn);
}
function ensureBudget(){
 var input=$('budgetMax');if(!input)return null;
 var field=input.closest('.v5-field');if(!field)return null;
 var select=$('v6BudgetRange');
 if(!select){
  select=document.createElement('select');select.id='v6BudgetRange';select.className=input.className;select.setAttribute('aria-label','چقدر می‌خوای هزینه کنی؟');
  select.style.textAlign='center';select.style.textAlignLast='center';
  select.innerHTML='<option value="">چقدر می‌خوای هزینه کنی؟</option>'+BUDGETS.map(function(x){return '<option value="'+x[1]+'" data-min="'+x[0]+'">'+esc(x[2])+'</option>'}).join('');
  field.insertBefore(select,input);input.style.display='none';
 }
 var min=$('budgetMin');if(!min){min=document.createElement('input');min.type='hidden';min.id='budgetMin';min.name='budgetMin';input.parentNode.insertBefore(min,input)}
 select.onchange=function(){var o=select.options[select.selectedIndex];input.value=o&&o.value||'';min.value=o&&o.dataset.min||'';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))};
 return select;
}
function removeLegacyUsageFields(){
 var card=document.querySelector('.v5-profile-card');if(!card)return;
 Array.from(card.querySelectorAll('label')).forEach(function(field){
  if(field.id==='v6UsageField')return;
  var select=field.querySelector('select');
  var labelText=(field.querySelector('span')&&field.querySelector('span').textContent||field.textContent||'').trim();
  if((select&&(select.id==='usage'||select.name==='usage')) || labelText.indexOf('نوع استفاده')>=0) field.remove();
 });
}
function renderUsage(sub){
 removeLegacyUsageFields();
 var existing=$('v6UsageField');if(existing)existing.remove();
 if(!sub)return null;
 var list=USAGE[sub]||USAGE.general;
 var dyn=$('v5DynamicFields'),budget=$('v6BudgetRange'),budgetField=budget&&budget.closest?budget.closest('.v5-field'):null;
 var field=document.createElement('label');field.id='v6UsageField';field.className='v5-field full';
 field.innerHTML='<span>نوع استفاده</span><select id="v6Usage" aria-label="نوع استفاده"><option value="">نوع استفاده</option>'+list.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('')+'</select>';
 var select=field.querySelector('select');select.style.textAlign='center';select.style.textAlignLast='center';
 if(budgetField&&budgetField.parentNode)budgetField.parentNode.insertBefore(field,budgetField.nextSibling);else if(dyn&&dyn.parentNode)dyn.parentNode.appendChild(field);
 return select;
}
function updateSub(cat){
 removeLegacyUsageFields();
 var sub=ensureSubField();if(!sub)return;
 var list=unique(SUBS[cat.value]||[]);
 sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('');
 sub.disabled=!list.length;sub.value='';
 var old=$('v6BrandField');if(old)old.remove();
 var oldUsage=$('v6UsageField');if(oldUsage)oldUsage.remove();
}
function bind(){
 var store=$('storeSelect'),cat=$('v5Category');if(!store||!cat)return false;
 ensureBudget();
 if(!store.dataset.v6OptionsBound){
  store.dataset.v6OptionsBound='1';
  store.addEventListener('change',function(){setTimeout(function(){setRoots(cat,store.value);updateSub(cat)},0)});
 }
 if(!cat.dataset.v6OptionsBound){
  cat.dataset.v6OptionsBound='1';
  cat.addEventListener('change',function(){updateSub(cat)});
 }
 var sub=ensureSubField();
 if(sub&&!sub.dataset.v6BrandBound){sub.dataset.v6BrandBound='1';sub.addEventListener('change',function(){if(sub.value){renderBrand(sub.value);renderUsage(sub.value)}else {var br=$('v6BrandField');if(br)br.remove();var u=$('v6UsageField');if(u)u.remove()}})}
 if(store.value){setRoots(cat,store.value)}
 updateSub(cat);
 return true;
}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
window.DigiYarV6ProductOptionsReady=true;
})();
