---
name: tuyaopen/peripheral-camera
description: >-
  TDL camera control for TuyaOpen: find device, configure resolution/fps/format,
  open with frame callbacks for YUV422 and JPEG/H264 encoded output.
  摄像头、相机、拍照、视频流、YUV、JPEG、H264、人脸识别、图像采集。
when_to_use: >-
  Use when the user wants to capture camera frames, stream video,
  take photos, or process image data (YUV422, JPEG, H264).

id: peripheral-camera
surfaces: [embedded]
tags: [camera, dvp, yuv, jpeg, h264, vision]
---

# TuyaOpen TDL Camera

## Driver Registration (TDD)

Decide by **adaptation, not by whether the SDK has the driver**:

- **Board-adapted camera** (listed in `board-context.md`) → `board_register_hardware()`
  registers it; write no TDD code.
- **Externally-attached camera** (the user wired it themselves — NOT in
  `board-context.md`) → register it yourself in **`usr_board`** (see
  `usr-board/SKILL.md`), reusing the SDK's per-IC register function below.
  `board_register_hardware()` does **not** wire a camera it never adapted.

Use the per-IC registration function (the driver IC is the device `model` in `.tuyaopen/ide/board.json`):

| Driver IC | Header | Register function |
|-----------|--------|------------------|
| GC2145 | `tdd_camera_gc2145.h` | `tdd_camera_dvp_gc2145_register()` |
| OV2640 | `tdd_camera_ov2640.h` | `tdd_camera_dvp_ov2640_register()` |

**Example** (values from `.tuyaopen/ide/board.json`):

```c
#include "tdd_camera_gc2145.h"

static OPERATE_RET __usr_register_camera(void)
{
    TDD_DVP_SR_USR_CFG_T cam_cfg = {
        .i2c = {
            .port = TUYA_I2C_NUM_0,
            .clk  = TUYA_GPIO_NUM_20,  // Pins: i2c_scl=GPIO20
            .sda  = TUYA_GPIO_NUM_21,  // Pins: i2c_sda=GPIO21
        },
        .clk = 0,                      // Config: clk=0 (internal clock)
        // .rst / .pwr: set if camera has reset/power GPIO
    };
    return tdd_camera_dvp_gc2145_register(CAMERA_NAME, &cam_cfg);
}
```

### New DVP camera IC with no SDK driver (still in `usr_board`)

The register functions above cover SDK-supported sensors. Only when the sensor
has **no SDK driver** do you also create `tdd_camera_<sensor>.h/.c` inside
`usr_board/` and implement the `TDD_DVP_SR_INTFS_T` callbacks — an addition to
the `usr_board` flow, not an alternative to it:

```c
/* tdd_camera_my_sensor.h */
#include "tdd_camera_dvp.h"
OPERATE_RET tdd_camera_my_sensor_register(char *name, TDD_DVP_SR_USR_CFG_T *cfg);
```

```c
/* tdd_camera_my_sensor.c */
#include "tdd_camera_my_sensor.h"
#include "tdd_camera_dvp_i2c.h"

/* Reset sensor via GPIO */
static OPERATE_RET __my_sensor_rst(TUYA_CAMERA_IO_CTRL_T *rst_pin, void *arg)
{
    tkl_gpio_write(rst_pin->pin, TUYA_GPIO_LEVEL_LOW);
    tal_system_sleep(10);
    tkl_gpio_write(rst_pin->pin, TUYA_GPIO_LEVEL_HIGH);
    tal_system_sleep(20);
    return OPRT_OK;
}

/* Send init registers via I2C */
static OPERATE_RET __my_sensor_init(DVP_I2C_CFG_T *i2c, void *arg)
{
    tdd_dvp_i2c_init(i2c);
    /* write sensor registers from datasheet */
    return OPRT_OK;
}

/* Configure resolution/fps */
static OPERATE_RET __my_sensor_set_ppi(DVP_I2C_CFG_T *i2c,
                                       TUYA_CAMERA_PPI_E ppi, uint16_t fps, void *arg)
{
    /* adjust sensor register settings for ppi/fps */
    return OPRT_OK;
}

static TDD_DVP_SR_INTFS_T sg_my_sensor_intfs = {
    .rst     = __my_sensor_rst,
    .init    = __my_sensor_init,
    .set_ppi = __my_sensor_set_ppi,
};

OPERATE_RET tdd_camera_my_sensor_register(char *name, TDD_DVP_SR_USR_CFG_T *cfg)
{
    TDD_DVP_SR_CFG_T sr_cfg = {
        .usr_cfg   = *cfg,
        .max_fps   = 30,
        .max_width = 1600, .max_height = 1200,
        .fmt       = TUYA_FRAME_FMT_YUV422,
    };
    return tdl_camera_dvp_device_register(name, &sr_cfg, &sg_my_sensor_intfs);
}
```

---

## Headers

```c
#include "tdl_camera_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_camera_manage.h"

/* YUV422 raw frame callback — use for display, AI inference */
static OPERATE_RET camera_raw_frame_cb(TDL_CAMERA_HANDLE_T hdl, TDL_CAMERA_FRAME_T *frame)
{
    if (NULL == frame) return OPRT_INVALID_PARM;
    PR_DEBUG("raw frame: %dx%d len=%u", frame->width, frame->height, frame->data_len);
    /* Process YUV422 data here:
     * - Display: tdl_disp_convert_yuv422_to_framebuffer() + tdl_disp_dev_flush()
     * - AI inference: pass directly to inference engine
     */
    return OPRT_OK;
}

/* JPEG encoded frame callback — use for upload, storage */
static OPERATE_RET camera_jpeg_frame_cb(TDL_CAMERA_HANDLE_T hdl, TDL_CAMERA_FRAME_T *frame)
{
    if (NULL == frame || !frame->is_complete) return OPRT_OK;
    PR_DEBUG("jpeg frame: %dx%d len=%u", frame->width, frame->height, frame->data_len);
    return OPRT_OK;
}

static TDL_CAMERA_HANDLE_T sg_camera_hdl = NULL;

static OPERATE_RET camera_init(void)
{
    sg_camera_hdl = tdl_camera_find_dev(CAMERA_NAME);
    if (NULL == sg_camera_hdl) { PR_ERR("camera '%s' not found", CAMERA_NAME); return OPRT_NOT_FOUND; }

    TDL_CAMERA_DEV_INFO_T info = {0};
    tdl_camera_dev_get_info(sg_camera_hdl, &info);
    PR_NOTICE("camera max: %dx%d @%dfps", info.max_width, info.max_height, info.max_fps);

    TDL_CAMERA_CFG_T cfg = {
        .fps                      = 15,
        .width                    = 640,
        .height                   = 480,
        .out_fmt                  = TDL_CAMERA_FMT_JPEG_YUV422_BOTH,
        .get_frame_cb             = camera_raw_frame_cb,
        .get_encoded_frame_cb     = camera_jpeg_frame_cb,
        .encoded_quality.jpeg_cfg = { .enable = 1, .max_size = 25, .min_size = 10 },
    };
    return tdl_camera_dev_open(sg_camera_hdl, &cfg);
}

void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 4096, (TAL_LOG_OUTPUT_CB)tkl_log_output);
    tal_sw_timer_init();
    tal_workq_init();

    /* Prerequisite: board_register_hardware() already called */

    TUYA_CALL_ERR_LOG(camera_init());

    while (1) { tal_system_sleep(1000); }
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_camera_find_dev(CAMERA_NAME)` | Find registered camera device |
| `tdl_camera_dev_get_info(hdl, &info)` | Query max resolution, fps, format support |
| `tdl_camera_dev_open(hdl, &cfg)` | Open camera and register frame callbacks |
| `tdl_camera_dev_close(hdl)` | Close camera (currently returns `OPRT_NOT_SUPPORTED`) |

## Output Formats

| Format | Description |
|--------|-------------|
| `TDL_CAMERA_FMT_YUV422` | YUV422 raw frames only |
| `TDL_CAMERA_FMT_JPEG` | JPEG encoded frames only |
| `TDL_CAMERA_FMT_H264` | H264 encoded frames only |
| `TDL_CAMERA_FMT_JPEG_YUV422_BOTH` | YUV422 + JPEG simultaneously (recommended) |
| `TDL_CAMERA_FMT_H264_YUV422_BOTH` | YUV422 + H264 simultaneously |

## YUV422 to Display

To preview camera frames on a display (use together with `peripheral-display`):

```c
#include "tdl_display_manage.h"

// inside camera_raw_frame_cb:
TDL_DISP_FRAME_BUFF_T *fb = tdl_disp_get_free_fb(fb_manage);
tdl_disp_convert_yuv422_to_framebuffer(frame->data, frame->width, frame->height, fb);
tdl_disp_dev_flush(disp_hdl, fb);
```

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_CAMERA=y         # enables camera and defines CAMERA_NAME
CONFIG_CAMERA_NAME="camera"    # device name (default "camera")
```

`CAMERA_NAME` is used to look up the device: `tdl_camera_find_dev(CAMERA_NAME)`.

## Reference Example

`examples/graphics/lvgl_camera/` — camera preview to display with LVGL + button toggle
