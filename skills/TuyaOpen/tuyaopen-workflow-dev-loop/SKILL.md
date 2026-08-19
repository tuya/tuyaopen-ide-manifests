---
name: tuyaopen-workflow-dev-loop
description: >-
  Automated build-flash-monitor-analyze development loop for TuyaOpen devices.
  Covers log analysis, error patterns, CLI testing, and iterative debugging.
  Use when the user mentions dev loop, automated testing, log analysis, debug
  cycle, iterative development, or CI loop.
  开发闭环、自动化测试、日志分析、调试循环、迭代开发。
license: Apache-2.0
compatibility:
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat)
  - Device connected via USB (MCU targets) or native Linux host
---

# TuyaOpen Build-Deploy-Debug Loop

## Shortcuts — `tuyaopen firmware` / `tuyaopen diag` / `tuyaopen device`

| Intent | Command |
|---|---|
| Build / clean | `tuyaopen firmware build` · `tuyaopen firmware clean` |
| Flash | `tuyaopen firmware flash` (P2: `--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1`) |
| Serial monitor | `tuyaopen firmware monitor` |
| List ports | `tuyaopen device list-ports` |
| Environment check-up / diagnostic bundle | `tuyaopen diag doctor` · `tuyaopen diag export` |

Flags aren't listed here — run `tuyaopen schema get --group firmware --command
flash` for the current set. Resolve `tuyaopen` first per `tuyaopen-shared` § 1
(it is usually not on `PATH`).

## Loop Workflow

The standard development iteration cycle for TuyaOpen hardware:

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Build  │────>│  Flash  │────>│ Monitor │────>│ Analyze │────>│ Decide  │
│         │     │         │     │  Logs   │     │ Results │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └────┬────┘
     ^                                                               │
     │                         ┌──────────┐                          │
     └─────────────────────────│ Fix Code │<─────── if error ────────┘
                               └──────────┘         if ok → done
```

### Step-by-step

1. **Build**:

   ```bash
   tuyaopen firmware build --json
   ```

   Read `.ok`. On failure, `.type` / `.subtype` classify the error — no need
   to parse stdout.

   > **No CLI?** Equivalent: `tos.py build`, but you parse its output
   > yourself. Full mapping: `tuyaopen-shared` § 7.

2. **Flash**: flash firmware to the device from the project directory:

   ```bash
   TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen firmware flash --port <port> --yes --json
   ```

   The env var is a **prefix on this one invocation**, not an `export`: an
   export leaves every later P2 command in the shell one `--yes` away. Same
   keystrokes, scope ends with the command (skill `tuyaopen-shared` § 4).

   > **No CLI?** `tos.py flash -p <port>`. See `tuyaopen-shared` § 7.

   **Which port?** Run `tyutool_cli list-ports --json` and group on `usbSerial`
   — one physical board is one `usbSerial`:
   - **1 port** → single-serial board: flash, auth and log all share it.
   - **2+ ports** → dual-serial board (T5/T5AI etc.): flash = lowest
     `usbInterface`, monitor/log = the other.

   Rank by `usbInterface`, not by `COM`/`ttyACM` number — on Windows the flash
   port can be the *higher* COM. Typical, not guaranteed: if flash fails on one
   port, swap to the other of the same `usbSerial`. Serial permission required on
   Linux (once): `sudo usermod -aG dialout $USER` then reboot.

   **On single-serial boards the loop is sequential**: the monitor holds the only
   port, so `stop` it before flashing (else `Access is denied` / `Device or
   resource busy`) and `start` it again after. Dual-serial boards can keep the log
   port open across a flash.

3. **Monitor / capture logs**:

   ```bash
   tuyaopen firmware monitor --port <port>
   ```

   for interactive sessions.

   > **No CLI?** `tos.py monitor -p <port>`. See `tuyaopen-shared` § 7.

   For **hands-off** background logging (capture while doing something
   else), use `tuyaopen-diagnose` (`monitor_helper.py start -p <port>` →
   `tail` → `stop`) regardless of which of the above you used — neither the
   CLI nor `tos.py` has a background/detached monitor mode.
4. **Analyze**: read the log file under **`<project_dir>/.target_logging/`** for errors, warnings, crash indicators (patterns below)
5. **Decide**: pass (device healthy) or fail (fix code and restart loop)

### LINUX shortcut

For LINUX platform targets, skip flash/monitor — use the bundled script:

```bash
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-dev-loop/scripts/build_run.py          # build + run + auto-analyze (30s timeout)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-dev-loop/scripts/build_run.py 60       # custom timeout in seconds
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-dev-loop/scripts/build_run.py 0        # no timeout
```

Or manually:

```bash
./dist/<project>_<version>/<project>_<version>.elf 2>&1 | tee device.log
```

Both `dist/` (canonical output) and `.build/bin/` (build intermediate) contain the ELF. Use `dist/` for consistency.

## Log Format & Patterns

Build and flash success is read from the envelope, not matched against
stdout: `--json`'s `.ok` is a boolean, and on failure `.type` / `.subtype`
classify what went wrong. stdout carries exactly one line of JSON; everything
else is on stderr.

Matching output only matters on the `tos.py` fallback path, and for
interpreting the *device's* runtime log (which no envelope covers) — that's
what the pattern table below is for.

### TuyaOpen log format

```
[MM-DD HH:MM:SS ty X][source_file.c:line] message
```

Where `X` is the log level: `E` (error), `W` (warn), `N` (notice), `I` (info), `D` (debug), `T` (trace).

### Key patterns to watch

| Pattern | Meaning | Action |
|---------|---------|--------|
| `[... ty E]` | Error-level log (`PR_ERR`) | Analyze the error message and source location |
| `[... ty W]` | Warning (`PR_WARN`) | Usually non-fatal but worth investigating |
| `feed watchdog` | Health monitor heartbeat (every ~10s) | **Normal** — device is alive |
| `OPRT_` followed by negative number | SDK operation failed | Look up error code (see `references/ERROR_CODES.md`) |
| `mqtt connected` or `MQTT_CONNECTED` | Cloud connection established | **Success** — device is online |
| `TUYA_EVENT_DIRECT_MQTT_CONNECTED` | Direct MQTT event | Cloud connection confirmed |
| `Replace the TUYA_OPENSDK_UUID` | Placeholder credentials detected | User must configure real UUID/AuthKey |
| No output after flash | Device crashed or wrong serial port | Check baud rate and port; try reset |
| Repeated reset / boot loop | Crash during init or watchdog timeout | Check last error before reset |
| `malloc failed` or `OPRT_MALLOC_FAILED` | Out of memory | Reduce buffer sizes or optimize memory |

### Log level hierarchy

```
ERR > WARN > NOTICE > INFO > DEBUG > TRACE
```

Default log level: `DEBUG`. Set via `tal_log_init(TAL_LOG_LEVEL_DEBUG, 1024, callback)`.

## CLI Testing

Built-in CLI (`tal_cli`) via debug UART (prompt: `tuya> `). Commands, registration, batch testing: `references/ERROR_CODES.md`.

## Device State

| State | Signal |
|-------|--------|
| Healthy | `feed watchdog` every ~10s; no `PR_ERR` after init; `mqtt connected` |
| No output | Wrong port, wrong baud, crash before log init |
| Boot loop | Crash in init — check last error before reset |
| Watchdog reset | Deadlock or infinite loop — check `PR_ERR` before reset |
| MQTT fail | Check network, credentials, PID mismatch |
| `OPRT_MALLOC_FAILED` | OOM — reduce buffer sizes |

## Agent Iteration Strategy

### On build failure

1. Read the compiler error output carefully.
2. Identify the source file and line.
3. Fix the code.
4. `tuyaopen firmware build --json` again (`tos.py build` on the fallback path). Repeat until build succeeds.

### On flash failure

1. Check serial port (T5 dual-port: try the other port if flash fails — see the Flash step above).
2. Wait ~1 minute if port is busy.
3. Retry with the other port if available.
4. If still failing, ask the user to check hardware connection.

### On runtime error (log analysis)

1. Capture log output after flash (monitor for 10-30 seconds).
2. Search for `ty E` (errors) and `OPRT_` patterns.
3. Map error codes using `references/ERROR_CODES.md`.
4. Identify the source file and line from the log.
5. Fix the code based on the error context.
6. Restart the loop: build → flash → monitor.

### On no output

1. Verify serial port and baud rate match the chip (check the baud rate table: T2=115200, T3/T5AI=460800, ESP32=115200, LN882H=921600).
2. Reset the device manually.
3. If still no output, the firmware may have crashed before log init — review recent code changes.

## AI agent helper: `tuyaopen-diagnose` (`monitor_helper.py`)

Full reference: skill **`tuyaopen-diagnose`**. Script path (relative to SDK root):

`.agents/skills/tuyaopen-diagnose/scripts/monitor_helper.py`

Logs are always written to **`<project_dir>/.target_logging/`** (gitignored by the SDK).

### Typical flow

```bash
# 1. Start background monitor (non-blocking)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-diagnose/scripts/monitor_helper.py \
    --json start -p /dev/ttyACM1

# 2. Flash on the other port while monitor keeps logging
#    (env var prefixes this one command — never `export` it)
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen firmware flash --port /dev/ttyACM0 --yes --json

# 3. Read log after boot
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-diagnose/scripts/monitor_helper.py \
    --json tail -n 200

# 4. Stop and release port
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-diagnose/scripts/monitor_helper.py stop
```

> **No CLI?** `tos.py flash -p <port>`. See `tuyaopen-shared` § 7.

### Iteration loop (analyze → fix → re-run)

Repeat until logs are clean:

1. **Build** → **`tuyaopen firmware flash --port <port> --yes --json`**
   (prefix that one invocation with `TUYAOPEN_AUTOCONFIRM_P2=1` — never
   `export` it, or every later P2 command in the shell is one `--yes` away;
   no CLI? `tos.py flash -p <port>` — see `tuyaopen-shared` § 7)
2. **`monitor_helper.py start -p <monitor-port>`** — capture boot + runtime trace
3. **`monitor_helper.py tail -n 200`** → search `ty E`, `OPRT_`, watchdog, MQTT
4. Edit code → go to step 1
5. **`monitor_helper.py stop`** when done so the port is free for the next flash
