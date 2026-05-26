# Operation Notes

> 更新/运维 newsofgift.com 时需注意的问题与修复记录

## 图片加载问题 — 2026-05-15

### 问题现象

Saint Laurent 和 Miu Miu 品牌的新闻图片加载不出来。

### 根因

子代理（subagent）在新增品牌新闻时，将图片文件保存为 `.png` 格式，但在数据文件（`news-items.json` / `published-feed.json`）中填写的图片路径使用了 `.jpg` 后缀。另有 4 张包袋图反过来（文件为 `.jpg` 但路径写了 `.png`）。

### 影响范围

- **26 处路径错位**
- Saint Laurent：12 张图（shoes/rtw/jewelry 包袋）
- Miu Miu：10 张图（shoes/rtw/jewelry/accessories 包袋）
- 详情页和品牌页均受影响

### 修复操作

修正了 3 个数据文件中的路径后缀（`.jpg` ↔ `.png`）：

1. `data/runtime/news-items.json` — pipeline 源数据
2. `data/runtime/published-feed.json` — pipeline 发布 feed
3. `public/runtime/published-feed.json` — 前端实际读取的运行时 feed

### 以后的 subagent / pipeline 执行时务必遵守

1. **添加图片时，务必确保 `image` 字段的扩展名与磁盘上的实际文件名完全一致**。
   - 存成 `.png` 路径写 `.png`
   - 存成 `.jpg` 路径写 `.jpg`
   - 存成 `.webp` 路径写 `.webp`

2. **前端实际加载的是 `public/runtime/published-feed.json`**。
   - 如果通过 pipeline 直接写入 `public/runtime/news-items.json`，不会生效！
   - 必须同步更新 `public/runtime/published-feed.json`
   - 最好的做法：运行 publisher.ts 重新发布 feed，或直接更新 `data/runtime/` 下的源文件然后重建发布。

3. **修改后必须验证**：
   - 文件存在性检查
   - HTTP 访问检查（curl 返回 200 才算生效）

4. **构建 vs 运行时数据**：
   - 硬编码的数据（`src/data/luxuryNews.ts` 等）通过 Vite 构建嵌入前端
   - 运行时数据（`published-feed.json`）由前端在页面加载后 fetch 获取
   - 修改运行时数据**无需重新 build**，改 JSON 文件即可生效
   - 修改 `src/data/` 下的 TypeScript 文件**必须重新 build**

5. **pipeline 的双层数据架构**：
   - 运行时数据层：`data/runtime/`（pipeline 操作的对象）
   - 发布层：`public/runtime/`（公开 HTTP 可访问）
   - `writePublishedFeed()` 会自动将 feed 同时写入 `data/runtime/` 和 `public/runtime/`
   - 如果是手动修改，务必双写这两个位置

## 图片匹配问题 — 2026-05-15 (第二波修复)

### 问题现象

Dior 和 Miu Miu 新闻的图片内容是错的：
- 服装新闻配了包的图
- 运动鞋配了芭蕾鞋的图
- 同一张图被 3 个不同品类的新闻共用（凉鞋=服装=珠宝）
- 有的图片文件实际内容是文本 "Unable to find image"

### 根因

子代理（subagent）没有从品牌官网获取真实产品图，而是自己"生成"了图片文件。这些生成的文件：
- 内容相同（MD5 一致的假图）被分配给多个不同产品
- 图片内容和新闻描述的产品完全不对应
- 部分文件不是有效图片格式（20 字节的文本文件冒充 PNG）

### 影响范围

- **Dior**：8 项问题（重复、错配、假图）
- **Miu Miu**：3 组 8 项重复占位图
- **Saint Laurent**：无内容重复问题（12 张图各不同，但未验证是否匹配产品）

### 图片获取规范（以后必须遵守）

**1. 必须从品牌官网获取真实产品图片**
   - 每个 news item 的 `sourceUrl` 字段指向的就是产品官网页面
   - 使用浏览器访问该 URL，找到页面上真实的产品图
   - **禁止**自行生成/绘制/DALL-E 生成产品假图
   - **禁止**用一张通用图冒充多个不同产品

**2. 每个产品必须有自己独立的图片文件**
   - 同一品牌下，不同产品（不同 id）必须有不同的图片
   - 即使是同一品类（如两双不同的鞋），也不能共用图片
   - 新增图片后必须做 MD5 校验，检查是否有意外的重复

   ```bash
   # 检查同一品牌下是否有重复图片
   md5sum public/news/luxury/miu-miu-*.png | sort | uniq -d
   ```

**3. 从官网获取图片的方法**

方法一（推荐）：用浏览器打开产品页面，截图产品区域
   - 打开 `sourceUrl`
   - 定位产品主图区域
   - 使用 screenshot 或下载图片元素

方法二：从页面 HTML 中提取图片 URL
   - 品牌官网通常使用 CDN 图片（如 dior.com 使用 diorcdn.com）
   - 页面加载后查看 `<img>` 标签的 `src` 属性

方法三：搜索 Google / Bing 图片
   - 搜索词：`<品牌> <产品名> <SKU>` + "official"
   - 确保图片来自品牌官方渠道

**4. 品类—图片一致性检查**
   - 鞋履（shoe）→ 图里必须是鞋，不能是衣服或包
   - 服装（rtw）→ 图里必须是服装/模特穿着图
   - 珠宝（jewelry）→ 图里必须是首饰（项链、耳环、手链等）
   - 配饰（accessories）→ 图里必须是相应配件（腰带、墨镜、丝巾等）
   - 皮包（bags）→ 图里必须是包袋

   如果无法确认图片内容，用 `python3` 检查图片尺寸（大图通常是产品拍摄图，小图 13-20KB 的 .png 可能是占位图）。

**5. 图片质量要求**
   - 不能是文本文件冒充的假图（检测方法：文件头必须是有效图片格式头）
   - 尺寸建议不低于 300x300
   - 优先使用官网高清产品图
   - 文件格式无严格要求（jpg/png/webp 均可），但扩展名必须与实际内容一致

**6. 图片重命名和存储规范**

   - 静态品牌新闻图：`public/news/<category>/<brand-slug>-<item>.扩展名`
     - 例如：`public/news/luxury/saint-laurent-shoes-1.png`
   - pipeline 运行时生成图：`public/runtime/news-images/<brand-slug>/<filename>.扩展名`
     - 例如：`public/runtime/news-images/dior/dior-ribbon-sneaker.jpg`

   无论存在哪个目录，`news-items.json` 和 `published-feed.json` 中的 `image` 字段必须使用**从网站根目录开始的相对路径**，如 `/news/luxury/saint-laurent-shoes-1.png`。

**7. 变更后的验证清单**
   ```bash
   # (1) 检查所有图片文件实际存在
   for f in dior-ribbon-sneaker.jpg dior-walkndior-sneaker.jpg ...; do
     [ -f "public/runtime/news-images/dior/$f" ] || echo "MISSING: $f"
   done
   
   # (2) 检查 JSON 所有图片路径指向的文件都存在
   python3 -c "
   import json, os
   for fp in ['data/runtime/news-items.json', 'public/runtime/published-feed.json']:
       with open(fp) as f:
           data = json.load(f)
       items = data.get('stories', []) if isinstance(data, dict) else data
       for item in items:
           img = item.get('image', '')
           if img.startswith('/'):
               fpath = 'public' + img
               if not os.path.exists(fpath):
                   print('MISSING in %s: %s' % (fp, img))
   "
   
   # (3) HTTP 验证 (返回 200)
   curl -s -o /dev/null -w "%{http_code}" http://118.89.77.58/news/luxury/miu-miu-shoes-2.png
   ```

## 图片存储路径规范

- 静态品牌新闻图：`public/news/<category>/<brand>-<item>.png|jpg|webp`
- pipeline 运行时生成图：`public/runtime/news-images/<brand-slug>/<brand>-<item>-<hash>.png|jpg|webp`
- 品牌 logo / 分类图标：`public/` 根目录

## publishedAt 日期乱码问题 — 2026-05-15

### 问题现象

首页最新新闻排序异常，昨天新增的 Dior / Saint Laurent / Miu Miu 内容不在最前面。

### 根因

`data/runtime/news-items.json` 中有 10 条新闻的 `publishedAt` 字段为乱码（如 `7452-24-24`、`7111-95-58`、`0213-86-18`等），
这些非法字符串在排序时被当作有效日期进行字典序排序，排到了 `2026-05-14` 之前，把正常内容挤出了首页前列。

### 影响范围

10 条新闻（Bvlgari x2、OPPO x1、OMEGA x1、HONOR x1、Prada x3、Prada Beauty x2）的日期被修复为 `2026-05-14`。

### 以后的 pipeline 执行时务必遵守

1. **每次新增/修改新闻后，检查所有 `publishedAt` 日期是否为有效的 `YYYY-MM-DD` 格式**
   - 正则校验：`^\d{4}-\d{2}-\d{2}$`
   - Python 验证：
     ```python
     from datetime import datetime
     datetime.strptime(date_str, "%Y-%m-%d")
     ```

2. **在写入数据前对 `publishedAt` 做合法性校验**
   - 年份必须在 2020-2030 范围内
   - 月份必须在 01-12 范围内
   - 日期必须在 01-31 范围内（且符合当月实际天数）

3. **全库日期完整性检查脚本**
   ```bash
   python3 -c "
   import json
   from datetime import datetime
   with open(public/runtime/published-feed.json) as f:
       feed = json.load(f)
   for s in feed.get(stories, []):
       d = s.get(publishedAt, )
       try:
           datetime.strptime(d, %Y-%m-%d)
       except:
           print(INVALID DATE: %s -

## publishedAt 日期乱码问题 — 2026-05-15

### 问题现象

首页最新新闻排序异常，昨天新增的 Dior / Saint Laurent / Miu Miu 内容不在最前面。

### 根因

data/runtime/news-items.json 中有 10 条新闻的 publishedAt 字段为乱码（如 7452-24-24、7111-95-58、0213-86-18等）。
这些非法字符串在排序时被当作有效日期进行字典序排序，排到了 2026-05-14 之前，把正常内容挤出了首页前列。

### 影响范围

10 条新闻（Bvlgari x2、OPPO x1、OMEGA x1、HONOR x1、Prada x5）的日期被修复为 2026-05-14。

### 以后的 pipeline 执行时务必遵守

1. **每次新增/修改新闻后，检查所有 publishedAt 日期是否为有效的 YYYY-MM-DD 格式**
   - 正则校验：^\d{4}-\d{2}-\d{2}$
   - 用 datetime 做 strptime 验证

2. **在写入数据前对 publishedAt 做合法性校验**
   - 年份必须在 2020-2030 范围内
   - 月份必须在 01-12 范围内
   - 日期必须有效（符合当月实际天数）

3. **全库日期完整性检查脚本**
   ```bash
   python3 -c "
   import json
   from datetime import datetime
   with open('public/runtime/published-feed.json') as f:
       feed = json.load(f)
   for s in feed.get('stories', []):
       d = s.get('publishedAt', '')
       try:
           datetime.strptime(d, '%Y-%m-%d')
       except:
           print('INVALID DATE: ' + s.get('id','?') + ' -> ' + d)
   "
   ```

## publishedAt 日期乱码根因修复 — 2026-05-15

### 根因

pipeline 的 `normalizeIsoDate()` 函数对提取到的日期不做任何校验：

```typescript
function normalizeIsoDate(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  return `${match[1]}-${match[2]}-${match[3]}`  // 无校验！
}
```

而 `extractPublishedAtFromHtml` 的 fallback 正则 `(\d{4}-\d{2}-\d{2})` 会匹配 HTML 中任意 `XXXX-XX-XX` 模式，包括产品编号（如 bulgari.cn 的 `7452-24-24`）。这些非法值不做校验直接入库。

### 修复

`normalizeIsoDate()` 新增三层验证：
- 年份：2020-2030 范围
- 月份：01-12 范围
- 日期：1-当月实际最大天数（如 4月最大30天，2月看闰年）

不通过任一层时返回 null，触发 fallback 使用 checkedAt 日期。

### 影响

所有通过 pipeline 抓取的品牌均受益。任何从 HTML 中提取到的非法日期都会被过滤，回退到合理日期。
