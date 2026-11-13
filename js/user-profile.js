/* DigiYar V3 - Smart User Profile */

(function () {
  "use strict";

  const STORAGE_KEY = "digiyar_v3_profile";

  function cleanArray(value) {
    if (Array.isArray(value)) {
      return value.map(String).map(function (item) { return item.trim(); }).filter(Boolean);
    }
    return String(value || "").split(/[،,]/).map(function (item) { return item.trim(); }).filter(Boolean);
  }

  const DigiYarUserProfile = {
    version: "3.0.0",
    save: function (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
    load: function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
      catch (error) { return null; }
    },
    clear: function () { localStorage.removeItem(STORAGE_KEY); },
    getProfile: function () { return this.load(); },
    normalize: function (form) {
      return {
        declared: {
          category: form.category || "general",
          budget: { min: null, max: Number(form.budgetMax) || null },
          priorities: cleanArray(form.priorities),
          usage: String(form.usage || "").trim(),
          requirements: cleanArray(form.requirements),
          constraints: cleanArray(form.constraints)
        },
        learned: {}, context: {}, history: [], version: "3.0.0"
      };
    }
  };

  window.DigiYarUserProfile = DigiYarUserProfile;

  /* V8: derive profile categories from the same canonical business-domain KB used by Hooshyar. */
  function getBusinessDomainKB() {
    const kb = window.DigiYarStoreBusinessDomains;
    return kb && kb.catalog && kb.domainTitles ? kb : null;
  }

  function uniqueCategories(categories) {
    const seen = new Set();
    return (Array.isArray(categories) ? categories : []).filter(function(category) {
      if (!category || !category.id || !category.title || seen.has(category.id)) return false;
      seen.add(category.id);
      return true;
    });
  }

  function getStoreCategoryEntries(storeId) {
    const kb = getBusinessDomainKB();
    if (!kb) return [];
    const store = kb.catalog[String(storeId || "").trim()];
    if (!store || !Array.isArray(store.domains)) return [];
    return uniqueCategories(store.domains.map(function(domainId) {
      const title = kb.domainTitles[domainId] ||
        (kb.byDomain && kb.byDomain[domainId] && kb.byDomain[domainId].title) || "";
      return title ? { id: String(domainId), title: String(title) } : null;
    }).filter(Boolean));
  }

  function getAllCategoryEntries() {
    const kb = getBusinessDomainKB();
    if (!kb) return [];
    const usedDomains = new Set();
    Object.keys(kb.catalog).forEach(function(storeId) {
      const store = kb.catalog[storeId];
      (store && Array.isArray(store.domains) ? store.domains : []).forEach(function(domainId) {
        usedDomains.add(String(domainId));
      });
    });
    return Object.keys(kb.domainTitles).filter(function(domainId) {
      return usedDomains.has(domainId);
    }).map(function(domainId) {
      return { id: domainId, title: String(kb.domainTitles[domainId]) };
    });
  }

  function refreshStoreCategoryMap() {
    const kb = getBusinessDomainKB();
    const categoriesByStore = {};
    if (kb) {
      Object.keys(kb.catalog).forEach(function(storeId) {
        categoriesByStore[storeId] = getStoreCategoryEntries(storeId).map(function(item) {
          return item.title;
        });
      });
    }
    window.DigiYarStoreCategories = categoriesByStore;
    return categoriesByStore;
  }

  function renderStoreCategories(storeSelect, categorySelect) {
    if (!storeSelect || !categorySelect) return;
    const storeId = String(storeSelect.value || "all");
    const entries = storeId === "all" ? getAllCategoryEntries() : getStoreCategoryEntries(storeId);
    const current = categorySelect.value;
    categorySelect.innerHTML = "";

    const first = document.createElement("option");
    first.value = "";
    first.textContent = storeId === "all"
      ? "همه دسته‌بندی‌ها"
      : (entries.length ? "دسته‌بندی را انتخاب کنید" : "دسته‌بندی این فروشگاه در دانش‌نامه ثبت نشده");
    categorySelect.appendChild(first);

    entries.forEach(function(category) {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.title;
      categorySelect.appendChild(option);
    });

    categorySelect.disabled = entries.length === 0;
    if (entries.some(function(item) { return item.id === current; })) categorySelect.value = current;
    refreshStoreCategoryMap();
  }

  function getSelectableStoreEntries() {
    const kb = getBusinessDomainKB();
    const stores = window.DigiYarPopularAffiliateStores;
    const result = [];
    const seen = new Set();
    function add(store) {
      if (!store || !store.id || !store.name) return;
      const id = String(store.id);
      if (seen.has(id)) return;
      seen.add(id);
      result.push({ id: id, name: String(store.name) });
    }
    (Array.isArray(stores) ? stores : []).forEach(add);
    if (kb) Object.keys(kb.catalog).forEach(function(id) {
      const store = kb.catalog[id];
      if (store && store.name) add({ id: id, name: store.name });
    });
    return result;
  }
  window.DigiYarGetSelectableStores = getSelectableStoreEntries;

  function syncStoreSelectWithPopularStores() {
    const storeSelect = document.getElementById("storeSelect");
    const stores = getSelectableStoreEntries();
    if (!storeSelect || !Array.isArray(stores) || !stores.length) return false;

    const current = storeSelect.value || "all";
    const seen = new Set();
    storeSelect.innerHTML = "";

    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "همه فروشگاه‌های متصل";
    storeSelect.appendChild(all);

    stores.forEach(function(store){
      if (!store || !store.id || !store.name || seen.has(store.id)) return;
      seen.add(store.id);
      const option = document.createElement("option");
      option.value = String(store.id);
      option.textContent = String(store.name);
      storeSelect.appendChild(option);
    });

    storeSelect.value = seen.has(current) || current === "all" ? current : "all";
    storeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function syncStoreCategories() {
    function renderCurrent() {
      const storeSelect = document.getElementById("storeSelect");
      const categorySelect = document.getElementById("v5Category");
      renderStoreCategories(storeSelect, categorySelect);
    }

    document.addEventListener("change", function(event){
      if (event.target && event.target.id === "storeSelect") {
        /* Let store-specific taxonomy modules apply their deeper verified roots afterwards. */
        setTimeout(renderCurrent, 0);
      }
    });

    function boot() {
      const ready = syncStoreSelectWithPopularStores();
      renderCurrent();
      return ready;
    }

    if (boot()) return;

    let attempts = 0;
    const timer = setInterval(function(){
      attempts += 1;
      if (boot() || attempts >= 50) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncStoreCategories, { once: true });
  else syncStoreCategories();
})();
