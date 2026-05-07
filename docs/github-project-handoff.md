# GitHub Project Handoff

这份文档用于把当前网站整理成一个可以上传到 GitHub、再由服务器直接拉取部署的项目。

## 仓库里应该保留什么

这些内容应该提交到 GitHub：

- 前端源码
  - `src/`
- 静态产品图和站点资源
  - `public/news/`
  - `public/favicon.svg`
  - `public/icons.svg`
- 图片抓取规则
  - `data/image-rules/`
- 抓取、生成、分析脚本
  - `scripts/`
- 部署模板
  - `deploy/`
- 项目文档
  - `README.md`
  - `docs/`
- 配置文件
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `vite.config.ts`
  - `.env.example`

## 仓库里不应该保留什么

这些内容不要提交：

- 环境变量和密钥
  - `.env`
  - 任何真实 API key、SMTP 密码
- 运行时数据
  - `data/runtime/`
  - `public/runtime/`
- 构建产物
  - `dist/`
- 本地调试和临时截图
  - `tmp/`
  - `tmp-*.png`
  - `tmp-*.jpg`
- `node_modules/`

## 当前项目的核心能力

项目现在分成 4 个部分：

1. 读者前台
   - 首页、频道页、品牌页、新闻详情页
2. 新闻更新 pipeline
   - `scripts/run-pipeline.ts`
   - `src/pipeline/`
3. 图片规则系统
   - `data/image-rules/`
4. 访问与点击统计
   - `scripts/analytics-server.ts`

## 服务器拉取后的启动顺序

### 1. 克隆项目

```bash
git clone https://github.com/bonihome/product-news-digest.git
cd 2026-04-27-new-chat
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制：

```bash
cp .env.example .env
```

然后填写至少这些值：

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `AI_EXTRACT_PROVIDER`
- `AI_JUDGE_PROVIDER`
- `AI_WRITE_PROVIDER`
- `ALERT_EMAIL_FROM`
- `ALERT_SMTP_USER`
- `ALERT_SMTP_PASS`

如果要启用邮件周报或告警，也一起填写：

- `ALERT_EMAIL_TO`
- `ALERT_EMAIL_ENABLED`

### 4. 首次生成运行时数据

```bash
npm run image-rules:generate
npm run pipeline:run
```

### 5. 构建前台

```bash
npm run build
```

### 6. 启动 analytics 服务

```bash
npm run analytics:server
```

### 7. 配置 Nginx

使用：

- `deploy/nginx/product-news-digest.conf`

它会同时服务：

- `dist/` 前台页面
- `public/runtime/` 运行时新闻 feed 和运行时图片
- analytics API 反向代理

## 日常更新流程

服务器上的标准更新方式：

```bash
git pull origin main
npm install
npm run image-rules:generate
npm run pipeline:run
npm run build
```

如果只是内容更新，不改前端代码，也至少要跑：

```bash
npm run image-rules:generate
npm run pipeline:run
```

## 图片更新的标准路径

图片更新时优先看：

1. `data/image-rules/brand-methods-summary.md`
2. 对应品牌的 `data/image-rules/<brand>.json`
3. `docs/official-image-sourcing.md`

执行顺序：

1. 先读品牌级抓图方法
2. 再看具体新闻对应的 `candidateImageUrl`
3. 如果没有直链，再按 `sourcePage + method + priority` 回源抓图
4. 下载后保存为本地文件
5. 更新 story 数据里的本地路径
6. 重新运行 `npm run image-rules:generate`

## 重要规则

- 所有前台图优先使用本地文件，不依赖热链
- 运行时数据不提交 GitHub
- 图片规则文件要提交 GitHub
- 新增品牌或新增新闻后，要同步更新图片规则摘要
- 如果某个品牌站点反爬严重，优先记录“浏览器抓图规则”，不要只记临时链接

## 推荐的 GitHub 上传顺序

如果本地还没有 git 仓库：

```bash
git init
git add .
git commit -m "Initial product news digest site"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 上线前检查

- `.env` 没有被提交
- `data/runtime/` 没有被提交
- `public/runtime/` 没有被提交
- 前端静态图片都在 `public/news/`
- `npm run build` 通过
- `npm run lint` 通过
- `npm run pipeline:run` 能正常执行
- `npm run analytics:server` 能启动
