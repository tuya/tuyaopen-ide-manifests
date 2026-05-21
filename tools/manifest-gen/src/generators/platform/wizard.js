import { input, select, checkbox, number, confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import { peripheralModules } from '../registry.js'

const KNOWN_ARCHES = ['arm-cortex-m33', 'arm-v5', 'xtensa-lx6', 'xtensa-lx7', 'risc-v']

// ── section edit functions (field-level navigation, used by edit command) ──

export async function editBasicInfo(answers) {
  while (true) {
    const field = await select({
      message: '基本信息 — 选择字段:',
      choices: [
        { name: `platformId      ${chalk.gray(answers.platformId ?? '—')}`, value: 'platformId' },
        { name: `variantId       ${chalk.gray(answers.variantId ?? '—')}`, value: 'variantId' },
        { name: `name            ${chalk.gray(answers.name ?? '—')}`, value: 'name' },
        { name: `arch            ${chalk.gray(answers.arch ?? '—')}`, value: 'arch' },
        { name: `flashInterface  ${chalk.gray(answers.flashInterface ?? '—')}`, value: 'flashInterface' },
        { name: chalk.gray('← 返回'), value: 'back' },
      ],
    })
    if (field === 'back') break
    if (field === 'platformId') {
      answers.platformId = await input({ message: 'platformId:', default: answers.platformId })
    } else if (field === 'variantId') {
      answers.variantId = await input({ message: 'variantId:', default: answers.variantId })
    } else if (field === 'name') {
      answers.name = await input({ message: '平台显示名称:', default: answers.name })
    } else if (field === 'arch') {
      const defaultArchIsKnown = KNOWN_ARCHES.includes(answers.arch)
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
        default: defaultArchIsKnown ? answers.arch : (answers.arch ? '__custom__' : undefined),
      })
      answers.arch = archChoice === '__custom__'
        ? await input({ message: '请输入架构名称:', default: defaultArchIsKnown ? '' : (answers.arch ?? '') })
        : archChoice
    } else if (field === 'flashInterface') {
      answers.flashInterface = await select({
        message: 'Flash 接口:',
        choices: [{ value: 'qspi' }, { value: 'spi' }],
        default: answers.flashInterface,
      })
    }
  }
}

export async function editConnectivity(answers) {
  while (true) {
    const c = answers.connectivity
    const field = await select({
      message: '连接方式 — 选择条目:',
      choices: [
        { name: `WiFi      ${c?.wifi?.enabled    ? chalk.green(`✓  ${c.wifi.standard}`) : chalk.gray('✗')}`, value: 'wifi' },
        { name: `BLE       ${c?.ble?.enabled     ? chalk.green(`✓  v${c.ble.version}`) : chalk.gray('✗')}`, value: 'ble' },
        { name: `Ethernet  ${c?.ethernet?.enabled ? chalk.green('✓') : chalk.gray('✗')}`, value: 'ethernet' },
        { name: `Cellular  ${c?.cellular?.enabled ? chalk.green('✓') : chalk.gray('✗')}`, value: 'cellular' },
        { name: chalk.gray('← 返回'), value: 'back' },
      ],
    })
    if (field === 'back') break
    if (field === 'wifi') {
      const enabled = await confirm({ message: 'WiFi 启用?', default: c?.wifi?.enabled ?? true })
      if (enabled) {
        const standard = await select({
          message: 'WiFi 标准:',
          choices: [{ value: '802.11b/g/n' }, { value: '802.11b/g/n/ax' }],
          default: c?.wifi?.standard ?? '802.11b/g/n',
        })
        answers.connectivity.wifi = { enabled: true, enableMacro: 'ENABLE_WIFI', standard, bands: ['2.4GHz'], security: ['WPA', 'WPA2', 'WPA3-Personal'], modes: ['STA', 'AP', 'Direct'] }
      } else {
        answers.connectivity.wifi = { enabled: false, enableMacro: 'ENABLE_WIFI' }
      }
    } else if (field === 'ble') {
      const enabled = await confirm({ message: 'BLE 启用?', default: c?.ble?.enabled ?? true })
      if (enabled) {
        const version = await select({
          message: 'BLE 版本:',
          choices: [{ value: '5.0' }, { value: '5.2' }, { value: '5.4' }],
          default: c?.ble?.version ?? '5.4',
        })
        answers.connectivity.ble = { enabled: true, enableMacro: 'ENABLE_BLUETOOTH', version }
      } else {
        answers.connectivity.ble = { enabled: false, enableMacro: 'ENABLE_BLUETOOTH' }
      }
    } else if (field === 'ethernet') {
      const enabled = await confirm({ message: 'Ethernet 启用?', default: c?.ethernet?.enabled ?? false })
      answers.connectivity.ethernet = { enabled, enableMacro: 'ENABLE_WIRED' }
    } else if (field === 'cellular') {
      const enabled = await confirm({ message: 'Cellular 启用?', default: c?.cellular?.enabled ?? false })
      answers.connectivity.cellular = { enabled, enableMacro: 'ENABLE_CELLULAR' }
    }
  }
}

export async function editMemory(answers) {
  while (true) {
    const m = answers.memory
    const sramKB  = Math.round((m?.sramBytes  ?? 0) / 1024)
    const romKB   = Math.round((m?.romBytes   ?? 0) / 1024)
    const flashKB = Math.round((m?.flashMaxBytes ?? 0) / 1024)
    const psramKB = Math.round((m?.psramMaxBytes ?? 0) / 1024)

    const field = await select({
      message: '内存配置 — 选择字段:',
      choices: [
        { name: `SRAM        ${chalk.gray(sramKB + ' KB')}`, value: 'sram' },
        { name: `ROM         ${chalk.gray(romKB + ' KB')}`, value: 'rom' },
        { name: `Flash 最大  ${chalk.gray(flashKB + ' KB')}`, value: 'flash' },
        { name: `PSRAM 最大  ${chalk.gray(psramKB + ' KB')}`, value: 'psram' },
        { name: `eFuse       ${m?.efuse ? chalk.green('是') : chalk.gray('否')}`, value: 'efuse' },
        { name: chalk.gray('← 返回'), value: 'back' },
      ],
    })
    if (field === 'back') break
    if (field === 'sram') {
      answers.memory.sramBytes = (await number({ message: 'SRAM (KB):', default: sramKB })) * 1024
    } else if (field === 'rom') {
      answers.memory.romBytes = (await number({ message: 'ROM (KB):', default: romKB })) * 1024
    } else if (field === 'flash') {
      answers.memory.flashMaxBytes = (await number({ message: '最大 Flash (KB):', default: flashKB })) * 1024
    } else if (field === 'psram') {
      answers.memory.psramMaxBytes = (await number({ message: '最大 PSRAM (KB):', default: psramKB })) * 1024
    } else if (field === 'efuse') {
      answers.memory.efuse = await confirm({ message: '是否支持 eFuse?', default: m?.efuse ?? false })
    }
  }
}

export async function editKconfig(answers) {
  while (true) {
    const field = await select({
      message: 'Kconfig — 选择字段:',
      choices: [
        { name: `PLATFORM_CHOICE  ${chalk.gray(answers.kconfig?.PLATFORM_CHOICE ?? '—')}`, value: 'choice' },
        { name: chalk.gray('← 返回'), value: 'back' },
      ],
    })
    if (field === 'back') break
    if (field === 'choice') {
      answers.kconfig = { PLATFORM_CHOICE: await input({ message: 'PLATFORM_CHOICE:', default: answers.kconfig?.PLATFORM_CHOICE }) }
    }
  }
}

export async function editPeripherals(answers) {
  while (true) {
    const choices = peripheralModules.map(m => {
      const enabled = answers.selectedPeripherals.includes(m.meta.key)
      return {
        name: `${enabled ? chalk.green('✓') : chalk.gray('✗')}  ${m.meta.label} ${chalk.gray('(' + m.meta.key + ')')}`,
        value: m.meta.key,
      }
    })
    choices.push({ name: chalk.gray('← 返回'), value: 'back' })

    const key = await select({ message: '外设配置 — 选择外设:', choices })
    if (key === 'back') break

    const mod = peripheralModules.find(m => m.meta.key === key)
    const enabled = answers.selectedPeripherals.includes(key)

    if (!enabled) {
      const enable = await confirm({ message: `启用 ${mod.meta.label}?`, default: true })
      if (enable) {
        answers.selectedPeripherals.push(key)
        if (mod?.configure) {
          console.log(chalk.cyan(`\n--- 配置 ${mod.meta.label} ---`) + chalk.gray('  （Ctrl+C 取消并返回）'))
          try {
            answers.peripheralConfigs[key] = await mod.configure(null)
          } catch (e) {
            if (e.name === 'ExitPromptError') {
              answers.selectedPeripherals = answers.selectedPeripherals.filter(k => k !== key)
              console.log(chalk.gray('\n已取消，未启用。'))
            } else throw e
          }
        }
      }
    } else {
      const action = await select({
        message: `${mod.meta.label}:`,
        choices: [
          { name: '重新配置', value: 'configure' },
          { name: chalk.red('禁用'), value: 'disable' },
          { name: chalk.gray('← 返回'), value: 'back' },
        ],
      })
      if (action === 'configure' && mod?.configure) {
        const original = answers.peripheralConfigs[key]
        console.log(chalk.cyan(`\n--- 配置 ${mod.meta.label} ---`) + chalk.gray('  （Ctrl+C 取消并返回）'))
        try {
          answers.peripheralConfigs[key] = await mod.configure(original ?? null)
        } catch (e) {
          if (e.name === 'ExitPromptError') {
            answers.peripheralConfigs[key] = original
            console.log(chalk.gray('\n已取消，保留原配置。'))
          } else throw e
        }
      } else if (action === 'disable') {
        answers.selectedPeripherals = answers.selectedPeripherals.filter(k => k !== key)
        delete answers.peripheralConfigs[key]
      }
    }
  }
}

// ── sequential configure functions (used by create command) ──

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
//                 string[] = only reconfigure these + newly added peripherals (edit mode)
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
