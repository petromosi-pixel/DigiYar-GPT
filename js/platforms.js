/* DigiYar V6 — Shopping / Affiliate Platforms */
(function(){
'use strict';
const platforms=[
{id:'digikala',name:'دیجی‌کالا',tag:'خرید هوشمند',logo:'assets/digikala.png',url:'https://www.digikala.com/'},
{id:'snappshop',name:'اسنپ‌شاپ',tag:'خرید آنلاین',logo:'assets/snappshop.png',url:'https://snapp.shop/'},
{id:'torob',name:'ترب',tag:'مقایسه قیمت',logo:'assets/torob.png',url:'https://torob.com/'},
{id:'basalam',name:'باسلام',tag:'بازار آنلاین',logo:'assets/basalam.png',url:'https://basalam.com/'}
];
const popularAffiliateStores=[
{id:'digikala',name:'دیجی‌کالا',tag:'افیلیت • افیلیو',tagline:'لبخند به خانه می‌رسد',logo:'assets/digikala.png',mark:'DK',url:'https://www.digikala.com/'},
{id:'snappshop',name:'اسنپ‌شاپ',tag:'افیلیت • دیما',tagline:'خرید آنلاین، ساده و سریع',logo:'assets/snappshop.png',mark:'SS',url:'https://snapp.shop/'},
{id:'torob',name:'ترب',tag:'مقایسه قیمت',tagline:'بهترین قیمت بازار',logo:'assets/torob.png',mark:'TR',url:'https://torob.com/'},
{id:'basalam',name:'باسلام',tag:'افیلیت • دیما',tagline:'بازار بی‌مرز',logo:'assets/basalam.png',mark:'BS',url:'https://basalam.com/'},
{id:'khanoumi',name:'خانومی',tag:'افیلیت • دیما',tagline:'به خاطر خودت',logo:'assets/v6-stores/khanoumi.svg',mark:'خ',url:'https://www.khanoumi.com/'},
{id:'banimode',name:'بانی‌مد',tag:'افیلیت • دیما',tagline:'شعبه رسمی آنلاین برندها',logo:'assets/v6-stores/banimode.svg',mark:'BM',url:'https://www.banimode.com/'},
{id:'modiseh',name:'مدیسه',tag:'افیلیت • دیما',tagline:'او می‌خواهد دوست خوش‌سلیقه شما باشد',logo:'assets/v6-stores/modiseh.svg',mark:'MD',url:'https://www.modiseh.com/'},
{id:'esam',name:'ایسام',tag:'افیلیت • دیما',tagline:'بازار امن خرید، فروش و مزایده آنلاین',logo:'assets/v6-stores/esam.svg',mark:'ES',url:'https://esam.ir/'},
{id:'pinket',name:'پینکت',tag:'افیلیت • دیما',tagline:'Whatever You Like!',logo:'assets/v6-stores/pinket.svg',mark:'PK',url:'https://pinket.com/'},
{id:'darukade',name:'داروکده',tag:'افیلیت • دیما',tagline:'همراهت در مسیر آگاهی و مراقبت از سلامت',logo:'assets/v6-stores/darukade.svg',mark:'DKD',url:'https://www.darukade.com/'},
{id:'darmankala',name:'درمان‌کالا',tag:'افیلیت • دیما',tagline:'مرجع تخصصی بررسی و فروش کالای پزشکی',logo:'assets/v6-stores/darmankala.svg',mark:'TK',url:'https://darmankala.com/'},
{id:'digido',name:'دیجی‌دو',tag:'افیلیت • دیما',tagline:'موبایل و لوازم جانبی',logo:'assets/v6-stores/digido.svg',mark:'D2',url:'https://www.digido.ir/'},
{id:'janebi',name:'جانبی',tag:'افیلیت • افیلیو',tagline:'فروشگاه اینترنتی لوازم جانبی',logo:'assets/v6-stores/janebi.svg',mark:'JN',url:'https://janebi.com/'},
{id:'takhfifan',name:'تخفیفان',tag:'همکاری در فروش • دیما',tagline:'بهترم میشه',logo:'assets/v6-stores/takhfifan.svg',mark:'TF',url:'https://takhfifan.com/'},
{id:'shab',name:'شب',tag:'همکاری در فروش • دیما',tagline:'رزرو اقامتگاه در شمال و سراسر ایران',logo:'assets/v6-stores/shab.svg',mark:'شب',url:'https://www.shab.ir/'}
];
window.DigiYarPlatforms=platforms;
window.DigiYarPopularAffiliateStores=popularAffiliateStores;
function styles(){if(document.getElementById('v6-store-brand-style'))return;const s=document.createElement('style');s.id='v6-store-brand-style';s.textContent='.platform-logo img{width:100%;height:100%;object-fit:contain;border-radius:12px}.platform-mark{align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:900;line-height:1;color:#2a4169;direction:ltr}.v6-dark .platform-mark{color:#172033}.v6-dark .platform-logo{background:#f8fafc!important;border-color:#475569!important}.v6-store-deal{cursor:pointer;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-align:center;padding:14px!important;box-sizing:border-box}.v6-store-deal .v6-store-deal-logo{width:86px;height:48px;object-fit:contain;border-radius:12px;background:#fff}.v6-store-deal .v6-store-deal-name{font-size:18px;font-weight:900;color:#182746}.v6-store-deal .v6-store-deal-tagline{font-size:11px;line-height:1.55;color:#65748b;max-width:92%;min-height:17px}.v6-store-deal .v6-store-deal-badge{font-size:9px;font-weight:800;color:#2a4169;background:#eef3fa;border:1px solid #dbe4f0;border-radius:999px;padding:3px 8px}.v6-dark .v6-store-deal .v6-store-deal-name{color:#eef4ff}.v6-dark .v6-store-deal .v6-store-deal-tagline{color:#aebbd0}.v6-dark .v6-store-deal .v6-store-deal-badge{color:#e6edf8;background:#263651;border-color:#405575}';document.head.appendChild(s)}
function renderPopularStores(){const grid=document.getElementById('platforms');if(!grid)return;grid.innerHTML=popularAffiliateStores.map(store=>`<a class="platform" href="${store.url}" target="_blank" rel="noopener noreferrer" data-store="${store.id}" aria-label="ورود به ${store.name}"><div class="platform-main"><span class="platform-logo" aria-hidden="true"><img src="${store.logo}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="platform-mark" style="display:none">${store.mark}</span></span><span class="platform-name">${store.name}</span><span class="platform-tag">${store.tag}</span></div><span class="platform-btn">ورود به فروشگاه</span></a>`).join('');styles()}
function renderAffiliateSlides(){const track=document.getElementById('v5DealTrack');if(!track)return;styles();const existing=[...track.querySelectorAll('.v5-deal')];const byId=new Map(existing.map(c=>[c.dataset.store,c]));const affiliateUrls={digikala:'https://aflo.ir/1GS4wzEjY',snappshop:'https://aflo.ir/13iJlKJaK',torob:'',basalam:''};popularAffiliateStores.forEach(store=>{let card=byId.get(store.id);if(!card){card=document.createElement('article');card.className='v5-deal v5-deal-affiliate v6-store-deal';card.dataset.store=store.id;card.dataset.affiliateUrl=store.url;card.setAttribute('role','link');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`ورود به ${store.name}`);track.appendChild(card)}else{card.classList.add('v6-store-deal');if(affiliateUrls[store.id]!==undefined)card.dataset.affiliateUrl=affiliateUrls[store.id]}card.innerHTML=`<img class="v6-store-deal-logo" src="${store.logo}" alt="لوگوی ${store.name}" loading="lazy" decoding="async"><div class="v6-store-deal-name">${store.name}</div><div class="v6-store-deal-tagline">${store.tagline}</div><span class="v6-store-deal-badge">${store.tag}</span>`})}
function init(){styles();renderPopularStores();renderAffiliateSlides()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
