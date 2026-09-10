---
name: tuyaopen-miniapp
description: 'Operate the panel miniapp''s build/runtime/upload lifecycle through the tuyaopen CLI''s `miniapp`
  command group: build, install the shared runtime, set/read metadata (appid), sync the DP schema from the bound
  product, preview (dev server / screenshot), scaffold from a template, and upload a version to the Tuya platform
  — plus the platform-side `panel` and `miniapp` commands reached through `tuyaopen-cli devplat exec` (create the
  miniapp, next version number, set UI info, submit for review, review status, release, query private ui-list, and
  bind). This is the command-line surface only — panel architecture, DP hooks, and category UI conventions are a
  different skill. Use when the user wants to run `tuyaopen-cli miniapp ...`, build/upload the miniapp, create it
  from a template, sync its DP schema, or publish/bind a version. MiniApp

  命令行操作：构建、安装运行时、设置/读取元数据（appid）、从已绑定产品 同步 DP schema、预览（开发服务器/截图）、从模板创建、上传版本到涂鸦平台， 以及经 `devplat exec` 转发的平台侧 `panel`
  与 `miniapp` 命令（建小程序、算版本号、设置提审属性、提审、查审核状态、发布、查私有面板列表与绑定产品）。 仅覆盖命令行操作...'
license: Apache-2.0
compatibility: tuyaopen CLI, either form — see skill `tuyaopen-start` § 1; install/upload/preview/template create
  carry their own vendor/miniapp-runtime since 0.1.0-beta.14; --extension-path (or TUYAOPEN_EXTENSION_PATH) only
  overrides it; A TuyaOpen project with a source/miniapp directory
metadata:
  version: 2.5.1
  owner: miniapp-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
---
# TuyaOpen MiniApp CLI

Covers the `miniapp` CLI group's 7 subcommands — `build`, `install`, `meta`,
`preview`, `sync-schema`, `template`, `upload` — and the platform-side `panel`
commands reached through `tuyaopen-cli devplat exec` (§ *平台侧*).
**Not in scope**: panel
architecture, DP hook conventions, category templates (lamp/socket/robot-
vacuum/ipc/...), or upload-content review — that is a separate, closely
related skill focused on *how to build the panel*, where this one is about
*running the CLI commands*. See `related` in this skill's catalogue entry.

For the CLI's envelope, exit codes, and P0/P2 risk-gate mechanics, see
skill `tuyaopen-start` — not repeated here.

## Runtime: 默认自带，不用再找 `--extension-path`

`install` / `upload` / `preview` / `template create` 都需要 `vendor/miniapp-runtime/`
才能做真正的活。**从 `0.1.0-beta.14` 起，npm 包自己带着它**（与 `.vsix` 同一份字节），
CLI 默认从自己的安装目录去找，独立形态与 IDE 内一样能跑。

    tuyaopen-cli miniapp install --yes      # 首次约 30s，之后走缓存

`--extension-path`（或 `TUYAOPEN_EXTENSION_PATH`）仍然有效且优先级最高，用途只剩一个：
指向**另一份**扩展安装。IDE 会自动注入。

### 真缺 payload 时

判据跑一句就有：

```bash
tuyaopen-cli miniapp install --dry-run --json   # 看 data.runtimeVendorPresent
```

`false` 时命令会以 `config` / `runtime_vendor_missing` 失败，并**打印它查过的绝对路径**。
两条出路：

1. 升级 CLI —— `npm i -g @tuya/tuyaopen-cli --registry https://registry-npm.tuya-inc.top/`；
2. 借一份装好的扩展目录（beta.14 之前唯一的办法，现在只是退路）：

```bash
# Windows
dir /s /b "%USERPROFILE%\.vscode\extensions\*tuyaopen*"  "%USERPROFILE%\.cursor\extensions\*tuyaopen*"
# macOS / Linux
find ~/.vscode/extensions ~/.cursor/extensions ~/.trae/extensions \
     -maxdepth 1 -iname '*tuyaopen*' 2>/dev/null
```

挑一个**里面有 `vendor/miniapp-runtime/` 的**当 `--extension-path`。**多记一个备用路径**
—— 内测第五轮里借用的那个目录**在会话中途消失了**（疑似扩展自动更新/清理）。

一个都找不到时，`preview` 这一步的降级方案见
the `tuyaopen-start` routing table 的 ⑧（真机扫码看，或去真 IDE 里跑）。

## Shortcuts — `tuyaopen-cli miniapp`

| Intent | Command |
|---|---|
| Build the miniapp (wraps `miniapp.runBuild` via the local npm runtime) | `tuyaopen-cli miniapp build` |
| Ensure the MiniApp runtime is installed in the shared TuyaOpenIDE cache | `tuyaopen-cli miniapp install` (P2) |
| Write the miniapp's appid into project metadata | `tuyaopen-cli miniapp meta set-appid <appid>` (mutating, but P3 — not gated) |
| Read the local DP cache and regenerate `source/miniapp/src/devices/schema.ts` | `tuyaopen-cli miniapp sync-schema` (P2) |
| Start the dev server and hand the user a URL to open in a browser | `tuyaopen-cli miniapp preview` — see § 0.1, this is how a built panel becomes something anyone can look at. Prefer `--emit-url`; hand the printed URL to the user before upload/review |
| Browse / apply the template gallery | `tuyaopen-cli miniapp template list` · `template create` (P2) |
| Build, sign, and upload to the Tuya platform | `tuyaopen-cli miniapp upload` (P2) |
| List the account's existing miniapps, or create one on the platform | `tuyaopen-cli devplat exec` (P2) — forwards `miniapp list` / `panel create-miniapp`, see § *平台侧* |
| Next version · UI info set · submit review · review status · release | `tuyaopen-cli devplat exec` (P2) — forwards `panel miniapp-next-version` / `miniapp ui-info-set` / `miniapp submit-review` / `panel miniapp-version-status` / `panel miniapp-release` |
| List private panels · bind panel to product PID | `tuyaopen-cli devplat exec` (P2) — forwards `panel ui-list --code PRIVATE` / `panel bind` |

Flags aren't listed here — run `tuyaopen-cli schema get --group miniapp --command
<c>` for the current set. Resolve `tuyaopen-cli` first per skill `tuyaopen-start`
§ 1 (it is usually not on `PATH`).

Example invocations:

```bash
tuyaopen-cli miniapp build --project-root <dir>
tuyaopen-cli miniapp install --yes
tuyaopen-cli miniapp meta set-appid <appid>
tuyaopen-cli miniapp sync-schema --pid <pid>          # default: read pid from tuyaopen.project.ini
tuyaopen-cli miniapp preview --screenshot preview.png --width 375 --height 812
tuyaopen-cli miniapp template list --json
tuyaopen-cli miniapp template create --id <template-id> --dry-run
tuyaopen-cli miniapp upload --version 1.0.0 --description "..." --yes
```

## The order these commands go in is **not** here

Seven commands, and running them in the wrong order is the most common way a
panel build goes wrong — but sequence is a workflow question, not a command
question. **Skill the matching routed skill owns the whole panel
lifecycle**: creating the miniapp and getting an appid, when to hand the user a
render URL, when to upload, when to release, and the two steps that only a human
can do (submit for review, bind to the product) with the URLs to construct.

Everything below is the other half: what each command does, what it requires
before it will run, and how it is gated. Those hold no matter which order you
arrive in — which is exactly why they stay here and the sequence does not.

## Per-command reference

### `appid` / `projectId` — read them from the workflow skill

`tuyaopen-cli miniapp meta set-appid <appid>` **records** an appid; it never mints
one, and no command in this group takes a `projectId`. Both values exist to
build the platform URLs for the web-only steps, which is a workflow concern —
the `tuyaopen-start` routing table § *两个参数分别是什么、从哪读* is the
single authority for where they are read from, the `encodeURIComponent`
requirement, and the trap that **`projectId` holds the product PID, not a
MiniApp id**.

### `sync-schema` needs a bound product

`sync-schema` reads `.tuyaopen/platform/product-<pid>.json` — a snapshot
written by the IDE (or by binding a product) — not the Tuya platform
directly. If no `--pid` is given it reads `[product] pid` from
`tuyaopen.project.ini`; with neither, it fails `config:no_pid_bound` with the
hint to bind one first (project-binding is a different command — see this
skill's `related` entry).

### `template create` — P2, manually gated the same way as everywhere else

`template create` isn't dispatched through the framework's automatic P2 gate
(because `template list` must stay ungated and both share one command), but
it enforces the identical envelope by hand: `--dry-run` to preview, or
`--yes` to apply. Treat it exactly like any
other P2 command from skill `tuyaopen-start` § 4.

### `upload` — P2, and the heaviest command in this group

Runs the full ray build → minipack → sign → COS upload → version-register
pipeline. `--dry-run` first is worth it here more than most P2 commands,
given how long the real run takes.

A successful `upload` registers a **version**, it does not release it and it
does not attach it to a product. The complete release and bind pipeline is fully
supported through `tuyaopen-cli devplat exec` (§ *平台侧*):
1. `miniapp ui-info-set` (sets the 4 required review-facing UI properties)
2. `miniapp submit-review --miniapp-id <appid> --version-id <versionId>` (submits for platform review)
3. `panel miniapp-version-status` (polls review status until 2; review usually takes about 2 minutes — do not release while it is still 1)
4. `panel miniapp-release` (releases the approved version)
5. `panel ui-list --product-id <PID> --code PRIVATE` + `panel bind --ui-id <uiId> --product-id <PID>` (binds panel to product)
The structured URLs in `data.webSteps` provide direct web fallbacks if any step encounters missing permissions or legacy CLI environments.
Report `upload` as "uploaded for internal testing", never as "published" and
never as "live on the device".

`--version` wants the value `panel miniapp-next-version` returns as
`nextVersion`; that command is read-only and takes only the appid.

## 平台侧：经 `devplat exec` 转发的 `panel` 与 `miniapp` 命令

`tuyaopen-cli` 自己的 `miniapp` 组只有那七条。建小程序、算版本号、属性设置、提审、查审核状态、
发布上线与绑定产品属于**平台**，在 vendored `tuya-devplat-cli` 里，经 `devplat exec` 转发。
**顺序不在本节** —— 哪一步先跑、哪一步交给用户，见 skill
the matching routed skill。这里只讲每条命令要什么、给什么、怎么失败。

### wrapper 形状 —— 两个开关都不能省

```bash
tuyaopen-cli devplat exec --yes -- <devplat 参数…> --format json
```

- **`--yes` 必须有。** `devplat exec` 是 P2，而且对只读调用也是 P2：一个透传
  无法知道自己要跑什么（`panel bind` 和 `panel --help` 从同一个 argv 进来），
  按被包住的那一面能做到的最坏情况来门禁是唯一诚实的选择。少了它是
  `confirmation` / `needs_yes`。
- **`--format json` 必须有**，而且它是给 devplat 的参数，写在 `--` 后面。
  少了它 devplat 打人类可读文本，wrapper 解析不了，返回
  `validation` / `bad_flag`，`code` 是 `devplat-non-json`。
  同理：**探索用 `schema list --format json`，不要用 `--help`**，`--help` 永远不出 JSON。
- **devplat 的参数一律写在 `--` 之后**，不要和 `tuyaopen-cli` 自己的 flag 混在一起。

### 能用的命令

| 命令（`--` 之后） | 入参 | `data` 出参 |
|---|---|---|
| `miniapp list` | 无 | 账号里已有的小程序（`miniProgramId` / `miniProgramName` …） |
| `panel create-miniapp --product-id <PID>` | 产品 PID | `{ miniProgramId, miniappName? }` —— **`miniProgramId` 就是 appid**，拿去 `tuyaopen-cli miniapp meta set-appid` |
| `panel miniapp-next-version --miniapp-id <appid>` | appid | `{ nextVersion, currentMax }`。只读。跨 dev/review/online 取最大再 +1；`currentMax` 为空时 `nextVersion` 是 `1.0.0`。`nextVersion` 正是 `miniapp upload --version` 要的那个值 |
| `miniapp ui-info-set --miniapp-id <appid> --type <type> --value <val>` | appid + 类型 + 值 | `{ miniProgramId, type, value }`。`type` 支持 `iotUiName`、`iotUiEnName`、`iotUiPreviewPicture`、`iotUiEnPreviewPicture` |
| `miniapp submit-review --miniapp-id <appid> --version-id <vid>` | appid + 版本 ID | `{ miniProgramId, versionId, submitted }`。执行 audit check 预检并提交审核。`versionId` 来自 `upload` 返回 |
| `panel miniapp-version-status --miniapp-id <appid> --version-code <x.y.z>` | appid + 版本号 | `{ versionId, versionCode, reviewStatus, grayState, versionType }`。只读 |
| `panel miniapp-release --miniapp-id <appid> --version-code <x.y.z>` | appid + 版本号 | `{ published, versionId, versionCode, message? }`。**前置：这个版本的 `reviewStatus` 必须是 2**。全量 100%，不是灰度 |
| `panel ui-list --product-id <PID> --code PRIVATE` | PID + `PRIVATE` | 属于该 PID 的私有面板列表（提取其中的 `uiId`，**注意 `--ui-id` 是 Panel UI ID，绝非 appid**） |
| `panel bind --ui-id <uiId> --product-id <PID>` | uiId + PID | `{ bindSuccess, ... }`。将已发布的面板绑定到目标产品 |

### 两张码表 —— 别按名字猜

`reviewStatus`（`miniapp-version-status` / `miniapp-release` 共用）：

| 值 | 含义 |
|---|---|
| 1 | 审核中 |
| 2 | 审核通过 —— **只有这个值 `miniapp-release` 才肯发** |
| 3 | 审核不通过 |

`versionType`（`miniapp-version-status` 返回，说明这条记录是在哪一档里找到的）：

| 值 | 含义 |
|---|---|
| 1 | 开发版 |
| 2 | 审核版 |
| 3 | 线上版 |

### 失败形态

| 返回 | 什么意思 | 怎么办 |
|---|---|---|
| `VERSION_NOT_FOUND` | 这个 appid 下三档里都没有这个 `--version-code` | 版本号写错了，或 `upload` 还没成功。用 `panel miniapp-next-version` 对一下号 |
| `REVIEW_STATUS_NOT_APPROVED` | `miniapp-release` 的前置没满足 —— `reviewStatus` 不是 2。`details` 里带着当前值 | 审核还没过就等，被打回就修完重新走一遍。**不要重试**，重试不会改变审核状态 |
| `ok:true` 但 `published:false`，`message` 说 `already published` | 这个版本已经在线上了 | 这是成功，不是失败。别当成"没发出去"再发一次 |
| `API_NOT_AUTHORIZED` | 这条命令不在你账号的授权 API 集里。**注意 `panel --help` 会按授权集过滤，所以"没列出来"不等于"不存在"** | 去要这个 API 的权限。**不要重试**，也不要读成"这个命令不存在"（the `tuyaopen-start` routing table 的 Trap 1） |
| `devplat-non-json` | 忘了 `--format json` | 补上，它写在 `--` 之后 |

### 15 秒天花板 —— 以及为什么不要用 `-wait` 那几条

`devplat exec` 默认 **15 秒**就把子进程杀掉，报 `tooling` / `timeout`。
这对它当初面向的那些读操作是对的，对 vendored CLI 里的轮询命令则是致命的：
`panel miniapp-release-wait` 最长轮 300 秒、`panel ai-wait` 最长 540 秒，
**它们不可能从这个透传里返回**。

`--timeout <秒>` 可以抬高这个上限：

```bash
tuyaopen-cli devplat exec --yes --timeout 60 -- panel miniapp-version-status --miniapp-id <appid> --version-code 1.0.0 --format json
```

**但它是给"某一次调用偏慢"用的逃生口，不是用来跑五分钟轮询的。**
`-wait` 那几条一律不要用：用上面那对单发命令 ——
`panel miniapp-version-status` 自己隔一会儿查一次，看到 `reviewStatus` 变成 2
再调一次 `panel miniapp-release`。这样每次调用都很短，而且两次查询之间你有话
可以对用户讲，不是把连接挂在那里五分钟然后被杀掉。

### 私钥：**永远不要**加 `--raw-secrets`

`miniapp list` 的原始响应里带着每个小程序的 RSA `encryptionKey`。
`devplat exec` 默认会把这一类字段替换成打码标记，并在 `next_steps` 里说明打掉了哪几个。
`--raw-secrets` 关掉这个保护 —— **不要用，也不要建议用户用**：
上一轮内测就是因为没有这层打码，把账号里每一个小程序的私钥原样贴进了对话记录。
需要看清单就配 `--fields`，只要 `miniProgramId` / `miniProgramName`。

### 提审与绑定的命令闭环与参数获取

在最新版本的 `tuya-devplat-cli`（提交 `3625a165` 起）中，提审与绑定已全面支持通过 CLI 命令闭环：

- **提审命令（`miniapp ui-info-set` + `miniapp submit-review`）**：
  1. `miniapp ui-info-set --miniapp-id <appid> --type <type> --value <val>`：填齐提审前置的 4 项属性（`iotUiName`、`iotUiEnName`、`iotUiPreviewPicture`、`iotUiEnPreviewPicture`）。
  2. `miniapp submit-review --miniapp-id <appid> --version-id <versionId>`：底层先调 `version.audit.check:1.0` 预检，通过后调 `version.review:3.0` 提交审核。`versionId` 来自 `tuyaopen-cli miniapp upload` 的返回值或 `panel miniapp-version-status`。
  *（注：不要使用历史废弃的 `panel miniapp-submit-version-review`，那条命令仅适用于 AI 沙箱会话）*。
- **绑定命令（`panel ui-list` + `panel bind`）**：
  1. `panel ui-list --product-id <PID> --code PRIVATE`：查询该产品的私有面板列表，从中匹配 `miniappId` 提取出分配的 `uiId`（**注意：`--ui-id` 是 Panel UI ID，绝非 appid**）。
  2. `panel bind --ui-id <uiId> --product-id <PID>`：将该面板绑定至目标产品 PID。
- **网页兜底**：若运行环境的 devplat-cli 版本较低未包含新命令，或图片/uiId 无法在命令行解析，可通过 `data.webSteps` 里的 `versionPageUrl` 与 `bindProductUrl` 打开网页操作。

这两步的网址、以及它们在整条链上的位置，在 the `tuyaopen-start` routing table。

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `config:runtime_vendor_missing` on `install`/`upload`/`preview`/`template create` | 这份 CLI 安装缺 `vendor/miniapp-runtime/`（beta.14 之前的包都不带）。错误里会打印它查过的路径 | 升级到 `@beta`，或 `--extension-path <一份装好的扩展目录>` |
| `config:no_appid` on `upload` | 项目里没有 appid，或有的那个不属于当前账号 | 信封的 `data.candidates` 就是候选清单（`appId`+`name`）。挑一个 `miniapp meta set-appid <appid>`；要新建就 `panel create-miniapp --product-id <PID>`（见 § *平台侧*），实在不行才开 `https://platform.tuya.com/miniapp/`。`candidates: null` 表示**没查到**（多半是没登录），不是「账号里没有」 |
| `config:bad_ini` on `build`/`preview`/`upload` | `project.tuya.json` 掉了后续步骤要用的东西（多半是被手工覆写过）。`data.problems` 逐条给出键名和**症状** | 按 `media/miniapp-template/project.tuya.json` 补回来。除 `miniapp meta set-appid` 外不要手改这个文件 |
| `config:runtime_vendor_missing` on `preview` | 这份 CLI 安装缺 `media/miniapp-shims/`。以前是**静默**的：服务照起、报成功、发白屏 | 重装 CLI，或 `--extension-path` 指向装好的扩展 |
| `config:project_not_open` on `build`/`meta`/`sync-schema`/`preview` | No `source/miniapp` directory under the project root | Run inside a TuyaOpen project that has a miniapp, or pass `--project-root` |
| `sync-schema` fails `config:no_pid_bound` | No product bound and no `--pid` given | Bind a product first, or pass `--pid <pid>` explicitly |
| `sync-schema` fails `config:no_product_cache` | Product bound, but no local DP snapshot cached yet | Refresh/bind the product from the TuyaOpen IDE, then retry |
| `template create` rejected as `confirmation:needs_yes` | P2 gate — missing `--yes` | Add it, or use `--dry-run` to preview first |
| `template create` fails `config:manifest_item_missing` (unknown template id) | Wrong or stale `--id` | Run `tuyaopen-cli miniapp template list` for current ids |
| `upload` succeeded but end users still don't see the miniapp | Expected — `upload` registers a version for internal testing only | Submit for review (CLI: `miniapp submit-review`, or web `versionPageUrl`), release (`panel miniapp-release`), then bind to product (CLI: `panel ui-list --code PRIVATE` + `panel bind`, or web `bindProductUrl`) |
| `panel miniapp-release` returns `REVIEW_STATUS_NOT_APPROVED` | The version's `reviewStatus` is not 2 — `details.reviewStatus` carries the current value | 1 = still under review (wait and re-query), 3 = rejected (fix, upload a new version, submit again). Retrying `miniapp-release` cannot change it |
| `panel miniapp-version-status` returns `VERSION_NOT_FOUND` | No version with that `--version-code` exists under this appid, in any of the three types | Check the number against `panel miniapp-next-version`, and that `miniapp upload` actually succeeded |
| A `panel *-wait` / `ai-wait` command dies at 15 s as `tooling:timeout` | `devplat exec` kills the child after 15 s by default; those commands poll for 300–540 s | Either pass an explicit outer timeout (for example `devplat exec --timeout 300 -- panel miniapp-release-wait ...`), or poll `panel miniapp-version-status` yourself. Never rely on the inner command's timeout without raising the outer one |
| Miniapp is published, review passed, but the panel still doesn't appear on the device | Publishing ≠ binding — the published MiniApp is not attached to the product yet | Query uiId with `panel ui-list --product-id <pid> --code PRIVATE` and run `panel bind --ui-id <uiId> --product-id <pid>`; or bind in browser via `bindProductUrl` |
| `panel bind` succeeded, but `panel ui-list` shows `isSelected: false` | Expected shape mismatch — `ui-list.isSelected` is not the product's current-panel source of truth | Verify with `product ui-property --product-id <pid>`; its `uiId` must equal the bound Panel UI ID |
| `upload` fails `config:no_pid_bound` — *"No product PID (projectId) in project.tuya.json"* | The product PID is missing from the miniapp descriptor. `project bind-product` syncs `project.tuya.json.projectId` when `source/miniapp` exists | Run `tuyaopen-cli project bind-product --pid <PID> --yes`, then retry upload. To create the appid first, use `panel create-miniapp --product-id <PID>` and `miniapp meta set-appid <appid>` |
