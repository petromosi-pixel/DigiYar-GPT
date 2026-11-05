/* DigiYar V8 — announce readiness after ordered deferred app scripts */
(function () {
  "use strict";
  window.dispatchEvent(new Event("digiyar:app-ready"));
})();
