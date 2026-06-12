import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * rejection-monitor（2026-06-12 引入）
 *
 * 每周一 09:15 CST 周报 cron 同入口调用。
 *
 * 职责：
 * 1. 读取 /var/log/product-news-digest/publisher-rejections.log
 *    每条 reject 的 first_rejected_at 取日志里该 id 最早的 ISO 时间戳
 * 2. 读取 data/rejections/publisher-rejections.resolved
 *    resolved 文件手工维护（Boni 决定怎么处理 reject 后编辑此文件）
 * 3. 输出 unresolved 列表（含每条 age_days）
 * 4. 标注哪些条目的 age ≥ 30 天（应被 archiver 归档）
 *
 * 纯读取、纯输出。不修改任何文件。
 */

const REJECTION_LOG = '/var/log/product-news-digest/publisher-rejections.log'
const RESOLVED_FILE = path.resolve(process.cwd(), 'data/rejections/publisher-rejections.resolved')
const ARCHIVE_AGE_DAYS = 30

export type RejectionEntry = {
  id: string
  brand: string
  reason: string
  title: string
  sourceUrl: string
  firstRejectedAt: string // ISO
  lastRejectedAt: string // ISO（最新一次 reject）
  hitCount: number
  ageDays: number
  shouldArchive: boolean
}

export type RejectionResolution = {
  resolvedAt: string
  id: string
  resolution: 'fixed-data' | 'loosened-rule' | 'false-positive' | 'other'
  note: string
}

export type RejectionMonitorResult = {
  checkedAt: string
  totalRejections: number
  uniqueRejectedIds: number
  resolvedCount: number
  unresolved: RejectionEntry[]
  shouldArchiveIds: string[]
}

/**
 * 解析 publisher-rejections.log 单行：
 * [2026-06-11T02:42:03.660Z] REJECTED id=... brand=... reason=... title="..." sourceUrl="..."
 */
function parseRejectionLine(line: string): { rejectedAt: string; id: string; brand: string; reason: string; title: string; sourceUrl: string } | null {
  // 格式：[<ISO>] REJECTED id=<id> brand=<brand-with-spaces-ok> reason=<reason> title="<title>" sourceUrl="<url>"
  // brand 可能含空格（如 "Louis Vuitton"），所以用 lookahead 锚定到 " reason="
  const match = line.match(
      /^\[([^\]]+)\]\s+REJECTED\s+id=(\S+)\s+brand=(.+?)\s+reason=(.+?)\s+title="(.+?)"\s+sourceUrl="(.+?)"\s*$/,
  )
  if (!match) return null
  return {
    rejectedAt: match[1],
    id: match[2],
    brand: match[3],
    reason: match[4],
    title: match[5],
    sourceUrl: match[6],
  }
}

function parseResolvedLine(line: string): RejectionResolution | null {
  // 格式：resolved_at=<ISO> id=<id> resolution=<kind> note=<text>
  const match = line.match(/^resolved_at=([^\s]+)\s+id=(\S+)\s+resolution=(\S+)\s+note=(.+)$/)
  if (!match) return null
  return {
    resolvedAt: match[1],
    id: match[2],
    resolution: match[3] as RejectionResolution['resolution'],
    note: match[4],
  }
}

function diffDays(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime()
  const to = new Date(toIso).getTime()
  if (Number.isNaN(from) || Number.isNaN(to)) return 0
  return Math.floor((to - from) / 86_400_000)
}

export async function readRejectionLog(): Promise<Map<string, { firstRejectedAt: string; lastRejectedAt: string; hitCount: number; brand: string; reason: string; title: string; sourceUrl: string }>> {
  if (!existsSync(REJECTION_LOG)) {
    return new Map()
  }
  const contents = await readFile(REJECTION_LOG, 'utf8')
  const lines = contents.split('\n').filter((line) => line.trim().length > 0)
  const byId = new Map<string, { firstRejectedAt: string; lastRejectedAt: string; hitCount: number; brand: string; reason: string; title: string; sourceUrl: string }>()

  for (const line of lines) {
    const parsed = parseRejectionLine(line)
    if (!parsed) continue

    const existing = byId.get(parsed.id)
    if (existing) {
      existing.hitCount += 1
      if (parsed.rejectedAt < existing.firstRejectedAt) existing.firstRejectedAt = parsed.rejectedAt
      if (parsed.rejectedAt > existing.lastRejectedAt) existing.lastRejectedAt = parsed.rejectedAt
      // 用最新一次的 reason/title/sourceUrl（更接近当前事实）
      existing.reason = parsed.reason
      existing.title = parsed.title
      existing.sourceUrl = parsed.sourceUrl
    } else {
      byId.set(parsed.id, {
        firstRejectedAt: parsed.rejectedAt,
        lastRejectedAt: parsed.rejectedAt,
        hitCount: 1,
        brand: parsed.brand,
        reason: parsed.reason,
        title: parsed.title,
        sourceUrl: parsed.sourceUrl,
      })
    }
  }

  return byId
}

export async function readResolutions(): Promise<Set<string>> {
  if (!existsSync(RESOLVED_FILE)) {
    return new Set()
  }
  const contents = await readFile(RESOLVED_FILE, 'utf8')
  const lines = contents.split('\n').filter((line) => line.trim().length > 0 && !line.startsWith('#'))
  const resolved = new Set<string>()
  for (const line of lines) {
    const parsed = parseResolvedLine(line)
    if (parsed) {
      resolved.add(parsed.id)
    }
  }
  return resolved
}

export async function monitorRejections(today: Date = new Date()): Promise<RejectionMonitorResult> {
  const todayIso = today.toISOString()
  const allRejections = await readRejectionLog()
  const resolved = await readResolutions()

  const unresolved: RejectionEntry[] = []
  const shouldArchiveIds: string[] = []

  for (const [id, entry] of allRejections) {
    if (resolved.has(id)) continue

    const ageDays = diffDays(entry.firstRejectedAt, todayIso)
    const shouldArchive = ageDays >= ARCHIVE_AGE_DAYS

    unresolved.push({
      id,
      brand: entry.brand,
      reason: entry.reason,
      title: entry.title,
      sourceUrl: entry.sourceUrl,
      firstRejectedAt: entry.firstRejectedAt,
      lastRejectedAt: entry.lastRejectedAt,
      hitCount: entry.hitCount,
      ageDays,
      shouldArchive,
    })

    if (shouldArchive) {
      shouldArchiveIds.push(id)
    }
  }

  // 按 ageDays 降序（最久的在前）
  unresolved.sort((a, b) => b.ageDays - a.ageDays)

  let totalRejections = 0
  for (const entry of allRejections.values()) {
    totalRejections += entry.hitCount
  }

  return {
    checkedAt: todayIso,
    totalRejections,
    uniqueRejectedIds: allRejections.size,
    resolvedCount: resolved.size,
    unresolved,
    shouldArchiveIds,
  }
}

/**
 * 格式化未处理 reject 列表为可读文本（用于周报邮件/微信）
 */
export function formatUnresolvedList(unresolved: RejectionEntry[]): string {
  if (unresolved.length === 0) {
    return '✨ 当前无未处理 reject 条目。'
  }

  const lines: string[] = []
  lines.push(`共 ${unresolved.length} 条未处理 reject：`)
  lines.push('')

  // 按 brand 分组
  const byBrand = new Map<string, RejectionEntry[]>()
  for (const entry of unresolved) {
    const list = byBrand.get(entry.brand) ?? []
    list.push(entry)
    byBrand.set(entry.brand, list)
  }

  for (const [brand, entries] of byBrand) {
    lines.push(`【${brand}】(${entries.length} 条)`)
    for (const entry of entries) {
      const archiveTag = entry.shouldArchive ? ' [⏰ 应归档]' : ''
      lines.push(`  - id=${entry.id} age=${entry.ageDays}天 hit=${entry.hitCount}${archiveTag}`)
      lines.push(`    原因: ${entry.reason.slice(0, 100)}`)
      lines.push(`    标题: ${entry.title.slice(0, 60)}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void (async () => {
    const result = await monitorRejections()
    console.log(`检查时间: ${result.checkedAt}`)
    console.log(`总 reject 行数: ${result.totalRejections}`)
    console.log(`独立 id 数: ${result.uniqueRejectedIds}`)
    console.log(`已 resolved 数: ${result.resolvedCount}`)
    console.log(`未处理数: ${result.unresolved.length}`)
    console.log(`应归档数: ${result.shouldArchiveIds.length}`)
    console.log('')
    console.log(formatUnresolvedList(result.unresolved))
  })()
}
