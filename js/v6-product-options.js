/* DigiYar V6 — Product options bridge
 * Extends Step-4 product flow without replacing the native taxonomy controller.
 * Adds brand selection across categories, budget ranges in تومان, and category splits.
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
    furniture:['ایکیا','هوم‌سنتر','چشمه‌نور','بالسا','مبلیران','نیک‌آذین'],
    men:['ال‌سی‌من','جین‌وست','تن‌درست','نیکتا','آر‌ان‌اس'],
    women:['دورس','جوتی‌جینز','شیک‌پوش','تن‌درست','مانگو'],
    kids:['ال‌سی‌وایکیکی','چیکو','زرافه','نیلی','فیورلا'],
    shoes:['نایک','آدیداس','پوما','اسکیچرز','سالامون','هامتو','کفش ملی'],
    bags:['سامسونت','آدیداس','نایک','دیوید جونز','چرم مشهد'],
    skin:['نیوا','لورآل','اوریاژ','لاروش پوزای','سینره','مای','کامان'],
    hair:['لورآل','شوارتسکف','او جی ایکس','پنتن','مای','سینره'],
    makeup:['مک','میبلین','لورآل','بورژوا','کالیستا','مای','این‌لی'],
    personal:['نیوا','داو','ژیلت','فیلیپس','مای','کامان'],
    health:['نیچرم','دکتر ژیلا','سینره','کامان','مای','فیروز'],
    medical:['بیورر','امسیگ','زنیت مد','مدی‌سان','رزمکس'],
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
    car:['ایران‌خودرو','سایپا','بهمن','کرمان‌موتور','مدیران خودرو'],
    tools:['بوش','ماکیتا','دیوالت','رونیکس','توسن','آروا'],
    motorcycle:['هوندا','یاماها','باجاج','TVS','کاوازاکی'],
    food:['یک‌ویک','گلستان','چین‌چین','تبرک','کاله'],
    beverage:['سن‌ایچ','رانی','شیرین‌عسل','کاله','میهن'],
    household:['گلرنگ','هوم‌کر','پاکشوما','تاژ','اکتیو'],
    personalCare:['نیوا','داو','کامان','مای','سینره'],
    rice:['گلستان','محسن','طبیعت','هاشمی'],
    oil:['طبیعت','اوین','لاله','غنچه'],
    snacks:['چی‌توز','مزمز','شیرین‌عسل','آیدین'],
    drinks:['سن‌ایچ','رانی','میهن','کاله'],
    herbal:['گل‌دارو','دینه','سینا','زردبند'],
    tea:['گلستان','شهرزاد','دوغزال','محمود'],
    natural:['سی‌گل','سینره','کامان','مای'],
    craft:['سنتی','دست‌ساز','ایرانی'],
    gift:['کادویی','ایرانی','دست‌ساز'],
    desktop:['لنوو','اچ‌پی','دل','ایسوس','ایسر'],
    parts:['ایسوس','ام‌اس‌آی','گیگابایت','بایواستار','لنوو'],
    office:['اچ‌پی','کانن','اپسون','برادر','لنوو'],
    audio:['سونی','جی‌بی‌ال','بوز','پایونیر','سامسونگ'],
    projector:['اپسون','بنکیو','شیائومی','ووسون','ایسر'],
    care:['ایساکو','بوش','دنسو','والئو','کروز'],
    mother:['چیکو','فیلیپس اونت','بیبی‌لند','مای بیبی'],
    general:['سامسونگ','شیائومی','فیلیپس','بوش','پارس‌خزر'],
    other:['سامسونگ','شیائومی','فیلیپس','بوش','پارس‌خزر']
  };

  var BUDGETS=[
    [0,20000000,'تا ۲۰ میلیون تومان'],
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

  var EXTRA_CATEGORIES={
    digikala:[['furniture','مبلمان'],['health','سلامت و پزشکی']],
    snappshop:[['furniture','مبلمان'],['health','سلامت و پزشکی']],
    torob:[['furniture','مبلمان'],['health','سلامت و پزشکی']],
    basalam:[['furniture','مبلمان'],['health','سلامت و پزشکی']]
  };
  var EXTRA_SUBCATEGORIES={
    furniture:[['furniture','مبلمان منزل'],['office','مبلمان اداری'],['decoration','دکور و اکسسوری'],['sleep','تخت و خواب']],
    health:[['health','مکمل و ویتامین'],['medical','تجهیزات پزشکی'],['personalCare','بهداشت و مراقبت شخصی'],['fitness','سلامت و تناسب اندام']]
  };

  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
  function selectField(input){return input&&input.closest('.v5-field')}

  function addExtraCategories(){
    var store=$('storeSelect'),cat=$('v5Category');
    if(!store||!cat)return;
    var list=EXTRA_CATEGORIES[store.value]||[];
    list.forEach(function(pair){
      if(!cat.querySelector('option[value="'+pair[0]+'"]'))cat.appendChild(new Option(pair[1],pair[0]));
    });
  }

  function ensureBudget(){
    var input=$('budgetMax');
    if(!input)return;
    var field=selectField(input);
    if(!field)return;
    var select=$('v6BudgetRange');
    if(!select){
      select=document.createElement('select');
      select.id='v6BudgetRange';
      select.className=input.className;
      select.setAttribute('aria-label','چقدر می‌خوای هزینه کنی؟');
      select.style.textAlign='center';
      select.style.textAlignLast='center';
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

  function ensureExtraSubcategories(){
    var cat=$('v5Category'),sub=$('v5Subcategory');
    if(!cat||!sub)return false;
    var list=EXTRA_SUBCATEGORIES[cat.value];
    if(!list)return false;
    sub.disabled=false;
    sub.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('');
    return true;
  }

  function ensureBrand(){
    var sub=$('v5Subcategory'),dyn=$('v5DynamicFields'),budget=$('budgetMax');
    if(!sub||!dyn)return;
    var brands=BRAND_MAP[sub.value];
    var old=$('v6UnifiedBrandField');
    if(old)old.remove();
    if(!brands||!brands.length)return;
    var field=document.createElement('label');
    field.id='v6UnifiedBrandField';
    field.className='v5-field v5-final-function full';
    field.innerHTML='<span>برند</span><select id="v6UnifiedBrand"><option value="">برند</option>'+brands.map(function(b,i){return '<option value="'+i+'">'+esc(b)+'</option>'}).join('')+'</select>';
    var budgetField=selectField(budget);
    if(budgetField&&budgetField.parentNode)budgetField.parentNode.insertBefore(field,budgetField);
    else dyn.appendChild(field);
  }

  function bind(){
    ensureBudget();
    var store=$('storeSelect'),cat=$('v5Category'),sub=$('v5Subcategory');
    if(store&&store.dataset.v6CategoryBound!=='1'){
      store.dataset.v6CategoryBound='1';
      store.addEventListener('change',function(){
        window.setTimeout(function(){addExtraCategories()},0);
      });
    }
    addExtraCategories();
    if(cat&&cat.dataset.v6ExtraBound!=='1'){
      cat.dataset.v6ExtraBound='1';
      cat.addEventListener('change',function(){
        window.setTimeout(function(){ensureExtraSubcategories();ensureBrand()},0);
      });
    }
    if(sub&&sub.dataset.v6ProductOptionsBound!=='1'){
      sub.dataset.v6ProductOptionsBound='1';
      sub.addEventListener('change',function(){window.setTimeout(ensureBrand,0)});
    }
    ensureExtraSubcategories();
    ensureBrand();
    return !!cat;
  }

  function boot(){
    if(bind())return;
    window.setTimeout(boot,100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else window.setTimeout(boot,0);
})();
