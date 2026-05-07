import { getRuntimePaths } from '../src/pipeline/runtimeStore'
import { runPipeline } from '../src/pipeline/pipeline'

function parseArgs(args: string[]) {
  return {
    dryRun: args.includes('--dry-run'),
    mode: args.includes('--scheduled') ? 'scheduled' : 'manual',
  } as const
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const result = await runPipeline(options)
  const paths = getRuntimePaths()

  console.log('Pipeline completed')
  console.log(`Mode: ${result.run.mode}`)
  console.log(`Dry run: ${result.run.dryRun ? 'yes' : 'no'}`)
  console.log(`Added stories: ${result.run.addedCount}`)
  console.log(`Runtime stories file: ${paths.storiesPath}`)
  console.log(`Runtime runs file: ${paths.runsPath}`)
  console.log(`Runtime image assets file: ${paths.imageAssetsPath}`)
  console.log(`Runtime snapshots file: ${paths.snapshotsPath}`)
  console.log(`Runtime alerts file: ${paths.alertsPath}`)
  console.log(`Published feed file: ${paths.publicPublishedFeedPath}`)
  console.log(
    `Alert email: ${result.alertEmail.status}${'reason' in result.alertEmail ? ` (${result.alertEmail.reason})` : ''}`,
  )

  for (const item of result.run.items) {
    console.log(`- ${item.brand}: ${item.status} (${item.addedCount}) ${item.message}`)
  }
}

void main().catch((error) => {
  console.error('Pipeline failed')
  console.error(error)
  process.exitCode = 1
})
