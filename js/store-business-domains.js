/* DigiYar V7 — unified merchant business-domain knowledge base */
(function(root){
'use strict';
var VERSION='7.0.0-store-business-domains.2';
var C={
digikala:{name:'دیجی‌کالا',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books','auto'],products:['موبایل','تبلت','لپ تاپ','کامپیوتر','لوازم جانبی','لوازم خانگی','پوشاک','کفش','آرایشی','بهداشتی','خانه','ورزش','کودک','کتاب','خودرو'],aliases:['فروشگاه عمومی','مارکت پلیس']},
snappshop:{name:'اسنپ‌شاپ',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','auto'],products:['موبایل','تبلت','لپ تاپ','دیجیتال','لوازم خانگی','پوشاک','کفش','آرایشی','بهداشتی','روزمره'],aliases:['خرید آنلاین عمومی']},
torob:{name:'ترب',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books','auto'],products:['موبایل','لپ تاپ','تبلت','دیجیتال','لوازم خانگی','پوشاک','آرایشی','بهداشتی','خودرو','کتاب'],aliases:['مقایسه قیمت','جستجوی کالا']},
basalam:{name:'باسلام',domains:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books'],products:['پوشاک','کفش','کیف','خانه','خوراکی','آرایشی','سلامت','دیجیتال','صنایع دستی','کتاب'],aliases:['بازارگاه','محصولات محلی']},
esam:{name:'ایسام',domains:['digital','furniture','fashion','home','auto','books'],products:['دیجیتال','موبایل','لپ تاپ','خانه','پوشاک','خودرو','کتاب','کلکسیونی'],aliases:['مزایده','خرید و فروش']},
khanoumi:{name:'خانومی',domains:['beauty','health'],products:['ضد آفتاب','کرم','آبرسان','ضد جوش','شوینده صورت','سرم پوست','لوازم آرایش','عطر','شامپو','ضد تعریق'],aliases:['زیبایی','مراقبت پوست','مراقبت مو'],exclude:['موبایل','لپ تاپ']},
banimode:{name:'بانی‌مد',domains:['fashion','beauty'],products:['تیشرت','پیراهن','شلوار','هودی','کاپشن','مانتو','کفش','کیف','اکسسوری','عطر'],aliases:['مد','فشن','پوشاک'],exclude:['موبایل']},
modiseh:{name:'مدیسه',domains:['fashion','beauty'],products:['لباس','کفش','کیف','اکسسوری','عطر','لوازم آرایش','مراقبت پوست'],aliases:['مد و زیبایی'],exclude:['موبایل']},
pinket:{name:'پینکت',domains:['supermarket','home','beauty'],products:['مواد غذایی','نوشیدنی','شوینده','کالاهای مصرفی','بهداشتی','لوازم خانه'],aliases:['سوپرمارکت','خرید روزمره'],exclude:['موبایل','لپ تاپ']},
darukade:{name:'داروکده',domains:['health','beauty','medicine'],products:['دارو','قرص','کپسول','شربت','مکمل','ویتامین','ضد آفتاب','کرم پوست','آبرسان','مراقبت پوست','شامپو'],aliases:['داروخانه','مکمل','سلامت'],exclude:['موبایل']},
darmankala:{name:'درمان‌کالا',domains:['health','medicine'],products:['فشارسنج','تجهیزات پزشکی','ارتوپدی','توانبخشی','ویلچر','نبولایزر','تجهیزات بیمارستانی','سلامت'],aliases:['کالای پزشکی','تجهیزات پزشکی'],exclude:['موبایل','پوشاک']},
digido:{name:'دیجی‌دو',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','آیفون','سامسونگ','شیائومی','قاب گوشی','گلس','شارژر','کابل','پاوربانک','هندزفری'],aliases:['موبایل','گوشی','لوازم جانبی موبایل'],exclude:['پوشاک','مواد غذایی']},
janebi:{name:'جانبی',intents:['mobile','mobile_accessories'],domains:['digital'],products:['قاب گوشی','گلس','محافظ صفحه','شارژر','کابل','هندزفری','پاوربانک','هولدر','تبدیل','لوازم جانبی لپ تاپ'],aliases:['اکسسوری موبایل','لوازم جانبی'],exclude:['پوشاک']},
digiland:{name:'دیجی‌لند',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','لپ تاپ','مانیتور','کامپیوتر','کنسول','گیمینگ','شبکه','لوازم جانبی دیجیتال'],aliases:['کالای دیجیتال','گیمینگ'],exclude:['پوشاک','مواد غذایی']},
takhfifan:{name:'تخفیفان',intents:['mobile'],domains:['digital','furniture','beauty','fashion','home','sports'],products:['موبایل','کالای دیجیتال','لوازم جانبی','پوشاک','زیبایی','خانه','ورزش','خدمات تخفیفی'],aliases:['تخفیف','کد تخفیف','پیشنهاد ویژه']},
berozkala:{name:'بروز کالا',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','تبلت','لپ تاپ','مانیتور','پرینتر','ماشین اداری','تجهیزات دیجیتال'],aliases:['کالای دیجیتال','ماشین اداری'],exclude:['پوشاک','مواد غذایی']},
gooshishop:{name:'گوشی شاپ',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','آیفون','سامسونگ','شیائومی','لوازم جانبی موبایل','گجت'],aliases:['فروشگاه موبایل','گوشی'],exclude:['پوشاک','مواد غذایی']},
technolife:{name:'تکنولایف',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','آیفون','سامسونگ','شیائومی','لپ تاپ','تبلت','هدفون','هندزفری','ساعت هوشمند','لوازم جانبی'],aliases:['کالای دیجیتال','فناوری'],exclude:['پوشاک','مواد غذایی']},
meghdadit:{name:'مقداد آی‌تی',intents:['mobile'],domains:['digital'],products:['گوشی موبایل','لپ تاپ','کامپیوتر','قطعات کامپیوتر','مانیتور','پرینتر','شبکه','لوازم جانبی','تبلت'],aliases:['آی تی','فروشگاه کامپیوتر','کالای دیجیتال'],exclude:['پوشاک','مواد غذایی']},
neshatrokh:{name:'نشاط رخ',domains:['beauty','health'],products:['لوازم آرایشی','ضد آفتاب','کرم پوست','آبرسان','مراقبت پوست','مراقبت مو','بهداشتی'],aliases:['زیبایی','سلامت'],exclude:['موبایل','لپ تاپ']},
mosbatesabz:{name:'مثبت سبز',domains:['health','beauty','medicine'],products:['مکمل','ویتامین','ضد آفتاب','کرم پوست','بهداشتی','داروخانه‌ای','مراقبت پوست'],aliases:['داروخانه','سلامت','مکمل'],exclude:['موبایل','لپ تاپ']},
shavaz:{name:'شاواز',domains:['beauty','health'],products:['لوازم آرایش','ضد آفتاب','کرم پوست','شامپو','مراقبت مو','بهداشتی','عطر'],aliases:['زیبایی','آرایشی بهداشتی'],exclude:['موبایل','لپ تاپ']},
solokala:{name:'سولوکالا',domains:['beauty','health','accessories'],products:['لوازم آرایش','ضد آفتاب','کرم پوست','عطر','بهداشتی','اکسسوری'],aliases:['آرایشی بهداشتی','اکسسوری'],exclude:['موبایل','لپ تاپ']},
'daroo-online':{name:'داروخانه آنلاین',domains:['medicine','health','beauty'],products:['دارو','قرص','کپسول','شربت','مکمل','ویتامین','ضد آفتاب','بهداشتی','مراقبت پوست'],aliases:['داروخانه آنلاین','دارو'],exclude:['موبایل','لپ تاپ']},
dayan:{name:'دایان شاپ',domains:['fashion','accessories'],products:['لباس مردانه','لباس زنانه','کفش','کتانی','هودی','سوییشرت','کاپشن','شلوار','تیشرت','پیراهن','ساعت','عینک','کیف','زیورآلات'],aliases:['پوشاک','استایل','اکسسوری'],exclude:['موبایل']},
memarket:{name:'می‌مارکت',domains:['digital','home','fashion','accessories','beauty'],products:['موبایل','لپ تاپ','لوازم دیجیتال','لوازم خانه','پوشاک','کفش','کیف','آرایشی','ساعت','اکسسوری'],aliases:['خرید آنلاین متنوع']},
jeanswest:{name:'جین وست',domains:['fashion'],products:['پوشاک زنانه','پوشاک مردانه','پوشاک کودک','تیشرت','شلوار','کاپشن','کفش','اکسسوری'],aliases:['پوشاک','استایل'],exclude:['موبایل','لپ تاپ']},
shab:{name:'شب',domains:['lodging'],products:['ویلا','سوئیت','کلبه','اقامتگاه','بوم گردی'],aliases:['رزرو ویلا','اقامت'],exclude:['کالای فیزیکی']},
safarme:{name:'سفرمی',domains:['travel_ticket'],products:['بلیط هواپیما','پرواز','سفر'],aliases:['پرواز','بلیط هواپیما'],exclude:['کالای فیزیکی']},
eseminar:{name:'ایسمینار',domains:['education'],products:['وبینار','رویداد آنلاین','سمینار'],aliases:['وبینار','آموزش آنلاین'],exclude:['کالای فیزیکی']},
maktabkhooneh:{name:'مکتب‌خونه',domains:['education'],products:['دوره آموزشی','دوره برنامه نویسی','آموزش مهارتی','کلاس آنلاین'],aliases:['دوره آنلاین','آموزش'],exclude:['کالای فیزیکی']},
karnameh:{name:'کارنامه',domains:['auto_service'],products:['کارشناسی خودرو','قیمت خودرو','فروش خودرو','خرید خودرو','خودرو کارکرده'],aliases:['کارشناسی ماشین','قیمت ماشین','خدمات خودرو'],exclude:['موبایل','لپ تاپ']}
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
   specialistFirst: Boolean(s.intents&&s.intents.length)||s.domains.length<=2,
   allowGenericWhenDirectMatch: s.domains.some(function(d){return ['digital','furniture','fashion','beauty','health','home','supermarket'].indexOf(d)>=0;}),
   hardExclude:s.exclude||[]
 };
});

};
root.DigiYarStoreBusinessDomains={version:VERSION,catalog:C,get:function(id){return C[String(id||'').toLowerCase()]||null;},ids:function(){return Object.keys(C);},forAI:function(){return C;}};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DigiYarStoreBusinessDomains;
})(typeof window!=='undefined'?window:globalThis);
