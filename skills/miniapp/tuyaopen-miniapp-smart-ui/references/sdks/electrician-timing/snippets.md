# 可移植片段

以下片段与具体工程无关，**不**依赖宿主的 `@/` 别名。复制进目标工程后，按 `@ray-js/electrician-timing-sdk` 的 README + 类型声明补齐字段与类型，并把 `deviceId` / 宿主 `config` 引用替换为工程对应项。

| 片段 | 用途 |
|------|------|
| [入口 `init`](#on-launch-init) | app 入口：从 URL query 写入宿主 `config` 后调 `init` |
| [DP 就绪后 `changeConfig`](#change-config-after-dp) | 按需：解析后开关或 `devId` / `groupId` 变化时对齐 SDK |
| [最小页面 `ConflictPopup`](#conflict-modal-minimal) | 挂在**页面根节点**；`id` 必须与 `init({ conflictModallId })` 一致 |
| [定时 API 写入示例](#timer-api-samples) | 循环 / 随机 / 点动 / 云 / 倒计时的最小可用写入 |
| [退出 `destroy`](#on-unload-destroy) | 退出时清理 + 解除监听 |

说明：

- 能力聚合（从 URL / DP schema 推断 `support*`）与面板 schema 强耦合，请按工程自行实现。
- 天文不属于 `@ray-js/electrician-timing-sdk`。**不要**从这些片段推断天文 API；日出日落（通过 `@ray-js/ray`）的权威参考见 [./astronomical.md](./astronomical.md)。

<a id="on-launch-init"></a>

## 1. 入口 `init`

在 `src/app.tsx` 的 `onLaunch` 早期调用 `init`。字段名对齐 `type: 'ele'` 的 README-zh_CN.md。将 `yourAppConfig` 替换为宿主 store；值多来自 URL query（`'y'` / `'n'`），DP 未就绪时用 `'auto'`。

```ts
import { init as initSDK } from '@ray-js/electrician-timing-sdk';

type SupportFlag = 'auto' | 'y' | 'n';

interface LaunchQueryLike {
  deviceId?: string;
  groupId?: string;
  supportCycle?: SupportFlag | string;
  supportRandom?: SupportFlag | string;
  supportInching?: SupportFlag | string;
  // Resolved cloud-timer support after panel config, or 'auto' before DP is ready
  supportCloud?: SupportFlag | string;
  cycleCode?: string;
  randomCode?: string;
  inchingCode?: string;
  category?: string;
  is24Hour?: boolean;
  // Single-channel vs multi-channel combine behavior per product
  combineSingleChannelOnly?: boolean;
}

export async function runTimingSdkInitOnLaunch(
  query: LaunchQueryLike,
  yourAppConfig: {
    isSupportNormal?: SupportFlag | string;
    isSupportCycle?: SupportFlag | string;
    isSupportRandom?: SupportFlag | string;
    isSupportInching?: SupportFlag | string;
  },
) {
  const { deviceId, groupId } = query;
  const pick = (v: string | undefined) => (v ? v : 'auto') as SupportFlag;

  await initSDK({
    type: 'ele',
    devId: groupId ? '' : deviceId ?? '',
    groupId: groupId ?? '',
    supportCloud: pick(yourAppConfig.isSupportNormal as string | undefined),
    supportCycle: pick(yourAppConfig.isSupportCycle as string | undefined),
    supportRandom: pick(yourAppConfig.isSupportRandom as string | undefined),
    supportInching: pick(yourAppConfig.isSupportInching as string | undefined),
    cycleCode: query.cycleCode,
    randomCode: query.randomCode,
    inchingCode: query.inchingCode,
    category: query.category,
    is24Hour: query.is24Hour ?? true,
    combineSameData: query.combineSingleChannelOnly === true ? false : true,
    // conflictModallId: 'smart-conflict-popup', // optional; must match page ConflictPopup id
  });
}
```

<a id="change-config-after-dp"></a>

## 2. DP 就绪后 `changeConfig`

**仅当**解析后的 SDK 相关选项与 `init` 时不同（如 `support*` 从 `'auto'` 落定到 `'y'` / `'n'`）或 `devId` / `groupId` 变化时才调用。若 `init` 已用最终值且不再变化，跳过即可。字段形态与 `init` 一致（README）。

```ts
import { changeConfig } from '@ray-js/electrician-timing-sdk';

type SupportFlag = 'auto' | 'y' | 'n';

interface SyncParams {
  deviceId: string;
  groupId?: string;
  // Final flags from schema + panel + URL rules
  isSupportNormal?: SupportFlag | string;
  isSupportCycle?: SupportFlag | string;
  isSupportRandom?: SupportFlag | string;
  isSupportInching?: SupportFlag | string;
  cycleCode?: string;
  randomCode?: string;
  inchingCode?: string;
  category?: string;
  is24Hour: boolean;
  combineSameData: boolean;
}

export function syncTimingSdkAfterDpReady(p: SyncParams) {
  const pick = (v: string | undefined) => (v ? v : 'auto') as SupportFlag;

  changeConfig({
    type: 'ele',
    devId: p.deviceId,
    groupId: p.groupId,
    supportCloud: pick(p.isSupportNormal as string | undefined),
    supportCycle: pick(p.isSupportCycle as string | undefined),
    supportRandom: pick(p.isSupportRandom as string | undefined),
    supportInching: pick(p.isSupportInching as string | undefined),
    cycleCode: p.cycleCode,
    randomCode: p.randomCode,
    inchingCode: p.inchingCode,
    category: p.category,
    is24Hour: p.is24Hour,
    combineSameData: p.combineSameData,
  });
}
```

<a id="conflict-modal-minimal"></a>

## 3. 最小页面 `ConflictPopup`

挂在**页面根节点**（**不要**挂在 app 根）。组件 `id` 必须等于 `init({ conflictModallId })`。`locale` 需完整覆盖 SDK 的 `Locale` 类型 —— 参考 README `ConflictPopup` 章节 + 包类型声明。

```tsx
import React, { useMemo } from 'react';
import { ConflictPopup } from '@ray-js/electrician-timing-sdk/lib/components';
import type { Locale } from '@ray-js/electrician-timing-sdk/lib/interface';

const ConflictModalForPage: React.FC = () => {
  const locale = useMemo((): Locale => {
    return {
      holdTime: 'Hold',
      onHoldTime: 'On {hour}:{minute}',
      offHoldTime: 'Off {hour}:{minute}',
      am: 'AM',
      pm: 'PM',
      action: 'Action',
      countdown: '{hour}:{minute} {action}',
      conflictFailure: 'Replace failed',
      countdownLabel: 'Countdown',
      cycleLabel: 'Cycle',
      randomLabel: 'Random',
      inchingLabel: 'Inching',
      cloudTimeLabel: 'Cloud',
      inchingTime: '{minute}m {second}s',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
      everyday: 'Every day',
      weekend: 'Weekend',
      workday: 'Workday',
      onlyOnce: 'Once',
    } as Locale;
  }, []);

  return (
    <ConflictPopup
      id="smart-conflict-popup"
      title="Timer conflict"
      description="Replace conflicting timers?"
      locale={locale}
      cancelText="Cancel"
      okText="Confirm"
    />
  );
};

export default ConflictModalForPage;
```

<a id="timer-api-samples"></a>

## 4. 定时 API 写入示例

与 README-zh_CN.md 对齐的最小写入示例。仅当当前页挂有 `ConflictPopup` 时才传 `{ useDefaultModal: true }`。

```ts
import {
  electri,
  addCloudTimer,
  createCountdown,
  cancelCountdown,
} from '@ray-js/electrician-timing-sdk';

export async function sampleCycleAdd() {
  await electri.cycle.add(
    {
      id: -1,
      type: 'sdk_cycle',
      startTime: 8 * 60,
      endTime: 18 * 60,
      week: [1, 1, 1, 1, 1, 0, 0],
      status: true,
      actions: [{ code: 'switch_1' }],
      onHoldTime: 100,
      offHoldTime: 100,
    },
    { useDefaultModal: true },
  );
}

export async function sampleRandomAdd() {
  await electri.random.add(
    {
      id: -1,
      type: 'sdk_random',
      startTime: 10 * 60,
      endTime: 12 * 60,
      week: [0, 0, 1, 0, 0, 0, 0],
      status: true,
      actions: [{ code: 'switch_1' }],
    },
    { useDefaultModal: true },
  );
}

export async function sampleInchingAdd() {
  await electri.inching.add(
    {
      id: -1,
      type: 'sdk_inching',
      time: 300,
      status: true,
      actions: [{ code: 'switch_1' }],
    },
    { useDefaultModal: true },
  );
}

export async function sampleCloudAdd() {
  await addCloudTimer(
    {
      aliasName: 'morning',
      startTime: 9 * 60,
      week: [1, 1, 1, 1, 1, 1, 1],
      status: true,
      actions: [{ code: 'switch_1', value: true }],
      isAppPush: false,
    },
    { useDefaultModal: true },
  );
}

export async function sampleCountdown() {
  await createCountdown('countdown_1', 1800, { useDefaultModal: true });
  await cancelCountdown('countdown_1');
}
```

<a id="on-unload-destroy"></a>

## 5. 退出 `destroy`

离开定时模块时按 README 释放 SDK 状态。同时对此前注册的每个监听 `off*`（如 `offCloudUpdate`）。

```ts
import { destroy } from '@ray-js/electrician-timing-sdk';

export function teardownTimingSdk() {
  destroy();
}
```
