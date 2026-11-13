/* DigiYar V6 — Store #14: Darukade taxonomy
   Source: current Darukade navigation/products
   Structure: category → subcategory → brand → budget
*/
(function(){
'use strict';
var STORE='darukade';
var ROOTS=[['beauty','آرایشی و بهداشتی'],['supplements','مکمل غذایی و کمک درمانی'],['sports-supplements','مکمل ورزشی'],['mother-child','مادر و کودک'],['medical','تجهیزات پزشکی']];
var SUBS={
 beauty:[['skin-care','مراقبت پوست'],['hair-care','مراقبت مو'],['sun-care','ضدآفتاب'],['makeup','آرایشی'],['body-care','مراقبت بدن'],['oral-care','بهداشت دهان و دندان'],['personal-care','بهداشت شخصی'],['perfume','عطر و خوشبوکننده']],
 supplements:[['vitamins-minerals','ویتامین و مواد معدنی'],['omega','امگا 3 و روغن ماهی'],['specialized','مکمل‌های تخصصی'],['weight-control','کاهش وزن'],['herbal','داروهای گیاهی'],['energy','تقویت انرژی و عملکرد'],['men-women','تقویت آقایان و بانوان']],
 'sports-supplements':[['protein','پروتئین و گینر'],['creatine','کراتین'],['bcaa','BCAA و آمینواسید'],['fat-burner','چربی‌سوز'],['pre-workout','پیش‌تمرین'],['bars','بار خوراکی']],
 'mother-child':[['baby-food','غذای کودک'],['kids-vitamins','مکمل کودک'],['baby-care','مراقبت کودک'],['pregnancy','مادر باردار و شیرده']],
 medical:[['diagnostic','تجهیزات اندازه‌گیری و تشخیصی'],['respiratory','تجهیزات تنفسی'],['orthopedic','ارتوپدی و توانبخشی'],['wound-care','زخم و پانسمان'],['personal-medical','تجهیزات مصرفی پزشکی']]
};
var BRANDS={
 'skin-care':['ساین اسکین','بایو مارین','درم انجلین','پرایم','آردن','هیدرودرم','بیودرما'],
 'hair-care':['لوکسوکلون','سریتا','لافارر','پریم','ساین اسکین'], 'sun-care':['سان سیف','آردن سولاریس','ساین اسکین','ویتالیر','ژوت'],
 makeup:['کالیستا','مای','نوت','پریم'], 'body-care':['کامان','داو','هیدرودرم','پریم'], 'oral-care':['سیگنال','اورال‌بی','میسویک','کرست'], 'personal-care':['دافی','کامان','مای','نیوا'],perfume:['ژک ساف','مای','اسپریس','روبرتو'],
 'vitamins-minerals':['یوروویتال','نیچرز پلنتی','ویتالی‌تون','دانا','هلث اید'],omega:['نکستایل','یوروویتال','دانا','نورم لایف'],specialized:['دایونیکس فارما','فورت ای','ویتالایز','نوتری پاد'], 'weight-control':['نکستایل','یوروویتال','دوبیس'],herbal:['گل دارو','دینه','زردبند'],energy:['یوروویتال','نوتریمد','ویتالایز'],'men-women':['یوروویتال','دانا','اکسیر آفرین آریا'],
 protein:['نوتریمد','دوبیس','یوروویتال','آپتونیا'],creatine:['نوتریمد','دوبیس','کارن'],bcaa:['نوتریمد','دوبیس','کارن'],'fat-burner':['یوروویتال','نوتریمد','دوبیس'],'pre-workout':['نوتریمد','دوبیس','کارن'],bars:['کاله','مزمز','سایر'],
 'baby-food':['آپتامیل','نان','هیپ','بیومیل'],'kids-vitamins':['یوروویتال','پدیابست','فیشر کیندر','بایوکل'],'baby-care':['چیکو','فیلیپس اونت','جانسون'],pregnancy:['یوروویتال','پدیابست','دانا'],
 diagnostic:['بیورر','رزمکس','امسیگ','زنیت مد'],respiratory:['زنیت مد','بیورر','امسیگ'],orthopedic:['طب و صنعت','تن‌یار','آدور'], 'wound-care':['درافیل','پانسمان‌ساز','سایر'],'personal-medical':['بیورر','امسیگ','زنیت مد']
};
function $(id){return document.getElementById(id)}
function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
function roots(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||['سایر'];var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6DarukadeTaxonomy){st.dataset.v6DarukadeTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(roots,30)})}if(!c.dataset.v6DarukadeTaxonomy){c.dataset.v6DarukadeTaxonomy='1';c.addEventListener('change',function(){setTimeout(subs,30)})}if(s&&!s.dataset.v6DarukadeBrand){s.dataset.v6DarukadeBrand='1';s.addEventListener('change',function(){setTimeout(brand,30)})}if(selected())roots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();