# 從全新安裝到可用實例

快速開始介紹了如何用 Docker Compose 部署本項目。如果你對 Docker 還不太熟，可能仍不清楚接下來該做什麼。分步文件會帶你走完完整部署與首次初始化。

本指南以一部 2 核 CPU、2 GB 記憶體的 Debian 13 VPS 作為示範環境。

## 1. 部署

### 1.1. 安裝 Docker

快速安裝需要 Docker Compose。在 Linux 上，建議使用 Docker 官方安裝指令碼：

```bash
curl -fsSL https://get.docker.com | bash -s docker
```

### 1.2. 複製程式庫

> 若尚未安裝 git，請用發行版的套件管理器安裝，例如：`sudo apt install -y git`

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

此時你應位於程式庫的 `deploy` 目錄。大致如下（在 Linux 上，以 `.` 開頭的檔案在普通 `ls` 中是隱藏的）：

```bash
root@arespha:~/mosona-manager/deploy# ls
compose.yml  postgres
```

### 1.3. 編輯設定

設定檔應類似下面這樣（除非後續有變更）：

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

用你習慣的編輯器修改 `.env`，例如 `nano` 或 `vim`。若系統沒有，請先安裝。

```bash
nano .env
```

若按本指南將服務暴露到互聯網，前三項通常不用改。但應取消註解 `SECURE_COOKIES=true`，因為 cloudflared 會為你終結 HTTPS。

請將 `[Change_Me_Pgsql_Password]`（以及其他佔位密鑰）替換為足夠強的隨機密碼。保持預設值有時也能運作——資料庫服務本身不會對外暴露——但改掉會更安全。

### 1.4. 使用 Compose 部署

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```

這兩條指令會拉取本項目所需的全部映像，建立並啟動容器。輸出大致如下：

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

驗證安裝是否成功：

```bash
curl -fsS http://localhost:8080/health || true
```

成功時應看到：

```json
{"code":"ok","msg":"Service is healthy"}
```

此時項目已運行在 `127.0.0.1:8080`，但還無法從互聯網存取。接下來部署 `cloudflared`。

## 2. Cloudflared

Cloudflared 是 Cloudflare 的 Tunnel 代理。它把本機 Web 服務轉發到 Cloudflare，無需在伺服器上開放任何公網連接埠，並位於 Cloudflare CDN 之後。簡而言之，它能把 `127.0.0.1:8080` 變成一個可從任何地方用你自己的域名安全開啟的普通網站。

而且它是免費的。

### 2.1. 建立 Tunnel

本指南跳過購買域名並將其接入 Cloudflare 的步驟。那些操作略繁瑣，網上教學也很多，我們直接進入相關部分。

注意 Cloudflare 控制台更新頻繁。此處的截圖與選單文案可能與最新介面不完全一致，但入口位置應大致相同，便於對照查找。

Tunnel 目前位於 **Networking → Tunnels**。

<img src="/screenshots/step-by-step/cloudflare-tunnel.avif" style="height: 300px" />

點擊頂部的 **Create Tunnel**。

![](/screenshots/step-by-step/create-tunnel.avif)

Tunnel 建立完成後，選擇伺服器的作業系統與 CPU 架構，然後執行提供的指令安裝 cloudflared。

![](/screenshots/step-by-step/install-tunnel.avif)

安裝完成後，**Connection Status** 會顯示伺服器是否已連線。

### 2.2. 設定 Tunnel

返回 Tunnel 列表，開啟剛建立的 Tunnel。大致如下：

![](/screenshots/step-by-step/detail-tunnel.avif)

點擊 **Add route**，然後選擇 **Published application**。

![](/screenshots/step-by-step/published.avif)

選擇你的域名與期望的主機名稱，並將 **Service URL** 設為 `127.0.0.1:8080`。

![](/screenshots/step-by-step/add-route.avif)

等待數秒到數分鐘讓 DNS 生效，然後開啟你設定的 URL 存取實例（例如截圖中的 `https://test-demo.mosona.cc`）。

## 3. 初始化

### 3.1. 完成設定表單

按頁面指引填寫所有必填項。

<img src="/screenshots/step-by-step/init.avif" style="width: 60%; margin-left: 20%;" />

完成後會跳轉到登入頁。使用剛剛建立的管理員帳戶登入。

首次登入需要建立你的第一個 **Team（團隊）**。團隊是項目管理的基本單位——不同團隊持有不同伺服器。

![](/screenshots/step-by-step/create-team.avif)

之後會進入 Dashboard。使用右上角按鈕建立伺服器，再從介面探索其餘功能。

![](/screenshots/step-by-step/dashboard.avif)

### 3.2. 更多設定與自訂

點擊右上角頭像，開啟 **Admin Dashboard（管理後台）** 進行管理設定。各選項含義見 [設定指南](settings-guide.md)。

![](/screenshots/step-by-step/settings.avif)
