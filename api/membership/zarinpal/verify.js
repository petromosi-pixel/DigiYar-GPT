'use strict';
const {getZarinpalConfig,verifyPayment}=require('../../_lib/zarinpal');
const {adminHeaders,supabaseGet,supabaseRpc,supabasePatch}=require('../../_lib/membership-http');
const APP_URL='https://digi-yar-core.vercel.app/';
function redirect(res,status,orderId){const suffix=orderId?'&order='+encodeURIComponent(orderId):'';res.setHeader('Cache-Control','no-store, max-age=0');res.statusCode=303;res.setHeader('Location',APP_URL+'?membership_payment='+status+suffix);return res.end();}
module.exports=async function zarinpalVerify(req,res){
 if(req.method!=='GET')return res.status(405).send('Method not allowed');
 const status=String(req.query&&req.query.Status||''),authority=String(req.query&&req.query.Authority||'');
 if(!/^[A-Za-z0-9_-]{8,100}$/.test(authority))return redirect(res,'failed');
 const base=String(process.env.SUPABASE_URL||'').replace(/\/$/,''),serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!serviceKey)return redirect(res,'unavailable');
 let order;
 try{
  const rows=await supabaseGet(base,serviceKey,'membership_payment_orders',new URLSearchParams({select:'id,user_id,plan_id,months,amount_toman,amount_rial,provider,status,provider_authority,provider_reference,expires_at',provider:'eq.zarinpal',provider_authority:'eq.'+authority,limit:'1'}).toString());
  order=Array.isArray(rows)?rows[0]:null;
  if(!order)return redirect(res,'not_found');
  if(order.status==='paid')return redirect(res,'success',order.id);
  if(status!=='OK'){await supabasePatch(base,serviceKey,'membership_payment_orders','id=eq.'+encodeURIComponent(order.id),{status:'cancelled'}).catch(()=>{});return redirect(res,'cancelled',order.id);}
  const config=getZarinpalConfig();
  const verified=await verifyPayment({merchantId:config.merchantId,amountRial:Number(order.amount_rial),authority,config});
  await supabaseRpc(base,serviceKey,'finalize_membership_payment',{
   p_order_id:order.id,p_provider_reference:verified.reference||authority,p_verified_amount_rial:Number(order.amount_rial)
  });
  const eventId='verify:'+authority+':'+verified.code;
  await fetch(base+'/rest/v1/membership_payment_events',{method:'POST',headers:adminHeaders(serviceKey,{Prefer:'resolution=ignore-duplicates,return=minimal'}),body:JSON.stringify({order_id:order.id,provider:'zarinpal',provider_event_id:eventId,event_type:'verification',payload:{code:verified.code,reference:verified.reference},signature_valid:null,processed_at:new Date().toISOString()})}).catch(()=>{});
  return redirect(res,'success',order.id);
 }catch(error){
  if(order&&order.id)await supabasePatch(base,serviceKey,'membership_payment_orders','id=eq.'+encodeURIComponent(order.id),{last_error_code:'verification_or_finalization_error'}).catch(()=>{});
  return redirect(res,'verification_error',order&&order.id);
 }
};
