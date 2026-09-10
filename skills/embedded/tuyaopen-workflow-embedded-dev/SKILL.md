---
name: tuyaopen-workflow-embedded-dev
description: 'End-to-end TuyaOpen firmware workflow: turn product DPs into running, online firmware. Use for device-side
  coding, hardware selection, build, flash, authorization, provisioning, logs, crash/debug loops, or any peripheral/LVGL
  request. 中文触发：固件开发、设备侧开发、编译、烧录、授权、配网、日志、外设、LVGL、调试闭环。'
license: Apache-2.0
compatibility: TuyaOpen environment activated (export.sh / export.ps1 / export.bat); Device connected via USB (MCU
  targets) or native Linux host
metadata:
  version: 2.3.2
  owner: embedded-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
---
# TuyaOpen Embedded Development Workflow

## Shortcuts — `tuyaopen-cli firmware` / `tuyaopen-cli diag`

| Intent | Command |
|---|---|
| Build / clean | `tuyaopen-cli firmware build` · `tuyaopen-cli firmware clean` |
| Flash | `tuyaopen-cli firmware flash` (P2: `--yes`) |
| Serial monitor | `tuyaopen-cli firmware monitor` |
| List ports | `tuyaopen-cli firmware list-ports` |
| Environment check-up / diagnostic bundle | `tuyaopen-cli diag doctor` · `tuyaopen-cli diag export` |

Flags aren't listed here — run `tuyaopen-cli schema get --group firmware --command
flash` for the current set. Resolve `tuyaopen-cli` first per `tuyaopen-start` § 1
(it is usually not on `PATH`).

## Where this sits in the three-phase pipeline

Product development runs in three phases. This skill is the second:

```
① tuyaopen-workflow-product-dev   requirements → product/PID → DPs → dp generate
                │
                ├──▶ ② tuyaopen-workflow-embedded-dev   ← you are here
                └──▶ ③ tuyaopen-workflow-miniapp-dev     (independent of ②)
```

You get here two ways, and they need different first moves:

| Arrived how | Do this first |
|---|---|
| Handed over from `tuyaopen-workflow-product-dev` | Nothing to re-negotiate — read the context files listed below and enter at the state it reported (`has-dps`, `in-progress` or `built`) |
| Straight in ("build this", "why won't it flash") | You may not have a product at all. If `[product] pid` is empty, the request still works for a local build, but anything cloud-facing — DP handlers, authorization, provisioning — needs phase ① first |

**Context to read on every entry** (never trust a prose summary, including one
from phase ①): `tuyaopen.project.ini`, `.tuyaopen/project.json` (`ai.intent`,
`ai.expectedDps`), `.tuyaopen/product-<pid>.json` (unwrap `dpSchema` first),
`.tuyaopen/architecture.json`, and the contents of `source/embedded/src/`.

## State machine

Same states and the same detection rules as phase ①, which is deliberate — it
is one machine, split across two skills at the phase boundary, not two
machines that must be kept in sync. `tuyaopen-workflow-product-dev` § *State
Detection* holds the authoritative table; the three states below are the ones
that belong to this phase.

> Detailed has-dps analysis, hardware selection, code generation, and build steps live in [references/STATE_HAS_DPS.md](references/STATE_HAS_DPS.md).

## State: in-progress

**Goal:** Gap analysis → complete code.

### Step 1 — Gap Analysis

Cross-reference source files, `architecture.json`, `ai.expectedDps`, and `selectedDps`:
- DPs in `ai.expectedDps` with no handler in source → missing
- Peripherals in `architecture.json surfaces.embedded.peripherals` not initialized in code → missing init
- DPs in `selectedDps` not in `ai.expectedDps` → ask developer if they should be handled

### Step 2 — Surface Gap

```
Reading existing code...
Handled: switch_led ✓
Missing: bright_value — no PWM init or handler
Missing: temp_value — no PWM handler
Completing now...
```

### Step 3 — Complete Code

Run `has-dps` Step 3 hardware inquiry **only for missing parts**. Read `architecture.json` first — do not re-ask for already-wired peripherals.

After completing, update `architecture.json` (`has-dps` Step 7).

### Step 4 — Build

Delegate to `tuyaopen-embedded-build`.

---

> Detailed build, flash, authorization, provisioning, monitor, and bring-online steps live in [references/STATE_BUILT_ONLINE.md](references/STATE_BUILT_ONLINE.md).

## Loop Workflow

The development iteration cycle. **Note which loop is the inner one:**

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Build  │────>│  Flash  │────>│ Monitor │────>│ Analyze │────>│ Decide  │
│  ~40 s  │     │ ~121 s  │     │  Logs   │     │ Results │     │         │
└─────────┘     └────┬────┘     └─────────┘     └─────────┘     └────┬────┘
     ^               │                                               │
     │               v                                               │
     │        ┌──────────────────────────────┐                       │
     │        │   firmware cli  ~2 s/probe   │  ◀── inner loop:      │
     │        │  help · sys_heap · kv_list   │      ask the running  │
     │        │  sys_wifi_info · report_dp   │      device instead    │
     │        └──────────────┬───────────────┘                       │
     │                       │ only when the answer needs new CODE   │
     │                       v                                       │
     │                ┌──────────┐                                   │
     └────────────────│ Fix Code │<────────── if error ──────────────┘
                      └──────────┘            if ok → done
```

**The outer loop costs ~161 s per turn; the inner one costs ~2 s.** Beta round 6
ran the outer loop seven times and the inner one zero times, and spent 38 % of
its wall clock doing it. Before every rebuild, ask: *can the device that is
already running answer this?* See § *Flash once, then interrogate* above for
the probe-to-question table.

### Step-by-step

1. **Build**:

   ```bash
   tuyaopen-cli firmware build --json
   ```

   Read `.ok`. On failure, `.type` / `.subtype` classify the error — no need
   to parse stdout.

   > **No CLI?** Equivalent: `tos.py build`, but you parse its output
   > yourself. Full mapping: `tuyaopen-start` § 7.

2. **Flash**: flash firmware to the device from the project directory:

   ```bash
   tuyaopen-cli firmware flash --port <port> --yes --json
   ```

   The env var is a **prefix on this one invocation**, not an `export`: an
   export leaves every later P2 command in the shell one `--yes` away. Same
   keystrokes, scope ends with the command (skill `tuyaopen-start` § 4).

   > **No CLI?** `tos.py flash -p <port>`. See `tuyaopen-start` § 7.

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

3. **Monitor / capture logs** — one command, and it adapts:

   ```bash
   # You (an agent, CI, a background task): a bounded capture that returns.
   tuyaopen-cli firmware monitor --port <port> \
       --reset --yes --duration 20 --log-file boot.log --json

   # A human at a terminal: the interactive session.
   tuyaopen-cli firmware monitor --port <port>
   ```

   With no terminal — or whenever you pass `--log-file`, `--reset`,
   `--duration` or `--stream` — it does **not** run `tos.py monitor`. It reads
   the port directly, because `tos.py monitor` is pyserial's `miniterm` and its
   `Console()` needs `termios.tcgetattr(stdin)`; with no controlling terminal
   that raises `termios.error: (25, 'Inappropriate ioctl for device')` before a
   single line is printed.

   | Flag | Why you want it |
   |---|---|
   | `--duration <s>` | **Give it one.** Without a bound the capture runs until killed, and a caller reaching for `timeout` gets exit 124 and no result envelope. |
   | `--reset --yes` | Starts the log at boot instead of mid-session. Sends `sys_reboot` over the device's own CLI (port stays open, `ESP-ROM:` banner included); falls back to a DTR/RTS pulse if no CLI answers. Needs `--yes` because it restarts the board. |
   | `--log-file <p>` | Where you read the capture afterwards. stdout stays one JSON line; the envelope's `data.logFile` echoes the path. |

   Budget ~11 s of startup (`export.sh` env sourcing) on top of `--duration`
   before the port opens.

   > **`--reset` needs `tal_cli_init()` in the app** for the soft path — see
   > skill `tuyaopen-embedded-cli-debug` § 0.1. Without it the DTR/RTS fallback
   > runs, which on a USB-JTAG board re-enumerates USB and costs the first
   > ~300 ms of the log.

   > **No CLI?** `tos.py monitor -p <port>`. See `tuyaopen-start` § 7.

   Only for **genuinely concurrent** capture — logging one port while flashing
   another — reach for `tuyaopen-embedded-cli-debug`'s `monitor_helper.py`. It
   wraps `tos.py monitor`, so it carries the same termios requirement and dies
   the same way in a sandbox; check that it actually started.
4. **Analyze**: read the log file under **`<project_dir>/.target_logging/`** for errors, warnings, crash indicators (patterns below)
5. **Decide**: pass (device healthy) or fail (fix code and restart loop)

### LINUX shortcut

For LINUX platform targets, skip flash/monitor — use the bundled script:

```bash
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-embedded-dev/scripts/build_run.py          # build + run + auto-analyze (30s timeout)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-embedded-dev/scripts/build_run.py 60       # custom timeout in seconds
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-workflow-embedded-dev/scripts/build_run.py 0        # no timeout
```

Or manually:

```bash
./dist/<project>_<version>/<project>_<version>.elf 2>&1 | tee device.log
```

Both `dist/` (canonical output) and `.build/bin/` (build intermediate) contain the ELF. Use `dist/` for consistency.

## Log Format & Patterns
> Detailed loop execution, log patterns, device state, and iteration rules live in [references/DEBUG_LOOP_AND_DEVICE_STATE.md](references/DEBUG_LOOP_AND_DEVICE_STATE.md). Read it when firmware is built and you must debug or bring it online.


本目录 30 个技能里**只有 4 个默认安装**（本技能 + 三个阶段 workflow）。其余 26 个仍在
目录里、内容完整，但**不在你的上下文里** —— 它们靠这一条命令取回：

```bash
tuyaopen-cli skills read --id <id>                       # 正文
tuyaopen-cli skills read --id <id> --path references/x.md # 某个附件
tuyaopen-cli skills read --id <id> --files                # 它带了哪些文件
```

它读的是 `manifests sync` 落下来的目录缓存，**不经过任何 agent 工具的安装根** ——
所以某个工具的安装视图坏掉（链接悬空、目录被删）也不影响它。

**不知道该取哪个**：`tuyaopen-cli skills list --json` 列出全部 30 条（含 `whenToUse`），
或查 skill `tuyaopen-start` 的 `references/ROUTING.md` 路由表。

**取不到**（`config` / `no_manifest_cache`）：跑 `tuyaopen-cli manifests sync` 把目录拉下来，
再重试。这是它唯一的失败模式。

需要长期固定在项目里（跟 git 走、可 review）时才装：
`tuyaopen-cli skills install --ids <id>`。平时不需要。
