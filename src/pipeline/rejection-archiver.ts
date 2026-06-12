import { appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { readStoredStories, writeStoredStories } from './runtimeStore'
import { monitorRejections, type RejectionEntry } from './rejection-monitor'

/**
 * rejection-archiver（2026-06-12 引入）
 *
 * 由 run-weekly-report.ts 在周一 09:15 CST 周报时同步调用（在邮件发送前）。
 *
 * 职责：
 * 1. 调 monitorRejections() 拿到 shouldArchiveIds
 * 2. 从 data/runtime/news-items.json 读取所有 stories
 * 3. 找到 id 在 shouldArchiveIds 里的 stories
 * 4. 把这些 stories 追加到 data/archives/news-items.archived.json
 *    每条加 archivedAt / firstRejectedAt / rejectionReason 字段
 * 5. 把剔除后的 stories 写回 news-items.json
 * 6. 追加归档日志到 /var/log/product-news-digest/news-items-archives.log
 *
 * 归档单向。不会自动 unarchive。
 *
 * 不返回 unresolved 列表给用户——那是 monitor 的职责。
 */

const ARCHIVE_DIR = path.resolve(process.cwd(), 'data/archives')
const ARCHIVE_FILE = path.join(ARCHIVE_DIR, 'news-items.archived.json')
const ARCHIVE_LOG = '/var/log/product-news-digest/news-items-archives.log'

export type ArchivedRecord = {
  id: string
  archivedAt: string
  firstRejectedAt: string
  lastRejectedAt: string
  hitCount: number
  rejectionReason: string
  originalStory: Record<string, unknown>
}

export type ArchiverResult = {
  ranAt: string
  archivedCount: number
  archivedIds: string[]
  skippedCount: number
  skippedIds: { id: string; reason: string }[]
}

async function readArchiveFile(): Promise<ArchivedRecord[]> {
  if (!existsSync(ARCHIVE_FILE)) {
    return []
  }
  const contents = await readFile(ARCHIVE_FILE, 'utf8')
  try {
    const parsed = JSON.parse(contents)
    if (Array.isArray(parsed)) return parsed as ArchivedRecord[]
    return []
  } catch {
    return []
  }
}

async function writeArchiveFile(records: ArchivedRecord[]) {
  if (!existsSync(ARCHIVE_DIR)) {
    mkdirSync(ARCHIVE_DIR, { recursive: true })
  }
  await writeFile(ARCHIVE_FILE, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
}

function logArchive(records: ArchivedRecord[]) {
  if (records.length === 0) return
  const lines = records
    .map(
      (r) =>
        `[${r.archivedAt}] ARCHIVED id=${r.id} brand=${r.originalStory.brand ?? '?'} firstRejectedAt=${r.firstRejectedAt} hitCount=${r.hitCount} reason="${r.rejectionReason.slice(0, 80)}"`,
    )
    .join('\n')
  try {
    appendFileSync(ARCHIVE_LOG, lines + '\n')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[archiver] log append FAILED: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function archiveOverdueRejections(today: Date = new Date()): Promise<ArchiverResult> {
  const monitor = await monitorRejections(today)
  const shouldArchiveIds = new Set(monitor.shouldArchiveIds)

  if (shouldArchiveIds.size === 0) {
    return {
      ranAt: monitor.checkedAt,
      archivedCount: 0,
      archivedIds: [],
      skippedCount: 0,
      skippedIds: [],
    }
  }

  const allStories = await readStoredStories()
  const existingArchive = await readArchiveFile()
  const archivedIdsInExisting = new Set(existingArchive.map((r) => r.id))

  const archived: ArchivedRecord[] = []
  const skipped: { id: string; reason: string }[] = []
  const storiesAfter: typeof allStories = []

  for (const story of allStories) {
    if (shouldArchiveIds.has(story.id)) {
      // 重复归档保护：已经在 archived 列表里的不再归档
      if (archivedIdsInExisting.has(story.id)) {
        skipped.push({ id: story.id, reason: '已在 archived 文件中，跳过' })
        continue
      }
      const matchedEntry = monitor.unresolved.find((u) => u.id === story.id)
      const record: ArchivedRecord = {
        id: story.id,
        archivedAt: monitor.checkedAt,
        firstRejectedAt: matchedEntry?.firstRejectedAt ?? monitor.checkedAt,
        lastRejectedAt: matchedEntry?.lastRejectedAt ?? monitor.checkedAt,
        hitCount: matchedEntry?.hitCount ?? 1,
        rejectionReason: matchedEntry?.reason ?? 'unknown',
        originalStory: { ...story },
      }
      archived.push(record)
    } else {
      storiesAfter.push(story)
    }
  }

  if (archived.length > 0) {
    const newArchive = [...existingArchive, ...archived]
    await writeArchiveFile(newArchive)
    await writeStoredStories(storiesAfter)
    logArchive(archived)
  }

  return {
    ranAt: monitor.checkedAt,
    archivedCount: archived.length,
    archivedIds: archived.map((r) => r.id),
    skippedCount: skipped.length,
    skippedIds: skipped,
  }
}

/**
 * 格式化本周归档列表为可读文本（用于周报邮件/微信）
 */
export function formatArchivedList(archived: ArchivedRecord[]): string {
  if (archived.length === 0) {
    return '本周无新归档。'
  }
  const lines: string[] = []
  lines.push(`本周归档 ${archived.length} 条：`)
  lines.push('')
  for (const r of archived) {
    lines.push(`- id=${r.id} brand=${(r.originalStory as { brand?: string }).brand ?? '?'}`)
    lines.push(`  首次 reject: ${r.firstRejectedAt} (age=${r.hitCount} hit)`)
    lines.push(`  归档时间: ${r.archivedAt}`)
    lines.push(`  原因: ${r.rejectionReason.slice(0, 100)}`)
  }
  return lines.join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void (async () => {
    const result = await archiveOverdueRejections()
    console.log(`运行时间: ${result.ranAt}`)
    console.log(`归档数: ${result.archivedCount}`)
    console.log(`跳过数: ${result.skippedCount}`)
    if (result.archivedIds.length > 0) {
      console.log('归档 ids:')
      for (const id of result.archivedIds) console.log(`  - ${id}`)
    }
    if (result.skippedIds.length > 0) {
      console.log('跳过 ids:')
      for (const s of result.skippedIds) console.log(`  - ${s.id}: ${s.reason}`)
    }
  })()
}
