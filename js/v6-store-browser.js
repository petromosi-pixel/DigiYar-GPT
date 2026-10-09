/* DigiYar V6 — Hooshyar simulated store browser */
(function(){
'use strict';
const VERSION='7.0.0-store-browser.68';
function storeQueryTerms(q){return String(q||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').replace(/ضد\s*آفتاب|ضدآفتاب/g,'ضد آفتاب').replace(/مرطوب\s*[-‌]?\s*کننده/g,'مرطوب کننده').replace(/آب\s*رسان/g,'آبرسان').replace(/\s+/g,' ').trim();}
function khanoumiSearchUrl(q){
 var s=storeQueryTerms(q);
 if(/ضد\s*آفتاب|ضدآفتاب/i.test(s))return 'https://www.khanoumi.com/categories/skincare/face-care/sun-block-sun-protecter';
 if(/(?:مرطوب\s*کننده|آبرسان)/i.test(s))return 'https://www.khanoumi.com/categories/skincare/face-care/moisturizer';
 if(/(?:شوینده|پاک\s*کننده|میسلار|تونر)/i.test(s))return 'https://www.khanoumi.com/categories/skincare/face-care/cleanser';
 if(/(?:سرم|روغن)\s*(?:صورت|پوست)?/i.test(s))return 'https://www.khanoumi.com/categories/skincare/face-care/serum';
 if(/(?:شامپو|نرم\s*کننده|ماسک\s*مو|سرم\s*مو)/i.test(s))return 'https://www.khanoumi.com/categories/hair-care';
 return 'https://www.khanoumi.com/';
}
function siteSearchUrl(domain,q){
 var s=storeQueryTerms(q);
 return 'https://www.google.com/search?q='+encodeURIComponent('site:'+domain+' '+s);
}
function healthSearchQuery(q){
 var s=storeQueryTerms(q);
 /* Preserve combined skincare intent instead of dropping all but the first matched term. */
 if(/مرطوب\s*کننده/i.test(s)&&/ضد\s*آفتاب/i.test(s))return 'کرم مرطوب کننده ضد آفتاب';
 var patterns=[/ضد\s*آفتاب/i,/مرطوب\s*کننده|آبرسان/i,/شوینده|پاک\s*کننده|میسلار|تونر/i,/سرم/i,/کرم/i,/شامپو/i];
 for(var i=0;i<patterns.length;i++){var m=s.match(patterns[i]);if(m)return m[0].replace(/\s+/g,' ');}
 return s.split(/\s+/).slice(0,4).join(' ');
}
function genericMerchantSearchUrl(id,q){
 var catalog=window.DigiYarStoreBusinessDomains&&window.DigiYarStoreBusinessDomains.catalog||{};
 var item=catalog[String(id||'').toLowerCase()]||{};
 var home=HOME[String(id||'').toLowerCase()]||item.homepage||'';
 var host='';
 try{if(home)host=new URL(home).hostname.replace(/^www\\./i,'');}catch(e){}
 var term=String(q||'').trim();
 if(host)return 'https://www.google.com/search?q='+encodeURIComponent('site:'+host+' '+term);
 var name=STORE_NAMES[String(id||'').toLowerCase()]||item.name||id;
 return 'https://www.google.com/search?q='+encodeURIComponent(String(name)+' '+term);
}
function storeSearchUrl(id,q){
 var key=String(id||'').toLowerCase();
 window.__DigiYarCurrentStoreSearchId=key;
 var s=storeSearchQuery(q);
 var hs=s;
 if(key==='khanoumi')return khanoumiSearchUrl(s);
 if(key==='janebi'&&/کیف/i.test(s))return 'https://janebi.com/search?q='+encodeURIComponent('کیف اداری');
 if(key==='janebi')return 'https://janebi.com/search?q='+encodeURIComponent(s);
 if(key==='basalam')return 'https://basalam.com/search?q='+encodeURIComponent(s);
 if(key==='modiseh'&&/کیف/i.test(s))return 'https://www.modiseh.com/catalogsearch/result/?q='+encodeURIComponent('کیف اداری');
 if(key==='dayan')return 'https://dayanshop.com/search?q='+encodeURIComponent(s);
 if(key==='memarket')return 'https://memarket24.ir/search/'+encodeURIComponent(s.replace(/\s+/g,'-'));
 if(key==='darmankala')return 'https://www.darmankala.com/catalogsearch/result/?q='+encodeURIComponent(hs);
 if(key==='mosbatesabz')return 'https://mosbatesabz.com/?s='+encodeURIComponent(hs);
 if(key==='darukade')return 'https://darukade.com/products?w='+encodeURIComponent(hs);
 if(key==='meghdadit')return siteSearchUrl('meghdadit.com',s);
 if(key==='neshatrokh')return 'https://www.neshatrokh.com/?s='+encodeURIComponent(hs);
 if(key==='solokala')return 'https://solokala.com/?s='+encodeURIComponent(hs);
 if(key==='daroo-online')return 'https://daroo-online.com/?s='+encodeURIComponent(hs);
 if(SEARCH[key])return SEARCH[key](s);
 return genericMerchantSearchUrl(key,s);
}
function basalamSearchQuery(q){
 var s=storeSearchQuery(q);
 var plan=window.DigiYarShoppingPlan;
 var ai=plan&&plan.ai&&Array.isArray(plan.ai.productTerms)?plan.ai.productTerms:[];
 var required=plan&&plan.ai&&Array.isArray(plan.ai.requiredNameTerms)?plan.ai.requiredNameTerms:[];
 var candidates=required.concat(ai).map(function(x){return String(x||'').trim();}).filter(Boolean);
 /* باسلام با عبارت‌های کوتاه و هویت‌محور بهتر نتیجه می‌دهد؛
    جملهٔ طبیعی هوش‌یار و قیدهای کاربردی را مستقیماً به موتور آن نفرست. */
 var preferred=[/تصفیه\s*هوا/i,/رطوبت\s*ساز/i,/جارو\s*برقی/i,/بخارشوی/i,/ماشین\s*لباسشویی/i,/یخچال/i,/پنکه/i,/کولر/i,/تلویزیون/i,/لپ.?تاپ/i,/موبایل|گوشی/i,/شارژر/i,/پاوربانک/i,/هندزفری|هدفون/i,/کابل/i];
 for(var i=0;i<preferred.length;i++){
   var m=s.match(preferred[i]);
   if(m)return m[0].replace(/\\s+/g,' ').trim();
 }
 for(var j=0;j<candidates.length;j++){
   var t=candidates[j].replace(/^(?:دستگاه|یک|یه|یک\s+عدد)\s+/i,'').trim();
   if(t.length>=3)return t;
 }
 return s.split(/\\s+/).filter(function(x){return x.length>=2;}).slice(0,4).join(' ');
}
function janebiSearchQuery(q){
 var s=storeQueryTerms(q);
 var patterns=[/ضد\s*آفتاب|ضدآفتاب/i,/مرطوب\s*کننده|آبرسان/i,/هندزفری|ایرباد|هدفون/i,/پاوربانک/i,/شارژر/i,/کابل(?:\s+شارژ)?/i,/قاب|کاور|گلس|محافظ\s*صفحه/i,/هولدر/i,/ساعت\s*هوشمند/i,/اسپیکر/i,/دستگاه\s*بخور|رطوبت\s*ساز/i,/جارو\s*شارژی/i,/چراغ\s*خواب/i,/ماساژور/i,/کوله|کیف/i,/چمدان/i];
 for(var i=0;i<patterns.length;i++){var m=s.match(patterns[i]);if(m)return m[0];}
 return s.split(/\s+/).slice(0,4).join(' ');
}

const SEARCH={iranmiz:q=>'https://www.iranmiz.com/category/%D9%85%DB%8C%D8%B2-%D9%86%D8%A7%D9%87%D8%A7%D8%B1%D8%AE%D9%88%D8%B1%DB%8C',partochoob:q=>'https://partochoob.com/shop/',chidahome:q=>'https://chidahomestudio.com/shop',tidawood:q=>'https://tidawood.com/',
 torob:q=>'https://torob.com/search/?query='+encodeURIComponent(q),basalam:q=>'https://basalam.com/search?q='+encodeURIComponent(q),esam:q=>'https://esam.ir/search/?kw='+encodeURIComponent(q), digikala:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(q),snappshop:q=>'https://snappshop.ir/search?query='+encodeURIComponent(q),technolife:q=>'https://www.technolife.com/product/list/search?keywords='+encodeURIComponent(q),digiland:q=>'https://dgland.com/search?q='+encodeURIComponent(q),takhfifan:q=>'https://takhfifan.com/search?q='+encodeURIComponent(q),meghdadit:q=>'https://meghdadit.com/',digido:q=>'https://www.digido.ir/search?s='+encodeURIComponent(q),gooshishop:q=>'https://gooshishop.com/search?q='+encodeURIComponent(q),berozkala:q=>'https://berozkala.com/search?q='+encodeURIComponent(q),janebi:q=>'https://janebi.com/search?q='+encodeURIComponent(q),khanoumi:q=>khanoumiSearchUrl(q),banimode:q=>'https://www.banimode.com/search?q='+encodeURIComponent(q),modiseh:q=>'https://www.modiseh.com/search?q='+encodeURIComponent(q),pinket:q=>'https://pinket.com/search?q='+encodeURIComponent(q),solokala:q=>'https://solokala.com/search?q='+encodeURIComponent(q),neshatrokh:q=>'https://www.neshatrokh.com/',dayan:q=>'https://dayanshop.com/search?q='+encodeURIComponent(q),memarket:q=>'https://memarket24.ir/search/'+encodeURIComponent(q.replace(/\s+/g,'-')),darukade:q=>'https://www.darukade.com/search?search='+encodeURIComponent(q),darmankala:q=>'https://darmankala.com/?s='+encodeURIComponent(q),mosbatesabz:q=>'https://mosbatesabz.com/?s='+encodeURIComponent(q),'daroo-online':q=>'https://DarookhaneOnline.com/',shavaz:q=>siteSearchUrl('shavaz.ir',q),jeanswest:q=>siteSearchUrl('jeanswest.ir',q),sabzgostar:q=>siteSearchUrl('sabzgostar.info',q),shab:q=>'https://www.shab.ir/',safarme:q=>'https://www.safarme.ir/',eseminar:q=>'https://eseminar.tv/',maktabkhooneh:q=>'https://maktabkhooneh.org/',karnameh:q=>'https://karnameh.com/',
iransetkor:q=>HOME["iransetkor"],
'19kala':q=>HOME["19kala"],
banistyle:q=>HOME["banistyle"],
aysoocollection:q=>HOME["aysoocollection"],
daru24:q=>HOME["daru24"],
betadent:q=>HOME["betadent"],
darupedia:q=>HOME["darupedia"],
darucenter:q=>HOME["darucenter"],
webdaru:q=>HOME["webdaru"],
saba:q=>HOME["saba"],
darupost:q=>HOME["darupost"],
shider:q=>HOME["shider"],
alibaba:q=>HOME["alibaba"],
jobama:q=>HOME["jobama"],
flytoday:q=>HOME["flytoday"],
raja:q=>HOME["raja"],
ghasedak24:q=>HOME["ghasedak24"],
siroom:q=>HOME["siroom"],
roomit:q=>HOME["roomit"],
classino:q=>HOME["classino"],
alocom:q=>HOME["alocom"],
skyroom:q=>HOME["skyroom"],
faradars:q=>HOME["faradars"],
faranesh:q=>HOME["faranesh"],
toplearn:q=>HOME["toplearn"],
daneshjooyar:q=>HOME["daneshjooyar"],
divar:q=>HOME["divar"],
hamrahmechanic:q=>HOME["hamrahmechanic"],
khodro45:q=>HOME["khodro45"],
bama:q=>HOME["bama"],
aytol:q=>HOME["aytol"],
emalls:q=>HOME['emalls'],
kalatik:q=>HOME['kalatik'],
mobile140:q=>HOME['mobile140'],
mobileir:q=>HOME['mobileir'],
kala360:q=>HOME['kala360'],
mobliran:q=>HOME['mobliran'],
choobineh:q=>HOME['choobineh'],
moblmarket:q=>HOME['moblmarket'],
digistyle:q=>HOME['digistyle'],
shixon:q=>HOME['shixon'],
limoo:q=>HOME['limoo'],
mootanroo:q=>HOME['mootanroo'],
zibamoon:q=>HOME['zibamoon'],
rojashop:q=>HOME['rojashop'],
safirstore:q=>HOME['safirstore'],
okala:q=>HOME['okala'],
ofoghkoroosh:q=>HOME['ofoghkoroosh'],
janbo:q=>HOME['janbo'],
shahrvand:q=>HOME['shahrvand'],
hyperme:q=>HOME['hyperme'],
ofood:q=>HOME['ofood'],
homeplus:q=>HOME['homeplus'],
sakhtemoononline:q=>HOME['sakhtemoononline'],
khaneyeiran:q=>HOME['khaneyeiran'],
sportland:q=>HOME['sportland'],
iransport:q=>HOME['iransport'],
sporttime:q=>HOME['sporttime'],
ninimarket:q=>HOME['ninimarket'],
ninisite:q=>HOME['ninisite'],
babyland:q=>HOME['babyland'],
fidibo:q=>HOME['fidibo'],
taaghche:q=>HOME['taaghche'],
book30:q=>HOME['book30'],
yadakmarket:q=>HOME['yadakmarket'],
yadakyar:q=>HOME['yadakyar'],
partsaz:q=>HOME['partsaz'],
sheypoor:q=>HOME['sheypoor'],
mrbilit:q=>HOME['mrbilit'],
trip:q=>HOME['trip'],
flysepehran:q=>HOME['flysepehran'],
eghamat24:q=>HOME['eghamat24'],
hotelban:q=>HOME['hotelban'],
safarmarket:q=>HOME['safarmarket'],
quera:q=>HOME['quera'],
roocket:q=>HOME['roocket'],
sabzlearn:q=>HOME['sabzlearn'],
hamyarit:q=>HOME['hamyarit'],
learnfile:q=>HOME['learnfile'],
azki:q=>HOME['azki'],
bimebazar:q=>HOME['bimebazar'],
bimeh:q=>HOME['bimeh'],
kilid:q=>HOME['kilid']
};
const STORE_NAMES={iranmiz:'ایران میز',partochoob:'پرتوچوب',chidahome:'چیدا هوم',tidawood:'تیدا چوب',digikala:'دیجی‌کالا',snappshop:'اسنپ‌شاپ',torob:'ترب',basalam:'باسلام',esam:'ایسام',technolife:'تکنولایف',digiland:'دیجی‌لند',takhfifan:'تخفیفان',meghdadit:'مقداد آی‌تی',digido:'دیجی‌دو',gooshishop:'گوشی‌شاپ',berozkala:'بروزکالا',janebi:'جانبی',khanoumi:'خانومی',banimode:'بانی‌مد',modiseh:'مدیسه',pinket:'پینکت',solokala:'سولوکالا',neshatrokh:'نشاط رخ',dayan:'دایان',memarket:'می‌مارکت',darukade:'داروکده',darmankala:'درمان‌کالا',mosbatesabz:'مثبت سبز','daroo-online':'داروخانه آنلاین',shavaz:'شاواز',jeanswest:'جین وست',sabzgostar:'سبز گستر',shab:'شب',safarme:'سفرمی',eseminar:'ایسمینار',maktabkhooneh:'مکتب‌خونه',karnameh:'کارنامه',iransetkor:'ایران ستکور','19kala':'۱۹کالا',banistyle:'بانی استایل',aysoocollection:'آیسو کالکشن',daru24:'دارو۲۴',betadent:'بتادنت',darupedia:'داروپدیا',darucenter:'داروسنتر',webdaru:'وب‌دارو',saba:'داروخانه صبا',darupost:'داروپست',shider:'شیدر',alibaba:'علی‌بابا',jobama:'جاباما',flytoday:'فلای‌تودی',raja:'رجا',ghasedak24:'قاصدک ۲۴',siroom:'سی‌روم',roomit:'رومیت',classino:'کلاسینو',alocom:'الوکام',skyroom:'اسکای‌روم',faradars:'فرادرس',faranesh:'فرانش',toplearn:'تاپ‌لرن',daneshjooyar:'دانشجویار',divar:'دیوار',hamrahmechanic:'همراه مکانیک',khodro45:'خودرو۴۵',bama:'باما',aytol:'آیتول',emalls:'ایمالز',kalatik:'کالاتیک',mobile140:'موبایل ۱۴۰',mobileir:'موبایل‌آی‌آر',kala360:'کالا۳۶۰',mobliran:'مبل ایران',choobineh:'چوبینه',moblmarket:'مبل مارکت',digistyle:'دیجی‌استایل',shixon:'شیکسون',limoo:'لیمو',mootanroo:'مو تن رو',zibamoon:'زیبامون',rojashop:'روژا شاپ',safirstore:'سفیر',okala:'اکالا',ofoghkoroosh:'افق کوروش',janbo:'جانبو',shahrvand:'شهروند',hyperme:'هایپرمی',ofood:'اوفود',homeplus:'هوم‌پلاس',sakhtemoononline:'ساختمان آنلاین',khaneyeiran:'خانه ایرانی',sportland:'اسپرت‌لند',iransport:'ایران اسپرت',sporttime:'اسپرت تایم',ninimarket:'نی‌نی مارکت',ninisite:'نی‌نی سایت',babyland:'بیبی‌لند',fidibo:'فیدیبو',taaghche:'طاقچه',book30:'۳۰بوک',yadakmarket:'یدک مارکت',yadakyar:'یدک‌یار',partsaz:'پارت‌ساز',sheypoor:'شیپور',mrbilit:'مستر بلیط',trip:'تریپ',flysepehran:'فلای سپهران',eghamat24:'اقامت ۲۴',hotelban:'هتل‌بان',safarmarket:'سفرمارکت',quera:'کوئرا',roocket:'راکت',sabzlearn:'سبزلرن',hamyarit:'همیار آی‌تی',learnfile:'لرن‌فایل',azki:'ازکی',bimebazar:'بیمه‌بازار',bimeh:'بیمه',kilid:'کلید'};
const HOME={digikala:'https://www.digikala.com/',snappshop:'https://snapp.shop/',torob:'https://torob.com/',basalam:'https://basalam.com/',technolife:'https://www.technolife.com/',digido:'https://www.digido.ir/',gooshishop:'https://gooshishop.com/',berozkala:'https://berozkala.com/',janebi:'https://janebi.com/',khanoumi:'https://www.khanoumi.com/',banimode:'https://www.banimode.com/',modiseh:'https://www.modiseh.com/',esam:'https://esam.ir/',pinket:'https://pinket.com/',solokala:'https://solokala.com/',iranmiz:'https://www.iranmiz.com/',partochoob:'https://partochoob.com/',chidahome:'https://chidahomestudio.com/',tidawood:'https://tidawood.com/',darukade:'https://www.darukade.com/',darmankala:'https://darmankala.com/',digiland:'https://dgland.com/',takhfifan:'https://takhfifan.com/',meghdadit:'https://meghdadit.com/',neshatrokh:'https://www.neshatrokh.com/',mosbatesabz:'https://mosbatesabz.com/',shavaz:'https://shavaz.ir/','daroo-online':'https://darookhaneonline.com/',dayan:'https://dayanshop.com/',memarket:'https://memarket24.ir/',jeanswest:'https://jeanswest.ir/',sabzgostar:'https://sabzgostar.info/',shab:'https://www.shab.ir/',safarme:'https://www.safarme.ir/',eseminar:'https://eseminar.tv/',maktabkhooneh:'https://maktabkhooneh.org/',karnameh:'https://karnameh.com/',iransetkor:'https://iransetkor.com/','19kala':'https://www.19kala.com/',banistyle:'https://banistyle.com/',aysoocollection:'https://aysoocollection.com/',daru24:'https://daru24.com/',betadent:'https://betadent.com/',darupedia:'https://darupedia.com/',darucenter:'https://darucenter.com/',webdaru:'https://webdaru.com/',saba:'https://sabadaru.com/',darupost:'https://darupost.com/',shider:'https://shider.com/',alibaba:'https://www.alibaba.ir/',jobama:'https://www.jabama.com/',flytoday:'https://www.flytoday.ir/',raja:'https://www.raja.ir/',ghasedak24:'https://ghasedak24.com/',siroom:'https://siroom.ir/',roomit:'https://roomit.ir/',classino:'https://classino.com/',alocom:'https://alocom.co/',skyroom:'https://www.skyroom.online/',faradars:'https://faradars.org/',faranesh:'https://faranesh.com/',toplearn:'https://toplearn.com/',daneshjooyar:'https://daneshjooyar.com/',divar:'https://divar.ir/',hamrahmechanic:'https://www.hamrah-mechanic.com/',khodro45:'https://khodro45.com/',bama:'https://bama.ir/',aytol:'https://aytol.com/',emalls:'https://emalls.ir/',kalatik:'https://kalatik.com/',mobile140:'https://mobile140.com/',mobileir:'https://mobile.ir/',kala360:'https://kala360.com/',mobliran:'https://mobliran.com/',choobineh:'https://choobineh.com/',moblmarket:'https://moblmarket.com/',digistyle:'https://www.digistyle.com/',shixon:'https://shixon.com/',limoo:'https://limoo.com/',mootanroo:'https://mootanroo.com/',zibamoon:'https://zibamoon.com/',rojashop:'https://rojashop.com/',safirstore:'https://safirstore.com/',okala:'https://okala.com/',ofoghkoroosh:'https://www.okcs.com/',janbo:'https://janbo.ir/',shahrvand:'https://shahrvand.ir/',hyperme:'https://hyperme.com/',ofood:'https://ofood.ir/',homeplus:'https://homeplus.ir/',sakhtemoononline:'https://sakhtemoononline.com/',khaneyeiran:'https://khaneyeiran.com/',sportland:'https://sportland.ir/',iransport:'https://iransport.com/',sporttime:'https://sporttime.ir/',ninimarket:'https://ninimarket.com/',ninisite:'https://www.ninisite.com/',babyland:'https://babyland.ir/',fidibo:'https://fidibo.com/',taaghche:'https://taaghche.com/',book30:'https://www.30book.com/',yadakmarket:'https://yadakmarket.com/',yadakyar:'https://yadakyar.com/',partsaz:'https://partsaz.com/',sheypoor:'https://www.sheypoor.com/',mrbilit:'https://mrbilit.com/',trip:'https://www.trip.ir/',flysepehran:'https://flysepehran.com/',eghamat24:'https://www.eghamat24.com/',hotelban:'https://hotelban.com/',safarmarket:'https://safarmarket.com/',quera:'https://quera.org/',roocket:'https://roocket.ir/',sabzlearn:'https://sabzlearn.ir/',hamyarit:'https://hamyarit.com/',learnfile:'https://learnfile.ir/',azki:'https://www.azki.com/',bimebazar:'https://bimebazar.com/',bimeh:'https://bimeh.com/',kilid:'https://kilid.com/'};
const CATEGORY={
 dayan:{jacket:'https://dayanshop.com/products/men-warm-jacket',knitwear:'https://dayanshop.com/products/men-knitwear',shirt:'https://dayanshop.com/products/men-shirts',tshirt:'https://dayanshop.com/products/men-tshirts',set:'https://dayanshop.com/products/men-sets',trousers:'https://dayanshop.com/products/men-trousers',hoodie:'https://dayanshop.com/products/men-sweatshirts-hoodies',sweatshirt:'https://dayanshop.com/products/men-blouse',tank:'https://dayanshop.com/products/men-tops',sport:'https://dayanshop.com/products/men-sports-shoes','ankle-boots':'https://dayanshop.com/products/men-boots',casual:'https://dayanshop.com/products/men-casual-shoes',formal:'https://dayanshop.com/products/men-formal-shoes',sandal:'https://dayanshop.com/products/men-sandals'},
 memarket:{clothes:'https://memarket24.ir/search/clothes',shirt:'https://memarket24.ir/search/shirt',knitwear:'https://memarket24.ir/search/knitwear',outfit:'https://memarket24.ir/search/outfit',couple:'https://memarket24.ir/search/couple',trousers:'https://memarket24.ir/search/trousers',tshirt:'https://memarket24.ir/search/tshirt',outwear:'https://memarket24.ir/search/outwear',coat:'https://memarket24.ir/search/coat',shoes:'https://memarket24.ir/search/shoes',boots:'https://memarket24.ir/search/boots','formal-shoes':'https://memarket24.ir/search/formal-shoes','sport-shoes':'https://memarket24.ir/search/sport-shoes','flat-shoes':'https://memarket24.ir/search/flat-shoes',college:'https://memarket24.ir/search/college',sandal:'https://memarket24.ir/search/sandal',bag:'https://memarket24.ir/search/bag',watch:'https://memarket24.ir/search/watch',jewelry:'https://memarket24.ir/search/jewelry',household:'https://memarket24.ir/search/household',digital:'https://memarket24.ir/search/digital',personal:'https://memarket24.ir/search/personal',adult:'https://memarket24.ir/search/adult',sale:'https://memarket24.ir/search/sale','one-size':'https://memarket24.ir/search/one-size'}
};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function affiliateUrl(storeId,url){
 const id=String(storeId||'').toLowerCase();
 const registry=window.DigiYarAffiliateUrls||{};
 const entry=registry[id];
 if(!entry||!entry.url)return url;
 if(entry.mode==='campaign')return url?entry.url+'?p='+encodeURIComponent(url):entry.url;
 return entry.url;
}
function storeSearchQuery(q){
 const plan=window.DigiYarShoppingPlan;
 const ai=plan&&plan.ai;
 const current=plan&&String(plan.query||'').trim()===String(q||'').trim();
 const id=window.__DigiYarCurrentStoreSearchId;
 /* Preserve Hooshyar's complete natural-language query for every store.
    Store-specific optimization belongs only in explicit adapters below. */
 if(current&&ai&&ai.searchQueries&&id&&typeof ai.searchQueries[id]==='string'&&ai.searchQueries[id].trim()) return ai.searchQueries[id].trim();
 return String(q||'').trim();
}
function stores(){
 const plan=window.DigiYarShoppingPlan;
 const aiIds=plan&&plan.ai&&Array.isArray(plan.ai.eligibleStoreIds)?plan.ai.eligibleStoreIds.map(function(x){return String(x||'').toLowerCase();}).filter(Boolean):[];
 if(aiIds.length){
   return aiIds.map(function(id){return {id:id,name:STORE_NAMES[id]||id};});
 }
 const a=window.DigiYarPopularAffiliateStores;
 if(Array.isArray(a)&&a.length)return a.filter(x=>x&&x.id&&x.name);
 const s=document.getElementById('storeSelect');
 return s?Array.from(s.options).filter(o=>o.value&&o.value!=='all').map(o=>({id:o.value,name:o.textContent.trim()})):[];
}
function style(){
 if(document.getElementById('v6-auto-store-style'))return;
 const s=document.createElement('style');s.id='v6-auto-store-style';s.textContent=`
.v6-auto-processing{text-align:right;direction:rtl;margin:0 0 4px;color:var(--v6-muted);font-size:12px;line-height:1.7}.v6-auto-processing-title{font-weight:800;font-size:13px;margin-bottom:3px;color:var(--v6-text);text-align:right}.v6-auto-processing-toggle{display:block;width:100%;padding:0;border:0;background:transparent;color:var(--v6-muted);font:inherit;font-weight:800;font-size:12px;line-height:1.7;text-align:right;direction:rtl;cursor:pointer}.v6-auto-processing-chevron{display:inline-block;font-size:17px;line-height:1;transition:transform .18s ease;margin-right:4px}.v6-auto-processing-toggle[aria-expanded="true"] .v6-auto-processing-chevron{transform:rotate(90deg)}.v6-auto-processing-details{display:none;margin:2px 0 0;padding:0 2px;text-align:right}.v6-auto-processing ul{display:block;margin:0;padding:0;list-style:none;text-align:right}.v6-auto-processing li{margin:2px 0;white-space:nowrap;font-size:13px;font-weight:400;opacity:.55;line-height:1.65}.v6-auto-processing-done{font-weight:800;font-size:13px;line-height:1.7;text-align:right;color:var(--v6-muted);opacity:.55}.v6-auto-store{margin-top:0!important}
.v6-auto-store{--v6-bg:#fff;--v6-surface:#f7f9fc;--v6-surface-2:#f3f5f8;--v6-text:#172033;--v6-muted:#596579;--v6-border:rgba(0,0,0,.12);--v6-border-soft:rgba(0,0,0,.08);--v6-accent:#2563eb;margin:0 0 12px;border:1px solid var(--v6-border);border-radius:16px;overflow:hidden;background:var(--v6-bg);color:var(--v6-text);box-shadow:0 2px 10px rgba(0,0,0,.04)}
.v6-auto-head{padding:10px 12px;background:var(--v6-surface);font-weight:800;font-size:10px;color:var(--v6-text);text-align:center;line-height:1.65;position:relative;z-index:1}
.v6-auto-status{text-align:center;line-height:1.9}
.v6-auto-actions{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:10px;flex-wrap:wrap}
.v6-auto-actions .v6-auto-link{margin:0!important;text-align:center}
.v6-auto-tabs{display:flex;gap:6px;padding:8px;overflow-x:auto;border-bottom:1px solid var(--v6-border-soft);background:var(--v6-bg);scrollbar-width:thin}
.v6-auto-tab{flex:0 0 auto;border:1px solid var(--v6-border);border-radius:10px;padding:7px 11px;background:var(--v6-surface-2);color:var(--v6-text);font-size:11px;font-weight:800;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}
.v6-auto-tab:hover{transform:translateY(-1px)}
.v6-auto-tab.active{background:var(--v6-accent);color:#fff;border-color:var(--v6-accent)}
.v6-auto-body{padding:10px;background:var(--v6-bg)}
.v6-auto-frame{display:block;width:100%;height:500px;border:1px solid var(--v6-border-soft);border-radius:12px;background:var(--v6-bg);color-scheme:light}
.v6-auto-status{font-size:11px;margin:6px 0;color:var(--v6-muted);line-height:1.7}
.v6-auto-actions{display:flex;gap:7px;margin-top:7px;flex-wrap:wrap}
.v6-auto-link{display:inline-flex;padding:7px 11px;border-radius:9px;background:var(--v6-accent);color:#fff;text-decoration:none;font-size:11px;font-weight:800}.v6-auto-compare-btn{display:inline-flex;padding:7px 11px;border-radius:9px;border:0;background:#ef7d00;color:#fff;font:inherit;font-size:11px;font-weight:800;cursor:pointer;align-items:center;justify-content:center}
.v6-auto-home{background:var(--v6-surface-2);color:var(--v6-text)}
.v6-auto-low{opacity:.82}
/* App theme is authoritative: do not let the device/OS color scheme override it. */
body.v6-dark .v6-auto-store{--v6-bg:#0b1220;--v6-surface:#121c2d;--v6-surface-2:#1a2639;--v6-text:#f8fafc;--v6-muted:#b7c2d3;--v6-border:rgba(255,255,255,.15);--v6-border-soft:rgba(255,255,255,.1);box-shadow:0 4px 18px rgba(0,0,0,.4)}
body.v6-dark .v6-auto-head{color:#f8fafc;background:#111827;border-color:#263449;border-radius:12px}
body.v6-dark .v6-auto-tabs{background:#0b1220;border-color:rgba(255,255,255,.1)}
body.v6-dark .v6-auto-tab{color:#f8fafc;background:#1a2639;border-color:rgba(255,255,255,.15)}
body.v6-dark .v6-auto-tab.active{background:#2563eb;color:#fff;border-color:#2563eb}
body.v6-dark .v6-auto-body{background:#0b1220;color:#f8fafc}
body.v6-dark .v6-auto-status{color:#b7c2d3}
body.v6-dark .v6-auto-link{background:#2563eb;color:#fff}
body.v6-dark .v6-auto-home{background:#1a2639;color:#f8fafc}
body.v6-dark .v6-auto-store{border-color:#263449}
html.dark .v6-auto-store,body.dark .v6-auto-store,[data-theme="dark"] .v6-auto-store{--v6-bg:#0b1220;--v6-surface:#121c2d;--v6-surface-2:#1a2639;--v6-text:#f8fafc;--v6-muted:#b7c2d3;--v6-border:rgba(255,255,255,.15);--v6-border-soft:rgba(255,255,255,.1);box-shadow:0 4px 18px rgba(0,0,0,.4)}
html.dark .v6-auto-head,body.dark .v6-auto-head,[data-theme="dark"] .v6-auto-head{color:#f8fafc}
html.dark .v6-auto-tabs,body.dark .v6-auto-tabs,[data-theme="dark"] .v6-auto-tabs{background:#0b1220}
html.dark .v6-auto-tab,body.dark .v6-auto-tab,[data-theme="dark"] .v6-auto-tab{color:#f8fafc;background:#1a2639;border-color:rgba(255,255,255,.15)}
html.dark .v6-auto-body,body.dark .v6-auto-body,[data-theme="dark"] .v6-auto-body{background:#0b1220}
html.dark .v6-auto-status,body.dark .v6-auto-status,[data-theme="dark"] .v6-auto-status{color:#b7c2d3}
html.dark .v6-auto-frame,body.dark .v6-auto-frame,[data-theme="dark"] .v6-auto-frame{color-scheme:dark}
`;document.head.appendChild(s);
}
function ensureHost(){const existing=document.getElementById('v6StoreSimulatorResults');if(existing)return existing;let anchor=document.getElementById('v5SmartSearchResults');if(!anchor){const form=document.getElementById('v5SmartSearchForm');if(!form||!form.parentNode)return null;anchor=document.createElement('div');anchor.id='v5SmartSearchResults';anchor.className='v5-smart-search-results';anchor.style.margin='0';anchor.style.minHeight='0';form.parentNode.appendChild(anchor);}const host=document.createElement('div');host.id='v6StoreSimulatorResults';host.className='v5-smart-search-results v6-store-simulator-results';anchor.parentNode.insertBefore(host,anchor.nextSibling);return host;}
function openBrowser(query,list){
 const host=ensureHost();if(!host)return;
 host.style.setProperty('margin-top','3mm','important');host.style.position='relative';host.style.zIndex='1';
 host.style.marginBottom='0';
 style();

 const messages=[
   'دارم عبارت جستجو رو دقیق‌تر تحلیل می‌کنم...',
   'دسته و نوع کالای درخواستی رو با فروشگاه‌ها تطبیق می‌دم...',
   'فروشگاه‌های نامرتبط رو کنار می‌ذارم...',
   'دارم گزینه‌های مرتبط‌تر رو برایت آماده می‌کنم...',
   'تقریباً آماده‌ست؛ نتایج مرتبط رو نمایش می‌دم...'
 ];

 const box=document.createElement('section');box.className='v6-auto-store';
 box.innerHTML='<div class="v6-auto-head">هوش‌یار در حال بررسی فروشگاه‌های مرتبط با درخواست توست...</div>';
 const body=document.createElement('div');body.className='v6-auto-body';
 box.appendChild(body);

 const processing=document.createElement('div');
 processing.className='v6-auto-processing';
 processing.setAttribute('aria-live','polite');
 processing.innerHTML='<div class="v6-auto-processing-title">نتایج جست‌وجوی محلی آماده می‌شوند...</div><div class="v6-auto-processing-details" style="display:block"><ul></ul></div>';
 const processingList=processing.querySelector('ul');

 function finishProcessing(onComplete){
   if(processingFinished)return;
   processingFinished=true;
   const savedDetails=processing.querySelector('.v6-auto-processing-details');
   processing.innerHTML='';
   const toggle=document.createElement('button');
   toggle.type='button';
   toggle.className='v6-auto-processing-toggle';
   toggle.setAttribute('aria-expanded','false');
   toggle.innerHTML='<span class="v6-auto-processing-done">جست‌وجوی محلی آماده شد</span><span class="v6-auto-processing-chevron" aria-hidden="true">›</span>';
   processing.appendChild(toggle);
   if(savedDetails)processing.appendChild(savedDetails);
   if(savedDetails)savedDetails.style.display='none';
   toggle.addEventListener('click',function(){
     const open=this.getAttribute('aria-expanded')==='true';
     this.setAttribute('aria-expanded',String(!open));
     if(savedDetails)savedDetails.style.display=open?'none':'block';
   });
   if(typeof onComplete==='function')onComplete();
 }

 let processingIndex=0;
 let processingFinished=false;
 let semanticRefreshHandler=null;
 function typeProcessingMessage(textValue,done){
   const li=document.createElement('li');
   processingList.appendChild(li);
   let charIndex=0;
   const step=function(){
     if(charIndex<textValue.length){
       const remaining=textValue.length-charIndex;
       const chunk=remaining>24?2:1;
       charIndex=Math.min(textValue.length,charIndex+chunk);
       li.textContent=textValue.slice(0,charIndex);
       if(charIndex<textValue.length)setTimeout(step,remaining>24?18:12);
       else if(done)setTimeout(done,60);
     }
   };
   step();
 }
 function showNextProcessingMessage(){
   const message=messages[processingIndex++];
   typeProcessingMessage(message,function(){
     if(processingIndex<messages.length)setTimeout(showNextProcessingMessage,120);
     else finishProcessing(renderResults);
   });
 }
 host.innerHTML='';
 host.appendChild(processing);
 host.appendChild(box);
 box.style.display='none';
 showNextProcessingMessage();

 function renderResults(){
   try{
     /*
      * Production V7 is semantic-AI authoritative.
      * The legacy deterministic merchant resolver is intentionally NOT allowed
      * to produce visible Store Browser tabs. This prevents stale/default
      * merchants from appearing while the AI plan is pending or unavailable.
      */
     const semanticPlan=window.DigiYarShoppingPlan&&
       String(window.DigiYarShoppingPlan.query||'').trim()===String(query||'').trim()
       ?window.DigiYarShoppingPlan.ai:null;
     if(!semanticPlan){
       box.style.display='block';
       tabsAndResults([]);
       return;
     }
     const canonicalList=Array.isArray(window.DigiYarPopularAffiliateStores)
       ? window.DigiYarPopularAffiliateStores
       : (Array.isArray(list)?list:stores());
     const canonicalById=Object.create(null);
     canonicalList.forEach(function(x){
       if(x&&x.id)canonicalById[String(x.id).toLowerCase()]=x;
     });
     /*
      * The local orchestrator has already made the eligibility decision.
      * Do not run a second, legacy eligibility pass here: it can discard
      * valid local-plan stores and leave the results panel empty.
      */
     const plannedIds=Array.isArray(semanticPlan.eligibleStoreIds)
       ? semanticPlan.eligibleStoreIds.map(function(id){return String(id||'').toLowerCase();}).filter(Boolean)
       : [];
     const plannedList=Array.isArray(semanticPlan.eligibleStoreIds)
       ? plannedIds.map(function(id){return canonicalById[id]||{id:id,name:STORE_NAMES[id]||id};})
       : [];
     /* Keep the query-driven KB eligibility hook active for compatibility,
        but let the local plan's store IDs survive a legacy filtering mismatch. */
     const eligibleByQuery=window.DigiYarStoreEligibility&&typeof window.DigiYarStoreEligibility.storesForQuery==='function'
       ? window.DigiYarStoreEligibility.storesForQuery(query,canonicalList)
       : [];
     const mergedById=Object.create(null);
     plannedList.concat(Array.isArray(eligibleByQuery)?eligibleByQuery:[]).forEach(function(x){
       if(x&&x.id)mergedById[String(x.id).toLowerCase()]=x;
     });
     const sourceList=Object.keys(mergedById).map(function(id){return mergedById[id];});
     const usable=sourceList.filter(function(x){var id=String(x&&x.id||'').toLowerCase();var kb=window.DigiYarStoreBusinessDomains&&window.DigiYarStoreBusinessDomains.catalog||{};return !!(x&&(SEARCH[id]||HOME[id]||(kb[id]&&kb[id].homepage)));})
       .map(function(x){
         var id=String(x.id||'').toLowerCase();
         return {id:id,name:STORE_NAMES[id]||String(x.name||'فروشگاه')};
       });
     box.style.display='block';
     tabsAndResults(usable);
   }catch(error){
     console.error('DigiYar Store Browser render:',error);
     box.style.display='block';
     box.innerHTML='<div class="v6-auto-head">در نمایش نتایج مشکلی پیش آمد؛ دوباره جستجو کن.</div>';
   }
 }


 semanticRefreshHandler=function(event){
   const plan=event&&event.detail;
   if(!plan||String(plan.query||'').trim()!==String(query||'').trim())return;
   /*
    * The event is the synchronization barrier between Hooshyar AI and the
    * Browser. It is emitted for both success and operational failure.
    * Success replaces the visible merchant set; failure deliberately renders
    * an empty semantic result instead of resurrecting the legacy resolver.
    */
   if(processingFinished){
     renderResults();
   }else{
     finishProcessing(renderResults);
   }
   if(semanticRefreshHandler){
     window.removeEventListener('digiyar:shopping-plan-ready',semanticRefreshHandler);
     semanticRefreshHandler=null;
   }
 };
 window.addEventListener('digiyar:shopping-plan-ready',semanticRefreshHandler);

 function tabsAndResults(usable){
   if(!Array.isArray(usable)||!usable.length){
     box.innerHTML='<div class="v6-auto-head">برای این درخواست، فروشگاه مرتبطی با اطمینان کافی پیدا نشد.</div>';
     return;
   }
   box.innerHTML='<div class="v6-auto-head">طبق خواسته‌ات فروشگاه‌های مرتبط با محصول مورد نظرت رو برات لیست کردم</div>';
   const tabs=document.createElement('div');tabs.className='v6-auto-tabs';
   const resultBody=document.createElement('div');resultBody.className='v6-auto-body';
   box.append(tabs,resultBody);
   let active=usable[0];
   function render(){
     tabs.querySelectorAll('.v6-auto-tab').forEach(t=>t.classList.toggle('active',t.dataset.id===active.id));
     const searchQuery=storeSearchQuery(query);
     const sub=document.getElementById('v5Subcategory');
     const selectedSub=sub&&sub.value?String(sub.value):'';
     const categoryUrl=CATEGORY[active.id]&&CATEGORY[active.id][selectedSub];
     const u=storeSearchUrl(active.id,searchQuery)||categoryUrl||HOME[active.id]||SEARCH[active.id](searchQuery);
     resultBody.innerHTML='<div class="v6-auto-status">با انتخاب اسم هر فروشگاه از سربرگ و لمس دکمه پایین، نتایج ظاهر میشن</div><div class="v6-auto-actions"><a class="v6-auto-link" target="_blank" rel="noopener noreferrer" href="'+esc(affiliateUrl(active.id,u))+'">مشاهده نتایج در '+esc(active.name)+'</a><button type="button" class="v6-auto-compare-btn" data-v7-open-comparison="1">مقایسه محصولات</button></div>';
   }
   usable.forEach(x=>{const t=document.createElement('button');t.type='button';t.className='v6-auto-tab';t.dataset.id=x.id;t.textContent=x.name;t.addEventListener('click',()=>{active=x;render();});tabs.appendChild(t);});
   render();
 }
 return host;
}

/* Merchant catalog grouped by business-domain headings for the Store Browser. */
function buildStoreCategories(){
 var kb=window.DigiYarStoreBusinessDomains;
 var catalog=kb&&kb.catalog?kb.catalog:{};
 var titles=kb&&kb.domainTitles?kb.domainTitles:{};
 var groups={};
 Object.keys(catalog).forEach(function(id){
   if(!Object.prototype.hasOwnProperty.call(SEARCH,id))return;
   var store=catalog[id]||{};
   (Array.isArray(store.domains)?store.domains:[]).forEach(function(domain){
     if(!groups[domain])groups[domain]={id:domain,title:titles[domain]||domain,storeIds:[],stores:[]};
     groups[domain].storeIds.push(id);
     groups[domain].stores.push({id:id,name:STORE_NAMES[id]||store.name||id,homepage:HOME[id]||store.homepage||'',domains:store.domains||[],products:store.products||[],specialties:store.specialties||[]});
   });
 });
 Object.keys(groups).forEach(function(domain){
   groups[domain].storeIds=Array.from(new Set(groups[domain].storeIds));
   groups[domain].stores.sort(function(a,b){return a.name.localeCompare(b.name,'fa');});
 });
 return groups;
}

window.DigiYarStoreBrowser={version:VERSION,open:openBrowser,categories:buildStoreCategories,storesByDomain:buildStoreCategories};
})();
