/* DigiYar V7 — AI Shopping Orchestrator
 * Small, provider-agnostic shopping brain.
 * Current mode is deterministic/local: it never invents product data
 * and never performs network/store API calls.
 *
 * A future AI provider can be attached through:
 *   window.DigiYarAIProvider = { understand(query, context) { ... } }
 */
(function(window){
  'use strict';

  const VERSION='7.0.0-ai-shopping-orchestrator.13';

  const STORE_IDS=['digikala','snappshop','torob','basalam','esam','technolife','digido','gooshishop','berozkala','janebi','khanoumi','banimode','modiseh','pinket','solokala','dayan','memarket'];

  const TYPE_PATTERNS=[
    {type:'mobile',words:['موبایل','گوشی','smartphone','mobile']},
    {type:'laptop',words:['لپ تاپ','لپ‌تاپ','نوت بوک','notebook','laptop']},
    {type:'tablet',words:['تبلت','tablet']},
    {type:'monitor',words:['مانیتور','monitor']},
    {type:'tv',words:['تلویزیون','tv','تلوزیون']},
    {type:'furniture',words:['مبل','مبلمان','صندلی','میز','میز اداری','مبلمان اداری']},
    {type:'clothing',words:['لباس','پیراهن','شلوار','کفش','کت','هودی','مانتو']},
    {type:'home-appliance',words:['یخچال','لباسشویی','جاروبرقی','مایکروویو','لوازم خانگی']},
    {type:'digital',words:['کالای دیجیتال','هارد','فلش','هدفون','هندزفری','کیبورد','ماوس']}
  ];

  const BRAND_PATTERNS=[
    'سامسونگ','اپل','شیائومی','هواوی','آنر','ایسوس','لنوو','اچ‌پی','hp',
    'دل','dell','سونی','ال‌جی','lg','پارس خزر','جی‌پلاس','اسنوا'
  ];

  function normalizeDigits(value){
    return String(value||'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
  }

  function clean(value){
    return String(value||'').replace(/\s+/g,' ').trim();
  }

  function parseMoney(query){
    const q=normalizeDigits(query).replace(/,/g,'');
    const nums=[...q.matchAll(/(\d+(?:\.\d+)?)\s*(میلیون|م|هزار|تومان|ریال)?/gi)];
    if(!nums.length)return {min:null,max:null,currency:'toman'};
    const values=nums.map(m=>{
      let n=Number(m[1]);
      const unit=(m[2]||'').toLowerCase();
      if(unit==='میلیون'||unit==='م')n*=1000000;
      else if(unit==='هزار')n*=1000;
      return n;
    });
    if(/\b(?:تا|الی|-|و)\b|تا/.test(q) && values.length>=2){
      return {min:Math.min(values[0],values[1]),max:Math.max(values[0],values[1]),currency:'toman'};
    }
    if(/زیر|حداکثر|تا/.test(q))return {min:null,max:values[0],currency:'toman'};
    if(/بالای|بیشتر از|حداقل/.test(q))return {min:values[0],max:null,currency:'toman'};
    return {min:null,max:values[0],currency:'toman'};
  }

  function firstMatch(q, patterns){
    const found=patterns.find(x=>x.words.some(w=>q.toLowerCase().includes(w.toLowerCase())));
    return found?found.type:null;
  }

  function findBrand(q){
    const lower=q.toLowerCase();
    return BRAND_PATTERNS.find(b=>lower.includes(b.toLowerCase()))||null;
  }

  function understand(query, context){
    const raw=clean(query);
    const q=normalizeDigits(raw);
    const budget=parseMoney(q);
    const type=firstMatch(q,TYPE_PATTERNS);
    const brand=findBrand(q);
    const useCaseMatch=q.match(/برای\s+(.{2,35}?)(?=\s+(?:با|در|تا|حدود|بودجه)|$)/);
    return {
      version:VERSION,
      query:raw,
      intent:'shopping_search',
      category:type,
      brand:brand,
      budget:budget,
      useCase:useCaseMatch?clean(useCaseMatch[1]):null,
      keywords:raw.split(/\s+/).filter(Boolean).slice(0,18),
      constraints:context&&context.constraints||{},
      confidence:{category:type?0.9:0.35,brand:brand?0.95:0.2,budget:(budget.min||budget.max)?0.9:0.2}
    };
  }

  function storesFor(plan){
    const eligibility=window.DigiYarStoreEligibility;
    if(eligibility&&typeof eligibility.storesForQuery==='function'){
      try{
        const source=window.DigiYarPopularAffiliateStores;
        const list=Array.isArray(source)?source:[];
        return eligibility.storesForQuery(plan.query,list).filter(x=>x&&x.id).map(x=>x.id);
      }catch(_){}
    }
    return STORE_IDS.slice();
  }

  function buildPlan(query,context){
    const understanding=understand(query,context);
    return {
      ...understanding,
      tools:[
        {name:'search_products',enabled:true,source:'existing-result-set-or-local-producer'},
        {name:'compare_products',enabled:true,source:'existing-result-set'},
        {name:'get_store_status',enabled:true,source:'store-eligibility'},
        {name:'get_affiliate_link',enabled:true,source:'affiliate-registry'}
      ],
      candidateStores:[],
      dataPolicy:'product facts must come from the Result Set; AI may interpret but never invent them'
    };
  }

  async function run(query,context){
    const plan=buildPlan(query,context);
    const provider=window.DigiYarAIProvider || {
      async understand(q,ctx){
        const endpoint=window.DigiYarAIEndpoint||'/api/ai-shopping';
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q,context:ctx||{}})});
        if(!r.ok)throw Error('AI endpoint '+r.status);
        const data=await r.json(); return data&&data.plan?data.plan:null;
      }
    };
    if(provider&&typeof provider.understand==='function'){
      try{
        /* Build the AI catalog independently of the Popular Stores runtime.
         * The Hooshyar submit can fire before the Popular Stores array has been
         * populated, while DigiYarStoreCategories is already the canonical
         * store-domain source. An empty catalog makes the API's allowed-id
         * filter erase every eligibleStoreId and produces the misleading
         * "no related store" message. */
        const popular=Array.isArray(window.DigiYarPopularAffiliateStores)?window.DigiYarPopularAffiliateStores:[];
        const categories=window.DigiYarStoreCategories&&typeof window.DigiYarStoreCategories==='object'?window.DigiYarStoreCategories:{};
        const businessRoot=window.DigiYarStoreBusinessDomains;
        const businessCatalog=businessRoot&&typeof businessRoot.forAI==='function'?businessRoot.forAI():{};
        const storeCatalog={};
        /* Business-domain knowledge is the primary grounding source. Visual
         * Popular Stores metadata is only supplemental context and must never
         * replace the detailed merchant knowledge base. */
        Object.keys(businessCatalog).forEach(function(id){
          const b=businessCatalog[id]||{};
          storeCatalog[id]={
            name:String(b.name||id),
            businessDomain:b.domains||[],
            specialties:b.specialties||[],
            productFamilies:b.products||[],
            aliases:b.aliases||[],
            exclusions:b.exclude||[]
          };
        });
        Object.keys(categories).forEach(function(id){
          const key=String(id).toLowerCase();
          const subtitle=Array.isArray(categories[id])?categories[id].slice():[];
          const existing=storeCatalog[key]||{name:key};
          existing.categories=subtitle;
          storeCatalog[key]=existing;
        });
        popular.forEach(function(store){
          if(!store||!store.id)return;
          const id=String(store.id).toLowerCase();
          const existing=storeCatalog[id]||{name:id};
          storeCatalog[id]={
            ...existing,
            name:String(store.name||existing.name||id),
            tagline:String(store.tagline||'').trim(),
            dealText:String(store.dealText||'').trim(),
            tag:String(store.tag||'').trim()
          };
        });
        /* Mobile specialists that must remain visible for any clear mobile/phone
         * intent. Their domain metadata is also supplied to AI even when a store
         * is not present in Popular Stores at submit time. */
        const mobileCatalog={
          digido:{name:'دیجی‌دو',tagline:'موبایل و لوازم جانبی',categories:['digital']},
          janebi:{name:'جانبی',tagline:'فروشگاه اینترنتی لوازم جانبی',categories:['digital']},
          digiland:{name:'دیجی‌لند',tagline:'فروشگاه تخصصی کالای دیجیتال و گیمینگ',categories:['digital']},
          takhfifan:{name:'تخفیفان',tagline:'پیشنهادها و تخفیف‌های آنلاین',categories:['digital']},
          berozkala:{name:'بروز کالا',tagline:'کالای دیجیتال و ماشین اداری',categories:['digital']},
          gooshishop:{name:'گوشی شاپ',tagline:'فروشگاه اینترنتی موبایل',categories:['digital']},
          technolife:{name:'تکنولایف',tagline:'فروشگاه آنلاین موبایل و کالاهای دیجیتال',categories:['digital']},
          meghdadit:{name:'مقداد آی‌تی',tagline:'فروشگاه اینترنتی آی‌تی، موبایل و کالای دیجیتال',categories:['digital']}
        };
        Object.keys(mobileCatalog).forEach(function(id){
          if(!storeCatalog[id])storeCatalog[id]=mobileCatalog[id];
        });
        const domainCatalog=window.DigiYarStoreEligibility&&window.DigiYarStoreEligibility.storeDomains||{};
        Object.keys(domainCatalog).forEach(function(id){
          const key=String(id).toLowerCase();
          if(!storeCatalog[key])storeCatalog[key]={name:key,description:'',categories:[],domains:domainCatalog[id]};
          else storeCatalog[key].domains=domainCatalog[id];
        });
        const aiPlan=await provider.understand(query,{plan,context:context||{},storeCatalog:storeCatalog});
        if(aiPlan&&typeof aiPlan==='object'&&Array.isArray(aiPlan.eligibleStoreIds)&&aiPlan.eligibleStoreIds.length){
          plan.ai=aiPlan;
          plan.candidateStores=aiPlan.eligibleStoreIds.slice();
          /* A mobile query has a known specialist set that the user explicitly
           * expects to see. AI may rank them, but must not accidentally omit one
           * because a single merchant description was underweighted. */
          if(plan.category==='mobile'){
            const mobileRequired=['digido','janebi','digiland','takhfifan','berozkala','gooshishop','technolife','meghdadit'];
            mobileRequired.forEach(function(id){
              if(plan.candidateStores.indexOf(id)===-1)plan.candidateStores.push(id);
            });
            plan.ai.eligibleStoreIds=plan.candidateStores.slice();
          }
          plan.provider='external-ai';
        }else{
          /* An empty/failed AI answer must not erase the proven V6/V7
           * deterministic eligibility path. Leaving plan.ai unset makes
           * Store Eligibility continue with its semantic/domain resolver. */
          delete plan.ai;
          plan.candidateStores=[];
          plan.provider='external-ai-empty-fallback';
        }
      }catch(error){
        console.warn('DigiYar AI provider unavailable; restoring deterministic store eligibility.',error);
        /* A transport/provider failure is not an AI answer. Keep plan.ai absent
           so v7-store-eligibility can execute its deterministic/domain fallback. */
        delete plan.ai;
        plan.candidateStores=[];
        plan.provider='external-ai-error-fallback';
      }
    }
    window.DigiYarShoppingPlan=plan;
    window.dispatchEvent(new CustomEvent('digiyar:shopping-plan-ready',{detail:plan}));
    return plan;
  }

  window.DigiYarShoppingOrchestrator={
    version:VERSION,
    understand:understand,
    buildPlan:buildPlan,
    run:run
  };
})(window);
