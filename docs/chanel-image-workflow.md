# Chanel 奢侈品产品图片获取工作流

> 最后更新：2026-05-26
> 适用品牌：Chanel（奢侈品，chanel.cn）

## 核心问题

Chanel 中国官网 (chanel.cn) 的产品详情页图片通过 JavaScript 动态加载，**无法通过静态 HTML 抓取（web_fetch / Scrapling / curl 都拿不到产品图 URL）**。图片 URL 存储在页面的 JS 数据层中，必须在浏览器环境中执行 JavaScript 才能提取。

## 获取流程

### Step 1：找到正确的产品详情页 URL

Chanel 产品页 URL 格式：

```
https://www.chanel.cn/cn/fashion/p/{SKU}/{slug}/
```

示例：
- CHANEL 25 迷你手袋（羊皮革 黑）：`/cn/fashion/p/AS5631B2471894305/chanel-25-mini-handbag-lambskin-gold-tone-metal/`
- CHANEL 25 丹宁小号：`/cn/fashion/p/AS5293B24748U9397/chanel-25-small-handbag-washed-denim-gold-tone-metal/`

获取准确产品页 URL 的方法：
1. 从 **Chanel 频道页**（如 `https://www.chanel.cn/cn/fashion/chanel-25/c/1x3x26x1/handbags/`）用浏览器抓取产品链接列表
2. 从 **已有新闻的 sourceUrl 字段**提取产品页链接（如斜纹软呢、丹宁、大号已有具体产品页 URL）
3. 根据 **产品标题匹配**（材质、颜色、尺寸）在频道页中找到对应产品

### Step 2：用浏览器打开产品页

```
browser navigate -> 产品页 URL
```

### Step 3：从 JS 数据层提取产品图片 URL

在浏览器中执行 JavaScript 提取所有 `chanel.cn/images` 域名下的产品图片：

```javascript
() => {
  const imgs = document.querySelectorAll('img[src*="chanel.cn/images"]');
  return Array.from(imgs)
    .map(i => ({src: i.src, alt: i.alt, width: i.naturalWidth}))
    .filter(i => i.width > 100 && !i.alt.includes('主页'));
}
```

返回结果中：
- **「大号艺术视图1」** → 产品主图（白底棚拍）— **作为新闻配图**
- 「艺术视图2/3/4」 → 产品细节/模特上身图

### Step 4：下载图片到服务器

图片 URL 去掉尺寸参数即为原始高清图。URL 格式：

```
https://www.chanel.cn/images/as///c_crop,w_1600,g_north,f_auto,q_auto:good,dpr_1.1/w_3200/{image_id}.jpg
```

直接下载时可用浏览器返回的完整 URL。**下载工具必须用 Scrapling Fetcher**（`scripts/scrapling-fetch.py`），它能绕过 Chanel 的 Akamai CDN 防护。

服务器下载命令模板：

```bash
cd /srv/product-news-digest
python3 -c "
import subprocess
url = 'https://www.chanel.cn/images/as///f_auto/-82316480.jpg'
r = subprocess.run(['python3', 'scripts/scrapling-fetch.py', url],
                   capture_output=True, text=True, timeout=30)
data = r.stdout.encode('latin-1')
with open('public/news/luxury/chanel-25-tweed.jpg', 'wb') as f:
    f.write(data)
print(f'Downloaded: {len(data)} bytes')
"
```

### Step 5：更新图片引用并部署

1. 图片保存到 `public/news/luxury/{news_id}.jpg`
2. 更新 `src/data/luxuryNews.ts` 中对应新闻的 `image` 字段
3. 复制到构建产物目录并构建：

```bash
cp public/news/luxury/chanel-*.jpg dist/news/luxury/
npm run build
```

## 已验证的产品页 URL

以下 URL 模式已确认有效，可作为同类产品参考：

| 产品类型 | 产品页路径 |
|---------|-----------|
| CHANEL 25 迷你手袋（羊皮革 黑） | `/fashion/p/AS5631B2471894305/chanel-25-mini-handbag-lambskin-gold-tone-metal/` |
| CHANEL 25 小号手袋（颗粒压花小牛皮 黑） | `/fashion/p/AS5293B2030494305/chanel-25-small-handbag-grained-calfskin-gold-tone-metal/` |
| CHANEL 25 中号手袋（颗粒压花小牛皮 深卡其） | `/fashion/p/AS5311B20304U8389/chanel-25-medium-handbag-grained-calfskin-gold-tone-metal/` |
| CHANEL 25 大号手袋 | `/fashion/p/AS5553B2030494305/chanel-25-large-handbag-grained-calfskin-gold-tone-metal/` |
| CHANEL 25 迷你（斜纹软呢 黑） | `/fashion/p/AS5631B2507194305/chanel-25-mini-handbag-cotton-wool-tweed-gold-tone-metal/` |
| CHANEL 25 迷你（编织酒椰纤维） | `/fashion/p/AS5631B23519U7618/chanel-25-mini-handbag-braided-raffia-calfskin-gold-tone-metal/` |
| CHANEL 25 小号（水洗丹宁 蓝） | `/fashion/p/AS5293B24748U9397/chanel-25-small-handbag-washed-denim-gold-tone-metal/` |

## Chanel 频道页（用于查找新产品链接）

CHANEL 25 手袋频道页：
```
https://www.chanel.cn/cn/fashion/chanel-25/c/1x3x26x1/handbags/
```

从频道页提取所有产品链接的 JS：
```javascript
() => {
  const links = document.querySelectorAll('a[href*="/fashion/p/AS"]');
  return Array.from(links).map(l => ({
    href: l.href,
    text: l.textContent.trim().substring(0, 80)
  }));
}
```

## 关键注意事项

1. **不要用 web_fetch / curl 抓 Chanel 产品页** — 图片 URL 不在 HTML 中，在 JS 数据层
2. **必须用浏览器打开页面** — 用 `browser:navigate + act:evaluate` 提取图片 URL
3. **图片下载必须用 Scrapling** — Chanel CDN 有 Akamai 防护，curl/wget 返回 403
4. **下载时保留完整 URL** — 浏览器返回的 URL 可直接传给 Scrapling
5. **Chanel 产品页 URL 中的 SKU 是关键** — 一旦 SKU 过期，页面会重定向到频道首页
6. **非 CHANEL 25 系列**同样适用此流程 — 其他 Chanel 产品的图片获取方式一致
