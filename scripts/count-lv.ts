import { getEnabledBrandSources } from '../src/pipeline/brandSources.js';

const sources = getEnabledBrandSources();
const lv = sources.filter(s => s.brand === 'Louis Vuitton');
console.log(`Total LV entries: ${lv.length}`);
let i = 1;
for (const s of lv) {
  console.log(`${i}. ${s.subcategory} | ${s.sourceLabel} | ${s.listUrl.substring(0, 80)}`);
  i++;
}
