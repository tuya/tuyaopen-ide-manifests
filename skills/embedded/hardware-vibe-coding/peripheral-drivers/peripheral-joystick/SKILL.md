---
name: tuyaopen/peripheral-joystick
description: >-
  TDL analog joystick usage for TuyaOpen: register a 2-axis ADC joystick with a
  push button, receive direction + button events via callback, and read raw or
  calibrated X/Y values. 摇杆、手柄、方向、上下左右、joystick、rocker、双轴、ADC摇杆、方向键。
when_to_use: >-
  Use when the user wants a 2-axis analog joystick / thumbstick: direction
  events (up/down/left/right), the integrated push button, or raw X/Y readings.

id: peripheral-joystick
surfaces: [embedded]
tags: [joystick, rocker, adc, input, direction, button]
---

# TuyaOpen TDL Joystick

A joystick = a 2-axis ADC stick **plus** a push button. The TDL layer reuses the
button event model and adds 8 directional events. Events arrive via callback;
analog position is read on demand.

> **Usually a custom peripheral.** Unless the board adapts a joystick, register
> the driver yourself (button GPIO + ADC channels for X/Y) and add
> `CONFIG_ENABLE_JOYSTICK=y` to `app_default.config`.

## Driver Registration (TDD)

```c
#include "tdd_joystick.h"

static OPERATE_RET app_joystick_register(void)
{
    JOYSTICK_GPIO_CFG_T hw = {
        .btn_pin            = TUYA_GPIO_NUM_12,   // push-button pin
        .level              = TUYA_GPIO_LEVEL_LOW,
        .pin_type.gpio_pull = TUYA_GPIO_PULLUP,
        .adc_num            = TUYA_ADC_NUM_0,
        .adc_ch_x           = 0,                  // ADC channel for X axis
        .adc_ch_y           = 1,                  // ADC channel for Y axis
        .adc_cfg = {
            .ch_list.data = (1 << 0) | (1 << 1),
            .ch_nums      = 2,
            .width        = 12,
            .mode         = TUYA_ADC_CONTINUOUS,
            .type         = TUYA_ADC_INNER_SAMPLE_VOL,
        },
    };
    return tdd_joystick_register(JOYSTICK_NAME, &hw);
}
```

GPIO / ADC numbers come from `.tuyaopen/ide/board.json` (or the user) for a
custom build.

---

## Headers

```c
#include "tdl_joystick_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_joystick_manage.h"

static TDL_JOYSTICK_HANDLE s_js_hdl = NULL;

static void app_joystick_cb(char *name, TDL_JOYSTICK_TOUCH_EVENT_E event, void *argc)
{
    switch (event) {
    case TDL_JOYSTICK_UP:                    PR_NOTICE("up");           break;
    case TDL_JOYSTICK_DOWN:                  PR_NOTICE("down");         break;
    case TDL_JOYSTICK_LEFT:                  PR_NOTICE("left");         break;
    case TDL_JOYSTICK_RIGHT:                 PR_NOTICE("right");        break;
    case TDL_JOYSTICK_BUTTON_PRESS_SINGLE_CLICK: PR_NOTICE("click");   break;
    default: break;
    }
}

void app_joystick_init(void)
{
    app_joystick_register();                 /* TDD register (see above) */

    TDL_JOYSTICK_CFG_T cfg = {
        .button_cfg = {
            .long_start_valid_time     = 3000,
            .long_keep_timer           = 1000,
            .button_debounce_time      = 50,
            .button_repeat_valid_count = 2,
            .button_repeat_valid_time  = 50,
        },
        .adc_cfg = {
            .adc_max_val      = 8192,        /* full-scale ADC reading */
            .adc_min_val      = 0,
            .normalized_range = 10,          /* calibrated X/Y → ±10 */
            .sensitivity      = 2,           /* must be < normalized_range */
        },
    };

    if (OPRT_OK != tdl_joystick_create(JOYSTICK_NAME, &cfg, &s_js_hdl)) {
        PR_ERR("joystick create failed");
        return;
    }

    /* Register only the events you need. */
    tdl_joystick_event_register(s_js_hdl, TDL_JOYSTICK_UP,    app_joystick_cb);
    tdl_joystick_event_register(s_js_hdl, TDL_JOYSTICK_DOWN,  app_joystick_cb);
    tdl_joystick_event_register(s_js_hdl, TDL_JOYSTICK_LEFT,  app_joystick_cb);
    tdl_joystick_event_register(s_js_hdl, TDL_JOYSTICK_RIGHT, app_joystick_cb);
    tdl_joystick_event_register(s_js_hdl, TDL_JOYSTICK_BUTTON_PRESS_SINGLE_CLICK, app_joystick_cb);
}

/* Read analog position on demand. */
void app_joystick_read(void)
{
    int x = 0, y = 0;
    tdl_joystick_calibrated_xy(s_js_hdl, &x, &y);   /* normalized ±range */
    PR_DEBUG("joystick x=%d y=%d", x, y);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdd_joystick_register(name, &gpio_cfg)` | Register joystick hardware (button GPIO + ADC) |
| `tdl_joystick_create(name, &cfg, &hdl)` | Create joystick with button + ADC config |
| `tdl_joystick_event_register(hdl, event, cb)` | Register a callback for one event |
| `tdl_joystick_get_raw_xy(hdl, &x, &y)` | Read raw ADC X/Y |
| `tdl_joystick_calibrated_xy(hdl, &x, &y)` | Read normalized X/Y (±`normalized_range`) |
| `tdl_joystick_read_status(hdl, &status)` | Read button state |
| `tdl_joystick_set_scan_time(ms)` | Scan interval (default 10 ms) |
| `tdl_joystick_delete(hdl)` | Delete and release hardware |

## Event Types (`TDL_JOYSTICK_TOUCH_EVENT_E`)

| Group | Events |
|-------|--------|
| Direction | `TDL_JOYSTICK_UP` / `_DOWN` / `_LEFT` / `_RIGHT` |
| Direction (held) | `TDL_JOYSTICK_LONG_UP` / `_LONG_DOWN` / `_LONG_LEFT` / `_LONG_RIGHT` |
| Button | `TDL_JOYSTICK_BUTTON_PRESS_DOWN` / `_PRESS_UP` / `_PRESS_SINGLE_CLICK` / `_PRESS_DOUBLE_CLICK` / `_PRESS_REPEAT` / `_LONG_PRESS_START` / `_LONG_PRESS_HOLD` |

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_JOYSTICK=y          # enables the joystick subsystem (custom peripheral)
CONFIG_JOYSTICK_NAME="joystick"   # device name passed to register + create
```

`JOYSTICK_NAME` is passed to both `tdd_joystick_register()` and `tdl_joystick_create()`.

## Reference Example

`examples/peripherals/joystick/`
