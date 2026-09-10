/* DigiYar V6 — final splash asset guard */
(function () {
  'use strict';

  var SPLASH_ASSET = 'assets/logos/Splash%20logo.png';

  function removeLegacyPreview() {
    var selectors = [
      '#splashPreview',
      '#preSplashLogo',
      '.legacy-splash-logo',
      '.splash-logo-assembly',
      'body > img'
    ];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
    });
  }

  function enforceSplashLogo() {
    var logo = document.querySelector('#splashScreen .v5-splash-logo');
    if (!logo) return;
    if (logo.getAttribute('src') !== SPLASH_ASSET) {
      logo.setAttribute('src', SPLASH_ASSET);
    }
    logo.style.visibility = 'visible';
    logo.style.opacity = '1';
  }

  function apply() {
    removeLegacyPreview();
    enforceSplashLogo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  window.setTimeout(apply, 100);
  window.setTimeout(apply, 500);
  window.setTimeout(apply, 1200);
})();
