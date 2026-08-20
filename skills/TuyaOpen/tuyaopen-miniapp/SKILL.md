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
| Start the dev server (minipack watch), or capture a screenshot and exit | `tuyaopen miniapp preview` · `preview --screenshot <path>` |
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

## Web-only steps — the CLI stops at `upload`

The `miniapp` group covers **exactly** the seven subcommands in the table
above and nothing else. **Four** steps of the miniapp lifecycle have **no CLI
command at all** and can only be done in a browser on the Tuya developer
platform. If the user is at one of these steps, say so and hand them the
fully-constructed URL — **do not** invent a `tuyaopen miniapp create` /
`submit` / `review` / `publish` / `bind` command, because none exists
(`tuyaopen schema list --json` is the authority; check it before claiming
otherwise).

**Construct the URL with its query parameters — never hand over a bare base
page.** The IDE builds each link at click time so one click lands on the exact
page and tab (`src/host/externalLinkHandlers.ts`); a bare base URL leaves the
user hunting for the right product, the right miniapp and the right tab.

| # | Step | Why the CLI can't | URL to open |
|---|---|---|---|
| 1 | **Create the miniapp** (mint the appid) | `meta set-appid <appid>` *records* an appid into project metadata; it does not create one, and `upload` needs one that already exists. Only the platform issues an appid | `https://platform.tuya.com/miniapp/` — the one step with no parameter, because the thing the id would name does not exist yet. Create it, then copy the id back with `tuyaopen miniapp meta set-appid <appid>` |
| 2 | **Submit for review** (提审) | Review is a platform workflow with human reviewers; this CLI has no API surface for it | `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>` |
| 3 | **Publish / gray release / go live / roll back** (发布・灰度・上线・回滚) | These affect every end user of the product; deliberately kept off the command line | same version-management page as #2 |
| 4 | **Bind the MiniApp to the product** (绑定面板小程序) | The binding lives on the product, not in the project; nothing local can assert it | `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` |

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
