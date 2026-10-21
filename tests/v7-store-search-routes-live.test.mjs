import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
  DigiYarStoreCategories: {}, DigiYarShoppingPlan: null,
  DigiYarAffiliateUrls: {}, DigiYarPopularAffiliateStores: []
};
globalThis.document = {
  readyState: 'loading', addEventListener() {}, getElementById() { return null; },
  createElement() { return { style: {}, appendChild() {}, addEventListener() {} }; },
  head: { appendChild() {} }
};

await import('../js/store-business-domains.js');
await import('../js/user-profile.js');
await import('../js/v7-store-eligibility.js');
await import('../js/v7-hooshyar-three-engine.js');
await import('../js/v7-ai-shopping-orchestrator.js');
await import('../js/v6-store-browser.js');

const scenarios = [
  { name:'air purifier', query:'می‌خوام هوای اتاق خواب تمیز و پاک باشه',
    visible:['digikala','snappshop','torob','basalam'],
    forbidden:['esam','takhfifan','memarket','divar','sheypoor'] },
  { name:'fabric sofa cleaning', query:'یه چیزی می‌خوام برای تمیز کردن مبل پارچه‌ای',
    visible:['digikala','snappshop','torob','basalam'],
    forbidden:['iranmiz','partochoob','chidahome','tidawood','janebi','esam','takhfifan','memarket'] },
  { name:'train tickets', query:'بلیط قطار تهران مشهد',
    visible:['ghasedak24','mrbilit','alibaba'],
    forbidden:['shab','safarme','eghamat24','jobama','flytoday','flysepehran','safarmarket','raja'] },
  { name:'mobile accessories', query:'لوازم جانبی موبایل',
    visible:['digikala','snappshop','torob','basalam','janebi','digido','gooshishop','technolife','digiland','berozkala'],
    forbidden:['dayan','takhfifan','esam','memarket'] },
  { name:'Samsung phone accessories', query:'لوازم جانبی گوشی سامسونگ',
    visible:['digikala','snappshop','torob','basalam','janebi','digido','gooshishop','technolife','digiland','berozkala'],
    forbidden:['dayan','meghdadit','takhfifan','esam','memarket'] },
  { name:'office bag', query:'کیف اداری برای محل کارم می‌خوام',
    visible:['digikala','snappshop','torob','basalam','janebi','dayan'],
    forbidden:['modiseh','jeanswest','memarket','esam','takhfifan'] },
  { name:'sunscreen for dry skin', query:'یه ضد آفتاب برای پوست خشک می‌خوام',
    visible:['digikala','snappshop','torob','basalam','banimode','khanoumi','darukade','mosbatesabz','solokala','daroo-online','takhfifan'],
    forbidden:['janebi','neshatrokh','pinket','memarket'] },
  { name:'kitchen scale', query:'ترازوهای هوشمند برای آشپزخانه',
    visible:['digikala','snappshop','torob','basalam','technolife','solokala'],
    forbidden:['iranmiz','partochoob','chidahome','tidawood','janebi','esam','takhfifan'] }
];

const servicePages = {
  ghasedak24: { host:'ghasedak24.com', path:'/train-ticket' },
  mrbilit: { host:'mrbilit.com', path:'/train-ticket' },
  alibaba: { host:'www.alibaba.ir', path:'/train' }
};
const routeCases = [];
for (const scenario of scenarios) {
  const plan = await window.DigiYarShoppingOrchestrator.run(scenario.query);
  const eligible = [...(plan.ai.eligibleStoreIds || [])];
  const visible = eligible.map(id => ({
    id,
    query: (plan.ai.searchQueries || {})[id] || scenario.query,
    url: window.DigiYarStoreBrowser.resolveSearchUrl(id, (plan.ai.searchQueries || {})[id] || scenario.query)
  })).filter(item => item.url);
  const visibleIds = visible.map(item => item.id);
  for (const id of scenario.visible) {
    assert.ok(visibleIds.includes(id), `${scenario.name}: expected visible merchant ${id}; actual: ${visibleIds.join(',')}`);
  }
  for (const id of scenario.forbidden) {
    assert.ok(!visibleIds.includes(id), `${scenario.name}: irrelevant/unverified merchant ${id} must not be visible`);
  }
  for (const item of visible) {
    const url = new URL(item.url);
    assert.ok(!/(^|\\.)google\\.com$/i.test(url.hostname), `${scenario.name}/${item.id}: must not redirect through Google`);
    const service = servicePages[item.id];
    const verifiedServicePage = Boolean(service && url.hostname === service.host && url.pathname === service.path && /قطار|ریل/.test(item.query));
    const queryParam = ['q','query','s','search','title','kw','keywords','w','term','text','keyword','product','search_query']
      .some(key => (url.searchParams.get(key) || '').trim().length >= 2);
    assert.ok(queryParam || verifiedServicePage,
      `${scenario.name}/${item.id}: URL must be a merchant product-search URL or a verified train-ticket search form`);
    assert.ok(url.pathname !== '/' || queryParam,
      `${scenario.name}/${item.id}: homepage-only URLs are not valid search results`);
    routeCases.push({ scenario:scenario.name, id:item.id, url:item.url });
  }
  console.log(`PASS ${scenario.name}: ${visibleIds.length} visible; ${eligible.length-visibleIds.length} withheld without a verified route`);
}

async function probe(item) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(item.url, { redirect:'follow', signal:AbortSignal.timeout(10000) });
      if (response.body && response.body.cancel) await response.body.cancel().catch(() => {});
      return { ...item, status:response.status, finalUrl:response.url };
    } catch (error) { lastError = String(error); }
  }
  return { ...item, status:null, error:lastError };
}
const results = [];
let cursor = 0;
const workers = Array.from({length:8}, async () => {
  while (cursor < routeCases.length) {
    const item = routeCases[cursor++];
    results.push(await probe(item));
  }
});
await Promise.all(workers);
const dead = results.filter(item => item.status === 404 || item.status === 410);
const restricted = results.filter(item => item.status === 403 || item.status === 429 || item.status === 503 || item.status === null);
console.log(`Live merchant-route probes: ${results.length}; restricted/unverified: ${restricted.length}`);
for (const item of restricted) console.log(`RESTRICTED ${item.status ?? 'NETWORK'} ${item.scenario}/${item.id} ${item.finalUrl || item.url}`);
for (const item of dead) console.log(`DEAD ${item.status} ${item.scenario}/${item.id} ${item.finalUrl || item.url}`);
assert.equal(dead.length, 0, 'visible simulator routes must not resolve to HTTP 404/410');
console.log('V7 local simulator category, relevance and live-route acceptance: PASS');
