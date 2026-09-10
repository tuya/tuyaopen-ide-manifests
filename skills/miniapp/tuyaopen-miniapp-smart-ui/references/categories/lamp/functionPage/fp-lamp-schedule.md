# Capability: Lamp Schedule Functional Page

照明定时功能页，**统一承载所有"定时 / 节律类"DP** 的入口，appid `ty56cr7pi6rxiucspo`。

## 覆盖 DP

| DP code         | 入口文案（示例）     | 说明                 |
| --------------- | -------------------- | -------------------- |
| `countdown`     | 倒计时               | 基础计时关灯         |
| `rhythm_mode`   | 生物节律             | 24 小时色温/亮度节律 |
| `sleep_mode`    | 灯光助眠             | 渐暗入睡             |
| `wakeup_mode`   | 灯光唤醒             | 渐亮唤醒             |
| `cycle_timing`  | 循环定时             | 周期性开关           |
| `random_timing` | 灯光看家（随机定时） | 随机时间开关模拟在家 |

> 这些 DP **不需要** Transformer。面板只放入口卡片 → 跳转本功能页，具体编辑由功能页接管。

## Knowledge

### 注册

```ts
// src/global.config.ts
functionalPages: {
  LampScheduleSetFunction: { appid: 'ty56cr7pi6rxiucspo' },
}
```

### 跳转（通用模板，**必须预设**）

```ts
import { ty, navigateTo, getLaunchOptionsSync } from '@ray-js/ray';

const { query } = getLaunchOptionsSync();
const deviceId = query?.deviceId || '';
const groupId = query?.groupId || '';

const jumpUrl = `functional://LampScheduleSetFunction/home?deviceId=${encodeURIComponent(
  deviceId
)}&groupId=${encodeURIComponent(groupId)}`;

ty.presetFunctionalData({
  url: jumpUrl,
  data: {
    rhythmsType: 1, // 节律类入口使用
    cloudTimerCategory: 'category_timer', // 倒计时 / 循环 / 随机定时区分
    themeConfig: { themeType, bgColor, themeColor },
    // 按需增加：dpCode: 'sleep_mode' | 'wakeup_mode' | 'cycle_timing' | 'random_timing'
  },
  success: () => navigateTo({ url: jumpUrl }),
  fail: err => console.warn('preset schedule failed', err),
});
```

> 推荐：项目内封装 `presetFunctionalData(url, data): Promise<true>`（见 `SKILL.md`），改为 `await presetFunctionalData(jumpUrl, { ... })` 后再 `navigateTo`，更易读。

### 按 DP 区分入口参数

| DP              | 关键 preset 参数                                                      |
| --------------- | --------------------------------------------------------------------- |
| `countdown`     | `cloudTimerCategory: 'category_timer'`                                |
| `rhythm_mode`   | `rhythmsType: 1`（可配合 `dpCode: 'rhythm_mode'`）                    |
| `sleep_mode`    | `dpCode: 'sleep_mode'`（渐暗，建议 `themeColor` 偏暖）                |
| `wakeup_mode`   | `dpCode: 'wakeup_mode'`（渐亮）                                       |
| `cycle_timing`  | `dpCode: 'cycle_timing'`，`cloudTimerCategory: 'cycle'`               |
| `random_timing` | `dpCode: 'random_timing'`，`cloudTimerCategory: 'random'`（灯光看家） |

> 具体 preset 字段以平台版本为准；若不确定，先传最小参数 `{ deviceId }` 让功能页自读 DP，再按需补充。

## Constraints

- **Must**: 在 `global.config.ts` 注册 `LampScheduleSetFunction` appid。
- **Must**: 对应 DP 不存在时隐藏入口（用 `useSupport`）。
- **Must**: URL 参数全部 `encodeURIComponent`。
- **Must**: 跳转前调 `ty.presetFunctionalData({ url, data, success, fail })` 对象参版本，`url` 与 `navigateTo` 的 `url` 完全一致。
- **Must**: 节律类入口必须预设 `rhythmsType` / `dpCode` / `cloudTimerCategory`，否则功能页无法区分业务类型。
- **Must not**: 使用位置参 `presetFunctionalData(url, data)` 或 `ty.device.presetFunctionalData`（错误签名/路径）。
- **Must not**: 在面板里自建 `sleep_mode` / `wakeup_mode` / `cycle_timing` / `random_timing` 的表单编辑页（统一复用本功能页）。
- **Must not**: 把 `rhythm_mode` 作为普通 Complex DP 注册 Transformer（是功能页 Complex）。
