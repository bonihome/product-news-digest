import nodemailer from 'nodemailer'

import { readAnalyticsEvents } from './runtimeStore'
import type {
  AnalyticsStoryClickEvent,
  BrandTransitionRecord,
  WeeklyAnalyticsReport,
} from './types'

function parseRecipients(value: string | undefined) {
  const raw = value?.trim() || 'boni.sa@outlook.com'
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readReportWindowDays() {
  const raw = Number(process.env.WEEKLY_REPORT_WINDOW_DAYS ?? '7')
  return Number.isFinite(raw) && raw > 0 ? raw : 7
}

function readWeeklyReportConfig() {
  const from = process.env.REPORT_EMAIL_FROM?.trim() || process.env.ALERT_EMAIL_FROM?.trim()
  const smtpPass = process.env.REPORT_SMTP_PASS?.trim() || process.env.ALERT_SMTP_PASS?.trim()

  if (!from || !smtpPass) {
    return null
  }

  return {
    to: parseRecipients(process.env.REPORT_EMAIL_TO),
    from,
    smtpHost: process.env.REPORT_SMTP_HOST?.trim() || process.env.ALERT_SMTP_HOST?.trim() || 'smtp.office365.com',
    smtpPort: Number(process.env.REPORT_SMTP_PORT ?? process.env.ALERT_SMTP_PORT ?? '587'),
    secure: ['1', 'true', 'yes', 'on'].includes(
      (process.env.REPORT_SMTP_SECURE ?? process.env.ALERT_SMTP_SECURE ?? 'false').trim().toLowerCase(),
    ),
    smtpUser:
      process.env.REPORT_SMTP_USER?.trim() || process.env.ALERT_SMTP_USER?.trim() || from,
    smtpPass,
    subjectPrefix:
      process.env.REPORT_EMAIL_SUBJECT_PREFIX?.trim() || '[Product News Weekly Report]',
  }
}

function buildBrandTransitions(events: AnalyticsStoryClickEvent[]): BrandTransitionRecord[] {
  const byVisitor = new Map<string, AnalyticsStoryClickEvent[]>()

  for (const event of events) {
    const key = `${event.visitorId}:${event.sessionId}`
    const existing = byVisitor.get(key) ?? []
    existing.push(event)
    byVisitor.set(key, existing)
  }

  const transitionCounts = new Map<string, number>()

  for (const visitorEvents of byVisitor.values()) {
    visitorEvents.sort((a, b) => a.clickedAt.localeCompare(b.clickedAt))

    for (let index = 1; index < visitorEvents.length; index += 1) {
      const previous = visitorEvents[index - 1]
      const current = visitorEvents[index]

      if (previous.brand === current.brand) {
        continue
      }

      const key = `${previous.brand}|||${current.brand}`
      transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1)
    }
  }

  return Array.from(transitionCounts.entries())
    .map(([key, count]) => {
      const [fromBrand, toBrand] = key.split('|||')
      return { fromBrand, toBrand, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export async function generateWeeklyAnalyticsReport() {
  const now = new Date()
  const days = readReportWindowDays()
  const windowEnd = now.toISOString()
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  const events = await readAnalyticsEvents()
  const weeklyEvents = events.filter((event) => event.clickedAt >= windowStart && event.clickedAt <= windowEnd)

  const brandClicks = new Map<string, number>()
  const productClicks = new Map<string, number>()

  for (const event of weeklyEvents) {
    brandClicks.set(event.brand, (brandClicks.get(event.brand) ?? 0) + 1)

    for (const product of event.products) {
      const key = `${event.brand}|||${product}`
      productClicks.set(key, (productClicks.get(key) ?? 0) + 1)
    }
  }

  const report: WeeklyAnalyticsReport = {
    id: `weekly-${windowEnd.replaceAll(':', '-').replaceAll('.', '-')}`,
    generatedAt: windowEnd,
    windowStart,
    windowEnd,
    totalClicks: weeklyEvents.length,
    brandClicks: Array.from(brandClicks.entries())
      .map(([brand, clicks]) => ({ brand, clicks }))
      .sort((a, b) => b.clicks - a.clicks),
    productClicks: Array.from(productClicks.entries())
      .map(([key, clicks]) => {
        const [brand, product] = key.split('|||')
        return { brand, product, clicks }
      })
      .sort((a, b) => b.clicks - a.clicks),
    topBrandTransitions: buildBrandTransitions(weeklyEvents),
  }

  return report
}

function buildReportText(report: WeeklyAnalyticsReport) {
  const brandLines =
    report.brandClicks.length === 0
      ? ['- 本周暂无点击数据']
      : report.brandClicks.slice(0, 20).map((item) => `- ${item.brand}: ${item.clicks}`)

  const productLines =
    report.productClicks.length === 0
      ? ['- 本周暂无产品点击数据']
      : report.productClicks.slice(0, 30).map((item) => `- ${item.brand} / ${item.product}: ${item.clicks}`)

  const transitionLines =
    report.topBrandTransitions.length === 0
      ? ['- 本周暂无跨品牌连续点击数据']
      : report.topBrandTransitions.map((item) => `- ${item.fromBrand} -> ${item.toBrand}: ${item.count}`)

  return [
    '产品新闻站周报',
    '',
    `统计区间: ${report.windowStart} ~ ${report.windowEnd}`,
    `总点击量: ${report.totalClicks}`,
    '',
    '品牌点击排行:',
    ...brandLines,
    '',
    '产品点击排行:',
    ...productLines,
    '',
    '连续点击关联度最高的品牌组合:',
    ...transitionLines,
  ].join('\n')
}

export async function sendWeeklyAnalyticsReport(report: WeeklyAnalyticsReport) {
  const enabled = !['0', 'false', 'no', 'off'].includes(
    (process.env.REPORT_EMAIL_ENABLED ?? 'true').trim().toLowerCase(),
  )

  if (!enabled) {
    return { status: 'skipped' as const, reason: 'disabled by REPORT_EMAIL_ENABLED' }
  }

  const config = readWeeklyReportConfig()
  if (!config) {
    return { status: 'skipped' as const, reason: 'missing report smtp config' }
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.secure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  const text = buildReportText(report)
  const info = await transporter.sendMail({
    from: config.from,
    to: config.to.join(', '),
    subject: `${config.subjectPrefix} ${report.windowStart.slice(0, 10)} - ${report.windowEnd.slice(0, 10)}`,
    text,
    html: `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1.6;">${text}</pre>`,
  })

  return { status: 'sent' as const, messageId: info.messageId, recipientCount: config.to.length }
}
