/* DigiYar V7 — Product Result Source / Result Set contract
 * This module owns the in-memory Product Result Set consumed by V7 post-processing.
 * It never performs search, fetch, resolver, catalog lookup, or store queries.
 */
(function(){
  'use strict';

  const VERSION='7.0.0-product-result-source.2';
  const MAX_RESULTS=20;
  let state={version:VERSION,query:'',source:'none',products:[],comparisonProducts:[],updatedAt:null};
  const STORAGE_KEY='digiyar:v7:comparison-products';
  function loadComparison(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(x)?x.slice(0,3):[];}catch(_){return[];}}
  function saveComparison(list){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(list.slice(0,3)));}catch(_){} state.comparisonProducts=list.slice(0,3);}

  function clone(value){
    if(value===undefined)return value;
    try{return JSON.parse(JSON.stringify(value));}catch(_){return value;}
  }

  function normalizeProduct(product,index){
    if(!product||typeof product!=='object')return null;
    const p=Object.assign({},product);
    const id=p.id??p.productId??p.sku??('v7-result-'+(index+1));
    const name=p.name??p.title??p.productName??'';
    if(!String(name).trim())return null;
    p.id=String(id);
    p.productId=p.productId??p.id;
    p.name=String(name).trim();
    if(p.storeName&&!p.store)p.store=p.storeName;
    if(p.price==null&&p.priceToman!=null)p.price=p.priceToman;
    if(p.productUrl==null&&p.sourceUrl!=null)p.productUrl=p.sourceUrl;
    if(p.comparisonUrl!=null&&String(p.comparisonUrl).trim()){
      const exact=String(p.comparisonUrl).trim();
      p.comparisonUrl=exact;
      p.productUrl=exact;
      p.sourceUrl=exact;
      p.url=exact;
      p.link=exact;
    }
    return p;
  }

  function setResults(results,meta){
    const list=Array.isArray(results)?results:[];
    const products=list.slice(0,MAX_RESULTS).map(normalizeProduct).filter(Boolean);
    const m=meta&&typeof meta==='object'?meta:{};
    state={version:VERSION,query:String(m.query||state.query||'').trim(),source:String(m.source||'supplied').trim()||'supplied',products,comparisonProducts:loadComparison(),updatedAt:new Date().toISOString()};
    return get();
  }

  function get(){
    return clone(state);
  }

  function clear(){
    state={version:VERSION,query:'',source:'none',products:[],comparisonProducts:[],updatedAt:null}; saveComparison([]);
    return get();
  }

  function publish(results,meta){
    const snapshot=setResults(results,meta);
    try{
      window.dispatchEvent(new CustomEvent('digiyar:v7-product-results',{detail:snapshot}));
    }catch(_){}
    return snapshot;
  }

  function ingest(detail){
    if(!detail)return null;
    if(Array.isArray(detail))return publish(detail,{source:'event'});
    if(Array.isArray(detail.products))return publish(detail.products,detail);
    return null;
  }

  function addComparisonProduct(product){
    if(!product||typeof product!=='object'||!String(product.name||product.title||'').trim())return get();
    const p=normalizeProduct(product,0); if(!p)return get();
    if(product.comparisonUrl!=null&&String(product.comparisonUrl).trim()){
      const exact=String(product.comparisonUrl).trim();
      p.comparisonUrl=exact;
      p.productUrl=exact;
      p.sourceUrl=exact;
      p.url=exact;
      p.link=exact;
    }
    const list=loadComparison().filter(x=>String(x.id)!==String(p.id));
    list.push(p); saveComparison(list); return get();
  }
  function removeComparisonProduct(id){saveComparison(loadComparison().filter(x=>String(x.id)!==String(id)));return get();}
  function clearComparison(){saveComparison([]);return get();}
  function compareCurrent(){
    const engine=window.DigiYarComparisonEngine||window.DigiYarV7Comparison;
    if(!engine||typeof engine.compare!=='function')return null;
    return engine.compare(state.products);
  }

  window.addEventListener('digiyar:v7-product-results-input',function(event){
    ingest(event&&event.detail);
  });

  window.DigiYarV7ProductResultSource={
    version:VERSION,
    set:setResults,
    publish:publish,
    get:get,
    clear:clear,
    addComparisonProduct:addComparisonProduct,
    removeComparisonProduct:removeComparisonProduct,
    clearComparison:clearComparison,
    getComparisonProducts:function(){return loadComparison();},
    compare:compareCurrent
  };
})();
