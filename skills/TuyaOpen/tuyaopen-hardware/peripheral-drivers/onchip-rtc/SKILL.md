---
name: tuyaopen/onchip-rtc
description: >-
  On-chip RTC for TuyaOpen using the tkl_rtc API: set and get wall-clock time
  as epoch seconds.
  RTC、实时时钟、走时、设置时间、读取时间、tkl_rtc、掉电保持时间。
when_to_use: >-
  Use when the user wants the hardware real-time clock: set or read wall-clock
  time (epoch seconds), e.g. for timestamps.

id: onchip-rtc
surfaces: [embedded]
tags: [rtc, clock, time, on-chip, tkl_rtc]
---

# TuyaOpen On-Chip RTC

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_RTC`. No `app_default.config` change.
- No `board_register_hardware()`. Call `tkl_rtc_*` directly. Single system RTC (no
  instance id / pins) — record as `onchip:rtc` in `used-peripherals.json` if wanted.

## Set / get time

Time is **epoch seconds** (`TIME_T` = `unsigned int`). The RTC keeps running once
set; on a board without a battery-backed RTC the value is lost on power-down, so
set it from a trusted source (e.g. SNTP / user input) after boot.

```c
#include "tal_api.h"
#include "tkl_rtc.h"

void app_rtc_demo(void)
{
    tkl_rtc_init();

    /* set: e.g. 2026-01-01 00:00:00 UTC = 1767225600 */
    tkl_rtc_time_set((TIME_T)1767225600);

    TIME_T now = 0;
    tkl_rtc_time_get(&now);
    PR_NOTICE("rtc now = %u", (unsigned)now);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_rtc_init()` | Initialise the RTC |
| `tkl_rtc_time_set(time_sec)` | Set wall-clock time (`TIME_T` epoch seconds) |
| `tkl_rtc_time_get(&time_sec)` | Read current time into a `TIME_T` |
| `tkl_rtc_deinit()` | Release the RTC |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Time resets to 0 after reboot | No battery-backed RTC on this board | Re-set from SNTP / user after each boot |
| Time drifts | RTC crystal tolerance | Periodically re-sync from a trusted source |
| Get returns garbage | Read before `tkl_rtc_init` / before any set | Init first, set a known time before reading |

## Reference example

No dedicated SDK example; API is `tkl_rtc.h` (`tkl_rtc_init/time_set/time_get/deinit`).
