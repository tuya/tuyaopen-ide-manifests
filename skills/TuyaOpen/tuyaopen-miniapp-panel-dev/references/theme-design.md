# 视觉风格与主题设计（Theme & Visual Design）

> **本文档适用场景**：用户提出颜色/视觉风格意图（"深色科技感"、"清新绿"、
> "涂鸦默认橙白"），或明确要求设计/修改面板的整体配色基调；
> 以及**任何时候要写圆角、间距、字号**（见 §5 尺寸标度）。
>
> **与其他规范的关系**：本文档管**设计 token 层** —— 颜色（§1–§4）与
> 尺寸标度（§5）。样式写法规范（`.module.less`、CSS Modules、禁止内联 style）
> 仍以 `conventions.md` Rule 4 为准。
>
> **自检**：`scripts/validate.mjs` 会检查 §5 的标度与 §1.2 的变量定义完整性。

---

## 1. 涂鸦面板的颜色体系

面板小程序的颜色体系分两层：

### 1.1 webshell 层（容器壳）

由 `@tuya-miniapp/webshell` 提供，定义在容器的 CSS 里：

```
--webshell-backgroundColor       页面背景（light: #f2f4f6 / dark: #131313）
--webshell-navigationBarBackground  导航栏背景
--webshell-tabBar-selectedColor   tab 选中色（#ff5a28）
```

这些变量控制的是 **壳层**（状态栏、导航栏、底部 tab），在 `app.config.ts` /
`global.config.ts` 里的 `backgroundColor` 与它们对应。开发者一般不需要
自定义这层。

### 1.2 应用主题层（面板内容区）

**面板的设计 token 由开发者自己在 `app.less` 的 `:root {}` 里定义**，
不是由涂鸦 App 注入。这些变量写入 CSS 打包产物后，在本地 web 预览和手机端
WebView 中加载的是同一份 CSS，所以两端完全一致。

变量命名约定（`--app-` 前缀，涂鸦社区通行惯例）：

| 变量 | 语义 | 推荐角色 |
|------|------|---------|
| `--app-B1` | 卡片背景 | 所有功能卡片的 `background` |
| `--app-B2` | 页面/次级背景 | 页面容器、输入框背景、进度条底色 |
| `--app-T1` | 主文字 | 卡片标题、DP 名称 |
| `--app-T2` | 次文字 | DP 值、描述 |
| `--app-T3` | 辅助文字 | DP code、单位、占位符 |
| `--app-M4` | 强调/品牌色 | 开关激活色、pill 选中色、进度条填充 |

**深色模式**：涂鸦 App 在深色模式时给 `:root` 元素添加 `theme='dark'` 属性，
对应 `:root[theme='dark'] {}` 选择器。本地 web 预览时，`ty-shim.ts` 监听
`prefers-color-scheme: dark` 并自动设置同一属性，行为完全一致。

---

## 2. 标准写法

### 2.1 在 app.less 中定义主题 token

```less
/* app.less — 浅色主题（默认） */
:root {
  --app-B1: #ffffff;
  --app-B2: #f5f5f5;
  --app-T1: #1a1a1a;
  --app-T2: #666666;
  --app-T3: #999999;
  --app-M4: #ff7a45;
}

/* 深色主题 — 涂鸦 App 设置 [theme='dark']，ty-shim.ts 本地同步 */
:root[theme='dark'] {
  --app-B1: #1e1e1e;
  --app-B2: #131313;
  --app-T1: #f0f0f0;
  --app-T2: #aaaaaa;
  --app-T3: #666666;
  --app-M4: #ff7a45;
}
```

### 2.2 在 .module.less 中引用主题变量

**必须**使用 `var(--app-X, fallback)` 语法，fallback 作为降级保底：

```less
.card {
  background: var(--app-B1, #ffffff);
}

.title {
  color: var(--app-T1, #1a1a1a);
}

.accent {
  background: var(--app-M4, #ff7a45);
}
```

**禁止**硬编码固定色值（除非是与主题无关的功能色，如错误红 `#f44747`、
成功绿 `#10b981`）：

```less
/* ❌ 错误：硬编码主题色 */
.card {
  background: #ffffff;
  color: #1a1a1a;
}

/* ✅ 正确：走 CSS 变量 + fallback */
.card {
  background: var(--app-B1, #ffffff);
  color: var(--app-T1, #1a1a1a);
}
```

---

## 3. AI 如何根据用户风格意图生成配色方案

### 步骤

1. 理解用户意图（关键词 / 品类 / 情感描述）
2. 映射到六个 token 的具体色值（浅色 + 深色各一套）
3. 直接修改 `src/app.less` 的 `:root {}` 和 `:root[theme='dark'] {}` 块

### 预设方案参考

| 方案名 | `--app-B1` | `--app-B2` | `--app-T1` | `--app-T2` | `--app-T3` | `--app-M4` | 适用品类 |
|--------|-----------|-----------|-----------|-----------|-----------|-----------|---------|
| 涂鸦标准橙白（默认） | `#ffffff` | `#f5f5f5` | `#1a1a1a` | `#666666` | `#999999` | `#ff7a45` | 通用 |
| 深色科技蓝 | `#1e2a3a` | `#131923` | `#e8f0fe` | `#9eaec9` | `#5c6e8a` | `#4285f4` | 智能灯 / 摄像头 |
| 清新绿能 | `#f0faf4` | `#e8f5ec` | `#1a3a28` | `#4a7a5a` | `#88aaaa` | `#34a853` | 能耗 / 环境传感 |
| 家居暖白 | `#fffbf5` | `#faf5ee` | `#2d1f0e` | `#6a4f35` | `#aa9070` | `#e6872b` | 灯具 / 插座 |
| 工业深灰 | `#1c1c1e` | `#111111` | `#ebebf5` | `#8e8e93` | `#636366` | `#ff9f0a` | 工业设备 |

Dark 模式建议：`B1`/`B2` 深色化，`T1`/`T2` 反色，`M4` 保持不变或适当调亮。

### 生成示例（用户说"我想要深色科技感"）

修改 `src/app.less` 中的两个 `:root` 块：

```less
:root {
  --app-B1: #1e2a3a;
  --app-B2: #131923;
  --app-T1: #e8f0fe;
  --app-T2: #9eaec9;
  --app-T3: #5c6e8a;
  --app-M4: #4285f4;
}

:root[theme='dark'] {
  --app-B1: #0d1520;
  --app-B2: #080f18;
  --app-T1: #e8f0fe;
  --app-T2: #9eaec9;
  --app-T3: #5c6e8a;
  --app-M4: #4285f4;
}
```

---

## 4. 深色模式适配

涂鸦 App 会根据手机系统深色模式将 `[theme='dark']` 属性写入面板 WebView 的 `:root`
元素。`ty-shim.ts` 在本地预览时监听 `prefers-color-scheme` 并做同步，所以两端行为
完全一致，开发者只需在 `app.less` 写好 `:root[theme='dark'] {}` 即可，不需要任何
JS 来切换颜色变量。

在 `.module.less` 里，**不需要写 `@media (prefers-color-scheme: dark)`**——
因为颜色变量在 `:root[theme='dark']` 里已经统一覆盖了。

唯一例外：如果某个颜色不走 `--app-*` 变量（例如直接写 `rgba()`），才需要
借助属性选择器：

```less
.hero {
  /* 走变量的颜色自动响应深色模式 */
  background: var(--app-B1, #ffffff);

  /* 不走变量的颜色需要手动适配 */
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
}
:root[theme='dark'] .hero {
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.20);
}
```

---

## 5. 尺寸标度：圆角 / 间距 / 字号

颜色有 `--app-*` 可以指，圆角、间距、字号却没有 —— 这是面板样式最容易长歪的地方。
没有标度就没有判据：没人能判断一处 `26rpx` 到底对不对，也就没人会去改。

### 5.1 标度

单位一律 `rpx`（Ray 响应式单位，750rpx = 屏宽）。

<!-- 这三组是 TuyaOpen IDE 面板视觉标度的 rpx 投影（= px 值 ×2）。
     改动其中一侧时，另一侧必须同步，否则 IDE 侧面板与小程序面板会分叉。 -->

| 组 | 档位（rpx） |
|---|---|
| 圆角 `radius` | `8` · `12` · `16` · `24` · `999`（胶囊） |
| 字号 `text` | `20` · `22` · `24` · `26`（正文） · `28` · `32` · `36` · `44` |
| 间距 `space` | `4` · `8` · `12` · `16` · `24` · `32` · `48` · `64` |

豁免：`0`、百分比（如 `50%` 圆形头像）、`auto`、`calc()`。

### 5.2 定义在 `app.tokens.less`，由 `app.less` 引入

```less
/* app.tokens.less */
:root {
  --app-radius-sm: 8rpx;   --app-radius-md: 12rpx;  --app-radius-lg: 16rpx;
  --app-radius-xl: 24rpx;  --app-radius-pill: 999rpx;

  --app-text-xs: 20rpx;   --app-text-sm: 22rpx;   --app-text-md: 24rpx;
  --app-text-base: 26rpx; --app-text-lg: 28rpx;   --app-text-xl: 32rpx;
  --app-text-2xl: 36rpx;  --app-text-3xl: 44rpx;

  --app-space-2xs: 4rpx;  --app-space-xs: 8rpx;   --app-space-sm: 12rpx;
  --app-space-md: 16rpx;  --app-space-lg: 24rpx;  --app-space-xl: 32rpx;
  --app-space-2xl: 48rpx; --app-space-3xl: 64rpx;
}
```

```less
/* app.less 顶部 */
@import './app.tokens.less';
```

> 只有 `src/app.tsx` 里的 `import './app.less'` 一处样式入口，
> **不 `@import` 就完全不生效**。

### 5.3 在 `.module.less` 中引用

```less
/* ✅ 正确 */
.card {
  background: var(--app-B1, #ffffff);
  border-radius: var(--app-radius-lg, 16rpx);
  padding: var(--app-space-lg, 24rpx);
}
.title { font-size: var(--app-text-xl, 32rpx); }

/* ❌ 错误：字面量不在标度上，且没有名字可复用 */
.card { border-radius: 26rpx; padding: 18rpx; }
.title { font-size: 34rpx; }
```

### 5.4 需要标度外的值时

先问是不是真的需要。如果确实需要（例如某个视觉稿要求的特殊尺寸），
**扩标度而不是写字面量** —— 在 `app.tokens.less` 里加一档并在此表补一行，
让下一个人也能复用。

---

## 6. 不要做的事

- **不要**在 `app.config.ts` 的 `backgroundColor` 里使用品牌色（此字段
  控制导航栏/webshell，应与 `--webshell-backgroundColor` 保持一致，
  通常是 `#f2f4f6`）
- **不要**在多个 `.module.less` 里分别硬编码同一个颜色值——统一走 `--app-*` 变量
- **不要**在 `ty-shim.ts` 里用 `setProperty` 注入颜色——CSS 变量应在 `app.less`
  里定义，两端加载同一份 CSS 才是真正一致；JS 注入只能覆盖本地预览，生产包无效
- **不要**用 `@media (prefers-color-scheme: dark)` 来切换主题色——用
  `:root[theme='dark'] {}` 选择器，与 App 行为保持一致
- **不要**在 `.module.less` 里写圆角 / 间距 / 字号的字面量——走 §5 的
  `--app-radius-*` / `--app-space-*` / `--app-text-*`
- **不要**引用未定义的 `--app-*` 变量。带 fallback 时页面不会崩，但那处样式
  **在深色模式下不会跟随**，属于静默缺陷（`validate.mjs` 会报出来）

---

## 7. 快速自检

颜色方案完成后，在本地浏览器：

```
1. 打开 DevTools → Elements → <html> 标签
2. 切换 OS 深色模式，确认 <html> 上 theme='dark' 属性随之出现/消失
3. DevTools → Elements → :root style，确认 --app-* 变量值已切换
4. 实机扫码，切换手机深色模式，确认面板颜色响应正确
```

尺寸标度与变量定义完整性由脚本检查：

```
node scripts/validate.mjs
```
