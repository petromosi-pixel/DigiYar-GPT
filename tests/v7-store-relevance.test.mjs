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
assert.ok(source.includes('function init(){'), 'Discovery init anchor must exist');
vm.runInThisContext(source.replace(
  'function init(){',
  'window.__testResolveSearchContext=resolveSearchContext; function init(){'
), { filename:'v7-popular-store-discovery.test.js' });

const resolve = window.__testResolveSearchContext;
assert.equal(typeof resolve, 'function', 'Search-context resolver must be testable');
const ids = query => resolve(query).storeIds.slice().sort();
const exact = (query, expected) => assert.deepEqual(ids(query), expected.slice().sort(), query);
const includes = (query, expected) => {
  const got = ids(query);
  for (const id of expected) assert.ok(got.includes(id), `${query}: missing relevant store ${id}; got ${got.join(',')}`);
};
const excludes = (query, forbidden) => {
  const got = ids(query);
  for (const id of forbidden) assert.ok(!got.includes(id), `${query}: irrelevant store ${id} leaked into results; got ${got.join(',')}`);
};

const general = ['digikala','snappshop','torob','basalam'];
exact('دنبال دستگاه تصفیه هوای مناسب اتاق خواب هستم', general);
exact('یه چیزی می‌خوام برای تمیز کردن مبل پارچه‌ای', general);
includes('بلیط قطار تهران مشهد', ['alibaba','ghasedak24','mrbilit','shab','safarme']);
includes('لوازم جانبی موبایل', [...general,'janebi','digido','digiland','gooshishop','berozkala','technolife','meghdadit']);
includes('لوازم جانبی گوشی سامسونگ', [...general,'digido','digiland','gooshishop','berozkala','technolife','meghdadit']);
exact('کیف اداری برای محل کارم می‌خوام', [...general,'dayan','janebi','modiseh']);
includes('یه ضد آفتاب برای پوست خشک می‌خوام', [...general,'khanoumi','darukade','mosbatesabz','solokala','daroo-online','shavaz']);
exact('ترازو هوشمند آشپزخانه', [...general,'technolife']);

excludes('بلیط قطار تهران مشهد', ['eghamat24','jobama','flytoday','flysepehran','safarmarket','raja']);
excludes('لوازم جانبی موبایل', ['divar','sheypoor','esam','takhfifan','memarket']);
excludes('لوازم جانبی گوشی سامسونگ', ['janebi','divar','sheypoor','esam','takhfifan','memarket']);
excludes('کیف اداری برای محل کارم می‌خوام', ['divar','sheypoor','esam','memarket','takhfifan']);
excludes('یه ضد آفتاب برای پوست خشک می‌خوام', ['janebi','neshatrokh','pinket','memarket','takhfifan']);
excludes('ترازو هوشمند آشپزخانه', ['iranmiz','partochoob','chidahome','tidawood','janebi','memarket','divar','sheypoor']);

const office = resolve('کیف اداری برای محل کارم می‌خوام');
assert.equal(window.DigiYarStoreSearchUrl.resolveRoute('dayan','کیف اداری').kind, 'homepage_fallback');
assert.ok(office.storeIds.includes('dayan'), 'Dayan remains discoverable but must be clearly marked as homepage fallback');
assert.equal(resolve('بلیط قطار تهران مشهد').intent, 'train_ticket');
assert.equal(resolve('لوازم جانبی موبایل').intent, 'mobile_accessory');
assert.equal(resolve('یه ضد آفتاب برای پوست خشک می‌خوام').intent, 'sunscreen');
assert.equal(resolve('ترازو هوشمند آشپزخانه').intent, 'kitchen_scale');


/* V8 vocabulary-generalization checks: alternate names should reach the same product family. */
includes('هواپز بدون روغن برای آشپزخانه', general);
includes('ربات جارو برای تمیز کردن خانه', general);
includes('پایه مانیتور ارگونومیک', ['digikala','torob']);
includes('ماوس بی‌سیم برای لپ‌تاپ', ['digikala','torob','janebi']);
assert.ok(resolve('هواپز بدون روغن برای آشپزخانه').storeIds.length > 0,
  'A colloquial synonym must not produce an empty result set');
assert.ok(resolve('پایه مانیتور ارگونومیک').storeIds.length > 0,
  'A new product phrase must be matched through its canonical product family');

console.log('V8 Hooshyar relevance scenarios: PASS (existing relevance/exclusion plus synonym generalization)');
