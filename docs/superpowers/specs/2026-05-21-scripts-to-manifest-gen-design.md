# Design: Migrate scripts/*.py into manifest-gen

**Date**: 2026-05-21
**Status**: Approved

## Goal

Convert `scripts/registry.py` and `scripts/skills-index.py` from Python to JavaScript and merge them into `tools/manifest-gen` as new command groups. The result is a single tool (`manifest-gen`) covering all data-maintenance operations for this repo, with no Python dependency required.

## Current State

```
scripts/
  registry.py       # manages registry.json  (list/get/set/add/remove/bump/touch)
  skills-index.py   # manages skills/index.json (list/get/add/remove/enable/disable/reorder/relate/unrelate/set/touch)

tools/manifest-gen/
  bin/manifest-gen.js
  src/
    cli.js          # commander entry; currently only registers `platform` command group
    commands/       # platform-create, platform-edit, platform-normalize, platform-show, platform-validate
    generators/     # platform peripheral generators
    validators/
  package.json      # deps: @inquirer/prompts, chalk, commander, prettier; devDeps: vitest
```

Both Python scripts duplicate the same two primitives: atomic JSON write (`writeFile(tmp) → rename`) and UTC timestamp generation.

## Target State

```
tools/manifest-gen/
  src/
    cli.js                    # registers platform + registry + skills command groups
    commands/
      platform-*.js           # unchanged
      registry.js             # all registry subcommands in one file
      skills.js               # all skills subcommands in one file
    utils/
      json-file.js            # loadJson(path), saveJson(path, data)  — atomic write
      semver.js               # bumpVersion(version, part)
    generators/               # unchanged
    validators/               # unchanged

scripts/                      # deleted entirely
```

## Command Interface

### registry group

Maps 1:1 to the current `registry.py` subcommands. No behaviour changes.

```
manifest-gen registry list
manifest-gen registry get <domain>
manifest-gen registry set <domain> <field> <value>
manifest-gen registry add <domain> <url> <version> <summary>
manifest-gen registry remove <domain>
manifest-gen registry bump <domain> [patch|minor|major]
manifest-gen registry touch
```

### skills group

Maps 1:1 to the current `skills-index.py` subcommands. No behaviour changes.

```
manifest-gen skills list [--surface embedded|cloud|miniapp]
manifest-gen skills get <id>
manifest-gen skills add <id> --surface <s> --order <n> --payload <p> [options]
manifest-gen skills remove <id> [<id2> ...]
manifest-gen skills enable <id> [<id2> ...]
manifest-gen skills disable <id> [<id2> ...]
manifest-gen skills reorder <id> <order>
manifest-gen skills relate <id> <related-id> [<related-id2> ...]
manifest-gen skills unrelate <id> <related-id> [<related-id2> ...]
manifest-gen skills set <id> <field> <value>
manifest-gen skills touch
```

`touch` commands remain independent: `registry touch` updates `registry.json.publishedAt`; `skills touch` updates `skills/index.json.publishedAt`. There is no combined shortcut.

## Shared Utilities

**`src/utils/json-file.js`**
- `loadJson(absPath)` — `fs.readFile` + `JSON.parse`
- `saveJson(absPath, data)` — write to `absPath + '.tmp'`, `fs.rename` into place, append `\n`; preserves `ensure_ascii=false` equivalent via default `JSON.stringify`

**`src/utils/semver.js`**
- `bumpVersion(version, part)` — splits on `.`, increments major/minor/patch, resets lower fields; throws on non-semver input

Both files are imported by `commands/registry.js` and `commands/skills.js`. The existing platform commands do not use atomic writes today and are not changed.

## File Paths

The JS commands resolve data files relative to `import.meta.url` (same approach as the Python scripts use `__file__`):

```js
// commands/registry.js
const REGISTRY_PATH = new URL('../../../registry.json', import.meta.url)

// commands/skills.js
const INDEX_PATH = new URL('../../../skills/index.json', import.meta.url)
```

This works correctly regardless of the working directory at invocation time.

## Migration

1. Implement `src/utils/json-file.js` and `src/utils/semver.js`
2. Implement `src/commands/registry.js` (all 7 subcommands)
3. Implement `src/commands/skills.js` (all 11 subcommands)
4. Register both groups in `src/cli.js`
5. Smoke-test each subcommand against the live JSON files
6. Delete `scripts/` directory
7. Update `README.md` if it references the Python scripts (currently it does not)

## Out of Scope

- Renaming `manifest-gen` to a broader name
- A combined `manifest-gen touch` shortcut
- Adding tests for the new commands (consistent with the existing test coverage posture)
- Any changes to the `platform` command group
