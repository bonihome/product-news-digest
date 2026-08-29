/**
 * Seed LV static stories extracted from new product pages.
 * Usage: npx tsx scripts/seed-lv-static.ts
 */
import { readStoredStories, writeStoredStories } from '../src/pipeline/runtimeStore';
import { publishRuntimeFeed } from '../src/pipeline/publisher';
import { localizeStoryImages } from '../src/pipeline/imageStore';

async function main() {
  const now = new Date().toISOString();

  const newStories = [
    {
      id: 'lv-high-summer',
      category: 'luxury' as const,
      subcategory: '夏季系列',
      brand: 'Louis Vuitton',
      title: "Louis Vuitton 推出 高领针织上衣，High Summer 夏季系列新品阵容继续扩展",
      publishedAt: '2026-07-09',
      checkedAt: now,
      sourceType: 'Official Site',
      sourceLabel: 'LV High Summer 系列',
      sourceUrl: 'https://www.louisvuitton.cn/zhs-cn/products/high-neck-knit-top-nvprod7610311v/1AKDZE',
      image: 'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-%E9%AB%98%E9%A2%86%E9%92%88%E7%BB%87%E4%B8%8A%E8%A1%A3--FVKM04C7G002_PM2_Front%20view.png?wid=490&hei=490',
      summary: 'Louis Vuitton High Summer 系列页面当前首个产品为高领针织上衣，已作为夏季系列新品候选写入。',
      products: ['高领针织上衣', 'High Summer', 'Neverfull BB LV&I'],
      sourceTitle: 'High Summer 系列 高领针织上衣',
      fingerprint: 'LV::高领针织上衣,High Summer,Neverfull BB LV&I::https://www.louisvuitton.cn/zhs-cn/products/high-neck-knit-top-nvprod7610311v/1AKDZE',
    },
    {
      id: 'lv-sports-capsule',
      category: 'luxury' as const,
      subcategory: '线上首发',
      brand: 'Louis Vuitton',
      title: "Louis Vuitton 推出 LV Trainer 运动鞋，Sports 胶囊系列线上首发",
      publishedAt: '2026-07-09',
      checkedAt: now,
      sourceType: 'Official Site',
      sourceLabel: 'LV Sports 胶囊系列',
      sourceUrl: 'https://www.louisvuitton.cn/zhs-cn/products/lv-trainer-sneaker-nvprod7670122v/1AKRAI',
      image: 'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-lv-trainer-%E8%BF%90%E5%8A%A8%E9%9E%8B--BWU0B1GC45_PM2_Front%20view.png?wid=490&hei=490',
      summary: 'Louis Vuitton Sports 胶囊系列页面当前首个产品为 LV Trainer 运动鞋，已作为线上首发新品候选写入。',
      products: ['LV Trainer 运动鞋', 'LV Trainer', 'Sports'],
      sourceTitle: 'Sports 胶囊系列 LV Trainer 运动鞋',
      fingerprint: 'LV::LV Trainer 运动鞋,LV Trainer,Sports::https://www.louisvuitton.cn/zhs-cn/products/lv-trainer-sneaker-nvprod7670122v/1AKRAI',
    },
    {
      id: 'lv-speedy',
      category: 'luxury' as const,
      subcategory: '包袋',
      brand: 'Louis Vuitton',
      title: "Louis Vuitton 推出 Speedy Soft 30 手袋，经典包袋阵容焕新",
      publishedAt: '2026-07-09',
      checkedAt: now,
      sourceType: 'Official Site',
      sourceLabel: 'LV Speedy 手袋',
      sourceUrl: 'https://www.louisvuitton.cn/zhs-cn/products/speedy-soft-30-autres-toiles-monogram-nvprod7830219v/M28479',
      image: 'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-speedy-soft-30-%E6%89%8B%E8%A2%8B--M28479_PM2_Front%20view.png?wid=490&hei=490',
      summary: 'Louis Vuitton Speedy 手袋页面当前首个产品为 Speedy Soft 30 手袋，已作为包袋新品候选写入。',
      products: ['Speedy Soft 30 手袋', 'Speedy', 'Bandoulière'],
      sourceTitle: 'Speedy Soft 30 手袋',
      fingerprint: 'LV::Speedy Soft 30 手袋,Speedy,Bandoulière::https://www.louisvuitton.cn/zhs-cn/products/speedy-soft-30-autres-toiles-monogram-nvprod7830219v/M28479',
    },
    {
      id: 'lv-neverfull',
      category: 'luxury' as const,
      subcategory: '包袋',
      brand: 'Louis Vuitton',
      title: "Louis Vuitton 推出 Neverfull 中号手袋，经典托特包阵容延续",
      publishedAt: '2026-07-09',
      checkedAt: now,
      sourceType: 'Official Site',
      sourceLabel: 'LV Neverfull 手袋',
      sourceUrl: 'https://www.louisvuitton.cn/zhs-cn/products/neverfull-mm-monogram-nvprod5350101v/M46987',
      image: 'https://www.louisvuitton.cn/images/is/image/lv/1/PP_VP_L/louis-vuitton-neverfull-%E4%B8%AD%E5%8F%B7%E6%89%8B%E8%A2%8B--M46987_PM2_Front%20view.png?wid=490&hei=490',
      summary: 'Louis Vuitton Neverfull 手袋页面当前首个产品为 Neverfull 中号手袋，已作为包袋新品候选写入。',
      products: ['Neverfull 中号手袋', 'Neverfull', '中号'],
      sourceTitle: 'Neverfull 中号手袋',
      fingerprint: 'LV::Neverfull 中号手袋,Neverfull,中号::https://www.louisvuitton.cn/zhs-cn/products/neverfull-mm-monogram-nvprod5350101v/M46987',
    },
  ];

  const existingStories = await readStoredStories();
  console.log(`Existing stories: ${existingStories.length}`);

  let added = 0;
  for (const story of newStories) {
    const exists = existingStories.find(
      (s: any) => s.id === story.id || (s.fingerprint && s.fingerprint === story.fingerprint)
    );
    if (exists) {
      console.log(`  SKIP (exists): ${story.id}`);
      continue;
    }
    existingStories.push(story as any);
    console.log(`  ADD: ${story.id} — ${story.title.substring(0, 60)}`);
    added++;
  }

  console.log(`\nAdded ${added} new stories. Total: ${existingStories.length}`);

  if (added > 0) {
    await localizeStoryImages(existingStories);
    await writeStoredStories(existingStories);
    await publishRuntimeFeed(existingStories);
    console.log('Feed regenerated.');
  }
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
