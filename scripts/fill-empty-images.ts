/**
 * post-pipeline 图片回填脚本 (v2)
 * 在 pipeline 运行后执行，按优先级回填空图/坏图：
 *   ① 复用 image-rules 中的 localMirrorPath（人工验证过的）
 *   ② 用 Playwright 访问 sourceUrl 截图/下载产品图
 *   ③ 尝试国际品牌官网（.com/.fr/.jp 等）
 *   ④ 都不行就留空（绝不跨品牌/跨产品乱配）
 *
 * 用法: npx tsx scripts/fill-empty-images.ts [--screenshot]
 *   --screenshot  启用 Playwright 截图回退（慢，仅开发/手动时用）
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = '/srv/product-news-digest'
const NEWS_ITEMS_PATH = join(ROOT, 'data/runtime/news-items.json')
const PUBLIC_RUNTIME = join(ROOT, 'public/runtime/news-images')

interface Story {
  id: string
  brand: string
  image: string
  sourceUrl?: string
  products?: string[]
  [key: string]: unknown
}

function slugify(brand: string) {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ---------- 国际官网 URL 映射 ----------
// 品牌 CN 官网 → 可尝试的国际官网（用于截图回退）
const INTERNATIONAL_FALLBACK: Record<string, string[]> = {
  'Alexander McQueen': ['https://www.alexandermcqueen.com/en-us/'],
  'Saint Laurent': ['https://www.ysl.com/en-us/'],
  'Fendi': ['https://www.fendi.com/us-en/'],
  'Valentino': ['https://www.valentino.com/en-us/'],
  'Prada': ['https://www.prada.com/us/en/'],
  'Bottega Veneta': ['https://www.bottegaveneta.com/en-us/'],
  'Celine': ['https://www.celine.com/en-us/'],
  'ROG': ['https://rog.asus.com/us/'],
  'Nike': ['https://www.nike.com/'],
  'Hermes': ['https://www.hermes.com/us/en/'],
  'Gucci': ['https://www.gucci.com/us/en/'],
  'Dior': ['https://www.dior.com/en_us/'],
  'Chanel': ['https://www.chanel.com/us/'],
  'Cartier': ['https://www.cartier.com/en-us/'],
  'Bvlgari': ['https://www.bulgari.com/en-us/'],
  'Burberry': ['https://us.burberry.com/'],
  'Tiffany & Co.': ['https://www.tiffany.com/'],
  'Louis Vuitton': ['https://us.louisvuitton.com/eng-us/'],
  'Balenciaga': ['https://www.balenciaga.com/en-us/'],
  'Givenchy': ['https://www.givenchy.com/us/en-US/'],
  'Sony': ['https://www.sony.com/'],
  'Apple': ['https://www.apple.com/'],
  'Samsung': ['https://www.samsung.com/us/'],
  'Huawei': ['https://consumer.huawei.com/en/'],
  'Xiaomi': ['https://www.mi.com/global/'],
  'HONOR': ['https://www.honor.com/global/'],
  'OPPO': ['https://www.oppo.com/en/'],
  'vivo': ['https://www.vivo.com/en/'],
  'Lenovo': ['https://www.lenovo.com/us/en/'],
  'Microsoft Surface': ['https://www.microsoft.com/en-us/surface/'],
  'Adidas': ['https://www.adidas.com/us/'],
  'Arc\'teryx': ['https://arcteryx.com/us/en/'],
  'ASICS': ['https://www.asics.com/us/en-us/'],
  'DESCENTE': ['https://www.descente.com/'],
  'Mizuno': ['https://www.mizuno.com/us/'],
  'On': ['https://www.on.com/en-us/'],
  'Wilson': ['https://www.wilson.com/en-us/'],
  'YONEX': ['https://www.yonex.com/'],
  'Estée Lauder': ['https://www.esteelauder.com/'],
  'Lancôme': ['https://www.lancome-usa.com/'],
  'La Mer': ['https://www.lamer.com/'],
  'Kiehl\'s': ['https://www.kiehls.com/'],
  'Clinique': ['https://www.clinique.com/'],
  'SHISEIDO': ['https://www.shiseido.com/us/en/'],
  'PROYA': ['https://www.proya.com/'],
  'MAOGEPING': ['https://www.maogepingbeauty.com/'],
  'Clé de Peau Beauté': ['https://www.cledepeaubeaute.com/'],
  'IPSA': ['https://www.ipsa.com.cn/'],  // mostly CN only
  'NARS': ['https://www.narscosmetics.com/'],
  'Bobbi Brown': ['https://www.bobbibrowncosmetics.com/'],
  'CHANEL Beauty': ['https://www.chanel.com/us/fragrance-beauty/'],
  'Dior Beauty': ['https://www.dior.com/en_us/beauty/'],
  'YSL Beauty': ['https://www.yslbeautyus.com/'],
  'CHANDO': ['https://www.chando.com.cn/'],
  'Winona': ['https://www.winona.com.cn/'],
  'Prada Beauty': ['https://www.prada.com/us/en/pradabeauty/'],
  'Hermès Beauty': ['https://www.hermes.com/us/en/fragrance-beauty/'],
  'Givenchy Beauty': ['https://www.givenchybeauty.com/us/en/'],
  'Shu Uemura': ['https://www.shuuemura-usa.com/'],
  'LEGO': ['https://www.lego.com/en-us/'],
  'NVIDIA': ['https://www.nvidia.com/en-us/'],
  'DeepSeek': ['https://chat.deepseek.com/'],
  'OpenAI': ['https://openai.com/'],
  'Google': ['https://ai.google/'],
  'Anthropic': ['https://www.anthropic.com/'],
  'xAI': ['https://x.ai/'],
  'Kimi': ['https://kimi.moonshot.cn/'],
  '智谱 GLM': ['https://open.bigmodel.cn/'],
  'MiniMax': ['https://www.minimaxi.com/'],
  'Microsoft Copilot': ['https://copilot.microsoft.com/'],
  'Hermes Agent': ['https://hermes-agent.nousresearch.com/'],
  'OpenClaw': ['https://openclaw.ai/'],
  'Sonos': ['https://www.sonos.com/en-us/'],
  'CrazyGames': ['https://www.crazygames.com/'],
  'Arcadrome': ['https://www.arcadrome.com/'],
  'Poki': ['https://poki.com/'],
  'PacoGames': ['https://www.pacogames.com/'],
  'Y8': ['https://www.y8.com/'],
  'GamePix': ['https://www.gamepix.com/'],
}

// ---------- 检查图片是否损坏 ----------
function isImageBroken(imagePath: string): boolean {
  if (!imagePath) return true
  if (imagePath.startsWith('/news/')) {
    const distPath = join(ROOT, 'dist', imagePath)
    if (!existsSync(distPath)) return true
    if (statSync(distPath).size < 3000) return true
    return false
  }
  if (imagePath.startsWith('/runtime/')) {
    const pubPath = join(ROOT, 'public', imagePath)
    if (!existsSync(pubPath)) return true
    if (statSync(pubPath).size < 3000) return true
    return false
  }
  return false
}

// ---------- 层级 ①: 复用 image-rules localMirrorPath ----------
function tryLocalMirror(story: Story): string | null {
  try {
    const rulesDir = join(ROOT, 'data/image-rules')
    const slug = slugify(story.brand)
    
    // 精确匹配品牌规则文件：品牌 slug 必须完全匹配文件名
    // 避免 Prada 匹配到 prada-beauty.json, Chanel 匹配到 chanel-beauty.json
    const candidates = readdirSync(rulesDir).filter(f => {
      const base = f.replace('.json', '').toLowerCase()
      return base === slug || base === slug.replace(/-/g, '')
    })
    
    for (const fname of candidates) {
      const rule = JSON.parse(readFileSync(join(rulesDir, fname), 'utf-8'))
      const rules = rule.stories || []
      for (const rs of rules) {
        const acq = rs.acquisition || {}
        if (acq.localMirrorPath) {
          const pubPath = join(ROOT, 'public', acq.localMirrorPath)
          if (existsSync(pubPath) && statSync(pubPath).size > 3000) {
            return acq.localMirrorPath
          }
        }
      }
    }
  } catch {}
  return null
}

// ---------- 层级 ②/③: 截图或国际网站截图 ----------
function tryScreenshot(story: Story, useScreenshot: boolean): string | null {
  if (!useScreenshot) return null

  const slug = slugify(story.brand)
  const ext = '.jpg'
  const hash = require('crypto').createHash('sha1').update(story.id).digest('hex').slice(0, 12)
  const outputPath = join(PUBLIC_RUNTIME, slug, `${story.id}-${hash}${ext}`)
  const publicPath = `/runtime/news-images/${slug}/${story.id}-${hash}${ext}`

  // ② 先试 sourceUrl
  if (story.sourceUrl) {
    try {
      const result = execSync(
        `python3 scripts/screenshot-product.py "${story.sourceUrl}" "${outputPath}"`,
        { cwd: ROOT, timeout: 45000, encoding: 'utf-8' }
      )
      const parsed = JSON.parse(result)
      if (parsed.ok) return publicPath
    } catch (e: any) {
      console.log(`    [screenshot] sourceUrl failed: ${e.message?.slice(0, 60) || 'timeout'}`)
    }
  }

  // ③ 试国际官网
  const intlUrls = INTERNATIONAL_FALLBACK[story.brand] || []
  for (const intlUrl of intlUrls) {
    try {
      const result = execSync(
        `python3 scripts/screenshot-product.py "${intlUrl}" "${outputPath}"`,
        { cwd: ROOT, timeout: 45000, encoding: 'utf-8' }
      )
      const parsed = JSON.parse(result)
      if (parsed.ok) return publicPath
    } catch (e: any) {
      console.log(`    [screenshot] intl failed: ${intlUrl.slice(0, 40)}`)
    }
  }

  return null
}

// ---------- 主流程 ----------
function main() {
  const useScreenshot = process.argv.includes('--screenshot')
  const items: Story[] = JSON.parse(readFileSync(NEWS_ITEMS_PATH, 'utf-8'))
  const badStories = items.filter(s => !s.image || isImageBroken(s.image))

  if (badStories.length === 0) {
    console.log('[fill-empty-images] No broken-image stories found.')
    return
  }

  console.log(`[fill-empty-images] Found ${badStories.length} broken-image stories.` +
    (useScreenshot ? ' Screenshot mode ENABLED.' : ''))

  // ── 🔒 硬编码发布日期锁 ──
  // 以下条目的 publishedAt 被 pipeline 每日刷新，强制回退到真实发布日期
  const PUBLISHED_AT_LOCK: Record<string, string> = {
    'chanel-beauty-rouge-coco-flash': '2026-06-03',
    'prada-beauty-prada': '2026-05-04',
    'dior-beauty-sauvage': '2026-05-04',
    'chanel-beauty-chance-eau-splendide': '2026-06-03',
    'prada-beauty-prada-monochrome': '2026-07-22',
    'prada-beauty-prada-reveal': '2026-07-12',
    'dior-beauty-dior-forever': '2026-04-25',
    'chanel-beauty-n1-essence-lotion': '2026-06-03',
    'chanel-beauty-les-beiges-healthy-glow-blush': '2026-06-03',
  }
  let dateFixes = 0
  for (const story of items) {
    if (story.id in PUBLISHED_AT_LOCK) {
      const locked = PUBLISHED_AT_LOCK[story.id]
      if ((story.publishedAt as string).slice(0, 10) !== locked.slice(0, 10)) {
        ;(story as any).publishedAt = locked
        dateFixes++
      }
    }
  }
  if (dateFixes > 0) {
    console.log(`[fill-empty-images] 🔒 Locked publishedAt for ${dateFixes} items`)
  }

  let fixed = 0
  let level1 = 0, level2 = 0, level3 = 0, unfixed = 0

  for (const story of badStories) {
    // ① 复用 image-rules localMirrorPath
    const mirror = tryLocalMirror(story)
    if (mirror) {
      story.image = mirror
      console.log(`  ✅ [mirror] ${story.id.padEnd(45)} ${story.brand.padEnd(22)} -> ${mirror.slice(-50)}`)
      level1++
      fixed++
      continue
    }

    // ②/③ 截图（sourceUrl → 国际官网）
    const screen = tryScreenshot(story, useScreenshot)
    if (screen) {
      story.image = screen
      console.log(`  ✅ [screen] ${story.id.padEnd(45)} ${story.brand.padEnd(22)} -> ${screen.slice(-50)}`)
      fixed++
      continue
    }

    // ⑤ 最后兜底：品牌 Logo SVG
    const logoSlug = slugify(story.brand)
    const logoPath = `/news/logos/${logoSlug}.svg`
    const logoSysPath = join(ROOT, 'dist', logoPath)
    if (existsSync(logoSysPath)) {
      story.image = logoPath
      console.log(`  🏷️  [logo]   ${story.id.padEnd(45)} ${story.brand.padEnd(22)} -> ${logoPath}`)
      fixed++
      continue
    }
    console.log(`  ⚠️  [empty] ${story.id.padEnd(45)} ${story.brand.padEnd(22)} no fallback available`)
    unfixed++
  }

  writeFileSync(NEWS_ITEMS_PATH, JSON.stringify(items, null, 2))
  console.log(`[fill-empty-images] Fixed ${fixed}/${badStories.length}` +
    ` (mirror:${level1} screen:${level2} intl:${level3} empty:${unfixed})`)
}

main()
