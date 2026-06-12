import nodemailer from 'nodemailer'

import {
  appendWeeklyAnalyticsReport,
  getRuntimePaths,
} from '../src/pipeline/runtimeStore'
import {
  generateWeeklyAnalyticsReport,
  sendWeeklyAnalyticsReport,
} from '../src/pipeline/weeklyReport'
import {
  archiveOverdueRejections,
} from '../src/pipeline/rejection-archiver'
import {
  monitorRejections,
  type RejectionEntry,
} from '../src/pipeline/rejection-monitor'

function parseRecipients(value: string | undefined) {
  const raw = value?.trim() || 'boni.sa@outlook.com'
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readReportSmtpConfig() {
  const from = process.env.REPORT_EMAIL_FROM?.trim() || process.env.ALERT_EMAIL_FROM?.trim()
  const smtpPass = process.env.REPORT_SMTP_PASS?.trim() || process.env.ALERT_SMTP_PASS?.trim()

  if (!from || !smtpPass) return null

  return {
    to: parseRecipients(process.env.REPORT_EMAIL_TO),
    from,
    smtpHost: process.env.REPORT_SMTP_HOST?.trim() || process.env.ALERT_SMTP_HOST?.trim() || 'smtp.office365.com',
    smtpPort: Number(process.env.REPORT_SMTP_PORT ?? process.env.ALERT_SMTP_PORT ?? '587'),
    secure: ['1', 'true', 'yes', 'on'].includes(
      (process.env.REPORT_SMTP_SECURE ?? process.env.ALERT_SMTP_SECURE ?? 'false').trim().toLowerCase(),
    ),
    smtpUser: process.env.REPORT_SMTP_USER?.trim() || process.env.ALERT_SMTP_USER?.trim() || from,
    smtpPass,
  }
}

function buildRejectionMonitorText(
  monitor: Awaited<ReturnType<typeof monitorRejections>>,
  archiver: Awaited<ReturnType<typeof archiveOverdueRejections>>,
) {
  const lines: string[] = []
  lines.push('产品新闻站 - Publisher 校验未处理周报')
  lines.push('')
  lines.push(`检查时间: ${monitor.checkedAt}`)
  lines.push(`总 reject 行数: ${monitor.totalRejections}`)
  lines.push(`独立 id 数: ${monitor.uniqueRejectedIds}`)
  lines.push(`已 resolved 数: ${monitor.resolvedCount}`)
  lines.push(`未处理数: ${monitor.unresolved.length}`)
  lines.push(`应归档数(age≥30天): ${monitor.shouldArchiveIds.length}`)
  lines.push(`本周新归档: ${archiver.archivedCount}`)
  lines.push('')

  if (archiver.archivedCount > 0) {
    lines.push('==== 本周归档 ====')
    lines.push('')
    for (const id of archiver.archivedIds) {
      lines.push(`  - ${id}`)
    }
    lines.push('')
  }

  lines.push('==== 未处理 reject 列表（全量）====')
  lines.push('')

  if (monitor.unresolved.length === 0) {
    lines.push('✨ 当前无未处理 reject 条目。')
  } else {
    const byBrand = new Map<string, RejectionEntry[]>()
    for (const entry of monitor.unresolved) {
      const list = byBrand.get(entry.brand) ?? []
      list.push(entry)
      byBrand.set(entry.brand, list)
    }

    for (const [brand, entries] of byBrand) {
      lines.push(`【${brand}】(${entries.length} 条)`)
      for (const entry of entries) {
        const archiveTag = entry.shouldArchive ? ' [⏰ 应归档]' : ''
        lines.push(`  - id=${entry.id} age=${entry.ageDays}天 hit=${entry.hitCount}${archiveTag}`)
        lines.push(`    首次 reject: ${entry.firstRejectedAt}`)
        lines.push(`    最近 reject: ${entry.lastRejectedAt}`)
        lines.push(`    原因: ${entry.reason}`)
        lines.push(`    标题: ${entry.title}`)
        lines.push(`    URL: ${entry.sourceUrl}`)
      }
      lines.push('')
    }
  }

  lines.push('==== 处理方法 ====')
  lines.push('1. 编辑 data/rejections/publisher-rejections.resolved 添加一行：')
  lines.push('   resolved_at=<ISO> id=<id> resolution=<kind> note=<note>')
  lines.push('2. resolution 取值：fixed-data / loosened-rule / false-positive / other')
  lines.push('3. 标记后下次周报该条不再出现')
  lines.push('4. age≥30天未处理的下次周报会被自动归档到 data/archives/news-items.archived.json')

  return lines.join('\n')
}

async function sendRejectionMonitorEmail(
  monitor: Awaited<ReturnType<typeof monitorRejections>>,
  archiver: Awaited<ReturnType<typeof archiveOverdueRejections>>,
) {
  const enabled = !['0', 'false', 'no', 'off'].includes(
    (process.env.REPORT_EMAIL_ENABLED ?? 'true').trim().toLowerCase(),
  )

  if (!enabled) {
    return { status: 'skipped' as const, reason: 'disabled by REPORT_EMAIL_ENABLED' }
  }

  const config = readReportSmtpConfig()
  if (!config) {
    return { status: 'skipped' as const, reason: 'missing report smtp config' }
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.secure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  })

  const text = buildRejectionMonitorText(monitor, archiver)
  const subjectDate = monitor.checkedAt.slice(0, 10)

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: config.to.join(', '),
      subject: `[Product News Rejection Monitor] ${subjectDate} - 未处理 ${monitor.unresolved.length} 条, 本周归档 ${archiver.archivedCount} 条`,
      text,
      html: `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1.6;">${text}</pre>`,
    })
    return { status: 'sent' as const, messageId: info.messageId, recipientCount: config.to.length }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'send failed'
    return { status: 'failed' as const, reason }
  }
}

async function main() {
  // ── Step 1: 跑点击周报（既有）──
  const report = await generateWeeklyAnalyticsReport()
  await appendWeeklyAnalyticsReport(report)
  const emailResult = await sendWeeklyAnalyticsReport(report)
  const paths = getRuntimePaths()

  // ── Step 2: 跑 reject 监控 + 归档（2026-06-12 引入）──
  // 先跑归档（在邮件发送前，确保 archivedCount 反映本轮动作）
  const archiverResult = await archiveOverdueRejections()
  // 再跑 monitor（获取归档后的 unresolved 列表）
  const monitorResult = await monitorRejections()

  // ── Step 3: 发 reject 监控邮件（新增）──
  const rejectionEmailResult = await sendRejectionMonitorEmail(monitorResult, archiverResult)

  console.log('Weekly report completed')
  console.log(`Report window: ${report.windowStart} -> ${report.windowEnd}`)
  console.log(`Total clicks: ${report.totalClicks}`)
  console.log(`Reports file: ${paths.analyticsReportsPath}`)
  console.log(
    `Weekly report email: ${emailResult.status}${'reason' in emailResult ? ` (${emailResult.reason})` : ''}`,
  )
  console.log(
    `Rejection monitor: unresolved=${monitorResult.unresolved.length} shouldArchive=${monitorResult.shouldArchiveIds.length} archivedThisRun=${archiverResult.archivedCount}`,
  )
  console.log(
    `Rejection monitor email: ${rejectionEmailResult.status}${'reason' in rejectionEmailResult ? ` (${rejectionEmailResult.reason})` : ''}`,
  )
}

void main().catch((error) => {
  console.error('Weekly report failed')
  console.error(error)
  process.exitCode = 1
})
