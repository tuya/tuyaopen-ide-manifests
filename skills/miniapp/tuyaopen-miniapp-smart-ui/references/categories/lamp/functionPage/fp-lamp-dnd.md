# Capability: Lamp No Disturb Functional Page

通用布尔 DP 开关功能页（**停电勿扰 / 遥控开关**），appid `typsxgb7vfl1unmkbt`。

> 预设策略：
>
> - **停电勿扰（默认 `do_not_disturb`）**：不预设也可跳转，仅当需要自定义文案/i18n 时预设。
> - **遥控开关（`remote_switch` 复用本功能页）**：**必须**预设 `dpCode` 等参数，否则功能页不知道要操作哪个 DP。

## Knowledge

### 注册

```ts
// src/global.config.ts
functionalPages: {
  LampNoDisturbFunctional: { appid: 'typsxgb7vfl1unmkbt' },
}
```

### 停电勿扰（默认）

```ts
import { ty, navigateTo } from '@ray-js/ray';

const jumpUrl = `functional://LampNoDisturbFunctional/home?deviceId=${encodeURIComponent(
  deviceId
)}`;

// 若仅使用默认文案：直接 navigateTo({ url: jumpUrl }) 即可
// 若需要覆盖文案 / 多语言：
ty.presetFunctionalData({
  url: jumpUrl,
  data: {
    i18nKeyMap: {
      title: 'doNotDisturb',
      desc: 'doNotDisturbDesc',
    },
  },
  success: () => navigateTo({ url: jumpUrl }),
  fail: err => console.warn('preset dnd failed', err),
});
```

### 遥控开关（复用，**必须预设**）

```ts
import { ty, navigateTo } from '@ray-js/ray';
import Strings from '@/i18n';

const jumpUrl = `functional://LampNoDisturbFunctional/home?deviceId=${encodeURIComponent(
  deviceId
)}`;

ty.presetFunctionalData({
  url: jumpUrl,
  data: {
    dpCode: 'remote_switch',
    title: Strings.getLang('remoteSwitch'),
    boxDesc: Strings.getLang('remoteSwitchContent'),
    buttonTitle: Strings.getLang('remoteSwitch'),
    buttonDesc: Strings.getLang('remoteSwitchClose'),
  },
  success: () => navigateTo({ url: jumpUrl }),
  fail: err => console.warn('preset remote switch failed', err),
});
```

## Constraints

- **Must**: 在 `global.config.ts` 注册 appid。
- **Must**: 目标布尔 DP 不存在时隐藏入口（`useSupport`）。
- **Must**: 复用为"遥控开关"时必须调 `ty.presetFunctionalData` 预设 `dpCode`（否则功能页默认操作 `do_not_disturb`）。
- **Must**: 所有文案走 i18n（`@/i18n` 的 `Strings.getLang`）。
- **Must not**: 使用位置参 `presetFunctionalData(url, data)`（错误签名，会静默失败）。
