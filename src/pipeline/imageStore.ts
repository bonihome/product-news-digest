import crypto from 'node:crypto'
import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'

import { findImageRuleForStory, hasLocalMirror } from './imageRules'
import { readImageAssets, writeImageAssets } from './runtimeStore'
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

function isPlaceholderVector(pathOrUrl: string) {
  return pathOrUrl.toLowerCase().endsWith('.svg')
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
): Promise<ImageAssetRecord> {
  const normalizedUrl = decodeHtmlEntities(imageUrl)
  const response = await fetch(normalizedUrl, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      referer: story.sourceUrl,
    },
  })

  if (!response.ok) {
    throw new Error(`下载失败：${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const extension = detectExtension(response.headers.get('content-type'), normalizedUrl)
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
    if (!story.image || story.image.startsWith('/runtime/news-images/')) {
      continue
    }

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
      (!story.image.startsWith('/news/') && !story.image.startsWith('/runtime/news-images/') ? story.image : null)

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
      continue
    }

    try {
      const asset = await downloadImage(story, preferredImageUrl, sourceSignature)
      nextAssets.push(asset)
      story.image = asset.localPath
    } catch (error) {
      nextAssets.push({
        fingerprint: story.fingerprint,
        sourceUrl: preferredImageUrl,
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
