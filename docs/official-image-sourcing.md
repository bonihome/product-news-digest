# Official Image Sourcing

This project uses brand-official images first. When direct hotlinking is unstable or blocked, we save an official-page crop locally and keep the original source page in the story data.

## Dior Fashion China

- Region/site: `dior.cn`
- Best source: product detail pages on the China fashion site.
- Pattern:
  - Open the exact product page.
  - Extract the first gallery image (`E01`) or the second/third gallery image (`E03`, `E08`) when we need a different angle.
  - Typical host:
    - `https://assets.christiandior.cn/is/image/diorprod/...`
- Notes:
  - Bags and jewelry pages expose stable image URLs in the HTML.
  - For collection pages without a dedicated product slug, use the closest matching China collection image and prefer a ring/bracelet/necklace image that matches the story category.

## Tiffany China

- Region/site: `tiffany.cn`
- Best source: collection listing pages, not direct legacy item URLs.
- Pattern:
  - Direct item URLs can return `404`.
  - Open collection pages such as:
    - `/jewelry/shop/tiffany-hardwear/`
    - `/jewelry/shop/tiffany-t/`
    - `/jewelry/shop/tiffany-lock/`
  - Read product cards and use the CDN product image from:
    - `https://media.tiffany.cn/is/image/tco/..._MAIN1X1`
- Notes:
  - Collection pages preserve current China assortment and are more stable than old product slugs.
  - Match the story to the first visible product card when the exact old SKU no longer resolves.

## Bvlgari China

- Region/site: `bulgari.cn`
- Best source: China watch listing pages and their embedded catalog packshots.
- Pattern:
  - Open the China watches listing or the relevant product listing block.
  - Prefer official packshot assets under:
    - `https://www.bulgari.cn/media/catalog/product/cache/...`
  - For watch stories, use the exact catalog PNG or JPG tied to the visible Serpenti or Octo product card.
- Notes:
  - Some Bvlgari detail routes are less stable than the catalog asset URLs.
  - For `Serpenti Seduttori` and `Octo Finissimo`, the China catalog packshot is cleaner and more reliable than placeholder detail-page images.

## Dior Beauty

- Region/site used for image extraction: `dior.com` beauty product pages.
- Best source: product detail pages with `img[alt="Dior ..."]` assets.
- Pattern:
  - Open the exact product page in Playwright.
  - Extract the first clean product image from:
    - `https://www.dior.com/dw/image/v2/...`
- Notes:
  - The `What's New` page is useful for editorial selection, but product pages are better for clean packshot-style images.
  - Dismiss popups if using browser screenshots.

## SHISEIDO China

- Region/site: `shiseido.com.cn`
- Best source: direct product detail packshots for single-product stories, homepage product cards for homepage-led stories.
- Pattern:
  - For item-level stories, use the 1000x1000 itemmaster packshot under `Sites-itemmaster_shiseido`.
  - For homepage-led skincare stories, use a clean single-product card from the homepage campaign strip instead of a wide banner.
  - Prefer a complete product card that shows the bottle body rather than a too-tight crop.
- Notes:
  - The homepage campaign strip exposes multiple official packshot cards, so choose the one that best matches the story products.

## CHANDO

- Region/site: `chando-himalaya.com`
- Best source: official product images served from `chandowebprd.chandogroup.com`.
- Pattern:
  - Open the product detail page in a browser session and identify the large product image in the page image list.
  - When downloading directly, send the product detail page as `referer` together with a browser user agent.
  - Without referer, the saved file can become anti-hotlink HTML instead of the product image.
- Notes:
  - Prefer the large square or high-resolution product packshot over smaller recommendation-card images.

## Estee Lauder

- Region/site: prefer `esteelauder.com.cn` when the global site blocks direct asset fetches.
- Best source: China product pages or China series pages first, not the old global hotlink.
- Pattern:
  - Global `media/export/cms/products/...` hotlinks can return `403` in server-side fetches.
  - Open a China product page or series page in a browser-like context.
  - Download the visible official asset with:
    - browser user agent
    - referer set to the matching China product or series page
  - Verified official China assets currently used:
    - `https://www.esteelauder.com.cn/media/export/cms/products/308x424/el_sku_G37B01_308x424_0.jpg?w=3840`
    - `https://assets.cms.elco-cloud.cn/api/assets/el-web/91f560c1-bf26-47ee-b2a3-4c05e04e749c?w=3840`
- Notes:
  - Campaign hero blocks are usable, but product-card or packshot-like assets are usually more precise for news cards.
  - Save the downloaded official image locally after fetch.

## Clinique China

- Region/site: `clinique.com.cn`
- Best source: current China homepage modules.
- Pattern:
  - Some older product/story URLs redirect to the homepage.
  - Read homepage module cards and match by alt text.
  - Typical host:
    - `https://assets.stardust.wechat-mini.elco-cloud.cn/prod/CL_TMP/assets/media/...`
- Notes:
  - Use the yellow-moisturizer module for the yellow lotion story.
  - Use the whitening-lotion module for `EB Brighter Milky Lotion`.

## La Mer China

- Region/site: `lamer.com.cn`
- Best source: current China homepage module strips.
- Pattern:
  - Product URLs may redirect to the homepage.
  - Use homepage module images that show the sunscreen/base-makeup line.
  - Save local crops when one official homepage strip contains multiple products.
- Current local crops:
  - `public/news/beauty/lamer-protecting-veil.jpg`
  - `public/news/beauty/lamer-skincolor.jpg`
- Notes:
- For La Mer, local crops from official homepage artwork are preferred over unstable third-party hotlinks.

## Shu Uemura China

- Region/site: `shuuemura.com.cn`
- Best source: official homepage or campaign banner assets on the China site CDN.
- Pattern:
  - Prefer product-focused homepage banners hosted on:
    - `https://res-wxec-unipt.lorealchina.com/...`
  - Use a banner that clearly shows the featured product family, such as `Ultime8` cleansing oil, instead of a full-page homepage screenshot.
- Notes:
  - Full-page screenshots often include founder portraits or large text blocks and are too editorial for product-news cards.
  - Product-led hero banners are the best fallback when stable direct PDP packshots are not exposed.

## Kiehl's China

- Region/site: `kiehls.com.cn`
- Best source: official products/about page collage assets and homepage modules.
- Pattern:
  - Prefer official product-collage images served from:
    - `https://res-wxec-unipt.lorealchina.com/...`
  - Use the products-page collages that clearly show the specific skincare lineup, such as Calendula toner, dark spot serum, cream, or mask.
- Notes:
  - Product collage assets are more informative than homepage screenshots and remain stable for local mirroring.
  - Mirror the selected official collage locally after download.

## Prada China

- Region/site: `prada.cn`
- Best source: exact product detail pages on the China site, but do not trust `img[src]` alone.
- Pattern:
  - Open the exact product page in a real browser context.
  - Prada product pages often render a placeholder in `img[src]`.
  - The real product image is usually available from:
    - `img.currentSrc`
    - `picture > source[srcset]`
  - The usable product asset typically resolves to a Prada DAM URL like:
    - `https://www.prada.com/content/dam/..._SLF.jpg/...`
  - For bag stories, prefer the first front-view product image whose filename ends with:
    - `_SLF.jpg`
  - Secondary useful angles often include:
    - `_MDL.jpg`
    - `_SLR.jpg`
    - `_SLB.jpg`
    - `_SLO.jpg`
- Working extraction rule:
  - Query product-page `img` nodes with product-like `alt` text such as `Prada ...`.
  - Ignore placeholder-only `src` values like:
    - `/etc.clientlibs/pradaspa/clientlibs/clientlib-site/resources/assets/images/placeholder.svg`
  - Read the resolved `currentSrc` instead.
- Verified examples:
  - `Prada Passage`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA495/2G52F0201/1BA495_2G52_F0201_V_OPO_SLF.jpg/...`
  - `Prada Re-Edition 2005`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1N2/1N204W/2G64F0003/1N204W_2G64_F0003_SLF.jpg/...`
  - `Prada Bonnie`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA426/2FPTF0009/1BA426_2FPT_F0009_V_OTM_SLF.jpg/...`
  - `Prada Route`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1BB/1BB162/2HFQF0002/1BB162_2HFQ_F0002_V_OOO_SLF.jpg/...`
  - `Prada Carry`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA496/2C6AF0002/1BA496_2C6A_F0002_V_OOO_SLF.jpg/...`
  - `Prada Jardiniere`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA038/RCYAF0018/1BA038_RCYA_F0018_V_8OK_SLF.jpg/...`
  - `Prada lace dress`:
    - `https://www.prada.com/content/dam/pradabkg_products/P/P3Q/P3Q17/17VMF0002/P3Q17_17VM_F0002_S_OOO_SLF.jpg/...`
  - `Prada Re-Nylon skirt`:
    - `https://www.prada.com/content/dam/pradabkg_products/2/21H/21H015/1WQ8F0002/21H015_1WQ8_F0002_S_OOO_SLF.jpg/...`
  - `Prada chino circle midi skirt`:
    - `https://www.prada.com/content/dam/pradabkg_products/P/P13/P132JE/10YPF0002/P132JE_10YP_F0002_S_OOO_SLF.jpg/...`
  - `Prada Eternal Gold necklace`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1JC/1JCA06/2DA5F0056/1JCA06_2DA5_F0056_SLF.jpg/...`
  - `Prada Symbole necklace`:
    - `https://www.prada.com/content/dam/pradabkg_products/1/1JC/1JCA43/2DSPF0002/1JCA43_2DSP_F0002_SLF.jpg/...`
- Notes:
  - This is the first brand in the project where `currentSrc` matters more than raw `src`.
  - Network inspection is also reliable: once the product gallery loads, the same `prada.com/content/dam/...` URLs appear in response logs.
  - For ready-to-wear and jewelry, when `prada.cn` or `prada.com` product pages fail in-browser, the DAM path can still be reconstructed from the product code:
    - folder pattern: `<first-char>/<first-3>/<full-code>/<material+color>`
    - filename pattern: `<full-code>_<material>_<color>_<variant>_SLF.jpg`
  - In practice, `SLF` is a reliable front-view choice for both ready-to-wear and jewelry, not only bags.
  - Server-ready rule file:
    - `data/image-rules/prada.json`
    - This file stores the DAM reconstruction pattern plus verified story-level examples so the crawler can follow the same path without relying on ad hoc manual lookup.

## Sports Brand Rules

- `On`
  - Region/site used now: `on.com`
  - Best source: product detail pages.
  - Pattern:
    - Read the first hero gallery image from `img.currentSrc`.
    - Host is usually `images.ctfassets.net`.
    - Mirror the hero running shoe image locally.

- `Arc'teryx`
  - Region/site used now: localized official product pages under `arcteryx.com`.
  - Best source: official gallery assets exposed on the localized product page.
  - Pattern:
    - Open the localized product page in a browser session.
    - Ignore the first icon-style images in `document.images`.
    - Prefer `cdn.sanity.io` gallery assets that clearly show the jacket body or interior construction detail.
    - Keep localized page screenshots only as a fallback if the gallery does not expose a usable product image.

- `KOLON SPORT`
  - Region/site used now: `kolonsport.com`
  - Best source: official product gallery images.
  - Pattern:
    - Use the `LM1` front-view image from `images.kolonmall.com`.
    - Mirror locally after download.

- `ASICS`
  - Region/site used now: `asics.com.cn`
  - Best source: official `cms-static.asics.com` media library assets exposed from the China product page source.
  - Pattern:
    - Open the China product page or homepage in a browser-like request.
    - Extract the `cms-static.asics.com/media-libraries/...` image URL from the page source.
    - Prefer the square product image when available for tennis shoe stories.
    - Mirror the downloaded image locally.

- `DESCENTE`
  - Region/site used now: `allterrain.descente.com`
  - Best source: official ALLTERRAIN line assets or official page screenshots.
  - Pattern:
    - Commerce pages on `my.descente.com` may be Cloudflare-blocked.
    - Prefer accessible official ALLTERRAIN line visuals such as:
      - `26ss_index_allterrain_head_pc.jpg`
      - `26ss_index_81_head_pc.jpg`
    - Mirror those official line assets locally instead of using Cloudflare-gated commerce screenshots.

- `Wilson`
  - Region/site used now: `wilson.com`
  - Best source: official Wilson Tennis blog hero assets first, then the product page.
  - Pattern:
    - Open the Wilson Tennis blog article or tennis section page in a browser-like request.
    - Prefer the large article media URL under the official `wilson.com` blog asset path.
    - Reuse the blog hero image for Rush Pro 4.5 stories when the product page is harder to access.
    - Mirror the image locally after download.

- `Chanel` watches
  - Region/site used now: `chanel.cn`
  - Best source: official watch category packshots and editorial watch hero assets.
  - Pattern:
    - Use the watch category or collection page first, not an unstable direct PDP when that PDP returns `503`.
    - For `Premiere`, prefer the clean packshot exposed from the category/product asset path.
    - For `J12 BLEU`, prefer the official editorial hero asset tied to `H10288` or the `J12 BLEU` collection page.
    - Mirror the selected image locally so future runs do not fall back to mismatched black J12 or unrelated watch imagery.

## Fallback Rules

- First choice: exact product detail page image from the official site.
- Second choice: official collection/listing page image from the same regional site.
- Third choice: official homepage/module artwork from the same regional site.
- If one official image strip contains multiple products, create separate local crops so different stories do not share the same final card image.
