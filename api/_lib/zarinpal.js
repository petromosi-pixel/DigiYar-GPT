'use strict';
function getZarinpalConfig(env=process.env){
 const merchantId=String(env.ZARINPAL_MERCHANT_ID||'').trim();
 if(!merchantId)throw new Error('zarinpal_not_configured');
 const sandbox=String(env.ZARINPAL_SANDBOX||'false').toLowerCase()==='true';
 const baseUrl=sandbox?'https://sandbox.zarinpal.com':'https://payment.zarinpal.com';
 const startPayBase=sandbox?'https://sandbox.zarinpal.com/pg/StartPay/':'https://www.zarinpal.com/pg/StartPay/';
 return Object.freeze({merchantId,sandbox,requestUrl:baseUrl+'/pg/v4/payment/request.json',verifyUrl:baseUrl+'/pg/v4/payment/verify.json',startPayBase});
}
async function postJson(url,payload,fetchImpl=fetch){
 const response=await fetchImpl(url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 let body;try{body=await response.json()}catch(_){throw new Error('zarinpal_invalid_response')}
 if(!response.ok)throw new Error('zarinpal_http_'+response.status);
 return body;
}
async function createPayment({merchantId,amountRial,callbackUrl,description,metadata,config,fetchImpl}){
 const result=await postJson(config.requestUrl,{merchant_id:merchantId,amount:amountRial,callback_url:callbackUrl,description,metadata:metadata||{}},fetchImpl);
 const data=result&&result.data;
 if(!data||data.code!==100||!data.authority)throw new Error('zarinpal_request_rejected_'+String(data&&data.code||result&&result.errors&&result.errors[0]&&result.errors[0].code||'unknown'));
 return {authority:String(data.authority),checkoutUrl:config.startPayBase+encodeURIComponent(String(data.authority))};
}
async function verifyPayment({merchantId,amountRial,authority,config,fetchImpl}){
 const result=await postJson(config.verifyUrl,{merchant_id:merchantId,amount:amountRial,authority},fetchImpl);
 const data=result&&result.data;
 if(!data||![100,101].includes(Number(data.code)))throw new Error('zarinpal_verification_failed_'+String(data&&data.code||'unknown'));
 return {code:Number(data.code),reference:data.ref_id==null?null:String(data.ref_id),message:String(data.message||'')};
}
module.exports={getZarinpalConfig,createPayment,verifyPayment};
