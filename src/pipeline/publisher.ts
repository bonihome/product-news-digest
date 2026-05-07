import { writePublishedFeed } from './runtimeStore'
import type { StoredStory } from './types'

function toPublishedStory(story: StoredStory) {
  return {
    id: story.id,
    category: story.category,
    subcategory: story.subcategory,
    brand: story.brand,
    title: story.title,
    publishedAt: story.publishedAt,
    checkedAt: story.checkedAt,
    sourceType: story.sourceType,
    sourceLabel: story.sourceLabel,
    sourceUrl: story.sourceUrl,
    image: story.image,
    summary: story.summary,
    products: story.products,
  }
}

export async function publishRuntimeFeed(stories: StoredStory[]) {
  const publishedStories = [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  await writePublishedFeed({
    generatedAt: new Date().toISOString(),
    source: 'runtime',
    stories: publishedStories.map(toPublishedStory),
  })
}
