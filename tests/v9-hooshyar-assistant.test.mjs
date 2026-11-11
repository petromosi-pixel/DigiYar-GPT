import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const events=[];
const listeners={};
const window={
 addEventListener(name,fn){listeners[name]=fn;},
 dispatchEvent(event){events.push(event);},
 DigiYarStoreBusinessDomains:{catalog:{digikala:{name:'دیجی‌کالا',homepage:'https://digikala.com'}}},
 DigiYarStoreSearchUrl:{resolve(){return'https://digikala.com/search/?q=گوشی';}},
 DigiYarV7ProductResultProducer:{async produce(){return[
  {id:'p1',name:'گوشی سامسونگ A55',brand:'سامسونگ',priceToman:18000000},
  {id:'p2',name:'گوشی سامسونگ S23 FE',brand:'سامسونگ',priceToman:24000000}
 ];}}
};
const context={window,console,CustomEvent:function(type,init){this.type=type;this.detail=init&&init.detail;},Date,JSON};
vm.runInNewContext(fs.readFileSync('js/v9-hooshyar-assistant.js','utf8'),context);
const assistant=window.DigiYarHooshyarAssistant;
assert.ok(assistant,'Hooshyar search coordinator must be exposed');
assert.equal(assistant.classify('برای عکاسی چه گوشی بخرم؟'),'buying_advice');
assert.equal(assistant.classify('قیمت هدف را پیگیری کن'),'price_tracking');
assert.equal(assistant.classify('این دو گوشی را مقایسه کن'),'shopping_search');
const result=await assistant.handleSearch('گوشی سامسونگ',{storeIds:['digikala']});
assert.equal(result.products.length,2);
assert.equal(result.stores[0].name,'دیجی‌کالا');
assert.equal(events.filter(e=>e.type==='digiyar:v9-assistant-results').length,1);
assert.equal(typeof window.DigiYarV7ComparisonUI,'undefined');
assert.equal(typeof window.DigiYarComparisonEngine,'undefined');
assert.equal(typeof window.document,'undefined');
assert.equal(assistant.clear().products.length,0);
console.log('V9 headless Hooshyar search contract: PASS');
