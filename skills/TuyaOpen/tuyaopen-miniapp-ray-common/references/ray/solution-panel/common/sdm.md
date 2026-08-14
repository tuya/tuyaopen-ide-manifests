# 智能设备模型

[AI-generated summary: 本文档介绍智能设备模型（SDM）的完整开发指南，基于OOP范式封装设备数据管理、控制和状态监听能力。覆盖内容：SmartDeviceModel，SmartGroupModel，useProps，useActions，useStructuredActions，useStructuredProps，SdmProvider，useDevice，SmartDeviceSchema，publishDps，queryDps，onDpDataChange，getDpSchema，DP功能点，多设备管理]

当前面板小程序提供了大量丰富且灵活的 API，要搞清楚如何调用组合它们对于新手来说具有一定挑战性，因此我们提供了智能设备模型（SDM）。

简单来说，它是一个基于 OOP 的面板小程序开发库，通过对设备的数据管理，设备控制，状态监听的封装以及差异抹平，让您在面板开发的过程中能减少过多细节的关注，使用一套标准的开发范式进行高效开发。

## 如何使用

1. 在 [Tuya MiniApp IDE](/cn/miniapp/devtools/tools) （如果未使用过，请跳转链接查看具体用法）中创建项目，选择模板时注意选择 **SDM 通用模板** 。
2. 运行项目，在 `pages` 下创建新页面
3. DP 下发与上报监听获取

- 获取最新的 DP 值（DP 值没有配置 [protocols](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/dpkit)） => `const power = useProps((props) => props.power);`
- 获取最新的 DP 值（DP 值有配置 [protocols](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/dpkit)）=> `const power = useProps((props) => props.power);`
- 修改 DP 值（DP 值没有配置 [protocols](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/dpkit)） => `const actions = useActions();`
- 修改 DP 值（DP 值有配置 [protocols](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/dpkit)） => `const actions = useStructuredActions();`

```shell
$ yarn add @ray-js/panel-sdk

# or

$ npm install @ray-js/panel-sdk
```

> Ray / React 项目

## 使用

### 创建 SDM

<Alert type="info">
  以下目录包含了本章节所需要涉及到的所有文件，也可以直接基于 [public-sdm](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate) 示例项目进行开发
</Alert>

<Tree.DirectoryTree
  multiple
  defaultExpandAll
  treeData={[

      title: 'src',
      key: '0-0',
      children: [

          title: 'devices',
          key: '0-0-0',
          isLeaf: false,
          children: [
            { title: 'index.ts', key: '0-0-0-1', isLeaf: true },
            { title: 'schema.ts', key: '0-0-0-2', isLeaf: true },
          ],
        },

          title: 'pages',
          key: '0-0-1',
          isLeaf: false,
          children: [

              title: 'home',
              key: '0-0-1-1',
              isLeaf: false,
              children: [{ title: 'index.tsx', key: '0-0-1-1-1', isLeaf: true }],
            },
          ],
        },
        { title: 'app.tsx', key: '0-0-2', isLeaf: true },
      ],
    },

      title: 'typings',
      key: '0-1',
      children: [{ title: 'sdm.d.ts', key: '0-1-0', isLeaf: true }],
    },
  ]}
/>

#### 生成智能设备模型

该示例文件位于 devices/index.ts，用于生成智能设备模型以供后续业务项目中使用

```typescript
import { SmartDeviceModel, SmartGroupModel, SmartDeviceSchema } from '@ray-js/panel-sdk';
import { getLaunchOptionsSync } from '@ray-js/ray';

// SmartDeviceSchema 定义来自于 typings/sdm.d.ts，非 TypeScript 开发者可忽略
export const devices = {
  /**
   * 此处建议以智能设备的名称作为键名赋值，
   * 如果想要默认支持基础群组功能，则可以判断当前是否为群组环境来选择使用的智能模型以默认适配
   */
  robot: isGroupDevice
    ? new SmartGroupModel<SmartDeviceSchema>(options)
    : new SmartDeviceModel<SmartDeviceSchema>(options),
};

/**
 * 注意，如果使用了 SdmProvider 则无需手动调用 init 方法，SdmProvider 会自动调用并在设备初始化完毕后再渲染子组件
 */
Object.keys(devices).forEach((k: keyof typeof devices) => {
  devices[k].init();
});
```

#### 定义智能设备描述文件

该示例文件位于 src/devices/schema.ts，用于定义智能设备的 DP 功能点描述，以便后续业务中可以根据 TS 的类型约束，围绕当前智能设备的功能定义进行开发

```typescript
/**
 * 智能设备模型的 DP 功能点描述
 */
export const defaultSchema = [
  {
    attr: 0,
    canTrigger: true,
    code: 'power',
    defaultRecommend: false,
    editPermission: false,
    executable: true,
    extContent: '',
    iconname: 'icon-dp_power2',
    id: 1,
    mode: 'rw',
    name: '开关',
    property: {
      type: 'bool',
    },
    type: 'obj',
  },
  {
    attr: 0,
    canTrigger: true,
    code: 'mode',
    defaultRecommend: false,
    editPermission: false,
    executable: true,
    extContent: '',
    iconname: 'icon-dp_mode',
    id: 3,
    mode: 'rw',
    name: '清扫模式',
    property: {
      range: [
        'standby',
        'random',
        'smart',
        'wall_follow',
        'mop',
        'spiral',
        'left_spiral',
        'right_spiral',
        'right_bow',
        'left_bow',
        'partial_bow',
        'chargego',
      ],
      type: 'enum',
    },
    type: 'obj',
  },
] as const;
```

可通过 Tuya MiniApp IDE 中设备工具里的智能设备模型 Tab 来注入到项目中，详见下图

请注意给 schema 加上 as const 断言以便能够正常进行类型推导

#### 全局声明智能设备类型

该示例文件位于 typings/sdm.d.ts，用于全局声明 SDM 相关的类型定义，方便开发者在项目中能一键获得智能设备相关配套 Hooks 的 TS 类型提示，非 TypeScript 开发者可忽略该类型定义文件

请注意该步骤必须在上一步智能设备描述文件定义完成后进行，否则会导致 TS 类型推导失败

```typescript
import '@ray-js/panel-sdk';
import { GetStructuredDpState, GetStructuredActions } from '@ray-js/panel-sdk';

type SmartDeviceSchema = typeof import('@/devices/schema').defaultSchema; // 注意变量名
type SmartDeviceProtocols = typeof import('@/devices/protocols').protocols;
type SmartDevices = import('@ray-js/panel-sdk').SmartDeviceModel<SmartDeviceSchema>;

declare module '@ray-js/panel-sdk' {
  export const SdmProvider: React.FC<{
    value: SmartDeviceModel<SmartDeviceSchema>;
    children: React.ReactNode;
  }>;
  export type SmartDeviceInstanceData = {
    devInfo: ReturnType<SmartDevices['getDevInfo']>;
    dpSchema: ReturnType<SmartDevices['getDpSchema']>;
    network: ReturnType<SmartDevices['getNetwork']>;
    bluetooth: ReturnType<SmartDevices['getBluetooth']>;
  };
  export function useProps(): SmartDevices['model']['props'];
  export function useProps<Value extends any>(
    selector: (props?: SmartDevices['model']['props']) => Value,
    equalityFn?: (a: Value, b: Value) => boolean
  ): Value;
  export function useStructuredProps(): GetStructuredDpState<SmartDeviceProtocols>;
  export function useStructuredProps<Value extends any>(
    selector: (props?: GetStructuredDpState<SmartDeviceProtocols>) => Value,
    equalityFn?: (a: Value, b: Value) => boolean
  ): Value;
  export function useDevice(): SmartDeviceInstanceData;
  export function useDevice<Device extends any>(
    selector: (device: SmartDeviceInstanceData) => Device,
    equalityFn?: (a: Device, b: Device) => boolean
  ): Device;
  export function useActions(): SmartDevices['model']['actions'];
  export function useStructuredActions(): GetStructuredActions<SmartDeviceProtocols>;
}
```

### 使用 SDM

#### 根组件使用 SdmProvider

该示例文件位于 src/app.tsx，在根组件中使用了 SdmProvider，会等待传入的设备初始化完毕以后再进行渲染子组件，以便后续在任意页面组件中能使用 [SDM 的配套 Hooks](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useProps)

```tsx | pure
import React from 'react';
import 'ray';
import '@/i18n';
import { kit, SdmProvider } from '@ray-js/panel-sdk';
import { devices } from '@/devices';

const { initPanelEnvironment } = kit;

interface Props {
  children: React.ReactNode;
}

initPanelEnvironment({ useDefaultOffline: true });

export default class App extends React.Component<Props> {
  onLaunch() {
    console.info('=== App onLaunch');
  }

  render() {
    return (
      <SdmProvider value={devices.robot}>{this.props.children}</SdmProvider>
    );
  }
}
```

#### 通过 SDM 控制设备

该示例文件位于 src/pages/home/index.tsx，通过配套的 useActions hooks 来控制智能设备的开关并实时获取开关的值

```jsx | pure
import React from 'react';
import { Button, View } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import { devices } from '@/devices';

export default function Home() {
  const power = useProps(props => props.power);
  const actions = useActions();
  return (
    <View>
      <Button onClick={() => actions.power.toggle()}>
        点击我切换设备开关状态
      </Button>
      <Text>{`开关状态: ${power}`}</Text>
    </View>
  );
}
```

### 多设备场景

若需在同一小程序内管理多台设备，请使用 **多设备管理** 能力：通过 `SdmProvider` 的 `deviceManager` 注入 `SmartDevicesManager`，并使用多设备 Hooks（`useDevices`、`useDevicesProps`、`useDevicesActions` 等）。详见 [多设备管理 - 使用](/cn/miniapp/solution-panel/ability/common/multi-device/usage) 与 [多设备管理 - Hooks](/cn/miniapp/solution-panel/ability/common/multi-device/hooks)。

## API

#### SmartDeviceModel

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 所有 DP 相关 API 的类型均由泛型 S（ReadonlyDpSchemaList）在编译期推导，
> S 来自业务项目 devices/schema.ts 中 as const 声明的 Schema 常量。Schema property.type 与 TypeScript 类型映射：
> - bool → boolean（true/false）
> - value → number（受 property.min/max/step 运行时约束，类型仅为 number）
> - enum → props 为 string；publishDps 入参为 property.range 字面量联合（如 'white' \| 'colour'）
> - bitmap → number（位运算值，配合 actions 的 on(idx)/off(idx) 操作指定 bit 位）
> - string → string
> - raw（外层 type='raw'）→ stringSchema 必须使用 as const 断言，否则字面量类型推导退化。

##### 描述

智能设备模型，提供设备功能点状态管理、事件监听、指令下发等核心能力

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `SmartDeviceModelOptions` | 否 | 设备模型初始化配置，包含 abilities（高级能力列表）和 interceptors（事件拦截器）等选项 |

##### 返回值

类型: `SmartDeviceModel`

SmartDeviceModel 实例

###### 方法

| 方法名 | 说明 |
| --- | --- |
| `init` | 异步初始化智能设备后再返回其实例 |
| `onInitialized` | 注册智能设备模型初始化完毕事件回调 |
| `offInitialized` | 取消智能设备模型初始化完毕事件监听 |
| `getDevInfo` | 获取智能设备信息，基于 ty.device.getDeviceInfo 实现 |
| `getDpSchema` | 获取智能设备 DP Schema（功能点描述）映射表 |
| `getDpState` | 获取智能设备功能点状态 |
| `getNetwork` | 获取智能设备所处环境的网络状态 |
| `getBluetooth` | 获取智能设备所处环境的蓝牙状态 |
| `onDpDataChange` | 监听智能设备 DP 功能点变更事件 |
| `onDeviceOnlineStatusUpdate` | 监听智能设备上下线状态变更 |
| `onDeviceInfoUpdated` | 监听智能设备信息变更事件（包括设备名称、DP 名称等变更） |
| `onNetworkStatusChange` | 监听网络状态变化事件 |
| `onBluetoothAdapterStateChange` | 监听蓝牙适配器状态变化事件 |
| `offDpDataChange` | 取消监听智能设备 DP 功能点变更事件 |
| `offDeviceOnlineStatusUpdate` | 取消监听智能设备上下线状态变更 |
| `offDeviceInfoUpdated` | 取消监听智能设备信息变更事件 |
| `offNetworkStatusChange` | 取消监听网络状态变化事件 |
| `offBluetoothAdapterStateChange` | 取消监听蓝牙适配器状态变化事件 |
| `publishDps` | 批量控制智能设备 DP 功能点，基于 ty.device.publishDps 拓展实现 |
| `queryDps` | 主动查询设备功能点状态（不支持群组） |
| `destroy` | 销毁当前智能设备实例，同时销毁所有事件监听器 |

###### 引用对象

###### `type` SmartDeviceModelOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 否 | 设备 ID，选填，默认从小程序环境启动参数自动获取 |
| `abilities` | `SmartDeviceModelAbilities` | 否 | 智能设备能力列表 |
| `logConfig` | `LogConfig` | 否 | 日志配置 |
| `interceptors` | `SmartDeviceModelInterceptors` | 否 | 智能设备模型拦截器 |

###### `type` LogConfig

日志配置

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `level` | `"VERBOSE" \| "SUCCESS" \| "INFO" \| "WARN" \| "FATAL"` | 否 | 日志输出级别，默认 INFO |

###### `type` DevInfo

设备信息

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `idCodes` | `Record<string, string>` | 是 | dp id 与 dp code 的映射 |
| `codeIds` | `Record<string, string>` | 是 | dp code 与 dp id 的映射 |
| `capability` | `Capability` | 是 | 产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等  - Wi-Fi (bit 0, 十进制值: 1): wifi无线 - Cable (bit 1, 十进制值: 2): 有线 - GPRS (bit 2, 十进制值: 4): 类似2g网络 - NB-IoT (bit 3, 十进制值: 6): 物联网卡网络 - Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点 - BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh - ZigBee (bit 12, 十进制值: 4096): 2.4g频段 - Infrared (bit 13, 十进制值: 8192): 红外 - 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz - SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh - MCU (bit 16, 十进制值: 65536): mcu - SMesh (bit 17, 十进制值: 131072): 类似ZigBee - Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络 - Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon - Thread (bit 25, 十进制值: 33554432): Thread能力 |
| `devAttribute` | `DevAttribute` | 是 | 设备能力标位，由固件上报 位数含义: - 第 1 位 (bit 0): 设备是否支持免配网 - 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询 - 第 3 位 (bit 2): 设备是否具有本地联动能力 - 第 4 位 (bit 3): 设备是否支持 WIFI 扫描 - 第 5 位 (bit 4): 设备是否支持 Google Local Home - 第 6 位 (bit 5): 设备是否支持闪电配网能力 - 第 7 位 (bit 6): 设备是否支持蓝牙控制 - 第 8 位 (bit 7): 设备是否支持安防能力 - 第 9 位 (bit 8): 设备是否是共享设备 - 第 10 位 (bit 9): 设备是否支持日出日落定时 - 第 11 位 (bit 10): 设备是否支持故障替换能力 - 第 12 位 (bit 11): 设备是否支持 OTA - 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换 - 第 15 位 (bit 14): 设备支持涂鸦标准协议 - 第 16 位 (bit 15): 设备支持自定义透传 - 第 17 位 (bit 16): 设备是否支持行业能力 |
| `schema` | `DpSchema[]` | 是 | 产品信息，schema，功能定义都在里面 |
| `panelConfig` | `PanelConfig` | 是 | 面板云配置 |

###### `type` SmartDeviceModelAbility

SmartDeviceModel 的 abilities 容器类型，仅用于泛型约束与内部组合。

```typescript
export type SmartDeviceModelAbility<A extends SmartDeviceAbility = SmartDeviceAbility> = {
  [abilityName: string]: A;
};
```

###### `type` Capability

产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等

- Wi-Fi (bit 0, 十进制值: 1): wifi无线
- Cable (bit 1, 十进制值: 2): 有线
- GPRS (bit 2, 十进制值: 4): 类似2g网络
- NB-IoT (bit 3, 十进制值: 6): 物联网卡网络
- Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点
- BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh
- ZigBee (bit 12, 十进制值: 4096): 2.4g频段
- Infrared (bit 13, 十进制值: 8192): 红外
- 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz
- SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh
- MCU (bit 16, 十进制值: 65536): mcu
- SMesh (bit 17, 十进制值: 131072): 类似ZigBee
- Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络
- Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon
- Thread (bit 25, 十进制值: 33554432): Thread能力

```typescript
export type Capability = number;
```

###### `type` DevAttribute

设备能力标位，由固件上报

位数含义:
- 第 1 位 (bit 0): 设备是否支持免配网
- 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询
- 第 3 位 (bit 2): 设备是否具有本地联动能力
- 第 4 位 (bit 3): 设备是否支持 WIFI 扫描
- 第 5 位 (bit 4): 设备是否支持 Google Local Home
- 第 6 位 (bit 5): 设备是否支持闪电配网能力
- 第 7 位 (bit 6): 设备是否支持蓝牙控制
- 第 8 位 (bit 7): 设备是否支持安防能力
- 第 9 位 (bit 8): 设备是否是共享设备
- 第 10 位 (bit 9): 设备是否支持日出日落定时
- 第 11 位 (bit 10): 设备是否支持故障替换能力
- 第 12 位 (bit 11): 设备是否支持 OTA
- 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换
- 第 15 位 (bit 14): 设备支持涂鸦标准协议
- 第 16 位 (bit 15): 设备支持自定义透传
- 第 17 位 (bit 16): 设备是否支持行业能力

```typescript
export type DevAttribute = number;
```

###### `interface` PanelConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bic` | `CloudConfig[]` | 是 | 云定时和跳转链接配置 |
| `fun` | `FunConfig` | 否 | 功能配置 |

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `interface` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

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

###### `type` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| readonly string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| readonly string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

###### `type` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

###### `type` JumpUrlConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"jump_url"` | 是 | 跳转链接配置代码 |
| `description` | `string` | 是 | 跳转链接配置描述 |
| `name` | `string` | 是 | 跳转链接配置名称 |
| `selected` | `boolean` | 是 | 跳转链接配置是否选中 |

###### `type` TimerConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"timer"` | 是 | 云定时配置代码 |
| `description` | `string` | 是 | 云定时配置描述 |
| `name` | `string` | 是 | 云定时配置名称 |
| `selected` | `boolean` | 是 | 云定时配置是否选中 |

###### `type` FunConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `tyabirysr4` | `string` | 是 | 背景色，当前仅涂鸦官方小程序支持 |
| `tyabirysr4_app` | `"follow" \| "--app-B1"` | 是 | 背景色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w` | `string` | 是 | 主题色，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w_app` | `"follow" \| "--app-M1"` | 是 | 主题色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |

##### 示例代码

###### 基础初始化

```typescript
import { SmartDeviceModel } from '@ray-js/panel-sdk';
import { defaultSchema } from './devices/schema';

type Schema = typeof defaultSchema;
const device = new SmartDeviceModel<Schema>();
await device.init();

// 初始化后即可访问设备状态
const props = device.getDpState();   // { switch_led: boolean, work_mode: string, ... }
const devInfo = device.getDevInfo(); // 设备信息
```
#### SmartDeviceModel.init

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

异步初始化智能设备后再返回其实例

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `deviceId` | `string` | 否 | 设备 ID，不传则从小程序环境启动参数自动获取 |

##### 返回值

类型: `Promise<SmartDeviceModel>`

SmartDeviceModel 初始化完成的智能设备模型实例

##### 示例代码

###### 基础初始化

```typescript
import { SmartDeviceModel } from '@ray-js/panel-sdk';

const schema = [
  { code: 'switch_led', property: { type: 'bool' }, type: 'obj', mode: 'rw', id: 1, name: 'Switch' },
  { code: 'brightness', property: { type: 'value', min: 10, max: 1000, step: 1 }, type: 'obj', mode: 'rw', id: 2, name: 'Brightness' },
] as const;

type Schema = typeof schema;
const device = new SmartDeviceModel<Schema>();
await device.init();                    // 自动从小程序启动参数获取 deviceId
await device.init('your-device-id');    // 或指定 deviceId
```

###### 配置 abilities 和 dp-kit 拦截器

```typescript
import { SmartDeviceModel, SmartSupportAbility, createDpKit } from '@ray-js/panel-sdk';
import { protocols } from './devices/protocols';

const dpKit = createDpKit<Schema>({
  protocols,
  sendDpOption: { immediate: true, throttle: 300 },
});

const device = new SmartDeviceModel<Schema>({
  abilities: [new SmartSupportAbility()],
  interceptors: dpKit.interceptors,
});

await device.init();
dpKit.init(device);
```
#### SmartDeviceModel.onInitialized

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

注册智能设备模型初始化完毕事件回调

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `(instance: SmartDeviceModel) => void` | 是 | 初始化完毕后触发的回调函数，接收当前设备实例作为参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onInitialized((instance) => {
  console.log('设备初始化完成', instance.getDevInfo().name);
});
```
#### SmartDeviceModel.offInitialized

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

取消智能设备模型初始化完毕事件监听

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onInitialized 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onInitialized(() => { console.log('已初始化'); });
// 需要时取消监听
device.offInitialized(id);
```
#### SmartDeviceModel.getDevInfo

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

获取智能设备信息，基于 ty.device.getDeviceInfo 实现

##### 参数

无

##### 返回值

类型: `DevInfo`

设备信息对象，包含 devId、name、schema、dps、isOnline、codeIds（Code→ID）、idCodes（ID→Code）等，
注意与 ty.device.getDeviceInfo 返回值类型相比多了 codeIds 和 idCodes 字段，
且群组环境下返回 GroupInfo，字段结构与 DeviceInfo 有差异

**`type` DevInfo**

```typescript
export type DevInfo = Omit<
  ty.device.DeviceInfo,
  'schema' | 'panelConfig' | 'capability' | 'devAttribute'
> & {
  /**
   * dp id 与 dp code 的映射
   */
  idCodes: Record<string, string>;

  /**
   * dp code 与 dp id 的映射
   */
  codeIds: Record<string, string>;

  /**
   * 产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等
   *
   * - Wi-Fi (bit 0, 十进制值: 1): wifi无线
   * - Cable (bit 1, 十进制值: 2): 有线
   * - GPRS (bit 2, 十进制值: 4): 类似2g网络
   * - NB-IoT (bit 3, 十进制值: 6): 物联网卡网络
   * - Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点
   * - BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh
   * - ZigBee (bit 12, 十进制值: 4096): 2.4g频段
   * - Infrared (bit 13, 十进制值: 8192): 红外
   * - 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz
   * - SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh
   * - MCU (bit 16, 十进制值: 65536): mcu
   * - SMesh (bit 17, 十进制值: 131072): 类似ZigBee
   * - Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络
   * - Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon
   * - Thread (bit 25, 十进制值: 33554432): Thread能力
   */
  capability: Capability;

  /**
   * 设备能力标位，由固件上报
   * 位数含义:
   * - 第 1 位 (bit 0): 设备是否支持免配网
   * - 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询
   * - 第 3 位 (bit 2): 设备是否具有本地联动能力
   * - 第 4 位 (bit 3): 设备是否支持 WIFI 扫描
   * - 第 5 位 (bit 4): 设备是否支持 Google Local Home
   * - 第 6 位 (bit 5): 设备是否支持闪电配网能力
   * - 第 7 位 (bit 6): 设备是否支持蓝牙控制
   * - 第 8 位 (bit 7): 设备是否支持安防能力
   * - 第 9 位 (bit 8): 设备是否是共享设备
   * - 第 10 位 (bit 9): 设备是否支持日出日落定时
   * - 第 11 位 (bit 10): 设备是否支持故障替换能力
   * - 第 12 位 (bit 11): 设备是否支持 OTA
   * - 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换
   * - 第 15 位 (bit 14): 设备支持涂鸦标准协议
   * - 第 16 位 (bit 15): 设备支持自定义透传
   * - 第 17 位 (bit 16): 设备是否支持行业能力
   */
  devAttribute: DevAttribute;

  /**
   * 产品信息，schema，功能定义都在里面
   */
  schema: Array<DpSchema>;

  /**
   * 面板云配置
   */
  panelConfig: PanelConfig;
};
```

###### 引用对象

###### `type` DevInfo

设备信息

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `idCodes` | `Record<string, string>` | 是 | dp id 与 dp code 的映射 |
| `codeIds` | `Record<string, string>` | 是 | dp code 与 dp id 的映射 |
| `capability` | `Capability` | 是 | 产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等  - Wi-Fi (bit 0, 十进制值: 1): wifi无线 - Cable (bit 1, 十进制值: 2): 有线 - GPRS (bit 2, 十进制值: 4): 类似2g网络 - NB-IoT (bit 3, 十进制值: 6): 物联网卡网络 - Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点 - BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh - ZigBee (bit 12, 十进制值: 4096): 2.4g频段 - Infrared (bit 13, 十进制值: 8192): 红外 - 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz - SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh - MCU (bit 16, 十进制值: 65536): mcu - SMesh (bit 17, 十进制值: 131072): 类似ZigBee - Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络 - Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon - Thread (bit 25, 十进制值: 33554432): Thread能力 |
| `devAttribute` | `DevAttribute` | 是 | 设备能力标位，由固件上报 位数含义: - 第 1 位 (bit 0): 设备是否支持免配网 - 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询 - 第 3 位 (bit 2): 设备是否具有本地联动能力 - 第 4 位 (bit 3): 设备是否支持 WIFI 扫描 - 第 5 位 (bit 4): 设备是否支持 Google Local Home - 第 6 位 (bit 5): 设备是否支持闪电配网能力 - 第 7 位 (bit 6): 设备是否支持蓝牙控制 - 第 8 位 (bit 7): 设备是否支持安防能力 - 第 9 位 (bit 8): 设备是否是共享设备 - 第 10 位 (bit 9): 设备是否支持日出日落定时 - 第 11 位 (bit 10): 设备是否支持故障替换能力 - 第 12 位 (bit 11): 设备是否支持 OTA - 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换 - 第 15 位 (bit 14): 设备支持涂鸦标准协议 - 第 16 位 (bit 15): 设备支持自定义透传 - 第 17 位 (bit 16): 设备是否支持行业能力 |
| `schema` | `DpSchema[]` | 是 | 产品信息，schema，功能定义都在里面 |
| `panelConfig` | `PanelConfig` | 是 | 面板云配置 |

###### `type` Capability

产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等

- Wi-Fi (bit 0, 十进制值: 1): wifi无线
- Cable (bit 1, 十进制值: 2): 有线
- GPRS (bit 2, 十进制值: 4): 类似2g网络
- NB-IoT (bit 3, 十进制值: 6): 物联网卡网络
- Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点
- BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh
- ZigBee (bit 12, 十进制值: 4096): 2.4g频段
- Infrared (bit 13, 十进制值: 8192): 红外
- 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz
- SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh
- MCU (bit 16, 十进制值: 65536): mcu
- SMesh (bit 17, 十进制值: 131072): 类似ZigBee
- Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络
- Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon
- Thread (bit 25, 十进制值: 33554432): Thread能力

```typescript
export type Capability = number;
```

###### `type` DevAttribute

设备能力标位，由固件上报

位数含义:
- 第 1 位 (bit 0): 设备是否支持免配网
- 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询
- 第 3 位 (bit 2): 设备是否具有本地联动能力
- 第 4 位 (bit 3): 设备是否支持 WIFI 扫描
- 第 5 位 (bit 4): 设备是否支持 Google Local Home
- 第 6 位 (bit 5): 设备是否支持闪电配网能力
- 第 7 位 (bit 6): 设备是否支持蓝牙控制
- 第 8 位 (bit 7): 设备是否支持安防能力
- 第 9 位 (bit 8): 设备是否是共享设备
- 第 10 位 (bit 9): 设备是否支持日出日落定时
- 第 11 位 (bit 10): 设备是否支持故障替换能力
- 第 12 位 (bit 11): 设备是否支持 OTA
- 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换
- 第 15 位 (bit 14): 设备支持涂鸦标准协议
- 第 16 位 (bit 15): 设备支持自定义透传
- 第 17 位 (bit 16): 设备是否支持行业能力

```typescript
export type DevAttribute = number;
```

###### `interface` PanelConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bic` | `CloudConfig[]` | 是 | 云定时和跳转链接配置 |
| `fun` | `FunConfig` | 否 | 功能配置 |

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `interface` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

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

###### `type` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| readonly string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| readonly string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

###### `type` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

###### `type` JumpUrlConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"jump_url"` | 是 | 跳转链接配置代码 |
| `description` | `string` | 是 | 跳转链接配置描述 |
| `name` | `string` | 是 | 跳转链接配置名称 |
| `selected` | `boolean` | 是 | 跳转链接配置是否选中 |

###### `type` TimerConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"timer"` | 是 | 云定时配置代码 |
| `description` | `string` | 是 | 云定时配置描述 |
| `name` | `string` | 是 | 云定时配置名称 |
| `selected` | `boolean` | 是 | 云定时配置是否选中 |

###### `type` FunConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `tyabirysr4` | `string` | 是 | 背景色，当前仅涂鸦官方小程序支持 |
| `tyabirysr4_app` | `"follow" \| "--app-B1"` | 是 | 背景色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w` | `string` | 是 | 主题色，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w_app` | `"follow" \| "--app-M1"` | 是 | 主题色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |

##### 示例代码

###### 示例

```typescript
const devInfo = device.getDevInfo();
console.log(devInfo.name);                    // 设备名称
console.log(devInfo.isOnline);                // 在线状态
console.log(devInfo.codeIds.switch_led);      // 20（Code→ID）
console.log(devInfo.idCodes[20]);             // 'switch_led'（ID→Code）
```
#### SmartDeviceModel.getDpSchema

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

获取智能设备 DP Schema（功能点描述）映射表

##### 参数

无

##### 返回值

类型: `Record<string, DpSchema>`

功能点模型映射对象，key 为功能点 code，value 包含 attr、mode、property、type 等

###### 引用对象

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

##### 示例代码

###### 示例

```typescript
const dpSchema = device.getDpSchema();
console.log(dpSchema.switch_led.property.type); // 'bool'

// 返回值示例（key 为功能点 code）：
// {
//   power: {
//     code: 'power', id: 1, name: '开关', mode: 'rw', type: 'obj',
//     property: { type: 'bool' }
//   },
//   mode: {
//     code: 'mode', id: 3, name: '清扫模式', mode: 'rw', type: 'obj',
//     property: { type: 'enum', range: ['standby', 'random', 'smart', 'wall_follow', ...] }
//   }
// }
```
#### SmartDeviceModel.getDpState

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

获取智能设备功能点状态

##### 参数

无

##### 返回值

类型: `DpState`

全量功能点状态对象，key 为功能点 code，value 为功能点值，可能是 boolean、number、string

**`type` DpState**

```typescript
export type DpState = Record<string, DpValue>;
```

###### 引用对象

###### `type` DpState

功能点状态对象，key 为功能点 code，value 为功能点值

```typescript
export type DpState = Record<string, DpValue>;
```

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

##### 示例代码

###### 示例

```typescript
const dpState = device.getDpState();
console.log(dpState.switch_led);  // true（boolean，对应 bool 类型 DP）
console.log(dpState.brightness);  // 500（number，对应 value 类型 DP）
console.log(dpState.work_mode);   // 'white'（string，对应 enum 类型 DP）
```
#### SmartDeviceModel.getNetwork

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

获取智能设备所处环境的网络状态

##### 参数

无

##### 返回值

类型: `NetworkState`

网络状态对象，包含 isConnected、networkType、signalStrength

**`interface` NetworkState**

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isConnected` | `boolean` | 是 | 是否已连接 |
| `networkType` | `string` | 是 | 网络类型: WIFI \| 5G \| 4G \| 3G \| 2G \| GPRS \| UNKNOWN \| NONE |
| `signalStrength` | `number` | 是 | 信号强弱，单位 dbm |

###### 引用对象

###### `interface` NetworkState

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isConnected` | `boolean` | 是 | 是否已连接 |
| `networkType` | `string` | 是 | 网络类型: WIFI \| 5G \| 4G \| 3G \| 2G \| GPRS \| UNKNOWN \| NONE |
| `signalStrength` | `number` | 是 | 信号强弱，单位 dbm |

##### 示例代码

###### 示例

```typescript
const network = device.getNetwork();
console.log(network.isConnected);  // true
console.log(network.networkType);  // 'WIFI'
```
#### SmartDeviceModel.getBluetooth

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

获取智能设备所处环境的蓝牙状态

##### 参数

无

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const bluetooth = device.getBluetooth();
console.log(bluetooth.available); // true
```
#### SmartDeviceModel.publishDps

> [VERSION] @ray-js/panel-sdk >= 1.6.0

> 💡 enum 类型的合法枚举值为 property.range 的字面量联合（如 'white' \| 'colour'）。
> value 类型的合法值为 property.min/max 范围内（自动 clamp）。

##### 描述

批量控制智能设备 DP 功能点，基于 ty.device.publishDps 拓展实现

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `Record<string, DpValue>` | 是 | 要下发的功能点键值对。键为 DP Code，值类型需要根据设备的功能点 Schema 推导   bool → boolean, value → number, enum → property.range 字面量联合,   bitmap → number, string/raw → string |
| `options` | `SendDpOption` | 否 | 下发配置选项，其中 deviceId、dps 不再是必传参数，SendDpOption 类型为 dp-kit 拦截器提供的高阶配置 |

##### 返回值

类型: `Promise<boolean>`

是否下发成功

###### 引用对象

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` SendDpOption

DP 下发选项，可作为 createDpKit 的全局默认配置，也可在单次 publishDps / action 调用时覆盖。
全局 `sendDpOption` 适合声明产品级默认行为；
���次下发传入的 options 适合临时覆盖节流、防抖、协议解析或乐观更新策略。
注：依赖 dp-kit 拦截器才可使用。

| 属性 | 类型 | 必填 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- |
| `immediate` | `boolean` | 否 | - | 是否立即触发 state 更新，必须依赖 dp-kit 拦截器才可使用 |
| `ignoreDpDataResponse` | `boolean \| IgnoreDpChangeInterceptorOptions` | 否 | `1.11.0` | 是否忽略 DP 功能点上报，默认 false |
| `synchronizeDevProperty` | `boolean \| DevPropInterceptorOptions` | 否 | `1.11.0` | 是否将 dpData 和云端设备属性同步，默认 false |
| `ordered` | `boolean` | 否 | - | 多个 DP 是否按对象里的顺序下发，必须依赖 dp-kit 拦截器才可使用，默认 false |
| `checkRepeat` | `boolean` | 否 | - | 是否进行重复值判断不下发，必须依赖 dp-kit 拦截器才可使用，默认 false 与当前 `dpState` 进行比较，重复值检出不下发 |
| `delay` | `number` | 否 | - | 延迟下发，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `throttle` | `number` | 否 | - | 下发节流 (与防抖冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `debounce` | `number` | 否 | - | 下发防抖 (与节流冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `protocols` | `Record<string, CustomRawDpMap>` | 否 | - | 单次下发时临时指定的 DP 协议转换器，必须依赖 dp-kit 拦截器才可使用。 key 为 dpCode，value 为 `{ parser, formatter }` 对象： - parser(dpValue: string) => any — 将原始 DP 字符串解析为结构化对象 - formatter(parsedValue: any) => string — 将结构化对象序列化为 DP 字符串 仅影响本次调用，不覆盖 createDpKit 中的全局 protocols 配置 |

###### `type` IgnoreDpChangeInterceptorOptions

忽略 DP 数据变化拦截器的配置选项

用于配置智能设备面板中 DP 上报事件的防抖机制，避免面板操作后的
即时响应干扰用户体验或业务逻辑

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `whiteDpCodes` | `string[]` | 否 | 白名单 dp，不会忽略上报 |
| `timeout` | `number` | 否 | 防抖超时检查，毫秒，默认为 5000 - 从面板下发 dp 到收到 dp 回复之间的最大时间，超过此时间才会触发 dpDataChange。 - 用于 dp 上报事件的防抖 |
| `customRule` | `(dpState: DpState, lastSendTimestamp: number) => boolean` | 否 | 自定义忽略规则 > 优先级最高，配置了自定义规则后，whiteDpCodes 和 timeout 项将无效 |

###### `type` DevPropInterceptorOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `blackDpCodes` | `string[]` | 否 | 黑名单 dp，不会同步到云端 |
| `defaultState` | `DpState` | 否 | 首次进入时，默认的设备状态, 支持异步初始化 |
| `throttle` | `number` | 否 | 下发节流，毫秒，默认为 0 如果设置为 0，则不进行节流。 |

###### `type` DpState

功能点状态对象，key 为功能点 code，value 为功能点值

```typescript
export type DpState = Record<string, DpValue>;
```

###### `type` CustomRawDpMap

自定义 DP 协议转换器，用于将原始 DP 字符串与结构化对象互转。
适用于 raw/string 类型的复合 DP（如灯的 colour_data "00ff003e8"），
将单个字符串拆解为多个语义字段（如 { hue, saturation, value }）。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `parser` | `(dpValue: string) => any` | 否 | 将设备上报的原始 DP 字符串解析为结构化对象 |
| `formatter` | `(parsedDpValue: any) => string` | 否 | 将结构化对象序列化为下发给设备的 DP 字符串 |

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` CustomRawDpMap

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `parser` | `(dpValue: string) => any` | 否 | 将设备上报的原始 DP 字符串解析为结构化对象 |
| `formatter` | `(parsedDpValue: any) => string` | 否 | 将结构化对象序列化为下发给设备的 DP 字符串 |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

##### 示例代码

###### 基础下发

```typescript
// 基于设备功能点 Schema 定义约束入参
await device.publishDps({ switch_led: true });               // boolean
await device.publishDps({ work_mode: 'colour' });            // 'white' | 'colour'（IDE 自动提示）
await device.publishDps({ brightness: 500 });                // number（运行时 clamp 到 10~1000）
await device.publishDps({ switch_led: true, brightness: 800 }); // 支持批量下发
```

###### dp-kit 拦截器高阶配置（需配合 createDpKit 使用）

```typescript
// 立即更新本地状态（乐观更新，不等待设备上报）
await device.publishDps({ brightness: 800 }, { immediate: true });

// 节流 300ms，适用于滑动条等高频操作场景
await device.publishDps({ brightness: 800 }, { throttle: 300 });

// 防抖 500ms，用户停止操作后才下发
await device.publishDps({ brightness: 800 }, { debounce: 500 });

// 重复值不下发，避免无意义的指令
await device.publishDps({ switch_led: true }, { checkRepeat: true });

// 忽略本次下发后的设备上报（防止滑动条回弹）
await device.publishDps({ brightness: 800 }, { ignoreDpDataResponse: true });

// 组合使用
await device.publishDps(
  { brightness: 800 },
  { immediate: true, throttle: 300, ignoreDpDataResponse: true },
);
```
#### SmartDeviceModel.queryDps

> [VERSION] @ray-js/panel-sdk >= 1.14.0

> 💡 queryType 参数说明：
> - 3（默认）: App 自动适配，需要 App >= 6.9.0 且容器 >= 3.32.0
> - 0: BLE 空指令查询
> - 1: 普通查询
> 低版本自动降级：BLE 单点设备在线时使用空指令查询（0），其他设备使用普通查询（1）。
> 如业务入参指定了 queryType，则优先使用指定值。

##### 描述

主动查询设备功能点状态（不支持群组）

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `{ deviceId?: string; dpIds: number[]; queryType?: number; }` | 是 | 查询参数 |

##### 返回值

类型: `Promise<any>`

查询指令是否下发成功，不代表是否查询成功

##### 示例代码

###### 示例

```typescript
const result = await device.queryDps({ dpIds: [1, 2, 3] });
```
#### SmartDeviceModel.destroy

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 销毁后实例不可再使用，所有通过 on* 系列方法注册的监听器均被移除。

##### 描述

销毁当前智能设备实例，同时销毁所有事件监听器

##### 参数

无

##### 返回值

无

##### 示例代码

###### 示例

```typescript
device.destroy();
```
#### SmartDeviceModel.onDpDataChange

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

监听智能设备 DP 功能点变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 deviceId、dps（变更的功能点 ID→值映射）等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onDpDataChange((data) => {
  console.log('DP 变更:', data.dps);
});
// 取消监听
device.offDpDataChange(id);
```
#### SmartDeviceModel.onDeviceOnlineStatusUpdate

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

监听智能设备上下线状态变更

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 deviceId、online 等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onDeviceOnlineStatusUpdate((data) => {
  console.log(data.deviceId, data.online ? '上线' : '离线');
});
```
#### SmartDeviceModel.onDeviceInfoUpdated

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

监听智能设备信息变更事件（包括设备名称、DP 名称等变更）

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 deviceId、变更数据等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onDeviceInfoUpdated((data) => {
  console.log('设备信息变更:', data.deviceId);
});
// 取消监听
device.offDeviceInfoUpdated(id);
```
#### SmartDeviceModel.onNetworkStatusChange

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

监听网络状态变化事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 isConnected、networkType 等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onNetworkStatusChange((data) => {
  console.log('网络状态变化:', data.isConnected, data.networkType);
});
// 取消监听
device.offNetworkStatusChange(id);
```
#### SmartDeviceModel.onBluetoothAdapterStateChange

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

监听蓝牙适配器状态变化事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 available 等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = device.onBluetoothAdapterStateChange((data) => {
  console.log('蓝牙状态变化:', data.available ? '可用' : '不可用');
});
// 取消监听
device.offBluetoothAdapterStateChange(id);
```
#### SmartDeviceModel.offDpDataChange

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

取消监听智能设备 DP 功能点变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onDpDataChange 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
// 先注册监听
const id = device.onDpDataChange((data) => {
  console.log('DP 变更:', data.dps);
});
// 需要时取消
device.offDpDataChange(id);
```
#### SmartDeviceModel.offDeviceOnlineStatusUpdate

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

取消监听智能设备上下线状态变更

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onDeviceOnlineStatusUpdate 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
// 先注册监听
const id = device.onDeviceOnlineStatusUpdate((data) => {
  console.log(data.deviceId, data.online ? '上线' : '离线');
});
// 需要时取消
device.offDeviceOnlineStatusUpdate(id);
```
#### SmartDeviceModel.offDeviceInfoUpdated

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

取消监听智能设备信息变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onDeviceInfoUpdated 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
// 先注册监听
const id = device.onDeviceInfoUpdated((data) => {
  console.log('设备信息变更:', data.deviceId);
});
// 需要时取消
device.offDeviceInfoUpdated(id);
```
#### SmartDeviceModel.offNetworkStatusChange

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

取消监听网络状态变化事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onNetworkStatusChange 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
// 先注册监听
const id = device.onNetworkStatusChange((data) => {
  console.log('网络状态变化:', data.isConnected, data.networkType);
});
// 需要时取消
device.offNetworkStatusChange(id);
```
#### SmartDeviceModel.offBluetoothAdapterStateChange

> [VERSION] @ray-js/panel-sdk >= 1.0.0

##### 描述

取消监听蓝牙适配器状态变化事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onBluetoothAdapterStateChange 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
// 先注册监听
const id = device.onBluetoothAdapterStateChange((data) => {
  console.log('蓝牙状态变化:', data.available ? '可用' : '不可用');
});
// 需要时取消
device.offBluetoothAdapterStateChange(id);
```

## Hooks

#### useProps

> [VERSION] @ray-js/panel-sdk >= 1.2.0

> 💡 基于 sdm 实例实现。必须在 SdmProvider 内部使用。
> 使用前请注意检查项目是否已挂载了 SdmProvider，项目接入可参考 [智能设备模型 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/usage)，全新项目可直接基于 [public-sdm](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate) 示例项目进行开发。

##### 描述

获取智能设备功能点状态，功能点变动时驱动组件重新渲染

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `selector` | `(props: DpState) => DpValue;` | 否 | 选择器函数，入参为当前设备环境下的全量功能点状态。   具体属性由 devices/schema.ts 中的 as const Schema 定义推导，   类型映射规则：bool → boolean, value/bitmap → number, enum/string/raw → string，详见示例代码 |
| `equalityFn` | `(prevDpValue: DpValue, nextDpValue: DpValue) => boolean` | 否 | 自定义比较函数，返回 true 则不触发重渲染 |

##### 返回值

类型: `DpValue`

通过 selector 选择器选择后返回的功能点值，类型基于业务项目提供的 Schema 定义，按 property.type 自动推导值类型

**`type` DpValue**

```typescript
export type DpValue = boolean | number | string;
```

###### 引用对象

###### `type` DpState

功能点状态对象，key 为功能点 code，value 为功能点值

```typescript
export type DpState = Record<string, DpValue>;
```

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

##### 示例代码

###### 基础用法

```tsx
// 1. devices/schema.ts — as const 是类型推导的基石，基于业务项目提供的 Schema 定义，按 property.type 自动推导值类型
export const schema = [
  { code: 'switch_led', property: { type: 'bool' }, type: 'obj', mode: 'rw', id: 1, name: 'Switch' },
  { code: 'work_mode', property: { type: 'enum', range: ['white', 'colour'] }, type: 'obj', mode: 'rw', id: 2, name: 'Mode' },
  { code: 'brightness', property: { type: 'value', min: 10, max: 1000, step: 1 }, type: 'obj', mode: 'rw', id: 3, name: 'Brightness' },
  { code: 'fault', property: { type: 'bitmap', maxlen: 8 }, type: 'obj', mode: 'ro', id: 4, name: 'Fault' },
  { code: 'colour_data', property: { type: 'string', maxlen: 14 }, type: 'obj', mode: 'rw', id: 5, name: 'Colour' },
] as const;

// 2. useProps — 按 property.type 自动推导值类型
import { useProps } from '@ray-js/panel-sdk';

const power = useProps(dpState => dpState.switch_led);       // → boolean
const mode = useProps(dpState => dpState.work_mode);         // → string
const bright = useProps(dpState => dpState.brightness);      // → number
const fault = useProps(dpState => dpState.fault);            // → number
const colour = useProps(dpState => dpState.colour_data);     // → string
```

###### 自定义 rerender

```tsx
// 不传 selector 返回全量状态，则任意功能点变化都触发重渲染
const dpState = useProps(
  dpState => dpState,
  (prevDpValue, nextDpValue) => prevDpValue.switch_led === nextDpValue.switch_led, // 只会在返回 false 时 rerender
);
```

###### 获取所有功能点状态

```tsx
// 除非当前页面或组件需要监听所有功能点的变化，否则请勿使用该方式，会导致当前页面或组件出现性能问题，频繁进行无效的重复渲染。
import { useProps } from '@ray-js/panel-sdk';

const dpState1 = useProps();
const dpState2 = useProps(props => props);
```
#### useActions

> [VERSION] @ray-js/panel-sdk >= 1.2.0

> 💡 基于 sdm 实例实现。必须在 SdmProvider 内部使用。
> 使用前请注意检查项目是否已挂载了 SdmProvider，项目接入可参考 [智能设备模型 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/usage)，全新项目可直接基于 [public-sdm](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate) 示例项目进行开发。

##### 描述

获取智能设备功能点操作方法集合，根据功能点类型提供 set、toggle 等下发方法，常与 useProps 搭配使用，useProps 读取状态、useActions 下发指令。

##### 参数

无

##### 返回值

类型: `Record<DpCode, DpActions>`

功能点行为集合，key 为功能点 code，
  每个功能点根据类型提供不同操作：
  - 所有类型: set(value) 直接下发
  - bool 类型: on() / off() / toggle() 快捷切换
  - value 类型: inc(step?) / dec(step?) 增减

###### 引用对象

###### `interface` DpActions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `set` | `(value: boolean \| number \| string, options: SendDpOption) => Promise<boolean>` | 是 | 所有类型都有该方法，下发 DP 点，但需要根据功能点类型传入不同的值 |
| `on` | `1. (options: SendDpOption) => Promise<boolean><br>2. (idx: number, options: SendDpOption) => Promise<boolean>` | 否 | 只有 bool 类型和 bitmap 类型才有此方法，打开功能点或开启指定 bit 位 |
| `off` | `1. (options: SendDpOption) => Promise<boolean><br>2. (idx: number, options: SendDpOption) => Promise<boolean>` | 否 | 只有 bool 类型和 bitmap 类型才有此方法，关闭功能点或关闭指定 bit 位 |
| `toggle` | `1. (options: SendDpOption) => Promise<boolean><br>2. (idx: number, options: SendDpOption) => Promise<boolean>` | 否 | 只有 bool 类型和 bitmap 类型才有此方法，切换功能点或翻转指定 bit 位 |
| `inc` | `(step: number, options: SendDpOption) => Promise<boolean>` | 否 | 只有 value 类型才有此方法，根据当前功能点步长 step 进行递增， |
| `dec` | `(step: number, options: SendDpOption) => Promise<boolean>` | 否 | 只有 value 类型才有此方法，根据当前功能点步长 step 进行递减 |
| `prev` | `(options: SendDpOption) => Promise<boolean>` | 否 | 只有 enum 类型才有此方法，切换到前一个枚举值 |
| `next` | `(options: SendDpOption) => Promise<boolean>` | 否 | 只有 enum 类型才有此方法，切换到下一个枚举值 |
| `random` | `(options: SendDpOption) => Promise<boolean>` | 否 | 只有 enum 类型才有此方法，随机切换到一个枚举值 |

###### `type` IgnoreDpChangeInterceptorOptions

忽略 DP 数据变化拦截器的配置选项

用于配置智能设备面板中 DP 上报事件的防抖机制，避免面板操作后的
即时响应干扰用户体验或业务逻辑

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `whiteDpCodes` | `string[]` | 否 | 白名单 dp，不会忽略上报 |
| `timeout` | `number` | 否 | 防抖超时检查，毫秒，默认为 5000 - 从面板下发 dp 到收到 dp 回复之间的最大时间，超过此时间才会触发 dpDataChange。 - 用于 dp 上报事件的防抖 |
| `customRule` | `(dpState: DpState, lastSendTimestamp: number) => boolean` | 否 | 自定义忽略规则 > 优先级最高，配置了自定义规则后，whiteDpCodes 和 timeout 项将无效 |

###### `type` DevPropInterceptorOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `blackDpCodes` | `string[]` | 否 | 黑名单 dp，不会同步到云端 |
| `defaultState` | `DpState` | 否 | 首次进入时，默认的设备状态, 支持异步初始化 |
| `throttle` | `number` | 否 | 下发节流，毫秒，默认为 0 如果设置为 0，则不进行节流。 |

###### `type` CustomRawDpMap

自定义 DP 协议转换器，用于将原始 DP 字符串与结构化对象互转。
适用于 raw/string 类型的复合 DP（如灯的 colour_data "00ff003e8"），
将单个字符串拆解为多个语义字段（如 { hue, saturation, value }）。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `parser` | `(dpValue: string) => any` | 否 | 将设备上报的原始 DP 字符串解析为结构化对象 |
| `formatter` | `(parsedDpValue: any) => string` | 否 | 将结构化对象序列化为下发给设备的 DP 字符串 |

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` SendDpOption

DP 下发选项，可作为 createDpKit 的全局默认配置，也可在单次 publishDps / action 调用时覆盖。
全局 `sendDpOption` 适合声明产品级默认行为；
���次下发传入的 options 适合临时覆盖节流、防抖、协议解析或乐观更新策略。
注：依赖 dp-kit 拦截器才可使用。

| 属性 | 类型 | 必填 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- |
| `immediate` | `boolean` | 否 | - | 是否立即触发 state 更新，必须依赖 dp-kit 拦截器才可使用 |
| `ignoreDpDataResponse` | `boolean \| IgnoreDpChangeInterceptorOptions` | 否 | `1.11.0` | 是否忽略 DP 功能点上报，默认 false |
| `synchronizeDevProperty` | `boolean \| DevPropInterceptorOptions` | 否 | `1.11.0` | 是否将 dpData 和云端设备属性同步，默认 false |
| `ordered` | `boolean` | 否 | - | 多个 DP 是否按对象里的顺序下发，必须依赖 dp-kit 拦截器才可使用，默认 false |
| `checkRepeat` | `boolean` | 否 | - | 是否进行重复值判断不下发，必须依赖 dp-kit 拦截器才可使用，默认 false 与当前 `dpState` 进行比较，重复值检出不下发 |
| `delay` | `number` | 否 | - | 延迟下发，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `throttle` | `number` | 否 | - | 下发节流 (与防抖冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `debounce` | `number` | 否 | - | 下发防抖 (与节流冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `protocols` | `Record<string, CustomRawDpMap>` | 否 | - | 单次下发时临时指定的 DP 协议转换器，必须依赖 dp-kit 拦截器才可使用。 key 为 dpCode，value 为 `{ parser, formatter }` 对象： - parser(dpValue: string) => any — 将原始 DP 字符串解析为结构化对象 - formatter(parsedValue: any) => string — 将结构化对象序列化为 DP 字符串 仅影响本次调用，不覆盖 createDpKit 中的全局 protocols 配置 |

###### `type` DpState

功能点状态对象，key 为功能点 code，value 为功能点值

```typescript
export type DpState = Record<string, DpValue>;
```

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` SendDpOption

| 属性 | 类型 | 必填 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- |
| `immediate` | `boolean` | 否 | - | 是否立即触发 state 更新，必须依赖 dp-kit 拦截器才可使用 |
| `ignoreDpDataResponse` | `false \| true \| IgnoreDpChangeInterceptorOptions` | 否 | `1.11.0` | 是否忽略 DP 功能点上报，默认 false |
| `synchronizeDevProperty` | `false \| true \| DevPropInterceptorOptions` | 否 | `1.11.0` | 是否将 dpData 和云端设备属性同步，默认 false |
| `ordered` | `boolean` | 否 | - | 多个 DP 是否按对象里的顺序下发，必须依赖 dp-kit 拦截器才可使用，默认 false |
| `checkRepeat` | `boolean` | 否 | - | 是否进行重复值判断不下发，必须依赖 dp-kit 拦截器才可使用，默认 false 与当前 `dpState` 进行比较，重复值检出不下发 |
| `delay` | `number` | 否 | - | 延迟下发，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `throttle` | `number` | 否 | - | 下发节流 (与防抖冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `debounce` | `number` | 否 | - | 下发防抖 (与节流冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `protocols` | `Record<string, CustomRawDpMap>` | 否 | - | 单次下发时临时指定的 DP 协议转换器，必须依赖 dp-kit 拦截器才可使用。 key 为 dpCode，value 为 `{ parser, formatter }` 对象： - parser(dpValue: string) => any — 将原始 DP 字符串解析为结构化对象 - formatter(parsedValue: any) => string — 将结构化对象序列化为 DP 字符串 仅影响本次调用，不覆盖 createDpKit 中的全局 protocols 配置 |

###### `type` CustomRawDpMap

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `parser` | `(dpValue: string) => any` | 否 | 将设备上报的原始 DP 字符串解析为结构化对象 |
| `formatter` | `(parsedDpValue: any) => string` | 否 | 将结构化对象序列化为下发给设备的 DP 字符串 |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

##### 示例代码

###### 各 DP 类型操作方法

```tsx
// devices/schema.ts — as const 是类型推导的基石，set 为通用方法，其余为类型专属快捷方法
import { useProps, useActions } from '@ray-js/panel-sdk';

export const schema = [
  { code: 'switch_led',  property: { type: 'bool' }, type: 'obj', mode: 'rw', id: 1, name: '开关' },
  { code: 'brightness',  property: { type: 'value', min: 10, max: 1000, step: 1 }, type: 'obj', mode: 'rw', id: 2, name: '亮度' },
  { code: 'work_mode',   property: { type: 'enum', range: ['white', 'colour'] }, type: 'obj', mode: 'rw', id: 3, name: '模式' },
  { code: 'fault',       property: { type: 'bitmap', maxlen: 8 }, type: 'obj', mode: 'ro', id: 4, name: '故障' },
  { code: 'colour_data', property: { type: 'string', maxlen: 255 }, type: 'obj', mode: 'rw', id: 5, name: '颜色' },
] as const;

function Home() {
  const power = useProps(props => props.switch_led);
  const actions = useActions();

  const handleClick = () => {
    // ✅ set — 所有类型通用
    actions.switch_led.set(true);            // bool
    actions.brightness.set(500);             // value
    actions.work_mode.set('colour');         // enum（IDE 提示 'white' | 'colour'）
    actions.fault.set(3);                    // number(bitmap)
    actions.colour_data.set('000003e803e8'); // string

    // bool 专属：on / off / toggle
    actions.switch_led.toggle();
    actions.switch_led.on();
    actions.switch_led.off();

    // value 专属：inc / dec（按 step 步进，自动 clamp 到 min~max）
    actions.brightness.inc();               // +1（默认 step）
    actions.brightness.dec(100);            // -100

    // enum 专属：prev / next / random
    actions.work_mode.next();               // 切换到下一个枚举值
    actions.work_mode.prev();

    // bitmap 专属：on(idx) / off(idx) / toggle(idx)
    actions.fault.on(0);                    // 置位 bit 0
    actions.fault.off(1);                   // 清除 bit 1
    actions.fault.toggle(2);                // 翻转 bit 2
  };

  return (
    <View onClick={handleClick}>
      <Text>开关: {String(power)}</Text>
    </View>
  );
}
```
#### useDevice

> [VERSION] @ray-js/panel-sdk >= 1.2.0

> 💡 基于 sdm 实例实现。必须在 SdmProvider 内部使用。
> 使用前请注意检查项目是否已挂载了 SdmProvider，项目接入可参考 [智能设备模型 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/usage)，全新项目可直接基于 [public-sdm](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate) 示例项目进行开发。

##### 描述

获取智能设备信息、功能点模型、网络状态、蓝牙状态，数据变动时驱动组件重新渲染。 不传 selector 时返回完整 DeviceData，任何字段变化都触发重渲染，推荐始终传入 selector 仅选取所需功能点以优化渲染性能。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `selector` | `(device: DeviceData) => any;` | 否 | 选择器函数，入参为包含 devInfo、dpSchema、network、bluetooth 的设备数据对象，返回值类型由 selector 选择器决定，可能为任意值 |
| `equalityFn` | `(prevDeviceData: DeviceData, nextDeviceData: DeviceData) => boolean;` | 否 | 自定义比较函数，返回 true 则不触发重渲染 |

##### 返回值

类型: `DeviceData`

返回值类型由 selector 选择器决定，可能为任意值

**`type` DeviceData**

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devInfo` | `DevInfo` | 是 | 设备信息（含 codeIds / idCodes 进行功能点 Code ↔ ID 互查） |
| `dpSchema` | `DpSchema` | 是 | 功能点模型集合（key 为 dpCode） |
| `network` | `NetworkState` | 是 | 网络连接状态 |
| `bluetooth` | `{ available: boolean; }` | 是 | 蓝牙适配器状态 |

###### 引用对象

###### `type` DeviceData

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devInfo` | `DevInfo` | 是 | 设备信息（含 codeIds / idCodes 进行功能点 Code ↔ ID 互查） |
| `dpSchema` | `DpSchema` | 是 | 功能点模型集合（key 为 dpCode） |
| `network` | `NetworkState` | 是 | 网络连接状态 |
| `bluetooth` | `{ available: boolean; }` | 是 | 蓝牙适配器状态 |

###### `type` DevInfo

设备信息

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `idCodes` | `Record<string, string>` | 是 | dp id 与 dp code 的映射 |
| `codeIds` | `Record<string, string>` | 是 | dp code 与 dp id 的映射 |
| `capability` | `Capability` | 是 | 产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等  - Wi-Fi (bit 0, 十进制值: 1): wifi无线 - Cable (bit 1, 十进制值: 2): 有线 - GPRS (bit 2, 十进制值: 4): 类似2g网络 - NB-IoT (bit 3, 十进制值: 6): 物联网卡网络 - Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点 - BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh - ZigBee (bit 12, 十进制值: 4096): 2.4g频段 - Infrared (bit 13, 十进制值: 8192): 红外 - 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz - SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh - MCU (bit 16, 十进制值: 65536): mcu - SMesh (bit 17, 十进制值: 131072): 类似ZigBee - Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络 - Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon - Thread (bit 25, 十进制值: 33554432): Thread能力 |
| `devAttribute` | `DevAttribute` | 是 | 设备能力标位，由固件上报 位数含义: - 第 1 位 (bit 0): 设备是否支持免配网 - 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询 - 第 3 位 (bit 2): 设备是否具有本地联动能力 - 第 4 位 (bit 3): 设备是否支持 WIFI 扫描 - 第 5 位 (bit 4): 设备是否支持 Google Local Home - 第 6 位 (bit 5): 设备是否支持闪电配网能力 - 第 7 位 (bit 6): 设备是否支持蓝牙控制 - 第 8 位 (bit 7): 设备是否支持安防能力 - 第 9 位 (bit 8): 设备是否是共享设备 - 第 10 位 (bit 9): 设备是否支持日出日落定时 - 第 11 位 (bit 10): 设备是否支持故障替换能力 - 第 12 位 (bit 11): 设备是否支持 OTA - 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换 - 第 15 位 (bit 14): 设备支持涂鸦标准协议 - 第 16 位 (bit 15): 设备支持自定义透传 - 第 17 位 (bit 16): 设备是否支持行业能力 |
| `schema` | `DpSchema[]` | 是 | 产品信息，schema，功能定义都在里面 |
| `panelConfig` | `PanelConfig` | 是 | 面板云配置 |

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `interface` NetworkState

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isConnected` | `boolean` | 是 | 是否已连接 |
| `networkType` | `string` | 是 | 网络类型: WIFI \| 5G \| 4G \| 3G \| 2G \| GPRS \| UNKNOWN \| NONE |
| `signalStrength` | `number` | 是 | 信号强弱，单位 dbm |

###### `type` Capability

产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等

- Wi-Fi (bit 0, 十进制值: 1): wifi无线
- Cable (bit 1, 十进制值: 2): 有线
- GPRS (bit 2, 十进制值: 4): 类似2g网络
- NB-IoT (bit 3, 十进制值: 6): 物联网卡网络
- Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点
- BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh
- ZigBee (bit 12, 十进制值: 4096): 2.4g频段
- Infrared (bit 13, 十进制值: 8192): 红外
- 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz
- SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh
- MCU (bit 16, 十进制值: 65536): mcu
- SMesh (bit 17, 十进制值: 131072): 类似ZigBee
- Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络
- Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon
- Thread (bit 25, 十进制值: 33554432): Thread能力

```typescript
export type Capability = number;
```

###### `type` DevAttribute

设备能力标位，由固件上报

位数含义:
- 第 1 位 (bit 0): 设备是否支持免配网
- 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询
- 第 3 位 (bit 2): 设备是否具有本地联动能力
- 第 4 位 (bit 3): 设备是否支持 WIFI 扫描
- 第 5 位 (bit 4): 设备是否支持 Google Local Home
- 第 6 位 (bit 5): 设备是否支持闪电配网能力
- 第 7 位 (bit 6): 设备是否支持蓝牙控制
- 第 8 位 (bit 7): 设备是否支持安防能力
- 第 9 位 (bit 8): 设备是否是共享设备
- 第 10 位 (bit 9): 设备是否支持日出日落定时
- 第 11 位 (bit 10): 设备是否支持故障替换能力
- 第 12 位 (bit 11): 设备是否支持 OTA
- 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换
- 第 15 位 (bit 14): 设备支持涂鸦标准协议
- 第 16 位 (bit 15): 设备支持自定义透传
- 第 17 位 (bit 16): 设备是否支持行业能力

```typescript
export type DevAttribute = number;
```

###### `interface` PanelConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bic` | `CloudConfig[]` | 是 | 云定时和跳转链接配置 |
| `fun` | `FunConfig` | 否 | 功能配置 |

###### `interface` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

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

###### `type` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| readonly string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| readonly string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

###### `type` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

###### `type` JumpUrlConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"jump_url"` | 是 | 跳转链接配置代码 |
| `description` | `string` | 是 | 跳转链接配置描述 |
| `name` | `string` | 是 | 跳转链接配置名称 |
| `selected` | `boolean` | 是 | 跳转链接配置是否选中 |

###### `type` TimerConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"timer"` | 是 | 云定时配置代码 |
| `description` | `string` | 是 | 云定时配置描述 |
| `name` | `string` | 是 | 云定时配置名称 |
| `selected` | `boolean` | 是 | 云定时配置是否选中 |

###### `type` FunConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `tyabirysr4` | `string` | 是 | 背景色，当前仅涂鸦官方小程序支持 |
| `tyabirysr4_app` | `"follow" \| "--app-B1"` | 是 | 背景色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w` | `string` | 是 | 主题色，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w_app` | `"follow" \| "--app-M1"` | 是 | 主题色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |

##### 示例代码

###### 获取完整设备数据

```tsx
import { useDevice } from '@ray-js/panel-sdk';

function Home() {
  const { devInfo, network } = useDevice();
  return <Text>{devInfo.name} - 网络: {network.isConnected ? '已连接' : '断开'}</Text>;
}
```

###### 订阅网络状态

```tsx
import { useDevice } from '@ray-js/panel-sdk';

function Home() {
  const isConnected = useDevice(device => device.network.isConnected);
  return <Text>网络: {isConnected ? '已连接' : '断开'}</Text>;
}
```

###### 自定义 rerender

```tsx
// 仅网络连接变化时更新
const network = useDevice(
  device => device.network,
  (prev, next) => prev.isConnected === next.isConnected,
);
```

###### 获取功能点模型集合

```tsx
const dpSchema = useDevice(device => device.dpSchema);
// dpSchema: { switch_led: { code, property, type, mode, ... }, ... }
```

###### 通过 codeIds / idCodes 进行功能点 Code ↔ ID 互查

```tsx
const devInfo = useDevice(device => device.devInfo);
const dpId = devInfo.codeIds['switch_led'];   // code → id
const dpCode = devInfo.idCodes[1];             // id → code
```

###### 群组环境兼容

```tsx
// 群组下 devInfo 实际为 GroupInfo，部分字段需适配
import { useDevice } from '@ray-js/panel-sdk';
import { Text, getLaunchOptionsSync } from '@ray-js/ray';

function Home() {
  const isGroup = !!getLaunchOptionsSync()?.query?.groupId;
  const devInfo = useDevice(d => d.devInfo);

  const id = isGroup ? devInfo.groupId : devInfo.devId;
  const name = devInfo.name || (isGroup ? devInfo.groupName : '设备');
  const isOnline = isGroup
    ? devInfo.deviceList?.some(d => d.isOnline)
    : devInfo.isCloudOnline;

  return <Text>{name}({id}) - {isOnline ? '在线' : '离线'}</Text>;
}
```
#### useStructuredProps

> [VERSION] @ray-js/panel-sdk >= 1.10.0

> 💡 基于 sdm 实例及 dp-kit 拦截器实现。必须在 SdmProvider 内部使用。
> 使用前请注意检查项目是否已挂载了 SdmProvider，项目接入可参考 [智能设备模型 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/usage)，全新项目可直接基于 [public-sdm](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate) 示例项目进行开发。
> 使用前请注意检查是否已配置接入了 dp-kit 拦截器，项目接入可参考 [拦截器 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/usage)。
> 出于 hooks 功能单一性和稳定性考虑，useStructuredProps 只会返回配置了协议规则的功能点，不会返回基础数据类型功能点。
> 典型场景：colour_data 等复合字符串字段，dp-kit 根据 protocols 协议自动解析为
> { hue, saturation, value } 等结构化对象。

##### 描述

获取经 dp-kit 协议解析后的结构化功能点状态，状态变更时驱动组件重新渲染

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `selector` | `(structuredProps: object) => any` | 否 | 选择器函数，入参为结构化状态对象（每个 key 的值类型由 protocols 中对应 Transformer.parser() 的返回值决定），返回需要订阅的部分；不传则返回全部结构化功能点状态，注意不会返回基础数据类型功能点。 |
| `equalityFn` | `(prev: any, next: any) => boolean` | 否 | 自定义比较函数，入参为 selector 前后两次的返回值，返回 true 则不触发重渲染，默认 shallow equal |

##### 返回值

类型: `any`

selector 的返回值，其类型由 selector 决定；未传 selector 时返回完整的结构化状态对象（每个 key 的值类型 = 对应 Transformer.parser() 的返回值类型）

##### 示例代码

###### 完整接入链路（以照明 colour_data 为例）

```ts
// ---- 1. Parser：SDK 内置 ColourTransformer 源码参考 ----
// Transformer 接口：{ uuid, defaultValue, parser(dpStr) → T, formatter(data: T) → string }
// parser 的返回值类型 T 决定了 useStructuredProps 中对应 DP code 的结构化类型
// 自定义 parser 同理，实现 parser + formatter 即可
type TColorData = { hue: number; saturation: number; value: number };

class ColourTransformer implements Transformer<TColorData> {
  defaultValue = { hue: 10, saturation: 1000, value: 1000 };
  uuid = 'colour_data';

  // parser 返回 TColorData → useStructuredProps 中 props.colour_data 即为此类型
  parser(value: string): TColorData {
    if (value.length !== 12) return this.defaultValue;
    const step = generateDpStrStep(value);
    return { hue: step(4).value, saturation: step(4).value, value: step(4).value };
  }

  formatter(data: TColorData) {
    const { hue, saturation, value } = data;
    return `${decimalToHex(hue, 4)}${decimalToHex(saturation, 4)}${decimalToHex(value, 4)}`;
  }
}

// ---- 2. devices/protocols/index.ts：实例化 parser 并映射到 DP code ----
import { protocols as sdkProtocols } from '@ray-js/panel-sdk';
import { lampSchemaMap } from '../schema';

export const protocols = {
  // 实际变量名称为 colour_data，映射到 DP code
  [lampSchemaMap.colour_data.code]: new sdkProtocols.ColourTransformer(),
};

// ---- 3. devices/index.ts：创建 dpKit 并传给 sdm 实例 ----
import { SmartDeviceModel, createDpKit } from '@ray-js/panel-sdk';
import { protocols } from '@/devices/protocols';

export const dpKit = createDpKit({ protocols });
export const devices = {
  lamp: new SmartDeviceModel({ interceptors: dpKit.interceptors }),
};

// ---- 4. 页面组件：通过 useStructuredProps 消费结构化数据 ----
// props.colour_data 的类型 = ColourTransformer.parser() 的返回值 TColorData
// 即 { hue: number; saturation: number; value: number }
import { useStructuredProps } from '@ray-js/panel-sdk';
export default function Home() {
  const colour = useStructuredProps(props => props.colour_data);
  return (
    <View>
      <View>hue: {colour.hue}</View>
      <View>saturation: {colour.saturation}</View>
      <View>value: {colour.value}</View>
    </View>
  );
}
```

###### 自定义 rerender

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useStructuredProps } from '@ray-js/panel-sdk';

export default function Home() {
  const dpState = useStructuredProps(
    d => d,
    (prevDpState, nextDpState) => prevDpState.colour_data?.hue === nextDpState.colour_data?.hue, // 只会在返回 false 时 rerender
  );
  return (
    <View>
      <View>hue: {dpState.colour_data?.hue}</View>
      <View>saturation: {dpState.colour_data?.saturation}</View>
      <View>value: {dpState.colour_data?.value}</View>
    </View>
  );
}
```
#### useStructuredActions

> [VERSION] @ray-js/panel-sdk >= 1.10.0

> 💡 基于 sdm 实例及 dp-kit 拦截器实现。必须在 SdmProvider 内部使用。
> 使用前请注意检查项目是否已挂载了 SdmProvider，项目接入可参考 [智能设备模型 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/usage)，全新项目可直接基于 [public-sdm](https://github.com/Tuya-Community/tuya-ray-materials/tree/main/template/PublicSdmTemplate) 示例项目进行开发。
> 使用前请注意检查是否已配置接入了 dp-kit 拦截器，项目接入可参考 [拦截器 - 使用](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/usage)。
> 只返回配置了协议规则的功能点下发方法，不包含基础类型功能点（基础类型请用 useActions）。
> 同时支持单设备（SmartDeviceModel）和群组设备（SmartGroupModel）。与 useStructuredProps 对称使用：useStructuredProps 通过 Transformer.parser() 读取结构化数据，
> useStructuredActions 通��� Transformer.formatter() 将结构化数据转为 DP 指令下发。

##### 描述

获取经 dp-kit 协议转化后的结构化功能点下发方法集合

##### 参数

无

##### 返回值

类型: `Record<DpCode, { set: (value: object, options?: SendDpOption) => Promise<boolean> }>`

结构化功能点下发方法集合，key 为配置了 protocols 的 DP code，每个 key 提供 set(structuredValue) 方法；set 的入参类型由对应 Transformer.formatter() 的参数类型决定，内部自动调用 formatter 将结构化数据转为 DP 字符串后下发设备

###### 引用对象

###### `type` SendDpOption

DP 下发选项，可作为 createDpKit 的全局默认配置，也可在单次 publishDps / action 调用时覆盖。
全局 `sendDpOption` 适合声明产品级默认行为；
���次下发传入的 options 适合临时覆盖节流、防抖、协议解析或乐观更新策略。
注：依赖 dp-kit 拦截器才可使用。

| 属性 | 类型 | 必填 | 最低版本 | 描述 |
| --- | --- | --- | --- | --- |
| `immediate` | `boolean` | 否 | - | 是否立即触发 state 更新，必须依赖 dp-kit 拦截器才可使用 |
| `ignoreDpDataResponse` | `boolean \| IgnoreDpChangeInterceptorOptions` | 否 | `1.11.0` | 是否忽略 DP 功能点上报，默认 false |
| `synchronizeDevProperty` | `boolean \| DevPropInterceptorOptions` | 否 | `1.11.0` | 是否将 dpData 和云端设备属性同步，默认 false |
| `ordered` | `boolean` | 否 | - | 多个 DP 是否按对象里的顺序下发，必须依赖 dp-kit 拦截器才可使用，默认 false |
| `checkRepeat` | `boolean` | 否 | - | 是否进行重复值判断不下发，必须依赖 dp-kit 拦截器才可使用，默认 false 与当前 `dpState` 进行比较，重复值检出不下发 |
| `delay` | `number` | 否 | - | 延迟下发，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `throttle` | `number` | 否 | - | 下发节流 (与防抖冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `debounce` | `number` | 否 | - | 下发防抖 (与节流冲突)，必须依赖 dp-kit 拦截器才可使用，默认 0，单位 ms |
| `protocols` | `Record<string, CustomRawDpMap>` | 否 | - | 单次下发时临时指定的 DP 协议转换器，必须依赖 dp-kit 拦截器才可使用。 key 为 dpCode，value 为 `{ parser, formatter }` 对象： - parser(dpValue: string) => any — 将原始 DP 字符串解析为结构化对象 - formatter(parsedValue: any) => string — 将结构化对象序列化为 DP 字符串 仅影响本次调用，不覆盖 createDpKit 中的全局 protocols 配置 |

###### `type` IgnoreDpChangeInterceptorOptions

忽略 DP 数据变化拦截器的配置选项

用于配置智能设备面板中 DP 上报事件的防抖机制，避免面板操作后的
即时响应干扰用户体验或业务逻辑

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `whiteDpCodes` | `string[]` | 否 | 白名单 dp，不会忽略上报 |
| `timeout` | `number` | 否 | 防抖超时检查，毫秒，默认为 5000 - 从面板下发 dp 到收到 dp 回复之间的最大时间，超过此时间才会触发 dpDataChange。 - 用于 dp 上报事件的防抖 |
| `customRule` | `(dpState: DpState, lastSendTimestamp: number) => boolean` | 否 | 自定义忽略规则 > 优先级最高，配置了自定义规则后，whiteDpCodes 和 timeout 项将无效 |

###### `type` DevPropInterceptorOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `blackDpCodes` | `string[]` | 否 | 黑名单 dp，不会同步到云端 |
| `defaultState` | `DpState` | 否 | 首次进入时，默认的设备状态, 支持异步初始化 |
| `throttle` | `number` | 否 | 下发节流，毫秒，默认为 0 如果设置为 0，则不进行节流。 |

###### `type` DpState

功能点状态对象，key 为功能点 code，value 为功能点值

```typescript
export type DpState = Record<string, DpValue>;
```

###### `type` CustomRawDpMap

自定义 DP 协议转换器，用于将原始 DP 字符串与结构化对象互转。
适用于 raw/string 类型的复合 DP（如灯的 colour_data "00ff003e8"），
将单个字符串拆解为多个语义字段（如 { hue, saturation, value }）。

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `parser` | `(dpValue: string) => any` | 否 | 将设备上报的原始 DP 字符串解析为结构化对象 |
| `formatter` | `(parsedDpValue: any) => string` | 否 | 将结构化对象序列化为下发给设备的 DP 字符串 |

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` CustomRawDpMap

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `parser` | `(dpValue: string) => any` | 否 | 将设备上报的原始 DP 字符串解析为结构化对象 |
| `formatter` | `(parsedDpValue: any) => string` | 否 | 将结构化对象序列化为下发给设备的 DP 字符串 |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

##### 示例代码

###### 完整链路：读取 + 下发（以照明 colour_data 为例）

```tsx
// ---- 1. devices/protocols/index.ts：实例化 parser 并映射到 DP code ----
import { protocols as sdkProtocols } from '@ray-js/panel-sdk';
import { lampSchemaMap } from '../schema';

export const protocols = {
  [lampSchemaMap.colour_data.code]: new sdkProtocols.ColourTransformer(),
  // ColourTransformer.parser()  返回 { hue, saturation, value } → useStructuredProps 读
  // ColourTransformer.formatter() 接收 { hue, saturation, value } → useStructuredActions 写
};

// ---- 2. devices/index.ts：创建 dpKit 并传给 sdm 实例 ----
import { SmartDeviceModel, createDpKit } from '@ray-js/panel-sdk';
import { protocols } from '@/devices/protocols';

export const dpKit = createDpKit({ protocols });
export const devices = {
  lamp: new SmartDeviceModel({ interceptors: dpKit.interceptors }),
};

// ---- 3. 页面组件：通过 useStructuredActions 下发结构化数据 ----
import { View, Text } from '@ray-js/ray';
import { useStructuredProps, useStructuredActions } from '@ray-js/panel-sdk';

export default function Home() {
  // 读：parser() 返回值决定 colour 的类型 { hue, saturation, value }
  const colour = useStructuredProps(props => props.colour_data);
  // 写：set() 入参类型 = formatter() 的参数类型，同为 { hue, saturation, value }
  const actions = useStructuredActions();

  return (
    <View onClick={() => actions.colour_data.set({ hue: 120, saturation: 800, value: 900 })}>
      <Text>hue: {colour.hue}</Text>
      <Text>saturation: {colour.saturation}</Text>
      <Text>value: {colour.value}</Text>
    </View>
  );
}
```
#### useBuiltInAlarm

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 使用前需同时满足两个条件：
> 1. 项目已挂载 SdmProvider
> 2. SmartDeviceModel 初始化时已配置 SmartAlarmAbility

##### 描述

获取设备内置告警列表与开关操作，仅支持单设备，不支持群组环境。

##### 参数

无

##### 返回值

类型: `BuiltInAlarmResult`

内置告警数据、加载状态、查询和设置方法

**`type` BuiltInAlarmResult**

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `BuiltInAlarmRule[]` | 是 | 设备内置的告警列表信息 |
| `loading` | `boolean` | 是 | 设备内置的告警列表信息是否正在加载中 |
| `getBuiltInAlarmList` | `(devId: string) => Promise<BuiltInAlarmRule[]>` | 是 | 根据设备 id 查询该设备内置的告警列表信息 |
| `setBuiltInAlarmStatus` | `(options: SetBuiltInAlarmStatusParams) => Promise<[boolean, BuiltInAlarmList]>` | 是 | 设置设备内置的告警列表信息 |

###### 引用对象

###### `type` BuiltInAlarmResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `BuiltInAlarmRule[]` | 是 | 设备内置的告警列表信息 |
| `loading` | `boolean` | 是 | 设备内置的告警列表信息是否正在加载中 |
| `getBuiltInAlarmList` | `(devId: string) => Promise<BuiltInAlarmRule[]>` | 是 | 根据设备 id 查询该设备内置的告警列表信息 |
| `setBuiltInAlarmStatus` | `(options: SetBuiltInAlarmStatusParams) => Promise<[boolean, BuiltInAlarmList]>` | 是 | 设置设备内置的告警列表信息 |

###### `type` AlarmLocaleText

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `en` | `string` | 是 | 英文文案 |
| `zh` | `string` | 是 | 中文文案 |

###### `type` BuiltInAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `auditStatus` | `number` | 是 | 审核状态 |
| `boundForPanel` | `boolean` | 是 | 是否被场景面板绑定 |
| `boundForWiFiPanel` | `boolean` | 是 | 是否被 WiFi 场景面板绑定 |
| `enabled` | `boolean` | 是 | 是否启用 |
| `i18nData` | `BuiltInAlarmI18nData` | 是 | 多语言数据体 |
| `id` | `string` | 是 | 规则 ID |
| `localLinkage` | `boolean` | 是 | 是否为本地联动 |
| `name` | `string` | 是 | 规则名称 |
| `newLocalScene` | `boolean` | 是 | 是否为 App 管控本地联动 |
| `stickyOnTop` | `boolean` | 是 | 场景是否显示在首页 |

###### `type` BuiltInAlarmList

```typescript
export type BuiltInAlarmList = BuiltInAlarmRule[];
```

###### `type` BuiltInAlarmI18nData

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `name` | `AlarmLocaleText` | 是 | 名称多语言 |
| `content` | `AlarmLocaleText` | 是 | 内容多语言 |

###### `type` BuiltInAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `auditStatus` | `number` | 是 | 审核状态 |
| `boundForPanel` | `boolean` | 是 | 是否被场景面板绑定 |
| `boundForWiFiPanel` | `boolean` | 是 | 是否被 WiFi 场景面板绑定 |
| `enabled` | `boolean` | 是 | 是否启用 |
| `i18nData` | `BuiltInAlarmI18nData` | 是 | 多语言数据体 |
| `id` | `string` | 是 | 规则 ID |
| `localLinkage` | `boolean` | 是 | 是否为本地联动 |
| `name` | `string` | 是 | 规则名称 |
| `newLocalScene` | `boolean` | 是 | 是否为 App 管控本地联动 |
| `stickyOnTop` | `boolean` | 是 | 场景是否显示在首页 |

###### `type` BuiltInAlarmI18nData

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `name` | `AlarmLocaleText` | 是 | 名称多语言 |
| `content` | `AlarmLocaleText` | 是 | 内容多语言 |

###### `type` SetBuiltInAlarmStatusParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，不传则使用当前设备 |
| `disabled` | `boolean` | 是 | true 为禁用，false 为启用 |
| `ruleIds` | `string` | 是 | 要操作的告警规则 ID，多个用逗号分隔 |

##### 示例代码

###### 示例

```tsx
import { useBuiltInAlarm } from '@ray-js/panel-sdk';

function AlarmPage() {
  const { data, loading, getBuiltInAlarmList, setBuiltInAlarmStatus } = useBuiltInAlarm();

  React.useEffect(() => {
    getBuiltInAlarmList();
  }, []);

  const handleToggle = (item) => (value) => {
    setBuiltInAlarmStatus({ disabled: !value, ruleIds: item.id });
  };

  return data.map(item => (
    <Switch key={item.id} checked={item.enabled} onChange={handleToggle(item)} />
  ));
}
```
#### useCustomAlarm

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 使用前需同时满足两个条件：
> 1. 项目已挂载 SdmProvider
> 2. SmartDeviceModel 初始化时已配置 SmartAlarmAbility

##### 描述

获取设备自定义告警列表与增删改查操作，仅支持单设备，不支持群组环境。

##### 参数

无

##### 返回值

类型: `CustomAlarmResult`

自定义告警数据、加载状态及管理方法

**`type` CustomAlarmResult**

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `CustomAlarmRule[]` | 是 | 设备自定义的告警列表信息 |
| `loading` | `boolean` | 是 | 设备自定义的告警列表信息是否正在加载中 |
| `getCustomAlarmList` | `(options: GetCustomAlarmListParams) => Promise<CustomAlarmRule[]>` | 是 | 根据设备 id 查询该设备自定义的告警列表信息 |
| `addCustomAlarm` | `(options: AddCustomAlarmOptions) => Promise<[AddCustomAlarmBindResult, CustomAlarmList]>` | 是 | 新增或编辑自定义的告警规则 |
| `setCustomAlarmStatus` | `(options: SetCustomAlarmStatusParams) => Promise<[boolean, CustomAlarmList]>` | 是 | 启用或禁用自定义的告警规则 |
| `deleteCustomAlarm` | `(options: DeleteCustomAlarmParams) => Promise<[boolean, CustomAlarmList]>` | 是 | 删除自定义的告警规则 |

###### 引用对象

###### `type` CustomAlarmResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `CustomAlarmRule[]` | 是 | 设备自定义的告警列表信息 |
| `loading` | `boolean` | 是 | 设备自定义的告警列表信息是否正在加载中 |
| `getCustomAlarmList` | `(options: GetCustomAlarmListParams) => Promise<CustomAlarmRule[]>` | 是 | 根据设备 id 查询该设备自定义的告警列表信息 |
| `addCustomAlarm` | `(options: AddCustomAlarmOptions) => Promise<[AddCustomAlarmBindResult, CustomAlarmList]>` | 是 | 新增或编辑自定义的告警规则 |
| `setCustomAlarmStatus` | `(options: SetCustomAlarmStatusParams) => Promise<[boolean, CustomAlarmList]>` | 是 | 启用或禁用自定义的告警规则 |
| `deleteCustomAlarm` | `(options: DeleteCustomAlarmParams) => Promise<[boolean, CustomAlarmList]>` | 是 | 删除自定义的告警规则 |

###### `type` AlarmPreCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `expr` | `CustomAlarmPreConditionExpr` | 是 | 条件表达式 |
| `condType` | `"timeCheck"` | 是 | 条件类型，告警 SDK 固定为 timeCheck |
| `id` | `string` | 是 | 条件 ID |

###### `type` CustomAlarmCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 ID |
| `ruleId` | `string` | 是 | 规则 ID |
| `entityId` | `string` | 是 | 数据 ID |
| `entitySubIds` | `string` | 是 | 抽象子数据 ID |
| `expr` | `string` | 是 | 条件的表达式 |

###### `type` CustomAlarmSceneAction

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 id |
| `ruleId` | `string` | 是 | 场景 id |
| `actionExecutor` | `string` | 是 | 动作类型，在告警 SDK 下固定为 appPushTrigger |

###### `type` CustomAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `triggerRuleId` | `string` | 是 | 告警执行的规则 id |
| `triggerRuleVO` | `AlarmTriggerRuleVO` | 是 | 触发告警规则的详细信息，详见 AlarmTriggerRuleVO 定义 |
| `bizDomain` | `string` | 是 | 业务域标识，在告警 SDK 下固定为 miniAppPanelSDKAlarm |
| `associativeEntityValue` | `string` | 是 | 当 associativeEntityId 不足以区分情况下使用，比如使用的是同一个功能点时又要区分告警类型的情况下，可以使用 DpValue，一般情况下用不到 |
| `sourceEntityId` | `string` | 是 | 和当前告警相关联的设备 ID |
| `name` | `string` | 是 | 名称或备注 |
| `icon` | `string` | 是 | 图标 |
| `bindId` | `number` | 是 | 绑定 ID |
| `associativeEntityId` | `string` | 是 | 和当前告警相关联的功能点 DP ID |
| `enable` | `boolean` | 是 | 是否启用 |

###### `type` Operator

```typescript
type Operator = '==' | '<' | '>' | '<=' | '>=';
```

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` AddCustomAlarmBindResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `associativeEntityValue` | `string` | 是 | 关联实体值，用于区分告警类型 |
| `associativeEntityId` | `string` | 是 | 关联实体 ID，通常为功能点 ID |
| `bindId` | `number` | 是 | 绑定 ID |
| `bizDomain` | `string` | 是 | 业务域，告警固定为 miniAppPanelSDKAlarm |
| `enable` | `boolean` | 是 | 是否启用 |
| `sourceEntityId` | `string` | 是 | 设备 ID |

###### `type` CustomAlarmList

```typescript
export type CustomAlarmList = CustomAlarmRule[];
```

###### `type` CustomAlarmPreConditionExpr

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `timeZoneId` | `string` | 是 | 时区 id，如 Asia/Shanghai |
| `start` | `string` | 是 | 开始时间，格式为 HH:mm，如 00:00 |
| `timeInterval` | `string` | 是 | 时间间隔，固定为 'custom' |
| `loops` | `string` | 是 | 循环日期，'1111111' 说明为一周七天均开启，其中起始时间为周日 |
| `end` | `string` | 是 | 结束时间，格式为 HH:mm，如 23:59 |

###### `type` AlarmTriggerRuleVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 id |
| `enabled` | `boolean` | 是 | 告警规则是否启用 |
| `id` | `string` | 是 | 执行规则 id |
| `name` | `string` | 是 | 告警名称或备注 |
| `preConditions` | `AlarmPreCondition[] \| unknown[]` | 是 | 执行动作的前置条件，详见 AlarmPreCondition 定义 |
| `conditions` | `CustomAlarmCondition[] \| unknown[]` | 是 | 执行动作的条件，详见 CustomAlarmCondition 定义 |
| `actions` | `CustomAlarmSceneAction[] \| unknown[]` | 是 | 执行的动作，详见 CustomAlarmSceneAction 定义 |

###### `type` CustomAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `triggerRuleId` | `string` | 是 | 告警执行的规则 id |
| `triggerRuleVO` | `AlarmTriggerRuleVO` | 是 | 触发告警规则的详细信息，详见 AlarmTriggerRuleVO 定义 |
| `bizDomain` | `string` | 是 | 业务域标识，在告警 SDK 下固定为 miniAppPanelSDKAlarm |
| `associativeEntityValue` | `string` | 是 | 当 associativeEntityId 不足以区分情况下使用，比如使用的是同一个功能点时又要区分告警类型的情况下，可以使用 DpValue，一般情况下用不到 |
| `sourceEntityId` | `string` | 是 | 和当前告警相关联的设备 ID |
| `name` | `string` | 是 | 名称或备注 |
| `icon` | `string` | 是 | 图标 |
| `bindId` | `number` | 是 | 绑定 ID |
| `associativeEntityId` | `string` | 是 | 和当前告警相关联的功能点 DP ID |
| `enable` | `boolean` | 是 | 是否启用 |

###### `type` AlarmTriggerRuleVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 id |
| `enabled` | `boolean` | 是 | 告警规则是否启用 |
| `id` | `string` | 是 | 执行规则 id |
| `name` | `string` | 是 | 告警名称或备注 |
| `preConditions` | `unknown[] \| AlarmPreCondition[]` | 是 | 执行动作的前置条件，详见 AlarmPreCondition 定义 |
| `conditions` | `unknown[] \| CustomAlarmCondition[]` | 是 | 执行动作的条件，详见 CustomAlarmCondition 定义 |
| `actions` | `unknown[] \| CustomAlarmSceneAction[]` | 是 | 执行的动作，详见 CustomAlarmSceneAction 定义 |

###### `type` GetCustomAlarmListParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `string` | 否 | 要创建告警规则的功能点 ID，不填则拉取所有 |
| `devId` | `string` | 否 | 设备 ID，不填则默认自动读取当前��境下的设备 ID |

###### `type` AddCustomAlarmOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，默认从默认设备环境中取 |
| `name` | `string` | 否 | 告警的名称或备注 |
| `preCondition` | `Object` | 否 | 告警触发的前置条件 |
| `condition` | `[number, Operator, DpValue][]` | 是 | 告警触发的功能点条件，[DpId, Operator, DpValue][] |
| `duration` | `number` | 否 | 告警触发的功能点条件持续多久才会触发执行 action 动作，单位为秒 |

###### `type` AddCustomAlarmOptions.preCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `startTime` | `string` | 是 | 告警可触发的开始时间，默认全天，即 00:00 |
| `endTime` | `string` | 是 | 告警可触发的结束时间，默认全天，即 23:59 |
| `loops` | `string` | 是 | 告警可触发的日期，默认全周，即 '1111111' |

###### `type` SetCustomAlarmStatusParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bindId` | `number` | 是 | 要操作的告警规则绑定 ID |
| `enable` | `boolean` | 是 | true 为启用，false 为禁用 |

###### `type` DeleteCustomAlarmParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bindId` | `number` | 是 | 要删除的告警规则绑定 ID |

##### 示例代码

###### 示例

```tsx
import { useCustomAlarm } from '@ray-js/panel-sdk';

function AlarmPage() {
  const { data, loading, getCustomAlarmList, setCustomAlarmStatus } = useCustomAlarm();

  React.useEffect(() => {
    getCustomAlarmList();
  }, []);

  const handleToggle = (item) => (value) => {
    setCustomAlarmStatus({ bindId: item.bindId, enable: value });
  };

  return data.map(item => (
    <Switch key={item.bindId} checked={item.enable} onChange={handleToggle(item)} />
  ));
}
```
#### useSupport

> [VERSION] @ray-js/panel-sdk >= 1.10.0

> 💡 使用前需同时满足两个条件：
> 1. 项目已挂载 SdmProvider
> 2. SmartDeviceModel 初始化时已配置 SmartSupportAbility

##### 描述

获取设备能力检测实例，用于判断设备支持的功能与协议

##### 参数

无

##### 返回值

类型: `SupportAbilityMethods`

SmartSupportAbility 实例对象

**`interface` SupportAbilityMethods**

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isSupportDp` | `(dpCode: string, isForce: boolean) => boolean` | 是 | 判断设备是否支持指定功能点 |
| `isSupportBright` | `(isForce: boolean) => boolean` | 是 | 判断设备是否支持白光亮度 |
| `isSupportTemp` | `(isForce: boolean) => boolean` | 是 | 判断设备是否支持色温 |
| `isSupportColour` | `(isForce: boolean) => boolean` | 是 | 判断设备是否支持彩光 |
| `isSupportCloudTimer` | `() => boolean` | 是 | 判断设备是否支持云端定时 |
| `isSupportMatterWhite` | `(force: boolean) => boolean` | 是 | 判断是否支持 Matter 白光 |
| `isInGateway` | `() => boolean` | 是 | 判断设备是否已添加到网关下 |
| `isGroupDevice` | `() => boolean` | 是 | 判断当前是否是群组设备 |
| `hasCapability` | `(id: number) => boolean` | 是 | 判断设备是否具有指定的协议能力（入参为 DeviceCapability 枚举值） |
| `isWifiDevice` | `() => boolean` | 是 | 判断是否是 WiFi 设备 |
| `isGprsDevice` | `() => boolean` | 是 | 判断是否是 GPRS 设备 |
| `isBluetoothDevice` | `() => boolean` | 是 | 判断是否是蓝牙 Bluetooth 设备 |
| `isBleMeshDevice` | `() => boolean` | 是 | 判断是否是 BLE Mesh 设备 |
| `isZigbeeDevice` | `() => boolean` | 是 | 判断是否是 Zigbee 设备 |
| `isSigMeshDevice` | `() => boolean` | 是 | 判断是否是 SIG Mesh 设备 |
| `isBleDevice` | `() => boolean` | 是 | 判断是否是蓝牙类设备（含 Bluetooth / BLE Mesh / SIG Mesh） |
| `isCat1Device` | `() => boolean` | 是 | 判断是否是 Cat.1 设备 |
| `isBeaconDevice` | `() => boolean` | 是 | 判断是否是 Beacon 设备 |
| `isLteCat4Device` | `() => boolean` | 是 | 判断是否是 LTE Cat.4 设备 |
| `isLteCat10Device` | `() => boolean` | 是 | 判断是否是 LTE Cat.10 设备 |
| `isLteCatMDevice` | `() => boolean` | 是 | 判断是否是 LTE Cat.M 设备 |
| `isThreadDevice` | `() => boolean` | 是 | 判断是否是 Thread 设备 |
| `isMatterDevice` | `() => boolean` | 是 | 判断是否是 Matter 设备（含涂鸦 Matter 和三方 Matter） |
| `isTuyaMatterDevice` | `() => boolean` | 是 | 判断是否是涂鸦 Matter 设备（排除三方 Matter） |
| `isTripartiteMatter` | `() => boolean` | 是 | 判断是否是三方 Matter 设备 |

###### 引用对象

###### `interface` SupportAbilityMethods

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isSupportDp` | `(dpCode: string, isForce: boolean) => boolean` | 是 | 判断设备是否支持指定功能点 |
| `isSupportBright` | `(isForce: boolean) => boolean` | 是 | 判断设备是否支持白光亮度 |
| `isSupportTemp` | `(isForce: boolean) => boolean` | 是 | 判断设备是否支持色温 |
| `isSupportColour` | `(isForce: boolean) => boolean` | 是 | 判断设备是否支持彩光 |
| `isSupportCloudTimer` | `() => boolean` | 是 | 判断设备是否支持云端定时 |
| `isSupportMatterWhite` | `(force: boolean) => boolean` | 是 | 判断是否支持 Matter 白光 |
| `isInGateway` | `() => boolean` | 是 | 判断设备是否已添加到网关下 |
| `isGroupDevice` | `() => boolean` | 是 | 判断当前是否是群组设备 |
| `hasCapability` | `(id: number) => boolean` | 是 | 判断设备是否具有指定的协议能力（入参为 DeviceCapability 枚举值） |
| `isWifiDevice` | `() => boolean` | 是 | 判断是否是 WiFi 设备 |
| `isGprsDevice` | `() => boolean` | 是 | 判断是否是 GPRS 设备 |
| `isBluetoothDevice` | `() => boolean` | 是 | 判断是否是蓝牙 Bluetooth 设备 |
| `isBleMeshDevice` | `() => boolean` | 是 | 判断是否是 BLE Mesh 设备 |
| `isZigbeeDevice` | `() => boolean` | 是 | 判断是否是 Zigbee 设备 |
| `isSigMeshDevice` | `() => boolean` | 是 | 判断是否是 SIG Mesh 设备 |
| `isBleDevice` | `() => boolean` | 是 | 判断是否是蓝牙类设备（含 Bluetooth / BLE Mesh / SIG Mesh） |
| `isCat1Device` | `() => boolean` | 是 | 判断是否是 Cat.1 设备 |
| `isBeaconDevice` | `() => boolean` | 是 | 判断是否是 Beacon 设备 |
| `isLteCat4Device` | `() => boolean` | 是 | 判断是否是 LTE Cat.4 设备 |
| `isLteCat10Device` | `() => boolean` | 是 | 判断是否是 LTE Cat.10 设备 |
| `isLteCatMDevice` | `() => boolean` | 是 | 判断是否是 LTE Cat.M 设备 |
| `isThreadDevice` | `() => boolean` | 是 | 判断是否是 Thread 设备 |
| `isMatterDevice` | `() => boolean` | 是 | 判断是否是 Matter 设备（含涂鸦 Matter 和三方 Matter） |
| `isTuyaMatterDevice` | `() => boolean` | 是 | 判断是否是涂鸦 Matter 设备（排除三方 Matter） |
| `isTripartiteMatter` | `() => boolean` | 是 | 判断是否是三方 Matter 设备 |

##### 示例代码

###### 示例

```tsx
import { useSupport } from '@ray-js/panel-sdk';

function SupportPage() {
  const support = useSupport();
  return (
    <View>
      <Text>{support.isSupportCloudTimer() ? '支持云定时' : '不支持云定时'}</Text>
      <Text>{support.isSupportDp('switch_led') ? '有开关' : '无开关'}</Text>
    </View>
  );
}
```
### 拦截器

dp-kit 是一个 SDM 的拓展包，已内置支持，可以对 DP 按照协议规则进行序列化和反序列化。当设备 DP 上报时，触发 dpDataChange 事件，SDM 模型监听到该事件，并从左到右遍历调用 interceptors 拦截器，拦截器执行完成后将结果通过 context 发送到调用 useProps 的组件中。

    查看使用 SDM 拦截器和 DP 自定义协议解析教程

## 通用能力

### 使用

#### 起步

通过以下示例代码片段（以 SmartAlarmAbility 为例），您可以快速了解如何在面板应用开发中通过基础 JS 或 Ray & SDM 接入通用能力：

##### 基础用法

以下为基础 JS 的接入示例：

```ts
import { SmartAlarmAbility } from '@ray-js/panel-sdk';

// 创建一个 alarm 实例
const Alarm = new SmartAlarmAbility().init();

// 调用 AlarmModel 的功能
Alarm.getBuiltInAlarmList(params)
  .then(result => {
    // 处理返回的结果
  })
  .catch(error => {
    // 处理错误情况
  });
```

##### Ray & SDM

以下为 Ray 及 SDM 的接入示例，通过 SDM 接入，您可以更好地享受 TS 类型提示及搭配 React Hooks 带来的开发体验：

**src/devices/index.ts**

> 生成 sensor 传感器智能设备模型，并内置告警能力

```ts
import { SmartDeviceModel, SmartAlarmAbility } from '@ray-js/panel-sdk';

const options = {
  abilities: [new SmartAlarmAbility()],
};

const devices = {
  sensor: new SmartDeviceModel<SmartDeviceSchema, { alarm: SmartAlarmAbility }>(options)
};
```

**src/app.tsx**

> 通过 SdmProvider 接入 React 体系

```tsx
import React from 'react';
import 'ray';
import '@/i18n';
import { kit, SdmProvider } from '@ray-js/panel-sdk';
import { devices } from '@/devices';

const { initPanelEnvironment } = kit;

interface Props {
  children: React.ReactNode;
}

initPanelEnvironment({ useDefaultOffline: true });

export default class App extends React.Component<Props> {
  onLaunch() {
    console.info('=== App onLaunch');
  }

  render() {
    return (
      <SdmProvider value={devices.sensor}>{this.props.children}</SdmProvider>
    );
  }
}
```

**src/pages/home.tsx**

> 拉取告警列表，并通过 TyList 展示

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useBuiltInAlarm } from '@ray-js/panel-sdk';
import { AlarmList } from '@ray-js/api/lib/cloud/interface';
import TyList from '@ray-js/components-ty-cell';
import TySwitch from '@ray-js/components-ty-switch';

function PageSdmAlarm() {
  const { loading, data, getBuiltInAlarmList, setBuiltInAlarmStatus } = useBuiltInAlarm();

  React.useEffect(() => {
    getBuiltInAlarmList();
  }, []);

  const handleValueChange = React.useCallback(
    (item: AlarmList) => (value: boolean) => {
      setBuiltInAlarmStatus({ disabled: !value, ruleIds: item.id });
    },
    []
  );

  const rowKey = React.useCallback((item: AlarmList) => item.id, []);

  console.log('=== rerender builtInAlarm', data, loading);
  return (
    <View>
      <TyList<AlarmList>
        dataSource={data}
        renderItem={item => (
          <TyList.Item
            key={item.id}
            title={item.name}
            content={<TySwitch checked={item.enabled} onChange={handleValueChange(item)} />}
          />
        )}
        rowKey={rowKey}
      />
    </View>
  );
}
```

### 一键执行

##### 使用

###### 起步

`SmartTapToRunAbility` 自 `@ray-js/panel-sdk@1.11.0` 开始加入。

###### 基础用法

以下为基础 JS 的接入示例：

```ts
import { SmartTapToRunAbility } from '@ray-js/panel-sdk';

// 创建一个 TapToRun 实例
const TapToRun = new SmartTapToRunAbility().init();

// 调用 TapToRunModel 的功能
TapToRun.getTapToRunRules()
  .then(result => {
    // 处理返回的结果
  })
  .catch(error => {
    // 处理错误情况
  });
```

###### Ray & SDM

以下为 Ray 及 SDM 的接入示例：

**src/devices/index.ts**

> 生成 wireless 无线开关智能设备模型，并内置一键执行能力

```ts
import { SmartDeviceModel, SmartTapToRunAbility } from '@ray-js/panel-sdk';

const options = {
  abilities: [new SmartTapToRunAbility()],
};

const devices = {
  wireless: new SmartDeviceModel<SmartDeviceSchema, { alarm: SmartTapToRunAbility }>(options)
};
```

**src/app.tsx**

> 通过 SdmProvider 接入 React 体系

```tsx
import React from 'react';
import 'ray';
import '@/i18n';
import { kit, SdmProvider } from '@ray-js/panel-sdk';
import { devices } from '@/devices';

const { initPanelEnvironment } = kit;

interface Props {
  children: React.ReactNode;
}

initPanelEnvironment({ useDefaultOffline: true });

export default class App extends React.Component<Props> {
  onLaunch() {
    console.info('=== App onLaunch');
  }

  render() {
    return (
      <SdmProvider value={devices.sensor}>{this.props.children}</SdmProvider>
    );
  }
}
```

###### 使用场景

无线开关产品的核心功能可通过 `SmartTapToRunAbility` 能力实现，建议阅读 [无线开关一键执行模板 Codelab](https://developer.tuya.com/cn/miniapp-codelabs/codelabs/panel-wireless-tap-to-run/index.html) 以了解更多。

###### 注意事项

`SmartTapToRunAbility` 基于以下原子 API 实现，因此 `@ray-js/ray` 版本需大于 `^1.5.15`：

- [getSceneListV2](/cn/miniapp/develop/ray/api/scenes/query/getSceneListV2)
- [getBindRuleList](/cn/miniapp/develop/ray/api/scenes/query/getBindRuleList)
- [bindRule](/cn/miniapp/develop/ray/api/scenes/rule/bindRule)
- [unbindRule](/cn/miniapp/develop/ray/api/scenes/rule/unbindRule)
- [triggerRule](/cn/miniapp/develop/ray/api/scenes/rule/triggerRule)
###### SmartTapToRunAbility.getTapToRunRules

> [VERSION] @ray-js/panel-sdk >= 1.11.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

查询当前家庭下可绑定的一键执行列表，会去掉失效或自动化规则。

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `TapToRunQueryParams` | 否 | 查询参数 |

###### 返回值

类型: `Promise<TapToRunRules>`

可绑定的一键执行规则列表

###### 引用对象

###### `type` TapToRunQueryParams

一键执行查询参数

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，不传则使用当前设备 |
| `gid` | `string` | 否 | 家庭 ID，不传则使用当前 App 家庭 |
| `containStandardZigBee` | `boolean` | 否 | 是否包含标准 Zigbee 场景 |

###### `type` TapToRunRules

可绑定的一键执行规则列表

```typescript
TapToRunRule[]
```

###### `type` TapToRunRule

可绑定的一键执行规则

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `actions` | `TapToRunAction[]` | 是 | 执行动作列表 |
| `background` | `string` | 否 | 背景图地址 |
| `boundForPanel` | `boolean` | 否 | 面板绑定 |
| `boundForWiFiPanel` | `boolean` | 否 | WiFi 面板绑定 |
| `coverIcon` | `string` | 否 | 图标 |
| `displayColor` | `string` | 否 | 背景颜色 |
| `enabled` | `boolean` | 是 | 规则是否启用 |
| `id` | `string` | 是 | 执行规则 ID |
| `name` | `string` | 是 | 联动名称或备注 |

###### `type` TapToRunAction

一键执行动作项

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `actionDisplay` | `string` | 是 | 执行动作的显示名称 |
| `actionExecutor` | `string` | 是 | 执行动作的执行者 |
| `actionStrategy` | `string` | 是 | 执行动作的执行策略 |
| `entityId` | `string` | 是 | 动作所属实体 ID |
| `gmtModified` | `number` | 是 | 修改时间戳 |
| `id` | `string` | 是 | 动作唯一 ID |
| `orderNum` | `number` | 是 | 动作顺序号 |
| `ruleId` | `string` | 是 | 规则 ID |
| `status` | `boolean` | 是 | 动作状态 |

###### 示例代码

###### 示例

```typescript
const rules = await sdm.tapToRun.getTapToRunRules();
rules.forEach(rule => {
  console.log(rule.id, rule.name);
});
```
###### SmartTapToRunAbility.getBindTapToRunRules

> [VERSION] @ray-js/panel-sdk >= 1.11.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

查询已绑定一键执行的联动列表

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `TapToRunQueryParams` | 否 | 查询参数 |

###### 返回值

类型: `Promise<BindTapToRunRules>`

已绑定的一键执行规则列表

###### 引用对象

###### `type` TapToRunQueryParams

一键执行查询参数

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，不传则使用当前设备 |
| `gid` | `string` | 否 | 家庭 ID，不传则使用当前 App 家庭 |
| `containStandardZigBee` | `boolean` | 否 | 是否包含标准 Zigbee 场景 |

###### `type` BindTapToRunRules

已绑定的一键执行联动规则列表

```typescript
export type BindTapToRunRules = BindTapToRunRule[];
```

###### `type` BindTapToRunRule

已绑定的一键执行项

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `associativeEntityId` | `string` | 是 | 关联实体 ID，格式为 dpId#dpValue |
| `associativeEntityValueList` | `BindTapToRunLinkedRule[]` | 是 | 关联实体的值列表 |
| `bindId` | `number` | 是 | 绑定 ID |
| `bizDomain` | `string` | 是 | 业务域，一键执行固定为 wirelessSwitchBindScene |
| `enable` | `boolean` | 是 | 是否启用 |
| `sourceEntityId` | `string` | 是 | 源设备 ID |

###### `type` BindTapToRunLinkedRule

已绑定的一键执行目标规则

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ruleType` | `number` | 否 | 规则类型 |
| `triggerRuleEnable` | `boolean` | 否 | 规则是否启用 |
| `triggerRuleId` | `string` | 否 | 执行规则 ID，一般用来进行触发 |

###### `type` TapToRunRule

可绑定的一键执行规则

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `actions` | `TapToRunAction[]` | 是 | 执行动作列表 |
| `background` | `string` | 否 | 背景图地址 |
| `boundForPanel` | `boolean` | 否 | 面板绑定 |
| `boundForWiFiPanel` | `boolean` | 否 | WiFi 面板绑定 |
| `coverIcon` | `string` | 否 | 图标 |
| `displayColor` | `string` | 否 | 背景颜色 |
| `enabled` | `boolean` | 是 | 规则是否启用 |
| `id` | `string` | 是 | 执行规则 ID |
| `name` | `string` | 是 | 联动名称或备注 |

###### `type` TapToRunAction

一键执行动作项

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `actionDisplay` | `string` | 是 | 执行动作的显示名称 |
| `actionExecutor` | `string` | 是 | 执行动作的执行者 |
| `actionStrategy` | `string` | 是 | 执行动作的执行策略 |
| `entityId` | `string` | 是 | 动作所属实体 ID |
| `gmtModified` | `number` | 是 | 修改时间戳 |
| `id` | `string` | 是 | 动作唯一 ID |
| `orderNum` | `number` | 是 | 动作顺序号 |
| `ruleId` | `string` | 是 | 规则 ID |
| `status` | `boolean` | 是 | 动作状态 |

###### 示例代码

###### 示例

```typescript
const bindRules = await sdm.tapToRun.getBindTapToRunRules();
bindRules.forEach(item => {
  console.log('绑定 ID:', item.bindId);
  item.associativeEntityValueList.forEach(rule => {
    console.log('已绑定规则:', rule.id, rule.name);
  });
});
```
###### SmartTapToRunAbility.bind

> [VERSION] @ray-js/panel-sdk >= 1.11.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

给一键执行绑定自动化触发条件

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `BindParams` | 是 | 绑定参数 |

###### 返回值

类型: `Promise<BindTapToRunResult>`

绑定结果

###### 引用对象

###### `type` BindParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，默认从默认设备环境中取 |
| `dpId` | `string` | 是 | 功能点 ID，需搭配 dpValue 一同使用， 其含义为当设备上报后满足 dpId == dpValue 时，则会自动触发执行对应绑定的一键执行 |
| `dpValue` | `boolean \| number \| string` | 是 | 功能点值，需搭配 dpId 一同使用， 其含义为当设备上报后满足 dpId == dpValue 时，则会自动触发执行对应绑定的一键执行 |
| `ruleId` | `string` | 是 | 需要绑定的场景 id 列表，在 dpId == dpValue 时，则会触发执行当前规则 id 对应绑定的联动 |
| `name` | `string` | 否 | 名称 |
| `icon` | `string` | 否 | 图标 |
| `gid` | `string` | 否 | 家庭 id，不填默认使用当前 App 家庭 id |

###### `type` BindTapToRunResult

一键执行绑定结果

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `associativeEntityId` | `string` | 是 | 关联实体 ID，格式为 dpId#dpValue |
| `associativeEntityValue` | `string` | 是 | 关联的规则 ID |
| `bindId` | `number` | 是 | 绑定 ID，一般用来解绑 |
| `bizDomain` | `string` | 是 | 业务域，一键执行固定为 wirelessSwitchBindScene |
| `id` | `number` | 是 | 数据 ID |
| `ownerId` | `string` | 是 | 家庭 ID |
| `sourceEntityId` | `string` | 是 | 设备 ID |
| `triggerRuleId` | `string` | 是 | 触发规则 ID |

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### 示例代码

###### 示例

```typescript
const result = await sdm.tapToRun.bind({
  dpId: '1',
  dpValue: 'single_click',
  ruleId: 'scene_abc123',
});
console.log('绑定结果:', result);
```
###### SmartTapToRunAbility.unbind

> [VERSION] @ray-js/panel-sdk >= 1.11.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

解绑一键执行规则

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `UnbindTapToRunParams` | 是 | 解绑参数 |

###### 返回值

类型: `Promise<UnbindTapToRunResult>`

解绑后剩余的场景列表

###### 引用对象

###### `type` UnbindTapToRunParams

一键执行解绑参数

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bindId` | `string` | 是 | 可通过已绑定的一键执行列表中的 bindId 获取 |
| `gid` | `string` | 否 | 家庭 ID，不传则使用当前 App 家庭 |

###### `type` UnbindTapToRunResult

一键执行解绑结果

```typescript
export type UnbindTapToRunResult = boolean;
```

###### 示例代码

###### 示例

```typescript
const remaining = await sdm.tapToRun.unbind({ bindId: 'bind_001' });
console.log('解绑成功，剩余场景:', remaining);
```
###### SmartTapToRunAbility.trigger

> [VERSION] @ray-js/panel-sdk >= 1.11.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

忽略自动化条件，直接触发一键执行

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `TriggerTapToRunParams` | 是 | 触发参数，包含 ruleId |

###### 返回值

类型: `Promise<boolean>`

执行是否成功

###### 引用对象

###### `type` TriggerTapToRunParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ruleId` | `string` | 是 | 规则 ID，可通过已绑定的一键执行列表中的 triggerRuleId 获取 |

###### 示例代码

###### 示例

```typescript
await sdm.tapToRun.trigger({ ruleId: 'rule_abc123' });
console.log('一键执行已触发');
```

### 告警推送

##### 使用

当前告警能力 SDK 针对以下俩类场景做了一些标准化抽象，方便开发者自行根据业务场景使用：
- 内置告警（告警开关）
- 自定义告警

###### 起步

> 需引入 `HomeKit`，且在 `>=3.0.1` 版本才可使用

SmartAlarmAbility 自 @ray-js/panel-sdk@1.8.0 开始加入，已作为基础示例置于 [通用能力#使用](/cn/miniapp/solution-panel/ability/common/sdm/abilities/usage) 中。

###### 基础用法

以下为基础 JS 的接入示例：

```ts
import { SmartAlarmAbility } from '@ray-js/panel-sdk';

// 创建一个 alarm 实例
const Alarm = new SmartAlarmAbility();

// 在调用方法之前必须调用 init()
await Alarm.init();

// 调用 AlarmModel 的功能
Alarm.getBuiltInAlarmList(params)
  .then(result => {
    // 处理返回的结果
  })
  .catch(error => {
    // 处理错误情况
  });
```

###### Ray & SDM

以下为 Ray 及 SDM 的接入示例，通过 SDM 接入，您可以更好地享受 TS 类型提示及搭配 React Hooks 带来的开发体验：

**src/devices/index.ts**

> 生成 sensor 传感器智能设备模型，并内置告警能力

```ts
import { SmartDeviceModel, SmartAlarmAbility } from '@ray-js/panel-sdk';

const options = {
  abilities: [new SmartAlarmAbility()],
};

const devices = {
  sensor: new SmartDeviceModel<SmartDeviceSchema, { alarm: SmartAlarmAbility }>(options)
};
```

**src/app.tsx**

> 通过 SdmProvider 接入 React 体系

```tsx
import React from 'react';
import 'ray';
import '@/i18n';
import { kit, SdmProvider } from '@ray-js/panel-sdk';
import { devices } from '@/devices';

const { initPanelEnvironment } = kit;

interface Props {
  children: React.ReactNode;
}

initPanelEnvironment({ useDefaultOffline: true });

export default class App extends React.Component<Props> {
  onLaunch() {
    console.info('=== App onLaunch');
  }

  render() {
    return (
      <SdmProvider value={devices.sensor}>{this.props.children}</SdmProvider>
    );
  }
}
```

**src/pages/home.tsx**

> 拉取告警列表，并通过 TyList 展示

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useBuiltInAlarm } from '@ray-js/panel-sdk';
import { AlarmList } from '@ray-js/api/lib/cloud/interface';
import TyList from '@ray-js/components-ty-cell';
import TySwitch from '@ray-js/components-ty-switch';

function PageSdmAlarm() {
  const { loading, data, getBuiltInAlarmList, setBuiltInAlarmStatus } = useBuiltInAlarm();

  React.useEffect(() => {
    getBuiltInAlarmList();
  }, []);

  const handleValueChange = React.useCallback(
    (item: AlarmList) => (value: boolean) => {
      setBuiltInAlarmStatus({ disabled: !value, ruleIds: item.id });
    },
    []
  );

  const rowKey = React.useCallback((item: AlarmList) => item.id, []);

  console.log('=== rerender builtInAlarm', data, loading);
  return (
    <View>
      <TyList<AlarmList>
        dataSource={data}
        renderItem={item => (
          <TyList.Item
            key={item.id}
            title={item.name}
            content={<TySwitch checked={item.enabled} onChange={handleValueChange(item)} />}
          />
        )}
        rowKey={rowKey}
      />
    </View>
  );
}
```

###### 使用场景

###### 内置告警

> 一些传感类的设备会内置一些告警消息推送的功能，比如门磁传感器会在开门或关门的时候需要推送消息给用户，因此针对这类比较固化的告警推送，部分品类预设了一系列推送模板方便 IoT 端开发者直接使用，并在设备面板中 C 端 App 用户可以根据需求自定义开启或关闭这类消息推送。

###### 涉及 API

- 获取设备告警配置列表：[getBuiltInAlarmList](./getBuiltInAlarmList)
- 启用/禁用告警：[setBuiltInAlarmStatus](./setBuiltInAlarmStatus)
- Hooks：[useBuiltInAlarm](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useBuiltInAlarm)

###### 业务流程

| 角色             | 操作流程                                                                                                                                                                                                | 示例图                                                                                 |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| IoT 端开发者     | 在 IoT 设备消息推送配置页面选择默认的消息推送模板或自定义设置消息推送内容。配置完成后，产品界面会展示当前支持的消息推送列表，此时面板开发基于该产品配网或扫描生成的虚拟设备调用接口即可拉到该消息列表。 |
|
| 面板小程序开发者 | 1. 调用 getBuiltInAlarmList 查询消息推送列表，获取当前设备支持的消息推送列表。
 2. 调用 setBuiltInAlarmStatus 开启或关闭当前消息推送。                                                              |
|
| App 端用户       | 根据实际需要开启或关闭消息推送。规则满足时，会在 App 消息推送收到。                                                                                                                                     |
|

###### 自定义告警

> 针对一些比较复杂的告警触发规则时，告警开关无法满足这类定制场景，比如温湿度传感器品类下，App 上的用户期望能够自定调节温度的上下限，并在自定义的范围内去触发告警。或者说用户期望可以自定义一些其他规则，比如触发告警的功能点、延迟推送、推送方式、推送事件等。

###### 涉及 API

- 查询自定义告警规则列表：[getCustomAlarmList](./getCustomAlarmList)
- 新增/修改自定义告警规则：[addCustomAlarm](./addCustomAlarm)
- 启用/禁用自定义告警规则：[setCustomAlarmStatus](./setCustomAlarmStatus)
- 删除自定义告警规则：[deleteCustomAlarm](./deleteCustomAlarm)
- Hooks：[useCustomAlarm](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useCustomAlarm)

###### 业务流程

| 角色             | 操作流程                                                                                                        | 示例图                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 面板小程序开发者 | 调用 getCustomAlarmList 获取当前设备的自动化规则列表。                                                          |
|
| 面板小程序开发者 | 调用 addCustomAlarm 新增或编辑告警规则。                                                                        |
|
| 面板小程序开发者 | 调用 setCustomAlarmStatus 启用或停用告警规则。                                                                  |
|
| 面板小程序开发者 | 调用 deleteCustomAlarm 删除告警规则。                                                                           |
|
| App 端用户       | 根据实际需要配置告警推送的规则（类似见上面的图片交互），配置完毕以后若规则满足，则 App 那边会收到消息推送提醒。 |
|
###### SmartAlarmAbility.isSupportAlarm

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。

###### 描述

判断设备是否支持告警规则

###### 参数

无

###### 返回值

类型: `Promise<boolean>`

是否支持云告警推送。某些设备需要网关联网才能使用告警功能

###### 示例代码

###### 示例

```typescript
const supported = await sdm.alarm.isSupportAlarm();
if (supported) {
  console.log('当前设备支持告警');
}
```
###### SmartAlarmAbility.getBuiltInAlarmList

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。
> 内置告警由产品在涂鸦 IoT 平台配置，用户只能启用/禁用，不能新增或删除。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

根据设备 ID 查询该产品内置的告警列表信息

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，不传则使用当前设备 |

###### 返回值

类型: `Promise<BuiltInAlarmList>`

内置告警列表

###### 引用对象

###### `type` BuiltInAlarmList

```typescript
export type BuiltInAlarmList = BuiltInAlarmRule[];
```

###### `type` BuiltInAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `auditStatus` | `number` | 是 | 审核状态 |
| `boundForPanel` | `boolean` | 是 | 是否被场景面板绑定 |
| `boundForWiFiPanel` | `boolean` | 是 | 是否被 WiFi 场景面板绑定 |
| `enabled` | `boolean` | 是 | 是否启用 |
| `i18nData` | `BuiltInAlarmI18nData` | 是 | 多语言数据体 |
| `id` | `string` | 是 | 规则 ID |
| `localLinkage` | `boolean` | 是 | 是否为本地联动 |
| `name` | `string` | 是 | 规则名称 |
| `newLocalScene` | `boolean` | 是 | 是否为 App 管控本地联动 |
| `stickyOnTop` | `boolean` | 是 | 场景是否显示在首页 |

###### `type` BuiltInAlarmI18nData

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `name` | `AlarmLocaleText` | 是 | 名称多语言 |
| `content` | `AlarmLocaleText` | 是 | 内容多语言 |

###### `type` AlarmLocaleText

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `en` | `string` | 是 | 英文文案 |
| `zh` | `string` | 是 | 中文文案 |

###### 示例代码

###### 示例

```typescript
const alarmList = await sdm.alarm.getBuiltInAlarmList();
alarmList.forEach(alarm => {
  console.log(alarm.id, alarm.name, alarm.enabled);
});
```
###### SmartAlarmAbility.setBuiltInAlarmStatus

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

启用或禁用设备内置的告警规则

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `SetBuiltInAlarmStatusParams` | 是 | 操作参数 |

###### 返回值

类型: `Promise<SetBuiltInAlarmStatusResult>`

元组 [是否操作成功, 更新后的内置告警列表]

###### 引用对象

###### `type` SetBuiltInAlarmStatusParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，不传则使用当前设备 |
| `disabled` | `boolean` | 是 | true 为禁用，false 为启用 |
| `ruleIds` | `string` | 是 | 要操作的告警规则 ID，多个用逗号分隔 |

###### `type` SetBuiltInAlarmStatusResult

```typescript
[boolean, BuiltInAlarmList]
```

###### `type` BuiltInAlarmList

```typescript
export type BuiltInAlarmList = BuiltInAlarmRule[];
```

###### `type` BuiltInAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `auditStatus` | `number` | 是 | 审核状态 |
| `boundForPanel` | `boolean` | 是 | 是否被场景面板绑定 |
| `boundForWiFiPanel` | `boolean` | 是 | 是否被 WiFi 场景面板绑定 |
| `enabled` | `boolean` | 是 | 是否启用 |
| `i18nData` | `BuiltInAlarmI18nData` | 是 | 多语言数据体 |
| `id` | `string` | 是 | 规则 ID |
| `localLinkage` | `boolean` | 是 | 是否为本地联动 |
| `name` | `string` | 是 | 规则名称 |
| `newLocalScene` | `boolean` | 是 | 是否为 App 管控本地联动 |
| `stickyOnTop` | `boolean` | 是 | 场景是否显示在首页 |

###### `type` BuiltInAlarmI18nData

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `name` | `AlarmLocaleText` | 是 | 名称多语言 |
| `content` | `AlarmLocaleText` | 是 | 内容多语言 |

###### `type` AlarmLocaleText

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `en` | `string` | 是 | 英文文案 |
| `zh` | `string` | 是 | 中文文案 |

###### 示例代码

###### 示例

```typescript
const [success, updatedList] = await sdm.alarm.setBuiltInAlarmStatus({
  disabled: false,
  ruleIds: 'rule_001,rule_002',
});
console.log('操作结果:', success, '更新后列表:', updatedList);
```
###### SmartAlarmAbility.getCustomAlarmList

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

查询自定义创建的告警规则列表

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `GetCustomAlarmListParams` | 否 | 查询参数 |

###### 返回值

类型: `Promise<CustomAlarmList>`

自定义告警规则列表，包含 triggerRuleId、triggerRuleVO、bizDomain、bindId 等信息

###### 引用对象

###### `type` GetCustomAlarmListParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpId` | `string` | 否 | 要创建告警规则的功能点 ID，不填则拉取所有 |
| `devId` | `string` | 否 | 设备 ID，不填则默认自动读取当前环境下的设备 ID |

###### `type` CustomAlarmList

```typescript
export type CustomAlarmList = CustomAlarmRule[];
```

###### `type` CustomAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `triggerRuleId` | `string` | 是 | 告警执行的规则 id |
| `triggerRuleVO` | `AlarmTriggerRuleVO` | 是 | 触发告警规则的详细信息，详见 AlarmTriggerRuleVO 定义 |
| `bizDomain` | `string` | 是 | 业务域标识，在告警 SDK 下固定为 miniAppPanelSDKAlarm |
| `associativeEntityValue` | `string` | 是 | 当 associativeEntityId 不足以区分情况下使用，比如使用的是同一个功能点时又要区分告警类型的情况下，可以使用 DpValue，一般情况下用不到 |
| `sourceEntityId` | `string` | 是 | 和当前告警相关联的设备 ID |
| `name` | `string` | 是 | 名称或备注 |
| `icon` | `string` | 是 | 图标 |
| `bindId` | `number` | 是 | 绑定 ID |
| `associativeEntityId` | `string` | 是 | 和当前告警相关联的功能点 DP ID |
| `enable` | `boolean` | 是 | 是否启用 |

###### `type` AlarmTriggerRuleVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 id |
| `enabled` | `boolean` | 是 | 告警规则是否启用 |
| `id` | `string` | 是 | 执行规则 id |
| `name` | `string` | 是 | 告警名称或备注 |
| `preConditions` | `AlarmPreCondition[] \| unknown[]` | 是 | 执行动作的前置条件，详见 AlarmPreCondition 定义 |
| `conditions` | `CustomAlarmCondition[] \| unknown[]` | 是 | 执行动作的条件，详见 CustomAlarmCondition 定义 |
| `actions` | `CustomAlarmSceneAction[] \| unknown[]` | 是 | 执行的动作，详见 CustomAlarmSceneAction 定义 |

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` AlarmPreCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `expr` | `CustomAlarmPreConditionExpr` | 是 | 条件表达式 |
| `condType` | `"timeCheck"` | 是 | 条件类型，告警 SDK 固定为 timeCheck |
| `id` | `string` | 是 | 条件 ID |

###### `type` CustomAlarmCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 ID |
| `ruleId` | `string` | 是 | 规则 ID |
| `entityId` | `string` | 是 | 数据 ID |
| `entitySubIds` | `string` | 是 | 抽象子数据 ID |
| `expr` | `string` | 是 | 条件的表达式 |

###### `type` CustomAlarmSceneAction

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 id |
| `ruleId` | `string` | 是 | 场景 id |
| `actionExecutor` | `string` | 是 | 动作类型，在告警 SDK 下固定为 appPushTrigger |

###### `type` CustomAlarmPreConditionExpr

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `timeZoneId` | `string` | 是 | 时区 id，如 Asia/Shanghai |
| `start` | `string` | 是 | 开始时间，格式为 HH:mm，如 00:00 |
| `timeInterval` | `string` | 是 | 时间间隔，固定为 'custom' |
| `loops` | `string` | 是 | 循环日期，'1111111' 说明为一周七天均开启，其中起始时间为周日 |
| `end` | `string` | 是 | 结束时间，格式为 HH:mm，如 23:59 |

###### 示例代码

###### 示例

```typescript
// 获取所有自定义告警
const rules = await sdm.alarm.getCustomAlarmList();
console.log('自定义告警数量:', rules.length);

// 按功能点筛选
const dpRules = await sdm.alarm.getCustomAlarmList({ dpId: '1' });
```
###### SmartAlarmAbility.addCustomAlarm

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

新增或编辑自定义的告警规则

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `AddCustomAlarmOptions` | 是 | 告警规则配置 |

###### 返回值

类型: `Promise<AddCustomAlarmResult>`

元组 [新增/更新的规则, 更新后的完整规则列表]

###### 引用对象

###### `type` AddCustomAlarmOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `devId` | `string` | 否 | 设备 ID，默认从默认设备环境中取 |
| `name` | `string` | 否 | 告警的名称或备注 |
| `preCondition` | `Object` | 否 | 告警触发的前置条件 |
| `condition` | `[DpId, "==" \| "<" \| ">" \| "<=" \| ">=", boolean \| number \| string][]` | 是 | 告警触发的功能点条件，[DpId, Operator, DpValue][] |
| `duration` | `number` | 否 | 告警触发的功能点条件持续多久才会触发执行 action 动作，单位为秒 |

###### `type` AddCustomAlarmResult

```typescript
[AddCustomAlarmBindResult, CustomAlarmList]
```

###### `type` Operator

```typescript
type Operator = '==' | '<' | '>' | '<=' | '>=';
```

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` AddCustomAlarmBindResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `associativeEntityValue` | `string` | 是 | 关联实体值，用于区分告警类型 |
| `associativeEntityId` | `string` | 是 | 关联实体 ID，通常为功能点 ID |
| `bindId` | `number` | 是 | 绑定 ID |
| `bizDomain` | `string` | 是 | 业务域，告警固定为 miniAppPanelSDKAlarm |
| `enable` | `boolean` | 是 | 是否启用 |
| `sourceEntityId` | `string` | 是 | 设备 ID |

###### `type` CustomAlarmList

```typescript
export type CustomAlarmList = CustomAlarmRule[];
```

###### `type` CustomAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `triggerRuleId` | `string` | 是 | 告警执行的规则 id |
| `triggerRuleVO` | `AlarmTriggerRuleVO` | 是 | 触发告警规则的详细信息，详见 AlarmTriggerRuleVO 定义 |
| `bizDomain` | `string` | 是 | 业务域标识，在告警 SDK 下固定为 miniAppPanelSDKAlarm |
| `associativeEntityValue` | `string` | 是 | 当 associativeEntityId 不足以区分情况下使用，比如使用的是同一个功能点时又要区分告警类型的情况下，可以使用 DpValue，一般情况下用不到 |
| `sourceEntityId` | `string` | 是 | 和当前告警相关联的设备 ID |
| `name` | `string` | 是 | 名称或备注 |
| `icon` | `string` | 是 | 图标 |
| `bindId` | `number` | 是 | 绑定 ID |
| `associativeEntityId` | `string` | 是 | 和当前告警相关联的功能点 DP ID |
| `enable` | `boolean` | 是 | 是否启用 |

###### `type` AlarmTriggerRuleVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 id |
| `enabled` | `boolean` | 是 | 告警规则是否启用 |
| `id` | `string` | 是 | 执行规则 id |
| `name` | `string` | 是 | 告警名称或备注 |
| `preConditions` | `AlarmPreCondition[] \| unknown[]` | 是 | 执行动作的前置条件，详见 AlarmPreCondition 定义 |
| `conditions` | `CustomAlarmCondition[] \| unknown[]` | 是 | 执行动作的条件，详见 CustomAlarmCondition 定义 |
| `actions` | `CustomAlarmSceneAction[] \| unknown[]` | 是 | 执行的动作，详见 CustomAlarmSceneAction 定义 |

###### `type` AlarmPreCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `expr` | `CustomAlarmPreConditionExpr` | 是 | 条件表达式 |
| `condType` | `"timeCheck"` | 是 | 条件类型，告警 SDK 固定为 timeCheck |
| `id` | `string` | 是 | 条件 ID |

###### `type` CustomAlarmCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 ID |
| `ruleId` | `string` | 是 | 规则 ID |
| `entityId` | `string` | 是 | 数据 ID |
| `entitySubIds` | `string` | 是 | 抽象子数据 ID |
| `expr` | `string` | 是 | 条件的表达式 |

###### `type` CustomAlarmSceneAction

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 id |
| `ruleId` | `string` | 是 | 场景 id |
| `actionExecutor` | `string` | 是 | 动作类型，在告警 SDK 下固定为 appPushTrigger |

###### `type` CustomAlarmPreConditionExpr

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `timeZoneId` | `string` | 是 | 时区 id，如 Asia/Shanghai |
| `start` | `string` | 是 | 开始时间，格式为 HH:mm，如 00:00 |
| `timeInterval` | `string` | 是 | 时间间隔，固定为 'custom' |
| `loops` | `string` | 是 | 循环日期，'1111111' 说明为一周七天均开启，其中起始时间为周日 |
| `end` | `string` | 是 | 结束时间，格式为 HH:mm，如 23:59 |

###### `type` AddCustomAlarmOptions.preCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `startTime` | `string` | 是 | 告警可触发的开始时间，默认全天，即 00:00 |
| `endTime` | `string` | 是 | 告警可触发的结束时间，默认全天，即 23:59 |
| `loops` | `string` | 是 | 告警可触发的日期，默认全周，即 '1111111' |

###### 示例代码

###### 示例

```typescript
const [newRule, allRules] = await sdm.alarm.addCustomAlarm({
  name: '高温告警',
  condition: [['temp_current', '>', 40]],
  preCondition: {
    startTime: '08:00',
    endTime: '22:00',
    loops: '1111111',
  },
});
console.log('新增规则:', newRule.bindId);
```
###### SmartAlarmAbility.setCustomAlarmStatus

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

启用或禁用自定义的告警规则

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `SetCustomAlarmStatusParams` | 是 | 操作参数 |

###### 返回值

类型: `Promise<SetCustomAlarmStatusResult>`

元组 [是否操作成功, 更新后的完整规则列表]

###### 引用对象

###### `type` SetCustomAlarmStatusParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bindId` | `number` | 是 | 要操作的告警规则绑定 ID |
| `enable` | `boolean` | 是 | true 为启用，false 为禁用 |

###### `type` SetCustomAlarmStatusResult

```typescript
[boolean, CustomAlarmList]
```

###### `type` CustomAlarmList

```typescript
export type CustomAlarmList = CustomAlarmRule[];
```

###### `type` CustomAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `triggerRuleId` | `string` | 是 | 告警执行的规则 id |
| `triggerRuleVO` | `AlarmTriggerRuleVO` | 是 | 触发告警规则的详细信息，详见 AlarmTriggerRuleVO 定义 |
| `bizDomain` | `string` | 是 | 业务域标识，在告警 SDK 下固定为 miniAppPanelSDKAlarm |
| `associativeEntityValue` | `string` | 是 | 当 associativeEntityId 不足以区分情况下使用，比如使用的是同一个功能点时又要区分告警类型的情况下，可以使用 DpValue，一般情况下用不到 |
| `sourceEntityId` | `string` | 是 | 和当前告警相关联的设备 ID |
| `name` | `string` | 是 | 名称或备注 |
| `icon` | `string` | 是 | 图标 |
| `bindId` | `number` | 是 | 绑定 ID |
| `associativeEntityId` | `string` | 是 | 和当前告警相关联的功能点 DP ID |
| `enable` | `boolean` | 是 | 是否启用 |

###### `type` AlarmTriggerRuleVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 id |
| `enabled` | `boolean` | 是 | 告警规则是否启用 |
| `id` | `string` | 是 | 执行规则 id |
| `name` | `string` | 是 | 告警名称或备注 |
| `preConditions` | `AlarmPreCondition[] \| unknown[]` | 是 | 执行动作的前置条件，详见 AlarmPreCondition 定义 |
| `conditions` | `CustomAlarmCondition[] \| unknown[]` | 是 | 执行动作的条件，详见 CustomAlarmCondition 定义 |
| `actions` | `CustomAlarmSceneAction[] \| unknown[]` | 是 | 执行的动作，详见 CustomAlarmSceneAction 定义 |

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` AlarmPreCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `expr` | `CustomAlarmPreConditionExpr` | 是 | 条件表达式 |
| `condType` | `"timeCheck"` | 是 | 条件类型，告警 SDK 固定为 timeCheck |
| `id` | `string` | 是 | 条件 ID |

###### `type` CustomAlarmCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 ID |
| `ruleId` | `string` | 是 | 规则 ID |
| `entityId` | `string` | 是 | 数据 ID |
| `entitySubIds` | `string` | 是 | 抽象子数据 ID |
| `expr` | `string` | 是 | 条件的表达式 |

###### `type` CustomAlarmSceneAction

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 id |
| `ruleId` | `string` | 是 | 场景 id |
| `actionExecutor` | `string` | 是 | 动作类型，在告警 SDK 下固定为 appPushTrigger |

###### `type` CustomAlarmPreConditionExpr

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `timeZoneId` | `string` | 是 | 时区 id，如 Asia/Shanghai |
| `start` | `string` | 是 | 开始时间，格式为 HH:mm，如 00:00 |
| `timeInterval` | `string` | 是 | 时间间隔，固定为 'custom' |
| `loops` | `string` | 是 | 循环日期，'1111111' 说明为一周七天均开启，其中起始时间为周日 |
| `end` | `string` | 是 | 结束时间，格式为 HH:mm，如 23:59 |

###### 示例代码

###### 示例

```typescript
const [success, updatedRules] = await sdm.alarm.setCustomAlarmStatus({
  bindId: 12345,
  enable: false,
});
console.log('禁用结果:', success);
```
###### SmartAlarmAbility.deleteCustomAlarm

> [VERSION] @ray-js/panel-sdk >= 1.8.0

> 💡 仅支持单设备，不支持群组环境。
> 注意，返回示例仅供参考，其包含字段大于返回参数定义范围，请勿使用除本文返回参数定义以外的返回数据，否则可能会导致程序异常。

###### 描述

删除自定义的告警规则

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `DeleteCustomAlarmParams` | 是 | 操作参数 |

###### 返回值

类型: `Promise<DeleteCustomAlarmResult>`

元组 [是否删除成功, 更新后的完整规则列表]

###### 引用对象

###### `type` DeleteCustomAlarmParams

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bindId` | `number` | 是 | 要删除的告警规则绑定 ID |

###### `type` DeleteCustomAlarmResult

```typescript
[boolean, CustomAlarmList]
```

###### `type` CustomAlarmList

```typescript
export type CustomAlarmList = CustomAlarmRule[];
```

###### `type` CustomAlarmRule

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `triggerRuleId` | `string` | 是 | 告警执行的规则 id |
| `triggerRuleVO` | `AlarmTriggerRuleVO` | 是 | 触发告警规则的详细信息，详见 AlarmTriggerRuleVO 定义 |
| `bizDomain` | `string` | 是 | 业务域标识，在告警 SDK 下固定为 miniAppPanelSDKAlarm |
| `associativeEntityValue` | `string` | 是 | 当 associativeEntityId 不足以区分情况下使用，比如使用的是同一个功能点时又要区分告警类型的情况下，可以使用 DpValue，一般情况下用不到 |
| `sourceEntityId` | `string` | 是 | 和当前告警相关联的设备 ID |
| `name` | `string` | 是 | 名称或备注 |
| `icon` | `string` | 是 | 图标 |
| `bindId` | `number` | 是 | 绑定 ID |
| `associativeEntityId` | `string` | 是 | 和当前告警相关联的功能点 DP ID |
| `enable` | `boolean` | 是 | 是否启用 |

###### `type` AlarmTriggerRuleVO

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `ownerId` | `string` | 是 | 家庭 id |
| `enabled` | `boolean` | 是 | 告警规则是否启用 |
| `id` | `string` | 是 | 执行规则 id |
| `name` | `string` | 是 | 告警名称或备注 |
| `preConditions` | `AlarmPreCondition[] \| unknown[]` | 是 | 执行动作的前置条件，详见 AlarmPreCondition 定义 |
| `conditions` | `CustomAlarmCondition[] \| unknown[]` | 是 | 执行动作的条件，详见 CustomAlarmCondition 定义 |
| `actions` | `CustomAlarmSceneAction[] \| unknown[]` | 是 | 执行的动作，详见 CustomAlarmSceneAction 定义 |

###### `type` DpValue

功能点值类型，可能为 boolean、number、string

```typescript
export type DpValue = boolean | number | string;
```

###### `type` AlarmPreCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `expr` | `CustomAlarmPreConditionExpr` | 是 | 条件表达式 |
| `condType` | `"timeCheck"` | 是 | 条件类型，告警 SDK 固定为 timeCheck |
| `id` | `string` | 是 | 条件 ID |

###### `type` CustomAlarmCondition

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 ID |
| `ruleId` | `string` | 是 | 规则 ID |
| `entityId` | `string` | 是 | 数据 ID |
| `entitySubIds` | `string` | 是 | 抽象子数据 ID |
| `expr` | `string` | 是 | 条件的表达式 |

###### `type` CustomAlarmSceneAction

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 条件 id |
| `ruleId` | `string` | 是 | 场景 id |
| `actionExecutor` | `string` | 是 | 动作类型，在告警 SDK 下固定为 appPushTrigger |

###### `type` CustomAlarmPreConditionExpr

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `timeZoneId` | `string` | 是 | 时区 id，如 Asia/Shanghai |
| `start` | `string` | 是 | 开始时间，格式为 HH:mm，如 00:00 |
| `timeInterval` | `string` | 是 | 时间间隔，固定为 'custom' |
| `loops` | `string` | 是 | 循环日期，'1111111' 说明为一周七天均开启，其中起始时间为周日 |
| `end` | `string` | 是 | 结束时间，格式为 HH:mm，如 23:59 |

###### 示例代码

###### 示例

```typescript
const [success, remainingRules] = await sdm.alarm.deleteCustomAlarm({
  bindId: 12345,
});
console.log('删除结果:', success, '剩余规则数:', remainingRules.length);
```

### 设备存储

##### 使用

当前存储能力 SDK 针对以下能力做了抽象：
- key 值前缀： 自动添加存储 key 前缀为 devId 值，防止同产品不同设备存储时导致的数据冲突。
- 数据自动同步：开发者操作自定义数据时会自动存储为本地（使用 getStorage/setStorage 实现 ）和云端数据（使用 getDevProperty/saveDevProperty 实现），并保持其同步，同时选取最新的数据返回，在弱网环境下防止本地操作未同步云端导致的数据丢失。

###### SmartStorageAbility

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 通过 SmartDeviceModel 的 abilities 配置挂载后使用。
> 同时支持单设备和群组设备。

###### 描述

智能存储能力，提供基于设备维度的键值对云端持久化存储

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `Options` | 否 | 存储能力初始化配置 |

###### 返回值

类型: `SmartStorageAbility`

SmartStorageAbility 实例

###### 方法

| 方法名 | 说明 |
| --- | --- |
| `init` | 初始化存储能力，建立与云端和本地的存储通道 |
| `get` | 读取指定 key 的存储数据 |
| `getAll` | 读取当前设备/群组下的所有存储数据 |
| `set` | 存储指定 key 的数据 |
| `setAll` | 批量存储多个键值对 |
| `remove` | 删除指定 key 的存储数据 |

###### 引用对象

###### `type` Options

```typescript
| DeviceId // 第一版的 storage 只支持传入 deviceId
  | {
      deviceId?: string;
      groupId?: string;
      storageType?: TStorageType;
    }
```

###### 示例代码

###### 示例

```typescript
import { SmartDeviceModel, SmartStorageAbility } from '@ray-js/panel-sdk';

const sdm = new SmartDeviceModel({ abilities: [new SmartStorageAbility()] });
```
###### SmartStorageAbility.get

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

读取指定 key 的存储数据

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 存储键名 |
| `callback` | `(cacheData: TReturnRes) => void` | 否 | 可选回调，在数据读取完成后调用 |

###### 返回值

类型: `Promise<TReturnRes<T>>`

包含时间戳和值的存储结果

###### 引用对象

###### `type` TReturnRes

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `__isEqual__` | `boolean` | 否 |  |
| `data` | `Object` | 是 |  |
| `time` | `timeStamp` | 是 |  |

###### `type` TReturnRes.data

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `value` | `T` | 是 |  |
| `type` | `string` | 是 |  |

###### 示例代码

###### 示例

```typescript
const result = await sdm.storage.get<number>('brightness');
console.log('值:', result.value, '时间:', result.time);
```
###### SmartStorageAbility.getAll

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

读取当前设备/群组下的所有存储数据

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `callback` | `(cacheData: TReturnResData) => void` | 否 | 可选回调，在数据读取完成后调用 |

###### 返回值

类型: `Promise<TReturnResData<T>>`

包含所有存储键值对的结果

###### 引用对象

###### `type` TReturnResData

```typescript
{
  [key: string]: {
    __isEqual__?: boolean;
    data: { value: T; type: string };
    time: timeStamp;
  };
}
```

###### 示例代码

###### 示例

```typescript
const allData = await sdm.storage.getAll();
console.log('所有存储数据:', allData);
```
###### SmartStorageAbility.set

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 当 storageType 不为 'local' 时，value 序列化后最大长度为 900 字符。
> 本地缓存支持的 value 最大长度超过 1024。

###### 描述

存储指定 key 的数据

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 存储键名 |
| `value` | `T` | 是 | 要存储的值，序列化后长度不能超过 900 字符（建议 256 以内） |

###### 返回值

类型: `Promise<boolean>`

存储操作结果

###### 示例代码

###### 示例

```typescript
await sdm.storage.set('brightness', 80);
await sdm.storage.set('config', { mode: 'auto', level: 3 });
```
###### SmartStorageAbility.setAll

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 每个 value 序列化后最大长度为 1024 字符，整个 values 对象的 key 数量不能超过 30 个。

###### 描述

批量存储多个键值对

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `values` | `Record<string, any>` | 是 | 要存储的键值对集合，最多 30 个 key |
| `timestamp` | `number` | 否 | 时间戳，默认为当前时间 |

###### 返回值

类型: `Promise<unknown>`

存储操作结果

###### 示例代码

###### 示例

```typescript
await sdm.storage.setAll({
  brightness: 80,
  colorTemp: 4000,
  mode: 'white',
});
```
###### SmartStorageAbility.remove

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

删除指定 key 的存储数据

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 要删除的存储键名 |

###### 返回值

类型: `Promise<unknown>`

删除操作结果

###### 示例代码

###### 示例

```typescript
await sdm.storage.remove('brightness');
```

### 设备支持状态

##### 使用

当前 Support 能力 SDK 针对以下能力做了抽象：
- 设备类型判断
- dp支持情况判断
- 其他能力支持判断

###### SmartSupportAbility

> [VERSION] @ray-js/panel-sdk >= 1.10.0

> 💡 通过 SmartDeviceModel 的 abilities 配置挂载后使用。
> 同时支持单设备和群组设备。

###### 描述

设备能力检测，判断设备支持的功能点与协议类型

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `SmartSupportAbilityOptions` | 否 | 设备能力检测配置 |

###### 返回值

类型: `SmartSupportAbility`

SmartSupportAbility 实例

###### 方法

| 方法名 | 说明 |
| --- | --- |
| `isSupportDp` | 检查给定的功能点编码是否受设备支持 |
| `isInGateway` | 判断设备是否已添加到网关下 |
| `isGroupDevice` | 判断当前是否是群组设备 |
| `isSupportBright` | 判断设备是否支持白光亮度功能点 |
| `isSupportTemp` | 判断设备是否支持色温功能点 |
| `isSupportColour` | 判断设备是否支持彩光功能点 |
| `isSupportCloudTimer` | 判断设备是否支持云端定时功能 |
| `isWifiDevice` | 判断是否是 WiFi 设备 |
| `isGprsDevice` | 判断是否是 GPRS 设备 |
| `isBluetoothDevice` | 判断是否是蓝牙 Bluetooth 设备 |
| `isBleMeshDevice` | 判断是否是 BLE Mesh 设备 |
| `isZigbeeDevice` | 判断是否是 Zigbee 设备 |
| `isSigMeshDevice` | 判断是否是 SIG Mesh 设备 |
| `isBleDevice` | 判断是否是蓝牙类设备（包含 Bluetooth、BLE Mesh、SIG Mesh） |
| `isCat1Device` | 判断是否是 Cat.1 设备 |
| `isBeaconDevice` | 判断是否是 Beacon 设备 |
| `isLteCat4Device` | 判断是否是 LTE Cat.4 设备 |
| `isLteCat10Device` | 判断是否是 LTE Cat.10 设备 |
| `isLteCatMDevice` | 判断是否是 LTE Cat.M 设备 |
| `isThreadDevice` | 判断是否是 Thread 设备 |
| `isMatterDevice` | 判断是否是 Matter 设备 |
| `isTuyaMatterDevice` | 判断是否是涂鸦 Matter 设备 |
| `isTripartiteMatter` | 判断是否是三方 Matter 设备 |
| `isSupportMatterWhite` | 判断是否支持 Matter 白光 |

###### 引用对象

###### `type` SmartSupportAbilityOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `initDevInfo` | `(devInfo: DevInfo) => DevInfo` | 否 |  |

###### `type` DevInfo

设备信息

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `idCodes` | `Record<string, string>` | 是 | dp id 与 dp code 的映射 |
| `codeIds` | `Record<string, string>` | 是 | dp code 与 dp id 的映射 |
| `capability` | `Capability` | 是 | 产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等  - Wi-Fi (bit 0, 十进制值: 1): wifi无线 - Cable (bit 1, 十进制值: 2): 有线 - GPRS (bit 2, 十进制值: 4): 类似2g网络 - NB-IoT (bit 3, 十进制值: 6): 物联网卡网络 - Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点 - BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh - ZigBee (bit 12, 十进制值: 4096): 2.4g频段 - Infrared (bit 13, 十进制值: 8192): 红外 - 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz - SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh - MCU (bit 16, 十进制值: 65536): mcu - SMesh (bit 17, 十进制值: 131072): 类似ZigBee - Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络 - Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon - Thread (bit 25, 十进制值: 33554432): Thread能力 |
| `devAttribute` | `DevAttribute` | 是 | 设备能力标位，由固件上报 位数含义: - 第 1 位 (bit 0): 设备是否支持免配网 - 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询 - 第 3 位 (bit 2): 设备是否具有本地联动能力 - 第 4 位 (bit 3): 设备是否支持 WIFI 扫描 - 第 5 位 (bit 4): 设备是否支持 Google Local Home - 第 6 位 (bit 5): 设备是否支持闪电配网能力 - 第 7 位 (bit 6): 设备是否支持蓝牙控制 - 第 8 位 (bit 7): 设备是否支持安防能力 - 第 9 位 (bit 8): 设备是否是共享设备 - 第 10 位 (bit 9): 设备是否支持日出日落定时 - 第 11 位 (bit 10): 设备是否支持故障替换能力 - 第 12 位 (bit 11): 设备是否支持 OTA - 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换 - 第 15 位 (bit 14): 设备支持涂鸦标准协议 - 第 16 位 (bit 15): 设备支持自定义透传 - 第 17 位 (bit 16): 设备是否支持行业能力 |
| `schema` | `DpSchema[]` | 是 | 产品信息，schema，功能定义都在里面 |
| `panelConfig` | `PanelConfig` | 是 | 面板云配置 |

###### `type` Capability

产品通讯能力标位，按二进制位运算的方式进行判断计算，如 Wi-Fi、Bluetooth、ZigBee、SigMesh 等

- Wi-Fi (bit 0, 十进制值: 1): wifi无线
- Cable (bit 1, 十进制值: 2): 有线
- GPRS (bit 2, 十进制值: 4): 类似2g网络
- NB-IoT (bit 3, 十进制值: 6): 物联网卡网络
- Bluetooth (bit 10, 十进制值: 1024): 蓝牙单点
- BLEMesh (bit 11, 十进制值: 2048): 蓝牙私有mesh
- ZigBee (bit 12, 十进制值: 4096): 2.4g频段
- Infrared (bit 13, 十进制值: 8192): 红外
- 433 (subpieces) (bit 14, 十进制值: 16384): 433mhz
- SigMesh (bit 15, 十进制值: 32768): 蓝牙标准Mesh
- MCU (bit 16, 十进制值: 65536): mcu
- SMesh (bit 17, 十进制值: 131072): 类似ZigBee
- Cat1 (bit 20, 十进制值: 1048576): 通常使用3g网络
- Beacon (bit 21, 十进制值: 2097152): 蓝牙Beacon
- Thread (bit 25, 十进制值: 33554432): Thread能力

```typescript
export type Capability = number;
```

###### `type` DevAttribute

设备能力标位，由固件上报

位数含义:
- 第 1 位 (bit 0): 设备是否支持免配网
- 第 2 位 (bit 1): 设备支持 dp query 31 号协议查询
- 第 3 位 (bit 2): 设备是否具有本地联动能力
- 第 4 位 (bit 3): 设备是否支持 WIFI 扫描
- 第 5 位 (bit 4): 设备是否支持 Google Local Home
- 第 6 位 (bit 5): 设备是否支持闪电配网能力
- 第 7 位 (bit 6): 设备是否支持蓝牙控制
- 第 8 位 (bit 7): 设备是否支持安防能力
- 第 9 位 (bit 8): 设备是否是共享设备
- 第 10 位 (bit 9): 设备是否支持日出日落定时
- 第 11 位 (bit 10): 设备是否支持故障替换能力
- 第 12 位 (bit 11): 设备是否支持 OTA
- 第 13 位 (bit 12): 设备是否支持 WIFI 备用切换
- 第 15 位 (bit 14): 设备支持涂鸦标准协议
- 第 16 位 (bit 15): 设备支持自定义透传
- 第 17 位 (bit 16): 设备是否支持行业能力

```typescript
export type DevAttribute = number;
```

###### `interface` PanelConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bic` | `CloudConfig[]` | 是 | 云定时和跳转链接配置 |
| `fun` | `FunConfig` | 否 | 功能配置 |

###### `interface` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `interface` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

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

###### `type` DpSchema

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `attr` | `number` | 否 |  |
| `canTrigger` | `boolean` | 否 |  |
| `code` | `string` | 是 | 功能点标识码，如 switch |
| `defaultRecommend` | `boolean` | 否 |  |
| `editPermission` | `boolean` | 否 |  |
| `executable` | `boolean` | 否 |  |
| `extContent` | `string` | 否 |  |
| `iconname` | `string` | 否 |  |
| `id` | `string \| number` | 是 | 功能点 ID |
| `mode` | `"rw" \| "ro" \| "wr"` | 是 | 功能点模式类型 rw: 可下发可上报（可读可写） ro: 只可上报（仅可读） wr: 只可下发（仅可写） |
| `name` | `string` | 是 | 功能点名称，一般用于语音等场景 |
| `property` | `Object` | 否 | 功能点属性 |
| `type` | `"raw" \| "obj"` | 是 |  |

###### `type` DpSchema.property

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `type` | `"string" \| "bool" \| "enum" \| "value" \| "bitmap" \| "raw"` | 是 | 功能点类型 |
| `range` | `string[] \| readonly string[]` | 否 | 枚举值范围，type = enum 时才存在 |
| `label` | `string[] \| readonly string[]` | 否 | 故障型标签列表，type = bitmap 时才存在 |
| `maxlen` | `number` | 否 | 故障型最大长度，type = bitmap 时才存在 |
| `unit` | `string` | 否 | 数值型单位，type = value 时才存在 |
| `min` | `number` | 否 | 数值型最小值，type = value 时才存在 |
| `max` | `number` | 否 | 数值型最大值，type = value 时才存在 |
| `scale` | `number` | 否 | 数值型精度，type = value 时才存在 |
| `step` | `number` | 否 | 数值型步长，type = value 时才存在 |

###### `type` CloudConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `jump_url` | `JumpUrlConfig` | 否 | 跳转链接配置 |
| `timer` | `TimerConfig` | 否 | 云定时配置 |

###### `type` JumpUrlConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"jump_url"` | 是 | 跳转链接配置代码 |
| `description` | `string` | 是 | 跳转链接配置描述 |
| `name` | `string` | 是 | 跳转链接配置名称 |
| `selected` | `boolean` | 是 | 跳转链接配置是否选中 |

###### `type` TimerConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `code` | `"timer"` | 是 | 云定时配置代码 |
| `description` | `string` | 是 | 云定时配置描述 |
| `name` | `string` | 是 | 云定时配置名称 |
| `selected` | `boolean` | 是 | 云定时配置是否选中 |

###### `type` FunConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `tyabirysr4` | `string` | 是 | 背景色，当前仅涂鸦官方小程序支持 |
| `tyabirysr4_app` | `"follow" \| "--app-B1"` | 是 | 背景色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w` | `string` | 是 | 主题色，当前仅涂鸦官方小程序支持 |
| `tyabis5d9w_app` | `"follow" \| "--app-M1"` | 是 | 主题色跟随策略，follow 代表跟随 App，否则代表要替换的 App 变量路径，当前仅涂鸦官方小程序支持 |

###### 示例代码

###### 示例

```typescript
import { SmartDeviceModel, SmartSupportAbility } from '@ray-js/panel-sdk';

const sdm = new SmartDeviceModel({ abilities: [new SmartSupportAbility()] });
```
###### SmartSupportAbility.isWifiDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 WiFi 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isWifiDevice()) {
  console.log('当前为 WiFi 设备');
}
```
###### SmartSupportAbility.isZigbeeDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 Zigbee 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isZigbeeDevice()) {
  console.log('当前为 Zigbee 设备');
}
```
###### SmartSupportAbility.isSigMeshDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 SIG Mesh 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isSigMeshDevice()) {
  console.log('当前为 SIG Mesh 设备');
}
```
###### SmartSupportAbility.isBleDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是蓝牙类设备（包含 Bluetooth、BLE Mesh、SIG Mesh）

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isBleDevice()) {
  console.log('当前为蓝牙类设备（含 BLE Mesh / SIG Mesh）');
}
```
###### SmartSupportAbility.isMatterDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 Matter 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isMatterDevice()) {
  console.log('当前为 Matter 设备');
}
```
###### SmartSupportAbility.isTuyaMatterDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是涂鸦 Matter 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isTuyaMatterDevice()) {
  console.log('当前为涂鸦 Matter 设备');
}
```
###### SmartSupportAbility.isGprsDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 GPRS 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isGprsDevice()) {
  console.log('当前为 GPRS 设备');
}
```
###### SmartSupportAbility.isBluetoothDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是蓝牙 Bluetooth 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isBluetoothDevice()) {
  console.log('当前为蓝牙设备');
}
```
###### SmartSupportAbility.isBleMeshDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 BLE Mesh 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isBleMeshDevice()) {
  console.log('当前为 BLE Mesh 设备');
}
```
###### SmartSupportAbility.isCat1Device

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 Cat.1 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isCat1Device()) {
  console.log('当前为 Cat.1 蜂窝设备');
}
```
###### SmartSupportAbility.isBeaconDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 Beacon 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isBeaconDevice()) {
  console.log('当前为 Beacon 设备');
}
```
###### SmartSupportAbility.isLteCat4Device

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 LTE Cat.4 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isLteCat4Device()) {
  console.log('当前为 LTE Cat.4 设备');
}
```
###### SmartSupportAbility.isLteCat10Device

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 LTE Cat.10 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isLteCat10Device()) {
  console.log('当前为 LTE Cat.10 设备');
}
```
###### SmartSupportAbility.isLteCatMDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 LTE Cat.M 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isLteCatMDevice()) {
  console.log('当前为 LTE Cat.M 设备');
}
```
###### SmartSupportAbility.isThreadDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是 Thread 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isThreadDevice()) {
  console.log('当前为 Thread 设备');
}
```
###### SmartSupportAbility.isTripartiteMatter

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断是否是三方 Matter 设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isTripartiteMatter()) {
  console.log('当前为三方 Matter 设备');
}
```
###### SmartSupportAbility.isGroupDevice

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断当前是否是群组设备

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
const isGroup = sdm.support.isGroupDevice();
if (isGroup) {
  console.log('当前为群组设备');
}
```
###### SmartSupportAbility.isSupportDp

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 同时支持单设备和群组设备。结果默认会缓存，传入 isForce=true 可强制重新检查。

###### 描述

检查给定的功能点编码是否受设备支持

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpCode` | `any` | 是 | 功能点编码 |
| `isForce` | `boolean` | 否 | 是否跳过缓存强制检查，默认 false |

###### 返回值

无

###### 示例代码

###### 示例

```typescript
const hasBright = sdm.support.isSupportDp('bright_value');
const hasSwitch = sdm.support.isSupportDp('switch_led');
console.log('支持亮度:', hasBright, '支持开关:', hasSwitch);
```
###### SmartSupportAbility.isSupportBright

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断设备是否支持白光亮度功能点

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isForce` | `boolean` | 否 | 是否跳过缓存强制检查，默认 false |

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isSupportBright()) {
  console.log('设备支持亮度调节');
}
```
###### SmartSupportAbility.isSupportTemp

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断设备是否支持色温功能点

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isForce` | `boolean` | 否 | 是否跳过缓存强制检查，默认 false |

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isSupportTemp()) {
  console.log('设备支持色温调节');
}
```
###### SmartSupportAbility.isSupportColour

> [VERSION] @ray-js/panel-sdk >= 1.0.0

###### 描述

判断设备是否支持彩光功能点

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `isForce` | `boolean` | 否 | 是否跳过缓存强制检查，默认 false |

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isSupportColour()) {
  console.log('设备支持彩光模式');
}
```
###### SmartSupportAbility.isSupportCloudTimer

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 群组设备需要设备列表中所有设备均支持定时才返回 true。
> 单设备通过 panelConfig.bic 中 timer 配置项判断。

###### 描述

判断设备是否支持云端定时功能

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
if (sdm.support.isSupportCloudTimer()) {
  console.log('支持云端定时，可展示定时入口');
}
```
###### SmartSupportAbility.isInGateway

> [VERSION] @ray-js/panel-sdk >= 1.0.0

> 💡 仅支持单设备，不支持群组环境。

###### 描述

判断设备是否已添加到网关下

###### 参数

无

###### 返回值

无

###### 示例代码

###### 示例

```typescript
const inGateway = sdm.support.isInGateway();
if (inGateway) {
  console.log('设备已接入网关');
}
```

### 照明高级能力

##### 使用

照明色温/千分之一亮度高级能力 SDK 针对以下场景做了标准化抽象：
- 获取高级能力是否开启
- 转换色温值及单位
- 转换亮度值及单位
- 获取 VAS 关键点信息

###### 起步

SmartLampAdvancedAbility 自 @ray-js/panel-sdk@1.15.0 开始加入。

###### SmartLampAdvancedAbility

> [VERSION] v1.15.0+

> 💡 通过 SmartDeviceModel 的 abilities 配置挂载后使用。
> 同时支持单设备和群组设备。

###### 描述

照明高级能力，提供色温/亮度的高级转换与 VAS 信息查询

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `props` | `SmartLampAdvancedAbilityOptions` | 是 | 照明高级能力初始化配置 |

###### 返回值

类型: `SmartLampAdvancedAbility`

SmartLampAdvancedAbility 实例

###### 方法

| 方法名 | 说明 |
| --- | --- |
| `convertTemperature` | 转换色温值：若设备启用高级色温能力则返回带单位的显示值（如 2700K），否则返回原始值与空单位。 |
| `convertBrightness` | 转换亮度值：若设备启用千分之一亮度能力则返回带单位的显示值，否则返回原始值与空单位。 |
| `getAdvancedTemperatureVas` | 获取高级色温 VAS（增值服务）信息，包含关键点（显示值、原始值、单位），用于色温条范围与展示。 |
| `getAdvancedBrightnessVas` | 获取高级亮度（千分之一亮度）VAS 信息，包含关键点，用于亮度条显示范围与单位。 |
| `getAdvanceHighEnabled` | 查询指定 DP 的高级能力是否启用：支持 bright_value（千分之一亮度）、temp_value（标准色温）、color_temp_control（Matter 色温）。 |
| `convertDp` | 按功能点将原始 DP 值转为带单位的显示值；支持 bright_value、temp_value、color_temp_control。 |

###### 示例代码

###### 示例

```typescript
import { SmartDeviceModel, SmartLampAdvancedAbility } from '@ray-js/panel-sdk';

const sdm = new SmartDeviceModel({ abilities: [new SmartLampAdvancedAbility({})] });
```
###### SmartLampAdvancedAbility.getAdvanceHighEnabled

> [VERSION] v1.15.0+

###### 描述

查询指定 DP 的高级能力是否启用：支持 bright_value（千分之一亮度）、temp_value（标准色温）、color_temp_control（Matter 色温）。

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpCode` | `AdvanceHighDpCode` | 是 | 功能点编码，须为 bright_value \| temp_value \| color_temp_control 之一 |

###### 返回值

类型: `Promise<boolean>`

{Promise<boolean>} true 表示已启用；不支持的功能点返回 false。相同 dpCode 会复用缓存。

###### 引用对象

###### `type` AdvanceHighDpCode

```typescript
'color_temp_control' | 'temp_value' | 'bright_value'
```

###### 示例代码

###### 示例

```typescript
const brightOn = await sdm.lampAdv.getAdvanceHighEnabled('bright_value');
const tempOn = await sdm.lampAdv.getAdvanceHighEnabled('temp_value');
const matterTempOn = await sdm.lampAdv.getAdvanceHighEnabled('color_temp_control');
```

**注意事项**

1. 该方法会先请求高级能力配置，然后检查指定 DP 功能点的高级能力是否启用
2. 结果会被缓存，多次调用相同 DP 功能点会直接返回缓存结果
3. 对于 Matter 设备，色温功能点使用 `color_temp_control`，标准协议设备使用 `temp_value`
4. 如果设备不支持指定的 DP 功能点，会返回 `false`
###### SmartLampAdvancedAbility.convertTemperature

> [VERSION] v1.15.0+

###### 描述

转换色温值：若设备启用高级色温能力则返回带单位的显示值（如 2700K），否则返回原始值与空单位。

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `temperature` | `number` | 是 | 色温原始值（面板侧数值，如 2700） |

###### 返回值

类型: `{ value: number; unit: string }`

{Promise<{ value: number; unit: string }>} 转换后的数值与单位；未启用高级能力时 unit 为空字符串。依赖云端 dpTranslateAdvancedCapability，需网络。

###### 示例代码

###### 示例

```typescript
const result = await sdm.lampAdv.convertTemperature(2700);
console.log('色温:', result.value, result.unit);
```

**注意事项**

1. 该方法会自动检测设备是否启用了高级色温能力
2. 如果未启用高级能力，会直接返回原始值和空单位
3. 对于 Matter 设备，会自动使用 `color_temp_control` 进行转换
4. 对于标准协议设备，会自动使用 `temp_value` 进行转换
5. 转换过程会调用云端接口，需要网络连接
###### SmartLampAdvancedAbility.convertBrightness

> [VERSION] v1.15.0+

###### 描述

转换亮度值：若设备启用千分之一亮度能力则返回带单位的显示值，否则返回原始值与空单位。

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `brightness` | `number` | 是 | 亮度原始值（常见范围如 10～1000） |

###### 返回值

类型: `{ value: number; unit: string }`

{Promise<{ value: number; unit: string }>} 转换后的数值与单位；未启用高级能力时 unit 为空字符串。依赖云端接口，需网络。

###### 示例代码

###### 示例

```typescript
const result = await sdm.lampAdv.convertBrightness(100);
console.log('亮度:', result.value, result.unit);
```

**注意事项**

1. 该方法会自动检测设备是否启用了千分之一亮度能力
2. 如果未启用高级能力，会直接返回原始值和空单位
3. 转换过程会调用云端接口，需要网络连接
4. 亮度值的范围通常是 10-1000（千分之一亮度）
###### SmartLampAdvancedAbility.convertDp

> [VERSION] v1.15.0+

> 💡 单设备与群组均支持；内部先 getAdvanceHighEnabled，再调 ty.device.dpTranslateAdvancedCapability。

###### 描述

按功能点将原始 DP 值转为带单位的显示值；支持 bright_value、temp_value、color_temp_control。

###### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `dpCode` | `AdvanceHighDpCode` | 是 | 功能点编码 |
| `dpValue` | `number` | 是 | 功能点原始数值 |

###### 返回值

类型: `{ value: number; unit: string } \| null`

{Promise<{ value: number; unit: string } \| null>} 成功为显示值与单位；未启用高级能力时返回 { value, unit: '' }；云端无有效翻译时可能为 null。需网络。

###### 引用对象

###### `type` AdvanceHighDpCode

```typescript
'color_temp_control' | 'temp_value' | 'bright_value'
```

###### 示例代码

###### 示例

```typescript
const b = await sdm.lampAdv.convertDp('bright_value', 100);
const t = await sdm.lampAdv.convertDp('temp_value', 2700);
const m = await sdm.lampAdv.convertDp('color_temp_control', 2700);
```

**注意事项**

1. 该方法会自动检测设备是否启用了对应 DP 功能点的高级能力
2. 如果未启用高级能力，会直接返回原始值和空单位
3. 转换过程会调用云端接口 `ty.device.dpTranslateAdvancedCapability`，需要网络连接
4. 对于 Matter 设备，色温功能点使用 `color_temp_control`
5. 对于标准协议设备，色温功能点使用 `temp_value`
6. 该方法内部会先调用 `getAdvanceHighEnabled` 检查能力是否启用
###### SmartLampAdvancedAbility.getAdvancedTemperatureVas

> [VERSION] v1.15.0+

###### 描述

获取高级色温 VAS（增值服务）信息，包含关键点（显示值、原始值、单位），用于色温条范围与展示。

###### 参数

无

###### 返回值

类型: `VasKeypoints['vasInfo']`

{Promise<VasKeypoints['vasInfo']>} Matter 与标准协议下分别查询对应能力码；不支持时可能为 undefined。需网络。

###### 引用对象

###### `interface` VasKeypoints

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizId` | `string` | 是 | 业务 ID |
| `bizType` | `number` | 是 | 业务类型 |
| `vasInfo` | `Object[]` | 是 | VAS 信息 |

###### `type` VasKeypoints.vasInfo

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `vasCode` | `string` | 是 | VAS 代码 |
| `abilityEnabled` | `boolean` | 是 | 能力是否启用 |
| `keyPoints` | `__type[]` | 是 | 关键点 |

###### 示例代码

###### 示例

```typescript
const vasInfo = await sdm.lampAdv.getAdvancedTemperatureVas();
vasInfo?.forEach(item => {
  console.log('VAS:', item.vasCode, item.abilityEnabled);
  item.keyPoints.forEach(kp => console.log(kp.originalValue, kp.displayValue, kp.unit));
});
```

**注意事项**

1. 该方法会自动识别设备类型（Matter 或标准协议），使用对应的能力代码
2. 对于 Matter 设备，使用 `matterColorTemperature` 能力代码
3. 对于标准协议设备，使用 `colorTemperature` 能力代码
4. 如果设备不支持色温功能，可能返回空数组或 `null`
5. 该方法会调用云端接口获取 VAS 信息，需要网络连接
###### SmartLampAdvancedAbility.getAdvancedBrightnessVas

> [VERSION] v1.15.0+

###### 描述

获取高级亮度（千分之一亮度）VAS 信息，包含关键点，用于亮度条显示范围与单位。

###### 参数

无

###### 返回值

类型: `VasKeypoints['vasInfo']`

{Promise<VasKeypoints['vasInfo']>} 千分之一亮度相关 VAS 数组；不支持时可能为 undefined。需网络。

###### 引用对象

###### `interface` VasKeypoints

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `bizId` | `string` | 是 | 业务 ID |
| `bizType` | `number` | 是 | 业务类型 |
| `vasInfo` | `Object[]` | 是 | VAS 信息 |

###### `type` VasKeypoints.vasInfo

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `vasCode` | `string` | 是 | VAS 代码 |
| `abilityEnabled` | `boolean` | 是 | 能力是否启用 |
| `keyPoints` | `__type[]` | 是 | 关键点 |

###### 示例代码

###### 示例

```typescript
const vasInfo = await sdm.lampAdv.getAdvancedBrightnessVas();
vasInfo?.forEach(item => console.log(item.vasCode, item.abilityEnabled, item.keyPoints));
```

**注意事项**

1. 该方法使用 `thousandthBright` 能力代码获取千分之一亮度 VAS 信息
2. 如果设备不支持千分之一亮度功能，可能返回空数组或 `null`
3. 该方法会调用云端接口获取 VAS 信息，需要网络连接
4. VAS 信息中的关键点数据可以用于构建亮度滑动条的显示范围
## 常见问题

### 为什么在 SdmProvider 中 usePageEvent 监听不到页面事件？

在小程序中，页面生命周期按顺序触发：Page.onLoad → 组件渲染 → 组件内的 useEffect / usePageEvent 注册。 
而 `SdmProvider` 为了保证设备数据就绪，会采用异步初始化（通过 `getDeviceInfo` / `getDeviceListByDevIds` 等 API）。当 `SdmProvider` 将渲染子组件延后，子组件可能在 Page.onLoad 之后才被挂载并注册事件处理器，导致 `usePageEvent('onLoad')` 永远无法收到已经触发过的 onLoad 事件。

**解决方案**：目前建议使用 useEffect 来 监听组件的挂载和卸载来替代页面生命周期事件的监听。

### 如何去掉每次 DP 点下发或上报的打印信息

在 SDM 中，为了方便开发者调试，默认会使用 [interceptors 拦截器](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/usage) 来打印每次 DP 点的下发和上报信息，如果您想去掉这些打印，可以通过调整 Log 配置的优先级来实现，参考以下示例：

```diff
diff --git a/src/devices/index.ts b/src/devices/index.ts
index 05f6421..2ede1a1 100644
--- a/src/devices/index.ts
+++ b/src/devices/index.ts
@@ -9,6 +9,9 @@ export const dpKit = createDpKit<SmartDeviceSchema>({ protocols });
 
 const deviceOptions = {
   interceptors: dpKit.interceptors,
+  logConfig: {
+    level: 'FATAL',
+  },
 } as SmartDeviceModel<SmartDeviceSchema>['options'];
 
 /**
```
