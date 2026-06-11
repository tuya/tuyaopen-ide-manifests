# 电工定时 SDK 接入指南

本文路径均以宿主工程 `src/` 为根。

## 0. 本 skill 内置的可移植片段

跨工程通用的复制粘贴模板见 [../references/snippets.md](../references/snippets.md)。实现某能力前，先打开对应锚点。

## 1. 宿主 URL query

| Query 字段 | 含义 | 典型取值 |
|------------|------|----------|
| `deviceId` | 设备 ID | string |
| `groupId` | 群组 ID（与 `deviceId` 至少一个） | string |
| `switchCodes` | 开关 code，逗号分隔 | `switch_1,switch_2` |
| `countdownCodes` | 与开关配对的倒计时 code，可留空交由逻辑推断 | 逗号分隔 |
| `supportCountdown` | 倒计时入口的展示 / 启用（工程侧 `config`，**非** README `init` 字段） | `y` / `n`（默认 `n`） |
| `supportCycle` / `supportRandom` / `supportInching` | 是否允许对应电工定时；不传则由 DP 推断为 `'auto'` | `y` / `n` / 不传 |
| `supportAstronomical` | 天文入口；群组下建议强制关闭 | `y` / `n` |
| `cycleCode` / `randomCode` / `inchingCode` | 显式 DP code | string |
| `is24Hour` | 24 小时制 | `y` 表示 true |
| `category` | 云定时分类 | 通常 `sdk_schedule`，谨慎修改 |
| `ignoreAstronomicalEnable` | 跳过部分天文高级校验 | `y` / `n` |
| `theme` / `brand` | 主题 | 由宿主定义 |
| `countdownSuccessAction` | 倒计时成功行为（页面级） | 如 `hold` |

**与 SDK 的绑定**：query 写入工程 `config` 后，**入口 `init`** 读取 `supportCloud` / `supportCycle` / ...（多为 `config` 字符串或 `'auto'`）。如果 `init` 后解析的开关或 `devId` / `groupId` 与传入值不一致，按 README 同字段形态调 `changeConfig`。冷启动已具备最终配置且后续不变，可完全跳过 `changeConfig`。

## 2. README `init` / `changeConfig`（`type: 'ele'`）与工程侧对应

| README 字段 | 说明 | 宿主典型来源 |
|-------------|------|--------------|
| `devId` / `groupId` | 至少一个；同时给出时 `devId` 优先 | query |
| `type` | `ele` 或 `custom` | 电工模板固定 `ele` |
| `supportCloud` / `supportCycle` / `supportRandom` / `supportInching` | `auto` / `y` / `n` | URL + 能力聚合结果 |
| `cycleCode` / `randomCode` / `inchingCode` | 可选显式 | query 或 schema 推断 |
| `category` | 云定时分类 | query |
| `is24Hour` | 24 小时制 | query 或系统 |
| `combineSameData` | 多通道合并 | 单通道为 `false` |
| `conflictModallId` | 必须与页面冲突组件 id 一致 | 通常 `smart-conflict-popup` |

**不在此表**：`supportCountdown` —— 由工程 `config` 控制；SDK 直接使用 `createCountdown`。

## 3. 关键挂载点

| 能力 | 位置 |
|------|------|
| App 入口 `onLaunch` + `init` | `src/app.tsx` |
| 冲突 UI（`ConflictPopup`） | 每个会触发冲突的页面根节点（**勿**挂在 `src/app.tsx`） |

具体页面 / 功能模块的目录命名由 AI 按工程现状判断，无强制约定。

## 4. SDK README 能力速查（防止漂移）

- 生命周期：`init`、`changeConfig`、`destroy`
- 电工：`electri.cycle`、`electri.random`、`electri.inching`
- 云定时：`addCloudTimer`、`batchAddCloudTimer`、`updateCloudTimer`、`updateCloudTimerStatus`、`removeCloudTimer`、`onCloudUpdate` / `offCloudUpdate`
- 倒计时：`createCountdown`、`cancelCountdown`
- 自定义 DP 定时（非三种标准电工类型）：`addDpTimer` 系列
- 在线提示：`isLANOnline`、`isLocalOnline`
- **天文（不在 SDK 中）**：`addAstronomical`、`getAstronomicalList`、`updateAstronomical`、`updateAstronomicalStatus`、`removeAstronomical` —— 来自 `@ray-js/ray`；完整参数语义与可移植助手见 [../references/astronomical.md](../references/astronomical.md)。

<a id="api-best-practices"></a>

## 5. API 注意事项与最佳实践

与 README-zh_CN 及常见接入对齐；以包类型为最终依据。

### 生命周期

| API | 注意 | 最佳实践 |
|-----|------|----------|
| **`init`** | 必须早于其他定时 API / hook。`devId` / `groupId` 至少一个；同时给出时 `devId` 优先。 | 在 app `onLaunch` `await init`；`type: 'ele'` 按 README 传 `support*`、`category` 等；子页面**不要**再 `init`。 |
| **`changeConfig`** | README：更新配置；设备 / 群组变化时重建。 | 按需调用：解析后的 `support*` / code / `combineSameData` 与 `init` 不同，或 `devId` / `groupId` 切换时。字段形态与 `init` 一致，避免重复调用。 |
| **`destroy`** | 清理内部状态与监听。 | 离开定时模块时调用；先 `on*` ↔ `off*` 配对，再 `destroy`。 |

### 电工快捷 `electri.*`

| 模块 | 注意 | 最佳实践 |
|------|------|----------|
| **cycle / random / inching** | 启用、新增即启用、切换为启用都会跑**冲突校验**；随机有最短时长约束（如错误码 1011）。 | 保存前用 `getConfig` / `validateMax` / `validateRepeat`（适用时）减少无效请求；统一处理 `success` / `cancel` / 冲突载荷。 |
| **写入选项** | `useDefaultModal: true` 走默认冲突 UI。 | 仅在当前栈顶页已挂载 `ConflictPopup` 时传 `true`；否则用返回的冲突载荷自建流程。 |

### 云定时

| API | 注意 | 最佳实践 |
|-----|------|----------|
| **add / batchAdd / update / updateStatus / remove** | **群组默认不支持云定时**（README）。 | 能力解析为 `n` 时隐藏入口或禁用操作；列表提示可用 `isLANOnline` / `isLocalOnline`。 |
| **`onCloudUpdate` / `offCloudUpdate`** | 必须成对，避免泄漏。 | 在真实刷新点（页面 / store）注册；页面销毁 / `destroy` 前 `off*`。 |

### 倒计时

| API | 注意 | 最佳实践 |
|-----|------|----------|
| **`createCountdown`** | README：枚举型总时长需 `totalRange` 与 `cancelValue`；错误码含 1005/1006。 | 创建前确认设备侧倒计时 code 与配置匹配；`useDefaultModal` + 冲突组件规则同电工 API。 |
| **`cancelCountdown`** | 需要有效 code。 | 与 UI「取消倒计时」一一对应；按错误码暴露失败原因。 |

### 自定义 DP 定时 `addDpTimer`

| 注意 | 最佳实践 |
|------|----------|
| 用于非标准电工的 DP 定时模型。 | `type: 'ele'` 且场景为循环 / 随机 / 点动时，**优先 `electri.*`**，避免与 `dpTimerConfig` 混用。`type: 'custom'` 时按 README 提供 `switches`、`countdowns`、`dpTimerConfig`。 |

### 冲突与 `useDefaultModal`

| 注意 | 最佳实践 |
|------|----------|
| SDK 在当前页执行 `selectComponent('#<conflictModallId>')`。 | 页面组件 `id` 必须等于 `conflictModallId`（通常 `smart-conflict-popup`）；按页面挂载，**勿**挂在 `src/app.tsx`。 |
| 返回值 `cancel` | 用户取消冲突弹窗；不视为可重试的系统错误。 |

### 在线状态

| API | 最佳实践 |
|-----|----------|
| **`isLANOnline` / `isLocalOnline`** | 用于能力门控或文案调整（云定时 / 天文提示）。**不能**替代服务端鉴权或业务规则。 |

### Hooks（`lib/hooks`）

| 注意 | 最佳实践 |
|------|----------|
| 依赖 SDK 内部状态。 | `init` 成功后才能使用；设备切换后若未跑 `changeConfig` / `destroy`，应视 hook 状态为陈旧。 |

### 天文（通过 `@ray-js/ray`，不在本 SDK 中）

完整参数表、响应特性与可移植 TS 助手见 [../references/astronomical.md](../references/astronomical.md)。需记住的规则：

| 模块 | 最佳实践 |
|------|----------|
| **API 集合** | 仅使用 `@ray-js/ray` 的 `addAstronomical` / `getAstronomicalList` / `updateAstronomical` / `updateAstronomicalStatus` / `removeAstronomical`。**勿**臆造 `electri.astronomical`（无此命名空间），也**勿**用 `addDpTimer` 模拟日出日落。 |
| **生命周期** | 与 `init` / `changeConfig` / `destroy` 独立。不支持 `conflictModallId` / `useDefaultModal` —— 如需冲突 UX，业务自实现。 |
| **群组** | 存在 `groupId` 时建议强制 `supportAstronomical=n` —— 群组通常无逐设备坐标。除非产品确认支持群组，否则照此处理。 |
| **刷新** | 没有 `onCloudUpdate` 的对应推送监听。任何修改后用 `getAstronomicalList` 重新拉取。`dps` 入站时需解析 —— 列表响应以 JSON 字符串返回。 |
| **`id` 形态** | 以 `addAstronomical` 返回的类型作为标准 `id`；`updateAstronomicalStatus` / `removeAstronomical` 文档标注 `String`，调用点按需 stringify。 |
