# 智能群组模型

[AI-generated summary: SmartGroupModel（SGM）是基于OOP的智能群组编程模型，在Ray/React面板开发中为群组场景提供统一的编程范式，兼容智能设备模型（SDM）的大部分能力，但针对群组特性进行了优化和差异化处理。该文档详细阐述了SGM与SDM的兼容性、使用限制、最佳实践及完整API接口。覆盖内容：SmartGroupModel、GroupInfo、useProps、useActions、useStructuredProps、useStructuredActions、useDevice、useBuiltInAlarm、useCustomAlarm、tapToRun、alarm、publishDps、interceptors、abilities、DP Schema]

一个基于 OOP 的智能群组编程模型，即 Smart Group Model（SGM），在面板业务开发过程中，统一围绕着智能群组的编程范式。

此外，智能群组模型是在智能设备模型的基础上实现的，因此其能力与智能设备模型兼容。但是，由于智能群组模型是为群组场景而设计的，因此在部分功能上与设备模型有所区别。如果您需要了解这些区别，可以查阅 [API 文档](/cn/miniapp/solution-panel/ability/common/sgm/api/init)。至于其他功能，您可以参考智能设备模型的以下文档：

- [使用](/cn/miniapp/solution-panel/ability/common/sdm/usage)
- [Hooks](/cn/miniapp/solution-panel/ability/common/sdm/hooks/useProps)
- [拦截器](/cn/miniapp/solution-panel/ability/common/sdm/interceptors/usage)
- [状态管理](/cn/miniapp/solution-panel/ability/common/sdm/state-manager)

## 如何使用

```shell
$ yarn add @ray-js/panel-sdk

# or

$ npm install @ray-js/panel-sdk
```

> Ray / React 项目

## 使用

**智能群组模型（SGM）** 是在群组环境下运行的对 **智能设备模型（SDM）** 的扩展。设计目标是尽量保证与 SDM 的 API 兼容，从而减少业务层的改动。大多数 SDM 的 Hooks 与 API 在 SGM 下可直接使用，但部分能力在群组场景下无法实现或语义不同，需要开发者注意并进行兼容处理。

<Alert type="warning">
  智能群组模型目前暂不支持以下能力：
  - 通用能力中的一键执行（tapToRun）
  - 通用能力中的告警推送（alarm）
</Alert>

在开始使用智能群组模型之前，建议先阅读 [智能设备的使用文档](/cn/miniapp/solution-panel/ability/common/sdm/usage)，SDM 的大部分示例与模式在群组场景下仍然适用：

### 差异说明

总体上 SGM 与 SDM 保持兼容，但在群组场景存在若干不可对齐的能力与行为差异，需在业务层予以关注：

- **功能限制**：通用能力中的一键执行（tapToRun）与告警推送（alarm）在群组场景不可用，因此相关 Hooks（如 useBuiltInAlarm、useCustomAlarm）也不可用或返回空结果。
- **语义/行为差异**：群组的设备信息结构、状态同步在细节上可能与单设备不同。
- **性能与并发**：群组操作通常会触发对多个设备的并发请求，针对不同设备协议类型，需注意节流与容错策略。

### 最佳实践

下面给出兼容性处理建议、Hooks 兼容实践，便于确保在群组环境下的稳定运行：

#### 功能限制的兼容处理

大部分 Hooks（例如 `useProps`、`useActions`、`useStructuredProps`、`useStructuredActions`）在 SGM 下仍然可用。针对受限能力的 API 或 Hooks，建议采用以下兼容策略：

重要：根据 [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)，Hooks 不能在条件语句中调用。对于可能不可用的 Hooks（如 useBuiltInAlarm、useCustomAlarm），应始终调用但处理返回的数据兼容性。

**正确的 Hooks 兼容方式**：

```typescript
import { getLaunchOptionsSync } from '@ray-js/ray';
import { useBuiltInAlarm, useCustomAlarm } from '@ray-js/panel-sdk';

const isGroupDevice = !!getLaunchOptionsSync()?.query?.groupId;

// ✅ 正确：始终调用 Hooks，处理返回数据的兼容性
const builtInAlarmData = useBuiltInAlarm();
const customAlarmData = useCustomAlarm();

// 在群组环境下，这些 Hooks 可能返回空或无效数据，需要做兼容处理
const safeBuiltInAlarms = isGroupDevice ? [] : (builtInAlarmData?.alarms || []);
const safeCustomAlarms = isGroupDevice ? [] : (customAlarmData?.alarms || []);
```

**API 调用的兼容处理**：

```typescript
import { useActions } from '@ray-js/panel-sdk';

const actions = useActions();

// 对于可能不存在的 API 方法，使用容错调用
const handleTapToRunTrigger = async () => {
  try {
    await actions.tapToRun?.trigger?.();
  } catch (e) {
    console.warn('一键执行功能在群组环境下不可用:', e);
    // 提供降级方案或用户提示
  }
};
```

#### 语义/行为差异的兼容处理

群组环境下的设备信息、状态同步可能与单设备有所不同，特别需要注意 `useDevice` 在群组环境下返回的是 `GroupInfo` 而非 `DeviceInfo`，因此可能缺少某些设备特有的字段。

```typescript
import { getLaunchOptionsSync } from '@ray-js/ray';
import { useDevice, useProps } from '@ray-js/panel-sdk';

const isGroupDevice = !!getLaunchOptionsSync()?.query?.groupId;

// useDevice 在群组环境下返回 GroupInfo，需要做字段兼容处理
const entityInfo = useDevice(device => device.devInfo);

// ✅ 安全的字段访问方式
const id = isGroupDevice 
  ? entityInfo.groupId // 群组设备
  : entityInfo.devId // 单设备

// ✅ 在线状态判断差异 - 群组的在线状态语义不同
const isOnline = isGroupDevice
  ? entityInfo?.deviceList?.some(dev => dev.isOnline) // 群组：只要有一个设备在线就认为在线
  : entityInfo?.isCloudOnline === true; // 单设备：必须明确在线
```

#### 性能与并发的兼容处理

在某些协议（如蓝牙本地群组）下，可能存在丢包现象，需要实现重试机制来保证操作的可靠性：

```typescript
import { getLaunchOptionsSync } from '@ray-js/ray';
import { useActions } from '@ray-js/panel-sdk';

const isGroupDevice = !!getLaunchOptionsSync()?.query?.groupId;
const actions = useActions();

// 重试机制实现
const withRetry = async (actionFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await actionFn();
      
      // 对于群组操作，检查是否所有设备都响应成功
      if (isGroupDevice && result?.failedDevices?.length > 0) {
        console.warn(`第 ${attempt} 次尝试，${result.failedDevices.length} 个设备响应失败`);
        if (attempt === maxRetries) {
          throw new Error(`重试 ${maxRetries} 次后仍有设备失败`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return result;
    } catch (error) {
      console.warn(`第 ${attempt} 次尝试失败:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // 指数退避策略
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
};

// 使用重试机制的操作示例
const handlePowerToggle = async () => {
  try {
    await withRetry(async () => {
      return await actions.power.toggle();
    });
    console.log('电源状态切换成功');
  } catch (error) {
    console.error('电源状态切换失败:', error);
    // 提供用户友好的错误提示
    showToast('操作失败，请检查设备连接状态');
  }
};
```

## API

#### SmartGroupModel

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 所有 DP 相关 API 的类型均由泛型 S（ReadonlyDpSchemaList）在编译期推导，
> S 来自业务项目 devices/schema.ts 中 as const 声明的 Schema 常量。Schema property.type 与 TypeScript 类型映射：
> - bool → boolean（true/false）
> - value → number（受 property.min/max/step 运行时约束，类型仅为 number）
> - enum → props 为 string；publishDps 入参为 property.range 字面量联合（如 'white' \| 'colour'）
> - bitmap → number（位运算值，配合 actions 的 on(idx)/off(idx) 操作指定 bit 位）
> - string → string
> - raw（外层 type='raw'）→ string与 SmartDeviceModel 类似，但专用于群组设备场景。
> 群组设备共享同一套 DP Schema，控制指令会下发给群组内所有设备。Schema 必须使用 as const 断言，否则字面量类型推导退化。

##### 描述

智能群组设备模型，提供群组设备功能点状态管理、事件监听、指令下发等核心能力

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `options` | `SmartGroupModelOptions` | 否 | 群组模型初始化配置，包含 abilities（高级能力列表）和 interceptors（事件拦截器）等选项 |

##### 返回值

类型: `SmartGroupModel`

SmartGroupModel 实例

###### 方法

| 方法名 | 说明 |
| --- | --- |
| `init` | 异步初始化智能群组后再返回其实例 |
| `onInitialized` | 注册智能群组模型初始化完毕事件回调 |
| `offInitialized` | 取消智能群组模型初始化完毕事件监听 |
| `getDevInfo` | 获取智能群组下的第一个设备信息并和智能群组合并后的数据 |
| `getGroupInfo` | 获取智能群组信息 |
| `getDpSchema` | 获取智能群组 DP Schema（DP 功能点描述）映射表 |
| `getDpState` | 获取智能群组功能点状态 |
| `getNetwork` | 获取智能群组所处环境的网络状态 |
| `getBluetooth` | 获取智能群组所处环境的蓝牙状态 |
| `onDpDataChange` | 监听群组设备 DP 功能点变更事件 |
| `onDeviceOnlineStatusUpdate` | 监听智能群组在线状态变更 |
| `onDeviceInfoUpdated` | 监听智能群组设备信息变更事件 |
| `onGroupDpDataChangeEvent` | 监听群组设备 DP 功能点变更事件 |
| `onGroupInfoChange` | 监听智能群组信息变更事件 |
| `onNetworkStatusChange` | 监听网络状态变化事件 |
| `onBluetoothAdapterStateChange` | 监听蓝牙适配器状态变化事件 |
| `offDpDataChange` | 取消监听智能群组 DP 功能点变更事件 |
| `offDeviceOnlineStatusUpdate` | 取消监听智能群组在线状态变更 |
| `offDeviceInfoUpdated` | 取消监听智能群组设备信息变更事件 |
| `offGroupDpDataChangeEvent` | 取消监听群组设备 DP 功能点变更事件 |
| `offGroupInfoChange` | 取消监听智能群组信息变更事件 |
| `offNetworkStatusChange` | 取消监听网络状态变化事件 |
| `offBluetoothAdapterStateChange` | 取消监听蓝牙适配器状态变化事件 |
| `publishDps` | 批量控制智能群组 DP 功能点 |
| `queryDps` | 主动查询设备功能点状态（群组不支持此操作） |
| `destroy` | 销毁当前智能群组实例，同时销毁所有事件监听器 |

###### 引用对象

###### `type` SmartGroupModelOptions

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `groupId` | `string` | 否 | 群组 ID，选填，默认从小程序环境启动参数自动获取 |

###### `type` SmartDeviceModelAbility

SmartDeviceModel 的 abilities 容器类型，仅用于泛型约束与内部组合。

```typescript
export type SmartDeviceModelAbility<A extends SmartDeviceAbility = SmartDeviceAbility> = {
  [abilityName: string]: A;
};
```

###### `type` LogConfig

日志配置

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `level` | `"VERBOSE" \| "SUCCESS" \| "INFO" \| "WARN" \| "FATAL"` | 否 | 日志输出级别，默认 INFO |

##### 示例代码

###### 基础初始化

```typescript
import { SmartGroupModel } from '@ray-js/panel-sdk';
import { defaultSchema } from './devices/schema';

type Schema = typeof defaultSchema;
const group = new SmartGroupModel<Schema>();
await group.init();

// 初始化后即可访问群组状态
const props = group.getDpState();      // { switch_led: boolean, work_mode: string, ... }
const groupInfo = group.getGroupInfo(); // 群组信息
```
#### SmartGroupModel.init

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 与 SmartDeviceModel.init 类似，但针对群组设备。
> 群组设备共享同一套 DP Schema，控制指令会下发给群组内所有设备。

##### 描述

异步初始化智能群组后再返回其实例

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `groupId` | `string` | 否 | 群组 ID，不传则从小程序环境启动参数自动获取 |

##### 返回值

类型: `Promise<SmartGroupModel>`

初始化完成的智能群组设备模型实例

##### 示例代码

###### 基础初始化

```typescript
import { SmartGroupModel } from '@ray-js/panel-sdk';

const schema = [
  { code: 'switch_led', property: { type: 'bool' }, type: 'obj', mode: 'rw', id: 1, name: 'Switch' },
  { code: 'brightness', property: { type: 'value', min: 10, max: 1000, step: 1 }, type: 'obj', mode: 'rw', id: 2, name: 'Brightness' },
] as const;

type Schema = typeof schema;
const group = new SmartGroupModel<Schema>();
await group.init();                   // 自动从小程序启动参数获取 groupId
await group.init('your-group-id');   // 或指定 groupId
```
#### SmartGroupModel.onInitialized

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

注册智能群组模型初始化完毕事件回调

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `(instance: SmartGroupModel) => void` | 是 | 初始化完毕后触发的回调函数，接收当前群组实例作为参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onInitialized((instance) => {
  console.log('群组初始化完成', instance.getGroupInfo().name);
});
```
#### SmartGroupModel.offInitialized

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

取消智能群组模型初始化完毕事件监听

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onInitialized 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onInitialized(() => { console.log('已初始化'); });
// 需要时取消监听
group.offInitialized(id);
```
#### SmartGroupModel.getDevInfo

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 这样设计是为了尽可能让使用智能设备模型 SDK 的开发者在绝大多数场景下不需要关心当前是单设备还是群组设备

##### 描述

获取智能群组下的第一个设备信息并和智能群组合并后的数据

##### 参数

无

##### 返回值

类型: `DevInfo`

合并后的设备信息对象，包含群组信息及第一个子设备信息

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
const devInfo = group.getDevInfo();
console.log(devInfo.name);  // 群组名称
```
#### SmartGroupModel.getGroupInfo

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 此方法为 SmartGroupModel 特有，SmartDeviceModel 上不可用。

##### 描述

获取智能群组信息

##### 参数

无

##### 返回值

类型: `GroupInfo`

群组信息对象，包含 groupId、name、deviceList、schema、dps 等

**`type` GroupInfo**

```typescript
export type GroupInfo = ty.device.GroupInfo & {
  /**
   * dp id 与 dp code 的映射
   */
  idCodes: Record<string, string>;
  /**
   * dp code 与 dp id 的映射
   */
  codeIds: Record<string, string>;
};
```

###### 引用对象

###### `type` GroupInfo

群组信息

| 属性 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `idCodes` | `Record<string, string>` | 是 | dp id 与 dp code 的映射 |
| `codeIds` | `Record<string, string>` | 是 | dp code 与 dp id 的映射 |

##### 示例代码

###### 示例

```typescript
const groupInfo = group.getGroupInfo();
console.log(groupInfo.name);        // 群组名称
console.log(groupInfo.deviceList);  // 群组内子设备列表
```
#### SmartGroupModel.getDpSchema

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 群组内所有设备共享同一套 DP Schema。

##### 描述

获取智能群组 DP Schema（DP 功能点描述）映射表

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
const dpSchema = group.getDpSchema();
console.log(dpSchema.switch_led.property.type); // 'bool'
```
#### SmartGroupModel.getDpState

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

获取智能群组功能点状态

##### 参数

无

##### 返回值

类型: `DpState`

全量功能点状态对象，key 为功能点 code，value 类型由 Schema 推导

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
const dpState = group.getDpState();
console.log(dpState.switch_led);  // true
```
#### SmartGroupModel.getNetwork

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

获取智能群组所处环境的网络状态

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
const network = group.getNetwork();
console.log(network.isConnected);  // true
```
#### SmartGroupModel.getBluetooth

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

获取智能群组所处环境的蓝牙状态

##### 参数

无

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const bluetooth = group.getBluetooth();
console.log(bluetooth.available); // true
```
#### SmartGroupModel.publishDps

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 群组模式下，指令会下发给群组内所有设备。
> 与 useProps 不同，enum 类型的入参为 property.range 的字面量联合
> （如 'white' \| 'colour'），IDE 会在编译期校验枚举值合法性。

##### 描述

批量控制智能群组 DP 功能点

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `data` | `Record<string, DpValue>` | 是 | 要下发的功能点键值对。键为 DP Code，值类型由 Schema 推导：   bool -> boolean, value -> number, enum -> property.range 字面量联合,   bitmap -> number, string/raw -> string |
| `options` | `SendDpOption` | 否 | 下发配置选项 |

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

###### 示例

```typescript
// 控制群组内所有设备开关
await group.publishDps({ switch_led: true });
// 支持批量下发多个功能点
await group.publishDps({ switch_led: true, brightness: 800 });
```
#### SmartGroupModel.queryDps

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 群组设备不支持主动查询功能点状态，调用后会输出警告并直接 resolve。

##### 描述

主动查询设备功能点状态（群组不支持此操作）

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `params` | `{ groupId?: string; dpIds: number[]; }` | 是 | 查询参数 |

##### 返回值

类型: `Promise<unknown>`

提示信息，群组模式下不支持 queryDps

##### 示例代码

###### 示例

```typescript
// 群组不支持，会输出警告
const result = await group.queryDps({});
```
#### SmartGroupModel.destroy

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 销毁后实例不可再使用，所有通过 on* 系列方法注册的监听器均被移除。

##### 描述

销毁当前智能群组实例，同时销毁所有事件监听器

##### 参数

无

##### 返回值

无

##### 示例代码

###### 示例

```typescript
group.destroy();
```
#### SmartGroupModel.onDpDataChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 在群组设备环境中，原生 @ray-js/ray 的 onDpDataChange 实际上不会触发。
> 为了同时自动适配单设备和群组设备环境，这里会在底层 onGroupDpDataChangeEvent 触发时同步执行该回调。

##### 描述

监听群组设备 DP 功能点变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 groupId、dps（变更的功能点 ID->值映射）等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onDpDataChange((data) => {
  console.log('DP 变更:', data.dps);
});
// 需要时取消监听
group.offDpDataChange(id);
```
#### SmartGroupModel.onDeviceOnlineStatusUpdate

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 在群组设备环境中，onDeviceOnlineStatusUpdate 正常情况下不会触发，因为群组目前没有在线状态变更事件。

##### 描述

监听智能群组在线状态变更

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含设备在线状态等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onDeviceOnlineStatusUpdate((data) => {
  console.log('在线状态变更:', data);
});
// 需要时取消监听
group.offDeviceOnlineStatusUpdate(id);
```
#### SmartGroupModel.onDeviceInfoUpdated

> [VERSION] @ray-js/panel-sdk >= 1.5.0

> 💡 在群组设备环境中，原生 @ray-js/ray 的 onDeviceInfoUpdated 实际上不会触发。
> 为了同时自动适配单设备和群组设备环境，这里会在底层 onGroupInfoChange 触发时同步执行该回调。

##### 描述

监听智能群组设备信息变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含设备信息变更等数据的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onDeviceInfoUpdated((data) => {
  console.log('群组信息变更:', data);
});
// 需要时取消监听
group.offDeviceInfoUpdated(id);
```
#### SmartGroupModel.onNetworkStatusChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

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
const id = group.onNetworkStatusChange((data) => {
  console.log('网络状态变化:', data.isConnected, data.networkType);
});
// 需要时取消监听
group.offNetworkStatusChange(id);
```
#### SmartGroupModel.onBluetoothAdapterStateChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

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
const id = group.onBluetoothAdapterStateChange((data) => {
  console.log('蓝牙状态变化:', data.available ? '可用' : '不可用');
});
// 需要时取消监听
group.offBluetoothAdapterStateChange(id);
```
#### SmartGroupModel.offDpDataChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

取消监听智能群组 DP 功能点变更事件

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
const id = group.onDpDataChange((data) => {
  console.log('DP 变更:', data.dps);
});
// 需要时取消监听
group.offDpDataChange(id);
```
#### SmartGroupModel.offDeviceOnlineStatusUpdate

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

取消监听智能群组在线状态变更

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onDeviceOnlineStatusUpdate 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onDeviceOnlineStatusUpdate((data) => {
  console.log('在线状态变更:', data);
});
// 需要时取消
group.offDeviceOnlineStatusUpdate(id);
```
#### SmartGroupModel.offDeviceInfoUpdated

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

取消监听智能群组设备信息变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onDeviceInfoUpdated 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onDeviceInfoUpdated((data) => {
  console.log('群组信息变更:', data);
});
// 需要时取消
group.offDeviceInfoUpdated(id);
```
#### SmartGroupModel.offNetworkStatusChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

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
const id = group.onNetworkStatusChange((data) => {
  console.log('网络状态变化:', data.isConnected, data.networkType);
});
// 需要时取消
group.offNetworkStatusChange(id);
```
#### SmartGroupModel.offBluetoothAdapterStateChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

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
const id = group.onBluetoothAdapterStateChange((data) => {
  console.log('蓝牙状态变化:', data.available ? '可用' : '不可用');
});
// 需要时取消
group.offBluetoothAdapterStateChange(id);
```
#### SmartGroupModel.onGroupDpDataChangeEvent

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

监听群组设备 DP 功能点变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 groupId、dps（变更的功能点 ID->值映射）等信息的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onGroupDpDataChangeEvent((data) => {
  console.log('群组 DP 变更:', data.dps);
});
// 需要时取消监听
group.offGroupDpDataChangeEvent(id);
```
#### SmartGroupModel.onGroupInfoChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

监听智能群组信息变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `listener` | `any` | 是 | 事件回调，接收包含 groupId 等群组信息变更数据的参数 |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onGroupInfoChange((data) => {
  console.log('群组信息变更:', data.groupId);
});
// 需要时取消监听
group.offGroupInfoChange(id);
```
#### SmartGroupModel.offGroupDpDataChangeEvent

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

取消监听群组设备 DP 功能点变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onGroupDpDataChangeEvent 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onGroupDpDataChangeEvent((data) => {
  console.log('群组 DP 变更:', data.dps);
});
// 需要时取消
group.offGroupDpDataChangeEvent(id);
```
#### SmartGroupModel.offGroupInfoChange

> [VERSION] @ray-js/panel-sdk >= 1.5.0

##### 描述

取消监听智能群组信息变更事件

##### 参数

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | onGroupInfoChange 返回的监听器 ID |

##### 返回值

无

##### 示例代码

###### 示例

```typescript
const id = group.onGroupInfoChange((data) => {
  console.log('群组信息变更:', data.groupId);
});
// 需要时取消
group.offGroupInfoChange(id);
```
