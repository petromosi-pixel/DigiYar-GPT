import assert from 'node:assert/strict';
import fs from 'node:fs';

const input = fs.readFileSync(new URL('../js/v8-hooshyar-input.js', import.meta.url), 'utf8');
const profile = fs.readFileSync(new URL('../js/v8-store-select-sync.js', import.meta.url), 'utf8');
const splash = fs.readFileSync(new URL('../js/v8-splash.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

// Direct Hooshyar search must not be gated by fields in the optional profile card.
assert.ok(input.includes("form.addEventListener('submit'"), 'Hooshyar search form handler must exist');
assert.ok(input.includes('discovery.setSearchContext(q,filters)'), 'Direct Hooshyar query must reach category discovery');
assert.ok(!input.includes('DigiYarValidateRequiredProfileFields'), 'Direct Hooshyar search must not require profile-card completion');

// The profile card must continue handing its criteria to Hooshyar and use Hooshyar's result path.
assert.ok(profile.includes('function launchHooshyar()'), 'Profile-to-Hooshyar handoff must remain available');
assert.ok(profile.includes('smartInput.value=query'), 'Profile criteria must populate Hooshyar input');
assert.ok(profile.includes('searchForm.requestSubmit()'), 'Profile submission must trigger Hooshyar search');
assert.ok(profile.includes("event.target.id!=='profileForm'"), 'Profile form submit delegation must remain scoped');

// Splash lifecycle must enforce a three-second minimum and honor offline state.
assert.ok(splash.includes('var MIN_SPLASH_DURATION = 3000;'), 'Splash minimum duration must be exactly three seconds');
assert.ok(splash.includes('MIN_SPLASH_DURATION - (Date.now() - splashStartedAt)'), 'Splash dismissal must respect elapsed time');
assert.ok(splash.includes('navigator.onLine === false'), 'Splash must remain visible while offline');
assert.ok(!splash.includes('setTimeout(dismissSplash, 1200)'), 'Legacy early-dismiss timer must be removed');

// Versioned URLs and a fresh shell cache prevent stale service-worker assets from masking the fixes.
assert.ok(index.includes('js/v8-splash.js?v=8.0.0-splash.4'), 'Splash asset URL must be cache-busted');
assert.ok(index.includes('js/v8-hooshyar-input.js?v=8.0.0-hooshyar-input.9'), 'Hooshyar input URL must be cache-busted');
assert.ok(index.includes('sw.js?v=8.0.0-offline-shell.44'), 'Service worker registration URL must be versioned');
assert.ok(serviceWorker.includes('digiyar-v8-8.0.0-shell.39'), 'Service worker cache version must be incremented');
assert.ok(serviceWorker.includes('./js/v8-hooshyar-input.js?v=8.0.0-hooshyar-input.9'), 'Updated Hooshyar input must be precached');

console.log('V8 Hooshyar independent search, profile handoff, and 3s splash contract: PASS');
