# Image Rules

This directory stores the server-facing image acquisition rules for every brand currently used by the site.

## Files

- `index.json`
  - Summary index of all generated brand rule files.
- `brand-methods-summary.json`
  - Machine-readable brand-wide method summary for server workflows.
- `brand-methods-summary.md`
  - Human-readable lookup table of every brand's image acquisition path.
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
3. Use the per-story `method` and `priority` values as the final execution path.

## Important Fields

- `brand`
  - Human-readable brand name.
- `slug`
  - File-safe brand key.
- `officialDomains`
  - Official site domains currently used by stories from this brand.
- `strategy.brandLevelMethods`
  - Preferred brand-wide acquisition methods.
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

## Regeneration

These files are generated from the current story dataset.

Run:

```bash
npm run image-rules:generate
```

## Notes

- `candidateImageUrl` may be empty for some brands when only a local mirror is currently verified.
- In those cases, the server should use `sourcePage` plus `acquisition.method` to reacquire the official product image.
- Regenerate the full rule set whenever stories or image sources change so the JSON and Markdown summaries stay aligned.
