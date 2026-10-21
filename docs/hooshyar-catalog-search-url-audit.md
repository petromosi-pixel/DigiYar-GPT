# Hooshyar Catalog-to-Search URL Coverage Audit

Last reviewed: 2026-10-21  
Branch: `main`

## Purpose

The product-category knowledge base contains 120 merchant IDs. The independent URL resolver currently has explicit search-route handlers for 27 IDs, but several handlers still require browser-level destination validation. This audit tracks the gap between merchant eligibility in the KB and a verified, query-bearing destination. A merchant must not be rendered as a product-search result until its route is confirmed to be a real product/category search endpoint.

## Changes made in this pass

- Added a candidate product-search route for `meghdadit` based on the official site's visible product-search interface; the query-parameter behavior still needs runtime confirmation.
- Expanded Meghdad IT's KB terms to cover computers, components, monitors, printers, networking, and digital accessories.
- Added explicit `digital_product` and `digital_accessory` query intents so category matching does not depend only on accidental word overlap.
- Updated cache versions for the KB, resolver, and discovery module.

## Audit summary

- Catalog merchant IDs: 120
- Explicit resolver route IDs: 27
- Catalog IDs without an explicit resolver route: 93
- The Meghdad IT route is present in code but is not counted as end-to-end verified until a browser test confirms that the query opens product results.
- This is a route-coverage audit, not a claim that every listed merchant is relevant to every query.
- Missing routes must be checked individually. Do not invent a URL pattern or substitute a homepage/login/affiliate page for product search.
- Some IDs are travel, education, services, affiliate networks, or furniture specialists; their appropriate search/booking route and supported intents must be reviewed separately.

## Catalog entries still requiring route review

- [ ] `iranmiz` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `partochoob` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `chidahome` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `tidawood` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `neshatrokh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `shavaz` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `daroo-online` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `jeanswest` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `sabzgostar` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `shab` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `safarme` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `eseminar` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `maktabkhooneh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `karnameh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `iransetkor` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `19kala` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `banistyle` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `aysoocollection` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `daru24` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `betadent` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `darupedia` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `darucenter` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `webdaru` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `saba` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `darupost` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `shider` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `jobama` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `flytoday` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `raja` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `siroom` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `roomit` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `classino` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `alocom` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `skyroom` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `faradars` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `faranesh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `toplearn` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `daneshjooyar` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `divar` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `hamrahmechanic` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `khodro45` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `bama` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `aytol` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `emalls` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `kalatik` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `mobile140` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `mobileir` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `kala360` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `mobliran` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `choobineh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `moblmarket` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `digistyle` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `shixon` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `limoo` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `mootanroo` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `zibamoon` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `rojashop` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `safirstore` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `okala` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `ofoghkoroosh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `janbo` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `shahrvand` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `hyperme` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `ofood` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `homeplus` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `sakhtemoononline` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `khaneyeiran` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `sportland` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `iransport` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `sporttime` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `ninimarket` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `ninisite` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `babyland` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `fidibo` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `taaghche` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `book30` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `yadakmarket` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `yadakyar` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `partsaz` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `sheypoor` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `trip` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `flysepehran` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `eghamat24` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `hotelban` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `safarmarket` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `quera` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `roocket` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `sabzlearn` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `hamyarit` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `learnfile` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `azki` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `bimebazar` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `bimeh` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.
- [ ] `kilid` — inspect official destination and confirm a query-bearing route, or explicitly mark as not eligible for product-search results.

## Acceptance criteria

1. Each KB merchant has a recorded status: verified product search, verified service/category search, not applicable to product search, or blocked pending verification.
2. A relevant merchant is eligible only if both its KB evidence and a valid destination exist.
3. Query text is preserved, except documented store-specific query normalization.
4. No fallback to homepage, login, affiliate registration, or speculative URLs for product queries.
5. Test category families independently: digital products, digital accessories, office bags, air purifiers, upholstery cleaning, beauty/health, furniture, travel, education, auto, and services.
6. Compare KB-eligible merchants against resolver-supported merchants so a missing URL cannot silently look like a semantic mismatch.
