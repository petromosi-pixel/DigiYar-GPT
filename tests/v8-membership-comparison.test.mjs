import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const registrySource=readFileSync(new URL('../js/v8-comparison-provider-registry.js',import.meta.url),'utf8');
const engineSource=readFileSync(new URL('../js/v8-comparison-engine.js',import.meta.url),'utf8');
const moduleSource=readFileSync(new URL('../js/v8-membership-comparison.js',import.meta.url),'utf8');
const observedAt=()=>new Date().toISOString();
const products=[
 {id:'p1',productId:'p1',providerId:'fixture-feed',retailerId:'digikala',name:'گوشی نمونه الف',brand:'برند الف',model:'مدل الف',priceToman:12000000,currency:'IRT',availability:'in_stock',observedAt:observedAt(),productUrl:'https://www.digikala.com/product/p1',specifications:{ram:'8 GB'}},
 {id:'p2',productId:'p2',providerId:'fixture-feed',retailerId:'snappshop',name:'گوشی نمونه ب',brand:'برند ب',model:'مدل ب',priceToman:13000000,currency:'IRT',availability:'out_of_stock',observedAt:observedAt(),productUrl:'https://snappshop.ir/product/p2',specifications:{ram:'12 GB'}},
 {id:'fallback',name:'جستجو در ترب',priceToman:0,productUrl:'https://torob.com/search?q=x',isSearchFallback:true},
 {id:'bad',name:'محصول بدون لینک',priceToman:9000000}
];
function setup(planId='professional'){
 const events={},access={canAccess:()=>['professional','commercial'].includes(planId),requireFeature:id=>{access.requested=id;return false;}};
 const window={DigiYarMembershipAccess:access,location:{href:'https://digiyar.test/'},addEventListener(name,fn){events[name]=fn;}};
 vm.runInNewContext(registrySource,{window,URL,Date,console});
 window.DigiYarComparisonProviderRegistry.register('fixture-feed',{retailers:[{id:'digikala',name:'دیجی‌کالا',hosts:['digikala.com']},{id:'snappshop',name:'اسنپ‌شاپ',hosts:['snappshop.ir']}],search:async()=>[]});
 vm.runInNewContext(engineSource,{window,console});
 vm.runInNewContext(moduleSource,{window,console,URL,Date});
 return{window,events,access};
}
test('fresh direct product offers from two independent retailers are accepted',()=>{
 const{window}=setup(),prepared=window.DigiYarMembershipComparison.prepare(products);
 assert.equal(prepared.ready,true);assert.equal(prepared.products.length,2);assert.equal(prepared.storeCount,2);
 assert.equal(prepared.products[0].brand,'برند الف');assert.equal(prepared.products[0].attributes.ram,'8 GB');
});
test('two offers from one retailer do not qualify as multi-store comparison',()=>{
 const{window}=setup(),prepared=window.DigiYarMembershipComparison.prepare([products[0],{...products[1],retailerId:'digikala',productUrl:'https://digikala.com/product/p2'}]);
 assert.equal(prepared.ready,false);assert.equal(prepared.storeCount,1);
});
test('search/category URLs, wrong hosts, zero prices, missing stock and stale records are rejected',()=>{
 const{window}=setup(),valid=products[0],bad=[
  {...valid,productUrl:'https://www.digikala.com/search/?q=phone'},
  {...valid,productUrl:'https://www.digikala.com/products/category-products/mobile'},
  {...valid,productUrl:'https://evil.example/product/x'},
  {...valid,priceToman:0},
  {...valid,availability:''},
  {...valid,observedAt:'2020-01-01T00:00:00.000Z'},
  {...valid,productUrl:'',sourceUrl:'https://www.digikala.com/product/p1'}
 ];
 assert.equal(window.DigiYarMembershipComparison.prepare(bad).products.length,0);
});
test('provider search normalizes live adapter responses and rejects unverified rows',async()=>{
 const{window}=setup();
 window.DigiYarComparisonProviderRegistry.register('test-live',{retailers:[{id:'digikala',name:'دیجی‌کالا',hosts:['digikala.com']}],search:async()=>[
  {...products[0],providerId:undefined,retailerId:'digikala'},
  {...products[0],id:'bad-search',productId:'bad-search',retailerId:'digikala',productUrl:'https://www.digikala.com/search/?q=phone'}
 ]});
 const result=await window.DigiYarComparisonProviderRegistry.search('گوشی سامسونگ');
 assert.equal(result.products.length,1);assert.equal(result.products[0].verifiedSource,true);
});
test('base plan cannot execute paid comparison',()=>{
 const{window,access}=setup('base'),result=window.DigiYarMembershipComparison.compare(products,'تست');
 assert.equal(result.status,'locked');assert.equal(access.requested,'multi_store_comparison');
});
for(const planId of ['professional','commercial'])test(planId+' entitlement permits comparison of verified source records',()=>{
 const{window}=setup(planId),result=window.DigiYarMembershipComparison.compare(products,'گوشی');
 assert.equal(result.status,'comparison_ready');assert.equal(result.result.count,2);assert.equal(result.result.meta.networkCalls,0);assert.equal(result.result.priceComparison.min,12000000);
});
console.log('V8 membership comparison tests passed.');
