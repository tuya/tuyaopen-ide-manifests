# @ray/charts-library — API 参考

所有公开组件的完整属性表。当 SKILL.md 的速查表不够用时参阅此文档。

## 顶级导出

从 `@ray/charts-library` 导入：

**Provider 与上下文**
- `DataSourceProvider` — 涂鸦计量数据源
- `MeasureDataSourceProvider` — `DataSourceProvider` 的别名
- `ChartDataSourceProvider`、`ChartDataSourceContext`、`useChartDataSourceContext`
- `ChartPeriodProvider` / 别名 `ChartsProvider`
- `ChartPeriodContext` / 别名 `ChartsContext`
- `useChartPeriodContext` / 别名 `useChartsContext`

**UI 构建块**
- `ChartGranularityPicker` / 别名 `DateGranularitySwitcher`
- `ChartPeriodNavigator` / 别名 `DateRangeBar`
- `ChartSeriesPanel` / 别名 `ChartsPanel`

**场景卡片**
- `EleChartCard`
- `TempAndHumChartCard` + `DEFAULT_TEMP_HUM_CHART_COLORS`
- `IlluminanceChartCard`

**工具函数**
- `seriesDataToOption`
- `withXAxis`、`withTooltip`（来自 `charts/option`）
- `formatRangeLabelWithConfig`
- `CHART_MESSAGES_EN`、`CHART_MESSAGES_ZH_CN`、`resolveChartMessages`
- `buildStatisticsConfigCacheKey`、`clearStatisticsConfigCache`、`stableStringifyRecord`

**导出类型（非完整列表）**
- `DateGranularity`、`DateRange`
- `ChartPeriodState`、`ChartPeriodActions`、`ChartPeriodContextValue`、`ChartPeriodProviderProps`
- `ChartDataSourceProviderProps`、`ChartDataSourceContextValue`
- `DataSourceProviderProps`、`MeasureApi`、`MeasureChartData`、`MeasureChartPoint`、`MeasureBuildOptionPayload`
- `MeasureStatisticType`、`MeasureStatisticInterval`、`MeasureDayDataInterval`、`MeasureStatisticsConfigItem`、`MeasureStatisticsMap`
- `MeasureStatisticsRang15minRequestParams`、`MeasureStatisticsRangHourRequestParams`、`MeasureStatisticsRangDayRequestParams`、`MeasureStatisticsRangMonthRequestParams`
- `BeforeMeasureStatisticsRequest`、`BeforeMeasureStatisticsRequestArgs`
- `ChartMessages`、`ChartRangeLabelMessages`
- `ChartGranularityPickerProps`、`ChartPeriodNavigatorProps`、`ChartSeriesPanelProps`、`ChartSeriesPanelChartProps`
- `EleChartCardProps`、`EleChartCardData`、`EleChartCardTheme`
- `TempAndHumChartCardProps`、`TempAndHumMetricConfig`、`TempHumChartColorProps`
- `IlluminanceChartCardProps`

## `DataSourceProvider`

涂鸦计量数据源。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `devId` | `string` | — | 必填 |
| `dpId` | `string `| number` | — | 必填 |
| `algorithmType` | `MeasureStatisticType` | `undefined` | 见下方解析规则 |
| `dayInterval` | `'hour' | '15min'` | `'hour'` | 仅对 `day` 粒度生效 |
| `title` | `string` | — | 写入 `summary.title` |
| `unit` | `string` | — | 写入 `summary.unit` |
| `noDataText` | `string` | `'无数据'` | 写入 `summary.noDataText` |
| `autoLoadConfig` | `boolean` | `true` | 自动调用 `getStatisticsConfig` |
| `configEntries` | `MeasureStatisticsConfigItem[]` | — | 设置后跳过配置拉取 |
| `statisticsConfigParams` | `Record<string, unknown>` | — | 合并到 `getStatisticsConfig` 参数中的额外字段 |
| `statisticsConfigCacheKey` | `string` | — | 完全覆盖配置缓存 key |
| `beforeRequest` | `BeforeMeasureStatisticsRequest` | — | 重写每次请求的参数 |
| `buildOption` | `(payload) => Record<string, unknown>` | 内置折线图 | 自定义 option 生成器 |
| `api` | `Partial<MeasureApi>` | Ray 内置 | 覆盖计量 API |
| `children` | `ReactNode` | — | 必填 |

**`algorithmType` 解析规则**
- 如果提供了，按 `dpId` + 当前 `statisticInterval` + `algorithmType` 匹配。
- 如果省略，按 `dpId` + `statisticInterval` 匹配；取第一个匹配项；匹配项的 `algorithmType` 成为有效类型。
- 自动加载的配置会将缺失的 `algorithmType` 标准化为 `'sum'`。
- 如果没有匹配的配置项且 `algorithmType` 也被省略，API 调用时不带 `type`；汇总回退到类似 `sum` 的行为。

**粒度 → 内部 API 映射**
- `day` + `hour` → `getStatisticsRangHour`
- `day` + `15min` → `getStatisticsRang15min`
- `week` / `month` → `getStatisticsRangDay`
- `year` → `getStatisticsRangMonth`
- `custom` 不被 `DataSourceProvider` 支持。

## `ChartDataSourceProvider`

用于自定义数据层，无需涂鸦特定管道即可为 `ChartPeriodProvider` 提供数据。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `{ loadData, getNavigationBounds? }` | 上游注入的函数 |
| `children` | `ReactNode` | 必填 |

## `ChartPeriodProvider`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 必填 |
| `loadData` | `(ctx: { granularity, range }) => Promise<unknown>` | 从祖先继承 | 如果没有祖先数据 Provider，则此属性必填 |
| `initialGranularity` | `DateGranularity` | `'day'` | |
| `initialRange` | `{ start: number; end: number }` | 根据粒度 + 当前时间计算 | 毫秒 |
| `getNavigationBounds` | `(g) => Partial<{ minStart; maxEnd }> \| undefined` | 继承 / 内置 | 返回 `undefined` 表示该粒度无库级别边界 |
| `onStateChange` | `(state: ChartPeriodState) => void` | — | 状态变更时回调（不含 `messages`） |
| `shiftCustomRange` | `(range, direction: -1 \| 1) => DateRange` | — | 仅 `custom` 粒度 |
| `alignRangeToBounds` | `boolean` | `true` | 将 `setRange` 结果裁剪到边界内 |
| `messages` | `Partial<ChartMessages>` | — | 与内置中文深度合并 |

行为：
- 切换粒度时会将 `range` 重新锚定到"当前时间"并裁剪到新边界。
- 没有 `loadData`（自身或继承的）时会抛出异常。

## `EleChartCard`

继承 `ChartPeriodProviderProps`（不含 `children` 和 `messages`）。

自身属性：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `className` | `string` | — | |
| `style` | `CSSProperties` | — | |
| `theme` | `'light' \| 'dark'` | `'light'` | |
| `title` | `string` | `'用电量'` | 默认标题 |
| `unit` | `string` | `'kWh'` | |
| `noDataText` | `string` | `'无数据'` | |
| `chartHeight` | `string \| number` | `'420rpx'` | |
| `chartProps` | `Partial<RayCommonChartsProps>` | — | 透传给 `CommonCharts` |
| `granularityOptions` | `DateGranularity[]` | `['day','week','month','year']` | |
| `granularityLabels` | `Partial<Record<DateGranularity, string>>` | — | |
| `formatRangeLabel` | `(range, granularity) => string` | 内置 | |
| `getSummary` | `(data) => { title?; value?; unit?; empty?; noDataText? } \| undefined` | — | 自定义汇总提取 |

从 `ChartPeriodProviderProps` 继承：`initialGranularity`、`initialRange`、`loadData`、`getNavigationBounds`、`onStateChange`、`shiftCustomRange`、`alignRangeToBounds`。

**不接受** `children` 和 `messages`。

## `TempAndHumChartCard`

内部自带 `DataSourceProvider` + `ChartPeriodProvider`。通过 `${metricKey}-${dpId}` 作为 key，切换指标时会重新挂载数据源。

透传给 `DataSourceProvider` 的属性：`devId`、`algorithmType`、`dayInterval`、`autoLoadConfig`、`configEntries`、`statisticsConfigParams`、`statisticsConfigCacheKey`、`beforeRequest`、`api`。

透传给 `ChartPeriodProvider` 的属性（均可选）：`initialGranularity`、`initialRange`、`onStateChange`、`shiftCustomRange`、`alignRangeToBounds`。**不接受** `children`、`messages`、`loadData`、`getNavigationBounds`。

自身属性：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `className` | `string` | — | |
| `style` | `CSSProperties` | — | |
| `title` | `string` | `'图表'` | |
| `temperature` | `TempAndHumMetricConfig` | — | 见下方 |
| `humidity` | `TempAndHumMetricConfig` | — | 见下方 |
| `defaultMetric` | `'temp' \| 'humidity'` | 第一个提供的 | |
| `chartHeight` | `string \| number` | `'256px'` | |
| `chartProps` | `ChartSeriesPanelChartProps` | — | 透传给内部 `CommonCharts`；卡片还连接了 `on.showTip` / `on.hideTip` 来显示/隐藏周期汇总 |
| `colors` | `TempHumChartColorProps` | `DEFAULT_TEMP_HUM_CHART_COLORS` | 每个指标的线条/区域颜色 |
| `granularityOptions` | `DateGranularity[]` | `['day','month','year']` | |
| `granularityLabels` | `Partial<Record<DateGranularity, string>>` | — | |
| `emptySummaryText` | `string` | `'暂无数据'` | |
| `algorithmLabels` | `SceneChartAlgorithmLabels` | 内置中文 | 汇总统计旁显示的标签 |
| `maxThresholdLabel` | `string` | `'上限'` | |
| `minThresholdLabel` | `string` | `'下限'` | |

`TempAndHumMetricConfig`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dpId` | `string \| number` | 必填 |
| `label` | `string` | 必填；显示为副标题和提示框内容 |
| `unit` | `string` | 必填 |
| `icon` | `string` | 切换按钮的图标 URL |
| `threshold` | `{ min: number; max: number }` | 渲染参考线；省略则不显示 |
| `valueMapper` | `(value: number) => number | null` | 每个数据点的值转换（如 ÷10） |
| `summaryValueMapper` | `(value: number) => number` | 仅转换汇总聚合值 |

## `IlluminanceChartCard`

内部自带 `DataSourceProvider` + `ChartPeriodProvider`。透传结构与 `TempAndHumChartCard` 相同，但为单指标。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `devId` | `string` | — | 透传给 `DataSourceProvider` |
| `dpId` | `string \| number` | — | 透传给 `DataSourceProvider` |
| `algorithmType`、`dayInterval`、`autoLoadConfig`、`configEntries`、`statisticsConfigParams`、`statisticsConfigCacheKey`、`beforeRequest`、`api` | — | — | 透传给 `DataSourceProvider` |
| `initialGranularity`、`initialRange`、`onStateChange`、`shiftCustomRange`、`alignRangeToBounds` | — | — | 透传给 `ChartPeriodProvider` |
| `className` / `style` | — | — | |
| `title` | `string` | `'图表'` | |
| `metricLabel` | `string` | `'照度'` | 汇总标题 |
| `unit` | `string` | `'lux'` | |
| `lineColor` | `string` | `'#F39734'` | |
| `chartHeight` | `string \| number` | `'256px'` | |
| `chartProps` | `ChartSeriesPanelChartProps` | — | 透传；`on.showTip/hideTip` 自动连接 |
| `granularityOptions` | `DateGranularity[]` | `['day','month','year']` | |
| `granularityLabels` | `Partial<Record<DateGranularity, string>>` | — | |
| `emptySummaryText` | `string` | `'暂无数据'` | |
| `algorithmLabels` | `SceneChartAlgorithmLabels` | — | |

## `ChartGranularityPicker`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | `DateGranularity[]` | `['day','week','month','year']` | |
| `renderItem` | `(g, active, onSelect) => ReactNode` | — | 自定义每项渲染；必须调用 `onSelect()` 来切换 |
| `type` | `'card' \| 'line'` | `'card'` | `card` = 分段轨道，`line` = 下划线 |
| `color` | `string` | — | 激活滑块背景色（card）或条形颜色（line） |
| `lineWidth` | `number` | — | 仅 line 模式（px） |
| `duration` | `number` | `0.3` | 滑块过渡秒数 |
| `className` | `string` | — | |
| `style` | `CSSProperties` | — | |

Tab 文字来自 `messages.granularity.*`。

## `ChartPeriodNavigator`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `formatRangeLabel` | `(range, granularity) => string` | 覆盖中间标签 |
| `renderLabel` | `ComponentType<{ label: string }> \| render prop` | 完全自定义标签区域 |
| `renderPrev` / `renderNext` | Component 或 `(props: ChartPeriodNavButtonProps) => ReactNode` | 自定义按钮 |
| `navButtonDisabledStyle` | `CSSProperties` | 与默认禁用样式合并 |
| `navButtonDisabledClassName` | `string` | 禁用时的额外 class |
| `className` / `style` | — | |

`ChartPeriodNavButtonProps`：`{ disabled, onPress, disabledStyle, disabledClassName }`。

## `ChartSeriesPanel`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `chartProps` | `Partial<RayCommonChartsProps>` | 透传给 `CommonCharts`；面板注入 `option`、`loading`、`errMsg` |
| `renderChart` | `(seriesData, ctx) => ReactNode` | 设置后禁用默认图表路径 |
| `renderLoading` | `(ctx) => ReactNode` | 自定义加载状态 |
| `renderError` | `(ctx) => ReactNode` | `error` 存在时渲染 |

默认错误文本：`error.message || messages.chart.errorFallback`。

## `useChartPeriodContext()`

必须在 `ChartPeriodProvider` 内部调用。返回：

状态：
- `granularity: DateGranularity`
- `range: DateRange`（毫秒，闭区间）
- `navigationBounds: Partial<{ minStart; maxEnd }> | undefined`
- `canGoPrev: boolean`、`canGoNext: boolean`
- `seriesData: unknown` — 最后一次成功的 `loadData` 结果
- `loading: boolean`
- `error: Error | null`

操作：
- `setGranularity(g)` — 切换粒度并重新拉取
- `setRange(r)` — 受边界 + `alignRangeToBounds` 约束
- `goPrev()` / `goNext()`
- `refresh()`

消息：
- `messages: ChartMessages` — 解析后的完整消息树

## `MeasureApi`

```ts
interface MeasureApi {
  getStatisticsConfig: (params: { devId: string } & Record<string, unknown>) =>
    Promise<MeasureStatisticsConfigItem[]>;
  getStatisticsRang15min: (params: {
    devId: string; dpId: string | number; date: string; type?: MeasureStatisticType;
  }) => Promise<MeasureStatisticsMap>;
  getStatisticsRangHour: (params: {
    devId: string; dpId: string | number; date: string; type?: MeasureStatisticType;
  }) => Promise<MeasureStatisticsMap>;
  getStatisticsRangDay: (params: {
    devId: string; dpId: string | number; startDay: string; endDay: string; type?: MeasureStatisticType;
  }) => Promise<MeasureStatisticsMap>;
  getStatisticsRangMonth: (params: {
    devId: string; dpId: string | number; startMonth: string; endMonth: string; type?: MeasureStatisticType;
  }) => Promise<MeasureStatisticsMap>;
}
```

`MeasureStatisticsMap` 为 `Record<string, string>` — API 返回以时间戳为 key、数字字符串为 value 的映射，Provider 内部解析。

## `MeasureChartPoint` / `MeasureBuildOptionPayload`

```ts
interface MeasureChartPoint {
  key: string;
  label: string;
  timestamp: number;
  value: number | null;
}

interface MeasureBuildOptionPayload {
  granularity: DateGranularity;
  range: DateRange;
  points: MeasureChartPoint[];
  raw: Record<string, string>;
}
```

## `MeasureChartData`

`DataSourceProvider` 内部 `loadData` 返回的数据结构：

```ts
interface MeasureChartData {
  raw: Record<string, string>;
  points: MeasureChartPoint[];
  option: Record<string, unknown>;
  summary: { title?: string; value: number; unit?: string; empty: boolean; noDataText?: string };
  meta: {
    devId: string;
    dpId: string | number;
    granularity: DateGranularity;
    range: DateRange;
    algorithmType?: MeasureStatisticType;
    statisticInterval: MeasureStatisticInterval;
    config?: MeasureStatisticsConfigItem;
  };
}
```

## 样式 CSS 变量

场景卡片和构建块暴露了很多 CSS 变量；完整列表在库的 README（`node_modules/@ray/charts-library/README.md`）和 `src/charts/` 下的源文件中。常用的有：

- `ChartGranularityPicker`：`--tabs-card-background-color`、`--tabs-card-text-active-color`、`--tabs-card-active-background-color`、`--tab-font-size`、`--tabs-bottom-bar-color`、`--tabs-bottom-bar-height` 等。
- `ChartPeriodNavigator`：`--chart-period-nav-btn-bg`、`--chart-period-nav-btn-size`、`--chart-period-nav-icon-color`、`--chart-period-nav-label-color`、`--chart-period-nav-btn-disabled-opacity` 等。

完整列表请阅读**库源码**中的 `src/charts/ChartGranularityPicker.less` 和 `src/charts/ChartPeriodNavigator.less`（node_modules 或库仓库），但以 README 为权威 API 参考。
