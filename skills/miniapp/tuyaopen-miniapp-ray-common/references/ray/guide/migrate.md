# RN 开发者接入 (migrate)

[AI-generated summary: 为有React Native面板开发经验的开发者快速了解涂鸦面板小程序的对应功能和迁移路径而准备的综合指南。覆盖内容：Tuya MiniApp IDE、体验面板、产品创建、工程初始化、开发调试、打包上传、useProps、useActions、useDevice、useSupport、publishDps、onDpDataChange、openTimerPage、openDeviceDetailPage、getBTDeviceInfo、connectBTBond、getSystemInfo、showLoading、showModal、SJS、RJS、混合开发、rpx单位、颜色转换、温度工具、JSON解析、核心工具、字符串工具、时间工具、数值工具、定时管理、场景联动、设备告警、天文定时]

## 指南

本接入指南主要是为有 React Native 面板开发经验，希望快速了解面板小程序对应功能的用户准备的。

**在使用面板小程序开发之前，你不必完整阅读这些内容，可以在实际开发过程中按需查找**。

如果你是新手，建议直接阅读 [快速开始-面板小程序](/cn/miniapp/develop/ray/guide/start/quick-start)。

---

#### 快速入门

此处列举出了面板小程序和 RN 在快速入门上的区别及注意事项，具体细节可阅读 [快速开始-面板小程序](/cn/miniapp/develop/ray/guide/start/quick-start)。

##### 一、搭建环境

**区别**：

- 需要额外安装 [Tuya MiniApp IDE](/cn/miniapp/devtools/tools)，但不再需要安装 cli 工具。

**优势**：

- 内置打包构建、调试及发布功能。

**注意事项**：

- 无。

---

##### 二、体验面板

**区别**：

- 无。

**优势**：

- 除了 [脚手架](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template) 和 [功能组件体验 Demo](https://developer.tuya.com/material/smartui?comId=help-getting-started)，还提供了一系列 [功能模块示例项目](https://github.com/Tuya-Community/tuya-miniapp-demo)。

**注意事项**：

- 无。

---

##### 三、创建产品

**区别**：

- 无。

**优势**：

- 无。

**注意事项**：

- 无。

---

##### 四、初始化工程

**区别**：

- 面板小程序需要从 Tuya MiniApp IDE 中创建工程并关联对应的产品及其面板小程序，用于后续的设备调试及发布。

**优势**：

- 部分工程模板提供了配套的 [Codelab 教程](https://developer.tuya.com/cn/miniapp-codelabs)。

**注意事项**：

- 面板小程序废弃了部分 RN 已过时的模板，如有需求，可通过 [社区论坛](https://www.tuyaos.com/viewforum.php?f=10) 寻求帮助和支持。

---

##### 五、开发调试

**区别**：

- 面板小程序可直接使用智能生活 App 或 OEM App 进行调试。
- 面板小程序可通过 Tuya MiniApp IDE 在 PC 端进行开发调试。

**优势**：

- 内置 [面板开发工具](/cn/miniapp/devtools/tools/extension/panel) 和 AI 插件。
- 无需额外安装调试 App，使用智能生活 App 或 OEM App 即可。

**注意事项**：

- 最终上线务必经过 iOS 和安卓双端真机测试，PC 端因为环境限制无法保证行为 100% 一致。

---

##### 六、打包上传

**区别**：

- 面板小程序只需上传一个资源包。
- 面板小程序发布需涂鸦官方审核。
- 面板小程序需维护多区服务器域名、多区静态资源、云项目等信息。

**优势**：

- 支持多版本管理和灰度策略。
- 支持通过体验二维码，动态输入设备 ID 测试不同设备功能。
- 支持通过 [Kit 能力](/cn/miniapp/common/desc/tech-stack/api#kit-%E8%83%BD%E5%8A%9B) 兼容适配不同 App 基线版本。

**注意事项**：

- 无。

---

#### API

**区别**：

- 小程序对 API 进行了原子化拆分和拓展，因此在 API 数量上会有所增加。

**优势**：

- API 能力更加丰富以及灵活，能支持更多以往不支持的基础能力或业务场景，如 **多设备控制**、**多媒体**、**物模型** 等等。

**注意事项**：

- 由于 RN 的 API 数量较多，我们提供了一份 [API 迁移指南](/cn/miniapp/develop/ray/guide/migrate/api/basic) 方便参照。

---

#### 脚手架

**区别**：

- 基于面板小程序方案及全新的面板 SDK 进行了相应的调整和设计。

**优势**：

- 部分工程模板提供了配套的 [Codelab 教程](https://developer.tuya.com/cn/miniapp-codelabs)。

**注意事项**：

- 面板小程序废弃了部分 RN 已过时的模板，如有需求，可通过 [社区论坛](https://www.tuyaos.com/viewforum.php?f=10) 寻求帮助和支持。

---

#### 国际化多语言

**区别**：

- 面板小程序与 RN 的多语言 API 完全一致，仅引用包名不同，参考 [多语言适配](/cn/miniapp/solution-panel/ability/common/multi-language) 上手使用。

**优势**：

- 支持面板小程序多语言的平台化管理，可以更好地应对多个产品关联在同一个面板下需要同时生效的多语言需求场景。

**注意事项**：

- 面板小程序的多语言逻辑与 RN 完全一致，但由于业务逻辑较复杂，建议提前阅读 [多语言适配#常见问题](/cn/miniapp/solution-panel/ability/common/multi-language#常见问题)。

---

#### 基础组件

**区别**：

- 提供了 [基础组件](/cn/miniapp/develop/ray/component) 对应 RN 官方的基础组件。
- 提供了 [SmartUI 组件库](https://developer.tuya.com/material/smartui?comId=help-getting-started) 对应涂鸦官方提供的组件库。

**优势**：

- 基于 WebView 作为渲染引擎，天然支持 CSS，在样式灵活性、社区生态及组件开发效率上更胜一筹。
- SmartUI 组件库在平台上提供了 Codesandbox 实时编辑预览的能力。

**注意事项**：

- RN 通过限制写法以及使用原生组件的方式，在原理上其性能是优于小程序的，为了弥补这部分差距，我们提供了如 `SJS`、`RJS`、`eventChannel`、`原生组件`、`混合开发` 等技术方案。

---

### 值得注意的新特性

面板小程序相较于 RN 面板开发，有以下几个值得注意的新特性：

#### 面板开发工具

**之前：**

仅能通过开发者平台的 [设备调试](https://developer.tuya.com/cn/docs/iot/device_debug?id=Kbrcqod1qa730) 功能进行调试。

**现在：**

1. 在开发者平台的设备调试功能之外，可在 [面板工具](/cn/miniapp/devtools/tools/extension/panel) 中直接进行设备调试。

2. 同时支持 [复杂协议](https://developer.tuya.com/cn/docs/iot/complex-protocol-description?id=Kbabmb54ueujl) 功能点调试。

#### 智能设备模型

**之前：**

面板 SDK 仅提供了基础的设备 API 包装，通常需要通过 `redux` 等状态管理库来管理设备状态。

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { useSelector } from '@models';

export default function Home() {
  const dispatch = useDispatch();
  const power = useSelector(state => state.dpState.power);

  const handleTogglePower = () => {
    dispatch(actions.common.updateDp({ power: !power }));
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>power: {power}</Text>
      <TouchableOpacity onPress={handleTogglePower}>
        <Text>toggle power</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**现在：**

1. 面板 SDK 提供了 `useProps` 和 `useActions` 两个 hooks，可直接用于获取设备状态和对设备进行控制。

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';

export default function Home() {
  const power = useProps((props) => props.power);
  const actions = useActions();
  return (
    <View style={{ flex: 1 }}>
      <View>power: {power}</View>
      <View onClick={actions.power.toggle}>toggle power</View>
    </View>
  );
}
```

2. 通过 [智能设备的描述文件](/cn/miniapp/solution-panel/ability/common/sdm/usage#定义智能设备描述文件)（即原 RN SDK 中 TYSdk.devInfo.schema）配合 TS 类型推导，可获得更优雅的设备开发体验。

3. 面板 SDK 中内置了功能点处理拦截器（即 dp-kit），内置支持解析 & 反解析复杂类型 DP 功能点，下发节流、防抖、过滤等功能。

#### 支持多设备及更丰富的能力

**之前：**

1. 仅支持单设备控制：

```js
TYSdk.device.putDeviceData({ switch_1: true });
```

2. 仅支持以下有限的能力：

- 原生方法
- 移动方法
- 设备方法
- ...

**现在：**

1. 所有 API 及事件均支持指定设备的控制或响应：

```js
// 设备控制
publishDps({
  // 可以通过指定 deviceId 控制家庭下的指定设备
  deviceId: 'vdevoxxxxx',
  dps: { switch_1: true },
  success: res => {
    console.log(res);
  },
  fail: error => {
    console.log(error);
  },
});

// 设备监听
onDpDataChange((res)=>{
  console.log(res);
  // 可以通过判断指定的 deviceId 监听家庭下的指定设备
  // {
  //   deviceId: "vdevo169477319679442",
  //   dps: {
  //     1: true
  //   },
  //   gwId: ''
  // }
})
```

2. 支持更丰富的基础或设备能力，详见 [API](/cn/miniapp/develop/ray/api/base/framework/getApp)

#### 平台拓展能力（体验二维码、数据统计、性能质量）

**之前：**

1. 产品 A 当前关联了面板 A，想要切换到新开发的面板 B 上，只能将产品 A 直接切换到面板 B 上，存在一定的风险。

**现在：**

1. 产品 A 当前关联了面板 A，想要切换到新开发的面板 B 上，只需在生成指定设备 id 的体验二维码即可，无需关联产品 A，可在测试完毕后再关联产品 A。

2. 小程序平台内置提供了数据统计、性能质量等能力，可在开发者平台中查看分析。

### 值得关注的进阶技术点

面板小程序相较于 RN 面板开发，有以下几个值得关注的进阶技术点：

#### SJS

- **应用场景**：用于应对频繁用户交互的场景，类似 RN 中的 [setNativeProps](https://reactnative.cn/docs/direct-manipulation)。
- **参考文档**：[SJS 响应事件](/cn/miniapp/develop/miniapp/framework/event/sjs)、[SJS 语法参考](/cn/miniapp/develop/miniapp/framework/sjs)
- **参考示例**：[tuya-miniapp-demo/sjs](https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/sjs)

#### RJS

- **应用场景**：用来处理高频的绘图需求，提高视图的动画渲染性能，如 Canvas 图表渲染，WebGL 图形渲染等。
- **参考文档**：[Render Script](/cn/miniapp/develop/miniapp/framework/api/render#render-script)
- **参考示例**：[tuya-miniapp-demo/rayRjsPlugin](https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayRjsPlugin)

#### 混合开发

- **应用场景**：在 Ray 框架中直接引用原生小程序语法开发的组件或者微信小程序生态的三方组件，用于提升性能或开发效率。
- **参考文档**：[混合开发](/cn/miniapp/develop/ray/framework/mixed-development)
- **参考示例**：[tuya-miniapp-demo/rayUseAx](https://github.com/Tuya-Community/tuya-miniapp-demo/tree/master/rayUseWX)

## API

### 基础

#### 原生方法

##### 跳转面板定时页

**之前：**

```js
TYSdk.native.gotoDpAlarm(params);
```

**现在：**

详见 [openTimerPage](/cn/miniapp/develop/ray/api/timer/base/openTimerPage#opentimerpage)

```tsx
import { openTimerPage } from '@ray-js/ray';

openTimerPage({
  deviceId: device_id,
  category: 'category',
  data:[
    {
      dpName: '开关1',
      dpId: '1',
      rangeKeys:["open","close"],
      rangeValues:["开","关"]
    }
  ],
  success: (res) => {
    console.log('success',res);
  }
  })
```

##### 跳转设备详情页

**之前：**

```js
TYSdk.native.showDeviceMenu()
```

**现在：**

详见 [openDeviceDetailPage](/cn/miniapp/develop/ray/api/functional/openDeviceDetailPage#opendevicedetailpage)

##### 获取设备蓝牙信息

**之前：**

```js
TYSdk.native.getBTInfo('YOUR_DEVICE_ID')
  .then(data => console.log('data: ', data))
  .catch(err => console.log('err: ', err));
```

**现在：**

详见 [getBTDeviceInfo](/cn/miniapp/develop/ray/api/device-connect/BT/getBTDeviceInfo#getbtdeviceinfo)

##### 打开蓝牙配对弹窗（安卓）

**之前：**

```js
TYSdk.native.createBTbond('YOUR_DEVICE_MAC')
  .then(data => console.log('data: ', data))
  .catch(err => console.log('err: ', err));
```

**现在：**

详见 [connectBTBond](/cn/miniapp/develop/ray/api/device-connect/BT/connectBTBond)

##### 移除蓝牙连接（安卓）

**之前：**

```js
TYSdk.native.removeBTbond()
```

**现在：**

详见 [disconnectBTBond](/cn/miniapp/develop/ray/api/device-connect/BT/disconnectBTBond#disconnectbtbond)

##### 打开系统设置页面（iOS）

**之前：**

```js
TYSdk.native.jumpToSettingPage();
```

**现在：**

详见 [openSystemSettingPage](/cn/miniapp/develop/ray/api/base/system/openSystemSettingPage#opensystemsettingpage)

#### 移动方法

##### 返回 App 列表

**之前：**

```js
TYSdk.mobile.back();
```

**现在：**

详见 [exitMiniProgram](/cn/miniapp/develop/ray/api/navigate/exitMiniProgram#exitminiprogram)

##### 显示底部对话列表【废弃】

已废弃，建议使用前端 UI 组件，如 SmartUI 的 [ActionSheet](https://developer.tuya.com/material/smartui?comId=action-sheet) 替代实现

##### 禁用手势全屏返回【废弃】

已废弃

##### 开启手势全屏返回【废弃】

已废弃

##### 获取客户端信息

**之前：**

```js
TYSdk.mobile.getMobileInfo();
```

**现在：**

可配合 [getSystemInfo](/cn/miniapp/develop/ray/api/base/system/getSystemInfo#getsysteminfo) 及 [getMobileDeviceInfo](/cn/miniapp/develop/ray/api/base/system/getMobileDeviceInfo#getmobiledeviceinfo) 获取客户端信息

##### 获取网络状态

**之前：**

```js
TYSdk.mobile.getNetworkState();
```

**现在：**

详见 [getNetworkType](/cn/miniapp/develop/ray/api/device/network/getNetworkType#getnetworktype)，如需获取设备某个通道是否在线，可使用 [getDeviceOnlineType](/cn/miniapp/develop/ray/api/device-info/info/getDeviceOnlineType#getdeviceonlinetype)

##### 显示 loading UI 框

**之前：**

```js
TYSdk.mobile.showLoading();
```

**现在：**

详见 [showLoading](/cn/miniapp/develop/ray/api/ui/interaction/showLoading#showloading)

##### 隐藏 loading UI 框

**之前：**

```js
TYSdk.mobile.hideLoading();
```

**现在：**

详见 [hideLoading](/cn/miniapp/develop/ray/api/ui/interaction/hideLoading#hideLoading)

##### 检测时间制

**之前：**

```js
TYSdk.mobile.is24Hour()
 .then(data => {
    console.log('data :>> ', data);
  })
  .catch(error => {
    console.log('error :>> ', error);
  });
```

**现在：**

详见 [getSystemInfo](/cn/miniapp/develop/ray/api/base/system/getSystemInfo#getsysteminfo) 中的 `is24Hour` 返回值

##### 跳转二级页面

##### 跳转至已存在场景

**之前：**

```js
TYSdk.mobile.jumpTo('tuyasmart://xxxUrl');
```

**现在：**

原先 RN 中的部分场景已不再建议使用，若存在面板小程序中无法找到对应的短链，请前往 [论坛社区](https://www.tuyaos.com/viewforum.php?f=10) 描述您的具体需求和场景，我们安排评估支持。

- [openCreateTapToRunScene](/cn/miniapp/develop/ray/api/scenes/functional/openCreateTapToRunScene)
- [openShareDevice](/cn/miniapp/develop/ray/api/functional/openShareDevice)
- ...

##### 编辑对话框【废弃】

已废弃，建议使用前端 UI 组件，如 SmartUI 的 [Dialog 弹出框](https://developer.tuya.com/material/smartui?comId=dialog#%E6%B6%88%E6%81%AF%E7%A1%AE%E8%AE%A4) 替代实现

##### 轻量级对话【废弃】

已废弃，建议使用前端 UI 组件，如 SmartUI 的 [Dialog 弹出框](https://developer.tuya.com/material/smartui?comId=dialog#%E6%B6%88%E6%81%AF%E7%A1%AE%E8%AE%A4) 替代实现

##### 简易确认对话框

**之前：**

```js
TYSdk.mobile.simpleConfirmDialog(title, msg, onConfirmed, onCanceled);
```

**现在：**

详见 [showModal](/cn/miniapp/develop/ray/api/ui/interaction/showModal#showmodal)

##### 简易提示框

**之前：**

```js
TYSdk.mobile.simpleTipDialog(msg, onConfirmed);
```

**现在：**

详见 [showModal](/cn/miniapp/develop/ray/api/ui/interaction/showModal#showmodal)，如将 `showCancel` 入参设置为 `false`

#### 设备方法

##### 下发 dp 点状态 / 下发局域网内 dp 点状态

**之前：**

```js
TYSdk.device.putDeviceData({ switch_1: true });

// or

TYSdk.device.putLocalDpData({ switch_1: true });
```

**现在：**

```js
import { publishDps } from '@ray-js/ray';
 
await publishDps({ switch_1: true });
```

但我们更推荐使用智能设备模型中配套的 `useActions` Hooks 进行 dp 点下发，详见 [useActions](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useActions)

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
 
export default function Home() {
  const switch_1 = useProps(props => props.switch_1);
  const actions = useActions();
  return (
    <View
      style={{ flex: 1 }}
      onClick={() => {
        actions.switch_1.toggle();
      }}
    >
      <View>socket.switch_1: {switch_1}</View>
    </View>
  );
}
```

##### 获取设备状态信息

**之前：**

```js
TYSdk.device.getDeviceState()
.then(data => {
    console.log('data :>> ', data);
  })
  .catch(error => {
    console.log('error :>> ', error);
  });
```

**现在：**

详见 [useProps](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useProps)

getDeviceState 只会获取当前的设备状态信息，而 useProps 会在设备状态变更时自动驱动刷新<br/>
  因此除非当前页面或组件需要监听所有功能点的变化，否则请勿使用该方式，会导致当前页面或组件出现性能问题，频繁进行无效的重复渲染。

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
 
export default function Home() {
  const dpState1 = useProps();
  const dpState2 = useProps(props => props);
  return (
    <View style={{ flex: 1 }}>
      <View>dpState1: {JSON.stringify(dpState1)}</View>
      <View>dpState2: {JSON.stringify(dpState2)}</View>
    </View>
  );
}
```

##### 检查 dp 是否存在

**之前：**

```js
TYSdk.device.checkDpExist(idOrCode);
// 若输入 dpCode 则返回 dpId
const data = TYSdk.device.checkDpExist('switch_1');
// 若输入 dpId 则返回 dpCode
const data = TYSdk.device.checkDpExist('1');
console.log('data: ', data);
```

**现在：**

详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const isSwitchExist1 = useDevice(device => typeof device.devInfo.codeIds.switch_1 !== 'undefined');
  const isSwitchExist2 = useDevice(device => typeof device.devInfo.idCodes[1] !== 'undefined');
  return (
    <View style={{ flex: 1 }}>
      <View>isSwitchExist1: {isSwitchExist1}</View>
      <View>isSwitchExist2: {isSwitchExist2}</View>
    </View>
  );
}
```

##### 获取设备信息

**之前：**

```js
TYSdk.device.getDeviceInfo()
  .then((data: DevInfo) => {
    console.log('data :>> ', data);
  })
  .catch(error => {
    console.log('error :>> ', error);
  });
```

**现在：**

方式一：通过 getDeviceInfo 获取，详见 [getDeviceInfo](/cn/miniapp/develop/ray/api/device-info/info/getDeviceInfo#getdeviceinfo)

```ts
import { device } from '@ray-js/ray';
const { getDeviceInfo } = device;

getDeviceInfo({
  deviceId: 'vdevxxxxx',
})
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

方式二：通过 SDM 的 Hooks，详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const devInfo = useDevice(device => device.devInfo);
  return (
    <View style={{ flex: 1 }}>
      <View>devInfo: {devInfo}</View>
    </View>
  );
}
```

##### 获取 dpCode

**之前：**

```js
TYSdk.device.getDpCodeById('22');
```

**现在：**

详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const switchCode = useDevice(device => device.devInfo.idCodes[22]);
  return (
    <View style={{ flex: 1 }}>
      <View>switchCode: {switchCode}</View>
    </View>
  );
}
```

##### 获取 dpCodes

**之前：**

```js
TYSdk.device.getDpCodes();
```

**现在：**

详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const dpCodes = useDevice(device => device.devInfo.idCodes);
  return (
    <View style={{ flex: 1 }}>
      <View>dpCodes: {dpCodes}</View>
    </View>
  );
}
```

##### 获取 dp 点状态

**之前：**

```js
TYSdk.device.getDpDataFromDevice(idOrCode)
 .then(data => {
    console.log('data :>> ', data);
  })
  .catch(error => {
    console.log('error :>> ', error);
  });
```

**现在：**

详见 [queryDps](/cn/miniapp/develop/ray/api/device-control/dp/queryDps#querydps)

##### 获取 dpId

**之前：**

```js
TYSdk.device.getDpIdByCode('bright_value');
```

**现在：**

详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const brightId = useDevice(device => device.devInfo.codeIds.bright_value);
  return (
    <View style={{ flex: 1 }}>
      <View>brightId: {brightId}</View>
    </View>
  );
}
```

##### 获取 schema 信息

**之前：**

```js
TYSdk.device.getDpSchema(dpCode);
// 获取开关 switch_1 的 Schema 信息
const data = TYSdk.device.getDpSchema('switch_1');
console.log('data: ', data);
```

**现在：**

详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const dpSchema = useDevice((device) => device.dpSchema);
  return (
    <View style={{ flex: 1 }}>
      <View>device dpSchema: {JSON.stringify(dpSchema)}</View>
    </View>
  );
}
```

##### 获取 dp 的 value 值

**之前：**

```js
TYSdk.device.getState(idOrCode);
```

**现在：**

详见 [useProps](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useProps)

getState 只会获取当前的设备状态，而 useProps 会在指定的设备功能点状态变更时自动驱动视图刷新

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
 
export default function Home() {
  const power = useProps((props) => props[idOrCode]);
  return (
    <View style={{ flex: 1 }}>
      <View>power: {power}</View>
    </View>
  );
}
```

##### 是否是蓝牙设备 / 设备共享 / SigMesh 设备 / 无线 Wi-Fi 设备

**之前：**

```js
TYSdk.device.isBleDevice();
TYSdk.device.isShareDevice();
TYSdk.device.isSigMeshDevice();
TYSdk.device.isWifiDevice();
```

**现在：**

详见 [useSupport](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useSupport)

```tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';
import { useSupport, useDevice } from '@ray-js/panel-sdk';
 
function PageSdmSupport() {
  const support = useSupport();
  const isShareDevice = useDevice(device => device.devInfo.isShare);
  return (
    <View>
      <Text>{support.isBleDevice() ? 'BLE Device' : 'Other Device'}</Text>
      <Text>{isShareDevice ? 'Share Device' : 'Other Device'}</Text>
      <Text>{support.isSigMeshDevice() ? 'SigMesh Device' : 'Other Device'}</Text>
      <Text>{support.isWifiDevice() ? 'Wi-Fi Device' : 'Other Device'}</Text>
    </View>
  );
}
```

#### 请求接口

**之前：**

```js
TYSdk.apiRequest(a, postData, version)
  .then(data =>
    console.log('data',data);
  )
  .catch(error =>
    console.log('error',error);
  );
```

**现在：**

- 请求涂鸦内部服务的通用 API 已被废弃，如需调用特定的开放接口，可参考 [开放接口](#开放接口) 部分
- 但我们开放了 [request](/cn/miniapp/develop/ray/api/network/request/request) API，能够支持调用第三方服务接口

#### 事件方法

##### deviceDataChange

**之前：**

```js
const handleDeviceDataChange = (data) => {
  // 设备状态变更通知，payload 为更新的 DP 状态
  if (data.type === 'dpData') {
    console.log('dpData event', data.payload);
  }
  // 设备信息变更通知，payload 为 devInfo
  if (data.type === 'devInfo') {
    console.log('devInfo event', data.payload);
  }
  // deviceOnline 设备是否在线通知，payload 为 boolean
  if (data.type === 'deviceOnline') {
    console.log('deviceOnline event', data.payload);
  }
};

TYSdk.event.on('deviceDataChange', handleDeviceDataChange);
TYSdk.event.off('deviceDataChange', handleDeviceDataChange);
```

**现在：**

- 设备状态变更通知：即 data.type === 'dpData'，参考下述 API
  - [onDpDataChange](/cn/miniapp/develop/ray/api/device-control/dp/onDpDataChange#ondpdatachange)
  - [offDpDataChange](/cn/miniapp/develop/ray/api/device-control/dp/offDpDataChange)
- 设备信息变更通知：即 data.type === 'devInfo'，参考下述 API
  - [onDeviceInfoUpdated](/cn/miniapp/develop/ray/api/device-info/info/onDeviceInfoUpdated)
  - [offDeviceInfoUpdated](/cn/miniapp/develop/ray/api/device-info/info/offDeviceInfoUpdated)
- 设备是否在线通知：即 data.type === 'deviceOnline'，参考下述 API
  - [onDeviceOnlineStatusUpdate](/cn/miniapp/develop/ray/api/device-info/info/onDeviceOnlineStatusUpdate)
  - [offDeviceOnlineStatusUpdate](/cn/miniapp/develop/ray/api/device-info/info/offDeviceOnlineStatusUpdate)

##### networkStateChange

**之前：**

```js
TYSdk.event.on('networkStateChange', yourHandler);
TYSdk.event.off('networkStateChange', yourHandler);
```

**现在：**

- [getNetworkType](/cn/miniapp/develop/ray/api/device/network/getNetworkType)
- [onNetworkStatusChange](/cn/miniapp/develop/ray/api/device/network/onNetworkStatusChange#onnetworkstatuschange)
- [offNetworkStatusChange](/cn/miniapp/develop/ray/api/device/network/offNetworkStatusChange)

##### linkageTimeUpdate

**之前：**

```js
TYSdk.event.on('linkageTimeUpdate', yourHandler);
TYSdk.event.off('linkageTimeUpdate', yourHandler);
```

**现在：**

- [onTimerUpdate](/cn/miniapp/develop/ray/api/timer/base/onTimerUpdate)
- [offTimerUpdate](/cn/miniapp/develop/ray/api/timer/base/offTimerUpdate)

##### deviceLocalStateChange

**之前：**

```js
TYSdk.event.on('deviceLocalStateChange', yourHandler);
TYSdk.event.off('deviceLocalStateChange', yourHandler);
```

**现在：**

- [onDeviceOnlineStatusUpdate](/cn/miniapp/develop/ray/api/device-info/info/onDeviceOnlineStatusUpdate)
- [offDeviceOnlineStatusUpdate](/cn/miniapp/develop/ray/api/device-info/info/offDeviceOnlineStatusUpdate)

##### bluetoothChange

**之前：**

```js
TYSdk.event.on('bluetoothChange', yourHandler);
TYSdk.event.off('bluetoothChange', yourHandler);
```

**现在：**

- [onBluetoothAdapterStateChange](/cn/miniapp/develop/ray/api/device/bluetooth/onBluetoothAdapterStateChange#onbluetoothadapterstatechange)
- [offBluetoothAdapterStateChange](/cn/miniapp/develop/ray/api/device/bluetooth/offBluetoothAdapterStateChange)

##### NAVIGATOR_ON_WILL_FOCUS / NAVIGATOR_ON_DID_FOCUS

**之前：**

```js
TYSdk.event.on('NAVIGATOR_ON_WILL_FOCUS', yourHandler);
TYSdk.event.off('NAVIGATOR_ON_WILL_FOCUS', yourHandler);
```

**现在：**

详见 [usePageEvent](/cn/miniapp/develop/ray/framework/api#usepageevent) 中的 `onShow` 和 `onLoad` 事件。

#### 获取设备信息

**之前：**

```js
console.log('TYSdk.devInfo: ', TYSdk.devInfo);
```

**现在：**

面板小程序相比 RN 面板预留了设备多控的能力，比如我们可以在小程序中监听多个设备的状态或控制多个设备，因此设备信息的获取方式会有所区别，不再支持直接从常量里获取。

方式一：通过 getDeviceInfo 获取，详见 [getDeviceInfo](/cn/miniapp/develop/ray/api/device-info/info/getDeviceInfo#getdeviceinfo)

```ts
import { device } from '@ray-js/ray';
const { getDeviceInfo } = device;

getDeviceInfo({
  deviceId: 'vdevxxxxx',
})
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

方式二：通过 SDM 的 Hooks，详见 [useDevice](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useDevice)

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useDevice } from '@ray-js/panel-sdk';
 
export default function Home() {
  const devInfo = useDevice(device => device.devInfo);
  return (
    <View style={{ flex: 1 }}>
      <View>devInfo: {devInfo}</View>
    </View>
  );
}
```
### 工具类

#### 适配类工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { convertX } = Utils.RatioUtils;

// 某组件设计稿上宽13
width = convertX(13); // 最后该组件在当前设备的宽度
```

**现在：**

```css
.content {
  width: 26rpx;
}
```

由于小程序天然支持 CSS 环境，可通过 rpx 单位进行适配，无需再使用 `convertX` 进行转换，详见 [TYSS 语法参考-rpx 单位](/cn/miniapp/develop/miniapp/framework/tyss#rpx-%E5%8D%95%E4%BD%8D)

#### 颜色转换工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { hsvToRgb } = Utils.ColorUtils;

hsvToRgb( h, s, v ); 
// Example:
hsvToRgb(0, 1, 1);
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { hsv2rgb } = utils;
 
hsv2rgb(h, s, v);
// Example:
hsv2rgb(0, 100, 100);
```

详见 [工具方法-颜色](/cn/miniapp/solution-panel/ability/common/utils/color)

#### 温度工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { f2c } = Utils.TemperatureUtils;

f2c(fah);
// Example:
f2c(100);
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { f2c } = utils;
 
f2c(fah);
// Example:
f2c(100);
```

详见 [工具方法-温度](/cn/miniapp/solution-panel/ability/common/utils/temperature)

#### JSON 解析工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { parseJSON } = Utils.JsonUtils;

parseJSON(str);
//Example：
parseJSON("{a:1, b:2}");  
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { parseJSON } = utils;
 
parseJSON(str);
//Example：
parseJSON('{a:1, b:2}');
```

详见 [工具方法-JSON](/cn/miniapp/solution-panel/ability/common/utils/json)

#### 核心工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { toFixed } = Utils.CoreUtils;

toFixed(str, num);
// Example:
toFixed("111", 5); 
toFixed("3456111", 5);
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { toFixed } = utils;
 
toFixed(str, num);
// Example:
toFixed('111', 5);
toFixed('3456111', 5);
```

详见 [工具方法-通用](/cn/miniapp/solution-panel/ability/common/utils/core)

#### 字符串工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { hexStringToNumber } = Utils.StringUtils;

hexStringToNumber(bits);
// Example:
hexStringToNumber("AD03");
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { hexStringToNumber } = utils;
 
hexStringToNumber(bits);
// Example:
hexStringToNumber("AD03");
```

详见 [工具方法-字符串](/cn/miniapp/solution-panel/ability/common/utils/string)

#### 时间工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { parseSecond } = Utils.TimeUtils;

parseSecond(second, num);
// Example
parseSecond(111); 
parseSecond(3333333);
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { parseSecond } = utils;
 
parseSecond(second, num);
// Example
parseSecond(111);
parseSecond(3333333);
```

详见 [工具方法-时间](/cn/miniapp/solution-panel/ability/common/utils/time)

#### 数值工具

**之前：**

```js
import { Utils } from "tuya-panel-kit";
const { toFixedString } = Utils.NumberUtils;

toFixedString(value, length);
// Example:
toFixedString(111, 5); 
toFixedString(3456111, 5);
```

**现在：**

```js
import { utils } from '@ray-js/panel-sdk';
const { toFixedString } = utils;
 
toFixedString(value, length);
// Example:
toFixedString(111, 5);
toFixedString(3456111, 5);
```

详见 [工具方法-数值](/cn/miniapp/solution-panel/ability/common/utils/number)
### 开放接口

#### 场景【废弃】

该开放接口已不再建议使用，如有实际业务需求，可通过 [社区论坛](https://www.tuyaos.com/viewforum.php?f=10) 与我们联系寻求帮助与支持

#### 云端定时

普通定时可通过以下 API 替换实现：

- [addTimer](/cn/miniapp/develop/ray/api/timer/base/addTimer)
- [updateTimer](/cn/miniapp/develop/ray/api/timer/base/updateTimer)
- [removeTimer](/cn/miniapp/develop/ray/api/timer/base/removeTimer)
- [syncTimerTask](/cn/miniapp/develop/ray/api/timer/base/syncTimerTask)
- [updateTimerStatus](/cn/miniapp/develop/ray/api/timer/base/updateTimerStatus)

天文定时可通过以下 API 替换实现：

- [addAstronomical](/cn/miniapp/develop/ray/api/timer/astronomical/addAstronomical)
- [getAstronomicalList](/cn/miniapp/develop/ray/api/timer/astronomical/getAstronomicalList)
- [removeAstronomical](/cn/miniapp/develop/ray/api/timer/astronomical/removeAstronomical)
- [updateAstronomical](/cn/miniapp/develop/ray/api/timer/astronomical/updateAstronomical)
- [updateAstronomicalStatus](/cn/miniapp/develop/ray/api/timer/astronomical/updateAstronomicalStatus)

#### 设备相关

可参考以下 API 替换实现：

- [getDpsInfos](/cn/miniapp/develop/ray/api/device-control/dp/getDpsInfos#getdpsinfos)
- [updateDpName](/cn/miniapp/develop/ray/api/device-control/dp/updateDpName#updatedpname)
- [getGroupDpsInfos](/cn/miniapp/develop/ray/api/group/common/info/getGroupDpsInfos)
- [updateGroupDpName](/cn/miniapp/develop/ray/api/group/common/control/updateGroupDpName)
- [getWeatherQuality](/cn/miniapp/develop/ray/api/device-info/weather/getWeatherQuality#getweatherquality)
- [saveCustomizePosition](/cn/miniapp/develop/ray/api/device-info/position/saveCustomizePosition#savecustomizeposition)
- [getCustomizePosition](/cn/miniapp/develop/ray/api/device-info/position/getCustomizePosition#getcustomizeposition)

#### 数据统计

- 统计计量相关能力，可参考 [计量](/cn/miniapp/develop/ray/api/meature) 相关接口实现
- 设备日志相关能力，可参考 [设备日志](/cn/miniapp/develop/ray/api/logs) 相关接口实现

#### 告警

可参考以下 API 替换实现：

- [getDevAlarmList](/cn/miniapp/develop/ray/api/device-info/alarm/getDevAlarmList)
- [setAlarmSwitch](/cn/miniapp/develop/ray/api/device-info/alarm/setAlarmSwitch)

#### 联动相关

可参考以下 API 替换实现：

- [getLinkageDeviceList](/cn/miniapp/develop/ray/api/scenes/query/getLinkageDeviceList#getlinkagedevicelist)
- [getSceneList](/cn/miniapp/develop/ray/api/scenes/query/getSceneList)
- [getBindRuleList](/cn/miniapp/develop/ray/api/scenes/query/getBindRuleList)
- [bindRule](/cn/miniapp/develop/ray/api/scenes/rule/bindRule#bindrule)
- [removeRule](/cn/miniapp/develop/ray/api/scenes/rule/removeRule)
- [triggerRule](/cn/miniapp/develop/ray/api/scenes/rule/triggerRule)
- [enableRule](/cn/miniapp/develop/ray/api/scenes/rule/enableRule)
- [disableRule](/cn/miniapp/develop/ray/api/scenes/rule/disableRule)

#### 网关相关接口

暂无计划开放相关接口，如有实际业务需求，可通过 [社区论坛](https://www.tuyaos.com/viewforum.php?f=10) 与我们联系寻求帮助与支持。
### 协议类工具

可参考 [功能点解析集](/cn/miniapp/solution-panel/ability/common/protocol) 进行替换实现
