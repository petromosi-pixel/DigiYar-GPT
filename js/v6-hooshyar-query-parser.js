/* DigiYar V6 — Hooshyar canonical query parser
   Purpose: convert free-form shopping intent into a store-agnostic query.
   Canonical taxonomy comes from the active V6 UI when available.
   No network calls. No marketplace/API dependency. Does not mutate taxonomy UI.
*/
(function(root){
'use strict';
var VERSION='6.1.1';

/* Linguistic input aliases only. These are NOT a second taxonomy. */
var CATEGORY_ALIASES=[
 {id:'digital',parent:null,label:'کالای دیجیتال',terms:['کالای دیجیتال','دیجیتال','لوازم دیجیتال']},
 {id:'mobile',parent:'digital',label:'موبایل',terms:['گوشی','موبایل','تلفن همراه','اسمارت فون','smartphone']},
 {id:'laptop',parent:'digital',label:'لپ‌تاپ',terms:['لپ تاپ','لپ‌تاپ','لپتاپ','نوت بوک','notebook','laptop']},
 {id:'tablet',parent:'digital',label:'تبلت',terms:['تبلت','tablet']},
 {id:'headphones',parent:'digital',label:'هدفون و هندزفری',terms:['هدفون','هندزفری','ایرباد','ایرپاد','headphone','earbuds']},
 {id:'tv',parent:'digital',label:'تلویزیون',terms:['تلویزیون','tv']},
 {id:'camera',parent:'digital',label:'دوربین',terms:['دوربین','camera']},
 {id:'accessories',parent:'digital',label:'لوازم جانبی',terms:['لوازم جانبی','اکسسوری','شارژر','کابل','پاوربانک']},
 {id:'gaming',parent:'digital',label:'کنسول و گیم',terms:['کنسول','گیمینگ','گیم','بازی']},
 {id:'smart-home',parent:'digital',label:'خانه هوشمند',terms:['خانه هوشمند','هوشمند']},
 {id:'appliance',parent:'home',label:'لوازم خانگی',terms:['لوازم خانگی','یخچال','لباسشویی','جاروبرقی']},
 {id:'kitchen',parent:'home',label:'لوازم آشپزخانه',terms:['لوازم آشپزخانه','سرخ کن','چای ساز','قهوه ساز']},
 {id:'fashion',parent:null,label:'مد و پوشاک',terms:['پوشاک','لباس','مد و پوشاک']},
 {id:'beauty',parent:null,label:'زیبایی و سلامت',terms:['آرایشی','زیبایی']},
 {id:'health',parent:null,label:'سلامت و پزشکی',terms:['سلامت','پزشکی','مکمل','ویتامین']},
 {id:'sports',parent:null,label:'ورزش و سفر',terms:['ورزش','بدنسازی','کمپ','سفر']},
 {id:'books',parent:null,label:'کتاب، لوازم تحریر و هنر',terms:['کتاب','لوازم تحریر','هنر']},
 {id:'kids',parent:null,label:'اسباب‌بازی، کودک و نوزاد',terms:['اسباب بازی','اسباب‌بازی','کودک','نوزاد']},
 {id:'supermarket',parent:null,label:'کالاهای خوراکی و اساسی',terms:['سوپرمارکت','خوراکی','مواد غذایی','هایپرمارکت']},
 {id:'auto',parent:null,label:'خودرو',terms:['خودرو','ماشین','لوازم خودرو']}
];

var BRAND_ALIASES={
 'سامسونگ':['سامسونگ','samsung'],'شیائومی':['شیائومی','xiaomi'],'اپل':['اپل','apple','iphone','آیفون'],'پوکو':['پوکو','poco'],'آنر':['آنر','honor'],'هواوی':['هواوی','huawei'],'نوکیا':['نوکیا','nokia'],'ریلمی':['ریلمی','realme'],'وان‌پلاس':['وان پلاس','وان‌پلاس','oneplus'],'موتورولا':['موتورولا','motorola'],'لنوو':['لنوو','lenovo'],'ایسوس':['ایسوس','asus'],'اچ‌پی':['اچ پی','اچ‌پی','hp','hewlett packard'],'دل':['دل','dell'],'ایسر':['ایسر','acer'],'ام‌اس‌آی':['ام اس آی','ام‌اس‌آی','msi'],'سونی':['سونی','sony'],'ال‌جی':['ال جی','ال‌جی','lg'],'جی‌بی‌ال':['جی بی ال','جی‌بی‌ال','jbl'],'انکر':['انکر','anker'],'بیسوس':['بیسوس','baseus'],'تفال':['تفال','tefal'],'بوش':['بوش','bosch']
};
var USAGE_ALIASES={gaming:['بازی و گیمینگ','گیمینگ','بازی','گیم'],work:['کار و برنامه‌نویسی','کار و برنامه نویسی','برنامه‌نویسی','کار'],study:['درس و مطالعه','مطالعه','درس'],content:['تولید محتوا و طراحی','تولید محتوا','طراحی'], 'photo-video':['عکاسی و فیلمبرداری','عکاسی','فیلمبرداری'],daily:['استفاده روزمره','روزمره'],travel:['سفر','مسافرت']};
var STORE_ALIASES={digikala:['دیجی کالا','دیجی‌کالا','digikala'],snappshop:['اسنپ شاپ','اسنپ‌شاپ','snappshop'],torob:['ترب','torob'],basalam:['باسلام','basalam'],technolife:['تکنولایف','technolife'],meghdadit:['مقداد آی تی','مقداد آی‌تی','meghdad'],janebi:['جانبی','janebi'],digiland:['دیجی لند','دیجی‌لند','digiland'],khanoumi:['خانومی','khanoumi'],esam:['ایسام','esam'],digido:['دیجی دو','دیجی‌دو','digido'],takhfifan:['تخفیفان','takhfifan'],shab:['شب','shab'],neshatrokh:['نشاط رخ','neshatrokh'],mosbatesabz:['مثبت سبز','mosbatesabz']};

function normalize(v){return String(v==null?'':v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/ۀ/g,'ه').replace(/[‌\u200c]/g,' ').replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/[٬,]/g,'').replace(/٫/g,'.').replace(/\s+/g,' ').trim().toLowerCase();}
function parseBudget(text){var s=normalize(text),nums=(s.match(/\d+(?:\.\d+)?/g)||[]).map(Number);if(!nums.length)return null;var hasRial=/ریال|rial|rials/.test(s),hasBillion=/میلیارد|billion/.test(s),hasMillion=/میلیون|million/.test(s),hasThousand=/هزار|thousand/.test(s),mult=hasRial?0.1:hasBillion?1e9:hasMillion?1e6:hasThousand?1e3:1,values=nums.map(function(n){return Math.round(n*mult)}),range=values.length>1&&/تا|بین|الی|-/.test(s);return{min:range?Math.min(values[0],values[1]):null,max:range?Math.max(values[0],values[1]):values[0],currency:'toman',source:'declared',confidence:hasRial?0.99:0.95};}
function findAlias(text,groups){var s=normalize(text),best=null;Object.keys(groups).forEach(function(id){groups[id].forEach(function(term){var t=normalize(term);if(t&&s.indexOf(t)!==-1&&(!best||t.length>best.term.length))best={id:id,term:t};});});return best;}
function findCategory(text){var s=normalize(text),best=null;CATEGORY_ALIASES.forEach(function(item){item.terms.forEach(function(term){var t=normalize(term);if(t&&s.indexOf(t)!==-1&&(!best||t.length>best.term.length))best={item:item,term:t};});});return best&&best.item||null;}
function collectDomOptions(id){if(!root.document)return[];var el=root.document.getElementById(id);if(!el)return[];return Array.prototype.slice.call(el.options||[]).map(function(o){return{value:o.value,label:String(o.textContent||'').trim()};}).filter(function(x){return x.label&&x.value;});}
function findDomMatch(text,options){var s=normalize(text),best=null;options.forEach(function(o){var t=normalize(o.label);if(t&&s.indexOf(t)!==-1&&(!best||t.length>best.length))best=t;});if(!best)return null;return options.find(function(o){return normalize(o.label)===best})||null;}
function findOptionByAlias(alias,options){if(!alias||!options.length)return null;var candidates=[alias.label].concat(alias.terms||[]).map(normalize).filter(Boolean);var exact=options.find(function(o){var label=normalize(o.label),value=normalize(o.value);return candidates.some(function(c){return label===c||value===c;});});return exact||null;}
function findBrandOption(alias,options){if(!alias||!options.length)return null;var terms=(BRAND_ALIASES[alias.id]||[]).map(normalize);terms.push(normalize(alias.id));return options.find(function(o){var l=normalize(o.label),v=normalize(o.value);return terms.some(function(t){return l===t||v===t;});})||null;}
function taxonomyContext(context){var ctx=context||{};return{categoryOptions:ctx.categoryOptions||collectDomOptions('v5Category'),subcategoryOptions:ctx.subcategoryOptions||collectDomOptions('v5Subcategory'),brandOptions:ctx.brandOptions||collectDomOptions('v6BrandField'),storeOptions:ctx.storeOptions||collectDomOptions('storeSelect')};}
function formState(){if(!root.document)return{};function value(id){var el=root.document.getElementById(id);return el?String(el.value||''):'';}return{store:value('storeSelect'),category:value('v5Category'),subcategory:value('v5Subcategory'),brand:value('v6BrandField'),budgetMax:value('budgetMax')||value('v6BudgetRange')};}
function fromForm(state){var s=state||formState(),budget=s.budgetMax?parseBudget(String(s.budgetMax)):null;if(budget&&!budget.max)budget=null;return{version:VERSION,intent:'product_search',rawText:'',store:s.store&&s.store!=='all'?s.store:null,category:s.category||null,subcategory:s.subcategory||null,brand:s.brand||null,budget:budget,tokens:[],confidence:1,source:'v6-form'};}
function parse(input,context){var raw=String(input==null?'':input).trim(),s=normalize(raw),ctx=taxonomyContext(context);if(!s)return{version:VERSION,intent:'product_search',rawText:'',store:null,category:null,subcategory:null,brand:null,budget:null,tokens:[],confidence:0,source:'free_text'};var category=findCategory(s),brand=findAlias(s,BRAND_ALIASES),usage=findAlias(s,USAGE_ALIASES),store=findAlias(s,STORE_ALIASES),budget=parseBudget(s),categoryDom=findDomMatch(s,ctx.categoryOptions),subDom=findDomMatch(s,ctx.subcategoryOptions),brandDom=findDomMatch(s,ctx.brandOptions),aliasSub=category&&category.parent?findOptionByAlias(category,ctx.subcategoryOptions):null,aliasCategory=category&&category.parent?findOptionByAlias({label:'کالای دیجیتال',terms:['کالای دیجیتال','digital'],id:'digital'},ctx.categoryOptions):findOptionByAlias(category,ctx.categoryOptions),aliasBrand=findBrandOption(brand,ctx.brandOptions),resolvedCategory=categoryDom?categoryDom.value:(aliasCategory?aliasCategory.value:(category?category.id:null)),resolvedSub=subDom?subDom.value:(aliasSub?aliasSub.value:null),resolvedBrand=brandDom?brandDom.value:(aliasBrand?aliasBrand.value:(brand?brand.id:null)),tokens=s.split(' ').filter(function(x){return x.length>1&&!/^\d/.test(x)}),fields=[resolvedCategory,resolvedSub,resolvedBrand,budget&&budget.max,store&&store.id].filter(Boolean).length;return{version:VERSION,intent:'product_search',rawText:raw,normalizedText:s,store:store?store.id:null,category:resolvedCategory,subcategory:resolvedSub,brand:resolvedBrand,usage:usage?usage.id:null,budget:budget,tokens:tokens,confidence:Number(Math.min(1,0.35+fields*0.13).toFixed(2)),source:'free_text',taxonomy:{categoryLabel:categoryDom&&categoryDom.label||(aliasCategory&&aliasCategory.label)||(category&&category.label)||null,subcategoryLabel:subDom&&subDom.label||(aliasSub&&aliasSub.label)||null,brandLabel:brandDom&&brandDom.label||(aliasBrand&&aliasBrand.label)||(brand&&brand.id)||null}};}
function toSearchText(query){if(!query)return'';var parts=[];if(query.taxonomy&&query.taxonomy.subcategoryLabel)parts.push(query.taxonomy.subcategoryLabel);else if(query.taxonomy&&query.taxonomy.categoryLabel)parts.push(query.taxonomy.categoryLabel);else if(query.subcategory)parts.push(query.subcategory);else if(query.category)parts.push(query.category);if(query.taxonomy&&query.taxonomy.brandLabel)parts.push(query.taxonomy.brandLabel);else if(query.brand)parts.push(query.brand);return parts.join(' ').trim()||normalize(query.rawText||'');}
var api={version:VERSION,normalize,parseBudget,parse,fromForm,formState,toSearchText,taxonomyContext,CATEGORY_ALIASES,USAGE_ALIASES};root.DigiYarHooshyarQueryParser=api;root.DigiyarHooshyarQueryParser=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
