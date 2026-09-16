# 蓝牙设备 (bluetooth)


## 单点蓝牙

#### device.connectBluetoothDevice

##### 功能描述

蓝牙连接
聚合接口, 支持 ble, 双模中 ble, beacon, mesh, mesh 单火类连接

> 需引入`DeviceKit`，且在`>=3.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { connectBluetoothDevice } = device
connectBluetoothDevice({ ... })
```

**原生小程序中使用**

```javascript
const { connectBluetoothDevice } = ty.device
connectBluetoothDevice({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性          | 类型     | 默认值  | 必填 | 说明                                                                                                                                                                                                                                            |
| ------------- | -------- | ------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devId         | string   |         | 是   | 设备 ID                                                                                                                                                                                                                                         |
| timeoutMillis | number   | `15000` | 否   | 连接超时时限
单位: 毫秒                                                                                                                                                                                                                     |
| souceType     | number   | `0`     | 否   | 来源类型
如果是面板进来的自动连接, 输入 1; 否则默认 0, 为主动连接                                                                                                                                                                           |
| connectType   | number   | `0`     | 否   | 蓝牙连接方式,默认 0
0 : 网关和 app 都需要，默认值，本地和网关两个途径任何一个可用均可生效
1 : 仅 app，只会判定本地是否在线，以及本地连接是否成功
2 : 仅网关连接，只会判定网关是否在线，以及坚持网关连接是否成功
`最低版本3.1.2` |
| success       | function |         | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                          |
| fail          | function |         | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                          |
| complete      | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                |

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
import { connectBluetoothDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { connectBluetoothDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

connectBluetoothDevice({
  deviceId,
  timeoutMillis: 15000,
  souceType: 0,
  connectType: 0,
  success: () => {
    console.log('connectBluetoothDevice success');
  },
  fail: (error) => {
    console.log('connectBluetoothDevice fail', error);
  }
});
```
#### device.disconnectBluetoothDevice

##### 功能描述

蓝牙断开连接
聚合接口, 支持 ble, 双模中的 ble, mesh 单火类以及 mesh 连接断开. beacon 设备调用无效

> 需引入`DeviceKit`，且在`>=3.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { disconnectBluetoothDevice } = device
disconnectBluetoothDevice({ ... })
```

**原生小程序中使用**

```javascript
const { disconnectBluetoothDevice } = ty.device
disconnectBluetoothDevice({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                                                            |
| ----------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devId       | string   |        | 是   | 设备 ID                                                                                                                                                                                                                                         |
| connectType | number   | `0`    | 否   | 蓝牙连接方式,默认 0
0 : 网关和 app 都需要，默认值，本地和网关两个途径任何一个可用均可生效
1 : 仅 app，只会判定本地是否在线，以及本地连接是否成功
2 : 仅网关连接，只会判定网关是否在线，以及坚持网关连接是否成功
`最低版本3.1.2` |
| success     | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                          |
| fail        | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                          |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                |

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
import { disconnectBluetoothDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { disconnectBluetoothDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

disconnectBluetoothDevice({
  deviceId,
  connectType: 0,
  success: () => {
    console.log('disconnectBluetoothDevice success');
  },
  fail: (error) => {
    console.log('disconnectBluetoothDevice fail', error);
  }
});
```
#### device.bluetoothCapabilityIsSupport

##### 功能描述

蓝牙设备是否支持某个能力
capability 不同值对应查询的具体能力值
0：OTA 时 DP 是否可控
1：网关和 App 对于该设备是否使用低功耗在线逻辑
2：是否具备 Beacon 能力
3：是否有蓝牙 LINK 层加密使能
4：是否支持扩展模块
5：是否支持定时
6：是否支持蓝牙 BT/BLE 双模
7：是否需要强制 LINK 层加密

> 需引入`DeviceKit`，且在`>=2.2.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { bluetoothCapabilityIsSupport } = device
bluetoothCapabilityIsSupport({ ... })
```

**原生小程序中使用**

```javascript
const { bluetoothCapabilityIsSupport } = ty.device
bluetoothCapabilityIsSupport({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性       | 类型     | 默认值 | 必填 | 说明                                             |
| ---------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId   | string   |        | 是   | 设备 Id                                          |
| capability | number   |        | 是   | 能力值标位
5：定时                           |
| success    | function |        | 否   | 接口调用成功的回调函数                           |
| fail       | function |        | 否   | 接口调用失败的回调函数                           |
| complete   | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性      | 类型    | 说明                                                  |
| --------- | ------- | ----------------------------------------------------- |
| isSupport | boolean | 是否支持蓝牙相关能力的结果回调
isSupport 是否支持 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  bluetoothCapabilityIsSupport,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { bluetoothCapabilityIsSupport } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

bluetoothCapabilityIsSupport({
  deviceId,
  capability: 5,
  success: (res) => {
    console.log('bluetoothCapabilityIsSupport success', res);
  },
  fail: (error) => {
    console.log('bluetoothCapabilityIsSupport fail', error);
  }
});
```

###### 成功示例

```json
{
  "isSupport": true
}
```
#### device.bluetoothIsPowerOn

##### 功能描述

判断手机蓝牙是否打开

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { bluetoothIsPowerOn } = device
bluetoothIsPowerOn({ ... })
```

**原生小程序中使用**

```javascript
const { bluetoothIsPowerOn } = ty.device
bluetoothIsPowerOn({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
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
import { bluetoothIsPowerOn } from '@ray-js/ray';
// 原生调用方式
const { bluetoothIsPowerOn } = ty.device;

bluetoothIsPowerOn({
  success: (res) => {
    console.log('bluetoothIsPowerOn success', res);
  },
  fail: (error) => {
    console.log('bluetoothIsPowerOn fail', error);
  }
});
```

###### 成功示例

```json
true
```
#### device.cancelBLEFileTransfer

##### 功能描述

取消文件传输到蓝牙设备 仅 IOS 支持

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { cancelBLEFileTransfer } = device
cancelBLEFileTransfer({ ... })
```

**原生小程序中使用**

```javascript
const { cancelBLEFileTransfer } = ty.device
cancelBLEFileTransfer({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性           | 类型     | 默认值 | 必填 | 说明                                             |
| -------------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId       | string   |        | 是   | 设备模型 设备 id                                 |
| fileId         | number   |        | 是   | 文件 id                                          |
| fileIdentifier | string   |        | 是   | 文件标识符                                       |
| fileVersion    | number   |        | 是   | 文件版本                                         |
| filePath       | string   |        | 是   | 文件地址                                         |
| success        | function |        | 否   | 接口调用成功的回调函数                           |
| fail           | function |        | 否   | 接口调用失败的回调函数                           |
| complete       | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

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
import { cancelBLEFileTransfer, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { cancelBLEFileTransfer } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

cancelBLEFileTransfer({
  deviceId: deviceId,
  fileId: 1,
  fileIdentifier: 'xxxxxxxx',
  fileVersion: 1,
  filePath: 'file:///xxxx',
  success: (result) => {
    console.log('cancelBLEFileTransfer success');
  },
  fail: (error) => {
    console.log('cancelBLEFileTransfer fail', error);
  }
});
```
#### device.connectBLEDevice

##### 功能描述

连接 BLE(thing)设备，该方法只执行连接动作，连接状态通过【onBLEConnectStatusChange】事件获取

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { connectBLEDevice } = device
connectBLEDevice({ ... })
```

**原生小程序中使用**

```javascript
const { connectBLEDevice } = ty.device
connectBLEDevice({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
import { connectBLEDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { connectBLEDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

connectBLEDevice({
  deviceId,
  success: () => {
    console.log('connectBLEDevice success');
  },
  fail: (error) => {
    console.log('connectBLEDevice fail', error);
  }
});
```
#### device.directConnectBLEDevice

##### 功能描述

直连 BLE(thing)设备，该方法只执行连接动作，连接状态通过【onBLEConnectStatusChange】事件获取

> 需引入`DeviceKit`，且在`>=2.1.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { directConnectBLEDevice } = device
directConnectBLEDevice({ ... })
```

**原生小程序中使用**

```javascript
const { directConnectBLEDevice } = ty.device
directConnectBLEDevice({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
import { directConnectBLEDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { directConnectBLEDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

directConnectBLEDevice({
  deviceId,
  success: () => {
    console.log('directConnectBLEDevice success');
  },
  fail: (error) => {
    console.log('directConnectBLEDevice fail', error);
  }
});
```
#### device.disconnectBLEDevice

##### 功能描述

断开 BLE(thing)设备

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { disconnectBLEDevice } = device
disconnectBLEDevice({ ... })
```

**原生小程序中使用**

```javascript
const { disconnectBLEDevice } = ty.device
disconnectBLEDevice({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
import { disconnectBLEDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { disconnectBLEDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

disconnectBLEDevice({
  deviceId,
  success: () => {
    console.log('disconnectBLEDevice success');
  },
  fail: (error) => {
    console.log('disconnectBLEDevice fail', error);
  }
});
```
#### device.getBLEDeviceRSSI

##### 功能描述

获取 BLE 外设的信号

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getBLEDeviceRSSI } = device
getBLEDeviceRSSI({ ... })
```

**原生小程序中使用**

```javascript
const { getBLEDeviceRSSI } = ty.device
getBLEDeviceRSSI({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性   | 类型   | 说明                                   |
| ------ | ------ | -------------------------------------- |
| signal | number | 设备信号
signal 若为 0，则获取失败 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getBLEDeviceRSSI, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getBLEDeviceRSSI } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getBLEDeviceRSSI({
  deviceId,
  success: (res) => {
    console.log('getBLEDeviceRSSI success', res);
  },
  fail: (error) => {
    console.log('getBLEDeviceRSSI fail', error);
  }
});
```

###### 成功示例

```json
{
  "signal": 55
}
```
#### device.getBLEOnlineState

##### 功能描述

查询 BLE(thing)本地在线状态

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getBLEOnlineState } = device
getBLEOnlineState({ ... })
```

**原生小程序中使用**

```javascript
const { getBLEOnlineState } = ty.device
getBLEOnlineState({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性     | 类型    | 说明                                                |
| -------- | ------- | --------------------------------------------------- |
| isOnline | boolean | 蓝牙在线状态的回调 boolean 值
isOnline 是否在线 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getBLEOnlineState, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getBLEOnlineState } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getBLEOnlineState({
  deviceId,
  success: (res) => {
    console.log('getBLEOnlineState success', res);
  },
  fail: (error) => {
    console.log('getBLEOnlineState fail', error);
  }
});
```

###### 成功示例

```json
{
  "isOnline": false
}
```
#### device.offBLEBigDataChannelDeviceToAppSuccess

##### 功能描述

移除监听：大数据从设备传输到 App 成功的事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offBLEBigDataChannelDeviceToAppSuccess } = device
offBLEBigDataChannelDeviceToAppSuccess({ ... })
```

**原生小程序中使用**

```javascript
const { offBLEBigDataChannelDeviceToAppSuccess } = ty.device
offBLEBigDataChannelDeviceToAppSuccess({ ... })
```

##### 参数

**function listener**

onBLEBigDataChannelDeviceToAppSuccess 传入的监听函数。不传此参数则移除所有监听函数。
#### device.offBLEBigDataChannelProgressEvent

##### 功能描述

移除监听：BLE(thing)大数据通道传输进度

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offBLEBigDataChannelProgressEvent } = device
offBLEBigDataChannelProgressEvent({ ... })
```

**原生小程序中使用**

```javascript
const { offBLEBigDataChannelProgressEvent } = ty.device
offBLEBigDataChannelProgressEvent({ ... })
```

##### 参数

**function listener**

onBLEBigDataChannelProgressEvent 传入的监听函数。不传此参数则移除所有监听函数。
#### device.offBLEBigDataChannelUploadCloudProgress

##### 功能描述

移除监听：大数据上传到云端进度的事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offBLEBigDataChannelUploadCloudProgress } = device
offBLEBigDataChannelUploadCloudProgress({ ... })
```

**原生小程序中使用**

```javascript
const { offBLEBigDataChannelUploadCloudProgress } = ty.device
offBLEBigDataChannelUploadCloudProgress({ ... })
```

##### 参数

**function listener**

onBLEBigDataChannelUploadCloudProgress 传入的监听函数。不传此参数则移除所有监听函数。
#### device.offBLEConnectStatusChange

##### 功能描述

移除监听：BLE(thing)连接状态变更通知事件

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offBLEConnectStatusChange } = device
offBLEConnectStatusChange({ ... })
```

**原生小程序中使用**

```javascript
const { offBLEConnectStatusChange } = ty.device
offBLEConnectStatusChange({ ... })
```

##### 参数

**function listener**

onBLEConnectStatusChange 传入的监听函数。不传此参数则移除所有监听函数。
#### device.offBLEScanBindDevice

##### 功能描述

移除监听：扫描到设备后进行通知

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offBLEScanBindDevice } = device
offBLEScanBindDevice({ ... })
```

**原生小程序中使用**

```javascript
const { offBLEScanBindDevice } = ty.device
offBLEScanBindDevice({ ... })
```

##### 参数

**function listener**

onBLEScanBindDevice 传入的监听函数。不传此参数则移除所有监听函数。
#### device.offBLETransparentDataReport

##### 功能描述

移除监听：BLE(thing)设备数据透传通道上报通知

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offBLETransparentDataReport } = device
offBLETransparentDataReport({ ... })
```

**原生小程序中使用**

```javascript
const { offBLETransparentDataReport } = ty.device
offBLETransparentDataReport({ ... })
```

##### 参数

**function listener**

onBLETransparentDataReport 传入的监听函数。不传此参数则移除所有监听函数。
#### device.onBLEBigDataChannelDeviceToAppSuccess

##### 功能描述

大数据从设备传输到 App 成功的事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onBLEBigDataChannelDeviceToAppSuccess } = device
onBLEBigDataChannelDeviceToAppSuccess({ ... })
```

**原生小程序中使用**

```javascript
const { onBLEBigDataChannelDeviceToAppSuccess } = ty.device
onBLEBigDataChannelDeviceToAppSuccess({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
大数据从设备传输到 App 成功的事件
**参数**

| 属性 | 类型                    | 默认值 | 必填 | 说明 |
| ---- | ----------------------- | ------ | ---- | ---- |
| data | BLEBigDataChannelData[] |        | 是   | data |

##### 引用对象

**BLEBigDataChannelData**

| 属性    | 类型   | 默认值 | 必填 | 说明    |
| ------- | ------ | ------ | ---- | ------- |
| dpsTime | string |        | 是   | dpsTime |
| dps     | any    |        | 是   | dps     |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { onBLEBigDataChannelDeviceToAppSuccess } from '@ray-js/ray';
// 原生调用方式
const { onBLEBigDataChannelDeviceToAppSuccess } = ty.device;

const _onBLEBigDataChannelDeviceToAppSuccess = (event) => {
  console.log(event);
};

onBLEBigDataChannelDeviceToAppSuccess(_onBLEBigDataChannelDeviceToAppSuccess);
```

###### 成功示例

```json
[
  {
    "dpsTime": 1234567890,
    "dps": {
      "1": true
    }
  }
]
```
#### device.onBLEBigDataChannelProgressEvent

##### 功能描述

BLE(thing)大数据通道传输进度

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onBLEBigDataChannelProgressEvent } = device
onBLEBigDataChannelProgressEvent({ ... })
```

**原生小程序中使用**

```javascript
const { onBLEBigDataChannelProgressEvent } = ty.device
onBLEBigDataChannelProgressEvent({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
BLE(thing)大数据通道传输进度
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                    |
| -------- | ------ | ------ | ---- | --------------------------------------- |
| deviceId | string |        | 是   | 大数据通道传输进度
deviceId 设备 id |
| progress | number |        | 是   | progress 传输进度，范围: 0 - 100        |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { onBLEBigDataChannelProgressEvent } from '@ray-js/ray';
// 原生调用方式
const { onBLEBigDataChannelProgressEvent } = ty.device;

const _onBLEBigDataChannelProgressEvent = (event) => {
  console.log(event);
};

onBLEBigDataChannelProgressEvent(_onBLEBigDataChannelProgressEvent);
```

###### 成功示例

```json
{
  "deviceId": "device_id",
  "progress": 10
}
```
#### device.onBLEBigDataChannelUploadCloudProgress

##### 功能描述

大数据上传到云端进度的事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onBLEBigDataChannelUploadCloudProgress } = device
onBLEBigDataChannelUploadCloudProgress({ ... })
```

**原生小程序中使用**

```javascript
const { onBLEBigDataChannelUploadCloudProgress } = ty.device
onBLEBigDataChannelUploadCloudProgress({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
大数据上传到云端进度的事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                    |
| -------- | ------ | ------ | ---- | --------------------------------------- |
| deviceId | string |        | 是   | 大数据通道传输进度
deviceId 设备 id |
| progress | number |        | 是   | progress 传输进度，范围: 0 - 100        |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { onBLEBigDataChannelUploadCloudProgress } from '@ray-js/ray';
// 原生调用方式
const { onBLEBigDataChannelUploadCloudProgress } = ty.device;

const _onBLEBigDataChannelUploadCloudProgress = (event) => {
  console.log(event);
};

onBLEBigDataChannelUploadCloudProgress(_onBLEBigDataChannelUploadCloudProgress);
```

###### 成功示例

```json
{
  "deviceId": "xxx",
  "progress": 99
}
```
#### device.onBLEConnectStatusChange

##### 功能描述

BLE(thing)连接状态变更通知事件

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onBLEConnectStatusChange } = device
onBLEConnectStatusChange({ ... })
```

**原生小程序中使用**

```javascript
const { onBLEConnectStatusChange } = ty.device
onBLEConnectStatusChange({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
BLE(thing)连接状态变更通知事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                                                   |
| -------- | ------ | ------ | ---- | -------------------------------------------------------------------------------------- |
| deviceId | string |        | 是   | BLE（thing）连接状态
deviceId: 设备 id                                             |
| status   | string |        | 是   | status 状态值
 CONNECTED:已连接
 CONNECTING:连接中
 CONNECT_BREAK:连接失败 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onBLEConnectStatusChange,
  getLaunchOptionsSync,
  subscribeBLEConnectStatus
} from '@ray-js/ray';
// 原生调用方式
const { onBLEConnectStatusChange, subscribeBLEConnectStatus } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onBLEConnectStatusChange = (event) => {
  console.log(event);
};

subscribeBLEConnectStatus({
  deviceId,
  success: (res) => {
    console.log('subscribeBLEConnectStatus success', res);
  },
  fail: (error) => {
    console.log('subscribeBLEConnectStatus fail', error);
  }
});
onBLEConnectStatusChange(_onBLEConnectStatusChange);
```

###### 成功示例

```json
{
  "deviceId": "device_id",
  "status": "CONNECTED"
}
```
#### device.onBLEScanBindDevice

##### 功能描述

扫描到设备后进行通知

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onBLEScanBindDevice } = device
onBLEScanBindDevice({ ... })
```

**原生小程序中使用**

```javascript
const { onBLEScanBindDevice } = ty.device
onBLEScanBindDevice({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
扫描到设备后进行通知
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明            |
| -------- | ------ | ------ | ---- | --------------- |
| deviceId | string |        | 是   | 扫描到的设备 ID |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { onBLEScanBindDevice } from '@ray-js/ray';
// 原生调用方式
const { onBLEScanBindDevice } = ty.device;

const _onBLEScanBindDevice = (event) => {
  console.log(event);
};

onBLEScanBindDevice(_onBLEScanBindDevice);
```

###### 成功示例

```json
"deviceId"
```
#### device.onBLETransparentDataReport

##### 功能描述

BLE(thing)设备数据透传通道上报通知

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onBLETransparentDataReport } = device
onBLETransparentDataReport({ ... })
```

**原生小程序中使用**

```javascript
const { onBLETransparentDataReport } = ty.device
onBLETransparentDataReport({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
BLE(thing)设备数据透传通道上报通知
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                               |
| -------- | ------ | ------ | ---- | ---------------------------------- |
| deviceId | string |        | 是   | 蓝牙透传数据
deviceId: 设备 id |
| data     | string |        | 是   | data: 透传内容                     |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onBLETransparentDataReport,
  getLaunchOptionsSync,
  subscribeBLETransparentDataReport
} from '@ray-js/ray';
// 原生调用方式
const { onBLETransparentDataReport, subscribeBLETransparentDataReport } =
  ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onBLETransparentDataReport = (event) => {
  console.log(event);
};

subscribeBLETransparentDataReport({
  deviceId,
  success: () => {
    console.log('subscribeBLETransparentDataReport success');
  },
  fail: (error) => {
    console.log('subscribeBLETransparentDataReport fail', error);
  }
});
onBLETransparentDataReport(_onBLETransparentDataReport);
```

###### 成功示例

```json
{
  "deviceId": "device_id",
  "data": "data"
}
```
#### device.postBLEBigDataChannelWithProgress

##### 功能描述

大数据通道操作，支持进度反馈。不同的反馈通过以下事件返回给前端

1. 大数据从设备传输到 App 成功通过【onBLEBigDataChannelDeviceToAppSuccess】事件获取
2. 大数据上传到云端进度通过【onBLEBigDataChannelUploadCloudProgress】事件获取
3. BLE 数据通道传输进度通过【onBLEBigDataChannelProgressEvent】事件获取

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { postBLEBigDataChannelWithProgress } = device
postBLEBigDataChannelWithProgress({ ... })
```

**原生小程序中使用**

```javascript
const { postBLEBigDataChannelWithProgress } = ty.device
postBLEBigDataChannelWithProgress({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性          | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                   |
| ------------- | -------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| deviceId      | string   |        | 是   | deviceId 设备 id                                                                                                                                                                                       |
| requestParams | any      |        | 是   | 建立数据传输所需相关参数
command：通道操作的具体指令；start/stop：开启/关闭大数据通道；type：要上传的数据类型
requestParams 通道指令集
\{
 "command": "start",
 "type": "1"
\} |
| success       | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                 |
| fail          | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                 |
| complete      | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                       |

##### 返回结果

**success**

| 属性         | 类型   | 说明                                                                           |
| ------------ | ------ | ------------------------------------------------------------------------------ |
| deviceId     | string | deviceId 设备 id                                                               |
| resultParams | any    | 数据传输完毕相关参数（type dps fileUrl）
resultParams 数据传输完毕相关参数 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  postBLEBigDataChannelWithProgress,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { postBLEBigDataChannelWithProgress } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

postBLEBigDataChannelWithProgress({
  deviceId,
  requestParams: { command: 'start', type: '1' },
  success: (res) => {
    console.log('postBLEBigDataChannelWithProgress success', res);
  },
  fail: (error) => {
    console.log('postBLEBigDataChannelWithProgress fail', error);
  }
});
```

###### 成功示例

```json
{
  "deviceId": "xxx",
  "resultParams": {
    "type": "1",
    "fileUrl": "/path/to/file",
    "dps": { "1": true }
  }
}
```
#### device.postBLEFileTransfer

##### 功能描述

传输文件到蓝牙设备

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { postBLEFileTransfer } = device
postBLEFileTransfer({ ... })
```

**原生小程序中使用**

```javascript
const { postBLEFileTransfer } = ty.device
postBLEFileTransfer({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性           | 类型     | 默认值 | 必填 | 说明                                             |
| -------------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId       | string   |        | 是   | 设备模型 设备 id                                 |
| fileId         | number   |        | 是   | 文件 id                                          |
| fileIdentifier | string   |        | 是   | 文件标识符                                       |
| fileVersion    | number   |        | 是   | 文件版本                                         |
| filePath       | string   |        | 是   | 文件地址                                         |
| success        | function |        | 否   | 接口调用成功的回调函数                           |
| fail           | function |        | 否   | 接口调用失败的回调函数                           |
| complete       | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性   | 类型    | 说明                         |
| ------ | ------- | ---------------------------- |
| result | boolean | true/false 传输成功/传输失败 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { postBLEFileTransfer, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { postBLEFileTransfer } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

postBLEFileTransfer({
  deviceId: deviceId,
  fileId: 1,
  fileIdentifier: 'xxxxxxxx',
  fileVersion: 1,
  filePath: 'file:///xxxx',
  success: (result) => {
    console.log('postBLEFileTransfer result', result);
  },
  fail: (error) => {
    console.log('postBLEFileTransfer fail', error);
  }
});
```

###### 成功示例

```json
true
```
#### device.publishBLETransparentData

##### 功能描述

BLE(thing)下发透传数据

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishBLETransparentData } = device
publishBLETransparentData({ ... })
```

**原生小程序中使用**

```javascript
const { publishBLETransparentData } = ty.device
publishBLETransparentData({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 蓝牙透传数据
deviceId: 设备 id               |
| data     | string   |        | 是   | data: 透传内容                                   |
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
import { publishBLETransparentData, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishBLETransparentData } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

publishBLETransparentData({
  deviceId,
  data: 'data',
  success: () => {
    console.log('publishBLETransparentData success');
  },
  fail: (error) => {
    console.log('publishBLETransparentData fail', error);
  }
});
```
#### device.startBLEScanBindDevice

##### 功能描述

在指定时间内扫描已配网的设备，扫描结果通过【onBLEScanBindDevice】事件获取

> 需引入`DeviceKit`，且在`>=2.1.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { startBLEScanBindDevice } = device
startBLEScanBindDevice({ ... })
```

**原生小程序中使用**

```javascript
const { startBLEScanBindDevice } = ty.device
startBLEScanBindDevice({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                       |
| -------- | -------- | ------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| interval | number   |        | 是   | 间隔扫描时间。如果\<0，则返回错误                                                                                                                                          |
| scanType | string   |        | 是   | 扫描类型
SINGLE -\> "SINGLE"
SINGLE_QR -\> "SINGLE_QR"
MESH -\> "MESH"
SIG_MESH -\> "SIG_MESH"
NORMAL -\> "NORMAL"
Thing_BEACON -\> "Thing_BEACON" |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                     |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                     |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                           |

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
import { startBLEScanBindDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { startBLEScanBindDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

startBLEScanBindDevice({
  interval: 10000,
  scanType: 'SINGLE', // SINGLE SINGLE_QR MESH SIG_MESH NORMAL Thing_BEACON
  success: () => {
    console.log('startBLEScanBindDevice success');
  },
  fail: (error) => {
    console.log('startBLEScanBindDevice fail', error);
  }
});
```
#### device.subscribeBLEConnectStatus

##### 功能描述

开始监听 BLE(thing)连接状态

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { subscribeBLEConnectStatus } = device
subscribeBLEConnectStatus({ ... })
```

**原生小程序中使用**

```javascript
const { subscribeBLEConnectStatus } = ty.device
subscribeBLEConnectStatus({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
// Ray调用方式
import { subscribeBLEConnectStatus, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { subscribeBLEConnectStatus } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

subscribeBLEConnectStatus({
  deviceId,
  success: () => {
    console.log('subscribeBLEConnectStatus success');
  },
  fail: (error) => {
    console.log('subscribeBLEConnectStatus fail', error);
  }
});
```
#### device.subscribeBLETransparentDataReport

##### 功能描述

开始监听 BLE(thing)设备数据透传通道上报，上报情况通过【onBLETransparentDataReport】事件获取

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { subscribeBLETransparentDataReport } = device
subscribeBLETransparentDataReport({ ... })
```

**原生小程序中使用**

```javascript
const { subscribeBLETransparentDataReport } = ty.device
subscribeBLETransparentDataReport({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
// Ray调用方式
import {
  subscribeBLETransparentDataReport,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { subscribeBLETransparentDataReport } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

subscribeBLETransparentDataReport({
  deviceId,
  success: () => {
    console.log('subscribeBLETransparentDataReport success');
  },
  fail: (error) => {
    console.log('subscribeBLETransparentDataReport fail', error);
  }
});
```
#### device.unsubscribeBLEConnectStatus

##### 功能描述

停止监听 BLE(thing)连接状态

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unsubscribeBLEConnectStatus } = device
unsubscribeBLEConnectStatus({ ... })
```

**原生小程序中使用**

```javascript
const { unsubscribeBLEConnectStatus } = ty.device
unsubscribeBLEConnectStatus({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
// Ray调用方式
import { unsubscribeBLEConnectStatus, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { unsubscribeBLEConnectStatus } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

unsubscribeBLEConnectStatus({
  deviceId,
  success: () => {
    console.log('unsubscribeBLEConnectStatus success');
  },
  fail: (error) => {
    console.log('unsubscribeBLEConnectStatus fail', error);
  }
});
```
#### device.unsubscribeBLETransparentDataReport

##### 功能描述

停止监听 BLE(thing)设备数据透传通道上报

> 需引入`DeviceKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unsubscribeBLETransparentDataReport } = device
unsubscribeBLETransparentDataReport({ ... })
```

**原生小程序中使用**

```javascript
const { unsubscribeBLETransparentDataReport } = ty.device
unsubscribeBLETransparentDataReport({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
// Ray调用方式
import {
  unsubscribeBLETransparentDataReport,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { unsubscribeBLETransparentDataReport } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

unsubscribeBLETransparentDataReport({
  deviceId,
  success: () => {
    console.log('unsubscribeBLETransparentDataReport success');
  },
  fail: (error) => {
    console.log('unsubscribeBLETransparentDataReport fail', error);
  }
});
```
#### device.offFileTransferProgress

##### 功能描述

移除监听：传输文件的到蓝牙设备的进度事件

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offFileTransferProgress } = device
offFileTransferProgress({ ... })
```

**原生小程序中使用**

```javascript
const { offFileTransferProgress } = ty.device
offFileTransferProgress({ ... })
```

##### 参数

**function listener**

onFileTransferProgress 传入的监听函数。不传此参数则移除所有监听函数。
#### device.onFileTransferProgress

##### 功能描述

传输文件的到蓝牙设备的进度事件

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onFileTransferProgress } = device
onFileTransferProgress({ ... })
```

**原生小程序中使用**

```javascript
const { onFileTransferProgress } = ty.device
onFileTransferProgress({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
传输文件的到蓝牙设备的进度事件
**参数**

| 属性           | 类型   | 默认值 | 必填 | 说明             |
| -------------- | ------ | ------ | ---- | ---------------- |
| deviceId       | string |        | 是   | 设备模型 设备 id |
| fileId         | number |        | 是   | 文件 id          |
| fileIdentifier | string |        | 是   | 文件标识符       |
| fileVersion    | number |        | 是   | 文件版本         |
| filePath       | string |        | 是   | 文件地址         |
| progress       | number |        | 是   | 传输进度         |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onFileTransferProgress,
  getLaunchOptionsSync,
  subscribeBLETransparentDataReport
} from '@ray-js/ray';
// 原生调用方式
const { onFileTransferProgress, subscribeBLETransparentDataReport } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onFileTransferProgress = (event) => {
  console.log(event);
};

subscribeBLETransparentDataReport({
  deviceId,
  success: () => {
    console.log('subscribeBLETransparentDataReport success');
  },
  fail: (error) => {
    console.log('subscribeBLETransparentDataReport fail', error);
  }
});
onFileTransferProgress(_onFileTransferProgress);
```

###### 成功示例

```json
{
  "deviceId": "device_id",
  "fileId": 123,
  "fileIdentifier": "file_identifier",
  "fileVersion": "file_version",
  "filePath": "path/to/file",
  "progress": 80
}
```

## Beacon

#### device.bluetoothCapabilityOfBLEBeacon

##### 功能描述

设备是否支持 BLEBeacon 能力

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { bluetoothCapabilityOfBLEBeacon } = device
bluetoothCapabilityOfBLEBeacon({ ... })
```

**原生小程序中使用**

```javascript
const { bluetoothCapabilityOfBLEBeacon } = ty.device
bluetoothCapabilityOfBLEBeacon({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
import {
  bluetoothCapabilityOfBLEBeacon,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { bluetoothCapabilityOfBLEBeacon } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

bluetoothCapabilityOfBLEBeacon({
  deviceId,
  success: (res) => {
    console.log('bluetoothCapabilityOfBLEBeacon success', res);
  },
  fail: (error) => {
    console.log('bluetoothCapabilityOfBLEBeacon fail', error);
  }
});
```

###### 成功示例

```json
true
```
#### device.startBLEScanBeacon

##### 功能描述

启动扫描 Beacon 扫描

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { startBLEScanBeacon } = device
startBLEScanBeacon({ ... })
```

**原生小程序中使用**

```javascript
const { startBLEScanBeacon } = ty.device
startBLEScanBeacon({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
import { startBLEScanBeacon, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { startBLEScanBeacon } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

startBLEScanBeacon({
  deviceId,
  success: () => {
    console.log('startBLEScanBeacon success');
  },
  fail: (error) => {
    console.log('startBLEScanBeacon fail', error);
  }
});
```
#### device.stopBLEScanBeacon

##### 功能描述

停止扫描 Beacon 扫描。

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { stopBLEScanBeacon } = device
stopBLEScanBeacon({ ... })
```

**原生小程序中使用**

```javascript
const { stopBLEScanBeacon } = ty.device
stopBLEScanBeacon({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备模型
deviceId 设备 Id                    |
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
import { stopBLEScanBeacon, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { stopBLEScanBeacon } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

stopBLEScanBeacon({
  deviceId,
  success: () => {
    console.log('stopBLEScanBeacon success');
  },
  fail: (error) => {
    console.log('stopBLEScanBeacon fail', error);
  }
});
```

## 其他

#### device.startBLEMeshLowPowerConnection

##### 功能描述

发起蓝牙 mesh 设备连接。该方法只执行连接动作，连接状态通过【onTYBLEConnectStatusChange】事件获取

> 需引入`DeviceKit`，且在`>=2.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { startBLEMeshLowPowerConnection } = device
startBLEMeshLowPowerConnection({ ... })
```

**原生小程序中使用**

```javascript
const { startBLEMeshLowPowerConnection } = ty.device
startBLEMeshLowPowerConnection({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId 设备 id                                 |
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
import {
  startBLEMeshLowPowerConnection,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { startBLEMeshLowPowerConnection } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

startBLEMeshLowPowerConnection({
  deviceId,
  success: () => {
    console.log('startBLEMeshLowPowerConnection success');
  },
  fail: (error) => {
    console.log('startBLEMeshLowPowerConnection fail', error);
  }
});
```
#### device.stopBLEMeshLowPowerConnection

##### 功能描述

断开蓝牙 mesh 设备连接。该方法只执行断开动作，连接状态通过【onTYBLEConnectStatusChange】事件获取

> 需引入`DeviceKit`，且在`>=2.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { stopBLEMeshLowPowerConnection } = device
stopBLEMeshLowPowerConnection({ ... })
```

**原生小程序中使用**

```javascript
const { stopBLEMeshLowPowerConnection } = ty.device
stopBLEMeshLowPowerConnection({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId 设备 id                                 |
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
import {
  stopBLEMeshLowPowerConnection,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { stopBLEMeshLowPowerConnection } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

stopBLEMeshLowPowerConnection({
  deviceId,
  success: () => {
    console.log('stopBLEMeshLowPowerConnection success');
  },
  fail: (error) => {
    console.log('stopBLEMeshLowPowerConnection fail', error);
  }
});
```
