import { fileURLToPath } from 'url'
import { loadJson, saveJson } from '../utils/json-file.js'
import { bumpVersion } from '../utils/semver.js'

const REGISTRY_PATH = fileURLToPath(new URL('../../../../registry.json', import.meta.url))

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
