---
name: tuyaopen-miniapp
description: >-
  Operate the panel miniapp's build/runtime/upload lifecycle through the
  tuyaopen CLI's `miniapp` command group: build, install the shared runtime,
  set/read metadata (appid), sync the DP schema from the bound product,
  preview (dev server / screenshot), scaffold from a template, and upload a
  version to the Tuya platform. This is the command-line surface only — panel
  architecture, DP hooks, and category UI conventions are a different skill.
  Use when the user wants to run `tuyaopen-cli miniapp ...`, build/upload the
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

### 没装 IDE 时从哪弄到一个 `--extension-path`

<code data-type="tag" style="color:#52c41a">内测第五轮实测可行</code>

**任何**装过 TuyaOpen IDE 扩展的编辑器都行 —— 不必是 VS Code。第五轮的测试机上
恰好装过 Cursor 和 Trae 版，直接借用它们的扩展目录就绕过了这堵墙。找法：

```bash
# Windows
dir /s /b "%USERPROFILE%\.vscode\extensions\*tuyaopen*"  "%USERPROFILE%\.cursor\extensions\*tuyaopen*"
# macOS / Linux
find ~/.vscode/extensions ~/.cursor/extensions ~/.trae/extensions \
     -maxdepth 1 -iname '*tuyaopen*' 2>/dev/null
```

挑一个**里面有 `vendor/miniapp-runtime/` 的**，把那个目录当 `--extension-path`。

> **多记一个备用路径。** 第五轮里借用的那个目录**在会话中途消失了**（前一刻还在，
> 后一刻就没了，疑似扩展自动更新/清理），第二次调用才失败。找到两个就都记下来。

一个都找不到时，`preview` 这一步的降级方案见
skill `tuyaopen-workflow-miniapp-dev` 的 ⑧（真机扫码看，或去真 IDE 里跑）。

## Shortcuts — `tuyaopen-cli miniapp`

| Intent | Command |
|---|---|
| Build the miniapp (wraps `miniapp.runBuild` via the local npm runtime) | `tuyaopen-cli miniapp build` |
| Ensure the MiniApp runtime is installed in the shared TuyaOpenIDE cache | `tuyaopen-cli miniapp install` (P2) |
| Write the miniapp's appid into project metadata | `tuyaopen-cli miniapp meta set-appid <appid>` (mutating, but P3 — not gated) |
| Read the local DP cache and regenerate `source/miniapp/src/devices/schema.ts` | `tuyaopen-cli miniapp sync-schema` (P2) |
| Start the dev server and hand the user a URL to open in a browser | `tuyaopen-cli miniapp preview` — see § 0.1, this is how a built panel becomes something anyone can look at |
| Browse / apply the template gallery | `tuyaopen-cli miniapp template list` · `template create` (P2) |
| Build, sign, and upload to the Tuya platform | `tuyaopen-cli miniapp upload` (P2) |

Flags aren't listed here — run `tuyaopen-cli schema get --group miniapp --command
<c>` for the current set. Resolve `tuyaopen-cli` first per skill `tuyaopen-shared`
§ 1 (it is usually not on `PATH`).

Example invocations:

```bash
tuyaopen-cli miniapp build --project-root <dir>
tuyaopen-cli miniapp install --extension-path <ext-path>
tuyaopen-cli miniapp meta set-appid <appid>
tuyaopen-cli miniapp sync-schema --pid <pid>          # default: read pid from tuyaopen.project.ini
tuyaopen-cli miniapp preview --screenshot preview.png --width 375 --height 812
tuyaopen-cli miniapp template list --json
tuyaopen-cli miniapp template create --id <template-id> --dry-run
tuyaopen-cli miniapp upload --version 1.0.0 --description "..." --extension-path <ext-path>
```

## The order these commands go in is **not** here

Seven commands, and running them in the wrong order is the most common way a
panel build goes wrong — but sequence is a workflow question, not a command
question. **Skill `tuyaopen-workflow-miniapp-dev` owns the whole panel
lifecycle**: creating the miniapp and getting an appid, when to hand the user a
render URL, when to upload, and the three web-only steps (submit for review,
publish, bind to the product) with the URLs to construct.

Everything below is the other half: what each command does, what it requires
before it will run, and how it is gated. Those hold no matter which order you
arrive in — which is exactly why they stay here and the sequence does not.

## Per-command reference

### `appid` / `projectId` — read them from the workflow skill

`tuyaopen-cli miniapp meta set-appid <appid>` **records** an appid; it never mints
one, and no command in this group takes a `projectId`. Both values exist to
build the platform URLs for the web-only steps, which is a workflow concern —
skill `tuyaopen-workflow-miniapp-dev` § *两个参数分别是什么、从哪读* is the
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
| `template create` fails `config:manifest_item_missing` (unknown template id) | Wrong or stale `--id` | Run `tuyaopen-cli miniapp template list` for current ids |
| `upload` succeeded but end users still don't see the miniapp | Expected — `upload` registers a version for internal testing only | Publish it in the browser at `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>`, **then** bind it to the product at `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE`. Both web-only; see § *Web-only steps* |
| Miniapp is published, review passed, but the panel still doesn't appear on the device | Publishing ≠ binding — the published MiniApp is not attached to the product yet | Bind it: `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` (`<projectId>` = the **product PID** from `project.tuya.json`, keep `&tab=operation#PRIVATE` verbatim) |
| `upload` fails `config:no_pid_bound` — *"No appid in project.tuya.json"* | No appid recorded; often because the miniapp was never created on the platform. Note this is the **same** subtype `sync-schema` uses for a missing *product* pid — read the message, not just the code | Create the miniapp at <https://platform.tuya.com/miniapp/> if it doesn't exist, then `tuyaopen-cli miniapp meta set-appid <appid>` (or use the IDE binding flow) |
