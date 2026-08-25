---
name: tuyaopen-embedded-device-auth
description: >-
  Configure device authorization credentials (UUID, AuthKey, PID) and network
  provisioning for TuyaOpen devices via `tuyaopen-cli license list/add/import/
  remove` (a local CLI-only license store) and `tuyaopen-cli firmware authorize`
  (writes the code to the device over serial, P2). Use when the user mentions
  device auth, authorization, UUID, AuthKey, tuya_config.h, provisioning,
  pairing, or cloud connection. A late-stage skill: the code is needed only
  after the firmware builds and is about to be flashed — read its §0 before
  asking the user for a code.
  设备授权、授权码、配网、UUID、AuthKey、云连接、tuyaopen-cli license、
  tuyaopen-cli firmware authorize。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1 (for `tuyaopen-cli license`/`firmware authorize`)
  - TuyaOpen environment activated (export.sh / export.ps1 / export.bat) — needed for the `tyutool_cli`-direct fallback, not for the CLI commands above
  - Tuya IoT Platform account (platform.tuya.com) for credentials
---

# TuyaOpen Device Authorization & Provisioning

Docs: <https://tuyaopen.ai/docs/quick-start/equipment-authorization>

## §0 什么时候才该问用户要授权码 —— 先看这一节

<code data-type="tag" style="color:#ff4d4f">内测第二轮实测的错误形态：问得太早</code>

这是一个**收尾阶段**的技能。授权码在整条开发链里的位置是固定的：

```
需求 → 建产品/DP → 绑 PID → 硬件确认 → 写代码 → 编译通过
                                                  ↓
                                        ★ 这里才开始需要授权码 ★
                                                  ↓
                            烧固件 → 写授权码 → 读回核对 → 用户手机配网
```

**在「编译通过」之前，不要向用户索要授权码。** 判据只有一条，而且是可执行的：

```bash
tuyaopen-cli firmware build --project-root <项目>   # 先让它 exit 0
```

在它成功之前，问了也没用 —— 没有固件可烧，没有设备可写，用户只能把答案搁在那儿。

第二轮实测就是这样：agent 在**会话最开头**就问了「你有授权码吗」，此时项目目录还没建、
一行代码都没写。用户把这个问题挂了半小时，而到了真正该写码的节点，agent **又问了一遍**
（那一次是对的）。代价不只是问两遍：早问会诱导用户去「先弄一个码」，而一个码同一时间只能
绑一台设备（见下一节规则二），在设备还没准备好的时候就占掉它，是纯粹的浪费。

**唯一的例外**：用户自己先提起授权/配网/`client no active`，或者项目已经处在编译通过之后
的状态。这时按用户的节奏走，不要反过来把他推回前面的步骤。

### 配网是用户的动作，不是你的

写完码之后还有一步，**没有任何 CLI 能替用户做**：

1. 用户在手机上装 **智能生活 / Smart Life** App（应用商店搜这个名字）。
2. 在 App 里注册/登录，账号所在的**国家/区域要和产品的区域一致**，否则设备连上了也搜不到。
3. 设备上电进入配网态（多数 demo 是长按按键或首次上电自动进入），在 App 里「添加设备」搜索并配网。

到了这一步要**明确告诉用户「接下来这三步需要你在手机上做」**，并说清设备此刻应该处于什么状态。
不要写成「已完成配网」——你无法验证它，能验证的是 `firmware auth-status` 和串口日志里
`client no active` 是否消失。

## 为什么会走到这一步：`client no active`

<code data-type="tag" style="color:#faad14">内测第一轮实测的失败形态</code>

固件编译通过、烧录成功、DP 处理函数被调用、串口能看到上报调用 —— 然后设备**永远不出现在
涂鸦 App 里**，串口日志只有一行：

```
[tuya_iot_dp.c:224] client no active
```

这不是代码 bug。**设备没有授权码（UUID + AuthKey）就无法接入涂鸦云。** 第一轮的测试者一路
做到「本地功能全对、云端完全不通」，而在此之前**没有任何一步提示过需要授权**。

所以：只要目标是「设备能被 App 控制」，授权就是**必经步骤**，不是可选的收尾。判据是

```bash
tuyaopen-cli diag doctor --json      # 看 deviceAuth.localLicenses
```

`localLicenses: 0` 时它会直接给出下一步。本机有码之后再按下面的表把码写进设备。

## 授权码的两条硬规则 —— 先读这个，再动手

<code data-type="tag" style="color:#ff4d4f">写之前必须先问用户</code>

**规则一：可以反复烧写、可以擦除。** 写进设备的是一条 KV，`firmware authorize` 因此在
2026-08-18 从 P0 降到 P2 —— 它不满足 P0 的判据（没有反向命令、且销毁不可重建的状态），
写错了再写一次就行，`firmware auth-status` 能读回来核对。

**规则二：同一个码同一时间只能用在一台设备上。** 这一条不是从命令行为里能看出来的，
但它决定了你该怎么用：

- 把同一个 UUID 写进第二台设备，**不是**「两台都能用」，而是两台互相冲突 —— 云端按 UUID
  认设备。
- 所以「设备 B 也要联网」的正确做法不是复用设备 A 的码，而是**再要一个码**。
- 反过来说，一台设备**换**码是安全的（规则一），把旧设备的码挪到新设备也可以 —— 前提是
  旧设备不再需要联网。

**因此：写码之前一定要问用户。** 不是走确认门（`--yes` + 环境变量）那种形式上的确认，而是
真的要问清楚**这个码现在是不是空闲的**：

> 我要把 UUID `xxxx…` 写进 `/dev/ttyACM0`。这个码同一时间只能给一台设备用 ——
> 请确认它现在没有用在别的设备上（用过的可以擦掉重写，但不能两台同时用）。确认后我就写。

## 没有授权码怎么办

先看有没有：

```bash
tuyaopen-cli diag doctor --json      # deviceAuth.localLicenses
tuyaopen-cli license list --json     # 本地存了哪些（AuthKey 默认打码）
```

`localLicenses: 0` 时，**`tuyaopen-cli` 侧没有申领命令** —— `license` 组只有
`list` / `add` / `import` / `remove`，都是本地库操作。码必须先从云端拿到，三条路：

| 路径 | 怎么做 | 什么时候用 |
|---|---|---|
| **TuyaOpen IDE** | 侧边栏 *Developer Tools → Licenses*，按已绑定的 PID 申领（内部走 `tuya-devplat-cli auth-code fetch --pid <pid>`），拿到后会写进本地库 | 装了 IDE 时最省事；**需要项目已绑定 PID** |
| **开发者平台网页** | 在产品的「设备授权」/ 授权码页面申领，导出 Excel | 没装 IDE，或要批量 |
| **别人给你一个 xlsx** | `tuyaopen-cli license import --xlsx <path>` | 团队里已有一批码 |

拿到之后：

```bash
tuyaopen-cli license add --uuid <uuid>          # AuthKey 走 TUYA_LICENSE_AUTHKEY 或 stdin，绝不上 argv
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli firmware authorize --port <port> --uuid <u> --authkey <k> --yes
tuyaopen-cli firmware auth-status --port <port> # 读回来核对
```

**如果一个码都拿不到**：停下来告诉用户，并说清卡在哪一步 —— 是没绑 PID、没装 IDE、还是
平台侧没有可申领的额度。**不要**继续往下做然后让设备卡在 `client no active`，也不要编一个
UUID 试试看。

## Shortcuts — `tuyaopen-cli license` / `tuyaopen-cli firmware`

| Intent | Command |
|---|---|
| List locally-saved UUID/AuthKey pairs | `tuyaopen-cli license list` (AuthKey masked; add `--full` for the real value) |
| Save a UUID/AuthKey pair to the local CLI store | `tuyaopen-cli license add --uuid <u>` — AuthKey via `TUYA_LICENSE_AUTHKEY` env var or stdin, **never** as a flag |
| Bulk-import from an Excel file | `tuyaopen-cli license import --xlsx <path>` |
| Delete a saved license | `tuyaopen-cli license remove --uuid <u>` — **P0**, needs `--dry-run` → `--confirm <token>` |
| Write a UUID+AuthKey code to the device over serial | `tuyaopen-cli firmware authorize --port <port> --uuid <u> --authkey <k>` — **P2**, needs `--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1` |

**⚠ `license remove` and `firmware authorize` are gated differently — don't
carry one's ritual over to the other.** `license remove` is **P0**: never
try to construct the `--confirm` token yourself, it is a derived SHA-256 hash
of the exact group + command + flags, computed by the CLI's own `--dry-run`
branch and compared byte-for-byte — a token minted for one UUID does not
confirm a different one, and there is no shortcut around running `--dry-run`
first and copying the value it hands back. `firmware authorize` dropped from
P0 to **P2** on 2026-08-18 (the KV it writes is rewritable and `firmware
auth-status` reads it back, so it fails the P0 criterion) — it takes `--yes`
+ `TUYAOPEN_AUTOCONFIRM_P2=1` instead, and its `--dry-run` does not hand back
a confirm token at all. Full mechanics: skill `tuyaopen-shared` § 4.

> **No CLI?** `firmware authorize` → `tyutool_cli authorize` directly (see
> § *Serial port discovery* below). `license *` has no older-tool
> equivalent — it's a new, CLI-only local store; there is nothing to fall
> back to for it. See skill `tuyaopen-shared` § 7.

**⚠ `tuyaopen-cli license *` is a *third*, independent record — not the device,
and not the IDE panel.** Verified against `src/cli/commands/license.ts` +
`src/core/licenses/licenseFileStore.ts` + `src/licenses/localStore.ts`:

| Record | Lives in | Written by |
|---|---|---|
| Device credentials | **KV** (`UUID_TUYAOPEN` / `AUTHKEY_TUYAOPEN`, rewritable) | `firmware authorize` / `tyutool_cli authorize` / `tuya_config.h` at build time |
| IDE license panel (授权码 page) | `vscode.SecretStorage` key `tuyaopen-ide.licenses.local` | IDE UI events only |
| **CLI license store** | Plain JSON file `~/TuyaOpenIDE/.tuyaopen/licenses.json` (or `TUYAOPEN_LICENSES_DIR` env override) | `tuyaopen-cli license add/import/remove` only |

> **OTP is not a write location.** It is the **factory-preburned module's**
> read source (see Credential Resolution Priority tier 2,
> `tuya_iot_license_read()`). Our commands write to KV, which **can be
> re-flashed** — listing the two side by side as write destinations makes
> authorization look like a one-time operation, so people are afraid to
> retry it. Verify after writing with `tuyaopen-cli firmware auth-status --port
> <port>`.

The CLI store and the IDE panel store happen to share the same on-disk JSON
*shape* (`{version, items}`) but are two different storage locations with no
sync between them — `tuyaopen-cli license add`ing a UUID does **not** make it
appear on the IDE's 授权码 page, and vice versa. Don't use `tuyaopen-cli license
add` expecting it to populate the panel; it's a scratch space for an agent's
own bookkeeping, not a route into the IDE ledger (see § *IDE Ledger* below
for the actual handback mechanism).

**⚠ `firmware authorize --authkey` is on argv — a deliberate, narrow
exception to the repo's "secrets never on argv" rule.** `license add` takes
AuthKey via env var/stdin specifically to keep it off argv, but
`firmware authorize` wraps `tyutool_cli`, which only accepts `--authkey
<value>` as a flag (no env/stdin form on that binary) — so the AuthKey sits in
argv for the ~30s authorize window, world-readable via `ps`/`/proc`. The CLI
never echoes it back in its own output, and scrubs the device's echo of it
too. This is a documented trade-off (see the security comment on
`firmwareAuthorize` in `src/cli/commands/firmware.ts`), not an oversight —
don't "fix" it by trying to route the AuthKey through an env var instead,
`tyutool_cli` won't read it there.

Full flags (baud, `--sdk-root`, `--product-id`, `--label`): `tuyaopen-cli license
--help` / `tuyaopen-cli firmware --help`, or `tuyaopen-cli schema get --group license
--command <cmd>` — don't hardcode the flag list here (skill `tuyaopen-shared`
§ 5).

**Serial port discovery still needs the SDK's own tool, not the `tuyaopen-cli`
CLI** — `tuyaopen-cli firmware list-ports` (skill `tuyaopen-embedded-flash`) doesn't expose
the `usbSerial`/`usbInterface` grouping a dual-serial board needs to
disambiguate flash vs. auth vs. log ports. See § *Serial port discovery*
below, which uses `tyutool_cli list-ports --json` directly.

## Authorization Overview

TuyaOpen devices need three credentials to connect to the Tuya cloud:

| Credential | Macro | Purpose |
|-----------|-------|---------|
| Product ID (PID) | `TUYA_PRODUCT_ID` | Identifies the product type on the Tuya IoT platform |
| UUID | `TUYA_OPENSDK_UUID` | Unique device identifier |
| AuthKey | `TUYA_OPENSDK_AUTHKEY` | Device authentication key (paired with UUID) |

### Credential Resolution Priority

The SDK resolves credentials in this order (first success wins):

1. **KV storage** — previously written via CLI `auth` command (keys: `UUID_TUYAOPEN` / `AUTHKEY_TUYAOPEN`)
2. **OTP / module flash** — `tuya_iot_license_read()` reads from hardware (pre-burned modules)
3. **Source code macros** — `TUYA_OPENSDK_UUID` / `TUYA_OPENSDK_AUTHKEY` in `tuya_config.h`

If none succeed, the device cannot connect to the cloud.

## Configuring tuya_config.h

Each application has a `tuya_config.h` (in `include/` or `src/`). Edit it with your credentials:

```c
#define TUYA_PRODUCT_ID      "xxxxxxxxxxxxxxxx"
#define TUYA_OPENSDK_UUID    "uuidxxxxxxxxxxxxxxxx"
#define TUYA_OPENSDK_AUTHKEY "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Optional for AP provisioning with QR code:

```c
#define TUYA_NETCFG_PINCODE  "12345678"
```

**File locations** (vary by project):
- `apps/tuya_cloud/switch_demo/src/tuya_config.h`
- `apps/tuya.ai/your_chat_bot/include/tuya_config.h`
- `apps/tuya_cloud/weather_get_demo/include/tuya_config.h`

> Note: some README files reference `TUYA_DEVICE_UUID` / `TUYA_DEVICE_AUTHKEY` — these are outdated names. The actual macros used in source code are `TUYA_OPENSDK_UUID` / `TUYA_OPENSDK_AUTHKEY`.

## Getting Credentials

### Product ID (PID)

1. Log in to [Tuya IoT Platform](https://platform.tuya.com).
2. Create a product matching your device type.
3. Copy the PID from the product page.

### UUID + AuthKey

> **This section is the catalogue's single home for "how do I get an
> authorization code".** Other skills that mention UUID/AuthKey (
> `tuyaopen-embedded-flash`, `tuyaopen-workflow-embedded-dev`,
> `tuyaopen-workflow-miniapp-dev`, `tuyaopen-shared`) point here rather than
> repeating the routes — do not copy the two URLs below into them.

TuyaOpen-specific authorization codes come in three ways:

1. **Pre-burned modules** — some Tuya modules ship with credentials in OTP; no manual setup needed.
2. **Free developer codes — two of them, claimed on the web** —
   <https://tuyaopen.ai/zh/pricing-guide> documents the free allowance: during
   development you can claim **2 free device authorizations** from the Tuya
   Developer Platform. Read that page for the current claim steps (log in →
   create a product → pick the module → claim the codes from the product page)
   — it is the authoritative source, so do not reconstruct the steps from
   memory.
3. **Purchase from Tuya platform** — <https://platform.tuya.com/purchase/index?type=6>
   for any quantity beyond the two free codes.

**Both routes are web-only.** There is no `tuyaopen-cli` CLI command that claims,
buys, or fetches an authorization code — `tuyaopen-cli license add` / `import`
only *record* a UUID/AuthKey pair you already hold into the local CLI store,
and `tuyaopen-cli firmware authorize` only *writes* one you already hold to the
device. If the user has no code yet, send them to one of the two URLs above;
do not invent a command.

> Important: only **TuyaOpen-specific** authorization codes work. Standard Tuya module authorization codes are **not compatible**.

## Device ID (`devid`) — after provisioning, not before

**A device ID only exists once the device has finished network provisioning.**
Before that there is nothing to fetch: UUID/AuthKey identify the *hardware*,
`devid` identifies the *provisioned cloud device*. Panel development, DP
debugging and per-device APIs all key off `devid`, so "there is no devid yet"
usually means "this device has not been provisioned", not "the lookup failed".

**Method 1 — Smart Life app (no code, no rebuild).**
Provision the device with the app, then: device page → `···` (top right) →
**Device information** → **Virtual ID**. That value is the `devid`. This is the
method to reach for when you do not own the firmware.

**Method 2 — print it from firmware.** Add the call below and read it off the
serial log after provisioning completes:

```c
#include "tuya_iot.h"          /* src/tuya_cloud_service/cloud/tuya_iot.h */

const char *devid = tuya_iot_devid_get(tuya_iot_client_get());
PR_INFO("devid: %s", devid ? devid : "(null)");
```

`tuya_iot_devid_get(tuya_iot_client_t *client)` returns a `const char *` owned
by the client — do not free it, and do not cache it across a re-provision.
Call it **after** the device is activated; before that the client has no id to
return. An in-tree example of the same pairing is
`apps/tuya_t5_pocket/tuya_t5_pocket_ai/src/game_pet.c`, which passes the result
straight into `tuya_iot_dp_obj_report()`.

> Panel developers get this same pair, stated compactly, in skill
> `tuyaopen-workflow-miniapp-dev`. That is a deliberate duplication rather than a
> pointer: a panel developer often does not own the firmware, and forcing them
> through an embedded skill to learn a two-step app lookup is worse than
> repeating five lines.

## Writing Auth via Serial & Network Provisioning

For CLI-based serial authorization (port selection, baud rates, commands), provisioning modes (BLE / AP), and the full provisioning flow, see `references/PROVISIONING.md`.

### Serial port discovery (agents)

Before writing auth credentials over UART, identify the correct port:

1. List available ports, with the USB metadata that identifies them:
   ```bash
   $OPEN_SDK_ROOT/tools/tyutool/tyutool_cli list-ports --json
   ```
   Bare `ls /dev/ttyACM*` / `[System.IO.Ports.SerialPort]::GetPortNames()` gives
   names only — enough to see *that* ports exist, not which one to authorize on.

2. **Determine the board shape by grouping on `usbSerial`** — one physical board
   is one `usbSerial`, however many ports it exposes:

   | Ports sharing a `usbSerial` | Board | Auth port |
   |---|---|---|
   | 1 | **single-serial** | that port — flash, auth and log all share it |
   | 2+ | **dual-serial** | the one with the lowest `usbInterface`; the other carries the log |

   Rank by `usbInterface`, **not** by the `COM`/`ttyACM` number — the two
   orderings disagree (a board can present `COM34` = interface 0 = auth port
   alongside `COM33` = interface 2 = log port). Not guaranteed across vendors:
   if `auth` gets no `tuya> ` prompt, try the other port of the same `usbSerial`.

3. **Single-serial boards: free the port first.** Log output and the auth channel
   are the same OS resource, so any open monitor — including the IDE's serial
   panel — blocks authorization with `PermissionError 13` / `Access is denied` /
   `Device or resource busy`. Stop the monitor, authorize at 115200, then reopen
   it at the log baud. On dual-serial boards you can leave the monitor running.

4. On dual-serial boards, use skill `tuyaopen-embedded-cli-debug` to capture logs in the
   background while the auth flow runs on the other port:
   ```bash
   $OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py start -p <monitor-port>
   # ... run auth on auth port ...
   $OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py tail -n 100
   $OPEN_SDK_PYTHON .agents/skills/tuyaopen-embedded-cli-debug/scripts/monitor_helper.py stop
   ```

## IDE Ledger — Reporting Auth Back to the IDE

The device and the TuyaOpen IDE keep **two independent records**. Confusing them
is the most common source of "I authorized it but the IDE disagrees":

| Record | Lives in | Changed by |
|---|---|---|
| Device credentials | **KV** (`UUID_TUYAOPEN` / `AUTHKEY_TUYAOPEN`, rewritable) | `tyutool_cli authorize`, the IDE's own serial-auth button, or `tuya_config.h` at build time |
| IDE license ledger | 授权码 panel status (`未使用` / `使用中` / `已绑定`) | IDE-side events **only** |

> **OTP is not a write location** — see the § *Shortcuts* note above
> (KV/OTP correction, `tuya_iot_license_read()`). This row means the same
> thing as that one: the chip's own state is **KV**, rewritable at any time.

**Authorizing from the command line does not update the panel.** A license the
device is genuinely running can still display `未使用`, because nothing told the
IDE it happened. This is a bookkeeping gap, not an authorization failure — do
not "fix" it by re-flashing credentials.

Status semantics differ by license source:

- **Cloud licenses** take their status from the Tuya backend, which flips it
  only once the device actually activates against the cloud. The IDE never
  overrides it, and neither can an agent.
- **Local (pasted) licenses** are the ones an agent can and should report.

### The `pending-auth.json` handback

After authorizing a device outside the IDE, write `pending-auth.json` at the
**IDE workspace root** — the `tuyaopen.workspaceRoot` setting, defaulting to
`<home>/TuyaOpenIDE/`. Note this is the workspace root *above* the project, not
the project directory itself.

```json
{ "uuid": "your_uuid_here", "mac": "AA:BB:CC:DD:EE:FF" }
```

| Field | Required | Meaning |
|---|---|---|
| `uuid` | YES | Must already exist in the IDE's license list, or the file is discarded |
| `mac` | no | Binds the device MAC to the license entry |

A file watcher consumes it, records an authorization event, flips a **local**
license from `未使用` to `已绑定`, stamps the last-used time, and then **deletes
the file**.

Two cautions:

1. **Deletion is not proof of success.** The "uuid not in the list" path deletes
   the file too. Ask the developer to confirm the panel label rather than
   inferring it from the file disappearing.
2. **Never put the AuthKey in this file.** The protocol needs only `uuid` and
   `mac`; the file sits on disk until the watcher fires.

If the developer would rather the IDE track it natively, point them at the
panel's own serial-auth button — that path records the event without a handback.

## Agent Strategy

### After authorizing outside the IDE

1. Write the `pending-auth.json` handback described above, so the IDE ledger
   matches the hardware.
2. Include the MAC when the firmware can give it — it is what lets the panel
   show which physical device a license went to. Send `read_mac` on the same
   port and baud you just authorized on (`references/PROVISIONING.md` → *CLI
   Auth Commands*); run `help` first if unsure the build has it. Skip the field
   if the command is absent — it is optional, and the boot log on the monitor
   port is a fallback, not a requirement.
3. Report the panel label as **unconfirmed** until the developer eyeballs it.

### When generating or modifying tuya_config.h

1. **Always use placeholder values** in generated code:
   ```c
   #define TUYA_PRODUCT_ID      "your_product_id_here"
   #define TUYA_OPENSDK_UUID    "your_uuid_here"
   #define TUYA_OPENSDK_AUTHKEY "your_authkey_here"
   ```
2. **Warn the user** if credentials appear to be placeholders when they attempt to build/flash for cloud testing.
3. **Never log, commit, or display** real UUID/AuthKey values in output, comments, or commit messages.
4. If the user provides real credentials, write them only to `tuya_config.h` and remind them not to commit the file with real values.

### Detecting placeholder values

Placeholder patterns to check: values containing `your_`, `xxx`, `here`, empty strings, or strings shorter than expected length (UUID ~20 chars, AuthKey ~32 chars).

## Not in scope

Flashing firmware or choosing a serial port for reasons unrelated to
authorization, and network-provisioning protocol details beyond writing the
credential — not in scope here, see skill `tuyaopen-shared`'s routing table
(`references/ROUTING.md`).
