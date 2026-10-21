/* DigiYar — Popular Stores discovery module */
(function(){
'use strict';
var VERSION='7.0.0-popular-store-discovery.22';
var DOMAIN_META={
 digital:{title:'دیجیتال و موبایل',icon:'📱',subtitle:'از گوشی و لپ‌تاپ تا مقایسهٔ قیمت و لوازم جانبی',sub:['موبایل و تبلت','لپ‌تاپ و کامپیوتر','مقایسهٔ قیمت','لوازم جانبی']},
 accessories:{title:'لوازم جانبی دیجیتال',icon:'🎧',subtitle:'برای پیدا کردن لوازم جانبی متناسب با دستگاهت',sub:['قاب و محافظ','شارژر و کابل','صوتی و گجت']},
 furniture:{title:'مبلمان و دکوراسیون',icon:'🛋️',subtitle:'برای چیدمان خانه، مبلمان و انتخاب وسایل کاربردی',sub:['مبل و راحتی','میز و صندلی','دکور و چوب']},
 fashion:{title:'پوشاک، کیف و کفش',icon:'👕',subtitle:'از استایل روزمره تا انتخاب پوشاک و کفش',sub:['پوشاک روزمره','کیف و کفش','استایل و برند']},
 beauty:{title:'زیبایی و آرایشی',icon:'💄',subtitle:'برای مراقبت پوست و مو و انتخاب محصولات آرایشی',sub:['مراقبت پوست','آرایش و عطر','مراقبت مو']},
 health:{title:'سلامت و محصولات بهداشتی',icon:'🌿',subtitle:'محصولات بهداشتی و سلامت را از منابع مرتبط بررسی کن',sub:['مکمل و ویتامین','بهداشت فردی','مراقبت تخصصی']},
 medicine:{title:'دارو و تجهیزات سلامت',icon:'🩺',subtitle:'داروخانه‌ها و فروشگاه‌های تخصصی سلامت',sub:['داروخانه آنلاین','تجهیزات پزشکی','مراقبت درمانی']},
 supermarket:{title:'سوپرمارکت و مواد غذایی',icon:'🛒',subtitle:'خرید روزمره و کالاهای مصرفی خانه',sub:['خرید روزانه','مواد غذایی','سوپرمارکت آنلاین']},
 home:{title:'خانه، آشپزخانه و ساختمان',icon:'🏠',subtitle:'وسایل خانه، آشپزخانه و نیازهای ساختمان',sub:['آشپزخانه و خانه','ابزار و ساختمان','لوازم کاربردی']},
 sports:{title:'ورزش و تجهیزات ورزشی',icon:'⚽',subtitle:'برای تمرین، ورزش و تجهیزات مورد نیازت',sub:['پوشاک ورزشی','تجهیزات تمرین','لوازم ورزشی']},
 kids:{title:'کودک و نوزاد',icon:'🧸',subtitle:'محصولات کودک، نوزاد و نیازهای خانواده',sub:['نوزاد و سیسمونی','بازی و سرگرمی','نیازهای والدین']},
 books:{title:'کتاب و محصولات فرهنگی',icon:'📚',subtitle:'کتاب چاپی و دیجیتال و محتوای خواندنی',sub:['کتاب چاپی','کتاب الکترونیکی','کتاب صوتی']},
 auto:{title:'خودرو و قطعات یدکی',icon:'🚗',subtitle:'قطعات، لوازم و ابزارهای مرتبط با خودرو',sub:['قطعات یدکی','لوازم خودرو','خرید و فروش خودرو']},
 auto_service:{title:'خدمات خودرو',icon:'🔧',subtitle:'برای خدمات، کارشناسی و رسیدگی به خودرو',sub:['کارشناسی خودرو','خدمات و نگهداری','خدمات آنلاین']},
 travel_ticket:{title:'بلیط و حمل‌ونقل',icon:'🎫',subtitle:'مقایسه و تهیهٔ بلیط سفر',sub:['بلیط هواپیما','بلیط قطار','بلیط و تور']},
 lodging:{title:'اقامت و هتل',icon:'🛏️',subtitle:'برای برنامه‌ریزی اقامت و پیدا کردن محل مناسب سفر',sub:['رزرو اقامتگاه','هتل','سفر و اقامت']},
 education:{title:'آموزش و یادگیری',icon:'🎓',subtitle:'یادگیری مهارت‌های تازه و دوره‌های آنلاین',sub:['برنامه‌نویسی','مهارت شغلی','دوره‌های آموزشی']},
 affiliate_network:{title:'شبکه‌های همکاری در فروش',icon:'🤝',subtitle:'ابزارها و خدمات مرتبط با همکاری در فروش',sub:['شبکه افیلیت','بازاریابی دیجیتال']}
};
var DOMAIN_ORDER=Object.keys(DOMAIN_META);
var FEATURED={
 digital:[['digikala','انتخاب‌های متنوع در یک مقصد'],['torob','برای مقایسهٔ قیمت پیش از خرید'],['technolife','تمرکز بر کالاهای دیجیتال و فناوری'],['digiland','برای بررسی گزینه‌های موبایل و دیجیتال'],['kalatik','گزینه‌ای برای جست‌وجوی کالای دیجیتال'],['emalls','برای شروع مقایسهٔ فروشندگان']],
 accessories:[['janebi','برای لوازم جانبی و تجهیزات دیجیتال'],['digido','برای بررسی لوازم جانبی موبایل'],['gooshishop','برای محصولات موبایل و جانبی']],
 furniture:[['iranmiz','تمرکز بر میز و مبلمان'],['partochoob','برای بررسی محصولات چوبی و مبلمان'],['mobliran','گزینه‌ای برای جست‌وجوی مبلمان'],['moblmarket','برای مقایسهٔ مدل‌های مبلمان']],
 fashion:[['digistyle','برای گشت‌وگذار در پوشاک و استایل'],['banimode','انتخاب پوشاک و سبک زندگی'],['modiseh','برای جست‌وجوی پوشاک و محصولات متنوع'],['shixon','برای بررسی انتخاب‌های مد و پوشاک']],
 beauty:[['khanoumi','برای مراقبت پوست، مو و زیبایی'],['rojashop','برای جست‌وجوی آرایش و عطر'],['mootanroo','برای محصولات زیبایی و مراقبت'],['safirstore','برای بررسی محصولات آرایشی و عطر']],
 health:[['mosbatesabz','برای محصولات سلامت و مکمل'],['darukade','تمرکز بر محصولات داروخانه‌ای'],['darmankala','برای کالاهای مرتبط با سلامت']],
 medicine:[['darukade','برای جست‌وجوی محصولات داروخانه‌ای'],['daru24','برای بررسی محصولات دارویی'],['darmankala','برای کالاهای سلامت و تجهیزات']],
 supermarket:[['okala','برای خرید آنلاین کالاهای روزمره'],['ofoghkoroosh','برای بررسی محصولات مصرفی'],['shahrvand','برای خرید اقلام روزانه'],['hyperme','گزینه‌ای برای خرید سوپرمارکتی']],
 home:[['digikala','برای بررسی طیف متنوعی از وسایل خانه'],['homeplus','برای کالاهای خانه و کاربرد روزمره'],['sakhtemoononline','برای نیازهای مرتبط با ساختمان'],['khaneyeiran','برای بررسی محصولات خانه']],
 sports:[['sportland','برای پوشاک و لوازم ورزشی'],['iransport','برای جست‌وجوی کالاهای ورزشی'],['sporttime','برای تجهیزات و پوشاک ورزشی']],
 kids:[['ninimarket','برای نیازهای کودک و نوزاد'],['babyland','برای محصولات کودک'],['digikala','برای مقایسهٔ محصولات متنوع کودک']],
 books:[['fidibo','برای کتاب الکترونیکی و صوتی'],['taaghche','برای کتاب‌خوانی دیجیتال'],['book30','برای جست‌وجوی کتاب چاپی']],
 auto:[['yadakmarket','برای جست‌وجوی قطعات یدکی'],['yadakyar','برای نیازهای قطعات خودرو'],['partsaz','برای بررسی قطعات و لوازم'],['bama','برای بررسی آگهی‌های خودرو']],
 auto_service:[['hamrahmechanic','برای خدمات و کارشناسی خودرو'],['khodro45','برای خدمات خرید و فروش خودرو'],['aytol','برای بررسی خدمات آنلاین خودرو']],
 travel_ticket:[['alibaba','برای برنامه‌ریزی و خرید بلیط سفر'],['mrbilit','برای جست‌وجوی بلیط سفر'],['raja','برای سفر ریلی'],['safarmarket','برای بررسی گزینه‌های سفر']],
 lodging:[['eghamat24','برای پیدا کردن محل اقامت'],['jobama','برای جست‌وجوی اقامتگاه'],['hotelban','برای بررسی گزینه‌های اقامت'],['trip','برای برنامه‌ریزی سفر و اقامت']],
 education:[['faradars','برای یادگیری مهارت‌های تخصصی'],['maktabkhooneh','برای دوره‌های آموزشی آنلاین'],['quera','برای یادگیری و تمرین برنامه‌نویسی'],['sabzlearn','برای آموزش مهارت‌های دیجیتال']],
 affiliate_network:[]
};
var state={type:'general',domain:'digital',query:'',queryActive:false,queryStoreIds:null,categoriesByStore:{},openCategories:{}};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function normalize(s){return String(s||'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').replace(/\s+/g,' ').trim();}
function getCatalog(){var kb=window.DigiYarStoreBusinessDomains;return kb&&kb.catalog?kb.catalog:{};}
function detectIntent(raw){
 if((/کیف\s*اداری/.test(raw))||(/کیف/.test(raw)&&/محل کار/.test(raw)))return 'office_bag';
 if(/تصفیه\s*هوا|دستگاه تصفیه هوا|پاکسازی هوا/.test(raw))return 'air_purifier';
 if(/مبل|روکش مبلمان/.test(raw)&&/تمیز|تمیزکردن|شستن|شستشو|نظافت|لکه|پاک کردن/.test(raw))return 'upholstery_cleaning';
 if(/گوشی|موبایل/.test(raw)&&/قاب|گلس|شارژر|کابل|پاوربانک|هندزفری|هدفون/.test(raw))return 'mobile_accessory';
 return 'general_product';
}
function wordTokens(text){
 return normalize(text).split(/[^\u0600-\u06FFa-z0-9]+/i).filter(function(t){return t.length>1;});
}
function resolveSearchContext(query){
 /* The product/category KB is the sole source of merchant eligibility.
    Intent rules prevent generic word overlap from masquerading as relevance. */
 var catalog=getCatalog(),raw=normalize(query),intent=detectIntent(raw);
 var stop='برای دنبال میخوام میخواهم می خوام مناسب نیاز دارم خرید خریدن بخرم یک یه و یا از با در به که هست است باشد هستم لطفا قیمت بودجه متوسط ارزان گران بهترین خوب محل کارم محل کار اتاق خواب اتاق'.split(' ');
 var tokens=wordTokens(raw).filter(function(t){return stop.indexOf(t)<0;});
 var out=[],seen={};
 if(!tokens.length)return {query:String(query||''),storeIds:[],categoriesByStore:{},source:'product-category-catalog',intent:intent};
 var fixedGeneral={
  office_bag:['digikala','snappshop','torob','basalam'],
  air_purifier:['digikala','snappshop','torob','basalam'],
  upholstery_cleaning:['digikala','snappshop','torob','basalam'],
  mobile_accessory:['digikala','snappshop','torob','basalam']
 };
 Object.keys(catalog).forEach(function(id){
  var key=String(id).toLowerCase(),store=catalog[id]||{},fields=[].concat(store.products||[],store.aliases||[],store.specialties||[],store.productFamilies||[],store.querySignals||[]);
  var hay=normalize(fields.join(' ')),fieldTokens=wordTokens(hay),domains=Array.isArray(store.domains)?store.domains:[];
  var excluded=(store.exclude||[]).some(function(term){var x=normalize(term);return x.length>1&&raw.indexOf(x)>=0;});
  var score=0,matchedPhrase=false;
  fields.forEach(function(field){var f=normalize(field);if(f.length>=3&&raw.indexOf(f)>=0){matchedPhrase=true;score=Math.max(score,10+Math.min(f.length,12));}});
  tokens.forEach(function(t){if(fieldTokens.indexOf(t)>=0)score+=t.length>=5?2:1;});
  if(intent==='office_bag'){
   var generalAllowed=(fixedGeneral.office_bag.indexOf(key)>=0)&&(/کیف/.test(hay)||/کیف/.test(raw));
   var specialistExact=store.storeType!=='general'&&fields.some(function(field){return /کیف\s*اداری|کیف کار|کیف دستی اداری/.test(normalize(field));});
   if(!generalAllowed&&!specialistExact)return;
   score=generalAllowed?10:25;
  }else if(intent==='air_purifier'){
   if((fixedGeneral.air_purifier.indexOf(key)<0)&&!(/تصفیه\s*هوا|تصفیه هوا/.test(hay)&&store.storeType!=='general'))return;
   if(['esam','takhfifan','memarket'].indexOf(key)>=0)return;
   score=matchedPhrase?25:12;
  }else if(intent==='upholstery_cleaning'){
   if(fixedGeneral.upholstery_cleaning.indexOf(key)<0)return;
   if(['esam','takhfifan','memarket'].indexOf(key)>=0)return;
   score=matchedPhrase?25:12;
  }else if(intent==='mobile_accessory'){
   if(store.hooshyarExcludeConcepts&&store.hooshyarExcludeConcepts.indexOf(intent)>=0)return;
   if(!matchedPhrase&&score<4)return;
   if(store.storeType!=='general'&&domains.indexOf('accessories')<0&&domains.indexOf('digital')<0)return;
  }else{
   var phraseInQuery=fields.some(function(field){var f=normalize(field);return f.length>=4&&raw.indexOf(f)>=0;});
   var strongToken=tokens.some(function(t){return t.length>=4&&fieldTokens.indexOf(t)>=0;});
   if(excluded||(!phraseInQuery&&!strongToken))return;
   if(store.hooshyarExcludeConcepts&&store.hooshyarExcludeConcepts.indexOf(intent)>=0)return;
   if(score<3&&!phraseInQuery)return;
  }
  if(excluded)return;
  var urlResolver=window.DigiYarStoreSearchUrl;
  if(!urlResolver||typeof urlResolver.resolve!=='function'||!urlResolver.resolve(key,raw))return;
  var categories=domains.map(function(d){return (DOMAIN_META[d]||{}).title||d;});
  if(!categories.length)categories=[store.storeType==='general'?'فروشگاه عمومی':'فروشگاه تخصصی'];
  if(!seen[key]){seen[key]=true;out.push({id:key,score:score,categories:Array.from(new Set(categories))});}
 });
 out.sort(function(a,b){return b.score-a.score||a.id.localeCompare(b.id);});
 var categoriesByStore={};out.forEach(function(x){categoriesByStore[x.id]=x.categories;});
 return {query:String(query||''),storeIds:out.map(function(x){return x.id;}),categoriesByStore:categoriesByStore,source:'product-category-catalog',intent:intent};
}
function isGeneral(id,s){return !!(s&&s.storeType==='general');}
function availableDomains(catalog){return DOMAIN_ORDER.filter(function(domain){return Object.keys(catalog).some(function(id){var s=catalog[id]||{};return !isGeneral(id,s)&&Array.isArray(s.domains)&&s.domains.indexOf(domain)>=0;});});}
function featuredFor(domain,catalog){
 var seen={},out=[],featured=FEATURED[domain]||[];
 function add(id,tagline){
  var s=catalog[id];if(!s||isGeneral(id,s)||seen[id]||!Array.isArray(s.domains)||s.domains.indexOf(domain)<0)return;
  seen[id]=true;out.push({id:id,name:s.name||id,homepage:s.homepage||'',tagline:tagline||((s.specialties||[]).slice(0,2).join('، '))||((s.products||[]).slice(0,3).join('، '))||'برای بررسی گزینه‌های مرتبط',domain:domain});
 }
 featured.forEach(function(entry){add(entry[0],entry[1]);});
 /* Featured entries are only a visual priority, never a whitelist.
    Append every remaining merchant in this domain from the canonical KB. */
 Object.keys(catalog).forEach(function(id){var s=catalog[id]||{};if((s.domains||[]).indexOf(domain)>=0)add(id,'');});
 return out;
}
function fallbackStores(domain,catalog){return Object.keys(catalog).filter(function(id){return !isGeneral(id,catalog[id])&&(catalog[id].domains||[]).indexOf(domain)>=0;}).slice(0,6).map(function(id){var s=catalog[id];return {id:id,name:s.name||id,homepage:s.homepage||'',tagline:(s.specialties||[]).slice(0,2).join('، ')||'برای بررسی گزینه‌های مرتبط'};});}
function render(){
 var root=document.getElementById('v7PopularDiscovery');if(!root)return;
 var catalog=getCatalog(),domains=availableDomains(catalog);
 if(!domains.length){root.innerHTML='<div class="popular-discovery-empty">فهرست فروشگاه‌ها هنوز آماده نیست.</div>';return;}
 if(domains.indexOf(state.domain)<0)state.domain=domains[0];
 var q=normalize(state.query),generalIds=Object.keys(catalog).filter(function(id){return isGeneral(id,catalog[id]);});
 function makeStore(id,domain){var c=catalog[id]||{};return {id:id,name:c.name||id,homepage:c.homepage||'',tagline:((c.specialties||[]).slice(0,2).join('، '))||((c.products||[]).slice(0,3).join('، '))||'برای بررسی گزینه‌های مرتبط',domain:domain||((c.domains||[])[0]||'')};}
 function matches(s){var c=catalog[s.id]||{};if(state.queryActive&&Array.isArray(state.queryStoreIds))return state.queryStoreIds.indexOf(String(s.id||'').toLowerCase())>=0;return !q||normalize([s.name,s.tagline,(c.products||[]).join(' '),(c.aliases||[]).join(' '),(c.specialties||[]).join(' '),(c.productFamilies||[]).join(' '),(c.querySignals||[]).join(' ')].join(' ')).indexOf(q)>=0;}
 var STORE_LOGOS_RAW={
 'اسنپ شاپ':'اسنپ شاپ.webp','ایسام':'ایسام.webp','ایسمینار':'ایسمینار.webp','ایمالز':'ایمالز.webp',
 'باسلام':'باسلام.webp','بانی مد':'بانی مد.webp','بروز کالا':'بروز کالا.webp','به روز کالا':'به روز کالا.webp',
 'تخفیفان':'تخفیفان.webp','ترب':'ترب.webp','تکنولایف':'تکنولایف.webp','جانبی':'جانبی.webp','جین وست':'جین وست.webp',
 'خانومی':'خانومی.webp','داروخانه آنلاین':'داروخانه آنلاین.webp','داروکده':'داروکده.webp','دایان شاپ':'دایان شاپ.webp',
 'درمان کالا':'درمان کالا.webp','دیجی دو':'دیجی دو.png','دیجی لند':'دیجی لند.webp','دیجی کالا':'دیجی کالا.webp',
 'دیوار':'دیوار.webp','سفر می':'سفر می.webp','سفری می':'سفر می.webp','سولو کالا':'سولو کالا.webp','سولوکالا':'سولو کالا.webp',
 'شاواز':'شاواز.webp','شب':'شب.webp','شیپور':'شیپور.webp','مثبت سبز':'مثبت سبز.webp','مدیسه':'مدیسه.webp',
 'مقداد آی تی':'مقداد آی تی.webp','موبایل آی آر':'موبایل آی آر.webp','موبایل‌آی‌آر':'موبایل آی آر.webp',
 'موبایل ۱۴۰':'موبایل ۱۴۰.webp','مکتب خونه':'مکتب خونه.webp','می مارکت':'می مارکت.webp',
 'نشاط رخ':'نشاط رخ.webp','پینکت':'پینکت.webp','کارنامه':'کارنامه.webp','کالا ۳۶۰':'کالا ۳۶۰.webp',
 'کالا۳۶۰':'کالا ۳۶۰.webp','کالاتیک':'کالاتیک.webp','گوشی شاپ':'گوشی شاپ.webp',
 '۱۹ کالا':'۱۹ کالا.webp','۱۹کالا':'۱۹ کالا.webp',
 'اسنپ‌شاپ':'اسنپ شاپ.webp','به‌روزکالا':'به روز کالا.webp','دیجی‌دو':'دیجی دو.png',
 'ایران ستکور':'ایران ستکور.webp','پرتو چوب':'پرتو چوب.webp','تیدا چوب':'تیدا چوب..webp',
 'چوبینه':'چوبینه.webp','چیدا هوم':'چیدا هوم.webp','مبل ایران':'مبل ایران.webp',
 'اسپرت لند':'اسپرت لند.webp','آیسو کالکشن':'آیسو کالکشن.webp','بانی استایل':'بانی استایل.webp',
 'دیجی استایل':'دیجی استایل.webp','شیکستون':'شیکستون..webp',
 'دیجی‌لند':'دیجی لند.webp','دیجی‌کالا':'دیجی کالا.webp','مقداد آی‌تی':'مقداد آی تی.webp',
 'مکتب‌خونه':'مکتب خونه.webp','می‌مارکت':'می مارکت.webp','گوشی‌شاپ':'گوشی شاپ.webp'
 };
 var STORE_LOGOS={};
 Object.keys(STORE_LOGOS_RAW).forEach(function(name){STORE_LOGOS[normalize(name)]=STORE_LOGOS_RAW[name];});
 var STORE_LOGOS_BY_ID={
  divar:'دیوار.webp',sheypoor:'شیپور.webp',mobileir:'موبایل آی آر.webp',mobile140:'موبایل ۱۴۰.webp',
  kala360:'کالا ۳۶۰.webp','19kala':'۱۹ کالا.webp',emalls:'ایمالز.webp',berozkala:'بروز کالا.webp',kalatik:'کالاتیک.webp',
  solokala:'سولو کالا.webp',safarme:'سفر می.webp',
  iranmiz:'ایران میز.webp',iransetkor:'ایران ستکور.webp',partochoob:'پرتو چوب.webp',tidawood:'تیدا چوب..webp',
  choobineh:'چوبینه.webp',chidahome:'چیدا هوم.webp',mobliran:'مبل ایران.webp',
  sportland:'اسپرت لند.webp',aysoocollection:'آیسو کالکشن.webp',banistyle:'بانی استایل.webp',
  digistyle:'دیجی استایل.webp',shixon:'شیکستون..webp'
 };
 function card(s,domainTitle){var c=catalog[s.id]||{},url=state.queryActive?(window.DigiYarStoreSearchUrl&&typeof window.DigiYarStoreSearchUrl.resolve==='function'?window.DigiYarStoreSearchUrl.resolve(s.id,state.query):''):(s.homepage||c.homepage||''),logo=STORE_LOGOS_BY_ID[String(s.id||'').toLowerCase()]||STORE_LOGOS[normalize(s.name)],initials=String(s.id||s.name||'ST').replace(/[^a-z0-9]/gi,'').slice(0,2).toUpperCase()||'ST',brand=logo?'<img class="popular-discovery-store-logo" src="assets/store-logos/'+esc(logo)+'" alt="'+esc(s.name||'لوگوی فروشگاه')+'" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="popular-discovery-store-monogram" hidden aria-hidden="true">'+esc(initials)+'</span>':'<span class="popular-discovery-store-monogram" aria-hidden="true">'+esc(initials)+'</span>',content=brand+'<span class="popular-discovery-store-name">'+esc(s.name)+'</span>';return url?'<a class="popular-discovery-store" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" aria-label="ورود به '+esc(s.name)+'">'+content+'</a>':'<span class="popular-discovery-store popular-discovery-store-unavailable" aria-label="'+esc(s.name)+'؛ نشانی در حال تکمیل">'+content+'</span>';}
 function accordion(key,title,icon,description,items){
  var open=!!state.openCategories[key],cards=items.map(function(s){return card(s,title);}).join('');
  if(q&&!items.length)return '';
  return '<section class="popular-discovery-accordion'+(open?' is-open':'')+'"'+(key==='search-results'?' data-search-results="true"':'')+'><button type="button" class="popular-discovery-accordion-trigger" data-accordion-key="'+esc(key)+'" aria-expanded="'+(open?'true':'false')+'" aria-controls="popularDiscoveryPanel-'+esc(key)+'">'+(icon?'<span class="popular-discovery-accordion-icon" aria-hidden="true">'+esc(icon)+'</span>':'')+'<span class="popular-discovery-accordion-title-wrap"><strong>'+esc(title)+'</strong>'+(key==='search-results'&&description?'<span class="popular-discovery-query-text">'+esc(description)+'</span>':(description?'<small>'+esc(description)+'</small>':''))+'</span></button><button type="button" class="popular-discovery-accordion-chevron" data-accordion-key="'+esc(key)+'" aria-label="'+(open?'بستن':'باز کردن')+' '+esc(title)+'" aria-expanded="'+(open?'true':'false')+'" aria-controls="popularDiscoveryPanel-'+esc(key)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="popular-discovery-accordion-panel" id="popularDiscoveryPanel-'+esc(key)+'"'+(open?'':' hidden')+'><div class="popular-discovery-store-grid">'+(cards||'<div class="popular-discovery-empty">فروشگاهی در این دسته پیدا نشد.</div>')+'</div></div></section>';
 }
 var general=generalIds.map(function(id){return makeStore(id,'');}).filter(matches);
 var html='';
 if(state.queryActive){
  var uniqueItems=[],seenSearchIds={};
  (state.queryStoreIds||[]).forEach(function(id){
   id=String(id||'').toLowerCase();if(!id||seenSearchIds[id]||!catalog[id])return;
   var searchUrl=window.DigiYarStoreSearchUrl&&typeof window.DigiYarStoreSearchUrl.resolve==='function'?window.DigiYarStoreSearchUrl.resolve(id,state.query):'';
   if(!searchUrl)return;
   seenSearchIds[id]=true;
   var store=catalog[id]||{},cats=state.categoriesByStore[id]||((store.domains||[]).map(function(d){return (DOMAIN_META[d]||{}).title||d;}));
   if(!cats.length)cats=[isGeneral(id,store)?'فروشگاه عمومی':'فروشگاه تخصصی'];
   uniqueItems.push({id:id,name:store.name||id,homepage:store.homepage||'',tagline:'دسته‌بندی: '+Array.from(new Set(cats)).join('، '),domain:(store.domains||[])[0]||''});
  });
  html=accordion('search-results','فروشگاه‌های مرتبط با جست‌وجوی هوش‌یار:', '',state.query,uniqueItems);
 }else if(state.type==='general'){
  html=accordion('general','فروشگاه‌های عمومی','🏬','بازارگاه‌ها و فروشگاه‌های چنددسته‌ای',general);
 }else{
  html=domains.map(function(domain){
   var meta=DOMAIN_META[domain]||{title:domain,icon:'🏬',subtitle:'فروشگاه‌های این حوزه'};
   var items=featuredFor(domain,catalog).filter(matches);
   return accordion(domain,meta.title,meta.icon,meta.subtitle,items);
  }).join('');
 }
 var typeTabs='<div class="popular-discovery-type-tabs" role="group" aria-label="نوع فروشگاه"><button type="button" data-store-type="general" aria-pressed="'+(state.type==='general'?'true':'false')+'">فروشگاه‌های عمومی</button><button type="button" data-store-type="specialist" aria-pressed="'+(state.type==='specialist'?'true':'false')+'">فروشگاه‌های تخصصی</button></div>';
 var tabsRoot=document.getElementById('v7PopularDiscoveryTabs');if(tabsRoot)tabsRoot.innerHTML=typeTabs;
 root.innerHTML='<div class="popular-discovery-accordion-list" aria-live="polite">'+(html||'<div class="popular-discovery-empty">برای این عبارت فروشگاهی در این دسته پیدا نشد.</div>')+'</div>';
 root.querySelectorAll('[data-accordion-key]').forEach(function(btn){btn.addEventListener('click',function(){var key=btn.getAttribute('data-accordion-key');state.openCategories[key]=!state.openCategories[key];render();});});
 (tabsRoot||root).querySelectorAll('[data-store-type]').forEach(function(btn){btn.addEventListener('click',function(){var next=btn.getAttribute('data-store-type');if(state.queryActive){state.query='';state.queryActive=false;state.queryStoreIds=null;state.categoriesByStore={};state.openCategories={};}var same=state.type===next;if(same){if(next==='general'){state.openCategories.general=!state.openCategories.general;}else{var anyOpen=domains.some(function(d){return !!state.openCategories[d];});domains.forEach(function(d){state.openCategories[d]=!anyOpen;});}}else{state.type=next;state.openCategories.general=false;domains.forEach(function(d){state.openCategories[d]=false;});}render();});});

}
function init(){
 var toggle=document.getElementById('popularDiscoveryToggle'),panel=document.getElementById('popularDiscoveryPanel');
 if(!toggle||!panel)return;
 toggle.setAttribute('aria-expanded','false');panel.hidden=true;
 var bottomToggle=document.getElementById('popularDiscoveryBottomToggle');
 if(bottomToggle)bottomToggle.addEventListener('click',function(){toggle.click();});
 toggle.addEventListener('click',function(){var open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));panel.hidden=!open;var bottom=document.getElementById('popularDiscoveryBottomToggle');if(bottom)bottom.setAttribute('aria-expanded',String(open));if(!panel.dataset.rendered){render();panel.dataset.rendered='true';}});
 window.addEventListener('digiyar:v7-hooshyar-cleared',function(){state.query='';state.queryActive=false;state.queryStoreIds=null;state.categoriesByStore={};state.openCategories={};state.type='general';render();var p=document.getElementById('popularDiscoveryPanel'),t=document.getElementById('popularDiscoveryToggle'),b=document.getElementById('popularDiscoveryBottomToggle');if(p)p.hidden=true;if(t)t.setAttribute('aria-expanded','false');if(b)b.setAttribute('aria-expanded','false');if(p)delete p.dataset.rendered;});
 window.DigiYarPopularStoreDiscovery={version:VERSION,render:render,resolveSearchContext:resolveSearchContext,setSearchContext:function(query){var resolved=resolveSearchContext(query);state.query=String(query||'').trim();state.queryActive=!!state.query;state.queryStoreIds=resolved.storeIds;state.categoriesByStore=resolved.categoriesByStore||{};state.openCategories={};if(state.queryActive){state.openCategories['search-results']=true;state.type='specialist';toggle.setAttribute('aria-expanded','true');panel.hidden=false;var bottom=document.getElementById('popularDiscoveryBottomToggle');if(bottom)bottom.setAttribute('aria-expanded','true');panel.dataset.rendered='true';}render();return {query:state.query,storeIds:state.queryStoreIds.slice(),categoriesByStore:resolved.categoriesByStore,source:resolved.source,intent:resolved.intent};},clearSearchContext:function(){state.query='';state.queryActive=false;state.queryStoreIds=null;state.categoriesByStore={};state.openCategories={};render();},open:function(){toggle.setAttribute('aria-expanded','true');panel.hidden=false;var bottom=document.getElementById('popularDiscoveryBottomToggle');if(bottom)bottom.setAttribute('aria-expanded','true');if(!panel.dataset.rendered){render();panel.dataset.rendered='true';}},close:function(){toggle.setAttribute('aria-expanded','false');panel.hidden=true;var bottom=document.getElementById('popularDiscoveryBottomToggle');if(bottom)bottom.setAttribute('aria-expanded','false');}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){init();render();});else{init();render();}
})();
