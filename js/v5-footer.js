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
   }
   if(recommendations){
     const replacement=recommendations.cloneNode(true);
     const label=replacement.querySelector('span');
     if(label)label.textContent='پیشنهادات';
     recommendations.replaceWith(replacement);
     replacement.addEventListener('click',function(){
       const result=document.getElementById('resultSection');
       if(!result)return;
       result.classList.add('v6-nav-result-visible');
       result.style.setProperty('display','block','important');
       result.scrollIntoView({behavior:'smooth',block:'start'});
     });
   }
 }

 /* The OS status bar cannot be covered by a normal web page; use the same light chrome as the footer. */
 const theme=document.querySelector('meta[name="theme-color"]');
 if(theme)theme.setAttribute('content','#ffffff');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
