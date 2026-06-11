# LayoutFeature & FeatureMenu

主页功能宫格组件，由 `FeatureMenu[]` 数组声明式驱动。

## Knowledge

### 来源

- 组件：`src/components/layout-feature/index.tsx`
- 配置：`src/components/layout-feature/configData.ts`（主页）/ `src/pages/feature/configData.ts`（"更多"页，结构完全一致）
- 缓存：解析后的列表会写入 `${deviceId}_layout_feature_menu` 原生存储，冷启动后立即渲染。

### `FeatureMenu` 字段全表

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `key` | `string` | ✓ | 数组内唯一 ID |
| `title` | `string` | ✓ | 用 `Strings.getLang('...')` |
| `icon` | `string` | ✓ | iconfont 名（`src/res/iconfont` 内）|
| `type` | `FeatureType` | ✓ | `bool` / `enum` / `popup` / `miniPage` / `nativePage` |
| `onClick` | `(item) => void` | ✓ | 见下文 "按 type 写 onClick" |
| `isVisible` | `boolean` | ✓ | 同步态默认值；真实值来自 `visibilityCondition` |
| `showIcon` | `boolean` | ✓ | 同步态图标可见默认值 |
| `offlineAvailable` | `boolean` | ✓ | **优先级最高** 的 disable 判定 |
| `notPreviewAvailable` | `boolean` | ✓ | `false` 时设备未预览将禁用 |
| `isAvailable` | `boolean` | ✗ | 业务级 enable，配 `availableCondition` |
| `dpCode` | `string` | ✗ | `bool` / `enum` 必填 |
| `dpValue` | `bool \| string \| number` | ✗ | 由模板自动维护，写默认值即可 |
| `listen` | `boolean` | ✗ | `true` 时上报后调用 `dpListenCallback` |
| `dpListenCallback` | `(value, currentItem) => void` | ✗ | 上报副作用（清 Loading 等）|
| `initDpValue` | `() => any \| Promise<any>` | ✗ | 异步初始值（常用 `getDpValueByDevices(code)`）|
| `visibilityCondition` | `() => Promise<boolean>` | ✗ | 异步显隐判定，**首选这个**而不是 `isVisible` |
| `iconVisibilityCondition` | `() => Promise<boolean>` | ✗ | 异步图标显隐 |
| `availableCondition` | `() => Promise<boolean>` | ✗ | 异步 enable |
| `componentKey` | `string` | ✗ | `type='popup'` 必填，**必须**在 `componentMap` 中注册 |
| `nativePage` | `string` | ✗ | `type='nativePage'` 必填（用 `nativePageRoute`）|
| `miniPage` | `string` | ✗ | `type='miniPage'` 必填，小程序内 `router.push` 路径 |

### `FeatureType` 枚举

```ts
enum FeatureType {
  bool = 'bool',           // 开关 DP
  enum = 'enum',           // 打开 ActionSheet
  popup = 'popup',         // 打开底部弹窗（componentMap 渲染）
  miniPage = 'miniPage',   // 小程序内跳转（router.push）
  nativePage = 'nativePage' // 原生面板（goToIpcPageNativeRoute）
}
```

### 按 type 写 onClick（**必须照抄**）

```ts
// bool —— publishDpOutTime 走 Loading + 超时
onClick: item => publishDpOutTime(item.dpCode, !item.dpValue),

// enum —— 仅打开 ActionSheet，不要自己 publish
onClick: () => changePanelInfoState('showSmartActionSheet', {
  status: true,
  actionData: getTargetEnumDpActionSheetData('your_dp_code'),
}),

// popup —— componentKey 必须在 componentMap 注册
onClick: item => changePanelInfoState('showSmartPopup', {
  status: true,
  popupData: { key: item.key, title: item.title, componentKey: 'yourCompKey' },
}),

// nativePage
onClick: async item => {
  const r = await goToIpcPageNativeRoute(item.nativePage, getDevId());
  if (r.code === -1) showToastError(r?.msg?.errorMsg);
},

// miniPage
onClick: item => router.push(item.miniPage),
```

### 完整最小示例（bool 开关）

```ts
{
  key: 'antiFlicker',
  title: Strings.getLang('moreFeatureAntiFlicker'),
  icon: 'anti-flicker',
  type: FeatureType.bool,
  dpCode: 'anti_flicker',
  dpValue: false,
  onClick: item => publishDpOutTime(item.dpCode, !item.dpValue),
  offlineAvailable: false,
  notPreviewAvailable: true,
  isVisible: false,
  showIcon: false,
  listen: true,
  dpListenCallback: (_v, currentItem) =>
    currentItem.hasClick && clearPublishDpOutTime(),
  visibilityCondition: async () => getDpCodeIsExist('anti_flicker'),
  initDpValue: async () => getDpValueByDevices('anti_flicker'),
}
```

## Constraints

- **Must**: bool 型必须用 `publishDpOutTime`（带 Loading + 超时），不要直接 `ty.publishDps`。
- **Must**: enum 型 `onClick` 仅 `changePanelInfoState('showSmartActionSheet', ...)`；home 已自动 `publishDpOutTime` 选中项，**不要**重复 publish。
- **Must**: popup 型必须在 `src/config/componentMap.ts` 注册 `componentKey`，否则点击无响应。
- **Must**: `dpListenCallback` 里 `currentItem.hasClick && clearPublishDpOutTime()`，否则非点击触发的上报也会清 Loading。
- **Must**: `visibilityCondition` 用 `getDpCodeIsExist(code)`；不要写 `dpValue !== undefined`（首次渲染时 dpValue 还没填进来）。
- **Must**: 改完 configData.ts 后必要时清掉原生存储 `${deviceId}_layout_feature_menu` 才能立即生效。
- **Must not**: 在 `LayoutFeature` 之外再挂 `devices.common.onDpDataChange` 监听同一 DP（双触发）。
- **Must not**: 在 `onClick` 里再写防抖；模板的 `publishDpOutTime` 已经管 Loading 单飞。
