/**
 * Fix bad Chanel images — replace tiny logo placeholders with Bing search results.
 * Usage: npx tsx scripts/fix-chanel-images.ts
 */
import { readStoredStories, writeStoredStories } from '../src/pipeline/runtimeStore';
import { publishRuntimeFeed } from '../src/pipeline/publisher';
import { localizeStoryImages } from '../src/pipeline/imageStore';
import { searchProductImage } from '../src/pipeline/imageSearch';
import * as fs from 'fs';
import * as path from 'path';

const BAD_IDS = new Set(['chanel-coco-crush', 'chanel', 'chanel-j12-superleggera']);

async function main() {
  const stories = await readStoredStories();
  console.log(`Total stories: ${stories.length}`);

  let fixed = 0;
  for (const story of stories) {
    if (!BAD_IDS.has(story.id)) continue;

    const imgPath = path.join('/srv/product-news-digest/public', story.image || '');
    if (fs.existsSync(imgPath)) {
      const stat = fs.statSync(imgPath);
      if (stat.size > 20000) {
        console.log(`  SKIP ${story.id}: ${stat.size} bytes — already OK`);
        continue;
      }
      console.log(`  BAD ${story.id}: ${stat.size} bytes — searching replacement...`);
    } else {
      console.log(`  MISSING ${story.id}: file not found`);
    }

    // Build search query from title - extract product name
    const title = story.title || '';
    const products = (story.products || []).join(' ');
    const query = `${story.brand} ${products || title.replace(/^.*推出 /,'').replace(/，.*$/,'')}`;
    console.log(`    Search: "${query}"`);

    const imageUrl = await searchProductImage(story.brand, products || story.title);
    if (imageUrl) {
      console.log(`    Found: ${imageUrl.substring(0, 80)}...`);
      story.image = imageUrl; // will be localized by localizeStoryImages
      fixed++;
    } else {
      console.log(`    No results found`);
    }
  }

  console.log(`\nFixed ${fixed} images`);

  if (fixed > 0) {
    await localizeStoryImages(stories);
    await writeStoredStories(stories);
    await publishRuntimeFeed(stories);
    console.log('Feed regenerated.');
  }
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
