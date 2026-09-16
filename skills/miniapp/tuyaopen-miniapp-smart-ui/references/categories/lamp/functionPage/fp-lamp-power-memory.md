# Capability: Lamp Power Memory Functional Page

断电记忆 / 默认灯光功能页，appid `tyabzhlpuchrkh7pe8`。对应 DP：`power_memory`。

> **必须预设数据**：进入此页前若未调 `ty.presetFunctionalData`，功能页无法正确显示已收藏的彩光/白光列表。

## Knowledge

### 注册

```ts
// src/global.config.ts
functionalPages: {
  LampPowerMemoryFunctional: { appid: 'tyabzhlpuchrkh7pe8' },
}
```

### 预设默认数据

当 `cloudConfig` 中尚无收藏数据时，使用以下默认值兜底，保证功能页至少能展示 3 种彩光 + 3 种白光：

```ts
const DEFAULT_COLLECT_COLORS = [
  { hue: 0, saturation: 1000, value: 1000 }, // 红
  { hue: 120, saturation: 1000, value: 1000 }, // 绿
  { hue: 240, saturation: 1000, value: 1000 }, // 蓝
];

const DEFAULT_COLLECT_WHITES = [
  { temperature: 0, brightness: 1000 }, // 最暖
  { temperature: 500, brightness: 1000 }, // 中性
  { temperature: 1000, brightness: 1000 }, // 最冷
];
```

### 跳转（必须预设）

```ts
import { ty, navigateTo } from '@ray-js/ray';
import { getCloudConfig } from '@/api/cloudConfig';

const jumpUrl = `functional://LampPowerMemoryFunctional/home?deviceId=${encodeURIComponent(
  deviceId
)}`;

// 从云端读取收藏数据，无数据时回退到默认值
const collectColors =
  (await getCloudConfig<typeof DEFAULT_COLLECT_COLORS>('colourPresets')) ?? DEFAULT_COLLECT_COLORS;
const collectWhites =
  (await getCloudConfig<typeof DEFAULT_COLLECT_WHITES>('whitePresets')) ?? DEFAULT_COLLECT_WHITES;

ty.presetFunctionalData({
  url: jumpUrl,
  data: { collectColors, collectWhites },
  success: () => navigateTo({ url: jumpUrl }),
  fail: err => console.warn('preset power memory failed', err),
});
```

> 推荐封装成 Promise（见 `SKILL.md` 的 `presetFunctionalData` helper），改为 `await presetFunctionalData(jumpUrl, { collectColors, collectWhites })` 后再 `navigateTo`。

## Constraints

- **Must**: 在 `global.config.ts` 注册 appid。
- **Must**: 必须有 `power_memory` DP，否则隐藏入口（用 `useSupport`）。
- **Must**: 跳转前调 `ty.presetFunctionalData`，`url` 与 `navigateTo` 的 `url` 完全一致。
- **Must**: `collectColors` / `collectWhites` 优先从 `cloudConfig`（key: `colourPresets` / `whitePresets`）读取；云端无数据时回退到 `DEFAULT_COLLECT_COLORS` / `DEFAULT_COLLECT_WHITES` 默认值，禁止传空数组。
- **Must not**: 使用位置参 `presetFunctionalData(url, data)`（错误签名，会静默失败）。
