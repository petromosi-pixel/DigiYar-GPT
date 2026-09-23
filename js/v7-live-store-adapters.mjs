/* DigiYar V7 — live store-page adapters for relevant simulator tabs.
   Public HTML only. No store API dependency. */
const CATALOG = {
  torob: {
    name: 'ترب',
    search: q => 'https://torob.com/search/?query=' + encodeURIComponent(q),
    home: 'https://torob.com/'
  },
  basalam: {
    name: 'باسلام',
    search: q => 'https://basalam.com/search?q=' + encodeURIComponent(q),
    home: 'https://basalam.com/'
  },
  esam: {
    name: 'ایسام',
    search: q => 'https://esam.ir/search/?q=' + encodeURIComponent(q),
    home: 'https://esam.ir/'
  }
};

const clean = v => String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const norm = v => clean(v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).toLowerCase();
const priceToman = (v, currency='IRT') => {
  const s = String(v ?? '').replace(/[,٬\s]/g,'');
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return /irr|rial|ریال/i.test(String(currency)) ? Math.round(n/10) : Math.round(n);
};
function abs(href, base) { try { return new URL(href, base).href.split('#')[0]; } catch { return ''; } }
function jsonLd(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim());
      const walk = x => {
        if (!x) return;
        if (Array.isArray(x)) return x.forEach(walk);
        if (typeof x !== 'object') return;
        const type = Array.isArray(x['@type']) ? x['@type'].join(' ') : String(x['@type'] || '');
        if (/product/i.test(type) && (x.name || x.url || x.offers)) out.push(x);
        if (x['@graph']) walk(x['@graph']);
        if (x.itemListElement) walk(x.itemListElement);
      };
      walk(data);
    } catch {}
  }
  return out;
}
function meta(html, pattern) { const m = html.match(pattern); return m ? clean(m[1]) : ''; }

function extractProducts(store, html, pageUrl, query) {
  const out = [];
  const seen = new Set();
  const add = (item) => {
    const url = abs(item.productUrl || item.url || '', pageUrl);
    const name = clean(item.name || item.productName || '');
    if (!url || !name || seen.has(url)) return;
    if (!new URL(url).hostname.endsWith(store === 'torob' ? 'torob.com' : store === 'basalam' ? 'basalam.com' : 'esam.ir')) return;
    const price = priceToman(item.price ?? item.offers?.price ?? item.lowPrice ?? 0, item.currency || item.offers?.priceCurrency || 'IRT');
    seen.add(url);
    out.push({
      productId: url,
      name,
      priceToman: price,
      priceUnit: 'toman',
      availability: item.availability || item.offers?.availability || 'unknown',
      productUrl: url,
      storeId: store,
      storeName: CATALOG[store].name,
      source: 'v7-live-store-page',
      query,
      observedAt: new Date().toISOString()
    });
  };
  for (const x of jsonLd(html)) {
    const offers = Array.isArray(x.offers) ? x.offers[0] : (x.offers || {});
    add({...x, price: offers.price ?? x.price, currency: offers.priceCurrency ?? x.priceCurrency, availability: offers.availability});
  }
  // Generic anchor extraction for pages where product cards are not JSON-LD.
  const ar = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,1800}?)<\/a>/gi;
  let m;
  while ((m = ar.exec(html)) && out.length < 20) {
    const url = abs(m[1], pageUrl);
    if (!url) continue;
    const allowed = store === 'torob' ? /torob\.com\/(?:product|products)\//i.test(url)
      : store === 'basalam' ? /basalam\.com\/[^/?#]+(?:\/products?|\/product\/|$)/i.test(url)
      : /esam\.ir\/(?:item|auction|product|shop)\//i.test(url);
    if (!allowed) continue;
    const text = clean(m[2]);
    const name = text.replace(/(?:تومان|ریال|IRT|IRR).*/i,'').slice(0,220).trim();
    const pm = text.match(/([0-9۰-۹][0-9۰-۹,٬\. ]{2,})\s*(تومان|ریال|IRT|IRR)/i);
    add({url,name,price:pm ? pm[1] : 0,currency:pm ? pm[2] : 'IRT'});
  }
  return out;
}

export async function searchLiveStore(store, query) {
  const cfg = CATALOG[store];
  if (!cfg) return {ok:false,error:'unsupported_store',store,query,results:[]};
  const url = cfg.search(query);
  try {
    const response = await fetch(url, {
      redirect:'follow',
      headers:{
        Accept:'text/html,application/xhtml+xml',
        'Accept-Language':'fa-IR,fa;q=0.9,en;q=0.8',
        'User-Agent':'Mozilla/5.0 (compatible; DigiYar-V7-LiveStore/1.0)'
      },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return {ok:false,error:'http_'+response.status,store,query,results:[],searchUrl:url};
    const html = await response.text();
    const results = extractProducts(store, html, url, query).slice(0,12);
    return {ok:results.length>0,error:results.length?'':'no_products_found',store,storeName:cfg.name,query,searchUrl:url,total:results.length,results};
  } catch (e) {
    return {ok:false,error:String(e?.message || e),store,query,results:[],searchUrl:url};
  }
}
export const LIVE_STORE_IDS = Object.keys(CATALOG);
