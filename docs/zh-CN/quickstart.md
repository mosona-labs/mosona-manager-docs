# 快速开始

推荐使用 **Docker Compose** 部署 Mosona Manager。

若需要自行运行 Hub 二进制（物理机、systemd，或外部数据库），请参阅 [手动部署](./manual-deploy.md)。

## 前置条件

- Docker 与 Docker Compose
- 一台可为 Hub、Postgres 和 InfluxDB 开放端口的主机

## 克隆仓库

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

### 配置

编辑 `.env` 文件，按需修改配置项。

- `APP_HOST` 与 `APP_PORT` 指定 Hub 的绑定地址与端口。若使用反向代理，可将 `APP_HOST` 设为 `127.0.0.1`，并由代理将请求转发到 Hub。
- `TRUST_PROXY` 表示信任 CDN 转发的 IP 头。若使用 Cloudflare 或其他标准 CDN 服务，请设为 `true`。
- `SECURE_COOKIES` 确保 Cookie 仅通过 HTTPS 发送。若 Hub 位于终止 TLS 的反向代理之后，请设为 `true`。

```env
# 若希望始终使用最新镜像，请勿修改此项。
APP_VERSION=latest

# 应用绑定地址与主机端口。
# APP_PORT 只能是端口号，例如 8080。
# 绑定 IP 请用 APP_HOST；不要把 APP_PORT 写成 127.0.0.1:8080。
APP_PORT=8080
APP_HOST=127.0.0.1

# 安全相关（位于终止 TLS 的反向代理之后时设置）
# SECURE_COOKIES=true

# Postgres
PG_DB=mm_db
PG_USER=mm_user
PG_PASSWORD=[Change_Me_Pgsql_Password]

# InfluxDB2 初始化
INFLUX_USER=admin
INFLUX_PASSWORD=[Change_Me_Influx_Password]
INFLUX_ORG=mm_org
INFLUX_BUCKET=mm_bucket
INFLUX_TOKEN=[Change_Me_Long_Influx_Token]

```

## 使用 Compose 部署

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```

## 验证

```bash
docker compose --env-file .env -f compose.yml ps
curl -fsS http://localhost:8080/health || true
```

若 Hub 监听其他端口，请相应调整。

## 收尾

官方构建仅暴露 HTTP 端口。若希望通过自定义域名以 HTTPS 对外访问 Hub，主要有两种方式：

- 使用 [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/) 将 Hub 暴露到公网。Cloudflare Tunnel 会自动提供可用的 HTTPS 域名。
- 在 Hub 前部署带 TLS 终结的反向代理（例如 [Nginx](https://nginx.org/)、[Caddy](https://caddyserver.com/) 或 [Traefik](https://traefik.io/traefik)），将 HTTPS 请求转发到 Hub 的 HTTP 端口。

我们不附带官方 Caddy 或 Traefik 镜像，因为它们的配置相对复杂，且用户差异很大。许多项目会把你锁进某种难以定制的反向代理方案，反而增加摩擦。我们更希望你能自由选择并配置最适合自己的反向代理。

## 升级

升级只需拉取最新镜像并重启容器：

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```
