---
name: charts-library-skill
description: 帮助 Agent 在 Ray 小程序中正确集成 `@ray/charts-library`，包括场景卡片（EleChartCard、TempAndHumChartCard、IlluminanceChartCard）、DataSourceProvider 涂鸦计量数据源、可组合周期控件（ChartPeriodProvider、ChartGranularityPicker、ChartPeriodNavigator、ChartSeriesPanel、useChartPeriodContext）及图表选项工具函数。适用于用户在 Ray 小程序页面中添加用电量/温湿度/照度/计量统计图表、构建周期切换图表、使用 withXAxis/withTooltip 自定义图表配置、或将自定义 UI 与库的周期上下文结合使用的场景。
---

# @ray/charts-library Skill

## 概述 {#description}

本 Skill 帮助 Agent 在 Ray 小程序页面中正确集成 `@ray/charts-library`。该库提供三类能力：**场景图表卡片**（开箱即用）、**可组合周期控件**（自定义布局）、以及**周期上下文 Hook**（完全自定义 UI）。

### 数据来源（不要硬编码本地路径）

1. 优先读取 **`node_modules/@ray/charts-library/README.md`**（如有中文版则用 `README-zh_CN.md`）。
2. 若依赖为 `file:` / monorepo 链接，通过 glob **`**/charts-library/README.md`** 定位。
3. README + 包类型声明为最终权威。

如果本地实现与 README 有冲突，以 README + 包导出为准。

### 可移植代码片段（项目无关）

代码片段收录在 [examples.md](examples.md) 中，设计为跨项目可移植：

- **不依赖**宿主项目的 `@/` 别名——复制后替换为项目实际别名。
- 复制后，根据 `@ray/charts-library` 的 README + 类型声明补全字段名和类型。

生成或迁移代码时：先从 [examples.md](examples.md) 读取对应模式，再从目标项目补全类型和国际化。

## 适用场景 {#scene}

当用户提及以下任何内容时触发本 Skill：

- `@ray/charts-library`、`@ray-js/charts-library`、`charts-library`
- `EleChartCard`、`TempAndHumChartCard`、`IlluminanceChartCard`
- `DataSourceProvider`、`ChartPeriodProvider`、`ChartSeriesPanel`、`ChartGranularityPicker`、`ChartPeriodNavigator`、`useChartPeriodContext`
- "用电图表 / 温湿度图表 / 照度图表 / 计量统计图表 / 周期切换图表"
- `seriesDataToOption`、`withXAxis`、`withTooltip`
- 涂鸦统计 API：`getStatisticsConfig`、`getStatisticsRangHour`、`getStatisticsRang15min`、`getStatisticsRangDay`、`getStatisticsRangMonth`

**禁止**捏造 API。只使用本 Skill 或 `reference.md` 中记录的符号。如果用户的需求未被覆盖，先阅读库仓库中 `src/charts/` 和 `src/sceneCharts/` 的源码再回答。

### 快速决策树

根据用户描述推断场景，或向用户确认：

| 场景 | 使用方式 |
| --- | --- |
| 涂鸦用电量/电量消耗卡片，代码量最少 | `DataSourceProvider` + `EleChartCard` |
| 涂鸦温湿度（可切换），带阈值线 | `TempAndHumChartCard`（无需外部 Provider） |
| 涂鸦照度卡片 | `IlluminanceChartCard`（无需外部 Provider） |
| 涂鸦计量数据但需自定义页面布局 | `DataSourceProvider` + `ChartPeriodProvider` + `ChartGranularityPicker` + `ChartPeriodNavigator` + `ChartSeriesPanel` |
| 自定义 UI（自己的 tab / 图表）+ 涂鸦数据 | `DataSourceProvider` + `ChartPeriodProvider` + `useChartPeriodContext()` |
| 非涂鸦计量的任意数据源 | `ChartPeriodProvider` + `loadData` 属性 |

## 搭配使用 {#usage}

### 安装

```sh
yarn add @ray/charts-library
# 库依赖的 peer deps
yarn add @ray-js/ray @ray-js/common-charts dayjs
```

导入路径为 `@ray/charts-library`（在宿主小程序中）——匹配项目已有的别名即可。

### 模式 1 — 开箱即用场景卡片（EleChartCard）

最快路径。`DataSourceProvider` 注入涂鸦计量 API，`EleChartCard` 渲染标题 + 汇总 + 图表 + 导航器 + 粒度选择器。

```tsx
import { DataSourceProvider, EleChartCard } from '@ray/charts-library';

export default function Page() {
  return (
    <DataSourceProvider
      devId="your-device-id"
      dpId={18}
      algorithmType="sum"
      unit="kWh"
    >
      <EleChartCard
        title="用电量"
        initialGranularity="day"
        theme="light"
        chartHeight="520rpx"
      />
    </DataSourceProvider>
  );
}
```

关键属性（完整表格见 `reference.md`）：

- `DataSourceProvider`：`devId`、`dpId`、`algorithmType`、`dayInterval`（`'hour' | '15min'`，默认 `'hour'`）、`unit`、`noDataText`、`buildOption`、`api`。
- `EleChartCard`：`theme`（`'light' | 'dark'`）、`title`、`unit`、`chartHeight`、`granularityOptions`（默认 `['day','week','month','year']`）、`granularityLabels`、`chartProps`、`initialGranularity`、`initialRange`。

### 模式 2 — 温湿度卡片

`TempAndHumChartCard` 内部自带 `DataSourceProvider` + `ChartPeriodProvider`。只需传一次 `devId`，然后配置 `temperature` / `humidity` 中的一个或两个。同时提供两个时，会显示切换按钮。

```tsx
import { TempAndHumChartCard } from '@ray/charts-library';
import { iconTemperature, iconHumidity } from '@/res';

<TempAndHumChartCard
  devId={deviceId}
  title="环境"
  defaultMetric="temp"
  temperature={{
    dpId: 101,
    label: '温度',
    unit: '℃',
    icon: iconTemperature,
    threshold: { min: 18, max: 26 },
  }}
  humidity={{
    dpId: 102,
    label: '湿度',
    unit: '%',
    icon: iconHumidity,
    threshold: { min: 40, max: 70 },
  }}
  granularityOptions={['day', 'month', 'year']}
  algorithmLabels={{ avg: '平均', max: '最大', min: '最小' }}
  emptySummaryText="暂无数据"
  maxThresholdLabel="上限"
  minThresholdLabel="下限"
/>
```

规则：

- `temperature` / `humidity` 至少提供一个。
- `threshold` 可选；提供时会渲染参考线，并显示 `maxThresholdLabel` / `minThresholdLabel`。
- `valueMapper(value) => number | null` 可对每个数据点的原始 DP 值做预处理；`summaryValueMapper(value) => number` 仅调整汇总聚合值。
- 默认 `granularityOptions` 为 `['day','month','year']`（**不含** `week`）。如需 `week` 请显式添加。

### 模式 3 — 照度卡片

```tsx
import { IlluminanceChartCard } from '@ray/charts-library';

<IlluminanceChartCard
  devId={deviceId}
  dpId={103}
  title="照度"
  metricLabel="照度"
  unit="lux"
  lineColor="#F39734"
  granularityOptions={['day', 'month', 'year']}
/>
```

### 模式 4 — 自由组合（自定义布局）

用 `DataSourceProvider` 获取数据，然后自行排布组件。

```tsx
import { View, Text } from '@ray-js/ray';
import {
  ChartGranularityPicker,
  ChartPeriodNavigator,
  ChartPeriodProvider,
  ChartSeriesPanel,
  DataSourceProvider,
} from '@ray/charts-library';

<DataSourceProvider devId={deviceId} dpId={18} algorithmType="sum" unit="kWh" title="用电量">
  <ChartPeriodProvider initialGranularity="day">
    <View>
      <Text>用电趋势</Text>
      <ChartGranularityPicker options={['day', 'week', 'month', 'year']} type="card" />
      <ChartPeriodNavigator />
      <ChartSeriesPanel chartProps={{ customStyle: { width: '100%', height: '240px' } }} />
    </View>
  </ChartPeriodProvider>
</DataSourceProvider>
```

组合规则：

- `ChartPeriodProvider` 必须包裹 `ChartGranularityPicker`、`ChartPeriodNavigator`、`ChartSeriesPanel` 以及任何调用 `useChartPeriodContext()` 的组件。
- 嵌套在 `DataSourceProvider` 或 `ChartDataSourceProvider` 内时，**不要**给 `ChartPeriodProvider` 传 `loadData`——它会自动继承。
- 如果树中没有数据源 Provider，`ChartPeriodProvider` **必须**接收自己的 `loadData`，否则会抛出异常。

### 模式 5 — 自定义 UI + 上下文 Hook

```tsx
import CommonCharts from '@ray-js/common-charts';
import { Text, View } from '@ray-js/ray';
import {
  ChartPeriodProvider,
  seriesDataToOption,
  useChartPeriodContext,
  DataSourceProvider,
} from '@ray/charts-library';

function CustomEnergyChart() {
  const {
    granularity,
    range,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    setGranularity,
    refresh,
    loading,
    error,
    seriesData,
  } = useChartPeriodContext();

  const option = React.useMemo(() => seriesDataToOption(seriesData), [seriesData]);

  return (
    <View>
      <Text>当前粒度：{granularity}</Text>
      <CommonCharts
        option={option as never}
        loading={loading}
        errMsg={error?.message || ''}
        customStyle={{ width: '100%', height: '240px' }}
      />
    </View>
  );
}
```

`useChartPeriodContext()` **必须**在 `ChartPeriodProvider` 内部调用，否则会抛出异常。

### 核心类型速查

```ts
type DateGranularity = 'day' | 'week' | 'month' | 'year' | 'custom';
type DateRange = { start: number; end: number }; // 毫秒时间戳，闭区间

type MeasureStatisticType =
  | 'sum' | 'avg' | 'minux' | 'max' | 'min' | 'count' | 'recent' | string;

type MeasureDayDataInterval = 'hour' | '15min';
```

粒度 → 涂鸦 API 映射（`DataSourceProvider` 内部）：

- `day` + `hour` → `getStatisticsRangHour`
- `day` + `15min` → `getStatisticsRang15min`
- `week` / `month` → `getStatisticsRangDay`
- `year` → `getStatisticsRangMonth`
- `custom` **不被** `DataSourceProvider` 支持。如需自定义区间，使用 `ChartPeriodProvider` + 自定义 `loadData`。

### 图表选项工具函数

从 `@ray/charts-library` 导入：

- `seriesDataToOption(seriesData)` — 将 `loadData` 返回的对象（期望 `{ option }` 形状或原始 option 对象）转为 `@ray-js/common-charts` 可用的 ECharts `option`。
- `withXAxis(option, { granularity, points })` — 添加带粒度感知刻度稀疏策略的类目 x 轴：
  - `day` / `custom` → 仅显示首个、中间、末尾刻度
  - `week` / `year` → 显示所有刻度
  - `month` → 显示索引 0、7、14、21 及最后一个点的刻度
- `withTooltip(option, opts?)` — 添加 HTML 提示框（居顶居中）。需要 `unit` 设置在 `<CommonCharts>` 上或作为运行时变量注入。`formatter` / `position` 使用**字符串函数**；`position` 通常引用 `myChart`，需通过宿主的 `injectVars` 机制注入。

自定义 `buildOption` 示例（用于 `DataSourceProvider`）：

```tsx
import { withXAxis, withTooltip, type MeasureBuildOptionPayload } from '@ray/charts-library';

function buildOption(payload: MeasureBuildOptionPayload) {
  const g = payload.granularity === 'custom' ? 'day' : payload.granularity;
  return withTooltip(
    withXAxis(
      {
        series: [
          {
            name: '用电量',
            type: 'line',
            smooth: true,
            data: payload.points.map(p => p.value),
          },
        ],
      },
      { granularity: g, points: payload.points }
    ),
    { style: { titleStyle: { textAlign: 'left', color: 'var(--app-B3-N1)' } } }
  );
}
```

### 国际化 / i18n

`ChartPeriodProvider` 接受 `messages?: Partial<ChartMessages>`（与内置中文深度合并）。英文界面使用 `messages={CHART_MESSAGES_EN}`，从 `@ray/charts-library` 导入。

场景卡片不直接暴露 `messages`，但接受 `granularityLabels` 以及（温湿度和照度卡片）`algorithmLabels`、`emptySummaryText`、`maxThresholdLabel`、`minThresholdLabel`。

### Agent 工作流

生成代码时：

1. 通过上方决策树识别场景。如不确定，向用户展示表格并询问适用的模式。
2. 确认所选模式的必要输入：
   - 场景卡片：`devId`、`dpId`（或每个指标的 `dpId`）、`unit`，可选 `algorithmType`、`threshold` / `valueMapper`（温湿度）。
   - `ChartPeriodProvider` 独立使用：`loadData` 签名。
3. 编写 TSX，严格使用 `@ray/charts-library` 中文档记录的导入。
4. 如果用户需要自定义 ECharts option，默认使用 `withXAxis` +（可选）`withTooltip`。传入 `withXAxis` 前将 `'custom'` 映射为 `'day'`。
5. 如果省略了 `algorithmType` 但用户期望有汇总，说明默认行为：库会选取第一个匹配的配置项；如无匹配则回退到类似 `sum` 的逻辑。
6. 编辑已有页面时，先读取文件再扩展——不要重复创建 Provider。

优先编辑已有文件而非创建新文件。生成后快速检查导入是否匹配 `@ray/charts-library` 的导出（见 `reference.md`）。

### 补充资源

- 所有组件和属性的完整 API 表格：[reference.md](reference.md)
- 每种模式的完整可运行代码片段：[examples.md](examples.md)

## 注意事项 {#tip}

### 关键注意事项（每次都需检查）

1. **单 Provider 规则**：场景卡片（`EleChartCard` / `TempAndHumChartCard` / `IlluminanceChartCard`）自带 `ChartPeriodProvider`。不要在外部再包一层 `ChartPeriodProvider`。只有 `EleChartCard` 需要外部的 `DataSourceProvider`（其余两个内部自带）。
2. **`ChartPeriodProvider` 的 children 类型**：`children` 是必须的。不能向 `EleChartCard` 传递 `children` 或 `messages`。
3. **`useChartPeriodContext` 的位置**：必须在 `ChartPeriodProvider` 内部。场景卡片内部已提供——要读取上下文需要在卡片*内部*自定义子树（通常不是用户想要的，推荐使用模式 4/5）。
4. **自定义粒度**：`'custom'` 对 `ChartPeriodProvider` 有效，但 `DataSourceProvider` **不支持**。如需自定义区间 + 涂鸦 API，用户必须自行提供 `loadData` + 使用 `shiftCustomRange`。
5. **温湿度和照度默认不含 `week`**：场景卡片默认 `granularityOptions` 为 `['day','month','year']`。仅当 DP 确实支持按天聚合（周维度）时才添加 `'week'`。
6. **提示框需要 unit**：使用 `withTooltip` 时，确保 `unit` 属性传入了 `<CommonCharts>`（或作为注入的运行时变量），否则提示框格式化函数会报错。
7. **避免重复请求**：当 `DataSourceProvider` 已在祖先节点时，不要给 `ChartPeriodProvider` 传 `loadData`——这会静默覆盖注入的数据源。
8. **开发环境 Mock**：本地开发无真实设备时，在 `DataSourceProvider` 上使用 `api={createMockMeasureApi(...)}`（参考库仓库中的 `example/src/mock/measureStatisticsApi.ts` 或用户自己的 mock）。
9. **场景卡片不支持 `custom`**：`TempAndHumChartCard` / `IlluminanceChartCard` 依赖内部的 `DataSourceProvider`，该组件不支持 `custom` 粒度。
