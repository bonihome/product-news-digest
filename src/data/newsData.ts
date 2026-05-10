import { beautyNews } from './beautyNews'
import { digitalNews } from './digitalNews'
import { luxuryNews } from './luxuryNews'
import { sportsNews } from './sportsNews'
import { webgamesNews } from './webgamesNews'
import type { CategoryId, ContentCategory, Story } from './types'

export type { CategoryId, ContentCategory, PublishedFeed, Story } from './types'

export const categoryLabels: Record<CategoryId, string> = {
  all: '全部',
  luxury: '奢侈品',
  beauty: '彩妆',
  sports: '运动',
  digital: '数码',
  webgames: '网页游戏',
}

export const categoryDescriptions: Record<ContentCategory, string> = {
  luxury: '围绕腕表、珠宝、皮包、服装四条线，持续追踪奢侈品牌官网最新发布。',
  beauty: '按护肤、彩妆与香水三条线整理品牌新品，把最值得关注的官方更新汇总成一页频道。',
  sports: '聚焦足球、篮球、网球、跑步、户外、游泳与运动休闲七类运动产品，把品牌发售与新品系列做成可浏览的新闻频道。',
  digital: '围绕手机、平板、电脑、配件四个方向，收录科技品牌近期最重要的新品新闻。',
  webgames: '围绕网页游戏平台的新作上架、首页新游与最新可玩作品，持续整理轻量游戏网站的新品动态。',
}

export const subcategories: Record<ContentCategory, string[]> = {
  luxury: ['腕表', '珠宝', '皮包', '服装'],
  beauty: ['护肤', '彩妆', '香水'],
  sports: ['足球', '篮球', '网球', '跑步', '户外', '游泳', '运动休闲'],
  digital: ['手机', '平板', '电脑', '配件'],
  webgames: ['新游'],
}

export const stories: Story[] = [...webgamesNews, ...digitalNews, ...luxuryNews, ...beautyNews, ...sportsNews]

export function composeStoryFeed(runtimeStories: Story[] = []) {
  const merged = [...runtimeStories, ...stories]
  const seen = new Set<string>()

  return merged.filter((story) => {
    if (seen.has(story.id)) {
      return false
    }

    seen.add(story.id)
    return true
  })
}

export function getStoryById(storyId: string, sourceStories: Story[] = stories) {
  return sourceStories.find((story) => story.id === storyId) ?? null
}

export function getBrandStories(brand: string, sourceStories: Story[] = stories) {
  return sourceStories
    .filter((story) => story.brand === brand)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getStoriesByCategory(category: ContentCategory, sourceStories: Story[] = stories) {
  return sourceStories
    .filter((story) => story.category === category)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getChannelBrands(category: ContentCategory, sourceStories: Story[] = stories) {
  return Array.from(new Set(getStoriesByCategory(category, sourceStories).map((story) => story.brand)))
}
