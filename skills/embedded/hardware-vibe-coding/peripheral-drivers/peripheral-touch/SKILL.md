---
name: tuyaopen/peripheral-touch
description: >-
  TDL touch panel (touchpad) usage for TuyaOpen: discover the touch device,
  poll for touch coordinates, and handle multi-touch points. Touch shares the
  display's device name. 触摸、触摸屏、触控、触点、手势、点击、滑动、touchpad、touch、GT911、GT1151、CST816。
when_to_use: >-
  Use when the user wants to read touch / tap / swipe coordinates from a
  capacitive touch panel, usually paired with a display.

id: peripheral-touch
surfaces: [embedded]
tags: [touch, touchpad, tp, input, coordinates, gesture]
---

# TuyaOpen TDL Touch Panel (TP)

The touch panel is read by **polling** — there is no event callback. Each read
returns the current touch points (multi-touch capable).

> **The touch device reuses the display's name.** It is registered against
> `DISPLAY_NAME`, so you find it with `tdl_tp_find_dev(DISPLAY_NAME)` — not a
> separate "touch" name. Touch therefore requires a display to be configured.

## Driver Registration (TDD)

For **board-adapted touch panels**, `board_register_hardware()` handles this
automatically (e.g. the board registers GT1151 via `tdd_tp_i2c_gt1151_register(DISPLAY_NAME, …)`).
The app only uses the TDL API below.

### New Touch IC (not in SDK)

Common controllers already have TDD drivers: GT911, GT1151, FT6336, CST816x,
CST92xx (`tdd_tp_i2c_<ic>_register()`). For an unsupported IC, create a custom
TDD driver via `usr_board` and register it against `DISPLAY_NAME`.

---

## Headers

```c
#include "tdl_tp_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_tp_manage.h"

#define APP_TP_POINT_MAX  5   /* max simultaneous touch points to read */

static TDL_TP_HANDLE_T s_tp_hdl = NULL;

void app_touch_init(void)
{
    /* Touch shares DISPLAY_NAME — display must be configured first. */
    s_tp_hdl = tdl_tp_find_dev(DISPLAY_NAME);
    if (NULL == s_tp_hdl) {
        PR_ERR("touch device '%s' not found", DISPLAY_NAME);
        return;
    }

    if (OPRT_OK != tdl_tp_dev_open(s_tp_hdl)) {
        PR_ERR("touch open failed");
        return;
    }
}

/* Poll once — call from a task loop (e.g. every 20 ms ≈ 50 Hz). */
void app_touch_poll(void)
{
    TDL_TP_POS_T points[APP_TP_POINT_MAX];
    uint8_t count = 0;

    if (OPRT_OK != tdl_tp_dev_read(s_tp_hdl, APP_TP_POINT_MAX, points, &count)) {
        return;
    }

    for (uint8_t i = 0; i < count; i++) {
        PR_DEBUG("touch[%u] x=%d y=%d", i, points[i].x, points[i].y);
        /* gesture / hit-test logic here */
    }
}
```

Drive `app_touch_poll()` from a task loop:

```c
while (1) {
    app_touch_poll();
    tal_system_sleep(20);   /* ~50 Hz polling */
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_tp_find_dev(name)` | Find the touch device (returns handle or NULL). Use `DISPLAY_NAME`. |
| `tdl_tp_dev_open(hdl)` | Open / power up the touch controller |
| `tdl_tp_dev_read(hdl, max_num, points, &count)` | Read up to `max_num` points; `count` = points currently touched (0 = no touch) |
| `tdl_tp_dev_close(hdl)` | Close the touch device |

## Coordinate struct

```c
typedef struct {
    uint16_t x;
    uint16_t y;
} TDL_TP_POS_T;
```

`count == 0` means no active touch. Coordinates are in the panel's native
resolution (match the display width/height for hit-testing).

## Enable Macro

```
CONFIG_ENABLE_TP=y    # enables the touch panel driver — depends on ENABLE_DISPLAY
```

For **board-adapted touch** the board Kconfig already selects this — do NOT
write it. `ENABLE_TP` requires `ENABLE_DISPLAY`; there is no separate touch
NAME macro — the device uses `DISPLAY_NAME`.

## Reference Example

`examples/peripherals/touch/`, `examples/peripherals/tp/`
