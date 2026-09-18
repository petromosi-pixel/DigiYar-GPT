/* DigiYar V6 — Hooshyar UI bridge to the simulated store browser */
(function(){
'use strict';
const hints=['هوش‌یار: چی می‌خوای بخری؟','هوش‌یار: مثلاً گوشی سامسونگ، شیائومی یا آیفون','هوش‌یار: دنبال لپ‌تاپ مناسب می‌گردی؟','هوش‌یار: اسم محصولت رو بنویس...','هوش‌یار: هر چی می‌خوای بنویس تا برات پیدا کنه'];
let i=0,timer;

function installCardStyle(){if(document.getElementById('v6-hooshyar-card-style'))return;const s=document.createElement('style');s.id='v6-hooshyar-card-style';s.textContent=`
.v5-smart-search-results{display:flex;flex-direction:column;align-items:stretch;gap:10px}
.v5-smart-search-result-head{width:100%;margin:0 0 10px;padding:2px 4px;text-align:center;color:#172033;font-size:15px;font-weight:800;line-height:1.6;box-sizing:border-box}
.v5-smart-search-canonical{display:block;margin-top:2px;color:#687386;font-size:11px;font-weight:500;line-height:1.5}
.v5-smart-search-notice{margin:0 0 16px;padding:12px 14px;border:1px solid rgba(44,90,150,.22);border-radius:14px;background:rgba(44,90,150,.07);text-align:center;font-size:.84rem;font-weight:600;line-height:1.8;color:#d11;box-shadow:0 2px 8px rgba(30,60,100,.05)}
.v5-smart-result{position:relative;display:flex!important;flex-direction:column!important;width:100%;height:155px;min-height:155px;overflow:hidden;text-align:center;padding:0;border-radius:14px;background:#fff;border:1px solid rgba(0,0,0,.18);box-sizing:border-box;color:#172033;transition:background .2s ease,border-color .2s ease,box-shadow .2s ease}
.v5-smart-result-info{display:flex!important;flex:2 1 0!important;width:100%;min-width:0;min-height:0;flex-direction:column;align-items:center;justify-content:center;padding:10px 12px;background:transparent;box-sizing:border-box;gap:2px}
.v5-smart-result-title,.v5-smart-result-subtitle{width:100%;max-width:100%;min-width:0;overflow:visible;text-overflow:clip;white-space:normal;overflow-wrap:anywhere;word-break:normal;hyphens:none;text-align:center}
.v5-smart-result-title{font-size:14px;font-weight:700;line-height:1.45;color:inherit;margin:0}
.v5-smart-result-subtitle{font-size:12px;font-weight:500;line-height:1.4;color:inherit;margin:0}
.v5-smart-result a{display:flex!important;flex:1 1 0!important;width:100%!important;min-width:100%;min-height:0;height:auto!important;align-items:center;justify-content:center;margin:0;padding:0 20px;border:0;border-top:1px solid #111;border-radius:0;background:#2563eb;color:#fff;font-size:1rem;font-weight:700;line-height:1;text-decoration:none;box-shadow:none;box-sizing:border-box;transition:background .15s ease,transform .15s ease}
.v5-smart-result a:hover{background:#1d4ed8}.v5-smart-result a:active{transform:translateY(1px)}
.v5-smart-result a:focus-visible{outline:2px solid #93c5fd;outline-offset:-2px}
.v5-smart-search-empty{width:100%;box-sizing:border-box;margin:0;padding:14px;border-radius:14px;background:#fff;border:1px solid rgba(0,0,0,.12);color:#172033;text-align:center;font-size:.9rem;font-weight:600;line-height:1.8;box-shadow:0 2px 8px rgba(30,60,100,.05)}
.v5-smart-search-loading{display:flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:10px 14px;border-radius:12px;font-weight:600;color:#172033;background:rgba(0,0,0,.025)}
.v6-hooshyar-spinner{display:inline-block;font-size:2em;line-height:1;animation:v6HooshyarSearch 1.05s ease-in-out infinite;transform-origin:58% 50%}
.v6-hooshyar-dots{display:inline-flex;align-items:flex-end;gap:2px;min-width:1.2em;height:1em;vertical-align:middle}
.v6-hooshyar-dots i{display:block;width:.28em;height:.28em;border-radius:50%;background:currentColor;opacity:.18;animation:v6HooshyarDot 1.35s ease-in-out infinite}
.v6-hooshyar-dots i:nth-child(2){animation-delay:.25s}.v6-hooshyar-dots i:nth-child(3){animation-delay:.5s}
@keyframes v6HooshyarSearch{0%,20%{transform:rotate(-18deg) translate(0,0)}45%{transform:rotate(8deg) translate(2px,-1px)}70%{transform:rotate(-18deg) translate(0,0)}100%{transform:rotate(-18deg) translate(0,0)}}
@keyframes v6HooshyarDot{0%,100%{opacity:.18;transform:translateY(0)}45%{opacity:1;transform:translateY(-1px)}70%{opacity:.18;transform:translateY(0)}}
@media(prefers-color-scheme:dark){
.v5-smart-search-result-head{color:#f8fafc}.v5-smart-search-canonical{color:#aab4c4}
.v5-smart-result{background:#161b24;border-color:rgba(255,255,255,.14);color:#f8fafc;box-shadow:0 4px 16px rgba(0,0,0,.34)}
.v5-smart-result-info{background:#161b24}.v5-smart-result-title{color:#f8fafc}.v5-smart-result-subtitle{color:#cbd5e1}
.v5-smart-result a{border-top-color:rgba(255,255,255,.16);background:#3b82f6;color:#fff}.v5-smart-result a:hover{background:#60a5fa;color:#08111f}.v5-smart-result a:focus-visible{outline-color:#bfdbfe}
.v5-smart-search-empty{background:#161b24;border-color:rgba(255,255,255,.14);color:#f8fafc;box-shadow:0 4px 16px rgba(0,0,0,.28)}
.v5-smart-search-loading{color:#e5e7eb;background:rgba(255,255,255,.045)}
.v5-smart-search-notice{background:rgba(255,80,80,.08);border-color:rgba(255,100,100,.25);color:#ff7b7b;box-shadow:0 2px 10px rgba(0,0,0,.2)}
}
html.dark .v5-smart-search-result-head,body.dark .v5-smart-search-result-head,[data-theme="dark"] .v5-smart-search-result-head{color:#f8fafc}
html.dark .v5-smart-search-canonical,body.dark .v5-smart-search-canonical,[data-theme="dark"] .v5-smart-search-canonical{color:#aab4c4}
html.dark .v5-smart-result,body.dark .v5-smart-result,[data-theme="dark"] .v5-smart-result{background:#161b24;border-color:rgba(255,255,255,.14);color:#f8fafc;box-shadow:0 4px 16px rgba(0,0,0,.34)}
html.dark .v5-smart-result-info,body.dark .v5-smart-result-info,[data-theme="dark"] .v5-smart-result-info{background:#161b24}
html.dark .v5-smart-result-title,body.dark .v5-smart-result-title,[data-theme="dark"] .v5-smart-result-title{color:#f8fafc}
html.dark .v5-smart-result-subtitle,body.dark .v5-smart-result-subtitle,[data-theme="dark"] .v5-smart-result-subtitle{color:#cbd5e1}
html.dark .v5-smart-result a,body.dark .v5-smart-result a,[data-theme="dark"] .v5-smart-result a{border-top-color:rgba(255,255,255,.16);background:#3b82f6;color:#fff}
html.dark .v5-smart-result a:hover,body.dark .v5-smart-result a:hover,[data-theme="dark"] .v5-smart-result a:hover{background:#60a5fa;color:#08111f}
html.dark .v5-smart-result a:focus-visible,body.dark .v5-smart-result a:focus-visible,[data-theme="dark"] .v5-smart-result a:focus-visible{outline-color:#bfdbfe}
html.dark .v5-smart-search-empty,body.dark .v5-smart-search-empty,[data-theme="dark"] .v5-smart-search-empty{background:#161b24;border-color:rgba(255,255,255,.14);color:#f8fafc;box-shadow:0 4px 16px rgba(0,0,0,.28)}
html.dark .v5-smart-search-loading,body.dark .v5-smart-search-loading,[data-theme="dark"] .v5-smart-search-loading{color:#e5e7eb;background:rgba(255,255,255,.045)}
html.dark .v5-smart-search-notice,body.dark .v5-smart-search-notice,[data-theme="dark"] .v5-smart-search-notice{background:rgba(255,80,80,.08);border-color:rgba(255,100,100,.25);color:#ff7b7b;box-shadow:0 2px 10px rgba(0,0,0,.2)}
`;document.head.appendChild(s);}
function loadStoreBrowser(){return new Promise(function(resolve,reject){if(window.DigiYarStoreBrowser){resolve(window.DigiYarStoreBrowser);return;}var existing=document.querySelector('script[data-digiyar-store-browser]');if(existing){existing.addEventListener('load',function(){window.DigiYarStoreBrowser?resolve(window.DigiYarStoreBrowser):reject(Error('Hooshyar Store Browser unavailable'));},{once:true});existing.addEventListener('error',function(){reject(Error('Hooshyar Store Browser failed to load'));},{once:true});return;}var script=document.createElement('script');script.src='js/v6-store-browser.js?v=6.0.0-store-browser.9';script.async=false;script.dataset.digiyarStoreBrowser='1';script.onload=function(){window.DigiYarStoreBrowser?resolve(window.DigiYarStoreBrowser):reject(Error('Hooshyar Store Browser unavailable'));};script.onerror=function(){reject(Error('Hooshyar Store Browser failed to load'));};document.head.appendChild(script);});}
function init(){const form=document.getElementById('v5SmartSearchForm'),input=document.getElementById('v5SmartSearchInput'),hint=document.getElementById('v5SmartSearchHint'),clear=document.getElementById('v5SmartSearchClear');if(!form||!input||!hint)return;installCardStyle();const stale=document.getElementById('v5SmartSearchResults');if(stale)stale.remove();hint.textContent=hints[0];timer=setInterval(()=>{if(!input.value.trim()){i=(i+1)%hints.length;hint.classList.remove('v5-hint-show');void hint.offsetWidth;hint.textContent=hints[i];hint.classList.add('v5-hint-show')}},2600);const syncHint=()=>{const hasText=!!input.value.trim();hint.style.opacity=hasText?'0':'1';hint.style.visibility=hasText?'hidden':'visible'};function syncClear(){if(!clear)return;clear.hidden=!input.value.trim();}input.addEventListener('input',function(){syncHint();syncClear();});input.addEventListener('focus',syncHint);input.addEventListener('blur',syncHint);if(clear)clear.addEventListener('click',function(){input.value='';input.disabled=false;input.placeholder='';syncHint();syncClear();var r=document.getElementById('v5SmartSearchResults');if(r)r.remove();var s=document.getElementById('v6StoreSimulatorResults');if(s)s.remove();input.focus();});syncHint();syncClear();form.addEventListener('submit',async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;hint.style.opacity='0';hint.style.visibility='hidden';const old=input.placeholder;input.placeholder='در حال باز کردن مرورگر هوش‌یار...';input.disabled=true;try{const browser=await loadStoreBrowser();browser.open(q);}catch(err){console.error('DigiYar Hooshyar Store Browser:',err);}finally{input.disabled=false;input.placeholder=old;syncHint();}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();