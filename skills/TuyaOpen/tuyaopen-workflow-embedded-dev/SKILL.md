---
name: tuyaopen-workflow-embedded-dev
description: >-
  The firmware phase of TuyaOpen product development, end to end: turn a
  product's DPs into working firmware, then get the device online. Runs a
  state machine — hardware inquiry and pin budget, Kconfig, code generation,
  build, flash, authorization code, provisioning — and contains the automated
  build-flash-monitor-analyze loop with log analysis and error-pattern
  matching. Entered on its own for any device-side development, or handed over
  from `tuyaopen-workflow-product-dev` once the platform has a PID and DPs.
  Use when the user wants to write, build, flash or debug device firmware,
  asks what to do next on the device side, or mentions the dev loop, log
  analysis, or an iterative debug cycle.
  嵌入式开发阶段的完整工作流：从产品 DP 到可运行固件，再让设备上线。含硬件选型
  与引脚预算、Kconfig、代码生成、编译、烧录、授权码、配网的状态机，以及
  编译—烧录—监控—分析闭环与日志/错误码分析。
license: Apache-2.0
compatibility:
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat)
  - Device connected via USB (MCU targets) or native Linux host
---

# TuyaOpen Embedded Development Workflow

## Shortcuts — `tuyaopen firmware` / `tuyaopen diag`

| Intent | Command |
|---|---|
| Build / clean | `tuyaopen firmware build` · `tuyaopen firmware clean` |
| Flash | `tuyaopen firmware flash` (P2: `--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1`) |
| Serial monitor | `tuyaopen firmware monitor` |
| List ports | `tuyaopen firmware list-ports` |
| Environment check-up / diagnostic bundle | `tuyaopen diag doctor` · `tuyaopen diag export` |

Flags aren't listed here — run `tuyaopen schema get --group firmware --command
flash` for the current set. Resolve `tuyaopen` first per `tuyaopen-shared` § 1
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

## State: has-dps

**Goal:** Hardware wiring + complete firmware generation.

### Step 1 — Reserved Pin Set

Collect from ALL sources:
- `board.json peripheralPatterns[*].pins[*][*].gpio`
- `platform.json flashAndDebug.flash.pins`
- `platform.json flashAndDebug.debug` port → look up TX/RX via `pinout[]`
- `platform.json peripherals.uart[*]` where `role === "log"` → look up TX/RX via `pinout[]`

Available after subtracting reserved:
- **PWM:** `peripherals.pwm.spec.channels[]` — each channel lists valid pin options; exclude options whose GPIO is reserved
- **I2C:** `peripherals.i2c.spec.buses[]` — each bus needs SDA + SCL (2 GPIO); exclude buses with no free pin pair
- **GPIO:** `peripherals.gpio.spec.pins[]` minus all reserved numbers

Read `architecture.json surfaces.embedded.peripherals` — skip Step 3 inquiry for peripherals already wired there.

### Step 2 — Pin Budget

GPIO demand per interface:

| Interface | GPIO pins |
|-----------|-----------|
| PWM channel | 1 |
| I2C bus | 2 (SDA + SCL) |
| SPI bus | 4 (MOSI + MISO + CLK + CS) |
| GPIO output/input | 1 |

If demand > available: tell developer. Suggest alternatives (different board, I2C expander, fewer channels). Do not continue until resolved.

### Step 3 — Hardware Inquiry

For each DP needing hardware (not already in `architecture.json`), present available options then ask:

```
Brightness control (warm + cool LED) via PWM:
  PWM0 → valid pins: 6, 18  (pin 4 reserved: board STATUS_LED)
  PWM1 → valid pins: 7, 19
  PWM2 → valid pins: 8, 20

Which channel + pin for warm-white LED?
Which channel + pin for cool-white LED?
Active-high or active-low?
```

**Never assume a pin.** If developer picks a reserved GPIO: "GPIO X is already used by [board.json component]. Please choose from the options above."

### Step 3.5 — Does this plan need an opt-in skill? (check BEFORE writing code)

<code data-type="tag" style="color:#ff4d4f">内测第四轮：整轮写了 LVGL 中文 UI，从没看过 `tuyaopen-embedded-lvgl`</code>

Two skills this phase regularly needs are in the `scenario` group, which
`tuyaopen skills install --all` deliberately **skips**. A skill that was never
installed does not exist as far as your context is concerned — no name, no
description, nothing to stumble on. **This table is their only visible entry
point**, which is why it sits here rather than in a reference file:

| If the plan involves… | Install and read first |
|---|---|
| **A screen** — any LVGL UI, widgets, LVGL Kconfig, images/GIFs, fonts, and above all **Chinese text** | `tuyaopen-embedded-lvgl` |
| A third-party (PlatformIO) library — wiring it into CMakeLists.txt / Kconfig | `tuyaopen-embedded-dependency` |

```bash
tuyaopen skills install --ids tuyaopen-embedded-lvgl
```

> **中文显示是本条存在的直接原因。** `LV_FONT_SIMSUN_16_CJK` **不是**中文字体 ——
> 它是 ASCII 加一份**硬编码的 1272 字符表**，表外的字直接不渲染。「温度」「取消」
> 在表里，「设置」「开关」「连接」「亮度」「湿度」不在。你不会看到报错，只会看到
> 空白。写任何中文界面之前先读那个 skill 的 references/development.md。

Newly installed skills are **not** in the current session's context — reload the
skill list or start a new session before relying on one.

### Step 4 — Plan Confirmation

Present plan including Kconfig changes. Wait for approval.

**"Wait" means stop producing output and yield the turn.** Round 4's agent
printed a DP/hardware plan, wrote 「请回复确认」, and then continued in the same
turn without an answer — which makes the gate decorative. If you cannot block,
say plainly that you are proceeding on unconfirmed assumptions and list them, so
the user can see what to correct.

```
Implementation plan:
  Warm LED: PWM0 / pin 6 / active-high
  Cool LED: PWM1 / pin 7 / active-high
  DP handlers: switch_led (id 1), bright_value (id 2), temp_value (id 3)
  Kconfig: CONFIG_ENABLE_PWM
  Headers: tuya_iot_dp.h, tal_pwm.h
  Cloud: solution type from product snapshot

Does this look right?
```

### Step 5 — Kconfig Update

Kconfig has **two layers**, and only one of them has a manifest. Get both, in
this order:

**a. Board-device macros — from the CLI, never guessed.**

```bash
tuyaopen hardware board-context --project-root <dir> --write --json
```

Every device it prints carries its own `Kconfig:` line (e.g. the 3.5" LCD on
T5AI-Board is `TUYA_T5AI_BOARD_LCD_35565=1`). Copy those verbatim into
`source/embedded/app_default.config` as `CONFIG_<macro>=y`, for the devices
you recorded with `hardware set-used`. A device listed with no `Kconfig:` line
needs none at that layer.

**b. SDK driver macros — read the SDK's own Kconfig.**

The drivers behind the TDL layer have their own switches in
`$OPEN_SDK_ROOT/src/peripherals/<name>/Kconfig` (`ENABLE_BUTTON`,
`ENABLE_LED`, `ENABLE_DISPLAY`, …), most of them `default n`. **Do not assume
they are off, and do not assume they are on** — a board's own Kconfig may
`select` them. Check before adding a line:

```bash
grep -n 'select ENABLE_' $OPEN_SDK_ROOT/boards/<PLATFORM>/<BOARD>/Kconfig
```

On T5AI-Board, `select ENABLE_LED` / `select ENABLE_BUTTON` sit under the
board choice, so the button and the LED come on for free and an explicit
`CONFIG_ENABLE_BUTTON=y` is redundant. On a board without those `select`
lines, the same code compiles and then silently does nothing at runtime —
`tdl_button_create` returns an error and `tdl_led_find_dev` returns NULL.

> **There is no `enableMacro` field.** This step used to say to read
> `peripherals.<name>.enableMacro` from `platform.json`. That field does not
> exist in any of the platform manifests, and `platform.json`'s `peripherals`
> keys are SoC controllers (`gpio`, `uart`, `pwm`, …), not devices — so there
> was nothing to read. Verified 2026-08-25 across all 18 platform manifests.

**c. Verify.** Run `tos.py check`; fix and re-check until it passes.
**Do not generate code until it passes.** Note what `tos.py check` cannot tell
you: an unset `default n` bool is a *valid* config, so a missing driver macro
passes this gate. Step b is the only thing standing between you and a build
that succeeds and a device that does nothing.

### Step 6 — Code Generation

**Which layer to call** — TuyaOpen stacks four, and picking the wrong one is
the most common way to waste a build:

| Layer | Prefix | Use it for |
|---|---|---|
| TDL — device abstraction | `tdl_*` | **Board devices**: button, LED, display, touch, sensors. This is what board peripherals are wired to |
| TDD — device driver | `tdd_*` | Registering a device with TDL (`tdd_gpio_button_register`). Usually the board file already did it — check `$OPEN_SDK_ROOT/boards/<P>/<B>/*.c` before writing one |
| TAL — abstraction | `tal_*` | OS, KV, threads, timers, logging, raw GPIO/UART/I2C/PWM |
| TKL — platform | `tkl_*` | **Never call directly** |

**Never write a `tdl_*` / `tal_*` call you have not read in its header.** The
names are not guessable and a wrong one costs a full rebuild — measured twice
in beta round 4 (`tdl_led_start_blink`, which does not exist; and `tal_kv_get`,
whose signature is `(key, &ptr, &len)` + `tal_kv_free`, not `(key, buf, &len)`).
Find the header, then read it:

```bash
find $OPEN_SDK_ROOT/src/peripherals -name 'tdl_*_manage.h'
grep -rn 'tdl_button_create' $OPEN_SDK_ROOT/examples/  # a real call site
```

`$OPEN_SDK_ROOT/examples/peripherals/<name>/` has a working example for most
of them — read that before writing your own.

Look up from `platform.json`:
- `peripherals.<name>.tklHeader` → `#include` header path
- `peripherals.<name>.idPrefix` → prefix for port/pin C enums

Generate:
- Hardware init (TAL calls with correct headers and enum IDs)
- DP receive handler for all `selectedDps` IDs
- Hardware → DP feedback after each command
- Cloud connection setup — solution type from:
  ```
  (snapshot.detail?.data ?? snapshot.detail)?.protocolType
  ```
  If field absent, ask developer.

Entry point: `tuya_app_main()` in `source/embedded/src/tuya_app_main.c`.
Debug output: `PR_DEBUG(fmt, ...)`.

### Step 7 — Update architecture.json

Write new peripherals and modules to `architecture.json surfaces.embedded`. **This is the authoritative in-progress signal.** Write only after Step 6 completes.

### Step 8 — Build, then format-check what you wrote

Delegate to `tuyaopen-embedded-build`. If build fails, diagnose and fix in place. If Kconfig is root cause, go to Step 5 and rebuild.

Once it compiles, run the formatting / header check over the files **you**
added — delegate to `tuyaopen-embedded-code-check`. It is cheap, it is the only
thing in this phase that looks at the code as code rather than as a build
artefact, and round 4 never ran it once. A green build says nothing about
`clang-format`, file headers, or forbidden characters, all of which a
downstream SDK contribution will be rejected for.

**Compiling is not the end of this state.** Go to `State: built` — the device
has not been flashed yet.

---

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

## State: built — prove it runs, then bring it online

**Goal:** a device the user can control from their phone. This state existed
implicitly and that was the bug: the state machine above ended at "it
compiles", so nothing owned the question "when do we get the device onto the
cloud", and beta round 2's agent asked for an authorization code in its very
first turn — before the project directory existed.

Round 4 then showed the opposite failure: the agent reached `build` exit 0,
ran `license list`, saw `[]`, and wrote a **completion report** without
flashing anything. So read this first:

> ### Two things this state is NOT allowed to do
>
> 1. **Do not write a completion report before Step 6.** "Compiles" is not
>    "works". The Definition of Done is at the bottom of this section and it
>    is a checklist, not a suggestion.
> 2. **Do not treat "no authorization code" as a reason to stop.**
>    **Flashing needs no code.** Everything the user can see with their own
>    eyes — screen UI, LED, button, the state machine, KV persistence — runs
>    on a device that has never touched the cloud. Only the last two steps
>    need a code.

```
Steps 1-3   flash → capture a full boot log → verify the peripherals    ← no code, no cloud, no user
Steps 4-5   ask for a code → authorize → read it back                   ← needs the user to supply a code
Step  6     hand over provisioning + the evidence                       ← needs the user's phone
```

### Step 1 — Flash

**No authorization code is required to flash.** Do it now.

Delegate to `tuyaopen-embedded-flash`. Pick the port via `tuyaopen firmware
list-ports` (multi-port boards: that command's `hint` tells you how to
disambiguate). Note the default baud can be slow enough to hit the build/flash
timeout on a large image — `--baud 921600` is the usual fix, and
`--timeout <ms>` raises the ceiling.

### Step 2 — Capture a **complete** boot log

A monitor attached to an already-running device joins mid-stream, and
everything that matters — board init, peripheral registration, the first
`client no active` — has already scrolled past. So: **attach first, then reset
the device**, and read from the reset line down.

Delegate to `tuyaopen-embedded-cli-debug` § 2 (*从头抓启动日志*). The shape is:

```bash
# 1. background monitor on the log port (does not hold your terminal)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py start -p <log-port>
# 2. reset the device so the log starts at the beginning
python .agents/skills/tuyaopen-embedded-cli-debug/scripts/cli_debug.py --json send "sys_reset"
# 3. read from the reset banner down
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py --json tail -n 400
```

If the firmware has no serial CLI (`CONFIG_ENABLE_SERIAL_CLI_CMD` not set),
power-cycle instead and say so — but consider turning it on: that skill's § 0
covers it, and it is what makes Step 3 cheap.

### Step 3 — Verify each peripheral you claimed

For every id in `.tuyaopen/used-peripherals.json`, find the evidence in the
boot log. A **warning is a failure**, not noise:

| Symptom in the log | What it means |
|---|---|
| `tdl_button_create` returns non-zero, or your own "failed to create button" | The driver Kconfig is off — go back to Step 5b |
| `tdl_led_find_dev` returned NULL | Same |
| Display init errors, or no display lines at all | Wrong board-device Kconfig — Step 5a |
| Nothing at all after the banner | Wrong port or wrong baud — try the other port and 115200 / 460800 / 921600 |
| `client no active` | **Expected here.** It means "no authorization code yet", not a fault. Steps 4-5 fix it |

Where a peripheral can be driven, drive it: register a temporary command with
the device CLI and call it (that is exactly what
`tuyaopen-embedded-cli-debug` is for), or ask the user to press the button and
tell you what the screen and the LED did. **A peripheral you did not observe
is not verified**, and you must say so rather than implying it works.

### Step 4 — Authorization code (the FIRST time it is legitimate to ask, and you MUST ask)

Steps 1-3 are done, so the code is now the thing standing between the user and
a working device. **Ask now.** Do not defer it into a final report for the
user to act on alone.

```bash
tuyaopen diag doctor --json          # deviceAuth.localLicenses — 0 means "none stored here"
tuyaopen license list --json
```

If `localLicenses` is 0, ask — and make the ask self-contained, because the
user should not have to go read a skill to answer you. Say all of this:

> 设备已经烧录并跑起来了（附启动日志要点）。要让它连上涂鸦云、能用手机控制，
> 还差一组授权码（UUID + AuthKey）。三条路任选：
> 1. **TuyaOpen IDE** 侧边栏 *Developer Tools → Licenses*，按已绑定的 PID 申领（最省事，需要项目已绑 PID）
> 2. **开发者平台网页** 的产品「设备授权」页申领，导出 xlsx
> 3. 团队已有一批码 → `tuyaopen license import --xlsx <path>`
>
> 一组码同一时间**只能用在一台设备上**，请确认这组码当前没有被别的设备占用。

Then **stop and wait**. `tuyaopen` has no command that issues codes — `license`
only manages the local store. If the user cannot get one, say exactly where it
is stuck (no PID bound / no IDE / no quota on the platform) and stop there.
Never invent a UUID, and never leave the device sitting at `client no active`
while reporting success.

Two hard rules, both from `tuyaopen-embedded-device-auth`: read its **§0**
before you ask, and never put an AuthKey on argv where it can be — it goes via
`TUYA_LICENSE_AUTHKEY` or stdin.

### Step 5 — Write it, then read it back

```bash
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen firmware authorize --port <port> --yes
tuyaopen firmware auth-status --port <port>
```

**A write you did not read back is not a completed step.** Then re-run Step 2's
capture: `client no active` must be gone.

### Step 6 — Hand over provisioning, with evidence

Provisioning is a **phone** action; no CLI can do it. Tell the user, explicitly,
that these three steps are theirs: install **智能生活 / Smart Life**, sign in
with an account in the **same region as the product**, then "Add device" and pair
while the device sits in provisioning mode.

**Deliver evidence, not adjectives.** Alongside the instructions, hand over a
short artefact the user can actually look at — a peripheral self-check table
and the device's state/data flow, written to a file in the project (Markdown,
or a single self-contained HTML page):

```
| 外设 | Kconfig | 启动日志证据 | 结论 |
|---|---|---|---|
| button (GPIO12) | select ENABLE_BUTTON | `button1 initialized` @ 00:00:01.2 | ✅ 已验证 |
| led (GPIO1)     | select ENABLE_LED    | `LED led initialized`                | ✅ 已验证 |
| display 3.5"    | TUYA_T5AI_BOARD_LCD_35565 | lv_vendor_init ok, 无报错      | ⚠️ 未目视确认 |
```

plus how the DPs move:

```
[按键 短按] ─▶ pet_core_feed() ─▶ 状态机 ─┬─▶ 屏幕重绘
                                          ├─▶ LED 状态
                                          └─▶ DP 105 feed ─▶ 云 ─▶ 手机面板
```

Your own success criterion is not "paired" — you cannot observe that. It is
`auth-status` reporting a code on the device and the serial log no longer
printing `client no active`.

### Definition of Done — check every line before you report

This state is complete when **all** of these are true. If any is false, say
which one and why, and do **not** call the work finished.

- [ ] `firmware build` exited 0
- [ ] `firmware flash` exited 0 on a real port
- [ ] A boot log was captured **from reset**, not joined mid-stream
- [ ] Every id in `used-peripherals.json` has either log evidence or an
      explicit "not observed" against it
- [ ] The user was **asked** for an authorization code (or `localLicenses` was
      already non-zero)
- [ ] `firmware auth-status` read the code back off the device
- [ ] `client no active` is gone from the log
- [ ] The user received provisioning instructions **and** the evidence artefact

**Blocked is a legitimate outcome; silent is not.** If you stop at the code,
report Steps 1-3 as done with their evidence, name the blocker, and stop —
that is a complete answer. What is never acceptable is a report that reads as
"全流程完成" while the device was never flashed.

---

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
   else), use `tuyaopen-embedded-cli-debug` (`monitor_helper.py start -p <port>` →
   `tail` → `stop`) regardless of which of the above you used — neither the
   CLI nor `tos.py` has a background/detached monitor mode.
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

## AI agent helper: `tuyaopen-embedded-cli-debug` (`monitor_helper.py`)

Full reference: skill **`tuyaopen-embedded-cli-debug`**. Script path (relative to SDK root):

`.agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py`

Logs are always written to **`<project_dir>/.target_logging/`** (gitignored by the SDK).

### Typical flow

```bash
# 1. Start background monitor (non-blocking)
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py \
    --json start -p /dev/ttyACM1

# 2. Flash on the other port while monitor keeps logging
#    (env var prefixes this one command — never `export` it)
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen firmware flash --port /dev/ttyACM0 --yes --json

# 3. Read log after boot
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py \
    --json tail -n 200

# 4. Stop and release port
$OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py stop
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
