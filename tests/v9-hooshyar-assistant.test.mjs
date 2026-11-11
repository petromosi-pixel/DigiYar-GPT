import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const listeners={};
const panel={hidden:true,style:{},appendChild(){},setAttribute(){},innerHTML:''};
const hero={parentNode:{insertBefore(node){node.parentNode=this;}}};
const document={
  readyState:'loading',
  addEventListener(name,fn){listeners[name]=fn;},
  getElementById(id){return id==='v9HooshyarAssistantResults'?panel:null;},
  querySelector(){return hero;},
  createElement(){return {style:{},appendChild(){},setAttribute(){}};}
};
let selected=[],showCalls=0,runCalls=0;
const products=[
 {id:'p1',name:'گوشی سامسونگ A55',brand:'سامسونگ',priceToman:18000000,productUrl:'https://example.test/a55'},
 {id:'p2',name:'گوشی سامسونگ S23 FE',brand:'سامسونگ',priceToman:24000000,productUrl:'https://example.test/s23'}
];
const window={
 document,
 DigiYarStoreBusinessDomains:{catalog:{digikala:{name:'دیجی‌کالا',homepage:'https://digikala.com'}}},
 DigiYarStoreSearchUrl:{resolve(){return'https://digikala.com/search/?q=گوشی';}},
 DigiYarV7ProductResultProducer:{async produce(){return products;}},
 DigiYarV7ProductResultSource:{
  getComparisonProducts(){return selected.slice();},
  addComparisonProduct(p){selected=selected.filter(x=>x.id!==p.id);selected.push(p);},
 },
 DigiYarComparisonEngine:{compare(ps){return{status:ps.length>=2?'comparison_ready':'not_enough_results',count:ps.length,products:ps};}},
 DigiYarV7ComparisonUI:{show(){showCalls++;},run(){runCalls++;}},
 addEventListener(){},
 dispatchEvent(){}
};
const context={window,document,console,CustomEvent:function(type,init){this.type=type;this.detail=init&&init.detail;},Intl,Date,JSON};
vm.runInNewContext(fs.readFileSync('js/v9-hooshyar-assistant.js','utf8'),context);
const assistant=window.DigiYarHooshyarAssistant;
assert.ok(assistant,'central Hooshyar assistant must be exposed');
assert.equal(assistant.classify('این دو گوشی را با هم مقایسه کن'),'compare');
assert.equal(assistant.classify('برای عکاسی چه گوشی بخرم؟'),'buying_advice');
assert.equal(assistant.classify('قیمت هدف را پیگیری کن'),'price_tracking');
const snapshot=await assistant.handleSearch('گوشی سامسونگ تا ۲۵ میلیون',{storeIds:['digikala']});
assert.equal(snapshot.products.length,2);
assert.equal(snapshot.stores[0].name,'دیجی‌کالا');
assert.equal(snapshot.task,'shopping_search');
assert.equal(panel.hidden,false);
assert.equal(assistant.addToComparison('p1').ok,true);
assert.equal(assistant.addToComparison('p2').ok,true);
assert.equal(showCalls,2);
const compared=assistant.compareSelected();
assert.equal(compared.ok,true);
assert.equal(compared.result.count,2);
assert.equal(runCalls,1);
const advice=assistant.buyingAdvice();
assert.equal(advice.ok,true);
assert.equal(advice.priceLeader,'گوشی سامسونگ A55');
assert.match(advice.qualification,/قیمت کمتر/);
console.log('V9 Hooshyar central assistant contract: PASS');
