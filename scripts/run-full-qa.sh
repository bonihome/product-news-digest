#!/usr/bin/env bash
# 周日晚 20:00 全量图片质检（检查所有新闻，而非仅当天新增）
# cron 的 PATH 只有 /usr/bin:/bin，需要注入 nvm node 路径
set -euo pipefail
export PATH="/root/.nvm/versions/node/v22.22.0/bin:/usr/local/bin:/usr/bin:/bin"

cd /srv/product-news-digest
exec npx tsx scripts/qa-published-images.ts --all
