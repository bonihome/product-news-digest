import path from 'node:path'
import { access, readFile } from 'node:fs/promises'

import type { BrandImageRule, CrawlCandidate, ImageRuleStory, StoredStory } from './types'

const imageRulesDir = path.resolve(process.cwd(), 'data/image-rules')

let rulesCache: BrandImageRule[] | null = null

function normalizeValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function productOverlapScore(story: StoredStory, ruleStory: ImageRuleStory) {
  const storyProducts = story.products.map(normalizeValue)
  const ruleProducts = ruleStory.products.map(normalizeValue)
  return ruleProducts.reduce((score, product) => score + (storyProducts.includes(product) ? 1 : 0), 0)
}

function genericProductOverlapScore(products: string[], ruleStory: ImageRuleStory) {
  const normalizedProducts = products.map(normalizeValue)
  const ruleProducts = ruleStory.products.map(normalizeValue)
  return ruleProducts.reduce((score, product) => score + (normalizedProducts.includes(product) ? 1 : 0), 0)
}

async function readRuleFile(filePath: string) {
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content) as BrandImageRule
}

export async function loadImageRules() {
  if (rulesCache) {
    return rulesCache
  }

  const indexPath = path.join(imageRulesDir, 'index.json')
  const indexContent = await readFile(indexPath, 'utf8')
  const index = JSON.parse(indexContent) as { brands: Array<{ file: string }> }
  const rules = await Promise.all(
    index.brands.map((entry) => readRuleFile(path.resolve(process.cwd(), entry.file))),
  )
  rulesCache = rules
  return rules
}

export async function hasLocalMirror(localMirrorPath: string) {
  const relativePath = localMirrorPath.replace(/^\//, '')
  const absolutePath = path.resolve(process.cwd(), 'public', relativePath)

  try {
    await access(absolutePath)
    return true
  } catch {
    return false
  }
}

/**
 * 查找某条故事对应的 image-rule。
 *
 * ⚠️ 2026-08-30：新增 `exactOnly` 选项。默认的「category+subcategory 模糊匹配」会把
 * 同品牌内**不同产品**的规则套到当前故事上，导致跨产品串图。实测事故：
 * `nike-ja-4-ep-nightmare`（篮球）模糊匹配到 `nike-gt-cut-4-ep` 规则，
 * 规则里的 `candidateImageUrl`（G.T. CUT 4 LX EP 的 t_default 图）在 imageStore.ts
 * 里优先级高于故事自己抓到的 t_PDP 正确图 → 正确图被错误图覆盖。
 *
 * 因此凡是「决定下载/复用哪张图」的调用方（imageStore）必须传 exactOnly: true，
 * 只认 storyId / sourcePage 精确匹配。模糊匹配仅供体检类只读逻辑参考。
 */
export async function findImageRuleForStory(
  story: StoredStory,
  options: { exactOnly?: boolean } = {},
) {
  const rules = await loadImageRules()
  const brandRule = rules.find((rule) => rule.brand === story.brand)
  if (!brandRule) {
    return null
  }

  const exactStoryId = brandRule.stories.find((ruleStory) => ruleStory.storyId === story.id)
  if (exactStoryId) {
    return exactStoryId
  }

  const exactSourcePage = brandRule.stories.find((ruleStory) => ruleStory.sourcePage === story.sourceUrl)
  if (exactSourcePage) {
    return exactSourcePage
  }

  // 只认精确匹配的调用方（imageStore 下载/复用决策）到此为止，
  // 绝不用同品牌其他产品的规则兜底（跨产品串图根因）。
  if (options.exactOnly) {
    return null
  }

  const candidates = brandRule.stories.filter(
    (ruleStory) => ruleStory.category === story.category && ruleStory.subcategory === story.subcategory,
  )

  if (candidates.length === 0) {
    return null
  }

  return candidates
    .map((candidate) => ({ candidate, score: productOverlapScore(story, candidate) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate ?? null
}

export async function findBrandImageRule(brand: string) {
  const rules = await loadImageRules()
  return rules.find((rule) => rule.brand === brand) ?? null
}

export async function findBrandCrawlRule(brand: string) {
  const brandRule = await findBrandImageRule(brand)
  return brandRule?.crawl ?? null
}

export async function findImageRuleForCandidate(
  candidate: Pick<CrawlCandidate, 'brand' | 'category' | 'subcategory' | 'sourceUrl' | 'products'>,
) {
  const brandRule = await findBrandImageRule(candidate.brand)
  if (!brandRule) {
    return null
  }

  const exactSourcePage = brandRule.stories.find((ruleStory) => ruleStory.sourcePage === candidate.sourceUrl)
  if (exactSourcePage) {
    return exactSourcePage
  }

  const candidates = brandRule.stories.filter(
    (ruleStory) =>
      ruleStory.category === candidate.category && ruleStory.subcategory === candidate.subcategory,
  )

  if (candidates.length === 0) {
    return null
  }

  return candidates
    .map((ruleStory) => ({ ruleStory, score: genericProductOverlapScore(candidate.products, ruleStory) }))
    .sort((a, b) => b.score - a.score)[0]?.ruleStory ?? null
}
