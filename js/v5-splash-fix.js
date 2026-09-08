/* DigiYar V6 — Splash + store logo asset fix */
(function () {
  'use strict';

  var SPLASH_LOGO = './assets/logos/Splash%20logo.png';
  var INSTALL_LOGO = './icon/icon-192.webp';

  var STORE_LOGOS = {
    digikala: './assets/store-logos/%D8%AF%DB%8C%D8%AC%DB%8C%20%DA%A9%D8%A7%D9%84%D8%A7.webp',
    snappshop: './assets/store-logos/%D8%A7%D8%B3%D9%86%D9%BE%20%D8%B4%D8%A7%D9%BE.webp',
    torob: './assets/store-logos/%D8%AA%D8%B1%D8%A8.webp',
    basalam: './assets/store-logos/%D8%A8%D8%A7%D8%B3%D9%84%D8%A7%D9%85.webp',
    khanoumi: './assets/store-logos/%D8%AE%D8%A7%D9%86%D9%88%D9%85%DB%8C.webp',
    banimode: './assets/store-logos/%D8%A8%D8%A7%D9%86%DB%8C%20%D9%85%D8%AF.webp',
    modiseh: './assets/store-logos/%D9%85%D8%AF%DB%8C%D8%B3%D9%87.webp',
    esam: './assets/store-logos/%D8%A7%DB%8C%D8%B3%D8%A7%D9%85.webp',
    pinket: './assets/store-logos/%D9%BE%DB%8C%D9%86%DA%A9%D8%AA.webp',
    darukade: './assets/store-logos/%D8%AF%D8%A7%D8%B1%D9%88%DA%A9%D8%AF%D9%87.webp',
    darmankala: './assets/store-logos/%D8%AF%D8%B1%D9%85%D8%A7%D9%86%20%DA%A9%D8%A7%D9%84%D8%A7.webp',
    digido: './assets/store-logos/%D8%AF%DB%8C%D8%AC%DB%8C%20%D8%AF%D9%88.png',
    janebi: './assets/store-logos/%D8%AC%D8%A7%D9%86%D8%A8%DB%8C.webp',
    takhfifan: './assets/store-logos/%D8%AA%D8%AE%D9%81%DB%8C%D9%81%D8%A7%D9%86.webp',
    shab: './assets/store-logos/%D8%B4%D8%A8.webp'
  };

  function setFallbackMark(img, id) {
    if (!img || !img.parentElement) return;
    img.style.display = 'none';
    var holder = img.parentElement;
    var existing = holder.querySelector('.platform-mark-fallback');
    if (existing) return;
    var span = document.createElement('span');
    span.className = 'platform-mark platform-mark-fallback';
    span.textContent = (id === 'khanoumi') ? 'خ' : (id === 'janebi' ? 'JN' : '');
    if (!span.textContent) return;
    holder.appendChild(span);
  }

  function fixStoreLogo(img) {
    if (!img) return;
    var holder = img.closest('.platform');
    if (!holder) return;
    var id = holder.getAttribute('data-store') || '';
    var asset = STORE_LOGOS[id];
    if (!asset) return;

    if (img.dataset.digiyarLogoFixed === id && img.getAttribute('src') === asset) return;
    img.dataset.digiyarLogoFixed = id;
    img.removeAttribute('srcset');
    img.loading = 'lazy';
    img.decoding = 'async';
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
    if (document.getElementById('digiyar-install-prompt-animation')) return;
    var style = document.createElement('style');
    style.id = 'digiyar-install-prompt-animation';
    style.textContent = '@keyframes digiyarInstallPromptIn{from{opacity:0;transform:translate3d(-50%,-130%,0)}to{opacity:1;transform:translate3d(-50%,0,0)}}@keyframes digiyarInstallPromptOut{from{opacity:1;transform:translate3d(-50%,0,0)}to{opacity:0;transform:translate3d(-50%,-130%,0)}}#installPrompt.show{animation:digiyarInstallPromptIn .65s cubic-bezier(.22,1,.36,1) both;}#installPrompt.hiding{animation:digiyarInstallPromptOut .65s cubic-bezier(.22,.8,.25,1) both;}#installPrompt .install-prompt-icon{width:44px;height:44px;flex:0 0 44px;border-radius:10px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;}#installPrompt .install-prompt-icon img{width:100%;height:100%;object-fit:contain;padding:0;display:block;}#platforms .platform[data-store="khanoumi"] .platform-logo,#platforms .platform[data-store="janebi"] .platform-logo{padding:2px;border-radius:11px;}#platforms .platform[data-store="khanoumi"] .platform-logo img,#platforms .platform[data-store="janebi"] .platform-logo img{width:100%;height:100%;object-fit:cover;border-radius:8px;}';
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
      installIcon.src = INSTALL_LOGO;
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