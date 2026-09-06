/* DigiYar V6 — Splash lifecycle */
(function () {
  'use strict';

  function installPromptAnimationFix() {
    var style = document.createElement('style');
    style.id = 'digiyar-install-prompt-animation';
    style.textContent = '@keyframes digiyarInstallPromptIn{from{opacity:0;transform:translate3d(-50%,-130%,0)}to{opacity:1;transform:translate3d(-50%,0,0)}}@keyframes digiyarInstallPromptOut{from{opacity:1;transform:translate3d(-50%,0,0)}to{opacity:0;transform:translate3d(-50%,-130%,0)}}#installPrompt.show{animation:digiyarInstallPromptIn .65s cubic-bezier(.22,1,.36,1) both;}#installPrompt.hiding{animation:digiyarInstallPromptOut .65s cubic-bezier(.22,.8,.25,1) both;}';
    document.head.appendChild(style);
  }

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

    installPromptAnimationFix();

    /* Use the same clean, no-red-circle logo in the install notification. */
    var installIcon = document.querySelector('#installPrompt .install-prompt-icon img');
    if (installIcon) {
      installIcon.src = './assets/logos/logo.png';
      installIcon.removeAttribute('srcset');
      installIcon.decoding = 'async';
    }

    /* Splash uses the clean logo only; never swap between old/new assets. */
    var logo = splash.querySelector('.v5-splash-logo');
    if (logo) {
      logo.src = './assets/logos/logo.png';
      logo.removeAttribute('srcset');
      logo.decoding = 'async';
      logo.loading = 'eager';
    }

    var loader = splash.querySelector('.v5-splash-loader');
    if (loader) {
      while (loader.children.length < 4) loader.appendChild(document.createElement('span'));
      while (loader.children.length > 4) loader.removeChild(loader.lastElementChild);
    }

    var legacyLogo = splash.querySelector('.legacy-splash-logo');
    if (legacyLogo) legacyLogo.remove();

    window.setTimeout(dismissSplash, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
