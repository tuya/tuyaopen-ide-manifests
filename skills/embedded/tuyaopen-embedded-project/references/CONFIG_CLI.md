# Non-Interactive `tos.py config` (get / set / list / diff)

Detailed reference for the non-interactive config subcommands.

> **Availability:** these subcommands exist only on newer SDKs. **Detect them; do not
> assume them, and do not infer them from a version number** — see
> [Capability Probe](#capability-probe). Where they are absent, fall back to
> hand-editing `app_default.config` + `tos.py clean -f`.

## Capability Probe

Ask the installed SDK what it supports. Probe **before** planning a config change and
commit to that branch — do not run the new command and parse its failure.

**Runtime probe** (authoritative — needs an activated env and a project directory,
since `tos.py config` calls `check_proj_dir()` before dispatching):

```bash
tos.py config -h        # the subcommand list IS the answer
```

| Subcommands listed | Meaning |
|--------------------|---------|
| `choice`, `menu`, `save` only | older generation — use the hand-edit fallback |
| plus `set`, `get`, `list`, `diff` | everything in this document applies |

Individual flags can be confirmed the same way, e.g. `tos.py config save -h` for `-n`.

**Offline probe** (no env activation, no project directory needed):

```bash
test -f "$OPEN_SDK_ROOT/tools/cli_command/util_kconfig.py"          # bash
Test-Path "$env:OPEN_SDK_ROOT/tools/cli_command/util_kconfig.py"    # PowerShell
```

`util_kconfig.py` is the module that ships with these subcommands, so its presence
tracks the feature exactly.

**Do not gate on `tos.py version`.** It prints a `git describe` string such as
`v1.9.0-17-g13a1d0de` — the tag is whatever release preceded the checkout, so an SDK
that has these subcommands and one that doesn't can report the same tag. Nothing in
the version string distinguishes them; only feature detection does.

## Why prefer `config set` over hand-editing

Hand-editing `app_default.config` bypasses kconfiglib entirely:

- `choice` symbols are not made mutually exclusive — you can end up with two
  boards selected at once.
- Derived symbols (`CONFIG_PLATFORM_CHOICE`, `CONFIG_CHIP_CHOICE`) are not
  re-derived from the board you picked.
- On a warm build tree the generated `.build/cache/using.cmake` and
  `.build/include/tuya_kconfig.h` stay stale, because
  `tools/kconfiglib/CMakeLists.txt` only regenerates them when they are absent.

`config set` drives the real Kconfig tree, then re-derives `using.config` from
`app_default.config` and invalidates the derived artifacts — so no manual
`tos.py clean -f` is needed for an ordinary option change.

## `tos.py config set`

```bash
tos.py config set CONFIG_NAME=VALUE ...
```

The `CONFIG_` prefix is optional in **every** subcommand — `ENABLE_LIBLVGL=y` and
`CONFIG_ENABLE_LIBLVGL=y` are equivalent.

| Option | Meaning |
|--------|---------|
| `-u, --unset NAME` | Revert a symbol to its Kconfig default. Repeatable. |
| `--no-save` | Only update `.build/cache/using.config`; leave `app_default.config` untouched. The change is lost on the next clean. |
| `-k, --keep-build` | Do not invalidate the generated build artifacts. |

Examples:

```bash
tos.py config set ENABLE_LIBLVGL=y ENABLE_MBEDTLS_SSL_MAX_CONTENT_LEN=8192
tos.py config set PROJECT_VERSION='"1.0.1"'      # string symbols keep their quotes
tos.py config set -u ENABLE_LIBLVGL              # back to the Kconfig default
tos.py config set -- SOME_INT=-1                 # use -- before a value starting with -
```

### Semantics worth knowing

- **All-or-nothing.** Every token is parsed and every assignment validated before
  anything is written. If any assignment fails, the command exits non-zero and
  writes nothing — there is no half-applied state to clean up.
- **Unsets are applied before assignments.** Passing both `-u X` and `X=y` leaves
  `X=y`.
- **Dependency-aware.** An assignment that is blocked by `depends on` /
  visibility fails with a reason instead of being silently written. Inspect with
  `tos.py config get -a NAME`.
- **Platform/board identity changes trigger a full clean.** If the write changes
  `CONFIG_PLATFORM_CHOICE` / `CONFIG_CHIP_CHOICE` / the board, `config set` warns,
  runs the full clean, and re-initialises `using.config`. Existing values are
  carried over, which is rarely what you want for a board switch — prefer
  `tos.py config choice -c <name>` for that.
- **`--no-save` is rejected on an identity change**, because the full clean that
  the switch requires would rebuild `using.config` from the untouched
  `app_default.config` and silently discard the change.
- With `-k` on an identity change, the command warns and leaves you to run
  `tos.py clean -f` yourself.

## `tos.py config get`

```bash
tos.py config get NAME ...
```

| Option | Meaning |
|--------|---------|
| `-a, --all` | Show type, prompt, visibility and dependencies instead of just the value. |
| `-j, --json` | Emit JSON. |

- One name → the bare value on stdout. Multiple names → `CONFIG_NAME=value` lines.
- Values go to **stdout**, diagnostics to **stderr**, so `-j` output can be piped
  straight into a parser.
- Exits `1` if any name is an unknown symbol (the known ones are still printed,
  and appear as `null` in JSON).

```bash
tos.py config get ENABLE_WIFI
tos.py config get -a ENABLE_LIBLVGL        # why can't I enable this?
tos.py config get -j ENABLE_WIFI ENABLE_BLUETOOTH
```

## `tos.py config list`

```bash
tos.py config list                # whole effective config
tos.py config list -p MBEDTLS     # substring filter
tos.py config list -p 'ENABLE_*'  # glob filter (used when the pattern has * ? [ .)
tos.py config list -j             # JSON, for scripts
```

Read-only dump of the effective config, read through kconfiglib — so disabled
symbols appear as `# CONFIG_X is not set` rather than being missing. Warns (but
still exits `0`) when a pattern matches nothing.

## `tos.py config diff`

```bash
tos.py config diff TUYA_T5AI_EVB              # saved config vs current app_default.config
tos.py config diff TUYA_T5AI_EVB TUYA_T5AI_CORE
tos.py config diff TUYA_T5AI_EVB -j
```

`CONFIG_A` / `CONFIG_B` are config **names** (resolved against the project
`config/` dir and every board config dir) or paths. `CONFIG_B` defaults to the
current `app_default.config`.

Both sides are expanded through Kconfig before comparison, so two minimal
defconfigs that resolve to the same effective config compare as equal — this is a
semantic diff, not a text diff.

## `tos.py config save`

```bash
tos.py config save                 # interactive — prompts for a name (unchanged)
tos.py config save -n my_board     # non-interactive
tos.py config save -n my_board -f  # overwrite an existing preset
```

- `-n NAME` skips the prompt. `.config` is appended if omitted.
- Without `-n` and without a TTY, the command now **fails with a clear message**
  instead of hanging or aborting.
- The overwrite guard is scoped to `-n`: with `-n` and no `-f`, an existing file
  is an error; the interactive flow behaves exactly as before.

## `tos.py config choice`

Already non-interactive with `-c`, and gained `-l`:

```bash
tos.py config choice -l            # list available config names, then exit
tos.py config choice -c TUYA_T5AI_EVB
tos.py config choice -d -c TUYA_T5AI_EVB
```

`-l` prints the names and exits **without** cleaning, so it is safe to call
before deciding. `-c` still triggers a full clean, which is what makes it the
right way to switch boards.

## Agent / CI recipes

Change one option on the current board:

```bash
tos.py config set ENABLE_LIBLVGL=y
tos.py build
```

Switch board, then customise:

```bash
tos.py config choice -c TUYA_T5AI_EVB      # full clean + fresh board config
tos.py config set ENABLE_LIBLVGL=y
tos.py build
```

Inspect before changing:

```bash
tos.py config get -a ENABLE_LIBLVGL        # is it even selectable here?
tos.py config list -p LVGL
```

Fallback for an SDK without these subcommands:

```bash
# edit app_default.config by hand, then
tos.py clean -f
tos.py build
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error: No such command 'set'` | This SDK does not have the feature | Probe with `tos.py config -h` first; use the hand-edit + `tos.py clean -f` fallback |
| `NAME: unknown symbol` | Typo, or the symbol belongs to a platform that is not selected | `tos.py config list -p <fragment>` to find the real name |
| Assignment fails with a dependency reason | `depends on` / visibility blocks it | `tos.py config get -a NAME`, enable the parent first, or set both in one `config set` |
| `--no-save cannot express that` | The batch changed platform/board identity | Drop `--no-save`, or use `tos.py config choice` |
| Change applied but build unaffected | `--no-save` used, or `-k` after an identity change | Re-run without `--no-save`; after an identity change run `tos.py clean -f` |
| `[...] exists, use -f to overwrite` | `config save -n` guard | Add `-f`, or pick another name |
| `Not a TTY: pass the name with -n NAME` | `config save` without `-n` in CI | Pass `-n NAME` |
