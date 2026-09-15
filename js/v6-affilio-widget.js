/* DigiYar V6 — Affilio widgets: titles rendered outside loader hosts */
(function(){'use strict';
const PRIMARY_BOX='affilio-widget-06db7440-629f-407d-b01e-063c5067d341';
const SECONDARY_BOX='affilio-widget-a8433d31-25ee-4567-b4a2-36493e660dd0';
const PRIMARY_ID='06db7440-629f-407d-b01e-063c5067d341';
const SECONDARY_ID='a8433d31-25ee-4567-b4a2-36493e660dd0';
const PRIMARY_MORE='https://aflo.ir/g746KjMA';
const SECONDARY_MORE='https://aflo.ir/60QfyVuQ';

function titleNode(text){
  const el=document.createElement('div');
  el.className='v6-affilio-widget-title';
  el.textContent=text;
  el.setAttribute('role','heading');
  el.setAttribute('aria-level','2');
  return el;
}
function moreNode(url){
  const a=document.createElement('a');
  a.className='v6-affilio-more';
  a.href=url;
  a.target='_blank';
  a.rel='noopener noreferrer sponsored';
  a.textContent='نمایش محصولات بیشتر ⬅️';
  a.setAttribute('aria-label','نمایش محصولات بیشتر');
  return a;
}
function loader(box,id){
  if(!box)return;
  const s=document.createElement('script');
  s.async=true;
  s.src='https://static.affilio.ir/static/loader.js';
  s.dataset.widgetId=id;
  s.dataset.containerId=box.id;
  box.appendChild(s);
}
function buildCard(title,id,boxId,moreUrl,secondary){
  const card=document.createElement('section');
  card.className='v6-affilio-widget-card'+(secondary?' v6-affilio-secondary-card':'');
  const titleEl=titleNode(title);
  const box=document.createElement('div');
  box.id=boxId;
  box.className='v6-affilio-widget-host';
  const more=moreNode(moreUrl);
  card.appendChild(titleEl);
  card.appendChild(box);
  card.appendChild(more);
  return {card,box,id};
}
function style(){
  document.getElementById('v6-affilio-restored-style')?.remove();
  const s=document.createElement('style');
  s.id='v6-affilio-restored-style';
  s.textContent=`
.v6-affilio-widget-card{display:block!important;visibility:visible!important;box-sizing:border-box!important;width:100%!important;margin:0 0 18px!important;padding:9px 14px!important;min-height:0!important;height:auto!important;overflow:visible!important;background:#fff!important;border:1px solid #e3e8f0!important;border-radius:18px!important;box-shadow:0 8px 25px rgba(16,28,53,.08)!important;text-align:center!important}
.v6-affilio-secondary-card{margin-top:0!important}
.v6-affilio-widget-title{display:block!important;visibility:visible!important;opacity:1!important;position:static!important;width:100%!important;height:auto!important;min-height:24px!important;margin:0 0 8px!important;padding:0!important;color:#111827!important;font-family:inherit!important;font-size:19px!important;font-weight:800!important;line-height:1.45!important;text-align:center!important;text-shadow:none!important;-webkit-text-stroke:0!important;overflow:visible!important;clip:auto!important;white-space:normal!important}
.v6-affilio-widget-host{display:flex!important;visibility:visible!important;width:100%!important;max-width:100%!important;min-height:30px!important;margin:0!important;padding:4px 2px 6px!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:6px!important;-webkit-overflow-scrolling:touch!important;scroll-snap-type:x proximity!important;touch-action:pan-x!important}
.v6-affilio-widget-host>*{flex:0 0 auto!important;box-sizing:border-box!important;scroll-snap-align:start!important}
.v6-affilio-more{display:flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;min-height:42px!important;margin:4px 2px 0!important;padding:9px 12px!important;border:1px solid #dbe3ee!important;border-radius:12px!important;background:#f7f9fc!important;color:#2a4169!important;font-family:inherit!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;text-align:center!important;text-decoration:none!important;cursor:pointer!important}
.v6-affilio-more:hover{background:#eef3fa!important}
body.v6-dark .v6-affilio-widget-card{background:#111827!important;border-color:#334155!important;box-shadow:0 8px 22px rgba(0,0,0,.28)!important}
body.v6-dark .v6-affilio-widget-title{color:#fff!important}
body.v6-dark .v6-affilio-more{background:#172033!important;border-color:#334155!important;color:#fff!important}
@media(max-width:430px){.v6-affilio-widget-card{padding:8px 11px!important}.v6-affilio-widget-title{font-size:19px!important}.v6-affilio-more{font-size:11px!important}}
`;
  document.head.appendChild(s);
}
function init(){
  const host=document.getElementById('affilioWidgetCard');
  if(!host)return;
  document.querySelectorAll('script[data-widget-id="cc87472c-40f0-4844-ab85-cbf1eb4cb3cc"]').forEach(s=>s.remove());
  document.getElementById('affilio-widget-cc87472c-40f0-4844-ab85-cbf1eb4cb3cc')?.remove();
  document.getElementById('affilioWidgetCardSecondary')?.remove();
  host.innerHTML='';
  host.className='v6-affilio-widget-root';
  host.removeAttribute('aria-hidden');
  style();

  const primary=buildCard('بوی ماهِ مدرسه',PRIMARY_ID,PRIMARY_BOX,PRIMARY_MORE,false);
  const secondary=buildCard('بیشترین تخفیف دخترانه و پسرانه',SECONDARY_ID,SECONDARY_BOX,SECONDARY_MORE,true);
  host.appendChild(primary.card);
  host.appendChild(secondary.card);
  loader(primary.box,PRIMARY_ID);
  loader(secondary.box,SECONDARY_ID);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();