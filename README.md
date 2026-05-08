# Product News Digest

一个面向读者的新品新闻聚合站原型，当前聚焦：

- 奢侈品
- 彩妆
- 运动
- 数码

前台负责展示按时间倒序排列的品牌新品新闻，后台开发方向则是逐步补齐：

- 品牌官网检索规则
- 定时抓取任务
- 新闻改写与统一语气
- 官图获取与存储
- 上线发布与自动更新

GitHub 交接和服务器拉取说明见：

- [docs/github-project-handoff.md](./docs/github-project-handoff.md)
- [docs/server-bootstrap.md](./docs/server-bootstrap.md)

## 当前前端能力

- 首页新闻流
- 频道页
- 品牌详情页
- 单条新闻详情页
- 点赞与留言

## 当前抓取骨架

项目已经补进第一版新闻流水线骨架，文件在：

- [src/pipeline/brandSources.ts](./src/pipeline/brandSources.ts)
- [src/pipeline/pipeline.ts](./src/pipeline/pipeline.ts)
- [src/pipeline/runtimeStore.ts](./src/pipeline/runtimeStore.ts)
- [scripts/run-pipeline.ts](./scripts/run-pipeline.ts)
- [docs/development-roadmap.md](./docs/development-roadmap.md)

这版还不是“真实官网抓取已全部打通”的状态，但已经把后续要持续开发的结构定好了：

- `brandSources`
  每个品牌一条规则，定义入口页、抓取方式、图片策略和关键词。
- `runPipeline`
  统一的定时任务入口。
- `runtimeStore`
  运行时数据现在同时保存为 JSON 导出和 SQLite 快照库，方便本地开发与服务器长期运行。

## 当前运行时架构

现在新闻流水线已经从“只写一份运行时 JSON”升级成了 4 层发布结构：

- 抓取候选层
  - `src/pipeline/fetchCandidates.ts`
- 新闻改写层
  - `src/pipeline/newsWriter.ts`
- 图片落地层
  - `src/pipeline/imageStore.ts`
- 发布输出层
  - `src/pipeline/publisher.ts`

运行后会生成这些文件：

- `data/runtime/news-items.json`
- `data/runtime/crawl-runs.json`
- `data/runtime/image-assets.json`
- `data/runtime/brand-snapshots.json`
- `data/runtime/pipeline-alerts.json`
- `data/runtime/analytics-events.json`
- `data/runtime/weekly-analytics-reports.json`
- `data/runtime/pipeline.db`
- `data/runtime/published-feed.json`
- `public/runtime/published-feed.json`

其中前台会优先读取 `public/runtime/published-feed.json`，如果没有再退回静态数据文件。

## 当前增量更新逻辑

现在每个品牌都会生成一份运行时快照：

- `data/runtime/brand-snapshots.json`

后续定时任务执行时会先比较品牌快照：

- 快照没变化：跳过模型生成和图片处理
- 快照有变化：才进入 `extract / judge / write` 和图片落地

另外当前执行已经拆成“轻量探测 + 深度抓取”两段：

- 先做 probe，只抓标题、链接、发布时间、产品名这些快照字段
- 只有 probe 结果有变化，才继续深抓图片、调用模型和发布新闻

这样第一次全量构建会慢一些，但后续只处理真正新增的品牌内容。

## 当前新闻生成状态

新闻改写层已经升级成“两段式”结构：

- 先从抓取结果里抽取事实字段
- 再按品类语气生成站内标题与摘要

当前已经升级成“优先模型生成，失败回退规则稿”的模式。生成目标是：

- 统一使用新闻语气
- 不出现“官网把 xx 放在首页”这类监测表达
- 奢侈品、彩妆、运动、数码四个大类分别保持不同的文风侧重

当前发布门禁逻辑：

- `extract`
  先从官网候选里抽事实字段
- `judge`
  判断这条内容是否值得发布
- `write`
  生成站内标题与摘要

如果 `judge` 返回不发布，这条候选不会进入公开 feed。  
如果模型超时、报错或返回字段不完整，则自动回退到规则稿，并在 `pipeline-alerts.json` 里留下告警。

## 当前 AI 架构骨架

现在项目里已经补了第一版可插拔 AI 架构，分成三层：

- 任务层
  - `src/pipeline/ai/tasks.ts`
- 模型适配层
  - `src/pipeline/ai/providers.ts`
- 编排层
  - `src/pipeline/ai/orchestrator.ts`

当前已经支持两种 provider：

- `mock`
- `openai-compatible`

后者已经可以用于 MiniMax 这类兼容 OpenAI 接口的模型服务。

推荐环境变量命名方式：

- `AI_EXTRACT_PROVIDER`
- `AI_EXTRACT_MODEL`
- `AI_JUDGE_PROVIDER`
- `AI_JUDGE_MODEL`
- `AI_WRITE_PROVIDER`
- `AI_WRITE_MODEL`
- `AI_API_KEY_ENV`
- `AI_BASE_URL`
- `AI_TASK_TIMEOUT_MS`
- `AI_PROVIDER_RETRY_COUNT`
- `PIPELINE_BRAND_CONCURRENCY`

也兼容 OpenAI-compatible 命名：

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

推荐服务器环境变量示例：

```bash
OPENAI_BASE_URL=https://api.minimaxi.com/v1
OPENAI_API_KEY=your-key
OPENAI_MODEL=MiniMax-M2.7

AI_EXTRACT_PROVIDER=openai
AI_JUDGE_PROVIDER=openai
AI_WRITE_PROVIDER=openai

AI_TASK_TIMEOUT_MS=20000
AI_PROVIDER_RETRY_COUNT=2
PIPELINE_BRAND_CONCURRENCY=2
```

这些配置的作用分别是：

- `AI_TASK_TIMEOUT_MS`
  单次模型任务的统一超时时间，毫秒
- `AI_PROVIDER_RETRY_COUNT`
  单个 provider 失败后的重试次数
- `PIPELINE_BRAND_CONCURRENCY`
  每轮品牌检索的并发数

邮件告警相关环境变量：

```bash
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_TO=boni.sa@outlook.com
ALERT_EMAIL_FROM=your-sender@outlook.com
ALERT_SMTP_HOST=smtp.office365.com
ALERT_SMTP_PORT=587
ALERT_SMTP_SECURE=false
ALERT_SMTP_USER=your-sender@outlook.com
ALERT_SMTP_PASS=your-smtp-password-or-app-password
ALERT_EMAIL_SUBJECT_PREFIX=[Product News Pipeline]
```

说明：

- `ALERT_EMAIL_TO`
  收件人列表，支持逗号分隔，默认会回退到 `boni.sa@outlook.com`
- `ALERT_EMAIL_FROM`
  发件人地址
- `ALERT_SMTP_PASS`
  发件账号的 SMTP 密码或应用专用密码
- 只有当本轮真的产生告警时，才会发邮件
- 如果没配好 SMTP，流水线不会失败，只会跳过发信

本地 smoke test：

```bash
npm run ai:smoke
```

服务器部署和定时执行模板见：

- [docs/tencent-cloud-deploy.md](./docs/tencent-cloud-deploy.md)
- [docs/server-bootstrap.md](./docs/server-bootstrap.md)
- [scripts/run-scheduled-pipeline.sh](./scripts/run-scheduled-pipeline.sh)
- [deploy/cron/pipeline.cron.example](./deploy/cron/pipeline.cron.example)
- [deploy/systemd/product-news-digest-pipeline.service](./deploy/systemd/product-news-digest-pipeline.service)
- [deploy/nginx/product-news-digest.conf](./deploy/nginx/product-news-digest.conf)

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run lint
```

## 运行新闻流水线

手动执行：

```bash
npm run pipeline:run
```

仅预演，不写入新增数据：

```bash
npm run pipeline:dry-run
```

运行时数据会写到：

- `data/runtime/news-items.json`
- `data/runtime/crawl-runs.json`
- `data/runtime/image-assets.json`
- `data/runtime/brand-snapshots.json`
- `data/runtime/pipeline-alerts.json`
- `data/runtime/analytics-events.json`
- `data/runtime/weekly-analytics-reports.json`
- `data/runtime/published-feed.json`

公开给前台读取的运行时 feed 在：

- `public/runtime/published-feed.json`

如果运行时有这些情况：

- 模型超时
- provider 调用失败
- judge 拦截候选
- 单品牌抓取报错

都会记录到：

- `data/runtime/pipeline-alerts.json`

## 点击日志与周报

当前站点已经补上第一版点击分析链路：

- 用户进入单条新闻详情页时，会向 `/api/analytics/story-click` 发送一次点击事件
- 事件会保存到 `data/runtime/analytics-events.json`
- 每周脚本会汇总：
  - 每个品牌的周点击量
  - 每个产品的周点击量
  - 连续点击关联度最高的品牌组合
- 周报会写入 `data/runtime/weekly-analytics-reports.json`

相关命令：

```bash
npm run analytics:server
npm run report:weekly
```

## 下一步开发重点

1. 继续扩充真实品牌抓取器，并补齐更多中国官网规则。
2. 把图片存储从本地 runtime 目录迁到腾讯云 COS。
3. 给模型链路补失败告警和发布前人工复核开关。
4. 把前端从 runtime feed 过渡到动态 API。
5. 准备腾讯云上线、备案和定时调度。
