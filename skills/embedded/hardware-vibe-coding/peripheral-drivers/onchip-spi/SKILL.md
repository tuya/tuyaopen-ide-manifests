---
name: tuyaopen/onchip-spi
description: >-
  On-chip SPI master for TuyaOpen using the tkl_spi API: init with mode /
  data bits / bit order, then send (and receive) bytes.
  SPI、SPI总线、主机、片选、MOSI、MISO、SCLK、tkl_spi、SPI收发。
when_to_use: >-
  Use when the user wants to talk to an SPI device as bus master: send a
  buffer, or send/receive. For a catalogued SPI display, use the display
  peripheral skill instead.

id: onchip-spi
surfaces: [embedded]
tags: [spi, bus, master, on-chip, tkl_spi]
---

# TuyaOpen On-Chip SPI (master)

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_SPI`. No `app_default.config` change needed.
- No `board_register_hardware()`. Call `tkl_spi_*` directly with `TUYA_SPI_NUM_<n>`.
- Confirm **which SPI port** + pins (SCLK/MOSI/MISO/CS) with the user; record as `onchip:spi<n>` in `used-peripherals.json`. CS is often a plain GPIO you toggle yourself — see the gpio skill.
- **Pins:** a port's default SCLK/MOSI/MISO need no mux. Only call `tkl_io_pinmux_config()` (`#include "tkl_pinmux.h"`) when routing to a non-default / alternate pin group — check the platform pinout.

## Platform spec — read, don't hardcode

`.tuyaopen/ide/platform.json` → `peripherals.spi.spec`: `ports[].pinGroups` give each
port's CLK/CS/MOSI/MISO pin options (single group → default pins, no mux; multiple →
pick one and mux), `ports[].freq` the valid clock range (`freq_hz`), plus `mode` /
`databits` / `bitorder` valid sets. The example values below are illustrative —
confirm against the spec for the chosen port.

## Init + send

```c
#include "tal_api.h"
#include "tkl_spi.h"

#define SPI_PORT   TUYA_SPI_NUM_0

void app_spi_init(void)
{
    TUYA_SPI_BASE_CFG_T cfg = {
        .mode     = TUYA_SPI_MODE0,
        .freq_hz  = 1000000,                 /* 1 MHz */
        .databits = TUYA_SPI_DATA_BIT8,
        .bitorder = TUYA_SPI_ORDER_MSB2LSB,
        .role     = TUYA_SPI_ROLE_MASTER,
        .type     = TUYA_SPI_AUTO_TYPE,
    };
    tkl_spi_init(SPI_PORT, &cfg);
}

void app_spi_tx(const uint8_t *buf, uint16_t len)
{
    tkl_spi_send(SPI_PORT, (void *)buf, len);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_spi_init(port, &cfg)` | `cfg.mode` (`TUYA_SPI_MODE0..3`), `cfg.databits` (`TUYA_SPI_DATA_BIT8`), `cfg.bitorder` (`TUYA_SPI_ORDER_MSB2LSB` / `_LSB2MSB`), `cfg.role` (`TUYA_SPI_ROLE_MASTER`), `cfg.type` (`TUYA_SPI_AUTO_TYPE`), `cfg.freq_hz` |
| `tkl_spi_send(port, buf, len)` | Send `len` bytes |
| `tkl_spi_recv(port, buf, len)` | Receive `len` bytes |
| `tkl_spi_transfer(port, tx, rx, len)` | Full-duplex transfer |
| `tkl_spi_deinit(port)` | Release the port |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Garbage on the wire | Wrong SPI mode (CPOL/CPHA) | Match the device's mode (`TUYA_SPI_MODE0..3`) |
| Bit order wrong | MSB/LSB mismatch | Set `bitorder` per the device datasheet |
| Device never selected | CS not driven | Toggle CS GPIO around the transfer (gpio skill) |

## Reference example

SDK: `examples/peripherals/spi/` (master init, send loop).
