---
name: tuyaos/speaker
description: >-
  TuyaOS speaker playback via tkl_ao_* / tkl_ai_* and fs helpers.
  喇叭、播放、MP3、tkl_ao、音频输出。
when_to_use: >-
  Use for TuyaOS speaker / audio play (board codec path).
id: tuyaos-speaker
surfaces: [embedded]
tags: [speaker, audio, tuyaos, tkl_ao]
---

# TuyaOS Speaker (`tkl_ao` / audio)

**Demo:** `…/examples/driver_speaker/speaker_play.c` (+ media assets)

## Key APIs

| Function | Role |
|----------|------|
| `tkl_ai_init` / `tkl_ai_start` / `tkl_ai_set_vol` | audio system bring-up in demo |
| `tkl_ao_set_vol` / `tkl_ao_put_frame` | output frames |
| `tkl_fs_mount` / `tkl_fopen` / `tkl_fread` | read media from flash/sd |
| `tkl_system_psram_malloc` / `_free` | decode buffers |

## Guidance

1. Prefer adapting `speaker_play.c` rather than inventing a new audio stack.
2. Confirm media location (inner flash vs SD) and volume with the user.
3. Not TuyaOpen `tdl_audio_*` / `tdl_audio_play`.
