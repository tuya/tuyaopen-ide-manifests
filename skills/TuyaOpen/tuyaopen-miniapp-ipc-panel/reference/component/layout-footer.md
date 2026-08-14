# LayoutFooter & TabBar

底部 TabBar 组件，由 `TabBar[]` 数组声明式驱动，含中心大按钮与对讲特殊项。

## Knowledge

### 来源

- 组件：`src/components/layout-footer/index.tsx`
- 配置：`src/components/layout-footer/configData.ts`
- 缓存：`${deviceId}_layout_tab_menu`

### `TabBar` 字段（与 `FeatureMenu` 仅以下不同）

| 字段 | 替代了 | 说明 |
|---|---|---|
| `label` | `title` | 显示文案 |
| `onPress` | `onClick` | 点击回调 |
| `isCenter` | （新增）| `true` 标记为中心大按钮（最多 1 个）|

其他字段（`key` / `icon` / `type` / `dpCode` / `listen` / `dpListenCallback` / `visibilityCondition` / `componentKey` / `nativePage` / `offlineAvailable` / `notPreviewAvailable` 等）含义与 `FeatureMenu` 完全一致，参见 [layout-feature.md](./layout-feature.md)。

### 中心大按钮触发条件

可见 tab 数为 **3 或 1 个** 且其中一个 `isCenter: true` 时，模板会把它渲染为中心放大按钮。其他情况下 `isCenter` 失效。

### 对讲项（特殊）

`intercom` 这一项不是普通 TabBar 项，由 `layout-footer/components/Intercom` 渲染（按住说话）。它内部已经接好 SDK，**不要**自己再挂事件、不要在外层重复监听。

```ts
{
  key: 'intercom',
  isCenter: true,
  // 其余字段 LayoutFooter 内部会用专门的 Intercom 组件接管
}
```

### 完整最小示例（云存入口）

```ts
{
  key: 'cloudPlayback',
  label: Strings.getLang('homeFeatureCloud'),
  icon: 'cloud',
  type: FeatureType.nativePage,
  nativePage: nativePageRoute.ipcCloudPanel,
  onPress: async item => {
    const r = await goToIpcPageNativeRoute(item.nativePage, getDevId());
    if (r.code === -1) showToastError(r?.msg?.errorMsg);
  },
  offlineAvailable: false,
  notPreviewAvailable: true,
  isVisible: false,
  showIcon: true,
  visibilityCondition: async () => {
    const { code, data } = await getIsSupportedCloudStorageSync(getDevId());
    return code === 0 && data === true;
  },
}
```

## Constraints

- **Must**: 字段名用 `label` / `onPress`，**不是** `title` / `onClick`（FeatureMenu 才用后者）。
- **Must**: 中心大按钮最多 1 个；冲突时按数组顺序生效第一个。
- **Must**: `intercom` 的逻辑在 `Intercom` 子组件内，外面只声明这一项，不要自己实现按住说话。
- **Must**: 修改后清 `${deviceId}_layout_tab_menu` 缓存才能立即生效。
- **Must not**: 把 `onClick` 写在 TabBar 项里 — 不会被触发（LayoutFooter 只读 `onPress`）。
- **Must not**: 把 `intercom` 放成普通项再 `onPress` 自己实现 — 会和模板的 Intercom 双触发。
