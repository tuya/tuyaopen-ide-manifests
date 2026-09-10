---
name: tuyaopen-embedded-device-auth
description: 'Configure device authorization credentials (UUID, AuthKey, PID) and network provisioning for TuyaOpen
  devices via `tuyaopen-cli license list/add/import/ remove` (a local CLI-only license store) and `tuyaopen-cli
  firmware authorize` (writes the code to the device over serial, P2). Use when the user mentions device auth, authorization,
  UUID, AuthKey, tuya_config.h, provisioning, pairing, or cloud connection. A late-stage skill: the code is needed
  only after the firmware builds and is about to be flashed — read its §0 before asking the user for a code. 设备授权、授权码、配网、UUID、AuthKey、云连接、tuyaopen-cli
  license、 tuyaopen-cli firmware authorize。'
license: Apache-2.0
compatibility: tuyaopen CLI, either form — see skill `tuyaopen-start` § 1 (for `tuyaopen-cli license`/`firmware
  authorize`); TuyaOpen environment activated (export.sh / export.ps1 / export.bat) — needed for the `tyutool_cli`-direct
  fallback, not for the CLI commands above; Tuya IoT Platform account (platform.tuya.com) for credentials
metadata:
  version: 1.9.1
  owner: embedded-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
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

### 真到了该问的那一步：**不要只问「你有授权码吗」**

<code data-type="tag" style="color:#faad14">"有吗？" 是一个把球踢回去的问题</code>

编译过了、该写码了，这时问一句「你有授权码吗」，对一个**第一次做涂鸦设备的人**
等于什么都没说 —— 他不知道这东西从哪来、要不要钱、要多久，于是这句话变成一次
毫无进展的往返，甚至直接卡死在这里。

所以到这一步的正确动作是**先自己查，再把路一次说完**：

1. 先跑这两条，看本机到底有没有：

   ```bash
   tuyaopen-cli diag doctor --json      # deviceAuth.localLicenses
   tuyaopen-cli license list --json     # 本地存了哪些（AuthKey 默认打码）
   ```

2. 查到有 → 直接进下面《授权码的两条硬规则》，问的是"这个码现在空不空闲"，
   不是"你有没有"。
3. 查到 `localLicenses: 0` → **在同一条消息里**把下面《没有授权码怎么办》那张表
   的**两条路原样摆给用户**（每条是什么、什么时候用它），再问他走哪条。
   不要只丢一句"你需要一个授权码"就停住，也不要只报其中一条 —— 用户手里有没有
   同事给的 xlsx，你并不知道，摆全了他自己一眼就能挑。

**两条路都以"用户交给你一份文件或一对码"结束。** 没有第三条：任何"我去帮你
申领一下"的想法都是错的，对应的 CLI 命令不存在。两个官方入口是：
免费额度见 <https://tuyaopen.ai/zh/pricing-guide>，超出额度购买见
<https://platform.tuya.com/purchase/index?type=6>。先让用户选入口、完成申领/购买，
再把 xlsx 或一对码交给你。

**衡量标准**：用户读完你这条消息，应该已经知道"我下一步点哪里"，
而不是还要反问一句"那怎么弄一个"。

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

`localLicenses: 0` 时，**授权码只能由用户提供 —— 没有任何命令能替他申领。**

`license` 组只有 `list` / `add` / `import` / `remove`，四条全是本地库操作。
**这不是"我们还没做"，是这条路不存在**：不要去找、不要去猜、更不要去调
`tuya-devplat-cli` 里某个看起来像申领的命令。你的工作到"把两条路说清楚"为止，
拿码这一步由人完成。

两条路，都是用户去拿、你来接收：

| 路径 | 用户做什么 | 你做什么 | 什么时候用 |
|---|---|---|---|
| **官方免费额度（2 个）** | 打开 <https://tuyaopen.ai/zh/pricing-guide>，按官方指引登录平台并在产品页申领，导出 Excel | 拿到文件后 `tuyaopen-cli license import --xlsx <path>` | 手上还没有码，且只需开发量 |
| **官方购买** | 打开 <https://platform.tuya.com/purchase/index?type=6>，购买后导出 Excel | 同上 | 需要超过免费额度或生产数量 |
| **已有的 xlsx** | 把同事/上一批的 xlsx 给你 | 同上 | 团队里已经有一批码 |

只有一对码、没有文件时，走 stdin，别让它上命令行：

```bash
echo <authkey> | tuyaopen-cli license add --uuid <uuid> --yes
```

拿到之后：

```bash
tuyaopen-cli license add --uuid <uuid>          # AuthKey 走 TUYA_LICENSE_AUTHKEY 或 stdin，绝不上 argv
tuyaopen-cli firmware authorize --port <port> --yes   # 不传 uuid/authkey：从本地库取那一对
tuyaopen-cli firmware auth-status --port <port> # 读回来核对
```

**`authorize` 不传 `--uuid` / `--authkey` 是首选写法。** 0.1.0-beta.16 起它会从
`license add` / `license import` 存下的本地库解析：**库里恰好一条就用它；多条则拒绝并
列出 UUID 让你指定**（授权码同一时刻只能用于一个设备，烧哪一个不该由工具替你猜）。
这样 AuthKey 不出现在你的命令行里，也不出现在对话里。

要指定就只传 `--uuid`，让 AuthKey 仍从库里配对取：**两半永远同源**，
不会出现「你的 UUID + 库里的 key」这种烧进去必然激活失败的组合。

> **别把授权码贴进对话。** 拿到 xlsx 就用 `license import --xlsx`；只有一对就用
> `echo <authkey> | tuyaopen-cli license add --uuid <uuid> --yes`。argv 是全机可读的
> （`ps` / `/proc/<pid>/cmdline` / Process Explorer），而聊天记录会被转发和归档。

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
| Write a UUID+AuthKey code to the device over serial | `tuyaopen-cli firmware authorize --port <port>` — **P2**, needs `--yes`. Omit the credential flags and the pair comes from the local store (one saved → used; several → refused, listing UUIDs). `--uuid` alone also works; `--authkey` alone is refused, because the two halves must share a source |

**⚠ `license remove` and `firmware authorize` are gated differently — don't
carry one's ritual over to the other.** `license remove` is **P0**: never
try to construct the `--confirm` token yourself, it is a derived SHA-256 hash
of the exact group + command + flags, computed by the CLI's own `--dry-run`
branch and compared byte-for-byte — a token minted for one UUID does not
confirm a different one, and there is no shortcut around running `--dry-run`
first and copying the value it hands back. `firmware authorize` dropped from
P0 to **P2** on 2026-08-18 (the KV it writes is rewritable and `firmware
auth-status` reads it back, so it fails the P0 criterion) — it takes `--yes`
instead, and its `--dry-run` does not hand back
a confirm token at all. Full mechanics: skill `tuyaopen-start` § 4.

> **No CLI?** `firmware authorize` → `tyutool_cli authorize` directly (see
> § *Serial port discovery* below). `license *` has no older-tool
> equivalent — it's a new, CLI-only local store; there is nothing to fall
> back to for it. See skill `tuyaopen-start` § 7.

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
--command <cmd>` — don't hardcode the flag list here (skill `tuyaopen-start`
§ 5).

**Serial port discovery still needs the SDK's own tool, not the `tuyaopen-cli`
CLI** — `tuyaopen-cli firmware list-ports` (the `tuyaopen-start` routing table) doesn't expose
the `usbSerial`/`usbInterface` grouping a dual-serial board needs to
disambiguate flash vs. auth vs. log ports. See § *Serial port discovery*
below, which uses `tyutool_cli list-ports --json` directly.

## Authorization Overview

TuyaOpen devices need three credentials to connect to the Tuya cloud:
> Detailed authorization background, credential configuration, serial/network provisioning, IDE ledger, and strategy live in [references/AUTHORIZATION_DETAILS.md](references/AUTHORIZATION_DETAILS.md). Read it after applying §0 and the hard rules.

authorization, and network-provisioning protocol details beyond writing the
credential — not in scope here, see skill `tuyaopen-start`'s routing table
(`references/ROUTING.md`).
