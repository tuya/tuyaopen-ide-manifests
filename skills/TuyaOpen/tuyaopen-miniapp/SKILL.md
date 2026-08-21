---
name: tuyaopen-miniapp
description: >-
  Operate the panel miniapp's build/runtime/upload lifecycle through the
  tuyaopen CLI's `miniapp` command group: build, install the shared runtime,
  set/read metadata (appid), sync the DP schema from the bound product,
  preview (dev server / screenshot), scaffold from a template, and upload a
  version to the Tuya platform. This is the command-line surface only — panel
  architecture, DP hooks, and category UI conventions are a different skill.
  Use when the user wants to run `tuyaopen miniapp ...`, build/upload the
  miniapp, create it from a template, or sync its DP schema.
  MiniApp 命令行操作：构建、安装运行时、设置/读取元数据（appid）、从已绑定产品
  同步 DP schema、预览（开发服务器/截图）、从模板创建、上传版本到涂鸦平台。
  仅覆盖命令行操作本身，不涉及面板架构或品类 UI 编码规范。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1
  - "--extension-path (or TUYAOPEN_EXTENSION_PATH) for install/upload/preview/template create's real runtime work — IDE-injected automatically inside the IDE's terminal"
  - A TuyaOpen project with a source/miniapp directory
---

# TuyaOpen MiniApp CLI

Covers the `miniapp` CLI group's 7 subcommands: `build`, `install`, `meta`,
`preview`, `sync-schema`, `template`, `upload`. **Not in scope**: panel
architecture, DP hook conventions, category templates (lamp/socket/robot-
vacuum/ipc/...), or upload-content review — that is a separate, closely
related skill focused on *how to build the panel*, where this one is about
*running the CLI commands*. See `related` in this skill's catalogue entry.

For the CLI's envelope, exit codes, and P0/P2 risk-gate mechanics, see
skill `tuyaopen-shared` — not repeated here.

## Runtime prerequisite: `--extension-path`

`install`, `upload`, `preview`, and `template create` all need the VSIX's
bundled `vendor/miniapp-runtime/` to do real work. Inside the IDE's own
terminal this is injected automatically; running the standalone CLI outside
the IDE, pass `--extension-path <path>` explicitly or set
`TUYAOPEN_EXTENSION_PATH`. Without it, these commands fail with a clear
`config:project_not_open` hint rather than doing partial work.

## Shortcuts — `tuyaopen miniapp`

| Intent | Command |
|---|---|
| Build the miniapp (wraps `miniapp.runBuild` via the local npm runtime) | `tuyaopen miniapp build` |
| Ensure the MiniApp runtime is installed in the shared TuyaOpenIDE cache | `tuyaopen miniapp install` (P2) |
| Write the miniapp's appid into project metadata | `tuyaopen miniapp meta set-appid <appid>` (mutating, but P3 — not gated) |
| Read the local DP cache and regenerate `source/miniapp/src/devices/schema.ts` | `tuyaopen miniapp sync-schema` (P2) |
| Start the dev server and hand the user a URL to open in a browser | `tuyaopen miniapp preview` — see § 0.1, this is how a built panel becomes something anyone can look at |
| Browse / apply the template gallery | `tuyaopen miniapp template list` · `template create` (P2) |
| Build, sign, and upload to the Tuya platform | `tuyaopen miniapp upload` (P2) |

Flags aren't listed here — run `tuyaopen schema get --group miniapp --command
<c>` for the current set. Resolve `tuyaopen` first per skill `tuyaopen-shared`
§ 1 (it is usually not on `PATH`).

Example invocations:

```bash
tuyaopen miniapp build --project-root <dir>
tuyaopen miniapp install --extension-path <ext-path>
tuyaopen miniapp meta set-appid <appid>
tuyaopen miniapp sync-schema --pid <pid>          # default: read pid from tuyaopen.project.ini
tuyaopen miniapp preview --screenshot preview.png --width 375 --height 812
tuyaopen miniapp template list --json
tuyaopen miniapp template create --id <template-id> --dry-run
tuyaopen miniapp upload --version 1.0.0 --description "..." --extension-path <ext-path>
```

## §0 完整顺序 —— 七条命令都在这条链上，不是只有 build

<code data-type="tag" style="color:#faad14">内测第二轮：这一组只用到了 2/7 条命令，面板从没被人看见过</code>

第二轮 agent 只调了 `template create`（连试 5 次失败）和 `build`（连试 3 次失败）。
它**从没调过 `template list`** —— 而 `--id` 的合法取值只能从那里来，第 5 次失败和第 1 次
是同一个原因。这不是缺命令，是**没按顺序走**。所以顺序写在这里，写在最前面：

```
本地（tuyaopen miniapp）                          平台（tuya-devplat-cli / 网页）
──────────────────────────────────────────────   ─────────────────────────────────
① template list   ← 先看有哪些模板，别猜 --id
② template create --id X            (P2)
③ install         ← 装共享运行时     (P2)
                                                  ⓐ product create → 拿 PID
④ project bind-product --pid <pid>  ← 本地记下 PID（不是 miniapp 命令，但 ⑥ 依赖它）
                                                  ⓑ panel create-miniapp → 拿 appid
⑤ meta set-appid <appid>            ← 只是「记下」，它不会创建 appid
⑥ sync-schema     ← 从已绑产品拉 DP 生成 devices/schema.ts
⑦ build           ← 出 dist/
⑧ preview --emit-url  ← ★ 变成用户能打开的链接 ★
⑨ upload          ← P2，要 appid
                                                  ⓒ panel miniapp-submit-version-review → 提审
                                                  ⓓ panel miniapp-release → 上线
                                                  ⓔ panel bind --ui-id … --product-id … → 面板绑产品
```

**前置关系，不满足就不要硬跑**（命令会自己告诉你，但白跑一次是白跑）：
`⑥` 要 ④ 先做（`sync-schema` 会说没有 pid）；`⑨` 要 ⑤ 先做（`upload` 会说没有 appid）；
`⑤` 要 ⓑ 先做（appid 只能由平台签发）。

**ⓐ–ⓔ 那一列不是「只能上网页」** —— 每一步都有 `tuya-devplat-cli` 命令，只是可能被授权集拦住。
完整链路、两个「绑定」的区别、以及三条硬性注意事项都在 **§0.2**，动手前先读它。

## §0.1 做完要给用户一个能打开的渲染链接

<code data-type="tag" style="color:#ff4d4f">第二轮的直接反馈：面板"编译成功"了，用户一次都没看见它长什么样</code>

`build` 产出的是一个 `dist/`，**没有人能看**。把它变成能看的东西是 `preview`：

```bash
tuyaopen miniapp preview --emit-url
```

它会在 dev server 就绪的那一刻，往 **stdout** 打一行

```json
{"event":"preview_url","url":"http://127.0.0.1:<port>/#/pages/…"}
```

然后**阻塞住**（server 得活着，链接才有效）。所以：

1. **拿到那行就立刻把 URL 交给用户**，让他在浏览器里打开 —— 别等命令结束，它不会结束。
2. 人类可读的提示走 stderr，别去解析它；`--emit-url` 那一行才是机器通道。
3. 想**自己**确认渲染对不对，用 `preview --screenshot <path>`：它截一张 PNG 然后**退出**，
   信封里同时带 `url` 和 `screenshot` 路径。这条是给你看的，`--emit-url` 那条是给用户的。
4. 结束预览就 Ctrl+C（或杀掉进程）。用户还要看的时候别提前关掉。

> **别只报告"编译成功"。** 一个用户看不见的面板，对他等于没做。`miniapp build` 成功时的
> 信封里已经带了 `nextStep`，直接照它做。

**预览里看到的设备是模拟的**：它注入一个 mock bridge，DP 来自已绑定产品（有 pid 时）或
模板自己的 `src/devices/schema.ts`。stderr 上会写清这次用的是哪一种、几个 DP ——
**如果只有 1 个 DP，DP 驱动的 UI 就不会渲染**，那不是渲染 bug，是该先 `bind-product` +
`sync-schema`（顺序表里的 ⑤）。

## §0.2 创建 → 绑定 PID 的完整链路 —— 有三层，别只看第一层

<code data-type="tag" style="color:#ff4d4f">这一节此前是错的，而且它主动叫 agent 不要去找</code>

原文写的是「**四**个步骤没有任何 CLI 命令，只能在浏览器里做」，还明确说
「**不要**臆造 `tuyaopen miniapp create` / `submit` / `review` / `publish` / `bind`，
因为它们不存在（`tuyaopen schema list --json` 是权威）」。

前半句的**理由**是对的、结论是错的：`tuyaopen schema list` 确实是 **`tuyaopen`** CLI 的权威，
而 `tuyaopen` 确实没有这些命令。但它**不是另一个 CLI 的权威** ——
`tuya-devplat-cli` 的 `panel` 组里有一整套（实测 2026-08-21，读的是随插件分发的那份源码）：

```
panel create-miniapp                    ← 建小程序、拿 miniProgramId(appid)
panel miniapp-next-version              ← 算下一个版本号（跨 dev/review/online 取最大再 +1）
panel miniapp-submit-version-review     ← 生成版本并提交审核，轮询到 status=9
panel miniapp-task-poll                 ← 上一步 5 分钟超时后接着轮
panel miniapp-version-status            ← 查 reviewStatus / grayState / versionType
panel miniapp-release / -release-wait    ← 审核通过后发布上线（灰度 100%）
panel bind --ui-id <uiId> --product-id <pid>   ← 把面板绑到产品
panel save-standard-relation             ← 绑完登记进沙箱产物列表
product release-ui                       ← 公版面板可选
```

**所以完整链路是三层，从上往下试：**

| 层 | 谁做 | 覆盖什么 |
|---|---|---|
| ① `tuyaopen miniapp *` | 本地 | 模板、运行时、appid 记录、DP schema、构建、预览、上传包体（§0） |
| ② `tuya-devplat-cli panel *` | 平台 API | 建小程序、版本、提审、发布、**绑面板到产品** |
| ③ 网页 | 人 | ② 不可用时的兜底（下面的 URL 表） |

**②「不可用」有一个非常具体的形态，必须先读 skill `tuyaopen-cloud` 的 Trap 1**：
`panel --help` **按你的授权集过滤**，实测在未授权账号上它只列 7 条、**不列 `bind`**，
而 `bind` 是存在的。请求一条没权限的命令返回

```json
{"ok":false,"code":"API_NOT_AUTHORIZED","error":"Not authorized: 'panel bind' is not in your authorized API set. Do NOT retry…"}
```

**把它读成「去找开发者要这个 API 的权限」，绝不要读成「这个命令不存在」，也不要重试。**
第二轮完全没走到 create→bind，一半原因就是本节旧文案叫它别找。

### 两个都叫「绑定」的东西，不是一回事

这是这条链上最容易错的一步：

| | `tuyaopen project bind-product --pid <pid>` | `tuya-devplat-cli panel bind --ui-id <uiId> --product-id <pid>` |
|---|---|---|
| 改的是 | **本地**：`tuyaopen.project.ini` 的 `[product]` | **平台**：产品上挂哪个面板 |
| 谁需要它 | `miniapp sync-schema`、DP 代码生成 | 手机 App 打开这个产品时显示哪个面板 |
| 不做的后果 | 本地拿不到 DP，schema 是占位的 | App 里看不到你的面板 |

**两个都要做，顺序是先本地再平台**，而且 `panel bind` 的 `--ui-id` **不是** appid：
从 `panel create-miniapp` 的返回里读，或按 `tuyaopen-cloud` 记的反查链走。

### 三条硬性注意事项（都来自 devplat-cli 自己的文档）

1. **一个沙箱项目一辈子只能有一个 miniProgramId。** 调 `create-miniapp` 之前**永远先找现有的**。
2. **不要从 `extendInfo.miniProgramId` 或 `resourceId` 猜 miniappId** —— 老数据很杂。
   正确反查链：`sandbox/resource/query {resourceTypes:['panel']}` → `extendInfo.conversationId`
   → `panel ai-status --conversation-id <cid>` → `miniapp_id`。只有这条链查不到才 `create-miniapp`。
3. **一个产品同时只能绑一个面板**，绑新的会替换旧的（`panel bind` 自带预检，会把被替换的面板信息
   一并返回；`--force` 跳过预检）。

> **一个尚未确认的边界，别当成已知**：这些 `panel miniapp-*` 命令的文案写的是
> 「Create a new miniapp for a product (**Vision**)」并反复提到**沙箱**。它们在一个用
> `product create` 建出来的普通 TuyaOpen 产品上是否同样适用，**没有验证过**。
> 所以顺序是：先试 ②，`API_NOT_AUTHORIZED` → 要权限；报错指向沙箱/Vision → 退到 ③，
> 并把那条错误原文记进反馈。**不要因为它写着 Vision 就不试**，也不要假装它一定能用。

## ③ 兜底：网页步骤与要拼好的 URL

上面 ② 不可用时走这里。这四步在浏览器里做，**把拼好参数的 URL 交给用户**。

**construct the URL with its query parameters — never hand over a bare base
page.** The IDE builds each link at click time so one click lands on the exact
page and tab (`src/host/externalLinkHandlers.ts`); a bare base URL leaves the
user hunting for the right product, the right miniapp and the right tab.

| # | Step | devplat-cli 对应命令（先试它） | URL to open |
|---|---|---|---|
| 1 | **Create the miniapp** (mint the appid) | `panel create-miniapp` — but read 注意事项 #1/#2 first: reuse the sandbox's existing miniapp rather than minting a second one. `tuyaopen miniapp meta set-appid` only *records* an id; it never creates one | `https://platform.tuya.com/miniapp/` — the one step with no parameter, because the thing the id would name does not exist yet. Create it, then copy the id back with `tuyaopen miniapp meta set-appid <appid>` |
| 2 | **Submit for review** (提审) | `panel miniapp-next-version` → `panel miniapp-submit-version-review` (→ `panel miniapp-task-poll` if it times out). Human reviewers still decide; the CLI only submits and polls | `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>` |
| 3 | **Publish / gray release / go live** (发布・灰度・上线) | `panel miniapp-version-status` (needs `reviewStatus=2`) → `panel miniapp-release` / `-release-wait`. **Rollback has no command** — that one really is web-only | same version-management page as #2 |
| 4 | **Bind the MiniApp to the product** (绑定面板小程序) | `panel bind --ui-id <uiId> --product-id <pid>` → `panel save-standard-relation`. Often the one that answers `API_NOT_AUTHORIZED` — that means *ask for access*, not *use the web page silently* | `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` |

### The two parameters, and where to read them

Both come from `source/miniapp/project.tuya.json` (fall back to
`<project>/project.tuya.json` — the IDE tries that second candidate too), and
both must be URL-encoded, as the IDE does with `encodeURIComponent`:

| Placeholder | JSON field | What it actually holds | Empty means |
|---|---|---|---|
| `<appid>` | `appid` | The **MiniApp id**. Same value `tuyaopen miniapp meta set-appid` writes | The miniapp was never created on the platform → do step **1** first. There is nothing to review or publish yet |
| `<projectId>` | `projectId` | ⚠ The **cloud product PID** — *not* a MiniApp id, despite the field name | No product is bound to this project (or it was unbound) → bind the product first; without a PID there is no product page to open |

> **⚠ `projectId` is the product PID.** Reading the field name and assuming it
> is a MiniApp id is the obvious mistake here, and it silently builds a URL
> that opens the wrong page. Verified in `src/miniapp/bindingManager.ts` —
> `readProjectId` / `writeProjectId` are documented there as *"Read/Write
> projectId (PID)"* — and every caller passes a product pid:
> `src/host/agentFlow.ts:257` (`writeProjectId(<dir>, pid)`) and
> `src/host/product/index.ts:173` (`message.pid`); `:208` writes `''` to
> unbind. The IDE's own warning string for the empty case calls it 产品 ID /
> "Project ID", i.e. the product.

**`&tab=operation#PRIVATE` on the bind URL is load-bearing — copy it
verbatim.** `id=` alone opens the product page on whatever tab it defaults to;
the `tab=operation` query and the `#PRIVATE` hash are what select the tab
where the MiniApp binding actually lives. Dropping either sends the user to
the right product and the wrong screen.

If a value is empty, do what the IDE does: **refuse to open the link and say
which prerequisite step is missing** (it warns
`miniapp.v3.step5.appidEmpty` / `miniapp.v3.step5.projectIdEmpty` and opens
nothing). Do not substitute a placeholder, a guess, or the base URL.

### Three different things: upload, publish, bind

Keep these apart — they are sequential, and only the first has a command:

1. **Upload** — `tuyaopen miniapp upload` registers a *version* on the
   platform. **This is the only one with a CLI command.** The build is
   available for you and your team to test internally; end users see nothing.
2. **Publish** — submit that version for review, then take it live (steps 2–3
   above). Releases the version. Web-only.
3. **Bind** — attach the *published* MiniApp to the product (step 4 above), so
   the panel actually reaches that product's devices. Web-only.

**Ordering is fixed: you cannot bind before publishing.** Step 4 binds an
*already-published* MiniApp; there is nothing to attach until step 3 finished.
The IDE presents exactly this order — publish is STEP 1 and bind is STEP 2 of
its two-step web flow (`media/webview/help/miniapp-step3.*.md`). So a green
`upload` is *not* released, and a released miniapp is *not* yet reaching
devices. Tell the user which of the three they have actually done rather than
letting "uploaded" stand in for "shipped".

For what the platform checks during review (package size, i18n, forbidden
APIs, permission declarations), see skill `tuyaopen-miniapp-panel-dev` →
`references/upload-checklist.md`. This skill only owns the command line.

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
`--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1` to apply. Treat it exactly like any
other P2 command from skill `tuyaopen-shared` § 4.

### `upload` — P2, and the heaviest command in this group

Runs the full ray build → minipack → sign → COS upload → version-register
pipeline. `--dry-run` first is worth it here more than most P2 commands,
given how long the real run takes.

A successful `upload` registers a **version**, it does not release it and it
does not attach it to a product. The three steps after it — submit for review,
publish, then bind the published MiniApp to the product — are all browser-only;
see § *Web-only steps* above for the constructed URLs. Report `upload` as
"uploaded for internal testing", never as "published" and never as "live on the
device".

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `config:project_not_open` on `install`/`upload`/`preview`/`template create` | No `--extension-path` and not running inside the IDE | Pass `--extension-path <path>` or set `TUYAOPEN_EXTENSION_PATH` |
| `config:project_not_open` on `build`/`meta`/`sync-schema`/`preview` | No `source/miniapp` directory under the project root | Run inside a TuyaOpen project that has a miniapp, or pass `--project-root` |
| `sync-schema` fails `config:no_pid_bound` | No product bound and no `--pid` given | Bind a product first, or pass `--pid <pid>` explicitly |
| `sync-schema` fails `config:no_product_cache` | Product bound, but no local DP snapshot cached yet | Refresh/bind the product from the TuyaOpen IDE, then retry |
| `template create` rejected as `confirmation:needs_yes` | P2 gate — missing `--yes` / `TUYAOPEN_AUTOCONFIRM_P2` | Add both, or use `--dry-run` to preview first |
| `template create` fails `config:manifest_item_missing` (unknown template id) | Wrong or stale `--id` | Run `tuyaopen miniapp template list` for current ids |
| `upload` succeeded but end users still don't see the miniapp | Expected — `upload` registers a version for internal testing only | Publish it in the browser at `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>`, **then** bind it to the product at `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE`. Both web-only; see § *Web-only steps* |
| Miniapp is published, review passed, but the panel still doesn't appear on the device | Publishing ≠ binding — the published MiniApp is not attached to the product yet | Bind it: `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` (`<projectId>` = the **product PID** from `project.tuya.json`, keep `&tab=operation#PRIVATE` verbatim) |
| `upload` fails `config:no_pid_bound` — *"No appid in project.tuya.json"* | No appid recorded; often because the miniapp was never created on the platform. Note this is the **same** subtype `sync-schema` uses for a missing *product* pid — read the message, not just the code | Create the miniapp at <https://platform.tuya.com/miniapp/> if it doesn't exist, then `tuyaopen miniapp meta set-appid <appid>` (or use the IDE binding flow) |
