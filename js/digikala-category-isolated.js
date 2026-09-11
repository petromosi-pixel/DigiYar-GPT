/* DigiYar V6 — isolated Digikala taxonomy compatibility layer
 * The Step-4 controller owns the visible hierarchy:
 * فروشگاه → دسته‌بندی → زیر دسته → برند
 *
 * For the current Digikala test, the intended path is:
 * کالای دیجیتال → موبایل → برند (مثلاً شیائومی)
 *
 * The previous renderer created a second, independent taxonomy field from
 * the old root "موبایل و کالای دیجیتال" tree. That caused mobile/digital to
 * appear as parallel categories. Keep this module as a safe no-op so legacy
 * script loading cannot create a duplicate hierarchy.
 */
(function () {
  "use strict";

  function noop() {}

  window.DigiYarDigikalaIsolated = {
    bind: noop,
    refresh: noop,
    load: function () { return Promise.resolve(); }
  };
})();
