import { promises as fs } from 'fs'
import prettier from 'prettier'
import chalk from 'chalk'
import { select } from '@inquirer/prompts'
import {
  editBasicInfo,
  editConnectivity,
  editMemory,
  editKconfig,
  editPeripherals,
} from '../generators/platform/wizard.js'
import { buildPlatform } from '../generators/platform/builder.js'

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

  // Working copy of answers built from existing JSON
  let answers = {
    platformId:          existing.platformId,
    variantId:           existing.id,
    name:                existing.name,
    arch:                existing.arch,
    flashInterface:      existing.flashInterface,
    connectivity:        existing.connectivity,
    memory:              existing.memory,
    kconfigId:           existing.kconfigId,
    selectedPeripherals: Object.keys(existing.peripherals ?? {}),
    peripheralConfigs:   existing.peripherals ?? {},
  }

  // Helper: rebuild existing-like object from current answers for section defaults
  const toDefaults = () => ({
    platformId:   answers.platformId,
    id:           answers.variantId,
    name:         answers.name,
    arch:         answers.arch,
    flashInterface: answers.flashInterface,
    connectivity: answers.connectivity,
    memory:       answers.memory,
    kconfigId:    answers.kconfigId,
    peripherals:  answers.peripheralConfigs,
  })

  while (true) {
    const section = await select({
      message: '选择要编辑的部分:',
      loop: false,
      choices: [
        { name: '基本信息（platformId / name / arch / flashInterface）', value: 'basic' },
        { name: '连接方式', value: 'connectivity' },
        { name: '内存配置', value: 'memory' },
        { name: 'Kconfig ID', value: 'kconfig' },
        { name: '外设配置', value: 'peripherals' },
        { name: chalk.green('✔ 保存并退出'), value: 'done' },
        { name: chalk.red('✗ 放弃修改'), value: 'abort' },
      ],
    })

    if (section === 'done') break

    if (section === 'abort') {
      console.log(chalk.gray('\n已放弃修改。'))
      return
    }

    if (section === 'basic') {
      await editBasicInfo(answers)
    } else if (section === 'connectivity') {
      await editConnectivity(answers)
    } else if (section === 'memory') {
      await editMemory(answers)
    } else if (section === 'kconfig') {
      await editKconfig(answers)
    } else if (section === 'peripherals') {
      await editPeripherals(answers)
    }

    console.log(chalk.gray('✓ 已更新，回到菜单\n'))
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

  console.log(chalk.green(`\n✔ 已保存：${filePath}`))
}

