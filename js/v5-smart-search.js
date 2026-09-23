/* DigiYar V6 — Hooshyar UI bridge to the simulated store browser */
(function(){
'use strict';
const hints=[
{text:'سلام دوست من، اسم من هوش‌یار هست؛ چی می‌خوای بخری؟',mood:'greet'},
{text:'مثلاً گوشی سامسونگ، شیائومی یا آیفون رو برات پیدا می‌کنم.',mood:'idea'},
{text:'دنبال لپ‌تاپ مناسب می‌گردی؟ من کمکت می‌کنم.',mood:'think'},
{text:'اسم محصولت رو بگو تا دنبالش بگردم.',mood:'search'},
{text:'هر چی می‌خوای بنویس؛ من بررسیش می‌کنم.',mood:'ready'},
{text:'نیازت رو بگو؛ من قدم‌به‌قدم راهنماییت می‌کنم.',mood:'help'}
];
let i=0,timer;
function installCardStyle(){if(document.getElementById('v6-hooshyar-card-style'))return;const s=document.createElement('style');s.id='v6-hooshyar-card-style';s.textContent=`
.v5-smart-search-field{position:relative!important;overflow:hidden!important}
.v5-smart-search-field #v5SmartSearchHint.v7-hooshyar-hint{display:block!important;position:absolute!important;right:48px!important;left:48px!important;top:50%!important;transform:translateY(-50%)!important;width:auto!important;height:34px!important;margin:0!important;padding:0!important;box-sizing:border-box!important;text-align:right!important;font-size:12px!important;font-weight:600!important;white-space:nowrap!important;overflow:hidden!important;z-index:2!important;pointer-events:none!important;color:#7f8da3!important}
.v7-hooshyar-hint-inner{position:relative!important;display:block!important;width:100%!important;height:34px!important;margin:0!important;padding:0!important;direction:rtl!important;box-sizing:border-box!important;overflow:hidden!important}
.v7-hooshyar-hint-text{position:absolute!important;right:8px!important;left:8px!important;top:50%!important;display:block!important;width:auto!important;max-width:none!important;transform:translate(8px,-50%)!important;overflow:hidden!important;text-overflow:clip!important;white-space:nowrap!important;visibility:visible!important;opacity:1!important;color:inherit!important;animation:v7HooshyarSpeak .65s cubic-bezier(.22,.61,.36,1) forwards!important}
.v7-hooshyar-robot-zone{position:absolute!important;right:8px!important;left:auto!important;top:50%!important;width:40px!important;height:40px!important;display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;z-index:5!important;pointer-events:none!important;transform:translateY(-50%)!important;animation:v7BotFloat 3.8s ease-in-out infinite!important}
.v7-hooshyar-robot-zone img{display:block!important;width:36px!important;height:36px!important;object-fit:contain!important;overflow:visible!important}
.v7-hooshyar-action-zone{position:absolute!important;left:8px!important;right:auto!important;top:50%!important;width:40px!important;height:40px!important;transform:translateY(-50%)!important;display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;z-index:5!important;pointer-events:auto!important}
.v7-hooshyar-action-zone .v5-smart-search-submit,.v7-hooshyar-action-zone .v5-smart-search-clear{position:static!important;display:flex!important;align-items:center!important;justify-content:center!important;width:40px!important;height:40px!important;margin:0!important;padding:0!important;box-sizing:border-box!important;border:0!important;border-radius:10px!important;flex:none!important;background:transparent!important;transform:none!important}
.v7-hooshyar-action-zone .v5-smart-search-submit[hidden],.v7-hooshyar-action-zone .v5-smart-search-clear[hidden]{display:none!important}
.v7-hooshyar-action-zone .v5-smart-search-submit svg{width:24px!important;height:24px!important}
.v7-hooshyar-action-zone .v5-smart-search-clear{font-size:18px!important;line-height:1!important}
@keyframes v7BotFloat{0%,100%{transform:translateY(-50%)}50%{transform:translateY(calc(-50% - 3px))}}
@keyframes v7HooshyarSpeak{0%{opacity:0;transform:translate(8px,-50%)}100%{opacity:1;transform:translate(0,-50%)}}
@media(prefers-reduced-motion:reduce){.v7-hooshyar-robot-zone,.v7-hooshyar-hint-text{animation:none!important}}
`;document.head.appendChild(s);}
function loadStoreBrowser(){return new Promise(function(resolve,reject){if(window.DigiYarStoreBrowser){resolve(window.DigiYarStoreBrowser);return;}var existing=document.querySelector('script[data-digiyar-store-browser]');if(existing){existing.addEventListener('load',function(){window.DigiYarStoreBrowser?resolve(window.DigiYarStoreBrowser):reject(Error('Hooshyar Store Browser unavailable'));},{once:true});existing.addEventListener('error',function(){reject(Error('Hooshyar Store Browser failed to load'));},{once:true});return;}var script=document.createElement('script');script.src='js/v6-store-browser.js?v=6.0.0-store-browser.10';script.async=false;script.dataset.digiyarStoreBrowser='1';script.onload=function(){window.DigiYarStoreBrowser?resolve(window.DigiYarStoreBrowser):reject(Error('Hooshyar Store Browser unavailable'));};script.onerror=function(){reject(Error('Hooshyar Store Browser failed to load'));};document.head.appendChild(script);});}
function init(){const form=document.getElementById('v5SmartSearchForm'),input=document.getElementById('v5SmartSearchInput'),hint=document.getElementById('v5SmartSearchHint');if(!form||!input||!hint)return;const clear=document.getElementById('v5SmartSearchClear'),submit=form.querySelector('.v5-smart-search-submit');installCardStyle();
const field=form.querySelector('.v5-smart-search-field');if(!field)return;
let robotZone=field.querySelector('.v7-hooshyar-robot-zone');if(!robotZone){robotZone=document.createElement('div');robotZone.className='v7-hooshyar-robot-zone';robotZone.setAttribute('aria-hidden','true');robotZone.innerHTML='<img src="assets/hooshyar/friendly-robot.svg" alt="" draggable="false">';field.appendChild(robotZone);}
let actionZone=field.querySelector('.v7-hooshyar-action-zone');if(!actionZone){actionZone=document.createElement('div');actionZone.className='v7-hooshyar-action-zone';actionZone.setAttribute('aria-hidden','true');field.appendChild(actionZone);}if(submit)actionZone.appendChild(submit);if(clear)actionZone.appendChild(clear);
const stale=document.getElementById('v5SmartSearchResults');if(stale)stale.remove();let searched=false;
function renderHint(){const h=hints[i];hint.classList.add('v7-hooshyar-hint');hint.classList.remove('v6-hooshyar-brand');hint.innerHTML='<div class="v7-hooshyar-hint-inner"><div class="v7-hooshyar-hint-text">'+h.text+'</div></div>';}
function syncHint(){const hasText=!!input.value.trim();const textEl=hint.querySelector('.v7-hooshyar-hint-text');hint.style.display='block';hint.style.visibility='visible';hint.style.opacity='1';if(textEl){textEl.style.display=hasText?'none':'block';textEl.style.visibility=hasText?'hidden':'visible';textEl.style.opacity=hasText?'0':'1';}}
function syncActions(){const hasText=!!input.value.trim();if(submit)submit.hidden=!hasText||searched;if(clear)clear.hidden=!searched;}
function resetActions(){if(submit)submit.hidden=true;if(clear)clear.hidden=true;}
resetActions();renderHint();syncHint();syncActions();
input.addEventListener('input',function(){searched=false;syncHint();syncActions();});input.addEventListener('focus',syncHint);input.addEventListener('blur',syncHint);
if(clear)clear.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();input.value='';input.disabled=false;input.placeholder='';searched=false;i=0;renderHint();syncHint();resetActions();var r=document.getElementById('v5SmartSearchResults');if(r)r.remove();var s=document.getElementById('v6StoreSimulatorResults');if(s)s.remove();var sim=document.querySelector('[data-v6-store-simulator]');if(sim)sim.remove();input.focus();});
timer=setInterval(()=>{if(!input.value.trim()&&!searched){i=(i+1)%hints.length;hint.classList.remove('v5-hint-show');void hint.offsetWidth;renderHint();syncHint();hint.classList.add('v5-hint-show');}},2600);
form.addEventListener('submit',async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;const textEl=hint.querySelector('.v7-hooshyar-hint-text');if(textEl){textEl.style.display='none';textEl.style.visibility='hidden';textEl.style.opacity='0';}const old=input.placeholder;input.placeholder='دارم برات جستجو می‌کنم...';input.disabled=true;searched=true;syncActions();try{const browser=await loadStoreBrowser();browser.open(q);}catch(err){console.error('DigiYar Hooshyar Store Browser:',err);}finally{input.disabled=false;input.placeholder=old;searched=true;syncActions();}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();