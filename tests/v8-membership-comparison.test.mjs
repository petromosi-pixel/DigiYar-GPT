import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const engineSource=readFileSync(new URL('../js/v8-comparison-engine.js',import.meta.url),'utf8');
const moduleSource=readFileSync(new URL('../js/v8-membership-comparison.js',import.meta.url),'utf8');
const products=[
 {id:'p1',name:'گوشی نمونه الف',store:'دیجی‌کالا',priceToman:12000000,productUrl:'https://www.digikala.com/product/p1'},
 {id:'p2',name:'گوشی نمونه ب',store:'اسنپ‌شاپ',priceToman:13000000,productUrl:'https://snappshop.ir/product/p2'},
 {id:'fallback',name:'جستجو در ترب',store:'ترب',priceToman:0,productUrl:'https://torob.com/search?q=x',isSearchFallback:true},
 {id:'bad',name:'محصول بدون لینک',store:'فروشگاه سوم',priceToman:9000000}
];
function setup(planId='professional'){
 const events={};
 const access={canAccess:()=>['professional','commercial'].includes(planId),requireFeature:id=>{access.requested=id;return false;}};
 const window={DigiYarMembershipAccess:access,location:{href:'https://digiyar.test/'}};
 window.addEventListener=(name,fn)=>{events[name]=fn;};
 vm.runInNewContext(engineSource,{window,console});
 vm.runInNewContext(moduleSource,{window,console,URL});
 return {window,events,access};
}
test('comparison accepts only priced products with valid URLs from at least two distinct stores',()=>{
 const {window}=setup();
 const prepared=window.DigiYarMembershipComparison.prepare(products);
 assert.equal(prepared.ready,true);
 assert.equal(prepared.products.length,2);
 assert.equal(prepared.storeCount,2);
});
test('comparison refuses two products from the same store',()=>{
 const {window}=setup();
 const prepared=window.DigiYarMembershipComparison.prepare([
  products[0],{...products[1],store:'دیجی‌کالا'}
 ]);
 assert.equal(prepared.ready,false);
 assert.equal(prepared.storeCount,1);
});
test('execution path denies comparison without server entitlement',()=>{
 const {window,access}=setup('base');
 const result=window.DigiYarMembershipComparison.compare(products,'تست');
 assert.equal(result.status,'locked');
 assert.equal(access.requested,'multi_store_comparison');
});
for(const planId of ['professional','commercial'])test(planId+' server entitlement allows comparison using real source data only',()=>{
 const {window}=setup(planId);
 const result=window.DigiYarMembershipComparison.compare(products,'گوشی');
 assert.equal(result.status,'comparison_ready');
 assert.equal(result.result.count,2);
 assert.equal(result.result.meta.networkCalls,0);
 assert.equal(result.result.priceComparison.min,12000000);
});
console.log('V8 membership comparison tests passed.');
