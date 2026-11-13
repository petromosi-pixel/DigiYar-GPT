'use strict';
const {resolveEntitlements}=require('../_lib/membership-entitlements');
const ALLOWED_ORIGINS=new Set(['https://petromosi-pixel.github.io','https://digi-yar-core.vercel.app']);
function send(res,status,payload){res.setHeader('Cache-Control','no-store, max-age=0');return res.status(status).json(payload);}
module.exports=async function membershipAccess(req,res){
 const origin=String(req.headers.origin||'');
 if(origin&&!ALLOWED_ORIGINS.has(origin))return send(res,403,{error:'origin_not_allowed'});
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');}
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Max-Age','86400');return res.status(204).end();}
 if(req.method!=='GET')return send(res,405,{error:'method_not_allowed'});
 const supabaseUrl=process.env.SUPABASE_URL,anonKey=process.env.SUPABASE_ANON_KEY,serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!supabaseUrl||!anonKey||!serviceKey)return send(res,503,{error:'membership_backend_unavailable',message:'Subscription backend is not configured.'});
 const authorization=String(req.headers.authorization||''),match=authorization.match(/^Bearer\s+(.+)$/i);
 if(!match)return send(res,401,{error:'authentication_required'});
 try{
  const base=supabaseUrl.replace(/\/$/,'');
  const authResponse=await fetch(base+'/auth/v1/user',{headers:{apikey:anonKey,Authorization:'Bearer '+match[1]}});
  if(!authResponse.ok)return send(res,401,{error:'invalid_session'});
  const user=await authResponse.json();
  if(!user||!user.id)return send(res,401,{error:'invalid_session'});
  const now=new Date().toISOString();
  const query=new URLSearchParams({select:'plan_id,status,starts_at,ends_at',user_id:'eq.'+user.id,status:'eq.active',starts_at:'lte.'+now,ends_at:'gt.'+now,order:'ends_at.desc',limit:'1'});
  const subResponse=await fetch(base+'/rest/v1/user_subscriptions?'+query.toString(),{headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey}});
  if(!subResponse.ok)return send(res,503,{error:'membership_store_unavailable'});
  const rows=await subResponse.json(),entitlements=resolveEntitlements(Array.isArray(rows)?rows[0]:null);
  return send(res,200,{userId:user.id,planId:entitlements.planId,planLabel:entitlements.planLabel,subscription:{active:entitlements.isActive,startsAt:entitlements.startsAt,endsAt:entitlements.endsAt},features:entitlements.features.map(id=>({id,enabled:true})),paymentEnabled:Boolean(process.env.ZARINPAL_MERCHANT_ID&&process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY)});
 }catch(error){return send(res,502,{error:'membership_service_error'});}
};
