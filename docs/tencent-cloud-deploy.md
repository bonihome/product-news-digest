# Tencent Cloud Deployment

这份文档对应当前项目在腾讯云轻量应用服务器上的一版最小部署方式，目标是：

- 前台网站可公开访问
- 新闻流水线可定时执行
- 告警邮件发到 `boni.sa@outlook.com`
- 每周自动汇总点击周报并发到 `boni.sa@outlook.com`

## 1. 服务器目录约定

建议使用：

```bash
/srv/product-news-digest
```

当前 GitHub 仓库：

```bash
https://github.com/bonihome/product-news-digest.git
```

如果是全新服务器，先做基础环境安装：

```bash
sudo bash deploy/server/bootstrap-server.sh
```

基础环境说明见：

- [Server Bootstrap](./server-bootstrap.md)

首次拉取推荐命令：

```bash
sudo mkdir -p /srv
cd /srv
sudo git clone https://github.com/bonihome/product-news-digest.git
sudo chown -R $USER:$USER /srv/product-news-digest
cd /srv/product-news-digest
```

部署后目录中至少包含：

- 项目代码
- `.env`
- `dist`
- `public/runtime`
- `data/runtime`

另外会新增这些运行时文件：

- `data/runtime/analytics-events.json`
- `data/runtime/weekly-analytics-reports.json`

## 2. 环境变量

先复制模板：

```bash
cp .env.example .env
```

必须填写：

- `OPENAI_API_KEY`
- `ALERT_EMAIL_FROM`
- `ALERT_SMTP_USER`
- `ALERT_SMTP_PASS`
- `REPORT_EMAIL_FROM`
- `REPORT_SMTP_USER`
- `REPORT_SMTP_PASS`

建议保留：

- `ALERT_EMAIL_TO=boni.sa@outlook.com`
- `OPENAI_MODEL=MiniMax-M2.7`
- `AI_TASK_TIMEOUT_MS=20000`
- `AI_PROVIDER_RETRY_COUNT=2`
- `PIPELINE_BRAND_CONCURRENCY=2`

## 3. 初始化依赖

```bash
npm install
npm run build
```

如果前台只跑静态站，可以直接把 `dist` 交给 Nginx。

## 4. 前台站点

Nginx 站点根目录建议指向：

```bash
/srv/product-news-digest/dist
```

同时保留这些可写目录供流水线更新：

- `/srv/product-news-digest/data/runtime`
- `/srv/product-news-digest/public/runtime`

如果你后面改成 API 服务，再把运行时 feed 从静态文件切到接口。

## 5. 定时任务

当前项目已经提供：

- 定时脚本：[scripts/run-scheduled-pipeline.sh](../scripts/run-scheduled-pipeline.sh)
- 周报脚本：[scripts/run-weekly-report.sh](../scripts/run-weekly-report.sh)
- `cron` 示例：[deploy/cron/pipeline.cron.example](../deploy/cron/pipeline.cron.example)
- 周报 `cron` 示例：[deploy/cron/weekly-report.cron.example](../deploy/cron/weekly-report.cron.example)
- `systemd` 模板：[deploy/systemd/product-news-digest-pipeline.service](../deploy/systemd/product-news-digest-pipeline.service)
- Analytics 服务模板：[deploy/systemd/product-news-digest-analytics.service](../deploy/systemd/product-news-digest-analytics.service)
- Nginx 站点配置：[deploy/nginx/product-news-digest.conf](../deploy/nginx/product-news-digest.conf)

默认执行时间：

- 周三 09:00
- 周三 18:00
- 周日 09:00
- 周日 18:00

安装 `cron` 的最小方式：

```bash
sudo mkdir -p /var/log/product-news-digest
crontab deploy/cron/pipeline.cron.example
```

周报任务也需要一起加入：

```bash
cat deploy/cron/pipeline.cron.example deploy/cron/weekly-report.cron.example | crontab -
```

## 6. 使用 systemd 手动触发

如果你想手动执行一次流水线：

```bash
sudo cp deploy/systemd/product-news-digest-pipeline.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start product-news-digest-pipeline.service
sudo systemctl status product-news-digest-pipeline.service
```

Analytics 服务启动方式：

```bash
sudo cp deploy/systemd/product-news-digest-analytics.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now product-news-digest-analytics.service
sudo systemctl status product-news-digest-analytics.service
```

## 7. Nginx 站点配置

当前项目已经生成一份站点模板：

```bash
deploy/nginx/product-news-digest.conf
```

安装方式：

```bash
sudo cp deploy/nginx/product-news-digest.conf /etc/nginx/conf.d/product-news-digest.conf
sudo nginx -t
sudo systemctl reload nginx
```

你需要先把里面这几个值替换掉：

- `your-domain.com`
- `www.your-domain.com`
- HTTPS 证书路径

这份配置有一个关键点：

- `/` 走 `dist`，服务前台页面
- `/runtime/` 单独指向 `public/runtime`
- `/api/analytics/` 反向代理到本机 `8787` 端口

这样定时任务写入的：

- `public/runtime/published-feed.json`
- `public/runtime/news-images/...`

就能实时被线上站点读取，不需要每次重新 `npm run build`。  
而用户浏览单条新闻详情页时，点击埋点会通过 `/api/analytics/story-click` 写入运行时日志。

## 8. 邮件告警验证

先保证 `.env` 中 SMTP 可用，然后手动运行：

```bash
npm run pipeline:scheduled
```

正常情况下：

- 没有告警：控制台会显示 `Alert email: skipped (no alerts)`
- 有告警：会尝试发邮件到 `boni.sa@outlook.com`
- SMTP 配置错误：流水线不会中断，但会记录系统级邮件告警失败

## 9. 周报验证

先启动 analytics 服务，再手动运行：

```bash
npm run report:weekly
```

正常情况下：

- 会生成 `data/runtime/weekly-analytics-reports.json`
- 会把过去 7 天的品牌点击、产品点击和品牌连续点击关系汇总成一封周报邮件

## 10. 建议的上线前检查

- `npm run build`
- `npm run lint`
- `npm run pipeline:scheduled`
- `npm run analytics:server`
- `npm run report:weekly`
- 检查 `public/runtime/published-feed.json` 是否更新
- 检查 `data/runtime/crawl-runs.json` 是否新增本轮记录
- 检查 `data/runtime/analytics-events.json` 是否开始写入点击数据
- 检查 `data/runtime/weekly-analytics-reports.json` 是否新增周报记录
- 检查 Outlook 是否收到告警邮件
- 检查 Outlook 是否收到周报邮件
