import { getAiRetryCount } from './config'
import { createProviderAdapter } from './providers'
import { createExtractTask, createJudgeTask, createWriteTask } from './tasks'
import type { BrandSourceRule, CrawlCandidate } from '../types'
import type {
  AiProviderConfig,
  AiTaskExecution,
  AiTaskKind,
  AiTaskResultMap,
  AiTaskRoutes,
  ExtractFactsResult,
  JudgeNewsworthinessResult,
} from './types'

async function executeWithProvider<TKind extends AiTaskKind>(
  config: AiProviderConfig,
  task: AiTaskExecution<TKind>['task'],
): Promise<AiTaskExecution<TKind>> {
  const adapter = createProviderAdapter(config.provider)
  const response = await adapter.generate({
    config,
    task,
  })

  return {
    task,
    response,
  }
}

async function executeWithFallbacks<TKind extends AiTaskKind>(
  route: { primary: AiProviderConfig; fallbacks: AiProviderConfig[] },
  task: AiTaskExecution<TKind>['task'],
) {
  const providers = [route.primary, ...route.fallbacks].filter((item) => item.enabled)
  let lastError: Error | null = null
  const retryCount = getAiRetryCount()

  for (const provider of providers) {
    for (let attempt = 1; attempt <= retryCount; attempt += 1) {
      try {
        return await executeWithProvider(provider, task)
      } catch (error) {
        const baseError = error instanceof Error ? error : new Error('未知 AI provider 错误')
        lastError = new Error(`${provider.provider}/${provider.model} 第 ${attempt} 次尝试失败：${baseError.message}`)
      }
    }
  }

  throw lastError ?? new Error('没有可用的 AI provider')
}

export class AiTaskOrchestrator {
  private readonly routes: AiTaskRoutes

  constructor(routes: AiTaskRoutes) {
    this.routes = routes
  }

  async runExtract(rule: BrandSourceRule, candidate: CrawlCandidate) {
    const task = createExtractTask(rule, candidate)
    return executeWithFallbacks(this.routes.extract, task)
  }

  async runJudge(rule: BrandSourceRule, candidate: CrawlCandidate, facts: ExtractFactsResult) {
    const task = createJudgeTask(rule, candidate, facts)
    return executeWithFallbacks(this.routes.judge, task)
  }

  async runWrite(
    rule: BrandSourceRule,
    candidate: CrawlCandidate,
    facts: ExtractFactsResult,
    judgement: JudgeNewsworthinessResult,
  ) {
    const task = createWriteTask(rule, candidate, facts, judgement)
    return executeWithFallbacks(this.routes.write, task)
  }

  async runAll(rule: BrandSourceRule, candidate: CrawlCandidate) {
    const extractExecution = await this.runExtract(rule, candidate)
    const judgeExecution = await this.runJudge(rule, candidate, extractExecution.response.parsed)
    const writeExecution = await this.runWrite(
      rule,
      candidate,
      extractExecution.response.parsed,
      judgeExecution.response.parsed,
    )

    return {
      extract: extractExecution,
      judge: judgeExecution,
      write: writeExecution,
    } as {
      extract: AiTaskExecution<'extract'>
      judge: AiTaskExecution<'judge'>
      write: AiTaskExecution<'write'>
    }
  }
}

export function pickTaskResult<TKind extends AiTaskKind>(execution: AiTaskExecution<TKind>) {
  return execution.response.parsed as AiTaskResultMap[TKind]
}
