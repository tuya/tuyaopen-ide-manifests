---
name: tuyaopen-embedded-env-setup
description: >-
  Set up and activate the TuyaOpen development environment via `tuyaopen-cli sdk
  clone/doctor/env-init/env-pull/update` (headless, self-bootstrapping) or the
  shell-activation path (export.sh / tos.py), install system dependencies,
  and sync the manifest cache (`tuyaopen-cli manifests status/sync`). Use when the
  user mentions environment setup, activating the SDK, installing
  dependencies, export.sh, cloning the SDK, or when tos.py is not found.
  环境搭建、环境初始化、激活开发环境、安装依赖、tuyaopen-cli sdk clone/doctor/
  env-init/update、manifests sync、克隆 SDK。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1 (for `tuyaopen-cli sdk`/`manifests`)
  - Ubuntu/Debian with apt-get (or macOS/Windows equivalent)
  - Python >= 3.6
  - git >= 2.0, cmake >= 3.28, make >= 3.0, ninja >= 1.6
---

# TuyaOpen Environment Setup

Docs: <https://tuyaopen.ai/docs/quick-start/enviroment-setup>

## §0 别假设 SDK 在哪 —— 问 `diag doctor`

默认位置是 `~/TuyaOpenIDE/TuyaOpenSDK`，但**默认不等于事实**：用户可能改过
`tuyaopen.workspaceRoot`、可能已经有一份、也可能一份都没有。任务提示词里写的路径同样只是一句话。

```bash
tuyaopen-cli diag doctor --json     # → .data.sdk （根路径、是否就绪、env 是否冷启动）
```

- **已存在且就绪** → 直接用，别重新克隆。
- **已存在但环境没初始化** → `tuyaopen-cli sdk env-init`。
- **不存在** → 克隆是**十几 GB、几十分钟**的动作。**先告诉用户要下什么、多大、大概多久**，
  得到确认再 `tuyaopen-cli sdk clone`。不要静默开始一个会占满磁盘的下载。

### §0.1 `sdk` 就绪 ≠ 你的目标平台就绪 —— 看 `platforms` 块

同一条 `diag doctor` 还有一个 `.data.platforms`，它回答的是**另一个问题**：

```json
{ "status": "partial", "declared": ["T2","T3","LINUX","T5AI","ESP32","LN882H","BK7231X","GD32"],
  "installed": ["LINUX","T5AI"], "missing": ["T2","T3","ESP32","LN882H","BK7231X","GD32"],
  "toolchains": ["gcc-arm-none-eabi-10.3-2021.10"] }
```

`sdk` 的三个布尔说的是**核心 clone**；平台子 SDK 和它的交叉工具链是分开下载的。上面这台机器
`sdk` 三项全绿，却有 6 个平台没 checkout —— 去编 ESP32 会先克隆子 SDK、再下一份工具链
（T5AI 那份实测 149.8 MB）。

**所以在 `firmware build` 之前**：如果目标板在 `missing` 里，跟克隆 SDK 一样的规矩 ——
**先说要下什么、多大**，再动手。别让"环境检查全绿"变成用户眼里的一次静默长下载。
逐平台的详细状态（含 commit 是否对得上）用 `tuyaopen-cli sdk platform --json`。

其余环境事实（串口、登录、授权码）见 skill `tuyaopen-shared` § 0.0 的表；
什么时候该加 `--network` 见同一节。

## Shortcuts — `tuyaopen-cli sdk` / `tuyaopen-cli manifests` (headless, no shell activation needed)

| Intent | Command |
|---|---|
| Diagnose: is the SDK installed? Is the Python env bootstrapped? Is `tos.py` present? | `tuyaopen-cli diag doctor --sdk-root <path>` |
| Clone the SDK | `tuyaopen-cli sdk clone --sdk-root <path>` |
| Bootstrap the SDK's Python venv | `tuyaopen-cli sdk env-init --sdk-root <path>` |
| Fast-forward the on-disk SDK clone (`git pull --ff-only`) | `tuyaopen-cli sdk update --sdk-root <path>` |
| Local manifest cache (boards/demos/skills) status | `tuyaopen-cli manifests status` |
| Download the latest manifest registry into the local cache | `tuyaopen-cli manifests sync` |

> **No CLI?** `sdk clone` → `git clone` the SDK by hand; `sdk env-init` →
> the shell-activation path below (`export.sh`/`.ps1`/`.bat`) bootstraps the
> same venv; `sdk update` → `git pull --ff-only` in the SDK clone. `manifests
> status`/`sync` have no older-tool equivalent — there was no local manifest
> cache before this CLI. See skill `tuyaopen-shared` § 7.

All five `sdk` subcommands are risk tier **P3** — mutating (`clone`,
`env-init`, `env-pull`, `update`), but no `--dry-run`/`--confirm`/`--yes` gate
applies (see skill `tuyaopen-shared` § 4). `manifests sync` is **P2** — needs
`--yes`, or `--dry-run` to preview.

Two things worth knowing before you reach for these, verified against
`src/cli/commands/sdk.ts`:

- **`sdk env-pull` and `sdk env-init` run the identical bootstrap** (both call
  the same `initializeSdkEnv()`) — `env-init` additionally supports
  `--stream` for ndjson progress. Prefer `env-init`; `env-pull` is kept only
  because the CLI's command schema is add-only (skill `tuyaopen-shared` § 5).
- **`sdk update` is not the same operation as `tos.py update`.** `sdk update`
  runs `git pull --ff-only` on the SDK clone itself; `tos.py update`
  fast-forwards each **platform submodule** to the commit pinned in
  `platform/platform_config.yaml` (see § *Updating Dependencies* below). Run
  `tos.py update` after either — a fresh SDK clone/pull can leave platform
  submodules behind.

`tuyaopen-cli firmware build/clean` (skill `tuyaopen-embedded-build`) self-bootstraps the
SDK env via the same path as `sdk env-init` — you don't need to run any of the
above before it. Reach for `diag doctor`/`sdk clone`/`sdk env-init` directly
when you're setting up headlessly (CI, an agent with no shell activation) or
diagnosing why the self-bootstrap isn't finding an SDK. Full flags (`--mirror`,
`--stream`): `tuyaopen-cli sdk --help` / `tuyaopen-cli schema get --group sdk
--command <cmd>` — don't hardcode the flag list here (skill `tuyaopen-shared`
§ 5).

**Everything below this point is the shell-activation path** (`export.sh` +
`tos.py`) — still the only way to get an interactive terminal with `tos.py`
on `PATH`, and still what `tos.py version`/`tos.py check` and the system
dependency install step below need.

## Step 0: Check if already activated (do this first)

| Variable | Set by activation | Meaning |
|----------|------------------|---------|
| `$OPEN_SDK_ROOT` | yes | SDK root path |
| `$OPEN_SDK_PYTHON` | yes | venv Python executable |
| `$VIRTUAL_ENV` | yes | active venv path |

**Linux / macOS:**
```bash
if [ -n "$OPEN_SDK_ROOT" ] && [ -n "$VIRTUAL_ENV" ]; then
    echo "Already activated"
else
    cd "$(git rev-parse --show-toplevel)" && . ./export.sh
fi
```

**Windows PowerShell:**
```powershell
if ($env:OPEN_SDK_ROOT -and $env:VIRTUAL_ENV) {
    Write-Host "Already activated"
} else {
    Set-Location (git rev-parse --show-toplevel); . .\export.ps1
}
```

**Windows CMD:**
```batch
if defined OPEN_SDK_ROOT if defined VIRTUAL_ENV (echo Already activated) else (
    for /f "delims=" %%i in ('git rev-parse --show-toplevel') do cd /d "%%i"
    call export.bat
)
```

## Step 1: Install system dependencies

**Ubuntu / Debian:**
```bash
sudo apt-get install lcov cmake-curses-gui build-essential ninja-build \
    wget git python3 python3-pip python3-venv libc6-i386 libsystemd-dev
```

macOS / Windows: see official docs linked above.

## Step 2: Activate

Run once per terminal session from the SDK root:

```bash
. ./export.sh      # Linux / macOS
.\export.ps1       # Windows PowerShell
export.bat         # Windows CMD
```

After activation: `$OPEN_SDK_ROOT`, `$OPEN_SDK_PYTHON`, `$OPEN_SDK_PIP` are set; SDK root is in `PATH`.

## Step 3: Verify

```bash
tuyaopen-cli diag doctor --json
```

Read `sdk.envReady` / `sdk.tosPresent`, and the `status` field of each of
`git`, `python`, `cmake`, `ninja`, `uv`. This replaces the three
`check_env.{sh,ps1,bat}` scripts (deleted 2026-08-18) — `diag doctor` covers
every one of the 7 checks they ran, and maintaining three per-OS copies of
the same script was pure overhead.

`tos.py check` does one thing `diag doctor` doesn't: it runs `git submodule
update --init` as a side effect. Run it too when submodules might be stale:

```bash
tos.py version    # e.g. v1.3.0-23-g6bcb5aa
tos.py check      # validates tool versions + runs git submodule update --init
```

> **No CLI?** Check by hand: `tos.py` is on `PATH`, `$OPEN_SDK_ROOT` is set,
> and `git` / `python3` / `cmake` / `ninja` all run.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `python3-venv` missing | `sudo apt-get install python3-venv` |
| Activation fails, `.venv/` exists | `rm -rf .venv/ && . ./export.sh` |
| `tos.py: command not found` | Re-run `. ./export.sh` |
| Submodule download fails | `git submodule update --init` |
| `[Unknown version]` | No git tags — harmless |
| `tuyaopen-cli diag doctor` reports `envReady: false` | Python venv not bootstrapped | `tuyaopen-cli sdk env-init --sdk-root <path>` |
| `tuyaopen-cli sdk clone` fails with `env_exists` | An SDK is already at that `--sdk-root` | Remove it first, or pass a different `--sdk-root` |
| `tuyaopen-cli manifests status`/`demos list`/`boards list` fail with `config:no_manifest_cache` | Local manifest cache never synced | `tuyaopen-cli manifests sync` |

## Not in scope

Anything past environment activation / SDK bootstrap / manifest sync — not
in scope here, see skill `tuyaopen-shared`'s routing table
(`references/ROUTING.md`).
