// DigiYar V7 — semantic AI shopping planner endpoint
// The endpoint uses Vercel AI SDK so Vercel OIDC authentication is handled
// by the Gateway integration instead of manually forwarding environment tokens.
const { generateText } = require('ai');

const MODEL='openai/gpt-5.6-luna';
const MAX_LATENCY_MS=10000;

function send(res,status,payload){
  return res.status(status).json(payload);
}

module.exports = async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');

  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});

  let body={};
  try{
    body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');
  }catch(_){
    return send(res,400,{error:'invalid_json'});
  }

  const query=String(body.query||'').trim();
  if(!query)return send(res,400,{error:'query_required'});

  const catalog=body.storeCatalog&&typeof body.storeCatalog==='object'?body.storeCatalog:{};
  const catalogIds=Object.keys(catalog).map(x=>String(x).toLowerCase());
  // Keep the full KB on the client, but send a compact semantic projection to the model.
  // The previous request serialized every merchant field (including duplicated signals),
  // which made the planner unnecessarily slow.
  const modelCatalog={};
  Object.keys(catalog).forEach(function(id){
    const s=catalog[id]||{};
    modelCatalog[id]={
      id:String(s.id||id).toLowerCase(),name:String(s.name||id),
      domains:Array.isArray(s.domains)?s.domains.slice():[],
      intents:Array.isArray(s.intents)?s.intents.slice():[],
      specialties:Array.isArray(s.specialties)?s.specialties.slice():[],
      productFamilies:Array.isArray(s.productFamilies)?s.productFamilies.slice():[],
      products:Array.isArray(s.products)?s.products.slice():[],
      aliases:Array.isArray(s.aliases)?s.aliases.slice():[],
      exclusions:Array.isArray(s.exclusions)?s.exclusions.slice():[],
      categories:Array.isArray(s.categories)?s.categories.slice():[],
      semanticText:String(s.semanticText||'')
    };
  });

  const prompt=`تو مغز معنایی خرید دیجی‌یار هستی، نه استخراج‌کننده کلمات کلیدی و نه Rule Engine.
معنی واقعی درخواست کاربر را بفهم و با استدلال معنایی، فقط فروشگاه‌هایی را انتخاب کن که واقعاً برای نیاز او مناسب‌اند.
برای عبارت‌های کاملاً جدید، محاوره‌ای، مترادف‌ها و ترکیب‌های جدید نیز باید بدون داشتن Rule لفظی قبلی استدلال کنی.

تعریف دقیق:
- requestedProduct = چیزی که کاربر واقعاً می‌خواهد بخرد یا تهیه کند.
- targetObject = شیئی که محصول برای آن استفاده می‌شود؛ خودش الزاماً محصول درخواستی نیست.
- useCase = کاربرد یا موقعیت استفاده.
مثال: «یه چیزی برای تمیز کردن مبل پارچه‌ای» یعنی محصولِ نظافت درخواستی است و «مبل» فقط targetObject است؛ فروشگاه مبلمان به‌خاطر کلمه مبل نباید انتخاب شود.
مثال: «تصفیه هوای مناسب اتاق خواب» یعنی تصفیه هوا محصول و اتاق خواب useCase است.
مثال: «لوازم جانبی موبایل» یعنی accessories محصول درخواستی است.

قانون اصلی eligibleStoreIds:
فقط شناسه فروشگاه‌هایی را برگردان که با نیاز واقعی کاربر ارتباط مستقیم و معنادار دارند.
- فروشگاه عمومی را فقط وقتی انتخاب کن که categories فعلی آن یا شواهد مستقیم KB نشان دهد کالای درخواستی را پوشش می‌دهد.
- صرف عمومی بودن فروشگاه، وجود یک domain کلی یا شباهت یک کلمه کافی نیست.
- فروشگاه تخصصی را با domains, intents, specialties, productFamilies, products, aliases, querySignals, semanticText ارزیابی کن.
- targetObject را با requestedProduct اشتباه نکن.
- برای نیازهای خرید خودرو، فروشگاه‌های عمومی را بی‌دلیل اضافه نکن.
- «جانبی» فقط برای لوازم جانبی/اکسسوری واقعی انتخاب شود.
- «تخفیفان» فقط وقتی درخواست صریح تخفیف/کوپن/پیشنهاد ویژه وجود دارد.
- فروشگاه‌های تخصصی سفر فقط برای نیاز واقعی سفر/بلیط/رزرو انتخاب شوند.
- برای نیاز ترکیبی، همه ویژگی‌های اصلی درخواست را همزمان لحاظ کن.
- هرگز شناسه‌ای خارج از catalog برنگردان.

searchQueries:
برای هر فروشگاه انتخاب‌شده، یک query کوتاه و محصول‌محور بساز که همان محصول واقعی را جست‌وجو کند.
قیدهای کاربردی مثل targetObject/useCase و بودجه را فقط اگر جزئی از نام محصول‌اند وارد query نکن.

خروجی فقط JSON معتبر با این ساختار باشد:
{
  "category": string,
  "brand": string|null,
  "minBudgetToman": number|null,
  "maxBudgetToman": number|null,
  "useCase": string|null,
  "domains": string[],
  "taskType": string,
  "action": string,
  "eligibleStoreIds": string[],
  "productTerms": string[],
  "requiredNameTerms": string[],
  "excludedTerms": string[],
  "semanticNeed": string,
  "requestedProduct": string,
  "targetObject": string|null,
  "attributes": string[],
  "searchQueries": {"storeId":"query"},
  "confidence": number
}

کاتالوگ واقعی فروشگاه‌ها:
${JSON.stringify(modelCatalog)}

عبارت کاربر:
${query}`;

  try{
    const result=await generateText({
      model:MODEL,
      prompt,
      reasoning:'none',
      maxOutputTokens:650,
      abortSignal:AbortSignal.timeout(MAX_LATENCY_MS)
    });

    const raw=String(result.text||'').trim()
      .replace(/^\`\`\`json\s*/i,'')
      .replace(/^\`\`\`\s*/,'')
      .replace(/\s*\`\`\`$/,'')
      .trim();

    let plan;
    try{
      plan=JSON.parse(raw);
    }catch(_){
      return send(res,502,{error:'ai_invalid_json',provider:'vercel-ai-sdk',model:MODEL});
    }

    if(!plan||typeof plan!=='object'){
      return send(res,502,{error:'ai_invalid_plan',provider:'vercel-ai-sdk',model:MODEL});
    }

    plan.eligibleStoreIds=Array.isArray(plan.eligibleStoreIds)
      ?plan.eligibleStoreIds
        .map(x=>String(x||'').toLowerCase())
        .filter((x,i,a)=>catalogIds.indexOf(x)!==-1&&a.indexOf(x)===i)
      :[];

    if(!plan.searchQueries||typeof plan.searchQueries!=='object')plan.searchQueries={};

    return send(res,200,{
      ok:true,
      provider:'vercel-ai-sdk',
      model:MODEL,
      plan
    });
  }catch(error){
    console.error('Hooshyar AI Gateway failure',error&&error.message||error);
    return send(res,502,{
      error:'ai_request_failed',
      provider:'vercel-ai-sdk',
      model:MODEL,
      detail:String(error&&error.message||'gateway_failure').slice(0,500)
    });
  }
};