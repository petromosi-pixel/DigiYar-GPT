/* DigiYar V7 — User-selected product comparison UI
 * Comparison is opt-in: the user enters up to 3 product names.
 * Matching is performed only against the current V7 Product Result Set.
 * No fetch, API, resolver, catalog lookup, or store query.
 */
(function(window, document){
  'use strict';
  const VERSION='7.0.0-comparison-ui.8';

  function esc(value){
    return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function toman(value){
    const n=Number(value);
    if(!Number.isFinite(n)||n<=0)return '—';
    return new Intl.NumberFormat('fa-IR').format(n)+' تومان';
  }
  function norm(v){
    return String(v==null?'':'').replace(/[يى]/g,'ی').replace(/ك/g,'ک')
      .replace(/[‌\u200c]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
  }
  function productText(p){
    return norm([p&&p.name,p&&p.brand,p&&p.model,p&&p.subcategory].filter(Boolean).join(' '));
  }
  function installStyle(){
    if(document.getElementById('v7-comparison-ui-style'))return;
    const s=document.createElement('style');
    s.id='v7-comparison-ui-style';
    s.textContent=`
      #v7ComparisonCard{display:block;margin:3mm 0 0;padding:13px;border:1px solid rgba(42,65,105,.14);border-radius:16px;background:var(--card-bg,#fff);box-sizing:border-box}
      #v7ComparisonCard .v7c-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      #v7ComparisonCard .v7c-title{margin:0;font-size:15px;font-weight:800}
      #v7ComparisonCard .v7c-note{margin:3px 0 0;font-size:11px;opacity:.68}
      #v7ComparisonCard .v7c-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
      #v7ComparisonCard .v7c-field{width:100%;height:38px;padding:0 10px;border:1px solid rgba(42,65,105,.16);border-radius:10px;background:var(--input-bg,#fff);color:inherit;box-sizing:border-box;font:inherit;font-size:11px;outline:none}
      #v7ComparisonCard .v7c-field:focus{border-color:rgba(42,65,105,.42)}
      #v7ComparisonCard .v7c-actions{display:flex;align-items:center;gap:8px;margin-top:8px}
      #v7ComparisonCard .v7c-btn{height:36px;padding:0 14px;border:0;border-radius:10px;cursor:pointer;font:inherit;font-size:11px;font-weight:800}
      #v7ComparisonCard .v7c-btn-primary{background:#ef7d00;color:#fff}
      #v7ComparisonCard .v7c-btn-secondary{background:rgba(42,65,105,.08);color:inherit}
      #v7ComparisonCard .v7c-status{margin:8px 0 0;font-size:11px;opacity:.72}
      #v7ComparisonCard .v7c-table-wrap{width:100%;overflow-x:auto;border-radius:12px}
      #v7ComparisonCard table{width:100%;min-width:520px;border-collapse:collapse;font-size:12px}
      #v7ComparisonCard th,#v7ComparisonCard td{padding:9px 8px;border-bottom:1px solid rgba(42,65,105,.10);text-align:right;vertical-align:top}
      #v7ComparisonCard th{font-weight:800;white-space:nowrap}
      #v7ComparisonCard td.v7c-product{font-weight:700;min-width:150px}
      #v7ComparisonCard .v7c-store{display:block;margin-top:3px;font-size:10px;font-weight:500;opacity:.65}
      #v7ComparisonCard .v7c-cheapest{font-weight:800}
      #v7ComparisonCard .v7c-section{margin:14px 0 7px;font-size:12px;font-weight:800}
      #v7ComparisonCard .v7c-spec{width:100%;border-collapse:collapse;font-size:11px}
      #v7ComparisonCard .v7c-spec th,#v7ComparisonCard .v7c-spec td{padding:7px 6px;border-bottom:1px solid rgba(42,65,105,.08)}
      #v7ComparisonCard .v7c-empty{font-size:11px;opacity:.65;margin:8px 0 0}
      #v7ComparisonCard .v7c-link{display:inline-block;margin-top:4px;font-size:10px;text-decoration:none}
      @media(max-width:600px){#v7ComparisonCard{padding:11px;border-radius:14px}#v7ComparisonCard .v7c-fields{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }
  function ensureMount(){
    let mount=document.getElementById('v7ComparisonMount');
    const simulator=document.getElementById('v6StoreSimulatorResults');
    if(!mount){
      mount=document.createElement('div'); mount.id='v7ComparisonMount';
      mount.style.display='block'; mount.style.width='100%'; mount.style.boxSizing='border-box';
    }
    if(simulator&&simulator.parentNode){
      if(mount.parentElement!==simulator.parentElement||mount.previousElementSibling!==simulator)
        simulator.parentNode.insertBefore(mount,simulator.nextSibling);
      return mount;
    }
    const form=document.getElementById('v5SmartSearchForm');
    if(form&&form.parentNode){
      if(mount.parentElement!==form.parentNode||mount.previousElementSibling!==form)
        form.parentNode.insertBefore(mount,form.nextSibling);
      return mount;
    }
    return mount;
  }
  function ensureCard(){
    const mount=ensureMount(); if(!mount)return null;
    let card=document.getElementById('v7ComparisonCard');
    if(!card){card=document.createElement('section');card.id='v7ComparisonCard';card.setAttribute('aria-label','مقایسه محصولات');}
    if(card.parentElement!==mount)mount.appendChild(card);
    return card;
  }
  function selectedProducts(){
    const source=window.DigiYarV7ProductResultSource;
    if(!source)return [];
    if(typeof source.getComparisonProducts==='function')return source.getComparisonProducts()||[];
    return [];
  }
  function currentProducts(){
    const source=window.DigiYarV7ProductResultSource;
    if(!source||typeof source.get!=='function')return [];
    const snap=source.get();
    return snap&&Array.isArray(snap.products)?snap.products:[];
  }
  function matchProduct(input,products,used){
    const q=norm(input);
    if(!q)return null;
    let exact=products.find(p=>!used.has(p.id)&&norm(p.name)===q);
    if(exact)return exact;
    const tokens=q.split(/\s+/).filter(x=>x.length>1);
    const scored=products.map(p=>{
      if(used.has(p.id))return {p,score:-1};
      const t=productText(p);
      if(!tokens.every(x=>t.includes(x)))return {p,score:-1};
      let score=t.includes(q)?20:0;
      tokens.forEach(x=>{if(t.includes(x))score+=3;});
      return {p,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    return scored.length?scored[0].p:null;
  }
  function productColumns(products){
    return products.map(p=>'<th scope="col" class="v7c-product">'+esc(p.name)+
      (p.store?'<span class="v7c-store">'+esc(p.store)+'</span>':'')+
      (p.productUrl?'<a class="v7c-link" href="'+esc(p.productUrl)+'" target="_blank" rel="noopener noreferrer">مشاهده محصول</a>':'')+'</th>').join('');
  }
  function row(label,values){
    return '<tr><th scope="row">'+esc(label)+'</th>'+values.map(v=>'<td>'+esc(v||'—')+'</td>').join('')+'</tr>';
  }
  function renderComparison(comparison,selectedNames){
    const card=ensureCard(); if(!card)return;
    selectedNames=Array.isArray(selectedNames)?selectedNames:[];
    let controls='<div class="v7c-head"><div><h3 class="v7c-title">🔎 مقایسه محصولات</h3><p class="v7c-note">محصول را از فروشگاه به دیجی‌یار بفرست یا نام حداکثر ۳ محصول را وارد کن</p></div></div>';
    controls+='<div class="v7c-fields"><input class="v7c-field" data-v7-compare-input="1" value="'+esc(selectedNames[0]||'')+'" placeholder="محصول اول" autocomplete="off"><input class="v7c-field" data-v7-compare-input="2" value="'+esc(selectedNames[1]||'')+'" placeholder="محصول دوم" autocomplete="off"><input class="v7c-field" data-v7-compare-input="3" value="'+esc(selectedNames[2]||'')+'" placeholder="محصول سوم" autocomplete="off"></div>';
    controls+='<div class="v7c-actions"><button type="button" class="v7c-btn v7c-btn-primary" id="v7CompareRun">مقایسه کن</button><button type="button" class="v7c-btn v7c-btn-secondary" id="v7CompareClear">پاک کردن</button></div>';
    if(!comparison){
      card.innerHTML=controls+'<p class="v7c-status">محصولات مورد نظرت را از نتایج همین جستجو انتخاب کن.</p>';
      return;
    }
    card.innerHTML=controls+renderTable(comparison);
  }
  function renderTable(comparison){
    if(!comparison||comparison.status!=='comparison_ready'||comparison.count<2)
      return '<p class="v7c-status">برای مقایسه، حداقل ۲ محصول مرتبط از نتایج فعلی را وارد کن. حداکثر ۳ محصول قابل مقایسه است.</p>';
    const products=comparison.products||[];
    const cheapest=new Set((comparison.priceComparison&&comparison.priceComparison.cheapestIds)||[]);
    let html='<div class="v7c-table-wrap"><table><thead><tr><th>شاخص</th>'+productColumns(products)+'</tr></thead><tbody>';
    html+='<tr><th>قیمت</th>'+products.map(p=>'<td>'+(cheapest.has(p.id)?'<strong>'+esc(toman(p.priceToman))+'</strong>':esc(toman(p.priceToman)))+'</td>').join('')+'</tr>';
    html+=row('فروشگاه',products.map(p=>p.store||'—'));
    if(comparison.matchComparison&&comparison.matchComparison.available)html+=row('میزان تطابق',products.map(p=>p.matchScore==null?'—':String(p.matchScore)));
    html+='</tbody></table></div>';
    const specs=(comparison.specificationComparison||[]).filter(s=>s.presentCount>=2);
    if(specs.length){
      html+='<div class="v7c-section">مشخصات قابل مقایسه</div><div class="v7c-table-wrap"><table class="v7c-spec"><thead><tr><th>مشخصه</th>'+products.map(p=>'<th>'+esc(p.name)+'</th>').join('')+'</tr></thead><tbody>';
      specs.forEach(spec=>{html+='<tr><th>'+esc(spec.label)+'</th>'+products.map(p=>{const found=(spec.valuesByProduct||[]).find(v=>v.productId===p.id);return '<td>'+esc(found&&found.value?found.value:'—')+'</td>';}).join('')+'</tr>';});
      html+='</tbody></table></div>';
    }else html+='<p class="v7c-empty">برای مشخصات، دادهٔ مشترک و قابل مقایسه‌ای در نتایج فعلی وجود ندارد.</p>';
    return html;
  }
  function runComparison(){
    const card=ensureCard(); if(!card)return;
    const inputs=Array.from(card.querySelectorAll('[data-v7-compare-input]'));
    const values=inputs.map(x=>x.value.trim()).filter(Boolean).slice(0,3);
    const stored=selectedProducts().slice(0,3),products=currentProducts(),used=new Set(),selected=stored.slice();
    stored.forEach(p=>used.add(p.id));
    values.forEach(v=>{if(selected.length>=3)return;const p=matchProduct(v,products,used);if(p){selected.push(p);used.add(p.id);}});
    const engine=window.DigiYarComparisonEngine||window.DigiYarV7Comparison;
    if(!engine||typeof engine.compare!=='function')return;
    const result=engine.compare(selected.slice(0,3),{limit:3});
    const unmatched=values.length-selected.length;
    const controls=card.querySelector('.v7c-status');
    card.innerHTML=card.innerHTML.replace(/<div class="v7c-table-wrap">[\s\S]*$/,'')||card.innerHTML;
    renderComparison(result,selected.slice(0,3).map(function(p){return p.name;}));
    if(unmatched){
      const status=card.querySelector('.v7c-status');
      if(status)status.textContent='فقط محصولاتی از همین Result Set قابل مقایسه‌اند؛ '+unmatched+' مورد با نام واردشده پیدا نشد.';
    }
    inputs.forEach((el,i)=>{if(values[i])el.value=values[i];});
  }
  function bindCard(){
    const card=ensureCard(); if(!card)return;
    if(card.dataset.bound==='1')return;
    card.dataset.bound='1';
    card.addEventListener('click',function(e){
      if(e.target.id==='v7CompareRun')runComparison();
      if(e.target.id==='v7CompareClear'){
        const inputs=card.querySelectorAll('[data-v7-compare-input]');
        inputs.forEach(x=>x.value='');
        const source=window.DigiYarV7ProductResultSource;if(source&&source.clearComparison)source.clearComparison();
        renderComparison(null,[]);
      }
    });
  }
  function refresh(){
    const card=ensureCard(); if(!card)return;
    bindCard();
    if(!card.querySelector('[data-v7-compare-input]'))renderComparison(null,[]);
  }
  function watchAnchor(){
    if(window.__DigiYarComparisonSimulatorObserver)return;
    const root=document.body;if(!root||!window.MutationObserver)return;
    const observer=new MutationObserver(function(){
      const mount=document.getElementById('v7ComparisonMount'),sim=document.getElementById('v6StoreSimulatorResults');
      if(mount&&sim&&sim.parentNode&&mount.previousElementSibling!==sim)sim.parentNode.insertBefore(mount,sim.nextSibling);
      refresh();
    });
    observer.observe(root,{childList:true,subtree:true});
    window.__DigiYarComparisonSimulatorObserver=observer;
  }
  function init(){
    installStyle(); refresh(); watchAnchor();
    window.addEventListener('digiyar:v7-product-results-ready',refresh);
    window.addEventListener('digiyar:v7-product-results',refresh);
    window.addEventListener('digiyar:shopping-plan-ready',refresh);
    window.addEventListener('digiyar:v7-comparison-selection-ready',refresh);
  }
  window.DigiYarV7ComparisonUI={version:VERSION,refresh:refresh,run:runComparison};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window,document);
