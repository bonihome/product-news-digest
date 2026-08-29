#!/bin/bash
# newsofgift.com nginx 存活监控
# 每天 8:00 执行：检测 nginx 是否在线，不在线则自动拉起

set -euo pipefail
LOG_DIR="/var/log/product-news-digest"
LOG_FILE="$LOG_DIR/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S CST')

log() { echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"; }

NEED_START=false

# 1. 检查 nginx 进程
if ! systemctl is-active --quiet nginx; then
    log "FAIL: nginx service is inactive"
    NEED_START=true
fi

# 2. 检查网站是否真正在响应
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 https://newsofgift.com/ 2>&1 || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
    log "FAIL: nginx 返回 HTTP $HTTP_CODE（期望 200）"
    NEED_START=true
fi

if $NEED_START; then
    log "ACTION: 尝试拉起 nginx..."
    systemctl start nginx 2>&1 | tee -a "$LOG_FILE"
    if systemctl is-active --quiet nginx; then
        log "OK: nginx 已自动拉起"
        # 二次验证
        sleep 2
        HTTP_CODE2=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 https://newsofgift.com/ 2>&1 || echo "000")
        log "VERIFY: 拉起后 HTTP $HTTP_CODE2"
    else
        log "ERROR: nginx 拉起失败！请手动排查"
    fi
else
    log "OK: nginx 在线，HTTP $HTTP_CODE"
fi
