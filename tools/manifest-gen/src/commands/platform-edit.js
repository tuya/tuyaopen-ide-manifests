import { promises as fs } from 'fs'
import prettier from 'prettier'
import chalk from 'chalk'
import { checkbox } from '@inquirer/prompts'
import {
  configureBasicInfo,
  configureConnectivity,
  configureMemory,
  configureKconfig,
  configurePeripherals,
} from '../generators/platform/wizard.js'
import { buildPlatform } from '../generators/platform/builder.js'
import { peripheralModules } from '../generators/registry.js'

export async function runPlatformEdit(filePath) {
  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch {
    console.error(chalk.red(`✗ 无法读取文件：${filePath}`))
    process.exit(1)
  }

  let existing
  try {
    existing = JSON.parse(raw)
  } catch (e) {
    console.error(chalk.red(`✗ JSON 解析失败：${e.message}`))
    process.exit(1)
  }

  console.log(chalk.yellow(`\n编辑模式：已加载 ${filePath}\n`))

  const sections = await checkbox({
    message: '要编辑哪些部分？',
    loop: false,
    choices: [
      { name: '基本信息（platformId / name / arch / flashInterface）', value: 'basic' },
      { name: '连接方式', value: 'connectivity' },
      { name: '内存配置', value: 'memory' },
      { name: 'Kconfig', value: 'kconfig' },
      { name: '外设配置', value: 'peripherals' },
    ],
  })

  if (sections.length === 0) {
    console.log(chalk.gray('\n未选择任何部分，退出。'))
    return
  }

  // Start from existing data
  let answers = {
    platformId:          existing.platformId,
    variantId:           existing.id,
    name:                existing.name,
    arch:                existing.arch,
    flashInterface:      existing.flashInterface,
    connectivity:        existing.connectivity,
    memory:              existing.memory,
    kconfig:             existing.kconfig,
    selectedPeripherals: Object.keys(existing.peripherals ?? {}),
    peripheralConfigs:   existing.peripherals ?? {},
  }

  if (sections.includes('basic')) {
    console.log(chalk.cyan('\n--- 基本信息 ---'))
    Object.assign(answers, await configureBasicInfo(existing))
  }

  if (sections.includes('connectivity')) {
    console.log(chalk.cyan('\n--- 连接方式 ---'))
    const { connectivity } = await configureConnectivity(existing)
    answers.connectivity = connectivity
  }

  if (sections.includes('memory')) {
    console.log(chalk.cyan('\n--- 内存配置 ---'))
    const { memory } = await configureMemory(existing)
    answers.memory = memory
  }

  if (sections.includes('kconfig')) {
    console.log(chalk.cyan('\n--- Kconfig ---'))
    const { kconfig } = await configureKconfig(existing)
    answers.kconfig = kconfig
  }

  if (sections.includes('peripherals')) {
    console.log(chalk.cyan('\n--- 外设配置 ---'))

    // Let user pick which already-configured peripherals to reconfigure.
    // Newly added peripherals are always configured automatically.
    const currentKeys = Object.keys(existing.peripherals ?? {})
    let reconfigureKeys = []
    if (currentKeys.length > 0) {
      reconfigureKeys = await checkbox({
        message: '哪些外设需要重新配置？（未勾选的保留现有配置，新增外设自动配置）',
        loop: false,
        choices: currentKeys.map(key => {
          const mod = peripheralModules.find(m => m.meta.key === key)
          return { name: `${mod?.meta.label ?? key} (${key})`, value: key, checked: false }
        }),
      })
    }

    const { selectedPeripherals, peripheralConfigs } = await configurePeripherals(existing, reconfigureKeys)
    answers.selectedPeripherals = selectedPeripherals
    answers.peripheralConfigs   = peripheralConfigs
  }

  const data = buildPlatform(answers)

  let formatted
  try {
    const json = JSON.stringify(data, null, 2)
    formatted = await prettier.format(json, { parser: 'json' })
  } catch (e) {
    console.error(chalk.red(`✗ JSON 格式化失败：${e.message}`))
    process.exit(1)
  }

  try {
    await fs.writeFile(filePath, formatted, 'utf8')
  } catch (e) {
    console.error(chalk.red(`✗ 写文件失败：${e.message}`))
    process.exit(1)
  }

  console.log(chalk.green(`\n✔ 已更新：${filePath}`))
}
