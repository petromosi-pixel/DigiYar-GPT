import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const menu=readFileSync(new URL('../js/v8-menu-page.js',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/v8-membership-plans.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/v8-membership-plans.css',import.meta.url),'utf8');
test('membership is hosted on a separate page, not in the home flow',()=>{
 assert.match(html,/<section id="dyMembershipPage"[^>]*hidden/);
 assert.match(html,/<header class="dy-membership-page-head">[\s\S]*?ارتقای حساب کاربری/);
 assert.ok(html.indexOf('id="dyMembershipPage"')<html.indexOf('id="v7DealsHost"'));
});
test('membership entry is above price hunter in hamburger menu',()=>{
 const entry=menu.indexOf('data-page="membership"'),price=menu.indexOf('data-page="pricewatch"');
 assert.ok(entry>=0&&price>entry);
 assert.match(menu,/key==='membership'[\s\S]*?DigiYarMembershipOpen/);
});
test('results promotion opens a centered dismissible popup after three seconds and navigates to membership',()=>{
 assert.match(js,/setTimeout\(function\(\)\{if\(lastTarget&&lastTarget\.isConnected\)showPromo\(\)\},3000\)/);
 assert.match(js,/setTimeout\(closePromo,10000\)/);
 assert.match(js,/data-membership-popup-close/);
 assert.match(js,/data-open-membership/);
});
test('membership menu entry cycles through five colors and popup is centered',()=>{
 assert.match(menu,/dym-membership-item[\s\S]*?dymMembershipColorFlow/);
 assert.match(css,/\.dy-membership-popup-backdrop\{position:fixed[\s\S]*?place-items:center/);
 assert.match(css,/dyMembershipPopupIn/);
});
test('pricing remains illustrative and no payment is enabled',()=>{
 assert.match(js,/paymentEnabled:false/);
 assert.match(js,/pricingStatus:'illustrative_only'/);
});
