/* DigiYar V5 — Footer panels */
(function(){'use strict';
function init(){
 const footer=document.querySelector('.main-footer');
 if(!footer)return;
 const buttons=footer.querySelectorAll('[data-footer-panel]');
 const panels=footer.querySelectorAll('.footer-panel');
 buttons.forEach(button=>button.addEventListener('click',function(){
   const key=this.getAttribute('data-footer-panel');
   const panel=footer.querySelector('#footer-'+key);
   if(!panel)return;
   const wasOpen=!panel.hidden;
   panels.forEach(p=>{p.hidden=true;p.classList.remove('is-open');});
   buttons.forEach(b=>{b.classList.remove('is-active');b.setAttribute('aria-expanded','false');});
   if(!wasOpen){panel.hidden=false;panel.classList.add('is-open');this.classList.add('is-active');this.setAttribute('aria-expanded','true');panel.scrollIntoView({behavior:'smooth',block:'nearest'});}
 }));
 buttons.forEach(b=>b.setAttribute('aria-expanded','false'));

 /* Final V6 navigation placement: swap the Home and Menu positions only. */
 const nav=document.getElementById('v6FooterNav');
 if(nav){
   const menu=nav.querySelector('[data-v6-action="menu"]');
   const home=nav.querySelector('[data-v6-action="home"]');
   const recommendations=nav.querySelector('[data-v6-action="recommendations"]');
   if(menu&&home){
     nav.insertBefore(home,menu);
     nav.appendChild(menu);
     menu.classList.remove('v6-menu');
     home.classList.add('v6-menu');
   }
   if(recommendations)recommendations.remove();

   /* Icons-only footer navigation. */
   if(!document.getElementById('v6-nav-icons-only-style')){
     const style=document.createElement('style');
     style.id='v6-nav-icons-only-style';
     style.textContent='.v6-footer-nav button span{display:none!important}.v6-footer-nav button{gap:0!important}.v6-footer-nav button svg{display:block!important}.v6-footer-nav .v6-menu{height:50px!important;width:50px!important}.v6-footer-nav .v6-menu{background:linear-gradient(135deg,#2a4169,#38547f)!important;color:#fff!important;box-shadow:0 6px 15px rgba(42,65,105,.25)!important}.v6-footer-nav button:not(.v6-menu){background:transparent}.v6-footer-nav button[data-v6-action="menu"]{background:transparent!important;color:#69778d!important;box-shadow:none!important}';
     document.head.appendChild(style);
   }
 }

 /* Light/Dark mode toggle — lives in the fixed header and persists per user. */
 const header=document.querySelector('.main-header');
 if(header&&!document.getElementById('v6ThemeToggle')){
   const toggle=document.createElement('button');
   toggle.id='v6ThemeToggle';
   toggle.type='button';
   toggle.setAttribute('aria-label','فعال کردن حالت تاریک');
   toggle.setAttribute('title','حالت تاریک');
   toggle.innerHTML='<svg class="v6-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path></svg><svg class="v6-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 15.2A8.6 8.6 0 0 1 8.8 4a8.7 8.7 0 1 0 11.2 11.2Z"></path></svg>';
   const content=header.querySelector('.header-content');
   if(content)content.appendChild(toggle);else header.appendChild(toggle);
   const saved=localStorage.getItem('digiyar-theme');
   const applyTheme=mode=>{
     const dark=mode==='dark';
     document.body.classList.toggle('v6-dark',dark);
     toggle.classList.toggle('is-dark',dark);
     toggle.setAttribute('aria-label',dark?'فعال کردن حالت روشن':'فعال کردن حالت تاریک');
     toggle.setAttribute('title',dark?'حالت روشن':'حالت تاریک');
     const meta=document.querySelector('meta[name="theme-color"]');
     if(meta)meta.setAttribute('content',dark?'#0f172a':'#ffffff');
   };
   applyTheme(saved==='dark'?'dark':'light');
   toggle.addEventListener('click',function(){
     const next=document.body.classList.contains('v6-dark')?'light':'dark';
     localStorage.setItem('digiyar-theme',next);
     applyTheme(next);
   });
   if(!document.getElementById('v6-theme-style')){
     const style=document.createElement('style');
     style.id='v6-theme-style';
     style.textContent='body.v6-dark{background:#0f172a!important;color:#e5e7eb!important}body.v6-dark .main-header{background:#111827!important;border-bottom-color:#263449!important;color:#e5e7eb!important}.v6-dark .header-brand strong{color:#f3f4f6!important}.v6-dark .header-brand span{color:#aeb9ca!important}.v6-dark .card,.v6-dark section.card,.v6-dark article.card,.v6-dark .v5-result-card,.v6-dark .v5-popular-card,.v6-dark .v5-profile-card,.v6-dark .v5-profile-completion,.v6-dark .v5-smart-search-card,.v6-dark .footer-panel{background:#172033!important;border-color:#2b3a50!important;color:#e5e7eb!important}.v6-dark h1,.v6-dark h2,.v6-dark h3,.v6-dark h4,.v6-dark strong,.v6-dark label,.v6-dark .section-title,.v6-dark .v5-card-subtitle{color:#f3f4f6!important}.v6-dark p,.v6-dark span,.v6-dark small,.v6-dark .muted,.v6-dark .hint{color:#b8c3d3!important}.v6-dark input,.v6-dark select,.v6-dark textarea{background:#0f172a!important;border-color:#334155!important;color:#f3f4f6!important}.v6-dark input::placeholder,.v6-dark textarea::placeholder{color:#8492a6!important}.v6-dark .main-footer,.v6-dark .v6-footer-nav{background:rgba(15,23,42,.97)!important;border-color:#263449!important;box-shadow:0 -8px 24px rgba(0,0,0,.3)!important}.v6-dark .v6-footer-nav button:not(.v6-menu){color:#aeb9ca!important}.v6-dark .v6-footer-nav button.is-active,.v6-dark .v6-footer-nav button:hover{color:#f3f4f6!important}.v6-dark .v6-nav-sheet{background:#172033!important;border-color:#2b3a50!important}.v6-dark .v6-sheet-head h3,.v6-dark .v6-account-card strong{color:#f3f4f6!important}.v6-dark .v6-sheet-action,.v6-dark .v6-account-card{background:#0f172a!important;border-color:#334155!important;color:#e5e7eb!important}.v6-dark .v6-nav-backdrop{background:rgba(0,0,0,.5)}#v6ThemeToggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:38px;height:38px;padding:0;border:1px solid #dfe6f0;border-radius:12px;background:#f8fafd;color:#2a4169;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;box-sizing:border-box}#v6ThemeToggle svg{width:21px;height:21px}#v6ThemeToggle .v6-theme-moon{display:none}#v6ThemeToggle.is-dark{background:#202b3e;border-color:#3a4a61;color:#f5c96a}#v6ThemeToggle.is-dark .v6-theme-sun{display:none}#v6ThemeToggle.is-dark .v6-theme-moon{display:block}@media(max-width:430px){#v6ThemeToggle{right:7px;width:34px;height:34px;border-radius:10px}#v6ThemeToggle svg{width:19px;height:19px}}';
     document.head.appendChild(style);
   }
 }

 const theme=document.querySelector('meta[name="theme-color"]');
 if(theme&&!document.body.classList.contains('v6-dark'))theme.setAttribute('content','#ffffff');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
