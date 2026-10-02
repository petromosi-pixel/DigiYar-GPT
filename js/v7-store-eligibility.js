/* DigiYar V7 — query-driven store eligibility for Hooshyar Simulator
   Filters simulator tabs before rendering. It does not fetch an API and does not alter V6 profile flow.
*/
(function(root){
'use strict';
var VERSION='7.0.0-store-eligibility.11';

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


var SPECIALTY_STORE_META={
  darukade:{name:'داروکده'},darmankala:{name:'درمان‌کالا'},neshatrokh:{name:'نشاط رخ'},solokala:{name:'سولوکالا'},mosbatesabz:{name:'مثبت سبز'},'daroo-online':{name:'داروخانه آنلاین'},
  shab:{name:'شب'},safarme:{name:'سفرمی'},eseminar:{name:'ایسمینار'},maktabkhooneh:{name:'مکتب‌خونه'},karnameh:{name:'کارنامه'}
};

/* Semantic families are intentionally small and expandable. They are not a
   finite search vocabulary: they describe concepts/intent signals so that
   natural phrases can resolve to the same commercial domain. The original
   user query is always preserved as the actual store search text. */
var SEMANTIC_FAMILIES=[
  {domain:'beauty',terms:['ضد تعریق','بوی بدن','عرق بدن','بوی زیر بغل','تعریق زیاد','کنترل بو'],stores:['khanoumi','modiseh','shavaz','mosbatesabz']},
  {domain:'beauty',terms:['ضد آفتاب','کرم ضد آفتاب','کرم آبرسان','آبرسان','مرطوب کننده','مرطوب‌کننده','نرم کردن پوست','نرم کننده پوست','کرم پوست'],stores:['khanoumi','modiseh','shavaz','neshatrokh','solokala','mosbatesabz','darukade','darmankala','daroo-online','digikala','snappshop','torob']},
  {domain:'beauty',terms:['ضد جوش','جوش صورت','آکنه','جای جوش','پوست مستعد جوش','کنترل جوش'],stores:['khanoumi','modiseh','shavaz','mosbatesabz']},
  {domain:'fashion',terms:['کیف وکالت','کیف وکیل','کیف اداری','کیف برای کار','کیف رسمی','استایل رسمی'],stores:['digikala','snappshop','torob','basalam','dayan','memarket']},
  {domain:'auto',terms:['برای پراید','مناسب پراید','تعمیر پراید','قطعه پراید','لوازم پراید'],stores:['digikala','snappshop','torob','basalam','esam']},
  {domain:'kids',terms:['برای کودک','برای بچه','برای نوزاد','مناسب کودک','مناسب نوزاد','هدیه کودک'],stores:['digikala','snappshop','torob','basalam']},
  {domain:'books',terms:['برای وکالت','برای حقوق','آزمون وکالت','منابع وکالت','کتاب حقوقی'],stores:['digikala','snappshop','torob','basalam','esam']}
];

function semanticMatches(query){
  var s=norm(query),hits=[];
  SEMANTIC_FAMILIES.forEach(function(f){
    if(f.terms.some(function(t){return s.indexOf(norm(t))!==-1;})){
      hits.push({domain:f.domain,stores:f.stores});
    }
  });
  return hits;
}

function mergedSourceList(list){
  var out=Array.isArray(list)?list.slice():[];
  Object.keys(SPECIALTY_STORE_META).forEach(function(id){
    if(!out.some(function(x){return x&&String(x.id).toLowerCase()===id;})){
      out.push({id:id,name:SPECIALTY_STORE_META[id].name});
    }
  });
  return out;
}

var GENERAL_STORE_IDS=['digikala','snappshop','torob','basalam'];
function isGeneralStore(id){return GENERAL_STORE_IDS.indexOf(String(id||'').toLowerCase())!==-1;}

function specialtyStoresForQuery(query,stores){
  var s=norm(query), list=mergedSourceList(stores), hits=[];
  var semantic=semanticMatches(query);
  semantic.forEach(function(f){f.stores.forEach(function(id){if(hits.indexOf(id)===-1)hits.push(id);});});
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

function aiDomainHints(query){
  try{
    var p=root.DigiYarShoppingPlan;
    if(!p||norm(p.query)!==norm(query)||!p.ai||!Array.isArray(p.ai.domains)) return [];
    return p.ai.domains.map(function(x){return norm(x);}).filter(function(x){return !!DOMAINS[x]||x==='accessories';});
  }catch(_){return [];}
}

function aiSpecialtyMatches(query,list){
  try{
    var p=root.DigiYarShoppingPlan;
    if(!p||norm(p.query)!==norm(query)||!p.ai) return [];
    var ids=Array.isArray(p.ai.eligibleStoreIds)?p.ai.eligibleStoreIds.map(function(x){return String(x||'').toLowerCase();}):[];
    if(!ids.length) return [];
    return list.filter(function(x){
      return x&&ids.indexOf(String(x.id||'').toLowerCase())!==-1;
    });
  }catch(_){return [];}
}

function aiSelectedStores(query,list){
  try{
    var p=root.DigiYarShoppingPlan;
    /* Once the AI planner has answered for this exact query, its store
       selection is authoritative — including an intentional empty array.
       Never fall back to the old keyword/domain engine after an AI answer. */
    if(!p||norm(p.query)!==norm(query)||!p.ai||!Array.isArray(p.ai.eligibleStoreIds)) return null;
    var ids=p.ai.eligibleStoreIds.map(function(x){return String(x||'').toLowerCase();});
    var selected=list.filter(function(x){return x&&ids.indexOf(String(x.id||'').toLowerCase())!==-1;});
    return selected;
  }catch(_){return null;}
}

function storesForQuery(query, stores){
  var list=mergedSourceList(stores);
  var aiSelected=aiSelectedStores(query,list);
  if(aiSelected!==null) return aiSelected;
  var semantic=semanticMatches(query);
  var specialty=specialtyStoresForQuery(query,list);
  if(semantic.length){
    var semanticStores=[];
    semantic.forEach(function(f){
      f.stores.forEach(function(id){
        var found=list.find(function(x){return x&&String(x.id).toLowerCase()===String(id).toLowerCase();});
        if(found&&!semanticStores.some(function(x){return String(x.id).toLowerCase()===String(found.id).toLowerCase();})) semanticStores.push(found);
      });
    });
    if(specialty===null) specialty=semanticStores;
    else semanticStores.forEach(function(x){if(!specialty.some(function(s){return String(s.id).toLowerCase()===String(x.id).toLowerCase();})) specialty.push(x);});
  }
  if(specialty!==null){
    /* Specialist rules are authoritative, but general marketplaces are also
       eligible when their catalog domain actually matches the query. */
    var domainHit=domainForQuery(query);
    var aiDomains=aiDomainHints(query);
    if(!domainHit&&aiDomains.length) domainHit={domain:aiDomains[0],term:null};
    if(!domainHit) return specialty;
    var generalMatches=list.filter(function(store){
      if(!store||!isGeneralStore(store.id)) return false;
      var domains=STORE_DOMAINS[String(store.id).toLowerCase()];
      return Array.isArray(domains)&&domains.indexOf(domainHit.domain)!==-1;
    });
    specialty=specialty.concat(generalMatches.filter(function(g){
      return !specialty.some(function(s){return String(s.id).toLowerCase()===String(g.id).toLowerCase();});
    }));
    return specialty;
  }
  var hit=domainForQuery(query);
  var aiDomains=aiDomainHints(query);
  if(!hit&&aiDomains.length) hit={domain:aiDomains[0],term:null};
  /* Strict mode: an unclassified query must never fall back to every store.
     Showing fewer relevant stores is safer than showing unrelated merchants. */
  /* Open-browser mode: natural-language queries are not limited to a
     finite keyword dictionary. When no domain can be classified safely,
     keep the user's exact query and route it to the four broad marketplaces.
     This guarantees that a new product/service/phrase still produces a
     useful destination instead of an empty result. */
  if(!hit){
    return list.filter(function(store){return store&&isGeneralStore(store.id);});
  }

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
