# 路径巡航 Hooks（@/features/path-point）

可移动摄像机路径巡航（创建路径 / 添加点位 / 播放 / 删除）封装 hooks。

## Knowledge

### 来源

- 入口：`src/features/path-point/index.ts`（统一 re-export）
- DP 常量：`src/features/path-point/constant.ts`（`path_dp_code` / `path_dp_node_code` / `path_num_code`）
- 类型：`src/features/path-point/type.ts`（`PathType` / `PointType` / `PlayState`）
- 工具：`src/features/path-point/utils.ts`（`formatJSONStringDpToObject` 等）

### 相关 DP

| DP code | 类型 | 说明 |
|---|---|---|
| `ipc_mobile_path` | `string`（JSON）| Path 级命令（PathType）|
| `ipc_mobile_pathnum` | `value`（1-10）| 当前路径数 |
| `ipc_mobile_pathnode` | `string`（JSON）| Point 级命令（PointType）|
| `wireless_powermode` | `enum '0'/'1'` | `0` 电池 / `1` 充电（创建路径前必须为 `'1'`）|

### 协议枚举

```ts
enum PathType {
  ADD_PATH=1, DELETE_PATH=2, PLAY_PATH=3, END_PLAY_PATH=4,
  ADD_POINT=5, ADD_POINT_SUC=7, ADD_POINT_PATH_SUC=8,
  DELETE_POINT=9, DELETE_POINT_SUC=10,
  UPDATE_PATH_NAME=11, SAVE_PATH=12,
}

enum PointType {
  PLAY_POINT=6, END_PLAY_POINT=7, UPDATE_POINT_NAME=8,
}

enum PlayState { PLAYING=0, FINISH=1, ERROR=2 }
```

### Hooks 列表

| Hook | 签名 | 说明 |
|---|---|---|
| `useCreatePath` | `() => { start(name) => Promise<pathId \| -1> }` | 新建路径；`-1` 表示设备未充电（`wireless_powermode !== '1'`）|
| `useCreatePoint` | `() => { start({ pathId, pathName }) => Promise<pointId> }` | 添加当前位置为路径点 |
| `usePlayPath` | `() => { start({ pathId, pathName }) => Promise; stop() => Promise }` | 播放路径；`onUnload` 自动 `END_PLAY_PATH` |
| `usePlayPoint` | `() => { start({ pathId, pointId }) => Promise; stop() => Promise }` | 单点播放 |
| `useDeletePath` | `() => { start({ pathId, pathName }) => Promise }` | 删除整条路径 |
| `useDeletePointByPath` | `() => { start({ pathId, pointId }) => Promise }` | 删除路径下的某个点 |
| `useFinishSavePath` | `() => { start({ pathId, pathName }) => Promise }` | 完成路径保存（`SAVE_PATH`）|
| `useUpdatePathName` | `() => { start({ pathId, name }) => Promise }` | 重命名路径 |
| `useCurrentPlayPath` | `() => PathData \| undefined` | 当前正在播放的路径（响应式）|
| `useCurrentPlayPoint` | `() => PointData \| undefined` | 当前正在播放的单点（响应式）|

### 标准录制流程

```tsx
import {
  useCreatePath, useCreatePoint, useFinishSavePath,
} from '@/features/path-point';
import { showToast } from '@ray-js/ray';
import Strings from '@/i18n';

export function PathRecorder() {
  const path = useCreatePath();
  const point = useCreatePoint();
  const finish = useFinishSavePath();

  const onStart = async (name: string) => {
    const pathId = await path.start(name);
    if (pathId === -1) {
      showToast({ title: Strings.getLang('pathNeedCharging'), icon: 'none' });
      return;
    }
    // 用户操控移动 → 点"加点"
    await point.start({ pathId, pathName: name });
    // 用户点"完成"
    await finish.start({ pathId, pathName: name });
    showToast({ title: Strings.getLang('savePathSuccess'), icon: 'success' });
  };
}
```

### 直接 DP 操作（仅在 hooks 不满足时）

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

### 监听全局巡航状态

```ts
import { useCurrentPlayPath, useCurrentPlayPoint } from '@/features/path-point';

const playingPath = useCurrentPlayPath();   // PathData | undefined
const playingPoint = useCurrentPlayPoint();  // PointData | undefined
```

`features/path-point/` 已经在内部全局监听 `ipc_mobile_path` / `ipc_mobile_pathnode` 上报，并维护这两个状态；外部不要再挂监听。

## Constraints

- **Must**: 调 `useCreatePath().start()` 之前确保 `wireless_powermode === '1'`；hook 内部已校验，但外部 UI 仍要先做禁用提示。
- **Must**: 解析 JSON DP 上报必须用 `formatJSONStringDpToObject<T>(value)`，否则空字符串会崩。
- **Must**: 路径数 `ipc_mobile_pathnum` 上限 10；UI 需在创建前判断已达上限。
- **Must**: PathManager / 自定义巡航页 unmount 时无需手动 `END_PLAY_PATH` — `usePlayPath` 已挂 `onUnload` 自动停止。
- **Must not**: 重复挂 `onDpDataChange` 监听 `ipc_mobile_path` — 会和 `features/path-point/` 内部监听冲突。
- **Must not**: 在 `useCreatePath` 之外用其他方式创建路径（直接发 `ADD_PATH`）— 上报 `ADD_POINT_PATH_SUC` 时 hook 找不到对应 promise，UI 会卡 Loading。
