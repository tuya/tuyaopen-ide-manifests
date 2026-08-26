---
name: tuyaopen/peripheral-leds-pixel
description: >-
  TDL addressable LED strip (pixel) usage for TuyaOpen: register a WS2812 /
  SM16703P / YX1903B strip, set per-pixel or whole-strip RGB color, and refresh
  the strip. 灯带、像素灯、幻彩、WS2812、可寻址、RGB灯带、跑马灯、流水灯、led strip、neopixel、pixel。
when_to_use: >-
  Use when the user wants to control an addressable RGB LED strip / ring /
  matrix (WS2812 / NeoPixel and compatibles) — per-pixel colors, animations.

id: peripheral-leds-pixel
surfaces: [embedded]
tags: [leds-pixel, ws2812, neopixel, strip, rgb, addressable]
---

# TuyaOpen TDL Addressable LED Strip (leds-pixel)

For **addressable** strips (WS2812 / SM16703P / YX1903B …) where each pixel has
its own color. This is **not** the single indicator LED — for that use
`peripheral-led`.

Write color into the pixel framebuffer, then **`tdl_pixel_dev_refresh()`** to
push it to the strip. Nothing shows until you refresh.

> **Usually a custom peripheral.** Unless the board adapts a strip, register the
> driver yourself (SPI port + RGB byte order) and add
> `CONFIG_ENABLE_LEDS_PIXEL=y` to `app_default.config`.

## Driver Registration (TDD)

```c
#include "tdd_pixel_ws2812.h"

static OPERATE_RET app_pixel_register(char *name)
{
    PIXEL_DRIVER_CONFIG_T cfg = {
        .port     = TUYA_SPI_NUM_0,    // WS2812 is driven over SPI timing
        .line_seq = RGB_ORDER,         // byte order: RGB / GRB / … per strip
    };
    return tdd_ws2812_driver_register(name, &cfg);
}
```

Other controllers: `tdd_sm16703p_driver_register()`, `tdd_yx1903b_driver_register()`,
or PWM-based via `tdd_pixel_pwm`. Pick the one matching the user's IC.

---

## Headers

```c
#include "tdl_pixel_dev_manage.h"
#include "tdl_pixel_color_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_pixel_dev_manage.h"
#include "tdl_pixel_color_manage.h"

#define APP_PIXEL_NAME  "led_pixel"
#define APP_PIXEL_NUM   60

static PIXEL_HANDLE_T s_pixel_hdl = NULL;

void app_pixel_init(void)
{
    app_pixel_register(APP_PIXEL_NAME);          /* TDD register (see above) */

    if (OPRT_OK != tdl_pixel_dev_find(APP_PIXEL_NAME, &s_pixel_hdl)) {
        PR_ERR("pixel strip not found");
        return;
    }

    PIXEL_DEV_CONFIG_T cfg = {
        .pixel_num        = APP_PIXEL_NUM,
        .pixel_resolution = 255,                 /* color channel full-scale */
    };
    if (OPRT_OK != tdl_pixel_dev_open(s_pixel_hdl, &cfg)) {
        PR_ERR("pixel open failed");
    }
}

/* Set the whole strip to one color. Channels are 0..pixel_resolution. */
void app_pixel_fill(uint16_t r, uint16_t g, uint16_t b)
{
    PIXEL_COLOR_T color = { .red = r, .green = g, .blue = b, .cold = 0, .warm = 0 };
    tdl_pixel_set_single_color_all(s_pixel_hdl, &color);
    tdl_pixel_dev_refresh(s_pixel_hdl);          /* REQUIRED to display */
}

/* Set a contiguous range starting at index_start. */
void app_pixel_set_range(uint32_t index_start, uint32_t count,
                         uint16_t r, uint16_t g, uint16_t b)
{
    PIXEL_COLOR_T color = { .red = r, .green = g, .blue = b };
    tdl_pixel_set_single_color(s_pixel_hdl, index_start, count, &color);
    tdl_pixel_dev_refresh(s_pixel_hdl);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdd_ws2812_driver_register(name, &cfg)` | Register a WS2812 strip (SPI `port` + `line_seq`) |
| `tdl_pixel_dev_find(name, &hdl)` | Find the registered strip |
| `tdl_pixel_dev_open(hdl, &cfg)` | Open with `pixel_num` + `pixel_resolution` |
| `tdl_pixel_set_single_color_all(hdl, &color)` | Set every pixel to one color |
| `tdl_pixel_set_single_color(hdl, start, num, &color)` | Set `num` pixels from `start` to one color |
| `tdl_pixel_set_multi_color(hdl, start, num, color_arr)` | Set `num` pixels from a color array |
| `tdl_pixel_get_color(hdl, index, &color)` | Read one pixel's current color |
| `tdl_pixel_dev_refresh(hdl)` | **Push the framebuffer to the strip — required after any set** |
| `tdl_pixel_dev_config(hdl, cmd, arg)` | Runtime config (e.g. `PIXEL_DEV_CMD_SET_PIXEL_NUM`) |
| `tdl_pixel_dev_close(hdl)` | Stop and release the device |

## Color struct

```c
typedef struct {
    uint16_t red;
    uint16_t green;
    uint16_t blue;
    uint16_t cold;   /* used by RGBCW strips; 0 for plain RGB */
    uint16_t warm;
} PIXEL_COLOR_T;       /* alias of LIGHT_RGBCW_T */
```

Each channel ranges `0 .. pixel_resolution` (set in `tdl_pixel_dev_open`, e.g.
255 or 1000). For a plain RGB strip leave `cold`/`warm` at 0.

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_LEDS_PIXEL=y        # enables the addressable-strip subsystem
CONFIG_LEDS_PIXEL_NAME="led_pixel" # device name passed to find()
```

`LEDS_PIXEL_NAME` is the name passed to `tdl_pixel_dev_find()` (and the TDD register).

## Reference Example

`examples/peripherals/leds-pixel/`
