import assert from 'node:assert/strict';
import fs from 'node:fs';

const sync = fs.readFileSync(new URL('../js/v8-store-select-sync.js', import.meta.url), 'utf8');
const step4 = fs.readFileSync(new URL('../js/v8-step4-final.js', import.meta.url), 'utf8');
const options = fs.readFileSync(new URL('../js/v6-product-options.js', import.meta.url), 'utf8');

assert.ok(sync.includes('var launchInProgress=false'));
assert.ok(sync.includes('if(launchInProgress)return false'));
assert.ok(sync.includes("host.style.setProperty('height',height+'px','important')"));
assert.ok(sync.includes("host.style.setProperty('height','0px','important')"));
assert.ok(sync.includes("host.addEventListener('transitionend',onEnd)"));
assert.ok(sync.includes("host.setAttribute('aria-hidden','true')"));

assert.ok(step4.includes("const S={mobile:[['phones','گوشی موبایل']"));
assert.ok(step4.includes("phones:['نوع استفاده'"));
assert.ok(step4.includes("'mobile-accessories':['نوع استفاده'"));

assert.ok(options.includes("var SUBS={"));
assert.ok(options.includes("mobile:[['phones','گوشی موبایل']"));
assert.ok(options.includes("var USAGE={"));
assert.ok(options.includes("'mobile-accessories':[['daily'"));

console.log('V8 profile handoff, animated collapse, and mobile taxonomy contract: PASS');
