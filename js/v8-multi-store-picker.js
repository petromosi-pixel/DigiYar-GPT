/* DigiYar V8 — logo-only multi-store picker; taxonomy remains in the canonical KB for search. */
(function(){
'use strict';
var LOGO_FILES=["آیتول.webp","آیسو کالکشن.webp","ازکی.webp","اسنپ شاپ.webp","اسپرت لند.webp","اسکای روم.webp","افق کوروش.webp","افیلیو.webp","اقامت ۲۴.webp","الوکام.webp","اُکالا.webp","ایران ستکور.webp","ایران میز.webp","ایسام.webp","ایسمینار.webp","ایمالز.webp","باسلام.webp","باما.webp","بانی استایل.webp","بانی مد.webp","بتا دنت.webp","بروز کالا.webp","به روز کالا.webp","بیمه بازار.webp","بیمه دات کام.webp","تاپ لرن.webp","تخفیفان.webp","ترب.webp","تریپ.webp","تکنولایف.webp","تیدا چوب..webp","جاباما.webp","جانبو.webp","جانبی.webp","جین وست.webp","خانومی.webp","خودرو ۴۵.webp","داروخانه آنلاین.webp","داروخانه صبا.webp","داروکده.webp","دانشجویار.webp","دایان شاپ.webp","درمان کالا.webp","دیجی استایل.webp","دیجی دو.png","دیجی لند.webp","دیجی کالا.webp","دیما افیلیت.webp","دیوار.webp","راکت.webp","رجا.webp","روژا شاپ.webp","زیبامون.webp","سبز لرن.webp","سبز گستر.webp","سفر مارکت.webp","سفر می.webp","سولو کالا.webp","شاواز.webp","شب.webp","شهروند.webp","شیپور.webp","شیکستون..webp","طاقچه.webp","علی بابا.webp","فرادرس.webp","فلای تودی.webp","فلای سپهران.webp","فیدیبو.webp","قاصدک ۲۴.webp","مبل ایران.webp","مثبت سبز.webp","مدیسه.webp","مستر بلیط.webp","مقداد آی تی.webp","مو تن رو.webp","موبایل آی آر.webp","موبایل ۱۴۰.webp","مکتب خونه.webp","می مارکت.webp","نشاط رخ.webp","نی نی سایت.webp","هایپرمی.webp","همراه مکانیک.webp","همیار آی تی.webp","پرتو چوب.webp","پینکت.webp","چوبینه.webp","چیدا هوم.webp","کارنامه.webp","کالا ۳۶۰.webp","کالاتیک.webp","کلاسینو.webp","کلید.webp","کوئرا.webp","گوشی شاپ.webp","یدک مارکت.webp","یدک یار.webp","۱۹ کالا.webp","۳۰ بوک.webp"];
var LOGO_ID_OVERRIDES={
 'به روز کالا':'berozkala',
 '۱۹ کالا':'19kala',
 '۳۰ بوک':'book30',
 'بانی استایل':'banistyle'
};
function byId(id){return document.getElementById(id);}
function norm(value){return String(value||'').normalize('NFC').replace(/[\u200c\s._-]+/g,'').replace(/[.]+$/g,'').toLowerCase();}
function start(){
 var select=byId('storeSelect'),tabs=byId('v7PopularDiscoveryTabs'),categoryTree=byId('v7PopularDiscovery');
 var kb=window.DigiYarStoreBusinessDomains;
 if(!select||!tabs||!kb||!kb.catalog)return false;
 if(byId('v8MultiStorePicker'))return true;
 /* Category/type store directories are intentionally removed from this card.
    Product taxonomy and merchant relevance stay available to the form and Hooshyar. */
 tabs.hidden=true;tabs.setAttribute('aria-hidden','true');
 if(categoryTree){categoryTree.hidden=true;categoryTree.setAttribute('aria-hidden','true');}
 var logoById={},catalog=kb.catalog;
 LOGO_FILES.forEach(function(file){
  var stem=file.replace(/\.(?:webp|png|jpe?g)$/i,'').replace(/[.]+$/,'');
  var id=LOGO_ID_OVERRIDES[stem]||Object.keys(catalog).find(function(key){
   return norm(catalog[key]&&catalog[key].name)===norm(stem);
  });
  if(id&&catalog[id]&&!logoById[id])logoById[id]=file;
 });
 var stores=Object.keys(logoById).map(function(id){
  return {id:id,name:String(catalog[id].name||id),logo:logoById[id]};
 }).sort(function(a,b){return a.name.localeCompare(b.name,'fa');});
 var selected=new Set(),active=false;
 var style=document.createElement('style');style.id='v8MultiStorePickerStyle';style.textContent=
 '#v8MultiStorePicker{direction:rtl;width:100%;margin:8px 0 14px;text-align:right}'+
 '#v8msHint{margin:0 0 10px;text-align:center;font-size:12px;font-weight:700;color:var(--dy-muted,#68778d)}'+
 '#v8msGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}'+
 '#v8msGrid .v8msStore{min-width:0;min-height:88px;padding:8px 5px;border:1px solid var(--dy-border,#dfe6f0);border-radius:12px;background:var(--dy-surface,#fff);color:var(--dy-text,#26354a);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:inherit;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}'+
 '#v8msGrid .v8msStore img{display:block;width:48px;height:42px;object-fit:contain;max-width:100%}'+
 '#v8msGrid .v8msStore span{font-size:10px;font-weight:700;line-height:1.45;text-align:center;overflow-wrap:anywhere}'+
 '#v8msGrid .v8msStore[aria-pressed="true"]{border:2px solid var(--dy-primary,#2a4169);background:var(--dy-selected-bg,#edf3fc);box-shadow:0 0 0 2px color-mix(in srgb,var(--dy-primary,#2a4169) 12%,transparent)}'+
 'body.v6-dark #v8msGrid .v8msStore{background:#1b2940;color:#edf3fc;border-color:#34445e}'+
 'body.v6-dark #v8msGrid .v8msStore[aria-pressed="true"]{background:#263b5d;border-color:#8ba9df}'+
 '@media(max-width:390px){#v8msGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}#v8msGrid .v8msStore{min-height:82px}#v8msGrid .v8msStore img{width:42px;height:38px}}';
 document.head.appendChild(style);
 var root=document.createElement('section');root.id='v8MultiStorePicker';root.setAttribute('aria-label','انتخاب فروشگاه‌ها');
 var hint=document.createElement('p');hint.id='v8msHint';hint.textContent='فروشگاه‌های دلخواهت رو از بین لوگوها انتخاب کن';
 var grid=document.createElement('div');grid.id='v8msGrid';
 stores.forEach(function(store){
  var button=document.createElement('button');button.type='button';button.className='v8msStore';
  button.dataset.storeId=store.id;button.setAttribute('aria-pressed','false');
  var img=document.createElement('img');img.src='assets/store-logos/'+encodeURIComponent(store.logo).replace(/%2F/g,'/');img.alt='';
  img.loading='lazy';img.decoding='async';
  var label=document.createElement('span');label.textContent=store.name;
  button.append(img,label);
  button.addEventListener('click',function(){
   if(selected.has(store.id))selected.delete(store.id);else selected.add(store.id);
   active=selected.size>0;refresh();
  });
  grid.appendChild(button);
 });
 root.append(hint,grid);
 var panel=byId('popularDiscoveryPanel');
 if(panel)panel.insertBefore(root,panel.firstChild);else tabs.insertAdjacentElement('afterend',root);
 select.style.display='none';select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 function refresh(){
  grid.querySelectorAll('.v8msStore').forEach(function(button){
   button.setAttribute('aria-pressed',String(selected.has(button.dataset.storeId)));
  });
  var nextStore=selected.size?Array.from(selected)[0]:'all';
  if(select.value!==nextStore){select.value=nextStore;select.dispatchEvent(new Event('change',{bubbles:true}));}
  root.dataset.selectedStoreIds=Array.from(selected).join(',');
  hint.textContent=active?'فروشگاه‌های انتخاب‌شده: '+selected.size:'فروشگاه‌های دلخواهت رو از بین لوگوها انتخاب کن';
 }
 refresh();
 window.DigiYarStoreSelection={
  version:'8.1.0-logo-only',
  getFilters:function(){return {active:active,selectedStoreIds:Array.from(selected),selectedCategoryIds:[],selectedTypeIds:[]};},
  getSelectedStoreIds:function(){return Array.from(selected);},
  clear:function(){selected.clear();active=false;refresh();}
 };
 return true;
}
function boot(){if(start())return;var n=0,t=setInterval(function(){if(start()||++n>40)clearInterval(t);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();