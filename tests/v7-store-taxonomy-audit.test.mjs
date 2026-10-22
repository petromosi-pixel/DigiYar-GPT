import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../js/store-business-domains.js');
await import('../js/v7-store-search-url.js');
const kb = window.DigiYarStoreBusinessDomains;
const resolver = window.DigiYarStoreSearchUrl;

const ids = kb.ids();
assert.equal(ids.length, 100, 'The current canonical catalog contains 100 stores after the approved removals');
assert.ok(kb.domainTitles.digital && kb.domainTitles.education && kb.domainTitles.auto_service,
  'The canonical taxonomy must cover product and service domains');
assert.ok(kb.byDomain.education.storeIds.includes('maktabkhooneh'));
assert.ok(kb.byDomain.travel_ticket.storeIds.includes('safarme'));
assert.ok(kb.byDomain.auto_service.storeIds.includes('karnameh'));
assert.ok(kb.byType.general.storeIds.includes('digikala'));
assert.ok(kb.byType.specialist.storeIds.includes('meghdadit'));
assert.equal(resolver.hasSearchHandler('meghdadit'), true);
assert.equal(resolver.hasHandler('shab'), true);
const configured = ids.filter(id => resolver.hasSearchHandler(id));
const fallback = ids.filter(id => resolver.hasHandler(id) && !resolver.hasSearchHandler(id));
const missing = ids.filter(id => !resolver.hasHandler(id));
assert.equal(configured.length + fallback.length + missing.length, ids.length,
  'Every catalog entry must be accounted for by direct-search, homepage fallback, or missing route');
assert.ok(configured.length > 0, 'Known query-specific search handlers must remain available');
assert.equal(missing.length, 0, 'Every catalog store should have a routable official homepage fallback');
assert.ok(fallback.length > 0, 'Fallback routes must remain visible as a separate coverage class');
console.log('V7 catalog taxonomy and route-coverage contract: PASS');
