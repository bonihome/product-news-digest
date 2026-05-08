#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/srv/product-news-digest}"
APP_USER="${APP_USER:-${SUDO_USER:-${USER:-root}}}"
NODE_MAJOR="${NODE_MAJOR:-20}"

log() {
  printf '[bootstrap] %s\n' "$1"
}

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Please run as root or with sudo." >&2
    exit 1
  fi
}

detect_pm() {
  if command -v apt-get >/dev/null 2>&1; then
    echo "apt"
    return
  fi

  if command -v dnf >/dev/null 2>&1; then
    echo "dnf"
    return
  fi

  if command -v yum >/dev/null 2>&1; then
    echo "yum"
    return
  fi

  echo "unsupported"
}

install_apt() {
  log "Updating apt package index"
  apt-get update

  log "Installing base packages"
  apt-get install -y \
    ca-certificates \
    curl \
    git \
    nginx \
    unzip \
    cron \
    build-essential

  log "Installing Node.js ${NODE_MAJOR}"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
}

install_yum_like() {
  local pm="$1"

  log "Installing base packages"
  "$pm" install -y \
    ca-certificates \
    curl \
    git \
    nginx \
    unzip \
    cronie \
    gcc-c++ \
    make

  log "Installing Node.js ${NODE_MAJOR}"
  curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  "$pm" install -y nodejs
}

ensure_services() {
  log "Enabling cron and nginx"

  if systemctl list-unit-files | grep -q '^cron\.service'; then
    systemctl enable --now cron
  elif systemctl list-unit-files | grep -q '^crond\.service'; then
    systemctl enable --now crond
  fi

  systemctl enable nginx
}

prepare_dirs() {
  log "Preparing directories under ${PROJECT_DIR}"
  mkdir -p "${PROJECT_DIR}"
  mkdir -p /var/log/product-news-digest
  chown -R "${APP_USER}:${APP_USER}" "${PROJECT_DIR}" /var/log/product-news-digest || true
}

print_summary() {
  cat <<EOF

Environment bootstrap completed.

Project directory:
  ${PROJECT_DIR}

Detected app user:
  ${APP_USER}

Versions:
  $(git --version)
  $(node -v)
  $(npm -v)
  $(nginx -v 2>&1)

Next steps:
  1. Pull the repo into ${PROJECT_DIR}
  2. Copy .env.example to .env and fill credentials
  3. Run:
     cd ${PROJECT_DIR}
     npm install
     npm run image-rules:generate
     npm run pipeline:run
     npm run build
EOF
}

main() {
  require_root

  local pm
  pm="$(detect_pm)"

  case "$pm" in
    apt)
      install_apt
      ;;
    dnf|yum)
      install_yum_like "$pm"
      ;;
    *)
      echo "Unsupported package manager. Install git, nginx, nodejs, npm, unzip, and cron manually." >&2
      exit 1
      ;;
  esac

  ensure_services
  prepare_dirs
  print_summary
}

main "$@"
