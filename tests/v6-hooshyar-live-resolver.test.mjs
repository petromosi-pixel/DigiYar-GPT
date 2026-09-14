import assert from 'node:assert/strict';
import Resolver from '../js/v6-hooshyar-live-resolver.js';

assert.equal(Resolver.directProductUrl('https://example.com/search?q=phone'), false);
assert.equal(Resolver.directProductUrl('https://example.com/category/mobile'), false);
assert.equal(Resolver.directProductUrl('https://example.com/product/samsung-a55'), true);
assert.equal(Resolver.normalize({price:250000000,currency:'IRR',availability:'InStock'},'https://example.com/product/a').priceToman,25000000);

const html='<!doctype html><html><head><script type="application/ld+json">{"@type":"Product","offers":{"price":"18990000","priceCurrency":"IRR","availability":"https://schema.org/InStock"}}</script></head></html>';
const resolved=await Resolver.resolve('https://example.com/product/x',{fetch:async()=>({ok:true,status:200,text:async()=>html})});
assert.equal(resolved.ok,true);
assert.equal(resolved.priceToman,1899000);
assert.equal(resolved.availability,'in_stock');

const rejected=await Resolver.resolve('https://example.com/search?q=x',{fetch:async()=>{throw new Error('must not fetch search URL')}});
assert.equal(rejected.ok,false);
assert.equal(rejected.error,'not_direct_product_url');
console.log('V6 Hooshyar Live Resolver: PASS');
