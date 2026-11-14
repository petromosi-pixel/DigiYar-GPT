'use strict';
/*
 * DigiYar authorized comparison-feed gateway.
 * This is DigiYar's partner contract, NOT an undocumented vendor API.
 * Configure only merchant-approved feed URLs and credentials in Vercel env.
 */
const STORES = {
  digikala: { name: 'دیجی‌کالا', hosts: ['digikala.com'], env: 'DIGIKALA' },
  technolife: { name: 'تکنولایف', hosts: ['technolife.ir'], env: 'TECHNOLIFE' },
  snappshop: { name: 'اسنپ‌شاپ', hosts: ['snappshop.ir'], env: 'SNAPPSHOP' }
};
const ALLOWED_ORIGINS = new Set(['https://petromosi-pixel.github.io','https://digi-yar-core.vercel.app']);
const MAX_AGE_MS = 24 * 60 * 60 * 1000, TIMEOUT_MS = 8000, MAX_BODY_CHARS = 1200000;
const buckets = new Map();
function clean(value) { return String(value == null ? '' : value).replace(/\s+/g, ' ').trim(); }
function send(res, status, payload) { res.setHeader('Cache-Control','no-store, max-age=0'); return res.status(status).json(payload); }
function allowedOrigin(origin) { return ALLOWED_ORIGINS.has(origin) || /^https:\/\/digi-yar-core-[a-z0-9-]+-digi-yar\.vercel\.app$/.test(origin); }
function rateAllowed(req) {
 const forwarded=clean(req.headers['x-forwarded-for']),key=forwarded?forwarded.split(',')[0].trim():clean(req.socket&&req.socket.remoteAddress)||'unknown';
 const now=Date.now(),old=buckets.get(key);if(!old||now-old.start>=60000){buckets.set(key,{start:now,count:1});return true;}old.count+=1;return old.count<=24;
}
function directUrl(value,hosts) {
 let url;try{url=new URL(String(value||''));}catch(_){return null;}
 const host=url.hostname.toLowerCase().replace(/^www\./,'');
 if(url.protocol!=='https:'||url.username||url.password||!hosts.some(item=>host===item||host.endsWith('.'+item)))return null;
 if(!url.pathname||url.pathname==='/'||/(?:^|\/)(?:search|category|categories|collections|catalogsearch|product-search)(?:\/|$)/i.test(url.pathname))return null;
 if(['q','query','keyword','search','s'].some(key=>url.searchParams.has(key)))return null;
 return url.href;
}
function normalizeProduct(raw,storeId,now) {
 if(!raw||typeof raw!=='object')return null;const store=STORES[storeId];
 const productId=clean(raw.productId||raw.id||raw.sku),name=clean(raw.name||raw.title||raw.productName),productUrl=directUrl(raw.productUrl||raw.url,store.hosts);
 const currency=clean(raw.currency).toUpperCase(),amount=Number(raw.price);let priceToman=amount;
 if(currency==='IRR'||currency==='RIAL')priceToman=amount/10;else if(!['IRT','TOMAN','TOMANS'].includes(currency))return null;
 const availability=clean(raw.availability||raw.stockStatus).toLowerCase(),observed=Date.parse(raw.observedAt||raw.updatedAt||'');
 if(!productId||!name||!productUrl||!Number.isFinite(priceToman)||priceToman<=0||!['in_stock','out_of_stock','unknown'].includes(availability))return null;
 if(!Number.isFinite(observed)||observed>now+300000||now-observed>MAX_AGE_MS)return null;
 const src=raw.specifications||raw.specs||{},specifications={};
 if(src&&typeof src==='object'&&!Array.isArray(src))Object.keys(src).slice(0,40).forEach(k=>{const v=src[k];if(v==null||typeof v==='object')return;const key=clean(k),value=clean(v);if(key&&value)specifications[key.slice(0,80)]=value.slice(0,200);});
 return {id:storeId+':'+productId,productId,providerId:storeId+'-feed',retailerId:storeId,store:store.name,storeName:store.name,name,brand:clean(raw.brand),model:clean(raw.model),priceToman:Math.round(priceToman),price:Math.round(priceToman),currency:'IRT',availability,productUrl,attributes:specifications,observedAt:new Date(observed).toISOString(),verifiedSource:true};
}
function feedConfig(storeId,env) {
 const prefix='DIGIYAR_COMPARISON_'+STORES[storeId].env,endpoint=clean(env[prefix+'_FEED_URL']),token=clean(env[prefix+'_FEED_TOKEN']);if(!endpoint)return null;
 let url;try{url=new URL(endpoint);}catch(_){return null;}if(url.protocol!=='https:'||url.username||url.password)return null;return {url:url.href,token};
}
async function readFeed(storeId,query,env,fetchImpl) {
 const config=feedConfig(storeId,env);if(!config)return {storeId,configured:false,products:[]};
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),TIMEOUT_MS);
 try {
  const headers={'Content-Type':'application/json',Accept:'application/json'};if(config.token)headers.Authorization='Bearer '+config.token;
  const response=await fetchImpl(config.url,{method:'POST',headers,body:JSON.stringify({query,limit:8}),signal:controller.signal});
  if(!response.ok)return {storeId,configured:true,products:[],error:'upstream_'+response.status};
  const length=Number(response.headers&&response.headers.get&&response.headers.get('content-length'));if(Number.isFinite(length)&&length>MAX_BODY_CHARS)return {storeId,configured:true,products:[],error:'feed_response_too_large'};
  const text=await response.text();if(text.length>MAX_BODY_CHARS)return {storeId,configured:true,products:[],error:'feed_response_too_large'};
  let payload;try{payload=JSON.parse(text);}catch(_){return {storeId,configured:true,products:[],error:'invalid_feed_json'};}
  const rows=Array.isArray(payload)?payload:payload&&Array.isArray(payload.products)?payload.products:[],products=[],seen=new Set(),now=Date.now();
  rows.slice(0,100).forEach(row=>{const item=normalizeProduct(row,storeId,now);if(!item||seen.has(item.id))return;seen.add(item.id);products.push(item);});
  return {storeId,configured:true,products};
 }catch(error){return {storeId,configured:true,products:[],error:error&&error.name==='AbortError'?'upstream_timeout':'upstream_unavailable'};}finally{clearTimeout(timeout);}
}
async function handler(req,res) {
 const origin=clean(req.headers.origin);if(origin&&!allowedOrigin(origin))return send(res,403,{error:'origin_not_allowed'});
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');}
 if(req.method==='OPTIONS')return res.status(204).end();if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
 if(!rateAllowed(req)){res.setHeader('Retry-After','60');return send(res,429,{error:'rate_limit_exceeded'});}
 let body={};try{body=req.body&&typeof req.body==='object'?req.body:JSON.parse(req.body||'{}');}catch(_){return send(res,400,{error:'invalid_json'});}
 const query=clean(body.query);if(!query||query.length>180)return send(res,400,{error:'query_required_or_too_long'});
 if(typeof fetch!=='function')return send(res,503,{error:'feed_gateway_unavailable'});
 const feeds=await Promise.all(Object.keys(STORES).map(id=>readFeed(id,query,process.env,fetch)));
 const products=feeds.flatMap(feed=>feed.products);
 return send(res,200,{ok:true,query,products,sources:feeds.map(feed=>({id:feed.storeId,configured:feed.configured,count:feed.products.length,error:feed.error||null})),comparisonReady:products.length>=2&&new Set(products.map(item=>item.retailerId)).size>=2});
}
module.exports=handler;module.exports._test={normalizeProduct,feedConfig,readFeed,STORES};
