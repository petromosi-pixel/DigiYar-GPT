/* DigiYar V7 — Comparison UI
 * Renders a comparison card from the existing V7 Product Result Set only.
 * No fetch, API, resolver, catalog lookup, or store query.
 */
(function(window, document){
  'use strict';

  const VERSION='7.0.0-comparison-ui.1';

  function esc(value){
    return String(value==null?'':value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function toman(value){
    const n=Number(value);
    if(!Number.isFinite(n)||n<=0)return '—';
    return new Intl.NumberFormat('fa-IR').format(n)+' تومان';
  }

  function installStyle(){
    if(document.getElementById('v7-comparison-ui-style'))return;
    const style=document.createElement('style');
    style.id='v7-comparison-ui-style';
    style.textContent=`
      #v7ComparisonCard{display:none;margin:10px 0 0;padding:14px;border:1px solid rgba(42,65,105,.14);border-radius:16px;background:var(--card-bg,#fff);box-sizing:border-box}
      #v7ComparisonCard.is-ready{display:block}
      #v7ComparisonCard .v7c-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      #v7ComparisonCard .v7c-title{margin:0;font-size:15px;font-weight:800}
      #v7ComparisonCard .v7c-note{margin:0;font-size:11px;opacity:.68}
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
      #v7ComparisonCard .v7c-empty{font-size:11px;opacity:.65;margin:0}
      #v7ComparisonCard .v7c-link{display:inline-block;margin-top:4px;font-size:10px;text-decoration:none}
      @media(max-width:600px){
        #v7ComparisonCard{padding:11px;border-radius:14px}
        #v7ComparisonCard table{min-width:460px}
      }
    `;
    document.head.appendChild(style);
  }

  function host(){
    return document.getElementById('v5InlineResults') ||
      document.getElementById('digiyar-products') ||
      document.getElementById('digiyarConversation');
  }

  function ensureCard(){
    let card=document.getElementById('v7ComparisonCard');
    const h=host();
    if(!h)return null;
    if(!card){
      card=document.createElement('section');
      card.id='v7ComparisonCard';
      card.setAttribute('aria-label','مقایسه محصولات');
      h.appendChild(card);
    }else if(card.parentElement!==h){
      h.appendChild(card);
    }
    return card;
  }

  function productColumns(products){
    return products.map(function(p){
      return '<th scope="col" class="v7c-product">'+esc(p.name)+
        (p.store?'<span class="v7c-store">'+esc(p.store)+'</span>':'')+
        (p.productUrl?'<a class="v7c-link" href="'+esc(p.productUrl)+'" target="_blank" rel="noopener noreferrer">مشاهده محصول</a>':'')+
        '</th>';
    }).join('');
  }

  function row(label,values,klass){
    return '<tr><th scope="row">'+esc(label)+'</th>'+
      values.map(function(v){return '<td class="'+(klass||'')+'">'+esc(v||'—')+'</td>';}).join('')+
      '</tr>';
  }

  function render(comparison){
    const card=ensureCard();
    if(!card)return;
    if(!comparison||comparison.status!=='comparison_ready'||comparison.count<2){
      card.classList.remove('is-ready');
      card.innerHTML='';
      return;
    }

    const products=comparison.products||[];
    const cheapest=new Set((comparison.priceComparison&&comparison.priceComparison.cheapestIds)||[]);
    const priceValues=products.map(function(p){
      const value=toman(p.priceToman);
      return cheapest.has(p.id)?'<span class="v7c-cheapest">'+esc(value)+'</span>':esc(value);
    });

    let html='<div class="v7c-head"><div><h3 class="v7c-title">🔎 مقایسه محصولات</h3><p class="v7c-note">بر پایه همان نتایج فعلی هوش‌یار</p></div></div>';
    html+='<div class="v7c-table-wrap"><table><thead><tr><th>شاخص</th>'+productColumns(products)+'</tr></thead><tbody>';
    html+=row('قیمت',priceValues.map(function(v){return v;}),'',true);
    html+=row('فروشگاه',products.map(function(p){return p.store||'—';}));
    if(comparison.matchComparison&&comparison.matchComparison.available){
      html+=row('میزان تطابق',products.map(function(p){
        const v=p.matchScore;
        return v===null||v===undefined?'—':String(v);
      }));
    }
    html+='</tbody></table></div>';

    const specs=(comparison.specificationComparison||[]).filter(function(s){return s.presentCount>=2;});
    if(specs.length){
      html+='<div class="v7c-section">مشخصات قابل مقایسه</div><div class="v7c-table-wrap"><table class="v7c-spec"><thead><tr><th>مشخصه</th>'+products.map(function(p){return '<th>'+esc(p.name)+'</th>';}).join('')+'</tr></thead><tbody>';
      specs.forEach(function(spec){
        html+='<tr><th>'+esc(spec.label)+'</th>'+products.map(function(p){
          const found=(spec.valuesByProduct||[]).find(function(v){return v.productId===p.id;});
          return '<td>'+esc(found&&found.value?found.value:'—')+'</td>';
        }).join('')+'</tr>';
      });
      html+='</tbody></table></div>';
    }else{
      html+='<p class="v7c-empty">برای مشخصات، دادهٔ مشترک و قابل مقایسه‌ای در نتایج فعلی وجود ندارد.</p>';
    }

    html+='<p class="v7c-empty" style="margin-top:10px">کیفیت در این نسخه امتیازدهی نشده؛ چون Result Set فعلی دادهٔ قابل اتکای کیفیت ارائه نمی‌کند.</p>';
    card.innerHTML=html;
    card.classList.add('is-ready');
  }

  function refresh(snapshot){
    const source=window.DigiYarV7ProductResultSource;
    const engine=window.DigiYarComparisonEngine||window.DigiYarV7Comparison;
    if(!engine||typeof engine.compare!=='function')return;
    const products=snapshot&&Array.isArray(snapshot.products)
      ? snapshot.products
      : source&&typeof source.get==='function'
        ? source.get().products
        : [];
    render(engine.compare(products,{limit:products.length}));
  }

  function init(){
    installStyle();
    window.addEventListener('digiyar:v7-product-results',function(event){
      refresh(event&&event.detail);
    });
    const source=window.DigiYarV7ProductResultSource;
    if(source&&typeof source.get==='function')refresh(source.get());
    // The Result Set can be published before the result host exists.
    // Re-read the existing Result Set after the Hooshyar UI has been initialized.
    let tries=0;
    const timer=setInterval(function(){
      tries++;
      const current=window.DigiYarV7ProductResultSource;
      if(current&&typeof current.get==='function'){
        const snapshot=current.get();
        if(snapshot&&Array.isArray(snapshot.products)&&snapshot.products.length>=2){
          refresh(snapshot);
          clearInterval(timer);
          return;
        }
      }
      if(tries>=20)clearInterval(timer);
    },250);
  }

  window.DigiYarV7ComparisonUI={version:VERSION,refresh:refresh,render:render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})(window,document);
