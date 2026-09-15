#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'js', 'live-store-product-index-v6.js');
const REPORT = path.join(ROOT, 'reports', 'v6-live-store-ingestion.json');
const NOW = new Date().toISOString();
const MAX_PAGES_PER_STORE = 60;
const MAX_PRODUCTS_TOTAL = 50;
const MIN_PRODUCTS_SUCCESS = 20;
const TARGET = /(?:شیائومی|xiaomi|mi\b|redmi|poco)/i;
const MOBILE = /(?:گوشی|موبایل|smartphone|mobile|phone)/i;

const STORES = [
  {
    id: 'technolife',
    name: 'تکنولایف',
    seeds: [
      'https://www.technolife.ir/product-116578/%DA%AF%D9%88%D8%B4%DB%8C-%D9%85%D9%88%D8%A8%D8%A7%DB%8C%D9%84-%D8%B4%DB%8C%D8%A7%D8%A6%D9%88%D9%85%DB%8C-%D9%85%D8%AF%D9%84-poco-c71-%D8%B8%D8%B1%D9%81%DB%8C%D8%AA-128-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA-%D8%B1%D9%85-4-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA'
    ],
    productLink: /\/product-\d+\//i
  },
  {
    id: 'torobshop',
    name: 'ترب شاپ',
    seeds: [
      'https://torobshop.com/products/category-products/%DA%AF%D9%88%D8%B4%DB%8C-%D9%85%D9%88%D8%A8%D8%A7%DB%8C%D9%84'
    ],
    productLink: /\/products\/(?!category)/i
  }
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function absUrl(href, base) {
  try { return new URL(href, base).href.split('#')[0]; } catch { return ''; }
}
function sameHost(url, host) {
  try { return new URL(url).hostname.replace(/^www\./, '') === host.replace(/^www\./, ''); } catch { return false; }
}
function cleanText(v) {
  return String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}
function parseJsonLd(html) {
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
        const types = Array.isArray(x['@type']) ? x['@type'] : [x['@type']];
        if (types.some(t => String(t).toLowerCase() === 'product')) out.push(x);
        if (x['@graph']) walk(x['@graph']);
      };
      walk(data);
    } catch {}
  }
  return out;
}
function firstText(html, re) {
  const m = html.match(re);
  return m ? cleanText(m[1]) : '';
}
function extractLinks(html, base, store) {
  const links = new Set();
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = absUrl(m[1], base);
    if (!url || !sameHost(url, new URL(base).hostname)) continue;
    if (store.productLink.test(url)) links.add(url);
    if (/\/products\/category-products\//i.test(url)) links.add(url);
  }
  return [...links];
}
function extractProduct(html, url, store) {
  const ld = parseJsonLd(html)[0] || {};
  const name = cleanText(ld.name) || firstText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || firstText(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!name || !MOBILE.test(name) || !TARGET.test(name)) return null;
  const brandValue = typeof ld.brand === 'string' ? ld.brand : ld.brand?.name;
  const props = [];
  const rawProps = Array.isArray(ld.additionalProperty) ? ld.additionalProperty : (ld.additionalProperty ? [ld.additionalProperty] : []);
  for (const p of rawProps) {
    const k = cleanText(p?.name || p?.propertyID);
    const v = cleanText(p?.value);
    if (k && v) props.push(`${k}: ${v}`);
  }
  const category = cleanText(ld.category) || 'گوشی موبایل';
  const productUrl = cleanText(ld.url) || url;
  return {
    id: `live-${store.id}-${Buffer.from(productUrl).toString('hex').slice(0, 24)}`,
    productId: productUrl,
    name,
    brand: cleanText(brandValue),
    model: name,
    category: 'mobile',
    subcategory: category || 'گوشی موبایل',
    price: 0,
    currency: '',
    availability: 'unknown',
    productUrl,
    image: '',
    sourceId: `live-${store.id}`,
    sourceUrl: url,
    source: `live-store-adapter:v1:${store.id}`,
    specs: props.slice(0, 12),
    observedAt: NOW
  };
}
async function fetchPage(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'DigiYar-LiveStoreAdapter/1.0 (+public-product-index)',
      'accept': 'text/html,application/xhtml+xml'
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}
async function crawlStore(store) {
  const queue = [...store.seeds];
  const seen = new Set();
  const products = new Map();
  const errors = [];
  let pages = 0;
  while (queue.length && pages < MAX_PAGES_PER_STORE && products.size < MAX_PRODUCTS_TOTAL) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    try {
      const html = await fetchPage(url);
      pages++;
      const product = extractProduct(html, url, store);
      if (product) products.set(product.productUrl, product);
      for (const link of extractLinks(html, url, store)) {
        if (!seen.has(link) && queue.length < 250) queue.push(link);
      }
    } catch (error) {
      errors.push({ url, error: String(error?.message || error) });
    }
    await sleep(180);
  }
  return { store: store.id, name: store.name, pages, products: [...products.values()], errors };
}

const results = [];
for (const store of STORES) {
  results.push(await crawlStore(store));
}
const products = results.flatMap(x => x.products).slice(0, MAX_PRODUCTS_TOTAL);
const report = {
  version: 'v6-live-store-adapter-1.0',
  observedAt: NOW,
  query: 'کالای دیجیتال → موبایل → شیائومی',
  policy: 'public-product-pages-only; no marketplace/API calls; no price/image ingestion',
  threshold: { minProducts: MIN_PRODUCTS_SUCCESS, targetMax: MAX_PRODUCTS_TOTAL },
  totalProducts: products.length,
  stores: results.map(x => ({ id: x.store, name: x.name, pages: x.pages, products: x.products.length, errors: x.errors.slice(0, 10) })),
  passed: products.length >= MIN_PRODUCTS_SUCCESS
};
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.mkdir(path.dirname(REPORT), { recursive: true });
const js = `/* DigiYar V6 — generated live public-store Product Index. No live price/image. */\nexport const LIVE_STORE_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
await fs.writeFile(OUT, js + '\n', 'utf8');
await fs.writeFile(REPORT, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 2;
