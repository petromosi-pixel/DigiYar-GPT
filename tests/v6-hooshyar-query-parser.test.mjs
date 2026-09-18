import assert from 'node:assert/strict';
import parser from '../js/v6-hooshyar-query-parser.js';

const taxonomy = {
  categoryOptions: [
    { value: 'digital', label: 'کالای دیجیتال' },
    { value: 'home', label: 'خانه و آشپزخانه' },
  ],
  subcategoryOptions: [
    { value: 'mobile', label: 'موبایل' },
    { value: 'laptop', label: 'لپ‌تاپ' },
    { value: 'tv', label: 'تلویزیون' },
    { value: 'headphones', label: 'هدفون و هندزفری' },
  ],
  brandOptions: [
    { value: 'سامسونگ', label: 'سامسونگ' },
    { value: 'شیائومی', label: 'شیائومی' },
    { value: 'ایسوس', label: 'ایسوس' },
  ],
};

const cases = [
  ['گوشی شیائومی تا ۲۰ میلیون', 'digital', 'mobile', 'شیائومی', 20_000_000],
  ['لپ‌تاپ ایسوس تا ۵۰ میلیون', 'digital', 'laptop', 'ایسوس', 50_000_000],
  ['تلویزیون سامسونگ', 'digital', 'tv', 'سامسونگ', null],
  ['هدفون بی‌سیم', 'digital', 'headphones', null, null],
  ['موبایل شیائومی تا ۲۰ میلیون بازی و گیمینگ', 'digital', 'mobile', 'شیائومی', 20_000_000],
];

for (const [input, category, subcategory, brand, budget] of cases) {
  const q = parser.parse(input, taxonomy);
  assert.equal(q.category, category, input);
  assert.equal(q.subcategory, subcategory, input);
  assert.equal(q.brand, brand, input);
  assert.equal(q.budget?.max ?? null, budget, input);
  if (input.includes('بازی و گیمینگ')) assert.equal(q.usage, 'gaming', input);
}

assert.equal(parser.parseBudget('تا ۲۰ میلیون').max, 20_000_000);
assert.equal(parser.parseBudget('بین ۱۰ تا ۳۰ میلیون').min, 10_000_000);
assert.equal(parser.parseBudget('بین ۱۰ تا ۳۰ میلیون').max, 30_000_000);

const canonical = parser.parse('گوشی شیائومی تا ۲۰ میلیون', taxonomy);
assert.equal(parser.toSearchText(canonical), 'موبایل شیائومی');

console.log(`V6 Hooshyar parser tests passed: ${cases.length + 3} cases`);
