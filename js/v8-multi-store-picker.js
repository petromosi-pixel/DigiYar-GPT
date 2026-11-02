/* V8 multi-store accordion selector */
(function(){
'use strict';
function byId(id){return document.getElementById(id);}
function boot(){
 var select=byId('storeSelect'),kb=window.DigiYarStoreBusinessDomains,resolver=window.DigiYarStoreSearchUrl;
 if(!select||!kb||!kb.byType||!resolver||byId('v8MultiStorePicker'))return !!byId('v8MultiStorePicker');
 var source=typeof window.DigiYarGetSelectableStores==='function'?window.DigiYarGetSelectableStores():[];
 var available=new Set(source.map(function(s){return String(s.id);}));
 var selected=new Set(),active=false,host=select.closest('.v5-field')||select.parentElement;
 var style=document.createElement('style');style.textContent='#v8MultiStorePicker{direction:rtl;text-align:right;width:100%}#v8MultiStorePicker button{font:inherit;cursor:pointer}#v8msTrigger{width:100%;min-height:48px;padding:10px 13px;border:1px solid #dfe6f0;border-radius:12px;background:#f8fafd;color:#182235;display:flex;justify-content:space-between;align-items:center;text-align:right}#v8msPanel{margin-top:8px;padding:9px;border:1px solid #dfe6f0;border-radius:12px;background:#fff;max-height:60vh;overflow:auto;box-shadow:0 8px 24px #19304a18}#v8msPanel[hidden]{display:none}#v8msPanel details{border:1px solid #e6ebf2;border-radius:9px;margin:6px 0}#v8msPanel summary{padding:9px;cursor:pointer;font-size:13px;font-weight:800;color:#2a4169}#v8msPanel .v8msDomain{margin:5px 8px}#v8msPanel label{display:flex;align-items:center;gap:8px;padding:6px 9px;font-size:12px;cursor:pointer}#v8msPanel input{width:17px;height:17px;min-height:17px;accent-color:#2a4169}#v8msPanel .v8msTools{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:11px;color:#69778d}#v8msPanel .v8msTools button{border:0;background:none;color:#2a4169;font-weight:800}body.v6-dark #v8msPanel{background:#172338;border-color:#34445e}body.v6-dark #v8msPanel details{border-color:#34445e}body.v6-dark #v8msTrigger{background:#1b2940;color:#edf3fc;border-color:#34445e}';document.head.appendChild(style);
 var root=document.createElement('div');root.id='v8MultiStorePicker';
 var trigger=document.createElement('button');trigger.id='v8msTrigger';trigger.type='button';trigger.setAttribute('aria-expanded','false');
 var label=document.createElement('span'),count=document.createElement('small');trigger.append(label,count);
 var panel=document.createElement('div');panel.id='v8msPanel';panel.hidden=true;
 var tools=document.createElement('div');tools.className='v8msTools';var hint=document.createElement('span');hint.textContent='گروه‌ها و دسته‌ها را باز کن';var clear=document.createElement('button');clear.type='button';clear.textContent='پاک کردن انتخاب‌ها';tools.append(hint,clear);panel.appendChild(tools);
 function checkbox(parent,title,kind,id,ids){var l=document.createElement('label'),c=document.createElement('input'),t=document.createElement('span');c.type='checkbox';c.dataset.kind=kind;c.dataset.id=id;if(ids)c.dataset.ids=ids.join(',');t.textContent=title;l.append(c,t);parent.appendChild(l);return c;}
 Object.keys(kb.byType).forEach(function(type){
  var group=kb.byType[type],ids=(group.storeIds||[]).map(String).filter(function(id){return available.has(id);});if(!ids.length)return;
  var d=document.createElement('details'),s=document.createElement('summary');s.textContent=group.title||type;d.appendChild(s);checkbox(d,'انتخاب همهٔ گروه','type',type,ids);
  Object.keys(kb.domainTitles||{}).forEach(function(domain){
   var domainData=kb.byDomain[domain]||{},members=(domainData.storeIds||[]).map(String).filter(function(id){return ids.indexOf(id)>=0;});if(!members.length)return;
   var sub=document.createElement('details'),ss=document.createElement('summary');sub.className='v8msDomain';ss.textContent=domainData.title||kb.domainTitles[domain]||domain;sub.appendChild(ss);checkbox(sub,'انتخاب همهٔ دسته','domain',domain,members);
   members.forEach(function(id){var store=kb.catalog[id];if(store)checkbox(sub,store.name||id,'store',id);});
   d.appendChild(sub);
  });
  panel.appendChild(d);
 });
 root.append(trigger,panel);select.insertAdjacentElement('afterend',root);select.style.display='none';select.setAttribute('aria-hidden','true');select.tabIndex=-1;
 ['v5Category','v5Subcategory'].forEach(function(id){var n=byId(id),f=n&&n.closest('.v5-field');if(f)f.style.display='none';});
 function refresh(){
  panel.querySelectorAll('input[type=checkbox]').forEach(function(c){
   if(c.dataset.kind==='store')c.checked=selected.has(c.dataset.id);
   else{var ids=(c.dataset.ids||'').split(',').filter(Boolean),n=ids.filter(function(id){return selected.has(id);}).length;c.checked=!!ids.length&&n===ids.length;c.indeterminate=n>0&&n<ids.length;}
  });
  label.textContent=active?'فروشگاه‌ها و دسته‌بندی‌های انتخاب‌شده':'فروشگاهتو انتخاب کن';count.textContent=active?selected.size+' فروشگاه انتخاب شد':'همهٔ فروشگاه‌های مرتبط';
  select.value=selected.size?Array.from(selected)[0]:'all';
 }
 trigger.addEventListener('click',function(){panel.hidden=!panel.hidden;trigger.setAttribute('aria-expanded',String(!panel.hidden));});
 clear.addEventListener('click',function(){selected.clear();active=false;refresh();});
 panel.addEventListener('change',function(e){var c=e.target;if(!c||c.type!=='checkbox')return;active=true;var ids=(c.dataset.ids||'').split(',').filter(Boolean);if(c.dataset.kind==='store'){if(c.checked)selected.add(c.dataset.id);else selected.delete(c.dataset.id);}else ids.forEach(function(id){if(c.checked)selected.add(id);else selected.delete(id);});refresh();});
 document.addEventListener('click',function(e){if(!root.contains(e.target)){panel.hidden=true;trigger.setAttribute('aria-expanded','false');}});
 refresh();
 window.DigiYarStoreSelection={version:'8.0.0.1',getFilters:function(){return {active:active,selectedStoreIds:Array.from(selected)};},getSelectedStoreIds:function(){return Array.from(selected);},clear:function(){selected.clear();active=false;refresh();}};
 return true;
}
function start(){if(boot())return;var n=0,t=setInterval(function(){if(boot()||++n>40)clearInterval(t);},150);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();