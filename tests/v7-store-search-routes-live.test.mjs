import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
  DigiYarStoreCategories: {}, DigiYarShoppingPlan: null,
  DigiYarAffiliateUrls: {}, DigiYarPopularAffiliateStores: []
};
globalThis.document = {
  getElementById() { return null; },
  createElement() { return { style: {}, appendChild() {}, addEventListener() {} }; },
  head: { appendChild() {} }
};
await import('../js/store-business-domains.js');
await import('../js/v7-store-eligibility.js');
await import('../js/v7-ai-shopping-orchestrator.js');
await import('../js/v6-store-browser.js');

const catalog = window.DigiYarStoreBusinessDomains.catalog;
const resolver = window.DigiYarStoreBrowser.resolveSearchUrl;
const ids = Object.keys(catalog);
const query = 'دستگاه تصفیه هوا';
const apiScenarios = [
  {name:'train-ticket',query:'از تهران می‌خوام برم مشهد با قطار',expected:['raja','ghasedak24','mrbilit','safarmarket']},
  {name:'furniture-cleaning',query:'یه چیزی می‌خوام که برای تمیز کردن مبل پارچه‌ای مناسب باشه',expected:['digikala','snappshop','torob','basalam'],forbidden:['iranmiz','partochoob','chidahome','tidawood']},
  {name:'samsung-phone',query:'یه گوشی سامسونگ می‌خوام',expected:['digikala','snappshop','torob','digido','digiland','technolife']},
  {name:'air-purifier-natural-language',query:'می‌خوام هوای اتاق خواب تمیز و پاک باشه',expected:['digikala','snappshop','torob','basalam']}
];
const apiSmokeResults = [];
for (const scenario of apiScenarios) {
  const result = {name:scenario.name,status:'unverified',provider:null,error:null,eligibleStoreIds:[]};
  try {
    const response = await fetch('https://digi-yar-core-git-main-digi-yar.vercel.app/api/ai-shopping', {
      method:'POST',redirect:'follow',signal:AbortSignal.timeout(12000),
      headers:{'content-type':'application/json',origin:'https://petromosi-pixel.github.io'},
      body:JSON.stringify({query:scenario.query,storeCatalog:Object.fromEntries(Object.entries(catalog).map(([id,item])=>[id,item]))})
    });
    result.status=response.status;
    if(response.ok){
      const data=await response.json();
      result.provider=data.provider||null;
      result.eligibleStoreIds=data.plan&&Array.isArray(data.plan.eligibleStoreIds)?data.plan.eligibleStoreIds:[];
      if(!data.ok||!data.plan||!Array.isArray(data.plan.eligibleStoreIds))result.error='invalid_plan';
      else if(!['openrouter','local-knowledge-base'].includes(data.provider))result.error='unexpected_provider';
      else if(data.provider==='local-knowledge-base'&&data.warning!=='semantic_ai_unconfigured')result.error='fallback_not_disclosed';
      else {
        const missing=(scenario.expected||[]).filter(id=>!result.eligibleStoreIds.includes(id));
        const forbidden=(scenario.forbidden||[]).filter(id=>result.eligibleStoreIds.includes(id));
        if(missing.length)result.error='missing_expected:'+missing.join(',');
        if(forbidden.length)result.error='unexpected_forbidden:'+forbidden.join(',');
      }
    }else result.error=(await response.text()).slice(0,180);
  }catch(error){result.error=String(error&&error.message||error);}
  apiSmokeResults.push(result);
}
console.log('LIVE_SEMANTIC_API_SMOKE '+JSON.stringify(apiSmokeResults));
assert.ok(apiSmokeResults.every(x=>x.status===200&&x.error===null),
  `semantic planner scenarios failed: ${JSON.stringify(apiSmokeResults)}`);
const results = [];
let next = 0;
async function worker() {
  while (true) {
    const index = next++;
    if (index >= ids.length) return;
    const id = ids[index];
    const storeQuery = id === 'modiseh' || id === 'janebi' ? 'کیف اداری' : id === 'dayan' ? 'لباس مردانه' : query;
    const url = resolver(id, storeQuery);
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(7000),
        headers: { 'user-agent': 'DigiYar-RouteSmokeTest/1.0', 'accept': 'text/html,application/xhtml+xml' }
      });
      const status = response.status;
      try { await response.body?.cancel(); } catch {}
      results.push({ id, status, url: response.url || url });
    } catch (error) {
      results.push({ id, status: 'unverified', error: String(error && error.message || error), url });
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
const dead = results.filter(x => x.status === 404 || x.status === 410);
const reachable = results.filter(x => typeof x.status === 'number' && x.status >= 200 && x.status < 400);
const restricted = results.filter(x => [401, 403, 429].includes(x.status));
const serverErrors = results.filter(x => typeof x.status === 'number' && x.status >= 500);
const unverified = results.filter(x => x.status === 'unverified');
console.log(JSON.stringify({
  checked: results.length,
  reachable: reachable.length,
  restrictedBySite: restricted.length,
  serverErrors: serverErrors.length,
  unverified: unverified.length,
  deadRoutes: dead
}, null, 2));
assert.equal(results.length, ids.length, 'every catalog merchant must be probed');
assert.deepEqual(dead, [], 'dead 404/410 merchant routes must be corrected');
