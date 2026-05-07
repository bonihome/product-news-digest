import { appendWeeklyAnalyticsReport, getRuntimePaths } from '../src/pipeline/runtimeStore'
import { generateWeeklyAnalyticsReport, sendWeeklyAnalyticsReport } from '../src/pipeline/weeklyReport'

async function main() {
  const report = await generateWeeklyAnalyticsReport()
  await appendWeeklyAnalyticsReport(report)
  const emailResult = await sendWeeklyAnalyticsReport(report)
  const paths = getRuntimePaths()

  console.log('Weekly report completed')
  console.log(`Report window: ${report.windowStart} -> ${report.windowEnd}`)
  console.log(`Total clicks: ${report.totalClicks}`)
  console.log(`Reports file: ${paths.analyticsReportsPath}`)
  console.log(
    `Weekly report email: ${emailResult.status}${'reason' in emailResult ? ` (${emailResult.reason})` : ''}`,
  )
}

void main().catch((error) => {
  console.error('Weekly report failed')
  console.error(error)
  process.exitCode = 1
})
