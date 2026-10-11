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
