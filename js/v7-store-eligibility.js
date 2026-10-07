/* DigiYar V7 — query-driven store eligibility for Hooshyar Simulator
   Filters simulator tabs before rendering. It does not fetch an API and does not alter V6 profile flow.
*/
(function(root){
'use strict';
var VERSION='7.0.0-store-eligibility.48';

var DOMAINS={};
var STORE_DOMAINS={};
var SPECIALTY_STORE_META={};

function getKB(){
  return root.DigiYarStoreBusinessDomains&&root.DigiYarStoreBusinessDomains.catalog
    ? root.DigiYarStoreBusinessDomains.catalog : {};
}
function hydrateKnowledgeBase(){
  var kb=getKB();
  Object.keys(kb).forEach(function(id){
    var item=kb[id]||{};
    if(Array.isArray(item.domains)&&item.domains.length) STORE_DOMAINS[id]=item.domains.slice();
    (item.domains||[]).forEach(function(domain){
      if(!DOMAINS[domain])DOMAINS[domain]=[];
      [].concat(item.querySignals||[],item.products||[],item.aliases||[],item.specialties||[],item.productFamilies||[]).forEach(function(term){
        if(term&&DOMAINS[domain].indexOf(term)===-1)DOMAINS[domain].push(term);
      });
    });
    if(item.intents&&item.intents.length)SPECIALTY_STORE_META[id]={name:item.name||id,intents:item.intents.slice()};
  });
}
hydrateKnowledgeBase();

function kbItem(id){return getKB()[String(id||'').toLowerCase()]||null;}
function kbSignals(item){
  return item?Array.from(new Set([].concat(item.querySignals||[],item.products||[],item.aliases||[],item.specialties||[],item.productFamilies||[]))):[];
}
function kbMatchedStoreIds(query){
  var s=norm(query),out=[];
  Object.keys(getKB()).forEach(function(id){
    var item=getKB()[id]||{};
    /*
     * Eligibility must be product-driven. Domain profile signals such as
     * «سلامت», «بهداشتی» and «ویتامین» are useful for AI grounding, but they
     * are too broad to make a merchant eligible on their own. A specialist
     * merchant enters the result set only when the query directly matches
     * one of its declared products/aliases.
     */
    var terms=[].concat(item.products||[],item.aliases||[]);
    var directMatch=terms.some(function(term){
      var t=norm(term);
      return t&&s.indexOf(t)!==-1;
    });
    /*
     * Intent-aware eligibility closes the gap between a merchant's declared
     * business area and literal phrase matching. For example, "موبایل
     * سامسونگ" does not literally contain "گوشی موبایل", so a mobile merchant
     * such as DigiLand/BerozKala/Meghdad IT would otherwise be lost even
     * though its KB explicitly declares intent=mobile. This is still bounded
     * by the merchant's declared intent; it does not make every digital store
     * eligible.
     */
    /* General marketplaces are resolved by relevantGeneralStores().
     * Keeping them out of the specialist resolver prevents a broad product
     * word such as «موبایل» from promoting Esam/MeMarket into specialist
     * results for a more specific query. */
    if(isGeneralStore(id))return;
    /* A cleaning/cleaning-equipment request is an action/task, not a request to buy the furniture itself. Do not let literal matches such as «مبل» promote furniture merchants. */
    if(isCleaningTaskQuery(s) && item.intents && item.intents.indexOf('furniture')!==-1){
      var cleaningProducts=[].concat(item.products||[],item.aliases||[]);
      var hasCleaningProduct=cleaningProducts.some(function(term){
        var t=norm(term);
        return /(?:شوینده|تمیزکننده|نظافت|مبل\s*شویی|جارو|بخارشوی|فرش\s*شویی)/i.test(t);
      });
      if(!hasCleaningProduct)return;
    }
    if(item.rankAfterGeneral && /(?:قاب|کاور|گلس|محافظ|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|مبدل|لوازم\s*جانبی|اکسسوری)/i.test(s)){
      directMatch=false;
    }
    var intentMatch=(item.intents||[]).some(function(intent){
      var key=norm(intent);
      if(key==='mobile'){
        /* A mobile merchant intent is for the device itself, not a
         * mobile-accessory request. Accessory eligibility is handled by
         * explicit accessory products / mobile_accessories intent. */
        if(/(?:قاب|کاور|گلس|محافظ\s*صفحه|محافظ\s*لنز|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|پایه|استند|مبدل|تبدیل|لوازم\s*جانبی|اکسسوری)/i.test(s))return false;
        return /(?:موبایل|گوشی|سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi|تبلت)/i.test(s);
      }
      if(key==='mobile_accessories'){
        return /(?:قاب|کاور|گلس|محافظ\s*صفحه|محافظ\s*لنز|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|پایه|استند|مبدل|تبدیل|لوازم\s*جانبی|اکسسوری)/i.test(s);
      }
      return false;
    });
    if(directMatch||intentMatch)out.push(id);
  });
  return out;
}
function knowledgeSpecialistsForQuery(query,list){
  var ids=kbMatchedStoreIds(query),out=[];
  /*
   * Every specialist merchant with a direct KB product/alias match is
   * eligible.  "matchPolicy.specialistFirst" is an ordering hint, not an
   * eligibility gate.  Gating on that optional flag caused valid merchants
   * such as DigiLand and BerozKala to disappear from mobile queries even
   * though their KB explicitly declares mobile products.
   */
  ids.forEach(function(id){
    var found=(Array.isArray(list)?list:[]).find(function(x){
      return x&&String(x.id||'').toLowerCase()===String(id||'').toLowerCase();
    });
    if(found)out.push(found);
  });
  return out;
}

function norm(v){
  return String(v==null?'':v)
    .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
    .replace(/[‌\u200c]/g,' ')
    .replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);})
    .replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);})
    .replace(/\s+/g,' ').trim().toLowerCase();
}

function mergedSourceList(stores){
  var out=[];
  var seen={};
  (Array.isArray(stores)?stores:[]).forEach(function(store){
    if(!store||!store.id)return;
    var id=String(store.id).toLowerCase();
    if(seen[id])return;
    seen[id]=true;
    out.push(store);
  });
  var kb=getKB();
  Object.keys(kb).forEach(function(id){
    var key=String(id).toLowerCase();
    if(seen[key])return;
    var item=kb[id]||{};
    out.push({id:key,name:item.name||key});
    seen[key]=true;
  });
  return out;
}

var GENERAL_STORE_IDS=['digikala','snappshop','torob','basalam','esam','memarket'];
var AFTER_GENERAL_STORE_IDS=['takhfifan','esam'];
var BROAD_GENERAL_STORE_IDS=['digikala','snappshop','torob','basalam'];
function isSpecialistStore(id){return !isGeneralStore(id);}
function orderStoresSpecialistFirst(list){
  return (Array.isArray(list)?list:[]).slice().sort(function(a,b){
    var aid=String(a&&a.id||'').toLowerCase(),bid=String(b&&b.id||'').toLowerCase();
    var at=AFTER_GENERAL_STORE_IDS.indexOf(aid)!==-1,bt=AFTER_GENERAL_STORE_IDS.indexOf(bid)!==-1;
    if(at!==bt)return at?1:-1;
    var as=isSpecialistStore(a&&a.id),bs=isSpecialistStore(b&&b.id);
    return as===bs?0:(as?-1:1);
  });
}
function isGeneralStore(id){return GENERAL_STORE_IDS.indexOf(String(id||'').toLowerCase())!==-1;}
function currentStoreCategories(id){
  var all=root.DigiYarStoreCategories;
  if(!all||typeof all!=='object')return [];
  var key=String(id||'').toLowerCase();
  return Array.isArray(all[key])?all[key]:[];
}
function generalStoreHasCurrentCategoryMatch(query,id){
  var cats=currentStoreCategories(id).map(norm);
  if(!cats.length)return false;
  var ai=semanticPlanForQuery(query);
  var text=ai?semanticPlanText(ai):norm(query);
  var domains=ai&&Array.isArray(ai.domains)?ai.domains.map(norm):[];
  var requested=ai?norm(ai.requestedProduct||''):text;
  var productTerms=ai&&Array.isArray(ai.productTerms)?ai.productTerms.map(norm).filter(Boolean):[];
  var task=ai?norm(ai.taskType||''):'';

  /* In AI mode, categories are matched against the semantic need — never the
     raw conversational sentence. targetObject is deliberately excluded. */
  var domainMatchers={
    digital:/(?:دیجیتال|موبایل|لپ.?تاپ|کامپیوتر|صوتی|تصویری|لوازم\\s*جانبی)/i,
    furniture:/(?:خانه|آشپزخانه|مبلمان|لوازم\\s*خانه)/i,
    home:/(?:خانه|آشپزخانه|لوازم\\s*خانه|لوازم\\s*خانگی|لوازم\\s*برقی)/i,
    fashion:/(?:مد|پوشاک|کفش|اکسسوری)/i,
    beauty:/(?:آرایشی|زیبایی|مراقبت\\s*پوست|مراقبت\\s*مو)/i,
    health:/(?:سلامت|پزشکی|بهداشت|مراقبت)/i,
    medicine:/(?:سلامت|پزشکی|دارو|مکمل|بهداشت)/i,
    supermarket:/(?:سوپرمارکت|مواد\\s*غذایی|میوه|لبنیات|نوشیدنی|شوینده)/i,
    sports:/(?:ورزش|سفر|تناسب\\s*اندام)/i,
    kids:/(?:کودک|نوزاد|اسباب.?بازی)/i,
    books:/(?:کتاب|فرهنگی|هنری|لوازم\\s*تحریر)/i,
    auto:/(?:خودرو|وسایل\\s*نقلیه)/i,
    accessories:/(?:اکسسوری|لوازم\\s*جانبی)/i,
    travel_ticket:/(?:بلیط|سفر|قطار|اتوبوس|هواپیما)/i,
    lodging:/(?:اقامت|هتل|ویلا|سوئیت|اقامتگاه)/i,
    education:/(?:آموزش|دوره|کلاس|مهارت)/i,
    auto_service:/(?:تعمیر|سرویس|قطعه|کارواش)/i
  };
  if(ai){
    if((task==='find_tool_for_target'||task==='find_product_for_task') && /(?:مبل|مبلمان|فرش|پارچه)/i.test(norm(ai.targetObject||''))){
      /* Target object is not a product category. Match the requested product
         instead; this blocks furniture marketplaces from cleaning-tool tasks. */
      if(!/(?:شوینده|نظافت|بهداشت|تمیزکننده|پاک\\s*کننده|بخارشوی|جارو)/i.test(text))return false;
    }
    if(domains.length && domains.some(function(d){return domainMatchers[d]&&cats.some(function(c){return domainMatchers[d].test(c);});}))return true;
    if(requested && cats.some(function(c){return c.indexOf(requested)!==-1 || requested.indexOf(c)!==-1;}))return true;
    return productTerms.some(function(t){return cats.some(function(c){
      return c.indexOf(t)!==-1 || t.indexOf(c)!==-1;
    });});
  }
  /* Deterministic fallback for provider failure retains the old raw-query path. */
  var s=norm(query);
  return cats.some(function(c){return c.indexOf(s)!==-1 || s.indexOf(c)!==-1;});
}
function generalStoreHasDirectProductMatch(query,id){
  var item=kbItem(id);
  if(!item)return false;
  var s=norm(query);
  var terms=[].concat(item.products||[],item.aliases||[]);
  var genericTerms=['موبایل','گوشی','دیجیتال','لپ تاپ','تبلت','خانه','پوشاک','لوازم جانبی'];
  return terms.some(function(term){
    var t=norm(term);
    if(!t||s.indexOf(t)===-1)return false;
    if(s!==t && genericTerms.indexOf(t)!==-1 &&
       /(?:قاب|کاور|گلس|محافظ|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|مبدل|لوازم\s*جانبی|اکسسوری)/i.test(s)) return false;
    return true;
  });
}
function generalStoreHasKnowledgeMatch(query,id){
  var item=kbItem(id);
  if(!item)return false;
  var s=norm(query);
  /* General marketplaces get a broader semantic eligibility window:
     their KB business domains describe broad inventory coverage, while the
     specialist path remains strictly product/alias driven. */
  var domains=Array.isArray(item.domains)?item.domains:[];
  return domains.some(function(domain){
    var terms=DOMAINS[domain]||[];
    if(!terms.length)return false;
    return terms.some(function(term){
      var t=norm(term);
      return t&&s.indexOf(t)!==-1;
    });
  });
}
function relevantGeneralStores(query,list){
  var queryDomain=domainForQuery(query);
  if(queryDomain&&VEHICLE_TRANSACTION_DOMAINS.indexOf(queryDomain.domain)!==-1)return [];
  return (Array.isArray(list)?list:[]).filter(function(store){
    if(!store||!isGeneralStore(store.id))return false;
    var id=String(store.id||'').toLowerCase();
    /* The four broad marketplaces may use their category coverage as a
       semantic signal. Esam and MeMarket are deliberately stricter: they
       enter only on a direct KB product/alias match. */
    /* General marketplaces are eligible only when their own merchant
     * product/alias catalog matches the query. Shared domain vocabulary must
     * never promote a marketplace merely because it operates in that domain. */
    return generalStoreHasCurrentCategoryMatch(query,id);
  });
}
var ALWAYS_INCLUDED_STORE_IDS=[];
var NON_PRODUCT_DOMAINS=['travel_ticket','lodging','education','auto_service'];
var VEHICLE_TRANSACTION_DOMAINS=['auto_service'];
var currentEligibilityQuery='';
function rankEligibleStores(specialists,general){
  var ordered=(Array.isArray(specialists)?specialists:[]).concat(Array.isArray(general)?general:[]);
  var seen={};
  ordered=ordered.filter(function(store){
    var id=String(store&&store.id||'').toLowerCase();
    if(!id||seen[id])return false;
    seen[id]=true;
    return true;
  });
  var queryDomain=domainForQuery(currentEligibilityQuery||'');
  var allowAlwaysIncluded=!queryDomain||NON_PRODUCT_DOMAINS.indexOf(queryDomain.domain)===-1;
  if(!allowAlwaysIncluded)return orderStoresSpecialistFirst(ordered);
  ALWAYS_INCLUDED_STORE_IDS.forEach(function(id){
    if(seen[id])return;
    var item=kbItem(id);
    if(item){
      ordered.push({id:id,name:item.name||id});
      seen[id]=true;
    }
  });
  return orderStoresSpecialistFirst(ordered);
}

function specialtyStoresForQuery(query,stores){
  var out=knowledgeSpecialistsForQuery(query,mergedSourceList(stores));
  return out.length?out:null;
}

function domainForQuery(query){
  var s=norm(query),best=null;
  Object.keys(DOMAINS).forEach(function(domain){DOMAINS[domain].forEach(function(term){var t=norm(term);if(t&&s.indexOf(t)!==-1&&(!best||t.length>best.term.length))best={domain:domain,term:t};});});
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

function isCleaningTaskQuery(query){
  var s=norm(query);
  return /(?:تمیز\s*کردن|تمیزکاری|شستشو|شستن|نظافت|شوینده|پاک\s*کردن|پاکسازی|مبل\s*شویی|شستشوی\s*مبل)/i.test(s);
}

function semanticPlanForQuery(query){
  try{
    var p=root.DigiYarShoppingPlan;
    return p&&norm(p.query)===norm(query)&&p.ai?p.ai:null;
  }catch(_){return null;}
}

function semanticPlanText(ai){
  if(!ai)return '';
  return norm([ai.semanticNeed,ai.requestedProduct,ai.action,ai.taskType,ai.category,ai.useCase]
    .concat(Array.isArray(ai.productTerms)?ai.productTerms:[])
    .concat(Array.isArray(ai.requiredNameTerms)?ai.requiredNameTerms:[])
    .concat(Array.isArray(ai.attributes)?ai.attributes:[])
    .join(' '));
}

function semanticStoreEvidence(item,ai){
  if(!item||!ai)return false;
  var requested=norm(ai.requestedProduct||'');
  var terms=[].concat(ai.productTerms||[],ai.requiredNameTerms||[]).map(norm).filter(Boolean);
  var itemTerms=[].concat(item.products||[],item.aliases||[],item.specialties||[],item.productFamilies||[]).map(norm).filter(Boolean);
  if(!requested&&!terms.length)return false;
  return itemTerms.some(function(it){
    return requested && (it===requested||requested.indexOf(it)!==-1||it.indexOf(requested)!==-1);
  }) || terms.some(function(t){
    return itemTerms.some(function(it){return it===t||t.indexOf(it)!==-1||it.indexOf(t)!==-1;});
  });
}

function aiSelectionIsAllowed(query,id){
  var key=String(id||'').toLowerCase();
  var item=kbItem(key);
  if(!item)return false;
  var ai=semanticPlanForQuery(query);
  if(!ai)return false;
  var semanticText=semanticPlanText(ai);
  var task=norm(ai.taskType||'');
  var action=norm(ai.action||'');

  /* The AI has already performed open-vocabulary semantic reasoning. This
     validator must NOT re-interpret the raw user sentence. It only checks
     the semantic plan against the canonical merchant KB. */
  var exclusions=[].concat(item.exclude||[]).map(norm).filter(Boolean);
  if(exclusions.some(function(term){return semanticText.indexOf(term)!==-1;}))return false;

  if(key==='takhfifan'&&!/(?:discount|promotion|coupon|offer|تخفیف|کد\s*تخفیف|پیشنهاد\s*ویژه|خدمات\s*تخفیفی)/i.test(semanticText))return false;

  /* A furniture merchant is not eligible merely because the target object is
     furniture. For tool/material tasks, evidence must be for the requested
     product itself. */
  if((task==='find_tool_for_target'||task==='find_product_for_task'||/(?:تمیز|شست|نظافت|پاک)/i.test(action)) &&
     ((item.intents||[]).indexOf('furniture')!==-1 || (item.domains||[]).indexOf('furniture')!==-1) &&
     !semanticStoreEvidence(item,ai)) return false;

  /* Specialist merchants need semantic product evidence. Domain alone is not
     enough; this is what prevents a mobile-accessory query from selecting a
     phone-only merchant, or a skincare query from selecting an unrelated
     health merchant. */
  if(!isGeneralStore(key) && !semanticStoreEvidence(item,ai)){
    var domains=Array.isArray(ai.domains)?ai.domains.map(norm):[];
    var merchantDomains=(item.domains||[]).map(norm);
    var shared=domains.some(function(d){return merchantDomains.indexOf(d)!==-1;});
    /* Explicit specialist intent may be enough only when the merchant itself
       declares that exact intent. */
    var declaredIntent=(item.intents||[]).map(norm);
    if(!(shared&&declaredIntent.some(function(i){return domains.indexOf(i)!==-1;})))return false;
  }

  if(key==='janebi' && /(?:^|\\s)(?:موبایل|گوشی)(?:\\s|$)/i.test(norm(ai.requestedProduct||'')) &&
     !/(?:جانبی|اکسسوری|قاب|کاور|شارژر|کابل|گلس|پاوربانک|هندزفری|هدفون|ایرباد|هولدر|مبدل)/i.test(semanticText)) return false;

  return true;
}
function aiSelectedStores(query,list){
  try{
    var p=root.DigiYarShoppingPlan;
    if(!p||norm(p.query)!==norm(query)||!p.ai||!Array.isArray(p.ai.eligibleStoreIds)) return null;

    /*
     * The AI plan is the open-vocabulary bridge. Its IDs are still bounded by
     * the real merchant catalog (mergedSourceList), so the model cannot invent
     * a merchant, but a new synonym/description does not need a literal KB
     * product term anymore.
     *
     * Deterministic KB specialists remain first-class: AI may add a genuinely
     * relevant merchant, but it never removes a specialist already proven by
     * the deterministic resolver.
     */
    var source=Array.isArray(list)?list:[];
    var byId={};
    source.forEach(function(store){
      if(store&&store.id)byId[String(store.id).toLowerCase()]=store;
    });

    var selected=[];
    var seen={};
    p.ai.eligibleStoreIds.forEach(function(rawId){
      var id=String(rawId||'').toLowerCase();
      if(!id||seen[id])return;
      var store=byId[id];
      if(store&&aiSelectionIsAllowed(query,id)){
        selected.push(store);
        seen[id]=true;
      }
    });

    return selected.length?selected:[];
  }catch(_){return null;}
}
function mergeAiExpansion(query, deterministicSpecialists, deterministicGeneral, list){
  var ai=aiSelectedStores(query,list);
  if(!ai||!ai.length)return null;

  var detIds={};
  (deterministicSpecialists||[]).concat(deterministicGeneral||[]).forEach(function(store){
    if(store&&store.id)detIds[String(store.id).toLowerCase()]=true;
  });

  /* AI is an open-vocabulary semantic expansion layer. It may introduce a
   * merchant for a synonym/product phrase that is not yet present in the
   * literal KB vocabulary, but it can only select IDs that already exist in
   * our merchant catalog. This keeps the resolver closed to hallucinated
   * stores while making the query vocabulary effectively open-ended. */
  var kb=getKB();
  var aiSpecialists=[],aiGeneral=[];
  ai.forEach(function(store){
    if(!store||!store.id)return;
    var id=String(store.id).toLowerCase();
    if(detIds[id]||!kbItem(id))return;
    if(isGeneralStore(id))aiGeneral.push(store);
    else aiSpecialists.push(store);
  });

  if(!aiSpecialists.length&&!aiGeneral.length)return null;
  return {
    specialists:(deterministicSpecialists||[]).concat(aiSpecialists),
    general:(deterministicGeneral||[]).concat(aiGeneral)
  };
}

function storesForQuery(query, stores){
  currentEligibilityQuery=query;
  var list=mergedSourceList(stores);

  /*
   * When the external AI planner returned a non-empty eligibleStoreIds list,
   * it is the authoritative semantic selection. Eligibility only validates
   * those IDs against the real merchant catalog; it must not add deterministic
   * specialists, broad marketplaces, or ALWAYS_INCLUDED stores afterwards.
   * This is the critical boundary between "AI selection" and "fallback
   * resolver".
   */
  var semanticPlan=semanticPlanForQuery(query);
  var aiSelected=aiSelectedStores(query,list);
  /*
   * Once semantic AI has answered, its merchant set is authoritative.
   * An empty set is still an answer: do not resurrect the legacy keyword
   * resolver, broad defaults, or specialist expansion. The only local work
   * permitted here is validation against the canonical merchant KB.
   */
  if(semanticPlan&&Array.isArray(semanticPlan.eligibleStoreIds)){
    return orderStoresSpecialistFirst(aiSelected||[]);
  }
  /* Deterministic KB rules remain authoritative for known vocabulary. AI is
   * used only to expand that boundary when it can semantically identify an
   * already-known merchant for a new/unlisted expression. */
  var specialty=specialtyStoresForQuery(query,list);
  var general=relevantGeneralStores(query,list);
  var aiExpanded=mergeAiExpansion(query,specialty||[],general,list);

  if(aiExpanded){
    specialty=aiExpanded.specialists;
    general=aiExpanded.general;
  }

  var hit=domainForQuery(query);
  var aiDomains=aiDomainHints(query);
  if(!hit&&aiDomains.length)hit={domain:aiDomains[0],term:null};

  if(specialty!==null&&specialty.length){
    return rankEligibleStores(specialty,general);
  }

  if(!hit){
    /* Unknown vocabulary: prefer AI's semantically grounded merchant
     * selection. If it found no specialist, retain the four broad-marketplace
     * safety net rather than leaking narrow marketplaces. */
    if(aiExpanded&&aiExpanded.specialists.length){
      return rankEligibleStores(aiExpanded.specialists,aiExpanded.general);
    }
    if(general.length)return rankEligibleStores([],general);
    if(aiExpanded&&aiExpanded.general.length)return rankEligibleStores([],aiExpanded.general);
    return list.filter(function(store){
      return store&&BROAD_GENERAL_STORE_IDS.indexOf(String(store.id||'').toLowerCase())!==-1;
    });
  }

  /* Known domain but no deterministic specialist: AI can now bridge the
   * vocabulary gap (for example a colloquial product name, synonym, or
   * natural-language description) without replacing the deterministic
   * general-marketplace set. */
  if(aiExpanded&&aiExpanded.specialists.length){
    return rankEligibleStores(aiExpanded.specialists,aiExpanded.general);
  }
  return rankEligibleStores([],general);
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
