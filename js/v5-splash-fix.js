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

    /* Use ONLY the current splash/app icon. Never swap to the legacy logo. */
    var logo = splash.querySelector('.v5-splash-logo');
    if (logo) {
      logo.src = './icon/icon-512.png';
      logo.removeAttribute('srcset');
      logo.decoding = 'async';
    }

    var loader = splash.querySelector('.v5-splash-loader');
    if (loader) {
      while (loader.children.length < 4) loader.appendChild(document.createElement('span'));
      while (loader.children.length > 4) loader.removeChild(loader.lastElementChild);
    }

    var legacyLogo = splash.querySelector('.legacy-splash-logo');
    if (legacyLogo) legacyLogo.remove();

    /* Splash remains 3 seconds; install prompt waits 5 seconds after this ends. */
    window.setTimeout(dismissSplash, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
