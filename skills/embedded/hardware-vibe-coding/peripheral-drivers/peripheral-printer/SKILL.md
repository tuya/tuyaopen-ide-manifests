---
name: tuyaopen/peripheral-printer
description: >-
  TDL thermal printer usage for TuyaOpen: discover the printer, print UTF-8
  text (auto GBK conversion on ESC/POS), print 1-bit bitmaps, feed paper, and
  monitor paper/temperature status. 打印机、热敏打印、打印、小票、票据、出纸、ESC/POS、printer、DP48A。
when_to_use: >-
  Use when the user wants to print text, receipts, or images on a thermal
  printer, feed paper, or react to paper-out / overheated status events.

id: peripheral-printer
surfaces: [embedded]
tags: [printer, thermal, escpos, receipt, bitmap, dp48a]
---

# TuyaOpen TDL Thermal Printer

Two driver protocol families exist; the same TDL API drives both:

- **ESC/POS** (e.g. **DP48A**) — supports text (UTF-8 → GBK auto-conversion)
  and bitmaps; handles job framing internally, so `start()` / `end()` return
  `OPRT_NOT_SUPPORTED` (harmless — ignore).
- **RAW** (e.g. MTP02-DXD) — bitmap only, no text; `start()` / `end()` **are**
  required to frame a job.

Write code that tolerates `OPRT_NOT_SUPPORTED` from `start/end/send_text` so it
works on either driver.

## Driver Registration (TDD)

Decide by **adaptation, not by whether the SDK has the driver**:

- **Board-adapted printer** (in `board-context.md`) → `board_register_hardware()`
  registers it (e.g. DP48A via `tdd_printer_dp48_register(PRINTER_NAME, …)`); the
  app only uses the TDL API below.
- **Externally-attached printer** (the user wired their own — NOT in
  `board-context.md`) → register it yourself in **`usr_board`** (see
  `usr-board/SKILL.md`), reusing the SDK's printer driver.
  `board_register_hardware()` only wires printers the board adapted.

---

## Headers

```c
#include "tdl_printer_manage.h"
```

## Usage Template

```c
#include "tal_api.h"
#include "tkl_output.h"
#include "tdl_printer_manage.h"

static TDL_PRINTER_HANDLE s_printer_hdl = NULL;

/* Status callback — runs in the monitor thread context. */
static void app_printer_event_cb(TDL_PRINTER_HANDLE handle,
                                 TDL_PRINTER_EVENT_E event,
                                 void *data, void *arg)
{
    (void)handle; (void)data; (void)arg;
    switch (event) {
    case TDL_PRINTER_EVENT_PAPER_OUT:   PR_WARN("paper out");         break;
    case TDL_PRINTER_EVENT_PAPER_IN:    PR_NOTICE("paper loaded");    break;
    case TDL_PRINTER_EVENT_OVERHEATED:  PR_WARN("head overheated");   break;
    case TDL_PRINTER_EVENT_TEMP_NORMAL: PR_NOTICE("temp normal");     break;
    case TDL_PRINTER_EVENT_ERROR:       PR_ERR("printer error");      break;
    default: break;
    }
}

void app_printer_print_text(const char *utf8_text)
{
    if (OPRT_OK != tdl_printer_find(PRINTER_NAME, &s_printer_hdl)) {
        PR_ERR("printer '%s' not found", PRINTER_NAME);
        return;
    }

    /* Pass NULL for param to skip status monitoring. */
    TDL_PRINTER_OPEN_PARAM_T open_param = {
        .event_cb         = app_printer_event_cb,
        .event_cb_arg     = NULL,
        .poll_interval_ms = 0,   /* 0 = use Kconfig default */
    };
    if (OPRT_OK != tdl_printer_open(s_printer_hdl, &open_param)) {
        PR_ERR("printer open failed");
        return;
    }

    /* UTF-8 in; ESC/POS drivers convert to GBK automatically.
     * Returns OPRT_NOT_SUPPORTED on RAW drivers — treat as "skip". */
    OPERATE_RET rt = tdl_printer_send_text(s_printer_hdl, utf8_text);
    if (rt != OPRT_OK && rt != OPRT_NOT_SUPPORTED) {
        PR_ERR("send_text failed: %d", rt);
    }

    tdl_printer_paper_feed(s_printer_hdl, 40);   /* feed to tear position */
    tdl_printer_close(s_printer_hdl);
}
```

## Print a bitmap

```c
TDL_PRINTER_DEV_INFO_T info = {0};
tdl_printer_get_dev_info(s_printer_hdl, &info);   /* dots_per_line = paper width */

tdl_printer_start(s_printer_hdl);                 /* RAW needs it; ESC/POS → NOT_SUPPORTED (ignore) */
/* bmp: 1-bit, row-major, MSB first, (width+7)/8 bytes per row */
tdl_printer_send_bitmap(s_printer_hdl, 0 /*x*/, width, height, bmp);
tdl_printer_end(s_printer_hdl);                   /* mirrors start() */
```

Scale images to `info.dots_per_line` so they fit the paper width — anything
past the right edge is silently clipped.

## API Reference

| Function | Description |
|----------|-------------|
| `tdl_printer_find(name, &hdl)` | Find the registered printer (`PRINTER_NAME`) |
| `tdl_printer_open(hdl, &param)` | Open; `param` adds status monitoring (NULL = none) |
| `tdl_printer_get_dev_info(hdl, &info)` | Read `dots_per_line`, `bytes_per_line` |
| `tdl_printer_send_text(hdl, utf8)` | Print UTF-8 text (→GBK on ESC/POS; `OPRT_NOT_SUPPORTED` on RAW) |
| `tdl_printer_send_bitmap(hdl, x, w, h, data)` | Print a 1-bit MSB-first bitmap |
| `tdl_printer_send(hdl, data, len)` | Send raw protocol bytes |
| `tdl_printer_start(hdl)` / `tdl_printer_end(hdl)` | Frame a job (RAW); ESC/POS returns `OPRT_NOT_SUPPORTED` |
| `tdl_printer_paper_feed(hdl, lines)` | Feed `lines` dot-rows without printing |
| `tdl_printer_close(hdl)` | Close printer; stops the monitor thread |

## Status Events (`TDL_PRINTER_EVENT_E`)

| Event | Meaning |
|-------|---------|
| `TDL_PRINTER_EVENT_PAPER_OUT` | Out of paper |
| `TDL_PRINTER_EVENT_PAPER_IN` | Paper (re)loaded |
| `TDL_PRINTER_EVENT_OVERHEATED` | Print head too hot |
| `TDL_PRINTER_EVENT_TEMP_NORMAL` | Temperature back to normal |
| `TDL_PRINTER_EVENT_ERROR` | Generic printer error |

## Enable Macro and NAME Macro

```
CONFIG_ENABLE_PRINTER=y                 # enables the printer subsystem
CONFIG_PRINTER_NAME="printer"           # device name passed to tdl_printer_find()
CONFIG_PRINTER_POLL_INTERVAL_MS=500     # status poll interval (default)
```

For **board-adapted printers** the board Kconfig already selects these — do NOT
write them. Only set them when adding a custom printer via `usr_board`.

`PRINTER_NAME` is the name passed to `tdl_printer_find()`.

## Reference Example

`examples/peripherals/printer/`
