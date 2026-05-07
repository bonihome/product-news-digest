import type { BrandSourceRule, CrawlCandidate } from '../types'

export type AiTaskKind = 'extract' | 'judge' | 'write'
export type AiProviderName = 'mock' | 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'custom'

export type AiTaskContext = {
  brandRule: Pick<BrandSourceRule, 'brand' | 'category' | 'subcategory' | 'sourceLabel'>
  candidate: Pick<
    CrawlCandidate,
    'sourceTitle' | 'sourceSummary' | 'sourceUrl' | 'products' | 'publishedAt' | 'matchedKeywords'
  >
}

export type ExtractFactsResult = {
  brand: string
  category: BrandSourceRule['category']
  subcategory: string
  leadProduct: string
  supportProducts: string[]
  launchKeywords: string[]
  sourceTitle: string
  sourceSummary: string
  sourceUrl: string
  publishedAt: string
}

export type JudgeNewsworthinessResult = {
  shouldPublish: boolean
  confidence: number
  reason: string
  signals: string[]
}

export type WriteStoryResult = {
  title: string
  summary: string
  toneNotes: string[]
}

export type AiTaskResultMap = {
  extract: ExtractFactsResult
  judge: JudgeNewsworthinessResult
  write: WriteStoryResult
}

export type AiTaskDefinition<TKind extends AiTaskKind = AiTaskKind> = {
  kind: TKind
  systemPrompt: string
  userPrompt: string
  context: AiTaskContext
  expectedShape: string
}

export type AiProviderRequest<TKind extends AiTaskKind = AiTaskKind> = {
  config: AiProviderConfig
  task: AiTaskDefinition<TKind>
}

export type AiProviderResponse<TKind extends AiTaskKind = AiTaskKind> = {
  provider: AiProviderName
  model: string
  raw: string
  parsed: AiTaskResultMap[TKind]
}

export type AiProviderAdapter = {
  name: AiProviderName
  generate<TKind extends AiTaskKind>(
    request: AiProviderRequest<TKind>,
  ): Promise<AiProviderResponse<TKind>>
}

export type AiProviderConfig = {
  provider: AiProviderName
  model: string
  apiKeyEnv?: string
  baseUrl?: string
  timeoutMs?: number
  enabled: boolean
}

export type AiRouteConfig = {
  primary: AiProviderConfig
  fallbacks: AiProviderConfig[]
}

export type AiTaskRoutes = {
  extract: AiRouteConfig
  judge: AiRouteConfig
  write: AiRouteConfig
}

export type AiTaskExecution<TKind extends AiTaskKind> = {
  task: AiTaskDefinition<TKind>
  response: AiProviderResponse<TKind>
}
