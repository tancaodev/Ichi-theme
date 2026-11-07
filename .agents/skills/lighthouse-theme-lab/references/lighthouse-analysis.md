# Lighthouse analysis and comparison

## Evidence order

Use this order so the category score does not dominate the diagnosis:

1. Test context: URL, route, fetch time, form factor, throttling, Lighthouse version, cache state, and authentication/preview state.
2. Numeric metrics: LCP, FCP, TBT, CLS, Speed Index, and INP when present.
3. LCP element and subpart breakdown.
4. Estimated time/byte savings from render blocking, image delivery, unused CSS/JS, caching, legacy JS, and request chains.
5. Main-thread tasks, long tasks, bootup cost, forced reflows, DOM size, and non-composited animation evidence.
6. Request ownership and third-party cost.

Lab TBT is a diagnostic proxy, not field INP. A fast TBT result does not prove good real-user interaction latency.

With `throttlingMethod: simulate`, the headline metric audits are modeled from the trace. Insight breakdowns can use observed trace timings instead. Label both explicitly; a modeled LCP and an observed LCP breakdown are not expected to sum to the same number.

## Interpretation bands

Use Lighthouse/Core Web Vitals bands as triage aids, not guarantees:

| Metric          |      Good | Needs improvement |     Poor |
| --------------- | --------: | ----------------: | -------: |
| LCP             |  <= 2.5 s |          <= 4.0 s |  > 4.0 s |
| CLS             |   <= 0.10 |           <= 0.25 |   > 0.25 |
| INP             | <= 200 ms |         <= 500 ms | > 500 ms |
| TBT (lab proxy) | <= 200 ms |         <= 600 ms | > 600 ms |
| FCP             |  <= 1.8 s |          <= 3.0 s |  > 3.0 s |

Investigate the LCP subparts before recommending a fix:

- high TTFB: document/server/app path;
- high resource-load delay: discovery, priority, render blockers, or client insertion;
- high resource-load duration: media bytes, dimensions, format, CDN/cache, or connection contention;
- high element-render delay: CSS/JS visibility gates, animation, font, or main-thread work.

Do not recommend preload, eager loading, or `fetchpriority="high"` when the report already proves correct discovery and priority. Multiple high-priority candidates can worsen contention.

## Ownership classification

- **Theme-owned:** theme asset URLs such as `/cdn/shop/t/.../assets/...`, selectors/components present in this repo, or inline code traceable to Liquid output.
- **Content-owned:** `/cdn/shop/files/...` media, video size, merchant-selected font/media, or page composition.
- **App/pixel-owned:** Web Pixel Manager (`/cdn/wpm/...`), app proxy/app embed assets, analytics and tag-manager origins.
- **Shopify-owned:** `/cdn/shopifycloud/...`, checkout/portable-wallet/platform scripts.
- **Unknown:** unattributed tasks, document line numbers without captured HTML/source mapping, or browser-extension code.

Document-line forced-reflow locations are not enough to identify the Liquid source. Reproduce with a Performance trace or preserve the served HTML and map the line before editing. Lighthouse's own `_lighthouse-eval.js` should not be treated as theme code.

## Comparing runs

For duplicate versioned/unversioned theme modules, preserve Shopify's `asset_url`
query version. Theme assets are merchant-editable, so content-hashed
filenames alone cannot invalidate edits made after installation. Always reference
assets through `asset_url` and verify both deduplication and cache invalidation,
including dynamically loaded CSS.

Treat runs as directly comparable only when all material conditions match:

- exact route and relevant query parameters;
- mobile vs desktop form factor;
- throttling method and settings;
- Lighthouse major version;
- store data/theme settings and app/pixel state;
- preview mode (development theme via `npm run dev`, unpublished preview, or live);
- cold/warm cache policy and consent state.

Use at least three runs per case and compare medians; five is better for noisy pages. Keep individual values and ranges. Do not describe a single-run difference as a regression or win unless the change is far larger than normal variance and the causal evidence agrees.

## Plan format

For each item record:

| Priority | Evidence | Ownership/confidence | Proposed change | Expected metric | Risk | Verification |
| -------- | -------- | -------------------- | --------------- | --------------- | ---- | ------------ |

Keep configuration/content work separate from source-code work. Put third-party changes in their own coordination bucket.
