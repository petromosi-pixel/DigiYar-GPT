/* DigiYar V8 — verified multi-retailer comparison provider contract. */
(function(root){
'use strict';
var VERSION='1.0.0-comparison-provider-registry',providers=Object.create(null),DEFAULT_MAX_AGE=24*60*60*1000;
function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function hostMatches(host,allowed){
 host=String(host||'').toLowerCase().replace(/^www\./,'');
 return (allowed||[]).some(function(item){var h=String(item||'').toLowerCase().replace(/^www\./,'');return host===h||host.endsWith('.'+h);});
}
function directProductUrl(value,retailer){
 var u;try{u=new URL(String(value||''));}catch(_){return null;}
 if(u.protocol!=='https:'||!u.hostname||u.username||u.password||!hostMatches(u.hostname,retailer.hosts))return null;
 if(/(?:^|\/)(?:search|category-products|categories|collections|catalogsearch|product-search)(?:\/|$)/i.test(u.pathname))return null;
 if(['q','query','keyword','keywords','kw','search','s'].some(function(k){return u.searchParams.has(k);}))return null;
 if(!u.pathname||u.pathname==='/')return null;
 return u.href;
}
function normalize(raw,providerId,options){
 if(!raw||typeof raw!=='object')return null;
 var pid=providerId||raw.providerId||raw.sourceProviderId,provider=providers[pid];
 if(!provider)return null;
 var retailerId=clean(raw.retailerId||raw.storeId).toLowerCase(),retailer=provider.retailers[retailerId];
 if(!retailer)return null;
 var name=clean(raw.name||raw.title||raw.productName),productId=clean(raw.productId||raw.id||raw.sku),url=directProductUrl(raw.productUrl,retailer);
 var currency=clean(raw.currency||'').toUpperCase(),amount=Number(raw.priceToman!=null?raw.priceToman:raw.price),priceToman=amount;
 if(currency==='IRR'||currency==='RIAL')priceToman=amount/10;
 else if(currency!=='IRT'&&currency!=='TOMAN'&&currency!=='TOMANS')return null;
 if(!Number.isFinite(priceToman)||priceToman<=0)return null;
 var availability=clean(raw.availability||raw.stockStatus).toLowerCase();
 if(['in_stock','out_of_stock','unknown'].indexOf(availability)<0)return null;
 var timestamp=Date.parse(raw.observedAt||raw.updatedAt||'');
 if(!Number.isFinite(timestamp))return null;
 var age=Date.now()-timestamp,maxAge=Number(options&&options.maxAgeMs)||provider.maxAgeMs||DEFAULT_MAX_AGE;
 if(age < -300000||age>maxAge||!name||!productId||!url)return null;
 var sourceSpecs=raw.specifications||raw.specs||raw.attributes||{},specs={};
 if(sourceSpecs&&typeof sourceSpecs==='object'&&!Array.isArray(sourceSpecs))Object.keys(sourceSpecs).forEach(function(k){var v=sourceSpecs[k];if(v==null||typeof v==='object')return;var value=clean(v);if(value)specs[clean(k)]=value;});
 return {id:pid+'|'+retailerId+'|'+productId,productId:productId,providerId:pid,retailerId:retailerId,store:retailer.name,storeName:retailer.name,name:name,brand:clean(raw.brand),model:clean(raw.model),priceToman:Math.round(priceToman),price:Math.round(priceToman),currency:'IRT',availability:availability,productUrl:url,attributes:specs,observedAt:new Date(timestamp).toISOString(),verifiedSource:true};
}
function register(providerId,adapter){
 var id=clean(providerId).toLowerCase();
 if(!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(id))throw new Error('Invalid provider id');
 if(!adapter||typeof adapter.search!=='function'||!Array.isArray(adapter.retailers))throw new Error('Provider requires search() and retailers[]');
 var retailers=Object.create(null);
 adapter.retailers.forEach(function(r){var rid=clean(r&&r.id).toLowerCase(),name=clean(r&&r.name),hosts=Array.isArray(r&&r.hosts)?r.hosts.map(clean).filter(Boolean):[];if(!rid||!name||!hosts.length)throw new Error('Each retailer requires id, name and allowed hosts');retailers[rid]={id:rid,name:name,hosts:hosts};});
 providers[id]={search:adapter.search,retailers:retailers,maxAgeMs:Number(adapter.maxAgeMs)||DEFAULT_MAX_AGE};return true;
}
function normalizeMany(items,providerId,options){
 var out=[],seen=Object.create(null);(Array.isArray(items)?items:[]).forEach(function(item){var pid=providerId||(item&&(item.providerId||item.sourceProviderId)),provider=providers[pid],p=normalize(item,pid,{maxAgeMs:options&&options.maxAgeMs||provider&&provider.maxAgeMs});if(!p||seen[p.id])return;seen[p.id]=true;out.push(p);});return out;
}
async function search(query,options){
 var ids=Object.keys(providers),results=await Promise.all(ids.map(async function(id){try{var raw=await providers[id].search(String(query||''),options||{}),list=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.products)?raw.products:[]);return{providerId:id,products:normalizeMany(list,id),error:null};}catch(e){return{providerId:id,products:[],error:clean(e&&e.message||e)};}}));
 var products=[];results.forEach(function(r){products=products.concat(r.products);});return{query:String(query||''),products:products,providers:results.map(function(r){return{providerId:r.providerId,count:r.products.length,error:r.error};})};
}
root.DigiYarComparisonProviderRegistry=Object.freeze({version:VERSION,register:register,normalize:normalize,normalizeMany:normalizeMany,search:search,listProviders:function(){return Object.keys(providers);}});
})(typeof window!=='undefined'?window:globalThis);
