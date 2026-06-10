---
name: tuyaopen/onchip-timer
description: >-
  On-chip hardware timer for TuyaOpen using the tkl_timer API: periodic or
  one-shot callback at a microsecond interval.
  硬件定时器、定时器、周期回调、定时中断、tkl_timer、微秒定时、单次定时。
when_to_use: >-
  Use when the user wants a hardware timer: a periodic or one-shot callback at
  a precise interval. For simple software timeouts inside TDL flows use
  tal_sw_timer instead (see the hardware-vibe-coding entry skill).

id: onchip-timer
surfaces: [embedded]
tags: [timer, hardware-timer, interrupt, on-chip, tkl_timer]
---

# TuyaOpen On-Chip Hardware Timer

## Hardware timer vs software timer

- **`tkl_timer`** (this skill) — a real **hardware** timer: precise, fires in
  **ISR context**, microsecond resolution. Use for exact periodic sampling, signal
  generation, tight timing.
- **`tal_sw_timer`** — software timers (what TDL/flash/blink use). For ordinary
  app timeouts/delays prefer those; they run in task context, not ISR.

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_TIMER`. No `app_default.config` change.
- No `board_register_hardware()`. Call `tkl_timer_*` directly with `TUYA_TIMER_NUM_<n>`.
- Confirm **which timer id** with the user; record as `onchip:timer<n>` in `used-peripherals.json`.

## Platform spec — read, don't hardcode

`.tuyaopen/ide/platform.json` → `peripherals.timer.spec`: `ids` (which timer ids
exist), `mode` (valid modes), `bits` (counter width). Pick an id from `ids`.

## Init + start

```c
#include "tal_api.h"
#include "tkl_timer.h"

#define APP_TIMER_ID   TUYA_TIMER_NUM_0
#define PERIOD_US      1000000          /* 1 s */

/* Runs in ISR context — keep it short, no blocking calls. */
static void app_timer_cb(void *args)
{
    /* set a flag / post to a workqueue; do not block here */
}

void app_timer_init(void)
{
    TUYA_TIMER_BASE_CFG_T cfg = {
        .mode = TUYA_TIMER_MODE_PERIOD,   /* or TUYA_TIMER_MODE_ONCE */
        .cb   = app_timer_cb,
        .args = NULL,
    };
    tkl_timer_init(APP_TIMER_ID, &cfg);
    tkl_timer_start(APP_TIMER_ID, PERIOD_US);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_timer_init(id, &cfg)` | `cfg.mode` (`TUYA_TIMER_MODE_PERIOD` / `_ONCE`), `cfg.cb` (ISR callback `void(void*)`), `cfg.args` |
| `tkl_timer_start(id, us)` | Start; period/delay in **microseconds** |
| `tkl_timer_stop(id)` | Stop (re-startable) |
| `tkl_timer_get_current_value(id, &us)` | Remaining/elapsed value in µs |
| `tkl_timer_get(id, &us)` | Read configured period |
| `tkl_timer_deinit(id)` | Release the timer |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Callback never fires | Forgot `tkl_timer_start` | Start after init |
| Fires once then stops | `TUYA_TIMER_MODE_ONCE` | Use `_PERIOD` for repeating |
| Crash / watchdog in callback | Blocking/long work in ISR | Set a flag; do work in a task / workqueue |
| Period wrong | `us` is microseconds, not ms | 1 ms = 1000 µs |

## Reference example

SDK: `examples/peripherals/timer/` (periodic timer init, start, callback).
