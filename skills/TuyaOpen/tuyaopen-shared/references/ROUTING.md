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
`tuyaopen-shared`'s SKILL.md § *Routing table* for why.

## Foundation

| Skill id | Use when |
|---|---|
| `tuyaopen-shared` | Always available background — CLI identity, envelope contract, risk gate, self-discovery, this table |
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
| `tuyaopen-embedded-build` | Compiling a TuyaOpen (embedded) project, Kconfig/menuconfig, build errors, running the LINUX ELF output |

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
| `tuyaopen-embedded-hardware` | TuyaOpen (TDL-layer) peripheral code generation — display, camera, IMU, LED, button, joystick, PMIC, any board hardware; "vibe coding" requests |

## Device debugging

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-cli-debug` | Registering firmware features as device CLI commands and driving them over serial after flashing; non-blocking background serial log capture; decoding a crash dump to `file:line`. **Environment triage (`diag doctor` / `diag export`) is not here** — it is in `tuyaopen-shared`, because it diagnoses the CLI and the host, not the device |

## The three development workflows

These three are the **phase-axis** entry points, one per domain. They are the
one place in this catalogue where a skill may name a sibling skill directly:
"next phase" is their content, not an out-of-scope handoff.

| Skill id | Use when |
|---|---|
| `tuyaopen-workflow-product-dev` | **Start here for "I want to build a product".** Platform phase — requirements → product/PID → DPs → `dp generate`. A state machine that resumes from wherever the project stands. Hands the PID + DPs + generated header to the next two |
| `tuyaopen-workflow-embedded-dev` | Firmware phase — write code → build → flash → write the auth code → provision → read logs / drive the device's serial CLI. Includes the full automated build–flash–monitor–analyze loop |
| `tuyaopen-workflow-miniapp-dev` | Panel phase — create the miniapp (appid) → code → `preview` and hand the render URL to the user → review → build + upload → submit/publish → bind to the PID. Also owns panel architecture and the coding conventions |

**Pipeline**: `product-dev` → (`embedded-dev` ‖ `miniapp-dev`). The last two are
independent of each other; both need the platform phase first.

## Panel miniapp — command line & cross-cutting

(The panel *workflow* entry point is `tuyaopen-workflow-miniapp-dev`, above.)

| Skill id | Use when |
|---|---|
| `tuyaopen-miniapp` | Running the MiniApp CLI: build · install · preview · upload · template · sync-schema · meta |
| `tuyaopen-miniapp-ray-common` | Ray API/component/lifecycle/routing questions not specific to one category |
| `tuyaopen-miniapp-smart-ui` | Scaffolding or modifying pages/components with the Ray `smart-ui` library |
| `tuyaopen-miniapp-requirement-guide` | Project kick-off — capturing user stories, page flows, DP usage plans before implementation |
| `tuyaopen-miniapp-performance-ux-guard` | Code review / optimization pass against panel performance & UX guardrails |

## Opt-in — the `scenario` group (**not** installed by `--all`)

Narrow-scope playbooks for a specific situation. `tuyaopen-cli skills install
--all` deliberately skips this whole group: the cost of installing a skill is
not disk, it is the routing decision its description takes part in, and a
project doing one of these is not doing the other eight.

**This section is the reason they are reachable at all.** An agent tool binds
its skill roots when it launches, so a skill that was never installed does not
exist as far as passive discovery is concerned — no name, no description,
nothing to stumble on. (An agent that runs `tuyaopen-cli skills list --json`
*does* see them all, installed or not; this table is what covers the agent
that never thinks to run it.) Decide from the rows below, then install just
the one you need:

```bash
tuyaopen-cli skills install --ids <id>          # one playbook
tuyaopen-cli skills install --group scenario    # all of them (rare)
```

Newly installed skills are **not** in the current session's context — reload
the skill list or start a new session before relying on one.

| Skill id | Use when |
|---|---|
| `tuyaopen-embedded-lvgl` | Anything LVGL: writing the UI (widgets, Kconfig, **Chinese text** — `LV_FONT_SIMSUN_16_CJK` is not a Chinese font — images, GIFs, fonts that fit in flash), and running it on the host in an SDL2 window instead of reflashing (**Linux only**). Two references split the two halves |
| `tuyaopen-embedded-dependency` | Wiring a freshly-downloaded PlatformIO ecosystem library into CMakeLists.txt / Kconfig, right after the IDE's Library → Ecosystem download. The IDE also installs this one automatically at that moment |
| `tuyaopen-miniapp-lamp-panel` | Lighting category panel — bright/temp/colour/scene/music DPs, `lamp-*` components, `work_mode` FSM |
| `tuyaopen-miniapp-socket-panel` | Socket / power-strip / smart-switch panel — multi-channel switches, countdowns, energy DPs |
| `tuyaopen-miniapp-robot-vacuum` | Robot vacuum panel — map component, sweep DPs, `@ray-js/robot-*` SDKs |
| `tuyaopen-miniapp-ipc-panel` | IPC camera panel template — grid layout, integrated player, PTZ, path cruise |
| `tuyaopen-miniapp-charts-library` | Integrating `@ray/charts-library` — electricity/temperature/humidity charts |
| `tuyaopen-miniapp-electrician-timing` | Integrating `@ray-js/electrician-timing-sdk` — cloud/cycle/random/inching/countdown timers |
| `tuyaopen-miniapp-energy-stats` | Energy/electricity-cost statistics via `@tuya-miniapp/cloud-api` — peak-valley pricing, budgets |

> A product category with no playbook here (thermostat, lock, sensor …) stays
> on `tuyaopen-workflow-miniapp-dev` + `tuyaopen-miniapp-ray-common` +
> `tuyaopen-miniapp-smart-ui`. **Do not** pick the "closest-looking" category
> playbook — its DP semantics, component choices and state machines are written
> for that category, and applying the wrong one is worse than applying none.
