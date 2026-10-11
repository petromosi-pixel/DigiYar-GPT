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

console.log(`V7 store search-route and semantic-query tests: PASS — ${ids.length} merchant URLs checked`);
