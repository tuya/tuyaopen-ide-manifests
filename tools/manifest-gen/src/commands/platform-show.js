import { promises as fs } from 'fs'
import chalk from 'chalk'

export async function runPlatformShow(filePath) {
  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch {
    console.error(chalk.red(`✗ 无法读取文件：${filePath}`))
    process.exit(1)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    console.error(chalk.red(`✗ JSON 解析失败：${e.message}`))
    process.exit(1)
  }

  const toKB = b => typeof b === 'number' ? `${Math.round(b / 1024)} KB` : '?'
  const mem = data.memory ?? {}

  console.log(chalk.bold(`\n${data.name}  (${data.platformId} / ${data.id})`))
  console.log(`  架构：${chalk.cyan(data.arch)}  |  Flash 接口：${data.flashInterface}`)
  console.log(`  内存：SRAM ${toKB(mem.sramBytes)} | ROM ${toKB(mem.romBytes)} | Flash ${toKB(mem.flashMaxBytes)}${mem.psramMaxBytes ? ` | PSRAM ${toKB(mem.psramMaxBytes)}` : ''} | eFuse: ${mem.efuse ? '是' : '否'}`)

  const conn = data.connectivity ?? {}
  const connList = Object.entries(conn).filter(([, v]) => v.enabled).map(([k]) => k).join(', ')
  console.log(`  连接：${connList || '无'}`)

  const periList = Object.keys(data.peripherals ?? {})
  console.log(`  外设 (${periList.length})：${periList.join(', ') || '无'}`)
  console.log(`  Schema: v${data.schemaVersion}  |  Kconfig: PLATFORM_CHOICE=${data.kconfig?.PLATFORM_CHOICE ?? '?'}\n`)
}
