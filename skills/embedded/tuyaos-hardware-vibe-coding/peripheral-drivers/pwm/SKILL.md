---
name: tuyaos/pwm
description: >-
  TuyaOS PWM via tkl_pwm: init, start, duty/freq update, stop.
  PWM、调光、蜂鸣器、舵机、tkl_pwm。
when_to_use: >-
  Use for TuyaOS PWM output (LED dimming, buzzer, servo-style duty).
id: tuyaos-pwm
surfaces: [embedded]
tags: [pwm, tuyaos, tkl_pwm]
---

# TuyaOS PWM (`tkl_pwm`)

**Demo:** `…/examples/driver_pwm/example_driver_pwm.c`

## Confirm first

- PWM id and pin. Demo notes: if pin→pwm mapping is unclear, use
  `tkl_io_pin_to_func` in platform `tkl_pinmux` (when available).

## Pattern

```c
#include "tkl_pwm.h"
#include "tal_log.h"

#define PWM_ID  0

void app_pwm_start(void)
{
    TUYA_PWM_BASE_CFG_T pwm_cfg = {0};
    /* frequency / duty / polarity — copy fields from demo for this SDK */
    if (tkl_pwm_init(PWM_ID, &pwm_cfg) != OPRT_OK) {
        TAL_PR_ERR("pwm init fail");
        return;
    }
    tkl_pwm_start(PWM_ID);

    /* update duty/freq at runtime */
    tkl_pwm_info_set(PWM_ID, &pwm_cfg);
}

void app_pwm_stop(void)
{
    tkl_pwm_stop(PWM_ID);
}
```

## API

| Function | Role |
|----------|------|
| `tkl_pwm_init` / `tkl_pwm_start` / `tkl_pwm_stop` | lifecycle |
| `tkl_pwm_info_set` | update params |
| `tkl_pwm_frequency_set` | if implemented on platform |
