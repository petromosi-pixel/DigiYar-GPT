/* DigiYar V8 — grouped merchant directory with an explicit selection mode. */
(function(){
'use strict';
function byId(id){return document.getElementById(id);}
function start(){
 var select=byId('storeSelect'),tabs=byId('v7PopularDiscoveryTabs'),directory=byId('v7PopularDiscovery'),panel=byId('popularDiscoveryPanel');
 if(!select||!tabs||!directory||!panel)return false;
 if(window.DigiYarStoreSelection&&window.DigiYarStoreSelection.version==='8.3.0-explicit-selection-mode')return true;
 tabs.hidden=false;tabs.removeAttribute('aria-hidden');
 directory.hidden=false;directory.removeAttribute('aria-hidden');
 var selected=new Set(),selectionMode=false;
 var style=document.getElementById('v8StoreSelectionModeStyle');
 if(!style){
  style=document.createElement('style');style.id='v8StoreSelectionModeStyle';
  style.textContent=
  '#v7PopularDiscovery .v8-store-selection-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:10px 12px;border:1px solid var(--pd-border,#dce3ed);border-radius:12px;background:var(--pd-card,#f7f9fc);color:var(--pd-text,inherit)}'+
  '#v7PopularDiscovery .v8-store-selection-toggle{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:7px 12px;border:1px solid var(--pd-border,#cbd5e1);border-radius:9px;background:transparent;color:inherit;font:inherit;font-size:12px;font-weight:800;cursor:pointer}'+
  '#v7PopularDiscovery .v8-store-selection-toggle[aria-pressed="true"]{background:#315b98;border-color:#315b98;color:#fff}'+
  '#v7PopularDiscovery .v8-store-selection-status{font-size:11px;color:var(--pd-muted,#68778d);line-height:1.6}'+
  '#v7PopularDiscovery .popular-discovery-store{position:relative;cursor:pointer}'+
  '#v7PopularDiscovery.is-selection-mode .popular-discovery-store{outline:1px dashed rgba(49,91,152,.35);outline-offset:2px}'+
  '#v7PopularDiscovery .popular-discovery-store.is-selected{border-color:#315b98!important;background:rgba(63,112,181,.11)!important;box-shadow:0 0 0 2px rgba(63,112,181,.2),0 7px 18px rgba(35,73,127,.1)!important}'+
  '#v7PopularDiscovery .popular-discovery-store.is-selected:after{content:"✓ انتخاب شد";position:absolute;left:8px;top:8px;padding:3px 7px;border-radius:7px;background:#315b98;color:#fff;font-size:9px;font-weight:800}'+
  'body.v6-dark #v7PopularDiscovery .v8-store-selection-toolbar{background:#1b2940;border-color:#34445d;color:#e5edf8}'+
  'body.v6-dark #v7PopularDiscovery .v8-store-selection-status{color:#b9c8dc}'+
  'body.v6-dark #v7PopularDiscovery .popular-discovery-store.is-selected{background:rgba(77,121,187,.22)!important;border-color:#8eaddd!important}';
  document.head.appendChild(style);
 }
 select.style.display='none';select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 function ensureToolbar(){
  if(!directory.querySelector('.v8-store-selection-toolbar')){
   var toolbar=document.createElement('div');
   toolbar.className='v8-store-selection-toolbar';
   toolbar.innerHTML='<button type="button" class="v8-store-selection-toggle" aria-pressed="false"><span aria-hidden="true">☑</span><span>انتخاب فروشگاه‌ها برای هوش‌یار</span></button><span class="v8-store-selection-status" aria-live="polite">برای انتخاب چند فروشگاه، این حالت را فعال کن</span>';
   var list=directory.querySelector('.popular-discovery-accordion-list');
   directory.insertBefore(toolbar,list||directory.firstChild);
  }
  syncToolbar();
 }
 function syncToolbar(){
  var button=directory.querySelector('.v8-store-selection-toggle'),status=directory.querySelector('.v8-store-selection-status');
  if(button){button.setAttribute('aria-pressed',String(selectionMode));button.querySelector('span:last-child').textContent=selectionMode?'پایان انتخاب فروشگاه‌ها':'انتخاب فروشگاه‌ها برای هوش‌یار';}
  if(status)status.textContent=selectionMode?'حالت انتخاب فعاله؛ لوگوی فروشگاه‌های همین فهرست رو لمس کن · '+selected.size+' انتخاب':'انتخاب‌شده‌ها: '+selected.size+' فروشگاه';
  directory.classList.toggle('is-selection-mode',selectionMode);
 }
 function syncCards(){
  directory.querySelectorAll('.popular-discovery-store[data-store-id]').forEach(function(anchor){
   var on=selected.has(anchor.dataset.storeId);
   anchor.classList.toggle('is-selected',on);
   anchor.setAttribute('aria-pressed',String(on));
   if(selectionMode)anchor.setAttribute('aria-label','انتخاب یا لغو انتخاب '+(anchor.querySelector('.popular-discovery-store-name')||{}).textContent);
  });
  syncToolbar();
 }
 function refresh(){
  var ids=Array.from(selected),next=ids.length?ids[0]:'all';
  if(select.value!==next){select.value=next;select.dispatchEvent(new Event('change',{bubbles:true}));}
  syncCards();
 }
 function toggleStore(anchor){
  var id=anchor&&anchor.dataset.storeId;if(!id)return;
  if(selected.has(id))selected.delete(id);else selected.add(id);
  refresh();
  if(navigator.vibrate)try{navigator.vibrate(18);}catch(e){}
 }
 directory.addEventListener('click',function(event){
  var toggle=event.target.closest&&event.target.closest('.v8-store-selection-toggle');
  if(toggle){selectionMode=!selectionMode;syncToolbar();return;}
  var anchor=event.target.closest&&event.target.closest('.popular-discovery-store[data-store-id]');
  if(anchor&&selectionMode){event.preventDefault();event.stopPropagation();if(event.stopImmediatePropagation)event.stopImmediatePropagation();toggleStore(anchor);}
 },true);
 if(window.MutationObserver){
  var observer=new MutationObserver(function(){ensureToolbar();syncCards();});
  observer.observe(directory,{childList:true,subtree:true});
 }
 window.DigiYarStoreSelection={
  version:'8.3.0-explicit-selection-mode',
  isSelectionMode:function(){return selectionMode;},
  setSelectionMode:function(value){selectionMode=!!value;syncToolbar();},
  getFilters:function(){var ids=Array.from(selected);return {active:ids.length>0,selectedStoreIds:ids,selectedCategoryIds:[],selectedTypeIds:[]};},
  getSelectedStoreIds:function(){return Array.from(selected);},
  clear:function(){selected.clear();refresh();}
 };
 ensureToolbar();refresh();
 return true;
}
function boot(){if(start())return;var n=0,t=setInterval(function(){if(start()||++n>50)clearInterval(t);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();