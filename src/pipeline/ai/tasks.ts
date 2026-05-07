import type { CrawlCandidate, BrandSourceRule } from '../types'
import type {
  AiTaskContext,
  AiTaskDefinition,
  ExtractFactsResult,
  JudgeNewsworthinessResult,
} from './types'

function buildContext(rule: BrandSourceRule, candidate: CrawlCandidate): AiTaskContext {
  return {
    brandRule: {
      brand: rule.brand,
      category: rule.category,
      subcategory: rule.subcategory,
      sourceLabel: rule.sourceLabel,
    },
    candidate: {
      sourceTitle: candidate.sourceTitle,
      sourceSummary: candidate.sourceSummary,
      sourceUrl: candidate.sourceUrl,
      products: candidate.products,
      publishedAt: candidate.publishedAt,
      matchedKeywords: candidate.matchedKeywords,
    },
  }
}

export function createExtractTask(rule: BrandSourceRule, candidate: CrawlCandidate): AiTaskDefinition<'extract'> {
  const context = buildContext(rule, candidate)

  return {
    kind: 'extract',
    context,
    expectedShape:
      'JSON with brand, category, subcategory, leadProduct, supportProducts, launchKeywords, sourceTitle, sourceSummary, sourceUrl, publishedAt.',
    systemPrompt:
      '你是消费品牌新闻的数据编辑，只负责从官网候选内容中抽取事实，不要写评论，不要补充未出现的信息。',
    userPrompt: [
      `品牌：${rule.brand}`,
      `大类：${rule.category}`,
      `子类：${rule.subcategory}`,
      `来源标题：${candidate.sourceTitle}`,
      `来源摘要：${candidate.sourceSummary}`,
      `产品名：${candidate.products.join('、')}`,
      `发布日期：${candidate.publishedAt}`,
      `关键词：${candidate.matchedKeywords.join('、')}`,
      `来源链接：${candidate.sourceUrl}`,
    ].join('\n'),
  }
}

export function createJudgeTask(
  rule: BrandSourceRule,
  candidate: CrawlCandidate,
  facts: ExtractFactsResult,
): AiTaskDefinition<'judge'> {
  const context = buildContext(rule, candidate)

  return {
    kind: 'judge',
    context,
    expectedShape: 'JSON with shouldPublish, confidence, reason, signals.',
    systemPrompt:
      '你是新品新闻编辑台的发布判断器。只判断这条内容是否值得发布为新品新闻，不要改写新闻稿。',
    userPrompt: [
      `品牌：${facts.brand}`,
      `大类：${facts.category}`,
      `子类：${facts.subcategory}`,
      `主产品：${facts.leadProduct}`,
      `辅助产品：${facts.supportProducts.join('、') || '无'}`,
      `来源标题：${facts.sourceTitle}`,
      `来源摘要：${facts.sourceSummary}`,
      `发布时间：${facts.publishedAt}`,
      `来源链接：${facts.sourceUrl}`,
      '判断标准：是否明确属于新品发布、系列扩容、规格更新、产品主推内容。',
    ].join('\n'),
  }
}

export function createWriteTask(
  rule: BrandSourceRule,
  candidate: CrawlCandidate,
  facts: ExtractFactsResult,
  judgement: JudgeNewsworthinessResult,
): AiTaskDefinition<'write'> {
  const context = buildContext(rule, candidate)

  return {
    kind: 'write',
    context,
    expectedShape: 'JSON with title, summary, toneNotes.',
    systemPrompt:
      '你是新品新闻聚合站编辑。请用新闻语气生成标题和摘要，不要写成监控报告，不要出现“官网把某产品放在首页”这类表达。',
    userPrompt: [
      `品牌：${facts.brand}`,
      `大类：${facts.category}`,
      `子类：${facts.subcategory}`,
      `主产品：${facts.leadProduct}`,
      `辅助产品：${facts.supportProducts.join('、') || '无'}`,
      `来源标题：${facts.sourceTitle}`,
      `来源摘要：${facts.sourceSummary}`,
      `发布时间：${facts.publishedAt}`,
      `是否建议发布：${judgement.shouldPublish ? '是' : '否'}`,
      `判断理由：${judgement.reason}`,
      '语气要求：奢侈品更像时尚商业媒体，彩妆更像新品发布稿，运动更像装备更新稿，数码更像消费科技新闻。',
    ].join('\n'),
  }
}
