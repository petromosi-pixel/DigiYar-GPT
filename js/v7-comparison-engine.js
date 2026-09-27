/* =========================================================
   DigiYar V7 — Comparison Engine
   Post-processing only: compares an existing Result Set.
   No fetch, no API, no resolver, no catalog, no store re-query.
   ========================================================= */
(function(window){
  'use strict';

  const VERSION = '7.0.0-comparison.1';
  const MAX_RESULTS = 20;

  function text(value){
    return String(value == null ? '' : value).trim();
  }

  function number(value){
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function clone(value){
    try { return JSON.parse(JSON.stringify(value)); }
    catch(e){ return value; }
  }

  function firstValue(){
    for(let i=0;i<arguments.length;i++){
      const v = arguments[i];
      if(v !== undefined && v !== null && text(v) !== '') return v;
    }
    return '';
  }

  function normalizeKey(value){
    return text(value)
      .toLowerCase()
      .replace(/ي/g,'ی')
      .replace(/ك/g,'ک')
      .replace(/[\u200c\u200f\u200e]/g,' ')
      .replace(/[\s_-]+/g,' ')
      .trim();
  }

  function displayValue(value){
    if(value === null || value === undefined || value === '') return '';
    if(Array.isArray(value)) return value.map(displayValue).filter(Boolean).join('، ');
    if(typeof value === 'object'){
      if(value.value !== undefined) return displayValue(value.value);
      if(value.name !== undefined) return displayValue(value.name);
      return '';
    }
    return text(value);
  }

  function extractSpecs(product){
    const sources = [
      product && product.attributes,
      product && product.specifications,
      product && product.specs,
      product && product.technicalSpecs,
      product && product.features
    ];
    const out = {};
    sources.forEach(function(source){
      if(!source || typeof source !== 'object' || Array.isArray(source)) return;
      Object.keys(source).forEach(function(key){
        const value = displayValue(source[key]);
        const normalized = normalizeKey(key);
        if(normalized && value && out[normalized] === undefined){
          out[normalized] = { key:text(key), value:value };
        }
      });
    });
    return out;
  }

  function priceOf(product){
    const offer = product && product.bestOffer && typeof product.bestOffer === 'object'
      ? product.bestOffer : null;
    const offers = product && Array.isArray(product.offers) ? product.offers : [];

    const candidates = [
      offer && offer.priceToman,
      offer && offer.price,
      product && product.priceToman,
      product && product.price
    ];

    for(let i=0;i<candidates.length;i++){
      const n = number(candidates[i]);
      if(n > 0) return n;
    }

    for(let i=0;i<offers.length;i++){
      const n = number(offers[i] && (offers[i].priceToman || offers[i].price));
      if(n > 0) return n;
    }

    return 0;
  }

  function storeOf(product){
    const offer = product && product.bestOffer && typeof product.bestOffer === 'object'
      ? product.bestOffer : null;
    return text(firstValue(
      offer && offer.storeName,
      offer && offer.store,
      product && product.storeName,
      product && product.store,
      product && product.sourceName,
      product && product.sourceId,
      product && product.source
    ));
  }

  function urlOf(product){
    const offer = product && product.bestOffer && typeof product.bestOffer === 'object'
      ? product.bestOffer : null;
    return text(firstValue(
      offer && offer.affiliateUrl,
      product && product.affiliateUrl,
      offer && offer.productUrl,
      product && product.productUrl,
      product && product.url,
      product && product.sourceUrl
    ));
  }

  function normalizeProduct(product, index){
    product = product && typeof product === 'object' ? product : {};
    const price = priceOf(product);
    const scoreCandidate = firstValue(
      product.matchScore,
      product.fitScore,
      product.relevanceScore,
      product.score
    );
    const rawScore = scoreCandidate === '' ? null : number(scoreCandidate);

    return {
      index:index,
      id:text(firstValue(product.id, product.productId, 'compare-' + (index + 1))),
      name:text(firstValue(product.name, product.title, product.productName, 'محصول بدون نام')),
      brand:text(firstValue(product.brand, product.brandName)),
      model:text(firstValue(product.model, product.modelName)),
      store:storeOf(product),
      priceToman:price,
      currency:text(firstValue(
        product.currency,
        product.bestOffer && product.bestOffer.currency,
        'IRT'
      )),
      availability:text(firstValue(
        product.availability,
        product.bestOffer && product.bestOffer.availability
      )),
      productUrl:urlOf(product),
      image:text(firstValue(product.image, product.imageUrl)),
      matchScore:rawScore,
      rank:number(product.rank) || null,
      specs:extractSpecs(product),
      original:product
    };
  }

  function comparable(results){
    return Array.isArray(results)
      ? results.filter(function(x){ return x && typeof x === 'object'; }).slice(0,MAX_RESULTS)
      : [];
  }

  function priceComparison(products){
    const priced = products.filter(function(p){ return p.priceToman > 0; });
    if(!priced.length) return {
      available:false,
      min:null,
      max:null,
      difference:null,
      cheapestIds:[],
      mostExpensiveIds:[]
    };

    const values = priced.map(function(p){ return p.priceToman; });
    const min = Math.min.apply(Math, values);
    const max = Math.max.apply(Math, values);

    return {
      available:true,
      min:min,
      max:max,
      difference:max-min,
      cheapestIds:priced.filter(function(p){ return p.priceToman===min; }).map(function(p){ return p.id; }),
      mostExpensiveIds:priced.filter(function(p){ return p.priceToman===max; }).map(function(p){ return p.id; })
    };
  }

  function specificationComparison(products){
    const keys = {};
    products.forEach(function(product){
      Object.keys(product.specs || {}).forEach(function(key){
        if(!keys[key]) keys[key] = { key:product.specs[key].key, values:[] };
        const value = product.specs[key].value;
        if(!keys[key].values.some(function(v){ return normalizeKey(v)===normalizeKey(value); })){
          keys[key].values.push(value);
        }
      });
    });

    return Object.keys(keys).map(function(key){
      const row = keys[key];
      const presentCount = products.filter(function(p){ return !!(p.specs && p.specs[key] && p.specs[key].value); }).length;
      return {
        field:key,
        label:row.key,
        comparable:row.values.length > 1,
        valuesByProduct:products.map(function(p){
          return {
            productId:p.id,
            value:p.specs && p.specs[key] ? p.specs[key].value : ''
          };
        }),
        presentCount:presentCount,
        distinctValueCount:row.values.length
      };
    }).filter(function(row){
      return row.presentCount >= 2;
    });
  }

  function storeComparison(products){
    const stores = {};
    products.forEach(function(product){
      const key = normalizeKey(product.store);
      if(!key) return;
      if(!stores[key]) stores[key] = { name:product.store, productIds:[] };
      stores[key].productIds.push(product.id);
    });
    return Object.keys(stores).map(function(key){ return stores[key]; });
  }

  function matchComparison(products){
    const available = products.filter(function(p){ return p.matchScore !== null; });
    return {
      available:available.length > 0,
      values:products.map(function(p){
        return { productId:p.id, score:p.matchScore, rank:p.rank };
      }),
      note:available.length
        ? 'امتیاز تطابق از Result Set فعلی خوانده شده و امتیاز جدیدی از داده بیرونی ساخته نشده است.'
        : 'در Result Set فعلی امتیاز تطابق قابل اتکا وجود ندارد.'
    };
  }

  function compare(results, options){
    const opts = options && typeof options === 'object' ? options : {};
    const input = comparable(results);
    const products = input.map(normalizeProduct);

    const result = {
      version:VERSION,
      status:products.length >= 2 ? 'comparison_ready' : 'not_enough_results',
      count:products.length,
      products:products,
      priceComparison:priceComparison(products),
      specificationComparison:specificationComparison(products),
      storeComparison:storeComparison(products),
      matchComparison:matchComparison(products),
      meta:{
        source:'existing-result-set',
        networkCalls:0,
        catalogLookup:false,
        resolverCall:false,
        storeQuery:false,
        maxResults:MAX_RESULTS,
        requestedLimit:opts.limit || null
      }
    };

    return clone(result);
  }

  function toTable(comparison){
    if(!comparison || !Array.isArray(comparison.products)) return [];
    return comparison.products.map(function(p){
      return {
        id:p.id,
        name:p.name,
        brand:p.brand,
        model:p.model,
        store:p.store,
        priceToman:p.priceToman || null,
        availability:p.availability,
        matchScore:p.matchScore,
        productUrl:p.productUrl
      };
    });
  }

  const api = {
    version:VERSION,
    normalizeProduct:normalizeProduct,
    compare:compare,
    build:compare,
    toTable:toTable
  };

  window.DigiYarComparisonEngine = api;
  window.DigiYarV7Comparison = api;
})(window);
