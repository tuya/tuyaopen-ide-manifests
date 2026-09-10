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
4. `tuyaopen-cli firmware build --json` again (`tos.py build` on the fallback path). Repeat until build succeeds.

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

## AI agent helper: `tuyaopen-embedded-cli-debug` (`monitor_helper.py`)

> **For a plain capture, use `tuyaopen-cli firmware monitor` instead** (Step 3
> above). `monitor_helper.py` wraps `tos.py monitor`, so it needs a controlling
> terminal and dies with `termios.error` in a sandbox that has none — the exact
> failure beta round 6 hit before hand-writing its own pyserial script. What it
> still buys you is *concurrency*: logging one port while you flash another.

Full reference: skill **`tuyaopen-embedded-cli-debug`**. Script path (relative to SDK root):

`.agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py`

Logs are always written to **`<project_dir>/.target_logging/`** (gitignored by the SDK).

### Typical flow

```bash
# 1. Start background monitor (non-blocking)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py \
    --json start -p /dev/ttyACM1

# 2. Flash on the other port while monitor keeps logging
tuyaopen-cli firmware flash --port /dev/ttyACM0 --yes --json

# 3. Read log after boot
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py \
    --json tail -n 200

# 4. Stop and release port
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py stop
```

> **No CLI?** `tos.py flash -p <port>`. See `tuyaopen-start` § 7.

### Iteration loop (analyze → fix → re-run)

Repeat until logs are clean:

1. **Build** → **`tuyaopen-cli firmware flash --port <port> --yes --json`**
   (no CLI? `tos.py flash -p <port>` — see `tuyaopen-start` § 7)
2. **`tuyaopen-cli firmware monitor --port <port> --reset --yes --duration <s> --log-file boot.log --json`**
   — capture boot + runtime trace. Use `monitor_helper.py` only when you need
   to log one port *while* flashing another.
3. **`monitor_helper.py tail -n 200`** → search `ty E`, `OPRT_`, watchdog, MQTT
4. Edit code → go to step 1
5. **`monitor_helper.py stop`** when done so the port is free for the next flash

## Reverse Transitions

The firmware-phase half. Platform-phase transitions (a DP is missing, a
different PID, a different category) belong to
`tuyaopen-workflow-product-dev` — go back there rather than improvising.

| Trigger | Action |
|---------|--------|
| Build fails: missing Kconfig | → `has-dps` Step 5 |
| Build fails: anything else | Stay in `in-progress`. Debug with the loop below |
| A DP has no handler | → `in-progress` Step 1 (gap analysis). If the DP does not exist on the platform at all, that is phase ① — go back to `tuyaopen-workflow-product-dev` |
| Device never appears in the App, log says `client no active` | → `built` Step 2. This is missing authorization, not a code bug — see `tuyaopen-embedded-device-auth` |
| User asks for an auth code before the firmware builds | Say what it is for and that it is not needed yet; finish `has-dps` Step 8 first. Do **not** collect a code early — a code in hand is a code occupied, and one code may only be in use on one device at a time |
| `firmware list-ports` returns an empty list | No board is attached. Say so and stop — do not guess a port name. On a VM this is usually missing USB passthrough |

---

## Always / Never

**Always:**
- Show available peripheral options before asking the developer to choose pins
- Re-ask nothing that is already in `architecture.json`
- Write `architecture.json` only **after** code generation succeeds — it is the authoritative `in-progress` signal, so writing it early makes the state lie
- Read back what you wrote: `firmware auth-status` after `firmware authorize`
- Re-read all context files on every entry

**Never:**
- Assume a GPIO pin without developer confirmation
- Call `tkl_*` APIs in generated code
- Enter `built` Step 2 on the strength of a guess that the build succeeded — `built` has no on-disk signature on purpose
- Write an authorization code to a device without the user confirming the code is free
- Claim the device is provisioned — you cannot observe that. Your criterion is `auth-status` reporting a code and the log no longer printing `client no active`

## 深层技能：默认不安装，按需取回
