# TuyaOpen Board JSON Schema Design

**Date:** 2026-05-13
**Status:** Draft
**Author:** zhouss@tuya.com

---

## Background

`tuyaopen-ide-manifests` is a public manifest registry consumed by the TuyaOpen IDE at runtime. The `boards-and-chips` domain currently has a minimal schema (id, name, brand, chip, summary, tags, source) that only supports display. This design extends it to also serve AI vibe coding — when a developer uses Cursor or VS Code Chat, the AI can read board context and generate correct board-specific code, build commands, and API calls.

---

## Goals

1. **IDE display** — board list page shows chip, flash, peripherals, recommended demos
2. **AI vibe coding context** — AI knows which peripherals exist, which headers to include, which `tos.py` commands to run, and common pitfalls to avoid
3. **Build assistance** — IDE can prefill `BOARD_CHOICE` / `CHIP_CHOICE` / `ENABLE_*` Kconfig options for the developer

## Non-Goals

- Replacing Kconfig as the source of truth for build configuration
- Storing firmware binaries or build artifacts
- Describing pinout at the GPIO level (too verbose, belongs in datasheets)

---

## Decisions

| Question | Decision | Reason |
|---|---|---|
| Detail level | Fine-grained (peripheral models, tos.py params, API headers) | AI needs specifics to generate correct code |
| AI delivery | AI.md (static summary) + Skill (dynamic runtime state) | AI.md gives zero-latency base context; Skill adds current Kconfig state on demand |
| Schema structure | Two-level: Platform (with chip variants) + Board | Multiple boards share a platform; chip specs live in platform variants to avoid duplication |
| File granularity | One JSON file per board + lightweight index.json | 32+ boards × fine-grained fields = too large for one file; per-board files also avoid PR conflicts |

---

## File Structure

```
tuyaopen-ide-manifests/
├── registry.json                          # top-level index — add platforms domain
├── platforms/
│   ├── index.json                         # lightweight platform index
│   ├── t5ai.json                          # T5AI platform + chip variant detail
│   ├── esp32.json                         # ESP32 platform + chip variants (C3/S3/C6/...)
│   ├── t3.json
│   ├── t2.json
│   └── ...
├── boards-and-chips/
│   ├── index.json                         # lightweight board index (display fields only)
│   ├── tuya-t5ai-pixel.json              # full board detail
│   ├── tuya-t5ai-pocket.json
│   ├── esp32-c3-devkitm-1.json
│   └── ...
├── demos/
│   └── index.json
└── skills/
    └── index.json
```

`registry.json` gains a new domain entry:

```json
"platforms": {
  "url": "platforms/index.json",
  "version": "0.1.0",
  "summary": "芯片平台与变体（T5AI / ESP32 / T3 / T2 等）"
}
```

---

## Schema: `platforms/index.json` (lightweight index)

```json
{
  "schemaVersion": 1,
  "domain": "platforms",
  "publishedAt": "2026-05-13T00:00:00Z",
  "items": [
    {
      "id": "esp32",
      "name": { "en": "Espressif ESP32", "zh-CN": "乐鑫 ESP32" },
      "summary": {
        "en": "Espressif ESP32 family powered by ESP-IDF.",
        "zh-CN": "基于 ESP-IDF 的乐鑫 ESP32 系列。"
      },
      "variantIds": ["esp32", "esp32-c3", "esp32-s3", "esp32-c6"],
      "detailUrl": "platforms/esp32.json"
    }
  ]
}
```

---

## Schema: `platforms/esp32.json` (platform detail)

```json
{
  "schemaVersion": 1,
  "id": "esp32",
  "name": { "en": "Espressif ESP32", "zh-CN": "乐鑫 ESP32" },
  "summary": {
    "en": "Espressif ESP32 family powered by ESP-IDF, covering Xtensa LX6/LX7 and RISC-V cores.",
    "zh-CN": "基于 ESP-IDF 的乐鑫 ESP32 系列，涵盖 Xtensa LX6/LX7 与 RISC-V 架构。"
  },
  "tuyaopen": {
    "platformFolder": "ESP32",
    "sdkRepo": "https://github.com/tuya/tuyaos-esp32",
    "ref": "main"
  },
  "variants": [
    {
      "id": "esp32-c3",
      "name": "ESP32-C3",
      "arch": "risc-v",
      "cores": 1,
      "fCpuMaxHz": 160000000,
      "sramBytes": 409600,
      "romBytes": 393216,
      "flashInterface": "qspi",
      "connectivity": ["wifi", "ble"],
      "kconfig": {
        "CHIP_CHOICE": "ESP32-C3"
      }
    },
    {
      "id": "esp32-s3",
      "name": "ESP32-S3",
      "arch": "xtensa-lx7",
      "cores": 2,
      "fCpuMaxHz": 240000000,
      "sramBytes": 524288,
      "romBytes": 393216,
      "flashInterface": "qspi",
      "connectivity": ["wifi", "ble"],
      "kconfig": {
        "CHIP_CHOICE": "ESP32-S3"
      }
    },
    {
      "id": "esp32-c6",
      "name": "ESP32-C6",
      "arch": "risc-v",
      "cores": 1,
      "fCpuMaxHz": 160000000,
      "sramBytes": 524288,
      "romBytes": 393216,
      "flashInterface": "qspi",
      "connectivity": ["wifi", "ble", "zigbee", "thread"],
      "kconfig": {
        "CHIP_CHOICE": "ESP32-C6"
      }
    }
  ]
}
```

### Platform Detail Field Reference

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Unique platform ID, kebab-case |
| `tuyaopen.platformFolder` | string | Maps to `boards/<platformFolder>/` directory in TuyaOpen repo |
| `tuyaopen.sdkRepo` | string | Underlying SDK repository |
| `tuyaopen.ref` | string | SDK version (branch / tag / sha) |
| `variants[].id` | string | Chip variant ID; referenced by board's `variantId` |
| `variants[].arch` | string | CPU architecture: `xtensa-lx6`, `xtensa-lx7`, `risc-v` |
| `variants[].cores` | number | Number of CPU cores |
| `variants[].fCpuMaxHz` | number | Maximum CPU frequency in Hz |
| `variants[].sramBytes` | number | On-chip SRAM in bytes (excludes PSRAM) |
| `variants[].flashInterface` | string | Flash bus type: `qspi`, `spi` |
| `variants[].connectivity` | string[] | **Chip-level** built-in connectivity (not board peripherals) |
| `variants[].npu` | object? | Optional. Present only when chip has NPU: `{ tops, note }` |
| `variants[].kconfig.CHIP_CHOICE` | string | Value to set in Kconfig for `tos.py` build |

---

## Schema: `boards-and-chips/index.json` (lightweight index)

Contains only the fields needed to render the board list page. No peripheral details.

```json
{
  "schemaVersion": 1,
  "domain": "boardsAndChips",
  "publishedAt": "2026-05-13T00:00:00Z",
  "items": [
    {
      "id": "tuya-t5ai-pixel",
      "name": { "en": "Tuya T5AI Pixel", "zh-CN": "涂鸦 T5AI Pixel 板" },
      "brand": { "en": "Tuya", "zh-CN": "涂鸦智能" },
      "manufacturer": { "en": "Tuya", "zh-CN": "涂鸦智能" },
      "platformId": "t5ai",
      "variantId": "t5ai",
      "summary": {
        "en": "T5AI board with WS2812 pixel LEDs, BMI270 IMU and multi-button layout.",
        "zh-CN": "搭载 WS2812 像素灯珠、BMI270 IMU 和多按键的 T5AI 评估板。"
      },
      "tags": ["wifi", "ble", "edge-ai", "imu", "led-pixel"],
      "image": "assets/tuya-t5ai-pixel.png",
      "detailUrl": "boards-and-chips/tuya-t5ai-pixel.json",
      "recommendedDemos": ["voice-assistant"]
    }
  ]
}
```

---

## Schema: `boards-and-chips/<board-id>.json` (board detail)

Full hardware description. Consumed by IDE board detail page, AI.md generation, and Skills.

```json
{
  "schemaVersion": 1,
  "id": "tuya-t5ai-pixel",
  "name": { "en": "Tuya T5AI Pixel", "zh-CN": "涂鸦 T5AI Pixel 板" },
  "brand": { "en": "Tuya", "zh-CN": "涂鸦智能" },
  "manufacturer": { "en": "Tuya", "zh-CN": "涂鸦智能" },
  "platformId": "t5ai",
  "variantId": "t5ai",

  "memory": {
    "flashSizeBytes": 16777216,
    "psramSizeBytes": 0,
    "psramInterface": null
  },

  "peripherals": [
    {
      "type": "led-pixel",
      "model": "WS2812B",
      "count": 8,
      "interface": "SPI",
      "note": "RGB addressable LEDs; driven via SPI not PWM — timing is strict"
    },
    {
      "type": "imu",
      "model": "BMI270",
      "axes": 6,
      "interface": "I2C",
      "note": "6-axis accelerometer + gyroscope; default I2C address 0x68"
    },
    {
      "type": "button",
      "count": 3,
      "note": "Mapped to ENABLE_BUTTON / ENABLE_BUTTON_2 / ENABLE_BUTTON_3 in Kconfig"
    },
    {
      "type": "buzzer",
      "count": 1,
      "interface": "GPIO",
      "note": "Passive buzzer; controlled via board_buzzer_api.h"
    }
  ],

  "tuyaopen": {
    "boardChoice": "TUYA_T5AI_PIXEL",
    "kconfig": {
      "BOARD_CHOICE": "TUYA_T5AI_PIXEL",
      "CHIP_CHOICE": "T5AI",
      "PLATFORM_FLASHSIZE_16M": true,
      "ENABLE_LED": true,
      "ENABLE_LEDS_PIXEL": true,
      "ENABLE_IMU": true,
      "ENABLE_IMU_BMI270": true,
      "ENABLE_BUTTON": true,
      "ENABLE_BUTTON_2": true,
      "ENABLE_BUTTON_3": true
    },
    "buildCommands": {
      "config": "tos.py config",
      "build": "tos.py build",
      "flash": "tos.py flash",
      "monitor": "tos.py monitor"
    },
    "source": {
      "repo": "https://github.com/tuya/TuyaOpen",
      "subpath": "boards/T5AI/TUYA_T5AI_PIXEL",
      "ref": "main"
    }
  },

  "aiContext": {
    "capabilities": ["pixel-led", "motion-sensing", "gesture-detection"],
    "boardApiHeader": "board_com_api.h",
    "peripheralApis": [
      {
        "peripheral": "led-pixel",
        "header": "board_pixel_api.h",
        "keyFunctions": [
          "board_pixel_init()",
          "board_pixel_set_color(index, r, g, b)"
        ]
      },
      {
        "peripheral": "imu",
        "header": "board_bmi270_api.h",
        "keyFunctions": [
          "board_bmi270_init()",
          "board_bmi270_read(accel, gyro)"
        ]
      },
      {
        "peripheral": "buzzer",
        "header": "board_buzzer_api.h",
        "keyFunctions": [
          "board_buzzer_init()",
          "board_buzzer_set(freq, duration_ms)"
        ]
      }
    ],
    "notes": [
      "Call board_register_hardware() before using any peripheral",
      "WS2812B is SPI-driven, not PWM — timing is strict",
      "BMI270 default I2C address is 0x68; must initialize before reading data"
    ]
  },

  "links": {
    "schematic": null,
    "datasheet": null,
    "productPage": null
  },

  "tags": ["wifi", "ble", "edge-ai", "imu", "led-pixel"],
  "recommendedDemos": ["voice-assistant"]
}
```

### Board Detail Field Reference

| Section | Field | AI use | IDE use |
|---|---|---|---|
| `memory` | `flashSizeBytes` | Determine if PSRAM is needed for large buffers | Display storage spec |
| `memory` | `psramSizeBytes` | Know whether heap-external alloc (`ps_malloc`) is available | Display PSRAM badge |
| `peripherals[]` | `type`, `model`, `count`, `interface` | Know what hardware is available and how it's wired | Display peripheral list |
| `peripherals[]` | `note` | Catch gotchas without reading source | Tooltip |
| `tuyaopen.kconfig` | `ENABLE_*` flags | Know which capabilities are enabled at build time | Prefill Kconfig for new projects |
| `tuyaopen.buildCommands` | config/build/flash/monitor | Generate runnable shell commands directly | One-click build integration |
| `aiContext.peripheralApis` | `header`, `keyFunctions` | Know which header to include and which functions to call | Not used |
| `aiContext.notes` | string[] | Avoid common mistakes (addresses, timing, init order) | Not used |
| `links` | schematic, datasheet | Reference when debugging hardware issues | Display doc links |

---

## AI.md Template

Generated by the IDE at project creation time. Written to `<project-root>/AI.md`.

```markdown
# TuyaOpen Project Context

## Board
- **Board**: Tuya T5AI Pixel (`TUYA_T5AI_PIXEL`)
- **Platform**: T5AI (`boards/T5AI/TUYA_T5AI_PIXEL`)
- **Chip**: T5AI — dual-core Xtensa LX7 @ 480 MHz, 512 KB SRAM, built-in NPU (0.5 TOPS)
- **Flash**: 16 MB (QSPI)
- **Connectivity**: Wi-Fi + BLE

## Hardware Peripherals
| Type | Model | Interface | Notes |
|---|---|---|---|
| LED Pixel | WS2812B × 8 | SPI | RGB addressable; use `board_pixel_api.h` |
| IMU | BMI270 6-axis | I2C | Accel + Gyro; I2C addr 0x68 |
| Button | × 3 | GPIO | ENABLE_BUTTON / _2 / _3 |
| Buzzer | × 1 | GPIO | `board_buzzer_api.h` |

## Build Commands
\```bash
tos.py config    # open menuconfig / set Kconfig options
tos.py build     # compile firmware
tos.py flash     # flash to device
tos.py monitor   # open serial monitor
\```

## Key Kconfig Options
\```
BOARD_CHOICE=TUYA_T5AI_PIXEL
CHIP_CHOICE=T5AI
PLATFORM_FLASHSIZE_16M=y
ENABLE_LEDS_PIXEL=y
ENABLE_IMU=y / ENABLE_IMU_BMI270=y
ENABLE_BUTTON=y / ENABLE_BUTTON_2=y / ENABLE_BUTTON_3=y
\```

## Board API Entry Points
- Register all hardware first: `board_register_hardware()`
- LED Pixel: `board_pixel_api.h` → `board_pixel_init()`, `board_pixel_set_color(index, r, g, b)`
- IMU: `board_bmi270_api.h` → `board_bmi270_init()`, `board_bmi270_read(accel, gyro)`
- Buzzer: `board_buzzer_api.h` → `board_buzzer_init()`, `board_buzzer_set(freq, duration_ms)`

## Notes
- Call `board_register_hardware()` before using any peripheral
- WS2812B is SPI-driven (not PWM) — timing is strict
- BMI270 default I2C address is 0x68; initialize before reading
```

### AI.md Design Principles

- **Summary, not copy** — distill the board JSON into ~400 tokens; don't paste the full JSON
- **Table for peripherals** — one row per peripheral; model + interface + header at a glance
- **Runnable commands** — `tos.py build` can go directly into a shell tool call
- **Notes = non-obvious traps only** — things the AI would get wrong without reading source

---

## Skill Integration (Dynamic Context)

AI.md is a static snapshot written at project creation. Skills provide the complementary **runtime state** when the developer asks questions during active development.

### What a Skill reads at query time

```
1. .config  (current Kconfig state)
   → which ENABLE_* are y/n right now

2. boards-and-chips/<board-id>.json (manifest detail)
   → full peripheralApis, links, notes not in AI.md

3. boards/<PLATFORM>/<BOARD>/board_com_api.h  (source)
   → exact function signatures (more precise than JSON summary)

4. Assembled context injected into AI prompt
```

### Responsibility split

| | AI.md | Skill |
|---|---|---|
| When written | Once at project creation | On every relevant developer query |
| Content | Static hardware facts | Current build state + live API signatures |
| Board change | Requires regeneration | Auto-detects BOARD_CHOICE from `.config` |
| Token cost | ~400 tokens every conversation | Injected on demand |

---

## Open Questions

1. **`detailUrl` format** — relative path (e.g. `boards-and-chips/tuya-t5ai-pixel.json`) or absolute CDN URL? Relative is simpler to maintain; the loader resolves against the registry base URL.
2. **`peripherals[].type` vocabulary** — should `type` values be an open string or a closed enum? A closed enum (`display`, `audio`, `camera`, `imu`, `button`, `led`, `led-pixel`, `buzzer`, `nfc`, `pmic`, `touch`) enables IDE filtering and AI reasoning; an open string is easier to extend.
3. **`aiContext` localization** — `notes` and `keyFunctions` are currently English-only. Add `zh-CN` variants or keep technical content English-only?
4. **Platform detail lazy-loading** — IDE currently only lazy-loads board and demo domains. Does the IDE also need to load platform detail for the board detail page, or is the variant info embedded in the board JSON sufficient for display?

---

## Peripheral Type Vocabulary (Proposed Closed Enum)

| `type` value | Description |
|---|---|
| `display` | Screen (LCD / OLED / e-ink) |
| `touch` | Touchscreen panel |
| `audio` | Audio codec (mic + speaker) |
| `camera` | Image sensor |
| `imu` | Inertial measurement unit (accel / gyro / mag) |
| `button` | Physical buttons |
| `led` | Single-color LEDs |
| `led-pixel` | Addressable RGB LEDs (WS2812 etc.) |
| `buzzer` | Passive or active buzzer |
| `nfc` | NFC module |
| `pmic` | Power management IC |
| `io-expander` | GPIO expander chip |
| `storage` | External storage (SD card, external flash) |
