/* DigiYar V6 — custom splash on every app/page entry */
(function () {
  'use strict';

  var SPLASH_ASSET = 'assets/logos/Splash%20logo.png';
  var SHOW_MS = 2200;
  var hideTimer;

  function showSplash() {
    var splash = document.getElementById('splashScreen');
    if (!splash) return;

    var logo = splash.querySelector('.v5-splash-logo');
    if (logo) {
      logo.setAttribute('src', SPLASH_ASSET);
      logo.style.visibility = 'visible';
      logo.style.opacity = '1';
    }

    splash.classList.remove('splash-hidden', 'v5-splash-hidden');
    splash.style.display = 'flex';
    splash.style.visibility = 'visible';
    splash.style.opacity = '1';
    splash.style.pointerEvents = 'auto';

    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      splash.classList.add('splash-hidden');
      splash.style.pointerEvents = 'none';
    }, SHOW_MS);
  }

  function start() {
    showSplash();
    setTimeout(showSplash, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
