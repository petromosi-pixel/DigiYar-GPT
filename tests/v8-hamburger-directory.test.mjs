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
assert.ok(sw.includes('digiyar-v8-8.0.0-shell.44'), 'The category-control fix must ship with a fresh app-shell cache version');
assert.ok(!ui.includes("showCard(popular,'فروشگاه‌های محبوب'"), 'Hamburger navigation must not relocate the popular stores card');

const hooshyar = await readFile(new URL('../js/v8-hooshyar-engine.js', import.meta.url), 'utf8');
assert.ok(html.includes('popular-discovery-bottom-toggle v5-step4-toggle v5-step4-final-toggle'), 'Activity category must use the shared three-chevron toggle');
const categoryInit = ui.slice(ui.indexOf('function initCategoryCardToggle(){'), ui.indexOf('function initPopularStores(){'));
const popularInit = ui.slice(ui.indexOf('function initPopularStores(){'), ui.indexOf('function initPageHarmony(){'));
assert.ok(!categoryInit.includes('head.addEventListener'), 'Category heading must not toggle; only its bottom icon does');
const engine = await readFile(new URL('../js/v8-hooshyar-engine.js', import.meta.url), 'utf8');
assert.ok(engine.includes("state.type=next;") && engine.includes("state.openCategories={};"), 'Selecting an activity button must replace the active top-level category');
assert.ok(engine.includes("function setStoreType(next){"), 'Activity tabs must use one shared category-state controller');
assert.ok(engine.includes("var toggle=document.getElementById('popularDiscoveryToggle');") && engine.includes("var panel=document.getElementById('popularDiscoveryPanel');"), 'The category controller must resolve its own DOM references in its scope');
assert.ok(engine.includes("if(isOpen&&state.type===next){"), 'Tapping the currently selected category button must close the card');
assert.ok(engine.includes("var isOpen=toggle.getAttribute('aria-expanded')==='true'&&!panel.hidden;"), 'Category button toggle state must follow the actual card state');
assert.ok(engine.includes("setStoreType(btn.getAttribute('data-store-type'));"), 'Category buttons must call the shared controller');
assert.ok(!engine.includes("var isOpen=toggle.getAttribute('aria-expanded')==='true'&&!panel.hidden;if(isOpen&&state.type===next)"), 'Category button listeners must not reference init-local DOM variables');
assert.ok(engine.includes("toggle.setAttribute('aria-expanded','true');") && engine.includes("panel.hidden=false;") && engine.includes("panel.setAttribute('aria-hidden','false');"), 'Selecting any activity button must open the category card');
assert.ok(engine.includes("if(next==='general')state.openCategories.general=true;") && engine.includes("else if(next==='portal')state.openCategories.portal=true;") && engine.includes("domainsForSelection().forEach(function(domain){state.openCategories[domain]=true;});"), 'Each activity button must reveal only its matching category group');
assert.ok(engine.includes("if(bottom)bottom.setAttribute('aria-expanded','true');") && engine.includes("render();\n}"), 'The bottom toggle state must stay synchronized after selecting an activity');
assert.ok(!popularInit.includes('title.addEventListener'), 'Popular-store heading must not toggle; only its bottom icon does');
assert.ok(ui.includes("title.addEventListener('click',flip)") && ui.includes("title.addEventListener('keydown'"), 'Purchase-profile card behavior must remain unchanged');
assert.ok(ui.includes('v5-popular-toggle v5-step4-toggle v5-step4-final-toggle'), 'Popular stores must use the same toggle control style as the purchase-profile card');
assert.ok(html.includes('<div class="popular-discovery-toggle v8-accordion-heading" id="popularDiscoveryToggle"'), 'Category heading must be display-only rather than a button');
assert.ok(ui.includes('setState(false)}'), 'Expandable cards must initialize closed');
assert.ok(ui.includes('initCategoryCardToggle();initPopularStores();'), 'Category and popular-store accordions must both initialize on page startup');
assert.ok(ui.includes("panel.hidden=!open") && ui.includes("grid.hidden=!open"), 'Both accordion panels must be explicitly hidden when collapsed');
const theme = await readFile(new URL('../css/digiyar-theme-system.css', import.meta.url), 'utf8');
const harmony = await readFile(new URL('../css/v5-page-harmony.css', import.meta.url), 'utf8');
const hooshyarCss = await readFile(new URL('../css/v8-hooshyar.css', import.meta.url), 'utf8');
assert.ok(harmony.includes('Shared home-card heading and bottom-chevron system'), 'All three homepage cards must share typography and chevron styling');
assert.ok(harmony.includes('#v7PopularStoresHost .section-title .v5-card-subtitle') && harmony.includes('border:0!important'), 'Popular-store subtitle frame must be removed');
assert.ok(harmony.includes('#popularStoresDiscovery .popular-discovery-toggle-main h2{') && harmony.includes('font-size:18px!important'), 'Category heading must be one size smaller');
assert.ok(!/popular-discovery-(?:toggle:after|bottom-toggle:before|chevron)/.test(hooshyarCss), 'Legacy category toggle arrow source must be deleted from its originating stylesheet');
assert.ok(!/popular-discovery-toggle::?(?:before|after)/.test(harmony+theme), 'No duplicate-arrow suppression rules should remain after deleting the original arrow source');
assert.ok(html.includes('css/v8-hooshyar.css?v=8.0.0-hooshyar.2'), 'Updated Hooshyar stylesheet must bypass the previous browser cache');
assert.ok(html.includes('sw.js?v=8.0.0-offline-shell.42'), 'Updated service worker must bypass the previous registration cache');
assert.ok(theme.includes('V8 homepage accordion cards: one shared chevron control and complete dark surfaces'), 'Homepage cards must have complete dark-mode coverage');
assert.ok(sw.includes('digiyar-v8-8.0.0-shell.44'), 'Corrected category controller must ship with a fresh service-worker cache');


console.log('V8 canonical catalog and purchase-profile store coverage: PASS');
