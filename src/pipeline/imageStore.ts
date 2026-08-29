import crypto from 'node:crypto'
import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'

import { findImageRuleForStory, hasLocalMirror } from './imageRules'
import { readImageAssets, writeImageAssets } from './runtimeStore'
import { searchBestProductImage } from './imageSearch'
import type { ImageAssetRecord, StoredStory } from './types'

const publicImageDir = path.resolve(process.cwd(), 'public/runtime/news-images')

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x26;/gi, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function sanitizeBrand(brand: string) {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function detectExtension(contentType: string | null, imageUrl: string) {
  if (contentType?.includes('png')) {
    return '.png'
  }

  if (contentType?.includes('webp')) {
    return '.webp'
  }

  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
    return '.jpg'
  }

  const cleanPath = new URL(imageUrl).pathname.toLowerCase()
  const match = cleanPath.match(/\.(png|webp|jpg|jpeg)$/)
  return match ? `.${match[1] === 'jpeg' ? 'jpg' : match[1]}` : '.jpg'
}

// 用真实字节（magic bytes）判断扩展名，不信任 Content-Type / URL 扩展名。
// 2026-08-13：Chanel 等 CDN 返回 WebP 字节却声明 image/png，导致文件被存成 .png，
// nginx 按扩展名返回 image/png 的 MIME，浏览器按 PNG 解码失败 → 裂图。
function detectExtensionByContent(buffer: Buffer, contentType: string | null, imageUrl: string) {
  if (buffer.length >= 12) {
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg'
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return '.png'
    // WebP: RIFF .... WEBP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return '.webp'
    }
    // AVIF: .... ftypavif
    if (
      buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70 &&
      buffer[8] === 0x61 && buffer[9] === 0x76 && buffer[10] === 0x69 && buffer[11] === 0x66
    ) {
      return '.avif'
    }
  }
  // 回退：信任 Content-Type / URL（保持原逻辑）
  return detectExtension(contentType, imageUrl)
}

function isPlaceholderVector(pathOrUrl: string) {
  return pathOrUrl.toLowerCase().endsWith('.svg')
}

// Chanel 等品牌的产品页 og:image 常返回 192×192 的网站 favicon/logo（5430B PNG），
// 而非产品图。用 PNG IHDR 头解析真实宽高，小于等于 256×256 判为 favicon/logo，
// 阻止其被当成产品 packshot 存盘。
function isFaviconOrLogo(buffer: Buffer): boolean {
  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    // IHDR chunk 位于字节 8-24：width=bytes 16-19，height=bytes 20-23（big-endian）
    const width = buffer.readUInt32BE(16)
    const height = buffer.readUInt32BE(20)
    return width <= 256 && height <= 256
  }
  // 其它格式用体积兜底：<8KB 的图几乎不可能是产品图
  return buffer.length < 8192
}

/**
 * 清洗图片 URL，拦截提取层误提取的脏数据（非真实产品图 URL）。
 * 返回 null 表示应跳过下载。
 * 已知脏数据来源：
 *  - Huawei FreeBuds：image 被提取成 JSON 片段（含 `","`、`qrCode`、`\u002F` 转义）
 *  - Miu Miu：误提取官网 clientlibs 资源（/etc/designs/...clientlibs...）
 *  - LV：footer 链接 / 站内导航（非产品详情页）
 */
function sanitizeImageUrl(imageUrl: string): string | null {
  const lower = imageUrl.toLowerCase()

  // JSON 片段 / 转义 URL（Huawei 误提取）
  if (imageUrl.includes('","') || imageUrl.includes('qrCode') || imageUrl.includes('\\u002F') || imageUrl.includes('&#34;')) {
    return null
  }

  // clientlibs / AEM 设计资源（Miu Miu logo、favicon 等前端资源）
  if (lower.includes('/etc/designs/') || lower.includes('clientlib')) {
    return null
  }

  // favicon / apple-touch-icon / logo 图标资源
  if (lower.includes('favicon') || lower.includes('apple-touch-icon') || lower.includes('/logo')) {
    return null
  }

  // 空或非 http(s)
  if (!imageUrl || !(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return null
  }

  return imageUrl
}

/**
 * Check if an image URL is a known "bad" placeholder that should be replaced.
 * Note: Nike CDN URLs use /a/images/t_default/ and /a/images/t_prod/ as normal
 * path segments (NOT placeholders) — the product is identified by the trailing
 * filename (e.g. KOBE+V+(GS).png). Only old /news/ placeholder paths and empty
 * values are treated as bad.
 */
function isBadPlaceholderImage(url: string): boolean {
  // Old /news/ placeholder paths
  if (url.startsWith('/news/')) return true
  // Empty or obviously invalid
  if (!url || url === '/') return true
  return false
}

function createStorySourceSignature(story: StoredStory) {
  return crypto
    .createHash('sha1')
    .update(
      [
        story.brand,
        story.sourceUrl,
        story.sourceTitle,
        story.publishedAt,
        story.products.join('|'),
      ].join('::'),
    )
    .digest('hex')
}

function shouldReuseLocalMirror(
  story: StoredStory,
  existingAsset: ImageAssetRecord | undefined,
  sourceSignature: string,
  hasRefreshableCandidate: boolean,
) {
  if (!existingAsset) {
    return !hasRefreshableCandidate
  }

  if (existingAsset.fingerprint === story.fingerprint) {
    return true
  }

  if (existingAsset.sourceSignature && existingAsset.sourceSignature === sourceSignature) {
    return true
  }

  return !hasRefreshableCandidate
}

async function downloadImage(
  story: StoredStory,
  imageUrl: string,
  sourceSignature: string,
  retryWithoutReferer = true,
): Promise<ImageAssetRecord> {
  const normalizedUrl = decodeHtmlEntities(imageUrl)

  // ── URL 清洗：拦截明显非产品图的 URL（提取层误提取的脏数据）──
  const dirtyUrl = sanitizeImageUrl(normalizedUrl)
  if (!dirtyUrl) {
    throw new Error(`图片 URL 是脏数据（JSON片段/clientlibs/favicon），跳过下载: ${normalizedUrl.slice(0, 80)}`)
  }
  
  const tryFetch = async (headers: Record<string, string>) => {
    const response = await fetch(normalizedUrl, { headers })
    if (!response.ok) {
      throw new Error(`下载失败：${response.status}`)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    return { buffer, response }
  }

  let buffer: Buffer, response: Response
  // Encode referer URL to avoid ByteString errors from non-ASCII characters
  const safeReferer = encodeURI(story.sourceUrl)
  try {
    const result = await tryFetch({
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      referer: safeReferer,
    })
    buffer = result.buffer
    response = result.response
  } catch (firstError) {
    if (!retryWithoutReferer) throw firstError
    // Retry without referer (some CDNs block cross-origin referers)
    console.warn(`[imageStore] Download with referer failed, retrying without referer: ${firstError instanceof Error ? firstError.message : String(firstError)}`)
    const result = await tryFetch({
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    buffer = result.buffer
    response = result.response
  }
  const extension = detectExtensionByContent(buffer, response.headers.get('content-type'), normalizedUrl)
  if (isFaviconOrLogo(buffer)) {
    throw new Error(`下载到 favicon/logo 占位图（${buffer.length}B，非产品图），触发回退链`)
  }
  const digest = crypto.createHash('sha1').update(story.fingerprint).digest('hex').slice(0, 12)
  const fileName = `${story.id}-${digest}${extension}`
  const brandDir = path.join(publicImageDir, sanitizeBrand(story.brand))
  await mkdir(brandDir, { recursive: true })
  await writeFile(path.join(brandDir, fileName), buffer)

  return {
    fingerprint: story.fingerprint,
    sourceUrl: normalizedUrl,
    localPath: `/runtime/news-images/${sanitizeBrand(story.brand)}/${fileName}`,
    downloadedAt: new Date().toISOString(),
    sourceSignature,
    mimeType: response.headers.get('content-type') ?? undefined,
    status: 'downloaded',
  }
}

export async function localizeStoryImages(stories: StoredStory[]) {
  const existingAssets = await readImageAssets()
  const nextAssets = [...existingAssets]

  for (const story of stories) {
    // Already localized — skip
    if (story.image?.startsWith('/runtime/news-images/')) {
      continue
    }

    // Bing image search DISABLED — produces contaminated images from random CDNs
    const canSearch = false // isImageSearchAvailable()

    const ruleStory = await findImageRuleForStory(story)
    const sourceSignature = createStorySourceSignature(story)
    const existingLocalMirrorAsset = ruleStory?.acquisition.localMirrorPath
      ? nextAssets.find(
          (asset) =>
            asset.fingerprint === story.fingerprint &&
            asset.localPath === ruleStory.acquisition.localMirrorPath,
        )
      : undefined

    if (
      ruleStory?.automationStatus === 'ready' &&
      ruleStory.acquisition.localMirrorPath &&
      !isPlaceholderVector(ruleStory.acquisition.localMirrorPath) &&
      (await hasLocalMirror(ruleStory.acquisition.localMirrorPath)) &&
      shouldReuseLocalMirror(
        story,
        existingLocalMirrorAsset,
        sourceSignature,
        Boolean(ruleStory.acquisition.candidateImageUrl),
      )
    ) {
      story.image = ruleStory.acquisition.localMirrorPath

      if (!existingLocalMirrorAsset) {
        nextAssets.push({
          fingerprint: story.fingerprint,
          sourceUrl:
            ruleStory.acquisition.candidateImageUrl ?? ruleStory.sourcePage ?? ruleStory.acquisition.localMirrorPath,
          localPath: ruleStory.acquisition.localMirrorPath,
          downloadedAt: new Date().toISOString(),
          sourceSignature,
          status: 'reused',
        })
      } else {
        existingLocalMirrorAsset.status = 'reused'
        existingLocalMirrorAsset.sourceSignature = sourceSignature
      }

      continue
    }

    const preferredImageUrl =
      ruleStory?.acquisition.candidateImageUrl ??
      (!story.image.startsWith('/news/') && !story.image.startsWith('/runtime/news-images/') && story.image ? story.image : null)

    // 兜底：对于 partial 状态的故事，如果 preferredImageUrl 无法获取
    // 但 image-rules 中记录了 localMirrorPath 且本地文件存在，则直接复用
    if (
      !preferredImageUrl &&
      ruleStory?.acquisition.localMirrorPath &&
      !isPlaceholderVector(ruleStory.acquisition.localMirrorPath) &&
      (await hasLocalMirror(ruleStory.acquisition.localMirrorPath))
    ) {
      story.image = ruleStory.acquisition.localMirrorPath

      if (!existingLocalMirrorAsset) {
        nextAssets.push({
          fingerprint: story.fingerprint,
          sourceUrl:
            ruleStory.acquisition.candidateImageUrl ?? ruleStory.sourcePage ?? ruleStory.acquisition.localMirrorPath,
          localPath: ruleStory.acquisition.localMirrorPath,
          downloadedAt: new Date().toISOString(),
          sourceSignature,
          status: 'reused',
        })
      } else {
        existingLocalMirrorAsset.status = 'reused'
        existingLocalMirrorAsset.sourceSignature = sourceSignature
      }

      continue
    }

    const existingAsset = nextAssets.find(
      (asset) =>
        asset.fingerprint === story.fingerprint &&
        asset.status !== 'failed' &&
        !isPlaceholderVector(asset.localPath),
    )
    if (existingAsset) {
      story.image = existingAsset.localPath
      existingAsset.status = 'reused'
      existingAsset.sourceSignature = sourceSignature
      continue
    }

    if (!preferredImageUrl) {
      // 最后手段：用 Playwright 截图（只对有空 sourceUrl 且未截过的故事）
      if (story.sourceUrl && story.sourceUrl.startsWith('http')) {
        try {
          const { execSync } = await import('node:child_process')
          const outputFile = `/runtime/news-images/${sanitizeBrand(story.brand)}/${story.id}-screenshot.jpg`
          const outputPath = `public${outputFile}`
          const result = execSync(
            `python3 scripts/screenshot-product.py "${story.sourceUrl}" "${outputPath}" --brand "${story.brand}" 2>/dev/null`,
            { cwd: process.cwd(), timeout: 35000, encoding: 'utf-8', maxBuffer: 1024 * 100 }
          )
          const parsed = JSON.parse(result)
          if (parsed.ok) {
            story.image = outputFile
            console.log(`[imageStore] 📸 Screenshot saved for ${story.id}: ${outputFile}`)
            nextAssets.push({
              fingerprint: story.fingerprint,
              sourceUrl: story.sourceUrl,
              localPath: outputFile,
              downloadedAt: new Date().toISOString(),
              sourceSignature,
              status: 'downloaded',
            })
            continue
          }
        } catch {
          // Screenshot failed silently — not every site can be screenshotted
        }
      }

      // Try image search as last resort
      if (canSearch && story.products.length > 0) {
        const searchedUrl = await searchBestProductImage(story.brand, story.products)
        if (searchedUrl) {
          try {
            const asset = await downloadImage(story, searchedUrl, sourceSignature)
            nextAssets.push(asset)
            story.image = asset.localPath
            console.log(`[imageSearch] ✅ Saved searched image for ${story.id}: ${asset.localPath}`)
          } catch (error) {
            console.warn(`[imageSearch] ❌ Download failed for searched image of ${story.id}: ${error instanceof Error ? error.message : String(error)}`)
            nextAssets.push({
              fingerprint: story.fingerprint,
              sourceUrl: searchedUrl,
              localPath: story.image || '/',
              downloadedAt: new Date().toISOString(),
              sourceSignature,
              status: 'failed',
              errorMessage: `searched image download failed: ${error instanceof Error ? error.message : String(error)}`,
            })
          }
        }
      }
      continue
    }

    // If the preferred URL is a known bad placeholder, try search first
    let downloadUrl = preferredImageUrl
    if (isBadPlaceholderImage(preferredImageUrl) && canSearch && story.products.length > 0) {
      const searchedUrl = await searchBestProductImage(story.brand, story.products)
      if (searchedUrl) {
        console.log(`[imageSearch] Replacing bad placeholder with searched image for ${story.id}`)
        downloadUrl = searchedUrl
      }
    }

    try {
      const asset = await downloadImage(story, downloadUrl, sourceSignature)
      nextAssets.push(asset)
      story.image = asset.localPath
    } catch (error) {
      nextAssets.push({
        fingerprint: story.fingerprint,
        sourceUrl: downloadUrl,
        localPath: story.image,
        downloadedAt: new Date().toISOString(),
        sourceSignature,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  await writeImageAssets(nextAssets)
}
