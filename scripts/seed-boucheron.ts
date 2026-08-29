/**
 * Seed Boucheron stories.
 * Usage: npx tsx scripts/seed-boucheron.ts
 */
import { getEnabledBrandSources } from '../src/pipeline/brandSources'
import { readStoredStories, writeStoredStories, syncNewsImages } from '../src/pipeline/runtimeStore'
import { publishRuntimeFeed } from '../src/pipeline/publisher'
import { localizeStoryImages } from '../src/pipeline/imageStore'
import { fetchBoucheronCandidate } from '../src/pipeline/fetchCandidates'

function generateSlug(text: string, maxLen = 50): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, maxLen)
}

function generateId(brand: string, sourceUrl: string): string {
  const urlSlug = sourceUrl.split('/').pop()?.replace('.html', '') || ''
  const short = urlSlug.replace(/-[a-z]{3}\d{5}$/, '') // remove SKU
  return generateSlug(`${brand}-${short}`)
}

async function main() {
  const sources = getEnabledBrandSources().filter(s => s.brand === 'Boucheron')
  console.log(`Found ${sources.length} Boucheron sources\n`)

  const stories = await readStoredStories()
  const checkedAt = new Date().toISOString()
  let added = 0

  for (const rule of sources) {
    process.stdout.write(`  ${rule.sourceLabel}: `)
    try {
      const c = await fetchBoucheronCandidate(rule, checkedAt)
      if (!c) {
        console.log('no products')
        continue
      }

      const id = generateId(rule.brand, c.sourceUrl)
      // Only check id collision (fingerprint is undefined in CrawlCandidate)
      const exists = stories.find((s: any) => s.id === id)
      if (exists) {
        console.log(`SKIP (${exists.id})`)
        continue
      }

      const sourceTitle = c.sourceTitle || `${rule.brand} ${rule.subcategory}`
      const title = `${rule.brand} 推出 ${sourceTitle.replace(rule.brand+' ','')}，${rule.subcategory}新品阵容继续扩展`

      stories.push({
        id,
        brand: rule.brand,
        category: rule.category,
        subcategory: rule.subcategory,
        title,
        publishedAt: '2026-07-20',
        checkedAt,
        sourceType: rule.sourceType,
        sourceLabel: rule.sourceLabel,
        sourceUrl: c.sourceUrl,
        image: c.image || '',
        summary: c.sourceSummary || `Boucheron 宝诗龙 ${rule.sourceLabel} 当前首个产品已提取。`,
        products: c.products || rule.products,
        sourceTitle,
        fingerprint: `${rule.brand}::${(c.products || rule.products).join(',')}::${c.sourceUrl}`,
      } as any)

      added++
      console.log(`ADD ${title.substring(0, 60)}`)
    } catch (e: any) {
      console.log(`ERROR: ${e.message}`)
    }
  }

  console.log(`\nAdded ${added}. Total: ${stories.length}`)
  if (added > 0) {
    await localizeStoryImages(stories)
    await syncNewsImages()
    await writeStoredStories(stories)
    await publishRuntimeFeed(stories)
    console.log('Feed regenerated.')
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
