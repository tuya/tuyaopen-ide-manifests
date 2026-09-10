# Capability: Electric Statistics

用电量统计能力的完整实现规范：统计 API 调用、数据计算、图表展示。

> 前置条件：需在小程序开发者平台「开发设置 → 云能力」授权，且需提交工单开通产品数据统计。
> 统计 API 仅在真机或打包后可用，开发者工具环境无法调用。

## Knowledge

### 依赖 DP

| DP code       | 类型  | 说明     | 换算               |
| ------------- | ----- | -------- | ------------------ |
| `add_ele`     | value | 增加电量 | 原始值 / 100 = kWh |
| `cur_power`   | value | 实时功率 | 原始值 / 10 = W    |
| `cur_voltage` | value | 当前电压 | 原始值 / 10 = V    |
| `cur_current` | value | 当前电流 | mA（无需换算）     |

### 统计 API 总览

所有 API 从 `@ray-js/ray`（>=1.2.12）导入。

| API                      | 粒度    | 日期参数                            | 格式                        |
| ------------------------ | ------- | ----------------------------------- | --------------------------- |
| `getStatisticsConfig`    | —       | `devId`                             | 获取已开通统计的 DP 配置    |
| `getStatisticsRang15min` | 15 分钟 | `date`（yyyyMMdd）                  | 单日，key 如 `202305110015` |
| `getStatisticsRangHour`  | 小时    | `date`（yyyyMMdd）                  | 单日，key 如 `2023051118`   |
| `getStatisticsRangDay`   | 天      | `startDay` + `endDay`（yyyyMMdd）   | 区间，key 如 `20230510`     |
| `getStatisticsRangMonth` | 月      | `startMonth` + `endMonth`（yyyyMM） | 区间，key 如 `202305`       |

### getStatisticsConfig — 获取统计配置

查询设备已开通统计的 DP 列表及其配置信息。可用于确认哪些 DP 已开通统计，非必须前置调用。

```ts
import { getStatisticsConfig } from '@ray-js/ray';

const configs = await getStatisticsConfig({ devId });
// => Array<{ dpId, algorithmType, statisticInterval, storageDuration, productId }>
```

| 返回字段            | 类型   | 说明                                           |
| ------------------- | ------ | ---------------------------------------------- |
| `dpId`              | number | DP id                                          |
| `algorithmType`     | string | 统计类型（sum/avg/minux/max/min/count/recent） |
| `statisticInterval` | number | 统计间隔：1=天, 2=小时, 4=月, 16=15 分钟       |
| `storageDuration`   | number | 数据保存天数                                   |

### getStatisticsRangHour — 按小时统计

```ts
import { getStatisticsRangHour } from '@ray-js/ray';

const data = await getStatisticsRangHour({
  devId,
  dpId: '18', // DP id（string | number）
  date: '20230511', // yyyyMMdd 格式
  type: 'sum', // 可选，默认 sum
  auto: 0, // 可选，0=不填充, 1=填充前值, 2=填充#
});
// => { "2023051117": "0.00", "2023051118": "24.00", ... }
```

### getStatisticsRangDay — 按天统计

```ts
import { getStatisticsRangDay } from '@ray-js/ray';

const data = await getStatisticsRangDay({
  devId,
  dpId: '18',
  startDay: '20230501', // 开始日期 yyyyMMdd
  endDay: '20230511', // 结束日期 yyyyMMdd
  type: 'sum',
});
// => { "20230501": "0", "20230510": "26.00", "20230511": "24.00" }
```

### getStatisticsRangMonth — 按月统计

```ts
import { getStatisticsRangMonth } from '@ray-js/ray';

const data = await getStatisticsRangMonth({
  devId,
  dpId: '18',
  startMonth: '202304', // 开始月份 yyyyMM
  endMonth: '202305', // 结束月份 yyyyMM
  type: 'sum',
});
// => { "202304": "0", "202305": "24.00" }
```

### getStatisticsRang15min — 按 15 分钟统计

```ts
import { getStatisticsRang15min } from '@ray-js/ray';

const data = await getStatisticsRang15min({
  devId,
  dpId: '18',
  date: '20230511',
  type: 'sum',
});
// => { "202305110000": "1312.02", "202305110015": "1249.49", ... }
```

### 公共参数说明

**type — 统计类型**

| type     | 说明                                | 适用场景           |
| -------- | ----------------------------------- | ------------------ |
| `sum`    | 时段内数据累加总和                  | 用电量、用水量     |
| `minux`  | 时段最大值 - 上一时段最大值（增量） | 电表/水表时段用量  |
| `avg`    | 时段内数据平均值                    | 温度、湿度         |
| `max`    | 时段内最大值                        | 峰值功率           |
| `min`    | 时段内最小值                        | 最低温度           |
| `count`  | 时段内上报次数                      | 开关次数、事件频次 |
| `recent` | 离整点最近的一个点（仅支持按小时）  | 整点采样折线图     |

> 注意：`minux` 是历史拼写错误（应为 minus），但接口保持此名称不变。

**auto — 空数据填充**

| 值  | 行为                                   |
| --- | -------------------------------------- |
| `0` | 不填充，无数据的时段不返回 key（默认） |
| `1` | 填充上一个相邻时段的值                 |
| `2` | 填充 `#` 占位符，业务自行处理          |

### 图表组件 @ray-js/stat-charts

```bash
npm install @ray-js/stat-charts
```

```tsx
import StatCharts from '@ray-js/stat-charts';

// 用电量日统计（按小时柱形图）
<StatCharts
  devIdList={[devId]}
  dpList={[{ id: 18, name: Strings.getLang('add_ele') }]}
  unit="kWh"
  range="1hour"         // 粒度：15min | 1hour | 1day | 1month
  type="sum"
  startDate="20230511"  // yyyyMMdd
  chartType="bar"       // line | bar | line-area
/>

// 月度电量统计
<StatCharts
  devIdList={[devId]}
  dpList={[{ id: 18, name: Strings.getLang('add_ele') }]}
  unit="kWh"
  range="1month"
  type="sum"
  startDate="202301"
  endDate="202312"
  chartType="bar"
/>
```

**关键 Props**

| Prop        | 类型                             | 必填 | 说明                                                |
| ----------- | -------------------------------- | ---- | --------------------------------------------------- |
| `devIdList` | string[]                         | Y    | 设备 ID 列表（暂不支持多个）                        |
| `dpList`    | `{ id: number, name: string }[]` | Y    | DP 列表                                             |
| `range`     | string                           | Y    | 粒度：`15min` / `1hour` / `1day` / `1month`         |
| `type`      | string                           | N    | 统计类型，默认 `sum`                                |
| `unit`      | string                           | Y    | 单位（kWh、W、V 等）                                |
| `startDate` | string                           | Y    | 起始日期（YYYYMMDD 或 YYYYMM）                      |
| `endDate`   | string                           | N    | 结束日期（range 为 1day/1month 时需要）             |
| `chartType` | string                           | N    | 图表类型：`line` / `bar` / `line-area`，默认 `line` |
| `theme`     | string                           | N    | 主题：`light` / `dark`                              |
| `dataZoom`  | number                           | N    | 显示数据轴百分比，负值从右侧开始                    |

### 获取今日/昨日用电量（推荐）

使用 `getStatisticsRangDay` 一次请求获取两天数据，返回 `{ [YYYYMMDD]: string }` 的 map。

```ts
import { getStatisticsRangDay } from '@ray-js/ray';
import { useDevInfo } from '@ray-js/panel-sdk';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function getTodayAndYesterdayElectricity(devId: string, dpId: string | number) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

  const response = await getStatisticsRangDay({
    devId,
    dpId,
    startDay: yesterdayStr,
    endDay: todayStr,
    type: 'sum',
  });
  // => { '20260407': '126.00', '20260408': '83.00' }

  // add_ele 原始值 / 100 = kWh
  const todayKwh = (parseFloat(response[todayStr]) || 0) / 100;
  const yesterdayKwh = (parseFloat(response[yesterdayStr]) || 0) / 100;

  return { todayKwh, yesterdayKwh };
}

// 使用示例
const { devId } = useDevInfo();
const { todayKwh, yesterdayKwh } = await getTodayAndYesterdayElectricity(devId, '18');
```

> **注意**：`auto` 默认 0，无数据的日期不会返回 key，因此用 `parseFloat(response[key]) || 0` 兜底。

### 按小时统计实现模式（细粒度）

如果需要当日小时级别的用电分布（如图表展示），可用 `getStatisticsRangHour`：

```ts
import { getStatisticsRangHour } from '@ray-js/ray';

const todayData = await getStatisticsRangHour({
  devId,
  dpId: '18',
  date: '20230511',
  type: 'sum',
});
// => { "2023051117": "0.00", "2023051118": "24.00", ... }

const todayKWh = Object.values(todayData).reduce((sum, v) => sum + parseFloat(v || '0'), 0) / 100;
```

## Constraints

- **Must**: `@ray-js/ray` 版本 >= 1.2.12
- **Must**: 用电量展示单位为「度（kWh）」，`add_ele` 原始值需除以 100
- **Optional**: `getStatisticsConfig` 可用于查询已开通统计的 DP 列表，非必须前置调用
- **Must not**: 在没有 `add_ele` DP 的品类中使用用电统计
- **Must not**: 臆造 API 参数格式，以本文档为准
