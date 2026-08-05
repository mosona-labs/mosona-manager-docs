# From a Fresh Install to a Ready Instance

The Quick Start shows how to deploy this project with Docker Compose. If you are less familiar with Docker, you may still wonder what to do next. The step-by-step docs walk you through a complete deploy and first-time setup.

This guide uses a Debian 13 VPS with 2 CPU cores and 2 GB of memory as the demo environment.

## 1. Deploy

### 1.1. Install Docker

A quick install needs Docker Compose. On Linux, the recommended approach is Docker's official install script:

```bash
curl -fsSL https://get.docker.com | bash -s docker
```

### 1.2. Clone the repository

> If git is not installed, install it with your distribution's package manager, for example: `sudo apt install -y git`

```bash
git clone https://github.com/mosona-labs/mosona-manager.git
cd mosona-manager/deploy
cp .env.example .env
```

You should now be in the repository's `deploy` directory. It looks something like this (on Linux, files that start with `.` are hidden from plain `ls`):

```bash
root@arespha:~/mosona-manager/deploy# ls
compose.yml  postgres
```

### 1.3. Edit the configuration

The config file should look like this (unless it has changed later):

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

Edit `.env` with your preferred editor, such as `nano` or `vim`. Install the editor first if it is missing.

```bash
nano .env
```

If you follow this guide to expose the service on the public internet, you usually do not need to change the first three settings. You should, however, uncomment `SECURE_COOKIES=true`, because cloudflared will terminate HTTPS for you.

Replace `[Change_Me_Pgsql_Password]` (and the other placeholder secrets) with strong, randomly generated passwords. Leaving the defaults can work because the database services are not exposed publicly, but changing them is safer.

### 1.4. Deploy with Compose

```bash
docker compose --env-file .env -f compose.yml pull
docker compose --env-file .env -f compose.yml up -d
```

These commands pull every image this project needs, create the containers, and start them. The output looks roughly like this:

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

Verify that the install succeeded:

```bash
curl -fsS http://localhost:8080/health || true
```

On success, you should see:

```json
{"code":"ok","msg":"Service is healthy"}
```

At this point the project is running on `127.0.0.1:8080`, but it is not yet reachable from the public internet. Next, deploy `cloudflared`.

## 2. Cloudflared

Cloudflared is Cloudflare's Tunnel agent. It forwards a local web service to Cloudflare without opening any public ports on your server, and it sits behind Cloudflare's CDN. In short, it turns `127.0.0.1:8080` into a normal website that you can open safely from anywhere with your own domain.

And it is free.

### 2.1. Create a Tunnel

This guide skips buying a domain and attaching it to Cloudflare. Those steps are a bit tedious, and there are countless tutorials online, so we will jump straight to the relevant part.

Note that Cloudflare updates its dashboard often. Screenshots and menu labels here may not match the latest UI exactly, but they should be close enough that the entry points are easy to find.

Tunnels currently live under **Networking → Tunnels**.

<img src="/screenshots/step-by-step/cloudflare-tunnel.avif" style="height: 300px" />

Click **Create Tunnel** at the top.

![](/screenshots/step-by-step/create-tunnel.avif)

After the tunnel is created, choose your server's OS and CPU architecture, then run the provided command to install cloudflared.

![](/screenshots/step-by-step/install-tunnel.avif)

Once installation finishes, **Connection Status** shows whether your server is connected.

### 2.2. Configure the Tunnel

Return to the tunnel list and open the tunnel you just created. It should look something like this:

![](/screenshots/step-by-step/detail-tunnel.avif)

Click **Add route**, then choose **Published application**.

![](/screenshots/step-by-step/published.avif)

Pick your domain and desired hostname, and set the **Service URL** to `127.0.0.1:8080`.

![](/screenshots/step-by-step/add-route.avif)

Wait a few seconds to a few minutes for DNS to propagate, then open the URL you configured to reach your instance (for example, `https://test-demo.mosona.cc` in the screenshot).

## 3. Initialization

### 3.1. Complete the setup form

Fill in all required fields as guided by the page.

<img src="/screenshots/step-by-step/init.avif" style="width: 60%; margin-left: 20%;" />

After you finish, you are redirected to the login page. Sign in with the admin account you just created.

On first login you need to create your first **Team**. Teams are the unit of project management—different teams hold different servers.

![](/screenshots/step-by-step/create-team.avif)

After that you land on the Dashboard. Use the button in the top-right corner to create a server, then explore the rest of the product from the UI.

![](/screenshots/step-by-step/dashboard.avif)

### 3.2. More settings and customization

Click your avatar in the top-right corner and open **Admin Dashboard** for admin configuration. See the [Settings Guide](settings-guide.md) for what each option does.

![](/screenshots/step-by-step/settings.avif)
