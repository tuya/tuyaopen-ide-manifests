---
name: tuyaopen/hardware-vibe-coding
description: >-
  Hardware-aware code generation workflow for TuyaOpen embedded projects.
  Reads .tuyaopen/board-context.md, confirms peripheral selection with user,
  checks Kconfig, then delegates to the appropriate peripheral skill.
  外设初始化、硬件驱动、Vibe Coding、使用外设、硬件相关代码。
when_to_use: >-
  Use when the user asks to use or initialize any hardware peripheral,
  or for any hardware-related code generation. This is the entry point
  that routes to specific peripheral skills (display, camera, button, LED, etc).

id: hardware-vibe-coding
surfaces: [embedded]
tags: [hardware, peripheral, vibe-coding, routing]
---

# TuyaOpen Hardware Vibe Coding

## Architecture

TDD (driver registration) → TDL (device management) → App (business logic).

**Do not write TDD code.** `board_register_hardware()` already does this.

---

## Step 1: Read Hardware Context

Read `.tuyaopen/board-context.md`. Field reference:

| Field | Meaning |
|-------|---------|
| `## <type>` | Peripheral type |
| `## group — <id>` | Multi-peripheral accessory / configuration |
| `### type — name` | Member inside a group |
| `ID:` | Stable instance id — record this in used-peripherals.json (Step 5) |
| `Kconfig:` | Board-level config options — write these to `app_default.config` to activate the peripheral/group |
| `Driver:` | Driver IC model |
| `Interface:` | Hardware interface and port |
| `Pins:` | GPIO assignments: `role=GPIOx` |
| `Note:` | Bus sharing, init order, etc. |

---

## Step 2: Confirm Hardware Selection

**STOP — do not write any code until the user has confirmed.**

- **Single instance, no groups** → proceed.
- **Multiple instances of the same type, or any `## group — <id>`** → MUST ask:

> "Board has multiple `<type>` options. Which one?
> 1. <name/group> — <brief description>
> 2. ..."

Wait for reply. Use `### type — name` entries inside the chosen group for pin/config details.
The group's `Devices:` line tells you how many logical devices to register.

- **Not in board-context.md at all** → ask for interface and GPIO details.

---

## Step 3: Check Kconfig

**Board-adapted peripherals (listed in board-context.md)**:

- **`Kconfig:` field** — write these values to `app_default.config`. These are
  board-level config options that must be explicitly selected by the project.
- **Driver-enable macros** (`ENABLE_DISPLAY`, `DISPLAY_NAME`, etc.) — already
  selected by the board Kconfig internally. Do NOT write these.

**New custom peripherals (not in board-context.md, added via usr_board)** — you
may need to enable the peripheral in `app_default.config`, e.g. `CONFIG_ENABLE_DISPLAY=y`.
Check the matching peripheral skill for the correct macro.

Never write platform-level macros (`CONFIG_ENABLE_SPI`, `CONFIG_ENABLE_I2C`,
`CONFIG_ENABLE_GPIO`) — those are selected by the platform/board Kconfig.

---

## Step 4: Delegate to Peripheral Skill

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

---

## Step 5: Record Used Peripherals

After writing the code, **full-overwrite** `.tuyaopen/used-peripherals.json` so the
Hardware IO diagram in Project Details highlights the exact devices this project uses.

- `peripherals` = the **`ID:` values** from board-context.md for the specific
  instances you wrote code for (e.g. `display-rgb-main`, `camera`). Use the
  **confirmed instance**, not every option of that type — if the board has
  several displays and the user chose the 3.5" LCD, list only that one's ID.
- List **all** instances the project currently uses, not just this turn's
  additions (it is a full snapshot, not a diff).
- For a custom peripheral added via usr-board with no board-context.md `ID:`,
  use its `usr_board` device name as the id.

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-01-01T00:00:00Z",
  "source": "vibe",
  "peripherals": ["display-rgb-main", "camera"]
}
```

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
