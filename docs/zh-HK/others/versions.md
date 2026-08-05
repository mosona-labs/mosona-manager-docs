# 版本記錄

## v0.1.10 (06/08/2026)

Github: [0c13c4d...aacfbf7](https://github.com/mosona-labs/mosona-manager/compare/0c13c4d80dbb42d2ee4c73d664ef55391e23047e...aacfbf76041d50cd1324d886441104020fcc15ff)

#### 修正

1. 修正 SSH 模式下無法正確取得 ARM 裝置 CPU 名稱的問題

#### 其他

1. 使用 Runner 自動化版本建置

## v0.1.7 (14/07/2026)

Github: [170aec1...2e0bc8f](https://github.com/mosona-labs/mosona-manager/compare/170aec125239d72c5aef0d83573b6536819f414e...2e0bc8fc2cdf953b20cd344e5aba88344e347459)

#### 新功能

1. 新增完整 i18n 支援：阿拉伯語（含 RTL）、德語、韓語、馬來語、法語、日語、葡萄牙語、俄語、英語、西班牙語、簡體中文與繁體中文。

#### 修正

1. 修正公開預覽靜態前端檔案在相對路徑下的提供問題。

## v0.1.6 (10/07/2026)

Github: [8ee7b10...f4b6b93](https://github.com/mosona-labs/mosona-manager/compare/8ee7b10a1c7e5646f9c5f7a399641870889a6fdf...f4b6b933f52851edfc93d18860b0d9a500fec623)

#### 新功能

1. 團隊匯入現已支援未加密的團隊匯出檔案（加密匯入仍受支援）。

#### 改進與重構

1. 將 Trust Proxy 由只限環境變數的靜態設定，改為可在管理後台動態設定的選項。

#### 修正

1. 登入時校驗工作階段 IP 繫結，並處理空白的 IP 地理位置資料。
1. 處理 IP 地理位置中缺少國家資料的情況（含測試）。
1. 在新增或匯入伺服器時清理過期的 InfluxDB 伺服器狀態。

## v0.1.5 (07/07/2026)

Github: [bb6de84...53df6a3](https://github.com/mosona-labs/mosona-manager/compare/bb6de845472bf9690a1fbb1071a0f08be48eed70...53df6a3324eace947898e6b90dfc26e853e43080)

#### 修正

1. 修正公開頁在獨立域名模式下無法載入旗幟與 Logo 的問題。
1. 修正設定 TOTP 時的依賴崩潰。
1. 修正全域警報設定後不生效的問題。
1. 修正 Dashboard SSE 判斷條件過於嚴格的問題。

## v0.1.4 (18/06/2026)

Github: [87faa66...dfa981c](https://github.com/mosona-labs/mosona-manager/compare/87faa66b6dc56047e0c92a4466d8d7ebf2fca980...dfa981c21e88ec7828b14a77af3f10965a108c23)

> 本版本重點加強了保安、更新機制，以及工作階段／認證處理。

#### 新功能

1. 團隊資料保護：團隊匯出／匯入資料現可用用戶提供的密碼加密，以加強保安。
1. 自我更新能力：為 Agent 增加自我更新指令與背景更新循環，並提供 Hub 代理更新通道與 GitHub 後備。
1. 版本資訊：建置版本現會注入二進位檔，並透過版本 API 對外提供。
1. 容器自動更新：增加 Watchtower 支援，用於 Docker 容器自動更新。
1. 認證改進：
    - 可選的工作階段 IP 繫結，以及集中式工作階段收尾處理。
    - 密碼雜湊由 SHA256 遷移至更安全的 Argon2id（相容舊資料並自動重新雜湊）。

1. 存取控制與隔離：增加網站主機存取控制，以及公開頁主機隔離。
1. 保安加固：實作速率限制、代理信任設定、安全 Cookie，以及路徑穿越防護。

#### 改進與重構

1. 將同源檢查集中至共用的 pkg/httporigin 套件。
1. 預設啟用 session_bind_ip。
1. 對齊範例環境變數檔案。
1. 更新文件，包括快速開始連結、保安政策（含報告與披露指引）以及 Discord 邀請連結。

#### 依賴與維護

1. 提升 Go 版本並更新依賴。
