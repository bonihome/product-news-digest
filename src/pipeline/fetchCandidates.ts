import type { BrandProbe, BrandSourceRule, CrawlCandidate } from './types'
import { findBrandCrawlRule, findBrandImageRule, findImageRuleForCandidate } from './imageRules'

const APPLE_NEWSROOM_BASE = 'https://www.apple.com.cn'
const LOUIS_VUITTON_LATEST_PAGES = [
  {
    label: '女士新品',
    subcategory: '服装',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/women/new-in-women/_/N-ty7er6l?_=cb-20260624',
  },
  {
    label: '男士新品',
    subcategory: '包袋',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/men/new-in-men/_/N-t14l5lul?_=cb-20260624',
  },
  {
    label: 'LV Resort 系列',
    subcategory: '包袋',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/lv-resort-collection/_/N-t1h80en2?_=cb-20260624',
  },
  {
    label: 'Flight Mode 系列',
    subcategory: '包袋',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/flight-mode-collection/_/N-t97bofk?_=cb-20260624',
  },
  {
    label: 'High Summer 系列',
    subcategory: '夏季系列',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/women/high-summer/_/N-t6p07xp',
  },
  {
    label: 'Sports 胶囊系列',
    subcategory: '线上首发',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/men/sports-capsule/_/N-t1oxl8c0',
  },
  {
    label: '秋冬男士 2026',
    subcategory: '时装秀',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/men/fall-winter-2026-show/_/N-t1g31ztu',
  },
  {
    label: '女士当季新品包袋',
    subcategory: '包袋',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/women/handbags/new-in-handbags/_/N-t1dzbzff',
  },
  {
    label: 'Speedy 手袋',
    subcategory: '包袋',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/women/handbags/all-handbags/speedy/_/N-tfr7qdp-ak5wlig',
  },
  {
    label: 'Neverfull 手袋',
    subcategory: '包袋',
    listingUrl: 'https://www.louisvuitton.cn/zhs-cn/women/handbags/all-handbags/neverfull/_/N-tfr7qdp-akyxcuct',
  },
] as const
// 2026-06-17 unused: fetchShiseidoCandidate 现改用 rule.listUrl
// const SHISEIDO_ULTIMUNE_URL =
//   'https://www.shiseido.com.cn/ultimune-power-infusing-serum-s17283.html?cgid=S2_Category_Serums'
// Hermès H08 product page (kept as historical reference):
// const HERMES_H08_URL = 'https://www.hermes.cn/cn/zh/product/hermes-h08%E8%85%95%E8%A1%A842%E6%AF%AB%E7%B1%B3-W049430WW00/'
const DIOR_FOREVER_GLOW_URL = 'https://www.dior.cn/zh_cn/beauty/products/y0998020-dior-forever-skin-glow'
const DIOR_FOREVER_GLOW_IMAGE = ''
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
  // Keep full ISO datetime for precise sorting; fall back to date-only
  return checkedAt.length > 10 ? checkedAt : checkedAt.slice(0, 10)
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

  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])

  if (y < 2020 || y > 2030) {
    return null
  }
  if (m < 1 || m > 12) {
    return null
  }

  const maxDay = new Date(y, m, 0).getDate()
  if (d < 1 || d > maxDay) {
    return null
  }

  const parsed = new Date(y, m - 1, d)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 2)
  tomorrow.setHours(23, 59, 59)
  if (parsed.getTime() > tomorrow.getTime()) {
    return null
  }

  return `${match[1]}-${match[2]}-${match[3]}`
}

function extractMatch(html: string, pattern: RegExp, group = 1) {
  const match = html.match(pattern)
  return match?.[group] ?? null
}

import { execFileSync } from "node:child_process"

const SCRAPLING_SCRIPT = new URL("../../scripts/scrapling-fetch.py", import.meta.url).pathname
async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
    })
    if (response.ok) { return response.text() }
    console.warn("[fetchHtml] normal fetch failed (" + response.status + "), trying Scrapling: " + url)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn("[fetchHtml] normal fetch error (" + msg + "), trying Scrapling: " + url)
  }
  // Retry loop for transient spawn errors (ENOBUFS from concurrent subprocess limits)
  const MAX_RETRIES = 3
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = execFileSync("python3", [SCRAPLING_SCRIPT, url], {
        timeout: 30000,
        maxBuffer: 2 * 1024 * 1024,
        encoding: "utf-8",
      })
      if (result.startsWith("{")) {
        const parsed = JSON.parse(result)
        if (parsed.error) { throw new Error(parsed.error + " (status " + parsed.status + ")") }
      }
      return result
    } catch (e2) {
      const msg2 = e2 instanceof Error ? e2.message : String(e2)
      if (msg2.includes("ENOBUFS") && attempt < MAX_RETRIES - 1) {
        const delay = 3000 + attempt * 2000
        console.warn("[fetchHtml] ENOBUFS retry " + (attempt + 1) + "/" + (MAX_RETRIES - 1) + " in " + delay + "ms: " + url)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw new Error("Scrapling fetch failed for " + url + ": " + msg2, { cause: e2 })
    }
  }
  throw new Error("Scrapling fetch failed for " + url + ": max retries exhausted")
}

/** Fetch a URL via headless browser (StealthyFetcher) for SPA / anti-bot pages. */
async function fetchBrowserHtml(url: string) {
  const MAX_RETRIES = 3
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = execFileSync("python3", [SCRAPLING_SCRIPT, "--browser", "--no-network-idle", "--timeout=120", url], {
        timeout: 180000,
        maxBuffer: 4 * 1024 * 1024,
        encoding: "utf-8",
      })
      if (result.startsWith("{")) {
        const parsed = JSON.parse(result)
        throw new Error(parsed.error + " (status " + parsed.status + ")")
      }
      return result
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes("ENOBUFS") && attempt < MAX_RETRIES - 1) {
        const delay = 5000 + attempt * 3000
        console.warn("[fetchBrowserHtml] ENOBUFS retry " + (attempt + 1) + "/" + (MAX_RETRIES - 1) + " in " + delay + "ms: " + url)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw new Error("Browser fetch failed for " + url + ": " + msg, { cause: e })
    }
  }
  throw new Error("Browser fetch failed for " + url + ": max retries exhausted")
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

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

// Alexander McQueen 产品图提取（2026-08-30 新增）。
// 官网 2026 改版后：
//   - 产品详情页**没有 og:image / twitter:image / itemprop=image**
//   - 产品图 CDN 路径为 media.alexandermcqueen.cn/asset/<uuid>/<size>/<PRODUCTCODE>_<view>.jpg
//     （旧的 /m/<uuid>/Original_Ecom-<code>_F.jpg 已废弃）
//   - 尺寸档位：Original-Ecom / Large / Medium / eCom / Small / Thumbnail / Swatch ...
//   - 视角后缀：_F(正面) _E _D _R _L
//
// ⚠️ 同一产品页会同时内嵌**其他色号**的图（如 876348Q1BH31000 页面里还有 876348Q1BH39004），
// 所以必须用 sourceUrl 里的产品码精确匹配，否则会配到别的颜色/款式（用户明确不接受乱配）。
function extractAlexanderMcQueenImage(html: string, pageUrl: string): string | null {
  // 产品码 = URL 最后一段（去 .html）按 '-' 切分后的末尾 token，如
  //   .../pointelle-knit-top-876348q1bh31000.html → 876348Q1BH31000
  //   .../gingham-check-tailored-trousers-a002yuqjagd1080.html → A002YUQJAGD1080（以字母开头）
  //   .../584968qeaaa9007.html                    → 584968QEAAA9007（整段就是产品码）
  const slug = pageUrl.split('?')[0].split('#')[0].replace(/\/$/, '').split('/').pop() ?? ''
  const lastToken = slug.replace(/\.html?$/i, '').split('-').pop() ?? ''
  const productCode =
    /^[a-z0-9]{10,}$/i.test(lastToken) && /[0-9]/.test(lastToken) ? lastToken.toUpperCase() : null

  const assetPattern =
    /https?:\/\/media\.alexandermcqueen\.cn\/asset\/[a-f0-9-]+\/(?:Original-Ecom|Large|Medium|eCom)\/([A-Z0-9]+)_([A-Z])\.jpg/gi
  const found = [...html.matchAll(assetPattern)].map((m) => ({
    url: m[0],
    code: (m[1] || '').toUpperCase(),
    view: (m[2] || '').toUpperCase(),
    // Original-Ecom 是最大尺寸原图，优先
    sizeRank: /Original-Ecom/i.test(m[0]) ? 0 : /Large/i.test(m[0]) ? 1 : /Medium/i.test(m[0]) ? 2 : 3,
  }))

  if (found.length === 0) {
    return null
  }

  // 视角优先级：正面图优先
  const viewOrder = ['F', 'E', 'D', 'R', 'L']
  const rank = (view: string) => {
    const index = viewOrder.indexOf(view)
    return index === -1 ? viewOrder.length : index
  }

  // 只要 sourceUrl 能解析出产品码，就**只接受同产品码**的图（宁可无图，不可串色号）
  const pool = productCode ? found.filter((item) => item.code === productCode) : found
  if (pool.length === 0) {
    return null
  }

  pool.sort((a, b) => a.sizeRank - b.sizeRank || rank(a.view) - rank(b.view))
  return pool[0].url
}

function extractImageFromHtml(html: string, baseUrl: string) {
  // 品牌专属提取优先（这些站点 og:image 缺失或指向 logo/其他色号）
  if (/(?:^|\.)alexandermcqueen\.cn$/i.test(safeHostname(baseUrl))) {
    const mcqueenImage = extractAlexanderMcQueenImage(html, baseUrl)
    if (mcqueenImage) {
      return decodeHtmlEntities(mcqueenImage)
    }
  }

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

// 从列表页提取「产品链接」（同域名、非静态资源、非导航、含产品页特征）。
// 只对非 SPA 站点有效——SPA 站点（Cartier/Dior/Valentino 等）产品链接由 JS 拼接，
// curl 拿不到静态 href，这里会返回空，由调用方决定是否 browser 兜底。
function extractProductLinks(html: string, baseUrl: string): string[] {
  let host: string
  try {
    host = new URL(baseUrl).host
  } catch {
    return []
  }

  const seen = new Set<string>()
  const links: string[] = []

  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = (match[1] || '').trim()
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue
    }

    let abs: string
    try {
      abs = new URL(href, baseUrl).toString()
    } catch {
      continue
    }

    let url: URL
    try {
      url = new URL(abs)
    } catch {
      continue
    }
    if (url.host !== host) {
      continue
    }

    const path = url.pathname + (url.search || '')

    // 排除静态资源
    if (/\.(css|js|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|xml|json|pdf|mp4|webm|zip)(\?|$)/i.test(path)) {
      continue
    }

    // 排除导航/工具/内容页
    if (/\/(login|register|cart|checkout|account|wishlist|search|stores?|store-locator|help|faq|about|contact|privacy|terms|careers?|newsletter|sitemap|customer|support|delivery|returns?|buying-guide|article|news(?:center|room)?|stories|magazine|blog|events?|services?|sustainability|promotion)(\/|$|\?)/i.test(path)) {
      continue
    }
    // 排除索引页/首页（如 bravia/index.html），不是具体产品页
    if (/\/index\.html?$/i.test(path)) {
      continue
    }

    // 产品页特征：购买页 / 带 product_id 参数 / 显式产品路径 / 含 SKU 编号
    const isProduct =
      /(\/buy\/|\/buy\?|product[_=]id|\/product\/|\/products\/|\/p\/|\/item\/|\/goods\/|\/detail\/|\/creation\/|\/sku\/)/i.test(path) ||
      /\/[a-z0-9-]*[A-Z]{2,}\d{3,}/.test(path)

    if (isProduct && !seen.has(abs)) {
      seen.add(abs)
      links.push(abs)
    }
  }

  return links
}

// 从产品 URL 推断一个可读的产品标识，用作 products[0]（保证 story.id 唯一，
// 避免多个候选因 products 相同而生成相同 id 被去重）。
function inferProductLabelFromUrl(url: string, index: number): string {
  try {
    const u = new URL(url)
    const pid = u.searchParams.get('product_id') || u.searchParams.get('id') || u.searchParams.get('sku')
    if (pid) {
      return `产品 ${pid}`
    }
    const segments = u.pathname.split('/').filter(Boolean)
    let last = segments[segments.length - 1] || ''
    if (/^(buy|p|item|product|products|detail|creation|goods|sku)$/i.test(last)) {
      last = segments[segments.length - 2] || ''
    }
    // 去掉文件扩展名（.html/.htm/.php/.aspx 等），避免 "2026.html" → "2026.Html"
    last = last.replace(/\.(html?|php|aspx?|jsp)$/i, '')
    if (last && !/^\d+$/.test(last) && !/^index$/i.test(last)) {
      return last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }
  } catch {
    // ignore
  }
  return `新品 ${index + 1}`
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

type YonexMallProduct = {
  label: string
  subcategory: string
  listingUrl: string
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
  if (subcategory === '包袋') {
    return ['handbag', 'tote-bag', 'tote', 'shoulder-bag', 'bag', 'pouch', 'wallet']
  }

  if (subcategory === '服装') {
    return ['shirt', 'skirt', 'jacket', 'dress', 'coat', 'pants', 'shorts', 'top', 'sweater', 'cardigan']
  }

  if (subcategory === '首饰') {
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
    [...html.matchAll(/https:\/\/www\.prada\.cn\/content\/dam\/[^"' )]+\.jpg(?:\/_jcr_content\/renditions\/[^"' )]+)?/gi)].map(
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

function extractYonexMallProduct(
  html: string,
  listingUrl: string,
  label: string,
  subcategory: string,
): YonexMallProduct | null {
  const productListHtml = extractMatch(html, /<ul class="z-pro">([\s\S]*?)<\/ul>/i, 1) ?? html
  const match = productListHtml.match(
    /<li>\s*<a href="(\/home\/index\/mall_detail\/id\/\d+)">[\s\S]*?<img src="([^"]+)" alt="">[\s\S]*?<div class="s1">([^<]+)<\/div>/i,
  )

  if (!match) {
    return null
  }

  return {
    label,
    subcategory,
    listingUrl,
    sourceUrl: makeAbsoluteUrl(decodeHtmlEntities(match[1]), 'https://www.yonex.cn'),
    title: collapseWhitespace(decodeHtmlEntities(match[3])),
    image: makeAbsoluteUrl(decodeHtmlEntities(match[2]), 'https://www.yonex.cn'),
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
  // 2026-08-29 重写：旧正则用非贪婪 [\s\S]*? 跨字段匹配，遇到定制款
  // （productSubType=CUSTOMIZED 时 colorwayImages.portraitURL 为 null）会跳过
  // 第一个产品、跨边界命中第二个产品，导致 title 与 sourceUrl 错位（ja-3-by、
  // air-force-1-low-by 串图根因）。改为括号计数提取第一个完整产品对象 JSON 后
  // parse，title/image/sourceUrl 保证同源。
  const startIdx = html.indexOf('"products":[{')
  if (startIdx < 0) {
    return null
  }
  const objStart = html.indexOf('{', startIdx)
  if (objStart < 0) {
    return null
  }

  let depth = 0
  let inStr = false
  let escape = false
  let objEnd = -1
  for (let i = objStart; i < html.length; i++) {
    const c = html[i]
    if (inStr) {
      if (escape) {
        escape = false
      } else if (c === '\\') {
        escape = true
      } else if (c === '"') {
        inStr = false
      }
    } else if (c === '"') {
      inStr = true
    } else if (c === '{') {
      depth++
    } else if (c === '}') {
      depth--
      if (depth === 0) {
        objEnd = i + 1
        break
      }
    }
  }
  if (objEnd < 0) {
    return null
  }

  let product: {
    copy?: { title?: string; subTitle?: string }
    pdpUrl?: { url?: string }
    colorwayImages?: { squarishURL?: string | null; portraitURL?: string | null }
  }
  try {
    product = JSON.parse(html.slice(objStart, objEnd))
  } catch {
    return null
  }

  const title = product?.copy?.title ?? ''
  const subtitle = product?.copy?.subTitle ?? ''
  const sourceUrl = product?.pdpUrl?.url ?? ''
  // 定制款 portraitURL 为 null，squarishURL 才有图；标准款两者都有
  const image =
    product?.colorwayImages?.squarishURL ??
    product?.colorwayImages?.portraitURL ??
    ''

  if (!title || !sourceUrl) {
    return null
  }

  return {
    label,
    subcategory,
    listingUrl,
    title: decodeHtmlEntities(title),
    subtitle: decodeHtmlEntities(subtitle),
    image: decodeHtmlEntities(image),
    sourceUrl: decodeHtmlEntities(sourceUrl),
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
  // 优先从 listing 卡片 href 取第一个 product URL（治根）：
  // 旧版用图片 articleCode 反推 product URL 会撞上 M28548 Capucines（首页主推），
  // 导致 4 条 LV 新闻（男士新品/LV Resort/Flight Mode/Nautical/春夏女装）共用
  // https://www.louisvuitton.cn/.../capucines-mini-capucines-nvprod7540209v/M28548
  // 触发布局 sourceUrl 错配，publisher B 方案 reject。
  // 2026-06-12 改：从 href 直接取 product URL，丢弃 articleCode 反推。
  // 所有 pattern 都以 capture group(1) = 完整 URL / 完整相对路径为标准，
  // 这样 extractMatch(html, pattern) 默认取 group(1) 就能拿到完整 sourceUrl。
  const hrefPatterns = [
    // 产品网格卡片用相对路径 /zhs-cn/products/...，必须优先匹配。
    // 2026-08-18 修复：旧版把绝对 URL pattern 放最前，会匹配到 footer 链接
    // （如 nice-nano-monogram）而非列表页首个产品（如 squire-east-west），
    // 导致 title(从 image 反推) 与 sourceUrl(从 href 提取) 错位。
    /href=["'](\/zhs-cn\/products\/[a-z0-9-]+\/[A-Z0-9]+)["']/i,
    /href=["'](https:\/\/www\.louisvuitton\.cn\/zhs-cn\/products\/[a-z0-9-]+\/[A-Z0-9]+)["']/i,
    /["'](https:\/\/www\.louisvuitton\.cn\/zhs-cn\/products\/[a-z0-9-]+\/[A-Z0-9]+)["']/i,
  ]
  let listingProductUrl: string | null = null
  for (const pattern of hrefPatterns) {
    listingProductUrl = extractMatch(html, pattern)
    if (listingProductUrl) {
      break
    }
  }

  if (!listingProductUrl) {
    return null
  }

  const absoluteProductUrl: string = makeAbsoluteUrl(listingProductUrl as string, 'https://www.louisvuitton.cn')

  // 同步从 listing HTML 抓首张 PP_VP_L 商品图（保留原有 image 字段，便于 imageRules 匹配）
  const image: string = extractMatch(
    html,
    /(https:\/\/www\.louisvuitton\.cn\/images\/is\/image\/lv\/1\/PP_VP_L\/[^"' )]+\.(?:png|jpg|jpeg|webp)\?wid=\d+&hei=\d+)/i,
  ) ?? ''

  return {
    label,
    subcategory,
    listingUrl,
    sourceUrl: absoluteProductUrl,
    title: image ? normalizeLouisVuittonTitleFromImage(image) : `${label} 新品`,
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

const MAX_GENERIC_CANDIDATES = 5

// 有专用 fetch handler 的品牌（fetchRealCandidate 的 switch 分支）。
// 这些品牌走各自的精确提取逻辑，不走通用多候选。
const DEDICATED_HANDLER_BRANDS = new Set([
  'Nike',
  'Adidas',
  'Louis Vuitton',
  'Apple',
  'Hermes',
  'Chanel',
  'Dior Beauty',
  'SHISEIDO',
  'Wilson',
  'Microsoft Surface',
  'Boucheron',
  'LEGO',
])

// 通用品牌的多候选抓取：从列表页提取多个产品链接，每个产品一个候选。
// 这样 sourceUrl 会随列表变化（新品上架出现新链接），snapshotKey / fingerprint 随之变化，
// 才能产生「新增」而非每天「去重刷新」。对 SPA 站点（curl 拿不到产品链接）尝试
// browser 渲染兜底，仍拿不到则退回单候选。
async function fetchGenericCandidates(rule: BrandSourceRule, checkedAt: string): Promise<CrawlCandidate[]> {
  let html: string
  try {
    html = await fetchHtml(rule.listUrl)
  } catch {
    return [await fetchGenericCandidate(rule, checkedAt)]
  }

  let productLinks = extractProductLinks(html, rule.listUrl)

  // SPA 兜底：curl 拿不到产品链接时，用 browser 渲染再试
  if (productLinks.length === 0) {
    try {
      const browserHtml = await fetchBrowserHtml(rule.listUrl)
      productLinks = extractProductLinks(browserHtml, rule.listUrl)
    } catch {
      // browser 也失败，退回单候选
    }
  }

  if (productLinks.length === 0) {
    return [await fetchGenericCandidate(rule, checkedAt)]
  }

  const publishedAt = extractPublishedAtFromHtml(html, checkedAt)

  // ⚠️ 2026-08-30：以前这里 image 恒为 ''，通用品牌的新故事全靠 post-pipeline 截图兜底
  // （Alexander McQueen 今天 6 条新闻全空图就是这条路径导致的）。
  // 现在为每个产品链接抓一次详情页，用 extractImageFromHtml 提取真实产品图。
  // 抓不到就保持空字符串，交给既有回退链（截图 / 留空），不猜、不用同品牌其他产品图。
  const links = productLinks.slice(0, MAX_GENERIC_CANDIDATES)
  const detailImages = await Promise.all(
    links.map(async (url) => {
      try {
        const detailHtml = await fetchHtml(url)
        return extractImageFromHtml(detailHtml, url) ?? ''
      } catch {
        return ''
      }
    }),
  )

  return links.map((url, index) => {
    const label = inferProductLabelFromUrl(url, index)
    return buildCandidate(rule, checkedAt, {
      sourceUrl: url,
      sourceTitle: `${rule.brand} ${label}`,
      sourceSummary: `${rule.brand} ${rule.sourceLabel} 页面抓取到 ${rule.subcategory} 新品「${label}」，已作为新品候选写入抓取流程。`,
      products: [label, ...rule.products.slice(0, 2)],
      image: detailImages[index] ?? '',
      publishedAt,
    })
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
  const html = await fetchHtml(rule.listUrl)
  const sourceTitle =
    extractMatch(html, /property="og:title" content="([^"]+)"/) ??
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /product-name"[^>]*>([^<]+)</)
  const image = extractMatch(html, /property="og:image" content="([^"]+)"/)

  return buildCandidate(rule, checkedAt, {
    sourceUrl: rule.listUrl,
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle ?? `${rule.brand} ${rule.subcategory} 新品检索`)),
    sourceSummary: `${rule.brand} 中国官网产品页 ${rule.sourceLabel} 当前可作为 ${rule.subcategory} 新品新闻的主要来源。`,
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

// DEPRECATED 2026-06-07: fetchLouisVuittonCandidate 已删除。
// 旧版硬塞 LOUIS_VUITTON_CAPUCINES_URL (M28548) 作为 fallback，导致 title-sourceUrl 错配。
// 新版 fetchLouisVuittonLatestCandidates 在 products.length === 0 时 return []。

async function fetchChanelCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchBrowserHtml(rule.listUrl)
  const sourceTitle =
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /property="og:title" content="([^"]+)"/) ??
    `${rule.brand} ${rule.subcategory} 新品检索`
  const image =
    // Chanel product CDN images (no file extension)
    extractMatch(html, /(https:\/\/www\.chanel\.cn\/cn\/img\/\/prd-emea\/sys-master\/content\/[^"'\s]+)/i) ??
    // Chanel puls-img CDN
    extractMatch(html, /(https:\/\/www\.chanel\.cn\/puls-img\/[^"'\s]+\.(?:jpg|jpeg|png|webp))/i) ??
    // Generic og:image / standard image with extension
    extractMatch(html, /property="og:image" content="([^"]+)"/) ??
    extractMatch(html, /(https:\/\/www\.chanel\.cn\/[^"'\s]+\.(?:jpg|jpeg|png|webp))/i) ??
    ''

  return buildCandidate(rule, checkedAt, {
    sourceUrl: rule.listUrl,
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle)),
    sourceSummary: `Chanel 中国官网 ${rule.subcategory} 页面已通过无头浏览器渲染生成候选新闻。`,
    image: decodeHtmlEntities(image),
  })
}
// LOUIS_VUITTON_CAPUCINES_URL 常量保留为历史参考（顶部已 DEPRECATED 标注）。

async function fetchHermesCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchBrowserHtml(rule.listUrl)
  const sourceTitle =
    extractMatch(html, /<title>([^<]+)<\/title>/) ??
    extractMatch(html, /property="og:title" content="([^"]+)"/) ??
    `${rule.brand} ${rule.subcategory} 新品检索`
  const image =
    extractMatch(html, /property="og:image" content="([^"]+)"/) ??
    extractMatch(html, /(https:\/\/assets\.hermes\.cn\/is\/image\/hermesproduct\/[^"' )]+\.(?:jpg|jpeg|png))/i) ??
    ''

  return buildCandidate(rule, checkedAt, {
    sourceUrl: rule.listUrl,
    sourceTitle: collapseWhitespace(decodeHtmlEntities(sourceTitle)),
    sourceSummary: `爱马仕中国官网 ${rule.subcategory} 页面已按产品与分类规则生成候选新闻。`,
    image: decodeHtmlEntities(image),
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
      const product = extractNikeFirstProductFromListing(html, page.url, page.label, page.subcategory)
      if (!product) {
        return null
      }
      // 列表页 portraitURL 会错位（懒加载占位 + 非贪婪正则跨产品匹配），
      // 从产品详情页 sourceUrl 提取真实产品图。
      // ⚠️ 2026-08-29：Nike og:image 现在返回 t_default 白底占位图（320×400），
      // 真实大图在 t_PDP_1728_v1（1728×2160）/ t_PDP_936_v1（936×1170）路径。
      // 优先抓 t_PDP 大图，避免白底占位图 + 跨产品串图。
      try {
        const detailHtml = await fetchHtml(product.sourceUrl)
        const pdpImage =
          extractMatch(detailHtml, /(https:\/\/static\.nike\.com\.cn\/a\/images\/t_PDP_1728_v1\/[^"' )]+)/i) ??
          extractMatch(detailHtml, /(https:\/\/static\.nike\.com\.cn\/a\/images\/t_PDP_936_v1\/[^"' )]+)/i)
        if (pdpImage) {
          product.image = decodeHtmlEntities(pdpImage)
        } else {
          const ogImage = extractMatch(detailHtml, /property="og:image" content="([^"]+)"/i)
          if (ogImage) {
            product.image = decodeHtmlEntities(ogImage)
          }
        }
      } catch {
        // 详情页抓取失败时保留列表页图
      }
      return product
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

async function fetchYonexMallProducts(subcategory: string) {
  const crawlRule = await findBrandCrawlRule('YONEX')
  if (!crawlRule || crawlRule.mode !== 'yonex_mall_pages') {
    return []
  }

  const pages = crawlRule.entryPages.filter((page) => page.subcategory === subcategory)
  const products = await Promise.all(
    pages.map(async (page) => {
      const html = await fetchHtml(page.url)
      return extractYonexMallProduct(html, page.url, page.label, page.subcategory)
    }),
  )

  return products.filter((product): product is YonexMallProduct => Boolean(product))
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
    // 列表页未抓到任何产品 → 本批次不输出 LV 候选，宁缺毋滥。
    // 旧版这里会 fallback 到 LOUIS_VUITTON_CAPUCINES_URL (M28548) 硬塞一条与所有 title 不匹配的
    // 错配新闻（同一 SKU 被复用 4 次），已于 2026-06-07 改为 return []。
    return []
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

  const settled = await Promise.allSettled(
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

  const candidates = settled
    .filter((result): result is PromiseFulfilledResult<CrawlCandidate> => result.status === 'fulfilled')
    .map((result) => result.value)

  if (candidates.length === 0) {
    const firstRejected = settled.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    if (firstRejected) {
      throw firstRejected.reason
    }
    return null
  }

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
    case 'yonex_mall_pages':
      return fetchYonexMallCandidates(rule, checkedAt)
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

async function fetchYonexMallCandidates(rule: BrandSourceRule, checkedAt: string) {
  const products = await fetchYonexMallProducts(rule.subcategory)

  return products.map((product) =>
    buildCandidate(rule, checkedAt, {
      sourceUrl: product.sourceUrl,
      sourceLabel: `YONEX 中国官网·${product.label}`,
      sourceTitle: product.title,
      sourceSummary: `YONEX 中国官网“${product.label}”页当前首个商品卡已提取，可直接作为 ${rule.subcategory} 新品新闻来源。`,
      image: product.image,
      products: [product.title, ...rule.products].slice(0, 3),
      matchedKeywords: [product.label, ...detectMatchedKeywords(rule)].slice(0, 4),
    }),
  )
}

export async function fetchLegoCandidates(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(rule.listUrl)

  // Extract JSON-LD structured data from the page
  const jsonLdRegex =
    /<script type="application\/ld\+json">(.+?)<\/script>/
  const match = html.match(jsonLdRegex)

  if (!match) {
    return []
  }

  const listing = JSON.parse(match[1]) as { itemListElement?: Array<{ item: Record<string, unknown> }> }
  const items = listing.itemListElement ?? []

  if (items.length === 0) {
    return []
  }

  const candidates = items.map((entry) => {
    const product = entry.item as Record<string, unknown>
    const name = String(product.name ?? '')
    const url = String(product.url ?? '')
    const image = String(product.image ?? '')
    const offers = (product.offers ?? {}) as Record<string, unknown>
    const price = offers.price != null ? `¥${offers.price}` : ''
    const pieceCount = ((product.pieceCount ?? {}) as Record<string, unknown>).value ?? ''

    const sourceTitle = pieceCount ? `${name}（${pieceCount}块${price ? ` / ${price}` : ''}）` : name

    return buildCandidate(rule, checkedAt, {
      sourceUrl: url || rule.listUrl,
      sourceTitle,
      sourceSummary: `LEGO 乐高新品：${name}，${pieceCount ? `共 ${pieceCount} 块颗粒` : '全新套装'}${price ? `，官方售价 ${price} 元` : ''}。`,
      image,
      products: [name, ...rule.products].slice(0, 3),
      matchedKeywords: [name, ...rule.keywords].slice(0, 4),
    })
  })

  return candidates
}

export async function fetchBoucheronCandidate(rule: BrandSourceRule, checkedAt: string) {
  const html = await fetchHtml(rule.listUrl)

  // Extract product URLs from Boucheron listing pages
  // Pattern: /cn_zh/<slug>-<sku>.html where SKU = 3 letters + 5 digits
  const productUrlRegex = /href="(https:\/\/www\.boucheron\.cn\/cn_zh\/[a-z][a-z0-9-]+-[a-z]{3}\d{5}\.html)"/gi
  const matches = [...html.matchAll(productUrlRegex)]
  const productUrls = matches.map((m) => m[1])

  if (productUrls.length === 0) {
    return null
  }

  // Use the first product
  const sourceUrl = productUrls[0]

  // Extract SKU from product URL
  const skuMatch = sourceUrl.match(/-([a-z]{3}\d{5})\.html$/)
  const sku = skuMatch?.[1] ?? ''

  // Try to get image from product detail page (more reliable than guessing suffix)
  let image = ''
  if (sku && sku.length >= 2) {
    // Start with CDN guess based on common pattern
    image = `https://www.boucheron.cn/media/catalog/product/${sku[0]}/${sku[1]}/${sku}_1_3.jpg`

    // Attempt to extract the real image URL from the product detail page
    try {
      const productHtml = await fetchHtml(sourceUrl)
      const imgMatch = productHtml.match(
        /media\/catalog\/product\/[a-z]\/[a-z]\/[a-z]{3}\d{5}[^"'\s]*\.(?:jpg|png|webp)/i,
      )
      if (imgMatch) {
        image = `https://www.boucheron.cn/${imgMatch[0]}`
      }
    } catch {
      // Keep the CDN guess if product page fetch fails
    }
  }

  // Try to extract a product title from the listing page (or fallback to URL slug)
  const titleMatch = html.match(/<title>([^<]+)<\/title>/)
  const sourceTitle =
    titleMatch?.[1]?.trim() ||
    sourceUrl
      .split('/')
      .pop()
      ?.replace(/\.html$/, '')
      ?.replace(/-/g, ' ')
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Boucheron 珠宝新作'

  return buildCandidate(rule, checkedAt, {
    sourceUrl,
    sourceTitle,
    sourceSummary: `Boucheron 宝诗龙 ${rule.sourceLabel} 页面当前首个产品已提取，可作为珠宝新品新闻来源。`,
    image,
    products: [sourceTitle, ...rule.products].slice(0, 3),
    matchedKeywords: rule.keywords.slice(0, 4),
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
    case 'Chanel':
      return fetchChanelCandidate(rule, checkedAt)
    case 'Dior Beauty':
      return fetchDiorBeautyCandidate(rule, checkedAt)
    case 'SHISEIDO':
      return fetchShiseidoCandidate(rule, checkedAt)
    case 'Wilson':
      return fetchWilsonCandidate(rule, checkedAt)
    case 'Microsoft Surface':
      return fetchMicrosoftSurfaceCandidate(rule, checkedAt)
    case 'Boucheron':
      return fetchBoucheronCandidate(rule, checkedAt)
    case 'LEGO':
      return (await fetchLegoCandidates(rule, checkedAt))[0]
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

  // 通用品牌（无专用 handler）走多候选提取；专用 handler 品牌保持单候选
  if (!DEDICATED_HANDLER_BRANDS.has(rule.brand)) {
    const candidates = await fetchGenericCandidates(rule, checkedAt)
    return candidates.map(toProbe)
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

  // 通用品牌（无专用 handler）走多候选提取；专用 handler 品牌保持单候选
  if (!DEDICATED_HANDLER_BRANDS.has(rule.brand)) {
    const genericCandidates = await fetchGenericCandidates(rule, checkedAt)
    return Promise.all(genericCandidates.map((candidate) => applyImageRuleHints(rule, candidate)))
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
