/* DigiYar V7 — unified local Hooshyar planner
 * No external AI provider and no API request.
 * The legacy local merchant KB + eligibility resolver selects relevant stores.
 * Product facts and prices still come only from the existing Store Browser.
 */
(function(window){
  'use strict';

  const VERSION='7.0.0-hooshyar-local.1';

  function clean(value){
    return String(value==null?'':value).replace(/\\s+/g,' ').trim();
  }
  function norm(value){
    return clean(value).replace(/[يى]/g,'ی').replace(/ك/g,'ک')
      .replace(/[\\u200c]/g,' ').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/\\s+/g,' ').toLowerCase();
  }

  function buildStoreCatalog(){
    const kb=window.DigiYarStoreBusinessDomains;
    const source=kb&&typeof kb.forAI==='function'?kb.forAI():{};
    const categories=window.DigiYarStoreCategories&&typeof window.DigiYarStoreCategories==='object'
      ?window.DigiYarStoreCategories:{};
    const catalog={};
    Object.keys(source).forEach(id=>{
      const item=source[id]||{};
      catalog[String(id).toLowerCase()]={
        id:String(id).toLowerCase(),name:String(item.name||id),
        domains:Array.isArray(item.domains)?item.domains.slice():[],
        intents:Array.isArray(item.intents)?item.intents.slice():[],
        specialties:Array.isArray(item.specialties)?item.specialties.slice():[],
        productFamilies:Array.isArray(item.productFamilies)?item.productFamilies.slice():[],
        products:Array.isArray(item.products)?item.products.slice():[],
        aliases:Array.isArray(item.aliases)?item.aliases.slice():[],
        querySignals:Array.isArray(item.querySignals)?item.querySignals.slice():[],
        exclusions:Array.isArray(item.exclude)?item.exclude.slice():[],
        matchPolicy:item.matchPolicy||null,semanticText:String(item.semanticText||'')
      };
    });
    Object.keys(categories).forEach(id=>{
      const key=String(id).toLowerCase();
      catalog[key]=Object.assign(catalog[key]||{id:key,name:key},{
        categories:Array.isArray(categories[id])?categories[id].slice():[]
      });
    });
    (Array.isArray(window.DigiYarPopularAffiliateStores)?window.DigiYarPopularAffiliateStores:[]).forEach(store=>{
      if(!store||!store.id)return;
      const key=String(store.id).toLowerCase();
      catalog[key]=Object.assign(catalog[key]||{id:key,name:key},{
        name:String(store.name||(catalog[key]&&catalog[key].name)||key)
      });
    });
    return catalog;
  }

  function localNeed(query,catalog,eligibleIds){
    const q=norm(query);
    const cleaning=/(تمیز\\s*کردن|تمیزکاری|شستشو|شستن|نظافت|شوینده|پاک\\s*کردن|پاکسازی|مبل\\s*شویی|شستشوی\\s*مبل)/i.test(q);
    const productMatches=[];
    Object.keys(catalog).forEach(id=>{
      const item=catalog[id]||{};
      if(cleaning&&Array.isArray(item.intents)&&item.intents.includes('furniture'))return;
      [].concat(item.products||[],item.aliases||[],item.specialties||[],item.productFamilies||[]).forEach(term=>{
        const t=norm(term);
        if(t&&t.length>=3&&q.includes(t))productMatches.push(t);
      });
    });
    const unique=Array.from(new Set(productMatches)).sort((a,b)=>b.length-a.length);
    let requestedProduct=unique[0]||'';
    let targetObject=null;
    if(cleaning&&/(مبل|مبلمان|پارچه)/i.test(q)){
      targetObject='مبل پارچه‌ای';
      if(!requestedProduct||/(مبل|مبلمان|صندلی|ناهارخوری)/i.test(requestedProduct)){
        requestedProduct=(/جارو|بخارشوی|شوینده|تمیزکننده/i.test(q)?unique.find(x=>/(جارو|بخارشوی|شوینده|تمیزکننده)/i.test(x)):'')||'محصول نظافت مبل پارچه‌ای';
      }
    }
    if(!requestedProduct){
      const eligibility=window.DigiYarStoreEligibility;
      const hit=eligibility&&typeof eligibility.domainForQuery==='function'?eligibility.domainForQuery(query):null;
      requestedProduct=hit&&hit.term?hit.term:'';
    }
    const ids=Array.isArray(eligibleIds)?eligibleIds.slice():[];
    const queries={};
    ids.forEach(id=>{queries[id]=requestedProduct||clean(query);});
    const domains=[];
    ids.forEach(id=>{
      const item=catalog[id]||{};
      (item.domains||[]).forEach(d=>{if(!domains.includes(d))domains.push(d);});
    });
    return {
      version:VERSION,category:domains[0]||'general',brand:null,
      minBudgetToman:null,maxBudgetToman:null,useCase:targetObject?'نظافت مبل پارچه‌ای':null,
      domains:domains,taskType:cleaning?'cleaning_task':'shopping_search',
      action:'find_relevant_stores',eligibleStoreIds:ids,
      productTerms:unique.slice(0,12),requiredNameTerms:[],excludedTerms:[],
      semanticNeed:clean(query),requestedProduct:requestedProduct||clean(query),
      targetObject:targetObject,attributes:[],searchQueries:queries,
      confidence:ids.length?0.65:0.2,mode:'local-knowledge-base'
    };
  }

  function buildPlan(query,context){
    return {
      version:VERSION,query:clean(query),intent:'shopping_search',
      context:context&&typeof context==='object'?context:{},
      provider:'local-knowledge-base',semantic:false,
      tools:[
        {name:'search_products',enabled:true,source:'store-browser'},
        {name:'compare_products',enabled:true,source:'existing-result-set'},
        {name:'get_store_status',enabled:true,source:'merchant-registry'},
        {name:'get_affiliate_link',enabled:true,source:'affiliate-registry'}
      ],
      dataPolicy:'Local KB selects merchants; product facts, prices and availability come only from existing store results.'
    };
  }

  async function run(query,context){
    const raw=clean(query);
    const plan=buildPlan(raw,context);
    // Publish a plan without an AI-shaped result first so the old local resolver
    // is not accidentally blocked by a stale result from a previous query.
    window.DigiYarShoppingPlan=plan;
    let stores=[];
    const eligibility=window.DigiYarStoreEligibility;
    const popular=Array.isArray(window.DigiYarPopularAffiliateStores)?window.DigiYarPopularAffiliateStores:[];
    if(eligibility&&typeof eligibility.storesForQuery==='function'){
      stores=eligibility.storesForQuery(raw,popular);
    }
    const ids=(Array.isArray(stores)?stores:[]).map(x=>String(x&&x.id||'').toLowerCase()).filter((id,i,a)=>id&&a.indexOf(id)===i);
    plan.ai=localNeed(raw,buildStoreCatalog(),ids);
    plan.candidateStores=ids.slice();
    plan.provider='local-knowledge-base';
    plan.semantic=false;
    plan.mode='local-fallback';
    window.DigiYarShoppingPlan=plan;
    window.dispatchEvent(new CustomEvent('digiyar:shopping-plan-ready',{detail:plan}));
    return plan;
  }

  window.DigiYarShoppingOrchestrator={
    version:VERSION,buildStoreCatalog:buildStoreCatalog,buildPlan:buildPlan,run:run
  };
})(window);
