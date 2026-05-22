import { fileURLToPath } from 'url'
import { loadJson, saveJson } from '../utils/json-file.js'

const INDEX_PATH = fileURLToPath(new URL('../../../../skills/index.json', import.meta.url))

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
  ids.forEach(id => requireSkill(items, id))
  const changed = []
  for (const id of ids) {
    const [, skill] = findSkill(items, id)
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
