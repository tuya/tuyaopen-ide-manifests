import { promises as fs } from 'fs'
import path from 'path'
import prettier from 'prettier'
import chalk from 'chalk'
import { runPlatformWizard } from '../generators/platform/wizard.js'
import { buildPlatform } from '../generators/platform/builder.js'

export async function runPlatformCreate() {
  const answers = await runPlatformWizard()
  const data    = buildPlatform(answers)
  const json    = JSON.stringify(data, null, 2)
  const formatted = await prettier.format(json, { parser: 'json' })

  const outDir  = path.join(process.cwd(), 'platforms', answers.platformId)
  const outFile = path.join(outDir, `${answers.variantId}.json`)

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(outFile, formatted, 'utf8')

  console.log(chalk.green(`\n✔ 已生成：${outFile}`))
}
