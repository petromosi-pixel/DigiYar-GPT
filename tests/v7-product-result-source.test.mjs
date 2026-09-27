import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('js/v7-product-result-source.js','utf8');
const events=[];
const context={
  window:{
    addEventListener:(name,fn)=>{context.listener=fn;},
    dispatchEvent:(event)=>events.push(event),
    CustomEvent:function(name,init){this.type=name;this.detail=init&&init.detail;}
  },
  console
};
vm.runInNewContext(source,context);
const api=context.window.DigiYarV7ProductResultSource;
assert.ok(api,'V7 Product Result Source must exist');

const snapshot=api.set([
  {id:'1',name:'محصول اول',priceToman:1200000,storeName:'دیجی‌کالا'},
  {id:'2',title:'محصول دوم',price:1500000,store:'اسنپ‌شاپ'},
  {name:''}
],{query:'تست',source:'supplied'});

assert.equal(snapshot.products.length,2);
assert.equal(snapshot.products[0].price,1200000);
assert.equal(snapshot.products[0].store,'دیجی‌کالا');
assert.equal(snapshot.query,'تست');
assert.equal(snapshot.source,'supplied');
assert.equal(api.get().products.length,2);

api.clear();
assert.equal(api.get().products.length,0);

api.publish([{id:'3',name:'محصول سوم'}],{query:'رویداد',source:'event'});
assert.equal(events.length,1);
assert.equal(events[0].type,'digiyar:v7-product-results');

console.log('V7 Product Result Source tests passed.');
