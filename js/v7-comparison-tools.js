/* DigiYar V7 — comparison decision tools */
(function(window,document){
'use strict';
const VERSION='7.0.0-comparison-tools.1';
function src(){return window.DigiYarV7ProductResultSource}
function products(){const s=src(),x=s&&s.get?s.get():null;return x&&Array.isArray(x.products)?x.products:[]}
function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
function norm(v){return String(v||'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک')}
function store(p){return p.store||p.seller||p.sourceStore||'فروشگاه نامشخص'}
function price(p){return n(p.priceToman||p.price)}
function fit(p){return n(p.matchScore||p.score||p.relevanceScore)}
function popularity(p){return n(p.salesCount||p.orders||p.reviewCount||p.reviews||p.ratingCount||p.popularity)}
function getCategory(){
 const s=src(),x=s&&s.get?s.get():null;return norm(x&&x.query||'');
}
function choose(mode,list){
 const a=list.slice();
 if(mode==='cheap')return a.sort((x,y)=>(price(x)||Infinity)-(price(y)||Infinity));
 if(mode==='popular')return a.sort((x,y)=>popularity(y)-popularity(x)||fit(y)-fit(x));
 return a.sort((x,y)=>fit(y)-fit(x)||popularity(y)-popularity(x));
}
function render(){
 const host=document.getElementById('v7ComparisonTools');if(!host)return;
 const list=products(), mode=host.dataset.mode||'fit';
 const q=getCategory();
 const shown=choose(mode,list).slice(0,8);
 host.innerHTML='<div class="v7ct-head"><strong>انتخاب از میان نتایج فروشگاه‌ها</strong><span>فیلتر: '+(mode==='cheap'?'ارزان‌ترین':mode==='popular'?'پرفروش‌ترین':'متناسب‌ترین')+'</span></div>'+
 '<div class="v7ct-buttons"><button data-v7ct="fit" class="'+(mode==='fit'?'active':'')+'">متناسب‌ترین</button><button data-v7ct="cheap" class="'+(mode==='cheap'?'active':'')+'">ارزان‌ترین</button><button data-v7ct="popular" class="'+(mode==='popular'?'active':'')+'">پرفروش‌ترین</button></div>'+
 '<div class="v7ct-list">'+(shown.length?shown.map((p,i)=>'<div class="v7ct-item"><span class="v7ct-rank">'+(i+1)+'</span><div><b>'+String(p.name||'محصول').replace(/[<>&"]/g,'')+'</b><small>'+String(store(p)).replace(/[<>&"]/g,'')+' · '+(price(p)?new Intl.NumberFormat('fa-IR').format(price(p))+' تومان':'قیمت نامشخص')+'</small></div></div>').join(''):'<div class="v7ct-empty">برای این جست‌وجو نتیجه فروشگاهی کافی در دسترس نیست.</div>')+'</div>'+
 '<div class="v7ct-foot">'+(q?'نتایج بر اساس داده‌های موجود دیجی‌یار برای همین جست‌وجو مرتب شده‌اند.':'')+'</div>';
}
function ensure(){
 let h=document.getElementById('v7ComparisonTools');if(h)return h;
 const c=document.getElementById('v7ComparisonCard');if(!c)return null;
 h=document.createElement('section');h.id='v7ComparisonTools';h.dataset.mode='fit';
 h.innerHTML='';
 c.appendChild(h);
 h.addEventListener('click',e=>{const b=e.target.closest('[data-v7ct]');if(!b)return;h.dataset.mode=b.dataset.v7ct;render()});
 return h;
}
function style(){
 if(document.getElementById('v7ct-style'))return;
 const s=document.createElement('style');s.id='v7ct-style';s.textContent='#v7ComparisonTools{margin-top:14px;padding-top:12px;border-top:1px solid rgba(42,65,105,.12)}#v7ComparisonTools .v7ct-head{text-align:center;font-size:12px}.v7ct-head span{display:block;margin-top:3px;font-size:10px;opacity:.62}.v7ct-buttons{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:9px 0}.v7ct-buttons button{border:0;border-radius:9px;padding:7px 11px;background:rgba(42,65,105,.08);color:inherit;font:inherit;font-size:10px;font-weight:800}.v7ct-buttons button.active{background:#ef7d00;color:#fff}.v7ct-list{display:grid;gap:6px}.v7ct-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:rgba(42,65,105,.045)}.v7ct-rank{min-width:22px;text-align:center;font-weight:900}.v7ct-item b{font-size:11px}.v7ct-item small{display:block;font-size:10px;opacity:.65;margin-top:2px}.v7ct-empty,.v7ct-foot{text-align:center;font-size:10px;opacity:.62;margin-top:7px}';document.head.appendChild(s)
}
function refresh(){style();const h=ensure();if(h)render()}
window.DigiYarV7ComparisonTools={version:VERSION,refresh,render};
})(window,document);