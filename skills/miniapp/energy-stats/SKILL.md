---
name: miniapp/energy-stats
description: 为涂鸦 Ray 小程序生成电量统计、电费统计和用电成本追踪代码，使用 @tuya-miniapp/cloud-api。当用户提到 电量统计, 电费统计, 能源统计, electricity statistics, energy billing, cost tracking, 峰谷电价, peak-valley pricing, 电量预算, 电费预算, budget warnings, getDeviceData, IndicatorCode, @tuya-miniapp/cloud-api energy, currency settings，或需要在 Ray 小程序中构建统计图表、电价配置、用电预算页面时触发。优先使用本 skill 而非原始 apiRequestByAtop 调用 — 确保使用正确的 cloud-api 抽象层。
---

## 概述 {#description}

本 skill 为涂鸦 Ray 小程序生成电量/电费统计功能代码。所有云端调用均使用 `@tuya-miniapp/cloud-api`，禁止直接使用 `apiRequestByAtop`。

### 前置条件（使用 API 前必须完成）

1. **云能力授权**：打开 [小程序开发者平台](https://platform.tuya.com/miniapp/) → `开发设置` → `云能力`，启用智慧能源 API 分组。
2. **产品激活**：打开 [涂鸦 IoT 开发平台](https://iot.tuya.com/)，为产品开启**电量统计**高级能力。

详细步骤见 [docs/integration-guide.md](docs/integration-guide.md)。

### 核心原则

- 所有 API 调用从 `@tuya-miniapp/cloud-api` 导入
- 设备属性通过 `@ray-js/ray` 读写（邮箱地址和自定义货币单位）
- 图表使用 `@ray-js/common-charts`（默认导入为 `CommonCharts`，兼容 ECharts 的 `option` 格式）

---

## 适用场景 {#scene}

### 功能与页面对照表

| 功能 | 页面 | 核心 API | 代码片段 |
|------|------|----------|---------|
| 统计图表 | `energyStatistic/` | `getDeviceData`, `IndicatorCode`, `DateType` | [#statistic-chart](references/snippets.md#statistic-chart) |
| 峰谷电价 | `energyPrice/` | `getPeakValleyPrice`, `savePeakValleyPrice` | [#peak-valley-price](references/snippets.md#peak-valley-price) |
| 货币设置 | `energyCurrency/` | `getCurrencyList`, `getDeviceCurrency`, `saveDeviceCurrency` | [#currency-settings](references/snippets.md#currency-settings) |
| 费用预算 | `energyCostWarn/` | `getDeviceCostBudget`, `batchSaveCostBudget`, `BudgetDataType` | [#budget-warnings](references/snippets.md#budget-warnings) |
| 用量预算 | `energyUsageWarn/` | `getDeviceConsumeBudget`, `batchSaveConsumeBudget`, `BudgetDataType` | [#budget-warnings](references/snippets.md#budget-warnings) |
| 数据管理 | （工具类） | `cleanDeviceData`, `exportDeviceData` | [#data-management](references/snippets.md#data-management) |
| 设置入口 | `energyMain/` | 仅页面导航 | — |

### 适用情况

- 在 Ray 小程序中构建电量统计 / 电费追踪 UI
- 将原始 `apiRequestByAtop` 调用替换为 `@tuya-miniapp/cloud-api`
- 添加峰谷电价、预算提醒或货币选择功能
- 使用 `@ray-js/common-charts` 生成图表页面
- 导出或清除设备能源数据

---

## 搭配使用 {#usage}

本 skill 设计为与标准涂鸦 Ray 小程序工具链配合使用。生成的代码假设宿主项目中已安装以下依赖包：

| 包名 | 用途 | 使用场景 |
|------|------|---------|
| `@tuya-miniapp/cloud-api` | 能源/计费/预算/货币云端 API | 所有功能页面 |
| `@ray-js/ray` | 设备属性读写（邮箱地址、自定义货币单位） | 货币设置、数据导出 |
| `@ray-js/common-charts` | 用量/费用趋势图表（默认导入 `CommonCharts`，兼容 ECharts 的 `option`） | 统计图表页 |
| `ahooks` | `useAsyncEffect`、`useDebounceFn`，用于数据加载和输入防抖 | 所有页面 |
| i18n（`Strings.getLang()`） | 所有用户可见字符串 | 所有页面 |

---

## API Reference {#api-ref}

所有函数均从 `@tuya-miniapp/cloud-api` 导入，完整示例见 [references/snippets.md](references/snippets.md)。

### 函数说明

| 函数 | 用途 | 返回值 |
|------|------|--------|
| `getDeviceData(params)` | 按时间范围获取能源数据 | `{ total, unit, list[] }` |
| `getPeakValleyPrice({ devId })` | 读取峰谷电价配置 | `{ priceType?, currency?, config }` |
| `savePeakValleyPrice({ devId, priceConfig })` | 保存电价配置 | `boolean` |
| `getDeviceCurrency({ devId })` | 读取设备货币设置 | `string`（ISO 4217） |
| `saveDeviceCurrency({ devId, currency })` | 保存货币设置 | `boolean` |
| `getCurrencyList()` | 获取可用货币列表 | `CurrencyItem[]` |
| `getDeviceConsumeBudget({ devId })` | 读取用量预算 | `DeviceBudget[]` |
| `getDeviceCostBudget({ devId })` | 读取费用预算 | `DeviceBudget[]` |
| `batchSaveConsumeBudget({ devId, budgetConfig })` | 批量保存用量预算 | `boolean` |
| `batchSaveCostBudget({ devId, budgetConfig })` | 批量保存费用预算 | `boolean` |
| `cleanDeviceData({ devId })` | 清除全部统计数据（不可逆） | `boolean` |
| `exportDeviceData(params)` | 将数据导出至邮箱（异步） | `boolean` |
| `getUnitByIndicatorCode(params)` | 获取计量单位 | `string` |

### 枚举值

| 枚举 | 可选值 |
|------|--------|
| `IndicatorCode` | `EleUsage`（`'ele_usage'`）、`EleCost`（`'ele_cost'`） |
| `DateType` | `Hour`（`'hour'`）、`Day`（`'day'`）、`Month`（`'month'`） |
| `BudgetDataType` | `Day`（`'day'`）、`Week`（`'week'`）、`Month`（`'month'`） |

### 设备属性（非能源存储）

```typescript
import { getDeviceProperty, setDeviceProperty } from '@ray-js/ray';
```

用于：邮箱地址（`email_export_address`）、自定义货币单位（`custom_currency_unit`）。

---

## 代码生成指南 {#codegen}

### 统计图表页

1. 两个 Tab：`IndicatorCode.EleUsage` 和 `IndicatorCode.EleCost`
2. 日期类型选择器（API 使用 Day/Week/Month，UI 可用 Month + 全年范围表示"年"）
3. 日期前后导航 — 参见 [#date-navigation](references/snippets.md#date-navigation)
4. Tab/日期切换时通过 `useAsyncEffect` 调用 `getDeviceData` 获取数据
5. 使用 `@ray-js/common-charts` 渲染：默认导入 `CommonCharts`，传入 `unit` 和兼容 ECharts 的 `option`（`xAxis` / `yAxis` / `series`，`type` 为 `'line'` 或 `'bar'`）
6. 图表上方显示总量和单位
7. 可选：从设备 DP Schema 读取实时 DP 值（功率、电压、电流）

组件骨架见 [#statistic-chart](references/snippets.md#statistic-chart)。

### 峰谷电价页

1. 挂载时用 `getPeakValleyPrice` 加载已有配置
2. 顶部显示统一电价输入框
3. 可滑动的时段列表（startTime / endTime / price）
4. 添加 / 删除时段按钮
5. 通过 `savePeakValleyPrice` 保存全部配置
6. 校验：时段不得重叠，小时字符串须为两位数 `"00"`~`"24"`

参见 [#peak-valley-price](references/snippets.md#peak-valley-price)。

### 货币设置页

1. 通过 `getCurrencyList()` 获取标准列表，通过 `getDeviceCurrency()` 获取当前货币
2. 渲染可选货币列表，高亮当前选中项
3. 选择后调用 `saveDeviceCurrency()`
4. 自定义单位区域：通过 `getDeviceProperty`/`setDeviceProperty` 以 `custom_currency_unit` 为 key 读写
5. 自定义单位输入框需防抖处理

参见 [#currency-settings](references/snippets.md#currency-settings)。

### 预算提醒页（费用 + 用量）

1. 共享组件模式 — 通过 prop `type: 'consume' | 'cost'` 区分
2. 三个输入框：日 / 周 / 月（使用 `BudgetDataType` 枚举）
3. 通过 `getDeviceCostBudget` 或 `getDeviceConsumeBudget` 加载
4. 通过 `batchSaveCostBudget` 或 `batchSaveConsumeBudget` 保存
5. 输入框使用 `useDebounceFn` 防抖

参见 [#budget-warnings](references/snippets.md#budget-warnings)。

### 数据管理工具

1. `cleanDeviceData` — 执行前必须弹出确认弹窗（操作不可逆）
2. `exportDeviceData` — 通过设备属性存储邮箱，操作后显示"任务已提交" toast
3. 建议在 `cleanDeviceData` 前先调用 `exportDeviceData`

参见 [#data-management](references/snippets.md#data-management)。

---

## 注意事项 {#tip}

### 强制规则

- **禁止**直接使用 `apiRequestByAtop` — 必须使用 `@tuya-miniapp/cloud-api`
- **必须**在生成代码的注释或 README 中说明前置条件

### 最佳实践

- 在 React 组件中使用 `ahooks` 的 `useAsyncEffect` 处理异步数据加载
- 表单输入使用 `useDebounceFn` 避免 API 频繁调用
- 所有用户可见字符串通过 i18n（`Strings.getLang()`）处理
- 预算批量保存为增量更新 — 未传入的维度保留原有值
- 货币变更仅影响未来数据 — 需在界面上向用户说明
- 峰谷电价时间格式：两位字符串（`"08"` 而非 `"8"`）
- 导出为异步操作 — 返回 `true` 表示任务已入队，并非邮件已发送

### 自检清单

生成代码定稿前，请逐项确认：

- [ ] 所有云端调用均使用 `@tuya-miniapp/cloud-api` 导入？
- [ ] 邮箱和自定义货币单位通过设备属性读写（而非 localStorage）？
- [ ] 图表使用 `@ray-js/common-charts`（默认导入 `CommonCharts`，含 `unit` + ECharts `option`）？
- [ ] 预算保存使用批量 API（而非逐条保存）？
- [ ] 日期格式与 DateType 匹配（Hour→YYYYMMDDHH，Day→YYYYMMDD，Month→YYYYMM）？
- [ ] 已说明前置条件（云能力授权 + 产品激活）？
