---
name: tuyaos/timer
description: >-
  TuyaOS hardware timer via tkl_timer: init, start, stop, callback.
  硬件定时器、tkl_timer、周期回调。
when_to_use: >-
  Use for TuyaOS hardware timer / periodic IRQ-style callbacks.
id: tuyaos-timer
surfaces: [embedded]
tags: [timer, tuyaos, tkl_timer]
---

# TuyaOS Timer (`tkl_timer`)

**Demo:** `…/examples/driver_timer/example_driver_timer.c`

## Pattern

```c
#include "tkl_timer.h"
#include "tkl_output.h"

#define TIMER_ID     0
#define DELAY_TIME   1000  /* unit per demo/platform */

static void timer_cb(void *args)
{
    (void)args;
    tkl_log_output("\r\n------------- Timer Callback --------------\r\n");
    tkl_timer_stop(TIMER_ID);
    tkl_timer_deinit(TIMER_ID);
}

void app_timer_start(void)
{
    TUYA_TIMER_BASE_CFG_T cfg = {
        .mode = TUYA_TIMER_MODE_PERIOD, /* verify enum in demo */
        .cb = timer_cb,
        .args = NULL,
    };
    tkl_timer_init(TIMER_ID, &cfg);
    tkl_timer_start(TIMER_ID, DELAY_TIME);
}
```

## API

| Function | Role |
|----------|------|
| `tkl_timer_init` | bind callback/mode |
| `tkl_timer_start` | arm |
| `tkl_timer_stop` / `tkl_timer_deinit` | stop/release |

Keep callbacks short; defer heavy work to a thread (`tal_thread_*`).
