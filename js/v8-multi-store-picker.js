/* DigiYar V8 — restore the original grouped merchant directory.
   Short tap opens the merchant page; a long press selects it for Hooshyar. */
(function(){
'use strict';
function byId(id){return document.getElementById(id);}
function start(){
 var select=byId('storeSelect'),tabs=byId('v7PopularDiscoveryTabs'),directory=byId('v7PopularDiscovery'),panel=byId('popularDiscoveryPanel');
 if(!select||!tabs||!directory||!panel)return false;
 if(window.DigiYarStoreSelection&&window.DigiYarStoreSelection.version==='8.2.0-grouped-longpress')return true;
 tabs.hidden=false;tabs.removeAttribute('aria-hidden');
 directory.hidden=false;directory.removeAttribute('aria-hidden');
 var selected=new Set(),pressTimer=null,pressedAnchor=null,longPressed=false,suppressClick=null;
 var hintStyle=document.getElementById('v8StoreGestureStyle');
 if(!hintStyle){
  hintStyle=document.createElement('style');hintStyle.id='v8StoreGestureStyle';
  hintStyle.textContent=
  '#v7PopularDiscoveryTabs:before{content:"لمس کوتاه لوگو یا نام: ورود به فروشگاه  •  لمس طولانی: انتخاب برای هوش‌یار";display:block;margin:0 0 10px;padding:8px 10px;border-radius:9px;background:var(--pd-card,#f7f9fc);color:var(--pd-muted,#68778d);font-size:11px;font-weight:700;line-height:1.7;text-align:center}'+
  '#v7PopularDiscovery .popular-discovery-store{position:relative;cursor:pointer;touch-action:pan-y;user-select:none;-webkit-user-select:none}'+
  '#v7PopularDiscovery .popular-discovery-store.is-selected{border-color:#315b98!important;background:rgba(63,112,181,.11)!important;box-shadow:0 0 0 2px rgba(63,112,181,.2),0 7px 18px rgba(35,73,127,.1)!important}'+
  '#v7PopularDiscovery .popular-discovery-store.is-selected:after{content:"✓ انتخاب شد";position:absolute;left:8px;top:8px;padding:3px 7px;border-radius:7px;background:#315b98;color:#fff;font-size:9px;font-weight:800}'+
  '#v7PopularDiscovery .popular-discovery-store[aria-pressed="true"]{outline:0}'+
  'body.v6-dark #v7PopularDiscovery .popular-discovery-store.is-selected{background:rgba(77,121,187,.22)!important;border-color:#8eaddd!important}'+
  'body.v6-dark #v7PopularDiscoveryTabs:before{background:#1b2940;color:#d9e4f5}';
  document.head.appendChild(hintStyle);
 }
 select.style.display='none';select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 function syncCards(){
  directory.querySelectorAll('.popular-discovery-store[data-store-id]').forEach(function(anchor){
   var on=selected.has(anchor.dataset.storeId);
   anchor.classList.toggle('is-selected',on);
   anchor.setAttribute('aria-pressed',String(on));
  });
 }
 function refresh(){
  var ids=Array.from(selected),next=ids.length?ids[0]:'all';
  if(select.value!==next){select.value=next;select.dispatchEvent(new Event('change',{bubbles:true}));}
  syncCards();
 }
 function stopPress(){if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}}
 directory.addEventListener('pointerdown',function(event){
  var anchor=event.target.closest&&event.target.closest('.popular-discovery-store[data-store-id]');
  if(!anchor||event.button!==undefined&&event.button!==0)return;
  stopPress();pressedAnchor=anchor;longPressed=false;
  pressTimer=setTimeout(function(){
   var id=pressedAnchor&&pressedAnchor.dataset.storeId;if(!id)return;
   if(selected.has(id))selected.delete(id);else selected.add(id);
   longPressed=true;suppressClick=pressedAnchor;refresh();
   if(navigator.vibrate)try{navigator.vibrate(25);}catch(e){}
  },560);
 });
 ['pointerup','pointercancel','pointerleave'].forEach(function(type){
  directory.addEventListener(type,function(){stopPress();},true);
 });
 directory.addEventListener('click',function(event){
  var anchor=event.target.closest&&event.target.closest('.popular-discovery-store[data-store-id]');
  if(suppressClick&&anchor===suppressClick){
   event.preventDefault();event.stopPropagation();suppressClick=null;pressedAnchor=null;return;
  }
  if(anchor&&selected.has(anchor.dataset.storeId)){
   /* A normal short tap always follows the merchant link, even when selected. */
  }
 },true);
 if(window.MutationObserver){
  var observer=new MutationObserver(function(){syncCards();});
  observer.observe(directory,{childList:true,subtree:true});
 }
 window.DigiYarStoreSelection={
  version:'8.2.0-grouped-longpress',
  getFilters:function(){var ids=Array.from(selected);return {active:ids.length>0,selectedStoreIds:ids,selectedCategoryIds:[],selectedTypeIds:[]};},
  getSelectedStoreIds:function(){return Array.from(selected);},
  clear:function(){selected.clear();refresh();}
 };
 refresh();
 return true;
}
function boot(){if(start())return;var n=0,t=setInterval(function(){if(start()||++n>50)clearInterval(t);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
