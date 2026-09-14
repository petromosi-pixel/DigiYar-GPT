/* DigiYar V6 — Hooshyar Live Resolver
   Resolves price/availability from a canonical product URL without depending on a marketplace API.
   Safe by design: explicit product URL only; never turns search/category URLs into live targets.
*/
(function(root){
'use strict';
var VERSION='6.3.0';
function clean(v){return String(v==null?'':v).trim();}
function number(v){var n=Number(v);return Number.isFinite(n)?n:0;}
function toman(value,currency){var n=number(value);if(!n||n<0)return 0;var c=clean(currency).toLowerCase();return /irr|rial|ریال/.test(c)?Math.round(n/10):Math.round(n);}
function directProductUrl(url){var u=clean(url);if(!/^https?:\/\//i.test(u))return false;try{var x=new URL(u);var p=(x.pathname||'/').toLowerCase();if(!x.hostname)return false;if(/\/search(?:\/|$)|\/category(?:\/|$)|\/products?(?:\/)?$/i.test(p))return false;if(/[?&](?:q|query|search)=/i.test(x.search))return false;return true;}catch(e){return false;}}
function normalize(result,sourceUrl){var r=result&&typeof result==='object'?result:{};var price=toman(r.priceToman||r.price,r.currency||r.priceCurrency);var availability=clean(r.availability||r.stockStatus||r.stock||'unknown').toLowerCase();if(/موجود|in.?stock|available/.test(availability))availability='in_stock';else if(/ناموجود|out.?of.?stock|unavailable/.test(availability))availability='out_of_stock';else availability='unknown';return{priceToman:price,availability:availability,resolvedAt:new Date().toISOString(),sourceUrl:sourceUrl||clean(r.productUrl),resolver:r.resolver||'html'};}
function extractJsonLd(doc){var nodes=Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));for(var i=0;i<nodes.length;i++){try{var data=JSON.parse(nodes[i].textContent||'');var list=Array.isArray(data)?data:[data];for(var j=0;j<list.length;j++){var x=list[j];if(!x||typeof x!=='object')continue;var offers=Array.isArray(x.offers)?x.offers:[x.offers];for(var k=0;k<offers.length;k++){var o=offers[k];if(o&&o.price!=null){return{price:o.price,currency:o.priceCurrency,availability:o.availability};}}}}catch(e){}}
return null;}
async function resolve(url,options){var target=clean(url);if(!directProductUrl(target))return{ok:false,error:'not_direct_product_url',sourceUrl:target};var fetcher=options&&options.fetch;if(typeof fetcher!=='function')fetcher=root.fetch.bind(root);try{var response=await fetcher(target,{redirect:'follow',cache:'no-store'});if(!response||!response.ok)return{ok:false,error:'http_'+(response&&response.status||0),sourceUrl:target};var html=await response.text();var parser=root.DOMParser?new root.DOMParser():null;if(!parser)return{ok:false,error:'dom_parser_unavailable',sourceUrl:target};var doc=parser.parseFromString(html,'text/html');var data=extractJsonLd(doc);if(!data)return{ok:false,error:'price_data_not_found',sourceUrl:target};var normalized=normalize(data,target);if(!normalized.priceToman)return{ok:false,error:'price_not_found',sourceUrl:target,availability:normalized.availability};return Object.assign({ok:true},normalized); }catch(e){return{ok:false,error:String(e&&e.message||e),sourceUrl:target};}}
async function resolveProducts(products,options){var list=Array.isArray(products)?products:[];var limit=Math.max(1,number(options&&options.limit)||8),out=[];for(var i=0;i<list.length&&out.length<limit;i++){var p=list[i]||{},url=clean(p.productUrl||p.url);if(!directProductUrl(url))continue;var r=await resolve(url,options);out.push(Object.assign({},p,{live:r}));}return out;}
root.DigiYarHooshyarLiveResolver={version:VERSION,directProductUrl:directProductUrl,normalize:normalize,resolve:resolve,resolveProducts:resolveProducts};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DigiYarHooshyarLiveResolver;
})(typeof window!=='undefined'?window:globalThis);
