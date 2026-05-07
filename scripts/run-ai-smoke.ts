import { brandSources } from '../src/pipeline/brandSources'
import { fetchCandidatesForBrand } from '../src/pipeline/fetchCandidates'
import { loadAiTaskRoutes, AiTaskOrchestrator } from '../src/pipeline/ai'

async function main() {
  const rule = brandSources.find((item) => item.brand === 'Apple')
  if (!rule) {
    throw new Error('未找到 Apple 品牌规则')
  }

  const candidates = await fetchCandidatesForBrand(rule)
  const candidate = candidates[0]

  if (!candidate) {
    throw new Error('未生成候选新闻')
  }

  const orchestrator = new AiTaskOrchestrator(loadAiTaskRoutes())
  const result = await orchestrator.runAll(rule, candidate)

  console.log('AI smoke run completed')
  console.log(`Provider extract: ${result.extract.response.provider} / ${result.extract.response.model}`)
  console.log(`Provider judge: ${result.judge.response.provider} / ${result.judge.response.model}`)
  console.log(`Provider write: ${result.write.response.provider} / ${result.write.response.model}`)
  console.log(JSON.stringify(result, null, 2))
}

void main().catch((error) => {
  console.error('AI smoke run failed')
  console.error(error)
  process.exitCode = 1
})
