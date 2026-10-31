/* DigiYar V8 — Hooshyar discovery engine (simplified & stable) */
(function(){
'use strict';

var VERSION = '8.0.1-hooshyar-engine.1';

/* ---------- Domain presentation metadata ---------- */
var DOMAIN_META = {
  digital:{title:'دیجیتال و موبایل',icon:'📱',subtitle:'از گوشی و لپتاپ تا مقایسهٔ قیمت',sub:['موبایل','لپتاپ','مقایسهٔ قیمت','لوازم جانبی']},
  accessories:{title:'لوازم جانبی دیجیتال',icon:'🎧',subtitle:'برای پیدا کردن لوازم جانبی',sub:['قاب و محافظ','شارژر','صوتی و گجت']},
  furniture:{title:'مبلمان و دکوراسیون',icon:'🛋️',subtitle:'برای چیدمان خانه',sub:['مبل','میز و صندلی','دکور']},
  fashion:{title:'پوشاک، کیف و کفش',icon:'👕',subtitle:'از استایل روزمره تا برند',sub:['پوشاک','کیف و کفش','برند']},
  beauty:{title:'زیبایی و آرایشی',icon:'💄',subtitle:'مراقبت پوست و مو',sub:['مراقبت پوست','آرایش','عطر']},
  health:{title:'سلامت و بهداشتی',icon:'🌿',subtitle:'محصولات سلامت',sub:['مکمل','بهداشت','مراقبت']},
  medicine:{title:'دارو و تجهیزات',icon:'🩺',subtitle:'داروخانه‌ها و تجهیزات',sub:['داروخانه','تجهیزات پزشکی']},
  supermarket:{title:'سوپرمارکت',icon:'🛒',subtitle:'خرید روزمره',sub:['مواد غذایی','سوپرمارکت']},
  home:{title:'خانه و آشپزخانه',icon:'🏠',subtitle:'وسایل خانه',sub:['آشپزخانه','ابزار','لوازم']},
  sports:{title:'ورزش',icon:'⚽',subtitle:'تجهیزات ورزشی',sub:['پوشاک ورزشی','تجهیزات','لوازم']},
  kids:{title:'کودک و نوزاد',icon:'🧸',subtitle:'محصولات کودک',sub:['نوزاد','بازی','نیازها']},
  books:{title:'کتاب و فرهنگی',icon:'📚',subtitle:'کتاب چاپی و دیجیتال',sub:['کتاب چاپی','الکترونیکی','صوتی']},
  auto:{title:'خودرو و قطعات',icon:'🚗',subtitle:'قطعات و لوازم',sub:['قطعات','لوازم','خودرو']},
  auto_service:{title:'خدمات خودرو',icon:'🔧',subtitle:'خدمات و کارشناسی',sub:['کارشناسی','نگهداری','آنلاین']},
  travel_ticket:{title:'بلیط و حمل‌ونقل',icon:'🎫',subtitle:'مقایسه بلیط',sub:['هواپیما','قطار','تور']},
  lodging:{title:'اقامت و هتل',icon:'🛏️',subtitle:'رزرو اقامتگاه',sub:['اقامتگاه','هتل','سفر']},
  education:{title:'آموزش',icon:'🎓',subtitle:'دوره‌های آنلاین',sub:['برنامه‌نویسی','مهارت','دوره']},
  affiliate_network:{title:'شبکه افیلیت',icon:'🤝',subtitle:'همکاری در فروش',sub:['افیلیت','بازاریابی']}
};

var DOMAIN_ORDER = Object.keys(DOMAIN_META);

/* ---------- Featured (priority only, never whitelist) ---------- */
var FEATURED = {
  digital:[['digikala','انتخاب‌های متنوع'],['torob','مقایسه قیمت'],['technolife','کالای دیجیتال'],['digiland','موبایل و دیجیتال'],['emalls','مقایسه']],
  accessories:[['janebi','لوازم جانبی'],['digido','لوازم موبایل'],['gooshishop','موبایل و جانبی']],
  fashion:[['digistyle','پوشاک'],['banimode','استایل'],['modiseh','پوشاک'],['shixon','مد']],
  health:[['mosbatesabz','سلامت'],['darukade','داروخانه'],['darmankala','سلامت']],
  medicine:[['darukade','داروخانه'],['darmankala','تجهیزات']],
  supermarket:[['okala','خرید روزمره'],['ofoghkoroosh','مصرفی'],['shahrvand','روزانه'],['hyperme','سوپرمارکت']],
  books:[['fidibo','کتاب الکترونیکی'],['taaghche','کتاب دیجیتال'],['book30','کتاب چاپی']],
  auto_service:[['hamrahmechanic','خدمات خودرو'],['khodro45','خدمات'],['aytol','آنلاین']],
  travel_ticket:[['alibaba','بلیط سفر'],['mrbilit','بلیط'],['raja','قطار'],['safarmarket','سفر']],
  education:[['faradars','مهارت'],['maktabkhooneh','دوره'],['quera','برنامه‌نویسی'],['sabzlearn','دیجیتال']],
  affiliate_network:[]
};

/* ---------- State ---------- */
var state = {
  type: 'general',
  domain: 'digital',
  query: '',
  queryActive: false,
  queryStoreIds: null,
  categoriesByStore: {},
  openCategories: {}
};

/* ---------- Utilities ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCatalog() {
  var kb = window.DigiYarStoreBusinessDomains;
  return kb && kb.catalog ? kb.catalog : {};
}

function getDomainTitle(domain) {
  var kb = window.DigiYarStoreBusinessDomains;
  var labels = kb && kb.domainTitles || {};
  return labels[domain] || (DOMAIN_META[domain] || {}).title || domain;
}

function getDomainMeta(domain) {
  var meta = DOMAIN_META[domain] || {title: domain, icon: '🏬', subtitle: 'فروشگاه‌ها'};
  return Object.assign({}, meta, {title: getDomainTitle(domain)});
}

/* ---------- Tokenizer ---------- */
function wordTokens(text) {
  return normalize(text)
    .split(/[^\u0600-\u06FFa-z0-9]+/i)
    .filter(function(t) { return t.length > 1; });
}

/* ---------- Simple intent detection (only for special routing, not exclusion) ---------- */
function detectIntent(raw) {
  if (/(?:بلیط|بلیت|رزرو).{0,12}(?:قطار|ریل)|(?:قطار|ریل).{0,12}(?:بلیط|بلیت)/.test(raw)) return 'train_ticket';
  if (/ضد\s*آفتاب|ضدآفتاب/.test(raw)) return 'sunscreen';
  if (/(?:لوازم|تجهیزات)\s*جانبی/.test(raw)) return 'accessory';
  if (/موبایل|گوشی|لپ\s*تاپ|لپتاپ|کامپیوتر|تبلت|مانیتور|پرینتر/.test(raw)) return 'digital_product';
  return 'general_product';
}

/* ---------- Light semantic enrichment ---------- */
var SEMANTIC_HINTS = [
  {re: /(?:هواپز|ایر.?فرایر)/i, terms: 'هواپز سرخ کن لوازم آشپزخانه'},
  {re: /(?:جارو.?رباتیک|ربات.?جارو)/i, terms: 'جاروبرقی رباتیک نظافت'},
  {re: /(?:ساعت.?هوشمند|اسمارت.?واچ)/i, terms: 'ساعت هوشمند گجت'},
  {re: /(?:هدفون|هندزفری)/i, terms: 'هدفون هندزفری لوازم جانبی'},
  {re: /(?:پاوربانک)/i, terms: 'پاوربانک شارژر لوازم جانبی'},
  {re: /(?:قاب|گلس|محافظ)/i, terms: 'قاب گلس محافظ لوازم جانبی'},
  {re: /(?:کیف.?اداری|کیف.?کار)/i, terms: 'کیف اداری کیف کار'},
  {re: /(?:مبل|کاناپه)/i, terms: 'مبل مبلمان خانه'},
  {re: /(?:کتاب|رمان)/i, terms: 'کتاب رمان فرهنگی'},
  {re: /(?:بلیط|بلیت)/i, terms: 'بلیط سفر حمل و نقل'}
];

function semanticQuery(raw) {
  var additions = [];
  SEMANTIC_HINTS.forEach(function(h) {
    if (h.re.test(raw)) additions.push(h.terms);
  });
  return additions.length ? raw + ' ' + additions.join(' ') : raw;
}

/* ---------- Core search function (SIMPLIFIED) ---------- */
function resolveSearchContext(query) {
  var catalog = getCatalog();
  var raw = normalize(query);

  // Empty query → return empty
  if (!raw) {
    return {
      query: String(query || ''),
      storeIds: [],
      eligibleStoreIds: [],
      routeUnavailableStoreIds: [],
      categoriesByStore: {},
      source: 'product-category-catalog',
      intent: 'empty'
    };
  }

  // Exact store name lookup (directory request)
  var exactStores = Object.keys(catalog).filter(function(id) {
    var st = catalog[id] || {};
    var name = normalize(st.name || '');
    var key = normalize(id);
    return raw === name || raw === key;
  });

  if (exactStores.length) {
    var exactCats = {};
    exactStores.forEach(function(id) {
      var st = catalog[id] || {};
      exactCats[id] = (st.domains || []).map(getDomainTitle);
    });
    return {
      query: String(query || ''),
      storeIds: exactStores,
      eligibleStoreIds: exactStores,
      routeUnavailableStoreIds: [],
      categoriesByStore: exactCats,
      source: 'product-category-catalog',
      intent: 'store_lookup'
    };
  }

  // Token-based search (permissive)
  var enriched = semanticQuery(raw);
  var tokens = wordTokens(enriched);

  // Stop words
  var stop = 'برای دنبال میخوام میخواهم می خوام مناسب نیاز دارم خرید خریدن بخرم یک یه و یا از با در به که هست است باشد هستم لطفا قیمت بودجه متوسط ارزان گران بهترین خوب محل کارم'.split(' ');

  tokens = tokens.filter(function(t) { return stop.indexOf(t) < 0; });

  if (!tokens.length) {
    return {
      query: String(query || ''),
      storeIds: [],
      eligibleStoreIds: [],
      routeUnavailableStoreIds: [],
      categoriesByStore: {},
      source: 'product-category-catalog',
      intent: 'empty'
    };
  }

  // Score every store
  var scored = [];

  Object.keys(catalog).forEach(function(id) {
    var store = catalog[id] || {};
    var fields = [].concat(
      store.products || [],
      store.aliases || [],
      store.specialties || [],
      store.productFamilies || [],
      store.querySignals || []
    );
    var hay = normalize(fields.join(' '));
    var fieldTokens = wordTokens(hay);
    var domains = Array.isArray(store.domains) ? store.domains : [];

    // Exclusion check
    var excluded = (store.exclude || []).some(function(term) {
      var x = normalize(term);
      return x.length > 1 && raw.indexOf(x) >= 0;
    });
    if (excluded) return;

    // Scoring
    var score = 0;

    // Phrase match bonus
    fields.forEach(function(field) {
      var f = normalize(field);
      if (f.length >= 3 && raw.indexOf(f) >= 0) {
        score = Math.max(score, 10 + Math.min(f.length, 12));
      }
    });

    // Token matches
    tokens.forEach(function(t) {
      var matched = fieldTokens.some(function(ft) {
        return ft === t || (t.length >= 4 && ft.length >= 4 && (ft.indexOf(t) === 0 || t.indexOf(ft) === 0));
      });
      if (matched) score += t.length >= 5 ? 3 : 1;
    });

    if (score > 0) {
      scored.push({
        id: id,
        score: score,
        categories: domains.map(getDomainTitle),
        domains: domains
      });
    }
  });

  // Sort by score
  scored.sort(function(a, b) {
    return b.score - a.score || a.id.localeCompare(b.id);
  });

  // Check route availability per store (but DO NOT remove them)
  var out = [];
  var routeUnavailable = [];
  var categoriesByStore = {};

  scored.forEach(function(item) {
    var key = item.id;
    var urlResolver = window.DigiYarStoreSearchUrl;
    var hasRoute = urlResolver &&
                   typeof urlResolver.resolve === 'function' &&
                   urlResolver.resolve(key, raw);

    var entry = {
      id: key,
      score: item.score,
      categories: item.categories.length ? item.categories : [
        catalog[key] && catalog[key].storeType === 'general' ? 'فروشگاه عمومی' : 'فروشگاه تخصصی'
      ],
      routeUnavailable: !hasRoute
    };

    out.push(entry);
    categoriesByStore[key] = entry.categories;

    if (!hasRoute) {
      routeUnavailable.push(entry);
    }
  });

  return {
    query: String(query || ''),
    storeIds: out.map(function(x) { return x.id; }),
    eligibleStoreIds: out.map(function(x) { return x.id; }),
    routeUnavailableStoreIds: routeUnavailable.map(function(x) { return x.id; }),
    categoriesByStore: categoriesByStore,
    source: 'product-category-catalog',
    intent: detectIntent(raw)
  };
}

/* ---------- Helpers ---------- */
function isGeneral(id, s) { return !!(s && s.storeType === 'general'); }
function isPortal(id, s) { return !!(s && s.storeType === 'portal'); }

function availableDomains(catalog) {
  return DOMAIN_ORDER.filter(function(domain) {
    return Object.keys(catalog).some(function(id) {
      var s = catalog[id] || {};
      return !isGeneral(id, s) && !isPortal(id, s) &&
             Array.isArray(s.domains) && s.domains.indexOf(domain) >= 0;
    });
  });
}

function featuredFor(domain, catalog) {
  var seen = {}, out = [], featured = FEATURED[domain] || [];
  function add(id, tagline) {
    var s = catalog[id];
    if (!s || isGeneral(id, s) || isPortal(id, s) || seen[id]) return;
    if (!Array.isArray(s.domains) || s.domains.indexOf(domain) < 0) return;
    seen[id] = true;
    out.push({
      id: id,
      name: s.name || id,
      homepage: s.homepage || '',
      tagline: tagline || ((s.specialties || []).slice(0, 2).join('، ')) ||
               ((s.products || []).slice(0, 3).join('، ')) ||
               'برای بررسی گزینه‌های مرتبط',
      domain: domain
    });
  }
  featured.forEach(function(entry) { add(entry[0], entry[1]); });
  Object.keys(catalog).forEach(function(id) {
    var s = catalog[id] || {};
    if ((s.domains || []).indexOf(domain) >= 0) add(id, '');
  });
  return out;
}

/* ---------- Public API ---------- */
window.DigiYarHooshyarEngine = {
  version: VERSION,
  resolveSearchContext: resolveSearchContext,
  detectIntent: detectIntent,
  getDomainTitle: getDomainTitle,
  getDomainMeta: getDomainMeta,
  availableDomains: function() { return availableDomains(getCatalog()); },
  featuredFor: featuredFor,
  getState: function() { return Object.assign({}, state); }
};

})();
