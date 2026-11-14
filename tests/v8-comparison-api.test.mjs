import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/comparison/products.js';
function response(){return{headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;},end(){this.ended=true;return this;}};}
test('gateway reports no configured partner feeds without inventing sources',async()=>{
 const keys=Object.keys(process.env).filter(k=>k.startsWith('DIGIYAR_COMPARISON_')),saved={};keys.forEach(k=>{saved[k]=process.env[k];delete process.env[k];});
 try{const res=response();await handler({method:'POST',headers:{origin:'https://petromosi-pixel.github.io'},body:{query:'گوشی سامسونگ'},socket:{remoteAddress:'test-no-config'}},res);assert.equal(res.statusCode,200);assert.equal(res.body.products.length,0);assert.equal(res.body.comparisonReady,false);assert.ok(res.body.sources.every(x=>!x.configured));}
 finally{Object.keys(process.env).filter(k=>k.startsWith('DIGIYAR_COMPARISON_')).forEach(k=>delete process.env[k]);Object.assign(process.env,saved);}
});
test('gateway rejects untrusted origins and unsupported methods',async()=>{
 const denied=response();await handler({method:'POST',headers:{origin:'https://evil.example'},body:{query:'x'}},denied);assert.equal(denied.statusCode,403);
 const method=response();await handler({method:'GET',headers:{},body:{}},method);assert.equal(method.statusCode,405);
});
test('feed normalizer rejects search links, wrong domains, stale data and zero prices',()=>{
 const {normalizeProduct}=handler._test,now=Date.now(),valid={id:'123',name:'گوشی تست',price:10000000,currency:'IRT',availability:'in_stock',observedAt:new Date(now).toISOString(),productUrl:'https://www.digikala.com/product/dkp-123/'};
 assert.ok(normalizeProduct(valid,'digikala',now));
 for(const bad of [{...valid,productUrl:'https://www.digikala.com/search/?q=phone'},{...valid,productUrl:'https://evil.example/product/1'},{...valid,price:0},{...valid,observedAt:'2020-01-01T00:00:00Z'},{...valid,availability:'maybe'}])assert.equal(normalizeProduct(bad,'digikala',now),null);
});
