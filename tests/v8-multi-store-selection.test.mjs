import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window = globalThis;
globalThis.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
await import('../js/v8-store-catalog.js');
await import('../js/v8-store-search-url.js');

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const discoveryPanelStart = index.indexOf('<div class="popular-discovery-panel" id="popularDiscoveryPanel" hidden>');
const discoveryPanelEnd = index.indexOf('</div>\\n <button class="popular-discovery-bottom-toggle"', discoveryPanelStart);
const purchaseFormStart = index.indexOf('<section id="v7ProfileSearchHost"', discoveryPanelStart);
assert.ok(discoveryPanelStart >= 0 && discoveryPanelEnd > discoveryPanelStart, 'The discovery panel must remain a valid insertion container');
assert.ok(purchaseFormStart > discoveryPanelStart && purchaseFormStart < discoveryPanelEnd, 'The complete legacy purchase card must be nested inside the renamed discovery/category card');
assert.ok(index.indexOf('</section>', purchaseFormStart) < discoveryPanelEnd, 'The moved purchase card must close before the discovery panel closes');
for (const id of ['profileForm','storeSelect','v5Category','v5Subcategory','budgetMax','v5DynamicFields','resetProfile']) {
  assert.equal((index.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, 'The moved form must preserve one unique #' + id + ' target');
}
assert.match(index, /id="popularStoresDiscovery"[\\s\\S]*?id="v7PopularDiscoveryTabs"[\\s\\S]*?id="popularDiscoveryPanel"[\\s\\S]*?id="v7ProfileSearchHost"/, 'Category tabs, category content, and the old purchase form must remain in one discovery card');

const engine = fs.readFileSync(new URL('../js/v8-hooshyar-engine.js', import.meta.url), 'utf8');
vm.runInThisContext(engine.replace(
  'function init(){',
  'window.__testResolveSearchContext=resolveSearchContext; window.__testApplyStoreSelection=applyStoreSelection; function init(){'
), { filename: 'v8-multi-store-selection.test.mjs' });

const resolve = window.__testResolveSearchContext;
const apply = window.__testApplyStoreSelection;
assert.equal(typeof apply, 'function', 'Hooshyar must expose its pure selection filter to regression tests');

const base = resolve('لوازم جانبی موبایل');
assert.ok(base.storeIds.length > 1, 'Fixture query should have multiple eligible stores');

const oneStore = apply(structuredClone(base), { active: true, selectedStoreIds: ['torob'] });
assert.deepEqual(oneStore.storeIds, ['torob'], 'Explicit store selection must narrow Hooshyar to the selected merchant');
assert.deepEqual(oneStore.eligibleStoreIds, ['torob'], 'Eligible-store metadata must obey the same selection');
assert.deepEqual(Object.keys(oneStore.categoriesByStore), ['torob'], 'Category metadata must not leak unselected stores');

const twoStores = apply(structuredClone(base), { active: true, selectedStoreIds: ['torob', 'digikala'] });
assert.deepEqual(new Set(twoStores.storeIds), new Set(['torob', 'digikala']), 'Multiple selected stores must remain available');

const irrelevant = apply(structuredClone(base), { active: true, selectedStoreIds: ['divar'] });
assert.deepEqual(irrelevant.storeIds, [], 'A selected but irrelevant store must not bypass Hooshyar relevance rules');

const unrestricted = apply(structuredClone(base), { active: false, selectedStoreIds: [] });
assert.deepEqual(unrestricted.storeIds, base.storeIds, 'No explicit selection must preserve the existing automatic relevance behavior');

const picker = fs.readFileSync(new URL('../js/v8-multi-store-picker.js', import.meta.url), 'utf8');
assert.match(picker, /kb\.byType/, 'Top-level activity groups must come from the canonical KB');
assert.match(picker, /kb\.specialistByDomain/, 'Specialist categories must use specialist-only taxonomy');
assert.match(picker, /primary===domain/, 'A specialist store must be assigned to only one primary category');
assert.match(picker, /seenNames\.has\(key\)/, 'Repeated display names must be suppressed across categories');
assert.match(picker, /repeat\(3,minmax\(0,1fr\)\)/, 'Store list must use a three-column grid');
assert.doesNotMatch(picker, /v5Category','v5Subcategory'/, 'The category and subcategory fields must remain visible');
assert.match(picker, /dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/, 'Changing the selected store must refresh the taxonomy cascade');
assert.match(picker, /selectedCategoryIds/, 'Category selections must be retained alongside store selections');
assert.match(picker, /selectedStoreIds/, 'Picker selection must be exposed to the Hooshyar bridge');
assert.match(picker, /tabs\.insertAdjacentElement\('afterend',root\)/, 'Multi-store picker must render inside the renamed discovery/category card, directly after its type tabs');
assert.doesNotMatch(picker, /select\.insertAdjacentElement\('afterend',root\)/, 'Multi-store picker must not remain attached to the separate profile form');

const profileSource = fs.readFileSync(new URL('../js/user-profile.js', import.meta.url), 'utf8');
assert.ok(!profileSource.includes('resolver.hasHandler(id)'),
  'The canonical store selector must not hide merchants whose search route is not configured');
assert.ok(picker.includes('new Set(Object.keys(kb.catalog||{}).map(String))'),
  'The picker must expose the full canonical catalog, including stores with unavailable routes');
assert.ok(engine.includes('selectedCandidatesAdded'),
  'Selected stores must be re-evaluated against canonical product-family evidence before filtering');
assert.ok(engine.includes('routeUnavailableCount'),
  'The resolver must expose unavailable-route diagnostics instead of silently dropping merchants');

const bridge = fs.readFileSync(new URL('../js/v8-store-select-sync.js', import.meta.url), 'utf8');
assert.match(bridge, /\['v5Subcategory','v6Brand','v6BudgetRange','v6Usage'\]/, 'Hooshyar query must use only subcategory, brand, budget range, and usage');
assert.doesNotMatch(bridge, /querySelectorAll\('select'\)/, 'Unrelated dynamic priority and requirement selectors must not enter the query');
assert.doesNotMatch(bridge, /optionText\('v5Category'\)/, 'Root category must not be inserted into the Hooshyar query');
assert.match(bridge, /searchForm\.requestSubmit\(\)/, 'The profile form must submit through Hooshyar itself');
assert.match(bridge, /document\.addEventListener\('submit',handleProfileSubmit,true\)/, 'Keyboard submission must be intercepted before the legacy profile-results handler');

const productOptions = fs.readFileSync(new URL('../js/v6-product-options.js', import.meta.url), 'utf8');
assert.match(productOptions, /categoryField\.insertAdjacentElement\('afterend',field\)/, 'Subcategory must appear immediately after the selected category');
assert.match(productOptions, /DOMAIN_ROOTS/, 'Generic stores must derive taxonomy from canonical business domains');
assert.match(productOptions, /ROOTS\.other/, 'Unknown stores must use an explicit fallback rather than Digikala taxonomy');
assert.match(productOptions, /education:\[\[/, 'Education stores must have a generic subcategory path');
assert.match(productOptions, /travel:\[\[/, 'Travel stores must have a generic subcategory path');
assert.match(productOptions, /v6BrandField/, 'The brand selector must remain part of the category cascade');

const controller = fs.readFileSync(new URL('../js/v8-taxonomy-controller.js', import.meta.url), 'utf8');
assert.match(controller, /berozkala/, 'Taxonomy controller must use the canonical BerozKala ID');
assert.match(controller, /digiyar:taxonomy-ready/, 'Taxonomy loader must notify the picker after all store scripts are ready');
assert.match(controller, /v6-mosbatesabz-taxonomy\.js/, 'Mosbatesabz taxonomy loader path must match the real file name');
assert.doesNotMatch(controller, /v6-mosbatesab-taxonomy\.js/, 'Misspelled Mosbatesabz taxonomy path must not remain');
assert.doesNotMatch(controller, /beruzkala/, 'The misspelled BerozKala ID must not remain');
const tax21 = fs.readFileSync(new URL('../js/v6-stores-21-25-taxonomy.js', import.meta.url), 'utf8');
assert.match(tax21, /eseminar:/, 'eSeminar taxonomy must match its canonical ID');
assert.match(tax21, /berozkala:/, 'BerozKala taxonomy must match its canonical ID');
const tax26 = fs.readFileSync(new URL('../js/v6-stores-26-30-taxonomy.js', import.meta.url), 'utf8');
assert.match(tax26, /['\"]?daroo-online['\"]?:/, 'Daroo Online taxonomy must match its canonical ID');
const slider = fs.readFileSync(new URL('../js/v8-ui.js', import.meta.url), 'utf8');
assert.match(slider, /v8-photo-head"><img src=.*?logoPath\(logo\).*?<strong>/, 'Slider logo must precede the store name in the right-to-left visual order');
const sliderCss = fs.readFileSync(new URL('../css/v8-ui.css', import.meta.url), 'utf8');
assert.match(sliderCss, /direction:ltr!important;display:flex!important;flex-direction:row-reverse!important;/, 'Slider identity order must be explicitly fixed, not inherited from page direction');

const input = fs.readFileSync(new URL('../js/v8-hooshyar-input.js', import.meta.url), 'utf8');
assert.match(input, /DigiYarProfileSearchStatus/, 'Hooshyar must report completion or an empty constrained result');
assert.match(input, /DigiYarStoreSelection&&typeof window\.DigiYarStoreSelection\.getFilters/, 'Hooshyar must receive the exact explicit store-picker filters');

console.log('V8 multi-store selection and Hooshyar filtering: PASS');
