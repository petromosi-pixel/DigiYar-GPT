/* DigiYar V7 — provider-independent local-first Hooshyar planner.
 * A local merchant KB resolver always produces results immediately. A free
 * semantic API may refine them in the background, but never blocks search.
 * Product facts and prices still come only from the existing Store Browser.
 */
(function(window){
  'use strict';

  const VERSION='7.0.0-hooshyar-local.13';

  function clean(value){
    return String(value==null?'':value).replace(/\s+/g,' ').trim();
  }
  function expandTerms(values){
    return [].concat(values||[]).reduce((out,value)=>{
      if(value==null)return out;
      String(value).split(/[,،;؛\n]+/).map(term=>term.trim()).filter(Boolean).forEach(term=>out.push(term));
      return out;
    },[]);
  }
  function norm(value){
    return clean(value).replace(/[يى]/g,'ی').replace(/ك/g,'ک')
      .replace(/[\u200c]/g,' ').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/ضد\s*آفتاب|ضدآفتاب/g,'ضد آفتاب')
      .replace(/مرطوب\s*[-‌]?\s*کننده/g,'مرطوب کننده')
      .replace(/آب\s*رسان/g,'آبرسان')
      .replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/\s+/g,' ').toLowerCase();
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

  const AI_ENDPOINT='https://digi-yar-core-git-main-digi-yar.vercel.app/api/ai-shopping';
  const AI_TIMEOUT_MS=10500;

  async function requestSemanticPlan(query,catalog,provider){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),AI_TIMEOUT_MS);
    try{
      const response=await fetch(AI_ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({query:query,storeCatalog:catalog,provider:provider||window.DigiYarHooshyarAIProvider||'deepseek'}),
        signal:controller.signal
      });
      if(!response.ok)return null;
      const payload=await response.json();
      if(!payload||payload.ok!==true||!payload.plan||typeof payload.plan!=='object')return null;
      payload.plan.__provider=String(payload.provider||'unknown');
      return payload.plan;
    }catch(_){return null;}
    finally{clearTimeout(timeout);}
  }

  function classifyLocalNeed(query){
    const q=norm(query);
    const ticketIntent=/(?:بلیط|بلیت|رزرو|سفر|می\s*خوام\s*برم|می\s*خواهم\s*بروم|حرکت\s*از)/i.test(q);
    if(ticketIntent&&/(?:قطار|ریل|هواپیما|پرواز|اتوبوس)/i.test(q)){
      const mode=/(?:قطار|ریل)/i.test(q)?'قطار':(/(?:اتوبوس)/i.test(q)?'اتوبوس':'هواپیما');
      const stores=mode==='قطار'
        ?['shab','safarme','raja','ghasedak24','mrbilit','trip','safarmarket','alibaba']
        :mode==='اتوبوس'?['ghasedak24','mrbilit','safarmarket','alibaba']:['alibaba','flytoday','ghasedak24','mrbilit','safarmarket','trip','flysepehran'];
      return {kind:'travel_ticket',product:'بلیط '+mode,category:'travel_ticket',domains:['travel_ticket'],stores:stores,targetObject:null,taskType:'ticket_search'};
    }
    if(/(?:تصفیه\s*هوا|دستگاه\s*تصفیه|پاکسازی\s*هوا|هوای\s*(?:اتاق|خانه).{0,18}(?:تمیز|پاک|آلوده|گرد\s*و\s*غبار))/i.test(q)){
      return {kind:'air_purifier',product:'دستگاه تصفیه هوا',category:'home',domains:['home','digital'],stores:['digikala','snappshop','torob','basalam','memarket'],targetObject:null,taskType:'shopping_search'};
    }
    const accessoryIntent=/(?:قاب|کاور|گلس|محافظ\s*صفحه|محافظ\s*لنز|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری)/i.test(q);
    if(!accessoryIntent&&/(?:موبایل|گوشی|سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi)/i.test(q)){
      const brand=/(?:سامسونگ|samsung)/i.test(q)?'سامسونگ':/(?:آیفون|iphone)/i.test(q)?'آیفون':/(?:شیائومی|xiaomi)/i.test(q)?'شیائومی':'موبایل';
      const model=(q.match(/(?:galaxy\s*[a-z]?\s*\d{1,3}|iphone\s*\d{1,2}(?:\s*(?:pro|max|plus|ultra))?|\b[a-z]{1,4}\s*\d{1,3}\b)/i)||[])[0];
      const product='گوشی '+brand+(model?' '+model:'');
      return {kind:'mobile_phone',product:product,category:'digital',domains:['digital'],
        stores:['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'],
        targetObject:null,taskType:'shopping_search'};
    }
    if(/(?:پراید|خودرو|ماشین)/i.test(q) && /(?:می\s*خوام|می\s*خواهم|خرید|بخر|کم\s*کار|کار\s*کرده|اسنپ|تپسی)/i.test(q)){
      const model=(q.match(/پراید/)||[])[0];
      return {kind:'used_vehicle',product:model?'پراید کارکرده':'خودرو کارکرده',category:'auto_service',domains:['auto_service'],stores:['karnameh'],targetObject:null,taskType:'vehicle_purchase'};
    }
    return null;
  }

  function localNeed(query,catalog,eligibleIds,classified){
    const q=norm(query);
    const cleaning=/(تمیز\s*کردن|تمیزکاری|شستشو|شستن|نظافت|شوینده|پاک\s*کردن|پاکسازی|مبل\s*شویی|شستشوی\s*مبل)/i.test(q);
    const productMatches=[];
    Object.keys(catalog).forEach(id=>{
      const item=catalog[id]||{};
      if(cleaning&&Array.isArray(item.intents)&&item.intents.includes('furniture'))return;
      expandTerms([].concat(item.products||[],item.aliases||[],item.specialties||[],item.productFamilies||[])).forEach(term=>{
        const t=norm(term);
        if(t&&t.length>=3&&q.includes(t))productMatches.push(t);
      });
    });
    const unique=Array.from(new Set(productMatches)).sort((a,b)=>b.length-a.length);
    const combinedSkincare=/(?:مرطوب\s*کننده|آبرسان)/i.test(q)&&/(?:ضد\s*آفتاب|ضدآفتاب)/i.test(q);
    let requestedProduct=classified&&classified.product||(combinedSkincare?'کرم مرطوب کننده ضد آفتاب':(unique[0]||''));
    let targetObject=classified&&classified.targetObject||null;
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
    const storeProductQuery=classified&&classified.product
      ?(classified.taskType==='ticket_search'?clean(query):clean(classified.product))
      :((cleaning&&/(مبل|مبلمان|پارچه)/i.test(q))?'تمیزکننده مبل پارچه‌ای'
        :( /(?:قاب|کاور|گلس|محافظ\s*صفحه|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری)/i.test(q)&&/(?:موبایل|گوشی|سامسونگ|آیفون|samsung|iphone)/i.test(q)
          ?'لوازم جانبی موبایل':clean(query)));
    ids.forEach(id=>{queries[id]=storeProductQuery;});
    const domains=classified?classified.domains.slice():[];
    if(!classified){
      ids.forEach(id=>{
        const item=catalog[id]||{};
        (item.domains||[]).forEach(d=>{if(!domains.includes(d))domains.push(d);});
      });
    }
    return {
      version:VERSION,category:classified?classified.category:(domains[0]||'general'),brand:null,
      minBudgetToman:null,maxBudgetToman:null,useCase:targetObject?'نظافت مبل پارچه‌ای':null,
      domains:domains,taskType:classified?classified.taskType:(cleaning?'cleaning_task':'shopping_search'),
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

  function localPlanFor(query,context){
    const raw=clean(query);
    const plan=buildPlan(raw,context);
    const catalog=buildStoreCatalog();
    window.DigiYarShoppingPlan=plan;
    let stores=[];
    const eligibility=window.DigiYarStoreEligibility;
    const popular=Array.isArray(window.DigiYarPopularAffiliateStores)?window.DigiYarPopularAffiliateStores:[];
    const classified=classifyLocalNeed(raw);
    if(classified){
      stores=classified.stores.map(id=>({id,name:(catalog[id]&&catalog[id].name)||id}));
    }else if(eligibility&&typeof eligibility.storesForQuery==='function'){
      stores=eligibility.storesForQuery(raw,popular);
    }
    let ids=(Array.isArray(stores)?stores:[])
      .map(x=>String(x&&x.id||'').toLowerCase())
      .filter((id,i,a)=>catalog[id]&&a.indexOf(id)===i);
    const threeEngine=window.DigiYarHooshyarThreeEngine;
    const threeEngineResult=threeEngine&&typeof threeEngine.resolve==='function'
      ?threeEngine.resolve(raw,catalog,ids,classified):null;
    if(threeEngineResult&&Array.isArray(threeEngineResult.eligibleStoreIds)&&threeEngineResult.eligibleStoreIds.length){
      ids=threeEngineResult.eligibleStoreIds.filter((id,i,a)=>catalog[id]&&a.indexOf(id)===i);
    }
    plan.ai=localNeed(raw,catalog,ids,classified);
    if(threeEngineResult){
      plan.ai.engine='three-engine-local';
      plan.ai.semanticNeed=threeEngineResult.need.requestedProduct||plan.ai.semanticNeed;
      plan.ai.requestedProduct=threeEngineResult.need.requestedProduct||plan.ai.requestedProduct;
      plan.ai.brand=threeEngineResult.need.brand||null;
      plan.ai.maxBudgetToman=threeEngineResult.need.maxBudgetToman||null;
      plan.ai.attributes=threeEngineResult.need.attributes||[];
      plan.ai.targetObject=threeEngineResult.need.targetObject||plan.ai.targetObject;
      plan.ai.taskType=threeEngineResult.need.taskType||plan.ai.taskType;
      plan.ai.searchQueries=threeEngineResult.searchQueries;
      plan.ai.confidence=threeEngineResult.need.concept?0.78:(ids.length?0.55:0.2);
      plan.ai.engineTrace=threeEngineResult.trace;
    }
    plan.candidateStores=ids.slice();
    plan.provider='local-knowledge-base';
    plan.semantic=false;
    plan.mode='local-fallback';
    window.DigiYarShoppingPlan=plan;
    return {plan,catalog,raw};
  }

  function applySemanticPlan(plan,aiPlan,catalog){
    if(!aiPlan||!['openrouter','deepseek'].includes(aiPlan.__provider)||!Array.isArray(aiPlan.eligibleStoreIds))return false;
    const validIds=aiPlan.eligibleStoreIds.map(id=>String(id||'').toLowerCase())
      .filter((id,index,all)=>catalog[id]&&all.indexOf(id)===index);
    if(!validIds.length)return false;
    const queries={};
    Object.keys(aiPlan.searchQueries&&typeof aiPlan.searchQueries==='object'?aiPlan.searchQueries:{}).forEach(id=>{
      const key=String(id||'').toLowerCase();
      const value=clean(aiPlan.searchQueries[id]);
      if(validIds.includes(key)&&value)queries[key]=value;
    });
    const semanticProvider=aiPlan.__provider;
    aiPlan.eligibleStoreIds=validIds;
    aiPlan.searchQueries=queries;
    delete aiPlan.__provider;
    plan.ai=aiPlan;
    plan.candidateStores=validIds.slice();
    plan.provider=semanticProvider;
    plan.semantic=true;
    plan.mode='semantic-ai';
    window.DigiYarShoppingPlan=plan;
    window.dispatchEvent(new CustomEvent('digiyar:shopping-plan-ready',{detail:plan}));
    return true;
  }

  async function compareEngines(query,context){
    const built=localPlanFor(query,context);
    const provider=window.DigiYarHooshyarAIProvider||'deepseek';
    const aiPlan=await requestSemanticPlan(built.raw,built.catalog,provider);
    return {query:built.raw,local:{engine:'three-engine-local',plan:built.plan},ai:aiPlan?{provider:aiPlan.__provider||'unknown',plan:aiPlan}:null,catalogCount:Object.keys(built.catalog).length};
  }

  async function run(query,context){
    const built=localPlanFor(query,context);
    const plan=built.plan;
    const catalog=built.catalog;
    const raw=built.raw;

    // Never make shopping depend on an AI vendor. The local knowledge-base
    // plan is dispatched immediately; a configured free semantic model may
    // improve it in the background, but cannot block or erase the fallback.
    window.dispatchEvent(new CustomEvent('digiyar:shopping-plan-ready',{detail:plan}));
    if(window.DigiYarHooshyarSemanticApiEnabled!==false){
      requestSemanticPlan(raw,catalog,window.DigiYarHooshyarAIProvider||'deepseek').then(function(aiPlan){
        if(applySemanticPlan(plan,aiPlan,catalog))return;
        // A provider's own local fallback is deliberately ignored: our browser
        // resolver has the full current KB and remains the source of truth.
      }).catch(function(){});
    }
    return plan;
  }

  window.DigiYarShoppingOrchestrator={
    version:VERSION,buildStoreCatalog:buildStoreCatalog,classifyLocalNeed:classifyLocalNeed,buildPlan:buildPlan,requestSemanticPlan:requestSemanticPlan,compareEngines:compareEngines,run:run
  };
})(window);
