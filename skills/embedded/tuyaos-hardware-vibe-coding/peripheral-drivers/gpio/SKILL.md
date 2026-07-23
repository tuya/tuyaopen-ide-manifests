---
name: tuyaos/gpio
description: >-
  TuyaOS on-chip GPIO via tkl_gpio: output, input, edge IRQ.
  GPIO、引脚、电平、中断、tkl_gpio、拉高拉低。
when_to_use: >-
  Use for raw digital pins on TuyaOS. For catalogued LED/button product logic,
  still use tkl_gpio unless the app already has a higher helper.
id: tuyaos-gpio
surfaces: [embedded]
tags: [gpio, tuyaos, tkl_gpio]
---

# TuyaOS GPIO (`tkl_gpio`)

**Demo:** `apps/tuyaos_demo_examples/src/examples/driver_gpio/example_driver_gpio.c`

## Confirm first

- Output pin / input pin / IRQ pin numbers (`TUYA_GPIO_NUM_x`) — platform-specific.
- Pull mode and IRQ edge (rise/fall).

## Minimal pattern

```c
#include "tuya_cloud_types.h"
#include "tal_log.h"
#include "tkl_gpio.h"

/* TODO: set pins for THIS board */
#define GPIO_OUT_PIN   TUYA_GPIO_NUM_15
#define GPIO_IN_PIN    TUYA_GPIO_NUM_17
#define GPIO_IRQ_PIN   TUYA_GPIO_NUM_9

static void gpio_irq_cb(void *args)
{
    (void)args;
    /* keep short — IRQ context */
}

void app_gpio_init(void)
{
    TUYA_GPIO_BASE_CFG_T out_cfg = {
        .mode = TUYA_GPIO_PUSH_PULL,
        .direct = TUYA_GPIO_OUTPUT,
        .level = TUYA_GPIO_LEVEL_LOW,
    };
    tkl_gpio_init(GPIO_OUT_PIN, &out_cfg);
    tkl_gpio_write(GPIO_OUT_PIN, TUYA_GPIO_LEVEL_HIGH);

    TUYA_GPIO_BASE_CFG_T in_cfg = {
        .mode = TUYA_GPIO_PULLUP,
        .direct = TUYA_GPIO_INPUT,
    };
    tkl_gpio_init(GPIO_IN_PIN, &in_cfg);

    TUYA_GPIO_LEVEL_E lvl;
    tkl_gpio_read(GPIO_IN_PIN, &lvl);

    tkl_gpio_init(GPIO_IRQ_PIN, &in_cfg);
    TUYA_GPIO_IRQ_T irq = {
        .mode = TUYA_GPIO_IRQ_FALL,
        .cb = gpio_irq_cb,
        .arg = NULL,
    };
    tkl_gpio_irq_init(GPIO_IRQ_PIN, &irq);
    tkl_gpio_irq_enable(GPIO_IRQ_PIN);
}
```

## API

| Function | Role |
|----------|------|
| `tkl_gpio_init(pin, &cfg)` | mode / direct / level |
| `tkl_gpio_write` / `tkl_gpio_read` | level out/in |
| `tkl_gpio_irq_init` / `_enable` / `_disable` | edge IRQ |
| `tkl_gpio_deinit` | release |

## Notes

- Pin numbers **differ per chip/board** — never copy demo pins blindly.
- Also see software I2C under the same demo folder (`example_driver_sw_i2c.c`).
