import assert from 'node:assert/strict';
import fs from 'node:fs';

const sync = fs.readFileSync(new URL('../js/v8-store-select-sync.js', import.meta.url), 'utf8');
const step4 = fs.readFileSync(new URL('../js/v8-step4-final.js', import.meta.url), 'utf8');
const options = fs.readFileSync(new URL('../js/v6-product-options.js', import.meta.url), 'utf8');

assert.match(sync, /var launchInProgress=false/);
assert.match(sync, /if\(launchInProgress\)return false/);
assert.match(sync, /profileHost\.hidden=true/);
assert.match(sync, /profileHost\.setAttribute\('aria-hidden','true'\)/);

assert.match(step4, /const S=\{mobile:\[\['phones','گوشی موبایل'\]/);
assert.match(step4, /phones:\['نوع استفاده'/);
assert.match(step4, /'mobile-accessories':\['نوع استفاده'/);

assert.match(options, /var SUBS=\{\s*mobile:\[\['phones','گوشی موبایل'\]/);
assert.match(options, /var USAGE=\{\s*phones:/);
assert.match(options, /'mobile-accessories':\[\['daily'/);

console.log('V8 profile handoff and mobile taxonomy contract: PASS');
