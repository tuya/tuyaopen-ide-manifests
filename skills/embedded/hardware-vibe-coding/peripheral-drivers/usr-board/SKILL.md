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
