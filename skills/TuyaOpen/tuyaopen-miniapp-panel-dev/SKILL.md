---
name: tuyaopen-miniapp-panel-dev
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
  It is the default dispatcher: from here, route to tuyaopen-miniapp-ray-common
  for Ray APIs, tuyaopen-miniapp-smart-ui for UI, tuyaopen-miniapp-charts-library for
  charts, the relevant category skill (lamp / socket / robot-vacuum /
  ipc / electrician-timing / energy-stats) for product type,
  tuyaopen-miniapp-performance-ux-guard for pre-release review, and
  tuyaopen-miniapp-requirement-guide for PRD authoring. Do NOT use for non-panel
  miniapps, web pages, or pure smart-ui documentation questions
  (jump straight to tuyaopen-miniapp-smart-ui in that case).
id: tuyaopen-miniapp-panel-dev
surface: miniapp
tags: [miniapp, panel, ray, orchestrator, entry-point, architecture, audit, upload]
license: Apache-2.0
defaultEnabled: true
related:
  - tuyaopen-miniapp-ray-common
  - tuyaopen-miniapp-smart-ui
  - tuyaopen-miniapp-charts-library
  - tuyaopen-miniapp-socket-panel
  - tuyaopen-miniapp-lamp-panel
  - tuyaopen-miniapp-robot-vacuum
  - tuyaopen-miniapp-ipc-panel
  - tuyaopen-miniapp-electrician-timing
  - tuyaopen-miniapp-energy-stats
  - tuyaopen-miniapp-performance-ux-guard
  - tuyaopen-miniapp-requirement-guide
---

# 智能面板开发（Smart Panel Development）

## Overview

面板小程序（panel miniapp）**全流程的主技能**——从需求 → 架构 → 编码 →
上传，**所有任务的第一站**都是这里。一身两职：

- **统一入口** —— 任何 Tuya 面板开发问题先在这里定位，再分派到对应子技能
- **跑得动整条流水线** —— 自带架构、DP 模型、ty.* API、铁律、审核自检脚本，
  足以单独覆盖大多数场景

本 skill 沉淀两类东西：**开发流程**（每阶段对应的子技能）和**开发规范**
（架构 / 编码铁律 / 上传审核 checklist）。

## When to use

- 用户打开 `source/miniapp/` 目录或问「这是什么 / 怎么开始」
- 写任何 DP 相关代码前
- AI 想用 React 标准模式做面板事情时（拦截 `useState` 管 DP / `fetch` /
  全局 CSS / `wx.*`）
- 声称功能完成、准备打包 / 上传前

非 panel miniapp、web 页面、纯 smart-ui 文档咨询 → 直接走对应子技能。

## 分派表：流程阶段 + 子技能

从零到上线 7 步——每步标出在本 skill 内解决，还是跳到哪个子技能。

| 阶段 / 场景 | 在本 skill 内 | 跳子技能 |
|---|---|---|
| 1. 需求 / PRD | — | `tuyaopen-miniapp-requirement-guide` |
| 2. 架构理解 / 项目结构 / DP 模型 | [references/architecture.md](references/architecture.md) | — |
| 2.5 项目本地缓存（`.tuyaopen/platform/`，读 PID / 绑定 / DP）| [references/platform-cache.md](references/platform-cache.md) | — |
| 3. 品类选型 | — | `tuyaopen-miniapp-lamp-panel` / `tuyaopen-miniapp-socket-panel` / `tuyaopen-miniapp-robot-vacuum` / `tuyaopen-miniapp-ipc-panel` / `tuyaopen-miniapp-electrician-timing` / `tuyaopen-miniapp-energy-stats` |
| 3.5 颜色 / 主题 / 视觉基调 | [references/theme-design.md](references/theme-design.md) | — |
| 4. 编码 — Ray API / 生命周期 / 路由 | — | `tuyaopen-miniapp-ray-common` |
| 4. 编码 — UI 组件 / 表单 / 弹窗 / 列表 | — | `tuyaopen-miniapp-smart-ui` |
| 4. 编码 — 图表 / 用电 / 温湿度 / 能耗曲线 | — | `tuyaopen-miniapp-charts-library` |
| 4. 编码铁律 / DP hook 选型 | [references/conventions.md](references/conventions.md) | — |
| 4. Kit 类型定义缺失 / 添加 MediaKit/MapKit/P2PKit | [references/kit-acquisition.md](references/kit-acquisition.md) | — |
| 5. 上线前 review（性能 / UX / release gate） | — | `tuyaopen-miniapp-performance-ux-guard` |
| 6. 上传自检 | [references/upload-checklist.md](references/upload-checklist.md) + `scripts/validate.mjs` | — |
| 7. 发布 | Tuya 开发者平台提交版本 | — |
| —— 找文档 / 查 API / 查报错 | [references/info-lookup.md](references/info-lookup.md)（`search_help.py` / `fetch_doc.py` / `validate.mjs`） | — |

**规则**：先用本 skill 定位 + 基础约束，再按上表派单。AI **不能**跳过本
skill 直接进品类 skill；也**不能**跳过 conventions 直接写代码。

### 品类 skill 默认没装 —— 这是本节存在的原因

上表第 3 步派给的六个品类 skill 属于 `category` 安装组，**`tuyaopen skills
install --all` 不会装它们**。它们互斥：做灯的人同时装上扫地机、IPC、插座的
手册，不会多出三项能力，只会给 agent 多出三个不相干的候选去挑。

所以本表就是它们的**唯一可见入口**。一个没装的 skill 在 agent 的上下文里
完全不存在 —— 看不到名字、看不到描述、无从"顺便发现"。你现在读到的这张
表，就是那六个 skill 在被装上之前唯一留下的痕迹。

判断品类后，先装再用：

```bash
tuyaopen skills install --ids tuyaopen-miniapp-lamp-panel     # 照明
tuyaopen skills install --ids tuyaopen-miniapp-socket-panel   # 插座 / 电工
tuyaopen skills install --ids tuyaopen-miniapp-robot-vacuum   # 扫地机
tuyaopen skills install --ids tuyaopen-miniapp-ipc-panel      # 摄像头 / IPC
tuyaopen skills install --ids tuyaopen-miniapp-electrician-timing  # 电工定时
tuyaopen skills install --ids tuyaopen-miniapp-energy-stats   # 能耗统计
tuyaopen skills install --group category                      # 六个全装（少见：一次只做一个品类）
```

（命令写作裸 `tuyaopen`；若这台机器上它不在 `PATH`，先按 skill
`tuyaopen-shared` § 1 解析一次。）

**装完要让 agent 真正读到它**：新装的 skill 不会进入当前会话的上下文，
需要重新加载 skill 列表或开一个新会话，再按品类 skill 的内容继续。

**产品品类不在上面六项里**（例如温控器、门锁、传感器）：没有对应的品类
skill，就留在本 skill + `tuyaopen-miniapp-ray-common` +
`tuyaopen-miniapp-smart-ui` 里做，**不要**挑一个"最像的"品类 skill 套用 ——
品类手册里的 DP 语义、组件选型和状态机是按那个品类写死的，套错比没有更糟。

## 你必须立即拒绝的 9 类 AI 输出

1. **`useState(dpValue)` 管理 DP 状态** —— 走 panel-sdk hook（Basic DP 用
   `useProps` 读、`publishDpOutTime` 写；Complex DP 用 `useStructuredProps` /
   `useStructuredActions`。`useState` 用于 input draft / OTA 进度 /
   错误提示是合法的）
2. **`useProps` 读 Complex DP**（如 `colour_data` / `scene_data` /
   `ipc_mobile_path`）—— 改 `useStructuredProps` + 在 `protocols/index.ts`
   注册 Transformer。编解码格式翻对应品类 skill
3. **`fetch('https://...')` 调后端** —— 改 `@tuya-miniapp/cloud-api`
4. **`<View style={{color: '#fff'}}>` 内联样式或全局 `index.less`** ——
   改 `index.module.less`
5. **代码里出现中文字符串**（JSX 字面值 / `ty.showToast` title 等）—— 走 i18n
6. **`wx.*` / `tt.*` 调系统 API** —— 改 `ty.*` 和 `@ray-js/ray`
7. **品类专属 UI 用命名导入**（如 `import { LampBrightSlider } from '@ray-js/lamp-bright-slider'`）
   —— 多数 `@ray-js/lamp-*` / `@ray-js/ipc-*` / `@ray-js/robot-*` 是
   default export，命名导入会构建失败。**具体以品类 skill 的 reference 为准**
8. **声称「可以上线了」但没跑过 `validate.mjs`** —— 强制跑一次
9. **凭记忆回答 API 参数 / 报错原因 / 组件 props** —— 先跑 `scripts/` 下的
   `fetch_doc.py` / `search_help.py` 查实际文档，见 [references/info-lookup.md](references/info-lookup.md)

## References（按需加载）

| 文件 | 何时读 |
|---|---|
| [references/architecture.md](references/architecture.md) | 搞懂项目结构、`project.tuya.json` 字段、`app.config.ts` / `app.tsx` 启动流程、DP 数据流、路由 / 别名 / CSS Modules 约定 |
| [references/conventions.md](references/conventions.md) | 写代码铁律：DP hook 分档、cloud-api 网络、smart-ui 优先、`.module.less`、i18n、ty.*、API 黑名单。10 条规则 + 7 个反模式 |
| [references/upload-checklist.md](references/upload-checklist.md) | 上传前自检：必填字段、包大小限额、必备页面、权限说明、i18n 要求 |
| [references/theme-design.md](references/theme-design.md) | 颜色 / 主题 / `--app-*` 变量 / 深色模式 / 视觉基调 |
| [references/platform-cache.md](references/platform-cache.md) | `.tuyaopen/platform/product-<pid>.json` 与 `panel-<pid>.json` 的字段表、读取策略；30 秒诊断「是不是 Ray 面板项目」 |
| [references/info-lookup.md](references/info-lookup.md) | 信息查找决策表：什么场景跑什么脚本（`search_help.py` 查帮助中心、`fetch_doc.py` 查官方文档、`validate.mjs` 跑上线自检） |
| [references/kit-acquisition.md](references/kit-acquisition.md) | `@tuya-miniapp/*-kit` 类型定义清单 + 缺失时的手动获取流程 + 运行时版本声明 |

## Scripts

| 脚本 | 用途 |
|---|---|
| `scripts/validate.mjs` | 上线前自检（必跑，详见 [info-lookup.md](references/info-lookup.md)） |
| `scripts/search_help.py` | 搜 Tuya 帮助中心 FAQ（160+ 篇） |
| `scripts/fetch_doc.py` | 拉 `developer.tuya.com` 文档正文 / API schema |

调用路径：从项目根或 `source/miniapp/` 均可用相对路径
`.agents/skills/tuyaopen-miniapp-panel-dev/scripts/`。
