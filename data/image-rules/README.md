# Image Rules

This directory stores the server-facing image acquisition rules and brand-specific crawl rules for every brand currently used by the site.

## Files

- `index.json`
  - Summary index of all generated brand rule files.
- `brand-methods-summary.json`
  - Machine-readable brand-wide summary for image reacquisition and brand-specific crawl behavior.
- `brand-methods-summary.md`
  - Human-readable lookup table of every brand's image acquisition path and crawl strategy.
- `<brand-slug>.json`
  - One rule file per brand.

## How The Server Should Use These Rules

For each story:

1. Read `acquisition.priority`.
2. If `candidateImageUrl` exists, try that official source URL first.
3. If `candidateImageUrl` is missing or fails, open `sourcePage` and reacquire the image using `acquisition.method`.
4. Save the refreshed image to your own storage such as local disk or COS.
5. Update or preserve the mirrored path referenced in `acquisition.localMirrorPath`.

For each brand:

1. Read `brand-methods-summary.json` or `brand-methods-summary.md`.
2. Confirm the preferred brand-wide method order in `methods`.
3. Read `crawl.mode`, `crawl.entryPages`, and `crawl.notes` to determine how to fetch future news candidates for that brand.
4. Use the per-story `method` and `priority` values as the final execution path for image reacquisition.

## Important Fields

- `brand`
  - Human-readable brand name.
- `slug`
  - File-safe brand key.
- `officialDomains`
  - Official site domains currently used by stories from this brand.
- `strategy.brandLevelMethods`
  - Preferred brand-wide acquisition methods.
- `crawl.mode`
  - Brand-specific news-fetch mode used by the pipeline, such as `nike_trend_pages`, `adidas_home_feed_pages`, or `single_product_page`.
- `crawl.entryPages`
  - The official entry pages that the pipeline should use for future news discovery.
- `crawl.fallbackUrl`
  - Stable brand fallback entry when a configured page disappears or becomes brittle.
- `crawl.notes`
  - Human-readable explanation of the brand-specific news-fetch workflow.
- `stories[].sourcePage`
  - Official page that should be treated as the source of truth.
- `stories[].currentImage`
  - Image currently used by the site.
- `stories[].currentImageMode`
  - `local` means the site is already using a mirrored local asset.
  - `remote` means the site is still using an external official asset URL.
- `stories[].automationStatus`
  - `ready`: rule is usable for automated reacquisition now.
  - `partial`: story is usable, but the reacquisition path may still be weaker or less direct.
  - `needs_replacement`: current image is still a placeholder and should be replaced.
- `stories[].acquisition.method`
  - The main image reacquisition path that is known to work for this story.
- `stories[].acquisition.priority`
  - Ordered fallback strategy list for the server.
- `stories[].acquisition.localMirrorPath`
  - Current local mirror path used by the frontend.
- `stories[].acquisition.candidateImageUrl`
  - Preferred original official image URL when already verified.
- `stories[].acquisition.candidateImageHost`
  - Hostname of the preferred official image URL, useful for host-specific download logic.

## Current Rule Philosophy

- Prefer exact product packshots or exact official gallery images.
- Prefer brand-region official sites already used by the story.
- Mirror images locally after acquisition so the website does not rely on unstable hotlinks.
- Keep `sourcePage` and `candidateImageUrl` together so the server has both a direct path and a recovery path.
- Keep brand-specific crawl behavior in the same generated rules so future pipeline updates can reuse the already verified fetch path for each brand.

## Regeneration

These files are generated from the current story dataset.

Run:

```bash
npm run image-rules:generate
```

## Notes

- `candidateImageUrl` may be empty for some brands when only a local mirror is currently verified.
- In those cases, the server should use `sourcePage` plus `acquisition.method` to reacquire the official product image.
- Some brands still use `generic_html` crawl mode. Those are valid fallbacks, but they should be upgraded to brand-specific crawl modes as more stable site patterns are confirmed.
- Regenerate the full rule set whenever stories or image sources change so the JSON and Markdown summaries stay aligned.
