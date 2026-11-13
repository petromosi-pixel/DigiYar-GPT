import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const bridge=readFileSync(new URL('../js/v8-membership-access.js',import.meta.url),'utf8');
const account=readFileSync(new URL('../js/v8-account-page.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function createWindow({token='valid-token',response={planId:'professional',planLabel:'حرفه‌ای',subscription:{active:true,startsAt:'2026-11-01T00:00:00Z',endsAt:'2026-12-01T00:00:00Z'},features:[{id:'semantic_product_search',enabled:true}],paymentEnabled:false}}={}){
 const events=[];const w={DigiYarAuth:{getAccessToken:async()=>token},fetch:async()=>({ok:true,json:async()=>response}),CustomEvent:function(name,init){this.type=name;this.detail=init&&init.detail},dispatchEvent:e=>events.push(e),DigiYarMembershipOpen:()=>{w.opened=true}};vm.runInNewContext(bridge,{window:w});return{w,events};
}
test('membership access is read from the authenticated server endpoint and exposes only server entitlements',async()=>{
 const {w}=createWindow();const state=await w.DigiYarMembershipAccess.refresh();
 assert.equal(state.status,'ready');assert.equal(state.planId,'professional');assert.equal(w.DigiYarMembershipAccess.canAccess('semantic_product_search'),true);assert.equal(w.DigiYarMembershipAccess.canAccess('price_stock_alerts'),false);
});
test('missing authentication fails closed and never grants paid features',async()=>{
 const {w}=createWindow({token:null});const state=await w.DigiYarMembershipAccess.refresh();
 assert.equal(state.status,'unauthenticated');assert.equal(w.DigiYarMembershipAccess.canAccess('semantic_product_search'),false);assert.equal(w.DigiYarMembershipAccess.requireFeature('semantic_product_search'),false);assert.equal(w.opened,true);
});
test('unavailable API fails closed instead of trusting a local plan selection',async()=>{
 const {w}=createWindow();w.fetch=async()=>({ok:false,json:async()=>({})});const state=await w.DigiYarMembershipAccess.refresh();
 assert.equal(state.status,'unavailable');assert.equal(w.DigiYarMembershipAccess.canAccess('semantic_product_search'),false);
});
test('account page includes a dedicated subscription tab linked to the upgrade page',()=>{
 assert.match(account,/data-tab="membership">اشتراک/);assert.match(account,/renderMembership\(c\)/);assert.match(account,/data-upgrade-membership/);assert.match(account,/DigiYarMembershipOpen/);
 assert.match(html,/js\/v8-membership-access\.js/);
});
