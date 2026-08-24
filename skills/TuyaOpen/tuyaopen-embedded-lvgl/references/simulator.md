# LVGL PC Simulator

Depth for skill `tuyaopen-embedded-lvgl`. Read its SKILL.md first — the LVGL
version question and the `.config` rule are there, and both apply here.

## Shortcuts

| Intent | Command |
|---|---|
| List the app's available configs | `tos.py config choice -l` |
| Select a config without the interactive menu | `tos.py config choice -c <NAME>.config` |
| Check the simulator switches actually took effect | `tos.py config get LVGL_PC_SIMULATOR SIM_ENTRY_FUNC PLATFORM_CHOICE` |
| Build | `tos.py build` |
| Toggle options by hand | `tos.py config menu` → *LVGL PC Simulator (SDL)* |

## 1. What the simulator actually is

Three files, and reading them answers most questions faster than any doc:

```
src/liblvgl/simulator/Kconfig            the LVGL_PC_SIMULATOR option + its 4 settings
src/liblvgl/simulator/CMakeLists.txt     links SDL2 via pkg-config
src/liblvgl/simulator/src/lvgl_sim.c     provides main(), creates the window, runs the loop
```

`lvgl_sim.c` **provides its own `main()`**. That is the whole design: the app's
normal entry point and its cloud/audio/network stack are not part of the
binary. The Kconfig help says it plainly — *"Only display/UI code will be
compiled."* The loop is `lv_timer_handler()` + `usleep`, capped at 50 ms.

It creates an SDL window plus **mouse and keyboard** input devices, and binds
the keyboard to the default group — so focus-based widget navigation works
without any app-side wiring.

## 2. The entry contract — one function

The simulator calls exactly one app function after LVGL init:

```c
/* injected as a compile definition: LVGL_SIM_ENTRY_FUNC=${CONFIG_SIM_ENTRY_FUNC} */
extern void LVGL_SIM_ENTRY_FUNC(void);
```

Default `CONFIG_SIM_ENTRY_FUNC` is **`ui_init`**, with signature
`void ui_init(void)`. If the app's UI entry has another name, set
`CONFIG_SIM_ENTRY_FUNC` rather than renaming the app's function.

**A mismatch here is a link error, not a runtime surprise** — the `extern`
declaration has no definition, so `tos.py build` fails at the link step naming
the missing symbol. That is the good failure mode; do not "fix" it by stubbing
the function.

Apps in-tree that already expose `void ui_init(void)`:
`apps/tuya.ai/your_chat_bot/src/display2/ui_chatbot/ui.c`,
`.../ui_wechat/ui.c`, and
`apps/tuya_t5_pocket/tuya_t5_pocket_ai/src/display/ui/screen_manager.c`.
Several other apps use a `static __ui_init()` instead — those need either a
non-static wrapper or a `CONFIG_SIM_ENTRY_FUNC` pointing at something they do
export.

## 3. The four settings

| Kconfig | Default | Notes |
|---|---|---|
| `SIM_SCREEN_WIDTH` | `384` | Match the real panel, or the layout you see is not the layout you ship |
| `SIM_SCREEN_HEIGHT` | `168` | " |
| `SIM_WINDOW_TITLE` | `TuyaOpen LVGL Simulator` | Cosmetic |
| `SIM_ENTRY_FUNC` | `ui_init` | See § 2 |

`LV_USE_SDL` is **not** a separate switch to find and flip — `lv_conf.h` keys
it off the `LVGL_PC_SIMULATOR` compile definition:

```c
#ifdef LVGL_PC_SIMULATOR
    #define LV_USE_SDL              1
#else
    #define LV_USE_SDL              0
#endif
```

So selecting the Kconfig option is the whole switch. `LV_USE_X11`,
`LV_USE_LINUX_FBDEV` and `LV_USE_LINUX_DRM` are all `0` and are not wired to
anything in TuyaOpen — SDL2 is the only backend on this path.

## 4. Run it — the path that is known to work

`apps/tuya_t5_pocket/tuya_t5_pocket_ai` ships a ready-made simulator config.
Use it first to prove the host toolchain and SDL2 are fine, *before* adapting
your own app:

```bash
sudo apt-get install -y libsdl2-dev        # Debian/Ubuntu; see § 6 for the check
cd TuyaOpen/apps/tuya_t5_pocket/tuya_t5_pocket_ai
tos.py config choice -c TUYA_LINUX_LVGL_SIMULATOR.config
tos.py config get LVGL_PC_SIMULATOR SIM_ENTRY_FUNC PLATFORM_CHOICE
#   CONFIG_LVGL_PC_SIMULATOR=y
#   CONFIG_SIM_ENTRY_FUNC=ui_init
#   CONFIG_PLATFORM_CHOICE=LINUX
tos.py build
./dist/<app>_<ver>/<app>_<ver>.elf
```

That config is five lines, and they are the complete recipe:

```
CONFIG_PROJECT_VERSION="0.0.1"
CONFIG_BOARD_CHOICE_LINUX=y
CONFIG_BOARD_CHOICE_UBUNTU=y
CONFIG_ENABLE_LIBLVGL=y
CONFIG_LVGL_PC_SIMULATOR=y
```

Measured result: `BUILD SUCCESS`, `Platform: LINUX / Chip: Ubuntu`, producing a
6.9 MB x86-64 PIE ELF with debug info. `nm` shows `main`, `lvgl_sim_start`,
`lv_sdl_window_create` and `ui_init`. Run headless to smoke-test without a
display:

```bash
SDL_VIDEODRIVER=dummy timeout 6 ./dist/.../*.elf
```

…which printed the app's own UI log lines (`[Manager] Loading to new screen`),
i.e. `ui_init` ran and the LVGL loop was turning.

> ⚠ **`tos.py config choice` rewrites the app's `app_default.config`.**
> Measured: selecting the simulator config replaced that file's contents and
> left the SDK's git tree dirty. If the app is a git checkout, commit or stash
> first, and `git checkout -- app_default.config` when you switch back to a
> board build. Nothing warns you.

## 5. Adapting an app that has no simulator config

`your_chat_bot` is the interesting case: its `CMakeLists.txt` **already has the
simulator branch** (`if (CONFIG_LVGL_PC_SIMULATOR STREQUAL "y")` → display-only
library, `ENABLE_CHAT_DISPLAY2=1`), and `src/display2/CMakeLists.txt` drops
`app_display.c` / `tuya_lvgl.c` in simulator mode — but there is **no
`*_LVGL_SIMULATOR.config`** among its 20 configs. So the code supports it and
only the config is missing. Add one:

```bash
cd TuyaOpen/apps/tuya.ai/your_chat_bot
cat > config/LINUX_LVGL_SIMULATOR.config <<'EOF'
CONFIG_PROJECT_VERSION="1.0.0"
CONFIG_BOARD_CHOICE_LINUX=y
CONFIG_BOARD_CHOICE_UBUNTU=y
CONFIG_ENABLE_LIBLVGL=y
CONFIG_LVGL_PC_SIMULATOR=y
CONFIG_SIM_SCREEN_WIDTH=<your panel width>
CONFIG_SIM_SCREEN_HEIGHT=<your panel height>
EOF
tos.py config choice -c LINUX_LVGL_SIMULATOR.config
tos.py build
```

Two things to check for any app before assuming this works:

1. **Does the app's `CMakeLists.txt` branch on `CONFIG_LVGL_PC_SIMULATOR`?**
   If not, the build will pull in the app's full non-display stack and fail on
   the LINUX platform. `grep -n LVGL_PC_SIMULATOR CMakeLists.txt` answers it.
2. **Is there a non-static UI entry?** See § 2.

An app failing (1) is a real porting task — adding the branch — not a config
tweak. Say so rather than pretending the config alone is enough.

## 6. Linux only, and the reason is not the simulator

The Kconfig gate is explicit:

```
menuconfig LVGL_PC_SIMULATOR
    depends on ENABLE_LIBLVGL && PLATFORM_LINUX
```

`PLATFORM_LINUX` comes from `boards/LINUX/Kconfig`, i.e. the **LINUX platform**
(`TuyaOpen-ubuntu`). And that is where portability actually dies — *not* in
`lvgl_sim.c`, which is plain POSIX (`unistd.h`, `usleep`) and would build
anywhere SDL2 does.

The measured reason: a simulator build still compiles the whole LINUX
platform adapter. The build log shows `tkl_gpio.c`, `tkl_spi.c`, `tkl_i2c.c`,
`tkl_wifi.c` and friends going through the compiler, and those include
**Linux kernel UAPI headers**:

| File | Includes |
|---|---|
| `tkl_gpio.c` | `<linux/gpio.h>`, `<sys/ioctl.h>` |
| `tkl_spi.c` | `<linux/spi/spidev.h>` |
| `tkl_i2c.c` | `<linux/i2c-dev.h>`, `<linux/i2c.h>` |

plus ALSA (`collect_library(... "asound")` in the platform's
`tuyaopen_adapter.cmake`).

So:

| Host | Works? |
|---|---|
| **Linux x86-64** | ✅ verified end to end (build + headless run) |
| **WSL2** | Very likely — it is Linux; needs an X/Wayland path for the window (WSLg, or `SDL_VIDEODRIVER=dummy` for a smoke test). **Not verified here** |
| **macOS** | ❌ the LINUX adapter cannot compile — `linux/*` headers do not exist, ALSA is not the audio layer. Not a config problem |
| **Windows (native)** | ❌ same reason, more so |

**What porting would actually require** is decoupling the simulator from the
LINUX platform adapter — a display-only build that compiles
`src/liblvgl/simulator/` + the app's UI sources and *no* `tuyaos_adapter`. The
app-side CMake branches (§ 5) are already most of the way there; the platform
layer is the part that is not. Do not tell a user "just install SDL2 on your
Mac".

SDL2 check, before blaming anything else:

```bash
pkg-config --exists sdl2 && pkg-config --modversion sdl2   # verified with 2.30.0
```

The CMake is `pkg_check_modules(SDL2 REQUIRED sdl2)`, so a missing dev package
fails at **configure** time with a pkg-config error — not a confusing link
error later.

Note the linkage is not what you might assume: on the verified machine SDL2
came out **statically linked** (`SDL_Init` / `SDL_CreateWindow` defined inside
the ELF, no `libSDL2` in `ldd`). Don't diagnose a missing-window problem by
looking for a shared SDL2 dependency that was never there.

## Not in scope

Writing the UI itself — widgets, fonts, Chinese text, images →
[development.md](development.md).

### Also out of scope

Panel/board bring-up, real-device display drivers, LVGL widget APIs, and
anything to do with flashing. This skill is only the host simulator loop.
For the routing table to the rest, see skill `tuyaopen-shared`'s
`references/ROUTING.md`.
