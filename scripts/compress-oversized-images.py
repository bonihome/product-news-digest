#!/usr/bin/env python3
"""compress-oversized-images.py — 压缩超大图片（≥1500px 缩到 800px）

pipeline 下载的产品图常是官网原图（2000×2000 甚至 3840×3840），单张 1.5-5.7MB，
拖慢首页加载。本脚本用 Pillow 缩放到最长边 800px（首页卡片约 300-400px，
800px 足够 2x retina），保持扩展名不变、覆盖原文件，news-items.json 无需改动。

用法: python3 scripts/compress-oversized-images.py [--max-dim N] [--min-dim N]
"""
import os
import struct
import sys
from PIL import Image

ROOT = '/srv/product-news-digest'
IMG_DIR = os.path.join(ROOT, 'public/runtime/news-images')

def parse_args():
    max_dim = 800
    min_dim = 1500
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == '--max-dim' and i + 1 < len(args):
            max_dim = int(args[i + 1])
        if a == '--min-dim' and i + 1 < len(args):
            min_dim = int(args[i + 1])
    return max_dim, min_dim

def image_dimensions(fpath):
    with open(fpath, 'rb') as f:
        head = f.read(32)
    if head[:8] == b'\x89PNG\r\n\x1a\n':
        w = struct.unpack('>I', head[16:20])[0]
        h = struct.unpack('>I', head[20:24])[0]
        return w, h
    # 用 PIL 兜底（JPEG/WebP）
    try:
        with Image.open(fpath) as im:
            return im.size
    except Exception:
        return None

def compress(fpath, max_dim):
    try:
        with Image.open(fpath) as im:
            w, h = im.size
            if max(w, h) <= max_dim:
                return False, 'already small'
            scale = max_dim / max(w, h)
            nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
            im = im.resize((nw, nh), Image.Resampling.LANCZOS)
            ext = os.path.splitext(fpath)[1].lower()
            # 保持扩展名不变，避免 MIME 撒谎
            if ext in ('.jpg', '.jpeg'):
                if im.mode not in ('RGB', 'L'):
                    im = im.convert('RGB')
                im.save(fpath, 'JPEG', quality=85, optimize=True)
            elif ext == '.png':
                im.save(fpath, 'PNG', optimize=True)
            elif ext == '.webp':
                im.save(fpath, 'WEBP', quality=85)
            else:
                return False, f'unsupported ext {ext}'
            return True, f'{w}x{h} → {nw}x{nh}'
    except Exception as e:
        return False, f'error: {e}'

def main():
    max_dim, min_dim = parse_args()
    compressed = 0
    skipped = 0
    saved_bytes = 0

    for root, dirs, files in os.walk(IMG_DIR):
        for fname in files:
            if not fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                continue
            fpath = os.path.join(root, fname)
            dims = image_dimensions(fpath)
            if not dims:
                continue
            w, h = dims
            if max(w, h) < min_dim:
                continue
            before = os.path.getsize(fpath)
            ok, msg = compress(fpath, max_dim)
            if ok:
                after = os.path.getsize(fpath)
                saved_bytes += before - after
                compressed += 1
                rel = os.path.relpath(fpath, ROOT)
                print(f'✅ {rel} ({msg}) {before//1024}KB → {after//1024}KB')
            else:
                skipped += 1

    print(f'\n压缩 {compressed} 张，跳过 {skipped} 张，节省 {saved_bytes // 1024 // 1024}MB')

if __name__ == '__main__':
    main()
