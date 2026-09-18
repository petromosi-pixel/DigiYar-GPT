import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import parser from '../js/v6-hooshyar-query-parser.js';
import core from '../js/v6-hooshyar-search-core.js';

function readIndex(file, exportName) {
  return core.parseIndexSource(fs.readFileSync(path.join(process.cwd(), 'js', file), 'utf8'), exportName);
}

const mobile = readIndex('mobile-product-index-v5.1.js', 'MOBILE_PRODUCTS');
const laptop = readIndex('laptop-computer-product-index-v5.1.js', 'LAPTOP_COMPUTER_PRODUCTS');
const digital = readIndex('digital-product-index-v5.1.js', 'DIGITAL_PRODUCTS');

assert.ok(mobile.length > 0, 'mobile index must be non-empty');
assert.ok(laptop.length > 0, 'laptop index must be non-empty');
assert.ok(digital.length > 0, 'digital index must be non-empty');

const taxonomy = {
  categoryOptions: [{ value: 'digital', label: 'کالای دیجیتال' }],
  subcategoryOptions: [
    { value: 'mobile', label: 'موبایل' },
    { value: 'laptop', label: 'لپ‌تاپ' },
    { value: 'tv', label: 'تلویزیون' },
  ],
  brandOptions: [
    { value: 'شیائومی', label: 'شیائومی' },
    { value: 'ایسوس', label: 'ایسوس' },
    { value: 'سامسونگ', label: 'سامسونگ' },
  ],
};

const qMobile = parser.parse('گوشی شیائومی تا ۲۰ میلیون', taxonomy);
const qLaptop = parser.parse('لپ‌تاپ ایسوس تا ۵۰ میلیون', taxonomy);
const qTv = parser.parse('تلویزیون سامسونگ', taxonomy);

const mobileResults = core.search(mobile.concat(digital), qMobile, { limit: 8 });
assert.ok(mobileResults.length > 0, 'mobile results must exist');
const laptopResults = core.search(laptop.concat(digital), qLaptop, { limit: 8 });
const tvResults = core.search(digital, qTv, { limit: 8 });

for (const p of mobileResults) {
  assert.ok(core.priceToman(p) <= 20_000_000, `mobile result over budget: ${p.name}`);
  assert.match(String(p.name), /شیائومی|xiaomi/i, `mobile result is not Xiaomi: ${p.name}`);
}
for (const p of laptopResults) {
  assert.ok(core.priceToman(p) <= 50_000_000, `laptop result over budget: ${p.name}`);
  assert.match(String(p.name), /ایسوس|asus/i, `laptop result is not Asus: ${p.name}`);
}
for (const p of tvResults) {
  assert.match(String(p.name), /سامسونگ|samsung/i, `TV result is not Samsung: ${p.name}`);
}

const synthetic = [
  { id: 'a', name: 'گوشی موبایل شیائومی Redmi Note', brand: 'شیائومی', category: 'mobile', subcategory: 'گوشی موبایل', price: 18_000_000, currency: 'IRT', productUrl: 'https://example.com/a' },
  { id: 'b', name: 'گوشی موبایل شیائومی گران', brand: 'شیائومی', category: 'mobile', subcategory: 'گوشی موبایل', price: 28_000_000, currency: 'IRT', productUrl: 'https://example.com/b' },
  { id: 'c', name: 'گوشی موبایل سامسونگ', brand: 'سامسونگ', category: 'mobile', subcategory: 'گوشی موبایل', price: 15_000_000, currency: 'IRT', productUrl: 'https://example.com/c' },
];
const syntheticResults = core.search(synthetic, qMobile, { limit: 8 });
assert.deepEqual(syntheticResults.map((p) => p.id), ['a']);

console.log(`V6 Hooshyar Search Core passed: indexes=${mobile.length}/${laptop.length}/${digital.length}, liveQueries=3, syntheticHardFilter=1`);
