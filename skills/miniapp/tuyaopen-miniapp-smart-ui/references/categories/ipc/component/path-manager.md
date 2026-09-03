# PathManager（路径巡航场景管理）

可移动摄像机的路径巡航 UI 入口，承载创建路径 / 添加点位 / 播放路径 / 列表管理四个 Scene。

## Knowledge

### 来源

- 组件：`src/components/featureComponents/path-manager/index.tsx`
- 子 Scene：`src/components/featureComponents/path-manager/scenes/`
- 公用 hooks：`src/features/path-point/`（详见 [api/path-point-hooks.md](../api/path-point-hooks.md)）
- 注册：`src/config/componentMap.ts` 中 key 为 `pathManager`

### 在 `componentMap` 中已注册

```ts
// src/config/componentMap.ts
import { PathManager } from '@/components/featureComponents/path-manager';

export const componentMap = {
  ptz: Ptz,
  interactive: Interactive,
  remoteControl: RemoteControl,
  pathManager: PathManager,
  todo: Todo,
};
```

不需要二次注册；只需在 `configData.ts` 里写：

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
  visibilityCondition: async () =>
    getDpCodeIsExist('ipc_mobile_path') && getDevCategory('mobilecam'),
  // ... 其他通用字段
}
```

### Scene 切换状态机

| Scene | 进入条件 | 关键 hook |
|---|---|---|
| `home` | 首次打开 | — |
| `create` | 点击"新建路径" | `useCreatePath` / `useCreatePoint` / `useFinishSavePath` |
| `play` | 点击列表中的某条路径 | `usePlayPath` / `useCurrentPlayPath` / `useCurrentPlayPoint` |
| `edit` | 点击列表"编辑" | `useUpdatePathName` / `useDeletePath` |

PathManager 内部用一个 `scene` state 管理切换；外部不要直接控制 scene，而是通过 `popupData.scene` 传入初始 scene：

```ts
changePanelInfoState('showSmartPopup', {
  status: true,
  popupData: {
    key: 'featurePathManager',
    componentKey: 'pathManager',
    scene: 'create',   // 直接进入新建场景
  },
});
```

### 与播放器联动（自动）

PathManager 内部会通过 `useContext(PlayerIntegrationContext)` 拿到 instance：

- 进入 `create` 场景时调 `instance.addContent(<RecordingTip />, ...)` 在画面上方加录制提示。
- 进入 `play` 场景时调 `instance.addContent(<PlayingPointTip />, ...)`。
- 退出场景 `removeContent`。

不需要外部协调；如果你新写一个类似组件，照抄这个交互即可。

### 与 DP 的关系（**不要**直接读写）

巡航 DP（`ipc_mobile_path` / `ipc_mobile_pathnode` / `ipc_mobile_pathnum`）由 `features/path-point/` 下的 hooks 封装。**禁止**绕过 hooks 直接 `devices.common.publishDps({ ipc_mobile_path: '...' })`，否则上报回来的 JSON 解析路径不一致。

## Constraints

- **Must**: 入口配置 `visibilityCondition` 必须同时检查 `getDpCodeIsExist('ipc_mobile_path')` 与 `getDevCategory('mobilecam')`；非可移动机型不可见。
- **Must**: 创建路径前，hooks 内部已校验 `wireless_powermode === '1'`（充电态）。如果你自己在 PathManager 之外触发 `useCreatePath().start()`，必须自行先做这个判断。
- **Must**: 改动 PathManager 内部场景流程时同步看 `usePlayPath` 的清理逻辑（`onUnload` 自动 `END_PLAY_PATH`）。
- **Must not**: 在 PathManager 之外另起一份 `ipc_mobile_path` 监听 — `features/path-point/` 内已经全局监听并维护 `currentPlayPath` / `currentPlayPoint`。
- **Must not**: 把 PathManager 直接渲染进 home，必须走 `componentMap` + `showSmartPopup`，否则状态机会丢失。
