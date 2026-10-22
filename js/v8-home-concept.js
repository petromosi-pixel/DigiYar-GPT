/* DigiYar V8 — home concept wiring; no mock data or duplicate search logic. */
(function(){
'use strict';
function init(){
 const hero=document.getElementById('digiyarConversation');
 const searchBar=document.querySelector('.v5-smart-search-bar');
 const searchForm=document.getElementById('v5SmartSearchForm');
 if(!hero||!searchForm)return;
 if(searchBar&&searchBar.parentElement!==hero){
   const head=hero.querySelector('.v5-chat-head');
   if(head)head.insertAdjacentElement('afterend',searchBar);
 }
 let shortcuts=document.getElementById('v8HomeShortcuts');
 if(!shortcuts){
   shortcuts=document.createElement('div');
   shortcuts.id='v8HomeShortcuts';
   shortcuts.innerHTML='<button type="button" class="v8-home-shortcut" data-v7-open-comparison><span class="v8-shortcut-icon" aria-hidden="true">⇄</span><span><strong>مقایسهٔ تخصصی کالاها</strong><small>محصولات را کنار هم بررسی کن</small></span></button><button type="button" class="v8-home-shortcut" data-v8-scroll="#popularStoresDiscovery"><span class="v8-shortcut-icon" aria-hidden="true">▦</span><span><strong>پیدا کردن فروشگاه</strong><small>بر اساس حوزهٔ فعالیت</small></span></button>';
   searchBar.insertAdjacentElement('afterend',shortcuts);
 }
 const result=document.getElementById('resultSection');
 if(result&&!document.getElementById('v8HomeDealsJump')){
   const jump=document.createElement('div');
   jump.id='v8HomeDealsJump';
   jump.innerHTML='<strong>پیشنهادات دیجی‌یار</strong><span>نتایج جست‌وجو و مقایسه در همین‌جا نمایش داده می‌شوند</span>';
   result.insertAdjacentElement('beforebegin',jump);
 }
 if(!document.querySelector('.v8-bottom-nav')){
   const nav=document.createElement('nav');
   nav.className='v8-bottom-nav';
   nav.setAttribute('aria-label','ناوبری اصلی');
   nav.innerHTML='<button type="button" aria-current="page" data-v8-scroll="#digiyarConversation"><span class="v8-nav-icon" aria-hidden="true">⌂</span><small>خانه</small></button><button type="button" data-v7-open-comparison><span class="v8-nav-icon" aria-hidden="true">⇄</span><small>مقایسه</small></button><button type="button" data-v8-scroll="#popularStoresDiscovery"><span class="v8-nav-icon" aria-hidden="true">▦</span><small>فروشگاه‌ها</small></button><button type="button" data-v8-scroll=".main-footer"><span class="v8-nav-icon" aria-hidden="true">☰</span><small>بیشتر</small></button>';
   document.body.appendChild(nav);
 }
 document.addEventListener('click',function(e){
   const b=e.target.closest('[data-v8-scroll]');
   if(!b)return;
   const target=document.querySelector(b.getAttribute('data-v8-scroll'));
   if(target)target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
   document.querySelectorAll('.v8-bottom-nav button').forEach(x=>x.removeAttribute('aria-current'));
   if(b.closest('.v8-bottom-nav'))b.setAttribute('aria-current','page');
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();