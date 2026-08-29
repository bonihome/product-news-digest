#!/usr/bin/env bash
set -euo pipefail

# ---- PATH 注入（cron 环境修复 2026-06-11）----
# cron 的 PATH 只有 /usr/bin:/bin，npm 找不到 /usr/local/bin/node (v24) 也找不到
# nvm 的 v22。优先级：nvm v22 → /usr/local/bin v24 → /usr/bin v18（兜底）。
# 把这段写在 set -euo pipefail 之后、cd 之前，确保 cd 失败也能留现场。
export PATH="/root/.nvm/versions/node/v22.22.0/bin:/usr/local/bin:/usr/bin:/bin"

LOG_DIR="/var/log/product-news-digest"
mkdir -p "${LOG_DIR}"
{
  echo "[$(date -Iseconds)] pipeline start"
  echo "  node: $(command -v node 2>/dev/null || echo 'missing') ($(node --version 2>/dev/null || echo 'n/a'))"
  echo "  npm:  $(command -v npm)"
  echo "  PATH: ${PATH}"
} >> "${LOG_DIR}/pipeline.log"

PROJECT_DIR="/srv/product-news-digest"
ENV_FILE="${PROJECT_DIR}/.env"
BUILD_LOG="${LOG_DIR}/build.log"
BUILD_FAILED_FLAG="${LOG_DIR}/build.failed"
ALERT_LOG="${LOG_DIR}/build-alerts.log"

cd "${PROJECT_DIR}"

if [ -f "${ENV_FILE}" ]; then
  set -a
  source "${ENV_FILE}"
  set +a
fi

# 1) 跑 pipeline（写 public/runtime/published-feed.json）
/usr/bin/env npm run pipeline:scheduled

# 1.5) 图片回填：给 pipeline 产出中空图的条目从品牌已有图片池自动填图
echo "[$(date -Iseconds)] fill-empty-images start" >> "${LOG_DIR}/pipeline.log"
/usr/bin/env npx tsx scripts/fill-empty-images.ts >> "${LOG_DIR}/pipeline.log" 2>&1 || true
echo "[$(date -Iseconds)] fill-empty-images done" >> "${LOG_DIR}/pipeline.log"

# 1.55) 压缩超大图片（≥1500px 缩到 800px）：官网原图常 2000-3840px，单张 1.5-5MB 拖慢首页
echo "[$(date -Iseconds)] compress-oversized-images start" >> "${LOG_DIR}/pipeline.log"
/usr/bin/env python3 scripts/compress-oversized-images.py >> "${LOG_DIR}/pipeline.log" 2>&1 || true
echo "[$(date -Iseconds)] compress-oversized-images done" >> "${LOG_DIR}/pipeline.log"

# 1.6) 从更新后的 news-items.json 重新生成 published-feed.json
# fill-empty-images 只修改了 news-items.json，需要同步到 published-feed.json 供构建使用
echo "[$(date -Iseconds)] regen-published-feed start" >> "${LOG_DIR}/pipeline.log"
/usr/bin/env npx tsx scripts/regen-published-feed.ts >> "${LOG_DIR}/pipeline.log" 2>&1 || true
echo "[$(date -Iseconds)] regen-published-feed done" >> "${LOG_DIR}/pipeline.log"

# 2) 重建 dist，让 __RUNTIME_FEED__ 嵌入最新 runtime feed
#    失败不能中断 cron（pipeline 产物已在，dist 滞后一档不会跳变——由 App.tsx 版本比对保底）
echo "[$(date -Iseconds)] build start" >> "${BUILD_LOG}"

if /usr/bin/env npm run build >> "${BUILD_LOG}" 2>&1; then
  echo "[$(date -Iseconds)] build ok" >> "${BUILD_LOG}"
  # 清理上一次的失败标记
  rm -f "${BUILD_FAILED_FLAG}" 2>/dev/null || true
else
  BUILD_EXIT=$?
  echo "[$(date -Iseconds)] build FAILED (exit=${BUILD_EXIT})" >> "${BUILD_LOG}"
  # 写哨兵文件，方便定时巡检（find /var/log/product-news-digest -name build.failed -mmin -1440）
  date -Iseconds > "${BUILD_FAILED_FLAG}"
  echo "[$(date -Iseconds)] BUILD FAILED — see ${BUILD_LOG}" >> "${ALERT_LOG}"
  # 备注：SMTP 告警暂未启用（.env 不含密钥，避免密钥污染配置层）
  # 后续可接 systemd OnFailure= 或 cron 巡检脚本
fi

# 3) 发布后图片质检：检查图片能否加载 + 是否是非产品图（截图/占位图）
#    结果写独立日志，便于巡检；不中断 cron（质检是观察，不是阻断）
echo "[$(date -Iseconds)] qa-published-images start" >> "${LOG_DIR}/pipeline.log"
/usr/bin/env npx tsx scripts/qa-published-images.ts >> "${LOG_DIR}/qa-published-images.log" 2>&1 || true
echo "[$(date -Iseconds)] qa-published-images done" >> "${LOG_DIR}/pipeline.log"
