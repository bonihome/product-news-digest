import { access } from 'node:fs/promises'
import path from 'node:path'

import { findImageRuleForStory, hasLocalMirror } from './imageRules'
import type { PipelineAlert, StoredStory } from './types'

// ── Types ──────────────────────────────────────────────────────────

export type ImageIssueSeverity = 'critical' | 'warning'

export type ImageIssueKind =
  | 'MISSING_IMAGE'
  | 'SVG_PLACEHOLDER'
  | 'REMOTE_URL_NOT_LOCALIZED'
  | 'FALLBACK_THUMBNAIL_DETECTED'
  | 'OLD_PLACEHOLDER_PATH'
  | 'FILE_NOT_FOUND'
  | 'WRONG_PRODUCT_IMAGE'
  | 'FILE_MIME_INVALID'
  | 'FILE_TOO_SMALL'
  | 'FILE_STR_ENCODED'

export type ImageIssue = {
  storyId: string
  brand: string
  title: string
  currentImage: string
  kind: ImageIssueKind
  severity: ImageIssueSeverity
  message: string
  repairable: boolean
}

export type IntegrityReport = {
  checkedAt: string
  totalStories: number
  totalIssues: number
  criticalCount: number
  warningCount: number
  repairedCount: number
  issues: ImageIssue[]
  alerts: PipelineAlert[]
}

// ── Known fallback / placeholder URL patterns ──────────────────────

const FALLBACK_PATTERNS = [
  'thumbnail-fallback',
  't_default',
  'placeholder',
  'no-image',
  'default-image',
  'coming-soon',
  'image-not-found',
  'missing-product',
  'empty_product',
  'spacer',
  'pixel',
]

function isFallbackUrl(imageUrl: string): boolean {
  const lower = imageUrl.toLowerCase()
  return FALLBACK_PATTERNS.some((pattern) => lower.includes(pattern))
}

function isRemoteUrl(imagePath: string): boolean {
  return imagePath.startsWith('http://') || imagePath.startsWith('https://')
}

function isSvg(imagePath: string): boolean {
  return imagePath.toLowerCase().endsWith('.svg')
}

function isOldPlaceholderPath(imagePath: string): boolean {
  return imagePath.startsWith('/news/') && !imagePath.startsWith('/news-images/')
}

function isLocalized(imagePath: string): boolean {
  return imagePath.startsWith('/runtime/news-images/')
}

// ── Resolve local file path ────────────────────────────────────────

function resolveLocalPath(imagePath: string): string {
  const relative = imagePath.replace(/^\//, '')
  return path.resolve(process.cwd(), 'public', relative)
}

// ── Product name matching helpers ──────────────────────────────────

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Check if the image filename plausibly matches the story's products.
 * This is a heuristic: we extract product-relevant tokens from the filename
 * and see if any product name from the story matches.
 */
function imageMatchesStoryProducts(story: StoredStory): boolean {
  const imagePath = story.image
  if (!imagePath || isRemoteUrl(imagePath)) return false

  const fileName = path.basename(imagePath, path.extname(imagePath))
  const normalizedFileName = normalizeForMatch(fileName)
  const brandNormalized = normalizeForMatch(story.brand)

  // Remove brand prefix from filename for cleaner matching
  const fileNameWithoutBrand = normalizedFileName.replace(brandNormalized, '')

  for (const product of story.products) {
    const normProduct = normalizeForMatch(product)
    if (normProduct.length < 3) continue // skip very short product names

    // Check if the product name appears in filename
    if (fileNameWithoutBrand.includes(normProduct)) {
      return true
    }
  }

  return false
}

// ── Auto-repair attempt ────────────────────────────────────────────

async function tryRepairFromImageRules(story: StoredStory): Promise<string | null> {
  try {
    const ruleStory = await findImageRuleForStory(story)
    if (!ruleStory) return null

    // Only consider repairs that are actual localized images (not old /news/ placeholders)
    const candidatePath = ruleStory.acquisition.localMirrorPath
    if (
      candidatePath &&
      !isSvg(candidatePath) &&
      isLocalized(candidatePath) &&
      (await hasLocalMirror(candidatePath))
    ) {
      return candidatePath
    }

    return null
  } catch {
    return null
  }
}

function applyRepair(story: StoredStory, repaired: string, repairedCount: number): number {
  if (story.image !== repaired) {
    story.image = repaired
    return repairedCount + 1
  }
  return repairedCount
}

// ── Main check function ────────────────────────────────────────────

export async function checkImageIntegrity(
  stories: StoredStory[],
  runId: string,
): Promise<IntegrityReport> {
  const checkedAt = new Date().toISOString()
  const issues: ImageIssue[] = []
  const alerts: PipelineAlert[] = []
  let repairedCount = 0

  for (const story of stories) {
    const img = story.image || ''

    // ── Check 1: Missing image ──
    if (!img) {
      // Try auto-repair from image-rules
      const repaired = await tryRepairFromImageRules(story)
      if (repaired) {
        repairedCount = applyRepair(story, repaired, repairedCount)
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'warning',
          brand: story.brand,
          message: `[图片完整性修复] ${story.id}: 图片缺失，已从 image-rules 自动修复 → ${repaired}`,
        })
        continue
      }

      const issue: ImageIssue = {
        storyId: story.id,
        brand: story.brand,
        title: story.title,
        currentImage: '(空)',
        kind: 'MISSING_IMAGE',
        severity: 'critical',
        message: '新闻没有关联任何图片',
        repairable: false,
      }
      issues.push(issue)
      alerts.push({
        runId,
        createdAt: checkedAt,
        level: 'error',
        brand: story.brand,
        message: `[图片完整性] ${story.id}: ${issue.message}`,
      })
      continue
    }

    // ── Check 2: SVG placeholder ──
    if (isSvg(img)) {
      const repaired = await tryRepairFromImageRules(story)
      if (repaired) {
        repairedCount = applyRepair(story, repaired, repairedCount)
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'warning',
          brand: story.brand,
          message: `[图片完整性修复] ${story.id}: SVG占位图，已从 image-rules 自动修复 → ${repaired}`,
        })
        continue
      }

      const issue: ImageIssue = {
        storyId: story.id,
        brand: story.brand,
        title: story.title,
        currentImage: img,
        kind: 'SVG_PLACEHOLDER',
        severity: 'critical',
        message: '使用了 SVG 占位图而非真实产品图片',
        repairable: false,
      }
      issues.push(issue)
      alerts.push({
        runId,
        createdAt: checkedAt,
        level: 'error',
        brand: story.brand,
        message: `[图片完整性] ${story.id}: ${issue.message} (${img})`,
      })
      continue
    }

    // ── Check 3: Remote URL (not localized) ──
    if (isRemoteUrl(img)) {
      // Check if it's a fallback thumbnail
      if (isFallbackUrl(img)) {
        const repaired = await tryRepairFromImageRules(story)
        if (repaired) {
          repairedCount = applyRepair(story, repaired, repairedCount)
          alerts.push({
            runId,
            createdAt: checkedAt,
            level: 'warning',
            brand: story.brand,
            message: `[图片完整性修复] ${story.id}: 远程URL是兜底缩略图(${img.slice(0, 60)}...)，已从 image-rules 自动修复 → ${repaired}`,
          })
          continue
        }

        const issue: ImageIssue = {
          storyId: story.id,
          brand: story.brand,
          title: story.title,
          currentImage: img,
          kind: 'FALLBACK_THUMBNAIL_DETECTED',
          severity: 'critical',
          message: `远程图片URL是兜底缩略图而非产品实拍图: ${img.slice(0, 80)}`,
          repairable: false,
        }
        issues.push(issue)
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'error',
          brand: story.brand,
          message: `[图片完整性] ${story.id}: ${issue.message}`,
        })
        // Clear the fallback URL from the story so the frontend doesn't render the placeholder.
        // The story will be picked up by the next pipeline run with a real image, or the static
        // seed will overwrite it if it has a better local image. Until then, the story still
        // shows with its title/summary — just no broken thumbnail.
        story.image = ''
        continue
      }

      // Normal remote URL - try repair
      const repaired = await tryRepairFromImageRules(story)
      if (repaired) {
        repairedCount = applyRepair(story, repaired, repairedCount)
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'warning',
          brand: story.brand,
          message: `[图片完整性修复] ${story.id}: 远程URL未本地化，已从 image-rules 自动修复 → ${repaired}`,
        })
        continue
      }

      const issue: ImageIssue = {
        storyId: story.id,
        brand: story.brand,
        title: story.title,
        currentImage: img.slice(0, 100),
        kind: 'REMOTE_URL_NOT_LOCALIZED',
        severity: 'critical',
        message: `图片仍是远程URL，下载失败未本地化: ${img.slice(0, 80)}`,
        repairable: false,
      }
      issues.push(issue)
      alerts.push({
        runId,
        createdAt: checkedAt,
        level: 'error',
        brand: story.brand,
        message: `[图片完整性] ${story.id}: ${issue.message}`,
      })
      continue
    }

    // ── Check 4: Old placeholder path (/news/...) ──
    if (isOldPlaceholderPath(img)) {
      const repaired = await tryRepairFromImageRules(story)
      if (repaired) {
        repairedCount = applyRepair(story, repaired, repairedCount)
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'warning',
          brand: story.brand,
          message: `[图片完整性修复] ${story.id}: 旧占位图路径(${img})，已从 image-rules 自动修复 → ${repaired}`,
        })
        continue
      }

      const issue: ImageIssue = {
        storyId: story.id,
        brand: story.brand,
        title: story.title,
        currentImage: img,
        kind: 'OLD_PLACEHOLDER_PATH',
        severity: 'warning',
        message: `使用了旧的静态占位图路径: ${img}`,
        repairable: false,
      }
      issues.push(issue)
      alerts.push({
        runId,
        createdAt: checkedAt,
        level: 'warning',
        brand: story.brand,
        message: `[图片完整性] ${story.id}: ${issue.message}`,
      })
      continue
    }

    // ── Check 5: Local file exists on disk ──
    if (isLocalized(img)) {
      const absolutePath = resolveLocalPath(img)
      try {
        await access(absolutePath)
      } catch {
        const repaired = await tryRepairFromImageRules(story)
        if (repaired) {
          repairedCount = applyRepair(story, repaired, repairedCount)
          alerts.push({
            runId,
            createdAt: checkedAt,
            level: 'warning',
            brand: story.brand,
            message: `[图片完整性修复] ${story.id}: 本地文件不存在(${img})，已从 image-rules 自动修复 → ${repaired}`,
          })
          continue
        }

        const issue: ImageIssue = {
          storyId: story.id,
          brand: story.brand,
          title: story.title,
          currentImage: img,
          kind: 'FILE_NOT_FOUND',
          severity: 'critical',
          message: `本地图片文件不存在: ${img}`,
          repairable: false,
        }
        issues.push(issue)
        alerts.push({
          runId,
          createdAt: checkedAt,
          level: 'error',
          brand: story.brand,
          message: `[图片完整性] ${story.id}: ${issue.message}`,
        })
        continue
      }
    }

    // ── Check 5.5: File mime / size / str-encoded validation (added 2026-06-09) ──
    if (isLocalized(img)) {
      const absolutePath = resolveLocalPath(img)
      try {
        const { stat, readFile } = await import('node:fs/promises')
        const st = await stat(absolutePath)
        // 太小的图几乎肯定是 broken（5KB Arcadrome 截图就触发了 6-09 的 nginx 截断）
        if (st.size < 1024) {
          const repaired = await tryRepairFromImageRules(story)
          if (repaired) {
            repairedCount = applyRepair(story, repaired, repairedCount)
            alerts.push({
              runId,
              createdAt: checkedAt,
              level: 'warning',
              brand: story.brand,
              message: `[图片完整性修复] ${story.id}: 文件过小(${st.size} bytes)，已从 image-rules 自动修复 → ${repaired}`,
            })
            continue
          }
          const issue: ImageIssue = {
            storyId: story.id,
            brand: story.brand,
            title: story.title,
            currentImage: img,
            kind: 'FILE_TOO_SMALL',
            severity: 'critical',
            message: `本地图片文件过小(${st.size} bytes)，极可能是 broken: ${img}`,
            repairable: false,
          }
          issues.push(issue)
          alerts.push({
            runId,
            createdAt: checkedAt,
            level: 'error',
            brand: story.brand,
            message: `[图片完整性] ${story.id}: ${issue.message}`,
          })
          continue
        }
        // 读前 16 字节判 mime
        const fd = await readFile(absolutePath)
        const head = fd.subarray(0, 16)
        // 字面字符串包装：内容以 b' 开头（Python repr 风格）
        const textHead = head.toString('ascii', 0, Math.min(16, head.length))
        if (textHead.startsWith("b'") || textHead.startsWith('b"')) {
          const issue: ImageIssue = {
            storyId: story.id,
            brand: story.brand,
            title: story.title,
            currentImage: img,
            kind: 'FILE_STR_ENCODED',
            severity: 'critical',
            message: `本地图片文件内容是字面字符串（bytes 被 str() 包装），需解码恢复: ${img}`,
            repairable: false,
          }
          issues.push(issue)
          alerts.push({
            runId,
            createdAt: checkedAt,
            level: 'error',
            brand: story.brand,
            message: `[图片完整性] ${story.id}: ${issue.message}`,
          })
          continue
        }
        // 真 MIME 判别（前 12 字节）
        const isRealJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
        const isRealPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
        const isRealWebp =
          head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
          fd.subarray(8, 12).toString('ascii') === 'WEBP'
        const isRealAvif = head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70 &&
          head[8] === 0x61 && head[9] === 0x76 && head[10] === 0x69 && head[11] === 0x66
        const ext = path.extname(img).toLowerCase()
        // 内容真实类型与扩展名交叉校验（2026-08-13 起：不只 AVIF，WebP 字节存成 .png 同样 MIME 撒谎）
        const realType = isRealJpeg
          ? 'jpeg'
          : isRealPng
            ? 'png'
            : isRealWebp
              ? 'webp'
              : isRealAvif
                ? 'avif'
                : null
        const extMatchesRealType =
          (realType === 'jpeg' && (ext === '.jpg' || ext === '.jpeg')) ||
          (realType === 'png' && ext === '.png') ||
          (realType === 'webp' && ext === '.webp') ||
          (realType === 'avif' && ext === '.avif')
        if (realType && !extMatchesRealType) {
          const repaired = await tryRepairFromImageRules(story)
          if (repaired) {
            repairedCount = applyRepair(story, repaired, repairedCount)
            alerts.push({
              runId,
              createdAt: checkedAt,
              level: 'warning',
              brand: story.brand,
              message: `[图片完整性修复] ${story.id}: ${realType} 流配 ${ext} 扩展名（MIME 撒谎），已从 image-rules 自动修复 → ${repaired}`,
            })
            continue
          }
          const issue: ImageIssue = {
            storyId: story.id,
            brand: story.brand,
            title: story.title,
            currentImage: img,
            kind: 'FILE_MIME_INVALID',
            severity: 'critical',
            message: `本地图片文件实际是 ${realType} 流但扩展名是 ${ext}（nginx MIME 撒谎），浏览器解码失败: ${img}`,
            repairable: false,
          }
          issues.push(issue)
          alerts.push({
            runId,
            createdAt: checkedAt,
            level: 'error',
            brand: story.brand,
            message: `[图片完整性] ${story.id}: ${issue.message}`,
          })
          continue
        }
        // 扩展名是 .jpg/.png/.webp 但内容都不是真对应类型 = 文件被错放/错命名
        if (
          (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') &&
          !isRealJpeg && !isRealPng && !isRealWebp && !isRealAvif
        ) {
          const repaired = await tryRepairFromImageRules(story)
          if (repaired) {
            repairedCount = applyRepair(story, repaired, repairedCount)
            alerts.push({
              runId,
              createdAt: checkedAt,
              level: 'warning',
              brand: story.brand,
              message: `[图片完整性修复] ${story.id}: 扩展名 ${ext} 与内容不符，已从 image-rules 自动修复 → ${repaired}`,
            })
            continue
          }
          const issue: ImageIssue = {
            storyId: story.id,
            brand: story.brand,
            title: story.title,
            currentImage: img,
            kind: 'FILE_MIME_INVALID',
            severity: 'critical',
            message: `本地图片文件扩展名(${ext})与内容不符（不是 jpeg/png/webp/avif），浏览器无法解码: ${img}`,
            repairable: false,
          }
          issues.push(issue)
          alerts.push({
            runId,
            createdAt: checkedAt,
            level: 'error',
            brand: story.brand,
            message: `[图片完整性] ${story.id}: ${issue.message}`,
          })
          continue
        }
      } catch {
        // stat/readFile 失败说明文件已经被 tryRepair 处理过，跳过
      }
    }

    // ── Check 6: Image matches story products (heuristic) ──
    if (isLocalized(img) && (story.products ?? []).length > 0) {
      const matches = imageMatchesStoryProducts(story)
      if (!matches) {
        // Check against image-rules to see if the expected product is different
        const ruleStory = await findImageRuleForStory(story)
        if (ruleStory && ruleStory.products.length > 0) {
          const ruleProducts = ruleStory.products.map(normalizeForMatch)
          const storyProducts = story.products.map(normalizeForMatch)
          const hasOverlap = ruleProducts.some((rp) =>
            storyProducts.some((sp) => sp.includes(rp) || rp.includes(sp)),
          )

          if (!hasOverlap) {
            // Image-rules expects different products → possible wrong image
            // Try repair if image-rules has a valid localMirrorPath
            if (
              ruleStory.acquisition.localMirrorPath &&
              !isSvg(ruleStory.acquisition.localMirrorPath) &&
              !isOldPlaceholderPath(ruleStory.acquisition.localMirrorPath) &&
              (await hasLocalMirror(ruleStory.acquisition.localMirrorPath))
            ) {
              repairedCount = applyRepair(story, ruleStory.acquisition.localMirrorPath, repairedCount)
              alerts.push({
                runId,
                createdAt: checkedAt,
                level: 'warning',
                brand: story.brand,
                message: `[图片完整性修复] ${story.id}: 图片文件名不匹配产品(${story.products.join(', ')})，已从 image-rules 修复 → ${ruleStory.acquisition.localMirrorPath}`,
              })
              continue
            }

            const issue: ImageIssue = {
              storyId: story.id,
              brand: story.brand,
              title: story.title,
              currentImage: img,
              kind: 'WRONG_PRODUCT_IMAGE',
              severity: 'warning',
              message: `图片文件名不包含任何产品名(${story.products.join(', ').slice(0, 60)})，可能是错误的产品图片`,
              repairable: false,
            }
            issues.push(issue)
            alerts.push({
              runId,
              createdAt: checkedAt,
              level: 'warning',
              brand: story.brand,
              message: `[图片完整性] ${story.id}: ${issue.message}`,
            })
          }
        }
      }
    }
  }

  // ── Build report ──
  const criticalCount = issues.filter((i) => i.severity === 'critical').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length

  return {
    checkedAt,
    totalStories: stories.length,
    totalIssues: issues.length,
    criticalCount,
    warningCount,
    repairedCount,
    issues,
    alerts,
  }
}

/**
 * Generate a human-readable summary of the integrity report.
 */
export function formatIntegrityReport(report: IntegrityReport): string {
  const lines: string[] = [
    `📋 图片引用完整性校验报告`,
    `检查时间: ${report.checkedAt}`,
    `新闻总数: ${report.totalStories}`,
    `✅ 已修复: ${report.repairedCount}`,
    `❌ 严重问题: ${report.criticalCount}`,
    `⚠️  警告: ${report.warningCount}`,
    `---`,
  ]

  if (report.issues.length === 0 && report.repairedCount === 0) {
    lines.push('✨ 全部通过，无图片完整性问题。')
    return lines.join('\n')
  }

  if (report.repairedCount > 0) {
    lines.push(`🔧 自动修复了 ${report.repairedCount} 条新闻的图片引用。`)
  }

  if (report.issues.length > 0) {
    const byKind = new Map<string, ImageIssue[]>()
    for (const issue of report.issues) {
      const list = byKind.get(issue.kind) || []
      list.push(issue)
      byKind.set(issue.kind, list)
    }

    for (const [kind, kindIssues] of byKind) {
      const sev = kindIssues[0].severity === 'critical' ? '❌' : '⚠️'
      lines.push(`${sev} ${kind}: ${kindIssues.length} 条`)
    }

    lines.push('')
    lines.push('详情:')
    for (const issue of report.issues.slice(0, 20)) {
      const prefix = issue.severity === 'critical' ? '❌' : '⚠️'
      lines.push(`  ${prefix} [${issue.brand}] ${issue.storyId}: ${issue.message}`)
    }

    if (report.issues.length > 20) {
      lines.push(`  ... 还有 ${report.issues.length - 20} 条问题`)
    }
  }

  return lines.join('\n')
}
