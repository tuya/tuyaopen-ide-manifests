---
name: tuyaos/mic
description: >-
  TuyaOS microphone capture via tkl_ai_* + optional file write (tkl_fs).
  麦克风、录音、tkl_ai、采集音频。
when_to_use: >-
  Use for TuyaOS mic / AI audio capture / record-to-file flows.
id: tuyaos-mic
surfaces: [embedded]
tags: [mic, audio, tuyaos, tkl_ai]
---

# TuyaOS Mic / Recorder (`tkl_ai`)

**Demo:** `…/examples/driver_mic/example_recorder.c` (+ `wav_encode.*`)

## Key APIs

| Function | Role |
|----------|------|
| `tkl_ai_init` / `tkl_ai_start` / `tkl_ai_set_vol` | capture path |
| `tkl_ao_set_vol` / `tkl_ao_put_frame` | playback path if looping |
| `tkl_fs_mount` / `tkl_fopen` / `tkl_fwrite` / … | save WAV/PCM |
| `tkl_system_psram_malloc` / `_free` | large buffers |
| `tkl_gpio_*` | optional trigger pin |

## Guidance

1. Open the demo and copy the `TKL_AUDIO` config struct fields for this SDK.
2. Confirm sample rate / channels / trigger GPIO with the user.
3. PSRAM may be required on T5-class chips — follow demo allocators.
4. This is **not** TuyaOpen `tdl_audio_*`.
