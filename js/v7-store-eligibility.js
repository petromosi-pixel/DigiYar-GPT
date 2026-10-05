/* DigiYar V7 — query-driven store eligibility for Hooshyar Simulator
   Filters simulator tabs before rendering. It does not fetch an API and does not alter V6 profile flow.
*/
(function(root){
'use strict';
var VERSION='7.0.0-store-eligibility.33';

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
    if(terms.some(function(term){
      var t=norm(term);
      return t&&s.indexOf(t)!==-1;
    }))out.push(id);
  });
  return out;
}
function knowledgeSpecialistsForQuery(query,list){
  var ids=kbMatchedStoreIds(query),out=[];
  ids.forEach(function(id){
    var item=kbItem(id);
    if(!item||!item.matchPolicy||!item.matchPolicy.specialistFirst)return;
    var found=(Array.isArray(list)?list:[]).find(function(x){return x&&String(x.id||'').toLowerCase()===id;});
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
function generalStoreHasDirectProductMatch(query,id){
  var item=kbItem(id);
  if(!item)return false;
  var s=norm(query);
  var terms=[].concat(item.products||[],item.aliases||[]);
  return terms.some(function(term){
    var t=norm(term);
    return t&&s.indexOf(t)!==-1;
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
    if(BROAD_GENERAL_STORE_IDS.indexOf(id)!==-1){
      return generalStoreHasDirectProductMatch(query,id) || generalStoreHasKnowledgeMatch(query,id);
    }
    return generalStoreHasDirectProductMatch(query,id);
  });
}
var ALWAYS_INCLUDED_STORE_IDS=['digikala'];
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

function aiSelectedStores(query,list){
  try{
    var p=root.DigiYarShoppingPlan;
    if(!p||norm(p.query)!==norm(query)||!p.ai||!Array.isArray(p.ai.eligibleStoreIds)) return null;

    /*
     * When the merchant KB has a high-confidence specialist set, that set is
     * the authoritative eligibility boundary. AI can rank/interpret the
     * request, but it must not replace specialist merchants with unrelated
     * beauty/general merchants.
     */
    var kbSpecialists=specialtyStoresForQuery(query,list);
    if(kbSpecialists&&kbSpecialists.length){
      var hit=domainForQuery(query);
      var general=relevantGeneralStores(query,list);
      kbSpecialists.forEach(function(s){
        if(general.some(function(g){return String(g.id||'').toLowerCase()===String(s.id||'').toLowerCase();})){
          general=general.filter(function(g){return String(g.id||'').toLowerCase()!==String(s.id||'').toLowerCase();});
        }
      });
      return rankEligibleStores(kbSpecialists,general);
    }

    /* AI is an interpretation/ranking layer, not an eligibility authority.
     * When no KB specialist set exists, discard arbitrary AI-selected merchants
     * and fall back to the deterministic KB general-marketplace resolver.
     * This prevents category confusion (e.g. furniture queries returning
     * unrelated digital/mobile merchants simply because the model saw a broad
     * "furniture" type). */
    var deterministicGeneral=relevantGeneralStores(query,list);
    if(deterministicGeneral.length)return rankEligibleStores([],deterministicGeneral);
    return [];
  }catch(_){return null;}
}

function storesForQuery(query, stores){
  currentEligibilityQuery=query;
  var list=mergedSourceList(stores);
  /* The AI plan may rank merchants, but it must never bypass the
   * merchant knowledge-base eligibility boundary. Resolve eligibility
   * deterministically from the KB first, then let AI influence ordering only
   * through the already-qualified set. */ 
  var specialty=specialtyStoresForQuery(query,list);
  var hit=domainForQuery(query);
  var aiDomains=aiDomainHints(query);
  if(!hit&&aiDomains.length)hit={domain:aiDomains[0],term:null};

  if(specialty!==null){
    var general=relevantGeneralStores(query,list);
    return rankEligibleStores(specialty,general);
  }

  if(!hit){
    return list.filter(function(store){return store&&isGeneralStore(store.id);});
  }

  /* Never use a merchant's broad domain label as standalone eligibility.
   * A store may have a generic domain such as "furniture" in metadata while
   * actually being irrelevant to the requested product. At this stage only
   * the KB product/alias resolver plus the general-marketplace semantic window
   * are authoritative. */
  var fallbackSpecialists=knowledgeSpecialistsForQuery(query,list);
  var fallbackGeneral=relevantGeneralStores(query,list);
  return rankEligibleStores(fallbackSpecialists||[],fallbackGeneral);
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
