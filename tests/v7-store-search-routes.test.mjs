import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../js/store-business-domains.js');
await import('../js/v7-store-search-url.js');

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
const meghdad = resolver.resolve('meghdadit', 'لوازم جانبی دیجیتال');
assert.match(meghdad, /^https:\/\/meghdadit\.com\/\?s=/);
assert.match(decodeURIComponent(meghdad), /لوازم جانبی دیجیتال/);
assert.equal(resolver.resolve('dayan', 'کیف اداری'), '',
  'Unverified Dayan affiliate routes must fail closed rather than open login/home');
assert.equal(resolver.resolve('memarket', 'تصفیه هوا'), '',
  'MiMarket must fail closed until its product search route is verified');
assert.equal(resolver.resolve('iranmiz', 'میز اداری'), '',
  'A missing specialist route must not be replaced by its homepage');
assert.equal(resolver.hasHandler('meghdadit'), true);
assert.equal(resolver.hasHandler('iranmiz'), false);
console.log('V7 active search resolver contract: PASS');
