import { publishRuntimeFeed } from '../src/pipeline/publisher'
import { readStoredStories } from '../src/pipeline/runtimeStore'

async function main() {
  const stories = await readStoredStories()
  await publishRuntimeFeed(stories)
  console.log('Published feed regenerated')
}

main()
