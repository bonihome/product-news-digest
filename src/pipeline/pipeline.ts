import { sendPipelineAlertsEmail } from './alertsMailer'
import { getEnabledBrandSources } from './brandSources'
import { createBrandSnapshot, createFingerprint, isDuplicateStory } from './dedupe'
import { fetchCandidatesForBrand, probeBrandSource } from './fetchCandidates'
import { localizeStoryImages } from './imageStore'
import { generateStoryFromCandidate } from './newsWriter'
import { publishRuntimeFeed } from './publisher'
import {
  appendCrawlRun,
  appendPipelineAlerts,
  readBrandSnapshots,
  readStoredStories,
  writeBrandSnapshots,
  writeStoredStories,
} from './runtimeStore'
import type {
  BrandSnapshotRecord,
  BrandSourceRule,
  CrawlRun,
  CrawlRunItem,
  PipelineAlert,
  StoredStory,
} from './types'

export type PipelineOptions = {
  dryRun?: boolean
  mode?: 'scheduled' | 'manual'
}

export type PipelineNotificationResult =
  | { status: 'sent'; messageId: string; recipientCount: number }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string }

type BrandRunResult = {
  item: CrawlRunItem
  didStoryChange: boolean
  snapshot: BrandSnapshotRecord | null
  storiesToUpsert: StoredStory[]
  alerts: PipelineAlert[]
}

function normalizeStoredStories(stories: StoredStory[]) {
  const byId = new Map<string, StoredStory>()

  for (const story of stories) {
    byId.set(story.id, story)
  }

  return Array.from(byId.values()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function cloneStoredStories(stories: StoredStory[]) {
  return stories.map((story) => ({ ...story, products: [...story.products], matchedKeywords: [...story.matchedKeywords] }))
}

function getBrandConcurrency() {
  const raw = Number(process.env.PIPELINE_BRAND_CONCURRENCY ?? '2')
  return Number.isFinite(raw) && raw > 0 ? raw : 2
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  mapper: (item: TInput, index: number) => Promise<TOutput>,
) {
  const results = new Array<TOutput>(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex
      nextIndex += 1
      results[current] = await mapper(items[current], current)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

async function runBrandSource(
  rule: BrandSourceRule,
  existingStories: StoredStory[],
  existingSnapshots: BrandSnapshotRecord[],
  runId: string,
) {
  const checkedAt = new Date().toISOString()
  const alerts: PipelineAlert[] = []

  try {
    const probes = await probeBrandSource(rule)
    const nextSnapshot = createBrandSnapshot(
      probes.map((probe) => ({
        brand: probe.brand,
        category: probe.category,
        subcategory: probe.subcategory,
        sourceType: rule.sourceType,
        sourceLabel: rule.sourceLabel,
        sourceUrl: probe.sourceUrl,
        sourceTitle: probe.sourceTitle,
        sourceSummary: '',
        products: probe.products,
        image: '',
        checkedAt: checkedAt.slice(0, 10),
        publishedAt: probe.publishedAt,
        matchedKeywords: probe.matchedKeywords,
      })),
      rule.brand,
      checkedAt,
    )

    const existingSnapshot = existingSnapshots.find((snapshot) => snapshot.brand === rule.brand)
    if (existingSnapshot?.snapshotKey === nextSnapshot.snapshotKey) {
      return {
        item: {
          brand: rule.brand,
          status: 'skipped',
          checkedAt,
          addedCount: 0,
          message: '品牌快照未变化，已跳过模型生成与图片处理。',
        },
        didStoryChange: false,
        snapshot: nextSnapshot,
        storiesToUpsert: [],
        alerts,
      } satisfies BrandRunResult
    }

    const candidates = await fetchCandidatesForBrand(rule, probes)
    const storiesToUpsert: StoredStory[] = []
    let addedCount = 0
    let refreshedCount = 0

    for (const candidate of candidates) {
      const fingerprint = createFingerprint(candidate)
      const generation = await generateStoryFromCandidate(rule, candidate, fingerprint)
      if (!generation.shouldPublish || !generation.story) {
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'warning',
          brand: rule.brand,
          message: `候选被 judge 拦截：${generation.reason}`,
        })
        continue
      }

      if (generation.generationMode === 'rules') {
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'warning',
          brand: rule.brand,
          message: `模型生成失败，已回退规则稿：${generation.reason}`,
        })
      }

      const story = generation.story
      const existingStory = existingStories.find((item) => item.fingerprint === fingerprint || item.id === story.id)

      if (existingStory) {
        refreshedCount += 1
      } else if (!isDuplicateStory(existingStories, fingerprint)) {
        addedCount += 1
      }

      storiesToUpsert.push(story)
    }

    return {
      item: {
        brand: rule.brand,
        status: addedCount > 0 || refreshedCount > 0 ? 'success' : 'skipped',
        checkedAt,
        addedCount,
        message:
          addedCount > 0
            ? '发现新品候选，已写入运行时数据。'
            : refreshedCount > 0
              ? '候选新闻已按最新抓取结果刷新。'
              : '品牌快照有变化，但候选内容已被去重规则拦截。',
      },
      didStoryChange: addedCount > 0 || refreshedCount > 0,
      snapshot: nextSnapshot,
      storiesToUpsert,
      alerts,
    } satisfies BrandRunResult
  } catch (error) {
    alerts.push({
      runId,
      createdAt: checkedAt,
      level: 'error',
      brand: rule.brand,
      message: error instanceof Error ? error.message : '未知错误',
    })
    return {
      item: {
        brand: rule.brand,
        status: 'failed',
        checkedAt,
        addedCount: 0,
        message: error instanceof Error ? error.message : '未知错误',
      },
      didStoryChange: false,
      snapshot: null,
      storiesToUpsert: [],
      alerts,
    } satisfies BrandRunResult
  }
}

export async function runPipeline(options: PipelineOptions = {}) {
  const startedAt = new Date().toISOString()
  const runId = `run-${startedAt.replaceAll(':', '-').replaceAll('.', '-')}`
  const dryRun = Boolean(options.dryRun)
  const existingStories = await readStoredStories()
  const existingSnapshots = await readBrandSnapshots()
  const rules = getEnabledBrandSources()
  const results = await mapWithConcurrency(rules, getBrandConcurrency(), (rule) =>
    runBrandSource(rule, existingStories, existingSnapshots, runId),
  )

  const items = results.map((result) => result.item)
  const alerts = results.flatMap((result) => result.alerts)
  const addedCount = items.reduce((total, item) => total + item.addedCount, 0)
  const hasStoryChanges = results.some((result) => result.didStoryChange)
  const hasSnapshotChanges = results.some((result) => result.snapshot !== null)

  if (!dryRun) {
    const shouldRefreshExistingImages = existingStories.some(
      (story) => !story.image.startsWith('/runtime/news-images/'),
    )

    if (hasStoryChanges || shouldRefreshExistingImages) {
      const nextStories = hasStoryChanges ? [...existingStories] : cloneStoredStories(existingStories)
      for (const result of results) {
        for (const story of result.storiesToUpsert) {
          const existingIndex = nextStories.findIndex(
            (item) => item.id === story.id || item.fingerprint === story.fingerprint,
          )
          if (existingIndex >= 0) {
            const existing = nextStories[existingIndex]
            // When refreshing an existing story, preserve the original publishedAt
            // if the new date looks like a pipeline fallback (within 2 days of now).
            // Real extracted dates from brand websites pass through unchanged.
            const newDate = story.publishedAt
            const oldDate = existing.publishedAt
            if (newDate !== oldDate) {
              const now = new Date()
              const twoDaysAgo = new Date(now)
              twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
              const newDt = new Date(newDate)
              const oldDt = new Date(oldDate)
              if (!isNaN(newDt.getTime()) && !isNaN(oldDt.getTime()) &&
                  newDt >= twoDaysAgo && newDt <= now &&
                  oldDt < twoDaysAgo) {
                story.publishedAt = oldDate
              }
            }
            nextStories[existingIndex] = story
          } else {
            nextStories.push(story)
          }
        }
      }

      const normalizedStories = normalizeStoredStories(nextStories)
      await localizeStoryImages(normalizedStories)
      await writeStoredStories(normalizedStories)
      await publishRuntimeFeed(normalizedStories)
    }

    if (hasSnapshotChanges) {
      const snapshotMap = new Map(existingSnapshots.map((snapshot) => [snapshot.brand, snapshot]))
      for (const result of results) {
        if (result.snapshot) {
          snapshotMap.set(result.snapshot.brand, result.snapshot)
        }
      }

      await writeBrandSnapshots(Array.from(snapshotMap.values()).sort((a, b) => a.brand.localeCompare(b.brand)))
    }

    await appendPipelineAlerts(alerts)
  }

  const run: CrawlRun = {
    id: runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: options.mode ?? 'manual',
    dryRun,
    addedCount,
    items,
  }

  await appendCrawlRun(run)

  let alertEmail: PipelineNotificationResult = {
    status: 'skipped',
    reason: dryRun ? 'dry run' : 'no alerts',
  }

  if (!dryRun) {
    try {
      alertEmail = await sendPipelineAlertsEmail(run, alerts)
    } catch (error) {
      const reason = error instanceof Error ? error.message : '邮件发送失败'
      alertEmail = { status: 'failed', reason }
      await appendPipelineAlerts([
        {
          runId,
          createdAt: new Date().toISOString(),
          level: 'error',
          brand: 'system',
          message: `告警邮件发送失败：${reason}`,
        },
      ])
    }
  }

  return {
    run,
    existingCount: existingStories.length,
    nextCount: existingStories.length + addedCount,
    alertEmail,
  }
}
