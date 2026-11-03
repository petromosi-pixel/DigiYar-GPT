import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window = globalThis;
globalThis.document = {
  readyState:'loading',
  addEventListener(){},
  getElementById(){ return null; },
  querySelector(){ return null; },
  querySelectorAll(){ return []; }
};
await import('../js/v8-store-catalog.js');
await import('../js/v8-store-search-url.js');

const source = fs.readFileSync(new URL('../js/v8-hooshyar-engine.js', import.meta.url), 'utf8');
vm.runInThisContext(source.replace(
  'function init(){',
  'window.__resolveSearchContext=resolveSearchContext; window.__applyStoreSelection=applyStoreSelection; function init(){'
), { filename:'v8-hooshyar-selection-filter.test.mjs' });

const resolve = window.__resolveSearchContext;
const apply = window.__applyStoreSelection;
const broad = resolve('کیف چرمی اداری');
for (const id of ['dayan','memarket','janebi','digikala']) {
  assert.ok(broad.storeIds.includes(id), 'Missing relevant catalog match: '+id+'; got '+broad.storeIds.join(','));
}
const filtered = apply(resolve('کیف چرمی اداری'), {
  active:true,
  selectedStoreIds:['dayan','memarket','janebi','digikala','torob']
});
for (const id of ['dayan','memarket','janebi','digikala']) {
  assert.ok(filtered.storeIds.includes(id), 'Selected relevant store was filtered out: '+id);
}
assert.ok(filtered.storeIds.every(id => ['dayan','memarket','janebi','digikala','torob'].includes(id)),
  'A store outside the user selection leaked into results');
console.log('V8 strong-token relevance and selected-store filtering: PASS');
