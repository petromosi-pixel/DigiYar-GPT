(function(){
  'use strict';
  const params = new URLSearchParams(window.location.search);
  if (params.get('hooshyarCompare') !== '1') return;

  const style = document.createElement('style');
  style.textContent = `
    #hooshyarComparePanel{direction:rtl;text-align:right;margin:14px 0;padding:16px;border:1px solid #b9c8df;border-radius:14px;background:#f7f9fc;color:#17243a;font:14px/1.7 system-ui,sans-serif}
    #hooshyarComparePanel *{box-sizing:border-box}
    #hooshyarComparePanel h2{font-size:17px;margin:0 0 6px}
    #hooshyarComparePanel p{margin:4px 0 10px}
    #hooshyarComparePanel .hc-controls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}
    #hooshyarComparePanel input,#hooshyarComparePanel select,#hooshyarComparePanel button{font:inherit;border:1px solid #bac6d7;border-radius:9px;padding:9px;background:#fff;color:inherit;min-width:0}
    #hooshyarComparePanel button{background:#244b83;color:#fff;border:0;cursor:pointer}
    #hooshyarComparePanel button:disabled{opacity:.6;cursor:wait}
    #hooshyarComparePanel .hc-meta{font-size:12px;color:#4b5c73}
    #hooshyarComparePanel .hc-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
    #hooshyarComparePanel .hc-col{border:1px solid #d7dfeb;background:#fff;border-radius:10px;padding:10px;min-width:0}
    #hooshyarComparePanel .hc-col h3{font-size:14px;margin:0 0 7px}
    #hooshyarComparePanel ol{padding-right:22px;margin:0}
    #hooshyarComparePanel li{overflow-wrap:anywhere;margin:2px 0}
    #hooshyarComparePanel .hc-status{padding:8px 10px;border-radius:8px;background:#e8eef7;margin-top:10px}
    @media(max-width:560px){#hooshyarComparePanel .hc-controls{grid-template-columns:1fr}#hooshyarComparePanel .hc-columns{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function makePanel(){
    const panel=document.createElement('section');
    panel.id='hooshyarComparePanel';
    panel.innerHTML='<h2>آزمایش مقایسهٔ موتورهای هوش‌یار</h2><p>این پنل فقط با پارامتر <code>?hooshyarCompare=1</code> فعال می‌شود و در نمای عادی سایت دیده نمی‌شود.</p><div class="hc-controls"><input id="hcQuery" type="text" value="کیف اداری برای محل کارم می‌خوام" aria-label="عبارت فارسی آزمایش"><select id="hcProvider" aria-label="موتور معنایی"><option value="deepseek">DeepSeek API (اختیاری)</option><option value="openrouter">OpenRouter (اختیاری)</option></select><button id="hcRun" type="button">مقایسهٔ دو روش</button></div><p class="hc-meta">موتور محلی سه‌گانه رایگان است. پاسخ واقعی مدل فقط در صورت تنظیم کلید سمت سرور نمایش داده می‌شود؛ در غیر این صورت پنل صریحاً وضعیت را اعلام می‌کند.</p><div id="hcStatus" class="hc-status" role="status">برای شروع، یک عبارت فارسی را آزمایش کن.</div><div class="hc-columns"><section class="hc-col"><h3>روش ۱ — سه موتور محلی</h3><div id="hcLocal">هنوز اجرا نشده است.</div></section><section class="hc-col"><h3 id="hcAiTitle">روش ۲ — DeepSeek</h3><div id="hcAi">هنوز اجرا نشده است.</div></section></div>';
    return panel;
  }
  function esc(value){return String(value==null?'':value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function renderStores(host,ids,catalog){
    if(!Array.isArray(ids)||!ids.length){host.textContent='هیچ فروشگاهی انتخاب نشد.';return;}
    const names=ids.map(id=>(catalog[id]&&catalog[id].name)||id);
    host.innerHTML='<p class="hc-meta">تعداد فروشگاه‌ها: '+ids.length+'</p><ol>'+names.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ol>';
  }
  function renderAi(host,ai,catalog){
    if(!ai){host.textContent='پاسخ معنایی از API دریافت نشد؛ احتمالاً کلید API تنظیم نیست، سرویس در دسترس نیست یا درخواست ناموفق بوده است. این نتیجه را نباید خروجی DeepSeek حساب کرد.';return;}
    const plan=ai.plan||{};
    host.innerHTML='<p class="hc-meta">ارائه‌دهندهٔ پاسخ: '+esc(ai.provider||'نامشخص')+'</p>';
    const list=document.createElement('div');
    renderStores(list,plan.eligibleStoreIds,catalog);
    host.appendChild(list);
  }
  function attach(){
    const target=document.getElementById('digiyarConversation')||document.querySelector('main.app-shell');
    if(!target||!window.DigiYarShoppingOrchestrator||typeof window.DigiYarShoppingOrchestrator.compareEngines!=='function')return false;
    if(document.getElementById('hooshyarComparePanel'))return true;
    const panel=makePanel();
    target.appendChild(panel);
    const input=panel.querySelector('#hcQuery'),provider=panel.querySelector('#hcProvider'),button=panel.querySelector('#hcRun');
    provider.value=window.DigiYarHooshyarAIProvider||'deepseek';
    provider.addEventListener('change',()=>{window.DigiYarHooshyarAIProvider=provider.value;panel.querySelector('#hcAiTitle').textContent='روش ۲ — '+(provider.value==='deepseek'?'DeepSeek':'OpenRouter');});
    button.addEventListener('click',async()=>{
      const query=input.value.trim();
      if(!query){panel.querySelector('#hcStatus').textContent='ابتدا عبارت فارسی را وارد کن.';return;}
      window.DigiYarHooshyarAIProvider=provider.value;
      button.disabled=true;button.textContent='در حال مقایسه…';
      panel.querySelector('#hcStatus').textContent='موتور محلی اجرا شد؛ در انتظار پاسخ API (حداکثر حدود ۱۰ ثانیه)…';
      panel.querySelector('#hcLocal').textContent='در حال آماده‌سازی…';
      panel.querySelector('#hcAi').textContent='در حال بررسی اتصال…';
      try{
        const result=await window.DigiYarShoppingOrchestrator.compareEngines(query);
        const catalog=window.DigiYarShoppingOrchestrator.buildStoreCatalog();
        const localPlan=result.local&&result.local.plan;
        renderStores(panel.querySelector('#hcLocal'),localPlan&&localPlan.candidateStores||[],catalog);
        renderAi(panel.querySelector('#hcAi'),result.ai,catalog);
        const aiProvider=result.ai&&result.ai.provider;
        panel.querySelector('#hcStatus').textContent='کاتالوگ در دسترس: '+result.catalogCount+' شناسه. '+(aiProvider?'پاسخ ارائه‌دهندهٔ معنایی دریافت شد؛ فهرست‌ها را با نیاز واقعی مقایسه کن.':'پاسخ واقعی مدل دریافت نشد؛ فعلاً فقط روش محلی قابل ارزیابی است.');
      }catch(error){
        panel.querySelector('#hcStatus').textContent='خطا در اجرای مقایسه: '+String(error&&error.message||error);
        panel.querySelector('#hcAi').textContent='اجرای مقایسه کامل نشد.';
      }finally{button.disabled=false;button.textContent='مقایسهٔ دو روش';}
    });
    return true;
  }
  let attempts=0;
  const timer=setInterval(()=>{attempts++;if(attach()||attempts>=30)clearInterval(timer);},250);
  if(document.readyState!=='loading')attach();
  else document.addEventListener('DOMContentLoaded',attach,{once:true});
})();