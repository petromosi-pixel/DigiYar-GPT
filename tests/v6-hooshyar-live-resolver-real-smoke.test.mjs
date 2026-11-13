import assert from 'node:assert/strict';
import Resolver from '../js/v6-hooshyar-live-resolver.js';

const urls = [
  'https://torobshop.com/products/%DA%AF%D9%88%D8%B4%DB%8C-%D9%87%D9%88%D8%B4%D9%85%D9%86%D8%AF-vivo-X300-FE-5G-%DB%B1%DB%B2-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA-%D8%B1%D9%85-%DB%B5%DB%B1%DB%B2-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA-%D8%AD%D8%A7%D9%81%D8%B8%D9%87-%D8%AF%D8%A7%D8%AE%D9%84%DB%8C-%D8%AF%D9%88%D8%B1%D8%A8%DB%8C%D9%86-%D8%B3%D9%88%D9%BE%D8%B1-%D8%AA%D9%84%D9%87-%D9%81%D9%88%D8%AA%D9%88-ZEISS-%D9%BE%D8%B1%D8%AF%D8%A7%D8%B2%D9%86%D8%AF%D9%87-%D8%A7%D8%B3%D9%86%D9%BE%D8%AF%D8%B1%D8%A7%DA%AF%D9%88%D9%86-%DB%B8-%D9%86%D8%B3%D9%84-%DB%B5-%D8%B7%D8%B1%D8%A7%D8%AD%DB%8C-%D8%A8%D8%A7%D8%B1%DB%8C%DA%A9-%D8%A8%D8%A7%D8%AA%D8%B1%DB%8C-%DB%B6%DB%B5%DB%B0%DB%B0-%D9%85%DB%8C%D9%84%DB%8C-%D8%A2%D9%85%D9%BE%D8%B1-%D8%B3%D8%A7%D8%B9%D8%AA%DB%8C-%DA%AF%D9%88%D8%A7%D9%87%DB%8C%D9%86%D8%A7%D9%85%D9%87-IP68-%D9%88-IP69-%D8%A7%D9%86%D8%AF%D8%B1%D9%88%DB%8C%D8%AF-%DB%B1%DB%B6',
  'https://torobshop.com/products/MEDION-Beast-18-QHD-Core-Ultra-9-275HX-9-9-%D9%86%D9%88%D8%AA-%D8%A8%D9%88%DA%A9-Core-Ultra-9-30039675'
];

for (const url of urls) {
  assert.equal(Resolver.directProductUrl(url), true, `expected direct product URL: ${url}`);
  const result = await Resolver.resolve(url);
  console.log(JSON.stringify({
    url,
    ok: result.ok,
    status: result.ok ? 'resolved' : result.error,
    priceToman: result.priceToman || 0,
    availability: result.availability || 'unknown'
  }));
  assert.equal(result.ok, true, `live resolver failed: ${result.error || 'unknown_error'}`);
  assert.ok(result.priceToman > 0, 'live price must be positive');
  assert.ok(['in_stock', 'out_of_stock', 'unknown'].includes(result.availability));
}

console.log('V6 Hooshyar Live Resolver REAL SMOKE: PASS');
