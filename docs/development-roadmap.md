# Product News Pipeline Roadmap

## 1. 品牌规则层

- 为每个品牌建立独立规则，而不是把抓取逻辑写死在脚本里。
- 规则至少包含：
  - 品牌名
  - 大类与子类
  - 中国官网入口
  - 抓取方式：`html / browser / json`
  - 图片策略：`product-page / gallery-image / page-screenshot / homepage-module`
  - 周期：当前统一使用 `wed-sun-twice`
- 第一批先覆盖 8 到 12 个品牌，优先选择官网结构稳定的品牌。

## 2. 定时抓取层

- 当前入口脚本：`scripts/run-pipeline.ts`
- 当前运行方式：
  - 手动：`npm run pipeline:run`
  - 预演：`npm run pipeline:dry-run`
- 上线后调度方式：
  - 周三 09:00
  - 周三 18:00
  - 周日 09:00
  - 周日 18:00
- 推荐用法：
  - 开发期先用 Linux `cron`
  - 稳定后切到腾讯云 `SCF` 定时触发器
- 当前版本已经补上品牌快照层：
  - `data/runtime/brand-snapshots.json`
  - 快照未变化的品牌会直接跳过模型生成和图片处理
- 当前版本已经拆成“轻量探测 + 深度抓取”两段：
  - probe 只抓快照字段
  - 快照变化后才继续深抓和模型生成
- 当前建议服务器环境变量：
  - `PIPELINE_BRAND_CONCURRENCY=2`
  - `AI_TASK_TIMEOUT_MS=20000`
  - `AI_PROVIDER_RETRY_COUNT=2`
  - `ALERT_EMAIL_TO=boni.sa@outlook.com`
  - `ALERT_EMAIL_FROM=...`
  - `ALERT_SMTP_PASS=...`

## 3. 新闻生成层

- 当前版本已经升级为“两段式”生成骨架：
  - 先从抓取结果里抽取事实字段
  - 再按品类语气改写成站内新闻标题与摘要
- 当前已经接上模型优先生成：
  - 先 `extract`
  - 再 `judge`
  - 最后 `write`
- 如果模型失败、超时或返回字段不完整，会回退为规则稿。
- 如果 `judge` 判断不值得发布，这条候选会直接被拦截，不进入公开 feed。
- 语气要求：
  - 用“品牌推出…”“品牌发布…”
  - 不用“官网把 xx 放在首页”
  - 不暴露抓取、校验、监控语气
- 当前文风分层：
  - 奢侈品：偏时尚与系列扩容语气
  - 彩妆：偏新品主打与产品线延展语气
  - 运动：偏装备更新与专业属性语气
  - 数码：偏新品发布与产品布局语气

## 4. 图片层

- 当前规则层已经记录了每个品牌的图片获取策略。
- 当前版本已经补上第一版图片执行器：
  - 抓取到的官方图片会下载到 `public/runtime/news-images`
  - 同步生成 `data/runtime/image-assets.json`
  - 发布 feed 会优先引用本地路径而不是长期热链
- 当前执行顺序：
  - 优先抓产品页主图
  - 再尝试详情页主视觉
  - 最后保留原始外链作为兜底
- 上线前建议继续升级到 COS，把 `public/runtime/news-images` 迁移成对象存储。

## 5. 数据存储层

- 当前已经同时使用运行时 JSON 和 SQLite：
  - `data/runtime/news-items.json`
  - `data/runtime/crawl-runs.json`
- `data/runtime/image-assets.json`
- `data/runtime/brand-snapshots.json`
- `data/runtime/pipeline-alerts.json`
- `data/runtime/pipeline.db`
- 这个阶段已经能兼顾快速开发和服务器上的增量执行。
- 上线前建议迁移到数据库：
  - `brand_sources`
  - `news_items`
  - `crawl_runs`
  - `image_assets`
  - `pipeline_alerts`

## 6. 网站接入层

- 当前站点已经支持两层读取：
  - 优先读取 `public/runtime/published-feed.json`
  - 失败时退回静态数据文件
- 下一步要把首页、频道页、品牌页进一步切到后端 API：
  - `GET /api/news`
  - `GET /api/news/:id`
  - `GET /api/brands/:brand`
  - `GET /api/channels/:category`

## 7. 上线前最后一轮

- 域名解析
- HTTPS 证书
- ICP 备案
- 防火墙放通 80 / 443 / 22
- 定时任务注册
- 环境变量注入
- 抓取日志保留
- 图片上传 COS
- 失败告警
- judge 门禁验证
- 邮件通知链路验证
