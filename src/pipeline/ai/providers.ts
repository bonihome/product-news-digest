import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiProviderRequest,
  AiProviderResponse,
  AiTaskKind,
  AiTaskResultMap,
  ExtractFactsResult,
} from './types'

function cleanTitle(sourceTitle: string) {
  return sourceTitle
    .replace(/\s*\|\s*Apple\s*\(中国大陆\)\s*$/i, '')
    .replace(/\s*\|\s*SHISEIDO\s*$/i, '')
    .replace(/\s*\|\s*adidas\s*阿迪达斯官方旗舰店\s*$/i, '')
    .replace(/\s*\|\s*Hermès\s*-\s*爱马仕官网\s*$/i, '')
    .replace(/\s*\|\s*Wilson Sporting Goods\s*$/i, '')
    .replace(/\s*\|\s*Microsoft Surface\s*$/i, '')
    .replace(/\s*\|\s*路易威登LOUIS VUITTON官方线上旗舰店\s*$/i, '')
    .trim()
}

function joinProducts(items: string[]) {
  if (items.length === 0) {
    return ''
  }
  if (items.length === 1) {
    return items[0]
  }
  if (items.length === 2) {
    return `${items[0]}和${items[1]}`
  }
  return `${items.slice(0, -1).join('、')}和${items.at(-1)}`
}

function buildExtractResult(request: AiProviderRequest<'extract'>): ExtractFactsResult {
  const { brandRule, candidate } = request.task.context
  return {
    brand: brandRule.brand,
    category: brandRule.category,
    subcategory: brandRule.subcategory,
    leadProduct: candidate.products[0] ?? `${brandRule.subcategory}新品`,
    supportProducts: candidate.products.slice(1, 3),
    launchKeywords: candidate.matchedKeywords.slice(0, 4),
    sourceTitle: cleanTitle(candidate.sourceTitle),
    sourceSummary: candidate.sourceSummary,
    sourceUrl: candidate.sourceUrl,
    publishedAt: candidate.publishedAt,
  }
}

function buildMockResponse<TKind extends AiTaskKind>(
  request: AiProviderRequest<TKind>,
): AiProviderResponse<TKind> {
  switch (request.task.kind) {
    case 'extract': {
      const parsed = buildExtractResult(request as AiProviderRequest<'extract'>)
      return {
        provider: request.config.provider,
        model: request.config.model,
        raw: JSON.stringify(parsed),
        parsed,
      } as AiProviderResponse<TKind>
    }
    case 'judge': {
      const parsed = {
        shouldPublish: true,
        confidence: 0.86,
        reason: '来源内容明确指向新品或当季重点单品，适合发布为结构化新品新闻。',
        signals: ['官方来源', '明确产品名', '可用产品图'],
      }
      return {
        provider: request.config.provider,
        model: request.config.model,
        raw: JSON.stringify(parsed),
        parsed,
      } as AiProviderResponse<TKind>
    }
    case 'write': {
      const candidate = request.task.context.candidate
      const brand = request.task.context.brandRule.brand
      const lead = candidate.products[0] ?? '新品'
      const support = joinProducts(candidate.products.slice(1, 3))
      const parsed = {
        title: `${brand} 推出 ${lead}，${request.task.context.brandRule.subcategory}新品阵容继续扩展`,
        summary: support
          ? `${brand} 本轮围绕 ${lead} 展开更新，并联动 ${support} 进一步完善当季新品组合。`
          : `${brand} 本轮围绕 ${lead} 展开更新，继续完善当季新品组合。`,
        toneNotes: ['newsroom-style', 'reader-facing', 'no-monitoring-language'],
      }
      return {
        provider: request.config.provider,
        model: request.config.model,
        raw: JSON.stringify(parsed),
        parsed,
      } as AiProviderResponse<TKind>
    }
  }
}

function getApiKey(config: AiProviderConfig) {
  if (!config.apiKeyEnv) {
    throw new Error(`provider ${config.provider} 缺少 apiKeyEnv 配置`)
  }

  const apiKey = process.env[config.apiKeyEnv]
  if (!apiKey) {
    throw new Error(`环境变量 ${config.apiKeyEnv} 未设置`)
  }

  return apiKey
}

function buildMessages(request: AiProviderRequest) {
  return [
    { role: 'system', content: request.task.systemPrompt },
    { role: 'user', content: `${request.task.userPrompt}\n\n输出要求：${request.task.expectedShape}` },
  ]
}

function extractJsonBlock(content: string) {
  const fenced = content.match(/```json\s*([\s\S]*?)```/i)?.[1]
  if (fenced) {
    return fenced.trim()
  }

  const jsonStart = content.indexOf('{')
  const jsonEnd = content.lastIndexOf('}')
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    return content.slice(jsonStart, jsonEnd + 1)
  }

  return content.trim()
}

function normalizeConfidence(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const lowered = value.toLowerCase()
    if (lowered === 'high') {
      return 0.9
    }
    if (lowered === 'medium') {
      return 0.6
    }
    if (lowered === 'low') {
      return 0.3
    }

    const asNumber = Number(value)
    if (!Number.isNaN(asNumber)) {
      return asNumber
    }
  }

  return 0.5
}

function normalizeToneNotes(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String)
  }

  if (typeof value === 'string') {
    return [value]
  }

  return []
}

function normalizeParsed<TKind extends AiTaskKind>(kind: TKind, parsed: unknown): AiTaskResultMap[TKind] {
  if (kind === 'judge') {
    const value = parsed as Record<string, unknown>
    return {
      shouldPublish: Boolean(value.shouldPublish),
      confidence: normalizeConfidence(value.confidence),
      reason: typeof value.reason === 'string' ? value.reason : '',
      signals: Array.isArray(value.signals) ? value.signals.map(String) : [],
    } as AiTaskResultMap[TKind]
  }

  if (kind === 'write') {
    const value = parsed as Record<string, unknown>
    return {
      title: typeof value.title === 'string' ? value.title : '',
      summary: typeof value.summary === 'string' ? value.summary : '',
      toneNotes: normalizeToneNotes(value.toneNotes),
    } as AiTaskResultMap[TKind]
  }

  return parsed as AiTaskResultMap[TKind]
}

function parseProviderJson<TKind extends AiTaskKind>(kind: TKind, content: string): AiTaskResultMap[TKind] {
  const jsonBlock = extractJsonBlock(content)
  return normalizeParsed(kind, JSON.parse(jsonBlock))
}

class OpenAiCompatibleProvider implements AiProviderAdapter {
  name = 'openai' as const

  async generate<TKind extends AiTaskKind>(
    request: AiProviderRequest<TKind>,
  ): Promise<AiProviderResponse<TKind>> {
    const { config } = request
    if (!config.baseUrl) {
      throw new Error('openai-compatible provider 缺少 baseUrl')
    }

    const apiKey = getApiKey(config)
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(config.timeoutMs ?? 20000),
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: buildMessages(request),
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`openai-compatible 调用失败：${response.status}`)
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string
        }
      }>
    }

    const raw = payload.choices?.[0]?.message?.content?.trim()
    if (!raw) {
      throw new Error('openai-compatible 返回内容为空')
    }

    return {
      provider: config.provider,
      model: config.model,
      raw,
      parsed: parseProviderJson(request.task.kind, raw),
    }
  }
}

export class MockAiProvider implements AiProviderAdapter {
  name = 'mock' as const

  async generate<TKind extends AiTaskKind>(
    request: AiProviderRequest<TKind>,
  ): Promise<AiProviderResponse<TKind>> {
    return buildMockResponse(request)
  }
}

export class UnsupportedRemoteProvider implements AiProviderAdapter {
  readonly name: AiProviderAdapter['name']

  constructor(name: AiProviderAdapter['name']) {
    this.name = name
  }

  async generate<TKind extends AiTaskKind>(
    request: AiProviderRequest<TKind>,
  ): Promise<AiProviderResponse<TKind>> {
    throw new Error(`当前 provider ${request.config.provider} 还未接入真实 API 客户端。`)
  }
}

export function createProviderAdapter(provider: AiProviderConfig['provider']): AiProviderAdapter {
  if (provider === 'mock') {
    return new MockAiProvider()
  }

  if (provider === 'openai') {
    return new OpenAiCompatibleProvider()
  }

  return new UnsupportedRemoteProvider(provider)
}
