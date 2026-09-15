/* DigiYar V6 — single Affilio home widget */
(function(){'use strict';
const OLD_ID='affilio-widget-cc87472c-40f0-4844-ab85-cbf1eb4cb3cc';
const WIDGET_ID='a8433d31-25ee-4567-b4a2-36493e660dd0';
function init(){
 const host=document.getElementById('affilioWidgetCard');
 if(!host)return;
 document.querySelectorAll('script[data-widget-id="'+OLD_ID+'"]').forEach(s=>s.remove());
 document.getElementById(OLD_ID)?.remove();
 document.getElementById('affilioWidgetCardSecondary')?.remove();
 host.innerHTML='';
 host.className='card v6-affilio-widget-card';
 const section=document.createElement('section');
 section.className='v6-affilio-widget-section';
 const title=document.createElement('h2');
 title.className='v6-affilio-widget-title';
 title.textContent='بوی ماهِ مدرسه';
 const box=document.createElement('div');
 box.id='affilio-widget-'+WIDGET_ID;
 const script=document.createElement('script');
 script.async=true;
 script.src='https://static.affilio.ir/static/loader.js';
 script.dataset.widgetId=WIDGET_ID;
 script.dataset.containerId=box.id;
 section.append(title,box,script);
 host.appendChild(section);
 const style=document.createElement('style');
 style.id='v6-affilio-single-style';
 style.textContent='.v6-affilio-widget-card{box-sizing:border-box!important;width:100%!important;margin:0 0 18px!important;padding:9px 14px!important;min-height:0!important;height:auto!important;overflow:hidden!important;background:#fff!important;border:1px solid #e3e8f0!important;border-radius:18px!important;box-shadow:0 8px 25px rgba(16,28,53,.08)!important;text-align:center!important}.v6-affilio-widget-section{display:block!important;width:100%!important;margin:0!important;padding:0!important;box-sizing:border-box!important}.v6-affilio-widget-title{display:block!important;margin:0!important;padding:0!important;color:#000!important;font-size:19px!important;font-weight:800!important;line-height:1.15!important;text-align:center!important}.v6-affilio-widget-section>div[id^="affilio-widget-"]{width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important}.v6-affilio-widget-card [class*="product-card"],.v6-affilio-widget-card [class*="product-item"],.v6-affilio-widget-card [class*="ProductCard"],.v6-affilio-widget-card [class*="ProductItem"],.v6-affilio-widget-card [data-product-id],.v6-affilio-widget-card [data-product]{box-sizing:border-box!important;flex:0 0 auto!important}@media(max-width:430px){.v6-affilio-widget-card{padding:8px 11px!important}.v6-affilio-widget-title{font-size:19px!important}}body.v6-dark .v6-affilio-widget-card{background:#111827!important;border-color:#334155!important;color:#f8fafc!important}body.v6-dark .v6-affilio-widget-title{color:#fff!important}';
 document.head.appendChild(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();