/**
 * Seed new luxury brand static stories into the runtime feed.
 * These brands may not have working crawl URLs (yet),
 * so we inject the static data directly into the runtime feed.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const runtimeDir = path.resolve(process.cwd(), 'data/runtime')
const storiesPath = path.join(runtimeDir, 'news-items.json')
const publishedFeedPath = path.join(runtimeDir, 'published-feed.json')
const publicPublishedFeedPath = path.resolve(process.cwd(), 'public/runtime/published-feed.json')
const imageDir = path.resolve(process.cwd(), 'public/runtime/news-images')

// The new luxury brands we want to seed (must match brand names in luxuryNews.ts)
const NEW_LUXURY_BRANDS = [
  'Alexander McQueen',
  'Audemars Piguet',
  'Balenciaga',
  'Bottega Veneta',
  'Celine',
  'Chopard',
  'Fendi',
  'Givenchy',
  'Hublot',
  'Loewe',
  'Miu Miu',
  'Montblanc',
  'Rolex',
  'Saint Laurent',
  'TAG Heuer',
  'Valentino',
  'Van Cleef & Arpels',
  'Versace',
]

interface StaticStory {
  id: string
  category: string
  subcategory: string
  brand: string
  title: string
  publishedAt: string
  checkedAt: string
  sourceType: string
  sourceLabel: string
  sourceUrl: string
  image: string
  summary: string
  products: string[]
}

interface StoredStory extends StaticStory {
  fingerprint: string
  toneVersion: string
  imageSource: string
  sourceTitle: string
  matchedKeywords: string[]
}

function createFingerprint(story: StaticStory): string {
  const raw = `${story.brand}|${story.subcategory}|${story.products.slice(0, 2).join('|')}`
  return createHash('sha256').update(raw).digest('hex')
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

async function main() {
  // Read luxuryNews.ts to extract stories for the new brands
  const sourcePath = path.resolve(process.cwd(), 'src/data/luxuryNews.ts')
  const sourceContent = await readFile(sourcePath, 'utf-8')

  // Simple extraction by splitting on brand pattern
  const blocks = sourceContent.split('  {\n')
  const newStories: StaticStory[] = []

  for (const block of blocks) {
    if (!block.includes("category: 'luxury'")) continue

    const brandMatch = block.match(/brand:\s*'([^']+)'/)
    if (!brandMatch) continue
    const brand = brandMatch[1]
    if (!NEW_LUXURY_BRANDS.includes(brand)) continue

    const idMatch = block.match(/id:\s*'([^']+)'/)
    const subcatMatch = block.match(/subcategory:\s*'([^']+)'/)
    const titleMatch = block.match(/title:\s*(?:'([^']+)'|"([^"]+)")/)
    const publishedAtMatch = block.match(/publishedAt:\s*'([^']+)'/)
    const checkedAtMatch = block.match(/checkedAt:\s*'([^']+)'/)
    const sourceTypeMatch = block.match(/sourceType:\s*'([^']+)'/)
    const sourceLabelMatch = block.match(/sourceLabel:\s*'([^']+)'/)
    const sourceUrlMatch = block.match(/sourceUrl:\s*'([^']+)'/)
    const imageMatch = block.match(/image:\s*'([^']+)'/)
    const summaryMatch = block.match(/summary:\s*\n\s+'([^']+)'/)
    const productsMatch = block.match(/products:\s*\[([^\]]+)\]/)

    if (idMatch && subcatMatch && titleMatch && publishedAtMatch && checkedAtMatch &&
        sourceTypeMatch && sourceLabelMatch && sourceUrlMatch && imageMatch && summaryMatch && productsMatch) {
      const products = productsMatch[1].split(',').map(p =>
        p.trim().replace(/^'/, '').replace(/'$/, '')
      )

      newStories.push({
        id: idMatch[1],
        category: 'luxury',
        subcategory: subcatMatch[1],
        brand,
        title: titleMatch[1] || titleMatch[2],
        publishedAt: publishedAtMatch[1],
        checkedAt: checkedAtMatch[1],
        sourceType: sourceTypeMatch[1] as StaticStory['sourceType'],
        sourceLabel: sourceLabelMatch[1],
        sourceUrl: sourceUrlMatch[1],
        image: imageMatch[1],
        summary: summaryMatch[1],
        products,
      })
    }
  }

  console.log(`Found ${newStories.length} static stories for new luxury brands`)

  if (newStories.length === 0) {
    console.log('No new stories to seed.')
    return
  }

  // Convert to stored story format
  const storedStories: StoredStory[] = newStories.map((story) => ({
    ...story,
    fingerprint: createFingerprint(story),
    toneVersion: 'v3',
    imageSource: 'product-page',
    sourceTitle: `${story.brand} 中国官网`,
    matchedKeywords: [story.subcategory, ...story.products.slice(0, 2)],
  }))

  // Read existing runtime stories
  const existingStories = await readJson<StoredStory[]>(storiesPath, [])

  // Merge: add stories that don't already exist (by id)
  const existingIds = new Set(existingStories.map((s) => s.id))
  let addedCount = 0

  for (const story of storedStories) {
    if (!existingIds.has(story.id)) {
      existingStories.push(story)
      existingIds.add(story.id)
      addedCount++
    } else {
      // Update existing entry with fresh data
      const idx = existingStories.findIndex((s) => s.id === story.id)
      if (idx >= 0) {
        existingStories[idx] = story
      }
    }
  }

  console.log(`Added ${addedCount} new stories, ${existingStories.length} total`)

  // Create placeholder image directories for new brands
  await ensureDir(imageDir)
  for (const brand of NEW_LUXURY_BRANDS) {
    const brandDirName = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
    const brandImageDir = path.join(imageDir, brandDirName)
    await ensureDir(brandImageDir)
  }

  // Write back
  existingStories.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  await writeFile(storiesPath, JSON.stringify(existingStories, null, 2) + '\n', 'utf-8')

  // Generate published feed
  const feed = {
    generatedAt: new Date().toISOString(),
    source: 'runtime' as const,
    stories: existingStories.map(({ fingerprint, toneVersion, imageSource, sourceTitle, matchedKeywords, ...rest }) => rest),
  }

  await writeFile(publishedFeedPath, JSON.stringify(feed, null, 2) + '\n', 'utf-8')
  await writeFile(publicPublishedFeedPath, JSON.stringify(feed, null, 2) + '\n', 'utf-8')

  // Also copy to dist
  const distRuntimeDir = path.resolve(process.cwd(), 'dist/runtime')
  await ensureDir(distRuntimeDir)
  await writeFile(path.join(distRuntimeDir, 'published-feed.json'), JSON.stringify(feed, null, 2) + '\n', 'utf-8')

  // Copy image symlinks/placeholders for new brands to dist
  for (const brand of NEW_LUXURY_BRANDS) {
    const brandDirName = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
    const distBrandDir = path.join(distRuntimeDir, 'news-images', brandDirName)
    await ensureDir(distBrandDir)
  }

  console.log('Published feed written successfully!')
  console.log(`Final luxury count: ${feed.stories.filter((s) => s.category === 'luxury').length}`)
}

void main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exitCode = 1
})
