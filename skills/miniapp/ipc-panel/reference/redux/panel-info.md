# Redux: panelInfo slice

`src/redux/modules/panelInfoSlice.ts`，模板内所有跨组件状态的中枢。

## Knowledge

### 来源

- Slice：`src/redux/modules/panelInfoSlice.ts`
- 选择器：`selectPanelInfoByKey(key)`（来自同文件）
- 写入工具：`changePanelInfoState(key, value)`（来自 `src/utils/index.ts`）

### 全部 keys

| Key | 类型 | 含义 | 写入方 | 读取方 |
|---|---|---|---|---|
| `brandColor` | `string`（hex）| 品牌色，默认 `#FF592A` | 启动时 `usePanelConfig` 写入 | `useCSSVar` / 任意 UI |
| `playerFit` | `'contain' \| 'cover'` | 竖屏播放器填充 | 同上 | `LayoutPlayer` |
| `isPreviewOn` | `boolean` | 是否预览中（决定 `notPreviewAvailable` 项是否禁用）| `IPCPlayerIntegration.onPlayStatus` | `LayoutFeature` / `LayoutFooter` |
| `showSmartPopup` | `{ status, popupData: {key, title, componentKey, disabledDefaultClose?, ...} }` | 全局底部弹窗 | 任意 `onClick` | `home` 渲染 `<Popup>` |
| `showSmartActionSheet` | `{ status, actionData, title }` | 全局枚举选择 | 枚举型 `onClick` | `home` 渲染 `<ActionSheet>` |
| `customEventDispatch` | `{ eventName: EventName, data }` | 跨组件信令 | `useEventDispatch()` | 业务订阅 |
| `popupHeight` | `number` | 弹窗实测高度 | `home` 用 `useContainerDimensions` 写 | 弹窗内子组件读用于 transition |
| `isIntercomSupported` | `boolean` | 对讲是否支持 | `getCameraConfigInfo` 后写 | TabBar / Intercom |

### `EventName` 枚举

```ts
enum EventName {
  EnumDpChange = 'enumDpChange',
  ValueDpChange = 'valueDpChange',
  Default = 'default',
}
```

### 标准读写

```ts
// 读（首选 selectPanelInfoByKey）
import { useSelector } from 'react-redux';
import { selectPanelInfoByKey } from '@/redux/modules/panelInfoSlice';

const brandColor = useSelector(selectPanelInfoByKey('brandColor'));
const isPreviewOn = useSelector(selectPanelInfoByKey('isPreviewOn'));

// 写（首选 changePanelInfoState）
import { changePanelInfoState } from '@/utils';

changePanelInfoState('brandColor', '#3399FF');
changePanelInfoState('showSmartPopup', {
  status: true,
  popupData: { key: 'foo', title: 'bar', componentKey: 'foo' },
});
```

### `customEventDispatch` 跨组件信令

```ts
// 触发方
import { useEventDispatch } from '@/hooks';
import { EventName } from '@/redux/modules/panelInfoSlice';

const dispatch = useEventDispatch();
dispatch(EventName.EnumDpChange, { dpCode: 'nightvision_mode', value: '1' });

// 订阅方
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectPanelInfoByKey } from '@/redux/modules/panelInfoSlice';

const evt = useSelector(selectPanelInfoByKey('customEventDispatch'));
useEffect(() => {
  if (evt?.eventName === EventName.EnumDpChange) {
    // ... handle
  }
}, [evt]);
```

### `usePanelConfig` 与 `panelCloudFunLabs`（启动时一次性写入）

```ts
// composeLayout.tsx / app.tsx 内（参考实现）
import { usePanelConfig } from '@ray-js/panel-sdk';
import { panelCloudFunLabs } from '@/config/cameraData';

const { fun = {} } = usePanelConfig();
useEffect(() => {
  Object.entries(panelCloudFunLabs).forEach(([labKey, redKey]) => {
    if (fun[labKey] !== undefined) {
      changePanelInfoState(redKey, fun[labKey]);
    }
  });
}, [fun]);
```

## Constraints

- **Must**: 写 panelInfo 一律用 `changePanelInfoState(key, value)`，不要直接 `dispatch(updatePanelInfo({...}))`；前者已经做 shallow merge。
- **Must**: 读 panelInfo 用 `useSelector(selectPanelInfoByKey('xxx'))`；不要写 `state.panelInfo.xxx` —— 字段名重构时会漏改。
- **Must**: 触发 popup / actionSheet 时务必同时写 `status: true`；只写 `popupData` 不会自动打开。
- **Must**: `isPreviewOn` 必须由 `IPCPlayerIntegration.onPlayStatus` 维护；其他业务代码**不要**乱写。
- **Must**: 跨组件信令用 `customEventDispatch` + `EventName`；不要为单个事件再加新 redux key（避免 slice 膨胀）。
- **Must not**: 在 slice 里随便加新 key —— 模板的 8 个 key 已经覆盖 95% 场景；新需求先看 `customEventDispatch` 能否承载。
- **Must not**: 把 `brandColor` 等通过 props 一层层传 — `useCSSVar()` 已经把它输出为 CSS var，根 style 上 `style={cssVar}` 即可。
