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
assert.ok(ids.length >= 100, `expected old and new merchant catalog, got ${ids.length}`);

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
const phone = eligibility.explain('تلفن همراه سامسونگ', []);
['digido', 'digiland', 'berozkala', 'technolife', 'meghdadit', 'emalls', 'kalatik', 'mobile140', 'mobileir', 'kala360']
  .forEach(id => assert.ok(phone.eligibleIds.includes(id), `semantic phone synonym omitted ${id}`));

const originalFetch = globalThis.fetch;
let sentBody = null;
globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://digi-yar-core-git-main-digi-yar.vercel.app/api/ai-shopping');
  sentBody = JSON.parse(options.body);
  return { ok: true, json: async () => ({ ok: true, plan: {
    eligibleStoreIds: ['raja', 'unknown-id', 'mrbilit'],
    searchQueries: { raja: 'بلیط قطار تهران مشهد', 'unknown-id': 'نامعتبر' },
    category: 'travel_ticket', domains: ['travel_ticket'], requestedProduct: 'بلیط قطار',
    semanticNeed: 'سفر با قطار از تهران به مشهد', taskType: 'ticket_search', confidence: 0.91
  } }) };
};
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
const aiRun = await orchestrator.run('از تهران می‌خوام برم مشهد با قطار');
assert.equal(aiRun.provider, 'openrouter', 'the live semantic plan should take precedence over local rules');
assert.equal(aiRun.semantic, true);
assert.deepEqual(aiRun.ai.eligibleStoreIds, ['raja', 'mrbilit']);
assert.deepEqual(Object.keys(aiRun.ai.searchQueries), ['raja']);
assert.equal(sentBody.query, 'از تهران می‌خوام برم مشهد با قطار');
assert.ok(sentBody.storeCatalog.digikala && sentBody.storeCatalog.raja, 'full merchant KB must be sent to semantic AI');
globalThis.fetch = async () => { throw new Error('simulated offline provider'); };
const fallback = await orchestrator.run('بلیط قطار تهران مشهد');
assert.equal(fallback.provider, 'local-knowledge-base', 'provider failures must retain deterministic fallback');
assert.equal(fallback.semantic, false);
assert.ok(fallback.ai.eligibleStoreIds.includes('raja'));
globalThis.fetch = originalFetch;

console.log(`V7 store search-route and semantic-query tests: PASS — ${ids.length} merchant URLs checked; semantic API routing and fallback verified`);
