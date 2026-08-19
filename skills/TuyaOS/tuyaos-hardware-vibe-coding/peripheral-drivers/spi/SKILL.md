---
name: tuyaos/spi
description: >-
  TuyaOS SPI master via tkl_spi: init, send, deinit.
  SPI、主机、tkl_spi、总线发送。
when_to_use: >-
  Use for TuyaOS SPI master transfers.
id: tuyaos-spi
surfaces: [embedded]
tags: [spi, tuyaos, tkl_spi]
---

# TuyaOS SPI (`tkl_spi`)

**Demo:** `…/examples/driver_spi/example_driver_spi.c`

## Pattern

```c
#include "tkl_spi.h"
#include "tal_log.h"

#define SPI_ID  0

void app_spi_send(const uint8_t *buf, uint32_t len)
{
    TUYA_SPI_BASE_CFG_T spi_cfg = {0};
    /* role/mode/freq/bitwidth — from demo */
    if (tkl_spi_init(SPI_ID, &spi_cfg) != OPRT_OK) {
        TAL_PR_ERR("spi init fail");
        return;
    }
    tkl_spi_send(SPI_ID, (uint8_t *)buf, len);
    tkl_spi_deinit(SPI_ID);
}
```

## API

| Function | Role |
|----------|------|
| `tkl_spi_init` | open master |
| `tkl_spi_send` | TX |
| `tkl_spi_deinit` | close |

Confirm CS/SCLK/MOSI/MISO pins and SPI id with the user. Full-duplex
`transfer` may exist on some platforms — check vendor headers if needed.
