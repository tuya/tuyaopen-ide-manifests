# Writing the LVGL UI

Depth for LVGL screen UI under skill `tuyaopen-embedded-hardware`. Read its SKILL.md first — the LVGL
version question and the `.config` rule are there, and both apply here.

## 1. Turning LVGL on

```
CONFIG_ENABLE_LIBLVGL=y        # implies ENABLE_DISPLAY
CONFIG_LVGL_COLOR_DEPTH=16     # 1 / 8 / 16 / 24 / 32; 16 = RGB565, the usual choice
CONFIG_ENABLE_LVGL_TP=y        # touch panel — implies ENABLE_TP
CONFIG_ENABLE_LVGL_DEMO=y      # LVGL's own demos; turn OFF for a real product
CONFIG_ENABLE_LVGL_MONITOR=y   # on-screen FPS/mem overlay; developer aid only
CONFIG_ENABLE_LVGL_ENCODER=y   # rotary encoder input
```

v9-only: `CONFIG_ENABLE_LVGL_OS_FREERTOS`. v8 additionally has its own
`LIBLVGL_V8_COLOR_DEPTH` choice, so on v8 the depth is set in **two** places
and they must agree.

Memory-side options seen in shipped board configs — reach for these when the
UI does not fit or tears: `CONFIG_ENABLE_LVGL_PARTIAL_FLUSH`,
`CONFIG_ENABLE_LVGL_DRAW_BUF_PSRAM`.

**Per-board config files decide most of this.** Examples carry a
`config/<BOARD>.config` per supported board plus an `app_default.config`; the
board file is where display driver, resolution and version pins live. Start
from the file for the board you actually have rather than from
`app_default.config`.

Working examples to read, all under `examples/graphics/`: `lvgl_demo`,
`lvgl_label`, `lvgl_gif`, `lvgl_photo_album`, `lvgl_camera`, `lvgl_simulator`.

## 2. 中文显示 — read this before choosing a font

### 2.1 `LV_FONT_SIMSUN_16_CJK` is **not** a Chinese font

It looks like one. Kconfig offers it under "Special Fonts", its help text says
*"SimSun 16 with 1000 most common CJK radicals"*, and enabling it makes some
Chinese appear. **It will still ship a broken UI.**

The font's own generator line records what it actually contains: ASCII
(`-r 0x20-0x7f`) plus a **fixed hand-picked symbol list** — 1272 symbols, of
which 1097 are han characters and 150 are Japanese kana. It is LVGL upstream's
demo symbol set, not a Chinese product vocabulary, and it mixes simplified,
traditional and Japanese forms.

Measured against ordinary IoT panel vocabulary:

| Renders | Blank box |
|---|---|
| 温度 · 电量 · 定时 · 取消 · 模式 · 首页 | **设置** · **开关** · **连接** · **亮度** · **网络** · **湿度** · **确认** |

That distribution is the trap: an agent enables the option, sees 温度 and 电量
render, concludes Chinese works, and ships a screen whose 设置 and 开关 labels
are empty rectangles. **A missing glyph does not warn — it draws nothing.**

Use it only for a throwaway demo. For any product screen, go to § 2.2.

### 2.2 The three ways to get real Chinese

| Path | What it is | Use when |
|---|---|---|
| **A · Pre-generated font in the SDK** | `src/ai_components/ai_ui/font/` already ships Alibaba PuHuiTi as C arrays at several sizes and bit depths (`font_puhui_14_1` … `font_puhui_30_4`, `AlibabaPuHuiTi3_Regular{16,20,30,40,65,120}`) | You want Chinese now and one of those sizes fits. **Check the size first — see § 2.3** |
| **B · Generate a subset yourself** | Run LVGL's font converter over a TTF with `--symbols` limited to the characters your UI actually uses | **The right answer for a product.** A panel has a fixed, countable vocabulary — usually a few hundred characters — and a subset of that size costs a fraction of a full font |
| **C · Runtime TTF** | `freetype` or `tiny_ttf`, both vendored under `src/liblvgl/v9/lvgl/src/libs/` | Text is not known at build time — user-named devices, cloud-driven strings. Costs RAM and CPU per glyph instead of flash |

For path B, collect the character set from the source rather than guessing:
extract every string literal your UI draws, plus anything that arrives from
DPs with a fixed enum, and feed the unique set to the converter. Re-run it when
you add UI text — a new label with an unlisted character is the same blank box
as § 2.1, just later.

### 2.2a 照着 SDK 里的实例做 —— `your_chat_bot`

路线 B 不用从零摸索，SDK 里有一份**完整的、正在用的**中文字库实现：

```
apps/tuya.ai/your_chat_bot/src/display2/ui_wechat/fonts/ui_font_puhui_18_2.c
```

它是用 LVGL 字体转换器从 **阿里普惠体**（`AlibabaPuHuiTi-3-55-Regular.ttf`）生成的，
参数 `--bpp 2 --size 18`，`--symbols` 是一份**按实际界面文案列出来的**字符集（不是全字库）。
文件头保留着完整的生成命令行 —— 要仿一份，直接读那一行，比查文档快。

三步，缺一不可：

```c
// ① 把生成的 .c 放进工程（和 your_chat_bot 一样，放在 src/…/fonts/ 下）

// ② 在头文件里声明
LV_FONT_DECLARE(ui_font_puhui_18_2);            // ui_wechat/ui.h:55

// ③ 用在控件上
lv_obj_set_style_text_font(label, &ui_font_puhui_18_2, LV_PART_MAIN | LV_STATE_DEFAULT);
```

**漏掉 ② 的表现是链接错误；漏掉 ③ 的表现是控件回落到默认字体，中文又变回空白框。**
后者不报错，所以每个要显示中文的控件都得显式设一次（或在父容器/主题上设）。

`your_chat_bot` 还展示了另一种做法：**把字号做成 app 级 Kconfig**，
`CONFIG_FONT_TEXT_SIZE_14_1` / `CONFIG_FONT_ICON_SIZE_14_1` / `CONFIG_FONT_EMOJI_SIZE_32`
（见 `apps/tuya.ai/your_chat_bot/Kconfig` 与各 `config/<BOARD>.config`），
不同屏幕尺寸的板子选不同字号，代码不动。屏幕尺寸跨度大的产品值得照抄这个结构。

### 2.3 Flash cost — check this before choosing a size

The pre-generated files in the SDK, measured on disk:

| File | Size |
|---|---|
| `font_puhui_30_4.c` | **19.5 MB** |
| `font_puhui_20_4.c` | **9.7 MB** |
| `font_puhui_16_4.c` | 6.8 MB |
| `AlibabaPuHuiTi3_Regular18_Static.c` | 3.5 MB |
| `font_puhui_14_1.c` | 2.0 MB |
| `lv_font_simsun_16_cjk.c` | 1.0 MB |

These are C source; the linked binary is smaller, but the ordering is what
matters: **a full CJK face at 4 bpp and 30 px is not a thing a T-series part
has room for.** The `_N` suffix is bits per pixel — `_4` is 4 bpp (smoothest,
4× the data of 1 bpp), `_1` is 1 bpp (aliased edges, smallest).

When it does not fit, in this order:

1. **Subset the character set** (path B) — by far the biggest win, and it costs
   nothing visually.
2. **Drop bpp** — 4 → 2 is a large saving and is usually acceptable at small
   sizes; 4 → 1 is visible.
3. **Drop the size** — do this last; it changes the design.

Do not "solve" it by falling back to § 2.1. That trades a build error you can see
for blank labels you cannot.

### 2.4 Deciding, in order

1. Does this screen need Chinese at all? A demo may not.
2. What sizes does the design use? Each size is a separate font object.
3. Is the text known at build time? No ⇒ path C. Yes ⇒ path B, or path A if a
   shipped size matches and it fits.
4. Enumerate the characters, generate, link, and **render every screen once
   with real strings** — a glyph gap is invisible until the label is drawn.

## 3. 图片、GIF、表情 —— SDK 里有现成的转换脚本

LVGL 显示图片要的是 C 数组或它能解的字节流，不是 PNG 文件。**不要自己写转换器**，
SDK 的 app 里有四类现成脚本，选型看你的屏：

| 脚本 | 做什么 | 什么时候用 |
|---|---|---|
| `apps/tuya_t5_pocket/tools/png2lvgl_raw.py` | 把 PNG **原字节**塞进 `lv_img_dsc_t` C 数组，运行时由 LVGL 内置 PNG 解码器（`LV_USE_PNG`）解 | 彩屏、图片多、想省编译期转换。代价是运行时解码要 CPU 和内存 |
| `apps/tuya.ai/your_desk_emoji/script/png_to_c_array.py` | PNG → 已展开的像素 C 数组，支持 `target_size` 缩放 | 想在编译期就定死像素格式、运行时零解码 |
| `apps/tuya.ai/your_chat_bot/src/display2/ui_chatbot/script/gif2Carray.py` | GIF → LVGL GIF 解码器能用的 C 源文件 | 动画/表情。要打开 LVGL 的 GIF 解码器 |
| `apps/tuya_t5_pocket/tools/bayer_dither.py`（配套 `compare_dither.py`、`ditter-converter/dittering.py`） | **抖动**：2×2 Bayer 四阶灰、8/16 阶灰、Atkinson 边缘、gamma 蛇形，带 `target_size` | **单色/少灰阶屏**（墨水屏、OLED）。直接把彩图二值化会糊成一片，抖动是让它还能看的办法 |

选型的分界线是**屏**：彩屏走前三个；单色或少灰阶屏**先抖动再转数组**，
`compare_dither.py` 就是用来横向比几种抖动算法哪个在你这块屏上好看的。

这些脚本都依赖 Pillow（`pip install -U Pillow`）。它们是 app 自带的工具，不是 SDK 公共
API —— 复制到你自己工程的 `tools/` 下再改，不要改 app 目录里的原件。

## 4. Iterating without reflashing

`LVGL_PC_SIMULATOR` runs the UI in an SDL2 window on the host, which turns a
layout tweak from a flash cycle into a rebuild. **Linux only**, and
[simulator.md](simulator.md) states the exact reason plus the four settings it
needs.

Fonts behave identically there, so the simulator is also the cheapest way to
catch a missing glyph (§ 2) before it reaches a board.

## Not in scope

Running the UI on the host → [simulator.md](simulator.md). Display/touch
**driver** bring-up and pin mapping → `tuyaopen-embedded-hardware`. Compiling
and Kconfig mechanics → `tuyaopen-embedded-build`. Adding a whole new board →
`tuyaopen-embedded-add-board`.
