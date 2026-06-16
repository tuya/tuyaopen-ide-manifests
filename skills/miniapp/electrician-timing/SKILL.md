---
name: miniapp/electrician-timing
description: 将 @ray-js/electrician-timing-sdk 接入业务代码位于 src/* 的 Ray 小程序 / 面板宿主工程。覆盖 app onLaunch 一次性 init、设备或群组切换时按需 changeConfig、页面级 ConflictPopup 与 useDefaultModal 联动，以及六类定时——云定时、循环、随机、点动（延时关 / 点动定时 / inching）、倒计时、天文（天文**不**属于本 SDK）。当用户提到「电工定时 SDK 接入」「Ray 面板小程序定时接入」「supportCloud / supportCycle / supportRandom / supportInching」「changeConfig 设备或群组切换」「conflictModallId」「electri.cycle / electri.random / electri.inching」「addCloudTimer」「createCountdown」时使用本 skill。
---

## 概述 {#description}

面向业务代码位于 `src/*` 的小程序 / 面板宿主工程，介绍如何接入 `@ray-js/electrician-timing-sdk`：app 入口一次性 `init`、六类定时（云、循环、随机、点动、倒计时、天文）的接入方式。**天文不在本 SDK 中**。

### 信息源

以 `@ray-js/electrician-timing-sdk` 的 README（含 `README-zh_CN.md`）与包类型声明为权威；本地实现与之冲突时以 README + 包导出为准。

### 工程 `config` 与 SDK 的边界

- `init` / `changeConfig` 的字段名以 SDK README 为准。`type: 'ele'` 时，`supportCloud` / `supportCycle` / `supportRandom` / `supportInching` 取 `'auto'` / `'y'` / `'n'`。
- 宿主使用的 URL query（`supportCountdown`、`supportCycle` 等）属于**工程侧契约**：先写入工程 `config`，再驱动本地能力判断。`supportCountdown` 特别提示：它**不是** `type: 'ele'` 的 README `init` 字段；倒计时入口的展示由宿主 `config` 决定，SDK 调用本身使用 **`createCountdown(code, ...)`**。
- 群组场景默认**不支持云定时**（README），建议同时关闭天文。

## 适用场景 {#scene}

### 六类定时 → SDK 写入 API

| 类型 | 归属 | 写入 API（以 README 为准） |
|------|------|----------------------------|
| 云定时 | SDK | `addCloudTimer`、`batchAddCloudTimer`、`updateCloudTimer`、`updateCloudTimerStatus`、`removeCloudTimer`；监听 `onCloudUpdate` |
| 循环 | SDK | `electri.cycle.add/update/...` |
| 随机 | SDK | `electri.random.*` |
| 点动（延时关） | SDK | `electri.inching.*` |
| 倒计时 | SDK | `createCountdown`、`cancelCountdown` |
| 天文 | **不在 SDK 中** | 使用 `@ray-js/ray` 的 `addAstronomical`、`getAstronomicalList`、`updateAstronomical`、`updateAstronomicalStatus`、`removeAstronomical`，详见 [references/astronomical.md](references/astronomical.md)。**勿**使用 `electri.astronomical`（无此命名空间）或 `addDpTimer`（无法解析日出日落）。 |

落地目录由 AI 按工程现状判断（典型放在 `src/pages/<feature>/`，无强制命名）。

### 何时使用本 skill

当宿主工程需要接入「电工定时」相关能力时使用，典型场景：

- 接入**云定时**（按周重复、节假日等）。
- 接入**循环定时**（在时间段内按间隔循环开关）。
- 接入**随机定时**（在时间段内随机执行）。
- 接入**点动定时 / 延时关**（开启后延时自动关闭，inching）。
- 接入**倒计时**（一次性倒计时关闭）。
- 接入**天文定时**（日出 / 日落，注意：**不属于本 SDK**，通过 `@ray-js/ray` 实现）。

## 搭配使用 {#usage}

### 可复制片段（跨工程通用）

代码片段集中在 [references/snippets.md](references/snippets.md)，按锚点访问：

- [入口 `init`](references/snippets.md#on-launch-init)
- [最小页面 `ConflictPopup`](references/snippets.md#conflict-modal-minimal)
- [五类 SDK 内定时的写入示例](references/snippets.md#timer-api-samples)
- [退出 `destroy`](references/snippets.md#on-unload-destroy)

生成或迁移代码时：先读对应锚点，再按目标工程补齐类型与 i18n。天文定时**不在**本 SDK 中，不要从这些片段推断，请使用 [references/astronomical.md](references/astronomical.md)。

### `init`（必读）

在 `src/app.tsx` 的 `onLaunch` —— 或等价首启钩子 —— **早于**任何定时 hook / API 调用时执行。若启动时 DP schema 尚未就绪，`supportCloud` / `supportCycle` / `supportRandom` / `supportInching` 传 `'auto'`，或从 URL 取明确的 `'y'` / `'n'`。

一般情况下，`init` 一次即可，**不需要** `changeConfig`。仅当 `devId` / `groupId` 运行时切换、需要让 SDK 重建内部状态时，才调用 `changeConfig`（字段形态与 `init` 一致，参见 README）。

### 退出

离开定时模块时调用 **`destroy()`**，并把先前注册的 **`on*`**（如 `onCloudUpdate`）与对应 **`off*`** 配对。是否绑定页面 `onUnload` 由业务决定。

### 冲突弹窗（`useDefaultModal`）

- 定时 API 传 `{ useDefaultModal: true }` 时，SDK 会在**栈顶页面**执行 `selectComponent('#<id>')` 并调用 `show(conflictData, validateData)`。
- **`init` 的 `conflictModallId`**（常见 `smart-conflict-popup`）必须等于页面组件的 **`id`**。
- 在**所有**可能触发默认冲突 UI 的页面挂载弹窗组件（落地路径 `src/components/conflict/`）。**不要**挂在 `src/app.tsx` 上 —— 它不是页面栈容器。

### 推荐调用顺序（与 README 对齐）

1. **`init`**（早于任何定时 hook / 写入 API）。
2. 确认能力（云定时支持、群组、倒计时配置）。
3. 调 **`electri.*` / `addCloudTimer` / `createCountdown` / `addDpTimer`**。
4. 统一处理 **`success` / `cancel` / `{ conflict, validateData }`**。
5. 注册 **`on*`** 监听，退出前 **`off*`** + **`destroy()`**。

### 延伸阅读

- [docs/integration-guide.md](docs/integration-guide.md)：URL query 表、README ↔ 工程映射、页面路径索引、以及 **[§5 API 注意事项与最佳实践](docs/integration-guide.md#api-best-practices)**。
- [references/astronomical.md](references/astronomical.md)：`@ray-js/ray` 的五个天文 API（add / list / update / updateStatus / remove）、参数语义（`loops`、`offsetType`、`time` 偏移、`bizType`）以及可移植的 TS 辅助函数。用户问到「天文定时 / 日出 / 日落」时阅读。

## 注意事项 {#tip}

### API 注意事项与最佳实践

完整表格见 [docs/integration-guide.md §5](docs/integration-guide.md#api-best-practices)。

- **铁律**：所有定时读写**必须**在 `init` 成功之后。统一处理返回结构：`success` / `cancel` / `pass` / `{ conflict, validateData }`。启用路径会跑冲突校验。
- **`electri.*` / 云 / 倒计时**：要使用默认冲突 UI，须传 **`useDefaultModal: true`**，且当前页面挂载了 `id` 与 `conflictModallId` 匹配的 **`ConflictPopup`**。
- **云定时**：群组默认不支持。列表与操作可用 **`isLANOnline` / `isLocalOnline`** 驱动在线提示。
- **倒计时**：按 README，枚举型总时长需配合 **`totalRange`** + **`cancelValue`**；错误码参见 README。
- **自定义 DP 定时**：使用 **`addDpTimer`**。三种标准电工类型仍优先 **`electri.*`**。
- **监听**：`onCloudUpdate` 等必须与 `off*` 成对，防止泄漏。

**术语**：用户说「点动」或「电动定时」时，按 **inching / 延时关**（`sdk_inching`）处理。

### 自检

- [ ] `src/app.tsx` 是否在任何首屏定时逻辑前调用了 `init`，并且**没有**在常规启动流程里无谓地调用 `changeConfig`？
- [ ] 所有使用 `useDefaultModal: true` 的页面，是否在**页面根节点**挂载了 `id === conflictModallId` 的冲突组件？
- [ ] 是否把 **SDK 字段**与**工程 query 字段**分开（尤其倒计时）？
- [ ] 天文功能是否避开了 `electri.*` / `addDpTimer`，并改用 [references/astronomical.md](references/astronomical.md) 列出的五个 `@ray-js/ray` 天文 API？
