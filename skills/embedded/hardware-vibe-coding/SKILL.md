---
name: tuyaopen/hardware-vibe-coding
description: >-
  Hardware-aware code generation for TuyaOpen embedded projects. Reads the
  project's confirmed hardware (.tuyaopen/used-peripherals.json) + board catalog
  (.tuyaopen/board-context.md), confirms the selection with the user, records it
  BEFORE writing code, then delegates to the matching peripheral sub-skill.
  外设初始化、硬件驱动、Vibe Coding、使用外设、硬件相关代码、点灯、点亮 LED、按键、
  屏幕、显示、摄像头、音频、录音、播放、触摸、打印、红外、摇杆、灯带、串口、UART、
  GPIO、PWM、I2C、SPI、ADC、传感器、引脚、片上外设、发送数据、读取传感器。
when_to_use: >-
  Use for ANY hardware / peripheral / pin request on a TuyaOpen board — using or
  initializing a peripheral, serial / UART, GPIO, PWM, I2C, SPI, ADC, display,
  camera, button, LED, audio, touch, sensor, or any "make the hardware do X" task.
  Load this skill FIRST; it is the entry point that reads the project's confirmed
  hardware, enforces confirm-before-code, and routes to the specific peripheral
  sub-skill. 任何涉及硬件/外设/引脚/串口的需求都先加载本 skill。

id: hardware-vibe-coding
surfaces: [embedded]
tags: [hardware, peripheral, vibe-coding, routing]
---

# TuyaOpen Hardware Vibe Coding

## Architecture

TDD (driver registration) → TDL (device management) → App (business logic).

**Do not write TDD code** for device peripherals — `board_register_hardware()`
already does this. (On-chip peripherals and usr_board customs are the exception —
see Rules.)

## Read these files first (your hardware context)

This skill is the authority. Read these yourself before doing anything:

1. **`.tuyaopen/used-peripherals.json`** — the **already-confirmed** hardware
   (device `ID:`s and/or `onchip:<type><n>`s). This is your **INPUT**: generate
   code for exactly these. Empty/missing → nothing confirmed yet.
2. **`.tuyaopen/board-context.md`** — a slim **index** of the board's **device**
   peripherals (display/camera/led/button/audio/touch/printer/…): each device's
   `ID:`, how they're grouped, and per-group registration semantics. Raw
   per-device data (pins / driver IC / Kconfig macro / resolution) is **not** here —
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
- **Device vs on-chip.** Device peripherals (catalog) → auto-registered by
  `board_register_hardware()`; never write `CONFIG_ENABLE_*`. On-chip
  (uart/gpio/pwm/i2c/spi/adc) → call `tal_*`/`tkl_*` directly; **no** `CONFIG_ENABLE_*`,
  **no** `board_register_hardware()`.
- Never write platform-level macros (`CONFIG_ENABLE_SPI` / `_I2C` / `_GPIO`).

---

## Step 1: Read the hardware context

Read the files above. `board-context.md` is the slim **index**; its fields:

| Field | Meaning |
|-------|---------|
| `## group — <id>` | A multi-peripheral accessory / board configuration |
| `Kconfig:` (under a group) | Group-level config to write to `app_default.config` to activate the whole group |
| `Devices:` (under a group) | Registration semantics — how many logical devices to register (shared bus → 1) |
| `Note:` (under a group) | Bus sharing, init order, etc. |
| `- <type> — <name> (ID: <id>) · <interface>` | One device. `ID:` is the key you record in used-peripherals.json (Step 3) |
| `## Ungrouped devices` | Devices that belong to no group |

**Per-device pins, driver IC, per-device Kconfig macro, resolution and timing are
NOT in board-context.md** — look the device up by its `ID:` in
`.tuyaopen/ide/board.json` (`peripheralPatterns.<type>[]`, matched on `id`) and read
`pins` / `model` / `kconfig` / `width`×`height` there.

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

- `peripherals` = the **`ID:` values** from board-context.md for the confirmed
  instances (e.g. `display-rgb-main`, `camera`). Use the **confirmed instance**,
  not every option of that type — if the board has several displays and the user
  chose the 3.5" LCD, list only that one's ID.
- List **all** instances the project will use (already-used + this turn's), not
  just this turn's additions — it is a full snapshot, not a diff.
- For a custom peripheral added via usr-board with no board-context.md `ID:`,
  use its `usr_board` device name as the id.
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

- **Kconfig to activate** — for a **group**, write the group's `Kconfig:` (shown in
  board-context.md) to `app_default.config`. For a standalone device, read its
  `kconfig` from `.tuyaopen/ide/board.json` (looked up by `ID:`) and write those.
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
| `display` | `peripheral-drivers/peripheral-display/SKILL.md` |
| `camera`  | `peripheral-drivers/peripheral-camera/SKILL.md`  |
| `button`  | `peripheral-drivers/peripheral-button/SKILL.md`  |
| `led`     | `peripheral-drivers/peripheral-led/SKILL.md`     |
| `audio`   | `peripheral-drivers/peripheral-audio/SKILL.md`   |
| `touchpad` / `touch` | `peripheral-drivers/peripheral-touch/SKILL.md` |
| `printer` | `peripheral-drivers/peripheral-printer/SKILL.md` |
| `ir` / infrared / remote | `peripheral-drivers/peripheral-ir/SKILL.md` |
| `joystick` / rocker | `peripheral-drivers/peripheral-joystick/SKILL.md` |
| `leds-pixel` / WS2812 / addressable strip | `peripheral-drivers/peripheral-leds-pixel/SKILL.md` |

The last three (ir / joystick / leds-pixel) are commonly **custom peripherals**
not present in board-context.md — register them via the `usr-board` flow and
add the matching `CONFIG_ENABLE_*` macro to `app_default.config`.

Not in board-context.md → `peripheral-drivers/usr-board/SKILL.md`.

### On-chip peripherals (SoC buses/pins — not catalogued device parts)

For raw on-chip use (serial data, pin toggling, PWM, bus access, analog read).
These call `tal_*` / `tkl_*` directly — **no** `board_register_hardware()`, **no**
`CONFIG_ENABLE_*` (platform-selected). Confirm the instance + pins and record as
`onchip:<type><n>` in `used-peripherals.json`.

| Type | Skill file |
|------|-----------|
| `uart` / serial (user serial, **not** PR_* logging) | `peripheral-drivers/onchip-uart/SKILL.md` |
| `gpio` / pin level / edge IRQ | `peripheral-drivers/onchip-gpio/SKILL.md` |
| `pwm` / dimming / buzzer / servo | `peripheral-drivers/onchip-pwm/SKILL.md` |
| `i2c` / `iic` / sensor bus | `peripheral-drivers/onchip-i2c/SKILL.md` |
| `spi` bus master | `peripheral-drivers/onchip-spi/SKILL.md` |
| `qspi` / quad-SPI (raw; catalogued QSPI LCD → display skill) | `peripheral-drivers/onchip-qspi/SKILL.md` |
| `adc` / analog read / voltage | `peripheral-drivers/onchip-adc/SKILL.md` |
| `timer` / hardware timer / periodic callback | `peripheral-drivers/onchip-timer/SKILL.md` |
| `watchdog` / `wdt` / feed dog | `peripheral-drivers/onchip-watchdog/SKILL.md` |
| `rtc` / real-time clock | `peripheral-drivers/onchip-rtc/SKILL.md` |
| `dma2d` / pixel-format convert / fast blit | `peripheral-drivers/onchip-dma2d/SKILL.md` |
| `vad` / voice activity (speech vs silence) | `peripheral-drivers/onchip-vad/SKILL.md` |
| `kws` / wake word / keyword spotting | `peripheral-drivers/onchip-kws/SKILL.md` |

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
