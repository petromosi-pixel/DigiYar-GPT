/* DigiYar membership plans page + transparent pricing preview. No payment/entitlement activation. */
(function(){
'use strict';
var CONFIG={
 version:'1.1.0',
 pricingStatus:'illustrative_only',
 paymentEnabled:false,
 durations:[{months:1,discount:0},{months:3,discount:8},{months:6,discount:15},{months:9,discount:21},{months:12,discount:28}],
 plans:{
  base:{title:'پایه',monthlyPrice:0},
  professional:{title:'حرفه‌ای',monthlyPrice:199000},
  commercial:{title:'تجاری',monthlyPrice:499000}
 }
};
var root=document.getElementById('v8MembershipPlans');
var page=document.getElementById('dyMembershipPage');
if(!root||!page)return;
var fmt=new Intl.NumberFormat('fa-IR'),selectedMonths=1;
function money(value){return fmt.format(Math.round(value))+' تومان';}
function renderPrices(){
 var duration=CONFIG.durations.find(function(x){return x.months===selectedMonths;})||CONFIG.durations[0];
 ['professional','commercial'].forEach(function(id){
  var plan=CONFIG.plans[id],original=plan.monthlyPrice*duration.months,total=Math.round(original*(1-duration.discount/100));
  var price=root.querySelector('[data-plan-price="'+id+'"]'),period=root.querySelector('[data-plan-period="'+id+'"]'),old=root.querySelector('[data-plan-original="'+id+'"]');
  if(price)price.textContent=money(total);
  if(period)period.textContent='برای '+fmt.format(duration.months)+' '+(duration.months===12?'ماه (یک‌ساله)':'ماه');
  if(old)old.textContent=duration.discount?money(original)+' · '+fmt.format(duration.discount)+'٪ تخفیف آزمایشی':'قیمت نمایشی؛ بدون تخفیف دوره‌ای';
 });
}
function open(){
 page.hidden=false;page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 var content=page.querySelector('.dy-membership-page-content');if(content)content.scrollTop=0;
 var back=page.querySelector('[data-membership-back]');if(back)back.focus({preventScroll:true});
}
function close(){page.hidden=true;page.setAttribute('aria-hidden','true');document.body.style.overflow='';}
page.addEventListener('click',function(e){if(e.target.closest('[data-membership-back]'))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!page.hidden)close()});
root.querySelectorAll('[data-membership-duration]').forEach(function(button){
 button.addEventListener('click',function(){
  selectedMonths=Number(button.getAttribute('data-membership-duration'))||1;
  root.querySelectorAll('[data-membership-duration]').forEach(function(item){item.setAttribute('aria-pressed',String(item===button))});
  renderPrices();
 });
});
root.querySelectorAll('[data-membership-choose]').forEach(function(button){
 button.addEventListener('click',function(){
  var plan=CONFIG.plans[button.getAttribute('data-membership-choose')],notice=document.getElementById('v8MembershipNotice');
  if(notice)notice.textContent='سطح '+plan.title+' انتخاب شد؛ ثبت‌نام و پرداخت هنوز فعال نیست. این قیمت صرفاً برای نمایش ساختار اشتراک است و هیچ مبلغی از شما دریافت نمی‌شود.';
 });
});
function popupMarkup(){return '<div class="dy-membership-popup-backdrop" data-membership-popup><section class="dy-membership-popup" role="dialog" aria-modal="true" aria-label="ارتقای حساب کاربری"><button type="button" class="dy-membership-popup-close" data-membership-popup-close aria-label="بستن پیشنهاد">×</button><span class="dy-membership-popup-icon" aria-hidden="true">✦</span><strong>هوشمندتر بخر؛ انتخاب‌های بیشتری پیش روته!</strong><small>امکانات حرفه‌ای و تجاری دیجی‌یار رو کشف کن</small><button type="button" class="dy-membership-popup-action" data-open-membership>مشاهده امکانات ‹</button></section></div>'}
var promoTimer=0,popupTimer=0,lastTarget=null;
function closePromo(){if(popupTimer)clearTimeout(popupTimer);popupTimer=0;var popup=document.querySelector('.dy-membership-popup-backdrop');if(popup)popup.remove()}
function showPromo(){closePromo();document.body.insertAdjacentHTML('beforeend',popupMarkup());popupTimer=setTimeout(closePromo,10000)}
function schedulePromo(target){if(!target||!target.isConnected)return;lastTarget=target;if(promoTimer)clearTimeout(promoTimer);closePromo();promoTimer=setTimeout(function(){if(lastTarget&&lastTarget.isConnected)showPromo()},3000)}
function isVisible(el){return !!(el&&!el.hidden&&el.getClientRects().length)}
function hasResultData(detail){
 if(detail&&((Array.isArray(detail.products)&&detail.products.length)||(Array.isArray(detail.stores)&&detail.stores.length)))return true;
 var assistant=window.DigiYarHooshyarAssistant;
 if(assistant&&typeof assistant.getState==='function'){
  try{var state=assistant.getState();if(state&&((state.products&&state.products.length)||(state.stores&&state.stores.length)))return true;}catch(_){}
 }
 var selectors='.digiyar-product-card,.product-card,.recommendation,.recommendations > *,[data-product-id],.v9-assistant-result,.store-result,.v8-store-result,.v7-store-card';
 return Array.from(document.querySelectorAll(selectors)).some(function(el){return isVisible(el)});
}
function handleHooshyarResults(event){
 var detail=event&&event.detail;
 if(!hasResultData(detail))return;
 schedulePromo(document.body);
}
function onProductResults(event){handleHooshyarResults(event)}
document.addEventListener('click',function(e){if(e.target.closest('[data-membership-popup-close]')){closePromo();return}if(e.target.closest('[data-open-membership]')){closePromo();open()}});
/* Listen to the actual producer/assistant event names. Product-result events carry data;
   the final Hooshyar-ready event is also checked against the assistant state. */
['digiyar:hooshyar-results-ready','digiyar:v9-assistant-results','digiyar:v7-product-results-ready','digiyar:v7-product-results','digiyar:product-results-ready'].forEach(function(name){
 window.addEventListener(name,onProductResults);
});
renderPrices();
window.DigiYarMembershipOpen=open;
window.DigiYarMembershipClose=close;
window.DigiYarMembershipPlans=Object.freeze({
 version:CONFIG.version,pricingStatus:CONFIG.pricingStatus,paymentEnabled:CONFIG.paymentEnabled,
 getPlans:function(){return JSON.parse(JSON.stringify(CONFIG.plans))},
 getSelectedDuration:function(){return selectedMonths}
});
})();
