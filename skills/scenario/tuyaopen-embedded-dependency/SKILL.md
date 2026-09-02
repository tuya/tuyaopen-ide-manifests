---
name: tuyaopen-embedded-dependency
description: >-
  Search, install and record third-party (PlatformIO) libraries with
  `tuyaopen-cli dependency search / install / add / list / remove`, then wire an
  installed library into the active TuyaOpen project's CMakeLists.txt and
  (where applicable) Kconfig / tos.py module list — the one step none of those
  CLI commands cover. The pinned version, source URL, and install path are
  already declared in `.tuyaopen/dependencies.lock.json` (and mirrored into the
  `[ecosystem]` section of `tuyaopen.project.ini`) — read those files first
  instead of guessing.
  搜索、安装、记录第三方（PlatformIO）库：tuyaopen-cli dependency
  search / install / add / list / remove；再把已安装的库接入项目的 CMakeLists.txt
  与 Kconfig —— 这是唯一一个上述 CLI 命令都不覆盖的步骤。
when_to_use: Triggered automatically after the IDE (or an agent via `tuyaopen-cli dependency install`) downloads a third-party library into `source/embedded/dependencies/<owner>/<name>/`. Use it when the user asks the agent to "wire", "integrate", or "register" a freshly-installed library into the build.

id: tuyaopen-embedded-dependency
surfaces: [embedded]
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-start` § 1 (for `tuyaopen-cli dependency`)
tags: [cmake, dependencies, vibeCode]
command: tuyaopen.skill.wireCmake
fallback_commands: []
default_enabled: true
related: [tuyaopen-embedded-build, tuyaopen-embedded-project]
i18n_title: skill.wireCmake.title
i18n_description: skill.wireCmake.description
i18n_when: skill.wireCmake.when
---

# Wire ecosystem library into CMake

Wire a downloaded PlatformIO-Registry library into the active TuyaOpen project's CMakeLists.txt and (where applicable) Kconfig / tos.py module list. The pinned version, source URL, and install path are already declared in `.tuyaopen/dependencies.lock.json` (and mirrored into the `[ecosystem]` section of `tuyaopen.project.ini`) — read those files first instead of guessing.

## Shortcuts — `tuyaopen-cli dependency` / `tuyaopen-cli sdk`

An agent can now drive the whole discover → download → record path itself,
without the IDE's Library → Ecosystem tab, before ever reaching this skill's
own job (CMake wiring, which none of these commands touch):

| Intent | Command |
|---|---|
| Search the PlatformIO Registry | `tuyaopen-cli dependency search --query <text>` |
| Download + extract + record a library (writes the lockfile) | `tuyaopen-cli dependency install --owner <o> --name <n> --tarball-url <url>` |
| Record a library **already** on disk (no download) | `tuyaopen-cli dependency add --owner <o> --name <n> --version <v> --path <dir>` |
| List recorded project dependencies (`.tuyaopen/dependencies.lock.json`) | `tuyaopen-cli dependency list` |
| Remove a recorded dependency | `tuyaopen-cli dependency remove --id <owner>/<name>` — **P2**, needs `--yes` |
| List the SDK's own bundled platform sub-SDKs (a *different* layer — see below) | `tuyaopen-cli sdk platform` |

> **No CLI?** `ecosystem`/`dependency`/`library` have no `tos.py` equivalent
> — download/clone the library into
> `source/embedded/dependencies/<owner>/<name>/` by hand and hand-write the
> lockfile entry. This is exactly the manual work these commands exist to
> replace, and it's still what the CMake/Kconfig wiring step below needs
> regardless of which path got the library onto disk. See skill
> `tuyaopen-start` § 7.

**⚠ `tuyaopen-cli sdk platform` is not this.** It lists the **TuyaOpen SDK's own
composition** — the core repo plus its per-chip platform repos (`TuyaOpen-T2`,
`TuyaOpen-T3`, `TuyaOpen-ubuntu`, T5AI, ESP32 …), read from the SDK's
`platform/platform_config.yaml`, cloned by git and living under the workspace
SDK directory. That is a different on-disk layer from
`.tuyaopen/dependencies.lock.json`. Rule of thumb: **`sdk` is what Tuya gave
you, `dependency` is whose code your project additionally uses.** To see what
this project has pulled in, `tuyaopen-cli dependency list`.

> Until 2026-08-24 this paragraph had to explain something worse: three groups
> (`library`, `ecosystem`, `dependency`) all answered "get a library into the
> project", and `library install` / `ecosystem install` were the *same*
> operation — both called `installEcosystemLibrary()` with identical
> parameters — under two names. They are now one group, and the old spellings
> were removed rather than aliased.

`dependency search`/`dependency list` are read-only. `dependency install` and `dependency add` are **P2** (need `--yes` +
or `--dry-run` to preview). None of these five
commands write a single line of `CMakeLists.txt` or Kconfig — that gap is
this skill's entire remaining job, below. Full flags: `tuyaopen-cli dependency --help` /
`tuyaopen-cli schema get --group dependency --command <cmd>` — don't hardcode the flag list here (skill
`tuyaopen-start` § 5).

## When to use

Triggered after a library lands in `source/embedded/dependencies/<owner>/<name>/` — whether the IDE's Library → Ecosystem tab put it there, or an agent ran `tuyaopen-cli dependency install` / `tuyaopen-cli dependency add` directly. Use it when the user asks the agent to "wire", "integrate", or "register" a freshly-installed library into the build. Either path already wrote `.tuyaopen/dependencies.lock.json` and the `[ecosystem]` section of `tuyaopen.project.ini` — read those, don't re-run `dependency add`/`dependency install` speculatively to "make sure".

## Prerequisites

- A TuyaOpen project is open as the workspace root.
- The library has been extracted into `<project>/source/embedded/dependencies/<owner>/<name>/` — either by the IDE, or by `tuyaopen-cli dependency install` / `tuyaopen-cli dependency add` (§ *Shortcuts* above). Its on-disk inventory is in `dependencies/manifest.json` and the project-level declaration is in `.tuyaopen/dependencies.lock.json`.
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

The project's main `CMakeLists.txt` references the new directory via `add_subdirectory()` *or* an inline `target_include_directories()` + `target_sources()` block, the project still builds via `tos.py build` (or `tuyaopen-cli firmware build`), and the change has been described back to the user. Do **not** edit the lockfile or the `[ecosystem]` section of `tuyaopen.project.ini` yourself in this step — they are written exclusively by whichever of the IDE UI / `tuyaopen-cli dependency install` / `tuyaopen-cli dependency add` put the library on disk (§ *Shortcuts* above), never hand-edited here.

## Not in scope

Building or flashing the project once the library is wired, and downloading/recording a library that isn't already on disk — not in scope here, see skill `tuyaopen-start`'s routing table (`references/ROUTING.md`).

## Related skills

- `tuyaopen-embedded-build`
- `tuyaopen-embedded-project`

_Maintained in the TuyaOpen IDE skills registry. Reinstall the skill from the IDE's Skills page after registry updates._
