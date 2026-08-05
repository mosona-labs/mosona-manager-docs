# 从全新安装到可用实例

快速开始介绍了如何用 Docker Compose 部署本项目。如果你对 Docker 还不太熟，可能仍不清楚接下来该做什么。分步文档会带你走完完整部署与首次初始化。

本指南以一台 2 核 CPU、2 GB 内存的 Debian 13 VPS 作为演示环境。

## 1. 部署

### 1.1. 安装 Docker

快速安装需要 Docker Compose。在 Linux 上，推荐使用 Docker 官方安装脚本：

```bash
curl -fsSL https://get.docker.com | bash -s docker
```

### 1.2. 克隆仓库

> 若尚未安装 git，请用发行版的包管理器安装，例如：`sudo apt install -y git`

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

此时你应位于仓库的 `deploy` 目录。大致如下（在 Linux 上，以 `.` 开头的文件在普通 `ls` 中是隐藏的）：

```bash
root@arespha:~/mosona-manager/deploy# ls
compose.yml  postgres
```

### 1.3. 编辑配置

配置文件应类似下面这样（除非后续有变更）：

```bash
root@arespha:~/mosona-manager/deploy# cat .env
APP_VERSION=latest

# Application bind address and host port.
# APP_PORT must be only a port number, for example 8080.
# Use APP_HOST for the bind IP; do not set APP_PORT to 127.0.0.1:8080.
APP_PORT=8080
APP_HOST=127.0.0.1

# Security (set when behind TLS-terminating reverse proxy)
# SECURE_COOKIES=true

# Postgres
PG_DB=mm_db
PG_USER=mm_user
PG_PASSWORD=[Change_Me_Pgsql_Password]

# InfluxDB2 init
INFLUX_USER=admin
INFLUX_PASSWORD=[Change_Me_Influx_Password]
INFLUX_ORG=mm_org
INFLUX_BUCKET=mm_bucket
INFLUX_TOKEN=[Change_Me_Long_Influx_Token]
```

用你习惯的编辑器修改 `.env`，例如 `nano` 或 `vim`。若系统没有，请先安装。

```bash
nano .env
```

若按本指南将服务暴露到公网，前三项通常不用改。但应取消注释 `SECURE_COOKIES=true`，因为 cloudflared 会为你终结 HTTPS。

请将 `[Change_Me_Pgsql_Password]`（以及其他占位密钥）替换为足够强的随机密码。保持默认值有时也能工作——数据库服务本身不会对外暴露——但改掉会更安全。

### 1.4. 使用 Compose 部署

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```

这两条命令会拉取本项目所需的全部镜像，创建并启动容器。输出大致如下：

```bash
root@arespha:~/mosona-manager/deploy# docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
[+] pull 47/47
 ✔ Image ghcr.io/mosona-labs/mosona-manager:latest Pulled
 ✔ Image containrrr/watchtower:latest              Pulled
 ✔ Image postgres:18-alpine                        Pulled
 ✔ Image redis:7-alpine                            Pulled
 ✔ Image influxdb:2.8-alpine                       Pulled
[+] up 10/10
 ✔ Network deploy_default              Created
 ✔ Volume deploy_app_data              Created
 ✔ Volume deploy_influx_data           Created
 ✔ Volume deploy_pg_data               Created
 ✔ Volume deploy_redis_data            Created
 ✔ Container mosona-manager-watchtower Started
 ✔ Container mosona-manager-redis      Healthy
 ✔ Container mosona-manager-postgres   Healthy
 ✔ Container mosona-manager-influxdb   Healthy
 ✔ Container mosona-manager-app        Started
```

验证安装是否成功：

```bash
curl -fsS http://localhost:8080/health || true
```

成功时应看到：

```json
{"code":"ok","msg":"Service is healthy"}
```

此时项目已运行在 `127.0.0.1:8080`，但还无法从公网访问。接下来部署 `cloudflared`。

## 2. Cloudflared

Cloudflared 是 Cloudflare 的 Tunnel 代理。它把本机 Web 服务转发到 Cloudflare，无需在服务器上开放任何公网端口，并位于 Cloudflare CDN 之后。简而言之，它能把 `127.0.0.1:8080` 变成一个可从任何地方用你自己的域名安全打开的普通网站。

而且它是免费的。

### 2.1. 创建 Tunnel

本指南跳过购买域名并将其接入 Cloudflare 的步骤。那些操作略繁琐，网上教程也很多，我们直接进入相关部分。

注意 Cloudflare 控制台更新频繁。此处的截图与菜单文案可能与最新界面不完全一致，但入口位置应大致相同，便于对照查找。

Tunnel 目前位于 **Networking → Tunnels**。

<img src="/screenshots/step-by-step/cloudflare-tunnel.avif" style="height: 300px" />

点击顶部的 **Create Tunnel**。

![](/screenshots/step-by-step/create-tunnel.avif)

Tunnel 创建完成后，选择服务器的操作系统与 CPU 架构，然后运行提供的命令安装 cloudflared。

![](/screenshots/step-by-step/install-tunnel.avif)

安装完成后，**Connection Status** 会显示服务器是否已连接。

### 2.2. 配置 Tunnel

返回 Tunnel 列表，打开刚创建的 Tunnel。大致如下：

![](/screenshots/step-by-step/detail-tunnel.avif)

点击 **Add route**，然后选择 **Published application**。

![](/screenshots/step-by-step/published.avif)

选择你的域名与期望的主机名，并将 **Service URL** 设为 `127.0.0.1:8080`。

![](/screenshots/step-by-step/add-route.avif)

等待数秒到数分钟让 DNS 生效，然后打开你配置的 URL 访问实例（例如截图中的 `https://test-demo.mosona.cc`）。

## 3. 初始化

### 3.1. 完成设置表单

按页面指引填写所有必填项。

<img src="/screenshots/step-by-step/init.avif" style="width: 60%; margin-left: 20%;" />

完成后会跳转到登录页。使用刚刚创建的管理员账户登录。

首次登录需要创建你的第一个 **Team（团队）**。团队是项目管理的基本单位——不同团队持有不同服务器。

![](/screenshots/step-by-step/create-team.avif)

之后会进入 Dashboard。使用右上角按钮创建服务器，再从界面探索其余功能。

![](/screenshots/step-by-step/dashboard.avif)

### 3.2. 更多设置与自定义

点击右上角头像，打开 **Admin Dashboard（管理后台）** 进行管理配置。各选项含义见 [设置指南](settings-guide.md)。

![](/screenshots/step-by-step/settings.avif)
