---
name: tuya-iot-platform
description: >-
  Perform ALL operations on the Tuya Developer Platform (涂鸦开发者平台) using
  tuya-devplat-cli: create products (创建产品), get Product ID / PID (获取 PID),
  query and configure DPs / data points / 功能点, manage panels, and release products.
  Use this skill for any task that touches iot.tuya.com — do not make direct API calls.
compatibility:
  - TuyaOpen IDE extension installed and a TuyaOpen project open (IDE injects wrapper into PATH automatically)
  - Developer logged in via TuyaOpen IDE → Developer Platform sidebar (credentials written to ~/.tuya-devplat-cli/)
---

# Tuya IoT Platform Operations

You operate on the Tuya Developer Platform exclusively through `tuya-devplat-cli`.
Direct HTTP calls to the platform API are not allowed.

## How the CLI reaches you

When the TuyaOpen IDE opens a project it writes a wrapper at
`.tuyaopen/ide/bin/tuya-devplat-cli` and prepends that directory to the integrated
terminal's PATH. The wrapper sets `TUYA_DEVPLAT_CONFIG_PATH` automatically so the
CLI finds credentials without any extra env setup.

**Prerequisite:** the developer must log in once via the IDE sidebar
(TuyaOpen IDE → Developer Platform). After that, all CLI calls are authenticated
automatically — no manual env vars needed.

## Step 0: Check credentials

```bash
tuya-devplat-cli auth status --format json
```

If the command is not found, the project wrapper has not been generated yet — ask
the developer to open the project in TuyaOpen IDE and try again.

If auth status shows expired or missing credentials, ask the developer to sign in
via **TuyaOpen IDE → Developer Platform** sidebar.
Do not call `auth login` interactively — it requires a browser and human input.

## Golden rule: explore → dry-run → confirm

Unknown command? Run `schema get` first (free, no side effects):
```bash
tuya-devplat-cli schema get --group <group> --command <command>
```

Every write operation — preview first, then confirm with the returned token:
```bash
tuya-devplat-cli <group> <command> [flags] --dry-run --format json
tuya-devplat-cli <group> <command> [flags] --confirm <token> --format json
```

Read-only commands (`list`, `detail`, `dp-schema`, `dp-list`, `category-tree`,
`solution-list`, `auth status`) need no confirmation — run them freely.

## Risk levels

| Level | Meaning | Typical commands |
|-------|---------|-----------------|
| P0 | Permanently deletes a resource | `product delete` |
| P1 | Changes live/published state | `product release`, `update-status` |
| P2 | Modifies bindings or feature definitions | `panel bind`, `dp-add-*`, `dp-remove-*` |
| P3 | Updates configuration fields | `product update`, `dp-update` |

All four levels require `--dry-run` → inspect → `--confirm <token>`.

---

## Reference guides (read the relevant file when working on each area)

| Task | File |
|------|------|
| Create a product, get PID | `references/product-create.md` |
| Query or configure DPs (功能点) | `references/dp-operations.md` |
| List or search existing products | `references/product-search.md` |
| Read cached platform product snapshot in project | `references/platform-product-snapshot.md` |

Always use `--format json` for structured output. Limit large result sets with `--page-size`.
