// DigiYar V7 — real AI shopping planner endpoint
// Runs on Vercel only. Keep AI_GATEWAY_API_KEY server-side.
module.exports = async function handler(req,res){
  if(req.method==='OPTIONS'){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
    return res.status(204).end();
  }
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
  if(!key)return res.status(503).json({error:'ai_not_configured'});
  let body={};
  try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');}catch(_){return res.status(400).json({error:'invalid_json'});}
  const query=String(body.query||'').trim();
  if(!query)return res.status(400).json({error:'query_required'});
  const schema={
    type:'object',
    properties:{
      category:{type:'string'},
      brand:{type:['string','null']},
      minBudgetToman:{type:['number','null']},
      maxBudgetToman:{type:['number','null']},
      useCase:{type:['string','null']},
      domains:{type:'array',items:{type:'string'}},
      productTerms:{type:'array',items:{type:'string'}},
      requiredNameTerms:{type:'array',items:{type:'string'}},
      excludedTerms:{type:'array',items:{type:'string'}},
      confidence:{type:'number'}
    },
    required:['category','brand','minBudgetToman','maxBudgetToman','useCase','domains','productTerms','requiredNameTerms','excludedTerms','confidence'],
    additionalProperties:false
  };
  const prompt='تو موتور فهم خرید دیجی‌یار هستی. عبارت فارسی کاربر را فقط به دادهٔ ساختاری تبدیل کن. هیچ محصولی اختراع نکن. domains فقط از این فهرست انتخاب شود: digital, furniture, fashion, beauty, health, supermarket, home, sports, kids, books, auto, accessories, travel_ticket, lodging, education, auto_service, medicine. اگر عبارت طبیعی کاربر نیاز یک حوزه را توصیف می‌کند، آن حوزه را بر اساس معنای جمله تعیین کن؛ حتی اگر نام صریح کالا در متن نباشد. productTerms و requiredNameTerms باید کلمات/عبارت‌های واقعی و ضروریِ هویت کالا باشند؛ کلمات عمومی مثل برای، محل، استفاده و بودجه را وارد نکن. اگر برند یا بودجه مشخص نیست null بده.\nعبارت کاربر: '+query;
  try{
    const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization:'Bearer '+key},
      body:JSON.stringify({
        model:'openai/gpt-6-luna',
        input:[{type:'message',role:'user',content:prompt}],
        text:{format:{type:'json_schema',name:'digiyar_shopping_plan',strict:true,schema}},
        max_output_tokens:700
      })
    });
    const data=await r.json();
    if(!r.ok)return res.status(502).json({error:'ai_gateway_error',detail:data&&data.error?data.error:null});
    const raw=data.output_text||'';
    let plan;try{plan=JSON.parse(raw);}catch(_){return res.status(502).json({error:'ai_invalid_json'});}
    return res.status(200).json({ok:true,provider:'vercel-ai-gateway',model:'openai/gpt-6-luna',plan});
  }catch(e){return res.status(502).json({error:'ai_request_failed'});}
};