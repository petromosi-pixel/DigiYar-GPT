/* DigiYar V7 — comparison UI / product intake */
(function(window,document){
'use strict';
const VERSION='7.0.0-comparison-ui.13';
const MAX=3;
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function norm(v){return String(v==null?'':v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();}
function toman(v){const n=Number(v);return Number.isFinite(n)&&n>0?new Intl.NumberFormat('fa-IR').format(n)+' تومان':'—';}
function source(){return window.DigiYarV7ProductResultSource;}
function selected(){const s=source();return s&&s.getComparisonProducts?s.getComparisonProducts().slice(0,MAX):[];}
function current(){const s=source(),x=s&&s.get?s.get():null;return x&&Array.isArray(x.products)?x.products:[];}
function producer(){return window.DigiYarV7ProductResultProducer;}
function storeFromUrl(url){try{const h=new URL(url).hostname.replace(/^www\./,'');if(h.includes('digikala'))return 'دیجی‌کالا';if(h.includes('snappshop'))return 'اسنپ‌شاپ';if(h.includes('torob'))return 'ترب';if(h.includes('basalam'))return 'باسلام';if(h.includes('technolife'))return 'تکنولایف';return h||'فروشگاه';}catch(_){return 'فروشگاه';}}
function nameFromUrl(url){try{const u=new URL(url);let s=(u.pathname.split('/').filter(Boolean).pop()||'').replace(/[-_]+/g,' ');s=decodeURIComponent(s).replace(/\b\d{5,}\b/g,'').replace(/\s+/g,' ').trim();return s||u.hostname.replace(/^www\./,'');}catch(_){return String(url||'').trim();}}
function normalizeDigits(v){return String(v||'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/,/g,'').replace(/٬/g,'');}
function numeric(v){const m=normalizeDigits(v).match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;}
function findLocal(name){const q=norm(name);if(!q)return null;const list=current();let p=list.find(x=>norm(x.name||x.title)===q);if(p)return p;const toks=q.split(/\s+/).filter(x=>x.length>1);let best=null,score=0;list.forEach(x=>{const t=norm([x.name,x.brand,x.model].filter(Boolean).join(' '));let s=t.includes(q)?20:0;toks.forEach(k=>{if(t.includes(k))s+=3;});if(s>score){score=s;best=x;}});return best&&score>=6?best:null;}
async function enrich(name,url,store){
 let p=findLocal(name);
 const pr=producer();
 if(!p&&pr&&typeof pr.findByName==='function'){try{const a=await pr.findByName(name,{limit:5});p=(a||[])[0]||null;}catch(_){}}
 if(p)return Object.assign({},p,{productUrl:p.productUrl||url,store:p.store||store,source:p.source||'comparison-link'});
 return {id:'link|'+url,name:name||url,productUrl:url,store:store,source:'comparison-link',priceToman:0,price:0,currency:'IRT'};
}
function installStyle(){
 if(document.getElementById('v7-comparison-ui-style'))return;
 const s=document.createElement('style');s.id='v7-comparison-ui-style';
 s.textContent=`
 #v7ComparisonShareGuide{display:block;margin:3mm 0 0;padding:10px 12px;border:1px solid rgba(42,65,105,.14);border-radius:14px;background:var(--card-bg,#fff);color:inherit;box-sizing:border-box;text-align:center;font-size:13px;line-height:1.9}
 #v7ComparisonShareGuide .v7-guide-title{color:#d93025;font-weight:800}
 #v7ComparisonShareGuide .v7-guide-text{opacity:.68;font-weight:400}
 #v7ComparisonCard{display:block;margin:3mm 0 0;padding:13px;border:1px solid rgba(42,65,105,.14);border-radius:16px;background:var(--card-bg,#fff);color:var(--text-color,#172033);box-sizing:border-box;box-shadow:0 3px 14px rgba(20,35,60,.06)}
 body.v6-dark #v7ComparisonShareGuide,html.dark #v7ComparisonShareGuide,body.dark #v7ComparisonShareGuide,[data-theme="dark"] #v7ComparisonShareGuide,body.v6-dark #v7ComparisonCard,html.dark #v7ComparisonCard,body.dark #v7ComparisonCard,[data-theme="dark"] #v7ComparisonCard{background:#121c2d;color:#f8fafc;border-color:rgba(255,255,255,.15);box-shadow:0 4px 18px rgba(0,0,0,.30)}
 #v7ComparisonCard .v7c-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
 #v7ComparisonCard .v7c-title{margin:0;font-size:15px;font-weight:800}
 #v7ComparisonCard .v7c-note{margin:3px 0 0;font-size:11px;opacity:.68}
 #v7ComparisonCard .v7c-add{display:block;margin:0 auto;height:38px;padding:0 18px;border:0;border-radius:11px;background:#ef7d00;color:#fff;cursor:pointer;font:inherit;font-size:12px;font-weight:800}
 #v7ComparisonCard .v7c-slot{margin-top:8px;padding:9px;border:1px solid rgba(42,65,105,.12);border-radius:12px}
 body.v6-dark #v7ComparisonCard .v7c-slot,html.dark #v7ComparisonCard .v7c-slot,body.dark #v7ComparisonCard .v7c-slot,[data-theme="dark"] #v7ComparisonCard .v7c-slot{background:#0c1524;border-color:rgba(255,255,255,.14)}
 #v7ComparisonCard .v7c-slot-head{display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;margin-bottom:7px}
 #v7ComparisonCard .v7c-remove{border:0;background:transparent;color:#d93025;font:inherit;cursor:pointer}
 #v7ComparisonCard .v7c-field{width:100%;height:38px;padding:0 10px;border:1px solid rgba(42,65,105,.16);border-radius:10px;background:var(--input-bg,#fff);color:inherit;box-sizing:border-box;font:inherit;font-size:11px;outline:none}
 body.v6-dark #v7ComparisonCard .v7c-field,html.dark #v7ComparisonCard .v7c-field,body.dark #v7ComparisonCard .v7c-field,[data-theme="dark"] #v7ComparisonCard .v7c-field{background:#0c1524;color:#f8fafc;border-color:rgba(255,255,255,.18)}
 #v7ComparisonCard .v7c-slot-actions,#v7ComparisonCard .v7c-actions{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}
 #v7ComparisonCard .v7c-btn{height:34px;padding:0 13px;border:0;border-radius:10px;cursor:pointer;font:inherit;font-size:11px;font-weight:800}
 #v7ComparisonCard .v7c-btn-primary{background:#ef7d00;color:#fff}
 #v7ComparisonCard .v7c-btn-secondary{background:rgba(42,65,105,.08);color:inherit}
 body.v6-dark #v7ComparisonCard .v7c-btn-secondary,html.dark #v7ComparisonCard .v7c-btn-secondary,body.dark #v7ComparisonCard .v7c-btn-secondary,[data-theme="dark"] #v7ComparisonCard .v7c-btn-secondary{background:rgba(255,255,255,.10);color:#f8fafc}
 #v7ComparisonCard .v7c-status{margin:8px 0 0;font-size:11px;opacity:.72;text-align:center}
 #v7ComparisonCard .v7c-table-wrap{width:100%;overflow-x:auto;border-radius:12px}
 #v7ComparisonCard table{width:100%;min-width:520px;border-collapse:collapse;font-size:12px}
 #v7ComparisonCard th,#v7ComparisonCard td{padding:9px 8px;border-bottom:1px solid rgba(42,65,105,.10);text-align:right;vertical-align:top}
 body.v6-dark #v7ComparisonCard th,body.v6-dark #v7ComparisonCard td,html.dark #v7ComparisonCard th,html.dark #v7ComparisonCard td,body.dark #v7ComparisonCard th,body.dark #v7ComparisonCard td,[data-theme="dark"] #v7ComparisonCard th,[data-theme="dark"] #v7ComparisonCard td{border-color:rgba(255,255,255,.12)}
 #v7ComparisonCard .v7c-product{font-weight:700;min-width:150px}
 #v7ComparisonCard .v7c-store{display:block;margin-top:3px;font-size:10px;font-weight:500;opacity:.65}
 #v7ComparisonCard .v7c-section{margin:14px 0 7px;font-size:12px;font-weight:800}
 #v7ComparisonCard .v7c-spec{width:100%;border-collapse:collapse;font-size:11px}
 #v7ComparisonCard .v7c-spec th,#v7ComparisonCard .v7c-spec td{padding:7px 6px;border-bottom:1px solid rgba(42,65,105,.08)}
 #v7ComparisonCard .v7c-best{color:#18a558!important;font-weight:900}
 #v7ComparisonCard .v7c-check{display:inline-block;margin-inline-start:4px;font-weight:900}
 #v7ComparisonCard .v7c-empty{font-size:11px;opacity:.65;margin:8px 0;text-align:center}
 @media(max-width:600px){#v7ComparisonCard{padding:11px;border-radius:14px}}
 `;document.head.appendChild(s);
}
function ensureMount(){
 let m=document.getElementById('v7ComparisonMount'),sim=document.getElementById('v6StoreSimulatorResults');
 if(!m){m=document.createElement('div');m.id='v7ComparisonMount';m.style.width='100%';m.style.boxSizing='border-box';}
 if(sim&&sim.parentNode){if(m.parentElement!==sim.parentElement||m.previousElementSibling!==sim)sim.parentNode.insertBefore(m,sim.nextSibling);return m;}
 return m;
}
function ensureGuide(){
 let g=document.getElementById('v7ComparisonShareGuide');if(g)return g;
 g=document.createElement('section');g.id='v7ComparisonShareGuide';g.setAttribute('aria-label','راهنمای انجام مقایسه');
 g.innerHTML='<span class="v7-guide-title">راهنمای انجام مقایسه:</span> <span class="v7-guide-text">بعد از جستجوی محصول مورد نظر، وارد صفحه اون محصول در یکی از فروشگاه های سربرگ شو، اشتراک گذاری و دیجی یار رو انتخاب و ارسال کن تا محصول بصورت خودکار در کادر مقایسه اینجا درج بشه.</span>';
 return g;
}
function ensureCard(){
 const m=ensureMount();if(!m)return null;let c=document.getElementById('v7ComparisonCard');
 if(!c){c=document.createElement('section');c.id='v7ComparisonCard';c.setAttribute('aria-label','مقایسه محصولات');}
 if(c.parentElement!==m)m.appendChild(c);return c;
}
function slotMarkup(i,p){
 const name=p&&p.name?p.name:'';const url=p&&p.productUrl?p.productUrl:'';
 return '<div class="v7c-slot" data-slot="'+i+'"><div class="v7c-slot-head"><span>محصول '+['اول','دوم','سوم'][i-1]+'</span><button type="button" class="v7c-remove" data-v7-remove="'+i+'">حذف</button></div><input class="v7c-field" data-v7-url="'+i+'" value="'+esc(url)+'" placeholder="لینک صفحه محصول فروشگاه"><div class="v7c-slot-actions"><button type="button" class="v7c-btn v7c-btn-primary" data-v7-fetch="'+i+'">دریافت اطلاعات محصول</button><button type="button" class="v7c-btn v7c-btn-secondary" data-v7-paste="'+i+'">چسباندن لینک</button></div><div class="v7c-status" data-v7-slot-status="'+i+'">'+(name?'✓ '+esc(name):'لینک محصول را وارد کن')+'</div></div>';
}
function renderControls(){
 const c=ensureCard();if(!c)return;
 const picked=selected();let html='<div class="v7c-head"><div><h3 class="v7c-title">🔎 مقایسه محصولات</h3><p class="v7c-note">برای هر محصول، لینک صفحه فروشگاه را وارد کن یا از Share استفاده کن.</p></div></div>';
 html+='<button type="button" class="v7c-add" id="v7AddCompareProduct">＋ افزودن محصول برای مقایسه</button><div id="v7CompareSlots"></div>';
 const slots=document.getElementById('v7CompareSlots');
 c.innerHTML=html;const wrap=c.querySelector('#v7CompareSlots');
 picked.forEach((p,i)=>{wrap.insertAdjacentHTML('beforeend',slotMarkup(i+1,p));});
 if(picked.length>=MAX)c.querySelector('#v7AddCompareProduct').style.display='none';
 if(picked.length>=2)wrap.insertAdjacentHTML('beforeend','<div class="v7c-actions"><button type="button" class="v7c-btn v7c-btn-primary" id="v7CompareRun">مقایسه تخصصی</button><button type="button" class="v7c-btn v7c-btn-secondary" id="v7CompareClear">پاک کردن</button></div>');
}
function productCols(products){return products.map(p=>'<th scope="col" class="v7c-product">'+esc(p.name)+(p.store?'<span class="v7c-store">'+esc(p.store)+'</span>':'')+(p.productUrl?'<a href="'+esc(p.productUrl)+'" target="_blank" rel="noopener noreferrer">مشاهده محصول</a>':'')+'</th>').join('');}
function bestIds(products,label){
 const nums=products.map(p=>({p,n:numeric((p.specs&&Object.values(p.specs).find(s=>norm(s.key).includes(norm(label))))?.value)})).filter(x=>x.n!==null);
 if(nums.length<2)return new Set();
 const low=/قیمت|وزن|مصرف|ضخامت|زمان پاسخ|تاخیر|دمای/i.test(label);const target=low?Math.min(...nums.map(x=>x.n)):Math.max(...nums.map(x=>x.n));
 return new Set(nums.filter(x=>x.n===target).map(x=>x.p.id));
}
function renderTable(comparison){
 if(!comparison||comparison.status!=='comparison_ready'||comparison.count<2)return '<p class="v7c-empty">حداقل ۲ محصول برای مقایسه لازم است.</p>';
 const ps=comparison.products||[];let h='<div class="v7c-table-wrap"><table><thead><tr><th>شاخص</th>'+productCols(ps)+'</tr></thead><tbody>';
 const prices=ps.map(p=>p.priceToman||0).filter(Boolean),min=prices.length?Math.min(...prices):0;
 h+='<tr><th>قیمت</th>'+ps.map(p=>'<td class="'+(p.priceToman&&p.priceToman===min?'v7c-best':'')+'">'+esc(toman(p.priceToman))+(p.priceToman&&p.priceToman===min?'<span class="v7c-check">✓</span>':'')+'</td>').join('')+'</tr>';
 h+='<tr><th>فروشگاه</th>'+ps.map(p=>'<td>'+esc(p.store||'—')+'</td>').join('')+'</tr>';
 const specs=comparison.specificationComparison||[];
 specs.forEach(s=>{const ids=bestIds(ps,s.label);h+='<tr><th>'+esc(s.label)+'</th>'+ps.map(p=>{const f=(s.valuesByProduct||[]).find(v=>v.productId===p.id);const best=ids.has(p.id);return '<td class="'+(best?'v7c-best':'')+'">'+esc(f&&f.value?f.value:'—')+(best?'<span class="v7c-check">✓</span>':'')+'</td>';}).join('')+'</tr>';});
 h+='</tbody></table></div>';
 return h;
}
async function fetchSlot(i){
 const c=ensureCard(),input=c&&c.querySelector('[data-v7-url="'+i+'"]'),status=c&&c.querySelector('[data-v7-slot-status="'+i+'"]');if(!input)return;
 const url=input.value.trim();if(!/^https?:\/\//i.test(url)){if(status)status.textContent='لینک معتبر محصول را وارد کن.';return;}
 if(status)status.textContent='در حال دریافت اطلاعات…';
 const p=await enrich(nameFromUrl(url),url,storeFromUrl(url));const s=source();if(s&&s.addComparisonProduct)s.addComparisonProduct(p);
 renderControls();const st=document.querySelector('[data-v7-slot-status="'+i+'"]');if(st)st.textContent='✓ اطلاعات محصول ثبت شد: '+p.name;
}
async function pasteSlot(i){
 try{const text=await navigator.clipboard.readText();const el=document.querySelector('[data-v7-url="'+i+'"]');if(el){el.value=text;fetchSlot(i);}}catch(_){const st=document.querySelector('[data-v7-slot-status="'+i+'"]');if(st)st.textContent='اجازه دسترسی به کلیپ‌بورد داده نشد؛ لینک را دستی وارد کن.';}
}
async function runComparison(){
 const s=source(),ps=selected();if(!s||ps.length<2)return;
 const e=window.DigiYarComparisonEngine||window.DigiYarV7Comparison;if(!e)return;
 const result=e.compare(ps,{limit:3});const c=ensureCard();renderControls();
 const wrap=document.createElement('div');wrap.innerHTML=renderTable(result);c.appendChild(wrap.firstChild);
}
function clearComparison(){const s=source();if(s&&s.clearComparison)s.clearComparison();renderControls();}
function addSlot(){
 const c=ensureCard(),wrap=c&&c.querySelector('#v7CompareSlots');if(!wrap)return;
 const n=wrap.querySelectorAll('.v7c-slot').length;if(n>=MAX)return;
 wrap.insertAdjacentHTML('beforeend',slotMarkup(n+1,null));
 const b=c.querySelector('#v7AddCompareProduct');if(n+1>=MAX)b.style.display='none';
}
function bind(){
 const c=ensureCard();if(!c||c.dataset.bound==='1')return;c.dataset.bound='1';
 c.addEventListener('click',e=>{
   const t=e.target;
   if(t.id==='v7AddCompareProduct')addSlot();
   else if(t.dataset.v7Fetch)fetchSlot(Number(t.dataset.v7Fetch));
   else if(t.dataset.v7Paste)pasteSlot(Number(t.dataset.v7Paste));
   else if(t.dataset.v7Remove){const idx=Number(t.dataset.v7Remove)-1;const ps=selected();const s=source();if(s&&s.removeComparisonProduct&&ps[idx])s.removeComparisonProduct(ps[idx].id);renderControls();}
   else if(t.id==='v7CompareRun')runComparison();
   else if(t.id==='v7CompareClear')clearComparison();
 });
}
function place(){
 const sim=document.getElementById('v6StoreSimulatorResults');if(!sim||!sim.parentNode)return;
 const parent=sim.parentNode;const g=ensureGuide(),m=ensureMount();
 if(g.parentNode!==parent||g.previousElementSibling!==sim)parent.insertBefore(g,sim.nextSibling);
 if(m.parentNode!==parent||m.previousElementSibling!==g)parent.insertBefore(m,g.nextSibling);
}
function refresh(){place();renderControls();bind();}
function watch(){if(window.__DigiYarComparisonSimulatorObserver)return;const root=document.body;if(!root)return;let pending=false;const o=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;place();});});o.observe(root,{childList:true,subtree:true});window.__DigiYarComparisonSimulatorObserver=o;}
function init(){installStyle();refresh();watch();window.addEventListener('digiyar:v7-product-results-ready',refresh);window.addEventListener('digiyar:v7-product-results',refresh);window.addEventListener('digiyar:v7-comparison-selection-ready',refresh);}
window.DigiYarV7ComparisonUI={version:VERSION,refresh,run:runComparison};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window,document);