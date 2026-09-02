---
name: tuyaos/i2c
description: >-
  TuyaOS hardware I2C master via tkl_i2c.
  硬件I2C、tkl_i2c、传感器总线、主模式读写。
when_to_use: >-
  Use for TuyaOS hardware I2C master transactions (sensor read/write).
id: tuyaos-i2c
surfaces: [embedded]
tags: [i2c, tuyaos, tkl_i2c]
---

# TuyaOS I2C (`tkl_i2c`)

**Demo:** `…/examples/driver_i2c/example_driver_i2c.c`

## Confirm first

- I2C port id, speed, slave address, 7-bit vs 10-bit as required by the device.

## Pattern

```c
#include "tkl_i2c.h"
#include "tal_log.h"

/* port / addr / pins — confirm per board */
#define I2C_NUM_ID   0
#define SLAVE_ADDR   0x44

void app_i2c_init(void)
{
    TUYA_IIC_BASE_CFG_T cfg = {0};
    /* fill cfg from demo / platform headers — role, speed, addr width */
    OPERATE_RET rt = tkl_i2c_init(I2C_NUM_ID, &cfg);
    if (rt != OPRT_OK) {
        TAL_PR_ERR("tkl_i2c_init failed %d", rt);
        return;
    }
}

void app_i2c_xfer_example(void)
{
    uint8_t tx[2] = {0x24, 0x00};
    uint8_t rx[3] = {0};
    tkl_i2c_master_send(I2C_NUM_ID, SLAVE_ADDR, tx, 2, TRUE);
    tkl_i2c_master_receive(I2C_NUM_ID, SLAVE_ADDR, rx, 3, TRUE);
}
```

## API

| Function | Role |
|----------|------|
| `tkl_i2c_init(port, &cfg)` | open master |
| `tkl_i2c_master_send` | write |
| `tkl_i2c_master_receive` | read |

Open the demo for the exact `TUYA_IIC_BASE_CFG_T` fields used on this SDK version.
Some platforms ship `tkl_i2c_weak.c` stubs in the demo — real impl is in vendor.
