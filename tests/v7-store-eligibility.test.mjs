import assert from 'node:assert/strict';
import '../js/store-business-domains.js';
import eligibility from '../js/v7-store-eligibility.js';

const stores = [
  {id:'digikala',name:'دیجی‌کالا'},
  {id:'snappshop',name:'اسنپ‌شاپ'},
  {id:'torob',name:'ترب'},
  {id:'basalam',name:'باسلام'},
  {id:'meghdadit',name:'مقداد آی‌تی'},
  {id:'technolife',name:'تکنولایف'},
  {id:'digido',name:'دیجی‌دو'},
  {id:'janebi',name:'جانبی'},
  {id:'digiland',name:'دیجی‌لند'},
  {id:'takhfifan',name:'تخفیفان'},
  {id:'berozkala',name:'بروزکالا'},
  {id:'gooshishop',name:'گوشی شاپ'},
  {id:'khanoumi',name:'خانومی'},
  {id:'dayan',name:'دایان'},
  {id:'esam',name:'ایسام'},
  {id:'solokala',name:'سولوکالا'},
  {id:'takhfifan',name:'تخفیفان'},
  {id:'partochoob',name:'پرتوچوب'},
  {id:'iransetkor',name:'ایران ستکور'},
  {id:'sportland',name:'اسپرت‌لند'}
];

const office = eligibility.explain('مبلمان اداری برای محل کار ۱۲۰ تا ۲۰۰ میلیون تومان', stores);
assert.equal(office.domain, 'furniture');
assert.ok(office.eligibleIds.includes('digikala'));
assert.ok(office.eligibleIds.includes('snappshop'));
assert.ok(office.eligibleIds.includes('torob'));
assert.ok(office.eligibleIds.includes('basalam'));
assert.ok(!office.eligibleIds.includes('meghdadit'));
assert.ok(!office.eligibleIds.includes('technolife'));
assert.ok(!office.eligibleIds.includes('khanoumi'));
assert.ok(office.eligibleIds.includes('iranmiz'), 'Iranmiz declares office furniture in its KB');
assert.ok(office.eligibleIds.includes('partochoob'), 'furniture specialists must qualify for office-furniture requests by declared product family');
assert.ok(office.eligibleIds.includes('chidahome'), 'Chida Home must qualify for furniture-family requests');
assert.ok(office.eligibleIds.includes('tidawood'), 'Tida Wood must qualify for furniture-family requests');


const sofa = eligibility.explain('یه مبل راحتی برای پذیرایی می خوام', stores);
assert.equal(sofa.domain, 'furniture');
['iranmiz','partochoob','chidahome','tidawood','mobliran','choobineh','iransetkor'].forEach(id =>
  assert.ok(sofa.eligibleIds.includes(id), `semantic sofa query omitted specialist ${id}`));

const sportswear = eligibility.explain('یه لباس اسپرت می‌خوام', stores);
assert.equal(sportswear.domain, 'fashion');
['banistyle','aysoocollection','digistyle','shixon','sportland'].forEach(id =>
  assert.ok(sportswear.eligibleIds.includes(id), `semantic sportswear query omitted specialist ${id}`));

const dining = eligibility.explain('میز ناهارخوری چوبی ۶ نفره', stores);
assert.equal(dining.domain, 'furniture');
['iranmiz','partochoob','chidahome','tidawood','digikala','snappshop','torob','basalam'].forEach(id=>assert.ok(dining.eligibleIds.includes(id)));

const officeBag = eligibility.explain('یه کیف اداری برای محل کارم می‌خوام', stores);
assert.ok(!officeBag.eligibleIds.includes('berozkala'), 'office-bag query must not include BerozKala merely for its digital domain');
assert.ok(officeBag.eligibleIds.includes('dayan'), 'Dayan has the office-bag product even though it needs a shortened store query');
assert.ok(officeBag.eligibleIds.includes('janebi'), 'Janebi has the office-bag category');

const mobile = eligibility.explain('گوشی سامسونگ تا ۳۰۰ میلیون تومان', stores);
assert.equal(mobile.domain, 'digital');
['digido','digiland','takhfifan','berozkala','gooshishop','technolife','meghdadit'].forEach(id=>assert.ok(mobile.eligibleIds.includes(id)));
assert.ok(!mobile.eligibleIds.includes('khanoumi'));

const catalog = globalThis.DigiYarStoreBusinessDomains.catalog;
assert.equal(catalog.digikala.storeType, 'general', 'broad marketplace belongs in general stores');
assert.equal(catalog.janebi.storeType, 'specialist', 'multi-domain accessory merchant remains specialist by activity');
assert.equal(catalog.khanoumi.storeType, 'specialist', 'beauty/health merchant remains specialist by activity');
assert.equal(catalog.berozkala.storeType, 'specialist', 'digital retailer remains specialist by activity');

const unknown = eligibility.explain('یک محصول عجیب و ناشناخته', stores);
assert.equal(unknown.domain, null);
assert.ok(unknown.eligibleCount >= 0);

const samsung = eligibility.explain('گوشی سامسونگ', stores);
['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam'].forEach(id=>assert.ok(samsung.eligibleIds.includes(id), `missing mobile-related merchant: ${id}`));
['emalls','kalatik','mobile140','mobileir','kala360','memarket'].forEach(id=>assert.ok(!samsung.eligibleIds.includes(id), `unrelated mobile merchant leaked: ${id}`));
assert.ok(!samsung.eligibleIds.includes('khanoumi'));

const accessories = eligibility.explain('لوازم جانبی موبایل', stores);
['janebi','digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam'].forEach(id=>assert.ok(accessories.eligibleIds.includes(id), `missing accessory merchant: ${id}`));
['takhfifan','esam','memarket','khanoumi','solokala','dayan','partochoob','iransetkor','sportland'].forEach(id=>assert.ok(!accessories.eligibleIds.includes(id), `unrelated accessory merchant leaked: ${id}`));

const train = eligibility.explain('بلیط قطار تهران مشهد', stores);
['shab','safarme','raja','ghasedak24','mrbilit','trip','safarmarket'].forEach(id=>assert.ok(train.eligibleIds.includes(id), `missing train-ticket merchant: ${id}`));

const purifier = eligibility.explain('دستگاه تصفیه هوای مناسب اتاق خواب', stores);
['digikala','snappshop','torob','basalam'].forEach(id=>assert.ok(purifier.eligibleIds.includes(id), `missing general marketplace for air purifier: ${id}`));
assert.ok(!purifier.eligibleIds.includes('memarket'), 'MeMarket is explicitly excluded for air-purifier queries');
assert.ok(!purifier.eligibleIds.some(id=>['iranmiz','partochoob','chidahome','tidawood'].includes(id)));

console.log('V7 store eligibility tests: PASS — old/new merchant coverage and comma-separated product matching');
