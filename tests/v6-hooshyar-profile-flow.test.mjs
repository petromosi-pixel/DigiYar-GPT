import assert from 'node:assert/strict';
import fs from 'node:fs';

const sync = fs.readFileSync('js/store-select-sync.js', 'utf8');
const browser = fs.readFileSync('js/v6-store-browser.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const options = fs.readFileSync('js/v6-product-options.js', 'utf8');

const profileBlock = sync.match(/function profileParts\(\)\{([\s\S]*?)\n  \}/)?.[1] || '';
assert.deepEqual(
  [...profileBlock.matchAll(/optionText\('([^']+)'\)/g)].map((m) => m[1]),
  ['v5Subcategory', 'v6Brand', 'v6BudgetRange', 'v6Usage'],
  'Hooshyar profile query must read exactly the four requested fields in order',
);
assert.ok(!profileBlock.includes('storeSelect'), 'store selector must not enter Hooshyar query');
assert.ok(!profileBlock.includes('v5Category'), 'category must not enter Hooshyar query');

assert.match(sync, /function profileQuery\(\)[\s\S]*?profileParts\(\)\.join\(' '\)/);
assert.match(sync, /function profileComplete\(\)[\s\S]*?v5Subcategory[\s\S]*?v6Brand[\s\S]*?v6BudgetRange[\s\S]*?v6Usage/);
assert.match(sync, /function launchHooshyar\(\)[\s\S]*?var query=profileQuery\(\)/);
assert.match(sync, /loadStoreBrowser\(function\(browser\)\{[\s\S]*?browser\.open\(query\)/);
assert.match(sync, /browser\.open\(query\)/);
assert.match(sync, /js\/v6-store-browser\.js\?v=6\.0\.0-store-browser\.16/);
assert.ok(!sync.includes('fetch('), 'profile flow must not call Search Core or an API directly');
assert.ok(!sync.includes('/api/search'), 'profile flow must not depend on the Search Core API');
assert.match(sync, /oldResults\.remove\(\)/);
assert.match(sync, /oldSimulator\.remove\(\)/);
assert.match(sync, /scrollIntoView\(\{behavior:'smooth',block:'start'\}\)/);

assert.match(browser, /function openBrowser\(query,list\)/);
assert.match(browser, /list=Array\.isArray\(list\)\?list:stores\(\)/);
assert.match(browser, /window\.DigiYarStoreBrowser=\{version:VERSION,open:openBrowser\}/);
assert.match(browser, /id='v6StoreSimulatorResults'/);
assert.ok(browser.includes('DigiYarStoreEligibility.storesForQuery'), 'Store Browser must apply query-driven store eligibility');
assert.ok(!/const LIVE=/.test(browser), 'Store Browser must not retain the retired LIVE/Search Core architecture');
assert.ok(!browser.includes('/api/search'), 'Store Browser must not depend on the Search Core API');
assert.ok(!/iframe\s+class=["']v6-auto-frame["']/.test(browser), 'Store Browser must not depend on iframe rendering');
assert.ok(browser.includes('SEARCH['), 'Store Browser must map the query to store search URLs');
assert.match(browser, /technolife:q=>'https:\/\/www\.technolife\.com\/product\/list\/search\?keywords='\+encodeURIComponent\(q\)/, 'Technolife must use its real product search URL');
assert.ok(!browser.includes('/api/store-search'), 'Hooshyar Store Browser must not depend on shelved live-store adapter endpoint');
assert.ok(browser.includes('encodeURIComponent(q)'), 'Store Browser must encode the normalized Hooshyar query for store URLs');
assert.ok(browser.includes('function storeSearchQuery(q)'), 'Store Browser must normalize budget/usage text before external store search');
assert.match(browser, /const searchQuery=storeSearchQuery\(query\)/);

assert.match(index, /id="profileForm"/);
assert.match(index, /id="v5SmartSearchInput"/);
assert.match(index, /js\/store-select-sync\.js\?v=/);
assert.match(options, /id=['"]v5Subcategory['"]/);
assert.match(options, /id=['"]v6Brand['"]/);
assert.match(options, /id=['"]v6BudgetRange['"]/);
assert.match(options, /id=['"]v6Usage['"]/);

console.log('V6 Hooshyar profile-flow contract passed: Profile → Query → Store Browser → Simulator');
