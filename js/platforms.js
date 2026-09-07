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
{id:'digikala',name:'دیجی‌کالا',tagline:'لبخند به خانه می‌رسد',logo:'assets/digikala.png',mark:'DK',url:'https://www.digikala.com/'},
{id:'snappshop',name:'اسنپ‌شاپ',tagline:'خرید آنلاین، ساده و سریع',logo:'assets/snappshop.png',mark:'SS',url:'https://snapp.shop/'},
{id:'torob',name:'ترب',tagline:'بهترین قیمت بازار',logo:'assets/torob.png',mark:'TR',url:'https://torob.com/'},
{id:'basalam',name:'باسلام',tagline:'بازار بی‌مرز',logo:'assets/basalam.png',mark:'BS',url:'https://basalam.com/'},
{id:'khanoumi',name:'خانومی',tagline:'به خاطر خودت',logo:'assets/v6-stores/khanoumi.svg',mark:'خ',url:'https://www.khanoumi.com/'},
{id:'banimode',name:'بانی‌مد',tagline:'شعبه رسمی آنلاین برندها',logo:'assets/v6-stores/banimode.svg',mark:'BM',url:'https://www.banimode.com/'},
{id:'modiseh',name:'مدیسه',tagline:'او می‌خواهد دوست خوش‌سلیقه شما باشد',logo:'assets/v6-stores/modiseh.svg',mark:'MD',url:'https://www.modiseh.com/'},
{id:'esam',name:'ایسام',tagline:'بازار امن خرید، فروش و مزایده آنلاین',logo:'assets/v6-stores/esam.svg',mark:'ES',url:'https://esam.ir/'},
{id:'pinket',name:'پینکت',tagline:'Whatever You Like!',logo:'assets/v6-stores/pinket.svg',mark:'PK',url:'https://pinket.com/'},
{id:'darukade',name:'داروکده',tagline:'همراهت در مسیر آگاهی و مراقبت از سلامت',logo:'assets/v6-stores/darukade.svg',mark:'DKD',url:'https://www.darukade.com/'},
{id:'darmankala',name:'درمان‌کالا',tagline:'مرجع تخصصی بررسی و فروش کالای پزشکی',logo:'assets/v6-stores/darmankala.svg',mark:'TK',url:'https://darmankala.com/'},
{id:'digido',name:'دیجی‌دو',tagline:'موبایل و لوازم جانبی',logo:'assets/v6-stores/digido.svg',mark:'D2',url:'https://www.digido.ir/'},
{id:'janebi',name:'جانبی',tagline:'فروشگاه اینترنتی لوازم جانبی',logo:'assets/v6-stores/janebi.svg',mark:'JN',url:'https://janebi.com/'},
{id:'takhfifan',name:'تخفیفان',tagline:'بهترم میشه',logo:'assets/v6-stores/takhfifan.svg',mark:'TF',url:'https://takhfifan.com/'},
{id:'shab',name:'شب',tagline:'رزرو اقامتگاه در شمال و سراسر ایران',logo:'assets/v6-stores/shab.svg',mark:'شب',url:'https://www.shab.ir/'}
];
window.DigiYarPlatforms=platforms;
window.DigiYarPopularAffiliateStores=popularAffiliateStores;
function styles(){if(document.getElementById('v6-store-brand-style'))return;const s=document.createElement('style');s.id='v6-store-brand-style';s.textContent='.platform-logo img{width:100%;height:100%;object-fit:contain;border-radius:12px}.platform-mark{align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:900;line-height:1;color:#2a4169;direction:ltr}.v6-dark .platform-mark{color:#172033}.v6-dark .platform-logo{background:#f8fafc!important;border-color:#475569!important}.platform-main{min-width:0}.platform-name{display:block}.platform-tagline{display:block;margin-top:3px;font-size:10px;line-height:1.45;color:#65748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.v6-dark .platform-tagline{color:#aebbd0}.v6-store-deal{cursor:pointer;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:18px!important;box-sizing:border-box;min-height:100%;height:100%;background:linear-gradient(145deg,#fff,#f5f8fd);border:1px solid #dce5f1;border-radius:18px;overflow:hidden}.v6-store-deal .v6-store-deal-logo{width:min(62%,170px);height:clamp(72px,11vw,125px);object-fit:contain;border-radius:16px;background:#fff;padding:10px;box-sizing:border-box;box-shadow:0 8px 24px rgba(24,39,70,.10)}.v6-store-deal .v6-store-deal-name{font-size:clamp(19px,3vw,27px);font-weight:900;color:#182746}.v6-store-deal .v6-store-deal-tagline{font-size:clamp(12px,1.8vw,15px);line-height:1.7;color:#65748b;max-width:94%;min-height:24px}.v6-store-deal .v6-store-deal-badge{display:none}.v6-dark .v6-store-deal{background:linear-gradient(145deg,#1b2941,#152238);border-color:#354766}.v6-dark .v6-store-deal .v6-store-deal-name{color:#eef4ff}.v6-dark .v6-store-deal .v6-store-deal-tagline{color:#aebbd0}.v6-store-deal .v6-store-deal-logo{flex-shrink:0}';document.head.appendChild(s)}
function renderPopularStores(){const grid=document.getElementById('platforms');if(!grid)return;grid.innerHTML=popularAffiliateStores.map(store=>`<a class="platform" href="${store.url}" target="_blank" rel="noopener noreferrer" data-store="${store.id}" aria-label="ورود به ${store.name}"><div class="platform-main"><span class="platform-logo" aria-hidden="true"><img src="${store.logo}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="platform-mark" style="display:none">${store.mark}</span></span><span class="platform-name">${store.name}</span><span class="platform-tagline">${store.tagline}</span></div><span class="platform-btn">ورود به فروشگاه</span></a>`).join('');styles()}
function renderAffiliateSlides(){const track=document.getElementById('v5DealTrack');if(!track)return;styles();const existing=[...track.querySelectorAll('.v5-deal')];const byId=new Map(existing.map(c=>[c.dataset.store,c]));const affiliateUrls={digikala:'https://aflo.ir/1GS4wzEjY',snappshop:'https://aflo.ir/13iJlKJaK',torob:'',basalam:''};popularAffiliateStores.forEach(store=>{let card=byId.get(store.id);if(!card){card=document.createElement('article');card.className='v5-deal v5-deal-affiliate v6-store-deal';card.dataset.store=store.id;card.dataset.affiliateUrl=store.url;card.setAttribute('role','link');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`ورود به ${store.name}`);track.appendChild(card)}else{card.classList.add('v6-store-deal');if(affiliateUrls[store.id]!==undefined)card.dataset.affiliateUrl=affiliateUrls[store.id]}card.innerHTML=`<img class="v6-store-deal-logo" src="${store.logo}" alt="لوگوی ${store.name}" loading="lazy" decoding="async"><div class="v6-store-deal-name">${store.name}</div><div class="v6-store-deal-tagline">${store.tagline}</div>`})}
function init(){styles();renderPopularStores();renderAffiliateSlides()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
