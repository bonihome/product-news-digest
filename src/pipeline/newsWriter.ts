import { AiTaskOrchestrator, loadAiTaskRoutes } from './ai/index.ts'
import type {
  BrandSourceRule,
  CrawlCandidate,
  NewsToneVersion,
  StoredStory,
  StoryGenerationResult,
} from './types'

type NewsFactSheet = {
  cleanSourceTitle: string
  leadProduct: string
  supportProducts: string[]
  categoryLabel: string
  launchVerb: '推出' | '发布'
}

const SOURCE_TITLE_SUFFIXES = [
  /\s*\|\s*Apple\s*\(中国大陆\)\s*$/i,
  /\s*\|\s*SHISEIDO\s*$/i,
  /\s*\|\s*adidas\s*阿迪达斯官方旗舰店\s*$/i,
  /\s*\|\s*路易威登LOUIS VUITTON官方线上旗舰店\s*$/i,
]

let aiOrchestrator: AiTaskOrchestrator | null = null

function getAiOrchestrator() {
  if (!aiOrchestrator) {
    aiOrchestrator = new AiTaskOrchestrator(loadAiTaskRoutes())
  }

  return aiOrchestrator
}

function createStoryId(candidate: CrawlCandidate) {
  return `${candidate.brand}-${candidate.products[0] ?? candidate.subcategory}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function cleanSourceTitle(sourceTitle: string) {
  return SOURCE_TITLE_SUFFIXES.reduce((title, pattern) => title.replace(pattern, '').trim(), sourceTitle).trim()
}

function removeLeadingBrand(sourceTitle: string, brand: string) {
  const normalized = sourceTitle.trim()
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return normalized
    .replace(new RegExp(`^${escapedBrand}\\s*`), '')
    .replace(/^[：:、，,\-–—\s]+/, '')
    .trim()
}

function normalizeProductName(value: string) {
  return value
    .replace(/^[「『]/, '')
    .replace(/[」』]$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function dedupeItems(items: string[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function resolveLaunchVerb(candidate: CrawlCandidate): NewsFactSheet['launchVerb'] {
  return candidate.category === 'sports' ? '发布' : '推出'
}

function getCategoryLabel(candidate: CrawlCandidate) {
  switch (candidate.category) {
    case 'luxury':
      return `${candidate.subcategory}系列`
    case 'beauty':
      return `${candidate.subcategory}线`
    case 'sports':
      return `${candidate.subcategory}装备线`
    case 'digital':
      return `${candidate.subcategory}产品线`
  }
}

function extractFactSheet(candidate: CrawlCandidate): NewsFactSheet {
  const cleanedTitle = cleanSourceTitle(candidate.sourceTitle)
  const strippedTitle = removeLeadingBrand(cleanedTitle, candidate.brand)
  const normalizedProducts = dedupeItems(candidate.products.map(normalizeProductName))
  const titleFragments = strippedTitle
    .split(/[|｜]/)
    .map((item) => item.trim())
    .filter(Boolean)
  const titleLead = normalizeProductName(titleFragments[0] ?? strippedTitle)
  const leadProduct =
    normalizedProducts.find((product) => titleLead.toLowerCase().includes(product.toLowerCase())) ??
    normalizedProducts[0] ??
    (titleLead || `${candidate.subcategory}新品`)

  const supportProducts = normalizedProducts.filter((product) => product !== leadProduct).slice(0, 2)

  return {
    cleanSourceTitle: cleanedTitle,
    leadProduct,
    supportProducts,
    categoryLabel: getCategoryLabel(candidate),
    launchVerb: resolveLaunchVerb(candidate),
  }
}

function joinProducts(items: string[]) {
  if (items.length === 0) {
    return ''
  }
  if (items.length === 1) {
    return items[0]
  }
  if (items.length === 2) {
    return `${items[0]}和${items[1]}`
  }
  return `${items.slice(0, -1).join('、')}和${items.at(-1)}`
}

function buildRuleTitle(candidate: CrawlCandidate, facts: NewsFactSheet) {
  switch (candidate.category) {
    case 'luxury':
      return `${candidate.brand} ${facts.launchVerb} ${facts.leadProduct}，${candidate.subcategory}新品继续扩容`
    case 'beauty':
      return `${candidate.brand} ${facts.launchVerb} ${facts.leadProduct}，${candidate.subcategory}新品阵容再添重点单品`
    case 'sports':
      return `${candidate.brand} ${facts.launchVerb} ${facts.leadProduct}，${candidate.subcategory}装备继续更新`
    case 'digital':
      return `${candidate.brand} ${facts.launchVerb} ${facts.leadProduct}，${candidate.subcategory}产品阵容继续扩展`
  }
}

function buildRuleSummary(candidate: CrawlCandidate, facts: NewsFactSheet) {
  const supportProducts = joinProducts(facts.supportProducts)

  switch (candidate.category) {
    case 'luxury':
      return supportProducts
        ? `${candidate.brand} 本轮围绕 ${facts.leadProduct} 展开${candidate.subcategory}更新，并以 ${supportProducts} 进一步丰富当季${facts.categoryLabel}。`
        : `${candidate.brand} 本轮围绕 ${facts.leadProduct} 展开${candidate.subcategory}更新，继续补强当季${facts.categoryLabel}。`
    case 'beauty':
      return supportProducts
        ? `${candidate.brand} 这次以 ${facts.leadProduct} 为主打，并联动 ${supportProducts} 继续完善${candidate.subcategory}新品组合。`
        : `${candidate.brand} 这次以 ${facts.leadProduct} 为主打，继续完善${candidate.subcategory}新品组合。`
    case 'sports':
      return supportProducts
        ? `${candidate.brand} 将 ${facts.leadProduct} 作为本轮更新焦点，并与 ${supportProducts} 一起扩展${candidate.subcategory}装备选择。`
        : `${candidate.brand} 将 ${facts.leadProduct} 作为本轮更新焦点，继续扩展${candidate.subcategory}装备选择。`
    case 'digital':
      return supportProducts
        ? `${candidate.brand} 本轮以 ${facts.leadProduct} 为核心推进新品发布，并借由 ${supportProducts} 进一步补全${candidate.subcategory}产品布局。`
        : `${candidate.brand} 本轮以 ${facts.leadProduct} 为核心推进新品发布，继续补全${candidate.subcategory}产品布局。`
  }
}

function buildStoredStory(
  rule: BrandSourceRule,
  candidate: CrawlCandidate,
  fingerprint: string,
  title: string,
  summary: string,
  toneVersion: NewsToneVersion,
): StoredStory {
  return {
    id: createStoryId(candidate),
    brand: candidate.brand,
    category: candidate.category,
    subcategory: candidate.subcategory,
    title,
    publishedAt: candidate.publishedAt,
    checkedAt: candidate.checkedAt,
    sourceType: candidate.sourceType,
    sourceLabel: candidate.sourceLabel,
    sourceUrl: candidate.sourceUrl,
    image: candidate.image,
    summary,
    products: candidate.products,
    fingerprint,
    toneVersion,
    imageSource: rule.imageStrategy,
    sourceTitle: candidate.sourceTitle,
    matchedKeywords: candidate.matchedKeywords,
  }
}

export function rewriteCandidateAsStoryWithRules(
  rule: BrandSourceRule,
  candidate: CrawlCandidate,
  fingerprint: string,
): StoredStory {
  const facts = extractFactSheet(candidate)

  return buildStoredStory(
    rule,
    candidate,
    fingerprint,
    buildRuleTitle(candidate, facts),
    buildRuleSummary(candidate, facts),
    'v2',
  )
}

export async function generateStoryFromCandidate(
  rule: BrandSourceRule,
  candidate: CrawlCandidate,
  fingerprint: string,
): Promise<StoryGenerationResult> {
  const fallbackStory = rewriteCandidateAsStoryWithRules(rule, candidate, fingerprint)

  try {
    const aiResult = await getAiOrchestrator().runAll(rule, candidate)
    const judgement = aiResult.judge.response.parsed

    if (!judgement.shouldPublish) {
      return {
        shouldPublish: false,
        story: null,
        reason: judgement.reason || '模型判断当前候选不属于应发布的新品新闻。',
        generationMode: 'ai',
      }
    }

    const writeResult = aiResult.write.response.parsed
    if (!writeResult.title || !writeResult.summary) {
      return {
        shouldPublish: true,
        story: fallbackStory,
        reason: '模型写稿结果不完整，已回退到规则稿。',
        generationMode: 'rules',
      }
    }

    return {
      shouldPublish: true,
      story: buildStoredStory(rule, candidate, fingerprint, writeResult.title, writeResult.summary, 'v3'),
      reason: '模型生成成功。',
      generationMode: 'ai',
    }
  } catch (error) {
    return {
      shouldPublish: true,
      story: fallbackStory,
      reason: error instanceof Error ? error.message : '模型调用失败，已回退到规则稿。',
      generationMode: 'rules',
    }
  }
}
