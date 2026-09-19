/* DigiYar V7 — Hamyar live store-page engines (Path A) */
const STORES=[
  {id:'digikala',name:'دیجی‌کالا',url:q=>'https://www.digikala.com/search/?q='+encodeURIComponent(q)},
  {id:'snappshop',name:'اسنپ‌شاپ',url:q=>'https://snappshop.ir/search?q='+encodeURIComponent(q)},
  {id:'technolife',name:'تکنولایف',url:q=>'https://www.technolife.ir/search?q='+encodeURIComponent(q)},
  {id:'digido',name:'دیجیدو',url:q=>'https://digido.ir/search?q='+encodeURIComponent(q)}
];

const norm=s=>String(s??'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٬,]/g,'').replace(/\s+/g,' ').trim();
const money=s=>{const x=Number(String(s??'').replace(/[^0-9.]/g,''));return Number.isFinite(x)?x:0};
const toToman=(n,c='IRT')=>{const x=money(n);return /IRR|ریال/i.test(String(c))?Math.round(x/10):Math.round(x)};
const absUrl=(u,base)=>{try{return new URL(u,base).href}catch{return ''}};
function walk(x,out,base){
  if(!x)return;
  if(Array.isArray(x)){x.forEach(v=>walk(v,out,base));return}
  if(typeof x!=='object')return;
  const type=String(x['@type']||'').toLowerCase();
  const offers=Array.isArray(x.offers)?x.offers[0]:x.offers||{};
  if(type.includes('product') && (x.name||x.url||x.sku)){
    const price=offers.price||x.price||x.lowPrice||0;
    const currency=offers.priceCurrency||x.priceCurrency||'IRT';
    const url=absUrl(x.url||x['@id']||'',base);
    out.push({name:String(x.name||'').trim(),productUrl:url,price:Number(price)||0,priceToman:toToman(price,currency),currency,availability:offers.availability||'unknown',source:'json-ld'});
  }
  Object.keys(x).forEach(k=>{if(k!=='offers'&&x[k]&&typeof x[k]==='object')walk(x[k],out,base)});
}
function parseHtml(html,base){
  const out=[];
  const re=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\\s\\S]*?)<\/script>/gi;
  let m;
  while((m=re.exec(html))){
    try{walk(JSON.parse(m[1]),out,base)}catch{}
  }
  const seen=new Set();
  return out.filter(p=>p.name&&p.productUrl&&!seen.has(p.productUrl)&&seen.add(p.productUrl)).slice(0,30);
}
function scoreProduct(p,q){
  const text=norm(p.name), words=norm(q).split(' ').filter(x=>x.length>1);
  const hits=words.reduce((n,w)=>n+(text.includes(w)?1:0),0);
  return hits*20+(p.priceToman>0?4:0)+(p.productUrl?5:0);
}
async function fetchStore(store,q){
  const url=store.url(q);
  try{
    const r=await fetch(url,{redirect:'follow',headers:{Accept:'text/html,application/xhtml+xml','Accept-Language':'fa-IR,fa;q=0.9,en;q=0.7','User-Agent':'Mozilla/5.0 (compatible; DigiYar-Hamyar/7.0; +https://digiyar.ir)'}});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const html=await r.text();
    const products=parseHtml(html,url).map(p=>({...p,storeId:store.id,storeName:store.name,score:scoreProduct(p,q),availability:/outofstock|unavailable/i.test(String(p.availability))?'out_of_stock':'in_stock'}));
    return {store:{id:store.id,name:store.name,status:products.length?'ok':'empty',count:products.length},products};
  }catch(error){
    return {store:{id:store.id,name:store.name,status:'error',count:0,error:String(error?.message||error)},products:[]};
  }
}
export async function hmyarSearch(q){
  const settled=await Promise.all(STORES.map(s=>fetchStore(s,q)));
  const products=settled.flatMap(x=>x.products).sort((a,b)=>b.score-a.score||(a.priceToman||Infinity)-(b.priceToman||Infinity));
  const seen=new Set();
  const unique=products.filter(p=>{const k=norm(p.name)+'|'+String(p.priceToman||'');if(seen.has(k))return false;seen.add(k);return true});
  const results=unique.slice(0,3).map((p,i)=>({...p,rank:i+1,reason:
    i===0?'بیشترین تطابق با عبارت جست‌وجو و داده زنده استخراج‌شده.':
    p.priceToman>0?'تطابق مناسب با جست‌وجو و قیمت قابل‌استخراج.':
    'تطابق مناسب با عبارت جست‌وجو.'}));
  return {success:true,engine:'hamyar-path-a',version:'7.0.0-alpha.1',query:q,stores:settled.map(x=>x.store),results,total:results.length};
}
