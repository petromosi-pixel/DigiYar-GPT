/* DigiYar V7 — Hamyar Path A: live store-page extraction (multi-layer) */
const STORES=[
  {id:'digikala',name:'دیجی‌کالا',url:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(q),hosts:['digikala.com']},
  {id:'snappshop',name:'اسنپ‌شاپ',url:q=>'https://snappshop.ir/search?q='+encodeURIComponent(q),hosts:['snappshop.ir']},
  {id:'technolife',name:'تکنولایف',url:q=>'https://www.technolife.com/search?q='+encodeURIComponent(q),hosts:['technolife.com']},
  {id:'digido',name:'دیجیدو',url:q=>'https://digido.ir/search?q='+encodeURIComponent(q),hosts:['digido.ir']}
];

const norm=s=>String(s??'').toLowerCase()
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
  .replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/[٬,]/g,'').replace(/\s+/g,' ').trim();

const money=s=>{
  const x=Number(String(s??'').replace(/[^0-9.]/g,''));
  return Number.isFinite(x)?x:0;
};
const toToman=(n,c='IRT')=>{
  const x=money(n);
  return /IRR|ریال/i.test(String(c))?Math.round(x/10):Math.round(x);
};
const absUrl=(u,base)=>{
  try{
    const x=new URL(String(u||''),base);
    if(!/^https?:$/.test(x.protocol))return '';
    return x.href;
  }catch{return ''}
};
const cleanText=s=>String(s??'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
  .replace(/&quot;/gi,'"').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();

function pushProduct(out,p,base,source){
  if(!p||typeof p!=='object')return;
  const name=cleanText(p.name||p.title||p.productName||p.title_fa||p.titleFa||'');
  const rawUrl=p.url||p.productUrl||p.link||p.href||p.productLink||'';
  const productUrl=absUrl(rawUrl,base);
  const offers=Array.isArray(p.offers)?p.offers[0]:(p.offers||p.offer||{});
  const rawPrice=p.price??p.sellingPrice??p.salePrice??p.finalPrice??p.currentPrice??offers.price??offers.selling_price??offers.sellingPrice??0;
  const currency=p.priceCurrency||p.currency||offers.priceCurrency||'IRT';
  const priceToman=toToman(rawPrice,currency);
  if(name && productUrl && /product|dkp-|item|sku|p\//i.test(productUrl)){
    out.push({name,productUrl,price:Number(money(rawPrice))||0,priceToman,currency,
      availability:p.availability||offers.availability||'unknown',source});
  }
}

function walkObject(x,out,base,source,depth=0){
  if(!x||depth>8)return;
  if(Array.isArray(x)){for(const v of x)walkObject(v,out,base,source,depth+1);return}
  if(typeof x!=='object')return;
  const type=String(x['@type']||'').toLowerCase();
  if(type.includes('product')||x.productId||x.product_id||x.productName)pushProduct(out,x,base,source);
  for(const [k,v] of Object.entries(x)){
    if(k==='offers'||k==='product'||k==='products'||k==='items'||k==='data'||k==='results'||k==='props'||k==='pageProps'||typeof v==='object'){
      walkObject(v,out,base,source,depth+1);
    }
  }
}

function parseJsonScripts(html,out,base){
  const re=/<script([^>]*)>([\s\S]*?)<\/script>/gi; let m;
  while((m=re.exec(html))){
    const attrs=m[1]||'', body=m[2]||'';
    if(!body.trim())continue;
    const type=(attrs.match(/type=["']([^"']+)["']/i)||[])[1]||'';
    const id=(attrs.match(/id=["']([^"']+)["']/i)||[])[1]||'';
    if(!/json|ld\+json/i.test(type) && !/__next_data__|initial|state|apollo|nuxt|redux|preloaded/i.test(id+body.slice(0,500)))continue;
    try{
      let s=body.trim();
      if(type.toLowerCase().includes('ld+json'))s=s.replace(/<!--|-->/g,'');
      const data=JSON.parse(s);
      walkObject(data,out,base,type||id||'embedded-json');
    }catch{}
  }
}

function parseLdJson(html,out,base){
  const re=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let m;
  while((m=re.exec(html))){
    try{walkObject(JSON.parse(m[1].replace(/<!--|-->/g,'')),out,base,'json-ld')}catch{}
  }
}

function parseProductAnchors(html,out,base){
  const re=/<a([^>]+)href=["']([^"']+)["']([^>]*)>([\s\S]{0,2500}?)<\/a>/gi; let m;
  while((m=re.exec(html))){
    const href=absUrl(m[2],base), block=cleanText(m[4]);
    if(!href||!block||!(/product|dkp-|item|sku|p\//i.test(href)))continue;
    const nums=[...block.matchAll(/(?:تومان|تومن|ریال)?\s*([0-9۰-۹]{3,4}(?:[٬,][0-9۰-۹]{3})*(?:\.[0-9]+)?)/g)]
      .map(x=>money(x[1])).filter(Boolean);
    const price=nums.length?nums[nums.length-1]:0;
    const name=block.replace(/[0-9۰-۹٬,.]+/g,' ').replace(/تومان|تومن|ریال/g,' ').replace(/\s+/g,' ').trim();
    if(name.length>=4)out.push({name,productUrl:href,price,priceToman:price,currency:'TOMAN',availability:'unknown',source:'product-anchor'});
  }
}


function parseTechnolifeProductPage(html,productUrl,q){
  const out=[];
  const titleMatch=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const name=cleanText(titleMatch?.[1]||'').replace(/\s*[-|]\s*تکنولایف.*$/,'').trim();
  if(!name||!productUrl)return out;
  const text=cleanText(html);
  const cartIndex=text.indexOf('افزودن به سبد خرید');
  const mainBlock=cartIndex>0?text.slice(Math.max(0,cartIndex-2200),cartIndex):text.slice(0,7000);
  const structured=[];
  parseLdJson(html,structured,productUrl);
  parseJsonScripts(html,structured,productUrl);
  const targetNorm=norm(name);
  const exactStructured=structured.filter(p=>{
    const pn=norm(p.name||'');
    const pu=String(p.productUrl||'');
    return pn && (pn===targetNorm || pn.includes(targetNorm) || targetNorm.includes(pn)) && (!pu||pu===productUrl);
  });
  const structuredPrices=exactStructured.map(p=>Number(p.priceToman)||0).filter(n=>n>=10000&&n<=10000000000);
  const priceMatches=[...mainBlock.matchAll(/([0-9۰-۹][0-9۰-۹٬,. ]{2,})\s*تومان/g)]
    .map(m=>money(m[1])).filter(n=>n>=10000&&n<=10000000000);
  // Technolife exposes the real seller offer after the seller-stock marker.
  // Do not use the discount amount as the product price.
  const sellerMarker='موجود در انبار تکنولایف';
  const sellerStart=mainBlock.indexOf(sellerMarker);
  const sellerBlock=sellerStart>=0?mainBlock.slice(sellerStart, Math.min(mainBlock.length,sellerStart+1400)):mainBlock;
  const sellerPrices=[...sellerBlock.matchAll(/([0-9۰-۹][0-9۰-۹٬,. ]{2,})\s*تومان/g)]
    .map(m=>money(m[1])).filter(n=>n>=10000&&n<=10000000000);
  // In the primary seller block the sequence is: discount -> original -> current.
  // The current/sale price is the final price in that block.
  const priceToman=sellerPrices.length?sellerPrices[sellerPrices.length-1]:
    priceMatches.length?priceMatches[priceMatches.length-1]:
    (structuredPrices.length?structuredPrices[structuredPrices.length-1]:0);
  const available=/موجود در انبار|موجود است|افزودن به سبد خرید/i.test(mainBlock);
  const unavailable=/ناموجود|نا موجود|در انبار موجود نیست/i.test(mainBlock);
  out.push({
    name,productUrl,price:priceToman,priceToman,currency:'TOMAN',
    availability:unavailable?'out_of_stock':available?'in_stock':'unknown',
    source:'technolife-product-page'
  });
  return out.filter(p=>inPriceRange(p,q));
}

function parseTechnolifeLinks(html,base,q){
  const out=[];
  const re=/<a([^>]+)href=["']([^"']*product-[^"']+)["']([^>]*)>([\s\S]{0,1800}?)<\/a>/gi; let m;
  while((m=re.exec(html))){
    const href=absUrl(m[2],base);
    if(!href||!href.includes('/product-'))continue;
    const block=cleanText(m[4]);
    const name=block.replace(/\s+/g,' ').trim();
    if(name.length<8)continue;
    if(q&&!isRelevantProduct({name},q))continue;
    if(!out.some(x=>x.productUrl===href))out.push({name,productUrl:href});
    if(out.length>=8)break;
  }
  return out;
}

function parseMeta(html,out,base){
  const metas={};
  const re=/<meta\s+[^>]*?(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi; let m;
  while((m=re.exec(html)))metas[m[1].toLowerCase()]=m[2];
  const name=metas['og:title']||metas['twitter:title']||'';
  const url=absUrl(metas['og:url']||'',base);
  const price=metas['product:price:amount']||metas['og:price:amount']||'';
  if(name&&url)out.push({name:cleanText(name),productUrl:url,price:money(price),priceToman:toToman(price,metas['product:price:currency']||'IRT'),currency:metas['product:price:currency']||'IRT',availability:'unknown',source:'meta'});
}

function parseHtml(html,base){
  const out=[];
  parseLdJson(html,out,base);
  parseJsonScripts(html,out,base);
  parseProductAnchors(html,out,base);
  parseMeta(html,out,base);
  const seen=new Set();
  return out.filter(p=>p.name&&p.productUrl&&!seen.has(p.productUrl)&&seen.add(p.productUrl)).slice(0,60);
}

function queryConstraints(q){
  const n=norm(q);
  const brands=['سامسونگ','شیائومی','اپل','آیفون','هواوی','آنر','لنوو','ایسوس','موتورولا','نوکیا','وان پلاس','ریلمی','گوگل پیکسل'];
  const brand=brands.find(b=>n.includes(norm(b)))||'';
  const phoneTerms=['گوشی','موبایل','تلفن همراه','smartphone'];
  const wantsPhone=phoneTerms.some(t=>n.includes(norm(t)));
  return {brand,wantsPhone};
}

function isRelevantProduct(p,q){
  const text=norm(p.name);
  const c=queryConstraints(q);
  if(c.brand && !text.includes(norm(c.brand)))return false;
  if(c.wantsPhone && !/(گوشی|موبایل|تلفن همراه|smartphone|phone)/i.test(text))return false;
  return true;
}

function scoreProduct(p,q){
  const text=norm(p.name), words=norm(q).split(' ').filter(x=>x.length>1&&!/^\d/.test(x));
  const hits=words.reduce((n,w)=>n+(text.includes(w)?1:0),0);
  const c=queryConstraints(q);
  const brand=c.brand&&text.includes(norm(c.brand))?35:0;
  const category=c.wantsPhone&&/(گوشی|موبایل|تلفن همراه|smartphone|phone)/i.test(text)?25:0;
  return hits*20+brand+category+(p.priceToman>0?6:0)+(p.productUrl?5:0);
}

function inPriceRange(p,q){
  const n=norm(q), m=n.match(/(?:تا|زیر|کمتر از|حداکثر)\s*([0-9.]+)\s*(میلیون|میلیارد|هزار|تومان|تومن)?/);
  if(!m)return true;
  const unit=m[2]||'تومان', max=unit==='میلیون'?Number(m[1])*1e6:unit==='میلیارد'?Number(m[1])*1e9:unit==='هزار'?Number(m[1])*1e3:Number(m[1]);
  return !p.priceToman||p.priceToman<=max;
}

async function fetchHtml(url){
  const r=await fetch(url,{redirect:'follow',headers:{
    Accept:'text/html,application/xhtml+xml,application/json',
    'Accept-Language':'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control':'no-cache',
    Pragma:'no-cache',
    Referer:'https://www.google.com/',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36'
  }});
  const html=await r.text();
  if(!r.ok)throw new Error('HTTP '+r.status);
  if(!html||html.length<200)throw new Error('Empty response');
  if(/cf-chl-|just a moment|access denied|captcha|robot check/i.test(html))throw new Error('Anti-bot/challenge page');
  return {html,url:r.url||url};
}

function discoverUrlsFromSearch(html,store){
  const out=[];
  const re=/<a[^>]+href=["']([^"']+)["'][^>]*>/gi; let m;
  while((m=re.exec(html))){
    let u=m[1].replace(/&amp;/g,'&');
    try{
      if(u.startsWith('/url?q='))u=decodeURIComponent(u.slice(7).split('&')[0]);
      else if(u.startsWith('/'))continue;
      const x=new URL(u);
      if(!store.hosts.some(h=>x.hostname===h||x.hostname.endsWith('.'+h)))continue;
      if(!/product|dkp-|item|sku|p\//i.test(x.pathname))continue;
      if(!out.includes(x.href))out.push(x.href);
    }catch{}
    if(out.length>=8)break;
  }
  return out;
}

async function searchEngineFallback(store,q){
  const query=encodeURIComponent('site:'+store.hosts[0]+' '+q);
  const engines=[
    'https://www.google.com/search?q='+query+'&num=8',
    'https://www.bing.com/search?q='+query
  ];
  for(const u of engines){
    try{
      const {html}=await fetchHtml(u);
      const urls=discoverUrlsFromSearch(html,store);
      if(urls.length)return urls;
    }catch{}
  }
  return [];
}

async function extractProductPages(urls,store,q){
  const settled=await Promise.all(urls.slice(0,6).map(async url=>{
    try{
      const {html,url:finalUrl}=await fetchHtml(url);
      const products=parseHtml(html,finalUrl)
        .filter(p=>isRelevantProduct(p,q)&&inPriceRange(p,q))
        .map(p=>({...p,storeId:store.id,storeName:store.name,
          score:scoreProduct(p,q)+8,
          availability:/outofstock|unavailable|ناموجود/i.test(String(p.availability))?'out_of_stock':'in_stock'}));
      return products;
    }catch{return []}
  }));
  return settled.flat();
}

async function fetchStore(store,q){
  const url=store.url(q);
  try{
    const {html:directHtml,url:finalUrl}=await fetchHtml(url);

    if(store.id==='technolife'){
      let links=parseTechnolifeLinks(directHtml,finalUrl,q);
      let products=[];
      if(links.length){
        const settled=await Promise.all(links.slice(0,6).map(async link=>{
          try{
            const page=await fetchHtml(link.productUrl);
            return parseTechnolifeProductPage(page.html,link.productUrl||page.url,q)
              .filter(p=>isRelevantProduct(p,q)&&inPriceRange(p,q))
              .map(p=>({...p,storeId:store.id,storeName:store.name,
                score:scoreProduct(p,q)+12,
                availability:p.availability}));
          }catch{return []}
        }));
        products=settled.flat();
      }
      if(!products.length){
        const discovered=await searchEngineFallback(store,q);
        const settled=await Promise.all(discovered.slice(0,6).map(async productUrl=>{
          try{
            const page=await fetchHtml(productUrl);
            return parseTechnolifeProductPage(page.html,productUrl||page.url,q)
              .filter(p=>isRelevantProduct(p,q)&&inPriceRange(p,q))
              .map(p=>({...p,storeId:store.id,storeName:store.name,
                score:scoreProduct(p,q)+12,
                availability:p.availability}));
          }catch{return []}
        }));
        products=settled.flat();
      }
      return {
        store:{id:store.id,name:store.name,status:products.length?'ok':'empty',
          count:products.length,mode:products.length?(links.length?'technolife-product-pages':'technolife-search-discovery'):'technolife-empty'},
        products
      };
    }

    let products=parseHtml(directHtml,finalUrl)
      .filter(p=>isRelevantProduct(p,q)&&inPriceRange(p,q))
      .map(p=>({...p,storeId:store.id,storeName:store.name,score:scoreProduct(p,q),
        availability:/outofstock|unavailable|ناموجود/i.test(String(p.availability))?'out_of_stock':'in_stock'}));
    let mode='direct';
    if(!products.length){
      const discovered=await searchEngineFallback(store,q);
      const pageProducts=await extractProductPages(discovered,store,q);
      products=pageProducts;
      mode=pageProducts.length?'search-discovery':'direct-empty';
    }
    return {store:{id:store.id,name:store.name,status:products.length?'ok':'empty',count:products.length,mode},products};
  }catch(error){
    if(store.id==='technolife'){
      try{
        const discovered=await searchEngineFallback(store,q);
        const pageProducts=await extractProductPages(discovered,store,q);
        if(pageProducts.length)return {
          store:{id:store.id,name:store.name,status:'ok',count:pageProducts.length,mode:'search-discovery'},
          products:pageProducts
        };
      }catch{}
    }
    const discovered=await searchEngineFallback(store,q);
    const pageProducts=await extractProductPages(discovered,store,q);
    if(pageProducts.length){
      return {store:{id:store.id,name:store.name,status:'ok',count:pageProducts.length,mode:'search-discovery'},products:pageProducts};
    }
    return {store:{id:store.id,name:store.name,status:'error',count:0,error:String(error?.message||error),mode:'failed'},products:[]};
  }
}

export async function hmyarSearch(q){
  const settled=await Promise.all(STORES.map(s=>fetchStore(s,q)));
  const products=settled.flatMap(x=>x.products).sort((a,b)=>b.score-a.score||(a.priceToman||Infinity)-(b.priceToman||Infinity));
  const seen=new Set();
  const unique=products.filter(p=>{
    const k=norm(p.name)+'|'+String(p.priceToman||'')+'|'+p.storeId;
    if(seen.has(k))return false; seen.add(k); return true;
  });
  const results=unique.slice(0,3).map((p,i)=>({...p,rank:i+1,
    reason:i===0?'بیشترین تطابق از داده زنده صفحه فروشگاه.':p.priceToman>0?'تطابق مناسب با نام و قیمت استخراج‌شده از صفحه فروشگاه.':'تطابق مناسب با داده محصول استخراج‌شده از صفحه فروشگاه.'
  }));
  return {success:true,engine:'hamyar-path-a',version:'7.0.0-alpha.2',query:q,
    stores:settled.map(x=>x.store),results,total:results.length,
    extraction:['json-ld','embedded-json','product-links','meta']};
}
