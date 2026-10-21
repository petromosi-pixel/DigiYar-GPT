/* DigiYar V7 — three-stage deterministic Hooshyar engine.
 * 1) Parse the need; 2) retrieve merchant evidence from the canonical KB;
 * 3) rank candidates and generate a query for each merchant.
 * No network, model, key, or paid service is required.
 */
(function(root){
'use strict';
var VERSION='7.0.0-hooshyar-three-engine.36';
function clean(v){return String(v==null?'':v).replace(/[\u200c]/g,' ').replace(/\s+/g,' ').trim();}
function norm(v){
 return clean(v).toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک')
  .replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);})
  .replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);})
  .replace(/می\s*خوام|می\s*خواهم|دنبال\s*یه|دنبال\s*یک|یه\s*چیزی|یک\s*چیزی/g,' ')
  .replace(/ضد\s*آفتاب|ضدآفتاب/g,'ضد آفتاب')
  .replace(/\s+/g,' ').trim();
}
function tokenStem(value){
 var w=norm(value).replace(/[^\u0600-\u06FFa-z0-9]+/gi,'').trim();
 if(w.length>5&&/(?:های|هایی)$/.test(w))w=w.replace(/(?:های|هایی)$/,'');
 else if(w.length>4&&/ها$/.test(w))w=w.slice(0,-2);
 if(w.length>4&&/ی$/.test(w))w=w.slice(0,-1);
 return w;
}
function meaningfulTokens(value){
 return norm(value).split(/[^\u0600-\u06FFa-z0-9]+/i).filter(Boolean)
  .filter(function(w){return !['برای','از','به','با','در','و','یا','یه','یک','میخوام','میخواهم','دنبال','مناسب','هستم','است','رو','را','تا','حدود','لطفا','لطفاً'].includes(w);})
  .map(tokenStem).filter(Boolean);
}
function termMatchesQuery(rawTerm,query){
 var term=norm(rawTerm),q=norm(query);
 if(!term||!q)return false;
 if(q.indexOf(term)>=0)return true;
 var termTokens=meaningfulTokens(term),queryTokens=meaningfulTokens(q);
 if(!termTokens.length)return false;
 return termTokens.every(function(t){return queryTokens.indexOf(t)>=0;});
}
var CONCEPTS=[
 {key:'laptop',label:'لپ تاپ',domain:'digital',terms:['لپ تاپ','لپتاپ','نوت بوک','کامپیوتر همراه'],patterns:/(?:لپ\s*تاپ|لپتاپ|نوت\s*بوک|کامپیوتر\s*همراه)/i},
 {key:'tablet',label:'تبلت',domain:'digital',terms:['تبلت','tablet'],patterns:/(?:تبلت|tablet)/i},
 {key:'headphone',label:'هدفون و هندزفری',domain:'digital',terms:['هدفون','هندزفری','هدست','ایرباد'],patterns:/(?:هدفون|هندزفری|هدست|ایرباد|ایرپاد)/i},
 {key:'television',label:'تلویزیون',domain:'digital',terms:['تلویزیون','تلويزيون'],patterns:/(?:تلویزیون|تلويزيون|تلویزیون هوشمند)/i},
 {key:'monitor',label:'مانیتور',domain:'digital',terms:['مانیتور','مانيتور','نمایشگر'],patterns:/(?:مانیتور|مانيتور|نمایشگر)/i},
 {key:'camera',label:'دوربین',domain:'digital',terms:['دوربین','دوربین عکاسی','دوربین فیلمبرداری'],patterns:/(?:دوربین|camera)/i},
 {key:'smartwatch',label:'ساعت هوشمند',domain:'digital',terms:['ساعت هوشمند','اسمارت واچ','smartwatch'],patterns:/(?:ساعت\s*هوشمند|اسمارت\s*واچ|smartwatch)/i},
 {key:'printer',label:'پرینتر',domain:'digital',terms:['پرینتر','چاپگر'],patterns:/(?:پرینتر|چاپگر)/i},
 {key:'refrigerator',label:'یخچال و فریزر',domain:'home',terms:['یخچال','فریزر','یخچال فریزر'],patterns:/(?:یخچال|فریزر)/i},
 {key:'washing_machine',label:'ماشین لباسشویی',domain:'home',terms:['ماشین لباسشویی','لباسشویی'],patterns:/(?:ماشین\s*لباسشویی|لباسشویی)/i},
 {key:'air_conditioner',label:'کولر گازی',domain:'home',terms:['کولر گازی','اسپلیت','تهویه مطبوع'],patterns:/(?:کولر\s*گازی|اسپلیت|تهویه\s*مطبوع)/i},
 {key:'vacuum',label:'جاروبرقی',domain:'home',terms:['جاروبرقی','جارو برقی','جارو شارژی'],patterns:/(?:جارو\s*برقی|جاروبرقی|جارو\s*شارژی)/i},
 {key:'kitchen_appliance',label:'لوازم آشپزخانه',domain:'home',terms:['مایکروویو','مایکروفر','اسپرسوساز','قهوه ساز','چای ساز','مخلوط کن','آبمیوه گیری','سرخ کن','پلوپز','توستر','ساندویچ ساز'],patterns:/(?:مایکروویو|مایکروفر|اسپرسوساز|قهوه\s*ساز|چای\s*ساز|مخلوط\s*کن|آبمیوه\s*گیری|سرخ\s*کن|پلوپز|توستر|ساندویچ\s*ساز)/i},
 {key:'kitchen_scale',label:'ترازوی آشپزخانه',domain:'home',terms:['ترازو آشپزخانه','ترازوی آشپزخانه','ترازو دیجیتال آشپزخانه','ترازوی هوشمند آشپزخانه'],patterns:/(?:ترازوی?|ترازوهای?).{0,24}(?:آشپزخانه|هوشمند.{0,8}آشپزخانه|دیجیتال.{0,8}آشپزخانه)|آشپزخانه.{0,18}ترازو/i},
 {key:'train_ticket',label:'بلیط قطار',domain:'travel_ticket',terms:['بلیط قطار','بلیت قطار','قطار','سفر ریلی','رزرو قطار'],patterns:/(?:بلیط|بلیت|رزرو|سفر|برم|بروم).{0,30}(?:قطار|ریل)|(?:قطار|ریل).{0,30}(?:بلیط|بلیت|تهران|مشهد)|قطار/i},
 {key:'air_purifier',label:'دستگاه تصفیه هوا',domain:'home',terms:['تصفیه هوا','دستگاه تصفیه','پاکسازی هوا','هوای پاک','تصفیه کننده هوا'],patterns:/(?:تصفیه\s*هوا|دستگاه\s*تصفیه|پاکسازی\s*هوا|هوای\s*(?:اتاق|خانه).{0,20}(?:تمیز|پاک|آلوده))/i},
 {key:'sofa_cleaning',label:'محصول نظافت مبل پارچه‌ای',domain:'home',terms:['تمیزکننده مبل پارچه‌ای','شوینده مبل','بخارشوی مبل','نظافت مبل'],patterns:/(?:تمیز\s*کردن|تمیزکاری|شستشو|شستن|نظافت|شوینده|پاک\s*کردن|پاکسازی|مبل\s*شویی).{0,35}(?:مبل|مبلمان|پارچه)|(?:مبل|مبلمان).{0,35}(?:تمیز|شستن|شستشو|نظافت|پارچه)/i},
 {key:'sofa',label:'مبل و مبلمان',domain:'furniture',terms:['مبل راحتی','مبل','مبلمان','مبل تخت خواب شو'],patterns:/(?:مبل|مبلمان|مبل\s*راحتی|مبل\s*تخت\s*خواب\s*شو)/i},
 {key:'furniture',label:'مبلمان و دکوراسیون',domain:'furniture',terms:['میز ناهارخوری','میز و صندلی','میز تحریر','سرویس خواب','کمد','دکوراسیون','صندلی اداری'],patterns:/(?:میز\s*(?:ناهارخوری|غذاخوری|تحریر|اداری|تلویزیون)|صندلی|سرویس\s*خواب|کمد|دکوراسیون|مبلمان\s*اداری)/i},
 {key:'office_bag',label:'کیف اداری',domain:'fashion',terms:['کیف اداری','کیف کاری','کیف رسمی','کیف محل کار'],patterns:/(?:کیف\s*(?:اداری|کاری|رسمی)|کیف.{0,15}(?:محل\s*کار|محل\s*کارم))/i},
 {key:'mobile_accessory',label:'لوازم جانبی موبایل',domain:'digital',terms:['لوازم جانبی موبایل','لوازم جانبی','اکسسوری','قاب گوشی','کاور گوشی','گلس گوشی','شارژر موبایل','پاوربانک','هندزفری'],patterns:/(?:قاب|کاور|گلس|محافظ\s*صفحه|محافظ\s*لنز|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری).{0,25}(?:موبایل|گوشی|سامسونگ|آیفون)?/i},
 {key:'mobile_phone',label:'گوشی موبایل',domain:'digital',terms:['موبایل','گوشی هوشمند','تلفن همراه'],patterns:/(?:موبایل|گوشی|تلفن\s*همراه|سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi)/i},
 {key:'skincare',label:'محصول مراقبت پوست',domain:'beauty',terms:['مرطوب کننده','آبرسان','ضد آفتاب','کرم پوست','مراقبت پوست'],patterns:/(?:مرطوب\s*کننده|آبرسان|ضد\s*آفتاب|ضدآفتاب|مراقبت\s*پوست|کرم\s*پوست)/i},
 {key:'shoe',label:'کفش',domain:'fashion',terms:['کفش','کتانی','اسنیکر','کفش ورزشی'],patterns:/(?:کفش|کتانی|اسنیکر)/i},
 {key:'clothing',label:'پوشاک',domain:'fashion',terms:['لباس','پوشاک','شلوار','مانتو','پیراهن'],patterns:/(?:لباس|پوشاک|شلوار|مانتو|پیراهن|کاپشن)/i}
];
var GENERAL=new Set(['digikala','snappshop','torob','basalam','memarket','takhfifan','esam']);
var CONCEPT_STORES={
 laptop:['digikala','snappshop','torob','basalam','digiland','technolife','takhfifan','esam'],
 tablet:['digikala','snappshop','torob','basalam','digiland','technolife','takhfifan','esam'],
 headphone:['digikala','snappshop','torob','basalam','digido','janebi','gooshishop','technolife'],
 television:['digikala','snappshop','torob','basalam','technolife'],
 monitor:['digikala','snappshop','torob','basalam','technolife','meghdadit'],
 camera:['digikala','snappshop','torob','basalam','technolife'],
 smartwatch:['digikala','snappshop','torob','basalam','digido','gooshishop','technolife'],
 printer:['digikala','snappshop','torob','basalam','technolife','meghdadit'],
 refrigerator:['digikala','snappshop','torob','basalam'],
 washing_machine:['digikala','snappshop','torob','basalam'],
 air_conditioner:['digikala','snappshop','torob','basalam'],
 vacuum:['digikala','snappshop','torob','basalam'],
 kitchen_appliance:['digikala','snappshop','torob','basalam'],
 train_ticket:['shab','safarme','raja','ghasedak24','mrbilit','trip','safarmarket','alibaba'],
 air_purifier:['digikala','snappshop','torob','basalam','memarket'],
 sofa_cleaning:['digikala','snappshop','torob','basalam','memarket'],
 office_bag:['modiseh','janebi','dayan','digikala','snappshop','torob','basalam'],
 mobile_accessory:['janebi','digido','gooshishop','technolife','digikala','snappshop','torob','basalam'],
 mobile_phone:['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam']
};
var DOMAIN_SYNONYMS={
 fashion:['مد','پوشاک','کیف','کفش','لباس','اکسسوری'],digital:['دیجیتال','موبایل','گوشی','تلفن همراه','لوازم جانبی'],
 home:['خانه','منزل','لوازم خانگی','نظافت'],beauty:['زیبایی','آرایشی','مراقبت پوست'],health:['سلامت','بهداشتی','دارو'],
 travel_ticket:['سفر','بلیط','رزرو','قطار','هواپیما','اتوبوس'],auto_service:['خودرو','ماشین','خدمات خودرو']
};
function parseNeed(query){
 var q=norm(query),concept=null;
 for(var i=0;i<CONCEPTS.length;i++){if(CONCEPTS[i].patterns.test(q)){concept=CONCEPTS[i];break;}}
 var brand=null;
 if(/سامسونگ|samsung/i.test(q))brand='سامسونگ';
 else if(/آیفون|iphone/i.test(q))brand='آیفون';
 else if(/شیائومی|xiaomi/i.test(q))brand='شیائومی';
 var budget=null;
 var bm=q.match(/(?:تا|حداکثر|زیر|بودجه\s*(?:ام|من)?\s*(?:حدود)?|حدود)\s*(\d[\d,]*)\s*(میلیون|م|هزار|تومان)?/);
 if(bm){var amount=Number(bm[1].replace(/,/g,''));if(Number.isFinite(amount)){if(bm[2]==='میلیون'||bm[2]==='م')amount*=1000000;else if(bm[2]==='هزار')amount*=1000;else if(amount<10000&&/تومان/.test(q))amount*=1000000;budget=amount;}}
 var attrs=[];
 ['جادار','سبک','ضد آب','ارزان','اقتصادی','اصل','رسمی','برای محل کار','اتاق خواب','پارچه‌ای','بی‌سیم'].forEach(function(a){if(q.indexOf(norm(a))>=0)attrs.push(a);});
 var targetObject=concept&&concept.key==='sofa_cleaning'?'مبل پارچه‌ای':concept&&concept.key==='air_purifier'&&/اتاق\s*خواب/.test(q)?'اتاق خواب':null;
 var product=concept?concept.label:q;
 if(concept&&concept.key==='skincare'){
  var skinProduct=q.match(/ضد\s*آفتاب|مرطوب\s*کننده|آبرسان|شوینده\s*صورت|سرم\s*پوست|کرم\s*پوست/i);
  product=skinProduct?skinProduct[0].replace(/\s+/g,' '):'محصول مراقبت پوست';
  var skinType=q.match(/پوست\s*(?:خشک|چرب|مختلط|حساس)/i);
  if(skinType)product+=' '+skinType[0];
 }
 if(concept&&concept.key==='mobile_phone'&&brand)product='گوشی '+brand;
 if(concept&&concept.key==='mobile_accessory'&&brand)product='لوازم جانبی '+brand;
 return {query:clean(query),normalized:q,concept:concept?concept.key:null,requestedProduct:product,domain:concept?concept.domain:null,domains:concept?[concept.domain]:[],brand:brand,maxBudgetToman:budget,attributes:attrs,targetObject:targetObject,taskType:concept&&concept.key==='train_ticket'?'ticket_search':concept&&concept.key==='sofa_cleaning'?'cleaning_task':'shopping_search'};
}
function categoryEvidence(need,item){
 var cats=Array.isArray(item.categories)?item.categories:[];
 if(!cats.length||!need.concept)return [];
 var rules={
  laptop:[/لپ.?تاپ/i,/کامپیوتر(?: و قطعات| و اداری)?/i],
  tablet:[/تبلت/i],
  headphone:[/هدفون/i,/هندزفری/i,/صوتی و تصویری/i,/لوازم جانبی موبایل/i,/لوازم جانبی دیجیتال/i],
  television:[/صوتی و تصویری/i],
  monitor:[/مانیتور/i,/کامپیوتر و قطعات/i,/کامپیوتر و اداری/i],
  camera:[/دوربین/i],
  smartwatch:[/ساعت هوشمند/i,/ساعت و پوشیدنی/i],
  printer:[/پرینتر/i,/ماشین.?های اداری/i,/پرینتر و تجهیزات اداری/i],
  refrigerator:[/لوازم خانگی/i,/لوازم برقی/i,/یخچال/i],
  washing_machine:[/لوازم خانگی/i,/لوازم برقی/i,/لباسشویی/i],
  air_conditioner:[/لوازم خانگی/i,/لوازم برقی/i,/تهویه/i],
  vacuum:[/جاروبرقی/i,/لوازم خانگی/i,/لوازم برقی/i],
  kitchen_appliance:[/آشپزخانه/i,/لوازم خانگی/i,/لوازم برقی/i],
  kitchen_scale:[/آشپزخانه/i,/لوازم خانگی/i,/لوازم برقی/i],
  air_purifier:[/تصفیه هوا/i,/تهویه/i],
  sofa:[/مبلمان/i,/مبل و راحتی/i,/دکوراسیون/i,/مبلمان اداری/i,/لوازم خانگی و مبلمان/i,/میز و صندلی/i],
  furniture:[/مبلمان/i,/مبل و راحتی/i,/دکوراسیون/i,/مبلمان اداری/i,/لوازم خانگی و مبلمان/i,/میز و صندلی/i,/میز و دکور/i],
  office_bag:[/کیف و محصولات چرمی/i,/کیف و اکسسوری/i,/کیف و کفش/i,/کوله و کیف/i,/کیف اداری/i,/محصولات چرمی/i],
  mobile_accessory:[/لوازم جانبی/i,/پاوربانک/i,/کابل و شارژر/i,/هدفون و هندزفری/i,/هولدر موبایل/i],
  mobile_phone:[/گوشی موبایل/i,/موبایل و تبلت/i,/موبایل/i,/تلفن همراه/i],
  skincare:[/مراقبت پوست/i,/پوست و مو/i,/ضد آفتاب/i,/آرایشی و بهداشتی/i,/بهداشت و سلامت/i,/آرایشی و زیبایی/i,/زیبایی و بهداشت/i,/سلامت و زیبایی/i,/محصولات آرایشی/i,/محصولات بهداشتی/i,/آرایش صورت/i],
  shoe:[/کفش/i,/کیف و کفش/i],
  clothing:[/پوشاک/i,/مد و پوشاک/i,/لباس/i,/پوشاک ورزشی/i]
 };
 if(need.concept==='sofa_cleaning')rules.sofa_cleaning=[/شوینده/i,/نظافت/i,/بخارشوی/i,/جاروبرقی/i,/ابزارآلات و تجهیزات/i,/مراقبت در منزل/i];
 var patterns=rules[need.concept]||[];
 return cats.filter(function(category){var c=norm(category);return patterns.some(function(pattern){return pattern.test(c);});});
}
function retrieveCandidates(need,catalog,eligibleIds){
 var base=Array.isArray(eligibleIds)?eligibleIds.map(function(x){return String(x&&x.id||x||'').toLowerCase();}):[];
 var candidates=[];
 var broadTerms=['خانه','دیجیتال','کالا','محصول','فروشگاه','عمومی','لوازم','پوشاک','سلامت','بهداشت','اکسسوری','مد','ورزش','سفر','خرید','فروش'];
 function evidenceTerms(query,item){
  var q=norm(query),out=[];
  var genericProductWords=['میز','مبل','مبلمان','کیف','لباس','پوشاک','کفش','خانه','صندلی','لوازم','محصول','دیجیتال','زیبایی','آرایشی','بهداشتی','اکسسوری','مد','خواب','اتاق','مناسب','محل','کار','دنبال','هستم','چیزی','میخواهم','میخوام','روزمره'];
  var domains=Array.isArray(item.domains)?item.domains:[];
  var cleaningIntent=/(?:تمیز\s*کردن|تمیزکاری|شستشو|شستن|نظافت|شوینده|پاک\s*کردن|پاکسازی|مبل\s*شویی|شستشوی\s*مبل)/i.test(q);
  /* Only catalogued inventory, aliases, specialties, and product families can
     prove that a merchant carries the requested item. querySignals remain
     useful for vocabulary discovery elsewhere, but are never enough to admit
     a store: they are often broad intent tags rather than actual inventory. */
  var terms=[].concat(item.products||[],item.aliases||[],
    item.specialties||[],item.productFamilies||[]).reduce(function(all,value){
   String(value==null?'':value).split(/[,،;؛\n]+/).map(function(x){return x.trim();}).filter(Boolean).forEach(function(x){all.push(x);});
   return all;
  },[]);
  terms.forEach(function(raw){
   var term=norm(raw);
   if(!term||term.length<3)return;
   /* Context words must not masquerade as product evidence. */
   if(need.concept==='kitchen_scale'&&!/(?:ترازو|ترازوی)/i.test(term))return;
   if(need.concept==='sofa_cleaning'&&!/(?:تمیزکننده\s*مبل|شوینده\s*مبل|مبل\s*شوی|فرش\s*شوی|بخارشوی)/i.test(term))return;
   var words=term.split(/[^\u0600-\u06FFa-z0-9]+/i).filter(Boolean)
    .filter(function(w){return w.length>=3&&broadTerms.indexOf(w)<0;});
   /* Preserve the former category-aware retrieval for broad furniture and
      fashion needs, without promoting generic labels for specialized products. */
   if(words.length===1&&genericProductWords.indexOf(words[0])>=0&&q!==term){
    var word=words[0];
    var broadFurnitureMatch=domains.indexOf('furniture')!==-1&&['مبل','مبلمان'].indexOf(word)!==-1&&!cleaningIntent&&(!/اداری/i.test(q)||/اداری/i.test(term));
    var broadFashionMatch=domains.indexOf('fashion')!==-1&&['لباس','پوشاک','کفش'].indexOf(word)!==-1&&q.indexOf('کیف اداری')===-1&&q.indexOf('اداری کیف')===-1;
    var broadTableMatch=domains.indexOf('furniture')!==-1&&word==='میز'&&(!/اداری/i.test(q)||/اداری/i.test(term))&&q.indexOf('تنظیم ارتفاع')===-1&&q.indexOf('ارتفاع تنظیم')===-1&&q.indexOf('ارگونومیک')===-1&&q.indexOf('برقی')===-1;
    if(!broadFurnitureMatch&&!broadFashionMatch&&!broadTableMatch)return;
   }
   if(!cleaningIntent&&domains.indexOf('furniture')!==-1&&(!/اداری/i.test(q)||/اداری/i.test(term))&&/(?:مبل|مبلمان)/i.test(q)&&/(?:مبل|مبلمان)/i.test(term)){out.push(raw);return;}
   if(termMatchesQuery(term,q)){out.push(raw);return;}
   if(words.length>=2&&words.every(function(w){return meaningfulTokens(q).indexOf(tokenStem(w))>=0;})){out.push(raw);return;}
   if(words.length===1&&words[0].length>=4&&broadTerms.indexOf(words[0])<0&&
      meaningfulTokens(q).indexOf(tokenStem(words[0]))>=0){out.push(raw);}
  });
  return Array.from(new Set(out));
 }
 Object.keys(catalog||{}).forEach(function(id){
  var s=catalog[id]||{},sid=String(id).toLowerCase();
  /* Only explicit current product inventory is direct evidence. Domains, querySignals,
     generated semanticText and exclusions must never make a merchant eligible. */
  var fields=[].concat(s.products||[]);
  var text=norm(fields.join(' ')),score=base.indexOf(sid)>=0?3:0,proof=[];
  var concept=CONCEPTS.find(function(c){return c.key===need.concept;});
  var productTerms=concept?concept.terms:[need.requestedProduct];
  var direct=false;
  productTerms.forEach(function(term){
   var t=norm(term);if(t&&t.length>2&&text.indexOf(t)>=0){score+=s.specialties&&s.specialties.some(function(v){return norm(v).indexOf(t)>=0;})?7:5;direct=true;proof.push(term);}
  });
  /* Shared open-catalog retrieval: inspect every merchant's declared product
     evidence, not only concept-specific seed lists. Exact phrases, or a
     complete match of a multi-word product's meaningful tokens, can admit
     new merchants without adding a per-query allowlist. */
  var evidence=evidenceTerms(need.normalized,s);
  /* Category taxonomy is a retrieval index, not UI-only metadata. */
  categoryEvidence(need,s).forEach(function(category){evidence.push('store-category:'+category);});
  /* Category taxonomy is a retrieval index, not UI-only metadata. Precise
     subcategory matches recover specialists with incomplete product aliases. */
  categoryEvidence(need,s).forEach(function(category){evidence.push('store-category:'+category);});
  /* Apparel words are a semantic family: a request for «لباس اسپرت» should
     find merchants whose declared inventory lists shirts, trousers or sportswear. */
  if(need.concept==='clothing'&&(s.domains||[]).indexOf('fashion')!==-1&&/(?:تیشرت|تی\s*شرت|پیراهن|شلوار|مانتو|کاپشن|هودی|لباس|پوشاک|دامن|پالتو|لباس\s*ورزشی)/i.test(norm([].concat(s.products||[]).join(' ')))){
   evidence.push('declared-fashion-apparel-inventory');
  }
  /* The query can say «گوشی» while the merchant KB declares «موبایل». A declared mobile-accessories specialty is valid evidence only when the parsed need is explicitly an accessory request. */
  if(/(?:قاب|کاور|گلس|محافظ\s*صفحه|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری)/i.test(need.normalized)&&(s.intents||[]).indexOf('mobile_accessories')!==-1){evidence.push('mobile-accessories-specialty');}
  evidence.forEach(function(term){
   if(proof.some(function(p){return norm(p)===norm(term);}))return;
   score+=4;direct=true;proof.push(term);
  });
  var domainHit=!!(need.domain&&(s.domains||[]).indexOf(need.domain)>=0);
  if(domainHit)score+=2;
  var domainWords=DOMAIN_SYNONYMS[need.domain]||[];
  if(domainWords.some(function(w){return need.normalized.indexOf(norm(w))>=0;})&&domainHit)score+=1;
  var isGeneral=GENERAL.has(sid);
  /* General marketplaces may qualify from a parsed product concept plus an
     explicit current category inventory in their KB. This is not a domain-only
     fallback: the concept must be recognized, the store must declare products,
     and cleaning/air-purifier safeguards below still apply. */
  if(need.concept&&isGeneral&&domainHit&&!direct&&['office_bag','mobile_accessory','air_purifier','sofa_cleaning','skincare'].indexOf(need.concept)<0){
   var declaredProducts=norm([].concat(s.products||[],s.aliases||[]).join(' '));
   var categoryInventory={
    digital:['دیجیتال','موبایل','گوشی','لپ تاپ','تبلت','کامپیوتر','لوازم جانبی'],
    home:['لوازم خانگی','آشپزخانه','خانه','یخچال','جاروبرقی','تصفیه هوا'],
    fashion:['پوشاک','لباس','کیف','کفش'],
    beauty:['آرایشی','بهداشتی','مراقبت پوست','ضد آفتاب','کرم'],
    health:['سلامت','بهداشتی','دارو','مکمل'],
    furniture:['مبلمان','میز','صندلی','دکوراسیون'],
    travel_ticket:['بلیط','سفر','قطار','هواپیما','اتوبوس']
   }[need.domain]||[];
   var declaredMobileInventory=[].concat(s.products||[]).some(function(v){
    return /(?:موبایل|گوشی|تلفن\s*همراه|تبلت|smartphone|mobile\s*phone)/i.test(norm(v));
   });
   if(categoryInventory.some(function(term){return declaredProducts.indexOf(norm(term))>=0;})&&
      (need.concept!=='mobile_phone'||declaredMobileInventory)){
    score+=4;direct=true;proof.push('declared-current-category-inventory');
   }
  }
  if(isGeneral&&domainHit&&direct)score+=1;
  if(need.concept==='sofa_cleaning'&&isGeneral&&domainHit)score+=3;
  var blockedConcepts=Array.isArray(s.hooshyarExcludeConcepts)?s.hooshyarExcludeConcepts:[];
  if(need.concept&&blockedConcepts.indexOf(need.concept)>=0){score=-100;proof=[];direct=false;}
  if(need.concept==='mobile_accessory'&&need.brand==='سامسونگ'&&blockedConcepts.indexOf('mobile_accessory_samsung')>=0){score=-100;proof=[];direct=false;}
  var furnitureMerchant=!isGeneral&&((s.domains||[]).indexOf('furniture')>=0||(s.intents||[]).indexOf('furniture')>=0);
  var hasAirPurifierProduct=[].concat(s.products||[]).some(function(v){
   return /(?:تصفیه\s*هوا|دستگاه\s*تصفیه|پاکسازی\s*هوا|تصفیه\s*کننده\s*هوا|air\s*purifier)/i.test(norm(v));
  });
  var hasMobilePhoneProduct=[].concat(s.products||[]).some(function(v){
   return /(?:موبایل|گوشی|تلفن\s*همراه|تبلت|کالای\s*دیجیتال|smartphone|mobile\s*phone)/i.test(norm(v));
  });
  if(need.concept==='mobile_phone'&&!isGeneral&&!hasMobilePhoneProduct&&(s.domains||[]).indexOf('furniture')>=0){score=-100;proof=[];}
  /* Furniture-domain overlap is never evidence for an air purifier. Allow an unusual cross-category merchant only when its KB explicitly lists air-purifier products. */
  if(need.concept==='air_purifier'&&!isGeneral&&!hasAirPurifierProduct){score=-100;proof=[];direct=false;}
  var hasCleaningProduct=[].concat(s.products||[]).some(function(v){
   /* Cleaning intent requires an actual cleaning appliance/product, not a generic
      home, beauty or supermarket taxonomy signal. */
   return /(?:تمیزکننده\s*مبل|شوینده\s*مبل|مبل\s*شویی|دستگاه\s*مبل\s*شوی|بخارشوی|فرش\s*شوی(?:ی)?|جاروبرقی|جارو\s*شارژی)/i.test(norm(v));
  });
  if(need.concept==='sofa_cleaning'&&hasCleaningProduct&&!direct){score+=4;direct=true;proof.push('sofa-cleaning-appliance');}
  if(need.concept==='sofa_cleaning'&&!isGeneral&&!hasCleaningProduct){score=-100;proof=[];direct=false;}
  var coreMarketplaces=['digikala','snappshop','torob','basalam'];
  if(need.concept==='mobile_accessory'&&!isGeneral&&!categoryEvidence(need,s).length){
    var digitalAccessoryDomain=(s.domains||[]).some(function(domain){return /digital|mobile|electronics/i.test(norm(domain));});
    if(!digitalAccessoryDomain){score=-100;proof=[];direct=false;}
  }
  /* Broad resale/deal sites are not reliable product matches for these narrow
     needs even if their domain tags or generic inventory overlap. */
  if(isGeneral&&['air_purifier','sofa_cleaning','mobile_accessory','kitchen_scale'].indexOf(need.concept)>=0&&coreMarketplaces.indexOf(sid)<0){score=-100;proof=[];direct=false;}
  var accessoryQuery=/(?:قاب|کاور|گلس|محافظ\s*صفحه|محافظ\s*لنز|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری)/i.test(need.normalized);
  var exclusions=Array.isArray(s.exclude||s.exclusions)?(s.exclude||s.exclusions).slice():[];
  if(accessoryQuery&&((s.intents||[]).indexOf('mobile_accessories')!==-1||categoryEvidence(need,s).length>0)){exclusions=exclusions.filter(function(x){return !/(?:موبایل|گوشی)(?:\s*(?:سامسونگ|آیفون|شیائومی))?/i.test(norm(x));});}
  var excluded=exclusions.some(function(x){var t=norm(x);return t&&need.normalized.indexOf(t)>=0;});
  if(excluded)score=-100;
  var strictTaxonomyConcepts=['air_purifier','sofa_cleaning','mobile_accessory','office_bag','skincare','kitchen_scale'];
  var matchedCategoryEvidence=categoryEvidence(need,s);
  var hasCategoryReference=Array.isArray(s.categories)&&s.categories.length>0;
  if(strictTaxonomyConcepts.indexOf(need.concept)>=0&&hasCategoryReference&&!matchedCategoryEvidence.length){
    var coreMarketplaces=['digikala','snappshop','torob','basalam'];
    var exactInventoryTerms={
      air_purifier:/تصفیه\s*هوا|دستگاه\s*تصفیه/i,
      sofa_cleaning:/تمیزکننده\s*مبل|شوینده\s*مبل|مبل\s*شوی|فرش\s*شوی|بخارشوی/i,
      mobile_accessory:/لوازم\s*جانبی|قاب\s*گوشی|کاور\s*گوشی|شارژر|پاوربانک|هندزفری|هدفون|کابل/i,
      office_bag:/کیف\s*(?:اداری|کاری|رسمی)|کیف\s*و\s*محصولات\s*چرمی/i,
      skincare:/ضد\s*آفتاب|مرطوب\s*کننده|آبرسان|مراقبت\s*پوست|کرم\s*پوست/i,
      kitchen_scale:/ترازوی?\s*(?:هوشمند\s*)?آشپزخانه|ترازو\s*دیجیتال\s*آشپزخانه/i
    };
    var hasExactInventory=[].concat(s.products||[]).some(function(value){return exactInventoryTerms[need.concept]&&exactInventoryTerms[need.concept].test(norm(value));});
    var generalMarketplaceException=isGeneral&&coreMarketplaces.indexOf(sid)>=0&&hasExactInventory;
    if(!generalMarketplaceException){score=-100;proof=[];direct=false;}
  }
  /* Domain tags and curated seed lists are not sufficient: require direct product or use-case evidence. */
  if(score>=3&&direct)candidates.push({id:sid,name:s.name||sid,score:score,directMatch:direct,domainMatch:domainHit,general:isGeneral,proof:Array.from(new Set(proof)),homepage:s.homepage||''});
 });
 return candidates;
}
function rankCandidates(need,candidates,eligibleIds){
 var base=Array.isArray(eligibleIds)?eligibleIds.map(function(x){return String(x&&x.id||x||'').toLowerCase();}):[];
 return candidates.sort(function(a,b){
  if(a.general!==b.general&&a.directMatch&&b.directMatch)return a.general?1:-1;
  if(a.score!==b.score)return b.score-a.score;
  var ai=base.indexOf(a.id),bi=base.indexOf(b.id);
  if(ai>=0||bi>=0)return ai<0?1:bi<0?-1:ai-bi;
  return a.name.localeCompare(b.name,'fa');
 });
}
function resolve(query,catalog,eligibleIds,classified){
 var need=parseNeed(query);
 if(classified&&classified.kind==='travel_ticket'){need.concept='train_ticket';need.requestedProduct=classified.product||need.requestedProduct;need.domain='travel_ticket';need.domains=['travel_ticket'];need.taskType='ticket_search';}
 /* Reuse the established eligibility contract as one evidence source, then
    enrich/rank those candidates with the three-stage resolver. */
 var seedIds=Array.isArray(eligibleIds)?eligibleIds.slice():[];
 if(!seedIds.length&&root.DigiYarStoreEligibility&&typeof root.DigiYarStoreEligibility.storesForQuery==='function'){
  try{seedIds=root.DigiYarStoreEligibility.storesForQuery(query,[]).map(function(s){return String(s&&s.id||s||'').toLowerCase();});}catch(_){seedIds=[];}
 }
 var preferred=CONCEPT_STORES[need.concept]||[];
 seedIds=seedIds.map(function(id){return String(id&&id.id||id).toLowerCase();});
 var candidates=retrieveCandidates(need,catalog,seedIds);
 /* Curated store lists are ranking hints only; never add a merchant without
    direct product/use-case evidence in the canonical merchant KB. */
 var ranked=rankCandidates(need,candidates,seedIds);
 if(need.concept==='mobile_phone'||need.concept==='mobile_accessory'){
  ranked.sort(function(a,b){var ai=preferred.indexOf(a.id),bi=preferred.indexOf(b.id);if(ai<0)ai=9999;if(bi<0)bi=9999;return ai-bi;});
 }
 var ids=ranked.map(function(x){return x.id;});
 var queries={};
 ids.forEach(function(id){
  var s=catalog[id]||{};
  var phrase=need.concept==='train_ticket'?clean(query):need.requestedProduct;
  if(need.brand&&need.concept!=='mobile_phone'&&need.concept!=='mobile_accessory')phrase+=' '+need.brand;
  if(need.attributes.length)phrase+=' '+need.attributes.slice(0,2).join(' ');
  /* Do not replace a specific product with a broad category just because a store is general. */
  queries[id]=clean(phrase)||clean(query);
 });
 return {version:VERSION,need:need,candidates:ranked,eligibleStoreIds:ids,searchQueries:queries,trace:{parsedConcept:need.concept,candidateCount:ranked.length,top:ranked.slice(0,8).map(function(x){return {id:x.id,score:x.score,directMatch:x.directMatch,proof:x.proof};})}};
}
var api={version:VERSION,parseNeed:parseNeed,retrieveCandidates:retrieveCandidates,rankCandidates:rankCandidates,resolve:resolve};
root.DigiYarHooshyarThreeEngine=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
