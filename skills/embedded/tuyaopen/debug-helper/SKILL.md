---
name: tuyaopen/debug-helper
description: >-
  Agent-friendly non-blocking serial log capture for TuyaOpen devices.
  Runs tos.py monitor in the background, writes logs to file, and lets
  the agent tail or stop it at any time. Use when the agent needs to
  capture device logs without blocking, run a debug session, or monitor
  UART output during a build-flash-analyze loop.
  后台串口日志、非阻塞监控、设备日志捕获、agent日志分析。
license: Apache-2.0
compatibility:
  - TuyaOpen environment activated (export.sh / export.bat / export.ps1)
  - Device connected via USB serial
  - tos.py monitor supports -l/--log flag (TuyaOpen SDK current master)
---

# TuyaOpen Debug Helper

Provides non-blocking serial log capture for agents using `tos.py monitor -l`.
The monitor runs as a background subprocess; the agent reads log output from a
file and stops the process when done.

## Script location

```
.agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py
```

No extra dependencies — uses Python stdlib only.

## Quick usage

```bash
# Start background monitor (logs to <project_dir>/.target_logging/YYYYMMDD_HHMMSS.log)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py start -p /dev/ttyACM1

# Read last 200 lines (JSON output for agent parsing)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py --json tail -n 200

# Stop monitor (releases serial port)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py stop
```

## Commands

| Command | Purpose |
|---------|---------|
| `start -p <port> [-l <logfile>]` | Launch `tos.py monitor -l` in background; auto-names log file if `-l` omitted |
| `tail [-n N]` | Read last N lines from log file (default 200) |
| `stop` | Terminate the monitor process; release serial port |
| `status` | Check whether monitor is running |

Add `--json` before the command for machine-readable output.

## Log file location

All logs and session state are written to **`<project_dir>/.target_logging/`**, where `<project_dir>` is the directory containing `app_default.config` (the TuyaOpen project root). The script finds this automatically by searching upward from the current working directory.

This location keeps logs with the project they belong to. The TuyaOpen SDK `.gitignore` contains `.target_logging` as an unanchored rule — it matches at any depth in the repository, so logs are always gitignored regardless of where the project lives under the SDK.

```
<project_dir>/                    e.g. apps/tuya_cloud/switch_demo/
└── .target_logging/              gitignored by SDK .gitignore
    ├── session.json              active monitor session (PID + log path)
    └── YYYYMMDD_HHMMSS.log       auto-named log file per session
```

## Session file

Session state (PID + log file path) is stored in `<project_dir>/.target_logging/session.json`.
Only one monitor session runs at a time — starting a new one automatically stops the previous.

## Port selection: single-serial vs dual-UART boards

List ports with the USB metadata that identifies them, and **group on
`usbSerial`** — one physical board is one `usbSerial`:

```bash
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli list-ports --json
```

| Ports sharing a `usbSerial` | Board | Monitor port |
|---|---|---|
| 1 | **single-serial** | that port — it also carries flash and auth |
| 2+ | **dual-serial** (e.g. T5/T5AI, WCH `0x1a86:0x55d2`) | the **highest** `usbInterface`; the lowest is flash/auth |

Rank by `usbInterface`, **not** by `COM`/`ttyACM` number — they disagree on
Windows, where a board can enumerate `COM33` = interface 2 (log) next to `COM34`
= interface 0 (flash). Typical, not guaranteed: if log output is absent or
garbled after `start`, try the other port of the same `usbSerial`.

> **Single-serial boards: the monitor owns the port exclusively.** Flash, auth
> and log all share one OS resource, so a running monitor makes `tos.py flash` /
> `tyutool_cli authorize` fail with `PermissionError 13` / `Access is denied` /
> `Device or resource busy`. `stop` the session before those commands and `start`
> it again afterwards — on these boards the build-flash-monitor loop is strictly
> sequential. Dual-serial boards can hold the log port open throughout.

Bare `ls /dev/ttyACM*` or `[System.IO.Ports.SerialPort]::GetPortNames()` still
shows *that* ports exist, but carries no `usbSerial` / `usbInterface`, so it
cannot tell you which port to open or whether two entries are one board.

## Typical agent workflow

```bash
# 1. Start background monitor
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py \
    --json start -p /dev/ttyACM1

# 2. Flash firmware (monitor keeps logging while flash runs on other port)
tos.py flash -p /dev/ttyACM0

# 3. Wait for boot, then read log
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py \
    --json tail -n 200

# 4. Analyze: look for [ty E], OPRT_ errors, "feed watchdog", "mqtt connected"

# 5. Stop when done
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-debug-helper/scripts/monitor_helper.py stop
```

## Log analysis patterns

| Pattern | Meaning | Action |
|---------|---------|--------|
| `[... ty E]` | Error-level log | Analyze message and source location |
| `[... ty W]` | Warning | Usually non-fatal; investigate if repeated |
| `feed watchdog` | Heartbeat (~10s) | **Normal** — device is alive |
| `OPRT_` + negative number | SDK operation failed | Look up in `references/ERROR_CODES.md` in `tuyaopen/dev-loop` |
| `mqtt connected` | Cloud connected | **Success** |
| No output after start | Wrong port or wrong baud | Swap ports; check baud rate |

## Related skills

- `tuyaopen/dev-loop` — full build→flash→monitor→analyze loop (calls this skill)
- `tuyaopen/device-auth` — serial port needed before writing auth credentials
