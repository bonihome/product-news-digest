/**
 * Seed LEGO (乐高) stories.
 * Usage: npx tsx scripts/seed-lego.ts
 */
import { getEnabledBrandSources } from '../src/pipeline/brandSources'
import { readStoredStories, writeStoredStories, syncNewsImages } from '../src/pipeline/runtimeStore'
import { publishRuntimeFeed } from '../src/pipeline/publisher'
import { localizeStoryImages } from '../src/pipeline/imageStore'
import { fetchLegoCandidates } from '../src/pipeline/fetchCandidates'

function generateSlug(text: string, maxLen = 50): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, maxLen)
}

async function main() {
  const sources = getEnabledBrandSources().filter(s => s.brand === 'LEGO')
  console.log(`Found ${sources.length} LEGO sources\n`)

  const stories = await readStoredStories()
  const checkedAt = new Date().toISOString()
  let added = 0

  for (const rule of sources) {
    console.log(`  ${rule.sourceLabel}: fetching...`)
    try {
      const candidates = await fetchLegoCandidates(rule, checkedAt)
      if (candidates.length === 0) {
        console.log('  no products')
        continue
      }

      for (const c of candidates) {
        // Use sourceUrl (product page) to generate unique ID
        const urlParts = c.sourceUrl.split('/')
        const productSlug = urlParts[urlParts.length - 1] || ''
        const id = generateSlug(`lego-${productSlug}`)

        const exists = stories.find((s: any) => s.id === id)
        if (exists) {
          console.log(`    SKIP ${c.sourceTitle?.slice(0, 50)}`)
          continue
        }

        const sourceTitle = c.sourceTitle || 'LEGO 新品'
        const title = `LEGO 推出 ${sourceTitle}`

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
          summary: c.sourceSummary || `LEGO 乐高新品已上线。`,
          products: c.products || rule.products,
          sourceTitle,
          fingerprint: `${rule.brand}::${(c.products || rule.products).join(',')}::${c.sourceUrl}`,
        } as any)

        added++
        console.log(`    ADD ${title.substring(0, 70)}`)
      }
    } catch (e: any) {
      console.log(`  ERROR: ${e.message}`)
    }
  }

  console.log(`\nAdded ${added}. Total: ${stories.length}`)
  if (added > 0) {
    await localizeStoryImages(stories)
    await syncNewsImages()
    await writeStoredStories(stories)
    await publishRuntimeFeed(stories)
    console.log('Published runtime feed.')
  }
}

main().catch(console.error)
