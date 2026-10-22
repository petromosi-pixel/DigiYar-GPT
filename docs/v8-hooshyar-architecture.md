# DigiYar V8 — Hooshyar Architecture

## Active Hooshyar path

The production page loads the V8 search chain in this order:

1. `js/v8-store-catalog.js` — canonical merchant catalog, business domains, product families, aliases, and general/specialist classification.
2. `js/v8-store-search-url.js` — verified query-specific search routes plus an explicitly classified official-homepage fallback.
3. `js/v8-hooshyar-input.js` — search-input/UI wiring.
4. `js/v8-hooshyar-engine.js` — query normalization, local semantic alias expansion, catalog-wide scoring, exclusions, and result rendering.
5. `css/v8-hooshyar.css` — Hooshyar result/category-card styling.

The active references are in `index.html`; the service-worker cache key is versioned in `sw.js`.

## Extending the catalog

Add a merchant to the canonical `C` catalog in `js/v8-store-catalog.js`. Declare as much verified information as possible:

- `homepage`: official HTTPS homepage;
- `domains`: the merchant's actual business domains;
- `products`: product/service families it demonstrably supports;
- `aliases`: alternate names and category wording;
- `exclude`: queries the merchant must not match;
- `hooshyarExcludeConcepts`: explicit exceptions for narrowly defined concepts.

Eligibility is derived from these catalog declarations; product-specific merchant ID whitelists were removed from the mobile-accessories, train-ticket, sunscreen, and kitchen-scale paths. The general-marketplace fallback remains intentionally limited to the canonical general marketplaces so that classified ads, discount sites, and unrelated multi-category stores do not flood ordinary product searches.

## Adding vocabulary

Add colloquial spellings, synonyms, and product-family aliases to `SEMANTIC_ALIASES` in `js/v8-hooshyar-engine.js`. Keep the alias expansion local and deterministic; do not add merchant-specific branches when a catalog declaration can express the same capability.

A match should be justified by the product family and the merchant's business domain, not by a weak incidental token such as a room, use-case, or broad category word.

## Search destinations

The URL resolver is deliberately separate from merchant relevance:

- `search`: a configured query-specific route;
- `homepage_fallback`: the merchant remains visible if relevant, but the destination is not represented as a verified direct search page.

Do not silently drop a relevant catalog merchant merely because its direct search route has not yet been verified. Do not label a homepage fallback as a direct search result.

## Regression checks

Run:

```sh
npm run test:v8:hooshyar
```

For a live external-destination smoke test (which may be blocked by individual merchants), run:

```sh
npm run test:v8:store-search-routes:live
```

The `Hooshyar V8 regression` GitHub Actions workflow runs the deterministic regression suite on relevant changes. The legacy V6 search-core workflow is now manual-only so it cannot compete with V8 checks on every `main` push.

## Retired detached Hooshyar code

The unreferenced three-engine/comparison files, old standalone Hooshyar test page, and Final2-only regression workflow were removed from `main`. The backup branch `DigiYar-V7-RealFinal` preserves the repository state from before this migration.
