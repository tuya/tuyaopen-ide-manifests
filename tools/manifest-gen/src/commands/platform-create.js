import { promises as fs } from 'fs'
import path from 'path'
import prettier from 'prettier'
import chalk from 'chalk'
import { runPlatformWizard } from '../generators/platform/wizard.js'
import { buildPlatform } from '../generators/platform/builder.js'

export async function runPlatformCreate() {
  const answers = await runPlatformWizard()
  const data    = buildPlatform(answers)

  let formatted
  try {
    const json = JSON.stringify(data, null, 2)
    formatted = await prettier.format(json, { parser: 'json' })
  } catch (e) {
    console.error(chalk.red(`✗ JSON 格式化失败：${e.message}`))
    process.exit(1)
  }

  const outDir  = path.join(process.cwd(), 'platforms', answers.platformId)
  const outFile = path.join(outDir, `${answers.variantId}.json`)

  try {
    await fs.mkdir(outDir, { recursive: true })
    await fs.writeFile(outFile, formatted, 'utf8')
  } catch (e) {
    console.error(chalk.red(`✗ 写文件失败：${e.message}`))
    process.exit(1)
  }

  console.log(chalk.green(`\n✔ 已生成：${outFile}`))
}
