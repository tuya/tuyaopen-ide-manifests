---
name: tuyaopen-dependency
description: >-
  Search, install and record ecosystem (PlatformIO) libraries via `tuyaopen
  ecosystem search/install`, `tuyaopen dependency add/list/remove`, and
  `tuyaopen library install/list`, then wire an installed library into the
  active TuyaOpen project's CMakeLists.txt and (where applicable) Kconfig /
  tos.py module list — the one step none of those CLI commands cover. The
  pinned version, source URL, and install path are already declared in
  `.tuyaopen/dependencies.lock.json` (and mirrored into the `[ecosystem]`
  section of `tuyaopen.project.ini`) — read those files first instead of
  guessing.
  搜索、安装、记录生态库（PlatformIO）：tuyaopen ecosystem search/install、
  tuyaopen dependency add/list/remove、tuyaopen library install/list；再把已安装
  的库接入项目的 CMakeLists.txt 与 Kconfig —— 这是唯一一个上述 CLI 命令都不覆盖
  的步骤。
when_to_use: Triggered automatically after the IDE (or an agent via `tuyaopen ecosystem install`) downloads a third-party library into `source/embedded/dependencies/<owner>/<name>/`. Use it when the user asks the agent to "wire", "integrate", or "register" a freshly-installed library into the build.

id: tuyaopen-dependency
surfaces: [embedded]
tags: [cmake, dependencies, vibeCode]
command: tuyaopen.skill.wireCmake
fallback_commands: []
default_enabled: true
related: [tuyaopen-build, tuyaopen-project]
i18n_title: skill.wireCmake.title
i18n_description: skill.wireCmake.description
i18n_when: skill.wireCmake.when
---

# Wire ecosystem library into CMake

Wire a downloaded PlatformIO-Registry library into the active TuyaOpen project's CMakeLists.txt and (where applicable) Kconfig / tos.py module list. The pinned version, source URL, and install path are already declared in `.tuyaopen/dependencies.lock.json` (and mirrored into the `[ecosystem]` section of `tuyaopen.project.ini`) — read those files first instead of guessing.

## Shortcuts — `tuyaopen ecosystem` / `tuyaopen dependency` / `tuyaopen library`

An agent can now drive the whole discover → download → record path itself,
without the IDE's Library → Ecosystem tab, before ever reaching this skill's
own job (CMake wiring, which none of these commands touch):

| Intent | Command |
|---|---|
| Search the PlatformIO Registry | `tuyaopen ecosystem search --query <text>` |
| Download + extract + record a library (writes the lockfile) | `tuyaopen ecosystem install --owner <o> --name <n> --tarball-url <url>` |
| Record a library **already** on disk (no download) | `tuyaopen dependency add --owner <o> --name <n> --version <v> --path <dir>` |
| List recorded project dependencies (`.tuyaopen/dependencies.lock.json`) | `tuyaopen dependency list` |
| Remove a recorded dependency | `tuyaopen dependency remove --id <owner>/<name>` — **P0**, needs `--dry-run` → `--confirm <token>` |
| List the SDK's own bundled platform sub-SDKs (a *different* layer — see below) | `tuyaopen library list` |

**⚠ `tuyaopen library install` and `tuyaopen ecosystem install` are the exact
same operation under two group names** — verified against
`src/cli/commands/library.ts` / `src/cli/commands/ecosystem.ts`, both call
`installEcosystemLibrary()` with identical parameters. Use whichever noun
reads better; there is no behavioral difference. `tuyaopen library list`,
however, is **not** the project-dependency inventory — it lists the TuyaOS
platform sub-SDKs (LVGL, mbedtls, …) bundled with the SDK itself, a different
on-disk layer from `.tuyaopen/dependencies.lock.json`. Use `tuyaopen
dependency list` to see what this project has pulled in.

`ecosystem search`/`dependency list` are read-only. `ecosystem install`,
`library install`, and `dependency add` are **P2** (need `--yes` +
`TUYAOPEN_AUTOCONFIRM_P2=1`, or `--dry-run` to preview). None of these five
commands write a single line of `CMakeLists.txt` or Kconfig — that gap is
this skill's entire remaining job, below. Full flags: `tuyaopen ecosystem
--help` / `tuyaopen dependency --help` / `tuyaopen schema get --group
<group> --command <cmd>` — don't hardcode the flag list here (skill
`tuyaopen-shared` § 5).

## When to use

Triggered after a library lands in `source/embedded/dependencies/<owner>/<name>/` — whether the IDE's Library → Ecosystem tab put it there, or an agent ran `tuyaopen ecosystem install` / `tuyaopen dependency add` directly. Use it when the user asks the agent to "wire", "integrate", or "register" a freshly-installed library into the build. Either path already wrote `.tuyaopen/dependencies.lock.json` and the `[ecosystem]` section of `tuyaopen.project.ini` — read those, don't re-run `dependency add`/`ecosystem install` speculatively to "make sure".

## Prerequisites

- A TuyaOpen project is open as the workspace root.
- The library has been extracted into `<project>/source/embedded/dependencies/<owner>/<name>/` — either by the IDE, or by `tuyaopen ecosystem install` / `tuyaopen dependency add` (§ *Shortcuts* above). Its on-disk inventory is in `dependencies/manifest.json` and the project-level declaration is in `.tuyaopen/dependencies.lock.json`.
- You have read/write access to the project's `CMakeLists.txt` files.

## How the agent should invoke it

Prefer the **Run Command** tool with the registered VSCode command id:

```
Run Command "tuyaopen.skill.wireCmake"
```

If `Run Command` is unavailable, fall back to the SDK terminal:

```bash
# from the project root, with the TuyaOpen SDK env active
cd <project> && # (no direct tos.py command — edit CMakeLists.txt and re-run `tos.py build`)
```

## Arguments

- `owner` — PlatformIO library owner (folder name).
- `name` — PlatformIO library name (folder name).
- `installedPath` — absolute path to the extracted library root.
- `installedVersion` — exact pinned version (read from `.tuyaopen/dependencies.lock.json`).

## Success signal

The project's main `CMakeLists.txt` references the new directory via `add_subdirectory()` *or* an inline `target_include_directories()` + `target_sources()` block, the project still builds via `tos.py build` (or `tuyaopen firmware build`), and the change has been described back to the user. Do **not** edit the lockfile or the `[ecosystem]` section of `tuyaopen.project.ini` yourself in this step — they are written exclusively by whichever of the IDE UI / `tuyaopen ecosystem install` / `tuyaopen dependency add` put the library on disk (§ *Shortcuts* above), never hand-edited here.

## Not in scope

Building or flashing the project once the library is wired, and downloading/recording a library that isn't already on disk — not in scope here, see skill `tuyaopen-shared`'s routing table (`references/ROUTING.md`).

## Related skills

- `tuyaopen-build`
- `tuyaopen-project`

_Maintained in the TuyaOpen IDE skills registry. Reinstall the skill from the IDE's Skills page after registry updates._
