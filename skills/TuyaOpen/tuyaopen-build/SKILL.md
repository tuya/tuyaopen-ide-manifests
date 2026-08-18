---
name: tuyaopen-build
description: >-
  Build and compile TuyaOpen projects via the `tuyaopen firmware build/clean`
  CLI (IDE-scaffolded projects) or `tos.py build`/`tos.py clean` (raw SDK
  checkouts), select build configurations, edit Kconfig options, and run
  Linux ELF binaries. Covers the `tuyaopen config` vs `tos.py config` naming
  trap. Use when the user mentions compiling, building, tos.py build,
  tuyaopen firmware build, config choice, menuconfig, Kconfig, build error,
  or running a project.
  项目编译、构建、tuyaopen firmware build/clean、编译配置、清理编译、编译错误、
  menuconfig、Kconfig，以及 tuyaopen config 与 tos.py config 的同名陷阱。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1 (for `tuyaopen firmware build/clean`)
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat) — only needed for the `tos.py`-direct path; `tuyaopen firmware build/clean` self-activates
  - cmake >= 3.28, ninja >= 1.6
---

# TuyaOpen Build

Docs: <https://tuyaopen.ai/docs/quick-start/project-compilation>

## Shortcuts — `tuyaopen firmware` (IDE-scaffolded projects)

| Intent | Command |
|---|---|
| Compile | `tuyaopen firmware build --project-root <project>` |
| Remove build artifacts | `tuyaopen firmware clean --project-root <project>` |
| Full clean (deletes `.build/` entirely, `tos.py clean -f`) | `tuyaopen firmware clean --project-root <project> --force` |

`--project-root` is the **IDE project root** — the directory holding
`.tuyaopen/` and `source/embedded/` (see skill `tuyaopen-shared` § 8) — not an
SDK `apps/`/`examples/` directory. It defaults to the current directory, so
`cd <project>` then omit the flag works too. Both commands are risk tier
**P3**: mutating, but **no** `--dry-run`/`--confirm`/`--yes` gate applies (see
skill `tuyaopen-shared` § 4 — P3 is a real tier, distinct from P0/P2, for
commands the framework doesn't consider destructive).

Two things `tuyaopen firmware build`/`clean` do that raw `tos.py build` does
not, verified against `src/cli/commands/firmware.ts`:

- **Self-activates the SDK env** — it calls the same bootstrap `tuyaopen sdk
  env-init` would, so you don't need `. ./export.sh` first.
- **Pre-syncs the platform submodule to its pinned commit** before building,
  so the `y/n/d` "platform commit mismatch" prompt that raw `tos.py build`
  can hang on (see § *Build* below) never fires — the
  `.cache/.dont_prompt_update_platform` workaround is a `tos.py`-direct-only
  concern.

Full flags (baud, `--sdk-root`, `--stream` for ndjson progress): `tuyaopen
firmware --help` / `tuyaopen schema get --group firmware --command build` —
don't hardcode the flag list here, it drifts (see skill `tuyaopen-shared` § 5).

**Everything below this point — Kconfig, `tos.py config`/`menu`/`choice`, and
building inside a raw SDK checkout's `apps/`/`examples/` tree — has no
`tuyaopen` CLI equivalent.** `tuyaopen config` is a different, unrelated
command (see the warning immediately below); use `tos.py` directly for all of
it.

## ⚠ `tuyaopen config` is not Kconfig — read before touching either `config`

`tos.py config` (Kconfig/menuconfig — everything in this skill) and
`tuyaopen config` (`get`/`set`/`list` over exactly three **IDE settings**:
`language`, `gitMirror`, `manifestsSource`) are two unrelated commands that
share a word. Typing `tuyaopen config set` to change a build option is the
intuitive guess and the **wrong** one — it silently rejects the key instead of
touching Kconfig, since none of the three IDE settings match. Full detail:
skill `tuyaopen-shared` § 7.

> **SDK root:** All `tos.py`-direct paths and commands below are relative to
> the TuyaOpen SDK root (`$OPEN_SDK_ROOT` on Linux/macOS/PowerShell,
> `%OPEN_SDK_ROOT%` on Windows CMD). Activate the environment first — see
> skill `tuyaopen-env-setup`.

## Project Locations

Buildable projects live in two directories:

- `apps/` — application projects (e.g. `apps/tuya_cloud/switch_demo`, `apps/tuya.ai/your_chat_bot`)
- `examples/` — example projects (e.g. `examples/get-started/sample_project`, `examples/peripherals/gpio`)

Navigate into the target project before building:

```bash
cd apps/tuya_cloud/switch_demo
```

## Configuration

### Selecting a Verified Config

```bash
tos.py config choice                           # interactive — list and pick
tos.py config choice -c TUYA_T5AI_EVB         # non-interactive — select by name (Agent / CI)
tos.py config choice -d                        # interactive — board default configs only
tos.py config choice -d -c TUYA_T5AI_EVB      # non-interactive — from board defaults
tos.py config choice -l                        # list names and exit, no clean (newer SDK — check `config choice -h`)
```

All variants trigger a full clean. The selected config is written to `app_default.config`.

Config lookup priority: project `config/` dir > `boards/` global configs.

**`-c` flag (non-interactive, preferred for Agent / CI):**  
Matches config by filename — `.config` extension is optional (`TUYA_T5AI_EVB` and `TUYA_T5AI_EVB.config` are equivalent).  
If the name is not found, the command exits with an error and prints the available config names.

### Fine-Tuning with Menuconfig (requires TTY)

```bash
tos.py config menu    # terminal-based Kconfig editor; resolves depends on/select automatically
tos.py config save    # interactive (requires TTY) — save current config as named preset
```

Menuconfig keys: arrows or `h`/`j`/`k`/`l`; `?` for help; write to `app_default.config` on exit.

### Writing a Custom Config (Agent / CI)

Two paths, depending on what the installed SDK supports. **Ask it — don't guess from a version number:**

```bash
tos.py config -h        # the subcommand list IS the answer; look for 'set'
```

Probe once, then commit to a branch. `tos.py version` prints a `git describe` string whose tag is the *previous* release, so it cannot distinguish the two generations.

**Preferred — `tos.py config set`** (when `-h` lists `set`/`get`/`list`/`diff`). The `CONFIG_` prefix is optional:

```bash
tos.py config set ENABLE_LIBLVGL=y ENABLE_MBEDTLS_SSL_MAX_CONTENT_LEN=4096
tos.py config set -u ENABLE_LIBLVGL       # revert to Kconfig default
tos.py config get -a ENABLE_LIBLVGL       # inspect type/prompt/deps before setting
tos.py config list -p LVGL                # find the right symbol name
tos.py build                              # no clean needed
```

It applies changes through kconfiglib (so `choice` exclusivity and derived symbols are handled), writes both `using.config` and `app_default.config`, and invalidates the generated build artifacts — **no `tos.py clean` needed** for an ordinary option change. A failed assignment aborts the whole batch and writes nothing. See skill `tuyaopen-project`, `references/CONFIG_CLI.md`.

**Fallback — hand-edit `app_default.config`** (any SDK). The file uses **Kconfig defconfig format** — only specify values that **differ from defaults**:

```
CONFIG_PROJECT_VERSION="1.0.1"
CONFIG_BOARD_CHOICE_T5AI=y
CONFIG_BOARD_CHOICE_TUYA_T5AI_CORE=y
CONFIG_ENABLE_LIBLVGL=y
CONFIG_ENABLE_MBEDTLS_SSL_MAX_CONTENT_LEN=4096
# CONFIG_ENABLE_COMP_AI_DISPLAY is not set
```

Key points:
- `CONFIG_BOARD_CHOICE_<PLATFORM>=y` selects the platform (e.g. `T5AI`, `ESP32`, `LINUX`).
- `CONFIG_BOARD_CHOICE_<BOARD>=y` selects the specific board under that platform (e.g. `TUYA_T5AI_CORE`, `DNESP32S3`, `UBUNTU`). **Both platform and board are required.**
- `CHIP_CHOICE` and `PLATFORM_CHOICE` are auto-set by the board's Kconfig — do not set them manually.
- Boolean options: `CONFIG_X=y` to enable, `# CONFIG_X is not set` to disable.
- String options: `CONFIG_X="value"`. Integer options: `CONFIG_X=1234`.

> **After hand-editing `app_default.config`, run `tos.py clean` before rebuilding.**
> Unlike `config choice` / `config menu` / `config set` (which invalidate the build automatically), a manual edit of `app_default.config` does **not** clean the build. Without a clean, the stale `.build/cache/using.config` may be reused and your changes silently ignored:
> ```bash
> # after editing app_default.config
> tos.py clean        # then rebuild
> tos.py build
> ```
>
> A hand-edit also bypasses kconfiglib entirely: `choice` symbols are not made mutually exclusive, and derived symbols (`CONFIG_PLATFORM_CHOICE`, `CONFIG_CHIP_CHOICE`) are not re-derived. Set exactly one platform and one board, and never write the derived symbols yourself. `tos.py config set` avoids all of this where available.

Common platform + board config pairs:

| Target | `app_default.config` lines |
|--------|---------------------------|
| LINUX / Ubuntu (native x86/x64) | `CONFIG_BOARD_CHOICE_LINUX=y`<br>`CONFIG_BOARD_CHOICE_UBUNTU=y` |
| LINUX / Raspberry Pi | `CONFIG_BOARD_CHOICE_LINUX=y`<br>`CONFIG_BOARD_CHOICE_RASPBERRY_PI=y` |
| T5AI EVB | `CONFIG_BOARD_CHOICE_T5AI=y`<br>`CONFIG_BOARD_CHOICE_TUYA_T5AI_EVB=y` |
| T5AI Core | `CONFIG_BOARD_CHOICE_T5AI=y`<br>`CONFIG_BOARD_CHOICE_TUYA_T5AI_CORE=y` |
| ESP32-S3 | `CONFIG_BOARD_CHOICE_ESP32=y`<br>`CONFIG_BOARD_CHOICE_ESP32_S3=y` |

### Config Pipeline

Understanding how config flows into the build (all paths relative to the project directory):

```
app_default.config          (your edits — defconfig format)
    ↓ tos.py build
.build/cache/using.config   (fully expanded .config with all defaults resolved)
    ↓ conf2cmake.py
.build/cache/using.cmake    (CMake variables: set(CONFIG_X "y"))
    ↓ conf2h.py
.build/cache/include/tuya_kconfig.h  (C macros: #define CONFIG_X 1)
```

If a build fails due to config issues, check `.build/cache/using.config` to see the **fully resolved** config (with all defaults filled in).

## Kconfig Dependency Guide

Detailed `select` / `depends on` / `if` mechanisms and agent strategy: `references/KCONFIG_GUIDE.md`.

## Build

```bash
tos.py build        # standard build
tos.py build -v     # verbose (shows full compiler commands)
```

> **Agent / CI:** Before the first build in a non-interactive session, prevent platform-update prompts:
> ```bash
> mkdir -p .cache && touch .cache/.dont_prompt_update_platform
> ```
> Create this file once after activating the environment. Without it, `tos.py build` may hang waiting for a `y/n/d` prompt when the platform commit has changed. `tuyaopen firmware build` (§ *Shortcuts* above) pre-syncs the platform commit itself and never hits this prompt — this workaround is only needed on the `tos.py`-direct path.

### Build All Configs (testing)

```bash
tos.py dev bac      # build-all-configs: for each config in the project, full-clean then build
```

Each config triggers a full clean before building, so this can take a long time. Useful for verifying all board variants compile cleanly.

## Clean

```bash
tos.py clean        # ninja clean
tos.py clean -f     # full clean — deletes .build/ entirely
```

`config choice` and `config menu` also trigger a full clean automatically.

## Running (LINUX target)

> Paths below are relative to the **project directory** (where you ran `tos.py build`), not the SDK root.

LINUX platform produces a native ELF binary. Build output is copied to `dist/`:

```bash
./dist/<project_name>_<version>/<project_name>_<version>.elf
```

A copy also exists at `.build/bin/` during the build. The `dist/` path is the canonical output location printed at the end of a successful build.

Example (for a project named `hello_world_linux` version 1.0.0):

```bash
./dist/hello_world_linux_1.0.0/hello_world_linux_1.0.0.elf
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Slow build on Windows | `MSPCManagerService` interference | Kill the process; add project dir to Windows Security exclusions |
| Toolchain download fails | Network issue | Retry `tos.py build`; check `platform/` directory |
| Build fails after config change | Incompatible options | `tos.py clean -f` then re-select: `tos.py config choice -c <name>` (non-interactive) or `tos.py config choice` (interactive) |
| `No rule to make target` | Stale build cache | `tos.py clean -f && tos.py build` |
| Build hangs with `y/n/d` prompt (Agent/CI) | Platform commit mismatch, missing suppress file | Run `mkdir -p .cache && touch .cache/.dont_prompt_update_platform` before building, or `tos.py update` first |
| Config option silently ignored | Missing `depends on` prerequisite | `tos.py config get -a NAME` shows the dependency chain directly where supported; otherwise check `.build/cache/using.config` and grep Kconfig files |
| `Error: No such command 'set'` | This SDK does not have `tos.py config set` | Probe with `tos.py config -h` first; hand-edit `app_default.config`, then `tos.py clean -f` |
| `FATAL_ERROR ... using.config` | No config selected yet | Run `tos.py config choice -c <name>` (non-interactive) or `tos.py config choice` (interactive) |
| Build succeeds but ELF not in `dist/` | Platform linker did not produce expected binary name | Check `.build/bin/` for the raw output; verify project name matches directory name |
| `tuyaopen firmware build` fails with `embedded directory not found` | `--project-root` doesn't point at an IDE-scaffolded project (no `source/embedded/`) | Run inside the project root, pass the correct `--project-root`, or use `tos.py build` directly for a raw SDK `apps/`/`examples/` layout |

## Not in scope

Anything outside compiling / cleaning / Kconfig for a TuyaOpen project — not
in scope here, see skill `tuyaopen-shared`'s routing table
(`references/ROUTING.md`).
