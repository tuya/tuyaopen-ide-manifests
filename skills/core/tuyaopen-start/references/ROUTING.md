# Intent → skill routing table

Built from `tuyaopen-cli skills list --json`, which is the **authoritative and
always-current** listing — it returns every catalogued item with its
`whenToUse`, **regardless of whether that item is installed**. This file
deliberately carries **no skill count**: every previous attempt to state one
went stale and had to be corrected in prose (it read 31, then 30, then 28,
while the catalogue moved on). If you need the number, run the command.

Grouped by intent, not by `surface` — a `tuyaopen-miniapp-*` skill has surface
`"miniapp"` but can be the right answer to an embedded-flavoured question, and
vice versa.

This table is the **single** place skill-to-skill handoff is spelled out.
Every other skill points here instead of naming siblings directly — see
`tuyaopen-start`'s SKILL.md § *Routing table* for why.

## Foundation

| Skill id | Use when |
|---|---|
| `tuyaopen-start` | Always available background — CLI identity, envelope contract, risk gate, self-discovery, this table |
| `tuyaopen-skill-maker` | Authoring or editing a skill in this catalogue |

## Embedded — which command group

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded` | You know what you want to do on the device side but not which of the embedded command groups owns it, or you want the shape of the embedded CLI as a whole. A map, not a manual — it routes to the task skills below |

## Environment

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-env-setup` | First-time SDK environment activation, `tos.py` not found, `OPEN_SDK_ROOT` unset, installing system dependencies |

## Build

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-build` | Compiling a TuyaOpen project, Kconfig/menuconfig, build errors, running LINUX ELF, and wiring third-party libraries into CMakeLists.txt (`references/cmake-dependencies.md`) |

## Flash / serial tooling

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-flash` | Flashing firmware, opening a serial monitor, listing serial ports. Also covers reaching for `tyutool_cli` directly (read flash, bare DTR/RTS reset) — see its `references/TYUTOOL_CLI.md` |

## Device authorization

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-device-auth` | UUID/AuthKey/PID configuration, network provisioning, device pairing, obtaining authorization codes from platform.tuya.com |

## Project & product configuration

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-project` | Creating a project, binding a product, setting board / platform / intent / status, reading project info, browsing demos, and editing `tuyaopen.project.ini` / non-interactive Kconfig via `tos.py config` |
| `tuyaopen-embedded-add-board` | Adding a new board / BSP (directory, Kconfig, drivers, pin map) |
| `tuyaopen-embedded-code-check` | Validating C/C++ formatting, file headers, forbidden characters via clang-format / `check_format.py` |

## Cloud & DP

| Skill id | Use when |
|---|---|
| `tuyaopen-cloud` | Creating a Tuya product, retrieving a PID, querying/adding DPs, binding panels, releasing products via `tuya-devplat-cli` |

## Hardware & peripherals

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-hardware` | TuyaOpen (TDL-layer) peripheral code generation — display, camera, IMU, LED, button, joystick, PMIC, board hardware; LVGL screen UI and SDL2 simulator (`references/lvgl/`) |

## Device debugging

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-cli-debug` | Registering firmware features as device CLI commands and driving them over serial after flashing; non-blocking background serial log capture; decoding a crash dump to `file:line`. **Environment triage (`diag doctor` / `diag export`) is not here** — it is in `tuyaopen-start`, because it diagnoses the CLI and the host, not the device |

## The three development workflows

These three are the **phase-axis** entry points, one per domain. They are the
one place in this catalogue where a skill may name a sibling skill directly:
"next phase" is their content, not an out-of-scope handoff.

| Skill id | Use when |
|---|---|
| `tuyaopen-workflow-product-dev` | **Start here for "I want to build a product".** Platform phase — requirements → product/PID → DPs → `dp generate`. A state machine that resumes from wherever the project stands. Hands the PID + DPs + generated header to the next two |
| `tuyaopen-workflow-embedded-dev` | Firmware phase — write code → build → flash → write the auth code → provision → read logs / drive the device's serial CLI. Includes the full automated build–flash–monitor–analyze loop |
| `tuyaopen-workflow-miniapp-dev` | Panel phase — create the miniapp (appid) → code → `preview` and hand the render URL to the user → review → build + upload → submit/publish → bind to the PID. Also owns panel architecture and the coding conventions. **Any mention of 手机 / 手机上 / 手机面板 / 手机 App / 面板 / 小程序 / panel / phone app comes here** — including "手机上能控制/能设/能看", which is the phrasing that got the whole phase skipped in beta round 6 |

**Pipeline**: `product-dev` → (`embedded-dev` ‖ `miniapp-dev`). The last two are
independent of each other; both need the platform phase first.

> **A product with firmware and no panel is half finished** — and the missing
> half is the one the user touches. Defining DPs does not produce a panel; the
> panel is its own phase with its own creation step. `tuyaopen-cli project info`
> reports `miniapp.scaffolded`, and `diag doctor` says so too — if it is
> `false`, this phase has not been started, whatever the DP list looks like.

## Panel miniapp — command line & cross-cutting

(The panel *workflow* entry point is `tuyaopen-workflow-miniapp-dev`, above.)

| Skill id | Use when |
|---|---|
| `tuyaopen-miniapp` | Running the MiniApp CLI: build · install · preview · upload · template · sync-schema · meta |
| `tuyaopen-miniapp-ray-common` | Ray API/component/lifecycle/routing questions not specific to one category |
| `tuyaopen-miniapp-smart-ui` | Scaffolding or modifying pages/components with Ray `smart-ui` library; category business playbooks (lighting, socket, robot vacuum, IPC camera under `references/categories/`) and electrician timing SDK |
| `tuyaopen-miniapp-charts-library` | Integrating `@ray/charts-library` — electricity/temperature/humidity charts and energy statistics (`references/energy-stats/`) |
| `tuyaopen-miniapp-requirement-guide` | Project kick-off — capturing user stories, page flows, DP usage plans before implementation |
| `tuyaopen-miniapp-performance-ux-guard` | Code review / optimization pass against panel performance & UX guardrails |

