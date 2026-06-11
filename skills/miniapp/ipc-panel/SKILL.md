---
name: tuya-ipc-panel-template
description: 涂鸦 IPC（摄像机）面板小程序模板（panel-ipc / public-ipc-template / tuya-ray-materials PublicPanelIpc）开发专家，指导 AI Agent 在该模板内为外部开发者新增/修改功能项、串联 DP、配置融合播放器、接入 VAS 运营位、实现路径巡航等能力。当用户在 panel-ipc 仓库中提到 LayoutFeature / LayoutFooter / FeatureMenu / configData / publishDpOutTime / IPCPlayerIntegration / SDM / @ray-js/ipc-player-integration / @ray-js/ray-ipc-utils / @ray-js/panel-sdk / ipc_mobile_path / memory_point_set，或询问主页宫格/底部 TabBar/弹窗/枚举 DP/PTZ/隐私模式/回放/云存/相册/对讲/品牌色/骨架屏/横屏 时触发。Tuya IPC mini-app panel — declarative FeatureMenu/TabBar grid, integrated player, VAS banner, PTZ + collect points, path cruise (mobilecam), DP wiring conventions.
---

# Skills: tuya-ipc-panel-template

## 概述 {#description}

本技能服务于涂鸦 IPC 摄像机品类 Ray 小程序面板模板的二次开发，覆盖固定/云台/可移动等主流摄像机的全流程开发。核心知识包括：声明式 FeatureMenu/TabBar 数据驱动渲染、`@ray-js/ipc-player-integration` 融合播放器接入、DP 监听与下发约定（`publishDpOutTime` / `useActions` 双轨）、VAS `pageType` 跳转规则、路径巡航 hooks（`useCreatePath` 等）、弹窗 `componentMap` 注册机制。技能通过 `reference/` 子目录对组件、API、Redux、原生路由提供完整签名，SKILL.md 速查表仅用于选型，详细用法以 reference 为准。

## 适用场景 {#scene}

- **新增/修改主页功能**：在 `src/components/layout-feature/configData.ts` 追加 FeatureMenu，含 bool/enum/popup/miniPage/nativePage 五种 type。
- **新增/修改底部 Tab**：在 `src/components/layout-footer/configData.ts` 追加 TabBar，含中心大按钮、对讲特殊项。
- **接入弹窗组件**：在 `src/components/featureComponents/<key>/` 写组件、注册 `componentMap`、用 `changePanelInfoState('showSmartPopup', ...)` 触发。
- **串联设备 DP**：bool/enum/string/JSON 各类型 DP 的 `schema.ts` 注册、`publishDpOutTime` 下发、`useProps` 响应式读、`onDpDataChange` 监听。
- **融合播放器配置**：`useCtx` 创建 instance、`Features.initPlayerWidgets` 启用控件、`onPlayStatus` 联动 `isPreviewOn`、横屏行为。
- **VAS 运营 Banner**：`getServiceHallSetting` 取数据 + `pageType` 6 种跳转规则。
- **路径巡航**（可移动摄像机）：`ipc_mobile_path` / `ipc_mobile_pathnode` JSON DP + `useCreatePath` / `usePlayPath` 等 hooks。
- **不适用**：非 panel-ipc 仓库、非 IPC 品类（照明 / 插座 / 门锁等）、纯 Ray 框架问题、IoT 平台后台配置类问题、设备固件实现问题。

## 搭配使用 {#usage}

- **源码仓布局**：本 Skill 位于 monorepo 路径 `skills/tuya-ipc-panel-template/`（仓库 `ai-ipc-panel-skill`）。在 **panel-ipc** 等目标项目中，将本目录安装到 `.cursor/skills/tuya-ipc-panel-template/`（拷贝或符号链接），打开目标项目后按 description 自动加载；也可 `@tuya-ipc-panel-template` 显式调起。仅打开源码仓时不会注入本 SKILL 正文，编排见仓库根 `CLAUDE.md`。
- **多 Agent 兼容**：源码仓根目录提供 `CLAUDE.md` 与 `AGENTS.md`（软链 → CLAUDE.md），Claude Code / OpenAI Codex / 其他 Agent 共用同一份高层编排规则。
- **前置依赖**：
  - 编辑器：Cursor IDE（自动注入 description）。
  - 真机调试：Tuya MiniApp IDE（必需，普通 IDE 跑不了真机），读 `project.tuya.json`。
  - 平台准备：涂鸦 IoT 平台已创建摄像机产品，并在小程序开发者平台「开发设置 → 已授权云能力」手动授权 **IPC 标准能力**。
  - 包管理：Node ≥ 16 + Yarn；命令为 `yarn install` / `yarn start` / `yarn build`。
- **延伸阅读**：
  - 字段速查与组件签名：[reference/](./reference/)
  - 端到端示例：[examples/recipes.md](./examples/recipes.md)
  - 评估用例：[evals/evals.json](./evals/evals.json)
  - 官方文档：[Codelab](https://developer.tuya.com/cn/miniapp-codelabs/codelabs/panel-ipc/index.html#0) · [Ray](https://developer.tuya.com/cn/miniapp/develop/ray) · [SDM](https://developer.tuya.com/cn/miniapp/develop/ray/sdm/overview)
- **搭配技能**：通用「TypeScript 重构」「Cursor 项目导览」类技能可叠加；路径巡航开发时建议同时让 agent 索引 `src/features/path-point/` 让 hooks 命中更准。

## 注意事项 {#tip}

- **触发边界**：description 已用仓库特征（包名、路径、DP code）做强约束；非 IPC 模板项目不应被命中。误触发时，向 description 增加更具体的负例关键词，而非禁用自动加载。
- **数据安全**：本技能不读写任何凭据；模板代码也不应在 `schema.ts` / `configData.ts` / 国际化文案中硬编码 deviceId / token / accessKey。日志输出禁止打印 DP 原始 JSON（路径巡航 DP 可能含位置信息）。
- **使用边界**：模板锁定 BaseKit ≥ 3.0.0 / IPCKit ≥ 6.4.11 / 智能生活 App ≥ 6.5.0。低于该版本不要尝试真机调试；群组设备（`getLaunchOptionsSync().query.groupId` 存在）时 `devices.common` 是 `SmartGroupModel`，播放器/对讲/PTZ 等 IPC 能力对群组不友好，需按品类网关。
- **schema.ts 已知陷阱**：`wireless_powermode` 写成 `node:'ro'`（应为 `mode:'ro'`）；`ipc_direction_control` 写成 `mode:'wr'`（应为 `'rw'`）。复制时务必校对 `mode` 字段，否则 `useProps`/`useActions` 拿不到值。
- **缓存陷阱**：模板会把已解析的功能列表写到原生存储（`${deviceId}_layout_feature_menu` / `${deviceId}_layout_tab_menu`）。新增 DP 后页面没变化时，先冷启动或在模拟器里清这两个 key。
- **重复监听**：`LayoutFeature` / `pages/feature` / `LayoutFooter` 内部已在 `onDpDataChange` 里监听并自动更新 `dpValue`。新功能项**不要**再加全局监听，通过 `listen: true` + `dpListenCallback(value, currentItem)` 完成副作用即可。
- **维护提示**：评估用例在 `evals/evals.json`，共 5 条（`ipc-biz-001`～`004`：bool / 枚举 / 弹窗 / 路径巡航；`ipc-negative-001`：越界拒答）。修改 SKILL.md 后请运行 `/skills-quality-check` 与 `/skills-run-eval` 完成自检。
- **AI 行为**：agent 不得替开发者决定 IoT 产品的 DP 命名/编号/类型，必须从涂鸦平台抄到 `schema.ts`；权限敏感操作（如关闭证书校验、`usesCleartextTraffic`）禁止建议；生成示例时不得嵌入真实 deviceId/token。

---

用户需求: $ARGUMENTS

## Workflow（每次开发必须遵循）

1. **识别范围**：从需求里圈出要用的 DP、组件、原生页/弹窗、是否触达播放器或路径巡航。
2. **先读 reference，再写代码**：
   - 修改任何 `FeatureMenu` / `TabBar` 配置项前，**必须** `Read ./reference/component/layout-feature.md` 或 `layout-footer.md`，核对 type 取值、必填字段、按 type 写 onClick 的标准模式。
   - 使用 `IPCPlayerIntegration` / `useCtx` / `Features` 前，**必须** `Read ./reference/component/ipc-player-integration.md`。
   - 使用任何 DP 工具（`publishDpOutTime` / `useProps` / `useActions` / `getDpCodeIsExist` 等）前，**必须** `Read ./reference/api/dp-utils.md`。
   - 跳转任何 native 页或外部小程序、接 VAS 运营 Banner 前，**必须** `Read ./reference/api/service-hall-and-routes.md`。
   - 处理路径巡航前，**必须** `Read ./reference/api/path-point-hooks.md`。
   - 主 SKILL.md 的"速查表"**只用于选型**，不含完整签名，**严禁**据此直接写代码。
3. **按清单落地**：DP 注册（schema.ts）→ 配置项追加（configData.ts）→ 弹窗组件 + componentMap → i18n（zh/en）→ iconfont → 构建。
4. **构建验证**：写完必须 `yarn build`，修完所有报错再交付。

## 核心 DP 表

| DP code | 类型 | 说明 | 处理类别 |
|---|---|---|---|
| `basic_private` | bool | 隐私模式 | Basic |
| `basic_indicator` | bool | 状态指示灯 | Basic |
| `basic_wdr` | bool | 宽动态 WDR | Basic |
| `motion_switch` | bool | 移动侦测 | Basic |
| `motion_tracking` | bool | 移动跟随 | Basic |
| `laser_pointer` | bool | 激光辅助 | Basic |
| `siren_switch` | bool | 警笛 | Basic |
| `floodlight_switch` | bool | 灯开关 | Basic |
| `nightvision_mode` | enum | 夜视模式 | Basic（枚举）|
| `cruise_status` | enum | 巡航状态 | Basic（枚举）|
| `ipc_lullaby` | enum | 摇篮曲 | Basic（枚举）|
| `ipc_manual_petting` | enum | 互动动作 | Basic（枚举）|
| `ptz_control` / `ptz_stop` | enum/bool | 云台控制/停止 | Basic（连续手势）|
| `zoom_control` / `zoom_stop` | enum/bool | 变焦/停止 | Basic（连续手势）|
| `sd_status` | enum | SD 卡状态（决定回放可见）| Basic |
| `wireless_powermode` | enum `'0'/'1'` | 供电方式（电池/插电）| Basic |
| `wireless_awake` | bool | 唤醒状态 | Basic |
| `memory_point_set` | string（JSON）| 收藏点操作 | **Complex（JSON）** |
| `ipc_mobile_path` | string（JSON）| 路径巡航 path 级 | **Complex（JSON）** |
| `ipc_mobile_pathnode` | string（JSON）| 路径巡航 point 级 | **Complex（JSON）** |
| `ipc_direction_control` | string | 遥控方向 | Basic（注意 mode 拼写陷阱）|

### 处理类别的差异（一眼区分）

| 类别 | 读取 | 下发 | 落地方式 |
|---|---|---|---|
| Basic | `useProps(p => p.code)` 或 `getDpValueByDevices(code)` | `publishDpOutTime(code, value)`（**优先**，带 Loading + 超时）/ `useActions().code.set(v)`（连续手势用）| 直接读写 |
| Basic（枚举）| 同上 | 通过 `getTargetEnumDpActionSheetData(code)` 弹底部菜单，由 home 内置的 `onSelectActionSheet` 自动 `publishDpOutTime` | 不要自己再 publish 一次 |
| Basic（连续手势）| 同上 | `useActions().ptz_control.set(v)` 配 `setInterval(..., 1000)` 持续下发；松手 `actions.ptz_stop.set(true)` | 见 `featureComponents/ptz` |
| Complex（JSON）| `useProps`（拿到原始字符串后 `JSON.parse`，建议 `formatJSONStringDpToObject<T>` ）| `devices.common.publishDps({code: JSON.stringify(...)})`，路径巡航推荐用 `@/features/path-point` 的 `useCreatePath` 等 hooks 封装 | 在 `protocols/index.ts` 注册 Transformer 才能用 `useStructuredProps`；模板默认 `protocols = {}` |

## 标准开发流程（90% 任务）

```
1. 在涂鸦 IoT 平台定义 DP（dpCode / dpId / type）
2. 同步到 src/devices/schema.ts（mode 字段务必正确）
3. 选择落点：
   · 主页宫格   → src/components/layout-feature/configData.ts
   · 底部 Tab   → src/components/layout-footer/configData.ts
   · "更多"页   → src/pages/feature/configData.ts
4. 追加一个对象（FeatureMenu / TabBar 字段表见 reference）
5. 若 type = 'popup'：写组件 → 注册到 src/config/componentMap.ts
6. src/i18n/strings.ts 补 zh/en（枚举 DP 必须按 dp_${code}_${range} 命名）
7. 新图标放 src/res/iconfont/ 并更新 iconfont.css
8. yarn build 验证
```

## Quick Reference

### 架构总览（pages/home/index.tsx）

```
PlayerIntegrationContext.Provider
└── LayoutHeader   // 顶部状态 + 标题
    LayoutPlayer   // 融合播放器（IPCPlayerIntegration）
    LayoutVas      // 运营 Banner（HalfHorizontalDrag）
    LayoutFeature  // 功能宫格（FeatureMenu[]）
    LayoutFooter   // 底部 TabBar（TabBar[]，含中心大对讲按钮）
    Popup          // 全局底部弹窗（按 componentKey 渲染 componentMap）
    ActionSheet    // 全局枚举 DP 选择
```

二级页：`pages/feature`（更多）/ `pages/list`（巡航列表）/ `pages/collectEdit`（收藏点编辑）。路由集中在 `src/routes.config.ts`。

### componentMap 速查（src/config/componentMap.ts）

| componentKey | 组件来源 | 用途 |
|---|---|---|
| `ptz` | `featureComponents/ptz` | PTZ + 收藏点弹窗 |
| `interactive` | `featureComponents/interactive` | 互动动作（`ipc_manual_petting`）|
| `remoteControl` | `featureComponents/remote-control` | 遥控方向盘 |
| `pathManager` | `featureComponents/path-manager` | 路径巡航场景管理 |
| `todo` | `featureComponents/todo` | "敬请期待"占位 |

### nativePageRoute / miniIdLabs 速查（src/config/cameraData.ts）

| key | value | 含义 |
|---|---|---|
| `nativePageRoute.ipcAlbumPanel` | `'ipc_album_panel'` | 相册 |
| `nativePageRoute.ipcCloudPanel` | `'camera_cloud_panel'` | 云回放 |
| `nativePageRoute.ipcPlayBackPanel` | `'camera_playback_panel'` | SD 卡回放 |
| `nativePageRoute.ipcMessagePanel` | `'camera_message_panel'` | 消息中心 |
| `miniIdLabs.deviceSettings` | `tycryc71qaug8at6yt` | 设备设置 |
| `miniIdLabs.vasMini` | `tyeavwo0j4oocvdrf1` | 增值服务 |
| `miniIdLabs.ipcHelpMini` | `tybxwaylc6inpkrgeu` | 帮助反馈 |
| `miniIdLabs.ipcServiceHallMini` | `tyhtutw16qihykz97n` | 服务大厅 |

### Util 速查（src/utils/index.ts）

| 函数 | 用途 |
|---|---|
| `publishDpOutTime(code, value, time?=10000)` | DP 下发 + Loading + 超时 + 失败 toast（**优先**）|
| `clearPublishDpOutTime()` | 在 `dpListenCallback` 里取消 Loading（须配 `currentItem.hasClick`）|
| `clickOutTime(time?)` | 同样 UX 但不发 DP（用于点击式异步动作）|
| `getDpCodeIsExist(code)` | DP 是否在当前 schema 中（`visibilityCondition` 首选）|
| `getDpValueByDevices(code)` | 取 DP 当前快照（非响应式）|
| `getDpCodeByDpId(id)` | dpId → dpCode |
| `getEnumRangeData(code)` / `getEnumRangeIsValid(code, val)` | 枚举 DP 取值/校验 |
| `getTargetEnumDpActionSheetData(code)` | 一键把枚举 DP 转成 ActionSheet 数据 |
| `changePanelInfoState(key, value)` | 写 `panelInfo` slice（弹窗 / ActionSheet / 品牌色等）|
| `getDevId()` / `getDevInfo()` | 当前设备 id / 信息 |
| `getDevCategory('mobilecam')` | 是否为指定品类 |
| `openMiniPanelByCode('setting')` | 跳转设备设置等内置小程序 |
| `showToast(title, icon?)` / `showToastError(result)` | 统一 toast |
| `promisify(api)` | success/fail 风格 API → Promise |
| `storage.get/set/remove(key)` | 设备级 storage（自动以 deviceId 为前缀）|
| `isPad` / `isIOS` / `isIphoneX` / `deviceId` | 端环境常量 |

### `@ray-js/ray-ipc-utils` 高频 API

```ts
goToIpcPageNativeRoute(nativePage, devId): Promise<{code, msg}>
goToMiniProgramByShortLink(shortLink, position?): void
getCameraConfigInfo(devId): Promise<{code, data}>
getIsSupportedCloudStorageSync(devId): Promise<{code, data: boolean}>
addCollectionPointsInfo(devId, name): Promise<{code, msg}>
setNativeStorage(key, data) / getNativeStorage(key): Promise
```

### Redux `panelInfo` slice 速查

```
brandColor          string         品牌色
playerFit           'contain'|'cover'  竖屏播放器填充
isPreviewOn         boolean        是否在预览（驱动 disable 判定）
showSmartPopup      {status, popupData}      全局底部弹窗
showSmartActionSheet{status, actionData, title}  全局枚举选择
customEventDispatch {eventName, data}        跨组件信令
popupHeight         number         弹窗动态高度（home 计算）
isIntercomSupported boolean        对讲是否支持
```

读：`useSelector(selectPanelInfoByKey('xxx'))`；写：`changePanelInfoState('xxx', value)`。

## Critical Rules

- **Must**: 修改 `FeatureMenu` / `TabBar` 配置项前先读 [reference/component/layout-feature.md](./reference/component/layout-feature.md)。
- **Must**: 使用任何 DP 工具前先读 [reference/api/dp-utils.md](./reference/api/dp-utils.md)。
- **Must**: 跳转 native 页或外部小程序、接 VAS 运营 Banner 前先读 [reference/api/service-hall-and-routes.md](./reference/api/service-hall-and-routes.md)。
- **Must**: 路径巡航相关开发先读 [reference/api/path-point-hooks.md](./reference/api/path-point-hooks.md)。
- **Must**: bool 型功能用 `publishDpOutTime` 下发，并在 `dpListenCallback` 里 `currentItem.hasClick && clearPublishDpOutTime()`。
- **Must**: 枚举型功能 `onClick` 只负责 `changePanelInfoState('showSmartActionSheet', ...)`；**不要**自己 publish DP（home 已自动处理）。
- **Must**: popup 型功能除了写组件，**必须**在 `src/config/componentMap.ts` 注册 `componentKey`，否则点击无响应。
- **Must**: `visibilityCondition` 用 `getDpCodeIsExist(code)`，不要用 `dpValue !== undefined` 判断。
- **Must**: 枚举 DP 在 `i18n/strings.ts` 的 key 必须为 `dp_${dpCode}_${rangeItem}`，否则 ActionSheet 文案为空。
- **Must**: 路径巡航 `createPath` 前判断 `wireless_powermode === '1'`（设备充电态），否则会上报 `error: 101`。
- **Must**: 播放器 instance 在 `pages/home` 顶层 `useCtx` 一次，靠 `PlayerIntegrationContext` 透传；子组件用 `useContext(PlayerIntegrationContext)` 读取。
- **Must**: 横屏（`screenType === 'full'`）时不要打开 `Popup` / `ActionSheet`；模板会自动关掉。
- **Must not**: 在 `LayoutFeature` / `pages/feature` 之外重复挂 `devices.common.onDpDataChange` 监听同一 DP（双触发）。
- **Must not**: 在自定义页面再包一次 `<RayErrorCatch>` 或 `<Dialog id="smart-dialog">`（`app.tsx` 已全局挂载）。
- **Must not**: 在 `composeLayout.tsx` 之外重复 `ty.onAppMore(...)`；模板已注册为跳设备设置。
- **Must not**: 用 `ty.publishDps` 直接下发 bool / enum DP（要走 `publishDpOutTime` 才有 Loading 与超时兜底）。
- **Must not**: 在 schema.ts 拷贝条目时不校对 `mode` 字段（已知有 `node` / `wr` 两个拼写陷阱）。
- **Must not**: 把 `deviceId` / token / 任何凭据写进源码或国际化文案。

## References

### Component（组件）

- [layout-feature](./reference/component/layout-feature.md) — 主页功能宫格 + FeatureMenu 字段全表 + 按 type 写 onClick
- [layout-footer](./reference/component/layout-footer.md) — 底部 TabBar 字段全表 + 中心大按钮 + 对讲特殊项
- [ipc-player-integration](./reference/component/ipc-player-integration.md) — 融合播放器 useCtx / initPlayerWidgets / 横屏行为
- [path-manager](./reference/component/path-manager.md) — 路径巡航场景栈 UI + Scene 枚举 + 注册到 componentMap

### API

- [dp-utils](./reference/api/dp-utils.md) — `publishDpOutTime` / `getDpCodeIsExist` / `getTargetEnumDpActionSheetData` 等 DP 工具
- [path-point-hooks](./reference/api/path-point-hooks.md) — `useCreatePath` / `usePlayPath` / `useCurrentPlayPoint` 等路径巡航 hooks
- [service-hall-and-routes](./reference/api/service-hall-and-routes.md) — VAS pageType 6 种跳转规则 + nativePageRoute / miniIdLabs

### Redux

- [panel-info](./reference/redux/panel-info.md) — panelInfo slice 全部 keys + EventName 跨组件信令
