/* DigiYar V8 Account Page — full-screen account experience */
(function(){
'use strict';
const PROFILE_KEYS=['digiyar-account-profile-v1','digiyar-v5-profile'];
const ADDRESS_KEY='digiyar-account-addresses-v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readProfile(){for(const k of PROFILE_KEYS){try{const p=JSON.parse(localStorage.getItem(k)||'null');if(p&&typeof p==='object')return p}catch(e){}}return{}}
function saveProfile(p){PROFILE_KEYS.forEach(k=>localStorage.setItem(k,JSON.stringify(p)))}
function readAddresses(){try{const a=JSON.parse(localStorage.getItem(ADDRESS_KEY)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function saveAddresses(a){localStorage.setItem(ADDRESS_KEY,JSON.stringify(a))}
function mount(){
 if($('#dyAccountPage'))return;
 const main=$('main.app-shell'),nav=$('#v6FooterNav'),sheet=$('.v6-nav-sheet'),backdrop=$('.v6-nav-backdrop');
 if(!main)return;
 const p=readProfile();
 const style=document.createElement('style');style.id='dyac-style';style.textContent=`
#dyAccountPage{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;overflow:hidden;background:var(--dy-page,#fff);color:var(--dy-text,#24334c);font-family:inherit;direction:rtl}
#dyAccountPage[hidden]{display:none!important}.dyac-top{height:58px;flex:0 0 58px;display:flex;align-items:center;gap:12px;padding:0 14px;border-bottom:1px solid var(--dy-border,#e3e9f2);background:var(--dy-surface,#fff)}
.dyac-top strong{font-size:15px;flex:1}.dyac-top strong b{color:#e31850}.dyac-back,.dyac-support{border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}.dyac-back{font-size:25px}.dyac-support{font-size:12px;color:var(--dy-primary,#2a4169)}
.dyac-profilebar{display:flex;align-items:center;gap:11px;padding:14px 16px;border-bottom:1px solid var(--dy-border,#e3e9f2)}.dyac-avatar{width:48px;height:48px;flex:0 0 48px;border-radius:50%;overflow:hidden;background:var(--dy-control,#edf2fa);display:grid;place-items:center;font-size:25px}.dyac-avatar img{width:100%;height:100%;object-fit:cover}.dyac-identity{display:grid;gap:4px;flex:1;min-width:0}.dyac-identity strong{font-size:14px}.dyac-identity small{font-size:11px;color:var(--dy-muted,#718096);overflow:hidden;text-overflow:ellipsis}.dyac-profilebar>button{border:0;background:transparent;color:var(--dy-text,#24334c);font-size:18px;padding:8px}
.dyac-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-bottom:1px solid var(--dy-border,#e3e9f2);background:var(--dy-surface,#fff)}.dyac-tabs button{min-width:0;padding:13px 2px 11px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dy-muted,#667085);font:inherit;font-size:11px;white-space:nowrap}.dyac-tabs button.active{color:var(--dy-text,#24334c);font-weight:800;border-bottom-color:var(--dy-primary,#2a4169)}
.dyac-content{flex:1;overflow:auto;overscroll-behavior:contain;padding:18px 16px calc(28px + env(safe-area-inset-bottom));}.dyac-content h2{font-size:15px;margin:0 0 12px}.dyac-content h2:not(:first-child){margin-top:22px}
.dyac-card{border:1px solid var(--dy-border,#e3e9f2);border-radius:13px;background:var(--dy-surface,#fff);padding:13px;margin-bottom:12px}.dyac-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.dyac-form label{display:grid;gap:6px;font-size:12px;font-weight:700;min-width:0}.dyac-form input,.dyac-form textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid var(--dy-border,#d6dfec);border-radius:9px;padding:11px;background:var(--dy-control,#fff);color:var(--dy-text,#24334c);font:inherit;font-size:12px}.dyac-form .wide{grid-column:1/-1}.dyac-primary{grid-column:1/-1;border:0;border-radius:9px;background:#e31850;color:#fff;padding:12px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}.dyac-note{padding:12px;border-radius:11px;background:var(--dy-control,#f4f6fa);font-size:11px;line-height:1.9;color:var(--dy-muted,#667085)}
.dyac-empty{min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;border:1px solid var(--dy-border,#e3e9f2);border-radius:13px}.dyac-empty>span{font-size:48px;color:#aab4c3}.dyac-empty strong{font-size:14px}.dyac-empty small{font-size:11px;line-height:1.9;color:var(--dy-muted,#718096);max-width:320px}
.dyac-add{width:100%;margin:12px 0}.dyac-address>p{font-size:12px;line-height:1.9}.dyac-address small{font-size:11px;color:var(--dy-muted,#718096)}.dyac-danger{display:block;margin-top:10px;border:0;background:transparent;color:#c62828;font:inherit;font-size:12px}
.dyac-security p{font-size:12px;line-height:1.9;color:var(--dy-muted,#667085)}.dyac-row{display:flex;justify-content:space-between;gap:8px;padding:11px 0;border-top:1px solid var(--dy-border,#e3e9f2);font-size:11px}.dyac-row b{font-weight:700}
.dyac-membership-card{display:grid;gap:12px}.dyac-membership-plan{display:flex;align-items:center;justify-content:space-between;gap:10px}.dyac-membership-plan strong{font-size:16px}.dyac-membership-status{font-size:11px;color:var(--dy-muted,#718096)}.dyac-membership-features{display:grid;gap:8px;margin:0;padding:0;list-style:none}.dyac-membership-features li{font-size:12px;line-height:1.8}.dyac-membership-features li:before{content:'✓';color:#16a36a;font-weight:900;margin-left:7px}.dyac-membership-action{width:100%;border:0;border-radius:10px;background:#e31850;color:#fff;padding:12px;font:inherit;font-weight:800;cursor:pointer}.dyac-membership-loading{font-size:12px;color:var(--dy-muted,#718096);text-align:center;padding:16px}
.dyac-faq details{padding:13px 2px;border-bottom:1px solid var(--dy-border,#e3e9f2)}.dyac-faq details:last-child{border:0}.dyac-faq summary{font-size:13px;font-weight:750}.dyac-faq p{font-size:12px;line-height:1.9;color:var(--dy-muted,#667085)}
body.v6-dark #dyAccountPage{--dy-page:#101827;--dy-surface:#182437;--dy-control:#111b2b;--dy-text:#e7edf7;--dy-muted:#aab6c8;--dy-border:#35445a;--dy-primary:#9db7e8}
@media(max-width:380px){.dyac-content{padding-left:12px;padding-right:12px}.dyac-form{grid-template-columns:1fr}.dyac-form .wide{grid-column:auto}.dyac-tabs button{font-size:10px}}
`;document.head.appendChild(style);
 const page=document.createElement('section');page.id='dyAccountPage';page.dir='rtl';page.setAttribute('aria-label','حساب کاربری دیجی‌یار');
 page.innerHTML='<header class="dyac-top"><button type="button" class="dyac-back" data-back aria-label="بازگشت">→</button><strong>حساب کاربری <b>دیجی‌یار</b></strong><button type="button" class="dyac-support" data-tab="support">پشتیبانی</button></header><div class="dyac-profilebar"><div class="dyac-avatar">'+(p.avatarData?'<img src="'+esc(p.avatarData)+'" alt="عکس پروفایل">':'<span>👤</span>')+'</div><div class="dyac-identity"><strong>'+esc(p.name||'کاربر دیجی‌یار')+'</strong><small>'+esc(p.phone||'برای تکمیل حساب، اطلاعات فردی را وارد کن')+'</small></div><button type="button" data-photo>✎</button><input type="file" accept="image/*" hidden data-photo-input></div><nav class="dyac-tabs" aria-label="بخش‌های حساب"><button class="active" data-tab="personal">اطلاعات فردی</button><button data-tab="addresses">آدرس‌ها</button><button data-tab="membership">اشتراک</button><button data-tab="finance">مالی</button><button data-tab="security">امنیت حساب</button></nav><div class="dyac-content" id="dyacContent"></div>';
 document.body.appendChild(page);
 const oldMainHidden=main.hidden,oldNavHidden=nav?nav.hidden:false;
 main.hidden=true;if(nav){nav.hidden=true;nav.style.setProperty('display','none','important');}if(sheet){sheet.classList.remove('is-open')}if(backdrop){backdrop.classList.remove('is-open')}
 page.dataset.oldMainHidden=String(oldMainHidden);page.dataset.oldNavHidden=String(oldNavHidden);page.dataset.oldNavDisplay=nav?nav.style.display:'';
 page.addEventListener('click',e=>{
  const back=e.target.closest('[data-back]');if(back){close();return}
  const tab=e.target.closest('[data-tab]');if(tab){render(tab.dataset.tab);return}
  if(e.target.closest('[data-upgrade-membership]')){if(typeof window.DigiYarMembershipOpen==='function')window.DigiYarMembershipOpen();return}
  if(e.target.closest('[data-photo]')){$('[data-photo-input]',page).click();return}
  const del=e.target.closest('[data-address-delete]');if(del){const a=readAddresses();a.splice(Number(del.dataset.addressDelete),1);saveAddresses(a);render('addresses');return}
  if(e.target.closest('[data-address-add]')){$('#dyacAddressForm',page).hidden=false;return}
 });
 page.addEventListener('change',e=>{
  if(e.target.matches('[data-photo-input]')){const f=e.target.files&&e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')){alert('فایل تصویری معتبر انتخاب کن.');return}if(f.size>3*1024*1024){alert('حجم عکس باید کمتر از ۳ مگابایت باشد.');return}const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),sc=Math.min(1,360/Math.max(im.width,im.height));c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);const pr=readProfile();pr.avatarData=c.toDataURL('image/jpeg',.8);saveProfile(pr);const a=$('.dyac-avatar',page);a.innerHTML='<img src="'+pr.avatarData+'" alt="عکس پروفایل">';if(typeof window.syncFooterAccountAvatar==='function')window.syncFooterAccountAvatar();else{const b=$('#v6FooterNav [data-v6-action="account"]');if(b){const im=document.createElement('img');im.className='v6-footer-account-avatar';im.src=pr.avatarData;const svg=b.querySelector('svg');if(svg)svg.style.display='none';b.insertBefore(im,svg||null)}}};im.src=rd.result};rd.readAsDataURL(f)}
 });
 page.addEventListener('submit',e=>{
  if(e.target.matches('[data-profile-form]')){e.preventDefault();const f=e.target,pr=readProfile();['name','family','phone','email','nationalCode','birthDate'].forEach(k=>pr[k]=f.elements[k].value.trim());saveProfile(pr);$('.dyac-identity strong',page).textContent=(pr.name+' '+pr.family).trim()||'کاربر دیجی‌یار';$('.dyac-identity small',page).textContent=pr.phone||'اطلاعات تماس ثبت نشده';notice('اطلاعات فردی ذخیره شد.');}
  if(e.target.matches('[data-address-form]')){e.preventDefault();const f=e.target,a=readAddresses();a.push({name:f.elements.name.value.trim(),phone:f.elements.phone.value.trim(),province:f.elements.province.value.trim(),city:f.elements.city.value.trim(),postal:f.elements.postal.value.trim(),address:f.elements.address.value.trim()});saveAddresses(a);render('addresses');}
 });
 function notice(t){const n=$('.dyac-notice',page);if(n)n.textContent=t}
 function renderMembership(c){
  c.innerHTML='<h2>اشتراک من</h2><div class="dyac-card dyac-membership-card"><div class="dyac-membership-loading" role="status">در حال بررسی وضعیت اشتراک…</div></div>';
  const card=$('.dyac-membership-card',c);
  const catalog=window.DigiYarMembershipCatalog;const labels=catalog&&catalog.features?Object.keys(catalog.features).reduce(function(out,id){out[id]=catalog.features[id].label;return out;},{}):{};
  function show(message){card.innerHTML='<div class="dyac-note">'+message+'</div><button type="button" class="dyac-membership-action" data-upgrade-membership>مشاهده و ارتقای سطح اشتراک</button>'}
  const access=window.DigiYarMembershipAccess;
  if(!access||typeof access.refresh!=='function'){show('سامانهٔ بررسی اشتراک هنوز بارگذاری نشده است. تا زمان تأیید سرور، هیچ دسترسی پولی باز نمی‌شود.');return}
  access.refresh().then(function(state){
   if(!state||state.status!=='ready'){
    show(state&&state.status==='unauthenticated'?'برای مشاهدهٔ وضعیت اشتراک، ابتدا باید وارد حساب کاربری تأییدشده شوی.':'در حال حاضر امکان دریافت وضعیت اشتراک از سرور وجود ندارد. تا تأیید سرور، دسترسی پولی باز نمی‌شود.');
    return;
   }
   const paid=state.subscription&&state.subscription.active===true;
   const name=state.planLabel||'پایه';
   const period=paid&&state.subscription.endsAt?'اعتبار تا '+new Date(state.subscription.endsAt).toLocaleDateString('fa-IR'):'رایگان و بدون محدودیت زمانی';
   const features=(state.features||[]).map(function(id){return labels[id]||id}).map(function(label){return '<li>'+esc(label)+'</li>'}).join('');
   card.innerHTML='<div class="dyac-membership-plan"><strong>سطح فعلی: '+esc(name)+'</strong><span class="dyac-membership-status">'+(paid?'فعال':'رایگان')+'</span></div><div class="dyac-note">'+esc(period)+'</div><h3 style="font-size:13px;margin:0">امکانات فعال این حساب</h3><ul class="dyac-membership-features">'+(features||'<li>امکانات پایهٔ دیجی‌یار</li>')+'</ul><button type="button" class="dyac-membership-action" data-upgrade-membership>'+(paid?'مشاهده و تمدید یا ارتقای اشتراک':'ارتقای حساب کاربری')+'</button>';
  }).catch(function(){show('دریافت وضعیت اشتراک ناموفق بود. تا زمان تأیید سرور، دسترسی پولی باز نمی‌شود.')});
 }
 function render(tab){
  page.querySelectorAll('.dyac-tabs [data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const c=$('#dyacContent',page),pr=readProfile();
  if(tab==='personal')c.innerHTML='<h2>اطلاعات شناسایی</h2><div class="dyac-card"><form data-profile-form class="dyac-form"><label>نام<input name="name" value="'+esc(pr.name)+'" autocomplete="given-name"></label><label>نام خانوادگی<input name="family" value="'+esc(pr.family)+'" autocomplete="family-name"></label><label>کد ملی<input name="nationalCode" value="'+esc(pr.nationalCode)+'" inputmode="numeric"></label><label>تاریخ تولد<input name="birthDate" value="'+esc(pr.birthDate)+'" placeholder="مثلاً ۱۳۷۰/۰۵/۱۲"></label><label>شماره موبایل<input name="phone" value="'+esc(pr.phone)+'" inputmode="tel" autocomplete="tel"></label><label>ایمیل<input name="email" type="email" value="'+esc(pr.email)+'" autocomplete="email"></label><button class="dyac-primary" type="submit">ذخیره اطلاعات</button></form></div><h2>اطلاعات تماس</h2><div class="dyac-note">شماره موبایل و ایمیل ثبت‌شده در همین دستگاه نگهداری می‌شوند. تأیید هویت پیامکی هنوز به این صفحه متصل نشده است.</div>';
  if(tab==='addresses'){const a=readAddresses();c.innerHTML='<h2>نشانی‌های من</h2>'+(a.length?a.map((x,i)=>'<article class="dyac-card dyac-address"><strong>'+esc(x.name||'نشانی '+(i+1))+'</strong><p>'+esc(x.province)+'، '+esc(x.city)+'، '+esc(x.address)+'</p><small>کد پستی: '+esc(x.postal||'ثبت نشده')+' | تماس: '+esc(x.phone||'ثبت نشده')+'</small><button type="button" class="dyac-danger" data-address-delete="'+i+'">حذف نشانی</button></article>').join(''):'<div class="dyac-empty"><span>⌖</span><strong>هنوز نشانی‌ای ثبت نکرده‌ای</strong><small>برای دسترسی سریع، نشانی‌های پرکاربردت را اضافه کن.</small></div>')+'<button type="button" class="dyac-primary dyac-add" data-address-add>＋ افزودن نشانی جدید</button><form data-address-form id="dyacAddressForm" class="dyac-card dyac-form" hidden><label>عنوان نشانی<input name="name" placeholder="مثلاً خانه"></label><label>نام تحویل‌گیرنده<input name="phone" placeholder="شماره تماس"></label><label>استان<input name="province" required></label><label>شهر<input name="city" required></label><label>کد پستی<input name="postal" inputmode="numeric"></label><label class="wide">نشانی کامل<textarea name="address" rows="3" required></textarea></label><button class="dyac-primary" type="submit">ذخیره نشانی</button></form>'}
  if(tab==='membership')renderMembership(c);
  if(tab==='finance')c.innerHTML='<h2>امور مالی</h2><div class="dyac-empty"><span>▤</span><strong>هنوز اطلاعات مالی ثبت نشده است</strong><small>در این بخش بعداً می‌توان کیف پول، سوابق تراکنش و روش‌های پرداخت دیجی‌یار را مدیریت کرد. در حال حاضر هیچ تراکنش یا موجودی‌ای به حساب کاربری متصل نیست.</small></div>';
  if(tab==='security')c.innerHTML='<h2>امنیت حساب</h2><div class="dyac-card dyac-security"><strong>مدیریت رمز عبور</strong><p>ورود مستقل با رمز عبور و بازیابی حساب هنوز فعال نشده است.</p><div class="dyac-row"><span>وضعیت تأیید شماره موبایل</span><b>در انتظار اتصال سرویس پیامکی</b></div><div class="dyac-row"><span>ذخیره اطلاعات</span><b>روی همین دستگاه</b></div></div><div class="dyac-note">برای جلوگیری از نمایش وضعیت‌های ساختگی، امکانات امنیتی تا زمان اتصال سامانهٔ احراز هویت غیرفعال نگه داشته شده‌اند.</div>';
  if(tab==='support')c.innerHTML='<h2>پشتیبانی دیجی‌یار</h2><div class="dyac-card dyac-faq"><details><summary>چطور اطلاعات حسابم را ویرایش کنم؟</summary><p>از زبانه اطلاعات فردی، فیلدها را ویرایش و ذخیره کن.</p></details><details><summary>چطور نشانی اضافه کنم؟</summary><p>به زبانه آدرس‌ها برو و گزینه افزودن نشانی جدید را انتخاب کن.</p></details><details><summary>اطلاعات حساب کجا ذخیره می‌شود؟</summary><p>در نسخه فعلی روی همین دستگاه و مرورگر ذخیره می‌شود.</p></details><details><summary>چطور مشکل را گزارش کنم؟</summary><p>از منوی اصلی دیجی‌یار، بخش حساب من و گزارش مشکل به پشتیبانی را باز کن.</p></details></div>';
  c.scrollTop=0;
 }
 function close(){page.remove();main.hidden=page.dataset.oldMainHidden==='true';if(nav){nav.hidden=page.dataset.oldNavHidden==='true';nav.style.display=page.dataset.oldNavDisplay||'';}}
 render('personal');
}
document.addEventListener('click',function(e){const b=e.target.closest('#v6FooterNav [data-v6-action="account"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if($('#dyAccountPage'))return;mount();},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#dyAccountPage')){$('#dyAccountPage [data-back]')?.click()}});
})();