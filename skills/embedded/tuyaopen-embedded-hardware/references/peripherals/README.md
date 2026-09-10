# 外设文档索引

TuyaOpen 的 TDL 外设用法集合：显示屏（LVGL / 裸帧缓冲）、摄像头（YUV422 / JPEG / H264）、
按键事件、指示灯，以及片上外设（UART / GPIO / I2C / SPI / PWM / ADC …）。板级无关，只讲 TDL API。

这些文件**不是独立技能**，是 `tuyaopen-embedded-hardware` 的渐进披露载荷
（`tuyaopen-skill-maker` § 7）。它们曾经叫 `peripheral-drivers/<x>/SKILL.md`，
于是递归扫描的 agent 工具把每一个都注册成了独立技能——一个已安装技能显示成 27 个。
2026-08-26 改名到这里，文件名不再是 `SKILL.md`，问题从根上消失。

按需读取：父技能 `SKILL.md` 的委派表给出路径，或
`tuyaopen-cli skills read --id tuyaopen-embedded-hardware --path references/peripherals/<name>.md`。

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
   (handled by the `tuyaopen-embedded-hardware` skill)

---

## When a board does not register the TDL layer

The peripheral docs here describe the **TDL** API — `tdl_display_*`,
`tdl_audio_*`, `tdl_button_*`, `tdl_power_*`. That layer exists only if the
board's own registration code registers a driver into it. Some boards
initialise a chip's low-level driver directly and never call the matching
`tdd_*_register()`, and then the TDL call you were about to write returns
"no such device" at runtime with nothing at compile time to warn you.

**Measured case — battery level on
`WAVESHARE_ESP32S3_Touch_AMOLED_1.8`.** The board fits an AXP2101 PMIC, and
`boards/ESP32/WAVESHARE_ESP32S3_Touch_AMOLED_1.8/Waveshare_ESP32_S3_Touch_AMOLED_1_8.c`
calls the axp2101 driver's own init but **never** `tdd_power_axp2101_register()`.
So `tdl_power_*` has nothing registered, and reading the battery means calling
the low-level driver directly:

```c
#include "axp2101_driver.h"
uint8_t pct = axp2101_getBatteryPercent();
```

Beta round 6 lost time here: it knew it needed a battery percentage, tried the
standard TDL path, and only got out by reading the board's registration file.

**Check before writing a TDL call**, whichever peripheral you are on:

```bash
grep -n "_register" $OPEN_SDK_ROOT/boards/<PLATFORM>/<BOARD>/*.c
```

Every `tdd_*_register()` in that file is a peripheral you may drive through TDL.
Anything the board only initialises — no register call — you drive through its
own driver header, and **that is board-specific**: do not generalise either
answer to another board. `tuyaopen-cli hardware board-context` lists which
devices this board declares; this grep tells you which of them reached TDL.
