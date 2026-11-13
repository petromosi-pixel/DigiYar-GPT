import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const pricing=require('../api/_lib/membership-pricing.js');
const zarinpal=require('../api/_lib/zarinpal.js');
const sql=readFileSync(new URL('../supabase/sql/membership-payments-zarinpal.sql',import.meta.url),'utf8');
const checkout=readFileSync(new URL('../api/membership/checkout.js',import.meta.url),'utf8');
const verify=readFileSync(new URL('../api/membership/zarinpal/verify.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/v8-membership-plans.js',import.meta.url),'utf8');

test('server pricing matches the published plans and discounts',()=>{
 assert.deepEqual(pricing.calculateMembershipPrice('professional',6),{planId:'professional',months:6,discountPercent:15,baseToman:1194000,amountToman:1014900,amountRial:10149000});
 assert.deepEqual(pricing.calculateMembershipPrice('commercial',12),{planId:'commercial',months:12,discountPercent:28,baseToman:5988000,amountToman:4311360,amountRial:43113600});
 assert.equal(pricing.calculateMembershipPrice('professional',1).amountToman,199000);
 assert.throws(()=>pricing.calculateMembershipPrice('base',1),/invalid_plan_or_duration/);
 assert.throws(()=>pricing.calculateMembershipPrice('professional',2),/invalid_plan_or_duration/);
 assert.throws(()=>pricing.calculateMembershipPrice('unknown',3),/invalid_plan_or_duration/);
});

test('Zarinpal adapter isolates sandbox and production endpoints',()=>{
 const prod=zarinpal.getZarinpalConfig({ZARINPAL_MERCHANT_ID:'merchant',ZARINPAL_SANDBOX:'false'});
 const sandbox=zarinpal.getZarinpalConfig({ZARINPAL_MERCHANT_ID:'merchant',ZARINPAL_SANDBOX:'true'});
 assert.equal(prod.requestUrl,'https://payment.zarinpal.com/pg/v4/payment/request.json');
 assert.equal(prod.verifyUrl,'https://payment.zarinpal.com/pg/v4/payment/verify.json');
 assert.equal(prod.startPayBase,'https://www.zarinpal.com/pg/StartPay/');
 assert.equal(sandbox.requestUrl,'https://sandbox.zarinpal.com/pg/v4/payment/request.json');
 assert.equal(sandbox.startPayBase,'https://sandbox.zarinpal.com/pg/StartPay/');
 assert.throws(()=>zarinpal.getZarinpalConfig({}),/zarinpal_not_configured/);
});

test('payment request uses Rial, validates provider success and builds a trusted checkout URL',async()=>{
 const config=zarinpal.getZarinpalConfig({ZARINPAL_MERCHANT_ID:'merchant',ZARINPAL_SANDBOX:'true'});
 const fetchMock=async(url,options)=>{
  assert.equal(url,config.requestUrl);
  const body=JSON.parse(options.body);
  assert.equal(body.amount,10149000);
  assert.equal(body.merchant_id,'merchant');
  return {ok:true,json:async()=>({data:{code:100,authority:'A123456789012345678901234567890123'}})};
 };
 const result=await zarinpal.createPayment({merchantId:'merchant',amountRial:10149000,callbackUrl:'https://example.com/callback',description:'membership',config,fetchImpl:fetchMock});
 assert.equal(result.checkoutUrl,'https://sandbox.zarinpal.com/pg/StartPay/A123456789012345678901234567890123');
});

test('verification accepts only Zarinpal verified and already-verified codes',async()=>{
 const config=zarinpal.getZarinpalConfig({ZARINPAL_MERCHANT_ID:'merchant'});
 const fetchMock=async(url,options)=>{
  assert.equal(url,config.verifyUrl);
  assert.equal(JSON.parse(options.body).amount,1990000);
  return {ok:true,json:async()=>({data:{code:100,ref_id:778899,message:'Paid'}})};
 };
 const result=await zarinpal.verifyPayment({merchantId:'merchant',amountRial:1990000,authority:'A123456789012345678901234567890123',config,fetchImpl:fetchMock});
 assert.deepEqual(result,{code:100,reference:'778899',message:'Paid'});
 await assert.rejects(()=>zarinpal.verifyPayment({merchantId:'merchant',amountRial:1,authority:'x',config,fetchImpl:async()=>({ok:true,json:async()=>({data:{code:-9}})})}),/zarinpal_verification_failed/);
});

test('database enforces idempotency, server-calculated amounts, service-only RPCs and atomic entitlement activation',()=>{
 for(const fragment of ['unique(user_id,idempotency_key)','amount_rial = amount_toman * 10','idempotency_key_reused_with_different_order','claim_membership_payment_request','for update',"status='paid'",'source,provider_reference','revoke all on function public.finalize_membership_payment','to service_role'])assert.ok(sql.includes(fragment),fragment);
 assert.match(sql,/enable row level security/i);
 assert.match(sql,/revoke all on public\.membership_payment_orders from anon,authenticated/i);
});

test('checkout derives price on the server and requires a verified Supabase user',()=>{
 assert.match(checkout,/getAuthenticatedUser\(req\)/);
 assert.match(checkout,/calculateMembershipPrice/);
 assert.match(checkout,/create_membership_payment_order/);
 assert.match(checkout,/Idempotency-Key/);
 assert.doesNotMatch(checkout,/body\.amount|body\.price|amountToman\s*=/);
});

test('callback verifies with Zarinpal before invoking atomic subscription activation',()=>{
 assert.match(verify,/verifyPayment\(/);
 assert.match(verify,/finalize_membership_payment/);
 assert.match(verify,/status!=='OK'/);
 assert.match(verify,/provider_authority/);
});

test('membership screen exposes the prepared Shaparak/Zarinpal checkout action and requires account auth',()=>{
 assert.match(html,/v8MembershipCheckoutButton/);
 assert.match(html,/data-payment-method="shaparak"/);
 assert.match(js,/getMembershipAccessToken/);
 assert.match(js,/احراز هویت/);
 assert.match(js,/www\.zarinpal\.com/);
});
