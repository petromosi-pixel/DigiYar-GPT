'use strict';
const ALLOWED_ORIGINS=new Set(['https://digi-yar-core.vercel.app','https://petromosi-pixel.github.io']);
function applyCors(req,res,methods){
 const origin=String(req.headers.origin||'');
 if(origin&&!ALLOWED_ORIGINS.has(origin))return false;
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, Idempotency-Key');res.setHeader('Access-Control-Allow-Methods',methods||'POST, OPTIONS');}
 return true;
}
function send(res,status,payload){res.setHeader('Cache-Control','no-store, max-age=0');return res.status(status).json(payload);}
function adminHeaders(serviceKey,extra){return Object.assign({apikey:serviceKey,Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'},extra||{});}
async function getAuthenticatedUser(req,env=process.env){
 const supabaseUrl=String(env.SUPABASE_URL||'').replace(/\/$/,''),anonKey=env.SUPABASE_ANON_KEY,serviceKey=env.SUPABASE_SERVICE_ROLE_KEY;
 if(!supabaseUrl||!anonKey||!serviceKey)throw Object.assign(new Error('membership_backend_unavailable'),{status:503});
 const match=String(req.headers.authorization||'').match(/^Bearer\s+(.+)$/i);
 if(!match)throw Object.assign(new Error('authentication_required'),{status:401});
 const response=await fetch(supabaseUrl+'/auth/v1/user',{headers:{apikey:anonKey,Authorization:'Bearer '+match[1]},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Object.assign(new Error('invalid_session'),{status:401});
 const user=await response.json();
 if(!user||!user.id)throw Object.assign(new Error('invalid_session'),{status:401});
 return {user,supabaseUrl,anonKey,serviceKey};
}
async function supabaseRpc(base,key,name,payload){
 const response=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers:adminHeaders(key),body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 const body=await response.json().catch(()=>null);
 if(!response.ok)throw new Error('membership_database_'+response.status);
 return body;
}
async function supabasePatch(base,key,table,filters,payload){
 const response=await fetch(base+'/rest/v1/'+table+'?'+filters,{method:'PATCH',headers:adminHeaders(key,{Prefer:'return=minimal'}),body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('membership_database_'+response.status);
}
async function supabaseGet(base,key,table,filters){
 const response=await fetch(base+'/rest/v1/'+table+'?'+filters,{headers:adminHeaders(key,{Accept:'application/json'}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('membership_database_'+response.status);
 return response.json();
}
module.exports={applyCors,send,adminHeaders,getAuthenticatedUser,supabaseRpc,supabasePatch,supabaseGet};
