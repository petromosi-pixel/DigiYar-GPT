/* DigiYar V6 Worker — redeploy hardened live resolver contract (2026-09-14) */
import { ingestCategory } from './js/data-ingestion-v5.1.js';
import { PRODUCT_INDEX, INDEX_META } from './js/product-index-generated-v5.1.js';
import { resolveProduct } from './js/v5-price-availability-resolver.js';
import { normalizeCurrency, toToman } from './js/v5-price-contract.mjs';
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
const STORES={digikala:{id:'digikala',name:'دیجی‌کالا',affiliate:'https://aflo.ir/TrvNHEN8'},snappshop:{id:'snappshop',name:'اسنپ‌شاپ',affiliate:'https://aflo.ir/YPN05dL7'}};
const norm=s=>String(s??'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[٬,]/g,'').replace(/\s+/g,' ').trim();
const STOP=new Set(['برای','با','و','در','از','یک','این','آن','می','به','تومان','تومن','میلیون','میلیارد','هزار','تا','یه','دنبال','میگردم','می‌گردم','میخوام','می‌خوام','میخواهم','می‌خواهم','لطفا','لطفاً','میشه','می‌شود','هستم','هست','رو','را']);
const money=(n,u='')=>{const x=Number(n);if(!Number.isFinite(x))return 0;return !u||u==='تومان'||u==='تومن'?x:u==='هزار'?x*1e3:u==='میلیون'?x*1e6:u==='میلیارد'?x*1e9:x};
const PRODUCT_TYPES={phone:['گوشی','موبایل','موبايل'],laptop:['لپ','تاپ','لپتاپ']};
function parseQ(q=''){const n=norm(q),t=n.split(' ').filter(Boolean),brands=['سامسونگ','شیائومی','اپل','آیفون','هواوی','آنر','لنوو','ایسوس','اچ‌پی','hp','dell','acer','msi','مایکروسافت'].filter(b=>n.includes(b)),range=n.match(/(\d+(?:\.\d+)?)\s*(?:تا|-|–)\s*(\d+(?:\.\d+)?)\s*(میلیون|میلیارد|هزار|تومان|تومن)?/i),max=n.match(/(?:زیر|کمتر از|حداکثر|تا)\s*(\d+(?:\.\d+)?)\s*(میلیون|میلیارد|هزار|تومان|تومن)?/i),min=n.match(/(?:بالای|بیشتر از|حداقل)\s*(\d+(?:\.\d+)?)\s*(میلیون|میلیارد|هزار|تومان|تومن)?/i);const price=range?{minPrice:money(range[1],range[3]),maxPrice:money(range[2],range[3])}:{minPrice:min?money(min[1],min[2]):null,maxPrice:max?money(max[1],max[2]):null};return{normalized:n,tokens:t,brands,price:{...price,currency:'TOMAN'},keywords:t.filter(x=>!STOP.has(x)&&!/^[0-9.]+$/.test(x))}};
function valid(p){if(!p?.productId||!p?.productUrl)return false;try{return/^https?:$/.test(new URL(p.productUrl).protocol)&&!/\/search(?:\/|\?|$)/i.test(new URL(p.productUrl).pathname)}catch{return false}}
function affiliate(store,url){const b=STORES[store]?.affiliate;return b&&url?`${b}?p=${encodeURIComponent(url)}`:''}
function priceToman(o){if(Number(o?.priceToman)>0)return Math.round(Number(o.priceToman));return toToman(o?.price,normalizeCurrency(o?.currency||'IRT'))}
function searchableText(o){return norm([o.name,o.productName,o.brand,o.model,o.category,o.subcategory].filter(Boolean).join(' '))}
function relevant(o,z){const text=searchableText(o),name=norm(o.name||'');if(z.brands.length&&!z.brands.some(b=>text.includes(norm(b))))return false;const hasPhone=z.keywords.some(w=>PRODUCT_TYPES.phone.includes(w)),hasLaptop=z.keywords.some(w=>PRODUCT_TYPES.laptop.includes(w));if(hasPhone&&!/گوشی|موبایل|موبايل/.test(name))return false;if(hasLaptop&&!(/لپ\s*تاپ|لپتاپ/.test(name)||norm(o.category)==='laptop-computer'||norm(o.subcategory)==='لپ تاپ'))return false;const keywords=z.keywords.filter(w=>String(w||'').length>=2);if(keywords.length){const matched=keywords.filter(w=>text.includes(norm(w))).length;const required=keywords.length>=3?2:1;if(matched<required)return false}return true}
function rank(items,q){const z=parseQ(q);return items.filter(valid).filter(o=>{const p=priceToman(o);return(z.price.minPrice==null||p>=z.price.minPrice)&&(z.price.maxPrice==null||p<=z.price.maxPrice)&&(z.price.minPrice==null&&z.price.maxPrice==null||p>0)}).filter(o=>relevant(o,z)).map(o=>{const n=searchableText(o),score=z.keywords.reduce((s,w)=>s+(n.includes(norm(w))?12:0),0)+(z.brands.some(b=>n.includes(norm(b)))?40:0)+(o.availability==='in_stock'?8:0)+(priceToman(o)>0?3:0)+(o.productUrl?10:0);return{...o,priceToman:priceToman(o),priceUnit:'toman',score}}).sort((a,b)=>b.score-a.score||(a.priceToman||Infinity)-(b.priceToman||Infinity))}
function dedupe(items=[]){const seen=new Set();return items.filter(o=>{const key=String(o.productUrl||o.productId||o.id||'').trim();if(!key||seen.has(key))return false;seen.add(key);return true})}
function localSearch(q){const results=rank(dedupe(PRODUCT_INDEX.map(p=>({...p,productId:p.productId||p.id,productName:p.name,storeId:p.storeId||p.sourceId,storeName:p.storeName||p.sourceId,affiliateUrl:p.affiliateUrl||''}))),q);return{results,source:'local-product-index',indexSize:PRODUCT_INDEX.length}}
async function req(url,accept){const r=await fetch(url,{redirect:'follow',headers:{Accept:accept,'Accept-Language':'fa-IR,fa;q=0.9,en;q=0.8','User-Agent':'Mozilla/5.0 (compatible; DigiYar/5.1)'}});if(!r.ok)throw Error(`HTTP ${r.status}`);return r}
function htmlProducts(store,html,pageUrl){
const out=[],seen=new Set();
const add=(o)=>{
 const rawUrl=String(o.productUrl||o.url||'').trim(),name=norm(o.name||o.productName||o.title_fa||o.title_en||'');
 if(!rawUrl||!name)return;
 let u;try{u=new URL(rawUrl,pageUrl).href.split('#')[0]}catch{return}
 if(seen.has(u))return;
 if(store==='digikala'&&!/digikala\.com\/product\/dkp-/i.test(u))return;
 if(store==='snappshop'&&!/snappshop\.ir\//i.test(u))return;
 const p=Number(o.priceToman)>0?Math.round(Number(o.priceToman)):toToman(o.price,o.currency||'IRT');
 seen.add(u);
 out.push({productId:String(o.productId||o.sku||o.id||u),name:o.name||o.productName||o.title_fa||o.title_en||'',price:Number(o.price)||0,currency:o.currency||'IRT',priceToman:p,availability:o.availability||o.status||'unknown',productUrl:u,affiliateUrl:affiliate(store,u),storeId:store,storeName:STORES[store].name,source:store+'-live-html'})
};
const walk=(x)=>{
 if(!x||out.length>=30)return;
 if(Array.isArray(x)){x.forEach(walk);return}
 if(typeof x!=='object')return;
 const t=String(x['@type']||'').toLowerCase();
 const offers=Array.isArray(x.offers)?x.offers[0]:(x.offers||{});
 if(t.includes('product')||x.productUrl||x.productID||x.sku||x.title_fa){
   const price=offers.price??x.price??x.selling_price??x.selling_price_toman??x.selling_price_rial;
   const currency=offers.priceCurrency||x.priceCurrency||x.currency||((x.selling_price_rial!=null)?'IRR':'IRT');
   add({productId:x.sku||x.productID||x.productId||x.id,name:x.name||x.title_fa||x.title_en,productUrl:x.url||x.productUrl||x.link,price,currency,availability:offers.availability||x.availability})
 }
 Object.values(x).forEach(v=>{if(v&&typeof v==='object')walk(v)})
};
const scriptRe=/<script[^>]*>([\s\S]*?)<\/script>/gi;let m;
while((m=scriptRe.exec(html))){
 const raw=String(m[1]||'').trim();
 if(!raw||raw.length>2000000)continue;
 if(/^(?:\{|"@context"|\[)/.test(raw)){
   try{walk(JSON.parse(raw))}catch{}
 }
 if(store==='digikala'&&raw.includes('self.__next_f.push')){
   let flight='';
   try{
     const p=raw.indexOf('('),e=raw.lastIndexOf(')');
     if(p>0&&e>p){
       const a=JSON.parse(raw.slice(p+1,e));
       if(Array.isArray(a)&&typeof a[1]==='string')flight=a[1];
     }
   }catch{}
   if(flight){
     let decoded=flight;
     try{decoded=JSON.parse('"'+flight.replace(/\\/g,'\\\\').replace(/"/g,'\\\"')+'"')}catch{}
     decoded=decoded.replace(/\\\"/g,'"').replace(/\\\\/g,'\\');
     const titleRe=/"title_fa"\s*:\s*"([^"]{2,300})"/g;
     let tm;
     while((tm=titleRe.exec(decoded))&&out.length<30){
       const start=Math.max(0,tm.index-12000),end=Math.min(decoded.length,tm.index+12000),chunk=decoded.slice(start,end);
       const urlMatch=chunk.match(/dkp-([0-9]+)/i);
       const idMatch=chunk.match(/"(?:productId|productID|product_id|id)"\s*:\s*"?([0-9]+)"?/);
       const id=urlMatch?.[1]||idMatch?.[1]||'';
       if(!id)continue;
       const prices=[...chunk.matchAll(/"(?:selling_price|selling_price_rial|price)"\s*:\s*([0-9]+)/g)].map(x=>x[1]);
       const price=prices.length?prices[prices.length-1]:0;
       add({productId:id,name:tm[1],productUrl:'https://www.digikala.com/product/dkp-'+id+'/',price,currency:'IRR'});
     }
     if(out.length===0){
       const urls=[...decoded.matchAll(/dkp-([0-9]+)/gi)].map(x=>x[1]);
       const unique=[...new Set(urls)];
       unique.slice(0,30).forEach((id,i)=>{
         const pos=decoded.indexOf('dkp-'+id);
         const chunk=decoded.slice(Math.max(0,pos-10000),Math.min(decoded.length,pos+10000));
         const tm=chunk.match(/"title_fa"\s*:\s*"([^"]{2,300})"/);
         const prices=[...chunk.matchAll(/"(?:selling_price|selling_price_rial|price)"\s*:\s*([0-9]+)/g)].map(x=>x[1]);
         if(tm)add({productId:id,name:tm[1],productUrl:'https://www.digikala.com/product/dkp-'+id+'/',price:prices.length?prices[prices.length-1]:0,currency:'IRR'});
       });
     }
   }
 }
const ar=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,2200}?)<\/a>/gi;
while((m=ar.exec(html))&&out.length<30){
 let url;try{url=new URL(m[1],pageUrl).href.split('#')[0]}catch{continue}
 const allowed=store==='digikala'?/digikala\.com\/product\/dkp-/i.test(url):/snappshop\.ir\//i.test(url);
 if(!allowed)continue;
 const text=String(m[2]).replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim();
 const pm=text.match(/([0-9۰-۹][0-9۰-۹,٬\. ]{2,})\s*(تومان|ریال|IRT|IRR)/i);
 add({url,name:text.replace(/(?:تومان|ریال|IRT|IRR).*/i,'').slice(0,220).trim(),price:pm?pm[1]:0,currency:pm?pm[2]:'IRT'})
}
}
return out
}
async function fetchHtmlCandidates(urls,store){
 const all=[];
 for(const url of urls){
  try{
   const r=await req(url,'text/html,application/xhtml+xml');
   const h=await r.text();
   all.push(...htmlProducts(store,h,r.url||url));
  }catch{}
 }
 return dedupe(all)
}
function digikalaApiItems(data){
 const out=[];
 const walk=(x)=>{
  if(!x||out.length>=20)return;
  if(Array.isArray(x)){x.forEach(walk);return}
  if(typeof x!=='object')return;
  const id=x.id||x.product_id||x.product?.id;
  const name=x.title_fa||x.title_en||x.product?.title_fa||x.product?.title_en;
  if(id&&name){
   const v=x.default_variant||x.variant||x.product?.default_variant||{};
   const p=v?.price?.selling_price??x?.price?.selling_price??x.selling_price??x.selling_price_rial??0;
   out.push({productId:String(id),name,price:Number(String(p).replace(/,/g,''))||0,currency:'IRR',priceToman:toToman(p,'IRR'),availability:'in_stock',productUrl:'https://www.digikala.com/product/dkp-'+id+'/',affiliateUrl:affiliate('digikala','https://www.digikala.com/product/dkp-'+id+'/'),storeId:'digikala',storeName:STORES.digikala.name,source:'digikala-api'})
  }
  Object.values(x).forEach(v=>v&&typeof v==='object'&&walk(v))
 };
 walk(data);return dedupe(out)
}
async function dk(q){
 const api=[];
 const attempts=[];
 for(const base of ['https://api.digikala.com/v2/search/','https://api.digikala.com/v1/search/']){
  try{
   const r=await req(base+'?q='+encodeURIComponent(q)+'&page=1','application/json');
   const items=digikalaApiItems(await r.json());
   attempts.push({type:'api',url:base,status:'ok',count:items.length});
   api.push(...items);
   if(api.length>=10)break
  }catch(e){attempts.push({type:'api',url:base,status:'failed',error:String(e).slice(0,160)})}
 }
 if(api.length){const out=api.slice(0,10);out._liveStatus={store:'digikala',mode:'api',status:'ok',count:out.length,attempts};return out}
 const htmlUrls=[
  'https://www.digikala.com/search/?q='+encodeURIComponent(q),
  'https://www.digikala.com/search/?keyword='+encodeURIComponent(q)
 ];
 const out=(await fetchHtmlCandidates(htmlUrls,'digikala')).slice(0,20);
 out._liveStatus={store:'digikala',mode:'html',status:out.length?'ok':'empty',count:out.length,attempts};
 return out
}
async function ss(q){
 const urls=[
  'https://snappshop.ir/search?query='+encodeURIComponent(q),
  'https://snappshop.ir/search?q='+encodeURIComponent(q)
 ];
 const out=(await fetchHtmlCandidates(urls,'snappshop')).slice(0,20);
 out._liveStatus={store:'snappshop',mode:'html',status:out.length?'ok':'empty',count:out.length};
 return out
}

export default{async fetch(request){if(request.method==='OPTIONS')return new Response(null,{headers:CORS});const u=new URL(request.url),q=(u.searchParams.get('q')||'').trim();if(u.pathname==='/health')return json({status:'ok',version:'v5.1-search-core',priceContract:'5.1.0:TOMAN',ingestion:true,index:'web-product-catalog',indexSize:PRODUCT_INDEX.length,meta:INDEX_META});if(u.pathname==='/api/catalog')return json({success:true,version:'v5.1-catalog',indexSize:PRODUCT_INDEX.length,meta:INDEX_META,categories:{mobile:PRODUCT_INDEX.filter(x=>x.category==='mobile').length,laptop:PRODUCT_INDEX.filter(x=>x.category==='laptop').length}});if(u.pathname==='/api/ingest'){if(!q)return json({success:false,error:'Missing q'});try{const data=await ingestCategory(q);return json({success:true,version:'v5.1-ingestion',query:q,items:data.items,total:data.items.length,stores:data.sources,generatedAt:data.generatedAt})}catch(e){return json({success:false,query:q,items:[],total:0,error:String(e)})}}if(u.pathname==='/api/live-diagnostic'){
  const store=(u.searchParams.get('store')||'').trim().toLowerCase();
  const qq=(u.searchParams.get('q')||'').trim();
  if(!['digikala','snappshop'].includes(store))return json({success:false,error:'Unsupported store',store});
  if(!qq)return json({success:false,error:'Missing q',store});
  const urls=store==='digikala'
    ? [
      'https://www.digikala.com/search/?q='+encodeURIComponent(qq),
      'https://www.digikala.com/search/?keyword='+encodeURIComponent(qq),
      'https://api.digikala.com/v2/search/?q='+encodeURIComponent(qq)+'&page=1'
    ]
    : [
      'https://snappshop.ir/search?query='+encodeURIComponent(qq),
      'https://snappshop.ir/search?q='+encodeURIComponent(qq)
    ];
  const checks=[];
  for(const url of urls){
    try{
      const r=await fetch(url,{redirect:'manual',headers:{Accept:'text/html,application/xhtml+xml,application/json','Accept-Language':'fa-IR,fa;q=0.9,en;q=0.8','User-Agent':'Mozilla/5.0 (compatible; DigiYar/5.1-Diagnostic)'}});
      const ct=r.headers.get('content-type')||'';
      const location=r.headers.get('location')||'';
      let sample='',length=0,scriptCount=0,scriptTypes=[],dkpMatches=(h.match(/https?:\/\/(?:www\.)?digikala\.com\/product\/dkp-[0-9]+/gi)||[]).length;
        let markers=[];
      try{
        const h=await r.text();
        length=h.length;
        sample=h.slice(0,300).replace(/\s+/g,' ').trim();
        scriptCount=(h.match(/<script\b/gi)||[]).length;
        scriptTypes=[...h.matchAll(/<script[^>]*?(?:id|type|src)=["']([^"']+)["']/gi)].map(x=>x[1]).slice(0,20);
        dkpMatches=(h.match(/https?:\/\/(?:www\.)?digikala\.com\/product\/dkp-[0-9]+/gi)||[]).length;
        for(const marker of ['__NEXT_DATA__','self.__next_f.push','productId','productID','selling_price','title_fa','sku','dkp-'])if(h.includes(marker))markers.push(marker);
      }catch{}
      checks.push({url,status:r.status,statusText:r.statusText,redirected:r.redirected,location,contentType:ct,bodyLength:length,scriptCount,scriptTypes,dkpMatches,markers,sample});
    }catch(e){
      checks.push({url,status:0,error:String(e).slice(0,300)});
    }
  }
  return json({success:true,store,query:qq,checks});
}
if(u.pathname==='/api/resolve'){const productUrl=(u.searchParams.get('url')||'').trim();if(!productUrl)return json({success:false,error:'Missing url',resolverVersion:'5.1.2-live-resolver'});try{const result=await resolveProduct(productUrl);return json({...result,resolverVersion:'5.1.2-live-resolver'});}catch(e){return json({success:false,resolved:false,error:String(e),productUrl,resolverVersion:'5.1.2-live-resolver'})}}if(u.pathname!=='/api/search')return json({error:'Unknown endpoint'});if(!q)return json({success:false,results:[],total:0,error:'Missing q'});const live=await Promise.allSettled([dk(q),ss(q)]),liveRaw=dedupe(live.flatMap(x=>x.status==='fulfilled'?x.value:[]));let results=rank(liveRaw,q);let source=results.length?'live-store-search':'live-store-search-empty',ingestion=null;const liveDiagnostics={digikala:live[0].status==='fulfilled'?(live[0].value._liveStatus||{status:live[0].value.length?'ok':'empty',count:live[0].value.length}):{status:'rejected',error:String(live[0].reason||'unknown').slice(0,160)},snappshop:live[1].status==='fulfilled'?(live[1].value._liveStatus||{status:live[1].value.length?'ok':'empty',count:live[1].value.length}):{status:'rejected',error:String(live[1].reason||'unknown').slice(0,160)}};if(!results.length){try{ingestion=await ingestCategory(q);const ingested=dedupe(Array.isArray(ingestion.items)?ingestion.items:[]);const ingestionRanked=rank(ingested,q);if(ingestionRanked.length){results=ingestionRanked;source='live-ingestion-fallback'}}catch{results=[]}if(!results.length){const local=localSearch(q);if(local.results.length){results=local.results;source='local-product-index-relevant'}else{results=[];source='live-store-search-empty'}}}results=results.slice(0,20);return json({success:true,version:'v5.1',query:q,parsed:parseQ(q),results,total:results.length,source,indexSize:PRODUCT_INDEX.length,sources:liveDiagnostics,ingestion:ingestion?{digikala:ingestion.sources.digikala.status,snappshop:ingestion.sources.snappshop.status}:null})}};
function json(x){return new Response(JSON.stringify(x),{headers:{...CORS,'Content-Type':'application/json'}})}
