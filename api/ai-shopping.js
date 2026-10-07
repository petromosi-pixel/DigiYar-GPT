// DigiYar V7 — semantic AI shopping planner endpoint
module.exports = async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
  if(!key)return res.status(503).json({error:'ai_not_configured'});
  let body={};
  try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');}catch(_){return res.status(400).json({error:'invalid_json'});}
  const query=String(body.query||'').trim();
  if(!query)return res.status(400).json({error:'query_required'});
  const catalog=body.storeCatalog&&typeof body.storeCatalog==='object'?body.storeCatalog:{};
  const schema={type:'object',properties:{
    category:{type:'string'},brand:{type:['string','null']},minBudgetToman:{type:['number','null']},maxBudgetToman:{type:['number','null']},useCase:{type:['string','null']},domains:{type:'array',items:{type:'string'}},taskType:{type:'string'},action:{type:'string'},eligibleStoreIds:{type:'array',items:{type:'string'}},productTerms:{type:'array',items:{type:'string'}},requiredNameTerms:{type:'array',items:{type:'string'}},excludedTerms:{type:'array',items:{type:'string'}},semanticNeed:{type:'string'},requestedProduct:{type:'string'},targetObject:{type:['string','null']},attributes:{type:'array',items:{type:'string'}},searchQueries:{type:'object',additionalProperties:{type:'string'}},confidence:{type:'number'}
  },required:['category','brand','minBudgetToman','maxBudgetToman','useCase','domains','taskType','action','eligibleStoreIds','productTerms','requiredNameTerms','excludedTerms','semanticNeed','requestedProduct','targetObject','attributes','searchQueries','confidence'],additionalProperties:false};
  const prompt=`تو مغز معنایی خرید دیجی‌یار هستی، نه استخراج‌کننده کلمات کلیدی. معنی واقعی درخواست را بفهم و بر اساس کاتالوگ واقعی فروشگاه‌ها فروشگاه‌های واقعاً مرتبط را انتخاب کن. برای عبارت‌های جدید، محاوره‌ای و مترادف‌ها نیز استدلال معنایی انجام بده و به Ruleهای لفظی وابسته نباش.
requestedProduct چیزی است که کاربر واقعاً می‌خواهد بخرد؛ targetObject فقط شیئی است که محصول برای آن استفاده می‌شود. «چیزی برای تمیز کردن مبل پارچه‌ای» یعنی مبل targetObject است و محصول ابزار/ماده نظافت است، نه مبل. «تصفیه هوای مناسب اتاق خواب» یعنی تصفیه هوا محصول و اتاق خواب useCase است. «لوازم جانبی موبایل» یعنی لوازم جانبی محصول است.
eligibleStoreIds مهم‌ترین خروجی است: فقط فروشگاه‌هایی را انتخاب کن که با نیاز دقیق ارتباط مستقیم و معنادار دارند. فروشگاه عمومی را فقط با categories فعلی یا شاهد مستقیم انتخاب کن؛ صرف عمومی بودن یا domain کافی نیست. فروشگاه تخصصی را با domains,intents,specialties,productFamilies,products,aliases,querySignals,semanticText ارزیابی کن. جانبی فقط برای accessories، تخفیفان فقط با درخواست صریح تخفیف، و فروشگاه خودرو فقط برای نیاز واقعی خودرو/خدمت خودرو انتخاب شود. برای نیاز ترکیبی همه ویژگی‌های اصلی را همزمان در نظر بگیر. برای هر فروشگاه انتخاب‌شده searchQueries یک عبارت کوتاه و محصول‌محور بساز؛ بودجه، targetObject و useCase را مگر بخشی از نام محصول باشند وارد نکن. فقط شناسه‌های موجود در catalog را استفاده کن.
کاتالوگ:
${JSON.stringify(catalog)}
عبارت کاربر:
${query}`;
  try{
    const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:'openai/gpt-5.4',input:prompt,text:{format:{type:'json_schema',name:'digiyar_shopping_plan',strict:true,schema}},max_output_tokens:1400})});
    const data=await r.json();
    if(!r.ok)return res.status(502).json({error:'ai_gateway_error',detail:data&&data.error?data.error:null});
    const raw=String(data.output_text||'').trim();
    let plan;try{plan=JSON.parse(raw);}catch(_){return res.status(502).json({error:'ai_invalid_json'});}
    const allowed=new Set(Object.keys(catalog).map(x=>String(x).toLowerCase()));
    plan.eligibleStoreIds=Array.isArray(plan.eligibleStoreIds)?plan.eligibleStoreIds.map(x=>String(x||'').toLowerCase()).filter((x,i,a)=>allowed.has(x)&&a.indexOf(x)===i):[];
    return res.status(200).json({ok:true,provider:'vercel-ai-gateway',model:'openai/gpt-5.4',plan});
  }catch(e){return res.status(502).json({error:'ai_request_failed'});}
};