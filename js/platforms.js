/* DigiYar V6 — Shopping / Affiliate Platforms */
(function(){
  'use strict';

  const platforms=[
    {id:'digikala',name:'دیجی‌کالا',tag:'خرید هوشمند',logo:'assets/digikala.png',url:'https://www.digikala.com/'},
    {id:'snappshop',name:'اسنپ‌شاپ',tag:'خرید آنلاین',logo:'assets/snappshop.png',url:'https://snapp.shop/'},
    {id:'torob',name:'ترب',tag:'مقایسه قیمت',logo:'assets/torob.png',url:'https://torob.com/'},
    {id:'basalam',name:'باسلام',tag:'بازار آنلاین',logo:'assets/basalam.png',url:'https://basalam.com/'}
  ];

  /*
   * Popular affiliate candidates. They stay separate from the connected
   * search list until DigiYar has an approved affiliate URL for each one.
   * For now each card opens the store's own website for registration.
   * Programs and merchant availability can change, so this is a verified
   * working shortlist rather than a claim of an exhaustive market list.
   */
  const popularAffiliateStores=[
    {id:'digikala',name:'دیجی‌کالا',tag:'افیلیت • افیلیو',mark:'DK',url:'https://www.digikala.com/'},
    {id:'snappshop',name:'اسنپ‌شاپ',tag:'افیلیت • دیما',mark:'SS',url:'https://snapp.shop/'},
    {id:'basalam',name:'باسلام',tag:'افیلیت • دیما',mark:'BS',url:'https://basalam.com/'},
    {id:'khanoumi',name:'خانومی',tag:'افیلیت • دیما',mark:'خ',url:'https://www.khanoumi.com/'},
    {id:'banimode',name:'بانی‌مد',tag:'افیلیت • دیما',mark:'BM',url:'https://www.banimode.com/'},
    {id:'modiseh',name:'مدیسه',tag:'افیلیت • دیما',mark:'MD',url:'https://www.modiseh.com/'},
    {id:'esam',name:'ایسام',tag:'افیلیت • دیما',mark:'ES',url:'https://esam.ir/'},
    {id:'pinket',name:'پینکت',tag:'افیلیت • دیما',mark:'PK',url:'https://pinket.com/'},
    {id:'darukade',name:'داروکده',tag:'افیلیت • دیما',mark:'DKD',url:'https://www.darukade.com/'},
    {id:'darmankala',name:'درمان‌کالا',tag:'افیلیت • دیما',mark:'TK',url:'https://darmankala.com/'},
    {id:'digido',name:'دیجی‌دو',tag:'افیلیت • دیما',mark:'D2',url:'https://www.digido.ir/'},
    {id:'janebi',name:'جانبی',tag:'افیلیت • افیلیو',mark:'JN',url:'https://janebi.com/'},
    {id:'takhfifan',name:'تخفیفان',tag:'همکاری در فروش • دیما',mark:'TF',url:'https://takhfifan.com/'},
    {id:'shab',name:'شب',tag:'همکاری در فروش • دیما',mark:'شب',url:'https://www.shab.ir/'}
  ];

  window.DigiYarPlatforms=platforms;
  window.DigiYarPopularAffiliateStores=popularAffiliateStores;

  function renderPopularStores(){
    const grid=document.getElementById('platforms');
    if(!grid)return;
    grid.innerHTML=popularAffiliateStores.map(store=>`<a class="platform" href="${store.url}" target="_blank" rel="noopener noreferrer" data-store="${store.id}" aria-label="ورود به ${store.name}"><div class="platform-main"><span class="platform-logo" aria-hidden="true"><span class="platform-mark">${store.mark}</span></span><span class="platform-name">${store.name}</span><span class="platform-tag">${store.tag}</span></div><span class="platform-btn">ورود به فروشگاه</span></a>`).join('');
    if(!document.getElementById('v6-popular-store-mark-style')){
      const style=document.createElement('style');
      style.id='v6-popular-store-mark-style';
      style.textContent='.platform-mark{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:900;line-height:1;color:#2a4169;direction:ltr}.v6-dark .platform-mark{color:#172033}.v6-dark .platform-logo{background:#f8fafc!important;border-color:#475569!important}';
      document.head.appendChild(style);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderPopularStores,{once:true});
  else renderPopularStores();
})();
