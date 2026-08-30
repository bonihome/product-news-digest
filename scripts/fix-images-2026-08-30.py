#!/usr/bin/env python3
"""
存量图片修复：Alexander McQueen 空图 + Nike 跨产品串图（2026-08-30）。

为什么需要脚本而不是重跑 pipeline：
  pipeline.ts 对已有故事锁定 image（existing.image 为 /runtime/ 图时保留旧图，
  空图故事也不会因为品牌快照未变化而重新生成），所以代码层修复只治未来新增，
  存量必须一次性重抓。

修复对象：
  1. Alexander McQueen 今天新生成的空图故事
     → 从 sourceUrl 产品页抓 media.alexandermcqueen.cn/asset/<uuid>/Original-Ecom/<CODE>_F.jpg
       （产品码精确匹配，防串色号）
  2. Nike 使用 t_default 低清占位/跨产品图的故事
     → 从 sourceUrl 产品页抓 t_PDP_1728_v1 真实产品图

统一处理：
  - magic bytes 检测真实格式（Nike/McQueen CDN 都会 MIME 撒谎）
  - 最长边 >=1500px 缩到 800px（与 compress-oversized-images.py 一致）
  - content hash 命名（浏览器缓存自动失效）
  - 同时更新 data/runtime/news-items.json [list] 和 public/runtime/published-feed.json [dict]

用法：
  python3 scripts/fix-images-2026-08-30.py            # dry-run，只报告
  python3 scripts/fix-images-2026-08-30.py --apply    # 实际写盘
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

# 已确认的坏图 md5（G.T. CUT 4 LX EP 的 t_default 图，被 7 个 Nike 故事串用）
BAD_MD5 = {'e7debc8862ea60d09b929f748ceea2dc'}


def encode_url(url):
    """sourceUrl 里可能含中文（Nike 产品页），urllib 需要先百分号编码。"""
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


def mcqueen_image_url(source_url):
    """从 McQueen 产品页抓与产品码精确匹配的 Original-Ecom 正面图。"""
    slug = source_url.split('?')[0].split('#')[0].rstrip('/').split('/')[-1]
    last_token = re.sub(r'\.html?$', '', slug, flags=re.I).split('-')[-1]
    code = last_token.upper() if (re.fullmatch(r'[A-Za-z0-9]{10,}', last_token)
                                  and re.search(r'\d', last_token)) else None
    html = fetch_text(source_url)
    found = re.findall(
        r'https?://media\.alexandermcqueen\.cn/asset/[a-f0-9-]+/(?:Original-Ecom|Large|Medium)/([A-Z0-9]+)_([A-Z])\.jpg',
        html, re.I)
    urls = re.findall(
        r'https?://media\.alexandermcqueen\.cn/asset/[a-f0-9-]+/(?:Original-Ecom|Large|Medium)/[A-Z0-9]+_[A-Z]\.jpg',
        html, re.I)
    pool = []
    for url, (c, v) in zip(urls, found):
        if code and c.upper() != code:
            continue  # 不同色号，绝不使用
        size_rank = 0 if 'Original-Ecom' in url else (1 if 'Large' in url else 2)
        view_rank = {'F': 0, 'E': 1, 'D': 2, 'R': 3, 'L': 4}.get(v.upper(), 9)
        pool.append((size_rank, view_rank, url))
    if not pool:
        return None
    pool.sort()
    return pool[0][2]


def nike_image_url(source_url):
    """从 Nike 产品页抓 t_PDP_1728_v1 真实产品图（og:image 是 320x400 低清占位）。"""
    html = fetch_text(source_url)
    for pattern in (r'https://static\.nike\.com\.cn/a/images/t_PDP_1728_v1/[^"\' )]+',
                    r'https://static\.nike\.com\.cn/a/images/t_PDP_936_v1/[^"\' )]+'):
        m = re.search(pattern, html)
        if m:
            return m.group(0)
    return None


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
    # 与 compress-oversized-images.py 一致：>=1500px 缩到 800px
    if max(w, h) >= 1500:
        scale = 800 / max(w, h)
        img = img.convert('RGB' if ext in ('jpg', 'jpeg') else img.mode)
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
        brand = (s.get('brand') or '')
        img = s.get('image') or ''
        src = s.get('sourceUrl') or ''
        if brand == 'Alexander McQueen' and not img and '/products/' in src:
            targets.append(('mcqueen', s))
        elif brand == 'Nike' and img.startswith('/runtime/'):
            fp = os.path.join(ROOT, 'public' + img)
            if os.path.exists(fp):
                md5 = hashlib.md5(open(fp, 'rb').read()).hexdigest()
                if md5 in BAD_MD5 and '/t/' in src:
                    targets.append(('nike', s))

    print(f'待修复：{len(targets)} 条'
          f'（McQueen {sum(1 for k, _ in targets if k == "mcqueen")} / '
          f'Nike {sum(1 for k, _ in targets if k == "nike")}）')
    print(f'模式：{"APPLY 写盘" if APPLY else "DRY-RUN 只报告"}\n')

    updates = {}
    for kind, s in targets:
        sid, src = s['id'], s['sourceUrl']
        try:
            url = mcqueen_image_url(src) if kind == 'mcqueen' else nike_image_url(src)
            if not url:
                print(f'❌ {sid}\n   产品页抓不到图（留空，不用同品牌其他产品图）')
                continue
            buf = fetch(url)
            if hashlib.md5(buf).hexdigest() in BAD_MD5:
                print(f'❌ {sid}\n   抓到的仍是已知坏图，跳过')
                continue
            brand_slug = re.sub(r'[^a-z0-9]+', '-', s['brand'].lower()).strip('-')
            if APPLY:
                rel, size, dims, ext = save_image(buf, brand_slug, sid)
                updates[sid] = rel
                print(f'✅ {sid}\n   {url[:100]}\n   → {rel} ({size // 1024}KB {dims[0]}x{dims[1]} {ext})')
            else:
                from PIL import Image
                import io
                dims = Image.open(io.BytesIO(buf)).size
                print(f'✅ {sid}\n   {url[:100]}\n   可下载 {len(buf) // 1024}KB {dims[0]}x{dims[1]} {magic_ext(buf)}')
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
