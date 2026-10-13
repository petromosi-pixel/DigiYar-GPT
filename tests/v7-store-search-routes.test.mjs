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
  assert.equal(url.hostname, 'www.google.com', `${id} should use resilient site-specific search when its direct endpoint is restricted/unavailable`);
  assert.ok(url.searchParams.get('q').includes(`site:${host}`), `${id} fallback must be restricted to its own domain`);
}
const ids = Object.keys(catalog);
assert.equal(ids.length, 120, `all 120 stores must be present in the canonical KB, got ${ids.length}`);
assert.ok(catalog['19kala'], '19kala must be represented in the canonical KB');
assert.ok(catalog['daroo-online'], 'daroo-online must be represented in the canonical KB');

const failures = [];
for (const id of ids) {
  try {
    const raw = browser.resolveSearchUrl(id, query);
    const url = new URL(raw);
    assert.equal(url.protocol, 'https:', 'route must use HTTPS');
    assert.ok(url.hostname, 'route must have a hostname');
    assert.ok(!(url.pathname === '/' && !url.search && !url.hash),
      'homepage-only URLs must not be presented as product-search results');
    if (url.hostname.endsWith('google.com')) {
      assert.equal(url.pathname, '/search', 'generic fallback must open Google search, not a homepage');
      assert.ok((url.searchParams.get('q') || '').length > 0, 'generic fallback must carry the user query');
    }
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
  }
}
assert.deepEqual(failures, [], `invalid merchant search routes:\n${failures.join('\n')}`);

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
const expandedCatalog = {...catalog, testoffice: {name: 'فروشگاه آزمایشی کیف اداری', domains: ['fashion'], products: ['کیف اداری'], aliases: []}};
const expandedOffice = threeEngine.resolve('کیف اداری برای محل کارم', expandedCatalog, [], orchestrator.classifyLocalNeed('کیف اداری برای محل کارم'));
assert.ok(expandedOffice.eligibleStoreIds.includes('testoffice'), 'a direct KB product match outside the curated list must not be filtered out');
const orchestrator = window.DigiYarShoppingOrchestrator;
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
for (const [id,host] of [['modiseh','modiseh.com'],['memarket','memarket24.ir']]) {
  const url = new URL(browser.resolveSearchUrl(id, 'کیف اداری'));
  assert.equal(url.hostname, 'www.google.com', `${id} should avoid broken/registration pages and use site-specific search`);
  assert.ok(url.searchParams.get('q').includes(`site:${host}`), `${id} fallback must be restricted to its own domain`);
}
const officeBagUrl = new URL(browser.resolveSearchUrl('janebi', 'کیف اداری'));
assert.ok(decodeURIComponent(officeBagUrl.toString()).includes('کیف اداری'), 'Janebi route must search the requested office bag');
assert.ok(!decodeURIComponent(officeBagUrl.toString()).includes('کیف لپ تاپ'), 'Janebi route must not substitute a laptop bag');
const phone = eligibility.explain('تلفن همراه سامسونگ', []);
['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam']
  .forEach(id => assert.ok(phone.eligibleIds.includes(id), `semantic phone synonym omitted ${id}`));
['emalls','kalatik','mobile140','mobileir','kala360','memarket']
  .forEach(id => assert.ok(!phone.eligibleIds.includes(id), `unrelated phone merchant leaked: ${id}`));

const originalFetch = globalThis.fetch;
let sentBody = null;
window.DigiYarHooshyarSemanticApiEnabled = false;
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
const localPhone = await orchestrator.run('یه گوشی سامسونگ می‌خوام');
const expectedPhoneIds = ['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'];
expectedPhoneIds.forEach(id => assert.ok(localPhone.ai.eligibleStoreIds.includes(id), `local phone plan omitted expected merchant ${id}`));
['iranmiz','partochoob','chidahome','tidawood'].forEach(id => assert.ok(!localPhone.ai.eligibleStoreIds.includes(id), `unrelated merchant leaked into phone plan: ${id}`));
assert.deepEqual(window.DigiYarStoreEligibility.storesForQuery('یه گوشی سامسونگ می‌خوام', []).map(x=>x.id), expectedPhoneIds, 'local plans must not be incorrectly revalidated as AI plans');
assert.equal(sentBody, null, 'AI API must not be called unless explicitly enabled');
window.DigiYarHooshyarSemanticApiEnabled = true;
const aiRun = await orchestrator.run('از تهران می‌خوام برم مشهد با قطار');
assert.equal(aiRun.provider, 'local-knowledge-base', 'local results must be available before any provider response');
assert.equal(aiRun.semantic, false);
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(aiRun.provider, 'openrouter', 'a valid semantic response may improve the local plan in the background');
assert.equal(aiRun.semantic, true);
assert.deepEqual(aiRun.ai.eligibleStoreIds, ['raja', 'mrbilit']);
assert.deepEqual(Object.keys(aiRun.ai.searchQueries), ['raja']);
assert.equal(sentBody.query, 'از تهران می‌خوام برم مشهد با قطار');
assert.ok(sentBody.storeCatalog.digikala && sentBody.storeCatalog.raja, 'full merchant KB must be sent to semantic AI');
window.DigiYarHooshyarSemanticApiEnabled = true;
globalThis.fetch = async () => { throw new Error('simulated offline provider'); };
const fallback = await orchestrator.run('بلیط قطار تهران مشهد');
assert.equal(fallback.provider, 'local-knowledge-base', 'provider failures must retain deterministic fallback');
assert.equal(fallback.semantic, false);
assert.ok(fallback.ai.eligibleStoreIds.includes('raja'));
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(fallback.provider, 'local-knowledge-base', 'provider failure must never erase the local result');
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

console.log(`V7 store search-route and semantic-query tests: PASS — ${ids.length} merchant URLs checked; all 120 KB stores, local-first fallback, three-engine vs DeepSeek/OpenRouter selection, 120-store catalog, office bags and mobile accessories verified`);
