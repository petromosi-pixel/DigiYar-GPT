/* DigiYar membership plan preview. Deliberately no checkout, payment, or paid entitlement. */
(function(){
'use strict';
var CONFIG={
 version:'1.0.0',
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
if(!root)return;
var fmt=new Intl.NumberFormat('fa-IR');
var selectedMonths=1;
function money(value){return fmt.format(Math.round(value))+' تومان';}
function renderPrices(){
 var duration=CONFIG.durations.find(function(x){return x.months===selectedMonths;})||CONFIG.durations[0];
 ['professional','commercial'].forEach(function(id){
  var plan=CONFIG.plans[id],original=plan.monthlyPrice*duration.months;
  var total=Math.round(original*(1-duration.discount/100));
  var price=root.querySelector('[data-plan-price="'+id+'"]');
  var period=root.querySelector('[data-plan-period="'+id+'"]');
  var old=root.querySelector('[data-plan-original="'+id+'"]');
  if(price)price.textContent=money(total);
  if(period)period.textContent='برای '+fmt.format(duration.months)+' '+(duration.months===12?'ماه (یک‌ساله)':'ماه');
  if(old)old.textContent=duration.discount?money(original)+' · '+fmt.format(duration.discount)+'٪ تخفیف آزمایشی':'قیمت نمایشی؛ بدون تخفیف دوره‌ای';
 });
}
root.querySelectorAll('[data-membership-duration]').forEach(function(button){
 button.addEventListener('click',function(){
  selectedMonths=Number(button.getAttribute('data-membership-duration'))||1;
  root.querySelectorAll('[data-membership-duration]').forEach(function(item){item.setAttribute('aria-pressed',String(item===button));});
  renderPrices();
 });
});
root.querySelectorAll('[data-membership-choose]').forEach(function(button){
 button.addEventListener('click',function(){
  var plan=CONFIG.plans[button.getAttribute('data-membership-choose')];
  var notice=document.getElementById('v8MembershipNotice');
  if(notice)notice.textContent='سطح '+plan.title+' انتخاب شد؛ ثبت‌نام و پرداخت هنوز فعال نیست. این قیمت صرفاً برای نمایش ساختار اشتراک است و هیچ مبلغی از شما دریافت نمی‌شود.';
 });
});
renderPrices();
window.DigiYarMembershipPlans=Object.freeze({
 version:CONFIG.version,
 pricingStatus:CONFIG.pricingStatus,
 paymentEnabled:CONFIG.paymentEnabled,
 getPlans:function(){return JSON.parse(JSON.stringify(CONFIG.plans));},
 getSelectedDuration:function(){return selectedMonths;}
});
})();
