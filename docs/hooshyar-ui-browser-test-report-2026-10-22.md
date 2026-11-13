# Hooshyar V7 — UI and destination smoke-test report

**Test date:** 2026-10-22  
**Branch:** `main`  
**Preview tested:** `https://digi-yar-core-27cojs3xn-digi-yar.vercel.app/`  
**Code under test:** `1776bddccb14dd8370926c6b3ee5fa6fed96f14f` and its ancestors

## Browser UI results

Chromium/Playwright was used to enter real queries into the visible Hooshyar search field, submit them, and inspect the rendered store cards and destinations.

| Query | Store cards shown | Expected specialist results present |
|---|---:|---|
| Air purifier for a bedroom | 4 | General marketplaces only |
| Cleaning a fabric sofa | 4 | No irrelevant furniture stores |
| Tehran–Mashhad train ticket | 3 | Alibaba, Ghasedak24, MrBilit |
| Mobile accessories | 10 | Janebi, DigiDo, DigiLand, GooshiShop, BerozKala, Technolife |
| Samsung phone accessories | 9 | Relevant digital/accessory stores; Janebi excluded |
| Office bag | 7 | Dayan, Janebi, Modiseh plus general marketplaces |
| Sunscreen for dry skin | 9 | Khanoumi, Darukade, Mosbatesabz, SoloKala, DarookhaneOnline |
| Smart kitchen scale | 5 | Technolife plus general marketplaces |

The browser assertions found no missing expected stores in these eight scenarios. The selected general/special tabs were also exercised: each selected type opens its corresponding category accordions on the first click and closes them on the next click. Store logos loaded when the category panels were opened.

**App-side browser errors:** 0 uncaught page errors and 0 failed HTTP resources during the final UI pass.

## Destination checks

The eight UI scenarios exposed 51 destination URLs. Automated browser navigation returned:

- **36** HTTP 200 responses
- **14** HTTP 403 responses
- **1** timeout
- **0** HTTP 404/410 responses

The 14 HTTP 403 responses came from Basalam and SnappShop in this automated test environment. This is an access restriction observed from the test environment, not proof that the links fail for normal visitors; their destination content could not be verified here. Dayan's homepage fallback timed out during the destination check.

Selected direct destinations were content-checked successfully, including Torob's matching search results, DigiDo's search-results page, BerozKala's query-specific results, Modiseh's office-bag search page, Darukade's sunscreen results, and Alibaba's train-ticket page. Other HTTP 200 responses only establish reachability; a generic title or a JavaScript-rendered page is not by itself proof that the intended products appeared.

## Explicit homepage fallbacks

Two relevant stores remain visible with transparent labels because a query-specific route has not been verified:

- **Dayan Shop:** homepage fallback for office-bag queries.
- **DarookhaneOnline:** homepage fallback for sunscreen queries.

The cards display **“صفحهٔ اصلی؛ جست‌وجوی مستقیم تأیید نشده”** so users are not misled into thinking these are direct search-result pages.

## Code and regression checks

- All files in `js/*.js` passed `node --check`.
- `tests/v7-store-search-routes.test.mjs`: PASS
- `tests/v7-store-taxonomy-audit.test.mjs`: PASS
- `tests/v7-store-relevance.test.mjs`: PASS
- `tests/v7-store-search-routes-live.test.mjs`: PASS for its checked direct routes; network failures are reported as unverified rather than treated as route success.
- Fixed the invalid hyphenated object keys in `js/v6-site-taxonomy-overrides.js`, which had caused `SyntaxError: Unexpected token '-'` in the browser.
- Removed requests for absent legacy Hooshyar browser/widget scripts from the current UI path, corrected the app-icon extension, added the three missing hidden-deals SVG assets, and bumped cache versions.
- Homepage fallback routes remain explicitly distinct from verified direct search routes.

## Acceptance status

**Hooshyar UI relevance and interaction checks: PASS for the eight tested scenarios.**  
**Destination verification: PARTIAL**, because Basalam/SnappShop are blocked with HTTP 403 from this test environment, Dayan timed out, and not every 200 response exposes fully inspectable rendered search results to automation.

Do not interpret the HTTP 403s or the Dayan timeout as proof of a code defect; equally, do not claim those destination pages were content-verified. This report records the actual verification boundary before work moves to the revenue-generation phase.
