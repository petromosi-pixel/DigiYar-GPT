# Hooshyar Catalog-to-Search URL Coverage Audit

Last reviewed: 2026-10-21  
Branch: `main`

## Purpose

The catalog is the single source for merchant identity, business domains, product/category signals, and general-versus-specialist classification. The URL resolver is a separate concern: it maps a relevant catalog merchant to a query-specific official destination. A store can be relevant and correctly categorized even while its route remains unconfigured or unverified.

## Current static coverage

- Catalog entries: 120
- IDs with an explicit resolver handler: 26
- IDs without an explicit resolver handler: 94
- Important: an explicit handler is **not** proof of a working destination. Some handlers are intentionally fail-closed for unsupported queries, and configured URLs still need browser-level validation.
- Counts are based on static source inspection of `store-business-domains.js` and `v7-store-search-url.js`, not end-to-end browser tests.
- Stores may appear in multiple domain groups; each store ID is unique in the catalog but can have multiple business domains.

## Changes in this pass

- Hooshyar's category labels now prefer the canonical `domainTitles` dictionary from the catalog KB instead of maintaining a second competing title source.
- The discovery module exposes `auditCatalogRoutes()`, which reports handler coverage by business domain.
- Query resolution now distinguishes catalog-eligible stores from eligible stores whose route handler is still missing. This makes the gap inspectable without falsely classifying a store as irrelevant.
- Resolver exposes `hasHandler()` and `handlerIds()` for coverage auditing.
- Cache references were bumped in `index.html`.

## Remaining route-handler gaps, grouped by business domain

The lists below are missing resolver handlers, not irrelevant merchants. A merchant can occur in multiple groups when its catalog entry spans multiple domains. Do not add a route until the official destination and query behavior are confirmed. For services, use a matching service/booking/search flow rather than a generic product search.

### دیجیتال و موبایل — 8 فروشگاه

- [ ] `19kala` — ۱۹کالا
- [ ] `divar` — دیوار
- [ ] `emalls` — ایمالز
- [ ] `kalatik` — کالاتیک
- [ ] `mobile140` — موبایل ۱۴۰
- [ ] `mobileir` — موبایل‌آی‌آر
- [ ] `kala360` — کالا۳۶۰
- [ ] `sheypoor` — شیپور

### مبلمان و دکوراسیون — 9 فروشگاه

- [ ] `iranmiz` — ایران میز
- [ ] `partochoob` — پرتوچوب
- [ ] `chidahome` — چیدا هوم
- [ ] `tidawood` — تیدا چوب
- [ ] `iransetkor` — ایران ستکور
- [ ] `mobliran` — مبل ایران
- [ ] `choobineh` — چوبینه
- [ ] `moblmarket` — مبل مارکت
- [ ] `khaneyeiran` — خانه ایرانی

### پوشاک، کیف و کفش — 9 فروشگاه

- [ ] `jeanswest` — جین وست
- [ ] `banistyle` — بانی استایل
- [ ] `aysoocollection` — آیسو کالکشن
- [ ] `divar` — دیوار
- [ ] `digistyle` — دیجی‌استایل
- [ ] `shixon` — شیکسون
- [ ] `limoo` — لیمو
- [ ] `sportland` — اسپرت‌لند
- [ ] `sheypoor` — شیپور

### زیبایی و آرایشی — 9 فروشگاه

- [ ] `neshatrokh` — نشاط رخ
- [ ] `shavaz` — شاواز
- [ ] `daroo-online` — داروخانه آنلاین
- [ ] `shider` — شیدر
- [ ] `digistyle` — دیجی‌استایل
- [ ] `mootanroo` — مو تن رو
- [ ] `zibamoon` — زیبامون
- [ ] `rojashop` — روژا شاپ
- [ ] `safirstore` — سفیر

### سلامت و محصولات بهداشتی — 16 فروشگاه

- [ ] `neshatrokh` — نشاط رخ
- [ ] `shavaz` — شاواز
- [ ] `daroo-online` — داروخانه آنلاین
- [ ] `daru24` — دارو۲۴
- [ ] `betadent` — بتادنت
- [ ] `darupedia` — داروپدیا
- [ ] `darucenter` — داروسنتر
- [ ] `webdaru` — وب‌دارو
- [ ] `saba` — داروخانه صبا
- [ ] `darupost` — داروپست
- [ ] `shider` — شیدر
- [ ] `mootanroo` — مو تن رو
- [ ] `ninisite` — نی‌نی سایت
- [ ] `azki` — ازکی
- [ ] `bimebazar` — بیمه‌بازار
- [ ] `bimeh` — بیمه

### دارو و تجهیزات سلامت — 8 فروشگاه

- [ ] `daroo-online` — داروخانه آنلاین
- [ ] `daru24` — دارو۲۴
- [ ] `betadent` — بتادنت
- [ ] `darupedia` — داروپدیا
- [ ] `darucenter` — داروسنتر
- [ ] `webdaru` — وب‌دارو
- [ ] `saba` — داروخانه صبا
- [ ] `darupost` — داروپست

### سوپرمارکت و مواد غذایی — 6 فروشگاه

- [ ] `okala` — اکالا
- [ ] `ofoghkoroosh` — افق کوروش
- [ ] `janbo` — جانبو
- [ ] `shahrvand` — شهروند
- [ ] `hyperme` — هایپرمی
- [ ] `ofood` — اوفود

### خانه، آشپزخانه و ساختمان — 17 فروشگاه

- [ ] `iranmiz` — ایران میز
- [ ] `partochoob` — پرتوچوب
- [ ] `chidahome` — چیدا هوم
- [ ] `tidawood` — تیدا چوب
- [ ] `iransetkor` — ایران ستکور
- [ ] `divar` — دیوار
- [ ] `kala360` — کالا۳۶۰
- [ ] `mobliran` — مبل ایران
- [ ] `choobineh` — چوبینه
- [ ] `moblmarket` — مبل مارکت
- [ ] `okala` — اکالا
- [ ] `homeplus` — هوم‌پلاس
- [ ] `sakhtemoononline` — ساختمان آنلاین
- [ ] `khaneyeiran` — خانه ایرانی
- [ ] `ninimarket` — نی‌نی مارکت
- [ ] `sheypoor` — شیپور
- [ ] `kilid` — کلید

### ورزش و تجهیزات ورزشی — 3 فروشگاه

- [ ] `sportland` — اسپرت‌لند
- [ ] `iransport` — ایران اسپرت
- [ ] `sporttime` — اسپرت تایم

### کودک و نوزاد — 3 فروشگاه

- [ ] `ninimarket` — نی‌نی مارکت
- [ ] `ninisite` — نی‌نی سایت
- [ ] `babyland` — بیبی‌لند

### کتاب و محصولات فرهنگی — 3 فروشگاه

- [ ] `fidibo` — فیدیبو
- [ ] `taaghche` — طاقچه
- [ ] `book30` — ۳۰بوک

### خودرو و قطعات یدکی — 6 فروشگاه

- [ ] `divar` — دیوار
- [ ] `bama` — باما
- [ ] `yadakmarket` — یدک مارکت
- [ ] `yadakyar` — یدک‌یار
- [ ] `partsaz` — پارت‌ساز
- [ ] `sheypoor` — شیپور

### خدمات خودرو — 12 فروشگاه

- [ ] `karnameh` — کارنامه
- [ ] `divar` — دیوار
- [ ] `hamrahmechanic` — همراه مکانیک
- [ ] `khodro45` — خودرو۴۵
- [ ] `bama` — باما
- [ ] `aytol` — آیتول
- [ ] `yadakmarket` — یدک مارکت
- [ ] `yadakyar` — یدک‌یار
- [ ] `partsaz` — پارت‌ساز
- [ ] `azki` — ازکی
- [ ] `bimebazar` — بیمه‌بازار
- [ ] `bimeh` — بیمه

### بلیط و حمل‌ونقل — 9 فروشگاه

- [ ] `shab` — شب
- [ ] `safarme` — سفرمی
- [ ] `jobama` — جاباما
- [ ] `flytoday` — فلای‌تودی
- [ ] `raja` — رجا
- [ ] `trip` — تریپ
- [ ] `flysepehran` — فلای سپهران
- [ ] `eghamat24` — اقامت ۲۴
- [ ] `safarmarket` — سفرمارکت

### اقامت و هتل — 5 فروشگاه

- [ ] `shab` — شب
- [ ] `jobama` — جاباما
- [ ] `trip` — تریپ
- [ ] `eghamat24` — اقامت ۲۴
- [ ] `hotelban` — هتل‌بان

### آموزش و یادگیری — 16 فروشگاه

- [ ] `eseminar` — ایسمینار
- [ ] `maktabkhooneh` — مکتب‌خونه
- [ ] `siroom` — سی‌روم
- [ ] `roomit` — رومیت
- [ ] `classino` — کلاسینو
- [ ] `alocom` — الوکام
- [ ] `skyroom` — اسکای‌روم
- [ ] `faradars` — فرادرس
- [ ] `faranesh` — فرانش
- [ ] `toplearn` — تاپ‌لرن
- [ ] `daneshjooyar` — دانشجویار
- [ ] `quera` — کوئرا
- [ ] `roocket` — راکت
- [ ] `sabzlearn` — سبزلرن
- [ ] `hamyarit` — همیار آی‌تی
- [ ] `learnfile` — لرن‌فایل

### شبکه‌های همکاری در فروش — 1 فروشگاه

- [ ] `sabzgostar` — سبز گستر

## Route acceptance criteria

1. Verify the official destination in a browser.
2. Verify that the query or category is actually carried into a useful results page, service page, or booking flow.
3. Preserve the user's product/service intent; only simplify the query when a merchant's behavior is known to require it.
4. Do not fall back to a homepage, login, affiliate registration, or unrelated landing page when a search route is missing.
5. Distinguish merchant type: marketplace, price-comparison engine, product specialist, travel/booking service, education service, auto service, property listing, and affiliate network.
6. Test query families independently and inspect actual destination pages before marking a route verified.
