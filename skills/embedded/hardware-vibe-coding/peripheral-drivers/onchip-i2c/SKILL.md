---
name: tuyaopen/onchip-i2c
description: >-
  On-chip I2C master for TuyaOpen using the tkl_i2c API: mux SCL/SDA, init
  the bus, and send/receive to a 7-bit slave address.
  I2C、IIC、I2C总线、传感器、SCL、SDA、从机地址、tkl_i2c、读传感器。
when_to_use: >-
  Use when the user wants to talk to an I2C device (sensor, EEPROM, etc.)
  as bus master: send a register/command and read bytes back.

id: onchip-i2c
surfaces: [embedded]
tags: [i2c, iic, sensor, bus, on-chip, tkl_i2c]
---

# TuyaOpen On-Chip I2C (master)

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_I2C`. No `app_default.config` change needed.
- No `board_register_hardware()`. Call `tkl_i2c_*` directly with `TUYA_I2C_NUM_<n>`.
- Confirm **which I2C bus** + **SCL/SDA pins** + the device's **7-bit address** with the user; record as `onchip:i2c<n>` in `used-peripherals.json`.

## Platform spec — read, don't hardcode

`.tuyaopen/ide/platform.json` → `peripherals.i2c.spec`: `ports[].pinGroups` give each
bus's SCL/SDA pin options (single group → default pins, no mux; multiple → pick one
and mux — see below), `speed` the valid bus speeds, `addrWidth` the address widths.
Read these for the chosen bus instead of assuming pins/speeds.

## Init + transfer

**Default case: do NOT call `tkl_io_pinmux_config`.** Use the bus's default SCL/SDA
pins — just `tkl_i2c_init()` and transfer. Add pin mux only when you deliberately
route SCL/SDA to a non-default pin group (and only then `#include "tkl_pinmux.h"`).

```c
#include "tal_api.h"
#include "tkl_i2c.h"

#define I2C_PORT   TUYA_I2C_NUM_0
#define DEV_ADDR   0x44            /* 7-bit slave address */

void app_i2c_init(void)
{
    TUYA_IIC_BASE_CFG_T cfg = {
        .role       = TUYA_IIC_MODE_MASTER,
        .speed      = TUYA_IIC_BUS_SPEED_100K,
        .addr_width = TUYA_IIC_ADDRESS_7BIT,
    };
    tkl_i2c_init(I2C_PORT, &cfg);
}
```

Read a register (write pointer, then repeated-start read):

```c
OPERATE_RET app_i2c_read_reg(uint8_t reg, uint8_t *buf, uint16_t len)
{
    /* write register pointer (no stop), then read */
    OPERATE_RET rt = tkl_i2c_master_send(I2C_PORT, DEV_ADDR, &reg, 1, FALSE);
    if (rt != OPRT_OK) return rt;
    return tkl_i2c_master_receive(I2C_PORT, DEV_ADDR, buf, len, FALSE);
}
```

Alternate pins only (omit entirely for default pins):

```c
#include "tkl_pinmux.h"
tkl_io_pinmux_config(TUYA_IO_PIN_15, TUYA_IIC0_SCL);
tkl_io_pinmux_config(TUYA_IO_PIN_16, TUYA_IIC0_SDA);
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_i2c_init(port, &cfg)` | `cfg.role` (`TUYA_IIC_MODE_MASTER`), `cfg.speed` (`TUYA_IIC_BUS_SPEED_100K` / `_400K`), `cfg.addr_width` (`TUYA_IIC_ADDRESS_7BIT`) |
| `tkl_i2c_master_send(port, addr, data, len, stop)` | Send to 7-bit `addr`; `stop`=FALSE keeps the bus for a repeated start |
| `tkl_i2c_master_receive(port, addr, data, len, stop)` | Read `len` bytes from `addr` |
| `tkl_i2c_deinit(port)` | Release the bus |

`tkl_io_pinmux_config(PIN, TUYA_IIC<n>_SCL / TUYA_IIC<n>_SDA)` maps the bus pins.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| All transfers fail / NAK | Wrong 7-bit address, or no pull-ups | Verify address (datasheet); I2C needs SCL/SDA pull-ups |
| Bus never starts on non-default pins | Alternate SCL/SDA group not muxed | `tkl_io_pinmux_config` for SCL+SDA before `tkl_i2c_init` (default pins need none) |
| Reads return stale/garbage | Sent stop between write-reg and read | Use `stop=FALSE` on the register write (repeated start) |

## Reference example

SDK: `examples/peripherals/i2c/` (i2c_scan; sht3x_4x_sensor — pin mux, master send/receive).
