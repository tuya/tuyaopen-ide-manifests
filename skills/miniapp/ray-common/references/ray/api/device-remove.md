# 设备移除 (device-remove)

### device.removeDevice

#### 功能描述

移除设备

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { removeDevice } = device
removeDevice({ ... })
```

**原生小程序中使用**

```javascript
const { removeDevice } = ty.device
removeDevice({ ... })
```

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
import { removeDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { removeDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

removeDevice({
  deviceId,
  success: () => {
    console.log('removeDevice success');
  },
  fail: (error) => {
    console.log('removeDevice fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 20001  | DeviceId is invalid |
| 20021  | Cannot find service |
| 20026  | Remove device error |
### device.resetFactory

#### 功能描述

重置设备并恢复出厂设置。
设备数据会被清除并进入待配网状态。

> 需引入`DeviceKit`，且在`>=1.3.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { resetFactory } = device
resetFactory({ ... })
```

**原生小程序中使用**

```javascript
const { resetFactory } = ty.device
resetFactory({ ... })
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
import { resetFactory, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { resetFactory } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

resetFactory({
  deviceId,
  success: () => {
    console.log('resetFactory success');
  },
  fail: (error) => {
    console.log('resetFactory fail', error);
  }
});
```
### device.removeShareDevice

#### 功能描述

移除共享设备

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { removeShareDevice } = device
removeShareDevice({ ... })
```

**原生小程序中使用**

```javascript
const { removeShareDevice } = ty.device
removeShareDevice({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
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
import { removeShareDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { removeShareDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId, groupId }
} = getLaunchOptionsSync();

removeShareDevice({
  deviceId,
  success: () => {
    console.log('removeShareDevice success');
  },
  fail: (error) => {
    console.log('removeShareDevice fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 9005   | can‘t find service                   |
| 20001  | DeviceId is invalid                  |
| 20022  | Device model is null                 |
| 20058  | Remove received shared device failed |
### device.onDeviceRemoved

#### 功能描述

设备移除事件

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onDeviceRemoved } = device
onDeviceRemoved({ ... })
```

**原生小程序中使用**

```javascript
const { onDeviceRemoved } = ty.device
onDeviceRemoved({ ... })
```

#### 体验 Demo

#### 参数

**function listener**
设备移除事件
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明    |
| -------- | ------ | ------ | ---- | ------- |
| deviceId | string |        | 是   | 设备 id |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  onDeviceRemoved,
  getLaunchOptionsSync,
  registerDeviceListListener
} from '@ray-js/ray';
// 原生调用方式
const { onDeviceRemoved, registerDeviceListListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onDeviceRemoved = (event) => {
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
onDeviceRemoved(_onDeviceRemoved);
```

##### 成功示例

```json
{
  "deviceId": "device_id"
}
```

#### 常见问题

##### Q：为什么调用了 onDeviceRemoved 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。低版本 App (< 4.3.0 版本) 还需要调用 subscribeDeviceRemoved 方法才能收到设备移除消息。
### device.offDeviceRemoved

#### 功能描述

移除监听：设备移除事件

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offDeviceRemoved } = device
offDeviceRemoved({ ... })
```

**原生小程序中使用**

```javascript
const { offDeviceRemoved } = ty.device
offDeviceRemoved({ ... })
```

#### 参数

**function listener**

onDeviceRemoved 传入的监听函数。不传此参数则移除所有监听函数。
