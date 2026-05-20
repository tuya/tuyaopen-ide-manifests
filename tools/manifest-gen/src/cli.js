import { Command } from 'commander'

const program = new Command()
program
  .name('manifest-gen')
  .description('TuyaOpen manifest JSON 生成工具')
  .version('1.0.0')

const platform = program.command('platform').description('Platform JSON 操作')

platform
  .command('create')
  .description('交互向导生成新的 platform JSON')
  .action(async () => {
    const { runPlatformCreate } = await import('./commands/platform-create.js')
    await runPlatformCreate()
  })

platform
  .command('validate <file>')
  .description('校验已有 platform JSON')
  .action(async (file) => {
    const { runPlatformValidate } = await import('./commands/platform-validate.js')
    await runPlatformValidate(file)
  })

platform
  .command('normalize <file>')
  .description('校验并格式化已有 platform JSON')
  .option('--out <outfile>', '输出路径（默认覆盖原文件）')
  .action(async (file, options) => {
    const { runPlatformNormalize } = await import('./commands/platform-normalize.js')
    await runPlatformNormalize(file, options.out)
  })

program.parse()
