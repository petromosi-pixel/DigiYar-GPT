/* DigiYar — Popular Stores discovery module */
(function(){
'use strict';
var VERSION='7.0.0-popular-store-discovery.4';
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
var state={type:'general',domain:'digital',query:''};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function normalize(s){return String(s||'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').replace(/\s+/g,' ').trim();}
function getCatalog(){var kb=window.DigiYarStoreBusinessDomains;return kb&&kb.catalog?kb.catalog:{};}
function homepage(id,store){return (store&&store.homepage)||((window.DigiYarStoreBrowser&&window.DigiYarStoreBrowser.storesByDomain)?'':'')||'';}
function isGeneral(id,s){return (s&&s.storeType==='general')||['digikala','snappshop','torob','basalam','esam','memarket'].indexOf(String(id||'').toLowerCase())>=0;}
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
 var nav=domains.map(function(domain){var m=DOMAIN_META[domain]||{title:domain,icon:'🏬'};var count=Object.keys(catalog).filter(function(id){var s=catalog[id]||{};return !isGeneral(id,s)&&(s.domains||[]).indexOf(domain)>=0;}).length;return '<button type="button" class="popular-discovery-category" data-domain="'+esc(domain)+'" aria-pressed="'+(state.domain===domain?'true':'false')+'"><span class="popular-discovery-category-icon">'+esc(m.icon)+'</span><span>'+esc(m.title)+'</span><span class="popular-discovery-category-count">'+count+'</span></button>';}).join('');
 var meta=DOMAIN_META[state.domain]||{title:state.domain,icon:'🏬',subtitle:'فروشگاه‌های این حوزه',sub:[]};
 function makeStore(id,domain){var c=catalog[id]||{};return {id:id,name:c.name||id,homepage:c.homepage||'',tagline:((c.specialties||[]).slice(0,2).join('، '))||((c.products||[]).slice(0,3).join('، '))||'برای بررسی گزینه‌های مرتبط',domain:domain||((c.domains||[])[0]||'')};}
 var stores;
 if(q){stores=Object.keys(catalog).filter(function(id){var c=catalog[id]||{};return (state.type==='general')===isGeneral(id,c);}).map(function(id){var c=catalog[id]||{};return makeStore(id,(c.domains||[]).indexOf(state.domain)>=0?state.domain:((c.domains||[])[0]||''));}).filter(function(s){var c=catalog[s.id]||{};return normalize([s.name,s.tagline,(c.products||[]).join(' '),(c.aliases||[]).join(' '),(c.specialties||[]).join(' '),(c.productFamilies||[]).join(' '),(c.querySignals||[]).join(' ')].join(' ')).indexOf(q)>=0;});}
 else if(state.type==='general'){stores=generalIds.map(function(id){return makeStore(id,'');});}
 else{stores=featuredFor(state.domain,catalog);if(!stores.length)stores=fallbackStores(state.domain,catalog);}
 var cards=stores.map(function(s){var url=s.homepage||catalog[s.id].homepage||'',initials=String(s.name).replace(/[‌\s]/g,'').slice(0,2),storeDomain=DOMAIN_META[s.domain]||meta;return '<article class="popular-discovery-store"><div class="popular-discovery-store-top"><span class="popular-discovery-store-monogram" aria-hidden="true">'+esc(initials)+'</span><div><h4>'+esc(s.name)+'</h4><small>'+esc(state.type==='general'?'فروشگاه عمومی':(storeDomain.title||meta.title))+'</small></div></div><p>'+esc(s.tagline)+'</p>'+(url?'<a class="popular-discovery-store-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">ورود به فروشگاه <span aria-hidden="true">↗</span></a>':'<span class="popular-discovery-store-link">نشانی در حال تکمیل</span>')+'</article>';}).join('');
 var typeTabs='<div class="popular-discovery-type-tabs" role="group" aria-label="نوع فروشگاه"><button type="button" data-store-type="general" aria-pressed="'+(state.type==='general'?'true':'false')+'">فروشگاه‌های عمومی <span>'+generalIds.length+'</span></button><button type="button" data-store-type="specialist" aria-pressed="'+(state.type==='specialist'?'true':'false')+'">فروشگاه‌های تخصصی</button></div>';
 var categoryNav=state.type==='specialist'&&!q?'<nav class="popular-discovery-categories" aria-label="حوزه‌های تخصصی کاری">'+nav+'</nav>':'';
 var heading=state.type==='general'?'فروشگاه‌های عمومی':(meta.icon+' فروشگاه‌های تخصصی — '+meta.title);
 var subtitle=state.type==='general'?'بازارگاه‌ها و فروشگاه‌های چنددسته‌ای که در حوزه‌های مختلف فعالیت می‌کنند':(q?'جست‌وجو در دانش‌نامهٔ فروشگاه‌های تخصصی':meta.subtitle||'فروشگاه‌های تخصصی این حوزه');
 root.innerHTML='<div class="popular-discovery-intro"><strong>فروشگاه‌ها بر اساس نوع فعالیت</strong><span>عمومی و تخصصی؛ با امکان حضور یک فروشگاه در چند حوزه</span></div>'+typeTabs+'<input class="popular-discovery-search" type="search" id="popularDiscoverySearch" value="'+esc(state.query)+'" placeholder="نام فروشگاه یا محصول را جست‌وجو کن…" aria-label="جست‌وجو در فروشگاه‌ها"><div class="popular-discovery-layout">'+categoryNav+'<section class="popular-discovery-results" aria-live="polite"><header class="popular-discovery-domain-head"><div><h3>'+(q?'🔎 نتایج جست‌وجو در '+(state.type==='general'?'فروشگاه‌های عمومی':'فروشگاه‌های تخصصی'):esc(heading))+'</h3><p>'+esc(subtitle)+'</p></div></header>'+(state.type==='specialist'&&!q?'<div class="popular-discovery-subcats">'+(meta.sub||[]).map(function(s){return '<span class="popular-discovery-subcat">'+esc(s)+'</span>';}).join('')+'</div>':'')+'<div class="popular-discovery-store-grid">'+(cards||'<div class="popular-discovery-empty">برای این عبارت فروشگاهی در این دسته پیدا نشد. عبارت دیگری را امتحان کن.</div>')+'</div></section></div><p class="popular-discovery-footnote">دسته‌بندی‌ها بر پایهٔ دانش‌نامهٔ یکپارچهٔ دیجی‌یار ساخته می‌شوند. فروشگاه‌های عمومی در یک بخش و فروشگاه‌های تخصصی زیر عنوان حوزهٔ کاری مرتبط نمایش داده می‌شوند؛ یک فروشگاه تخصصی می‌تواند در چند حوزه تکرار شود.</p>';
 root.querySelectorAll('[data-domain]').forEach(function(btn){btn.addEventListener('click',function(){state.domain=btn.getAttribute('data-domain');render();});});
 root.querySelectorAll('[data-store-type]').forEach(function(btn){btn.addEventListener('click',function(){state.type=btn.getAttribute('data-store-type');render();});});
 var search=root.querySelector('#popularDiscoverySearch');if(search){search.addEventListener('input',function(){var pos=search.selectionStart;state.query=search.value;render();var next=root.querySelector('#popularDiscoverySearch');if(next){next.focus();try{next.setSelectionRange(pos,pos);}catch(e){}}});}
}
function init(){
 var toggle=document.getElementById('popularDiscoveryToggle'),panel=document.getElementById('popularDiscoveryPanel');
 if(!toggle||!panel)return;
 toggle.setAttribute('aria-expanded','false');panel.hidden=true;
 toggle.addEventListener('click',function(){var open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));panel.hidden=!open;if(open&&!panel.dataset.rendered){render();panel.dataset.rendered='true';}});
 window.DigiYarPopularStoreDiscovery={version:VERSION,render:render,open:function(){toggle.setAttribute('aria-expanded','true');panel.hidden=false;if(!panel.dataset.rendered){render();panel.dataset.rendered='true';}},close:function(){toggle.setAttribute('aria-expanded','false');panel.hidden=true;}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
