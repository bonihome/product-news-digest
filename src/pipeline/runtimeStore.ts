import { mkdir, readFile, writeFile, cp } from 'node:fs/promises'
import path from 'node:path'

import type { PublishedFeed } from '../data/types'
import type {
  AnalyticsStoryClickEvent,
  BrandSnapshotRecord,
  CrawlRun,
  ImageAssetRecord,
  PipelineAlert,
  SiteCounterSummary,
  SiteVisitEvent,
  StoredStory,
  WeeklyAnalyticsReport,
} from './types'

const runtimeDir = path.resolve(process.cwd(), 'data/runtime')
const storiesPath = path.join(runtimeDir, 'news-items.json')
const runsPath = path.join(runtimeDir, 'crawl-runs.json')
const imageAssetsPath = path.join(runtimeDir, 'image-assets.json')
const snapshotsPath = path.join(runtimeDir, 'brand-snapshots.json')
const alertsPath = path.join(runtimeDir, 'pipeline-alerts.json')
const analyticsEventsPath = path.join(runtimeDir, 'analytics-events.json')
const siteVisitsPath = path.join(runtimeDir, 'site-visits.json')
const analyticsReportsPath = path.join(runtimeDir, 'weekly-analytics-reports.json')
const databasePath = path.join(runtimeDir, 'pipeline.db')
const publishedFeedPath = path.join(runtimeDir, 'published-feed.json')
const publicRuntimeDir = path.resolve(process.cwd(), 'public/runtime')
const publicStoriesPath = path.join(publicRuntimeDir, 'news-items.json')
const publicPublishedFeedPath = path.join(publicRuntimeDir, 'published-feed.json')

async function ensureRuntimeDir() {
  await mkdir(runtimeDir, { recursive: true })
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const contents = await readFile(filePath, 'utf8')
    return JSON.parse(contents) as T
  } catch {
    return fallback
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureRuntimeDir()
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function readStoredStories() {
  return readJsonFile<StoredStory[]>(storiesPath, [])
}

export async function writeStoredStories(stories: StoredStory[]) {
  await writeJsonFile(storiesPath, stories)
  await mkdir(publicRuntimeDir, { recursive: true })
  await writeFile(publicStoriesPath, `${JSON.stringify(stories, null, 2)}\n`, 'utf8')
}

export async function appendCrawlRun(run: CrawlRun) {
  const runs = await readJsonFile<CrawlRun[]>(runsPath, [])
  runs.unshift(run)
  await writeJsonFile(runsPath, runs)
}

export async function readImageAssets() {
  return readJsonFile<ImageAssetRecord[]>(imageAssetsPath, [])
}

export async function writeImageAssets(imageAssets: ImageAssetRecord[]) {
  await writeJsonFile(imageAssetsPath, imageAssets)
}

export async function readBrandSnapshots() {
  return readJsonFile<BrandSnapshotRecord[]>(snapshotsPath, [])
}

export async function writeBrandSnapshots(snapshots: BrandSnapshotRecord[]) {
  await writeJsonFile(snapshotsPath, snapshots)
}

export async function appendPipelineAlerts(alerts: PipelineAlert[]) {
  if (alerts.length === 0) {
    return
  }

  const existingAlerts = await readJsonFile<PipelineAlert[]>(alertsPath, [])
  existingAlerts.unshift(...alerts)
  await writeJsonFile(alertsPath, existingAlerts.slice(0, 200))
}

export async function readAnalyticsEvents() {
  return readJsonFile<AnalyticsStoryClickEvent[]>(analyticsEventsPath, [])
}

export async function appendAnalyticsEvent(event: AnalyticsStoryClickEvent) {
  const events = await readAnalyticsEvents()
  events.unshift(event)
  await writeJsonFile(analyticsEventsPath, events.slice(0, 50000))
}

export async function readSiteVisitEvents() {
  return readJsonFile<SiteVisitEvent[]>(siteVisitsPath, [])
}

export async function appendSiteVisitEvent(event: SiteVisitEvent) {
  const events = await readSiteVisitEvents()
  if (events.some((item) => item.visitorId === event.visitorId)) {
    return false
  }

  events.unshift(event)
  await writeJsonFile(siteVisitsPath, events.slice(0, 200000))
  return true
}

export async function readSiteCounterSummary(): Promise<SiteCounterSummary> {
  const events = await readSiteVisitEvents()
  return {
    totalVisitors: new Set(events.map((event) => event.visitorId)).size,
  }
}

export async function readWeeklyAnalyticsReports() {
  return readJsonFile<WeeklyAnalyticsReport[]>(analyticsReportsPath, [])
}

export async function appendWeeklyAnalyticsReport(report: WeeklyAnalyticsReport) {
  const reports = await readWeeklyAnalyticsReports()
  reports.unshift(report)
  await writeJsonFile(analyticsReportsPath, reports.slice(0, 52))
}

export async function writePublishedFeed(feed: PublishedFeed) {
  await writeJsonFile(publishedFeedPath, feed)
  await mkdir(publicRuntimeDir, { recursive: true })
  await writeFile(publicPublishedFeedPath, `${JSON.stringify(feed, null, 2)}\n`, 'utf8')
}

/**
 * Sync data/runtime/news-images → public/runtime/news-images.
 * Used after downloading product images so nginx serves the latest files.
 * Resolves at the end of pipeline/seed runs to keep public dir in sync.
 */
export async function syncNewsImages() {
  const srcDir = path.join(runtimeDir, 'news-images')
  const dstDir = path.join(publicRuntimeDir, 'news-images')
  await mkdir(dstDir, { recursive: true })
  await cp(srcDir, dstDir, { recursive: true, force: true })
}

export function getRuntimePaths() {
  return {
    runtimeDir,
    storiesPath,
    runsPath,
    imageAssetsPath,
    snapshotsPath,
    alertsPath,
    analyticsEventsPath,
    siteVisitsPath,
    analyticsReportsPath,
    databasePath,
    publishedFeedPath,
    publicStoriesPath,
    publicPublishedFeedPath,
  }
}
