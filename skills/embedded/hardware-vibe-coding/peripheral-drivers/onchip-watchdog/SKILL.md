---
name: tuyaopen/onchip-watchdog
description: >-
  On-chip watchdog timer for TuyaOpen using the tkl_watchdog API: init with a
  timeout, then refresh ("feed") periodically so the MCU doesn't reset.
  看门狗、watchdog、喂狗、复位保护、超时复位、tkl_watchdog、防死机。
when_to_use: >-
  Use when the user wants a hardware watchdog: auto-reset the MCU if the
  firmware hangs, by feeding it on a healthy heartbeat.

id: onchip-watchdog
surfaces: [embedded]
tags: [watchdog, wdt, reset, on-chip, tkl_watchdog]
---

# TuyaOpen On-Chip Watchdog

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_WATCHDOG`. No `app_default.config` change.
- No `board_register_hardware()`. Call `tkl_watchdog_*` directly. There is a single
  system watchdog (no instance id / pins) — record as `onchip:watchdog` in
  `used-peripherals.json` if you want it on the diagram.

## Init + feed

`tkl_watchdog_init()` returns the **actual** refresh interval the hardware granted
(may differ from what you asked). Refresh **before** that interval elapses, from a
point that only runs when the firmware is healthy.

```c
#include "tal_api.h"
#include "tkl_watchdog.h"

#define WDT_TIMEOUT_MS   10000

void app_watchdog_start(void)
{
    TUYA_WDOG_BASE_CFG_T cfg = { .interval_ms = WDT_TIMEOUT_MS };
    uint32_t actual_ms = tkl_watchdog_init(&cfg);   /* hardware-granted interval */
    PR_NOTICE("watchdog interval = %u ms", actual_ms);
}

/* Call this well within the interval, on your healthy heartbeat (e.g. main loop). */
void app_watchdog_feed(void)
{
    tkl_watchdog_refresh();
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_watchdog_init(&cfg)` | `cfg.interval_ms` = requested timeout. **Returns** the actual granted interval (ms) |
| `tkl_watchdog_refresh()` | Feed the dog — call before the interval expires |
| `tkl_watchdog_deinit()` | Disable the watchdog |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Device keeps resetting | Not feeding in time | Refresh well within the **returned** interval, not the requested one |
| Watchdog never resets a hang | Feeding from a timer/ISR that runs regardless of health | Feed only from a path that stops when the app hangs (main loop) |
| Reset during long blocking op | Interval shorter than the operation | Increase `interval_ms`, or feed inside the long op at safe points |

## Reference example

SDK: `examples/peripherals/watchdog/` (init with timeout, periodic refresh).
