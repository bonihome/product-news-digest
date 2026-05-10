export type CategoryId = 'all' | 'luxury' | 'beauty' | 'sports' | 'digital' | 'webgames'
export type ContentCategory = Exclude<CategoryId, 'all'>
export type SourceType = 'Official Site' | 'New Arrivals' | 'Official News'

export type Story = {
  id: string
  category: ContentCategory
  subcategory: string
  brand: string
  title: string
  publishedAt: string
  checkedAt: string
  sourceType: SourceType
  sourceLabel: string
  sourceUrl: string
  image: string
  summary: string
  products: string[]
}

export type PublishedFeed = {
  generatedAt: string
  source: 'runtime'
  stories: Story[]
}
