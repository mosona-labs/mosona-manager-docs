# 常見問題解決方案

## SSH 連線成功後伺服器仍離線或缺少資料

在 SSH 模式下，Mosona 會在目標伺服器的預設 shell（如 bash 或 zsh）中執行 shell 腳本以採集狀態資料。

這些腳本依賴幾乎所有 Linux 發行版都具備的標準指令。不過，部分功能還依賴額外指令，或依賴精簡發行版預設未預裝的指令。你可以使用以下檢查項目進行排查。

- 若缺少 IP 位址或伺服器地區資訊，請檢查是否已安裝 `curl`。

對於其他問題，請下載 [linux_info.sh](https://github.com/mosona-labs/mosona-manager/blob/main/internal/connect/ssh/script/linux_info.sh)（伺服器資訊）和 [linux_status.sh](https://github.com/mosona-labs/mosona-manager/blob/main/internal/connect/ssh/script/linux_status.sh)（即時伺服器狀態），在目標伺服器上手動執行，並根據輸出縮小問題範圍。

若腳本在你的裝置上仍無法正確執行，請提交 [issue](https://github.com/mosona-labs/mosona-manager/issues)，並詳細描述錯誤訊息。
