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
await import('../js/v8-persian-language-dictionary.js');
await import('../js/v8-store-catalog.js');
await import('../js/v8-store-search-url.js');

const source = fs.readFileSync(new URL('../js/v8-hooshyar-engine.js', import.meta.url), 'utf8');
assert.ok(source.includes('function init(){'), 'Discovery init anchor must exist');
vm.runInThisContext(source.replace(
  'function init(){',
  'window.__testResolveSearchContext=resolveSearchContext; window.__testAnalyzeQuery=analyzeQuery; function init(){'
), { filename:'v7-popular-store-discovery.test.js' });

const resolve = window.__testResolveSearchContext;
const analyze = window.__testAnalyzeQuery;
assert.ok(window.DigiYarPersianDictionary.resolve('پادری').some(x=>x.id==='doormat'));
assert.ok(window.DigiYarPersianDictionary.resolve('مبل').some(x=>x.id==='sofa'));
assert.equal(typeof resolve, 'function', 'Search-context resolver must be testable');
const ids = query => resolve(query).storeIds.slice().sort();
const exact = (query, expected) => assert.deepEqual(ids(query), expected.slice().sort(), query);
assert.deepEqual(ids('پادری'),ids('فرش جلوی در'),'Doormat synonyms must resolve to the same store set');
assert.deepEqual(ids('مبل'),ids('مبلمان'),'Sofa synonyms must resolve to the same store set');
const includes = (query, expected) => {
  const got = ids(query);
  for (const id of expected) assert.ok(got.includes(id), `${query}: missing relevant store ${id}; got ${got.join(',')}`);
};
const excludes = (query, forbidden) => {
  const got = ids(query);
  for (const id of forbidden) assert.ok(!got.includes(id), `${query}: irrelevant store ${id} leaked into results; got ${got.join(',')}`);
};

const general = ['digikala','torob','basalam'];
exact('دنبال دستگاه تصفیه هوای مناسب اتاق خواب هستم', general);
includes('پادری', general);
excludes('مبل', ['iranmiz','partochoob','chidahome','tidawood']);
const sofaRanked = resolve('مبل').storeIds;
assert.ok(sofaRanked.includes('digikala'));
assert.ok(!sofaRanked.includes('iranmiz'), 'A specialist without a verified product-search route must not be displayed');
excludes('پادری', ['iranmiz','partochoob','chidahome','tidawood']);

includes('فرش جلوی در', general);
includes('یخچال فریزر', general);
includes('جارو برقی', general);
includes('سشوار', general);
includes('مودم وای‌فای', general);
includes('کلاه کاسکت', general);
includes('غذای گربه', general);
excludes('پادری', ['iranmiz','partochoob','chidahome','tidawood']);
assert.equal(resolve('فرش جلوی در').intent,'general_product');
assert.ok(window.DigiYarPersianDictionary.resolve('فرش جلوی در').some(x=>x.domains.includes('home')),
  'Doormat must resolve into the home product domain');

exact('یه چیزی می‌خوام برای تمیز کردن مبل پارچه‌ای', general);
exact('بلیط قطار تهران مشهد', ['alibaba','ghasedak24','mrbilit']);
includes('لوازم جانبی موبایل', [...general,'janebi','digido','digiland','gooshishop','berozkala','technolife']);
includes('لوازم جانبی گوشی سامسونگ', [...general,'digido','digiland','gooshishop','berozkala','technolife','meghdadit']);
exact('کیف اداری برای محل کارم می‌خوام', [...general,'janebi','modiseh']);
exact('یه ضد آفتاب برای پوست خشک می‌خوام', [...general,'khanoumi','darukade','mosbatesabz','solokala']);
exact('ترازو هوشمند آشپزخانه', [...general,'technolife']);

excludes('بلیط قطار تهران مشهد', ['eghamat24','jobama','flytoday','flysepehran']);
excludes('لوازم جانبی موبایل', ['divar','sheypoor','esam','takhfifan','memarket']);
excludes('لوازم جانبی گوشی سامسونگ', ['janebi','divar','sheypoor','esam','takhfifan','memarket']);
excludes('کیف اداری برای محل کارم می‌خوام', ['divar','sheypoor','esam','takhfifan']);
excludes('یه ضد آفتاب برای پوست خشک می‌خوام', ['janebi','pinket','memarket','takhfifan']);
excludes('ترازو هوشمند آشپزخانه', ['iranmiz','partochoob','chidahome','tidawood','janebi','memarket','divar','sheypoor']);

const office = resolve('کیف اداری برای محل کارم می‌خوام');
assert.equal(window.DigiYarStoreSearchUrl.resolveRoute('dayan','کیف اداری').kind, 'homepage_fallback');
assert.ok(!office.storeIds.includes('dayan'), 'Dayan must be hidden until a verified product-search route exists');
assert.equal(resolve('بلیط قطار تهران مشهد').intent, 'train_ticket');
assert.equal(resolve('لوازم جانبی موبایل').intent, 'mobile_accessory');
assert.equal(resolve('یه ضد آفتاب برای پوست خشک می‌خوام').intent, 'sunscreen');
assert.equal(resolve('ترازو هوشمند آشپزخانه').intent, 'kitchen_scale');


/* V8 vocabulary-generalization checks: alternate names should reach the same product family. */
includes('هواپز بدون روغن برای آشپزخانه', general);
includes('ربات جارو برای تمیز کردن خانه', general);
includes('پایه مانیتور ارگونومیک', ['digikala','torob']);
includes('ماوس بی‌سیم برای لپ‌تاپ', ['digikala','torob','janebi']);
includes('یه گوشی خفن واسه عکس گرفتن می‌خوام', general);
includes('یه لپ‌تاپ گیمینگ واسه بازی می‌خوام', general);
includes('یه یخچال ساید برای خونه می‌خوام', general);
includes('لباسشور درب از جلو می‌خوام', general);
includes('یه مودم اینترنت برای خونه می‌خوام', general);
includes('مبل‌شوی برای تمیز کردن مبل پارچه‌ای', general);
assert.ok(resolve('هواپز بدون روغن برای آشپزخانه').storeIds.length > 0,
  'A colloquial synonym must not produce an empty result set');
assert.ok(resolve('پایه مانیتور ارگونومیک').storeIds.length > 0,
  'A new product phrase must be matched through its canonical product family');


/* Structured query understanding: preserve the product concept while extracting use and feature context. */
const campusLaptop=analyze('یه لپ تاپ اقتصادی برای دانشگاه میخوام');
assert.equal(campusLaptop.intent,'digital_product');
assert.ok(campusLaptop.concepts.some(x=>x.id==='laptop'));
assert.ok(campusLaptop.usage.includes('study'));
assert.ok(campusLaptop.features.includes('budget'));
assert.equal(analyze('مبل شور برای لکه های مبل').intent,'upholstery_cleaning');
exact('مبل شور برای لکه های مبل',general);
assert.ok(analyze('مودم خونگی برای اتاق خواب').usage.includes('home'));
const petVacuum=analyze('یه جاروبرقی کم صدا برای جمع کردن موی گربه توی خونه میخوام');
assert.ok(petVacuum.concepts.some(x=>x.id==='vacuum-cleaner'));
assert.equal(petVacuum.primaryConcept.id,'vacuum-cleaner');
assert.ok(petVacuum.usage.includes('pet_hair'));
assert.ok(petVacuum.usage.includes('home'));
assert.ok(petVacuum.features.includes('quiet'));
const budgetLaptop=analyze('یه لپ تاپ دانشجویی تا ۳۰ میلیون تومن میخوام');
assert.equal(budgetLaptop.budget.maxPriceToman,30000000);
assert.equal(budgetLaptop.budget.operator,'max');
assert.equal(resolve('یه لپ تاپ دانشجویی تا ۳۰ میلیون تومن میخوام').queryAnalysis.budget.maxPriceToman,30000000);
assert.ok(budgetLaptop.usage.includes('study'));
assert.equal(analyze('مقایسه لپ تاپ و تبلت').queryMode,'compare');
assert.equal(analyze('جارو تا ۳۰ دقیقه میخوام').budget,null,
  'A duration must not be mistaken for a price budget');
assert.equal(analyze('یه مودم بی سیم کم مصرف برای خونه').features.includes('wireless'),true);
assert.equal(analyze('یه مودم بی سیم کم مصرف برای خونه').features.includes('low_power'),true);


console.log('V8 Hooshyar relevance scenarios: PASS (existing relevance/exclusion plus synonym generalization)');

/* Unknown vocabulary must still reach the correct merchant category. */
const unknownProduct=resolve('نمکدان سرامیکی دست ساز');
assert.equal(unknownProduct.queryAnalysis.requestKind,'product');
exact('نمکدان سرامیکی دست ساز',['digikala','torob','basalam']);
excludes('نمکدان سرامیکی دست ساز',['snappshop','memarket','dayan']);
const unknownFood=resolve('نوشیدنی جو دوسر');
assert.equal(unknownFood.queryAnalysis.requestKind,'food');
exact('نوشیدنی جو دوسر',['digikala','torob','basalam','pinket']);
const serviceRequest=resolve('خدمات کارشناسی خودرو');
assert.equal(serviceRequest.queryAnalysis.requestKind,'service');
exact('خدمات کارشناسی خودرو',[]);
assert.ok(analyze('نوشیدنی جو دوسر').inferredDomains.includes('supermarket'));
assert.ok(analyze('خدمات کارشناسی خودرو').inferredDomains.includes('auto_service'));
console.log('V8 unknown-query category fallback: PASS');

/* Every visible product result must resolve to a validated direct search page. */
for (const query of ['نمکدان سرامیکی دست ساز','نوشیدنی جو دوسر','کیف اداری','مبل','بلیط قطار تهران مشهد','خدمات کارشناسی خودرو']) {
  const result=resolve(query);
  assert.deepEqual(result.routeUnavailableStoreIds,[],query+': no route-unavailable merchant may be displayed');
  for (const id of result.storeIds) {
    const route=window.DigiYarStoreSearchUrl.resolveSearchRoute(id,query);
    assert.ok(route&&route.kind==='search'&&route.directSearch,query+': '+id+' must have a verified direct search route');
  }
}

