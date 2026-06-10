---
name: tuyaopen/onchip-vad
description: >-
  On-chip Voice Activity Detection (VAD) for TuyaOpen via the tkl_vad API: detect
  speech vs silence from a mic audio stream.
  VAD、语音活动检测、人声检测、静音检测、断句、tkl_vad、是否在说话。
when_to_use: >-
  Use when the user wants to detect whether someone is speaking (speech vs
  silence) from the microphone stream — e.g. gate recording, end-pointing.
  Needs mic audio (see the audio peripheral skill).

id: onchip-vad
surfaces: [embedded]
tags: [vad, voice, speech-detect, audio, on-chip, tkl_vad]
---

# TuyaOpen On-Chip VAD (voice activity detection)

## Works on the mic stream

VAD analyses **microphone audio**. Set up audio input first (see the **audio**
peripheral skill), then feed captured PCM frames to VAD and poll its status.

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_VAD`. No `app_default.config` change.
- No `board_register_hardware()`. Call `tkl_vad_*` directly. Single engine (no pins) —
  record as `onchip:vad` in `used-peripherals.json` if wanted.

## Init, start, feed, poll

Config fields come from your audio format. Below are the real fields used by the SDK.

```c
#include "tal_api.h"
#include "tkl_vad.h"

void app_vad_init(uint32_t sample_rate, uint8_t channels)
{
    TKL_VAD_CONFIG_T cfg = {0};
    cfg.sample_rate       = sample_rate;     /* match the mic, e.g. 16000 */
    cfg.channel_num       = channels;        /* e.g. 1 */
    cfg.speech_min_ms     = 300;             /* min speech to assert SPEECH */
    cfg.noise_min_ms      = 800;             /* min silence to drop back */
    cfg.frame_duration_ms = 10;              /* feed in 10 ms frames */
    cfg.scale             = 1.0f;
    tkl_vad_init(&cfg);
    tkl_vad_start();
}

/* For each captured PCM frame: feed it, then check status. */
void app_vad_on_pcm(uint8_t *pcm, uint32_t len)
{
    tkl_vad_feed(pcm, len);
    if (tkl_vad_get_status() == TKL_VAD_STATUS_SPEECH) {
        /* speaking */
    } else {
        /* silence (TKL_VAD_STATUS_NONE) */
    }
}
```

Stop/restart around a session with `tkl_vad_stop()` / `tkl_vad_start()`.

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_vad_init(&cfg)` | `cfg.{sample_rate, channel_num, speech_min_ms, noise_min_ms, frame_duration_ms, scale}` |
| `tkl_vad_start()` / `tkl_vad_stop()` | Begin / end detection |
| `tkl_vad_feed(data, len)` | Feed a PCM frame |
| `tkl_vad_get_status()` | `TKL_VAD_STATUS_SPEECH` (1) / `TKL_VAD_STATUS_NONE` (0) |
| `tkl_vad_deinit()` | Release the engine |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Always silence | `sample_rate`/`channel_num` mismatch with the mic | Match the audio input format |
| Flaps speech/silence | Thresholds too tight | Raise `speech_min_ms` / `noise_min_ms` |
| No status changes | Not feeding, or feeding wrong frame size | Feed `frame_duration_ms`-sized PCM each call |

## Reference

SDK: `src/ai_components/ai_audio/src/ai_audio_input.c`
(`tkl_vad_init` with the fields above, `tkl_vad_start/feed/get_status/stop`).
