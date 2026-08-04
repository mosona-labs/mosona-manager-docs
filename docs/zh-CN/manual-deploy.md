# 手动部署

推荐使用 Docker Compose 运行 Mosona Manager。当你需要**自行运行 Hub 二进制**时（例如物理机、systemd，或由外部管理的 Postgres / Redis / InfluxDB），请按本文操作。

Compose 部署请参阅 [快速开始](./quickstart.md)。

## 你需要准备什么

| 组件 | 作用 | 说明 |
| --- | --- | --- |
| **Hub**（`mosona-manager`） | API + Web UI 服务 | 由本仓库构建的 Go 二进制 |
| **主前端** | 管理端 / 用户界面 | 构建自 [`mosona-manager-web`](https://github.com/mosona-labs/mosona-manager-web) |
| **公开页前端** | 公开状态页静态资源 | 构建自 [`mosona-manager-pub`](https://github.com/mosona-labs/mosona-manager-pub) |
| **PostgreSQL** | 主数据库 | Compose 使用 Postgres **18** |
| **Redis** | 缓存 / 会话 / 实时辅助 | Compose 使用 Redis **7** |
| **InfluxDB 2** | 指标存储 | Compose 使用 InfluxDB **2.8**；Hub 启动时会自行创建指标 bucket |

建议同时准备：

- 带 TLS 的反向代理（Nginx、Caddy、Traefik、Cloudflare Tunnel 等）
- 在代理终结 TLS 时设置 `SECURE_COOKIES=true`

## 前置条件

- **Go 1.26+**（用于构建 Hub）
- **Node.js + pnpm**（用于构建前端）
- 已运行且 Hub 可访问的 **PostgreSQL**、**Redis**、**InfluxDB 2**
- 按需开放网络端口（未设置 `PORT` 时 Hub 默认监听 **3214**）

## 1. 克隆仓库

Hub、主界面与公开页分属三个仓库，建议并列克隆：

```bash
mkdir -p ~/mosona && cd ~/mosona
git clone https://github.com/mosona-labs/mosona-manager.git
git clone https://github.com/mosona-labs/mosona-manager-web.git
git clone https://github.com/mosona-labs/mosona-manager-pub.git
cd mosona-manager
```

## 2. 将前端构建到 `static/`

Hub 从 `FRONTEND_DIR`（默认 `./static/`）提供静态文件，需要：

- 主界面文件位于该目录根下（`index.html`、资源文件等）
- 公开页文件位于 `public-preview/`，并将资源路径改写为 `/preview-assets`

```bash
# 主前端 → ./static
(
  cd ../mosona-manager-web
  pnpm install
  pnpm run build
)
rm -rf static/*
mkdir -p static
cp -a ../mosona-manager-web/dist/. static/

# 公开页 → ./static/public-preview
(
  cd ../mosona-manager-pub
  pnpm install
  pnpm run build
)
mkdir -p static/public-preview
cp -a ../mosona-manager-pub/dist/. static/public-preview/

# 改写公开页资源 URL（必需）
perl -pi -e 's#/index\.js#/preview-assets/index.js#g' static/public-preview/index.html
perl -pi -e 's#/index\.css#/preview-assets/index.css#g' static/public-preview/index.html
rm -f static/public-preview/favicon.svg
rm -rf static/public-preview/flags static/public-preview/icons
```

> macOS 也可用系统自带的 `sed -i ''`；`perl -pi` 在 Linux 与 macOS 上更通用。

若不想把资源放在仓库目录内，可稍后将 `FRONTEND_DIR` 指到其他绝对路径。

## 3. 构建 Hub 二进制

在 `mosona-manager` 仓库根目录执行：

```bash
# 本地一次性构建
go build -ldflags="-s -w -X mosona-manager/internal/runtime.Version=dev" \
  -o mosona-manager \
  ./cmd/hub

# 或使用发布脚本（多架构产物在 build/）
# ./script/build.sh --version v0.1.0 --hub
```

二进制支持用于探针的 `health` 子命令：

```bash
./mosona-manager health   # HTTP /health 正常时打印 "ok"
```

## 4. 准备依赖服务

### PostgreSQL

创建 Hub 可用的数据库与用户，例如：

```sql
CREATE USER mm_user WITH PASSWORD 'change-me';
CREATE DATABASE mm_db OWNER mm_user;
```

### Redis

默认监听 `127.0.0.1:6379` 即可。若 Redis 需要密码，请在 Hub 环境中设置 `REDIS_PASSWORD`（见下文）。

### InfluxDB 2

1. 安装并启动 InfluxDB 2。
2. 完成初始化（UI 或 `influx setup`），创建 **organization（组织）** 与 **admin/API token**。
3. 将组织名与 token 写入 Hub 环境变量 `INFLUXDB_ORG`、`INFLUXDB_TOKEN`。

Hub **不会**从环境变量读取单一业务 bucket。启动时会用你的 token 连接，并确保自有 bucket 存在（例如 `server_status_raw`、`server_status_minute`、`logs` 等）。

## 5. 配置环境变量

Hub 会从**进程工作目录**加载 `.env`（若存在，经 `godotenv`），同时读取真实环境变量。

复制手动部署示例并编辑：

```bash
cp .env.manual.example .env
```

Hub 期望的最小配置：

```env
# 监听地址（默认：HOST=0.0.0.0，PORT=3214）
HOST=0.0.0.0
PORT=3214

# PostgreSQL（均必填）
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=mm_user
POSTGRES_PASS=change-me
POSTGRES_DB=mm_db

# InfluxDB 2（org + token 必填；URL 默认 http://localhost:8086）
INFLUXDB_URL=http://127.0.0.1:8086
INFLUXDB_ORG=mm_org
INFLUXDB_TOKEN=your-long-influx-token

# Redis（端口必填；密码可选）
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# 前端目录（默认 ./static/）
FRONTEND_DIR=./static/

# 当 TLS 在 Hub 前的反向代理 / CDN 终结时设置
# SECURE_COOKIES=true
```

说明：

- Redis 密码请使用 **`REDIS_PASSWORD`**。Hub 读取的是此名称（不是 `REDIS_PASS`）。
- 旧示例中的 `INFLUXDB_BUCKET` 只与 Docker Compose 的 Influx **初始化**容器有关，Hub 二进制不需要它。
- 站点运行时设置（Base URL、Trust Proxy、邮件、OAuth 等）在首次启动后于 **Admin Dashboard（管理后台）** 配置。详见 [设置指南](./settings-guide.md)。
- 进程会在工作目录下创建 `./avatars` 用于头像 / 图标上传。若用 systemd 运行，请保持 CWD 稳定（例如专用数据目录）。
- `GeoLite2-Country.mmdb` 可选；缺失时 Hub 可能在后台下载，用于 IP 地理信息。

## 6. 运行 Hub

先启动依赖服务，然后：

```bash
# 在包含 .env、static/，以及（之后）avatars/ 的目录中执行
./mosona-manager
```

验证：

```bash
curl -fsS "http://127.0.0.1:3214/health"
./mosona-manager health
```

在浏览器打开 `http://127.0.0.1:3214/`（或你设置的 `HOST`/`PORT`），完成首次初始化。

## 7. 可选：systemd 单元

示例单元（请按实际路径与用户修改）：

```ini
[Unit]
Description=Mosona Manager Hub
After=network-online.target postgresql.service redis.service influxdb.service
Wants=network-online.target

[Service]
Type=simple
User=mosona
Group=mosona
WorkingDirectory=/opt/mosona-manager
EnvironmentFile=/opt/mosona-manager/.env
ExecStart=/opt/mosona-manager/mosona-manager
Restart=on-failure
RestartSec=5

# 加固（可选）
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mosona-manager
sudo systemctl status mosona-manager
```

## 8. 通过 HTTPS 对外提供

与 Compose 相同：

- [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- 带 TLS 终结的反向代理（[Nginx](https://nginx.org/)、[Caddy](https://caddyserver.com/)、[Traefik](https://traefik.io/traefik) 等）将流量转发到 Hub 的 HTTP 端口

当 TLS 在代理处终结时：

1. 为 Hub 进程设置 `SECURE_COOKIES=true`。
2. 在管理后台设置中，将 **Base URL** 设为公开的 `https://…/` 源地址。
3. **仅**在 Hub 只通过受信任代理 / CDN 访问时启用 **Trust Proxy**。详见 [安全警告](./others/security-warning.md)。

## 升级

1. 拉取三个仓库的最新代码 / 标签。
2. 重新构建前端到 `FRONTEND_DIR`（第 2 步）。
3. 重新构建 Hub 二进制（第 3 步）。
4. 重启进程（`systemctl restart mosona-manager` 或你的进程管理器）。
5. 确认 `/health` 仍然成功。

升级时请保留 `.env`、PostgreSQL/Redis/Influx 数据，以及 `avatars/` 目录。

## 故障排查

| 现象 | 排查方向 |
| --- | --- |
| 进程立即退出并提示 Postgres | 检查 `POSTGRES_*`、数据库连通性、用户 / 密码 / 库是否存在 |
| 退出并提示 InfluxDB / organization | 检查 `INFLUXDB_URL`、组织名、token 权限；Influx 需已完成初始化 |
| 退出并提示 Redis | 检查 `REDIS_HOST` / `REDIS_PORT`；若启用认证请使用 `REDIS_PASSWORD` |
| 界面空白或静态资源 404 | 重新构建前端；确认 `FRONTEND_DIR` 指向构建产物；公开页需要带改写路径的 `static/public-preview` |
| HTTPS 代理后 Cookie / 登录异常 | `SECURE_COOKIES=true`、Base URL 正确，且仅在真实代理后启用 Trust Proxy |
| `mosona-manager health` 失败 | Hub 尚未监听、`HOST`/`PORT` 不正确，或启动崩溃 — 查看日志 |

## 相关文档

- [快速开始](./quickstart.md) — Docker Compose 部署
- [设置指南](./settings-guide.md) — 安装后的管理后台设置
- [安全警告](./others/security-warning.md) — 生产环境加固
