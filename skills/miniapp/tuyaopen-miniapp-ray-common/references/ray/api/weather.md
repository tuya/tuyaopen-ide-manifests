## 天气服务

> 该接口为云能力，需开通授权后使用，关于云能力可[查看文档](/cn/miniapp/common/desc/api) 
_**<font color="red">目前云能力在 `开发者工具`环境无法使用，需要打包后或真机调试使用。</font>**_

### 接口能力

对天气服务的能力我们提供了下接口能力，开发者可直接调用 `API` 完成计量相关业务开发。

**注意，以下 API 需要在 `@ray-js/ray^1.4.17` 使用。**

| 接口名                 | 描述                   |
| ---------------------- | ---------------------- |
| getWeatherDailyHistory | 根据设备id查询历史天气 |

### getWeatherDailyHistory

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://iot.tuya.com/miniapp/)开发设置-云能力进行授权配置。
> 注意：目前云能力在「开发者工具」环境无法使用，需要打包后或真机调试使用。

#### 描述

根据设备 id 查询历史天气

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `weatherFieldNames` | `string` | 是 | 天气字段，多个用逗号隔开（如 pm25）；枚举值见 minituya 文档「weatherFieldNames 枚举值」 |
| `beginTime` | `number` | 是 | 开始时间戳 |
| `endTime` | `number` | 是 | 结束时间戳 |
| `ip` | `string` | 否 | IP 地址 |

#### 返回值

类型: `Promise<GetWeatherDailyHistoryResult>`

GetWeatherDailyHistoryResult（键为 YYYY-MM-DD 日期字符串，值为该日 Weather 对象；字段含义见类型定义与 minituya 返回参数）

#### 示例代码

##### 请求示例

```typescript
import { getWeatherDailyHistory } from '@tuya-miniapp/cloud-api';

getWeatherDailyHistory({
  devId: '6cbed8370dd694e247uk9u',
  ip: '',
  weatherFieldNames: 'pm25',
  beginTime: 1698028537000,
  endTime: 1698287737698,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  "2023-10-24": {
    "date": "2023-10-24",
    "localDate": 1698076800000,
    "pm25": "31.82"
  },
  "2023-10-25": {
    "date": "2023-10-25",
    "localDate": 1698163200000,
    "pm25": "50.93"
  }
}
```
