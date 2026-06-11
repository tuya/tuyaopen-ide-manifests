# 电工 (electrician)


## 电量电费计量

#### saveDeviceCurrency

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。

##### 描述

保存或修改设备的货币单位配置。保存后设备后续的电费数据将基于新货币展示，历史数据不会随之换算。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `currency` | `string` | 是 | 货币编码（ISO 4217），如 `CNY`、`USD`、`EUR` |

##### 返回值

类型: `Promise<boolean>`

是否保存成功

##### 示例代码

###### 请求示例

```javascript
import { saveDeviceCurrency } from '@tuya-miniapp/cloud-api';

saveDeviceCurrency({ devId: 'vdevo123', currency: 'CNY' })
  .then(result => {
    console.log('货币配置保存成功:', result);
  })
  .catch(error => {
    console.error('货币配置保存失败:', error);
  });
```

###### 返回示例

```json
true
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getCurrencyList

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。

##### 描述

获取能源能力支持的货币列表。返回系统当前支持的所有货币选项，不含默认货币占位符 DEFAULT，可用于渲染货币选择 UI。

##### 参数

无

##### 返回值

类型: `Promise<CurrencyItem[]>`

货币列表，每项包含 symbol（货币符号，如 ¥、$）和 code（ISO 4217 货币编码，如 CNY、USD）

##### 示例代码

###### 请求示例

```javascript
import { getCurrencyList } from '@tuya-miniapp/cloud-api';

getCurrencyList()
  .then(result => {
    result.forEach(item => {
      console.log(`${item.symbol} (${item.code})`);
    });
  })
  .catch(error => {
    console.error('获取货币列表失败:', error);
  });
```

###### 返回示例

```json
[
  { "symbol": "¥", "code": "CNY" },
  { "symbol": "$", "code": "USD" },
  { "symbol": "€", "code": "EUR" }
]
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getDeviceCurrency

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。

##### 描述

获取设备当前配置的货币单位。可用于在界面上展示电费时附加正确的货币符号。若设备尚未配置货币，返回空字符串。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

##### 返回值

类型: `Promise<string>`

货币编码（ISO 4217），如 CNY、USD；未配置时返回空字符串

##### 示例代码

###### 请求示例

```javascript
import { getDeviceCurrency } from '@tuya-miniapp/cloud-api';

getDeviceCurrency({ devId: 'vdevo123' })
  .then(currency => {
    console.log('设备货币:', currency); // 如 "CNY"
  })
  .catch(error => {
    console.error('获取设备货币失败:', error);
  });
```

###### 返回示例

```json
"CNY"
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### savePeakValleyPrice

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。

##### 描述

保存设备峰谷电价配置。用于新增或修改指定设备的电价策略，修改后仅对后续新增数据生效，历史电费数据不会重新计算。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `priceConfig` | `PeakValleyPriceConfig` | 是 | 峰谷电价配置对象 |

###### PeakValleyPriceConfig

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `normalPrice` | `string` | 是 | - | 常规（平段）电价，单位为货币/kWh |
| `peakValleyPrice` | `PeakValleyPrice[]` | 是 | - | 峰谷时段电价列表，为空数组时表示仅使用常规电价 |

##### 返回值

类型: `Promise<boolean>`

是否保存成功

###### 引用对象

###### `interface` PeakValleyPrice

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `price` | `string` | 是 | 该时段电价，单位为货币/kWh |
| `startTime` | `string` | 是 | 时段开始小时，两位字符串，如 `"08"` 表示 08:00 |
| `endTime` | `string` | 是 | 时段结束小时，两位字符串，如 `"12"` 表示 12:00 |

##### 示例代码

###### 请求示例

```javascript
import { savePeakValleyPrice } from '@tuya-miniapp/cloud-api';

savePeakValleyPrice({
  devId: 'vdevo123',
  priceConfig: {
    normalPrice: '0.56',
    peakValleyPrice: [
      { startTime: '08', endTime: '12', price: '0.80' },
      { startTime: '18', endTime: '22', price: '0.80' },
      { startTime: '22', endTime: '24', price: '0.30' },
    ],
  },
})
  .then(result => {
    console.log('峰谷电价保存成功:', result);
  })
  .catch(error => {
    console.error('峰谷电价保存失败:', error);
  });
```

###### 返回示例

```json
true
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getPeakValleyPrice

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。

##### 描述

查询设备峰谷电价配置。返回指定设备当前的电价策略，包括电价类型、货币编码及完整电价配置对象。若设备未完成电价配置，priceType、currency 字段可能不存在。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

##### 返回值

类型: `Promise<GetPeakValleyPriceResult>`

峰谷电价配置，含 priceType（电价类型：0 常规/1 阶梯/2 峰谷）、currency（货币编码）、config（电价配置，含 normalPrice 和 peakValleyPrice 列表）

###### 引用对象

###### `interface` GetPeakValleyPriceResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `priceType` | `0 \| 1 \| 2` | 否 | 电价类型 |
| `currency` | `string` | 否 | 货币编码，如 `CNY`、`USD` |
| `config` | `PeakValleyPriceConfig` | 是 | 峰谷电价配置对象 |

###### `type` PeakValleyPriceConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `normalPrice` | `string` | 是 | 常规（平段）电价，单位为货币/kWh |
| `peakValleyPrice` | `PeakValleyPrice[]` | 是 | 峰谷时段电价列表，为空数组时表示仅使用常规电价 |

###### `type` PeakValleyPrice

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `price` | `string` | 是 | 该时段电价，单位为货币/kWh |
| `startTime` | `string` | 是 | 时段开始小时，两位字符串，如 `"08"` 表示 08:00 |
| `endTime` | `string` | 是 | 时段结束小时，两位字符串，如 `"12"` 表示 12:00 |

##### 示例代码

###### 请求示例

```javascript
import { getPeakValleyPrice } from '@tuya-miniapp/cloud-api';

getPeakValleyPrice({ devId: 'vdevo123' })
  .then(result => {
    console.log('电价类型:', result.priceType);
    console.log('常规电价:', result.config.normalPrice);
    result.config.peakValleyPrice.forEach(item => {
      console.log(`${item.startTime}:00 - ${item.endTime}:00, 单价: ${item.price}`);
    });
  })
  .catch(error => {
    console.error('查询峰谷电价失败:', error);
  });
```

###### 返回示例

```json
{
  "priceType": 2,
  "currency": "CNY",
  "config": {
    "normalPrice": "0.56",
    "peakValleyPrice": [
      { "startTime": "08", "endTime": "12", "price": "0.80" },
      { "startTime": "18", "endTime": "22", "price": "0.80" },
      { "startTime": "22", "endTime": "24", "price": "0.30" }
    ]
  }
}
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getUnitByIndicatorCode

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

根据指标编码查询对应的计量单位（如 kWh、元）。可在查询能源数据前调用，以便在 UI 中正确标注数值含义。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `indicatorCode` | `"ele_usage" \| "ele_cost"` | 是 | 指标编码 |
| `dateType` | `"hour" \| "day" \| "month"` | 是 | 时间维度 |
| `beginDate` | `string` | 是 | 开始时间，格式与 `dateType` 对应 |
| `endDate` | `string` | 是 | 结束时间，格式与 `dateType` 对应 |

##### 返回值

类型: `Promise<string>`

指标计量单位字符串，如 kWh（用电量）、元（电费，随设备货币配置变化）

##### 示例代码

###### 请求示例

```javascript
import { getUnitByIndicatorCode, IndicatorCode, DateType } from '@tuya-miniapp/cloud-api';

getUnitByIndicatorCode({
  devId: 'vdevo123',
  indicatorCode: IndicatorCode.EleUsage,
  dateType: DateType.Day,
  beginDate: '20260101',
  endDate: '20260131',
})
  .then(unit => {
    console.log('指标单位:', unit); // 如 "kWh"
  })
  .catch(error => {
    console.error('获取指标单位失败:', error);
  });
```

###### 返回示例

```json
"kWh"
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getDeviceConsumeBudget

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

查询设备电量预算列表。仅返回 energyAction 为 consume 的预算项，可用于在 UI 层展示预算进度或预算阈值告警。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

##### 返回值

类型: `Promise<GetDeviceConsumeBudgetResult>`

电量预算列表（energyAction 固定为 consume），每项含 dateType（预算维度：day/week/month）、budget（预算值，单位 kWh）、entityId（设备 ID）等字段；未设置某维度时该维度不在列表中

###### 引用对象

###### `type` GetDeviceConsumeBudgetResult

`getDeviceConsumeBudget` 返回值，电量预算列表

```typescript
export type GetDeviceConsumeBudgetResult = DeviceBudget[];
```

###### `interface` DeviceBudget

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizId` | `string` | 是 | 业务 ID |
| `budget` | `string` | 是 | 预算值，单位视 `energyAction` 而定（kWh 或货币） |
| `dateType` | `"day" \| "week" \| "month"` | 是 | 预算时间维度 |
| `energyAction` | `"cost" \| "consume"` | 是 | 能源动作类型（`consume` 或 `cost`） |
| `entityId` | `string` | 是 | 实体 ID（即设备 ID） |
| `entityType` | `string` | 是 | 实体类型 |
| `projectId` | `string` | 是 | 项目 ID |
| `projectType` | `string` | 是 | 项目类型 |

###### `enum` BudgetDataType

| 枚举值 | 描述 |
| --- | --- |
| `day` | 按天 |
| `week` | 按周 |
| `month` | 按月 |

##### 示例代码

###### 请求示例

```javascript
import { getDeviceConsumeBudget } from '@tuya-miniapp/cloud-api';

getDeviceConsumeBudget({ devId: 'vdevo123' })
  .then(result => {
    result.forEach(item => {
      console.log(`${item.dateType} 电量预算: ${item.budget} kWh`);
    });
  })
  .catch(error => {
    console.error('查询电量预算失败:', error);
  });
```

###### 返回示例

```json
[
  {
    "dateType": "day",
    "budget": "5",
    "energyAction": "consume",
    "bizId": "biz_001",
    "entityId": "vdevo123",
    "entityType": "device",
    "projectId": "proj_001",
    "projectType": "smartenergy"
  },
  {
    "dateType": "month",
    "budget": "80",
    "energyAction": "consume",
    "bizId": "biz_002",
    "entityId": "vdevo123",
    "entityType": "device",
    "projectId": "proj_001",
    "projectType": "smartenergy"
  }
]
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getDeviceCostBudget

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

查询设备电费预算列表。仅返回 energyAction 为 cost 的预算项，可用于在 UI 层展示预算进度或预算阈值告警。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

##### 返回值

类型: `Promise<GetDeviceCostBudgetResult>`

电费预算列表（energyAction 固定为 cost），每项含 dateType（预算维度：day/week/month）、budget（预算值，货币单位取决于设备配置，可通过 getDeviceCurrency 查询）、entityId（设备 ID）等字段

###### 引用对象

###### `type` GetDeviceCostBudgetResult

`getDeviceCostBudget` 返回值，电费预算列表

```typescript
export type GetDeviceCostBudgetResult = DeviceBudget[];
```

###### `interface` DeviceBudget

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizId` | `string` | 是 | 业务 ID |
| `budget` | `string` | 是 | 预算值，单位视 `energyAction` 而定（kWh 或货币） |
| `dateType` | `"day" \| "week" \| "month"` | 是 | 预算时间维度 |
| `energyAction` | `"cost" \| "consume"` | 是 | 能源动作类型（`consume` 或 `cost`） |
| `entityId` | `string` | 是 | 实体 ID（即设备 ID） |
| `entityType` | `string` | 是 | 实体类型 |
| `projectId` | `string` | 是 | 项目 ID |
| `projectType` | `string` | 是 | 项目类型 |

###### `enum` BudgetDataType

| 枚举值 | 描述 |
| --- | --- |
| `day` | 按天 |
| `week` | 按周 |
| `month` | 按月 |

##### 示例代码

###### 请求示例

```javascript
import { getDeviceCostBudget } from '@tuya-miniapp/cloud-api';

getDeviceCostBudget({ devId: 'vdevo123' })
  .then(result => {
    result.forEach(item => {
      console.log(`${item.dateType} 电费预算: ${item.budget}`);
    });
  })
  .catch(error => {
    console.error('查询电费预算失败:', error);
  });
```

###### 返回示例

```json
[
  {
    "dateType": "day",
    "budget": "3",
    "energyAction": "cost",
    "bizId": "biz_003",
    "entityId": "vdevo123",
    "entityType": "device",
    "projectId": "proj_001",
    "projectType": "smartenergy"
  },
  {
    "dateType": "month",
    "budget": "50",
    "energyAction": "cost",
    "bizId": "biz_004",
    "entityId": "vdevo123",
    "entityType": "device",
    "projectId": "proj_001",
    "projectType": "smartenergy"
  }
]
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### batchSaveConsumeBudget

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

批量保存设备电量预算。支持一次性更新多个时间维度（日、周、月）的用电量预算配置，不传的维度不会被重置。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `budgetConfig` | `BudgetConfigItem[]` | 是 | 预算项列表，支持多个时间维度同时更新 |

###### BudgetConfigItem

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `dateType` | `"day" \\| "week" \\| "month"` | 是 | - | 预算时间维度，推荐使用 `BudgetDataType` 枚举 |
| `budget` | `string` | 是 | - | 预算值，字符串数值，保留整数或一位小数 |

##### 返回值

类型: `Promise<boolean>`

是否保存成功

##### 示例代码

###### 请求示例

```javascript
import { batchSaveConsumeBudget, BudgetDataType } from '@tuya-miniapp/cloud-api';

batchSaveConsumeBudget({
  devId: 'vdevo123',
  budgetConfig: [
    { dateType: BudgetDataType.Day, budget: '5' },
    { dateType: BudgetDataType.Week, budget: '20' },
    { dateType: BudgetDataType.Month, budget: '80' },
  ],
})
  .then(result => {
    console.log('电量预算保存成功:', result);
  })
  .catch(error => {
    console.error('电量预算保存失败:', error);
  });
```

###### 返回示例

```json
true
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### batchSaveCostBudget

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

批量保存设备电费预算。支持一次性更新多个时间维度（日、周、月）的电费预算配置，不传的维度不会被重置。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `budgetConfig` | `BudgetConfigItem[]` | 是 | 预算项列表，支持多个时间维度同时更新 |

###### BudgetConfigItem

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `dateType` | `"day" \\| "week" \\| "month"` | 是 | - | 预算时间维度，推荐使用 `BudgetDataType` 枚举 |
| `budget` | `string` | 是 | - | 预算值，字符串数值，保留整数或一位小数 |

##### 返回值

类型: `Promise<boolean>`

是否保存成功

##### 示例代码

###### 请求示例

```javascript
import { batchSaveCostBudget, BudgetDataType } from '@tuya-miniapp/cloud-api';

batchSaveCostBudget({
  devId: 'vdevo123',
  budgetConfig: [
    { dateType: BudgetDataType.Day, budget: '3' },
    { dateType: BudgetDataType.Week, budget: '15' },
    { dateType: BudgetDataType.Month, budget: '50' },
  ],
})
  .then(result => {
    console.log('电费预算保存成功:', result);
  })
  .catch(error => {
    console.error('电费预算保存失败:', error);
  });
```

###### 返回示例

```json
true
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### getDeviceData

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

按时间范围查询设备能源指标数据。支持按小时、天、月维度聚合，可指定聚合方式（求和、均值、最大值）。返回数据包含汇总值、单位及分段明细列表。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `indicatorCode` | `"ele_usage" \| "ele_cost"` | 是 | 指标编码，推荐使用 `IndicatorCode` 枚举 |
| `dateType` | `"hour" \| "day" \| "month"` | 是 | 时间维度，推荐使用 `DateType` 枚举 |
| `beginDate` | `string` | 是 | 开始时间，格式与 `dateType` 对应 |
| `endDate` | `string` | 是 | 结束时间，格式与 `dateType` 对应 |
| `aggregationType` | `"SUM" \| "AVG" \| "MAX"` | 否 | 聚合方式，默认为 `SUM`（求和） |
| `options` | `string` | 否 | 扩展参数，JSON 字符串，一般无需传入 |

##### 返回值

类型: `Promise<GetDeviceDataResult>`

包含 total（区间汇总值）、unit（指标单位，如 kWh）、list（分段数据，每项含 date 和 value，无数据时 value 为 0）的对象

###### 引用对象

###### `interface` GetDeviceDataResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `total` | `number` | 是 | 区间汇总值 |
| `unit` | `string` | 是 | 指标单位，如 `kWh`、`元` |
| `list` | `DeviceDataItem[]` | 是 | 分段数据列表，无数据时对应 `value` 为 `0` |

###### `type` DeviceDataItem

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `date` | `string` | 是 | 时间点，格式与请求的 `dateType` 保持一致 |
| `value` | `number` | 是 | 该时间点对应的指标数值 |

##### 示例代码

###### 请求示例

```javascript
import { getDeviceData, IndicatorCode, DateType } from '@tuya-miniapp/cloud-api';

getDeviceData({
  devId: 'vdevo123',
  indicatorCode: IndicatorCode.EleUsage,
  dateType: DateType.Day,
  beginDate: '20260101',
  endDate: '20260131',
})
  .then(result => {
    console.log('能源数据汇总:', result.total, result.unit);
    result.list.forEach(item => {
      console.log(`${item.date}: ${item.value} ${result.unit}`);
    });
  })
  .catch(error => {
    console.error('查询能源数据失败:', error);
  });
```

###### 返回示例

```json
{
  "total": 31.2,
  "unit": "kWh",
  "list": [
    { "date": "20260101", "value": 1.2 },
    { "date": "20260102", "value": 0.8 },
    { "date": "20260103", "value": 1.5 }
  ]
}
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### cleanDeviceData

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

清除指定设备的能源统计数据。操作不可逆，清除后设备的电量、电费等历史统计数据将被清空，建议在调用前提示用户确认。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

##### 返回值

类型: `Promise<boolean>`

是否清除成功；此操作不可逆，建议先调用 exportDeviceData 备份数据后再清除

##### 示例代码

###### 请求示例

```javascript
import { cleanDeviceData } from '@tuya-miniapp/cloud-api';

cleanDeviceData({ devId: 'vdevo123' })
  .then(result => {
    console.log('设备能源数据清除成功:', result);
  })
  .catch(error => {
    console.error('设备能源数据清除失败:', error);
  });
```

###### 返回示例

```json
true
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
#### exportDeviceData

> [VERSION] @tuya-miniapp/cloud-api >= 1.3.0

> 💡 接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)开发设置 - 云能力进行授权配置。使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。

##### 描述

按时间范围将设备能源数据导出并发送至指定邮箱。支持一次导出多个指标，导出任务为异步操作，接口返回成功仅表示任务提交成功，实际邮件将在后台处理后发出。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `dateType` | `"hour" \| "day" \| "month"` | 是 | 时间维度，推荐使用 `DateType` 枚举 |
| `beginDate` | `string` | 是 | 开始时间，格式与 `dateType` 对应 |
| `endDate` | `string` | 是 | 结束时间，格式与 `dateType` 对应 |
| `email` | `string` | 是 | 接收导出数据的邮箱地址 |
| `indicatorCodes` | `"ele_usage" \| "ele_cost" \| "ele_usage" \\| "ele_cost"[]` | 是 | 指标编码或编码数组，支持多指标同时导出，推荐使用 `IndicatorCode` 枚举 |

##### 返回值

类型: `Promise<boolean>`

是否成功提交导出任务；返回 true 仅代表任务已提交，邮件发送为异步，实际收到邮件可能有延迟

##### 示例代码

###### 请求示例

```javascript
import { exportDeviceData, IndicatorCode, DateType } from '@tuya-miniapp/cloud-api';

exportDeviceData({
  devId: 'vdevo123',
  dateType: DateType.Month,
  beginDate: '202601',
  endDate: '202603',
  email: '***@***.***',
  indicatorCodes: [IndicatorCode.EleUsage, IndicatorCode.EleCost],
})
  .then(result => {
    console.log('导出任务提交成功:', result);
  })
  .catch(error => {
    console.error('导出任务提交失败:', error);
  });
```

###### 返回示例

```json
true
```

##### 常见问题

###### 为什么调用云能力会出现失败的情况？

使用本接口前，请确保设备所属产品已在[涂鸦 IoT 开发平台](https://iot.tuya.com/)开启**电量统计**高级能力。未启用该能力的产品无法采集电量/电费数据，接口将返回空数据或报错。如需使用，请创建带有电量/电费统计功能的产品，并在产品详情中启用相应高级能力。同时，接口依赖云能力，需在[小程序开发者平台](https://platform.tuya.com/miniapp/)`开发设置` - `云能力`进行授权配置。
