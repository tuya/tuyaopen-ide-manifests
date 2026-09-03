---
name: tuyaopen-workflow-product-dev
description: >-
  End-to-end IoT product development orchestration for TuyaOpen projects.
  Guides from requirements gathering → Tuya Platform product/DP creation →
  DP code generation → embedded firmware → **the phone panel (panel
  mini-app)**, which is what the Tuya app actually shows and is not produced
  by defining DPs. State-machine: detects project state and picks up from
  wherever development currently stands. A product is finished when both
  surfaces exist — firmware AND panel.
  端到端 IoT 产品开发主工作流：涵盖从需求梳理、涂鸦开发者平台（platform.tuya.com）建产品、
  查 PID、定义 DP，到固件生成与手机端 Ray 面板小程序全流程。平台资源与 DP 定义也从这里进。
license: Apache-2.0
compatibility:
- tuyaopen CLI, either form — see skill `tuyaopen-start` § 1
- Tuya IoT Platform account (platform.tuya.com)
metadata:
  version: 2.2.1
  owner: cloud-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
---
# TuyaOpen Smart Product Development

End-to-end orchestration: requirements → Tuya Platform product/DP → embedded firmware.

**Disambiguation:** If only doing one sub-task, use the dedicated skill:
- Platform operations only → `tuyaopen-cloud`
- Build/debug only → `tuyaopen-workflow-embedded-dev`
- Project creation only → `tuyaopen-embedded-project`
- "Add a DP to my existing product" → `tuyaopen-cloud`

---

## Shortcuts — `tuyaopen-cli credential` / `tuyaopen-cli product` / `tuyaopen-cli dp` / `tuyaopen-cli project`

| Intent | Command |
|---|---|
| Check sign-in state / sign in / sign out | `tuyaopen-cli credential status` · `credential login` · `credential logout` (P2) |
| Sync / view the bound product | `tuyaopen-cli product sync` (P2) · `product info` |
| List DPs (**reads the local snapshot**) | `tuyaopen-cli dp list` |
| Add a custom DP (101–199) | `tuyaopen-cli dp add` (P2) |
| Bind a product PID to this project | `tuyaopen-cli project bind-product` (P2) |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per `tuyaopen-start` § 1 (it is
usually not on `PATH`).

**Still routed through `tuya-devplat-cli` / `tuyaopen-cloud`'s Python
helpers, no `tuyaopen-cli` coverage:** product search and creation, and the
standard DP catalog (browse/add/remove/validate) — see skill `tuyaopen-cloud`.
**Still `tos.py`-only, no `tuyaopen-cli` coverage:** Kconfig validation
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
| Platform auth | `tuyaopen-cli credential status --json` → `loggedIn: true` | Not signed in → `tuyaopen-cli credential login` (see skill `tuyaopen-cloud`). **No CLI?** Fall back to `.tuyaopen/ide/bin/tuya-devplat-cli auth status --format json` → exit 0 AND `authenticated: true`; if still not signed in, "Please sign in via **TuyaOpen IDE → Developer Platform** sidebar." **Never run `tuya-devplat-cli auth login` directly** — use `tuyaopen-cli credential login` instead (see the Never list below). Timeout >10 s → report network issue. |
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
              AND `tuyaopen-cli firmware build` has exited 0 for the current source
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
tuyaopen-cli project bind-product --pid <pid> --yes --json
```

(P2 — needs `--yes`.) This writes `tuyaopen.project.ini` → `[product] pid = <pid>` — the only file this step writes.

> **No CLI?** Hand-edit `tuyaopen.project.ini` → `[product] pid = <pid>` directly. See `tuyaopen-start` § 7.

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

## Hand off to the embedded workflow — states `has-dps`, `in-progress`, `built`

**Everything from "the platform has a product with DPs" onward is the
firmware phase, and it lives in skill `tuyaopen-workflow-embedded-dev`.**

This is the one place in the catalogue where a skill names a sibling on
purpose. The rule everywhere else — "out of scope, see `tuyaopen-start`'s
routing table", never naming a sibling — is about *out-of-scope* handoffs. A
workflow's **next phase** is not out of scope; it is the content. Reaching
`has-dps` without being told where to go next is how the pipeline breaks.

| Reached state | Go to |
|---|---|
| `has-dps` | `tuyaopen-workflow-embedded-dev` § *State: has-dps* — pin budget → hardware inquiry → Kconfig → code generation → build |
| `in-progress` | same skill, § *State: in-progress* — gap analysis → complete the code → build |
| `built` | same skill, § *State: built* — flash → authorization code → provisioning |

What you hand over: the PID, the unwrapped `selectedDps`, `ai.expectedDps`,
and the generated C header from `tuyaopen-cli dp generate`. The embedded workflow
re-reads the same context files rather than trusting anything passed in prose,
so a handoff cannot go stale.

**The panel phase is independent of this one.** A miniapp panel needs the same
PID and DP schema but not the firmware, so `tuyaopen-workflow-miniapp-dev` can
start as soon as this skill reaches `has-dps` — it does not wait for a build.

---


## Reverse Transitions

Only the platform-phase transitions live here. The firmware-phase ones (build
failures, missing Kconfig, a device that never appears in the App) are in
`tuyaopen-workflow-embedded-dev` — same table, split at the same phase
boundary as the states.

| Trigger | Action |
|---------|--------|
| DP found missing vs `ai.expectedDps` | → `has-pid` (add DP), return to current state |
| Developer adds new feature | Update `ai.expectedDps`. → `has-pid` (add DP). Then return to whichever firmware state you came from |
| Developer wants different PID | Clear `[product] pid` from ini. Delete `product-<old-pid>.json`. Keep `ai.*`. → bare Step 3 (persist intent) then Step 6 (bind the new PID). Skip Steps 4–5 — the product already exists on the platform. |
| Change product category | Clear `ai.productCategory` + `ai.expectedDps` from `project.json`. → bare Step 1. |
| User asks for an auth code at any point in this phase | Say what it is for and that it is not needed yet — it belongs to the firmware phase, after the build succeeds. Do **not** collect a code early: a code in hand is a code occupied, and one code may only be in use on one device at a time. |

---

## Always / Never

**Always:**
- Show dry-run `preview` + `riskLevel` before any `--confirm`
- Require explicit developer approval for every platform mutation
- Read `ai.intent` / `ai.expectedDps` before re-asking requirements
- Re-read all context files on every entry
- Trust snapshot files — not the developer's oral "done" confirmation
- Apply dpSchema unwrap before any DP access

**Never:**
- Run `tuya-devplat-cli auth login` — use `tuyaopen-cli credential login` instead
- Invent a PID or DP code
- Proceed past dry-run without approval
- Skip pre-flight checks
- Ask for a device authorization code during this phase

---

## Failure & Rollback

| Failure | Recovery |
|---------|---------|
| Product created, write ini fails | Report PID. Ask developer to add `[product] pid = <pid>` manually. |
| DP creation partially fails | Report which failed. Re-enter `has-pid` on next run — `ai.expectedDps` comparison catches the gap. |
| Update (更新) not clicked | Re-run state detection after each "done" claim. Trust the file. |
| Wi-Fi-only board | Run Steps 1–3, ask developer to create product manually, continue from Step 6. |

## 深层技能：默认不安装，按需取回

本目录 30 个技能里**只有 4 个默认安装**（本技能 + 三个阶段 workflow）。其余 26 个仍在
目录里、内容完整，但**不在你的上下文里** —— 它们靠这一条命令取回：

```bash
tuyaopen-cli skills read --id <id>                       # 正文
tuyaopen-cli skills read --id <id> --path references/x.md # 某个附件
tuyaopen-cli skills read --id <id> --files                # 它带了哪些文件
```

它读的是 `manifests sync` 落下来的目录缓存，**不经过任何 agent 工具的安装根** ——
所以某个工具的安装视图坏掉（链接悬空、目录被删）也不影响它。

**不知道该取哪个**：`tuyaopen-cli skills list --json` 列出全部 30 条（含 `whenToUse`），
或查 skill `tuyaopen-start` 的 `references/ROUTING.md` 路由表。

**取不到**（`config` / `no_manifest_cache`）：跑 `tuyaopen-cli manifests sync` 把目录拉下来，
再重试。这是它唯一的失败模式。

需要长期固定在项目里（跟 git 走、可 review）时才装：
`tuyaopen-cli skills install --ids <id>`。平时不需要。
