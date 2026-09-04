# Versions

## v0.1.16 (04/09/2026)

Github: [3ef7752...5b9fcc1](https://github.com/mosona-labs/mosona-manager/compare/3ef7752d57e1a30d33343784ebaa2d74deff18d2...5b9fcc1f7f5df04be20a26205d36aef5e84138a1)

#### Fix

1. Fix server alert notifications never firing: the batched InfluxDB alert queries wrapped a single duration group in `union(tables: [branch0])`, which Flux rejects ("union must have at least two streams as input"), so every alert evaluation cycle skipped all rules whenever a team's rules for an item shared one lookback duration (the default setup). Single-group queries now emit the branch pipeline directly.
1. Keep the valid disk rows when `df` partially fails during SSH status collection (for example a stale FUSE mount makes `df` list every filesystem and then exit non-zero): the disk sample now uses the rows that parsed instead of discarding the whole snapshot, and only falls back to the last cached sample when `df` times out or produces no valid rows at all.

#### Web

1. Some small design changes.

## v0.1.15 (30/08/2026)

Github: [3983bdf...3ef7752](https://github.com/mosona-labs/mosona-manager/compare/3983bdf8eea34558239752c4d6c81b472a4671f6...3ef7752d57e1a30d33343784ebaa2d74deff18d2)

> This release authenticates the Active Agent terminal handshake (protocol v2: the reply is signed with the agent's Ed25519 identity key and pinned by the Hub, so a man-in-the-middle can no longer impersonate an agent terminal) and hardens Passive terminal sessions (bound to their server, claimed atomically, session IDs moved out of URLs). There is no downgrade path — read the upgrade notes before applying to auto-updating or unattended instances, and upgrade Active and Passive Agents before v0.1.17 (the legacy handshake is removed then).

#### Security

1. Encrypt Active Agent long-term private keys at rest with the versioned AES-GCM envelope bound to the Server record; runtime connections and exports reject plaintext or ciphertext copied from another Server.
1. Enforce uniqueness for non-empty Agent UIDs so an authenticated Passive Agent identity resolves to exactly one Server; upgrades fail closed on duplicates, and team imports preflight conflicts with a Server-specific 409 instead of an opaque database error.
1. Identify the affected Server or shared SSH Key when a team export hits an unreadable credential: exports skip unreadable Servers and Servers that depend on a skipped Key by default and record them in the response and encrypted bundle; `skip_unreadable_servers: false` requests a strict, all-or-nothing export.
1. Bind Passive terminal sessions to their target server, consume them atomically on first claim, generate identifiers as random UUID v4, and require terminal-enabled installed Agents, preventing cross-team or repeated claims; keep session identifiers out of URLs on the new endpoint, reducing reverse-proxy and WAF log exposure.
1. Sign and verify the Active Agent handshake reply over the full transcript, pin the identity key with an atomic compare-and-set, bind session keys to the transcript, confirm with mutually verified finished messages, apply a 15-second deadline, fail closed on any verification error, and refuse downgrade to the legacy handshake once pinned to v2.
1. Validate agent `public_key` values (PEM format and Ed25519 key length) during team import, normalizing and re-encoding them before storage.

#### New Features

1. Optional per-server `public_visible` flag (default visible) that hides a server from the public status page only — team dashboards, monitoring, and terminals are untouched. Set it on add/edit; team export/import bundles carry it, and older bundles without the field import as visible.
1. `protocol_version` field in team export/import bundles, backward compatible with older archives: unpinned Active Agents keep an explicit legacy version during the upgrade window, pinned identities import as v2.
1. Add `docs/testing.md` describing the environment variables needed to run the test suite.

#### Fix

1. Use random UUID v4 identities and fail closed if generation fails during Passive Agent enrollment or Active Server creation, instead of risking a predictable or all-zero Agent identity.
1. Stop the Agent process from exiting via `log.Fatalln` when a status snapshot or encode fails on an authenticated connection; close the connection instead, and reconnect the monitor when a frame fails decryption instead of silently desynchronizing the stream.
1. Remove finished connection workers from the pool so stopped or mismatched servers leave no stale entries, stop retry loops when the agent row is missing instead of logging an error every minute (SSH servers included), and reuse the existing agent identity when rerunning the installer.

## v0.1.14 (22/08/2026)

Github: [fc4e444...3983bdf](https://github.com/mosona-labs/mosona-manager/compare/fc4e44489da080103679c70040c61429975a21c3...3983bdf8eea34558239752c4d6c81b472a4671f6)

> This release reduces Hub load from live monitoring and alerting on larger fleets, and switches the logs API to cursor-based time-range queries. `GET /api/v1/logs` and `GET /api/admin/logs` no longer support offset pagination (`page` > 1 returns 400; responses return `next_cursor` / `has_more` instead of `total`), and log queries default to the last 30 days (message search is limited to a 30-day window; maximum span 365 days).

#### New Features

1. Optional RFC3339 `start`/`end` filters on team and admin log list endpoints, with cursor-based paging (`cursor`, `next_cursor`, `has_more`).

#### Performance

1. Share one monitor snapshot per team across SSE subscribers (refresh every 3s, 8s query timeout, 64 concurrent Influx loads) instead of querying InfluxDB once per open dashboard.
1. Queue and batch server-status writes to InfluxDB (10k-point queue, 500-point batches, 1s flush), retry a failed batch once, drop the oldest points on overflow, and drain the queue on shutdown alongside audit logs.
1. Batch alert observation queries (64 servers at a time, grouped by metric and `for_duration`) and pre-aggregate windows instead of one Influx query per server/rule.
1. Parallelize admin-dashboard Influx queries (record counts and system usage) with a 15s context timeout.

#### Fix

1. Reject parent path segments (`..`) in `SafeJoinUnderRoot`, including backslash-separated paths, so static-file joins cannot walk via traversal segments that previously cleaned back under the root.
1. Validate admin list pagination (`page`/`size`) against shared bounds (default 1/20, max 100000/1000) and return 400 on invalid values instead of coercing them.
1. Escape `LIKE` wildcards in admin user/team search, match numeric IDs exactly, and list teams without requiring a member join so empty teams appear in the admin list.

#### Web

1. Virtualize dashboard server cards and throttle SSE snapshot commits so large fleets stay interactive while status updates stream.
1. Replace log page numbers with previous/next cursor paging and a time-range selector (24h / 7d / 30d / 90d / 365d); message search clamps the range to 30 days.
1. Render agent-mode servers on the terminal page when SSH/OS fields are absent instead of throwing on null address/username.
1. Correct monitor chart downsampling so longer ranges (7d / 30d / 180d / 365d) keep a sensible number of points instead of collapsing or over-aggregating.

## v0.1.13 (16/08/2026)

Github: [c850eb7...fc4e444](https://github.com/mosona-labs/mosona-manager/compare/c850eb75fba024359814e815731e5c0eaf02b065...fc4e44489da080103679c70040c61429975a21c3)

#### Fix

1. Distinguish users without an active team (`409 team_required`) from revoked team access, and defer team-scoped web UI requests until a team is active, preventing new instances from refresh-looping between `/` and `/create-team`.
1. Stop passive-agent WebSocket reconnect attempts from submitting a full host information report before every retry. Startup and jittered periodic reports remain unchanged.
1. Avoid rewriting unchanged server inventory and alert state rows, preventing dead-tuple growth during stable operation.
1. Bound agent-information and alert update transactions, and keep agent connection shutdown outside the reinstall database transaction.

#### Other

1. Label Hub PostgreSQL sessions with `application_name=mosona-manager-hub` and default `POSTGRES_IDLE_IN_TRANSACTION_TIMEOUT` to `60s` (`0` disables it).
1. Add a [PostgreSQL bloat recovery runbook](https://github.com/mosona-labs/mosona-manager/blob/v0.1.13/docs/postgres-bloat-recovery.md) for diagnosing stale transactions and reclaiming affected tables safely.

## v0.1.12 (13/08/2026)

Github: [aacfbf7...c850eb7](https://github.com/mosona-labs/mosona-manager/compare/aacfbf76041d50cd1324d886441104020fcc15ff...c850eb75fba024359814e815731e5c0eaf02b065)

> This release re-encrypts stored SSH credentials at startup (legacy AES-CBC → versioned AES-GCM). Read the upgrade notes before applying to auto-updating or unattended instances. Do not roll back the image afterwards — builds prior to v0.1.11 cannot read the new credential format and may crash.

#### Security

1. End-to-end credential encryption — versioned AES-GCM envelopes bound to record context, with automatic migration of legacy CBC ciphertexts.
1. Hardened master key handling — fail-closed (no silent regeneration when credentials exist), enforced file permissions/ownership, symlinks rejected.
1. SSH host key pinning — new/edited servers record and enforce host keys; existing servers keep connecting (`trust_legacy_host_key`) and can be pinned by confirming on edit.
1. Stronger auth & sessions — team sessions revoked on member removal; revoked team access is rejected instead of silently downgrading to viewer; admin self-deletion / self-demotion / last-admin removal rejected with re-authentication required.
1. OIDC support with discovery, plus validation of OAuth identity subjects (rejects empty/0/whitespace subjects).
1. Resource bounds everywhere — per-IP / per-team / global SSE limits for public preview streams; request/response size limits; upload limits; HTTP timeouts on the active-agent server.
1. Scoped data access — server categories, alert upserts, and notification delivery are now scoped to the owning team; category deletion is atomic.
1. Secret redaction — `smtp_password` and `captcha_secret` are redacted in admin settings responses.

#### New Features

1. Readiness / liveness health endpoints — `/health/ready` probes Postgres, Redis, and InfluxDB.
1. Notification target pre-validation — `POST /api/team/notification/validate` validates targets before saving.
1. OIDC protocol selection for OAuth providers.
1. Generic webhook notifications with template allowlist and redirect policy.

#### Fix

1. Audit log writes are now queued & drained (bounded queue, graceful shutdown drain) instead of unbounded fire-and-forget goroutines.
1. Cleaner server connection lifecycle — duplicate monitoring connections replaced, old connections awaited on edit/delete/reinstall, agent connections closed on access revocation.
1. Passive-agent WebSocket shutdown is now permanent instead of silently reconnecting after server-initiated close.
1. Database transactions now roll back on every exit path.
1. Auto-renewals catch up — long-expired auto-renew servers advance to the next future period instead of one period per hour.
1. Unified Redis password config (`REDIS_PASSWORD` / `REDIS_PASS`).
1. Preserved legacy SSH connectivity during host-key pinning rollout.
1. Alert configuration bounds enforced on both write paths and existing data.
1. Consistent email sending and base-host / trust-proxy handling.

#### Web

1. Validate notification targets before saving (dedicated validation endpoint).
1. Password re-authentication dialogs for privileged changes and protected user deletion.
1. Team owner role / removal controls disabled in the member editor.
1. SSH host key confirmation when adding or editing servers.
1. Graceful handling of revoked team sessions (redirect instead of broken state).
1. OAuth identity protocol configuration (OAuth 2.0 / OIDC).
1. Edit & delete actions on dashboard server cards, exposed via a shared context menu with a touch-friendly kebab trigger. ([web#5](https://github.com/mosona-labs/mosona-manager-web/pull/5))
1. Avatar source switched from gravatar.webp.se → www.gravatar.com. ([web#2](https://github.com/mosona-labs/mosona-manager-web/pull/2))

## v0.1.10 (06/08/2026)

Github: [0c13c4d...aacfbf7](https://github.com/mosona-labs/mosona-manager/compare/0c13c4d80dbb42d2ee4c73d664ef55391e23047e...aacfbf76041d50cd1324d886441104020fcc15ff)

#### Fix

1. Fix SSH mode fails to correctly retrieve the CPU name of ARM devices

#### Other

1. Automate version builds using Runner

## v0.1.7 (14/07/2026)

Github: [170aec1...2e0bc8f](https://github.com/mosona-labs/mosona-manager/compare/170aec125239d72c5aef0d83573b6536819f414e...2e0bc8fc2cdf953b20cd344e5aba88344e347459)

#### New Features

1. Added full i18n support: Arabic (with RTL), German, Korean, Malay, French, Japanese, Portuguese, Russian, English, Spanish, Chinese Simplified & Traditional.

#### Fix

1. Fixed public-preview static frontend files serving with relative paths.

## v0.1.6 (10/07/2026)

Github: [8ee7b10...f4b6b93](https://github.com/mosona-labs/mosona-manager/compare/8ee7b10a1c7e5646f9c5f7a399641870889a6fdf...f4b6b933f52851edfc93d18860b0d9a500fec623)

#### New Features

1. Team import now supports unencrypted team export files (encrypted imports remain supported).

#### Improvements & Refactors

1. Moved Trust Proxy from static env-only configuration to a dynamic, admin-configurable setting.

#### Fix

1. Validated session IP binding on login and handled empty IP geolocation data.
1. Handled missing country data in IP geolocation (with tests).
1. Cleared stale InfluxDB server status when adding or importing servers.

## v0.1.5 (07/07/2026)

Github: [bb6de84...53df6a3](https://github.com/mosona-labs/mosona-manager/compare/bb6de845472bf9690a1fbb1071a0f08be48eed70...53df6a3324eace947898e6b90dfc26e853e43080)

#### Fix

1. Fixed the issue where flags and logos could not be loaded when the public page is running in standalone domain mode.
1. Fixed the dependency crash when setting up TOTP.
1. Fixed the issue where global alerts do not take effect after configuration.
1. Fixed the overly strict judgment condition for Dashboard SSE.

## v0.1.4 (18/06/2026)

Github: [87faa66...dfa981c](https://github.com/mosona-labs/mosona-manager/compare/87faa66b6dc56047e0c92a4466d8d7ebf2fca980...dfa981c21e88ec7828b14a77af3f10965a108c23)

> This release focuses heavily on security enhancements, better update mechanisms, and improved session/auth handling.

#### New Features

1. Team Data Protection: Team export/import data is now encrypted with a user-provided password for enhanced security.
1. Self-Update Capability: Added a self-update command and background update loop for the agent, with a hub proxy update channel and GitHub fallback.
1. Version Information: Build version is now injected into binaries and exposed via a version API.
1. Automatic Container Updates: Added Watchtower support for automatic Docker container updates.
1. Authentication Improvements:
    - Optional session IP binding with centralized session finalization.
    - Migrated password hashing from SHA256 to the much more secure Argon2id (with backward compatibility and automatic rehashing).

1. Access Control & Isolation: Added site host access control and public page host isolation.
1. Security Hardening: Implemented rate limiting, proxy trust configuration, secure cookies, and path traversal protection.

#### Improvements & Refactors

1. Centralized same-origin checks into a shared pkg/httporigin package.
1. Default session_bind_ip is now enabled.
1. Aligned example environment files.
1. Updated documentation, including quickstart links, security policy (with reporting and disclosure guidelines), and Discord invite link.

#### Dependencies & Maintenance

1. Bumped Go version and updated dependencies.

