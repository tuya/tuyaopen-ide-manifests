# manifest-gen CLI Design

**Date:** 2026-05-20  
**Scope:** Platform JSON generation & validation tool (`tools/manifest-gen/`)  
**Status:** Approved

---

## Problem

AI-assisted generation of platform variant JSON files (`platforms/<platformId>/<variantId>.json`) produces inconsistent output: missing required fields, wrong value types, wrong key ordering, and structural drift from the canonical template. A programmatic tool with hard-coded schema rules guarantees format correctness.

---

## Scope

- **Phase 1 (this spec):** Platform JSON only (`platforms/`)
- **Phase 2 (future):** Board JSON (`boards-and-chips/`) — architecture reserves extension slots

---

## Architecture

### Directory Structure

```
tools/
└── manifest-gen/
    ├── package.json             # name: manifest-gen, pure ESM
    ├── bin/
    │   └── manifest-gen.js      # CLI entry point, #!/usr/bin/env node
    └── src/
        ├── cli.js               # commander subcommand registration
        ├── generators/
        │   ├── registry.js      # peripheral module registry (extension point)
        │   ├── platform/
        │   │   ├── wizard.js    # top-level field prompts (inquirer)
        │   │   ├── builder.js   # assembles wizard answers into final JSON
        │   │   └── peripherals/ # one file per peripheral type (~18 modules)
        │   │       ├── gpio.js
        │   │       ├── uart.js
        │   │       ├── i2c.js
        │   │       ├── spi.js
        │   │       ├── qspi.js
        │   │       ├── pwm.js
        │   │       ├── adc.js
        │   │       ├── timer.js
        │   │       ├── wdt.js
        │   │       ├── rtc.js
        │   │       ├── flash.js
        │   │       ├── pinmux.js
        │   │       ├── dma2d.js
        │   │       ├── rgb.js
        │   │       ├── i8080.js
        │   │       ├── dvp.js
        │   │       ├── kws.js
        │   │       └── vad.js
        │   └── board/
        │       └── index.js     # stub — returns TODO notice
        ├── validators/
        │   ├── platform.js      # platform JSON field validation
        │   └── board.js         # stub
        └── schemas/
            ├── platform.js      # JS-object field rules (not JSON Schema)
            └── board.js         # stub
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `commander` | Subcommand parsing |
| `@inquirer/prompts` | Interactive prompts (ESM-native) |
| `chalk` | Terminal color output |
| `prettier` | JSON formatting — guarantees identical indentation/key order across all outputs |

**No `ajv`:** The `peripherals` structure varies too much per peripheral type. JS validator functions per module are more maintainable than a monolithic JSON Schema.

---

## CLI Subcommands

```bash
# Interactive wizard — generate new platform JSON from scratch
manifest-gen platform create

# Validate an existing platform JSON
manifest-gen platform validate <file>

# Validate + reformat an existing platform JSON
manifest-gen platform normalize <file> [--out <outfile>]
```

---

## `platform create` — Layered Wizard Flow

### Layer 1: Top-level fields (interactive)

| Field | Input type |
|-------|-----------|
| `platformId` | text |
| `id` (variantId) | text |
| `name` | text |
| `arch` | select: `xtensa-lx6` \| `xtensa-lx7` \| `risc-v` \| `arm-cortex-m33` |
| `flashInterface` | select: `qspi` \| `spi` |
| `connectivity` | checkbox: wifi / ble / ethernet / cellular (each prompts sub-fields) |
| `memory.*` | number inputs for sramBytes, romBytes, flashMaxBytes, psramMaxBytes, efuse |
| `kconfig.PLATFORM_CHOICE` | text |

### Layer 2: Peripheral selection

A checkbox list of all ~18 peripheral types. The user selects which ones this platform supports. Unselected peripherals do not appear in the output file.

### Layer 3: Output

- For each selected peripheral, call `scaffold()` from its module — produces a structurally correct skeleton with `0` / `null` / empty-array placeholders for numeric values the user fills later.
- `builder.js` assembles all sections using a fixed object literal order.
- Output formatted by `prettier` and written to `platforms/<platformId>/<variantId>.json`.

---

## `platform validate` — Error Reporting

Each peripheral module exports a `validate(data, path)` function returning an array of error strings. The platform validator calls each in turn and aggregates results.

Example output:
```
✔ schemaVersion: OK
✔ connectivity.wifi: OK
✗ peripherals.uart.spec.ports[0].pinGroups — expected array, got object
✗ peripherals.pwm.count — expected number, got string "12"
2 errors found.
```

---

## `platform normalize`

1. Run `validate` — abort with errors if any found.
2. Re-serialize with `prettier` (2-space indent, consistent key order via `builder.js`).
3. Write to `--out <file>` if specified, otherwise overwrite input file.

---

## Peripheral Module Contract

Every file under `src/generators/platform/peripherals/` exports:

```js
export const meta = {
  key: string,           // key in peripherals object
  label: string,         // wizard checkbox label
  enableMacro: string,
  tklHeader: string,
  idPrefix: string | null,
}

export function scaffold(): object   // returns skeleton with placeholders
export function validate(data: object, path: string): string[]  // returns error list
```

`registry.js` imports all modules and exports `peripheralModules[]` — the single place to add new peripheral types or future board peripheral modules.

---

## Extension Point for Board Support

Adding board JSON support requires:
1. Create `src/generators/board/wizard.js`, `builder.js`, `peripherals/`
2. Create `src/validators/board.js`
3. Register in `registry.js`
4. Add `manifest-gen board create|validate|normalize` subcommands in `cli.js`

No changes needed in platform code.

---

## Key Invariants

- **Key order** is enforced by `builder.js` assembling fixed object literals — not by sorting.
- **Formatting** is enforced by `prettier` — no manual JSON.stringify indentation.
- **Validation** is structural (types, required fields, array shapes) — not semantic (pin numbers are not checked against platform GPIO count).
