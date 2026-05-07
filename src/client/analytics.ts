import type { Story } from '../data/types'
import type { SiteCounterSummary } from '../pipeline/types'

const VISITOR_STORAGE_KEY = 'product-news-digest-visitor-id'
const SESSION_STORAGE_KEY = 'product-news-digest-session-id'
const SITE_VISIT_STORAGE_KEY = 'product-news-digest-site-visit-sent'
const ANALYTICS_ENDPOINT = '/api/analytics/story-click'
const SITE_VISIT_ENDPOINT = '/api/analytics/site-visit'
const SITE_COUNTER_ENDPOINT = '/api/analytics/site-counter'

function ensureId(storage: Storage, key: string) {
  const existing = storage.getItem(key)
  if (existing) {
    return existing
  }

  const next = crypto.randomUUID()
  storage.setItem(key, next)
  return next
}

function readVisitorId() {
  return ensureId(window.localStorage, VISITOR_STORAGE_KEY)
}

function readSessionId() {
  return ensureId(window.sessionStorage, SESSION_STORAGE_KEY)
}

export async function trackStoryClick(story: Story) {
  try {
    const visitorId = readVisitorId()
    const sessionId = readSessionId()

    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        storyId: story.id,
        brand: story.brand,
        category: story.category,
        subcategory: story.subcategory,
        products: story.products,
        visitorId,
        sessionId,
        path: window.location.hash || '#/',
        clickedAt: new Date().toISOString(),
        referrer: document.referrer,
      }),
    })
  } catch {
    // Ignore analytics failures to avoid blocking the reading experience.
  }
}

export async function trackSiteVisit() {
  try {
    const visitorId = readVisitorId()
    const sessionId = readSessionId()

    if (window.localStorage.getItem(SITE_VISIT_STORAGE_KEY) === 'sent') {
      return
    }

    const response = await fetch(SITE_VISIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        visitorId,
        sessionId,
        path: window.location.hash || '#/',
        visitedAt: new Date().toISOString(),
        referrer: document.referrer,
      }),
    })

    if (response.ok) {
      window.localStorage.setItem(SITE_VISIT_STORAGE_KEY, 'sent')
    }
  } catch {
    // Ignore analytics failures to avoid blocking the reading experience.
  }
}

export async function fetchSiteCounter() {
  const response = await fetch(SITE_COUNTER_ENDPOINT, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Counter fetch failed: ${response.status}`)
  }

  return (await response.json()) as SiteCounterSummary
}
