# Settings Guide

This project includes an admin configuration page. Click your avatar in the top bar, then open **Admin Dashboard** to configure advanced settings. Each section below matches a page in that panel.

![](/screenshots/settings-guide/1.avif)

-----

## General

### Site Title

Display name for your instance. After you save, it applies everywhere **except the admin panel**.

### Favicon

Icon used for the browser tab and logo. Same scope as Site Title — non-admin surfaces only.

### Base URL

Full origin with scheme and trailing slash, for example `https://panel.example.com/`.

- Restricts Hub access to this host only
- Used when building absolute links (email, invites, password resets, and similar)

**Public Domain** is a separate public-page setting, not the same as Base URL. Prefer a dedicated domain for the panel, and put the public page on another host when possible. See [Security Warning](./others/security-warning.md).

### Session Bind IP

Binds each session to the IP used at login. If that IP changes, the user must sign in again. Keep this on unless your users often switch networks. When Trust Proxy is enabled, the bound IP is taken from proxy headers.

### Trust Proxy

Trust CDN / reverse proxy headers. Enable only when the Hub sits behind Cloudflare, Nginx, Caddy, Traefik, or a similar proxy. Leave it off if clients reach the Hub directly — otherwise clients can spoof forwarded headers. When TLS terminates at the proxy, also set `SECURE_COOKIES=true`.

### Debug Mode

Shows detailed error messages and stack traces. Keep **off** in production.

-----

## Email

Optional outbound email. Currently only **SMTP** is supported.

Configure **Host**, **Port**, **Username**, **Password**, and **TLS**. After saving, send a test email to confirm the setup.

Email is used for notifications, registration (when enabled), and two-factor authentication when email-based 2FA is allowed.

-----

## OAuth2

Add OAuth2 providers for sign-in and account linking.

- Built-in presets: **Google**, **GitHub**, **Discord**, and others
- Custom providers: your own endpoints and client credentials

-----

## Register & Login

Controls how accounts are created and how users sign in.

| Option | Effect |
| --- | --- |
| **Allow registration** | Whether new users can sign up |
| **Email verification on register** | Require a verified email when registering |
| **Email verification on login** | Require email verification during login |
| **Captcha** | Optional bot protection; currently only **Cloudflare Turnstile** |

Email verification options need a working Email (SMTP) configuration.
