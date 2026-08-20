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

## No `tuyaopen` CLI coverage

面板架构、UI 结构、DP 编排等本技能自身承担的调度工作，没有对应的 `tuyaopen` CLI 命令组——`miniapp` 组覆盖的是构建 / 上传等命令行操作（详见 skill `tuyaopen-miniapp`），不是这里的架构调度职责。下文出现的 `tuyaopen skills install` 调用是子技能目录的 bootstrap 安装，不属于面板开发本身，也不落在 Shortcuts 小节内。


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

从零到上线 9 步——每步标出在本 skill 内解决，还是跳到哪个子技能。最后两步
（提审 / 发布、绑定）**没有任何命令行入口**，只能在网页上做，见下面的专节。

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
| 7. 上传（内测包） | — | `tuyaopen-miniapp`（`tuyaopen miniapp upload`，命令行可做） |
| 8. 提审 / 发布 / 上线 | [只能在网页上做 —— 见下节](#提审发布与绑定只能在网页上做) | — |
| 9. 绑定面板小程序到产品 | [只能在网页上做，且必须在第 8 步之后 —— 见下节](#提审发布与绑定只能在网页上做) | — |
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

## 提审发布与绑定只能在网页上做

面板小程序的生命周期里有 **四个步骤既不在本 skill、也不在 `tuyaopen` CLI、
也不在 IDE 内**——只能开浏览器去涂鸦开发者平台做。AI 走到这四步时必须**明确
告诉用户"这一步要去网页"并给出拼好参数的网址**，不要停在这里干等，更不要编一条
`tuyaopen miniapp publish` / `submit` / `review` / `bind` 之类的命令——
`tuyaopen` 的 `miniapp` 组只有 `build` / `install` / `meta` / `preview` /
`sync-schema` / `template` / `upload` 七条，跑 `tuyaopen schema list --json`
可以自己核实。

**网址要带参数拼好，不要丢一个光秃秃的首页过去。** IDE 就是在点击时把参数拼
进 URL 的（`src/host/externalLinkHandlers.ts`），一点直达那一页那一个 tab；
只给基础域名等于让用户自己去几十个产品、几十个小程序里翻。

| # | 步骤 | 为什么命令行做不了 | 打开哪个 URL |
|---|---|---|---|
| 1 | **创建小程序**（拿到 appid） | appid 由平台签发。`tuyaopen miniapp meta set-appid <appid>` 只是把一个**已有的** appid 写进项目元数据，它不会创建小程序；`upload` 也要求 appid 已存在 | `https://platform.tuya.com/miniapp/` —— 唯一不带参数的一步，因为参数要指的那个东西还不存在。创建完把 id 抄回来：`tuyaopen miniapp meta set-appid <appid>` |
| 2 | **提审** | 审核是平台上有真人审核员的工作流，CLI 里没有对应接口 | `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>` |
| 3 | **发布 / 灰度 / 上线 / 回滚** | 影响这款产品线上**所有**终端用户，刻意不放到命令行 | 同第 2 步的版本管理页 |
| 4 | **把面板小程序绑定到产品** | 绑定关系挂在产品上，不在项目里，本地任何东西都断言不了 | `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` |

### 两个参数分别是什么、从哪读

两个都从 `source/miniapp/project.tuya.json` 读（读不到再退到
`<project>/project.tuya.json`——IDE 也是按这两个候选顺序试的），并且都要
URL 编码（IDE 用的是 `encodeURIComponent`）：

| 占位符 | JSON 字段 | 实际装的是什么 | 为空说明什么 |
|---|---|---|---|
| `<appid>` | `appid` | **小程序 id**，就是 `tuyaopen miniapp meta set-appid` 写进去的值 | 平台上还没创建这个小程序 → 先做第 **1** 步。此时没有任何东西可提审、可发布 |
| `<projectId>` | `projectId` | ⚠ **云端产品 PID** —— 尽管字段名叫 projectId，它**不是**小程序 id | 这个项目还没绑产品（或被解绑了）→ 先绑产品；没有 PID 就没有产品页可开 |

> **⚠ `projectId` 装的是产品 PID。** 看字段名想当然把它当小程序 id，是这里
> 最容易犯的错，而且拼出来的 URL 会静悄悄开到另一个页面。已核对
> `src/miniapp/bindingManager.ts` —— `readProjectId` / `writeProjectId` 的注释
> 原文就是 *"Read/Write projectId (PID)"*；所有调用方传的都是产品 pid：
> `src/host/agentFlow.ts:257`（`writeProjectId(<dir>, pid)`）、
> `src/host/product/index.ts:173`（`message.pid`），`:208` 传 `''` 表示解绑。
> IDE 自己给这个字段为空时的提示文案写的是「产品 ID 为空……请先绑定产品」。

**绑定 URL 的 `&tab=operation#PRIVATE` 是有用的，要原样照抄。** 只给 `id=`
会开到产品页默认的那个 tab；`tab=operation` 这个 query 加上 `#PRIVATE` 这个
hash 才是选中"小程序绑定"所在的那一栏。少任何一半，用户会到对的产品、错的页面。

参数取不到时就照 IDE 的做法办：**不要开链接，直接说清缺哪个前置步骤**
（IDE 会弹 `miniapp.v3.step5.appidEmpty` /
`miniapp.v3.step5.projectIdEmpty` 并且什么都不打开）。不要拿占位符、
猜的值或者基础域名去凑。

### 上传 / 发布 / 绑定是三件不同的事

三件事按顺序发生，而且**只有第一件有命令行入口**：

1. **上传（upload）** —— `tuyaopen miniapp upload`（或 IDE MiniApp 页面的
   「上传」按钮）在平台上登记一个**版本**。**只有这一步有 CLI 命令。**
   包只是给你和团队内测用，终端用户看不到。
2. **发布（提审 → 上线）** —— 第 2、3 步，把那个版本放出去。只能在网页做。
3. **绑定** —— 第 4 步，把**已发布**的小程序挂到产品上，面板才真的能到这款
   产品的设备上。只能在网页做。

**顺序是死的：不能先绑定再发布。** 第 4 步绑的是一个**已经发布**的小程序，
第 3 步没做完就没有东西可挂。IDE 给出的正是这个顺序——发布是 STEP 1、绑定是
STEP 2（见 `media/webview/help/miniapp-step3.*.md`）。所以：`upload` 绿了
**不等于**已发布，已发布**也不等于**已经能到设备上。照实说三件里做完了哪几件，
别让"上传成功"顶替"已上线"。

> **别把两种"绑定"搞混。** 本 skill 其他地方（第 2.5 步、
> [references/platform-cache.md](references/platform-cache.md)）说的"绑定 /
> 绑产品"是**把产品 PID 绑到项目上**，为的是能同步 DP schema，属于开发前置；
> 这里第 4 步说的是**把已发布的小程序绑到产品上**，属于上线动作。两者只在一
> 点上相连：前者写进 `projectId` 的那个 PID，正是后者 URL 里 `id=` 要用的值。

平台在审核时到底查什么（包大小、i18n、禁用 API、权限说明），见
[references/upload-checklist.md](references/upload-checklist.md)；命令行那一侧
（`upload` 的参数、P2 门禁、报错）见 skill `tuyaopen-miniapp`。

## 拿设备 ID（`devid`）—— 真机联调的前置

面板跑在真机上、调 DP、调按设备维度的接口，都要一个 `devid`。两件事先说清楚：

- **配网完成之后才有。** `devid` 标识的是"已激活的云端设备"，不是硬件本身
  （硬件身份是 UUID/AuthKey）。所以"取不到 devid"通常等于"这台设备还没配网"，
  不是查询失败。
- **不要编。** 用一个猜的 devid 去调接口，得到的错误信息和"面板写错了"长得一样，
  会把排查带偏很久。

**方法一 —— 智能生活 APP（不用改代码、不用重新烧）**

配网完成后进设备页 → 右上角 `···` → **设备信息** → **虚拟 ID**。那串就是
`devid`。**面板开发默认走这条** —— 你通常不拥有固件，也不该为了拿一个 id 去改它。

**方法二 —— 让固件打出来**（需要能改并重新烧写嵌入式代码）

```c
#include "tuya_iot.h"          /* src/tuya_cloud_service/cloud/tuya_iot.h */

const char *devid = tuya_iot_devid_get(tuya_iot_client_get());
PR_INFO("devid: %s", devid ? devid : "(null)");
```

配网完成后从串口日志里读。必须在设备激活**之后**调用，早于激活时客户端没有 id
可返回。返回的指针由 client 持有，别 free、也别跨重新配网缓存。

固件侧的完整说明（凭证优先级、UUID/AuthKey 与 devid 的关系、串口写授权，以及
**设备授权码怎么免费领 / 怎么买**）在 skill `tuyaopen-embedded-device-auth`
——授权码获取途径全目录只在那一处写，这里只给指针，不复制网址。
上面这两条在那边也有一份 —— 这是有意重复
而不是指针：面板开发者常常不拥有固件，为了一个两步的 APP 查询把人赶去读一个嵌入式
skill，比重复五行更糟。

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
