import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = fs.readFileSync('css/digiyar-theme-system.css', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const legacyStyles = [
  'css/style.css',
  'css/v5-splash.css',
  'css/v5-ui.css',
  'css/v5-step4.css',
  'css/v5-step4-toggle-direction.css',
  'css/v5-smart-search.css',
  'css/v7-popular-store-discovery.css'
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
assert.ok(buttonRules.every(([, , declarations]) => !/(?:^|;)\s*background(?:-[\w-]+)?\s*:/i.test(declarations)),
  'The central theme must not overwrite authored button backgrounds/colors.');
assert.match(index, /css\/digiyar-theme-system\.css\?v=1\.2\.3/,
  'The app must load the current centralized theme stylesheet with a cache-busting version.');

for (const path of legacyStyles) {
  const css = fs.readFileSync(path, 'utf8');
  assert.doesNotMatch(css, oldThemePattern, path + ' must not retain a separate legacy dark-mode implementation.');
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length,
    path + ' must keep balanced CSS braces after legacy theme cleanup.');
}
const browser = fs.readFileSync('js/v6-store-browser.js', 'utf8');
assert.doesNotMatch(browser, /html\.dark|body\.dark|\[data-theme=["']dark|body\.v6-dark\s+\.v6-auto/,
  'Store Browser must use central --dy-* tokens, not its own dark-mode rules.');
const comparison = fs.readFileSync('js/v7-comparison-ui.js', 'utf8');
assert.doesNotMatch(comparison, oldThemePattern,
  'Comparison UI must use the central theme contract rather than embedded dark-mode rules.');
const platforms = fs.readFileSync('js/platforms.js', 'utf8');
assert.doesNotMatch(platforms, oldThemePattern,
  'Platform widgets must use the central theme contract rather than embedded dark-mode rules.');

console.log('V7 Final2 global theme contract: PASS — page root, shared tokens, future components, button-color preservation, and legacy selector removal.');
