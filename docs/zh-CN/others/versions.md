# 版本记录

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
