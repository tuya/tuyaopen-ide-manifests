---
name: tuyaopen-workflow-product-dev
description: >-
  End-to-end IoT product development orchestration for TuyaOpen projects.
  Guides from requirements gathering → Tuya Platform product/DP creation →
  complete embedded firmware generation. State-machine: detects project
  state and picks up from wherever development currently stands.
when_to_use: >-
  Use when the developer says "I want to make a [device]", "帮我做一个XX",
  "what's next?", "下一步该干什么", or describes product features and expects
  end-to-end guidance. Do NOT use for pure platform ops (→ tuyaopen-cloud),
  pure build/debug (→ tuyaopen-embedded-dev-loop), or project creation only
  (→ tuyaopen-embedded-project).
id: tuyaopen-workflow-product-dev
surface: embedded
tags: [product, dp, pid, embedded, iot, workflow, orchestration]
license: Apache-2.0
defaultEnabled: true
related:
  - tuyaopen-cloud
  - tuyaopen-embedded-dev-loop
  - tuyaopen-embedded-project
  - tuyaopen-embedded-env-setup
command: tuyaopen.skill.smartProductDev
---

# TuyaOpen Smart Product Development

End-to-end orchestration: requirements → Tuya Platform product/DP → embedded firmware.

**Disambiguation:** If only doing one sub-task, use the dedicated skill:
- Platform operations only → `tuyaopen-cloud`
- Build/debug only → `tuyaopen-embedded-dev-loop`
- Project creation only → `tuyaopen-embedded-project`
- "Add a DP to my existing product" → `tuyaopen-cloud`

---

## Shortcuts — `tuyaopen credential` / `tuyaopen product` / `tuyaopen dp` / `tuyaopen project`

| Intent | Command |
|---|---|
| Check sign-in state / sign in / sign out | `tuyaopen credential status` · `credential login` · `credential logout` (P2) |
| Sync / view the bound product | `tuyaopen product sync` (P2) · `product info` |
| List DPs (**reads the local snapshot**) | `tuyaopen dp list` |
| Add a custom DP (101–199) | `tuyaopen dp add` (P2) |
| Bind a product PID to this project | `tuyaopen project bind-product` (P2) |

Flags aren't listed here — run `tuyaopen schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen` first per `tuyaopen-shared` § 1 (it is
usually not on `PATH`).

**Still routed through `tuya-devplat-cli` / `tuyaopen-cloud`'s Python
helpers, no `tuyaopen` coverage:** product search and creation, and the
standard DP catalog (browse/add/remove/validate) — see skill `tuyaopen-cloud`.
**Still `tos.py`-only, no `tuyaopen` coverage:** Kconfig validation
(`tos.py check`, used in State: has-dps Step 5 and the Failure & Rollback
table below).

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
| Platform auth | `tuyaopen credential status --json` → `loggedIn: true` | Not signed in → `tuyaopen credential login` (see skill `tuyaopen-cloud`). **No CLI?** Fall back to `.tuyaopen/ide/bin/tuya-devplat-cli auth status --format json` → exit 0 AND `authenticated: true`; if still not signed in, "Please sign in via **TuyaOpen IDE → Developer Platform** sidebar." **Never run `tuya-devplat-cli auth login` directly** — use `tuyaopen credential login` instead (see the Never list below). Timeout >10 s → report network issue. |
| SDK env | `$OPEN_SDK_ROOT` set and dir contains `export.sh`/`export.bat`/`export.ps1` | SDK present but not activated → delegate to `tuyaopen-embedded-env-setup`. SDK absent → "Please clone the SDK via TuyaOpen IDE → Library." |

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

built         everything `in-progress` requires
              AND `tuyaopen firmware build` has exited 0 for the current source
              (there is no on-disk flag for this — it is the state you are in
               after has-dps Step 8 / in-progress Step 4 succeeds, and you fall
               back out of it the moment a later edit breaks the build)
```

`built` is the only state above with no file-system signature, and that is
deliberate: inventing one (a marker file, a mtime comparison) would let a stale
flag claim a device is ready to authorize when the firmware no longer compiles.
Treat it as a *session* fact — you built it, so you know — and re-derive it by
building again if you are unsure. The practical consequence is the one that
matters: **you may not enter `built` Step 2 on the strength of a guess**, which
is exactly the guard round 2 lacked.

*Scaffold files: at time of writing, only `tuya_app_main.c`. When `architecture.json.surfaces.embedded.peripherals` has entries, that is the definitive `in-progress` signal regardless of file listing. Do not rely on header scanning alone — the scaffold may include umbrella headers (e.g., `tal_api.h`) that reference hardware headers transitively.

---

## State: no-project

Delegate to `tuyaopen-embedded-project` to create the project. After creation re-run from Context Reading.

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

**Wi-Fi-only path:** If `platform.json.connectivity.ble.enabled === false` — still run Steps 2 and 3. After Step 3, tell developer: "Your board is Wi-Fi-only. `tuyaopen-cloud` only supports Wi-Fi+BT product creation. Please create the product manually on platform.tuya.com and give me the PID." Then jump to Step 6 (skip Steps 4–5 — product was created manually).

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

Delegate to `tuyaopen-cloud` → `ops/product.md`. Show dry-run `preview` + `riskLevel`. **Require explicit developer approval before `--confirm`.** On failure: do not write PID to ini, stop.

### Step 5 — Create DPs

Delegate to `tuyaopen-cloud` → `ops/manage-dp.md`. Dry-run → developer approves → confirm. On partial failure: report which DPs failed, stop.

### Step 6 — Bind PID

Bind the PID:

```bash
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen project bind-product --pid <pid> --yes --json
```

(P2 — needs `--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1`.) The env var **prefixes this one invocation**; do not `export` it, or every later P2 command in that shell — `skills uninstall`, `dependency remove`, `dp add` — is one `--yes` away. This writes `tuyaopen.project.ini` → `[product] pid = <pid>` — the only file this step writes.

> **No CLI?** Hand-edit `tuyaopen.project.ini` → `[product] pid = <pid>` directly. See `tuyaopen-shared` § 7.

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
- Codes in `ai.expectedDps` but not in `selectedDps` → add via `tuyaopen-cloud` → ops/manage-dp.md (dry-run → approve → confirm)
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

Delegate to `tuyaopen-embedded-dev-loop`. If build fails, diagnose and fix in place. If Kconfig is root cause, go to Step 5 and rebuild.

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

Delegate to `tuyaopen-embedded-dev-loop`.

---

## State: built — bring the device online

**Goal:** a device the user can control from their phone. This state existed
implicitly and that was the bug: the state machine above ended at "it
compiles", so nothing owned the question "when do we get the device onto the
cloud", and beta round 2's agent asked for an authorization code in its very
first turn — before the project directory existed. Everything below happens
**after** `firmware build` exits 0, in this order, and not before.

### Step 1 — Flash

Delegate to `tuyaopen-embedded-flash`. Pick the port via `tuyaopen device
list-ports` (multi-port boards: that command's `hint` tells you how to
disambiguate). Note the default baud can be slow enough to hit the build/flash
timeout on a large image — `--baud 921600` is the usual fix, and
`--timeout <ms>` raises the ceiling.

### Step 2 — Authorization code (the FIRST time it is legitimate to ask)

Delegate to `tuyaopen-embedded-device-auth` and read its **§0** before opening
your mouth: a code is needed here and nowhere earlier, one code may only be in
use on **one** device at a time, and you must ask the user to confirm the code
is free before writing it. If the user has no code, that skill's *没有授权码怎么办*
section is the answer — do not stall the build waiting for one.

```bash
tuyaopen diag doctor --json          # deviceAuth.localLicenses — 0 means "none stored here"
```

### Step 3 — Write it, then read it back

`tuyaopen firmware authorize` (P2 — needs `--yes`), then **verify** with
`tuyaopen firmware auth-status --port <port>`. A write you did not read back is
not a completed step.

### Step 4 — Hand provisioning to the user

Provisioning is a **phone** action; no CLI can do it. Tell the user, explicitly,
that the next three steps are theirs: install **智能生活 / Smart Life**, sign in
with an account in the **same region as the product**, then "Add device" and pair
while the device sits in provisioning mode.

Your own success criterion is not "paired" — you cannot observe that. It is
`auth-status` reporting a code on the device and the serial log no longer
printing `client no active`.

---

## Reverse Transitions

| Trigger | Action |
|---------|--------|
| DP found missing vs `ai.expectedDps` | → `has-pid` (add DP), return to current state |
| Developer adds new feature | Update `ai.expectedDps`. → `has-pid` (add DP). Return to `in-progress`. |
| Build fails: missing Kconfig | → `has-dps` Step 5 |
| Developer wants different PID | Clear `[product] pid` from ini. Delete `product-<old-pid>.json`. Keep `ai.*`. → bare Step 3 (persist intent) then Step 6 (bind the new PID). Skip Steps 4–5 — the product already exists on the platform. |
| Change product category | Clear `ai.productCategory` + `ai.expectedDps` from `project.json`. → bare Step 1. |
| Device never appears in the App, log says `client no active` | → `built` Step 2. This is missing authorization, not a code bug — see `tuyaopen-embedded-device-auth`. |
| User asks for an auth code before the firmware builds | Say what it is for and that it is not needed yet; finish `has-dps` Step 8 first. Do **not** collect a code early — a code in hand is a code occupied. |

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
- Run `tuya-devplat-cli auth login` — use `tuyaopen credential login` instead
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
