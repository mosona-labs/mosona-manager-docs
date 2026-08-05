# Solutions to Common Problems

## Server stays offline or is missing data after a successful SSH connection

In SSH mode, Mosona runs shell scripts in the target server's default shell (such as bash or zsh) to collect status data.

These scripts are written to rely on standard commands available on nearly all Linux distributions. Some features, however, depend on additional commands—or on commands that minimal distributions do not ship by default. You can use the checks below to troubleshoot.

- If IP address or server region is missing, check whether `curl` is installed.

For other issues, download [linux_info.sh](https://github.com/mosona-labs/mosona-manager/blob/main/internal/connect/ssh/script/linux_info.sh) (server info) and [linux_status.sh](https://github.com/mosona-labs/mosona-manager/blob/main/internal/connect/ssh/script/linux_status.sh) (live server status), run them manually on the target server, and inspect the output to narrow down the problem.

If the scripts still cannot run correctly on your device, please open an [issue](https://github.com/mosona-labs/mosona-manager/issues) with a detailed description of the error.
