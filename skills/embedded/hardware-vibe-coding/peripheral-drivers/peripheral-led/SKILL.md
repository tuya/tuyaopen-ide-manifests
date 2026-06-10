---
name: tuyaopen/peripheral-led
description: >-
  TDL LED indicator control for TuyaOpen: find, open, set on/off/toggle,
  flash, and blink with configurable patterns.
  指示灯、LED、开关灯、闪烁、呼吸灯。
when_to_use: >-
  Use when the user wants to control an indicator LED: turn on/off,
  toggle, flash, or blink with a pattern.

id: peripheral-led
surfaces: [embedded]
tags: [led, gpio, indicator]
---

# TuyaOpen TDL LED Indicator

## Choose the right path first

Each LED is a **named slot** turned on by its **own enable flag**, chained 1→4.
There is **no LED count integer** — you do not set a total. To make an extra slot
available, enable that slot's `CONFIG_ENABLE_LED_N` flag (see chaining rule below).

| Slot | Enable flag | NAME macro (default) | Typical owner |
|------|-------------|----------------------|---------------|
| 1 | `ENABLE_LED` | `LED_NAME` (`"led"`) | Board BSP (`tuya_*_board.c`) |
| 2 | `ENABLE_LED_2` | `LED_NAME_2` (`"led2"`) | Board BSP **or** `usr_board/` |
| 3 | `ENABLE_LED_3` | `LED_NAME_3` (`"led3"`) | Board BSP **or** `usr_board/` |
| 4 | `ENABLE_LED_4` | `LED_NAME_4` (`"led4"`) | Board BSP **or** `usr_board/` |

**Chaining rule (SDK Kconfig):** `ENABLE_LED_2` requires `ENABLE_LED`,
`ENABLE_LED_3` requires `ENABLE_LED_2`, `ENABLE_LED_4` requires `ENABLE_LED_3`.
Slots must be enabled contiguously — you cannot enable slot 4 without 2 and 3.
The board already enables its own slots, so to add one extra you enable the
**next** flag. A `LED_NAME_N` macro is `#define`d **only** when its `ENABLE_LED_N`
is set, so `#if defined(LED_NAME_N)` guards still gate your code.

**Before adding an extra LED**, count how many the board already registers:

```bash
# How many tdd_led_gpio_register() calls in the active board file?
grep -c tdd_led_gpio_register boards/T5AI/TUYA_T5AI_BOARD/tuya_t5ai_board.c
# Or count led entries in .tuyaopen/board-context.md
```

Then, with **N** = board slot count and your extra at slot **N+1**:

```
enable flag      = CONFIG_ENABLE_LED_<N+1>=y   /* makes the next slot available */
next free macro  = LED_NAME_<N+1>              /* register / look up under this  */
```

Examples:

| Board already registers | You add | Enable in `app_default.config` | Register in `usr_board` as | App lookup |
|-------------------------|---------|--------------------------------|------------------------------|------------|
| 1 (`LED_NAME`) | 1 extra | `CONFIG_ENABLE_LED_2=y` | `LED_NAME_2` | `tdl_led_find_dev(LED_NAME_2)` |
| 3 (`LED_NAME` … `LED_NAME_3`) | 1 extra | `CONFIG_ENABLE_LED_4=y` | `LED_NAME_4` | `tdl_led_find_dev(LED_NAME_4)` |
| 0 (no `ENABLE_LED` / no board LED) | 1 extra | `CONFIG_ENABLE_LED=y` | `LED_NAME` | `tdl_led_find_dev(LED_NAME)` |

On **TUYA_T5AI_BOARD** today the BSP registers **one** onboard LED (slot 1,
`LED_NAME`) → one extra wire → enable `CONFIG_ENABLE_LED_2=y`, register `LED_NAME_2`.
That is a special case, not a universal rule.

| Scenario | Board BSP | Config (`app_default.config`) | TDD registration | TDL lookup |
|----------|-----------|-------------------------------|------------------|------------|
| **Use onboard LED only** | Already registered | Usually nothing extra | `board_register_hardware()` only | `tdl_led_find_dev(LED_NAME)` |
| **Extra GPIO LED(s)** | Owns slots 1…N | **`CONFIG_ENABLE_LED_<N+1>=y`** (per extra) | `usr_board/` → next free `LED_NAME_<N+1>` | `tdl_led_find_dev(LED_NAME_<N+1>)` |

**Do not edit SDK `src/peripherals/led/Kconfig`** for normal app work. Set options in **`app_default.config`**.

**Do not register under a name the board already uses** — pick the next free `LED_NAME_N` slot.

---

## Step 1 — Kconfig / `app_default.config`

### Onboard LED only

Most T5AI boards (e.g. `TUYA_T5AI_BOARD`) already have:

```kconfig
# boards/T5AI/TUYA_T5AI_BOARD/Kconfig
select ENABLE_LED
```

No line needed in `app_default.config` unless `ENABLE_LED` was disabled elsewhere. Default: slot 1 enabled, `LED_NAME` → `"led"`.

### Extra GPIO LED(s) — enable the next slot flag

1. Count **board** LED registrations (`N`).
2. For each extra LED, enable the **next** slot flag (chained — enable every flag
   from `ENABLE_LED_2` up to the one you need). In **`source/embedded/app_default.config`**:

```
CONFIG_ENABLE_LED_2=y     # makes slot 2 (LED_NAME_2) available; one extra on a 1-LED board
# for a second extra also add CONFIG_ENABLE_LED_3=y, etc. (max slot 4)
# optional rename of the slot you use, e.g. for slot 2:
# CONFIG_LED_NAME_2="led_ext"
```

3. In `usr_board`, register each extra LED on the **next free slot**:
   - First extra when board has 1 → `tdd_led_gpio_register(LED_NAME_2, …)`
   - First extra when board has 3 → `tdd_led_gpio_register(LED_NAME_4, …)`

4. In app code, use `#if defined(LED_NAME_N)` / `tdl_led_find_dev(LED_NAME_N)` for that same slot macro.

**T5AI-Board example** (board N=1, one extra): `CONFIG_ENABLE_LED_2=y`, register `LED_NAME_2`.

**After any hand-edit to `app_default.config`**, refresh before build (see skill **`tuyaopen/build`**, section *After editing app_default.config manually*):

```bash
cd source/embedded
tos.py clean -f && tos.py build
```

Verify both:

- `.build/cache/using.config` → `CONFIG_ENABLE_LED_2=y`
- `.build/include/tuya_kconfig.h` → `#define ENABLE_LED_2 1` and `#define LED_NAME_2 "led2"`

A successful build with stale `tuya_kconfig.h` still compiles **without** `LED_NAME_2` — features silently disappear at compile time.

---

## Step 2 — Driver registration (TDD)

### Onboard LED

`board_register_hardware()` registers the onboard LED — **no app TDD code**.

Read GPIO and active level from `.tuyaopen/board-context.md`:

```text
## led — Indicator LED
Pins: led=GPIO1(high)
```

### Extra GPIO LED → `usr_board`

Read skill **`hardware-vibe-coding/peripheral-drivers/usr-board/SKILL.md`** for CMake wiring.

Register the **second** device name (`LED_NAME_2`), not `LED_NAME`:

```c
/* usr_board/usr_board.c */
#include "usr_board.h"
#include "tdd_led_gpio.h"
#include "tal_api.h"

#define USR_EXT_LED_GPIO           TUYA_GPIO_NUM_28   /* from user / board-context */
#define USR_EXT_LED_ACTIVE_LEVEL   TUYA_GPIO_LEVEL_HIGH

#if defined(LED_NAME_2)
static OPERATE_RET __usr_register_ext_led(void)
{
    TDD_LED_GPIO_CFG_T led_cfg = {
        .pin   = USR_EXT_LED_GPIO,
        .level = USR_EXT_LED_ACTIVE_LEVEL,
        .mode  = TUYA_GPIO_PUSH_PULL,
    };
    return tdd_led_gpio_register(LED_NAME_2, &led_cfg);
}
#endif

OPERATE_RET usr_register_hardware(void)
{
    OPERATE_RET rt = OPRT_OK;
#if defined(LED_NAME_2)
    TUYA_CALL_ERR_RETURN(__usr_register_ext_led());
#endif
    return rt;
}
```

Call order in `user_main()`:

```c
tal_sw_timer_init();          /* required before tdl_led_open() */
board_register_hardware();
usr_register_hardware();      /* after board, before TDL open */
```

Check `board-context.md` **Note:** and reserved pins — e.g. on T5AI-Board, GPIO28 is also `spk_en` (speaker enable). Pick a free GPIO or accept the conflict.

### New LED IC (not GPIO)

If the LED uses an I2C/SPI controller IC not in the SDK, create
`tdd_led_<ic>.h/.c` and implement `tdl_led_driver_register()` with the required callbacks.

---

## Step 3 — Application (TDL)

### Headers

```c
#include "tdl_led_manage.h"
```

### Usage template

> **`tal_sw_timer_init()` must run before `tdl_led_open()`.**  
> Flash/blink uses software timers; without init the device can crash on first timer use.

```c
#include "tal_api.h"
#include "tdl_led_manage.h"

void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 4096, (TAL_LOG_OUTPUT_CB)tkl_log_output);
    tal_sw_timer_init();          // call early — required before any TDL open
    tal_workq_init();

    /* Prerequisite: board_register_hardware() already called */

    /* Find LED device */
    TDL_LED_HANDLE_T led_hdl = tdl_led_find_dev(LED_NAME);
    if (NULL == led_hdl) {
        PR_ERR("LED device '%s' not found", LED_NAME);
        return;
    }

    /* Open */
    tdl_led_open(led_hdl);

    /* Control */
    tdl_led_set_status(led_hdl, TDL_LED_ON);      // turn on
    tdl_led_set_status(led_hdl, TDL_LED_OFF);     // turn off
    tdl_led_set_status(led_hdl, TDL_LED_TOGGLE);  // toggle

    /* Flash at 1 Hz (500 ms half-cycle) */
    tdl_led_flash(led_hdl, 500);

    /* Close */
    tdl_led_close(led_hdl);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_led_find_dev(name)` | Find registered LED; `LED_NAME`, `LED_NAME_2`, … |
| `tdl_led_open(hdl)` | Open device and init GPIO |
| `tdl_led_set_status(hdl, status)` | `TDL_LED_ON` / `TDL_LED_OFF` / `TDL_LED_TOGGLE` |
| `tdl_led_flash(hdl, half_cycle_ms)` | Symmetric flash; half-cycle in ms |
| `tdl_led_blink(hdl, &cfg)` | Custom blink pattern |
| `tdl_led_close(hdl)` | Close and release |

## Custom Blink

```c
TDL_LED_BLINK_CFG_T blink_cfg = {
    .cnt                    = 3,            // blink 3 times (TDL_BLINK_FOREVER = loop)
    .start_stat             = TDL_LED_ON,
    .end_stat               = TDL_LED_OFF,
    .first_half_cycle_time  = 200,          // on for 200 ms
    .latter_half_cycle_time = 800,          // off for 800 ms
};
tdl_led_blink(led_hdl, &blink_cfg);
```

---

## Kconfig reference (read-only — set via `app_default.config`)

| `app_default.config` | Effect |
|----------------------|--------|
| _(board selects)_ `ENABLE_LED` | Enables LED subsystem + slot 1 → `LED_NAME` |
| `CONFIG_ENABLE_LED_2=y` | Enables slot 2 → defines `LED_NAME_2` |
| `CONFIG_ENABLE_LED_3=y` | Enables slot 3 → defines `LED_NAME_3` (requires `ENABLE_LED_2`) |
| `CONFIG_ENABLE_LED_4=y` | Enables slot 4 → defines `LED_NAME_4` (requires `ENABLE_LED_3`) |
| `CONFIG_LED_NAME_K="…"` | Optional rename for slot K (string device name) |

Slots are **1–4** in SDK Kconfig and chained — enable every flag from
`ENABLE_LED_2` up to the slot you need. Enable one flag **per extra device** (board + `usr_board`), not a single total count.

---

## Agent checklist (extra GPIO LED)

1. Read `.tuyaopen/board-context.md` and board source — count **N** = LEDs already registered by BSP.
2. Enable the next slot: **`CONFIG_ENABLE_LED_<N+1>=y`** (add every chained flag up to it; max slot 4).
3. **`tos.py clean -f && tos.py build`** — verify `.build/include/tuya_kconfig.h` has `#define ENABLE_LED_<N+1> 1` and the `LED_NAME_<N+1>` macro you need.
4. Add **`usr_board/`** — register each extra on **`LED_NAME_(N+1)`**, `LED_NAME_(N+2)`, … (do not reuse board slots).
5. Wire **`usr_board` into CMakeLists.txt`** (see usr-board skill).
6. **`tal_sw_timer_init()`** before any `tdl_led_open()`.
7. `board_register_hardware()` then `usr_register_hardware()`.
8. App: `#if defined(LED_NAME_N)` + `tdl_led_find_dev(LED_NAME_N)` for the same slot(s).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `LED 'led2' not found` | Slot flag not enabled or wrong slot name | Enable `CONFIG_ENABLE_LED_<N+1>=y`; register/find matching `LED_NAME_N` |
| Log shows compile-time path skipped | Stale `tuya_kconfig.h` or slot flag not enabled | `tos.py clean -f && tos.py build`; grep `tuya_kconfig.h` for `ENABLE_LED_N` |
| Onboard LED works, external does not | Wrong GPIO, polarity, or pin conflict | Check wiring / polarity; pick free GPIO |
| Crash on first flash/blink | `tal_sw_timer_init()` not called | Call before `tdl_led_open()` |
| Registered name collides with board | Used `LED_NAME` or a slot BSP already owns | Count board LEDs; use next free `LED_NAME_N` |
| `LED_NAME_4` not defined though `ENABLE_LED_4=y` | Chain broken — `ENABLE_LED_2`/`_3` not enabled | Enable every flag from slot 2 up to your slot (contiguous) |

---

## Reference example

SDK: `examples/peripherals/led/` (onboard LED only, single `LED_NAME`).
