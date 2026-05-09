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

export async function findImageRuleForStory(story: StoredStory) {
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
