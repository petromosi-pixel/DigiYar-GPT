/* DigiYar V7 — query-driven store eligibility for Hooshyar Simulator
   Filters simulator tabs before rendering. It does not fetch an API and does not alter V6 profile flow.
*/
(function(root){
'use strict';
var VERSION='7.0.0-store-eligibility.16';

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
    if(kbSignals(item).some(function(term){var t=norm(term);return t&&s.indexOf(t)!==-1;}))out.push(id);
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

var GENERAL_STORE_IDS=['digikala','snappshop','torob','basalam','esam','memarket'];
function isSpecialistStore(id){return !isGeneralStore(id);}
function orderStoresSpecialistFirst(list){return (Array.isArray(list)?list:[]).slice().sort(function(a,b){var as=isSpecialistStore(a&&a.id),bs=isSpecialistStore(b&&b.id);return as===bs?0:(as?-1:1);});}
function isGeneralStore(id){return GENERAL_STORE_IDS.indexOf(String(id||'').toLowerCase())!==-1;}

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
    /* Once the AI planner has answered for this exact query, its store
       selection is authoritative — including an intentional empty array.
       Never fall back to the old keyword/domain engine after an AI answer. */
    if(!p||norm(p.query)!==norm(query)||!p.ai||!Array.isArray(p.ai.eligibleStoreIds)) return null;
    var ids=p.ai.eligibleStoreIds.map(function(x){return String(x||'').toLowerCase();});
    var selected=list.filter(function(x){return x&&ids.indexOf(String(x.id||'').toLowerCase())!==-1;});
    /* AI ids are authoritative. Do not discard a valid AI-selected store merely
       because it is not present in the Popular Stores runtime list. The Store
       Browser has its own SEARCH/STORE_NAMES registry and can render these ids. */
    ids.forEach(function(id){
      if(!id||selected.some(function(x){return String(x.id||'').toLowerCase()===id;})) return;
      if(Object.prototype.hasOwnProperty.call(STORE_DOMAINS,id)){
        selected.push({id:id,name:id});
      }
    });
    return orderStoresSpecialistFirst(selected);
  }catch(_){return null;}
}

function storesForQuery(query, stores){
  var list=mergedSourceList(stores);
  var aiSelected=aiSelectedStores(query,list);
  if(aiSelected!==null)return aiSelected;

  var specialty=specialtyStoresForQuery(query,list);
  var hit=domainForQuery(query);
  var aiDomains=aiDomainHints(query);
  if(!hit&&aiDomains.length)hit={domain:aiDomains[0],term:null};

  if(specialty!==null){
    if(!hit)return orderStoresSpecialistFirst(specialty);
    var general=list.filter(function(store){
      if(!store||!isGeneralStore(store.id))return false;
      var domains=STORE_DOMAINS[String(store.id||'').toLowerCase()];
      return Array.isArray(domains)&&domains.indexOf(hit.domain)!==-1;
    });
    general.forEach(function(g){
      if(!specialty.some(function(s){return String(s.id||'').toLowerCase()===String(g.id||'').toLowerCase();}))specialty.push(g);
    });
    return orderStoresSpecialistFirst(specialty);
  }

  if(!hit){
    return list.filter(function(store){return store&&isGeneralStore(store.id);});
  }
  return list.filter(function(store){
    if(!store||!store.id)return false;
    var domains=STORE_DOMAINS[String(store.id).toLowerCase()];
    return Array.isArray(domains)&&domains.indexOf(hit.domain)!==-1;
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
