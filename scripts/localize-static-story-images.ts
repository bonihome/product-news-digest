import fs from 'node:fs/promises'
import path from 'node:path'

import { beautyNews } from '../src/data/beautyNews.ts'
import { digitalNews } from '../src/data/digitalNews.ts'
import { luxuryNews } from '../src/data/luxuryNews.ts'
import { sportsNews } from '../src/data/sportsNews.ts'
import type { Story } from '../src/data/types.ts'

type Dataset = {
  filePath: string
  stories: Story[]
}

const DATASETS: Dataset[] = [
  {
    filePath: path.resolve('src/data/luxuryNews.ts'),
    stories: luxuryNews,
  },
  {
    filePath: path.resolve('src/data/beautyNews.ts'),
    stories: beautyNews,
  },
  {
    filePath: path.resolve('src/data/sportsNews.ts'),
    stories: sportsNews,
  },
  {
    filePath: path.resolve('src/data/digitalNews.ts'),
    stories: digitalNews,
  },
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function inferExtension(url: string, contentType: string | null) {
  if (contentType?.includes('png')) {
    return '.png'
  }
  if (contentType?.includes('webp')) {
    return '.webp'
  }
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
    return '.jpg'
  }

  try {
    const pathname = new URL(url).pathname.toLowerCase()
    const match = pathname.match(/\.(png|webp|jpg|jpeg)$/)
    if (match) {
      return `.${match[1] === 'jpeg' ? 'jpg' : match[1]}`
    }
  } catch {
    return '.jpg'
  }

  return '.jpg'
}

async function downloadImage(story: Story) {
  const response = await fetch(story.image, {
    signal: AbortSignal.timeout(20_000),
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      referer: story.sourceUrl,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const ext = inferExtension(story.image, response.headers.get('content-type'))
  const relativeDir = `/news/${story.category}`
  const relativePath = `${relativeDir}/${story.id}${ext}`
  const absoluteDir = path.resolve(`public${relativeDir}`)
  const absolutePath = path.resolve(`public${relativePath}`)
  await fs.mkdir(absoluteDir, { recursive: true })
  await fs.writeFile(absolutePath, Buffer.from(await response.arrayBuffer()))
  return relativePath
}

function replaceStoryImage(fileContent: string, storyId: string, nextImagePath: string) {
  const pattern = new RegExp(`(id:\\s*'${escapeRegExp(storyId)}'[\\s\\S]*?image:\\s*)'[^']+'`)
  return fileContent.replace(pattern, `$1'${nextImagePath}'`)
}

async function main() {
  const failures: Array<{ id: string; brand: string; filePath: string; image: string; reason: string }> = []

  for (const dataset of DATASETS) {
    let fileContent = await fs.readFile(dataset.filePath, 'utf8')

    for (const story of dataset.stories.filter((item) => item.image.startsWith('http'))) {
      try {
        const localPath = await downloadImage(story)
        fileContent = replaceStoryImage(fileContent, story.id, localPath)
        console.log(`localized\t${story.id}\t${localPath}`)
      } catch (error) {
        failures.push({
          id: story.id,
          brand: story.brand,
          filePath: dataset.filePath,
          image: story.image,
          reason: error instanceof Error ? error.message : 'unknown error',
        })
        console.log(`failed\t${story.id}\t${story.image}\t${error instanceof Error ? error.message : 'unknown error'}`)
      }
    }

    await fs.writeFile(dataset.filePath, fileContent)
    console.log(`written\t${path.relative(process.cwd(), dataset.filePath)}`)
  }

  if (failures.length > 0) {
    console.log('\nFailures:')
    for (const failure of failures) {
      console.log(JSON.stringify(failure))
    }
    process.exitCode = 1
  }
}

await main()
