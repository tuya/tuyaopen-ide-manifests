---
name: tuyaopen/peripheral-button
description: >-
  TDL button input handling for TuyaOpen: create button, register event
  callbacks for single click, double click, long press, and multi-click.
  按键、单击、双击、长按、多击、按键事件。
when_to_use: >-
  Use when the user wants to detect button presses: single click,
  double click, long press start/hold, or multi-click events.

id: peripheral-button
surfaces: [embedded]
tags: [button, gpio, input, event]
---

# TuyaOpen TDL Button

## Driver Registration (TDD)

For **board-adapted buttons**, `board_register_hardware()` handles this automatically.

For **custom buttons**, register the driver manually:

```c
#include "tdd_button_gpio.h"

static OPERATE_RET __usr_register_button(void)
{
    BUTTON_GPIO_CFG_T btn_cfg = {
        .pin              = TUYA_GPIO_NUM_17,      // Pins: btn_0=GPIO17
        .level            = TUYA_GPIO_LEVEL_LOW,   // Pins: btn_0=GPIO17(low)
        .mode             = BUTTON_IRQ_MODE,
        .pin_type.irq_edge = TUYA_GPIO_IRQ_FALL,
    };
    return tdd_gpio_button_register(BUTTON_NAME, &btn_cfg);
}
```

GPIO number and active level come from `.tuyaopen/board-context.md` `Pins:` field.

### New Button IC (not in SDK)

If the button requires a custom TDD driver (e.g. capacitive touch key, I2C keypad),
create `tdd_button_<ic>.h/.c` and implement `tdl_button_register()` with the required callbacks.

---

## Headers

```c
#include "tdl_button_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_button_manage.h"

/* Event callback */
static void button_event_cb(char *name, TDL_BUTTON_TOUCH_EVENT_E event, void *argc)
{
    switch (event) {
    case TDL_BUTTON_PRESS_DOWN:         PR_NOTICE("%s: press down", name);    break;
    case TDL_BUTTON_PRESS_UP:           PR_NOTICE("%s: press up", name);      break;
    case TDL_BUTTON_PRESS_SINGLE_CLICK: PR_NOTICE("%s: single click", name);  break;
    case TDL_BUTTON_PRESS_DOUBLE_CLICK: PR_NOTICE("%s: double click", name);  break;
    case TDL_BUTTON_LONG_PRESS_START:   PR_NOTICE("%s: long press", name);    break;
    default: break;
    }
}

void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 4096, (TAL_LOG_OUTPUT_CB)tkl_log_output);

    /* Prerequisite: board_register_hardware() already called */

    TDL_BUTTON_CFG_T button_cfg = {
        .long_start_valid_time     = 3000, // long-press threshold (ms)
        .long_keep_timer           = 1000, // hold repeat interval (ms)
        .button_debounce_time      = 50,   // debounce (ms)
        .button_repeat_valid_count = 2,    // clicks >= 2 trigger REPEAT event
        .button_repeat_valid_time  = 500,  // multi-click window (ms)
    };

    TDL_BUTTON_HANDLE button_hdl = NULL;
    TUYA_CALL_ERR_GOTO(tdl_button_create(BUTTON_NAME, &button_cfg, &button_hdl), EXIT);

    /* Register only the events you need */
    tdl_button_event_register(button_hdl, TDL_BUTTON_PRESS_SINGLE_CLICK, button_event_cb);
    tdl_button_event_register(button_hdl, TDL_BUTTON_LONG_PRESS_START,   button_event_cb);

EXIT:
    return;
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_button_create(name, &cfg, &hdl)` | Create button with timing config |
| `tdl_button_event_register(hdl, event, cb)` | Register callback for one event type |
| `tdl_button_delete(hdl)` | Delete button and release hardware |
| `tdl_button_read_status(hdl, &status)` | Read current state (0=released, 1=pressed) |
| `tdl_button_set_scan_time(ms)` | Set scan interval (default 10 ms) |

## Event Types

| Event | Description |
|-------|-------------|
| `TDL_BUTTON_PRESS_DOWN` | Pressed |
| `TDL_BUTTON_PRESS_UP` | Released |
| `TDL_BUTTON_PRESS_SINGLE_CLICK` | Single click |
| `TDL_BUTTON_PRESS_DOUBLE_CLICK` | Double click |
| `TDL_BUTTON_PRESS_REPEAT` | Multi-click (≥ `button_repeat_valid_count` times) |
| `TDL_BUTTON_LONG_PRESS_START` | Long press start (held ≥ `long_start_valid_time` ms) |
| `TDL_BUTTON_LONG_PRESS_HOLD` | Long press hold (fires every `long_keep_timer` ms) |

## Multiple Buttons

```c
#if defined(BUTTON_NAME_2)
TDL_BUTTON_HANDLE button_hdl_2 = NULL;
tdl_button_create(BUTTON_NAME_2, &button_cfg, &button_hdl_2);
tdl_button_event_register(button_hdl_2, TDL_BUTTON_PRESS_SINGLE_CLICK, button_event_cb);
#endif
```

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_BUTTON=y        # enables button and defines BUTTON_NAME
CONFIG_BUTTON_NAME="button1"  # device name (default "button1")
```

`BUTTON_NAME` is passed to `tdl_button_create()`.
Additional buttons use `BUTTON_NAME_2`, `BUTTON_NAME_3` (requires enabling `ENABLE_BUTTON_2`, etc.).

## Reference Example

`examples/peripherals/button/`
