---
name: tuyaos-hardware-vibe-coding
description: >-
  Hardware-aware code generation for TuyaOS (tuyaos-legacy) apps. Confirms
  pins/instance with the user, writes tkl_*/tal_* driver code under
  apps/<app>/src, and registers sources/headers in local.mk when needed.
  Canonical demos: software/TuyaOS/apps/tuyaos_demo_examples/src/examples/.
  GPIO、PWM、I2C、SPI、ADC、定时器、看门狗、麦克风、喇叭、DVP 摄像头、WiFi、BLE、
  蓝牙、联网、STA、AP、扫网、广播、扫描、串口、外设初始化、硬件驱动、点灯、按键、
  录音、播放、引脚、片上外设、TuyaOS 硬件。
when_to_use: >-
  Use for ANY hardware / peripheral / connectivity request on a TuyaOS project —
  GPIO, PWM, I2C, SPI, ADC, timer, watchdog, mic, speaker, DVP camera, Wi-Fi
  (STA/AP/scan/LP), BLE (peripheral/central/remote), or "make the hardware do X".
  Load this skill FIRST; it routes to the matching TuyaOS peripheral sub-skill.
  Do NOT use on TuyaOpen (tos.py / TDL) projects.
id: tuyaos-hardware-vibe-coding
surfaces: [embedded]
tags: [hardware, peripheral, vibe-coding, tuyaos, tkl, gpio, pwm, i2c, spi, adc, wifi, ble, bluetooth]
default_enabled: true
related: [tuyaos-build, tyutool-cli, smart-product-dev]
---

# TuyaOS Hardware Vibe Coding

**TuyaOS-only.** Separate from TuyaOpen `hardware-vibe-coding` (TDD/TDL /
`board-context.md`). Do **not** load or copy TuyaOpen peripheral skills here.

## Architecture (TuyaOS)

App code calls **TKL / TAL** drivers directly:

```text
App (apps/<app>/src/*.c)
  → tkl_*  (GPIO / I2C / SPI / PWM / ADC / timer / audio / video …)
  → tal_*  (log / thread / system / watchdog …)
```

There is **no** `board_register_hardware()`, **no** `tdl_*` device layer, and
**no** `.tuyaopen/board-context.md` on TuyaOS projects.

## Read these first

1. **Project root** — `tuya.json` + `software/TuyaOS/`.
2. **Active app** — `.tuyaos/status.json` → `activeApp`, or user-named app under
   `software/TuyaOS/apps/<app>/`.
3. **App sources** — `apps/<app>/src/`, headers in `include/` or beside sources.
4. **`apps/<app>/local.mk`** — how sources/headers are registered (see `tuyaos-build`).
5. **Reference demos** (always prefer reading the real file over inventing APIs):

```text
software/TuyaOS/apps/tuyaos_demo_examples/src/examples/
  driver_gpio/     driver_i2c/    driver_pwm/   driver_adc/
  driver_spi/      driver_timer/  driver_mic/   driver_speaker/
  driver_dvp/      os_watchdog/   os_wifi/      os_ble/
  service_ble_remote/   service_ffc_master/   service_ffc_slaver/
```

If the demo app is not in the current tree, still use the same API names from
the sub-skills below; pin numbers must come from the **user / board schematic**.

## Rules (must follow)

1. **Confirm pins / instance before code.** Ask which GPIO / PWM id / I2C port /
   SPI id / ADC channel when the user did not specify. Do not invent board pins.
2. **Match existing app style.** If the app uses `STATIC`/`VOID`/`TAL_PR_*`, keep
   that; if it uses POSIX C, keep that. Prefer the style already in `tuya_app_main.c`.
3. **Wire new files in `local.mk`.** New `.c` under `apps/<app>/` must appear in
   `LOCAL_SRC_FILES`; new header dirs in `LOCAL_TUYA_SDK_INC` or
   `LOCAL_TUYA_SDK_CFLAGS += -I...`. Paths outside the app (e.g. `vendor/`) use
   `$(LOCAL_PATH)/../../vendor/...` — see **`tuyaos-build`**.
4. **Never use TuyaOpen-only APIs** here: `tdl_*`, `board_register_hardware()`,
   `board_com_api.h`, `app_default.config` TuyaOpen Kconfig, `.tuyaopen/*`.
5. **Build with `tuyaos-build`** (`build_app.sh`), not `tos.py`.
6. **Serial / 串口 is ambiguous** → ask: log/`TAL_PR_*` vs dedicated UART
   (`tal_uart` / `tkl_uart` if present on the platform). Do not assume.

## Step flow

1. Confirm this is a **TuyaOS** tree (`software/TuyaOS/build_app.sh`).
2. Resolve `appName` + open `local.mk` + main entry (`tuya_app_main.c` or similar).
3. Confirm peripheral type + pins/ids with the user.
4. Open the matching sub-skill under `peripheral-drivers/`.
5. Optionally open the matching `tuyaos_demo_examples` source and adapt it.
6. Write code under `apps/<app>/src/…`; update `local.mk` if new files/dirs.
7. Build via `tuyaos-build` skill commands.

## Route table

| User intent | Sub-skill | Demo path under `…/examples/` |
|-------------|-----------|-------------------------------|
| GPIO in/out/IRQ, 拉高拉低 | `peripheral-drivers/gpio/SKILL.md` | `driver_gpio/` |
| Software bit-bang I2C | `peripheral-drivers/sw-i2c/SKILL.md` | `driver_gpio/` (`example_driver_sw_i2c.c`) |
| Hardware I2C master | `peripheral-drivers/i2c/SKILL.md` | `driver_i2c/` |
| PWM dimming / tone | `peripheral-drivers/pwm/SKILL.md` | `driver_pwm/` |
| ADC / 电压采样 | `peripheral-drivers/adc/SKILL.md` | `driver_adc/` |
| SPI master | `peripheral-drivers/spi/SKILL.md` | `driver_spi/` |
| Hardware timer | `peripheral-drivers/timer/SKILL.md` | `driver_timer/` |
| Watchdog / 喂狗 | `peripheral-drivers/watchdog/SKILL.md` | `os_watchdog/` |
| Mic / 录音 | `peripheral-drivers/mic/SKILL.md` | `driver_mic/` |
| Speaker / 播放 | `peripheral-drivers/speaker/SKILL.md` | `driver_speaker/` |
| DVP camera / 采集编码 | `peripheral-drivers/dvp/SKILL.md` | `driver_dvp/` |
| Wi-Fi STA/AP/scan/LP / 联网 | `peripheral-drivers/wifi/SKILL.md` | `os_wifi/` (+ `service_ffc_*` for FFC remote) |
| BLE peripheral/central / 蓝牙 | `peripheral-drivers/ble/SKILL.md` | `os_ble/` (+ `service_ble_remote/` for remotes) |

Not listed (KV/OTA/HTTP/thread/queue/…) → read the matching
`tuyaos_demo_examples/src/examples/<name>/` demo; do not invent APIs.

## Code organisation (TuyaOS app)

```text
apps/<app>/
  local.mk
  include/                 # optional public headers
  src/
    tuya_app_main.c        # entry — keep thin
    app_<feature>.c/.h     # new feature modules
```

- Prefer a new `app_<feature>.c` + header; call init from main.
- If `local.mk` already does `find $(LOCAL_PATH)/src …`, new files under `src/`
  may auto-pick up; otherwise `LOCAL_SRC_FILES += …` explicitly.
- Vendor / out-of-app sources: **must** edit `local.mk` (see `tuyaos-build`).

## Related skills

- `tuyaos-build` — build/clean + `local.mk` path wiring
- `tyutool-cli` — flash after a successful build
- `smart-product-dev` — product/DP orchestration (not a driver skill)

_Maintained in tuyaopen-ide-manifests. TuyaOS-only (`sdks: [tuyaos]`)._
