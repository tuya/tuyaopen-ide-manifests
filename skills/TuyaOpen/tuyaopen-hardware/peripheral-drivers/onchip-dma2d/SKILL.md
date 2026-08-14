---
name: tuyaopen/onchip-dma2d
description: >-
  On-chip 2D DMA (DMA2D) for TuyaOpen via the tal_dma2d API: hardware pixel-format
  conversion (e.g. YUV422→RGB565/888) and fast frame blit/memcpy.
  DMA2D、2D加速、像素格式转换、YUV转RGB、图像搬运、帧拷贝、tal_dma2d、硬件加速。
when_to_use: >-
  Use when the user wants hardware-accelerated image work: convert a frame
  between pixel formats (YUV422 ↔ RGB565/RGB888) or blit/copy a frame buffer
  fast, e.g. camera→display pipelines.

id: onchip-dma2d
surfaces: [embedded]
tags: [dma2d, graphics, pixel-format, on-chip, tal_dma2d]
---

# TuyaOpen On-Chip DMA2D (2D graphics accel)

## On-chip — no Kconfig, no TDD

- Platform-provided accelerator. **Do NOT** write `CONFIG_ENABLE_DMA2D`. No `app_default.config` change.
- No `board_register_hardware()`. Use the `tal_dma2d` wrapper directly. Single engine
  (no pins) — record as `onchip:dma2d` in `used-peripherals.json` if wanted.
- Frame buffers must satisfy the platform's alignment (often cache-line / 32–64 B) —
  align your in/out buffers or the engine may reject them.

## Platform spec — read, don't hardcode

`.tuyaopen/ide/platform.json` → `peripherals.dma2d.spec.formats` lists the supported
pixel formats (e.g. `TUYA_FRAME_FMT_YUV422` / `RGB565` / `RGB888`). Only convert
between formats listed there.

## Convert (e.g. YUV422 → RGB565)

```c
#include "tal_api.h"
#include "tal_dma2d.h"

static TAL_DMA2D_HANDLE_T s_dma2d = NULL;

OPERATE_RET app_yuv422_to_rgb565(uint8_t *in_buf, uint8_t *out_buf,
                                 uint16_t w, uint16_t h)
{
    OPERATE_RET rt = OPRT_OK;
    if (s_dma2d == NULL) {
        TUYA_CALL_ERR_RETURN(tal_dma2d_init(&s_dma2d));
    }

    TKL_DMA2D_FRAME_INFO_T in  = {0};
    TKL_DMA2D_FRAME_INFO_T out = {0};

    in.type   = TUYA_FRAME_FMT_YUV422;
    in.width  = w;  in.height = h;  in.pbuf = in_buf;

    out.type  = TUYA_FRAME_FMT_RGB565;
    out.width = w;  out.height = h;  out.pbuf = out_buf;

    /* region to process (clamp to the smaller of in/out) */
    in.width_cp  = w;
    in.height_cp = h;

    TUYA_CALL_ERR_RETURN(tal_dma2d_convert(s_dma2d, &in, &out));
    TUYA_CALL_ERR_RETURN(tal_dma2d_wait_finish(s_dma2d, 100 /* ms */));
    return rt;
}
```

Fast frame blit (same format, copy a region) → `tal_dma2d_memcpy(s_dma2d, &src, &dst)`
then `tal_dma2d_wait_finish`.

## API Reference

| Function | Description |
|----------|-------------|
| `tal_dma2d_init(&handle)` | Acquire the DMA2D engine; out: `TAL_DMA2D_HANDLE_T` |
| `tal_dma2d_convert(h, src, dst)` | Pixel-format convert src→dst frame |
| `tal_dma2d_memcpy(h, src, dst)` | Fast 2D blit/copy |
| `tal_dma2d_wait_finish(h, timeout_ms)` | Block until the op completes |
| `tal_dma2d_deinit(h)` | Release the engine |

`TKL_DMA2D_FRAME_INFO_T`: `type` (`TUYA_FRAME_FMT_*`), `width`, `height`, `pbuf`,
`width_cp` / `height_cp` (region to process).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| init / convert returns error | Buffer not aligned | Align in/out buffers to the platform's requirement (cache line) |
| Garbled output | Wrong `type` or unsupported format pair | Use formats from `spec.formats`; match width/height |
| Hang / timeout | Forgot `tal_dma2d_wait_finish`, or too-short timeout | Always wait; raise `timeout_ms` for large frames |

## Reference

SDK: `src/tal_image/src/tal_image_yuv422_to_rgb.c`
(`tal_dma2d_init` + frame setup + `tal_dma2d_convert` + `tal_dma2d_wait_finish`).
