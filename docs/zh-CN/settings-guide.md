# 设置指南

本项目提供管理后台配置页。点击顶栏头像，然后打开 **Admin Dashboard（管理后台）** 即可配置高级设置。下文各节与该面板中的页面一一对应。

![](/screenshots/settings-guide/1.avif)

-----

## 常规

### 站点标题

实例的显示名称。保存后，会应用到**除管理后台以外**的所有界面。

### 网站图标（Favicon）

用于浏览器标签页与 Logo 的图标。作用范围与站点标题相同——仅非管理后台界面。

### 基础 URL（Base URL）

带协议与末尾斜杠的完整源地址，例如 `https://panel.example.com/`。

- 将 Hub 访问限制为仅该主机
- 用于生成绝对链接（邮件、邀请、密码重置等）

**Public Domain（公开域名）** 是公开页的独立设置，与 Base URL 不同。建议为面板使用专用域名，并在可能时将公开页放在另一主机上。详见 [安全警告](./others/security-warning.md)。

### 会话绑定 IP

将会话绑定到登录时使用的 IP。若该 IP 发生变化，用户需要重新登录。除非用户经常切换网络，否则建议保持开启。启用 Trust Proxy 时，绑定 IP 取自代理头。

### 信任代理（Trust Proxy）

信任 CDN / 反向代理转发的请求头。仅当 Hub 位于 Cloudflare、Nginx、Caddy、Traefik 或类似代理之后时再启用。若客户端直接访问 Hub，请保持关闭——否则客户端可能伪造转发头。当 TLS 在代理处终结时，请同时设置 `SECURE_COOKIES=true`。

### 调试模式

显示详细错误信息与堆栈跟踪。生产环境请保持**关闭**。

-----

## 邮件

可选的出站邮件。目前仅支持 **SMTP**。

配置 **Host**、**Port**、**Username**、**Password** 与 **TLS**。保存后发送一封测试邮件以确认配置正确。

邮件用于通知、注册（若已启用），以及在允许基于邮件的双因素认证时用于 2FA。

-----

## OAuth2

添加用于登录与账号绑定的 OAuth2 提供方。

- 内置预设：**Google**、**GitHub**、**Discord** 等
- 自定义提供方：自行配置端点与客户端凭据

-----

## 注册与登录

控制账号如何创建，以及用户如何登录。

| 选项 | 作用 |
| --- | --- |
| **Allow registration（允许注册）** | 是否允许新用户注册 |
| **Email verification on register（注册时邮箱验证）** | 注册时要求验证邮箱 |
| **Email verification on login（登录时邮箱验证）** | 登录过程中要求邮箱验证 |
| **Captcha（验证码）** | 可选的机器人防护；目前仅支持 **Cloudflare Turnstile** |

邮箱验证相关选项需要先正确配置邮件（SMTP）。
