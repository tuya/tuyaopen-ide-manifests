---
name: tuyaos/peripheral-drivers
description: >-
  TuyaOS peripheral driver collection (tkl_*/tal_*). Board-agnostic API cards
  aligned with tuyaos_demo_examples. Use after tuyaos-hardware-vibe-coding
  confirms pins/mode. GPIO、I2C、PWM、ADC、SPI、定时器、看门狗、麦克风、喇叭、
  DVP、WiFi、BLE、蓝牙、联网。
when_to_use: >-
  Use when writing TuyaOS driver or connectivity code for a specific peripheral
  after the parent skill confirmed pins/mode. Not for TuyaOpen TDL.
id: tuyaos-peripheral-drivers
surfaces: [embedded]
tags: [peripheral, tuyaos, tkl, driver, wifi, ble]
---

# TuyaOS Peripheral Drivers

All skills below are **TuyaOS-only**, based on:

`software/TuyaOS/apps/tuyaos_demo_examples/src/examples/`

| Peripheral | Skill | Key APIs | Demo |
|------------|-------|----------|------|
| GPIO | `gpio/SKILL.md` | `tkl_gpio_init/write/read/irq_*` | `driver_gpio/` |
| SW I2C | `sw-i2c/SKILL.md` | `tdd_sw_i2c_init/xfer` (+ `tkl_gpio`) | `driver_gpio/` |
| I2C | `i2c/SKILL.md` | `tkl_i2c_init/master_send/master_receive` | `driver_i2c/` |
| PWM | `pwm/SKILL.md` | `tkl_pwm_init/start/info_set/stop` | `driver_pwm/` |
| ADC | `adc/SKILL.md` | `tkl_adc_init/read_single_channel/deinit` | `driver_adc/` |
| SPI | `spi/SKILL.md` | `tkl_spi_init/send/deinit` | `driver_spi/` |
| Timer | `timer/SKILL.md` | `tkl_timer_init/start/stop/deinit` | `driver_timer/` |
| Watchdog | `watchdog/SKILL.md` | `tal_watchdog_refresh` (+ init per platform) | `os_watchdog/` |
| Mic | `mic/SKILL.md` | `tkl_ai_init/start/set_vol`, `tkl_fs_*` | `driver_mic/` |
| Speaker | `speaker/SKILL.md` | `tkl_ao_*`, `tkl_ai_*`, `tkl_fs_*` | `driver_speaker/` |
| DVP camera | `dvp/SKILL.md` | `tkl_vi_init`, `tkl_venc_init` | `driver_dvp/` |
| Wi-Fi | `wifi/SKILL.md` | `tal_wifi_init/station_connect/ap_start/scan/lp_*` | `os_wifi/` |
| BLE | `ble/SKILL.md` | `tal_ble_bt_init`, adv/scan APIs | `os_ble/` |

## Usage

1. Parent skill confirms pins / ids.
2. Open the matching `SKILL.md`.
3. Prefer copying patterns from the demo `.c` in-tree when present.
4. Register new files in `local.mk`; build with `tuyaos-build`.
