/* DigiYar membership page + selectable plans, duration and results promotion. */
(function(){
'use strict';
var CONFIG={version:'2.1.0',pricingStatus:'illustrative_only',paymentEnabled:false,
 durations:[{months:1,discount:0},{months:3,discount:8},{months:6,discount:15},{months:9,discount:21},{months:12,discount:28}],
 plans:{base:{title:'پایه',monthlyPrice:0},professional:{title:'حرفه‌ای',monthlyPrice:199000},commercial:{title:'تجاری',monthlyPrice:499000}}};
var root=document.getElementById('v8MembershipPlans'),page=document.getElementById('dyMembershipPage');if(!root||!page)return;
var fmt=new Intl.NumberFormat('fa-IR'),selectedPlan=null,selectedMonths=null;
var durationToggle=root.querySelector('#v8MembershipDurationToggle'),durationPanel=root.querySelector('#v8MembershipDurations'),durationWrap=root.querySelector('#v8MembershipDurationWrap');
var costValue=root.querySelector('#v8MembershipCostValue'),costDetail=root.querySelector('#v8MembershipCostDetail'),durationHint=root.querySelector('#v8MembershipDurationHint');
var paymentTrigger=root.querySelector('#v8MembershipPayTrigger'),paymentPanel=root.querySelector('#v8MembershipPaymentMethods'),paymentNote=root.querySelector('#v8MembershipPaymentNote');
function money(value){return fmt.format(Math.round(value))+' تومان';}
function setDurationOptions(){
 if(!durationPanel)return;
 if(selectedPlan==='base'){durationPanel.innerHTML='<button type="button" data-membership-duration="lifetime" aria-pressed="false">بدون محدودیت زمانی</button>';if(durationHint)durationHint.textContent='سطح پایه رایگان است و نیازی به تمدید دوره‌ای ندارد.'}
 else{durationPanel.innerHTML='<button type="button" data-membership-duration="1" aria-pressed="false">۱ ماه</button><button type="button" data-membership-duration="3" aria-pressed="false">۳ ماه</button><button type="button" data-membership-duration="6" aria-pressed="false">۶ ماه</button><button type="button" data-membership-duration="9" aria-pressed="false">۹ ماه</button><button type="button" data-membership-duration="12" aria-pressed="false">۱۲ ماه</button>';if(durationHint)durationHint.textContent='مدت موردنظر را انتخاب کنید تا هزینهٔ نهایی محاسبه شود.'}
}
function updateCost(){
 if(!selectedPlan){costValue.textContent='ابتدا سطح اشتراک را انتخاب کنید';costDetail.textContent='مبلغ نهایی پس از انتخاب سطح و مدت اشتراک نمایش داده می‌شود.';return}
 if(selectedPlan==='base'){costValue.textContent='رایگان';costDetail.textContent='سطح پایه بدون محدودیت زمانی است.';return}
 if(!selectedMonths){costValue.textContent='مدت اشتراک را انتخاب کنید';costDetail.textContent='پس از انتخاب مدت، مبلغ نهایی با تخفیف همان دوره محاسبه می‌شود.';return}
 var plan=CONFIG.plans[selectedPlan],duration=CONFIG.durations.find(function(x){return x.months===selectedMonths}),original=plan.monthlyPrice*duration.months,total=Math.round(original*(1-duration.discount/100));
 costValue.textContent=money(total);costDetail.textContent=fmt.format(duration.months)+' ماه · '+(duration.discount?fmt.format(duration.discount)+'٪ تخفیف · ':'بدون تخفیف · ')+'مبلغ پایه '+money(original);
}
function openDurationStep(){
 if(durationPanel)durationPanel.hidden=false;if(durationToggle)durationToggle.setAttribute('aria-expanded','true');
 if(durationWrap){durationWrap.classList.remove('is-attention');void durationWrap.offsetWidth;durationWrap.classList.add('is-attention');setTimeout(function(){durationWrap.scrollIntoView({behavior:'smooth',block:'center'})},80)}
}
function choosePlan(button){
 selectedPlan=button.getAttribute('data-membership-plan');selectedMonths=null;
 root.querySelectorAll('[data-membership-plan]').forEach(function(item){item.setAttribute('aria-pressed',String(item===button))});
 setDurationOptions();updateCost();openDurationStep();
}
root.querySelectorAll('[data-membership-plan]').forEach(function(button){button.addEventListener('click',function(){choosePlan(button)})});
if(durationToggle&&durationPanel)durationToggle.addEventListener('click',function(){var expanded=durationToggle.getAttribute('aria-expanded')==='true';durationToggle.setAttribute('aria-expanded',String(!expanded));durationPanel.hidden=expanded});
if(durationPanel)durationPanel.addEventListener('click',function(event){
 var button=event.target.closest('[data-membership-duration]');if(!button||!selectedPlan)return;
 var value=button.getAttribute('data-membership-duration');selectedMonths=value==='lifetime'?'lifetime':Number(value);
 durationPanel.querySelectorAll('[data-membership-duration]').forEach(function(item){item.setAttribute('aria-pressed',String(item===button))});
 durationWrap.classList.remove('is-attention');updateCost();
});
if(paymentTrigger&&paymentPanel)paymentTrigger.addEventListener('click',function(){var expanded=paymentTrigger.getAttribute('aria-expanded')==='true';paymentTrigger.setAttribute('aria-expanded',String(!expanded));paymentPanel.hidden=expanded});
if(paymentPanel)paymentPanel.addEventListener('click',function(event){var option=event.target.closest('[data-payment-method]');if(!option)return;paymentPanel.querySelectorAll('[data-payment-method]').forEach(function(item){item.setAttribute('aria-pressed',String(item===option))});if(paymentNote)paymentNote.textContent='روش «'+option.textContent.trim()+'» انتخاب شد؛ اتصال سرویس و انجام تراکنش هنوز فعال نیست.'});
function open(){page.hidden=false;page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var content=page.querySelector('.dy-membership-page-content');if(content)content.scrollTop=0;var back=page.querySelector('[data-membership-back]');if(back)back.focus({preventScroll:true})}
function close(){page.hidden=true;page.setAttribute('aria-hidden','true');document.body.style.overflow=''}
page.addEventListener('click',function(e){if(e.target.closest('[data-membership-back]'))close()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!page.hidden)close()});
function popupMarkup(){return '<div class="dy-membership-popup-backdrop" data-membership-popup><section class="dy-membership-popup" role="dialog" aria-modal="true" aria-label="ارتقای حساب کاربری"><button type="button" class="dy-membership-popup-close" data-membership-popup-close aria-label="بستن پیشنهاد">×</button><span class="dy-membership-popup-icon" aria-hidden="true">✦</span><strong>خرید هوشمند، یک قدم جلوتر!</strong><small>قدرت امکانات حرفه‌ای و تجاری دیجی‌یار رو تجربه کن</small><button type="button" class="dy-membership-popup-action" data-open-membership>ارتقای حساب من ‹</button></section></div>'}
var promoTimer=0,popupTimer=0,lastTarget=null;
function closePromo(){if(popupTimer)clearTimeout(popupTimer);popupTimer=0;var popup=document.querySelector('.dy-membership-popup-backdrop');if(popup)popup.remove()}
function showPromo(){closePromo();document.body.insertAdjacentHTML('beforeend',popupMarkup());popupTimer=setTimeout(closePromo,10000)}
function schedulePromo(target){if(!target||!target.isConnected)return;lastTarget=target;if(promoTimer)clearTimeout(promoTimer);closePromo();promoTimer=setTimeout(function(){if(lastTarget&&lastTarget.isConnected)showPromo()},3000)}
function isVisible(el){return !!(el&&!el.hidden&&el.getClientRects().length)}
function hasResultData(detail){
 if(detail&&((Array.isArray(detail.products)&&detail.products.length)||(Array.isArray(detail.stores)&&detail.stores.length)))return true;
 var assistant=window.DigiYarHooshyarAssistant;if(assistant&&typeof assistant.getState==='function'){try{var state=assistant.getState();if(state&&((state.products&&state.products.length)||(state.stores&&state.stores.length)))return true}catch(_){}}
 var selectors='.digiyar-product-card,.product-card,.recommendation,.recommendations > *,[data-product-id],.v9-assistant-result,.store-result,.v8-store-result,.v7-store-card';return Array.from(document.querySelectorAll(selectors)).some(function(el){return isVisible(el)});
}
function handleHooshyarResults(event){if(!hasResultData(event&&event.detail))return;schedulePromo(document.body)}
document.addEventListener('click',function(e){if(e.target.closest('[data-membership-popup-close]')){closePromo();return}if(e.target.closest('[data-open-membership]')){closePromo();open()}});
['digiyar:hooshyar-results-ready','digiyar:v9-assistant-results','digiyar:v7-product-results-ready','digiyar:v7-product-results','digiyar:product-results-ready'].forEach(function(name){window.addEventListener(name,handleHooshyarResults)});
updateCost();window.DigiYarMembershipOpen=open;window.DigiYarMembershipClose=close;
window.DigiYarMembershipPlans=Object.freeze({version:CONFIG.version,pricingStatus:CONFIG.pricingStatus,paymentEnabled:CONFIG.paymentEnabled,getPlans:function(){return JSON.parse(JSON.stringify(CONFIG.plans))},getSelectedPlan:function(){return selectedPlan},getSelectedDuration:function(){return selectedMonths}});
})();
