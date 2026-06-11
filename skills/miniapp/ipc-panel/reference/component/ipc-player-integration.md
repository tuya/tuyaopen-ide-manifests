# IPCPlayerIntegration（融合播放器）

涂鸦 IPC 融合播放器组件，挂在主页顶部展示实时画面、PTZ 控件、缩放、回放等。

## Knowledge

### 来源

- 包：`@ray-js/ipc-player-integration`
- 模板使用方：`src/components/layout-player/index.tsx`
- 全局上下文：`src/components/layout-player/PlayerIntegrationContext.ts`

### 标准接入流程（在 `pages/home` 顶层做一次）

```tsx
import {
  IPCPlayerIntegration,
  Features,
  Widgets,
  useCtx,
  useStore,
} from '@ray-js/ipc-player-integration';
import { PlayerIntegrationContext } from '@/components/layout-player/PlayerIntegrationContext';

// 1. 用 useCtx 创建播放器实例（带配置）
const ctx = useCtx({
  devId: getDevId(),
  // 启用所需控件
  ...Features.initPlayerWidgets({
    [Widgets.Mute]: true,        // 静音按钮
    [Widgets.HD]: true,          // 清晰度切换
    [Widgets.Talk]: true,        // 对讲（半双工/全双工自动识别）
    [Widgets.Snapshot]: true,    // 截图
    [Widgets.Record]: true,      // 录像
    [Widgets.FullScreen]: true,  // 横屏
    [Widgets.Replay]: false,     // 回放（云/SD 在原生页里，主页一般关掉）
  }),
});

// 2. 用 PlayerIntegrationContext.Provider 把 instance 透传给所有子组件
return (
  <PlayerIntegrationContext.Provider value={ctx}>
    <LayoutPlayer />
    <LayoutFeature />
    {/* ... */}
  </PlayerIntegrationContext.Provider>
);
```

### 子组件读取 instance

```tsx
import { useContext } from 'react';
import { PlayerIntegrationContext } from '@/components/layout-player/PlayerIntegrationContext';

function MyWidget() {
  const ctx = useContext(PlayerIntegrationContext);
  // ctx.instance.addContent(<TipBubble />, { position: 'topRight' });
  // ctx.instance.removeContent(id);
}
```

### 关键 props（IPCPlayerIntegration）

| Prop | 类型 | 必填 | 说明 |
|---|---|---|---|
| `ctx` | `ReturnType<typeof useCtx>` | ✓ | 来自 `useCtx` |
| `style` | `CSSProperties` | ✗ | 容器样式（高度、圆角）|
| `playerFit` | `'contain' \| 'cover'` | ✗ | 竖屏填充模式，默认读 `panelInfo.playerFit` |
| `onPlayStatus` | `(status) => void` | ✗ | 状态回调 — **必须**接，用于联动 `isPreviewOn` |
| `onScreenChange` | `(type: 'half' \| 'full') => void` | ✗ | 横竖屏切换 |

### 联动 `isPreviewOn`（极易忘）

```tsx
<IPCPlayerIntegration
  ctx={ctx}
  onPlayStatus={({ status }) => {
    // 只有播放中（status === 1）才视为"已开预览"
    changePanelInfoState('isPreviewOn', status === 1);
  }}
/>
```

`isPreviewOn` 决定了所有 `notPreviewAvailable: false` 的 FeatureMenu / TabBar 项是否禁用 — 不联动会导致整页常态禁用。

### 横屏行为（重要）

- 横屏时模板**自动**关闭 `Popup` / `ActionSheet`（home 监听 `screenType`），不要在自定义弹窗里再做一遍。
- 横屏需要的额外控件用 `instance.addContent(<Comp />, { position })` 挂到播放器内部图层上（PTZ 子页就是这么做的）。

## Constraints

- **Must**: `useCtx` 在 `pages/home` 顶层调用 **一次**；其他位置（PTZ / VAS / Footer 等）通过 `useContext(PlayerIntegrationContext)` 获取。
- **Must**: 必须接 `onPlayStatus` 并 `changePanelInfoState('isPreviewOn', ...)`；否则 90% 的功能项都会被禁用。
- **Must**: `playerFit` 写云端 `panelCloudFunLabs.tyabijq3gf`；模板已经在启动时把它写到 redux，子组件直接读 `panelInfo.playerFit` 即可。
- **Must**: 涉及对讲（`Widgets.Talk`）时，需先 `getCameraConfigInfo(devId)` 拿到 `isIntercomSupported` 写到 redux，再决定是否打开。
- **Must not**: 在子组件里重复 `useCtx` — 会造成两个 instance 互踩状态。
- **Must not**: 自己监听全屏事件再去关 `Popup`；模板已经监听 `screenType` 自动关。
- **Must not**: 对群组设备（`getLaunchOptionsSync().query.groupId` 存在）调用播放器；融合播放器要求单设备 `devId`。
