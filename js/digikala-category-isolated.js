/* DigiYar V6 — isolated Digikala taxonomy renderer
 * Defensive by design: never owns or disables the main profile form.
 */
(function () {
  "use strict";
  try {
    var DATA = window.DigiYarDigikalaCategoryTree;
    if (!DATA || !Array.isArray(DATA.root)) return;

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
          removeGeneratedAfter(level);
          var next = findNode(children, field.select.value);
          if (next) renderFrom(level + 1, next);
        } catch (error) {
          console.warn("DigiYar Digikala taxonomy renderer:", error);
          removeGeneratedAfter(level);
        }
      });
    }

    function removeGeneratedAfter(level) {
      var box = getContainer();
      if (!box) return;
      box.querySelectorAll(".digiyar-digikala-generated").forEach(function (el) {
        var current = Number(el.getAttribute("data-digikala-level"));
        if (current >= level) el.remove();
      });
    }

    function bind() {
      var store = document.getElementById("storeSelect");
      var category = document.getElementById("v5Category");
      if (!store || !category || store.dataset.digikalaIsolatedBound === "1") return;
      store.dataset.digikalaIsolatedBound = "1";
      category.dataset.digikalaIsolatedBound = "1";

      function refresh() {
        try {
          removeGenerated();
          if (store.value !== "digikala") return;
          var node = getRootNode(category.value);
          if (node) renderFrom(1, node);
        } catch (error) {
          console.warn("DigiYar Digikala taxonomy renderer:", error);
          removeGenerated();
        }
      }
      store.addEventListener("change", refresh);
      category.addEventListener("change", refresh);
    }

    window.DigiYarDigikalaIsolated = { bind: bind, refresh: function () { bind(); } };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
    else bind();
  } catch (error) {
    console.warn("DigiYar isolated Digikala taxonomy disabled:", error);
  }
})();