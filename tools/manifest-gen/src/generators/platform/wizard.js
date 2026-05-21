import { input, select, checkbox, number, confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import { peripheralModules } from '../registry.js'

const KNOWN_ARCHES = ['arm-cortex-m33', 'arm-v5', 'xtensa-lx6', 'xtensa-lx7', 'risc-v']

export async function configureBasicInfo(defaults = {}) {
  const platformId = await input({ message: 'platformId (小写连字符，如 t5ai):', default: defaults.platformId })
  const variantId  = await input({ message: 'variantId（通常与 platformId 相同）:', default: defaults.id ?? defaults.platformId })
  const name       = await input({ message: '平台显示名称（如 T5AI）:', default: defaults.name })

  const defaultArchIsKnown = KNOWN_ARCHES.includes(defaults.arch)
  const archChoice = await select({
    message: '处理器架构:',
    choices: [
      { value: 'arm-cortex-m33' },
      { value: 'arm-v5' },
      { value: 'xtensa-lx6' },
      { value: 'xtensa-lx7' },
      { value: 'risc-v' },
      { name: '手动输入...', value: '__custom__' },
    ],
    default: defaultArchIsKnown ? defaults.arch : (defaults.arch ? '__custom__' : undefined),
  })
  const arch = archChoice === '__custom__'
    ? await input({ message: '请输入架构名称:', default: defaultArchIsKnown ? '' : (defaults.arch ?? '') })
    : archChoice

  const flashInterface = await select({
    message: 'Flash 接口:',
    choices: [{ value: 'qspi' }, { value: 'spi' }],
    default: defaults.flashInterface,
  })

  return { platformId, variantId, name, arch, flashInterface }
}

export async function configureConnectivity(defaults = {}) {
  const dc = defaults.connectivity
  const connChoices = await checkbox({
    message: '选择连接方式:',
    loop: false,
    choices: [
      { name: 'WiFi',     value: 'wifi',     checked: dc ? !!dc.wifi?.enabled     : true },
      { name: 'BLE',      value: 'ble',      checked: dc ? !!dc.ble?.enabled      : true },
      { name: 'Ethernet', value: 'ethernet', checked: dc ? !!dc.ethernet?.enabled  : false },
      { name: 'Cellular', value: 'cellular', checked: dc ? !!dc.cellular?.enabled  : false },
    ],
  })

  let wifiStandard = dc?.wifi?.standard ?? '802.11b/g/n'
  if (connChoices.includes('wifi')) {
    wifiStandard = await select({
      message: 'WiFi 标准:',
      choices: [{ value: '802.11b/g/n' }, { value: '802.11b/g/n/ax' }],
      default: wifiStandard,
    })
  }

  let bleVersion = dc?.ble?.version ?? '5.4'
  if (connChoices.includes('ble')) {
    bleVersion = await select({
      message: 'BLE 版本:',
      choices: [{ value: '5.0' }, { value: '5.2' }, { value: '5.4' }],
      default: bleVersion,
    })
  }

  return {
    connectivity: {
      wifi: connChoices.includes('wifi')
        ? { enabled: true, enableMacro: 'ENABLE_WIFI', standard: wifiStandard, bands: ['2.4GHz'], security: ['WPA', 'WPA2', 'WPA3-Personal'], modes: ['STA', 'AP', 'Direct'] }
        : { enabled: false, enableMacro: 'ENABLE_WIFI' },
      ble: connChoices.includes('ble')
        ? { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version: bleVersion }
        : { enabled: false, enableMacro: 'ENABLE_BLUETOOTH' },
      ethernet: { enabled: connChoices.includes('ethernet'), enableMacro: 'ENABLE_WIRED' },
      cellular: { enabled: connChoices.includes('cellular'), enableMacro: 'ENABLE_CELLULAR' },
    },
  }
}

export async function configureMemory(defaults = {}) {
  const dm = defaults.memory
  const sramKB     = await number({ message: 'SRAM 大小 (KB):', default: dm ? Math.round(dm.sramBytes / 1024) : 0 })
  const romKB      = await number({ message: 'ROM 大小 (KB):',  default: dm ? Math.round(dm.romBytes / 1024) : 0 })
  const flashMaxKB = await number({ message: '最大 Flash 大小 (KB):', default: dm ? Math.round(dm.flashMaxBytes / 1024) : 0 })
  const psramMaxKB = await number({ message: '最大 PSRAM 大小 (KB, 0=无):', default: dm ? Math.round(dm.psramMaxBytes / 1024) : 0 })
  const efuse      = await confirm({ message: '是否支持 eFuse?', default: dm?.efuse ?? false })
  return { memory: { sramBytes: sramKB * 1024, romBytes: romKB * 1024, flashMaxBytes: flashMaxKB * 1024, psramMaxBytes: psramMaxKB * 1024, efuse } }
}

export async function configureKconfig(defaults = {}) {
  const kconfigValue = await input({ message: 'PLATFORM_CHOICE Kconfig 值（如 T5AI）:', default: defaults.kconfig?.PLATFORM_CHOICE })
  return { kconfig: { PLATFORM_CHOICE: kconfigValue } }
}

// reconfigureKeys: null = configure all selected (create mode)
//                 string[] = only reconfigure these + any newly added peripherals (edit mode)
export async function configurePeripherals(defaults = {}, reconfigureKeys = null) {
  const selectedPeripherals = await checkbox({
    message: '选择本平台支持的外设（空格选择，回车确认）:',
    loop: false,
    choices: peripheralModules.map(m => ({
      name: `${m.meta.label} (${m.meta.key})`,
      value: m.meta.key,
      checked: defaults.peripherals ? !!defaults.peripherals[m.meta.key] : true,
    })),
  })

  const peripheralConfigs = {}
  for (const key of selectedPeripherals) {
    const mod = peripheralModules.find(m => m.meta.key === key)
    const isNew = !defaults.peripherals?.[key]
    const shouldConfigure = reconfigureKeys === null || isNew || reconfigureKeys.includes(key)

    if (mod?.configure && shouldConfigure) {
      console.log(chalk.cyan(`\n--- 配置 ${mod.meta.label} ---`))
      peripheralConfigs[key] = await mod.configure(defaults.peripherals?.[key] ?? null)
    } else if (defaults.peripherals?.[key]) {
      peripheralConfigs[key] = defaults.peripherals[key]
    }
  }

  return { selectedPeripherals, peripheralConfigs }
}

export async function runPlatformWizard(defaults = {}) {
  const isEdit = Object.keys(defaults).length > 0
  console.log(isEdit ? '\n=== Platform JSON 编辑向导 ===\n' : '\n=== Platform JSON 生成向导 ===\n')

  const basic = await configureBasicInfo(defaults)
  const { connectivity } = await configureConnectivity(defaults)
  console.log('\n--- 内存配置 ---')
  const { memory } = await configureMemory(defaults)
  const { kconfig } = await configureKconfig(defaults)
  console.log('\n--- 外设选择 ---')
  const { selectedPeripherals, peripheralConfigs } = await configurePeripherals(defaults, null)

  return { ...basic, connectivity, memory, kconfig, selectedPeripherals, peripheralConfigs }
}
