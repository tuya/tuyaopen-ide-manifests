# 基础 (base)

## canIUse(schema: string): boolean

### 版本要求

#### 引入

```js
import { canIUse } from '@ray-js/ray';
```

> 需引入`BaseKit`，且在`>=3.18.5`版本才可使用。
>
> 需要 `@ray-js/ray` 版本 1.6.7 及以上。

> **注意:** _**<font color="red">目前`canIUse`在开发者工具环境中部分功能无法使用，请在真机环境或打包后使用。</font>**_

### 功能描述

判断小程序的 API、回调、参数、组件等是否在当前版本可用。

使用说明：

- 对于基础能力（BaseKit、BizKit、MiniKit），可以直接使用 API 名称进行判断
- 对于设备相关能力（DeviceKit），需要添加 `device` 前缀
- 对于家庭相关能力（HomeKit），需要添加 `home` 前缀
- 其他 Kit 包同理，需要添加对应的小写前缀（例如：MapKit 使用 `map` 前缀）
- 对于组件属性的判断是基于原生小程序的，所以仅可判断原生小程序组件的属性。

### 参数

#### schema

- 类型：`string`
- 说明：使用 `${API}.${method}.${param}.${option}` 或者 `${component}.${attribute}.${option}` 方式来调用

#### 参数说明

| 参数         | 说明                                                 |
| ------------ | ---------------------------------------------------- |
| ${API}       | API 名字                                             |
| ${method}    | 调用方式，有效值为 return, success, object, callback |
| ${param}     | 参数或者返回值                                       |
| ${option}    | 参数的可选值或者返回值的属性                         |
| ${component} | 组件名字                                             |
| ${attribute} | 组件属性                                             |
| ${option}    | 组件属性的可选值                                     |

### 返回值

- 类型：`boolean`
- 说明：当前版本是否可用

### 示例代码

**调用示例**

```javascript
import { canIUse } from '@ray-js/ray';
// 对象的属性或方法
canIUse('hideTabBar')
canIUse('getSystemInfo.success.screenWidth')
// 组件的属性
canIUse('swiper.indicator-active-color')
canIUse('button.form-type')

// 接口参数、回调或者返回值
canIUse('device.getBLEOnlineState.success.isOnline')
canIUse('getSystemInfoSync.return.safeArea.left')
canIUse('getSystemInfo.success.screenWidth')
canIUse('onGetWifiList.callback.wifiList')
canIUse('onSystemVolumeChangeEvent.callback.volumeMode')
canIUse('RecorderManager.start.success.tempFilePath')
canIUse('FileSystemManager.access.success')
canIUse('DownloadTask.onHeadersReceived.callback.header')
canIUse('DownloadTask.onProgressUpdate.callback.totalBytesExpectedToSend')


// 设备相关能力 (DeviceKit) - 需要添加 device 前缀
canIUse('device.subscribeBLEConnectStatus')
canIUse('device.getBLEOnlineState.success.isOnline')

// 家庭相关能力 (HomeKit) - 需要添加 home 前缀
canIUse('home.getCurrentHomeInfo')
canIUse('home.getRoomList.success.roomList')
```

## 框架

#### getApp

> [VERSION] @ray-js/ray >= 0.5.10

##### 描述

获取应用唯一 App 实例，实例对象为 src/App.tsx

##### 参数

无

##### 返回值

类型: `AppInstance`

App 实例对象

###### AppInstance

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `getData` | `() => Record<string, unknown>` | 是 | 获取应用全局数据 |
| `setData` | `(data: Record<string, unknown>) => void` | 是 | 设置应用全局数据 |

##### 示例代码

###### 读写全局数据

```tsx
import React from 'react';
import { View, Button, getApp } from '@ray-js/ray';

export default function Demo() {
  const app = getApp();

  const handleGetGlobalData = () => {
    const globalData = app.getData();
    console.log('globalData:', globalData);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button onClick={handleGetGlobalData}>
        获取全局数据
      </Button>
      <Button
        style={{ marginTop: 10 }}
        onClick={() => {
          app.setData({ theme: 'dark' });
        }}
      >
        修改全局数据
      </Button>
    </View>
  );
}
```
#### getCurrentPages

> [VERSION] @ray-js/ray >= 0.2.0

> 💡 1. 不要尝试修改页面栈，会导致路由以及页面状态错误。
> 2. 不要在 App.onLaunch 的时候调用 getCurrentPages()，此时 page 还没有生成。

##### 描述

获取当前页面栈。返回一个数组，数组中的元素为页面栈中的页面对象，数组第一个元素为首页，最后一个元素为当前页面。

##### 参数

无

##### 返回值

类型: `PageInstance[]`

页面栈数组，每个元素为 PageInstance 对象

##### 示例代码

###### 基础用法

```tsx
import React from 'react';
import { View, Button, getCurrentPages } from '@ray-js/ray';

export default function Home() {
  const handleGetPages = () => {
    const pages = getCurrentPages();
    console.log('当前页面栈长度:', pages.length);
    console.log('当前页面:', pages[pages.length - 1]);

    pages.forEach((page, index) => {
      console.log(`页面 ${index}:`, page.route);
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Button onClick={handleGetPages}>获取页面栈</Button>
    </View>
  );
}
```
#### getElementById

> [VERSION] @ray-js/ray >= 0.5.10

##### 描述

获取页面节点

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 节点的 id 属性值 |

##### 返回值

类型: `Promise<Element>`

节点引用对象，节点不存在时返回 null

##### 示例代码

###### 基础用法

```tsx
import React from 'react';
import { View, Button, Text, getElementById } from '@ray-js/ray';

export default function Demo() {
  const handleGetElement = async () => {
    const element = await getElementById('targetView');
    console.log('节点引用:', element);
  };

  return (
    <View style={{ padding: 20 }}>
      <View
        id="targetView"
        style={{
          height: 100,
          backgroundColor: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff' }}>目标节点</Text>
      </View>
      <Button style={{ marginTop: 10 }} onClick={handleGetElement}>
        获取节点引用
      </Button>
    </View>
  );
}
```

## 系统

#### getSystemInfo

##### 功能描述

获取系统信息

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getSystemInfo } from '@ray-js/ray'
getSystemInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getSystemInfo({ ... })
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

| 属性                        | 类型               | 说明                                                                |
| --------------------------- | ------------------ | ------------------------------------------------------------------- |
| is24Hour                    | boolean            | 是否24小时制                                                        |
| system                      | string             | 操作系统                                                      |
| brand                       | string             | 设备品牌                                                            |
| model                       | string             | 设备型号 `android` `ios`                                            |
| platform                    | string             | 平台                                                                |
| timezoneId                  | string             | 时区                                                                |
| pixelRatio                  | number             | 像素比                                                              |
| screenWidth                 | number             | 屏幕宽度                                                            |
| screenHeight                | number             | 屏幕高度                                                            |
| windowWidth                 | number             | 窗口宽度                                                            |
| windowHeight                | number             | 窗口高度                                                            |
| useableWindowWidth          | number             | 可使用窗口宽度
`最低版本3.3.2`                                  |
| useableWindowHeight         | number             | 可使用窗口高度
`最低版本3.3.2`                                  |
| statusBarHeight             | number             | 状态栏高度                                                          |
| language                    | string             | 语言 `zh_CN`                                                        |
| safeArea                    | SafeArea           | 安全区域信息                                                        |
| albumAuthorized             | boolean            | 相册权限                                                            |
| cameraAuthorized            | boolean            | 相机权限                                                            |
| locationAuthorized          | boolean            | 位置权限                                                            |
| microphoneAuthorized        | boolean            | 麦克风权限                                                          |
| notificationAuthorized      | boolean            | 通知权限                                                            |
| notificationAlertAuthorized | boolean            | 通知弹窗权限                                                        |
| notificationBadgeAuthorized | boolean            | 通知角标权限                                                        |
| notificationSoundAuthorized | boolean            | 通知声音权限                                                        |
| bluetoothEnabled            | boolean            | 蓝牙权限                                                            |
| locationEnabled             | boolean            | 位置权限                                                            |
| wifiEnabled                 | boolean            | Wi-Fi 权限                                                          |
| theme                       | `enum` Themes      | 主题 `dark` `light`                                                 |
| deviceOrientation           | `enum` Orientation | 设备方向 `portrait` `landscape`                                     |
| deviceLevel                 | string             | 设备等级\(低:low-中:middle-高:high\)
`最低版本3.3.3`            |
| isSupportPinShortcut        | boolean            | 手机系统是否支持创建快捷方式（仅 Android 使用）
`最低版本3.5.0` |
| deviceType                  | string             | 设备类型
phone：手机
pad：平板
`最低版本3.10.6`         |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**SafeArea**

| 属性   | 类型   | 默认值 | 必填 | 说明 |
| ------ | ------ | ------ | ---- | ---- |
| left   | number |        | 是   |      |
| right  | number |        | 是   |      |
| top    | number |        | 是   |      |
| bottom | number |        | 是   |      |
| width  | number |        | 是   |      |
| height | number |        | 是   |      |

**`enum` Themes**

| 枚举值 | 描述     |
| ------ | -------- |
| dark   | 暗黑模式 |
| light  | 亮色模式 |

**`enum` Orientation**

| 枚举值    | 描述 |
| --------- | ---- |
| portrait  | 竖屏 |
| landscape | 横屏 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getSystemInfo } from '@ray-js/ray';

// 原生调用方式
const { getSystemInfo } = ty;

getSystemInfo({
  success: console.log,
  fail: console.error
});
```

###### 成功示例

```json
{
  "albumAuthorized": true, // 相册权限
  "bluetoothEnabled": false, // 蓝牙权限
  "brand": "Xiaomi", // 设备品牌
  "cameraAuthorized": true, // 相机权限
  "deviceLevel": "high", // 设备等级
  "deviceOrientation": "portrait", // 设备方向
  "deviceType": "phone", // 设备类型
  "is24Hour": false, // 是否24小时制
  "isSupportPinShortcut": true, // 是否支持快捷键
  "language": "zh_CN", // 语言
  "locationAuthorized": true, // 位置权限
  "locationEnabled": true, // 位置权限
  "microphoneAuthorized": true, // 麦克风权限
  "model": "23116PN5BC", // 设备型号
  "notificationAuthorized": true, // 通知权限
  "pixelRatio": 2.625, // 像素比
  "platform": "android", // 平台
  "safeArea": {
    "bottom": 898, // 安全区域底部
    "height": 856, // 安全区域高度
    "left": 0, // 安全区域左边
    "right": 411, // 安全区域右边
    "top": 42, // 安全区域顶部
    "width": 411 // 安全区域宽度
  },
  "screenHeight": 914, // 屏幕高度
  "screenWidth": 411, // 屏幕宽度
  "statusBarHeight": 42, // 状态栏高度
  "system": "android", // 操作系统
  "theme": "light", // 主题
  "timezoneId": "Asia/Shanghai", // 时区
  "useableWindowHeight": 806, // 可使用窗口高度
  "useableWindowWidth": 411, // 可使用窗口宽度
  "wifiEnabled": false, // Wi-Fi 权限
  "windowHeight": 914, // 窗口高度
  "windowWidth": 411, // 窗口宽度
  "SDKVersion": "2.22.1", // SDK版本
  "containerVersion": "3.23.0" // 容器版本
}
```

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |
#### getSystemInfoSync

##### 功能描述

获取系统信息的同步版本

> 需引入`BaseKit`，且在`>=2.0.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getSystemInfoSync } from '@ray-js/ray'
getSystemInfoSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getSystemInfoSync({ ... })
```

##### 返回值

| 属性                        | 类型               | 说明                                                                |
| --------------------------- | ------------------ | ------------------------------------------------------------------- |
| is24Hour                    | boolean            | 是否24小时制                                                        |
| system                      | string             | 操作系统                                                      |
| brand                       | string             | 设备品牌                                                            |
| model                       | string             | 设备型号 `android` `ios`                                            |
| platform                    | string             | 平台                                                                |
| timezoneId                  | string             | 时区                                                                |
| pixelRatio                  | number             | 像素比                                                              |
| screenWidth                 | number             | 屏幕宽度                                                            |
| screenHeight                | number             | 屏幕高度                                                            |
| windowWidth                 | number             | 窗口宽度                                                            |
| windowHeight                | number             | 窗口高度                                                            |
| useableWindowWidth          | number             | 可使用窗口宽度
`最低版本3.3.2`                                  |
| useableWindowHeight         | number             | 可使用窗口高度
`最低版本3.3.2`                                  |
| statusBarHeight             | number             | 状态栏高度                                                          |
| language                    | string             | 语言 `zh_CN`                                                        |
| safeArea                    | SafeArea           | 安全区域信息                                                        |
| albumAuthorized             | boolean            | 相册权限                                                            |
| cameraAuthorized            | boolean            | 相机权限                                                            |
| locationAuthorized          | boolean            | 位置权限                                                            |
| microphoneAuthorized        | boolean            | 麦克风权限                                                          |
| notificationAuthorized      | boolean            | 通知权限                                                            |
| notificationAlertAuthorized | boolean            | 通知弹窗权限                                                        |
| notificationBadgeAuthorized | boolean            | 通知角标权限                                                        |
| notificationSoundAuthorized | boolean            | 通知声音权限                                                        |
| bluetoothEnabled            | boolean            | 蓝牙权限                                                            |
| locationEnabled             | boolean            | 位置权限                                                            |
| wifiEnabled                 | boolean            | Wi-Fi 权限                                                          |
| theme                       | `enum` Themes      | 主题 `dark` `light`                                                 |
| deviceOrientation           | `enum` Orientation | 设备方向 `portrait` `landscape`                                     |
| deviceLevel                 | string             | 设备等级\(低:low-中:middle-高:high\)
`最低版本3.3.3`            |
| isSupportPinShortcut        | boolean            | 手机系统是否支持创建快捷方式（仅 Android 使用）
`最低版本3.5.0` |
| deviceType                  | string             | 设备类型
phone：手机
pad：平板
`最低版本3.10.6`         |

##### 引用对象

**SafeArea**

| 属性   | 类型   | 默认值 | 必填 | 说明 |
| ------ | ------ | ------ | ---- | ---- |
| left   | number |        | 是   |      |
| right  | number |        | 是   |      |
| top    | number |        | 是   |      |
| bottom | number |        | 是   |      |
| width  | number |        | 是   |      |
| height | number |        | 是   |      |

**`enum` Themes**

| 枚举值 | 描述     |
| ------ | -------- |
| dark   | 暗黑模式 |
| light  | 亮色模式 |

**`enum` Orientation**

| 枚举值    | 描述 |
| --------- | ---- |
| portrait  | 竖屏 |
| landscape | 横屏 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getSystemInfoSync } from '@ray-js/ray';

// 原生调用方式
const { getSystemInfoSync } = ty;

const result = getSystemInfoSync();
console.log(result)
```

###### 成功示例

```json
{
  "albumAuthorized": true, // 相册权限
  "bluetoothEnabled": false, // 蓝牙权限
  "brand": "Xiaomi", // 设备品牌
  "cameraAuthorized": true, // 相机权限
  "deviceLevel": "high", // 设备等级
  "deviceOrientation": "portrait", // 设备方向
  "deviceType": "phone", // 设备类型
  "is24Hour": false, // 是否24小时制
  "isSupportPinShortcut": true, // 是否支持快捷键
  "language": "zh_CN", // 语言
  "locationAuthorized": true, // 位置权限
  "locationEnabled": true, // 位置权限
  "microphoneAuthorized": true, // 麦克风权限
  "model": "23116PN5BC", // 设备型号
  "notificationAuthorized": true, // 通知权限
  "pixelRatio": 2.625, // 像素比
  "platform": "android", // 平台
  "safeArea": {
    "bottom": 898, // 安全区域底部
    "height": 856, // 安全区域高度
    "left": 0, // 安全区域左边
    "right": 411, // 安全区域右边
    "top": 42, // 安全区域顶部
    "width": 411 // 安全区域宽度
  },
  "screenHeight": 914, // 屏幕高度
  "screenWidth": 411, // 屏幕宽度
  "statusBarHeight": 42, // 状态栏高度
  "system": "android", // 操作系统
  "theme": "light", // 主题
  "timezoneId": "Asia/Shanghai", // 时区
  "useableWindowHeight": 806, // 可使用窗口高度
  "useableWindowWidth": 411, // 可使用窗口宽度
  "wifiEnabled": false, // Wi-Fi 权限
  "windowHeight": 914, // 窗口高度
  "windowWidth": 411, // 窗口宽度
  "SDKVersion": "2.22.1", // SDK版本
  "containerVersion": "3.23.0" // 容器版本
}
```

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |
#### getSystemSetting

##### 功能描述

获取设备设置

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getSystemSetting } from '@ray-js/ray'
getSystemSetting({ ... })
```

**原生小程序中使用**

```javascript
ty.getSystemSetting({ ... })
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

| 属性              | 类型    | 说明                                                          |
| ----------------- | ------- | ------------------------------------------------------------- |
| bluetoothEnabled  | boolean | 蓝牙的系统开关，默认 false                                    |
| locationEnabled   | boolean | 地理位置的系统开关，默认 false                                |
| wifiEnabled       | boolean | Wi-Fi 的系统开关，默认 false                                  |
| deviceOrientation | string  | 设备方向, 默认竖屏
竖屏 = "portrait"， 横屏 = "landscape" |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getSystemSetting } from '@ray-js/ray';
// 原生调用方式
const { getSystemSetting } = ty;

getSystemSetting({
  success: console.log,
  fail: console.error
});
```

###### 成功示例

```json
{
  "bluetoothEnabled": false,
  "locationEnabled": false,
  "wifiEnabled": false,
  "deviceOrientation": "portrait"
}
```
#### getMobileDeviceInfo

##### 功能描述

获取设备基础信息

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getMobileDeviceInfo } from '@ray-js/ray'
getMobileDeviceInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getDeviceInfo({ ... })
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

| 属性     | 类型   | 说明                                           |
| -------- | ------ | ---------------------------------------------- |
| abi      | string | 应用二进制接口类型（仅 Android 支持）          |
| brand    | string | 设备品牌                                       |
| model    | string | 设备型号。新机型刚推出一段时间会显示 unknown。 |
| system   | string | 操作系统及版本                                 |
| platform | string | 客户端平台                                     |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getMobileDeviceInfo } from '@ray-js/ray';

// 原生调用方式
const { getDeviceInfo } = ty;
getDeviceInfo({
  success: console.log,
  fail: console.error
});
```

###### 成功示例

```json
{
  "abi": "armeabi-v7a",
  "brand": "HUAWEI",
  "model": "HUAWEI P40",
  "system": "14",
  "platform": "Android"
}
```

##### 常见问题

###### Q: 为什么在 Ray 中调用的是 getMobileDeviceInfo，而在原生中调用的是 getDeviceInfo？

A: 因为 Ray 中 getDeviceInfo 是获取设备端的信息，getMobileDeviceInfo 是获取手机的信息。
#### openSystemSettingPage

##### 功能描述

!!!注: 由于审核安全风险,在 iOS 端调用此方法只会打开当前应用对应的设置界面，不再支持以下 scope
根据不同 scope 值，打开对应的手机系统设置界面
&#34;Settings&#34;-&#62; 手机设置主界面
&#34;Settings-Bluetooth&#34; -&#62; 手机蓝牙设置界面
&#34;Settings-WiFi&#34; -&#62; 手机 Wifi 设置界面
&#34;Settings-Location&#34; -&#62; 手机定位设置界面
&#34;Settings-Notification&#34; -&#62; 手机通知设置界面

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openSystemSettingPage } from '@ray-js/ray'
openSystemSettingPage({ ... })
```

**原生小程序中使用**

```javascript
ty.openSystemSettingPage({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------- | -------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| scope       | string   |        | 是   | 跳转系统-设置项名称
"Settings"-\> 手机设置主界面
"Settings-Bluetooth" -\> 手机蓝牙设置界面
"Settings-WiFi" -\> 手机 WiFi 设置界面
"Settings-Location" -\> 手机定位设置界面
"Settings-Notification" -\> 手机通知设置界面
跳转系统-应用-设置项名称
"App-Settings" -\> App 应用设置界面
"App-Settings-Permission" -\> App 应用权限设置界面 \(Android 独有\)
"App-Settings-Notification" -\> App 应用通知设置界面 \(Android 独有\) |
| requestCode | number   |        | 否   | 请求 code,Android 特有                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| success     | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| fail        | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| complete    | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                                                                                                                                                                                                                                                                                   |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述        |
| ------ | --------------- |
| 20045  | Open URL failed |
#### openSystemBluetoothSetting

##### 功能描述

跳转系统蓝牙设置页 (仅 Android 支持)

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openSystemBluetoothSetting } from '@ray-js/ray'
openSystemBluetoothSetting({ ... })
```

**原生小程序中使用**

```javascript
ty.openSystemBluetoothSetting({ ... })
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
#### updateVolume

##### 功能描述

设置系统音量

> 需引入`BaseKit`，且在`>=2.4.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { updateVolume } from '@ray-js/ray'
updateVolume({ ... })
```

**原生小程序中使用**

```javascript
ty.updateVolume({ ... })
```

##### 请求参数

**Object object**

| 属性       | 类型     | 默认值 | 必填 | 说明                                                                                                                                                                                                        |
| ---------- | -------- | ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value      | number   |        | 是   | 音量，阈值【0 - 1】                                                                                                                                                                                         |
| volumeMode | number[] | `[2]`  | 否   | 音量类型（仅 Android 生效）
0：语音电话的声音
1：手机系统声音
2：响铃，通知，系统默认音等
3：手机音乐的声音
4：手机闹铃的声音
5：手机通知的声音
6：蓝牙音量
`最低版本3.3.3` |
| success    | function |        | 否   | 接口调用成功的回调函数                                                                                                                                                                                      |
| fail       | function |        | 否   | 接口调用失败的回调函数                                                                                                                                                                                      |
| complete   | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                                                                                            |

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
#### registerSystemVolumeChange

##### 功能描述

注册系统音量监听

关联 API：[onSystemVolumeChangeEvent, unRegisterSystemVolumeChange]

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { registerSystemVolumeChange } from '@ray-js/ray'
registerSystemVolumeChange({ ... })
```

**原生小程序中使用**

```javascript
ty.registerSystemVolumeChange({ ... })
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
#### unRegisterSystemVolumeChange

##### 功能描述

取消注册系统音量监听

关联 API：[onSystemVolumeChangeEvent, registerSystemVolumeChange]

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { unRegisterSystemVolumeChange } from '@ray-js/ray'
unRegisterSystemVolumeChange({ ... })
```

**原生小程序中使用**

```javascript
ty.unRegisterSystemVolumeChange({ ... })
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
#### onSystemVolumeChangeEvent

##### 功能描述

系统音量监听通知事件

关联 API：[registerSystemVolumeChange, unRegisterSystemVolumeChange]

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onSystemVolumeChangeEvent } from '@ray-js/ray'
onSystemVolumeChangeEvent({ ... })
```

**原生小程序中使用**

```javascript
ty.onSystemVolumeChangeEvent({ ... })
```

##### 参数

**function listener**
系统音量监听通知事件

关联 API：[registerSystemVolumeChange, unRegisterSystemVolumeChange]
**参数**

| 属性       | 类型   | 默认值 | 必填 | 说明                                                                                                                                                                                                        |
| ---------- | ------ | ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value      | number |        | 是   | 音量，阈值【0 - 1】                                                                                                                                                                                         |
| volumeMode | number | `2`    | 否   | 音量类型（仅 Android 生效）
0：语音电话的声音
1：手机系统声音
2：响铃，通知，系统默认音等
3：手机音乐的声音
4：手机闹铃的声音
5：手机通知的声音
6：蓝牙音量
`最低版本3.3.3` |
#### offSystemVolumeChangeEvent

##### 功能描述

移除监听：系统音量监听通知事件

关联 API：[registerSystemVolumeChange, unRegisterSystemVolumeChange]

> 需引入`BaseKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offSystemVolumeChangeEvent } from '@ray-js/ray'
offSystemVolumeChangeEvent({ ... })
```

**原生小程序中使用**

```javascript
ty.offSystemVolumeChangeEvent({ ... })
```

##### 参数

**function listener**

onSystemVolumeChangeEvent 传入的监听函数。不传此参数则移除所有监听函数。
#### handleShortcut

##### 功能描述

操作快捷方式，包括添加和移除, 仅 iOS

> 需引入`BizKit`，且在`>=3.1.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { handleShortcut } from '@ray-js/ray'
handleShortcut({ ... })
```

**原生小程序中使用**

```javascript
ty.handleShortcut({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| type     | number   |        | 是   | 操作类型。0-添加、1-移除                         |
| sceneId  | string   |        | 是   | 场景 id                                          |
| name     | string   |        | 是   | 场景名称                                         |
| iconUrl  | string   |        | 否   | 场景 logo                                        |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性            | 类型    | 说明                                     |
| --------------- | ------- | ---------------------------------------- |
| operationStep   | number  | 操作步骤，0-添加、1-移除、2-更新、3-取消 |
| operationStatus | boolean | 操作状态，YES，表示成功；NO，表示失败    |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### isAssociatedShortcut

##### 功能描述

获取是否关联 siri 状态, 仅 iOS

> 需引入`BizKit`，且在`>=3.1.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { isAssociatedShortcut } from '@ray-js/ray'
isAssociatedShortcut({ ... })
```

**原生小程序中使用**

```javascript
ty.isAssociatedShortcut({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| sceneId  | string   |        | 是   | 场景 id                                          |
| name     | string   |        | 否   | 场景 name                                        |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |

##### 返回结果

**success**

| 属性         | 类型    | 说明       |
| ------------ | ------- | ---------- |
| isAssociated | boolean | 是否已关联 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### isSupportedShortcut

##### 功能描述

是否支持 siri, 仅 iOS

> 需引入`BizKit`，且在`>=3.1.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { isSupportedShortcut } from '@ray-js/ray'
isSupportedShortcut({ ... })
```

**原生小程序中使用**

```javascript
ty.isSupportedShortcut({ ... })
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

| 属性        | 类型    | 说明     |
| ----------- | ------- | -------- |
| isSupported | boolean | 是否支持 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

## 容器

#### getEnterOptions

##### 功能描述

获取本次小程序启动时的参数。如果当前是冷启动，则返回值与 App.onLaunch 的回调参数一致；如果当前是热启动，则返回值与 App.onShow 一致。

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getEnterOptions } from '@ray-js/ray'
getEnterOptions({ ... })
```

**原生小程序中使用**

```javascript
ty.getEnterOptions({ ... })
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

| 属性         | 类型                | 说明                                                                          |
| ------------ | ------------------- | ----------------------------------------------------------------------------- |
| path         | string              | 启动小程序的路径 \(代码包路径\)                                               |
| scene        | `enum` MiniAppScene | 启动小程序的场景值                                                            |
| query        | any                 | 启动小程序的 query 参数                                                       |
| referrerInfo | ReferrerInfo        | 分享转发                                                                      |
| apiCategory  | string              | API 类别: default 默认类别; embedded 内嵌，通过打开半屏小程序能力打开的小程序 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` MiniAppScene**

| 枚举值 | 描述                       |
| ------ | -------------------------- |
| 1000   | 默认值                     |
| 1001   | 通过最近使用小程序列表进入 |
| 1002   | 通过 URL 映射进入          |

**ReferrerInfo**

| 属性      | 类型   | 默认值 | 必填 | 说明                                    |
| --------- | ------ | ------ | ---- | --------------------------------------- |
| appId     | string |        | 是   | 来源小程序的 appId                      |
| extraData | any    |        | 是   | 来源小程序传过来的数据，特定 scene 支持 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getEnterOptions } from '@ray-js/ray';
// 原生调用方式
const { getEnterOptions } = ty;

getEnterOptions({
  success: (res) => {
    console.log('getEnterOptions success', res);
  },
  fail: (error) => {
    console.log('getEnterOptions fail', error);
  }
});
```

###### 成功示例

```json
{
  "apiCategory": "default",
  "path": "pages/base/index",
  "query": {
    "deviceId": "",
    "miniapp_inner_referer": "https://thing.miniapp.com/tyotlohmrak8c7t9lj/1.0.0/page-frame.html",
    "mqttIdeHost": "mqtt-im.tuyacn.com",
    "token": "xxx"
  },
  "referrerInfo": {}
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getEnterOptionsSync

##### 功能描述

获取本次小程序启动时的参数。如果当前是冷启动，则返回值与 App.onLaunch 的回调参数一致；如果当前是热启动，则返回值与 App.onShow 一致。的同步版本

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getEnterOptionsSync } from '@ray-js/ray'
getEnterOptionsSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getEnterOptionsSync({ ... })
```

##### 返回值

| 属性         | 类型                | 说明                                                                          | 版本 |
| ------------ | ------------------- | ----------------------------------------------------------------------------- | ---- |
| path         | string              | 启动小程序的路径 \(代码包路径\)                                               |      |
| scene        | `enum` MiniAppScene | 启动小程序的场景值                                                            |      |
| query        | any                 | 启动小程序的 query 参数                                                       |      |
| referrerInfo | ReferrerInfo        | 分享转发                                                                      |      |
| apiCategory  | string              | API 类别: default 默认类别; embedded 内嵌，通过打开半屏小程序能力打开的小程序 |      |

##### 引用对象

**`enum` MiniAppScene**

| 枚举值 | 描述                       |
| ------ | -------------------------- |
| 1000   | 默认值                     |
| 1001   | 通过最近使用小程序列表进入 |
| 1002   | 通过 URL 映射进入          |

**ReferrerInfo**

| 属性      | 类型   | 默认值 | 必填 | 说明                                    |
| --------- | ------ | ------ | ---- | --------------------------------------- |
| appId     | string |        | 是   | 来源小程序的 appId                      |
| extraData | any    |        | 是   | 来源小程序传过来的数据，特定 scene 支持 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getEnterOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getEnterOptionsSync } = ty;

const res = getEnterOptionsSync();
console.log('getEnterOptionsSync', res);
```

###### 成功示例

```json
{
  "apiCategory": "default",
  "path": "pages/base/index",
  "query": {
    "deviceId": "",
    "miniapp_inner_referer": "https://thing.miniapp.com/tyotlohmrak8c7t9lj/1.0.0/page-frame.html",
    "mqttIdeHost": "mqtt-im.tuyacn.com",
    "token": "xxx"
  },
  "referrerInfo": {}
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getLaunchOptions

##### 功能描述

获取小程序启动时的参数。与 App.onLaunch 的回调参数一致。

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getLaunchOptions } from '@ray-js/ray'
getLaunchOptions({ ... })
```

**原生小程序中使用**

```javascript
ty.getLaunchOptions({ ... })
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

| 属性         | 类型                | 说明                                                                          |
| ------------ | ------------------- | ----------------------------------------------------------------------------- |
| path         | string              | 启动小程序的路径 \(代码包路径\)                                               |
| scene        | `enum` MiniAppScene | 启动小程序的场景值                                                            |
| query        | any                 | 启动小程序的 query 参数                                                       |
| referrerInfo | ReferrerInfo        | 分享转发                                                                      |
| apiCategory  | string              | API 类别: default 默认类别; embedded 内嵌，通过打开半屏小程序能力打开的小程序 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` MiniAppScene**

| 枚举值 | 描述                       |
| ------ | -------------------------- |
| 1000   | 默认值                     |
| 1001   | 通过最近使用小程序列表进入 |
| 1002   | 通过 URL 映射进入          |

**ReferrerInfo**

| 属性      | 类型   | 默认值 | 必填 | 说明                                    |
| --------- | ------ | ------ | ---- | --------------------------------------- |
| appId     | string |        | 是   | 来源小程序的 appId                      |
| extraData | any    |        | 是   | 来源小程序传过来的数据，特定 scene 支持 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getLaunchOptions } from '@ray-js/ray';
// 原生调用方式
const { getLaunchOptionsSync } = ty;

getLaunchOptions({
  success: (res) => {
    console.log('getLaunchOptions success', res);
  }
});
```

###### 成功示例

```json
{
  "apiCategory": "default",
  "path": "pages/base/index",
  "query": {
    "deviceId": "",
    "miniapp_inner_referer": "https://thing.miniapp.com/tyotlohmrak8c7t9lj/1.0.0/page-frame.html",
    "mqttIdeHost": "mqtt-im.tuyacn.com",
    "token": "xxx"
  },
  "referrerInfo": {}
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |

##### 常见问题

###### Q：为什么功能页无法获取到启动参数？

A：当前接口不适用于功能页，功能页只能通过 onLaunch 来获取参数。
#### getLaunchOptionsSync

##### 功能描述

获取小程序启动时的参数。与 App.onLaunch 的回调参数一致。的同步版本

> 需引入`MiniKit`，且在`>=1.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getLaunchOptionsSync } from '@ray-js/ray'
getLaunchOptionsSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getLaunchOptionsSync({ ... })
```

##### 返回值

| 属性         | 类型                | 说明                                                                          | 版本 |
| ------------ | ------------------- | ----------------------------------------------------------------------------- | ---- |
| path         | string              | 启动小程序的路径 \(代码包路径\)                                               |      |
| scene        | `enum` MiniAppScene | 启动小程序的场景值                                                            |      |
| query        | any                 | 启动小程序的 query 参数                                                       |      |
| referrerInfo | ReferrerInfo        | 分享转发                                                                      |      |
| apiCategory  | string              | API 类别: default 默认类别; embedded 内嵌，通过打开半屏小程序能力打开的小程序 |      |

##### 引用对象

**`enum` MiniAppScene**

| 枚举值 | 描述                       |
| ------ | -------------------------- |
| 1000   | 默认值                     |
| 1001   | 通过最近使用小程序列表进入 |
| 1002   | 通过 URL 映射进入          |

**ReferrerInfo**

| 属性      | 类型   | 默认值 | 必填 | 说明                                    |
| --------- | ------ | ------ | ---- | --------------------------------------- |
| appId     | string |        | 是   | 来源小程序的 appId                      |
| extraData | any    |        | 是   | 来源小程序传过来的数据，特定 scene 支持 |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getEnterOptionsSync } from '@ray-js/ray';
// 原生调用方式
const { getEnterOptionsSync } = ty;

const res = getEnterOptionsSync();
console.log('getEnterOptionsSync', res);
```

###### 成功示例

```json
{
  "apiCategory": "default",
  "path": "pages/base/index",
  "query": {
    "deviceId": "",
    "miniapp_inner_referer": "https://thing.miniapp.com/tyotlohmrak8c7t9lj/1.0.0/page-frame.html",
    "mqttIdeHost": "mqtt-im.tuyacn.com",
    "token": "xxx"
  },
  "referrerInfo": {}
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |

##### 常见问题

###### Q：为什么功能页无法获取到启动参数？

A：当前接口不适用于功能页，功能页只能通过 onLaunch 来获取参数。
#### getAppInfo

##### 功能描述

拿到当前 App 的业务信息

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getAppInfo } from '@ray-js/ray'
getAppInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getAppInfo({ ... })
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

| 属性            | 类型   | 说明                                                |
| --------------- | ------ | --------------------------------------------------- |
| serverTimestamp | number | serverTimestamp 云端时间戳                          |
| appVersion      | string | appVersion app 版本                                 |
| language        | string | language app 语言包                                 |
| countryCode     | string | countryCode 国家码                                  |
| regionCode      | string | regionCode 地区码， 在 RN Api 中被当作“service”字段 |
| appName         | string | appName app 名称                                    |
| appIcon         | string | appIcon app 图标                                    |
| appEnv          | number | app 环境
0: 日常
1: 预发
2: 线上        |
| appBundleId     | string | app 包名                                            |
| appScheme       | string | app scheme                                          |
| appId           | string | app id                                              |
| clientId        | string | app clientId                                        |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 常见问题

Q: 如何判断当前环境是否在 IDE 中

A: 可以通过 `getAppInfo` 接口返回的 `appBundleId` 字段来判断，当 `appBundleId` 的值为 `com.miniapp.ide` 时表示在 Tuya MiniApp IDE 中运行，另外需注意该功能从 Tuya MiniApp IDE `0.8.11` 版本开始支持。
#### getTempDirectory

##### 功能描述

获取通用缓存路径

> 需引入`BaseKit`，且在`>=2.2.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getTempDirectory } from '@ray-js/ray'
getTempDirectory({ ... })
```

**原生小程序中使用**

```javascript
ty.getTempDirectory({ ... })
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

| 属性          | 类型   | 说明                                  |
| ------------- | ------ | ------------------------------------- |
| tempDirectory | string | 【待废弃， 不建议使用】临时文件夹路径 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述           |
| ------ | ------------------ |
| 9002   | Context is invalid |
#### getMenuButtonBoundingClientRect

##### 功能描述

获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。

> 需引入`MiniKit`，且在`>=2.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getMenuButtonBoundingClientRect } from '@ray-js/ray'
getMenuButtonBoundingClientRect({ ... })
```

**原生小程序中使用**

```javascript
ty.getMenuButtonBoundingClientRect({ ... })
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

| 属性   | 类型   | 说明                 |
| ------ | ------ | -------------------- |
| width  | number | 宽度，单位：px       |
| height | number | 高度，单位：px       |
| top    | number | 上边界坐标，单位：px |
| right  | number | 右边界坐标，单位：px |
| bottom | number | 下边界坐标，单位：px |
| left   | number | 左边界坐标，单位：px |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getMenuButtonBoundingClientRect } from '@ray-js/ray';
// 原生调用方式
const { getMenuButtonBoundingClientRect } = ty;

getMenuButtonBoundingClientRect({
  success: (res) => {
    console.log('getMenuButtonBoundingClientRect', res);
  }
});
```

###### 成功示例

```json
{
  "bottom": 86,
  "height": 34,
  "left": 318,
  "right": 403,
  "top": 52,
  "width": 85
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getMenuButtonBoundingClientRectSync

##### 功能描述

获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。的同步版本

> 需引入`MiniKit`，且在`>=2.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getMenuButtonBoundingClientRectSync } from '@ray-js/ray'
getMenuButtonBoundingClientRectSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getMenuButtonBoundingClientRectSync({ ... })
```

##### 返回值

| 属性   | 类型   | 说明                 | 版本 |
| ------ | ------ | -------------------- | ---- |
| width  | number | 宽度，单位：px       |      |
| height | number | 高度，单位：px       |      |
| top    | number | 上边界坐标，单位：px |      |
| right  | number | 右边界坐标，单位：px |      |
| bottom | number | 下边界坐标，单位：px |      |
| left   | number | 左边界坐标，单位：px |      |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getMenuButtonBoundingClientRectSync } from '@ray-js/ray';
// 原生调用方式
const { getMenuButtonBoundingClientRectSync } = ty;

const res = getMenuButtonBoundingClientRectSync();
console.log('getMenuButtonBoundingClientRectSync', res);
```

###### 成功示例

```json
{
  "bottom": 86,
  "height": 34,
  "left": 318,
  "right": 403,
  "top": 52,
  "width": 85
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### preDownloadMiniApp

##### 功能描述

预下载智能小程序，此接口仅供提供预下载普通智能小程序调用，面板小程序的预下载需要使用另外的接口。

> 需引入`MiniKit`，且在`>=2.3.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { preDownloadMiniApp } from '@ray-js/ray'
preDownloadMiniApp({ ... })
```

**原生小程序中使用**

```javascript
ty.preDownloadMiniApp({ ... })
```

##### 请求参数

**Object object**

| 属性           | 类型     | 默认值 | 必填 | 说明                                             |
| -------------- | -------- | ------ | ---- | ------------------------------------------------ |
| miniAppId      | string   |        | 是   | 小程序 id                                        |
| miniAppVersion | string   |        | 否   | 指定小程序版本\(可选参数\)                       |
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

##### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 6      | The parameter format is incorrect    |
| 7      | API Internal processing failed       |
#### showMenuButton

##### 功能描述

显示右上角胶囊按钮

> 需引入`MiniKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showMenuButton } from '@ray-js/ray'
showMenuButton({ ... })
```

**原生小程序中使用**

```javascript
ty.showMenuButton({ ... })
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

| 错误码 | 错误描述                           |
| ------ | ---------------------------------- |
| 40022  | this page can not hide menu button |
#### hideMenuButton

##### 功能描述

隐藏右上角胶囊按钮

> 需引入`MiniKit`，且在`>=2.5.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideMenuButton } from '@ray-js/ray'
hideMenuButton({ ... })
```

**原生小程序中使用**

```javascript
ty.hideMenuButton({ ... })
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

| 错误码 | 错误描述                           |
| ------ | ---------------------------------- |
| 40022  | this page can not hide menu button |
#### setPageOrientation

##### 功能描述

屏幕旋转设置，auto / portrait / landscape。pad 模式下不支持屏幕旋转

> 需引入`MiniKit`，且在`>=2.4.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { setPageOrientation } from '@ray-js/ray'
setPageOrientation({ ... })
```

**原生小程序中使用**

```javascript
ty.setPageOrientation({ ... })
```

##### 请求参数

**Object object**

| 属性            | 类型     | 默认值 | 必填 | 说明                                                   |
| --------------- | -------- | ------ | ---- | ------------------------------------------------------ |
| pageOrientation | string   |        | 是   | 屏幕旋转设置， auto\(暂不支持\) / portrait / landscape |
| success         | function |        | 否   | 接口调用成功的回调函数                                 |
| fail            | function |        | 否   | 接口调用失败的回调函数                                 |
| complete        | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）       |

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
import { setPageOrientation } from '@ray-js/ray';
// 原生调用方式
const { setPageOrientation } = ty;

setPageOrientation({
  pageOrientation: 'landscape'
});
```

##### 错误码

| 错误码 | 错误描述                                 |
| ------ | ---------------------------------------- |
| 5      | The necessary parameters are missing     |
| 8      | Method Unauthorized access               |
| 40021  | this page is not support set orientation |
#### share

分享

##### 引入

```js
import { share } from '@ray-js/ray';
```

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

<DemoBlock 
  githubUrl="https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/api-share" 
  qrCodeUrl="/images/qrCode/share.png" 
  lang="zh">
</DemoBlock>

**参数**

**Object object**

| 属性            | 类型              | 默认值 | 必填 | 说明                                                                                                                              |
| --------------- | ----------------- | ------ | ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| type            | `string`          |        | 是   | 分享渠道，可选值如下： WeChat：微信 Message：短信 Email：邮件 More：系统更多分享渠道（调用系统分享）                              |
| title           | `string`          |        | 是   | title 标题                                                                                                                        |
| message         | `string`          |        | 是   | message 文本内容                                                                                                                  |
| contentType     | `string`          |        | 是   | contentType 内容类型 空值默认为 text 可选值如下： text：文本 image：图片 file：文件 web：网页地址 miniProgram：微信小程序分享内容 |
| recipients      | `array`           |        | 否   | recipients 邮件收件人                                                                                                             |
| imagePath       | `string`          |        | 否   | imagePath 图片路径                                                                                                                |
| filePath        | `string`          |        | 否   | filePath 当 contentType == file 时候使用                                                                                          |
| webPageUrl      | `string`          |        | 否   | web 当 contentType == file 时候使用                                                                                               |
| miniProgramInfo | `MiniProgramInfo` |        | 否   | miniProgramInfo 当 contentType == miniProgram 时候使用，且分享渠道必须是微信。                                                    |
| complete        | `function`        |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                                                                                  |
| success         | `function`        |        | 否   | 接口调用成功的回调函数                                                                                                            |
| fail            | `function`        |        | 否   | 接口调用失败的回调函数                                                                                                            |

MiniProgramInfo

| 属性            | 类型      | 默认值 | 必填 | 说明       |
| --------------- | --------- | ------ | ---- | ---------- |
| userName        | `string`  |        | 是   | 用户名称   |
| path            | `string`  |        | 是   | 路径       |
| hdImagePath     | `string`  |        | 是   | 图片地址   |
| withShareTicket | `boolean` |        | 是   | ticket     |
| miniProgramType | `number`  |        | 是   | 类型       |
| webPageUrl      | `string`  |        | 是   | 小程序地址 |
#### getShareChannelList

##### 功能描述

获取可分享的渠道列表

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getShareChannelList } from '@ray-js/ray'
getShareChannelList({ ... })
```

**原生小程序中使用**

```javascript
ty.getShareChannelList({ ... })
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

| 属性             | 类型     | 说明                                             |
| ---------------- | -------- | ------------------------------------------------ |
| shareChannelList | string[] | 可分享的渠道列表\(WeChat、Message、Email、More\) |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### getUserInfo

##### 功能描述

获取用户信息

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getUserInfo } from '@ray-js/ray'
getUserInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getUserInfo({ ... })
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

| 属性            | 类型    | 说明                        |
| --------------- | ------- | --------------------------- |
| nickName        | string  | nickName 用户昵称           |
| avatarUrl       | string  | 用户头像                    |
| phoneCode       | string  | 国家代码                    |
| regionCode      | string  | 所在服务器区域 RegionCode   |
| isTemporaryUser | boolean | 是否是临时用户              |
| timezoneId      | string  | 时区                        |
| regFrom         | number  | 账号的注册方式 ThingRegType |
| tempUnit        | number  | 温度单位 TempUnit           |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### openCountrySelectPage

##### 功能描述

进入选择国家页面

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openCountrySelectPage } from '@ray-js/ray'
openCountrySelectPage({ ... })
```

**原生小程序中使用**

```javascript
ty.openCountrySelectPage({ ... })
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
#### onCountrySelectResult

##### 功能描述

监听国家选择页面的选择结果

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { onCountrySelectResult } from '@ray-js/ray'
onCountrySelectResult({ ... })
```

**原生小程序中使用**

```javascript
ty.onCountrySelectResult({ ... })
```

##### 参数

**function listener**
监听国家选择页面的选择结果
**参数**

| 属性        | 类型   | 默认值 | 必填 | 说明     |
| ----------- | ------ | ------ | ---- | -------- |
| countryCode | string |        | 否   | 国家码   |
| countryAbb  | string |        | 否   | 国家编码 |
| countryName | string |        | 否   | 国家名称 |
#### offCountrySelectResult

##### 功能描述

移除监听：监听国家选择页面的选择结果

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { offCountrySelectResult } from '@ray-js/ray'
offCountrySelectResult({ ... })
```

**原生小程序中使用**

```javascript
ty.offCountrySelectResult({ ... })
```

##### 参数

**function listener**

onCountrySelectResult 传入的监听函数。不传此参数则移除所有监听函数。
#### showStatusBar

##### 功能描述

显示手机状态栏

> 需引入`MiniKit`，且在`>=2.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { showStatusBar } from '@ray-js/ray'
showStatusBar({ ... })
```

**原生小程序中使用**

```javascript
ty.showStatusBar({ ... })
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

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### hideStatusBar

##### 功能描述

隐藏手机状态栏

> 需引入`MiniKit`，且在`>=2.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { hideStatusBar } from '@ray-js/ray'
hideStatusBar({ ... })
```

**原生小程序中使用**

```javascript
ty.hideStatusBar({ ... })
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

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### openSetting

##### 功能描述

调起客户端小程序设置界面，返回用户设置的操作结果。

> 需引入`MiniKit`，且在`>=2.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openSetting } from '@ray-js/ray'
openSetting({ ... })
```

**原生小程序中使用**

```javascript
ty.openSetting({ ... })
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

| 属性  | 类型 | 说明             |
| ----- | ---- | ---------------- |
| scope | any  | 用户授权设置信息 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |
#### openURL

##### 功能描述

打开设备上的某个应用或可以处理 URL 的程序。

> 需引入`MiniKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openURL } from '@ray-js/ray'
openURL({ ... })
```

**原生小程序中使用**

```javascript
ty.openURL({ ... })
```

##### 请求参数

**Object object**

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| url      | string   |        | 是   | 要打开的 url                                     |
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

| 错误码 | 错误描述                                  |
| ------ | ----------------------------------------- |
| 40026  | open url fail, not exist app can open it. |
#### openHelpCenter

##### 功能描述

打开帮助中心，默认：面板小程序会跳转到面板帮助中心，普通小程序会跳转到 App 帮助中心

> 需引入`MiniKit`，且在`>=2.6.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openHelpCenter } from '@ray-js/ray'
openHelpCenter({ ... })
```

**原生小程序中使用**

```javascript
ty.openHelpCenter({ ... })
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

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### openAppHelpCenter

打开跳转到 App 帮助与反馈页面

##### 引入

```js
import { openAppHelpCenter } from '@ray-js/ray';
```

> 需引入`MiniKit`，且在`>=2.6.0`版本才可使用。

> `@ray-js/ray >= 1.5.8`版本才可使用。

**参数**

**Object object**

| 属性     | 类型       | 默认值 | 必填 | 说明                                             |
| -------- | ---------- | ------ | ---- | ------------------------------------------------ |
| complete | `function` |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |
| success  | `function` |        | 否   | 接口调用成功的回调函数                           |
| fail     | `function` |        | 否   | 接口调用失败的回调函数                           |
#### getAssetHostname

> [VERSION] @ray-js/ray >= 0.5.10

##### 描述

自动根据当前面板所处的 App 环境获取对应的静态资源地址。

##### 参数

无

##### 返回值

无

##### 示例代码

###### 基础用法

```tsx
import React, { useState } from 'react';
import { View, Button, Text, getAssetHostname } from '@ray-js/ray';

export default function Demo() {
  const [hostname, setHostname] = useState('');

  const handleGetHostname = async () => {
    try {
      const result = await getAssetHostname();
      setHostname(result);
      console.log('静态资源地址:', result);
    } catch (err) {
      console.error('获取失败:', err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button onClick={handleGetHostname}>获取静态资源地址</Button>
      {hostname && <Text style={{ marginTop: 10 }}>{hostname}</Text>}
    </View>
  );
}
```
#### MiniWidgetDialog openMiniWidget

##### 功能描述

打开小部件弹窗

> 需引入`BaseKit`，且在`>=3.0.3`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openMiniWidget } from '@ray-js/ray'
const manager = openMiniWidget({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.openMiniWidget({ ... })
```

##### 请求参数

**Object object**

| 属性        | 类型                     | 默认值                      | 必填 | 说明                                                                          |
| ----------- | ------------------------ | --------------------------- | ---- | ----------------------------------------------------------------------------- |
| appId       | string                   |                             | 是   | 要打开的小部件 appid                                                          |
| pagePath    | string                   |                             | 否   | 对应的小部件页面相对 url, 如果为空则打开首页,path 中 ? 后面的部分会成为 query |
| deviceId    | string                   |                             | 否   | 面板类型设备 id                                                               |
| groupId     | string                   |                             | 否   | 面板群组类型群组 id                                                           |
| style       | string                   | `"middle"`                  | 否   | 小部件样式,默认 middle                                                        |
| versionType | `enum` WidgetVersionType | `WidgetVersionType.release` | 否   | 版本类型,默认 release                                                         |
| version     | string                   |                             | 否   | 版本号                                                                        |
| position    | `enum` WidgetPosition    | `WidgetPosition.bottom`     | 否   | 展示位置,默认 bottom                                                          |
| autoDismiss | boolean                  | `true`                      | 否   | 点击空白处是否关闭
`最低版本3.0.4`                                        |
| autoCache   | boolean                  | `true`                      | 否   | 是否优先展示默认缓存
对应属性在小程序容器 3.1.0 生效
`最低版本3.1.0`  |
| supportDark | boolean                  | `true`                      | 否   | 是否支持深色模式
`最低版本3.1.3`                                          |
| success     | function                 |                             | 否   | 接口调用成功的回调函数                                                        |
| fail        | function                 |                             | 否   | 接口调用失败的回调函数                                                        |
| complete    | function                 |                             | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）                              |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**`enum` WidgetVersionType**

| 枚举值  | 描述     |
| ------- | -------- |
| release | 线上版本 |
| preview | 预发版本 |

**`enum` WidgetPosition**

| 枚举值 | 描述     |
| ------ | -------- |
| bottom | 居底展示 |
| top    | 居顶展示 |
| center | 居中展示 |

##### 返回值

`MiniWidgetDialog`

##### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |

#### MiniWidgetDialog

##### 功能描述

一个用来控制小部件弹窗显示和关闭的对象

##### MiniWidgetDialog.dismissMiniWidget

> 需引入`BaseKit`，且在`>=3.0.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { openMiniWidget } from '@ray-js/ray'
const manager = openMiniWidget({ ... })
manager.dismissMiniWidget({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.openMiniWidget({ ... })
manager.dismissMiniWidget({ ... })
```

###### 功能描述

关闭小部件弹窗

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

###### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 7      | API Internal processing failed       |

##### MiniWidgetDialog.onWidgetDismiss

> 需引入`BaseKit`，且在`>=3.0.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { openMiniWidget } from '@ray-js/ray'
const manager = openMiniWidget({ ... })
manager.onWidgetDismiss({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.openMiniWidget({ ... })
manager.onWidgetDismiss({ ... })
```

###### 功能描述

监听 widget 关闭事件

> 创建多个实例时，off 事件调用时仅关闭当前示例的对应的事件监听。

###### 错误码

| 错误码 | 错误描述                             |
| ------ | ------------------------------------ |
| 5      | The necessary parameters are missing |
| 7      | API Internal processing failed       |

##### MiniWidgetDialog.offWidgetDismiss

> 需引入`BaseKit`，且在`>=3.0.3`版本才可使用

###### 使用

**Ray 中使用**

```javascript
import { openMiniWidget } from '@ray-js/ray'
const manager = openMiniWidget({ ... })
manager.offWidgetDismiss({ ... })
```

**原生小程序中使用**

```javascript
const manager = ty.openMiniWidget({ ... })
manager.offWidgetDismiss({ ... })
```

###### 功能描述

取消监听 widget 关闭事件

> 创建多个实例时，off 事件调用时仅关闭当前示例的对应的事件监听。

###### 参数

**function listener**

onWidgetDismiss 传入的监听函数。不传此参数则移除所有监听函数。
#### exitMiniWidget

##### 功能描述

关闭小部件

> 需引入`MiniKit`，且在`>=2.6.1`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { exitMiniWidget } from '@ray-js/ray'
exitMiniWidget({ ... })
```

**原生小程序中使用**

```javascript
ty.exitMiniWidget({ ... })
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

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getAccountInfo

##### 功能描述

获取小程序账号信息

> 需引入`MiniKit`，且在`>=3.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getAccountInfo } from '@ray-js/ray'
getAccountInfo({ ... })
```

**原生小程序中使用**

```javascript
ty.getAccountInfo({ ... })
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

| 属性        | 类型                   | 说明           |
| ----------- | ---------------------- | -------------- |
| miniProgram | MiniProgramAccountInfo | 小程序账号信息 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**MiniProgramAccountInfo**

| 属性       | 类型   | 默认值 | 必填 | 说明                                                                 |
| ---------- | ------ | ------ | ---- | -------------------------------------------------------------------- |
| appId      | string |        | 是   | 小程序 appId                                                         |
| envVersion | string |        | 是   | 小程序版本
develop: 开发版
trail: 体验版
release: 正式版 |
| version    | string |        | 是   | 小程序版本号                                                         |
| appName    | string |        | 是   | 小程序名称                                                           |
| appIcon    | string |        | 是   | 小程序图标                                                           |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getAccountInfo } from '@ray-js/ray';
// 原生调用方式
const { getAccountInfo } = ty;

getAccountInfo({
  success: (res) => {
    console.log('getAccountInfo success', res);
  },
  fail: (error) => {
    console.log('getAccountInfo fail', error);
  }
});
```

###### 成功示例

```json
{
  "appIcon": "",
  "appId": "xxx",
  "appName": "online_test_app",
  "envVersion": "develop",
  "version": "1.0.0"
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getAccountInfoSync

##### 功能描述

获取小程序账号信息的同步版本

> 需引入`MiniKit`，且在`>=3.1.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getAccountInfoSync } from '@ray-js/ray'
getAccountInfoSync({ ... })
```

**原生小程序中使用**

```javascript
ty.getAccountInfoSync({ ... })
```

##### 返回值

| 属性        | 类型                   | 说明           | 版本 |
| ----------- | ---------------------- | -------------- | ---- |
| miniProgram | MiniProgramAccountInfo | 小程序账号信息 |      |

##### 引用对象

**MiniProgramAccountInfo**

| 属性       | 类型   | 默认值 | 必填 | 说明                                                                 |
| ---------- | ------ | ------ | ---- | -------------------------------------------------------------------- |
| appId      | string |        | 是   | 小程序 appId                                                         |
| envVersion | string |        | 是   | 小程序版本
develop: 开发版
trail: 体验版
release: 正式版 |
| version    | string |        | 是   | 小程序版本号                                                         |
| appName    | string |        | 是   | 小程序名称                                                           |
| appIcon    | string |        | 是   | 小程序图标                                                           |

##### 代码示例

###### 请求示例

```jsx | pure
// Ray调用方式
import { getAccountInfoSync } from '@ray-js/ray';
// 原生调用方式
const { getAccountInfoSync } = ty;

const res = getAccountInfoSync();
console.log('getAccountInfoSync', res);
```

###### 成功示例

```json
{
  "appIcon": "",
  "appId": "xxx",
  "appName": "online_test_app",
  "envVersion": "develop",
  "version": "1.0.0"
}
```

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getCustomConfig

> [VERSION] 基础库 >= 2.0.0 | @ray-js/ray >= 3.0.0

##### 描述

获取小程序自定义配置信息。此接口用于获取在开发者后台配置的自定义业务配置，支持多种数据类型（链接、布尔值、数字、字符串）。自定义配置支持模板配置和实例配置的分层管理，实例配置优先于模板配置。配置修改后会自动同步到云端，小程序可以通过此接口获取最新的配置信息。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `success` | `(config: Record<string, CustomConfigValue>) => void` | 否 | 接口调用成功的回调函数，参数为各配置项的键值对 |
| `fail` | `(err: GetCustomConfigError) => void` | 否 | 接口调用失败的回调函数 |
| `complete` | `(res: Record<string, CustomConfigValue> \| GetCustomConfigError) => void` | 否 | 接口调用结束的回调函数（调用成功、失败都会执行） |

###### GetCustomConfigError

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `errorMsg` | `string` | 是 | - | 错误信息 |
| `errorCode` | `string` | 是 | - | 错误码 |

##### 返回值

类型: `Record<string, CustomConfigValue>`

success 回调返回数据

##### 失败返回值

接口调用失败时的回调参数
| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `errorMsg` | `string` | 是 | 错误信息 |
| `errorCode` | `string` | 是 | 错误码 |

##### 错误码

| 错误码 | 错误信息 |
| --- | --- |
| `7` | API Internal processing failed |

###### 引用对象

###### `type` CustomConfigValue

自定义配置项的值类型，支持字符串、数字、布尔值

```typescript
export type CustomConfigValue =
  /** 字符串 */
  | string
  /** 数字 */
  | number
  /** 布尔值 */
  | boolean
  /** 链接(特殊字符串) */
  | string;
```

##### 示例代码

###### 回调方式

```tsx
import React from 'react';
import { View, Button, Text, getCustomConfig } from '@ray-js/ray';

export default function Demo() {
  const handleGetConfig = () => {
    getCustomConfig({
      success(config) {
        console.log('自定义配置:', config);
      },
      fail(err) {
        console.error('获取失败:', err.errorMsg);
      },
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Button onClick={handleGetConfig}>获取自定义配置(回调)</Button>
    </View>
  );
}
```

###### Promise 方式

```tsx
import React, { useState } from 'react';
import { View, Button, Text, getCustomConfig } from '@ray-js/ray';

export default function Demo() {
  const [config, setConfig] = useState('');

  const handleGetConfig = async () => {
    try {
      const result = await getCustomConfig();
      setConfig(JSON.stringify(result));
      console.log('自定义配置:', result);
    } catch (err) {
      console.error('获取失败:', err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button onClick={handleGetConfig}>获取自定义配置(Promise)</Button>
      {config && <Text style={{ marginTop: 10 }}>{config}</Text>}
    </View>
  );
}
```

##### 注意事项

1. **配置缓存**：建议在应用启动时获取配置并缓存到全局变量中，避免频繁调用接口
2. **默认值处理**：始终为配置项设置默认值，确保在配置不存在时应用能正常运行
3. **类型检查**：获取配置后应该进行类型检查，确保数据类型符合预期
4. **错误处理**：妥善处理接口调用失败的情况，提供合理的降级策略

## 多语言

#### getLangContent

##### 功能描述

获取多语言

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getLangContent } from '@ray-js/ray'
getLangContent({ ... })
```

**原生小程序中使用**

```javascript
ty.getLangContent({ ... })
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

| 属性        | 类型   | 说明   |
| ----------- | ------ | ------ |
| langContent | object | 多语言 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |
#### getLangKey

##### 功能描述

获取手机当前地区语言 zh-hans 、en-GB

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { getLangKey } from '@ray-js/ray'
getLangKey({ ... })
```

**原生小程序中使用**

```javascript
ty.getLangKey({ ... })
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

| 属性    | 类型   | 说明             |
| ------- | ------ | ---------------- |
| langKey | string | 手机当前地区语言 |

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 错误码

| 错误码 | 错误描述                       |
| ------ | ------------------------------ |
| 7      | API Internal processing failed |

## 面板

#### preloadPanel

##### 功能描述

面板预下载

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { preloadPanel } from '@ray-js/ray'
preloadPanel({ ... })
```

**原生小程序中使用**

```javascript
ty.preloadPanel({ ... })
```

##### 请求参数

**Object object**

| 属性      | 类型             | 默认值 | 必填 | 说明                                                        |
| --------- | ---------------- | ------ | ---- | ----------------------------------------------------------- |
| deviceId  | string           |        | 是   | 设备 id                                                     |
| extraInfo | PanelExtraParams |        | 否   | 额外面板信息
当预下载的是二级面板时, 需要传递的额外信息 |
| success   | function         |        | 否   | 接口调用成功的回调函数                                      |
| fail      | function         |        | 否   | 接口调用失败的回调函数                                      |
| complete  | function         |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）            |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**PanelExtraParams**

| 属性           | 类型   | 默认值      | 必填 | 说明                                                |
| -------------- | ------ | ----------- | ---- | --------------------------------------------------- |
| productId      | string |             | 是   | 产品 id                                             |
| productVersion | string |             | 是   | 产品版本                                            |
| i18nTime       | string |             | 是   | 面板多语言时间戳                                    |
| bizClientId    | string |             | 是   | 容器 ID
可能是 uiid 的值也可能是 miniAppId 的值 |
| uiType         | string |             | 否   | 包类型
RN RN 类型
SMART_MINIPG 小程序类型   |
| uiPhase        | string | `"release"` | 否   | 包发布状态                                          |

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 20001  | DeviceId is invalid |
#### openPanel

##### 功能描述

跳转打开面板
不关心是跳转 RN 面板还是面板小程序

> 需引入`BizKit`，且在`>=3.0.0`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { openPanel } from '@ray-js/ray'
openPanel({ ... })
```

**原生小程序中使用**

```javascript
ty.openPanel({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型             | 默认值 | 必填 | 说明                                                      |
| ------------ | ---------------- | ------ | ---- | --------------------------------------------------------- |
| deviceId     | string           |        | 是   | 设备信息 Id                                               |
| extraInfo    | PanelExtraParams |        | 否   | 额外面板信息
当跳转的是二级面板时, 需要传递的额外信息 |
| initialProps | any              |        | 否   | 面板携带业务启动参数                                      |
| success      | function         |        | 否   | 接口调用成功的回调函数                                    |
| fail         | function         |        | 否   | 接口调用失败的回调函数                                    |
| complete     | function         |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）          |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**PanelExtraParams**

| 属性           | 类型   | 默认值      | 必填 | 说明                                                |
| -------------- | ------ | ----------- | ---- | --------------------------------------------------- |
| productId      | string |             | 是   | 产品 id                                             |
| productVersion | string |             | 是   | 产品版本                                            |
| i18nTime       | string |             | 是   | 面板多语言时间戳                                    |
| bizClientId    | string |             | 是   | 容器 ID
可能是 uiid 的值也可能是 miniAppId 的值 |
| uiType         | string |             | 否   | 包类型
RN RN 类型
SMART_MINIPG 小程序类型   |
| uiPhase        | string | `"release"` | 否   | 包发布状态                                          |

##### 错误码

| 错误码 | 错误描述             |
| ------ | -------------------- |
| 20001  | DeviceId is invalid  |
| 20046  | Open RN panel failed |
#### backToHomeAndOpenPanel

##### 功能描述

回到首页并打开面板

> 需引入`BizKit`，且在`>=3.2.7`版本才可使用

##### 使用

**Ray 中使用**

```javascript
import { backToHomeAndOpenPanel } from '@ray-js/ray'
backToHomeAndOpenPanel({ ... })
```

**原生小程序中使用**

```javascript
ty.backToHomeAndOpenPanel({ ... })
```

##### 请求参数

**Object object**

| 属性         | 类型             | 默认值 | 必填 | 说明                                                      |
| ------------ | ---------------- | ------ | ---- | --------------------------------------------------------- |
| deviceId     | string           |        | 是   | 设备信息 Id                                               |
| extraInfo    | PanelExtraParams |        | 否   | 额外面板信息
当跳转的是二级面板时, 需要传递的额外信息 |
| initialProps | any              |        | 否   | 面板携带业务启动参数                                      |
| success      | function         |        | 否   | 接口调用成功的回调函数                                    |
| fail         | function         |        | 否   | 接口调用失败的回调函数                                    |
| complete     | function         |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行）          |

##### 返回结果

**success**

`void`

**fail**

| 属性      | 类型   | 说明         |
| --------- | ------ | ------------ |
| errorMsg  | string | 插件错误信息 |
| errorCode | string | 错误码       |

##### 引用对象

**PanelExtraParams**

| 属性           | 类型   | 默认值      | 必填 | 说明                                                |
| -------------- | ------ | ----------- | ---- | --------------------------------------------------- |
| productId      | string |             | 是   | 产品 id                                             |
| productVersion | string |             | 是   | 产品版本                                            |
| i18nTime       | string |             | 是   | 面板多语言时间戳                                    |
| bizClientId    | string |             | 是   | 容器 ID
可能是 uiid 的值也可能是 miniAppId 的值 |
| uiType         | string |             | 否   | 包类型
RN RN 类型
SMART_MINIPG 小程序类型   |
| uiPhase        | string | `"release"` | 否   | 包发布状态                                          |

##### 错误码

| 错误码 | 错误描述            |
| ------ | ------------------- |
| 20001  | DeviceId is invalid |

## DOM

#### getBoundingClientRect

> [VERSION] @ray-js/ray >= 0.5.10

##### 描述

获取节点的坐标信息

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ref` | `Element` | 是 | 通过 getElementById 获取的节点引用 |

##### 返回值

类型: `Promise<Rect>`

包含节点坐标和尺寸信息的 Rect 对象，节点不存在时返回 null

###### Rect

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `right` | `number` | 是 | 节点右边界坐标 |
| `left` | `number` | 是 | 节点左边界坐标 |
| `top` | `number` | 是 | 节点上边界坐标 |
| `bottom` | `number` | 是 | 节点下边界坐标 |
| `width` | `number` | 是 | 节点宽度 |
| `height` | `number` | 是 | 节点高度 |

##### 示例代码

###### 基础用法

```tsx
import React, { useState } from 'react';
import { View, Button, Text, getBoundingClientRect, getElementById } from '@ray-js/ray';

export default function Demo() {
  const [info, setInfo] = useState('');

  const handleGetRect = async () => {
    const element = await getElementById('targetBox');
    if (element) {
      const rect = await getBoundingClientRect(element);
      if (rect) {
        setInfo(`宽:${rect.width} 高:${rect.height} 左:${rect.left} 上:${rect.top}`);
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <View
        id="targetBox"
        style={{
          width: 200,
          height: 100,
          backgroundColor: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff' }}>目标区域</Text>
      </View>
      <Button style={{ marginTop: 10 }} onClick={handleGetRect}>
        获取坐标信息
      </Button>
      {info && <Text style={{ marginTop: 10 }}>{info}</Text>}
    </View>
  );
}
```
#### getElementById

> [VERSION] @ray-js/ray >= 0.5.10

##### 描述

获取页面节点

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 节点的 id 属性值 |

##### 返回值

类型: `Promise<Element>`

节点引用对象，节点不存在时返回 null

##### 示例代码

###### 基础用法

```tsx
import React from 'react';
import { View, Button, Text, getElementById } from '@ray-js/ray';

export default function Demo() {
  const handleGetElement = async () => {
    const element = await getElementById('targetView');
    console.log('节点引用:', element);
  };

  return (
    <View style={{ padding: 20 }}>
      <View
        id="targetView"
        style={{
          height: 100,
          backgroundColor: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff' }}>目标节点</Text>
      </View>
      <Button style={{ marginTop: 10 }} onClick={handleGetElement}>
        获取节点引用
      </Button>
    </View>
  );
}
```
