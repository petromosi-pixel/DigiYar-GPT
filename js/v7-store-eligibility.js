/* DigiYar V7 — query-driven store eligibility for Hooshyar Simulator
   Filters simulator tabs before rendering. It does not fetch an API and does not alter V6 profile flow.
*/
(function(root){
'use strict';
var VERSION='7.0.0-store-eligibility.4';

var DOMAINS={
  furniture:['مبلمان','مبلمان اداری','میز اداری','میز تحریر','میز مطالعه','میز کامپیوتر','میز کار','صندلی تحریر','صندلی اداری','صندلی مدیریت','میز مدیریت','میز کارمندی','فایلینگ','کمد اداری','پارتیشن اداری','office furniture','office chair','office desk'],
  digital:['کالای دیجیتال','موبایل','گوشی','لپ تاپ','لپ‌تاپ','تبلت','هدفون','هندزفری','ایرباد','تلویزیون','دوربین','لوازم جانبی','پاوربانک','شارژر','کنسول','گیمینگ','کامپیوتر','مانیتور','پرینتر'],
  fashion:['پوشاک','لباس','کفش','کیف','مد و پوشاک','تیشرت','پیراهن','شلوار','هودی','سوییشرت','کاپشن','پولوشرت','مانتو','بافت','کت','ست مردانه','ست زنانه'],
  beauty:['آرایشی','بهداشتی','زیبایی','مراقبت پوست','مراقبت مو','عطر'],
  health:['سلامت','پزشکی','مکمل','ویتامین','تجهیزات پزشکی','دارویی'],
  supermarket:['سوپرمارکت','مواد غذایی','خوراکی','نوشیدنی','کالاهای روزمره'],
  home:['خانه و آشپزخانه','لوازم خانگی','لوازم آشپزخانه','دکوراسیون','نظافت','فرش','فرش ماشینی','فرش دستباف','قالی','قالیچه','گلیم','موکت','تابلو فرش','پادری','کفپوش'],
  sports:['ورزش','بدنسازی','کمپ','تجهیزات ورزشی'],
  kids:['کودک','نوزاد','اسباب بازی','اسباب‌بازی'],
  books:['کتاب','لوازم تحریر','هنر'],
  auto:['خودرو','ماشین','لوازم خودرو','قطعات خودرو','موتورسیکلت','لاستیک','تایر','رینگ','باتری خودرو','روغن موتور','لنت ترمز'],
  accessories:['اکسسوری','ساعت مچی','ساعت','عینک','زیورآلات','کیف و کوله','کیف'],
  travel_ticket:['بلیط قطار','بلیت قطار','قطار','بلیط هواپیما','بلیت هواپیما','پرواز','بلیط اتوبوس','بلیت اتوبوس','تور مسافرتی'],
  lodging:['اقامتگاه','اقامت','ویلا','سوئیت','کلبه','بوم گردی','بوم‌گردی','رزرو ویلا','اجاره ویلا'],
  education:['دوره آنلاین','دوره آموزشی','وبینار','آموزش آنلاین','کلاس آنلاین','آموزش برنامه نویسی','آموزش برنامه‌نویسی'],
  auto_service:['کارشناسی خودرو','کارشناسی ماشین','قیمت خودرو','فروش خودرو','خرید خودرو','خدمات خودرو','خودرو کارکرده'],
  medicine:['دارو','دارویی','داروخانه','قرص','کپسول','شربت','نسخه','محصولات درمانی','دارو و درمان','داروی','مکمل','ویتامین','مواد معدنی','فشار خون','فشارسنج','تجهیزات پزشکی','ارتوپدی','توانبخشی']
};

var STORE_DOMAINS={
  digikala:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books','auto'],
  snappshop:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','auto'],
  torob:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','auto'],
  basalam:['digital','furniture','fashion','beauty','health','supermarket','home','sports','kids','books'],
  esam:['digital','furniture','fashion','home','auto','books'],
  berzkala:['digital'],
  berozkala:['digital'],
  technolife:['digital'],
  digiland:['digital'],
  digido:['digital'],
  janebi:['digital'],
  gooshishop:['digital'],
  khanoumi:['beauty'],
  banimode:['fashion'],
  modiseh:['fashion','beauty'],
  jeanswest:['fashion'],
  neshatrokh:['beauty','health'],
  solokala:['beauty'],
  rugs:['home'],
  shavaz:['beauty','health','supermarket'],
  darukade:['health','beauty'],
  darmankala:['health'],
  mosbatesabz:['health','beauty'],
  'daroo-online':['health'],
  pinket:['supermarket','home','beauty'],
  takhfifan:['furniture','beauty','fashion','home','sports'],
  dayan:['fashion','accessories'],
  memarket:['digital','home','fashion','accessories','beauty'],
  safarme:['travel_ticket'],
  shab:['lodging','travel_ticket'],
  eseminar:['education'],
  maktabkhooneh:['education'],
  karnameh:['auto_service']
};

function norm(v){
  return String(v==null?'':v)
    .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
    .replace(/[‌\u200c]/g,' ')
    .replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);})
    .replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);})
    .replace(/\s+/g,' ').trim().toLowerCase();
}

var SPECIALTY_RULES=[
  {terms:['بلیط قطار','بلیت قطار'],stores:['safarme','shab']},
  {terms:['بلیط هواپیما','بلیت هواپیما'],stores:['safarme']},
  {terms:['بلیط اتوبوس','بلیت اتوبوس'],stores:['safarme']},
  {terms:['دارو','دارویی','داروی','داروخانه','قرص','کپسول','شربت','نسخه','محصولات درمانی'],stores:['darukade','darmankala','daroo-online','mosbatesabz']},
  {terms:['تجهیزات پزشکی','فشارسنج','ارتوپدی','توانبخشی','محصولات بیمارستانی'],stores:['darmankala','darukade','mosbatesabz','daroo-online']},
  {terms:['مکمل','ویتامین','مواد معدنی'],stores:['darukade','mosbatesabz','daroo-online']},
  {terms:['اقامتگاه','ویلا','سوئیت','کلبه','بوم گردی','بوم‌گردی','رزرو ویلا','اجاره ویلا'],stores:['shab']},
  {terms:['وبینار','دوره آنلاین','دوره آموزشی','آموزش آنلاین','کلاس آنلاین'],stores:['eseminar','maktabkhooneh']},
  {terms:['کارشناسی خودرو','کارشناسی ماشین','قیمت خودرو','فروش خودرو','خرید خودرو','خودرو کارکرده'],stores:['karnameh']}
];

function specialtyStoresForQuery(query,stores){
  var s=norm(query), list=Array.isArray(stores)?stores:[];
  var hits=[];
  SPECIALTY_RULES.forEach(function(rule){
    var matched=rule.terms.some(function(term){return s.indexOf(norm(term))!==-1;});
    if(matched) rule.stores.forEach(function(id){if(hits.indexOf(id)===-1)hits.push(id);});
  });
  if(!hits.length)return null;
  return list.filter(function(store){return store&&hits.indexOf(String(store.id).toLowerCase())!==-1;});
}

function domainForQuery(query){
  var s=norm(query);
  var best=null;
  Object.keys(DOMAINS).forEach(function(domain){
    DOMAINS[domain].forEach(function(term){
      var t=norm(term);
      if(t && s.indexOf(t)!==-1 && (!best || t.length>best.term.length))
        best={domain:domain,term:t};
    });
  });
  return best;
}

function storesForQuery(query, stores){
  var list=Array.isArray(stores)?stores:[];
  var specialty=specialtyStoresForQuery(query,list);
  if(specialty!==null) return specialty;
  var hit=domainForQuery(query);
  /* Strict mode: an unclassified query must never fall back to every store.
     Showing fewer relevant stores is safer than showing unrelated merchants. */
  if(!hit) return [];

  return list.filter(function(store){
    if(!store || !store.id) return false;
    var domains=STORE_DOMAINS[String(store.id).toLowerCase()];
    return Array.isArray(domains) && domains.indexOf(hit.domain)!==-1;
  });
}

function explain(query, stores){
  var hit=domainForQuery(query);
  var all=Array.isArray(stores)?stores:[];
  var eligible=storesForQuery(query,all);
  return {
    version:VERSION,
    domain:hit&&hit.domain||null,
    matchedTerm:hit&&hit.term||null,
    inputCount:all.length,
    eligibleCount:eligible.length,
    eligibleIds:eligible.map(function(x){return x.id;})
  };
}

root.DigiYarStoreEligibility={
  version:VERSION,
  domains:DOMAINS,
  storeDomains:STORE_DOMAINS,
  domainForQuery:domainForQuery,
  storesForQuery:storesForQuery,
  explain:explain
};
if(typeof module!=='undefined'&&module.exports) module.exports=root.DigiYarStoreEligibility;
})(typeof window!=='undefined'?window:globalThis);
