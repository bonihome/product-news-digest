import { readStoredStories, writeStoredStories } from '../src/pipeline/runtimeStore';

async function main() {
  const stories = await readStoredStories();
  let fixed = 0;
  for (const s of stories) {
    const m = s.checkedAt?.match(/(\d{4}-\d{2}-\d{2})/);
    if (m && m[1] !== s.checkedAt) {
      s.checkedAt = m[1];
      fixed++;
    }
  }
  console.log('Fixed:', fixed, '/', stories.length);
  await writeStoredStories(stories);
  console.log('Done');
}
main();
