/* DigiYar V6 — isolated Digikala taxonomy renderer
 * Data is local. This module never owns, disables, or blocks the main profile form.
 */
(function () {
  "use strict";
  var DATA = null;
  var DATA_URL = "data/digikala-category-tree.json";

  function childrenOf(node) {
    return node && Array.isArray(node.children) ? node.children : [];
  }

  function normalize(value) {
    return String(value || "").trim().replace(/\u200c/g, " ").replace(/\s+/g, " ");
  }

  function findNode(nodes, name) {
    var wanted = normalize(name);
    if (!wanted || !Array.isArray(nodes)) return null;
    for (var i = 0; i < nodes.length; i += 1) {
      if (normalize(nodes[i] && nodes[i].name) === wanted) return nodes[i];
    }
    return null;
  }

  function getRootNode(categoryValue) {
    if (!DATA || !Array.isArray(DATA.root)) return null;
    var direct = findNode(DATA.root, categoryValue);
    if (direct) return direct;
    var aliases = {
      "موبایل و کالای دیجیتال": "کالای دیجیتال",
      "کودک و نوزاد": "اسباب بازی، کودک و نوزاد"
    };
    return findNode(DATA.root, aliases[normalize(categoryValue)] || "");
  }

  function getContainer() {
    return document.getElementById("v5DynamicFields");
  }

  function removeGenerated() {
    var box = getContainer();
    if (!box) return;
    box.querySelectorAll(".digiyar-digikala-generated").forEach(function (el) { el.remove(); });
  }

  function removeGeneratedAfter(level) {
    var box = getContainer();
    if (!box) return;
    box.querySelectorAll(".digiyar-digikala-generated").forEach(function (el) {
      if (Number(el.getAttribute("data-digikala-level")) >= level) el.remove();
    });
  }

  function makeField(level, children) {
    var wrap = document.createElement("div");
    wrap.className = "digiyar-digikala-generated";
    wrap.setAttribute("data-digikala-level", String(level));
    var select = document.createElement("select");
    select.className = "v5-profile-select";
    select.setAttribute("data-digikala-level", String(level));
    select.setAttribute("aria-label", "زیر دسته دیجی‌کالا، سطح " + level);
    var first = document.createElement("option");
    first.value = "";
    first.textContent = "زیر دسته را انتخاب کنید";
    select.appendChild(first);
    children.forEach(function (child) {
      if (!child || !child.name) return;
      var option = document.createElement("option");
      option.value = child.name;
      option.textContent = child.name;
      select.appendChild(option);
    });
    wrap.appendChild(select);
    return { wrap: wrap, select: select };
  }

  function renderFrom(level, node) {
    removeGeneratedAfter(level);
    var children = childrenOf(node);
    if (!children.length) return;
    var box = getContainer();
    if (!box) return;
    var field = makeField(level, children);
    box.appendChild(field.wrap);
    field.select.addEventListener("change", function () {
      try {
        removeGeneratedAfter(level + 1);
        var next = findNode(children, field.select.value);
        if (next) renderFrom(level + 1, next);
      } catch (error) {
        console.warn("DigiYar Digikala taxonomy renderer:", error);
        removeGeneratedAfter(level + 1);
      }
    });
  }

  function bind() {
    try {
      var store = document.getElementById("storeSelect");
      var category = document.getElementById("v5Category");
      if (!store || !category) return;
      if (store.dataset.digikalaIsolatedBound !== "1") {
        store.dataset.digikalaIsolatedBound = "1";
        store.addEventListener("change", refresh);
      }
      if (category.dataset.digikalaIsolatedBound !== "1") {
        category.dataset.digikalaIsolatedBound = "1";
        category.addEventListener("change", refresh);
      }
      refresh();
    } catch (error) {
      console.warn("DigiYar isolated Digikala taxonomy disabled:", error);
      removeGenerated();
    }
  }

  function refresh() {
    try {
      removeGenerated();
      var store = document.getElementById("storeSelect");
      var category = document.getElementById("v5Category");
      if (!store || !category || store.value !== "digikala" || !DATA) return;
      var node = getRootNode(category.value);
      if (node) renderFrom(1, node);
    } catch (error) {
      console.warn("DigiYar Digikala taxonomy renderer:", error);
      removeGenerated();
    }
  }

  function loadData() {
    return fetch(DATA_URL, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Digikala taxonomy data HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.root)) throw new Error("Invalid Digikala taxonomy data");
        DATA = data;
        window.DigiYarDigikalaIsolatedData = DATA;
        bind();
      })
      .catch(function (error) {
        console.warn("DigiYar Digikala taxonomy data unavailable:", error);
        DATA = null;
      });
  }

  window.DigiYarDigikalaIsolated = {
    bind: bind,
    refresh: refresh,
    load: loadData
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { loadData(); }, { once: true });
  } else {
    loadData();
  }
})();