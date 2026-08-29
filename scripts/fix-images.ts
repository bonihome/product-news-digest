/**
 * Fix images for existing stories by running image search fallback.
 * Reads all stories from data/runtime/news-items.json, runs localizeStoryImages,
 * then publishes to the runtime feed.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { localizeStoryImages } from '../src/pipeline/imageStore.js'
import type { StoredStory } from '../src/pipeline/types.js'

const runtimeDir = path.resolve(process.cwd(), 'data/runtime')
const storiesPath = path.join(runtimeDir, 'news-items.json')
const publishedFeedPath = path.join(runtimeDir, 'published-feed.json')
const publicPublishedFeedPath = path.resolve(process.cwd(), 'public/runtime/published-feed.json')

async function main() {
  console.log('Reading stories...')
  const raw = await readFile(storiesPath, 'utf8')
  const stories: StoredStory[] = JSON.parse(raw)
  console.log(`Found ${stories.length} stories`)

  // Count stories that need fixing
  const needsFix = stories.filter(s => {
    if (!s.image) return true
    if (s.image.startsWith('/news/')) return true
    if (s.image.includes('t_default') || s.image.includes('t_prod')) return true
    return false
  })
  console.log(`${needsFix.length} stories need image fix`)

  // Run image localization (which now includes search fallback)
  console.log('Running image localization with search fallback...')
  await localizeStoryImages(stories)

  // Count how many were fixed
  const fixed = stories.filter(s => {
    return s.image && !s.image.startsWith('/news/') && s.image.startsWith('/runtime/')
  })
  console.log(`${fixed.length} stories now have localized images`)

  // Save updated stories
  await writeFile(storiesPath, JSON.stringify(stories, null, 2))
  console.log('Saved updated stories')

  // Build and publish the feed
  const feed = stories.map(s => ({
    id: s.id,
    category: s.category,
    subcategory: s.subcategory,
    brand: s.brand,
    title: s.title,
    publishedAt: s.publishedAt,
    checkedAt: s.checkedAt,
    sourceType: s.sourceType,
    sourceLabel: s.sourceLabel,
    sourceUrl: s.sourceUrl,
    image: s.image,
    summary: s.summary,
    products: s.products,
  }))

  const feedPayload = {
    generatedAt: new Date().toISOString(),
    source: 'runtime',
    stories: feed,
  }

  await writeFile(publishedFeedPath, JSON.stringify(feedPayload, null, 2))
  await mkdir(path.dirname(publicPublishedFeedPath), { recursive: true })
  await writeFile(publicPublishedFeedPath, JSON.stringify(feedPayload))
  console.log(`Published feed with ${feed.length} stories`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
