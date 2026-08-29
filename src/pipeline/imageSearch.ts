/**
 * Image search using cn.bing.com/images/search (free, no API key needed).
 * Works from Chinese servers — scrapes Bing China's inline JSON data for image URLs.
 */

const BING_IMAGE_SEARCH_URL = 'https://cn.bing.com/images/search'

export function isImageSearchAvailable(): boolean {
  return true
}

/**
 * Scrape Bing China image search results, extract image URLs from inline JSON.
 * Bing embeds image data in <a class="iusc" m="{...JSON...}"> elements.
 */
export async function searchProductImage(
  brand: string,
  productName: string,
): Promise<string | null> {
  const query = `${brand} ${productName}`
  const url = new URL(BING_IMAGE_SEARCH_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('first', '1')

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      console.warn(`[imageSearch] Bing returned ${response.status} for "${query}"`)
      return null
    }

    const html = await response.text()

    // Extract iusc anchor m attributes
    const mRegex = /<a[^>]*class="iusc"[^>]*m="([^"]*)"[^>]*>/gi
    const mMatches = html.matchAll(mRegex)

    const urls: string[] = []
    for (const match of mMatches) {
      try {
        const encoded = match[1]
        // Decode &quot; back to "
        const decoded = encoded.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        const data = JSON.parse(decoded) as { murl?: string }
        if (data.murl && isGoodImageUrl(data.murl)) {
          urls.push(data.murl)
        }
      } catch {
        // Skip malformed JSON
      }
    }

    if (urls.length === 0) {
      console.warn(`[imageSearch] No valid image URLs found for "${query}"`)
      return null
    }

    const picked = urls[0]
    console.log(`[imageSearch] Found image for "${query}": ${picked.slice(0, 80)}... (${urls.length} candidates)`)
    return picked
  } catch (error) {
    console.warn(
      `[imageSearch] Search failed for "${query}": ${error instanceof Error ? error.message : String(error)}`,
    )
    return null
  }
}

/**
 * Filter out known bad/spam image URLs.
 */
function isGoodImageUrl(url: string): boolean {
  const lower = url.toLowerCase()
  if (lower.includes('bing.com/th')) return false // Bing thumbnail
  if (lower.includes('.ico')) return false
  if (lower.includes('.svg')) return false
  if (lower.includes('t_default') || lower.includes('t_prod')) return false
  return /\.(jpg|jpeg|png|webp)/i.test(lower) || lower.includes('img') || lower.includes('image')
}

/**
 * Search for the best product image from multiple candidates.
 * Tries each product name, returns first hit.
 */
export async function searchBestProductImage(
  brand: string,
  products: string[],
): Promise<string | null> {
  for (const product of products) {
    const url = await searchProductImage(brand, product)
    if (url) return url
  }
  return null
}
