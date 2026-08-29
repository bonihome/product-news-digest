/**
 * 从 news-items.json 重新生成 published-feed.json。
 * 在 fill-empty-images 之后调用，确保构建时图片路径是最新的。
 *
 * 用法: npx tsx scripts/regen-published-feed.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '/srv/product-news-digest'
const NEWS_ITEMS_PATH = join(ROOT, 'data/runtime/news-items.json')
const PUBLISHED_FEED_PATH = join(ROOT, 'data/runtime/published-feed.json')
const PUBLIC_PUBLISHED_FEED_PATH = join(ROOT, 'public/runtime/published-feed.json')

interface Story {
  id: string
  category: string
  subcategory: string
  brand: string
  title: string
  publishedAt: string
  checkedAt: string
  sourceType: string
  sourceLabel: string
  sourceUrl?: string
  image: string
  summary: string
  products: string[]
}

interface PublishedFeed {
  generatedAt: string
  source: string
  stories: Story[]
}

function main() {
  const items: Story[] = JSON.parse(readFileSync(NEWS_ITEMS_PATH, 'utf-8'))
  const feedFields = [
    'id', 'category', 'subcategory', 'brand', 'title',
    'publishedAt', 'checkedAt', 'sourceType', 'sourceLabel',
    'sourceUrl', 'image', 'summary', 'products',
  ]

  const feed: PublishedFeed = {
    generatedAt: new Date().toISOString(),
    source: 'regen-published-feed',
    stories: items.map((item) => {
      const story: any = {}
      for (const k of feedFields) {
        if (k in item) story[k] = (item as any)[k]
      }
      return story as Story
    }),
  }

  const payload = JSON.stringify(feed, null, 2)

  writeFileSync(PUBLISHED_FEED_PATH, payload)
  writeFileSync(PUBLIC_PUBLISHED_FEED_PATH, payload)

  console.log(`[regen-published-feed] Regenerated ${feed.stories.length} stories -> published-feed.json`)
}

main()
