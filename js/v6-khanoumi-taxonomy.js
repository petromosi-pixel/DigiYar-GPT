/* DigiYar V6 — Store #11: Khanoumi taxonomy
   Source: Khanoumi live category navigation (2026-09-13)
   Structure: category → subcategory → brand → budget
*/
(function(){
  'use strict';
  var STORE='khanoumi';
  var ROOTS=[
    ['makeup','آرایشی'],['skin','مراقبت پوست'],['hair','مراقبت و زیبایی مو'],['personal-care','بهداشت شخصی و حمام'],
    ['supplements','مکمل غذایی و ورزشی'],['perfume','عطر و اسپری'],['electric','لوازم برقی'],['fashion','مد و پوشاک'],
    ['digital','کالای دیجیتال'],['gold-silver','طلا و نقره'],['mother-kid','مادر و کودک']
  ];
  var SUBS={
    makeup:[['face','آرایش صورت'],['eyes-brows','آرایش چشم و ابرو'],['lips','آرایش لب'],['nails','آرایش ناخن'],['tools','ابزار آرایشی'],['body-makeup','آرایش بدن']],
    skin:[['face-care','مراقبت صورت'],['cleansing','پاک کننده و شوینده'],['eye-care','مراقبت چشم و ابرو'],['body-care','مراقبت بدن'],['lip-care','مراقبت لب'],['hand-nail-care','مراقبت دست و ناخن'],['foot-care','مراقبت پا']],
    hair:[['shampoo','شامپو'],['hair-care','مراقبت از مو'],['hair-beauty','زیبایی مو'],['styling-tools','ابزار آرایش و پیرایش']],
    'personal-care':[['deodorant','دئودورانت و ضد تعریق'],['intimate','محصولات زناشویی و جنسی'],['oral-care','بهداشت دهان و دندان'],['women-men-hygiene','بهداشت بانوان و آقایان'],['body-bath','بدن و حمام'],['shaving','لوازم اصلاح و پیرایش']],
    supplements:[['bodybuilding','مکمل بدنسازی'],['vitamins-minerals','ویتامین و مواد معدنی'],['herbal-therapeutic','مکمل گیاهی و درمانی'],['nutrients','مواد مغذی']],
    perfume:[['perfume','عطر و ادکلن'],['body-spray','اسپری بدن'],['body-mist','بادی اسپلش'],['pocket-perfume','عطر جیبی']],
    electric:[['health-tools','ابزار سلامت'],['hair-tools','ابزار برقی مو'],['shaving-tools','ابزار اصلاح'],['skin-tools','ابزار مراقبت پوست']],
    fashion:[['accessories','اکسسوری'],['jewelry','زیورآلات'],['clothing','لباس']],
    digital:[['headphones','هدفون، هندزفری و هدست'],['smartwatch','ساعت هوشمند'],['speaker','اسپیکر'],['powerbank','پاوربانک'],['accessories','لوازم جانبی دیجیتال']],
    'gold-silver':[['silver-jewelry','زیورآلات نقره'],['gold-jewelry','زیورآلات طلا'],['coins-bars','شمش و سکه']],
    'mother-kid':[['child-care','بهداشت و مراقبت از کودک']]
  };
  var BRANDS={
    face:['کالیستا','مای','نوت','اسنس','پریم','آردن','ساین اسکین','هیدرودرم'],
    'eyes-brows':['کالیستا','مای','نوت','اسنس','میبلین','لورآل','بورژوا'],
    lips:['کالیستا','مای','نوت','اسنس','میبلین','لورآل','بورژوا'],
    nails:['مای','کالیستا','اسنس','فلورمار'],
    tools:['کالیستا','فلورمار','دافی'],
    'body-makeup':['مای','کالیستا','لورآل'],
    'face-care':['سینره','مای','کامان','هیدرودرم','لاروش پوزای','اوریاژ','بیودرما','پرایم'],
    cleansing:['هیدرودرم','سینره','کامان','بیودرما','ویکتوریا رز'],
    'eye-care':['سینره','کامان','اوریاژ','لاروش پوزای','بیودرما'],
    'body-care':['کامان','مای','دافی','سینره'],
    'lip-care':['آردن','کامان','دافی','مای'],
    'hand-nail-care':['مای','آردن','کامان'],
    'foot-care':['آردن','کامان','مای'],
    shampoo:['سینره','مای','پریم','لافارر','استم سل','سان وی'],
    'hair-care':['استم سل','سینره','لافارر','لورآل','شوارتسکف','پنتن'],
    'hair-beauty':['لورآل','شوارتسکف','پنتن','سینره','مای'],
    'styling-tools':['فیلیپس','پرومکس','بابیلیس'],
    deodorant:['داو','نیوا','کامان','مای','آمبرلا','دیپ سنس'],
    intimate:['کاپوت','دافی','کامان'],
    'oral-care':['سیگنال','کرست','اورال‌بی','میسویک'],
    'women-men-hygiene':['مای','کامان','دافی','وی','مولفیکس'],
    'body-bath':['مای','کامان','داو','نیوا','دیپ سنس'],
    shaving:['ژیلت','نیوا','داو','لورآل'],
    bodybuilding:['نوتریمد','دوبیس','یوروویتال','آپتونیا'],
    'vitamins-minerals':['عبیدی','یوروویتال','هلث اید','نیچرز پلنتی','دانا'],
    'herbal-therapeutic':['هلث اید','یوروویتال','دانا','کلاژن گلد'],
    nutrients:['کلاژن گلد','هلث اید','یوروویتال'],
    perfume:['لورآل','آرماف','دیویدوف','بولگاری','لالیک','ژان پل گوتیه'],
    'body-spray':['نیوا','داو','کامان','مای'],
    'body-mist':['مای','کامان','دیپ سنس','آمبرلا'],
    'pocket-perfume':['آرماف','لالیک','دیویدوف'],
    'health-tools':['فیلیپس','امسیگ','زنیت مد','سنسور'],
    'hair-tools':['فیلیپس','پرومکس','بابیلیس','رمینگتون'],
    'shaving-tools':['فیلیپس','براون','پاناسونیک','رمینگتون'],
    'skin-tools':['براون','فیلیپس','شیائومی'],
    accessories:['دافی','مای','کامان'],
    jewelry:['دیوید جونز','ژوپینگ'],
    clothing:['ال‌سی‌وایکیکی','جین‌وست','دورس'],
    headphones:['جی‌بی‌ال','انکر','سامسونگ','اپل','سونی','شیائومی'],
    smartwatch:['اپل','سامسونگ','شیائومی','هواوی','امیزفیت'],
    speaker:['جی‌بی‌ال','انکر','سونی','شیائومی'],
    powerbank:['انکر','بیسوس','شیائومی','سامسونگ'],
    'accessories':['بیسوس','انکر','یوگرین','شیائومی','سامسونگ'],
    'silver-jewelry':['ژوپینگ','سونیا','کیا'],
    'gold-jewelry':['ونوس گلد','کهزاد','پارس سکه','ایران شمش','امین زر'],
    'coins-bars':['ونوس گلد','کهزاد','پارس سکه','ایران شمش','نوین زر'],
    'child-care':['چیکو','فیلیپس اونت','مولفیکس','مای بیبی','بیبی‌لند'],
    other:['سینره','مای','کامان','لورآل','فیلیپس']
  };
  function $(id){return document.getElementById(id)}
  function selected(){return $('storeSelect')&&$('storeSelect').value===STORE}
  function roots(){var c=$('v5Category');if(!c||!selected())return;c.innerHTML='<option value="">انتخاب دسته‌بندی</option>'+ROOTS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');c.disabled=false;var s=$('v5Subcategory');if(s){s.value='';s.disabled=true;s.innerHTML='<option value="">انتخاب زیر دسته</option>'}var b=$('v6BrandField');if(b)b.remove()}
  function subs(){if(!selected())return;var c=$('v5Category'),s=$('v5Subcategory');if(!c||!s)return;var list=SUBS[c.value]||[];s.innerHTML='<option value="">انتخاب زیر دسته</option>'+list.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');s.disabled=!list.length;var b=$('v6BrandField');if(b)b.remove()}
  function brand(){if(!selected())return;var s=$('v5Subcategory'),dyn=$('v5DynamicFields');if(!s||!s.value)return;var list=BRANDS[s.value]||BRANDS.other;var old=$('v6BrandField');if(old)old.remove();var f=document.createElement('label');f.id='v6BrandField';f.className='v5-field full';f.innerHTML='<span>برند</span><select id="v6Brand"><option value="">انتخاب برند</option>'+list.map(function(b){return '<option value="'+b+'">'+b+'</option>'}).join('')+'</select>';var budget=$('v6BudgetRange'),bf=budget&&budget.closest('.v5-field');if(bf&&bf.parentNode)bf.parentNode.insertBefore(f,bf);else if(dyn&&dyn.parentNode)dyn.parentNode.insertBefore(f,dyn)}
  function bind(){var st=$('storeSelect'),c=$('v5Category'),s=$('v5Subcategory');if(!st||!c)return false;if(!st.dataset.v6KhanoumiTaxonomy){st.dataset.v6KhanoumiTaxonomy='1';st.addEventListener('change',function(){if(selected())setTimeout(roots,30)})}if(!c.dataset.v6KhanoumiTaxonomy){c.dataset.v6KhanoumiTaxonomy='1';c.addEventListener('change',function(){setTimeout(subs,30)})}if(s&&!s.dataset.v6KhanoumiBrand){s.dataset.v6KhanoumiBrand='1';s.addEventListener('change',function(){setTimeout(brand,30)})}if(selected())roots();return true}
  function boot(){if(bind())return;setTimeout(boot,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0)
})();
