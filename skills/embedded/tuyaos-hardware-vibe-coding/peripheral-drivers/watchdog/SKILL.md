---
name: tuyaos/watchdog
description: >-
  TuyaOS watchdog via tal_watchdog (demo: os_watchdog).
  看门狗、喂狗、tal_watchdog、防死机。
when_to_use: >-
  Use when adding / feeding a watchdog on TuyaOS firmware.
id: tuyaos-watchdog
surfaces: [embedded]
tags: [watchdog, tuyaos, tal_watchdog]
---

# TuyaOS Watchdog (`tal_watchdog`)

**Demo:** `…/examples/os_watchdog/example_os_watchdog.c`

TuyaOS examples use **`tal_watchdog_*`**, not the TuyaOpen `tkl_watchdog_*` card.

## Pattern

```c
#include "tal_watchdog.h"
#include "tal_log.h"

void example_feed_watchdog(void)
{
    OPERATE_RET rt = tal_watchdog_refresh();
    if (rt != OPRT_OK) {
        TAL_PR_ERR("watchdog refresh failed %d", rt);
    }
}
```

## Notes

- Init/start APIs may already run in system bring-up — read the full demo and
  platform docs before adding a second init.
- Feed from a healthy path only (main loop / dedicated thread), never from a
  path that can hang while still feeding.
