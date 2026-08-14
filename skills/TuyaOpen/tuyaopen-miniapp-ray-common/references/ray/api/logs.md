# 设备日志

> 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_

## 接口能力

对设备日志的能力我们提供了下接口能力，开发者可直接调用 `API` 完成计量相关业务开发。

**注意，以下 API 需要在 `@ray-js/ray^1.4.43` 使用，当前能力为免费使用（限制7天内历史记录），直接在小程序开发者平台云能力订阅、授权即可。**

### 能力升级

**若想要升级设备日志存储能力，以及更多功能，可前往[设备日志增值服务](https://www.tuya.com/vas/commodity/DEVICE_LOG_QUERY_V2)查看升级。**

> 升级服务后可参考[订阅设备⽇志存储服务后的开通流程](https://drive.weixin.qq.com/s?k=AGQAugfWAAkPDlmmAW)进行操作，升级设备存储能力后可使用接口获取更多日志。

| 接口名                     | 描述                           |
| -------------------------- | ------------------------------ |
| getAnalyticsLogsPublishLog | 获取时间段里的下发日志历史记录 |
| getAnalyticsLogsStatusLog  | 获取时间段里的上报日志历史记录 |

### getAnalyticsLogsPublishLog

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

#### 描述

获取时间段里的下发日志历史记录

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `dpIds` | `string` | 是 | DP 点 ID，可以是多个 DP，用逗号隔开即可 |
| `dpValues` | `string` | 否 | 查询指定的功能点值，dpIds 为一个时生效，多 dpIds 查询不生效，用逗号隔开即可，不支持 Raw 型功能点。 当前仅免费版设备日志生效。 |
| `offset` | `number` | 是 | 查询返回结果时从指定序列后的结果开始返回（offset 从 0 开始） |
| `limit` | `number` | 是 | 单页的最大值，offset + limit 要小于等于 1000 |
| `startTime` | `string` | 否 | 设备上报的时间，查询起始时间，单位为毫秒。为空默认填充 7 天前时间戳 |
| `endTime` | `string` | 否 | 设备上报的时间，查询结束时间，单位为毫秒。为空默认填充当前时间戳 |
| `sortType` | `string` | 否 | DESC 倒序 或 ASC 顺序，默认 DESC |
| `queryType` | `string` | 否 | `0`：根据设备 id 所属产品 id 自动切换查询数据源。 `1`：查免费版设备日志数据源。 `2`：查收费版设备日志数据源。  在未购买收费版日志时，可忽略该入参 |

#### 返回值

类型: `Promise<GetAnalyticsLogsResult>`

含 dps（DP 结果列表）、hasNext、total；dps 元素为 DpResult（下发日志场景下文档含 nickName、userName）

###### GetAnalyticsLogsResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dps` | `DpResult[]` | 是 | 设备功能点数据集合 |
| `hasNext` | `boolean` | 是 | 是否还有下一页数据 |
| `total` | `number` | 是 | 总记录数 |

##### 引用对象

###### `type` DpResult

单条 DP 查询结果。
下发与上报文档在字段集合、`dpId` 形态上不一致（含返回示例与参数表差异）；与接口 `@returns` 互补，此处为类型层说明。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `number \| string` | 是 | `number` 与文档表一致；上报日志返回示例中亦出现多 DP 组合的字符串 |
| `value` | `any` | 是 | DP 点值 |
| `timeStamp` | `number` | 是 | 时间戳 |
| `timeStr` | `string` | 是 | 时间字符串 |
| `nickName` | `string` | 否 | 昵称（下发日志文档字段） |
| `userName` | `string` | 否 | 用户名（下发日志文档字段） |

#### 示例代码

##### 请求示例

```typescript
import { getAnalyticsLogsPublishLog } from '@tuya-miniapp/cloud-api';

getAnalyticsLogsPublishLog({
  devId: '6c272a8d82e3ed8300mizk',
  dpIds: '103,27',
  offset: 0,
  limit: 10,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```json
{
  "dpc": [],
  "dps": [
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842723,
      "timeStr": "2023-10-09 17:12:03",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842722,
      "timeStr": "2023-10-09 17:12:02",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842722,
      "timeStr": "2023-10-09 17:12:02",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842720,
      "timeStr": "2023-10-09 17:12:00",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842720,
      "timeStr": "2023-10-09 17:12:00",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842720,
      "timeStr": "2023-10-09 17:12:00",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842719,
      "timeStr": "2023-10-09 17:11:59",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842719,
      "timeStr": "2023-10-09 17:11:59",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842719,
      "timeStr": "2023-10-09 17:11:59",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    },
    {
      "dpId": 27,
      "nickName": "86-1********",
      "timeStamp": 1696842718,
      "timeStr": "2023-10-09 17:11:58",
      "userName": "86-1********",
      "value": "0000003e8006600000000"
    }
  ],
  "hasNext": true,
  "total": 97815
}
```

#### 注意事项

1. 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_
2. _**若想要升级设备日志存储能力，以及更多功能，可前往[设备日志增值服务](https://www.tuya.com/vas/commodity/DEVICE_LOG_QUERY_V2)查看升级。**_
升级服务后可参考[订阅设备⽇志存储服务后的开通流程](https://drive.weixin.qq.com/s?k=AGQAugfWAAkPDlmmAW)进行操作，升级设备存储能力后可使用接口获取更多日志。
3. 通过 Tuya MiniApp IDE 虚拟设备插件下发的指令不会记录在当前下发日志中，只有通过客户端真机实际下发的指令才会记录在下发日志中。
### getAnalyticsLogsStatusLog

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

#### 描述

获取时间段里的上报日志历史记录

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `dpIds` | `string` | 是 | DP 点 ID，可以是多个 DP，用逗号隔开即可 |
| `dpValues` | `string` | 否 | 查询指定的功能点值，dpIds 为一个时生效，多 dpIds 查询不生效，用逗号隔开即可，不支持 Raw 型功能点。 当前仅免费版设备日志生效。 |
| `offset` | `number` | 是 | 查询返回结果时从指定序列后的结果开始返回（offset 从 0 开始） |
| `limit` | `number` | 是 | 单页的最大值，offset + limit 要小于等于 1000 |
| `startTime` | `string` | 否 | 设备上报的时间，查询起始时间，单位为毫秒。为空默认填充 7 天前时间戳 |
| `endTime` | `string` | 否 | 设备上报的时间，查询结束时间，单位为毫秒。为空默认填充当前时间戳 |
| `sortType` | `string` | 否 | DESC 倒序 或 ASC 顺序，默认 DESC |
| `queryType` | `string` | 否 | `0`：根据设备 id 所属产品 id 自动切换查询数据源。 `1`：查免费版设备日志数据源。 `2`：查收费版设备日志数据源。  在未购买收费版日志时，可忽略该入参 |

#### 返回值

类型: `Promise<GetAnalyticsLogsResult>`

含 dps（设备功能点数据集合）、hasNext（是否还有下一页）、total（总记录数）；dps 元素为 DpResult

###### GetAnalyticsLogsResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dps` | `DpResult[]` | 是 | 设备功能点数据集合 |
| `hasNext` | `boolean` | 是 | 是否还有下一页数据 |
| `total` | `number` | 是 | 总记录数 |

##### 引用对象

###### `type` DpResult

单条 DP 查询结果。
下发与上报文档在字段集合、`dpId` 形态上不一致（含返回示例与参数表差异）；与接口 `@returns` 互补，此处为类型层说明。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `number \| string` | 是 | `number` 与文档表一致；上报日志返回示例中亦出现多 DP 组合的字符串 |
| `value` | `any` | 是 | DP 点值 |
| `timeStamp` | `number` | 是 | 时间戳 |
| `timeStr` | `string` | 是 | 时间字符串 |
| `nickName` | `string` | 否 | 昵称（下发日志文档字段） |
| `userName` | `string` | 否 | 用户名（下发日志文档字段） |

#### 示例代码

##### 请求示例

```typescript
import { getAnalyticsLogsStatusLog } from '@tuya-miniapp/cloud-api';

getAnalyticsLogsStatusLog({
  devId: 'tuya1319563f96bc263b',
  dpIds: '103',
  offset: 0,
  limit: 10,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```json
{
  "dpc": [],
  "dps": [
    {
      "dpId": "1, 103",
      "timeStamp": 1696845110,
      "timeStr": "2023-10-09 17:51:50",
      "value": "180"
    },
    {
      "dpId": "1, 103",
      "timeStamp": 1696845111,
      "timeStr": "2023-10-09 17:51:51",
      "value": "180"
    },
    {
      "dpId": "1, 103",
      "timeStamp": 1696845112,
      "timeStr": "2023-10-09 17:51:52",
      "value": "180"
    }
  ],
  "hasNext": false,
  "total": 3
}
```

#### 注意事项

1. 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api)。**目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。**
2. 若想要升级设备日志存储能力，以及更多功能，可前往[设备日志增值服务](https://www.tuya.com/vas/commodity/DEVICE_LOG_QUERY_V2)查看升级。升级服务后可参考[订阅设备日志存储服务后的开通流程](https://drive.weixin.qq.com/s?k=AGQAugfWAAkPDlmmAW)进行操作，升级设备存储能力后可使用接口获取更多日志。
3. 若要查询的 `dpValue` 为数值型功能点，需要根据数值型功能点的 `scale` 进行转换（即将数据以 10 的指数转换进行传输。示例值 scale：1，表示 10 的 1 次方，即 10），若要查询的原始数据值为 `343701`，`scale` 为 1 则入参的 `dpValues` 需要传入 `34370.1`。
