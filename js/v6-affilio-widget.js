/* DigiYar V6 — Affilio widget: title, CTA, dark mode + reliable automatic/user carousel */
(function(){'use strict';
const ID='affilio-widget-cc87472c-40f0-4844-ab85-cbf1eb4cb3cc';
const MORE_URL='https://aflo.ir/g746KjMA';
const INTERVAL=3600;
const RESUME_DELAY=4200;
let state=null;

function root(){return document.getElementById(ID)}
function productSelectors(){return ['[class*="product-card"]','[class*="product-item"]','[class*="ProductCard"]','[class*="ProductItem"]']}
function getCards(r){
  let found=[];
  for(const s of productSelectors()) found.push(...r.querySelectorAll(s));
  return [...new Set(found)].filter(el=>el instanceof HTMLElement&&el.offsetWidth>30&&el.offsetHeight>30);
}
function scrollCandidates(r){
  const all=[r,...r.querySelectorAll('*')];
  return all.filter(el=>el instanceof HTMLElement&&el.scrollWidth>el.clientWidth+8&&el.clientWidth>80);
}
function findScroller(r,items){
  const candidates=scrollCandidates(r);
  if(!candidates.length)return null;
  return candidates.map(el=>{
    const count=items.filter(card=>el.contains(card)).length;
    const overflow=el.scrollWidth-el.clientWidth;
    return {el,count,overflow,area:el.clientWidth*el.clientHeight};
  }).sort((a,b)=>(b.count-a.count)||(b.overflow-a.overflow)||(a.area-b.area))[0].el;
}
function installUi(r){
  if(!document.getElementById('v6-affilio-enhanced-style')){
    const style=document.createElement('style');
    style.id='v6-affilio-enhanced-style';
    style.textContent=`
      .v6-affilio-widget-card .v6-affilio-campaign-title{display:block!important;margin:1px 0 5px!important;padding:0!important;color:#f7941d!important;font-size:20px!important;font-weight:1000!important;line-height:1.15!important;text-align:center!important;-webkit-text-stroke:10px #000!important;paint-order:stroke fill!important;text-shadow:none!important;animation:v6AffilioTitleAttention .95s steps(2,end) infinite!important;position:relative!important;z-index:4!important}
      @keyframes v6AffilioTitleAttention{0%,100%{transform:translateX(-4px) scale(1);color:#f7941d}20%{transform:translateX(5px) scale(1.08);color:#ffb52e}40%{transform:translateX(-6px) scale(.98);color:#ff7a00}60%{transform:translateX(5px) scale(1.06);color:#ffb52e}80%{transform:translateX(-4px) scale(1.02);color:#f7941d}}
      .v6-affilio-widget-card .v6-affilio-more{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;box-sizing:border-box!important;margin:5px 0 1px!important;padding:7px 10px!important;border:1px solid #334b73!important;border-radius:10px!important;background:#eef3fa!important;color:#2a4169!important;font-size:11px!important;font-weight:900!important;line-height:1.2!important;text-decoration:none!important;cursor:pointer!important;position:relative!important;z-index:5!important}
      .v6-affilio-widget-card .v6-affilio-more:hover{background:#e2eaf6!important}
      .v6-affilio-widget-card .v6-affilio-more:focus{outline:2px solid #f7941d!important;outline-offset:1px!important}
      .v6-dark .v6-affilio-widget-card{background:#111827!important;border-color:#334155!important;box-shadow:0 8px 24px rgba(0,0,0,.28)!important}
      .v6-dark .v6-affilio-widget-card .v6-affilio-more{background:#172033!important;border-color:#4b638a!important;color:#f1f5f9!important;box-shadow:0 4px 12px rgba(0,0,0,.22)!important}
      .v6-dark .v6-affilio-widget-card .v6-affilio-more:hover{background:#22304a!important}
      .v6-dark .v6-affilio-widget-card .v6-affilio-campaign-title{color:#ffad32!important;-webkit-text-stroke:10px #000!important}
      .v6-affilio-widget-card .v6-affilio-scroller{scroll-behavior:smooth!important;scroll-snap-type:x proximity!important;scrollbar-width:thin!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-x!important}
    `;
    document.head.appendChild(style);
  }
  const card=r.closest('.v6-affilio-widget-card');
  if(!card)return;
  const old=card.querySelector('.v6-affilio-campaign-title');
  if(!old){
    const title=document.createElement('div');
    title.className='v6-affilio-campaign-title';
    title.textContent='بوی ماهِ مدرسه';
    card.insertBefore(title,card.firstChild);
  }
  const oldMore=card.querySelector('.v6-affilio-more');
  if(!oldMore){
    const more=document.createElement('a');
    more.className='v6-affilio-more';
    more.href=MORE_URL;
    more.target='_blank';
    more.rel='noopener noreferrer sponsored';
    more.textContent='نمایش محصولات بیشتر';
    card.appendChild(more);
  }
  const hiddenHeading=card.querySelector('h2');
  const hiddenText=card.querySelector(':scope>p');
  if(hiddenHeading)hiddenHeading.style.display='none';
  if(hiddenText)hiddenText.style.display='none';
}
function setup(){
  const r=root();
  if(!r)return false;
  installUi(r);
  const items=getCards(r);
  if(items.length<2)return false;
  const scroller=findScroller(r,items);
  if(!scroller)return false;
  scroller.classList.add('v6-affilio-scroller');
  scroller.style.overflowX='auto';
  scroller.style.overflowY='hidden';
  scroller.style.scrollBehavior='smooth';
  items.forEach(x=>{x.style.scrollSnapAlign='start'});
  if(state&&state.scroller===scroller){state.items=items;return true}
  if(state){clearInterval(state.timer);clearTimeout(state.resume)}
  const s={scroller,items,timer:null,resume:null,manual:false,index:0};
  state=s;
  const restart=()=>{
    clearInterval(s.timer);
    s.timer=setInterval(()=>{
      if(s.manual)return;
      const live=getCards(r).filter(el=>scroller.contains(el));
      if(live.length<2)return;
      s.items=live;
      s.index=(s.index+1)%live.length;
      const target=live[s.index];
      const sr=scroller.getBoundingClientRect();
      const tr=target.getBoundingClientRect();
      const delta=tr.left-sr.left;
      const max=Math.max(0,scroller.scrollWidth-scroller.clientWidth);
      let left=scroller.scrollLeft+delta-2;
      if(s.index===0||left>=max-4)left=0;
      scroller.scrollTo({left:Math.max(0,Math.min(max,left)),behavior:'smooth'});
    },INTERVAL);
  };
  const pause=()=>{
    s.manual=true;
    clearInterval(s.timer);
    clearTimeout(s.resume);
    s.resume=setTimeout(()=>{s.manual=false;restart()},RESUME_DELAY);
  };
  ['pointerdown','touchstart','mouseenter','focusin','wheel'].forEach(ev=>scroller.addEventListener(ev,pause,{passive:true}));
  ['touchend','pointerup','mouseleave','focusout'].forEach(ev=>scroller.addEventListener(ev,()=>{
    clearTimeout(s.resume);
    s.resume=setTimeout(()=>{s.manual=false;restart()},RESUME_DELAY);
  },{passive:true}));
  restart();
  return true;
}
function boot(){
  let tries=0;
  const observer=new MutationObserver(()=>{if(tries++<120)setup()});
  observer.observe(document.body,{childList:true,subtree:true});
  const tick=()=>{if(!setup()&&tries++<120)setTimeout(tick,500)};
  tick();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();