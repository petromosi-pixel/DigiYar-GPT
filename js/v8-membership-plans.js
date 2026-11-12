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
function bannerMarkup(){return '<button type="button" class="dy-membership-promo" data-open-membership aria-label="مشاهده طرح‌های ارتقای حساب کاربری"><span class="dy-membership-promo-icon" aria-hidden="true">✦</span><span class="dy-membership-promo-copy"><strong>هوشمندتر بخر؛ انتخاب‌های بیشتری پیش روته!</strong><small>امکانات حرفه‌ای و تجاری دیجی‌یار رو کشف کن</small></span><span class="dy-membership-promo-arrow" aria-hidden="true">‹</span></button>'}
function addPromo(target){
 if(!target||!target.isConnected)return;
 var old=target.querySelector(':scope > .dy-membership-promo');
 if(old)return;
 target.insertAdjacentHTML('beforeend',bannerMarkup());
}
var promoTimer=0,lastTarget=null;
function schedulePromo(target){
 if(!target||!target.isConnected)return;
 lastTarget=target;
 if(promoTimer)clearTimeout(promoTimer);
 document.querySelectorAll('.dy-membership-promo').forEach(function(el){el.remove()});
 promoTimer=setTimeout(function(){if(lastTarget&&lastTarget.isConnected)addPromo(lastTarget)},3000);
}
function isVisible(el){return !!(el&&!el.hidden&&el.getClientRects().length)}
function handleHooshyarResults(){
 var candidates=[
  document.getElementById('v5SmartSearchResults'),
  document.getElementById('v5InlineResults'),
  document.getElementById('digiyarConversation'),
  document.getElementById('resultSection')
 ];
 var target=candidates.find(function(el){return isVisible(el)&&el.querySelector('.digiyar-product-card,.recommendation,[data-product-id],.v9-assistant-result,.store-result,.v8-store-result')});
 if(!target){
  target=candidates.find(function(el){return isVisible(el)&&el.id==='v5SmartSearchResults'});
 }
 if(target)schedulePromo(target);
}
document.addEventListener('click',function(e){if(e.target.closest('[data-open-membership]'))open()});
window.addEventListener('digiyar:hooshyar-results-ready',function(){setTimeout(handleHooshyarResults,0)});
window.addEventListener('digiyar:v9-assistant-results',function(){setTimeout(handleHooshyarResults,0)});
window.addEventListener('digiyar:product-results-ready',function(){setTimeout(handleHooshyarResults,0)});
var observer=new MutationObserver(function(records){
 var relevant=records.some(function(record){return Array.from(record.addedNodes||[]).some(function(node){return node.nodeType===1&&(node.matches('.recommendation,.digiyar-product-card,[data-product-id],.v9-assistant-result,.store-result,.v8-store-result')||node.querySelector&&node.querySelector('.recommendation,.digiyar-product-card,[data-product-id],.v9-assistant-result,.store-result,.v8-store-result'))})});
 if(relevant){
  var target=records.map(function(r){return r.target&&r.target.nodeType===1?r.target.closest('#v5SmartSearchResults,#v5InlineResults,#digiyarConversation,#resultSection'):null}).find(Boolean);
  if(target&&isVisible(target))schedulePromo(target);
 }
});
observer.observe(document.body,{childList:true,subtree:true});
renderPrices();
window.DigiYarMembershipOpen=open;
window.DigiYarMembershipClose=close;
window.DigiYarMembershipPlans=Object.freeze({
 version:CONFIG.version,pricingStatus:CONFIG.pricingStatus,paymentEnabled:CONFIG.paymentEnabled,
 getPlans:function(){return JSON.parse(JSON.stringify(CONFIG.plans))},
 getSelectedDuration:function(){return selectedMonths}
});
})();
