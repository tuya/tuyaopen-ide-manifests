# 设备 (device)


## 扫码

#### scanCode

##### 功能描述

调起客户端扫码界面进行扫码
注意：Android 返回的数据中，只有 result 字段可用，其他字段无意义。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { scanCode } from '@ray-js/ray'
scanCode({ ... })
```

**原生小程序中使用**

```javascript
ty.scanCode({ ... })
```

##### 请求参数

**Object object**

| 属性              | 类型         | 默认值                  | 必填 | 说明                                                    |
| ----------------- | ------------ | ----------------------- | ---- | ------------------------------------------------------- |
| onlyFromCamera    | boolean      | `false`                 | 否   | 是否只能从相机扫码，不允许从相册选择图片                |
| isShowActionTitle | boolean      | `true`                  | 否   | 是否显示动作标题\(仅 Android 生效\)
`最低版本3.3.3` |
| isShowTorch       | boolean      | `false`                 | 否   | 是否显示闪关灯\(仅 Android 生效\)
`最低版本3.3.3`   |
| isShowKeyboard    | boolean      | `false`                 | 否   | 是否显示输入设置代码
`最低版本3.12.0`               |
| keyboardBean      | KeyboardBean |                         | 否   | 输入设置文案修改
`最低版本3.12.0`                   |
| customTips        | string       |                         | 否   | 自定义提示标语\(仅 Android 生效\)
`最低版本3.3.3`   |
| scanType          | string[]     | `["barCode", "qrCode"]` | 否   | 扫码类型                                                |
| success           | function     |                         | 否   | 接口调用成功的回调函数                                  |
| fail              | function     |                         | 否   | 接口调用失败的回调函数                                  |
| complete          | function     |                         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）        |

##### 返回结果

**success**

| 属性     | 类型   | 说明                                                                                       |
| -------- | ------ | ------------------------------------------------------------------------------------------ |
| result   | string | 所扫码的内容                                                                               |
| scanType | string | 所扫码的类型                                                                               |
| charSet  | string | 所扫码的字符集                                                                             |
| path     | string | 当所扫的码为当前小程序二维码时，会返回此字段，内容为二维码携带的 path \(不一定会有返回值\) |
| rawData  | string | 原始数据，base64 编码                                                                      |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**KeyboardBean**

| 属性        | 类型   | 默认值 | 必填 | 说明                 |
| ----------- | ------ | ------ | ---- | -------------------- |
| title       | string |        | 否   | 键盘标题&&输入页标题 |
| placeholder | string |        | 否   | 输入页输入框提示语   |
| desc        | string |        | 否   | 输入页输入描述       |
| actionText  | string |        | 否   | 输入页操作按钮文案   |

##### 代码示例

###### 请求示例

```jsx | pure
import React, { useState } from 'react';

import { Button, View, scanCode } from '@ray-js/ray';

export default function Demo() {
  const [scanResult, setScanResult] = useState('');

  const handleScanCode = () => {
    scanCode({
      onlyFromCamera: true, // 只允许从相机扫码
      isShowActionTitle: true, // 显示动作标题（仅Android生效）
      isShowTorch: true, // 显示闪光灯选项（仅Android生效）
      isShowKeyboard: true, // 显示输入设置代码选项
      keyboardBean: {
        title: '输入条形码',
        placeholder: '请输入条形码',
        desc: '如果无法扫描，请手动输入条形码',
        actionText: '确认'
      },
      customTips: '将二维码/条形码放入框内，即可自动扫描', // 自定义提示语（仅Android生效）
      scanType: ['qrCode', 'barCode'], // 扫码类型，包括二维码和条形码
      success: (res) => {
        setScanResult(
          JSON.stringify(
            {
              result: res.result,
              scanType: res.scanType,
              charSet: res.charSet,
              path: res.path,
              rawData: res.rawData
            },
            null,
            2
          )
        );
      },
      fail: (error) => {
        console.error('扫码失败：', error);
        setScanResult(`扫码失败：${error.errorMsg}`);
      }
    });
  };

  return (
    <View style={{ width: '100%', height: '100%', padding: '20rpx' }}>
      <Button onClick={handleScanCode}>开始扫码</Button>
      <View style={{ marginTop: '20rpx', whiteSpace: 'pre-wrap' }}>
        扫码结果：{scanResult}
      </View>
    </View>
  );
}
```

###### 成功示例

```json
{
  "result": "hello world"
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
| 9001   | Activity is invalid            |
| 9005   | can‘t find service             |

## 震动

#### vibrateShort

##### 功能描述

使手机发生较短时间的振动（30 ms）。仅在 iPhone 7 / 7 Plus 以上及 Android 机型生效

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { vibrateShort } from '@ray-js/ray'
vibrateShort({ ... })
```

**原生小程序中使用**

```javascript
ty.vibrateShort({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| type     | string   |        | 是   | 震动强度类型，有效值为：heavy、medium、light     |
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

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |
#### vibrateLong

##### 功能描述

使手机发生较长时间的振动（400 ms)

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { vibrateLong } from '@ray-js/ray'
vibrateLong({ ... })
```

**原生小程序中使用**

```javascript
ty.vibrateLong({ ... })
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

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |

## 屏幕

#### getScreenBrightness

##### 功能描述

获取屏幕亮度

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getScreenBrightness } from '@ray-js/ray'
getScreenBrightness({ ... })
```

**原生小程序中使用**

```javascript
ty.getScreenBrightness({ ... })
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

| 属性  | 类型   | 说明                                   |
| ----- | ------ | -------------------------------------- |
| value | number | 屏幕亮度值，范围 0 ~ 1。0 最暗，1 最亮 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 9001   | Activity is invalid |
#### setKeepScreenOn

##### 功能描述

设置是否保持常亮状态

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setKeepScreenOn } from '@ray-js/ray'
setKeepScreenOn({ ... })
```

**原生小程序中使用**

```javascript
ty.setKeepScreenOn({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型     | 默认值 | 必填 | 说明                                             |
| ------------ | -------- | ------ | ---- | ------------------------------------------------ |
| keepScreenOn | boolean  |        | 是   | 是否保持屏幕常亮                                 |
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

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 9001   | Activity is invalid |
#### setScreenBrightness

##### 功能描述

设置屏幕亮度

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setScreenBrightness } from '@ray-js/ray'
setScreenBrightness({ ... })
```

**原生小程序中使用**

```javascript
ty.setScreenBrightness({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| value    | number   |        | 是   | 屏幕亮度值，范围 0 ~ 1。0 最暗，1 最亮           |
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

##### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 9001   | Activity is invalid               |

## 蓝牙-通用

#### onBluetoothAdapterStateChange

##### 功能描述

监听蓝牙适配器状态变化事件，需要申请蓝牙权限

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onBluetoothAdapterStateChange } from '@ray-js/ray'
onBluetoothAdapterStateChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onBluetoothAdapterStateChange({ ... })
```

##### 参数

**function listener**
监听蓝牙适配器状态变化事件，需要申请蓝牙权限
**参数**

| 属性      | 类型    | 默认值 | 必填 | 说明               |
| --------- | ------- | ------ | ---- | ------------------ |
| available | boolean |        | 是   | 蓝牙适配器是否可用 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { authorize, onBluetoothAdapterStateChange } from '@ray-js/ray';

// 原生调用方式
const { authorize, onBluetoothAdapterStateChange } = ty;

authorize({
  scope: 'scope.bluetooth',
  success: () => {
    onBluetoothAdapterStateChange(console.log);
  }
});
```

###### 成功示例

```json
{ "available": false }
```

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |
| 9004   | app no permission  |
| 9005   | can‘t find service |

##### 常见问题

###### Q: 为什么蓝牙状态变化时，onBluetoothAdapterStateChange 没有回调？

A: 调用 onBluetoothAdapterStateChange 前需要申请蓝牙权限。
#### offBluetoothAdapterStateChange

##### 功能描述

取消监听蓝牙适配器状态变化事件

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offBluetoothAdapterStateChange } from '@ray-js/ray'
offBluetoothAdapterStateChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offBluetoothAdapterStateChange({ ... })
```

##### 参数

**function listener**

onBluetoothAdapterStateChange 传入的监听函数。不传此参数则移除所有监听函数。

## Wi-Fi

#### device.requestWifiSignal

##### 功能描述

查询设备 Wi-Fi 信号

> 需引入`DeviceKit`，且在`>=4.9.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { device } from '@ray-js/ray'
const { requestWifiSignal } = device
requestWifiSignal({ ... })
```

**原生小程序中使用**

```javascript
const { requestWifiSignal } = ty.device
requestWifiSignal({ ... })
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
import { requestWifiSignal, getLaunchOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { requestWifiSignal } = ty.device;
const { getLaunchOptionsSync } = ty;
// 启动参数中获取设备 id
const {
  query: { deviceId }
} = getLaunchOptionsSync();

requestWifiSignal({
  deviceId,
  success: (signal) => {
    console.log('requestWifiSignal success', signal);
  },
  fail: (error) => {
    console.log('requestWifiSignal fail', error);
  }
});
```

###### 成功示例

```json
-50
```
#### getConnectedWifi

##### 功能描述

获取当前连接的 wifi 信息
注意：Android 需要申请手机的位置权限、Wi-Fi 状态权限、网络权限；iOS 上不可用

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getConnectedWifi } from '@ray-js/ray'
getConnectedWifi({ ... })
```

**原生小程序中使用**

```javascript
ty.getConnectedWifi({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值  | 必填 | 说明                                                                                                                                                                                                                                                              |
| ----------- | -------- | ------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| partialInfo | boolean  | `false` | 否   | 是否需要返回部分 Wi-Fi 信息
安卓 thing.getConnectedWifi 若设置了 partialInfo:true ，将会返回只包含 SSID 属性的 WifiInfo 对象。
iOS thing.getConnectedWifi 若设置了 partialInfo:true ，将会返回只包含 SSID、BSSID 属性的 WifiInfo 对象。
默认值：false |
| success     | function |         | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                            |
| fail        | function |         | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                            |
| complete    | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                                  |

##### 返回结果

**success**

| 属性           | 类型    | 说明                                                                 |
| -------------- | ------- | -------------------------------------------------------------------- |
| SSID           | string  | wifi 的 SSID                                                         |
| BSSID          | string  | wifi 的 BSSID                                                        |
| signalStrength | number  | Wi-Fi 信号强度, 安卓取值 0 ～ 100 ，iOS 取值 0 ～ 1 ，值越大强度越大 |
| secure         | boolean | Wi-Fi 是否安全
Android：Android 系统 12 开始支持。               |
| frequency      | number  | Wi-Fi 频段单位 MHz                                                   |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9004   | app no permission  |
| 9005   | can‘t find service |
| 10021  | SSID nil error     |

##### 常见问题

###### Q: 在 Android、iOS 端为什么调用不成功？

A: 需要注意以下权限要求:

- Android 端需要申请以下权限:
  - 位置权限
  - Wi-Fi 状态权限
  - 网络权限
- iOS 端 不可用
#### getWifiList

##### 功能描述

获取手机附近的 Wi-Fi 列表；列表数据通过 onGetWifiList 事件发送
注意：Android 需要申请手机的位置权限、Wi-Fi 状态权限、网络权限；iOS 上不可用

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getWifiList } from '@ray-js/ray'
getWifiList({ ... })
```

**原生小程序中使用**

```javascript
ty.getWifiList({ ... })
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
import { getWifiList, onGetWifiList } from '@ray-js/ray';

// 原生调用方式
const { onGetWifiList, getWifiList } = ty;

onGetWifiList({
  success: console.log,
  fail: console.error
});

getWifiList({
  success: console.log,
  fail: console.error
});
```

###### 成功示例

```json
[
  {
    "BSSID": "fc:34:97:b3:12:a4",
    "SSID": "A",
    "frequency": 5180,
    "secure": false,
    "signalStrength": 4
  },
  {
    "BSSID": "00:0c:43:26:60:80",
    "SSID": "ll",
    "frequency": 2437,
    "secure": false,
    "signalStrength": 4
  }
]
```

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9004   | app no permission  |
| 9005   | can‘t find service |

##### 常见问题

###### Q: 在 Android、iOS 端为什么调用不成功？

A: 需要注意以下权限要求:

- Android 端需要申请以下权限:
  - 位置权限
  - Wi-Fi 状态权限
  - 网络权限
- iOS 端 不可用
#### onGetWifiList

##### 功能描述

监听获取到 Wi-Fi 列表数据事件

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onGetWifiList } from '@ray-js/ray'
onGetWifiList({ ... })
```

**原生小程序中使用**

```javascript
ty.onGetWifiList({ ... })
```

##### 参数

**function listener**
监听获取到 Wi-Fi 列表数据事件
**参数**

| 属性     | 类型       | 默认值 | 必填 | 说明       |
| -------- | ---------- | ------ | ---- | ---------- |
| wifiList | WifiInfo[] |        | 是   | Wi-Fi 列表 |

##### 引用对象

**WifiInfo**

| 属性           | 类型    | 默认值 | 必填 | 说明                                                                 |
| -------------- | ------- | ------ | ---- | -------------------------------------------------------------------- |
| SSID           | string  |        | 是   | wifi 的 SSID                                                         |
| BSSID          | string  |        | 是   | wifi 的 BSSID                                                        |
| signalStrength | number  |        | 是   | Wi-Fi 信号强度, 安卓取值 0 ～ 100 ，iOS 取值 0 ～ 1 ，值越大强度越大 |
| secure         | boolean |        | 是   | Wi-Fi 是否安全
Android：Android 系统 12 开始支持。               |
| frequency      | number  |        | 是   | Wi-Fi 频段单位 MHz                                                   |
#### offGetWifiList

##### 功能描述

移除监听：监听获取到 Wi-Fi 列表数据事件

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offGetWifiList } from '@ray-js/ray'
offGetWifiList({ ... })
```

**原生小程序中使用**

```javascript
ty.offGetWifiList({ ... })
```

##### 参数

**function listener**

onGetWifiList 传入的监听函数。不传此参数则移除所有监听函数。

## 剪切板

#### setClipboardData

##### 功能描述

设置系统剪贴板的内容

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setClipboardData } from '@ray-js/ray'
setClipboardData({ ... })
```

**原生小程序中使用**

```javascript
ty.setClipboardData({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值  | 必填 | 说明                                                                                                                                                                                                                                           |
| ----------- | -------- | ------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| isSensitive | boolean  | `false` | 否   | 是否敏感信息
true 是; false 否; 默认非敏感信息
如果是敏感信息, 则可组织敏感内容出现在 Android 13 及更高版本中的复制视觉确认中显示的任何内容预览中
需要注意的是, 该属性仅针对 Android 13 及更高版本的机型上适用
`最低版本3.2.0` |
| data        | string   |         | 是   | 剪贴板的内容                                                                                                                                                                                                                                   |
| success     | function |         | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                         |
| fail        | function |         | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                         |
| complete    | function |         | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                               |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                          |
| ------ | --------------------------------- |
| 6      | The parameter format is incorrect |
| 7      | API Internal processing failed    |
#### getClipboardData

##### 功能描述

获取系统剪贴板的内容

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getClipboardData } from '@ray-js/ray'
getClipboardData({ ... })
```

**原生小程序中使用**

```javascript
ty.getClipboardData({ ... })
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

| 属性 | 类型   | 说明         |
| ---- | ------ | ------------ |
| data | string | 剪贴板的内容 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |

## 电话

#### makePhoneCall

##### 功能描述

拨打电话

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { makePhoneCall } from '@ray-js/ray'
makePhoneCall({ ... })
```

**原生小程序中使用**

```javascript
ty.makePhoneCall({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                             |
| ----------- | -------- | ------ | ---- | ------------------------------------------------ |
| phoneNumber | string   |        | 是   | 需要拨打的电话号码                               |
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

## 网络

#### getNetworkType

##### 功能描述

获取网络类型

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getNetworkType } from '@ray-js/ray'
getNetworkType({ ... })
```

**原生小程序中使用**

```javascript
ty.getNetworkType({ ... })
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

| 属性           | 类型   | 说明                                    |
| -------------- | ------ | --------------------------------------- |
| networkType    | string | 网络类型                                |
| signalStrength | number | 信号强弱，单位 dbm
注意: iOS 不支持 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
| 9001   | Activity is invalid            |
#### onNetworkStatusChange

##### 功能描述

监听网络状态变化事件
注意：在 Android 上，该事件只通知网络状态的变化。如需获取最新的网络状态信息，请重新调用 getNetworkType 接口。
注意：在 Android 上，网络状态发生改变时，系统并不一定立马变更网络状态信息，存在一定的延迟。因此触发该事件时，业务上可能需要延迟调用 getNetworkType 接口，以便获取最新的信息。

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onNetworkStatusChange } from '@ray-js/ray'
onNetworkStatusChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onNetworkStatusChange({ ... })
```

##### 参数

**function listener**
监听网络状态变化事件
注意：在 Android 上，该事件只通知网络状态的变化。如需获取最新的网络状态信息，请重新调用 getNetworkType 接口。
注意：在 Android 上，网络状态发生改变时，系统并不一定立马变更网络状态信息，存在一定的延迟。因此触发该事件时，业务上可能需要延迟调用 getNetworkType 接口，以便获取最新的信息。
**参数**

| 属性        | 类型    | 默认值 | 必填 | 说明               |
| ----------- | ------- | ------ | ---- | ------------------ |
| isConnected | boolean |        | 是   | 当前是否有网络连接 |
| networkType | string  |        | 是   | 网络类型           |

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |
#### offNetworkStatusChange

##### 功能描述

取消监听网络状态变化事件

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offNetworkStatusChange } from '@ray-js/ray'
offNetworkStatusChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offNetworkStatusChange({ ... })
```

##### 参数

**function listener**

onNetworkStatusChange 传入的监听函数。不传此参数则移除所有监听函数。

## 罗盘

#### startCompass

##### 功能描述

开始监听罗盘数据

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { startCompass } from '@ray-js/ray'
startCompass({ ... })
```

**原生小程序中使用**

```javascript
ty.startCompass({ ... })
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
import React, { useState } from 'react'

import {
  Button,
  Text,
  View,
  onCompassChange,
  startCompass,
  stopCompass,
  usePageEvent,
} from '@ray-js/ray'

export default function Demo() {
  const [data, setData] = useState<any>()

  const listener = (data: any) => {
    console.log('onCompassChange', data)
    setData(data)
  }

  usePageEvent('onLoad', () => {
    onCompassChange(listener)
  })
  usePageEvent('onUnload', () => {
    console.log('onUnload')
  })

  return (
    <View style={{ width: '100%', height: '100%', padding: '20rpx' }}>
      <Button
        onClick={() => {
          startCompass({
            success: () => {
              console.log('startCompass success')
            },
          })
        }}
      >
        startCompass
      </Button>

      <Button
        onClick={() => {
          stopCompass({
            success: () => {
              console.log('stopCompass success')
            },
          })
        }}
      >
        stopCompass
      </Button>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  )
}
```

```jsx | pure
// 原生调用方式
ty.startCompass({
  success: console.log,
  fail: console.error
});
ty.stopCompass({
  success: console.log,
  fail: console.error
});
ty.onCompassChange(console.log);
```

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### stopCompass

##### 功能描述

停止监听罗盘数据

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { stopCompass } from '@ray-js/ray'
stopCompass({ ... })
```

**原生小程序中使用**

```javascript
ty.stopCompass({ ... })
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

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### onCompassChange

##### 功能描述

监听罗盘数据变化事件

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onCompassChange } from '@ray-js/ray'
onCompassChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onCompassChange({ ... })
```

##### 参数

**function listener**
监听罗盘数据变化事件
**参数**

| 属性      | 类型   | 默认值 | 必填 | 说明                                                                                                                                                                                                                                                                                                                                     |
| --------- | ------ | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| direction | number |        | 是   | 面对的方向度数                                                                                                                                                                                                                                                                                                                           |
| accuracy  | string |        | 是   | 精度\(iOS 与 Android 平台差异原因，返回有差异\)
Android：
 high 高精度
 medium 中等精度
 low 低精度
 no-contact 不可信，传感器失去连接
 unreliable 不可信，原因未知
 unknow $\{value\} 未知的精度枚举值，即该 Android 系统此时返回的表示精度的 value 不是一个标准的精度枚举值
iOS：
 double 类型精度 |

##### 常见问题

###### Q：为什么 Android 和 iOS 获取到的数据不一样？

A：由于 Android 和 iOS 平台的差异，两个平台获取到的精度数据格式不同：

Android 平台返回的精度枚举值：

- high: 高精度
- medium: 中等精度
- low: 低精度
- no-contact: 不可信,传感器失去连接
- unreliable: 不可信,原因未知
- unknown ${value}: 未知的精度枚举值,表示该 Android 系统返回了非标准的精度值

iOS 平台：

- 返回 double 类型的数值表示精度
#### offCompassChange

##### 功能描述

取消监听罗盘数据变化事件，参数为空，则取消所有的事件监听

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offCompassChange } from '@ray-js/ray'
offCompassChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offCompassChange({ ... })
```

##### 参数

**function listener**

onCompassChange 传入的监听函数。不传此参数则移除所有监听函数。

## 设备方向

#### startDeviceMotionListening

##### 功能描述

开始监听设备方向的变化。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { startDeviceMotionListening } from '@ray-js/ray'
startDeviceMotionListening({ ... })
```

**原生小程序中使用**

```javascript
ty.startDeviceMotionListening({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型                        | 默认值                        | 必填 | 说明                                             |
| -------- | --------------------------- | ----------------------------- | ---- | ------------------------------------------------ |
| interval | `enum` DeviceMotionInterval | `DeviceMotionInterval.normal` | 否   | 监听加速度数据回调函数的执行频率                 |
| success  | function                    |                               | 否   | 接口调用成功的回调函数                           |
| fail     | function                    |                               | 否   | 接口调用失败的回调函数                           |
| complete | function                    |                               | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` DeviceMotionInterval**

| 枚举值 | 描述                                      |
| ------ | ----------------------------------------- |
| game   | 适用于更新游戏的回调频率，在 20ms/次 左右 |
| ui     | 适用于更新 UI 的回调频率，在 60ms/次 左右 |
| normal | 普通的回调频率，在 200ms/次 左右          |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import React, { useEffect, useState } from 'react'

import {
  Button,
  Text,
  View,
  offDeviceMotionChange,
  onDeviceMotionChange,
  startDeviceMotionListening,
  stopDeviceMotionListening,
} from '@ray-js/ray'

import { useThrottleFn } from 'ahooks'

export default function Demo() {
  const [data, setData] = useState<any>()

  const listener = (data: any) => {
    console.log('onDeviceMotionChange', data)
    setData(data)
  }

  const [isListening, setIsListening] = useState(false)

  const { run } = useThrottleFn(listener, { wait: 1000 })

  useEffect(() => {
    if (isListening) {
      onDeviceMotionChange(run)
    } else {
      offDeviceMotionChange(run)
    }
  }, [isListening])

  return (
    <View style={{ width: '100%', height: '100%', padding: '20rpx' }}>
      <Button
        onClick={() => {
          startDeviceMotionListening({
            success: (res) => {
              console.log('startDeviceMotionListening success', res)
              setIsListening(true)
            },
          })
        }}
      >
        startDeviceMotionListening
      </Button>

      <Button
        onClick={() => {
          stopDeviceMotionListening({
            success: () => {
              console.log('stopDeviceMotionListening success')
              setIsListening(false)
            },
          })
        }}
      >
        stopDeviceMotionListening
      </Button>
      <Text
        style={{
          color: '#333',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(data)}
      </Text>
    </View>
  )
}
```

```jsx | pure
// 原生调用方式
ty.startDeviceMotionListening({
  success: console.log,
  fail: console.error
});
ty.stopDeviceMotionListening({
  success: console.log,
  fail: console.error
});
ty.onDeviceMotionChange(console.log);
```

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### stopDeviceMotionListening

##### 功能描述

停止监听设备方向的变化。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { stopDeviceMotionListening } from '@ray-js/ray'
stopDeviceMotionListening({ ... })
```

**原生小程序中使用**

```javascript
ty.stopDeviceMotionListening({ ... })
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

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### onDeviceMotionChange

##### 功能描述

监听设备方向变化事件(数据为系统返回，双端精度可能不一致)

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onDeviceMotionChange } from '@ray-js/ray'
onDeviceMotionChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onDeviceMotionChange({ ... })
```

##### 参数

**function listener**
监听设备方向变化事件(数据为系统返回，双端精度可能不一致)
**参数**

| 属性  | 类型   | 默认值 | 必填 | 说明                                                                                                                                     |
| ----- | ------ | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| alpha | number |        | 是   | 当 手机坐标 X/Y 和 地球 X/Y 重合时，绕着 Z 轴转动的夹角为 alpha，范围值为 \[0, 2\*PI\)。逆时针转动为正。                                 |
| beta  | number |        | 是   | 当手机坐标 Y/Z 和地球 Y/Z 重合时，绕着 X 轴转动的夹角为 beta。范围值为 \[-1\*PI, PI\) 。顶部朝着地球表面转动为正。也有可能朝着用户为正。 |
| gamma | number |        | 是   | 当手机 X/Z 和地球 X/Z 重合时，绕着 Y 轴转动的夹角为 gamma。范围值为 \[-1\*PI/2, PI/2\)。右边朝着地球表面转动为正。                       |

##### 常见问题

###### Q：为什么 Android 和 iOS 获取到的数据不一样？

A：因为 Android 和 iOS 的陀螺仪传感器数据获取方式不一样，所以数据精度会有差异。

###### Q：已知问题及修复记录

A：以下问题已在 BaseKit 3.17.7 修复：

Android 端：

1. 调用 onDeviceMotionChange 前需要先调用 start，否则会报错 10001 (Sensor initialization failure, start Accelerometer first)
#### offDeviceMotionChange

##### 功能描述

取消监听设备方向变化事件，参数为空，则取消所有的事件监听。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offDeviceMotionChange } from '@ray-js/ray'
offDeviceMotionChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offDeviceMotionChange({ ... })
```

##### 参数

**function listener**

onDeviceMotionChange 传入的监听函数。不传此参数则移除所有监听函数。

## 加速计

#### startAccelerometer

##### 功能描述

开始监听加速度数据，初始化事件回调方法

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { startAccelerometer } from '@ray-js/ray'
startAccelerometer({ ... })
```

**原生小程序中使用**

```javascript
ty.startAccelerometer({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型                         | 默认值                         | 必填 | 说明                                             |
| -------- | ---------------------------- | ------------------------------ | ---- | ------------------------------------------------ |
| interval | `enum` AccelerometerInterval | `AccelerometerInterval.normal` | 否   | 监听加速度数据回调函数的执行频率                 |
| success  | function                     |                                | 否   | 接口调用成功的回调函数                           |
| fail     | function                     |                                | 否   | 接口调用失败的回调函数                           |
| complete | function                     |                                | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` AccelerometerInterval**

| 枚举值 | 描述                                      |
| ------ | ----------------------------------------- |
| game   | 适用于更新游戏的回调频率，在 20ms/次 左右 |
| ui     | 适用于更新 UI 的回调频率，在 60ms/次 左右 |
| normal | 普通的回调频率，在 200ms/次 左右          |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { startAccelerometer } from '@ray-js/ray';
// 原生调用方式
const { startAccelerometer } = ty;

startAccelerometer({
  success: () => {
    console.log('startAccelerometer success');
  },
  fail: (error) => {
    console.log(error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### stopAccelerometer

##### 功能描述

停止监听加速度数据

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { stopAccelerometer } from '@ray-js/ray'
stopAccelerometer({ ... })
```

**原生小程序中使用**

```javascript
ty.stopAccelerometer({ ... })
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
import { stopAccelerometer } from '@ray-js/ray';
// 原生调用方式
const { stopAccelerometer } = ty;

stopAccelerometer({
  success: () => {
    console.log('stopAccelerometer success');
  },
  fail: (error) => {
    console.log(error);
  }
});
```

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### onAccelerometerChange

##### 功能描述

监听加速度数据事件(精度为系统返回，双端可能不一致)

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onAccelerometerChange } from '@ray-js/ray'
onAccelerometerChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onAccelerometerChange({ ... })
```

##### 参数

**function listener**
监听加速度数据事件(精度为系统返回，双端可能不一致)
**参数**

| 属性 | 类型   | 默认值 | 必填 | 说明 |
| ---- | ------ | ------ | ---- | ---- |
| x    | number |        | 是   | X 轴 |
| y    | number |        | 是   | Y 轴 |
| z    | number |        | 是   | Z 轴 |

##### 代码示例

###### 请求示例

```jsx | pure
import {
  Button,
  offAccelerometerChange,
  onAccelerometerChange,
  startAccelerometer,
  stopAccelerometer,
  View
} from '@ray-js/ray';
import React, { FC, useEffect, useState, useCallback } from 'react';

export const Demo: FC = () => {
  const listener = useCallback((res) => {
    console.log(res);
  }, []);

  useEffect(() => {
    onAccelerometerChange(listener);
  }, [listener]);

  const handleStart = useCallback(() => {
    startAccelerometer({
      success: (res) => {
        console.log('startAccelerometer success==> ', res);
      },
      fail: (res) => {
        console.log('startAccelerometer fail==> ', res);
      }
    });
  }, []);

  const handleStop = useCallback(() => {
    stopAccelerometer({
      success: (res) => {
        console.log('stopAccelerometer success==> ', res);
      },
      fail: (res) => {
        console.log('stopAccelerometer fail==> ', res);
      }
    });
  }, []);

  return (
    <View>
      <Button onClick={handleStart}>startAccelerometer</Button>
      <Button onClick={handleStop}>stopAccelerometer</Button>
      <Button
        onClick={() => {
          offAccelerometerChange(listener);
        }}
      >
        offAccelerometerChange
      </Button>
    </View>
  );
};
```

###### 成功示例

```json
{
  "x": 0.00059820566,
  "y": 0.79860455,
  "z": 9.856635
}
```

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |

##### 常见问题

###### Q：为什么 Android 和 iOS 获取到的数据不一样？

A：Android 和 iOS 获取到的数据不一样，是因为 Android 和 iOS 的传感器精度不一样，导致获取到的数据不一样。
#### offAccelerometerChange

##### 功能描述

取消监听加速度数据事件，参数为空，则取消所有的事件监听

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offAccelerometerChange } from '@ray-js/ray'
offAccelerometerChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offAccelerometerChange({ ... })
```

##### 参数

**function listener**

onAccelerometerChange 传入的监听函数。不传此参数则移除所有监听函数。

## 陀螺仪

#### startGyroscope

##### 功能描述

开始监听陀螺仪数据。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { startGyroscope } from '@ray-js/ray'
startGyroscope({ ... })
```

**原生小程序中使用**

```javascript
ty.startGyroscope({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型                     | 默认值                     | 必填 | 说明                                             |
| -------- | ------------------------ | -------------------------- | ---- | ------------------------------------------------ |
| interval | `enum` GyroscopeInterval | `GyroscopeInterval.normal` | 否   | 监听陀螺仪数据回调函数的执行频率                 |
| success  | function                 |                            | 否   | 接口调用成功的回调函数                           |
| fail     | function                 |                            | 否   | 接口调用失败的回调函数                           |
| complete | function                 |                            | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` GyroscopeInterval**

| 枚举值 | 描述                                      |
| ------ | ----------------------------------------- |
| game   | 适用于更新游戏的回调频率，在 20ms/次 左右 |
| ui     | 适用于更新 UI 的回调频率，在 60ms/次 左右 |
| normal | 普通的回调频率，在 200ms/次 左右          |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import React, { useEffect, useState } from 'react'

import {
  Button,
  Text,
  View,
  offGyroscopeChange,
  onGyroscopeChange,
  startGyroscope,
  stopGyroscope,
} from '@ray-js/ray'

import { useThrottleFn } from 'ahooks'

export default function Demo() {
  const [data, setData] = useState<any>()

  const listener = (data: any) => {
    console.log('onGyroscopeChange', data)
    setData(data)
  }

  const { run } = useThrottleFn(listener, { wait: 1000 })

  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (isListening) {
      onGyroscopeChange(run)
    } else {
      offGyroscopeChange(run)
    }
  }, [isListening])

  return (
    <View style={{ width: '100%', height: '100%', padding: '20rpx' }}>
      <Button
        onClick={() => {
          startGyroscope({
            success: () => {
              console.log('startGyroscope success')
              setIsListening(true)
            },
          })
        }}
      >
        startGyroscope
      </Button>

      <Button
        onClick={() => {
          stopGyroscope({
            success: () => {
              console.log('stopGyroscope success')
              setIsListening(false)
            },
          })
        }}
      >
        stopGyroscope
      </Button>
      <Text
        style={{
          color: '#333',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(data)}
      </Text>
    </View>
  )
}
```

```jsx | pure
// 原生调用方式
ty.startGyroscope({
  success: console.log,
  fail: console.error
});
ty.stopGyroscope({
  success: console.log,
  fail: console.error
});
ty.onGyroscopeChange(console.log);
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
| 10001  | Sensor initialization fail     |
#### stopGyroscope

##### 功能描述

停止监听陀螺仪数据。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { stopGyroscope } from '@ray-js/ray'
stopGyroscope({ ... })
```

**原生小程序中使用**

```javascript
ty.stopGyroscope({ ... })
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

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                   |
| ------ | -------------------------- |
| 10001  | Sensor initialization fail |
#### onGyroscopeChange

##### 功能描述

监听陀螺仪数据变化事件(数据为系统返回，双端精度可能不一致)

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onGyroscopeChange } from '@ray-js/ray'
onGyroscopeChange({ ... })
```

**原生小程序中使用**

```javascript
ty.onGyroscopeChange({ ... })
```

##### 参数

**function listener**
监听陀螺仪数据变化事件(数据为系统返回，双端精度可能不一致)
**参数**

| 属性 | 类型   | 默认值 | 必填 | 说明 |
| ---- | ------ | ------ | ---- | ---- |
| x    | number |        | 是   | X 轴 |
| y    | number |        | 是   | Y 轴 |
| z    | number |        | 是   | Z 轴 |

##### 常见问题

###### Q：为什么 Android 和 iOS 获取到的数据不一样？

A：因为 Android 和 iOS 的陀螺仪传感器数据获取方式不一样，所以数据精度会有差异。
#### offGyroscopeChange

##### 功能描述

取消监听陀螺仪数据变化事件。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offGyroscopeChange } from '@ray-js/ray'
offGyroscopeChange({ ... })
```

**原生小程序中使用**

```javascript
ty.offGyroscopeChange({ ... })
```

##### 参数

**function listener**

onGyroscopeChange 传入的监听函数。不传此参数则移除所有监听函数。

## 内存

#### onMemoryWarning

##### 功能描述

监听内存不足告警事件。
当 iOS/Android 向小程序进程发出内存警告时，触发该事件。触发该事件不意味小程序被杀，大部分情况下仅仅是告警，开发者可在收到通知后回收一些不必要资源避免进一步加剧内存紧张。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onMemoryWarning } from '@ray-js/ray'
onMemoryWarning({ ... })
```

**原生小程序中使用**

```javascript
ty.onMemoryWarning({ ... })
```

##### 参数

**function listener**
监听内存不足告警事件。
当 iOS/Android 向小程序进程发出内存警告时，触发该事件。触发该事件不意味小程序被杀，大部分情况下仅仅是告警，开发者可在收到通知后回收一些不必要资源避免进一步加剧内存紧张。
**参数**

| 属性  | 类型   | 默认值 | 必填 | 说明                                            |
| ----- | ------ | ------ | ---- | ----------------------------------------------- |
| level | number |        | 是   | 内存告警等级，只有 Android 才有，对应系统宏定义 |
#### offMemoryWarning

##### 功能描述

取消监听内存不足告警事件。

> 需引入`BaseKit`，且在`>=2.3.2`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offMemoryWarning } from '@ray-js/ray'
offMemoryWarning({ ... })
```

**原生小程序中使用**

```javascript
ty.offMemoryWarning({ ... })
```

##### 参数

**function listener**

onMemoryWarning 传入的监听函数。不传此参数则移除所有监听函数。
