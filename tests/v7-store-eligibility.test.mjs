import assert from 'node:assert/strict';
import eligibility from '../js/v7-store-eligibility.js';

const stores = [
  {id:'digikala',name:'دیجی‌کالا'},
  {id:'snappshop',name:'اسنپ‌شاپ'},
  {id:'torob',name:'ترب'},
  {id:'basalam',name:'باسلام'},
  {id:'meghdadit',name:'مقداد آی‌تی'},
  {id:'technolife',name:'تکنولایف'},
  {id:'khanoumi',name:'خانومی'}
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

const mobile = eligibility.explain('گوشی سامسونگ تا ۳۰۰ میلیون تومان', stores);
assert.equal(mobile.domain, 'digital');
assert.ok(mobile.eligibleIds.includes('technolife'));
assert.ok(!mobile.eligibleIds.includes('khanoumi'));
assert.ok(!mobile.eligibleIds.includes('meghdadit'));

const unknown = eligibility.explain('یک محصول عجیب و ناشناخته', stores);
assert.equal(unknown.domain, null);
assert.equal(unknown.eligibleCount, stores.length);

console.log('V7 store eligibility tests: PASS');
