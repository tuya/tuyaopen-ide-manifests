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

For the CLI's envelope, exit codes, and P0/P1/P2 confirmation ritual, see
skill `tuyaopen-shared` — not repeated here.

## Runtime prerequisite: `--extension-path`

`install`, `upload`, `preview`, and `template create` all need the VSIX's
bundled `vendor/miniapp-runtime/` to do real work. Inside the IDE's own
terminal this is injected automatically; running the standalone CLI outside
the IDE, pass `--extension-path <path>` explicitly or set
`TUYAOPEN_EXTENSION_PATH`. Without it, these commands fail with a clear
`config:project_not_open` hint rather than doing partial work.

## Commands

| Subcommand | Purpose | Risk |
|---|---|---|
| `build` | Build the miniapp (wraps `miniapp.runBuild` via the local npm runtime) | P3 |
| `install` | Ensure the MiniApp runtime is installed in the shared TuyaOpenIDE cache | P2 |
| `meta set-appid <appid>` | Write the miniapp's appid into project metadata | P3 (mutating, but not gated — P3 carries no confirmation requirement) |
| `sync-schema` | Read the local DP cache for the bound product and regenerate `source/miniapp/src/devices/schema.ts` | P2 |
| `preview` | Start the dev server (minipack watch); `--screenshot <path>` captures a PNG and exits instead | P3 (read-only) |
| `template list` \| `template create --id <id>` | Browse / apply the miniapp template gallery | `list`: none; `create`: P2 |
| `upload` | Build, sign, and upload to the Tuya platform (ray build → minipack → sign → COS upload → version register) | P2 |

Full flags for any of these: `tuyaopen miniapp --help` or `tuyaopen schema
get --group miniapp --command <name>` — don't memorize a flag list here, see
skill `tuyaopen-shared` § 5 for why.

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

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `config:project_not_open` on `install`/`upload`/`preview`/`template create` | No `--extension-path` and not running inside the IDE | Pass `--extension-path <path>` or set `TUYAOPEN_EXTENSION_PATH` |
| `config:project_not_open` on `build`/`meta`/`sync-schema`/`preview` | No `source/miniapp` directory under the project root | Run inside a TuyaOpen project that has a miniapp, or pass `--project-root` |
| `sync-schema` fails `config:no_pid_bound` | No product bound and no `--pid` given | Bind a product first, or pass `--pid <pid>` explicitly |
| `sync-schema` fails `config:no_product_cache` | Product bound, but no local DP snapshot cached yet | Refresh/bind the product from the TuyaOpen IDE, then retry |
| `template create` rejected as `confirmation:needs_yes` | P2 gate — missing `--yes` / `TUYAOPEN_AUTOCONFIRM_P2` | Add both, or use `--dry-run` to preview first |
| `template create` fails `config:manifest_item_missing` (unknown template id) | Wrong or stale `--id` | Run `tuyaopen miniapp template list` for current ids |
