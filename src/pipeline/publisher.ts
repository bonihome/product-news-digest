import * as fs from 'node:fs'
import { writePublishedFeed } from './runtimeStore'
import type { StoredStory } from './types'

const REJECTION_LOG = '/var/log/product-news-digest/publisher-rejections.log'

function toPublishedStory(story: StoredStory) {
  return {
    id: story.id,
    category: story.category,
    subcategory: story.subcategory,
    brand: story.brand,
    title: story.title,
    publishedAt: story.publishedAt,
    checkedAt: story.checkedAt,
    sourceType: story.sourceType,
    sourceLabel: story.sourceLabel,
    sourceUrl: story.sourceUrl,
    image: story.image,
    summary: story.summary,
    products: story.products,
  }
}

/**
 * B 方案一致性校验（2026-06-07 引入）：
 * 防止 title 描述与 sourceUrl 指向撕裂（典型案例：title 写"方巾"，sourceUrl 指向包袋）。
 * 规则：title 里 ≥4 字符的英文/数字词必须出现在 sourceUrl 的 slug 里（不区分大小写）。
 * 常见停用词不参与（Louis / Vuitton /推出/新品/系列/手袋/包袋/丝巾/方巾/配件/...）
 * 不通过 → 写哨兵日志 + drop 整条新闻。
 */
const TITLE_STOP_WORDS = new Set([
  'louis', 'vuitton', '推出', '新品', '系列', '手袋', '包袋', '丝巾', '方巾',
  '配件', '继续', '扩展', '阵容', 'around', 'with', 'from', 'lv',
])

function extractSlugFromSourceUrl(sourceUrl: string | undefined | null): string {
  if (!sourceUrl) return ''
  const match = sourceUrl.match(/\/products\/([^/?#]+)/i)
  return match ? match[1] : ''
}

function extractTitleKeywords(title: string): string[] {
  // 提取 ≥4 字符的英文/数字 token（中文不参与校验）
  const tokens = title.match(/[A-Za-z][A-Za-z0-9-]{3,}/g) ?? []
  return tokens
    .map((t) => t.toLowerCase())
    .filter((t) => !TITLE_STOP_WORDS.has(t))
}

function checkTitleSourceConsistency(story: StoredStory): { ok: true } | { ok: false; reason: string } {
  const sourceUrl = story.sourceUrl
  const slug = extractSlugFromSourceUrl(sourceUrl)
  const keywords = extractTitleKeywords(story.title)

  // 没有 sourceUrl 的不入 published-feed（这些条目的 sourceUrl 字段缺失，无法验证）
  if (!sourceUrl) {
    return { ok: false, reason: 'sourceUrl missing' }
  }
  // 非产品页 URL（如品牌首页、活动聚合页）跳过校验
  if (!slug) {
    return { ok: true }
  }
  // 没有任何英文关键词（纯中文 title）→ 默认通过
  if (keywords.length === 0) {
    return { ok: true }
  }

  const slugLower = slug.toLowerCase()
  const matched = keywords.filter((k) => slugLower.includes(k))
  if (matched.length === 0) {
    return {
      ok: false,
      reason: `title keywords [${keywords.join(', ')}] do not match slug "${slug}"`,
    }
  }
  return { ok: true }
}

function logRejection(story: StoredStory, reason: string) {
  const line = `[${new Date().toISOString()}] REJECTED id=${story.id} brand=${story.brand} reason=${reason} title="${story.title.slice(0, 60)}" sourceUrl="${story.sourceUrl ?? ''}"\n`
  try {
    fs.appendFileSync(REJECTION_LOG, line)
  } catch (err) {
    // 不吞错：把 fs 错误暴露到 stderr，便于排查 silent log 失败
    // eslint-disable-next-line no-console
    console.error(
      `[publisher] logRejection fs.appendFileSync FAILED for id=${story.id}: ` + (err instanceof Error ? err.message : String(err))
    )
  }
  // eslint-disable-next-line no-console
  console.warn(`[publisher] rejected: ${line.trim()}`)
}

export async function publishRuntimeFeed(stories: StoredStory[]) {
  const sorted = [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  const accepted: StoredStory[] = []
  for (const story of sorted) {
    const check = checkTitleSourceConsistency(story)
    if (check.ok) {
      accepted.push(story)
    } else {
      logRejection(story, check.reason)
    }
  }

  await writePublishedFeed({
    generatedAt: new Date().toISOString(),
    source: 'runtime',
    stories: accepted.map(toPublishedStory),
  })
}
