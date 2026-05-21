import { checkbox, select } from '@inquirer/prompts'
import chalk from 'chalk'

export const meta = {
  key: 'dma2d',
  label: 'DMA2D',
  enableMacro: 'ENABLE_DMA2D',
  tklHeader: 'tkl_dma2d.h',
  idPrefix: null,
}

export function scaffold() {
  return {
    enabled: true,
    enableMacro: meta.enableMacro,
    tklHeader: meta.tklHeader,
    idPrefix: meta.idPrefix,
    count: 1,
    spec: { formats: ['TUYA_FRAME_FMT_YUV422', 'TUYA_FRAME_FMT_RGB565', 'TUYA_FRAME_FMT_RGB888'] },
  }
}

export function validate(data, path) {
  if (data == null) return [`${path} — data 为空`]
  const errors = []
  if (!Array.isArray(data.spec?.formats))
    errors.push(`${path}.spec.formats — 期望 array`)
  return errors
}

const ALL_FORMATS = ['TUYA_FRAME_FMT_YUV422', 'TUYA_FRAME_FMT_RGB565', 'TUYA_FRAME_FMT_RGB888']

export async function configure(existing = null) {
  const data = existing ? JSON.parse(JSON.stringify(existing)) : scaffold()

  while (true) {
    const formatsSummary = data.spec.formats.length > 0
      ? `${data.spec.formats.join(', ')} (${data.spec.formats.length}个)`
      : '(未选择)'
    const field = await select({
      message: 'DMA2D 配置:',
      loop: false,
      choices: [
        { name: `支持格式: ${formatsSummary}`, value: 'formats' },
        { name: chalk.green('✔ 完成'), value: 'done' },
      ],
    })
    if (field === 'done') break
    if (field === 'formats') {
      data.spec.formats = await checkbox({
        message: 'DMA2D 支持的像素格式:',
        loop: false,
        choices: ALL_FORMATS.map(f => ({ name: f, value: f, checked: data.spec.formats.includes(f) })),
      })
    }
  }
  return data
}
