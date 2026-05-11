import type { BrandProbe, BrandSourceRule, CrawlCandidate } from './types'
import { findBrandCrawlRule, findBrandImageRule, findImageRuleForCandidate } from './imageRules'

const APPLE_NEWSROOM_BASE = 'https://www.apple.com.cn'
const LOUIS_VUITTON_CAPUCINES_URL =
  'https://www.louisvuitton.cn/zhs-cn/products/capucines-mini-capucines-nvprod7540209v/M28548'
const LOUIS_VUITTON_LATEST_PAGES = [
  {
    label: '女士新品',
    subcategory: '服装',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/the-latest/_/N-t18gb9e5',
  },
  {
    label: '男士新品',
    subcategory: '皮包',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-men/the-latest/_/N-t1blflj9',
  },
  {
    label: 'LV Resort 系列',
    subcategory: '皮包',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/lv-resort-collection/_/N-t1h80en2',
  },
  {
    label: 'Flight Mode 系列',
    subcategory: '皮包',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/flight-mode-collection/_/N-t97bofk',
  },
  {
    label: 'Nautical 系列',
    subcategory: '皮包',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/nautical/_/N-tyfjxmc',
  },
  {
    label: '春夏女装系列',
    subcategory: '皮包',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/spring-summer-2026-collection/_/N-t88m6o1',
  },
  {
    label: '路易威登 × 村上隆合作系列',
    subcategory: '皮包',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/louis-vuitton-x-murakami/_/N-t2xost9',
  },
] as const
const SHISEIDO_ULTIMUNE_URL =
  'https://www.shiseido.com.cn/ultimune-power-infusing-serum-s17283.html?cgid=S2_Category_Serums'
const HERMES_H08_URL = 'https://www.hermes.cn/cn/zh/product/hermes-h08%E8%85%95%E8%A1%A842%E6%AF%AB%E7%B1%B3-W049430WW00/'
const DIOR_FOREVER_GLOW_URL = 'https://www.dior.com/en_us/beauty/products/dior-forever-skin-glow-Y0998020.html'
const DIOR_FOREVER_GLOW_IMAGE =
  'https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/en_US/dw5e4619d5/Y0000149/Y0000149_E000001270_E01_RHC.jpg?sw=640'
const WILSON_RUSH_PRO_ARTICLE_URL =
  'https://www.wilson.com/en-us/blog/tennis/wilson-labs/introducing-new-rush-pro-45-tennis-shoe'
const ADIDAS_HOME_FEED_PAGES = [
  {
    label: '极速蓝调',
    subcategory: '篮球',
    listingUrl: 'https://www.adidas.com.cn/splp?contentId=SPLP_IGbhLTTi',
  },
  {
    label: '自由人系列',
    subcategory: '户外',
    listingUrl: 'https://www.adidas.com.cn/plp/campaign_25Aug_freehiker',
  },
  {
    label: '静奢甄选',
    subcategory: '运动休闲',
    listingUrl: 'https://www.adidas.com.cn/plp/homefeed_26Mar_refine_lux',
  },
  {
    label: '城市机能风',
    subcategory: '户外',
    listingUrl: 'https://www.adidas.com.cn/splp?contentId=SPLP_XHMibwZg',
  },
  {
    label: '东方柔雅风',
    subcategory: '运动休闲',
    listingUrl: 'https://www.adidas.com.cn/splp?contentId=SPLP_KrbvhObt',
  },
  {
    label: '三条纹舞动系列',
    subcategory: '运动休闲',
    listingUrl: 'https://www.adidas.com.cn/splp?contentId=SPLP_b4IzzDUp',
  },
] as const
const NIKE_TREND_PAGES = [
  {
    label: '耐克飞马42',
    subcategory: '跑步',
    url: 'https://www.nike.com.cn/w/pegasus-40-present-running-shoes-2yknpz37v7jzy7ok',
  },
  {
    label: '耐克女子夜跑系列',
    subcategory: '跑步',
    url: 'https://www.nike.com.cn/w/womens-running-essentials-4xmgfz5e1x6',
  },
  {
    label: 'ACG户外系列',
    subcategory: '户外',
    url: 'https://www.nike.com.cn/w/acg-trail-running-75jcnz93bsd',
  },
  {
    label: '耐高超新星篮球系列',
    subcategory: '篮球',
    url: 'https://www.nike.com.cn/w/chbl-4lx21',
  },
  {
    label: 'Lebron系列',
    subcategory: '篮球',
    url: 'https://www.nike.com.cn/w/lebron-james-7y57x',
  },
  {
    label: 'Ja系列',
    subcategory: '篮球',
    url: 'https://www.nike.com.cn/w/ja-morant-4m5h1',
  },
  {
    label: '耐克篮球新品',
    subcategory: '篮球',
    url: 'https://www.nike.com.cn/w/basketball-3glsm',
  },
  {
    label: '国家队系列',
    subcategory: '足球',
    url: 'https://www.nike.com.cn/w/national-team-av9de',
  },
  {
    label: '中超系列',
    subcategory: '足球',
    url: 'https://www.nike.com.cn/w/nike-fc-a4rvy',
  },
  {
    label: 'Football Club',
    subcategory: '足球',
    url: 'https://www.nike.com.cn/w/football-club-6iait',
  },
  {
    label: '游泳专区',
    subcategory: '游泳',
    url: 'https://www.nike.com.cn/w/swimming-3c2dj',
  },
] as const

function detectMatchedKeywords(rule: BrandSourceRule) {
  return rule.keywords.slice(0, Math.min(rule.keywords.length, 4))
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x26;/gi, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function normalizeCheckedAt(checkedAt: string) {
  return checkedAt.slice(0, 10)
}

function normalizeChineseDate(value: string) {
  const match = value.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function normalizeIsoDate(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    return null
  }

  return `${match[1]}-${match[2]}-${match[3]}`
}

function extractMatch(html: string, pattern: RegExp, group = 1) {
  const match = html.match(pattern)
  return match?.[group] ?? null
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`抓取失败：${url} 返回 ${response.status}`)
  }

  return response.text()
}

function makeAbsoluteUrl(url: string, baseUrl: string) {
  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return url
  }
}

function extractTitleFromHtml(html: string) {
  const rawTitle =
    extractMatch(html, /property="og:title" content="([^"]+)"/i) ??
    extractMatch(html, /name="twitter:title" content="([^"]+)"/i) ??
    extractMatch(html, /<meta[^>]+name="title"[^>]+content="([^"]+)"/i) ??
    extractMatch(html, /<title>([^<]+)<\/title>/i) ??
    extractMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)

  return rawTitle ? collapseWhitespace(decodeHtmlEntities(rawTitle.replace(/<[^>]+>/g, ' '))) : null
}

function extractImageFromHtml(html: string, baseUrl: string) {
  const directImage =
    extractMatch(html, /property="og:image" content="([^"]+)"/i) ??
    extractMatch(html, /name="twitter:image" content="([^"]+)"/i) ??
    extractMatch(html, /<meta[^>]+itemprop="image"[^>]+content="([^"]+)"/i)

  if (directImage) {
    return decodeHtmlEntities(makeAbsoluteUrl(directImage, baseUrl))
  }

  const imageMatches = [
    ...html.matchAll(
      /(https?:\/\/[^"' )]+\.(?:jpg|jpeg|png|webp)(?:\?[^"' )]+)?)/gi,
    ),
  ].map((match) => decodeHtmlEntities(match[1]))

  const preferredImage = imageMatches.find((url) =>
    /(dior|prada|gucci|cartier|burberry|vancleefarpels|louisvuitton|hermes|shiseido|lancome|estee|clinique|lamer|adidas|nike|yonex|asics|mizuno|on\.com|arcteryx|kolon|descente|wilson|apple|microsoft)/i.test(
      url,
    ),
  )

  return preferredImage ? makeAbsoluteUrl(preferredImage, baseUrl) : null
}

type NikeTrendProduct = {
  label: string
  subcategory: string
  sourceUrl: string
  title: string
  subtitle: string
  image: string
  listingUrl: string
}

type AdidasListingProduct = {
  label: string
  subcategory: string
  listingUrl: string
  articleId: string
  articleName: string
}

type LouisVuittonLatestProduct = {
  label: string
  subcategory: string
  listingUrl: string
  sourceUrl: string
  title: string
  image: string
}

type PradaCategoryProduct = {
  label: string
  subcategory: string
  listingUrl: string
  sourceUrl: string
  title: string
  image: string
}

type SamsungBuyPageProduct = {
  label: string
  subcategory: string
  sourceUrl: string
  title: string
  image: string
}

type WebgamePortalProduct = {
  label: string
  subcategory: string
  sourceUrl: string
  title: string
  image: string
}

async function getConfiguredBrandPages(
  brand: string,
  mode:
    | 'nike_trend_pages'
    | 'adidas_home_feed_pages'
    | 'louis_vuitton_latest_pages'
    | 'prada_category_pages'
    | 'samsung_buy_pages',
  fallbackPages: ReadonlyArray<{ label: string; subcategory: string; url?: string; listingUrl?: string }>,
) {
  const crawlRule = await findBrandCrawlRule(brand)
  if (crawlRule && crawlRule.mode === mode && crawlRule.entryPages.length > 0) {
    return crawlRule.entryPages.map((entry) => ({
      label: entry.label,
      subcategory: entry.subcategory,
      url: entry.url,
    }))
  }

  return fallbackPages.map((entry) => ({
    label: entry.label,
    subcategory: entry.subcategory,
    url: 'url' in entry && entry.url ? entry.url : entry.listingUrl ?? '',
  }))
}

function cleanGameTitle(rawTitle: string) {
  return collapseWhitespace(
    decodeHtmlEntities(rawTitle)
      .replace(/\s*🕹️\s*Play Now on GamePix$/i, '')
      .replace(/\s*\|\s*GamePix$/i, '')
      .replace(/\s*-\s*Play Online for Free!\s*\|\s*Poki$/i, '')
      .replace(/\s*-\s*Play Online for Free!\s*\|\s*Arcadrome$/i, '')
      .replace(/\s*🕹️\s*Play on CrazyGames$/i, '')
      .replace(/\s*-\s*Play Now on Y8\.com$/i, '')
      .replace(/\s*\|\s*Y8\.com$/i, '')
      .replace(/\s*\|\s*CrazyGames$/i, ''),
  )
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}

function normalizeProductSlugTitle(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => {
      if (/^(lv|tm|gt|acg)$/i.test(part)) {
        return part.toUpperCase()
      }

      if (/^[a-z0-9]+$/i.test(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1)
      }

      return part
    })
    .join(' ')
}

function extractPradaTitleFromProductUrl(url: string) {
  const match = url.match(/\/p\/([^/]+)\//i)
  if (!match) {
    return 'Prada 新品'
  }

  return normalizeProductSlugTitle(decodeURIComponent(match[1]))
}

function getPradaSubcategoryMatchers(subcategory: string) {
  if (subcategory === '皮包') {
    return ['handbag', 'tote-bag', 'tote', 'shoulder-bag', 'bag', 'pouch', 'wallet']
  }

  if (subcategory === '服装') {
    return ['shirt', 'skirt', 'jacket', 'dress', 'coat', 'pants', 'shorts', 'top', 'sweater', 'cardigan']
  }

  if (subcategory === '珠宝') {
    return ['necklace', 'bracelet', 'pendant', 'earrings', 'ring', 'brooch']
  }

  return []
}

function extractPradaCategoryProduct(
  html: string,
  listingUrl: string,
  label: string,
  subcategory: string,
): PradaCategoryProduct | null {
  const urls = unique(
    [...html.matchAll(/https:\/\/www\.prada\.cn\/cn\/zh\/p\/[^"' )]+/gi)].map((match) =>
      decodeHtmlEntities(match[0].replace(/,$/, '')),
    ),
  )
  const imageUrls = unique(
    [...html.matchAll(/https:\/\/www\.prada\.com\/content\/dam\/[^"' )]+_SLF\.jpg(?:\/_jcr_content\/renditions\/[^"' )]+)?/gi)].map(
      (match) => decodeHtmlEntities(match[0].replace(/,$/, '')),
    ),
  )
  const matchers = getPradaSubcategoryMatchers(subcategory)

  let selectedIndex = urls.findIndex((url) =>
    matchers.some((matcher) => url.toLowerCase().includes(matcher)),
  )

  if (selectedIndex < 0) {
    selectedIndex = 0
  }

  const sourceUrl = urls[selectedIndex]
  if (!sourceUrl) {
    return null
  }

  return {
    label,
    subcategory,
    listingUrl,
    sourceUrl,
    title: extractPradaTitleFromProductUrl(sourceUrl),
    image: imageUrls[selectedIndex] ?? imageUrls[0] ?? '',
  }
}

function extractSamsungBuyPageProduct(
  html: string,
  pageUrl: string,
  label: string,
  subcategory: string,
): SamsungBuyPageProduct | null {
  const title =
    extractMatch(html, /"groupName":"([^"]+)"/) ??
    extractMatch(html, /"displayModelName":"([^"]+)"/) ??
    extractMatch(html, /"displayName":"(Galaxy[^"]+)"/)
  const image =
    extractMatch(html, /<link rel="preload" as="image" media="\(min-width:768px\)" href="([^"]+)"/i) ??
    extractMatch(html, /"largeImage":"(\/\/images\.samsung\.com\.cn\/[^"]+)"/i)

  if (!title) {
    return null
  }

  return {
    label,
    subcategory,
    sourceUrl: pageUrl,
    title: collapseWhitespace(decodeHtmlEntities(title)),
    image: image ? makeAbsoluteUrl(decodeHtmlEntities(image), 'https://www.samsung.com.cn') : '',
  }
}

function extractPokiNewGameProduct(
  html: string,
  _pageUrl: string,
  label: string,
  subcategory: string,
): WebgamePortalProduct | null {
  const match = html.match(
    /"games":\[\{"id":\d+,[\s\S]*?"title":"([^"]+)"[\s\S]*?"image":\{"path":"([^"]+)"\}[\s\S]*?"url":"([^"]+)"/,
  )

  if (!match) {
    return null
  }

  const title = cleanGameTitle(match[1])
  const imagePath = decodeHtmlEntities(match[2]).replace(/\\u002F/g, '/')
  const relativeUrl = decodeHtmlEntities(match[3]).replace(/\\u002F/g, '/')

  return {
    label,
    subcategory,
    sourceUrl: makeAbsoluteUrl(relativeUrl, 'https://poki.com'),
    title,
    image: `https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/${imagePath}`,
  }
}

async function fetchGameDetailProduct(
  detailUrl: string,
  label: string,
  subcategory: string,
): Promise<WebgamePortalProduct | null> {
  const html = await fetchHtml(detailUrl)
  const sourceTitle = extractTitleFromHtml(html)
  const image = extractImageFromHtml(html, detailUrl) ?? ''

  if (!sourceTitle) {
    return null
  }

  return {
    label,
    subcategory,
    sourceUrl: detailUrl,
    title: cleanGameTitle(sourceTitle),
    image,
  }
}

async function extractCrazyGamesNewGameProduct(
  html: string,
  _pageUrl: string,
  label: string,
  subcategory: string,
): Promise<WebgamePortalProduct | null> {
  const relativeUrl = extractMatch(html, /(\/game\/[a-z0-9-]+)/i)
  if (!relativeUrl) {
    return null
  }

  return fetchGameDetailProduct(makeAbsoluteUrl(relativeUrl, 'https://www.crazygames.com'), label, subcategory)
}

async function extractArcadromeHomeGameProduct(
  html: string,
  _pageUrl: string,
  label: string,
  subcategory: string,
): Promise<WebgamePortalProduct | null> {
  const relativeUrl = extractMatch(html, /(\/en\/games\/[a-z0-9-]+)/i)
  if (!relativeUrl) {
    return null
  }

  return fetchGameDetailProduct(makeAbsoluteUrl(relativeUrl, 'https://arcadrome.com'), label, subcategory)
}

function extractGamePixNewGameUrls(html: string) {
  return unique(
    [...html.matchAll(/https:\/\/www\.gamepix\.com\/play\/[a-z0-9-]+/gi)]
      .map((match) => match[0])
      .filter(Boolean),
  ).slice(0, 2)
}

function extractY8NewGameUrls(html: string) {
  return unique(
    [...html.matchAll(/"url":"(https:\/\/www\.y8\.com\/games\/[^"]+)"/gi)]
      .map((match) => decodeHtmlEntities(match[1]))
      .filter(Boolean),
  ).slice(0, 2)
}

function extractPacoGamesLatestUrls(html: string) {
  return unique(
    [...html.matchAll(/href="(\/[a-z0-9-]+\/[a-z0-9-]+)"/gi)]
      .map((match) => makeAbsoluteUrl(match[1], 'https://www.pacogames.com'))
      .filter((url) => !/\/(blog|3d|action|sports|driving|strategy|girls|multiplayer|logic|casual|tags)$/i.test(url)),
  ).slice(0, 2)
}

function extractNikeFirstProductFromListing(
  html: string,
  listingUrl: string,
  label: string,
  subcategory: string,
): NikeTrendProduct | null {
  const match = html.match(
    /"products":\[\{"groupKey":"[^"]+"[\s\S]*?"copy":\{"title":"([^"]+)","subTitle":"([^"]*)"\}[\s\S]*?"colorwayImages":\{"portraitURL":"([^"]+)"[\s\S]*?"pdpUrl":\{"url":"([^"]+)"/,
  )

  if (!match) {
    return null
  }

  return {
    label,
    subcategory,
    listingUrl,
    title: decodeHtmlEntities(match[1]),
    subtitle: decodeHtmlEntities(match[2]),
    image: decodeHtmlEntities(match[3]),
    sourceUrl: decodeHtmlEntities(match[4]),
  }
}

function extractAdidasFirstProductFromListing(
  html: string,
  listingUrl: string,
  label: string,
  subcategory: string,
): AdidasListingProduct | null {
  const match = html.match(/articleId:"([^"]+)",articleName:"([^"]+)"/)

  if (!match) {
    return null
  }

  return {
    label,
    subcategory,
    listingUrl,
    articleId: decodeHtmlEntities(match[1]),
    articleName: collapseWhitespace(decodeHtmlEntities(match[2])),
  }
}

function normalizeLouisVuittonTitleFromImage(imageUrl: string) {
  const match = imageUrl.match(/louis-vuitton-([^?]+)--/i)
  if (!match) {
    return 'Louis Vuitton 新品'
  }

  const decoded = decodeURIComponent(match[1])
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return decoded
    .split(' ')
    .map((part) => (/^[a-z0-9]+$/i.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function extractLouisVuittonLatestProduct(
  html: string,
  listingUrl: string,
  label: string,
  subcategory: string,
): LouisVuittonLatestProduct | null {
  const image = extractMatch(
    html,
    /(https:\/\/www\.louisvuitton\.cn\/images\/is\/image\/lv\/1\/PP_VP_L\/[^"' )]+\.(?:png|jpg|jpeg|webp)\?wid=\d+&hei=\d+)/i,
  )

  if (!image) {
    return null
  }

  const articleCodeMatch = image.match(/--([A-Z0-9]+)_PM2_/i)
  const articleCode = articleCodeMatch?.[1] ?? ''
  const relativeProductUrl = articleCode
    ? extractMatch(
        html,
        new RegExp(`(\\/zhs-cn\\/products\\/[^"' )]+\\/${articleCode})`, 'i'),
      ) ?? extractMatch(html, new RegExp(`(\\/products\\/[^"' )]+\\/${articleCode})`, 'i'))
    : null

  return {
    label,
    subcategory,
    listingUrl,
    sourceUrl: relativeProductUrl ? makeAbsoluteUrl(relativeProductUrl, 'https://www.louisvuitton.cn') : listingUrl,
    title: normalizeLouisVuittonTitleFromImage(image),
    image,
  }
}

function extractPublishedAtFromHtml(html: string, checkedAt: string) {
  const directValue =
    extractMatch(html, /property="article:published_time" content="([^"]+)"/i) ??
    extractMatch(html, /name="date" content="([^"]+)"/i) ??
    extractMatch(html, /"datePublished":"([^"]+)"/i) ??
    extractMatch(html, /(\d{4}-\d{2}-\d{2})/) ??
    extractMatch(html, /(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)/)

  return (
    normalizeIsoDate(directValue ?? '') ??
    normalizeChineseDate(directValue ?? '') ??
    normalizeCheckedAt(checkedAt)
  )
}

async function fetchGenericCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(rule.listUrl)
  const sourceTitle =
    extractTitleFromHtml(html) ?? `${rule.brand} ${rule.subcategory} 新品检索`
  const image = extractImageFromHtml(html, rule.listUrl) ?? ''
  const publishedAt = extractPublishedAtFromHtml(html, checkedAt)

  return buildCandidate(rule, checkedAt, {
    sourceTitle,
    sourceSummary: `${rule.brand} ${rule.sourceLabel} 当前可抓取到 ${rule.subcategory} 页面内容，已按产品与分类规则生成候选新闻。`,
    image,
    publishedAt,
  })
}

function buildFallbackSummary(rule: BrandSourceRule) {
  return `${rule.brand} ${rule.subcategory}入口页检索到与 ${rule.products.join('、')} 相关的新品线索，等待进入真实抓取阶段补齐页面解析。`
}

function buildCandidate(
  rule: BrandSourceRule,
  checkedAt: string,
  overrides: Partial<CrawlCandidate>,
): CrawlCandidate {
  return {
    brand: rule.brand,
    category: rule.category,
    subcategory: rule.subcategory,
    sourceType: rule.sourceType,
    sourceLabel: rule.sourceLabel,
    sourceUrl: rule.listUrl,
    sourceTitle: `${rule.brand} ${rule.subcategory} 新品检索`,
    sourceSummary: buildFallbackSummary(rule),
    products: rule.products,
    image: '',
    checkedAt: normalizeCheckedAt(checkedAt),
    publishedAt: normalizeCheckedAt(checkedAt),
    matchedKeywords: detectMatchedKeywords(rule),
    ...overrides,
  }
}

async function applyImageRuleHints(rule: BrandSourceRule, candidate: CrawlCandidate) {
  const [brandRule, storyRule] = await Promise.all([
    findBrandImageRule(rule.brand),
    findImageRuleForCandidate(candidate),
  ])

  const preferredImage =
    candidate.image ||
    storyRule?.acquisition.candidateImageUrl ||
    storyRule?.acquisition.localMirrorPath ||
    ''

  return {
    ...candidate,
    image: preferredImage,
    imageRuleMethod: storyRule?.acquisition.method ?? brandRule?.strategy.brandLevelMethods[0],
    imageRulePriority: storyRule?.acquisition.priority ?? brandRule?.strategy.brandLevelMethods ?? [],
    imageRuleLocalMirrorPath: storyRule?.acquisition.localMirrorPath ?? null,
    imageRuleCandidateImageUrl: storyRule?.acquisition.candidateImageUrl ?? null,
  } satisfies CrawlCandidate
}

function toProbe(candidate: CrawlCandidate): BrandProbe {
  return {
    brand: candidate.brand,
    category: candidate.category,
    subcategory: candidate.subcategory,
    sourceUrl: candidate.sourceUrl,
    sourceTitle: candidate.sourceTitle,
    publishedAt: candidate.publishedAt,
    products: candidate.products,
    matchedKeywords: candidate.matchedKeywords,
  }
}

async function fetchAppleCandidate(rule: BrandSourceRule, checkedAt: string) {
  const listHtml = await fetchHtml(rule.listUrl)
  const relativeUrl =
    extractMatch(listHtml, /(\/cn\/newsroom\/\d{4}\/\d{2}\/apple-introduces-iphone-17e\/)/) ??
    extractMatch(listHtml, /(\/newsroom\/\d{4}\/\d{2}\/apple-introduces-iphone-17e\/)/)
  const detailUrl = relativeUrl
    ? new URL(relativeUrl, APPLE_NEWSROOM_BASE).toString()
    : 'https://www.apple.com.cn/cn/newsroom/2026/03/apple-introduces-iphone-17e/'
  const detailHtml = await fetchHtml(detailUrl)

  const sourceTitle =
    extractMatch(detailHtml, /property="og:title" content="([^"]+)"/) ??
    extractMatch(detailHtml, /<title>([^<]+)<\/title>/)
  const image =
    extractMatch(detailHtml, /property="og:image" content="([^"]+)"/) ??
    extractMatch(listHtml, /(https:\/\/www\.apple\.com\.cn\/newsroom\/images\/[^"' )]+\.jpg(?:\.[a-z-]+\.jpg)?(?:\?[^\s"' )]+)?)/i)
  const publishedAt =
    normalizeChineseDate(extractMatch(detailHtml, /(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)/) ?? '') ??
    normalizeChineseDate(extractMatch(listHtml, /发表时间\s+(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)/) ?? '') ??
    normalizeCheckedAt(checkedAt)

  return buildCandidate(rule, checkedAt, {
    sourceUrl: detailUrl,
    sourceTitle: collapseWhitespace(sourceTitle ?? 'Apple 推出 iPhone 17e'),
    sourceSummary: 'Apple 中国大陆新闻稿页面发布了 iPhone 17e 相关内容，可直接用于生成手机新品新闻。',
    image: decodeHtmlEntities(image ?? ''),
    publishedAt,
  })
}

async function fetchShiseidoCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(SHISEIDO_ULTIMUNE_URL)
  const sourceTitle =
    extractMatch(html, /property="og:title" content="([^"]+)"/) ??
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /product-name"[^>]*>([^<]+)</)
  const image = extractMatch(html, /property="og:image" content="([^"]+)"/)

  return buildCandidate(rule, checkedAt, {
    sourceUrl: SHISEIDO_ULTIMUNE_URL,
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle ?? '「红腰子」抗老精华')),
    sourceSummary: '资生堂中国官网产品页当前主推「红腰子」抗老精华，可作为护肤新品新闻的主要来源。',
    image: decodeHtmlEntities(image ?? ''),
  })
}

async function fetchAdidasCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(rule.listUrl)
  const sourceTitle =
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /(F50 MESSI ELITE FG[^<"]+)/)
  const image = extractMatch(html, /(https:\/\/static1\.adidas\.com\.cn\/t395\/[^"' )]+\.jpg)/)

  return buildCandidate(rule, checkedAt, {
    sourceTitle: collapseWhitespace(sourceTitle ?? 'F50 MESSI ELITE FG 梅西系列天然硬草地长钉系带款足球鞋'),
    sourceSummary: 'adidas 中国官网当前产品页展示 F50 MESSI ELITE FG，可直接提炼为足球鞋新品新闻。',
    image: image ?? '',
  })
}

async function fetchAdidasPdpCandidate(
  rule: BrandSourceRule,
  checkedAt: string,
  articleId: string,
  sectionLabel?: string,
  sourceTitleOverride?: string,
) {
  const sourceUrl = `https://www.adidas.com.cn/pdp?articleId=${articleId}`
  const html = await fetchHtml(sourceUrl)
  const sourceTitle =
    sourceTitleOverride ??
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /(adidas-[^<"]+)/)
  const image =
    extractMatch(html, /(https:\/\/static1\.adidas\.com\.cn\/t395\/[^"' )]+\.(?:jpg|jpeg|png|webp))/i) ?? ''

  return buildCandidate(rule, checkedAt, {
    sourceUrl,
    sourceLabel: sectionLabel ? `adidas 中国官网·${sectionLabel}` : rule.sourceLabel,
    sourceTitle: collapseWhitespace(
      decodeHtmlEntities(
        (sourceTitle ?? 'adidas 中国官网产品页')
          .replace(/^阿迪达斯-/, '')
          .replace(/\s*\|\s*adidas.*$/i, ''),
      ),
    ),
    sourceSummary: sectionLabel
      ? `adidas 中国官网“${sectionLabel}”专题页当前第一个产品已提取为 ${rule.subcategory} 新品候选，可直接生成产品新闻。`
      : 'adidas 中国官网当前产品页可稳定抓到标题与主图，适合用于生成新品新闻。',
    image,
  })
}

async function fetchLouisVuittonCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(LOUIS_VUITTON_CAPUCINES_URL)
  const sourceTitle = extractMatch(html, /<title>([^<]+)<\/title>/)
  const image = extractMatch(
    html,
    /(https:\/\/www\.louisvuitton\.cn\/images\/is\/image\/lv\/1\/PP_VP_L\/[^"' )]+PM2_Front%20view\.jpg)/,
  )

  return buildCandidate(rule, checkedAt, {
    sourceUrl: LOUIS_VUITTON_CAPUCINES_URL,
    sourceTitle: collapseWhitespace(sourceTitle ?? 'CAPUCINES 迷你手袋'),
    sourceSummary: 'Louis Vuitton 中国官网当前可稳定抓到 Capucines 产品页主图与标题，可用于生成本季皮包新品新闻。',
    image: image ? encodeURI(decodeURIComponent(image)) : '',
  })
}

async function fetchHermesCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(HERMES_H08_URL)
  const sourceTitle =
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /property="og:title" content="([^"]+)"/)
  const image =
    extractMatch(html, /property="og:image" content="([^"]+)"/) ??
    extractMatch(html, /(https:\/\/assets\.hermes\.cn\/is\/image\/hermesproduct\/[^"' )]+\.(?:jpg|jpeg|png))/i)

  return buildCandidate(rule, checkedAt, {
    sourceUrl: HERMES_H08_URL,
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle ?? 'Hermès H08腕表，42毫米')),
    sourceSummary: '爱马仕中国官网当前可稳定抓到 Hermès H08 产品页主图与标题，可用于生成腕表新品新闻。',
    image: decodeHtmlEntities(image ?? ''),
  })
}

async function fetchDiorBeautyCandidate(rule: BrandSourceRule, checkedAt: string) {
  return buildCandidate(rule, checkedAt, {
    sourceUrl: DIOR_FOREVER_GLOW_URL,
    sourceTitle: 'Dior Forever Skin Glow',
    sourceSummary: 'Dior Beauty 当前可从官方产品页稳定抓到 Forever 底妆产品图与标题，适合用于彩妆新品新闻。',
    image: DIOR_FOREVER_GLOW_IMAGE,
  })
}

async function fetchWilsonCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(WILSON_RUSH_PRO_ARTICLE_URL)
  const sourceTitle =
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /property="og:title" content="([^"]+)"/)
  const image =
    extractMatch(html, /property="og:image" content="([^"]+)"/) ??
    extractMatch(html, /(https:\/\/www\.wilson\.com\/en-us\/blog\/tennis\/wilson-labs\/[^"' )]+\.(?:jpg|jpeg|png)(?:\?[^"' )]+)?)/i)
  const publishedAt =
    normalizeIsoDate(extractMatch(html, /(\d{4}-\d{2}-\d{2})/) ?? '') ?? normalizeCheckedAt(checkedAt)

  return buildCandidate(rule, checkedAt, {
    sourceUrl: WILSON_RUSH_PRO_ARTICLE_URL,
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle ?? 'Introducing the New Rush Pro 4.5 Tennis Shoe')),
    sourceSummary: 'Wilson 官方博客当前发布了 Rush Pro 4.5 相关文章，可直接用于生成网球鞋新品新闻。',
    image: decodeHtmlEntities(image ?? ''),
    publishedAt,
  })
}

async function fetchNikeTrendProducts(subcategory: string) {
  const configuredPages = await getConfiguredBrandPages('Nike', 'nike_trend_pages', NIKE_TREND_PAGES)
  const pages = configuredPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractNikeFirstProductFromListing(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is NikeTrendProduct => Boolean(product))
}

async function fetchAdidasSectionProducts(subcategory: string) {
  const configuredPages = await getConfiguredBrandPages('Adidas', 'adidas_home_feed_pages', ADIDAS_HOME_FEED_PAGES)
  const pages = configuredPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractAdidasFirstProductFromListing(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is AdidasListingProduct => Boolean(product))
}

async function fetchLouisVuittonLatestProducts(subcategory: string) {
  const configuredPages = await getConfiguredBrandPages(
    'Louis Vuitton',
    'louis_vuitton_latest_pages',
    LOUIS_VUITTON_LATEST_PAGES,
  )
  const pages = configuredPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractLouisVuittonLatestProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is LouisVuittonLatestProduct => Boolean(product))
}

async function fetchPradaCategoryProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('Prada')
  if (!crawlRule || crawlRule.mode !== 'prada_category_pages') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractPradaCategoryProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is PradaCategoryProduct => Boolean(product))
}

async function fetchSamsungBuyPageProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('Samsung')
  if (!crawlRule || crawlRule.mode !== 'samsung_buy_pages') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractSamsungBuyPageProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is SamsungBuyPageProduct => Boolean(product))
}

async function fetchPokiNewGameProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('Poki')
  if (!crawlRule || crawlRule.mode !== 'poki_new_games') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractPokiNewGameProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is WebgamePortalProduct => Boolean(product))
}

async function fetchGamePixNewProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('GamePix')
  if (!crawlRule || crawlRule.mode !== 'gamepix_new_games') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.flatMap(async (page) => {
      const html = await fetchHtml(page.url)
      const detailUrls = extractGamePixNewGameUrls(html)
      return Promise.all(detailUrls.map((url) => fetchGameDetailProduct(url, page.label, page.subcategory)))
    }),
  )

  return products.flat().filter((product): product is WebgamePortalProduct => Boolean(product))
}

async function fetchPacoGamesLatestProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('PacoGames')
  if (!crawlRule || crawlRule.mode !== 'pacogames_latest_games') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.flatMap(async (page) => {
      const html = await fetchHtml(page.url)
      const detailUrls = extractPacoGamesLatestUrls(html)
      return Promise.all(detailUrls.map((url) => fetchGameDetailProduct(url, page.label, page.subcategory)))
    }),
  )

  return products.flat().filter((product): product is WebgamePortalProduct => Boolean(product))
}

async function fetchY8NewProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('Y8')
  if (!crawlRule || crawlRule.mode !== 'y8_new_games') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.flatMap(async (page) => {
      const html = await fetchHtml(page.url)
      const detailUrls = extractY8NewGameUrls(html)
      return Promise.all(detailUrls.map((url) => fetchGameDetailProduct(url, page.label, page.subcategory)))
    }),
  )

  return products.flat().filter((product): product is WebgamePortalProduct => Boolean(product))
}

async function fetchCrazyGamesNewProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('CrazyGames')
  if (!crawlRule || crawlRule.mode !== 'crazygames_new_games') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractCrazyGamesNewGameProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is WebgamePortalProduct => Boolean(product))
}

async function fetchArcadromeHomeProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('Arcadrome')
  if (!crawlRule || crawlRule.mode !== 'arcadrome_home_games') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractArcadromeHomeGameProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is WebgamePortalProduct => Boolean(product))
}

async function fetchAdidasCandidates(rule: BrandSourceRule, checkedAt: string) {
  const products = await fetchAdidasSectionProducts(rule.subcategory)

  if (products.length === 0) {
    return [await fetchAdidasCandidate(rule, checkedAt)]
  }

  return Promise.all(
    products.map((product) =>
      fetchAdidasPdpCandidate(
        rule,
        checkedAt,
        product.articleId,
        product.label,
        product.articleName,
      ),
    ),
  )
}

async function fetchLouisVuittonLatestCandidates(rule: BrandSourceRule, checkedAt: string) {
  const products = await fetchLouisVuittonLatestProducts(rule.subcategory)

  if (products.length === 0) {
    return [await fetchLouisVuittonCandidate(rule, checkedAt)]
  }

  return products.map((product) =>
    buildCandidate(rule, checkedAt, {
      sourceLabel: `Louis Vuitton 中国官网·${product.label}`,
      sourceUrl: product.sourceUrl,
      sourceTitle: product.title,
      sourceSummary: `Louis Vuitton 中国官网“${product.label}”页当前首个新品为 ${product.title}，已作为 ${product.subcategory} 新品候选写入抓取流程。`,
      products: [product.title, product.label, ...rule.products.slice(0, 1)],
      image: product.image,
      matchedKeywords: [product.label, ...detectMatchedKeywords(rule)].slice(0, 4),
    }),
  )
}

async function fetchPradaCategoryCandidates(rule: BrandSourceRule, checkedAt: string) {
  const products = await fetchPradaCategoryProducts(rule.subcategory)

  if (products.length === 0) {
    return [await fetchGenericCandidate(rule, checkedAt)]
  }

  return products.map((product) =>
    buildCandidate(rule, checkedAt, {
      sourceLabel: `Prada 中国官网·${product.label}`,
      sourceUrl: product.sourceUrl,
      sourceTitle: product.title,
      sourceSummary: `Prada 中国官网“${product.label}”页当前首个 ${product.subcategory} 产品为 ${product.title}，已作为新品候选写入抓取流程。`,
      products: [product.title, product.label, ...rule.products.slice(0, 1)],
      image: product.image,
      matchedKeywords: [product.label, ...detectMatchedKeywords(rule)].slice(0, 4),
    }),
  )
}

async function fetchSamsungBuyPageCandidates(rule: BrandSourceRule, checkedAt: string) {
  const products = await fetchSamsungBuyPageProducts(rule.subcategory)

  if (products.length === 0) {
    return [await fetchGenericCandidate(rule, checkedAt)]
  }

  return products.map((product) =>
    buildCandidate(rule, checkedAt, {
      sourceLabel: `Samsung 中国官网·${product.label}`,
      sourceUrl: product.sourceUrl,
      sourceTitle: product.title,
      sourceSummary: `Samsung 中国官网“${product.label}”买页当前首个可售型号为 ${product.title}，已作为 ${product.subcategory} 新品候选写入抓取流程。`,
      products: [product.title, product.label, ...rule.products.slice(0, 1)],
      image: product.image,
      matchedKeywords: [product.label, ...detectMatchedKeywords(rule)].slice(0, 4),
    }),
  )
}

async function fetchWebgameCandidates(
  rule: BrandSourceRule,
  checkedAt: string,
  products: WebgamePortalProduct[],
) {
  if (products.length === 0) {
    return [await fetchGenericCandidate(rule, checkedAt)]
  }

  return products.map((product) =>
    buildCandidate(rule, checkedAt, {
      sourceLabel: `${rule.brand} 官方来源·${product.label}`,
      sourceUrl: product.sourceUrl,
      sourceTitle: product.title,
      sourceSummary: `${rule.brand} 当前按“${product.label}”入口页抓取到首个新游戏 ${product.title}，已作为网页游戏新品候选写入抓取流程。`,
      products: [product.title, product.label, ...rule.products.slice(0, 1)],
      image: product.image,
      matchedKeywords: [product.label, ...detectMatchedKeywords(rule)].slice(0, 4),
    }),
  )
}

async function fetchNikeCandidates(rule: BrandSourceRule, checkedAt: string) {
  const products = await fetchNikeTrendProducts(rule.subcategory)

  if (products.length === 0) {
    return [buildCandidate(rule, checkedAt, {})]
  }

  return products.map((product) =>
    buildCandidate(rule, checkedAt, {
      sourceLabel: `Nike 中国官网·${product.label}`,
      sourceUrl: product.sourceUrl,
      sourceTitle: `${product.title} ${product.subtitle}`.trim(),
      sourceSummary: `Nike 中国官网“新品&潮流”下的“${product.label}”页面当前第一个产品为 ${product.title}，已作为 ${product.subcategory} 新品候选写入抓取流程。`,
      products: [product.title, product.subtitle, product.label],
      image: product.image,
      matchedKeywords: [product.label, ...detectMatchedKeywords(rule)].slice(0, 4),
    }),
  )
}

async function fetchConfiguredSinglePageCandidates(rule: BrandSourceRule, checkedAt: string) {
  const crawlRule = await findBrandCrawlRule(rule.brand)
  if (!crawlRule || crawlRule.mode !== 'single_product_page') {
    return null
  }

  const pages = crawlRule.entryPages.filter((entry) => entry.subcategory === rule.subcategory)
  if (pages.length === 0) {
    return null
  }

  const candidates = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      const sourceTitle =
        extractTitleFromHtml(html) ?? `${rule.brand} ${page.label}`
      const image = extractImageFromHtml(html, page.url) ?? ''
      const publishedAt = extractPublishedAtFromHtml(html, checkedAt)

      return buildCandidate(rule, checkedAt, {
        sourceLabel: `${rule.brand} 官方来源·${page.label}`,
        sourceUrl: page.url,
        sourceTitle,
        sourceSummary: `${rule.brand} 当前按已记录规则从“${page.label}”入口页抓取 ${rule.subcategory} 内容，并以该入口页首个稳定产品来源生成候选新闻。`,
        image,
        publishedAt,
        matchedKeywords: [page.label, ...detectMatchedKeywords(rule)].slice(0, 4),
      })
    }),
  )

  return candidates
}

async function fetchConfiguredRuleCandidates(rule: BrandSourceRule, checkedAt: string) {
  const crawlRule = await findBrandCrawlRule(rule.brand)
  if (!crawlRule) {
    return null
  }

  switch (crawlRule.mode) {
    case 'prada_category_pages':
      return fetchPradaCategoryCandidates(rule, checkedAt)
    case 'samsung_buy_pages':
      return fetchSamsungBuyPageCandidates(rule, checkedAt)
    case 'pacogames_latest_games':
      return fetchWebgameCandidates(rule, checkedAt, await fetchPacoGamesLatestProducts(rule.subcategory))
    case 'gamepix_new_games':
      return fetchWebgameCandidates(rule, checkedAt, await fetchGamePixNewProducts(rule.subcategory))
    case 'poki_new_games':
      return fetchWebgameCandidates(rule, checkedAt, await fetchPokiNewGameProducts(rule.subcategory))
    case 'y8_new_games':
      return fetchWebgameCandidates(rule, checkedAt, await fetchY8NewProducts(rule.subcategory))
    case 'crazygames_new_games':
      return fetchWebgameCandidates(rule, checkedAt, await fetchCrazyGamesNewProducts(rule.subcategory))
    case 'arcadrome_home_games':
      return fetchWebgameCandidates(rule, checkedAt, await fetchArcadromeHomeProducts(rule.subcategory))
    case 'single_product_page':
      return fetchConfiguredSinglePageCandidates(rule, checkedAt)
    default:
      return null
  }
}

async function fetchMicrosoftSurfaceCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(rule.listUrl)
  const sourceTitle =
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /property="og:title" content="([^"]+)"/)
  const image =
    extractMatch(html, /property="og:image" content="([^"]+)"/) ??
    extractMatch(html, /(https:\/\/cdn-dynmedia-1\.microsoft\.com\/is\/image\/microsoftcorp\/[^"' )]+)/i)

  return buildCandidate(rule, checkedAt, {
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle ?? 'Surface Laptop 6：商用版安全 AI 笔记本电脑')),
    sourceSummary: 'Microsoft Surface 中国官网当前可稳定抓到 Surface Laptop 6 页面标题与官方主视觉，可用于生成电脑新品新闻。',
    image: decodeHtmlEntities(image ?? ''),
  })
}

async function fetchRealCandidate(rule: BrandSourceRule, checkedAt: string) {
  const configuredRuleCandidates = await fetchConfiguredRuleCandidates(rule, checkedAt)
  if (configuredRuleCandidates && configuredRuleCandidates.length > 0) {
    return configuredRuleCandidates[0]
  }

  switch (rule.brand) {
    case 'Nike':
      return (await fetchNikeCandidates(rule, checkedAt))[0]
    case 'Adidas':
      return (await fetchAdidasCandidates(rule, checkedAt))[0]
    case 'Louis Vuitton':
      return (await fetchLouisVuittonLatestCandidates(rule, checkedAt))[0]
    case 'Apple':
      return fetchAppleCandidate(rule, checkedAt)
    case 'Hermes':
      return fetchHermesCandidate(rule, checkedAt)
    case 'Dior Beauty':
      return fetchDiorBeautyCandidate(rule, checkedAt)
    case 'SHISEIDO':
      return fetchShiseidoCandidate(rule, checkedAt)
    case 'Wilson':
      return fetchWilsonCandidate(rule, checkedAt)
    case 'Microsoft Surface':
      return fetchMicrosoftSurfaceCandidate(rule, checkedAt)
    default:
      return fetchGenericCandidate(rule, checkedAt)
  }
}

async function fetchRealProbe(rule: BrandSourceRule, checkedAt: string): Promise<BrandProbe[] | null> {
  const configuredRuleCandidates = await fetchConfiguredRuleCandidates(rule, checkedAt)
  if (configuredRuleCandidates && configuredRuleCandidates.length > 0) {
    return configuredRuleCandidates.map(toProbe)
  }

  if (rule.brand === 'Nike') {
    const candidates = await fetchNikeCandidates(rule, checkedAt)
    return candidates.map(toProbe)
  }

  if (rule.brand === 'Adidas') {
    const candidates = await fetchAdidasCandidates(rule, checkedAt)
    return candidates.map(toProbe)
  }

  if (rule.brand === 'Louis Vuitton') {
    const candidates = await fetchLouisVuittonLatestCandidates(rule, checkedAt)
    return candidates.map(toProbe)
  }

  if (rule.brand === 'Apple') {
    const listHtml = await fetchHtml(rule.listUrl)
    const relativeUrl =
      extractMatch(listHtml, /(\/cn\/newsroom\/\d{4}\/\d{2}\/apple-introduces-iphone-17e\/)/) ??
      extractMatch(listHtml, /(\/newsroom\/\d{4}\/\d{2}\/apple-introduces-iphone-17e\/)/)
    const detailUrl = relativeUrl
      ? new URL(relativeUrl, APPLE_NEWSROOM_BASE).toString()
      : 'https://www.apple.com.cn/cn/newsroom/2026/03/apple-introduces-iphone-17e/'
    const detailHtml = await fetchHtml(detailUrl)
    const publishedAt =
      normalizeChineseDate(extractMatch(detailHtml, /(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)/) ?? '') ??
      normalizeChineseDate(extractMatch(listHtml, /发表时间\s+(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)/) ?? '') ??
      normalizeCheckedAt(checkedAt)

    return [
      {
        brand: rule.brand,
        category: rule.category,
        subcategory: rule.subcategory,
        sourceUrl: detailUrl,
        sourceTitle: 'Apple 推出 iPhone 17e',
        publishedAt,
        products: rule.products,
        matchedKeywords: detectMatchedKeywords(rule),
      },
    ]
  }

  const candidate = await fetchRealCandidate(rule, checkedAt)
  return candidate ? [toProbe(candidate)] : null
}

export async function probeBrandSource(rule: BrandSourceRule): Promise<BrandProbe[]> {
  const checkedAt = new Date().toISOString()
  const realProbe = await fetchRealProbe(rule, checkedAt)

  if (realProbe) {
    return realProbe
  }

  return [
    toProbe(
      buildCandidate(rule, checkedAt, {
        sourceTitle: `${rule.brand} ${rule.subcategory} 新品检索`,
      }),
    ),
  ]
}

export async function fetchCandidatesForBrand(rule: BrandSourceRule, probes?: BrandProbe[]): Promise<CrawlCandidate[]> {
  const checkedAt = new Date().toISOString()
  const configuredRuleCandidates = await fetchConfiguredRuleCandidates(rule, checkedAt)
  if (configuredRuleCandidates && configuredRuleCandidates.length > 0) {
    return Promise.all(configuredRuleCandidates.map((candidate) => applyImageRuleHints(rule, candidate)))
  }

  if (rule.brand === 'Nike') {
    const candidates = await fetchNikeCandidates(rule, checkedAt)
    return Promise.all(candidates.map((candidate) => applyImageRuleHints(rule, candidate)))
  }

  if (rule.brand === 'Adidas') {
    const candidates = await fetchAdidasCandidates(rule, checkedAt)
    return Promise.all(candidates.map((candidate) => applyImageRuleHints(rule, candidate)))
  }

  if (rule.brand === 'Louis Vuitton') {
    const candidates = await fetchLouisVuittonLatestCandidates(rule, checkedAt)
    return Promise.all(candidates.map((candidate) => applyImageRuleHints(rule, candidate)))
  }

  const realCandidate = await fetchRealCandidate(rule, checkedAt)

  if (realCandidate) {
    return [await applyImageRuleHints(rule, realCandidate)]
  }

  if (probes && probes.length > 0) {
    return Promise.all(
      probes.map((probe) =>
        applyImageRuleHints(
          rule,
          buildCandidate(rule, checkedAt, {
        sourceUrl: probe.sourceUrl,
        sourceTitle: probe.sourceTitle,
        publishedAt: probe.publishedAt,
        products: probe.products,
        matchedKeywords: probe.matchedKeywords,
          }),
        ),
      ),
    )
  }

  return [await applyImageRuleHints(rule, buildCandidate(rule, checkedAt, {}))]
}
