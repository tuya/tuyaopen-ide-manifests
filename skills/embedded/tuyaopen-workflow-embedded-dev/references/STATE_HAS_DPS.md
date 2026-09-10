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

**The cloud half has a reference — use it: [CLOUD_DP.md](CLOUD_DP.md).**
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
