/* DigiYar V6 — Digikala mobile taxonomy bridge
 * Explicit path: کالای دیجیتال → موبایل → برند
 * This is UI taxonomy only; product data remains in the Product Index.
 */
(function () {
  "use strict";

  var BRANDS = [
    ["samsung", "سامسونگ"],
    ["xiaomi", "شیائومی"],
    ["apple", "اپل"],
    ["honor", "آنر"],
    ["huawei", "هواوی"],
    ["nokia", "نوکیا"],
    ["motorola", "موتورولا"],
    ["oneplus", "وان‌پلاس"],
    ["realme", "ریلمی"],
    ["poco", "پوکو"]
  ];

  function $(id) { return document.getElementById(id); }

  function active() {
    var store = $("storeSelect");
    var category = $("v5Category");
    var sub = $("v5Subcategory");
    return !!(store && category && sub && store.value === "digikala" && category.value === "digital" && sub.value === "mobile");
  }

  function remove() {
    var old = $("v6DigikalaMobileBrandField");
    if (old) old.remove();
  }

  function render() {
    var box = $("v5DynamicFields");
    if (!box) return;
    remove();
    if (!active()) return;

    var field = document.createElement("label");
    field.id = "v6DigikalaMobileBrandField";
    field.className = "v5-field v5-final-function digiyar-digikala-brand";

    var title = document.createElement("span");
    title.textContent = "برند موبایل";

    var select = document.createElement("select");
    select.id = "v6DigikalaMobileBrand";
    select.setAttribute("aria-label", "برند موبایل");

    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "برند موبایل را انتخاب کنید";
    select.appendChild(placeholder);

    BRANDS.forEach(function (brand) {
      var option = document.createElement("option");
      option.value = brand[0];
      option.textContent = brand[1];
      select.appendChild(option);
    });

    field.appendChild(title);
    field.appendChild(select);
    box.insertBefore(field, box.firstChild);

    select.addEventListener("change", function () {
      select.dataset.selectedBrand = select.value;
      window.DigiYarDigikalaMobileBrand = select.value || "";
    });
  }

  function bind() {
    var store = $("storeSelect");
    var category = $("v5Category");
    var sub = $("v5Subcategory");
    if (!store || !category || !sub) return;

    [store, category, sub].forEach(function (el) {
      if (el.dataset.digikalaMobileBrandBound === "1") return;
      el.dataset.digikalaMobileBrandBound = "1";
      el.addEventListener("change", render);
    });
    render();
  }

  function boot() {
    bind();
    var box = $("v5DynamicFields");
    if (box && window.MutationObserver && !box.dataset.digikalaBrandObserver) {
      box.dataset.digikalaBrandObserver = "1";
      var observer = new MutationObserver(function () { bind(); });
      observer.observe(box, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    setTimeout(boot, 0);
  }

  window.DigiYarDigikalaMobileBrandUI = { render: render, bind: bind };
})();