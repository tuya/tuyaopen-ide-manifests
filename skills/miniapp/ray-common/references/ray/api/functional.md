# 功能页面 (functional)

### device.openDeviceDetailPage

#### 功能描述

跳转设备详情

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openDeviceDetailPage } = device
openDeviceDetailPage({ ... })
```

**原生小程序中使用**

```javascript
const { openDeviceDetailPage } = ty.device
openDeviceDetailPage({ ... })
```

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
import { openDeviceDetailPage, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openDeviceDetailPage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

openDeviceDetailPage({
  deviceId,
  success: () => {
    console.log('openDeviceDetailPage success');
  },
  fail: (error) => {
    console.log('openDeviceDetailPage fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 9002   | Context is invalid   |
| 9005   | can‘t find service   |
| 20001  | DeviceId is invalid  |
| 20022  | Device model is null |
### device.openDeviceEdit

#### 功能描述

跳转设备编辑页面

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openDeviceEdit } = device
openDeviceEdit({ ... })
```

**原生小程序中使用**

```javascript
const { openDeviceEdit } = ty.device
openDeviceEdit({ ... })
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
import { openDeviceEdit, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openDeviceEdit } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

openDeviceEdit({
  deviceId,
  success: () => {
    console.log('openDeviceEdit success');
  },
  fail: (error) => {
    console.log('openDeviceEdit fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 9001   | Activity is invalid  |
| 9005   | can‘t find service   |
| 20001  | DeviceId is invalid  |
| 20022  | Device model is null |
### device.openDeviceInfo

#### 功能描述

跳转设备信息页面

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openDeviceInfo } = device
openDeviceInfo({ ... })
```

**原生小程序中使用**

```javascript
const { openDeviceInfo } = ty.device
openDeviceInfo({ ... })
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
import { openDeviceInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openDeviceInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

openDeviceInfo({
  deviceId,
  success: () => {
    console.log('openDeviceInfo success');
  },
  fail: (error) => {
    console.log('openDeviceInfo fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 9002   | Context is invalid   |
| 9005   | can‘t find service   |
| 20001  | DeviceId is invalid  |
| 20022  | Device model is null |
### device.openDeviceQuestionsAndFeedback

#### 功能描述

跳转常见问题与反馈页面

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openDeviceQuestionsAndFeedback } = device
openDeviceQuestionsAndFeedback({ ... })
```

**原生小程序中使用**

```javascript
const { openDeviceQuestionsAndFeedback } = ty.device
openDeviceQuestionsAndFeedback({ ... })
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
import {
  openDeviceQuestionsAndFeedback,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { openDeviceQuestionsAndFeedback } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

openDeviceQuestionsAndFeedback({
  deviceId,
  success: () => {
    console.log('openDeviceQuestionsAndFeedback success');
  },
  fail: (error) => {
    console.log('openDeviceQuestionsAndFeedback fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 9001   | Activity is invalid  |
| 9005   | can‘t find service   |
| 20001  | DeviceId is invalid  |
| 20022  | Device model is null |
### device.openDeviceWifiNetworkMonitorPage

#### 功能描述

跳转设备 wifi 网络监测页面

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openDeviceWifiNetworkMonitorPage } = device
openDeviceWifiNetworkMonitorPage({ ... })
```

**原生小程序中使用**

```javascript
const { openDeviceWifiNetworkMonitorPage } = ty.device
openDeviceWifiNetworkMonitorPage({ ... })
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
import {
  openDeviceWifiNetworkMonitorPage,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { openDeviceWifiNetworkMonitorPage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

openDeviceWifiNetworkMonitorPage({
  deviceId,
  success: () => {
    console.log('openDeviceWifiNetworkMonitorPage success');
  },
  fail: (error) => {
    console.log('openDeviceWifiNetworkMonitorPage fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 9005   | can‘t find service   |
| 20001  | DeviceId is invalid  |
| 20022  | Device model is null |
### device.openShareDevice

#### 功能描述

跳转共享设备页面

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openShareDevice } = device
openShareDevice({ ... })
```

**原生小程序中使用**

```javascript
const { openShareDevice } = ty.device
openShareDevice({ ... })
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
import { openShareDevice, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openShareDevice } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

openShareDevice({
  deviceId,
  success: () => {
    console.log('openShareDevice success');
  },
  fail: (error) => {
    console.log('openShareDevice fail', error);
  }
});
```

#### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 9001   | Activity is invalid  |
| 9005   | can‘t find service   |
| 20001  | DeviceId is invalid  |
| 20022  | Device model is null |
