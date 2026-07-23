---
name: tuyaos/adc
description: >-
  TuyaOS ADC via tkl_adc: init, single-channel read, deinit.
  ADC、采样、电压、模拟输入、tkl_adc。
when_to_use: >-
  Use for TuyaOS analog reads / ADC channels.
id: tuyaos-adc
surfaces: [embedded]
tags: [adc, tuyaos, tkl_adc]
---

# TuyaOS ADC (`tkl_adc`)

**Demo:** `…/examples/driver_adc/example_driver_adc.c`

## Pattern

```c
#include "tkl_adc.h"
#include "tal_log.h"

#define ADC_NUM      0
#define ADC_CHANNEL  0

void app_adc_read_once(void)
{
    TUYA_ADC_BASE_CFG_T cfg = {0};
    /* fill from demo — width, mode, channel mask, etc. */
    if (tkl_adc_init(ADC_NUM, &cfg) != OPRT_OK) {
        TAL_PR_ERR("adc init fail");
        return;
    }
    int32_t value = 0;
    tkl_adc_read_single_channel(ADC_NUM, ADC_CHANNEL, &value);
    TAL_PR_NOTICE("adc=%d", value);
    tkl_adc_deinit(ADC_NUM);
}
```

## API

| Function | Role |
|----------|------|
| `tkl_adc_init` | open |
| `tkl_adc_read_single_channel` | sample |
| `tkl_adc_deinit` | close |

Channel/pin mapping is platform-specific — confirm with the user/schematic.
