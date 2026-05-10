# Brand Image Methods Summary

This file is the human-readable companion to the JSON rule files in `data/image-rules/`.
Use it when updating the website or debugging server-side image reacquisition.

Generated at: 2026-05-10T12:47:14.485Z
Brand count: 51

## Adidas

- Slug: `adidas`
- Categories: sports
- Official domains: www.adidas.com.cn
- Story count: 10
- Status: ready 0, partial 10, needs replacement 0
- Brand methods: home_module_first_product -> official_product_page_image_download -> local_mirror
- Notes: Adidas China should use 聚焦热点 and 新品推荐 modules as the entry surface for new products. Each module topic resolves to a listing or SPLP page, where the first product is used as the news candidate.
- Crawl mode: adidas_home_feed_pages
- Crawl notes: When a home module listing no longer exposes a parseable first product, fall back to homepage-specific static stories and stored image rules.
- Crawl entries:
  - `极速蓝调` | 篮球 | https://www.adidas.com.cn/splp?contentId=SPLP_IGbhLTTi | extraction: first_product
  - `自由人系列` | 户外 | https://www.adidas.com.cn/plp/campaign_25Aug_freehiker | extraction: first_product
  - `静奢甄选` | 运动休闲 | https://www.adidas.com.cn/plp/homefeed_26Mar_refine_lux | extraction: first_product
  - `城市机能风` | 户外 | https://www.adidas.com.cn/splp?contentId=SPLP_XHMibwZg | extraction: first_product
  - `东方柔雅风` | 运动休闲 | https://www.adidas.com.cn/splp?contentId=SPLP_KrbvhObt | extraction: first_product
  - `三条纹舞动系列` | 运动休闲 | https://www.adidas.com.cn/splp?contentId=SPLP_b4IzzDUp | extraction: first_product
- Stories:
  - `adidas-football` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football.webp` | candidate: none stored | status: partial
  - `adidas-football-boots` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football-boots.webp` | candidate: none stored | status: partial
  - `adidas-f50-club` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football-boots.webp` | candidate: none stored | status: partial
  - `adidas-boston13` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football.webp` | candidate: none stored | status: partial
  - `adidas-anthony-edwards-2-blue` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-anthony-edwards-2-blue.jpg` | candidate: https://static1.adidas.com.cn/t395/MTc3ODE0NzAyNjE0OWMwM2NiNWE3LTkxN2UtNGYwYS1hMzc5.jpg | status: partial
  - `adidas-freehiker-sandal` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-freehiker-sandal.jpg` | candidate: https://static1.adidas.com.cn/t395/MTc3NzU1MDUzMTQ0M2RhMWVkOTU0LWFhM2EtNDUyNC1hZDcw.jpg | status: partial
  - `adidas-refined-luxe-trench` | 运动休闲 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-refined-luxe-trench.jpg` | candidate: https://static1.adidas.com.cn/t395/MTc3NDMzMjg3MjIzM2NjZTYwZWFkLTYxYWEtNDU1NC1hNDJl.jpg | status: partial
  - `adidas-city-tech-jacket` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-city-tech-jacket.png` | candidate: https://static1.adidas.com.cn/t395/MTc3MDI3NTU4NzM1NzUxMDg2M2Y1LWFjZGYtNDk3ZC05MDEx.png | status: partial
  - `adidas-soft-lux-jacket` | 运动休闲 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-soft-lux-jacket.jpg` | candidate: https://static1.adidas.com.cn/t395/MTc3NjY3MTc1MTc3NjM1NjcxYWVhLWRjZWItNGQwNi04MTY2.jpg | status: partial
  - `adidas-f50-fastline` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/adidas-football-boots.webp` | candidate: none stored | status: partial

## Apple

- Slug: `apple`
- Categories: digital
- Official domains: www.apple.com.cn
- Story count: 6
- Status: ready 0, partial 6, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Apple 默认入口` | 手机 | https://www.apple.com.cn/cn/newsroom/2026/03/apple-introduces-iphone-17e/ | extraction: first_product
- Stories:
  - `apple-iphone` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-iphone.jpg` | candidate: none stored | status: partial
  - `apple-ipad` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-ipad.jpg` | candidate: none stored | status: partial
  - `apple-accessories` | 配件 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-accessories.jpg` | candidate: none stored | status: partial
  - `apple-iphone-pro` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-iphone-family.png` | candidate: none stored | status: partial
  - `apple-accessories-audio` | 配件 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-airpods-family.png` | candidate: none stored | status: partial
  - `apple-audio-family` | 配件 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/apple-accessories.jpg` | candidate: none stored | status: partial

## Arc'teryx

- Slug: `arc-teryx`
- Categories: sports
- Official domains: arcteryx.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: gallery_asset_download -> official_product_page_screenshot -> local_mirror
- Notes: Arc'teryx localized product pages can mix icons, detail shots, and product imagery. Prefer Sanity-hosted official gallery assets when they show the jacket body or construction details clearly. Use a localized page screenshot only as a fallback when the page does not expose a usable product image.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Arc'teryx 默认入口` | 户外 | https://arcteryx.com/us/zh/shop/mens/alpha-sv-jacket-9899 | extraction: first_product
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
- Crawl mode: single_product_page
- Crawl notes: ASICS currently uses the China homepage as the stable discovery entry for tennis shoes. When the homepage cannot resolve a product card, fall back to the stored story image and existing product-specific source pages.
- Crawl entries:
  - `ASICS 中国官网首页` | 网球 | https://www.asics.com.cn/ | extraction: first_product
- Stories:
  - `asics-tennis` | 网球 | method: `local_mirror_of_official_asset` | priority: official_cms_asset_download -> local_mirror | local: `/news/sports/asics-gel-resolution-8-fixed.jpg` | candidate: https://images.asics.com/is/image/asics/1042A072_103_SR_RT_GLB-1?$product$ | status: ready

## Bobbi Brown

- Slug: `bobbi-brown`
- Categories: beauty
- Official domains: www.bobbibrown.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Bobbi Brown 默认入口` | 彩妆 | https://www.bobbibrown.com.cn/product/25706/104102/wechat/carousel1/intensive-serum-foundation-spf-40 | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Burberry 默认入口` | 服装 | https://www.burberry.cn/l/womens-clothing/new-arrivals/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Bvlgari 默认入口` | 腕表 | https://www.bulgari.cn/zh-cn/products/102678-e | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Cartier 默认入口` | 珠宝 | https://www.cartier.cn/creation/B6067517 | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `CHANDO 默认入口` | 护肤 | https://www.chando-himalaya.com/product_detail_1241756158335782912.html | extraction: first_product
- Stories:
  - `chando-purple` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chando-purple-real.png` | candidate: https://chandowebprd.chandogroup.com/images/aa434f1dafda4fdfa4fe30e2f75166ff.1776224329550.png | status: partial
  - `chando-foundation` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chando-foundation-real.png` | candidate: https://chandowebprd.chandogroup.com/images/d1c85c4d6616409192aea01aed1b3c50.1713838299550.png | status: partial

## Chanel

- Slug: `chanel`
- Categories: luxury
- Official domains: www.chanel.cn
- Story count: 11
- Status: ready 0, partial 11, needs replacement 0
- Brand methods: single_official_category_page -> official_editorial_asset_download -> local_mirror
- Notes: Chanel luxury stories currently work best from verified category or editorial landing pages rather than deep dynamic navigation. For watches, keep the category page as the stable source of truth and use editorials or packshots as product-image fallbacks.
- Crawl mode: single_product_page
- Crawl notes: Chanel watch automation should prefer the watch category page instead of brittle deep product links.
- Crawl entries:
  - `香奈儿中国官网腕表频道` | 腕表 | https://www.chanel.cn/cn/watches/ | extraction: first_product
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
  - `chanel-ss26-readytowear` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-ss26-readytowear.jpg` | candidate: https://www.chanel.cn/images/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1268/FSH-1771418302737-desktop-product_1.jpg | status: partial
  - `chanel-handbag-story` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/chanel-handbag-story.jpg` | candidate: https://www.chanel.cn/images/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1024/FSH-1742141327919-desktop-1112.jpg | status: partial

## CHANEL Beauty

- Slug: `chanel-beauty`
- Categories: beauty
- Official domains: www.chanel.cn
- Story count: 4
- Status: ready 0, partial 4, needs replacement 0
- Brand methods: single_official_product_page -> official_editorial_asset_download -> local_mirror
- Notes: CHANEL Beauty stories currently rely on stable product or fragrance pages and mirrored official product imagery.
- Crawl mode: single_product_page
- Crawl notes: Beauty automation can begin from category pages, then use verified product pages in the story rule set.
- Crawl entries:
  - `CHANEL Beauty 中国官网香氛` | 香水 | https://www.chanel.cn/cn/fragrance/ | extraction: first_product
- Stories:
  - `chanel-beauty-n5-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-n5.png` | candidate: none stored | status: partial
  - `chanel-beauty-chance-tendre` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-chance-tendre.png` | candidate: none stored | status: partial
  - `chanel-beauty-coco-mademoiselle` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-coco-mademoiselle.png` | candidate: none stored | status: partial
  - `chanel-beauty-chance-splendide` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/chanel-chance-splendide.jpg` | candidate: https://www.chanel.cn/images/t_one/w_0.45,h_0.45,c_crop/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1240/chance-eau-splendide-eau-de-parfum-spray-1-7fl-oz--packshot-default-136210-9561648758814.jpg | status: partial

## Charlotte Tilbury

- Slug: `charlotte-tilbury`
- Categories: beauty
- Official domains: www.charlottetilbury.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Charlotte Tilbury 默认入口` | 彩妆 | https://www.charlottetilbury.com/us/products/new | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Clé de Peau Beauté 默认入口` | 彩妆 | https://www.cledepeau-beaute.com.cn/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Clinique 默认入口` | 护肤 | https://www.clinique.com.cn/products/26195 | extraction: first_product
- Stories:
  - `clinique-yellow-moisturizer` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/clinique-yellow-moisturizer.jpg` | candidate: none stored | status: partial
  - `clinique-eb-milky-lotion` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/clinique-eb-milky-lotion.jpg` | candidate: none stored | status: partial

## DESCENTE

- Slug: `descente`
- Categories: sports
- Official domains: allterrain.descente.com
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: official_collection_asset_download -> official_page_screenshot -> local_mirror
- Notes: DESCENTE commerce pages can be blocked by Cloudflare in headless or server-side fetches. Use an accessible ALLTERRAIN official line asset or a clean official page screenshot, then mirror locally.
- Crawl mode: single_product_page
- Crawl notes: DESCENTE should use the ALLTERRAIN landing page as the stable crawl entry and recover through stored story rules when a direct PDP disappears.
- Crawl entries:
  - `DESCENTE ALLTERRAIN 官方网站` | 户外 | https://allterrain.descente.com/ | extraction: first_product
- Stories:
  - `descente-allterrain` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/descente-allterrain-hero.jpg` | candidate: https://allterrain.descente.com/wp-content/uploads/2026/02/26ss_index_allterrain_head_pc.jpg | status: partial
  - `descente-allterrain-81` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/descente-allterrain-81-hero.jpg` | candidate: https://allterrain.descente.com/wp-content/uploads/2026/02/26ss_index_81_head_pc.jpg | status: partial
  - `descente-allterrain-shell` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/descente-allterrain-81-hero.jpg` | candidate: none stored | status: partial

## Dior

- Slug: `dior`
- Categories: luxury
- Official domains: www.dior.cn
- Story count: 7
- Status: ready 0, partial 7, needs replacement 0
- Brand methods: verified_product_page_download -> official_product_page_image_download -> local_mirror
- Notes: Dior luxury stories currently use verified official product pages for bags and jewelry. Keep Dior luxury on verified product pages until a stable category or seasonal listing source is confirmed.
- Crawl mode: single_product_page
- Crawl notes: Dior luxury should continue using already verified bag and jewelry PDPs as crawl anchors.
- Crawl entries:
  - `Dior 女士皮具已验证产品页` | 皮包 | https://www.dior.cn/zh_cn/fashion/products/M1325OWHP_M030 | extraction: first_product
  - `Dior 珠宝已验证产品页` | 珠宝 | https://www.dior.com/zh_cn/fashion/products/JRDV95015_0000 | extraction: first_product
- Stories:
  - `dior-book-tote` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-book-tote.jpg` | candidate: none stored | status: partial
  - `dior-dioramour-book-tote` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-dioramour-book-tote.jpg` | candidate: none stored | status: partial
  - `dior-gem-dior` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-gem-dior.webp` | candidate: none stored | status: partial
  - `dior-lady-d-joy` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-lady-d-joy.jpg` | candidate: none stored | status: partial
  - `dior-rose-des-vents` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-rose-des-vents.webp` | candidate: none stored | status: partial
  - `dior-oui-ring` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-oui-ring.jpg` | candidate: none stored | status: partial
  - `dior-lady-d-joy` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/dior-lady-d-joy.jpg` | candidate: none stored | status: partial

## Dior Beauty

- Slug: `dior-beauty`
- Categories: beauty
- Official domains: www.dior.com, www.dior.cn
- Story count: 5
- Status: ready 0, partial 5, needs replacement 0
- Brand methods: whats_new_listing -> verified_product_page_download -> local_mirror
- Notes: Dior Beauty should begin from the official What’s New page and then fall back to verified beauty PDPs when needed. This keeps the brand aligned with current Dior Beauty refreshes while preserving known-good product sources.
- Crawl mode: single_product_page
- Crawl notes: Use What’s New for beauty freshness, and keep fragrance/category pages as stable fallbacks.
- Crawl entries:
  - `Dior Beauty What's New` | 彩妆 | https://www.dior.com/en_us/beauty/page/whats-new.html | extraction: first_product
  - `Dior Beauty Miss Dior` | 香水 | https://www.dior.cn/zh_cn/beauty/fragrance/womens_fragrance/miss-dior | extraction: first_product
- Stories:
  - `dior-beauty` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-forever-new.jpg` | candidate: https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/en_US/dw5e4619d5/Y0000149/Y0000149_E000001270_E01_RHC.jpg?sw=640 | status: partial
  - `dior-beauty-lips` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-addict-new.jpg` | candidate: https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/default/dw9831c51b/Y0319000/Y0319000_C031900038_E01_RHC.jpg?sw=640 | status: partial
  - `dior-beauty-miss-dior-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-miss-dior-real.jpg` | candidate: none stored | status: partial
  - `dior-beauty-jadore-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-jadore-real.jpg` | candidate: none stored | status: partial
  - `dior-beauty-sauvage-fragrance` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/dior-sauvage-real.jpg` | candidate: none stored | status: partial

## Estée Lauder

- Slug: `estee-lauder`
- Categories: beauty
- Official domains: www.esteelauder.com, www.esteelauder.com.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: cn_product_page_asset_download -> cn_series_page_asset_download -> local_mirror
- Notes: The global Estee Lauder media/export hotlinks can return 403 in server-side fetches. Prefer official China product or series pages, then download the visible product asset with a browser-like user agent and referer. Mirror the asset locally after download so the frontend does not depend on blocked hotlinks.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Estée Lauder 默认入口` | 护肤 | https://www.esteelauder.com/whats-new-skincare | extraction: first_product
- Stories:
  - `estee` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/estee-anr-official.jpg` | candidate: https://www.esteelauder.com.cn/media/export/cms/products/308x424/el_sku_G37B01_308x424_0.jpg?w=3840 | status: partial
  - `estee-makeup` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/estee-doublewear-local.png` | candidate: https://www.esteelauder.com/media/export/cms/products/308x424/el_sku_PH7G10_308x424_0.jpg | status: partial
  - `estee-re-nutriv` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/estee-re-nutriv-official.jpg` | candidate: none stored | status: partial

## Gucci

- Slug: `gucci`
- Categories: luxury
- Official domains: www.gucci.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Gucci 默认入口` | 皮包 | https://www.gucci.cn/zh/pr/760253AAA7G1000 | extraction: first_product
- Stories:
  - `gucci-horsebit` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/gucci-horsebit.webp` | candidate: none stored | status: partial
  - `gucci-marmont` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/gucci-marmont.webp` | candidate: none stored | status: partial
  - `gucci-horsebit-soft` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/gucci-horsebit-soft.webp` | candidate: none stored | status: partial

## Hermes

- Slug: `hermes`
- Categories: luxury
- Official domains: www.hermes.cn
- Story count: 14
- Status: ready 0, partial 14, needs replacement 0
- Brand methods: single_official_product_page -> official_category_page_fallback -> local_mirror
- Notes: Hermes can continue to use stable official product or category pages for watches, leather goods, jewelry, and fragrance. When broader category automation is added later, preserve the exact official product pages already verified in the story rules as fallbacks.
- Crawl mode: single_product_page
- Crawl notes: Hermes currently uses verified product/category pages rather than topic-feed extraction.
- Crawl entries:
  - `爱马仕中国官网腕表` | 腕表 | https://www.hermes.cn/cn/zh/jewelry-and-watches/watches/ | extraction: first_product
- Stories:
  - `hermes-hacademi` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-hacademi.webp` | candidate: none stored | status: partial
  - `hermes-mini-clic-kelly` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-mini-clic-kelly.webp` | candidate: none stored | status: partial
  - `hermes-arceau-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-arceau-watch.webp` | candidate: none stored | status: partial
  - `hermes-garden-party` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-garden-party.webp` | candidate: none stored | status: partial
  - `hermes-kelly-pocket` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-kelly-pocket.webp` | candidate: none stored | status: partial
  - `hermes-constance-slim` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-constance-slim.jpg` | candidate: https://assets.hermes.cn/is/image/hermesproduct/constance-slim%E9%92%B1%E5%8C%85--085259CC1H-front-wm-1-0-0-1000-1000_g.jpg | status: partial
  - `hermes-le-petit-sac` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-le-petit-sac.jpg` | candidate: https://assets.hermes.cn/is/image/hermesproduct/le-petit-sac%E6%89%8B%E6%8F%90%E5%8C%85--087968CC55-front-wm-1-0-0-1000-1000_g.jpg | status: partial
  - `hermes-zipengo` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-zipengo.jpg` | candidate: https://assets.hermes.cn/is/image/hermesproduct/zipengo-chaine-d-ancre%E5%B0%8F%E5%8F%B7%E6%89%8B%E5%8C%85--084321CC8L-front-wm-1-0-0-1000-1000_g.jpg | status: partial
  - `hermes-farandole` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-farandole.webp` | candidate: none stored | status: partial
  - `hermes-collier-de-chien` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-collier-de-chien.webp` | candidate: none stored | status: partial
  - `hermes-mini-clic-chaine-dancre` | 珠宝 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-mini-clic-chaine-dancre.jpg` | candidate: https://assets.hermes.cn/is/image/hermesproduct/mini-clic-chaine-d-ancre%E6%89%8B%E9%95%AF--209000FP19-worn-1-0-0-1000-1000_g.jpg | status: partial
  - `hermes-h08-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-h08-watch.webp` | candidate: none stored | status: partial
  - `hermes-cape-cod-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-cape-cod-watch.webp` | candidate: none stored | status: partial
  - `hermes-cape-cod-watch` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/hermes-cape-cod-watch.webp` | candidate: none stored | status: partial

## Hermès Beauty

- Slug: `hermes-beauty`
- Categories: beauty
- Official domains: www.hermes.cn
- Story count: 4
- Status: ready 0, partial 4, needs replacement 0
- Brand methods: single_official_product_page -> official_category_page_fallback -> local_mirror
- Notes: Hermès Beauty fragrance stories currently use stable category or product pages with mirrored local assets.
- Crawl mode: single_product_page
- Crawl notes: Hermès Beauty remains product-page led until broader category extraction is added.
- Crawl entries:
  - `Hermès Beauty 香氛` | 香水 | https://www.hermes.cn/cn/zh/category/fragrances/ | extraction: first_product
- Stories:
  - `hermes-beauty-terre-dhermes` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-terre-dhermes.jpg` | candidate: none stored | status: partial
  - `hermes-beauty-twilly-ginger` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-twilly-ginger.jpg` | candidate: none stored | status: partial
  - `hermes-beauty-nil-garden` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-nil-garden.jpg` | candidate: none stored | status: partial
  - `hermes-beauty-jardin-monsieur-li` | 香水 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/hermes-jardin-monsieur-li.png` | candidate: none stored | status: partial

## HONOR

- Slug: `honor`
- Categories: digital
- Official domains: www.honor.com
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `HONOR 默认入口` | 手机 | https://www.honor.com/cn/phones/honor-magic8-pro/ | extraction: first_product
- Stories:
  - `honor-magic8` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/honor-magic8.png` | candidate: none stored | status: partial
  - `honor-tablets` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/honor-tablets.png` | candidate: none stored | status: partial
  - `honor-magicbook` | 电脑 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/honor-magicbook-pro16.png` | candidate: none stored | status: partial

## Huawei

- Slug: `huawei`
- Categories: digital
- Official domains: consumer.huawei.com
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Huawei 默认入口` | 手机 | https://consumer.huawei.com/cn/phones/pura90-pro-max/ | extraction: first_product
- Stories:
  - `huawei-pura90` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/huawei-pura90.png` | candidate: none stored | status: partial
  - `huawei-matepad` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/huawei-matepad.jpg` | candidate: none stored | status: partial

## IPSA

- Slug: `ipsa`
- Categories: beauty
- Official domains: www.ipsa.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `IPSA 默认入口` | 护肤 | https://www.ipsa.com.cn/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Kiehl's 默认入口` | 护肤 | https://www.kiehls.com.cn/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `KOLON SPORT 默认入口` | 跑步 | https://www.kolonsport.com/Product/FE4TX26010BLK | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `La Mer 默认入口` | 护肤 | https://www.lamer.com.cn/product/24587/128775/the-protecting-veil | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 1.
- Crawl entries:
  - `Lancôme 默认入口` | 护肤 | https://www.lancome.com.cn/ | extraction: first_product
- Stories:
  - `lancome-home` | 护肤 | method: `homepage_product_card_capture_to_local_mirror` | priority: homepage_product_card_capture -> local_crop -> local_mirror | local: `/news/beauty/lancome-genifique-packshot-clean.jpg` | candidate: https://res-wxec-unipt.lorealchina.com/prod/lan/20250326/759cf952-d649-4834-af54-d1f665b2fea0.jpg | status: ready

## Lenovo

- Slug: `lenovo`
- Categories: digital
- Official domains: item.lenovo.com.cn, www.lenovo.com.cn
- Story count: 2
- Status: ready 0, partial 2, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Lenovo 默认入口` | 电脑 | https://item.lenovo.com.cn/product/1045787.html | extraction: first_product
- Stories:
  - `lenovo-yoga-air14` | 电脑 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/lenovo-yoga-air14.jpg` | candidate: none stored | status: partial
  - `lenovo-yoga-family` | 电脑 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/lenovo-yoga-air14.jpg` | candidate: none stored | status: partial

## Longines

- Slug: `longines`
- Categories: luxury
- Official domains: www.longines.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Longines 默认入口` | 腕表 | https://www.longines.cn/watch-hydroconquest-l3-840-4-96-6 | extraction: first_product
- Stories:
  - `longines-hydroconquest` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/longines-hydroconquest.png` | candidate: none stored | status: partial
  - `longines-conquest` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/longines-conquest.png` | candidate: none stored | status: partial
  - `longines-conquest-34` | 腕表 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/longines-conquest-34.png` | candidate: none stored | status: partial

## Louis Vuitton

- Slug: `louis-vuitton`
- Categories: luxury
- Official domains: www.louisvuitton.cn
- Story count: 13
- Status: ready 0, partial 13, needs replacement 0
- Brand methods: latest_page_first_product -> official_product_page_image_download -> local_mirror
- Notes: Louis Vuitton China should use 新品系列 for women and men, plus current seasonal topic pages. Each configured latest or topic page yields the first visible product image and its associated product link as the news candidate.
- Crawl mode: louis_vuitton_latest_pages
- Crawl notes: Use the first LV product image in each topic page and derive the product detail URL from the article code when possible.
- Crawl entries:
  - `女士新品` | 服装 | https://www.louisvuitton.cn/zhs-cn/new/for-women/the-latest/_/N-t18gb9e5 | extraction: first_product
  - `男士新品` | 皮包 | https://www.louisvuitton.cn/zhs-cn/new/for-men/the-latest/_/N-t1blflj9 | extraction: first_product
  - `LV Resort 系列` | 皮包 | https://www.louisvuitton.cn/zhs-cn/new/for-women/lv-resort-collection/_/N-t1h80en2 | extraction: first_product
  - `Flight Mode 系列` | 皮包 | https://www.louisvuitton.cn/zhs-cn/new/for-women/flight-mode-collection/_/N-t97bofk | extraction: first_product
  - `Nautical 系列` | 皮包 | https://www.louisvuitton.cn/zhs-cn/new/for-women/nautical/_/N-tyfjxmc | extraction: first_product
  - `春夏女装系列` | 皮包 | https://www.louisvuitton.cn/zhs-cn/new/for-women/spring-summer-2026-collection/_/N-t88m6o1 | extraction: first_product
  - `路易威登 × 村上隆合作系列` | 皮包 | https://www.louisvuitton.cn/zhs-cn/new/for-women/louis-vuitton-x-murakami/_/N-t2xost9 | extraction: first_product
- Stories:
  - `lv` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv.webp` | candidate: none stored | status: partial
  - `lv-readywear` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-readywear.webp` | candidate: none stored | status: partial
  - `lv-my-capucines` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-my-capucines.webp` | candidate: none stored | status: partial
  - `lv-sneakerina` | 服装 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-sneakerina.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-lv-sneakerina-%E9%9C%B2%E8%B7%9F%E9%9E%8B--AWU024MI01_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
  - `lv-keepall-bandouliere-25` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-keepall-bandouliere-25.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-keepall-bandouliere-25-%E6%89%8B%E8%A2%8B--M29272_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
  - `lv-speedy-bandouliere-20` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-speedy-bandouliere-20.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-speedy-bandouliere-20-%E6%89%8B%E8%A2%8B--M29459_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
  - `lv-hobo-pm` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-hobo-pm.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-hobo-%E5%B0%8F%E5%8F%B7%E6%89%8B%E8%A2%8B--M29068_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
  - `lv-baggy` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-baggy.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-baggy-%E6%89%8B%E8%A2%8B--M27329_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
  - `lv-multipass` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-multipass.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-multipass-%E6%89%8B%E8%A2%8B--M29094_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
  - `lv-x-tm-neverfull-mm` | 皮包 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/luxury/lv-x-tm-neverfull-mm.png` | candidate: https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-lv-x-tm-neverfull-%E4%B8%AD%E5%8F%B7%E6%89%8B%E8%A2%8B--M27787_PM2_Front%20view.png?wid=1440&hei=1440 | status: partial
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `MAOGEPING 默认入口` | 彩妆 | https://www.maogepingbeauty.com/makeup/light-shadow/Light-Highlighting/41.html | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Microsoft Surface 默认入口` | 电脑 | https://www.microsoft.com/zh-cn/surface/business/surface-laptop-6 | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Mizuno 默认入口` | 网球 | https://www.mizuno.com.cn/qiuxie/538.html | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `NARS 默认入口` | 彩妆 | https://www.narscosmetics.com.cn/soft-velvet-pdr-34101428.html | extraction: first_product
- Stories:
  - `nars-soft-velvet` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/nars-soft.jpg` | candidate: none stored | status: partial
  - `nars-light-reflecting` | 彩妆 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/nars-light.jpg` | candidate: none stored | status: partial

## Nike

- Slug: `nike`
- Categories: sports
- Official domains: www.nike.com.cn
- Story count: 16
- Status: ready 0, partial 16, needs replacement 0
- Brand methods: listing_first_product -> official_product_page_image_download -> local_mirror
- Notes: Nike China should start from 新品&潮流 under 潮流趋势 and then select the first product card from each themed listing page. Mirror the chosen product image locally after extracting the first product from each listing.
- Crawl mode: nike_trend_pages
- Crawl notes: Each configured listing page should yield the first visible product card as a news candidate.
- Crawl entries:
  - `耐克飞马42` | 跑步 | https://www.nike.com.cn/w/pegasus-40-present-running-shoes-2yknpz37v7jzy7ok | extraction: first_product
  - `耐克女子夜跑系列` | 跑步 | https://www.nike.com.cn/w/womens-running-essentials-4xmgfz5e1x6 | extraction: first_product
  - `ACG户外系列` | 户外 | https://www.nike.com.cn/w/acg-trail-running-75jcnz93bsd | extraction: first_product
  - `耐高超新星篮球系列` | 篮球 | https://www.nike.com.cn/w/chbl-4lx21 | extraction: first_product
  - `Lebron系列` | 篮球 | https://www.nike.com.cn/w/lebron-james-7y57x | extraction: first_product
  - `Ja系列` | 篮球 | https://www.nike.com.cn/w/ja-morant-4m5h1 | extraction: first_product
  - `耐克篮球新品` | 篮球 | https://www.nike.com.cn/w/basketball-3glsm | extraction: first_product
  - `国家队系列` | 足球 | https://www.nike.com.cn/w/national-team-av9de | extraction: first_product
  - `中超系列` | 足球 | https://www.nike.com.cn/w/nike-fc-a4rvy | extraction: first_product
  - `Football Club` | 足球 | https://www.nike.com.cn/w/football-club-6iait | extraction: first_product
  - `游泳专区` | 游泳 | https://www.nike.com.cn/w/swimming-3c2dj | extraction: first_product
- Stories:
  - `nike-basketball` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-basketball.png` | candidate: none stored | status: partial
  - `nike-basketball-feed` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-basketball-feed.png` | candidate: none stored | status: partial
  - `nike-ja3` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-ja3.jpg` | candidate: none stored | status: partial
  - `nike-phantom6` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-basketball.png` | candidate: none stored | status: partial
  - `nike-pegasus42` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-pegasus-42.png` | candidate: https://static.nike.com.cn/a/images/t_web_pw_592_v2/f_auto/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/11552a29-a08e-4019-8501-3eaae4f4a2cf/AIR%2BZOOM%2BPEGASUS%2B42.png | status: partial
  - `nike-running-family` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-pegasus-42.png` | candidate: none stored | status: partial
  - `nike-pegasus42-se` | 跑步 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-pegasus-42-se.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/95c1c635-3904-475e-921a-2b605e0850a5/W+AIR+ZOOM+PEGASUS+42+SE.png | status: partial
  - `nike-acg-zegama` | 户外 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-acg-zegama.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ae4293b0-205b-42a0-be3c-cf1f6f405e95/NIKE+ACG+ZEGAMA+TRAIL.png | status: partial
  - `nike-gt-cut-4-ep` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-gt-cut-4-ep.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/83730b18-631b-4dda-bdfb-a4bc2ec329a5/G.T.+CUT+4+LX+EP.png | status: partial
  - `nike-china-tech-jacket` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-china-tech-jacket.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a3fe95a2-797f-4c2f-b286-6c13647938c6/AS+CFA+M+TECH+WOVEN+TOP.png | status: partial
  - `nike-kobe-9-low-protro` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-kobe-9-low-protro.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/377c9460-7632-443f-b465-764ba5f7d236/KOBE+IX+ELITE+LOW+EM+PROTRO.png | status: partial
  - `nike-lebron-23-ep` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-lebron-23-ep.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/5eaa709b-cfe0-4ef5-b706-f90b952ac3cb/LEBRON+XXIII+EP.png | status: partial
  - `nike-ja-3-jp-ep` | 篮球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-ja-3-jp-ep.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/38b2ca41-20ea-40a8-837c-5a80ef20f066/JA+3+JP+EP.png | status: partial
  - `nike-shenhua-top` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-shenhua-top.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/516a2e3a-5b77-40d1-b7fe-3ca6a0d378b3/AS+SGS+M+NK+DF+ACD+SS+TOP+G.png | status: partial
  - `nike-england-home-jersey` | 足球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-england-2026-home-jersey.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/0bb0368e-cb48-4dfc-9b59-7325d7a9c181/ENT+M+NK+DF+JSY+SS+STAD+HM.png | status: partial
  - `nike-swim-hydrastrong` | 游泳 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/nike-swim-hydrastrong.png` | candidate: https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a3523998-276e-4882-b8d4-48e25afc3525/NK+PLY+SLD+JAMMER+WITH+GUSSET.png | status: partial

## OMEGA

- Slug: `omega`
- Categories: luxury
- Official domains: www.omegawatches.cn
- Story count: 3
- Status: ready 0, partial 3, needs replacement 0
- Brand methods: local_mirror
- Notes: Default rule file generated from the current story dataset. For remote official assets, the server can download and mirror the current image URL directly.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `OMEGA 默认入口` | 腕表 | https://www.omegawatches.cn/watches/speedmaster/moonwatch-professional/product | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `On 默认入口` | 跑步 | https://www.on.com/en-us/products/cloudsurfer-max-m-3mf3043/mens | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `OPPO 默认入口` | 手机 | https://www.oppo.com/cn/smartphones/series-find-x/find-x9/ | extraction: first_product
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
- Crawl mode: single_product_page
- Crawl notes: Prada currently works best from verified product pages because many category pages are dynamically rendered and can fail under headless fetch. Keep using verified product pages and the DAM reconstruction pattern until a stable Prada category-feed parser is added.
- Crawl entries:
  - `Prada 皮包已验证产品页` | 皮包 | https://www.prada.cn/cn/zh/p/prada-passage-medium-leather-bag-with-re-nylon-flap/1BA495_2G52_F0201_V_OPO | extraction: first_product
  - `Prada 成衣已验证产品页` | 服装 | https://www.prada.cn/cn/zh/p/lace-dress/P3Q17_17VM_F0002_S_OOO | extraction: first_product
  - `Prada 珠宝已验证产品页` | 珠宝 | https://www.prada.cn/cn/zh/women/jewelry/fine_jewelry_collection/products.Eternal_Gold_medium_pendant_necklace_in_yellow_gold.1JCA06_2DA5_F0056.html | extraction: first_product
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
- Brand methods: verified_product_page_download -> official_product_page_image_download -> local_mirror
- Notes: Prada Beauty fragrance stories currently work most reliably from verified perfume product pages. Use the verified fragrance PDPs first, then mirror official product images locally.
- Crawl mode: single_product_page
- Crawl notes: Prada Beauty remains PDP-led until a stable China fragrance category parser is verified.
- Crawl entries:
  - `Prada Beauty Paradoxe` | 香水 | https://www.prada.cn/cn/zh/p/paradoxe-radical-essence-30ml/1A1355_2H0P_F0Z99_P_ML030 | extraction: first_product
  - `Prada Beauty Luna Rossa` | 香水 | https://www.prada.cn/cn/zh/p/luna-rossa-ocean-edt-100-ml/2A1156_2D00_F0Z99_P_ML100 | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `PROYA 默认入口` | 护肤 | https://www.proya.com/ | extraction: first_product
- Stories:
  - `proya-redruby` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/proya-redruby.png` | candidate: none stored | status: partial
  - `proya-dualkang` | 护肤 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/beauty/proya-dualkang.png` | candidate: none stored | status: partial

## Samsung

- Slug: `samsung`
- Categories: digital
- Official domains: www.samsung.com
- Story count: 4
- Status: ready 0, partial 4, needs replacement 0
- Brand methods: homepage_module_capture -> verified_official_page_download -> local_mirror
- Notes: Samsung currently uses the China homepage as the stable discovery surface for phone, tablet, and accessory updates. When homepage modules shift, keep the mirrored official image assets and story-level PDP references as fallbacks.
- Crawl mode: single_product_page
- Crawl notes: Samsung is homepage-led for now; future category-specific Galaxy parsers can replace this single_product_page-style fallback.
- Crawl entries:
  - `三星中国官网首页` | 手机 | https://www.samsung.com/cn/ | extraction: first_product
  - `三星中国官网首页` | 平板 | https://www.samsung.com/cn/ | extraction: first_product
  - `三星中国官网首页` | 配件 | https://www.samsung.com/cn/ | extraction: first_product
- Stories:
  - `samsung-tablet` | 平板 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/samsung-tablet.jpg` | candidate: none stored | status: partial
  - `samsung-phone` | 手机 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/samsung-phone.jpg` | candidate: none stored | status: partial
  - `samsung-buds` | 配件 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/samsung-phone.jpg` | candidate: none stored | status: partial
  - `samsung-galaxy-ecosystem` | 配件 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/digital/samsung-tablet.jpg` | candidate: none stored | status: partial

## SHISEIDO

- Slug: `shiseido`
- Categories: beauty
- Official domains: www.shiseido.com.cn
- Story count: 3
- Status: ready 3, partial 0, needs replacement 0
- Brand methods: product_detail_packshot_download -> homepage_product_card_capture -> local_mirror
- Notes: For direct product stories, use the 1000x1000 itemmaster packshot from the product detail page. For homepage-led stories, prefer a product-card crop over a text-heavy hero banner.
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 3.
- Crawl entries:
  - `SHISEIDO 默认入口` | 护肤 | https://www.shiseido.com.cn/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Shu Uemura 默认入口` | 彩妆 | https://www.shuuemura.com.cn/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Tiffany & Co. 默认入口` | 珠宝 | https://www.tiffany.cn/jewelry/items/tiffany-hardwear-link-necklace-38086766/ | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 3.
- Crawl entries:
  - `Van Cleef & Arpels 默认入口` | 珠宝 | https://www.vancleefarpels.cn/cn/zh/collections/jewelry/alhambra/vcarp9xg00---vintage-alhambra-pendant.html | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `vivo 默认入口` | 手机 | https://www.vivo.com.cn/vivo/xfold/ | extraction: first_product
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
- Crawl mode: single_product_page
- Crawl notes: Wilson uses the tennis entry page as the stable brand landing page, with blog or product pages as story-specific fallbacks.
- Crawl entries:
  - `Wilson Tennis` | 网球 | https://www.wilson.com/en-us/tennis | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `Winona 默认入口` | 护肤 | https://www.winona.cn/product/110010.html | extraction: first_product
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
- Crawl mode: generic_html
- Crawl notes: This brand currently falls back to the default source page recorded from the existing story dataset. When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: 0.
- Crawl entries:
  - `YONEX 默认入口` | 网球 | https://www.yonex.cn/home/index/mall/id/1 | extraction: first_product
- Stories:
  - `yonex-tennis` | 网球 | method: `local_mirror_of_official_asset` | priority: local_mirror | local: `/news/sports/yonex-tennis-page.png` | candidate: none stored | status: partial

