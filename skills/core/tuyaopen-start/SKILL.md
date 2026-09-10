---
name: tuyaopen-start
description: 'Foundation conventions shared by every other TuyaOpen skill: how to find and identify the `tuyaopen-cli`
  CLI, the `--json` envelope contract, the exit-code promise, the P0/P2 confirmation-gate mechanics (including the
  derived `--confirm` token), command/skill self-discovery, the `tos.py` ↔ `tuyaopen-cli` fallback map, the `.tuyaopen/`
  project layout, and the master intent→skill routing table. Read this first, or when another skill says "not in
  scope, see tuyaopen-start". Not a task skill by itself — it has no action of its own. Also use as fallback: come
  here for any TuyaOpen /

  涂鸦 / T5AI task when none of the phase workflows obviously fits — environment setup and SDK install, adding a new
  development board or BSP, code formatting, or simply "which skill do I need". Most skills are NOT installed; this
  skill''s routing table names all of them and `tuyaopen-cli skills read --id <id>` fetches any 冷启动触发：嵌入式,技能,项目,工程,引脚,屏幕,按键,串口,崩溃,板级,开发板,格式,clang-format,UUID,环境,上传,组件,图表,性能。'
license: Apache-2.0
compatibility: tuyaopen CLI, either form — bundled with the IDE (out/cli/cli.js inside the extension install) or
  the standalone npm package (@tuya/tuyaopen-cli, `tuyaopen-cli` binary on PATH); Node.js (whatever version the
  CLI you found reports via `diag doctor --json`)
metadata:
  version: 2.0.2
  owner: core-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
---
# TuyaOpen — Start Here

> **Renamed 2026-08-31: `tuyaopen-shared` → `tuyaopen-start`.** The old id was
> removed outright, with no alias — the same rule the retired CLI spellings
> follow, and for the same reason: an alias would keep a stale copy of this
> file installed next to the current one, because `pruneRetiredInstalls` treats
> an alias-resolvable id as still live. `tuyaopen-cli skills install` deletes
> the old directory on its next run. The name is the point: this is the file to
> read **first**, and "shared" read like a library nobody had to open.

This skill carries no action of its own. It is the one place the load-bearing
facts about the `tuyaopen-cli` CLI and the skill catalogue are written **once** —
every other TuyaOpen skill should link here instead of restating them, and
should say "not in scope, see skill `tuyaopen-start`" rather than naming
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
- `tuyaopen-start` § 8 draws the project layout (`.tuyaopen/` +
  `source/embedded/`). It was instead re-derived from a `firmware build` error
  and rebuilt by hand.

`tuyaopen-workflow-product-dev` was installed and never opened. It is the
end-to-end orchestrator; for anything shaped like "build me a device", read it
**first** and let it route you.

```bash
# 1. catalogue (once per machine)
tuyaopen-cli manifests sync --yes
# 2. what exists, and which one covers this task — match on whenToUse, not the id
tuyaopen-cli skills list --json
# 3. install the ones that do, then READ their SKILL.md before the first action
tuyaopen-cli skills install --ids <ids> --yes
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
| **目标平台是否就绪**（不是"SDK 是否就绪"） | 同上 → `platforms` 块：`installed` / `missing` | `missing` 里有你的目标板 → 首次编译要先克隆子 SDK 并下载交叉工具链（T5AI 那份约 150 MB），**先告诉用户要下多少**再动手 |

`sdk` 块的三个布尔说的是**核心 clone**，三个全绿 ≠ 你的目标平台能编。实测过一台
`sdk` 全绿、而 8 个平台里 6 个没有 checkout 的机器 —— 照着绿灯去编 ESP32，等来的是一次
没人预告过的下载。要判断"这块板能不能编"，看 `platforms`，不是 `sdk`。

**`--network` 默认不开。** `diag doctor` 其余每一项都是离线且瞬时的，网络探测会真的发请求
（13 个域名，各 ~5s 超时），所以它是显式 opt-in。**该加的三种情况**：克隆 / `sdk env-pull` /
工具链下载失败时；云命令报网络错时；以及第一次排查"为什么卡住"时 ——
`tuyaopen-cli diag doctor --network --json` 的 `network.brokenCategories` 直接告诉你断的是哪一类
（`tuya` / `miniapp` / `git` / `npm`），比逐个 curl 快。平时不要加。

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

#### 怎么把「需要人做」这件事**说出来** —— 拿到 URL 只是一半

拿到了链接，还会在最后一步丢掉。2026-08-27 实测：agent 正确拿到了登录 URL，然后把它
**复述成了回复中间的一段散文**（"Please open this URL and sign in with your Tuya
account…"）。用户的原话是**容易忽略** —— 链接在对话里滚过去了，登录就停在那儿，而且
没有任何东西说明为什么停住。CLI 那侧已经加了边框和 ACTION REQUIRED 标记，但**决定这
东西长什么样的是你，不是 CLI**。

所以遇到上表四类动作中的任何一类：

- **单独成块，放在回复最前面。** 不要夹在解释、进度汇报或下一步计划中间。
- **URL / 授权码逐字照抄，独占一行。** 不要缩短、不要加 markdown 链接语法把它藏进文字里、
  不要"（链接见上）"。用户要能一眼选中它。
- **说清楚在等什么**：哪个进程在等、等多久超时、他做完之后你会怎么确认。
- **然后停下来。** 不要接着跑后面的步骤假装它已经完成了 —— 后面每一步都会以一种和根因
  无关的方式失败。

判据很简单：**用户扫一眼你的回复，能不能在一秒内找到他要点的那个东西。**

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
   tuyaopen-cli skills install --default --scope global --yes
   ```

**Read the bodies off disk regardless.** Whether or not your tool's own skill
loader picked them up, `cat <project>/.agents/skills/<id>/SKILL.md` always
works, and § 6.1 is the fallback path for exactly that.

**Also ask the CLI before assuming a capability is missing.** `<group> --help`
lists a group's whole surface in one round trip. Round 1 reported "there should
be a logout command that clears the local SK token" — `tuyaopen-cli credential
logout` already existed, and `credential --help` lists it on the third line.
`schema list --json` is the same answer for the entire CLI.

**`schema list` only answers half the contract** — how to phrase a call. What
comes *back* is `tuyaopen-cli schema envelope`: the envelope's fields, the
error categories with their declared subtypes, and the exit code each maps to.
Its content is derived from the same tables the CLI validates against at
runtime, so it cannot drift from what you will actually receive.

**Read `next_steps` before deciding what to do next.** Commands that change
what the caller should do next carry it on **success**, derived from the state
they just left behind — `project create` names `sdk clone` on a machine with no
SDK and `firmware build` on one that has it. In human mode it prints under
`next:` on stderr; under `--json` it is the `next_steps` array. It is not
decoration: it is the route, and it is correct for the machine you are on in a
way no document can be.

## Shortcuts — `tuyaopen-cli schema` / `tuyaopen-cli skills` / `tuyaopen-cli config` / `tuyaopen-cli diag`

| Intent | Command |
|---|---|
| Every command's contract / one command's flags | `tuyaopen-cli schema list` · `schema get --group <g> --command <c>` |
| **What comes back** — envelope fields, error categories + subtypes, exit codes | `tuyaopen-cli schema envelope` |
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

> Detailed CLI discovery, envelope, diagnostics, risk gate, self-discovery, fallback map, and project layout live in [references/CLI_AND_PROJECT_REFERENCE.md](references/CLI_AND_PROJECT_REFERENCE.md). Load only the section you need.

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
