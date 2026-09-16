# 设备连接通信 (device-connect)


## BT配对

#### device.connectBTBond

##### 功能描述

打开 BT 配对窗口 (仅 Android 端实现)

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { connectBTBond } = device
connectBTBond({ ... })
```

**原生小程序中使用**

```javascript
const { connectBTBond } = ty.device
connectBTBond({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| mac      | string   |        | 是   | 设备的 mac 地址                                  |
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
import { connectBTBond } from '@ray-js/ray';
// 原生调用方式
const { connectBTBond } = ty.device;

connectBTBond({
  mac: '00:00:00:00:00:00',
  success: () => {
    console.log('connectBTBond success');
  },
  fail: (error) => {
    console.log('connectBTBond fail', error);
  }
});
```
#### device.disconnectBTBond

##### 功能描述

移除 BT 配对 (仅 Android 端实现)

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { disconnectBTBond } = device
disconnectBTBond({ ... })
```

**原生小程序中使用**

```javascript
const { disconnectBTBond } = ty.device
disconnectBTBond({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| mac      | string   |        | 是   | 设备的 mac 地址                                  |
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
import { disconnectBTBond } from '@ray-js/ray';
// 原生调用方式
const { disconnectBTBond } = ty.device;

disconnectBTBond({
  mac: '00:00:00:00:00:00',
  success: () => {
    console.log('disconnectBTBond success');
  },
  fail: (error) => {
    console.log('disconnectBTBond fail', error);
  }
});
```
#### device.getBTDeviceInfo

##### 功能描述

获取设备 BT 信息

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getBTDeviceInfo } = device
getBTDeviceInfo({ ... })
```

**原生小程序中使用**

```javascript
const { getBTDeviceInfo } = ty.device
getBTDeviceInfo({ ... })
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

| 属性        | 类型    | 说明     |
| ----------- | ------- | -------- |
| deviceName  | string  | 设备名称 |
| isConnected | boolean | 是否连接 |
| isBond      | boolean | 是否配对 |
| mac         | string  | mac      |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getBTDeviceInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getBTDeviceInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getBTDeviceInfo({
  deviceId,
  success: (res) => {
    console.log('getBTDeviceInfo success', res);
  },
  fail: (error) => {
    console.log('getBTDeviceInfo fail', error);
  }
});
```

###### 成功示例

```json
{
  "deviceName": "DeviceName",
  "isConnected": true,
  "isBond": true,
  "mac": "xx:xx:xx:xx:xx:xx"
}
```

## 局域网

#### device.publishLanMessage

##### 功能描述

通过 局域网 消息通道下发消息

> 需引入`DeviceKit`，且在`>=2.1.4`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishLanMessage } = device
publishLanMessage({ ... })
```

**原生小程序中使用**

```javascript
const { publishLanMessage } = ty.device
publishLanMessage({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                   |
| -------- | -------- | ------ | ---- | ---------------------------------------------------------------------- |
| message  | string   |        | 是   | 消息内容                                                               |
| deviceId | string   |        | 是   | 设备 id                                                                |
| protocol | number   |        | 是   | 协议号                                                                 |
| options  | any      |        | 否   | 预留下发逻辑配置标记，后续可以拓展，例如下发声音，下发操作后续动作等等 |
| success  | function |        | 否   | 接口调用成功的回调函数                                                 |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                 |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                       |

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
import { publishLanMessage, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishLanMessage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

publishLanMessage({
  deviceId,
  message: { text: 'text' },
  protocol: 123,
  options: {},
  success: () => {
    console.log('publishLanMessage success');
  },
  fail: (error) => {
    console.log('publishLanMessage fail', error);
  }
});
```

###### 成功示例

```json
true
```

## MQTT

#### device.getMqttConnectState

##### 功能描述

获取 mqtt 连接状态 回调返回当前连接情况

> 需引入`DeviceKit`，且在`>=2.5.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getMqttConnectState } = device
getMqttConnectState({ ... })
```

**原生小程序中使用**

```javascript
const { getMqttConnectState } = ty.device
getMqttConnectState({ ... })
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

| 属性         | 类型   | 说明                                        |
| ------------ | ------ | ------------------------------------------- |
| connectState | number | mqtt 连接状态
0 连接失败
1 连接成功 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getMqttConnectState, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getMqttConnectState } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getMqttConnectState({
  deviceId,
  success: (info) => {
    console.log('getMqttConnectState success', info);
  },
  fail: (error) => {
    console.log('getMqttConnectState fail', error);
  }
});
```

###### 成功示例

```json
{
  "connectState": 1
}
```
#### device.offMqttConnectState

##### 功能描述

移除监听：mqtt 连接状态变化事件

> 需引入`DeviceKit`，且在`>=2.5.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offMqttConnectState } = device
offMqttConnectState({ ... })
```

**原生小程序中使用**

```javascript
const { offMqttConnectState } = ty.device
offMqttConnectState({ ... })
```

##### 参数

**function listener**

onMqttConnectState 传入的监听函数。不传此参数则移除所有监听函数。
#### device.offMqttMessageReceived

##### 功能描述

移除监听：MQTT 消息通道消息上报

> 需引入`DeviceKit`，且在`>=1.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offMqttMessageReceived } = device
offMqttMessageReceived({ ... })
```

**原生小程序中使用**

```javascript
const { offMqttMessageReceived } = ty.device
offMqttMessageReceived({ ... })
```

##### 参数

**function listener**

onMqttMessageReceived 传入的监听函数。不传此参数则移除所有监听函数。
#### device.onMqttConnectState

##### 功能描述

mqtt 连接状态变化事件

> 需引入`DeviceKit`，且在`>=2.5.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onMqttConnectState } = device
onMqttConnectState({ ... })
```

**原生小程序中使用**

```javascript
const { onMqttConnectState } = ty.device
onMqttConnectState({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
mqtt 连接状态变化事件
**参数**

| 属性         | 类型   | 默认值 | 必填 | 说明                                        |
| ------------ | ------ | ------ | ---- | ------------------------------------------- |
| connectState | number |        | 是   | mqtt 连接状态
0 连接失败
1 连接成功 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { onMqttConnectState, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { onMqttConnectState } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onMqttConnectState = (event) => {
  console.log(event);
};

onMqttConnectState(_onMqttConnectState);
```

###### 成功示例

```json
{
  "connectState": 1
}
```
#### device.onMqttMessageReceived

##### 功能描述

MQTT 消息通道消息上报

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onMqttMessageReceived } = device
onMqttMessageReceived({ ... })
```

**原生小程序中使用**

```javascript
const { onMqttMessageReceived } = ty.device
onMqttMessageReceived({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
MQTT 消息通道消息上报
**参数**

| 属性        | 类型   | 默认值 | 必填 | 说明                                     |
| ----------- | ------ | ------ | ---- | ---------------------------------------- |
| deviceId    | string |        | 否   | 设备 id                                  |
| message     | any    |        | 是   | 原始消息数据                             |
| messageData | any    |        | 是   | 双端抹平后的消息数据
`最低版本2.3.1` |
| type        | string |        | 是   | 消息类型                                 |
| protocol    | number |        | 是   | 协议号                                   |
| topic       | string |        | 否   | topic
`最低版本2.5.1`                |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onMqttMessageReceived,
  getLaunchOptionsSync,
  registerMQTTDeviceListener,
  registerMQTTProtocolListener
} from '@ray-js/ray';
// 原生调用方式
const {
  onMqttMessageReceived,
  registerMQTTDeviceListener,
  registerMQTTProtocolListener
} = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onMqttMessageReceived = (event) => {
  console.log(event);
};

registerMQTTDeviceListener({ deviceId });
registerMQTTProtocolListener({ protocol: xxx });
registerTopicListListener({ topicList: ['topic1', 'topic2'] });
onMqttMessageReceived(_onMqttMessageReceived);
```

###### 成功示例

```json
{
  "message": {
    "reqType": "sigQry",
    "data": {
      "signal": 99
    }
  },
  "protocol": 23,
  "deviceId": "device_id",
  "messageData": {
    "reqType": "sigQry",
    "data": {
      "signal": 99
    }
  }
}
```
#### device.sendMqttMessage

##### 功能描述

通过 MQTT 通道下发消息。

> 需引入`DeviceKit`，且在`>=3.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { sendMqttMessage } = device
sendMqttMessage({ ... })
```

**原生小程序中使用**

```javascript
const { sendMqttMessage } = ty.device
sendMqttMessage({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                   |
| -------- | -------- | ------ | ---- | ---------------------------------------------------------------------- |
| message  | any      |        | 是   | 消息内容                                                               |
| deviceId | string   |        | 是   | 设备 id                                                                |
| protocol | number   |        | 是   | 协议号                                                                 |
| options  | any      |        | 是   | 预留下发逻辑配置标记，后续可以拓展，例如下发声音，下发操作后续动作等等 |
| success  | function |        | 否   | 接口调用成功的回调函数                                                 |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                 |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                       |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### device.registerMQTTDeviceListener

##### 功能描述

注册设备的 MQTT 信息监听

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerMQTTDeviceListener } = device
registerMQTTDeviceListener({ ... })
```

**原生小程序中使用**

```javascript
const { registerMQTTDeviceListener } = ty.device
registerMQTTDeviceListener({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

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
import { registerMQTTDeviceListener, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { registerMQTTDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

registerMQTTDeviceListener({
  deviceId,
  success: () => {
    console.log('registerMQTTDeviceListener success');
  },
  fail: (error) => {
    console.log('registerMQTTDeviceListener fail', error);
  }
});
```
#### device.registerMQTTProtocolListener

##### 功能描述

注册 MQTT 协议监听

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerMQTTProtocolListener } = device
registerMQTTProtocolListener({ ... })
```

**原生小程序中使用**

```javascript
const { registerMQTTProtocolListener } = ty.device
registerMQTTProtocolListener({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| protocol | number   |        | 是   | protocol 协议号
MQTT 预定义的协议号          |
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
import { registerMQTTProtocolListener } from '@ray-js/ray';
// 原生调用方式
const { registerMQTTProtocolListener } = ty.device;

registerMQTTProtocolListener({
  protocol: 111,
  success: () => {
    console.log('registerMQTTProtocolListener success');
  },
  fail: (error) => {
    console.log('registerMQTTProtocolListener fail', error);
  }
});
```

##### 常见问题

###### Q：为什么安卓 protocol 值可传递字符串，IOS 端不支持？

A：由于历史原因，双端实现存在差异，调用时需要严格根据方法参数定义的类型传递，需要将 protocol 转换为数值型进行方法调用。
#### device.registerTopicListListener

##### 功能描述

注册需要监听的 topci 列表 [仅 m/m/i topic 订阅]

> 需引入`DeviceKit`，且在`>=2.5.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerTopicListListener } = device
registerTopicListListener({ ... })
```

**原生小程序中使用**

```javascript
const { registerTopicListListener } = ty.device
registerTopicListListener({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| topicList | string[] |        | 是   | 需监听的 topic 列表                              |
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
import { registerTopicListListener } from '@ray-js/ray';
// 原生调用方式
const { registerTopicListListener } = ty.device;

registerTopicListListener({
  topicList: ['topic1', 'topic2'],
  success: () => {
    console.log('registerTopicListListener success');
  },
  fail: (error) => {
    console.log('registerTopicListListener fail', error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 20053  | Subscribe topic failed            |
#### device.unregisterMQTTDeviceListener

##### 功能描述

注销设备的 MQTT 信息监听

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unregisterMQTTDeviceListener } = device
unregisterMQTTDeviceListener({ ... })
```

**原生小程序中使用**

```javascript
const { unregisterMQTTDeviceListener } = ty.device
unregisterMQTTDeviceListener({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

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
  unregisterMQTTDeviceListener,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { unregisterMQTTDeviceListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

unregisterMQTTDeviceListener({
  deviceId,
  success: () => {
    console.log('unregisterMQTTDeviceListener success');
  },
  fail: (error) => {
    console.log('unregisterMQTTDeviceListener fail', error);
  }
});
```
#### device.unregisterMQTTProtocolListener

##### 功能描述

注销 MQTT 协议监听

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unregisterMQTTProtocolListener } = device
unregisterMQTTProtocolListener({ ... })
```

**原生小程序中使用**

```javascript
const { unregisterMQTTProtocolListener } = ty.device
unregisterMQTTProtocolListener({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| protocol | number   |        | 是   | protocol 协议号
MQTT 预定义的协议号          |
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
import { unregisterMQTTProtocolListener } from '@ray-js/ray';
// 原生调用方式
const { unregisterMQTTProtocolListener } = ty.device;

unregisterMQTTProtocolListener({
  protocol: 111,
  success: () => {
    console.log('unregisterMQTTProtocolListener success');
  },
  fail: (error) => {
    console.log('unregisterMQTTProtocolListener fail', error);
  }
});
```

##### 常见问题

###### Q：为什么安卓 protocol 值可传递字符串，IOS 端不支持？

A：由于历史原因，双端实现存在差异，调用时需要严格根据方法参数定义的类型传递，需要将 protocol 转换为数值型进行方法调用。
#### device.unregisterTopicListListener

##### 功能描述

注销需要监听的 topic 列表

> 需引入`DeviceKit`，且在`>=2.5.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unregisterTopicListListener } = device
unregisterTopicListListener({ ... })
```

**原生小程序中使用**

```javascript
const { unregisterTopicListListener } = ty.device
unregisterTopicListListener({ ... })
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
import { unregisterTopicListListener } from '@ray-js/ray';
// 原生调用方式
const { unregisterTopicListListener } = ty.device;

unregisterTopicListListener({
  success: () => {
    console.log('unregisterTopicListListener success');
  },
  fail: (error) => {
    console.log('unregisterTopicListListener fail', error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                 |
| ------ | ------------------------ |
| 20054  | Unsubscribe topic failed |

## Socket

#### device.offSocketMessageReceived

##### 功能描述

移除监听：socket 消息通道消息上报

> 需引入`DeviceKit`，且在`>=1.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offSocketMessageReceived } = device
offSocketMessageReceived({ ... })
```

**原生小程序中使用**

```javascript
const { offSocketMessageReceived } = ty.device
offSocketMessageReceived({ ... })
```

##### 参数

**function listener**

onSocketMessageReceived 传入的监听函数。不传此参数则移除所有监听函数。
#### device.onSocketMessageReceived

##### 功能描述

socket 消息通道消息上报

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onSocketMessageReceived } = device
onSocketMessageReceived({ ... })
```

**原生小程序中使用**

```javascript
const { onSocketMessageReceived } = ty.device
onSocketMessageReceived({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
socket 消息通道消息上报
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明            |
| -------- | ------ | ------ | ---- | --------------- |
| message  | any    |        | 是   | 消息内容        |
| deviceId | string |        | 是   | 设备 id         |
| type     | number |        | 是   | 局域网消息 type |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { onSocketMessageReceived } from '@ray-js/ray';
// 原生调用方式
const { onSocketMessageReceived } = ty.device;

const _onSocketMessageReceived = (event) => {
  console.log(event);
};

onSocketMessageReceived(_onSocketMessageReceived);
```

###### 成功示例

```json
{
  "type": 123,
  "deviceId": "xxx",
  "message": { "text": "text" }
}
```
#### device.publishSocketMessage

##### 功能描述

通过 Socket 消息通道下发消息

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishSocketMessage } = device
publishSocketMessage({ ... })
```

**原生小程序中使用**

```javascript
const { publishSocketMessage } = ty.device
publishSocketMessage({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                   |
| -------- | -------- | ------ | ---- | ---------------------------------------------------------------------- |
| message  | any      |        | 是   | 消息内容                                                               |
| deviceId | string   |        | 是   | 设备 id                                                                |
| type     | number   |        | 是   | 局域网消息 type                                                        |
| options  | any      |        | 是   | 预留下发逻辑配置标记，后续可以拓展，例如下发声音，下发操作后续动作等等 |
| success  | function |        | 否   | 接口调用成功的回调函数                                                 |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                 |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                       |

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
import { publishSocketMessage, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishSocketMessage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

publishSocketMessage({
  deviceId,
  message: { text: 'text' },
  type: 123,
  options: {},
  success: () => {
    console.log('publishSocketMessage success');
  },
  fail: (error) => {
    console.log('publishSocketMessage fail', error);
  }
});
```

###### 成功示例

```json
true
```
