---
name: tuyaopen/onchip-qspi
description: >-
  On-chip QSPI master for TuyaOpen using the tkl_qspi API: init (1/2/4-wire),
  issue a command (cmd/addr/data lines + dummy), and bulk-send data.
  QSPI、四线SPI、quad spi、QSPI屏、QSPI flash、tkl_qspi、多线SPI。
when_to_use: >-
  Use for raw QSPI master access to a custom QSPI device (QSPI LCD, QSPI flash,
  etc.). For a board-catalogued QSPI display, use the display peripheral skill
  (board_register_hardware registers it) — this skill is the raw on-chip path.

id: onchip-qspi
surfaces: [embedded]
tags: [qspi, quad-spi, bus, on-chip, tkl_qspi]
---

# TuyaOpen On-Chip QSPI (master)

## When NOT to use this skill

A **catalogued QSPI LCD** on the board goes through the **display** skill —
`board_register_hardware()` + the `tdd_display_qspi` driver handle it. Use this
on-chip skill only for a **raw / custom** QSPI device not in board-context.

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_QSPI`. No `app_default.config` change.
- No `board_register_hardware()`. Call `tkl_qspi_*` directly with `TUYA_QSPI_NUM_<n>`.
- Confirm **which QSPI port** + wire mode (1/2/4) + pins with the user; record as
  `onchip:qspi<n>` in `used-peripherals.json`.

## Platform spec — read, don't hardcode

`.tuyaopen/ide/platform.json` → `peripherals.qspi.spec`: `wireMode` (1/2/4-wire
support), `role`, `type` (flash/lcd), `mode`, `freq` range, and `ports[].pinGroups`
(CLK/CS/IO0–3 pins). Read these for the chosen port instead of assuming.

## Init

```c
#include "tal_api.h"
#include "tkl_qspi.h"

#define QSPI_PORT   TUYA_QSPI_NUM_0

static void qspi_event_cb(TUYA_QSPI_NUM_E port, TUYA_QSPI_IRQ_EVT_E event)
{
    if (event == TUYA_QSPI_EVENT_TX) { /* TX complete */ }
}

void app_qspi_init(uint32_t freq_hz)
{
    TUYA_QSPI_BASE_CFG_T cfg = {
        .role           = TUYA_QSPI_ROLE_MASTER,
        .mode           = TUYA_QSPI_MODE0,          /* MODE0..3 */
        .type           = TUYA_QSPI_TYPE_LCD,       /* or TUYA_QSPI_TYPE_FLASH */
        .freq_hz        = freq_hz,
        .use_dma        = TRUE,
        .dma_data_lines = TUYA_QSPI_4WIRE,          /* 1WIRE / 2WIRE / 4WIRE */
    };
    tkl_qspi_init(QSPI_PORT, &cfg);
    tkl_qspi_irq_init(QSPI_PORT, qspi_event_cb);
    tkl_qspi_irq_enable(QSPI_PORT);
}
```

## Command + bulk data

A QSPI transaction is a `TUYA_QSPI_CMD_T` (per-phase wire width) followed by an
optional bulk `tkl_qspi_send`. Note the SDK spells the function `tkl_qspi_comand`
(one `m`) — use it verbatim.

```c
void app_qspi_write(const uint8_t *frame, uint32_t len)
{
    TUYA_QSPI_CMD_T cmd = {0};
    cmd.op         = TUYA_QSPI_WRITE;       /* or TUYA_QSPI_READ */
    cmd.cmd[0]     = 0x32; cmd.cmd_size = 1;
    cmd.cmd_lines  = TUYA_QSPI_1WIRE;       /* command on 1 line */
    cmd.addr[0]    = 0x00; cmd.addr[1] = 0x2C; cmd.addr_size = 2;
    cmd.addr_lines = TUYA_QSPI_1WIRE;
    cmd.data_lines = TUYA_QSPI_4WIRE;       /* payload on 4 lines */
    cmd.dummy_cycle = 0;

    tkl_qspi_comand(QSPI_PORT, &cmd);       /* SDK spelling: no second 'm' */
    tkl_qspi_send(QSPI_PORT, (void *)frame, len);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_qspi_init(port, &cfg)` | `cfg.{role, mode, type(FLASH/LCD), freq_hz, use_dma, dma_data_lines(1/2/4WIRE)}` |
| `tkl_qspi_comand(port, &cmd)` | Run a `TUYA_QSPI_CMD_T` (op, cmd/addr/data + per-phase `*_lines`, `dummy_cycle`). **SDK spelling** |
| `tkl_qspi_send(port, data, size)` | Bulk write |
| `tkl_qspi_recv(port, data, size)` | Bulk read |
| `tkl_qspi_send_cmd(port, cmd)` | Send a single command byte |
| `tkl_qspi_irq_init(port, cb)` / `tkl_qspi_irq_enable(port)` | Register + enable TX/RX IRQ callback |
| `tkl_qspi_abort_transfer(port)` | Abort an in-flight transfer |
| `tkl_qspi_deinit(port)` | Release the port |

Wire modes: `TUYA_QSPI_1WIRE` (std SPI) / `TUYA_QSPI_2WIRE` (dual) / `TUYA_QSPI_4WIRE` (quad).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Compile error on `tkl_qspi_command` | Wrong spelling | The SDK function is `tkl_qspi_comand` (one `m`) |
| Garbage / nothing on a QSPI LCD | Wrong per-phase wire width | Match `cmd_lines`/`addr_lines`/`data_lines` to the panel datasheet (often 1/1/4) |
| It's actually a catalogued panel | Used raw QSPI for a board display | Use the **display** skill — the board registers it |
| Data lost / overflow | Controller too slow for `freq_hz` | Lower `freq_hz` (within `spec.freq`); enable DMA |

## Reference driver

SDK: `src/peripherals/display/tdd_display/src/qspi/tdd_display_qspi.c`
(real `tkl_qspi_init` + IRQ + `tkl_qspi_comand` + `tkl_qspi_send` for a QSPI LCD).
