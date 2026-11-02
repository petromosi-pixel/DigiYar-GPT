/* DigiYar V8 — multi-store, deduplicated four-column accordion picker */
(function(){
'use strict';
function byId(id){return document.getElementById(id);}
function normName(value){return String(value||'').replace(/[\u200c\s]+/g,'').toLowerCase();}
function start(){
 var select=byId('storeSelect'),kb=window.DigiYarStoreBusinessDomains,resolver=window.DigiYarStoreSearchUrl;
 if(!select||!kb||!kb.byType||!resolver)return false;
 var existing=byId('v8MultiStorePicker');if(existing)return true;
 var source=typeof window.DigiYarGetSelectableStores==='function'?window.DigiYarGetSelectableStores():[];
 var available=new Set(source.map(function(s){return String(s.id);}));
 var selected=new Set(),selectedCategories=new Set(),selectedTypes=new Set(),active=false;
 var style=document.createElement('style');style.id='v8MultiStorePickerStyle';style.textContent=`
 #v8MultiStorePicker{direction:rtl;text-align:right;width:100%;margin-top:8px}
 #v8MultiStorePicker button{font:inherit;cursor:pointer}
 #v8msTrigger{width:100%;min-height:48px;padding:10px 13px;border:1px solid #dfe6f0;border-radius:12px;background:#f8fafd;color:#182235;display:flex;justify-content:space-between;align-items:center;text-align:right;gap:8px}
 #v8msTrigger small{font-size:11px;color:#748197;white-space:nowrap}
 #v8msPanel{margin-top:8px;padding:9px;border:1px solid #dfe6f0;border-radius:12px;background:#fff;max-height:62vh;overflow:auto;box-shadow:0 8px 24px #19304a18}
 #v8msPanel[hidden]{display:none}
 #v8msPanel details{border:1px solid #e6ebf2;border-radius:9px;margin:6px 0}
 #v8msPanel details>summary{padding:9px;cursor:pointer;font-size:13px;font-weight:800;color:#2a4169;list-style:none}
 #v8msPanel details>summary::-webkit-details-marker{display:none}
 #v8msPanel details>summary:after{content:'⌄';float:left;transition:transform .15s}
 #v8msPanel details[open]>summary:after{transform:rotate(180deg)}
 #v8msPanel .v8msDomain{margin:5px 8px}
 #v8msPanel .v8msTools{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:11px;color:#69778d;margin-bottom:8px}
 #v8msPanel .v8msTools button{border:0;background:none;color:#2a4169;font-weight:800}
 #v8msPanel .v8msStoreGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px 5px;padding:2px 7px 8px}
 #v8msPanel label{direction:rtl;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:5px;min-width:0;padding:5px 3px;font-size:11px;line-height:1.45;cursor:pointer;overflow-wrap:anywhere}
 #v8msPanel label span{min-width:0}
 #v8msPanel input{width:15px;height:15px;min-width:15px;min-height:15px;accent-color:#2a4169;margin:0;flex:0 0 15px}
 #v8msPanel .v8msGroupCheck{padding:7px 10px;font-weight:700;background:rgba(125,145,175,.045);border-radius:7px}
 #v8msPanel .v8msDomain>summary{font-size:12px}
 body.v6-dark #v8msPanel{background:#172338;border-color:#34445e}
 body.v6-dark #v8msPanel details{border-color:#34445e}
 body.v6-dark #v8msPanel label{color:#e4ebf6}
 body.v6-dark #v8msTrigger{background:#1b2940;color:#edf3fc;border-color:#34445e}
 @media(max-width:390px){#v8msPanel .v8msStoreGrid{gap:1px 3px}#v8msPanel label{font-size:10px;padding:5px 1px;gap:3px}#v8msPanel input{width:14px;height:14px;min-width:14px;min-height:14px;flex-basis:14px}}
 `;document.head.appendChild(style);
 var root=document.createElement('div');root.id='v8MultiStorePicker';
 var trigger=document.createElement('button');trigger.id='v8msTrigger';trigger.type='button';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','v8msPanel');
 var triggerLabel=document.createElement('span'),triggerCount=document.createElement('small');trigger.append(triggerLabel,triggerCount);
 var panel=document.createElement('div');panel.id='v8msPanel';panel.hidden=true;
 var tools=document.createElement('div');tools.className='v8msTools';var hint=document.createElement('span');hint.textContent='گروه و دسته‌بندی را باز کن و فروشگاه‌های دلخواهت را انتخاب کن';var clear=document.createElement('button');clear.type='button';clear.textContent='پاک کردن انتخاب‌ها';tools.append(hint,clear);panel.appendChild(tools);
 function addCheck(parent,title,kind,id,ids,extraClass){
  var label=document.createElement('label');if(extraClass)label.className=extraClass;
  var input=document.createElement('input');input.type='checkbox';input.dataset.kind=kind;input.dataset.id=id;if(ids)input.dataset.ids=ids.join(',');
  var text=document.createElement('span');text.textContent=title;label.append(input,text);parent.appendChild(label);return input;
 }
 function addStoreGrid(parent,ids,seenIds,seenNames){
  var grid=document.createElement('div');grid.className='v8msStoreGrid';
  ids.forEach(function(id){
   id=String(id);if(seenIds.has(id)||!available.has(id))return;
   var store=kb.catalog[id];if(!store)return;
   var name=String(store.name||id),key=normName(name);if(seenNames.has(key))return;
   seenIds.add(id);seenNames.add(key);addCheck(grid,name,'store',id);
  });
  if(grid.children.length)parent.appendChild(grid);
 }
 ['general','portal','specialist'].forEach(function(type){
  var group=kb.byType[type];if(!group)return;
  var groupIds=(group.storeIds||[]).map(String).filter(function(id){return available.has(id);});
  if(!groupIds.length)return;
  var details=document.createElement('details');details.className='v8msType';
  var summary=document.createElement('summary');summary.textContent=group.title||type;details.appendChild(summary);
  addCheck(details,'انتخاب همهٔ '+(group.title||'این گروه'), 'type',type,groupIds,'v8msGroupCheck');
  var seenIds=new Set(),seenNames=new Set();
  if(type==='specialist'){
   var taxonomy=kb.specialistByDomain||{};
   Object.keys(taxonomy).forEach(function(domain){
    var data=taxonomy[domain]||{};
    var ids=(data.storeIds||[]).map(String).filter(function(id){
     if(groupIds.indexOf(id)<0)return false;
     var store=kb.catalog[id]||{},primary=(store.domains||[]).map(String)[0];
     return primary===domain;
    });
    if(!ids.length)return;
    var category=document.createElement('details');category.className='v8msDomain';
    var categoryTitle=document.createElement('summary');categoryTitle.textContent=data.title||kb.domainTitles[domain]||domain;category.appendChild(categoryTitle);
    addCheck(category,'انتخاب همهٔ این دسته','domain',domain,ids,'v8msGroupCheck');
    addStoreGrid(category,ids,seenIds,seenNames);details.appendChild(category);
   });
   /* Keep any specialist whose first domain is not present in the taxonomy visible exactly once. */
   var leftovers=groupIds.filter(function(id){return !seenIds.has(id);});
   if(leftovers.length){var other=document.createElement('details');other.className='v8msDomain';var title=document.createElement('summary');title.textContent='سایر فروشگاه‌های تخصصی';other.appendChild(title);addCheck(other,'انتخاب همهٔ این دسته','domain','specialist_other',leftovers,'v8msGroupCheck');addStoreGrid(other,leftovers,seenIds,seenNames);details.appendChild(other);}
  }else{
   addStoreGrid(details,groupIds,seenIds,seenNames);
  }
  panel.appendChild(details);
 });
 root.append(trigger,panel);select.insertAdjacentElement('afterend',root);select.style.display='none';select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 ['v5Category','v5Subcategory'].forEach(function(id){var n=byId(id),field=n&&n.closest('.v5-field');if(field)field.style.display='none';});
 function refresh(){
  panel.querySelectorAll('input[type=checkbox]').forEach(function(c){
   var kind=c.dataset.kind,id=c.dataset.id,ids=(c.dataset.ids||'').split(',').filter(Boolean);
   if(kind==='store')c.checked=selected.has(id);
   else{var n=ids.filter(function(x){return selected.has(x);}).length;c.checked=ids.length>0&&n===ids.length;c.indeterminate=n>0&&n<ids.length;}
  });
  triggerLabel.textContent=active?'فروشگاه‌های انتخاب‌شده':'فروشگاهتو انتخاب کن';
  triggerCount.textContent=active?selected.size+' فروشگاه':'انتخاب چندگانه';
  select.value=selected.size?Array.from(selected)[0]:'all';
  root.dataset.selectedStoreIds=Array.from(selected).join(',');
 }
 trigger.addEventListener('click',function(){panel.hidden=!panel.hidden;trigger.setAttribute('aria-expanded',String(!panel.hidden));});
 clear.addEventListener('click',function(){selected.clear();selectedCategories.clear();selectedTypes.clear();active=false;refresh();});
 panel.addEventListener('change',function(event){
  var c=event.target;if(!c||c.type!=='checkbox')return;active=true;
  var kind=c.dataset.kind,id=c.dataset.id,ids=(c.dataset.ids||'').split(',').filter(Boolean);
  if(kind==='store'){if(c.checked)selected.add(id);else selected.delete(id);}
  else{
   if(kind==='domain'){if(c.checked)selectedCategories.add(id);else selectedCategories.delete(id);}
   if(kind==='type'){if(c.checked)selectedTypes.add(id);else selectedTypes.delete(id);}
   ids.forEach(function(storeId){if(c.checked)selected.add(storeId);else selected.delete(storeId);});
  }
  refresh();
 });
 document.addEventListener('click',function(event){if(!root.contains(event.target)){panel.hidden=true;trigger.setAttribute('aria-expanded','false');}});
 refresh();
 window.DigiYarStoreSelection={version:'8.0.0.2',getFilters:function(){return {active:active,selectedStoreIds:Array.from(selected),selectedCategoryIds:Array.from(selectedCategories),selectedTypeIds:Array.from(selectedTypes)};},getSelectedStoreIds:function(){return Array.from(selected);},clear:function(){selected.clear();selectedCategories.clear();selectedTypes.clear();active=false;refresh();}};
 return true;
}
function boot(){if(start())return;var n=0,t=setInterval(function(){if(start()||++n>40)clearInterval(t);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();