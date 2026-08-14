# 多设备管理 (multi-device)

[AI-generated summary: 涂鸦小程序中多设备管理的完整指南，用于在单一应用内独立管理多台设备的状态和控制命令。不依赖云侧群组机制，提供灵活的原子化设备操作和实时状态同步能力。覆盖内容：SmartDevicesManager, SmartDeviceModel, SdmProvider, useDevices, useDevicesProps, useDevicesActions, add, batchAdd, delete, batchDelete, init, destroy, isAllInitialized, getDevices, on, off, deviceManager, LogConfig]

## 多设备管理使用

多设备管理能力基于 `SmartDevicesManager` 与 `SdmProvider` 的扩展，用于在同一小程序内管理多台设备的状态与下发指令。

### 与智能群组模型的关系

**智能群组模型（SGM）** 面向的是通过 App 在设备详情页手动创建出来的**群组设备**，其群组面板是由涂鸦云侧感知并分配的，开发者通过 `SmartGroupModel` 接入，行为上与单设备面板一致。

**多设备管理** 则完全不同：它不依赖云侧群组概念，而是在小程序内部**自由管理**若干台独立设备实例，更加原子化——你可以随时在小程序里 `add` / `batchAdd` 任意设备 ID，并通过多设备 Hooks 独立读取每台设备的 DP 状态和发起控制，不受群组机制约束。典型场景包括网关子设备批量控制页、多设备联动面板等。

### 与单设备的关系

- **单设备**：使用 [智能设备模型（SDM）](/cn/miniapp/solution-panel/ability/common/sdm/usage)，通过 `SdmProvider value={singleDevice}` 提供 `useProps`、`useDevice`、`useActions` 等。
- **多设备管理**：通过 `SdmProvider` 的 `deviceManager` 注入 `SmartDevicesManager`，使用多设备 Hooks：`useDevices`、`useDevicesProps`、`useDevicesActions` 等，详见 [多设备管理 - Hooks](/cn/miniapp/solution-panel/ability/common/multi-device/hooks)。TypeScript 类型推导等说明见 [常见问题](/cn/miniapp/solution-panel/ability/common/multi-device/faq)。

### SdmProvider 多设备配置

多设备场景下，在根组件传入 `deviceManager`（`SmartDevicesManager` 实例），并可选用 `isNeedMainDeviceInitialized`、`isNeedAllDevicesInitialized` 控制何时完成初始化后再渲染子组件。

```tsx | pure
import React, { useEffect } from 'react';
import { SdmProvider, SmartDevicesManager } from '@ray-js/panel-sdk';

const deviceManager = new SmartDevicesManager();

export default function App({ children }) {
  useEffect(() => {
    deviceManager.init();
    return () => {
      deviceManager.destroy();
    };
  }, []);

  return (
    <SdmProvider
      deviceManager={deviceManager}
      isNeedMainDeviceInitialized={false}
      isNeedAllDevicesInitialized={false}
    >
      {children}
    </SdmProvider>
  );
}
```

`isNeedAllDevicesInitialized={true}` 时，SdmProvider 会等待所有已添加设备初始化完毕后再渲染子组件；`false` 时立即渲染，子组件自行处理加载状态。推荐在设备列表确定的场景下开启，不确定设备数量时设为 `false`。

### 典型场景

#### 场景一：启动阶段即可获取所有设备 ID

适用于网关子设备批量控制等场景，启动时通过 `batchAdd` 一次性添加全部设备：

```tsx | pure
import { SmartDevicesManager, SdmProvider } from '@ray-js/panel-sdk';

const deviceManager = new SmartDevicesManager();

// 在组件外或 useEffect 中调用
deviceManager.batchAdd([
  { key: 'lamp1', deviceId: 'xxx_device_id_1' },
  { key: 'lamp2', deviceId: 'xxx_device_id_2' },
]);
```

#### 场景二：主设备先就绪，子设备异步加载

主设备用 `SmartDeviceModel` 单独初始化并传给 `value`，子设备通过 `deviceManager.add` / `batchAdd` 异步添加：

```tsx | pure
import { SmartDeviceModel, SmartDevicesManager, SdmProvider } from '@ray-js/panel-sdk';

const mainDevice = new SmartDeviceModel({ deviceId: 'main_device_id' });
const deviceManager = new SmartDevicesManager();

export default function App({ children }) {
  useEffect(() => {
    mainDevice.init();
    deviceManager.init();
    // 异步获取子设备后再 add
    fetchSubDeviceIds().then(ids => {
      deviceManager.batchAdd(ids.map((deviceId, i) => ({ key: `sub${i}`, deviceId })));
    });
    return () => { deviceManager.destroy(); };
  }, []);

  return (
    <SdmProvider
      value={mainDevice}
      deviceManager={deviceManager}
      isNeedMainDeviceInitialized
      isNeedAllDevicesInitialized={false}
    >
      {children}
    </SdmProvider>
  );
}
```

API 详见 [多设备管理 - API](/cn/miniapp/solution-panel/ability/common/multi-device/api)（add、delete、batchAdd、batchDelete）。

## API

#### SmartDevicesManager

> [VERSION] @ray-js/panel-sdk >= 1.16.0

##### 描述

多设备管理器：统一管理多个设备实例，负责批量初始化、全局事件路由、全局状态缓存，以及 add / batchAdd / delete 等标准化操作。 构造器本身零副作用，不会注册任何全局监听。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `{ logConfig?: LogConfig }` | 否 | 配置选项 |

##### 返回值

类型: `SmartDevicesManager`

SmartDevicesManager 实例

###### 方法

| 方法名 | 说明 |
| --- | --- |
| `init` | 开始监听全局事件（Ray 全局 DP/上下线等），幂等调用。 |
| `on` | 订阅多设备管理器变更事件。 SdmProvider 内部已通过 change 事件驱动多设备 Hooks 刷新；常规业务通常无需手动监听。 仅在 Provider 外部监听设备状态变化（如全局日志、非 React 组件等场景）时使用。 |
| `off` | 取消订阅多设备管理器变更事件。 需传入与 on 时相同的事件名和回调引用。 |
| `add` | 添加单个设备实例并完成初始化。 若尚未 init() 会先自动 init()，保证向后兼容。 常见场景是动态添加单台关联设备；若 deviceId 已存在则抛出错误。 |
| `batchAdd` | 批量向多设备管理器中添加设备实例。内部会先批量拉取设备信息（单次网络请求），再按 concurrency 并发初始化，支持部分失败并在返回结果中区分成功与失败列表。 每台设备都可独立配置 interceptors 与 logConfig。 |
| `delete` | 删除设备实例。 从多设备管理器中删除指定 key 对应的设备实例，自动调用该实例的 destroy() 并清理内部映射。 |
| `batchDelete` | 批量删除多设备管理器中指定 key 列表对应的设备实例，内部对每个 key 依次调用 delete({ key })，自动触发实例销毁与内部映射清理。 |
| `getDevices` | 获取所有已注册设备实例的浅拷贝，以 key 为索引。 常用于需要直接操作设备实例而非通过 Hooks 的场景，例如在事件回调中遍历所有设备。 |
| `isAllInitialized` | 检查所有已添加设备是否已初始化完成。 |
| `destroy` | 销毁多设备管理器：注销所有全局事件监听器、移除全部 change 事件订阅、销毁并清理所有设备实例与内部映射。 |

###### 引用对象

###### `type` LogConfig

日志配置

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `level` | `"VERBOSE" \| "SUCCESS" \| "INFO" \| "WARN" \| "FATAL"` | 否 | 日志输出级别，默认 INFO |

##### 示例代码

###### 创建多设备管理器

```ts
const manager = new SmartDevicesManager();
manager.init();
manager.add({ key: 'lamp1', deviceId: '1234567890' });
manager.add({ key: 'lamp2', deviceId: '1234567891' });
```
#### SmartDevicesManager.init

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 add / batchAdd 会自动调用 init()，因此如需在添加设备前预先注册全局监听（如监听 change 事件），可先手动调用一次 init()。

##### 描述

开始监听全局事件（Ray 全局 DP/上下线等），幂等调用。

##### 参数

无

##### 返回值

无

##### 示例代码

###### 预先注册全局监听

```ts
import React, { useEffect } from 'react';
import { SmartDevicesManager, SdmProvider } from '@ray-js/panel-sdk';

const deviceManager = new SmartDevicesManager();

export default function App({ children }) {
  useEffect(() => {
    deviceManager.init(); // 开始监听全局事件
    return () => {
      deviceManager.destroy(); // 组件卸载时清理
    };
  }, []);

  return (
    <SdmProvider deviceManager={deviceManager} isNeedMainDeviceInitialized={false}>
      {children}
    </SdmProvider>
  );
}
```
#### SmartDevicesManager.getDevices

> [VERSION] @ray-js/panel-sdk >= 1.16.0

##### 描述

获取所有已注册设备实例的浅拷贝，以 key 为索引。 常用于需要直接操作设备实例而非通过 Hooks 的场景，例如在事件回调中遍历所有设备。

##### 参数

无

##### 返回值

类型: `Record<string, SmartDeviceModel>`

所有设备实例的记录对象

##### 示例代码

###### 获取设备实例集合

```ts
const instances = manager.getDevices();
Object.values(instances).forEach(device => {
  device.publishDps({ switch_led: true });
});
```
#### SmartDevicesManager.add

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 若 deviceId 已存在则会抛出错误

##### 描述

添加单个设备实例并完成初始化。 若尚未 init() 会先自动 init()，保证向后兼容。 常见场景是动态添加单台关联设备；若 deviceId 已存在则抛出错误。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `config` | `AddConfig` | 是 | 设备配置 |

##### 返回值

类型: `Promise<SmartDeviceModel>`

初始化完成的设备实例

###### 引用对象

###### `type` AddConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 设备实例在管理器中的唯一键名 |
| `deviceId` | `string` | 是 | 设备 ID |
| `interceptors` | `SmartDeviceModelInterceptors` | 否 | 该设备实例的拦截器配置，常见用于搭配 dp-kit 实现结构化 DP 转换，选填，默认不配置 |
| `logConfig` | `LogConfig` | 否 | 该设备实例的日志配置，选填，默认不配置 |

###### `type` LogConfig

日志配置

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `level` | `"VERBOSE" \| "SUCCESS" \| "INFO" \| "WARN" \| "FATAL"` | 否 | 日志输出级别，默认 INFO |

##### 示例代码

###### 动态添加单个设备

```ts
import { SmartDevicesManager, createDpKit } from '@ray-js/panel-sdk';

const deviceManager = new SmartDevicesManager();
const dpKit = createDpKit({ protocols });

const lamp = await deviceManager.add({
  key: 'lamp1',
  deviceId: 'xxx_device_id',
  interceptors: dpKit.interceptors,
  logConfig: { level: 'VERBOSE' },
});

lamp.getDevInfo();
```
#### SmartDevicesManager.delete

> [VERSION] @ray-js/panel-sdk >= 1.16.0

##### 描述

删除设备实例。 从多设备管理器中删除指定 key 对应的设备实例，自动调用该实例的 destroy() 并清理内部映射。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `Object` | 是 | 包含要删除的设备 key 的对象 |

###### SmartDevicesManager.delete.params 的属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `key` | `string` | 是 | - |  |

##### 返回值

无

##### 示例代码

###### 删除单个设备

```ts
manager.delete({ key: 'lamp1' });
```
#### SmartDevicesManager.batchAdd

> [VERSION] @ray-js/panel-sdk >= 1.16.0

##### 描述

批量向多设备管理器中添加设备实例。内部会先批量拉取设备信息（单次网络请求），再按 concurrency 并发初始化，支持部分失败并在返回结果中区分成功与失败列表。 每台设备都可独立配置 interceptors 与 logConfig。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `configs` | `AddConfig[]` | 是 | 设备配置列表 |
| `options` | `BatchAddOptions` | 否 | 配置选项 |

##### 返回值

类型: `Promise<BatchAddResult>`

包含 success 与 failed 的结果对象；其中 success 为成功初始化的设备实例映射，failed 为初始化失败的设备列表

###### 引用对象

###### `type` AddConfig

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 设备实例在管理器中的唯一键名 |
| `deviceId` | `string` | 是 | 设备 ID |
| `interceptors` | `SmartDeviceModelInterceptors` | 否 | 该设备实例的拦截器配置，常见用于搭配 dp-kit 实现结构化 DP 转换，选填，默认不配置 |
| `logConfig` | `LogConfig` | 否 | 该设备实例的日志配置，选填，默认不配置 |

###### `type` BatchAddOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `concurrency` | `number` | 否 | 并发初始化数量，默认 5（避免一次性批量调用过多 API 导致异常） |

###### `type` BatchAddResult

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `success` | `Record<string, SmartDeviceModel>` | 是 | 成功初始化的设备实例映射 |
| `failed` | `FailedDeviceInfo[]` | 是 | 初始化失败的设备列表 |

###### `type` LogConfig

日志配置

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `level` | `"VERBOSE" \| "SUCCESS" \| "INFO" \| "WARN" \| "FATAL"` | 否 | 日志输出级别，默认 INFO |

##### 示例代码

###### 批量添加设备

```ts
import { SmartDevicesManager, createDpKit } from '@ray-js/panel-sdk';

const deviceManager = new SmartDevicesManager();
const dpKit = createDpKit({ protocols });

const result = await deviceManager.batchAdd([
  {
    key: 'lamp1',
    deviceId: 'xxx_device_id_1',
    interceptors: dpKit.interceptors, // 搭配 dp-kit 使用结构化 DP
  },
  {
    key: 'lamp2',
    deviceId: 'xxx_device_id_2',
    interceptors: dpKit.interceptors,
    logConfig: { level: 'VERBOSE' }, // 单独开启此设备的详细日志
  },
  {
    key: 'failedDevice',
    deviceId: 'invalid_device_id',
  },
], { concurrency: 5 });

if (result.failed.length > 0) {
  console.warn('部分设备初始化失败:', result.failed);
}
// batchAdd 返回示例：
{
  "success": {
    "lamp1": "<SmartDeviceModel>",
    "lamp2": "<SmartDeviceModel>"
  },
  "failed": [
    {
      "key": "failedDevice",
      "deviceId": "invalid_device_id",
      "error": "Device info not found for invalid_device_id"
    }
  ]
}
```
#### SmartDevicesManager.batchDelete

> [VERSION] @ray-js/panel-sdk >= 1.16.0

##### 描述

批量删除多设备管理器中指定 key 列表对应的设备实例，内部对每个 key 依次调用 delete({ key })，自动触发实例销毁与内部映射清理。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `keys` | `string[]` | 是 | 设备实例 key 列表 |

##### 返回值

无

##### 示例代码

###### 批量删除设备

```ts
deviceManager.batchDelete(['lamp1', 'lamp2']);
```
#### SmartDevicesManager.destroy

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 在 useEffect return 或组件 componentWillUnmount 中务必调用 destroy()，避免全局事件监听残留或内存泄漏。

##### 描述

销毁多设备管理器：注销所有全局事件监听器、移除全部 change 事件订阅、销毁并清理所有设备实例与内部映射。

##### 参数

无

##### 返回值

无

##### 示例代码

###### 销毁设备管理器

```ts
// 页面卸载或清空设备时调用
manager.destroy();
```
#### SmartDevicesManager.on

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 常见事件类型包括：add、init、initComplete、initProgress、delete、dpDataChange、deviceOnlineStatusUpdate / deviceInfoUpdated、networkStatusChange、bluetoothAdapterStateChange。

##### 描述

订阅多设备管理器变更事件。 SdmProvider 内部已通过 change 事件驱动多设备 Hooks 刷新；常规业务通常无需手动监听。 仅在 Provider 外部监听设备状态变化（如全局日志、非 React 组件等场景）时使用。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `event` | `"change"` | 是 | 事件名，固定为 change |
| `handler` | `(event: { type: string; [key: string]: any }) => void` | 是 | 事件回调函数 |

##### 返回值

无

##### 示例代码

###### 监听不同事件类型并读取返回结构

```ts
manager.on('change', event => {
  switch (event.type) {
    case 'add':
    case 'init':
      console.log(event.key, event.instance);
      break;
    case 'initProgress':
      console.log(event.progress.total, event.progress.initialized, event.progress.keys);
      break;
    case 'dpDataChange':
    case 'deviceOnlineStatusUpdate':
    case 'deviceInfoUpdated':
      console.log(event.key, event.instance, event.data);
      break;
    case 'networkStatusChange':
    case 'bluetoothAdapterStateChange':
      console.log(event.data);
      break;
    case 'initComplete':
      console.log('all initialized');
      break;
    case 'delete':
      console.log(event.key);
      break;
  }
});
```
#### SmartDevicesManager.off

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 注意回调引用保持一致，否则无法取消监听。

##### 描述

取消订阅多设备管理器变更事件。 需传入与 on 时相同的事件名和回调引用。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `event` | `"change"` | 是 | 事件名，固定为 change |
| `handler` | `(event: { type: string; [key: string]: any }) => void` | 是 | 事件回调函数 |

##### 返回值

无

##### 示例代码

###### 取消监听设备变更事件

```ts
const handleChange = event => {
  console.log(event.type);
};

manager.on('change', handleChange);
manager.off('change', handleChange);
```

## Hooks

#### useDevices

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 使用前需挂载 SdmDevicesProvider 并配置关联设备映射。
> 性能优化（最佳实践）：
> 1. 始终使用 selector 精确挑选数据，例如 useDevices(devices => devices.main?.network)，确保仅当依赖数据改变时才触发组件重渲染。
> 2. 对于派生计算等复杂场景，可利用 equalityFn 自定义比对逻辑以阻断无效渲染。
> 3. 若希望 devicesData.lamp1、devicesData.lamp2 等获得完整 DP 类型推导，请参考 [多设备管理 - 常见问题](/cn/miniapp/solution-panel/ability/common/multi-device/faq)。

##### 描述

获取关联设备实例列表的状态集合数据。 不传 selector 时返回完整设备数据集合，任一设备的任何状态变化都会触发重渲染。强烈推荐始终传入 selector 仅选取所需属性，或提供自定义 equalityFn，以优化渲染性能并避免无效渲染。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `selector` | `(devicesData: { [key: string]: DeviceData }) => any;` | 否 | 选择器函数，入参为所有关联设备的状态集合对象。   key 为设备标识，value 包含 devInfo、dpSchema、network、bluetooth 四个属性 |
| `equalityFn` | `(prev: any, next: any) => boolean;` | 否 | 自定义比较函数，返回 true 则不触发重渲染，默认 shallow equal |

##### 返回值

类型: `any`

匹配选择器的设备状态数据，类型由 selector 返回值自动推导

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

###### 获取指定设备的网络状态

```tsx
import { useDevices } from '@ray-js/panel-sdk';

function DeviceNetworkStatus() {
  // 仅当 main 设备的 network 状态发生改变时才触发当前组件重渲染
  const mainNetwork = useDevices(devices => devices.main?.network);
  return <Text>在线: {mainNetwork?.isOnline ? '是' : '否'}</Text>;
}
```

###### 自定义 rerender 策略

```tsx
import { useDevices } from '@ray-js/panel-sdk';

function DeviceNetworkStatus() {
  // 仅当特定逻辑判定网络连接情况发生实质变更时更新
  const network = useDevices(
    devices => devices.main?.network,
    (prev, next) => prev?.isConnected === next?.isConnected
  );
  return <Text>在线: {network?.isConnected ? '是' : '否'}</Text>;
}
```

###### 获取所有设备的基础信息

```tsx
import { useDevices } from '@ray-js/panel-sdk';

function DeviceList() {
  const allDevices = useDevices();
  return (
    <View>
      {Object.entries(allDevices).map(([key, data]) => (
        <Text key={key}>{data.devInfo.name}</Text>
      ))}
    </View>
  );
}
```
#### useDevicesProps

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 使用前需挂载 SdmDevicesProvider 并配置关联设备映射。
> 性能优化（最佳实践）：
> 1. 强烈建议始终将 selector 的颗粒度精确到具体的功能点，例如 useDevicesProps(props => props.main?.switch_led)，避免全量订阅导致无关设备或无关功能点改变时引发无效的重渲染。
> 2. 如果 selector 必须返回包含多个字段的对象，由于默认使用浅比较（shallow equal），只要提取的值未发生改变就不会触发重渲染。必要时也可传入 equalityFn 进行深度定制。

##### 描述

获取关联设备的功能点状态集合数据。

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `selector` | `(devicesProps: { [key: string]: DpState }) => DpValue;` | 是 | 选择器函数，入参为所有关联设备的 props 集合对象。   key 为设备标识，value 为该设备的功能点键值对 |
| `equalityFn` | `(prev: DpValue, next: DpValue) => boolean;` | 否 | 自定义比较函数，返回 true 则不触发重渲染，默认 shallow equal |

##### 返回值

类型: `DpValue`

匹配选择器的功能点值，类型由 selector 返回值自动推导

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

###### 仅订阅单台设备的特定状态

```tsx
import { useDevicesProps } from '@ray-js/panel-sdk';

export default function Lamp1Switch() {
  // 仅在 lamp1 的 switch_led 变化时重渲染
  const switchLed = useDevicesProps(p => p?.lamp1?.switch_led);

  return <Text>lamp1 开关：{switchLed ? 'ON' : 'OFF'}</Text>;
}
```

###### 自定义 rerender

```tsx
// useDevicesProps 内部已针对 selector 返回值做 shallow equal 浅比较，无特殊场景时无需传入 equalityFn。
import { useDevicesProps } from '@ray-js/panel-sdk';

export default function PowerMap() {
  const powerMap = useDevicesProps(
    p => {
      const map: Record<string, boolean> = {};
      Object.keys(p ?? {}).forEach(k => { map[k] = !!p[k]?.switch_led; });
      return map;
    },
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );

  return (
    <View>
      {Object.keys(powerMap).map(k => (
        <Text key={k}>{k}: {powerMap[k] ? 'ON' : 'OFF'}</Text>
      ))}
    </View>
  );
}
```
#### useDevicesActions

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 注意事项：
> 使用前需挂载 SdmDevicesProvider 并配置关联设备映射。
> 常与 useDevicesProps 搭配使用，useDevicesProps 读取状态、useDevicesActions 下发指令。
> 该 Hooks 返回的 actions 方法是对底层 publishDps 的封装，调用 actions 并不会导致组件立即重渲染。
> 只有当指令下发成功且设备上报新的 DP 状态时，使用了对应 useDevicesProps 且 selector 命中的组件才会被触发重渲染。

##### 描述

获取关联设备的功能点操作方法集合

##### 参数

无

##### 返回值

类型: `{ [key: string]: DpActions }`

设备操作方法集合，key 为设备标识，value 为该设备的 actions 对象。
  每个设备的 actions 使用方式与单设备 useActions 一致

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

###### 控制指定设备的各类型 DP 功能点

```tsx
// devices/schema.ts — as const 是类型推导的基石，set 为通用方法，其余为类型专属快捷方法
import { useDevicesActions, useDevicesProps } from '@ray-js/panel-sdk';

export const schema = [
  { code: 'switch_led',  property: { type: 'bool' }, type: 'obj', mode: 'rw', id: 1, name: '开关' },
  { code: 'brightness',  property: { type: 'value', min: 10, max: 1000, step: 1 }, type: 'obj', mode: 'rw', id: 2, name: '亮度' },
  { code: 'work_mode',   property: { type: 'enum', range: ['white', 'colour'] }, type: 'obj', mode: 'rw', id: 3, name: '模式' },
  { code: 'fault',       property: { type: 'bitmap', maxlen: 8 }, type: 'obj', mode: 'ro', id: 4, name: '故障' },
  { code: 'colour_data', property: { type: 'string', maxlen: 255 }, type: 'obj', mode: 'rw', id: 5, name: '颜色' },
] as const;

export default function MultiDeviceControl() {
  const actions = useDevicesActions();
  // 推荐：精确选用需要的状态，避免无关变化引起无意义渲染
  const mainSwitch = useDevicesProps(props => props.main?.switch_led);

  const handleToggle = () => {
    // ✅ set — 所有类型通用
    actions.main?.switch_led.set(true);            // bool
    actions.main?.brightness.set(500);             // value
    actions.main?.work_mode.set('colour');         // enum（IDE 提示 'white' | 'colour'）
    actions.main?.fault.set(3);                    // number(bitmap)
    actions.main?.colour_data.set('000003e803e8'); // string

    // bool 专属：on / off / toggle
    actions.main?.switch_led.toggle();
    actions.main?.switch_led.on();
    actions.main?.switch_led.off();

    // value 专属：inc / dec（按 step 步进，自动 clamp 到 min~max）
    actions.main?.brightness.inc();               // +1（默认 step）
    actions.main?.brightness.dec(100);            // -100

    // enum 专属：prev / next / random
    actions.main?.work_mode.next();               // 切换到下一个枚举值
    actions.main?.work_mode.prev();

    // bitmap 专属：on(idx) / off(idx) / toggle(idx)
    actions.main?.fault.on(0);                    // 置位 bit 0
    actions.main?.fault.off(1);                   // 清除 bit 1
    actions.main?.fault.toggle(2);                // 翻转 bit 2
  };

  return (
    <View onClick={handleToggle}>
      <Text>主设备: {mainSwitch ? '开' : '关'}</Text>
    </View>
  );
}
```
#### useStructuredDevicesProps

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 使用前需同时满足：
> 1. 挂载 SdmDevicesProvider 并配置关联设备映射
> 2. 各设备初始化时已配置 dp-kit 拦截器（createDpKit）
> 性能优化（最佳实践）：
> 1. 强烈建议始终将 selector 的颗粒度精确到具体的功能点，例如 useStructuredDevicesProps(props => props.main?.colour_data)，避免全量订阅导致无关设备或无关功能点改变时引发无效的重渲染。
> 2. 如果 selector 必须返回包含多个字段的对象，由于默认使用浅比较（shallow equal），只要提取的值未发生改变就不会触发重渲染。必要时也可传入 equalityFn 进行深度定制。

##### 描述

获取关联设备的结构化功能点状态，需配合 dp-kit 拦截器使用

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `selector` | `(structuredDevicesProps: { [key: string]: Record<string, any> }) => any;` | 是 | 选择器函数，入参为所有关联设备的结构化 props 集合。   key 为设备标识，value 为该设备经 dp-kit 解析后的结构化功能点数据 |
| `equalityFn` | `(prev: any, next: any) => boolean;` | 否 | 自定义比较函数，返回 true 则不触发重渲染，默认 shallow equal |

##### 返回值

类型: `any`

匹配选择器的结构化功能点值

##### 示例代码

###### 仅订阅单台设备的特定状态

```tsx
import { useStructuredDevicesProps } from '@ray-js/panel-sdk';

export default function MainDeviceColour() {
  // 精确选取 main 设备的 colour_data，仅在它改变时才重渲染
  const colourData = useStructuredDevicesProps(
    props => props.main?.colour_data
  );
  return <Text>H: {colourData?.h}, S: {colourData?.s}, V: {colourData?.v}</Text>;
}
```

###### 配置 dp-kit 并使用结构化状态（完整接入链路）

```tsx
// ---- 1. Parser：自定义 Transformer 示例（以 colour_data 为例） ----
type TColorData = { hue: number; saturation: number; value: number };
class ColourTransformer implements Transformer<TColorData> {
  defaultValue = { hue: 10, saturation: 1000, value: 1000 };
  uuid = 'colour_data';
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

// ---- 2. 配置 dpKit 并注入 SmartDevicesManager ----
import { createDpKit, SmartDevicesManager, useStructuredDevicesProps } from '@ray-js/panel-sdk';
import { lampSchemaMap } from '@/devices/schema';

const dpKit = createDpKit({
  protocols: {
    [lampSchemaMap.colour_data.code]: new ColourTransformer(),
  }
});
const deviceManager = new SmartDevicesManager();

// batchAdd 时注入 dp-kit 拦截器
deviceManager.batchAdd([
  { key: 'lamp1', deviceId: 'xxx_device_id_1', interceptors: dpKit.interceptors },
  { key: 'lamp2', deviceId: 'xxx_device_id_2', interceptors: dpKit.interceptors },
]);

// ---- 3. 页面组件消费结构化数据 ----
export default function ColourDataList() {
  // 推荐：精确选用需要的状态，例如 p => p.lamp1?.colour_data
  const structured = useStructuredDevicesProps(p => p);

  return (
    <View>
      {Object.keys(structured ?? {}).map(key => (
        <Text key={key}>
          {key} colour_data: hue={structured[key]?.colour_data?.hue}
        </Text>
      ))}
    </View>
  );
}
```

###### 自定义 rerender

```tsx
// useStructuredDevicesProps 内部已针对 selector 返回值做 shallow equal 浅比较，无特殊场景时无需传入 equalityFn。
import { useStructuredDevicesProps } from '@ray-js/panel-sdk';

export default function WorkModeMap() {
  const workModeMap = useStructuredDevicesProps(
    p => {
      const map: Record<string, string> = {};
      Object.keys(p ?? {}).forEach(k => { map[k] = p[k]?.work_mode; });
      return map;
    },
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );

  return (
    <View>
      {Object.keys(workModeMap).map(k => (
        <Text key={k}>{k}: {workModeMap[k]}</Text>
      ))}
    </View>
  );
}
```
#### useStructuredDevicesActions

> [VERSION] @ray-js/panel-sdk >= 1.16.0

> 💡 使用前需同时满足：
> 1. 挂载 SdmDevicesProvider 并配置关联设备映射
> 2. 各设备初始化时已配置 dp-kit 拦截器（createDpKit）
> 注意事项：
> 该 Hooks 返回的 actions 方法是对底层 publishDps 的封装，调用 actions 并不会导致组件立即重渲染。
> 只有当指令下发成功且设备上报新的 DP 状态时，使用了对应 useStructuredDevicesProps 且 selector 命中的组件才会被触发重渲染。

##### 描述

获取关联设备的结构化功能点操作方法集合，需配合 dp-kit 拦截器使用

##### 参数

无

##### 返回值

类型: `DevicesActions`

结构化操作方法集合，key 为设备标识，value 为该设备的结构化 actions。
  使用方式与单设备 useStructuredActions 一致

**`interface` DevicesActions**

```typescript
interface DevicesActions {
  [key: string]: {
    set: (value: object, options?: SendDpOption) => Promise<boolean>;
  };
}
```

###### 引用对象

###### `interface` DevicesActions

```typescript
interface DevicesActions {
  [key: string]: {
    set: (value: object, options?: SendDpOption) => Promise<boolean>;
  };
}
```

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

###### 完整链路：配置 dp-kit + 读取 + 下发（以照明 colour_data 为例）

```tsx
// ---- 1. devices/protocols/index.ts：实例化 parser 并映射到 DP code ----
import { protocols as sdkProtocols } from '@ray-js/panel-sdk';
import { lampSchemaMap } from '../schema';

export const protocols = {
  [lampSchemaMap.colour_data.code]: new sdkProtocols.ColourTransformer(),
  // ColourTransformer.parser()  返回 { hue, saturation, value } → useStructuredDevicesProps 读
  // ColourTransformer.formatter() 接收 { hue, saturation, value } → useStructuredDevicesActions 写
};

// ---- 2. devices/index.ts：创建 dpKit 并注入 SmartDevicesManager ----
import { createDpKit, SmartDevicesManager } from '@ray-js/panel-sdk';
import { protocols } from '@/devices/protocols';

export const dpKit = createDpKit({ protocols });
export const deviceManager = new SmartDevicesManager();

// batchAdd 时注入 dp-kit 拦截器
deviceManager.batchAdd([
  { key: 'lamp1', deviceId: 'xxx_device_id_1', interceptors: dpKit.interceptors },
  { key: 'lamp2', deviceId: 'xxx_device_id_2', interceptors: dpKit.interceptors },
]);

// ---- 3. 页面组件：通过 useStructuredDevicesActions 下发结构化数据 ----
import { View, Text } from '@ray-js/ray';
import { useStructuredDevicesProps, useStructuredDevicesActions } from '@ray-js/panel-sdk';

export default function ColourControl() {
  // 推荐：精确选用需要的状态，避免无关变化引起无意义渲染
  const colourData = useStructuredDevicesProps(props => props.lamp1?.colour_data);
  const actions = useStructuredDevicesActions();

  const setHue = (hue: number) => {
    actions.lamp1?.colour_data.set({ ...colourData, hue });
  };

  return (
    <View onClick={() => setHue(120)}>
      <Text>当前 hue: {colourData?.hue}</Text>
      <Text>点击设置 hue 为 120</Text>
    </View>
  );
}
```
## 常见问题

### TypeScript 类型推导：如何让 useDevices / useDevicesProps 等获得完整 DP 类型？

`useDevices`、`useDevicesProps`、`useDevicesActions`、`useStructuredDevicesProps`、`useStructuredDevicesActions` 等多设备 Hooks 默认返回泛型类型，无法推导各设备 key 对应的具体 DP。推荐在项目的 `typings/sdm.d.ts` 中通过 `declare module` 覆写返回类型，实现 **按设备 key 精确绑定 Schema**。

#### 第一步：为每种设备定义独立 Schema

在 `src/devices/schema.ts` 中，按设备 PID（角色）分别导出 Schema：

```typescript
// src/devices/schema.ts

/** 主设备 Schema */
export const mainDeviceSchema = [ /* 主设备实际 DPs */ ] as const;

/** lamp1 设备 Schema (PID: xxx) */
export const lampSchema = [ /* 灯具实际 DPs */ ] as const;
```

#### 第二步：在 typings/sdm.d.ts 中覆写多设备 Hooks 类型

以 `useDevices` 为例，覆写返回的 `MultiDevicesData`；`useDevicesProps`、`useDevicesActions` 等会基于同一设备映射类型获得推导：

```typescript
// typings/sdm.d.ts
export type LampSchema = typeof import('@/devices/schema').lampSchema;
type LampDevice = import('@ray-js/panel-sdk').SmartDeviceModel<LampSchema>;

declare module '@ray-js/panel-sdk' {
  export type LampInstanceData = {
    devInfo: ReturnType<LampDevice['getDevInfo']>;
    dpSchema: ReturnType<LampDevice['getDpSchema']>;
    network: ReturnType<LampDevice['getNetwork']>;
    bluetooth: ReturnType<LampDevice['getBluetooth']>;
  };

  // 按项目实际设备 key 定义映射
  export type MultiDevicesData = {
    main?: SmartDeviceInstanceData;
    lamp1?: LampInstanceData;
    lamp2?: LampInstanceData;
  };
  export function useDevices(): MultiDevicesData;
  export function useDevices<V>(
    selector: (devicesData: MultiDevicesData) => V,
    equalityFn?: (a: V, b: V) => boolean
  ): V;
}
```

覆写后，所有多设备 Hooks 调用侧无需改动即可获得完整 DP 推导，例如：

```tsx | pure
const devicesData = useDevices();
devicesData.lamp1?.dpSchema.switch_led;   // ✓

const props = useDevicesProps(p => p);
props.lamp1?.switch_led;                   // ✓
```

#### 个别页面设备类型不同时：局部类型收窄

若某个页面中特定 key 绑定了不同 Schema 的设备，可在该页面局部定义类型并通过 `as` 收窄，不影响其他页面：

```tsx | pure
import type { SmartDeviceInstanceData, LampInstanceData } from '@ray-js/panel-sdk';
import type { OtherLampInstanceData } from './types';

type MyPageDevicesData = {
  main?: SmartDeviceInstanceData;
  lamp1?: LampInstanceData;
  lamp2?: OtherLampInstanceData;
};

const devicesData = useDevices() as MyPageDevicesData;
```
