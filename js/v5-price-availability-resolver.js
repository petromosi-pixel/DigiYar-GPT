/* DigiYar V6 — Hardened Live Product Price / Availability Resolver */
const ALLOWED_HOSTS = new Set(['torobshop.com', 'www.torobshop.com', 'digikala.com', 'www.digikala.com', 'snappshop.ir', 'www.snappshop.ir']);

const digits = value => String(value ?? '')
  .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const clean = value => digits(String(value ?? ''))
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&#x27;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

function absolute(base, value) {
  try { return new URL(value, base).href; } catch { return ''; }
}

function normalizeCurrency(value) {
  const c = clean(value).toLowerCase();
  if (/^irt$|تومان|تومن/.test(c)) return 'IRT';
  if (/^irr$|ریال/.test(c)) return 'IRR';
  return '';
}

function numeric(value) {
  const n = Number(digits(String(value ?? '')).replace(/[٬,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toToman(value, currency) {
  const n = numeric(value);
  if (!n) return 0;
  return normalizeCurrency(currency) === 'IRR' ? Math.round(n / 10) : Math.round(n);
}

function availabilityFrom(value) {
  const a = clean(value).toLowerCase();
  if (!a) return 'unknown';
  if (/outofstock|out-of-stock|out of stock|unavailable|ناموجود|تمام شده|اتمام موجودی|در انبار موجود نمی باشد|sold out/.test(a)) return 'out_of_stock';
  if (/instock|in-stock|in stock|available|موجود|افزودن به سبد|خرید/.test(a)) return 'in_stock';
  return 'unknown';
}

function parseJsonLd(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const raw = m[1].trim();
      if (!raw) continue;
      out.push(JSON.parse(raw.replace(/^\uFEFF/, '')));
    } catch {}
  }
  return out;
}

function offerCandidate(node, pageUrl) {
  if (!node || typeof node !== 'object') return null;
  const offers = Array.isArray(node.offers) ? node.offers : [node.offers || node.offer || {}];
  for (const offer of offers) {
    if (!offer || typeof offer !== 'object') continue;
    const price = numeric(offer.price ?? offer.lowPrice ?? offer.amount);
    if (!price) continue;
    const currency = normalizeCurrency(offer.priceCurrency || node.priceCurrency || offer.currency || node.currency || '');
    const availability = availabilityFrom(offer.availability || node.availability || offer.stockStatus || node.stockStatus);
    return {
      name: clean(node.name || node.title || ''),
      productUrl: absolute(pageUrl, offer.url || node.url || pageUrl),
      price,
      priceToman: toToman(price, currency || 'IRT'),
      currency: currency || 'IRT',
      availability,
      extraction: 'json-ld offers'
    };
  }
  return null;
}

function walkJsonLd(value, pageUrl, out) {
  if (!value) return;
  if (Array.isArray(value)) { value.forEach(v => walkJsonLd(v, pageUrl, out)); return; }
  if (typeof value !== 'object') return;
  const candidate = offerCandidate(value, pageUrl);
  if (candidate) out.push(candidate);
  if (value['@graph']) walkJsonLd(value['@graph'], pageUrl, out);
  for (const [key, child] of Object.entries(value)) {
    if (key !== '@graph' && child && typeof child === 'object') walkJsonLd(child, pageUrl, out);
  }
}

function fromJsonLd(html, pageUrl) {
  const candidates = [];
  parseJsonLd(html).forEach(x => walkJsonLd(x, pageUrl, candidates));
  return candidates.find(x => x.priceToman > 0) || null;
}

function metaValue(html, name, attrNames = ['property', 'name', 'itemprop']) {
  const wanted = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const attr of attrNames) {
    const re = new RegExp(`<meta\\b(?=[^>]*\\b${attr}=["']${wanted}["'])[^>]*>`, 'i');
    const tag = html.match(re)?.[0] || '';
    if (!tag) continue;
    const content = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1];
    if (content) return clean(content);
  }
  return '';
}

function fromMeta(html, pageUrl) {
  const price = metaValue(html, 'product:price:amount') || metaValue(html, 'price');
  if (!price) return null;
  const currency = normalizeCurrency(metaValue(html, 'product:price:currency') || metaValue(html, 'priceCurrency'));
  const availability = availabilityFrom(metaValue(html, 'product:availability') || metaValue(html, 'availability'));
  const n = numeric(price);
  if (!n) return null;
  return {
    name: metaValue(html, 'og:title'),
    productUrl: pageUrl,
    price: n,
    priceToman: toToman(n, currency || 'IRT'),
    currency: currency || 'IRT',
    availability,
    extraction: 'meta product price'
  };
}

function fromVisibleText(html, pageUrl) {
  const text = clean(html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
  const matches = [];
  const re = /([\d۰-۹][\d۰-۹٬,\s]{2,})\s*(تومان|تومن|ریال|IRT|IRR)\b/gi;
  let m;
  while ((m = re.exec(text))) {
    const n = numeric(m[1]);
    if (n) matches.push({ price: n, currency: normalizeCurrency(m[2]) });
  }
  if (!matches.length) return null;
  const selected = matches.find(x => x.currency === 'IRT') || matches[0];
  return {
    name: '',
    productUrl: pageUrl,
    price: selected.price,
    priceToman: toToman(selected.price, selected.currency),
    currency: selected.currency,
    availability: availabilityFrom(text),
    extraction: 'visible price text'
  };
}

export async function resolveProduct(url) {
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('Invalid product URL'); }
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) throw new Error('Unsupported product host');
  const response = await fetch(parsed.href, {
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; DigiYar-V6-Resolver/1.0)'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const result = fromJsonLd(html, parsed.href) || fromMeta(html, parsed.href) || fromVisibleText(html, parsed.href);
  if (!result) return { success: true, resolved: false, productUrl: parsed.href, price: 0, priceToman: 0, currency: '', availability: 'unknown', extraction: 'none' };
  return { success: true, resolved: result.priceToman > 0, ...result };
}
