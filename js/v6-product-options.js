/* DigiYar V6 — Product options bridge
 * Extends Step-4 product flow without replacing the native taxonomy controller.
 * Adds relevant brand selection for every digital subcategory and a 10-band
 * تومان budget selector up to 1 billion تومان.
 */
(function(){
  'use strict';

  var BRAND_MAP={
    mobile:['سامسونگ','شیائومی','اپل','نوکیا','ریلمی','آنر','موتورولا','هواوی','گوگل پیکسل','پوکو','وان‌پلاس','ناتینگ فون','تکنو'],
    laptop:['لنوو','ایسوس','اچ‌پی','دل','ایسر','اپل','مایکروسافت','ام‌اس‌آی','سامسونگ','هواوی'],
    tablet:['اپل','سامسونگ','شیائومی','لنوو','هواوی','مایکروسافت','نوکیا'],
    headphones:['اپل','سامسونگ','سونی','جی‌بی‌ال','انکر','شیائومی','هواوی','بیتس','سنهایزر','هایلو'],
    tv:['سامسونگ','ال‌جی','سونی','هایسنس','TCL','شیائومی','دوو','اسنوا','ایکس‌ویژن'],
    camera:['کانن','نیکون','سونی','فوجی‌فیلم','پاناسونیک','گوپرو','دی‌جی‌آی'],
    accessories:['انکر','شیائومی','سامسونگ','اپل','بیسوس','آکی','یوگرین','روموس','گرین','تسکو'],
    gaming:['سونی','مایکروسافت','نینتندو','ایسوس','لنوو','ام‌اس‌آی','لاجیتک','ریزر'],
    'smart-home':['شیائومی','سامسونگ','آمازون','گوگل','فیلیپس','ت‌پی-لینک'],
    appliance:['سامسونگ','ال‌جی','بوش','فیلیپس','دوو','اسنوا','پاکشوما','جی‌پلاس','هیمالیا'],
    kitchen:['فیلیپس','بوش','مولینکس','تفال','کنوود','پارس‌خزر','گوسونیک','سنکور'],
    decoration:['ایکیا','هوم‌سنتر','چشمه‌نور','بلانتون','کیاور'],
    cleaning:['فیلیپس','بوش','کرشر','پارس‌خزر','پاکشوما','اسنوا'],
    men:['ال‌سی‌من','جین‌وست','تن‌درست','نیکتا','آر‌ان‌اس'],
    women:['دورس','نیلپر','جوتی‌جینز','شیک‌پوش','تن‌درست'],
    kids:['ال‌سی‌وایکیکی','چیکو','زرافه','نیلی','فیورلا'],
    shoes:['نایک','آدیداس','پوما','اسکیچرز','سالامون','هامتو','کفش ملی'],
    bags:['سامسونت','آدیداس','نایک','دیوید جونز','چرم مشهد'],
    skin:['نیوا','لورآل','اوریاژ','لاروش پوزای','سینره','مای','کامان'],
    hair:['لورآل','شوارتسکف','او جی ایکس','پنتن','مای','سینره'],
    makeup:['مک','میبلین','لورآل','بورژوا','کالیستا','مای','این‌لی'],
    personal:['نیوا','داو','ژیلت','فیلیپس','مای','کامان'],
    fitness:['نایکی','آدیداس','ریبوک','شیائومی','گارمین','فیت‌فلکس'],
    outdoor:['کچوا','کلمبیا','نورث‌فیس','سالومون','هامتو'],
    clothing:['نایکی','آدیداس','پوما','ریبوک','جک‌ولف‌اسکین'],
    equipment:['نایکی','آدیداس','ریبوک','تکنوجیم','پروفورم'],
    book:['نشر چشمه','نشر نی','امیرکبیر','افق','ققنوس'],
    stationery:['پاپکو','پنتر','استدلر','فابرکاستل','کلیپس'],
    art:['فابرکاستل','استدلر','پنتل','روترینگ','کوه‌ای‌نور'],
    baby:['چیکو','فیلیپس اونت','جانسون','مولفیکس','مای بیبی'],
    toy:['لگو','مگا بلاکس','هاسبرو','متل','فانکو'],
    school:['پاپکو','پنتر','فابرکاستل','استدلر'],
    auto:['ایساکو','بوش','دنسو','والئو','کروز'],
    tools:['بوش','ماکیتا','دیوالت','رونیکس','توسن','آروا'],
    motorcycle:['هوندا','یاماها','باجاج','TVS','کاوازاکی'],
    food:['یک‌ویک','گلستان','چین‌چین','تبرک','کاله'],
    beverage:['سن‌ایچ','رانی','شیرین‌عسل','کاله','میهن'],
    household:['گلرنگ','هوم‌کر','پاکشوما','تاژ','اکتیو'],
    personalCare:['نیوا','داو','کامان','مای','سینره']
  };

  var BUDGETS=[
    [20000000,40000000,'۲۰ تا ۴۰ میلیون تومان'],
    [40000000,60000000,'۴۰ تا ۶۰ میلیون تومان'],
    [60000000,80000000,'۶۰ تا ۸۰ میلیون تومان'],
    [80000000,120000000,'۸۰ تا ۱۲۰ میلیون تومان'],
    [120000000,200000000,'۱۲۰ تا ۲۰۰ میلیون تومان'],
    [200000000,300000000,'۲۰۰ تا ۳۰۰ میلیون تومان'],
    [300000000,400000000,'۳۰۰ تا ۴۰۰ میلیون تومان'],
    [400000000,600000000,'۴۰۰ تا ۶۰۰ میلیون تومان'],
    [600000000,800000000,'۶۰۰ تا ۸۰۰ میلیون تومان'],
    [800000000,1000000000,'۸۰۰ میلیون تا ۱ میلیارد تومان']
  ];

  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}

  function ensureBudget(){
    var input=$('budgetMax');
    if(!input)return;
    var field=input.closest('.v5-field');
    if(!field)return;
    var select=$('v6BudgetRange');
    if(!select){
      select=document.createElement('select');
      select.id='v6BudgetRange';
      select.className=input.className;
      select.setAttribute('aria-label','چقدر می‌خوای هزینه کنی؟');
      select.innerHTML='<option value="">چقدر می‌خوای هزینه کنی؟</option>'+BUDGETS.map(function(b){return '<option value="'+b[1]+'" data-min="'+b[0]+'" data-max="'+b[1]+'">'+b[2]+'</option>'}).join('');
      input.type='hidden';
      input.placeholder='چقدر می‌خوای هزینه کنی؟';
      input.setAttribute('aria-label','چقدر می‌خوای هزینه کنی؟');
      input.parentNode.insertBefore(select,input);
      var min=document.createElement('input');
      min.type='hidden';min.id='budgetMin';min.name='budgetMin';
      field.appendChild(min);
      select.addEventListener('change',function(){
        var o=select.options[select.selectedIndex];
        input.value=o&&o.dataset.max?o.dataset.max:'';
        min.value=o&&o.dataset.min?o.dataset.min:'';
      });
    }
    var label=field.querySelector(':scope > span');
    if(label)label.style.display='none';
  }

  function ensureBrand(){
    var sub=$('v5Subcategory'),dyn=$('v5DynamicFields');
    if(!sub||!dyn)return;
    var key=sub.value;
    var brands=BRAND_MAP[key];
    var old=$('v6UnifiedBrandField');
    if(old)old.remove();
    if(!brands||!brands.length)return;
    var field=document.createElement('label');
    field.id='v6UnifiedBrandField';
    field.className='v5-field v5-final-function full';
    field.innerHTML='<span>برند</span><select id="v6UnifiedBrand"><option value="">برند</option>'+brands.map(function(b,i){return '<option value="'+i+'">'+esc(b)+'</option>'}).join('')+'</select>';
    dyn.appendChild(field);
  }

  function bind(){
    ensureBudget();
    var sub=$('v5Subcategory');
    if(!sub)return false;
    if(sub.dataset.v6ProductOptionsBound!=='1'){
      sub.dataset.v6ProductOptionsBound='1';
      sub.addEventListener('change',function(){window.setTimeout(ensureBrand,0)});
    }
    ensureBrand();
    return true;
  }

  function boot(){
    if(bind())return;
    window.setTimeout(boot,100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else window.setTimeout(boot,0);
})();
