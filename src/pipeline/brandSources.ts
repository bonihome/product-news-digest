import { beautyNews } from '../data/beautyNews'
import { luxuryNews } from '../data/luxuryNews'
import { sportsNews } from '../data/sportsNews'
import type { Story } from '../data/types'
import type { BrandSourceRule } from './types'

const coreBrandSources: BrandSourceRule[] = [
  {
    brand: 'Louis Vuitton',
    category: 'luxury',
    subcategory: '服装',
    region: 'cn',
    sourceType: 'New Arrivals',
    listUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-women/the-latest/_/N-t18gb9e5',
    sourceLabel: 'Louis Vuitton 中国官网女士新品',
    fetchMode: 'html',
    products: ['LV Sneakerina', '露跟鞋', '女士新品'],
    keywords: ['新品系列', '女士', 'the latest', 'LV Sneakerina'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Louis Vuitton',
    category: 'luxury',
    subcategory: '皮包',
    region: 'cn',
    sourceType: 'New Arrivals',
    listUrl: 'https://www.louisvuitton.cn/zhs-cn/new/for-men/the-latest/_/N-t1blflj9',
    sourceLabel: 'Louis Vuitton 中国官网男士新品',
    fetchMode: 'html',
    products: ['Keepall Bandoulière 25', '手袋', '男士新品'],
    keywords: ['新品系列', '男士', 'the latest', 'Keepall'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Hermes',
    category: 'luxury',
    subcategory: '腕表',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.hermes.cn/cn/zh/jewelry-and-watches/watches/',
    sourceLabel: '爱马仕中国官网',
    fetchMode: 'browser',
    products: ['Hermes H08', 'Arceau', 'Cape Cod'],
    keywords: ['腕表', '新品', 'H08', 'Arceau', 'Cape Cod'],
    imageStrategy: 'page-screenshot',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Dior Beauty',
    category: 'beauty',
    subcategory: '彩妆',
    region: 'cn',
    sourceType: 'Official News',
    listUrl: 'https://www.dior.com/en_us/beauty/page/whats-new.html',
    sourceLabel: "Dior Beauty What's New",
    fetchMode: 'html',
    products: ['Dior Forever', 'Dior Addict', 'Lip Glow Oil'],
    keywords: ['new', 'forever', 'addict', 'lip'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'SHISEIDO',
    category: 'beauty',
    subcategory: '护肤',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.shiseido.com.cn/',
    sourceLabel: '资生堂中国官网',
    fetchMode: 'html',
    products: ['红腰子精华', '蓝胖子防晒', '悦薇系列'],
    keywords: ['红腰子', '防晒', '精华', '新品'],
    imageStrategy: 'homepage-module',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Adidas',
    category: 'sports',
    subcategory: '足球',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.adidas.com.cn/pdp?articleId=JQ0952',
    sourceLabel: 'adidas 中国官网',
    fetchMode: 'html',
    products: ['F50 Messi Elite FG', 'F50 League TF', 'F50 League AG'],
    keywords: ['F50', 'Messi', '足球鞋', 'Elite FG'],
    imageStrategy: 'gallery-image',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Adidas',
    category: 'sports',
    subcategory: '篮球',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.adidas.com.cn/',
    sourceLabel: 'adidas 中国大陆官网首页',
    fetchMode: 'html',
    products: ['ANTHONY EDWARDS 2', '爱德华兹2代篮球运动鞋', '极速蓝调'],
    keywords: ['聚焦热点', '极速蓝调', '篮球', 'Anthony Edwards 2'],
    imageStrategy: 'gallery-image',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Adidas',
    category: 'sports',
    subcategory: '户外',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.adidas.com.cn/',
    sourceLabel: 'adidas 中国大陆官网首页',
    fetchMode: 'html',
    products: ['TERREX FH LT SANDAL', '自由人系列', '城市机能风'],
    keywords: ['聚焦热点', '自由人系列', '城市机能风', '户外'],
    imageStrategy: 'gallery-image',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Adidas',
    category: 'sports',
    subcategory: '运动休闲',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.adidas.com.cn/',
    sourceLabel: 'adidas 中国大陆官网首页',
    fetchMode: 'html',
    products: ['静奢甄选', '东方柔雅风', '三条纹舞动系列'],
    keywords: ['新品推荐', '静奢甄选', '东方柔雅风', '三条纹舞动系列'],
    imageStrategy: 'gallery-image',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Wilson',
    category: 'sports',
    subcategory: '网球',
    region: 'cn',
    sourceType: 'Official News',
    listUrl: 'https://www.wilson.com/en-us/tennis',
    sourceLabel: 'Wilson Tennis',
    fetchMode: 'browser',
    products: ['Rush Pro 4.5', 'Rush Pro 4.0', '4D Support Chassis 2.0'],
    keywords: ['Rush Pro 4.5', 'tennis shoe', 'new'],
    imageStrategy: 'page-screenshot',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Chanel',
    category: 'luxury',
    subcategory: '腕表',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.chanel.cn/cn/watches/',
    sourceLabel: '香奈儿中国官网腕表频道',
    fetchMode: 'html',
    products: ['J12 BLEU蓝宝石腕表', '38毫米', 'Caliber 12.1机芯'],
    keywords: ['腕表', 'J12', 'Première', 'CHANEL watches'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'ASICS',
    category: 'sports',
    subcategory: '网球',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.asics.com.cn/',
    sourceLabel: 'ASICS 中国官网首页',
    fetchMode: 'html',
    products: ['GEL-RESOLUTION 8', 'GEL-RESOLUTION 8 L.E.', '网球鞋款'],
    keywords: ['网球', 'GEL-RESOLUTION', 'ASICS', '鞋款'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'DESCENTE',
    category: 'sports',
    subcategory: '户外',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://allterrain.descente.com/',
    sourceLabel: 'DESCENTE ALLTERRAIN 官方网站',
    fetchMode: 'html',
    products: ['ALLTERRAIN', 'ALLTERRAIN 81', 'MIZUSAWA DOWN'],
    keywords: ['ALLTERRAIN', '81', 'DESCENTE', '户外'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Apple',
    category: 'digital',
    subcategory: '手机',
    region: 'cn',
    sourceType: 'Official News',
    listUrl: 'https://www.apple.com.cn/cn/newsroom/topics/iphone/',
    sourceLabel: 'Apple 中国大陆新闻稿',
    fetchMode: 'html',
    products: ['iPhone 17e', 'A19 芯片', '48MP 双摄系统'],
    keywords: ['iPhone', 'introduces', 'newsroom'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Microsoft Surface',
    category: 'digital',
    subcategory: '电脑',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.microsoft.com/zh-cn/surface/business/surface-laptop-6',
    sourceLabel: 'Microsoft Surface 中国官网',
    fetchMode: 'browser',
    products: ['Surface Laptop 6', 'Copilot+ PC', 'Intel Core Ultra'],
    keywords: ['Surface Laptop 6', 'AI PC', 'Copilot'],
    imageStrategy: 'page-screenshot',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
]

function uniqueKeywords(story: Story) {
  return Array.from(new Set([story.subcategory, ...story.products.slice(0, 3)])).slice(0, 4)
}

function inferFetchMode(story: Story): BrandSourceRule['fetchMode'] {
  if (
    story.brand === "Arc'teryx" ||
    story.brand === 'Hermes' ||
    story.brand === 'Wilson' ||
    story.brand === 'Microsoft Surface'
  ) {
    return 'browser'
  }

  return 'html'
}

function inferImageStrategy(story: Story): BrandSourceRule['imageStrategy'] {
  if (story.sourceType === 'Official News') {
    return 'page-screenshot'
  }

  if (story.sourceUrl === 'https://www.shiseido.com.cn/' || story.sourceUrl.endsWith('.com.cn/')) {
    return 'homepage-module'
  }

  return 'product-page'
}

function buildRuleFromStory(story: Story): BrandSourceRule {
  let listUrl = story.sourceUrl
  let sourceLabel = story.sourceLabel

  if (story.brand === 'Bobbi Brown') {
    listUrl = 'https://www.bobbibrown.com.cn/'
    sourceLabel = 'Bobbi Brown 中国官网首页'
  } else if (story.brand === 'Clinique') {
    listUrl = 'https://www.clinique.com.cn/'
    sourceLabel = 'Clinique 中国官网首页'
  } else if (story.brand === 'Estée Lauder') {
    listUrl = 'https://www.esteelauder.com.cn/'
    sourceLabel = 'Estée Lauder 中国官网首页'
  } else if (story.brand === 'La Mer') {
    listUrl = 'https://www.lamer.com.cn/'
    sourceLabel = 'La Mer 中国官网首页'
  } else if (story.brand === 'Chanel' && story.subcategory === '腕表') {
    listUrl = 'https://www.chanel.cn/cn/watches/'
    sourceLabel = '香奈儿中国官网腕表频道'
  } else if (story.brand === 'DESCENTE') {
    listUrl = 'https://allterrain.descente.com/'
    sourceLabel = 'DESCENTE ALLTERRAIN 官方网站'
  } else if (story.brand === 'ASICS') {
    listUrl = 'https://www.asics.com.cn/'
    sourceLabel = 'ASICS 中国官网首页'
  } else if (story.brand === 'Wilson') {
    listUrl = 'https://www.wilson.com/en-us/tennis'
    sourceLabel = 'Wilson Tennis'
  }

  return {
    brand: story.brand,
    category: story.category,
    subcategory: story.subcategory,
    region: 'cn',
    sourceType: story.sourceType,
    listUrl,
    sourceLabel,
    fetchMode: inferFetchMode(story),
    products: story.products,
    keywords: uniqueKeywords(story),
    imageStrategy: inferImageStrategy(story),
    cadence: 'wed-sun-twice',
    enabled: true,
  }
}

function pickLatestStoryPerBrandAndSubcategory(stories: Story[]) {
  const latestByKey = new Map<string, Story>()

  for (const story of stories) {
    const key = `${story.brand}::${story.subcategory}`
    const existing = latestByKey.get(key)
    if (!existing || story.publishedAt > existing.publishedAt) {
      latestByKey.set(key, story)
    }
  }

  return latestByKey
}

const staticStories = [...luxuryNews, ...beautyNews, ...sportsNews]
const explicitBrandKeys = new Set(coreBrandSources.map((source) => `${source.brand}::${source.subcategory}`))
const latestStoriesByBrandAndSubcategory = pickLatestStoryPerBrandAndSubcategory(staticStories)

const derivedBrandSources = Array.from(latestStoriesByBrandAndSubcategory.values())
  .filter((story) => !explicitBrandKeys.has(`${story.brand}::${story.subcategory}`))
  .map(buildRuleFromStory)
  .sort((left, right) => {
    if (left.category === right.category) {
      const brandCompare = left.brand.localeCompare(right.brand)
      if (brandCompare !== 0) {
        return brandCompare
      }

      return left.subcategory.localeCompare(right.subcategory)
    }

    return left.category.localeCompare(right.category)
  })

export const brandSources: BrandSourceRule[] = [...coreBrandSources, ...derivedBrandSources]

export function getEnabledBrandSources() {
  return brandSources.filter((source) => source.enabled)
}
