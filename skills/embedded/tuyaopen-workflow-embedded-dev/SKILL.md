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
  analysis, or an iterative debug cycle. **Also the entry point for any
  peripheral request** — display / screen / LCD, button, LED, camera, audio,
  touch, sensor, UART, GPIO, I2C, SPI, PWM, ADC: it takes the hardware step
  first, then delegates to the peripheral doc. On-screen UI work — LVGL
  widgets, fonts, images, blank-box CJK problems, the host SDL2 preview — comes
  in here too. Also covers code formatting and clang-format checks on the
  firmware sources.
  嵌入式开发阶段的完整工作流：从产品 DP 到可运行固件（工程/项目结构在内），再让设备上线。含硬件选型
  与引脚预算、Kconfig、代码生成、编译、烧录、授权码、配网的状态机，以及
  编译—烧录—监控—分析闭环与日志/错误码分析。**任何外设需求也从这里进** ——
  屏幕、显示、LCD、按键、LED、指示灯、摄像头、音频、录音、触摸、传感器、
  串口、UART、GPIO、I2C、SPI、PWM、ADC、引脚：先走硬件确认这一步，
  再分派到对应的外设文档。加第三方库 / 组件依赖也在这一步。调试与崩溃分析、
  设备授权（UUID / AuthKey）也在本工作流内。屏幕上的 UI —— LVGL 控件、字体、图片、中文显示成方块、
  在电脑上用 SDL2 预览 —— 也从这里进。也覆盖固件源码的代码格式检查（clang-format）。
license: Apache-2.0
compatibility:
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat)
  - Device connected via USB (MCU targets) or native Linux host
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

**First, find out what is already wired up** — an existing project usually has
some of this done, and asking about a peripheral the code already registers
wastes the developer's turn:

```bash
tuyaopen-cli hardware list-used   # what a previous pass CONFIRMED (.tuyaopen/used-peripherals.json)
tuyaopen-cli hardware scan-used   # what source/embedded ACTUALLY registers today
```

The two answer different questions and disagreeing is informative: `list-used`
is the recorded decision, `scan-used` reads the source. A peripheral in the scan
but not the list was added without being recorded; one in the list but not the
scan was planned and never written.

Then, for each DP needing hardware (not already in `architecture.json`), present
available options and ask:

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

### Step 3.5 — Does this plan need specialized reference material? (check BEFORE writing code)

Two areas this phase regularly needs are packaged as sub-references in existing installed skills. Read them on demand:

| If the plan involves… | Read first |
|---|---|
| **A screen** — any LVGL UI, widgets, LVGL Kconfig, images/GIFs, fonts, and above all **Chinese text** | `.agents/skills/tuyaopen-embedded-hardware/references/lvgl/README.md` (`tuyaopen-embedded-hardware`) |
| A third-party (PlatformIO) library — wiring it into CMakeLists.txt / Kconfig | `.agents/skills/tuyaopen-embedded-build/references/cmake-dependencies.md` (`tuyaopen-embedded-build`) |

> **中文显示是本条存在的直接原因。** `LV_FONT_SIMSUN_16_CJK` **不是**中文字体 ——
> 它是 ASCII 加一份**硬编码的 1272 字符表**，表外的字直接不渲染。「温度」「取消」
> 在表里，「设置」「开关」「连接」「亮度」「湿度」不在。你不会看到报错，只会看到
> 空白。写任何中文界面之前先读 `tuyaopen-embedded-hardware` 的 `references/lvgl/development.md`。

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
tuyaopen-cli hardware board-context --project-root <dir> --write --json
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

**Board-specific Kconfig is not guessable — read this board's own configs.**
`tuyaopen-cli hardware board-context` ends with a *Reference configuration in
the SDK* section listing this board's `Kconfig` and every
`examples/**/config/<BOARD>.config`. Those are the SDK's working settings for
this exact board. The one that bites: **LVGL major version.** Some boards pin
v8; writing v9 API (`lv_screen_active()`) against a v8 board fails at compile
time after the whole build. Check the board's `lvgl_demo` config before the
first line of UI code.

**Editor showing `xxx.h: file not found` / `unknown type name` while the build
is fine?** That is IntelliSense with no include paths, not your code. Fix it
once and stop reading around it:

```bash
tuyaopen-cli hardware intellisense --yes   # writes .vscode/c_cpp_properties.json
```

Round 6 spent the whole session treating those as noise. They are, but they are
also two seconds from being gone, and living with them means a real diagnostic
is indistinguishable from the background.

Look up from `platform.json`:
- `peripherals.<name>.tklHeader` → `#include` header path
- `peripherals.<name>.idPrefix` → prefix for port/pin C enums

Generate:
- Hardware init (TAL calls with correct headers and enum IDs)
- DP receive handler for all `selectedDps` IDs
- Hardware → DP feedback after each command
- Cloud connection setup

**Regenerate the DP header before you reference it.** `tuyaopen-cli dp generate`
writes `include/tuya_dp_id.h` from the product's DPs; do not hand-write it.

> `dp generate` and `dp sync` are the **same operation** — both regenerate the
> embedded header and the miniapp schema from the local DP cache, and since
> 2026-08-27 both are ungated (P3). Use either; `generate` is the one this
> workflow's `next_steps` names. They used to differ — `sync` demanded `--yes`
> while `generate` did the identical write with no gate — which made the
> confirmation one command name away from being skipped.

**The cloud half has a reference — use it: [references/CLOUD_DP.md](references/CLOUD_DP.md).**
`dp generate` writes the DP id macros; wiring those ids to `tuya_iot_init` /
`TUYA_EVENT_DP_RECEIVE_OBJ` / `tuya_iot_dp_obj_report` is application code that
nothing generates. That file has the init→start→yield skeleton, the
type→union table for reading a `dp_obj_t`, the report path, and the
`reset_netcfg.h` trap that costs a full toolchain download to discover
(it is app-local to `switch_demo`, not an SDK header).

Solution type from:
  ```
  (snapshot.detail?.data ?? snapshot.detail)?.protocolType
  ```
  If field absent, ask developer.

Entry point: `tuya_app_main()` in `source/embedded/src/tuya_app_main.c`.
Debug output: `PR_DEBUG(fmt, ...)`.

### Step 7 — Update architecture.json and advance the lifecycle

Write new peripherals and modules to `architecture.json surfaces.embedded`. **This is the authoritative in-progress signal.** Write only after Step 6 completes.

Then move the project's recorded phase forward — **with the command, not by
hand-editing the file**:

```bash
tuyaopen-cli project set-status --lifecycle configured --yes
#                     scaffolded → configured → built → flashed
```

`status.json` is what `project info` and `diag doctor` report and what the next
session picks up from, so an unadvanced lifecycle makes a finished step look
unstarted. Beta round 6 hand-wrote both `status.json` and `architecture.json`
while this command existed — hand-editing is how the two drift out of the schema
the readers expect.

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

Delegate to `tuyaopen-embedded-flash`. Pick the port via `tuyaopen-cli firmware
list-ports` (multi-port boards: that command's `hint` tells you how to
disambiguate). Note the default baud can be slow enough to hit the build/flash
timeout on a large image — `--baud 921600` is the usual fix, and
`--timeout <ms>` raises the ceiling.

### Step 2 — Capture a **complete** boot log

A monitor attached to an already-running device joins mid-stream, and
everything that matters — board init, peripheral registration, the first
`client no active` — has already scrolled past. So: **attach first, then reset
the device**, and read from the reset line down.

One command does attach-then-reset in the right order for you:

```bash
tuyaopen-cli firmware monitor --port <log-port> \
    --reset --yes --duration 30 --log-file boot.log --json
```

It opens the port first, restarts the device, and keeps reading — so the log
starts at boot rather than wherever the device happened to be. Read `boot.log`
afterwards; stdout is a single JSON envelope.

The restart is a `sys_reboot` over the device's own CLI, which needs
`tal_cli_init()` in the app (**not** `CONFIG_ENABLE_SERIAL_CLI_CMD` — that
option adds *more* commands; `sys_reboot` ships without it). If no CLI answers,
it falls back to a DTR/RTS pulse and says so on stderr; on a USB-JTAG board that
fallback costs the first ~300 ms of the log. Details and the full command list:
skill `tuyaopen-embedded-cli-debug` § 0.1.

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

Where a peripheral can be driven, **drive it over the device's own console
instead of reflashing**:

```bash
tuyaopen-cli firmware cli --port <port> --command help --quiet --yes
tuyaopen-cli firmware cli --port <port> --command sys_heap --quiet --yes
```

Ask `help` first — it prints what *this* firmware actually registered, which is
the only authoritative list. Measured: 2.2 s for a reply, against 121 s for a
reflash on the same board.

Or ask the user to press the button and tell you what the screen and the LED
did. **A peripheral you did not observe is not verified**, and you must say so
rather than implying it works.

### Flash once, then interrogate — this is a rule, not a suggestion

Beta round 6 spent **38 % of its wall clock in build + flash**: seven flash
cycles at ~121 s each. Most of what those cycles proved could have been asked
of the device that was already running.

**Before you rebuild, ask whether the running device can answer the question.**
The console is chip-independent — `tal_cli` is TuyaOpen's, not the vendor's —
so this works the same on every board.

| Instead of reflashing to check… | Ask the device |
|---|---|
| does the DP path work end to end | `--command "sys_iot_report_dp 101 bool true"` — then watch the panel |
| is there enough heap / did something leak | `--command sys_heap` |
| which thread is near its stack limit | `--command sys_thread` |
| what does it think of the AP | `--command sys_wifi_info` · `sys_wifi_scan` |
| did the setting persist | `--command kv_list` · `kv_get <key>` |
| what firmware is on it right now | `--command version` · `sys_version` |
| is it activated | `--command auth-read` |
| restart it to re-read the boot log | `firmware monitor --reset --yes --duration <s> --log-file boot.log` |

**Two prerequisites, and neither is guessable from a failure** — the console
answers nothing at all rather than erroring:

1. The app must call `tal_cli_init()`. `apps/tuya_cloud/switch_demo`'s skeleton
   does, so a project copied from it has a console; one written from scratch
   does not.
2. Everything past the base eight commands (`help` `cmd` `hello` `version`
   `sys_log_enable` `sys_reboot` `auth` `read_mac`) needs
   `CONFIG_ENABLE_SERIAL_CLI_CMD=y` — that is what adds the whole `sys_*` /
   `fs_*` / `kv_*` set above.

**Turn both on during bring-up**, in the same first build. It costs one Kconfig
line and a call, and it buys back most of the flash cycles for the rest of the
project. Turn the Kconfig off before production. Details: skill
`tuyaopen-embedded-cli-debug` § 0.1.

> `firmware cli` is P2 because it sends an **arbitrary** string — `sys_reboot`,
> `sys_iot_reset`, `kv_del` and `fs_rm` are all reachable through it. `--yes` is
> the whole gate. Use `--quiet` for anything whose reply you need to read, or it
> arrives interleaved with the device's own log flood.

### Step 4 — Authorization code (the FIRST time it is legitimate to ask, and you MUST ask)

Steps 1-3 are done, so the code is now the thing standing between the user and
a working device. **Ask now.** Do not defer it into a final report for the
user to act on alone.

```bash
tuyaopen-cli diag doctor --json          # deviceAuth.localLicenses — 0 means "none stored here"
tuyaopen-cli license list --json
```

If `localLicenses` is 0, ask — and make the ask self-contained, because the
user should not have to go read a skill to answer you. Say all of this:

> 设备已经烧录并跑起来了（附启动日志要点）。要让它连上涂鸦云、能用手机控制，
> 还差一组授权码（UUID + AuthKey）。**这一步只能你来拿**，两条路任选：
> 1. **开发者平台网页** 的产品「设备授权」页申领，导出 xlsx，把文件给我
> 2. 团队已有一批码 → 把那份 xlsx 给我
>
> 拿到文件我用 `tuyaopen-cli license import --xlsx <path>` 导入。只有一对码、
> 没有文件时也可以，走 stdin，不要贴进对话。
>
> 一组码同一时间**只能用在一台设备上**，请确认这组码当前没有被别的设备占用。

Then **stop and wait**. **Nothing issues codes from a command line** — not
`tuyaopen-cli` (whose `license` group only manages the local store) and not the
vendored `tuya-devplat-cli` either. Do not go looking for one, and do not read a
plausible-sounding command name as evidence that the path exists; it does not.
If the user cannot get a code, say exactly where it is stuck (no quota on the
platform / no xlsx to hand) and stop there.
Never invent a UUID, and never leave the device sitting at `client no active`
while reporting success.

Two hard rules, both from `tuyaopen-embedded-device-auth`: read its **§0**
before you ask, and never put an AuthKey on argv where it can be — it goes via
`TUYA_LICENSE_AUTHKEY` or stdin.

### Step 5 — Write it, then read it back

```bash
tuyaopen-cli firmware authorize --port <port> --yes
tuyaopen-cli firmware auth-status --port <port>
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
- [ ] `project set-status --lifecycle flashed --yes` recorded the phase, so the
      next session (and `project info`) sees where this one got to
- [ ] `project info` reports `miniapp.scaffolded: true`, **or** you said in the
      report that the phone panel does not exist yet. A product with firmware
      and no panel is not finished — it is half finished, and the half that is
      missing is the half the user touches

**Writing the report.** Do not hand-assemble the environment facts:

```bash
tuyaopen-cli diag export --out handover.json
```

That is one file with the SDK, toolchain, board, platform, serial and project
state already in it — the same bundle a bug report would carry, and equally the
right attachment for "here is what I built and on what". Round 6 hand-wrote its
own summary of exactly this while the command existed.

**Blocked is a legitimate outcome; silent is not.** If you stop at the code,
report Steps 1-3 as done with their evidence, name the blocker, and stop —
that is a complete answer. What is never acceptable is a report that reads as
"全流程完成" while the device was never flashed.

---

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
