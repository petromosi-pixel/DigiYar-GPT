/* DigiYar V6 — Shopping / Affiliate Platforms */
(function(){
  'use strict';

  const platforms=[
    {id:'digikala',name:'دیجی‌کالا',tag:'خرید هوشمند',logo:'assets/digikala.png',url:'https://www.digikala.com/'},
    {id:'snappshop',name:'اسنپ‌شاپ',tag:'خرید آنلاین',logo:'assets/snappshop.png',url:'https://snapp.shop/'},
    {id:'torob',name:'ترب',tag:'مقایسه قیمت',logo:'assets/torob.png',url:'https://torob.com/'},
    {id:'basalam',name:'باسلام',tag:'بازار آنلاین',logo:'assets/basalam.png',url:'https://basalam.com/'}
  ];

  /* Affiliate candidates: until an approved affiliate URL is supplied,
     each card opens the store's own website. */
  const popularAffiliateStores=[
    {id:'digikala',name:'دیجی‌کالا',tag:'افیلیت • افیلیو',tagline:'لبخند به خانه می‌رسد',logo:'assets/digikala.png',mark:'DK',url:'https://www.digikala.com/'},
    {id:'snappshop',name:'اسنپ‌شاپ',tag:'افیلیت • دیما',tagline:'خرید آنلاین، ساده و سریع',logo:'assets/snappshop.png',mark:'SS',url:'https://snapp.shop/'},
    {id:'basalam',name:'باسلام',tag:'افیلیت • دیما',tagline:'بازار بی‌مرز',logo:'assets/basalam.png',mark:'BS',url:'https://basalam.com/'},
    {id:'khanoumi',name:'خانومی',tag:'افیلیت • دیما',tagline:'به خاطر خودت',logo:'assets/v6-stores/khanoumi.svg',mark:'خ',url:'https://www.khanoumi.com/'},
    {id:'banimode',name:'بانی‌مد',tag:'افیلیت • دیما',tagline:'شعبه رسمی آنلاین برندها',logo:'assets/v6-stores/banimode.svg',mark:'BM',url:'https://www.banimode.com/'},
    {id:'modiseh',name:'مدیسه',tag:'افیلیت • دیما',tagline:'مد و زندگی',logo:'assets/v6-stores/modiseh.svg',mark:'MD',url:'https://www.modiseh.com/'},
    {id:'esam',name:'ایسام',tag:'افیلیت • دیما',tagline:'بازار آنلاین کالا',logo:'assets/v6-stores/esam.svg',mark:'ES',url:'https://esam.ir/'},
    {id:'pinket',name:'پینکت',tag:'افیلیت • دیما',tagline:'Whatever You Like!',logo:'assets/v6-stores/pinket.svg',mark:'PK',url:'https://pinket.com/'},
    {id:'darukade',name:'داروکده',tag:'افیلیت • دیما',tagline:'همراهت در مسیر آگاهی و مراقبت از سلامت',logo:'assets/v6-stores/darukade.svg',mark:'DKD',url:'https://www.darukade.com/'},
    {id:'darmankala',name:'درمان‌کالا',tag:'افیلیت • دیما',tagline:'مرجع تخصصی بررسی و فروش کالای پزشکی',logo:'assets/v6-stores/darmankala.svg',mark:'TK',url:'https://darmankala.com/'},
    {id:'digido',name:'دیجی‌دو',tag:'افیلیت • دیما',tagline:'موبایل و لوازم جانبی',logo:'assets/v6-stores/digido.svg',mark:'D2',url:'https://www.digido.ir/'},
    {id:'janebi',name:'جانبی',tag:'افیلیت • افیلیو',tagline:'لوازم جانبی دیجیتال',logo:'assets/v6-stores/janebi.svg',mark:'JN',url:'https://janebi.com/'},
    {id:'takhfifan',name:'تخفیفان',tag:'همکاری در فروش • دیما',tagline:'بهترم میشه',logo:'assets/v6-stores/takhfifan.svg',mark:'TF',url:'https://takhfifan.com/'},
    {id:'shab',name:'شب',tag:'همکاری در فروش • دیما',tagline:'رزرو اقامتگاه در شمال و سراسر ایران',logo:'assets/v6-stores/shab.svg',mark:'شب',url:'https://www.shab.ir/'}
  ];

  window.DigiYarPlatforms=platforms;
  window.DigiYarPopularAffiliateStores=popularAffiliateStores;

  function renderPopularStores(){
    const grid=document.getElementById('platforms');
    if(!grid)return;
    grid.innerHTML=popularAffiliateStores.map(store=>`<a class="platform" href="${store.url}" target="_blank" rel="noopener noreferrer" data-store="${store.id}" aria-label="ورود به ${store.name}"><div class="platform-main"><span class="platform-logo" aria-hidden="true"><img src="${store.logo}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="platform-mark" style="display:none">${store.mark}</span></span><span class="platform-name">${store.name}</span><span class="platform-tag">${store.tag}</span></div><span class="platform-btn">ورود به فروشگاه</span></a>`).join('');
    if(!document.getElementById('v6-popular-store-mark-style')){
      const style=document.createElement('style');
      style.id='v6-popular-store-mark-style';
      style.textContent='.platform-logo img{width:100%;height:100%;object-fit:contain;border-radius:12px}.platform-mark{align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:900;line-height:1;color:#2a4169;direction:ltr}.v6-dark .platform-mark{color:#172033}.v6-dark .platform-logo{background:#f8fafc!important;border-color:#475569!important}';
      document.head.appendChild(style);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderPopularStores,{once:true});
  else renderPopularStores();
})();
