import type { AiProviderConfig, AiTaskKind, AiTaskRoutes } from './types'

function readTimeout(task: AiTaskKind) {
  const upperTask = task.toUpperCase()
  const rawValue = process.env[`AI_${upperTask}_TIMEOUT_MS`] ?? process.env.AI_TASK_TIMEOUT_MS ?? '20000'
  const timeoutMs = Number(rawValue)
  return Number.isFinite(timeoutMs) ? timeoutMs : 20000
}

export function getAiRetryCount() {
  const value = Number(process.env.AI_PROVIDER_RETRY_COUNT ?? '2')
  return Number.isFinite(value) && value > 0 ? value : 2
}

function readProviderConfig(task: AiTaskKind, fallbackProvider = 'mock', fallbackModel = 'mock-v1'): AiProviderConfig {
  const upperTask = task.toUpperCase()
  const provider = (process.env[`AI_${upperTask}_PROVIDER`] ?? fallbackProvider) as AiProviderConfig['provider']
  const model =
    process.env[`AI_${upperTask}_MODEL`] ?? process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? fallbackModel
  const apiKeyEnv =
    process.env[`AI_${upperTask}_API_KEY_ENV`] ??
    process.env.AI_API_KEY_ENV ??
    (provider === 'openai' ? 'OPENAI_API_KEY' : undefined)
  const baseUrl =
    process.env[`AI_${upperTask}_BASE_URL`] ??
    process.env.AI_BASE_URL ??
    (provider === 'openai' ? process.env.OPENAI_BASE_URL : undefined)

  return {
    provider,
    model,
    apiKeyEnv,
    baseUrl,
    timeoutMs: readTimeout(task),
    enabled: true,
  }
}

function readFallbacks(task: AiTaskKind): AiProviderConfig[] {
  const upperTask = task.toUpperCase()
  const fallbackProvider = process.env[`AI_${upperTask}_FALLBACK_PROVIDER`]
  const fallbackModel = process.env[`AI_${upperTask}_FALLBACK_MODEL`]

  if (!fallbackProvider || !fallbackModel) {
    return []
  }

  return [
    {
      provider: fallbackProvider as AiProviderConfig['provider'],
      model: fallbackModel,
      apiKeyEnv:
        process.env[`AI_${upperTask}_FALLBACK_API_KEY_ENV`] ??
        process.env.AI_API_KEY_ENV ??
        (fallbackProvider === 'openai' ? 'OPENAI_API_KEY' : undefined),
      baseUrl:
        process.env[`AI_${upperTask}_FALLBACK_BASE_URL`] ??
        process.env.AI_BASE_URL ??
        (fallbackProvider === 'openai' ? process.env.OPENAI_BASE_URL : undefined),
      timeoutMs: readTimeout(task),
      enabled: true,
    },
  ]
}

export function loadAiTaskRoutes(): AiTaskRoutes {
  return {
    extract: {
      primary: readProviderConfig('extract'),
      fallbacks: readFallbacks('extract'),
    },
    judge: {
      primary: readProviderConfig('judge'),
      fallbacks: readFallbacks('judge'),
    },
    write: {
      primary: readProviderConfig('write'),
      fallbacks: readFallbacks('write'),
    },
  }
}
