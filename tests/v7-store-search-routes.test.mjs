import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  DigiYarStoreCategories: {},
  DigiYarShoppingPlan: null,
  DigiYarAffiliateUrls: {},
  DigiYarPopularAffiliateStores: []
};
globalThis.document = {
  getElementById() { return null; },
  createElement() { return { style: {}, appendChild() {}, addEventListener() {} }; },
  head: { appendChild() {} }
};

await import('../js/store-business-domains.js');
await import('../js/v7-store-eligibility.js');
await import('../js/v7-hooshyar-three-engine.js');
await import('../js/v7-ai-shopping-orchestrator.js');
await import('../js/v6-store-browser.js');

const catalog = window.DigiYarStoreBusinessDomains.catalog;
const browser = window.DigiYarStoreBrowser;
assert.ok(browser && typeof browser.resolveSearchUrl === 'function', 'Store Browser must expose the real URL resolver');

const query = 'دستگاه تصفیه هوا';
for (const [id,host] of [['snappshop','snappshop.ir'],['basalam','basalam.com']]) {
  const url = new URL(browser.resolveSearchUrl(id, query));
  assert.equal(url.hostname, host, `${id} must open its own search page, not Google`);
  assert.equal(url.pathname, '/search', `${id} must use the merchant search route`);
  assert.ok((url.searchParams.get('q') || url.searchParams.get('query') || '').includes(query),
    `${id} search URL must preserve the requested product phrase`);
}
const furnitureQuery = 'یه مبل راحتی برای پذیرایی می خوام';
const furniturePlan = await window.DigiYarShoppingOrchestrator.run(furnitureQuery);
for (const id of ['iranmiz','partochoob','chidahome','tidawood','mobliran','choobineh','iransetkor']) {
  assert.ok(furniturePlan.ai.eligibleStoreIds.includes(id), `local furniture matching omitted specialist ${id}`);
  const url = new URL(browser.resolveSearchUrl(id, furnitureQuery));
  assert.ok(url.searchParams.get('s') === furnitureQuery && url.searchParams.get('post_type') === 'product',
    `${id} must search the full furniture request rather than open a fixed category/homepage`);
}
for (const id of ['shixon','banistyle','aysoocollection','sportland']) {
  const url = new URL(browser.resolveSearchUrl(id, 'یه لباس اسپرت می‌خوام'));
  assert.ok((url.searchParams.get('s') || url.searchParams.get('q') || '').includes('لباس'),
    `${id} must preserve the user's fashion query`);
}

const clothingPlan = await window.DigiYarShoppingOrchestrator.run('یه لباس ورزشی می‌خوام');
for (const id of ['sportland','banistyle','aysoocollection','digistyle']) {
  assert.ok(clothingPlan.ai.eligibleStoreIds.includes(id), `local fashion matching omitted specialist ${id}`);
}

const ids = Object.keys(catalog);
assert.equal(ids.length, 120, `all 120 stores must be present in the canonical KB, got ${ids.length}`);
assert.ok(catalog['19kala'], '19kala must be represented in the canonical KB');
assert.ok(catalog['daroo-online'], 'daroo-online must be represented in the canonical KB');

const failures = [];
let directRouteCount = 0;
for (const id of ids) {
  try {
    const raw = browser.resolveSearchUrl(id, query);
    if (!raw) continue; // Fail closed: no confirmed direct-search route, no result link.
    directRouteCount++;
    const url = new URL(raw);
    assert.equal(url.protocol, 'https:', 'route must use HTTPS');
    assert.ok(url.hostname, 'route must have a hostname');
    assert.ok(!(url.pathname === '/' && !url.search && !url.hash),
      'homepage-only URLs must not be presented as product-search results');
    assert.ok(!url.hostname.endsWith('google.com'), `${id} must not send the user to Google instead of the merchant`);
    assert.ok(url.pathname !== '/' || url.search || url.hash,
      `${id} must not fall back to a homepage without a product-search query`);
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
  }
}
assert.deepEqual(failures, [], `invalid merchant search routes:\n${failures.join('\n')}`);
assert.ok(directRouteCount > 10, `known direct-search routes should remain available, got ${directRouteCount}`);

const threeEngine = window.DigiYarHooshyarThreeEngine;
assert.ok(threeEngine && typeof threeEngine.resolve === 'function', 'three-engine local resolver must be loaded');
for (const [phrase, expected, excluded] of [
  ['یه کیف اداری برای محل کارم می‌خوام', ['modiseh','janebi','dayan'], ['iranmiz','partochoob']],
  ['دستگاهی می‌خوام که هوای اتاق خواب را پاک کند', ['digikala','snappshop','torob'], ['iranmiz','partochoob']],
  ['یه چیزی برای تمیز کردن مبل پارچه‌ای می‌خوام', ['digikala','snappshop','torob'], ['iranmiz','partochoob','chidahome','tidachoob']],
  ['لوازم جانبی گوشی سامسونگ', ['janebi','digikala','snappshop'], ['meghdadit','takhfifan','esam']]
]) {
  const resolved = threeEngine.resolve(phrase, catalog, [], window.DigiYarShoppingOrchestrator.classifyLocalNeed(phrase));
  expected.forEach(id => assert.ok(resolved.eligibleStoreIds.includes(id), `three-engine omitted ${id} for ${phrase}; got ${resolved.eligibleStoreIds.join(',')}`));
  excluded.forEach(id => assert.ok(!resolved.eligibleStoreIds.includes(id), `three-engine leaked ${id} for ${phrase}`));
  assert.ok(resolved.need.concept, `three-engine failed to parse concept for ${phrase}`);
}
assert.equal(threeEngine.parseNeed('کیف اداری تا ۳ میلیون تومان').maxBudgetToman, 3000000, 'Persian budget must be parsed into toman');

const orchestrator = window.DigiYarShoppingOrchestrator;

/* Final2 relevance guard: user context words and generated semanticText must not
   count as product evidence; only explicit product inventory can qualify a store. */
const strictAir = threeEngine.resolve('دنبال یک دستگاه تصفیه هوای مناسب اتاق خواب هستم', catalog, [], orchestrator.classifyLocalNeed('دنبال یک دستگاه تصفیه هوای مناسب اتاق خواب هستم'));
['digikala','snappshop','torob','basalam'].forEach(id => assert.ok(strictAir.eligibleStoreIds.includes(id), `strict air-purifier search omitted ${id}`));
['okala','pinket','janebi','divar','sheypoor','sakhtemoononline','kilid','ninimarket','homeplus','memarket'].forEach(id => assert.ok(!strictAir.eligibleStoreIds.includes(id), `context-only or unrelated merchant leaked into air-purifier results: ${id}`));
const strictSofa = threeEngine.resolve('یه چیزی برای تمیز کردن مبل پارچه‌ای می‌خوام', catalog, [], orchestrator.classifyLocalNeed('یه چیزی برای تمیز کردن مبل پارچه‌ای می‌خوام'));
['digikala','snappshop','torob','basalam'].forEach(id => assert.ok(strictSofa.eligibleStoreIds.includes(id), `strict sofa-cleaning search omitted ${id}`));
['okala','pinket','khanoumi','shahrvand','hyperme'].forEach(id => assert.ok(!strictSofa.eligibleStoreIds.includes(id), `generic cleaning/home taxonomy leaked into sofa-cleaning results: ${id}`));
const strictPhone = threeEngine.resolve('یه گوشی سامسونگ می‌خوام', catalog, [], orchestrator.classifyLocalNeed('یه گوشی سامسونگ می‌خوام'));
['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'].forEach(id => assert.ok(strictPhone.eligibleStoreIds.includes(id), `strict phone search omitted ${id}`));
['banimode','khanoumi','daroo-online','dayan','19kala','emalls','sheypoor','kala360','kalatik','mobile140','mobileir'].forEach(id => assert.ok(!strictPhone.eligibleStoreIds.includes(id), `merchant exclusion text or unrelated taxonomy leaked into phone results: ${id}`));
const strictAccessory = threeEngine.resolve('لوازم جانبی موبایل', catalog, [], orchestrator.classifyLocalNeed('لوازم جانبی موبایل'));
['janebi','digido','gooshishop','technolife','digikala','snappshop','torob','basalam'].forEach(id => assert.ok(strictAccessory.eligibleStoreIds.includes(id), `strict accessory search omitted ${id}`));
['digiland','meghdadit','takhfifan','esam','memarket','19kala','emalls','sheypoor','kala360','kalatik','mobile140','mobileir'].forEach(id => assert.ok(!strictAccessory.eligibleStoreIds.includes(id), `non-approved accessory merchant leaked into results: ${id}`));
assert.equal(orchestrator.resolveDirectorySearch('لوازم جانبی موبایل', catalog), null,
  'A product query containing the store name «جانبی» must not be misclassified as a store-directory query.');
const accessoryPlan = await orchestrator.run('لوازم جانبی موبایل');
assert.equal(accessoryPlan.ai.directorySearch, undefined, 'Mobile accessories must use the product-search path.');
assert.deepEqual([...accessoryPlan.ai.eligibleStoreIds].sort(),
  ['janebi','digido','gooshishop','technolife','digikala','snappshop','torob','basalam'].sort(),
  'The knowledge-base resolver must preserve the established mobile-accessory merchant set without unrelated device-only stores.');


const expandedCatalog = {...catalog, testoffice: {name: 'فروشگاه آزمایشی کیف اداری', domains: ['fashion'], products: ['کیف اداری'], aliases: []}};
const expandedOffice = threeEngine.resolve('کیف اداری برای محل کارم', expandedCatalog, [], orchestrator.classifyLocalNeed('کیف اداری برای محل کارم'));
assert.ok(expandedOffice.eligibleStoreIds.includes('testoffice'), 'a direct KB product match outside the curated list must not be filtered out');
const expandedDeskCatalog = {...catalog, testdesk: {name: 'فروشگاه آزمایشی میز تنظیم ارتفاع', domains: ['home'], products: ['میز تنظیم ارتفاع'], aliases: []}};
const expandedDesk = threeEngine.resolve('یه میز تنظیم ارتفاع برای کار می‌خوام', expandedDeskCatalog, [], orchestrator.classifyLocalNeed('یه میز تنظیم ارتفاع برای کار می‌خوام'));
assert.ok(expandedDesk.eligibleStoreIds.includes('testdesk'), 'shared retrieval must discover a newly added merchant for a product outside the predefined concepts');
['iranmiz','partochoob','chidahome','tidawood','mobliran','choobineh','moblmarket'].forEach(id =>
  assert.ok(!expandedDesk.eligibleStoreIds.includes(id), `generic furniture merchant ${id} must not match a specific height-adjustable desk query`)
);

/* Broad category phrases must restore the specialist-first behavior that
   existed before the three-engine filter was introduced. */
const furniturePhrase='یه مبل راحتی برای پذیرایی می‌خوام';
const furnitureResolved=threeEngine.resolve(furniturePhrase,catalog,[],orchestrator.classifyLocalNeed(furniturePhrase));
['iranmiz','iransetkor','partochoob','chidahome','tidawood','mobliran','choobineh','moblmarket'].forEach(id =>
  assert.ok(furnitureResolved.eligibleStoreIds.includes(id), `furniture phrase omitted specialist ${id}: ${furnitureResolved.eligibleStoreIds.join(',')}`)
);
const furnitureEligibility=eligibilityExplainSafe('مبل راحتی');
function eligibilityExplainSafe(query){return window.DigiYarStoreEligibility.explain(query,[]);}
['iranmiz','iransetkor','partochoob','chidahome','tidawood','mobliran','choobineh','moblmarket'].forEach(id =>
  assert.ok(furnitureEligibility.eligibleIds.includes(id), `KB eligibility omitted furniture specialist ${id}`)
);
const fashionPhrase='یه لباس اسپرت می‌خوام';
const fashionResolved=threeEngine.resolve(fashionPhrase,catalog,[],orchestrator.classifyLocalNeed(fashionPhrase));
['banimode','banistyle','aysoocollection','digistyle','shixon','sportland'].forEach(id =>
  assert.ok(fashionResolved.eligibleStoreIds.includes(id), `fashion phrase omitted specialist ${id}`)
);

/* Even if the ranking engine returns a partial list, preserve specialist
   candidates already validated by the canonical KB resolver. */
const originalThreeEngineResolveForMerge=threeEngine.resolve;
threeEngine.resolve=function(query,source,seed,classified){
  const result=originalThreeEngineResolveForMerge(query,source,seed,classified);
  return Object.assign({},result,{eligibleStoreIds:['digikala'],searchQueries:{digikala:'مبل راحتی'}});
};
const mergedFurniturePlan=await orchestrator.run(furniturePhrase);
threeEngine.resolve=originalThreeEngineResolveForMerge;
['iranmiz','partochoob','mobliran','choobineh'].forEach(id =>
  assert.ok(mergedFurniturePlan.ai.eligibleStoreIds.includes(id), `orchestrator lost KB specialist ${id} when engine returned a partial list`)
);

for (const phrase of ['بلیط قطار تهران مشهد', 'از تهران می‌خوام برم مشهد با قطار']) {
  const intent = orchestrator.classifyLocalNeed(phrase);
  assert.equal(intent && intent.kind, 'travel_ticket', `train intent not recognized: ${phrase}`);
  ['raja', 'ghasedak24', 'mrbilit', 'safarmarket'].forEach(id =>
    assert.ok(intent.stores.includes(id), `missing train-ticket merchant ${id} for ${phrase}`)
  );
}
const airPhrase = orchestrator.classifyLocalNeed('می‌خوام هوای اتاق خواب تمیز و پاک باشه');
assert.equal(airPhrase && airPhrase.kind, 'air_purifier', 'natural-language clean-air need should resolve to air-purifier shopping');

const eligibility = window.DigiYarStoreEligibility;
const officeBag = eligibility.explain('کیف اداری', []);
['modiseh', 'janebi', 'dayan'].forEach(id => assert.ok(officeBag.eligibleIds.includes(id), `office-bag need omitted ${id}`));
const accessory = eligibility.explain('لوازم جانبی موبایل', []);
['digido', 'janebi', 'gooshishop', 'technolife', 'digikala', 'snappshop', 'torob', 'basalam'].forEach(id => assert.ok(accessory.eligibleIds.includes(id), `mobile-accessory need omitted ${id}`));
['meghdadit', 'takhfifan', 'esam'].forEach(id => assert.ok(!accessory.eligibleIds.includes(id), `unrelated merchant leaked into mobile accessories: ${id}`));
assert.equal(browser.resolveSearchUrl('modiseh', 'کیف اداری'), '',
  'Modiseh must be withheld until its reported 404 search route is verified');
assert.equal(browser.resolveSearchUrl('memarket', 'کیف اداری'), '',
  'MiMarket must be withheld until a direct product-search route is confirmed; its homepage alone is not sufficient');
assert.equal(browser.resolveSearchUrl('khanoumi', 'ضد آفتاب'), '',
  'Khanoumi category landing pages must not be presented as verified search results');
const officeBagUrl = new URL(browser.resolveSearchUrl('janebi', 'کیف اداری'));
assert.ok(decodeURIComponent(officeBagUrl.toString()).includes('کیف اداری'), 'Janebi route must search the requested office bag');
assert.ok(!decodeURIComponent(officeBagUrl.toString()).includes('کیف لپ تاپ'), 'Janebi route must not substitute a laptop bag');
const dayanUrl = new URL(browser.resolveSearchUrl('dayan', 'کیف اداری'));
assert.equal(dayanUrl.hostname, 'noura1393.affdn.ir', 'Dayan must use the reported working product-search endpoint');
assert.equal(dayanUrl.pathname, '/products', 'Dayan must open product search, not its homepage');
assert.equal(dayanUrl.searchParams.get('title'), 'کیف اداری', 'Dayan must preserve the exact requested product phrase');
const phone = eligibility.explain('تلفن همراه سامسونگ', []);
['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam']
  .forEach(id => assert.ok(phone.eligibleIds.includes(id), `semantic phone synonym omitted ${id}`));
['emalls','kalatik','mobile140','mobileir','kala360','memarket']
  .forEach(id => assert.ok(!phone.eligibleIds.includes(id), `unrelated phone merchant leaked: ${id}`));

const originalFetch = globalThis.fetch;
let sentBody = null;
delete window.DigiYarHooshyarSemanticApiEnabled; // External semantic API is opt-in; local KB is the default.
globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://digi-yar-core-git-main-digi-yar.vercel.app/api/ai-shopping');
  sentBody = JSON.parse(options.body);
  return { ok: true, json: async () => ({ ok: true, provider: 'openrouter', plan: {
    eligibleStoreIds: ['raja', 'unknown-id', 'mrbilit'],
    searchQueries: { raja: 'بلیط قطار تهران مشهد', 'unknown-id': 'نامعتبر' },
    category: 'travel_ticket', domains: ['travel_ticket'], requestedProduct: 'بلیط قطار',
    semanticNeed: 'سفر با قطار از تهران به مشهد', taskType: 'ticket_search', confidence: 0.91
  } }) };
};
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
const localOnly = await orchestrator.run('کیف اداری');
assert.equal(localOnly.provider, 'local-knowledge-base', 'local results must work without an AI provider');
assert.equal(localOnly.semantic, false);
assert.ok(['modiseh','janebi','dayan'].every(id => localOnly.ai.eligibleStoreIds.includes(id)), 'descriptive office-bag search must retain specialist merchants');
assert.ok(['modiseh','janebi','dayan'].every(id => localOnly.ai.searchQueries[id] === 'کیف اداری'), 'merchant search routes must receive the concise product query rather than conversational filler');
const originalThreeEngineResolveForEmptyTest = window.DigiYarHooshyarThreeEngine.resolve;
window.DigiYarHooshyarThreeEngine.resolve = () => ({
  eligibleStoreIds: [], searchQueries: {},
  need: {requestedProduct:'', brand:null, maxBudgetToman:null, attributes:[], targetObject:null, taskType:'shopping_search', concept:null},
  trace: {candidateCount:0, top:[]}
});
const preservedKbPlan = await orchestrator.run('کیف اداری');
window.DigiYarHooshyarThreeEngine.resolve = originalThreeEngineResolveForEmptyTest;
assert.ok(['modiseh','janebi','dayan'].every(id => preservedKbPlan.ai.eligibleStoreIds.includes(id)),
  'an empty three-engine parse must preserve the existing KB-validated office-bag matches');
assert.equal(preservedKbPlan.ai.fallbackReason, 'three-engine-empty-preserved-kb-eligibility', 'an empty descriptive parse must preserve KB-validated merchants and record the fallback');
const localPhone = await orchestrator.run('یه گوشی سامسونگ می‌خوام');
const expectedPhoneIds = ['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'];
expectedPhoneIds.forEach(id => assert.ok(localPhone.ai.eligibleStoreIds.includes(id), `local phone plan omitted expected merchant ${id}`));
['iranmiz','partochoob','chidahome','tidawood'].forEach(id => assert.ok(!localPhone.ai.eligibleStoreIds.includes(id), `unrelated merchant leaked into phone plan: ${id}`));
assert.deepEqual(window.DigiYarStoreEligibility.storesForQuery('یه گوشی سامسونگ می‌خوام', []).map(x=>x.id), expectedPhoneIds, 'local plans must not be incorrectly revalidated as AI plans');
assert.equal(sentBody, null, 'AI API must not be called unless explicitly enabled');
window.DigiYarHooshyarSemanticApiEnabled = true;
const aiRun = await orchestrator.run('از تهران می‌خوام برم مشهد با قطار');
assert.equal(aiRun.provider, 'local-knowledge-base', 'normal searches must remain local-only even when an AI provider is configured');
assert.equal(aiRun.semantic, false);
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(aiRun.provider, 'local-knowledge-base', 'external AI must not overwrite deterministic search results');
assert.equal(aiRun.semantic, false);
assert.equal(sentBody, null, 'normal searches must not call the external AI endpoint');
assert.ok(aiRun.ai.eligibleStoreIds.includes('raja'));
globalThis.fetch = async () => { throw new Error('simulated offline provider'); };
const fallback = await orchestrator.run('بلیط قطار تهران مشهد');
assert.equal(fallback.provider, 'local-knowledge-base', 'provider availability must not affect normal search');
assert.equal(fallback.semantic, false);
assert.ok(fallback.ai.eligibleStoreIds.includes('raja'));
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(fallback.provider, 'local-knowledge-base', 'local-only search must remain stable offline');
// Provider selection is explicit; the local three-engine plan remains available for comparison.
window.DigiYarHooshyarAIProvider = 'deepseek';
let providerRequestBody = null;
globalThis.fetch = async (_url, options) => {
  providerRequestBody = JSON.parse(options.body);
  return {ok:true,json:async()=>({ok:true,provider:'local-knowledge-base',plan:{eligibleStoreIds:[]}})};
};
const comparison = await orchestrator.compareEngines('کیف اداری برای محل کارم می‌خوام');
assert.equal(comparison.local.engine, 'three-engine-local');
assert.ok(comparison.catalogCount >= 120, 'comparison must include the canonical 120-store catalog');
assert.equal(providerRequestBody.provider, 'deepseek', 'DeepSeek selection must be sent to the server');
assert.equal(comparison.ai, null, 'local API fallback must not be reported as a real semantic provider result');
window.DigiYarHooshyarAIProvider = 'openrouter';
providerRequestBody = null;
await orchestrator.compareEngines('دستگاه تصفیه هوا');
assert.equal(providerRequestBody.provider, 'openrouter', 'OpenRouter remains an optional comparison provider');
window.DigiYarHooshyarAIProvider = 'deepseek';
window.DigiYarHooshyarSemanticApiEnabled = false;
globalThis.fetch = originalFetch;

console.log(`V7 store search-route and semantic-query tests: PASS — ${ids.length} KB stores inspected, ${directRouteCount} direct-search routes available; unverified routes fail closed, local matching and office bags/mobile accessories checked`);


/* Strict semantic relevance regression: a model-selected furniture merchant
   must not pass a specific office-bag query on broad-domain overlap alone. */
const priorPlan = window.DigiYarShoppingPlan;
window.DigiYarShoppingPlan = {
  query: 'کیف اداری',
  semantic: true,
  ai: {
    requestedProduct: 'کیف اداری',
    semanticNeed: 'کیف اداری برای محل کار',
    productTerms: ['کیف اداری'],
    requiredNameTerms: ['کیف اداری'],
    domains: ['fashion'],
    eligibleStoreIds: ['iranmiz', 'modiseh']
  }
};
const strictOffice = eligibility.explain('کیف اداری', []);
assert.ok(strictOffice.eligibleIds.includes('modiseh'),
  'a merchant with explicit office-bag product evidence must remain eligible');
assert.ok(!strictOffice.eligibleIds.includes('iranmiz'),
  'a furniture merchant must not pass office-bag matching from broad domain/word overlap');
window.DigiYarShoppingPlan = priorPlan;

['meghdadit','shavaz','jeanswest','sabzgostar'].forEach(id => {
  assert.equal(browser.resolveSearchUrl(id, 'کیف اداری'), '',
    `${id} must not expose an unverified guessed search route`);
});

