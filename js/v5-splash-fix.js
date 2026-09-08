/* DigiYar V6 — Splash + store logo asset fix */
(function () {
  'use strict';

  var SPLASH_LOGO = './assets/Splash%20logo.png';
  var STORE_LOGOS = {
    digikala: 'دیجی‌کالا',
    snappshop: 'اسنپ‌شاپ',
    torob: 'ترب',
    basalam: 'باسلام',
    khanoumi: 'خانومی',
    banimode: 'بانی‌مد',
    modiseh: 'مدیسه',
    esam: 'ایسام',
    pinket: 'پینکت',
    darukade: 'داروکده',
    darmankala: 'درمان‌کالا',
    digido: 'دیجی‌دو',
    janebi: 'جانبی',
    takhfifan: 'تخفیفان',
    shab: 'شب'
  };

  function encodeLogoName(name) {
    return 'assets/store-logos/' + encodeURIComponent(name) + '.webp';
  }

  function storeLogoCandidates(id, name) {
    var candidates = [];
    if (name) candidates.push(encodeLogoName(name));
    if (id && STORE_LOGOS[id]) candidates.push(encodeLogoName(STORE_LOGOS[id]));
    if (id) candidates.push('assets/store-logos/' + encodeURIComponent(id) + '.webp');
    return candidates.filter(function (value, index, list) {
      return list.indexOf(value) === index;
    });
  }

  function fixStoreLogo(img) {
    if (!img || img.dataset.digiyarLogoFixed === '1') return;
    var holder = img.closest('.platform');
    if (!holder) return;
    var id = holder.getAttribute('data-store') || '';
    var name = holder.querySelector('.platform-name');
    name = name ? name.textContent.trim() : '';
    var candidates = storeLogoCandidates(id, name);
    if (!candidates.length) return;

    img.dataset.digiyarLogoFixed = '1';
    var index = 0;
    function next() {
      if (index >= candidates.length) return;
      img.src = candidates[index++];
    }
    img.onerror = next;
    next();
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
