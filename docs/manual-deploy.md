# Manual deployment

Docker Compose is the recommended way to run Mosona Manager. Use this guide when you need to run the **Hub binary yourself** — for example on bare metal, under systemd, or with an externally managed Postgres / Redis / InfluxDB stack.

For the Compose path, see [Quickstart](./quickstart.md).

## What you need

| Component | Role | Notes |
| --- | --- | --- |
| **Hub** (`mosona-manager`) | API + web UI server | Go binary built from this repo |
| **Main frontend** | Admin / user UI | Built from [`mosona-manager-web`](https://github.com/mosona-labs/mosona-manager-web) |
| **Public preview frontend** | Public status page assets | Built from [`mosona-manager-pub`](https://github.com/mosona-labs/mosona-manager-pub) |
| **PostgreSQL** | Primary database | Compose uses Postgres **18** |
| **Redis** | Cache / sessions / realtime helpers | Compose uses Redis **7** |
| **InfluxDB 2** | Metrics storage | Compose uses InfluxDB **2.8**; Hub creates its own metric buckets on startup |

Optional but recommended:

- A reverse proxy with TLS (Nginx, Caddy, Traefik, Cloudflare Tunnel, …)
- `SECURE_COOKIES=true` when TLS terminates in front of the Hub

## Prerequisites

- **Go 1.26+** (to build the Hub)
- **Node.js + pnpm** (to build the frontends)
- Running instances of **PostgreSQL**, **Redis**, and **InfluxDB 2** that the Hub can reach
- Network ports open as needed (Hub default listen port is **3214** unless you override `PORT`)

## 1. Clone the repositories

The Hub, main UI, and public page live in three repositories. Clone them as siblings:

```bash
mkdir -p ~/mosona && cd ~/mosona
git clone https://github.com/mosona-labs/mosona-manager.git
git clone https://github.com/mosona-labs/mosona-manager-web.git
git clone https://github.com/mosona-labs/mosona-manager-pub.git
cd mosona-manager
```

## 2. Build the frontends into `static/`

The Hub serves static files from `FRONTEND_DIR` (default `./static/`). You need:

- Main UI files at the root of that directory (`index.html`, assets, …)
- Public preview files under `public-preview/`, with asset paths rewritten for `/preview-assets`

```bash
# Main frontend → ./static
(
  cd ../mosona-manager-web
  pnpm install
  pnpm run build
)
rm -rf static/*
mkdir -p static
cp -a ../mosona-manager-web/dist/. static/

# Public preview → ./static/public-preview
(
  cd ../mosona-manager-pub
  pnpm install
  pnpm run build
)
mkdir -p static/public-preview
cp -a ../mosona-manager-pub/dist/. static/public-preview/

# Rewrite public-preview asset URLs (required)
perl -pi -e 's#/index\.js#/preview-assets/index.js#g' static/public-preview/index.html
perl -pi -e 's#/index\.css#/preview-assets/index.css#g' static/public-preview/index.html
rm -f static/public-preview/favicon.svg
rm -rf static/public-preview/flags static/public-preview/icons
```

> On macOS, the system `sed -i ''` form also works; `perl -pi` is portable across Linux and macOS.

You can point `FRONTEND_DIR` at another absolute path later if you prefer not to keep assets inside the repo checkout.

## 3. Build the Hub binary

From the `mosona-manager` repository root:

```bash
# One-off local build
go build -ldflags="-s -w -X mosona-manager/internal/runtime.Version=dev" \
  -o mosona-manager \
  ./cmd/hub

# Or use the release script (multi-arch outputs under build/)
# ./script/build.sh --version v0.1.0 --hub
```

The binary accepts a `health` subcommand used by probes:

```bash
./mosona-manager health   # prints "ok" when the HTTP /health endpoint is healthy
```

## 4. Prepare dependencies

### PostgreSQL

Create a database and user the Hub can use. Example:

```sql
CREATE USER mm_user WITH PASSWORD 'change-me';
CREATE DATABASE mm_db OWNER mm_user;
```

### Redis

A default install on `127.0.0.1:6379` is enough. If Redis requires a password, set `REDIS_PASSWORD` in the Hub environment (see below).

### InfluxDB 2

1. Install and start InfluxDB 2.
2. Complete the initial setup (UI or `influx setup`) and create an **organization** plus an **admin/API token**.
3. Put the org name and token into the Hub environment as `INFLUXDB_ORG` and `INFLUXDB_TOKEN`.

The Hub does **not** use a single app-level bucket from env. On startup it connects with your token and ensures its own buckets exist (for example `server_status_raw`, `server_status_minute`, `logs`, …).

## 5. Configure environment

The Hub loads a `.env` file from the **process working directory** via `godotenv` (if present), and also reads real environment variables.

Copy the manual example and edit it:

```bash
cp .env.manual.example .env
```

Minimum variables the Hub expects:

```env
# Listen address (defaults: HOST=0.0.0.0, PORT=3214)
HOST=0.0.0.0
PORT=3214

# PostgreSQL (all required)
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=mm_user
POSTGRES_PASS=change-me
POSTGRES_DB=mm_db

# InfluxDB 2 (org + token required; URL defaults to http://localhost:8086)
INFLUXDB_URL=http://127.0.0.1:8086
INFLUXDB_ORG=mm_org
INFLUXDB_TOKEN=your-long-influx-token

# Redis (port required; password optional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Frontend directory (default ./static/)
FRONTEND_DIR=./static/

# Set when TLS terminates at a reverse proxy / CDN in front of the Hub
# SECURE_COOKIES=true
```

Notes:

- Use **`REDIS_PASSWORD`** for the Redis password. The Hub reads this name (not `REDIS_PASS`).
- `INFLUXDB_BUCKET` in older examples is only relevant to Docker Compose’s Influx **init** container. The Hub binary does not require it.
- Runtime site settings (base URL, Trust Proxy, mail, OAuth, …) are configured later in **Admin Dashboard** after the first boot. See [Settings Guide](./settings-guide.md).
- The process creates `./avatars` under its working directory for uploaded avatars/favicons. Keep CWD stable (for example a dedicated data directory) if you run under systemd.
- `GeoLite2-Country.mmdb` is optional; if missing, the Hub may download it in the background for IP geolocation.

## 6. Run the Hub

Start dependencies first, then:

```bash
# From the directory that contains .env, static/, and (later) avatars/
./mosona-manager
```

Verify:

```bash
curl -fsS "http://127.0.0.1:3214/health"
./mosona-manager health
```

Open the UI at `http://127.0.0.1:3214/` (or your chosen `HOST`/`PORT`) and complete first-time setup.

## 7. Optional: systemd unit

Example unit (adjust paths and user):

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

# Hardening (optional)
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

## 8. Expose over HTTPS

Same options as Compose:

- [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- A reverse proxy with TLS termination ([Nginx](https://nginx.org/), [Caddy](https://caddyserver.com/), [Traefik](https://traefik.io/traefik), …) forwarding to the Hub’s HTTP port

When TLS ends at the proxy:

1. Set `SECURE_COOKIES=true` for the Hub process.
2. In Admin → settings, set **Base URL** to your public `https://…/` origin.
3. Enable **Trust Proxy** only if the Hub is solely reachable through a trusted proxy/CDN. See [Security Warning](./others/security-warning.md).

## Upgrade

1. Pull latest git tags/commits for the three repositories.
2. Rebuild frontends into `FRONTEND_DIR` (step 2).
3. Rebuild the Hub binary (step 3).
4. Restart the process (`systemctl restart mosona-manager` or your process manager).
5. Confirm `/health` still returns success.

Keep `.env`, PostgreSQL/Redis/Influx data volumes, and the `avatars/` directory across upgrades.

## Troubleshooting

| Symptom | Things to check |
| --- | --- |
| Process exits immediately mentioning Postgres | `POSTGRES_*` values, DB reachable, user/password/db exist |
| Exits mentioning InfluxDB / organization | `INFLUXDB_URL`, org name, token permissions; Influx must already be set up |
| Exits mentioning Redis | `REDIS_HOST` / `REDIS_PORT`; use `REDIS_PASSWORD` if auth is enabled |
| UI is blank or 404 for assets | Rebuild frontends; confirm `FRONTEND_DIR` points at the built tree; public page needs `static/public-preview` with rewritten asset paths |
| Cookies / login oddities behind HTTPS proxy | `SECURE_COOKIES=true`, correct Base URL, Trust Proxy only behind a real proxy |
| `mosona-manager health` fails | Hub not listening yet, wrong `HOST`/`PORT`, or process crashed on boot — check logs |

## Related

- [Quickstart](./quickstart.md) — Docker Compose deployment
- [Settings Guide](./settings-guide.md) — post-install admin settings
- [Security Warning](./others/security-warning.md) — production hardening
