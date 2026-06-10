---
name: tuyaopen/onchip-gpio
description: >-
  On-chip GPIO for TuyaOpen using the tkl_gpio API: configure a pin as
  output/input, read/write level, and register edge interrupts.
  GPIO、引脚、电平、输入输出、中断、tkl_gpio、拉高拉低、读引脚。
when_to_use: >-
  Use when the user wants raw digital pin control: drive a pin high/low,
  read a pin level, or trigger on a rising/falling edge. For a catalogued
  LED/button device, use the led/button peripheral skill instead.

id: onchip-gpio
surfaces: [embedded]
tags: [gpio, pin, input, output, interrupt, on-chip]
---

# TuyaOpen On-Chip GPIO

## On-chip — no Kconfig, no TDD

- Provided by the platform. **Do NOT** write `CONFIG_ENABLE_GPIO` — platform-selected. No `app_default.config` change needed.
- No `board_register_hardware()` step. Call `tkl_gpio_*` directly with `TUYA_GPIO_NUM_<n>`.
- Confirm **which GPIO** and its direction with the user; record it in `used-peripherals.json` as `onchip:gpio<n>` (see `hardware-vibe-coding`).
- **Do not reuse a pin already taken** by a confirmed peripheral — check the pin-occupancy summary in the hardware context first.

## Platform spec — read, don't hardcode

Valid pins/modes for THIS board are in `.tuyaopen/ide/platform.json` →
`peripherals.gpio.spec`: `pins` (usable GPIOs), `mode` (allowed pull/drive modes),
`irq.triggers` + `irq.pins` (which pins support edge IRQ). The enum names below are
SDK-wide, but the **pin set differs per platform**.

`pins` / `irq.pins` are **inclusive `[start,end]` range pairs** (multi-segment),
e.g. `[[0,55]]` = GPIO0–55, or `[[0,9],[12,55]]` = 0–9 and 12–55 (10–11 excluded).
Check the user's pin falls inside one of the ranges (and inside `irq.pins` for an
interrupt).

## Output + input + IRQ

```c
#include "tal_api.h"
#include "tkl_gpio.h"

#define OUT_PIN   TUYA_GPIO_NUM_1
#define IN_PIN    TUYA_GPIO_NUM_6
#define IRQ_PIN   TUYA_GPIO_NUM_7

static void gpio_irq_cb(void *args) { /* keep short — runs in IRQ context */ }

void app_gpio_init(void)
{
    /* Output */
    TUYA_GPIO_BASE_CFG_T out_cfg = {
        .mode = TUYA_GPIO_PUSH_PULL, .direct = TUYA_GPIO_OUTPUT, .level = TUYA_GPIO_LEVEL_LOW };
    tkl_gpio_init(OUT_PIN, &out_cfg);
    tkl_gpio_write(OUT_PIN, TUYA_GPIO_LEVEL_HIGH);

    /* Input (pull-up) */
    TUYA_GPIO_BASE_CFG_T in_cfg = { .mode = TUYA_GPIO_PULLUP, .direct = TUYA_GPIO_INPUT };
    tkl_gpio_init(IN_PIN, &in_cfg);
    TUYA_GPIO_LEVEL_E lvl;
    tkl_gpio_read(IN_PIN, &lvl);

    /* Falling-edge interrupt */
    tkl_gpio_init(IRQ_PIN, &in_cfg);
    TUYA_GPIO_IRQ_T irq = { .mode = TUYA_GPIO_IRQ_FALL, .cb = gpio_irq_cb, .arg = NULL };
    tkl_gpio_irq_init(IRQ_PIN, &irq);
    tkl_gpio_irq_enable(IRQ_PIN);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_gpio_init(pin, &cfg)` | `cfg.mode` (`TUYA_GPIO_PUSH_PULL` / `TUYA_GPIO_PULLUP` / `TUYA_GPIO_PULLDOWN` / `TUYA_GPIO_HIGH_IMPEDANCE`), `cfg.direct` (`TUYA_GPIO_OUTPUT` / `TUYA_GPIO_INPUT`), `cfg.level` |
| `tkl_gpio_write(pin, level)` | `TUYA_GPIO_LEVEL_HIGH` / `TUYA_GPIO_LEVEL_LOW` |
| `tkl_gpio_read(pin, &level)` | Read current level |
| `tkl_gpio_irq_init(pin, &irq)` | `irq.mode` (`TUYA_GPIO_IRQ_RISE` / `_FALL` / `_LOW` / `_HIGH`), `irq.cb`, `irq.arg` |
| `tkl_gpio_irq_enable(pin)` / `tkl_gpio_irq_disable(pin)` | Enable/disable the IRQ |
| `tkl_gpio_deinit(pin)` | Release the pin |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Output level doesn't change | Pin in input mode / wrong `direct` | Set `.direct = TUYA_GPIO_OUTPUT` |
| Floating input reads random | No pull configured | Use `TUYA_GPIO_PULLUP` / `TUYA_GPIO_PULLDOWN` |
| IRQ never fires | Forgot `tkl_gpio_irq_enable` | Enable after `tkl_gpio_irq_init` |
| Pin conflicts with a device | Reused a confirmed peripheral's GPIO | Pick a free pin per the pin-occupancy summary |

## Reference example

SDK: `examples/peripherals/gpio/` (output toggle, pull-up input read, falling-edge IRQ).
