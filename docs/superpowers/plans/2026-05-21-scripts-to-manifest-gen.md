# Migrate scripts/*.py to manifest-gen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `scripts/registry.py` and `scripts/skills-index.py` to JavaScript and register them as `registry` and `skills` command groups inside `tools/manifest-gen`, then delete the `scripts/` directory.

**Architecture:** Two new command modules (`src/commands/registry.js` and `src/commands/skills.js`) share two utility modules (`src/utils/json-file.js` and `src/utils/semver.js`). Both command modules are registered as top-level command groups in the existing `src/cli.js`. File paths are resolved via `import.meta.url` so the tool works regardless of working directory.

**Tech Stack:** Node.js ESM, commander.js (already a dependency), no new npm dependencies.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `tools/manifest-gen/src/utils/json-file.js` | `loadJson` / `saveJson` (atomic write) |
| Create | `tools/manifest-gen/src/utils/semver.js` | `bumpVersion(version, part)` |
| Create | `tools/manifest-gen/src/commands/registry.js` | All 7 `registry` subcommands |
| Create | `tools/manifest-gen/src/commands/skills.js` | All 11 `skills` subcommands |
| Modify | `tools/manifest-gen/src/cli.js` | Import + register `registry` and `skills` groups |
| Delete | `scripts/registry.py` | Replaced by `manifest-gen registry` |
| Delete | `scripts/skills-index.py` | Replaced by `manifest-gen skills` |

All git commands run from the repo root (`vendor/tuyaopen-ide-manifests/`).

---

### Task 1: Shared utilities

**Files:**
- Create: `tools/manifest-gen/src/utils/json-file.js`
- Create: `tools/manifest-gen/src/utils/semver.js`

- [ ] **Step 1: Create `tools/manifest-gen/src/utils/json-file.js`**

```js
import { promises as fs } from 'fs'

export async function loadJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8')
  return JSON.parse(text)
}

export async function saveJson(filePath, data) {
  const tmp = filePath + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  await fs.rename(tmp, filePath)
}
```

- [ ] **Step 2: Create `tools/manifest-gen/src/utils/semver.js`**

```js
export function bumpVersion(version, part = 'patch') {
  const parts = version.split('.')
  if (parts.length !== 3) throw new Error(`Invalid semver: ${version}`)
  let [major, minor, patch] = parts.map(Number)
  if (part === 'major') { major++; minor = 0; patch = 0 }
  else if (part === 'minor') { minor++; patch = 0 }
  else { patch++ }
  return `${major}.${minor}.${patch}`
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/manifest-gen/src/utils/json-file.js tools/manifest-gen/src/utils/semver.js
git commit -m "feat(manifest-gen): add shared json-file and semver utilities"
```

---

### Task 2: registry command group

**Files:**
- Create: `tools/manifest-gen/src/commands/registry.js`

`REGISTRY_PATH` resolves to `registry.json` at the repo root via `import.meta.url` (three levels up from `src/commands/`).

- [ ] **Step 1: Create `tools/manifest-gen/src/commands/registry.js`**

```js
import { fileURLToPath } from 'url'
import { loadJson, saveJson } from '../utils/json-file.js'
import { bumpVersion } from '../utils/semver.js'

const REGISTRY_PATH = fileURLToPath(new URL('../../../registry.json', import.meta.url))

async function load() { return loadJson(REGISTRY_PATH) }
async function save(data) { return saveJson(REGISTRY_PATH, data) }

export function registerRegistryCommands(program) {
  const grp = program.command('registry').description('管理 registry.json')

  grp
    .command('list')
    .description('列出所有 manifest 域')
    .action(async () => {
      const data = await load()
      const manifests = data.manifests ?? {}
      console.log(`registry: ${data.name}  publishedAt=${data.publishedAt}`)
      console.log(`${Object.keys(manifests).length} manifests in ${REGISTRY_PATH}:`)
      for (const [domain, entry] of Object.entries(manifests)) {
        console.log(`  ${domain.padEnd(20)} v${(entry.version ?? '?').padEnd(10)} ${entry.summary ?? ''}`)
      }
    })

  grp
    .command('get <domain>')
    .description('打印某个 manifest 域的 JSON')
    .action(async (domain) => {
      const data = await load()
      const entry = (data.manifests ?? {})[domain]
      if (!entry) { console.error(`Not found: ${domain}`); process.exit(1) }
      console.log(JSON.stringify(entry, null, 2))
    })

  grp
    .command('set <domain> <field> <value>')
    .description('设置某字段（value 按 JSON 解析，失败则视为字符串）')
    .action(async (domain, field, rawValue) => {
      const data = await load()
      const manifests = data.manifests ?? {}
      if (!manifests[domain]) { console.error(`Not found: ${domain}`); process.exit(1) }
      let value
      try { value = JSON.parse(rawValue) } catch { value = rawValue }
      const before = manifests[domain][field]
      manifests[domain][field] = value
      await save(data)
      console.log(`${domain}.${field}: ${JSON.stringify(before)} → ${JSON.stringify(value)}`)
    })

  grp
    .command('add <domain> <url> <version> <summary>')
    .description('新增 manifest 域')
    .action(async (domain, url, version, summary) => {
      const data = await load()
      data.manifests ??= {}
      if (data.manifests[domain]) { console.error(`Already exists: ${domain}`); process.exit(1) }
      data.manifests[domain] = { url, version, summary }
      await save(data)
      console.log(`Added: ${domain}`)
    })

  grp
    .command('remove <domain>')
    .description('删除 manifest 域')
    .action(async (domain) => {
      const data = await load()
      const manifests = data.manifests ?? {}
      if (!manifests[domain]) { console.error(`Not found: ${domain}`); process.exit(1) }
      delete manifests[domain]
      await save(data)
      console.log(`Removed: ${domain}`)
    })

  grp
    .command('bump <domain> [part]')
    .description('升级版本号 (part: patch|minor|major，默认 patch)')
    .action(async (domain, part = 'patch') => {
      const data = await load()
      const manifests = data.manifests ?? {}
      if (!manifests[domain]) { console.error(`Not found: ${domain}`); process.exit(1) }
      const before = manifests[domain].version
      const after = bumpVersion(before, part)
      manifests[domain].version = after
      await save(data)
      console.log(`${domain}.version: ${before} → ${after}`)
    })

  grp
    .command('touch')
    .description('更新 publishedAt 为当前 UTC 时间')
    .action(async () => {
      const data = await load()
      const before = data.publishedAt
      const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
      data.publishedAt = now
      await save(data)
      console.log(`publishedAt: ${before} → ${now}`)
    })
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/manifest-gen/src/commands/registry.js
git commit -m "feat(manifest-gen): add registry command group"
```

---

### Task 3: skills command group

**Files:**
- Create: `tools/manifest-gen/src/commands/skills.js`

`INDEX_PATH` resolves to `skills/index.json` at the repo root. `skills/index.json` is an object with a top-level `items` array; `getItems` / `setItems` abstract the data shape. `setEnabled` is defined at module scope so both `enable` and `disable` actions can share it.

- [ ] **Step 1: Create `tools/manifest-gen/src/commands/skills.js`**

```js
import { fileURLToPath } from 'url'
import { loadJson, saveJson } from '../utils/json-file.js'

const INDEX_PATH = fileURLToPath(new URL('../../../skills/index.json', import.meta.url))

async function load() { return loadJson(INDEX_PATH) }
async function save(data) { return saveJson(INDEX_PATH, data) }

function getItems(data) {
  return Array.isArray(data) ? data : (data.items ?? [])
}

function setItems(data, items) {
  if (Array.isArray(data)) { data.length = 0; data.push(...items) }
  else data.items = items
}

function findSkill(items, id) {
  const idx = items.findIndex(s => s.id === id)
  return [idx, idx >= 0 ? items[idx] : null]
}

function requireSkill(items, id) {
  const [idx, skill] = findSkill(items, id)
  if (!skill) { console.error(`Not found: ${id}`); process.exit(1) }
  return [idx, skill]
}

async function setEnabled(ids, value) {
  const data = await load()
  const items = getItems(data)
  const changed = []
  for (const id of ids) {
    const [, skill] = requireSkill(items, id)
    if (skill.defaultEnabled !== value) { skill.defaultEnabled = value; changed.push(id) }
  }
  if (changed.length) {
    await save(data)
    console.log(`${value ? 'enabled' : 'disabled'}: ${changed.join(', ')}`)
  } else {
    console.log('No changes (already in target state)')
  }
}

export function registerSkillsCommands(program) {
  const grp = program.command('skills').description('管理 skills/index.json')

  grp
    .command('list')
    .description('列出所有技能')
    .option('--surface <surface>', '过滤 surface (embedded|cloud|miniapp)')
    .action(async (opts) => {
      const data = await load()
      let items = getItems(data)
      if (opts.surface) items = items.filter(s => s.surface === opts.surface)
      const published = Array.isArray(data) ? '' : (data.publishedAt ?? '')
      console.log(`publishedAt=${published}  (${items.length} skills)`)
      for (const s of [...items].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))) {
        const enabled = String(s.defaultEnabled ?? false)
        const nameEn = typeof s.name === 'object' ? (s.name.en ?? '') : ''
        console.log(`  ${String(s.order ?? '').padStart(3)}  ${s.id.padEnd(40)} [${(s.surface ?? '').padEnd(8)}] defaultEnabled=${enabled.padEnd(5)}  ${nameEn}`)
      }
    })

  grp
    .command('get <id>')
    .description('打印某个技能的 JSON')
    .action(async (id) => {
      const data = await load()
      const [, skill] = requireSkill(getItems(data), id)
      console.log(JSON.stringify(skill, null, 2))
    })

  grp
    .command('add <id>')
    .description('新增技能条目')
    .requiredOption('--surface <surface>', 'surface (embedded|cloud|miniapp)')
    .requiredOption('--order <n>', 'display order', Number)
    .requiredOption('--payload <path>', 'installPayload 路径')
    .option('--name-en <text>', '')
    .option('--name-zh <text>', '')
    .option('--summary-en <text>', '')
    .option('--summary-zh <text>', '')
    .option('--when-en <text>', '')
    .option('--when-zh <text>', '')
    .option('--tags <tags...>', '')
    .option('--commands <cmds...>', '')
    .option('--enabled', '设为 defaultEnabled=true', false)
    .option('--local-path <path>', '')
    .option('--repo <repo>', '')
    .option('--subpath <subpath>', '')
    .option('--ref <ref>', '', 'master')
    .action(async (id, opts) => {
      const data = await load()
      const items = getItems(data)
      if (items.some(s => s.id === id)) { console.error(`Already exists: ${id}`); process.exit(1) }
      const entry = { id, order: opts.order }
      if (opts.nameEn || opts.nameZh) entry.name = { en: opts.nameEn || id, 'zh-CN': opts.nameZh || id }
      entry.surface = opts.surface
      if (opts.summaryEn || opts.summaryZh) entry.summary = { en: opts.summaryEn || '', 'zh-CN': opts.summaryZh || '' }
      if (opts.whenEn || opts.whenZh) entry.whenToUse = { en: opts.whenEn || '', 'zh-CN': opts.whenZh || '' }
      if (opts.tags?.length) entry.tags = opts.tags
      if (opts.commands?.length) entry.commands = opts.commands
      entry.defaultEnabled = opts.enabled
      entry.installPayload = opts.payload
      if (opts.localPath) entry.source = { localPath: opts.localPath }
      else if (opts.repo) entry.source = { repo: opts.repo, subpath: opts.subpath || '', ref: opts.ref }
      items.push(entry)
      items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
      setItems(data, items)
      await save(data)
      console.log(`Added: ${id}  (order=${opts.order}, surface=${opts.surface})`)
    })

  grp
    .command('remove <ids...>')
    .description('删除技能（可多个 id）')
    .action(async (ids) => {
      const data = await load()
      const items = getItems(data)
      const toRemove = new Set(ids)
      const removed = ids.filter(id => items.some(s => s.id === id))
      const notFound = ids.filter(id => !items.some(s => s.id === id))
      const remaining = items
        .filter(s => !toRemove.has(s.id))
        .map(s => {
          if (!Array.isArray(s.related)) return s
          const filtered = s.related.filter(r => !toRemove.has(r))
          if (filtered.length === s.related.length) return s
          s = { ...s }
          if (filtered.length) s.related = filtered
          else delete s.related
          return s
        })
      setItems(data, remaining)
      await save(data)
      if (removed.length) console.log(`Removed (${removed.length}): ${removed.join(', ')}`)
      if (notFound.length) console.error(`Not found (skipped): ${notFound.join(', ')}`)
      console.log(`${items.length} → ${remaining.length} skills`)
    })

  grp
    .command('enable <ids...>')
    .description('设置 defaultEnabled=true')
    .action(async (ids) => setEnabled(ids, true))

  grp
    .command('disable <ids...>')
    .description('设置 defaultEnabled=false')
    .action(async (ids) => setEnabled(ids, false))

  grp
    .command('reorder <id> <order>')
    .description('修改 order 字段并重新排序')
    .action(async (id, orderStr) => {
      const data = await load()
      const items = getItems(data)
      const [, skill] = requireSkill(items, id)
      const before = skill.order
      skill.order = Number(orderStr)
      items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
      setItems(data, items)
      await save(data)
      console.log(`${id}.order: ${before} → ${skill.order}`)
    })

  grp
    .command('relate <id> <related-ids...>')
    .description('向 related[] 追加关联 id')
    .action(async (id, relatedIds) => {
      const data = await load()
      const items = getItems(data)
      const [, skill] = requireSkill(items, id)
      const existing = skill.related ?? []
      const added = relatedIds.filter(r => !existing.includes(r))
      if (!added.length) { console.log('No changes (all already in related)'); return }
      skill.related = [...existing, ...added]
      await save(data)
      console.log(`${id}.related: added ${JSON.stringify(added)}`)
    })

  grp
    .command('unrelate <id> <related-ids...>')
    .description('从 related[] 移除关联 id')
    .action(async (id, relatedIds) => {
      const data = await load()
      const items = getItems(data)
      const [, skill] = requireSkill(items, id)
      const existing = skill.related ?? []
      const toRemove = new Set(relatedIds)
      const remaining = existing.filter(r => !toRemove.has(r))
      if (remaining.length === existing.length) { console.log('No changes (none found in related)'); return }
      if (remaining.length) skill.related = remaining
      else delete skill.related
      await save(data)
      const removed = relatedIds.filter(r => existing.includes(r))
      console.log(`${id}.related: removed ${JSON.stringify(removed)}`)
    })

  grp
    .command('set <id> <field> <value>')
    .description('设置技能的任意顶层字段（value 按 JSON 解析，失败则视为字符串）')
    .action(async (id, field, rawValue) => {
      const data = await load()
      const items = getItems(data)
      const [idx, skill] = requireSkill(items, id)
      let value
      try { value = JSON.parse(rawValue) } catch { value = rawValue }
      const before = skill[field]
      skill[field] = value
      items[idx] = skill
      await save(data)
      console.log(`${id}.${field}: ${JSON.stringify(before)} → ${JSON.stringify(value)}`)
    })

  grp
    .command('touch')
    .description('更新 publishedAt 为当前 UTC 时间')
    .action(async () => {
      const data = await load()
      if (Array.isArray(data)) { console.error('Root is an array; no publishedAt to update'); process.exit(1) }
      const before = data.publishedAt
      const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
      data.publishedAt = now
      await save(data)
      console.log(`publishedAt: ${before} → ${now}`)
    })
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/manifest-gen/src/commands/skills.js
git commit -m "feat(manifest-gen): add skills command group"
```

---

### Task 4: Wire into cli.js and smoke test

**Files:**
- Modify: `tools/manifest-gen/src/cli.js`

- [ ] **Step 1: Replace `tools/manifest-gen/src/cli.js` with the following**

```js
import { Command } from 'commander'
import { registerRegistryCommands } from './commands/registry.js'
import { registerSkillsCommands } from './commands/skills.js'

const program = new Command()
program
  .name('manifest-gen')
  .description('TuyaOpen manifest JSON 生成工具')
  .version('1.0.0')

const platform = program.command('platform').description('Platform JSON 操作')

platform
  .command('create')
  .description('交互向导生成新的 platform JSON')
  .action(async () => {
    const { runPlatformCreate } = await import('./commands/platform-create.js')
    await runPlatformCreate()
  })

platform
  .command('validate <file>')
  .description('校验已有 platform JSON')
  .action(async (file) => {
    const { runPlatformValidate } = await import('./commands/platform-validate.js')
    await runPlatformValidate(file)
  })

platform
  .command('normalize <file>')
  .description('校验并格式化已有 platform JSON')
  .option('--out <outfile>', '输出路径（默认覆盖原文件）')
  .action(async (file, options) => {
    const { runPlatformNormalize } = await import('./commands/platform-normalize.js')
    await runPlatformNormalize(file, options.out)
  })

platform
  .command('show <file>')
  .description('展示 platform JSON 摘要信息')
  .action(async (file) => {
    const { runPlatformShow } = await import('./commands/platform-show.js')
    await runPlatformShow(file)
  })

platform
  .command('edit <file>')
  .description('交互向导修改已有 platform JSON')
  .action(async (file) => {
    const { runPlatformEdit } = await import('./commands/platform-edit.js')
    await runPlatformEdit(file)
  })

registerRegistryCommands(program)
registerSkillsCommands(program)

program.parse()
```

- [ ] **Step 2: Smoke test registry commands**

Run from the repo root (`vendor/tuyaopen-ide-manifests/`):

```bash
node tools/manifest-gen/bin/manifest-gen.js registry list
```
Expected: prints `registry: ...  publishedAt=...` followed by a table of domains (`boardsAndChips`, `demos`, `skills`, etc.).

```bash
node tools/manifest-gen/bin/manifest-gen.js registry get skills
```
Expected: prints JSON with `url`, `version`, `summary` fields.

```bash
node tools/manifest-gen/bin/manifest-gen.js registry bump skills patch
```
Expected output like: `skills.version: 1.2.3 → 1.2.4`

Verify the file changed and revert:
```bash
git diff registry.json   # should show the version bump
git checkout registry.json
```

- [ ] **Step 3: Smoke test skills commands**

```bash
node tools/manifest-gen/bin/manifest-gen.js skills list
```
Expected: prints `publishedAt=...  (N skills)` followed by a sorted table.

```bash
node tools/manifest-gen/bin/manifest-gen.js skills list --surface embedded
```
Expected: only rows where surface is `embedded`.

Pick any `id` from the list output and run:
```bash
node tools/manifest-gen/bin/manifest-gen.js skills get <id>
```
Expected: prints that skill's full JSON.

- [ ] **Step 4: Commit**

```bash
git add tools/manifest-gen/src/cli.js
git commit -m "feat(manifest-gen): register registry and skills command groups in cli"
```

---

### Task 5: Delete scripts/ and finalize

**Files:**
- Delete: `scripts/registry.py`
- Delete: `scripts/skills-index.py`

- [ ] **Step 1: Remove the scripts directory**

```bash
git rm scripts/registry.py scripts/skills-index.py
```

After `git rm`, the directory is empty and disappears from the working tree automatically.

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove scripts/*.py — replaced by manifest-gen registry/skills"
```
