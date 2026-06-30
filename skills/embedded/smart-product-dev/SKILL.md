---
name: smart-product-dev
description: >-
  End-to-end IoT product development orchestration for TuyaOpen projects.
  Guides from requirements gathering → Tuya Platform product/DP creation →
  complete embedded firmware generation. State-machine: detects project
  state and picks up from wherever development currently stands.
when_to_use: >-
  Use when the developer says "I want to make a [device]", "帮我做一个XX",
  "what's next?", "下一步该干什么", or describes product features and expects
  end-to-end guidance. Do NOT use for pure platform ops (→ tuya-iot-platform),
  pure build/debug (→ tuyaopen/dev-loop), or project creation only
  (→ tuyaopen/project-config).
id: smart-product-dev
surface: embedded
tags: [product, dp, pid, embedded, iot, workflow, orchestration]
license: Apache-2.0
defaultEnabled: true
related:
  - tuya-iot-platform
  - tuyaopen/dev-loop
  - tuyaopen/project-config
  - tuyaopen/env-setup
command: tuyaopen.skill.smartProductDev
---

# TuyaOpen Smart Product Development

End-to-end orchestration: requirements → Tuya Platform product/DP → embedded firmware.

**Disambiguation:** If only doing one sub-task, use the dedicated skill:
- Platform operations only → `tuya-iot-platform`
- Build/debug only → `tuyaopen/dev-loop`
- Project creation only → `tuyaopen/project-config`
- "Add a DP to my existing product" → `tuya-iot-platform`

---

## dpSchema Unwrap Convention

Always unwrap before any DP access — `dpSchema` may be a `{ ok, data }` wrapper:

```js
dpSchema    = snapshot.dpSchema?.data ?? snapshot.dpSchema
dps         = dpSchema?.dps ?? []
selectedDps = dps.filter(dp => dp.selected === true)
```

Never access `snapshot.dpSchema.dps` directly.

---

## Pre-flight Checks

Run in order. Stop on first failure.

| Check | How | If failing |
|-------|-----|------------|
| CLI binary | `.tuyaopen/ide/bin/tuya-devplat-cli` exists | "Please open this project in TuyaOpen IDE first — the IDE writes the CLI wrapper on project open." |
| Platform auth | `tuya-devplat-cli auth status --format json` → exit 0 AND `authenticated: true` | "Please sign in via **TuyaOpen IDE → Developer Platform** sidebar." **Never run `auth login`.** Timeout >10 s → report network issue. |
| SDK env | `$OPEN_SDK_ROOT` set and dir contains `export.sh`/`export.bat`/`export.ps1` | SDK present but not activated → delegate to `tuyaopen/env-setup`. SDK absent → "Please clone the SDK via TuyaOpen IDE → Library." |

---

## Context Reading (Every Entry)

Read ALL files fresh on every entry including re-entry. Never carry state from prior conversation.

| File | What to extract |
|------|----------------|
| `tuyaopen.project.ini` | `[product] pid`, `[platform] target` |
| `.tuyaopen/project.json` | `ai.intent`, `ai.expectedDps`, `ai.productCategory` |
| `.tuyaopen/platform/product-<pid>.json` | full snapshot (apply unwrap), `fetchError` |
| `.tuyaopen/ide/platform.json` | `peripherals`, `connectivity`, `pinout`, `flashAndDebug` |
| `.tuyaopen/ide/board.json` | `peripheralPatterns` |
| `.tuyaopen/ide/demo.json` | `cloud.pid.*` — PID firmware location (IDE-owned; do **not** hand-edit firmware PID, see Step 6). Absent → not created from a demo |
| `.tuyaopen/architecture.json` | `surfaces.embedded.peripherals` |
| `source/embedded/src/tuya_app_main.c` | `#include` lines (text grep only) |
| `source/embedded/src/` listing | all `.c` filenames present |

If `.tuyaopen/` does not exist → state is **no-project**.

---

## State Detection

Evaluate top-to-bottom. First match wins.

```
no-project    .tuyaopen/ does not exist

bare          [product] pid is empty or missing

has-pid       pid non-empty AND any of:
                · product-<pid>.json missing
                · product-<pid>.json has fetchError
                · selectedDps (after unwrap) count === 0

has-dps       pid non-empty
              AND product-<pid>.json exists, no fetchError
              AND selectedDps count ≥ 1
              AND architecture.json surfaces.embedded.peripherals is empty/absent
              AND source/embedded/src/ has only scaffold files*

in-progress   pid non-empty
              AND product-<pid>.json exists, no fetchError
              AND selectedDps count ≥ 1
              AND at least one of:
                · architecture.json surfaces.embedded.peripherals has any entry  ← authoritative
                · source/embedded/src/ has non-scaffold .c files
```

*Scaffold files: at time of writing, only `tuya_app_main.c`. When `architecture.json.surfaces.embedded.peripherals` has entries, that is the definitive `in-progress` signal regardless of file listing. Do not rely on header scanning alone — the scaffold may include umbrella headers (e.g., `tal_api.h`) that reference hardware headers transitively.

---

## State: no-project

Delegate to `tuyaopen/project-config` to create the project. After creation re-run from Context Reading.

---

## State: bare

**Goal:** requirements → create product + DPs on platform → bind PID.

### Step 1 — Requirements

Ask developer to describe the product freely. Extract:
- Features (what the device does)
- Product category: ask explicitly — `dj` (灯具), `kt` (空调), `qt` (通用), etc. Affects DP numbering and standard templates.

**Communication type:** Infer from `[platform] target` + `platform.json.connectivity`. Do not ask.
- Supported: Wi-Fi+BT, Wi-Fi-only, Linux/Raspberry Pi
- Unsupported: pure Bluetooth, Zigbee, Z-Wave → fail-fast, explain why

**Wi-Fi-only path:** If `platform.json.connectivity.ble.enabled === false` — still run Steps 2 and 3. After Step 3, tell developer: "Your board is Wi-Fi-only. `tuya-iot-platform` only supports Wi-Fi+BT product creation. Please create the product manually on platform.tuya.com and give me the PID." Then jump to Step 6 (skip Steps 4–5 — product was created manually).

Do not ask about GPIO/hardware here — that belongs in `has-dps`.

### Step 2 — DP Mapping

Map features to DP codes + types. For known categories, use standard codes. Present for confirmation:

```
I'll create these DPs:
  switch_led   (bool)             — on/off
  bright_value (integer, 10–1000) — brightness
  temp_value   (integer, 0–1000)  — color temperature

Does this look right? Any additions or changes?
```

Wait for explicit confirmation before proceeding.

### Step 3 — Persist Intent (always, including Wi-Fi-only path)

Merge/update `.tuyaopen/project.json`. Preserve all existing top-level fields and all `ai.*` fields not listed below. Only set:

```json
{
  "ai": {
    "intent": "<developer description verbatim>",
    "expectedDps": ["switch_led", "bright_value", "temp_value"],
    "productCategory": "dj"
  }
}
```

### Step 4 — Create Product

Delegate to `tuya-iot-platform` → `ops/product.md`. Show dry-run `preview` + `riskLevel`. **Require explicit developer approval before `--confirm`.** On failure: do not write PID to ini, stop.

### Step 5 — Create DPs

Delegate to `tuya-iot-platform` → `ops/manage-dp.md`. Dry-run → developer approves → confirm. On partial failure: report which DPs failed, stop.

### Step 6 — Bind PID

Edit `tuyaopen.project.ini` → `[product] pid = <pid>`. This is the only file you write for binding.

**Do NOT hand-edit the firmware PID** (the Kconfig `CONFIG_TUYA_PRODUCT_ID` in `source/embedded/app_default.config` / `config/*.config`, or a `TUYA_PRODUCT_ID` macro). The IDE owns the firmware rewrite: it reads the demo's PID-location spec from `.tuyaopen/ide/demo.json` (`cloud.pid.via` / `kconfigKey` / `macro` / `file`) and writes the PID to the exact location that demo declares — which is often NOT the default symbol. Editing it yourself will likely target the wrong key/macro/file and bind the wrong PID.

**Binding is a two-step handshake and is NOT complete after you write the ini.** You write `[product] pid`; the IDE writes the firmware. Until the developer clicks **Update (更新)**, the firmware still holds the *previous* PID (or the demo's placeholder) — the new PID is NOT in the build yet. You MUST NOT end a bind turn without the Update call-to-action below; it is the required final message of every bind, even when you also did other work (DP creation, snapshots, cleanup).

Required closing message: "I've set the PID `<pid>` in `tuyaopen.project.ini`. ⚠️ The firmware still has the old PID — to land the new one, open **TuyaOpen IDE → Project Details** and click the **Update (更新)** button. Tell me when done." (On the Cloud IoT info row the same action is labelled **Refresh (刷新)**.)

When developer says done: re-run full state detection from Context Reading. **Trust the file, not the claim.** If still `has-pid`, tell developer and wait again.

**Do NOT invent IDE buttons or pages.** The only button the developer ever clicks for product data is **Update (更新)** (a.k.a. **Refresh (刷新)** on the Cloud IoT row). There is **no "Sync" button** for product or panel data. The panel snapshot (`panel-<pid>.json`) is auto-managed by the IDE — it syncs on its own when Project Details opens and on bind; never ask the developer to "Sync" it.

**Rollback:** If writing ini fails after product was created: "Product created, PID `<pid>`. Please add manually: `[product] pid = <pid>` in `tuyaopen.project.ini`, then click **Update (更新)** in Project Details."

---

## State: has-pid

**Goal:** Diagnose and fix missing/incomplete DPs.

| Condition | Action |
|-----------|--------|
| `product-<pid>.json` missing | "Please click **Update (更新)** in TuyaOpen IDE → Project Details (or **Refresh (刷新)** on the Cloud IoT row)." Re-run state detection after developer confirms. Trust the file. |
| `fetchError` in snapshot | Show error text. Ask developer to check credentials/network, then click **Update (更新)** again. |
| `selectedDps` count === 0, `ai.expectedDps` exists | Run DP creation (bare Step 5). Ask developer to click **Update (更新)**. Re-run state detection. |
| `selectedDps` count === 0, no `ai.expectedDps` | Ask developer what DPs are needed. Write to `project.json ai.expectedDps` (merge/update, preserve other fields). Run DP creation. Ask developer to click **Update (更新)**. |

**DP completeness** (when selectedDps ≥ 1 and `ai.expectedDps` exists):
- Codes in `ai.expectedDps` but not in `selectedDps` → add via `tuya-iot-platform` → ops/manage-dp.md (dry-run → approve → confirm)
- Codes in `selectedDps` but not in `ai.expectedDps` → ask developer if intentional. If yes: add to `ai.expectedDps` (merge/update `project.json`)

After any fix: ask developer to click **Update (更新)** in Project Details, re-run state detection.

---

## State: has-dps

**Goal:** Hardware wiring + complete firmware generation.

### Step 1 — Reserved Pin Set

Collect from ALL sources:
- `board.json peripheralPatterns[*].pins[*][*].gpio`
- `platform.json flashAndDebug.flash.pins`
- `platform.json flashAndDebug.debug` port → look up TX/RX via `pinout[]`
- `platform.json peripherals.uart[*]` where `role === "log"` → look up TX/RX via `pinout[]`

Available after subtracting reserved:
- **PWM:** `peripherals.pwm.spec.channels[]` — each channel lists valid pin options; exclude options whose GPIO is reserved
- **I2C:** `peripherals.i2c.spec.buses[]` — each bus needs SDA + SCL (2 GPIO); exclude buses with no free pin pair
- **GPIO:** `peripherals.gpio.spec.pins[]` minus all reserved numbers

Read `architecture.json surfaces.embedded.peripherals` — skip Step 3 inquiry for peripherals already wired there.

### Step 2 — Pin Budget

GPIO demand per interface:

| Interface | GPIO pins |
|-----------|-----------|
| PWM channel | 1 |
| I2C bus | 2 (SDA + SCL) |
| SPI bus | 4 (MOSI + MISO + CLK + CS) |
| GPIO output/input | 1 |

If demand > available: tell developer. Suggest alternatives (different board, I2C expander, fewer channels). Do not continue until resolved.

### Step 3 — Hardware Inquiry

For each DP needing hardware (not already in `architecture.json`), present available options then ask:

```
Brightness control (warm + cool LED) via PWM:
  PWM0 → valid pins: 6, 18  (pin 4 reserved: board STATUS_LED)
  PWM1 → valid pins: 7, 19
  PWM2 → valid pins: 8, 20

Which channel + pin for warm-white LED?
Which channel + pin for cool-white LED?
Active-high or active-low?
```

**Never assume a pin.** If developer picks a reserved GPIO: "GPIO X is already used by [board.json component]. Please choose from the options above."

### Step 4 — Plan Confirmation

Present plan including Kconfig changes. Wait for approval.

```
Implementation plan:
  Warm LED: PWM0 / pin 6 / active-high
  Cool LED: PWM1 / pin 7 / active-high
  DP handlers: switch_led (id 1), bright_value (id 2), temp_value (id 3)
  Kconfig: CONFIG_ENABLE_PWM
  Headers: tuya_iot_dp.h, tal_pwm.h
  Cloud: solution type from product snapshot

Does this look right?
```

### Step 5 — Kconfig Update

Update `source/embedded/app_default.config`:
- `peripherals.<name>.enableMacro` (skip if `null`)
- `connectivity.<radio>.enableMacro` (skip if `null`)

Run `tos.py check`. If it fails, fix Kconfig and re-check. **Do not generate code until `tos.py check` passes.**

### Step 6 — Code Generation

Use TAL APIs (`tal_*`). Do not call `tkl_*` (platform layer) directly.

Look up from `platform.json`:
- `peripherals.<name>.tklHeader` → `#include` header path
- `peripherals.<name>.idPrefix` → prefix for port/pin C enums

Generate:
- Hardware init (TAL calls with correct headers and enum IDs)
- DP receive handler for all `selectedDps` IDs
- Hardware → DP feedback after each command
- Cloud connection setup — solution type from:
  ```
  (snapshot.detail?.data ?? snapshot.detail)?.protocolType
  ```
  If field absent, ask developer.

Entry point: `tuya_app_main()` in `source/embedded/src/tuya_app_main.c`.
Debug output: `PR_DEBUG(fmt, ...)`.

### Step 7 — Update architecture.json

Write new peripherals and modules to `architecture.json surfaces.embedded`. **This is the authoritative in-progress signal.** Write only after Step 6 completes.

### Step 8 — Build

Delegate to `tuyaopen/dev-loop`. If build fails, diagnose and fix in place. If Kconfig is root cause, go to Step 5 and rebuild.

---

## State: in-progress

**Goal:** Gap analysis → complete code.

### Step 1 — Gap Analysis

Cross-reference source files, `architecture.json`, `ai.expectedDps`, and `selectedDps`:
- DPs in `ai.expectedDps` with no handler in source → missing
- Peripherals in `architecture.json surfaces.embedded.peripherals` not initialized in code → missing init
- DPs in `selectedDps` not in `ai.expectedDps` → ask developer if they should be handled

### Step 2 — Surface Gap

```
Reading existing code...
Handled: switch_led ✓
Missing: bright_value — no PWM init or handler
Missing: temp_value — no PWM handler
Completing now...
```

### Step 3 — Complete Code

Run `has-dps` Step 3 hardware inquiry **only for missing parts**. Read `architecture.json` first — do not re-ask for already-wired peripherals.

After completing, update `architecture.json` (`has-dps` Step 7).

### Step 4 — Build

Delegate to `tuyaopen/dev-loop`.

---

## Reverse Transitions

| Trigger | Action |
|---------|--------|
| DP found missing vs `ai.expectedDps` | → `has-pid` (add DP), return to current state |
| Developer adds new feature | Update `ai.expectedDps`. → `has-pid` (add DP). Return to `in-progress`. |
| Build fails: missing Kconfig | → `has-dps` Step 5 |
| Developer wants different PID | Clear `[product] pid` from ini. Delete `product-<old-pid>.json`. Keep `ai.*`. → bare Step 3 (persist intent) then Step 6 (bind the new PID). Skip Steps 4–5 — the product already exists on the platform. |
| Change product category | Clear `ai.productCategory` + `ai.expectedDps` from `project.json`. → bare Step 1. |

---

## Always / Never

**Always:**
- Show dry-run `preview` + `riskLevel` before any `--confirm`
- Require explicit developer approval for every platform mutation
- Read `ai.intent` / `ai.expectedDps` before re-asking requirements
- Show available peripheral options before asking developer to choose pins
- Re-read all context files on every entry
- Trust snapshot files — not the developer's oral "done" confirmation
- Apply dpSchema unwrap before any DP access

**Never:**
- Run `tuya-devplat-cli auth login`
- Invent a PID or DP code
- Assume a GPIO pin without developer confirmation
- Re-ask hardware questions already in `architecture.json`
- Proceed past dry-run without approval
- Skip pre-flight checks
- Call `tkl_*` APIs in generated code

---

## Failure & Rollback

| Failure | Recovery |
|---------|---------|
| Product created, write ini fails | Report PID. Ask developer to add `[product] pid = <pid>` manually. |
| DP creation partially fails | Report which failed. Re-enter `has-pid` on next run — `ai.expectedDps` comparison catches the gap. |
| Update (更新) not clicked | Re-run state detection after each "done" claim. Trust the file. |
| Kconfig / `tos.py check` fails | Fix before generating code. |
| Build fails | Stay in `in-progress`. Debug via `dev-loop`. |
| Wi-Fi-only board | Run Steps 1–3, ask developer to create product manually, continue from Step 6. |
