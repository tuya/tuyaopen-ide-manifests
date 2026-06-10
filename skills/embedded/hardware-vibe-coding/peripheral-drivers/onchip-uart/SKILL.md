---
name: tuyaopen/onchip-uart
description: >-
  On-chip UART (serial port) for TuyaOpen using the tal_uart API: init a
  user UART, send/receive bytes, RX interrupt callback.
  串口、UART、串口收发、串口通信、tal_uart、用户串口。
when_to_use: >-
  Use when the user wants a real serial port for data I/O (send/receive
  bytes over a UART). NOT for debug logging — that is PR_DEBUG/PR_* over the
  log console, a different facility entirely.

id: onchip-uart
surfaces: [embedded]
tags: [uart, serial, on-chip, tal_uart]
---

# TuyaOpen On-Chip UART (user serial)

## RED LINE — user UART vs log console (do not confuse)

| | API | What it is |
|---|-----|------------|
| **User serial port** | `tal_uart_init` / `tal_uart_write` / `tal_uart_read` | A real UART peripheral you open on chosen pins. **This skill.** |
| **Debug / log output** | `PR_DEBUG` / `PR_INFO` / `PR_NOTICE` / `PR_ERR` (tal_log) | The logging console. NOT a user peripheral — do not model it as one. |

- **"串口 / serial" is ambiguous — ASK before coding, do NOT silently pick.** A bare
  request like "用串口给电脑发 hello world" / "send hello world over serial" does not
  say which path. Ask the user which they mean:
  - **Debug / log console** (`PR_*`) — on most boards (incl. T5AI) this is a USB-serial
    the PC already sees; zero setup, best for just viewing output / debug prints. It is
    **not** a user peripheral and is **not** recorded in `used-peripherals.json`.
  - **Dedicated user UART** (`tal_uart`) — a real UART peripheral on its own instance +
    pins, for a serial protocol / external device. This **is** a confirmed on-chip
    peripheral → confirm the instance + pins, record `onchip:uart<N>`.
- Only after the user picks the dedicated-UART path do you use `tal_uart_*` (this skill).
  For the debug/log path, just `PR_NOTICE(...)` — no UART init, nothing recorded.
- **Pick the UART from `platform.json` — do NOT guess roles.** Read
  `.tuyaopen/ide/platform.json` → `peripherals.uart.spec.ports[]`. Each port carries:
  - `role` — its **power-on default purpose**: `"log"` (debug/log console),
    `"download"` (flash/download port), or `"general"` (free for app use). This is the
    default and is **reconfigurable in code**, but treat it as the guide.
  - `pinGroups` — its available TX/RX pin set(s).

  For a user UART, **prefer a `role:"general"` port**. **Never** use the log port
  (`role:"log"`). The `download` port is fine — its use is only
  transient during flashing, so it's free at runtime. Confirm the chosen instance with
  the user; don't infer roles from general board knowledge.

## On-chip — no Kconfig, no TDD registration

- On-chip peripherals are provided by the platform. **Do NOT** write `CONFIG_ENABLE_UART` (or any `CONFIG_ENABLE_SPI/I2C/GPIO`) — those are platform-selected. No `app_default.config` change is needed.
- There is no `board_register_hardware()` / TDD step for a user UART. You call `tal_uart_init()` directly.

## Step 1 — Confirm the instance and pins

A user UART is confirmed by **which UART instance** + **which TX/RX pins**.

**Whether you need pin mux is decided by the port's `pinGroups`** (from platform.json):

- Port with a **single** `pinGroups` entry → those are its fixed default pins.
  **Do NOT call `tkl_io_pinmux_config`** — just `tal_uart_init()` and use it. The vast
  majority of cases (and the SDK default `TUYA_UART_NUM_0`) are this. Don't mux "just in case".
- Port with **multiple** `pinGroups` → you must pick one; selecting a group needs mux.
  Only then `#include "tkl_pinmux.h"`. E.g. T5AI `UART2` exposes PIN31/30 **or** PIN41/40:

```c
/* ALTERNATE-PINS ONLY — for a multi-group port; omit entirely for single-group ports */
#include "tkl_pinmux.h"
tkl_io_pinmux_config(TUYA_IO_PIN_40, TUYA_UART2_RX);
tkl_io_pinmux_config(TUYA_IO_PIN_41, TUYA_UART2_TX);
```

If the chosen port has one pin group, **skip the block above and `tkl_pinmux.h` entirely**.

Record the confirmed UART in `.tuyaopen/used-peripherals.json` as `onchip:uart<N>`
before generating code — see the `hardware-vibe-coding` skill.

## Step 2 — Init + send/receive

Default-pin case (the common one) — **no pin mux, no `tkl_pinmux.h`**:

```c
#include "tal_api.h"

#define USR_UART_NUM   TUYA_UART_NUM_0   /* the UART the user confirmed; default pins → no mux */

void app_uart_init(void)
{
    TAL_UART_CFG_T cfg = {0};
    cfg.base_cfg.baudrate = 115200;
    cfg.base_cfg.databits = TUYA_UART_DATA_LEN_8BIT;
    cfg.base_cfg.stopbits = TUYA_UART_STOP_LEN_1BIT;
    cfg.base_cfg.parity   = TUYA_UART_PARITY_TYPE_NONE;
    cfg.rx_buffer_size    = 256;
    cfg.open_mode         = O_BLOCK;
    if (tal_uart_init(USR_UART_NUM, &cfg) != OPRT_OK) {
        PR_ERR("uart init failed");      /* PR_* = log console, fine to use */
        return;
    }

    const char *msg = "hello world\r\n";
    tal_uart_write(USR_UART_NUM, (const uint8_t *)msg, strlen(msg));
}

/* Polled receive + echo */
static void uart_rx_loop(void)
{
    uint8_t buf[256];
    for (;;) {
        int n = tal_uart_read(USR_UART_NUM, buf, sizeof(buf));
        if (n <= 0) { tal_system_sleep(10); continue; }
        tal_uart_write(USR_UART_NUM, buf, n);
    }
}
```

RX-by-interrupt instead of polling:

```c
static void uart_rx_cb(TUYA_UART_NUM_E port, void *buff, uint16_t len) { /* ... */ }
tal_uart_rx_reg_irq_cb(USR_UART_NUM, uart_rx_cb);
```

## API Reference

| Function | Description |
|----------|-------------|
| `tal_uart_init(port, &cfg)` | Init UART; `cfg.base_cfg` = baudrate/databits/stopbits/parity, `cfg.open_mode` (`O_BLOCK`), `cfg.rx_buffer_size` |
| `tal_uart_write(port, buf, len)` | Send bytes; returns write size or <0 |
| `tal_uart_read(port, buf, len)` | Read bytes; returns read size (>=0) or <0 |
| `tal_uart_get_rx_data_size(port)` | Bytes available in RX buffer |
| `tal_uart_rx_reg_irq_cb(port, cb)` | Register RX interrupt callback |
| `tal_uart_deinit(port)` | Release the UART |

`open_mode` flags: `O_BLOCK`, `O_ASYNC_WRITE`, `O_FLOW_CTRL`, `O_TX_DMA`, `O_RX_DMA`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Log output garbled / lost after init | Opened the log UART (`TUYA_UART_NUM_0`) as a user UART | Use a different instance; never reuse the console port |
| No data on non-default pins | Alternate pin group not muxed | `tkl_io_pinmux_config(PIN, TUYA_UARTn_TX/RX)` before `tal_uart_init` (default pins need no mux) |
| `tal_uart_read` always returns 0 | Polling with nothing received, or wrong baud | Check wiring/baud; add `tal_system_sleep` in poll loop |

## Reference example

SDK: `examples/peripherals/uart/` (UART init, write, polled read/echo, UART2 pin mux).
