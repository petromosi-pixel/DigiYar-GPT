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
 const page=document.createElement('section');page.id='dyAccountPage';page.dir='rtl';page.setAttribute('aria-label','حساب کاربری دیجی‌یار');
 page.innerHTML='<header class="dyac-top"><button type="button" class="dyac-back" data-back aria-label="بازگشت">→</button><strong>حساب کاربری <b>دیجی‌یار</b></strong><button type="button" class="dyac-support" data-tab="support">پشتیبانی</button></header><div class="dyac-profilebar"><div class="dyac-avatar">'+(p.avatarData?'<img src="'+esc(p.avatarData)+'" alt="عکس پروفایل">':'<span>👤</span>')+'</div><div class="dyac-identity"><strong>'+esc(p.name||'کاربر دیجی‌یار')+'</strong><small>'+esc(p.phone||'برای تکمیل حساب، اطلاعات فردی را وارد کن')+'</small></div><button type="button" data-photo>✎</button><input type="file" accept="image/*" hidden data-photo-input></div><nav class="dyac-tabs" aria-label="بخش‌های حساب"><button class="active" data-tab="personal">اطلاعات فردی</button><button data-tab="addresses">آدرس‌ها</button><button data-tab="finance">مالی</button><button data-tab="security">امنیت حساب</button></nav><div class="dyac-content" id="dyacContent"></div>';
 document.body.appendChild(page);
 const oldMainHidden=main.hidden,oldNavHidden=nav?nav.hidden:false;
 main.hidden=true;if(nav)nav.hidden=true;if(sheet){sheet.classList.remove('is-open')}if(backdrop){backdrop.classList.remove('is-open')}
 page.dataset.oldMainHidden=String(oldMainHidden);page.dataset.oldNavHidden=String(oldNavHidden);
 page.addEventListener('click',e=>{
  const back=e.target.closest('[data-back]');if(back){close();return}
  const tab=e.target.closest('[data-tab]');if(tab){render(tab.dataset.tab);return}
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
 function render(tab){
  page.querySelectorAll('.dyac-tabs [data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const c=$('#dyacContent',page),pr=readProfile();
  if(tab==='personal')c.innerHTML='<h2>اطلاعات شناسایی</h2><div class="dyac-card"><form data-profile-form class="dyac-form"><label>نام<input name="name" value="'+esc(pr.name)+'" autocomplete="given-name"></label><label>نام خانوادگی<input name="family" value="'+esc(pr.family)+'" autocomplete="family-name"></label><label>کد ملی<input name="nationalCode" value="'+esc(pr.nationalCode)+'" inputmode="numeric"></label><label>تاریخ تولد<input name="birthDate" value="'+esc(pr.birthDate)+'" placeholder="مثلاً ۱۳۷۰/۰۵/۱۲"></label><label>شماره موبایل<input name="phone" value="'+esc(pr.phone)+'" inputmode="tel" autocomplete="tel"></label><label>ایمیل<input name="email" type="email" value="'+esc(pr.email)+'" autocomplete="email"></label><button class="dyac-primary" type="submit">ذخیره اطلاعات</button></form></div><h2>اطلاعات تماس</h2><div class="dyac-note">شماره موبایل و ایمیل ثبت‌شده در همین دستگاه نگهداری می‌شوند. تأیید هویت پیامکی هنوز به این صفحه متصل نشده است.</div>';
  if(tab==='addresses'){const a=readAddresses();c.innerHTML='<h2>نشانی‌های من</h2>'+(a.length?a.map((x,i)=>'<article class="dyac-card dyac-address"><strong>'+esc(x.name||'نشانی '+(i+1))+'</strong><p>'+esc(x.province)+'، '+esc(x.city)+'، '+esc(x.address)+'</p><small>کد پستی: '+esc(x.postal||'ثبت نشده')+' | تماس: '+esc(x.phone||'ثبت نشده')+'</small><button type="button" class="dyac-danger" data-address-delete="'+i+'">حذف نشانی</button></article>').join(''):'<div class="dyac-empty"><span>⌖</span><strong>هنوز نشانی‌ای ثبت نکرده‌ای</strong><small>برای دسترسی سریع، نشانی‌های پرکاربردت را اضافه کن.</small></div>')+'<button type="button" class="dyac-primary dyac-add" data-address-add>＋ افزودن نشانی جدید</button><form data-address-form id="dyacAddressForm" class="dyac-card dyac-form" hidden><label>عنوان نشانی<input name="name" placeholder="مثلاً خانه"></label><label>نام تحویل‌گیرنده<input name="phone" placeholder="شماره تماس"></label><label>استان<input name="province" required></label><label>شهر<input name="city" required></label><label>کد پستی<input name="postal" inputmode="numeric"></label><label class="wide">نشانی کامل<textarea name="address" rows="3" required></textarea></label><button class="dyac-primary" type="submit">ذخیره نشانی</button></form>'}
  if(tab==='finance')c.innerHTML='<h2>امور مالی</h2><div class="dyac-empty"><span>▤</span><strong>هنوز اطلاعات مالی ثبت نشده است</strong><small>در این بخش بعداً می‌توان کیف پول، سوابق تراکنش و روش‌های پرداخت دیجی‌یار را مدیریت کرد. در حال حاضر هیچ تراکنش یا موجودی‌ای به حساب کاربری متصل نیست.</small></div>';
  if(tab==='security')c.innerHTML='<h2>امنیت حساب</h2><div class="dyac-card dyac-security"><strong>مدیریت رمز عبور</strong><p>ورود مستقل با رمز عبور و بازیابی حساب هنوز فعال نشده است.</p><div class="dyac-row"><span>وضعیت تأیید شماره موبایل</span><b>در انتظار اتصال سرویس پیامکی</b></div><div class="dyac-row"><span>ذخیره اطلاعات</span><b>روی همین دستگاه</b></div></div><div class="dyac-note">برای جلوگیری از نمایش وضعیت‌های ساختگی، امکانات امنیتی تا زمان اتصال سامانهٔ احراز هویت غیرفعال نگه داشته شده‌اند.</div>';
  if(tab==='support')c.innerHTML='<h2>پشتیبانی دیجی‌یار</h2><div class="dyac-card dyac-faq"><details><summary>چطور اطلاعات حسابم را ویرایش کنم؟</summary><p>از زبانه اطلاعات فردی، فیلدها را ویرایش و ذخیره کن.</p></details><details><summary>چطور نشانی اضافه کنم؟</summary><p>به زبانه آدرس‌ها برو و گزینه افزودن نشانی جدید را انتخاب کن.</p></details><details><summary>اطلاعات حساب کجا ذخیره می‌شود؟</summary><p>در نسخه فعلی روی همین دستگاه و مرورگر ذخیره می‌شود.</p></details><details><summary>چطور مشکل را گزارش کنم؟</summary><p>از منوی اصلی دیجی‌یار، بخش حساب من و گزارش مشکل به پشتیبانی را باز کن.</p></details></div>';
  c.scrollTop=0;
 }
 function close(){page.remove();main.hidden=page.dataset.oldMainHidden==='true';if(nav)nav.hidden=page.dataset.oldNavHidden==='true';}
 render('personal');
}
document.addEventListener('click',function(e){const b=e.target.closest('#v6FooterNav [data-v6-action="account"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if($('#dyAccountPage'))return;mount();},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#dyAccountPage')){$('#dyAccountPage [data-back]')?.click()}});
})();