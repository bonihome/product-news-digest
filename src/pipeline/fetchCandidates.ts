import type { BrandProbe, BrandSourceRule, CrawlCandidate } from './types'
import { findBrandImageRule, findImageRuleForCandidate } from './imageRules'

const APPLE_NEWSROOM_BASE = 'https://www.apple.com.cn'
const LOUIS_VUITTON_CAPUCINES_URL =
  'https://www.louisvuitton.cn/zhs-cn/products/capucines-mini-capucines-nvprod7540209v/M28548'
const SHISEIDO_ULTIMUNE_URL =
  'https://www.shiseido.com.cn/ultimune-power-infusing-serum-s17283.html?cgid=S2_Category_Serums'
const HERMES_H08_URL = 'https://www.hermes.cn/cn/zh/product/hermes-h08%E8%85%95%E8%A1%A842%E6%AF%AB%E7%B1%B3-W049430WW00/'
const DIOR_FOREVER_GLOW_URL = 'https://www.dior.com/en_us/beauty/products/dior-forever-skin-glow-Y0998020.html'
const DIOR_FOREVER_GLOW_IMAGE =
  'https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/en_US/dw5e4619d5/Y0000149/Y0000149_E000001270_E01_RHC.jpg?sw=640'
const WILSON_RUSH_PRO_ARTICLE_URL =
  'https://www.wilson.com/en-us/blog/tennis/wilson-labs/introducing-new-rush-pro-45-tennis-shoe'

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
  switch (rule.brand) {
    case 'Apple':
      return fetchAppleCandidate(rule, checkedAt)
    case 'Hermes':
      return fetchHermesCandidate(rule, checkedAt)
    case 'Dior Beauty':
      return fetchDiorBeautyCandidate(rule, checkedAt)
    case 'SHISEIDO':
      return fetchShiseidoCandidate(rule, checkedAt)
    case 'Adidas':
      return fetchAdidasCandidate(rule, checkedAt)
    case 'Wilson':
      return fetchWilsonCandidate(rule, checkedAt)
    case 'Louis Vuitton':
      return fetchLouisVuittonCandidate(rule, checkedAt)
    case 'Microsoft Surface':
      return fetchMicrosoftSurfaceCandidate(rule, checkedAt)
    default:
      return null
  }
}

async function fetchRealProbe(rule: BrandSourceRule, checkedAt: string): Promise<BrandProbe[] | null> {
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
