/* DigiYar V7 — standalone, fail-closed merchant search URL resolver.
   This module deliberately has no dependency on the removed Store Simulator. */
(function(root){
'use strict';
function normalize(q){
 return String(q||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').replace(/ضد\s*آفتاب|ضدآفتاب/g,'ضد آفتاب').replace(/مرطوب\s*[-‌]?\s*کننده/g,'مرطوب کننده').replace(/آب\s*رسان/g,'آبرسان').replace(/\s+/g,' ').trim();
}
function productTerm(id,q){
 var s=normalize(q),key=String(id||'').toLowerCase();
 /* Merchant-specific query terms are used only where the store's search is
    known to perform better with a concise product phrase. */
 if(/کیف\s*اداری/.test(s)||(/کیف/.test(s)&&/محل کار/.test(s)))return 'کیف اداری';
 if(/تصفیه\s*هوا/.test(s))return 'تصفیه هوا';
 if(/تمیز|تمیزکردن|تمیز کردن|شستن|شستشو|نظافت|لکه/.test(s)&&/مبل|پارچه/.test(s))return 'تمیزکننده مبل پارچه‌ای';
 if(key==='basalam'){
  var preferred=[/تصفیه\s*هوا/i,/رطوبت\s*ساز/i,/جارو\s*برقی/i,/بخارشوی/i,/ماشین\s*لباسشویی/i,/یخچال/i,/پنکه/i,/کولر/i,/تلویزیون/i,/لپ.?تاپ/i,/موبایل|گوشی/i,/شارژر/i,/پاوربانک/i,/هندزفری|هدفون/i,/کابل/i,/کیف\s*اداری/i];
  for(var i=0;i<preferred.length;i++){var m=s.match(preferred[i]);if(m)return m[0].replace(/\s+/g,' ');}
 }
 return s;
}
var SEARCH={
 digikala:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(productTerm('digikala',q)),
 snappshop:q=>'https://snappshop.ir/search?query='+encodeURIComponent(productTerm('snappshop',q)),
 torob:q=>'https://torob.com/search/?query='+encodeURIComponent(productTerm('torob',q)),
 basalam:q=>'https://basalam.com/search?q='+encodeURIComponent(productTerm('basalam',q)),
 esam:q=>'https://esam.ir/search/?kw='+encodeURIComponent(productTerm('esam',q)),
 janebi:q=>'https://janebi.com/search?q='+encodeURIComponent(productTerm('janebi',q)),
berozkala:q=>'https://berozkala.com/search?q='+encodeURIComponent(productTerm('berozkala',q))
};
SEARCH.berozkala=q=>'https://berozkala.com/search?q='+encodeURIComponent(productTerm('berozkala',q));
SEARCH.technolife=q=>'https://www.technolife.com/product/list/search?keywords='+encodeURIComponent(productTerm('technolife',q));
/* Official Meghdad IT storefront exposes a product search field; use the standard product-search query rather than its homepage. */
SEARCH.meghdadit=q=>'https://meghdadit.com/?s='+encodeURIComponent(productTerm('meghdadit',q))+'&post_type=product';
SEARCH.digiland=q=>'https://dgland.com/search?q='+encodeURIComponent(productTerm('digiland',q));
SEARCH.digido=q=>'https://www.digido.ir/search?s='+encodeURIComponent(productTerm('digido',q));
SEARCH.gooshishop=q=>'https://gooshishop.com/search?q='+encodeURIComponent(productTerm('gooshishop',q));
SEARCH.khanoumi=q=>'https://www.khanoumi.com/search?query='+encodeURIComponent(productTerm('khanoumi',q));
SEARCH.modiseh=q=>'https://www.modiseh.com/search?q='+encodeURIComponent(productTerm('modiseh',q));
SEARCH.banimode=q=>'https://www.banimode.com/search?q='+encodeURIComponent(productTerm('banimode',q));
SEARCH.takhfifan=q=>'https://takhfifan.com/search?q='+encodeURIComponent(productTerm('takhfifan',q));
SEARCH.pinket=q=>'https://pinket.com/search?q='+encodeURIComponent(productTerm('pinket',q));
SEARCH.solokala=q=>'https://solokala.com/search?q='+encodeURIComponent(productTerm('solokala',q));
SEARCH.mosbatesabz=q=>'https://mosbatesabz.com/?s='+encodeURIComponent(productTerm('mosbatesabz',q));
SEARCH.darmankala=q=>'https://darmankala.com/catalogsearch/result/?q='+encodeURIComponent(productTerm('darmankala',q));
SEARCH.darukade=q=>'https://darukade.com/products?w='+encodeURIComponent(productTerm('darukade',q));
/* Dayan's previously tested affiliate route resolved to login/home, so fail closed until a real product-search route is verified. */
SEARCH.dayan=q=>'';
/* MiMarket's product-search route has not been verified; do not send users to a guessed URL. */
SEARCH.memarket=q=>'';
SEARCH.alibaba=q=>/(?:قطار|ریل)/.test(normalize(q))?'https://www.alibaba.ir/train':'';
SEARCH.mrbilit=q=>/(?:قطار|ریل)/.test(normalize(q))?'https://mrbilit.com/train-ticket':'';
SEARCH.ghasedak24=q=>/(?:قطار|ریل)/.test(normalize(q))?'https://ghasedak24.com/train-ticket':'';
function hasQuery(url){
 try{
  var u=new URL(url);if(u.protocol!=='https:'||!u.hostname)return false;
  var keys=['q','query','s','search','title','kw','keywords','w','term','text','keyword','product','search_query'];
  for(var i=0;i<keys.length;i++){var v=u.searchParams.get(keys[i]);if(v&&v.trim().length>=2)return true;}
  return /\/(?:train-ticket|train)\/?$/.test(u.pathname);
 }catch(e){return false;}
}
function resolve(id,q){
 var key=String(id||'').toLowerCase(),query=normalize(q);
 if(!key||!query)return '';
 var catalog=root.DigiYarStoreBusinessDomains&&root.DigiYarStoreBusinessDomains.catalog||{};
 var merchant=catalog[key]||{},merchantName=normalize(merchant.name||''),merchantHome=String(merchant.homepage||''),merchantHost='';
 try{merchantHost=normalize(new URL(merchantHome).hostname.replace(/^www\\./i,''));}catch(e){}
 if(query===merchantName||query===normalize(key)||(merchantHost&&query===merchantHost)){
  try{var homeUrl=new URL(merchantHome);if(homeUrl.protocol==='https:'&&!/affdn\.ir$/i.test(homeUrl.hostname))return homeUrl.href;}catch(e){}
 }
 var make=SEARCH[key];if(typeof make!=='function')return '';
 var url=make(query);
 return typeof url==='string'&&hasQuery(url)?url:'';
}
root.DigiYarStoreSearchUrl={version:'7.0.0-store-search-url.6',resolve:resolve,productTerm:productTerm,hasHandler:function(id){return typeof SEARCH[String(id||'').toLowerCase()]==='function';},handlerIds:function(){return Object.keys(SEARCH).sort();}};
})(typeof window!=='undefined'?window:globalThis);
