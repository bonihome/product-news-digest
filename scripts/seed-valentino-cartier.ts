import { getEnabledBrandSources } from '../src/pipeline/brandSources';
import { probeBrandSource, fetchCandidatesForBrand } from '../src/pipeline/fetchCandidates';
import { createBrandSnapshot, createFingerprint, isDuplicateStory } from '../src/pipeline/dedupe';
import { generateStoryFromCandidate } from '../src/pipeline/newsWriter';
import { localizeStoryImages } from '../src/pipeline/imageStore';
import { readStoredStories, readBrandSnapshots, writeStoredStories, writeBrandSnapshots } from '../src/pipeline/runtimeStore';
import { publishRuntimeFeed } from '../src/pipeline/publisher';

async function main() {
  const brandNames = process.argv.slice(2);
  const targets = brandNames.length > 0 ? brandNames : ['Valentino', 'Cartier'];
  
  const allSources = getEnabledBrandSources();
  const rules = allSources.filter(s => targets.includes(s.brand));
  console.log(`Processing ${rules.length} entries for: ${targets.join(', ')}`);
  
  const existingStories = await readStoredStories();
  const existingSnapshots = await readBrandSnapshots();
  let totalAdded = 0;
  
  for (const rule of rules) {
    console.log(`\n=== ${rule.brand} / ${rule.subcategory}: ${rule.sourceLabel} ===`);
    console.log(`  URL: ${rule.listUrl}`);
    
    try {
      const probes = await probeBrandSource(rule);
      console.log(`  Probes: ${probes.length}`);
      
      if (probes.length === 0) {
        console.log('  No probes found, skipping');
        continue;
      }
      
      const candidates = await fetchCandidatesForBrand(rule, probes);
      console.log(`  Candidates: ${candidates.length}`);
      
      let added = 0;
      for (const candidate of candidates) {
        const fingerprint = createFingerprint(candidate);
        const generation = await generateStoryFromCandidate(rule, candidate, fingerprint);
        
        if (!generation.shouldPublish || !generation.story) {
          console.log(`  × Candidate rejected: ${generation.reason}`);
          continue;
        }
        
        const story = generation.story;
        const existingIdx = existingStories.findIndex(
          item => item.id === story.id || item.fingerprint === fingerprint
        );
        
        if (existingIdx >= 0) {
          console.log(`  ○ Refreshed: ${story.id}`);
          existingStories[existingIdx] = story;
        } else if (!isDuplicateStory(existingStories, fingerprint)) {
          console.log(`  + NEW: ${story.id}`);
          existingStories.push(story);
          added++;
        }
      }
      
      totalAdded += added;
      
      // Save snapshot
      const snapshot = createBrandSnapshot(
        probes.map(p => ({
          brand: p.brand,
          category: p.category,
          subcategory: p.subcategory,
          sourceType: rule.sourceType,
          sourceLabel: rule.sourceLabel,
          sourceUrl: p.sourceUrl,
          sourceTitle: p.sourceTitle,
          sourceSummary: '',
          products: p.products,
          image: '',
          checkedAt: new Date().toISOString().slice(0, 10),
          publishedAt: p.publishedAt,
          matchedKeywords: p.matchedKeywords,
        })),
        rule.brand,
        new Date().toISOString()
      );
      
      const existingIdx = existingSnapshots.findIndex(s => s.brand === rule.brand);
      if (existingIdx >= 0) {
        existingSnapshots[existingIdx] = snapshot;
      } else {
        existingSnapshots.push(snapshot);
      }
      
    } catch (e) {
      console.log(`  ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  console.log(`\n=== Summary: Added ${totalAdded} new stories ===`);
  
  if (totalAdded > 0) {
    await localizeStoryImages(existingStories);
    await writeStoredStories(existingStories);
    await publishRuntimeFeed(existingStories);
    console.log(`Total stories now: ${existingStories.length}`);
  }
  
  await writeBrandSnapshots(existingSnapshots);
  console.log('Done!');
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
