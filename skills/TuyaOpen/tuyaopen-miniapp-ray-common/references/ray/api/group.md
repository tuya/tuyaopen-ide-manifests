## 群组

设备群组由同一种类型设备组成，是一系列设备的集合。常见的有 Wi-Fi 设备群组和 Zigbee 设备群组。涂鸦支持群组管理体系，您可以创建群组、修改群组名称、管理群组设备，通过群组管理多个设备，解散群组。

    查看群组信息及管理教程


## 普通群组


### 群组控制

###### updateGroupDpName

 更新群组设备 DP 名称。

**请求参数**

| 参数    | 数据类型 | 说明        | 是否必填 |
| ------- | -------- | ----------- | -------- |
| groupId | String   | 群组 ID     | 是       |
| dpId    | String   | DP ID       | 是       |
| name    | String   | DP 自定义名 | 是       |

**返回参数**

| 参数     | 数据类型 | 说明                         |
| -------- | -------- | ---------------------------- |
| response | Boolean  | 是否成功更新群组设备 DP 名称 |

**请求示例**

```javascript
import { updateGroupDpName } from '@ray-js/ray';

updateGroupDpName({
  groupId: '1',
  dpId: '20',
  name: 'switch_led',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```javascript
true;
```
###### device.publishGroupDps

###### 功能描述

群组控制

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishGroupDps } = device
publishGroupDps({ ... })
```

**原生小程序中使用**

```javascript
const { publishGroupDps } = ty.device
publishGroupDps({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | groupId 群组 id                                  |
| dps      | object   |        | 是   | dp 信息
示例: dps: \{"1" : true\}            |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { publishGroupDps, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { publishGroupDps } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

publishGroupDps({
  groupId,
  dps: {
    1: true
  },
  success: () => {
    console.log('publishGroupDps success');
  },
  fail: (error) => {
    console.log('publishGroupDps fail', error);
  }
});
```
###### device.registerGroupChange

###### 功能描述

开启对群组事件的监听

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerGroupChange } = device
registerGroupChange({ ... })
```

**原生小程序中使用**

```javascript
const { registerGroupChange } = ty.device
registerGroupChange({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupIdList | string[] |        | 是   | groupIdList 群组 id 列表                         |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { registerGroupChange, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { registerGroupChange } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

registerGroupChange({
  groupIdList: [groupId],
  success: () => {
    console.log('registerGroupChange success');
  },
  fail: (error) => {
    console.log('registerGroupChange fail', error);
  }
});
```
###### device.unRegisterGroupChange

###### 功能描述

关闭对群组事件的监听

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unRegisterGroupChange } = device
unRegisterGroupChange({ ... })
```

**原生小程序中使用**

```javascript
const { unRegisterGroupChange } = ty.device
unRegisterGroupChange({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { unRegisterGroupChange } from '@ray-js/ray';
// 原生调用方式
const { unRegisterGroupChange } = ty.device;

unRegisterGroupChange({
  success: () => {
    console.log('unRegisterGroupChange success');
  },
  fail: (error) => {
    console.log('unRegisterGroupChange fail', error);
  }
});
```
###### device.onGroupDpDataChangeEvent

###### 功能描述

群组 DP 变更事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onGroupDpDataChangeEvent } = device
onGroupDpDataChangeEvent({ ... })
```

**原生小程序中使用**

```javascript
const { onGroupDpDataChangeEvent } = ty.device
onGroupDpDataChangeEvent({ ... })
```

###### 体验 Demo

###### 参数

**function listener**
群组 DP 变更事件
**参数**

| 属性    | 类型   | 默认值 | 必填 | 说明                                  |
| ------- | ------ | ------ | ---- | ------------------------------------- |
| groupId | string |        | 是   | groupId 群组 id                       |
| dps     | object |        | 是   | dp 信息
示例: dps: \{"1" : true\} |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onGroupDpDataChangeEvent,
  getLaunchOptionsSync,
  registerGroupChange
} from '@ray-js/ray';
// 原生调用方式
const { onGroupDpDataChangeEvent, registerGroupChange } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

const _onGroupDpDataChangeEvent = (event) => {
  console.log(event);
};

registerGroupChange({
  groupIdList: [groupId],
  success: () => {
    console.log('registerGroupChange success');
  },
  fail: (error) => {
    console.log('registerGroupChange fail', error);
  }
});
onGroupDpDataChangeEvent(_onGroupDpDataChangeEvent);
```

###### 成功示例

```json
{
  "groupId": "xxxxx",
  "dps": {
    "1": true
  }
}
```

###### 常见问题

###### Q：为什么调用了 onGroupDpDataChangeEvent 之后，无法收到消息？

A：需要先调用 registerGroupChange 注册群组监听器，才能收到群组相关消息。
###### device.offGroupDpDataChangeEvent

###### 功能描述

移除监听：群组 DP 变更事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offGroupDpDataChangeEvent } = device
offGroupDpDataChangeEvent({ ... })
```

**原生小程序中使用**

```javascript
const { offGroupDpDataChangeEvent } = ty.device
offGroupDpDataChangeEvent({ ... })
```

###### 参数

**function listener**

onGroupDpDataChangeEvent 传入的监听函数。不传此参数则移除所有监听函数。
###### device.offGroupDpCodeChange

###### 功能描述

移除监听：群组 dpCode 变化事件

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offGroupDpCodeChange } = device
offGroupDpCodeChange({ ... })
```

**原生小程序中使用**

```javascript
const { offGroupDpCodeChange } = ty.device
offGroupDpCodeChange({ ... })
```

###### 参数

**function listener**

onGroupDpCodeChange 传入的监听函数。不传此参数则移除所有监听函数。
###### device.onGroupDpCodeChange

###### 功能描述

群组 dpCode 变化事件

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onGroupDpCodeChange } = device
onGroupDpCodeChange({ ... })
```

**原生小程序中使用**

```javascript
const { onGroupDpCodeChange } = ty.device
onGroupDpCodeChange({ ... })
```

###### 参数

**function listener**
群组 dpCode 变化事件
**参数**

| 属性    | 类型   | 默认值 | 必填 | 说明                                           |
| ------- | ------ | ------ | ---- | ---------------------------------------------- |
| groupId | string |        | 是   | groupId 群组 id                                |
| dpCodes | any    |        | 是   | dp 信息
示例: dpCodes: \{"switch" : true\} |
###### device.publishGroupDpCodes

###### 功能描述

通过 dpCode 下发控制指令

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { publishGroupDpCodes } = device
publishGroupDpCodes({ ... })
```

**原生小程序中使用**

```javascript
const { publishGroupDpCodes } = ty.device
publishGroupDpCodes({ ... })
```

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | groupId 群组 id                                  |
| dpCodes  | any      |        | 是   | dp 信息
示例: dpCodes: \{"switch" : true\}   |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 错误码

| 错误码 | 错误描述                 |
| ------ | ------------------------ |
| 20002  | GroupId is invalid       |
| 20064  | Group model is null      |
| 20066  | Publish group dps failed |

### 群组信息

###### getGroupDpsInfos

 获取群组设备所有 DP 信息，通常用于获取群组设备 DP 名称，配合 updateGroupDpName 使用。

<Alert type="warning">
返回的 dpInfo 中的 value 为原始数据，如 raw 类型的 DP，value 的值位 base64 编码字符串，需要开发者自行解析，非必需场景请使用 getGroupInfo 接口获取群组信息。
</Alert>

**请求参数**

| 参数    | 数据类型 | 说明    | 是否必填 |
| ------- | -------- | ------- | -------- |
| groupId | String   | 群组 ID | 是       |

**返回参数**

| 参数  | 数据类型 | 说明            |
| ----- | -------- | --------------- |
| code  | String   | DP Code         |
| dpId  | Number   | DP ID           |
| value | String   | DP 值           |
| name  | String   | DP 名称         |
| time  | Number   | DP 最近上报时间 |
| type  | String   | DP 类型         |

**请求示例**

```javascript
import { getGroupDpsInfos } from '@ray-js/ray';

getGroupDpsInfos('1')
  .then((response) => {
    console.log(response);
  })
  .catch();
```

**返回示例**

```javascript
{
    {
      "code": "switch_spray",
      "dpId": 1,
      "value": "true",
      "name": "",
      "time": 1572338762533,
      "type": "bool"
    },
    {
      "code": "mode",
      "dpId": 2,
      "value": "large",
      "name": "",
      "time": 1572333409976,
      "type": "enum"
    },
}
```
###### device.getGroupDeviceList

###### 功能描述

获取群组下设备列表

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getGroupDeviceList } = device
getGroupDeviceList({ ... })
```

**原生小程序中使用**

```javascript
const { getGroupDeviceList } = ty.device
getGroupDeviceList({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | 群组 id                                          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

| 属性       | 类型         | 说明                |
| ---------- | ------------ | ------------------- |
| groupId    | string       | groupId 群组 id     |
| deviceList | DeviceInfo[] | deviceList 设备列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 引用对象

**DeviceInfo**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                         |
| ---------------- | -------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema           | object[] |        | 是   | 产品信息，schema，功能定义都在里面                                                                                                                                           |
| dps              | any      |        | 是   | dps
设备的功能点状态，可以根据对应的 dpid 拿到具体的状态值去做业务逻辑                                                                                                   |
| attribute        | number   |        | 是   | attribute
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                                               |
| capability       | number   |        | 是   | capability
产品能力值，在 backend-ng 平台上可以查询对应的勾选项，整体业务逻辑会根据该数据进行划分
区分设备类型也可以根据该属性进行调整，按二进制位运算的方式进行管理 |
| dpName           | any      |        | 是   | dpName
自定义 dp 的名字，通常在面板里会使用到                                                                                                                            |
| ability          | number   |        | 是   | ability
目前业务很少使用，用于区分特殊类型的设备                                                                                                                         |
| icon             | string   |        | 是   | icon
设备的 icon url                                                                                                                                                     |
| devId            | string   |        | 是   | devId
设备的唯一 id                                                                                                                                                      |
| verSw            | string   |        | 是   | verSw
设备固件版本号                                                                                                                                                     |
| isShare          | boolean  |        | 是   | isShare
是否为分享设备，true 则是分享设备                                                                                                                                |
| bv               | string   |        | 是   | bv
设备的基线版本号                                                                                                                                                      |
| uuid             | string   |        | 是   | uuid
设备的固件唯一标识                                                                                                                                                  |
| panelConfig      | any      |        | 是   | panelConfig
产品面板里的配置项，通常在 IoT 平台上可以查看到对应的配置                                                                                                    |
| activeTime       | number   |        | 是   | activeTime
设备激活时间，时间戳                                                                                                                                          |
| devAttribute     | number   |        | 是   | devAttribute
设备的业务能力拓展，二进制位的方式进行运算                                                                                                                  |
| pcc              | string   |        | 是   | pcc
Thing 自研蓝牙 mesh 产品的分类标识                                                                                                                                   |
| nodeId           | string   |        | 是   | nodeId
子设备的短地址                                                                                                                                                    |
| parentId         | string   |        | 是   | parentId
上级节点 id，子设备/或蓝牙 mesh 设备通常会有该字段，用于内部寻找相关的网关或上级模型来进行业务处理                                                              |
| category         | string   |        | 是   | category
产品的分类                                                                                                                                                      |
| standSchemaModel | object   |        | 是   | standSchemaModel
标准产品功能集定义模型                                                                                                                                  |
| productId        | string   |        | 是   | productId
设备对应的产品 id                                                                                                                                              |
| bizAttribute     | number   |        | 是   | bizAttribute
设备自主上报的能力位                                                                                                                                        |
| meshId           | string   |        | 是   | meshId
Thing 自研的蓝牙 mesh id                                                                                                                                          |
| sigmeshId        | string   |        | 是   | sigmeshId
当前设备所属行业属性对应的蓝牙 mesh id                                                                                                                         |
| meta             | any      |        | 是   | meta
设备自定义配置元属性，用于存放业务数据                                                                                                                              |
| isLocalOnline    | boolean  |        | 是   | isLocalOnline
本地局域网是否在线                                                                                                                                         |
| isOnline         | boolean  |        | 是   | isOnline
设备总的在线情况，只要一个情况在线，就是在线，复合在线情况                                                                                                      |
| name             | string   |        | 是   | name
设备名称                                                                                                                                                            |
| groupId          | string   |        | 是   | groupId                                                                                                                                                                      |
| dpCodes          | any      |        | 是   | dpCodes
标准功能集 code                                                                                                                                                  |
| originJson       | any      |        | 是   | 原始 json，业务来不及拓展更新的时候，可以根据这个来获取处理                                                                                                                  |
| dpsTime          | object   |        | 是   | dpsTime
设备 DP 的执行时间                                                                                                                                               |
| secCategory      | string   |        | 是   | secCategory
二级品类                                                                                                                                                     |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getGroupDeviceList, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getGroupDeviceList } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

getGroupDeviceList({
  groupId,
  success: (info) => {
    console.log('getGroupDeviceList success', info);
  },
  fail: (error) => {
    console.log('getGroupDeviceList fail', error);
  }
});
```

###### 成功示例

```json
{
  "groupId": "14311177",
  "deviceList": [
    {
      "isOnline": true,
      "pcc": "",
      "dpsTime": {
        "1": 1732255620348,
        "9": 1728955368266,
        "38": 1728955368305,
        "40": 1730180105406,
        "41": 1728955368301,
        "42": 1728955368294,
        "43": 1728955368289,
        "44": 1728955368297
      },
      "icon": "https://xxx.png",
      "dps": {
        "1": true,
        "9": 0,
        "38": "memory",
        "40": "relay",
        "41": false,
        "42": "",
        "43": "",
        "44": ""
      },
      "uuid": "xxx",
      "attribute": 5239862919556,
      "category": "cz",
      "activeTime": 1726719704,
      "name": "插座",
      "productId": "ayfwvaumuyxthuy9",
      "bv": "40",
      "devId": "xxx",
      "bizAttribute": 0,
      "meshId": "xxx",
      "dpName": {},
      "devAttribute": 515,
      "schema": [
        {
          "id": 1,
          "code": "switch_1",
          "mode": "rw",
          "property": {
            "type": "bool"
          },
          "iconname": "icon-dp_power2",
          "type": "obj",
          "name": "开关1"
        },
        {
          "id": 9,
          "code": "countdown_1",
          "mode": "rw",
          "property": {
            "unit": "s",
            "min": 0,
            "scale": 0,
            "step": 1,
            "type": "value",
            "max": 86400
          },
          "iconname": "icon-dp_time2",
          "type": "obj",
          "name": "开关1倒计时"
        },
        {
          "id": 38,
          "code": "relay_status",
          "mode": "rw",
          "property": {
            "range": ["off", "on", "memory"],
            "type": "enum"
          },
          "iconname": "icon-dp_battery",
          "type": "obj",
          "name": "上电状态设置"
        },
        {
          "id": 40,
          "code": "light_mode",
          "mode": "rw",
          "property": {
            "range": ["relay", "pos", "none"],
            "type": "enum"
          },
          "iconname": "icon-deng",
          "type": "obj",
          "name": "指示灯模式"
        },
        {
          "id": 41,
          "code": "child_lock",
          "mode": "rw",
          "property": {
            "type": "bool"
          },
          "iconname": "icon-dp_power",
          "type": "obj",
          "name": "童锁"
        },
        {
          "id": 42,
          "code": "cycle_time",
          "mode": "rw",
          "property": {
            "type": "string",
            "maxlen": 255
          },
          "iconname": "icon-dp_loop",
          "type": "obj",
          "name": "循环定时"
        },
        {
          "id": 43,
          "code": "random_time",
          "mode": "rw",
          "property": {
            "type": "string",
            "maxlen": 255
          },
          "iconname": "icon-dp_circle",
          "type": "obj",
          "name": "随机定时"
        },
        {
          "id": 44,
          "code": "switch_inching",
          "mode": "rw",
          "property": {
            "type": "string",
            "maxlen": 255
          },
          "iconname": "icon-dp_circle",
          "type": "obj",
          "name": "点动开关"
        }
      ],
      "ability": 5,
      "sigmeshId": "xxx",
      "meta": {},
      "verSw": "1.1.8",
      "dpCodes": {
        "random_time": "",
        "countdown_1": 0,
        "switch_1": true,
        "light_mode": "relay",
        "relay_status": "last",
        "switch_inching": "",
        "cycle_time": "",
        "child_lock": false
      },
      "isLocalOnline": false,
      "capability": 1025,
      "isShare": false
    }
  ]
}
```

###### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 20002  | GroupId is invalid |
###### device.getGroupDeviceNum

###### 功能描述

获取群组下设备数量

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getGroupDeviceNum } = device
getGroupDeviceNum({ ... })
```

**原生小程序中使用**

```javascript
const { getGroupDeviceNum } = ty.device
getGroupDeviceNum({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | 群组 id                                          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

| 属性      | 类型   | 说明               |
| --------- | ------ | ------------------ |
| groupId   | string | groupId 群组 id    |
| deviceNum | number | deviceNum 设备数量 |
| devieNum  | number |                    |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getGroupDeviceNum, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getGroupDeviceNum } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

getGroupDeviceNum({
  groupId,
  success: (info) => {
    console.log('getGroupDeviceNum success', info);
  },
  fail: (error) => {
    console.log('getGroupDeviceNum fail', error);
  }
});
```

###### 成功示例

```json
{
  "deviceNum": 2
}
```

###### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 20002  | GroupId is invalid |
###### device.getGroupInfo

###### 功能描述

获取 group 信息

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getGroupInfo } = device
getGroupInfo({ ... })
```

**原生小程序中使用**

```javascript
const { getGroupInfo } = ty.device
getGroupInfo({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | 群组 id                                          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

| 属性        | 类型         | 说明                                                                                     |
| ----------- | ------------ | ---------------------------------------------------------------------------------------- |
| groupId     | string       | groupId
The group ID.                                                                |
| productId   | string       | productId
The product ID.                                                            |
| name        | string       | name
The name of the group.                                                          |
| time        | number       | time
The time when the group was created.                                            |
| iconUrl     | string       | iconUrl
The URL of the icon.                                                         |
| type        | number       | type
The type of group.
Wifi = 0, Mesh = 1, Zigbee = 2, SIGMesh = 3, Beacon = 4, |
| isShare     | boolean      | isShare                                                                                  |
| dps         | object       | dps                                                                                      |
| dpCodes     | object       | dpCodes                                                                                  |
| deviceNum   | number       | deviceNum
The number of devices,                                                     |
| localKey    | string       | localKey
The local key.                                                              |
| pv          | number       | The protocol version.                                                                    |
| productInfo | object       | The product information.                                                                 |
| dpName      | object       | The custom DP name.                                                                      |
| deviceList  | DeviceInfo[] | The device list.                                                                         |
| localId     | string       | The local short address of groups.                                                       |
| pcc         | string       | The subclass.                                                                            |
| meshId      | string       | The mesh ID or gateway ID.                                                               |
| groupKey    | string       | Add the beacon beaconKey.                                                                |
| schema      | object[]     | The schema array.                                                                        |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 引用对象

**DeviceInfo**

| 属性             | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                         |
| ---------------- | -------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema           | object[] |        | 是   | 产品信息，schema，功能定义都在里面                                                                                                                                           |
| dps              | any      |        | 是   | dps
设备的功能点状态，可以根据对应的 dpid 拿到具体的状态值去做业务逻辑                                                                                                   |
| attribute        | number   |        | 是   | attribute
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                                               |
| capability       | number   |        | 是   | capability
产品能力值，在 backend-ng 平台上可以查询对应的勾选项，整体业务逻辑会根据该数据进行划分
区分设备类型也可以根据该属性进行调整，按二进制位运算的方式进行管理 |
| dpName           | any      |        | 是   | dpName
自定义 dp 的名字，通常在面板里会使用到                                                                                                                            |
| ability          | number   |        | 是   | ability
目前业务很少使用，用于区分特殊类型的设备                                                                                                                         |
| icon             | string   |        | 是   | icon
设备的 icon url                                                                                                                                                     |
| devId            | string   |        | 是   | devId
设备的唯一 id                                                                                                                                                      |
| verSw            | string   |        | 是   | verSw
设备固件版本号                                                                                                                                                     |
| isShare          | boolean  |        | 是   | isShare
是否为分享设备，true 则是分享设备                                                                                                                                |
| bv               | string   |        | 是   | bv
设备的基线版本号                                                                                                                                                      |
| uuid             | string   |        | 是   | uuid
设备的固件唯一标识                                                                                                                                                  |
| panelConfig      | any      |        | 是   | panelConfig
产品面板里的配置项，通常在 IoT 平台上可以查看到对应的配置                                                                                                    |
| activeTime       | number   |        | 是   | activeTime
设备激活时间，时间戳                                                                                                                                          |
| devAttribute     | number   |        | 是   | devAttribute
设备的业务能力拓展，二进制位的方式进行运算                                                                                                                  |
| pcc              | string   |        | 是   | pcc
Thing 自研蓝牙 mesh 产品的分类标识                                                                                                                                   |
| nodeId           | string   |        | 是   | nodeId
子设备的短地址                                                                                                                                                    |
| parentId         | string   |        | 是   | parentId
上级节点 id，子设备/或蓝牙 mesh 设备通常会有该字段，用于内部寻找相关的网关或上级模型来进行业务处理                                                              |
| category         | string   |        | 是   | category
产品的分类                                                                                                                                                      |
| standSchemaModel | object   |        | 是   | standSchemaModel
标准产品功能集定义模型                                                                                                                                  |
| productId        | string   |        | 是   | productId
设备对应的产品 id                                                                                                                                              |
| bizAttribute     | number   |        | 是   | bizAttribute
设备自主上报的能力位                                                                                                                                        |
| meshId           | string   |        | 是   | meshId
Thing 自研的蓝牙 mesh id                                                                                                                                          |
| sigmeshId        | string   |        | 是   | sigmeshId
当前设备所属行业属性对应的蓝牙 mesh id                                                                                                                         |
| meta             | any      |        | 是   | meta
设备自定义配置元属性，用于存放业务数据                                                                                                                              |
| isLocalOnline    | boolean  |        | 是   | isLocalOnline
本地局域网是否在线                                                                                                                                         |
| isOnline         | boolean  |        | 是   | isOnline
设备总的在线情况，只要一个情况在线，就是在线，复合在线情况                                                                                                      |
| name             | string   |        | 是   | name
设备名称                                                                                                                                                            |
| groupId          | string   |        | 是   | groupId                                                                                                                                                                      |
| dpCodes          | any      |        | 是   | dpCodes
标准功能集 code                                                                                                                                                  |
| originJson       | any      |        | 是   | 原始 json，业务来不及拓展更新的时候，可以根据这个来获取处理                                                                                                                  |
| dpsTime          | object   |        | 是   | dpsTime
设备 DP 的执行时间                                                                                                                                               |
| secCategory      | string   |        | 是   | secCategory
二级品类                                                                                                                                                     |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getGroupInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getGroupInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

getGroupInfo({
  groupId,
  success: (info) => {
    console.log('getGroupInfo success', info);
  },
  fail: (error) => {
    console.log('getGroupInfo fail', error);
  }
});
```

###### 成功示例

```json
{
  "localKey": "57d9bd7a69209b30",
  "productInfo": {
    "id": "xxx",
    "category": "cz",
    "attribute": 5239862919556,
    "productVer": "1.0.0",
    "configMetas": {},
    "capability": 1025,
    "schemaInfo": {
      "schema": "[{\"code\":\"switch_1\",\"iconname\":\"icon-dp_power2\",\"id\":1,\"mode\":\"rw\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"type\":\"obj\"},{\"code\":\"countdown_1\",\"iconname\":\"icon-dp_time2\",\"id\":9,\"mode\":\"rw\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"type\":\"obj\"},{\"code\":\"relay_status\",\"iconname\":\"icon-dp_battery\",\"id\":38,\"mode\":\"rw\",\"name\":\"上电状态设置\",\"property\":{\"range\":[\"off\",\"on\",\"memory\"],\"type\":\"enum\"},\"type\":\"obj\"},{\"code\":\"light_mode\",\"iconname\":\"icon-deng\",\"id\":40,\"mode\":\"rw\",\"name\":\"指示灯模式\",\"property\":{\"range\":[\"relay\",\"pos\",\"none\"],\"type\":\"enum\"},\"type\":\"obj\"},{\"code\":\"child_lock\",\"iconname\":\"icon-dp_power\",\"id\":41,\"mode\":\"rw\",\"name\":\"童锁\",\"property\":{\"type\":\"bool\"},\"type\":\"obj\"},{\"code\":\"cycle_time\",\"iconname\":\"icon-dp_loop\",\"id\":42,\"mode\":\"rw\",\"name\":\"循环定时\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"type\":\"obj\"},{\"code\":\"random_time\",\"iconname\":\"icon-dp_circle\",\"id\":43,\"mode\":\"rw\",\"name\":\"随机定时\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"type\":\"obj\"},{\"code\":\"switch_inching\",\"iconname\":\"icon-dp_circle\",\"id\":44,\"mode\":\"rw\",\"name\":\"点动开关\",\"property\":{\"type\":\"string\",\"maxlen\":255},\"type\":\"obj\"}]",
      "schemaExt": "[]"
    },
    "meshCategory": "",
    "sSchema": {
      "statusSchemaList": [
        {
          "dpType": "Boolean",
          "dpCode": "switch_1",
          "strategyValue": "{\"switch_1\":\"$\"}",
          "standardType": "Boolean",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "switch_1": 1
          },
          "standardCode": "switch_1"
        },
        {
          "dpType": "Integer",
          "dpCode": "countdown_1",
          "strategyValue": "{\"countdown_1\":\"$\"}",
          "standardType": "Integer",
          "strategyCode": "default",
          "valueRange": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}",
          "relationDpIdMaps": {
            "countdown_1": 9
          },
          "standardCode": "countdown_1"
        },
        {
          "dpType": "Enum",
          "dpCode": "relay_status",
          "strategyValue": "{\"relay_status\":\"{\\\"0\\\":\\\"power_off\\\",\\\"1\\\":\\\"power_on\\\",\\\"2\\\":\\\"last\\\",\\\"memory\\\":\\\"last\\\",\\\"off\\\":\\\"power_off\\\",\\\"on\\\":\\\"power_on\\\"}\"}",
          "standardType": "Enum",
          "strategyCode": "enum",
          "valueRange": "{\"range\":[\"power_off\",\"power_on\",\"last\"]}",
          "relationDpIdMaps": {
            "relay_status": 38
          },
          "standardCode": "relay_status"
        },
        {
          "dpType": "Enum",
          "dpCode": "light_mode",
          "strategyValue": "{\"light_mode\":\"$\"}",
          "standardType": "Enum",
          "strategyCode": "default",
          "valueRange": "{\"range\":[\"relay\",\"pos\",\"none\"]}",
          "relationDpIdMaps": {
            "light_mode": 40
          },
          "standardCode": "light_mode"
        },
        {
          "dpType": "Boolean",
          "dpCode": "child_lock",
          "strategyValue": "{\"child_lock\":\"$\"}",
          "standardType": "Boolean",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "child_lock": 41
          },
          "standardCode": "child_lock"
        },
        {
          "dpType": "String",
          "dpCode": "cycle_time",
          "strategyValue": "{\"cycle_time\":\"$\"}",
          "standardType": "String",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "cycle_time": 42
          },
          "standardCode": "cycle_time"
        },
        {
          "dpType": "String",
          "dpCode": "random_time",
          "strategyValue": "{\"random_time\":\"$\"}",
          "standardType": "String",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "random_time": 43
          },
          "standardCode": "random_time"
        },
        {
          "dpType": "String",
          "dpCode": "switch_inching",
          "strategyValue": "{\"switch_inching\":\"$\"}",
          "standardType": "String",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "switch_inching": 44
          },
          "standardCode": "switch_inching"
        }
      ],
      "functionSchemaList": [
        {
          "mainDpCode": "switch_1",
          "strategyValue": "{\"switch_1\":\"$\"}",
          "mainDpType": "Boolean",
          "standardType": "Boolean",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "switch_1": 1
          },
          "standardCode": "switch_1"
        },
        {
          "mainDpCode": "countdown_1",
          "strategyValue": "{\"countdown_1\":\"$\"}",
          "mainDpType": "Integer",
          "standardType": "Integer",
          "strategyCode": "default",
          "valueRange": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}",
          "relationDpIdMaps": {
            "countdown_1": 9
          },
          "standardCode": "countdown_1"
        },
        {
          "mainDpCode": "relay_status",
          "strategyValue": "{\"relay_status\":\"{\\\"power_off\\\":\\\"off\\\",\\\"last\\\":\\\"memory\\\",\\\"power_on\\\":\\\"on\\\"}\"}",
          "mainDpType": "Enum",
          "standardType": "Enum",
          "strategyCode": "enum",
          "valueRange": "{\"range\":[\"power_off\",\"last\",\"power_on\"]}",
          "relationDpIdMaps": {
            "relay_status": 38
          },
          "standardCode": "relay_status"
        },
        {
          "mainDpCode": "light_mode",
          "strategyValue": "{\"light_mode\":\"$\"}",
          "mainDpType": "Enum",
          "standardType": "Enum",
          "strategyCode": "default",
          "valueRange": "{\"range\":[\"relay\",\"pos\",\"none\"]}",
          "relationDpIdMaps": {
            "light_mode": 40
          },
          "standardCode": "light_mode"
        },
        {
          "mainDpCode": "child_lock",
          "strategyValue": "{\"child_lock\":\"$\"}",
          "mainDpType": "Boolean",
          "standardType": "Boolean",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "child_lock": 41
          },
          "standardCode": "child_lock"
        },
        {
          "mainDpCode": "cycle_time",
          "strategyValue": "{\"cycle_time\":\"$\"}",
          "mainDpType": "String",
          "standardType": "String",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "cycle_time": 42
          },
          "standardCode": "cycle_time"
        },
        {
          "mainDpCode": "random_time",
          "strategyValue": "{\"random_time\":\"$\"}",
          "mainDpType": "String",
          "standardType": "String",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "random_time": 43
          },
          "standardCode": "random_time"
        },
        {
          "mainDpCode": "switch_inching",
          "strategyValue": "{\"switch_inching\":\"$\"}",
          "mainDpType": "String",
          "standardType": "String",
          "strategyCode": "default",
          "valueRange": "{}",
          "relationDpIdMaps": {
            "switch_inching": 44
          },
          "standardCode": "switch_inching"
        }
      ]
    },
    "supportSGroup": false,
    "shortcut": {
      "quickOpDps": [],
      "displayMsgs": {},
      "displayDps": [],
      "faultDps": [],
      "switchDps": []
    },
    "categoryCode": "wf_ble_cz",
    "bizAttribute": 0,
    "supportGroup": true
  },
  "pv": 2.2,
  "productId": "xxx",
  "schema": [
    {
      "id": "1",
      "code": "switch_1",
      "mode": "rw",
      "property": {
        "maxlen": 0,
        "selectedValue": 0,
        "min": 0,
        "scale": 0,
        "type": "bool",
        "max": 0,
        "step": 0,
        "maxSize": 0
      },
      "type": "obj",
      "iconname": "icon-dp_power2",
      "name": "开关1"
    },
    {
      "id": "9",
      "code": "countdown_1",
      "mode": "rw",
      "property": {
        "maxlen": 0,
        "selectedValue": 0,
        "min": 0,
        "scale": 0,
        "unit": "s",
        "type": "value",
        "max": 86400,
        "step": 1,
        "maxSize": 0
      },
      "type": "obj",
      "iconname": "icon-dp_time2",
      "name": "开关1倒计时"
    },
    {
      "id": "38",
      "code": "relay_status",
      "mode": "rw",
      "property": {
        "maxlen": 0,
        "selectedValue": 0,
        "min": 0,
        "maxSize": 0,
        "range": ["off", "on", "memory"],
        "type": "enum",
        "max": 0,
        "step": 0,
        "scale": 0
      },
      "type": "obj",
      "iconname": "icon-dp_battery",
      "name": "上电状态设置"
    },
    {
      "id": "40",
      "code": "light_mode",
      "mode": "rw",
      "property": {
        "maxlen": 0,
        "selectedValue": 0,
        "min": 0,
        "maxSize": 0,
        "range": ["relay", "pos", "none"],
        "type": "enum",
        "max": 0,
        "step": 0,
        "scale": 0
      },
      "type": "obj",
      "iconname": "icon-deng",
      "name": "指示灯模式"
    },
    {
      "id": "41",
      "code": "child_lock",
      "mode": "rw",
      "property": {
        "maxlen": 0,
        "selectedValue": 0,
        "min": 0,
        "scale": 0,
        "type": "bool",
        "max": 0,
        "step": 0,
        "maxSize": 0
      },
      "type": "obj",
      "iconname": "icon-dp_power",
      "name": "童锁"
    },
    {
      "id": "42",
      "code": "cycle_time",
      "mode": "rw",
      "property": {
        "maxlen": 255,
        "selectedValue": 0,
        "min": 0,
        "scale": 0,
        "type": "string",
        "max": 0,
        "step": 0,
        "maxSize": 0
      },
      "type": "obj",
      "iconname": "icon-dp_loop",
      "name": "循环定时"
    },
    {
      "id": "43",
      "code": "random_time",
      "mode": "rw",
      "property": {
        "maxlen": 255,
        "selectedValue": 0,
        "min": 0,
        "scale": 0,
        "type": "string",
        "max": 0,
        "step": 0,
        "maxSize": 0
      },
      "type": "obj",
      "iconname": "icon-dp_circle",
      "name": "随机定时"
    },
    {
      "id": "44",
      "code": "switch_inching",
      "mode": "rw",
      "property": {
        "maxlen": 255,
        "selectedValue": 0,
        "min": 0,
        "scale": 0,
        "type": "string",
        "max": 0,
        "step": 0,
        "maxSize": 0
      },
      "type": "obj",
      "iconname": "icon-dp_circle",
      "name": "点动开关"
    }
  ],
  "deviceNum": 1,
  "isShare": false,
  "type": 0,
  "time": 0,
  "dps": {
    "1": true,
    "9": 0,
    "38": "off",
    "40": "relay",
    "41": false,
    "42": "",
    "43": "",
    "44": ""
  },
  "deviceList": [
    {
      "isOnline": true,
      "pcc": "",
      "dpsTime": {
        "1": 1732255620348,
        "9": 1728955368266,
        "38": 1728955368305,
        "40": 1730180105406,
        "41": 1728955368301,
        "42": 1728955368294,
        "43": 1728955368289,
        "44": 1728955368297
      },
      "icon": "https://xx.png",
      "dps": {
        "1": true,
        "9": 0,
        "38": "memory",
        "40": "relay",
        "41": false,
        "42": "",
        "43": "",
        "44": ""
      },
      "uuid": "xxx",
      "attribute": 5239862919556,
      "category": "cz",
      "activeTime": 1726719704,
      "name": "插座",
      "productId": "xx",
      "bv": "40",
      "devId": "xxx",
      "bizAttribute": 0,
      "meshId": "xxx",
      "dpName": {},
      "devAttribute": 515,
      "schema": [
        {
          "id": 1,
          "code": "switch_1",
          "mode": "rw",
          "property": {
            "type": "bool"
          },
          "iconname": "icon-dp_power2",
          "type": "obj",
          "name": "开关1"
        },
        {
          "id": 9,
          "code": "countdown_1",
          "mode": "rw",
          "property": {
            "unit": "s",
            "min": 0,
            "scale": 0,
            "step": 1,
            "type": "value",
            "max": 86400
          },
          "iconname": "icon-dp_time2",
          "type": "obj",
          "name": "开关1倒计时"
        },
        {
          "id": 38,
          "code": "relay_status",
          "mode": "rw",
          "property": {
            "range": ["off", "on", "memory"],
            "type": "enum"
          },
          "iconname": "icon-dp_battery",
          "type": "obj",
          "name": "上电状态设置"
        },
        {
          "id": 40,
          "code": "light_mode",
          "mode": "rw",
          "property": {
            "range": ["relay", "pos", "none"],
            "type": "enum"
          },
          "iconname": "icon-deng",
          "type": "obj",
          "name": "指示灯模式"
        },
        {
          "id": 41,
          "code": "child_lock",
          "mode": "rw",
          "property": {
            "type": "bool"
          },
          "iconname": "icon-dp_power",
          "type": "obj",
          "name": "童锁"
        },
        {
          "id": 42,
          "code": "cycle_time",
          "mode": "rw",
          "property": {
            "type": "string",
            "maxlen": 255
          },
          "iconname": "icon-dp_loop",
          "type": "obj",
          "name": "循环定时"
        },
        {
          "id": 43,
          "code": "random_time",
          "mode": "rw",
          "property": {
            "type": "string",
            "maxlen": 255
          },
          "iconname": "icon-dp_circle",
          "type": "obj",
          "name": "随机定时"
        },
        {
          "id": 44,
          "code": "switch_inching",
          "mode": "rw",
          "property": {
            "type": "string",
            "maxlen": 255
          },
          "iconname": "icon-dp_circle",
          "type": "obj",
          "name": "点动开关"
        }
      ],
      "ability": 5,
      "sigmeshId": "xxx",
      "meta": {},
      "verSw": "1.1.8",
      "dpCodes": {
        "random_time": "",
        "countdown_1": 0,
        "switch_1": true,
        "light_mode": "relay",
        "relay_status": "last",
        "switch_inching": "",
        "cycle_time": "",
        "child_lock": false
      },
      "isLocalOnline": false,
      "capability": 1025,
      "isShare": false
    }
  ],
  "dpName": {
    "1": "",
    "9": "",
    "38": "",
    "40": "",
    "41": "",
    "42": "",
    "43": "",
    "44": ""
  },
  "iconUrl": "https://xx.png",
  "groupKey": "",
  "groupId": "14311177",
  "name": "插座群"
}
```
###### device.onGroupInfoChange

###### 功能描述

群组内增加/移除设备事件

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onGroupInfoChange } = device
onGroupInfoChange({ ... })
```

**原生小程序中使用**

```javascript
const { onGroupInfoChange } = ty.device
onGroupInfoChange({ ... })
```

###### 体验 Demo

###### 参数

**function listener**
群组内增加/移除设备事件
**参数**

| 属性    | 类型   | 默认值 | 必填 | 说明            |
| ------- | ------ | ------ | ---- | --------------- |
| groupId | string |        | 是   | groupId 群组 id |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onGroupInfoChange,
  getLaunchOptionsSync,
  registerGroupChange
} from '@ray-js/ray';
// 原生调用方式
const { onGroupInfoChange, registerGroupChange } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

const _onGroupInfoChange = (event) => {
  console.log(event);
};

registerGroupChange({
  groupIdList: [groupId],
  success: () => {
    console.log('registerGroupChange success');
  },
  fail: (error) => {
    console.log('registerGroupChange fail', error);
  }
});
onGroupInfoChange(_onGroupInfoChange);
```

###### 成功示例

```json
{
  "groupId": "xxxxx"
}
```

###### 常见问题

###### Q：为什么调用了 onGroupInfoChange 之后，无法收到消息？

A：需要先调用 registerGroupChange 注册群组监听器，才能收到群组相关消息。
###### device.offGroupInfoChange

###### 功能描述

移除监听：群组内增加/移除设备事件

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offGroupInfoChange } = device
offGroupInfoChange({ ... })
```

**原生小程序中使用**

```javascript
const { offGroupInfoChange } = ty.device
offGroupInfoChange({ ... })
```

###### 参数

**function listener**

onGroupInfoChange 传入的监听函数。不传此参数则移除所有监听函数。
###### device.onGroupRemovedEvent

###### 功能描述

群组移除事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onGroupRemovedEvent } = device
onGroupRemovedEvent({ ... })
```

**原生小程序中使用**

```javascript
const { onGroupRemovedEvent } = ty.device
onGroupRemovedEvent({ ... })
```

###### 体验 Demo

###### 参数

**function listener**
群组移除事件
**参数**

| 属性    | 类型   | 默认值 | 必填 | 说明    |
| ------- | ------ | ------ | ---- | ------- |
| groupId | string |        | 是   | 群组 id |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onGroupRemovedEvent,
  getLaunchOptionsSync,
  registerGroupChange
} from '@ray-js/ray';
// 原生调用方式
const { onGroupRemovedEvent, registerGroupChange } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

const _onGroupRemovedEvent = (event) => {
  console.log(event);
};

registerGroupChange({
  groupIdList: [groupId],
  success: () => {
    console.log('registerGroupChange success');
  },
  fail: (error) => {
    console.log('registerGroupChange fail', error);
  }
});
onGroupRemovedEvent(_onGroupRemovedEvent);
```

###### 成功示例

```json
{
  "groupId": "xxxxx"
}
```

###### 常见问题

###### Q：为什么调用了 onGroupRemovedEvent 之后，无法收到消息？

A：需要先调用 registerGroupChange 注册群组监听器，才能收到群组相关消息。
###### device.offGroupRemovedEvent

###### 功能描述

移除监听：群组移除事件

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offGroupRemovedEvent } = device
offGroupRemovedEvent({ ... })
```

**原生小程序中使用**

```javascript
const { offGroupRemovedEvent } = ty.device
offGroupRemovedEvent({ ... })
```

###### 参数

**function listener**

onGroupRemovedEvent 传入的监听函数。不传此参数则移除所有监听函数。

### 群组属性

###### device.setGroupProperty

###### 功能描述

设置群组的属性

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { setGroupProperty } = device
setGroupProperty({ ... })
```

**原生小程序中使用**

```javascript
const { setGroupProperty } = ty.device
setGroupProperty({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | 群组 id                                          |
| code     | string   |        | 是   | code 属性 code                                   |
| value    | string   |        | 是   | value                                            |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { setGroupProperty, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { setGroupProperty } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

setGroupProperty({
  groupId,
  code: 'test',
  value: 'test',
  success: (info) => {
    console.log('setGroupProperty success', info);
  },
  fail: (error) => {
    console.log('setGroupProperty fail', error);
  }
});
```

###### 成功示例

```json
true
```
###### device.getGroupProperty

###### 功能描述

获取群组的属性

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getGroupProperty } = device
getGroupProperty({ ... })
```

**原生小程序中使用**

```javascript
const { getGroupProperty } = ty.device
getGroupProperty({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | 群组 id                                          |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

| 属性   | 类型 | 说明         |
| ------ | ---- | ------------ |
| result | any  | 群组属性信息 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getGroupProperty, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getGroupProperty } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

getGroupProperty({
  groupId,
  success: (info) => {
    console.log('getGroupProperty success', info);
  },
  fail: (error) => {
    console.log('getGroupProperty fail', error);
  }
});
```

###### 成功示例

```json
{
  "result": {
    "test1": "test1",
    "test2": "test2",
    "test": "test"
  }
}
```

### 群组功能页

###### onOpenGroupCreate

跳转创建群组保存成功回调事件

###### 引入

```js
import { onOpenGroupCreate } from '@ray-js/ray';
```

> 需引入`DeviceKit`，且在`>=3.9.0`版本才可使用

> @ray-js/ray 需在 `>=1.4.22`版本才可使用

**参数**

监听跳转创建群组保存成功的回调函数

###### 请求示例

```ts

onOpenGroupCreate(()=>{
  console.log('创建群组保存完成')
})

openGroupCreate({
  deviceId: "vdevo170107648877238"
}).then(() => {
  console.log('调用成功打开创建群组页面');
});
```
###### openGroupCreate

跳转创建群组

###### 引入

```js
import { openGroupCreate } from '@ray-js/ray';
```

> 需引入`DeviceKit`，且在`>=3.9.0`版本才可使用，`开发者工具`环境无法使用，需要打包后或真机调试使用。

> @ray-js/ray 需在 `>=1.4.22`版本才可使用

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| deviceId | `string`   |        | 是   | 设备 id                                          |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |

###### 请求示例

```ts
openGroupCreate({
  deviceId: "vdevo170107648877238"
}).then(() => {
  console.log('调用成功打开创建群组页面');
});
```
###### device.openGroupDetailPage

###### 功能描述

跳转群组详情

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openGroupDetailPage } = device
openGroupDetailPage({ ... })
```

**原生小程序中使用**

```javascript
const { openGroupDetailPage } = ty.device
openGroupDetailPage({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | groupId
群组 id                              |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { openGroupDetailPage, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openGroupDetailPage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

openGroupDetailPage({
  groupId,
  success: () => {
    console.log('openGroupDetailPage success');
  },
  fail: (error) => {
    console.log('openGroupDetailPage fail', error);
  }
});
```

###### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 9002   | Context is invalid  |
| 9005   | can‘t find service  |
| 20002  | GroupId is invalid  |
| 20064  | Group model is null |
###### device.openGroupEdit

###### 功能描述

跳转群组编辑页面

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openGroupEdit } = device
openGroupEdit({ ... })
```

**原生小程序中使用**

```javascript
const { openGroupEdit } = ty.device
openGroupEdit({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | groupId
设备 id                              |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { openGroupEdit, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openGroupEdit } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

openGroupEdit({
  groupId,
  success: () => {
    console.log('openGroupEdit success');
  },
  fail: (error) => {
    console.log('openGroupEdit fail', error);
  }
});
```

###### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 9002   | Context is invalid  |
| 9005   | can‘t find service  |
| 20002  | GroupId is invalid  |
| 20064  | Group model is null |
###### device.openGroupTimerPage

###### 功能描述

跳转定时界面

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openGroupTimerPage } = device
openGroupTimerPage({ ... })
```

**原生小程序中使用**

```javascript
const { openGroupTimerPage } = ty.device
openGroupTimerPage({ ... })
```

###### 体验 Demo

###### 请求参数

**Object object**

| 属性        | 类型        | 默认值 | 必填 | 说明                                                                                                                                                                                                                                                       |
| ----------- | ----------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| groupId     | string      |        | 是   | groupId
群组 id                                                                                                                                                                                                                                        |
| category    | string      |        | 是   | category
定时分类                                                                                                                                                                                                                                      |
| repeat      | number      |        | 否   | 注意该字段已废弃                                                                                                                                                                                                                                           |
| data        | object[]    |        | 是   | data
dp 数据
\{
 "dpName": dp 点名称，string
 "dpId": dp 点 id，string
 "selected": dp 点默认值的 index，t.Integer 
 "rangeKeys": dp 点的值范围，Array\<object\> 
 "rangeValues": dp 点的显示数据范围，Array\<string\> 
\} |
| timerConfig | TimerConfig |        | 否   | timerConfig
UI 配置                                                                                                                                                                                                                                    |
| success     | function    |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                     |
| fail        | function    |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                     |
| complete    | function    |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                           |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 引用对象

**TimerConfig**

| 属性       | 类型   | 默认值 | 必填 | 说明                                                            |
| ---------- | ------ | ------ | ---- | --------------------------------------------------------------- |
| background | string |        | 否   | background
定时界面导航栏的背景颜色，十六进制，例如：FFFFFF |

###### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { openGroupTimerPage, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { openGroupTimerPage } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

openGroupTimerPage({
  groupId,
  category: 'timer',
  repeat: 1,
  data: [
    {
      dpName: '开关',
      dpId: 1,
      rangeKeys: [true, false],
      rangeValues: ['开', '关']
    }
  ],
  success: () => {
    console.log('openGroupTimerPage success');
  },
  fail: (error) => {
    console.log('openGroupTimerPage fail', error);
  }
});
```

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 9002   | Context is invalid                |
| 9005   | can‘t find service                |
| 20002  | GroupId is invalid                |
| 20064  | Group model is null               |

###### 常见问题

###### Q：为什么 IOS 端 repeat 参数无效？

A：由于历史原因，双端实现存在差异，IOS 端暂未实现 repeat 参数功能。
###### device.openMeshLocalGroup

###### 功能描述

跳转本地 mesh 群组

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { openMeshLocalGroup } = device
openMeshLocalGroup({ ... })
```

**原生小程序中使用**

```javascript
const { openMeshLocalGroup } = ty.device
openMeshLocalGroup({ ... })
```

###### 请求参数

**Object object**

| 属性              | 类型     | 默认值  | 必填 | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | -------- | ------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| deviceId          | string   |         | 是   | 整体说明
支持 2 个版本:
1、本地版本仅支持根据 vendorIds 进行过滤，为本地逻辑，设备列表 APP 本地根据 meshCategory 进行比对过滤，群组结果保存在设备上，云端不参与群组的列表获取与保存。
2、云端版本支持根据 pccs 或者 codes 进行过滤，为云端逻辑，设备列表获取及群组设备关系保存在云端。
本地版本参数：
\{
"localId": "203a",
"vendorIds": "1F10,2F10"
\}
云端版本参数：
1、pcc 过滤，相当于旧版本的 vendorIds
\{
"localId": "203a",
"type": "0",
"pccs": \["1210"\],
"categoryCode": "7001"
\}
2、code 过滤，根据二级品类进行过滤，目前云端只支持 ykq 和 gykzq 这两种遥控器
\{
"localId": "203a",
"type": "1",
"codes": \["xxxx"\],
"categoryCode": "7001"
\}
关于 categoryCode：categoryCode 并非三级品类，与 localId 匹配范围为 7001-7008；localId 为云端分配，步长为 8，因此一个遥控器内部最多支持关联 8 个群组，localid 为初始值依次+1，与之匹配的 categoryCode 从 7001 依次+1.
vendorIds 必传 可以为空字符串
devId 遥控器设备 id |
| localId           | string   |         | 是   | localId 群组本地标识                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| vendorIds         | string   |         | 是   | 遥控器群组本地版本，使用功能此参数，云端版本传空字符串
vendorIds 使用 meshCategory 进行设备列表筛选
示例：vendorIds: "1F10,2F10"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| type              | string   |         | 否   | 遥控器群组云端版本，使用此功能参数
type 筛选条件 0:pccs 过滤，1：codes 过滤                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| pccs              | string[] |         | 否   | 遥控器群组云端版本，使用此功能参数
pccs 使用 meshCategory 进行设备列表筛选
示例：pccs: \["1F10","2F10"\]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| codes             | string[] |         | 否   | 遥控器群组云端版本，使用此功能参数
codes 使用二级品类进行设备列表筛选
示例：pccs: \["1F10","2F10"\]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| categoryCode      | string   |         | 否   | categoryCode 并非三级品类，与 localId 匹配范围为 7001-7008；
localId 为云端分配，步长为 8，因此一个遥控器内部最多支持关联 8 个群组，localid 为初始值依次+1，与之匹配的 categoryCode 从 7001 依次+1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| isSupportLowPower | boolean  | `false` | 否   | 是否支持低功耗,部分无线开关需要用到
默认值:false                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| success           | function |         | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| fail              | function |         | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| complete          | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

###### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

###### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 9001   | Activity is invalid               |
| 20021  | Cannot find service               |

## 遥控器群组

#### 获取 Zigbee 遥控器群组 localId 列表功能

`getZigbeeLocalGroupRelation`

##### 引入

> @ray-js/ray^1.5.2 以上版本可使用

```js
import { getZigbeeLocalGroupRelation } from '@ray-js/ray'
```

##### 参数

**IGetZigbeeLocalGroupRelation**

| 属性  | 类型      | 必填 | 说明             |
| ----- | --------- | ---- | ---------------- |
| devId | `string`  | 是   | 遥控器设备 Id    |

##### 返回

**IGetZigbeeLocalGroupRelationResponse**

本 API 返回一个对象，包含一个名为 `locals` 的数组，每个元素包含以下属性：

| 属性         | 类型     | 说明                                           |
| ------------ | -------- | ---------------------------------------------- |
| code         | `string` | 功能点 code                                    |
| order        | `number` | 排序                                           |
| localId      | `string` | 设备端用到的群组 localId                        |
| categoryCode | `string` | 面板使用的 code，用来做映射，值以 300 为前缀, 例如 3001 |

##### 函数定义示例

```typescript
/**
 * 获取 Zigbee 遥控器群组 localId 列表
 */
export function getZigbeeLocalGroupRelation(params: IGetZigbeeLocalGroupRelation): Promise<IGetZigbeeLocalGroupRelationResponse>
```
#### 获取可以加入 Zigbee 遥控器群组的设备列表功能

`getZigbeeLocalGroupDeviceList`

##### 引入

> @ray-js/ray^1.5.2 以上版本可使用

```js
import { getZigbeeLocalGroupDeviceList } from '@ray-js/ray'
```

##### 参数

**IGetZigbeeLocalGroupDeviceList**

| 属性         | 类型     | 必填 | 说明 |
| ------------ | -------- | ---- | ---- |
| devId        | `string` | 是   | 遥控器的设备 ID |
| meshId       | `string` | 是   | 遥控器的网关 id |
| categoryCode | `string` | 是   | 分组 Code，遥控器可支持多个群组，与 localId 匹配范围为 7001-7008；localId 为云端分配，步长为 8，因此一个遥控器内部最多支持关联 8 个群组，localId 为初始值依次+1，与之匹配的 categoryCode 从 7001 依次 +1。可以通过 getZigbeeLocalGroupRelation 获取 |
| homeId       | `string` | 是   | 家庭 id，可以通过 getCurrentHomeInfo 获取 |

##### 返回

**IGetZigbeeLocalGroupDeviceListResponse**

本 API 返回一个数组，每个元素包含以下属性：

| 属性        | 类型       | 说明                        |
| ----------- | ---------- | --------------------------- |
| productId   | `string`   | 设备产品 id                 |
| devId       | `string`   | 设备 id                     |
| devOnline   | `boolean`  | 设备在线状态                |
| devName     | `string`   | 设备名称                    |
| iconUrl     | `string`   | 设备背景图片                |
| checked     | `boolean`  | 是否选中                    |
| nodeId      | `string`   | 如果是子设备，会返回子设备对应的 nodeId |
| gwId        | `string`   | 网关 id                     |
| gwName      | `string`   | 网关名称                    |
| gwOnline    | `boolean`  | 网关是否在线                |

##### 函数定义示例

```typescript
/**
 * 获取可以加入 Zigbee 遥控器群组的设备列表
 */
 export function getZigbeeLocalGroupDeviceList(params: IGetZigbeeLocalGroupDeviceList): Promise<IGetZigbeeLocalGroupDeviceListResponse>
```
#### 跳转 Zigbee 遥控器群组配对页面

`openZigbeeLocalGroup`

##### 引入

> @ray-js/ray^1.5.2 以上版本可使用

```js
import { openZigbeeLocalGroup } from '@ray-js/ray'
```

##### 参数

**OpenZigbeeLocalGroupParams**

| 属性         | 类型     | 必填 | 说明                                                                                 |
| ------------ | -------- | ---- | ------------------------------------------------------------------------------------ |
| deviceId     | `string` | 是   | 设备 Id                                                                              |
| localId      | `string` | 是   | 群组本地标识，通过 `getZigbeeLocalGroupRelation` 获取                                |
| categoryCode | `string` | 是   | 非二级品类，与 localId 匹配范围为 7001-7008，通过 `getZigbeeLocalGroupRelation` 获取 |
| codes        | `string` | 是   | 二级品类 code，用于进行设备列表筛选过滤                                              |

##### 返回

无

##### 函数定义示例

```typescript
/**
 * 跳转 Zigbee 遥控器群组配对页面
 */
export function openZigbeeLocalGroup(params?: OpenZigbeeLocalGroupParams): Promise<void>
```

##### 注意事项

- 当前仅针对 Zigbee 的部分品类开通了此类能力，如果不清楚对应的二级品类 code，可以通过 [小程序论坛](https://www.tuyaos.com/) 联系涂鸦小程序团队寻求帮助
