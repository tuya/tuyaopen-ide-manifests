---
name: tuyaopen/peripheral-audio
description: >-
  TDL audio codec usage for TuyaOpen: discover the audio device, capture
  microphone PCM frames via callback, play PCM back to the speaker, and set
  volume. 音频、麦克风、录音、播放、喇叭、扬声器、speaker、mic、声音、语音、codec。
when_to_use: >-
  Use when the user wants to record from the microphone, play audio to the
  speaker, adjust volume, or build a voice / audio-loopback feature.

id: peripheral-audio
surfaces: [embedded]
tags: [audio, codec, microphone, speaker, mic, pcm, voice]
---

# TuyaOpen TDL Audio

One TDL audio device covers **both** the microphone (capture) and the speaker
(playback). Capture is callback-driven; playback is a blocking write.

## Driver Registration (TDD)

Decide by **adaptation, not by whether the SDK has the driver**:

- **Board-adapted audio** (in `board-context.md`) → `board_register_hardware()`
  registers the codec; the app only uses the TDL API below — don't register it yourself.
- **Externally-attached codec** (the user wired their own — NOT in
  `board-context.md`) → register it yourself in **`usr_board`** (see
  `usr-board/SKILL.md`), reusing the SDK's codec driver.
  `board_register_hardware()` only wires codecs the board adapted.
  - **On ESP32** an external codec uses the `esp_codec_dev` / esp-idf I2S SDK, NOT reachable
    from `usr_board/` — put the driver in an `esp_components/<name>/` component instead. See
    `usr-board/SKILL.md` → *ESP32: esp-idf-backed custom drivers*.

---

## Headers

```c
#include "tdl_audio_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tkl_memory.h"
#include "tuya_ringbuf.h"
#include "tdl_audio_manage.h"

static TDL_AUDIO_HANDLE_T s_audio_hdl = NULL;
static TDL_AUDIO_INFO_T   s_audio_info = {0};

/* Microphone callback — type is TDL_AUDIO_MIC_CB. Runs in driver context.
 * Keep it short: copy data into a ring buffer / queue and return.
 * Do NOT call tdl_audio_play() here. */
static void app_audio_mic_cb(TDL_AUDIO_FRAME_FORMAT_E type,
                             TDL_AUDIO_STATUS_E status,
                             uint8_t *data, uint32_t len)
{
    /* `type` is TDL_AUDIO_FRAME_FORMAT_PCM for raw capture.
     * `status` carries VAD info (TDL_AUDIO_STATUS_VAD_START / _VAD_END …). */
    (void)type; (void)status;
    /* e.g. tuya_ring_buff_write(s_rb, data, len); */
}

void app_audio_init(void)
{
    if (OPRT_OK != tdl_audio_find(AUDIO_CODEC_NAME, &s_audio_hdl)) {
        PR_ERR("audio '%s' not found", AUDIO_CODEC_NAME);
        return;
    }

    /* Pass NULL for mic_cb if you only need playback. */
    if (OPRT_OK != tdl_audio_open(s_audio_hdl, app_audio_mic_cb)) {
        PR_ERR("audio open failed");
        return;
    }

    /* frame_size = bytes per capture frame; use it to size your buffers. */
    tdl_audio_get_info(s_audio_hdl, &s_audio_info);
    PR_NOTICE("audio: rate=%u ch=%u bits=%u tm=%ums frame=%u",
              s_audio_info.sample_rate, s_audio_info.sample_ch_num,
              s_audio_info.sample_bits, s_audio_info.sample_tm_ms,
              s_audio_info.frame_size);

    tdl_audio_volume_set(s_audio_hdl, 60);   /* 0–100 */
}

/* Play one PCM buffer (blocking until queued). */
void app_audio_play(uint8_t *pcm, uint32_t len)
{
    tdl_audio_play(s_audio_hdl, pcm, len);
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_audio_find(name, &hdl)` | Find the registered audio device (`AUDIO_CODEC_NAME`) |
| `tdl_audio_open(hdl, mic_cb)` | Open device; `mic_cb` (type `TDL_AUDIO_MIC_CB`) receives capture frames (NULL = playback-only) |
| `tdl_audio_get_info(hdl, &info)` | Read `sample_rate`, `sample_ch_num`, `sample_bits`, `sample_tm_ms`, `frame_size` |
| `tdl_audio_play(hdl, data, len)` | Play PCM data to the speaker |
| `tdl_audio_play_stop(hdl)` | Stop / flush current playback |
| `tdl_audio_volume_set(hdl, vol)` | Set speaker volume, `vol` 0–100 |
| `tdl_audio_close(hdl)` | Close device and release resources |

## Mic Callback: type & status

```c
/* TDL_AUDIO_FRAME_FORMAT_E (frame `type`) */
TDL_AUDIO_FRAME_FORMAT_PCM   // 0 — raw PCM (most common)
TDL_AUDIO_FRAME_FORMAT_SPEEX // 1
TDL_AUDIO_FRAME_FORMAT_OPUS  // 2
TDL_AUDIO_FRAME_FORMAT_MP3   // 3

/* TDL_AUDIO_STATUS_E (`status`) — voice-activity hints */
TDL_AUDIO_STATUS_VAD_START   // 1 — speech started
TDL_AUDIO_STATUS_VAD_END     // 2 — speech ended
TDL_AUDIO_STATUS_RECEIVING   // 3
TDL_AUDIO_STATUS_RECV_FINISH // 4
```

## Record → Playback (loopback) pattern

The mic callback runs in driver context — never play from inside it. Buffer the
PCM in a `tuya_ringbuf`, then drain it from your own task:

```c
/* sizing: buffer N ms of audio */
uint32_t buf_len = (record_ms / s_audio_info.sample_tm_ms) * s_audio_info.frame_size;
tuya_ring_buff_create(buf_len, OVERFLOW_PSRAM_STOP_TYPE, &s_rb);
/* mic_cb: tuya_ring_buff_write(s_rb, data, len);
 * task:  read frame_size chunks → tdl_audio_play() */
```

Large buffers belong in PSRAM (`tkl_system_psram_malloc` / `tkl_system_psram_free`).

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_AUDIO_CODECS=y      # enables the audio codec subsystem
CONFIG_AUDIO_CODEC_NAME="audio"   # device name passed to tdl_audio_find()
CONFIG_AUDIO_CODECS_NUM=1         # number of codecs
```

For **board-adapted audio** the board Kconfig already selects these — do NOT
write them. Only set them when adding a custom codec via `usr_board`.

`AUDIO_CODEC_NAME` is the name passed to `tdl_audio_find()`.

## Reference Example

`examples/peripherals/audio_codecs/`
