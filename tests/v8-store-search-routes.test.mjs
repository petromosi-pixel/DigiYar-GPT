import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../js/v8-store-catalog.js');
await import('../js/v8-store-search-url.js');

const kb = window.DigiYarStoreBusinessDomains;
const resolver = window.DigiYarStoreSearchUrl;
assert.ok(kb && kb.catalog, 'The unified merchant catalog must load');
assert.ok(resolver && typeof resolver.resolve === 'function', 'The active URL resolver must load');
assert.ok(kb.catalog.meghdadit.domains.includes('digital'));
assert.ok(kb.catalog.meghdadit.domains.includes('accessories'));
assert.ok(kb.catalog.meghdadit.products.some(x => /لوازم جانبی دیجیتال/.test(x)),
  'Meghdad IT must be represented in the digital-accessories inventory');

const digikala = resolver.resolve('digikala', 'گوشی موبایل');
assert.match(digikala, /^https:\/\/www\.digikala\.com\/search\/\?q=/);
assert.match(decodeURIComponent(digikala), /گوشی موبایل/);
const descriptive = resolver.resolve('digikala', 'دنبال دستگاه تصفیه هوای مناسب اتاق خواب هستم');
assert.match(decodeURIComponent(descriptive), /اتاق خواب/);
assert.match(decodeURIComponent(descriptive), /مناسب/);
const descriptiveTorob = resolver.resolve('torob', 'کیف اداری برای محل کارم می‌خوام');
assert.match(decodeURIComponent(descriptiveTorob), /محل کارم/);
const basalamAccessories = resolver.resolve('basalam', 'لوازم جانبی موبایل');
assert.match(decodeURIComponent(basalamAccessories), /لوازم جانبی موبایل/);
const basalamSamsung = resolver.resolve('basalam', 'لوازم جانبی گوشی سامسونگ');
assert.match(decodeURIComponent(basalamSamsung), /سامسونگ/);
const meghdad = resolver.resolve('meghdadit', 'لوازم جانبی دیجیتال');
assert.match(meghdad, /^https:\/\/meghdadit\.com\/\?s=/);
assert.match(decodeURIComponent(meghdad), /لوازم جانبی دیجیتال/);
assert.equal(resolver.resolveRoute('dayan', 'کیف اداری').kind, 'homepage_fallback',
  'Dayan must use its canonical homepage until a verified product-search route exists');
assert.equal(resolver.resolveRoute('memarket', 'تصفیه هوا').kind, 'homepage_fallback',
  'MiMarket must use its canonical homepage until a verified product-search route exists');
assert.equal(resolver.resolveRoute('iranmiz', 'میز اداری').kind, 'homepage_fallback',
  'Relevant specialist stores without a direct search route must remain visible via their canonical homepage');
const modiseh = resolver.resolve('modiseh', 'کیف اداری');
assert.ok(modiseh.startsWith('https://www.modiseh.com/catalogsearch/result/?q='));
assert.match(decodeURIComponent(modiseh), /کیف اداری/);
const solokala = resolver.resolve('solokala', 'ضد آفتاب برای پوست خشک');
assert.ok(solokala.startsWith('https://solokala.com/?s='));
assert.match(solokala, /post_type=product/);
assert.match(decodeURIComponent(solokala), /ضد آفتاب برای پوست خشک/);
assert.equal(resolver.hasHandler('meghdadit'), true);
assert.equal(resolver.hasSearchHandler('meghdadit'), true);
assert.equal(resolver.hasHandler('iranmiz'), true);
assert.equal(resolver.hasSearchHandler('iranmiz'), false);
for (const id of kb.ids()) {
  const route = resolver.resolveRoute(id, 'نمونه کالا');
  assert.ok(route && /^https:\/\//.test(route.url), `Every catalog store must have a safe route: ${id}`);
  assert.ok(['search', 'homepage_fallback'].includes(route.kind), `Route kind must be explicit: ${id}`);
  assert.equal(resolver.hasHandler(id), true, `Every catalog store must be routable: ${id}`);
}

console.log('V8 active search resolver contract: PASS');
