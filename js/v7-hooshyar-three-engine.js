/* DigiYar V7 — three-stage deterministic Hooshyar engine.
 * 1) Parse the need; 2) retrieve merchant evidence from the canonical KB;
 * 3) rank candidates and generate a query for each merchant.
 * No network, model, key, or paid service is required.
 */
(function(root){
'use strict';
var VERSION='7.0.0-hooshyar-three-engine.10';
function clean(v){return String(v==null?'':v).replace(/[\u200c]/g,' ').replace(/\s+/g,' ').trim();}
function norm(v){
 return clean(v).toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک')
  .replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);})
  .replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);})
  .replace(/می\s*خوام|می\s*خواهم|دنبال\s*یه|دنبال\s*یک|یه\s*چیزی|یک\s*چیزی/g,' ')
  .replace(/ضد\s*آفتاب|ضدآفتاب/g,'ضد آفتاب')
  .replace(/\s+/g,' ').trim();
}
var CONCEPTS=[
 {key:'train_ticket',label:'بلیط قطار',domain:'travel_ticket',terms:['بلیط قطار','بلیت قطار','قطار','سفر ریلی','رزرو قطار'],patterns:/(?:بلیط|بلیت|رزرو|سفر|برم|بروم).{0,30}(?:قطار|ریل)|(?:قطار|ریل).{0,30}(?:بلیط|بلیت|تهران|مشهد)|قطار/i},
 {key:'air_purifier',label:'دستگاه تصفیه هوا',domain:'home',terms:['تصفیه هوا','دستگاه تصفیه','پاکسازی هوا','هوای پاک','تصفیه کننده هوا'],patterns:/(?:تصفیه\s*هوا|دستگاه\s*تصفیه|پاکسازی\s*هوا|هوای\s*(?:اتاق|خانه).{0,20}(?:تمیز|پاک|آلوده))/i},
 {key:'sofa_cleaning',label:'محصول نظافت مبل پارچه‌ای',domain:'home',terms:['تمیزکننده مبل پارچه‌ای','شوینده مبل','بخارشوی مبل','نظافت مبل'],patterns:/(?:تمیز\s*کردن|تمیزکاری|شستشو|شستن|نظافت|شوینده|پاک\s*کردن|پاکسازی|مبل\s*شویی).{0,35}(?:مبل|مبلمان|پارچه)|(?:مبل|مبلمان).{0,35}(?:تمیز|شستن|شستشو|نظافت|پارچه)/i},
 {key:'office_bag',label:'کیف اداری',domain:'fashion',terms:['کیف اداری','کیف کاری','کیف رسمی','کیف محل کار'],patterns:/(?:کیف\s*(?:اداری|کاری|رسمی)|کیف.{0,15}(?:محل\s*کار|محل\s*کارم))/i},
 {key:'mobile_accessory',label:'لوازم جانبی موبایل',domain:'digital',terms:['لوازم جانبی موبایل','لوازم جانبی','اکسسوری','قاب گوشی','کاور گوشی','گلس گوشی','شارژر موبایل','پاوربانک','هندزفری'],patterns:/(?:قاب|کاور|گلس|محافظ\s*صفحه|محافظ\s*لنز|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری).{0,25}(?:موبایل|گوشی|سامسونگ|آیفون)?/i},
 {key:'mobile_phone',label:'گوشی موبایل',domain:'digital',terms:['موبایل','گوشی هوشمند','تلفن همراه'],patterns:/(?:موبایل|گوشی|تلفن\s*همراه|سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi)/i},
 {key:'skincare',label:'محصول مراقبت پوست',domain:'beauty',terms:['مرطوب کننده','آبرسان','ضد آفتاب','کرم پوست','مراقبت پوست'],patterns:/(?:مرطوب\s*کننده|آبرسان|ضد\s*آفتاب|ضدآفتاب|مراقبت\s*پوست|کرم\s*پوست)/i},
 {key:'shoe',label:'کفش',domain:'fashion',terms:['کفش','کتانی','اسنیکر','کفش ورزشی'],patterns:/(?:کفش|کتانی|اسنیکر)/i},
 {key:'clothing',label:'پوشاک',domain:'fashion',terms:['لباس','پوشاک','شلوار','مانتو','پیراهن'],patterns:/(?:لباس|پوشاک|شلوار|مانتو|پیراهن|کاپشن)/i}
];
var GENERAL=new Set(['digikala','snappshop','torob','basalam','memarket','takhfifan','esam']);
var CONCEPT_STORES={
 train_ticket:['shab','safarme','raja','ghasedak24','mrbilit','trip','safarmarket','alibaba'],
 air_purifier:['digikala','snappshop','torob','basalam','memarket'],
 sofa_cleaning:['digikala','snappshop','torob','basalam','memarket'],
 office_bag:['modiseh','janebi','dayan','digikala','snappshop','torob','basalam'],
 mobile_accessory:['janebi','digido','gooshishop','technolife','digikala','snappshop','torob','basalam'],
 mobile_phone:['digido','digiland','berozkala','gooshishop','technolife','meghdadit','digikala','snappshop','torob','basalam','takhfifan','esam']
};
var DOMAIN_SYNONYMS={
 fashion:['مد','پوشاک','کیف','کفش','لباس','اکسسوری'],digital:['دیجیتال','موبایل','گوشی','تلفن همراه','لوازم جانبی'],
 home:['خانه','منزل','لوازم خانگی','نظافت'],beauty:['زیبایی','آرایشی','مراقبت پوست'],health:['سلامت','بهداشتی','دارو'],
 travel_ticket:['سفر','بلیط','رزرو','قطار','هواپیما','اتوبوس'],auto_service:['خودرو','ماشین','خدمات خودرو']
};
function parseNeed(query){
 var q=norm(query),concept=null;
 for(var i=0;i<CONCEPTS.length;i++){if(CONCEPTS[i].patterns.test(q)){concept=CONCEPTS[i];break;}}
 var brand=null;
 if(/سامسونگ|samsung/i.test(q))brand='سامسونگ';
 else if(/آیفون|iphone/i.test(q))brand='آیفون';
 else if(/شیائومی|xiaomi/i.test(q))brand='شیائومی';
 var budget=null;
 var bm=q.match(/(?:تا|حداکثر|زیر|بودجه\s*(?:ام|من)?\s*(?:حدود)?|حدود)\s*(\d[\d,]*)\s*(میلیون|م|هزار|تومان)?/);
 if(bm){var amount=Number(bm[1].replace(/,/g,''));if(Number.isFinite(amount)){if(bm[2]==='میلیون'||bm[2]==='م')amount*=1000000;else if(bm[2]==='هزار')amount*=1000;else if(amount<10000&&/تومان/.test(q))amount*=1000000;budget=amount;}}
 var attrs=[];
 ['جادار','سبک','ضد آب','ارزان','اقتصادی','اصل','رسمی','برای محل کار','اتاق خواب','پارچه‌ای','بی‌سیم'].forEach(function(a){if(q.indexOf(norm(a))>=0)attrs.push(a);});
 var targetObject=concept&&concept.key==='sofa_cleaning'?'مبل پارچه‌ای':concept&&concept.key==='air_purifier'&&/اتاق\s*خواب/.test(q)?'اتاق خواب':null;
 var product=concept?concept.label:q;
 if(concept&&concept.key==='mobile_phone'&&brand)product='گوشی '+brand;
 if(concept&&concept.key==='mobile_accessory'&&brand)product='لوازم جانبی '+brand;
 return {query:clean(query),normalized:q,concept:concept?concept.key:null,requestedProduct:product,domain:concept?concept.domain:null,domains:concept?[concept.domain]:[],brand:brand,maxBudgetToman:budget,attributes:attrs,targetObject:targetObject,taskType:concept&&concept.key==='train_ticket'?'ticket_search':concept&&concept.key==='sofa_cleaning'?'cleaning_task':'shopping_search'};
}
function retrieveCandidates(need,catalog,eligibleIds){
 var base=Array.isArray(eligibleIds)?eligibleIds.map(function(x){return String(x&&x.id||x||'').toLowerCase();}):[];
 var candidates=[];
 var broadTerms=['خانه','دیجیتال','کالا','محصول','فروشگاه','عمومی','لوازم','پوشاک','سلامت','بهداشت','اکسسوری','مد','ورزش','سفر','خرید','فروش'];
 function evidenceTerms(query,item){
  var q=norm(query),out=[];
  var genericProductWords=['میز','مبل','مبلمان','کیف','لباس','پوشاک','کفش','خانه','صندلی','لوازم','محصول','دیجیتال','زیبایی','آرایشی','بهداشتی','اکسسوری','مد'];
  var terms=[].concat(item.products||[],item.aliases||[],item.specialties||[],item.productFamilies||[],item.querySignals||[]).reduce(function(all,value){
   String(value==null?'':value).split(/[,،;؛\n]+/).map(function(x){return x.trim();}).filter(Boolean).forEach(function(x){all.push(x);});
   return all;
  },[]);
  terms.forEach(function(raw){
   var term=norm(raw);
   if(!term||term.length<3)return;
   var words=term.split(/[^\u0600-\u06FFa-z0-9]+/i).filter(Boolean)
    .filter(function(w){return w.length>=3&&broadTerms.indexOf(w)<0;});
   /* Generic category words are not proof of a specific product match. */
   if(words.length===1&&genericProductWords.indexOf(words[0])>=0&&q!==term)return;
   if(q.indexOf(term)>=0){out.push(raw);return;}
   if(words.length>=2&&words.every(function(w){return q.indexOf(w)>=0;})){out.push(raw);return;}
   if(words.length===1&&words[0].length>=4&&broadTerms.indexOf(words[0])<0&&
      new RegExp('(?:^|[^\u0600-\u06FFa-z0-9])'+words[0]+'(?:$|[^\u0600-\u06FFa-z0-9])','i').test(q)){out.push(raw);}
  });
  return Array.from(new Set(out));
 }
 Object.keys(catalog||{}).forEach(function(id){
  var s=catalog[id]||{},sid=String(id).toLowerCase();
  var fields=[s.name].concat(s.domains||[],s.products||[],s.aliases||[],s.specialties||[],s.productFamilies||[],s.querySignals||[],s.semanticText||[]);
  var text=norm(fields.join(' ')),score=base.indexOf(sid)>=0?3:0,proof=[];
  var concept=CONCEPTS.find(function(c){return c.key===need.concept;});
  var productTerms=concept?concept.terms:[need.requestedProduct];
  var direct=false;
  productTerms.forEach(function(term){
   var t=norm(term);if(t&&t.length>2&&text.indexOf(t)>=0){score+=s.specialties&&s.specialties.some(function(v){return norm(v).indexOf(t)>=0;})?7:5;direct=true;proof.push(term);}
  });
  /* Shared open-catalog retrieval: inspect every merchant's declared product
     evidence, not only concept-specific seed lists. Exact phrases, or a
     complete match of a multi-word product's meaningful tokens, can admit
     new merchants without adding a per-query allowlist. */
  var evidence=evidenceTerms(need.normalized,s);
  evidence.forEach(function(term){
   if(proof.some(function(p){return norm(p)===norm(term);}))return;
   score+=4;direct=true;proof.push(term);
  });
  var domainHit=!!(need.domain&&(s.domains||[]).indexOf(need.domain)>=0);
  if(domainHit)score+=2;
  var domainWords=DOMAIN_SYNONYMS[need.domain]||[];
  if(domainWords.some(function(w){return need.normalized.indexOf(norm(w))>=0;})&&domainHit)score+=1;
  var isGeneral=GENERAL.has(sid);
  if(isGeneral&&domainHit&&direct)score+=1;
  if(need.concept==='sofa_cleaning'&&isGeneral&&domainHit)score+=3;
  if(need.concept==='mobile_accessory'&&['meghdadit','takhfifan','esam'].indexOf(sid)>=0)score=-100;
  var furnitureMerchant=!isGeneral&&((s.domains||[]).indexOf('furniture')>=0||(s.intents||[]).indexOf('furniture')>=0);
  var hasAirPurifierProduct=[].concat(s.products||[],s.aliases||[],s.specialties||[],s.productFamilies||[]).some(function(v){
   return /(?:تصفیه\\s*هوا|دستگاه\\s*تصفیه|پاکسازی\\s*هوا|تصفیه\\s*کننده\\s*هوا|air\\s*purifier)/i.test(norm(v));
  });
  /* Furniture-domain overlap is never evidence for an air purifier. Allow an unusual cross-category merchant only when its KB explicitly lists air-purifier products. */
  if(need.concept==='air_purifier'&&furnitureMerchant&&!hasAirPurifierProduct){score=-100;proof=[];}
  var hasCleaningProduct=[].concat(s.products||[],s.aliases||[],s.specialties||[],s.productFamilies||[]).some(function(v){
   return /(?:شوینده|تمیزکننده|نظافت|مبل\s*شویی|دستگاه\s*مبل\s*شوی|بخارشوی|فرش\s*شوی(?:ی)?|جاروبرقی)/i.test(norm(v));
  });
  if(need.concept==='sofa_cleaning'&&hasCleaningProduct&&!direct){score+=4;direct=true;proof.push('sofa-cleaning-appliance');}
  if(need.concept==='sofa_cleaning'&&furnitureMerchant&&!hasCleaningProduct){score=-100;proof=[];}
  var excluded=(s.exclude||s.exclusions||[]).some(function(x){var t=norm(x);return t&&need.normalized.indexOf(t)>=0;});
  if(excluded)score=-100;
  /* Domain tags and curated seed lists are not sufficient: require direct product or use-case evidence. */
  if(score>=3&&direct)candidates.push({id:sid,name:s.name||sid,score:score,directMatch:direct,domainMatch:domainHit,general:isGeneral,proof:Array.from(new Set(proof)),homepage:s.homepage||''});
 });
 return candidates;
}
function rankCandidates(need,candidates,eligibleIds){
 var base=Array.isArray(eligibleIds)?eligibleIds.map(function(x){return String(x&&x.id||x||'').toLowerCase();}):[];
 return candidates.sort(function(a,b){
  if(a.general!==b.general&&a.directMatch&&b.directMatch)return a.general?1:-1;
  if(a.score!==b.score)return b.score-a.score;
  var ai=base.indexOf(a.id),bi=base.indexOf(b.id);
  if(ai>=0||bi>=0)return ai<0?1:bi<0?-1:ai-bi;
  return a.name.localeCompare(b.name,'fa');
 });
}
function resolve(query,catalog,eligibleIds,classified){
 var need=parseNeed(query);
 if(classified&&classified.kind==='travel_ticket'){need.concept='train_ticket';need.requestedProduct=classified.product||need.requestedProduct;need.domain='travel_ticket';need.domains=['travel_ticket'];need.taskType='ticket_search';}
 /* Reuse the established eligibility contract as one evidence source, then
    enrich/rank those candidates with the three-stage resolver. */
 var seedIds=Array.isArray(eligibleIds)?eligibleIds.slice():[];
 if(!seedIds.length&&root.DigiYarStoreEligibility&&typeof root.DigiYarStoreEligibility.storesForQuery==='function'){
  try{seedIds=root.DigiYarStoreEligibility.storesForQuery(query,[]).map(function(s){return String(s&&s.id||s||'').toLowerCase();});}catch(_){seedIds=[];}
 }
 var preferred=CONCEPT_STORES[need.concept]||[];
 seedIds=seedIds.map(function(id){return String(id&&id.id||id).toLowerCase();});
 var candidates=retrieveCandidates(need,catalog,seedIds);
 /* Curated store lists are ranking hints only; never add a merchant without
    direct product/use-case evidence in the canonical merchant KB. */
 var ranked=rankCandidates(need,candidates,seedIds);
 if(need.concept==='mobile_phone'||need.concept==='mobile_accessory'){
  ranked.sort(function(a,b){var ai=preferred.indexOf(a.id),bi=preferred.indexOf(b.id);if(ai<0)ai=9999;if(bi<0)bi=9999;return ai-bi;});
 }
 var ids=ranked.map(function(x){return x.id;});
 var queries={};
 ids.forEach(function(id){
  var s=catalog[id]||{};
  var phrase=need.concept==='train_ticket'?clean(query):need.requestedProduct;
  if(need.brand&&need.concept!=='mobile_phone'&&need.concept!=='mobile_accessory')phrase+=' '+need.brand;
  if(need.attributes.length)phrase+=' '+need.attributes.slice(0,2).join(' ');
  /* Do not replace a specific product with a broad category just because a store is general. */
  queries[id]=clean(phrase)||clean(query);
 });
 return {version:VERSION,need:need,candidates:ranked,eligibleStoreIds:ids,searchQueries:queries,trace:{parsedConcept:need.concept,candidateCount:ranked.length,top:ranked.slice(0,8).map(function(x){return {id:x.id,score:x.score,directMatch:x.directMatch,proof:x.proof};})}};
}
var api={version:VERSION,parseNeed:parseNeed,retrieveCandidates:retrieveCandidates,rankCandidates:rankCandidates,resolve:resolve};
root.DigiYarHooshyarThreeEngine=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
