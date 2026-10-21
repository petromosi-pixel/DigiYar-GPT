import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  DigiYarStoreCategories: {},
  DigiYarShoppingPlan: null,
  DigiYarAffiliateUrls: {},
  DigiYarPopularAffiliateStores: []
};
globalThis.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; },
  createElement() { return { style: {}, appendChild() {}, addEventListener() {} }; },
  head: { appendChild() {} }
};

await import('../js/store-business-domains.js');
await import('../js/user-profile.js');
await import('../js/v7-store-eligibility.js');
await import('../js/v7-hooshyar-three-engine.js');
await import('../js/v7-ai-shopping-orchestrator.js');
await import('../js/v6-store-browser.js');

const catalog = window.DigiYarStoreBusinessDomains.catalog;
const engine = window.DigiYarHooshyarThreeEngine;
assert.ok(window.DigiYarStoreCategories.modiseh.includes('کیف اداری'),
  'the canonical store-category reference must identify Modiseh as an office-bag specialist');
/* Regression: a merchant declared only through a KB alias/query signal/
   specialty/product family must be retrievable without a hard-coded query rule. */
const kbEvidenceFixture = {
  kb_alias_only: {name:'Alias-only specialist',domains:['home'],products:[],aliases:['ترازوی هوشمند آشپزخانه'],querySignals:[],specialties:[],productFamilies:[]},
  kb_signal_only: {name:'Signal-only specialist',domains:['home'],products:[],aliases:[],querySignals:['ترازوی هوشمند آشپزخانه'],specialties:[],productFamilies:[]},
  kb_family_only: {name:'Family-only specialist',domains:['home'],products:[],aliases:[],querySignals:[],specialties:[],productFamilies:['ترازوی هوشمند آشپزخانه']},
  digikala: {name:'General store',domains:['home'],products:['ترازوی هوشمند آشپزخانه'],aliases:[],querySignals:[],specialties:[],productFamilies:[]},
  kb_unrelated: {name:'Unrelated furniture',domains:['furniture'],products:['میز ناهارخوری'],aliases:[],querySignals:[],specialties:[],productFamilies:[]}
};
const kbEvidenceResult = engine.resolve('ترازوی هوشمند آشپزخانه', kbEvidenceFixture, [], null);
for (const id of ['kb_alias_only','kb_family_only','digikala']) {
  assert.ok(kbEvidenceResult.eligibleStoreIds.includes(id), `KB inventory evidence failed to retrieve ${id}`);
}
assert.ok(!kbEvidenceResult.eligibleStoreIds.includes('kb_signal_only'),
  'querySignals alone must never qualify a merchant without declared inventory evidence');
assert.ok(!kbEvidenceResult.eligibleStoreIds.includes('kb_unrelated'),
  'unrelated KB entries must not be admitted merely because they share a domain');
const categoryOnlyFixture = {
  skin_category_only: {name:'Skin-care category specialist',domains:['beauty'],products:[],aliases:[],specialties:[],productFamilies:[],categories:['مراقبت پوست']},
  skin_wrong_category: {name:'Unrelated books store',domains:['beauty'],products:[],aliases:[],specialties:[],productFamilies:[],categories:['کتاب و لوازم تحریر']},
  bag_category_only: {name:'Leather goods specialist',domains:['fashion'],products:[],aliases:[],specialties:[],productFamilies:[],categories:['کیف و محصولات چرمی']},
  bag_broad_fashion_only: {name:'Generic fashion store',domains:['fashion'],products:[],aliases:[],specialties:[],productFamilies:[],categories:['مد و پوشاک']}
};
const categorySkinResult = engine.resolve('یه ضد آفتاب برای پوست خشک می‌خوام', categoryOnlyFixture, [], null);
assert.ok(categorySkinResult.eligibleStoreIds.includes('skin_category_only'),
  'matching store-category taxonomy must retrieve a specialist even when product aliases are incomplete');
assert.ok(!categorySkinResult.eligibleStoreIds.includes('skin_wrong_category'),
  'an unrelated store category must not qualify a merchant');
const categoryBagResult = engine.resolve('کیف اداری برای محل کارم', categoryOnlyFixture, [], null);
assert.ok(categoryBagResult.eligibleStoreIds.includes('bag_category_only'),
  'the relevant leather/bag category must retrieve an office-bag specialist');
assert.ok(!categoryBagResult.eligibleStoreIds.includes('bag_broad_fashion_only'),
  'broad fashion category alone must not prove office-bag relevance');
/* Integration regression: the homepage's canonical category map is joined to
   the search catalog, including specialists absent from the business-domain
   inventory. This catches the former split-brain state where categories were
   visible in UI but invisible to Hooshyar retrieval. */
window.DigiYarStoreCategories.category_only_skin_specialist = ['مراقبت پوست'];
window.DigiYarStoreCategories.category_only_bag_specialist = ['کیف و محصولات چرمی'];
window.DigiYarStoreCategories.category_only_laptop_specialist = ['لپ‌تاپ'];
window.DigiYarStoreCategories.category_only_accessory_store = ['کوله و کیف لپ‌تاپ','لوازم جانبی موبایل'];
const canonicalSkinResult = engine.resolve('یه ضد آفتاب برای پوست خشک می‌خوام', {}, [], null);
assert.ok(canonicalSkinResult.eligibleStoreIds.includes('category_only_skin_specialist'),
  'Hooshyar must discover a specialist from the canonical category reference even without a KB product alias');
assert.equal(canonicalSkinResult.trace.categoryReferenceUsed, true,
  'resolver trace must confirm use of the canonical store-category reference');
assert.ok(canonicalSkinResult.trace.catalogStoreCount >= Object.keys(window.DigiYarStoreCategories).length,
  'the canonical category map must be merged into the resolver catalog');
const canonicalBagResult = engine.resolve('کیف اداری برای محل کارم', {}, [], null);
assert.ok(canonicalBagResult.eligibleStoreIds.includes('category_only_bag_specialist'),
  'leather/bag specialist must be discovered from the canonical taxonomy alone');
assert.ok(!canonicalBagResult.eligibleStoreIds.includes('category_only_skin_specialist'),
  'a skin-care-only specialist must not leak into office-bag results');
const canonicalLaptopResult = engine.resolve('لپ‌تاپ برای دانشجو', {}, [], null);
assert.ok(canonicalLaptopResult.eligibleStoreIds.includes('category_only_laptop_specialist'),
  'laptop specialist must be discovered from canonical laptop category');
assert.ok(!canonicalLaptopResult.eligibleStoreIds.includes('category_only_accessory_store'),
  'laptop bags/accessories must not qualify as laptop-computer merchants');
/* Keep synthetic category-only fixtures isolated from later end-to-end cases. */
delete window.DigiYarStoreCategories.category_only_skin_specialist;
delete window.DigiYarStoreCategories.category_only_bag_specialist;
delete window.DigiYarStoreCategories.category_only_laptop_specialist;
delete window.DigiYarStoreCategories.category_only_accessory_store;


const inflectedKbResult = engine.resolve('ترازوهای هوشمند برای آشپزخانه', kbEvidenceFixture, [], null);
for (const id of ['kb_alias_only','kb_family_only','digikala']) {
  assert.ok(inflectedKbResult.eligibleStoreIds.includes(id),
    `Persian inflection/word order prevented KB retrieval for ${id}`);
}
assert.ok(!inflectedKbResult.eligibleStoreIds.includes('kb_signal_only'),
  'a broad query signal must not override missing product inventory');

const browser = window.DigiYarStoreBrowser;
assert.ok(browser && typeof browser.resolveSearchUrl === 'function', 'Store Browser must expose the real URL resolver');

const query = 'دستگاه تصفیه هوا';
for (const [id,host] of [['snappshop','snappshop.ir'],['basalam','basalam.com']]) {
  const url = new URL(browser.resolveSearchUrl(id, query));
  assert.equal(url.hostname, host, `${id} must open its own search page, not Google`);
  assert.equal(url.pathname, '/search', `${id} must use the merchant search route`);
  assert.ok((url.searchParams.get('q') || url.searchParams.get('query') || '').includes(query),
    `${id} search URL must preserve the requested product phrase`);
}
/* These assertions exercise the same category reference used by the homepage. */
assert.ok(window.DigiYarStoreCategories.khanoumi.includes('مراقبت پوست'));
assert.ok(window.DigiYarStoreCategories.neshatrokh.includes('مراقبت پوست'));
assert.ok(window.DigiYarStoreCategories.shavaz.includes('مراقبت پوست'));
const skinPlan = await window.DigiYarShoppingOrchestrator.run('یه ضد آفتاب برای پوست خشک می‌خوام');
for (const id of ['digikala','snappshop','torob','basalam','banimode','khanoumi','neshatrokh','shavaz','darukade','mosbatesabz']) {
  assert.ok(skinPlan.ai.eligibleStoreIds.includes(id),
    `skin-care category retrieval omitted specialist ${id}`);
}
const scalePlan = await window.DigiYarShoppingOrchestrator.run('ترازوهای هوشمند برای آشپزخانه');
assert.equal(scalePlan.ai.engineTrace.parsedConcept,'kitchen_scale',
  'kitchen-scale queries must be parsed as a specific product rather than drifting into furniture/home defaults');
assert.ok(['digikala','snappshop','torob','basalam'].every(id=>scalePlan.ai.eligibleStoreIds.includes(id)),
  'kitchen-scale category retrieval must discover relevant broad marketplaces');
assert.ok(scalePlan.ai.eligibleStoreIds.every(id => {
  const q=scalePlan.ai.searchQueries[id]||'';
  return /ترازو/i.test(q);
}), 'kitchen-scale merchant queries must preserve the requested product, not substitute a generic category');
const trainPlan = await window.DigiYarShoppingOrchestrator.run('بلیط قطار تهران مشهد');
assert.deepEqual(trainPlan.ai.eligibleStoreIds.slice().sort(),['alibaba','ghasedak24','mrbilit','raja'].sort(),
  'train-ticket intent must use train-ticket providers only, not hotels or flight services');
assert.equal(browser.resolveSearchUrl('ghasedak24','بلیط قطار تهران مشهد'),'https://ghasedak24.com/train-ticket',
  'Ghasedak24 must open its live-confirmed train-ticket search page');
assert.equal(browser.resolveSearchUrl('mrbilit','بلیط قطار تهران مشهد'),'https://mrbilit.com/train-ticket',
  'MrBilit must open its live-confirmed train-ticket search page');
assert.equal(browser.resolveSearchUrl('alibaba','بلیط قطار تهران مشهد'),'https://www.alibaba.ir/train',
  'Alibaba must open its live-confirmed train-ticket search page');
assert.equal(browser.resolveSearchUrl('raja','بلیط قطار تهران مشهد'),'',
  'Raja must remain hidden until its blocked route can be verified');
for (const id of ['shab','safarme','eghamat24','jobama','flytoday','flysepehran','safarmarket']) {
  assert.ok(!trainPlan.ai.eligibleStoreIds.includes(id),
    `non-train or dead-route provider ${id} must not appear for train tickets`);
}
const strictAirPurifier = await window.DigiYarShoppingOrchestrator.run('دستگاه تصفیه هوا');
assert.deepEqual(strictAirPurifier.ai.eligibleStoreIds.slice().sort(),['basalam','digikala','snappshop','torob'].sort(),
  'air-purifier results must not include Esam, Takhfifan, or MiMarket based on broad category overlap');
const strictCleaning = await window.DigiYarShoppingOrchestrator.run('یه چیزی می‌خوام برای تمیز کردن مبل پارچه‌ای');
assert.deepEqual(strictCleaning.ai.eligibleStoreIds.slice().sort(),['basalam','digikala','snappshop','torob'].sort(),
  'sofa-cleaning results must exclude accessory-only merchants and broad resale sites');
const strictScale = await window.DigiYarShoppingOrchestrator.run('ترازوهای هوشمند برای آشپزخانه');
assert.ok(!strictScale.ai.eligibleStoreIds.some(id => ['iranmiz','partochoob','chidahome','tidawood','janebi'].includes(id)),
  'kitchen-scale context must not retrieve furniture stores or health-scale categories without a kitchen-scale match');
assert.ok(!strictAirPurifier.ai.eligibleStoreIds.includes('memarket'));

const furnitureQuery = 'یه مبل راحتی برای پذیرایی می خوام';
const furniturePlan = await window.DigiYarShoppingOrchestrator.run(furnitureQuery);
const simulatorFurnitureIds = window.DigiYarStoreEligibility.storesForQuery(furnitureQuery, []).map(x => x.id);
assert.deepEqual([...simulatorFurnitureIds].sort(), [...furniturePlan.ai.eligibleStoreIds].sort(),
  'the simulator must display the exact locally resolved KB merchant set, not fall back to the older keyword resolver');
for (const id of ['iranmiz','partochoob','chidahome','tidawood','mobliran','choobineh','iransetkor']) {
  assert.ok(furniturePlan.ai.eligibleStoreIds.includes(id), `local furniture matching omitted specialist ${id} from the KB plan`);
}
for (const id of ['partochoob','iransetkor']) {
  const url = new URL(browser.resolveSearchUrl(id, furnitureQuery));
  assert.ok(url.searchParams.get('s') === 'مبل راحتی' && url.searchParams.get('post_type') === 'product',
    `${id} must use the verified concise sofa query rather than return an empty result set`);
}
for (const id of ['iranmiz','chidahome','tidawood','mobliran','choobineh']) {
  assert.equal(browser.resolveSearchUrl(id, furnitureQuery), '',
    `${id} must be withheld until its actual query results are verified; a homepage/redirect is not a search result`);
}
for (const id of ['shixon','banistyle','aysoocollection','sportland']) {
  const url = new URL(browser.resolveSearchUrl(id, 'یه لباس اسپرت می‌خوام'));
  assert.ok((url.searchParams.get('s') || url.searchParams.get('q') || '').includes('لباس'),
    `${id} must preserve the user's fashion query`);
}

const clothingPlan = await window.DigiYarShoppingOrchestrator.run('یه لباس ورزشی می‌خوام');
for (const id of ['sportland','banistyle','aysoocollection','digistyle']) {
  assert.ok(clothingPlan.ai.eligibleStoreIds.includes(id), `local fashion matching omitted specialist ${id}`);
}

const ids = Object.keys(catalog);
assert.equal(ids.length, 120, `all 120 stores must be present in the canonical KB, got ${ids.length}`);
assert.ok(catalog['19kala'], '19kala must be represented in the canonical KB');
assert.ok(catalog['daroo-online'], 'daroo-online must be represented in the canonical KB');

const failures = [];
let directRouteCount = 0;
for (const id of ids) {
  try {
    const raw = browser.resolveSearchUrl(id, query);
    if (!raw) continue; // Fail closed: no confirmed direct-search route, no result link.
    directRouteCount++;
    const url = new URL(raw);
    assert.equal(url.protocol, 'https:', 'route must use HTTPS');
    assert.ok(url.hostname, 'route must have a hostname');
    assert.ok(!(url.pathname === '/' && !url.search && !url.hash),
      'homepage-only URLs must not be presented as product-search results');
    assert.ok(!url.hostname.endsWith('google.com'), `${id} must not send the user to Google instead of the merchant`);
    assert.ok(['q','query','s','search','title','kw','keywords','w','term','text','keyword','product','search_query'].some(key => (url.searchParams.get(key)||'').trim().length >= 2),
      `${id} must carry a non-empty merchant-side product-search parameter, not a static category page`);
    assert.ok(url.pathname !== '/' || url.search || url.hash,
      `${id} must not fall back to a homepage without a product-search query`);
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
  }
}
assert.deepEqual(failures, [], `invalid merchant search routes:\n${failures.join('\n')}`);
assert.ok(directRouteCount > 10, `known direct-search routes should remain available, got ${directRouteCount}`);

const threeEngine = window.DigiYarHooshyarThreeEngine;
assert.ok(threeEngine && typeof threeEngine.resolve === 'function', 'three-engine local resolver must be loaded');
for (const [phrase, expected, excluded] of [
  ['یه کیف اداری برای محل کارم می‌خوام', ['modiseh','janebi','dayan'], ['iranmiz','partochoob']],
  ['دستگاهی می‌خوام که هوای اتاق خواب را پاک کند', ['digikala','snappshop','torob'], ['iranmiz','partochoob']],
  ['یه چیزی برای تمیز کردن مبل پارچه‌ای می‌خوام', ['digikala','snappshop','torob'], ['iranmiz','partochoob','chidahome','tidachoob']],
  ['لوازم جانبی گوشی سامسونگ', ['janebi','digikala','snappshop'], ['meghdadit','takhfifan','esam']]
]) {
  const resolved = threeEngine.resolve(phrase, catalog, [], window.DigiYarShoppingOrchestrator.classifyLocalNeed(phrase));
  expected.forEach(id => assert.ok(resolved.eligibleStoreIds.includes(id), `three-engine omitted ${id} for ${phrase}; got ${resolved.eligibleStoreIds.join(',')}`));
  excluded.forEach(id => assert.ok(!resolved.eligibleStoreIds.includes(id), `three-engine leaked ${id} for ${phrase}`));
  assert.ok(resolved.need.concept, `three-engine failed to parse concept for ${phrase}`);
}
assert.equal(threeEngine.parseNeed('کیف اداری تا ۳ میلیون تومان').maxBudgetToman, 3000000, 'Persian budget must be parsed into toman');
const descriptiveBagQuery = 'یه کیف اداری برای محل کارم با بودجه متوسط می‌خوام';
const descriptiveBagResolution = threeEngine.resolve(descriptiveBagQuery, catalog, [], window.DigiYarShoppingOrchestrator.classifyLocalNeed(descriptiveBagQuery));
assert.ok(descriptiveBagResolution.eligibleStoreIds.includes('janebi'), 'Janebi should be discoverable through its canonical office-bag category');
assert.ok(descriptiveBagResolution.searchQueries.janebi.includes('محل کارم'),
  'merchant-side search must preserve meaningful use-case context from the descriptive query');
assert.ok(descriptiveBagResolution.searchQueries.janebi.includes('بودجه متوسط'),
  'merchant-side search must not silently discard budget/context qualifiers');

const orchestrator = window.DigiYarShoppingOrchestrator;
const laptopComputer = threeEngine.resolve('لپ‌تاپ برای دانشجو با بودجه متوسط', catalog, [], orchestrator.classifyLocalNeed('لپ‌تاپ برای دانشجو با بودجه متوسط'));
assert.ok(!laptopComputer.eligibleStoreIds.includes('janebi'), 'accessory-only Janebi must not be offered for a laptop-computer request');

/* Final2 relevance guard: user context words and generated semanticText must not
   count as product evidence; only explicit product inventory can qualify a store. */
const strictAir = threeEngine.resolve('دنبال یک دستگاه تصفیه هوای مناسب اتاق خواب هستم', catalog, [], orchestrator.classifyLocalNeed('دنبال یک دستگاه تصفیه هوای مناسب اتاق خواب هستم'));
['digikala','snappshop','torob','basalam'].forEach(id => assert.ok(strictAir.eligibleStoreIds.includes(id), `strict air-purifier search omitted ${id}`));
['okala','pinket','janebi','divar','sheypoor','sakhtemoononline','kilid','ninimarket','homeplus','memarket'].forEach(id => assert.ok(!strictAir.eligibleStoreIds.includes(id), `context-only or unrelated merchant leaked into air-purifier results: ${id}`));
const strictSofa = threeEngine.resolve('یه چیزی برای تمیز کردن مبل پارچه‌ای می‌خوام', catalog, [], orchestrator.classifyLocalNeed('یه چیزی برای تمیز کردن مبل پارچه‌ای می‌خوام'));
['digikala','snappshop','torob','basalam'].forEach(id => assert.ok(strictSofa.eligibleStoreIds.includes(id), `strict sofa-cleaning search omitted ${id}`));
['okala','pinket','khanoumi','shahrvand','hyperme'].forEach(id => assert.ok(!strictSofa.eligibleStoreIds.includes(id), `generic cleaning/home taxonomy leaked into sofa-cleaning results: ${id}`));
const strictPhone = threeEngine.resolve('یه گوشی سامسونگ می‌خوام', catalog, [], orchestrator.classifyLocalNeed('یه گوشی سامسونگ می‌خوام'));
['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'].forEach(id => assert.ok(strictPhone.eligibleStoreIds.includes(id), `strict phone search omitted ${id}`));
['banimode','khanoumi','daroo-online','dayan','19kala','emalls','sheypoor','kala360','kalatik','mobile140','mobileir'].forEach(id => assert.ok(!strictPhone.eligibleStoreIds.includes(id), `merchant exclusion text or unrelated taxonomy leaked into phone results: ${id}`));
const strictAccessory = threeEngine.resolve('لوازم جانبی موبایل', catalog, [], orchestrator.classifyLocalNeed('لوازم جانبی موبایل'));
['janebi','digido','gooshishop','technolife','digikala','snappshop','torob','basalam'].forEach(id => assert.ok(strictAccessory.eligibleStoreIds.includes(id), `strict accessory search omitted ${id}`));
['takhfifan','esam','memarket','19kala','emalls','sheypoor','kala360','kalatik','mobile140','mobileir'].forEach(id => assert.ok(!strictAccessory.eligibleStoreIds.includes(id), `non-approved accessory merchant leaked into results: ${id}`));
assert.equal(orchestrator.resolveDirectorySearch('لوازم جانبی موبایل', catalog), null,
  'A product query containing the store name «جانبی» must not be misclassified as a store-directory query.');
const accessoryPlan = await orchestrator.run('لوازم جانبی موبایل');
assert.equal(accessoryPlan.ai.directorySearch, undefined, 'Mobile accessories must use the product-search path.');
assert.deepEqual([...accessoryPlan.ai.eligibleStoreIds].sort(),
  ['janebi','digido','gooshishop','technolife','digiland','berozkala','meghdadit','digikala','snappshop','torob','basalam'].sort(),
  'The knowledge-base resolver must preserve the established mobile-accessory merchant set without unrelated device-only stores.');
assert.equal(browser.resolveSearchUrl('meghdadit','لوازم جانبی موبایل'),'',
  'Meghdad IT must remain hidden in the visible simulator until its actual product-search URL is verified');
assert.ok(!accessoryPlan.ai.eligibleStoreIds.includes('dayan'),
  'office-supply stores without a mobile/digital accessory category must not match mobile-accessory requests');


const khanoumiSearch = new URL(browser.resolveSearchUrl('khanoumi','ضد آفتاب پوست خشک'));
assert.equal(khanoumiSearch.hostname,'www.khanoumi.com');
assert.equal(khanoumiSearch.pathname,'/search');
assert.equal(khanoumiSearch.searchParams.get('query'),'ضد آفتاب پوست خشک',
  'Khanoumi must open its verified query-specific product-search page');
assert.equal(browser.resolveSearchUrl('neshatrokh','ضد آفتاب پوست خشک'),'',
  'NeshatRokh must remain hidden because its tested ?s= route returned the homepage rather than product results');
const banimodeSearch = new URL(browser.resolveSearchUrl('banimode','ضد آفتاب پوست خشک'));
assert.equal(banimodeSearch.pathname,'/search');
assert.equal(banimodeSearch.searchParams.get('q'),'ضد آفتاب پوست خشک',
  'Banimode must use its query-specific search route for its declared beauty category');
assert.equal(browser.resolveSearchUrl('pinket','ضد آفتاب پوست خشک'),'',
  'Pinket must remain hidden until its blocked search route can be verified');

const expandedCatalog = {...catalog, testoffice: {name: 'فروشگاه آزمایشی کیف اداری', domains: ['fashion'], products: ['کیف اداری'], aliases: []}};
const expandedOffice = threeEngine.resolve('کیف اداری برای محل کارم', expandedCatalog, [], orchestrator.classifyLocalNeed('کیف اداری برای محل کارم'));
assert.ok(expandedOffice.eligibleStoreIds.includes('testoffice'), 'a direct KB product match outside the curated list must not be filtered out');
const expandedDeskCatalog = {...catalog, testdesk: {name: 'فروشگاه آزمایشی میز تنظیم ارتفاع', domains: ['home'], products: ['میز تنظیم ارتفاع'], aliases: []}};
const expandedDesk = threeEngine.resolve('یه میز تنظیم ارتفاع برای کار می‌خوام', expandedDeskCatalog, [], orchestrator.classifyLocalNeed('یه میز تنظیم ارتفاع برای کار می‌خوام'));
assert.ok(expandedDesk.eligibleStoreIds.includes('testdesk'), 'shared retrieval must discover a newly added merchant for a product outside the predefined concepts');
['iranmiz','partochoob','chidahome','tidawood','mobliran','choobineh','moblmarket'].forEach(id =>
  assert.ok(!expandedDesk.eligibleStoreIds.includes(id), `generic furniture merchant ${id} must not match a specific height-adjustable desk query`)
);

/* Broad category phrases must restore the specialist-first behavior that
   existed before the three-engine filter was introduced. */
const furniturePhrase='یه مبل راحتی برای پذیرایی می‌خوام';
const furnitureResolved=threeEngine.resolve(furniturePhrase,catalog,[],orchestrator.classifyLocalNeed(furniturePhrase));
['iranmiz','iransetkor','partochoob','chidahome','tidawood','mobliran','choobineh','moblmarket'].forEach(id =>
  assert.ok(furnitureResolved.eligibleStoreIds.includes(id), `furniture phrase omitted specialist ${id}: ${furnitureResolved.eligibleStoreIds.join(',')}`)
);
const furnitureEligibility=eligibilityExplainSafe('مبل راحتی');
function eligibilityExplainSafe(query){return window.DigiYarStoreEligibility.explain(query,[]);}
['iranmiz','iransetkor','partochoob','chidahome','tidawood','mobliran','choobineh','moblmarket'].forEach(id =>
  assert.ok(furnitureEligibility.eligibleIds.includes(id), `KB eligibility omitted furniture specialist ${id}`)
);
const fashionPhrase='یه لباس اسپرت می‌خوام';
const fashionResolved=threeEngine.resolve(fashionPhrase,catalog,[],orchestrator.classifyLocalNeed(fashionPhrase));
['banimode','banistyle','aysoocollection','digistyle','shixon','sportland'].forEach(id =>
  assert.ok(fashionResolved.eligibleStoreIds.includes(id), `fashion phrase omitted specialist ${id}`)
);

/* The final set must not re-add stale eligibility seeds when the KB
   resolver has returned a narrower, evidence-backed result. */
const originalThreeEngineResolveForMerge=threeEngine.resolve;
threeEngine.resolve=function(query,source,seed,classified){
  const result=originalThreeEngineResolveForMerge(query,source,seed,classified);
  return Object.assign({},result,{eligibleStoreIds:['digikala'],searchQueries:{digikala:'مبل راحتی'}});
};
const mergedFurniturePlan=await orchestrator.run(furniturePhrase);
threeEngine.resolve=originalThreeEngineResolveForMerge;
assert.deepEqual(mergedFurniturePlan.ai.eligibleStoreIds,['digikala'],
  'orchestrator must not append specialists unsupported by the resolver result');

for (const phrase of ['بلیط قطار تهران مشهد', 'از تهران می‌خوام برم مشهد با قطار']) {
  const intent = orchestrator.classifyLocalNeed(phrase);
  assert.equal(intent && intent.kind, 'travel_ticket', `train intent not recognized: ${phrase}`);
  ['raja', 'ghasedak24', 'mrbilit', 'alibaba'].forEach(id =>
    assert.ok(intent.stores.includes(id), `missing train-ticket merchant ${id} for ${phrase}`)
  );
}
const airPhrase = orchestrator.classifyLocalNeed('می‌خوام هوای اتاق خواب تمیز و پاک باشه');
assert.equal(airPhrase && airPhrase.kind, 'air_purifier', 'natural-language clean-air need should resolve to air-purifier shopping');

const eligibility = window.DigiYarStoreEligibility;
const officeBag = eligibility.explain('کیف اداری', []);
['modiseh', 'janebi', 'dayan'].forEach(id => assert.ok(officeBag.eligibleIds.includes(id), `office-bag need omitted ${id}`));
const accessory = eligibility.explain('لوازم جانبی موبایل', []);
['digido', 'janebi', 'gooshishop', 'technolife', 'digikala', 'snappshop', 'torob', 'basalam'].forEach(id => assert.ok(accessory.eligibleIds.includes(id), `mobile-accessory need omitted ${id}`));
['meghdadit', 'takhfifan', 'esam'].forEach(id => assert.ok(!accessory.eligibleIds.includes(id), `unrelated merchant leaked into mobile accessories: ${id}`));
assert.equal(browser.resolveSearchUrl('modiseh', 'کیف اداری'), '',
  'Modiseh must be withheld until its reported 404 search route is verified');
assert.equal(browser.resolveSearchUrl('memarket', 'کیف اداری'), '',
  'MiMarket must be withheld until a direct product-search route is confirmed; its homepage alone is not sufficient');
assert.equal(new URL(browser.resolveSearchUrl('khanoumi', 'ضد آفتاب')).searchParams.get('query'), 'ضد آفتاب',
  'Khanoumi must use its live-confirmed query search page rather than a category landing page');
const officeBagUrl = new URL(browser.resolveSearchUrl('janebi', 'کیف اداری'));
assert.ok(decodeURIComponent(officeBagUrl.toString()).includes('کیف اداری'), 'Janebi route must search the requested office bag');
assert.ok(!decodeURIComponent(officeBagUrl.toString()).includes('کیف لپ تاپ'), 'Janebi route must not substitute a laptop bag');
const dayanUrl = new URL(browser.resolveSearchUrl('dayan', 'کیف اداری'));
assert.equal(dayanUrl.hostname, 'noura1393.affdn.ir', 'Dayan must use the reported working product-search endpoint');
assert.equal(dayanUrl.pathname, '/products', 'Dayan must open product search, not its homepage');
assert.equal(dayanUrl.searchParams.get('title'), 'کیف اداری', 'Dayan must preserve the exact requested product phrase');
const phone = eligibility.explain('تلفن همراه سامسونگ', []);
['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam']
  .forEach(id => assert.ok(phone.eligibleIds.includes(id), `semantic phone synonym omitted ${id}`));
['emalls','kalatik','mobile140','mobileir','kala360','memarket']
  .forEach(id => assert.ok(!phone.eligibleIds.includes(id), `unrelated phone merchant leaked: ${id}`));

const originalFetch = globalThis.fetch;
let sentBody = null;
delete window.DigiYarHooshyarSemanticApiEnabled; // External semantic API is opt-in; local KB is the default.
globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://digi-yar-core-git-main-digi-yar.vercel.app/api/ai-shopping');
  sentBody = JSON.parse(options.body);
  return { ok: true, json: async () => ({ ok: true, provider: 'openrouter', plan: {
    eligibleStoreIds: ['raja', 'unknown-id', 'mrbilit'],
    searchQueries: { raja: 'بلیط قطار تهران مشهد', 'unknown-id': 'نامعتبر' },
    category: 'travel_ticket', domains: ['travel_ticket'], requestedProduct: 'بلیط قطار',
    semanticNeed: 'سفر با قطار از تهران به مشهد', taskType: 'ticket_search', confidence: 0.91
  } }) };
};
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
const localOnly = await orchestrator.run('کیف اداری');
assert.equal(localOnly.provider, 'local-knowledge-base', 'local results must work without an AI provider');
assert.equal(localOnly.semantic, false);
assert.ok(['modiseh','janebi','dayan'].every(id => localOnly.ai.eligibleStoreIds.includes(id)), 'descriptive office-bag search must retain specialist merchants');
assert.ok(['modiseh','janebi','dayan'].every(id => localOnly.ai.searchQueries[id] === 'کیف اداری'), 'merchant search routes must receive the concise product query rather than conversational filler');
const originalThreeEngineResolveForEmptyTest = window.DigiYarHooshyarThreeEngine.resolve;
window.DigiYarHooshyarThreeEngine.resolve = () => ({
  eligibleStoreIds: [], searchQueries: {},
  need: {requestedProduct:'', brand:null, maxBudgetToman:null, attributes:[], targetObject:null, taskType:'shopping_search', concept:null},
  trace: {candidateCount:0, top:[]}
});
const preservedKbPlan = await orchestrator.run('کیف اداری');
window.DigiYarHooshyarThreeEngine.resolve = originalThreeEngineResolveForEmptyTest;
assert.deepEqual(preservedKbPlan.ai.eligibleStoreIds,[],
  'an empty resolver result must not resurrect stale merchants without current product/category evidence');
assert.equal(preservedKbPlan.ai.fallbackReason, 'three-engine-empty-no-evidence',
  'an empty descriptive parse must record that no evidence-backed result was found');
const localPhone = await orchestrator.run('یه گوشی سامسونگ می‌خوام');
const expectedPhoneIds = ['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'];
expectedPhoneIds.forEach(id => assert.ok(localPhone.ai.eligibleStoreIds.includes(id), `local phone plan omitted expected merchant ${id}`));
['iranmiz','partochoob','chidahome','tidawood'].forEach(id => assert.ok(!localPhone.ai.eligibleStoreIds.includes(id), `unrelated merchant leaked into phone plan: ${id}`));
assert.deepEqual(window.DigiYarStoreEligibility.storesForQuery('یه گوشی سامسونگ می‌خوام', []).map(x=>x.id), expectedPhoneIds, 'local plans must not be incorrectly revalidated as AI plans');
assert.equal(sentBody, null, 'AI API must not be called unless explicitly enabled');
window.DigiYarHooshyarSemanticApiEnabled = true;
const aiRun = await orchestrator.run('از تهران می‌خوام برم مشهد با قطار');
assert.equal(aiRun.provider, 'local-knowledge-base', 'normal searches must remain local-only even when an AI provider is configured');
assert.equal(aiRun.semantic, false);
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(aiRun.provider, 'local-knowledge-base', 'external AI must not overwrite deterministic search results');
assert.equal(aiRun.semantic, false);
assert.equal(sentBody, null, 'normal searches must not call the external AI endpoint');
assert.ok(aiRun.ai.eligibleStoreIds.includes('raja'));
globalThis.fetch = async () => { throw new Error('simulated offline provider'); };
const fallback = await orchestrator.run('بلیط قطار تهران مشهد');
assert.equal(fallback.provider, 'local-knowledge-base', 'provider availability must not affect normal search');
assert.equal(fallback.semantic, false);
assert.ok(fallback.ai.eligibleStoreIds.includes('raja'));
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(fallback.provider, 'local-knowledge-base', 'local-only search must remain stable offline');
// Provider selection is explicit; the local three-engine plan remains available for comparison.
window.DigiYarHooshyarAIProvider = 'deepseek';
let providerRequestBody = null;
globalThis.fetch = async (_url, options) => {
  providerRequestBody = JSON.parse(options.body);
  return {ok:true,json:async()=>({ok:true,provider:'local-knowledge-base',plan:{eligibleStoreIds:[]}})};
};
const comparison = await orchestrator.compareEngines('کیف اداری برای محل کارم می‌خوام');
assert.equal(comparison.local.engine, 'three-engine-local');
assert.ok(comparison.catalogCount >= 120, 'comparison must include the canonical 120-store catalog');
assert.equal(providerRequestBody.provider, 'deepseek', 'DeepSeek selection must be sent to the server');
assert.equal(comparison.ai, null, 'local API fallback must not be reported as a real semantic provider result');
window.DigiYarHooshyarAIProvider = 'openrouter';
providerRequestBody = null;
await orchestrator.compareEngines('دستگاه تصفیه هوا');
assert.equal(providerRequestBody.provider, 'openrouter', 'OpenRouter remains an optional comparison provider');
window.DigiYarHooshyarAIProvider = 'deepseek';
window.DigiYarHooshyarSemanticApiEnabled = false;
globalThis.fetch = originalFetch;

console.log(`V7 store search-route and semantic-query tests: PASS — ${ids.length} KB stores inspected, ${directRouteCount} direct-search routes available; unverified routes fail closed, local matching and office bags/mobile accessories checked`);


/* Strict semantic relevance regression: a model-selected furniture merchant
   must not pass a specific office-bag query on broad-domain overlap alone. */
const priorPlan = window.DigiYarShoppingPlan;
window.DigiYarShoppingPlan = {
  query: 'کیف اداری',
  semantic: true,
  ai: {
    requestedProduct: 'کیف اداری',
    semanticNeed: 'کیف اداری برای محل کار',
    productTerms: ['کیف اداری'],
    requiredNameTerms: ['کیف اداری'],
    domains: ['fashion'],
    eligibleStoreIds: ['iranmiz', 'modiseh']
  }
};
const strictOffice = eligibility.explain('کیف اداری', []);
assert.ok(strictOffice.eligibleIds.includes('modiseh'),
  'a merchant with explicit office-bag product evidence must remain eligible');
assert.ok(!strictOffice.eligibleIds.includes('iranmiz'),
  'a furniture merchant must not pass office-bag matching from broad domain/word overlap');
window.DigiYarShoppingPlan = priorPlan;

['meghdadit','shavaz','jeanswest','sabzgostar'].forEach(id => {
  assert.equal(browser.resolveSearchUrl(id, 'کیف اداری'), '',
    `${id} must not expose an unverified guessed search route`);
});

