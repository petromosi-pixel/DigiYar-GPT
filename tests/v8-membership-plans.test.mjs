import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/v8-membership-plans.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/v8-membership-plans.css',import.meta.url),'utf8');
test('three membership tiers are visible and clearly differentiated',()=>{
 for(const id of ['base','professional','commercial']) assert.match(html,new RegExp('data-plan-card="'+id+'"'));
 assert.match(html,/قیمت‌ها و امکانات اشتراک‌ها فعلاً آزمایشی/);
});
test('all requested subscription durations are available',()=>{
 for(const months of [1,3,6,9,12]) assert.match(html,new RegExp('data-membership-duration="'+months+'"'));
});
test('planned capabilities are labeled as not yet active',()=>{
 assert.match(html,/در برنامه/);
 assert.match(html,/هنوز فعال نیستند/);
});
test('pricing preview cannot charge or activate paid access',()=>{
 assert.match(js,/paymentEnabled:false/);
 assert.match(js,/pricingStatus:'illustrative_only'/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|location\.href|window\.open/);
});
test('pricing preview includes mobile responsive styles and accessible controls',()=>{
 assert.match(css,/@media\(max-width:380px\)/);
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/aria-live="polite"/);
});
