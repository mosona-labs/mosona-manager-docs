# 版本记录

## v0.1.13 (16/08/2026)

Github: [c850eb7...fc4e444](https://github.com/mosona-labs/mosona-manager/compare/c850eb75fba024359814e815731e5c0eaf02b065...fc4e44489da080103679c70040c61429975a21c3)

#### 修复

1. 区分「尚未拥有活跃团队」(`409 team_required`) 与「团队访问已被撤销」的用户，并在团队就绪前推迟团队范围内的 Web UI 请求，避免新实例在 `/` 与 `/create-team` 之间刷新循环。
1. 停止被动 Agent 在每次 WebSocket 重连尝试前提交完整主机信息报告。启动时与带抖动的周期性报告保持不变。
1. 避免在服务器清单与告警状态未变化时重复写入，防止稳定运行期间产生大量死元组。
1. 限制 Agent 信息与告警更新事务的范围，并将 Agent 连接关闭移出重装数据库事务。

#### 其他

1. 为 Hub 的 PostgreSQL 会话标记 `application_name=mosona-manager-hub`，并将 `POSTGRES_IDLE_IN_TRANSACTION_TIMEOUT` 默认设为 `60s`（`0` 表示禁用）。
1. 新增 [PostgreSQL 膨胀恢复手册](https://github.com/mosona-labs/mosona-manager/blob/v0.1.13/docs/postgres-bloat-recovery.md)，用于诊断滞留事务并安全回收受影响的表。

## v0.1.12 (13/08/2026)

Github: [aacfbf7...c850eb7](https://github.com/mosona-labs/mosona-manager/compare/aacfbf76041d50cd1324d886441104020fcc15ff...c850eb75fba024359814e815731e5c0eaf02b065)

> 本版本会在启动时重新加密已存储的 SSH 凭据（旧版 AES-CBC → 带版本的 AES-GCM）。应用于自动更新或无人值守实例前，请先阅读升级说明。请勿回滚镜像——v0.1.11 之前的构建无法读取新凭据格式，可能导致崩溃。

#### 安全

1. 端到端凭据加密：使用绑定记录上下文的带版本 AES-GCM 封装，并自动迁移旧版 CBC 密文。
1. 强化主密钥处理：失败即关闭（凭据存在时不再静默重新生成），强制文件权限 / 所有权，拒绝符号链接。
1. SSH 主机密钥固定：新增或编辑的服务器会记录并强制校验主机密钥；现有服务器继续连接（`trust_legacy_host_key`），可在编辑时确认以完成固定。
1. 更强的认证与会话：成员被移除时撤销团队会话；拒绝已撤销的团队访问，而不再静默降级为 viewer；拒绝管理员自删 / 自降级 / 移除最后一名管理员，并要求重新认证。
1. 支持带发现的 OIDC，并校验 OAuth 身份主体（拒绝空 / 0 / 纯空白主体）。
1. 全面资源限制：公开预览流的按 IP / 按团队 / 全局 SSE 限制；请求 / 响应大小限制；上传限制；主动 Agent 服务的 HTTP 超时。
1. 作用域数据访问：服务器分类、告警 upsert 与通知投递现限定到所属团队；分类删除为原子操作。
1. 密钥脱敏：管理设置响应中会脱敏 `smtp_password` 与 `captcha_secret`。

#### 新功能

1. 就绪 / 存活健康检查端点：`/health/ready` 探测 Postgres、Redis 与 InfluxDB。
1. 通知目标预校验：`POST /api/team/notification/validate` 在保存前校验目标。
1. 为 OAuth 提供方增加 OIDC 协议选择。
1. 通用 Webhook 通知，含模板白名单与重定向策略。

#### 修复

1. 审计日志写入改为有界队列并在优雅关闭时排空，不再使用无界 fire-and-forget goroutine。
1. 更清晰的服务器连接生命周期：替换重复的监控连接，编辑 / 删除 / 重装时等待旧连接结束，访问撤销时关闭 Agent 连接。
1. 被动 Agent 的 WebSocket 关闭现为永久关闭，不再在服务端主动关闭后静默重连。
1. 数据库事务在所有退出路径上均会回滚。
1. 自动续期追赶：长期过期的自动续期服务器会推进到下一个未来周期，而不再每小时只推进一个周期。
1. 统一 Redis 密码配置（`REDIS_PASSWORD` / `REDIS_PASS`）。
1. 在主机密钥固定上线期间保留旧版 SSH 连通性。
1. 在写入路径与既有数据上强制告警配置边界。
1. 统一邮件发送以及 base-host / trust-proxy 处理。

#### Web

1. 保存前校验通知目标（独立校验端点）。
1. 特权变更与受保护用户删除的密码重新认证对话框。
1. 成员编辑器中禁用团队所有者角色 / 移除控件。
1. 添加或编辑服务器时确认 SSH 主机密钥。
1. 优雅处理已撤销的团队会话（重定向而非损坏状态）。
1. OAuth 身份协议配置（OAuth 2.0 / OIDC）。
1. 仪表盘服务器卡片增加编辑与删除操作，通过带触控友好 kebab 触发器的共享上下文菜单暴露。（[web#5](https://github.com/mosona-labs/mosona-manager-web/pull/5)）
1. 头像来源由 gravatar.webp.se 切换为 www.gravatar.com。（[web#2](https://github.com/mosona-labs/mosona-manager-web/pull/2)）

## v0.1.10 (06/08/2026)

Github: [0c13c4d...aacfbf7](https://github.com/mosona-labs/mosona-manager/compare/0c13c4d80dbb42d2ee4c73d664ef55391e23047e...aacfbf76041d50cd1324d886441104020fcc15ff)

#### 修复

1. 修复 SSH 模式下无法正确获取 ARM 设备 CPU 名称的问题

#### 其他

1. 使用 Runner 自动化版本构建

## v0.1.7 (14/07/2026)

Github: [170aec1...2e0bc8f](https://github.com/mosona-labs/mosona-manager/compare/170aec125239d72c5aef0d83573b6536819f414e...2e0bc8fc2cdf953b20cd344e5aba88344e347459)

#### 新功能

1. 新增完整 i18n 支持：阿拉伯语（含 RTL）、德语、韩语、马来语、法语、日语、葡萄牙语、俄语、英语、西班牙语、简体中文与繁体中文。

#### 修复

1. 修复公开预览静态前端文件在相对路径下的提供问题。

## v0.1.6 (10/07/2026)

Github: [8ee7b10...f4b6b93](https://github.com/mosona-labs/mosona-manager/compare/8ee7b10a1c7e5646f9c5f7a399641870889a6fdf...f4b6b933f52851edfc93d18860b0d9a500fec623)

#### 新功能

1. 团队导入现已支持未加密的团队导出文件（加密导入仍受支持）。

#### 改进与重构

1. 将 Trust Proxy 从仅环境变量的静态配置，改为可在管理后台动态配置的设置项。

#### 修复

1. 登录时校验会话 IP 绑定，并处理空的 IP 地理信息数据。
1. 处理 IP 地理信息中缺失国家数据的情况（含测试）。
1. 在添加或导入服务器时清理过期的 InfluxDB 服务器状态。

## v0.1.5 (07/07/2026)

Github: [bb6de84...53df6a3](https://github.com/mosona-labs/mosona-manager/compare/bb6de845472bf9690a1fbb1071a0f08be48eed70...53df6a3324eace947898e6b90dfc26e853e43080)

#### 修复

1. 修复公开页在独立域名模式下无法加载旗帜与 Logo 的问题。
1. 修复配置 TOTP 时的依赖崩溃。
1. 修复全局告警配置后不生效的问题。
1. 修复 Dashboard SSE 判断条件过于严格的问题。

## v0.1.4 (18/06/2026)

Github: [87faa66...dfa981c](https://github.com/mosona-labs/mosona-manager/compare/87faa66b6dc56047e0c92a4466d8d7ebf2fca980...dfa981c21e88ec7828b14a77af3f10965a108c23)

> 本版本重点加强了安全性、更新机制，以及会话 / 认证处理。

#### 新功能

1. 团队数据保护：团队导出 / 导入数据现可用用户提供的密码加密，以增强安全性。
1. 自更新能力：为 Agent 增加自更新命令与后台更新循环，并提供 Hub 代理更新通道与 GitHub 回退。
1. 版本信息：构建版本现注入二进制文件，并通过版本 API 暴露。
1. 容器自动更新：增加 Watchtower 支持，用于 Docker 容器自动更新。
1. 认证改进：
    - 可选的会话 IP 绑定，以及集中式会话收尾处理。
    - 密码哈希从 SHA256 迁移到更安全的 Argon2id（兼容旧数据并自动重哈希）。

1. 访问控制与隔离：增加站点主机访问控制，以及公开页主机隔离。
1. 安全加固：实现速率限制、代理信任配置、安全 Cookie，以及路径穿越防护。

#### 改进与重构

1. 将同源检查集中到共享的 pkg/httporigin 包。
1. 默认启用 session_bind_ip。
1. 对齐示例环境变量文件。
1. 更新文档，包括快速开始链接、安全策略（含报告与披露指引）以及 Discord 邀请链接。

#### 依赖与维护

1. 提升 Go 版本并更新依赖。
