# Hooks

[AI-generated summary: 本文档介绍了@ray-js/panel-sdk中的React Hooks方法集合，用于智能设备面板开发，包含配置获取、设备协议处理、屏幕控制和导航栏管理等功能。覆盖内容：usePanelConfig、useProtocolRun、useScreenAlwaysOn、useTopBarTitle、useIsSigmeshGatewayConnected、Config对象、Protocol协议类型、DeviceInfo缓存、NavigationBarTitle、IoTPublicConfig]

Hooks 指的是一系列可能在您开发控制设备面板业务的时候需要用到的 React Hooks 方法集合，我们在 @ray-js/panel-sdk 中做了一层包装，帮助您更方便的开发智能产品。

## 如何使用

```shell
$ yarn add @ray-js/panel-sdk

# or

$ npm install @ray-js/panel-sdk
```

then

```javascript
import {
  usePanelConfig,
  useScreenAlwaysOn,
  useTopBarTitle,
  useIsSigmeshGatewayConnected,
  useProtocolRun,
} from '@ray-js/panel-sdk';
```

### usePanelConfig

> [VERSION] @ray-js/panel-sdk >= 1.12.0

#### 描述

获取面板小程序运行时对应的产品配置信息，如定时功能配置、跳转链接配置、自定义配置等等。

#### 参数

无

#### 返回值

类型: `Config`

Config 对象，包含 iot（IoT 公版配置）、fun（功能配置）、bic（云定时/跳转链接）、themeInfo（主题 CSS 变量）和 initialized（是否加载完毕）

###### Config

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `initialized` | `boolean` | 是 | 是否初始化完毕 |
| `iot` | `IoTPublicConfig` | 是 | IoT 的产品配置信息，仅公版面板支持 |
| `fun` | `FunConfig` | 是 | IoT 的功能配置信息 |
| `bic` | `CloudConfig` | 是 | IoT 平台配置的云定时和跳转链接 |
| `themeInfo` | `Record<string, any>` | 是 | 小程序主题配置数据 |

###### IoTPublicConfig

| 属性 | 类型 | 必填 | 默认值 | 废弃 | 描述 |
| --- | --- | --- | --- | --- | --- |
| `background` | `ThemeValue` | 否 | - | - | 背景图片配置项 |
| `cloud` | `CloudConfig` | 否 | - | 是: IoT 平台配置的云定时和跳转链接，请使用 bic 字段 |  |
| `dps` | `any` | 否 | - | - | 和设备功能点相关的配置项 |
| `fontColor` | `ThemeValue` | 否 | - | - | 字体颜色配置项 |
| `global` | `GlobalConfig` | 是 | - | - | 全局配置项 |
| `theme` | `"default" \| "light"` | 是 | - | - | 主题配置，暗色或亮色系 |
| `themeColor` | `ThemeValue` | 否 | - | - | 主题色配置项 |
| `themeImage` | `ThemeValue` | 否 | - | - | 主题图片配置项 |
| `subUiId` | `string` | 否 | - | - | 子 UI ID，只有公版面板支持 |
| `timestamp` | `number` | 否 | - | - | 界面配置最近更新时间 |
| `other` | `Record<string, any>` | 否 | - | - | 其他配置项 |

###### ThemeValue

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `rangeType` | `"blank" \| "bool" \| "enum"` | 是 | - | 主题值范围类型 |
| `type` | `string` | 是 | - | 主题值类型 |
| `value` | `__type` | 是 | - | 主题值初始化 |

###### CloudConfig

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | - | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | - | 云定时配置 |

###### GlobalConfig

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `background` | `string` | 是 | - | 背景配置 |
| `fontColor` | `string` | 是 | - | 字体颜色配置 |
| `themeColor` | `string` | 是 | - | 主题色配置 |

###### FunConfig

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `tyabirysr4` | `string` | 是 | - | 背景色，当前仅涂鸦官方小程序支持 |
| `tyabirysr4_app` | `"follow" \| "--app-B1"` | 是 | - | 背景色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w` | `string` | 是 | - | 主题色，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w_app` | `"follow" \| "--app-M1"` | 是 | - | 主题色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |

##### 引用对象

###### `interface` JumpUrlConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"jump_url"` | 是 | 跳转链接配置代码 |
| `description` | `string` | 是 | 跳转链接配置描述 |
| `name` | `string` | 是 | 跳转链接配置名称 |
| `selected` | `boolean` | 是 | 跳转链接配置是否选中 |

###### `interface` TimerConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"timer"` | 是 | 云定时配置代码 |
| `description` | `string` | 是 | 云定时配置描述 |
| `name` | `string` | 是 | 云定时配置名称 |
| `selected` | `boolean` | 是 | 云定时配置是否选中 |

#### 示例代码

##### 示例

```tsx
import { usePanelConfig } from '@ray-js/panel-sdk';

function ThemeProvider({ children }) {
  const config = usePanelConfig();

  if (!config.initialized) {
    return <Loading />;
  }

  const bgColor = config.iot?.global?.background;
  return <View style={{ backgroundColor: bgColor }}>{children}</View>;
}
```

#### 常见问题

##### Q：为什么在 App 根组件下使用会出现异常崩溃

A：`usePanelConfig` 内部实现依赖页面的 `ready` 事件，请勿在 App 根组件下直接使用该 hooks，此时页面还没有初次渲染完毕。

##### Q：面板小程序运行时的产品配置来源在哪里

如下图分别为：

- 图1：定时功能配置、跳转链接配置，对应返回值中的 `panelConfig.bic`
- 图2、3：自定义云能力配置入口及配置界面，对应返回值中的 `panelConfig.fun`
### useProtocolRun

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 该 Hook 会根据设备信息自动判断通信协议类型（Zigbee、SIG Mesh、Wi-Fi 等），并执行对应的回调。
> 设备信息会被缓存，首次获取后不再重复请求。

#### 描述

根据设备通信协议类型执行对应的回调函数

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `props` | `Props` | 是 | 配置对象，包含 devId 及各协议类型的回调函数 |
| `deps` | `any` | 否 | 可选的依赖项，变化时会重新生成执行函数 |

###### Props

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `devId` | `string` | 是 | - | 设备 ID |
| `zigbee` | `() => void` | 否 | - | Zigbee 设备时执行的回调 |
| `sigMesh` | `() => void` | 否 | - | SIG Mesh 设备时执行的回调 |
| `sigMeshGateway` | `() => void` | 否 | - | SIG Mesh 设备通过网关连接时执行的回调 |
| `wifi` | `() => void` | 否 | - | Wi-Fi 设备时执行的回调 |
| `ble` | `() => void` | 否 | - | 蓝牙设备时执行的回调 |
| `group` | `() => void` | 否 | - | 群组设备时执行的回调 |
| `default` | `() => void` | 否 | - | 未匹配到任何协议类型时执行的兜底回调 |
| `deps` | `any` | 否 | - | 可选的依赖项，变化时会重新生成执行函数 |

#### 返回值

无

#### 示例代码

##### 示例

```tsx
import { useProtocolRun } from '@ray-js/panel-sdk';

function ProtocolHandler() {
  const run = useProtocolRun({
    devId: 'device123',
    wifi: () => console.log('Wi-Fi 设备'),
    zigbee: () => console.log('Zigbee 设备'),
    sigMesh: () => console.log('SIG Mesh 设备'),
    default: () => console.log('其他协议'),
  });

  useEffect(() => {
    run();
  }, [run]);
}
```
### useScreenAlwaysOn

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 该 Hook 在组件挂载时设置屏幕常亮，卸载时取消常亮。
> 依赖 @ray-js/ray 的 setKeepScreenOn API，若运行环境不支持该 API 会输出警告。

#### 描述

在组件挂载期间保持设备屏幕常亮，卸载后自动恢复

#### 参数

无

#### 返回值

无

#### 示例代码

##### 示例

```tsx
import { useScreenAlwaysOn } from '@ray-js/panel-sdk';

function VideoPlayer() {
  // 在视频播放页面保持屏幕常亮
  useScreenAlwaysOn();
  return <Video src="..." />;
}
```
### useTopBarTitle

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 该 Hook 会在 title 变化时自动更新导航栏标题。
> 底层依赖 @ray-js/ray 提供的 setNavigationBarTitle API 设置小程序导航栏标题。
> 若标题长度超过 ellipsis 指定的字符数，将自动截断并添加 ... 后缀。

#### 描述

设置小程序顶部导航栏标题，支持超长文本自动截断

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 要设置的标题文本 |
| `ellipsis` | `number` | 否 | 标题最大字符数，超出后自动添加省略号，默认为 14 |

#### 返回值

类型: `(titleRes: string) => void[]`

元组 [setTitle]，包含一个可手动设置标题的函数

#### 示例代码

##### 示例

```tsx
import { useTopBarTitle } from '@ray-js/panel-sdk';

function DevicePage() {
  // 自动设置顶部标题，超过 14 个字符会截断
  const [setTitle] = useTopBarTitle('智能灯光控制面板');

  // 也可以手动更新标题
  const handleRename = (newName: string) => setTitle(newName);
}
```
### useIsSigmeshGatewayConnected

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 该 Hook 通过查询设备在线类型来判断连接方式：当 onlineType 为 8（BLE Mesh）且设备在线时，
> 判定为蓝牙直连，返回 false；否则返回 true，表示走网关通道。
> 同时监听设备在线状态变更，状态变化时自动重新查询。

#### 描述

判断 SIG Mesh 设备是否通过网关连接（非蓝牙直连）

#### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 是 | Sigmesh 设备 ID |

#### 返回值

无

#### 示例代码

##### 示例

```tsx
import { useIsSigmeshGatewayConnected } from '@ray-js/panel-sdk';

function MeshDeviceInfo({ devId }: { devId: string }) {
  const isGatewayConnected = useIsSigmeshGatewayConnected(devId);
  return (
    <Text>
      {isGatewayConnected ? '通过网关连接' : '蓝牙直连'}
    </Text>
  );
}
```
