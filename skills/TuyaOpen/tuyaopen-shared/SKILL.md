---
name: tuyaopen-shared
description: >-
  Foundation conventions shared by every other TuyaOpen skill: how to find and
  identify the `tuyaopen-cli` CLI, the `--json` envelope contract, the exit-code
  promise, the P0/P2 confirmation-gate mechanics (including the derived
  `--confirm` token), command/skill self-discovery, the `tos.py` ↔ `tuyaopen-cli`
  fallback map, the `.tuyaopen/` project layout, and the master intent→skill
  routing table. Read this first, or when another skill says "not in scope,
  see tuyaopen-shared". Not a task skill by itself — it has no action of its
  own.
  基础约定与总路由：如何定位并识别 tuyaopen CLI、--json 信封契约、退出码承诺、
  P0/P2 确认门（含派生 --confirm token）、命令/技能自发现、tos.py 与 tuyaopen
  的能力映射表、.tuyaopen/ 项目布局，以及意图到技能的总路由表。任何技能标注
  "超出本技能范围，见 tuyaopen-shared" 时来这里查。本身不是任务技能，没有独立动作。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — bundled with the IDE (out/cli/cli.js inside the
    extension install) or the standalone npm package (@tuya/tuyaopen-cli,
    `tuyaopen-cli` binary on PATH)
  - Node.js (whatever version the CLI you found reports via `diag doctor --json`)
---

# TuyaOpen Shared Conventions

This skill carries no action of its own. It is the one place the load-bearing
facts about the `tuyaopen-cli` CLI and the skill catalogue are written **once** —
every other TuyaOpen skill should link here instead of restating them, and
should say "not in scope, see skill `tuyaopen-shared`" rather than naming
sibling skills by name (see § *Routing table* for why).

## 0. Order of operations — install and read the skills BEFORE you act

This is first because it is the single most expensive mistake made in beta
round 1, by the tester's own account: *"读的时机偏晚"* — the catalogue was
synced at the very start, and the skills were installed and read only **after**
a wrong command recipe had already been handed to the user.

Two concrete costs from that one run:

- `tuyaopen-cloud` states plainly that `product solution-list` always returns
  empty and that you must use `custom-list`, and that devplat writes take
  `--dry-run` → `--confirm <token>` rather than `--yes`. The wrong recipe —
  `solution-list` + `--yes` — had already been sent when that was read.
- `tuyaopen-shared` § 8 draws the project layout (`.tuyaopen/` +
  `source/embedded/`). It was instead re-derived from a `firmware build` error
  and rebuilt by hand.

`tuyaopen-workflow-product-dev` was installed and never opened. It is the
end-to-end orchestrator; for anything shaped like "build me a device", read it
**first** and let it route you.

```bash
# 1. catalogue (once per machine)
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli manifests sync --yes
# 2. what exists, and which one covers this task — match on whenToUse, not the id
tuyaopen-cli skills list --json
# 3. install the ones that do, then READ their SKILL.md before the first action
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli skills install --ids <ids> --yes
# 4. confirm your own tool can SEE them — `install` reports this now
#    (data.reachability; `tuyaopen-cli diag doctor --json` → agentSkills says the same)
```

### 0.0 Establish the machine's facts — don't take them from the task brief

<code data-type="tag" style="color:#faad14">前两轮这些事实是写在任务提示词里的。那是错的位置。</code>

一个任务书会告诉你「板子接在 `/dev/ttyACM0`」「SDK 在 `~/TuyaOpenIDE/TuyaOpenSDK`」
「登录要用户点浏览器」。**这些不该由提示词提供** —— 提示词换一个人写就会漏、会过时、会写错，
而这些都是**可以自己查**的。你的第一批动作就是把它们查清楚：

| 你需要知道的 | 自己怎么查 | 查不到时问用户什么 |
|---|---|---|
| CLI 在哪、是哪一份 | § 1（`tuyaopen-cli` 通常**不在** `PATH` 上） | — |
| 环境/SDK 是否就绪、SDK 根在哪 | `tuyaopen-cli diag doctor --json` → `sdk` 块；skill `tuyaopen-embedded-env-setup` | 没有 SDK 时**不要**擅自克隆 12 GB —— 先说要下什么、多大 |
| 目录/技能目录状态 | 同上 → `manifests`、`agentSkills` 块（§ 0.1） | — |
| 登录状态 | 同上 → `credential` 块；`tuyaopen-cli credential status` | 未登录 → §「需要人做的四件事」 |
| **有哪些串口、哪个是哪个** | `tuyaopen-cli firmware list-ports --json`（>1 个口时它会给 `hint`） | 列出来**让用户确认哪个是目标板**，不要挑一个就烧 |
| 项目状态 | `tuyaopen-cli project info --json` | — |
| 本机有没有授权码 | `tuyaopen-cli diag doctor --json` → `deviceAuth.localLicenses` | skill `tuyaopen-embedded-device-auth` § 0（**编译通过之后**才问） |

**规则：能查的就查，查不到就问，不要假设，也不要相信提示词里关于本机的说法胜过 `diag doctor`。**
提示词是需求的来源，不是环境的来源。

### 0.0a 需要人做的四件事 —— 这些你做不了，早点说清楚

有四类动作**没有任何 CLI 能替用户完成**。走到它们时，**明确说「这一步需要你做」**，
说清楚要点什么、以及做完之后设备/页面应该是什么状态。不要卡在那里等，也不要假装做完了。

| 动作 | 你能做的 | 用户必须做的 |
|---|---|---|
| **平台登录** | `tuyaopen-cli credential login --emit-url` —— 它把 URL 打到 stdout 一行 JSON 并**等待** | 在浏览器里打开那个 URL 完成授权。**把 URL 给他**，不要只说"请登录" |
| **申领 appid / 网页步骤** | 把带好参数的 URL 拼出来（skill `tuyaopen-miniapp` § 0.2 ③） | 在网页上操作 |
| **授权码** | 说明为什么需要、怎么取（skill `tuyaopen-embedded-device-auth`） | 提供码，并确认它当前没被别的设备占用 |
| **手机配网** | 说清前置状态（已写码、设备处于配网态） | 装智能生活 / Smart Life，账号区域与产品一致，App 里添加设备 |

**`--emit-url` 是这里唯一的机器通道。** 第一轮的测试者拿不到登录链接，把登录这一项打了 1/5 分 ——
不是因为 CLI 没打印，而是因为它打在 stderr 上而调用方的采集层把它缓冲了。stdout 那一行 JSON
是为你准备的。

### 0.1 A green install is not proof your tool can see the skills

Round 2 installed 19 skills, exit 0, both project mirrors populated — and the
tester's `/skills` listing showed **none of them**. The install was fine. The
reason is a trap worth knowing by name:

> **Every agent tool binds its skill roots to the workspace it was LAUNCHED in,
> once, at launch.** The TuyaOpen flow inverts that order — you are launched,
> *then* you install the CLI, *then* the CLI creates the project directory,
> *then* skills land inside it. If the workspace was the parent directory (a
> home directory, most often), a project-scope install lands somewhere the
> tool will never look, for the rest of the session.

You cannot detect this by listing files: `skills list-installed` reports what
is on disk and it is *correct*. What you check instead is reachability, which
`skills install` now returns in the same envelope, and which `diag doctor`
reports standalone:

```bash
tuyaopen-cli diag doctor --json     # → .data.agentSkills.blind  (tools that see nothing)
                                #   .data.agentSkills.hint   (what to do about it)
```

Two fixes, and the second one is the one to prefer when you are an agent that
just created the project directory it is standing in:

1. Restart with the project directory as the workspace (a human action).
2. Install where launch order cannot matter — the global roots exist before any
   project does:
   ```bash
   TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli skills install --default --scope global --yes
   ```

**Read the bodies off disk regardless.** Whether or not your tool's own skill
loader picked them up, `cat <project>/.agents/skills/<id>/SKILL.md` always
works, and § 6.1 is the fallback path for exactly that.

**Also ask the CLI before assuming a capability is missing.** `<group> --help`
lists a group's whole surface in one round trip. Round 1 reported "there should
be a logout command that clears the local SK token" — `tuyaopen-cli credential
logout` already existed, and `credential --help` lists it on the third line.
`schema list --json` is the same answer for the entire CLI.

## Shortcuts — `tuyaopen-cli schema` / `tuyaopen-cli skills` / `tuyaopen-cli config` / `tuyaopen-cli diag`

| Intent | Command |
|---|---|
| Every command's contract / one command's flags | `tuyaopen-cli schema list` · `schema get --group <g> --command <c>` |
| Environment/CLI-identity triage (one round trip) | `tuyaopen-cli diag doctor` |
| Diagnostics bundle for a bug report | `tuyaopen-cli diag export` |
| Read / write IDE settings (`language`/`gitMirror`/`manifestsSource` — not Kconfig) | `tuyaopen-cli config get` · `config list` · `config set` (P2) |
| Skill catalogue / installed-skill queries | `tuyaopen-cli skills list` · `skills list-installed` · `skills groups` |
| Install / uninstall a skill, or sync the local skill cache | `tuyaopen-cli skills install` (P2) · `skills uninstall` (P2) · `skills sync` |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per § 1 above (it is usually
not on `PATH`).

> **No CLI?** None of `schema`/`skills`/`config`/`diag` have a `tos.py`
> equivalent — skill discovery, IDE settings, and environment triage are new,
> CLI-only capabilities. When the CLI is genuinely unavailable there is
> nothing to fall back to for these four groups; see § 7 for the mapping
> that does exist, for the groups that have one.

## 1. Finding the CLI, and knowing which one you found

### 1.1 Resolve it first — `tuyaopen-cli` is usually NOT on `PATH`

**Do this once, before the first `tuyaopen-cli` command in a session.** Every
example in every TuyaOpen skill is written as bare `tuyaopen …`. This defines a
shell function of that name, so all of them then work verbatim — you never edit
a command line to add a path.

```bash
# Define `tuyaopen-cli` for this shell. Run once; then use the skills' examples as written.
if [ -n "$TUYAOPEN_CLI_PATH" ] && [ -f "$TUYAOPEN_CLI_PATH" ]; then
  _tuyaopen_entry="$TUYAOPEN_CLI_PATH"             # explicit override wins
  tuyaopen() { node "$_tuyaopen_entry" "$@"; }
elif command -v tuyaopen-cli >/dev/null 2>&1; then
  :                                                # already on PATH — nothing to do
else                                               # search upward for the IDE-written wrapper
  _d="$PWD"
  while [ "$_d" != "/" ]; do
    if [ -x "$_d/.tuyaopen/ide/bin/tuyaopen-cli" ]; then
      _tuyaopen_bin="$_d/.tuyaopen/ide/bin/tuyaopen-cli"
      tuyaopen() { "$_tuyaopen_bin" "$@"; }
      break
    fi
    _d=$(dirname "$_d")
  done
fi
command -v tuyaopen-cli >/dev/null 2>&1 || echo "TuyaOpen CLI not found — see below" >&2
```

Two properties this shape buys, both of which the obvious
`TUYAOPEN_CLI="node /path/cli.js"` variable does **not**:

- **Paths with spaces survive.** A two-word variable breaks the moment anyone
  quotes it (`"$TUYAOPEN_CLI" …` looks for one executable whose name contains a
  space) and breaks differently unquoted (a path with a space splits into two
  arguments). A function passing `"$@"` has neither failure.
- **Existing examples work unchanged**, so the other TuyaOpen skills need no
  per-command edit and cannot drift out of sync with this recipe.

A shell function lives in **one shell**. If you run each command in a fresh
shell, re-run this block first, or export `TUYAOPEN_CLI_PATH` once and use
`node "$TUYAOPEN_CLI_PATH" …` directly.

On Windows the wrapper is `.tuyaopen\ide\bin\tuyaopen-cli.cmd`.

**When the search finds nothing, stop and tell the user** — do not improvise a
path, and do not fall back to `tos.py` for something the CLI was supposed to
do. The message they need is:

> The TuyaOpen CLI wrapper is written by TuyaOpen IDE into
> `.tuyaopen/ide/bin/` when it opens a TuyaOpen project. Open this project in
> the IDE once, or set `TUYAOPEN_CLI_PATH` to an `out/cli/cli.js` /
> `dist/cli/cli.js` you already have.

Three things about that wrapper are worth knowing, because they decide when
the search succeeds:

- It is written **per project, on IDE activation with that project open** —
  not at clone time, and not for a project the IDE has never opened.
- It is in `.gitignore` (`.tuyaopen/ide/`), so it is **never committed**. A
  fresh clone and a CI checkout have no wrapper and no CLI. That is expected,
  not a misconfiguration.
- Inside the IDE's integrated terminal it is also on `PATH`, which is why bare
  `tuyaopen-cli` works there and nowhere else.

The wrapper resolves the real entry itself, highest priority first:
`TUYAOPEN_CLI_PATH` → a stable pointer file the IDE rewrites on every
activation (so it survives extension upgrades) → the path baked in at write
time. You never need to know which one it picked.

> **`@tuya/tuyaopen-cli` is not on public npm yet.** The npm package is the
> intended standalone distribution and the `bin` entry is already `tuyaopen-cli`,
> but `npm install -g @tuya/tuyaopen-cli` returns 404 on the public registry
> (re-measured 2026-08-20). The internal beta is distributed as a tarball
> instead — `npm i -g ./tuyaopen-cli-<version>.tgz` — and *that* install does
> put `tuyaopen-cli` on `PATH` globally, in which case the search above short-
> circuits at `command -v` and nothing else here applies. Without such an
> install, "on `PATH`" in practice means "an IDE integrated terminal".

### 1.1a A wrapper can exist and still be dead — check before you trust it

Resolving a wrapper is not the same as having a working CLI. The wrapper bakes
in a path to the IDE's `cli.js`; a plugin upgrade deletes the directory that
path names, and a wrapper written before the stable pointer file existed has no
way to recover — it dies with Node's `Cannot find module`, which names neither
the wrapper nor the upgrade that broke it. Measured 2026-08-20 across 20 local
projects: 11 carried a wrapper, **all 11** predated the pointer file, and **2**
pointed at a `cli.js` that no longer existed.

One command tells you which case you are in:

```bash
tuyaopen-cli diag doctor --json     # read .data.cli.wrapper
```

| What you see | What it means | What to do |
|---|---|---|
| `bakedEntryAlive: false` | This wrapper is dead — every command through it fails. | Tell the user to **reopen the project in TuyaOpen IDE once** (that rewrites it), or set `TUYAOPEN_CLI_PATH` to a `cli.js` that exists. |
| `outdated: true` with `usesPointerFile: false` | Works now, but the next plugin upgrade breaks it silently. | Worth mentioning; reopening the project in the IDE fixes it. |
| `present: false` | This project was never opened in the IDE. | Expected — you resolved via `PATH` or `TUYAOPEN_CLI_PATH` instead, which is fine. |

`diag doctor` needs no login and writes nothing, so it is always safe to run
first. If it cannot run at all, you have not actually resolved the CLI — go
back to § 1.1.

**Never repair a wrapper by editing it.** It is IDE-managed and rewritten on
every project open, so the edit is lost and, worse, it hides the real state
from whoever reads next.

### 1.2 Then identify what you resolved

Two independent builds can answer to the name `tuyaopen-cli`: the **bundled** one
inside a TuyaOpen IDE install (`<extension>/out/cli/cli.js`), and the
**standalone** npm package (`dist/cli/cli.js`). They share this contract but
not necessarily a version. Don't guess which one a shell has — ask it:

```bash
"$TUYAOPEN_CLI" diag doctor --json
```

The `cli` block in the response identifies the binary you are actually
running:

```json
{
  "cli": {
    "entryPath": "/abs/path/to/cli.js",
    "version": "0.1.0",
    "contractVersion": 1,
    "processNodeVersion": "v22.22.0",
    "packaging": "bundled",
    "cacheRoot": { "path": "/home/<user>/TuyaOpenIDE/.tuyaopen/cache", "source": "default" },
    "devplatSpawnNode": "/path/to/node"
  }
}
```

- `packaging` is `"bundled"` (running from inside an IDE install), `"standalone"`
  (the npm package), or `"unknown"`.
- `contractVersion` is the machine-contract version of the `--json` envelope
  and the command schema (see § 2) — an add-only counter, currently `1`.
- `diag doctor --json` also reports `node`/`git`/`uv`/`python` toolchain
  status, `sdk.{installed,tosPresent,envReady}`, `devplatCli.{present,path}`,
  and `credential.{loggedIn,source}` in the same call — one round-trip to
  triage "why isn't this working" before touching anything.

## 2. The `--json` envelope contract

Every command returns one JSON object on a single stdout line under
`--json` / `--format json` (default when stdout is piped; `human` is the
default in a TTY). Never parse human-mode output.

> **你多半看不到 stdout 和 stderr 的区别 —— 不要凭观感断言这条契约被违反了。**
>
> 几乎每个 agent 工具的 shell 都把两个流**合并**后展示给你（Claude Code 的 Bash
> 工具就是这样）。于是你会看到日志行和那一行 JSON 交错在一起，看起来像是日志
> 混进了 stdout。**内测第五轮就有人据此报了一个不存在的 bug** —— 复核时严格分离
> 两个流，stdout 恰好一行 JSON，日志一行不差全在 stderr。
>
> 要验证，就显式重定向，别靠眼睛：
>
> ```bash
> tuyaopen-cli <cmd> --json >out.txt 2>err.txt
> wc -l out.txt            # 契约要求：1
> ```
>
> 顺带解释了为什么日志走 stderr：**不是藏起来，是为了不污染载荷**。你要读日志，
> 看 stderr；你要解析结果，读 stdout —— 前提是你把它们分开。

```ts
interface CommandResult {
  ok: boolean;
  data?: unknown;                 // payload; shape is per-command
  error?: string;                 // legacy human message
  code?: string;                  // legacy stable machine code
  suggestion?: string;            // legacy hint (superseded by `hint`)
  type?: ErrorCategory;           // 'validation'|'authentication'|'authorization'
                                   // |'config'|'network'|'api'|'policy'|'internal'
                                   // |'confirmation'|'tooling'|'envstate'
  subtype?: string;               // closed-set sub-classifier
  hint?: string;                  // actionable one-liner
  retryable?: boolean;
  next_steps?: string[];          // ordered follow-up commands
  details?: unknown;              // structured detail, never rendered in human mode
  meta?: { elapsed_ms?: number; mutating?: boolean; riskLevel?: 'P0'|'P2'|'P3'; [k: string]: unknown };
}
```

`contractVersion` (currently `1`) is stamped onto the **outer** object at
render time — sibling to `ok`/`data`, not nested under `meta` — on every
`--json` response including the crash-net envelope. Treat it as the one
add-only flag that says "I know this envelope shape"; do not infer the shape
from which fields happen to be present.

**A programmatic caller classifies by `type` / `subtype` / `code` — never by
exit code number.** See § 3.

List payloads (a bare array, or an object wrapping one under `list` /
`dataList` / `datas` / `items` / `records` / `data`) can be cropped with the
global `--fields name,other` / `--max-items N` flags — useful for keeping a
large listing inside an AI context window.

## 3. Exit codes: only `0` / non-zero is a promise

**The only contract is `0` = success, non-zero = failure.** The CLI does map
error categories to specific non-zero values internally, and that mapping is
real and in force today — but it is an **internal implementation detail, not
a stable interface**. Categories can be added or re-mapped over time.

**Do not branch on a specific exit code number** (`=== 7`, etc.). Read
`type` / `subtype` / `code` from the parsed `--json` envelope instead — that
is the add-only machine contract this CLI actually promises to keep stable.

## 3. Environment and diagnostics

Two commands answer "is this machine set up, and which CLI am I actually
running". They belong here rather than in a device skill: what they diagnose is
the **CLI and the host**, not the board — and every skill needs that answer, not
just the one that was holding them until 2026-08-24.

### 3.1 `tuyaopen-cli diag doctor` — environment triage

```bash
tuyaopen-cli diag doctor --json
```

One round-trip covering: which CLI binary is actually running (`cli.entryPath`
/ `version` / `contractVersion` / `packaging: bundled|standalone|unknown` /
`cacheRoot` / `devplatSpawnNode` — see skill `tuyaopen-shared` § 1 for the
full shape and how to read `packaging`), `node`/`git`/`uv`/`python` toolchain
status, `sdk.{installed,tosPresent,envReady}`, `devplatCli.{present,path}`,
and `credential.{loggedIn,source}`. Real example (fields vary by machine):

```json
{
  "ok": true,
  "data": {
    "cli": { "entryPath": "/…/out/cli/cli.js", "version": "0.1.0", "contractVersion": 1,
              "processNodeVersion": "v22.22.0", "packaging": "bundled",
              "cacheRoot": { "path": "/home/<user>/TuyaOpenIDE/.tuyaopen/cache", "source": "default" },
              "devplatSpawnNode": "/…/bin/node" },
    "node": { "status": "ok", "version": "v22.22.0" },
    "git": { "status": "ok", "version": "2.43.0" },
    "uv": { "status": "ok", "version": "0.11.3" },
    "python": { "status": "ok", "version": "3.12.3" },
    "sdk": { "installed": true, "tosPresent": true, "envReady": true },
    "devplatCli": { "present": true, "path": "/…/tuya-devplat-cli/packages/tuya-devplat-cli/dist/cli.js" },
    "credential": { "loggedIn": false, "source": "none" }
  }
}
```

Read `sdk.envReady` before assuming `tos.py` commands will work — `installed`
and `tosPresent` can both be `true` while the env is still cold. Each tool's
`status` is `ok` / `warn` / `fail`; `node.status: "warn"` means Node is usable
but below the required major version.

### 3.2 `tuyaopen-cli diag export` — diagnostics bundle for a bug report

```bash
tuyaopen-cli diag export [--out <path>] [--force]
```

Writes a JSON file (default `./tuyaopen-diag-<yyyymmdd-hhmmss>.json`)
combining the same `cli` identity block as `doctor`, system info, tool
versions, SDK diagnostics, and — when run inside a project — project
diagnostics. Refuses to overwrite an existing `--out` path unless `--force`
is given. This is a **local file write** (P3, not gated), not a network
upload — hand the resulting file to whoever is helping debug.

### 3.3 When `diag doctor` says the SDK is the problem

`diag doctor` reports `sdk.{installed,tosPresent,envReady}` but does not fix
anything. A narrower SDK-only probe and every repair path — installing,
cloning, warming the environment — belong to skill
`tuyaopen-embedded-env-setup`. Read the field, then go there; do not try to
reconstruct the setup steps from this section.

## 4. Risk gate — P0 needs a **derived** `--confirm` token, P2 needs `--yes` + env

| Tier | Gate | What's here today |
|---|---|---|
| **P0** | `--confirm <token>`, and the token must be the one **this exact operation's** `--dry-run` handed back | Only `license remove` |
| **P2** | `--yes` **and** `TUYAOPEN_AUTOCONFIRM_P2=1` | Most mutating commands — `firmware flash` / `authorize`, `skills install` / `uninstall`, `dependency add` / `remove`, `dp add` / `sync`, `project *`, `config set`, `license add` / `import`, `manifests sync`, `product sync`, `miniapp upload` / `install` / `sync-schema`, `dependency install`, `dependency install`, `hardware set-used` / `intellisense`, `credential logout` |
| **P3** | **No gate at all** — not even `--yes` | Mostly long-running reads, but the writers among them are ungated too: `sdk clone` / `update` / `env-init` / `env-pull`, `firmware build` / `clean`, `skills sync`, `miniapp build` / `meta` / `template`, `credential login`, `diag export`. Each guards itself on its own preconditions instead — `diag export` refuses an existing `--out` without `--force`; `sdk clone` refuses a non-empty target. **So do not read "it is not P2" as "it does not write."** |
| Read-only | No gate | — |

Ask `tuyaopen-cli schema list --json` for a command's `riskLevel` rather than
inferring it: the table above is a snapshot, `schema list` is the contract.

**`TUYAOPEN_AUTOCONFIRM_P2=1` belongs on the invocation, not in the shell.**

```bash
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli firmware flash --port <port> --yes   # do this
export TUYAOPEN_AUTOCONFIRM_P2=1                                        # NOT this
```

Both forms satisfy the gate, but `export` disarms it for the **rest of the
session**: after it, every P2 command in that shell is a single `--yes` away,
including ones you never meant to enable — `firmware authorize`,
`skills uninstall`, `dependency remove`, `dp add`. The prefix costs the same
keystrokes and its scope ends when the command does. The env var exists
precisely so that `--yes` alone cannot carry a mutation; exporting it hands
that protection back.

P0 is judged by **consequence**, not verb: no reverse command exists, **and**
running it destroys state the caller cannot reconstruct. `firmware flash` /
`firmware authorize` / `dependency remove` / `skills uninstall` dropped from
P0 to P2 on 2026-08-18 — all four have a reverse command (`authorize` also
gained `firmware auth-status`, which reads the result back off the device so
you verify after the fact instead of proving intent with a token beforehand).

`P1` was removed entirely (2026-08-18). Its gate was byte-for-byte identical
to P0's, and no command ever landed in it.

**`--dry-run` works on every mutating command, regardless of tier.** The
guard was deliberately decoupled from risk level onto `mutating`, so it is
always available to preview a change without applying it.

For a P0 command, `--dry-run`'s response carries the token in
`meta.confirm_token`. **`--confirm` must be re-run with the identical flags**
used for that `--dry-run` call — a token minted for one flag set does not
confirm a different one. **Never fabricate or guess a token**; always copy
the exact value `--dry-run` handed back.

**Rejected ≠ unusable.** A `confirmation`-type error (the `type` field from
§2) means the CLI is working correctly and refusing you on purpose — do not
switch to `tos.py` because of it.

## 5. Command self-discovery — don't hardcode flags here or anywhere

```bash
tuyaopen-cli schema list [--group <g>]                     # every command's contract
tuyaopen-cli schema get --group <g> --command <c>           # one command's flags/mutating/riskLevel
tuyaopen-cli <group> --help                                 # human-readable, same info
```

**Never copy a flag list into a skill's prose.** The CLI's own schema is the
source of truth and changes are contract-versioned; a hardcoded flag table
goes stale the moment a command gains or loses a flag. Point at `schema get`
instead.

## 6. Skill self-discovery

```bash
tuyaopen-cli skills list [--json]                 # catalog: id/name/summary/whenToUse/surfaces/tags/commands/defaultEnabled
tuyaopen-cli skills list-installed --project-root <dir> [--scope project|global]
tuyaopen-cli skills install --scope project|global [--ids <id1,id2>] [--default] [--force]
tuyaopen-cli skills uninstall --scope project|global --id <id>
tuyaopen-cli skills sync [--stream]                # fetch payloads for catalogue items that declare source.repo
```

**Cold start — `skills list` came back `no_manifest_cache`?** Then this machine
has no catalogue yet (typical right after `npm i -g @tuya/tuyaopen-cli`; the IDE
does this for you). The fix is `manifests sync`, **not** `skills sync`:

```bash
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli manifests sync --yes    # downloads the catalogue + skill bodies
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli skills install --default --yes
```

`skills sync` only fetches items whose manifest entry carries a `source.repo`.
Every item in this catalogue ships inside the manifest release instead, so it
reports `external: 0`, exits 0, and changes nothing — running it in place of
`manifests sync` leaves you exactly where you started. `tuyaopen-cli diag doctor`
reports the catalogue state under `manifests` if you want to check first.

**A catalogue that is present can still be stale, and staleness is silent.** An
old cache resolves fine, and `skills install` **succeeds** — against ids that
have since been renamed or retired. Measured 2026-08-21 on a machine whose cache
was 8 days old: `skills install --default` wrote **13 retired ids** and exited 0,
with nothing in any output suggesting a problem. So before trusting a catalogue
you did not just download, ask:

```bash
tuyaopen-cli manifests status --json                    # offline; read `layout`
tuyaopen-cli manifests status --check-update --json     # network; read `update.updateAvailable`
```

Two independent signals, and either one alone is enough to act on:

| Signal | Meaning |
|---|---|
| `layout: "legacy"` | The cache predates the 2026-08-17 product-line split. **Deterministic proof**, not a date guess — that path only exists in a pre-split cache. Its skill ids are the pre-rename ones. |
| `update.domains[].outdated: true` | That domain's declared version is behind the published release. |

Either one → `TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli manifests sync --yes`, then
re-read `skills list`. If the check could not reach the release it says so
(`update.checked: false`, `reason: "release-unreachable"`) — treat that as
"unknown", never as "up to date". `diag doctor` reports the same `layout` plus
the catalogue's `publishedAt` / `skillsVersion`, offline.

- **Project scope** (default) installs a real, editable copy at
  `<project>/.agents/skills/<id>/` (and mirrors it, regenerated on every
  install, to `<project>/.claude/skills/<id>/` — that mirror is IDE-managed;
  edit the `.agents/` copy, not the mirror).
- **Global scope** (`--scope global`, since 2026-08-14) installs to a single
  **hub** at `~/.agents/skills/<id>/`, then links `~/.claude/skills/<id>/`,
  `~/.codex/skills/<id>/` and `~/.cursor/skills/<id>/` back into it (a
  directory symlink on macOS/Linux, a junction on Windows) — so Claude Code,
  Claude Desktop, Codex and Cursor all read the same install. See § 10 for
  what that means for editing one.
- `install --default` pulls in every manifest-declared default-enabled skill
  (the same set a New Project installs automatically) and unions with
  `--ids` rather than replacing it.
- `list-installed` reports drift (`upToDate`) per skill so an agent can decide
  whether to re-install, and — with a project open — whether a same-id
  project-scope copy is *shadowing* a global one (or vice versa): same-id
  project copies always win over the global hub, so a hub update alone does
  not reach a project that already has its own copy.

### 6.1 Your tool's skill directory isn't one of the four? Install them yourself

**Which tool reads what** (measured 2026-08-21 against shipped builds; the
`tuyaopen-cli skills install` result and `diag doctor` both report this per tool,
with a `confidence` field saying whether the row was probed or assumed):

| Tool | project scope | global scope |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Antigravity (`agy`) | `.agents/skills/` | `~/.gemini/config/skills/` (**two** levels, not a typo) |
| Codex | `.agents/skills/` (**not** `.claude/`) | `~/.codex/skills/` |
| opencode | `.agents/skills/`, `.claude/skills/`, `.opencode/skill(s)/` | `~/.agents/skills/` — **the hub itself**, no link needed |
| Cursor | unknown | `~/.cursor/skills/` — *unverified*, no CLI to probe |

A project-scope install writes `.agents/skills/` **and** `.claude/skills/`, so
it covers the first four. Global scope writes the hub plus links into
`~/.claude/`, `~/.codex/`, `~/.cursor/` and `~/.gemini/config/`.

**This table has been wrong twice, in both directions**, which is why it now
carries a `confidence` field instead of just paths: `agy` was missing entirely
until 2026-08-21 (so the "just install globally" advice in § 0.1 would have
produced an empty listing), and Codex was recorded as reading *no* project root
(so the report called it blind right after an install it reads fine). If your
tool is not on this list, or reads no skill directory at all, **nothing is
broken.** The catalogue is machine-readable and installation is a command you
can run yourself:

```bash
tuyaopen-cli skills list --json           # id, group, name, summary, whenToUse, tags, defaultEnabled
tuyaopen-cli skills groups --json         # core | embedded | cloud | miniapp | category
tuyaopen-cli skills list-installed --json --project-root .
TUYAOPEN_AUTOCONFIRM_P2=1 tuyaopen-cli skills install --ids <a,b> --yes    # project scope
```

Then read the bodies straight off disk — they are plain Markdown with YAML
frontmatter, no tool-specific packaging:

```
<project>/.agents/skills/<id>/SKILL.md      # canonical copy (project scope)
~/.agents/skills/<id>/SKILL.md              # canonical copy (global hub)
```

Pick by `whenToUse` from `skills list`, install what the task needs, read that
`SKILL.md` **before** starting. Two things to get right:

- **Use the canonical `.agents/` copy**, not the `.claude/` mirror — the mirror
  is regenerated on every install and its directory name is flattened.
- **The id in `skills list` is the directory name.** Aliases resolve a lookup,
  never a path: `skills install --ids tuyaopen-debug-helper` works and creates
  `.agents/skills/tuyaopen-embedded-cli-debug/`. Always read the installed
  result back with `list-installed` rather than assuming the path.

- **Reading a `SKILL.md` off disk is always available**, and it does not care
  where your tool was launched. If `/skills` (or your tool's equivalent) does
  not list them but `list-installed` says they are there, you have hit § 0.1 —
  `cat` the files and carry on, rather than concluding they failed to install.

If `skills list` returns `no_manifest_cache`, this machine has no catalogue at
all yet — run `manifests sync` first (see the cold-start note above).

## 7. `tos.py` ↔ `tuyaopen-cli` — what's covered, what still needs `tos.py`

`tos.py` (the TuyaOpen SDK's own build tool, 13 verbs: `build` `clean` `flash`
`monitor` `new` `update` `config` `dev` `idf` `prepare` `hello` `check`
`version`) predates this CLI and is still required for anything the table
below doesn't cover.

| `tos.py` verb | `tuyaopen-cli` CLI equivalent | Note |
|---|---|---|
| `build` / `clean` / `flash` / `monitor` | `firmware build` / `firmware clean` / `firmware flash` / `firmware monitor` | Directly wrapped |
| `new` (project) | `project create` | Non-interactive equivalent of the interactive `tos.py new project` |
| `update` | `sdk update` | **Not the same operation** — `tuyaopen-cli sdk update` is `git pull --ff-only` on the SDK clone (`pullSdk`), while `tos.py update` pins the platform sub-SDK. Use whichever you actually mean; neither replaces the other |
| `config` (Kconfig / menuconfig) | — | **See the warning below — do not confuse with `tuyaopen-cli config`** |
| `dev` / `idf` / `prepare` / `hello` / `check` / `version` | — | No `tuyaopen-cli` equivalent; use `tos.py` |
| `tyutool_cli authorize` | `firmware authorize` | Wrapped (writes UUID/AuthKey over UART) |

> **⚠ `tos.py config` and `tuyaopen-cli config` are two unrelated commands that
> happen to share a name.**
>
> - `tos.py config` (`choice`/`menu`/`save`/`set`/`get`/`list`/`diff`) edits the
>   **project's Kconfig build configuration** — `app_default.config`,
>   `.build/cache/using.config`. See skill `tuyaopen-embedded-build`.
> - `tuyaopen-cli config` (`get`/`set`/`list`) edits **IDE settings**, and only
>   three keys exist: `language`, `gitMirror`, `manifestsSource`. It has
>   **nothing to do with Kconfig.**
>
> The intuitive guess for "set a build config option" is `tuyaopen-cli config
> set` — that is the wrong command and will silently do nothing to the
> project's Kconfig (it will just reject the key, since it isn't one of the
> three above). Use `tos.py config set` (or hand-edit `app_default.config`,
> see skill `tuyaopen-embedded-build`) for Kconfig.

## 8. Project layout

```
<project>/
├── .tuyaopen/                    # AI/SDK-readable metadata, at ROOT
│   ├── project.json              # schema-versioned project descriptor
│   ├── status.json                # lifecycle / intent status
│   ├── architecture.json          # platform/board/framework record
│   ├── dependencies.lock.json     # pinned ecosystem library versions
│   ├── ide/                       # IDE-private state — do not hand-edit
│   └── platform/                  # IDE-private platform/devplat state
└── source/
    ├── embedded/                  # firmware application code
    └── miniapp/                   # Ray panel miniapp code
```

Everything at `.tuyaopen/`'s root is meant to be read (and in places written)
by an AI agent or the SDK; `ide/` and `platform/` under it are IDE-private —
treat them as opaque.

## 9. Routing table — which skill for which intent

`tuyaopen-cli skills list --json` is the live, authoritative listing of this
catalogue — it returns every item with its `whenToUse` whether or not that item
is installed. **No count is written here**: every attempt to state one went
stale (this line said 28 while the catalogue held 30). Rather than every skill naming every sibling it might hand off to —
an O(n²) maintenance burden where adding one skill means editing many others'
prose — **the rule is one-way**: a task-specific skill that hits something out
of its scope says "not in scope, see skill `tuyaopen-shared`'s routing table"
and stops there; it does not name which sibling skill picks it up. This file
is the only place that maps intent → skill, in `references/ROUTING.md`.

## 10. Editing an installed skill

**Project-scope** installs are a real, editable recursive copy at
`<project>/.agents/skills/<id>/` — edit it directly.

**Global-scope** installs (`--scope global`) are different since 2026-08-14:
the one real copy is the **hub**, at `~/.agents/skills/<id>/`, and
`~/.claude/skills/<id>/`, `~/.codex/skills/<id>/`, `~/.cursor/skills/<id>/`
are each a directory *link* into it (a symlink on macOS/Linux, a junction on
Windows) rather than independent copies. That means:

- Editing the skill through **any** of those four paths edits the same
  bytes — there is exactly one copy to keep track of, not four.
- The hub content is written **read-only** on install, so an edit attempted
  through any of the four paths is meant to fail loudly rather than silently
  diverge from the catalogue. **This is best-effort, not a hard guarantee —
  most of all on Windows.** macOS/Linux enforce it with real POSIX
  permission bits (`chmod`-cleared before deletion, restored on every write).
  Windows has no equivalent access-control mechanism for directories, and for
  files `chmod` there only toggles the FILE_ATTRIBUTE_READONLY flag, which any
  process with ordinary write access to the volume can clear before writing
  anyway — so on Windows a global-scope skill's files can, in practice, still
  be edited in place, and the IDE will not know they were.
- One of the four paths can occasionally be a **real recursive copy instead
  of a link** — the IDE falls back to that when creating a directory
  link/junction isn't possible in a given environment (uncommon: an
  unsupported filesystem, a sandbox, or, on Windows specifically, a link
  needs `SeCreateSymbolicLinkPrivilege`/Developer Mode that isn't present).
  A copy like that is a genuinely independent, writable directory — editing
  it does **not** propagate anywhere else, and the IDE overwrites it on the
  next install of that skill.

**If you need to tweak a skill's instructions, install (or re-install) it at
project scope instead** (`tuyaopen-cli skills install --scope project --ids
<id>`, landing at `<project>/.agents/skills/<id>/`) — that copy is
unambiguously yours to edit, on every platform, with no read-only surprise.
