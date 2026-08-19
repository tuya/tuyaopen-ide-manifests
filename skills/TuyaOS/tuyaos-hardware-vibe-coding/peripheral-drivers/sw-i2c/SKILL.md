---
name: tuyaos/sw-i2c
description: >-
  TuyaOS software (bit-bang) I2C built on tkl_gpio, from driver_gpio demo.
  软件I2C、bit-bang、tdd_sw_i2c、GPIO模拟I2C。
when_to_use: >-
  Use when hardware I2C is unavailable or user wants GPIO-bitbang I2C on TuyaOS.
id: tuyaos-sw-i2c
surfaces: [embedded]
tags: [i2c, sw-i2c, gpio, tuyaos]
---

# TuyaOS Software I2C

**Demo:** `…/examples/driver_gpio/example_driver_sw_i2c.c` + `tdd_sw_i2c.c/.h`

## APIs

| Function | Role |
|----------|------|
| `tdd_sw_i2c_init(port, i2c_pin)` | bind SCL/SDA GPIOs |
| `tdd_sw_i2c_xfer(port, msg)` | transfer |
| `tdd_sw_i2c_deinit(port)` | release |

Uses `tkl_gpio_*` underneath. Copy the demo files into the app (or link sources
via `local.mk`) and set SCL/SDA pins for the board.

Prefer **hardware I2C** (`i2c/SKILL.md`) when the SoC port is free.
