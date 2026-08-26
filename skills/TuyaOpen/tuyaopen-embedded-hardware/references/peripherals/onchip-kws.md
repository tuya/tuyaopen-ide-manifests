---
name: tuyaopen/onchip-kws
description: >-
  On-chip Keyword Spotting / wake-word (KWS) for TuyaOpen via the tkl_kws API:
  register a callback that fires when a wake word is detected.
  KWS、唤醒词、语音唤醒、关键词识别、wake word、你好涂鸦、tkl_kws、离线唤醒。
when_to_use: >-
  Use when the user wants offline wake-word / keyword detection (e.g. "你好涂鸦")
  to trigger an action. Runs on the mic stream (see the audio peripheral skill).

id: onchip-kws
surfaces: [embedded]
tags: [kws, wake-word, keyword, voice, audio, on-chip, tkl_kws]
---

# TuyaOpen On-Chip KWS (wake word)

## Works on the mic stream

KWS listens to **microphone audio** on-chip and calls you back when it hears a
wake word. Set up audio input first (see the **audio** peripheral skill).

## On-chip — no Kconfig, no TDD

- Platform-provided. **Do NOT** write `CONFIG_ENABLE_KWS`. No `app_default.config` change.
- No `board_register_hardware()`. Call `tkl_kws_*` directly. Single engine (no pins) —
  record as `onchip:kws` in `used-peripherals.json` if wanted.

## Platform spec — supported wake words

`.tuyaopen/ide/platform.json` → `peripherals.kws.spec.wakeupWords` lists the wake
words this board's model supports (e.g. `TKL_KWS_WAKEUP_NIHAO_TUYA`). The callback
receives a `TKL_KWS_WAKEUP_WORD_E` — branch on it; don't invent words not in the list.

## Register callback + enable

```c
#include "tal_api.h"
#include "tkl_kws.h"

/* Fires when a wake word is detected (model-dependent). */
static void app_kws_cb(TKL_KWS_WAKEUP_WORD_E word)
{
    switch (word) {
        case TKL_KWS_WAKEUP_NIHAO_TUYA: /* woken by "你好涂鸦" */ break;
        default: break;
    }
}

void app_kws_start(void)
{
    tkl_kws_init();
    tkl_kws_reg_wakeup_cb(app_kws_cb);
    tkl_kws_enable();           /* start listening */
}

void app_kws_stop(void)
{
    tkl_kws_disable();
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `tkl_kws_init()` | Initialise the KWS engine |
| `tkl_kws_reg_wakeup_cb(cb)` | Register `void cb(TKL_KWS_WAKEUP_WORD_E)` |
| `tkl_kws_enable()` / `tkl_kws_disable()` | Start / stop listening |
| `tkl_kws_deinit()` | Release the engine |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Callback never fires | Not enabled, or no mic audio | `tkl_kws_enable()`; ensure audio input is up |
| Wrong/no word matched | Word not in this model | Only handle words from `spec.wakeupWords` |
| Heavy CPU while idle | KWS left enabled always-on | Disable when not needed (`tkl_kws_disable`) |

## Reference

SDK: `src/ai_components/ai_mode/src/ai_mode_wakeup.c`
(`tkl_kws_reg_wakeup_cb` + `tkl_kws_enable`/`disable`, callback receives the wake word).
