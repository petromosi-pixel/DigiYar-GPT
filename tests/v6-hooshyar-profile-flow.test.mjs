import assert from 'node:assert/strict';
import fs from 'node:fs';

const sync = fs.readFileSync('js/store-select-sync.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const options = fs.readFileSync('js/v6-product-options.js', 'utf8');

const profileBlock = sync.match(/function profileParts\(\)\{([\s\S]*?)\n  \}/)?.[1] || '';
assert.deepEqual(
  [...profileBlock.matchAll(/optionText\('([^']+)'\)/g)].map((m) => m[1]),
  ['v5Subcategory', 'v6Brand', 'v6BudgetRange', 'v6Usage'],
  'Hooshyar profile query must read exactly the four requested fields in order',
);
assert.ok(!profileBlock.includes('storeSelect'), 'store selector must not enter Hooshyar query');
assert.ok(!profileBlock.includes('v5Category'), 'category must not enter Hooshyar query');
assert.match(sync, /function ensureUsageField\(\)[\s\S]*?id='v6Usage'/);
assert.match(sync, /smartForm\.requestSubmit\(\)/);
assert.match(sync, /function clearResultsAndQuery\(\)[\s\S]*?v5SmartSearchResults/);
assert.match(sync, /function clearResultsAndQuery\(\)[\s\S]*?v6StoreSimulatorResults/);
assert.match(index, /js\/store-select-sync\.js\?v=/);
assert.match(options, /id='v5Subcategory'/);
assert.match(options, /id='v6Brand'/);
assert.match(options, /id='v6BudgetRange'/);

console.log('V6 Hooshyar profile-flow contract passed: four fields, simulator lifecycle, hint isolation');
