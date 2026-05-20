import { promises as fs } from 'fs'
import prettier from 'prettier'
import chalk from 'chalk'
import { validatePlatform } from '../validators/platform.js'
import { normalizePlatform } from '../generators/platform/builder.js'

export async function runPlatformNormalize(filePath, outPath) {
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
  if (errors.length > 0) {
    for (const err of errors) console.error(chalk.red(`✗ ${err}`))
    console.error(chalk.red(`\n发现 ${errors.length} 个错误，中止格式化`))
    process.exit(1)
  }

  const normalized = normalizePlatform(data)
  const json = JSON.stringify(normalized, null, 2)
  const formatted = await prettier.format(json, { parser: 'json' })

  const target = outPath ?? filePath
  await fs.writeFile(target, formatted, 'utf8')
  console.log(chalk.green(`✔ 已格式化：${target}`))
}
