---
name: tuyaopen/onchip-pwm
description: >-
  On-chip PWM for TuyaOpen using the tkl_pwm API: init a PWM channel with
  frequency + duty, start/stop, and change duty at runtime.
  PWM、脉宽调制、占空比、调光、蜂鸣器、舵机、呼吸灯、tkl_pwm。
when_to_use: >-
  Use when the user wants a PWM signal: dimming, buzzer tone, servo angle,
  motor speed, or breathing-light brightness on a PWM channel.

id: onchip-pwm
surfaces: [embedded]
tags: [pwm, duty, frequency, on-chip, tkl_pwm]
---

# TuyaOpen On-Chip PWM

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_PWM`. No `app_default.config` change needed.
- No `board_register_hardware()`. Call `tkl_pwm_*` directly with `TUYA_PWM_NUM_<n>`.
- Confirm **which PWM channel** (and its output pin) with the user; record as `onchip:pwm<n>` in `used-peripherals.json`. Don't reuse a confirmed peripheral's pin.
- **Pins:** each PWM channel has a **fixed** output pin (`spec.channels[].pin`) — pick the channel for the pin you want. There is **no** `tkl_io_pinmux_config` for PWM.

## Platform spec — read, don't hardcode (channel ↔ pin is fixed)

`.tuyaopen/ide/platform.json` → `peripherals.pwm.spec`: `channels[]` maps each PWM
channel `id` to a **fixed output `pin`** — so **pick the channel whose `pin` is the
one you want; there is no pin mux for PWM**. `duty` range (e.g. 0–10000) and `freq`
range come from `spec.duty` / `spec.freq` — read them, don't assume.

## Init + start + change duty

```c
#include "tal_api.h"
#include "tkl_pwm.h"

#define PWM_PORT   TUYA_PWM_NUM_0

void app_pwm_init(void)
{
    TUYA_PWM_BASE_CFG_T cfg = {
        .duty      = 5000,              /* 1–10000 → 50.00% */
        .frequency = 1000,             /* Hz */
        .polarity  = TUYA_PWM_POSITIVE,
    };
    tkl_pwm_init(PWM_PORT, &cfg);
    tkl_pwm_start(PWM_PORT);
}

/* Change brightness/duty at runtime (e.g. breathing light) */
void app_pwm_set_duty(uint32_t duty /* 1–10000 */)
{
    TUYA_PWM_BASE_CFG_T cfg = { .duty = duty, .frequency = 1000, .polarity = TUYA_PWM_POSITIVE };
    tkl_pwm_info_set(PWM_PORT, &cfg);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_pwm_init(ch, &cfg)` | `cfg.duty` (1–10000 = 0.01%–100%), `cfg.frequency` (Hz), `cfg.polarity` (`TUYA_PWM_POSITIVE` / `TUYA_PWM_NEGATIVE`) |
| `tkl_pwm_start(ch)` / `tkl_pwm_stop(ch)` | Start / stop output |
| `tkl_pwm_info_set(ch, &cfg)` | Update duty/frequency at runtime |
| `tkl_pwm_deinit(ch)` | Release the channel |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No output | Forgot `tkl_pwm_start` | Start after init |
| Duty seems inverted | Wrong polarity | Flip `TUYA_PWM_POSITIVE` / `_NEGATIVE` |
| Duty out of range | `duty` not in 1–10000 | Clamp to 1–10000 |

## Reference example

SDK: `examples/peripherals/pwm/` (init with duty/frequency/polarity, start).
