// DigiYar V7 — canonical semantic shopping planner
// AI interprets the user's need; the merchant KB supplies evidence and hard exclusions.

const MODEL = 'openrouter/free';
const DEEPSEEK_MODEL = 'deepseek-flash';
const PROVIDER = 'openrouter';
const MAX_LATENCY_MS = 10000;
const ALLOWED_ORIGINS = new Set(['https://petromosi-pixel.github.io']);
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const requestBuckets = new Map();

function send(res, status, payload) {
  return res.status(status).json(payload);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return clean(value).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\u200c]/g,' ')
    .replace(/تلفن\s*همراه/g,'موبایل').replace(/گوشی\s*هوشمند/g,'گوشی').replace(/بلیت/g,'بلیط')
    .replace(/ضد\s*آفتاب|ضدآفتاب/g,'ضد آفتاب').replace(/\s+/g,' ').toLowerCase();
}

function localFallbackPlan(query, catalog) {
  const q=normalize(query);
  const ids=Object.keys(catalog||{}).map(id=>id.toLowerCase());
  const has=id=>ids.includes(id);
  const selected=[];
  const add=id=>{if(has(id)&&!selected.includes(id))selected.push(id);};
  let product=clean(query),category='general',taskType='shopping_search',domains=[],targetObject=null;
  const isAccessory=/(?:قاب|کاور|گلس|محافظ\s*صفحه|شارژر|کابل|پاوربانک|هندزفری|هدفون|هدست|ایرباد|هولدر|لوازم\s*جانبی|اکسسوری)/i.test(q);
  if(/(?:بلیط|بلیت|رزرو|سفر|می\s*خوام\s*برم|می\s*خواهم\s*بروم)/i.test(q)&&/(?:قطار|ریل|هواپیما|پرواز|اتوبوس)/i.test(q)){
    const mode=/(?:قطار|ریل)/i.test(q)?'قطار':/(?:اتوبوس)/i.test(q)?'اتوبوس':'هواپیما';
    product='بلیط '+mode; category='travel_ticket'; taskType='ticket_search'; domains=['travel_ticket'];
    (mode==='قطار'?['shab','safarme','raja','ghasedak24','mrbilit','trip','safarmarket','alibaba']:mode==='اتوبوس'?['ghasedak24','mrbilit','safarmarket','alibaba']:['alibaba','flytoday','ghasedak24','mrbilit','safarmarket','trip','flysepehran']).forEach(add);
  } else if(/(?:تصفیه\s*هوا|دستگاه\s*تصفیه|هوای\s*(?:اتاق|خانه).{0,18}(?:تمیز|پاک|آلوده|گرد\s*و\s*غبار))/i.test(q)){
    product='دستگاه تصفیه هوا'; category='home'; domains=['home','digital'];
    ['digikala','snappshop','torob','basalam','memarket'].forEach(add);
  } else if(/(?:تمیز\s*کردن|تمیزکاری|شستشو|شستن|نظافت|پاک\s*کردن|مبل\s*شویی|شستشوی\s*مبل)/i.test(q)&&/(?:مبل|مبلمان|پارچه)/i.test(q)){
    product='محصول نظافت مبل پارچه‌ای'; targetObject='مبل پارچه‌ای'; category='home'; taskType='cleaning_task'; domains=['home'];
    ['digikala','snappshop','torob','basalam'].forEach(add);
  } else if(/(?:موبایل|گوشی|سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi)/i.test(q)){
    product=isAccessory?'لوازم جانبی موبایل':('گوشی '+((q.match(/(?:سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi)/i)||['موبایل'])[0]));
    category='digital'; domains=['digital'];
    if(isAccessory){
      ['digido','janebi','gooshishop','technolife','digikala','snappshop','torob','basalam'].forEach(add);
      product='لوازم جانبی موبایل';
    } else {
      ['digido','digiland','berozkala','gooshishop','technolife','meghdadit',
       'digikala','snappshop','torob','basalam','takhfifan','esam'].forEach(add);
      product='گوشی '+((q.match(/(?:سامسونگ|آیفون|iphone|samsung|شیائومی|xiaomi)/i)||['موبایل'])[0]);
    }
  } else {
    const terms=[];
    ids.forEach(id=>{const s=catalog[id]||{};asArray(s.products).concat(asArray(s.aliases),asArray(s.specialties),asArray(s.productFamilies),asArray(s.querySignals)).forEach(v=>String(v).split(/[,،;؛\n]+/).forEach(t=>{const term=normalize(t);if(term.length>=3&&q.includes(term))terms.push({id,term});}));});
    terms.sort((a,b)=>b.term.length-a.term.length);
    if(terms.length){product=terms[0].term;terms.forEach(t=>add(t.id));}
    if(/(?:تخفیف|کد\s*تخفیف|کوپن|آفر)/i.test(q))add('takhfifan');
    if(/(?:موبایل|گوشی|لپ\s*تاپ|تبلت|تصفیه\s*هوا|لوازم\s*خانگی|مبل|میز|کیف|کفش|لباس)/i.test(q))['digikala','snappshop','torob','basalam'].forEach(add);
  }
  selected.forEach(id=>{const s=catalog[id]||{};asArray(s.domains).forEach(d=>{if(!domains.includes(d))domains.push(d);});});
  const searchQueries={};selected.forEach(id=>{searchQueries[id]=product||clean(query);});
  return {category,brand:null,minBudgetToman:null,maxBudgetToman:null,useCase:targetObject?'نظافت مبل پارچه‌ای':null,domains,taskType,action:'find_relevant_stores',eligibleStoreIds:selected,productTerms:[product],requiredNameTerms:[],excludedTerms:[],semanticNeed:clean(query),requestedProduct:product||clean(query),targetObject,attributes:[],searchQueries,confidence:selected.length?0.62:0.2,mode:'local-knowledge-base'};
}


function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(clean(origin));
}

function allowRequest(req) {
  const forwarded = clean(req.headers['x-forwarded-for']);
  const ip = forwarded ? forwarded.split(',')[0].trim() : clean(req.socket && req.socket.remoteAddress) || 'unknown';
  const now = Date.now();
  const current = requestBuckets.get(ip);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= RATE_LIMIT_MAX;
}

function parseModelJson(text) {
  const raw = String(text || '')
    .trim()
    .replace(/^\`\`\`(?:json)?\s*/i, '')
    .replace(/\s*\`\`\`$/, '')
    .trim();
  try {
    return JSON.parse(raw);
  } catch (_) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error('ai_invalid_json');
  }
}

module.exports = async function handler(req, res) {
  const origin = clean(req.headers.origin);
  if (!isAllowedOrigin(origin)) return send(res, 403, { error: 'origin_not_allowed' });

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (!allowRequest(req)) {
    res.setHeader('Retry-After', '60');
    return send(res, 429, { error: 'rate_limit_exceeded' });
  }

  let body = {};
  try {
    body = typeof req.body === 'object' && req.body
      ? req.body
      : JSON.parse(req.body || '{}');
  } catch (_) {
    return send(res, 400, { error: 'invalid_json' });
  }

  const query = clean(body.query);
  if (!query) return send(res, 400, { error: 'query_required' });

  const catalog = body.storeCatalog && typeof body.storeCatalog === 'object'
    ? body.storeCatalog
    : {};
  const catalogIds = Object.keys(catalog).map(id => String(id).toLowerCase());
  if (!catalogIds.length) {
    return send(res, 400, { error: 'merchant_catalog_required' });
  }

  // Send one canonical, compact projection. Keep querySignals and hard exclusions:
  // both were present in the browser KB but missing/misaligned in the model payload.
  const modelCatalog = {};
  Object.keys(catalog).forEach(id => {
    const s = catalog[id] || {};
    modelCatalog[String(id).toLowerCase()] = {
      id: String(s.id || id).toLowerCase(),
      name: String(s.name || id),
      domains: asArray(s.domains),
      intents: asArray(s.intents),
      specialties: asArray(s.specialties),
      productFamilies: asArray(s.productFamilies),
      products: asArray(s.products),
      aliases: asArray(s.aliases),
      querySignals: asArray(s.querySignals),
      categories: asArray(s.categories),
      semanticText: String(s.semanticText || ''),
      matchPolicy: s.matchPolicy || null,
      exclude: asArray(s.exclusions || s.exclude)
    };
  });

  const prompt = `تو مغز معنایی خرید دیجی‌یار هستی، نه استخراج‌کنندهٔ کلمات کلیدی و نه Rule Engine.
درخواست کاربر را با توجه به مفهوم، هدف و کاربرد واقعی آن بفهم. برای عبارت‌های محاوره‌ای، مترادف‌ها و ترکیب‌های تازه نیز استدلال معنایی انجام بده؛ واژه‌برداری سطحی کافی نیست.

تعریف فیلدها:
- requestedProduct: چیزی که کاربر واقعاً می‌خواهد بخرد یا تهیه کند.
- targetObject: شیئی که محصول برای آن استفاده می‌شود؛ الزاماً محصول درخواستی نیست.
- useCase: کاربرد یا موقعیت استفاده.
نمونه: «یه چیزی برای تمیز کردن مبل پارچه‌ای» یعنی محصول نظافت درخواستی است و مبل فقط targetObject است؛ فروشگاه مبلمان نباید انتخاب شود.
نمونه: «تصفیه هوای مناسب اتاق خواب» یعنی تصفیه هوا محصول است و اتاق خواب کاربرد است.
نمونه: «لوازم جانبی موبایل» یعنی لوازم جانبی محصول درخواستی است.

قواعد انتخاب فروشگاه:
1. فقط فروشگاه‌هایی را انتخاب کن که برای نیاز واقعی کاربر ارتباط مستقیم و قابل دفاع دارند.
2. فقط از شناسه‌های موجود در کاتالوگ استفاده کن.
3. فروشگاه عمومی را تنها وقتی انتخاب کن که categories، products یا شواهد مستقیم کاتالوگ پوشش کالای درخواستی را تأیید کند؛ عمومی بودن به‌تنهایی کافی نیست.
4. برای فروشگاه تخصصی، domains، intents، specialties، productFamilies، products، aliases، querySignals و semanticText را با هم ارزیابی کن.
5. فیلد exclude و matchPolicy.hardExclude محدودیت صریح فروشگاه‌اند؛ اگر نیاز کاربر با آن‌ها تعارض دارد، آن فروشگاه را انتخاب نکن.
6. targetObject را با requestedProduct اشتباه نگیر. کلمهٔ «مبل» در درخواست نظافت، دلیل انتخاب فروشگاه مبلمان نیست.
7. برای خرید خودرو، فروشگاه‌های عمومی دیجیتال را بی‌دلیل انتخاب نکن.
8. «جانبی» فقط برای قصد واقعی لوازم جانبی/اکسسوری انتخاب شود.
9. «تخفیفان» فقط وقتی قصد تخفیف، کوپن یا پیشنهاد ویژه وجود دارد.
10. فروشگاه‌های سفر فقط برای نیاز واقعی سفر، بلیت یا رزرو انتخاب شوند.
11. اگر شواهد کافی برای فروشگاهی نداری، آن را حذف کن؛ حدس نزن و صرفاً برای زیاد شدن نتایج فروشگاه اضافه نکن.

searchQueries:
برای هر فروشگاه انتخاب‌شده، یک عبارت کوتاه و محصول‌محور بساز که همان محصول واقعی را جست‌وجو کند. کاربرد و شیء هدف را فقط در صورتی وارد کن که برای تشخیص خود محصول لازم باشد.

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

کاتالوگ معتبر فروشگاه‌ها:
${JSON.stringify(modelCatalog)}

عبارت کاربر:
${query}`;

  try {
    // Provider is opt-in. DeepSeek's consumer chat is free, but its API is metered.
    // A client may request a provider only when its server-side API key is configured; no key is ever sent to the browser.
    const requestedProvider = clean(body.provider).toLowerCase();
    const configuredProvider = clean(process.env.HOOSHYAR_AI_PROVIDER).toLowerCase();
    const selectedProvider = ['deepseek','openrouter'].includes(requestedProvider)
      ? requestedProvider
      : (['deepseek','openrouter'].includes(configuredProvider) ? configuredProvider : '');
    const useDeepSeek = selectedProvider === 'deepseek';
    const useOpenRouter = selectedProvider === 'openrouter';
    const provider = useDeepSeek ? 'deepseek' : (useOpenRouter ? 'openrouter' : 'local-knowledge-base');
    const model = useDeepSeek ? DEEPSEEK_MODEL : (useOpenRouter ? MODEL : null);
    const apiKey = useDeepSeek ? clean(process.env.DEEPSEEK_API_KEY)
      : (useOpenRouter ? clean(process.env.OPENROUTER_API_KEY) : '');
    if (!apiKey) {
      const plan=localFallbackPlan(query,modelCatalog);
      return send(res,200,{ok:true,provider:'local-knowledge-base',model:null,warning:'semantic_ai_unconfigured',plan});
    }

    const endpoint = useDeepSeek
      ? 'https://api.deepseek.com/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MAX_LATENCY_MS);
    let result;
    try {
      const headers = {'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json'};
      if (useOpenRouter) {
        headers['HTTP-Referer'] = 'https://petromosi-pixel.github.io/DigiYar-GPT/';
        headers['X-OpenRouter-Title'] = 'DigiYar Hooshyar';
      }
      result = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 900,
          response_format: {type: 'json_object'}
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!result.ok) {
      const providerError = await result.text().catch(() => '');
      console.error('Hooshyar semantic provider API failure', result.status, providerError.slice(0, 400));
      return send(res, 502, {
        error: 'ai_request_failed',
        provider: provider,
        model: model,
        upstreamStatus: result.status,
        detail: 'Semantic provider API request failed; inspect Vercel runtime logs.'
      });
    }

    const responseData = await result.json();
    const modelText = String(responseData.choices && responseData.choices[0] &&
      responseData.choices[0].message && responseData.choices[0].message.content || '').trim();

    if (!modelText) {
      return send(res, 502, {
        error: 'ai_empty_response',
        provider: provider,
        model: model
      });
    }

    let plan;
    try {
      plan = parseModelJson(modelText);
    } catch (_) {
      return send(res, 502, {
        error: 'ai_invalid_json',
        provider: provider,
        model: model
      });
    }

    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
      return send(res, 502, {
        error: 'ai_invalid_plan',
        provider: provider,
        model: model
      });
    }

    // Validate IDs and enforce explicit merchant-specific KB exclusions after AI reasoning.
    const semanticText = clean([
      query,
      plan.semanticNeed,
      plan.requestedProduct,
      plan.taskType,
      plan.action,
      ...asArray(plan.productTerms),
      ...asArray(plan.attributes)
    ].join(' ')).toLowerCase();

    const eligible = asArray(plan.eligibleStoreIds)
      .map(id => String(id || '').toLowerCase())
      .filter((id, index, all) => catalogIds.includes(id) && all.indexOf(id) === index)
      .filter(id => {
        const merchant = modelCatalog[id];
        const exclusions = asArray(merchant && merchant.exclude)
          .map(clean)
          .filter(Boolean);
        return !exclusions.some(term => term && semanticText.includes(term.toLowerCase()));
      });

    plan.eligibleStoreIds = eligible;
    if (!plan.searchQueries || typeof plan.searchQueries !== 'object' || Array.isArray(plan.searchQueries)) {
      plan.searchQueries = {};
    }

    // Do not expose queries for merchants removed by catalog validation/exclusions.
    Object.keys(plan.searchQueries).forEach(id => {
      if (!eligible.includes(String(id).toLowerCase())) delete plan.searchQueries[id];
    });

    plan.category = clean(plan.category);
    plan.requestedProduct = clean(plan.requestedProduct);
    plan.semanticNeed = clean(plan.semanticNeed);
    plan.targetObject = plan.targetObject == null ? null : clean(plan.targetObject);
    plan.domains = asArray(plan.domains).map(clean).filter(Boolean);
    plan.productTerms = asArray(plan.productTerms).map(clean).filter(Boolean);
    plan.requiredNameTerms = asArray(plan.requiredNameTerms).map(clean).filter(Boolean);
    plan.excludedTerms = asArray(plan.excludedTerms).map(clean).filter(Boolean);
    plan.attributes = asArray(plan.attributes).map(clean).filter(Boolean);
    plan.confidence = Number.isFinite(Number(plan.confidence))
      ? Math.max(0, Math.min(1, Number(plan.confidence)))
      : 0;

    return send(res, 200, {
      ok: true,
      provider: provider,
      model: model,
      plan
    });
  } catch (error) {
    console.error('Hooshyar semantic provider request failure', error && error.message || error);
    return send(res, 502, {
      error: 'ai_request_failed',
      provider: provider,
      model: model,
      detail: String(error && error.message || 'gateway_failure').slice(0, 500)
    });
  }
};
