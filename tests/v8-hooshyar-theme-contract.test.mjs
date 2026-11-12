import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = fs.readFileSync('css/digiyar-theme-system.css', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const legacyStyles = [
  'css/v8-base.css',
  'css/v8-splash.css',
  'css/v8-ui.css',
  'css/v8-step4.css',
  'css/v8-step4-toggle-direction.css',
  'css/v8-smart-search.css',
  'css/v8-hooshyar.css'
];
const oldThemePattern = /(?:html\.dark|body\.dark|\[data-theme\s*=\s*["']dark["']\]|html\.v6-dark|body\.v6-dark|\.v6-dark\b|prefers-color-scheme\s*:\s*dark)/i;

assert.match(theme, /body\.v6-dark\s*\{[^}]*background:var\(--dy-bg\)!important/s,
  'The central theme file must replace the legacy page background gradient.');
assert.match(theme, /--dy-surface-raised:/, 'The shared surface tokens must exist.');
assert.match(theme, /\[class\*="-field"\]/, 'Future field components must inherit central dark-mode surface styling.');
assert.match(theme, /\[class\*="-modal"\]/, 'Future modal/window components must inherit central dark-mode surface styling.');
const cleanTheme = theme.replace(/\/\*[\s\S]*?\*\//g, '');
const buttonRules = [...cleanTheme.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selector]) => /(?:^|[\s,(])button(?:[.#:[\s,)>]|$)/i.test(selector) && !/:not\(\s*button/i.test(selector));
assert.ok(buttonRules.every(([, selector, declarations]) => {
  const authoredActionButton = /(?:\.primary|\.v5-primary|\.danger|\.v5-danger|\.popular-discovery-store-link|\.v6-auto-link|\.v5-smart-search-submit|\.v5-smart-search-clear|#installBtn|#v6ThemeToggle)/i.test(selector);
  return !authoredActionButton || !/(?:^|;)\s*(?:background(?:-[\w-]+)?|color|border-color)\s*:/i.test(declarations);
}), 'The central theme must preserve authored brand/action button colors while allowing neutral disclosure controls to follow the theme.');
assert.ok(/css\/digiyar-theme-system\.css\?v=[^"']+/.test(index) && !index.includes('css/digiyar-theme-system.css?v=1.3.8'), 'Central theme stylesheet must use a current cache-busting version rather than the stale pre-adjustment version');
assert.match(index, /css\/digiyar-theme-system\.css\?v=[^"']+/,
  'The app must load the current centralized theme stylesheet with a cache-busting version.');

for (const path of legacyStyles) {
  const css = fs.readFileSync(path, 'utf8');
  assert.doesNotMatch(css, oldThemePattern, path + ' must not retain a separate legacy dark-mode implementation.');
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length,
    path + ' must keep balanced CSS braces after legacy theme cleanup.');
}
const discovery = fs.readFileSync('js/v8-hooshyar-engine.js', 'utf8');
assert.doesNotMatch(discovery, /html\.dark|body\.dark|\[data-theme=["']dark|body\.v6-dark\s+\.v6-auto/,
  'The active store discovery UI must use the central --dy-* theme contract.');
assert.ok(!index.includes('js/v8-comparison-ui.js'),
  'Detached comparison UI must not be loaded into the active V8 application.');
assert.match(theme, /body\.v6-dark #v7PopularStoresHost #platforms \.platform\{[^}]*background:transparent!important;[^}]*border:0!important;/s, 'Popular-store tiles must remain borderless and transparent in dark mode like the category directory.');
const platforms = fs.readFileSync('js/platforms.js', 'utf8');
assert.doesNotMatch(platforms, oldThemePattern,
  'Platform widgets must use the central theme contract rather than embedded dark-mode rules.');

console.log('V8 global theme contract: PASS — page root, shared tokens, future components, button-color preservation, and legacy selector removal.');
