---
name: miniapp/panel-foundation
description: >-
  Foundational guide for Tuya Ray miniapp panel projects scaffolded by
  TuyaOpen IDE. Covers the real on-disk project layout (`project.tuya.json`,
  `app.config.ts`, `src/devices/schema.ts`, `src/pages/`), the required Ray +
  panel-sdk + createDpKit bootstrap, the DP-driven development model
  (useProps / useActions for DPs, useState only for local UI state), the ty.*
  global API surface, and the pre-submission audit checklist for Tuya MiniApp
  platform upload. Use this FIRST when working in any panel miniapp project
  before reaching for category-specific or feature-specific skills.
when_to_use: >-
  Use this skill BEFORE any other miniapp skill when (1) the user opens a
  TuyaOpen panel project and asks "how do I start", (2) before writing
  any code that reads or writes a DP, (3) before claiming a feature is
  ready to upload, (4) when generated code uses React patterns
  (useState/useEffect) for things that should go through panel-sdk hooks.
  Do NOT use for non-panel miniapps, web pages, or pure smart-ui
  documentation questions (use smart-ui-skill instead).
id: miniapp/panel-foundation
surface: miniapp
tags: [miniapp, panel, ray, foundation, architecture, audit, upload]
license: Apache-2.0
defaultEnabled: true
related:
  - ray-common-develop-skill
  - smart-ui-skill
  - miniapp-performance-ux-guard
  - requirement-creating-guide-skill
---

# Tuya Panel MiniApp — Foundation

## 概述 {#description}

这是面板小程序（panel miniapp）的**第一站** skill。任何在 TuyaOpen IDE
创建的面板小程序项目，写代码前都先读这里。

它回答三个问题：

1. **架构** —— 项目的物理结构 / 各文件职责 / 数据流（`project.tuya.json` /
   `app.config.ts` / `src/devices/schema.ts` / `src/ty-shim.ts` / `src/pages/`）
2. **怎么写** —— 必须遵守的开发约定（DP 走 `useProps` / `useActions`，
   `useState` 仅限本地 UI 状态；UI 走 `@ray-js/smart-ui`；样式用
   `.module.less`；系统 API 走 `ty.*`）
3. **怎么上线** —— Tuya 小程序开发者平台的**审核验收标准**和**上传前
   自检清单**

## 何时触发本 skill {#scene}

- **新接手项目**：用户打开一个 `source/miniapp/` 目录，问「这是什么 / 怎么开始」
- **写 DP 相关代码前**：任何涉及读 / 写 / 监听设备数据点的需求
- **AI 想用 React 标准模式做面板事情时**：阻止它用 `useState` 管 DP / 用
  `fetch` 直连后端 / 用全局 CSS 等等
- **声称功能完成、准备打包/上传前**：跑一次审核自检

## 快速诊断（30 秒看完）

```bash
# 你在面板小程序目录里？必有这两个文件：
ls project.tuya.json src/devices/schema.ts
```

```bash
# 装的是 Ray 工具链？必有这两个包：
cat package.json | grep -E '@ray-js/(ray|panel-sdk|cli)'
```

如果以上任一缺失 → **不是 Ray 面板小程序**，本 skill 不适用。

> `dp.config.json` 在旧版模板中存在，新模板已移除。
> `src/devices/schema.ts` 是 IDE 直接生成的 DP 唯一来源。

## 三段必读 reference

按下面顺序读，不要跳：

### ① [references/architecture.md](references/architecture.md) —— 项目结构 + 数据流

读这个搞懂：
- 文件树每个目录什么用
- `project.tuya.json` 各字段意义（`type: panel-app` / `appid` / `projectId` /
  `dependencies` / `baseversion` / `compileType`）
- `app.config.ts` 与 `app.tsx` 启动流程：`initPanelEnvironment` →
  `initOfflinePreview` → `SdmProvider` → 页面渲染
- DP 全链路：云端 schema → `src/devices/schema.ts`（IDE 直接生成）→
  `createDpKit` → `useProps` / `useActions` → 用户操作
- `src/ty-shim.ts` 的作用：IDE 预览桥（合成 `window.ty` + `gzlJSBridge`）
- `ty.*` 全局 API 速查（toast / loading / storage / OTA）
- 路由 / 别名 (`@pages`, `@/devices`) / CSS Modules 约定

### ② [references/conventions.md](references/conventions.md) —— 开发铁律

读这个搞懂：
- ❗ DP I/O **必须**用 `useProps` / `useActions`，**不要**用 `useState`
  管 DP 值（`useState` 可以用于本地 UI 状态：input draft / OTA 进度 / 错误提示）
- ❗ 网络请求**必须**用 `@tuya-miniapp/cloud-api`，**不要**用 `fetch` /
  `XMLHttpRequest` / `axios`
- ❗ UI **优先**用 `@ray-js/smart-ui`，不要从头造组件
- ❗ 样式**必须**用 `.module.less`（CSS Modules），**不要**写全局 CSS
- ❗ 文案**禁止**硬编码中文（含 `ty.showToast` title），走 i18n key
- ❗ `src/devices/schema.ts` 是真值源（由 IDE 从云同步生成，不要手改）
- ❗ 系统 API 走 `ty.*`，禁止用 `wx.*` / `tt.*`
- 7 个典型反模式 + 正确写法对照

### ③ [references/upload-checklist.md](references/upload-checklist.md) —— 上传验收

读这个搞懂：
- `project.tuya.json` 必填字段（`appid` / `appVersion` / 依赖版本）
- 包大小限制（主包 + 分包）
- 必备页面（设置 / 关于 / 隐私协议入口）
- 必声明权限及其使用说明
- 禁用 / 已废弃 API 黑名单
- i18n 强制要求
- 上传前自检脚本：`scripts/validate.mjs`

## 自动化自检（驱动脚本）

任何时候想知道「这个项目当前能不能上线」，跑：

```bash
node .agents/skills/miniapp/panel-foundation/scripts/validate.mjs
```

输出形如：

```
[panel-foundation] validating: /home/.../source/miniapp

 ✓ project.tuya.json present and parseable
 ✓ appVersion 1.0.0 (semver)
 ✓ type = panel-app
 ✓ dependency BaseKit = 3.0.0
 ✓ src/app.config.ts present
 ✓ 1 page(s) declared in app.config
 ✓ all declared pages have matching source files
 ✓ src/devices/schema present (DP type source)
 ✓ lampSchemaMap exported from schema (required by createDpKit)
 ✓ src/devices/index.ts uses createDpKit pattern
 ✓ no forbidden APIs in src/ (ty-shim.ts exempted)
 ✗ project.tuya.json.appid is empty — must be set before upload
 ✗ project.tuya.json.projectId is empty
 ⚠ project.tuya.json.i18n is false — set to true for international audit

 result: 2 error(s), 1 warning(s) — NOT READY for upload
```

退出码：`0` = ready，`1` = warnings only，`2` = errors（阻塞上传）。

**注意**：
- 空模板的 `appid` / `projectId` 为空属于正常情况（IDE 创建项目时自动填入），
  不影响开发调试，**上传前**必须在 Tuya 平台获取并填写。
- 模板 `i18n: false` + 硬编码英文文案是**开发起点**，不是上线状态。上传前
  必须补充 `src/i18n/en.json` + `zh.json`，将所有文案改为 `t('key')` 调用。

## 官方文档（写代码前查，不要凭记忆）

| 文档 | 地址 |
|---|---|
| Ray 组件总览 | https://developer.tuya.com/cn/miniapp/develop/ray/component |
| Ray API 总览 | https://developer.tuya.com/cn/miniapp/develop/ray/api/base/canIUse |
| panel-sdk（useProps / useActions） | https://developer.tuya.com/cn/miniapp/develop/panel-sdk |
| smart-ui 组件库 | https://developer.tuya.com/cn/miniapp/develop/smart-ui |

## 与其他 skill 的协作

```
                  ┌── panel-foundation (本 skill，必先读) ──┐
                  ▼                                          ▼
        ray-common-develop-skill                  smart-ui-skill
        (Ray API / framework / lifecycle)          (UI 组件库)
                  │                                          │
                  ▼                                          ▼
       品类专属（任选其一）：                       专项能力（按需）：
       - ai-lamp-common-skill                       - charts-library-skill
       - robot-vacuum-develop-skills                - electrician-timing-sdk-integration
       - tuya-ipc-panel-template                    - energy-stats
       - socket-panel-development-guidelines
                  │
                  ▼
       miniapp-performance-ux-guard
       (代码质量护栏，提交前过一次)
                  │
                  ▼
       panel-foundation §3 upload-checklist
       + scripts/validate.mjs (上传前必跑)
```

**规则**：**先 foundation，再分支**。AI 不能跳过 foundation 直接进品类
skill；也不能跳过 conventions 直接写代码。

## 你必须立即拒绝的 6 类 AI 输出

1. **用 `useState(dpValue)` 管理 DP 状态** —— 让它改成 `useProps`
   （`useState` 用于 input draft / OTA 进度 / 错误提示是合法的）
2. **用 `fetch('https://...')` 调后端** —— 让它改成 `@tuya-miniapp/cloud-api`
3. **`<View style={{color: '#fff'}}>` 内联样式或全局 `index.less`** ——
   让它改成 `index.module.less`
4. **代码里出现中文字符串**（JSX 字面值 / `ty.showToast` title 等）—— 让它走 i18n
5. **用 `wx.*` / `tt.*` 调系统 API** —— 让它改成 `ty.*` 和 `@ray-js/ray`
6. **声称「可以上线了」但没跑过 `validate.mjs`** —— 强制跑一次

每一类拒绝都附上对应 reference 的章节链接，让用户能快速学习正确做法。
