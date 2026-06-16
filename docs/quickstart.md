# Quickstart

At present, we only support deployment via Docker Compose.

## Prerequisites

- Docker and Docker Compose
- A host with ports available for the Hub, Postgres, and InfluxDB

## Clone and Configure

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

## Deploy with Compose

```bash
docker compose up -d
```

After the stack is healthy, open the Hub URL from your `.env` configuration and complete the initial setup in the web UI.

## Verify

```bash
docker compose ps
curl -fsS http://localhost:8080/health || true
```

Adjust the port if your Hub listens elsewhere.

## Next steps

- Add a project and invite members
- Register servers using [connection modes](./connection-modes.md)
- Configure notifications for alerts