/* DigiYar V5 — Steps 3–10 UI orchestration */
(function(){'use strict';const $=id=>document.getElementById(id);
function initDeals(){const track=$('v5DealTrack'),dots=$('v5DealDots'),viewport=$('v5DealViewport');if(!track||!dots||!viewport)return;let index=0,timer=null;const cards=[...track.children].filter(el=>el.classList.contains('v5-deal')),count=cards.length;if(!count)return;const updateDots=()=>{const offsets=[-2,-1,0,1,2];if(dots.children.length!==5){dots.innerHTML='';offsets.forEach(offset=>{const b=document.createElement('button');b.type='button';b.addEventListener('click',()=>{const target=Number(b.dataset.target);if(Number.isInteger(target)){index=target;render();restart()}});dots.appendChild(b)})}Array.from(dots.children).forEach((b,i)=>{const offset=offsets[i],target=(index+offset+count)%count;b.dataset.offset=String(offset);b.dataset.target=String(target);b.setAttribute('aria-label',`اسلاید ${target+1}`);b.classList.toggle('active',offset===0)})};const render=()=>{track.style.transform=`translate3d(${-index*100}%,0,0)`;updateDots()};const next=()=>{index=(index+1)%count;render()};const restart=()=>{clearInterval(timer);timer=setInterval(next,3000)};let startX=0,startY=0,moved=false;viewport.addEventListener('touchstart',e=>{const t=e.changedTouches[0];startX=t.clientX;startY=t.clientY;moved=false;clearInterval(timer)},{passive:true});viewport.addEventListener('touchmove',e=>{const t=e.changedTouches[0];if(Math.abs(t.clientX-startX)>8)moved=true},{passive:true});viewport.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;if(moved&&Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){index=(index+(dx<0?1:-1)+count)%count;render()}restart()},{passive:true});addEventListener('resize',render);render();restart()}
function initAffiliateDeals(){document.querySelectorAll('.v5-deal-affiliate').forEach(card=>{const go=()=>{const url=(card.dataset.affiliateUrl||'').trim();if(!url)return;try{const parsed=new URL(url,location.href);if(!/^https?:$/.test(parsed.protocol))return;window.location.href=parsed.href}catch(e){}};card.addEventListener('click',e=>{if(e.target.closest('.v6-store-deal-link'))return;go()});card.addEventListener('keydown',e=>{if(e.target.closest('.v6-store-deal-link'))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})})}
function initHeader(){const brand=$('v5HeaderBrand'),tag=$('v5HeaderTagline');if(!brand||!tag)return;const states=[['دیجی‌یار','دستیار هوشمند خرید اینترنتی تو'],['دیجی‌یار','دنبال بهترین انتخابی؟ با دیجی‌یار پیداش کن'],['دیجی‌یار','قبل از خرید، هوشمندانه انتخاب کن']];let i=0;const apply=()=>{const s=states[i++%states.length];brand.textContent=s[0];tag.textContent=s[1]};apply();setInterval(apply,4800)}
function moveRecommendations(){const result=$('resultSection'),target=$('v5InlineResults'),rec=$('recommendations');if(result&&target&&rec){target.appendChild(rec);result.classList.add('v5-result-card')}}
function initChat(){const form=$('digiyar-chat-form'),btn=form?.querySelector('button');if(btn){btn.setAttribute('aria-label','ارسال پیام');btn.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M21 3 9.4 14.6M21 3l-7.4 18-4.2-6.4L3 10.4 21 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}}
function initProfileSave(){const form=$('v5ProfileCompletionForm');if(!form)return;const status=$('v5ProfileSaveStatus');form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());localStorage.setItem('digiyar-v5-profile',JSON.stringify(data));if(status){status.textContent='پروفایل ذخیره شد؛ خبرهای جذاب را بر اساس آن برایت آماده می‌کنیم.';setTimeout(()=>status.textContent='',3000)}})}
function initProfileCompletionToggle(){const card=document.querySelector('.v5-profile-completion,.v5-profile-card');const form=$('v5ProfileCompletionForm')||$('profileForm');if(!card||!form)return;const existing=card.querySelector('.v5-profile-completion-toggle,.v5-step4-final-toggle');if(existing)existing.remove();const toggle=document.createElement('button');toggle.type='button';toggle.className='v5-step4-toggle v5-profile-completion-toggle v5-step4-final-toggle';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','باز کردن تکمیل پروفایل');toggle.innerHTML='<span class="v5-step4-toggle-icon v5-profile-completion-toggle-icon" aria-hidden="true"><i>⟨</i><i>⟨</i><i>⟨</i></span>';card.appendChild(toggle);const setState=open=>{card.classList.toggle('is-open',open);form.hidden=!open;form.setAttribute('aria-hidden',String(!open));form.style.display=open?'grid':'';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'بستن تکمیل پروفایل':'باز کردن تکمیل پروفایل')};toggle.addEventListener('click',()=>setState(toggle.getAttribute('aria-expanded')!=='true'));setState(false)}
function initProfileCompletionFields(){const form=$('v5ProfileCompletionForm');if(!form)return;form.querySelectorAll('label').forEach(label=>{const field=label.querySelector('input,select,textarea');if(!field)return;const text=[...label.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).filter(Boolean).join(' ').trim();if(text&&!field.getAttribute('placeholder'))field.setAttribute('placeholder',text);[...label.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());label.removeAttribute('aria-hidden')})}
function removeTemporaryAIConversation(){const card=$('digiyarConversation');if(card)card.remove()}
function initPopularStores(){const card=document.querySelector('.v5-popular-card');const grid=$('platforms');if(!card||!grid)return;const existing=card.querySelector('.v5-popular-toggle');if(existing)existing.remove();const toggle=document.createElement('button');toggle.type='button';toggle.className='v5-popular-toggle';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','باز کردن فروشگاه‌های محبوب');toggle.innerHTML='<span class="v5-popular-toggle-icon" aria-hidden="true"><i>⟨</i><i>⟨</i><i>⟨</i></span>';card.appendChild(toggle);const setState=open=>{card.classList.toggle('is-open',open);grid.hidden=!open;grid.setAttribute('aria-hidden',String(!open));toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'بستن فروشگاه‌های محبوب':'باز کردن فروشگاه‌های محبوب')};toggle.addEventListener('click',()=>setState(toggle.getAttribute('aria-expanded')!=='true'));const links=['https://aflo.ir/16da7m1UY','https://aflo.ir/YPN05dL7','https://torob.com/','https://basalam.com/'];Array.from(grid.querySelectorAll('.platform')).forEach((el,i)=>{if(links[i])el.setAttribute('href',links[i]);el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer')});setState(false)}
function initPageHarmony(){const popular=document.querySelector('.v5-popular-card');if(popular){const title=popular.querySelector('.section-title');if(title&&!title.querySelector('.v5-card-subtitle')){const p=document.createElement('p');p.className='v5-card-subtitle';p.textContent='دنبال هر چی هستی، خودت از فروشگاه محبوبت پیداش کن';title.appendChild(p)}}if(!document.querySelector('link[data-v5-page-harmony]')){const link=document.createElement('link');link.rel='stylesheet';link.href='css/v5-page-harmony.css';link.dataset.v5PageHarmony='true';document.head.appendChild(link)}}
function initFooterNavigation(){
if(document.getElementById('v6FooterNav'))return;
const popular=document.querySelector('.v5-popular-card');
const profileCard=document.querySelector('.v5-profile-card.profile-card');
const profileCompletionCard=document.querySelector('.v5-profile-completion');
const style=document.createElement('style');
style.id='v6-footer-navigation-style';
style.textContent='.v6-footer-nav{position:fixed;left:0;right:0;bottom:0;z-index:9999;height:68px;padding:7px 10px;box-sizing:border-box;display:grid;grid-template-columns:repeat(5,1fr);align-items:center;direction:rtl;background:#fff;border-top:1px solid #dfe6f0;box-shadow:0 -8px 24px rgba(16,28,53,.12)}.v6-footer-nav button{min-width:0;height:54px;border:0;background:transparent;color:#69778d;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer}.v6-footer-nav button svg{display:block!important;visibility:visible!important;opacity:1!important;width:23px;height:23px;flex:0 0 23px;overflow:visible}.v6-footer-nav button span{display:none!important}.v6-footer-nav button svg{display:block!important;visibility:visible!important;opacity:1!important;width:24px;height:24px;flex:0 0 24px;overflow:visible}.v6-footer-nav .v6-menu{width:50px;height:50px;justify-self:center;border-radius:15px;background:#2a4169;color:#fff}.v6-nav-sheet{position:fixed;left:12px;right:12px;bottom:76px;z-index:10000;max-height:68vh;overflow:auto;padding:14px;border:1px solid #dfe6f0;border-radius:18px;background:#fff;box-shadow:0 16px 42px rgba(16,28,53,.2);direction:rtl;display:none}.v6-nav-sheet.is-open{display:block}.v6-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.v6-sheet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v6-sheet-action{min-height:50px;padding:9px;border:1px solid #dfe6f0;border-radius:12px;background:#f8fafd;color:#2a4169}.v6-nav-backdrop{position:fixed;inset:0;z-index:9998;background:rgba(16,28,53,.24);display:none}.v6-nav-backdrop.is-open{display:block}.v6-menu-profile-card,.v6-menu-popular-card,.v6-menu-profile-completion-card{display:block!important;width:100%!important}.v6-menu-profile-card .v5-profile-completion-toggle,.v6-menu-profile-card .v5-step4-final-toggle,.v6-menu-popular-card .v5-popular-toggle,.v6-menu-profile-completion-card .v5-profile-completion-toggle,.v6-menu-profile-completion-card .v5-step4-final-toggle{display:none!important}.v6-menu-popular-card .platform-grid{height:auto!important;max-height:none!important;overflow:visible!important}';
document.head.appendChild(style);
const nav=document.createElement('nav');
nav.id='v6FooterNav';
nav.className='v6-footer-nav';
nav.setAttribute('aria-label','ناوبری اصلی');
nav.innerHTML='<button type="button" data-v6-action="account" aria-label="حساب من"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 21c.7-4 3.1-6 7-6s6.3 2 7 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>حساب من</span></button><button type="button" data-v6-action="recommendations" aria-label="پیشنهادها"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>پیشنهادها</span></button><button type="button" class="v6-menu" data-v6-action="menu" aria-label="منوی اصلی"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>☰</span></button><button type="button" data-v6-action="search" aria-label="جستجو"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>جستجو</span></button><button type="button" data-v6-action="home" aria-label="خانه"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 10.5V21h13V10.5M9 21v-6h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span>خانه</span></button>';
document.body.appendChild(nav);
const backdrop=document.createElement('div');
backdrop.className='v6-nav-backdrop';
document.body.appendChild(backdrop);
const sheet=document.createElement('section');
sheet.className='v6-nav-sheet';
sheet.innerHTML='<div class="v6-sheet-head"><h3 id="v6SheetTitle">منوی دیجی‌یار</h3><button type="button" class="v6-sheet-close">×</button></div><div id="v6SheetBody"></div>';
document.body.appendChild(sheet);
const body=sheet.querySelector('#v6SheetBody');
const close=()=>{sheet.classList.remove('is-open');backdrop.classList.remove('is-open');};
const bindMenu=()=>{
body.querySelectorAll('button[data-scroll]').forEach(button=>{
button.addEventListener('click',()=>{
const target=$(button.dataset.scroll);
if(target){close();target.scrollIntoView({behavior:'smooth',block:'start'});}
});
});
const profileButton=body.querySelector('[data-v6-profile]');
if(profileButton)profileButton.addEventListener('click',()=>{
if(!profileCard)return;
profileCard.hidden=false;
profileCard.removeAttribute('aria-hidden');
profileCard.classList.add('is-open','v6-menu-profile-card');
const form=profileCard.querySelector('#profileForm');
if(form){form.hidden=false;form.removeAttribute('aria-hidden');form.style.display='grid';}
body.innerHTML='';
body.appendChild(profileCard);
sheet.querySelector('#v6SheetTitle').textContent='دنبال چی می‌گردی؟';
});
const popularButton=body.querySelector('[data-v6-popular]');
if(popularButton)popularButton.addEventListener('click',()=>{
if(!popular)return;
popular.hidden=false;
popular.removeAttribute('aria-hidden');
popular.classList.add('is-open','v6-menu-popular-card');
const grid=popular.querySelector('#platforms');
if(grid){grid.hidden=false;grid.removeAttribute('aria-hidden');}
body.innerHTML='';
body.appendChild(popular);
sheet.querySelector('#v6SheetTitle').textContent='فروشگاه‌های محبوب';
});
};
const open=(title,html)=>{
sheet.querySelector('#v6SheetTitle').textContent=title;
body.innerHTML=html;
sheet.classList.add('is-open');
backdrop.classList.add('is-open');
bindMenu();
};
sheet.querySelector('.v6-sheet-close').addEventListener('click',close);
backdrop.addEventListener('click',close);
nav.querySelectorAll('button[data-v6-action]').forEach(button=>{
button.addEventListener('click',()=>{
const action=button.dataset.v6Action;
if(action==='menu'){
open('منوی دیجی‌یار','<div class="v6-sheet-grid"><button class="v6-sheet-action" type="button" data-scroll="v5SmartSearchForm">جستجوی هوش‌یار</button><button class="v6-sheet-action" type="button" data-v6-profile>دنبال چی می‌گردی؟</button><button class="v6-sheet-action" type="button" data-scroll="v5ProfileCompletionForm">تکمیل پروفایل</button><button class="v6-sheet-action" type="button" data-v6-popular>فروشگاه‌های محبوب</button><button class="v6-sheet-action" type="button" data-scroll="v5DealViewport">تخفیف‌ها و پیشنهادها</button><button class="v6-sheet-action" type="button" data-scroll="footerPanels">اطلاعات و راهنما</button></div>');
}else if(action==='account'){
if(profileCompletionCard){
profileCompletionCard.hidden=false;
profileCompletionCard.removeAttribute('aria-hidden');
profileCompletionCard.classList.add('is-open','v6-menu-profile-completion-card');
const form=profileCompletionCard.querySelector('#v5ProfileCompletionForm');
if(form){form.hidden=false;form.removeAttribute('aria-hidden');form.style.display='grid';}
body.innerHTML='';
body.appendChild(profileCompletionCard);
sheet.querySelector('#v6SheetTitle').textContent='تکمیل و ویرایش پروفایل';
sheet.classList.add('is-open');
backdrop.classList.add('is-open');
}
}else if(action==='recommendations'){
const target=$('recommendations')||$('v5InlineResults');
if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
}else if(action==='search'){
const target=$('v5SmartSearchInput');
if(target){target.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>target.focus(),350);}
}else if(action==='home'){
window.scrollTo({top:0,behavior:'smooth'});
}
});
});
}
function init(){initFooterNavigation();initDeals();initAffiliateDeals();initHeader();moveRecommendations();initChat();initProfileSave();removeTemporaryAIConversation();initPopularStores();initProfileCompletionToggle();initProfileCompletionFields();initPageHarmony()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();