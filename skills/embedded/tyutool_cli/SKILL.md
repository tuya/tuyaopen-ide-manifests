---
name: tyutool-cli
description: >-
  Direct tyutool_cli usage for TuyaOpen hardware: list serial ports,
  flash firmware (write), read flash, hardware reset (DTR/RTS), and
  authorize devices (UUID/AuthKey via UART). Use when the user mentions
  tyutool, flashing directly, reading flash, hardware reset, or UART
  authorization. Tool at $OPEN_SDK_ROOT/tools/tyutool/tyutool_cli
  (Linux/macOS) or tyutool_cli.exe (Windows). Install: tos.py update -t.
  固件烧录、Flash读取、硬件复位、串口设备授权（UUID/AuthKey）。
license: Apache-2.0
compatibility:
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat)
  - tyutool_cli installed at $OPEN_SDK_ROOT/tools/tyutool/ (tos.py update -t)
  - Device connected via USB serial
---

# tyutool CLI

> **SDK root:** All tool paths use `$OPEN_SDK_ROOT` (Linux/macOS/PowerShell) or `%OPEN_SDK_ROOT%` (Windows CMD).

## Tool Location & Install

| Platform | Binary |
|----------|--------|
| Linux / macOS | `$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli` |
| Windows PowerShell | `$env:OPEN_SDK_ROOT\tools\tyutool\tyutool_cli.exe` |
| Windows CMD | `%OPEN_SDK_ROOT%\tools\tyutool\tyutool_cli.exe` |

```bash
tos.py update -t   # install or force-update (--tyutool flag)
tos.py update      # also updates tyutool if already installed

$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --version   # verify
```

## Global Flag: `--plain`

Always add `--plain` — disables ANSI/spinner, produces stable parseable output for agents.

## Chip Parameters

Three baud rates per chip:
- **Flash baud**: used by `write`/`read`. Recommended rate; higher = faster but risk instability at physical limits. Do not override unless developer instructs; if flash fails with instability, ask developer whether to lower baud.
- **Auth baud**: used by `authorize` (default 115200, all chips). Developer may change firmware UART baud — if garbled output during auth, ask developer for correct rate.
- **Log baud**: used for serial monitor. Developer may change — if garbled monitor output, ask developer for correct rate.

| `--device` | Flash baud | Auth baud | Log baud | Flash size |
|------------|-----------|----------|---------|-----------|
| `bk7231n` | 921600 | 115200 | 115200 | 2 MiB (`0x200000`) |
| `t2` | 921600 | 115200 | 115200 | 2 MiB (`0x200000`) |
| `t3` | 921600 | 115200 | 460800 | 4 MiB (`0x400000`) |
| `t1` | 921600 | 115200 | 115200 | 8 MiB (`0x800000`) |
| `t5` | 921600 | 115200 | 460800 | 8 MiB (`0x800000`) |
| `ln882h` | 115200 | 115200 | 115200 | 2 MiB (`0x200000`) |
| `esp32` | 460800 | 115200 | 115200 | 4 MiB (`0x400000`) |
| `esp32c3` | 460800 | 115200 | 115200 | 4 MiB (`0x400000`) |
| `esp32c6` | 460800 | 115200 | 115200 | 8 MiB (`0x800000`) |
| `esp32s3` | 460800 | 115200 | 115200 | 16 MiB (`0x1000000`) |

## Port Selection (Do First)

```bash
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --plain list-ports
```

Output (tab-separated): `path  vid:pid  usb_interface  port_role  display_name`

`port_role` is frequently `-` (unpopulated) — do not depend on it. Prefer the
JSON form, which exposes the two fields that actually decide the mapping:

```bash
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli list-ports --json
```

```json
[ { "path": "COM33", "usbSerial": "5AAE168564", "usbInterface": 2 },
  { "path": "COM34", "usbSerial": "5AAE168564", "usbInterface": 0 } ]
```

### Single-serial vs dual-serial boards

Boards come in two shapes, and which one you have decides everything below.
**Group the port list by `usbSerial`** — one physical board is one `usbSerial`,
however many ports it exposes:

| Ports sharing a `usbSerial` | Board | Mapping |
|---|---|---|
| 1 | **single-serial** | flash **=** auth **=** log — all three on that one port |
| 2+ | **dual-serial** | lowest `usbInterface` → flash / auth / reset; the other → log |

Two ports with *different* `usbSerial` values are two different boards, not a
dual-serial pair.

> **Do not rank by port number.** `usbInterface`, not the `COM`/`ttyACM` number,
> is what identifies the flash port. The two orderings disagree in practice — on
> Windows a board can enumerate as `COM33` = interface 2 (log) and `COM34` =
> interface 0 (flash), so the *higher* COM number is the flash port. On Linux
> `ttyACM0`/`ttyACM1` usually follow interface order, which is why the
> lower-number rule appears to work there and then silently breaks on Windows.

Still not guaranteed across vendors — if the handshake fails, try the other port
of the same `usbSerial` before assuming a hardware fault.

### Single-serial boards: one port, one user at a time

On a single-serial board the log stream and the flash/auth channel are the same
OS resource, so **a monitor holding the port blocks every other command**
(`PermissionError 13` / `Access is denied` / `Device or resource busy`). Stop the
monitor — including the IDE's own serial panel — before `write`, `authorize`, or
`reset`, then reopen it afterwards. Baud usually differs between the two uses
(log baud vs. the 115200 auth baud), so reopen at the right rate for the job.

Dual-serial boards do not have this problem: monitoring the log port while
flashing the other port is fine and is the normal debug loop.

Always pass `-p <port>` explicitly. Omitting `-p` with multiple ports triggers an interactive selection prompt (not usable in agent workflows).

## `write` — Flash Firmware

```bash
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --plain write \
    -d <chip> -f <firmware.bin> -p <flash_port> \
    [-b <baud>] [-s <start_hex>] [--end <end_hex>]
```

| Flag | Required | Default |
|------|----------|---------|
| `-d/--device` | YES | — |
| `-f/--file` | YES | — |
| `-p/--port` | NO* | auto-detect |
| `-b/--baud` | NO | chip flash baud |
| `-s/--start` | NO | `0x00000000` |
| `--end` | NO | `start + file size` |

*Always specify `-p` for agents.

Success: exit 0, last output line is `Flash OK  Xs`.

## `read` — Dump Flash to File

```bash
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --plain read \
    -d <chip> -f <output.bin> -p <flash_port> \
    [-s <start_hex>] [-l <length_hex>]
```

Default length: `0x200000` (2 MiB). For a full dump, use the chip flash size from the table above.

## `reset` — Hardware Reset via DTR/RTS

Use the **flash port** (same as `write`).

```bash
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --plain reset \
    -d <chip> -p <flash_port>
```

`-d` default: `bk7231n`. Reset sequence by family:
- Beken (`bk7231n`, `t1`–`t5`): DTR/RTS pulse
- ESP32 (`esp32`, `esp32c3`, `esp32c6`, `esp32s3`): espflash hard_reset

## `authorize` — Read/Write UUID + AuthKey

Use the **flash port**. Operates at the chip's auth baud (115200 by default).

```bash
# Read current auth state (omit --uuid and --authkey)
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --plain authorize -p <flash_port>

# Write credentials (both flags required together)
$OPEN_SDK_ROOT/tools/tyutool/tyutool_cli --plain authorize \
    -p <flash_port> --uuid <uuid_string> --authkey <authkey_string>
```

Obtain UUID/AuthKey from the Tuya platform — see skill `tuyaopen/device-auth`.

> **Credential safety** — when handling UUID/AuthKey:
> - Use placeholder values (`your_uuid_here`, `your_authkey_here`) in all code examples and documentation.
> - Never display, log, or echo real credentials in conversation output or comments.
> - If the user provides real credentials, write them only to the hardware via the `authorize` command; do not repeat them in any other context.
> - Remind the user that files containing real credentials (e.g. `tuya_config.h`) must not be committed to version control.
> - See skill `tuyaopen/device-auth` for the full placeholder convention and credential lifecycle.

> **After authorizing, report it to the IDE.** `authorize` writes the chip only.
> The TuyaOpen IDE keeps a separate 授权码 ledger that CLI writes do not touch, so
> its panel will still read `未使用` even though the device is authorized. Write the
> `pending-auth.json` handback file to sync them — see skill `tuyaopen/device-auth`
> → *IDE Ledger*. The same applies to `write`: flashing firmware never updates that panel.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `tyutool_cli: not found` | `tos.py update -t` |
| `No serial ports found` | Re-plug USB cable |
| `PermissionError 13` / `Access is denied` / `Device or resource busy` | Port held by something else — stop the serial monitor (the IDE's panel counts). Routine on single-serial boards, where log and flash share one port |
| Handshake fails / timeout | Try the other port of the same `usbSerial` |
| Flash unstable / fails | Ask developer whether to use lower baud (`-b 460800`) |
| Garbled output during `authorize` | Ask developer for firmware's UART auth baud rate |
| Garbled serial monitor output | Ask developer for firmware's UART log baud rate |
| Interactive port prompt appears | Always pass `-p <port>` explicitly |
| IDE 授权码 panel still shows `未使用` after a successful `authorize` | Expected — CLI writes do not touch the IDE ledger. Write the `pending-auth.json` handback (skill `tuyaopen/device-auth` → *IDE Ledger*) |

## Diagnostic Logs

On failure, check the tool's own log file:
- Linux: `~/.local/share/tyutool/tyutool.log`
- macOS: `~/Library/Application Support/tyutool/tyutool.log`
- Windows: `%APPDATA%\tyutool\tyutool.log`
