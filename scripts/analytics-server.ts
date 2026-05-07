import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'

import { appendAnalyticsEvent, appendSiteVisitEvent, readSiteCounterSummary } from '../src/pipeline/runtimeStore'
import type { AnalyticsStoryClickEvent, SiteVisitEvent } from '../src/pipeline/types'

type RequestPayload = {
  storyId: string
  brand: string
  category: AnalyticsStoryClickEvent['category']
  subcategory: string
  products: string[]
  visitorId: string
  sessionId: string
  path: string
  clickedAt: string
  referrer?: string
}

type SiteVisitPayload = {
  visitorId: string
  sessionId: string
  path: string
  visitedAt: string
  referrer?: string
}

function readPort() {
  const raw = Number(process.env.ANALYTICS_SERVER_PORT ?? '8787')
  return Number.isFinite(raw) && raw > 0 ? raw : 8787
}

function setCorsHeaders(response: import('node:http').ServerResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function isValidPayload(payload: Partial<RequestPayload>): payload is RequestPayload {
  return Boolean(
    payload.storyId &&
      payload.brand &&
      payload.category &&
      payload.subcategory &&
      Array.isArray(payload.products) &&
      payload.visitorId &&
      payload.sessionId &&
      payload.path &&
      payload.clickedAt,
  )
}

function isValidSiteVisitPayload(payload: Partial<SiteVisitPayload>): payload is SiteVisitPayload {
  return Boolean(payload.visitorId && payload.sessionId && payload.path && payload.visitedAt)
}

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ ok: true }))
    return
  }

  if (request.method === 'GET' && request.url === '/api/analytics/site-counter') {
    const summary = await readSiteCounterSummary()
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(summary))
    return
  }

  if (request.method === 'POST' && request.url === '/api/analytics/site-visit') {
    try {
      const chunks: Buffer[] = []
      for await (const chunk of request) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }

      const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Partial<SiteVisitPayload>
      if (!isValidSiteVisitPayload(parsed)) {
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Invalid payload' }))
        return
      }

      const event: SiteVisitEvent = {
        id: randomUUID(),
        visitorId: parsed.visitorId,
        sessionId: parsed.sessionId,
        path: parsed.path,
        visitedAt: parsed.visitedAt,
        referrer: parsed.referrer,
        userAgent: request.headers['user-agent'],
      }

      await appendSiteVisitEvent(event)
      const summary = await readSiteCounterSummary()

      response.writeHead(202, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ ok: true, totalVisitors: summary.totalVisitors }))
      return
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      )
      return
    }
  }

  if (request.method !== 'POST' || request.url !== '/api/analytics/story-click') {
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  try {
    const chunks: Buffer[] = []
    for await (const chunk of request) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Partial<RequestPayload>
    if (!isValidPayload(parsed)) {
      response.writeHead(400, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: 'Invalid payload' }))
      return
    }

    const event: AnalyticsStoryClickEvent = {
      id: randomUUID(),
      storyId: parsed.storyId,
      brand: parsed.brand,
      category: parsed.category,
      subcategory: parsed.subcategory,
      products: parsed.products,
      visitorId: parsed.visitorId,
      sessionId: parsed.sessionId,
      path: parsed.path,
      clickedAt: parsed.clickedAt,
      referrer: parsed.referrer,
      userAgent: request.headers['user-agent'],
    }

    await appendAnalyticsEvent(event)

    response.writeHead(202, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ ok: true, id: event.id }))
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json' })
    response.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    )
  }
})

server.listen(readPort(), '0.0.0.0', () => {
  console.log(`Analytics server listening on ${readPort()}`)
})
