/* DigiYar V7 — Hamyar Path A: live results + purchase-profile bridge */
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const input=$('hmyarInput'), form=$('hmyarForm'), status=$('hmyarStatus'), results=$('hmyarResults');
  const hint=$('hmyarHint'), clear=$('hmyarClear'), profileForm=$('profileForm'), profileToggle=$('hmyarProfileLiveToggle');
  if(!input||!form||!status||!results)return;

  const style=document.createElement('style');
  style.id='hmyar-v7-style';
  style.textContent=`
  .hmyar-card{width:min(100%,760px);margin:12px auto 0}
  .hmyar-form{display:block}
  .hmyar-field{position:relative;width:100%;min-width:0}
  .hmyar-form input{width:100%;min-height:48px;padding:10px 88px 10px 13px;border:1px solid var(--border);border-radius:12px;outline:0;background:#f7f9fc;color:var(--text);font-size:14px;box-sizing:border-box}
  .hmyar-form input:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 3px rgba(25,118,210,.1)}
  .hmyar-submit{position:absolute!important;right:8px;top:50%;transform:translateY(-50%);width:34px!important;height:34px;min-width:34px!important;padding:6px!important;border:0!important;border-radius:50%!important;background:transparent!important;color:var(--blue2)!important;display:flex;align-items:center;justify-content:center}.hmyar-submit svg{width:21px;height:21px}.hmyar-submit:hover{background:#eef4fb!important}
  .hmyar-hint{position:absolute;inset:0 48px 0 88px;display:flex;align-items:center;pointer-events:none;color:#64748b;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:1;visibility:visible;transition:opacity .18s ease}
  .hmyar-hint.hmyar-brand{color:var(--blue2);font-weight:900}
  .hmyar-hint.hmyar-show{animation:hmyarHintIn .38s ease}
  .hmyar-clear{position:absolute!important;right:48px;top:50%;transform:translateY(-50%);min-width:30px!important;width:30px;height:30px;padding:0;border:0!important;border-radius:50%!important;background:transparent!important;color:#d11!important;font-size:24px!important;line-height:1;display:none}
  .hmyar-clear.visible{display:block}
  .hmyar-status{display:none;margin-top:10px;padding:9px 11px;border-radius:10px;background:#f5f7fa;color:var(--soft);font-size:11px;line-height:1.8}
  .hmyar-status.loading{display:block;background:#eef4fb;color:var(--blue2)}
  .hmyar-status.ok{display:block;background:#edf8f1;color:#176b3a}
  .hmyar-status.warn{display:block;background:#fff7e8;color:#8a5a00}
  .hmyar-results{display:grid;gap:10px;margin-top:14px}
  .hmyar-result{display:grid;grid-template-columns:72px 1fr auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--border);border-radius:13px;background:#fff}
  .hmyar-rank{width:72px;height:72px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#f5f7fa;color:var(--blue2);font-weight:900;font-size:13px}
  .hmyar-result h3{margin:0;color:var(--navy);font-size:12px;line-height:1.7}
  .hmyar-meta{margin-top:3px;color:var(--soft);font-size:10px;line-height:1.7}
  .hmyar-price{margin-top:3px;color:var(--red);font-size:12px;font-weight:900}
  .hmyar-reason{margin-top:3px;color:#334155;font-size:10px}
  .hmyar-link{display:inline-flex;padding:8px 10px;border-radius:9px;background:var(--red);color:#fff;font-size:10px;font-weight:800;white-space:nowrap}
  .hmyar-form input:focus + .hmyar-clear + .hmyar-submit{color:var(--blue2)}
  .v5-hmyar-profile-toggle{display:flex;align-items:center;justify-content:center;gap:8px;margin:9px 0 0;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:#f8fafc;color:var(--text);font-size:11px;cursor:pointer}
  .v5-hmyar-profile-toggle input{accent-color:var(--blue);width:16px;height:16px}
  @keyframes hmyarHintIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  @media(max-width:560px){
    .hmyar-result{grid-template-columns:52px 1fr}.hmyar-rank{width:52px;height:52px}.hmyar-link{grid-column:1/-1;text-align:center;justify-content:center}
  }
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toman=n=>{const x=Number(n);return Number.isFinite(x)&&x>0?new Intl.NumberFormat('fa-IR').format(Math.round(x))+' تومان':'قیمت نامشخص'};

  const hints=[
    '🤝 هم‌یار، همراه زنده‌ی خرید تو',
    'مشخصات خریدتو کامل کن تا هم‌یار برات بگرده',
    'مثلاً گوشی سامسونگ تا ۳۰ میلیون',
    'برند، بودجه و نوع استفاده‌تو بگو',
    'هم‌یار بین فروشگاه‌ها دنبال گزینه مناسب می‌گرده',
    'دنبال چه محصولی می‌گردی؟'
  ];
  let hintIndex=0;
  function renderHint(){
    if(!hint)return;
    hint.textContent=hints[hintIndex];
    hint.classList.remove('hmyar-show');
    void hint.offsetWidth;
    hint.classList.add('hmyar-show');
    hint.classList.toggle('hmyar-brand',hintIndex===0);
  }
  renderHint();
  const hintTimer=setInterval(()=>{
    if(!input.value.trim()){
      hintIndex=(hintIndex+1)%hints.length;
      renderHint();
    }
  },2600);

  function syncHint(){
    const has=!!input.value.trim();
    if(hint){hint.style.opacity=has?'0':'1';hint.style.visibility=has?'hidden':'visible';}
    if(clear)clear.classList.toggle('visible',has);
  }
  input.addEventListener('input',syncHint);
  input.addEventListener('focus',syncHint);
  input.addEventListener('blur',syncHint);
  if(clear)clear.addEventListener('click',()=>{
    input.value='';
    syncHint();
    results.innerHTML='';
    status.className='hmyar-status';
    status.textContent='';
    input.focus();
  });

  function renderResults(list){
    results.innerHTML=(Array.isArray(list)?list:[]).slice(0,3).map((p,i)=>{
      const reason=p.reason||'تطابق مناسب با اطلاعات خرید و داده استخراج‌شده از صفحه فروشگاه';
      const href=p.affiliateUrl||p.productUrl||'#';
      const affiliate=Boolean(p.affiliateUrl);
      return '<article class="hmyar-result"><div class="hmyar-rank">انتخاب '+(i+1)+'</div><div><h3>'+esc(p.name||'محصول بدون نام')+'</h3><div class="hmyar-meta">'+esc(p.storeName||p.store||'فروشگاه')+(p.availability?' • '+esc(p.availability):'')+'</div><div class="hmyar-price">'+toman(p.priceToman||p.price)+'</div><div class="hmyar-reason">'+esc(reason)+'</div></div><a class="hmyar-link" data-affiliate-click="'+(affiliate?'1':'0')+'" href="'+esc(href)+'" target="_blank" rel="noopener">'+(affiliate?'خرید از فروشگاه':'مشاهده محصول')+'</a></article>';
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

  function storeLabel(p){
    const s=String(p?.storeId||p?.store||'').toLowerCase();
    return s==='digikala'||s==='snappshop';
  }

  async function run(q,source='direct'){
    q=String(q||'').trim();
    if(!q)return;
    status.className='hmyar-status loading';
    status.textContent=source==='profile'?'هم‌یار بر اساس پروفایل خریدت در حال پیدا کردن گزینه‌های زنده است...':'هم‌یار در حال پیدا کردن گزینه‌های زنده است...';
    results.innerHTML='';
    try{
      const r=await fetch('https://digiyar-v6.petromosi.workers.dev/api/hmyar?q='+encodeURIComponent(q),{headers:{Accept:'application/json'}});
      const d=await r.json();
      if(!r.ok||!d.success)throw new Error(d.error||'خطا در موتور هم‌یار');
      let finalResults=Array.isArray(d.results)?d.results:[];
      if(finalResults.length<3){
        const affiliateResults=await affiliateFallback(q);
        const seen=new Set(finalResults.map(p=>String(p.productUrl||p.affiliateUrl||p.name||'')));
        for(const p of affiliateResults){
          const key=String(p.productUrl||p.affiliateUrl||p.name||'');
          if(!key||seen.has(key))continue;
          seen.add(key);
          finalResults.push({...p,reason:storeLabel(p)?'گزینه قابل‌خرید از مسیر افیلیت دیجی‌یار.':'گزینه مرتبط با جستجوی تو.'});
          if(finalResults.length>=3)break;
        }
      }
      renderResults(finalResults);
      const hasAffiliate=finalResults.some(p=>Boolean(p.affiliateUrl)&&storeLabel(p));
      const hasOther=finalResults.some(p=>!storeLabel(p));
      if(finalResults.length){
        status.className='hmyar-status ok';
        status.textContent=hasAffiliate
          ?'هم‌یار گزینه‌های زنده را پیدا کرد؛ برای دیجی‌کالا و اسنپ‌شاپ مسیر خرید افیلیت هم فعال است.'
          :hasOther
            ?'هم‌یار چند گزینه مرتبط از فروشگاه‌های موجود پیدا کرد.'
            :'هم‌یار نتیجه قابل‌استفاده‌ای پیدا کرد.';
      }else{
        status.className='hmyar-status warn';
        status.textContent='برای این مشخصات، فعلاً نتیجه زنده قابل‌اتکایی پیدا نشد.';
      }
    }catch(e){
      status.className='hmyar-status warn';
      status.textContent='هم‌یار فعلاً نتوانست نتایج زنده را دریافت کند. دوباره امتحان کن.';
    }
  }

  function profileValue(el){
    if(!el||el.disabled||el.type==='hidden')return '';
    if((el.type==='checkbox'||el.type==='radio')&&!el.checked)return '';
    if(el.tagName==='SELECT'){
      const o=el.options[el.selectedIndex];
      return o&&o.value?String(o.textContent||'').trim():'';
    }
    return String(el.value||'').trim();
  }

  function profileQuery(){
    if(!profileForm)return '';
    const parts=[];
    const store=$('storeSelect'), category=$('v5Category'), budget=$('budgetMax');
    const storeValue=profileValue(store);
    const categoryValue=profileValue(category);
    if(storeValue&&storeValue!=='همه فروشگاه‌های متصل'&&storeValue!=='همه فروشگاه‌های منتخب')parts.push(storeValue);
    if(categoryValue&&categoryValue!=='دسته‌بندی را انتخاب کنید'&&categoryValue!=='همه دسته‌بندی‌ها')parts.push(categoryValue);
    if(budget&&Number(budget.value)>0)parts.push('بودجه تا '+String(Math.round(Number(budget.value)))+' تومان');

    profileForm.querySelectorAll('input,select,textarea').forEach(el=>{
      if(el===store||el===category||el===budget||el.type==='submit'||el.type==='button'||el.type==='reset')return;
      const value=profileValue(el);
      if(!value)return;
      const label=el.closest('label')?.querySelector('span')?.textContent?.trim()||el.getAttribute('aria-label')||'';
      parts.push(label&&label.length<40?label+' '+value:value);
    });
    return parts.join(' ').replace(/s+/g,' ').trim();
  }

  function bindProfile(){
    if(!profileForm)return;
    let lastProfileRun=0;
    const launchProfileSearch=()=>{
      if(!profileToggle?.checked)return;
      const now=Date.now();
      if(now-lastProfileRun<500)return;
      const q=profileQuery();
      if(!q)return;
      lastProfileRun=now;
      input.value=q;
      syncHint();
      run(q,'profile');
      setTimeout(()=>$('hmyarCard')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
    };
    profileForm.addEventListener('submit',()=>setTimeout(launchProfileSearch,30));
    const profileSubmit=profileForm.querySelector('button[type="submit"]');
    if(profileSubmit)profileSubmit.addEventListener('click',()=>setTimeout(launchProfileSearch,30));
  }  bindProfile();

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const q=String(input.value||'').trim();
    if(q)run(q,'direct');
  });
  syncHint();
})();
