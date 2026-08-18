---
name: tuyaopen-env-setup
description: >-
  Set up and activate the TuyaOpen development environment via `tuyaopen sdk
  clone/doctor/env-init/env-pull/update` (headless, self-bootstrapping) or the
  shell-activation path (export.sh / tos.py), install system dependencies,
  and sync the manifest cache (`tuyaopen manifests status/sync`). Use when the
  user mentions environment setup, activating the SDK, installing
  dependencies, export.sh, cloning the SDK, or when tos.py is not found.
  环境搭建、环境初始化、激活开发环境、安装依赖、tuyaopen sdk clone/doctor/
  env-init/update、manifests sync、克隆 SDK。
license: Apache-2.0
compatibility:
  - tuyaopen CLI, either form — see skill `tuyaopen-shared` § 1 (for `tuyaopen sdk`/`manifests`)
  - Ubuntu/Debian with apt-get (or macOS/Windows equivalent)
  - Python >= 3.6
  - git >= 2.0, cmake >= 3.28, make >= 3.0, ninja >= 1.6
---

# TuyaOpen Environment Setup

Docs: <https://tuyaopen.ai/docs/quick-start/enviroment-setup>

## Shortcuts — `tuyaopen sdk` / `tuyaopen manifests` (headless, no shell activation needed)

| Intent | Command |
|---|---|
| Diagnose: is the SDK installed? Is the Python env bootstrapped? Is `tos.py` present? | `tuyaopen sdk doctor --sdk-root <path>` |
| Clone the SDK | `tuyaopen sdk clone --sdk-root <path>` |
| Bootstrap the SDK's Python venv | `tuyaopen sdk env-init --sdk-root <path>` |
| Fast-forward the on-disk SDK clone (`git pull --ff-only`) | `tuyaopen sdk update --sdk-root <path>` |
| Local manifest cache (boards/demos/skills) status | `tuyaopen manifests status` |
| Download the latest manifest registry into the local cache | `tuyaopen manifests sync` |

> **No CLI?** `sdk clone` → `git clone` the SDK by hand; `sdk env-init` →
> the shell-activation path below (`export.sh`/`.ps1`/`.bat`) bootstraps the
> same venv; `sdk update` → `git pull --ff-only` in the SDK clone. `manifests
> status`/`sync` have no older-tool equivalent — there was no local manifest
> cache before this CLI. See skill `tuyaopen-shared` § 7.

All five `sdk` subcommands are risk tier **P3** — mutating (`clone`,
`env-init`, `env-pull`, `update`), but no `--dry-run`/`--confirm`/`--yes` gate
applies (see skill `tuyaopen-shared` § 4). `manifests sync` is **P2** — needs
`--yes` + `TUYAOPEN_AUTOCONFIRM_P2=1`, or `--dry-run` to preview.

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

`tuyaopen firmware build/clean` (skill `tuyaopen-build`) self-bootstraps the
SDK env via the same path as `sdk env-init` — you don't need to run any of the
above before it. Reach for `sdk doctor`/`sdk clone`/`sdk env-init` directly
when you're setting up headlessly (CI, an agent with no shell activation) or
diagnosing why the self-bootstrap isn't finding an SDK. Full flags (`--mirror`,
`--stream`): `tuyaopen sdk --help` / `tuyaopen schema get --group sdk
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
tuyaopen diag doctor --json
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
| `tuyaopen sdk doctor` reports `envReady: false` | Python venv not bootstrapped | `tuyaopen sdk env-init --sdk-root <path>` |
| `tuyaopen sdk clone` fails with `env_exists` | An SDK is already at that `--sdk-root` | Remove it first, or pass a different `--sdk-root` |
| `tuyaopen manifests status`/`demos list`/`boards list` fail with `config:no_manifest_cache` | Local manifest cache never synced | `tuyaopen manifests sync` |

## Not in scope

Anything past environment activation / SDK bootstrap / manifest sync — not
in scope here, see skill `tuyaopen-shared`'s routing table
(`references/ROUTING.md`).
