---
name: tuyaopen-embedded
description: >-
  Which `tuyaopen-cli` command group covers an embedded-side intent, and the
  preconditions every embedded command shares. The embedded domain is spread
  over more command groups than any other, so "which group do I even reach
  for" is a question on its own — this skill answers only that. It contains no
  task steps and no flag lists: flags come from `tuyaopen-cli schema get`, and how
  to actually do a job comes from the task skill the table points at.
  Use when you know what you want to accomplish on the device side but not
  which command group owns it, or when you want the shape of the embedded CLI
  as a whole. 嵌入式域的命令组决策表：知道要做什么、但不确定该用哪个命令组时
  查这里；也用于快速了解嵌入式 CLI 的全貌。不含任务步骤，不含 flag 清单。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-start` § 1
---

# TuyaOpen Embedded CLI Map

The embedded side of the `tuyaopen-cli` CLI is spread over more command groups
than the platform or miniapp sides are — those have three and one
respectively. That is not disorder: the jobs really are that distinct. But it
does mean an agent can know exactly what it wants and still not know which
group to open.

**This skill answers that one question.** It is a map, not a manual.

## What is deliberately not here

| Not here | Where it is | Why |
|---|---|---|
| Flags, defaults, argument shapes | `tuyaopen-cli schema get --group <g> --command <c>` | A hand-written flag list rots. This catalogue has been burned by transcribed numbers four separate times; `schema get` is generated from the command definitions and cannot drift |
| How to actually do the job | the task skill each row points at | One place per job, or the two copies disagree and the reader believes whichever they hit first |
| The `--json` envelope, exit codes, the P0/P2 confirmation gate | `tuyaopen-start` | Those are CLI-wide, not embedded-specific |
| Which *skill* handles an intent | `tuyaopen-start`'s `references/ROUTING.md` | That table maps intent → **skill**. This one maps intent → **command group**. Different questions, and mixing them produces two half-tables |

## Shortcuts — the decision table

Read the left column, take the group in the middle, then open the skill on the
right for how.

| Intent | Command | Then read |
|---|---|---|
| Set up or activate the SDK environment; clone or update the SDK | `tuyaopen-cli sdk clone` · `sdk env-init` · `sdk env-pull` · `sdk update` | `tuyaopen-embedded-env-setup` |
| Create a project; change platform / board; bind a product; read project metadata | `tuyaopen-cli project info` · `project create` · `project set-platform` · `project set-board` · `project bind-product` | `tuyaopen-embedded-project` |
| Browse the demo / example catalogue | `tuyaopen-cli demos list` · `demos detail` | `tuyaopen-embedded-project` |
| See which boards exist and what they carry | `tuyaopen-cli boards list` · `boards detail` | `tuyaopen-embedded-hardware` |
| Compile; clean the build tree | `tuyaopen-cli firmware build` · `firmware clean` | `tuyaopen-embedded-build` |
| Flash firmware; watch serial output; find the port | `tuyaopen-cli firmware flash` · `firmware monitor` · `tuyaopen-cli firmware list-ports` | `tuyaopen-embedded-flash` |
| Use a peripheral — display, camera, button, LED, I2C, UART, anything with a pin | `tuyaopen-cli hardware list-used` · `hardware board-context` · `hardware set-used` | `tuyaopen-embedded-hardware` |
| Get an authorization code onto the device (UUID / AuthKey / PID) | `tuyaopen-cli license list` · `license add` · `license import` · `tuyaopen-cli firmware authorize` · `firmware auth-status` | `tuyaopen-embedded-device-auth` |
| See what the **SDK itself** is made of — core + platform sub-SDKs, installed? current? | `tuyaopen-cli sdk platform` | `tuyaopen-embedded-env-setup` |
| Get a **third-party** library into the project — find it, install it, record it | `tuyaopen-cli dependency search` · `dependency install` · `dependency add` · `dependency list` · `dependency remove` | `tuyaopen-embedded-dependency` (opt-in — see below) |
| Find out why the environment or the CLI itself is wrong; produce a bug-report bundle | `tuyaopen-cli diag doctor` · `diag export` | `tuyaopen-start` |
| Drive the device over its serial CLI; capture logs in the background; decode a crash dump | `tuyaopen-cli firmware monitor` · `tuyaopen-cli firmware list-ports` | `tuyaopen-embedded-cli-debug` |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per `tuyaopen-start` § 1: it is
usually **not** on `PATH`.

### 第三方库那一行,和 SDK 自己那一行,是两件事

这是最容易混的一处 —— 两边都被人叫"库":

| 你要的 | 用 | 是什么 |
|---|---|---|
| **涂鸦给你的** —— SDK 本体和平台子 SDK 装了没、是不是最新 | `tuyaopen-cli sdk platform` | git 仓库,按 commit 固定,住在 workspace 的 SDK 目录下。就是 IDE 里「库 → TuyaOpen」那一栏 |
| **别人的** —— 找一个 PlatformIO 库、装进本工程、记进锁文件 | `tuyaopen-cli dependency …` | tarball,住在工程里,版本写进 `.tuyaopen/dependencies.lock.json`。就是 IDE 里「库 → 生态」那一栏 |

分界线是**这是谁的依赖**:`sdk` 管你拿来开发的那套 SDK,`dependency` 管你的工程额外用了谁的代码。

> 2026-08-24 之前这里有三个组(`library` / `ecosystem` / `dependency`)都在答"把库弄进工程",
> 而 `library` 组自己还同时装着"列平台子 SDK"这件不相干的事,其 `install` 又和
> `ecosystem install` 是同一个核心函数上的重复实现。三个组已合并,**旧拼法直接失效,没有别名**。

**注意 `dependency` 的五条命令没有一条会改 `CMakeLists.txt` 或 `Kconfig`** ——
让编译器真正看见这个库的最后一步没有命令,那是技能 `tuyaopen-embedded-dependency`
的职责(它在 `scenario` 组,按需装):

```bash
tuyaopen-cli skills install --ids tuyaopen-embedded-dependency
```

> 新装的技能不在当前会话的上下文里 —— 重新加载技能列表或开新会话再用。

## Preconditions every embedded command shares

Four things are true across the whole domain. They are stated once here rather
than repeated in each task skill.

1. **The SDK environment must be active** before anything except `sdk` and
   `diag`. Without it a build reports a missing toolchain rather than a missing
   environment, which sends readers looking in the wrong place. `tuyaopen-cli diag
   doctor` says whether it is active.
2. **`--project-root` defaults to the current working directory**, and almost
   every embedded command takes it. An agent that `cd`s between steps, or runs
   commands from a scratch directory, silently operates on "no project" — the
   error it gets back names the missing descriptor, not the wrong directory.
3. **Platform and board must be set before most commands mean anything.** A
   project with no board can be created and can hold DPs, but it cannot build,
   flash, or answer a hardware question. `tuyaopen-cli project info` shows both.
4. **A physical device is required for a subset, and its absence is not an
   error you can code around**: `firmware flash`, `firmware monitor`,
   `firmware authorize`, `firmware list-ports`. `firmware list-ports` returning an
   empty list means *no board is attached* — say so and stop, rather than
   guessing a port name. On a VM this is usually missing USB passthrough.

## `tos.py` — when the CLI does not cover it

Some embedded work still has no `tuyaopen-cli` command and goes through the SDK's
own `tos.py`: adding a board / BSP, interactive Kconfig (`menuconfig`), and the
LVGL host simulator's build configuration. Those are called out by the task
skill that owns them. `tuyaopen-start` § 7 holds the full coverage map — do
not reconstruct it here, and do not assume a missing command means a missing
capability.

## Not in scope

Platform-side work (products, DPs, credentials) → `tuyaopen-cloud`. Panel
miniapp work → `tuyaopen-miniapp`. Anything else, or an intent no row above
matches: see the routing table in skill `tuyaopen-start`.
