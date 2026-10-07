/* DigiYar V7 — Hooshyar semantic AI orchestrator
 * Hooshyar is the semantic brain of DigiYar.
 *
 * Architecture:
 * user language -> AI semantic understanding -> canonical DigiYar KB
 * -> semantic merchant reasoning -> merchant search plan -> Store Browser.
 *
 * This file deliberately contains NO product/merchant keyword rules.
 * The AI endpoint owns open-vocabulary interpretation. The local layer only
 * assembles canonical knowledge and safely publishes the returned plan.
 */
(function(window){
  'use strict';

  const VERSION='7.0.0-ai-shopping-orchestrator.17';

  function clean(value){
    return String(value==null?'':value).replace(/\s+/g,' ').trim();
  }

  function buildStoreCatalog(){
    const popular=Array.isArray(window.DigiYarPopularAffiliateStores)
      ?window.DigiYarPopularAffiliateStores:[];
    const categories=window.DigiYarStoreCategories&&typeof window.DigiYarStoreCategories==='object'
      ?window.DigiYarStoreCategories:{};
    const root=window.DigiYarStoreBusinessDomains;
    const businessCatalog=root&&typeof root.forAI==='function'?root.forAI():{};
    const catalog={};

    Object.keys(businessCatalog||{}).forEach(function(id){
      const b=businessCatalog[id]||{};
      catalog[String(id).toLowerCase()]={
        id:String(id).toLowerCase(),
        name:String(b.name||id),
        domains:Array.isArray(b.domains)?b.domains.slice():[],
        businessDomain:Array.isArray(b.domains)?b.domains.slice():[],
        intents:Array.isArray(b.intents)?b.intents.slice():[],
        specialties:Array.isArray(b.specialties)?b.specialties.slice():[],
        productFamilies:Array.isArray(b.productFamilies)?b.productFamilies.slice():[],
        products:Array.isArray(b.products)?b.products.slice():[],
        aliases:Array.isArray(b.aliases)?b.aliases.slice():[],
        querySignals:Array.isArray(b.querySignals)?b.querySignals.slice():[],
        exclusions:Array.isArray(b.exclude)?b.exclude.slice():[],
        matchPolicy:b.matchPolicy||null,
        semanticText:String(b.semanticText||'')
      };
    });

    Object.keys(categories).forEach(function(id){
      const key=String(id).toLowerCase();
      const existing=catalog[key]||{id:key,name:key};
      existing.categories=Array.isArray(categories[id])?categories[id].slice():[];
      catalog[key]=existing;
    });

    popular.forEach(function(store){
      if(!store||!store.id)return;
      const id=String(store.id).toLowerCase();
      const existing=catalog[id]||{id:id,name:id};
      catalog[id]={
        ...existing,
        name:String(store.name||existing.name||id),
        tagline:String(store.tagline||'').trim(),
        dealText:String(store.dealText||'').trim(),
        tag:String(store.tag||'').trim()
      };
    });

    return catalog;
  }

  function buildPlan(query,context){
    const raw=clean(query);
    return {
      version:VERSION,
      query:raw,
      intent:'shopping_search',
      context:context&&typeof context==='object'?context:{},
      tools:[
        {name:'search_products',enabled:true,source:'store-browser'},
        {name:'compare_products',enabled:true,source:'existing-result-set'},
        {name:'get_store_status',enabled:true,source:'merchant-registry'},
        {name:'get_affiliate_link',enabled:true,source:'affiliate-registry'}
      ],
      dataPolicy:'AI interprets intent and merchant relevance; product facts come only from store results; AI must not invent products, prices or availability.'
    };
  }

  async function callAI(query,context){
    const endpoint=window.DigiYarAIEndpoint||'https://digi-yar-core-git-main-digi-yar.vercel.app/api/ai-shopping';
    const storeCatalog=buildStoreCatalog();
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        query:query,
        context:context||{},
        storeCatalog:storeCatalog
      })
    });
    if(!response.ok)throw Error('AI endpoint '+response.status);
    const data=await response.json();
    return data&&data.plan&&typeof data.plan==='object'?data.plan:null;
  }

  async function run(query,context){
    const raw=clean(query);
    const plan=buildPlan(raw,context);
    try{
      const aiPlan=await callAI(raw,context);
      if(!aiPlan)throw Error('empty_ai_plan');

      /*
       * The AI plan is authoritative even when eligibleStoreIds is empty.
       * An empty semantic answer means "no merchant has enough evidence";
       * it must not trigger the old keyword/default-store expansion.
       */
      plan.ai=aiPlan;
      plan.candidateStores=Array.isArray(aiPlan.eligibleStoreIds)
        ?aiPlan.eligibleStoreIds.slice():[];
      plan.provider='semantic-ai';
      plan.semantic=true;
    }catch(error){
      /*
       * Provider outage is operational failure, not a semantic answer.
       * Keep ai absent so the safety resolver may provide a degraded result.
       */
      plan.provider='semantic-ai-error-fallback';
      plan.semantic=false;
      plan.aiError=String(error&&error.message||error||'ai_error');
      console.warn('Hooshyar semantic AI unavailable; using safety fallback.',error);
    }

    window.DigiYarShoppingPlan=plan;
    window.dispatchEvent(new CustomEvent('digiyar:shopping-plan-ready',{detail:plan}));
    return plan;
  }

  window.DigiYarShoppingOrchestrator={
    version:VERSION,
    buildStoreCatalog:buildStoreCatalog,
    buildPlan:buildPlan,
    run:run
  };
})(window);
