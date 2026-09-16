# Capability: Lamp Gradient Functional Page

灯光渐变 / 开关渐变 / **情景酷玩** 功能页，appid `tytj0ivsldjndnlnld`。对应 DP：`switch_gradient`。

> 本页即产品文案中常见的"情景酷玩"入口。**必须预设数据**，否则功能页无法正确加载主题与初始配置。

## Knowledge

### 注册

```ts
// src/global.config.ts
functionalPages: {
  LampMutationFunctional: { appid: 'tytj0ivsldjndnlnld' },
}
```

### 跳转（必须预设）

```ts
import { ty, navigateTo } from '@ray-js/ray';

const jumpUrl = `functional://LampMutationFunctional/home?deviceId=${encodeURIComponent(deviceId)}`;

ty.presetFunctionalData({
  url: jumpUrl,
  data: {
    cardStyle: { background: '#1a1a1a' },
    // 可选：主题色、初始渐变模式等
    // themeConfig: { themeType: 'dark', themeColor: '#FF8A3D' },
  },
  success: () => navigateTo({ url: jumpUrl }),
  fail: err => console.warn('preset gradient failed', err),
});
```

> 推荐 `await presetFunctionalData(jumpUrl, { ... })` 后再 `navigateTo`（helper 见 `SKILL.md`）。

## Constraints

- **Must**: 在 `global.config.ts` 注册 appid。
- **Must**: 必须有 `switch_gradient` DP，否则隐藏入口（用 `useSupport`）。
- **Must**: 跳转前调 `ty.presetFunctionalData`，`url` 与 `navigateTo` 的 `url` 完全一致。
- **Must not**: 使用位置参 `presetFunctionalData(url, data)`（错误签名）。
