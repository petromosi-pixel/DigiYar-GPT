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
['iranmiz','partochoob','chidahome','tidawood'].forEach(id=>assert.ok(office.eligibleIds.includes(id)));

const dining = eligibility.explain('میز ناهارخوری چوبی ۶ نفره', stores);
assert.equal(dining.domain, 'furniture');
['iranmiz','partochoob','chidahome','tidawood','digikala','snappshop','torob','basalam'].forEach(id=>assert.ok(dining.eligibleIds.includes(id)));

const mobile = eligibility.explain('گوشی سامسونگ تا ۳۰۰ میلیون تومان', stores);
assert.equal(mobile.domain, 'digital');
['digido','janebi','digiland','takhfifan','berozkala','gooshishop','technolife','meghdadit'].forEach(id=>assert.ok(mobile.eligibleIds.includes(id)));
assert.ok(!mobile.eligibleIds.includes('khanoumi'));

const unknown = eligibility.explain('یک محصول عجیب و ناشناخته', stores);
assert.equal(unknown.domain, null);
assert.ok(unknown.eligibleCount >= 0);

console.log('V7 store eligibility tests: PASS — furniture specialists included');
