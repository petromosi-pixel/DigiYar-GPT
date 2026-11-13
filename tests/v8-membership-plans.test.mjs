import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const entitlements=require('../api/_lib/membership-entitlements.js');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/v8-membership-plans.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/v8-membership-plans.css',import.meta.url),'utf8');
const now=Date.parse('2026-11-13T12:00:00.000Z');
test('membership page is a single comparison matrix with feature names on the right',()=>{
 assert.match(html,/v8-membership-matrix/);
 assert.match(html,/مقایسهٔ امکانات اشتراک/);
 assert.match(html,/v8-membership-feature-name/);
 assert.match(html,/data-membership-plan="base"/);
 assert.match(html,/data-membership-plan="professional"/);
 assert.match(html,/data-membership-plan="commercial"/);
 assert.doesNotMatch(html,/data-plan-price/);
 assert.match(html,/v8MembershipCost/);
 for(const id of ['base','professional','commercial'])assert.match(html,new RegExp('>'+({base:'پایه',professional:'حرفه‌ای',commercial:'تجاری'}[id])+'<'));
 assert.doesNotMatch(html,/پیشنهاد محبوب|برای خرید هوشمندتر|سه سطح هوشمندی/);
});
test('subscription duration selector expands and collapses from its own heading',()=>{
 assert.match(html,/انتخاب مدت زمان اشتراک/);
 assert.match(html,/aria-expanded="false"/);
 assert.match(js,/durationToggle&&durationPanel\)durationToggle\.addEventListener\('click'/);
 for(const months of [1,3,6,9,12])assert.match(html,new RegExp('data-membership-duration="'+months+'"'));
});
test('selecting a tier guides the user to the highlighted duration step and total cost',()=>{
 assert.match(js,/function choosePlan\(button\)/);
 assert.match(js,/openDurationStep\(\)/);
 assert.match(js,/durationWrap\.classList\.add\('is-attention'\)/);
 assert.match(js,/scrollIntoView\(\{behavior:'smooth',block:'center'\}\)/);
 assert.match(js,/function updateCost\(\)/);
 assert.match(js,/data-membership-duration="lifetime"/);
 assert.match(css,/dyMembershipGreenPulse/);
});
test('duration pricing keeps the agreed plan prices and discounts',()=>{
 const config=js.match(/durations:\[(.*?)\]/s);
 assert.ok(config);
 for(const discount of ['months:1,discount:0','months:3,discount:8','months:6,discount:15','months:9,discount:21','months:12,discount:28'])assert.ok(config[1].includes(discount));
 assert.match(js,/professional:\{title:'حرفه‌ای',monthlyPrice:199000\}/);
 assert.match(js,/commercial:\{title:'تجاری',monthlyPrice:499000\}/);
});
test('expired, pending, unknown and future subscriptions never grant paid access',()=>{
 for(const sub of [null,{plan_id:'professional',status:'pending',starts_at:'2026-11-01T00:00:00Z',ends_at:'2026-12-01T00:00:00Z'},{plan_id:'professional',status:'active',starts_at:'2026-12-01T00:00:00Z',ends_at:'2027-01-01T00:00:00Z'},{plan_id:'professional',status:'active',starts_at:'2026-10-01T00:00:00Z',ends_at:'2026-11-01T00:00:00Z'},{plan_id:'unknown',status:'active',starts_at:'2026-10-01T00:00:00Z',ends_at:'2026-12-01T00:00:00Z'}]){
  const access=entitlements.resolveEntitlements(sub,now);
  assert.equal(access.planId,'base');
  assert.equal(access.isActive,false);
  assert.equal(entitlements.canAccess(access,'semantic_product_search'),false);
 }
});
test('active professional and commercial subscriptions receive only their defined features',()=>{
 const professional=entitlements.resolveEntitlements({plan_id:'professional',status:'active',starts_at:'2026-11-01T00:00:00Z',ends_at:'2026-12-01T00:00:00Z'},now);
 assert.equal(entitlements.canAccess(professional,'semantic_product_search'),true);
 assert.equal(entitlements.canAccess(professional,'price_stock_alerts'),false);
 const commercial=entitlements.resolveEntitlements({plan_id:'commercial',status:'active',starts_at:'2026-11-01T00:00:00Z',ends_at:'2026-12-01T00:00:00Z'},now);
 assert.equal(entitlements.canAccess(commercial,'price_stock_alerts'),true);
});
test('API authorization is server-side and fails closed when Supabase is not configured',()=>{
 const api=readFileSync(new URL('../api/membership/access.js',import.meta.url),'utf8');
 assert.match(api,/auth\/v1\/user/);
 assert.match(api,/SUPABASE_SERVICE_ROLE_KEY/);
 assert.match(api,/membership_backend_unavailable/);
 assert.doesNotMatch(api,/localStorage|user_metadata|paymentEnabled:true/);
});
test('unified card remains responsive and supports dark mode',()=>{
 assert.match(css,/@media\(max-width:380px\)/);
 assert.match(css,/body\.v6-dark \.v8-membership/);
 assert.match(html,/aria-live="polite"/);
});
