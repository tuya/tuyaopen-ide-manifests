# 消息格式与协议

本页面文档描述 MQTT/LAN 通信的消息结构、请求类型枚举（`reqType`）、响应格式、错误处理机制，以及参数校验规则。

## 消息结构

### 请求消息

所有发送到设备的消息遵循统一结构：

```ts
interface MqttMessage {
  reqType: string; // 请求类型标识
  version: string; // 协议版本，默认 '1.0.0'
  taskId: string; // 任务 ID，默认 Date.now()
  [key: string]: any; // 业务数据字段
}
```

发送时由 `createSetCommonParams` 自动组装。MQTT 通道以对象形式发送，LAN 通道会序列化为 `JSON.stringify({ data: messageData, reqType })` 字符串。

协议号固定为 `64`（`ProtocolEnum.appToRobot`）。设备上报消息的协议号为 `65`（`ProtocolEnum.robotToApp`）。

### 响应消息

所有设备响应均包含以下基础字段：

```ts
interface BaseResponse {
  success: boolean; // 请求是否成功
  errCode: number; // 错误码，0 表示成功
  reqType: string; // 对应的请求类型
  version: string; // 协议版本
  taskId: string; // 对应的任务 ID
}
```

具体业务响应在此基础上扩展额外字段。

## reqType 枚举

每个功能对应一组 `reqType` 枚举值，用于标识请求和响应类型。以下列出所有枚举及其成员。

### 清扫功能

#### ZoneCleanEnum（划区清扫）

| 成员    | 值               | 说明             |
| ------- | ---------------- | ---------------- |
| `query` | `'zoneCleanQry'` | 查询划区清扫配置 |
| `set`   | `'zoneCleanSet'` | 设置划区清扫     |

#### RoomCleanSetEnum（选房清扫）

| 成员    | 值               | 说明             |
| ------- | ---------------- | ---------------- |
| `query` | `'roomCleanQry'` | 查询选房清扫配置 |
| `set`   | `'roomCleanSet'` | 设置选房清扫     |

#### SpotCleanEnum（定点清扫）

| 成员    | 值               | 说明             |
| ------- | ---------------- | ---------------- |
| `query` | `'spotCleanQry'` | 查询定点清扫配置 |
| `set`   | `'spotCleanSet'` | 设置定点清扫     |

#### CarpetCleanEnum（地毯清扫）

| 成员    | 值                 | 说明         |
| ------- | ------------------ | ------------ |
| `query` | `'carpetCleanQry'` | 查询地毯清扫 |
| `set`   | `'carpetCleanSet'` | 设置地毯清扫 |

### 地毯管理

#### CarpetEnum

| 成员     | 值               | 说明     |
| -------- | ---------------- | -------- |
| `add`    | `'addCarpet'`    | 添加地毯 |
| `update` | `'updateCarpet'` | 更新地毯 |
| `delete` | `'removeCarpet'` | 删除地毯 |
| `query`  | `'carpetQry'`    | 查询地毯 |
| `set`    | `'carpetSet'`    | 设置地毯 |

### 房间与分区

#### RoomPropertyEnum（房间属性）

| 成员    | 值                  | 说明         |
| ------- | ------------------- | ------------ |
| `set`   | `'roomPropertySet'` | 设置房间属性 |
| `query` | `'roomPropertyQry'` | 查询房间属性 |

#### PartDivisionEnum（房间分隔）

| 成员    | 值                  | 说明       |
| ------- | ------------------- | ---------- |
| `set`   | `'partDivisionSet'` | 设置分区线 |
| `query` | `'partDivisionRst'` | 分隔结果   |

#### PartMergeEnum（分区合并）

| 成员    | 值               | 说明     |
| ------- | ---------------- | -------- |
| `set`   | `'partMergeSet'` | 设置合并 |
| `query` | `'partMergeRst'` | 合并结果 |

### 虚拟区域

#### VirtualAreaEnum（禁区）

| 成员    | 值                    | 说明     |
| ------- | --------------------- | -------- |
| `query` | `'restrictedAreaQry'` | 查询禁区 |
| `set`   | `'restrictedAreaSet'` | 设置禁区 |

#### VirtualWallEnum（虚拟墙）

| 成员    | 值                 | 说明       |
| ------- | ------------------ | ---------- |
| `query` | `'virtualWallQry'` | 查询虚拟墙 |
| `set`   | `'virtualWallSet'` | 设置虚拟墙 |

### 地图管理

#### SaveCurrentMapEnum（保存地图）

| 成员    | 值                 | 说明         |
| ------- | ------------------ | ------------ |
| `set`   | `'SaveCurrMapSet'` | 保存当前地图 |
| `query` | `'SaveCurrMapRst'` | 保存结果     |

#### DeleteMapEnum（删除地图）

| 成员  | 值               | 说明     |
| ----- | ---------------- | -------- |
| `set` | `'deleteMapSet'` | 删除地图 |
| `rst` | `'deleteMapRst'` | 删除结果 |

#### UseMapEnum（切换地图）

| 成员    | 值            | 说明         |
| ------- | ------------- | ------------ |
| `set`   | `'useMapSet'` | 切换使用地图 |
| `query` | `'useMapRst'` | 切换结果     |

#### ResetCurrMapEnum（重置地图）

| 成员    | 值                  | 说明         |
| ------- | ------------------- | ------------ |
| `set`   | `'resetCurrMapSet'` | 重置当前地图 |
| `query` | `'resetCurrMapRst'` | 重置结果     |

### 设备信息与设置

#### DevInfoEnum（设备信息）

| 成员    | 值             | 说明         |
| ------- | -------------- | ------------ |
| `query` | `'devInfoQry'` | 查询设备信息 |

#### ScheduleEnum（定时任务）

| 成员    | 值              | 说明         |
| ------- | --------------- | ------------ |
| `query` | `'scheduleQry'` | 查询定时任务 |
| `set`   | `'scheduleSet'` | 设置定时任务 |

#### QuietHoursEnum（勿扰模式）

| 成员    | 值                | 说明         |
| ------- | ----------------- | ------------ |
| `query` | `'quietHoursQry'` | 查询勿扰设置 |
| `set`   | `'quietHoursSet'` | 设置勿扰模式 |

#### PasswordEnum（密码）

| 成员       | 值                   | 说明         |
| ---------- | -------------------- | ------------ |
| `query`    | `'passwordQry'`      | 查询密码状态 |
| `set`      | `'passwordSet'`      | 设置密码     |
| `rst`      | `'passwordRst'`      | 设置结果     |
| `check`    | `'passwordCheck'`    | 校验密码     |
| `checkRst` | `'passwordCheckRst'` | 校验结果     |

#### VoiceLanguageEnum（语音语言）

| 成员    | 值                   | 说明         |
| ------- | -------------------- | ------------ |
| `query` | `'voiceLanguageQry'` | 查询语音语言 |
| `set`   | `'voiceLanguageSet'` | 设置语音语言 |

### WiFi 与模型

#### WifiMapEnum

| 成员    | 值             | 说明           |
| ------- | -------------- | -------------- |
| `query` | `'WifiMapQry'` | 查询 WiFi 地图 |
| `set`   | `'WifiMapSet'` | 设置 WiFi 地图 |
| `rst`   | `'WifiMapRst'` | 设置结果       |

#### DeviceModelEnum（设备模型）

| 成员    | 值                 | 说明         |
| ------- | ------------------ | ------------ |
| `query` | `'deviceModelQry'` | 查询设备模型 |
| `set`   | `'setDeviceModel'` | 设置设备模型 |

#### FurnitureModelEnum（家具模型）

| 成员    | 值                    | 说明         |
| ------- | --------------------- | ------------ |
| `query` | `'modelQry'`          | 查询家具模型 |
| `set`   | `'setFurnitureModel'` | 设置家具模型 |

## ProtocolEnum

用于标识消息发送方向的协议号。

| 成员         | 值   | 说明           |
| ------------ | ---- | -------------- |
| `appToRobot` | `64` | 面板发送到设备 |
| `robotToApp` | `65` | 设备上报到面板 |

## MqttError

所有 MQTT 通信错误都通过 `MqttError` 类抛出。

```ts
class MqttError extends Error {
  errCode: number; // 错误码
  reqType: string; // 对应的请求类型
}
```

### 错误码含义

| errCode    | 说明                   |
| ---------- | ---------------------- |
| `0`        | 成功                   |
| `-1`       | 请求超时（默认 10 秒） |
| `-2`       | 参数校验失败           |
| 其他正整数 | 设备返回的业务错误码   |

### 全局错误处理

通过 `MqttProvider` 的 `onError` 属性可捕获所有未被 `catch` 处理的 MQTT 错误：

```tsx
<MqttProvider
  onError={(error) => {
    console.error(`未处理的错误: ${error.reqType} - ${error.errCode}`);
  }}
  // ...其他属性
>
```

## 参数校验

所有 hooks 的输入参数在发送前会通过 Zod schema 进行运行时校验。校验失败时抛出 `MqttError`（`errCode: -2`）。

### 通用房间偏好字段

多个 hook 共享以下可选字段（`RoomPreferenceFields`），用于指定清扫参数：

| 字段               | 类型                   | 默认值           | 说明                                                                       |
| ------------------ | ---------------------- | ---------------- | -------------------------------------------------------------------------- |
| `suctions`         | `string[]`             | `['']`           | 吸力：`'closed'` / `'gentle'` / `'normal'` / `'strong'` / `'max'`          |
| `cisterns`         | `(string \| number)[]` | `['']`           | 水量：`'closed'` / `'low'` / `'middle'` / `'high'`                         |
| `waterValues`      | `(string \| number)[]` | `['']`           | 自定义水量值                                                               |
| `cleanCounts`      | `number[]`             | `[1]`            | 清扫次数                                                                   |
| `yMops`            | `number[]`             | `[-1]`           | Y 形拖地：`1` 开启 / `0` 关闭 / `-1` 未设置                                |
| `sweepMopModes`    | `string[]`             | `['only_sweep']` | 模式：`'only_sweep'` / `'only_mop'` / `'both_work'` / `'clean_before_mop'` |
| `routePreferences` | `string[]`             | `['standard']`   | 路线偏好：`'standard'` / `'fast'` / `'deep'` / `'custom'`                  |

这些数组字段的长度必须与对应的 `ids` 或 `zones`/`spots` 数组长度一致，否则校验失败。

### 常量映射

用于非 MQTT 模式下将字符串值转换为数值：

```ts
// 吸力映射
SUCTION_MAP: { closed: 0, gentle: 1, normal: 2, strong: 3, max: 4 }

// 水量映射
CISTERN_MAP: { closed: 0, low: 1, middle: 2, high: 3 }

// 清扫模式映射
CLEAN_MODE_MAP: { both_work: 0, only_sweep: 1, only_mop: 2, clean_before_mop: 3 }

// 路线偏好映射
ROUTE_PREFERENCE_MAP: { standard: 0, fast: 1, deep: 2, custom: 3 }
```
