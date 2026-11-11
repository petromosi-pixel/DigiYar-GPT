/* DigiYar — product result event source (comparison-independent) */
(function(){
  'use strict';
  const VERSION='8.0.0-product-result-source.3';
  const MAX_RESULTS=20;
  let state={version:VERSION,query:'',source:'none',products:[],updatedAt:null};

  function normalizeProduct(input){
    if(!input||typeof input!=='object')return null;
    const p=Object.assign({},input);
    const identity=[p.name||p.title||p.productName,p.brand,p.model,p.store||p.storeName,p.productUrl||p.sourceUrl]
      .map(v=>String(v||'').trim().toLowerCase()).join('|');
    let hash=2166136261;
    for(let i=0;i<identity.length;i++){hash^=identity.charCodeAt(i);hash=Math.imul(hash,16777619);}
    const name=p.name??p.title??p.productName??'';
    if(!String(name).trim())return null;
    p.id=String(p.id??p.productId??p.sku??('v7-product-'+(hash>>>0).toString(36)));
    p.productId=p.productId??p.id;
    p.name=String(name).trim();
    if(p.storeName&&!p.store)p.store=p.storeName;
    if(p.price==null&&p.priceToman!=null)p.price=p.priceToman;
    if(p.productUrl==null&&p.sourceUrl!=null)p.productUrl=p.sourceUrl;
    return p;
  }
  function set(results,meta){
    const list=Array.isArray(results)?results:[];
    const products=list.slice(0,MAX_RESULTS).map(normalizeProduct).filter(Boolean);
    const m=meta&&typeof meta==='object'?meta:{};
    state={version:VERSION,query:String(m.query||state.query||'').trim(),source:String(m.source||'supplied').trim()||'supplied',products,updatedAt:new Date().toISOString()};
    return get();
  }
  function get(){return JSON.parse(JSON.stringify(state));}
  function clear(){state={version:VERSION,query:'',source:'none',products:[],updatedAt:null};return get();}
  function publish(results,meta){
    const snapshot=set(results,meta);
    try{window.dispatchEvent(new CustomEvent('digiyar:v7-product-results',{detail:snapshot}));}catch(_){}
    return snapshot;
  }
  function ingest(detail){
    if(!detail)return null;
    if(Array.isArray(detail))return publish(detail,{source:'event'});
    if(Array.isArray(detail.products))return publish(detail.products,detail);
    return null;
  }
  window.addEventListener('digiyar:v7-product-results-input',event=>ingest(event&&event.detail));
  window.DigiYarV7ProductResultSource={version:VERSION,set,publish,get,clear};
})();
