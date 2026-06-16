# Quickstart

Get Mosona Manager running with Docker Compose.

## Prerequisites

- Docker and Docker Compose
- A host with ports available for the Hub, Postgres, and InfluxDB

## Deploy with Compose

```bash
cd deploy
cp .env.example .env
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