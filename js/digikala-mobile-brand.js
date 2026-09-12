/* DigiYar V6 — Digikala taxonomy bridge
 * Source: data/digikala-digital-taxonomy-v6.json
 * UI path: فروشگاه → دسته → زیر دسته‌ها → برند
 * For mobile: کالای دیجیتال → موبایل → برند (no legacy mobile-phone / OS layer).
 */
(function () {
  "use strict";

  var DATA_URL = "data/digikala-digital-taxonomy-v6.json?v=6.1.0";
  var state = { tree: null, ready: false };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[c]; }); }
  function active() {
    var store = $("storeSelect"), category = $("v5Category");
    return !!(store && category && store.value === "digikala" && category.value === "digital");
  }
  function children(node) { return node && Array.isArray(node.children) ? node.children : []; }
  function findNode(list, name) {
    for (var i = 0; i < (list || []).length; i++) if (list[i].name === name) return list[i];
    return null;
  }
  function removeOwnFields() {
    document.querySelectorAll("[data-digikala-taxonomy-field='1']").forEach(function (el) { el.remove(); });
  }
  function setOptions(select, nodes, placeholder) {
    select.innerHTML = "<option value=\"\">" + esc(placeholder) + "</option>" + (nodes || []).map(function (n, i) {
      return "<option value=\"" + esc(String(i)) + "\">" + esc(n.name) + "</option>";
    }).join("");
    select.disabled = !(nodes && nodes.length);
  }
  function makeField(id, title, placeholder) {
    var field = document.createElement("label");
    field.id = id;
    field.className = "v5-field v5-final-function digiyar-digikala-taxonomy";
    field.setAttribute("data-digikala-taxonomy-field", "1");
    var span = document.createElement("span"); span.textContent = title;
    var select = document.createElement("select"); select.id = id + "Select";
    var opt = document.createElement("option"); opt.value = ""; opt.textContent = placeholder; select.appendChild(opt);
    field.appendChild(span); field.appendChild(select);
    return { field: field, select: select };
  }
  function getContainer() {
    var box = $("v5DynamicFields");
    if (box) return box;
    return null;
  }
  function render() {
    var box = getContainer();
    var coreSub = $("v5Subcategory");
    if (!box || !coreSub) return;
    removeOwnFields();
    if (!active() || !state.ready) return;

    var grid = coreSub.closest(".form-grid") || box.parentElement;
    var roots = state.tree.categories || [];

    /* Reuse the core subcategory select as the first real Digikala level. */
    setOptions(coreSub, roots, "زیر دسته را انتخاب کنید");
    coreSub.disabled = false;
    coreSub.dataset.digikalaTaxonomy = "root";

    function selectedNode() {
      var idx = parseInt(coreSub.value, 10);
      return Number.isFinite(idx) ? roots[idx] : null;
    }
    function clearAfter(field) {
      var all = document.querySelectorAll("[data-digikala-taxonomy-field='1']");
      var remove = false;
      all.forEach(function (el) { if (remove || el === field) remove = true; if (remove && el !== field) el.remove(); });
    }
    function buildFrom(node, depth, anchor) {
      if (!node) return;
      var kids = children(node);
      if (!kids.length) return;
      var title = depth === 1 ? "زیر دسته" : (depth === 2 ? "زیر دسته دوم" : "برند");
      var made = makeField("v6DigikalaTaxonomy" + depth, title, title + " را انتخاب کنید");
      setOptions(made.select, kids, title + " را انتخاب کنید");
      if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(made.field, anchor.nextSibling);
      else if (grid) grid.appendChild(made.field); else box.appendChild(made.field);
      made.select.addEventListener("change", function () {
        clearAfter(made.field);
        var idx = parseInt(made.select.value, 10);
        var picked = Number.isFinite(idx) ? kids[idx] : null;
        window.DigiYarDigikalaTaxonomy = {
          category: "کالای دیجیتال",
          path: [],
          brand: ""
        };
        var p = selectedNode();
        if (p) window.DigiYarDigikalaTaxonomy.path.push(p.name);
        if (depth >= 1 && picked) window.DigiYarDigikalaTaxonomy.path.push(picked.name);
        if (picked && children(picked).length) {
          buildFrom(picked, depth + 1, made.field);
        } else if (picked) {
          window.DigiYarDigikalaTaxonomy.brand = picked.name;
        }
      });
    }

    coreSub.onchange = function () {
      removeOwnFields();
      var node = selectedNode();
      window.DigiYarDigikalaTaxonomy = { category: "کالای دیجیتال", path: node ? [node.name] : [], brand: "" };
      buildFrom(node, 1, coreSub.closest("label") || coreSub);
    };

    /* Mobile must go directly to brand. */
    if (roots[0] && roots[0].name === "موبایل") {
      var mobile = roots[0];
      if (mobile.children && mobile.children.length) {
        /* no extra intermediate layer */
      }
    }
    window.DigiYarDigikalaTaxonomy = { category: "کالای دیجیتال", path: [], brand: "" };
  }
  function load() {
    fetch(DATA_URL, { cache: "reload" }).then(function (r) { if (!r.ok) throw new Error("taxonomy " + r.status); return r.json(); }).then(function (json) {
      state.tree = json; state.ready = true; render();
    }).catch(function (err) { console.warn("DigiYar Digikala taxonomy load failed", err); });
  }
  function bind() {
    var store = $("storeSelect"), category = $("v5Category");
    if (!store || !category) return;
    [store, category].forEach(function (el) {
      if (el.dataset.digikalaTaxonomyBound === "1") return;
      el.dataset.digikalaTaxonomyBound = "1";
      el.addEventListener("change", function () { setTimeout(render, 0); });
    });
    var sub = $("v5Subcategory");
    if (sub && sub.dataset.digikalaTaxonomyBridgeBound !== "1") {
      sub.dataset.digikalaTaxonomyBridgeBound = "1";
      sub.addEventListener("change", function () { setTimeout(render, 0); });
    }
    render();
  }
  function boot() {
    bind();
    load();
    setTimeout(bind, 100);
    setTimeout(bind, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else setTimeout(boot, 0);

  window.DigiYarDigikalaMobileBrandUI = { render: render, bind: bind };
})();
