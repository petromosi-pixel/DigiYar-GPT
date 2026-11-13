/* DigiYar V7 — external product capture / share-target bridge */
(function(window,document){
'use strict';
const VERSION='7.0.0-product-capture.1';
function clean(v){return String(v||'').replace(/\s+/g,' ').trim();}
function hostName(url){try{return new URL(url).hostname.replace(/^www\./,'');}catch(_){return '';}}
function storeFromUrl(url){
 const h=hostName(url);
 if(h.includes('digikala'))return 'دیجی‌کالا';
 if(h.includes('snappshop'))return 'اسنپ‌شاپ';
 if(h.includes('torob'))return 'ترب';
 if(h.includes('basalam'))return 'باسلام';
 return h||'فروشگاه';
}
function captureFromUrl(){
 const p=new URLSearchParams(window.location.search);
 const url=clean(p.get('dy_product_url')||p.get('url')||'');
 const title=clean(p.get('dy_product_name')||p.get('title')||'');
 const text=clean(p.get('text')||'');
 const productUrl=url||((/^https?:\/\//i.test(text))?text:'');
 if(!productUrl&&!title)return null;
 const name=title||text.replace(productUrl,'').trim()||productUrl;
 const source=window.DigiYarV7ProductResultSource;
 if(!source||typeof source.addComparisonProduct!=='function')return null;
 const result=source.addComparisonProduct({id:'captured|'+productUrl,name:name,productUrl:productUrl,store:storeFromUrl(productUrl),source:'external-share'});
 try{history.replaceState({},document.title,window.location.pathname+window.location.hash);}catch(_){}
 return result;
}
function init(){
 const captured=captureFromUrl();
 if(captured){
   window.dispatchEvent(new CustomEvent('digiyar:v7-comparison-selection-ready',{detail:captured}));
   setTimeout(function(){const card=document.getElementById('v7ComparisonCard');if(card)card.scrollIntoView({behavior:'smooth',block:'center'});},250);
 }
}
window.DigiYarV7ProductCapture={version:VERSION,capture:captureFromUrl};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window,document);
