/* DigiYar V6 — boot bridge for stores #21–#30 */
(function(){'use strict';
var IDS=['shavaz','jeanswest','iseminar','safarme','beruzkala','maktabkhooneh','darooonline','gooshishop','karnameh','solokala'];
var VERSION='6.0.31';
function $(id){return document.getElementById(id)}
function load(id){if(IDS.indexOf(id)<0)return;var c=$('v5Category'),s=$('v5Subcategory'),old=$('v6BrandField');if(c)delete c.dataset['v6_'+id];if(s)delete s.dataset['v6_'+id];if(old)old.remove();var script=document.createElement('script');script.src=new URL('js/v6-stores-21-30-taxonomy.js?store='+encodeURIComponent(id)+'&v='+VERSION+'-'+Date.now(),document.baseURI).href;script.async=false;document.head.appendChild(script)}
function run(){var st=$('storeSelect');if(!st)return setTimeout(run,100);if(!st.dataset.v6Store2130Bound){st.dataset.v6Store2130Bound='1';st.addEventListener('change',function(){load(st.value)})}if(IDS.indexOf(st.value)>=0)setTimeout(function(){load(st.value)},0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
