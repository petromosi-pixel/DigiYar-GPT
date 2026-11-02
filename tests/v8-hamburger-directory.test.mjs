import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.window = globalThis;
globalThis.document = { readyState: 'loading', addEventListener() {} };

await import('../js/v8-store-catalog.js');
await import('../js/v8-store-search-url.js');
globalThis.DigiYarPopularAffiliateStores = [
  { id: 'digikala', name: 'دیجی‌کالا' },
  { id: 'snappshop', name: 'اسنپ‌شاپ' },
  { id: 'torob', name: 'ترب' },
  { id: 'basalam', name: 'باسلام' }
];
await import('../js/user-profile.js');

const kb = window.DigiYarStoreBusinessDomains;
const options = window.DigiYarGetSelectableStores();
const ids = kb.ids();
assert.equal(ids.length, 99, 'The canonical catalog should contain all 99 active stores');
assert.equal(options.length, ids.length, 'The purchase-profile selector should expose every routable catalog store');
assert.equal(new Set(options.map(store => store.id)).size, options.length, 'Store options must be unique');
assert.equal(options[0].id, 'digikala', 'Existing popular-store ordering should be preserved');
for (const id of ['maktabkhooneh', 'karnameh', 'dimaaffiliate', 'affilio', 'meghdadit']) {
  assert.ok(options.some(store => store.id === id), `New catalog store should appear in the selector: ${id}`);
}
assert.ok(!options.some(store => store.id === 'daru24'), 'Removed Daru24 must not return to the selector');

const classified = [
  ...kb.byType.general.storeIds,
  ...kb.byType.portal.storeIds,
  ...kb.byType.specialist.storeIds
];
assert.equal(new Set(classified).size, ids.length, 'Every catalog store must belong to exactly one top-level activity type');
assert.deepEqual([...classified].sort(), [...ids].sort(), 'Top-level activity groups must cover the complete catalog');

/* Hamburger business-directory rendering is intentionally not asserted here:
   that UI is the next implementation phase, not part of the current V8 baseline.
   Keep this regression focused on canonical catalog classification and selector coverage. */

console.log('V8 canonical catalog and purchase-profile store coverage: PASS');
