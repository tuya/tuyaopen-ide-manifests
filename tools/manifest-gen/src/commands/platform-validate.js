import { promises as fs } from 'fs'
import chalk from 'chalk'
import { validatePlatform } from '../validators/platform.js'

export async function runPlatformValidate(filePath) {
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

  const errors = validatePlatform(data)

  if (errors.length === 0) {
    console.log(chalk.green('✔ 校验通过，格式正确'))
  } else {
    for (const err of errors) console.error(chalk.red(`✗ ${err}`))
    console.error(chalk.red(`\n发现 ${errors.length} 个错误`))
    process.exit(1)
  }
}
