# 物模型 (thing-model)

### device.deviceIsSupportThingModel

#### 功能描述

设备是否支持物模型

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { deviceIsSupportThingModel } = device
deviceIsSupportThingModel({ ... })
```

**原生小程序中使用**

```javascript
const { deviceIsSupportThingModel } = ty.device
deviceIsSupportThingModel({ ... })
```

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| devId    | string   |        | 是   | 设备 id                                          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

| 属性      | 类型    | 说明               |
| --------- | ------- | ------------------ |
| isSupport | boolean | 是否支持物模型控制 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { deviceIsSupportThingModel, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { deviceIsSupportThingModel } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

deviceIsSupportThingModel({
  deviceId,
  success: (info) => {
    console.log('deviceIsSupportThingModel success', info);
  },
  fail: (error) => {
    console.log('deviceIsSupportThingModel fail', error);
  }
});
```

##### 成功示例

```json
true
```
### device.getDeviceThingModelInfo

#### 功能描述

获取设备物模型信息

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceThingModelInfo } = device
getDeviceThingModelInfo({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceThingModelInfo } = ty.device
getDeviceThingModelInfo({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| devId    | string   |        | 是   | 设备 id                                          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

#### 返回结果

**success**

| 属性           | 类型           | 说明      |
| -------------- | -------------- | --------- |
| modelId        | string         | 物模型 id |
| productId      | string         | 产品 id   |
| productVersion | string         | 产品版本  |
| services       | ServiceModel[] | 服务列表  |
| extensions     | any            | 扩展属性  |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

#### 引用对象

**ThingProperty**

| 属性         | 类型   | 默认值 | 必填 | 说明                                |
| ------------ | ------ | ------ | ---- | ----------------------------------- |
| abilityId    | number |        | 是   | 属性 id                             |
| accessMode   | string |        | 是   | 访问模式: ro-只读, wr-只写, rw-读写 |
| typeSpec     | any    |        | 是   | 属性类型                            |
| defaultValue | object |        | 是   | 属性默认值                          |
| code         | string |        | 是   | 标识代码                            |

**ThingAction**

| 属性         | 类型     | 默认值 | 必填 | 说明               |
| ------------ | -------- | ------ | ---- | ------------------ |
| abilityId    | number   |        | 是   | 动作 id            |
| inputParams  | object[] |        | 是   | 动作的输入参数列表 |
| outputParams | object[] |        | 是   | 动作的输出参数列表 |
| code         | string   |        | 是   | 标识代码           |

**ThingEvent**

| 属性         | 类型     | 默认值 | 必填 | 说明               |
| ------------ | -------- | ------ | ---- | ------------------ |
| abilityId    | number   |        | 是   | 事件 id            |
| outputParams | object[] |        | 是   | 事件的输出参数列表 |
| code         | string   |        | 是   | 标识代码           |

**ServiceModel**

| 属性       | 类型            | 默认值 | 必填 | 说明     |
| ---------- | --------------- | ------ | ---- | -------- |
| properties | ThingProperty[] |        | 是   | 属性列表 |
| actions    | ThingAction[]   |        | 是   | 动作列表 |
| events     | ThingEvent[]    |        | 是   | 事件列表 |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import { getDeviceThingModelInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getDeviceThingModelInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getDeviceThingModelInfo({
  deviceId,
  success: (info) => {
    console.log('getDeviceThingModelInfo success', info);
  },
  fail: (error) => {
    console.log('getDeviceThingModelInfo fail', error);
  }
});
```

##### 成功示例

```json
{
  "modelId": "fzhl40",
  "productVersion": "1.0.0",
  "productId": "k2zpqhd4fcolicvg",
  "services": [
    {
      "actions": [
        {
          "code": "testAction",
          "abilityId": 115,
          "outputParams": [
            {
              "typeSpec": {
                "maxlen": 1024,
                "type": "string",
                "typeDefaultValue": ""
              },
              "code": "outputparam1"
            },
            {
              "typeSpec": {
                "maxlen": 1024,
                "type": "string",
                "typeDefaultValue": ""
              },
              "code": "outputparam2"
            }
          ],
          "inputParams": [
            {
              "typeSpec": {
                "maxlen": 1024,
                "type": "string",
                "typeDefaultValue": ""
              },
              "code": "inputparams1"
            },
            {
              "typeSpec": {
                "maxlen": 1024,
                "type": "string",
                "typeDefaultValue": ""
              },
              "code": "inputparams2"
            }
          ]
        }
      ],
      "properties": [
        {
          "code": "MainSwitch",
          "typeSpec": {
            "type": "bool",
            "typeDefaultValue": false
          },
          "accessMode": "wr",
          "abilityId": 101
        },
        {
          "code": "AddDevice",
          "typeSpec": {
            "type": "bool",
            "typeDefaultValue": false
          },
          "accessMode": "wr",
          "abilityId": 102
        },
        {
          "code": "DelDevice",
          "typeSpec": {
            "scale": 0,
            "min": 0,
            "typeDefaultValue": 0,
            "type": "value",
            "max": 100,
            "step": 1
          },
          "accessMode": "wr",
          "abilityId": 103
        },
        {
          "code": "SingleSwitch",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "valveid": {
                "name": "水阀id",
                "typeSpec": {
                  "scale": 0,
                  "min": 0,
                  "typeDefaultValue": 0,
                  "type": "value",
                  "max": 100,
                  "step": 1
                }
              },
              "valvestate": {
                "name": "水阀状态",
                "typeSpec": {
                  "type": "bool",
                  "typeDefaultValue": false
                }
              }
            }
          },
          "accessMode": "wr",
          "abilityId": 104
        },
        {
          "code": "ValveStateList",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "valvepowerlist": {
                "name": "水阀电量列表",
                "typeSpec": {
                  "maxlen": 128,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              },
              "valvestatelist": {
                "name": "水阀状态列表",
                "typeSpec": {
                  "maxlen": 128,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              },
              "valvenamelist": {
                "name": "水阀名称列表",
                "typeSpec": {
                  "maxlen": 256,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              },
              "valveidlist": {
                "name": "水阀id列表",
                "typeSpec": {
                  "maxlen": 128,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              }
            }
          },
          "accessMode": "ro",
          "abilityId": 105
        },
        {
          "code": "SetValvePlan",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "valveid": {
                "name": "水阀id",
                "typeSpec": {
                  "scale": 0,
                  "min": 0,
                  "typeDefaultValue": 0,
                  "type": "value",
                  "max": 100,
                  "step": 1
                }
              },
              "valveworkplan": {
                "name": "水阀工作计划",
                "typeSpec": {
                  "maxlen": 256,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              }
            }
          },
          "accessMode": "wr",
          "abilityId": 106
        },
        {
          "code": "RenameValve",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "valveid": {
                "name": "水阀id",
                "typeSpec": {
                  "scale": 0,
                  "min": 0,
                  "typeDefaultValue": 0,
                  "type": "value",
                  "max": 100,
                  "step": 1
                }
              },
              "valvename": {
                "name": "水阀名称",
                "typeSpec": {
                  "maxlen": 128,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              }
            }
          },
          "accessMode": "wr",
          "abilityId": 107
        },
        {
          "code": "MainValvePlan",
          "typeSpec": {
            "maxlen": 256,
            "type": "string",
            "typeDefaultValue": ""
          },
          "accessMode": "wr",
          "abilityId": 108
        },
        {
          "code": "ResOK",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "res_ok": {
                "name": "res_ok",
                "typeSpec": {
                  "type": "bool",
                  "typeDefaultValue": false
                }
              },
              "dpid": {
                "name": "dpid",
                "typeSpec": {
                  "maxlen": 128,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              }
            }
          },
          "accessMode": "rw",
          "abilityId": 109
        },
        {
          "code": "ValveStateSingle",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "valvename": {
                "name": "水阀名称",
                "typeSpec": {
                  "maxlen": 256,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              },
              "valveid": {
                "name": "水阀id",
                "typeSpec": {
                  "scale": 0,
                  "min": 0,
                  "typeDefaultValue": 0,
                  "type": "value",
                  "max": 100,
                  "step": 1
                }
              },
              "valvepower": {
                "name": "水阀电量",
                "typeSpec": {
                  "scale": 0,
                  "min": 1,
                  "typeDefaultValue": 1,
                  "type": "value",
                  "max": 100,
                  "step": 1
                }
              },
              "valveplan": {
                "name": "水阀工作计划",
                "typeSpec": {
                  "maxlen": 256,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              },
              "valvestate": {
                "name": "水阀状态",
                "typeSpec": {
                  "type": "bool",
                  "typeDefaultValue": false
                }
              }
            }
          },
          "accessMode": "ro",
          "abilityId": 110
        },
        {
          "code": "GetValveState",
          "typeSpec": {
            "scale": 0,
            "min": 0,
            "typeDefaultValue": 0,
            "type": "value",
            "max": 100,
            "step": 1
          },
          "accessMode": "wr",
          "abilityId": 111
        },
        {
          "code": "GetValveStateTotal",
          "typeSpec": {
            "type": "bool",
            "typeDefaultValue": false
          },
          "accessMode": "wr",
          "abilityId": 112
        },
        {
          "code": "DelValvePlan",
          "typeSpec": {
            "type": "struct",
            "properties": {
              "valveid": {
                "name": "水阀id",
                "typeSpec": {
                  "scale": 0,
                  "min": 0,
                  "typeDefaultValue": 0,
                  "type": "value",
                  "max": 100,
                  "step": 1
                }
              },
              "valveplan": {
                "name": "水阀工作计划",
                "typeSpec": {
                  "maxlen": 128,
                  "type": "string",
                  "typeDefaultValue": ""
                }
              }
            }
          },
          "accessMode": "wr",
          "abilityId": 113
        },
        {
          "code": "DelMainValvePlan",
          "typeSpec": {
            "maxlen": 256,
            "type": "string",
            "typeDefaultValue": ""
          },
          "accessMode": "wr",
          "abilityId": 114
        }
      ],
      "events": [
        {
          "abilityId": 116,
          "outputParams": [
            {
              "typeSpec": {
                "maxlen": 1024,
                "type": "string",
                "typeDefaultValue": ""
              },
              "code": "outputparam1"
            },
            {
              "typeSpec": {
                "maxlen": 1024,
                "type": "string",
                "typeDefaultValue": ""
              },
              "code": "outputparam2"
            }
          ],
          "code": "testEvent"
        }
      ]
    }
  ]
}
```
### device.offReceivedThingModelMessage

#### 功能描述

移除监听：接收物模型消息事件。只有 subscribeReceivedThingModelMessage 订阅了，才会收到该事件。

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offReceivedThingModelMessage } = device
offReceivedThingModelMessage({ ... })
```

**原生小程序中使用**

```javascript
const { offReceivedThingModelMessage } = ty.device
offReceivedThingModelMessage({ ... })
```

#### 参数

**function listener**

onReceivedThingModelMessage 传入的监听函数。不传此参数则移除所有监听函数。
### device.onReceivedThingModelMessage

#### 功能描述

接收物模型消息事件。只有 subscribeReceivedThingModelMessage 订阅了，才会收到该事件。

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onReceivedThingModelMessage } = device
onReceivedThingModelMessage({ ... })
```

**原生小程序中使用**

```javascript
const { onReceivedThingModelMessage } = ty.device
onReceivedThingModelMessage({ ... })
```

#### 体验 Demo

#### 参数

**function listener**
接收物模型消息事件。只有 subscribeReceivedThingModelMessage 订阅了，才会收到该事件。
**参数**

| 属性    | 类型   | 默认值 | 必填 | 说明                            |
| ------- | ------ | ------ | ---- | ------------------------------- |
| type    | number |        | 是   | 类型
0:属性, 1:动作, 2:事件 |
| payload | any    |        | 是   | payload                         |

#### 代码示例

##### 请求示例

```jsx | pure
// Ray调用方式
import {
  onReceivedThingModelMessage,
  getLaunchOptionsSync,
  subscribeReceivedThingModelMessage
} from '@ray-js/ray';
// 原生调用方式
const { onReceivedThingModelMessage, subscribeReceivedThingModelMessage } =
  ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onReceivedThingModelMessage = (event) => {
  console.log(event);
};

subscribeReceivedThingModelMessage({
  devId: deviceId,
  success: () => {
    console.log('subscribeReceivedThingModelMessage success');
  },
  fail: (error) => {
    console.log('subscribeReceivedThingModelMessage fail', error);
  }
});
onReceivedThingModelMessage(_onReceivedThingModelMessage);
```

##### 成功示例

```json
{
  "type": 0,
  "payload": {
    "SingleSwitch": {
      "value": {
        "valveid": 21,
        "valvestate": false
      },
      "time": 173227078407
    }
  }
}
```
### device.publishThingModelMessage

#### 功能描述

通过物模型投递消息

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishThingModelMessage } = device
publishThingModelMessage({ ... })
```

**原生小程序中使用**

```javascript
const { publishThingModelMessage } = ty.device
publishThingModelMessage({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                                                                                        |
| -------- | -------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devId    | string   |        | 是   | 设备 id                                                                                                                                                                                                                                                                     |
| type     | number   |        | 是   | 类型
0:属性, 1:动作, 2:事件                                                                                                                                                                                                                                             |
| payload  | any      |        | 是   | Example:
type == property:
 payload = \{
 "color":"green",
 "brightness": 50
 \}
type == action:
 payload = \{
 "actionCode": "testAction",
 "inputParams": \{
 "inputParam1":"value1",
 "inputParam2":"value2"
 \}
 \} |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                                      |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                                      |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                                            |

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
import { publishThingModelMessage, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishThingModelMessage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

publishThingModelMessage({
  deviceId,
  type: 1,
  payload: {
    key: 'value'
  },
  success: () => {
    console.log('publishThingModelMessage success');
  },
  fail: (error) => {
    console.log('publishThingModelMessage fail', error);
  }
});
```
### device.subscribeReceivedThingModelMessage

#### 功能描述

订阅接受物模型消息。订阅之后才可以接收到 onReceivedThingModelMessage 事件。

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { subscribeReceivedThingModelMessage } = device
subscribeReceivedThingModelMessage({ ... })
```

**原生小程序中使用**

```javascript
const { subscribeReceivedThingModelMessage } = ty.device
subscribeReceivedThingModelMessage({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| devId    | string   |        | 是   | 设备 id                                          |
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
  subscribeReceivedThingModelMessage,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { subscribeReceivedThingModelMessage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

subscribeReceivedThingModelMessage({
  devId: deviceId,
  success: () => {
    console.log('subscribeReceivedThingModelMessage success');
  },
  fail: (error) => {
    console.log('subscribeReceivedThingModelMessage fail', error);
  }
});
```
### device.unSubscribeReceivedThingModelMessage

#### 功能描述

取消订阅接收物模型消息。取消订阅之后接收不到 onReceivedThingModelMessage 事件。

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unSubscribeReceivedThingModelMessage } = device
unSubscribeReceivedThingModelMessage({ ... })
```

**原生小程序中使用**

```javascript
const { unSubscribeReceivedThingModelMessage } = ty.device
unSubscribeReceivedThingModelMessage({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| devId    | string   |        | 是   | 设备 id                                          |
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
  unSubscribeReceivedThingModelMessage,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { unSubscribeReceivedThingModelMessage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

unSubscribeReceivedThingModelMessage({
  devId: deviceId,
  success: () => {
    console.log('unSubscribeReceivedThingModelMessage success');
  },
  fail: (error) => {
    console.log('unSubscribeReceivedThingModelMessage fail', error);
  }
});
```
### device.updateDeviceThingModelInfo

#### 功能描述

更新物模型信息

> 需引入`DeviceKit`，且在`>=2.0.7`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { updateDeviceThingModelInfo } = device
updateDeviceThingModelInfo({ ... })
```

**原生小程序中使用**

```javascript
const { updateDeviceThingModelInfo } = ty.device
updateDeviceThingModelInfo({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性           | 类型     | 默认值 | 必填 | 说明                                             |
| -------------- | -------- | ------ | ---- | ------------------------------------------------ |
| pid            | string   |        | 是   | 产品 id                                          |
| productVersion | string   |        | 是   | 产品版本号                                       |
| success        | function |        | 否   | 接口调用成功的回调函数                           |
| fail           | function |        | 否   | 接口调用失败的回调函数                           |
| complete       | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

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
import { updateDeviceThingModelInfo } from '@ray-js/ray';
// 原生调用方式
const { updateDeviceThingModelInfo } = ty.device;

updateDeviceThingModelInfo({
  pid: 'product id',
  productVersion: '1.0.0'
  success: () => {
    console.log('updateDeviceThingModelInfo success');
  },
  fail: error => {
    console.log('updateDeviceThingModelInfo fail', error);
  },
})
```
### device.validDeviceOnlineType

#### 功能描述

判断设备上网类型是否与 deviceModel 物模型一致

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

#### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { validDeviceOnlineType } = device
validDeviceOnlineType({ ... })
```

**原生小程序中使用**

```javascript
const { validDeviceOnlineType } = ty.device
validDeviceOnlineType({ ... })
```

#### 体验 Demo

#### 请求参数

**Object object**

| 属性       | 类型     | 默认值 | 必填 | 说明                                                                                                                                      |
| ---------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| deviceId   | string   |        | 是   | 设备 id                                                                                                                                   |
| onlineType | number   |        | 是   | 设备在线类型，
Wi-Fi online 1 \<\< 0
Local online 1 \<\< 1
Bluetooth LE online 1 \<\< 2
Bluetooth LE mesh online 1 \<\< 3 |
| success    | function |        | 否   | 接口调用成功的回调函数                                                                                                                    |
| fail       | function |        | 否   | 接口调用失败的回调函数                                                                                                                    |
| complete   | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                          |

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
import { validDeviceOnlineType, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { validDeviceOnlineType } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

validDeviceOnlineType({
  deviceId,
  onlineType: 1,
  success: (signal) => {
    console.log('validDeviceOnlineType success', signal);
  },
  fail: (error) => {
    console.log('validDeviceOnlineType fail', error);
  }
});
```

##### 成功示例

```json
true
```
