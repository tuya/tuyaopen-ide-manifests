---
name: tuyaopen/onchip-adc
description: >-
  On-chip ADC for TuyaOpen using the tkl_adc API: init a channel and read a
  single conversion (raw value or internal voltage).
  ADC、模数转换、采样、电压、模拟量、读电压、tkl_adc、采集。
when_to_use: >-
  Use when the user wants to read an analog value: a sensor voltage, a
  potentiometer, or the internal supply voltage on an ADC channel.

id: onchip-adc
surfaces: [embedded]
tags: [adc, analog, sample, voltage, on-chip, tkl_adc]
---

# TuyaOpen On-Chip ADC

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_ADC`. No `app_default.config` change needed.
- No `board_register_hardware()`. Call `tkl_adc_*` directly with `TUYA_ADC_NUM_<n>`.
- Confirm **which ADC unit** + **channel** (and its input pin) with the user; record as `onchip:adc<n>` in `used-peripherals.json`.

## Platform spec — read, don't hardcode (channel ↔ pin is fixed)

`.tuyaopen/ide/platform.json` → `peripherals.adc.spec`: `ports[].channels[]` maps each
ADC channel `id` to its input `pin` — **pick the channel for the pin you want** (no pin
mux). `bits` is the sample width (e.g. 12) and `mode` lists valid modes. Read these
instead of hardcoding the channel/width.

## Init + read single channel

```c
#include "tal_api.h"
#include "tkl_adc.h"

#define ADC_PORT      TUYA_ADC_NUM_0
#define ADC_CHANNEL   0

void app_adc_read(void)
{
    TUYA_ADC_BASE_CFG_T cfg = {
        .ch_list.data = 1 << ADC_CHANNEL,        /* bitmask of channels to convert */
        .ch_nums      = 1,
        .width        = 12,
        .mode         = TUYA_ADC_CONTINUOUS,
        .type         = TUYA_ADC_INNER_SAMPLE_VOL,
        .conv_cnt     = 1,
    };
    if (tkl_adc_init(ADC_PORT, &cfg) != OPRT_OK) { PR_ERR("adc init failed"); return; }

    int32_t value = 0;
    tkl_adc_read_single_channel(ADC_PORT, ADC_CHANNEL, &value);
    PR_NOTICE("adc ch%d = %d", ADC_CHANNEL, value);

    tkl_adc_deinit(ADC_PORT);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_adc_init(port, &cfg)` | `cfg.ch_list.data` (channel bitmask, `1<<ch`), `cfg.ch_nums`, `cfg.width` (bits), `cfg.mode` (`TUYA_ADC_CONTINUOUS` / `_SINGLE`), `cfg.type` (`TUYA_ADC_INNER_SAMPLE_VOL` / external), `cfg.conv_cnt` |
| `tkl_adc_read_single_channel(port, ch, &val)` | Read one channel's converted value |
| `tkl_adc_read_data(port, buf, len)` | Read multi-channel buffer |
| `tkl_adc_read_voltage(port, buf, len)` | Read as voltage (mV) where supported |
| `tkl_adc_deinit(port)` | Release the ADC |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Value always 0 / full-scale | Channel/pin mismatch | Confirm channel ↔ input pin mapping |
| Noisy readings | Single-shot at a bad moment | Average several reads; check reference |
| init fails | Unsupported width/mode on this chip | Use the example's defaults for the platform |

## Reference example

SDK: `examples/peripherals/adc/` (init, read_single_channel, deinit).
