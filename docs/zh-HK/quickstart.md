# 快速開始

目前只支援透過 Docker Compose 部署。

## 前置條件

- Docker 與 Docker Compose
- 一部可為 Hub、Postgres 及 InfluxDB 開放連接埠的主機

## 複製程式庫

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

### 設定

編輯 `.env` 檔案，按需要修改設定項目。

- `APP_HOST` 與 `APP_PORT` 指定 Hub 的繫結位址與連接埠。若使用反向代理，可將 `APP_HOST` 設為 `127.0.0.1`，並由代理將請求轉發至 Hub。
- `TRUST_PROXY` 表示信任 CDN 轉發的 IP 標頭。若使用 Cloudflare 或其他標準 CDN 服務，請設為 `true`。
- `SECURE_COOKIES` 確保 Cookie 只會透過 HTTPS 傳送。若 Hub 位於終止 TLS 的反向代理之後，請設為 `true`。

```env
# 若希望一直使用最新映像，請勿修改此項。
APP_VERSION=latest

# 應用程式繫結位址與主機連接埠。
# APP_PORT 只能是連接埠號碼，例如 8080。
# 繫結 IP 請用 APP_HOST；不要把 APP_PORT 寫成 127.0.0.1:8080。
APP_PORT=8080
APP_HOST=127.0.0.1

# 保安相關（位於終止 TLS 的反向代理之後時設定）
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

## 驗證

```bash
docker compose --env-file .env -f compose.yml ps
curl -fsS http://localhost:8080/health || true
```

若 Hub 監聽其他連接埠，請相應調整。

## 收尾

官方建置只會對外開放 HTTP 連接埠。若希望透過自訂域名以 HTTPS 公開存取 Hub，主要有兩種做法：

- 使用 [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/) 將 Hub 暴露到互聯網。Cloudflare Tunnel 會自動提供可用的 HTTPS 域名。
- 在 Hub 前方部署帶 TLS 終結的反向代理（例如 [Nginx](https://nginx.org/)、[Caddy](https://caddyserver.com/) 或 [Traefik](https://traefik.io/traefik)），將 HTTPS 請求轉發至 Hub 的 HTTP 連接埠。

我們不會附帶官方 Caddy 或 Traefik 映像，因為它們的設定相對複雜，而且用戶差異很大。不少項目會把你鎖進某種難以自訂的反向代理方案，反而增加麻煩。我們更希望你能自由選擇並設定最適合自己的反向代理。

## 升級

升級只需拉取最新映像並重新啟動容器：

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```
