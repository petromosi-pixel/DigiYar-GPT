/* DigiYar Price Watch — local-first MVP */
(function(){
'use strict';
const KEY='digiyar-price-watch-v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n||0).toLocaleString('fa-IR')+' تومان';
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}};
const write=a=>localStorage.setItem(KEY,JSON.stringify(a));
let page,content,editing=null;
function mount(){
 if($('#dyPriceWatchPage'))return;
 page=document.createElement('section');page.id='dyPriceWatchPage';page.dir='rtl';page.hidden=true;
 const style=document.createElement('style');style.textContent=`
#dyPriceWatchPage{position:fixed;inset:0;z-index:2147483300;display:flex;flex-direction:column;background:var(--dy-page,#fff);color:var(--dy-text,#24334c);font-family:inherit}
#dyPriceWatchPage[hidden]{display:none!important}#dyPriceWatchPage .dpw-head{height:58px;flex:0 0 58px;display:flex;align-items:center;gap:12px;padding:0 15px;border-bottom:1px solid var(--dy-border,#e5e7eb);background:var(--dy-surface,#fff)}
#dyPriceWatchPage .dpw-head button{border:0;background:transparent;color:inherit;font-size:23px}#dyPriceWatchPage .dpw-head strong{flex:1;font-size:15px}
#dyPriceWatchPage .dpw-body{flex:1;overflow:auto;padding:14px 15px calc(28px + env(safe-area-inset-bottom));}
#dyPriceWatchPage .dpw-intro{padding:15px;border-radius:14px;background:var(--dy-control,#f1f4f8);margin-bottom:14px}#dyPriceWatchPage .dpw-intro strong{font-size:15px}#dyPriceWatchPage .dpw-intro p{font-size:11px;line-height:1.9;color:var(--dy-muted,#718096);margin:6px 0 0}
#dyPriceWatchPage .dpw-add{width:100%;padding:13px;border:0;border-radius:11px;background:var(--dy-primary,#2a4169);color:#fff;font:inherit;font-size:13px;font-weight:800}
#dyPriceWatchPage .dpw-card{padding:13px;margin:12px 0;border:1px solid var(--dy-border,#e3e9f2);border-radius:13px;background:var(--dy-surface,#fff)}
#dyPriceWatchPage .dpw-card h3{font-size:14px;margin:0 0 7px}#dyPriceWatchPage .dpw-meta{font-size:11px;color:var(--dy-muted,#718096);line-height:1.9}
#dyPriceWatchPage .dpw-prices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.dpw-prices div{background:var(--dy-control,#f2f4f7);padding:9px;border-radius:9px}.dpw-prices small{display:block;color:var(--dy-muted,#718096);font-size:10px}.dpw-prices b{font-size:12px}
#dyPriceWatchPage .dpw-status{font-size:11px;font-weight:800;margin:8px 0;color:var(--dy-primary,#2a4169)}#dyPriceWatchPage .dpw-status.hit{color:#16834a}
#dyPriceWatchPage .dpw-actions{display:flex;gap:7px;flex-wrap:wrap}#dyPriceWatchPage .dpw-actions button{flex:1;min-width:75px;padding:9px 6px;border:1px solid var(--dy-border,#e3e9f2);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:11px}
#dyPriceWatchPage .dpw-form{display:grid;gap:10px}#dyPriceWatchPage .dpw-form label{display:grid;gap:5px;font-size:11px;font-weight:700}#dyPriceWatchPage .dpw-form input{width:100%;box-sizing:border-box;padding:12px;border:1px solid var(--dy-border,#d8deea);border-radius:9px;background:var(--dy-surface,#fff);color:inherit;font:inherit;font-size:13px}
#dyPriceWatchPage .dpw-form .dpw-form-actions{display:flex;gap:8px;margin-top:5px}#dyPriceWatchPage .dpw-form button{flex:1;padding:12px;border:0;border-radius:9px;background:var(--dy-primary,#2a4169);color:#fff;font:inherit;font-size:12px;font-weight:800}#dyPriceWatchPage .dpw-form button[type=button]{background:var(--dy-control,#e9edf4);color:inherit}
#dyPriceWatchPage .dpw-empty{text-align:center;padding:32px 12px;color:var(--dy-muted,#718096);font-size:12px;line-height:2}
#dyPriceWatchPage .dpw-history{font-size:10px;color:var(--dy-muted,#718096);line-height:1.9;margin-top:8px}
body.v6-dark #dyPriceWatchPage{--dy-page:#101827;--dy-surface:#182437;--dy-control:#202c3e;--dy-text:#e7edf7;--dy-muted:#aab6c8;--dy-border:#35445a;--dy-primary:#9db7e8}
`;document.head.appendChild(style);
 page.innerHTML='<header class="dpw-head"><button type="button" data-dpw-back aria-label="بازگشت">→</button><strong>شکارچی قیمت</strong><span aria-hidden="true">⌁</span></header><div class="dpw-body" id="dpwBody"></div>';
 document.body.appendChild(page);content=$('#dpwBody',page);
 page.addEventListener('click',e=>{
  const b=e.target.closest('[data-dpw]');if(!b)return;
  const act=b.dataset.dpw,id=b.dataset.id;
  if(act==='add'||act==='edit')form(id||null);
  if(act==='cancel')render();
  if(act==='delete'&&confirm('این کالا از فهرست پیگیری حذف شود؟')){write(read().filter(x=>x.id!==id));render()}
  if(act==='update')formUpdate(id);
  if(act==='history')history(id);
 });
 page.addEventListener('submit',e=>{if(e.target.id!=='dpwForm'||e.target.dataset.updateId)return;e.preventDefault();saveForm(e.target)});
 page.querySelector('[data-dpw-back]').addEventListener('click',close);
 window.addEventListener('dy-open-pricewatch',open);
}
function open(){if(!page)return;page.hidden=false;document.body.style.overflow='hidden';render()}
function close(){if(!page)return;page.hidden=true;document.body.style.overflow=''}
function render(){
 const items=read();
 content.innerHTML='<div class="dpw-intro"><strong>قبل از خرید، قیمت را زیر نظر بگیر</strong><p>کالا و قیمت هدف را ثبت کن؛ هر بار قیمت جدید را وارد کنی، دیجی‌یار رسیدن به قیمت دلخواهت را بررسی می‌کند. این نسخه هنوز قیمت فروشگاه‌ها را خودکار دریافت نمی‌کند.</p></div><button class="dpw-add" data-dpw="add">＋ افزودن کالا به فهرست پیگیری</button>'+(items.length?items.map(x=>card(x)).join(''):'<div class="dpw-empty">هنوز کالایی برای پیگیری ثبت نکرده‌ای.<br>با افزودن اولین کالا، فهرست پیگیریت اینجا ساخته می‌شود.</div>');
}
function card(x){
 const hit=Number(x.current)<=Number(x.target);
 const history=(x.history||[]).slice(-3).reverse().map(h=>esc(h.date)+' · '+money(h.price)).join('<br>');
 return '<article class="dpw-card"><h3>'+esc(x.name)+'</h3><div class="dpw-meta">'+(x.store?esc(x.store)+' · ':'')+(x.url?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">صفحه کالا</a>':'بدون لینک فروشگاه')+'</div><div class="dpw-prices"><div><small>قیمت فعلی</small><b>'+money(x.current)+'</b></div><div><small>قیمت هدف</small><b>'+money(x.target)+'</b></div></div><div class="dpw-status '+(hit?'hit':'')+'">'+(hit?'✓ به قیمت هدف رسیده است':'تا قیمت هدف: '+money(Math.max(0,Number(x.current)-Number(x.target))))+'</div><div class="dpw-actions"><button data-dpw="update" data-id="'+x.id+'">ثبت قیمت جدید</button><button data-dpw="history" data-id="'+x.id+'">تاریخچه</button><button data-dpw="edit" data-id="'+x.id+'">ویرایش</button><button data-dpw="delete" data-id="'+x.id+'">حذف</button></div>'+(history?'<div class="dpw-history">آخرین تغییرات:<br>'+history+'</div>':'')+'</article>';
}
function form(id){
 editing=id;const x=id?read().find(v=>v.id===id):{};
 content.innerHTML='<div class="dpw-card"><h3>'+(id?'ویرایش کالا':'افزودن کالا به فهرست پیگیری')+'</h3><form id="dpwForm" class="dpw-form"><label>نام کالا<input name="name" required maxlength="100" value="'+esc(x?.name||'')+'" placeholder="مثلاً گوشی سامسونگ A55"></label><label>نام فروشگاه (اختیاری)<input name="store" maxlength="70" value="'+esc(x?.store||'')+'" placeholder="مثلاً دیجی‌کالا"></label><label>لینک صفحه کالا (اختیاری)<input name="url" type="url" value="'+esc(x?.url||'')+'" placeholder="https://..."></label><label>قیمت فعلی (تومان)<input name="current" type="number" min="0" step="1" required value="'+esc(x?.current??'')+'" placeholder="قیمت فعلی"></label><label>قیمت هدف (تومان)<input name="target" type="number" min="0" step="1" required value="'+esc(x?.target??'')+'" placeholder="وقتی قیمت به این عدد رسید"></label><div class="dpw-form-actions"><button type="submit">ذخیره</button><button type="button" data-dpw="cancel">انصراف</button></div></form></div>';
}
function saveForm(form){
 const d=new FormData(form),name=String(d.get('name')||'').trim(),current=Number(d.get('current')),target=Number(d.get('target')),url=String(d.get('url')||'').trim();
 if(!name||!Number.isFinite(current)||!Number.isFinite(target)||current<0||target<0)return;
 if(url){try{const u=new URL(url);if(!/^https?:$/.test(u.protocol))throw 0}catch(e){alert('لینک باید با http یا https شروع شود.');return}}
 const a=read(),old=editing?a.find(x=>x.id===editing):null,now=new Date().toLocaleDateString('fa-IR');
 const history=old?.history||[];if(!old||Number(old.current)!==current)history.push({price:current,date:now});
 const item={id:old?.id||('pw-'+Date.now()),name,store:String(d.get('store')||'').trim(),url,current,target,history};
 if(old){const i=a.findIndex(x=>x.id===editing);a[i]=item}else a.unshift(item);
 write(a);editing=null;render();
}
function formUpdate(id){
 const x=read().find(v=>v.id===id);if(!x)return;
 content.innerHTML='<div class="dpw-card"><h3>ثبت قیمت جدید برای '+esc(x.name)+'</h3><form id="dpwForm" class="dpw-form" data-update-id="'+id+'"><label>قیمت جدید (تومان)<input name="current" type="number" min="0" step="1" required value="'+esc(x.current)+'"></label><div class="dpw-form-actions"><button type="submit">ثبت قیمت</button><button type="button" data-dpw="cancel">انصراف</button></div></form></div>';
 const f=$('#dpwForm',content);f.addEventListener('submit',e=>{e.preventDefault();const price=Number(new FormData(f).get('current'));if(!Number.isFinite(price)||price<0)return;const a=read(),v=a.find(z=>z.id===id);if(!v)return;v.current=price;v.history=v.history||[];v.history.push({price,date:new Date().toLocaleDateString('fa-IR')});write(a);render()},{once:true});
}
function history(id){const x=read().find(v=>v.id===id);if(!x)return;const h=(x.history||[]).slice().reverse();content.innerHTML='<div class="dpw-card"><h3>تاریخچه قیمت · '+esc(x.name)+'</h3>'+(h.length?h.map(v=>'<div class="dpw-meta" style="padding:9px 0;border-bottom:1px solid var(--dy-border)">'+esc(v.date)+' · <b>'+money(v.price)+'</b></div>').join(''):'<div class="dpw-empty">هنوز تغییری ثبت نشده است.</div>')+'<button class="dpw-add" style="margin-top:14px" data-dpw="cancel">بازگشت به فهرست</button></div>'}
window.DigiYarPriceWatchOpen=open;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();