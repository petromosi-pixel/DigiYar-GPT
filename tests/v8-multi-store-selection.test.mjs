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
assert.match(picker, /kb\.byDomain/, 'Nested business categories must come from the canonical KB');
assert.match(picker, /selectedStoreIds/, 'Picker selection must be exposed to the Hooshyar bridge');

console.log('V8 multi-store selection and Hooshyar filtering: PASS');
