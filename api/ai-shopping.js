// DigiYar V7 — canonical semantic shopping planner
// AI interprets the user's need; the merchant KB supplies evidence and hard exclusions.

const MODEL = 'openai/gpt-5.5';
const MAX_LATENCY_MS = 10000;

function send(res, status, payload) {
  return res.status(status).json(payload);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });

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
    // Load the ESM AI SDK lazily inside the handler. A top-level require can crash
    // the Vercel function before it can return even OPTIONS/405 responses.
    const { generateText } = await import('ai');
    const result = await generateText({
      model: MODEL,
      prompt,
      reasoning: 'none',
      maxOutputTokens: 900,
      abortSignal: AbortSignal.timeout(MAX_LATENCY_MS)
    });

    let plan;
    try {
      plan = parseModelJson(result.text);
    } catch (_) {
      return send(res, 502, {
        error: 'ai_invalid_json',
        provider: 'vercel-ai-sdk',
        model: MODEL
      });
    }

    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
      return send(res, 502, {
        error: 'ai_invalid_plan',
        provider: 'vercel-ai-sdk',
        model: MODEL
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
      provider: 'vercel-ai-sdk',
      model: MODEL,
      plan
    });
  } catch (error) {
    console.error('Hooshyar AI Gateway failure', error && error.message || error);
    return send(res, 502, {
      error: 'ai_request_failed',
      provider: 'vercel-ai-sdk',
      model: MODEL,
      detail: String(error && error.message || 'gateway_failure').slice(0, 500)
    });
  }
};
