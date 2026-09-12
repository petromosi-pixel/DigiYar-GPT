/* DigiYar V6 — Digikala taxonomy bridge */
(function () {
  "use strict";
  var DATA_URL = "data/digikala-digital-taxonomy-v6.json?v=6.1.0";
  var state = { tree: null, ready: false };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[c]; }); }
  function active() { var s=$("storeSelect"), c=$("v5Category"); return !!(s&&c&&s.value==="digikala"&&c.value==="digital"); }
  function kids(n) { return n&&Array.isArray(n.children)?n.children:[]; }
  function removeOwn() { document.querySelectorAll("[data-digikala-taxonomy-field='1']").forEach(function(e){e.remove();}); }
  function options(sel,nodes,ph){ sel.innerHTML="<option value=''>"+esc(ph)+"</option>"+(nodes||[]).map(function(n,i){return "<option value='"+i+"'>"+esc(n.name)+"</option>";}).join(""); sel.disabled=!(nodes&&nodes.length); }
  function field(id,title,ph){ var f=document.createElement("label"); f.id=id; f.className="v5-field v5-final-function digiyar-digikala-taxonomy"; f.setAttribute("data-digikala-taxonomy-field","1"); var sp=document.createElement("span"); sp.textContent=title; var se=document.createElement("select"); se.id=id+"Select"; var o=document.createElement("option"); o.value=""; o.textContent=ph; se.appendChild(o); f.appendChild(sp); f.appendChild(se); return {field:f,select:se}; }
  function render(){
    var sub=$("v5Subcategory"), box=$("v5DynamicFields"); if(!sub||!box)return;
    removeOwn();
    if(!active()||!state.ready)return;
    box.innerHTML="";
    var roots=state.tree.categories||[];
    options(sub,roots,"زیر دسته را انتخاب کنید"); sub.disabled=false; sub.dataset.digikalaTaxonomy="root";
    var grid=sub.closest(".form-grid")||box.parentElement;
    function root(){var i=parseInt(sub.value,10);return Number.isFinite(i)?roots[i]:null;}
    function clearAfter(current){var seen=false;document.querySelectorAll("[data-digikala-taxonomy-field='1']").forEach(function(e){if(seen)e.remove();if(e===current)seen=true;});}
    function build(node,depth,anchor,path){
      var list=kids(node); if(!list.length)return;
      var allLeaves=list.every(function(x){return !kids(x).length;});
      var title=allLeaves?"برند":(depth===1?"زیر دسته":("زیر دسته "+depth));
      var made=field("v6DigikalaTaxonomy"+depth,title,title+" را انتخاب کنید");
      options(made.select,list,title+" را انتخاب کنید");
      if(anchor&&anchor.parentElement)anchor.parentElement.insertBefore(made.field,anchor.nextSibling);else grid.appendChild(made.field);
      made.select.addEventListener("change",function(){
        clearAfter(made.field); var i=parseInt(made.select.value,10), picked=Number.isFinite(i)?list[i]:null;
        var nextPath=path.slice(); if(picked)nextPath.push(picked.name);
        window.DigiYarDigikalaTaxonomy={category:"کالای دیجیتال",path:nextPath,brand:(picked&&allLeaves)?picked.name:""};
        if(picked&&!allLeaves)build(picked,depth+1,made.field,nextPath);
      });
    }
    sub.onchange=function(){removeOwn();var n=root();var p=n?[n.name]:[];window.DigiYarDigikalaTaxonomy={category:"کالای دیجیتال",path:p,brand:""};if(n)build(n,1,sub.closest("label")||sub,p);};
    window.DigiYarDigikalaTaxonomy={category:"کالای دیجیتال",path:[],brand:""};
  }
  function load(){fetch(DATA_URL,{cache:"reload"}).then(function(r){if(!r.ok)throw Error("taxonomy "+r.status);return r.json();}).then(function(j){state.tree=j;state.ready=true;render();}).catch(function(e){console.warn("DigiYar Digikala taxonomy load failed",e);});}
  function bind(){var s=$("storeSelect"),c=$("v5Category");if(!s||!c)return;[s,c].forEach(function(e){if(e.dataset.digikalaTaxonomyBound==="1")return;e.dataset.digikalaTaxonomyBound="1";e.addEventListener("change",function(){setTimeout(render,0);});});render();}
  function boot(){bind();load();setTimeout(bind,100);setTimeout(bind,500);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else setTimeout(boot,0);
  window.DigiYarDigikalaMobileBrandUI={render:render,bind:bind};
})();
