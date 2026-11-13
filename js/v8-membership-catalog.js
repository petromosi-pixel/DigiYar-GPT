/* DigiYar membership catalog: shared by browser and server. */
(function(root,factory){
 'use strict';
 var catalog=factory();
 if(typeof module==='object'&&module.exports)module.exports=catalog;
 if(root)root.DigiYarMembershipCatalog=catalog;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 var features={
  hooshyar_search:{label:'جست‌وجوی فعلی هوش‌یار و تشخیص مفاهیم پشتیبانی‌شده',group:'core'},
  store_directory:{label:'دسته‌بندی و معرفی فروشگاه‌ها',group:'core'},
  deal_feed:{label:'مشاهدهٔ پیشنهادها و تخفیف‌های ثبت‌شده',group:'core'},
  verified_store_routes:{label:'هدایت به مسیرهای جست‌وجوی تأییدشده',group:'core'},
  conversational_intent:{label:'فهم عبارت‌های محاوره‌ای، چندبخشی و نیازهای ترکیبی',group:'professional'},
  semantic_product_search:{label:'جست‌وجوی معنایی در کاتالوگ محصولات',group:'professional'},
  product_cards:{label:'کارت محصول با تصویر، قیمت و لینک همان کالا',group:'professional'},
  advanced_product_filters:{label:'فیلتر بر اساس بودجه، برند و ویژگی‌ها',group:'professional'},
  multi_store_comparison:{label:'مقایسهٔ محصولات واقعی از چند فروشگاه',group:'professional'},
  extended_store_catalog:{label:'دسترسی گسترده‌تر به کاتالوگ فروشگاه‌های همکار',group:'commercial'},
  personalized_ranking:{label:'رتبه‌بندی شخصی‌سازی‌شدهٔ نتایج',group:'commercial'},
  price_stock_alerts:{label:'پایش قیمت و موجودی و هشدار هوشمند',group:'commercial'},
  advanced_comparison:{label:'ابزارهای پیشرفتهٔ مقایسه و اولویت‌دهی نتایج',group:'commercial'}
 };
 var plans={
  base:{title:'پایه',monthlyPrice:0,features:['hooshyar_search','store_directory','deal_feed','verified_store_routes']},
  professional:{title:'حرفه‌ای',monthlyPrice:199000,features:['hooshyar_search','store_directory','deal_feed','verified_store_routes','conversational_intent','semantic_product_search','product_cards','advanced_product_filters','multi_store_comparison']},
  commercial:{title:'تجاری',monthlyPrice:499000,features:['hooshyar_search','store_directory','deal_feed','verified_store_routes','conversational_intent','semantic_product_search','product_cards','advanced_product_filters','multi_store_comparison','extended_store_catalog','personalized_ranking','price_stock_alerts','advanced_comparison']}
 };
 var discounts={1:0,3:8,6:15,9:21,12:28};
 Object.keys(features).forEach(function(k){Object.freeze(features[k])});
 Object.keys(plans).forEach(function(k){Object.freeze(plans[k].features);Object.freeze(plans[k])});
 return Object.freeze({version:'1.0.0',features:Object.freeze(features),plans:Object.freeze(plans),discounts:Object.freeze(discounts),planLabels:Object.freeze({base:'پایه',professional:'حرفه‌ای',commercial:'تجاری'})});
});