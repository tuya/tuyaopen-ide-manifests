# 统计

> 接口依赖云能力，需在[小程序开发者平台](https://iot.tuya.com/miniapp/)`开发设置`-`云能力`进行授权配置。**<font color="red">📢注意：统计能力使用需要提交工单开通产品数据统计，请在使用前 [提交快速工单](https://service.console.tuya.com/8/3/list?source=support_center)。</font>**

## 接口能力

对智能计量的能力我们提供了下接口能力，开发者可直接调用 `API` 完成计量相关业务开发。

**注意，以下 API 需要在 `@ray-js/ray^1.2.12` 使用。**

| 接口名                 | 描述                                           |
| ---------------------- | ---------------------------------------------- |
| getStatisticsConfig    | 获取统计数据的配置信息                         |
| getStatisticsRang15min | 15min 为时间间隔,获取设备日期区间的统计数据   |
| exportStatistics15min  | 15min 为时间间隔,导出设备指定日期的统计数据   |
| getStatisticsRangHour  | 小时为时间间隔,获取设备日期区间的统计数据     |
| exportStatisticsHour   | 小时为时间间隔,导出设备日期区间的统计数据     |
| getStatisticsRangDay   | 天为时间间隔，获取设备日期区间的统计数据       |
| exportStatisticsDay    | 天为时间间隔，导出设备日期区间的统计数据       |
| getStatisticsRangMonth | 月为时间间隔，获取导出设备日期区间的统计数据   |
| exportStatisticsMonth  | 月为时间间隔，导出设备在过去一个月内的统计数据 |
| resetStatistics        | 重置设备的统计数据                             |

## 图表组件

### 安装

```bash
npm install @ray-js/stat-charts
```

### 组件 Props

| 名称             | 类型                                               | 必填 | 默认值                                                                                 | 描述                                                                          |
| ---------------- | -------------------------------------------------- | ---- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| style            | React.CSSProperties                                | N    |                                                                                        | 图表容器的样式                                                                |
| devIdList        | `string[]`                                         | Y    |                                                                                        | 设备 id 列表, (暂不支持多个)                                                  |
| dpList           | `Dp[]`                                             | Y    |                                                                                        | DP 功能点列表, 图表的数据维度, 格式 `{ name: string, id: number }`            |
| range            | string                                             | Y    |                                                                                        | 数据合集, 时间单位内为一个点, 例如: 15min, 1hour, 1day, 1month                |
| type             | string                                             | N    | sum                                                                                    | 统计类型，详见 [统计类型说明](#统计类型说明)。例如: avg, max, min, sum, count                                     |
| unit             | string                                             | Y    |                                                                                        | 数据单位, 例如: ℃, %, m                                                       |
| startDate        | string                                             | Y    |                                                                                        | 数据开始时间, 格式: YYYYMMDD, 例如: 202305 20230522                           |
| endDate          | string                                             | O    | ''                                                                                     | 数据结束时间, 数据合集为 1day 1month 需提供, 格式为 YYYYMMDD                  |
| renderTitle      | `({ data }) => React.ReactNode`                    | N    | ''                                                                                     | 自定义图表标题                                                                |
| renderFooter     | `({ data }) => React.ReactNode`                    | N    | ''                                                                                     | 自定义图表尾部                                                                |
| theme            | string                                             | N    | light                                                                                  | 主题, 'light' / 'dark'                                                        |
| dataZoom         | number                                             | N    | 0                                                                                      | 显示数据轴的百分比 `1~100` `-100~-1` 之间, 默认为左侧, 负数表示显示数据的右侧 |
| chartType        | string                                             | N    | line                                                                                   | 图表类型, `line` / `bar` / `line-area`                                        |
| width            | number                                             | N    | 654                                                                                    | 图表宽度, 单位为 rpx                                                          |
| height           | number                                             | N    | 422                                                                                    | 图表高度, 单位为 rpx                                                          |
| placeholder      | `{ loading: string; error: string; none: string }` | N    | `{ loading: 'Loading...', error: 'Failed To Load', none: 'No data for this period…' }` | 图表中央的占位文案,，根据 placeholderIcon 的状态来显示                        |
| placeholderIcon  | string                                             | N    | loading                                                                                | 空数据时的占位图标, 可选值: loading, error, none                              |
| placeholderYAxis | number                                             | N    | 10                                                                                     | 空数据时 Y 轴的最大值, 0 则不展示 Y 轴                                        |
| placeholderXAxis | `string[]`                                         | N    | `['6:00', '12:00', '18:00']`                                                           | 空数据时 X 轴的标签, `[]` 则不展示 X 轴                                       |
| debug            | boolean                                            | N    | false                                                                                  | 是否开启调试模式，开启后会生成随机数据，请勿在生产模式使用                    |

### 使用示例

#### 展示全年气温统计

```jsx | pure
import StatCharts from '@ray-js/stat-charts';

<StatCharts
  devIdList={['vdevo168473759041567']} // 设备 id
  dpList={[{ id: 27, name: '温度' }]} // 功能点 id 及 名称
  unit="℃" // 数据单位
  range="1month" // 以每个月为一个点
  type="avg" // 统计类型, 统计该月的平均值
  startDate="202301" // 数据开始时间 1月开始
  endDate="202312" // 数据结束时间 12月结束
  count={25} // 副标题上的数据
  chartType={'line'} // 折线图
/>;
```

#### 统计设备能耗数据

```jsx | pure
<StatCharts
  devIdList={['vdevo168473759041567']}
  dpList={[
    { id: 27, name: '温控器' },
    { id: 28, name: '氛围灯' },
  ]}
  unit="kwH" // 单位 千瓦时
  range="15min" // 每 15 分钟为一个点
  startDate="20230522" // 统计当天的数据
  dataZoom={-30} // 可缩放滑动 默认展示数据的右侧 30%
  chartType="bar" // 柱状图
/>
```

## 关于图表类需求的统计接口中的 type 参数的解释

### 统计类型说明

> 下面的时间间隔目前写的都是`1小时`，可以换成支持的`1天`或`1个月`。

#### sum

把 `1小时` 内上报的数据进行 `累加`，得到该时段数据的 `总和`。适用于累计量（如用电量、用水量）。

#### minux

取 `1小时` 内上报数据的 **最大值**，减去 `上个小时` 上报数据的 **最大值**，得到该时段的 **增量/用量**。适用于表计、计数器类设备的时段用量（如电表、水表每时段用量）。

- Tip: 如果 `上个小时` 没有数据，再之前的上报的最大数据相减，得到`这个小时`的使用数据。
- Tip: 这个类型本应该是 minus, 因为一开始（三年前）的单词拼错了，所以现在就一直用 `minux`了。

#### avg

把 `1小时` 内上报的数据，进行 `累加` 操作，并除以上报的 `次数`，得到这个 `小时`数据的 `平均值`。适用于温度、湿度等需要看平均水平的指标。

#### min

统计 `1小时` 内上报的数据的最小值。适用于最低温度、最低电量、谷值功率等场景。

#### max

统计 `1小时` 内上报的数据的最大值。适用于最高温度、峰值功率、用电高峰等场景。

#### count

统计 `1小时` 内上报的数据的次数。适用于开关次数、上报频次、事件次数等场景。

#### recent

统计离 `整点时间` 最近的那个点，该类型仅支持按小时统计，不支持按天或按月。适用于需要对齐整点采样的曲线展示（如每小时一个点的折线图）。

### 统计间隔

#### 按小时统计

简单说就是根据`统计类型`统计一个小时内上报的数据，然后聚合成一个点

#### 按天获取

简单说就是根据`统计类型`统计一天内上报的数据，然后聚合成一个点

#### 按月统计

简单说就是根据`统计类型`统计月内上报的数据，然后聚合成一个点

### getStatisticsConfig

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

获取统计配置，获取开通智能计量的 DP 点及配置。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

#### 返回值

类型: `Promise<IStatisticsConfig[]>`

IStatisticsConfig[]（字段含义见类型定义与 minituya 返回值表）

#### 示例代码

##### 请求示例

```typescript
import { getStatisticsConfig } from '@tuya-miniapp/cloud-api';

getStatisticsConfig({
  devId: 'vdevo166789063330437',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
[
  {
    storageDuration: 365,
    productId: 'lcrxzqjqojafatrv',
    dpId: 18,
    statisticInterval: 1,
    algorithmType: 'avg',
  },
  {
    storageDuration: 365,
    productId: 'lcrxzqjqojafatrv',
    dpId: 1,
    statisticInterval: 1,
    algorithmType: 'count',
  },
  {
    storageDuration: 7,
    productId: 'lcrxzqjqojafatrv',
    dpId: 1,
    statisticInterval: 2,
    algorithmType: 'count',
  },
];
```
### resetStatistics

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。
> 注意：该方法会清空统计数据，请注意使用方式（见 minituya 文档）。

#### 描述

重置设备的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

#### 返回值

类型: `Promise<boolean>`

文档返回示例为 true；本函数返回类型为 Promise<any>，以实际封装为准

#### 示例代码

##### 请求示例

```typescript
import { resetStatistics } from '@tuya-miniapp/cloud-api';

resetStatistics({
  devId: 'vdevo161733425146241',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true;
```
### getStatisticsRang15min

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

15min 为时间间隔，获取设备日期区间的统��数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsRang & IDate` | 是 | 请求体 |

#### 返回值

类型: `Promise<IStatisticsData>`

IStatisticsData（键为时间片、值为统计值字符串；缺失数据可为 '#' 等，见文档返回示例）

#### 示例代码

##### 请求示例

```typescript
import { getStatisticsRang15min } from '@tuya-miniapp/cloud-api';

getStatisticsRang15min({
  devId: 'vdevo161733425146241',
  dpId: '18',
  date: '20230511',
  type: 'avg',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  202105260000: '1312.02',
  202105260015: '1249.49',
  202105262345: '#',
  '...': '...',
};
```
### exportStatistics15min

> 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_

15 分钟 为时间间隔，导出设备指定日期的统计数据。

**请求参数**

|     参数     |    数据类型     | 说明                                                                       | 是否必填 |
| :----------: | :-------------: | :------------------------------------------------------------------------- | :------: |
|    devId     |     string      | 设备 ID                                                                    |    是    |
|    email     |     string      | 邮箱地址                                                                   |    是    |
|    title     |     string      | 邮件标题                                                                   |    否    |
| dpExcelQuery | array \| string | 查询条件，DpExcelQuery 数组对象 或 转成 json 字符串，详见下文              |    是    |
|     date     |     string      | 要查询的日期，yyyyMMdd 格式                                                |    是    |
|     type     |     string      | 统计类型，详见 [统计类型说明](../meature#统计类型说明)。可选值：'sum' \| 'avg' \| 'minux' \| 'max' \| 'min' \| 'count' \| 'recent'；默认 sum |    否    |
|     lang     |     string      | 多语言格式 'cn' \| 'en' \| ...                                             |    否    |

**DpExcelQuery 对象**

|  参数   |     数据类型     | 说明                                                                                                                                      | 是否必填 |
| :-----: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------------------- | :------: |
|  dpId   | string \| number | 要查询的数据点 ID                                                                                                                         |    是    |
|  title  |      string      | Excel 数据列名                                                                                                                            |    是    |
| handler |      string      | 转化规则，目前支持 华氏度转摄氏度: 'temperatureF2C', 摄氏度转华氏度: 'temperatureC2F', 立方米转加仑: 'cubicMeterToGallon', 加仑转立方米: 'gallonToCubicMeter' |    否    |

**请求示例**

```javascript
// @ray-js/ray^1.7.56
import { exportStatistics15min } from '@ray-js/ray';

exportStatistics15min({
  devId: 'vdevo161733425146241',
  email: '***@***.***',
  dpExcelQuery: [{ dpId: 18, name: 'excel数据列标题' }],
  date: '20230510',
  type: 'avg',
  lang: 'cn',
  title: '这是一个标题',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```javascript
true;
```
### getStatisticsRangHour

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

小时为时间间隔，获取设备日期区间的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsRang & IDate` | 是 | 请求体 |

#### 返回值

类型: `Promise<IStatisticsData>`

IStatisticsData（键为小时维度等，见文档返回示例）

#### 示例代码

##### 请求示例

```typescript
import { getStatisticsRangHour } from '@tuya-miniapp/cloud-api';

getStatisticsRangHour({
  devId: 'vdevo161733425146241',
  dpId: '18',
  date: '20230511',
  type: 'avg',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  2023051117: '0.00',
  2023051118: '24.00',
  2023051119: '0.00',
  '...': '...',
};
```
### exportStatisticsHour

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

小时为时间间隔，导出设备日期区间的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsExport & IDate` | 是 | 请求体 |

#### 返回值

类型: `Promise<boolean>`

true 表示导出请求成功（文档返回示例为 true）

##### 引用对象

###### `type` IDpExcelQuery

导出 Excel 邮件中的列配置；对象数组在请求前会被 `JSON.stringify`（见 `exportStatistics*` 实现）。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `number \| string` | 是 | 列对应的 DP ID |
| `name` | `string` | 是 | 导出到 Excel 的列标题 |
| `handler` | `string` | 否 | 列数据转换；常见值：`temperatureF2C`（华氏度转摄氏度）、`temperatureC2F`（摄氏度转华氏度）。 |

#### 示例代码

##### 请求示例

```typescript
import { exportStatisticsHour } from '@tuya-miniapp/cloud-api';

exportStatisticsHour({
  devId: 'vdevo161733425146241',
  email: '***@***.***',
  dpExcelQuery: [{ dpId: 18, name: 'excel数据列标题' }],
  date: '20230511',
  type: 'avg',
  lang: 'cn',
  title: '这是一个标题',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true;
```
### getStatisticsRangDay

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

天为时间间隔，获取设备日期区间的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsRang & IStartEndDay` | 是 | 请求体 |

#### 返回值

类型: `Promise<IStatisticsData>`

IStatisticsData（键为日期等，见文档返回示例）

#### 示例代码

##### 请求示例

```typescript
import { getStatisticsRangDay } from '@tuya-miniapp/cloud-api';

getStatisticsRangDay({
  devId: 'vdevo161733425146241',
  dpId: '18',
  startDay: '20230510',
  endDay: '20230511',
  type: 'avg',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  20230501: '0',
  20230502: '0',
  20230503: '0',
  20230504: '0',
  20230505: '0',
  20230506: '0',
  20230507: '0',
  20230508: '0',
  20230509: '0',
  20230510: '26.00',
  20230511: '24.00',
};
```
### exportStatisticsDay

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

天为时间间隔，导出设备日期区间的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsExport & IStartEndDay` | 是 | 请求体 |

#### 返回值

类型: `Promise<boolean>`

true 表示导出请求成功（文档返回示例为 true）

##### 引用对象

###### `type` IDpExcelQuery

导出 Excel 邮件中的列配置；对象数组在请求前会被 `JSON.stringify`（见 `exportStatistics*` 实现）。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `number \| string` | 是 | 列对应的 DP ID |
| `name` | `string` | 是 | 导出到 Excel 的列标题 |
| `handler` | `string` | 否 | 列数据转换；常见值：`temperatureF2C`（华氏度转摄氏度）、`temperatureC2F`（摄氏度转华氏度）。 |

#### 示例代码

##### 请求示例

```typescript
import { exportStatisticsDay } from '@tuya-miniapp/cloud-api';

exportStatisticsDay({
  devId: 'vdevo161733425146241',
  email: '***@***.***',
  dpExcelQuery: [{ dpId: 18, name: 'excel数据列标题' }],
  startDay: '20230510',
  endDay: '20230511',
  type: 'avg',
  lang: 'cn',
  title: '这是一个标题',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true;
```
### getStatisticsRangMonth

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

月为时间间隔，获取设备日期区间的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsRang & StartEndMonth` | 是 | 请求体 |

#### 返回值

类型: `Promise<IStatisticsData>`

IStatisticsData（键为月份等，见文档返回示例）

#### 示例代码

##### 请求示例

```typescript
import { getStatisticsRangMonth } from '@tuya-miniapp/cloud-api';

getStatisticsRangMonth({
  devId: 'vdevo161733425146241',
  dpId: '18',
  startMonth: '202304',
  endMonth: '202305',
  type: 'avg',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  202304: '0',
  202305: '24.00',
};
```
### exportStatisticsMonth

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

月为时间间隔，导出设备在过去一个月内的统计数据。

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `ICommonGetStatisticsExport & StartEndMonth` | 是 | 请求体 |

#### 返回值

类型: `Promise<boolean>`

true 表示导出请求成功（文档返回示例为 true）

##### 引用对象

###### `type` IDpExcelQuery

导出 Excel 邮件中的列配置；对象数组在请求前会被 `JSON.stringify`（见 `exportStatistics*` 实现）。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `number \| string` | 是 | 列对应的 DP ID |
| `name` | `string` | 是 | 导出到 Excel 的列标题 |
| `handler` | `string` | 否 | 列数据转换；常见值：`temperatureF2C`（华氏度转摄氏度）、`temperatureC2F`（摄氏度转华氏度）。 |

#### 示例代码

##### 请求示例

```typescript
import { exportStatisticsMonth } from '@tuya-miniapp/cloud-api';

exportStatisticsMonth({
  devId: 'vdevo161733425146241',
  email: '***@***.***',
  dpExcelQuery: [{ dpId: 18, name: 'excel数据列标题' }],
  startMonth: '202304',
  endMonth: '202305',
  type: 'avg',
  lang: 'cn',
  title: '这是一个标题',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true;
```
