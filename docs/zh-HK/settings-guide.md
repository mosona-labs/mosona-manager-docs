# 設定指南

本項目提供管理後台設定頁。按一下頂列頭像，然後開啟 **Admin Dashboard（管理後台）** 即可設定進階選項。下文各節與該面板中的頁面一一對應。

![](/screenshots/settings-guide/1.avif)

-----

## 一般

### 網站標題

實例的顯示名稱。儲存後，會套用到**除管理後台以外**的所有介面。

### 網站圖示（Favicon）

用於瀏覽器分頁與 Logo 的圖示。作用範圍與網站標題相同——只限非管理後台介面。

### 基礎 URL（Base URL）

帶通訊協定與結尾斜線的完整來源位址，例如 `https://panel.example.com/`。

- 將 Hub 存取限制為只限該主機
- 用於產生絕對連結（電郵、邀請、密碼重設等）

**Public Domain（公開域名）** 是公開頁的獨立設定，與 Base URL 不同。建議為面板使用專用域名，並在可行時將公開頁放在另一主機上。詳見 [保安警告](./others/security-warning.md)。

### 工作階段繫結 IP

將工作階段繫結至登入時使用的 IP。若該 IP 有變，用戶需要重新登入。除非用戶經常切換網絡，否則建議保持開啟。啟用 Trust Proxy 時，繫結 IP 會取自代理標頭。

### 信任代理（Trust Proxy）

信任 CDN／反向代理轉發的請求標頭。只應在 Hub 位於 Cloudflare、Nginx、Caddy、Traefik 或類似代理之後時啟用。若用戶端直接連線至 Hub，請保持關閉——否則用戶端可能偽冒轉發標頭。當 TLS 在代理處終結時，請同時設定 `SECURE_COOKIES=true`。

### 除錯模式

顯示詳細錯誤訊息與堆疊追蹤。生產環境請保持**關閉**。

-----

## 電郵

可選的外寄電郵。目前只支援 **SMTP**。

設定 **Host**、**Port**、**Username**、**Password** 與 **TLS**。儲存後請發送一封測試電郵，以確認設定正確。

電郵用於通知、註冊（若已啟用），以及在允許以電郵為基礎的雙重認證時用於 2FA。

-----

## OAuth2

新增用於登入與帳戶連結的 OAuth2 供應商。

- 內置預設：**Google**、**GitHub**、**Discord** 等
- 自訂供應商：自行設定端點與用戶端憑證

-----

## 註冊與登入

控制帳戶如何建立，以及用戶如何登入。

| 選項 | 作用 |
| --- | --- |
| **Allow registration（允許註冊）** | 是否允許新用戶註冊 |
| **Email verification on register（註冊時電郵驗證）** | 註冊時要求驗證電郵 |
| **Email verification on login（登入時電郵驗證）** | 登入過程中要求電郵驗證 |
| **Captcha（驗證碼）** | 可選的機械人防護；目前只支援 **Cloudflare Turnstile** |

電郵驗證相關選項需要先正確設定電郵（SMTP）。
