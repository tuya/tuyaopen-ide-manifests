import { input, select, checkbox, number, confirm } from '@inquirer/prompts'
import { peripheralModules } from '../registry.js'

export async function runPlatformWizard() {
  console.log('\n=== Platform JSON 生成向导 ===\n')

  const platformId     = await input({ message: 'platformId (小写连字符，如 t5ai):' })
  const variantId      = await input({ message: 'variantId（通常与 platformId 相同）:', default: platformId })
  const name           = await input({ message: '平台显示名称（如 T5AI）:' })
  const arch           = await select({
    message: '处理器架构:',
    choices: [
      { value: 'arm-cortex-m33' },
      { value: 'xtensa-lx6' },
      { value: 'xtensa-lx7' },
      { value: 'risc-v' },
    ],
  })
  const flashInterface = await select({
    message: 'Flash 接口:',
    choices: [{ value: 'qspi' }, { value: 'spi' }],
  })

  const connChoices = await checkbox({
    message: '选择连接方式:',
    choices: [
      { name: 'WiFi',     value: 'wifi',     checked: true },
      { name: 'BLE',      value: 'ble',      checked: true },
      { name: 'Ethernet', value: 'ethernet', checked: false },
      { name: 'Cellular', value: 'cellular', checked: false },
    ],
  })

  let wifiStandard = '802.11b/g/n'
  if (connChoices.includes('wifi')) {
    wifiStandard = await select({
      message: 'WiFi 标准:',
      choices: [{ value: '802.11b/g/n' }, { value: '802.11b/g/n/ax' }],
    })
  }

  let bleVersion = '5.4'
  if (connChoices.includes('ble')) {
    bleVersion = await select({
      message: 'BLE 版本:',
      choices: [{ value: '5.0' }, { value: '5.2' }, { value: '5.4' }],
    })
  }

  const connectivity = {
    wifi: connChoices.includes('wifi')
      ? { enabled: true, enableMacro: 'ENABLE_WIFI', standard: wifiStandard, bands: ['2.4GHz'], security: ['WPA', 'WPA2', 'WPA3-Personal'], modes: ['STA', 'AP', 'Direct'] }
      : { enabled: false, enableMacro: 'ENABLE_WIFI' },
    ble: connChoices.includes('ble')
      ? { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: bleVersion }
      : { enabled: false, enableMacro: 'ENABLE_BLUETOOTH' },
    ethernet: { enabled: connChoices.includes('ethernet'), enableMacro: 'ENABLE_WIRED' },
    cellular: { enabled: connChoices.includes('cellular'), enableMacro: 'ENABLE_CELLULAR' },
  }

  console.log('\n--- 内存配置 ---')
  const sramBytes     = await number({ message: 'SRAM 大小 (bytes):', default: 0 })
  const romBytes      = await number({ message: 'ROM 大小 (bytes):',  default: 0 })
  const flashMaxBytes = await number({ message: '最大 Flash 大小 (bytes):', default: 0 })
  const psramMaxBytes = await number({ message: '最大 PSRAM 大小 (bytes, 0=无):', default: 0 })
  const efuse         = await confirm({ message: '是否支持 eFuse?', default: false })

  const kconfigValue = await input({ message: 'PLATFORM_CHOICE Kconfig 值（如 T5AI）:' })

  console.log('\n--- 外设选择 ---')
  const selectedPeripherals = await checkbox({
    message: '选择本平台支持的外设（空格选择，回车确认）:',
    choices: peripheralModules.map(m => ({ name: `${m.meta.label} (${m.meta.key})`, value: m.meta.key, checked: true })),
  })

  return {
    platformId,
    variantId,
    name,
    arch,
    flashInterface,
    connectivity,
    memory: { sramBytes, romBytes, flashMaxBytes, psramMaxBytes, efuse },
    kconfig: { PLATFORM_CHOICE: kconfigValue },
    selectedPeripherals,
  }
}
