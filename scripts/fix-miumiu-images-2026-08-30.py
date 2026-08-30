#!/usr/bin/env python3
"""
存量图片修复：Miu Miu 新故事「整页截图」→ 真实产品图（2026-08-30）。

根因：Miu Miu 产品详情页没有 og:image / twitter:image / itemprop=image，且通用
提取器 extractImageFromHtml 的品牌 CDN 白名单里没有 miumiu，导致 fetchGenericCandidates
拿不到产品图 → image 空 → post-pipeline 的 Playwright 截图兜底把 600×800 整页截图
当产品图存成 *-screenshot.jpg。

代码层已修（fetchCandidates.ts 新增 extractMiuMiuImage + host 分派），只治未来新增；
存量截图必须用本脚本重抓。

产品图 CDN：content/dam/miumiubkg_products/{首}/{前3}/{SKU前6}/{颜色码}/{SKU}_{视角}.jpg
  - SKU = 产品页 URL 最后一段（大写+下划线），如 5BB199_2BBL_F0D57_V_OOO
  - 视角：_SLF(正面) _SLO(其他) _SLR _SLB(背面) _SLD(细节)
  - ⚠️ 同一产品页内嵌同款其他颜色的图（颜色码不同），必须用 sourceUrl 的 SKU 精确过滤。

用法：
  python3 scripts/fix-miumiu-images-2026-08-30.py            # dry-run，只报告
  python3 scripts/fix-miumiu-images-2026-08-30.py --apply    # 实际写盘
"""
import hashlib
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS_ITEMS = os.path.join(ROOT, 'data/runtime/news-items.json')
PUBLISHED_FEED = os.path.join(ROOT, 'public/runtime/published-feed.json')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
APPLY = '--apply' in sys.argv


def encode_url(url):
    """sourceUrl 里可能含中文，urllib 需要先百分号编码。"""
    parts = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((
        parts.scheme,
        parts.netloc,
        urllib.parse.quote(parts.path, safe='/%'),
        urllib.parse.quote(parts.query, safe='=&%'),
        '',
    ))


def fetch(url, timeout=45):
    req = urllib.request.Request(encode_url(url),
                                 headers={'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def fetch_text(url, timeout=45):
    return fetch(url, timeout).decode('utf-8', errors='replace')


def magic_ext(buf):
    if buf[:3] == b'\xff\xd8\xff':
        return 'jpg'
    if buf[:4] == b'\x89PNG':
        return 'png'
    if buf[:4] == b'RIFF' and buf[8:12] == b'WEBP':
        return 'webp'
    if buf[4:8] == b'ftyp' and buf[8:12] in (b'avif', b'avis'):
        return 'avif'
    return None


MIUMIU_ASSET = re.compile(
    r'(?P<url>(?:https?://www\.miumiu\.cn)?/content/dam/miumiubkg_products/'
    r'[^"\']*?/(?P<sku>[A-Z0-9_]+)_(?P<view>[A-Z]{3})\.jpg)', re.I)
VIEW_ORDER = ('SLF', 'SLO', 'SLR', 'SLB', 'SLD')


def miu_miu_sku(source_url):
    """SKU = URL 最后一段（去 query/hash/尾斜杠），如 5BB199_2BBL_F0D57_V_OOO。"""
    slug = source_url.split('?')[0].split('#')[0].rstrip('/').split('/')[-1]
    return slug.upper() if re.fullmatch(r'[A-Z0-9_]{6,}', slug) else None


def pick_miu_miu_asset(html, source_url):
    """从产品页 HTML 选出与 sourceUrl 的 SKU 精确匹配的正面图（纯函数，便于验证）。"""
    sku = miu_miu_sku(source_url)
    if not sku:
        return None
    pool = []
    for m in MIUMIU_ASSET.finditer(html):
        if m['sku'].upper() != sku:  # 同款其他颜色绝不使用
            continue
        view = m['view'].upper()
        rank = VIEW_ORDER.index(view) if view in VIEW_ORDER else len(VIEW_ORDER)
        url = m['url']
        if not url.startswith('http'):
            url = 'https://www.miumiu.cn' + url
        pool.append((rank, url))
    return min(pool)[1] if pool else None


def miu_miu_image_url(source_url):
    return pick_miu_miu_asset(fetch_text(source_url), source_url)


def save_image(buf, brand_slug, story_id):
    from PIL import Image
    import io
    ext = magic_ext(buf)
    if not ext:
        raise ValueError('无法识别图片格式')
    img = Image.open(io.BytesIO(buf))
    w, h = img.size
    if max(w, h) < 400:
        raise ValueError(f'尺寸过小疑似占位图 {w}x{h}')
    if max(w, h) >= 1500:  # 与 compress-oversized-images.py 一致
        scale = 800 / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        out = io.BytesIO()
        if ext == 'png':
            img.save(out, 'PNG', optimize=True)
        elif ext == 'webp':
            img.save(out, 'WEBP', quality=85)
        else:
            img.convert('RGB').save(out, 'JPEG', quality=85)
        buf = out.getvalue()
        final_size = Image.open(io.BytesIO(buf)).size
    else:
        final_size = (w, h)

    digest = hashlib.md5(buf).hexdigest()[:12]
    filename = f'{story_id}-{digest}.{ext}'
    rel = f'/runtime/news-images/{brand_slug}/{filename}'
    for base in ('public', 'data'):
        d = os.path.join(ROOT, base, f'runtime/news-images/{brand_slug}')
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, filename), 'wb') as fh:
            fh.write(buf)
    return rel, len(buf), final_size, ext


def main():
    items = json.load(open(NEWS_ITEMS, encoding='utf-8'))
    targets = []
    for s in items:
        if (s.get('brand') or '') != 'Miu Miu':
            continue
        img = s.get('image') or ''
        src = s.get('sourceUrl') or ''
        # 只修「整页截图兜底」的新故事：image 文件名含 screenshot，且 sourceUrl 是产品页
        if 'screenshot' in img and '/p/' in src:
            targets.append(s)

    print(f'待修复：{len(targets)} 条 Miu Miu 截图兜底故事')
    print(f'模式：{"APPLY 写盘" if APPLY else "DRY-RUN 只报告"}\n')

    updates = {}
    for s in targets:
        sid, src = s['id'], s['sourceUrl']
        try:
            url = miu_miu_image_url(src)
            if not url:
                print(f'❌ {sid}\n   产品页抓不到同 SKU 产品图（留空，不用同款其他颜色图）')
                continue
            buf = fetch(url)
            brand_slug = re.sub(r'[^a-z0-9]+', '-', s['brand'].lower()).strip('-')
            if APPLY:
                rel, size, dims, ext = save_image(buf, brand_slug, sid)
                updates[sid] = rel
                print(f'✅ {sid}\n   {url[:110]}\n   → {rel} ({size // 1024}KB {dims[0]}x{dims[1]} {ext})')
            else:
                from PIL import Image
                import io
                dims = Image.open(io.BytesIO(buf)).size
                print(f'✅ {sid}\n   {url[:110]}\n   可下载 {len(buf) // 1024}KB {dims[0]}x{dims[1]} {magic_ext(buf)}')
        except Exception as exc:
            print(f'❌ {sid}\n   {type(exc).__name__}: {exc}')

    if not APPLY:
        print('\nDRY-RUN 结束。加 --apply 实际写盘。')
        return

    for s in items:
        if s['id'] in updates:
            s['image'] = updates[s['id']]
    with open(NEWS_ITEMS, 'w', encoding='utf-8') as fh:
        json.dump(items, fh, ensure_ascii=False, indent=2)

    feed = json.load(open(PUBLISHED_FEED, encoding='utf-8'))
    for s in feed.get('stories', []):
        if s.get('id') in updates:
            s['image'] = updates[s['id']]
    with open(PUBLISHED_FEED, 'w', encoding='utf-8') as fh:
        json.dump(feed, fh, ensure_ascii=False, indent=2)

    print(f'\n已更新 {len(updates)} 条：news-items.json + published-feed.json')
    print('下一步：npx tsx scripts/regen-feed.ts && npm run build && nginx -s reload')


if __name__ == '__main__':
    main()
