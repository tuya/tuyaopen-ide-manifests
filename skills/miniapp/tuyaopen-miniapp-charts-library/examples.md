# @ray/charts-library — 完整示例

每种模式的端到端、可直接粘贴的代码片段。除特别说明外，所有导入均来自 `@ray/charts-library`。

## 1. 最简用电量卡片

```tsx
import React from 'react';
import { DataSourceProvider, EleChartCard } from '@ray/charts-library';

export default function EnergyPage() {
  return (
    <DataSourceProvider
      devId="your-device-id"
      dpId={18}
      algorithmType="sum"
      unit="kWh"
      title="用电量"
    >
      <EleChartCard initialGranularity="day" />
    </DataSourceProvider>
  );
}
```

## 2. 暗色主题用电量卡片（自定义标签 + Mock API）

```tsx
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { DataSourceProvider, EleChartCard } from '@ray/charts-library';
import { createMockMeasureApi } from '../mock/measureStatisticsApi';

const DP_ID = 36;
const USE_MOCK = true;

export default function EnergyPage({ devId }: { devId: string }) {
  const commonDataSourceProps = useMemo(
    () => ({
      devId,
      dpId: DP_ID,
      title: '用电量',
      unit: 'kWh',
      noDataText: '无数据',
      ...(USE_MOCK ? { api: createMockMeasureApi(DP_ID) } : {}),
    }),
    [devId]
  );

  return (
    <DataSourceProvider {...commonDataSourceProps}>
      <EleChartCard
        theme="dark"
        title="用电量"
        noDataText="无数据"
        granularityLabels={{ day: '日', week: '周', month: '月', year: '年' }}
        initialGranularity="day"
        initialRange={{
          start: dayjs().startOf('day').valueOf(),
          end: dayjs().endOf('day').valueOf(),
        }}
        chartHeight="520rpx"
        chartProps={{ loadingText: '加载中...' }}
      />
    </DataSourceProvider>
  );
}
```

## 3. 温湿度卡片（带阈值线和指标切换）

```tsx
import React, { useMemo } from 'react';
import { TempAndHumChartCard } from '@ray/charts-library';

export default function EnvironmentPage({ devId }: { devId: string }) {
  const temperature = useMemo(
    () => ({
      dpId: 101,
      label: '温度',
      unit: '℃',
      threshold: { min: 18, max: 26 },
      // DP 返回 x10 整数，转为浮点数：
      valueMapper: (v: number) => v / 10,
      summaryValueMapper: (v: number) => Math.round(v * 10) / 10,
    }),
    []
  );
  const humidity = useMemo(
    () => ({
      dpId: 102,
      label: '湿度',
      unit: '%',
      threshold: { min: 40, max: 70 },
    }),
    []
  );

  return (
    <TempAndHumChartCard
      devId={devId}
      title="环境"
      defaultMetric="temp"
      temperature={temperature}
      humidity={humidity}
      granularityOptions={['day', 'month', 'year']}
      granularityLabels={{ day: '日', month: '月', year: '年' }}
      algorithmLabels={{ avg: '平均', max: '最大', min: '最小' }}
      emptySummaryText="暂无数据"
      maxThresholdLabel="上限"
      minThresholdLabel="下限"
    />
  );
}
```

## 4. 照度卡片

```tsx
import React from 'react';
import { IlluminanceChartCard } from '@ray/charts-library';

export default function IlluminancePage({ devId }: { devId: string }) {
  return (
    <IlluminanceChartCard
      devId={devId}
      dpId={103}
      title="照度"
      metricLabel="照度"
      unit="lux"
      lineColor="#F39734"
      granularityOptions={['day', 'month', 'year']}
      emptySummaryText="暂无数据"
    />
  );
}
```

## 5. 自由组合（自定义布局）

```tsx
import React from 'react';
import { Text, View } from '@ray-js/ray';
import {
  ChartGranularityPicker,
  ChartPeriodNavigator,
  ChartPeriodProvider,
  ChartSeriesPanel,
  DataSourceProvider,
} from '@ray/charts-library';

export default function EnergyFreePage({ devId }: { devId: string }) {
  return (
    <DataSourceProvider devId={devId} dpId={18} algorithmType="sum" unit="kWh" title="用电量">
      <ChartPeriodProvider initialGranularity="day">
        <View>
          <Text>用电趋势 — 自由组合</Text>
          <ChartGranularityPicker options={['day', 'week', 'month', 'year']} type="card" />
          <ChartPeriodNavigator />
          <ChartSeriesPanel chartProps={{ customStyle: { width: '100%', height: '420rpx' } }} />
        </View>
      </ChartPeriodProvider>
    </DataSourceProvider>
  );
}
```

## 6. 自定义 UI + `useChartPeriodContext`

```tsx
import React, { useMemo } from 'react';
import CommonCharts from '@ray-js/common-charts';
import { Text, View } from '@ray-js/ray';
import dayjs from 'dayjs';
import {
  ChartPeriodProvider,
  DataSourceProvider,
  seriesDataToOption,
  useChartPeriodContext,
} from '@ray/charts-library';

const OPTIONS = [
  { key: 'day' as const, label: '日' },
  { key: 'week' as const, label: '周' },
  { key: 'month' as const, label: '月' },
  { key: 'year' as const, label: '年' },
];

function CustomUiChart() {
  const {
    granularity, range,
    canGoPrev, canGoNext, goPrev, goNext, setGranularity, refresh,
    loading, error, seriesData,
  } = useChartPeriodContext();

  const option = useMemo(() => seriesDataToOption(seriesData), [seriesData]);
  const rangeText = `${dayjs(range.start).format('YYYY-MM-DD')} ~ ${dayjs(range.end).format('YYYY-MM-DD')}`;

  return (
    <View>
      <Text>自定义 UI + 上下文</Text>
      <Text>{rangeText}</Text>
      <View>
        {OPTIONS.map(item => (
          <Text
            key={item.key}
            onClick={() => setGranularity(item.key)}
            style={{ opacity: granularity === item.key ? 1 : 0.5, marginRight: 12 }}
          >
            {item.label}
          </Text>
        ))}
      </View>
      <View>
        <Text onClick={() => canGoPrev && goPrev()} style={{ opacity: canGoPrev ? 1 : 0.4 }}>上一页</Text>
        <Text onClick={refresh}>刷新</Text>
        <Text onClick={() => canGoNext && goNext()} style={{ opacity: canGoNext ? 1 : 0.4 }}>下一页</Text>
      </View>
      {error ? <Text>{error.message}</Text> : null}
      <CommonCharts
        option={option as never}
        loading={loading}
        errMsg={error?.message || ''}
        customStyle={{ width: '100%', height: '440rpx' }}
      />
    </View>
  );
}

export default function CustomPage({ devId }: { devId: string }) {
  return (
    <DataSourceProvider devId={devId} dpId={18} algorithmType="sum" unit="kWh">
      <ChartPeriodProvider initialGranularity="day">
        <CustomUiChart />
      </ChartPeriodProvider>
    </DataSourceProvider>
  );
}
```

## 7. 自定义 `buildOption`（使用 `withXAxis` + `withTooltip`）

```tsx
import {
  DataSourceProvider,
  EleChartCard,
  withTooltip,
  withXAxis,
  type MeasureBuildOptionPayload,
  type MeasureChartPoint,
} from '@ray/charts-library';

function resolveChartGranularity(g: MeasureBuildOptionPayload['granularity']) {
  return g === 'custom' ? 'day' : g;
}

function buildOption(payload: MeasureBuildOptionPayload) {
  const g = resolveChartGranularity(payload.granularity);
  const points: MeasureChartPoint[] = payload.points;
  return withTooltip(
    withXAxis(
      {
        series: [
          {
            name: '用电量',
            type: 'line',
            smooth: true,
            data: points.map(p => p.value),
          },
        ],
      },
      { granularity: g, points }
    ),
    { style: { titleStyle: { textAlign: 'left', color: 'var(--app-B3-N1)' } } }
  );
}

export default function Page({ devId }: { devId: string }) {
  return (
    <DataSourceProvider
      devId={devId}
      dpId={18}
      algorithmType="sum"
      unit="kWh"
      title="用电量"
      buildOption={buildOption}
    >
      <EleChartCard theme="dark" chartHeight="520rpx" />
    </DataSourceProvider>
  );
}
```

## 8. 非涂鸦数据源（通过 `ChartPeriodProvider`）

不使用涂鸦计量 API 时，跳过 `DataSourceProvider`，直接提供 `loadData`。

```tsx
import React from 'react';
import { Text, View } from '@ray-js/ray';
import {
  ChartGranularityPicker,
  ChartPeriodNavigator,
  ChartPeriodProvider,
  ChartSeriesPanel,
} from '@ray/charts-library';

export default function CustomDataSourcePage() {
  return (
    <ChartPeriodProvider
      initialGranularity="day"
      loadData={async ({ granularity, range }) => {
        const res = await fetch(
          `/api/trend?g=${granularity}&start=${range.start}&end=${range.end}`,
        );
        const json = await res.json();
        return {
          option: {
            xAxis: { type: 'category', data: json.labels },
            yAxis: { type: 'value' },
            series: [{ type: 'line', data: json.values }],
          },
        };
      }}
    >
      <View>
        <Text>自定义数据源</Text>
        <ChartGranularityPicker options={['day', 'week', 'month']} type="line" />
        <ChartPeriodNavigator />
        <ChartSeriesPanel chartProps={{ customStyle: { width: '100%', height: '240px' } }} />
      </View>
    </ChartPeriodProvider>
  );
}
```

## 9. 英文国际化

```tsx
import { ChartPeriodProvider, CHART_MESSAGES_EN, EleChartCard } from '@ray/charts-library';

// 自由组合模式下，将 messages 传给 ChartPeriodProvider：
<ChartPeriodProvider initialGranularity="day" messages={CHART_MESSAGES_EN}>
  {/* ... */}
</ChartPeriodProvider>

// EleChartCard 不接受 messages，仅通过 granularityLabels 覆盖标签：
<EleChartCard granularityLabels={{ day: 'Day', week: 'Week', month: 'Month', year: 'Year' }} />
```

## 10. 部分消息覆盖

```tsx
<ChartPeriodProvider
  initialGranularity="day"
  messages={{ granularity: { day: '按天' } }}
>
  {/* ... */}
</ChartPeriodProvider>
```

## 11. 自定义粒度区间 + `shiftCustomRange`

```tsx
import dayjs from 'dayjs';
import { ChartPeriodProvider } from '@ray/charts-library';

<ChartPeriodProvider
  initialGranularity="custom"
  initialRange={{
    start: dayjs().startOf('day').subtract(6, 'day').valueOf(),
    end: dayjs().endOf('day').valueOf(),
  }}
  shiftCustomRange={(range, direction) => {
    const step = range.end - range.start + 1;
    return {
      start: range.start + direction * step,
      end: range.end + direction * step,
    };
  }}
  loadData={async ({ range }) => {
    // ...
    return { option: {/* ... */} };
  }}
>
  {/* ... */}
</ChartPeriodProvider>
```

注意：`DataSourceProvider` **不支持** `'custom'` 粒度——使用 `ChartPeriodProvider` + 自定义 `loadData`。
