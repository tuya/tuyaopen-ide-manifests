---
name: smart-panel-dev
description: >-
  Master / orchestrator skill for Tuya Ray panel miniapp development. Use
  this as the SINGLE ENTRY POINT for any panel miniapp task — it covers
  the full lifecycle (architecture → requirement → coding conventions →
  upload audit) and dispatches to category- or topic-specific sub-skills
  (ray-common, smart-ui, charts-library, socket-panel, lamp-panel,
  robot-vacuum, ipc-panel, electrician-timing, energy-stats,
  performance-ux-guard, requirement-guide) when deeper detail is needed.
  Anything from "how do I start a panel project" to "is this ready to
  upload" routes through here first.
when_to_use: >-
  Use this skill the moment any Tuya panel miniapp work begins — opening
  a project, reading or writing a DP, picking a category template,
  designing a page, writing PRD, reviewing code, preparing for upload.
  It is the default dispatcher: from here, route to miniapp-ray-common
  for Ray APIs, miniapp-smart-ui for UI, miniapp-charts-library for
  charts, the relevant category skill (lamp / socket / robot-vacuum /
  ipc / electrician-timing / energy-stats) for product type,
  miniapp-performance-ux-guard for pre-release review, and
  miniapp-requirement-guide for PRD authoring. Do NOT use for non-panel
  miniapps, web pages, or pure smart-ui documentation questions
  (jump straight to miniapp-smart-ui in that case).
id: smart-panel-dev
surface: miniapp
tags: [miniapp, panel, ray, orchestrator, entry-point, architecture, audit, upload]
license: Apache-2.0
defaultEnabled: true
related:
  - miniapp-ray-common
  - miniapp-smart-ui
  - miniapp-charts-library
  - miniapp-socket-panel
  - miniapp-lamp-panel
  - miniapp-robot-vacuum
  - miniapp-ipc-panel
  - miniapp-electrician-timing
  - miniapp-energy-stats
  - miniapp-performance-ux-guard
  - miniapp-requirement-guide
---

# Tuya Smart Panel Dev — 主入口 / 调度器

## 概述 {#description}

这是面板小程序（panel miniapp）**全流程的主技能**——从需求 → 架构 →
编码 → 上传，**所有任务的第一站**都是这里。

它一身两职：

1. **统一入口** —— 任何 Tuya 面板小程序的开发问题（"怎么开始"、"DP 怎么写"、
   "UI 用什么库"、"上传前要查什么"），先在这里定位，再分派到对应子技能。
2. **跑得动整条流水线** —— 即使不进入子技能，本 skill 自带架构、DP 模型、
   ty.* API、铁律、审核自检脚本，足以单独覆盖大多数面板开发场景。

本 skill 沉淀两类东西：

- **开发流程**（panel dev flow）—— 从需求到上线的标准阶段，及每阶段对应的子技能
- **开发规范**（panel dev specs）—— 架构约定、编码铁律、上传审核 checklist

## 面板开发完整流程 {#flow}

从零到上线的 7 步——每一步标出在本 skill 内解决，还是跳到哪个子技能：

| 阶段 | 在本 skill 内 | 跳子技能 |
|---|---|---|
| 1. 需求 / PRD | — | `miniapp-requirement-guide` |
| 2. 架构理解 / 项目结构 / DP 模型 | [references/architecture.md](references/architecture.md) | — |
| 3. 品类选型 | — | `miniapp-lamp-panel` / `miniapp-socket-panel` / `miniapp-robot-vacuum` / `miniapp-ipc-panel` / `miniapp-electrician-timing` / `miniapp-energy-stats` |
| 4. 编码（Ray + UI + 图表） | [references/conventions.md](references/conventions.md) 铁律部分 | `miniapp-ray-common` · `miniapp-smart-ui` · `miniapp-charts-library` |
| 5. 上线前 review（性能 / UX / release gate） | — | `miniapp-performance-ux-guard` |
| 6. 上传自检 | [references/upload-checklist.md](references/upload-checklist.md) + `scripts/validate.mjs` | — |
| 7. 上传 / 发布 | Tuya 开发者平台提交版本 | — |

任何时候用户告诉你"我要做面板"、"怎么开始"、"这个能上线吗"，**按这张表的阶段定位**，然后执行（本 skill 内）或派单（跳子技能）。

## 面板开发规范 {#specs}

本 skill 沉淀三套规范，分别在 `references/` 下三个文件里。**按下面顺序读，不要跳**：

1. **架构** —— 项目的物理结构 / 各文件职责 / 数据流（`project.tuya.json` /
   `app.config.ts` / `src/devices/schema.ts` / `src/ty-shim.ts` / `src/pages/`）
2. **编码铁律** —— DP 走 `useProps` / `useActions`，`useState` 仅限本地 UI 状态；
   UI 走 `@ray-js/smart-ui`；样式用 `.module.less`；系统 API 走 `ty.*`
3. **上传审核** —— Tuya 小程序开发者平台的审核验收标准 + 上传前自检清单

详细规范见下文「三段必读 reference」。

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
node .agents/skills/miniapp/smart-panel-dev/scripts/validate.mjs
```

输出形如：

```
[smart-panel-dev] validating: /home/.../source/miniapp

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

## 调度规则：什么时候跳到哪个 skill

本 skill 是**唯一入口**。下面是按需求场景的分派表——遇到对应场景，本
skill 内的内容不够用时，**立即**加载对应子技能继续：

| 用户场景 / 触发短语 | 跳到这个 skill |
|---|---|
| 写 PRD、需求文档、面板需求模板 | `miniapp-requirement-guide` |
| 调用 Ray API、生命周期、路由、能力查询 | `miniapp-ray-common` |
| UI 组件、表单、弹窗、列表、ActionSheet、smart-ui 调用 | `miniapp-smart-ui` |
| 图表、用电量曲线、温湿度曲线、能耗统计图 | `miniapp-charts-library` |
| 品类专属：智能灯 / AI 灯具 | `miniapp-lamp-panel` |
| 品类专属：插座 / 排插 / 开关 | `miniapp-socket-panel` |
| 品类专属：扫地机器人 | `miniapp-robot-vacuum` |
| 品类专属：摄像头 / IPC | `miniapp-ipc-panel` |
| 品类专属：电工定时 SDK 集成 | `miniapp-electrician-timing` |
| 品类专属：能耗统计 | `miniapp-energy-stats` |
| 上线前代码 review、性能 / UX 护栏、白屏 / 首屏优化、release gate | `miniapp-performance-ux-guard` |

**规则**：先用本 skill 完成定位 + 基础约束，再按上表派单。AI 不能跳过本
skill 直接进品类 skill；也不能跳过 §2 conventions 直接写代码。

```
                 ┌── smart-panel-dev (主入口 / 调度器) ──┐
                 │                                        │
                 ▼                                        ▼
    [需求阶段]                              [架构 + 编码阶段]
    miniapp-requirement-guide               miniapp-ray-common
    (PRD / 模板 / 章节)                     miniapp-smart-ui
                                            miniapp-charts-library
                                                  │
                                                  ▼
                                            [品类专属，任选其一]
                                            miniapp-lamp-panel
                                            miniapp-socket-panel
                                            miniapp-robot-vacuum
                                            miniapp-ipc-panel
                                            miniapp-electrician-timing
                                            miniapp-energy-stats
                                                  │
                                                  ▼
                                            [上线前]
                                            miniapp-performance-ux-guard
                                                  │
                                                  ▼
                                            smart-panel-dev §3 upload-checklist
                                            + scripts/validate.mjs (必跑)
```

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
