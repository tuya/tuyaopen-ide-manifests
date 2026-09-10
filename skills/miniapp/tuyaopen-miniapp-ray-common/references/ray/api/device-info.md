# 设备信息 (device-info)


## 设备信息

#### device.getDeviceInfo

##### 功能描述

获取设备的设备信息

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceInfo } = device
getDeviceInfo({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceInfo } = ty.device
getDeviceInfo({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any      |        | 否   | dps                                                                                       |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

##### 返回结果

**success**

| 属性                   | 类型     | 说明                                                                                                                                                                         |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| roomName               | string   | 设备所处房间名                                                                                                                                                               |
| schema                 | object[] | 产品信息，schema，功能定义都在里面                                                                                                                                           |
| dps                    | any      | dps
设备的功能点状态，可以根据对应的 dpid 拿到具体的状态值去做业务逻辑                                                                                                   |
| attribute              | number   | attribute
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                                               |
| baseAttribute          | number   | baseAttribute
基础产品属性定义                                                                                                                                           |
| capability             | number   | capability
产品能力值，在 backend-ng 平台上可以查询对应的勾选项，整体业务逻辑会根据该数据进行划分
区分设备类型也可以根据该属性进行调整，按二进制位运算的方式进行管理 |
| dpName                 | any      | dpName
自定义 dp 的名字，通常在面板里会使用到                                                                                                                            |
| ability                | number   | ability
目前业务很少使用，用于区分特殊类型的设备                                                                                                                         |
| icon                   | string   | icon
设备的 icon url                                                                                                                                                     |
| devId                  | string   | devId
设备的唯一 id                                                                                                                                                      |
| verSw                  | string   | verSw
设备固件版本号                                                                                                                                                     |
| isShare                | boolean  | isShare
是否为分享设备，true 则是分享设备                                                                                                                                |
| bv                     | string   | bv
设备的基线版本号                                                                                                                                                      |
| uuid                   | string   | uuid
设备的固件唯一标识                                                                                                                                                  |
| panelConfig            | any      | panelConfig
产品面板里的配置项，通常在 IoT 平台上可以查看到对应的配置                                                                                                    |
| activeTime             | number   | activeTime
设备激活时间，时间戳                                                                                                                                          |
| devAttribute           | number   | devAttribute
设备的业务能力拓展，二进制位的方式进行运算                                                                                                                  |
| pcc                    | string   | pcc
Thing 自研蓝牙 mesh 产品的分类标识                                                                                                                                   |
| nodeId                 | string   | nodeId
子设备的短地址                                                                                                                                                    |
| parentId               | string   | parentId
上级节点 id，子设备/或蓝牙 mesh 设备通常会有该字段，用于内部寻找相关的网关或上级模型来进行业务处理                                                              |
| category               | string   | category
产品的分类                                                                                                                                                      |
| standSchemaModel       | object   | standSchemaModel
标准产品功能集定义模型                                                                                                                                  |
| productId              | string   | productId
设备对应的产品 id                                                                                                                                              |
| productVer             | string   | productVer
设备对应的产品的版本号                                                                                                                                        |
| bizAttribute           | number   | bizAttribute
业务属性能力                                                                                                                                                |
| meshId                 | string   | meshId
当前设备对应的蓝牙 mesh id                                                                                                                                        |
| sigmeshId              | string   | 【废弃】sigmeshId
当前设备所属行业属性对应的蓝牙 mesh id                                                                                                                 |
| meta                   | any      | meta
设备自定义配置元属性，用于存放业务数据                                                                                                                              |
| isLocalOnline          | boolean  | isLocalOnline
本地局域网是否在线                                                                                                                                         |
| isCloudOnline          | boolean  | 设备云端在线情况                                                                                                                                                             |
| isOnline               | boolean  | isOnline
设备总的在线情况，只要一个情况在线，就是在线，复合在线情况                                                                                                      |
| name                   | string   | name
设备名称                                                                                                                                                            |
| groupId                | string   | groupId                                                                                                                                                                      |
| dpCodes                | any      | dpCodes
标准功能集 code                                                                                                                                                  |
| devTimezoneId          | string   | 时区信息                                                                                                                                                                     |
| dpsTime                | any      | 设备的功能点执行的时间                                                                                                                                                       |
| latitude               | string   | 设备纬度                                                                                                                                                                     |
| longitude              | string   | 设备经度                                                                                                                                                                     |
| ip                     | string   | 设备 ip 地址                                                                                                                                                                 |
| isVirtualDevice        | boolean  | 是否为虚拟设备                                                                                                                                                               |
| isZigbeeInstallCode    | boolean  | zigbeeInstallCode to the cloud to mark the gateway with installation code ability                                                                                            |
| protocolAttribute      | number   | Activate sub-device capability flag.                                                                                                                                         |
| connectionStatus       | number   | 连接状态，nearby 状态                                                                                                                                                        |
| mac                    | string   | 部分设备需要用 mac 进行唯一识别 ，比如 mesh                                                                                                                                  |
| bluetoothCapability    | string   | 蓝牙的设备能力值，由设备进行上报                                                                                                                                             |
| isTripartiteMatter     | boolean  | 是否三方 matter 设备                                                                                                                                                         |
| isGW                   | boolean  | 是否网关设备                                                                                                                                                                 |
| isSupportGroup         | boolean  | 是否支持群组                                                                                                                                                                 |
| isZigBeeSubDev         | boolean  | 是否 zigbee 子设备                                                                                                                                                           |
| cadv                   | string   | cadv 版本号                                                                                                                                                                  |
| isSupportOTA           | boolean  | 设备是否支持 OTA                                                                                                                                                             |
| iconUrl                | string   | 设备图标                                                                                                                                                                     |
| hasWifi                | boolean  | 设备是否有 Wi-Fi 模块                                                                                                                                                        |
| switchDp               | number   | 快捷控制 dp                                                                                                                                                                  |
| switchDps              | number[] | 快捷控制 dp                                                                                                                                                                  |
| wifiEnableState        | number   | 设备 Wi-Fi 模块的状态：1:不可用 2:可用                                                                                                                                       |
| configMetas            | any      | 设备产品配置                                                                                                                                                                 |
| isMatter               | boolean  | 是否为 matter 设备                                                                                                                                                           |
| isSupportLink          | boolean  | 设备是否支持双控                                                                                                                                                             |
| isSupportAppleHomeKit  | boolean  | 是否支持将设备添加到苹果家庭中                                                                                                                                               |
| attributeString        | string   | attribute 格式化的二进制字符串
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                          |
| extModuleType          | number   | 设备的扩展模块的类型
0：无扩展模块
1：表示存在扩展模块，即设备为 ble+x 的设备
2：扩展模块为 Wi-Fi 模块。即设备为 ble+Wi-Fi 的设备                                |
| isRelayOpen            | boolean  | mesh 设备的 relay 功能是否开启                                                                                                                                               |
| isProxyOpen            | boolean  | mesh 设备的 proxy 功能是否开启                                                                                                                                               |
| isSupportProxyAndRelay | boolean  | mesh 设备是否支持 proxy 和 relay 功能                                                                                                                                        |
| yuNetState             | number   | 设备大禹通道用户启用状态，0-不启用，1-启用                                                                                                                                   |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getDeviceInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getDeviceInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getDeviceInfo({
  deviceId,
  success: (info) => {
    console.log('getDeviceInfo success', info);
  },
  fail: (error) => {
    console.log('getDeviceInfo fail', error);
  }
});
```

###### 成功示例

```json
{
  "ability": 0,
  "activeTime": 1721716819,
  "bv": "2.0",
  "devId": "vdevo************",
  "dps": {
    "1": false,
    "9": 0
  },
  "icon": "smart/icon/ay1578558677135aYsLF/cf7c96aa4e3f30e00904816ae5f2196f.png",
  "iconUrl": "https://xxx.png",
  "ip": "124.*.*.*",
  "isOnline": true,
  "isShare": false,
  "localKey": "HR[qjajM^J6[/CdZ",
  "name": "插座",
  "panelConfig": {
    "bic": [
      {
        "code": "timer",
        "selected": true
      },
      {
        "code": "jump_url",
        "selected": false
      }
    ]
  },
  "productId": "ztgugexhribyjhzj",
  "pv": "2.0",
  "schema": [
    {
      "attr": 1,
      "canTrigger": true,
      "code": "switch_1",
      "defaultRecommend": false,
      "editPermission": false,
      "executable": true,
      "extContent": "",
      "iconname": "icon-dp_power3",
      "id": 1,
      "mode": "rw",
      "name": "开关1",
      "property": {
        "type": "bool"
      },
      "type": "obj"
    },
    {
      "attr": 4,
      "canTrigger": true,
      "code": "countdown_1",
      "defaultRecommend": false,
      "editPermission": false,
      "executable": true,
      "extContent": "",
      "iconname": "icon-dp_i",
      "id": 9,
      "mode": "rw",
      "name": "开关1倒计时",
      "property": {
        "unit": "s",
        "min": 0,
        "max": 86400,
        "scale": 0,
        "step": 1,
        "type": "value"
      },
      "type": "obj"
    }
  ],
  "uuid": "vdevo************",
  "baseAttribute": 0,
  "dataPointInfo": {
    "dpMaxTime": 1721716819918,
    "dpName": {},
    "dps": {
      "1": false,
      "9": 0
    },
    "dpsTime": {
      "1": 1721716819918,
      "9": 1721716819918
    }
  },
  "cloudOnline": true,
  "bizAttribute": 0,
  "zigbeeInstallCode": false,
  "attributeString": "100000000000000000000000000000000000000",
  "dpCodes": {
    "switch_1": false,
    "countdown_1": 0
  },
  "capability": 1,
  "category": "cz",
  "attribute": 274877906944,
  "isCloudOnline": true,
  "latitude": "",
  "longitude": "",
  "dpName": {},
  "dpsTime": {
    "1": 1721716819918,
    "9": 1721716819918
  },
  "isSupportGroup": true,
  "hasWifi": false,
  "cadv": "",
  "protocolAttribute": 0,
  "isGW": false,
  "isLocalOnline": false,
  "isTripartiteMatter": false,
  "isSupportLink": false,
  "pcc": "",
  "isMatter": false
}
```
#### device.getDeviceListByDevIds

##### 功能描述

通过设备 id 队列获取设备的设备信息队列

> 需引入`DeviceKit`，且在`>=3.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceListByDevIds } = device
getDeviceListByDevIds({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceListByDevIds } = ty.device
getDeviceListByDevIds({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性      | 类型     | 默认值 | 必填 | 说明                                             |
| --------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceIds | string[] |        | 是   | deviceId 设备 ids                                |
| success   | function |        | 否   | 接口调用成功的回调函数                           |
| fail      | function |        | 否   | 接口调用失败的回调函数                           |
| complete  | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性        | 类型         | 说明         |
| ----------- | ------------ | ------------ |
| deviceInfos | DeviceInfo[] | 设备信息队列 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**DeviceInfo**

| 属性                   | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                         |
| ---------------------- | -------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| roomName               | string   | `""`   | 否   | 设备所处房间名                                                                                                                                                               |
| schema                 | object[] |        | 是   | 产品信息，schema，功能定义都在里面                                                                                                                                           |
| dps                    | any      |        | 是   | dps
设备的功能点状态，可以根据对应的 dpid 拿到具体的状态值去做业务逻辑                                                                                                   |
| attribute              | number   |        | 是   | attribute
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                                               |
| baseAttribute          | number   |        | 是   | baseAttribute
基础产品属性定义                                                                                                                                           |
| capability             | number   |        | 是   | capability
产品能力值，在 backend-ng 平台上可以查询对应的勾选项，整体业务逻辑会根据该数据进行划分
区分设备类型也可以根据该属性进行调整，按二进制位运算的方式进行管理 |
| dpName                 | any      |        | 是   | dpName
自定义 dp 的名字，通常在面板里会使用到                                                                                                                            |
| ability                | number   |        | 是   | ability
目前业务很少使用，用于区分特殊类型的设备                                                                                                                         |
| icon                   | string   |        | 是   | icon
设备的 icon url                                                                                                                                                     |
| devId                  | string   |        | 是   | devId
设备的唯一 id                                                                                                                                                      |
| verSw                  | string   |        | 是   | verSw
设备固件版本号                                                                                                                                                     |
| isShare                | boolean  |        | 是   | isShare
是否为分享设备，true 则是分享设备                                                                                                                                |
| bv                     | string   |        | 是   | bv
设备的基线版本号                                                                                                                                                      |
| uuid                   | string   |        | 是   | uuid
设备的固件唯一标识                                                                                                                                                  |
| panelConfig            | any      |        | 是   | panelConfig
产品面板里的配置项，通常在 IoT 平台上可以查看到对应的配置                                                                                                    |
| activeTime             | number   |        | 是   | activeTime
设备激活时间，时间戳                                                                                                                                          |
| devAttribute           | number   |        | 是   | devAttribute
设备的业务能力拓展，二进制位的方式进行运算                                                                                                                  |
| pcc                    | string   |        | 是   | pcc
Thing 自研蓝牙 mesh 产品的分类标识                                                                                                                                   |
| nodeId                 | string   |        | 是   | nodeId
子设备的短地址                                                                                                                                                    |
| parentId               | string   | `""`   | 否   | parentId
上级节点 id，子设备/或蓝牙 mesh 设备通常会有该字段，用于内部寻找相关的网关或上级模型来进行业务处理                                                              |
| category               | string   |        | 是   | category
产品的分类                                                                                                                                                      |
| standSchemaModel       | object   |        | 否   | standSchemaModel
标准产品功能集定义模型                                                                                                                                  |
| productId              | string   |        | 是   | productId
设备对应的产品 id                                                                                                                                              |
| productVer             | string   |        | 是   | productVer
设备对应的产品的版本号                                                                                                                                        |
| bizAttribute           | number   |        | 是   | bizAttribute
业务属性能力                                                                                                                                                |
| meshId                 | string   |        | 是   | meshId
当前设备对应的蓝牙 mesh id                                                                                                                                        |
| sigmeshId              | string   |        | 是   | 【废弃】sigmeshId
当前设备所属行业属性对应的蓝牙 mesh id                                                                                                                 |
| meta                   | any      |        | 是   | meta
设备自定义配置元属性，用于存放业务数据                                                                                                                              |
| isLocalOnline          | boolean  |        | 是   | isLocalOnline
本地局域网是否在线                                                                                                                                         |
| isCloudOnline          | boolean  |        | 是   | 设备云端在线情况                                                                                                                                                             |
| isOnline               | boolean  |        | 是   | isOnline
设备总的在线情况，只要一个情况在线，就是在线，复合在线情况                                                                                                      |
| name                   | string   |        | 是   | name
设备名称                                                                                                                                                            |
| groupId                | string   |        | 是   | groupId                                                                                                                                                                      |
| dpCodes                | any      |        | 是   | dpCodes
标准功能集 code                                                                                                                                                  |
| devTimezoneId          | string   |        | 是   | 时区信息                                                                                                                                                                     |
| dpsTime                | any      |        | 是   | 设备的功能点执行的时间                                                                                                                                                       |
| latitude               | string   |        | 是   | 设备纬度                                                                                                                                                                     |
| longitude              | string   |        | 是   | 设备经度                                                                                                                                                                     |
| ip                     | string   | `""`   | 否   | 设备 ip 地址                                                                                                                                                                 |
| isVirtualDevice        | boolean  |        | 是   | 是否为虚拟设备                                                                                                                                                               |
| isZigbeeInstallCode    | boolean  |        | 是   | zigbeeInstallCode to the cloud to mark the gateway with installation code ability                                                                                            |
| protocolAttribute      | number   |        | 是   | Activate sub-device capability flag.                                                                                                                                         |
| connectionStatus       | number   |        | 是   | 连接状态，nearby 状态                                                                                                                                                        |
| mac                    | string   | `""`   | 否   | 部分设备需要用 mac 进行唯一识别 ，比如 mesh                                                                                                                                  |
| bluetoothCapability    | string   | `""`   | 否   | 蓝牙的设备能力值，由设备进行上报                                                                                                                                             |
| isTripartiteMatter     | boolean  |        | 是   | 是否三方 matter 设备                                                                                                                                                         |
| isGW                   | boolean  |        | 是   | 是否网关设备                                                                                                                                                                 |
| isSupportGroup         | boolean  |        | 是   | 是否支持群组                                                                                                                                                                 |
| isZigBeeSubDev         | boolean  |        | 是   | 是否 zigbee 子设备                                                                                                                                                           |
| cadv                   | string   | `""`   | 否   | cadv 版本号                                                                                                                                                                  |
| isSupportOTA           | boolean  |        | 是   | 设备是否支持 OTA                                                                                                                                                             |
| iconUrl                | string   |        | 是   | 设备图标                                                                                                                                                                     |
| hasWifi                | boolean  |        | 是   | 设备是否有 Wi-Fi 模块                                                                                                                                                        |
| switchDp               | number   |        | 是   | 快捷控制 dp                                                                                                                                                                  |
| switchDps              | number[] |        | 是   | 快捷控制 dp                                                                                                                                                                  |
| wifiEnableState        | number   |        | 是   | 设备 Wi-Fi 模块的状态：1:不可用 2:可用                                                                                                                                       |
| configMetas            | any      |        | 是   | 设备产品配置                                                                                                                                                                 |
| isMatter               | boolean  |        | 是   | 是否为 matter 设备                                                                                                                                                           |
| isSupportLink          | boolean  |        | 是   | 设备是否支持双控                                                                                                                                                             |
| isSupportAppleHomeKit  | boolean  |        | 否   | 是否支持将设备添加到苹果家庭中                                                                                                                                               |
| attributeString        | string   |        | 是   | attribute 格式化的二进制字符串
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                          |
| extModuleType          | number   |        | 是   | 设备的扩展模块的类型
0：无扩展模块
1：表示存在扩展模块，即设备为 ble+x 的设备
2：扩展模块为 Wi-Fi 模块。即设备为 ble+Wi-Fi 的设备                                |
| isRelayOpen            | boolean  |        | 是   | mesh 设备的 relay 功能是否开启                                                                                                                                               |
| isProxyOpen            | boolean  |        | 是   | mesh 设备的 proxy 功能是否开启                                                                                                                                               |
| isSupportProxyAndRelay | boolean  |        | 是   | mesh 设备是否支持 proxy 和 relay 功能                                                                                                                                        |
| yuNetState             | number   |        | 是   | 设备大禹通道用户启用状态，0-不启用，1-启用                                                                                                                                   |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getDeviceListByDevIds } from '@ray-js/ray';
// 原生调用方式
const { getDeviceListByDevIds } = ty.device;
// 启动参数中获取设备 id

getDeviceListByDevIds({
  deviceIds: ['deviceId1', 'deviceId2'],
  name: 'newName',
  success: (info) => {
    console.log('getDeviceListByDevIds success', info);
  },
  fail: (error) => {
    console.log('getDeviceListByDevIds fail', error);
  }
});
```

###### 成功示例

```json
{
  "deviceInfos": [
    {
      "isGW": false,
      "latitude": "",
      "isVirtualDevice": true,
      "bluetoothCapability": "",
      "isSupportOTA": false,
      "dpsTime": {
        "1": 1721716819918,
        "9": 1721716819918
      },
      "baseAttribute": 0,
      "uuid": "vdevo*************",
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
        ]
      },
      "pcc": "",
      "iconUrl": "https://xxx.png",
      "longitude": "",
      "devTimezoneId": "Asia/Shanghai",
      "connectionStatus": 1,
      "capability": 1,
      "dpName": {},
      "bizAttribute": 0,
      "isZigbeeInstallCode": false,
      "isLocalOnline": false,
      "attribute": 274877906944,
      "yuNetState": 0,
      "productVer": "1.0.0",
      "cadv": "",
      "devAttribute": 0,
      "isZigBeeSubDev": false,
      "switchDps": [1],
      "dps": {
        "1": false,
        "9": 0
      },
      "roomName": "",
      "devId": "vdevo************",
      "dpCodes": {
        "switch_1": false,
        "countdown_1": 0
      },
      "name": "插座",
      "isProxyOpen": true,
      "ip": "124.*.*.*",
      "activeTime": 1721716819,
      "attributeString": "100000000000000000000000000000000000000",
      "schema": [
        {
          "id": 1,
          "code": "switch_1",
          "mode": "rw",
          "property": {
            "type": "bool"
          },
          "iconname": "icon-dp_power3",
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
          "iconname": "icon-dp_i",
          "type": "obj",
          "name": "开关1倒计时"
        }
      ],
      "isMatter": false,
      "hasWifi": true,
      "category": "cz",
      "extModuleType": -1,
      "isOnline": true,
      "isSupportLink": true,
      "productId": "ztgugexhribyjhzj",
      "isShare": false,
      "switchDp": 0,
      "icon": "https://xxx.png",
      "isSupportAppleHomeKit": true,
      "isSupportGroup": true,
      "mac": "",
      "bv": "0",
      "isCloudOnline": true,
      "isTripartiteMatter": false,
      "isSupportProxyAndRelay": false,
      "wifiEnableState": 2,
      "protocolAttribute": 0
    },
    {
      "isGW": true,
      "latitude": "",
      "isVirtualDevice": true,
      "bluetoothCapability": "",
      "isSupportOTA": false,
      "baseAttribute": 0,
      "uuid": "vdevo*******",
      "isRelayOpen": true,
      "configMetas": {},
      "ability": 0,
      "pcc": "0108",
      "iconUrl": "https://xxx.png",
      "longitude": "",
      "devTimezoneId": "Asia/Shanghai",
      "connectionStatus": 1,
      "capability": 4097,
      "dpName": {},
      "bizAttribute": 0,
      "isZigbeeInstallCode": false,
      "isLocalOnline": false,
      "attribute": 536870912,
      "yuNetState": 0,
      "productVer": "1.0.0",
      "cadv": "",
      "devAttribute": 0,
      "isZigBeeSubDev": false,
      "switchDps": [],
      "dps": {},
      "roomName": "",
      "devId": "vdevo********",
      "name": "网关",
      "isProxyOpen": true,
      "ip": "124.*.*.*",
      "activeTime": 1723614946,
      "attributeString": "100000000000000000000000000000",
      "schema": [
        {
          "code": "upward",
          "id": 101,
          "property": {
            "type": "raw",
            "maxlen": 128
          },
          "name": "上行通道",
          "mode": "ro",
          "type": "raw"
        },
        {
          "code": "down",
          "id": 102,
          "property": {
            "type": "raw",
            "maxlen": 128
          },
          "name": "下行通道",
          "mode": "wr",
          "type": "raw"
        }
      ],
      "isMatter": false,
      "hasWifi": true,
      "category": "wfcon",
      "extModuleType": -1,
      "isOnline": true,
      "isSupportLink": false,
      "productId": "aaxie7jyiljmtpxo",
      "isShare": false,
      "switchDp": 0,
      "icon": "https://xxx.png",
      "isSupportAppleHomeKit": true,
      "isSupportGroup": false,
      "mac": "",
      "bv": "0",
      "isCloudOnline": true,
      "isTripartiteMatter": false,
      "isSupportProxyAndRelay": false,
      "wifiEnableState": 2,
      "protocolAttribute": 0
    }
  ]
}
```
#### device.getDeviceNumWithDpCode

##### 功能描述

根据 dpCode 获取群组下具备此 dpCode 的设备数量。如果是一个分享的群组，请通过接口获取。

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceNumWithDpCode } = device
getDeviceNumWithDpCode({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceNumWithDpCode } = ty.device
getDeviceNumWithDpCode({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| groupId  | string   |        | 是   | groupId 群组 id                                  |
| dpCode   | string   |        | 是   | dpCode 内容                                      |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

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

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getDeviceNumWithDpCode, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getDeviceNumWithDpCode } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取群组 id
const {
  query: { groupId }
} = getLaunchOptionsSync();

getDeviceNumWithDpCode({
  groupId,
  dpCode: 'dpCode',
  success: (info) => {
    console.log('getDeviceNumWithDpCode success', info);
  },
  fail: (error) => {
    console.log('getDeviceNumWithDpCode fail', error);
  }
});
```

###### 成功示例

```json
{
  "deviceNum": 2
}
```

##### 错误码

| 错误码 | 错误描述                                           |
| ------ | -------------------------------------------------- |
| 20002  | GroupId is invalid                                 |
| 20078  | dp code invalid                                    |
| 20079  | Error obtaining the number of devices in the group |
#### device.getDeviceOfflineReminderState

##### 功能描述

获取设备离线提醒的开关状态

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceOfflineReminderState } = device
getDeviceOfflineReminderState({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceOfflineReminderState } = ty.device
getDeviceOfflineReminderState({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性  | 类型   | 说明                                       |
| ----- | ------ | ------------------------------------------ |
| state | number | state
设备离线提醒的开关状态 0:关 1:开 |

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
  getDeviceOfflineReminderState,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { getDeviceOfflineReminderState } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getDeviceOfflineReminderState({
  deviceId,
  success: (info) => {
    console.log('getDeviceOfflineReminderState success', info);
  },
  fail: (error) => {
    console.log('getDeviceOfflineReminderState fail', error);
  }
});
```

###### 成功示例

```json
{
  "state": 0
}
```

##### 错误码

| 错误码 | 错误描述                                 |
| ------ | ---------------------------------------- |
| 9005   | can‘t find service                       |
| 20001  | DeviceId is invalid                      |
| 20022  | Device model is null                     |
| 20060  | Get device offline reminder state failed |
#### device.getDeviceOfflineReminderWarningText

##### 功能描述

获取离线提醒警告内容（关闭离线提醒开关后的警告）

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceOfflineReminderWarningText } = device
getDeviceOfflineReminderWarningText({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceOfflineReminderWarningText } = ty.device
getDeviceOfflineReminderWarningText({ ... })
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

| 属性        | 类型   | 说明                 |
| ----------- | ------ | -------------------- |
| warningText | string | 离线提醒关闭警告文案 |

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
  getDeviceOfflineReminderWarningText,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { getDeviceOfflineReminderWarningText } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getDeviceOfflineReminderWarningText({
  deviceId,
  success: (info) => {
    console.log('getDeviceOfflineReminderWarningText success', info);
  },
  fail: (error) => {
    console.log('getDeviceOfflineReminderWarningText fail', error);
  }
});
```

###### 成功示例

```json
{
  "warningText": "为避免提醒过于频繁，设备离线超过30分钟后才会提醒"
}
```

##### 错误码

| 错误码 | 错误描述                                        |
| ------ | ----------------------------------------------- |
| 9005   | can‘t find service                              |
| 20001  | DeviceId is invalid                             |
| 20074  | Get device offline reminder warning text failed |
#### getDeviceOnlineType

 检查设备某个通道是否在线

##### 引入

```js
import { device } from '@ray-js/ray';
const { getDeviceOnlineType } = device;
```

> 需引入`DeviceKit`，且在`>=2.1.6`版本才可使用

##### 请求参数

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                                                                  |
| -------- | ---------- | ------ | ---- | ------------------------------------------------------------------------------------- |
| deviceId | `string`   |        | 是   | deviceId 设备 id 支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                      |
| success  | `function` |        | 否   | 接口调用成功的回调函数                                                                |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                                                                |

##### 返回结果

- **success**

| 属性       | 类型     | 说明             |
| ---------- | -------- | ---------------- |
| onlineType | `number` | 设备网络在线类型 |

- onlineType 为十进制，需转成二进制，再根据如下所示的图片判断。

- **fail**

| 属性       | 类型     | 说明                                                          |
| ---------- | -------- | ------------------------------------------------------------- |
| errorMsg   | `string` | 插件错误信息                                                  |
| errorCode  | `string` | 错误码                                                        |
| innerError | `object` | 插件外部依赖错误信息 `{errorMsg: string, errorCode: string }` |

##### 请求示例

```js
getDeviceOnlineType({
  deviceId: '64710761ecfabcaaf553'
})
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

##### 返回示例

```js
{
  "onlineType": 0
}
```
#### device.getMeshDeviceId

##### 功能描述

通过 nodeId 获取子设备的设备 Id

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getMeshDeviceId } = device
getMeshDeviceId({ ... })
```

**原生小程序中使用**

```javascript
const { getMeshDeviceId } = ty.device
getMeshDeviceId({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| nodeId   | string   |        | 是   | nodeId                                           |
| deviceId | string   |        | 是   | deviceId 网关 id                                 |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性     | 类型   | 说明    |
| -------- | ------ | ------- |
| deviceId | string | 设备 id |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getMeshDeviceId, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getMeshDeviceId } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getMeshDeviceId({
  deviceId,
  nodeId: 'xxxx',
  success: (info) => {
    console.log('getMeshDeviceId success', info);
  },
  fail: (error) => {
    console.log('getMeshDeviceId fail', error);
  }
});
```

###### 成功示例

```json
{
  "deviceId": "xxxxx"
}
```
#### device.getProductInfo

##### 功能描述

获取产品信息

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getProductInfo } = device
getProductInfo({ ... })
```

**原生小程序中使用**

```javascript
const { getProductInfo } = ty.device
getProductInfo({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性       | 类型     | 默认值    | 必填 | 说明                                             |
| ---------- | -------- | --------- | ---- | ------------------------------------------------ |
| productId  | string   |           | 是   | 产品 id                                          |
| productVer | string   | `"1.0.0"` | 否   | 产品版本号
`最低版本4.3.6`                   |
| success    | function |           | 否   | 接口调用成功的回调函数                           |
| fail       | function |           | 否   | 接口调用失败的回调函数                           |
| complete   | function |           | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性            | 类型     | 说明                                                                                                                                                                         |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| panelConfig     | any      | 面板配置项，可以在平台进行配置                                                                                                                                               |
| schema          | string   | 产品功能定义集合                                                                                                                                                             |
| schemaExt       | string   | 产品功能定义集合拓展                                                                                                                                                         |
| capability      | number   | capability
产品能力值，在 backend-ng 平台上可以查询对应的勾选项，整体业务逻辑会根据该数据进行划分
区分设备类型也可以根据该属性进行调整，按二进制位运算的方式进行管理 |
| attribute       | number   | attribute
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                                               |
| productId       | string   | productId
产品 id                                                                                                                                                        |
| category        | string   | category
产品的分类                                                                                                                                                      |
| categoryCode    | string   | categoryCode
产品的二级分类                                                                                                                                              |
| standard        | boolean  | standard
是否为标准产品                                                                                                                                                  |
| pcc             | string   | pcc
Thing 自研蓝牙 mesh 产品的分类标识                                                                                                                                   |
| vendorInfo      | string   | vendorInfo
Thing 自研蓝牙 mesh 产品的分类标识，融合类使用                                                                                                                |
| quickOpDps      | string[] | quickOpDps
快捷操作的 dp ids                                                                                                                                             |
| faultDps        | string[] | faultDps
告警/错误的显示 dp ids                                                                                                                                          |
| displayDps      | string[] | displayDps
快捷操作的 dp ids                                                                                                                                             |
| displayMsgs     | any      | displayMsgs
快捷操作显示文案                                                                                                                                             |
| uiPhase         | string   | uiPhase
ui 包当前环境，预览包或线上包                                                                                                                                    |
| uiId            | string   | uiId
ui 包唯一包名识别                                                                                                                                                   |
| uiVersion       | string   | uiVersion
ui 包版本号                                                                                                                                                    |
| ui              | string   | ui
ui 小标识                                                                                                                                                             |
| rnFind          | boolean  | rnFind
是否有包含 RN 包                                                                                                                                                  |
| uiType          | string   | uiType
ui 包类型                                                                                                                                                         |
| uiName          | string   | uiName
ui 包名称                                                                                                                                                         |
| i18nTime        | number   | i18nTime
产品语言包最新更新时间                                                                                                                                          |
| supportGroup    | boolean  | supportGroup
是否支持创建群组                                                                                                                                            |
| supportSGroup   | boolean  | supportSGroup
是否支持创建标准群组                                                                                                                                       |
| configMetas     | any      | configMetas
产品特殊配置项，一些功能业务的特殊配置                                                                                                                       |
| productVer      | string   | productVer
产品版本                                                                                                                                                      |
| attributeString | string   | attribute 格式化的二进制字符串
产品属性定义，在 backend-ng 平台上可查到对应配置，使用二进制位运算的方式进行管理                                                          |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getProductInfo } from '@ray-js/ray';
// 原生调用方式
const { getProductInfo } = ty.device;
const productId = 'ztgugexhribyjhzj';
getProductInfo({
  productId,
  success: (info) => {
    console.log('getProductInfo success', info);
  },
  fail: (error) => {
    console.log('getProductInfo fail', error);
  }
});
```

###### 成功示例

```json
{
  "uiType": "RN",
  "configMetas": {},
  "rnFind": true,
  "i18nTime": 1731311121575,
  "vendorInfo": "",
  "pcc": "",
  "faultDps": [],
  "attributeString": "100000000000000000000000000000000000000",
  "ui": "00000003kh_0.5.20.287",
  "uiPhase": "preview",
  "attribute": 274877906944,
  "category": "cz",
  "productId": "ztgugexhribyjhzj",
  "uiId": "00000003kh",
  "supportGroup": true,
  "quickOpDps": [9],
  "productVer": "1.0.0",
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
    ]
  },
  "standard": false,
  "uiVersion": "0.5.20.287",
  "schema": "[{\"code\":\"switch_1\",\"iconname\":\"icon-dp_power3\",\"id\":1,\"mode\":\"rw\",\"name\":\"开关1\",\"property\":{\"type\":\"bool\"},\"type\":\"obj\"},{\"code\":\"countdown_1\",\"iconname\":\"icon-dp_i\",\"id\":9,\"mode\":\"rw\",\"name\":\"开关1倒计时\",\"property\":{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1,\"type\":\"value\"},\"type\":\"obj\"}]",
  "schemaExt": "[{\"id\":9,\"inputType\":\"countdown1\"}]",
  "categoryCode": "wf_cz",
  "displayMsgs": {
    "dp_switch_1_off": "关闭",
    "dp_switch_1": "开关1",
    "quickop_dp_countdown_1": "开关1倒计时",
    "quickop_dp_countdown_1_unit": "s",
    "quickop_dp_switch_1": "开关1",
    "dp_switch_1_on": "开启",
    "quickop_dp_switch_1_on": "开启",
    "quickop_dp_switch_1_off": "关闭"
  },
  "supportSGroup": false,
  "displayDps": [],
  "capability": 1
}
```
#### device.getShareDeviceInfo

##### 功能描述

获取共享设备信息

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getShareDeviceInfo } = device
getShareDeviceInfo({ ... })
```

**原生小程序中使用**

```javascript
const { getShareDeviceInfo } = ty.device
getShareDeviceInfo({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性   | 类型   | 说明   |
| ------ | ------ | ------ |
| name   | string | 姓名   |
| mobile | string | 手机号 |
| email  | string | 邮件   |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getShareDeviceInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getShareDeviceInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getShareDeviceInfo({
  deviceId,
  success: (info) => {
    console.log('getShareDeviceInfo success', info);
  },
  fail: (error) => {
    console.log('getShareDeviceInfo fail', error);
  }
});
```

###### 成功示例

```json
{
  "name": "My Home ..",
  "email": "***@***.***"
}
```

##### 错误码

| 错误码 | 错误描述                     |
| ------ | ---------------------------- |
| 20001  | DeviceId is invalid          |
| 20022  | Device model is null         |
| 20057  | Get share device info failed |
#### device.getSupportedThirdPartyServices

##### 功能描述

获取设备支持的三方服务

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getSupportedThirdPartyServices } = device
getSupportedThirdPartyServices({ ... })
```

**原生小程序中使用**

```javascript
const { getSupportedThirdPartyServices } = ty.device
getSupportedThirdPartyServices({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性     | 类型                | 说明     |
| -------- | ------------------- | -------- |
| services | ThirdPartyService[] | 服务列表 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**ThirdPartyService**

| 属性          | 类型   | 默认值 | 必填 | 说明                         |
| ------------- | ------ | ------ | ---- | ---------------------------- |
| serviceId     | number |        | 是   | 服务 id                      |
| name          | string |        | 是   | 服务名称                     |
| iconUrl       | string |        | 是   | 图标 url                     |
| url           | string |        | 是   | 服务 url                     |
| attributeKey  | string |        | 是   | attributeKey                 |
| attributeSign | number |        | 是   | attributeSign                |
| widgetUrl     | string |        | 是   | widgetUrl                    |
| originJson    | any    |        | 是   | 包含云端完整字段的 json 对象 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  getSupportedThirdPartyServices,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { getSupportedThirdPartyServices } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getSupportedThirdPartyServices({
  deviceId,
  success: (info) => {
    console.log('getSupportedThirdPartyServices success', info);
  },
  fail: (error) => {
    console.log('getSupportedThirdPartyServices fail', error);
  }
});
```

###### 成功示例

```json
{
  "services": [
    {
      "attributeKey": "DUEROS_SUPPORT",
      "attributeSign": 19,
      "serviceId": 9,
      "iconUrl": "https://images.tuyacn.com/app/thirdparty/***@***.***",
      "originJson": {
        "id": 9,
        "attributeSign": 19,
        "url": "https://app-third.tuyacn.com/thirdCode?platform=dueros",
        "iconV2": "https://images.tuyacn.com/app/thirdparty/***@***.***",
        "iconMini": "https://images.tuyacn.comnull",
        "remark": "小度",
        "iconShow": "0",
        "group": "1",
        "icon": "https://images.tuyacn.com/app/thirdparty/***@***.***",
        "nameKey": "personal_speech_service_dueros",
        "newRemark": "小度",
        "attributeKey": "DUEROS_SUPPORT"
      },
      "name": "小度",
      "url": "https://app-third.tuyacn.com/thirdCode?platform=dueros"
    }
  ]
}
```

##### 错误码

| 错误码 | 错误描述                                  |
| ------ | ----------------------------------------- |
| 9005   | can‘t find service                        |
| 20001  | DeviceId is invalid                       |
| 20022  | Device model is null                      |
| 20072  | Get supported third party services failed |
#### device.isDeviceSupportOfflineReminder

##### 功能描述

设备是否支持离线提醒

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { isDeviceSupportOfflineReminder } = device
isDeviceSupportOfflineReminder({ ... })
```

**原生小程序中使用**

```javascript
const { isDeviceSupportOfflineReminder } = ty.device
isDeviceSupportOfflineReminder({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性      | 类型    | 说明                             |
| --------- | ------- | -------------------------------- |
| isSupport | boolean | support
是否支持设备离线提醒 |

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
  isDeviceSupportOfflineReminder,
  getLaunchOptionsSync
} from '@ray-js/ray';
// 原生调用方式
const { isDeviceSupportOfflineReminder } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

isDeviceSupportOfflineReminder({
  deviceId,
  success: (info) => {
    console.log('isDeviceSupportOfflineReminder success', info);
  },
  fail: (error) => {
    console.log('isDeviceSupportOfflineReminder fail', error);
  }
});
```

###### 成功示例

```json
{
  "isSupport": true
}
```

##### 错误码

| 错误码 | 错误描述                                   |
| ------ | ------------------------------------------ |
| 9005   | can‘t find service                         |
| 20001  | DeviceId is invalid                        |
| 20022  | Device model is null                       |
| 20059  | Get device offline reminder support failed |
#### device.syncDeviceInfo

##### 功能描述

同步设备信息

> 需引入`DeviceKit`，且在`>=1.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { syncDeviceInfo } = device
syncDeviceInfo({ ... })
```

**原生小程序中使用**

```javascript
const { syncDeviceInfo } = ty.device
syncDeviceInfo({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | 设备 id                                          |
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
import { syncDeviceInfo, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { syncDeviceInfo } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

syncDeviceInfo({
  deviceId,
  success: () => {
    console.log('syncDeviceInfo success');
  },
  fail: (error) => {
    console.log('syncDeviceInfo fail', error);
  }
});
```
#### device.renameDeviceName

##### 功能描述

修改设备名称

> 需引入`DeviceKit`，且在`>=2.4.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { renameDeviceName } = device
renameDeviceName({ ... })
```

**原生小程序中使用**

```javascript
const { renameDeviceName } = ty.device
renameDeviceName({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId 设备 id                                 |
| name     | string   |        | 是   | name 设备名称                                    |
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
import { renameDeviceName, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { renameDeviceName } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

renameDeviceName({
  deviceId,
  name: 'newName',
  success: () => {
    console.log('renameDeviceName success');
  },
  fail: (error) => {
    console.log('renameDeviceName fail', error);
  }
});
```

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 20001  | DeviceId is invalid |
| 20021  | Cannot find service |
| 20077  | rename device error |
#### device.toggleDeviceOfflineReminder

##### 功能描述

离线提醒开关

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { toggleDeviceOfflineReminder } = device
toggleDeviceOfflineReminder({ ... })
```

**原生小程序中使用**

```javascript
const { toggleDeviceOfflineReminder } = ty.device
toggleDeviceOfflineReminder({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
| state    | number   |        | 是   | state
设备离线提醒的开关状态 0:关 1:开       |
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
import { toggleDeviceOfflineReminder, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { toggleDeviceOfflineReminder } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

toggleDeviceOfflineReminder({
  deviceId,
  state: 1,
  success: (info) => {
    console.log('toggleDeviceOfflineReminder success', info);
  },
  fail: (error) => {
    console.log('toggleDeviceOfflineReminder fail', error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                              |
| ------ | ------------------------------------- |
| 6      | The parameter format is incorrect     |
| 9005   | can‘t find service                    |
| 20001  | DeviceId is invalid                   |
| 20022  | Device model is null                  |
| 20061  | Toggle device offline reminder failed |
#### device.addDeviceToDesk

##### 功能描述

添加设备到桌面

> 需引入`DeviceKit`，且在`>=2.2.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { addDeviceToDesk } = device
addDeviceToDesk({ ... })
```

**原生小程序中使用**

```javascript
const { addDeviceToDesk } = ty.device
addDeviceToDesk({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId
设备 id                             |
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
import { addDeviceToDesk, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { addDeviceToDesk } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

addDeviceToDesk({
  deviceId,
  success: () => {
    console.log('addDeviceToDesk success');
  },
  fail: (error) => {
    console.log('addDeviceToDesk fail', error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
| 9001   | Activity is invalid            |
| 9005   | can‘t find service             |
| 20001  | DeviceId is invalid            |
| 20022  | Device model is null           |
#### device.getEncryptLocalKeyWithData

##### 功能描述

获取加密过的设备 localKey
BLE(thing)蓝牙大数据通道传输过程中需要用到的特殊加密操作

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getEncryptLocalKeyWithData } = device
getEncryptLocalKeyWithData({ ... })
```

**原生小程序中使用**

```javascript
const { getEncryptLocalKeyWithData } = ty.device
getEncryptLocalKeyWithData({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId    | string   |        | 是   | 大数据通道加密计算结构
deviceId 设备 id      |
| keyDeviceId | string   |        | 是   | keyDeviceId 需要传输加密密钥的设备 Id            |
| success     | function |        | 否   | 接口调用成功的回调函数                           |
| fail        | function |        | 否   | 接口调用失败的回调函数                           |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

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
import { getEncryptLocalKeyWithData, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getEncryptLocalKeyWithData } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getEncryptLocalKeyWithData({
  deviceId,
  success: (res) => {
    console.log('getEncryptLocalKeyWithData success', res);
  },
  fail: (error) => {
    console.log('getEncryptLocalKeyWithData fail', error);
  }
});
```

###### 成功示例

```txt
42954ff1dcc15a996b7f270f4767f594
```
#### device.registerDeviceListListener

##### 功能描述

注册需要监听的设备列表的监听器

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { registerDeviceListListener } = device
registerDeviceListListener({ ... })
```

**原生小程序中使用**

```javascript
const { registerDeviceListListener } = ty.device
registerDeviceListListener({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性         | 类型     | 默认值 | 必填 | 说明                                             |
| ------------ | -------- | ------ | ---- | ------------------------------------------------ |
| deviceIdList | string[] |        | 是   | 需注册的设备列表                                 |
| success      | function |        | 否   | 接口调用成功的回调函数                           |
| fail         | function |        | 否   | 接口调用失败的回调函数                           |
| complete     | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

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
import { registerDeviceListListener, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { registerDeviceListListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

registerDeviceListListener({
  deviceIdList: [deviceId],
  success: () => {
    console.log('registerDeviceListListener success');
  },
  fail: (error) => {
    console.log('registerDeviceListListener fail', error);
  }
});
```
#### device.unregisterDeviceListListener

##### 功能描述

注销需要监听的设备列表的监听器

> 需引入`DeviceKit`，且在`>=2.3.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { unregisterDeviceListListener } = device
unregisterDeviceListListener({ ... })
```

**原生小程序中使用**

```javascript
const { unregisterDeviceListListener } = ty.device
unregisterDeviceListListener({ ... })
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
import { unregisterDeviceListListener } from '@ray-js/ray';
// 原生调用方式
const { unregisterDeviceListListener } = ty.device;

unregisterDeviceListListener({
  success: () => {
    console.log('unregisterDeviceListListener success');
  },
  fail: (error) => {
    console.log('unregisterDeviceListListener fail', error);
  }
});
```
#### device.onDeviceInfoUpdated

##### 功能描述

设备信息变化

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onDeviceInfoUpdated } = device
onDeviceInfoUpdated({ ... })
```

**原生小程序中使用**

```javascript
const { onDeviceInfoUpdated } = ty.device
onDeviceInfoUpdated({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
设备信息变化
**参数**

| 属性     | 类型   | 默认值 | 必填 | 说明                                                                                      |
| -------- | ------ | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any    |        | 否   | dps                                                                                       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onDeviceInfoUpdated,
  getLaunchOptionsSync,
  registerDeviceListListener
} from '@ray-js/ray';
// 原生调用方式
const { onDeviceInfoUpdated, registerDeviceListListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onDeviceInfoUpdated = (event) => {
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
onDeviceInfoUpdated(_onDeviceInfoUpdated);
```

###### 成功示例

```json
{
  "dps": {
    "20": true,
    "21": "white",
    "22": 12,
    "23": 57,
    "24": "",
    "25": "",
    "26": 0,
    "27": "",
    "28": "",
    "29": "",
    "34": false,
    "41": false
  },
  "deviceId": "device_id"
}
```

##### 常见问题

###### Q：为什么调用了 onDeviceInfoUpdated 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
#### device.offDeviceInfoUpdated

##### 功能描述

移除监听：设备信息变化

> 需引入`DeviceKit`，且在`>=1.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offDeviceInfoUpdated } = device
offDeviceInfoUpdated({ ... })
```

**原生小程序中使用**

```javascript
const { offDeviceInfoUpdated } = ty.device
offDeviceInfoUpdated({ ... })
```

##### 参数

**function listener**

onDeviceInfoUpdated 传入的监听函数。不传此参数则移除所有监听函数。
#### device.onDeviceOnlineStatusUpdate

##### 功能描述

设备上下线状态变更

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { onDeviceOnlineStatusUpdate } = device
onDeviceOnlineStatusUpdate({ ... })
```

**原生小程序中使用**

```javascript
const { onDeviceOnlineStatusUpdate } = ty.device
onDeviceOnlineStatusUpdate({ ... })
```

##### 体验 Demo

##### 参数

**function listener**
设备上下线状态变更
**参数**

| 属性       | 类型    | 默认值 | 必填 | 说明                                                                                                                                                      |
| ---------- | ------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| online     | boolean |        | 是   | 在线状态                                                                                                                                                  |
| deviceId   | string  |        | 是   | 设备 id                                                                                                                                                   |
| onlineType | number  |        | 是   | 设备在线类型\(预留，后期使用\)
Wi-Fi online 1 \<\< 0
Local online 1 \<\< 1
Bluetooth LE online 1 \<\< 2
Bluetooth LE mesh online 1 \<\< 3 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import {
  onDeviceOnlineStatusUpdate,
  getLaunchOptionsSync,
  registerDeviceListListener
} from '@ray-js/ray';
// 原生调用方式
const { onDeviceOnlineStatusUpdate, registerDeviceListListener } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

const _onDeviceOnlineStatusUpdate = (event) => {
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
onDeviceOnlineStatusUpdate(_onDeviceOnlineStatusUpdate);
```

###### 成功示例

```json
{
  "online": true,
  "onlineType": 0,
  "deviceId": "device_id"
}
```

##### 常见问题

###### Q：为什么调用了 onDeviceOnlineStatusUpdate 之后，无法收到消息？

A：需要先调用 registerDeviceListListener 注册设备列表监听器，才能收到设备相关消息。
#### device.offDeviceOnlineStatusUpdate

##### 功能描述

移除监听：设备上下线状态变更

> 需引入`DeviceKit`，且在`>=1.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { offDeviceOnlineStatusUpdate } = device
offDeviceOnlineStatusUpdate({ ... })
```

**原生小程序中使用**

```javascript
const { offDeviceOnlineStatusUpdate } = ty.device
offDeviceOnlineStatusUpdate({ ... })
```

##### 参数

**function listener**

onDeviceOnlineStatusUpdate 传入的监听函数。不传此参数则移除所有监听函数。

## 设备属性

#### saveDevProperty

 写入自定义设置的设备属性数据，保存后可通过 getDevProperty 获取。

##### 请求参数

| 参数         | 数据类型 | 说明                                                             | 是否必填 |
| ------------ | -------- | ---------------------------------------------------------------- | -------- |
| devId        | String   | 设备 ID                                                          | 是       |
| bizType      | Number   | 业务类型（自定义）。默认值 0 一般用于设备，1 用于设备群组；若想通过自定义 key 区分，请使用 propertyList 里的 code 来实现，请勿使用 bizType。 | 是       |
| propertyList | String   | 自定义属性，支持批量 k-v，格式为 stringify 后的 DeviceProperty[] | 是       |
| type | String   | 保存设备属性的配置规则，仅针对当前写入的属性有效，默认在设备重置和设备重置并清除数据时均会移除，目前支持配置 `remainAfterReset` 代表在设备重置时保留数据，仅在设备重置并清除数据时移除 | 否       |

**DeviceProperty**

| 参数  | 数据类型 | 说明                                                                           |
| ----- | -------- | ------------------------------------------------------------------------------ |
| code  | String   | 设备自定义属性 key，最长 30 字节（"device_favorite"为系统保留 code，请勿使用） |
| value | String   | 设备自定义属性内容,最长 1024 字节                                              |

##### 返回结果

> Boolean boolean

##### 请求示例

```javascript
import { saveDevProperty } from '@ray-js/ray';

saveDevProperty({
  devId: 'vdevxxxxx',
  bizType: 0,
  propertyList: JSON.stringify([
    { code: 'hello', value: 'world' },
    { code: 'foo', value: 'bar' },
  ]),
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true;
```
#### getDevProperty

 获取自定义设置的设备属性数据，可通过 saveDevProperty 写入。

##### 请求参数

| 参数    | 数据类型 | 说明               | 是否必填 |
| ------- | -------- | ------------------ | -------- |
| devId   | String   | 设备 ID            | 是       |
| bizType | Number   | 业务类型（自定义）。默认值 0 一般用于设备，1 用于设备群组；若想通过自定义 key 区分，请使用参数 code 来实现，请勿使用 bizType。 | 是       |
| code    | String   | 设备自定义属性 key | 是       |

##### 返回结果

| 参数   | 数据类型 | 说明         |
| ------ | -------- | ------------ |
| result | DevProperty[]   | 设备属性数据 |

**DevProperty**

| 参数        | 数据类型 | 说明               |
| ----------- | -------- | ------------------ |
| bizType     | Number   | 业务类型           |
| code        | String   | 设备自定义属性 key |
| devId       | String   | 设备 ID            |
| gmtCreate   | Number   | 创建时间           |
| gmtModified | Number   | 修改时间           |
| id          | String   | 唯一标识           |
| type        | String   | 保存设备属性时的配置规则               |
| value       | String   | 属性值             |

##### 请求示例

```javascript
import { getDevProperty } from '@ray-js/ray';

getDevProperty()
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
`[
  {
    devId: 'vdevoxxxxxx',
    gmtModified: 1657791430,
    code: 'hello',
    bizType: 0,
    id: '00003d1w15',
    type: '',
    gmtCreate: 1657790873,
    value: 'world',
  },
]`;
```
#### device.setDeviceProperty

##### 功能描述

设置设备属性

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { setDeviceProperty } = device
setDeviceProperty({ ... })
```

**原生小程序中使用**

```javascript
const { setDeviceProperty } = ty.device
setDeviceProperty({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| deviceId | string   |        | 是   | deviceId                                         |
| code     | string   |        | 是   | the custom data key                              |
| value    | string   |        | 是   | the custom data value                            |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性     | 类型    | 说明                            |
| -------- | ------- | ------------------------------- |
| deviceId | string  | deviceId                        |
| result   | boolean | set DeviceProperty successfully |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { setDeviceProperty, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { setDeviceProperty } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

setDeviceProperty({
  deviceId,
  code: 'test',
  value: 'test',
  success: (info) => {
    console.log('setDeviceProperty success', info);
  },
  fail: (error) => {
    console.log('setDeviceProperty fail', error);
  }
});
```

###### 成功示例

```json
true
```

##### 常见问题

###### Q：为什么安卓 value 值传对象值可以正常保存。IOS 保存会报错？

A：由于双端值传递方式不同，安卓端可对对象进行序列化，IOS 端未做相关处理，建议使用时将值转为字符串保存。
#### device.getDeviceProperty

##### 功能描述

获取设备属性

> 需引入`DeviceKit`，且在`>=1.2.6`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { getDeviceProperty } = device
getDeviceProperty({ ... })
```

**原生小程序中使用**

```javascript
const { getDeviceProperty } = ty.device
getDeviceProperty({ ... })
```

##### 体验 Demo

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                                                                      |
| -------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| deviceId | string   |        | 是   | deviceId 设备 id
支持跨面板获取其他的设备信息，当前面板可以传当前设备的 id 来进行获取 |
| dps      | any      |        | 否   | dps                                                                                       |
| success  | function |        | 否   | 接口调用成功的回调函数                                                                    |
| fail     | function |        | 否   | 接口调用失败的回调函数                                                                    |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                          |

##### 返回结果

**success**

| 属性       | 类型 | 说明               |
| ---------- | ---- | ------------------ |
| properties | any  | the properties map |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getDeviceProperty, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getDeviceProperty } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

getDeviceProperty({
  deviceId,
  success: (info) => {
    console.log('getDeviceProperty success', info);
  },
  fail: (error) => {
    console.log('getDeviceProperty fail', error);
  }
});
```

###### 成功示例

```json
{
  "properties": {
    "test": "test",
    "test1": "test1",
    "test2": "test2",
    "test3": "test3"
  }
}
```

## 位置信息

#### saveCustomizePosition

 创建设备自定义位置信息。

> **说明**：当`天气接口`不适用于`设备配网经纬度`时，可通过`自定义设备经纬度`获取实时天气，例如户外穿戴设备。

##### 请求参数

| 参数         | 数据类型 | 说明                                     | 是否必填 |
| ------------ | -------- | ---------------------------------------- | -------- |
| devId        | String   | 设备 ID                                  | 是       |
| lon          | String   | 经度                                     | 是       |
| lat          | String   | 纬度                                     | 是       |
| locationName | String   | 位置名称（目前没用，不影响天气返回结果） | 否       |

##### 返回结果

> Boolean boolean

##### 请求示例

```javascript
import { saveCustomizePosition } from '@ray-js/ray';

saveCustomizePosition({
  devId: `${YOUR_DEVICE_ID}`,
  lon: '113.2333',
  lat: '23.1666',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
true;
```
#### getCustomizePosition

 设备自定义位置信息获取。

##### 请求参数

| 参数  | 数据类型 | 说明    | 是否必填 |
| ----- | -------- | ------- | -------- |
| devId | String   | 设备 ID | 是       |

##### 返回结果

| 参数 | 数据类型 | 说明 |
| ---- | -------- | ---- |
| lon  | String   | 经度 |
| lat  | String   | 纬度 |

##### 请求示例

```javascript
import { getCustomizePosition } from '@ray-js/ray';

getCustomizePosition({
  devId: `${YOUR_DEVICE_ID}`,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  "lon": "113.2333",
  "lat": "23.1666"
}
```

## 天气

#### getWeathers

> **说明**：设备天气根据 `设备配网经纬度` 和 `IP 地址` 获取。如果本接口仅返回`true`，但无天气详情数据，那么该设备的 `设备配网经纬度` 和 `IP 地址` 可能设置错误，请查看设备日志。

天气预报接口。

##### 请求参数

| 参数      | 数据类型 | 描述                                       | 是否必填 |
| --------- | -------- | ------------------------------------------ | -------- |
| devId     | String   | 设备 ID                                    | 是       |
| dataRange | Integer  | 预报天数（默认值为 7，最大可预报天数为 7） | 否       |

##### 返回结果

| 参数     | 数据类型   | 说明        |
| -------- | ---------- | ----------- |
| c        | c[]        | 见 c        |
| weathers | weathers[] | 见 weathers |

- **c**

| 参数 | 数据类型 | 说明     |
| ---- | -------- | -------- |
| name | String   | 城市名称 |
| id   | Number   | 城市 ID  |

- **weathers**

| 参数             | 数据类型 | 说明                                         |
| ---------------- | -------- | -------------------------------------------- |
| temp             | Number   | 风向                                         |
| thigh            | Number   | 最高温度，国内外都是单位摄氏度               |
| pressure         | Number   | 概述                                         |
| condition        | String   | 体感温度                                     |
| tlow             | Number   | 最低温度 ，国内外都是单位摄氏度              |
| condIconUrl      | String   | 日落时间戳                                   |
| humidity         | Number   | 空气湿度                                     |
| conditionNum     | String   | 天气文本编号                                 |
| windSpeed        | String   | 风速，国内外都是 m/s                         |
| windDir          | String   | 风向                                         |
| windLevel        | Number   | 风速等级                                     |
| zoneId           | String   | 时区                                         |
| sunSetTimestamp  | Number   | 日落时间戳                                   |
| sunRiseTimestamp | Number   | 日出时间戳                                   |
| sunSet           | String   | 日落时间文本，文本格式是 yyyy-MM-dd HH:mm:ss |
| sunRise          | String   | 日出时间文本，文本格式是 yyyy-MM-dd HH:mm:ss |

##### 请求示例

```javascript
import { getWeathers } from '@ray-js/ray';

getWeathers({
  devId: `${YOUR_DEVICE_ID}`,
  dataRange: 7,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  c:
  {
    name: String,   // 城市名称
    id: Number,        // 城市id
  },
  weathers:
	[
    items:
	   {
	      temp: Number,   // 温度 ，国内外都是单位摄氏度
 	      thigh: Number,     // 最高温度 ，国内外都是单位摄氏度
	      pressure: Number,      //  大气气压
	      condition: String,      // 天气文本描述
	      tlow: Number,      // 最低温度 ，国内外都是单位摄氏度
	      condIconUrl: String,  //  天气图标地址
	      humidity: Number,   //  空气湿度
	      conditionNum: String,    // 天气文本编号
	      windSpeed: String,       // 风速，国内外都是 m/s
	      windDir: String,     // 风向
	      windLevel: Number,     //  风速等级
	      zoneId: String,    //  时区
	      sunRise: String,    //  日出文本
	      sunSet: String,     //   日落文本
	      sunSetTimestamp: Number    // 日落时间戳
	      sunRiseTimestamp: Number    // 日出时间戳
	    }
  ]
}
```
#### getWeatherQuality

> **说明**：设备天气根据 `设备配网经纬度` 和 `IP 地址` 获取。如果本接口仅返回`true`，但无天气详情数据，那么该设备的 `设备配网经纬度` 和 `IP 地址` 可能设置错误，请查看设备日志。

 通过设备 ID 获取当天天气。

##### 请求参数

| 参数    | 数据类型 | 描述                                     | 是否必填 |
| ------- | -------- | ---------------------------------------- | -------- |
| devId   | String   | 设备 ID                                  | 是       |
| isLocal | Boolean  | 是否使用用户本地时区（ 默认值是 false ） | 否       |

##### 返回结果

| 参数 | 数据类型 | 说明 |
| ---- | -------- | ---- |
| c    | c[]      | 见 c |
| w    | w[]      | 见 w |

- **c**

| 参数 | 数据类型 | 说明     |
| ---- | -------- | -------- |
| name | String   | 城市名称 |
| id   | Number   | 城市 ID  |

- **w**

| 参数             | 数据类型 | 说明                                         |
| ---------------- | -------- | -------------------------------------------- |
| windDir          | String   | 风向                                         |
| tips             | String   | 概述                                         |
| realFeel         | Number   | 体感温度                                     |
| no2              | Number   | 二氧化氮                                     |
| so2              | Number   | 二氧化硫                                     |
| zoneId           | String   | 时区                                         |
| humidity         | Number   | 空气湿度                                     |
| windSpeed        | String   | 风速，国内外都是 m/s                         |
| temp             | Number   | 温度 ，国内外都是单位摄氏度                  |
| o3               | Number   | 臭氧                                         |
| pm10             | Number   | PM10                                         |
| pressure         | Number   | 大气气压                                     |
| co               | Number   | 一氧化碳                                     |
| qualityLevel     | Number   | 空气质量评分等级                             |
| quality          | String   | 空气质量评分                                 |
| condition        | String   | 天气文本描述                                 |
| pm25             | Number   | PM25                                         |
| condIconUrl      | String   | 天气图标地址                                 |
| aqi              | Number   | 空气质量                                     |
| conditionNum     | String   | 天气文本编号                                 |
| sunSetTimestamp  | Number   | 日落时间戳                                   |
| sunRiseTimestamp | Number   | 日出时间戳                                   |
| sunSet           | String   | 日落时间文本，文本格式是 yyyy-MM-dd HH:mm:ss |
| sunRise          | String   | 日出时间文本，文本格式是 yyyy-MM-dd HH:mm:ss |

##### 请求示例

```javascript
import { getWeatherQuality } from '@ray-js/ray';

getWeatherQuality({
  devId: `${YOUR_DEVICE_ID}`,
  isLocal: true,
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
  c:
  {
    name: String,   // 城市名称
    id: Number,    // 城市id
  },
  w:
  {
    windDir: String,   // 风向
    tips: String,   //  概述
    realFeel: Number   //  体感温度
    no2:  Number   // 二氧化氮
    so2: Number //  二氧化硫
    zoneId: String,   //  时区
    humidity: Number,   //  空气湿度
    windSpeed: String,       // 风速，国内外都是 m/s
    temp: Number,   // 温度 ，国内外都是单位摄氏度
    o3: Number,      // 臭氧
    pm10: Number,     // pm10
    pressure: Number,      //  大气气压
    co: Number,    // 一氧化碳
    qualityLevel: Number,   // 空气质量评分等级
    quality: String,      //  空气质量评分
    condition: String,      // 天气文本描述
    pm25: Number,     // pm25
    condIconUrl: String,  //  天气图标地址
    aqi: Number,    // 空气质量
    conditionNum: String,    // 天气文本编号
    sunRise: String,    //  日出文本
    sunSet: String,     //   日落文本
    sunSetTimestamp: Number    // 日落时间戳
    sunRiseTimestamp: Number    // 日出时间戳
  }
}
```

## 告警

#### getDevAlarmList

> **注意**：</br>如需使用告警接口请先为产品配置告警，具体操作参见 [设置告警](https://developer.tuya.com/cn/docs/iot/configure-in-platform/advanced-features/alarm?id=K93ixsmlff32o)。

 根据设备 ID 查询告警列表信息。

##### 请求参数

| 参数  | 数据类型 |  说明   | 是否必填 |
| :---: | :------: | :-----: | :------: |
| devId |  String  | 设备 ID |    是    |

##### 返回结果

**Object object**

| 参数              | 数据类型                           | 说明                     |
| ----------------- | ---------------------------------- | ------------------------ |
| auditStatus       | Number                             | 审核状态                 |
| boundForPanel     | Boolean                            | 是否被场景面板绑定       |
| boundForWiFiPanel | Boolean                            | 是否被 WIFI 场景面板绑定 |
| enabled           | Boolean                            | 是否启用                 |
| i18nData          | { name: { en: string; zh: string } | 多语言数据体             |
| id                | String                             | 规则 ID                  |
| localLinkage      | Boolean                            | 是否为本地联动           |
| name              | String                             | 规则名称                 |
| newLocalScene     | Boolean                            | 是否为 APP 管控本地联动  |
| stickyOnTop       | Boolean                            | 场景是否显示在首页       |

##### 请求示例

```js
import { getDevAlarmList } from '@ray-js/ray';
import { hooks } from '@ray-js/panel-sdk';
const { useDevInfo } = hooks;

const devInfo = useDevInfo();

getDevAlarmList(devInfo.devId)
  .then((response) => {
    console.log(response);
    console.log(JSON.stringify(response));
  })
  .catch();
```

##### 返回示例

```js
{
  "auditStatus": 1,
  "boundForPanel": false,
  "boundForWiFiPanel": false,
  "enabled": true,
  "i18nData": {"name": { "en": "", "zh": "" }, "content": { "en": "", "zh": "" }},
  "id": "35ix",
  "iotAutoAlarm": false,
  "isLogicRule": false,
  "localLinkage": false,
  "name": "Wi-Fi 人体红外报警",
  "newLocalScene": false,
  "stickyOnTop": false
  }
```
#### setAlarmSwitch

> **注意**：</br>如需使用告警接口请先为产品配置告警，具体操作参见 [设置告警](https://developer.tuya.com/cn/docs/iot/configure-in-platform/advanced-features/alarm?id=K93ixsmlff32o)。

 启用或者禁用设备的告警。

##### 请求参数

|   参数   | 数据类型 |    说明    | 是否必填 |
| :------: | :------: | :--------: | :------: |
|  devId   |  String  |  设备 ID   |    是    |
| disabled | Boolean  |  是否禁用  |    否    |
| ruleIds  |  String  | 规则 ID 串 |    是    |

##### 返回结果

> Boolean boolean

**请求示例**

```js
import { setAlarmSwitch } from '@ray-js/ray';

setAlarmSwitch({
  devId: 'vdevo159297901023732',
  disabled: true, // 告警全部开启时，参数值为 false
  ruleIds: '3TIXnerlNHeJAugm,8skS74SGlVkwSdbD', // 告警全部开启时，该字段为空字符串
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回结果

```js
true;
```

## 日志

#### getDpLogDays

 获取设备每日上报的数据统计。

##### 请求参数

|  |  | 说明                                                                                         |  |
| :---------------------------------: | :-------------------------------------: | :------------------------------------------------------------------------------------------- | :-------------------------------------: |
|                devId                |                 String                  | 设备 ID                                                                                      |                   是                    |
|                dpId                 |                 String                  | DP 点的 ID                                                                                   |                   是                    |
|                type                 |                 String                  | 统计的类型，`sum`、`minux` 或 `max`。请提交工单确保 API 统计类型和后台管理系统统计类型一致。 |                   否                    |
|              startDay               |                 String                  | 开始日期                                                                                     |                   是                    |
|               endDay                |                 String                  | 结束日期                                                                                     |                   是                    |

##### 返回结果

| 参数   | 数据类型 | 说明         |
| ------ | -------- | ------------ |
| total  | string   | 总条数       |
| values | string   | 每天对应的值 |
| days   | string   | 天的集合     |

##### 请求示例

```javascript
import { getDpLogDays } from '@ray-js/ray';

getDpLogDays({
  devId: 'vdevo161733425146241',
  dpId: '26',
  type: 'sum',
  startDay: '20210501',
  endDay: '20210530',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
    "total": "0.00",
    "values": [
        "0.00",
        "0.00"
    ],
    "days": [
        "05-18",
        "05-19"
    ]
}
```
#### getDpReportLog

 获取 DP 点上报日志。

##### 请求参数

|   参数   | 数据类型 | 说明                                         | 是否必填 |
| :------: | :------: | :------------------------------------------- | :------: |
|  devId   |  String  | 设备 ID                                      |    是    |
|  dpIds   |  String  | DP 点 ID，可以是多个 DP，用逗号隔开即可      |    是    |
|  offset  | Integer  | 查询返回结果时从指定序列后的结果开始返回     |    是    |
|  limit   | Integer  | 单页的最大值，offset + limit 要小于等于 4000 |    是    |
| sortType |  String  | DESC 倒序 或者 ASC 顺序                      |    否    |

##### 返回结果

| 参数    | 数据类型 | 说明         |
| ------- | -------- | ------------ |
| total   | number   | 总条数       |
| dps     | Dp[]     | 见 Dp        |
| hasNext | boolean  | 是否有下一页 |

##### 请求示例

```javascript
import { getDpReportLog } from '@ray-js/ray';

getDpReportLog({
  devId: `${YOUR_DEVICE_ID}`,
  dpIds: '20,30', // 多个DP
  offset: 0,
  limit: 3,
  sortType: 'ASC',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
    "dps": [
        {
            "dpId": 20,
            "value": "false",
            "timeStamp": 1621392860,
            "timeStr": "2021-05-19 10:54:20"
        },
        {
            "dpId": 20,
            "value": "true",
            "timeStamp": 1621392861,
            "timeStr": "2021-05-19 10:54:21"
        },
        {
            "dpId": 20,
            "value": "false",
            "timeStamp": 1621393756,
            "timeStr": "2021-05-19 11:09:16"
        }
    ],
    "hasNext": true,
    "total": 7,
    "dpc": []
}
```
#### getLogInSpecifiedTime

获取 DP 点指定时间段上报日志。

##### 请求参数

|   参数    | 数据类型 | 说明                                         | 是否必填 |
| :-------: | :------: | :------------------------------------------- | :------: |
|   devId   |  String  | 设备 ID                                      |    是    |
|   dpIds   |  String  | DP 点 ID，可以是多个 DP，用逗号隔开即可      |    是    |
|  offset   | Integer  | 查询返回结果时从指定序列后的结果开始返回     |    是    |
|   limit   | Integer  | 单页的最大值，offset + limit 要小于等于 4000 |    是    |
| startTime |  String  | 设备上报的时间，查询起始时间，单位为毫秒     |    否    |
|  endTime  |  String  | 设备上报的时间，查询结束时间，单位为毫秒     |    否    |
| sortType  |  String  | DESC 倒序 或 ASC 顺序                        |    否    |

##### 返回结果

| 参数    | 数据类型 | 说明         |
| ------- | -------- | ------------ |
| total   | number   | 总数据       |
| dps     | Dp[]     | 见 Dp        |
| hasNext | boolean  | 是否有下一页 |

**Dp**

| 参数      | 数据类型 | 说明                                             |
| --------- | -------- | ------------------------------------------------ |
| timeStamp | number   | 上报数据的时间戳格式                             |
| dpId      | number   | DP 点的 id                                       |
| timeStr   | string   | 根据设备时区转换后的时间格式 yyyy-MM-dd HH:mm:ss |
| value     | string   | DP 点的值                                        |

##### 请求示例

```javascript
import { getLogInSpecifiedTime } from '@ray-js/ray';

getLogInSpecifiedTime({
  devId: `${YOUR_DEVICE_ID}`,
  dpIds: '25,20', // 多个DP
  offset: 0,
  limit: 3,
  startTime: '',
  endTime: '',
  sortType: 'ASC',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
    "dps": [
        {
            "dpId": 20,
            "value": "false",
            "timeStamp": 1621392860,
            "timeStr": "2021-05-19 10:54:20"
        },
        {
            "dpId": 20,
            "value": "true",
            "timeStamp": 1621392861,
            "timeStr": "2021-05-19 10:54:21"
        },
        {
            "dpId": 20,
            "value": "false",
            "timeStamp": 1621393756,
            "timeStr": "2021-05-19 11:09:16"
        }
    ],
    "hasNext": true,
    "total": 8,
    "dpc": []
}
```
#### getLogUserAction

 获取用户操作的下发日志。

##### 请求参数

|   参数   | 数据类型 | 说明                                         | 是否必填 |
| :------: | :------: | :------------------------------------------- | :------: |
|  devId   |  String  | 设备 ID                                      |    是    |
|  dpIds   |  String  | DP 点 ID，可以是多个 DP，用逗号隔开即可      |    是    |
|  offset  | Integer  | 查询返回结果时从指定序列后的结果开始返回     |    是    |
|  limit   | Integer  | 单页的最大值，offset + limit 要小于等于 4000 |    是    |
| sortType |  String  | DESC or ASC                                  |    否    |

##### 返回结果

| 参数    | 数据类型 | 说明         |
| ------- | -------- | ------------ |
| total   | number   | 数据总条数   |
| dps     | Dp[]     | 见 Dp        |
| hasNext | Boolean  | 是否有下一页 |

##### 请求示例

```javascript
import { getLogUserAction } from '@ray-js/ray';

getLogUserAction({
  devId: `${YOUR_DEVICE_ID}`,
  dpIds: '20,21', // 多个DP
  offset: 0,
  limit: 3,
  sortType: 'ASC',
})
  .then((response) => {
    console.log(response);
  })
  .catch();
```

##### 返回示例

```javascript
{
    "dps": [
        {
            "dpId": 20,
            "value": "false",
            "timeStamp": 1621392860,
            "timeStr": "2021-05-19 10:54:20"
        },
        {
            "dpId": 20,
            "value": "true",
            "timeStamp": 1621392861,
            "timeStr": "2021-05-19 10:54:21"
        },
        {
            "dpId": 20,
            "value": "false",
            "timeStamp": 1621393756,
            "timeStr": "2021-05-19 11:09:16"
        }
    ],
    "hasNext": true,
    "total": 15,
    "dpc": []
}
```
