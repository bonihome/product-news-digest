#!/usr/bin/env python3
"""
合入 batch 抓取结果到 published-feed.json
用法：
  python3 merge-batch-stories.py \\
    --brand gucci --batch-id gucci-batch-20260608-1 \\
    --json gucci.json --image-dir gucci \\
    --public-dir /srv/product-news-digest/public \\
    --data-dir /srv/product-news-digest/data
"""
import argparse
import json
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--brand", required=True)
    ap.add_argument("--batch-id", required=True)
    ap.add_argument("--json", required=True, help="subagent 输出的 JSON 文件")
    ap.add_argument("--image-dir", required=True, help="图片目录（相对 public/runtime/news-images/）")
    ap.add_argument("--public-dir", default="/srv/product-news-digest/public")
    ap.add_argument("--data-dir", default="/srv/product-news-digest/data")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    # 1. 读 subagent 输出
    batch_data = json.loads(Path(args.json).read_text())
    if isinstance(batch_data, dict):
        batch_data = [batch_data]
    
    # 2. 过滤掉 blocked 的
    valid = []
    for item in batch_data:
        if item.get("status") == "blocked":
            print(f"  ⏭️  {item.get('id','?')}: BLOCKED - {item.get('reason','?')}")
            continue
        if not all(k in item for k in ("id","title","sourceUrl","image","subcategory","products")):
            print(f"  ⚠️  {item.get('id','?')}: 字段不完整，跳过")
            continue
        valid.append(item)
    
    if not valid:
        print(f"\n❌ {args.brand} 没有有效 story 可合入")
        return 1
    
    print(f"\n✅ {args.brand} 有 {len(valid)} 条待合入：")
    for item in valid:
        img_local = Path(args.public_dir) / "runtime" / "news-images" / args.image_dir / Path(item["image"]).name
        if not img_local.exists():
            print(f"  ⚠️  {item['id']}: 图片 {img_local} 不存在，跳过")
            continue
        size = img_local.stat().st_size
        print(f"  📷 {item['id']:35s} {size:>7} bytes  {item['title'][:50]}")
    
    # 3. 加载现有 feed
    feed_path = Path(args.data_dir) / "runtime" / "published-feed.json"
    feed = json.loads(feed_path.read_text())
    existing_ids = {s["id"] for s in feed["stories"]}
    
    # 4. 构造新 story
    now = datetime.utcnow().strftime("%Y-%m-%d")
    new_stories = []
    for item in valid:
        if item["id"] in existing_ids:
            print(f"  🔄 {item['id']}: 已存在，将覆盖")
            feed["stories"] = [s for s in feed["stories"] if s["id"] != item["id"]]
        new_story = {
            "id": item["id"],
            "category": "luxury",
            "subcategory": item["subcategory"],
            "brand": args.brand,
            "title": item["title"],
            "publishedAt": now,
            "checkedAt": now,
            "sourceType": "Official Site",
            "sourceLabel": f"{args.brand} 中国官网",
            "sourceUrl": item["sourceUrl"],
            "image": item["image"],
            "summary": item.get("summary", f"{args.brand} 本季推出 {item['subcategory']}新作，延续品牌标志性设计语言。"),
            "products": item["products"] if isinstance(item["products"][0], dict) else [{"name": p} for p in item["products"]],
        }
        new_stories.append(new_story)
    
    # 5. dry-run 退出
    if args.dry_run:
        print(f"\n[DRY-RUN] 即将合入 {len(new_stories)} 条，不写盘")
        return 0
    
    # 6. 写回
    feed["stories"].extend(new_stories)
    feed["generatedAt"] = datetime.utcnow().isoformat() + "Z"
    feed.setdefault("_editLog", []).append({
        "ts": datetime.utcnow().isoformat() + "Z",
        "action": "merge_batch",
        "batch_id": args.batch_id,
        "brand": args.brand,
        "added_ids": [s["id"] for s in new_stories],
        "count": len(new_stories),
    })
    feed_path.write_text(json.dumps(feed, ensure_ascii=False, indent=2))
    print(f"\n✅ 已合入 {len(new_stories)} 条到 {feed_path}")
    
    # 7. 同步到 public/dist
    for d in [Path(args.public_dir) / "runtime", Path(args.data_dir).parent / "dist" / "runtime"]:
        if d.parent.exists():
            target = d / "published-feed.json"
            shutil.copy(feed_path, target)
            print(f"   同步到 {target}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
