import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('js/v7-comparison-engine.js', 'utf8');
const context = { window:{}, console };
vm.runInNewContext(source, context);

const engine = context.window.DigiYarComparisonEngine;
assert.ok(engine, 'Comparison Engine must be exposed');

const results = [
  {
    id:'a', name:'محصول A', brand:'Brand A', model:'M1',
    source:'digikala', priceToman:12000000, score:82,
    attributes:{RAM:'8GB', Storage:'256GB'}
  },
  {
    id:'b', name:'محصول B', brand:'Brand B', model:'M2',
    bestOffer:{storeName:'snappshop',priceToman:15000000,currency:'IRT'},
    score:74,
    specifications:{RAM:'12GB', Storage:'256GB'}
  },
  {
    id:'c', name:'محصول C', brand:'Brand C', model:'M3',
    bestOffer:{storeName:'digikala',priceToman:10000000},
    score:91,
    attributes:{RAM:'8GB', Storage:'128GB'}
  }
];

const out = engine.compare(results);
assert.equal(out.status,'comparison_ready');
assert.equal(out.count,3);
assert.equal(out.meta.networkCalls,0);
assert.equal(out.meta.storeQuery,false);
assert.equal(out.priceComparison.min,10000000);
assert.equal(out.priceComparison.max,15000000);
assert.deepEqual(out.priceComparison.cheapestIds,['c']);
assert.equal(out.matchComparison.available,true);
assert.equal(out.storeComparison.length,2);

const ram = out.specificationComparison.find(x => x.field === 'ram');
assert.ok(ram, 'RAM must be comparable');
assert.equal(ram.valuesByProduct.length,3);

const table = engine.toTable(out);
assert.equal(table.length,3);
assert.equal(table[0].name,'محصول A');

const insufficient = engine.compare([results[0]]);
assert.equal(insufficient.status,'not_enough_results');

console.log('V7 Comparison Engine contract passed.');
