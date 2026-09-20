/* DigiYar V7 — Hamyar Path A: live store-page search surface */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const input=$('hmyarInput'), form=$('hmyarForm'), status=$('hmyarStatus'), stores=$('hmyarStores'), results=$('hmyarResults');
  if(!input||!form||!status||!stores||!results)return;

  const style=document.createElement('style');
  style.id='hmyar-v7-style';
  style.textContent=`
  .hmyar-card{width:min(100%,760px);margin-left:auto;margin-right:auto}
  .hmyar-form{display:flex;gap:8px;align-items:stretch}
  .hmyar-form input{flex:1;min-width:0;min-height:48px;padding:10px 13px;border:1px solid var(--border);border-radius:12px;outline:0;background:#f7f9fc;color:var(--text);font-size:14px}
  .hmyar-form input:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 3px rgba(25,118,210,.1)}
  .hmyar-form button{min-width:125px;border:0;border-radius:12px;color:#fff;font-weight:800;background:linear-gradient(135deg,var(--blue),var(--blue2))}
  .hmyar-status{margin-top:10px;padding:9px 11px;border-radius:10px;background:#f5f7fa;color:var(--soft);font-size:11px}
  .hmyar-status.loading{background:#eef4fb;color:var(--blue2)}
  .hmyar-status.ok{background:#edf8f1;color:#176b3a}
  .hmyar-status.warn{background:#fff7e8;color:#8a5a00}
  .hmyar-stores{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
  .hmyar-store{padding:8px 9px;border:1px solid var(--border);border-radius:10px;background:#fff;font-size:10px}
  .hmyar-store strong{display:block;color:var(--navy);font-size:11px}
  .hmyar-store span{display:block;margin-top:2px;color:var(--soft)}
  .hmyar-store.ok{border-color:#b8dfc7}.hmyar-store.fail{border-color:#f1c5c5}.hmyar-store.empty{border-color:#e5e7eb}
  .hmyar-results{display:grid;gap:10px;margin-top:14px}
  .hmyar-result{display:grid;grid-template-columns:72px 1fr auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--border);border-radius:13px;background:#fff}
  .hmyar-rank{width:72px;height:72px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#f5f7fa;color:var(--blue2);font-weight:900;font-size:13px}
  .hmyar-result h3{margin:0;color:var(--navy);font-size:12px;line-height:1.7}
  .hmyar-meta{margin-top:3px;color:var(--soft);font-size:10px;line-height:1.7}
  .hmyar-price{margin-top:3px;color:var(--red);font-size:12px;font-weight:900}
  .hmyar-reason{margin-top:3px;color:#334155;font-size:10px}
  .hmyar-link{display:inline-flex;padding:8px 10px;border-radius:9px;background:var(--red);color:#fff;font-size:10px;font-weight:800;white-space:nowrap}
  @media(max-width:560px){.hmyar-form{flex-direction:column}.hmyar-form button{min-height:46px}.hmyar-stores{grid-template-columns:1fr 1fr}.hmyar-result{grid-template-columns:52px 1fr}.hmyar-rank{width:52px;height:52px}.hmyar-link{grid-column:1/-1;text-align:center;justify-content:center}}
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toman=n=>{const x=Number(n);return Number.isFinite(x)&&x>0?new Intl.NumberFormat('fa-IR').format(Math.round(x))+' تومان':'قیمت نامشخص'};
  function renderStores(list){
    stores.innerHTML=(Array.isArray(list)?list:[]).map(s=>{
      const cls=s.status==='ok'?'ok':s.status==='empty'?'empty':'fail';
      const label=s.status==='ok'?'داده پیدا شد':s.status==='empty'?'داده‌ای پیدا نشد':'دسترسی ناموفق';
      return '<div class="hmyar-store '+cls+'"><strong>'+esc(s.name)+'</strong><span>'+esc(label)+(s.count?' • '+esc(s.count)+' مورد':'')+'</span></div>';
    }).join('');
  }
  function renderResults(list){
    results.innerHTML=(Array.isArray(list)?list:[]).slice(0,3).map((p,i)=>{
      const reason=p.reason||'ارتباط بیشتر با عبارت جست‌وجو و داده استخراج‌شده از صفحه فروشگاه';
      const href=p.affiliateUrl||p.productUrl||'#';
      const affiliate=Boolean(p.affiliateUrl);
      return '<article class="hmyar-result"><div class="hmyar-rank">انتخاب '+(i+1)+'</div><div><h3>'+esc(p.name||'محصول بدون نام')+'</h3><div class="hmyar-meta">'+esc(p.storeName||p.store||'فروشگاه')+(p.availability?' • '+esc(p.availability):'')+(affiliate?' • مسیر خرید افیلیت':'')+'</div><div class="hmyar-price">'+toman(p.priceToman||p.price)+'</div><div class="hmyar-reason">دلیل: '+esc(reason)+'</div></div><a class="hmyar-link" data-affiliate-click="'+(affiliate?'1':'0')+'" href="'+esc(href)+'" target="_blank" rel="noopener">'+(affiliate?'خرید از فروشگاه':'مشاهده محصول')+'</a></article>';
    }).join('');
  }
  async function affiliateFallback(q){
    try{
      const r=await fetch('https://digiyar-v6.petromosi.workers.dev/api/search?q='+encodeURIComponent(q),{headers:{Accept:'application/json'}});
      if(!r.ok)return [];
      const d=await r.json();
      const campaigns={digikala:'https://aflo.ir/TrvNHEN8',snappshop:'https://aflo.ir/YPN05dL7'};
      return Array.isArray(d.results)?d.results.map(p=>{
        if(!p||p.affiliateUrl)return p;
        const sid=String(p.storeId||p.store||'').toLowerCase();
        const base=campaigns[sid];
        const url=p.productUrl||'';
        return base&&url?{...p,affiliateUrl:base+'?p='+encodeURIComponent(url)}:p;
      }).filter(p=>p&&p.affiliateUrl):[];
    }catch{return []}
  }
  async function run(q){
    status.className='hmyar-status loading'; status.textContent='هم‌یار در حال بررسی صفحات زنده فروشگاه‌هاست...';
    stores.innerHTML=''; results.innerHTML='';
    try{
      const r=await fetch('https://digiyar-v6.petromosi.workers.dev/api/hmyar?q='+encodeURIComponent(q),{headers:{Accept:'application/json'}});
      const d=await r.json();
      if(!r.ok||!d.success)throw new Error(d.error||'خطا در موتور هم‌یار');
      renderStores(d.stores);
      let finalResults=Array.isArray(d.results)?d.results:[];
      if(finalResults.length<3){
        const affiliateResults=await affiliateFallback(q);
        const seen=new Set(finalResults.map(p=>String(p.productUrl||p.affiliateUrl||p.name||'')));
        for(const p of affiliateResults){
          const key=String(p.productUrl||p.affiliateUrl||p.name||'');
          if(!key||seen.has(key))continue;
          seen.add(key); finalResults.push({...p,reason:'پیشنهاد قابل‌خرید از مسیر افیلیت دیجی‌یار.'});
          if(finalResults.length>=3)break;
        }
      }
      renderResults(finalResults);
      if(finalResults.length){
        status.className='hmyar-status ok';
        status.textContent='هم‌یار '+finalResults.length+' نتیجه قابل‌استفاده را پیدا کرد؛ گزینه‌های قابل‌خرید با مسیر افیلیت هم فعال‌اند.';
      }else{
        status.className='hmyar-status warn';
        status.textContent='نتیجه زنده کافی نبود؛ دیجی‌یار مسیر پیشنهاد افیلیت را هم بررسی کرد اما گزینه قابل‌خریدی پیدا نشد.';
      }
    }catch(e){
      status.className='hmyar-status warn';
      status.textContent='موتور هم‌یار فعلاً به هسته زنده متصل نشد: '+(e.message||e);
    }
  }
  form.addEventListener('submit',e=>{e.preventDefault();const q=String(input.value||'').trim();if(q)run(q);});
})();
