/* DigiYar V6 — Splash lifecycle */
(function () {
  'use strict';

  function dismissSplash() {
    var splash = document.getElementById('splashScreen');
    if (!splash) return;
    splash.classList.add('splash-hidden');
    splash.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      if (splash && splash.parentNode) splash.style.display = 'none';
    }, 450);
  }

  function init() {
    var splash = document.getElementById('splashScreen');
    if (!splash) return;

    splash.setAttribute('aria-hidden', 'false');

    /* Use the splash logo asset at the established path. */
    var logo = splash.querySelector('.v5-splash-logo');
    if (logo) logo.src = './assets/logos/logo.png';

    /* Guarantee exactly four fixed loader circles without touching the rest of the page DOM. */
    var loader = splash.querySelector('.v5-splash-loader');
    if (loader) {
      while (loader.children.length < 4) {
        loader.appendChild(document.createElement('span'));
      }
      while (loader.children.length > 4) {
        loader.removeChild(loader.lastElementChild);
      }
    }

    /* Remove only the legacy logo wrapper if an older cached DOM injects it. */
    var legacyLogo = splash.querySelector('.legacy-splash-logo');
    if (legacyLogo) legacyLogo.remove();

    /* Splash duration and loader cycle are both 3 seconds. */
    window.setTimeout(dismissSplash, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
