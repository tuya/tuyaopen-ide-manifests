---
name: tuyaopen-embedded-diagnose
description: >-
  Diagnose a TuyaOpen environment or a misbehaving device: read `tuyaopen
  diag doctor`'s environment/CLI-identity report, export a `diag export`
  bundle for a bug report, capture device serial logs non-blocking in the
  background, send ad-hoc commands to the device's serial CLI (tal_cli), and
  decode a firmware crash dump (PC/LR/stack hex addresses) to source
  file:line via addr2line. Use when something is broken and you need to find
  out why — environment setup, a hung/crashed device, or "why doesn't this
  work".
  环境诊断、diag doctor、diag export、后台串口日志捕获、设备 CLI 调试
  （tal_cli）、固件崩溃解码（addr2line）、故障排查。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat) for the device-side tools
  - Python 3 (stdlib only for background log capture; pyserial for the CLI-debug script — `pip install pyserial`)
  - Device connected via USB serial, for the device-facing sections
---

# TuyaOpen Diagnose

Covers the CLI groups `diag doctor` / `diag export` / `sdk doctor` /
`device list-ports` / `firmware monitor`, plus three absorbed
device-debugging skills that all answer "something's wrong, now what" and
used to overlap without a clear boundary: serial log capture, sending
ad-hoc commands to the device's CLI, and decoding a crash dump. Pick
the section that matches the symptom:

| Symptom | Section |
|---|---|
| "Is my dev environment set up right?" / "which CLI am I even running?" | § 1 `diag doctor` |
| "I need to attach diagnostics to a bug report" | § 2 `diag export` |
| "I just want to watch device logs live" | § 3 Foreground |
| "I want the device's boot/runtime log without blocking my terminal" | § 3 Background / non-blocking |
| "I want to poke the running device — dump KV, check heap, force a reset" | § 4 Send commands to the device CLI |
| "The device pasted a panic/hard-fault dump with hex addresses" | § 5 Decode a crash dump |

For the CLI's envelope, exit codes, and self-discovery (`schema get`), see
skill `tuyaopen-shared` — not repeated here.

## Shortcuts — `tuyaopen diag` / `tuyaopen device` / `tuyaopen sdk` / `tuyaopen firmware`

| Intent | Command |
|---|---|
| Environment/CLI-identity triage (one round trip) | `tuyaopen diag doctor` |
| Diagnostics bundle for a bug report | `tuyaopen diag export` |
| SDK-only diagnostic (install / Python env / `tos.py` presence) | `tuyaopen sdk doctor --sdk-root <path>` |
| List serial ports (for § 3/§ 4 port selection) | `tuyaopen device list-ports --chip <chip>` |
| Foreground serial monitor | `tuyaopen firmware monitor --port <port>` |

Flags aren't listed here — run `tuyaopen schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen` first per skill `tuyaopen-shared` § 1
(it is usually not on `PATH`).

> **No CLI?** `tos.py monitor -p <port>` (foreground); `tos.py check` covers
> part of what `diag doctor` reports. `diag export` and `sdk doctor` have no
> `tos.py` equivalent. See skill `tuyaopen-shared` § 7.

## 1. `tuyaopen diag doctor` — environment triage

```bash
tuyaopen diag doctor --json
```

One round-trip covering: which CLI binary is actually running (`cli.entryPath`
/ `version` / `contractVersion` / `packaging: bundled|standalone|unknown` /
`cacheRoot` / `devplatSpawnNode` — see skill `tuyaopen-shared` § 1 for the
full shape and how to read `packaging`), `node`/`git`/`uv`/`python` toolchain
status, `sdk.{installed,tosPresent,envReady}`, `devplatCli.{present,path}`,
and `credential.{loggedIn,source}`. Real example (fields vary by machine):

```json
{
  "ok": true,
  "data": {
    "cli": { "entryPath": "/…/out/cli/cli.js", "version": "0.1.0", "contractVersion": 1,
              "processNodeVersion": "v22.22.0", "packaging": "bundled",
              "cacheRoot": { "path": "/home/<user>/TuyaOpenIDE/.tuyaopen/cache", "source": "default" },
              "devplatSpawnNode": "/…/bin/node" },
    "node": { "status": "ok", "version": "v22.22.0" },
    "git": { "status": "ok", "version": "2.43.0" },
    "uv": { "status": "ok", "version": "0.11.3" },
    "python": { "status": "ok", "version": "3.12.3" },
    "sdk": { "installed": true, "tosPresent": true, "envReady": true },
    "devplatCli": { "present": true, "path": "/…/tuya-devplat-cli/packages/tuya-devplat-cli/dist/cli.js" },
    "credential": { "loggedIn": false, "source": "none" }
  }
}
```

Read `sdk.envReady` before assuming `tos.py` commands will work — `installed`
and `tosPresent` can both be `true` while the env is still cold. Each tool's
`status` is `ok` / `warn` / `fail`; `node.status: "warn"` means Node is usable
but below the required major version.

## 2. `tuyaopen diag export` — diagnostics bundle for a bug report

```bash
tuyaopen diag export [--out <path>] [--force]
```

Writes a JSON file (default `./tuyaopen-diag-<yyyymmdd-hhmmss>.json`)
combining the same `cli` identity block as `doctor`, system info, tool
versions, SDK diagnostics, and — when run inside a project — project
diagnostics. Refuses to overwrite an existing `--out` path unless `--force`
is given. This is a **local file write** (P3, not gated), not a network
upload — hand the resulting file to whoever is helping debug.

## 3. Monitor / capture device serial logs

### Foreground (interactive)

```bash
tuyaopen firmware monitor --port <port> [--baud <rate>] [--log]
```

Blocking — it inherits your terminal's stdin, Ctrl+C to exit. Pass `--log`
to also tee output to `source/embedded/monitor.log` (or `--log-file <path>`).
There is no confirmation gate — `monitor` is read-only from the device's
perspective. It is also **exempt from the CLI's task kill-timer** (the
timeout its `firmware` siblings `build`/`clean`/`flash` get) because it is
meant to run indefinitely in the foreground — don't treat it as a bounded
command that will eventually return on its own.

> **No CLI?** `tos.py monitor -p <port>`. See skill `tuyaopen-shared` § 7.

### Background / non-blocking

For the actual use case below — capturing logs while doing something else,
e.g. flashing on another port — **neither the CLI nor `tos.py` has a
built-in detached/background monitor mode**; this is a genuine coverage gap,
not a case of the CLI being merely unavailable. A helper script wraps
`tos.py monitor -l` as a detached background process so an agent can flash
on one port while a monitor keeps logging on another, without holding a
foreground terminal open. Installed at:

```
.agents/skills/tuyaopen-embedded-diagnose/scripts/monitor_helper.py
```

```bash
# Start (auto-names the log file if -l is omitted)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-diagnose/scripts/monitor_helper.py start -p /dev/ttyACM1

# Read the last 200 lines (JSON output for agent parsing)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-diagnose/scripts/monitor_helper.py --json tail -n 200

# Stop — releases the serial port
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-diagnose/scripts/monitor_helper.py stop

# Check whether a session is already running
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-diagnose/scripts/monitor_helper.py status
```

Add `--json` before the subcommand for machine-readable output. No extra
dependencies — Python stdlib only.

**Log location**: `<project_dir>/.target_logging/` (found by searching upward
from the cwd for `app_default.config`), gitignored by the SDK's unanchored
`.target_logging` rule regardless of project depth:

```
<project_dir>/.target_logging/
├── session.json              # active session: PID + log path
└── YYYYMMDD_HHMMSS.log       # auto-named per session
```

Only one session runs at a time — starting a new one stops the previous.

**Port selection** — group `tuyaopen device list-ports --chip <chip> --json`
output the same way as skill `tuyaopen-embedded-flash`: a single-serial board's one
port carries flash, auth, and log together (so `stop` this session before a
flash on that board); a dual-serial board (e.g. T5AI) can keep this monitor
running on the log port while flashing the other. `tuyaopen device
list-ports` output is coarser than the raw `tyutool_cli list-ports --json`
(no `usbSerial`/`usbInterface`) — see skill `tuyaopen-embedded-flash` § 1 / § 4 when
you need the authoritative grouping.

**Log analysis patterns**:

| Pattern | Meaning | Action |
|---|---|---|
| `[... ty E]` | Error-level log | Analyze message and source location |
| `[... ty W]` | Warning | Usually non-fatal; investigate if repeated |
| `feed watchdog` | Heartbeat (~10s) | **Normal** — device is alive |
| `OPRT_` + negative number | SDK operation failed | Cross-reference the code (device firmware source) |
| `mqtt connected` | Cloud connected | **Success** |
| No output after start | Wrong port or wrong baud | Swap ports; check the chip's monitor baud (§ 1 `list-ports --chip`) |

## 4. Send commands to the device CLI (`tal_cli` over UART)

For inspecting live device state (heap, KV store, filesystem, threads) without
opening a foreground monitor — `sys_reset`, `kv_dump`, `fs_ls`, or any custom
command the firmware registers. Full reference, options, and troubleshooting:
[references/CLI_DEBUG.md](references/CLI_DEBUG.md). Script installed at
`.agents/skills/tuyaopen-embedded-diagnose/scripts/cli_debug.py` (needs `pip install
pyserial`; requires firmware built with `CONFIG_ENABLE_SERIAL_CLI_CMD=y`).

```bash
python .agents/skills/tuyaopen-embedded-diagnose/scripts/cli_debug.py --json help
python .agents/skills/tuyaopen-embedded-diagnose/scripts/cli_debug.py --json send "heap_stats"
```

**Baud is always 115200** — `tal_cli` hardcodes it on every platform,
independent of the platform-specific log/monitor baud used in § 3. If the
port is busy, stop the § 3 monitor session (or any foreground `tos.py
monitor`) first — see [references/CLI_DEBUG.md](references/CLI_DEBUG.md) for
the full port-busy / port-selection detail.

## 5. Decode a crash dump (PC/LR/stack → source `file:line`)

When firmware panics, the serial log dumps raw register values (`PC`, `LR`,
sometimes `EPC1/2/3` for Xtensa) plus stack frame snapshots. Turning those
into source locations needs the **debug ELF** from the same build and the
matching per-platform `addr2line` — both already sit in the TuyaOpen tree
after one `tos.py build`. Full step-by-step (platform identification,
locating the toolchain and ELF, the `addr2line` invocation, extracting
candidate addresses from a raw dump, common gotchas):
[references/CRASH_DECODE.md](references/CRASH_DECODE.md).

```bash
ADDR2LINE=TuyaOpen/platform/tools/gcc-arm-none-eabi-10.3-2021.10/bin/arm-none-eabi-addr2line
$ADDR2LINE -e <debug.elf> -f -C -i 0x021d8e96 0x021d5863
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `diag doctor` reports `sdk.envReady: false` | SDK env not pulled/activated | `tuyaopen sdk env-pull`, or activate `export.sh`/`.ps1`/`.bat` |
| `diag export` fails with "Output file already exists" | Default/explicit `--out` path collides | Re-run with `--force`, or pass a different `--out` |
| Background monitor shows no output | Wrong port or baud | Check with `device list-ports --chip <chip>`; swap ports on a dual-serial board |
| `cli_debug.py` reports `No response from device CLI` | `CONFIG_ENABLE_SERIAL_CLI_CMD` not compiled in, or wrong port/baud | See [references/CLI_DEBUG.md](references/CLI_DEBUG.md) troubleshooting table |
| `addr2line` output is all `??` | Debug ELF doesn't match the flashed binary | Re-flash + reproduce, or checkout the exact commit and rebuild — see [references/CRASH_DECODE.md](references/CRASH_DECODE.md) |
| Port busy across § 3/§ 4 | Single-serial board — only one of monitor/CLI-debug/flash can hold the port at a time | `stop` whichever session is running before starting the next |

## Scripts

| Script | Absorbed from | Purpose |
|---|---|---|
| `scripts/monitor_helper.py` | `tuyaopen-debug-helper` | Non-blocking background serial log capture (§ 3) |
| `scripts/cli_debug.py` (+ `requirements.txt`) | `tuyaopen-cli-debug` | Send commands to the device's `tal_cli` over UART (§ 4) |

## References

- [references/CLI_DEBUG.md](references/CLI_DEBUG.md) — full `tal_cli` command reference, absorbed from `tuyaopen-cli-debug`.
- [references/CRASH_DECODE.md](references/CRASH_DECODE.md) — full crash-decode walkthrough, absorbed from `tuyaopen-crash-decode`.
