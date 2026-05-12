import { beautyNews } from '../data/beautyNews'
import { digitalNews } from '../data/digitalNews'
import { luxuryNews } from '../data/luxuryNews'
import { sportsNews } from '../data/sportsNews'
import { webgamesNews } from '../data/webgamesNews'
import type { Story } from '../data/types'
import type { BrandSourceRule } from './types'

const coreBrandSources: BrandSourceRule[] = [
  {
    brand: 'PacoGames',
    category: 'webgames',
    subcategory: '新游',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.pacogames.com/latest-games',
    sourceLabel: 'PacoGames Latest Games',
    fetchMode: 'html',
    products: ['Pong', 'Tetris', 'PacoGames 最新游戏'],
    keywords: ['Latest games', 'Pong', 'PacoGames', 'new'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'GamePix',
    category: 'webgames',
    subcategory: '新游',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.gamepix.com/new',
    sourceLabel: 'GamePix New Games',
    fetchMode: 'html',
    products: ['The Crossing Master', 'Hill Survival Shooting Game', 'GamePix 新游戏'],
    keywords: ['New Games', 'The Crossing Master', 'GamePix', 'new'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Poki',
    category: 'webgames',
    subcategory: '新游',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://poki.com/en/new',
    sourceLabel: 'Poki New Games',
    fetchMode: 'html',
    products: ['Bubble Tower', 'Count War', 'Snacky Snake'],
    keywords: ['New Games', 'Bubble Tower', 'Poki', 'new'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Y8',
    category: 'webgames',
    subcategory: '新游',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.y8.com/new/games',
    sourceLabel: 'Y8 New Games',
    fetchMode: 'html',
    products: ['Cat Rescue', 'Foc Drag Street', 'Y8 新游戏'],
    keywords: ['New Games', 'Cat Rescue', 'Y8', 'new'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'CrazyGames',
    category: 'webgames',
    subcategory: '新游',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.crazygames.com/new',
    sourceLabel: 'CrazyGames New',
    fetchMode: 'html',
    products: ['Trash Master', 'Bills Must Be Paid', 'Mad Pursuit'],
    keywords: ['New games', 'Trash Master', 'CrazyGames', 'new'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Arcadrome',
    category: 'webgames',
    subcategory: '新游',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://arcadrome.com/',
    sourceLabel: 'Arcadrome 首页新游',
    fetchMode: 'html',
    products: ['Lunar Knight', 'Idle Lumber Inc', 'Endless Waves Survival'],
    keywords: ['Arcadrome', 'Lunar Knight', 'new game', 'homepage'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
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
    listUrl: 'https://www.hermes.cn/cn/zh/content/322394-hermes-h08/',
    sourceLabel: '爱马仕中国官网 H08 腕表专题',
    fetchMode: 'browser',
    products: ['Hermes H08', 'Arceau', 'Cape Cod'],
    keywords: ['腕表', '新品', 'H08', 'Arceau', 'Cape Cod'],
    imageStrategy: 'page-screenshot',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Prada',
    category: 'luxury',
    subcategory: '皮包',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.prada.cn/cn/zh/womens/new-in/c/10111CN',
    sourceLabel: 'Prada 中国官网女士新品页',
    fetchMode: 'html',
    products: ['Prada Passage中号皮革手袋', 'Prada Bonnie 中号印花亚麻皮革拼接手提包', 'Prada Carry 迷你皮革手袋'],
    keywords: ['Prada', '女士新品上市', '皮包', 'Prada Galleria'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Prada',
    category: 'luxury',
    subcategory: '服装',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.prada.cn/cn/zh/womens/new-in/c/10111CN',
    sourceLabel: 'Prada 中国官网女士新品页',
    fetchMode: 'html',
    products: ['蕾丝连衣裙', 'Re-Nylon 半身裙', '斜纹棉布中长半身伞裙'],
    keywords: ['Prada', '女士新品上市', '服装', '2026春夏'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Prada',
    category: 'luxury',
    subcategory: '珠宝',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.prada.cn/cn/zh/fine-jewelry/eternal-gold/c/10763CN',
    sourceLabel: 'Prada 中国官网 Eternal Gold 系列',
    fetchMode: 'html',
    products: ['Eternal Gold中号吊坠项链', 'Prada Symbole 项链', 'Prada Fine Jewelry'],
    keywords: ['Prada', '珠宝', 'Eternal Gold', 'Fine Jewelry'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Dior',
    category: 'luxury',
    subcategory: '皮包',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.dior.cn/zh_cn/fashion/bags/lady-d-joy',
    sourceLabel: 'Dior 中国官网 Lady D-Joy 手袋系列页',
    fetchMode: 'html',
    products: ['Lady D-Joy 手袋', 'Book Tote 手袋', 'Dioramour 迷你 Book Tote'],
    keywords: ['Dior', '手袋', 'Lady D-Joy', 'Book Tote'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Dior',
    category: 'luxury',
    subcategory: '珠宝',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.dior.cn/zh_cn/fashion/jewelry-timepieces/rose-des-vents-home',
    sourceLabel: 'Dior 中国官网 Rose des Vents 珠宝系列页',
    fetchMode: 'html',
    products: ['Rose des Vents 珠宝', 'Oui 戒指', 'GEM DIOR 系列'],
    keywords: ['Dior', '珠宝', 'Rose des Vents', 'GEM DIOR'],
    imageStrategy: 'product-page',
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
    brand: 'Dior Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.dior.cn/zh_cn/beauty/fragrance/womens_fragrance/miss-dior',
    sourceLabel: 'Dior Beauty Miss Dior 系列页',
    fetchMode: 'html',
    products: ['Miss Dior 淡香精', 'J’adore', 'Sauvage'],
    keywords: ['Dior Beauty', '香水', 'Miss Dior', 'J’adore'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Dior Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.dior.cn/zh_cn/beauty/fragrance/womens_fragrance/jadore',
    sourceLabel: 'Dior Beauty J’adore 系列页',
    fetchMode: 'html',
    products: ['J’adore 淡香精', "J’adore Parfum d'eau", 'J’adore 身体乳'],
    keywords: ['Dior Beauty', '香水', 'J’adore', '花束香调'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Dior Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.dior.cn/zh_cn/beauty/products/y0685240-sauvage-eau-de-toilette',
    sourceLabel: 'Dior Beauty Sauvage 产品页',
    fetchMode: 'html',
    products: ['Sauvage 淡香水', 'Sauvage Eau Forte', 'Sauvage 须后润肤露'],
    keywords: ['Dior Beauty', '香水', 'Sauvage', '男士香氛'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'CHANEL Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.chanel.cn/cn/fragrance/',
    sourceLabel: 'CHANEL Beauty 中国官网香氛',
    fetchMode: 'html',
    products: ['N°5', 'CHANCE EAU SPLENDIDE', 'COCO MADEMOISELLE'],
    keywords: ['CHANEL Beauty', '香水', 'N°5', 'CHANCE'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'CHANEL Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.chanel.cn/cn/fragrance/p/125530/n5-eau-de-parfum-spray/',
    sourceLabel: 'CHANEL Beauty N°5 产品页',
    fetchMode: 'html',
    products: ['N°5 香奈儿五号香水（经典）', "N°5 L'EAU 香奈儿五号之水", 'N°5 香奈儿五号香水随行手袋装'],
    keywords: ['CHANEL Beauty', '香水', 'N°5', '五号香水'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'CHANEL Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.chanel.cn/cn/fragrance/p/136210/chance-eau-splendide-eau-de-parfum-spray/',
    sourceLabel: 'CHANEL Beauty Chance 系列产品页',
    fetchMode: 'html',
    products: ['CHANCE EAU SPLENDIDE 香奈儿邂逅梦幻香水', 'CHANCE EAU TENDRE 香奈儿邂逅柔情香水', 'Chance Eau Splendide 润体乳'],
    keywords: ['CHANEL Beauty', '香水', 'Chance', '邂逅'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Hermès Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.hermes.cn/cn/en/category/fragrances/',
    sourceLabel: 'Hermès Beauty 香氛',
    fetchMode: 'html',
    products: ['大地馥郁香根草香型香水', '尼罗河花园香水', '李先生的花园香水'],
    keywords: ['Hermès Beauty', '香水', '花园系列', '大地'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Hermès Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.hermes.cn/cn/zh/product/%E7%88%B1%E9%A9%AC%E4%BB%95%E5%A4%A7%E5%9C%B0%E9%A6%A5%E9%83%81%E9%A6%99%E6%A0%B9%E8%8D%89%E9%A6%99%E5%9E%8B%E9%A6%99%E6%B0%B4-V40946/',
    sourceLabel: 'Hermès Beauty Terre d’Hermès 产品页',
    fetchMode: 'html',
    products: ['爱马仕大地馥郁香根草香型香水', 'Terre d’Hermès 淡香水', 'Terre d’Hermès 须后润肤露'],
    keywords: ['Hermès Beauty', '香水', 'Terre d’Hermès', '大地'],
    imageStrategy: 'product-page',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Hermès Beauty',
    category: 'beauty',
    subcategory: '香水',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.hermes.cn/cn/zh/product/%E7%88%B1%E9%A9%AC%E4%BB%95%E4%B8%9D%E6%84%8F%E8%8D%94%E9%9F%B5%E6%B7%A1%E9%A6%99%E7%B2%BE-V110826VN/',
    sourceLabel: 'Hermès Beauty Twilly d’Hermès 产品页',
    fetchMode: 'html',
    products: ['爱马仕丝意荔韵淡香精', 'Twilly d’Hermès 淡香精', 'Twilly d’Hermès 润体乳'],
    keywords: ['Hermès Beauty', '香水', 'Twilly', '丝意'],
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
    brand: 'Samsung',
    category: 'digital',
    subcategory: '手机',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.samsung.com.cn/smartphones/galaxy-s26-ultra/buy/',
    sourceLabel: '三星中国官网 Galaxy S26 Ultra',
    fetchMode: 'html',
    products: ['Galaxy S26', 'Galaxy S26+', 'Galaxy S26 Ultra'],
    keywords: ['Samsung', 'Galaxy', '手机', 'S26'],
    imageStrategy: 'homepage-module',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Samsung',
    category: 'digital',
    subcategory: '平板',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.samsung.com.cn/tablets/galaxy-tab-s11/buy/',
    sourceLabel: '三星中国官网 Galaxy Tab S11',
    fetchMode: 'html',
    products: ['Galaxy Tab S11 Ultra', 'Galaxy Tab S11', 'S Pen'],
    keywords: ['Samsung', 'Galaxy Tab', '平板', 'S11'],
    imageStrategy: 'homepage-module',
    cadence: 'wed-sun-twice',
    enabled: true,
  },
  {
    brand: 'Samsung',
    category: 'digital',
    subcategory: '配件',
    region: 'cn',
    sourceType: 'Official Site',
    listUrl: 'https://www.samsung.com.cn/audio-sound/galaxy-buds4-pro/buy/',
    sourceLabel: '三星中国官网 Galaxy Buds4 Pro',
    fetchMode: 'html',
    products: ['Galaxy Buds', 'Galaxy AI', 'Galaxy 生态配件'],
    keywords: ['Samsung', 'Galaxy Buds', '配件', '生态'],
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
  } else if (story.brand === 'CHANEL Beauty') {
    listUrl = 'https://www.chanel.cn/cn/fragrance/'
    sourceLabel = 'CHANEL Beauty 中国官网香氛'
  } else if (story.brand === 'Hermès Beauty') {
    listUrl = 'https://www.hermes.cn/cn/en/category/fragrances/'
    sourceLabel = 'Hermès Beauty 香氛'
  } else if (story.brand === 'DESCENTE') {
    listUrl = 'https://allterrain.descente.com/'
    sourceLabel = 'DESCENTE ALLTERRAIN 官方网站'
  } else if (story.brand === 'ASICS') {
    listUrl = 'https://www.asics.com.cn/'
    sourceLabel = 'ASICS 中国官网首页'
  } else if (story.brand === 'Wilson') {
    listUrl = 'https://www.wilson.com/en-us/tennis'
    sourceLabel = 'Wilson Tennis'
  } else if (story.brand === 'Prada') {
    sourceLabel = 'Prada 中国官网已验证产品页'
  } else if (story.brand === 'Prada Beauty') {
    sourceLabel = 'Prada Beauty 中国官网已验证香氛页'
  } else if (story.brand === 'Dior') {
    sourceLabel = 'Dior 中国官网已验证产品页'
  } else if (story.brand === 'Dior Beauty') {
    listUrl = 'https://www.dior.com/en_us/beauty/page/whats-new.html'
    sourceLabel = "Dior Beauty What's New"
  } else if (story.brand === 'Samsung') {
    listUrl = 'https://www.samsung.com/cn/'
    sourceLabel = '三星中国官网首页'
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

const staticStories = [...luxuryNews, ...beautyNews, ...sportsNews, ...digitalNews, ...webgamesNews]
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
