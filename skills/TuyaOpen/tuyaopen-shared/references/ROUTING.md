# Intent → skill routing table

Built from `tuyaopen skills list --json` — **30 catalogued skills** as of
2026-08-15, `tuyaopen-shared` and `tuyaopen-skill-maker` among them. (This
line previously read "29 … plus the two foundation skills this reorg adds —
31 total", which double-counted: those two were registered in `index.json` in
the same reorg, so they are inside the catalogue count, not additions to it.)
Grouped by intent, not
by the on-disk `TuyaOpen/` vs `TuyaOS/` product-line split (see that
distinction in skill `tuyaopen-skill-maker`).

This table is the **single** place skill-to-skill handoff is spelled out.
Every other skill points here instead of naming siblings directly — see
`tuyaopen-shared`'s SKILL.md § *Routing table* for why.

## Foundation

| Skill id | Use when |
|---|---|
| `tuyaopen-shared` | Always available background — CLI identity, envelope contract, risk gate, self-discovery, this table |
| `tuyaopen-skill-maker` | Authoring or editing a skill in this catalogue |

## Environment

| Skill id | Use when |
|---|---|
| `tuyaopen-env-setup` | First-time SDK environment activation, `tos.py` not found, `OPEN_SDK_ROOT` unset, installing system dependencies |

## Build

| Skill id | Use when |
|---|---|
| `tuyaopen-build` | Compiling a TuyaOpen (embedded) project, Kconfig/menuconfig, build errors, running the LINUX ELF output |
| `tuyaos-build` | Building/cleaning a TuyaOS app via `build_app.sh`, wiring vendor `.c`/`.h` into `apps/*/local.mk` |

## Flash / serial tooling

| Skill id | Use when |
|---|---|
| `tuyaopen-flash` | Flashing firmware, opening a serial monitor, listing serial ports. Also covers reaching for `tyutool_cli` directly (read flash, bare DTR/RTS reset) — see its `references/TYUTOOL_CLI.md` |

## Device authorization

| Skill id | Use when |
|---|---|
| `tuyaopen-device-auth` | UUID/AuthKey/PID configuration, network provisioning, device pairing, obtaining authorization codes from platform.tuya.com |

## Project & product configuration

| Skill id | Use when |
|---|---|
| `tuyaopen-project` | Creating a project, binding a product, setting board / platform / intent / status, reading project info, browsing demos, and editing `tuyaopen.project.ini` / non-interactive Kconfig via `tos.py config` |
| `tuyaopen-add-board` | Adding a new board / BSP (directory, Kconfig, drivers, pin map) |
| `tuyaopen-code-check` | Validating C/C++ formatting, file headers, forbidden characters via clang-format / `check_format.py` |

## Cloud & DP

| Skill id | Use when |
|---|---|
| `tuyaopen-cloud` | Creating a Tuya product, retrieving a PID, querying/adding DPs, binding panels, releasing products via `tuya-devplat-cli` |

## Hardware & peripherals

| Skill id | Use when |
|---|---|
| `tuyaopen-hardware` | TuyaOpen (TDL-layer) peripheral code generation — display, camera, IMU, LED, button, joystick, PMIC, any board hardware; "vibe coding" requests |
| `tuyaos-hardware-vibe-coding` | TuyaOS (`tkl_*`/`tal_*`) peripheral + connectivity code generation — GPIO/I2C/PWM/ADC/SPI/timer/watchdog/mic/speaker/DVP, Wi-Fi, BLE |

## Dependencies & ecosystem

| Skill id | Use when |
|---|---|
| `tuyaopen-dependency` | Wiring a freshly-downloaded PlatformIO ecosystem library into CMakeLists.txt / Kconfig, right after the IDE's Library → Ecosystem download |

## Diagnostics

| Skill id | Use when |
|---|---|
| `tuyaopen-diagnose` | Reading `tuyaopen diag doctor` / `diag export`, non-blocking background serial log capture, sending commands to the device serial CLI, and decoding a crash dump to `file:line` |

## Cross-cutting workflows

| Skill id | Use when |
|---|---|
| `tuyaopen-workflow-dev-loop` | Full automated build–flash–monitor–analyze cycle with log/error-pattern matching |
| `tuyaopen-workflow-product-dev` | End-to-end product development from requirements through Tuya Platform product/DP creation to complete embedded firmware — a state machine that resumes from wherever the project currently stands |

## Panel miniapp — entry point & cross-cutting

| Skill id | Use when |
|---|---|
| `tuyaopen-miniapp` | Running the MiniApp CLI: build · install · preview · upload · template · sync-schema · meta |
| `tuyaopen-miniapp-panel-dev` | **Start here** for any panel miniapp task — architecture, dev conventions, upload audit; dispatches onward |
| `tuyaopen-miniapp-ray-common` | Ray API/component/lifecycle/routing questions not specific to one category |
| `tuyaopen-miniapp-smart-ui` | Scaffolding or modifying pages/components with the Ray `smart-ui` library |
| `tuyaopen-miniapp-requirement-guide` | Project kick-off — capturing user stories, page flows, DP usage plans before implementation |
| `tuyaopen-miniapp-performance-ux-guard` | Code review / optimization pass against panel performance & UX guardrails |

## Panel miniapp — category templates

| Skill id | Use when |
|---|---|
| `tuyaopen-miniapp-lamp-panel` | Lighting category panel — bright/temp/colour/scene/music DPs, `lamp-*` components, `work_mode` FSM |
| `tuyaopen-miniapp-socket-panel` | Socket / power-strip / smart-switch panel — multi-channel switches, countdowns, energy DPs |
| `tuyaopen-miniapp-robot-vacuum` | Robot vacuum panel — map component, sweep DPs, `@ray-js/robot-*` SDKs |
| `tuyaopen-miniapp-ipc-panel` | IPC camera panel template — grid layout, integrated player, PTZ, path cruise |
| `tuyaopen-miniapp-charts-library` | Integrating `@ray/charts-library` — electricity/temperature/humidity charts |
| `tuyaopen-miniapp-electrician-timing` | Integrating `@ray-js/electrician-timing-sdk` — cloud/cycle/random/inching/countdown timers |
| `tuyaopen-miniapp-energy-stats` | Energy/electricity-cost statistics via `@tuya-miniapp/cloud-api` — peak-valley pricing, budgets |
