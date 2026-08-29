import crypto from 'node:crypto'

import type { BrandSnapshotRecord, CrawlCandidate, StoredStory } from './types'

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function createFingerprint(candidate: CrawlCandidate) {
  const payload = [
    normalizeText(candidate.brand),
    // NOTE: sourceTitle intentionally excluded — it can change between runs
    // (page <title> varies vs brand-name fallback), breaking deduplication.
    // brand + products + sourceUrl is sufficient for uniqueness.
    candidate.products.map(normalizeText).sort().join('|'),
    normalizeText(candidate.sourceUrl),
  ].join('::')

  return crypto.createHash('sha256').update(payload).digest('hex')
}

export function isDuplicateStory(existingStories: StoredStory[], fingerprint: string) {
  return existingStories.some((story) => story.fingerprint === fingerprint)
}

export function createBrandSnapshot(candidates: CrawlCandidate[], brand: string, checkedAt: string): BrandSnapshotRecord {
  const payload = candidates
    .map((candidate) =>
      [
        normalizeText(candidate.sourceUrl),
        normalizeText(candidate.sourceTitle),
        normalizeText(candidate.publishedAt),
        candidate.products.map(normalizeText).sort().join('|'),
      ].join('::'),
    )
    .sort()
    .join('||')

  return {
    brand,
    snapshotKey: crypto.createHash('sha256').update(payload || `${brand}::empty`).digest('hex'),
    candidateCount: candidates.length,
    checkedAt,
    sourceUrls: candidates.map((candidate) => candidate.sourceUrl),
    publishedAtValues: candidates.map((candidate) => candidate.publishedAt),
  }
}
