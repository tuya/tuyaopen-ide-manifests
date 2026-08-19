---
name: tuyaos/dvp
description: >-
  TuyaOS DVP camera capture/encode via tkl_vi / tkl_venc.
  DVP、摄像头、采集、H264、tkl_vi、tkl_venc。
when_to_use: >-
  Use for TuyaOS DVP camera init, encode, and frame dump flows.
id: tuyaos-dvp
surfaces: [embedded]
tags: [camera, dvp, tuyaos, tkl_vi, tkl_venc]
---

# TuyaOS DVP Camera (`tkl_vi` / `tkl_venc`)

**Demo:** `…/examples/driver_dvp/example_driver_dvp.c`

## Key APIs

| Function | Role |
|----------|------|
| `tkl_vi_init` / `tkl_vi_uninit` | video-in (DVP) |
| `tkl_venc_init` / `tkl_venc_uninit` | encoder (e.g. H.264) |
| `tkl_fs_*` | optional save to SD |
| `tal_mutex_*` | protect callbacks |

## Guidance

1. Read the full demo for sensor/config structs — they are platform-heavy.
2. Confirm resolution, sensor, and SD mount path with the user.
3. **Not** TuyaOpen `tdl_camera_*`.
4. Stop path: demo exposes `example_dvp_stop` — always provide a clean uninit.
