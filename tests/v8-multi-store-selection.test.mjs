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

const bridge = fs.readFileSync(new URL('../js/v8-store-select-sync.js', import.meta.url), 'utf8');
assert.match(bridge, /form\.addEventListener\('submit',handleProfileSubmit\)/, 'Show-results must use the profile form submit event directly');
assert.match(bridge, /ابتدا عبارت کالا یا خدمت/, 'Missing search phrase must produce visible guidance');
assert.match(bridge, /discovery\.setSearchContext\(query,filters\)/, 'Show-results must invoke Hooshyar discovery directly');

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
assert.match(slider, /v8-photo-head"><strong>.*?logoPath\(logo\)/, 'Slider store name must precede the logo in RTL markup');

const input = fs.readFileSync(new URL('../js/v8-hooshyar-input.js', import.meta.url), 'utf8');
assert.match(input, /DigiYarProfileSearchStatus/, 'Hooshyar must report completion or an empty constrained result');

console.log('V8 multi-store selection and Hooshyar filtering: PASS');
