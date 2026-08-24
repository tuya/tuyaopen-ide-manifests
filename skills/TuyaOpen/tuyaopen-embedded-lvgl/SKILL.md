---
name: tuyaopen-embedded-lvgl
description: >-
  LVGL on a TuyaOpen board, both halves: writing the UI (widgets, Kconfig
  switches, **Chinese text**, images and GIFs) and running it on the host in an
  SDL2 window instead of reflashing for every layout tweak. Starts with the two
  things that are true for both and that people get wrong first — the SDK
  vendors LVGL **v8 and v9** and the choice changes the API, and configuration
  belongs in the project `.config` rather than `lv_conf.h`, whose macros are
  `#ifndef`-guarded and therefore silently lose to Kconfig. Depth is in two
  references: `development.md` and `simulator.md`.
  Use when writing or debugging LVGL screen code, adding widgets, choosing a
  font, showing an image, seeing blank boxes instead of Chinese characters,
  when the UI does not fit in flash, or when you want to preview the UI on the
  computer.
  TuyaOpen 开发板上的 LVGL，两半都在这里：写界面（控件、Kconfig 开关、**中文显示**、
  图片与 GIF），以及在电脑上用 SDL2 窗口跑起来、不必为看一次布局就重新烧板。
  开头两节是两半共用、也是最先踩的坑：SDK 同时内置 v8 与 v9 且 API 不同；
  配置要改工程 .config，不要改 lv_conf.h（它的宏被 #ifndef 包着，改了静默无效）。
license: Apache-2.0
compatibility:
  - TuyaOpen SDK with `src/liblvgl` (vendors LVGL v8 and v9)
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1
  - The simulator additionally needs Linux + SDL2 — see references/simulator.md
---

# LVGL on TuyaOpen

## No `tuyaopen` CLI coverage

Writing LVGL code, choosing fonts and driving the simulator have no `tuyaopen`
command. The knobs are Kconfig, reached through `tos.py config` / `menuconfig`;
compiling is `tuyaopen firmware build`, which belongs to skill
`tuyaopen-embedded-build`.

> **Naming trap**: `tuyaopen config` is **not** Kconfig — it reads and writes
> three IDE settings (language / gitMirror / manifestsSource). Kconfig is
> `tos.py config`. See `tuyaopen-embedded-project`.

## Which half do you need

| You want to… | Read |
|---|---|
| Write or change the UI — widgets, layout, **Chinese text**, images, GIFs, fonts that fit in flash | [references/development.md](references/development.md) |
| See the UI without reflashing — SDL2 window on the host, the entry-function contract, why it is Linux-only | [references/simulator.md](references/simulator.md) |

The two sections below come first because **both** references assume them.

## 1. First, always: which LVGL major version is this project on?

**The SDK vendors both.** `src/liblvgl/v8/` and `src/liblvgl/v9/` are both
present and both live — several shipped board configs pin v8 explicitly even
though the Kconfig default is v9.

```
choice LIBLVGL_VERSION      default LVGL_VERSION_9
    config LVGL_VERSION_8   bool "LVGL 8"
    config LVGL_VERSION_9   bool "LVGL 9"
```

**Check before writing a single line of UI code:**

```bash
grep -E 'CONFIG_LVGL_VERSION_[89]' <project>/app_default.config \
                                   <project>/config/<BOARD>.config
```

No `CONFIG_LVGL_VERSION_8=y` anywhere ⇒ you are on v9.

v8 and v9 differ in ways that fail at compile time (`lv_obj_set_style_*`
signatures, `lv_timer` vs `lv_task`, the draw/layer API, `lv_img` → `lv_image`
renames) and occasionally at runtime. **Do not mix examples across versions** —
read the vendored source under the version this project actually selects, not
whatever an upstream tutorial shows.


## 2. 改配置改哪个文件 —— `.config`，不是 `lv_conf.h`

LVGL 自己的配置文件是 `src/liblvgl/v9/conf/lv_conf.h`（v8 同构）。**大部分宏已经被
menuconfig 接管了，所以优先改工程的 `.config`。** 机制在 `lv_conf.h` 里看得很清楚：

```c
#ifndef LV_FONT_MONTSERRAT_14      // ← 只有在还没被定义时才生效
#define LV_FONT_MONTSERRAT_14 1
#endif
```

Kconfig 出来的值是以编译器 `-D` 进来的，**先于**这个头文件。所以：

- 一个**有** Kconfig 选项的宏，你在 `lv_conf.h` 里改它 —— `#ifndef` 已经不成立，你的
  改动**静默无效**。查半天查不出来，因为文件里白纸黑字写着你要的值。
- 而且 `lv_conf.h` 是 vendored 的 SDK 文件，`tuyaopen sdk update` 会把改动冲掉。

**规则**：先在 `Fonts_Kconfig` / `src/liblvgl/Kconfig` 里找有没有对应的 `CONFIG_*`；
有就写进工程的 `app_default.config` 或 `config/<BOARD>.config`。只有在**确认没有** Kconfig
选项时，才考虑动 `lv_conf.h`，并且要清楚它会被 SDK 更新覆盖。

## Not in scope

Display/touch **driver** bring-up and pin mapping → `tuyaopen-embedded-hardware`.
Compiling and Kconfig mechanics → `tuyaopen-embedded-build`. Adding a whole new
board → `tuyaopen-embedded-add-board`. Anything else: see the routing table in
skill `tuyaopen-shared`.
