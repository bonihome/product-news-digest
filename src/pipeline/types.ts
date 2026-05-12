import type { ContentCategory, SourceType, Story } from '../data/types'

export type FetchMode = 'html' | 'browser' | 'json'

export type BrandSourceRule = {
  brand: string
  category: ContentCategory
  subcategory: string
  region: 'cn'
  sourceType: SourceType
  listUrl: string
  sourceLabel: string
  fetchMode: FetchMode
  products: string[]
  keywords: string[]
  imageStrategy: 'product-page' | 'gallery-image' | 'page-screenshot' | 'homepage-module'
  cadence: 'wed-sun-twice'
  enabled: boolean
}

export type CrawlCandidate = {
  brand: string
  category: ContentCategory
  subcategory: string
  sourceType: SourceType
  sourceLabel: string
  sourceUrl: string
  sourceTitle: string
  sourceSummary: string
  products: string[]
  image: string
  checkedAt: string
  publishedAt: string
  matchedKeywords: string[]
  imageRuleMethod?: string
  imageRulePriority?: string[]
  imageRuleLocalMirrorPath?: string | null
  imageRuleCandidateImageUrl?: string | null
}

export type BrandProbe = {
  brand: string
  category: ContentCategory
  subcategory: string
  sourceUrl: string
  sourceTitle: string
  publishedAt: string
  products: string[]
  matchedKeywords: string[]
}

export type PipelineRunStatus = 'success' | 'failed' | 'skipped'

export type NewsToneVersion = 'v2' | 'v3'

export type CrawlRunItem = {
  brand: string
  status: PipelineRunStatus
  checkedAt: string
  addedCount: number
  message: string
}

export type CrawlRun = {
  id: string
  startedAt: string
  finishedAt?: string
  mode: 'scheduled' | 'manual'
  dryRun: boolean
  addedCount: number
  items: CrawlRunItem[]
}

export type StoredStory = Story & {
  fingerprint: string
  toneVersion: NewsToneVersion
  imageSource: BrandSourceRule['imageStrategy']
  sourceTitle: string
  matchedKeywords: string[]
}

export type ImageAssetRecord = {
  fingerprint: string
  sourceUrl: string
  localPath: string
  downloadedAt: string
  sourceSignature?: string
  mimeType?: string
  status: 'downloaded' | 'reused' | 'failed'
  errorMessage?: string
}

export type ImageRuleStoryAcquisition = {
  method: string
  priority: string[]
  localMirrorPath: string | null
  candidateImageUrl: string | null
  candidateImageHost: string | null
  notes: string[]
}

export type BrandCrawlRuleEntry = {
  label: string
  subcategory: string
  url: string
  extraction: 'first_product'
}

export type BrandCrawlRule = {
  mode:
    | 'generic_html'
    | 'single_product_page'
    | 'prada_category_pages'
    | 'samsung_buy_pages'
    | 'yonex_mall_pages'
    | 'pacogames_latest_games'
    | 'gamepix_new_games'
    | 'poki_new_games'
    | 'y8_new_games'
    | 'crazygames_new_games'
    | 'arcadrome_home_games'
    | 'nike_trend_pages'
    | 'adidas_home_feed_pages'
    | 'louis_vuitton_latest_pages'
  entryPages: BrandCrawlRuleEntry[]
  fallbackUrl: string | null
  notes: string[]
}

export type ImageRuleStory = {
  storyId: string
  title: string
  category: ContentCategory
  subcategory: string
  products: string[]
  sourceType: SourceType
  sourcePage: string
  currentImage: string
  currentImageMode: 'local' | 'remote'
  currentImageHost: string | null
  automationStatus: 'ready' | 'partial' | 'needs_replacement'
  acquisition: ImageRuleStoryAcquisition
}

export type BrandImageRule = {
  schemaVersion: number
  brand: string
  slug: string
  categories: string[]
  officialDomains: string[]
  remoteImageHosts: string[]
  summary: {
    storyCount: number
    readyCount: number
    partialCount: number
    needsReplacementCount: number
  }
  strategy: {
    brandLevelMethods: string[]
    notes: string[]
  }
  crawl: BrandCrawlRule
  stories: ImageRuleStory[]
}

export type StoryGenerationResult = {
  shouldPublish: boolean
  story: StoredStory | null
  reason: string
  generationMode: 'ai' | 'rules'
}

export type PipelineAlert = {
  runId: string
  createdAt: string
  level: 'warning' | 'error'
  brand: string
  message: string
}

export type BrandSnapshotRecord = {
  brand: string
  snapshotKey: string
  candidateCount: number
  checkedAt: string
  sourceUrls: string[]
  publishedAtValues: string[]
}

export type AnalyticsStoryClickEvent = {
  id: string
  storyId: string
  brand: string
  category: ContentCategory
  subcategory: string
  products: string[]
  visitorId: string
  sessionId: string
  path: string
  clickedAt: string
  referrer?: string
  userAgent?: string
}

export type SiteVisitEvent = {
  id: string
  visitorId: string
  sessionId: string
  path: string
  visitedAt: string
  referrer?: string
  userAgent?: string
}

export type SiteCounterSummary = {
  totalVisitors: number
}

export type BrandTransitionRecord = {
  fromBrand: string
  toBrand: string
  count: number
}

export type WeeklyAnalyticsReport = {
  id: string
  generatedAt: string
  windowStart: string
  windowEnd: string
  totalClicks: number
  brandClicks: Array<{ brand: string; clicks: number }>
  productClicks: Array<{ brand: string; product: string; clicks: number }>
  topBrandTransitions: BrandTransitionRecord[]
}
