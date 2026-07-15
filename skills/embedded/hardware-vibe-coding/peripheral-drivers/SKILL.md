---
name: tuyaopen/peripheral-drivers
description: >-
  TDL peripheral driver usage collection for TuyaOpen. Includes skills for
  display (LVGL/raw framebuffer), camera (YUV422/JPEG/H264), button events,
  and LED indicator control. Board-agnostic — covers TDL API usage only.
  显示屏驱动、摄像头、按键、指示灯、TDL、外设API。
when_to_use: >-
  Use when writing code to control a specific peripheral using the TDL
  layer. This collection is board-agnostic — for board-specific GPIO/Kconfig
  lookup, use hardware-vibe-coding first.

id: peripheral-drivers
surfaces: [embedded]
tags: [peripheral, display, camera, button, led, tdl, driver]
---

# TuyaOpen Peripheral Drivers Collection

This collection contains TDL usage guides for the following peripherals.
All skills are **board-agnostic** — they describe TDL API usage only.

| Peripheral | Skill file | Key APIs |
|-----------|-----------|---------|
| Display (LVGL / raw flush) | `peripheral-display/SKILL.md` | `lv_vendor_init()`, `tdl_disp_find_dev()`, `tdl_disp_dev_open()` |
| Camera | `peripheral-camera/SKILL.md` | `tdl_camera_find_dev()`, `tdl_camera_dev_open()` |
| Button | `peripheral-button/SKILL.md` | `tdl_button_create()`, `tdl_button_event_register()` |
| LED indicator | `peripheral-led/SKILL.md` | `tdl_led_find_dev()`, `tdl_led_open()`, `tdl_led_flash()` |
| Audio codec (mic + speaker) | `peripheral-audio/SKILL.md` | `tdl_audio_find()`, `tdl_audio_open()`, `tdl_audio_play()` |
| Touch panel | `peripheral-touch/SKILL.md` | `tdl_tp_find_dev()`, `tdl_tp_dev_open()`, `tdl_tp_dev_read()` |
| SD Card (SPI / SDIO) | `peripheral-sd/SKILL.md` | `tkl_fs_mount()`, `tkl_fopen()`, `tkl_fwrite()`, `tkl_fread()`, `tkl_fclose()` |
| Thermal printer | `peripheral-printer/SKILL.md` | `tdl_printer_find()`, `tdl_printer_send_text()`, `tdl_printer_send_bitmap()` |
| Infrared (NEC / timecode) | `peripheral-ir/SKILL.md` | `tdl_ir_dev_find()`, `tdl_ir_dev_send()`, `tdl_ir_dev_recv()` |
| Joystick (2-axis + button) | `peripheral-joystick/SKILL.md` | `tdl_joystick_create()`, `tdl_joystick_event_register()`, `tdl_joystick_calibrated_xy()` |
| Addressable LED strip | `peripheral-leds-pixel/SKILL.md` | `tdl_pixel_dev_find()`, `tdl_pixel_set_single_color_all()`, `tdl_pixel_dev_refresh()` |

## On-chip peripherals (SoC buses/pins — `tal_*` / `tkl_*`, no TDD)

These are **not** catalogued device parts. They call the on-chip API directly —
no `board_register_hardware()`, no `CONFIG_ENABLE_*` (platform-selected). Confirm
the instance + pins and record as `onchip:<type><n>` in `used-peripherals.json`.

| Peripheral | Skill file | Key APIs |
|-----------|-----------|---------|
| UART (user serial, **not** PR_* log) | `onchip-uart/SKILL.md` | `tal_uart_init()`, `tal_uart_write()`, `tal_uart_read()` |
| GPIO | `onchip-gpio/SKILL.md` | `tkl_gpio_init()`, `tkl_gpio_write()`, `tkl_gpio_read()`, `tkl_gpio_irq_init()` |
| PWM | `onchip-pwm/SKILL.md` | `tkl_pwm_init()`, `tkl_pwm_start()`, `tkl_pwm_info_set()` |
| I2C master | `onchip-i2c/SKILL.md` | `tkl_i2c_init()`, `tkl_i2c_master_send()`, `tkl_i2c_master_receive()` |
| SPI master | `onchip-spi/SKILL.md` | `tkl_spi_init()`, `tkl_spi_send()`, `tkl_spi_transfer()` |
| QSPI master (raw) | `onchip-qspi/SKILL.md` | `tkl_qspi_init()`, `tkl_qspi_comand()`, `tkl_qspi_send()` |
| ADC | `onchip-adc/SKILL.md` | `tkl_adc_init()`, `tkl_adc_read_single_channel()` |
| Hardware timer | `onchip-timer/SKILL.md` | `tkl_timer_init()`, `tkl_timer_start()` |
| Watchdog | `onchip-watchdog/SKILL.md` | `tkl_watchdog_init()`, `tkl_watchdog_refresh()` |
| RTC | `onchip-rtc/SKILL.md` | `tkl_rtc_init()`, `tkl_rtc_time_set()`, `tkl_rtc_time_get()` |
| DMA2D (2D accel) | `onchip-dma2d/SKILL.md` | `tal_dma2d_init()`, `tal_dma2d_convert()`, `tal_dma2d_wait_finish()` |
| VAD (voice activity) | `onchip-vad/SKILL.md` | `tkl_vad_init()`, `tkl_vad_feed()`, `tkl_vad_get_status()` |
| KWS (wake word) | `onchip-kws/SKILL.md` | `tkl_kws_init()`, `tkl_kws_reg_wakeup_cb()`, `tkl_kws_enable()` |

## Usage flow

1. Call `board_register_hardware()` to register all board hardware (TDD layer — no manual code needed)
2. Refer to the matching peripheral SKILL.md for TDL API usage
3. For per-device pins and Kconfig, look the device up by its `ID:` (from
   `.tuyaopen/board-context.md`) in `.tuyaopen/ide/board.json`
   (handled by the `hardware-vibe-coding` skill)
