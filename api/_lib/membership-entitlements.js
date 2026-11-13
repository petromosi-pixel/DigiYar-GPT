'use strict';
const PLAN_FEATURES=Object.freeze({
 base:Object.freeze(['hooshyar_search','store_directory','deal_feed','verified_store_routes']),
 professional:Object.freeze(['hooshyar_search','store_directory','deal_feed','verified_store_routes','conversational_intent','semantic_product_search','product_cards','advanced_product_filters','multi_store_comparison']),
 commercial:Object.freeze(['hooshyar_search','store_directory','deal_feed','verified_store_routes','conversational_intent','semantic_product_search','product_cards','advanced_product_filters','multi_store_comparison','extended_store_catalog','personalized_ranking','price_stock_alerts','advanced_comparison'])
});
const PLAN_LABELS=Object.freeze({base:'پایه',professional:'حرفه‌ای',commercial:'تجاری'});
function resolveEntitlements(subscription,nowValue){
 const now=nowValue instanceof Date?nowValue.getTime():Number(nowValue||Date.now());
 const sub=subscription&&typeof subscription==='object'?subscription:null;
 if(!sub||!['professional','commercial'].includes(sub.plan_id)||sub.status!=='active')return{planId:'base',planLabel:PLAN_LABELS.base,isActive:false,startsAt:null,endsAt:null,features:PLAN_FEATURES.base.slice()};
 const starts=Date.parse(sub.starts_at),ends=Date.parse(sub.ends_at);
 if(!Number.isFinite(starts)||!Number.isFinite(ends)||starts>now||ends<=now)return{planId:'base',planLabel:PLAN_LABELS.base,isActive:false,startsAt:null,endsAt:null,features:PLAN_FEATURES.base.slice()};
 return{planId:sub.plan_id,planLabel:PLAN_LABELS[sub.plan_id],isActive:true,startsAt:new Date(starts).toISOString(),endsAt:new Date(ends).toISOString(),features:PLAN_FEATURES[sub.plan_id].slice()};
}
function canAccess(entitlements,featureId){return !!(entitlements&&Array.isArray(entitlements.features)&&entitlements.features.includes(String(featureId||'')));}
module.exports={PLAN_FEATURES,PLAN_LABELS,resolveEntitlements,canAccess};
