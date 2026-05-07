#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/srv/product-news-digest"
ENV_FILE="${PROJECT_DIR}/.env"

cd "${PROJECT_DIR}"

if [ -f "${ENV_FILE}" ]; then
  set -a
  source "${ENV_FILE}"
  set +a
fi

/usr/bin/env npm run pipeline:scheduled
