import nodemailer from 'nodemailer'

import type { CrawlRun, PipelineAlert } from './types'

export type AlertEmailResult =
  | { status: 'sent'; messageId: string; recipientCount: number }
  | { status: 'skipped'; reason: string }

type AlertEmailConfig = {
  to: string[]
  from: string
  smtpHost: string
  smtpPort: number
  secure: boolean
  smtpUser: string
  smtpPass: string
  subjectPrefix: string
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

function parseRecipients(value: string | undefined) {
  const raw = value?.trim() || 'boni.sa@outlook.com'
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readAlertEmailConfig(): AlertEmailConfig | null {
  const from = process.env.ALERT_EMAIL_FROM?.trim()
  const smtpPass = process.env.ALERT_SMTP_PASS?.trim()

  if (!from || !smtpPass) {
    return null
  }

  return {
    to: parseRecipients(process.env.ALERT_EMAIL_TO),
    from,
    smtpHost: process.env.ALERT_SMTP_HOST?.trim() || 'smtp.office365.com',
    smtpPort: Number(process.env.ALERT_SMTP_PORT ?? '587'),
    secure: parseBoolean(process.env.ALERT_SMTP_SECURE, false),
    smtpUser: process.env.ALERT_SMTP_USER?.trim() || from,
    smtpPass,
    subjectPrefix: process.env.ALERT_EMAIL_SUBJECT_PREFIX?.trim() || '[Product News Pipeline]',
  }
}

function buildSubject(run: CrawlRun, alerts: PipelineAlert[], subjectPrefix: string) {
  const errorCount = alerts.filter((alert) => alert.level === 'error').length
  const warningCount = alerts.length - errorCount
  return `${subjectPrefix} ${run.mode === 'scheduled' ? '定时' : '手动'}告警 ${errorCount} error / ${warningCount} warning`
}

function buildPlainText(run: CrawlRun, alerts: PipelineAlert[]) {
  const lines = [
    '产品新闻流水线告警摘要',
    '',
    `Run ID: ${run.id}`,
    `Mode: ${run.mode}`,
    `Dry run: ${run.dryRun ? 'yes' : 'no'}`,
    `Started at: ${run.startedAt}`,
    `Finished at: ${run.finishedAt ?? ''}`,
    `Added stories: ${run.addedCount}`,
    '',
    'Alerts:',
  ]

  for (const alert of alerts) {
    lines.push(`- [${alert.level.toUpperCase()}] ${alert.brand} ${alert.message} (${alert.createdAt})`)
  }

  lines.push('', 'Brand results:')
  for (const item of run.items) {
    lines.push(`- ${item.brand}: ${item.status} (${item.addedCount}) ${item.message}`)
  }

  return lines.join('\n')
}

function buildHtml(run: CrawlRun, alerts: PipelineAlert[]) {
  const rows = alerts
    .map(
      (alert) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${alert.level}</td>
          <td style="padding:8px;border:1px solid #ddd;">${alert.brand}</td>
          <td style="padding:8px;border:1px solid #ddd;">${alert.message}</td>
          <td style="padding:8px;border:1px solid #ddd;">${alert.createdAt}</td>
        </tr>
      `,
    )
    .join('')

  const items = run.items
    .map(
      (item) => `
        <li style="margin-bottom:6px;">
          <strong>${item.brand}</strong>: ${item.status} (${item.addedCount}) ${item.message}
        </li>
      `,
    )
    .join('')

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f1a17;line-height:1.6;">
      <h2 style="margin-bottom:8px;">产品新闻流水线告警摘要</h2>
      <p style="margin:0 0 16px;">
        Run ID: <strong>${run.id}</strong><br />
        Mode: <strong>${run.mode}</strong><br />
        Added stories: <strong>${run.addedCount}</strong>
      </p>
      <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Level</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Brand</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Message</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Created At</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <h3 style="margin-bottom:8px;">本轮品牌执行结果</h3>
      <ul style="padding-left:20px;margin:0;">${items}</ul>
    </div>
  `
}

export async function sendPipelineAlertsEmail(run: CrawlRun, alerts: PipelineAlert[]): Promise<AlertEmailResult> {
  if (alerts.length === 0) {
    return { status: 'skipped', reason: 'no alerts' }
  }

  const enabled = parseBoolean(process.env.ALERT_EMAIL_ENABLED, true)
  if (!enabled) {
    return { status: 'skipped', reason: 'disabled by ALERT_EMAIL_ENABLED' }
  }

  const config = readAlertEmailConfig()
  if (!config) {
    return { status: 'skipped', reason: 'missing ALERT_EMAIL_FROM or ALERT_SMTP_PASS' }
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

  const info = await transporter.sendMail({
    from: config.from,
    to: config.to.join(', '),
    subject: buildSubject(run, alerts, config.subjectPrefix),
    text: buildPlainText(run, alerts),
    html: buildHtml(run, alerts),
  })

  return {
    status: 'sent',
    messageId: info.messageId,
    recipientCount: config.to.length,
  }
}
