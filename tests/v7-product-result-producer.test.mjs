import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const producerSource = await fs.readFile('js/v7-product-result-producer.js', 'utf8');

const fixture = [
  { productId:'phone-s25', name:'Samsung Galaxy S25', brand:'سامسونگ', model:'Galaxy S25', category:'mobile', subcategory:'گوشی موبایل', priceToman:45000000, productUrl:'https://example.com/phone-s25' },
  { productId:'phone-a56', name:'گوشی موبایل سامسونگ Galaxy A56', brand:'سامسونگ', model:'Galaxy A56', category:'mobile', subcategory:'گوشی موبایل', priceToman:30000000, productUrl:'https://example.com/phone-a56' },
  { productId:'case-s25', name:'قاب گوشی سامسونگ S25', brand:'سامسونگ', model:'S25', category:'mobile', subcategory:'لوازم جانبی موبایل', priceToman:500000, productUrl:'https://example.com/case-s25' },
  { productId:'charger-samsung', name:'شارژر سامسونگ 45 وات', brand:'سامسونگ', model:'45W', category:'mobile', subcategory:'شارژر موبایل', priceToman:1500000, productUrl:'https://example.com/charger-samsung' }
];

const indexNames = [
  'DIGITAL_PRODUCTS','MOBILE_PRODUCTS','LAPTOP_COMPUTER_PRODUCTS',
  'AUDIO_VIDEO_PRODUCTS','AUTO_PRODUCTS','BEAUTY_HEALTH_PRODUCTS',
  'BOOKS_STATIONERY_PRODUCTS','FASHION_PRODUCTS','HOME_APPLIANCES_PRODUCTS',
  'KIDS_TOYS_PRODUCTS','SPORTS_TRAVEL_PRODUCTS','SUPERMARKET_PRODUCTS',
  'TOOLS_INDUSTRIAL_PRODUCTS'
];

const context = {
  console,
  fetch: async () => ({
    ok: true,
    status: 200,
    text: async () => `const ${indexNames[0]} = ${JSON.stringify(fixture)};`
  }),
  URL,
  CustomEvent,
  setTimeout,
  clearTimeout
};
context.globalThis = context;
context.DigiYarV7ProductResultSource = {
  publish(products, meta) {
    return { products, ...meta };
  }
};

vm.runInNewContext(producerSource, context);

const results = await context.DigiYarV7ProductResultProducer.produce('موبایل سامسونگ', { limit: 8 });
const names = results.filter(p => !p.isSearchFallback).map(p => p.name);

assert.ok(names.includes('Samsung Galaxy S25'), 'valid Samsung phone without literal "موبایل" in title must survive');
assert.ok(names.includes('گوشی موبایل سامسونگ Galaxy A56'), 'explicit Samsung phone must survive');
assert.ok(!names.includes('قاب گوشی سامسونگ S25'), 'phone search must reject Samsung case');
assert.ok(!names.includes('شارژر سامسونگ 45 وات'), 'phone search must reject Samsung charger');

console.log('PASS: V7 Product Result Producer strictly separates Samsung phones from accessory-only records.');
