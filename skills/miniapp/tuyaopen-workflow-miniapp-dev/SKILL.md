---
name: tuyaopen-workflow-miniapp-dev
description: 'The panel-miniapp phase of TuyaOpen product development, end to end: create the miniapp and get an
  appid, pick a category, write the panel, hand the user a render URL to review, upload, then submit / publish /
  bind — all run through the CLI (create, next-version, ui-info-set, submit-review, review-status, release, ui-list,
  bind); constructed web URLs serve as fallback. Owns the phase order and the panel architecture and coding rules,
  and dispatches to the sub-skills (ray-common, smart-ui, charts-library, the category playbooks, performance-ux-guard,
  requirement-guide) for depth. Entered for any panel miniapp task, or handed over from `tuyaopen-workflow-product-dev`
  once a PID and DPs exist. Per-command flags and gating are in skill `tuyaopen-miniapp`. Covers every panel category
  the catalogue has a playbook for — lamp / lighting, socket, robot vacuum, IPC camera, electrician timing, energy
  and power statistics — plus charts, performance and UX review. **

  触发词**：手机、手机上、手机面板、手机 App、面板、面板小程序、小程序、 panel、mini-ap...'
license: Apache-2.0
compatibility: tuyaopen CLI, either form — see skill `tuyaopen-start` § 1 (for `tuyaopen-cli miniapp`/`panel`);
  Node.js >= 18 and npm; A TuyaOpen project with MiniApp enabled
metadata:
  version: 2.7.2
  owner: miniapp-team
  deprecated: false
  min-cli-version: 0.1.0-beta.17
---
# 智能面板开发（Smart Panel Development）

## Shortcuts — `tuyaopen-cli miniapp` / `tuyaopen-cli project` / `tuyaopen-cli devplat`

本技能负责**阶段顺序**：哪一步该跑哪条命令、每步交付什么、哪几步只能人做。
每条命令的参数、门禁与报错在 skill `tuyaopen-miniapp` —— 包括 `devplat exec`
转发平台侧 `panel …` 与 `miniapp …` 的写法；平台侧凭据本身在 skill `tuyaopen-cloud`。

| 阶段 | Command |
|---|---|
| 看模板 → 建工程 → 装运行时 | `tuyaopen-cli miniapp template` · `tuyaopen-cli miniapp install` (P2) |
| 本地记下 PID（`sync-schema` 的前置） | `tuyaopen-cli project bind-product` (P2) |
| 记下平台签发的 appid | `tuyaopen-cli miniapp meta` |
| 从已绑产品同步 DP schema | `tuyaopen-cli miniapp sync-schema` |
| 构建 | `tuyaopen-cli miniapp build` |
| **跑起来，把渲染链接交给用户** | `tuyaopen-cli miniapp preview` |
| 上传版本 | `tuyaopen-cli miniapp upload` (P2) |
| 平台侧：建小程序 / 算版本号 / 提审 / 查审核状态 / 发布上线 / 绑定 PID | `tuyaopen-cli devplat exec` (P2) — 转发给 `tuya-devplat-cli miniapp …` 与 `panel …`（含网页兜底） |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per skill `tuyaopen-start` § 1
(it is usually not on `PATH`).

> 面板架构、UI 结构、DP 编排这些**本技能自己**承担的工作确实没有 CLI 命令 ——
> 那部分是读 `references/` 和做判断，不是跑命令。下文出现的
> `tuyaopen-cli skills install` 是子技能目录的 bootstrap 安装，不属于面板开发本身，
> 所以不在上表里。


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

从零到上线的每一步都标出：在本 skill 内解决，还是跳到哪个子技能。全流程均支持命令行程序化闭环（创建小程序、算版本号、提审、查审核状态、发布上线、绑定产品均由 `tuyaopen-cli devplat exec` 转发平台 CLI 执行）；当缺少前置或需人工介入时，提供拼好参数的网页直达链接作为兜底。

> 这张表在 2026-08-24 之前从第 1 步"需求"开始，**漏掉了第 0 步和第 5 步** ——
> 拿 appid 和"把渲染链接交给用户"这两件事当时只写在 skill `tuyaopen-miniapp`
> 的正文里，不在流程表上，于是照着表走的 agent 会跳过它们。

| 阶段 / 场景 | 在本 skill 内 | 跳子技能 |
|---|---|---|
| **0. 创建小程序，拿到 appid** | **先问用户**（见下面《第 0 步是一次提问》）：复用已有的，还是新建。两条路都有命令 —— 列已有的 `miniapp list`，新建 `panel create-miniapp`（返回的 `miniProgramId` 就是 appid）。拿到后 `tuyaopen-cli miniapp meta set-appid <appid>` 抄回项目 | `tuyaopen-miniapp`（wrapper 形状、入参出参、失败码） |
| 1. 需求 / PRD | — | `tuyaopen-miniapp-requirement-guide` |
| 2. 架构理解 / 项目结构 / DP 模型 | [references/architecture.md](references/architecture.md) | — |
| 2.5 项目本地缓存（`.tuyaopen/platform/`，读 PID / 绑定 / DP）| [references/platform-cache.md](references/platform-cache.md) | — |
| 3. 品类选型 | — | 查阅 `tuyaopen-miniapp-smart-ui`（照明/插座/扫地机/摄像机/定时）与 `tuyaopen-miniapp-charts-library`（能耗统计） |
| 3.5 颜色 / 主题 / 视觉基调 | [references/theme-design.md](references/theme-design.md) | — |
| 4. 编码 — Ray API / 生命周期 / 路由 | — | `tuyaopen-miniapp-ray-common` |
| 4. 编码 — UI 组件 / 表单 / 弹窗 / 列表 | — | `tuyaopen-miniapp-smart-ui` |
| 4. 编码 — 图表 / 用电 / 温湿度 / 能耗曲线 | — | `tuyaopen-miniapp-charts-library` |
| 4. 编码铁律 / DP hook 选型 | [references/conventions.md](references/conventions.md) | — |
| 4. Kit 类型定义缺失 / 添加 MediaKit/MapKit/P2PKit | [references/kit-acquisition.md](references/kit-acquisition.md) | — |
| **5. 跑起来，把渲染链接交给用户** | `tuyaopen-cli miniapp preview --emit-url` 打出一行 `{"event":"preview_url","url":…}`，**把那个 URL 交给用户**并等他看过再往下走 | `tuyaopen-miniapp`（命令参数与门禁） |
| 6. 上线前 review（性能 / UX / release gate） | — | `tuyaopen-miniapp-performance-ux-guard` |
| 7. 上传自检 | [references/upload-checklist.md](references/upload-checklist.md) + `scripts/validate.mjs` | — |
| 7.5 算下一个版本号 | `panel miniapp-next-version` —— 先拿到号，第 8 步的 `--version` 就是它返回的 `nextVersion` | `tuyaopen-miniapp` |
| 8. 上传（内测包） | — | `tuyaopen-miniapp`（`tuyaopen-cli miniapp upload --version <nextVersion>`，命令行可做） |
| **9. 提审** | 命令行优先：`miniapp ui-info-set`（设置四项属性） + `miniapp submit-review`（提交审核）；若宿主缺少命令或图片未就绪走网页提审（带拼好参数的网址） | `tuyaopen-miniapp` |
| 9.5 查审核状态 → 发布上线 | 提审后审核通常约 2 分钟：`panel miniapp-version-status` 轮到 `reviewStatus == 2`，再 `panel miniapp-release` | `tuyaopen-miniapp`（前置、失败码、别用 `-wait` 变体） |
| **10. 绑定面板小程序到产品** | 命令行优先：`panel ui-list --product-id <PID> --code PRIVATE` 查询 `uiId`，再 `panel bind --ui-id <uiId> --product-id <PID>`；异常时走网页绑定（带拼好参数的网址） | `tuyaopen-miniapp` |
| —— 找文档 / 查 API / 查报错 | [references/info-lookup.md](references/info-lookup.md)（`search_help.py` / `fetch_doc.py` / `validate.mjs`） | — |

**规则**：先用本 skill 定位 + 基础约束，再按上表派单。AI **不能**跳过本
skill 直接进品类 skill；也**不能**跳过 conventions 直接写代码。

### 品类剧本与专项 SDK 分布在组件与图表技能中

本阶段垂直品类的专用组件和业务参考已收敛在已安装的专业技能中，**无需另外安装技能**，按品类直接查阅：

| 品类 / 能力 | 查阅入口 | 包含内容 |
|---|---|---|
| **照明** | `.agents/skills/tuyaopen-miniapp-smart-ui/references/categories/lamp/README.md` | `@ray-js/lamp-*` 组件、色卡/滑条/色盘、照明 DP、`work_mode` 状态机 |
| **插座 / 排插** | `.agents/skills/tuyaopen-miniapp-smart-ui/references/categories/socket/README.md` | 多路开关（`switch_1~6`）、倒计时、Complex DP 协议、设备操作日志 |
| **扫地机** | `.agents/skills/tuyaopen-miniapp-smart-ui/references/categories/robot-vacuum/README.md` | `@ray-js/robot-*` 地图 SDK、数据流（P2P/MQTT）、扫地机专有协议 |
| **IPC 摄像机** | `.agents/skills/tuyaopen-miniapp-smart-ui/references/categories/ipc/README.md` | 融合播放器集成、FeatureMenu/TabBar 宫格配置、PTZ 与巡航路径 |
| **电工定时 SDK** | `.agents/skills/tuyaopen-miniapp-smart-ui/references/sdks/electrician-timing/README.md` | `@ray-js/electrician-timing-sdk`：云定时/循环/随机/点动/倒计时五大能力 |
| **电量统计 SDK** | `.agents/skills/tuyaopen-miniapp-charts-library/references/energy-stats/README.md` | `@tuya-miniapp/cloud-api`：日/月/年电量曲线、峰谷电价、用电成本追踪 |

**产品品类不在上面列表里**（例如温控器、门锁、传感器）：直接基于本技能总流程 + `tuyaopen-miniapp-ray-common` + `tuyaopen-miniapp-smart-ui` 进行定制开发，**不要**挑选一个"最像的"品类剧本套用。

## 第 0 步是一次提问，不是一格表

<code data-type="tag" style="color:#ff4d4f">内测第四轮：agent 从没问过，于是 appid 一直是空的，⑤⑧⑨ⓑ–ⓖ 全部走不了</code>

appid **只能由平台签发**，`tuyaopen-cli` 自己的 `miniapp` 组没有任何命令能创建它，
`meta set-appid` 只是把一个已有的 appid 抄进项目。但**签发这一步现在有命令行入口**：
经 `tuyaopen-cli devplat exec` 转发的 `panel create-miniapp`。所以在写第一行面板代码之前，
**停下来问用户**：

> 这个项目要配一个手机面板。两条路：
> 1. **新建面板小程序**（新项目的默认选择）—— 我这边可以直接建，只要这个项目已经有产品 PID
> 2. **复用已有小程序** —— 我先把你账号里已有的列出来给你挑，或者你直接把 appid 给我
>
> 选哪个？

**默认路径是新建。** 一个新产品需要属于它自己的面板小程序；复用是例外，只在
用户明确说"用现有那个"时才走。

拿到 appid 之后立刻记下来，否则 ⑨ `upload` 会失败：

```bash
tuyaopen-cli miniapp meta set-appid <appid>
```

**没拿到 appid 也不要停止编码** —— ①–⑦（建模板、写代码、build）都不需要它。
但也**不要假装它不存在**：在最终交付里明确写出"面板尚未创建 / 未上传"，
而不是报告"面板已完成"。

## 状态机 —— 你现在在哪一步，以及到哪一步才算完

嵌入式工作流有三态和进入检测；这条链以前只有一张**有序命令表**。表是对的，
但表是说明书，**说明书可以在任意一行合法地停下来** —— 第四轮的 agent 就停在 ⑦，
然后写了一份"面板已完成构建"的报告。

进入时先判断状态（都从项目里读，别信任何转述）：

| 状态 | 判定 | 下一步 |
|---|---|---|
| `no-panel` | `source/miniapp/` 不存在 | 第 0 步提问 → ①② |
| `scaffolded` | 有 `source/miniapp/`，`src/pages/` 还是模板原样 | ③–⑥ |
| `coded` | 页面已按需求改写，`dist/` 不存在或过期 | ⑦ build |
| `built` | `dist/tuya/app.js` 存在 | ⑧ preview → **交链接给用户，等他看** |
| `reviewed` | 用户看过预览并认可 | ⑨ upload |
| `uploaded` | `upload` 成功 | ⓓ 提审（CLI 或网页）→ ⓔ 查状态（命令）→ ⓕ 发布（命令）→ ⓖ 绑定（CLI 或网页） |
| `bound` | 面板已绑定到产品 | 完 |

`appid` 是否已 `meta set-appid`，从 `.tuyaopen/` 读，与上面的状态正交 ——
没有它，`built` 之后一步都走不了。

### Definition of Done —— 报告"完成"之前逐条核对

- [ ] 用户被**问过**新建还是复用面板小程序
- [ ] appid 已 `meta set-appid` 写进项目
- [ ] `build` 成功
- [ ] **用户拿到过一个能打开的渲染链接，并且看过**（拿不到时见 ⑧ 的降级方案）
- [ ] `upload` 成功
- [ ] `panel miniapp-next-version` 的号用在了 `upload --version` 上
- [ ] **提审已完成**（命令行 `submit-review` 提交，或已交由用户网页提审）
- [ ] 审核通过后 `panel miniapp-release` 已跑过，结果照实报（`published` 是真是假）
- [ ] **面板已绑定到产品 PID**（命令行 `panel bind` 绑定，或已交由用户网页绑定）

**卡住是合法结局，沉默不是。** 任何一条为假，就说清是哪一条、卡在哪里，
并把已完成的部分连同证据一起交付 —— 不要写成"全流程完成"。

## 命令级顺序 —— 七条命令都在这条链上，不是只有 build

<code data-type="tag" style="color:#faad14">内测第二轮：这一组只用到了 2/7 条命令，面板从没被人看见过</code>

第二轮 agent 只调了 `template create`（连试 5 次失败）和 `build`（连试 3 次失败）。
它**从没调过 `template list`** —— 而 `--id` 的合法取值只能从那里来，第 5 次失败和第 1 次
是同一个原因。这不是缺命令，是**没按顺序走**。所以顺序写在这里，写在最前面：

```
本地（tuyaopen-cli miniapp）                          平台（tuya-devplat-cli / 网页）
──────────────────────────────────────────────   ─────────────────────────────────
① template list   ← 先看有哪些模板，别猜 --id
② template create --id X            (P2)
③ install         ← 装共享运行时     (P2)
                                                  ⓐ product create → 拿 PID
④ project bind-product --pid <pid>  ← 本地记下 PID（不是 miniapp 命令，但 ⑥ 依赖它）
                                                  ⓑ panel create-miniapp → 拿 appid
⑤ meta set-appid <appid>            ← 只是「记下」，它不会创建 appid
⑥ sync-schema     ← 从已绑产品拉 DP 生成 devices/schema.ts
⑦ build           ← 出 dist/
⑧ preview --emit-url  ← ★ 变成用户能打开的链接 ★
                                                  ⓒ panel miniapp-next-version → 拿 nextVersion
⑨ upload --version <nextVersion>    ← P2，要 appid
                                                  ⓓ miniapp ui-info-set & submit-review → 提审（或网页兜底）
                                                  ⓔ panel miniapp-version-status → 轮到审核通过
                                                  ⓕ panel miniapp-release → 上线
                                                  ⓖ panel ui-list & panel bind → 绑定 PID（或网页兜底）
```

**前置关系，不满足就不要硬跑**（命令会自己告诉你，但白跑一次是白跑）：
`⑥` 要 ④ 先做（`sync-schema` 会说没有 pid）；`⑨` 要 ⑤ 先做（`upload` 会说没有 appid）；
`⑤` 要 ⓑ 先做（appid 只能由平台签发）；`ⓒ` 要在 `⑨` **之前**跑，它算出来的号就是 `⑨` 的 `--version`；
`ⓕ` 要 `ⓔ` 报审核通过。

**右边那一列均有对应命令行操作，且提供网页直达链接作为兜底。** 提审（`miniapp ui-info-set` + `submit-review`）与绑定（`panel ui-list` + `bind`）的参数获取与命令写法，见下面的《创建 → 发布 → 绑定 PID 的完整链路》一节。

## 做完要给用户一个能打开的渲染链接

> The end-to-end release flow, preview handoff, CLI automation/fallback details, and rejection checklist live in [references/END_TO_END_RELEASE_FLOW.md](references/END_TO_END_RELEASE_FLOW.md). Read it when coding is complete or you are publishing/binding the panel.


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
`.agents/skills/tuyaopen-workflow-miniapp-dev/scripts/`。

## 深层技能：默认不安装，按需取回

本目录 30 个技能里**只有 4 个默认安装**（本技能 + 三个阶段 workflow）。其余 26 个仍在
目录里、内容完整，但**不在你的上下文里** —— 它们靠这一条命令取回：

```bash
tuyaopen-cli skills read --id <id>                       # 正文
tuyaopen-cli skills read --id <id> --path references/x.md # 某个附件
tuyaopen-cli skills read --id <id> --files                # 它带了哪些文件
```

它读的是 `manifests sync` 落下来的目录缓存，**不经过任何 agent 工具的安装根** ——
所以某个工具的安装视图坏掉（链接悬空、目录被删）也不影响它。

**不知道该取哪个**：`tuyaopen-cli skills list --json` 列出全部 30 条（含 `whenToUse`），
或查 skill `tuyaopen-start` 的 `references/ROUTING.md` 路由表。

**取不到**（`config` / `no_manifest_cache`）：跑 `tuyaopen-cli manifests sync` 把目录拉下来，
再重试。这是它唯一的失败模式。

需要长期固定在项目里（跟 git 走、可 review）时才装：
`tuyaopen-cli skills install --ids <id>`。平时不需要。
