---
name: tuyaopen-embedded-hardware
description: Hardware-aware code generation for TuyaOpen embedded projects. Reads the project's confirmed hardware via `tuyaopen-cli
  hardware list-used`/`board-context` (backed by .tuyaopen/used-peripherals.json + .tuyaopen/board-context.md), confirms the
  selection with the user, records it BEFORE writing code via `tuyaopen-cli hardware set-used`, then delegates to the matching
  peripheral sub-skill. 外设初始化、硬件驱动、Vibe Coding、使用外设、硬件相关代码、点灯、点亮 LED、按键、 屏幕、显示、摄像头、音频、录音、播放、触摸、打印、红外、摇杆、灯带、串口、UART、 GPIO、PWM、I2C、SPI、ADC、传感器、引脚、片上外设、发送数据、读取传感器、
  tuyaopen-cli hardware set-used/list-used/board-context。
license: Apache-2.0
compatibility:
- tuyaopen CLI, either form — see skill `tuyaopen-start` § 1 (for `tuyaopen-cli hardware`/`boards`)
metadata:
  version: 2.1.2
  owner: embedded-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
---
# TuyaOpen Hardware Vibe Coding

## Shortcuts — `tuyaopen-cli hardware` / `tuyaopen-cli boards`

The `tuyaopen-cli hardware` group covers exactly the file reads/writes Steps
1–4 below describe — use it instead of reading/writing the JSON by hand where
it applies:

| Intent | Command |
|---|---|
| Read the confirmed hardware (Step 1 input) | `tuyaopen-cli hardware list-used --project-root <project>` |
| Render the board catalog index (Step 1's `board-context.md`) | `tuyaopen-cli hardware board-context --project-root <project>` (add `--write` to persist it) |
| Render the compact confirmed-hardware context block (what the host inlines into vibe prompts) | `tuyaopen-cli hardware confirmed-context --project-root <project>` |
| Record the confirmed selection (Step 3) — **device peripherals and plain-string on-chip ids only** | `tuyaopen-cli hardware set-used --project-root <project> --ids <id1,id2,...> --source vibe` |
| Reverse-derive used peripherals from already-authored source (code written outside vibe coding) | `tuyaopen-cli hardware scan-used --project-root <project>` |
| (Re)write `.vscode/c_cpp_properties.json` for the project's platform/SDK | `tuyaopen-cli hardware intellisense --project-root <project>` |
| Browse the **published board catalog** (used by `project create --board`, not this project's board) | `tuyaopen-cli boards list` / `tuyaopen-cli boards detail --id <id>` |

> **No CLI?** No `tos.py` equivalent for `hardware`/`boards` — hand-read /
> hand-write `.tuyaopen/used-peripherals.json` and `.tuyaopen/board-context.md`
> directly, exactly as Steps 1–4 below describe. See skill `tuyaopen-start`
> § 7.

All `hardware` subcommands are read-only except `set-used` and `intellisense`
(both **P2** — need `--yes`, or `--dry-run` to
preview; see skill `tuyaopen-start` § 4).

**⚠ `hardware set-used --ids` cannot record on-chip pin occupancy.** Verified
against `src/cli/commands/hardware.ts` + `src/core/hardware/usedPeripherals.ts`:
`--ids` writes a flat list of bare-string ids only. Step 3 below requires an
**object** form for on-chip entries — `{ "id": "onchip:uart2", "pins": [...] }`
— so the Hardware IO diagram can mark the occupied GPIOs; the CLI command has
no flag for that shape. When any confirmed peripheral is on-chip with pins to
record, skip `hardware set-used` and full-overwrite
`.tuyaopen/used-peripherals.json` directly with a file-write tool, exactly as
Step 3 describes. `hardware set-used` is safe to use only when every id in the
set is a bare device/on-chip id with no pins to record.

`hardware board-context`/`confirmed-context` read `.tuyaopen/ide/board.json`
for **this project's already-selected board** — they are unrelated to
`tuyaopen-cli boards list/detail`, which reads the **published manifest
catalog** (the same one `tuyaopen-cli project create --board <id>` picks from).
Don't confuse the two: a custom board you add via skill `tuyaopen-embedded-add-board`
will never show up in `tuyaopen-cli boards list` — that command doesn't read the
SDK's `boards/` source tree at all.

Full flags: `tuyaopen-cli hardware --help` / `tuyaopen-cli schema get --group
hardware --command <cmd>` — don't hardcode the flag list here (skill
`tuyaopen-start` § 5).

## Architecture

TDD (driver registration) → TDL (device management) → App (business logic).

`board_register_hardware()` registers **only the device peripherals the board
already adapted** — the ones listed in `board-context.md`. For those, do not
write TDD code. Any peripheral the user **attaches themselves** (not in
`board-context.md`) you must register yourself in **`usr_board`**, **even when
the SDK already ships its TDD driver** — you just call that existing driver with
your pins. Writing a brand-new TDD driver (IC with no SDK driver) is only a
sub-case of `usr_board`, never the trigger for it. On-chip peripherals are the
other exception (call `tal_*`/`tkl_*` directly). See Rules.

## Read these files first (your hardware context)

This skill is the authority. Read these yourself before doing anything:

1. **`.tuyaopen/used-peripherals.json`** — the **already-confirmed** hardware
   (device `ID:`s and/or `onchip:<type><n>`s). This is your **INPUT**: generate
   code for exactly these. Empty/missing → nothing confirmed yet.
2. **`.tuyaopen/board-context.md`** — a slim **index** of the board's **device**
   peripherals (display/camera/led/button/audio/touch/printer/…): each device's
   `ID:`, enable `Kconfig:`, grouping, and per-group registration semantics. Raw
   per-device data (pins / driver IC / resolution / timing) is **not** here —
   read it from `.tuyaopen/ide/board.json` (the same JSON, full detail).
3. **`.tuyaopen/ide/platform.json` → `peripherals`** — **on-chip** support + specs
   (uart/gpio/pwm/i2c/spi/qspi/adc/timer/watchdog/rtc/dma2d/vad/kws). For each type:
   - **`enabled`** — does this SoC support it. If **`false`**, do NOT generate code
     for it; tell the user it's unsupported on this platform.
   - **`count`** + **`spec`** — instance count and valid config (ports, pins, ranges,
     enums). Read these instead of hardcoding; values differ per platform.
   Consult before writing any on-chip code.
4. **`.tuyaopen/ide/board.json` → `expansionPins`** — the **only pins the developer
   may freely wire** (the board's broken-out pins), each with the `functions` it can mux
   to (`GPIO`, `UART2_TX`, `I2C1_SCL`, …). This — **not** the full SoC pinout — is the
   basis for "available pins". **Empty/absent → the board is sealed: there are NO free
   pins**; you can only use already-wired onboard peripherals.

## Rules (must follow)

- **Confirm before code (hard gate).** Generate code ONLY for hardware listed in
  `used-peripherals.json`. If the request needs something not yet confirmed, or the
  catalog has multiple matches / any `## group —`, **ASK the user which one and
  wait** — never auto-pick. When asking the user to choose, **prefer an interactive
  multiple-choice prompt if your tooling supports one** (otherwise list the options as text).
- **Record before code.** As soon as the selection is settled, **full-overwrite**
  `used-peripherals.json` (Step 3) BEFORE writing any code; update it if the set changes.
- **Pick user-peripheral pins from `expansionPins` only.** When you choose a pin for a
  user/on-chip peripheral or a usr_board device, pick a `gpio` from
  `board.json.expansionPins` whose `functions` include the role you need (e.g. a UART2
  TX pin must list `UART2_TX`; a plain output needs `GPIO`). Never pick a pin that is not
  in `expansionPins` — it isn't physically accessible. If `expansionPins` is empty/absent,
  tell the user the board exposes no free pins and you cannot wire an external peripheral.
- **"串口 / serial / UART" is ambiguous → ASK first.** It may mean the debug/log
  console (`PR_*` — often a USB-serial the PC already sees; **no** peripheral, nothing
  recorded) OR a dedicated user UART (`tal_uart` on its own instance + pins —
  `onchip:uart<N>`). Do NOT assume `PR_*`; ask which before writing code.
- **Where a device peripheral registers — decide by ADAPTATION, not by "does
  the SDK have a driver".** A catalogued device peripheral **in
  `board-context.md`** is board-adapted → `board_register_hardware()` registers
  it; write no TDD code and no `CONFIG_ENABLE_*`. A device peripheral the user
  **attaches externally** (NOT in `board-context.md`) → you register it yourself
  in **`usr_board`**, reusing the SDK's existing TDD driver (e.g. an extra GPIO
  button → call `tdd_gpio_button_register` from `usr_register_hardware()`). The
  SDK shipping the driver does **not** mean `board_register_hardware()` wires
  *your* hardware — it only wires what the board adapted. **Rule of thumb: any
  peripheral you wire on yourself goes through `usr_board`.**
- **Device vs on-chip.** A part with a TDD/TDL driver (button, led, display,
  audio, touch, …) is a **device** — even on a plain GPIO pin — so it follows
  the device path above (board-adapted → `board_register_hardware()`; external →
  `usr_board`), **not** the raw on-chip path. Only truly raw on-chip use (pin
  level toggle, edge IRQ, raw uart/i2c/spi/pwm/adc) calls `tal_*`/`tkl_*`
  directly with **no** registration and **no** `CONFIG_ENABLE_*`. (A GPIO button
  is a device, not raw on-chip GPIO.)
- Never write platform-level macros (`CONFIG_ENABLE_SPI` / `_I2C` / `_GPIO`).

---

## Step 1: Read the hardware context

Read the files above (`tuyaopen-cli hardware list-used`/`board-context`/
`confirmed-context` from the Shortcuts table read the same data without a raw
file read). `board-context.md` is the slim **index**; its fields:

| Field | Meaning |
|-------|---------|
| `## group — <id>` | A multi-peripheral accessory / board configuration |
| `Kconfig:` (under a group) | Group-level config to write to `app_default.config` to activate the whole group |
| `Devices:` (under a group) | Registration semantics — how many logical devices to register (shared bus → 1) |
| `Note:` (under a group) | Bus sharing, init order, etc. |
| `- <type> — <name> (ID: <id>) · <interface>` | One device. `ID:` is the key you record in used-peripherals.json (Step 3) |
| `Kconfig:` (indented under a device) | That device's enable macro(s) to write to `app_default.config` |
| `## Ungrouped devices` | Devices that belong to no group |

**Per-device pins, driver IC, resolution and timing are NOT in board-context.md**
— look the device up by its `ID:` in
`.tuyaopen/ide/board.json` (`peripheralPatterns.<type>[]`, matched on `id`) and read
`pins` / `model` / `width`×`height` there. (The enable `Kconfig:` is already in the index above.)

---

## Step 2: Confirm Hardware Selection

**STOP — do not write any code until the user has confirmed.**

- **Single instance, no groups** → proceed.
- **Multiple instances of the same type, or any `## group — <id>`** → MUST ask:

> "Board has multiple `<type>` options. Which one?
> 1. <name/group> — <brief description>
> 2. ..."

Wait for reply. The group's `Devices:` line tells you how many logical devices to
register; look up each member's `ID:` in `.tuyaopen/ide/board.json` for pin/config details.

- **Not in board-context.md at all** → ask for interface and GPIO details.

---

## Step 3: Record the Confirmed Hardware (before writing code)

The confirmed selection is the **input** to code generation, not an afterthought.
**As soon as the peripheral selection is settled (Step 2) — and BEFORE writing any
code — full-overwrite** `.tuyaopen/used-peripherals.json` with the confirmed set.
Steps 4–5 then generate code for exactly those instances.

`tuyaopen-cli hardware set-used --ids <comma-list> --source vibe` does this
overwrite when every confirmed id is a bare device/on-chip id with no pins to
record. The moment any on-chip entry needs its `pins` recorded (see the
bullet below), fall back to a direct file write — the CLI shortcut cannot
express that shape (see the ⚠ in *Shortcuts* above).

- `peripherals` = the **`ID:` values** from board-context.md for the confirmed
  instances (e.g. `display-rgb-main`, `camera`). Use the **confirmed instance**,
  not every option of that type — if the board has several displays and the user
  chose the 3.5" LCD, list only that one's ID.
- List **all** instances the project will use (already-used + this turn's), not
  just this turn's additions — it is a full snapshot, not a diff.
- For a custom peripheral added via usr-board with no board-context.md `ID:`,
  use its `usr_board` device name as the id. **Also** record it in
  `.tuyaopen/custom-peripherals.json` (id + category + pins) so the hardware view
  draws a node for it and marks its GPIOs — see `usr-board/SKILL.md` Step 6.
- **On-chip peripherals** use `onchip:<type><n>` (e.g. `onchip:uart2`). Record them as
  an **object with the pins your code occupies** so the diagram can mark those GPIOs:
  `{ "id": "onchip:uart2", "pins": [{"role":"tx","gpio":41},{"role":"rx","gpio":40}] }`.
  (A bare string `"onchip:uart2"` is allowed but won't show pin occupancy.)
- If the set changes while you are writing code, **update this file again** so it
  always matches what the code targets.

This file drives the Vibe Coding Hardware View diagram in Project Details, and on
later turns the host feeds it back to you as the **confirmed hardware context** —
so getting it right here is what lets you skip re-confirming next time.

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-01-01T00:00:00Z",
  "source": "vibe",
  "peripherals": [
    "display-rgb-main",
    "camera",
    { "id": "onchip:uart2", "pins": [{ "role": "tx", "gpio": 41 }, { "role": "rx", "gpio": 40 }] }
  ]
}
```

---

## Step 4: Check Kconfig

**Board-adapted peripherals (listed in board-context.md)**:

- **Kconfig to activate** — write the `Kconfig:` shown in board-context.md to
  `app_default.config`: the group-level `Kconfig:` for a group, or the device's
  own indented `Kconfig:` for a standalone device.
- **Driver-enable macros** (`ENABLE_DISPLAY`, `DISPLAY_NAME`, etc.) — already
  selected by the board Kconfig internally. Do NOT write these.

**New custom peripherals (not in board-context.md, added via usr_board)** — you
may need to enable the peripheral in `app_default.config`, e.g. `CONFIG_ENABLE_DISPLAY=y`.
Check the matching peripheral skill for the correct macro.

Never write platform-level macros (`CONFIG_ENABLE_SPI`, `CONFIG_ENABLE_I2C`,
`CONFIG_ENABLE_GPIO`) — those are selected by the platform/board Kconfig.

---

## Step 5: Delegate to Peripheral Skill (generate code)

| Type | Skill file |
|------|-----------|
| `display` | `references/peripherals/peripheral-display.md` |
| `camera`  | `references/peripherals/peripheral-camera.md`  |
| `button`  | `references/peripherals/peripheral-button.md`  |
| `led`     | `references/peripherals/peripheral-led.md`     |
| `audio`   | `references/peripherals/peripheral-audio.md`   |
| `touchpad` / `touch` | `references/peripherals/peripheral-touch.md` |
| `printer` | `references/peripherals/peripheral-printer.md` |
| `ir` / infrared / remote | `references/peripherals/peripheral-ir.md` |
| `joystick` / rocker | `references/peripherals/peripheral-joystick.md` |
| `leds-pixel` / WS2812 / addressable strip | `references/peripherals/peripheral-leds-pixel.md` |

The last three (ir / joystick / leds-pixel) are commonly **custom peripherals**
not present in board-context.md — register them via the `usr-board` flow and
add the matching `CONFIG_ENABLE_*` macro to `app_default.config`.

Not in board-context.md → `references/peripherals/usr-board.md`.

### On-chip peripherals (SoC buses/pins — not catalogued device parts)

For raw on-chip use (serial data, pin toggling, PWM, bus access, analog read).
These call `tal_*` / `tkl_*` directly — **no** `board_register_hardware()`, **no**
`CONFIG_ENABLE_*` (platform-selected). Confirm the instance + pins and record as
`onchip:<type><n>` in `used-peripherals.json`.

| Type | Skill file |
|------|-----------|
| `uart` / serial (user serial, **not** PR_* logging) | `references/peripherals/onchip-uart.md` |
| `gpio` / pin level / edge IRQ | `references/peripherals/onchip-gpio.md` |
| `pwm` / dimming / buzzer / servo | `references/peripherals/onchip-pwm.md` |
| `i2c` / `iic` / sensor bus | `references/peripherals/onchip-i2c.md` |
| `spi` bus master | `references/peripherals/onchip-spi.md` |
| `qspi` / quad-SPI (raw; catalogued QSPI LCD → display skill) | `references/peripherals/onchip-qspi.md` |
| `adc` / analog read / voltage | `references/peripherals/onchip-adc.md` |
| `timer` / hardware timer / periodic callback | `references/peripherals/onchip-timer.md` |
| `watchdog` / `wdt` / feed dog | `references/peripherals/onchip-watchdog.md` |
| `rtc` / real-time clock | `references/peripherals/onchip-rtc.md` |
| `dma2d` / pixel-format convert / fast blit | `references/peripherals/onchip-dma2d.md` |
| `vad` / voice activity (speech vs silence) | `references/peripherals/onchip-vad.md` |
| `kws` / wake word / keyword spotting | `references/peripherals/onchip-kws.md` |

**Serial "hello world" is ambiguous — ask first, don't auto-pick.** "用串口发 X" can
mean the debug/log console (`PR_*`, often a USB-serial the PC already sees — no
peripheral, nothing recorded) OR a dedicated user UART (`tal_uart` on its own
instance + pins — `onchip-uart`, a confirmed peripheral). Ask which before coding.

---

## Code Organisation

- New feature → new `source/embedded/src/app_<feature>.c` + `app_<feature>.h`
- `tuya_app_main.c` only adds `#include` + one call — no logic inline
- `src/` is auto-scanned by CMake, no CMakeLists change needed

## Entry Point

`board_register_hardware()` is declared in **`board_com_api.h`** — always include
it (not `board_register.h` / `board_register_hardware.h`, which do not exist).
`tal_api.h` covers `tal_log_init` / `tal_sw_timer_init` / `tal_workq_init`;
`tkl_output.h` provides `tkl_log_output`.

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "board_com_api.h"   // board_register_hardware()
#include "app_xxx.h"

void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 4096, (TAL_LOG_OUTPUT_CB)tkl_log_output);
    tal_sw_timer_init();   // before any tdl_*_open()
    tal_workq_init();
    board_register_hardware();
    app_xxx_init();
}
```

## Coding Style

POSIX C: `static void`, `const int` — never `STATIC`, `VOID`, `CONST`.
SDK typedefs in uppercase are fine (`OPERATE_RET`, `TDL_LED_HANDLE_T`).

## Not in scope

Adding a new board (BSP), building/flashing, and anything not about
peripheral/pin code generation on an already-selected board — not in scope
here, see skill `tuyaopen-start`'s routing table (`references/ROUTING.md`).
