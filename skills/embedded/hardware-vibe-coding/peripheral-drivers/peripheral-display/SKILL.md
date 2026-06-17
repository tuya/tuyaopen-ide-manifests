---
name: tuyaopen/peripheral-display
description: >-
  TDL display control for TuyaOpen: driver registration, open, brightness,
  and framebuffer flush via tdl_disp_* APIs.
  显示屏、LCD、屏幕、显示、绘制、亮度、刷屏。
when_to_use: >-
  Use when the user wants to use a display peripheral: register a driver,
  control brightness, or flush pixel data to the screen.

id: peripheral-display
surfaces: [embedded]
tags: [display, lcd, graphics, framebuffer]
---

# TuyaOpen TDL Display

## Driver Registration (TDD)

Decide by **adaptation, not by whether the SDK has the driver**:

- **Board-adapted display** (listed in `board-context.md`) → `board_register_hardware()`
  registers it; write no TDD code.
- **Externally-attached display** (the user wired it themselves — NOT in
  `board-context.md`) → register it yourself in **`usr_board`** (see
  `usr-board/SKILL.md`), reusing the SDK's per-IC driver below.
  `board_register_hardware()` does **not** wire a display it never adapted.

The TDD header depends on the Driver IC (the device `model` in `.tuyaopen/ide/board.json`):

| Interface | Driver IC examples | Header |
|-----------|-------------------|--------|
| SPI | GC9A01, ST7789, ST7305, ILI9341 | `tdd_disp_gc9a01.h`, `tdd_disp_st7789.h` … |
| RGB | ST7701S, GC9503 | `tdd_display_rgb.h` |
| MCU8080 | GC9307 | `tdd_display_mcu8080.h` |

**SPI display example** (values from `.tuyaopen/ide/board.json`):

```c
#include "tdd_disp_st7789.h"   // match header to Driver IC

static OPERATE_RET __usr_register_display(void)
{
    TDD_DISP_SPI_CFG_T display_cfg = {
        .cfg = {
            .width     = 240,                       // Resolution: 240×240
            .height    = 240,
            .pixel_fmt = TUYA_PIXEL_FMT_RGB565,     // PixelFormat: RGB565
            .port      = TUYA_SPI_NUM_0,            // Interface: SPI (port 0)
            .spi_clk   = 48000000,                  // Config: clk=48000000
            .cs_pin    = TUYA_GPIO_NUM_15,          // Pins: cs=GPIO15
            .dc_pin    = TUYA_GPIO_NUM_17,          // Pins: dc=GPIO17
            .rst_pin   = TUYA_GPIO_NUM_6,           // Pins: rst=GPIO6
        },
        .bl = {
            .type              = TUYA_DISP_BL_TP_GPIO,
            .gpio.pin          = TUYA_GPIO_NUM_5,   // Pins: bl=GPIO5
            .gpio.active_level = TUYA_GPIO_LEVEL_HIGH,
        },
        .rotation = TUYA_DISPLAY_ROTATION_0,
    };
    return tdd_disp_spi_st7789_register(DISPLAY_NAME, &display_cfg);
}
```

### New display IC with no SDK driver (still in `usr_board`)

When the IC has **no SDK driver**, all interface types support two approaches
(both still done inside `usr_board/`):
- **Override**: new IC is similar to an existing driver — call `set_init_seq()` to replace the default init sequence, then use the IC-specific `register()` as usual
- **Generic driver**: use the base interface driver with a fully custom config and init sequence

#### SPI

```c
/* Override existing IC (e.g. ST7789 variant with different init registers) */
#include "tdd_disp_st7789.h"
tdd_disp_spi_st7789_set_init_seq(sg_my_init_seq);   // then call tdd_disp_spi_st7789_register()

/* Generic SPI driver — IC not similar to any existing driver */
#include "tdd_display_spi.h"   // see header for init_seq byte format

static const uint8_t sg_my_init_seq[] = { /* IC datasheet register init */ };

TDD_DISP_SPI_CFG_T cfg = {
    .cfg = { /* width, height, pixel_fmt, port, spi_clk, cs/dc/rst pins */ },
    .bl       = { .type = TUYA_DISP_BL_TP_GPIO, .gpio = { .pin = TUYA_GPIO_NUM_5, .active_level = TUYA_GPIO_LEVEL_HIGH } },
    .init_seq = sg_my_init_seq,
    .rotation = TUYA_DISPLAY_ROTATION_0,
};
tdd_disp_spi_device_register(DISPLAY_NAME, &cfg);
```

#### MCU8080

Same pattern. `init_seq` is `const uint32_t *` (32-bit packed format — see `tdd_display_mcu8080.h`):

```c
/* Override existing IC */
#include "tdd_display_mcu8080_st7789.h"
tdd_disp_mcu8080_st7789_set_init_seq(sg_my_init_seq);

/* Generic MCU8080 driver */
#include "tdd_display_mcu8080.h"

static const uint32_t sg_my_init_seq[] = { /* see tdd_display_mcu8080.h for format */ };

TDD_DISP_MCU8080_CFG_T cfg = {
    .cfg      = { /* TUYA_8080_BASE_CFG_T */ },
    .bl       = { ... },
    .init_seq = sg_my_init_seq,
    .cmd_caset = 0x2A, .cmd_raset = 0x2B, .cmd_ramwr = 0x2C,
};
tdd_disp_mcu8080_device_register(DISPLAY_NAME, &cfg);
```

#### QSPI

Same pattern as SPI. `init_seq` is `const uint8_t *`:

```c
/* Override existing IC */
#include "tdd_display_qspi_co5300.h"
tdd_disp_qspi_co5300_set_init_seq(sg_my_init_seq);

/* Generic QSPI driver */
#include "tdd_display_qspi.h"

static const uint8_t sg_my_init_seq[] = { /* see tdd_display_qspi.h for format */ };

TDD_DISP_QSPI_CFG_T cfg = {
    .cfg      = { /* DISP_QSPI_BASE_CFG_T with refresh method and pixel cmd */ },
    .bl       = { ... },
    .init_seq = sg_my_init_seq,
};
tdd_disp_qspi_device_register(DISPLAY_NAME, &cfg);
```

#### RGB

RGB differs: config takes an `init_cb` function pointer instead of a byte array. The callback drives a software SPI to send the IC's register init sequence before the RGB signal starts:

```c
#include "tdd_display_rgb.h"
#include "tdd_disp_sw_spi.h"

/* Override existing IC */
tdd_disp_rgb_st7701s_set_init_seq(sg_my_init_seq);

/* Generic RGB driver with custom init callback */
static TDD_DISP_SW_SPI_CFG_T sg_sw_spi = {
    .spi_clk = TUYA_GPIO_NUM_X,   // Pins: clk=GPIOX
    .spi_sda = TUYA_GPIO_NUM_X,   // Pins: sda=GPIOX
    .spi_csx = TUYA_GPIO_NUM_X,   // Pins: cs=GPIOX
    .spi_dc  = TUYA_GPIO_NUM_X,
    .spi_rst = TUYA_GPIO_NUM_X,
};

static const uint8_t sg_my_init_seq[] = { /* software SPI init bytes */ };

static OPERATE_RET __my_ic_init_cb(void)
{
    tdd_disp_sw_spi_init(&sg_sw_spi);
    tdd_disp_sw_spi_lcd_init_seq(&sg_sw_spi, sg_my_init_seq);
    return OPRT_OK;
}

TDD_DISP_RGB_CFG_T cfg = {
    .cfg     = { /* TUYA_RGB_BASE_CFG_T */ },
    .bl      = { ... },
    .init_cb = __my_ic_init_cb,
};
tdd_disp_rgb_device_register(DISPLAY_NAME, &cfg);
```

#### I2C and Other Buses

For I2C OLEDs compatible with SSD1306, use `tdd_disp_i2c_oled_ssd1306_register()` directly.

For other buses (I2C with different IC, UART, custom parallel, etc.), create
`tdd_disp_<ic>.h/.c` and implement the three `TDD_DISP_INTFS_T` callbacks:

```c
#include "tdl_display_driver.h"

static OPERATE_RET __my_disp_open(TDD_DISP_DEV_HANDLE_T dev)
{
    /* initialize bus, send IC init sequence */
    return OPRT_OK;
}

static OPERATE_RET __my_disp_flush(TDD_DISP_DEV_HANDLE_T dev, TDL_DISP_FRAME_BUFF_T *fb)
{
    /* write fb->frame (fb->len bytes) to display over custom bus */
    return OPRT_OK;
}

static OPERATE_RET __my_disp_close(TDD_DISP_DEV_HANDLE_T dev)
{
    return OPRT_OK;
}

static TDD_DISP_INTFS_T sg_intfs = {
    .open  = __my_disp_open,
    .flush = __my_disp_flush,
    .close = __my_disp_close,
};

static OPERATE_RET __usr_register_display(void)
{
    TDD_DISP_DEV_INFO_T info = {
        .width    = 128,
        .height   = 64,
        .fmt      = TUYA_PIXEL_FMT_MONO,
        .rotation = TUYA_DISPLAY_ROTATION_0,
    };
    return tdl_disp_device_register(DISPLAY_NAME, NULL, &sg_intfs, &info);
}
```

---

## Headers

```c
#include "tdl_display_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_display_manage.h"

void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 4096, (TAL_LOG_OUTPUT_CB)tkl_log_output);

    /* Prerequisite: board_register_hardware() already called */

    /* Find and open display device */
    TDL_DISP_HANDLE_T disp_hdl = tdl_disp_find_dev(DISPLAY_NAME);
    if (NULL == disp_hdl) { PR_ERR("display '%s' not found", DISPLAY_NAME); return; }
    tdl_disp_dev_open(disp_hdl);

    /* Query display info */
    TDL_DISP_DEV_INFO_T info;
    tdl_disp_dev_get_info(disp_hdl, &info);
    PR_NOTICE("display: %dx%d fmt=%d", info.width, info.height, info.fmt);

    /* Set brightness (0-100) */
    tdl_disp_set_brightness(disp_hdl, 80);

    /* Allocate framebuffer, fill pixels, and flush */
    uint32_t fb_size = info.width * info.height * 2;  // RGB565: 2 bytes/pixel
    TDL_DISP_FRAME_BUFF_T *fb = tdl_disp_create_frame_buff(DISP_FB_RAM_SRAM, fb_size);
    if (fb) {
        uint16_t *pixels = (uint16_t *)fb->frame;
        for (uint32_t i = 0; i < info.width * info.height; i++) {
            pixels[i] = 0xF800;  // red in RGB565
        }
        fb->len = fb_size;
        tdl_disp_dev_flush(disp_hdl, fb);
        tdl_disp_free_frame_buff(fb);
    }

    tdl_disp_dev_close(disp_hdl);
}
```

---

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_disp_find_dev(DISPLAY_NAME)` | Find registered display device |
| `tdl_disp_dev_open(hdl)` | Open device and init backlight |
| `tdl_disp_dev_get_info(hdl, &info)` | Get width, height, pixel format, rotation |
| `tdl_disp_set_brightness(hdl, 0-100)` | Set backlight brightness |
| `tdl_disp_create_frame_buff(type, len)` | Allocate framebuffer (`DISP_FB_RAM_SRAM` or `DISP_FB_RAM_PSRAM`) |
| `tdl_disp_dev_flush(hdl, fb)` | Push framebuffer content to screen |
| `tdl_disp_free_frame_buff(fb)` | Free framebuffer |
| `tdl_disp_dev_close(hdl)` | Close device |

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_DISPLAY=y        # enables display and defines DISPLAY_NAME
CONFIG_DISPLAY_NAME="display"  # device name (default "display")
```

`DISPLAY_NAME` is used to look up the device: `tdl_disp_find_dev(DISPLAY_NAME)`.

Only use `DISPLAY_NAME_2` when the user **explicitly needs two independent displays
at the same time** (e.g. selecting a dual-eye group where left/right screens must
be controlled separately). For a single display — which is the common case — use
only `DISPLAY_NAME`.

## Note on LVGL

LVGL is a UI framework that runs on top of this display driver. To use LVGL,
the display driver must be registered first; LVGL binds to it via `lv_vendor_init(DISPLAY_NAME)`.

## Reference Example

`examples/peripherals/display/`
