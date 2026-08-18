---
name: tuyaopen-flash
description: >-
  Flash firmware, monitor serial output, and pick the right serial port for a
  TuyaOpen device via the `tuyaopen` CLI (`firmware flash`, `firmware
  monitor`, `device list-ports`). Covers single-serial vs dual-serial board
  identification, the P2 flash confirmation ritual, and when to fall back to
  the SDK's own `tyutool_cli` directly (reading flash back out, a bare
  DTR/RTS hardware reset, or disambiguating a port the CLI's own listing
  can't). Use when the user mentions flashing, burning firmware, choosing a
  serial port, `tos.py flash`, `tyutool_cli`, or serial monitor setup.
  固件烧录、串口选择、tuyaopen firmware flash/monitor、tyutool_cli 直连兜底、
  单串口与双串口开发板识别、烧录确认流程。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat) for the tyutool_cli fallback
  - Device connected via USB serial
---

# TuyaOpen Flash & Serial

Covers the CLI groups `firmware flash`, `firmware monitor`, and `device
list-ports`. For everything about `tuyaopen`'s envelope, exit codes, and the
P0/P2 risk-gate mechanics referenced below, see skill `tuyaopen-shared` — this
skill only covers what's specific to flashing and serial ports.

## Shortcuts — `tuyaopen firmware` / `tuyaopen device`

| Intent | Command |
|---|---|
| List serial ports (with per-chip baud when `--chip` is given) | `tuyaopen device list-ports --chip <chip>` |
| Flash firmware to the device | `tuyaopen firmware flash --port <port>` (P2) |
| Foreground serial monitor | `tuyaopen firmware monitor --port <port>` |

Flags aren't listed here — run `tuyaopen schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen` first per skill `tuyaopen-shared` § 1
(it is usually not on `PATH`).

> **No CLI?** `tos.py flash -p <port>` / `tos.py monitor -p <port>`; for
> port disambiguation the raw `tyutool_cli list-ports --json` (§ 4) is the
> fallback, not `tos.py`. See skill `tuyaopen-shared` § 7.

## 1. Choose a port

```bash
tuyaopen device list-ports --json
tuyaopen device list-ports --chip t5 --json   # also returns recommended flash/monitor baud for that chip
```

Each entry is `{ "port": "...", "description": "..." }` (plus `flash` /
`monitor` baud numbers when `--chip` is given). `description` is a
best-effort label — a Windows friendly device name, a Linux
`/sys/class/tty/<dev>/device/interface` or `.../product` string, or absent
entirely on some platforms. **This is coarser than the raw SDK tool**: it has
no `usbSerial` / `usbInterface` fields, so it cannot always tell you *which*
of two ports on the same physical board is the flash port — see § 4 for when
you need that.

Known `--chip` ids (also the `firmware flash --port` baud table): `t1`, `t2`,
`t3`, `t5`, `bk7231n`, `ln882h`, `esp32`, `esp32c3`, `esp32c6`, `esp32s3`. Omit
`--chip` if you don't know it yet — the port list still comes back.

**Single-serial vs dual-serial boards** — a board with one USB connector can
still enumerate as one or two OS-level serial ports:

| Ports the board exposes | Shape | Which port for what |
|---|---|---|
| 1 | single-serial | flash = monitor — the same port, one user at a time |
| 2+ | dual-serial (e.g. T5AI's CH342) | one port is flash/auth, the other is log/monitor — `description` sometimes distinguishes them (interface name), sometimes doesn't |

If `description` doesn't disambiguate a dual-serial pair, or you need the
authoritative `usbSerial`/`usbInterface` grouping, fall back to `tyutool_cli`
directly — § 4.

## 2. Flash firmware — `firmware flash` (P2)

Flashing overwrites the device's current firmware, but it has a reverse
command (re-flash), so it dropped from P0 to P2 on 2026-08-18 (`license
remove` is the only P0 command left in the CLI — see skill `tuyaopen-shared`
§ 4). It is gated by `--yes` **and** `TUYAOPEN_AUTOCONFIRM_P2=1`, not a
derived `--confirm` token:

```bash
tuyaopen firmware flash --port <port> --dry-run
# → preview only — a P2 dry-run does not hand back a confirm token
export TUYAOPEN_AUTOCONFIRM_P2=1        # once per session
tuyaopen firmware flash --port <port> --yes
```

Flag reference (baud, project/SDK root overrides): `tuyaopen firmware --help`
or `tuyaopen schema get --group firmware --command flash` — do not hardcode a
flag list here, it drifts (see skill `tuyaopen-shared` § 5).

Before it flashes, the CLI best-effort kills a lingering `tyutool_cli`/`tos.py`
process from a **previous flash** of its own so the port is free. It does
**not** stop a `firmware monitor` you left running in another terminal — on a
single-serial board that monitor still owns the port exclusively, and the
flash will fail with a port-busy error (see the troubleshooting table) until
you stop it yourself.

Device authorization (writing a UUID/AuthKey credential) is a related but
separate P2 command, `firmware authorize` — not in scope here, see skill
`tuyaopen-shared`'s routing table.

## 3. Monitor serial output — `firmware monitor`

```bash
tuyaopen firmware monitor --port <port> [--baud <rate>]
```

This is a **foreground, blocking** session (it inherits your terminal's
stdin) — Ctrl+C to exit. Pass `--log` to also tee the output to
`source/embedded/monitor.log` (or `--log-file <path>` for a custom location).
There is no confirmation gate — `monitor` is read-only from the device's
perspective.

**Non-blocking / background log capture** (so an agent can flash on one port
while tailing logs from another, or keep a session alive across multiple
tool calls) is a different tool with its own session/log-file protocol — not
in scope here, see skill `tuyaopen-shared`'s routing table.

## 4. Fallback — `tyutool_cli` directly

The `firmware` CLI group covers flash and monitor; it does **not** wrap every
`tyutool_cli` verb. Reach for the SDK tool directly (full reference:
[references/TYUTOOL_CLI.md](references/TYUTOOL_CLI.md)) when you need to:

- **Read flash back out** to a file (`tyutool_cli read`) — no CLI equivalent.
- **Hardware-reset** a board via a bare DTR/RTS pulse (`tyutool_cli reset`)
  without flashing or monitoring — no CLI equivalent.
- **Disambiguate a dual-serial board** that `tuyaopen device list-ports`
  couldn't — `tyutool_cli list-ports --json` returns `usbSerial` /
  `usbInterface` per port, which is what actually decides the flash-vs-log
  mapping (see [references/TYUTOOL_CLI.md](references/TYUTOOL_CLI.md) § *Port
  Selection*).
- **Write a device authorization code** (UUID/AuthKey) outside the CLI's own
  `firmware authorize` wrapper, or need the raw per-chip baud table.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `firmware flash`/`monitor` fails with `--port is required` | No `--port` given | Run `tuyaopen device list-ports` first and pass one explicitly |
| Flash fails with a port-busy error (`PermissionError 13` / `Access is denied` / `Device or resource busy`) | A `firmware monitor` (or any other process) still holds the port — single-serial boards share flash and log on one OS resource | Stop the monitor session, retry the flash, reopen the monitor after |
| `tuyaopen device list-ports` returns two ports with the same or no `description` and you can't tell which is which | Thin port listing can't disambiguate | Fall back to `tyutool_cli list-ports --json` (§ 4) and group by `usbSerial`/`usbInterface` |
| Flash unstable / drops mid-transfer | Baud too high for the physical link | Retry with a lower `--baud` (the per-chip default is usually right; only override on developer instruction) |
| `firmware flash` rejected as `confirmation:needs_yes` | Missing `--yes` and/or `TUYAOPEN_AUTOCONFIRM_P2=1` | Pass both, or `--dry-run` to preview first — see skill `tuyaopen-shared` § 4 |
| Need to read flash contents, hard-reset without flashing, or disambiguate a dual-serial pair | Not covered by the `firmware` CLI group | § 4 fallback — `tyutool_cli` directly |

## References

- [references/TYUTOOL_CLI.md](references/TYUTOOL_CLI.md) — full `tyutool_cli` command reference (chip baud/flash-size table, `write`/`read`/`reset`/`authorize`, dual-serial port grouping, diagnostic log locations). Absorbed from the former `tuyaopen-tyutool-cli` skill.
