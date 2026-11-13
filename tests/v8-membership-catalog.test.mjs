import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const catalog=require('../js/v8-membership-catalog.js');
const entitlements=require('../api/_lib/membership-entitlements.js');
const pricing=require('../api/_lib/membership-pricing.js');
test('one catalog defines tiers, features, and server entitlements',()=>{
 assert.deepEqual(Object.keys(catalog.plans),['base','professional','commercial']);
 assert.equal(catalog.plans.base.monthlyPrice,0);
 assert.equal(catalog.plans.professional.monthlyPrice,199000);
 assert.equal(catalog.plans.commercial.monthlyPrice,499000);
 for(const [id,plan] of Object.entries(catalog.plans))for(const feature of plan.features)assert.ok(catalog.features[feature],id+':'+feature);
 assert.deepEqual(entitlements.PLAN_FEATURES.professional,catalog.plans.professional.features);
 assert.deepEqual(entitlements.PLAN_FEATURES.commercial,catalog.plans.commercial.features);
});
test('catalog retains approved discounts and server prices',()=>{
 assert.deepEqual(catalog.discounts,{1:0,3:8,6:15,9:21,12:28});
 assert.deepEqual(pricing.DISCOUNTS,catalog.discounts);
 assert.equal(pricing.calculateMembershipPrice('professional',6).amountToman,1014900);
 assert.equal(pricing.calculateMembershipPrice('commercial',12).amountToman,4311360);
});
test('every feature has a label and undeclared features stay inaccessible',()=>{
 for(const [id,feature] of Object.entries(catalog.features))assert.ok(feature.label&&feature.label.length>3,id);
 const base=entitlements.resolveEntitlements(null);
 assert.equal(entitlements.canAccess(base,'hooshyar_search'),true);
 assert.equal(entitlements.canAccess(base,'semantic_product_search'),false);
});
