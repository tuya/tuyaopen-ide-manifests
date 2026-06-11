# 设备控制 (device-control)


## DP相关

#### updateDpName

 更新设备 DP 名称。

##### 引入

```js
import { updateDpName } from '@ray-js/ray';
```

##### 请求参数

| 参数  | 数据类型 | 说明          | 是否必填 |
| ----- | -------- | ------------- | -------- |
| devId | String   | 设备 ID       | 是       |
| dpId  | String   | DP ID         | 是       |
| name  | String   | DP 自定义名称 | 是       |

##### 返回参数

- **success**

> Boolean boolean

- **fail**

| 属性      | 类型   | 说明                                                          |
| --------- | ------ | ------------------------------------------------------------- |
| errorMsg  | `string` | 插件错误信息                                                  |
| errorCode | `string` | 错误码                                                        |
| innerError       | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

##### 请求示例

```javascript
import { updateDpName } from '@ray-js/ray';

updateDpName({
  devId: 'vdevo169477319679442',
  dpId: '21',
  name: 'work_mode',
})
  .then((res) => {
    console.log(res);
  })
  .catch(error => {
    console.log(error);
  });
```

##### 返回示例

```javascript
true
```
#### getDpsInfos

 获取设备所有 DP 信息，通常用于获取设备 DP 名称，配合 updateDpName 使用。

##### 引入
```js
import { getDpsInfos } from '@ray-js/ray';
```

<Alert type="warning">
返回的 dpInfo 中的 value 为原始数据，如 raw 类型的 DP，value 的值位 base64 编码字符串，需要开发者自行解析，非必需场景请使用 getDeviceInfo 接口获取设备信息。
</Alert>

##### 请求参数

| 参数  | 数据类型 | 说明    | 是否必填 |
| ----- | -------- | ------- | -------- |
| devId | String   | 设备 ID | 是       |
| gwId  | String   | 网关 ID, 直连设备值同 devId，子设备则传网关的设备id | 是       |

##### 返回结果

- **success**

> `Array<dpInfo>`

**dpInfo** 

| 参数  | 数据类型 | 说明            |
| ----- | -------- | --------------- |
| code  | String   | DP Code         |
| dpId  | Number   | DP ID           |
| value | String   | DP 值           |
| time  | Number   | DP 最近上报时间 |
| type  | String   | DP 类型         |
| name  | String   | DP 名称 |

**fail**

| 属性      | 类型   | 说明                                                          |
| --------- | ------ | ------------------------------------------------------------- |
| errorMsg  | `string` | 插件错误信息                                                  |
| errorCode | `string` | 错误码                                                        |
| innerError       | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

##### 请求示例

```javascript
import { getDpsInfos } from '@ray-js/ray';

getDpsInfos({
  devId: 'vdevo169477319679442',
  gwId: 'vdevo169477319679442',
})
  .then(res => {
    console.log(res);
  })
  .catch(error => {
    console.log(error);
  });
```

##### 返回示例

```javascript
[{
  "dpId": 1,
  "value": "false",
  "code": "switch_led",
  "type": "bool",
  "name": "开关",
  "time": 1695016796840
}, {
  "dpId": 2,
  "value": "white",
  "code": "work_mode",
  "type": "enum",
  "name": "",
  "time": 1695016736328
}, {
  "dpId": 3,
  "value": "327",
  "code": "bright_value",
  "type": "value",
  "name": "",
  "time": 1695005906565
}, {
  "dpId": 4,
  "value": "0",
  "code": "temp_value",
  "type": "value",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 5,
  "value": "002600000000",
  "code": "colour_data",
  "type": "string",
  "name": "",
  "time": 1695016233353
}, {
  "dpId": 6,
  "value": "",
  "code": "scene_data",
  "type": "string",
  "time": 1694773196845
}, {
  "dpId": 7,
  "value": "0",
  "code": "countdown",
  "type": "value",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 8,
  "value": "",
  "code": "music_data",
  "type": "string",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 30,
  "code": "rhythm_mode",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 31,
  "code": "sleep_mode",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 32,
  "code": "wakeup_mode",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 33,
  "code": "power_memory",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 34,
  "value": "false",
  "code": "do_not_disturb",
  "type": "bool",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 35,
  "code": "switch_gradient",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 37,
  "code": "rtc_timer",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 38,
  "code": "timer_report",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}, {
  "dpId": 210,
  "code": "random_timing",
  "type": "raw",
  "name": "",
  "time": 1694773196845
}]
```
#### device.publishDps

##### 功能描述

发送 dps

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishDps } = device
publishDps({ ... })
```

**原生小程序中使用**

```javascript
const { publishDps } = ty.device
publishDps({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                                     |
| --------- | -------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| deviceId  | string   |        | 是   | 设备 id                                                                                                                                                                                                                  |
| dps       | any      |        | 是   | dps                                                                                                                                                                                                                      |
| mode      | number   |        | 是   | 下发通道类型
0: 局域网
1: 网络
2: 自动                                                                                                                                                                       |
| pipelines | number[] |        | 是   | 下发通道的优先级
LAN = 0, // LAN
MQTT = 1, // MQTT
HTTP = 2, // Http
BLE = 3, // Single Point Bluetooth
SIGMesh = 4, // Sig Mesh
BLEMesh = 5, // Thing Private Mesh
BLEBeacon = 6, // Beacon |
| options   | any      |        | 是   | 预留下发逻辑配置标记，后续可以拓展，例如下发声音，下发操作后续动作等等                                                                                                                                                   |
| success   | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                   |
| fail      | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                   |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                         |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { publishDps, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishDps } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

publishDps({
  deviceId,
  dps: { 1: false },
  mode: 1,
  pipelines: [0, 1, 2, 3, 4, 5, 6],
  options: {},
  success: (res) => {
    console.log('publishDps success', res);
  },
  fail: (error) => {
    console.log('publishDps fail', error);
  }
});
```

###### 成功示例

```json
true
```

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 20001  | DeviceId is invalid |
| 20021  | Cannot find service |
| 20028  | Publish Dps error   |
#### device.publishSigMeshMultiDps

##### 功能描述

mesh 群组控制（仅用于单设备面板中的群控，如 PIR 传感器面板）

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishSigMeshMultiDps } = device
publishSigMeshMultiDps({ ... })
```

**原生小程序中使用**

```javascript
const { publishSigMeshMultiDps } = ty.device
publishSigMeshMultiDps({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | groupId 群组 id                                  |
| localId  | string   |        | 是   | localId 群组本地标识                             |
| dps      | any      |        | 是   | dp 信息
示例: dps: \{"1" : true\}            |
| pcc      | string   |        | 是   | pcc mesh 设备品类                                |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { publishSigMeshMultiDps, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishSigMeshMultiDps } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

publishSigMeshMultiDps({
  groupId,

  localId: 'localId',
  dps: {
    1: true
  },
  pcc: 'pcc',
  success: () => {
    console.log('publishSigMeshMultiDps success');
  },
  fail: (error) => {
    console.log('publishSigMeshMultiDps fail', error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 20064  | Group model is null               |
| 20080  | publish sigMesh multiDps error    |
#### device.publishCommands

##### 功能描述

发送 标准 dp

> 需引入`DeviceKit`，且在`>=2.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishCommands } = device
publishCommands({ ... })
```

**原生小程序中使用**

```javascript
const { publishCommands } = ty.device
publishCommands({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                                     |
| --------- | -------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| deviceId  | string   |        | 是   | 设备 id                                                                                                                                                                                                                  |
| dps       | any      |        | 是   | dps                                                                                                                                                                                                                      |
| mode      | number   |        | 是   | 下发通道类型
0: 局域网
1: 网络
2: 自动                                                                                                                                                                       |
| pipelines | number[] |        | 是   | 下发通道的优先级
LAN = 0, // LAN
MQTT = 1, // MQTT
HTTP = 2, // Http
BLE = 3, // Single Point Bluetooth
SIGMesh = 4, // Sig Mesh
BLEMesh = 5, // Thing Private Mesh
BLEBeacon = 6, // Beacon |
| options   | any      |        | 是   | 预留下发逻辑配置标记，后续可以拓展，例如下发声音，下发操作后续动作等等                                                                                                                                                   |
| success   | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                   |
| fail      | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                   |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                         |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { publishCommands, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishCommands } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

publishCommands({
  deviceId,
  dps: { switch_led: false },
  mode: 1,
  pipelines: [0, 1, 2, 3, 4, 5, 6],
  options: {},
  success: (res) => {
    console.log('publishCommands success', res);
  },
  fail: (error) => {
    console.log('publishCommands fail', error);
  }
});
```

###### 成功示例

```json
true
```
#### device.queryDps

##### 功能描述

查询 dps

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { queryDps } = device
queryDps({ ... })
```

**原生小程序中使用**

```javascript
const { queryDps } = ty.device
queryDps({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId  | string   |        | 是   | 设备 id                                          |
| dpIds     | number[] |        | 是   | dpids 数组                                       |
| queryType | number   |        | 否   | 查询类型 0
`最低版本4.1.10`                  |
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

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { queryDps, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { queryDps } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

queryDps({
  deviceId,
  dpIds: ['1', '2'],
  success: (res) => {
    console.log('queryDps success', res);
  },
  fail: (error) => {
    console.log('queryDps fail', error);
  }
});
```

###### 成功示例

```json
true
```
#### device.getDpDataByMesh

##### 功能描述

获取 mesh 子子设备的 dp 数据

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDpDataByMesh } = device
getDpDataByMesh({ ... })
```

**原生小程序中使用**

```javascript
const { getDpDataByMesh } = ty.device
getDpDataByMesh({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型 设备 id                                 |
| dpIds    | Object[] |        | 是   | dpId                                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getDpDataByMesh, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getDpDataByMesh } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getDpDataByMesh({
  deviceId,
  dpIds: [1],
  success: (info) => {
    console.log('getDpDataByMesh success', info);
  },
  fail: (error) => {
    console.log('getDpDataByMesh fail', error);
  }
});
```

###### 成功示例

```json
true
```
#### device.onDpDataChange

##### 功能描述

dp 点变更

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onDpDataChange } = device
onDpDataChange({ ... })
```

**原生小程序中使用**

```javascript
const { onDpDataChange } = ty.device
onDpDataChange({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
dp 点变更
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                      |
| -------- | ------ | ------ | ---- | --------------------------------------------------------- |
| deviceId | string |        | 是   | dps 对应的设备 id                                         |
| gwId     | string |        | 是   | 子设备对应的网关设备 id，可以根据此进行网关面板的状态刷新 |
| dps      | any    |        | 是   | dps
变化的数据                                        |
| dpsTime  | any    |        | 否   | dpsTime dp 变化的时间戳（可能为空）
`最低版本4.11.0`  |
| options  | any    |        | 是   | options
预留的标记位，后续可以区分来源等              |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onDpDataChange,
  getLaunchOptionsSync,
  registerDeviceListListener
} from '@ray-js/ray';
// 原生调用方式
const { onDpDataChange, registerDeviceListListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onDpDataChange = (event) => {
  console.log(event);
};

registerDeviceListListener({
  deviceIdList: [deviceId],
  success: () => {
    console.log('registerDeviceListListener success');
  },
  fail: (error) => {
    console.log('registerDeviceListListener fail', error);
  }
});
onDpDataChange(_onDpDataChange);
```

###### 成功示例

```json
{
  "dpsTime": {
    "20": 1732243243000
  },
  "gwId": "device_id",
  "dps": {
    "20": true
  },
  "deviceId": "device_id"
}
```

##### 常见问题

###### Q：为什么调用了 onDpDataChange 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
#### device.offDpDataChange

##### 功能描述

移除监听：dp 点变更

> 需引入`DeviceKit`，且在`>=1.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offDpDataChange } = device
offDpDataChange({ ... })
```

**原生小程序中使用**

```javascript
const { offDpDataChange } = ty.device
offDpDataChange({ ... })
```

##### 参数

**function listener**

onDpDataChange 传入的监听函数。不传此参数则移除所有监听函数。

## 低功耗设备指令缓存

#### isLowPowerEnabled

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/) 开发设置 - 云能力 进行授权配置。

##### 描述

查询设备的低功耗模式是否开启。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 是 | 设备 ID |
| `code` | `string` | 否 | 高级能力 code，默认 tyabi8xqnc |

##### 返回值

类型: `Promise<IsLowPowerEnabledResult>`

isEnable 是否开启对应高级能力

###### IsLowPowerEnabledResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isEnable` | `boolean` | 是 | 是否开启对应高级能力 |

##### 示例代码

###### 请求示例

```typescript
import { isLowPowerEnabled } from '@tuya-miniapp/cloud-api';

const result = await isLowPowerEnabled({
  deviceId: 'your_device_id',
});

const result2 = await isLowPowerEnabled({
  deviceId: 'your_device_id',
  code: 'custom_code',
});
```

###### 返回示例

```json
{
  "isEnable": true
}
```
#### addCommandToCache

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/) 开发设置 - 云能力 进行授权配置。

##### 描述

将指令（DP 键值对的 JSON 字符串）添加到云端缓存，以便后续下发给指定设备。支持 Wi-Fi、ZigBee 设备。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |
| `dps` | `string` | 是 | DP 键值对的 JSON 字符串 |
| `time` | `number` | 是 | 指令下发时的时间戳，单位：毫秒 |

##### 返回值

类型: `Promise<boolean>`

操作结果，true 表示成功；文档「返回参数」表记为 result（boolean）

##### 示例代码

###### 请求示例

```typescript
import { addCommandToCache } from '@tuya-miniapp/cloud-api';

const result = await addCommandToCache({
  devId: 'your_device_id',
  dps: JSON.stringify({
    switch_1: true,
  }),
  time: Date.now(),
});
```

###### 返回示例

```javascript
true;
```
#### getCommandCache

> [VERSION] @tuya-miniapp/cloud-api >= 1.0.5

> 💡 接口依赖云能力，需在 [小程序开发者平台](https://platform.tuya.com/miniapp/) 开发设置 - 云能力 进行授权配置。

##### 描述

查询指定设备在云端缓存的待下发指令（DP 点集合）。支持 Wi-Fi、ZigBee 设备。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | 设备 ID |

##### 返回值

类型: `Promise<CommandCache[]>`

CommandCache 数组；元素字段见该类型注释

##### 示例代码

###### 请求示例

```typescript
import { getCommandCache } from '@tuya-miniapp/cloud-api';

const result = await getCommandCache({
  devId: 'your_device_id',
});
```

###### 返回示例

```javascript
[
  {
    dps: {
      switch_1: true,
    },
    pushStatus: false,
  },
  {
    dps: {
      switch_2: true,
    },
    pushStatus: true,
  },
];
```
