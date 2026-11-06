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


const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../js/v8-ui.js', import.meta.url), 'utf8');
const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const categoryAt = html.indexOf('id="popularStoresDiscovery"');
const popularAt = html.indexOf('id="v7PopularStoresHost"');
const profileAt = html.indexOf('id="v7ProfileSearchHost"');
assert.ok(categoryAt >= 0 && popularAt > categoryAt && profileAt > popularAt, 'Popular stores must sit below the activity-category card and above the purchase profile');
assert.ok(!/id="v7PopularStoresHost"[^>]*\shidden/.test(html), 'Popular stores must be visible on the homepage, initially collapsed by its toggle');
assert.ok(!ui.includes('data-v6-popular'), 'Popular stores must no longer be opened from the hamburger menu');
assert.ok(sw.includes('digiyar-v8-8.0.0-shell.36'), 'The relocated homepage card must ship with a fresh app-shell cache version');
assert.ok(!ui.includes("showCard(popular,'فروشگاه‌های محبوب'"), 'Hamburger navigation must not relocate the popular stores card');

const hooshyar = await readFile(new URL('../js/v8-hooshyar-engine.js', import.meta.url), 'utf8');
assert.ok(html.includes('popular-discovery-bottom-toggle v5-step4-toggle v5-step4-final-toggle'), 'Activity category must use the shared three-chevron toggle');
assert.ok(ui.includes('title.addEventListener(\'click\',flip)') && ui.includes('title.addEventListener(\'keydown\''), 'Popular stores and purchase-profile titles must toggle by click and keyboard');
assert.ok(ui.includes('v5-popular-toggle v5-step4-toggle v5-step4-final-toggle'), 'Popular stores must use the same toggle control style as the purchase-profile card');
assert.ok(hooshyar.includes('toggle.addEventListener(\'click\''), 'Activity-category title must remain an active toggle');
assert.ok(ui.includes('setState(false)}'), 'Expandable cards must initialize closed');
assert.ok(sw.includes('digiyar-v8-8.0.0-shell.36'), 'Shared card-toggle UI must ship with a fresh service-worker cache');


console.log('V8 canonical catalog and purchase-profile store coverage: PASS');
