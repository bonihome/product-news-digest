import fs from 'node:fs/promises'
import path from 'node:path'

import { beautyNews } from '../src/data/beautyNews.ts'
import { digitalNews } from '../src/data/digitalNews.ts'
import { luxuryNews } from '../src/data/luxuryNews.ts'
import { sportsNews } from '../src/data/sportsNews.ts'
import { webgamesNews } from '../src/data/webgamesNews.ts'
import type { Story } from '../src/data/types.ts'

type AutomationStatus = 'ready' | 'partial' | 'needs_replacement'

type StoryRule = {
  storyId: string
  title: string
  category: Story['category']
  subcategory: string
  products: string[]
  sourceType: Story['sourceType']
  sourcePage: string
  currentImage: string
  currentImageMode: 'local' | 'remote'
  currentImageHost: string | null
  automationStatus: AutomationStatus
  acquisition: {
    method: string
    priority: string[]
    localMirrorPath: string | null
    candidateImageUrl: string | null
    candidateImageHost: string | null
    notes: string[]
  }
}

type BrandRule = {
  schemaVersion: number
  brand: string
  slug: string
  categories: string[]
  officialDomains: string[]
  remoteImageHosts: string[]
  summary: {
    storyCount: number
    readyCount: number
    partialCount: number
    needsReplacementCount: number
  }
  strategy: {
    brandLevelMethods: string[]
    notes: string[]
  }
  crawl: {
    mode:
      | 'generic_html'
      | 'single_product_page'
      | 'prada_category_pages'
      | 'samsung_buy_pages'
      | 'poki_new_games'
      | 'crazygames_new_games'
      | 'arcadrome_home_games'
      | 'nike_trend_pages'
      | 'adidas_home_feed_pages'
      | 'louis_vuitton_latest_pages'
    entryPages: Array<{
      label: string
      subcategory: string
      url: string
      extraction: 'first_product'
    }>
    fallbackUrl: string | null
    notes: string[]
  }
  stories: StoryRule[]
}

type BrandMethodSummary = {
  brand: string
  slug: string
  categories: string[]
  officialDomains: string[]
  storyCount: number
  status: BrandRule['summary']
  methods: string[]
  notes: string[]
  crawlMode: BrandRule['crawl']['mode']
  crawlNotes: string[]
  crawlEntries: Array<{
    label: string
    subcategory: string
    url: string
    extraction: 'first_product'
  }>
  stories: Array<{
    storyId: string
    subcategory: string
    sourcePage: string
    method: string
    priority: string[]
    localMirrorPath: string | null
    candidateImageUrl: string | null
    automationStatus: AutomationStatus
  }>
}

const allStories = [...luxuryNews, ...beautyNews, ...sportsNews, ...digitalNews, ...webgamesNews]
const outputDir = path.resolve('data/image-rules')

const brandStrategyOverrides: Record<
  string,
  {
    methods: string[]
    notes: string[]
    crawl?: BrandRule['crawl']
  }
> = {
  Prada: {
    methods: ['resolved_browser_image', 'reconstructed_dam_path', 'local_mirror'],
    notes: [
      'Prada bag, ready-to-wear, and jewelry pages can fail in browser with HTTP2 errors.',
      'When browser extraction fails, reconstruct the DAM path from productCode, material, color, and variant.',
      'Prefer SLF front-view assets and mirror them locally for stable server delivery.',
    ],
    crawl: {
      mode: 'prada_category_pages',
      entryPages: [
        { label: 'Prada 女士新品', subcategory: '皮包', url: 'https://www.prada.cn/cn/zh/womens/new-in/c/10111CN', extraction: 'first_product' },
        { label: 'Prada 女士新品', subcategory: '服装', url: 'https://www.prada.cn/cn/zh/womens/new-in/c/10111CN', extraction: 'first_product' },
        { label: 'Prada Eternal Gold 系列', subcategory: '珠宝', url: 'https://www.prada.cn/cn/zh/fine-jewelry/eternal-gold/c/10763CN', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.prada.cn/cn/zh.html',
      notes: [
        'Prada now begins from the women new-in or Eternal Gold collection pages so the pipeline can follow fresher arrivals instead of a single fixed PDP.',
        'If category extraction fails, keep using verified product pages and the DAM reconstruction pattern as fallbacks.',
      ],
    },
  },
  'Van Cleef & Arpels': {
    methods: ['product_gallery_currentSrc', 'local_mirror'],
    notes: [
      'Use the exact product page gallery and prefer the front or detail image from currentSrc.',
      'Local PNG mirrors are more stable than relying on live CN CDN responses.',
    ],
  },
  'Lancôme': {
    methods: ['homepage_product_card_capture', 'local_crop'],
    notes: [
      'Lancôme China is heavily front-end rendered and product links are not consistently exposed in HTML.',
      'For homepage-led stories, capture the visible product card or module image and mirror locally.',
    ],
  },
  SHISEIDO: {
    methods: ['product_detail_packshot_download', 'homepage_product_card_capture', 'local_mirror'],
    notes: [
      'For direct product stories, use the 1000x1000 itemmaster packshot from the product detail page.',
      'For homepage-led stories, prefer a product-card crop over a text-heavy hero banner.',
    ],
  },
  CHANDO: {
    methods: ['browser_product_image_download', 'official_product_card_download', 'local_mirror'],
    notes: [
      'CHANDO product images can be blocked when fetched without a referer and user agent.',
      'Use the official product detail page in a browser session or send the page as referer when downloading product images from chandowebprd.chandogroup.com.',
      'Mirror the verified product image locally after download.',
    ],
  },
  'Estée Lauder': {
    methods: ['cn_product_page_asset_download', 'cn_series_page_asset_download', 'local_mirror'],
    notes: [
      'The global Estee Lauder media/export hotlinks can return 403 in server-side fetches.',
      'Prefer official China product or series pages, then download the visible product asset with a browser-like user agent and referer.',
      'Mirror the asset locally after download so the frontend does not depend on blocked hotlinks.',
    ],
  },
  'Prada Beauty': {
    methods: ['verified_product_page_download', 'official_product_page_image_download', 'local_mirror'],
    notes: [
      'Prada Beauty fragrance stories currently work most reliably from verified perfume product pages.',
      'Use the verified fragrance PDPs first, then mirror official product images locally.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: 'Prada Beauty Paradoxe', subcategory: '香水', url: 'https://www.prada.cn/cn/zh/p/paradoxe-radical-essence-30ml/1A1355_2H0P_F0Z99_P_ML030', extraction: 'first_product' },
        { label: 'Prada Beauty Luna Rossa', subcategory: '香水', url: 'https://www.prada.cn/cn/zh/p/luna-rossa-ocean-edt-100-ml/2A1156_2D00_F0Z99_P_ML100', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.prada.cn/cn/zh/beauty.html',
      notes: [
        'Prada Beauty remains PDP-led until a stable China fragrance category parser is verified.',
      ],
    },
  },
  Dior: {
    methods: ['verified_product_page_download', 'official_product_page_image_download', 'local_mirror'],
    notes: [
      'Dior luxury stories currently use verified official product pages for bags and jewelry.',
      'Keep Dior luxury on verified product pages until a stable category or seasonal listing source is confirmed.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: 'Dior Lady D-Joy 手袋系列页', subcategory: '皮包', url: 'https://www.dior.cn/zh_cn/fashion/bags/lady-d-joy', extraction: 'first_product' },
        { label: 'Dior Rose des Vents 珠宝系列页', subcategory: '珠宝', url: 'https://www.dior.cn/zh_cn/fashion/jewelry-timepieces/rose-des-vents-home', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.dior.cn/zh_cn/fashion',
      notes: [
        'Dior luxury now starts from Lady D-Joy and Rose des Vents series pages so the pipeline can follow current series-led merchandising.',
      ],
    },
  },
  'Dior Beauty': {
    methods: ['whats_new_listing', 'verified_product_page_download', 'local_mirror'],
    notes: [
      'Dior Beauty should begin from the official What’s New page and then fall back to verified beauty PDPs when needed.',
      'This keeps the brand aligned with current Dior Beauty refreshes while preserving known-good product sources.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: "Dior Beauty What's New", subcategory: '彩妆', url: 'https://www.dior.com/en_us/beauty/page/whats-new.html', extraction: 'first_product' },
        { label: 'Dior Beauty Miss Dior 系列', subcategory: '香水', url: 'https://www.dior.cn/zh_cn/beauty/fragrance/womens_fragrance/miss-dior', extraction: 'first_product' },
        { label: 'Dior Beauty J’adore 系列', subcategory: '香水', url: 'https://www.dior.cn/zh_cn/beauty/fragrance/womens_fragrance/jadore', extraction: 'first_product' },
        { label: 'Dior Beauty Sauvage 产品页', subcategory: '香水', url: 'https://www.dior.cn/zh_cn/beauty/products/y0685240-sauvage-eau-de-toilette', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.dior.cn/zh_cn/beauty',
      notes: [
        'Use What’s New for beauty freshness, and keep fragrance/category pages as stable fallbacks.',
      ],
    },
  },
  On: {
    methods: ['product_gallery_currentSrc_download', 'local_mirror'],
    notes: [
      'On product pages expose stable product gallery assets through currentSrc values on brand CDN images.',
      'Prefer the first hero gallery image and mirror it locally for product cards.',
    ],
  },
  "Arc'teryx": {
    methods: ['gallery_asset_download', 'official_product_page_screenshot', 'local_mirror'],
    notes: [
      "Arc'teryx localized product pages can mix icons, detail shots, and product imagery.",
      'Prefer Sanity-hosted official gallery assets when they show the jacket body or construction details clearly.',
      'Use a localized page screenshot only as a fallback when the page does not expose a usable product image.',
    ],
  },
  'KOLON SPORT': {
    methods: ['product_gallery_download', 'local_mirror'],
    notes: [
      'KOLON SPORT product pages expose stable gallery assets on images.kolonmall.com.',
      'Prefer the LM1 front-view product image for the lead card, then mirror locally.',
    ],
  },
  Bvlgari: {
    methods: ['official_catalog_product_image_download', 'official_collection_asset_download', 'local_mirror'],
    notes: [
      'Bvlgari China watch listing pages embed stable catalog product PNG assets under /media/catalog/product/cache/.',
      'Prefer exact watch packshots from the watch listing payload for Serpenti and Octo stories, then mirror locally.',
    ],
  },
  'Shu Uemura': {
    methods: ['official_homepage_banner_download', 'official_collection_asset_download', 'local_mirror'],
    notes: [
      'Shu Uemura China homepage exposes stable hero banner assets on res-wxec-unipt.lorealchina.com.',
      'Prefer a banner that clearly shows the featured product, such as the Ultime8 cleansing oil visual, then mirror locally.',
    ],
  },
  "Kiehl's": {
    methods: ['official_products_page_download', 'official_homepage_banner_download', 'local_mirror'],
    notes: [
      'Kiehl’s China about/products page exposes stable official product-collage images on res-wxec-unipt.lorealchina.com.',
      'Prefer the products-page collages that clearly show Calendula toner, dark spot serum, cream, or mask, then mirror locally.',
    ],
  },
  ASICS: {
    methods: ['official_cms_asset_download', 'homepage_or_collection_asset_download', 'local_mirror'],
    notes: [
      'ASICS China product pages can be inconsistent, but official cms-static.asics.com media library assets are stable once identified from the page source.',
      'Prefer the square product image for tennis shoe stories, then mirror it locally.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        {
          label: 'ASICS 中国官网首页',
          subcategory: '网球',
          url: 'https://www.asics.com.cn/',
          extraction: 'first_product',
        },
      ],
      fallbackUrl: 'https://www.asics.com.cn/',
      notes: [
        'ASICS currently uses the China homepage as the stable discovery entry for tennis shoes.',
        'When the homepage cannot resolve a product card, fall back to the stored story image and existing product-specific source pages.',
      ],
    },
  },
  Wilson: {
    methods: ['official_blog_asset_download', 'official_product_page_image_download', 'local_mirror'],
    notes: [
      'Wilson official blog pages expose stable article media URLs that can be mirrored locally.',
      'For Rush Pro stories, prefer the official blog hero image first, then fall back to the tennis product page if needed.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        {
          label: 'Wilson Tennis',
          subcategory: '网球',
          url: 'https://www.wilson.com/en-us/tennis',
          extraction: 'first_product',
        },
      ],
      fallbackUrl: 'https://www.wilson.com/en-us/tennis',
      notes: [
        'Wilson uses the tennis entry page as the stable brand landing page, with blog or product pages as story-specific fallbacks.',
      ],
    },
  },
  Nike: {
    methods: ['listing_first_product', 'official_product_page_image_download', 'local_mirror'],
    notes: [
      'Nike China should start from 新品&潮流 under 潮流趋势 and then select the first product card from each themed listing page.',
      'Mirror the chosen product image locally after extracting the first product from each listing.',
    ],
    crawl: {
      mode: 'nike_trend_pages',
      entryPages: [
        { label: '耐克飞马42', subcategory: '跑步', url: 'https://www.nike.com.cn/w/pegasus-40-present-running-shoes-2yknpz37v7jzy7ok', extraction: 'first_product' },
        { label: '耐克女子夜跑系列', subcategory: '跑步', url: 'https://www.nike.com.cn/w/womens-running-essentials-4xmgfz5e1x6', extraction: 'first_product' },
        { label: 'ACG户外系列', subcategory: '户外', url: 'https://www.nike.com.cn/w/acg-trail-running-75jcnz93bsd', extraction: 'first_product' },
        { label: '耐高超新星篮球系列', subcategory: '篮球', url: 'https://www.nike.com.cn/w/chbl-4lx21', extraction: 'first_product' },
        { label: 'Lebron系列', subcategory: '篮球', url: 'https://www.nike.com.cn/w/lebron-james-7y57x', extraction: 'first_product' },
        { label: 'Ja系列', subcategory: '篮球', url: 'https://www.nike.com.cn/w/ja-morant-4m5h1', extraction: 'first_product' },
        { label: '耐克篮球新品', subcategory: '篮球', url: 'https://www.nike.com.cn/w/basketball-3glsm', extraction: 'first_product' },
        { label: '国家队系列', subcategory: '足球', url: 'https://www.nike.com.cn/w/national-team-av9de', extraction: 'first_product' },
        { label: '中超系列', subcategory: '足球', url: 'https://www.nike.com.cn/w/nike-fc-a4rvy', extraction: 'first_product' },
        { label: 'Football Club', subcategory: '足球', url: 'https://www.nike.com.cn/w/football-club-6iait', extraction: 'first_product' },
        { label: '游泳专区', subcategory: '游泳', url: 'https://www.nike.com.cn/w/swimming-3c2dj', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.nike.com.cn/',
      notes: [
        'Each configured listing page should yield the first visible product card as a news candidate.',
      ],
    },
  },
  Adidas: {
    methods: ['home_module_first_product', 'official_product_page_image_download', 'local_mirror'],
    notes: [
      'Adidas China should use 聚焦热点 and 新品推荐 modules as the entry surface for new products.',
      'Each module topic resolves to a listing or SPLP page, where the first product is used as the news candidate.',
    ],
    crawl: {
      mode: 'adidas_home_feed_pages',
      entryPages: [
        { label: '极速蓝调', subcategory: '篮球', url: 'https://www.adidas.com.cn/splp?contentId=SPLP_IGbhLTTi', extraction: 'first_product' },
        { label: '自由人系列', subcategory: '户外', url: 'https://www.adidas.com.cn/plp/campaign_25Aug_freehiker', extraction: 'first_product' },
        { label: '静奢甄选', subcategory: '运动休闲', url: 'https://www.adidas.com.cn/plp/homefeed_26Mar_refine_lux', extraction: 'first_product' },
        { label: '城市机能风', subcategory: '户外', url: 'https://www.adidas.com.cn/splp?contentId=SPLP_XHMibwZg', extraction: 'first_product' },
        { label: '东方柔雅风', subcategory: '运动休闲', url: 'https://www.adidas.com.cn/splp?contentId=SPLP_KrbvhObt', extraction: 'first_product' },
        { label: '三条纹舞动系列', subcategory: '运动休闲', url: 'https://www.adidas.com.cn/splp?contentId=SPLP_b4IzzDUp', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.adidas.com.cn/',
      notes: [
        'When a home module listing no longer exposes a parseable first product, fall back to homepage-specific static stories and stored image rules.',
      ],
    },
  },
  'Louis Vuitton': {
    methods: ['latest_page_first_product', 'official_product_page_image_download', 'local_mirror'],
    notes: [
      'Louis Vuitton China should use 新品系列 for women and men, plus current seasonal topic pages.',
      'Each configured latest or topic page yields the first visible product image and its associated product link as the news candidate.',
    ],
    crawl: {
      mode: 'louis_vuitton_latest_pages',
      entryPages: [
        { label: '女士新品', subcategory: '服装', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/the-latest/_/N-t18gb9e5', extraction: 'first_product' },
        { label: '男士新品', subcategory: '皮包', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-men/the-latest/_/N-t1blflj9', extraction: 'first_product' },
        { label: 'LV Resort 系列', subcategory: '皮包', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/lv-resort-collection/_/N-t1h80en2', extraction: 'first_product' },
        { label: 'Flight Mode 系列', subcategory: '皮包', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/flight-mode-collection/_/N-t97bofk', extraction: 'first_product' },
        { label: 'Nautical 系列', subcategory: '皮包', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/nautical/_/N-tyfjxmc', extraction: 'first_product' },
        { label: '春夏女装系列', subcategory: '皮包', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/spring-summer-2026-collection/_/N-t88m6o1', extraction: 'first_product' },
        { label: '路易威登 × 村上隆合作系列', subcategory: '皮包', url: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/louis-vuitton-x-murakami/_/N-t2xost9', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.louisvuitton.cn/zhs-cn/new',
      notes: [
        'Use the first LV product image in each topic page and derive the product detail URL from the article code when possible.',
      ],
    },
  },
  Hermes: {
    methods: ['single_official_product_page', 'official_category_page_fallback', 'local_mirror'],
    notes: [
      'Hermes can continue to use stable official product or category pages for watches, leather goods, jewelry, and fragrance.',
      'When broader category automation is added later, preserve the exact official product pages already verified in the story rules as fallbacks.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: '爱马仕中国官网腕表', subcategory: '腕表', url: 'https://www.hermes.cn/cn/zh/jewelry-and-watches/watches/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.hermes.cn/cn/zh/',
      notes: [
        'Hermes currently uses verified product/category pages rather than topic-feed extraction.',
      ],
    },
  },
  Chanel: {
    methods: ['single_official_category_page', 'official_editorial_asset_download', 'local_mirror'],
    notes: [
      'Chanel luxury stories currently work best from verified category or editorial landing pages rather than deep dynamic navigation.',
      'For watches, keep the category page as the stable source of truth and use editorials or packshots as product-image fallbacks.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: '香奈儿中国官网腕表频道', subcategory: '腕表', url: 'https://www.chanel.cn/cn/watches/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.chanel.cn/cn/watches/',
      notes: [
        'Chanel watch automation should prefer the watch category page instead of brittle deep product links.',
      ],
    },
  },
  'CHANEL Beauty': {
    methods: ['single_official_product_page', 'official_editorial_asset_download', 'local_mirror'],
    notes: [
      'CHANEL Beauty stories currently rely on stable product or fragrance pages and mirrored official product imagery.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: 'CHANEL Beauty 中国官网香氛', subcategory: '香水', url: 'https://www.chanel.cn/cn/fragrance/', extraction: 'first_product' },
        { label: 'CHANEL Beauty N°5 产品页', subcategory: '香水', url: 'https://www.chanel.cn/cn/fragrance/p/125530/n5-eau-de-parfum-spray/', extraction: 'first_product' },
        { label: 'CHANEL Beauty Chance 系列产品页', subcategory: '香水', url: 'https://www.chanel.cn/cn/fragrance/p/136210/chance-eau-splendide-eau-de-parfum-spray/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.chanel.cn/cn/beauty/',
      notes: [
        'Beauty automation can begin from category pages, then use verified product pages in the story rule set.',
      ],
    },
  },
  'Hermès Beauty': {
    methods: ['single_official_product_page', 'official_category_page_fallback', 'local_mirror'],
    notes: [
      'Hermès Beauty fragrance stories currently use stable category or product pages with mirrored local assets.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: 'Hermès Beauty 香氛', subcategory: '香水', url: 'https://www.hermes.cn/cn/zh/category/fragrances/', extraction: 'first_product' },
        { label: 'Hermès Beauty Terre d’Hermès 产品页', subcategory: '香水', url: 'https://www.hermes.cn/cn/zh/product/%E7%88%B1%E9%A9%AC%E4%BB%95%E5%A4%A7%E5%9C%B0%E9%A6%A5%E9%83%81%E9%A6%99%E6%A0%B9%E8%8D%89%E9%A6%99%E5%9E%8B%E9%A6%99%E6%B0%B4-V40946/', extraction: 'first_product' },
        { label: 'Hermès Beauty Twilly d’Hermès 产品页', subcategory: '香水', url: 'https://www.hermes.cn/cn/zh/product/%E7%88%B1%E9%A9%AC%E4%BB%95%E4%B8%9D%E6%84%8F%E8%8D%94%E9%9F%B5%E6%B7%A1%E9%A6%99%E7%B2%BE-V110826VN/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.hermes.cn/cn/zh/category/beauty/',
      notes: [
        'Hermès Beauty remains product-page led until broader category extraction is added.',
      ],
    },
  },
  Samsung: {
    methods: ['homepage_module_capture', 'verified_official_page_download', 'local_mirror'],
    notes: [
      'Samsung currently uses the China homepage as the stable discovery surface for phone, tablet, and accessory updates.',
      'When homepage modules shift, keep the mirrored official image assets and story-level PDP references as fallbacks.',
    ],
    crawl: {
      mode: 'samsung_buy_pages',
      entryPages: [
        { label: 'Galaxy S26 Ultra', subcategory: '手机', url: 'https://www.samsung.com.cn/smartphones/galaxy-s26-ultra/buy/', extraction: 'first_product' },
        { label: 'Galaxy Tab S11', subcategory: '平板', url: 'https://www.samsung.com.cn/tablets/galaxy-tab-s11/buy/', extraction: 'first_product' },
        { label: 'Galaxy Buds4 Pro', subcategory: '配件', url: 'https://www.samsung.com.cn/audio-sound/galaxy-buds4-pro/buy/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.samsung.com.cn/',
      notes: [
        'Samsung now uses product-category buy pages for phones, tablets, and accessories instead of only the homepage.',
      ],
    },
  },
  Poki: {
    methods: ['new_games_listing_parse', 'detail_page_og_image_download', 'local_mirror'],
    notes: [
      'Poki exposes a structured New Games page and individual game detail pages with stable og:image assets.',
      'Prefer the newest game tile from the New Games collection, then mirror the game logo locally.',
    ],
    crawl: {
      mode: 'poki_new_games',
      entryPages: [
        { label: 'Poki New Games', subcategory: '新游', url: 'https://poki.com/en/new', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://poki.com/en/new',
      notes: [
        'Use Poki New Games as the primary discovery surface and fetch the first current game from the structured games feed.',
      ],
    },
  },
  CrazyGames: {
    methods: ['new_games_listing_parse', 'detail_page_og_image_download', 'local_mirror'],
    notes: [
      'CrazyGames exposes a dedicated New page where the first game route can be extracted directly from the listing HTML.',
      'After finding the game URL, fetch the detail page title and og:image as the stable news source.',
    ],
    crawl: {
      mode: 'crazygames_new_games',
      entryPages: [
        { label: 'CrazyGames New', subcategory: '新游', url: 'https://www.crazygames.com/new', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://www.crazygames.com/new',
      notes: [
        'Use the CrazyGames New page and promote the first listed game into the webgame news feed.',
      ],
    },
  },
  Arcadrome: {
    methods: ['homepage_new_game_parse', 'detail_page_og_image_download', 'local_mirror'],
    notes: [
      'Arcadrome homepage exposes its latest game links directly in HTML and each game detail page provides a stable title and og:image.',
      'Use the homepage first visible game entry as the newest game signal.',
    ],
    crawl: {
      mode: 'arcadrome_home_games',
      entryPages: [
        { label: 'Arcadrome 首页新游', subcategory: '新游', url: 'https://arcadrome.com/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://arcadrome.com/',
      notes: [
        'Use the Arcadrome homepage first game card as the current new-game source.',
      ],
    },
  },
  DESCENTE: {
    methods: ['official_collection_asset_download', 'official_page_screenshot', 'local_mirror'],
    notes: [
      'DESCENTE commerce pages can be blocked by Cloudflare in headless or server-side fetches.',
      'Use an accessible ALLTERRAIN official line asset or a clean official page screenshot, then mirror locally.',
    ],
    crawl: {
      mode: 'single_product_page',
      entryPages: [
        { label: 'DESCENTE ALLTERRAIN 官方网站', subcategory: '户外', url: 'https://allterrain.descente.com/', extraction: 'first_product' },
      ],
      fallbackUrl: 'https://allterrain.descente.com/',
      notes: [
        'DESCENTE should use the ALLTERRAIN landing page as the stable crawl entry and recover through stored story rules when a direct PDP disappears.',
      ],
    },
  },
}

const storyCandidateImageUrls: Record<string, string> = {
  'lv-sneakerina':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-lv-sneakerina-%E9%9C%B2%E8%B7%9F%E9%9E%8B--AWU024MI01_PM2_Front%20view.png?wid=1440&hei=1440',
  'lv-keepall-bandouliere-25':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-keepall-bandouliere-25-%E6%89%8B%E8%A2%8B--M29272_PM2_Front%20view.png?wid=1440&hei=1440',
  'lv-speedy-bandouliere-20':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-speedy-bandouliere-20-%E6%89%8B%E8%A2%8B--M29459_PM2_Front%20view.png?wid=1440&hei=1440',
  'lv-hobo-pm':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-hobo-%E5%B0%8F%E5%8F%B7%E6%89%8B%E8%A2%8B--M29068_PM2_Front%20view.png?wid=1440&hei=1440',
  'lv-baggy':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-baggy-%E6%89%8B%E8%A2%8B--M27329_PM2_Front%20view.png?wid=1440&hei=1440',
  'lv-multipass':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-multipass-%E6%89%8B%E8%A2%8B--M29094_PM2_Front%20view.png?wid=1440&hei=1440',
  'lv-x-tm-neverfull-mm':
    'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-lv-x-tm-neverfull-%E4%B8%AD%E5%8F%B7%E6%89%8B%E8%A2%8B--M27787_PM2_Front%20view.png?wid=1440&hei=1440',
  'hermes-constance-slim':
    'https://assets.hermes.cn/is/image/hermesproduct/constance-slim%E9%92%B1%E5%8C%85--085259CC1H-front-wm-1-0-0-1000-1000_g.jpg',
  'hermes-le-petit-sac':
    'https://assets.hermes.cn/is/image/hermesproduct/le-petit-sac%E6%89%8B%E6%8F%90%E5%8C%85--087968CC55-front-wm-1-0-0-1000-1000_g.jpg',
  'hermes-zipengo':
    'https://assets.hermes.cn/is/image/hermesproduct/zipengo-chaine-d-ancre%E5%B0%8F%E5%8F%B7%E6%89%8B%E5%8C%85--084321CC8L-front-wm-1-0-0-1000-1000_g.jpg',
  'hermes-mini-clic-chaine-dancre':
    'https://assets.hermes.cn/is/image/hermesproduct/mini-clic-chaine-d-ancre%E6%89%8B%E9%95%AF--209000FP19-worn-1-0-0-1000-1000_g.jpg',
  'chanel-beauty-chance-splendide':
    'https://www.chanel.cn/images/t_one/w_0.45,h_0.45,c_crop/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1240/chance-eau-splendide-eau-de-parfum-spray-1-7fl-oz--packshot-default-136210-9561648758814.jpg',
  'chanel-ss26-readytowear':
    'https://www.chanel.cn/images/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1268/FSH-1771418302737-desktop-product_1.jpg',
  'chanel-handbag-story':
    'https://www.chanel.cn/images/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1024/FSH-1742141327919-desktop-1112.jpg',
  'prada-passage-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA495/2G52F0201/1BA495_2G52_F0201_V_OPO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg',
  'prada-lace-dress':
    'https://www.prada.com/content/dam/pradabkg_products/P/P3Q/P3Q17/17VMF0002/P3Q17_17VM_F0002_S_OOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg',
  'prada-eternal-gold-necklace':
    'https://www.prada.com/content/dam/pradabkg_products/1/1JC/1JCA06/2DA5F0056/1JCA06_2DA5_F0056_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg',
  'prada-reedition-2005-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1N2/1N204W/2G64F0003/1N204W_2G64_F0003_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg',
  'prada-double-mini-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1BG/1BG443/2A4AF0G3Z/1BG443_2A4A_F0G3Z_V_XOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg',
  'prada-renylon-skirt':
    'https://www.prada.com/content/dam/pradabkg_products/2/21H/21H015/1WQ8F0002/21H015_1WQ8_F0002_S_OOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg',
  'prada-chino-circle-skirt':
    'https://www.prada.com/content/dam/pradabkg_products/P/P13/P132JE/10YPF0002/P132JE_10YP_F0002_S_OOO_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg',
  'prada-symbole-necklace':
    'https://www.prada.com/content/dam/pradabkg_products/1/1JC/1JCA43/2DSPF0002/1JCA43_2DSP_F0002_SLF.jpg/jcr:content/renditions/cq5dam.web.hebebed.1000.1000.crop.jpg',
  'prada-bonnie-medium-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA426/2FPTF0009/1BA426_2FPT_F0009_V_OTM_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg',
  'prada-route-large-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1BB/1BB162/2HFQF0002/1BB162_2HFQ_F0002_V_OOO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg',
  'prada-carry-mini-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA496/2C6AF0002/1BA496_2C6A_F0002_V_OOO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg',
  'prada-jardiniere-mini-bag':
    'https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA038/RCYAF0018/1BA038_RCYA_F0018_V_8OK_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg',
  'lancome-home':
    'https://res-wxec-unipt.lorealchina.com/prod/lan/20250326/759cf952-d649-4834-af54-d1f665b2fea0.jpg',
  'shiseido-home':
    'https://www.shiseido.com.cn/on/demandware.static/-/Sites-shiseido_global_cn-Library/default/dwe572840d/landingshi/2026/20260309/section-1/6.png',
  'chando-purple':
    'https://chandowebprd.chandogroup.com/images/aa434f1dafda4fdfa4fe30e2f75166ff.1776224329550.png',
  'chando-foundation':
    'https://chandowebprd.chandogroup.com/images/d1c85c4d6616409192aea01aed1b3c50.1713838299550.png',
  'shiseido-ultimune':
    'https://www.shiseido.com.cn/dw/image/v2/BCSK_PRD/on/demandware.static/-/Sites-itemmaster_shiseido/default/dw6a224066/images/chuchuangtu/baidi/baiditu-s17283-50.jpg?sw=1000&sh=1000&sm=fit',
  'shiseido-uv':
    'https://www.shiseido.com.cn/dw/image/v2/BCSK_PRD/on/demandware.static/-/Sites-itemmaster_shiseido/default/dwef0d71eb/images/products/15678wlc/plain.jpg?sw=1000&sh=1000&sm=fit',
  estee:
    'https://www.esteelauder.com.cn/media/export/cms/products/308x424/el_sku_G37B01_308x424_0.jpg?w=3840',
  'estee-makeup':
    'https://www.esteelauder.com/media/export/cms/products/308x424/el_sku_PH7G10_308x424_0.jpg',
  'dior-beauty':
    'https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/en_US/dw5e4619d5/Y0000149/Y0000149_E000001270_E01_RHC.jpg?sw=640',
  'dior-beauty-lips':
    'https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/default/dw9831c51b/Y0319000/Y0319000_C031900038_E01_RHC.jpg?sw=640',
  'cpb-home':
    'https://www.cledepeau-beaute.com.cn/on/demandware.static/-/Sites-cpb_cn-Library/default/dw4fcc2ecc/CPB/2024KV/KV1-PC-20241104.jpg',
  'on-cloudsurfer-max':
    'https://images.ctfassets.net/hnk2vsx53n6l/1VGvF5KSK6shaFwdzgvKRu/5009bc69b19aeb617e0cbebb12e23c83/e23710a3d0ff66844466531dd9d7940b7b22540f.png?fm=webp',
  'kolon-hyperleap-tlx':
    'https://images.kolonmall.com/Prod_Img/KS/2026/LM1/FE4TX26010BLK_LM1.jpg',
  'descente-allterrain':
    'https://allterrain.descente.com/wp-content/uploads/2026/02/26ss_index_allterrain_head_pc.jpg',
  'descente-allterrain-81':
    'https://allterrain.descente.com/wp-content/uploads/2026/02/26ss_index_81_head_pc.jpg',
  'adidas-anthony-edwards-2-blue':
    'https://static1.adidas.com.cn/t395/MTc3ODE0NzAyNjE0OWMwM2NiNWE3LTkxN2UtNGYwYS1hMzc5.jpg',
  'adidas-freehiker-sandal':
    'https://static1.adidas.com.cn/t395/MTc3NzU1MDUzMTQ0M2RhMWVkOTU0LWFhM2EtNDUyNC1hZDcw.jpg',
  'adidas-refined-luxe-trench':
    'https://static1.adidas.com.cn/t395/MTc3NDMzMjg3MjIzM2NjZTYwZWFkLTYxYWEtNDU1NC1hNDJl.jpg',
  'adidas-city-tech-jacket':
    'https://static1.adidas.com.cn/t395/MTc3MDI3NTU4NzM1NzUxMDg2M2Y1LWFjZGYtNDk3ZC05MDEx.png',
  'adidas-soft-lux-jacket':
    'https://static1.adidas.com.cn/t395/MTc3NjY3MTc1MTc3NjM1NjcxYWVhLWRjZWItNGQwNi04MTY2.jpg',
  'on-cloudmonster-2':
    'https://images.ctfassets.net/hnk2vsx53n6l/5e4SXNmPb6Cbk10oUts0co/6ac100992b4b8d5fda5a5ad8437aadb0/6f9dc9d16e22b1a3c0d722e8d71747f17630e582.png?fm=webp',
  'nike-pegasus42':
    'https://static.nike.com.cn/a/images/t_web_pw_592_v2/f_auto/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/11552a29-a08e-4019-8501-3eaae4f4a2cf/AIR%2BZOOM%2BPEGASUS%2B42.png',
  'nike-pegasus42-se':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/95c1c635-3904-475e-921a-2b605e0850a5/W+AIR+ZOOM+PEGASUS+42+SE.png',
  'nike-acg-zegama':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ae4293b0-205b-42a0-be3c-cf1f6f405e95/NIKE+ACG+ZEGAMA+TRAIL.png',
  'nike-gt-cut-4-ep':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/83730b18-631b-4dda-bdfb-a4bc2ec329a5/G.T.+CUT+4+LX+EP.png',
  'nike-china-tech-jacket':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a3fe95a2-797f-4c2f-b286-6c13647938c6/AS+CFA+M+TECH+WOVEN+TOP.png',
  'nike-kobe-9-low-protro':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/377c9460-7632-443f-b465-764ba5f7d236/KOBE+IX+ELITE+LOW+EM+PROTRO.png',
  'nike-lebron-23-ep':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/5eaa709b-cfe0-4ef5-b706-f90b952ac3cb/LEBRON+XXIII+EP.png',
  'nike-ja-3-jp-ep':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/38b2ca41-20ea-40a8-837c-5a80ef20f066/JA+3+JP+EP.png',
  'nike-shenhua-top':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/516a2e3a-5b77-40d1-b7fe-3ca6a0d378b3/AS+SGS+M+NK+DF+ACD+SS+TOP+G.png',
  'nike-england-home-jersey':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/0bb0368e-cb48-4dfc-9b59-7325d7a9c181/ENT+M+NK+DF+JSY+SS+STAD+HM.png',
  'nike-swim-hydrastrong':
    'https://static.nike.com.cn/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a3523998-276e-4882-b8d4-48e25afc3525/NK+PLY+SLD+JAMMER+WITH+GUSSET.png',
  'shu-home':
    'https://res-wxec-unipt.lorealchina.com/ow1/ow-shu/banner/22.png',
  'kiehls-home':
    'https://res-wxec-unipt.lorealchina.com/ow1/ow-kie/about/products/2.jpg',
  'kiehls-best-sellers':
    'https://res-wxec-unipt.lorealchina.com/ow1/ow-kie/about/products/1.jpg',
  'bulgari-serpenti-sedu-watch':
    'https://www.bulgari.cn/media/catalog/product/cache/6e8bf58cd790c423691f019c814cf844/1/0/103902-001.png',
  'bulgari-octo-watch':
    'https://www.bulgari.cn/media/catalog/product/cache/6e8bf58cd790c423691f019c814cf844/1/0/104299-E-001.png',
  'chanel-j12-bleu':
    'https://www.chanel.cn/puls-img/c_limit,w_1920/f_webp,q_90,dpr_1.1/1774968766103-mspp-j12-bleue-h10288-cover-mobile-4-3_2500x4443.jpg',
  'chanel-premiere-watch':
    'https://www.chanel.cn/images/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_1920/premiere-edition-originale-watch-yellow-black-calfskin-gold-coating-packshot-default-h6951-9590048751646.jpg',
  'asics-tennis':
    'https://images.asics.com/is/image/asics/1042A072_103_SR_RT_GLB-1?$product$',
  'wilson-tennis':
    'https://www.wilson.com/en-us/blog/tennis/wilson-labs/media_10a32f00163d82889342fb3ad4b904cf0c0d886a6.jpeg?width=1200&format=pjpg&optimize=medium',
  'wilson-tennis-shoe':
    'https://www.wilson.com/en-us/blog/tennis/wilson-labs/media_10a32f00163d82889342fb3ad4b904cf0c0d886a6.jpeg?width=1200&format=pjpg&optimize=medium',
  'arcteryx-alpha-sv':
    'https://cdn.sanity.io/images/inkbj32c/production/7a649d6f8f0ee59bd267191e4d08009dc30afddf-600x600.jpg?auto=format&q=75',
  'arcteryx-alpha-sv-detail':
    'https://cdn.sanity.io/images/inkbj32c/production/e5a16a928380d0c5c9e0f083bc2fe8133714d98d-600x600.jpg?auto=format&q=75',
  'kolon-hawk-rise-gtx':
    'https://images.kolonmall.com/Prod_Img/KS/2026/LM1/FE4KX26310GRY_LM1.jpg',
  'vca-alhambra':
    'https://www.vancleefarpels.cn/content/dam/rcq/vca/Rz/4M/Ut/Vy/QD/-6/c6/13/zo/4v/6g/Rz4MUtVyQD-6c613zo4v6g.png.transform.vca-w820-1x.png',
  'vca-bracelet':
    'https://www.vancleefarpels.cn/content/dam/rcq/vca/L8/7Y/Eh/oM/Sg/yH/yH/Od/Bq/iJ/vg/L87YEhoMSgyHyHOdBqiJvg.png.transform.vca-w820-1x.png',
  'vca-magic-alhambra':
    'https://www.vancleefarpels.cn/content/dam/rcq/vca/tR/Va/8Y/rm/Qt/uH/xp/pM/6k/6t/qQ/tRVa8YrmQtuHxppM6k6tqQ.png.transform.vca-w820-1x.png',
}

function slugifyBrand(brand: string) {
  return brand
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function getHostname(value: string) {
  try {
    return new URL(value).hostname
  } catch {
    return null
  }
}

function isLocalImage(image: string) {
  return image.startsWith('/news/')
}

function inferGenericMethod(story: Story, brand: string) {
  if (brand === 'Prada') {
    return 'reconstructed_dam_path_to_local_mirror'
  }

  if (brand === 'Van Cleef & Arpels') {
    return 'product_gallery_currentSrc_to_local_mirror'
  }

  if (brand === 'Lancôme') {
    return 'homepage_product_card_capture_to_local_mirror'
  }

  if (brand === 'SHISEIDO') {
    if (story.id === 'shiseido-home') {
      return 'homepage_product_card_capture_to_local_mirror'
    }

    return 'product_detail_packshot_download_to_local_mirror'
  }

  if (story.image.endsWith('.svg')) {
    return 'manual_editorial_placeholder'
  }

  if (!isLocalImage(story.image)) {
    if (story.sourceType === 'Official News' || story.sourceUrl.includes('newsroom')) {
      return 'official_newsroom_asset_download'
    }

    if (
      story.sourceUrl.includes('/p/') ||
      story.sourceUrl.includes('/product') ||
      story.sourceUrl.includes('/products.') ||
      story.sourceUrl.includes('articleId=')
    ) {
      return 'product_detail_image_download'
    }

    if (
      story.sourceUrl.includes('whats-new') ||
      story.sourceUrl.includes('what-s-new') ||
      story.sourceUrl.includes('new-arrivals') ||
      story.sourceUrl.includes('/new') ||
      story.sourceUrl.includes('/w/new')
    ) {
      return 'listing_or_new_arrivals_card_download'
    }

    return 'homepage_or_collection_asset_download'
  }

  return 'local_mirror_of_official_asset'
}

function inferAutomationStatus(story: Story, brand: string): AutomationStatus {
  if (story.image.endsWith('.svg')) {
    return 'needs_replacement'
  }

  if (!isLocalImage(story.image)) {
    return 'ready'
  }

  if (['Prada', 'Van Cleef & Arpels', 'Lancôme', 'SHISEIDO', 'ASICS', 'Wilson'].includes(brand)) {
    return 'ready'
  }

  if (story.image.match(/\.(png|jpg|jpeg|webp)$/i)) {
    return 'partial'
  }

  return 'partial'
}

function inferPriority(story: Story, brand: string) {
  if (brand === 'Prada') {
    return ['resolved_browser_image', 'reconstructed_dam_path', 'local_mirror']
  }

  if (brand === 'Van Cleef & Arpels') {
    return ['product_gallery_currentSrc', 'local_mirror']
  }

  if (brand === 'Lancôme') {
    return ['homepage_product_card_capture', 'local_crop', 'local_mirror']
  }

  if (brand === 'SHISEIDO') {
    return ['product_detail_packshot_download', 'homepage_product_card_capture', 'local_mirror']
  }

  if (brand === 'ASICS') {
    return ['official_cms_asset_download', 'local_mirror']
  }

  if (brand === 'Wilson') {
    return ['official_blog_asset_download', 'official_product_page_image_download', 'local_mirror']
  }

  if (!isLocalImage(story.image)) {
    return ['remote_official_asset_download', 'local_mirror']
  }

  return ['local_mirror']
}

function inferStoryNotes(story: Story, brand: string) {
  const notes: string[] = []

  if (brand === 'Prada') {
    notes.push('If live page access fails, use the DAM reconstruction pattern stored in the Prada brand rule.')
  }

  if (brand === 'Lancôme') {
    notes.push('Current local image was derived from an official homepage product card or campaign module.')
  }

  if (brand === 'SHISEIDO' && story.id === 'shiseido-home') {
    notes.push('Homepage-led skincare story currently uses a product-card style local crop for cleaner site presentation.')
  }

  if (brand === 'CHANDO') {
    notes.push('Download the official product image with the product detail page as referer, then mirror locally to avoid saving anti-hotlink HTML responses.')
  }

  if (brand === 'Estée Lauder') {
    notes.push('If the old global media/export image URL returns 403, reacquire from the China product or series page with referer headers, then mirror locally.')
    if (story.id === 'estee-makeup') {
      notes.push('The current local mirror was captured from the official product image page in a real browser session because direct server-side fetch was blocked.')
    }
  }

  if (brand === 'On') {
    notes.push('The current local mirror comes from the official On product gallery hero image.')
  }

  if (brand === "Arc'teryx") {
    notes.push("The current local mirror uses an official Arc'teryx gallery asset mirrored to local storage.")
  }

  if (brand === 'KOLON SPORT') {
    notes.push('The current local mirror uses the LM1 front-view product image from the official KOLON SPORT product gallery.')
  }

  if (brand === 'DESCENTE') {
    notes.push('The current local mirror uses an accessible official DESCENTE ALLTERRAIN line asset instead of a Cloudflare-blocked commerce screenshot.')
  }

  if (brand === 'Bvlgari') {
    notes.push('The current local mirror uses a verified official Bvlgari catalog watch asset or local mirror refreshed from the watch listing payload.')
  }

  if (brand === 'Chanel' && story.subcategory === '腕表') {
    notes.push('The current local mirror uses a verified Chanel watches category packshot or editorial watch asset and should not fall back to mismatched watch imagery.')
  }

  if (brand === 'Shu Uemura') {
    notes.push('The current local mirror uses a verified Shu Uemura China homepage product banner rather than a full-page screenshot.')
  }

  if (brand === "Kiehl's") {
    notes.push('The current local mirror uses a verified Kiehl’s China products-page collage that clearly shows the featured skincare products.')
  }

  if (brand === 'ASICS') {
    notes.push('The current local mirror is backed by a verified official ASICS CMS asset and can be refreshed from candidateImageUrl if the local file needs replacement.')
  }

  if (brand === 'Wilson') {
    notes.push('The current local mirror is backed by a verified Wilson official blog media asset and can be refreshed from candidateImageUrl if the local file needs replacement.')
  }

  if (story.image.endsWith('.svg')) {
    notes.push('Current asset is an editorial placeholder and should be replaced with a real official product image later.')
  }

  if (storyCandidateImageUrls[story.id]) {
    notes.push('A verified official source image URL is stored in candidateImageUrl for server-side re-download or COS sync.')
  } else if (isLocalImage(story.image)) {
    notes.push('No direct official source image URL is stored yet; reacquire from sourcePage using the configured method if the local mirror needs refresh.')
  }

  return notes
}

function buildDefaultCrawlStrategy(brand: string, stories: Story[], storyRules: StoryRule[]) {
  const primaryStory = stories[0]

  return {
    mode: 'generic_html' as const,
    entryPages: primaryStory
      ? [
          {
            label: `${brand} 默认入口`,
            subcategory: primaryStory.subcategory,
            url: primaryStory.sourceUrl,
            extraction: 'first_product' as const,
          },
        ]
      : [],
    fallbackUrl: primaryStory?.sourceUrl ?? null,
    notes: [
      'This brand currently falls back to the default source page recorded from the existing story dataset.',
      `When newer brand-specific crawl rules are added, replace this generic_html mode with a specialized mode. Current ready stories: ${storyRules.filter((story) => story.automationStatus === 'ready').length}.`,
    ],
  }
}

async function buildBrandRules() {
  const grouped = new Map<string, Story[]>()

  for (const story of allStories) {
    const stories = grouped.get(story.brand) ?? []
    stories.push(story)
    grouped.set(story.brand, stories)
  }

  const brandRules: BrandRule[] = []

  for (const [brand, stories] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const slug = slugifyBrand(brand)
    const officialDomains = [...new Set(stories.map((story) => getHostname(story.sourceUrl)).filter(Boolean))] as string[]
    const remoteImageHosts = [
      ...new Set(
        stories
          .map((story) => (isLocalImage(story.image) ? null : getHostname(story.image)))
          .filter(Boolean),
      ),
    ] as string[]

    const storyRules: StoryRule[] = stories.map((story) => {
      const method = inferGenericMethod(story, brand)
      const automationStatus = inferAutomationStatus(story, brand)

      return {
        storyId: story.id,
        title: story.title,
        category: story.category,
        subcategory: story.subcategory,
        products: story.products,
        sourceType: story.sourceType,
        sourcePage: story.sourceUrl,
        currentImage: story.image,
        currentImageMode: isLocalImage(story.image) ? 'local' : 'remote',
        currentImageHost: isLocalImage(story.image) ? null : getHostname(story.image),
        automationStatus,
        acquisition: {
          method,
          priority: inferPriority(story, brand),
          localMirrorPath: isLocalImage(story.image) ? story.image : null,
          candidateImageUrl: storyCandidateImageUrls[story.id] ?? (isLocalImage(story.image) ? null : story.image),
          candidateImageHost: getHostname(storyCandidateImageUrls[story.id] ?? (isLocalImage(story.image) ? '' : story.image)),
          notes: inferStoryNotes(story, brand),
        },
      }
    })

    const override = brandStrategyOverrides[brand]
    const summary = {
      storyCount: storyRules.length,
      readyCount: storyRules.filter((story) => story.automationStatus === 'ready').length,
      partialCount: storyRules.filter((story) => story.automationStatus === 'partial').length,
      needsReplacementCount: storyRules.filter((story) => story.automationStatus === 'needs_replacement').length,
    }

    brandRules.push({
      schemaVersion: 1,
      brand,
      slug,
      categories: [...new Set(stories.map((story) => story.category))],
      officialDomains,
      remoteImageHosts,
      summary,
      strategy: {
        brandLevelMethods: override?.methods ?? [...new Set(storyRules.flatMap((story) => story.acquisition.priority))],
        notes:
          override?.notes ?? [
            'Default rule file generated from the current story dataset.',
            'For remote official assets, the server can download and mirror the current image URL directly.',
          ],
      },
      crawl: override?.crawl ?? buildDefaultCrawlStrategy(brand, stories, storyRules),
      stories: storyRules,
    })
  }

  return brandRules
}

function buildMethodSummary(brandRules: BrandRule[]) {
  const brands: BrandMethodSummary[] = brandRules.map((rule) => ({
    brand: rule.brand,
    slug: rule.slug,
    categories: rule.categories,
    officialDomains: rule.officialDomains,
    storyCount: rule.summary.storyCount,
    status: rule.summary,
    methods: rule.strategy.brandLevelMethods,
    notes: rule.strategy.notes,
    crawlMode: rule.crawl.mode,
    crawlNotes: rule.crawl.notes,
    crawlEntries: rule.crawl.entryPages,
    stories: rule.stories.map((story) => ({
      storyId: story.storyId,
      subcategory: story.subcategory,
      sourcePage: story.sourcePage,
      method: story.acquisition.method,
      priority: story.acquisition.priority,
      localMirrorPath: story.acquisition.localMirrorPath,
      candidateImageUrl: story.acquisition.candidateImageUrl,
      automationStatus: story.automationStatus,
    })),
  }))

  return {
    generatedAt: new Date().toISOString(),
    brandCount: brands.length,
    brands,
  }
}

function toMarkdownSummary(summary: ReturnType<typeof buildMethodSummary>) {
  const lines = [
    '# Brand Image Methods Summary',
    '',
    'This file is the human-readable companion to the JSON rule files in `data/image-rules/`.',
    'Use it when updating the website or debugging server-side image reacquisition.',
    '',
    `Generated at: ${summary.generatedAt}`,
    `Brand count: ${summary.brandCount}`,
    '',
  ]

  for (const brand of summary.brands) {
    lines.push(`## ${brand.brand}`)
    lines.push('')
    lines.push(`- Slug: \`${brand.slug}\``)
    lines.push(`- Categories: ${brand.categories.join(', ')}`)
    lines.push(`- Official domains: ${brand.officialDomains.join(', ') || 'n/a'}`)
    lines.push(`- Story count: ${brand.storyCount}`)
    lines.push(
      `- Status: ready ${brand.status.readyCount}, partial ${brand.status.partialCount}, needs replacement ${brand.status.needsReplacementCount}`,
    )
    lines.push(`- Brand methods: ${brand.methods.join(' -> ')}`)
    lines.push(`- Notes: ${brand.notes.join(' ')}`)
    lines.push(`- Crawl mode: ${brand.crawlMode}`)
    lines.push(`- Crawl notes: ${brand.crawlNotes.join(' ')}`)
    if (brand.crawlEntries.length > 0) {
      lines.push('- Crawl entries:')
      for (const entry of brand.crawlEntries) {
        lines.push(`  - \`${entry.label}\` | ${entry.subcategory} | ${entry.url} | extraction: ${entry.extraction}`)
      }
    }
    lines.push('- Stories:')

    for (const story of brand.stories) {
      const candidate = story.candidateImageUrl ? story.candidateImageUrl : 'none stored'
      const mirror = story.localMirrorPath ?? 'none'
      lines.push(
        `  - \`${story.storyId}\` | ${story.subcategory} | method: \`${story.method}\` | priority: ${story.priority.join(
          ' -> ',
        )} | local: \`${mirror}\` | candidate: ${candidate} | status: ${story.automationStatus}`,
      )
    }

    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true })
  const brandRules = await buildBrandRules()

  for (const rule of brandRules) {
    const filePath = path.join(outputDir, `${rule.slug}.json`)
    await fs.writeFile(filePath, `${JSON.stringify(rule, null, 2)}\n`)
  }

  const index = {
    generatedAt: new Date().toISOString(),
    brandCount: brandRules.length,
    brands: brandRules.map((rule) => ({
      brand: rule.brand,
      slug: rule.slug,
      file: `data/image-rules/${rule.slug}.json`,
      storyCount: rule.summary.storyCount,
      readyCount: rule.summary.readyCount,
      partialCount: rule.summary.partialCount,
      needsReplacementCount: rule.summary.needsReplacementCount,
    })),
  }

  const methodSummary = buildMethodSummary(brandRules)

  await fs.writeFile(path.join(outputDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)
  await fs.writeFile(path.join(outputDir, 'brand-methods-summary.json'), `${JSON.stringify(methodSummary, null, 2)}\n`)
  await fs.writeFile(path.join(outputDir, 'brand-methods-summary.md'), toMarkdownSummary(methodSummary))
  console.log(`Generated ${brandRules.length} image-rule files.`)
}

await main()
