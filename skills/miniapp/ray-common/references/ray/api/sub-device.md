# 子设备 (sub-device)

### device.getSubDeviceInfoList

#### 功能描述

获取子设备信息

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getSubDeviceInfoList } = device
getSubDeviceInfoList({ ... })
```

**原生小程序中使用**

```javascript
const { getSubDeviceInfoList } = ty.device
getSubDeviceInfoList({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| meshId   | string   |        | 是   | 网关设备 id 或上级节点 id                        |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { getSubDeviceInfoList, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getLaunchOptionsSync } = ty;
const { getSubDeviceInfoList } = ty.device;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getSubDeviceInfoList({
  meshId: deviceId,
  success: (info) => {
    console.log('getSubDeviceInfoList success', info);
  },
  fail: (error) => {
    console.log('getSubDeviceInfoList fail', error);
  }
});
```

##### 成功示例

```json
[
  {
    "isGW": false,
    "latitude": "30.3",
    "isVirtualDevice": false,
    "bluetoothCapability": "",
    "isSupportOTA": true,
    "dpsTime": {
      "1": 1732172286798,
      "7": 1731898340413,
      "16": 1731898340413
    },
    "baseAttribute": 0,
    "uuid": "xxx",
    "isRelayOpen": true,
    "configMetas": {},
    "ability": 0,
    "panelConfig": {
      "bic": [
        {
          "selected": true,
          "code": "timer"
        },
        {
          "selected": false,
          "code": "jump_url"
        }
      ],
      "fun": {
        "hideGroupCountdown": true
      }
    },
    "pcc": "",
    "iconUrl": "https://xxx.png",
    "longitude": "120.06",
    "nodeId": "xxx",
    "devTimezoneId": "Asia/Shanghai",
    "connectionStatus": 1,
    "capability": 4096,
    "dpName": {},
    "bizAttribute": 0,
    "isZigbeeInstallCode": false,
    "isLocalOnline": false,
    "attribute": 280786110468,
    "yuNetState": 0,
    "productVer": "1.0.0",
    "cadv": "",
    "devAttribute": 2048,
    "isZigBeeSubDev": true,
    "switchDps": [1],
    "dps": {
      "1": true,
      "7": 0,
      "16": true
    },
    "roomName": "",
    "devId": "xxx",
    "dpCodes": {
      "switch_1": true,
      "countdown_1": 0,
      "switch_backlight": true
    },
    "name": "智能一位墙壁开关（零火版）",
    "parentId": "xxx",
    "isProxyOpen": true,
    "activeTime": 1731898339,
    "ip": "",
    "attributeString": "100000101100000001010000000100000000100",
    "schema": [
      {
        "id": 1,
        "code": "switch_1",
        "mode": "rw",
        "property": {
          "type": "bool"
        },
        "iconname": "icon-power",
        "type": "obj",
        "name": "开关"
      },
      {
        "id": 7,
        "code": "countdown_1",
        "mode": "rw",
        "property": {
          "unit": "s",
          "min": 0,
          "scale": 0,
          "step": 1,
          "type": "value",
          "max": 43200
        },
        "iconname": "icon-dp_time2",
        "type": "obj",
        "name": "开关1倒计时"
      },
      {
        "id": 16,
        "code": "switch_backlight",
        "mode": "rw",
        "property": {
          "type": "bool"
        },
        "iconname": "icon-dp_light",
        "type": "obj",
        "name": "背光开关"
      }
    ],
    "isMatter": false,
    "hasWifi": false,
    "category": "kg",
    "extModuleType": -1,
    "isOnline": true,
    "verSw": "1.0.0",
    "isSupportLink": true,
    "productId": "01vfja9n",
    "isShare": false,
    "switchDp": 0,
    "icon": "https://xxx.png",
    "isSupportAppleHomeKit": true,
    "isSupportGroup": true,
    "mac": "xxx",
    "bv": "0",
    "isCloudOnline": true,
    "isTripartiteMatter": false,
    "isSupportProxyAndRelay": false,
    "wifiEnableState": 2,
    "protocolAttribute": 0
  }
]
```
### device.registerZigbeeGateWaySubDeviceListener

#### 功能描述

注册 Zigbee 网关子设备监听器

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerZigbeeGateWaySubDeviceListener } = device
registerZigbeeGateWaySubDeviceListener({ ... })
```

**原生小程序中使用**

```javascript
const { registerZigbeeGateWaySubDeviceListener } = ty.device
registerZigbeeGateWaySubDeviceListener({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any      |        | 否   | dps                                                                                       |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  registerZigbeeGateWaySubDeviceListener,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { registerZigbeeGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

registerZigbeeGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('registerZigbeeGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('registerZigbeeGateWaySubDeviceListener fail', error);
  }
});
```
### device.unregisterZigbeeGateWaySubDeviceListener

#### 功能描述

注销 Zigbee 网关子设备监听器

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unregisterZigbeeGateWaySubDeviceListener } = device
unregisterZigbeeGateWaySubDeviceListener({ ... })
```

**原生小程序中使用**

```javascript
const { unregisterZigbeeGateWaySubDeviceListener } = ty.device
unregisterZigbeeGateWaySubDeviceListener({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any      |        | 否   | dps                                                                                       |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  unregisterZigbeeGateWaySubDeviceListener,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { unregisterZigbeeGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

unregisterZigbeeGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('unregisterZigbeeGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('unregisterZigbeeGateWaySubDeviceListener fail', error);
  }
});
```
### device.onSubDeviceAdded

#### 功能描述

网关添加子设备的事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onSubDeviceAdded } = device
onSubDeviceAdded({ ... })
```

**原生小程序中使用**

```javascript
const { onSubDeviceAdded } = ty.device
onSubDeviceAdded({ ... })
```

#### 体验 Demo

#### 参数

**function listener**
网关添加子设备的事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                                                      |
| -------- | ------ | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any    |        | 否   | dps                                                                                       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  onSubDeviceAdded,
  getLaunchOptionsSync,
  registerGateWaySubDeviceListener
} from '@ray-js/ray';
// 原生调用方式
const { onSubDeviceAdded, registerGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onSubDeviceAdded = (event) => {
  console.log(event);
};

registerGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('registerGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('registerGateWaySubDeviceListener fail', error);
  }
});
onSubDeviceAdded(_onSubDeviceAdded);
```

##### 成功示例

```json
{
  "deviceId": "device_id"
}
```

#### 常见问题

##### Q：为什么调用了 onSubDeviceAdded 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
### device.offSubDeviceAdded

#### 功能描述

移除监听：网关添加子设备的事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offSubDeviceAdded } = device
offSubDeviceAdded({ ... })
```

**原生小程序中使用**

```javascript
const { offSubDeviceAdded } = ty.device
offSubDeviceAdded({ ... })
```

#### 参数

**function listener**

onSubDeviceAdded 传入的监听函数。不传此参数则移除所有监听函数。
### device.onSubDeviceDpUpdate

#### 功能描述

网关子设备 dp 信息变化事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onSubDeviceDpUpdate } = device
onSubDeviceDpUpdate({ ... })
```

**原生小程序中使用**

```javascript
const { onSubDeviceDpUpdate } = ty.device
onSubDeviceDpUpdate({ ... })
```

#### 体验 Demo

#### 参数

**function listener**
网关子设备 dp 信息变化事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                                                      |
| -------- | ------ | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any    |        | 否   | dps                                                                                       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  onSubDeviceDpUpdate,
  getLaunchOptionsSync,
  registerGateWaySubDeviceListener
} from '@ray-js/ray';
// 原生调用方式
const { onSubDeviceDpUpdate, registerGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onSubDeviceDpUpdate = (event) => {
  console.log(event);
};

registerGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('registerGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('registerGateWaySubDeviceListener fail', error);
  }
});
onSubDeviceDpUpdate(_onSubDeviceDpUpdate);
```

##### 成功示例

```json
{
  "dps": {
    "4": "single_click"
  },
  "deviceId": "device_id"
}
```

#### 常见问题

##### Q：为什么调用了 onSubDeviceDpUpdate 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
### device.offSubDeviceDpUpdate

#### 功能描述

移除监听：网关子设备 dp 信息变化事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offSubDeviceDpUpdate } = device
offSubDeviceDpUpdate({ ... })
```

**原生小程序中使用**

```javascript
const { offSubDeviceDpUpdate } = ty.device
offSubDeviceDpUpdate({ ... })
```

#### 参数

**function listener**

onSubDeviceDpUpdate 传入的监听函数。不传此参数则移除所有监听函数。
### device.onSubDeviceInfoUpdate

#### 功能描述

网关子设备信息变化的事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onSubDeviceInfoUpdate } = device
onSubDeviceInfoUpdate({ ... })
```

**原生小程序中使用**

```javascript
const { onSubDeviceInfoUpdate } = ty.device
onSubDeviceInfoUpdate({ ... })
```

#### 体验 Demo

#### 参数

**function listener**
网关子设备信息变化的事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                                                      |
| -------- | ------ | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any    |        | 否   | dps                                                                                       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  onSubDeviceInfoUpdate,
  getLaunchOptionsSync,
  registerGateWaySubDeviceListener
} from '@ray-js/ray';
// 原生调用方式
const { onSubDeviceInfoUpdate, registerGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onSubDeviceInfoUpdate = (event) => {
  console.log(event);
};

registerGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('registerGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('registerGateWaySubDeviceListener fail', error);
  }
});
onSubDeviceInfoUpdate(_onSubDeviceInfoUpdate);
```

##### 成功示例

```json
{
  "deviceId": "device_id"
}
```

#### 常见问题

##### Q：为什么调用了 onSubDeviceInfoUpdate 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
### device.offSubDeviceInfoUpdate

#### 功能描述

移除监听：网关子设备信息变化的事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offSubDeviceInfoUpdate } = device
offSubDeviceInfoUpdate({ ... })
```

**原生小程序中使用**

```javascript
const { offSubDeviceInfoUpdate } = ty.device
offSubDeviceInfoUpdate({ ... })
```

#### 参数

**function listener**

onSubDeviceInfoUpdate 传入的监听函数。不传此参数则移除所有监听函数。
### device.onSubDeviceRemoved

#### 功能描述

网关子设备被移除事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onSubDeviceRemoved } = device
onSubDeviceRemoved({ ... })
```

**原生小程序中使用**

```javascript
const { onSubDeviceRemoved } = ty.device
onSubDeviceRemoved({ ... })
```

#### 体验 Demo

#### 参数

**function listener**
网关子设备被移除事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                                                      |
| -------- | ------ | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any    |        | 否   | dps                                                                                       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  onSubDeviceRemoved,
  getLaunchOptionsSync,
  registerGateWaySubDeviceListener
} from '@ray-js/ray';
// 原生调用方式
const { onSubDeviceRemoved, registerGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onSubDeviceRemoved = (event) => {
  console.log(event);
};

registerGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('registerGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('registerGateWaySubDeviceListener fail', error);
  }
});
onSubDeviceRemoved(_onSubDeviceRemoved);
```

##### 成功示例

```json
{
  "deviceId": "device_id"
}
```

#### 常见问题

##### Q：为什么调用了 onSubDeviceRemoved 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
### device.offSubDeviceRemoved

#### 功能描述

移除监听：网关子设备被移除事件

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offSubDeviceRemoved } = device
offSubDeviceRemoved({ ... })
```

**原生小程序中使用**

```javascript
const { offSubDeviceRemoved } = ty.device
offSubDeviceRemoved({ ... })
```

#### 参数

**function listener**

onSubDeviceRemoved 传入的监听函数。不传此参数则移除所有监听函数。
### device.registerGateWaySubDeviceListener

#### 功能描述

注册网关子设备监听器

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerGateWaySubDeviceListener } = device
registerGateWaySubDeviceListener({ ... })
```

**原生小程序中使用**

```javascript
const { registerGateWaySubDeviceListener } = ty.device
registerGateWaySubDeviceListener({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any      |        | 否   | dps                                                                                       |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  registerGateWaySubDeviceListener,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { registerGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

registerGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('registerGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('registerGateWaySubDeviceListener fail', error);
  }
});
```
### device.unregisterGateWaySubDeviceListener

#### 功能描述

注销网关子设备监听器

> 需引入`DeviceKit`，且在`>=3.1.2`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unregisterGateWaySubDeviceListener } = device
unregisterGateWaySubDeviceListener({ ... })
```

**原生小程序中使用**

```javascript
const { unregisterGateWaySubDeviceListener } = ty.device
unregisterGateWaySubDeviceListener({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any      |        | 否   | dps                                                                                       |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

#### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  unregisterGateWaySubDeviceListener,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { unregisterGateWaySubDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

unregisterGateWaySubDeviceListener({
  deviceId,
  success: () => {
    console.log('unregisterGateWaySubDeviceListener success');
  },
  fail: (error) => {
    console.log('unregisterGateWaySubDeviceListener fail', error);
  }
});
```
