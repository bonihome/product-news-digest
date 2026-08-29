/**
 * Seed static stories from beautyNews.ts into the runtime feed for brands
 * that couldn't be crawled by the pipeline.
 *
 * Add new brands to the SEED_BRANDS array below.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const runtimeDir = path.resolve(process.cwd(), 'data/runtime')
const storiesPath = path.join(runtimeDir, 'news-items.json')
const publishedFeedPath = path.join(runtimeDir, 'published-feed.json')
const publicPublishedFeedPath = path.resolve(process.cwd(), 'public/runtime/published-feed.json')

// Brands whose static data should be seeded into runtime
// (brands without crawlable URLs in the pipeline)
const SEED_BRANDS: string[] = [
  'Givenchy Beauty',
  'Chanel',
  'CHANEL Beauty',
  'Louis Vuitton',
  'Prada',
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

async function extractStoriesFromSource(sourcePath: string, brands: string[]): Promise<StaticStory[]> {
  const sourceContent = await readFile(sourcePath, 'utf-8')
  const blocks = sourceContent.split('  {\n')
  const stories: StaticStory[] = []

  for (const block of blocks) {
    const brandMatch = block.match(/brand:\s*'([^']+)'/)
    if (!brandMatch) continue
    if (!brands.includes(brandMatch[1])) continue

    const idMatch = block.match(/id:\s*'([^']+)'/)
    const subcatMatch = block.match(/subcategory:\s*'([^']+)'/)
    const titleMatch = block.match(/title:\s*'([^']+)'/)

    // title can also be double-quoted
    const titleDQMatch = block.match(/title:\s*"([^"]+)"/)
    const categoryMatch = block.match(/category:\s*'([^']+)'/)
    const publishedAtMatch = block.match(/publishedAt:\s*'([^']+)'/)
    const checkedAtMatch = block.match(/checkedAt:\s*'([^']+)'/)
    const sourceTypeMatch = block.match(/sourceType:\s*'([^']+)'/)
    const sourceLabelMatch = block.match(/sourceLabel:\s*'([^']+)'/)
    const sourceUrlMatch = block.match(/sourceUrl:\s*'([^']+)'/)
    const imageMatch = block.match(/image:\s*'([^']+)'/)
    const summaryMatch = block.match(/summary:\s*\n\s+'([^']+)'/)
    const summaryDQMatch = block.match(/summary:\s*\n\s+"([^"]+)"/)
    // products: ['x', 'y'] OR products: ["x", "y"]
    const productsSQMatch = block.match(/products:\s*\[((?:'[^']*'(?:\s*,\s*'[^']*')*)\s*,?\s*)\]/)
    const productsDQMatch = block.match(/products:\s*\[((?:"[^"]*"(?:\s*,\s*"[^"]*")*)\s*,?\s*)\]/)

    if (idMatch && subcatMatch && (titleMatch || titleDQMatch) && publishedAtMatch && checkedAtMatch &&
        sourceTypeMatch && sourceLabelMatch && sourceUrlMatch && imageMatch && (summaryMatch || summaryDQMatch) && (productsSQMatch || productsDQMatch)) {
      const productsRaw = productsSQMatch ? productsSQMatch[1] : productsDQMatch![1]
      const quote = productsSQMatch ? "'" : '"'
      const products = productsRaw
        .split(new RegExp(`\\s*,\\s*${quote}`))
        .map(p => p.replace(new RegExp(`^${quote}`), '').replace(new RegExp(`${quote}$`), '').trim())
        .filter(p => p.length > 0)

      stories.push({
        id: idMatch[1],
        category: categoryMatch ? categoryMatch[1] : 'luxury',
        subcategory: subcatMatch[1],
        brand: brandMatch[1],
        title: titleMatch ? titleMatch[1] : (titleDQMatch ? titleDQMatch[1] : ''),
        publishedAt: publishedAtMatch[1],
        checkedAt: checkedAtMatch[1],
        sourceType: sourceTypeMatch[1] as StaticStory['sourceType'],
        sourceLabel: sourceLabelMatch[1],
        sourceUrl: sourceUrlMatch[1],
        image: imageMatch[1],
        summary: summaryMatch ? summaryMatch[1] : (summaryDQMatch ? summaryDQMatch[1] : ''),
        products,
      })
    }
  }

  return stories
}

async function main() {
  const beautySourcePath = path.resolve(process.cwd(), 'src/data/beautyNews.ts')
  const luxurySourcePath = path.resolve(process.cwd(), 'src/data/luxuryNews.ts')

  const beautyStories = await extractStoriesFromSource(beautySourcePath, SEED_BRANDS)
  const luxuryStories = await extractStoriesFromSource(luxurySourcePath, SEED_BRANDS)
  const newStories = [...beautyStories, ...luxuryStories]

  console.log(`Found ${newStories.length} static stories for brands: ${SEED_BRANDS.join(', ')}`)

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
    // Fix bad dates
    publishedAt: story.publishedAt.startsWith('74') || story.publishedAt.startsWith('71')
      ? '2026-05-10' : story.publishedAt,
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
      // Update existing entry with fresh data so corrections (e.g. removing
      // escaped apostrophes in product names) propagate to the feed.
      const idx = existingStories.findIndex((s) => s.id === story.id)
      if (idx >= 0) {
        existingStories[idx] = story
      }
    }
  }

  console.log(`Added ${addedCount} new stories, ${existingStories.length} total`)

  // Write back
  existingStories.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  await writeFile(storiesPath, JSON.stringify(existingStories, null, 2) + '\n', 'utf-8')

  // Generate published feed
  const feed = {
    generatedAt: new Date().toISOString(),
    source: 'runtime' as const,
    stories: existingStories.map(({ fingerprint, toneVersion, imageSource, sourceTitle, matchedKeywords, ...rest }) => rest),
  }

  await ensureDir(path.dirname(publishedFeedPath))
  await writeFile(publishedFeedPath, JSON.stringify(feed, null, 2) + '\n', 'utf-8')
  await ensureDir(path.dirname(publicPublishedFeedPath))
  await writeFile(publicPublishedFeedPath, JSON.stringify(feed, null, 2) + '\n', 'utf-8')

  console.log('Published feed written successfully!')

  // Summary
  const categories: Record<string, number> = {}
  for (const s of feed.stories) {
    categories[s.category] = (categories[s.category] || 0) + 1
  }
  for (const [cat, count] of Object.entries(categories).sort()) {
    console.log(`  ${cat}: ${count}`)
  }
}

void main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exitCode = 1
})
