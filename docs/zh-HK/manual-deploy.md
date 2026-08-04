# 手動部署

建議使用 Docker Compose 運行 Mosona Manager。當你需要**自行運行 Hub 二進位檔**時（例如實體機、systemd，或由外部管理的 Postgres／Redis／InfluxDB），請按本文操作。

Compose 部署請參閱 [快速開始](./quickstart.md)。

## 你需要準備甚麼

| 元件 | 作用 | 說明 |
| --- | --- | --- |
| **Hub**（`mosona-manager`） | API + Web UI 服務 | 由本程式庫建置的 Go 二進位檔 |
| **主前端** | 管理端／用戶介面 | 建置自 [`mosona-manager-web`](https://github.com/mosona-labs/mosona-manager-web) |
| **公開頁前端** | 公開狀態頁靜態資源 | 建置自 [`mosona-manager-pub`](https://github.com/mosona-labs/mosona-manager-pub) |
| **PostgreSQL** | 主資料庫 | Compose 使用 Postgres **18** |
| **Redis** | 快取／工作階段／即時輔助 | Compose 使用 Redis **7** |
| **InfluxDB 2** | 指標儲存 | Compose 使用 InfluxDB **2.8**；Hub 啟動時會自行建立指標 bucket |

建議同時準備：

- 帶 TLS 的反向代理（Nginx、Caddy、Traefik、Cloudflare Tunnel 等）
- 在代理終結 TLS 時設定 `SECURE_COOKIES=true`

## 前置條件

- **Go 1.26+**（用於建置 Hub）
- **Node.js + pnpm**（用於建置前端）
- 已運行且 Hub 可連線的 **PostgreSQL**、**Redis**、**InfluxDB 2**
- 按需要開放網絡連接埠（未設定 `PORT` 時 Hub 預設監聽 **3214**）

## 1. 複製程式庫

Hub、主介面與公開頁分屬三個程式庫，建議並列複製：

```bash
mkdir -p ~/mosona && cd ~/mosona
git clone https://github.com/mosona-labs/mosona-manager.git
git clone https://github.com/mosona-labs/mosona-manager-web.git
git clone https://github.com/mosona-labs/mosona-manager-pub.git
cd mosona-manager
```

## 2. 將前端建置到 `static/`

Hub 從 `FRONTEND_DIR`（預設 `./static/`）提供靜態檔案，需要：

- 主介面檔案位於該目錄根下（`index.html`、資源檔等）
- 公開頁檔案位於 `public-preview/`，並將資源路徑改寫為 `/preview-assets`

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

# 公開頁 → ./static/public-preview
(
  cd ../mosona-manager-pub
  pnpm install
  pnpm run build
)
mkdir -p static/public-preview
cp -a ../mosona-manager-pub/dist/. static/public-preview/

# 改寫公開頁資源 URL（必需）
perl -pi -e 's#/index\.js#/preview-assets/index.js#g' static/public-preview/index.html
perl -pi -e 's#/index\.css#/preview-assets/index.css#g' static/public-preview/index.html
rm -f static/public-preview/favicon.svg
rm -rf static/public-preview/flags static/public-preview/icons
```

> macOS 也可用系統自帶的 `sed -i ''`；`perl -pi` 在 Linux 與 macOS 上更通用。

若不想把資源放在程式庫目錄內，可稍後將 `FRONTEND_DIR` 指向其他絕對路徑。

## 3. 建置 Hub 二進位檔

在 `mosona-manager` 程式庫根目錄執行：

```bash
# 本機一次性建置
go build -ldflags="-s -w -X mosona-manager/internal/runtime.Version=dev" \
  -o mosona-manager \
  ./cmd/hub

# 或使用發布腳本（多架構產物在 build/）
# ./script/build.sh --version v0.1.0 --hub
```

二進位檔支援用於探測的 `health` 子命令：

```bash
./mosona-manager health   # HTTP /health 正常時列印 "ok"
```

## 4. 準備依賴服務

### PostgreSQL

建立 Hub 可用的資料庫與用戶，例如：

```sql
CREATE USER mm_user WITH PASSWORD 'change-me';
CREATE DATABASE mm_db OWNER mm_user;
```

### Redis

預設監聽 `127.0.0.1:6379` 即可。若 Redis 需要密碼，請在 Hub 環境中設定 `REDIS_PASSWORD`（見下文）。

### InfluxDB 2

1. 安裝並啟動 InfluxDB 2。
2. 完成初始化（UI 或 `influx setup`），建立 **organization（組織）** 與 **admin/API token**。
3. 將組織名稱與 token 寫入 Hub 環境變數 `INFLUXDB_ORG`、`INFLUXDB_TOKEN`。

Hub **不會**從環境變數讀取單一業務 bucket。啟動時會用你的 token 連線，並確保自有 bucket 存在（例如 `server_status_raw`、`server_status_minute`、`logs` 等）。

## 5. 設定環境變數

Hub 會從**進程工作目錄**載入 `.env`（若存在，經 `godotenv`），同時讀取真實環境變數。

複製手動部署範例並編輯：

```bash
cp .env.manual.example .env
```

Hub 期望的最小設定：

```env
# 監聽位址（預設：HOST=0.0.0.0，PORT=3214）
HOST=0.0.0.0
PORT=3214

# PostgreSQL（均必填）
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=mm_user
POSTGRES_PASS=change-me
POSTGRES_DB=mm_db

# InfluxDB 2（org + token 必填；URL 預設 http://localhost:8086）
INFLUXDB_URL=http://127.0.0.1:8086
INFLUXDB_ORG=mm_org
INFLUXDB_TOKEN=your-long-influx-token

# Redis（連接埠必填；密碼可選）
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# 前端目錄（預設 ./static/）
FRONTEND_DIR=./static/

# 當 TLS 在 Hub 前的反向代理／CDN 終結時設定
# SECURE_COOKIES=true
```

說明：

- Redis 密碼請使用 **`REDIS_PASSWORD`**。Hub 讀取的是此名稱（不是 `REDIS_PASS`）。
- 舊範例中的 `INFLUXDB_BUCKET` 只與 Docker Compose 的 Influx **初始化**容器有關，Hub 二進位檔不需要它。
- 網站運行時設定（Base URL、Trust Proxy、電郵、OAuth 等）在首次啟動後於 **Admin Dashboard（管理後台）** 設定。詳見 [設定指南](./settings-guide.md)。
- 進程會在工作目錄下建立 `./avatars`，用於頭像／圖示上傳。若用 systemd 運行，請保持 CWD 穩定（例如專用資料目錄）。
- `GeoLite2-Country.mmdb` 可選；缺失時 Hub 可能在背景下載，用於 IP 地理位置。

## 6. 運行 Hub

先啟動依賴服務，然後：

```bash
# 在包含 .env、static/，以及（之後）avatars/ 的目錄中執行
./mosona-manager
```

驗證：

```bash
curl -fsS "http://127.0.0.1:3214/health"
./mosona-manager health
```

在瀏覽器開啟 `http://127.0.0.1:3214/`（或你設定的 `HOST`／`PORT`），完成首次初始化。

## 7. 可選：systemd 單元

範例單元（請按實際路徑與用戶修改）：

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

# 加固（可選）
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

## 8. 透過 HTTPS 對外提供

與 Compose 相同：

- [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- 帶 TLS 終結的反向代理（[Nginx](https://nginx.org/)、[Caddy](https://caddyserver.com/)、[Traefik](https://traefik.io/traefik) 等）將流量轉發至 Hub 的 HTTP 連接埠

當 TLS 在代理處終結時：

1. 為 Hub 進程設定 `SECURE_COOKIES=true`。
2. 在管理後台設定中，將 **Base URL** 設為公開的 `https://…/` 來源位址。
3. **只**在 Hub 只透過受信任代理／CDN 存取時啟用 **Trust Proxy**。詳見 [保安警告](./others/security-warning.md)。

## 升級

1. 拉取三個程式庫的最新程式碼／標籤。
2. 重新建置前端到 `FRONTEND_DIR`（第 2 步）。
3. 重新建置 Hub 二進位檔（第 3 步）。
4. 重新啟動進程（`systemctl restart mosona-manager` 或你的進程管理器）。
5. 確認 `/health` 仍然成功。

升級時請保留 `.env`、PostgreSQL／Redis／Influx 資料，以及 `avatars/` 目錄。

## 疑難排解

| 現象 | 排查方向 |
| --- | --- |
| 進程立即退出並提示 Postgres | 檢查 `POSTGRES_*`、資料庫連通性、用戶／密碼／庫是否存在 |
| 退出並提示 InfluxDB／organization | 檢查 `INFLUXDB_URL`、組織名稱、token 權限；Influx 需已完成初始化 |
| 退出並提示 Redis | 檢查 `REDIS_HOST`／`REDIS_PORT`；若啟用認證請使用 `REDIS_PASSWORD` |
| 介面空白或靜態資源 404 | 重新建置前端；確認 `FRONTEND_DIR` 指向建置產物；公開頁需要帶改寫路徑的 `static/public-preview` |
| HTTPS 代理後 Cookie／登入異常 | `SECURE_COOKIES=true`、Base URL 正確，且只在真實代理後啟用 Trust Proxy |
| `mosona-manager health` 失敗 | Hub 尚未監聽、`HOST`／`PORT` 不正確，或啟動崩潰 — 查看日誌 |

## 相關文件

- [快速開始](./quickstart.md) — Docker Compose 部署
- [設定指南](./settings-guide.md) — 安裝後的管理後台設定
- [保安警告](./others/security-warning.md) — 生產環境加固
