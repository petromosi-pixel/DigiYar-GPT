/* DigiYar V8 — server-entitlement-gated multi-store comparison */
(function(root){
'use strict';
var FEATURE='multi_store_comparison';
var state={query:'',products:[],comparison:null};
function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function normalizeStore(p){
 var offer=p&&p.bestOffer&&typeof p.bestOffer==='object'?p.bestOffer:{};
 var raw=clean(offer.storeName||offer.store||p.storeName||p.store);
 if(/torobshop|torob/i.test(raw))return 'ترب';
 if(/technolife/i.test(raw))return 'تکنولایف';
 if(/digikala/i.test(raw))return 'دیجی‌کالا';
 if(/snappshop/i.test(raw))return 'اسنپ‌شاپ';
 if(/basalam/i.test(raw))return 'باسلام';
 return raw;
}
function productUrl(p){return clean(p&&p.productUrl);}
function price(p){
 var offer=p&&p.bestOffer&&typeof p.bestOffer==='object'?p.bestOffer:{};
 var value=Number(offer.priceToman||offer.price||p.priceToman||p.price);
 return Number.isFinite(value)&&value>0?value:0;
}
function prepare(input){
 var registry=root.DigiYarComparisonProviderRegistry;
 var verified=registry&&typeof registry.normalizeMany==='function'?registry.normalizeMany(Array.isArray(input)?input:[]):[];
 var stores=Object.create(null);verified.forEach(function(p){stores[p.retailerId]=true;});
 return {products:verified.slice(0,20),storeCount:Object.keys(stores).length,ready:verified.length>=2&&Object.keys(stores).length>=2};
}
function installStyle(){
 if(root.document.getElementById('v8-membership-comparison-style'))return;
 var style=root.document.createElement('style');style.id='v8-membership-comparison-style';
 style.textContent='#v8MembershipComparison{margin-top:14px}#v8MembershipComparison .v8-mc-grid-wrap{overflow-x:auto;margin-top:12px;border:1px solid var(--dy-border,rgba(42,65,105,.14));border-radius:12px}#v8MembershipComparison table{width:100%;min-width:560px;border-collapse:collapse;font-size:12px}#v8MembershipComparison th,#v8MembershipComparison td{padding:10px 8px;text-align:center;border-bottom:1px solid var(--dy-border,rgba(42,65,105,.12));vertical-align:middle}#v8MembershipComparison th:first-child,#v8MembershipComparison td:first-child{font-weight:800;background:var(--dy-surface-raised,rgba(42,65,105,.045))}#v8MembershipComparison a{display:inline-block;color:var(--dy-link,#2876bd);font-size:10px;margin-top:5px}#v8MembershipComparison .v8-mc-summary{font-size:11px;text-align:center;margin:10px 0;color:var(--dy-text,inherit)}#v8MembershipComparison .v8-mc-cheapest{font-weight:900;color:var(--dy-success,#16834a)}';
 root.document.head.appendChild(style);
}
function render(result,query){
 var host=root.document&&root.document.getElementById('v8MembershipComparisonOutput');
 if(!host)return;
 host.textContent='';
 var title=root.document.createElement('p');title.className='v8-mc-summary';
 title.textContent='مقایسهٔ «'+clean(query)+'»؛ '+result.count+' محصول از '+result.storeComparison.length+' فروشگاه';
 host.appendChild(title);
 var wrap=root.document.createElement('div');wrap.className='v8-mc-grid-wrap';
 var table=root.document.createElement('table'),head=root.document.createElement('thead'),headRow=root.document.createElement('tr');
 var first=root.document.createElement('th');first.textContent='شاخص مقایسه';headRow.appendChild(first);
 result.products.forEach(function(p){
  var th=root.document.createElement('th'),name=root.document.createElement('strong');name.textContent=p.name;th.appendChild(name);
  if(p.productUrl){var link=root.document.createElement('a');link.href=p.productUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent='مشاهدهٔ کالا';th.appendChild(link);}
  headRow.appendChild(th);
 });
 head.appendChild(headRow);table.appendChild(head);
 var body=root.document.createElement('tbody');
 function addRow(label,values,cheapest){
  var tr=root.document.createElement('tr'),th=root.document.createElement('th');th.textContent=label;tr.appendChild(th);
  values.forEach(function(value,index){var td=root.document.createElement('td');td.textContent=value==null||value===''?'—':String(value);if(cheapest&&result.priceComparison.cheapestIds.indexOf(result.products[index].id)>=0)td.className='v8-mc-cheapest';tr.appendChild(td);});
  body.appendChild(tr);
 }
 addRow('فروشگاه',result.products.map(function(p){return p.store;}));
 addRow('قیمت',result.products.map(function(p){return p.priceToman?new Intl.NumberFormat('fa-IR').format(p.priceToman)+' تومان':'نامشخص';}),true);
 addRow('برند',result.products.map(function(p){return p.brand;}));
 addRow('مدل',result.products.map(function(p){return p.model;}));
 addRow('وضعیت موجودی',result.products.map(function(p){return p.availability;}));
 (result.specificationComparison||[]).forEach(function(spec){
  addRow(spec.label,spec.valuesByProduct.map(function(item){return item.value;}));
 });
 table.appendChild(body);wrap.appendChild(table);host.appendChild(wrap);
 if(result.priceComparison&&result.priceComparison.available){
  var diff=root.document.createElement('p');diff.className='v8-mc-summary';
  diff.textContent='اختلاف قیمت کمترین و بیشترین پیشنهاد: '+new Intl.NumberFormat('fa-IR').format(result.priceComparison.difference)+' تومان';
  host.appendChild(diff);
 }
 host.hidden=false;
}
function compare(input,query){
 var access=root.DigiYarMembershipAccess;
 if(!access||typeof access.canAccess!=='function'||!access.canAccess(FEATURE)){
  if(access&&typeof access.requireFeature==='function')access.requireFeature(FEATURE);
  return {status:'locked'};
 }
 var prepared=prepare(input);
 if(!prepared.ready)return {status:'insufficient_verified_products',count:prepared.products.length,storeCount:prepared.storeCount};
 var engine=root.DigiYarComparisonEngine;
 if(!engine||typeof engine.compare!=='function')return {status:'comparison_engine_unavailable'};
 var result=engine.compare(prepared.products);
 if(result.status!=='comparison_ready'||result.storeComparison.length<2)return {status:'insufficient_verified_products',count:result.count,storeCount:result.storeComparison.length};
 state={query:clean(query),products:prepared.products,comparison:result};
 render(result,query);
 return {status:'comparison_ready',result:result};
}
function onResults(event){
 var detail=event&&event.detail||{},prepared=prepare(detail.products||[]);
 var card=root.document&&root.document.getElementById('v8MembershipComparison');
 var button=root.document&&root.document.getElementById('v8MembershipCompareButton');
 var hint=root.document&&root.document.getElementById('v8MembershipComparisonHint');
 var output=root.document&&root.document.getElementById('v8MembershipComparisonOutput');
 if(!card||!button)return;
 var query=clean(detail.query);
 state={query:query,products:prepared.products,comparison:null};
 if(output){output.textContent='';output.hidden=true;}
 /* Always show the comparison status after a completed Hooshyar search.
    Hiding the whole card made an unavailable data set look like a broken UI. */
 card.hidden=!query;
 button.hidden=!prepared.ready;
 button.disabled=!prepared.ready;
 if(hint){
  if(prepared.ready){
   hint.textContent='محصولات معتبر از '+prepared.storeCount+' فروشگاه پیدا شدند. برای مشاهدهٔ جدول، مقایسه را اجرا کن.';
  }else if(prepared.products.length){
   hint.textContent='برای «'+query+'» فقط '+prepared.products.length+' محصولِ دارای قیمت و لینک معتبر از '+prepared.storeCount+' فروشگاه در داده‌های فعلی پیدا شد. مقایسهٔ واقعی به حداقل دو فروشگاه مستقل نیاز دارد.';
  }else{
   hint.textContent='هنوز دادهٔ تازه و تأییدشدهٔ محصول از دو فروشگاه مستقل به دیجی‌یار متصل نیست. مسیرهای جست‌وجوی فروشگاه‌ها، قیمت‌های قدیمی و لینک‌های دسته‌بندی برای ساخت جدول مقایسه پذیرفته نمی‌شوند.';
  }
 }
}
function init(){
 if(!root.document)return;
 installStyle();
 var button=root.document.getElementById('v8MembershipCompareButton');
 if(button)button.addEventListener('click',function(){
  var result=compare(state.products,state.query);
  if(result.status==='insufficient_verified_products'){
   var hint=root.document.getElementById('v8MembershipComparisonHint');
   if(hint)hint.textContent='دادهٔ معتبر از حداقل دو فروشگاه متفاوت برای مقایسه موجود نیست.';
  }else if(result.status==='comparison_engine_unavailable'){
   var hint2=root.document.getElementById('v8MembershipComparisonHint');
   if(hint2)hint2.textContent='موتور مقایسه در دسترس نیست؛ بعداً دوباره تلاش کن.';
  }
 });
 root.addEventListener('digiyar:v9-assistant-results',onResults);
 root.addEventListener('digiyar:v7-product-results',function(e){if(!state.query)onResults(e);});
 root.addEventListener('digiyar:v9-assistant-cleared',function(){
  state={query:'',products:[],comparison:null};
  var card=root.document.getElementById('v8MembershipComparison'),out=root.document.getElementById('v8MembershipComparisonOutput');
  if(card)card.hidden=true;if(out){out.textContent='';out.hidden=true;}
 });
}
if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
root.DigiYarMembershipComparison=Object.freeze({featureId:FEATURE,prepare:prepare,compare:compare,getState:function(){return{query:state.query,products:state.products.slice(),comparison:state.comparison};}});
})(window);
