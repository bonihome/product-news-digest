# Brand Image Methods Summary

This file is the human-readable companion to the JSON rule files in `data/image-rules/`.
Use it when updating the website or debugging server-side image reacquisition.

Generated at: 2026-05-08T16:58:45.776Z
Brand count: 51

## Adidas

- Slug: `adidas`
- Categories: sports
- Official domains: www.adidas.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `adidas-football` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football.webp` | candidate: none stored | status: partial
  - `adidas-football-boots` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football-boots.webp` | candidate: none stored | status: partial

## Apple

- Slug: `apple`
- Categories: digital
- Official domains: www.apple.com.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `apple-iphone` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-iphone.jpg` | candidate: none stored | status: partial
  - `apple-ipad` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-ipad.jpg` | candidate: none stored | status: partial
  - `apple-accessories` | 配件 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-accessories.jpg` | candidate: none stored | status: partial

## Arc'teryx

- Slug: `arc-teryx`
- Categories: sports
- Official domains: arcteryx.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: gallery_asset_download -> official_product_page_screenshot -> local_mirror
- Notes: Arc'teryx localized product pages can mix icons, detail shots, and product imagery. Prefer Sanity-hosted official gallery assets when they show the jacket body or construction details clearly. Use a localized page screenshot only as a fallback when the page does not expose a usable product image.
- Stories:
  - `arcteryx-alpha-sv` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/arcteryx-alpha-sv-hanging.jpg` | candidate: https://cdn.sanity.io/images/inkbj32c/production/7a649d6f8f0ee59bd267191e4d08009dc30afddf-600x600.jpg?auto=format&q=75 | status: partial
  - `arcteryx-alpha-sv-detail` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/arcteryx-alpha-sv-detail.jpg` | candidate: https://cdn.sanity.io/images/inkbj32c/production/e5a16a928380d0c5c9e0f083bc2fe8133714d98d-600x600.jpg?auto=format&q=75 | status: partial

## ASICS

- Slug: `asics`
- Categories: sports
- Official domains: www.asics.com.cn
- Story count: 1
- Status: ready 1, partial 0, needs replacement 0
- Brand methods: official_cms_asset_download -> homepage_or_collection_asset_download -> local_mirror
- Notes: ASICS China product pages can be inconsistent, but official cms-static.asics.com media library assets are stable once identified from the page source. Prefer the square product image for tennis shoe stories, then mirror it locally.
- Stories:
  - `asics-tennis` | 网球 | method: `local_mirror_of_official_asset` | priority: official_cms_asset_download -> local_mirror | local: `/news/sports/asics-gel-resolution-8.jpg` | candidate: https://cms-static.asics.com/media-libraries/115463/file.jpg | status: ready

## Bobbi Brown

- Slug: `bobbi-brown`
- Categories: beauty
- Official domains: www.bobbibrown.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `bobbibrown-serum-foundation` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/bobbibrown-home-real.png` | candidate: none stored | status: partial
  - `bobbibrown-highlighter` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/bobbibrown-home.png` | candidate: none stored | status: partial

## Burberry

- Slug: `burberry`
- Categories: luxury
- Official domains: www.burberry.cn
- Story count: 6
- Status: ready 0, partial 6, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `burberry` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/burberry.webp` | candidate: none stored | status: partial
  - `burberry-rider` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/burberry-rider.webp` | candidate: none stored | status: partial
  - `burberry-backpack` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/burberry-backpack.webp` | candidate: none stored | status: partial
  - `burberry-heritage-trench` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/burberry-heritage-trench.webp` | candidate: none stored | status: partial
  - `burberry-check-shirt` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/burberry-check-shirt.webp` | candidate: none stored | status: partial
  - `burberry-rocking-horse` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/burberry-rocking-horse.webp` | candidate: none stored | status: partial

## Bvlgari

- Slug: `bvlgari`
- Categories: luxury
- Official domains: www.bulgari.cn
- Story count: 6
- Status: ready 0, partial 6, needs replacement 0
- Brand methods: official_catalog_product_image_download -> official_collection_asset_download -> local_mirror
- Notes: Bvlgari China watch listing pages embed stable catalog product PNG assets under /media/catalog/product/cache/. Prefer exact watch packshots from the watch listing payload for Serpenti and Octo stories, then mirror locally.
- Stories:
  - `bulgari-serpenti-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/bulgari-serpenti-watch.png` | candidate: none stored | status: partial
  - `bulgari-serpenti-bag-grey` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/bulgari-serpenti-bag-grey.png` | candidate: none stored | status: partial
  - `bulgari-serpenti-bag-green` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/bulgari-serpenti-bag-green.png` | candidate: none stored | status: partial
  - `bulgari-serpenti-sedu-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/bulgari-serpenti-sedu-watch.png` | candidate: https://www.bulgari.cn/media/catalog/product/cache/6e8bf58cd790c423691f019c814cf844/1/0/103902-001.png | status: partial
  - `bulgari-octo-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/bulgari-octo-watch.png` | candidate: https://www.bulgari.cn/media/catalog/product/cache/6e8bf58cd790c423691f019c814cf844/1/0/104299-E-001.png | status: partial
  - `bulgari-serpenti-top-handle` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/bulgari-serpenti-top-handle.png` | candidate: none stored | status: partial

## Cartier

- Slug: `cartier`
- Categories: luxury
- Official domains: www.cartier.cn
- Story count: 9
- Status: ready 0, partial 9, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `cartier` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier.jpg` | candidate: none stored | status: partial
  - `cartier-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-watch.jpg` | candidate: none stored | status: partial
  - `cartier-bag` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-bag.jpg` | candidate: none stored | status: partial
  - `cartier-love-necklace` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-love-necklace.jpg` | candidate: none stored | status: partial
  - `cartier-clash-ring` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-clash-ring.jpg` | candidate: none stored | status: partial
  - `cartier-panthere-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-panthere-watch.jpg` | candidate: none stored | status: partial
  - `cartier-tank-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-tank-watch.jpg` | candidate: none stored | status: partial
  - `cartier-must-shoulder-bag` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-must-shoulder-bag.jpg` | candidate: none stored | status: partial
  - `cartier-must-wallet` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/cartier-must-wallet.jpg` | candidate: none stored | status: partial

## CHANDO

- Slug: `chando`
- Categories: beauty
- Official domains: www.chando-himalaya.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: browser_product_image_download -> official_product_card_download -> local_mirror
- Notes: CHANDO product images can be blocked when fetched without a referer and user agent. Use the official product detail page in a browser session or send the page as referer when downloading product images from chandowebprd.chandogroup.com. Mirror the verified product image locally after download.
- Stories:
  - `chando-purple` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chando-purple-real.png` | candidate: https://chandowebprd.chandogroup.com/images/aa434f1dafda4fdfa4fe30e2f75166ff.1776224329550.png | status: partial
  - `chando-foundation` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chando-foundation-real.png` | candidate: https://chandowebprd.chandogroup.com/images/d1c85c4d6616409192aea01aed1b3c50.1713838299550.png | status: partial

## Chanel

- Slug: `chanel`
- Categories: luxury
- Official domains: www.chanel.cn
- Story count: 9
- Status: ready 0, partial 9, needs replacement 0
- Brand methods: official_category_packshot_download -> official_editorial_asset_download -> local_mirror
- Notes: Chanel watch category pages expose stable packshot assets and editorial hero assets directly in page HTML. Use the Premiere category packshot for Premiere stories, the J12 BLEU editorial asset for H10288, and mirror all selected images locally.
- Stories:
  - `chanel-25-bag` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-25-bag.webp` | candidate: none stored | status: partial
  - `chanel-coco-crush` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-coco-crush.webp` | candidate: none stored | status: partial
  - `chanel-j12-bleu` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-j12-bleu-watch.webp` | candidate: https://www.chanel.cn/puls-img/c_limit,w_1920/f_webp,q_90,dpr_1.1/1774968766103-mspp-j12-bleue-h10288-cover-mobile-4-3_2500x4443.jpg | status: partial
  - `chanel-25-mini` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-25-mini.webp` | candidate: none stored | status: partial
  - `chanel-flap-bag` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-flap-bag.webp` | candidate: none stored | status: partial
  - `chanel-coco-crush-necklace` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-coco-crush-necklace.webp` | candidate: none stored | status: partial
  - `chanel-camelia-ring` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-camelia-ring.webp` | candidate: none stored | status: partial
  - `chanel-j12-black` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-j12-black.webp` | candidate: none stored | status: partial
  - `chanel-premiere-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-premiere-watch.png` | candidate: https://www.chanel.cn/images/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1920/premiere-edition-originale-watch-yellow-black-calfskin-gold-coating-packshot-default-h6951-9590048751646.jpg | status: partial

## CHANEL Beauty

- Slug: `chanel-beauty`
- Categories: beauty
- Official domains: www.chanel.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `chanel-beauty-n5-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-n5.png` | candidate: none stored | status: partial
  - `chanel-beauty-chance-tendre` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-chance-tendre.png` | candidate: none stored | status: partial
  - `chanel-beauty-coco-mademoiselle` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-coco-mademoiselle.png` | candidate: none stored | status: partial

## Charlotte Tilbury

- Slug: `charlotte-tilbury`
- Categories: beauty
- Official domains: www.charlottetilbury.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `ct` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/ct-pillowtalk.png` | candidate: none stored | status: partial
  - `ct-pillowtalk` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/ct.png` | candidate: none stored | status: partial

## Clé de Peau Beauté

- Slug: `cle-de-peau-beaute`
- Categories: beauty
- Official domains: www.cledepeau-beaute.com.cn
- Story count: 4
- Status: ready 0, partial 4, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `cpb-home` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/cpb-home-local.jpg` | candidate: https://www.cledepeau-beaute.com.cn/on/demandware.static/-/Sites-cpb_cn-Library/default/dw4fcc2ecc/CPB/2024KV/KV1-PC-20241104.jpg | status: partial
  - `cpb-foundation` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/cpb-foundation.png` | candidate: none stored | status: partial
  - `cpb-primer` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/cpb-primer.png` | candidate: none stored | status: partial
  - `cpb-cleanser` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/cpb-cleanser.png` | candidate: none stored | status: partial

## Clinique

- Slug: `clinique`
- Categories: beauty
- Official domains: www.clinique.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `clinique-yellow-moisturizer` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/clinique-yellow-moisturizer.jpg` | candidate: none stored | status: partial
  - `clinique-eb-milky-lotion` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/clinique-eb-milky-lotion.jpg` | candidate: none stored | status: partial

## DESCENTE

- Slug: `descente`
- Categories: sports
- Official domains: allterrain.descente.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: official_collection_asset_download -> official_page_screenshot -> local_mirror
- Notes: DESCENTE commerce pages can be blocked by Cloudflare in headless or server-side fetches. Use an accessible ALLTERRAIN official line asset or a clean official page screenshot, then mirror locally.
- Stories:
  - `descente-allterrain` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/descente-allterrain-hero.jpg` | candidate: https://allterrain.descente.com/wp-content/uploads/2026/02/26ss_index_allterrain_head_pc.jpg | status: partial
  - `descente-allterrain-81` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/descente-allterrain-81-hero.jpg` | candidate: https://allterrain.descente.com/wp-content/uploads/2026/02/26ss_index_81_head_pc.jpg | status: partial

## Dior

- Slug: `dior`
- Categories: luxury
- Official domains: www.dior.cn
- Story count: 6
- Status: ready 0, partial 6, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `dior-book-tote` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-book-tote.jpg` | candidate: none stored | status: partial
  - `dior-dioramour-book-tote` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-dioramour-book-tote.jpg` | candidate: none stored | status: partial
  - `dior-gem-dior` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-gem-dior.webp` | candidate: none stored | status: partial
  - `dior-lady-d-joy` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-lady-d-joy.jpg` | candidate: none stored | status: partial
  - `dior-rose-des-vents` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-rose-des-vents.webp` | candidate: none stored | status: partial
  - `dior-oui-ring` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-oui-ring.jpg` | candidate: none stored | status: partial

## Dior Beauty

- Slug: `dior-beauty`
- Categories: beauty
- Official domains: www.dior.com, www.dior.cn
- Story count: 5
- Status: ready 0, partial 5, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `dior-beauty` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-forever-new.jpg` | candidate: https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/en_US/dw5e4619d5/Y0000149/Y0000149_E000001270_E01_RHC.jpg?sw=640 | status: partial
  - `dior-beauty-lips` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-addict-new.jpg` | candidate: https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/default/dw9831c51b/Y0319000/Y0319000_C031900038_E01_RHC.jpg?sw=640 | status: partial
  - `dior-beauty-miss-dior-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-miss-dior-real.jpg` | candidate: none stored | status: partial
  - `dior-beauty-jadore-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-jadore-real.jpg` | candidate: none stored | status: partial
  - `dior-beauty-sauvage-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-sauvage-real.jpg` | candidate: none stored | status: partial

## Estée Lauder

- Slug: `estee-lauder`
- Categories: beauty
- Official domains: www.esteelauder.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: cn_product_page_asset_download -> cn_series_page_asset_download -> local_mirror
- Notes: The global Estee Lauder media/export hotlinks can return 403 in server-side fetches. Prefer official China product or series pages, then download the visible product asset with a browser-like user agent and referer. Mirror the asset locally after download so the frontend does not depend on blocked hotlinks.
- Stories:
  - `estee` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/estee-anr-official.jpg` | candidate: https://www.esteelauder.com.cn/media/export/cms/products/308x424/el_sku_G37B01_308x424_0.jpg?w=3840 | status: partial
  - `estee-makeup` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/estee-doublewear-local.png` | candidate: https://www.esteelauder.com/media/export/cms/products/308x424/el_sku_PH7G10_308x424_0.jpg | status: partial

## Gucci

- Slug: `gucci`
- Categories: luxury
- Official domains: www.gucci.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `gucci-horsebit` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/gucci-horsebit.webp` | candidate: none stored | status: partial
  - `gucci-marmont` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/gucci-marmont.webp` | candidate: none stored | status: partial
  - `gucci-horsebit-soft` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/gucci-horsebit-soft.webp` | candidate: none stored | status: partial

## Hermes

- Slug: `hermes`
- Categories: luxury
- Official domains: www.hermes.cn
- Story count: 9
- Status: ready 0, partial 9, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `hermes-hacademi` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-hacademi.webp` | candidate: none stored | status: partial
  - `hermes-mini-clic-kelly` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-mini-clic-kelly.webp` | candidate: none stored | status: partial
  - `hermes-arceau-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-arceau-watch.webp` | candidate: none stored | status: partial
  - `hermes-garden-party` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-garden-party.webp` | candidate: none stored | status: partial
  - `hermes-kelly-pocket` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-kelly-pocket.webp` | candidate: none stored | status: partial
  - `hermes-farandole` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-farandole.webp` | candidate: none stored | status: partial
  - `hermes-collier-de-chien` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-collier-de-chien.webp` | candidate: none stored | status: partial
  - `hermes-h08-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-h08-watch.webp` | candidate: none stored | status: partial
  - `hermes-cape-cod-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-cape-cod-watch.webp` | candidate: none stored | status: partial

## Hermès Beauty

- Slug: `hermes-beauty`
- Categories: beauty
- Official domains: www.hermes.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `hermes-beauty-terre-dhermes` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-terre-dhermes.jpg` | candidate: none stored | status: partial
  - `hermes-beauty-twilly-ginger` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-twilly-ginger.jpg` | candidate: none stored | status: partial
  - `hermes-beauty-nil-garden` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-nil-garden.jpg` | candidate: none stored | status: partial

## HONOR

- Slug: `honor`
- Categories: digital
- Official domains: www.honor.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `honor-magic8` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/honor-magic8.png` | candidate: none stored | status: partial
  - `honor-tablets` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/honor-tablets.png` | candidate: none stored | status: partial

## Huawei

- Slug: `huawei`
- Categories: digital
- Official domains: consumer.huawei.com
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `huawei-pura90` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/huawei-pura90.png` | candidate: none stored | status: partial

## IPSA

- Slug: `ipsa`
- Categories: beauty
- Official domains: www.ipsa.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `ipsa-home` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/ipsa-home.jpg` | candidate: none stored | status: partial
  - `ipsa-products` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/ipsa-products.png` | candidate: none stored | status: partial

## Kiehl's

- Slug: `kiehl-s`
- Categories: beauty
- Official domains: www.kiehls.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: official_products_page_download -> official_homepage_banner_download -> local_mirror
- Notes: Kiehl’s China about/products page exposes stable official product-collage images on res-wxec-unipt.lorealchina.com. Prefer the products-page collages that clearly show Calendula toner, dark spot serum, cream, or mask, then mirror locally.
- Stories:
  - `kiehls-home` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/kiehls-calendula-darkspot.jpg` | candidate: https://res-wxec-unipt.lorealchina.com/ow1/ow-kie/about/products/2.jpg | status: partial
  - `kiehls-best-sellers` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/kiehls-cream-mask.jpg` | candidate: https://res-wxec-unipt.lorealchina.com/ow1/ow-kie/about/products/1.jpg | status: partial

## KOLON SPORT

- Slug: `kolon-sport`
- Categories: sports
- Official domains: www.kolonsport.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: product_gallery_download -> local_mirror
- Notes: KOLON SPORT product pages expose stable gallery assets on images.kolonmall.com. Prefer the LM1 front-view product image for the lead card, then mirror locally.
- Stories:
  - `kolon-hyperleap-tlx` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/kolon-hyperleap-tlx.jpg` | candidate: https://images.kolonmall.com/Prod_Img/KS/2026/LM1/FE4TX26010BLK_LM1.jpg | status: partial
  - `kolon-hawk-rise-gtx` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/kolon-hawk-rise-page.png` | candidate: https://images.kolonmall.com/Prod_Img/KS/2026/LM1/FE4KX26310GRY_LM1.jpg | status: partial

## La Mer

- Slug: `la-mer`
- Categories: beauty
- Official domains: www.lamer.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `lamer-protecting-veil` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/lamer-protecting-veil.jpg` | candidate: none stored | status: partial
  - `lamer-skincolor` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/lamer-skincolor.jpg` | candidate: none stored | status: partial

## Lancôme

- Slug: `lancome`
- Categories: beauty
- Official domains: www.lancome.com.cn
- Story count: 1
- Status: ready 1, partial 0, needs replacement 0
- Brand methods: homepage_product_card_capture -> local_crop
- Notes: Lancôme China is heavily front-end rendered and product links are not consistently exposed in HTML. For homepage-led stories, capture the visible product card or module image and mirror locally.
- Stories:
  - `lancome-home` | 护肤 | method: `homepage_product_card_capture_to_local_mirror` | priority: homepage_product_card_capture -> local_crop -> local_mirror | local: `/news/beauty/lancome-genifique-packshot-clean.jpg` | candidate: https://res-wxec-unipt.lorealchina.com/prod/lan/20250326/759cf952-d649-4834-af54-d1f665b2fea0.jpg | status: ready

## Lenovo

- Slug: `lenovo`
- Categories: digital
- Official domains: item.lenovo.com.cn
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `lenovo-yoga-air14` | 电脑 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/lenovo-yoga-air14.jpg` | candidate: none stored | status: partial

## Longines

- Slug: `longines`
- Categories: luxury
- Official domains: www.longines.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `longines-hydroconquest` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/longines-hydroconquest.png` | candidate: none stored | status: partial
  - `longines-conquest` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/longines-conquest.png` | candidate: none stored | status: partial
  - `longines-conquest-34` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/longines-conquest-34.png` | candidate: none stored | status: partial

## Louis Vuitton

- Slug: `louis-vuitton`
- Categories: luxury
- Official domains: www.louisvuitton.cn
- Story count: 6
- Status: ready 0, partial 6, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `lv` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv.webp` | candidate: none stored | status: partial
  - `lv-readywear` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-readywear.webp` | candidate: none stored | status: partial
  - `lv-my-capucines` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-my-capucines.webp` | candidate: none stored | status: partial
  - `lv-capucines-bb` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-capucines-bb.webp` | candidate: none stored | status: partial
  - `lv-tweed-jacket` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-tweed-jacket.webp` | candidate: none stored | status: partial
  - `lv-silk-dress` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-silk-dress.webp` | candidate: none stored | status: partial

## MAOGEPING

- Slug: `maogeping`
- Categories: beauty
- Official domains: www.maogepingbeauty.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `mgp-highlight` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/maogeping-highlight.png` | candidate: none stored | status: partial
  - `mgp-cushion` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/maogeping-cushion.png` | candidate: none stored | status: partial

## Microsoft Surface

- Slug: `microsoft-surface`
- Categories: digital
- Official domains: www.microsoft.com
- Story count: 2
- Status: ready 0, partial 0, needs replacement 2
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `microsoft-laptop` | 电脑 | method: `manual_editorial_placeholder` | priority: local_mirror | local: `/news/microsoft-surface.svg` | candidate: none stored | status: needs_replacement
  - `microsoft-laptop-family` | 电脑 | method: `manual_editorial_placeholder` | priority: local_mirror | local: `/news/microsoft-surface.svg` | candidate: none stored | status: needs_replacement

## Mizuno

- Slug: `mizuno`
- Categories: sports
- Official domains: www.mizuno.com.cn
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `mizuno-tennis` | 网球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/mizuno-tennis.jpg` | candidate: none stored | status: partial

## NARS

- Slug: `nars`
- Categories: beauty
- Official domains: www.narscosmetics.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `nars-soft-velvet` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/nars-soft.jpg` | candidate: none stored | status: partial
  - `nars-light-reflecting` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/nars-light.jpg` | candidate: none stored | status: partial

## Nike

- Slug: `nike`
- Categories: sports
- Official domains: www.nike.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `nike-basketball` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-basketball.png` | candidate: none stored | status: partial
  - `nike-basketball-feed` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-basketball-feed.png` | candidate: none stored | status: partial

## OMEGA

- Slug: `omega`
- Categories: luxury
- Official domains: www.omegawatches.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `omega-moonwatch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/omega-moonwatch.jpg` | candidate: none stored | status: partial
  - `omega-speedmaster-38` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/omega-speedmaster-38.png` | candidate: none stored | status: partial
  - `omega-aqua-terra` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/omega-aqua-terra.png` | candidate: none stored | status: partial

## On

- Slug: `on`
- Categories: sports
- Official domains: www.on.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: product_gallery_currentSrc_download -> local_mirror
- Notes: On product pages expose stable product gallery assets through currentSrc values on brand CDN images. Prefer the first hero gallery image and mirror it locally for product cards.
- Stories:
  - `on-cloudsurfer-max` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/on-cloudsurfer-max.webp` | candidate: https://images.ctfassets.net/hnk2vsx53n6l/1VGvF5KSK6shaFwdzgvKRu/5009bc69b19aeb617e0cbebb12e23c83/e23710a3d0ff66844466531dd9d7940b7b22540f.png?fm=webp | status: partial
  - `on-cloudmonster-2` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/on-cloudmonster-2-page.png` | candidate: https://images.ctfassets.net/hnk2vsx53n6l/5e4SXNmPb6Cbk10oUts0co/6ac100992b4b8d5fda5a5ad8437aadb0/6f9dc9d16e22b1a3c0d722e8d71747f17630e582.png?fm=webp | status: partial

## OPPO

- Slug: `oppo`
- Categories: digital
- Official domains: www.oppo.com
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `oppo-findx9` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/oppo-findx9.png` | candidate: none stored | status: partial

## Prada

- Slug: `prada`
- Categories: luxury
- Official domains: www.prada.cn
- Story count: 12
- Status: ready 12, partial 0, needs replacement 0
- Brand methods: resolved_browser_image -> reconstructed_dam_path -> local_mirror
- Notes: Prada bag, ready-to-wear, and jewelry pages can fail in browser with HTTP2 errors. When browser extraction fails, reconstruct the DAM path from productCode, material, color, and variant. Prefer SLF front-view assets and mirror them locally for stable server delivery.
- Stories:
  - `prada-passage-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-passage-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA495/2G52F0201/1BA495_2G52_F0201_V_OPO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg | status: ready
  - `prada-lace-dress` | 服装 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-lace-dress.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/P/P3Q/P3Q17/17VMF0002/P3Q17_17VM_F0002_S_OOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg | status: ready
  - `prada-eternal-gold-necklace` | 珠宝 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-eternal-gold.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1JC/1JCA06/2DA5F0056/1JCA06_2DA5_F0056_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg | status: ready
  - `prada-reedition-2005-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-reedition-2005-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1N2/1N204W/2G64F0003/1N204W_2G64_F0003_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg | status: ready
  - `prada-double-mini-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-double-mini-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1BG/1BG443/2A4AF0G3Z/1BG443_2A4A_F0G3Z_V_XOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg | status: ready
  - `prada-renylon-skirt` | 服装 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-renylon-skirt.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/2/21H/21H015/1WQ8F0002/21H015_1WQ8_F0002_S_OOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg | status: ready
  - `prada-chino-circle-skirt` | 服装 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-chino-skirt.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/P/P13/P132JE/10YPF0002/P132JE_10YP_F0002_S_OOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg | status: ready
  - `prada-symbole-necklace` | 珠宝 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-symbole-necklace.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1JC/1JCA43/2DSPF0002/1JCA43_2DSP_F0002_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg | status: ready
  - `prada-bonnie-medium-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-bonnie-medium-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA426/2FPTF0009/1BA426_2FPT_F0009_V_OTM_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg | status: ready
  - `prada-route-large-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-route-large-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1BB/1BB162/2HFQF0002/1BB162_2HFQ_F0002_V_OOO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg | status: ready
  - `prada-carry-mini-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-carry-mini-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA496/2C6AF0002/1BA496_2C6A_F0002_V_OOO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg | status: ready
  - `prada-jardiniere-mini-bag` | 皮包 | method: `reconstructed_dam_path_to_local_mirror` | priority: resolved_browser_image -> reconstructed_dam_path -> local_mirror | local: `/news/luxury/prada-jardiniere-mini-bag.jpg` | candidate: https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA038/RCYAF0018/1BA038_RCYA_F0018_V_8OK_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg | status: ready

## Prada Beauty

- Slug: `prada-beauty`
- Categories: beauty
- Official domains: www.prada.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `prada-beauty-paradoxe-radical` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/prada-paradoxe-radical-clean.png` | candidate: none stored | status: partial
  - `prada-beauty-paradoxe-virtual-flower` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/prada-paradoxe-virtual-flower-clean.png` | candidate: none stored | status: partial
  - `prada-beauty-luna-rossa-ocean` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/prada-luna-rossa-ocean-clean.png` | candidate: none stored | status: partial

## PROYA

- Slug: `proya`
- Categories: beauty
- Official domains: www.proya.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `proya-redruby` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/proya-redruby.png` | candidate: none stored | status: partial
  - `proya-dualkang` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/proya-dualkang.png` | candidate: none stored | status: partial

## Samsung

- Slug: `samsung`
- Categories: digital
- Official domains: www.samsung.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `samsung-tablet` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/samsung-tablet.jpg` | candidate: none stored | status: partial
  - `samsung-phone` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/samsung-phone.jpg` | candidate: none stored | status: partial

## SHISEIDO

- Slug: `shiseido`
- Categories: beauty
- Official domains: www.shiseido.com.cn
- Story count: 3
- Status: ready 3, partial 0, needs replacement 0
- Brand methods: product_detail_packshot_download -> homepage_product_card_capture -> local_mirror
- Notes: For direct product stories, use the 1000x1000 itemmaster packshot from the product detail page. For homepage-led stories, prefer a product-card crop over a text-heavy hero banner.
- Stories:
  - `shiseido-home` | 护肤 | method: `homepage_product_card_capture_to_local_mirror` | priority: product_detail_packshot_download -> homepage_product_card_capture -> local_mirror | local: `/news/beauty/shiseido-vital-perfection-packshot-2.png` | candidate: https://www.shiseido.com.cn/on/demandware.static/-/Sites-shiseido_global_cn-Library/default/dwe572840d/landingshi/2026/20260309/section-1/6.png | status: ready
  - `shiseido-ultimune` | 护肤 | method: `product_detail_packshot_download_to_local_mirror` | priority: product_detail_packshot_download -> homepage_product_card_capture -> local_mirror | local: `/news/beauty/shiseido-ultimune-packshot.jpg` | candidate: https://www.shiseido.com.cn/dw/image/v2/BCSK_PRD/on/demandware.static/-/Sites-itemmaster_shiseido/default/dw6a224066/images/chuchuangtu/baidi/baiditu-s17283-50.jpg?sw=1000&sh=1000&sm=fit | status: ready
  - `shiseido-uv` | 护肤 | method: `product_detail_packshot_download_to_local_mirror` | priority: product_detail_packshot_download -> homepage_product_card_capture -> local_mirror | local: `/news/beauty/shiseido-uv-packshot.jpg` | candidate: https://www.shiseido.com.cn/dw/image/v2/BCSK_PRD/on/demandware.static/-/Sites-itemmaster_shiseido/default/dwef0d71eb/images/products/15678wlc/plain.jpg?sw=1000&sh=1000&sm=fit | status: ready

## Shu Uemura

- Slug: `shu-uemura`
- Categories: beauty
- Official domains: www.shuuemura.com.cn
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: official_homepage_banner_download -> official_collection_asset_download -> local_mirror
- Notes: Shu Uemura China homepage exposes stable hero banner assets on res-wxec-unipt.lorealchina.com. Prefer a banner that clearly shows the featured product, such as the Ultime8 cleansing oil visual, then mirror locally.
- Stories:
  - `shu-home` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/shuuemura-ultime8-oil.png` | candidate: https://res-wxec-unipt.lorealchina.com/ow1/ow-shu/banner/22.png | status: partial

## Tiffany & Co.

- Slug: `tiffany-and-co`
- Categories: luxury
- Official domains: www.tiffany.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `tiffany-hardwear` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/tiffany-hardwear.jpg` | candidate: none stored | status: partial
  - `tiffany-smile-necklace` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/tiffany-smile-necklace.jpg` | candidate: none stored | status: partial
  - `tiffany-lock` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/tiffany-lock.jpg` | candidate: none stored | status: partial

## Van Cleef & Arpels

- Slug: `van-cleef-and-arpels`
- Categories: luxury
- Official domains: www.vancleefarpels.cn
- Story count: 3
- Status: ready 3, partial 0, needs replacement 0
- Brand methods: product_gallery_currentSrc -> local_mirror
- Notes: Use the exact product page gallery and prefer the front or detail image from currentSrc. Local PNG mirrors are more stable than relying on live CN CDN responses.
- Stories:
  - `vca-alhambra` | 珠宝 | method: `product_gallery_currentSrc_to_local_mirror` | priority: product_gallery_currentSrc -> local_mirror | local: `/news/luxury/vca-vintage-pendant.png` | candidate: https://www.vancleefarpels.cn/content/dam/rcq/vca/Rz/4M/Ut/Vy/QD/-6/c6/13/zo/4v/6g/Rz4MUtVyQD-6c613zo4v6g.png.transform.vca-w820-1x.png | status: ready
  - `vca-bracelet` | 珠宝 | method: `product_gallery_currentSrc_to_local_mirror` | priority: product_gallery_currentSrc -> local_mirror | local: `/news/luxury/vca-vintage-bracelet.png` | candidate: https://www.vancleefarpels.cn/content/dam/rcq/vca/L8/7Y/Eh/oM/Sg/yH/yH/Od/Bq/iJ/vg/L87YEhoMSgyHyHOdBqiJvg.png.transform.vca-w820-1x.png | status: ready
  - `vca-magic-alhambra` | 珠宝 | method: `product_gallery_currentSrc_to_local_mirror` | priority: product_gallery_currentSrc -> local_mirror | local: `/news/luxury/vca-magic-bracelet.png` | candidate: https://www.vancleefarpels.cn/content/dam/rcq/vca/tR/Va/8Y/rm/Qt/uH/xp/pM/6k/6t/qQ/tRVa8YrmQtuHxppM6k6tqQ.png.transform.vca-w820-1x.png | status: ready

## vivo

- Slug: `vivo`
- Categories: digital
- Official domains: www.vivo.com.cn
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `vivo-xfold` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/vivo-xfold.png` | candidate: none stored | status: partial

## Wilson

- Slug: `wilson`
- Categories: sports
- Official domains: www.wilson.com
- Story count: 2
- Status: ready 2, partial 0, needs replacement 0
- Brand methods: official_blog_asset_download -> official_product_page_image_download -> local_mirror
- Notes: Wilson official blog pages expose stable article media URLs that can be mirrored locally. For Rush Pro stories, prefer the official blog hero image first, then fall back to the tennis product page if needed.
- Stories:
  - `wilson-tennis` | 网球 | method: `local_mirror_of_official_asset` | priority: official_blog_asset_download -> official_product_page_image_download -> local_mirror | local: `/news/sports/wilson-rush-pro-4-5.jpg` | candidate: https://www.wilson.com/en-us/blog/tennis/wilson-labs/media_10a32f00163d82889342fb3ad4b904cf0c0d886a6.jpeg?width=1200&format=pjpg&optimize=medium | status: ready
  - `wilson-tennis-shoe` | 网球 | method: `local_mirror_of_official_asset` | priority: official_blog_asset_download -> official_product_page_image_download -> local_mirror | local: `/news/sports/wilson-rush-pro-4-5.jpg` | candidate: https://www.wilson.com/en-us/blog/tennis/wilson-labs/media_10a32f00163d82889342fb3ad4b904cf0c0d886a6.jpeg?width=1200&format=pjpg&optimize=medium | status: ready

## Winona

- Slug: `winona`
- Categories: beauty
- Official domains: www.winona.cn
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `winona-cream` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/winona-cream.jpg` | candidate: none stored | status: partial

## YONEX

- Slug: `yonex`
- Categories: sports
- Official domains: www.yonex.cn
- Story count: 1
- Status: ready 0, partial 1, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Stories:
  - `yonex-tennis` | 网球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/yonex-tennis-page.png` | candidate: none stored | status: partial

