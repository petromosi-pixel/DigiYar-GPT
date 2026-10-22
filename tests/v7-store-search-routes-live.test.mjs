import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../js/store-business-domains.js');
await import('../js/v7-store-search-url.js');

const kb = window.DigiYarStoreBusinessDomains;
const resolver = window.DigiYarStoreSearchUrl;
assert.ok(kb?.catalog && resolver?.resolveRoute, 'Current catalog and resolver must load');

const cases = [
  { name:'air purifier', id:'digikala', query:'تصفیه هوای اتاق خواب', host:'www.digikala.com', path:'/search/' },
  { name:'air purifier', id:'torob', query:'تصفیه هوای اتاق خواب', host:'torob.com', path:'/search/' },
  { name:'air purifier', id:'basalam', query:'تصفیه هوای اتاق خواب', host:'basalam.com', path:'/s' },
  { name:'train tickets', id:'ghasedak24', query:'بلیط قطار تهران مشهد', host:'ghasedak24.com', path:'/train-ticket' },
  { name:'train tickets', id:'mrbilit', query:'بلیط قطار تهران مشهد', host:'mrbilit.com', path:'/train-ticket' },
  { name:'train tickets', id:'alibaba', query:'بلیط قطار تهران مشهد', host:'www.alibaba.ir', path:'/train-ticket' },
  { name:'office bag', id:'modiseh', query:'کیف اداری برای محل کارم می‌خوام', host:'www.modiseh.com', path:'/catalogsearch/result/' },
  { name:'sunscreen', id:'solokala', query:'ضد آفتاب برای پوست خشک', host:'solokala.com', path:'/' },
  { name:'mobile accessories', id:'janebi', query:'لوازم جانبی موبایل', host:'janebi.com', path:'/search' },
  { name:'mobile accessories', id:'technolife', query:'لوازم جانبی موبایل', host:'www.technolife.com', path:'/product/list/search' }
];

const restrictedStatuses = new Set([403, 429, 503]);
const results = [];
for (const item of cases) {
  const route = resolver.resolveRoute(item.id, item.query);
  assert.ok(route, `${item.name}/${item.id}: route must resolve`);
  assert.equal(route.kind, 'search', `${item.name}/${item.id}: expected a direct search route`);
  const url = new URL(route.url);
  assert.equal(url.hostname, item.host, `${item.name}/${item.id}: destination host`);
  assert.ok(url.pathname.startsWith(item.path), `${item.name}/${item.id}: destination path ${url.pathname}`);
  if (!['ghasedak24','mrbilit','alibaba'].includes(item.id)) {
    const queryText = [...url.searchParams.values()].join(' ');
    assert.ok(queryText.length > 1, `${item.name}/${item.id}: product-search query must be present`);
  }
  try {
    const response = await fetch(route.url, {
      redirect:'follow',
      signal:AbortSignal.timeout(12000),
      headers:{'user-agent':'Mozilla/5.0 DigiYar-route-smoke'}
    });
    if (response.body?.cancel) await response.body.cancel().catch(() => {});
    assert.ok(![404,410].includes(response.status),
      `${item.name}/${item.id}: dead destination HTTP ${response.status} at ${response.url}`);
    results.push({ ...item, status:response.status, finalUrl:response.url,
      note:restrictedStatuses.has(response.status) ? 'blocked by destination' : 'reachable' });
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') throw error;
    results.push({ ...item, status:'NETWORK_UNVERIFIED', note:String(error).slice(0,100) });
  }
}

const fallback = resolver.resolveRoute('dayan', 'کیف اداری');
assert.equal(fallback?.kind, 'homepage_fallback',
  'Dayan must remain explicitly marked as a homepage fallback until a product-search URL is verified');
assert.equal(new URL(fallback.url).hostname, 'dayanshop.com');

console.log('V7 live route smoke test');
for (const result of results) {
  console.log(`${result.status}\t${result.name}\t${result.id}\t${result.finalUrl || result.note}`);
}
console.log(`Checked ${results.length} direct routes; Dayan is explicitly a homepage fallback.`);
