/**
 * qa-published-images.ts — 发布后图片质检
 * 在 regen-feed + build 之后运行，对最终发布的新闻做一轮检查：
 *   ① 图片能否正确加载（HTTP 200 + 大小达标）
 *   ② 图片是否是"非产品图"（截图/logo/占位图/SVG，文件名含这些关键词）
 *
 * 用途：抓 broken 图（HTTP 失败/过小）和"非产品图"（pipeline 截图回退产生的
 *   screenshot.jpg、误提取的 logo/fallback 缩略图、SVG 占位图）。
 *   正常图片的文件名是 story.id + hash（含产品 slug），不含这些关键词。
 *
 * 用法: npx tsx scripts/qa-published-images.ts            # 只检查当天新生成的新闻
 *       npx tsx scripts/qa-published-images.ts --all      # 检查全部新闻（周日晚全量巡检）
 * 退出码: 0 = 全部通过, 1 = 有问题
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const ROOT = '/srv/product-news-digest'
const SITE = 'https://newsofgift.com'
const NEWS_ITEMS = `${ROOT}/data/runtime/news-items.json`
const MIN_IMAGE_BYTES = 3072 // 3KB 以下几乎肯定是 broken

// 非产品图关键词：文件名含这些词 = 截图/占位图，不是真实产品图。
// 注意：/news/logos/ 品牌 logo 是用户要求的兜底设计，不算问题；SVG 也可能是正常矢量图。
const NON_PRODUCT_MARKERS = [
  'screenshot',            // Playwright 截图回退的 bug 产物（列表页/首页截图）
  'thumbnail-fallback',    // fallback 缩略图（Miu Miu 误提取）
  'placeholder',           // 占位图
]

interface Story {
  id: string
  brand: string
  title: string
  image: string
  products?: string[]
  [k: string]: unknown
}

interface QaIssue {
  storyId: string
  brand: string
  image: string
  kind: 'HTTP_LOAD_FAILED' | 'HTTP_TOO_SMALL' | 'NON_PRODUCT_IMAGE'
  message: string
}

function isNonProductImage(imagePath: string): boolean {
  const lower = imagePath.toLowerCase()
  return NON_PRODUCT_MARKERS.some((m) => lower.includes(m))
}

/** 判断 checkedAt 是否属于「今天」（中国时区 CST = UTC+8）。
 *  pipeline 每天 07:00 CST 跑，新生成的新闻 checkedAt 是当天 CST 日期（UTC 里是前一天 23:xx）。 */
function isTodayCst(checkedAt: unknown): boolean {
  if (typeof checkedAt !== 'string' || !checkedAt) return false
  const d = new Date(checkedAt)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date(Date.now() + 8 * 3600 * 1000) // 今天 CST
  const cst = new Date(d.getTime() + 8 * 3600 * 1000) // checkedAt 转 CST
  return (
    cst.getUTCFullYear() === now.getUTCFullYear() &&
    cst.getUTCMonth() === now.getUTCMonth() &&
    cst.getUTCDate() === now.getUTCDate()
  )
}

function httpCheck(imagePath: string): { ok: boolean; size: number; kind?: QaIssue['kind'] } {
  const url = `${SITE}${imagePath}`
  try {
    const out = execSync(
      `curl -sk -o /dev/null -w '%{http_code} %{size_download}' --connect-timeout 3 --max-time 6 --retry 2 --retry-delay 1 "${url}"`,
      { encoding: 'utf-8', timeout: 20000 },
    ).trim()
    const [code, sizeStr] = out.split(' ')
    const size = Number(sizeStr)
    if (code !== '200') return { ok: false, size: 0, kind: 'HTTP_LOAD_FAILED' }
    if (size < MIN_IMAGE_BYTES) return { ok: false, size, kind: 'HTTP_TOO_SMALL' }
    return { ok: true, size }
  } catch {
    return { ok: false, size: 0, kind: 'HTTP_LOAD_FAILED' }
  }
}

function main() {
  const all = process.argv.includes('--all')
  const stories: Story[] = JSON.parse(readFileSync(NEWS_ITEMS, 'utf-8'))
  // 默认只检查当天新生成的新闻（--all 时检查全部）
  const targets = all ? stories : stories.filter((s) => isTodayCst(s.checkedAt))
  const issues: QaIssue[] = []
  let checked = 0

  for (const story of targets) {
    const img = story.image || ''
    if (!img || !(img.startsWith('/runtime/') || img.startsWith('/news/'))) continue

    checked++
    // ① HTTP 加载检查（logo 目录跳过大小检查：SVG logo 本来就小，是兜底设计）
    const r = httpCheck(img)
    const isLogo = img.includes('/logos/')
    if (!r.ok && !(isLogo && r.kind === 'HTTP_TOO_SMALL')) {
      issues.push({
        storyId: story.id,
        brand: story.brand,
        image: img,
        kind: r.kind!,
        message: `图片 HTTP 加载失败/过小(${r.size}B): ${img}`,
      })
      continue
    }

    // ② 非产品图检查
    if (isNonProductImage(img)) {
      issues.push({
        storyId: story.id,
        brand: story.brand,
        image: img,
        kind: 'NON_PRODUCT_IMAGE',
        message: `图片是截图/logo/占位图而非真实产品图: ${img}`,
      })
    }
  }

  const byKind = new Map<string, number>()
  for (const i of issues) byKind.set(i.kind, (byKind.get(i.kind) ?? 0) + 1)

  console.log('📋 发布后图片质检报告')
  console.log(`模式: ${all ? '全量巡检（全部新闻）' : '日常巡检（当天新生成）'}`)
  console.log(`检查条目: ${checked}`)
  console.log(`问题: ${issues.length}`)
  if (issues.length === 0) {
    console.log('✨ 全部通过，图片均能加载且是真实产品图。')
    return
  }
  for (const [kind, count] of byKind) console.log(`  ${kind}: ${count} 条`)
  console.log('详情:')
  for (const i of issues.slice(0, 40)) console.log(`  [${i.brand}] ${i.storyId}: ${i.message}`)
  if (issues.length > 40) console.log(`  ... 还有 ${issues.length - 40} 条`)
  process.exitCode = 1
}

main()
