# Server Bootstrap

这份文档只处理一件事：先把一台新 Linux 服务器装成可以运行当前站点的基础环境。

适用范围：

- Ubuntu 22.04 / 24.04
- Debian 12
- CentOS Stream / Rocky / AlmaLinux / TencentOS Server

## 1. 需要的基础组件

当前项目运行最少需要：

- `git`
- `nodejs` 和 `npm`
- `nginx`
- `cron` 或 `crond`
- `unzip`
- 基本编译工具

## 2. 一键安装脚本

项目里已经带了一份脚本：

```bash
deploy/server/bootstrap-server.sh
```

如果代码已经在服务器上，直接执行：

```bash
sudo bash deploy/server/bootstrap-server.sh
```

如果你想显式指定项目目录或运行用户：

```bash
sudo APP_USER=ubuntu PROJECT_DIR=/srv/product-news-digest bash deploy/server/bootstrap-server.sh
```

脚本会自动：

- 识别 `apt / dnf / yum`
- 安装 `git / nodejs / npm / nginx / unzip / cron`
- 启用 `nginx`
- 启用 `cron` 或 `crond`
- 创建：
  - `/srv/product-news-digest`
  - `/var/log/product-news-digest`

## 3. 安装后自检

执行：

```bash
git --version
node -v
npm -v
nginx -v
systemctl status nginx --no-pager
systemctl status cron --no-pager || systemctl status crond --no-pager
```

## 4. 下一步

基础环境完成后，再继续：

1. 拉取 GitHub 仓库
2. 复制 `.env.example` 到 `.env`
3. 安装项目依赖
4. 构建前台
5. 配置 `systemd`、`cron` 和 `nginx`

完整部署步骤见：

- [Tencent Cloud Deployment](./tencent-cloud-deploy.md)
- [GitHub Project Handoff](./github-project-handoff.md)
