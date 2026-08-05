# 常见问题解决方案

## SSH 连接成功后服务器仍离线或缺少数据

在 SSH 模式下，Mosona 会在目标服务器的默认 shell（如 bash 或 zsh）中运行 shell 脚本以采集状态数据。

这些脚本依赖几乎所有 Linux 发行版都具备的标准命令。不过，部分功能还依赖额外命令，或依赖精简发行版默认未预装的命令。你可以使用以下检查项进行排查。

- 若缺少 IP 地址或服务器地区信息，请检查是否已安装 `curl`。

对于其他问题，请下载 [linux_info.sh](https://github.com/mosona-labs/mosona-manager/blob/main/internal/connect/ssh/script/linux_info.sh)（服务器信息）和 [linux_status.sh](https://github.com/mosona-labs/mosona-manager/blob/main/internal/connect/ssh/script/linux_status.sh)（实时服务器状态），在目标服务器上手动运行，并根据输出缩小问题范围。

若脚本在你的设备上仍无法正确运行，请提交 [issue](https://github.com/mosona-labs/mosona-manager/issues)，并详细描述错误信息。
