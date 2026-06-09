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
| Thermal printer | `peripheral-printer/SKILL.md` | `tdl_printer_find()`, `tdl_printer_send_text()`, `tdl_printer_send_bitmap()` |
| Infrared (NEC / timecode) | `peripheral-ir/SKILL.md` | `tdl_ir_dev_find()`, `tdl_ir_dev_send()`, `tdl_ir_dev_recv()` |
| Joystick (2-axis + button) | `peripheral-joystick/SKILL.md` | `tdl_joystick_create()`, `tdl_joystick_event_register()`, `tdl_joystick_calibrated_xy()` |
| Addressable LED strip | `peripheral-leds-pixel/SKILL.md` | `tdl_pixel_dev_find()`, `tdl_pixel_set_single_color_all()`, `tdl_pixel_dev_refresh()` |

## Usage flow

1. Call `board_register_hardware()` to register all board hardware (TDD layer — no manual code needed)
2. Refer to the matching peripheral SKILL.md for TDL API usage
3. For GPIO assignments and Kconfig values, consult `.tuyaopen/board-context.md`
   (handled by the `hardware-vibe-coding` skill)
