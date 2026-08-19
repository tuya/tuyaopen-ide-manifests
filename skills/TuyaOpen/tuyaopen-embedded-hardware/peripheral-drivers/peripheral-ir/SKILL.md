---
name: tuyaopen/peripheral-ir
description: >-
  TDL infrared (IR) usage for TuyaOpen: register the IR hardware, send and
  receive NEC remote codes or raw timecode waveforms. 红外、遥控、红外发射、红外接收、
  NEC、遥控器、infrared、IR、emit、receive。
when_to_use: >-
  Use when the user wants to send or receive infrared remote-control signals
  (NEC protocol or raw timecode) — IR blaster, remote learning, etc.

id: peripheral-ir
surfaces: [embedded]
tags: [ir, infrared, remote, nec, timecode]
---

# TuyaOpen TDL Infrared (IR)

IR supports **transmit, receive, or full-duplex** and two protocols: **NEC**
(addr/cmd remote codes) and **raw timecode** (microsecond pulse arrays).

> **Usually a custom peripheral.** Unless the board adapts IR, you register the
> driver yourself (pins + PWM-capable send pin + hardware timers), then use the
> TDL API. Add `CONFIG_ENABLE_IR=y` to `app_default.config`. The device name is
> chosen at registration time — there is no board NAME macro.

## Driver Registration (TDD)

The send pin **must support 38 kHz PWM output**. One timer for single-timer mode.

```c
#include "tdd_ir_driver.h"

static OPERATE_RET app_ir_register(char *name)
{
    IR_DRV_CFG_T hw = {
        .send_pin   = TUYA_GPIO_NUM_24,    // must support 38kHz PWM
        .recv_pin   = TUYA_GPIO_NUM_26,
        .send_timer = TUYA_TIMER_NUM_3,
        .recv_timer = TUYA_TIMER_NUM_3,    // used only in dual-timer mode
        .send_duty  = 50,                  // PWM duty %
    };
    return tdd_ir_driver_register(name, IR_DRV_SINGLE_TIMER, hw);
}
```

---

## Headers

```c
#include "tdd_ir_driver.h"
#include "tdl_ir_dev_manage.h"
```

## Usage Template (NEC send + receive)

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdd_ir_driver.h"
#include "tdl_ir_dev_manage.h"

#define APP_IR_NAME "ir"

static IR_HANDLE_T s_ir_hdl = NULL;

void app_ir_init(void)
{
    app_ir_register(APP_IR_NAME);                 /* TDD register (see above) */

    if (OPRT_OK != tdl_ir_dev_find(APP_IR_NAME, &s_ir_hdl)) {
        PR_ERR("ir device not found");
        return;
    }

    IR_DEV_CFG_T cfg = {
        .ir_mode        = IR_MODE_SEND_RECV,      /* or _SEND_ONLY / _RECV_ONLY */
        .recv_queue_num = 3,
        .recv_buf_size  = 1024,
        .recv_timeout   = 300,                    /* ms */
        .prot_opt       = IR_PROT_NEC,            /* or IR_PROT_TIMECODE */
        .prot_cfg.nec_cfg = {
            .is_nec_msb = 0,                      /* 0 = LSB first */
            .lead_err = 31, .logics_err = 46,
            .logic0_err = 46, .logic1_err = 40, .repeat_err = 24,  /* % tolerances */
        },
    };
    if (OPRT_OK != tdl_ir_dev_open(s_ir_hdl, &cfg)) {
        PR_ERR("ir open failed");
    }
}

/* Send a NEC code at 38 kHz carrier. */
void app_ir_send_nec(uint16_t addr, uint16_t cmd)
{
    IR_DATA_U tx = {0};
    tx.nec_data.addr = addr;
    tx.nec_data.cmd  = cmd;
    tx.nec_data.repeat_cnt = 1;
    tdl_ir_dev_send(s_ir_hdl, 38000, tx, 1);      /* freq, data, send_cnt */
}

/* Block up to timeout_ms for a received frame. */
void app_ir_poll_recv(void)
{
    IR_DATA_U *rx = NULL;
    if (OPRT_OK == tdl_ir_dev_recv(s_ir_hdl, &rx, 3000) && rx) {
        PR_DEBUG("ir nec: addr=%04x cmd=%04x cnt=%d",
                 rx->nec_data.addr, rx->nec_data.cmd, rx->nec_data.repeat_cnt);
        tdl_ir_dev_recv_release(s_ir_hdl, rx);    /* MUST release */
    }
}
```

## Raw timecode

```c
uint32_t pulses[] = { 560, 560, 560, 1690, /* … µs high/low durations … */ };
IR_DATA_U tx = {0};
tx.timecode.data = pulses;
tx.timecode.len  = sizeof(pulses) / sizeof(pulses[0]);
tdl_ir_dev_send(s_ir_hdl, 38000, tx, 1);
/* On receive with IR_PROT_TIMECODE, read rx->timecode.len + rx->timecode.data[] */
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdd_ir_driver_register(name, type, cfg)` | Register IR hardware; `type` = `IR_DRV_SINGLE_TIMER` |
| `tdl_ir_dev_find(name, &hdl)` | Find the registered IR device |
| `tdl_ir_dev_open(hdl, &cfg)` | Open with mode + protocol config |
| `tdl_ir_dev_send(hdl, freq, data, cnt)` | Send `cnt` copies at `freq` Hz carrier (typ. 38000) |
| `tdl_ir_dev_recv(hdl, &data, timeout_ms)` | Block for a received frame (pointer out) |
| `tdl_ir_dev_recv_release(hdl, data)` | Release a buffer returned by recv — **always pair with recv** |
| `tdl_ir_config(hdl, cmd, params)` | Runtime control (e.g. `IR_CMD_RECV_TASK_STOP`) |
| `tdl_ir_dev_close(hdl)` | Close the device |

## Modes & protocols

```c
IR_MODE_RECV_ONLY  // 0      IR_PROT_TIMECODE // 0 — raw µs pulse array
IR_MODE_SEND_ONLY  // 1      IR_PROT_NEC      // 1 — addr/cmd codes
IR_MODE_SEND_RECV  // 2
```

NEC data: `IR_DATA_U.nec_data = { uint16_t addr; uint16_t cmd; uint16_t repeat_cnt; }`.
Timecode data: `IR_DATA_U.timecode = { uint16_t len; uint32_t *data; }`.

## Enable Macro

```
CONFIG_ENABLE_IR=y    # enables the IR subsystem (custom peripheral)
```

No Kconfig NAME macro — pass your chosen name to both
`tdd_ir_driver_register()` and `tdl_ir_dev_find()`.

## Reference Example

`examples/peripherals/ir/`
