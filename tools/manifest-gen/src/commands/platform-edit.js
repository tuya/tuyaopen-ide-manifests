import { promises as fs } from 'fs'
import prettier from 'prettier'
import chalk from 'chalk'
import { runPlatformWizard } from '../generators/platform/wizard.js'
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

  console.log(chalk.yellow(`\n编辑模式：已加载 ${filePath}`))
  console.log(chalk.gray('（直接按 Enter 保留现有值）\n'))

  const answers = await runPlatformWizard(existing)
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
