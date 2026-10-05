/* DigiYar V7 — Product Result Producer
   Produces the V7 Product Result Set from existing local product-index assets.
   No API, resolver, catalog adapter, or Store Simulator calls.
*/
(function(root){
'use strict';
var VERSION='7.0.0-product-result-producer.13';
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

function norm(v){
 return String(v==null?'':v)
   .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
   .replace(/[‌\u200c]/g,' ')
   .replace(/\s+/g,' ').trim().toLowerCase();
}
function num(v){var n=Number(v);return Number.isFinite(n)?n:0;}

function parseBudget(q){
 var s=norm(q).replace(/,/g,'').replace(/،/g,'');
 var nums=[],m,re=/([0-9۰-۹]+(?:\.[0-9۰-۹]+)?)\s*(میلیون|م|هزار|تومان|ریال)?/g;
 while((m=re.exec(s))&&nums.length<2){
   var raw=m[1].replace(/[۰-۹]/g,function(c){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c);});
   var n=Number(raw);
   if(m[2]==='میلیون'||m[2]==='م')n*=1000000;
   else if(m[2]==='هزار')n*=1000;
   else if(m[2]==='ریال')n/=10;
   if(n>1000)nums.push(n);
 }
 if(nums.length>=2)return{min:Math.min(nums[0],nums[1]),max:Math.max(nums[0],nums[1])};
 if(nums.length===1)return{min:0,max:nums[0]};
 return{min:0,max:0};
}

function queryTokens(q){
 return norm(q)
   .replace(/[0-9۰-۹][0-9۰-۹.,]*\s*(?:میلیون|م|هزار|تومان|ریال)?/g,' ')
   .replace(/\b(?:میلیون|تومان|ریال|الی|تا|زیر|حدود|برای|محل|کار)\b/g,' ')
   .split(/\s+/).filter(function(x){return x.length>1;});
}

/* Strong product-type intents. These are used as hard relevance gates
   when the user's query explicitly names a product family. */
var TYPE_RULES=[
 {key:'mobile',terms:['موبایل','گوشی موبایل','گوشی'],fields:['mobile','گوشی موبایل','گوشی']},
 {key:'laptop',terms:['لپ تاپ','لپ‌تاپ','لپتاپ','نوت بوک','نوت‌بوک'],fields:['laptop','لپ تاپ','لپ‌تاپ','لپتاپ','نوت بوک']},
 {key:'tablet',terms:['تبلت'],fields:['tablet','تبلت']},
 {key:'headphone',terms:['هدفون','هدست','ایرباد','هندزفری'],fields:['headphone','هدفون','هدست','ایرباد','هندزفری']},
 {key:'television',terms:['تلویزیون','تلويزيون'],fields:['television','تلویزیون','تلويزيون']},
 {key:'monitor',terms:['مانیتور','مانيتور'],fields:['monitor','مانیتور','مانيتور']},
 {key:'camera',terms:['دوربین'],fields:['camera','دوربین']},
 {key:'watch',terms:['ساعت هوشمند','اسمارت واچ','smartwatch'],fields:['watch','ساعت هوشمند','اسمارت واچ','smartwatch']},
 {key:'printer',terms:['پرینتر','پرینتر','چاپگر'],fields:['printer','پرینتر','چاپگر']},
 {key:'refrigerator',terms:['یخچال','فریزر','یخچال فریزر'],fields:['refrigerator','یخچال','فریزر']},
 {key:'washing-machine',terms:['ماشین لباسشویی','لباسشویی'],fields:['washing-machine','ماشین لباسشویی','لباسشویی']},
 {key:'air-conditioner',terms:['کولر گازی','اسپلیت'],fields:['air-conditioner','کولر گازی','اسپلیت']},
 {key:'vacuum',terms:['جاروبرقی','جارو برقی'],fields:['vacuum','جاروبرقی','جارو برقی']},
 {key:'furniture',terms:['مبلمان','مبلمان اداری','میز اداری','صندلی اداری','صندلی مدیریت','میز مدیریت','میز کارمندی','فایلینگ','کمد اداری','پارتیشن اداری'],fields:['furniture','مبلمان','مبلمان اداری','میز اداری','صندلی اداری','صندلی مدیریت','میز مدیریت','میز کارمندی','فایلینگ','کمد اداری','پارتیشن اداری']}
];

function parseIntent(q){
 var s=norm(q),type=null;
 for(var i=0;i<TYPE_RULES.length;i++){
   var rule=TYPE_RULES[i];
   if(rule.terms.some(function(term){return s.indexOf(norm(term))>=0;})){
     type=rule;break;
   }
 }
 var brand=null;
 var knownBrands=['سامسونگ','اپل','شیائومی','هواوی','نوکیا','آنر','وان پلاس','وان‌پلاس','گوگل','سونی','ال جی','ال‌جی','ایسوس','لنوو','اچ پی','اچ‌پی','دل','ایسر','بیتس','جی بی ال','جی‌بی‌ال'];
 for(var b=0;b<knownBrands.length;b++){
   if(s.indexOf(norm(knownBrands[b]))>=0){brand=norm(knownBrands[b]);break;}
 }
 return {type:type,brand:brand};
}

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
 return Math.round(n);
}
function extractSpecs(p){
 var text=String(p&&p.name||''),out={};
 var patterns=[
  ['ram','رم\\s*(?:تا|:)??\\s*([0-9۰-۹]+)\\s*(?:گیگ|GB|gb)'],
  ['storage','(?:ظرفیت|حافظه(?: داخلی)?)\\s*([0-9۰-۹]+(?:\\.[0-9۰-۹]+)?)\\s*(?:گیگ|GB|ترابایت|TB)'],
  ['screen','([0-9۰-۹]+(?:\\.[0-9۰-۹]+)?)\\s*(?:اینچ|inch)'],
  ['camera','دوربین[^،,؛;]{0,30}([0-9۰-۹]+)\\s*(?:مگاپیکسل|MP)'],
  ['refreshRate','([0-9۰-۹]+)\\s*Hz']
 ];
 patterns.forEach(function(pair){var m=text.match(new RegExp(pair[1],'i'));if(m)out[pair[0]]=m[1];});
 return out;
}

function fieldText(p){
 return {
   name:norm(p&&p.name),
   model:norm(p&&p.model),
   brand:norm(p&&p.brand),
   subcategory:norm(p&&p.subcategory),
   category:norm(p&&p.category),
   all:norm([p&&p.name,p&&p.model,p&&p.brand,p&&p.subcategory,p&&p.category].filter(Boolean).join(' '))
 };
}

function hasTypeEvidence(p,intent){
 if(!intent.type)return true;
 var f=fieldText(p);

 /* Mobile is especially noisy in the source indexes: accessories can have
    category=mobile or subcategory="لوازم جانبی موبایل". For a mobile query,
    require actual phone identity evidence, not merely the contaminated
    category label. */
 if(intent.type.key==='mobile'){
   return f.name.indexOf('گوشی موبایل')>=0 ||
          f.name.indexOf('گوشی موبايل')>=0 ||
          f.subcategory==='گوشی موبایل' ||
          f.subcategory==='گوشی موبايل';
 }

 var fields=f.name+' '+f.subcategory+' '+f.category;
 return intent.type.fields.some(function(term){
   return fields.indexOf(norm(term))>=0;
 });
}

function hasBrandIdentity(p,brand){
 if(!brand)return true;
 var f=fieldText(p);
 if(f.brand===brand || f.brand.indexOf(brand)>=0)return true;

 /* Brand names appearing only inside compatibility/accessory text are
    not treated as product identity. */
 var name=f.name;
 if(name.indexOf(brand)<0)return false;
 var blocked=[
   'سازگار با '+brand,
   'سازگار '+brand,
   'برای '+brand,
   'مناسب '+brand,
   'قابل استفاده با '+brand,
   'compatible with '+brand,
   'for '+brand
 ];
 if(blocked.some(function(x){return name.indexOf(x)>=0;}))return false;

 /* If the query has a strong product type, the brand must occur in the
    product identity region rather than only in a compatibility clause. */
 if(name.indexOf('سازگار با')>=0 || name.indexOf('برای دستگاه')>=0){
   var firstCompat=Math.min.apply(Math,[
     name.indexOf('سازگار با')>=0?name.indexOf('سازگار با'):999999,
     name.indexOf('برای دستگاه')>=0?name.indexOf('برای دستگاه'):999999
   ]);
   if(name.indexOf(brand)>firstCompat)return false;
 }
 return true;
}

function relevance(p,tokens,intent){
 var f=fieldText(p),score=0;
 /* Standardized identity weighting:
    product-name evidence dominates everything else.
    A category/subcategory label can never compensate for a missing
    product-name identity. Explicit brand evidence is deliberately below
    name/model evidence. */
 if(intent.type){
   if(!hasTypeEvidence(p,intent))return -1000;
   score+=25;
 }
 if(intent.brand){
   if(!hasBrandIdentity(p,intent.brand))return -1000;
   if(f.brand===intent.brand)score+=25;
   else if(f.name.indexOf(intent.brand)>=0)score+=20;
   else return -1000;
 }
 var brandToken=intent.brand?norm(intent.brand):'';
 tokens.forEach(function(t){
   if(!t||t===brandToken)return;
   if(f.name.indexOf(t)>=0)score+=100;
   else if(f.model.indexOf(t)>=0)score+=35;
   else if(f.subcategory.indexOf(t)>=0)score+=8;
   else if(f.category.indexOf(t)>=0)score+=3;
 });
 return score;
}

function dedupKey(p){
 var id=norm(p&&p.productId)||norm(p&&p.id);
 var source=norm(p&&p.sourceId)||norm(p&&p.source)||norm(p&&p.storeName)||norm(p&&p.store)||'unknown';
 if(id)return 'id|'+source+'|'+id;
 var name=norm(p&&p.name),model=norm(p&&p.model),brand=norm(p&&p.brand);
 return 'text|'+source+'|'+name+'|'+model+'|'+brand;
}

function completeness(p){
 var n=0;
 ['brand','model','subcategory','category','productUrl','image','priceToman'].forEach(function(k){
   if(p&&p[k])n++;
 });
 return n;
}

function deduplicate(items){
 var map=Object.create(null),order=[];
 items.forEach(function(p){
   var key=dedupKey(p),old=map[key];
   if(!old){map[key]=p;order.push(key);return;}
   if(completeness(p)>completeness(old) || (completeness(p)===completeness(old)&&price(p)<price(old))){
     map[key]=p;
   }
 });
 return order.map(function(k){return map[k];});
}

async function produce(query,options){
 options=options||{};
 var tokens=queryTokens(query),budget=parseBudget(query),intent=parseIntent(query),all=[];
 if(options.aiPlan&&typeof options.aiPlan==='object'){
   var ai=options.aiPlan;
   if(ai.productTerms&&Array.isArray(ai.productTerms)) tokens=tokens.concat(ai.productTerms.map(norm).filter(Boolean));
   if(ai.requiredNameTerms&&Array.isArray(ai.requiredNameTerms)) tokens=tokens.concat(ai.requiredNameTerms.map(norm).filter(Boolean));
   if(ai.brand) intent.brand=norm(ai.brand);
   if(ai.category){var ar=TYPE_RULES.find(function(r){return r.key===norm(ai.category)||r.terms.some(function(t){return norm(t)===norm(ai.category);});});if(ar)intent.type=ar;}
   if(ai.minBudgetToman!=null||ai.maxBudgetToman!=null) budget={min:Number(ai.minBudgetToman)||0,max:Number(ai.maxBudgetToman)||0};
 }
 for(var i=0;i<INDEXES.length;i++){
   try{all=all.concat(await loadIndex(INDEXES[i]));}
   catch(e){console.warn('V7 Product Result Producer index:',INDEXES[i].path,e);}
 }

 var candidates=all.filter(function(p){
   return p&&p.name&&price(p)>0;
 }).map(function(p){
   var copy=Object.assign({},p);
   copy.priceToman=price(p);
   copy.price=copy.priceToman;
   copy.currency='toman';
   var specs=extractSpecs(p);
   if(Object.keys(specs).length)copy.attributes=Object.assign({},copy.attributes||{},specs);
   copy.matchScore=relevance(p,tokens,intent);
   return copy;
 }).filter(function(p){
   if(budget.max&&p.priceToman>budget.max)return false;
   if(budget.min&&p.priceToman<budget.min)return false;
   if(tokens.length&&!p.matchScore) return false;
   /* For explicit furniture searches, the requested product identity must be present in the product name. */
   if(intent.type&&intent.type.key==='furniture'){
     var n=fieldText(p).name;
     var hasFurniture=/مبلمان|میز\s*(?:اداری|مدیریت|کارمندی)|صندلی\s*(?:اداری|مدیریت)|فایلینگ|کمد\s*اداری|پارتیشن\s*اداری/.test(n);
     if(!hasFurniture)return false;
     if(norm(query).indexOf('اداری')>=0&&!n.includes('اداری'))return false;
   }
   return true;
 });

 /* Required identity tokens: semantic product words must occur in the product name/model, not merely category metadata. */
 var semanticTokens=tokens.filter(function(t){return !['برای','محل','کار','مناسب','استفاده','جهت','دفتر'].includes(t);});
 if(intent.type){
   var qn=norm(query), furniturePhrase=qn.includes('مبلمان اداری');
   candidates=candidates.filter(function(p){
     var f=fieldText(p), n=f.name;
     /* For an explicit "مبلمان اداری" request, the product name itself
        must identify both requested concepts. Desks/chairs/accessories
        are not allowed to masquerade as furniture unless the query asks
        for those product families. */
     if(intent.type.key==='furniture'&&furniturePhrase){
       return n.includes('مبلمان') && n.includes('اداری');
     }
     /* Every semantic query token must have identity evidence in the
        product name/model/brand. Category metadata is insufficient. */
     return semanticTokens.every(function(t){
       return n.indexOf(t)>=0 || f.model.indexOf(t)>=0 || f.brand.indexOf(t)>=0;
     });
   });
 }
 /* Minimum relevance floor: weak accidental matches are discarded even
    if they happen to survive the hard type/brand gates. */
 candidates=candidates.filter(function(p){
   return p.matchScore>= (intent.type||intent.brand ? 60 : Math.max(70,semanticTokens.length*70));
 });
 var unique=deduplicate(candidates);
 var ranked=unique.sort(function(a,b){
   return b.matchScore-a.matchScore || a.priceToman-b.priceToman;
 }).slice(0,Math.max(1,Math.min(20,num(options.limit)||8)));

 /* Universal no-empty fallback:
    the local product indexes are finite snapshots, so an arbitrary product
    (for example a desk or a specific tyre) may legitimately have no indexed
    product. Never invent price/specifications to fill that gap. Instead,
    publish explicit store-search entries so Hooshyar always has a useful
    next result for the user's exact query. These entries are intentionally
    marked as search fallbacks and are excluded from product comparison. */
 if(!ranked.length){
   var fallbackStores=[
     {id:'digikala',name:'دیجی‌کالا',url:'https://www.digikala.com/search/?q='},
     {id:'snappshop',name:'اسنپ‌شاپ',url:'https://snappshop.ir/search?query='},
     {id:'torob',name:'ترب',url:'https://torob.com/search/?query='},
     {id:'basalam',name:'باسلام',url:'https://basalam.com/search?q='}
   ];
   ranked=fallbackStores.map(function(store,idx){
     return {
       id:'search-fallback|'+store.id+'|'+norm(query),
       productId:'search-fallback|'+store.id+'|'+norm(query),
       name:'جستجوی «'+String(query).trim()+'» در '+store.name,
       brand:'',model:'',category:'search-fallback',subcategory:'',
       priceToman:0,price:0,currency:'toman',availability:'search',
       productUrl:store.url+encodeURIComponent(String(query).trim()),
       store:store.id,storeName:store.name,source:'store-search-fallback',
       isSearchFallback:true,matchScore:1,rank:idx+1
     };
   }).slice(0,Math.max(1,Math.min(20,num(options.limit)||8)));
 }

 var Source=root.DigiYarV7ProductResultSource;
 var snapshot=null;
 if(Source&&typeof Source.publish==='function'){
   snapshot=Source.publish(ranked,{
     query:query,
     source:'v7-local-product-index',
     networkCalls:0,
     catalogLookup:false,
     resolverCall:false,
     storeQuery:false
   });
 }
 try{
   root.dispatchEvent(new CustomEvent('digiyar:v7-product-results-ready',{detail:snapshot||{
     query:query,
     source:'v7-local-product-index',
     products:ranked
   }}));
 }catch(_){}
 return ranked;
}

async function findByName(query,options){
 options=options||{};
 var q=norm(query);
 if(!q)return [];
 var rawTokens=q.split(/\s+/).filter(function(x){return x.length>1;});
 var all=[];
 for(var i=0;i<INDEXES.length;i++){
   try{all=all.concat(await loadIndex(INDEXES[i]));}
   catch(e){console.warn('V7 Product Name Search index:',INDEXES[i].path,e);}
 }
 var scored=all.filter(function(p){return p&&p.name&&price(p)>0;}).map(function(p){
   var n=norm(p.name),m=norm(p.model),b=norm(p.brand);
   var exact=n===q,contains=n.indexOf(q)>=0;
   var matched=rawTokens.filter(function(t){return n.indexOf(t)>=0;}).length;
   var modelMatched=rawTokens.filter(function(t){return m.indexOf(t)>=0;}).length;
   var brandMatched=rawTokens.filter(function(t){return b.indexOf(t)>=0;}).length;
   var coverage=rawTokens.length?matched/rawTokens.length:0;
   var score=(exact?10000:0)+(contains?3000:0)+(coverage*2000)+(matched*100)+(modelMatched*35)+(brandMatched*20)-(Math.max(0,n.length-q.length)*0.02);
   return {p:Object.assign({},p),score:score,coverage:coverage};
 }).filter(function(x){return x.score>=200||x.coverage>=0.8;}).sort(function(a,b){return b.score-a.score;});
 var seen=Object.create(null),out=[],limit=Math.max(1,Math.min(10,num(options.limit)||5));
 scored.forEach(function(x){
   var key=norm(x.p.productId||x.p.id||x.p.name);
   if(seen[key]||out.length>=limit)return;
   seen[key]=1;
   x.p.priceToman=price(x.p);x.p.price=x.p.priceToman;x.p.currency='toman';
   x.p.matchScore=Math.round(Math.min(100,x.score/100));
   out.push(x.p);
 });
 return out;
}

var api={
 version:VERSION,
 indexes:INDEXES.map(function(x){return x.path;}),
 produce:produce,
 findByName:findByName,
 parseIndexSource:parseIndexSource,
 clear:function(){cache={};}
};
root.DigiYarV7ProductResultProducer=api;
root.DigiYarV7ProductProducer=api;
})(typeof window!=='undefined'?window:globalThis);
