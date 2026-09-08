/* DigiYar V6 — Splash + store logo asset fix */
(function () {
  'use strict';

  // Actual asset location in main: assets/logos/Splash logo.png
  var SPLASH_LOGO = './assets/logos/Splash%20logo.png';

  // Use the real filenames/extensions that exist in main.
  // Do not assume every store logo is WebP.
  var STORE_LOGOS = {
    digikala: './assets/store-logos/digikala.png',
    snappshop: './assets/store-logos/snappshop.png',
    torob: './assets/store-logos/torob-1.png',
    basalam: './assets/store-logos/ir.basalam.app-0e50b07e-c466-4c7c-a81e-7bdc9970b43a_512x512.png',
    khanoumi: null,
    banimode: './assets/store-logos/%D8%A8%D8%A7%D9%86%DB%8C%20%D9%85%D8%AF.webp',
    modiseh: './assets/store-logos/%D9%85%D8%AF%DB%8C%D8%B3%D9%87.webp',
    esam: './assets/store-logos/%D8%A7%DB%8C%D8%B3%D8%A7%D9%85.webp',
    pinket: './assets/store-logos/%D9%BE%DB%8C%D9%86%DA%A9%D8%AA.webp',
    darukade: './assets/store-logos/%D8%AF%D8%A7%D8%B1%D9%88%DA%A9%D8%AF%D9%87.webp',
    darmankala: './assets/store-logos/%D8%AF%D8%B1%D9%85%D8%A7%D9%86%20%DA%A9%D8%A7%D9%84%D8%A7.webp',
    digido: './assets/store-logos/%D8%AF%DB%8C%D8%AC%DB%8C%20%D8%AF%D9%88.png',
    janebi: null,
    takhfifan: './assets/store-logos/%D8%AA%D8%AE%D9%81%DB%8C%D9%81%D8%A7%D9%86.webp',
    shab: './assets/store-logos/%D8%B4%D8%A8.webp'
  };

  var STORE_MARKS = {
    khanoumi: 'خ',
    janebi: 'JN'
  };

  function setFallbackMark(img, id) {
    var mark = STORE_MARKS[id];
    if (!mark || !img.parentElement) return;
    img.style.display = 'none';
    var holder = img.parentElement;
    var existing = holder.querySelector('.platform-mark-fallback');
    if (existing) return;
    var span = document.createElement('span');
    span.className = 'platform-mark platform-mark-fallback';
    span.textContent = mark;
    holder.appendChild(span);
  }

  function fixStoreLogo(img) {
    if (!img || img.dataset.digiyarLogoFixed === '1') return;
    var holder = img.closest('.platform');
    if (!holder) return;
    var id = holder.getAttribute('data-store') || '';
    var asset = STORE_LOGOS[id];

    img.dataset.digiyarLogoFixed = '1';
    img.removeAttribute('srcset');
    img.loading = 'lazy';
    img.decoding = 'async';

    if (!asset) {
      setFallbackMark(img, id);
      return;
    }

    img.onerror = function () {
      img.onerror = null;
      setFallbackMark(img, id);
    };
    img.src = asset;
  }

  function fixAllStoreLogos() {
    document.querySelectorAll('.platform-logo img').forEach(fixStoreLogo);
  }

  function installStoreLogoObserver() {
    fixAllStoreLogos();
    var target = document.getElementById('platforms');
    if (!target || !window.MutationObserver) return;
    new MutationObserver(fixAllStoreLogos).observe(target, { childList: true, subtree: true });
  }

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

    var installIcon = document.querySelector('#installPrompt .install-prompt-icon img');
    if (installIcon) {
      installIcon.src = './assets/logos/logo.png';
      installIcon.removeAttribute('srcset');
      installIcon.decoding = 'async';
    }

    var logo = splash.querySelector('.v5-splash-logo');
    if (logo) {
      logo.src = SPLASH_LOGO;
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

    installStoreLogoObserver();
    window.setTimeout(dismissSplash, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
