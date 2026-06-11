# DP 工具

`src/utils/index.ts` 与 `@ray-js/panel-sdk` 提供的全部 DP 读写工具。

## Knowledge

### 写 DP

| 函数 | 签名 | 用途 |
|---|---|---|
| `publishDpOutTime` | `(code: string, value: any, time?: number = 10000) => void` | **首选**。下发 DP + 显示 Loading + 超时（默认 10s）+ 失败 toast |
| `clickOutTime` | `(time?: number = 10000) => void` | 同样 UX 但不下发 DP（用于异步动作占位）|
| `clearPublishDpOutTime` | `() => void` | 取消 Loading（在 `dpListenCallback` 内调用）|
| `actions.<code>.set(value)` | 来自 `useActions()` | **只用于连续手势**（PTZ / Zoom）；其他场景一律 `publishDpOutTime` |
| `devices.common.publishDps` | `(map: Record<string, any>) => void` | 底层 API；仅在 JSON DP 或多 DP 同步下发时使用 |

### 读 DP

| 函数 | 签名 | 响应式 | 用途 |
|---|---|---|---|
| `useProps` | `(selector?, equalityFn?) => T` | ✓ | 来自 `@ray-js/panel-sdk`，组件内首选 |
| `useStructuredProps` | `(selector?) => T` | ✓ | 仅在 `protocols/index.ts` 注册了 Transformer 时可用；模板默认 `protocols = {}` |
| `getDpValueByDevices` | `(code: string) => any` | ✗ | 取当前快照（非响应式），用于 `initDpValue` |
| `getDpCodeIsExist` | `(code: string) => boolean` | ✗ | DP 是否在 schema 中（`visibilityCondition` 首选）|
| `getDpCodeByDpId` | `(id: number) => string \| undefined` | ✗ | dpId → dpCode |

### 监听 DP

| 函数 | 签名 | 用途 |
|---|---|---|
| `devices.common.onDpDataChange` | `(handler: (msg) => void) => void` | 全局监听（**模板已挂载**，业务代码不要重复挂）|
| `dpListenCallback` 字段 | 在 FeatureMenu 里声明 | 单项级监听副作用（首选）|
| `useEffect(() => useProps(...))` | — | 用 `useProps` 取响应式值，组件级副作用 |

### 枚举 DP 工具

| 函数 | 签名 | 用途 |
|---|---|---|
| `getEnumRangeData` | `(code: string) => string[]` | 拿到枚举 range 数组 |
| `getEnumRangeIsValid` | `(code: string, val: any) => boolean` | 当前值是否在 range 内 |
| `getTargetEnumDpActionSheetData` | `(code: string) => ActionSheetItem[]` | **一键**把枚举 DP 转成 ActionSheet 数据，文案自动从 i18n 取 `dp_${code}_${range}` |

### 标准下发模式（90% 场景）

```ts
// bool / value / string / enum 一律走这个
import { publishDpOutTime, clearPublishDpOutTime } from '@/utils';

onClick: item => publishDpOutTime(item.dpCode, !item.dpValue),
dpListenCallback: (_v, currentItem) =>
  currentItem.hasClick && clearPublishDpOutTime(),
```

### 连续手势模式（PTZ / Zoom）

```ts
import { useActions } from '@ray-js/panel-sdk';

const actions = useActions();

const ptzTimer = useRef<NodeJS.Timeout>();
const onTouchStart = (dir: 'up' | 'down' | 'left' | 'right') => {
  // 立即下发一次
  actions.ptz_control.set(dir);
  // 1s 一次连续下发，直到松手
  ptzTimer.current = setInterval(() => actions.ptz_control.set(dir), 1000);
};
const onTouchEnd = () => {
  clearInterval(ptzTimer.current);
  actions.ptz_stop.set(true);
};
```

### JSON DP（路径巡航 / 收藏点）

```ts
import { devices } from '@/devices';

devices.common.publishDps({
  ipc_mobile_path: JSON.stringify({
    type: PathType.PLAY_PATH,
    data: { pathId, pathName },
  }),
});

// 解析（容错空字符串）
import { formatJSONStringDpToObject } from '@/features/path-point/utils';
const obj = formatJSONStringDpToObject<PathOptions>(rawString);
```

### 已知 schema.ts 拼写陷阱

```diff
- { id: 154, code: 'wireless_powermode', node: 'ro', ... }   // ❌ node 应为 mode
+ { id: 154, code: 'wireless_powermode', mode: 'ro', ... }

- { id: 156, code: 'ipc_direction_control', mode: 'wr', ... } // ❌ mode 应为 'rw'
+ { id: 156, code: 'ipc_direction_control', mode: 'rw', ... }
```

复制这两条时务必校对，否则 `useProps` / `useActions` 拿不到值。

## Constraints

- **Must**: bool / enum / value / string DP 一律 `publishDpOutTime`；不要直接 `ty.publishDps` 或 `devices.common.publishDps`（除非是 JSON / 批量）。
- **Must**: 枚举 DP 弹 ActionSheet 用 `getTargetEnumDpActionSheetData(code)`，i18n key 必须是 `dp_${dpCode}_${rangeItem}`。
- **Must**: `dpListenCallback` 里 `currentItem.hasClick && clearPublishDpOutTime()`，否则非点击触发的上报也会清 Loading。
- **Must**: `visibilityCondition` 用 `getDpCodeIsExist(code)`；不要用 `dpValue !== undefined`。
- **Must**: 连续手势（PTZ/Zoom）用 `useActions`，搭配 `setInterval(..., 1000)` + `xx_stop.set(true)`；松手忘记 `_stop` 会让设备停不下来。
- **Must**: JSON DP 解析必须用 `formatJSONStringDpToObject`，直接 `JSON.parse` 在空字符串上会崩。
- **Must**: 改 `schema.ts` 时校对 `mode`（`ro` / `rw` / `wr`），不要照抄历史拼写错误。
- **Must not**: 在业务代码里再挂 `devices.common.onDpDataChange` 监听；模板已经全局挂了。
- **Must not**: 用 `useStructuredProps` 直到你在 `protocols/index.ts` 注册了对应 Transformer（默认 `protocols = {}`）。
