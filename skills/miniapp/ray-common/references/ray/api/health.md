# 健康 (health)


## 通用

#### health.getHealthConnectStatus

##### 功能描述

health connect sdk 状态获取[Android only]

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 android 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { getHealthConnectStatus } = health
getHealthConnectStatus({ ... })
```

**原生小程序中使用**

```javascript
const { getHealthConnectStatus } = ty.health
getHealthConnectStatus({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性  | 类型   | 说明                                                                                                                                                                                               |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value | number | -2 服务不可用（需要提示用户去更改自启动和电源管理），建议面板收到-2 直接跳转到授权页。授权页做弹窗提示
-1 Health Connect 不可用/不支持\]
0 已授权
1 未安装 Health Connect
2 未授权 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### health.getHealthConnectStatusSync

##### 功能描述

health connect sdk 状态获取[Android only]的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 android 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { getHealthConnectStatusSync } = health
getHealthConnectStatusSync({ ... })
```

**原生小程序中使用**

```javascript
const { getHealthConnectStatusSync } = ty.health
getHealthConnectStatusSync({ ... })
```

##### 返回值

| 属性  | 类型   | 说明                                                                                                                                                                                                                    | 版本   |
| ----- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| value | number | -2 服务不可用（需要提示用户去更改自启动和电源管理），建议面板收到-2 直接跳转到授权页。授权页做弹窗提示
-1 Health Connect 不可用/不支持\]
0 已授权
1 未安装 Health Connect
2 未授权
`最低版本5.18.4` | 5.18.4 |
#### health.insertRecords

##### 功能描述

数据同步到 health connect [Android only]

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 android 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { insertRecords } = health

const request = [
    {
        dpCode: 'height',
        time: 1716537600000,
        data: 180,
        devId: '1234567890',
        startTime: 1716537600000,
        endTime: 1716537600000,
    }
]
insertRecords({
    request: JSON.stringify(request),
    success: function(res) {
        console.log(res)
    },
    fail: function(res) {
        console.log(res)
    }
})
```

**原生小程序中使用**

```javascript
const { insertRecords } = ty.health

const request = [
    {
        dpCode: 'height',
        time: 1716537600000,
        data: 180,
        devId: '1234567890',
        startTime: 1716537600000,
        endTime: 1716537600000,
    }
]
insertRecords({
    request: JSON.stringify(request),
    success: function(res) {
        console.log(res)
    },
    fail: function(res) {
        console.log(res)
    }
})
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| request  | string   |        | 是   | RecordData 数据列表的 json array 字符串          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

**RecordData**

| 字段名    | 类型               | 注释                                                       |
| --------- | ------------------ | ---------------------------------------------------------- |
| dpCode    | String             | 数据类型(必填)                                             |
| time      | Long               | 单次测量时间（13位时间戳）（dpCode类型为单次测量数据时填） |
| startTime | Long               | 开始时间(13位时间戳)（dpCode类型为持续测量数据时填）       |
| endTime   | Long               | 结束时间(13位时间戳)（dpCode类型为持续测量数据时填）       |
| devId     | String             | 设备Id(必填)                                               |
| data      | Float              | 单次测量数据（dpCode类型为单次测量数据时填）               |
| dataList  | DataBean类型的List | 持续测量的数据，例如心率（dpCode类型为持续测量数据时填）   |

**DataBean**

| 字段名 | 类型  | 注释                                    |
| ------ | ----- | --------------------------------------- |
| time   | Long  | 单次测量时间（13位时间戳）              |
| data   | Float | 单次测量数据（见下文data 字段数据说明） |

**dpCode及对应data字段数据说明**

| dpCode                          | 对应data值的单位   | 说明       | 测量数据类型       |
| ------------------------------- | ------------------ | ---------- | ------------------ |
| height                          | cm                 | 身高       | 单次测量           |
| weight                          | kg                 | 体重       | 单次测量           |
| heart_rate                      | 次/分钟            | 心率       | 单次测量或持续测量 |
| calories_total                  | cal                | 卡路里     | 持续测量           |
| systolic_bp                     | mmHg               | 收缩压     | 单次测量           |
| diastolic_bp                    | mmHg               | 舒张压     | 单次测量           |
| blood_oxygen/ blood_oxygen_data | %                  | 血氧       | 单次测量           |
| body_temp                       | °C                 | 体温       | 单次测量           |
| metabolism                      | kilocaloriesPerDay | 基础代谢率 | 单次测量           |
| fat                             | %                  | 体脂率     | 单次测量           |
| water                           | kg                 | 水分率     | 单次测量           |
| bone                            | kg                 | 骨量       | 单次测量           |
| ffm                             | kg                 | 去脂体重   | 单次测量           |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| -1005  | service error,please check if Health Connect is set to auto-start and if power management has no restrictions |
| -1004  | error when commit to Health Connect                                                                           |
| -1003  | data is null                                                                                                  |
| -1002  | data conversion error                                                                                         |
| -1001  | phone is not support                                                                                          |
#### health.insertRecordsSync

##### 功能描述

数据同步到 health connect [Android only]的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>

> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。 > **平台支持:** 仅支持 android 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { insertRecords } = health

const request = [
    {
        dpCode: 'height',
        time: 1716537600000,
        data: 180,
        devId: '1234567890',
        startTime: 1716537600000,
        endTime: 1716537600000,
    }
]
insertRecordsSync({
    request: JSON.stringify(request),
})
```

**原生小程序中使用**

```javascript
const { insertRecords } = ty.health

const request = [
    {
        dpCode: 'height',
        time: 1716537600000,
        data: 180,
        devId: '1234567890',
        startTime: 1716537600000,
        endTime: 1716537600000,
    }
]
insertRecordsSync({
    request: JSON.stringify(request),
})
```

**RecordData**

| 字段名    | 类型               | 注释                                                       |
| --------- | ------------------ | ---------------------------------------------------------- |
| dpCode    | String             | 数据类型(必填)                                             |
| time      | Long               | 单次测量时间（13位时间戳）（dpCode类型为单次测量数据时填） |
| startTime | Long               | 开始时间(13位时间戳)（dpCode类型为持续测量数据时填）       |
| endTime   | Long               | 结束时间(13位时间戳)（dpCode类型为持续测量数据时填）       |
| devId     | String             | 设备Id(必填)                                               |
| data      | Float              | 单次测量数据（dpCode类型为单次测量数据时填）               |
| dataList  | DataBean类型的List | 持续测量的数据，例如心率（dpCode类型为持续测量数据时填）   |

**DataBean**

| 字段名 | 类型  | 注释                                    |
| ------ | ----- | --------------------------------------- |
| time   | Long  | 单次测量时间（13位时间戳）              |
| data   | Float | 单次测量数据（见下文data 字段数据说明） |

**dpCode及对应data字段数据说明**

| dpCode                          | 对应data值的单位   | 说明       | 测量数据类型       |
| ------------------------------- | ------------------ | ---------- | ------------------ |
| height                          | cm                 | 身高       | 单次测量           |
| weight                          | kg                 | 体重       | 单次测量           |
| heart_rate                      | 次/分钟            | 心率       | 单次测量或持续测量 |
| calories_total                  | cal                | 卡路里     | 持续测量           |
| systolic_bp                     | mmHg               | 收缩压     | 单次测量           |
| diastolic_bp                    | mmHg               | 舒张压     | 单次测量           |
| blood_oxygen/ blood_oxygen_data | %                  | 血氧       | 单次测量           |
| body_temp                       | °C                 | 体温       | 单次测量           |
| metabolism                      | kilocaloriesPerDay | 基础代谢率 | 单次测量           |
| fat                             | %                  | 体脂率     | 单次测量           |
| water                           | kg                 | 水分率     | 单次测量           |
| bone                            | kg                 | 骨量       | 单次测量           |
| ffm                             | kg                 | 去脂体重   | 单次测量           |

##### 请求参数

**Object object**

| 属性    | 类型   | 默认值 | 必填 | 说明                                    |
| ------- | ------ | ------ | ---- | --------------------------------------- |
| request | string |        | 是   | RecordData 数据列表的 json array 字符串 |

##### 错误码

| 错误码 | 错误描述                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| -1005  | service error,please check if Health Connect is set to auto-start and if power management has no restrictions |
| -1004  | error when commit to Health Connect                                                                           |
| -1003  | data is null                                                                                                  |
| -1002  | data conversion error                                                                                         |
| -1001  | phone is not support                                                                                          |
#### health.authStatusPermissions

##### 功能描述

用户是否已经做过授权操作(针对 Quantity 类型数据)[iOS only]
需要参数为 readPermissions,writePermissions

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authStatusPermissions } = health
authStatusPermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authStatusPermissions } = ty.health
authStatusPermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

| 属性  | 类型   | 说明                                                                                          |
| ----- | ------ | --------------------------------------------------------------------------------------------- |
| value | number | 1 代表传入的类型都申请过对应的读写权限
0 代表传入的类型至少有一个没有请求过对应的读写权限 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authStatusPermissionsSync

##### 功能描述

用户是否已经做过授权操作(针对 Quantity 类型数据)[iOS only]
需要参数为 readPermissions,writePermissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authStatusPermissionsSync } = health
authStatusPermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authStatusPermissionsSync } = ty.health
authStatusPermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 返回值

| 属性  | 类型   | 说明                                                                                                               | 版本   |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------ | ------ |
| value | number | 1 代表传入的类型都申请过对应的读写权限
0 代表传入的类型至少有一个没有请求过对应的读写权限
`最低版本5.18.4` | 5.18.4 |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.getSaveQuantityPermission

##### 功能描述

用户是否有 Quantity 类型数据写入权限[iOS only]
需要参数为 writePermission

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { getSaveQuantityPermission } = health
getSaveQuantityPermission({ ... })
```

**原生小程序中使用**

```javascript
const { getSaveQuantityPermission } = ty.health
getSaveQuantityPermission({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

| 属性  | 类型   | 说明                          |
| ----- | ------ | ----------------------------- |
| value | number | 1 有写入权限
0 无写入权限 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.getSaveQuantityPermissionSync

##### 功能描述

用户是否有 Quantity 类型数据写入权限[iOS only]
需要参数为 writePermission 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { getSaveQuantityPermissionSync } = health
getSaveQuantityPermissionSync({ ... })
```

**原生小程序中使用**

```javascript
const { getSaveQuantityPermissionSync } = ty.health
getSaveQuantityPermissionSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 返回值

| 属性  | 类型   | 说明                                               | 版本   |
| ----- | ------ | -------------------------------------------------- | ------ |
| value | number | 1 有写入权限
0 无写入权限
`最低版本5.18.4` | 5.18.4 |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authQuantityWritePermissions

##### 功能描述

Quantity 写入权限申请接口[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authQuantityWritePermissions } = health
authQuantityWritePermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authQuantityWritePermissions } = ty.health
authQuantityWritePermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authQuantityWritePermissionsSync

##### 功能描述

Quantity 写入权限申请接口[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authQuantityWritePermissionsSync } = health
authQuantityWritePermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authQuantityWritePermissionsSync } = ty.health
authQuantityWritePermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authCategoryWritePermissions

##### 功能描述

Category 写入权限申请接口[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCategoryWritePermissions } = health
authCategoryWritePermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authCategoryWritePermissions } = ty.health
authCategoryWritePermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.authCategoryWritePermissionsSync

##### 功能描述

Category 写入权限申请接口[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCategoryWritePermissionsSync } = health
authCategoryWritePermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authCategoryWritePermissionsSync } = ty.health
authCategoryWritePermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.authQuantityReadPermissions

##### 功能描述

Quantity 读取权限申请[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authQuantityReadPermissions } = health
authQuantityReadPermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authQuantityReadPermissions } = ty.health
authQuantityReadPermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authQuantityReadPermissionsSync

##### 功能描述

Quantity 读取权限申请[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authQuantityReadPermissionsSync } = health
authQuantityReadPermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authQuantityReadPermissionsSync } = ty.health
authQuantityReadPermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authCategoryReadPermissions

##### 功能描述

Category 读取权限申请[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCategoryReadPermissions } = health
authCategoryReadPermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authCategoryReadPermissions } = ty.health
authCategoryReadPermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.authCategoryReadPermissionsSync

##### 功能描述

Category 读取权限申请[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCategoryReadPermissionsSync } = health
authCategoryReadPermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authCategoryReadPermissionsSync } = ty.health
authCategoryReadPermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.authCharacteristicReadPermissions

##### 功能描述

Characteristic 读取权限申请[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCharacteristicReadPermissions } = health
authCharacteristicReadPermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authCharacteristicReadPermissions } = ty.health
authCharacteristicReadPermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释       |
| ------ | ---------- |
| 1      | 性别特征符 |
| 2      | 血型       |
| 3      | 出生日期   |
| 4      | 皮肤类型   |
| 5      | 使用轮椅   |
#### health.authCharacteristicReadPermissionsSync

##### 功能描述

Characteristic 读取权限申请[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCharacteristicReadPermissionsSync } = health
authCharacteristicReadPermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authCharacteristicReadPermissionsSync } = ty.health
authCharacteristicReadPermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释       |
| ------ | ---------- |
| 1      | 性别特征符 |
| 2      | 血型       |
| 3      | 出生日期   |
| 4      | 皮肤类型   |
| 5      | 使用轮椅   |
#### health.authQuantityRWPermissions

##### 功能描述

Quantity 读写权限申请[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authQuantityRWPermissions } = health
authQuantityRWPermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authQuantityRWPermissions } = ty.health
authQuantityRWPermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authQuantityRWPermissionsSync

##### 功能描述

Quantity 读写权限申请[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authQuantityRWPermissionsSync } = health
authQuantityRWPermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authQuantityRWPermissionsSync } = ty.health
authQuantityRWPermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.authCategoryRWPermissions

##### 功能描述

Category 读写权限申请[iOS only]
需要参数为 permissions

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCategoryRWPermissions } = health
authCategoryRWPermissions({ ... })
```

**原生小程序中使用**

```javascript
const { authCategoryRWPermissions } = ty.health
authCategoryRWPermissions({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.authCategoryRWPermissionsSync

##### 功能描述

Category 读写权限申请[iOS only]
需要参数为 permissions 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { authCategoryRWPermissionsSync } = health
authCategoryRWPermissionsSync({ ... })
```

**原生小程序中使用**

```javascript
const { authCategoryRWPermissionsSync } = ty.health
authCategoryRWPermissionsSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

##### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.saveQuantityData

##### 功能描述

写入 Quantity 类型的数据[iOS only]
需要参数为 value,type,unitType,startTime,endTime

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveQuantityData } = health
saveQuantityData({ ... })
```

**原生小程序中使用**

```javascript
const { saveQuantityData } = ty.health
saveQuantityData({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.saveQuantityDataSync

##### 功能描述

写入 Quantity 类型的数据[iOS only]
需要参数为 value,type,unitType,startTime,endTime 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveQuantityDataSync } = health
saveQuantityDataSync({ ... })
```

**原生小程序中使用**

```javascript
const { saveQuantityDataSync } = ty.health
saveQuantityDataSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.saveQuantityNoTimeWithData

##### 功能描述

写入 Quantity 类型的数据,不用传时间，开始时间和结束时间默认设置为当前时间[iOS only]
需要参数为 value,type,unitType

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveQuantityNoTimeWithData } = health
saveQuantityNoTimeWithData({ ... })
```

**原生小程序中使用**

```javascript
const { saveQuantityNoTimeWithData } = ty.health
saveQuantityNoTimeWithData({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.saveQuantityNoTimeWithDataSync

##### 功能描述

写入 Quantity 类型的数据,不用传时间，开始时间和结束时间默认设置为当前时间[iOS only]
需要参数为 value,type,unitType 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveQuantityNoTimeWithDataSync } = health
saveQuantityNoTimeWithDataSync({ ... })
```

**原生小程序中使用**

```javascript
const { saveQuantityNoTimeWithDataSync } = ty.health
saveQuantityNoTimeWithDataSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.saveBloodPressureData

##### 功能描述

写入血压数据[iOS only]

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveBloodPressureData } = health
saveBloodPressureData({ ... })
```

**原生小程序中使用**

```javascript
const { saveBloodPressureData } = ty.health
saveBloodPressureData({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| systolic  | number   |        | 是   | 收缩压                                           |
| diastolic | number   |        | 是   | 舒张压                                           |
| startTime | number   |        | 是   | 开始时间,秒级时间戳                              |
| endTime   | number   |        | 是   | 结束时间,秒级时间戳                              |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |
#### health.saveBloodPressureDataSync

##### 功能描述

写入血压数据[iOS only]的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveBloodPressureDataSync } = health
saveBloodPressureDataSync({ ... })
```

**原生小程序中使用**

```javascript
const { saveBloodPressureDataSync } = ty.health
saveBloodPressureDataSync({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型   | 默认值 | 必填 | 说明                |
| --------- | ------ | ------ | ---- | ------------------- |
| systolic  | number |        | 是   | 收缩压              |
| diastolic | number |        | 是   | 舒张压              |
| startTime | number |        | 是   | 开始时间,秒级时间戳 |
| endTime   | number |        | 是   | 结束时间,秒级时间戳 |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |
#### health.readQuantityDataWithType

##### 功能描述

读取 Quantity[iOS only]
需要参数为 type,unitType,startTime,endTime

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { readQuantityDataWithType } = health
readQuantityDataWithType({ ... })
```

**原生小程序中使用**

```javascript
const { readQuantityDataWithType } = ty.health
readQuantityDataWithType({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

| 属性  | 类型     | 说明                                                                                                                                                                                                             |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value | Object[] | 读取到的数据,是一个数组,数组中每一项是一个字典,具体定义如下
value: Integer 读取到的值,不同的含义参考苹果官方文档
startDate: Double 读取到的条目的起始时间戳
endDate: Double 读取到的条目的截止时间戳 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.readQuantityDataWithTypeSync

##### 功能描述

读取 Quantity[iOS only]
需要参数为 type,unitType,startTime,endTime 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { readQuantityDataWithTypeSync } = health
readQuantityDataWithTypeSync({ ... })
```

**原生小程序中使用**

```javascript
const { readQuantityDataWithTypeSync } = ty.health
readQuantityDataWithTypeSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 返回值

| 属性  | 类型     | 说明                                                                                                                                                                                                                                  | 版本   |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| value | Object[] | 读取到的数据,是一个数组,数组中每一项是一个字典,具体定义如下
value: Integer 读取到的值,不同的含义参考苹果官方文档
startDate: Double 读取到的条目的起始时间戳
endDate: Double 读取到的条目的截止时间戳
`最低版本5.18.4` | 5.18.4 |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.deleteQuantityDataType

##### 功能描述

删除 QuantityData 数据,基于起止时间删除[iOS only]
需要参数为 type,startTime,endTime

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { deleteQuantityDataType } = health
deleteQuantityDataType({ ... })
```

**原生小程序中使用**

```javascript
const { deleteQuantityDataType } = ty.health
deleteQuantityDataType({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

##### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.deleteQuantityDataTypeSync

##### 功能描述

删除 QuantityData 数据,基于起止时间删除[iOS only]
需要参数为 type,startTime,endTime 的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { deleteQuantityDataTypeSync } = health
deleteQuantityDataTypeSync({ ... })
```

**原生小程序中使用**

```javascript
const { deleteQuantityDataTypeSync } = ty.health
deleteQuantityDataTypeSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

##### 枚举列表

| 枚举值 | 注释                  |
| ------ | --------------------- |
| 1      | 身高体重指数          |
| 2      | 体脂率                |
| 3      | 身高                  |
| 4      | 体重                  |
| 5      | 去脂体重              |
| 6      | 腰围                  |
| 101    | 步数                  |
| 102    | 步行+跑步距离         |
| 103    | 骑车距离              |
| 104    | 静息能量              |
| 105    | 活动能量              |
| 106    | 已爬楼层              |
| 107    | NikeFuel              |
| 108    | 锻炼分钟数健身数据    |
| 109    | 轮椅推动次数          |
| 110    | 距离游泳              |
| 111    | 游泳划水次数          |
| 112    | 最大摄氧量            |
| 113    | 高山雪上运动距离      |
| 201    | 心率                  |
| 202    | 身体温度              |
| 203    | 基础体温              |
| 204    | 收缩压                |
| 205    | 舒张压                |
| 206    | 呼吸速率              |
| 207    | 其他心率              |
| 208    | 平均步行心率          |
| 209    | 心率变异性SDNN        |
| 301    | 血氧饱和度            |
| 302    | 末梢灌注指数          |
| 303    | 血糖                  |
| 304    | 摔倒次数              |
| 305    | 皮电活动              |
| 306    | 吸入剂用量            |
| 307    | 血液酒精浓度          |
| 308    | 最大肺活量/用力肺活量 |
| 309    | 第一秒用力呼气量      |
| 310    | 呼气流量峰值          |
| 401    | 总脂肪                |
| 402    | 多元不饱和脂肪        |
| 403    | 单元不饱和脂肪        |
| 404    | 饱和脂肪              |
| 405    | 膳食胆固醇            |
| 406    | 钠                    |
| 407    | 碳水化合物            |
| 408    | 纤维                  |
| 409    | 膳食糖                |
| 410    | 膳食能量              |
| 411    | 蛋白质                |
| 412    | 维生素 A              |
| 413    | 维生素 B6             |
| 414    | 维生素 B12            |
| 415    | 维生素 C              |
| 416    | 维生素 D              |
| 417    | 维生素 E              |
| 418    | 维生素 K              |
| 419    | 钙                    |
| 420    | 铁                    |
| 421    | 硫铵                  |
| 422    | 核黄素                |
| 423    | 烟酸                  |
| 424    | 叶酸                  |
| 425    | 生物素                |
| 426    | 泛酸                  |
| 427    | 磷                    |
| 428    | 碘                    |
| 429    | 镁                    |
| 430    | 锌                    |
| 431    | 硒                    |
| 432    | 铜                    |
| 433    | 锰                    |
| 434    | 铬                    |
| 435    | 钼                    |
| 436    | 氯化物                |
| 437    | 钾                    |
| 438    | 咖啡因                |
| 439    | 水                    |
| 440    | 紫外线指数            |
#### health.readCharacteristicDataWithType

##### 功能描述

读取 Characteristic[iOS only]
需要参数为 type

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { readCharacteristicDataWithType } = health
readCharacteristicDataWithType({ ... })
```

**原生小程序中使用**

```javascript
const { readCharacteristicDataWithType } = ty.health
readCharacteristicDataWithType({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

| 属性  | 类型     | 说明                                                                                                                                                                                                             |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value | Object[] | 读取到的数据,是一个数组,数组中每一项是一个字典,具体定义如下
value: Integer 读取到的值,不同的含义参考苹果官方文档
startDate: Double 读取到的条目的起始时间戳
endDate: Double 读取到的条目的截止时间戳 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释       |
| ------ | ---------- |
| 1      | 性别特征符 |
| 2      | 血型       |
| 3      | 出生日期   |
| 4      | 皮肤类型   |
| 5      | 使用轮椅   |
#### health.readCharacteristicDataWithTypeSync

##### 功能描述

读取 Characteristic[iOS only]
需要参数为 type 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { readCharacteristicDataWithTypeSync } = health
readCharacteristicDataWithTypeSync({ ... })
```

**原生小程序中使用**

```javascript
const { readCharacteristicDataWithTypeSync } = ty.health
readCharacteristicDataWithTypeSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 返回值

| 属性  | 类型     | 说明                                                                                                                                                                                                                                  | 版本   |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| value | Object[] | 读取到的数据,是一个数组,数组中每一项是一个字典,具体定义如下
value: Integer 读取到的值,不同的含义参考苹果官方文档
startDate: Double 读取到的条目的起始时间戳
endDate: Double 读取到的条目的截止时间戳
`最低版本5.18.4` | 5.18.4 |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释       |
| ------ | ---------- |
| 1      | 性别特征符 |
| 2      | 血型       |
| 3      | 出生日期   |
| 4      | 皮肤类型   |
| 5      | 使用轮椅   |
#### health.saveCategoryData

##### 功能描述

写入 Category 类型的数据[iOS only]
需要参数为 value,type,startTime,endTime
Category 类型数据的写入参考苹果官方文档的定义

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveCategoryData } = health
saveCategoryData({ ... })
```

**原生小程序中使用**

```javascript
const { saveCategoryData } = ty.health
saveCategoryData({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.saveCategoryDataSync

##### 功能描述

写入 Category 类型的数据[iOS only]
需要参数为 value,type,startTime,endTime
Category 类型数据的写入参考苹果官方文档的定义的同步版本

> 需引入`HealthKit`，且在`>=5.18.3`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveCategoryDataSync } = health
saveCategoryDataSync({ ... })
```

**原生小程序中使用**

```javascript
const { saveCategoryDataSync } = ty.health
saveCategoryDataSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.saveCategoryNoTimeWithData

##### 功能描述

写入 Category 类型的数据,不用传时间，开始时间和结束时间默认设置为当前时间[iOS only]
需要参数为 value,type

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveCategoryNoTimeWithData } = health
saveCategoryNoTimeWithData({ ... })
```

**原生小程序中使用**

```javascript
const { saveCategoryNoTimeWithData } = ty.health
saveCategoryNoTimeWithData({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.saveCategoryNoTimeWithDataSync

##### 功能描述

写入 Category 类型的数据,不用传时间，开始时间和结束时间默认设置为当前时间[iOS only]
需要参数为 value,type 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { saveCategoryNoTimeWithDataSync } = health
saveCategoryNoTimeWithDataSync({ ... })
```

**原生小程序中使用**

```javascript
const { saveCategoryNoTimeWithDataSync } = ty.health
saveCategoryNoTimeWithDataSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 错误码

| 错误码 | 错误描述                |
| ------ | ----------------------- |
| 1      | AppleHealthParamsError  |
| 2      | AppleHealthNoPermission |

#### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.readCategoryDataWithType

##### 功能描述

读取 Category 类型的数据[iOS only]
需要参数为 type,startTime,endTime

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { readCategoryDataWithType } = health
readCategoryDataWithType({ ... })
```

**原生小程序中使用**

```javascript
const { readCategoryDataWithType } = ty.health
readCategoryDataWithType({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |
| success          | function |        | 否   | 接口调用成功的回调函数                                                                                                                  |
| fail             | function |        | 否   | 接口调用失败的回调函数                                                                                                                  |
| complete         | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                        |

##### 返回结果

**success**

| 属性  | 类型     | 说明                                                                                                                                                                                                             |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value | Object[] | 读取到的数据,是一个数组,数组中每一项是一个字典,具体定义如下
value: Integer 读取到的值,不同的含义参考苹果官方文档
startDate: Double 读取到的条目的起始时间戳
endDate: Double 读取到的条目的截止时间戳 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
#### health.readCategoryDataWithTypeSync

##### 功能描述

读取 Category 类型的数据[iOS only]
需要参数为 type,startTime,endTime 的同步版本

> 需引入`HealthKit`，且在`>=5.18.0`版本才可使用<br>
> 若使用 Ray 进行开发，则需要 `@ray-js/ray` 版本 1.6.18 及以上。
> **平台支持:** 仅支持 ios 平台

##### 使用

**Ray 中使用**

```javascript
import { health } from '@ray-js/ray'
const { readCategoryDataWithTypeSync } = health
readCategoryDataWithTypeSync({ ... })
```

**原生小程序中使用**

```javascript
const { readCategoryDataWithTypeSync } = ty.health
readCategoryDataWithTypeSync({ ... })
```

##### 请求参数

**Object object**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                    |
| ---------------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------- |
| permissions      | string[] |        | 否   | 权限类型\(申请读写权限的接口使用\)，具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                                    |
| readPermissions  | string[] |        | 否   | 读取权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermissions | string[] |        | 否   | 写入权限类型\(查询用户是否已经做过授权操作的接口使用\),具体枚举值查看下文的枚举列表
eg. \["1","2"\]                                 |
| writePermission  | number   |        | 否   | 写入权限类型\(查询是否有写权限的接口使用\),具体枚举值查看下文的枚举列表                                                                 |
| value            | number   |        | 否   | 写入值                                                                                                                                  |
| unitType         | string   |        | 否   | 传入单位 比如"mg/dL"，"g","cm","count",查询和写入 Quantity 类型数据时需要
数据类型对应单位可参考苹果官方的 HKTypeIdentifiers.h 文件 |
| startTime        | number   |        | 否   | 开始时间,秒级时间戳                                                                                                                     |
| endTime          | number   |        | 否   | 结束时间,秒级时间戳                                                                                                                     |
| type             | number   |        | 否   | 需要读写的数据类型\(读写数据的接口使用\),具体枚举值查看下文的枚举列表                                                                   |

##### 返回值

| 属性  | 类型     | 说明                                                                                                                                                                                                                                  | 版本   |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| value | Object[] | 读取到的数据,是一个数组,数组中每一项是一个字典,具体定义如下
value: Integer 读取到的值,不同的含义参考苹果官方文档
startDate: Double 读取到的条目的起始时间戳
endDate: Double 读取到的条目的截止时间戳
`最低版本5.18.4` | 5.18.4 |

##### 错误码

| 错误码 | 错误描述               |
| ------ | ---------------------- |
| 1      | AppleHealthParamsError |

#### 枚举列表

| 枚举值 | 注释                                    |
| ------ | --------------------------------------- |
| 1      | 睡眠分析                                |
| 2      | 是否至少站立1小时及以上                 |
| 3      | 宫颈粘液质量                            |
| 4      | 排卵期家庭测试结果                      |
| 5      | 月经周期                                |
| 6      | 正常月经期以外的斑点                    |
| 7      | 性生活活跃状态                          |
| 8      | 有意识的会话                            |
| 9      | 高心率事件                              |
| 10     | 低心率事件                              |
| 11     | 心率不齐事件                            |
| 12     | 环境音频暴露事件 iOS13+ iOS14Deprecated |
| 13     | 环境音频暴露事件 iOS14+                 |
| 14     | 刷牙事件                                |
### 添加面板用户

`addPanelUser`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { addPanelUser } = health;
```

**参数**

**AddPanelUserParams**

添加面板用户的请求参数。

| 属性     | 类型                 | 必填 | 说明     |
| -------- | -------------------- | ---- | -------- |
| userInfo | AddPanelUserUserInfo | 是   | 用户信息 |

**AddPanelUserUserInfo**

| 属性       | 类型                           | 必填 | 说明                                           |
| ---------- | ------------------------------ | ---- | ---------------------------------------------- |
| devId      | `string`                       | 是   | 设备id                                         |
| type       | `1 \| 2 \| 3 \| 6`              | 是   | 业务类型：1-血压计；2-厨房秤；3-体脂称；6-血氧仪 |
| userName   | `string`                       | 是   | 用户名                                         |
| sex        | `0 \| 1`                        | 是   | 性别 0-男 1-女                                 |
| birthday   | `number`                       | 是   | 生日 时间戳                                    |
| height     | `number`                       | 是   | 身高                                           |
| heightUnit | `'cm' \| 'inch'`                | 是   | 身高单位                                       |
| weight     | `number`                       | 是   | 体重                                           |
| weightUnit | `'kg' \| 'lb' \| 'st' \| 'jin'`  | 是   | 体重单位                                       |
| userType   | `number`                       | 是   | 用户类型, 1-主用户,2-临时用户,其他-dp配置用户   |
| avatar     | `string`                       | 否   | 头像                                           |
| extInfo    | `string \| { weightScale: number }` | 否   | 扩展信息，体重可能需要扩大10倍保存             |

**返回**

**AddPanelUserResponse**

添加面板用户的响应值。

| 类型     | 说明       |
| -------- | ---------- |
| `string` | 新增用户id |

**函数定义**

```typescript
function addPanelUser(params: AddPanelUserParams): Promise<AddPanelUserResponse>;
```

### 更新面板用户

`updatePanelUser`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { updatePanelUser } = health;
```

**参数**

**UpdatePanelUserParams**

更新面板用户的请求参数。

| 属性     | 类型                   | 必填 | 说明     |
| -------- | ---------------------- | ---- | -------- |
| userInfo | UpdatePanelUserUserInfo | 是   | 用户信息 |

**UpdatePanelUserUserInfo**

| 属性       | 类型                           | 必填 | 说明                                           |
| ---------- | ------------------------------ | ---- | ---------------------------------------------- |
| userId     | `string`                       | 是   | 用户id                                         |
| devId      | `string`                       | 是   | 设备id                                         |
| type       | `1 \| 2 \| 3 \| 6`              | 是   | 业务类型：1-血压计；2-厨房秤；3-体脂称；6-血氧仪 |
| userName   | `string`                       | 是   | 用户名                                         |
| sex        | `0 \| 1`                        | 是   | 性别 0-男 1-女                                 |
| birthday   | `number`                       | 是   | 生日 时间戳                                    |
| height     | `number`                       | 是   | 身高                                           |
| heightUnit | `'cm' \| 'inch'`                | 是   | 身高单位                                       |
| weight     | `number`                       | 是   | 体重                                           |
| weightUnit | `'kg' \| 'lb' \| 'st' \| 'jin'`  | 是   | 体重单位                                       |
| userType   | `number`                       | 是   | 用户类型, 1-主用户,2-临时用户,其他-dp配置用户   |
| avatar     | `string`                       | 否   | 头像                                           |
| extInfo    | `string \| { weightScale: number }` | 否   | 扩展信息，体重可能需要扩大10倍保存             |

**返回**

**UpdatePanelUserResponse**

更新面板用户的响应值。

| 类型      | 说明         |
| --------- | ------------ |
| `boolean` | 是否调用成功 |

**函数定义**

```typescript
function updatePanelUser(params: UpdatePanelUserParams): Promise<UpdatePanelUserResponse>;
```

### 删除面板用户

`deletePanelUser`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { deletePanelUser } = health;
```

**参数**

**DeletePanelUserParams**

删除面板用户的请求参数。

| 属性   | 类型     | 必填 | 说明   |
| ------ | -------- | ---- | ------ |
| userId | `string` | 是   | 用户id |

**返回**

**DeletePanelUserResponse**

删除面板用户的响应值。

| 类型      | 说明         |
| --------- | ------------ |
| `boolean` | 是否调用成功 |

**函数定义**

```typescript
function deletePanelUser(params: DeletePanelUserParams): Promise<DeletePanelUserResponse>;
```

### 获取面板用户列表

`getPanelUserList`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getPanelUserList } = health;
```

**参数**

**GetPanelUserListParams**

获取面板用户列表的请求参数。

| 属性  | 类型     | 必填 | 说明   |
| ----- | -------- | ---- | ------ |
| devId | `string` | 是   | 设备id |

**返回**

**GetPanelUserListResponse**

获取面板用户列表的响应值。

| 类型    | 说明     |
| ------- | -------- |
| `User[]` | 用户列表 |

**User**

| 属性       | 类型                           | 说明                                           |
| ---------- | ------------------------------ | ---------------------------------------------- |
| userId     | `string`                       | 用户id                                         |
| devId      | `string`                       | 设备id                                         |
| type       | `1 \| 2 \| 3 \| 6`              | 业务类型：1-血压计；2-厨房秤；3-体脂称；6-血氧仪 |
| userName   | `string`                       | 用户名                                         |
| sex        | `0 \| 1`                        | 性别 0-男 1-女                                 |
| birthday   | `number`                       | 生日 时间戳                                    |
| height     | `number`                       | 身高                                           |
| heightUnit | `'cm' \| 'inch'`                | 身高单位                                       |
| weight     | `number`                       | 体重                                           |
| weightUnit | `'kg' \| 'lb' \| 'st' \| 'jin'`  | 体重单位                                       |
| userType   | `number`                       | 用户类型, 1-主用户,2-临时用户,其他-dp配置用户   |
| avatar     | `string`                       | 头像                                           |
| extInfo    | `string \| { weightScale: number }` | 扩展信息，体重可能需要扩大10倍保存             |

**函数定义**

```typescript
function getPanelUserList(params: GetPanelUserListParams): Promise<GetPanelUserListResponse>;
```

### 获取默认头像列表

`getDefaultAvatarList`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getDefaultAvatarList } = health;
```

**参数**

**GetDefaultAvatarListParams**

获取默认头像列表的请求参数。

| 属性    | 类型     | 必填 | 说明           |
| ------- | -------- | ---- | -------------- |
| bizCode | `string` | 是   | 'default_avatar' |

**返回**

**GetDefaultAvatarListResponse**

获取默认头像列表的响应值。

| 类型      | 说明     |
| --------- | -------- |
| `Avatar[]` | 头像列表 |

**Avatar**

| 属性 | 类型     | 说明     |
| ---- | -------- | -------- |
| key  | `string` | 头像名   |
| path | `string` | 头像地址 |

**函数定义**

```typescript
function getDefaultAvatarList(params: GetDefaultAvatarListParams): Promise<GetDefaultAvatarListResponse>;
```
### 面板上传血压数据

`reportPanelBpgData`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { reportPanelBpgData } = health;
```

**参数**

**ReportPanelBpgDataParams**

面板上传血压数据的请求参数。

| 属性     | 类型       | 必填 | 说明     |
| -------- | ---------- | ---- | -------- |
| devId    | `string`   | 是   | 设备id   |
| userId   | `string`   | 是   | 用户id   |
| dataJson | `BpgData[]` | 是   | 血压数据 |

**BpgData**

| 属性    | 类型                          | 说明           |
| ------- | ----------------------------- | -------------- |
| dps     | `{ [key: number]: number \| boolean \| string }` | 血压相关数据   |
| dpsTime | `number`                      | dp 上报时间戳  |

**返回**

**ReportPanelBpgDataResponse**

面板上传血压数据的响应值。

| 属性     | 类型      | 说明           |
| -------- | --------- | -------------- |
| allocate | `boolean` | 是否已成功上传 |
| uuid     | `number`  | 血压数据id     |

**函数定义**

```typescript
function reportPanelBpgData(params: ReportPanelBpgDataParams): Promise<ReportPanelBpgDataResponse>;
```

### 手动上传血压数据

`reportSingleBpgData`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { reportSingleBpgData } = health;
```

**参数**

**ReportSingleBpgDataParams**

手动上传血压数据的请求参数。

| 属性     | 类型                    | 必填 | 说明     |
| -------- | ----------------------- | ---- | -------- |
| dataInfo | ReportSingleBpgDataInfo | 是   | 血压数据 |

**ReportSingleBpgDataInfo**

| 属性   | 类型     | 必填 | 说明     |
| ------ | -------- | ---- | -------- |
| devId  | `string` | 是   | 设备id   |
| userId | `string` | 是   | 用户id   |
| sys    | `number` | 是   | 收缩压   |
| dia    | `number` | 是   | 舒张压   |
| pulse  | `number` | 是   | 脉搏     |
| time   | `number` | 是   | 时间戳   |
| remark | `string` | 是   | 备注     |

**返回**

**ReportSingleBpgDataResponse**

手动上传血压数据的响应值。

| 属性     | 类型      | 说明           |
| -------- | --------- | -------------- |
| allocate | `boolean` | 是否已成功上传 |
| uuid     | `number`  | 血压数据id     |

**函数定义**

```typescript
function reportSingleBpgData(params: ReportSingleBpgDataParams): Promise<ReportSingleBpgDataResponse>;
```

### 更新血压数据备注

`updateBpgDataRemark`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { updateBpgDataRemark } = health;
```

**参数**

**UpdateBpgDataRemarkParams**

更新血压数据备注的请求参数。

| 属性   | 类型     | 必填 | 说明       |
| ------ | -------- | ---- | ---------- |
| remark | `string` | 是   | 备注       |
| uuid   | `string` | 是   | 血压数据id |

**返回**

**UpdateBpgDataRemarkResponse**

更新血压数据备注的响应值。

| 类型      | 说明         |
| --------- | ------------ |
| `boolean` | 是否调用成功 |

**函数定义**

```typescript
function updateBpgDataRemark(params: UpdateBpgDataRemarkParams): Promise<UpdateBpgDataRemarkResponse>;
```

### 删除血压数据

`deleteBpgData`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { deleteBpgData } = health;
```

**参数**

**DeleteBpgDataParams**

删除血压数据的请求参数。

| 属性   | 类型     | 必填 | 说明         |
| ------ | -------- | ---- | ------------ |
| userId | `string` | 是   | 用户id       |
| uuids  | `string` | 是   | 血压数据id   |

**返回**

**DeleteBpgDataResponse**

删除血压数据的响应值。

| 类型      | 说明         |
| --------- | ------------ |
| `boolean` | 是否调用成功 |

**函数定义**

```typescript
function deleteBpgData(params: DeleteBpgDataParams): Promise<DeleteBpgDataResponse>;
```

### 获取历史血压数据

`getBpgDataHistory`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getBpgDataHistory } = health;
```

**参数**

**GetBpgDataHistoryParams**

获取历史血压数据的请求参数。

| 属性        | 类型     | 必填 | 说明         |
| ----------- | -------- | ---- | ------------ |
| devId       | `string` | 是   | 设备id       |
| userId      | `string` | 是   | 用户id       |
| startTime   | `number` | 是   | 开始时间     |
| endTime     | `number` | 是   | 结束时间     |
| bpLevels    | `string` | 是   | 血压等级     |
| existRemark | `string` | 是   | 备注         |
| offset      | `number` | 是   | 页数         |
| limit       | `number` | 是   | 每页几条数据 |

**返回**

**GetBpgDataHistoryResponse**

获取历史血压数据的响应值。

| 属性       | 类型              | 说明           |
| ---------- | ----------------- | -------------- |
| datas      | `BpgHistoryData[]` | 血压数据列表   |
| hasNext    | `boolean`         | 是否有下一页   |
| totalCount | `number`          | 血压数据总数   |

**BpgHistoryData**

| 属性       | 类型                                                            | 说明                       |
| ---------- | --------------------------------------------------------------- | -------------------------- |
| arr        | `boolean`                                                       | 是否心率不齐               |
| bpLevel    | `'WHO_LV0' \| 'WHO_LV1' \| 'WHO_LV2' \| 'WHO_LV3' \| 'WHO_LV4' \| 'WHO_LV5'` | 血压等级                   |
| devId      | `string`                                                        | 设备id                     |
| dia        | `string`                                                        | 舒张压                     |
| pulse      | `string`                                                        | 脉搏                       |
| remark     | `string`                                                        | 备注                       |
| reportType | `1 \| 2`                                                         | 数据类型 1-面板上报 2-手动添加 |
| sys        | `string`                                                        | 收缩压                     |
| time       | `number`                                                        | 时间戳                     |
| userId     | `string`                                                        | 用户id                     |
| uuid       | `string`                                                        | 血压id                     |

**函数定义**

```typescript
function getBpgDataHistory(params: GetBpgDataHistoryParams): Promise<GetBpgDataHistoryResponse>;
```

### 获取最新一天血压统计数据

`getBpgDataTrendLatest`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getBpgDataTrendLatest } = health;
```

**参数**

**GetBpgDataTrendLatestParams**

获取最新一天血压统计数据的请求参数。

| 属性   | 类型     | 必填 | 说明   |
| ------ | -------- | ---- | ------ |
| devId  | `string` | 是   | 设备id |
| userId | `string` | 是   | 用户id |

**返回**

**GetBpgDataTrendLatestResponse**

获取最新一天血压统计数据的响应值。

| 属性          | 类型           | 说明       |
| ------------- | -------------- | ---------- |
| avgTotalDia   | `string`       | 平均舒张压 |
| avgTotalPulse | `string`       | 平均脉搏   |
| avgTotalSys   | `string`       | 平均收缩压 |
| list          | `BpgTrendData[]` | 趋势数据   |

**BpgTrendData**

| 属性     | 类型     | 说明     |
| -------- | -------- | -------- |
| avgDia   | `string` | 舒张压   |
| avgPulse | `string` | 脉搏     |
| avgSys   | `string` | 收缩压   |
| time     | `number` | 时间戳   |

**函数定义**

```typescript
function getBpgDataTrendLatest(params: GetBpgDataTrendLatestParams): Promise<GetBpgDataTrendLatestResponse>;
```

### 获取血压等级统计数据

`getBpgDataLevnum`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getBpgDataLevnum } = health;
```

**参数**

**GetBpgDataLevnumParams**

获取血压等级统计数据的请求参数。

| 属性      | 类型     | 必填 | 说明       |
| --------- | -------- | ---- | ---------- |
| devId     | `string` | 是   | 设备id     |
| userId    | `string` | 是   | 用户id     |
| startTime | `number` | 是   | 开始时间戳 |
| endTime   | `number` | 是   | 结束时间戳 |

**返回**

**GetBpgDataLevnumResponse**

获取血压等级统计数据的响应值。

| 属性      | 类型     | 说明             |
| --------- | -------- | ---------------- |
| lv0Num    | `number` | 理想血压数量     |
| lv0Ratio  | `number` | 理想血压占比     |
| lv1Num    | `number` | 正常血压数量     |
| lv1Ratio  | `number` | 正常血压占比     |
| lv2Num    | `number` | 正常高压数量     |
| lv2Ratio  | `number` | 正常高压占比     |
| lv3Num    | `number` | 轻度高血压数量   |
| lv3Ratio  | `number` | 轻度高血压占比   |
| lv4Num    | `number` | 中度高血压数量   |
| lv4Ratio  | `number` | 中度高血压占比   |
| lv5Num    | `number` | 高度高血压数量   |
| lv5Ratio  | `number` | 高度高血压占比   |
| totalNum  | `number` | 数据总条数       |
| userId    | `string` | 用户id           |

**函数定义**

```typescript
function getBpgDataLevnum(params: GetBpgDataLevnumParams): Promise<GetBpgDataLevnumResponse>;
```

### 获取血压数据统计信息

`getBpgDataTrend`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getBpgDataTrend } = health;
```

**参数**

**GetBpgDataTrendParams**

获取血压数据统计信息的请求参数。

| 属性      | 类型                    | 必填 | 说明       |
| --------- | ----------------------- | ---- | ---------- |
| dataType  | `'year' \| 'month' \| 'week'` | 是   | 数据类型   |
| devId     | `string`                | 是   | 设备id     |
| userId    | `string`                | 是   | 用户id     |
| startTime | `number`                | 是   | 开始时间戳 |
| endTime   | `number`                | 是   | 结束时间戳 |

**返回**

**GetBpgDataTrendResponse**

获取血压数据统计信息的响应值。

| 属性          | 类型           | 说明       |
| ------------- | -------------- | ---------- |
| avgTotalDia   | `string`       | 平均舒张压 |
| avgTotalPulse | `string`       | 平均脉搏   |
| avgTotalSys   | `string`       | 平均收缩压 |
| list          | `BpgTrendData[]` | 趋势数据   |

**函数定义**

```typescript
function getBpgDataTrend(params: GetBpgDataTrendParams): Promise<GetBpgDataTrendResponse>;
```

### 获取有血压数据的日期

`getBpgDataDays`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getBpgDataDays } = health;
```

**参数**

**GetBpgDataDaysParams**

获取有血压数据的日期的请求参数。

| 属性      | 类型     | 必填 | 说明       |
| --------- | -------- | ---- | ---------- |
| devId     | `string` | 是   | 设备id     |
| userId    | `string` | 是   | 用户id     |
| startTime | `number` | 是   | 开始时间戳 |
| endTime   | `number` | 是   | 结束时间戳 |

**返回**

**GetBpgDataDaysResponse**

获取有血压数据的日期的响应值。

| 类型       | 说明         |
| ---------- | ------------ |
| `number[]` | 日期时间戳   |

**函数定义**

```typescript
function getBpgDataDays(params: GetBpgDataDaysParams): Promise<GetBpgDataDaysResponse>;
```

### 获取未分配血压数据

`getBpgDataUnallocated`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { getBpgDataUnallocated } = health;
```

**参数**

**GetBpgDataUnallocatedParams**

获取未分配血压数据的请求参数。

| 属性   | 类型     | 必填 | 说明       |
| ------ | -------- | ---- | ---------- |
| devId  | `string` | 是   | 设备id     |
| limit  | `number` | 是   | 每页数量   |
| offset | `number` | 是   | 页码       |

**返回**

**GetBpgDataUnallocatedResponse**

获取未分配血压数据的响应值。

| 属性       | 类型              | 说明           |
| ---------- | ----------------- | -------------- |
| datas      | `BpgHistoryData[]` | 血压数据列表   |
| hasNext    | `boolean`         | 是否有下一页   |
| totalCount | `number`          | 血压数据总数   |

**函数定义**

```typescript
function getBpgDataUnallocated(params: GetBpgDataUnallocatedParams): Promise<GetBpgDataUnallocatedResponse>;
```

### 分配未分配血压数据

`updateBpgDataUnallocated`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { updateBpgDataUnallocated } = health;
```

**参数**

**UpdateBpgDataUnallocatedParams**

分配未分配血压数据的请求参数。

| 属性   | 类型     | 必填 | 说明                     |
| ------ | -------- | ---- | ------------------------ |
| userId | `string` | 是   | 用户id                   |
| uuids  | `string` | 是   | 血压数据id，用,分隔多个uuid |
| devId  | `string` | 是   | 设备id                   |

**返回**

**UpdateBpgDataUnallocatedResponse**

分配未分配血压数据的响应值。

| 类型      | 说明         |
| --------- | ------------ |
| `boolean` | 是否调用成功 |

**函数定义**

```typescript
function updateBpgDataUnallocated(params: UpdateBpgDataUnallocatedParams): Promise<UpdateBpgDataUnallocatedResponse>;
```

### 删除未分配血压数据

`deleteBpgDataUnallocated`

**引入**

> `@ray-js/ray^1.5.40` 且基础库版本 `2.23.0` 以上版本可使用

```js
import { health } from '@ray-js/ray';
const { deleteBpgDataUnallocated } = health;
```

**参数**

**DeleteBpgDataUnallocatedParams**

删除未分配血压数据的请求参数。

| 属性  | 类型     | 必填 | 说明                     |
| ----- | -------- | ---- | ------------------------ |
| uuids | `string` | 是   | 血压数据id，用,分隔多个uuid |

**返回**

**DeleteBpgDataUnallocatedResponse**

删除未分配血压数据的响应值。

| 类型      | 说明         |
| --------- | ------------ |
| `boolean` | 是否调用成功 |

**函数定义**

```typescript
function deleteBpgDataUnallocated(params: DeleteBpgDataUnallocatedParams): Promise<DeleteBpgDataUnallocatedResponse>;
```
