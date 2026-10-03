// DigiYar V7 — web product lookup
module.exports=async function(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
 if(!key)return res.status(503).json({error:'ai_not_configured'});
 let body={};try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}')}catch(_){return res.status(400).json({error:'invalid_json'})}
 const query=String(body.query||'').trim();if(!query)return res.status(400).json({error:'query_required'});
 const schema={type:'object',properties:{
  name:{type:'string'},brand:{type:['string','null']},model:{type:['string','null']},
  priceToman:{type:['number','null']},availability:{type:['string','null']},
  productUrl:{type:['string','null']},store:{type:['string','null']},
  attributes:{type:'object',additionalProperties:{type:['string','number','boolean','null']}},
  confidence:{type:'number'}
 },required:['name','brand','model','priceToman','availability','productUrl','store','attributes','confidence'],additionalProperties:false};
 const prompt='از وب برای پیدا کردن اطلاعات واقعی محصول استفاده کن. نام محصولی که کاربر وارد کرده را دقیقاً جستجو کن و یک محصول واقعی و قابل شناسایی را انتخاب کن. اولویت با صفحه محصول فروشگاه رسمی یا فروشگاه معتبر است. نام، برند، مدل، قیمت فعلی اگر در صفحه موجود است، وضعیت موجودی، URL صفحه محصول و مشخصات قابل مشاهده را استخراج کن. اگر داده‌ای در وب پیدا نشد آن فیلد را null بگذار و هرگز اطلاعات را حدس نزن. attributes فقط مشخصات صریح صفحه هستند. عبارت کاربر: '+query;
 try{
  const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
   body:JSON.stringify({model:'openai/gpt-5.6-luna',input:prompt,tools:[{type:'web_search_preview'}],text:{format:{type:'json_schema',name:'digiyar_product_lookup',strict:true,schema}},max_output_tokens:1200})});
  const data=await r.json();if(!r.ok)return res.status(502).json({error:'ai_gateway_error',detail:data&&data.error?data.error:null});
  function responseText(x){
   if(x&&typeof x.output_text==='string'&&x.output_text.trim())return x.output_text.trim();
   const out=Array.isArray(x&&x.output)?x.output:[];
   const parts=[];
   out.forEach(function(item){
    const content=Array.isArray(item&&item.content)?item.content:[];
    content.forEach(function(part){
     if(part&&typeof part.text==='string'&&part.text.trim())parts.push(part.text);
    });
   });
   return parts.join('').trim();
  }
  const raw=responseText(data);
  let plan;try{plan=JSON.parse(raw.replace(/^\`\`\`(?:json)?\\s*/i,'').replace(/\\s*\`\`\`$/,''));}catch(_){return res.status(502).json({error:'ai_invalid_json'});}
  const productUrl=String(plan&&plan.productUrl||'').trim();
  const productName=String(plan&&plan.name||'').trim();
  if(!productName||!/^https?:\\/\\//i.test(productUrl))return res.status(422).json({error:'web_product_not_verified'});
  return res.status(200).json({ok:true,product:plan});
 }catch(_){return res.status(502).json({error:'ai_request_failed'})}
};