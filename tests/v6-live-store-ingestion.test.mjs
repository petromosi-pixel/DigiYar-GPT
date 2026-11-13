import fs from 'node:fs';
import path from 'node:path';
import parser from '../js/v6-hooshyar-query-parser.js';
import core from '../js/v6-hooshyar-search-core.js';

function readIndex(file, exportName) {
  return core.parseIndexSource(fs.readFileSync(path.join(process.cwd(), 'js', file), 'utf8'), exportName);
}

const live = readIndex('live-store-product-index-v6.js', 'LIVE_STORE_PRODUCTS');
const query = parser.parse('کالای دیجیتال موبایل شیائومی');
const results = core.search(live, query, { limit: 8 });

if (live.length < 20) throw new Error(`LIVE_INDEX_TOO_SMALL:${live.length}`);
if (!results.length) throw new Error('LIVE_SEARCH_EMPTY');
if (!results.every(p => /شیائومی|xiaomi|redmi|poco|\bmi\b/i.test(`${p.name} ${p.brand} ${p.model}`))) {
  throw new Error('LIVE_SEARCH_BRAND_FILTER_FAILED');
}
if (!results.every(p => /^https?:\/\//i.test(p.productUrl))) {
  throw new Error('LIVE_SEARCH_PRODUCT_URL_FAILED');
}
if (results.some(p => Number(p.price || 0) !== 0 || p.image)) {
  throw new Error('LIVE_INDEX_PRICE_OR_IMAGE_PRESENT');
}

const byStore = {};
for (const p of live) {
  const key = String(p.sourceId || 'unknown');
  byStore[key] = (byStore[key] || 0) + 1;
}

console.log(JSON.stringify({
  ok: true,
  liveCount: live.length,
  resultCount: results.length,
  stores: byStore,
  topResults: results.map(p => ({ name: p.name, store: p.sourceId, url: p.productUrl }))
}, null, 2));
