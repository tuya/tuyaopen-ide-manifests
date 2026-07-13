---
name: tuyaopen/usr-board
description: >-
  Add a custom peripheral to a TuyaOpen project without modifying the SDK.
  Creates source/embedded/usr_board/ with usr_board.h and usr_board.c,
  implements usr_register_hardware() for custom TDD driver registration,
  and wires it into the app entry point alongside board_register_hardware().
  自定义外设、新增外设、扩展硬件、usr_board、注册硬件。
when_to_use: >-
  Use when the user needs a peripheral that is NOT listed in
  .tuyaopen/board-context.md (not yet adapted in the board file) and
  needs to add it to the project without touching the TuyaOpen SDK.

id: usr-board
surfaces: [embedded]
tags: [hardware, peripheral, custom, registration, tdd, usr-board]
---

# TuyaOpen Custom Peripheral Registration (usr_board)

When a peripheral is not listed in `.tuyaopen/board-context.md`, add it via the
project-local `usr_board` layer instead of modifying the TuyaOpen SDK.

## Directory Structure

```
source/embedded/
  usr_board/
    usr_board.h     ← public API: declares usr_register_hardware()
    usr_board.c     ← implementation: TDD registration + usr_register_hardware()
  src/
    tuya_main.c     ← call usr_register_hardware() here
  CMakeLists.txt    ← add usr_board sources and include path
```

---

## Step 1: Ask the User for Hardware Info

Before generating any code, ask the user for:
- Peripheral type (display / led-pixel / touchpad / camera / imu …)
- Driver IC model
- Interface (SPI / I2C / GPIO / UART …) and port number
- GPIO pin assignments (role → GPIO number)
- Any timing/config parameters (clk frequency, color order, resolution …)

---

## Step 2: Create `usr_board.h`

```c
/**
 * @file usr_board.h
 * @brief Project-local hardware registration — custom peripherals not covered
 *        by the board BSP. Call usr_register_hardware() once in user_main()
 *        after board_register_hardware().
 */
#ifndef __USR_BOARD_H__
#define __USR_BOARD_H__

#include "tuya_cloud_types.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Register all project-custom hardware peripherals (TDD layer).
 *        Call once in user_main(), after board_register_hardware().
 */
OPERATE_RET usr_register_hardware(void);

#ifdef __cplusplus
}
#endif

#endif /* __USR_BOARD_H__ */
```

---

## Step 3: Create `usr_board.c`

One private `__usr_register_xxx()` function per peripheral, all called by
`usr_register_hardware()`.

```c
/**
 * @file usr_board.c
 * @brief Project-local TDD driver registration for custom peripherals.
 */
#include "tal_api.h"   // TUYA_CALL_ERR_LOG / PR_ERR / OPERATE_RET
#include "usr_board.h"

/* Include TDD headers for each custom peripheral */
// #include "tdd_pixel_ws2812.h"
// #include "tdd_disp_spi_gc9a01.h"
// ...

/* ── Private register functions ─────────────────────────────────────── */

// static OPERATE_RET __usr_register_led_pixel(void) { ... }
// static OPERATE_RET __usr_register_display(void)   { ... }

/* ── Public entry point ──────────────────────────────────────────────── */

OPERATE_RET usr_register_hardware(void)
{
    OPERATE_RET rt = OPRT_OK;

    // TUYA_CALL_ERR_LOG(__usr_register_led_pixel());
    // TUYA_CALL_ERR_LOG(__usr_register_display());

    return rt;
}
```

### Example: adding a WS2812 LED pixel strip

```c
#include "tal_api.h"   // TUYA_CALL_ERR_LOG / PR_ERR
#include "usr_board.h"
#include "tdd_pixel_ws2812.h"

/* GPIO and config values come from the user's hardware info */
#define USR_LED_PIXEL_SPI_PORT   TUYA_SPI_NUM_1

static OPERATE_RET __usr_register_led_pixel(void)
{
    PIXEL_DRIVER_CONFIG_T cfg = {
        .port     = USR_LED_PIXEL_SPI_PORT,
        .line_seq = GRB_ORDER,
    };
    return tdd_ws2812_driver_register("led_pixel", &cfg);
}

OPERATE_RET usr_register_hardware(void)
{
    OPERATE_RET rt = OPRT_OK;
    TUYA_CALL_ERR_LOG(__usr_register_led_pixel());
    return rt;
}
```

For TDD registration APIs of specific drivers, refer to the matching
`peripheral-xxx/SKILL.md` after calling
`usr_register_hardware()` to use the device via TDL.

---

## Step 4: Update `CMakeLists.txt`

File: `source/embedded/CMakeLists.txt`

Add `usr_board` as a source directory and include path:

```cmake
# APP_SRC (existing)
aux_source_directory(${APP_PATH}/src APP_SRC)

# USR_BOARD_SRC (add this)
aux_source_directory(${APP_PATH}/usr_board USR_BOARD_SRC)

# APP_INC — add usr_board to include path
set(APP_INC ${APP_PATH}/include ${APP_PATH}/usr_board)

# target_sources — add USR_BOARD_SRC
target_sources(${EXAMPLE_LIB}
    PRIVATE
        ${APP_SRC}
        ${USR_BOARD_SRC}
    )
```

---

## Step 5: Call in App Entry Point

In `source/embedded/src/tuya_main.c` (or equivalent):

```c
#include "board_com_api.h"
#include "usr_board.h"

void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 4096, (TAL_LOG_OUTPUT_CB)tkl_log_output);

    /* Register board-adapted peripherals (SDK BSP) */
    board_register_hardware();

    /* Register project-custom peripherals */
    usr_register_hardware();

    /* Now use TDL APIs to open and control peripherals */
    // ...
}
```

---

## Step 6: Record the custom peripheral (so it shows in the hardware view)

A usr_board peripheral is **not** in `board.json`, so the Vibe Coding Hardware View
has no node for it unless you record it. Write **both** files:

1. **`.tuyaopen/used-peripherals.json`** — add the device name (the `id` you passed
   to `tdd_*_register("<id>", …)`) to `peripherals`, same as any confirmed peripheral.
2. **`.tuyaopen/custom-peripherals.json`** — full-overwrite with one descriptor per
   custom peripheral. This is what draws the extra node **and** marks its GPIOs as
   occupied in the pin table:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-01-01T00:00:00Z",
  "source": "vibe",
  "peripherals": [
    {
      "id": "usr_ext_led",
      "devName": "External LED",
      "category": "led",
      "interface": "GPIO",
      "model": "GPIO LED",
      "pins": [{ "role": "led", "gpio": 28 }],
      "source": "vibe"
    }
  ]
}
```

| Field | Meaning |
|-------|---------|
| `id` | The registered device name — **must match** the `tdd_*_register("<id>", …)` name and the id in used-peripherals.json |
| `devName` | **Short** human label for the diagram node (≤ ~16 chars). A plain noun like `External LED`, `WS2812 strip`, `IR blaster`. **Do NOT** put the GPIO number in it (`GPIO47 LED` ✗) and **do NOT** repeat the `model`/IC (`WS2812 strip WS2812` ✗) — the node shows only this label, so keep it clean |
| `category` | Peripheral type (`led` / `display` / `leds-pixel` / `ir` / `joystick` / …) — sets the node icon/type |
| `interface` | The **real bus** the TDD driver uses: `GPIO` / `SPI` / `I2C` / `UART` / `PWM` / `RMT` / … — **not** `CUSTOM`. This is the diagram's connection-line label + color, so it must be the actual driver bus (a `tdd_led_gpio_register` LED → `GPIO`; a WS2812 driven over SPI → `SPI`) |
| `model` | Driver IC / part only (e.g. `WS2812`, `GC9307`), or `null` for a plain GPIO part — not a description |
| `pins` | `[{ "role": "<role>", "gpio": <n> }]` — every GPIO the device occupies; drives pin-table occupancy |
| `source` | `"vibe"` |

Full-overwrite the file with the **complete** custom set each time (all customs the
project uses, not just this turn's) — it is a snapshot, not a diff.

---

## Adding More Peripherals Later

To add another custom peripheral, only touch `usr_board.c`:

1. Add the TDD header `#include "tdd_xxx.h"`
2. Add a private `static OPERATE_RET __usr_register_xxx(void) { … }`
3. Call it inside `usr_register_hardware()`

`usr_board.h` does not change — the public interface stays stable.

---

## New Chip Driver File Location

If the SDK has no existing TDD driver for the target IC, create the driver
files **inside `source/embedded/usr_board/`** alongside `usr_board.c`.

**Naming convention**: `tdd_usr_<driver>_<ic>.h` / `tdd_usr_<driver>_<ic>.c`

```
source/embedded/usr_board/
  usr_board.h                   ← unchanged (public API)
  usr_board.c                   ← call tdd_usr_xxx_register() from __usr_register_xxx()
  tdd_usr_disp_gc9307.h         ← new driver header
  tdd_usr_disp_gc9307.c         ← new driver implementation
```

No new CMakeLists entry is needed — `aux_source_directory(${APP_PATH}/usr_board ...)`
already picks up all `.c` files in the directory.

For implementation details of the TDD driver (callbacks, config structs, register
function), refer to the matching peripheral skill:
- Display: `peripheral-display/SKILL.md` → *New Display IC*
- Camera: `peripheral-camera/SKILL.md` → *New DVP Camera IC*

> **ESP32 exception:** the `source/embedded/usr_board/` location above only works for
> drivers that use the tkl/tdd abstraction (plain GPIO / I2C / PWM / ADC, e.g.
> `tdd_led_gpio_register`, `tdd_gpio_button_register`). A custom driver that needs the
> **ESP-IDF** SDK (a display panel via `esp_lcd`, an audio codec via `esp_codec_dev`, a
> camera, a touch controller, raw esp-idf SPI/QSPI) canNOT live in `usr_board/` on ESP32
> — see the next section.

---

## ESP32: esp-idf-backed custom drivers → `esp_components/`, NOT `usr_board/`

Check the platform first: read `.tuyaopen/ide/platform.json`. This section applies **only
when the target is an ESP32 family chip** (`esp32` / `esp32s3` / `esp32c3` / `esp32c6` /
`esp32p4`). On other platforms use the normal `usr_board/` path above.

**Why.** On ESP32 the TuyaOpen build is two-stage: `usr_board/`, the app, and the SDK core
are compiled into a "prebuilt library" stage that sees **only** the tkl/tal/tdl abstraction
headers — it **cannot `#include` or link any ESP-IDF API** (`esp_lcd_*`, `esp_codec_dev`,
`driver/*`, esp-idf SPI/QSPI, camera, touch). Such a driver put in `usr_board/` fails to
compile. ESP-IDF is only reachable from an esp-idf **component**.

**Decision rule (ESP32):**
- Driver uses only tkl/tdd generic drivers (GPIO/I2C/PWM/ADC LED, button, …) → keep the
  normal `usr_board/` path above; it works on ESP32 too.
- Driver needs an ESP-IDF API → make it a drop-in esp-idf **component** under
  `source/embedded/esp_components/<name>/`.

### Layout

```
source/embedded/esp_components/<name>/
  <name>.c            ← the driver; may #include esp_lcd_*, esp_codec_dev, driver/*,
                        AND TuyaOpen headers (tkl/tal/tdl, e.g. tkl_gpio.h, tal_api.h)
  <name>.h            ← declares your register entry, e.g. int <name>_register(void);
  CMakeLists.txt
```

### `CMakeLists.txt` (both lines are required)

```cmake
idf_component_register(
    SRCS "<name>.c"
    INCLUDE_DIRS "."
    REQUIRES tuyaos_adapter esp_lcd driver)   # tuyaos_adapter ⇒ TuyaOpen headers;
                                               # add each ESP-IDF component your driver #includes
# Force this leaf component onto the final link line AND keep its symbols. Nothing in the
# IDF graph REQUIREs it and the app that calls it is a prebuilt lib outside the graph, so
# without this its archive is dropped → "undefined reference".
idf_component_set_property(${COMPONENT_NAME} WHOLE_ARCHIVE ON)
```

- `REQUIRES tuyaos_adapter` makes ALL TuyaOpen public headers resolvable (tkl/tal/tdl,
  including the umbrella `tal_api.h`). Add every ESP-IDF component your driver includes
  (`esp_lcd`, `driver`, `esp_codec_dev`, `esp_lcd_touch_*`, …).
- `WHOLE_ARCHIVE ON` is **mandatory** here (see keep-alive below).

### Register + call it (keep-alive — mandatory)

`WHOLE_ARCHIVE` puts the archive on the link line, but ESP32 builds with
`-ffunction-sections -Wl,--gc-sections`, so an **un-referenced** symbol is still stripped.
So you MUST also **call** the driver's register function from the app:

1. In `usr_board.c`, add `extern int <name>_register(void);` and call it from
   `usr_register_hardware()`. (An `extern` decl needs no include-path wiring; the symbol is
   resolved at the final link from the component's archive.)
2. `usr_register_hardware()` is already called from `user_main()` (see Step 5).

Matrix (verified): `WHOLE_ARCHIVE` + called → linked ✓; `WHOLE_ARCHIVE` + never called →
gc-stripped ✗; no `WHOLE_ARCHIVE` + called → `undefined reference` ✗. You need **both**.

### No SDK / env / Kconfig edits

The TuyaOpen CLI auto-discovers `<app>/esp_components/*` for ESP32 builds (each subdir
becomes one esp-idf component). Do **not** touch `platform/ESP32/**`, `main`, Kconfig, or
any config key. Just create the folder.

### Driver body

Write the driver against the **ESP-IDF API** (e.g. `esp_lcd_new_panel_io_spi()` +
`esp_lcd_new_panel_*()` for a display, `esp_codec_dev_*` for audio). For reference
implementations of the same peripheral class on ESP32, look at the board drivers under the
SDK's `boards/ESP32/common/{lcd,audio,tp,camera}/` — mirror their ESP-IDF usage. If the SDK
already ships a driver there for your exact IC and the **board** registers it, it is
board-adapted (in `board-context.md`) and you need no custom component at all.

### Record it

Same as Step 6 above — add the device to `used-peripherals.json` and
`custom-peripherals.json` so it shows in the Hardware View and reserves its pins.
