/* DigiYar membership access bridge. Server response is the only source of paid entitlements. */
(function(root){
'use strict';
var state={status:'unknown',planId:'base',planLabel:'پایه',subscription:{active:false,startsAt:null,endsAt:null},features:[],paymentEnabled:false};
var pending=null;
function publish(){try{root.dispatchEvent(new root.CustomEvent('digiyar:membership-access-updated',{detail:getState()}))}catch(_){}}
function getState(){return{status:state.status,planId:state.planId,planLabel:state.planLabel,subscription:Object.assign({},state.subscription),features:state.features.slice(),paymentEnabled:state.paymentEnabled}}
async function token(){
 var auth=root.DigiYarAuth;
 if(auth&&typeof auth.getAccessToken==='function'){try{var t=await auth.getAccessToken();if(t)return t}catch(_){}}
 var clients=[root.DigiYarSupabaseClient,root.supabaseClient,root.supabase];
 for(var i=0;i<clients.length;i++){var c=clients[i];if(!c||!c.auth||typeof c.auth.getSession!=='function')continue;try{var r=await c.auth.getSession(),s=r&&r.data&&r.data.session;if(s&&s.access_token)return s.access_token}catch(_){}}
 return null;
}
async function refresh(){
 if(pending)return pending;
 pending=(async function(){
  var accessToken=await token();
  if(!accessToken){state={status:'unauthenticated',planId:'base',planLabel:'پایه',subscription:{active:false,startsAt:null,endsAt:null},features:[],paymentEnabled:false};publish();return getState()}
  try{
   var response=await root.fetch('/api/membership/access',{method:'GET',cache:'no-store',headers:{Authorization:'Bearer '+accessToken,Accept:'application/json'}});
   if(!response.ok)throw new Error('membership_access_unavailable');
   var data=await response.json();
   if(!data||!['base','professional','commercial'].includes(data.planId)||!Array.isArray(data.features))throw new Error('invalid_membership_access_response');
   state={status:'ready',planId:data.planId,planLabel:data.planLabel||({base:'پایه',professional:'حرفه‌ای',commercial:'تجاری'}[data.planId]),subscription:data.subscription||{active:false,startsAt:null,endsAt:null},features:data.features.filter(function(x){return x&&x.enabled===true&&typeof x.id==='string'}).map(function(x){return x.id}),paymentEnabled:data.paymentEnabled===true};
  }catch(_){state={status:'unavailable',planId:'base',planLabel:'پایه',subscription:{active:false,startsAt:null,endsAt:null},features:[],paymentEnabled:false}}
  publish();return getState();
 })();
 try{return await pending}finally{pending=null}
}
function canAccess(featureId){return state.status==='ready'&&state.features.indexOf(String(featureId||''))!==-1}
function requireFeature(featureId){
 if(canAccess(featureId))return true;
 try{root.dispatchEvent(new root.CustomEvent('digiyar:membership-feature-locked',{detail:{featureId:String(featureId||'')}}))}catch(_){}
 if(typeof root.DigiYarMembershipOpen==='function')root.DigiYarMembershipOpen();
 return false;
}
root.DigiYarMembershipAccess=Object.freeze({refresh:refresh,getState:getState,canAccess:canAccess,requireFeature:requireFeature});
})(window);
