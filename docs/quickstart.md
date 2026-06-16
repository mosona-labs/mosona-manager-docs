# Quickstart

At present, we only support deployment via Docker Compose.

## Prerequisites

- Docker and Docker Compose
- A host with ports available for the Hub, Postgres, and InfluxDB

## Clone

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

### Configure

Edit the `.env` file to set your desired configuration.

- `APP_HOST` and `APP_PORT` specify the bind address and port for the Hub. If you are using a reverse proxy, set `APP_HOST` to `127.0.0.1` and configure the proxy to forward requests to the Hub.
- `TRUST_PROXY` trusts the IP headers forwarded by the CDN. If you are using Cloudflare or another standard CDN service, set it to `true`.
- `SECURE_COOKIES` ensures cookies are only sent over HTTPS. If your Hub is behind a TLS-terminating reverse proxy, set it to `true`.

```env
# Do not change this if you want to use the latest image.
APP_VERSION=latest

# Application bind address and host port.
# APP_PORT must be only a port number, for example 8080.
# Use APP_HOST for the bind IP; do not set APP_PORT to 127.0.0.1:8080.
APP_PORT=8080
APP_HOST=127.0.0.1

# Security (set when behind TLS-terminating reverse proxy)
# TRUST_PROXY=true
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

## Deploy with Compose

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```

## Verify

```bash
docker compose --env-file .env -f compose.yml ps
curl -fsS http://localhost:8080/health || true
```

Adjust the port if your Hub listens elsewhere.

## Upgrade

To upgrade, simply pull the latest image and restart the containers:

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```