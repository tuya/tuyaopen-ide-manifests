# 示例（Recipes）

六个端到端示例，挑最接近的一个改造即可。字段语义见 [../reference/](../reference/)，整体流程见 [../SKILL.md](../SKILL.md)。

> 所有片段都假设你的文件里已经有这些 import：
>
> ```ts
> import { router } from '@ray-js/ray';
> import {
>   publishDpOutTime, clearPublishDpOutTime,
>   getDpCodeIsExist, getDpValueByDevices,
>   getTargetEnumDpActionSheetData,
>   getDevId, getDevCategory,
>   changePanelInfoState, showToastError,
> } from '@/utils';
> import { goToIpcPageNativeRoute } from '@ray-js/ray-ipc-utils';
> import { nativePageRoute } from '@/config/cameraData';
> import { devices } from '@/devices';
> import Strings from '@/i18n';
> import { FeatureType, FeatureMenu } from './configData';
> ```

---

## 示例 1 —— bool DP 开关（防闪烁）

主页加一个 `bool` 开关，下发 `anti_flicker` 并随设备上报回显。

### 1. `src/devices/schema.ts`

```ts
{
  id: 250,
  code: 'anti_flicker',
  mode: 'rw',
  property: { type: 'bool' },
  type: 'obj',
  name: '防闪烁',
}
```

### 2. `src/components/layout-feature/configData.ts` —— 追加到 `initData`

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

### 3. `src/i18n/strings.ts`

```ts
en: { moreFeatureAntiFlicker: 'Anti-flicker', ... }
zh: { moreFeatureAntiFlicker: '防闪烁', ... }
```

> **为什么是 `currentItem.hasClick && clearPublishDpOutTime()`？** 网格点击时会把 `hasClick` 置 `true`；如果上报来自外部（其他设备/规则触发），此时本地没有挂着 Loading，再调一次 `clear` 会把别的 Loading 误清掉。

---

## 示例 2 —— 原生页入口（消息中心）

通过 `goToIpcPageNativeRoute` 跳到原生消息面板。

```ts
{
  key: 'featureMessage',
  title: Strings.getLang('homeFeatureMessage'),
  icon: 'feature-message',
  type: FeatureType.nativePage,
  nativePage: nativePageRoute.ipcMessagePanel,
  onClick: async item => {
    const r = await goToIpcPageNativeRoute(item.nativePage, getDevId());
    if (r.code === -1) showToastError(r?.msg?.errorMsg);
  },
  offlineAvailable: true,
  notPreviewAvailable: true,
  isVisible: false,
  showIcon: true,
  visibilityCondition: async () => !getDevCategory('mobilecam'),
}
```

> `goToIpcPageNativeRoute` 返回 `{ code, msg: { errorMsg } }`。非 `0` 必须 toast 出来 —— 吞掉的话用户点了像没反应。

---

## 示例 3 —— 自定义 popup 组件（摇篮曲）

### 1. 写组件

`src/components/featureComponents/lullaby/index.tsx`：

```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import { PopupTitle } from '@/components/popup-title';
import Styles from './index.module.less';

interface IProps {
  title: string;
}

export const Lullaby = ({ title }: IProps) => {
  const playing = useProps(p => p.ipc_lullaby);
  const actions = useActions();

  return (
    <View className={clsx(Styles.comContainer)}>
      <PopupTitle title={title} />
      <View
        className={clsx(Styles.toggle)}
        onClick={() => actions.ipc_lullaby.set(!playing)}
      >
        {playing ? 'Stop' : 'Play'}
      </View>
    </View>
  );
};
```

`src/components/featureComponents/lullaby/index.module.less`：

```less
.comContainer { padding: 32rpx; }
.toggle       { padding: 24rpx; text-align: center; }
```

### 2. 注册到 `src/config/componentMap.ts`

```ts
import { Lullaby } from '@/components/featureComponents/lullaby';

export const componentMap = {
  ptz: Ptz,
  interactive: Interactive,
  remoteControl: RemoteControl,
  pathManager: PathManager,
  todo: Todo,
  lullaby: Lullaby,
};
```

### 3. 统一 re-export（可选）—— `src/components/featureComponents/index.ts`

```ts
export { Lullaby } from './lullaby';
```

### 4. 加菜单项（在 `pages/feature/configData.ts`）

```ts
{
  key: 'lullaby',
  title: Strings.getLang('moreFeatureLullaby'),
  icon: 'lullaby',
  type: FeatureType.popup,
  componentKey: 'lullaby',
  onClick: item => changePanelInfoState('showSmartPopup', {
    status: true,
    popupData: {
      key: 'lullaby',
      title: Strings.getLang('moreFeatureLullaby'),
      componentKey: 'lullaby',
    },
  }),
  offlineAvailable: false,
  notPreviewAvailable: true,
  isVisible: false,
  showIcon: false,
  visibilityCondition: async () => getDpCodeIsExist('ipc_lullaby'),
}
```

> 弹窗高度由 redux 中的 `popupHeight`（home 用 `useContainerDimensions` 计算）驱动。**不要**在组件内自己测量或在 `onAfterEnter` 之前做动画 —— 用 host 提供的 `isReady` 模式。

---

## 示例 4 —— 枚举 DP 弹 ActionSheet（夜视模式）

模板会自动从 schema 构造 ActionSheet 数据，你只需要声明菜单项。

```ts
{
  key: 'featureNightvisionMode',
  title: Strings.getLang('featureNightvisionMode'),
  icon: 'night-vision',
  type: FeatureType.enum,
  dpCode: 'nightvision_mode',
  dpValue: '',
  onClick: () => changePanelInfoState('showSmartActionSheet', {
    status: true,
    actionData: getTargetEnumDpActionSheetData('nightvision_mode'),
  }),
  offlineAvailable: false,
  notPreviewAvailable: true,
  isVisible: false,
  showIcon: false,
  listen: true,
  dpListenCallback: (_v, currentItem) => {
    currentItem.hasClick && clearPublishDpOutTime();
  },
  visibilityCondition: async () => getDpCodeIsExist('nightvision_mode'),
  initDpValue: () => getDpValueByDevices('nightvision_mode'),
}
```

i18n 强制约定（`dp_${dpCode}_${rangeItem}`）：

```ts
en: {
  featureNightvisionMode: 'Night vision',
  dp_nightvision_mode_0: 'Auto',
  dp_nightvision_mode_1: 'Off',
  dp_nightvision_mode_2: 'IR',
  dp_nightvision_mode_3: 'Full color',
}
```

> home 已经把 `onSelectActionSheet` 接到 `publishDpOutTime(dpCode, id)`。**不要**在 `onClick` 里再 publish 一次 —— 会双发。

---

## 示例 5 —— 复用 PTZ 弹窗

通常不写新的 PTZ 弹窗，只是把模板里那个唤起来。

```ts
{
  key: 'featurePtz',
  title: Strings.getLang('homeFeaturePtz'),
  icon: 'ptz-collect',
  type: FeatureType.popup,
  componentKey: 'ptz',  // 已注册
  onClick: () => changePanelInfoState('showSmartPopup', {
    status: true,
    popupData: {
      key: 'featurePtz',
      title: Strings.getLang('homeFeaturePtz'),
      componentKey: 'ptz',
    },
  }),
  offlineAvailable: false,
  notPreviewAvailable: false,
  isVisible: false,
  showIcon: false,
  visibilityCondition: async () => getDpCodeIsExist('ptz_control'),
  iconVisibilityCondition: async () => true,
  availableCondition: async () => true,
}
```

PTZ 组件（`src/components/featureComponents/ptz/index.tsx`）已经处理：

- 长按旋转：`actions.ptz_control.set()` + `setInterval(..., 1000)`
- 松手停止：`actions.ptz_stop.set(true)`
- 缩放：`actions.zoom_control.set()` / `actions.zoom_stop.set(true)`
- 收藏点：`addCollectionPointsInfo(devId, name)`
- PTZ 与收藏点用 `<PublicTabs>` 切换
- 画面上覆盖提示气泡：`playerIntegrationInstance.addContent(...)`

如果你需要别的控件形态（比如摇杆代替方向键），把这个组件复制一份到 `featureComponents/<your-key>` 复用同样的 DP 接线（`actions.ptz_control` / `ptz_stop`）即可。

---

## 示例 6 —— 路径巡航（可移动摄像机）

需求：创建路径 → 移动摄像机加点 → 保存 → 后续播放。整套协议封装在 `src/features/path-point/`。UI 是 `featureComponents/path-manager`。

### 接入入口（`componentMap` 已注册）

```ts
{
  key: 'featurePathManager',
  title: Strings.getLang('homeFeaturePath'),
  icon: 'path',
  type: FeatureType.popup,
  componentKey: 'pathManager',
  onClick: () => changePanelInfoState('showSmartPopup', {
    status: true,
    popupData: {
      key: 'featurePathManager',
      title: Strings.getLang('homeFeaturePath'),
      componentKey: 'pathManager',
    },
  }),
  offlineAvailable: false,
  notPreviewAvailable: false,
  isVisible: false,
  showIcon: true,
  visibilityCondition: async () =>
    getDpCodeIsExist('ipc_mobile_path') && getDevCategory('mobilecam'),
}
```

### 自定义组件里编程式创建路径

```tsx
import { useCreatePath, useCreatePoint, useFinishSavePath }
  from '@/features/path-point';
import { showToast } from '@ray-js/ray';
import Strings from '@/i18n';

export function PathRecorder() {
  const path = useCreatePath();
  const point = useCreatePoint();
  const finish = useFinishSavePath();

  const onStart = async (name: string) => {
    const pathId = await path.start(name);
    if (pathId === -1) return;
    // 用户操控移动并点"加点"
    await point.start({ pathId, pathName: name });
    // 全部点位加完
    await finish.start({ pathId, pathName: name });
    showToast({ title: Strings.getLang('savePathSuccess'), icon: 'success' });
  };
  // ...
}
```

> `useCreatePath().start()` 在 `wireless_powermode !== '1'`（电池态）时 resolve `-1`。Hook 在 `onUnload` 时也会自动清理。

### 监听巡航实时状态

```ts
import { useCurrentPlayPath, useCurrentPlayPoint } from '@/features/path-point';

const playingPath = useCurrentPlayPath();    // PathData | undefined
const playingPoint = useCurrentPlayPoint();   // PointData | undefined
```

### 直接 DP 操作（hooks 不满足时才用）

```ts
import { devices } from '@/devices';
import { path_dp_code } from '@/features/path-point/constant';
import { PathType } from '@/features/path-point/type';

devices.common.publishDps({
  [path_dp_code]: JSON.stringify({
    type: PathType.PLAY_PATH,
    data: { pathId, pathName },
  }),
});
```

解析 JSON DP 上报必须用 `formatJSONStringDpToObject<PathOptions>(value)`（`features/path-point/utils.ts`）—— 设备偶尔会上报空字符串。

---

## 加分项 —— 常用一行代码

```ts
// 跳到设备设置小程序（已经接到右上角"…"按钮，composeLayout 内）
openMiniPanelByCode('setting');

// 响应式取单个 DP
const isPrivate = useProps(p => p.basic_private);

// 响应式取多个 DP（返回对象的 identity 决定是否 re-render）
const { mode, mute } = useProps(p => ({ mode: p.nightvision_mode, mute: p.basic_mute }));

// success/fail 风格的 ty.* 一次性回调 → Promise
const getNg = promisify(ty.getNgRawData);
const { rawData } = await getNg({ rawKey: 'camera_playback_version' });

// 兄弟组件之间发信号（不走 redux）
import { Observers, ObserversEventName } from '@/features/observers';
Observers.on('myPanelEvent', e => console.log(e.data));
Observers.emit('myPanelEvent', { foo: 1 });
```
