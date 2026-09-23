import assert from 'node:assert/strict';
import { LIVE_STORE_IDS, searchLiveStore } from '../js/v7-live-store-adapters.mjs';

assert.deepEqual(LIVE_STORE_IDS.sort(), ['basalam','esam','torob']);
const sample = '<script type="application/ld+json">{"@type":"Product","name":"میز اداری","url":"https://torob.com/product/x","offers":{"price":"150000000","priceCurrency":"IRT"}}</script>';
const oldFetch = globalThis.fetch;
globalThis.fetch = async () => new Response(sample,{status:200,headers:{'content-type':'text/html'}});
const result = await searchLiveStore('torob','مبلمان اداری برای محل کار ۱۲۰ تا ۲۰۰ میلیون تومان');
assert.equal(result.ok,true);
assert.equal(result.results[0].name,'میز اداری');
assert.equal(result.results[0].priceToman,150000000);
assert.equal(result.results[0].storeId,'torob');
globalThis.fetch = oldFetch;
console.log('V7 live store adapters: PASS');
