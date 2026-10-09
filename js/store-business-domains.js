/* DigiYar V7 — unified merchant business-domain knowledge base */
(function(root){
'use strict';
var VERSION='7.0.0-store-business-domains.19';
var C={
digikala:{name:'دیجی‌کالا',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books','auto'],products:['موبایل','تبلت','لپ تاپ','کامپیوتر','لوازم جانبی','لوازم خانگی','پوشاک','کفش','آرایشی','بهداشتی','خانه','ورزش','کودک','کتاب','خودرو','قرص','مکمل','ویتامین'],aliases:['فروشگاه عمومی','مارکت پلیس']},
snappshop:{name:'اسنپ‌شاپ',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','auto'],products:['موبایل','تبلت','لپ تاپ','دیجیتال','لوازم خانگی','پوشاک','کفش','آرایشی','بهداشتی','روزمره','قرص','مکمل','ویتامین'],aliases:['خرید آنلاین عمومی']},
torob:{name:'ترب',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books','auto'],products:['موبایل','لپ تاپ','تبلت','دیجیتال','لوازم خانگی','پوشاک','آرایشی','بهداشتی','خودرو','کتاب','قرص','مکمل','ویتامین'],aliases:['مقایسه قیمت','جستجوی کالا']},
basalam:{name:'باسلام',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books'],products:['پوشاک','کفش','کیف','خانه','خوراکی','آرایشی','سلامت','دیجیتال','صنایع دستی','کتاب','قرص','مکمل','ویتامین'],aliases:['بازارگاه','محصولات محلی']},
esam:{name:'ایسام',domains:['digital','furniture','fashion','home','auto','books'],products:['دیجیتال','موبایل','لپ تاپ','خانه','پوشاک','خودرو','کتاب','کلکسیونی'],aliases:['مزایده','خرید و فروش']},
iranmiz:{name:'ایران میز',intents:['furniture'],domains:['furniture','home'],products:['میز ناهارخوری','میز غذاخوری','میز چوبی','مبل','مبلمان','صندلی','تخت خواب','کمد','دکوراسیون','مبلمان اداری','صندلی اداری','میز اداری'],aliases:['محصولات چوبی','صنایع چوب','میز ناهار خوری','ناهارخوری'],exclude:['موبایل','لپ تاپ','تمیز کردن','تمیزکردن','شستشو','شستن','نظافت','شوینده','مبل شویی','شستشوی مبل']},
partochoob:{name:'پرتوچوب',intents:['furniture'],domains:['furniture','home'],products:['میز ناهارخوری','میز غذاخوری','میز کنسول','میز چوبی','مبل','مبلمان','صندلی','جاکفشی','کمد','محصولات چوبی'],aliases:['صنایع چوب','دکوراسیون','میز ناهار خوری','ناهارخوری'],exclude:['موبایل','لپ تاپ','تمیز کردن','تمیزکردن','شستشو','شستن','نظافت','شوینده','مبل شویی','شستشوی مبل']},
chidahome:{name:'چیدا هوم',intents:['furniture'],domains:['furniture','home'],products:['میز ناهارخوری','میز غذاخوری','میز چوبی','مبل','مبلمان','صندلی','سرویس خواب','میز تلویزیون','جلومبلی','روشنایی'],aliases:['مبلمان منزل','دکوراسیون','ناهارخوری','میز ناهار خوری'],exclude:['موبایل','لپ تاپ','تمیز کردن','تمیزکردن','شستشو','شستن','نظافت','شوینده','مبل شویی','شستشوی مبل']},
tidawood:{name:'تیدا چوب',intents:['furniture'],domains:['furniture','home'],products:['میز ناهارخوری','میز غذاخوری','میز چوبی','مبل','مبلمان','سرویس خواب','تخت','کمد'],aliases:['محصولات چوبی','مبلمان مینیمال','ناهارخوری','میز ناهار خوری'],exclude:['موبایل','لپ تاپ','تمیز کردن','تمیزکردن','شستشو','شستن','نظافت','شوینده','مبل شویی','شستشوی مبل']},
khanoumi:{name:'خانومی',domains:['beauty','health'],products:['ضد آفتاب','کرم','آبرسان','ضد جوش','شوینده صورت','سرم پوست','لوازم آرایش','عطر','شامپو','ضد تعریق'],aliases:['زیبایی','مراقبت پوست','مراقبت مو'],exclude:['موبایل','لپ تاپ']},
banimode:{name:'بانی‌مد',domains:['fashion','beauty'],products:['تیشرت','پیراهن','شلوار','هودی','کاپشن','مانتو','کفش','کیف','اکسسوری','عطر'],aliases:['مد','فشن','پوشاک'],exclude:['موبایل']},
modiseh:{name:'مدیسه',domains:['fashion','beauty'],products:['لباس','کفش','کیف','اکسسوری','عطر','لوازم آرایش','مراقبت پوست'],aliases:['مد و زیبایی'],exclude:['موبایل']},
pinket:{name:'پینکت',domains:['supermarket','home','beauty'],products:['مواد غذایی','نوشیدنی','شوینده','کالاهای مصرفی','بهداشتی','لوازم خانه'],aliases:['سوپرمارکت','خرید روزمره'],exclude:['موبایل','لپ تاپ']},
darukade:{name:'داروکده',domains:['health','beauty','medicine'],products:['دارو','قرص','کپسول','شربت','مکمل','ویتامین','فشارسنج','تجهیزات پزشکی','ضد آفتاب','کرم پوست','آبرسان','مراقبت پوست','شامپو'],aliases:['داروخانه','مکمل','سلامت'],exclude:['موبایل']},
darmankala:{name:'درمان‌کالا',domains:['health','medicine'],products:['فشارسنج','تجهیزات پزشکی','ارتوپدی','توانبخشی','ویلچر','نبولایزر','تجهیزات بیمارستانی','مکمل','ویتامین','سلامت'],aliases:['کالای پزشکی','تجهیزات پزشکی'],exclude:['موبایل','پوشاک']},
digido:{name:'دیجی‌دو',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','آیفون','سامسونگ','شیائومی','قاب گوشی','گلس','شارژر','کابل','پاوربانک','هندزفری'],aliases:['موبایل','گوشی','لوازم جانبی موبایل'],exclude:['پوشاک','مواد غذایی']},
janebi:{name:'جانبی',intents:['mobile_accessories'],domains:['digital','fashion','beauty','health','home','sports','auto','kids'],products:['لوازم جانبی موبایل','گجت موبایل','هندزفری','هدفون و هدست','پاوربانک','شارژر','کابل شارژر','کابل','هولدر موبایل','مونوپاد','قاب گوشی','کیف گوشی','گلس گوشی','محافظ صفحه','محافظ لنز','باتری موبایل','ساعت هوشمند','بند ساعت هوشمند','شارژر ساعت','لوازم جانبی لپ تاپ','کوله و کیف لپ تاپ','شارژر لپ تاپ','کول پد','استند لپ تاپ','لوازم جانبی تبلت','کیف تبلت','قاب تبلت','گلس تبلت','قلم لمسی','باتری تبلت','لوازم جانبی کامپیوتر','ماوس','کیبورد','ماوس پد','رم ریدر','کابل HDMI','دانگل بلوتوث','هاب USB','هارد باکس','لوازم جانبی خودرو','دوربین ثبت وقایع خودرو','جارو شارژی ماشین','خوشبو کننده ماشین','پمپ باد','اینورتر خودرو','شارژر فندکی','اسپیکر','ویدئو پروژکتور','دوربین مدار بسته','گیرنده بلوتوث','محافظ برق','چندراهی برق','میکروفون','رینگ لایت','گیمبال','کتری برقی','قهوه ساز','جارو شارژی','جارو رباتیک','اتو بخار','پنکه شارژی','هیتر برقی','غذا ساز','هواپز','سرخ کن','چراغ خواب','لامپ LED','ریش تراش','ماشین اصلاح','سشوار', 'مسواک برقی','اتو مو','ماساژور','ترازو','ضد آفتاب','کرم دست','شوینده صورت','ماسک صورت','سرم صورت','آبرسان','مرطوب کننده','دئودورانت','کیف','کوله پشتی','عینک آفتابی','ساعت مچی','جاکلیدی','شیکر','قمقمه','کش ورزشی','مت یوگا','طناب ورزشی','دستکش بدنسازی','لوازم سفر','چمدان','چراغ قوه','بازی فکری','پازل','لوازم تحریر','اسباب بازی'],aliases:['اکسسوری موبایل','لوازم جانبی موبایل','لوازم جانبی رایانه','لوازم جانبی لپ تاپ','لوازم جانبی تبلت','لوازم جانبی کامپیوتر','لوازم جانبی خودرو','کالای دیجیتال و برقی','زیبایی و سلامت','لوازم خانه','ورزش و سفر','مد و پوشاک'],exclude:['موبایل','گوشی موبایل','گوشی سامسونگ','گوشی آیفون','گوشی شیائومی','پوشاک']},
digiland:{name:'دیجی‌لند',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','لپ تاپ','مانیتور','کامپیوتر','کنسول','گیمینگ','شبکه','لوازم جانبی دیجیتال'],aliases:['کالای دیجیتال','گیمینگ'],exclude:['پوشاک','مواد غذایی']},
takhfifan:{name:'تخفیفان',intents:['mobile'],rankAfterGeneral:true,domains:['digital','furniture','beauty','fashion','home','sports'],products:['موبایل','کالای دیجیتال','پوشاک','زیبایی','خانه','ورزش','خدمات تخفیفی'],aliases:['تخفیف','کد تخفیف','پیشنهاد ویژه']},
berozkala:{name:'بروز کالا',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','تبلت','لپ تاپ','مانیتور','پرینتر','ماشین اداری','تجهیزات دیجیتال'],aliases:['کالای دیجیتال','ماشین اداری'],exclude:['پوشاک','مواد غذایی']},
gooshishop:{name:'گوشی شاپ',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','آیفون','سامسونگ','شیائومی','لوازم جانبی موبایل','گجت'],aliases:['فروشگاه موبایل','گوشی'],exclude:['پوشاک','مواد غذایی']},
technolife:{name:'تکنولایف',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','آیفون','سامسونگ','شیائومی','لپ تاپ','تبلت','هدفون','هندزفری','ساعت هوشمند','لوازم جانبی'],aliases:['کالای دیجیتال','فناوری'],exclude:['پوشاک','مواد غذایی']},
meghdadit:{name:'مقداد آی‌تی',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','لپ تاپ','کامپیوتر','قطعات کامپیوتر','مانیتور','پرینتر','شبکه','تجهیزات جانبی کامپیوتر','تبلت'],aliases:['آی تی','فروشگاه کامپیوتر','کالای دیجیتال'],exclude:['پوشاک','مواد غذایی']},
neshatrokh:{name:'نشاط رخ',domains:['beauty','health'],products:['لوازم آرایشی','ضد آفتاب','کرم پوست','آبرسان','مراقبت پوست','مراقبت مو','بهداشتی'],aliases:['زیبایی','سلامت'],exclude:['موبایل','لپ تاپ']},
mosbatesabz:{name:'مثبت سبز',domains:['health','beauty','medicine'],products:['مکمل','ویتامین','فشارسنج','تجهیزات پزشکی','ضد آفتاب','کرم پوست','بهداشتی','داروخانه‌ای','مراقبت پوست'],aliases:['داروخانه','سلامت','مکمل'],exclude:['موبایل','لپ تاپ']},
shavaz:{name:'شاواز',domains:['beauty','health'],products:['لوازم آرایش','ضد آفتاب','کرم پوست','شامپو','مراقبت مو','بهداشتی','عطر'],aliases:['زیبایی','آرایشی بهداشتی'],exclude:['موبایل','لپ تاپ']},
solokala:{name:'سولوکالا',domains:['beauty','health','accessories'],products:['لوازم آرایش','ضد آفتاب','کرم پوست','عطر','بهداشتی','اکسسوری'],aliases:['آرایشی بهداشتی','اکسسوری'],exclude:['موبایل','لپ تاپ']},
'daroo-online':{name:'داروخانه آنلاین',domains:['medicine','health','beauty'],products:['دارو','قرص','کپسول','شربت','مکمل','ویتامین','فشارسنج','تجهیزات پزشکی','ضد آفتاب','بهداشتی','مراقبت پوست'],aliases:['داروخانه آنلاین','دارو'],exclude:['موبایل','لپ تاپ']},
dayan:{name:'دایان شاپ',domains:['fashion','accessories'],products:['لباس مردانه','لباس زنانه','کفش','کتانی','هودی','سوییشرت','کاپشن','شلوار','تیشرت','پیراهن','ساعت','عینک','کیف','زیورآلات'],aliases:['پوشاک','استایل','اکسسوری'],exclude:['موبایل']},
memarket:{name:'می‌مارکت',domains:['digital','home','fashion','accessories','beauty'],products:['لپ تاپ','لوازم دیجیتال','لوازم خانه','پوشاک','کفش','کیف','آرایشی','ساعت','اکسسوری'],aliases:['خرید آنلاین متنوع']},
jeanswest:{name:'جین وست',domains:['fashion'],products:['پوشاک زنانه','پوشاک مردانه','پوشاک کودک','تیشرت','شلوار','کاپشن','کفش','اکسسوری'],aliases:['پوشاک','استایل'],exclude:['موبایل','لپ تاپ']},
sabzgostar:{name:'سبز گستر',domains:['affiliate_network'],products:['شبکه همکاری در فروش'],aliases:['افیلیت مارکتینگ','شبکه افیلیت','همکاری در فروش'],exclude:['محصول فیزیکی نامرتبط']},
shab:{name:'شب',domains:['lodging','travel_ticket'],products:['ویلا','سوئیت','کلبه','اقامتگاه','بوم گردی','بلیط قطار','بلیط اتوبوس','سفر'],aliases:['رزرو ویلا','اقامت','رزرو سفر'],exclude:['کالای فیزیکی']},
safarme:{name:'سفرمی',domains:['travel_ticket'],products:['بلیط هواپیما','بلیط قطار','بلیط اتوبوس','پرواز','سفر'],aliases:['پرواز','بلیط هواپیما'],exclude:['کالای فیزیکی']},
eseminar:{name:'ایسمینار',domains:['education'],products:['وبینار','رویداد آنلاین','سمینار'],aliases:['وبینار','آموزش آنلاین'],exclude:['کالای فیزیکی']},
maktabkhooneh:{name:'مکتب‌خونه',domains:['education'],products:['دوره آموزشی','دوره برنامه نویسی','آموزش مهارتی','کلاس آنلاین'],aliases:['دوره آنلاین','آموزش'],exclude:['کالای فیزیکی']},
karnameh:{name:'کارنامه',domains:['auto_service'],products:['کارشناسی خودرو','قیمت خودرو','فروش خودرو','خرید خودرو','خودرو کارکرده'],aliases:['کارشناسی ماشین','قیمت ماشین','خدمات خودرو'],exclude:['موبایل','لپ تاپ']},
iransetkor:{name:'ایران ستکور',homepage:'https://iransetkor.com/',domains:["furniture","home"],products:["میز و صندلی","تخت خواب","مبل تخت خواب شو","کمد","تشک","میز تحریر"],aliases:["مبلمان و دکوراسیون","خانه"]},
'19kala':{name:'۱۹کالا',homepage:'https://www.19kala.com/',domains:["digital"],products:["موبایل","تبلت","ساعت هوشمند","لوازم جانبی موبایل","لوازم خانگی","کالای دیجیتال"],aliases:["کالای دیجیتال"]},
banistyle:{name:'بانی استایل',homepage:'https://banistyle.com/',domains:["fashion"],products:["لباس زنانه","لباس مردانه","کفش","پوشاک","اکسسوری"],aliases:["پوشاک"]},
aysoocollection:{name:'آیسو کالکشن',homepage:'https://aysoocollection.com/',domains:["fashion"],products:["پوشاک زنانه","پوشاک مردانه","لباس","پوشاک"],aliases:["پوشاک"]},
daru24:{name:'دارو۲۴',homepage:'https://daru24.com/',domains:["medicine","health"],products:["دارو","مکمل","ویتامین","محصولات سلامت"],aliases:["داروخانه","سلامت"]},
betadent:{name:'بتادنت',homepage:'https://betadent.com/',domains:["health","medicine"],products:["دندانپزشکی","تجهیزات دندانپزشکی","محصولات سلامت دهان"],aliases:["سلامت","داروخانه"]},
darupedia:{name:'داروپدیا',homepage:'https://darupedia.com/',domains:["medicine","health"],products:["دارو","مکمل","ویتامین","اطلاعات دارویی"],aliases:["داروخانه","سلامت"]},
darucenter:{name:'داروسنتر',homepage:'https://darucenter.com/',domains:["medicine","health"],products:["دارو","مکمل","ویتامین","محصولات سلامت"],aliases:["داروخانه","سلامت"]},
webdaru:{name:'وب‌دارو',homepage:'https://webdaru.com/',domains:["medicine","health"],products:["دارو","مکمل","ویتامین","محصولات سلامت"],aliases:["داروخانه","سلامت"]},
saba:{name:'داروخانه صبا',homepage:'https://sabadaru.com/',domains:["medicine","health"],products:["دارو","مکمل","ویتامین","محصولات سلامت"],aliases:["داروخانه","سلامت"]},
darupost:{name:'داروپست',homepage:'https://darupost.com/',domains:["medicine","health"],products:["دارو","مکمل","ویتامین","محصولات سلامت"],aliases:["داروخانه","سلامت"]},
shider:{name:'شیدر',homepage:'https://shider.com/',domains:["beauty","health"],products:["مراقبت پوست","مراقبت مو","آرایشی","بهداشتی","کرم"],aliases:["آرایشی و بهداشتی","سلامت"]},
alibaba:{name:'علی‌بابا',homepage:'https://www.alibaba.ir/',domains:["travel_ticket"],products:["بلیط هواپیما","بلیط قطار","بلیط اتوبوس","رزرو سفر"],aliases:["بلیط سفر"]},
jobama:{name:'جاباما',homepage:'https://www.jabama.com/',domains:["lodging","travel_ticket"],products:["رزرو اقامتگاه","ویلا","سوئیت","هتل","اقامتگاه"],aliases:["اقامتگاه","بلیط سفر"]},
flytoday:{name:'فلای‌تودی',homepage:'https://www.flytoday.ir/',domains:["travel_ticket"],products:["بلیط هواپیما","پرواز","هتل","رزرو سفر"],aliases:["بلیط سفر"]},
raja:{name:'رجا',homepage:'https://www.raja.ir/',domains:["travel_ticket"],products:["بلیط قطار","رزرو قطار","سفر"],aliases:["بلیط سفر"]},
ghasedak24:{name:'قاصدک ۲۴',homepage:'https://ghasedak24.com/',domains:["travel_ticket"],products:["بلیط هواپیما","بلیط قطار","بلیط اتوبوس","رزرو سفر"],aliases:["بلیط سفر"]},
siroom:{name:'سی‌روم',homepage:'https://siroom.ir/',domains:["education"],products:["کلاس آنلاین","آموزش آنلاین","جلسه آنلاین"],aliases:["آموزش آنلاین"]},
roomit:{name:'رومیت',homepage:'https://roomit.ir/',domains:["education"],products:["کلاس آنلاین","آموزش آنلاین","جلسه آنلاین"],aliases:["آموزش آنلاین"]},
classino:{name:'کلاسینو',homepage:'https://classino.com/',domains:["education"],products:["کلاس آنلاین","کنکور","آموزش","دوره آموزشی"],aliases:["آموزش آنلاین"]},
alocom:{name:'الوکام',homepage:'https://alocom.co/',domains:["education"],products:["کلاس آنلاین","جلسه آنلاین","آموزش آنلاین"],aliases:["آموزش آنلاین"]},
skyroom:{name:'اسکای‌روم',homepage:'https://www.skyroom.online/',domains:["education"],products:["کلاس آنلاین","وبینار","جلسه آنلاین","آموزش آنلاین"],aliases:["آموزش آنلاین"]},
faradars:{name:'فرادرس',homepage:'https://faradars.org/',domains:["education"],products:["دوره آموزشی","آموزش آنلاین","برنامه نویسی","آموزش مهارتی"],aliases:["آموزش آنلاین"]},
faranesh:{name:'فرانش',homepage:'https://faranesh.com/',domains:["education"],products:["دوره آموزشی","آموزش آنلاین","مهارت"],aliases:["آموزش آنلاین"]},
toplearn:{name:'تاپ‌لرن',homepage:'https://toplearn.com/',domains:["education"],products:["دوره آموزشی","برنامه نویسی","آموزش آنلاین"],aliases:["آموزش آنلاین"]},
daneshjooyar:{name:'دانشجویار',homepage:'https://daneshjooyar.com/',domains:["education"],products:["دوره آموزشی","برنامه نویسی","آموزش مهارتی"],aliases:["آموزش آنلاین"]},
divar:{name:'دیوار',homepage:'https://divar.ir/',domains:["auto","auto_service","home","digital","fashion"],products:["خرید و فروش","خودرو","قطعات خودرو","کالای دست دوم"],aliases:["خودرو","خدمات خودرو","خانه","کالای دیجیتال","پوشاک"]},
hamrahmechanic:{name:'همراه مکانیک',homepage:'https://www.hamrah-mechanic.com/',domains:["auto_service"],products:["کارشناسی خودرو","قیمت خودرو","خرید خودرو","فروش خودرو","خودرو کارکرده"],aliases:["خدمات خودرو"]},
khodro45:{name:'خودرو۴۵',homepage:'https://khodro45.com/',domains:["auto_service"],products:["فروش خودرو","خرید خودرو","کارشناسی خودرو"],aliases:["خدمات خودرو"]},
bama:{name:'باما',homepage:'https://bama.ir/',domains:["auto","auto_service"],products:["خرید خودرو","فروش خودرو","قیمت خودرو","خودرو کارکرده"],aliases:["خودرو","خدمات خودرو"]},
aytol:{name:'آیتول',homepage:'https://aytol.com/',domains:["auto_service"],products:["خدمات خودرو","بیمه خودرو","خلافی خودرو","عوارض خودرو"],aliases:["خدمات خودرو"]},
emalls:{name:'ایمالز',homepage:'https://emalls.ir/',domains:["digital"],products:["موبایل،لپ تاپ،لوازم خانگی،مقایسه قیمت"],aliases:["کالای دیجیتال"]},
kalatik:{name:'کالاتیک',homepage:'https://kalatik.com/',domains:["digital"],products:["موبایل،تبلت،لوازم جانبی موبایل"],aliases:["کالای دیجیتال"]},
mobile140:{name:'موبایل ۱۴۰',homepage:'https://mobile140.com/',domains:["digital"],products:["موبایل،تبلت،لوازم جانبی"],aliases:["کالای دیجیتال"]},
mobileir:{name:'موبایل‌آی‌آر',homepage:'https://mobile.ir/',domains:["digital"],products:["موبایل،قیمت موبایل،مشخصات گوشی"],aliases:["کالای دیجیتال"]},
kala360:{name:'کالا۳۶۰',homepage:'https://kala360.com/',domains:["digital","home"],products:["کالای دیجیتال،لوازم خانگی،موبایل"],aliases:["کالای دیجیتال","خانه و آشپزخانه"]},
mobliran:{name:'مبل ایران',homepage:'https://mobliran.com/',domains:["furniture","home"],products:["مبل،مبلمان،سرویس خواب،میز ناهارخوری"],aliases:["مبلمان و دکوراسیون","خانه و آشپزخانه"]},
choobineh:{name:'چوبینه',homepage:'https://choobineh.com/',domains:["furniture","home"],products:["مبلمان،محصولات چوبی،میز،صندلی"],aliases:["مبلمان و دکوراسیون","خانه و آشپزخانه"]},
moblmarket:{name:'مبل مارکت',homepage:'https://moblmarket.com/',domains:["furniture","home"],products:["مبل،مبلمان،میز،سرویس خواب"],aliases:["مبلمان و دکوراسیون","خانه و آشپزخانه"]},
digistyle:{name:'دیجی‌استایل',homepage:'https://www.digistyle.com/',domains:["fashion","beauty"],products:["پوشاک،کفش،کیف،اکسسوری"],aliases:["پوشاک و مد","آرایشی و بهداشتی"]},
shixon:{name:'شیکسون',homepage:'https://shixon.com/',domains:["fashion"],products:["پوشاک،لباس،کفش،کیف"],aliases:["پوشاک و مد"]},
limoo:{name:'لیمو',homepage:'https://limoo.com/',domains:["fashion"],products:["پوشاک،لباس،کیف،کفش"],aliases:["پوشاک و مد"]},
mootanroo:{name:'مو تن رو',homepage:'https://mootanroo.com/',domains:["beauty","health"],products:["لوازم آرایش،کرم،ضد آفتاب،مراقبت پوست"],aliases:["آرایشی و بهداشتی","سلامت"]},
zibamoon:{name:'زیبامون',homepage:'https://zibamoon.com/',domains:["beauty"],products:["زیبایی،آرایش،مراقبت پوست،عطر"],aliases:["آرایشی و بهداشتی"]},
rojashop:{name:'روژا شاپ',homepage:'https://rojashop.com/',domains:["beauty"],products:["عطر،ادکلن،لوازم آرایش،مراقبت پوست"],aliases:["آرایشی و بهداشتی"]},
safirstore:{name:'سفیر',homepage:'https://safirstore.com/',domains:["beauty"],products:["عطر،ادکلن،آرایشی،بهداشتی"],aliases:["آرایشی و بهداشتی"]},
okala:{name:'اکالا',homepage:'https://okala.com/',domains:["supermarket","home"],products:["مواد غذایی،لبنیات،نوشیدنی،شوینده"],aliases:["سوپرمارکت","خانه و آشپزخانه"]},
ofoghkoroosh:{name:'افق کوروش',homepage:'https://www.okcs.com/',domains:["supermarket"],products:["مواد غذایی،خرید روزانه،نوشیدنی"],aliases:["سوپرمارکت"]},
janbo:{name:'جانبو',homepage:'https://janbo.ir/',domains:["supermarket"],products:["مواد غذایی،تنقلات،نوشیدنی،کالاهای مصرفی"],aliases:["سوپرمارکت"]},
shahrvand:{name:'شهروند',homepage:'https://shahrvand.ir/',domains:["supermarket"],products:["مواد غذایی،لبنیات،نوشیدنی،شوینده"],aliases:["سوپرمارکت"]},
hyperme:{name:'هایپرمی',homepage:'https://hyperme.com/',domains:["supermarket"],products:["مواد غذایی،نوشیدنی،لبنیات،شوینده"],aliases:["سوپرمارکت"]},
ofood:{name:'اوفود',homepage:'https://ofood.ir/',domains:["supermarket"],products:["مواد غذایی،خرید روزانه،نوشیدنی"],aliases:["سوپرمارکت"]},
homeplus:{name:'هوم‌پلاس',homepage:'https://homeplus.ir/',domains:["home"],products:["لوازم خانه،آشپزخانه،نظافت"],aliases:["خانه و آشپزخانه"]},
sakhtemoononline:{name:'ساختمان آنلاین',homepage:'https://sakhtemoononline.com/',domains:["home"],products:["مصالح ساختمانی،شیرآلات،کاشی،ابزار خانه"],aliases:["خانه و آشپزخانه"]},
khaneyeiran:{name:'خانه ایرانی',homepage:'https://khaneyeiran.com/',domains:["home","furniture"],products:["لوازم خانه،دکوراسیون،مبلمان"],aliases:["خانه و آشپزخانه","مبلمان و دکوراسیون"]},
sportland:{name:'اسپرت‌لند',homepage:'https://sportland.ir/',domains:["sports","fashion"],products:["کفش ورزشی،لباس ورزشی،لوازم ورزشی"],aliases:["ورزش","پوشاک و مد"]},
iransport:{name:'ایران اسپرت',homepage:'https://iransport.com/',domains:["sports"],products:["لوازم ورزشی،پوشاک ورزشی،کفش ورزشی"],aliases:["ورزش"]},
sporttime:{name:'اسپرت تایم',homepage:'https://sporttime.ir/',domains:["sports"],products:["لباس ورزشی،کفش ورزشی،لوازم ورزشی"],aliases:["ورزش"]},
ninimarket:{name:'نی‌نی مارکت',homepage:'https://ninimarket.com/',domains:["kids","home"],products:["سیسمونی،کالسکه،لباس کودک،اسباب‌بازی"],aliases:["کودک و نوزاد","خانه و آشپزخانه"]},
ninisite:{name:'نی‌نی سایت',homepage:'https://www.ninisite.com/',domains:["kids","health"],products:["مادر و کودک،بارداری،نوزاد"],aliases:["کودک و نوزاد","سلامت"]},
babyland:{name:'بیبی‌لند',homepage:'https://babyland.ir/',domains:["kids"],products:["محصولات کودک،پوشک،غذای کودک"],aliases:["کودک و نوزاد"]},
fidibo:{name:'فیدیبو',homepage:'https://fidibo.com/',domains:["books"],products:["کتاب الکترونیکی،کتاب صوتی،رمان"],aliases:["کتاب"]},
taaghche:{name:'طاقچه',homepage:'https://taaghche.com/',domains:["books"],products:["کتاب الکترونیکی،کتاب صوتی،رمان"],aliases:["کتاب"]},
book30:{name:'۳۰بوک',homepage:'https://www.30book.com/',domains:["books"],products:["کتاب،رمان،کتاب کودک،کتاب آموزشی"],aliases:["کتاب"]},
yadakmarket:{name:'یدک مارکت',homepage:'https://yadakmarket.com/',domains:["auto","auto_service"],products:["لوازم یدکی،قطعات خودرو،فیلتر روغن"],aliases:["خودرو","خدمات خودرو"]},
yadakyar:{name:'یدک‌یار',homepage:'https://yadakyar.com/',domains:["auto","auto_service"],products:["قطعات خودرو،لوازم یدکی،قطعات پراید"],aliases:["خودرو","خدمات خودرو"]},
partsaz:{name:'پارت‌ساز',homepage:'https://partsaz.com/',domains:["auto","auto_service"],products:["قطعات خودرو،لوازم یدکی،قطعات بدنه"],aliases:["خودرو","خدمات خودرو"]},
sheypoor:{name:'شیپور',homepage:'https://www.sheypoor.com/',domains:["auto","home","digital","fashion"],products:["خودرو،ملک،موبایل،لوازم خانه،خرید و فروش"],aliases:["خودرو","خانه و آشپزخانه","کالای دیجیتال","پوشاک و مد"]},
mrbilit:{name:'مستر بلیط',homepage:'https://mrbilit.com/',domains:["travel_ticket"],products:["بلیط هواپیما،بلیط قطار،بلیط اتوبوس"],aliases:["بلیط سفر"]},
trip:{name:'تریپ',homepage:'https://www.trip.ir/',domains:["travel_ticket","lodging"],products:["بلیط هواپیما،هتل،رزرو سفر،تور"],aliases:["بلیط سفر","اقامتگاه"]},
flysepehran:{name:'فلای سپهران',homepage:'https://flysepehran.com/',domains:["travel_ticket"],products:["بلیط هواپیما،پرواز،رزرو بلیط"],aliases:["بلیط سفر"]},
eghamat24:{name:'اقامت ۲۴',homepage:'https://www.eghamat24.com/',domains:["lodging","travel_ticket"],products:["رزرو هتل،اقامتگاه،هتل داخلی"],aliases:["اقامتگاه","بلیط سفر"]},
hotelban:{name:'هتل‌بان',homepage:'https://hotelban.com/',domains:["lodging"],products:["رزرو هتل،اقامت،هتل"],aliases:["اقامتگاه"]},
safarmarket:{name:'سفرمارکت',homepage:'https://safarmarket.com/',domains:["travel_ticket"],products:["بلیط هواپیما،بلیط قطار،مقایسه قیمت بلیط"],aliases:["بلیط سفر"]},
quera:{name:'کوئرا',homepage:'https://quera.org/',domains:["education"],products:["آموزش برنامه‌نویسی،دوره آموزشی،مهارت فنی"],aliases:["آموزش آنلاین"]},
roocket:{name:'راکت',homepage:'https://roocket.ir/',domains:["education"],products:["آموزش برنامه‌نویسی،دوره آنلاین،طراحی وب"],aliases:["آموزش آنلاین"]},
sabzlearn:{name:'سبزلرن',homepage:'https://sabzlearn.ir/',domains:["education"],products:["آموزش برنامه‌نویسی،دوره آنلاین،طراحی سایت"],aliases:["آموزش آنلاین"]},
hamyarit:{name:'همیار آی‌تی',homepage:'https://hamyarit.com/',domains:["education"],products:["آموزش کامپیوتر،برنامه‌نویسی،مهارت دیجیتال"],aliases:["آموزش آنلاین"]},
learnfile:{name:'لرن‌فایل',homepage:'https://learnfile.ir/',domains:["education"],products:["دوره آموزشی،آموزش آنلاین،مهارت فنی"],aliases:["آموزش آنلاین"]},
azki:{name:'ازکی',homepage:'https://www.azki.com/',domains:["auto_service","health"],products:["بیمه خودرو،بیمه شخص ثالث،بیمه درمان"],aliases:["خدمات خودرو","سلامت"]},
bimebazar:{name:'بیمه‌بازار',homepage:'https://bimebazar.com/',domains:["auto_service","health"],products:["بیمه خودرو،بیمه شخص ثالث،بیمه درمان"],aliases:["خدمات خودرو","سلامت"]},
bimeh:{name:'بیمه',homepage:'https://bimeh.com/',domains:["auto_service","health"],products:["بیمه خودرو،بیمه شخص ثالث،بیمه بدنه"],aliases:["خدمات خودرو","سلامت"]},
kilid:{name:'کلید',homepage:'https://kilid.com/',domains:["home"],products:["خرید خانه،اجاره خانه،ملک،آپارتمان"],aliases:["خانه و آشپزخانه"]},
};

/*
 * Semantic enrichment layer.
 * The catalog above remains the merchant-specific source of truth.
 * These profiles only normalize vocabulary shared by merchants in the same
 * business domain; they are never used to declare that a merchant sells a
 * product it does not list in products.
 */
var DOMAIN_PROFILES={
 digital:{specialties:['کالای دیجیتال','فناوری','موبایل و تجهیزات دیجیتال'],signals:['موبایل','گوشی','آیفون','سامسونگ','شیائومی','تبلت','لپ تاپ','کامپیوتر','مانیتور','تلویزیون','هدفون','هندزفری','شارژر','کابل','پاوربانک','ساعت هوشمند','کنسول']},
 furniture:{specialties:['مبلمان و دکوراسیون','خانه و آشپزخانه'],signals:['مبل','مبلمان','صندلی','میز','تخت','کمد','دکوراسیون','آشپزخانه']},
 fashion:{specialties:['پوشاک و مد','استایل'],signals:['لباس','پوشاک','تیشرت','شلوار','پیراهن','مانتو','هودی','کاپشن','کفش','کتانی','کیف','جین','اکسسوری']},
 beauty:{specialties:['زیبایی و مراقبت شخصی','آرایشی و بهداشتی'],signals:['آرایش','کرم','ضد آفتاب','آبرسان','سرم','ضد جوش','شوینده صورت','شامپو','مراقبت پوست','مراقبت مو','عطر','ضد تعریق']},
 health:{specialties:['سلامت و مراقبت شخصی'],signals:['سلامت','بهداشتی','مراقبت','ویتامین','مکمل','فشارسنج','ارتوپدی','توانبخشی']},
 medicine:{specialties:['داروخانه و محصولات دارویی'],signals:['دارو','داروخانه','قرص','کپسول','شربت','نسخه','مکمل','ویتامین']},
 supermarket:{specialties:['سوپرمارکت و کالاهای مصرفی'],signals:['سوپرمارکت','مواد غذایی','نوشیدنی','تنقلات','شوینده','دستمال','مصرفی','خرید روزمره']},
 home:{specialties:['خانه و کالاهای مصرفی منزل'],signals:['خانه','آشپزخانه','ظرف','شوینده','لوازم خانه','دکوراسیون','خواب']},
 sports:{specialties:['ورزش و تجهیزات ورزشی'],signals:['ورزش','بدنسازی','توپ','دوچرخه','کفش ورزشی','تجهیزات ورزشی']},
 kids:{specialties:['کودک و مادر'],signals:['کودک','نوزاد','اسباب بازی','پوشک','مادر','سیسمونی']},
 books:{specialties:['کتاب و آموزش مکتوب'],signals:['کتاب','رمان','درسی','دانشگاهی','کمک آموزشی']},
 auto:{specialties:['خودرو و لوازم خودرو'],signals:['خودرو','ماشین','قطعات خودرو','لوازم خودرو','لاستیک','باتری']},
 auto_service:{specialties:['خدمات خودرو'],signals:['کارشناسی خودرو','قیمت خودرو','خرید خودرو','فروش خودرو','خودرو کارکرده','ماشین']},
 lodging:{specialties:['رزرو اقامتگاه'],signals:['ویلا','سوئیت','کلبه','اقامتگاه','بوم گردی','رزرو اقامت']},
 travel_ticket:{specialties:['سفر و بلیط'],signals:['بلیط','پرواز','هواپیما','قطار','اتوبوس','رزرو سفر']},
 education:{specialties:['آموزش آنلاین'],signals:['دوره','کلاس','آموزش','وبینار','سمینار','مهارت','برنامه نویسی']},
 accessories:{specialties:['اکسسوری و لوازم جانبی'],signals:['اکسسوری','لوازم جانبی','قاب','گلس','کیف','ساعت','عینک']}
};
if(C['digikala'])C['digikala'].homepage=C['digikala'].homepage||'https://www.digikala.com/';
if(C['snappshop'])C['snappshop'].homepage=C['snappshop'].homepage||'https://snapp.shop/';
if(C['torob'])C['torob'].homepage=C['torob'].homepage||'https://torob.com/';
if(C['basalam'])C['basalam'].homepage=C['basalam'].homepage||'https://basalam.com/';
if(C['esam'])C['esam'].homepage=C['esam'].homepage||'https://esam.ir/';
if(C['iranmiz'])C['iranmiz'].homepage=C['iranmiz'].homepage||'https://www.iranmiz.com/';
if(C['partochoob'])C['partochoob'].homepage=C['partochoob'].homepage||'https://partochoob.com/';
if(C['chidahome'])C['chidahome'].homepage=C['chidahome'].homepage||'https://chidahomestudio.com/';
if(C['tidawood'])C['tidawood'].homepage=C['tidawood'].homepage||'https://tidawood.com/';
if(C['khanoumi'])C['khanoumi'].homepage=C['khanoumi'].homepage||'https://www.khanoumi.com/';
if(C['banimode'])C['banimode'].homepage=C['banimode'].homepage||'https://www.banimode.com/';
if(C['modiseh'])C['modiseh'].homepage=C['modiseh'].homepage||'https://www.modiseh.com/';
if(C['pinket'])C['pinket'].homepage=C['pinket'].homepage||'https://pinket.com/';
if(C['darukade'])C['darukade'].homepage=C['darukade'].homepage||'https://www.darukade.com/';
if(C['darmankala'])C['darmankala'].homepage=C['darmankala'].homepage||'https://darmankala.com/';
if(C['digido'])C['digido'].homepage=C['digido'].homepage||'https://www.digido.ir/';
if(C['janebi'])C['janebi'].homepage=C['janebi'].homepage||'https://janebi.com/';
if(C['digiland'])C['digiland'].homepage=C['digiland'].homepage||'https://dgland.com/';
if(C['takhfifan'])C['takhfifan'].homepage=C['takhfifan'].homepage||'https://takhfifan.com/';
if(C['berozkala'])C['berozkala'].homepage=C['berozkala'].homepage||'https://berozkala.com/';
if(C['gooshishop'])C['gooshishop'].homepage=C['gooshishop'].homepage||'https://gooshishop.com/';
if(C['technolife'])C['technolife'].homepage=C['technolife'].homepage||'https://www.technolife.com/';
if(C['meghdadit'])C['meghdadit'].homepage=C['meghdadit'].homepage||'https://meghdadit.com/';
if(C['neshatrokh'])C['neshatrokh'].homepage=C['neshatrokh'].homepage||'https://www.neshatrokh.com/';
if(C['mosbatesabz'])C['mosbatesabz'].homepage=C['mosbatesabz'].homepage||'https://mosbatesabz.com/';
if(C['shavaz'])C['shavaz'].homepage=C['shavaz'].homepage||'https://shavaz.ir/';
if(C['solokala'])C['solokala'].homepage=C['solokala'].homepage||'https://solokala.com/';
if(C['daroo-online'])C['daroo-online'].homepage=C['daroo-online'].homepage||'https://darookhaneonline.com/';
if(C['dayan'])C['dayan'].homepage=C['dayan'].homepage||'https://dayanshop.com/';
if(C['memarket'])C['memarket'].homepage=C['memarket'].homepage||'https://memarket24.ir/';
if(C['jeanswest'])C['jeanswest'].homepage=C['jeanswest'].homepage||'https://jeanswest.ir/';
if(C['sabzgostar'])C['sabzgostar'].homepage=C['sabzgostar'].homepage||'https://sabzgostar.info/';
if(C['shab'])C['shab'].homepage=C['shab'].homepage||'https://www.shab.ir/';
if(C['safarme'])C['safarme'].homepage=C['safarme'].homepage||'https://www.safarme.ir/';
if(C['eseminar'])C['eseminar'].homepage=C['eseminar'].homepage||'https://eseminar.tv/';
if(C['maktabkhooneh'])C['maktabkhooneh'].homepage=C['maktabkhooneh'].homepage||'https://maktabkhooneh.org/';
if(C['karnameh'])C['karnameh'].homepage=C['karnameh'].homepage||'https://karnameh.com/';
if(C['iransetkor'])C['iransetkor'].homepage=C['iransetkor'].homepage||'https://iransetkor.com/';
if(C['19kala'])C['19kala'].homepage=C['19kala'].homepage||'https://www.19kala.com/';
if(C['banistyle'])C['banistyle'].homepage=C['banistyle'].homepage||'https://banistyle.com/';
if(C['aysoocollection'])C['aysoocollection'].homepage=C['aysoocollection'].homepage||'https://aysoocollection.com/';
if(C['daru24'])C['daru24'].homepage=C['daru24'].homepage||'https://daru24.com/';
if(C['betadent'])C['betadent'].homepage=C['betadent'].homepage||'https://betadent.com/';
if(C['darupedia'])C['darupedia'].homepage=C['darupedia'].homepage||'https://darupedia.com/';
if(C['darucenter'])C['darucenter'].homepage=C['darucenter'].homepage||'https://darucenter.com/';
if(C['webdaru'])C['webdaru'].homepage=C['webdaru'].homepage||'https://webdaru.com/';
if(C['saba'])C['saba'].homepage=C['saba'].homepage||'https://sabadaru.com/';
if(C['darupost'])C['darupost'].homepage=C['darupost'].homepage||'https://darupost.com/';
if(C['shider'])C['shider'].homepage=C['shider'].homepage||'https://shider.com/';
if(C['alibaba'])C['alibaba'].homepage=C['alibaba'].homepage||'https://www.alibaba.ir/';
if(C['jobama'])C['jobama'].homepage=C['jobama'].homepage||'https://www.jabama.com/';
if(C['flytoday'])C['flytoday'].homepage=C['flytoday'].homepage||'https://www.flytoday.ir/';
if(C['raja'])C['raja'].homepage=C['raja'].homepage||'https://www.raja.ir/';
if(C['ghasedak24'])C['ghasedak24'].homepage=C['ghasedak24'].homepage||'https://ghasedak24.com/';
if(C['siroom'])C['siroom'].homepage=C['siroom'].homepage||'https://siroom.ir/';
if(C['roomit'])C['roomit'].homepage=C['roomit'].homepage||'https://roomit.ir/';
if(C['classino'])C['classino'].homepage=C['classino'].homepage||'https://classino.com/';
if(C['alocom'])C['alocom'].homepage=C['alocom'].homepage||'https://alocom.co/';
if(C['skyroom'])C['skyroom'].homepage=C['skyroom'].homepage||'https://www.skyroom.online/';
if(C['faradars'])C['faradars'].homepage=C['faradars'].homepage||'https://faradars.org/';
if(C['faranesh'])C['faranesh'].homepage=C['faranesh'].homepage||'https://faranesh.com/';
if(C['toplearn'])C['toplearn'].homepage=C['toplearn'].homepage||'https://toplearn.com/';
if(C['daneshjooyar'])C['daneshjooyar'].homepage=C['daneshjooyar'].homepage||'https://daneshjooyar.com/';
if(C['divar'])C['divar'].homepage=C['divar'].homepage||'https://divar.ir/';
if(C['hamrahmechanic'])C['hamrahmechanic'].homepage=C['hamrahmechanic'].homepage||'https://www.hamrah-mechanic.com/';
if(C['khodro45'])C['khodro45'].homepage=C['khodro45'].homepage||'https://khodro45.com/';
if(C['bama'])C['bama'].homepage=C['bama'].homepage||'https://bama.ir/';
if(C['aytol'])C['aytol'].homepage=C['aytol'].homepage||'https://aytol.com/';
Object.keys(C).forEach(function(id){
 var s=C[id], profiles=(s.domains||[]).map(function(d){return DOMAIN_PROFILES[d]||null;}).filter(Boolean);
 var specialties=[].concat.apply([],profiles.map(function(p){return p.specialties||[];}));
 var signals=[].concat.apply([],profiles.map(function(p){return p.signals||[];}));
 s.specialties=Array.from(new Set(specialties));
 s.productFamilies=Array.from(new Set((s.products||[]).concat(s.specialties||[])));
 s.querySignals=Array.from(new Set((s.aliases||[]).concat(s.products||[]).concat(signals)));
 s.semanticText=[
   'merchant: '+s.name,
   'business domains: '+(s.domains||[]).join(', '),
   'specialties: '+s.specialties.join(', '),
   'products: '+(s.products||[]).join(', '),
   'aliases: '+(s.aliases||[]).join(', '),
   'query signals: '+s.querySignals.join(', '),
   'exclude: '+(s.exclude||[]).join(', ')
 ].join(' | ');
 s.matchPolicy={
   specialistFirst: Boolean(s.intents&&s.intents.length)||s.domains.length<=2||s.domains.indexOf('medicine')!==-1,
   allowGenericWhenDirectMatch: s.domains.some(function(d){return ['digital','furniture','fashion','beauty','health','home','supermarket'].indexOf(d)>=0;}),
   hardExclude:s.exclude||[]
 };
});

root.DigiYarStoreBusinessDomains={version:VERSION,catalog:C,get:function(id){return C[String(id||'').toLowerCase()]||null;},ids:function(){return Object.keys(C);},forAI:function(){return C;}};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DigiYarStoreBusinessDomains;
})(typeof window!=='undefined'?window:globalThis);
