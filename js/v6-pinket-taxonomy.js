/* DigiYar V6 — Store #13: Pinket taxonomy
   Source: Pinket grocery marketplace scope
   Structure: category → subcategory → brand → budget
*/
(function(){
'use strict';
var STORE='pinket';
var ROOTS=[
 ['fresh','میوه و سبزیجات تازه'],['grocery','خواروبار و مواد غذایی'],['protein','مواد پروتئینی'],['dairy-eggs','لبنیات و تخم‌مرغ'],
 ['drinks','نوشیدنی'],['snacks','تنقلات و خشکبار'],['household','شوینده و لوازم خانه'],['personal-care','بهداشت و مراقبت شخصی'],
 ['baby','مادر و کودک'],['frozen','مواد غذایی منجمد'],['bakery','نان و محصولات نانوایی'],['other','سایر کالاهای روزمره']
];
var SUBS={
 fresh:[['fruit','میوه'],['vegetables','سبزیجات'],['greens-herbs','سبزی خوردن و سبزی معطر'],['salad','سالاد و محصولات آماده']],
 grocery:[['rice-grains','برنج و غلات'],['pasta','ماکارونی و پاستا'],['oil','روغن'],['canned','کنسرو و غذای آماده'],['sauces','سس و چاشنی'],['sugar-salt','قند، شکر و نمک'],['legumes','حبوبات'],['breakfast','صبحانه و مربا'],['tomato-products','رب و محصولات گوجه']],
 protein:[['red-meat','گوشت قرمز'],['chicken','مرغ و فرآورده‌های مرغ'],['fish-seafood','ماهی و آبزیان'],['processed-meat','سوسیس، کالباس و فرآورده‌های گوشتی']],
 'dairy-eggs':[['milk','شیر'],['cheese','پنیر'],['yogurt','ماست'],['butter-cream','کره و خامه'],['eggs','تخم‌مرغ']],
 drinks:[['water','آب و آب معدنی'],['soft-drinks','نوشابه و نوشیدنی گازدار'],['juice','آبمیوه و نوشیدنی میوه‌ای'],['tea-coffee','چای و قهوه'],['energy-drinks','نوشیدنی انرژی‌زا'],['malt-drinks','ماءالشعیر و نوشیدنی مالت']],
 snacks:[['chips','چیپس و اسنک'],['biscuits','بیسکویت و ویفر'],['chocolate','شکلات و آبنبات'],['nuts','آجیل و مغزها'],['dried-fruit','خشکبار و میوه خشک'],['popcorn','پاپ‌کورن']],
 household:[['laundry','شوینده لباس'],['dishwashing','شوینده ظروف'],['surface-cleaning','شوینده سطوح'],['paper-products','محصولات سلولزی'],['trash-bags','کیسه زباله'],['home-essentials','ملزومات خانه']],
 'personal-care':[['oral-care','بهداشت دهان و دندان'],['hair-care','مراقبت مو'],['body-care','مراقبت بدن'],['deodorant','دئودورانت و ضدتعریق'],['shaving','اصلاح و پیرایش'],['feminine-care','بهداشت بانوان']],
 baby:[['diapers','پوشک کودک'],['baby-food','غذای کودک'],['baby-care','بهداشت و مراقبت کودک'],['baby-essentials','ملزومات کودک']],
 frozen:[['frozen-food','غذاهای آماده منجمد'],['frozen-vegetables','سبزیجات منجمد'],['ice-cream','بستنی و دسر']],
 bakery:[['bread','نان'],['cake-pastry','کیک و شیرینی'],['breakfast-bakery','محصولات صبحانه و نانوایی']],
 other:[['misc','کالاهای متفرقه']]
};
var BRANDS={
 fruit:['میهن','سایر'],vegetables:['نوبر سبز','سایر'], 'greens-herbs':['سایر'],salad:['سایر'],
 'rice-grains':['طبیعت','گلستان','محسن','هاشمی'],pasta:['زر ماکارون','تک ماکارون','مانا'],oil:['اویلا','طبیعت','لاله','غنچه'],canned:['یک و یک','دلپذیر','چین‌چین'],sauces:['یک و یک','دلپذیر','بیژن'], 'sugar-salt':['گلستان','ساحل'],legumes:['گلستان','طبیعت','محسن'],breakfast:['یک و یک','کاله','صباح'],'tomato-products':['یک و یک','چین‌چین','طبیعت'],
 'red-meat':['مهیا پروتئین','پروماک','سایر'],chicken:['مهیا پروتئین','سوییس‌مکس','سایر'], 'fish-seafood':['کاله','مهیا پروتئین','سایر'], 'processed-meat':['کاله','202','مهیا پروتئین'],
 milk:['کاله','میهن','پگاه'],cheese:['کاله','میهن','پگاه'],yogurt:['کاله','میهن','پگاه'], 'butter-cream':['کاله','میهن','پگاه'],eggs:['تلاونگ','سیمرغ','سایر'],
 water:['دماوند','واتا','آب معدنی ایران'], 'soft-drinks':['کوکاکولا','پپسی','زمزم'],juice:['سن‌ایچ','تکدانه','سن‌ایچ پلاس'], 'tea-coffee':['گلستان','محمود','شیرین عسل'], 'energy-drinks':['ردبول','هایپ','سن‌ایچ'], 'malt-drinks':['ایستک','دلستر','سن‌ایچ'],
 chips:['چی‌توز','مزمز','باتو'],biscuits:['می‌نو','شیرین عسل','ویتانا'],chocolate:['شیرین عسل','باراکا','آیدین'],nuts:['مزمز','سلمان','سایر'], 'dried-fruit':['سایر'],popcorn:['چی‌توز','مزمز'],
 laundry:['پرسیل','تاژ','سافتلن','اکتیو'],dishwashing:['پریل','فینیش','راپیدو'], 'surface-cleaning':['اکتیو','هوم‌کر','سیف'], 'paper-products':['گلرنگ','تن‌پاک','فامیل'], 'trash-bags':['تن‌پاک','فانتوم'], 'home-essentials':['گلرنگ','سایر'],
 'oral-care':['سیگنال','کرست','اورال‌بی','میسویک'], 'hair-care':['شون','سینره','پریم','کلیر'], 'body-care':['داو','کامان','مای'],deodorant:['داو','نیوا','کامان'],shaving:['ژیلت','نیوا','فیلیپس'], 'feminine-care':['مولفیکس','مای‌لیدی','پنبه‌ریز'],
 diapers:['مولفیکس','مای بیبی','پمپرز'], 'baby-food':['آپتامیل','نان','هیپ'], 'baby-care':['چیکو','فیلیپس اونت','جانسون'], 'baby-essentials':['چیکو','فیلیپس اونت'],
 'frozen-food':['کاله','پمینا','نوبر سبز'], 'frozen-vegetables':['نوبر سبز','پمینا'], 'ice-cream':['میهن','کاله','دومینو'],
 bread:['نان سحر','نان آوران','سایر'], 'cake-pastry':['شیرین عسل','رضوی','سایر'], 'breakfast-bakery':['نان سحر','سایر'],
 misc:['گلستان','کاله','سایر']
};
function $(id){return document.getElementById(id)}
function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
function roots(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||BRANDS.misc;var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6PinketTaxonomy){st.dataset.v6PinketTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(roots,30)})}if(!c.dataset.v6PinketTaxonomy){c.dataset.v6PinketTaxonomy='1';c.addEventListener('change',function(){setTimeout(subs,30)})}if(s&&!s.dataset.v6PinketBrand){s.dataset.v6PinketBrand='1';s.addEventListener('change',function(){setTimeout(brand,30)})}if(selected())roots();return true}
function boot(){if(bind())return;setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();