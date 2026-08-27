---
name: tuyaopen-embedded-project
description: >-
  Read and mutate the `.tuyaopen/` project descriptor via the `tuyaopen-cli`
  CLI (`project info/create/set-platform/set-board/set-status/set-intent/
  bind-product`), browse the local demo/example catalogue (`demos
  list/detail`), and read or write the three IDE settings (`config
  get/set/list`: language/gitMirror/manifestsSource — NOT Kconfig). Also
  covers the underlying `tos.py new`/`tos.py config` project & build-config
  tooling these CLI commands sit on top of. Use when the user mentions
  creating a project, project metadata, binding a product, tos.py new, saving
  or choosing a build config, tos.py config set/get/list/diff, tos.py update,
  or IDE settings.
  项目创建与元数据、项目描述符读写、demo 目录浏览、IDE 设置（language/
  gitMirror/manifestsSource，注意不是 Kconfig）、tos.py config 构建配置管理、
  更新依赖。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat) for the tos.py-side commands
  - TTY terminal required for interactive tos.py commands (tos.py new, config choice/menu/save)
  - "tos.py config set/get/list/diff: newer SDKs only — detect with `tos.py config -h`, never from a version number"
---

# TuyaOpen Project, Demos & Config

> **SDK root:** `tos.py`-side paths and commands in this skill are relative to the TuyaOpen SDK root (`$OPEN_SDK_ROOT` on Linux/macOS/PowerShell, `%OPEN_SDK_ROOT%` on Windows CMD). Activate the environment first — see skill `tuyaopen-embedded-env-setup`. The `tuyaopen-cli project` / `demos` / `config` CLI commands below don't need SDK-env activation — they read/write `.tuyaopen/` and IDE settings directly.

Docs: <https://tuyaopen.ai/docs/tos-tools/tos-guide>

## Shortcuts — `tuyaopen-cli project` / `tuyaopen-cli config` / `tuyaopen-cli demos` / `tuyaopen-cli manifests`

| Intent | Command |
|---|---|
| Read the `.tuyaopen/` project descriptor | `tuyaopen-cli project info` |
| Create a project non-interactively | `tuyaopen-cli project create` (P2) |
| Set platform / board / lifecycle status / AI intent | `tuyaopen-cli project set-platform` · `set-board` · `set-status` · `set-intent` (all P2) |
| Bind a product PID to this project | `tuyaopen-cli project bind-product` (P2) |
| Read / write IDE settings (`language`/`gitMirror`/`manifestsSource` — **not** Kconfig, see the warning below) | `tuyaopen-cli config get` · `config list` · `config set` (P2) |
| Browse the local demo/example catalogue | `tuyaopen-cli demos list` · `demos detail` |
| Local manifest cache status / sync | `tuyaopen-cli manifests status` · `manifests sync` (P2) |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per skill `tuyaopen-shared` § 1
(it is usually not on `PATH`).

> **No CLI?** `project create` → `tos.py new project` (interactive; see
> § *Creating a New Project* below). No older-tool equivalent for the rest
> of this table — see skill `tuyaopen-shared` § 7.

## ⚠ Two commands named `config` — read this before touching either

`tos.py config` and `tuyaopen-cli config` are **two unrelated commands that
happen to share a word**, and guessing wrong silently no-ops instead of
erroring loudly:

| | Edits | Keys |
|---|---|---|
| `tos.py config` (`choice`/`menu`/`save`/`set`/`get`/`list`/`diff`) | The project's **Kconfig build configuration** — `app_default.config`, `.build/cache/using.config` | Hundreds of `CONFIG_*` Kconfig symbols — see § *Configuration Management* below |
| `tuyaopen-cli config` (`get`/`set`/`list`) | **IDE settings** — nothing to do with Kconfig | Exactly three: `language`, `gitMirror`, `manifestsSource` (verified against `ALLOWED_CONFIG_KEYS` in the IDE's `src/cli/cliConfig.ts`) |

The intuitive guess for "set a build config option" is `tuyaopen-cli config
set` — that is the **wrong** command: it will reject any Kconfig-style key
since it isn't one of the three IDE settings, and do nothing to the project.
Use `tos.py config set` (§ *Configuration Management*) for Kconfig. This same
trap is called out once already in skill `tuyaopen-shared` § 7 — it's worth
repeating here because this is the skill someone lands on when they type
"config" for either intent.

## `tuyaopen-cli config` — IDE settings

```bash
tuyaopen-cli config list                          # all three keys (empty object = all defaults)
tuyaopen-cli config get --key language
tuyaopen-cli config set --key gitMirror --value <value>   # P2 — needs --yes, or --dry-run
```

Flags: `tuyaopen-cli config --help` / `tuyaopen-cli schema get --group config
--command set`. `set` is mutating (P2, see skill `tuyaopen-shared` § 4);
`get`/`list` are read-only.

## `tuyaopen-cli project` — read/write the `.tuyaopen/` descriptor

Seven subcommands over the `.tuyaopen/` layout described in skill
`tuyaopen-shared` § 8:

| Subcommand | Purpose | Risk |
|---|---|---|
| `info` | Show identity + lifecycle + bound product/board (read-only) | — |
| `create` | Scaffold a new project, optionally from a manifest demo/board | P2 |
| `set-platform` | Set `[platform] target` in `tuyaopen.project.ini` | P2 |
| `set-board` | Set `[board] id` (+ optional `kconfig_id`) | P2 |
| `set-status` | Advance the lifecycle (`scaffolded`/`configured`/`built`/`flashed`) in `.tuyaopen/status.json` | P2 |
| `set-intent` | Record the AI intent text into `.tuyaopen/project.json` | P2 |
| `bind-product` | Bind a Tuya product PID (writes `[product] pid`) | P2 |

```bash
tuyaopen-cli project info --json
tuyaopen-cli project create --name my-app --demo peripherals-led --board tuya-t5-e1
tuyaopen-cli project bind-product --pid <pid>
```

`create` needs either `--extension-path` (IDE-injected media templates) or
`--sdk-root` (SDK's own `tools/app_template/`); an SDK-subpath demo (most of
them) additionally needs the SDK installed. Full flags: `tuyaopen-cli project
--help` / `tuyaopen-cli schema get --group project --command create` — don't
memorize the flag list, it evolves under the CLI's own contract snapshot (see
skill `tuyaopen-shared` § 5).

This is the CLI-first equivalent of `tos.py new project` (see § *Creating a
New Project* below for the interactive/manual path, still needed for TTY
scaffolding or when neither `--extension-path` nor `--sdk-root` is
available).

## `tuyaopen-cli demos` — browse the local manifest catalogue

Read-only queries against the same local manifest cache `project create
--demo`/`--board` reads from — no network, no cloud:

```bash
tuyaopen-cli demos list --json                    # id, name, type, summary, compatibility
tuyaopen-cli demos detail --id peripherals-led --json    # source, build configs, cloud/PID spec
```

Needs a synced local manifests cache (`tuyaopen-cli manifests sync`) or
`TUYAOPEN_MANIFESTS_PATH` pointed at one — otherwise both return
`config:no_manifest_cache`.

## Creating a New Project

> All `tos.py new` subcommands are **interactive** (use `input()` / menu prompts). They require a TTY and cannot be used in non-interactive Agent/CI pipelines.

### `tos.py new project` (interactive)

Creates a new application from a template **in the current working directory**.

```bash
cd apps/my_category          # navigate to where you want the project
tos.py new project               # defaults to base framework
tos.py new project --framework arduino   # Arduino-style project
```

Flow:
1. Prompts for project name (e.g. `my_app`).
2. Copies template from `tools/app_template/<framework>/` into `<cwd>/<project_name>/`.
3. Fails if the directory already exists.

**Templates:**

| Framework | Entry file | Entry point |
|-----------|-----------|-------------|
| `base` | `src/tuya_app_main.c` | `user_main()` — on Linux runs as `main()`, on MCU spawns a thread via `tuya_app_main()` |
| `arduino` | `src/tuya_app_main.cpp` | Arduino-style `setup()` / `loop()` |

Generated project structure:
```
my_app/
├── CMakeLists.txt    # collects src/, include/, links the SDK's aggregate lib
└── src/
    └── tuya_app_main.c
```

The SDK's aggregate static library is named `tuyaos`
(`set(COMPONENTS_ALL_LIB "tuyaos")` in the TuyaOpen SDK's root
`CMakeLists.txt`) — a historical TuyaOpen artefact name, unrelated to any other
product. It shows up in link errors, so don't "correct" it.

**After creation — next steps:**
1. `cd my_app`
2. Select a config: `tos.py config choice` (interactive), or manually create `app_default.config` (see skill `tuyaopen-embedded-build` for Kconfig format).
3. Build: `tos.py build`

A new project has no `app_default.config` — the build system will copy an empty template on first build, but you must configure a platform/board before a meaningful build succeeds.

### `tos.py new board` (interactive)

Creates a new board BSP directory under `boards/<platform>/`.

Flow:
1. Lists available platforms (T5AI, ESP32, LINUX, etc.) — select one.
2. Prompts for new board name (e.g. `MY_CUSTOM_BOARD`).
3. Creates `boards/<platform>/<board_name>/` with template files (Kconfig, CMakeLists.txt, board_com_api.h, board source file).
4. Automatically registers the board in `boards/<platform>/Kconfig` so it appears in `config choice`.
5. For ESP32, chip name defaults to `esp32s3`; for other platforms, uses the platform name.

See skill `tuyaopen-embedded-add-board` for the full board adaptation guide.

## Configuration Management

For detailed Kconfig editing guidance (dependency mechanisms, defconfig format, config pipeline), see skill **`tuyaopen-embedded-build`**.

### Which config commands does this SDK have? — ask the SDK

`tos.py config` has two generations. **Always ask the installed SDK what it supports; never infer it from a version number.**

```bash
tos.py config -h        # the list of subcommands IS the answer
```

| If `-h` lists… | Then |
|----------------|------|
| only `choice`, `menu`, `save` | older generation — hand-edit `app_default.config` + `tos.py clean -f` |
| also `set`, `get`, `list`, `diff` | newer generation — use them; also implies `choice -l` and `save -n/-f` |

Probe **once, before planning the change**, and commit to that branch. Do not run the new command and parse its failure.

If the environment isn't activated or you aren't inside a project directory (`tos.py config` requires both), check the source tree instead:

```bash
test -f "$OPEN_SDK_ROOT/tools/cli_command/util_kconfig.py"          # bash
Test-Path "$env:OPEN_SDK_ROOT/tools/cli_command/util_kconfig.py"    # PowerShell
```

`util_kconfig.py` ships with the new subcommands, so its presence tracks them exactly.

> **Do not gate on `tos.py version`.** It prints a `git describe` string such as `v1.9.0-17-g13a1d0de` — the tag is whatever release came *before* the checkout, so SDKs with and without these subcommands both report the same tag. Feature detection is the only reliable gate.

### `tos.py config choice` (interactive)

```bash
tos.py config choice       # list configs from project config/ or boards/
tos.py config choice -d    # only show boards/ default configs (skip project config/)
tos.py config choice -l    # print available config names and exit, no clean (newer SDK — probe first)
```

Selects a pre-verified config. Writes to `app_default.config`. **Triggers a full clean first.**

Config lookup priority:
1. Project's own `config/` directory (e.g. `apps/tuya.ai/your_chat_bot/config/`)
2. `boards/<platform>/config/` global configs (shown when no project configs exist, or with `-d`)

> Note: `-d` is an option of the `choice` subcommand (not the global `--debug` flag).

### `tos.py config menu` (interactive)

```bash
tos.py config menu
```

Opens a terminal-based Kconfig editor. **Triggers a full clean first.** Best for fine-tuning options with complex dependencies — the editor resolves `select` / `depends on` automatically. See skill `tuyaopen-embedded-build` for the Kconfig Dependency Guide.

### `tos.py config save`

```bash
tos.py config save                 # interactive — prompts for a name
tos.py config save -n my_board     # non-interactive (newer SDK — probe first)
tos.py config save -n my_board -f  # overwrite an existing preset
```

Copies the current `app_default.config` to the project's `config/` directory as a named preset. Useful after customizing with `config menu` or `config set`.

Where `-n` is supported (check `tos.py config save -h`): it skips the prompt, an existing file is an error unless `-f` is given, and running without `-n` outside a TTY fails with a clear message instead of hanging.

### Non-Interactive Config (Agent / CI)

**1. Switching to a whole pre-verified config** — works on every SDK:

```bash
tos.py config choice -c TUYA_T5AI_EVB     # from project config/ dir
tos.py config choice -d -c TUYA_T5AI_EVB  # from boards/ default configs
```

This triggers a full clean, which is exactly what a board switch needs.

**2. Changing individual options** — depends on what `tos.py config -h` reported (see above).

*`set`/`get`/`list`/`diff` present — use them.* The `CONFIG_` prefix is optional everywhere:

```bash
tos.py config get ENABLE_WIFI                  # one value
tos.py config get -a ENABLE_LIBLVGL            # type, prompt, visibility, deps
tos.py config list -p MBEDTLS                  # filtered dump (-j for JSON)
tos.py config set ENABLE_LIBLVGL=y ENABLE_MBEDTLS_SSL_MAX_CONTENT_LEN=8192
tos.py config set -u ENABLE_LIBLVGL            # revert to Kconfig default
tos.py config diff TUYA_T5AI_EVB               # semantic diff vs current config
```

`config set` is dependency-aware and all-or-nothing: every token is validated before anything is written, so a failed batch writes nothing. It re-derives `using.config` and invalidates the generated build artifacts — **no manual `tos.py clean -f` needed** for an ordinary option change.

Full semantics, flags, and troubleshooting: `references/CONFIG_CLI.md`.

*Not present — hand-edit `app_default.config`.* See skill `tuyaopen-embedded-build` for format details and Kconfig dependency handling.

> **After hand-editing `app_default.config`, run `tos.py clean -f` before rebuilding.** Unlike `config choice` / `config menu` / `config set` (which handle this automatically), a manual edit does **not** invalidate the build, so the stale `.build/cache/using.config` may be reused and your changes ignored. Run `tos.py clean -f` then `tos.py build`.
>
> Hand-editing also bypasses kconfiglib: `choice` symbols are not made mutually exclusive and derived symbols (`CONFIG_PLATFORM_CHOICE`, `CONFIG_CHIP_CHOICE`) are not updated. Set exactly one platform and one board, and never set the derived symbols yourself.

## Non-Interactive Project Creation (Agent / CI)

`tos.py new` is interactive and cannot be used in Agent/CI. Create the project manually by writing three files.

### Required Directory Structure

```
<project_name>/
├── CMakeLists.txt
├── app_default.config
├── include/          # optional — create if you have shared headers
└── src/
    └── tuya_app_main.c
```

The project can live under `examples/` or `apps/` — both are valid build locations.

### Step 1: CMakeLists.txt

```cmake
##
# @file CMakeLists.txt
# @brief
#/

set(APP_PATH ${CMAKE_CURRENT_LIST_DIR})

get_filename_component(APP_NAME ${APP_PATH} NAME)

aux_source_directory(${APP_PATH}/src APP_SRC)

set(APP_INC ${APP_PATH}/include)

########################################
# Target Configure
########################################
add_library(${EXAMPLE_LIB})

target_sources(${EXAMPLE_LIB}
    PRIVATE
        ${APP_SRC}
    )

target_include_directories(${EXAMPLE_LIB}
    PRIVATE
        ${APP_INC}
    )
```

This is the standard template from `tools/app_template/base/CMakeLists.txt`. It auto-collects all `.c` files under `src/` — no need to list them individually.

### Step 2: app_default.config

Select the target platform and board. **Both a platform choice and a board choice are required.**

Common platform + board pairs:

| Platform | Config lines | Target |
|----------|-------------|--------|
| LINUX / Ubuntu | `CONFIG_BOARD_CHOICE_LINUX=y`<br>`CONFIG_BOARD_CHOICE_UBUNTU=y` | Native x86/x64 ELF on Ubuntu/Debian |
| LINUX / Raspberry Pi | `CONFIG_BOARD_CHOICE_LINUX=y`<br>`CONFIG_BOARD_CHOICE_RASPBERRY_PI=y` | Native ARM ELF on RPi |
| T5AI | `CONFIG_BOARD_CHOICE_T5AI=y` | Tuya T5AI MCU |
| ESP32 | `CONFIG_BOARD_CHOICE_ESP32=y` | Espressif ESP32 series |

Example for LINUX (the only platform that can compile and run natively on the host):

```
CONFIG_BOARD_CHOICE_LINUX=y
CONFIG_BOARD_CHOICE_UBUNTU=y
```

### Step 3: src/tuya_app_main.c

Entry source file **must be named `tuya_app_main.c`** (convention from the official template). It follows a dual-path entry pattern:

```c
#include "tal_api.h"
#include "tkl_output.h"

static void user_main(void)
{
    tal_log_init(TAL_LOG_LEVEL_DEBUG, 1024, (TAL_LOG_OUTPUT_CB)tkl_log_output);
    PR_DEBUG("hello world\r\n");

    while (1) {
        tal_system_sleep(1000);
    }
}

#if OPERATING_SYSTEM == SYSTEM_LINUX
void main(int argc, char *argv[])
{
    user_main();
}
#else

static THREAD_HANDLE ty_app_thread = NULL;

static void tuya_app_thread(void *arg)
{
    user_main();
    tal_thread_delete(ty_app_thread);
    ty_app_thread = NULL;
}

void tuya_app_main(void)
{
    THREAD_CFG_T thrd_param = {0};
    thrd_param.stackDepth = 1024 * 4;
    thrd_param.priority = THREAD_PRIO_1;
    thrd_param.thrdname = "tuya_app_main";
    tal_thread_create_and_start(&ty_app_thread, NULL, NULL, tuya_app_thread, NULL, &thrd_param);
}
#endif
```

Key points:
- `user_main()` contains all application logic
- On LINUX: `main()` calls `user_main()` directly (native process)
- On MCU: `tuya_app_main()` spawns a thread that calls `user_main()`
- `OPERATING_SYSTEM == SYSTEM_LINUX` (value 100) is set automatically by the LINUX platform Kconfig

### Step 4: Build and Run

```bash
cd <project_dir>
mkdir -p .cache && touch .cache/.dont_prompt_update_platform
tos.py build
./dist/<project>_<version>/<project>_<version>.elf   # LINUX only
```

## Updating Dependencies

```bash
tos.py update
```

Switches each platform submodule to its pinned commit (`$OPEN_SDK_ROOT/platform/platform_config.yaml`). Run after `git pull`.

## tos.py Command Reference

See `references/TOS_COMMANDS.md`. For the non-interactive config subcommands in depth, see `references/CONFIG_CLI.md`.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `tos.py new` hangs | Waiting for `input()` — interactive only | Use in a TTY terminal; cannot be automated |
| Project exists error on `new` | Directory already exists | Choose a different name or delete the existing directory |
| `config menu` arrow keys broken | Windows terminal compat | Use `h`/`j`/`k`/`l`; or switch between cmd/powershell |
| `could not lock config file` | Stale `~/.gitconfig.lock` | `rm ~/.gitconfig.lock` |
| No configs shown in `config choice` | No `config/` dir and no board configs for current platform | Create `app_default.config` manually or check platform setup |
| Build fails after `tos.py new` | No config selected yet | Run `tos.py config choice` or create `app_default.config` |
| `Error: No such command 'set'` | This SDK does not have the non-interactive config subcommands | Probe with `tos.py config -h` first; hand-edit `app_default.config`, then `tos.py clean -f` |
| `config set` fails with a dependency reason | `depends on` / visibility blocks the symbol | `tos.py config get -a NAME`; enable the parent, or set both in one `config set` |
| `config save` hangs or aborts in CI | Prompting for a name without a TTY | Pass `-n NAME` if `config save -h` lists it |

More config-specific troubleshooting: `references/CONFIG_CLI.md`.
