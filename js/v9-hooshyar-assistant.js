/* DigiYar V9 — headless Hooshyar search coordinator.
   Results are emitted as events; no comparison card or results panel is created. */
(function(root){
'use strict';
var VERSION='9.2.0-hooshyar-headless.2';
var state={query:'',normalizedQuery:'',concepts:[],task:'idle',stores:[],products:[],updatedAt:null};
function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function norm(v){return clean(v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').toLowerCase();}
function classify(q){
 q=norm(q);
 if(/پیگیری قیمت|شکارچی قیمت|قیمت هدف|ارزان شد/.test(q))return'price_tracking';
 if(/کدوم.*بهتر|کدام.*بهتر|چی بخرم|چه.*بخرم|ارزش خرید/.test(q))return'buying_advice';
 if(/خرید|بخر|می.?خوام|دنبال|نیاز دارم|قیمت|محصول|کالا|مقایسه/.test(q))return'shopping_search';
 return'shopping_search';
}
function storesFor(ids,q){
 var catalog=root.DigiYarStoreBusinessDomains&&root.DigiYarStoreBusinessDomains.catalog||{};
 var resolver=root.DigiYarStoreSearchUrl;
 return(ids||[]).slice(0,12).map(function(id){
  var store=catalog[id]||{},url='';
  try{url=resolver&&resolver.resolve?resolver.resolve(id,q):'';}catch(_){}
  return{id:id,name:store.name||id,url:url||store.homepage||''};
 });
}
function snapshot(){return JSON.parse(JSON.stringify(state));}
async function handleSearch(query,context){
 var q=clean(query);if(!q)return null;
 var dictionary=root.DigiYarPersianDictionary,matches=dictionary&&typeof dictionary.resolve==='function'?dictionary.resolve(q):[];
 state={query:q,normalizedQuery:dictionary&&typeof dictionary.expand==='function'?dictionary.expand(q):q,concepts:matches.map(function(entry){return{id:entry.id,canonical:entry.canonical};}),task:classify(q),stores:storesFor(context&&context.storeIds||[],q),products:[],updatedAt:null};
 var producer=root.DigiYarV7ProductResultProducer;
 if(producer&&typeof producer.produce==='function'){
  try{state.products=await producer.produce(q,{limit:8});}
  catch(error){console.warn('[Hooshyar] local product search failed',error);}
 }
 /* Only current, source-backed retailer offers are merged for comparison.
    Local catalogue results remain discovery results, never verified offers. */
 var providerRegistry=root.DigiYarComparisonProviderRegistry;
 if(providerRegistry&&typeof providerRegistry.search==='function'){
  try{var feed=await providerRegistry.search(q,{limit:8});if(feed&&Array.isArray(feed.products))state.products=state.products.concat(feed.products);state.providerFeed=feed&&Array.isArray(feed.providers)?feed.providers:[];}
  catch(error){console.warn('[Hooshyar] verified retailer feeds unavailable',error);}
 }
 state.updatedAt=new Date().toISOString();
 try{root.dispatchEvent(new CustomEvent('digiyar:v9-assistant-results',{detail:snapshot()}));}catch(_){}
 return snapshot();
}
function clear(){
 state={query:'',normalizedQuery:'',concepts:[],task:'idle',stores:[],products:[],updatedAt:null};
 try{root.dispatchEvent(new CustomEvent('digiyar:v9-assistant-cleared',{detail:snapshot()}));}catch(_){}
 return snapshot();
}
root.DigiYarHooshyarAssistant={version:VERSION,classify:classify,handleSearch:handleSearch,getState:snapshot,clear:clear};
root.addEventListener('digiyar:v7-hooshyar-cleared',clear);
})(typeof window!=='undefined'?window:globalThis);
