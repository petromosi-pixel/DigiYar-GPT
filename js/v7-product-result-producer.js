/* DigiYar V7 — Product Result Producer
   Produces the V7 Product Result Set from existing local product-index assets.
   No API, resolver, catalog adapter, or Store Simulator calls.
*/
(function(root){
'use strict';
var VERSION='7.0.0-product-result-producer.1';
var INDEXES=[
 {path:'js/digital-product-index-v5.1.js',exportName:'DIGITAL_PRODUCTS'},
 {path:'js/mobile-product-index-v5.1.js',exportName:'MOBILE_PRODUCTS'},
 {path:'js/laptop-computer-product-index-v5.1.js',exportName:'LAPTOP_COMPUTER_PRODUCTS'},
 {path:'js/audio-video-product-index-v5.1.js',exportName:'AUDIO_VIDEO_PRODUCTS'},
 {path:'js/auto-product-index-v5.1.js',exportName:'AUTO_PRODUCTS'},
 {path:'js/beauty-health-product-index-v5.1.js',exportName:'BEAUTY_HEALTH_PRODUCTS'},
 {path:'js/books-stationery-product-index-v5.1.js',exportName:'BOOKS_STATIONERY_PRODUCTS'},
 {path:'js/fashion-product-index-v5.1.js',exportName:'FASHION_PRODUCTS'},
 {path:'js/home-appliances-product-index-v5.1.js',exportName:'HOME_APPLIANCES_PRODUCTS'},
 {path:'js/kids-toys-product-index-v5.1.js',exportName:'KIDS_TOYS_PRODUCTS'},
 {path:'js/sports-travel-product-index-v5.1.js',exportName:'SPORTS_TRAVEL_PRODUCTS'},
 {path:'js/supermarket-product-index-v5.1.js',exportName:'SUPERMARKET_PRODUCTS'},
 {path:'js/tools-industrial-product-index-v5.1.js',exportName:'TOOLS_INDUSTRIAL_PRODUCTS'}
];
var cache={};
function norm(v){return String(v==null?'':v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();}
function num(v){var n=Number(v);return Number.isFinite(n)?n:0;}
function parseBudget(q){
 var s=norm(q).replace(/,/g,'').replace(/،/g,'');
 var nums=[],m,re=/([0-9۰-۹]+(?:\.[0-9۰-۹]+)?)\s*(میلیون|م|هزار|تومان|ریال)?/g;
 while((m=re.exec(s))&&nums.length<2){var raw=m[1].replace(/[۰-۹]/g,function(c){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c);});var n=Number(raw);if(m[2]==='میلیون'||m[2]==='م')n*=1000000;else if(m[2]==='هزار')n*=1000;else if(m[2]==='ریال')n/=10;if(n>1000)nums.push(n);}
 if(nums.length>=2)return{min:Math.min(nums[0],nums[1]),max:Math.max(nums[0],nums[1])};
 if(nums.length===1)return{min:0,max:nums[0]};
 return{min:0,max:0};
}
function queryTokens(q){return norm(q).replace(/\d[\d۰-۹.,]*\s*(?:میلیون|م|هزار|تومان|ریال)?/g,' ').split(/\s+/).filter(function(x){return x.length>1;});}
function parseIndexSource(source,exportName){
 var text=String(source||'').replace(/^\s*export\s+(?:const|let|var)\s+/,function(m){return m.replace('export ','');});
 var marker=new RegExp('(?:const|let|var)\\s+'+exportName+'\\s*=');
 if(!marker.test(text))throw Error('Index export not found: '+exportName);
 var data=Function(text.replace(marker,'return ')+'\n')();
 return Array.isArray(data)?data:[];
}
async function loadIndex(spec){
 if(cache[spec.path])return cache[spec.path];
 var url=new URL(spec.path,root.document&&root.document.baseURI||'/').href;
 var r=await fetch(url,{cache:'no-store'});
 if(!r.ok)throw Error('Index HTTP '+r.status);
 var data=parseIndexSource(await r.text(),spec.exportName);
 cache[spec.path]=data;
 return data;
}
function price(p){
 var n=num(p&&p.priceToman);if(n>0)return Math.round(n);
 n=num(p&&p.price);if(n<=0)return 0;
 return /irt|toman|تومان/i.test(String(p.currency||''))?Math.round(n):Math.round(n);
}
function extractSpecs(p){
 var text=String(p&&p.name||'');
 var out={};
 var patterns=[
  ['ram','رم\\s*(?:تا|:)?\\s*([0-9۰-۹]+)\\s*(?:گیگ|GB|gb)'],
  ['storage','(?:ظرفیت|حافظه(?: داخلی)?)\\s*([0-9۰-۹]+(?:\\.[0-9۰-۹]+)?)\\s*(?:گیگ|GB|ترابایت|TB)'],
  ['screen','([0-9۰-۹]+(?:\\.[0-9۰-۹]+)?)\\s*(?:اینچ|inch)'],
  ['camera','دوربین[^،,؛;]{0,30}([0-9۰-۹]+)\\s*(?:مگاپیکسل|MP)'],
  ['refreshRate','([0-9۰-۹]+)\\s*Hz']
 ];
 patterns.forEach(function(pair){var m=text.match(new RegExp(pair[1],'i'));if(m)out[pair[0]]=m[1];});
 return out;
}
function relevance(p,tokens){
 var text=norm([p&&p.name,p&&p.model,p&&p.brand,p&&p.subcategory,p&&p.category].filter(Boolean).join(' ')),score=0;
 tokens.forEach(function(t){if(text.indexOf(t)>=0)score+=1;});
 return score;
}
async function produce(query,options){
 options=options||{};
 var tokens=queryTokens(query),budget=parseBudget(query),all=[];
 for(var i=0;i<INDEXES.length;i++){try{all=all.concat(await loadIndex(INDEXES[i]));}catch(e){console.warn('V7 Product Result Producer index:',INDEXES[i].path,e);}}
 var ranked=all.filter(function(p){return p&&p.name&&price(p)>0;}).map(function(p){
   var copy=Object.assign({},p);
   copy.priceToman=price(p);copy.price=copy.priceToman;copy.currency='toman';
   var specs=extractSpecs(p);if(Object.keys(specs).length)copy.attributes=Object.assign({},copy.attributes||{},specs);
   copy.matchScore=relevance(p,tokens);
   return copy;
 }).filter(function(p){
   if(budget.max&&p.priceToman>budget.max)return false;
   if(budget.min&&p.priceToman<budget.min)return false;
   return !tokens.length||p.matchScore>0;
 }).sort(function(a,b){return b.matchScore-a.matchScore||a.priceToman-b.priceToman;}).slice(0,Math.max(1,Math.min(20,num(options.limit)||8)));
 var Source=root.DigiYarV7ProductResultSource;
 if(Source&&typeof Source.set==='function')Source.set(ranked,{query:query,source:'v7-local-product-index',networkCalls:0,catalogLookup:false,resolverCall:false,storeQuery:false});
 return ranked;
}
var api={version:VERSION,indexes:INDEXES.map(function(x){return x.path;}),produce:produce,parseIndexSource:parseIndexSource,clear:function(){cache={};}};
root.DigiYarV7ProductResultProducer=api;
root.DigiYarV7ProductProducer=api;
})(typeof window!=='undefined'?window:globalThis);
