import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../js/store-business-domains.js');
await import('../js/v7-store-search-url.js');
const kb = window.DigiYarStoreBusinessDomains;
const resolver = window.DigiYarStoreSearchUrl;

const ids = kb.ids();
assert.equal(ids.length, 120, 'The catalog inventory should retain all 120 catalog entries');
assert.ok(kb.domainTitles.digital && kb.domainTitles.education && kb.domainTitles.auto_service,
  'The canonical taxonomy must cover product and service domains');
assert.ok(kb.byDomain.education.storeIds.includes('maktabkhooneh'));
assert.ok(kb.byDomain.travel_ticket.storeIds.includes('safarme'));
assert.ok(kb.byDomain.auto_service.storeIds.includes('karnameh'));
assert.ok(kb.byType.general.storeIds.includes('digikala'));
assert.ok(kb.byType.specialist.storeIds.includes('meghdadit'));
assert.equal(resolver.hasHandler('meghdadit'), true);
assert.equal(resolver.hasHandler('shab'), false);
const configured = ids.filter(id => resolver.hasHandler(id));
const missing = ids.filter(id => !resolver.hasHandler(id));
assert.equal(configured.length + missing.length, ids.length,
  'Every catalog entry must be accounted for by the route-coverage audit');
assert.ok(missing.length > 0,
  'Missing routes must remain visible as an audit gap rather than be hidden by homepage fallback');
console.log('V7 catalog taxonomy and route-coverage contract: PASS');
