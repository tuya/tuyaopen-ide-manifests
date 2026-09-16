# Device serial CLI (`tal_cli`) reference

> Absorbed from the former standalone `tuyaopen-cli-debug` skill (merged
> 2026-08-14, see `../SKILL.md` § *Send commands to the device CLI*). Full
> detail for `scripts/cli_debug.py`, installed at
> `.agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py`.

Sends commands to the TuyaOpen device CLI over UART and returns the response.
Useful for inspecting device state (heap, KV, filesystem, threads) without
holding a foreground terminal open.

## Prerequisites

1. **pyserial installed:**

   ```bash
   pip install pyserial
   ```

2. **Firmware built with CLI enabled** — verify your `app_default.config` has:

   ```
   CONFIG_ENABLE_SERIAL_CLI_CMD=y
   CONFIG_CLI_CMD_SYS=y       # sys_* commands
   CONFIG_CLI_CMD_FS=y        # fs_* filesystem commands
   CONFIG_CLI_CMD_KV=y        # kv_* key-value store commands
   ```

   After changing config: `tos.py clean -f && tos.py build && tos.py flash`

3. **Serial port access (Linux):**

   ```bash
   sudo usermod -aG dialout $USER   # then re-login or: newgrp dialout
   ```

## Quick start

```bash
# Discover available CLI commands (auto-detects port; baud is always 115200)
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py help

# Send a single command
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py send "sys_version"

# Force a specific port (useful if auto-pick chooses the wrong ACM port)
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py -p /dev/ttyACM0 send "kv_list"

# List candidate serial ports (no connection)
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py list-ports

# JSON output for agent callers
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json help
```

## Sub-commands

| Sub-command | Description |
|-------------|-------------|
| `help` | Send `help` to the device and list all available CLI commands |
| `send <cmd>` | Send a single CLI command and return the response |
| `list-ports` | List candidate serial ports (VID/PID scored, no connection) |
| `raw <text>` | Send raw bytes without newline handling |

## Options reference

| Option | Default | Description |
|--------|---------|-------------|
| `-p, --port <dev>` | auto | Serial port (e.g. `/dev/ttyACM0`) |
| `-b, --baud <rate>` | **115200** | Baud rate. tal_cli hardcodes 115200 on every platform — do not override unless you have patched the SDK. |
| `--timeout <sec>` | 3.0 | Seconds to wait for CLI response |
| `--json` | off | Output results as JSON (stable keys: `ok`, `output`, `error`, `hint`) |
| `-v, --verbose` | off | Print port discovery and timing details to stderr |

## Baud rate

**Always 115200.** Hardcoded in `TuyaOpen/src/tal_cli/src/tal_cli.c:811`:

```c
cfg.base_cfg.baudrate = 115200;
```

This is platform-independent — T5AI, ESP32, T2, T3, LN882H all use 115200 for the
`tal_cli` UART. Don't confuse this with the platform-specific log/monitor baud
rate used by `tos.py monitor` (which can be 460800/921600 etc.); those use the
chip vendor's own UART driver, not `tal_cli`.

## T5AI dual-serial port selection

T5AI dev boards expose **two** USB-serial ports (WCH CH34x dual-serial):

- **Lower-numbered port** (e.g. `/dev/ttyACM0`) — typically flash port
- **Higher-numbered port** (e.g. `/dev/ttyACM1`) — typically log/monitor/CLI port

The script auto-picks the higher-numbered T5 port for CLI. Override with `-p` if
output is garbled or empty (some custom boards may swap the ports).

## Common CLI commands

Two tiers, and the distinction matters: **eight commands are compiled in
unconditionally**, and everything else needs a Kconfig option. An agent that
assumes "no `CONFIG_ENABLE_SERIAL_CLI_CMD` → no CLI" will skip a console that is
sitting right there — including the one command worth having on day one,
`sys_reboot`.

### Available once `tal_cli_init()` is called (no Kconfig needed)

**Two independent gates.** `tal_cli_init()` in the application's main decides
whether there is a `tuya> ` prompt at all; `CONFIG_ENABLE_SERIAL_CLI_CMD`
decides how many commands it has. A firmware that never calls
`tal_cli_init()` has no console regardless of Kconfig — see SKILL.md § 0.1.

With that call in place, these eight are compiled in unconditionally:

| Command | Description | Registered in |
|---------|-------------|---------------|
| `help` | List all available commands | `src/tal_cli/src/tal_cli.c` |
| `cmd` | Alias of `help` | `src/tal_cli/src/tal_cli.c` |
| `hello` | Print hello world (liveness probe) | `src/tal_cli/src/tal_cli.c` |
| `version` | Print version information | `src/tal_cli/src/tal_cli.c` |
| `sys_log_enable on\|off` | Enable/disable log output | `src/tal_cli/src/cli_cmd.c` |
| `sys_reboot` | Reboot the device | `src/tal_cli/src/cli_cmd.c` |
| `auth <uuid> <authkey>` | Write a device authorization code | `src/tuya_cloud_service/authorize/tuya_authorize.c` |
| `auth-read` / `read_mac` | Read authorization info / MAC | `src/tuya_cloud_service/authorize/tuya_authorize.c` |

`sys_log_enable` and `sys_reboot` sit **above** the `#if defined(CLI_CMD_SYS)`
line in `cli_cmd.c`'s command table — that placement is why they survive with
the option off. Verified live on an ESP32-S3 whose app calls `tal_cli_init()`
and whose config says `# CONFIG_ENABLE_SERIAL_CLI_CMD is not set`: `help`
listed exactly the eight rows above, and the firmware printed
`if you want to see more commands(sys_*, fs_*, kv_*), please turn on ENABLE_SERIAL_CLI_CMD in Kconfig`.

**Two of these are worth reaching for immediately:**

- `sys_reboot` — a *soft* restart that does not touch DTR/RTS. On a USB-JTAG
  board (ESP32-S3 and friends) a hardware reset re-enumerates USB and the first
  ~300 ms of the boot log is unrecoverable; a soft reboot keeps the port open
  and the capture runs straight through, `ESP-ROM:` banner included. This is
  what `tuyaopen-cli firmware monitor --reset` does first, falling back to
  DTR/RTS only when no CLI answers.
- `sys_log_enable off` — silences the log flood before you drive the device, so
  a `help` or a status reply is not buried under DP-report chatter.

### Needs `CONFIG_ENABLE_SERIAL_CLI_CMD=y`

Turning that option on adds three groups, each with its own sub-option
(`CLI_CMD_SYS` / `CLI_CMD_FS` / `CLI_CMD_KV`, all `default y` once the parent is
on). Enable it during bring-up and turn it off for production:

```
CONFIG_ENABLE_SERIAL_CLI_CMD=y
```

| Group | Commands |
|-------|----------|
| `sys_*` (`CLI_CMD_SYS`) | `sys_status`, `sys_heap`, `sys_thread`, `sys_tick`, `sys_version`, `sys_set_log_level`, `sys_timer_count`, `sys_iot_stop`, `sys_iot_restart`, `sys_iot_reset`, `sys_iot_get_devid`, `sys_iot_report_dp`, `sys_netmgr`, `sys_exec`, `sys_wifi_info`, `sys_wifi_scan` |
| `fs_*` (`CLI_CMD_FS`) | `fs_ls`, `fs_stat`, `fs_cat`, `fs_hexdump`, `fs_write`, `fs_append`, `fs_rm`, `fs_mkdir`, `fs_mv` |
| `kv_*` (`CLI_CMD_KV`) | `kv_get`, `kv_set`, `kv_del`, `kv_list` |

`sys_iot_report_dp` and `sys_wifi_*` are the two that change how bring-up feels:
you can report a DP and watch the panel react, or check what the device thinks
of the AP, without rebuilding anything.

**Names to not guess.** Until 2026-08-26 this table listed five commands that
do not exist, next to a claim that they were "typical built-ins":

| Was written | Actually |
|---|---|
| `sys_reset` | `sys_reboot` |
| `thread_list` | `sys_thread` |
| `heap_stats` | `sys_heap` |
| `wifi_info` | `sys_wifi_info` |
| `kv_dump` | `kv_list` |

Run `help` and read the answer. The tables above are a snapshot of
`src/tal_cli/src/cli_cmd.c`; that file is the authority.

Beyond these, your app can register its own with `tal_cli_register_cmd()`.

## Agent workflow example

```bash
# 1. Discover ports
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json list-ports

# 2. Check what commands are available
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json help

# 3. Send a debug command
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json send "sys_heap"

# 4. Reset the device remotely
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json send "sys_reboot"
```

## CLI not enabled: firmware config

If `help` returns no output or the script reports `No response from device CLI`,
check whether the CLI is compiled in.

**Inspect the current build config:**
```bash
grep -i "ENABLE_SERIAL_CLI" dist/*/debug/*/sdkconfig 2>/dev/null
# Or check the source config:
grep "ENABLE_SERIAL_CLI" app_default.config
```

**Enable it:**
Edit `app_default.config` and add:
```
CONFIG_ENABLE_SERIAL_CLI_CMD=y
CONFIG_CLI_CMD_SYS=y
CONFIG_CLI_CMD_KV=y
CONFIG_CLI_CMD_FS=y
```

Then rebuild and reflash:
```bash
tos.py clean -f && tos.py build && tos.py flash
```

## JSON output (for agents)

All sub-commands support `--json`. Stable keys:

| Key | Type | Description |
|-----|------|-------------|
| `ok` | bool | True on success |
| `port` | str | Serial port used |
| `baud` | int | Baud rate used |
| `command` | str | CLI command sent |
| `output` | str | Cleaned response text (echo stripped) |
| `raw` | str | Full raw response bytes (decoded as UTF-8) |
| `error` | str | Error message (if `ok` is false) |
| `hint` | str | Actionable advice (if `ok` is false) |

## Port busy: detecting conflicts

If the port is held by another process (e.g. `tos.py monitor`, a foreground terminal):

```bash
# Find who's holding the port
fuser /dev/ttyACM1
lsof /dev/ttyACM1
```

Stop `tos.py monitor` (Ctrl+C then Enter), or `stop` the background monitor
session described in `../SKILL.md` § *Capture device serial logs*, before
using `cli_debug.py`.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `No response from device CLI` | CLI not enabled in firmware | Add `CONFIG_ENABLE_SERIAL_CLI_CMD=y`, rebuild |
| `No response from device CLI` | Wrong port | Try the other ACM port with `-p /dev/ttyACM0` |
| `No response from device CLI` | Wrong baud rate | Check platform baud table; use `--baud` |
| `Cannot open /dev/ttyACM1` | Port held by another process | Stop `tos.py monitor`; `fuser /dev/ttyACM1` |
| `Cannot open /dev/ttyACM1` | Permission denied | `sudo usermod -aG dialout $USER` then re-login |
| `No serial port found` | Device not connected | Re-plug USB (data cable, not power-only) |
| Garbled output | Wrong baud rate | Use `--baud` with the correct rate for your platform |
| Response looks truncated | Command takes >3s | Increase `--timeout 10` |

## See also

- Background log capture and crash-dump decoding are covered in `../SKILL.md`
  (this same skill, `tuyaopen-embedded-cli-debug`).
- The full build → flash → monitor → analyze loop, and rebuilding firmware
  with the CLI enabled, are out of scope here — see skill `tuyaopen-start`'s
  routing table.

## Test result (connected T5AI board, 2025-06-25)

Port auto-discovery succeeded, identifying `/dev/ttyACM1` (VID 0x1a86, PID 0x55d2,
WCH CH34x dual-serial, score 65) as the T5AI monitor/CLI port. The `help` command
was sent at 460800 baud. The currently flashed DuckyClaw firmware does not have
`CONFIG_ENABLE_SERIAL_CLI_CMD=y` compiled in (the BK7258 native `CONFIG_CLI=y` is
present but that is the chip SDK's own CLI, not TuyaOpen's `tal_cli` interface). The
script correctly reported:

```json
{
  "ok": false,
  "error": "No response from device CLI.",
  "hint": "No data received. Possible causes:\n  1. CONFIG_ENABLE_SERIAL_CLI_CMD=y is not set...\n  ..."
}
```

To enable the CLI: add `CONFIG_ENABLE_SERIAL_CLI_CMD=y` to `app_default.config`,
then `tos.py clean -f && tos.py build && tos.py flash`. After reflash, `help` will
return the list of available commands.
