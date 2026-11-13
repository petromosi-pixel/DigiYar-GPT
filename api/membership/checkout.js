'use strict';
const {calculateMembershipPrice}=require('../_lib/membership-pricing');
const {getZarinpalConfig,createPayment}=require('../_lib/zarinpal');
const {applyCors,send,getAuthenticatedUser,supabaseRpc,supabasePatch}=require('../_lib/membership-http');
const CALLBACK_URL='https://digi-yar-core.vercel.app/api/membership/zarinpal/verify';
module.exports=async function membershipCheckout(req,res){
 if(!applyCors(req,res,'POST, OPTIONS'))return send(res,403,{error:'origin_not_allowed'});
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Max-Age','86400');return res.status(204).end();}
 if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
 let context,order;
 try{
  context=await getAuthenticatedUser(req);
  const body=req.body&&typeof req.body==='object'?req.body:{};
  const pricing=calculateMembershipPrice(String(body.planId||''),Number(body.months));
  const idempotencyKey=String(req.headers['idempotency-key']||body.idempotencyKey||'');
  if(!/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey))return send(res,400,{error:'invalid_idempotency_key'});
  const config=getZarinpalConfig();
  const created=await supabaseRpc(context.supabaseUrl,context.serviceKey,'create_membership_payment_order',{
   p_user_id:context.user.id,p_plan_id:pricing.planId,p_months:pricing.months,p_discount_percent:pricing.discountPercent,
   p_amount_toman:pricing.amountToman,p_amount_rial:pricing.amountRial,p_idempotency_key:idempotencyKey
  });
  order=Array.isArray(created)?created[0]:created;
  if(!order||!order.id)return send(res,503,{error:'membership_order_not_created'});
  if(order.status==='paid')return send(res,200,{success:true,alreadyPaid:true,orderId:order.id});
  if(order.checkout_url&&order.provider_authority)return send(res,200,{success:true,orderId:order.id,checkoutUrl:order.checkout_url});
  const claimed=await supabaseRpc(context.supabaseUrl,context.serviceKey,'claim_membership_payment_request',{p_order_id:order.id});
  if(claimed!==true&&!(Array.isArray(claimed)&&claimed[0]===true))return send(res,409,{error:'payment_request_in_progress'});
  try{
   const payment=await createPayment({
    merchantId:config.merchantId,amountRial:pricing.amountRial,callbackUrl:CALLBACK_URL,
    description:'اشتراک '+(pricing.planId==='professional'?'حرفه‌ای':'تجاری')+' دیجی‌یار - '+pricing.months+' ماه',
    metadata:{mobile:String(context.user.phone||'').slice(0,20),email:String(context.user.email||'').slice(0,120)},
    config
   });
   await supabasePatch(context.supabaseUrl,context.serviceKey,'membership_payment_orders','id=eq.'+encodeURIComponent(order.id),{
    status:'pending',provider_authority:payment.authority,checkout_url:payment.checkoutUrl,provider_request_locked_until:null
   });
   return send(res,200,{success:true,orderId:order.id,checkoutUrl:payment.checkoutUrl});
  }catch(providerError){
   await supabasePatch(context.supabaseUrl,context.serviceKey,'membership_payment_orders','id=eq.'+encodeURIComponent(order.id),{status:'failed',provider_request_locked_until:null}).catch(()=>{});
   throw providerError;
  }
 }catch(error){
  const status=Number(error&&error.status)||(/not_configured/.test(String(error&&error.message))?503:500);
  return send(res,status,{error:status===401?String(error.message):status===503?'membership_backend_unavailable':'membership_checkout_failed'});
 }
};
