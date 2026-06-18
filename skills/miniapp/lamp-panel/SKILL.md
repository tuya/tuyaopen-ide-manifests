---
name: miniapp-lamp-panel
id: miniapp-lamp-panel
description: Use this skill for Tuya（涂鸦）照明品类 Ray 小程序面板开发。当用户涉及以下任意场景时触发：创建或修改灯具面板、DP 类型定义；读写 bright_value / temp_value / colour_data / control_data / scene_data / music_data 等照明 DP；使用 LampBrightSlider、LampTempSlider、LampRectPickerColor 等 lamp-* 组件（含 import 方式、onTouchMove / onTouchEnd 回调）；在 useProps / useStructuredProps / useActions / useStructuredActions 之间选择正确 hook；调用 ty.presetFunctionalData 跳转功能页（定时、断电记忆、灯光渐变）；设计 work_mode 白光/彩光/场景/音乐状态机；排查照明 DP 下发无响应或值域越界。非照明品类（门锁、插座等）不触发。
---

# Skills: ai-lamp-common-skill

## 概述 {#description}

本技能服务于涂鸦照明品类 Ray 小程序面板的 AI 辅助开发，覆盖白光灯、彩光灯、情景灯等主流灯型的全流程能力。核心知识包括 DP 点映射与类型定义、Complex DP 编解码（colour_data / control_data / scene_data / music_data）、work_mode 分支控制、功能页跳转（定时/断电记忆/灯光渐变/停电勿扰）及 lamp-* 组件选型。技能通过 `reference/` 子目录对组件、API、功能页提供完整签名，SKILL.md 速查表仅用于选型，详细用法以 reference 为准。

## 适用场景 {#scene}

- **新建照明面板**：从零搭建白光或彩光灯面板，需要目录结构、DP 类型定义、基础控制页面。
- **实现控制功能**：亮度/色温滑条、RGB/HSV 色盘、场景选择器、工作模式切换、音乐律动。
- **Complex DP 开发**：colour_data 12-bit hex 编解码、control_data 实时预览、scene_data / music_data 下发。
- **功能页接入**：定时、断电记忆、灯光渐变、停电勿扰，含 presetFunctionalData 签名与 appid 注册。
- **调试 DP 通信**：DP 值格式错误、数值越界、下发无响应的排查与修复。
- **不适用**：非涂鸦平台设备、照明之外品类（插座、门锁等）的面板开发。

## 搭配使用 {#usage}

- **RayCommonDevelopSkill**：Ray 小程序开发框架通用技能。覆盖页面/UI、组件、Ray API/设备、生命周期/路由、i18n/样式、排障升级等框架层能力。当照明面板开发涉及路由配置、生命周期管理、构建排错、非照明专属的 Ray API 用法时，结合本技能使用。
- **SmartUISkill**：Ray 小程序 smart-ui 组件库专项技能。覆盖页面搭建、表单与反馈交互、导航展示等 UI 层能力，采用 meta-first 工作流精准筛选组件。照明面板的通用 UI 结构（弹窗、列表、设置项、Toast 等）优先通过本技能落地，避免手写重复样板代码。

## 注意事项 {#tip}

- **Complex DP 读写**：colour_data / control_data / scene_data / music_data 必须用 `useStructuredProps` 读取、`useStructuredActions` 下发，并在 `protocols/index.ts` 注册 Transformer；禁止用 `useProps` 读取。
- **组件导入**：所有 `@ray-js/lamp-*` 组件均为 default export，命名导入（`import { LampXxx }`）会构建失败。
- **`@ray-js/ray` 无 default export**：必须使用命名导入（`import { View, navigateTo } from '@ray-js/ray'`）。
- **功能页跳转顺序**：断电记忆、灯光渐变、定时类功能页必须先调 `ty.presetFunctionalData({ url, data, success, fail })`，再调 `navigateTo`。
- **维护提示**：修改 Critical Rules 或新增功能域后，须同步更新 `evals/evals.json`，确保通过率 ≥ 80% 再提交 MR。

---

用户需求: $ARGUMENTS

## Workflow（每次开发必须遵循）

1. **识别范围**：从需求里圈出要用的 DP、lamp-\* 组件、功能页、云端 code。
2. **先读 reference，再写代码**：

   - 使用任何 `@ray-js/lamp-*` 组件之前，**必须** `Read ./reference/component/<name>.md`，核对 **import 方式、props 名称、必填项、Constraints**。
   - 使用任何云端 API 之前，**必须** `Read ./reference/api/<name>.md`。
   - 跳转任何功能页之前，**必须** `Read ./reference/functionPage/<name>.md`，拿到 `jumpUrl` 与 `presetFunctionalData` 参数。
   - 主 SKILL.md 的"速查表"**只用于选型**，不含完整签名，严禁据此直接写代码。

3. **按清单落地**：Complex DP 注册 → 能力注册 → global.config.ts → i18n → API → 组件/页面 → 构建。
4. **组件内部结构**：hooks/state → 派生状态（如 `const isDisabled = !switchLed`）→ useEffect → useCallback → return JSX。派生状态紧跟 hooks 声明，不要散落在 return 前。
5. **构建验证**：写完必须 `yarn build`，修完所有报错再交付。

## 核心 DP 表

| DP code            | 类型   | 说明                                 | 处理类别                          |
| ------------------ | ------ | ------------------------------------ | --------------------------------- |
| `switch_led`       | bool   | 开关                                 | Basic                             |
| `work_mode`        | enum   | 工作模式（white/colour/scene/music） | Basic                             |
| `bright_value`     | value  | 亮度（10~1000）                      | Basic                             |
| `temp_value`       | value  | 冷暖（0=暖, 1000=冷）                | Basic                             |
| `countdown`        | value  | 倒计时（秒）                         | Basic                             |
| `do_not_disturb`   | bool   | 停电勿扰                             | Basic                             |
| `remote_switch`    | bool   | 遥控器开关                           | Basic（入口复用）                 |
| `colour_data`      | string | 彩光 HSV 编码                        | **Complex**                       |
| `control_data`     | string | 实时调节（滑动中下发）               | **Complex**                       |
| `scene_data`       | string | 场景数据                             | **Complex**                       |
| `music_data`       | string | 音乐律动数据                         | **Complex**                       |
| `rhythm_mode`      | raw    | 生物节律                             | **Complex（功能页）**             |
| `power_memory`     | raw    | 断电记忆                             | **Complex（功能页）**             |
| `switch_gradient`  | raw    | 开关渐变/灯光渐变                    | **Complex（功能页）**             |
| `sleep_mode`       | raw    | 入睡计划                             | **Complex（功能页）**             |
| `wakeup_mode`      | raw    | 唤醒计划                             | **Complex（功能页）**             |
| `cycle_timing`     | raw    | 循环定时                             | **Complex（功能页）**             |
| `random_timing`    | raw    | 随机定时 / 灯光看家                  | **Complex（功能页）**             |
| `candle_mode_data` | raw    | 模拟烛光                             | 按产品能力（通常复用功能页/入口） |
| `debug_data`       | raw    | 调试（gamma）                        | 入口（高级设置区）                |

### 处理类别的差异（一眼区分）

| 类别              | 是否需 Transformer   | 读取 Hook            | 下发 Hook              | 落地方式                                 |
| ----------------- | -------------------- | -------------------- | ---------------------- | ---------------------------------------- |
| Basic             | 否                   | `useProps`           | `useActions`           | 面板内直接读写                           |
| Complex           | **是**（注册）       | `useStructuredProps` | `useStructuredActions` | 面板内直接读写 + 结构化编解码            |
| Complex（功能页） | 否（平台功能页维护） | —                    | —                      | 面板只放入口卡片 → `navigateTo` 到 appid |

**Basic 与 Complex 混用规则**：彩光/场景页既要下发 `colour_data`（Complex）又要下发 `work_mode`（Basic），必须同时持有两个 hook：

```tsx
const actions = useActions(); // work_mode / switch_led / bright_value / temp_value
const structuredActions = useStructuredActions(); // colour_data / control_data / scene_data / music_data

// 调用方式：必须使用 .set() 方法，不能直接当函数调用
actions.switch_led.set(true);
actions.work_mode.set('white');
actions.bright_value.set(500);
structuredActions.colour_data.set({ hue: 120, saturation: 800, value: 900 });
structuredActions.control_data.set({ mode: 1, hue: 120, saturation: 800, value: 900, brightness: 0, temperature: 0 });
```

### Complex DP 编解码

Complex DP 需要在 `src/devices/protocols/` 下创建 Transformer 类，并在 `src/devices/protocols/index.ts` 中注册。

**colour_data** — 12 位 hex，三个 4 位字段：`hhhhssssvvvv`（hue / saturation / value，范围 0~1000）

类型: `{ hue: number; saturation: number; value: number }`

```ts
// src/devices/protocols/ColourTransformer.ts
import { utils } from '@ray-js/panel-sdk';
import { Transformer } from '@ray-js/panel-sdk/lib/protocols/lamp/interface';

export type TColorData = {
  hue: number;
  saturation: number;
  value: number;
};

class ColourTransformer implements Transformer<TColorData> {
  defaultValue: TColorData;
  uuid: string;

  constructor(uuid = 'colour_data', defaultValue: TColorData | null = null) {
    this.defaultValue = { hue: 10, saturation: 1000, value: 1000 };
    this.uuid = uuid;
    if (defaultValue) {
      this.defaultValue = defaultValue;
    }
  }

  parser(value: string): TColorData {
    if (value.length !== 12) {
      return this.defaultValue;
    }
    const step = utils.generateDpStrStep(value);
    return {
      hue: step(4).value,
      saturation: step(4).value,
      value: step(4).value,
    };
  }

  to16(value: number, length = 4): string {
    return utils.decimalToHex(value, length);
  }

  formatter(data: TColorData): string {
    const { hue, saturation, value } = data;
    return `${this.to16(hue)}${this.to16(saturation)}${this.to16(value)}`;
  }
}

export default ColourTransformer;
```

**control_data** — 21 位 hex：`mhhhhssssvvvvbbbbtttt`（mode 1 位 + hue 4 位 + saturation 4 位 + value 4 位 + brightness 4 位 + temperature 4 位）

类型: `{ mode: number; hue: number; saturation: number; value: number; brightness: number; temperature: number }`

用途：仅在滑动过程中下发，松手后下发真实 DP（colour_data / bright_value / temp_value）

```ts
// src/devices/protocols/ControlDataTransformer.ts
import { utils } from '@ray-js/panel-sdk';
import { Transformer } from '@ray-js/panel-sdk/lib/protocols/lamp/interface';

export type IControllData = {
  mode: number;
  hue: number;
  saturation: number;
  value: number;
  brightness: number;
  temperature: number;
};

class ControlDataTransformer implements Transformer<IControllData> {
  defaultValue: IControllData;
  uuid: string;

  constructor(uuid = 'control_data', defaultValue = null) {
    this.defaultValue = {
      mode: 0,
      hue: 10,
      saturation: 1000,
      value: 1000,
      brightness: 0,
      temperature: 0,
    };
    this.uuid = uuid;
    if (defaultValue) {
      this.defaultValue = defaultValue;
    }
  }

  parser(value: string) {
    const step = utils.generateDpStrStep(value);
    return {
      mode: step(1).value,
      hue: step(4).value,
      saturation: step(4).value,
      value: step(4).value,
      brightness: step(4).value,
      temperature: step(4).value,
    };
  }

  to16(value, length = 4) {
    return utils.decimalToHex(value, length);
  }

  formatter(data: IControllData) {
    const { mode = 1, hue = 0, saturation = 0, value = 0, brightness = 0, temperature = 0 } = data;
    return `${this.to16(mode, 1)}${this.to16(hue, 4)}${this.to16(saturation, 4)}${this.to16(
      value,
      4
    )}${this.to16(brightness, 4)}${this.to16(temperature, 4)}`;
  }
}

export default ControlDataTransformer;
```

**注册 Transformer**

```ts
// src/devices/protocols/index.ts
import ColourTransformer from './ColourTransformer';
import ControlDataTransformer from './ControlDataTransformer';

export type { TColorData } from './ColourTransformer';
export type { IControllData } from './ControlDataTransformer';

export const protocols = {
  colour_data: new ColourTransformer('colour_data'),
  control_data: new ControlDataTransformer('control_data'),
};
```

### work_mode 分支与主控件

| work_mode | Tab  | 主控件                                     |
| --------- | ---- | ------------------------------------------ |
| `white`   | 白光 | `LampTempSlider` + `LampBrightSlider`      |
| `colour`  | 彩光 | `LampRectPickerColor` + `LampBrightSlider` |
| `scene`   | 场景 | 推荐场景卡片                               |
| `music`   | 音乐 | `LampMusicCard` 列表                       |

### 功能点实现要点

**关灯禁用**：`switch_led=false` 时：

- `LampBrightSlider` / `LampTempSlider` / `LampRectPickerColor` / `LampCirclePicker*`：**优先使用组件自身的 `disable` / `closed` prop**（见各组件 reference）。
- 预设色卡、模式 Tab、场景卡片等自绘控件：包一层 `pointerEvents: 'none'` + `opacity: 0.4`。
- 音乐/场景模式下是否同样禁用，遵循"灯关一切调节区禁用"的一致性原则。

**开关控制（`switch_led`）**：点击时下发 `switch_led`；若 `countdown > 0`，同步下发 `countdown: 0`；若生物节律已启用且为开灯操作，需重新下发 `rhythm_mode` 使其生效。

**模式切换**：中部 Tab 切换彩光/白光，下发 `work_mode`（`white`/`colour`）。仅支持单模式时隐藏 Tab 栏，直接展示对应控制区域。

**彩光色盘选色**：通过矩形色盘选色（HS），`onTouchMove` 下发 `control_data`（mode=1）实时预览，`onTouchEnd` 下发 `colour_data` + `work_mode='colour'` 持久化。

**彩光亮度调节**：`LampBrightSlider` 调节亮度（10–1000），`onTouchMove` 下发 `control_data`（mode=1），`onTouchEnd` 更新 `colour_data.value` 持久化。注意滑条默认 min-width 为 646rpx，必要时覆盖样式避免溢出。

**白光色温调节**：`LampTempSlider` 调节色温（0–1000），`onTouchMove` 下发 `control_data`（mode=1），`onTouchEnd` 下发 `temp_value` + `work_mode='white'` 持久化。

**白光亮度调节**：`LampBrightSlider` 调节亮度（10–1000），`onTouchMove` 下发 `control_data`（mode=1），`onTouchEnd` 下发 `bright_value` + `work_mode='white'` 持久化。

**彩光预设管理**：云端配置 `colourPresets`（HSV 数组），最多 8 个。点击预设下发 `colour_data` + `work_mode='colour'`；添加时检查重复；删除后同步云端。

**白光预设管理**：云端配置 `whitePresets`（亮度色温数组），最多 8 个。点击预设下发 `temp_value` + `bright_value` + `work_mode='white'`；添加时检查重复；删除后同步云端。

**推荐场景**：从场景库拉取（`/src/api/getSceneData.ts`），禁止伪造兜底数据，推荐展示前 8 个，空态需提供重试入口。选中态：比较设备当前 `scene_data` DP 与条目的 `scene_data`，一致则高亮，DP 变化时同步更新。

**执行推荐场景**：下发 `scene_data`；若 `work_mode` 非 `scene` 则同步下发 `work_mode='scene'`；灯关则先下发 `switch_led=true`。记录执行前的 `scene_data` 值用于退出时回滚恢复。

**音乐律动**：展示 `APP_MUSIC_DATA_LIST` 预设模式，用 `LampMusicCard` 渲染。点击播放设 `work_mode='music'` 并注册 `onMusic2RgbChange`；当前播放项展示 `active` 高亮。

**音乐数据处理**：`onMusic2RgbChange` 回调获取 HSV + 分贝，将 dB 40–80 映射亮度 0–1000。节流 300ms 下发 `music_data`：支持彩光时下发 mode/hue/saturation/value，brightness 和 temperature 设 0；不支持彩光时下发 brightness + temperature。

**颜色预览渲染**：彩光用 `hsv2rgbString(h, s/10, v/10, 1)`，白光用 `brightKelvin2rgba(brightness, temperature)`。禁止用 HSL 拼色或经验公式替代。

**功能页入口**：设置区入口列表，对应 DP 不存在时隐藏。定时（`LampScheduleSetFunction`）、断电记忆/默认灯光（`LampPowerMemoryFunctional`）、灯光渐变/情景酷玩（`LampMutationFunctional`）、停电勿扰（`LampNoDisturbFunctional`）、遥控开关（复用 `LampNoDisturbFunctional`）。生物节律 / 入睡计划 / 唤醒计划 / 循环定时 / 随机定时（灯光看家）统一复用 `LampScheduleSetFunction`。

> 其中 **断电记忆、情景酷玩（灯光渐变）、定时倒计时（含节律类）** 三类功能页**必须**在 `navigateTo` 之前调 `ty.presetFunctionalData` 预设数据，否则功能页无法正确加载；`LampNoDisturbFunctional` 默认跳转可不预设，复用为"遥控开关"时必须预设 `dpCode` 等参数。

### `ty.presetFunctionalData` 签名（一次性对齐）

**原生 API 是对象参，带回调**，不是位置参：

```ts
import { ty } from '@ray-js/ray';

ty.presetFunctionalData({
  url, // 与 navigateTo 完全一致的 functional:// 跳转地址
  data, // 功能页需要的预设参数对象
  success: () => resolve(true),
  fail: err => reject(err),
});
```

推荐统一封装成 Promise，便于 `await`：

```ts
// src/utils/functionalPage.ts
import { ty } from '@ray-js/ray';

export function presetFunctionalData(url: string, data: Record<string, unknown>) {
  return new Promise<true>((resolve, reject) => {
    ty.presetFunctionalData({
      url,
      data,
      success: () => resolve(true),
      fail: err => reject(err),
    });
  });
}
```

之后所有功能页跳转统一：

```ts
await presetFunctionalData(jumpUrl, {
  /* data */
});
navigateTo({ url: jumpUrl });
```

### `useSupport` 前置条件（必须注册 SmartSupportAbility）

`useSupport()` 依赖 `SmartSupportAbility` 能力注册到设备模型。若未注册，`useSupport()` 将无法正常工作。

**必须在 `src/devices/index.ts` 中完成以下配置：**

```ts
import {
  SmartDeviceModel,
  SmartGroupModel,
  SmartSupportAbility,
  createDpKit,
} from '@ray-js/panel-sdk';
import { getLaunchOptionsSync } from '@ray-js/ray';
import { protocols } from '@/devices/protocols';

type SmartLampSupportAbility = SmartSupportAbility<SmartDeviceSchema>;
type Abilities = { support: SmartLampSupportAbility };

const isGroupDevice = !!getLaunchOptionsSync()?.query?.groupId;

export const dpKit = createDpKit<SmartDeviceSchema>({ protocols });

const deviceOptions = {
  abilities: [new SmartSupportAbility()],
  interceptors: dpKit.interceptors,
} as SmartDeviceModel<SmartDeviceSchema>['options'];

const groupOptions = {
  abilities: [new SmartSupportAbility()],
  interceptors: dpKit.interceptors,
} as SmartGroupModel<SmartGroupSchema>['options'];

export const devices = {
  common: isGroupDevice
    ? new SmartGroupModel<SmartGroupSchema, Abilities>(groupOptions)
    : new SmartDeviceModel<SmartDeviceSchema, Abilities>(deviceOptions),
};
```

**使用方式：**

```tsx
import { useSupport } from '@ray-js/panel-sdk';

const support = useSupport();
const hasPowerMemory = support.isSupportDp('power_memory');
const hasSwitchGradient = support.isSupportDp('switch_gradient');

// 隐藏不支持的功能入口
{hasPowerMemory && <PowerMemoryEntry />}
{hasSwitchGradient && <GradientEntry />}
```

## Quick Reference

### 功能页 appid 速查

| 功能页                                              | config name                 | appid                |
| --------------------------------------------------- | --------------------------- | -------------------- |
| 照明定时 / 生物节律 / 入睡 / 唤醒 / 循环 / 随机定时 | `LampScheduleSetFunction`   | `ty56cr7pi6rxiucspo` |
| 停电勿扰 / 遥控开关（复用）                         | `LampNoDisturbFunctional`   | `typsxgb7vfl1unmkbt` |
| 断电记忆                                            | `LampPowerMemoryFunctional` | `tyabzhlpuchrkh7pe8` |
| 开关渐变/灯光渐变                                   | `LampMutationFunctional`    | `tytj0ivsldjndnlnld` |

### 云端存储 code 速查

| code                   | 说明                         |
| ---------------------- | ---------------------------- |
| `colourPresets`        | 彩光预设列表（HSV 数组）     |
| `whitePresets`         | 白光预设列表（亮度色温数组） |

### Component 速查

> **Must**: 任何组件落地前先读对应 reference（props 明细、必填项、Constraints 以 reference 为准）。下列"导入"列为 **可直接复制** 的正确写法，**所有 lamp-\* 组件均为 `export default`**。

| 组件                        | 导入                                                                                                      | 用途                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `LampColorWheel`            | `import LampColorWheel from '@ray-js/lamp-color-wheel'`                                                   | 圆形点选色环（输出 HS）                     |
| `LampHuePicker`             | `import LampHuePicker from '@ray-js/lamp-hue-picker'`                                                     | 环形色相拖拽色盘（输出 hue）                |
| `LampCirclePicker`          | `import LampCirclePicker from '@ray-js/lamp-circle-picker'`                                               | 圆环通用色盘（支持自定义渐变色列表）        |
| `LampCirclePickerColor`     | `import LampCirclePickerColor from '@ray-js/lamp-circle-picker-color'`                                    | 圆形彩光色盘（输出 HS）                     |
| `LampCirclePickerWhite`     | `import LampCirclePickerWhite from '@ray-js/lamp-circle-picker-white'`                                    | 圆形白光色温色盘（输出 temperature）        |
| `LampRectPickerColor`       | `import LampRectPickerColor from '@ray-js/lamp-rect-picker-color'`                                        | 矩形彩光色盘（props: `hs={{h,s}}`）         |
| `LampRectWhitePicker`       | `import LampRectWhitePicker from '@ray-js/lamp-rect-white-picker'`                                        | 矩形色温色盘                                |
| `LampBrightSlider`          | `import LampBrightSlider from '@ray-js/lamp-bright-slider'`                                               | 亮度滑条                                    |
| `LampTempSlider`            | `import LampTempSlider from '@ray-js/lamp-temp-slider'`                                                   | 色温滑条                                    |
| `LampColorSlider`           | `import LampColorSlider from '@ray-js/lamp-color-slider'`                                                 | 色相滑条                                    |
| `LampSaturationSlider`      | `import LampSaturationSlider from '@ray-js/lamp-saturation-slider'`                                       | 饱和度滑条（需传 hue 渲染颜色）             |
| `LampColorCard`             | `import LampColorCard from '@ray-js/lamp-color-card'`                                                     | 预设色卡                                    |
| `LampPercentSlider`         | `import LampPercentSlider from '@ray-js/lamp-percent-slider'`                                             | 水平百分比滑条                              |
| `LampVerticalPercentSlider` | `import LampVerticalPercentSlider from '@ray-js/lamp-vertical-percent-slider'`                            | 竖向百分比滑条                              |
| `LampMusicCard`             | `import LampMusicCard, { musicColorArr1, musicColorArr2, musicColorArr3 } from '@ray-js/lamp-music-card'` | 音乐律动卡片（default + named 混用）        |
| `TabBar`                    | `import TabBar from '@/components/tab-bar'`                                                               | 底部固定 Tab 栏（支持自定义颜色/背景/图标） |

### Props 回调命名（极易写错，一次性对齐）

- 所有 lamp 滑条/色盘的回调：`onTouchStart` / `onTouchMove` / `onTouchEnd`（**不是** `onMove` / `onEnd` / `onChange`）。
- `LampRectPickerColor` / `LampCirclePickerColor` 的值入参：`hs={{ h: number, s: number }}`（**不是** `hue` / `saturation` 两个分开 prop）。
- `LampBrightSlider` / `LampTempSlider` / `LampColorSlider` 的值入参：`value={number}`。
- `LampBrightSlider` 若未指定 `trackStyle.width`，默认 646rpx，窄容器会溢出。

### Ray / 框架导入（极易写错，一次性对齐）

- `@ray-js/ray` **没有 default export**：`import ty from '@ray-js/ray'` ❌。正确做法：按需命名导入 `import { View, Text, navigateTo, getLaunchOptionsSync } from '@ray-js/ray'`。
- `@ray-js/panel-sdk` 工具函数：`import { utils } from '@ray-js/panel-sdk'`，然后 `utils.decimalToHex()`、`utils.generateDpStrStep()` 等。**禁止** `import { decimalToHex } from '@ray-js/panel-sdk/lib/utils'` 深路径写法。
- 云端持久化 **必须**通过 `src/api/cloudConfig.ts` 封装，不得直接调用 `@ray-js/ray` 的 `getDeviceProperty` / `setDeviceProperty`（详见 reference/api/cloud-config.md）。
- 路由跳转使用 `navigateTo`（来自 `@ray-js/ray`）或功能页内的 `router`；所有 URL 参数使用 `encodeURIComponent`。

### useActions / useStructuredActions 调用方式（极易写错，一次性对齐）

`useActions()` 和 `useStructuredActions()` 返回的**不是直接可调用的函数**，而是含有 `.set()` 方法的对象：

```tsx
const actions = useActions();
const structuredActions = useStructuredActions();

// ✅ 正确：必须用 .set() 下发
actions.switch_led.set(true);
actions.work_mode.set('white');
actions.bright_value.set(500);
actions.temp_value.set(300);
structuredActions.colour_data.set({ hue: 120, saturation: 800, value: 900 });
structuredActions.control_data.set({ mode: 1, hue: 0, saturation: 0, value: 0, brightness: 500, temperature: 300 });

// ❌ 错误：不能直接当函数调用
actions.switch_led(true);         // TypeError
actions.work_mode('white');       // TypeError
structuredActions.colour_data({ hue: 120, saturation: 800, value: 900 }); // TypeError
```

布尔类型 DP 额外支持 `.on()` / `.off()` / `.toggle()` 快捷方法：
```tsx
actions.switch_led.toggle(); // 切换开关
```

## Critical Rules

- **Must**: `useActions` / `useStructuredActions` 返回的对象必须通过 `.set()` 方法调用下发 DP，不能直接当函数调用。正确：`actions.switch_led.set(true)`、`structuredActions.colour_data.set({...})`。错误：`actions.switch_led(true)`、`structuredActions.colour_data({...})`。
- **Must**: `@ray-js/panel-sdk` 的工具函数（`decimalToHex` / `generateDpStrStep` 等）通过 `import { utils } from '@ray-js/panel-sdk'` 导入后以 `utils.xxx()` 调用；禁止使用深路径 `import { xxx } from '@ray-js/panel-sdk/lib/utils'`。
- **Must**: 使用任何 `@ray-js/lamp-*` 组件前，先读 `reference/component/<name>.md`，按 reference 抄 import / props。
- **Must**: 使用任何云端 / 场景 / 音乐 API 前，先读 `reference/api/<name>.md`。
- **Must**: 跳转任何功能页前，先读 `reference/functionPage/<name>.md`，按 reference 抄 `jumpUrl` 与 `presetFunctionalData` 参数。
- **Must**: Complex DP 在 `protocols/index.ts` 注册解析器。
- **Must**: `onTouchMove` 下发 `control_data`，`onTouchEnd` 才下发真正 DP。
- **Must**: 开关操作时若 `countdown > 0` 同步清零。
- **Must**: 执行场景时灯关则先下发 `switch_led: true`。
- **Must**: 功能页跳转前在 `global.config.ts` 注册 appid。
- **Must**: 断电记忆（`LampPowerMemoryFunctional`）、情景酷玩/灯光渐变（`LampMutationFunctional`）、定时倒计时/节律类（`LampScheduleSetFunction`）三类功能页，跳转前**必须**调 `ty.presetFunctionalData({ url, data, success, fail })` 预设数据；`LampNoDisturbFunctional` 作为"遥控开关"复用时同样必须预设 `dpCode` 等参数。
- **Must**: `ty.presetFunctionalData` 使用对象参，传入与 `navigateTo` 一致的 `url`、`data`、`success`、`fail`；推荐用 `src/utils/functionalPage.ts` 的 Promise 封装。
- **Must**: 所有路由参数使用 `encodeURIComponent`。
- **Must**: 对应 DP 不存在时隐藏功能入口（用 `useSupport`），前提是 `src/devices/index.ts` 中已注册 `SmartSupportAbility`（含 `abilities: [new SmartSupportAbility()]` 和泛型 `Abilities`）。
- **Must not**: Complex DP 用 `useProps` 读取；Complex DP（即在 `protocols/index.ts` 中注册的 DP）必须用 `useStructuredProps` 读取、`useStructuredActions` 下发。
- **Must not**: 直接使用 `@ray-js/ray` 的 `getDeviceProperty` / `setDeviceProperty` 读写云端持久化属性；统一通过 `src/api/cloudConfig.ts` 的 `getCloudConfig` / `saveCloudConfig` 封装。
- **Must not**: 对 `@ray-js/lamp-*` 组件使用命名导入（`import { LampBrightSlider } from '...'` 会构建失败，所有 lamp 组件均 default export）。
- **Must not**: 将 `actions` / `structuredActions` 作为函数直接调用（如 `actions.work_mode('white')`），必须用 `.set()` 方法。

## References

### 功能页

- [fp-lamp-schedule](./reference/functionPage/fp-lamp-schedule.md) — 照明定时页（含生物节律 / 入睡 / 唤醒 / 循环 / 随机定时）
- [fp-lamp-dnd](./reference/functionPage/fp-lamp-dnd.md) — 停电勿扰 / 遥控开关（复用）
- [fp-lamp-power-memory](./reference/functionPage/fp-lamp-power-memory.md) — 断电记忆页
- [fp-lamp-gradient](./reference/functionPage/fp-lamp-gradient.md) — 灯光渐变页

### API

- [cloud-config](./reference/api/cloud-config.md) — 云端设备属性存储（颜色预设等）**含 devProperty 底层封装**
- [color-utils](./reference/api/color-utils.md) — HSV / RGB / 色温颜色转换工具
- [music-sdk](./reference/api/music-sdk.md) — 音乐律动 SDK
- [scene-recommend](./reference/api/scene-recommend.md) — 系统推荐场景

### Component

- [lamp-color-wheel](./reference/component/lamp-color-wheel.md) — 圆形点选色环
- [lamp-hue-picker](./reference/component/lamp-hue-picker.md) — 环形色相拖拽色盘
- [lamp-circle-picker](./reference/component/lamp-circle-picker.md) — 圆环通用色盘
- [lamp-circle-picker-color](./reference/component/lamp-circle-picker-color.md) — 圆形彩光色盘
- [lamp-circle-picker-white](./reference/component/lamp-circle-picker-white.md) — 圆形白光色温色盘
- [lamp-rect-picker-color](./reference/component/lamp-rect-picker-color.md) — 矩形彩光色盘
- [lamp-rect-white-picker](./reference/component/lamp-rect-white-picker.md) — 矩形色温色盘
- [lamp-bright-slider](./reference/component/lamp-bright-slider.md) — 亮度滑条
- [lamp-temp-slider](./reference/component/lamp-temp-slider.md) — 色温滑条
- [lamp-color-slider](./reference/component/lamp-color-slider.md) — 色相滑条
- [lamp-saturation-slider](./reference/component/lamp-saturation-slider.md) — 饱和度滑条
- [lamp-color-card](./reference/component/lamp-color-card.md) — 预设色卡
- [lamp-percent-slider](./reference/component/lamp-percent-slider.md) — 水平百分比滑条
- [lamp-vertical-percent-slider](./reference/component/lamp-vertical-percent-slider.md) — 竖向百分比滑条
- [lamp-music-card](./reference/component/lamp-music-card.md) — 音乐律动卡片
- [tab-bar](./reference/component/tab-bar.md) — 底部固定 Tab 栏
