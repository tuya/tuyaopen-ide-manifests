---
name: tuyaopen-workflow-miniapp-dev
description: >-
  The panel-miniapp phase of TuyaOpen product development, end to end: create
  the miniapp and get an appid, pick a category, write the panel, hand the
  user a render URL to review, upload, then submit / publish / bind — with the
  three web-only steps spelled out and their URLs constructed. Owns the phase
  order and the panel architecture and coding rules, and dispatches to the
  sub-skills (ray-common, smart-ui, charts-library, the category playbooks,
  performance-ux-guard, requirement-guide) for depth. Entered for any panel
  miniapp task, or handed over from `tuyaopen-workflow-product-dev` once a PID
  and DPs exist. Per-command flags and gating are in skill `tuyaopen-miniapp`.
  Covers every panel category the catalogue has a playbook for — lamp /
  lighting, socket, robot vacuum, IPC camera, electrician timing, energy and
  power statistics — plus charts, performance and UX review.
  **触发词**：手机、手机上、手机面板、手机 App、面板、面板小程序、小程序、
  panel、mini-app、miniapp、phone、app —— 用户提到用手机控制设备、在手机上看/设、
  或者直接说面板/小程序，都是本阶段。**「手机面板」最容易被误读**成涂鸦按 DP
  自动生成的通用面板而整个跳过（实测：第六轮定义了六个 DP、从没建过面板、
  全程没有一步提示缺了什么）——定义 DP 不产生面板，面板是独立的一个阶段。
  面板小程序阶段的完整工作流：创建小程序拿 appid → 选品类 → 写代码 →
  把渲染链接交给用户 review → 上传 → 提审 / 发布 / 绑定产品（后三步只能在
  网页做，含拼好参数的 URL）。同时承载面板架构与编码铁律，并按需分派到子技能。
  覆盖目录里有品类剧本的每一类面板 —— 灯、照明、插座、扫地机、扫地机器人、
  IPC 摄像头、电工定时、能耗与电量统计 —— 以及图表、UI 组件库、性能与 UX 走查。
  单条命令的参数与门禁见 skill tuyaopen-miniapp。
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

## Shortcuts — `tuyaopen-cli miniapp` / `tuyaopen-cli project` / `tuyaopen-cli devplat`

本技能负责**阶段顺序**：哪一步该跑哪条命令、每步交付什么、哪几步只能人做。
每条命令的参数、门禁与报错在 skill `tuyaopen-miniapp`；平台侧凭据与
`devplat exec` 的用法在 skill `tuyaopen-cloud`。

| 阶段 | Command |
|---|---|
| 看模板 → 建工程 → 装运行时 | `tuyaopen-cli miniapp template` · `tuyaopen-cli miniapp install` (P2) |
| 本地记下 PID（`sync-schema` 的前置） | `tuyaopen-cli project bind-product` (P2) |
| 记下平台签发的 appid | `tuyaopen-cli miniapp meta` |
| 从已绑产品同步 DP schema | `tuyaopen-cli miniapp sync-schema` |
| 构建 | `tuyaopen-cli miniapp build` |
| **跑起来，把渲染链接交给用户** | `tuyaopen-cli miniapp preview` |
| 上传版本 | `tuyaopen-cli miniapp upload` (P2) |
| 平台侧：建小程序 / 提审 / 发布 / 绑面板 | `tuyaopen-cli devplat exec` (P2) — 转发给 `tuya-devplat-cli panel …` |

Flags aren't listed here — run `tuyaopen-cli schema get --group <g> --command <c>`
for the current set. Resolve `tuyaopen-cli` first per skill `tuyaopen-shared` § 1
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

从零到上线 11 步——每步标出在本 skill 内解决，还是跳到哪个子技能。三步
（创建小程序、提审 / 发布、绑定）**没有任何命令行入口**，只能在网页上做，见下面
的专节。

> 这张表在 2026-08-24 之前从第 1 步"需求"开始，**漏掉了第 0 步和第 5 步** ——
> 拿 appid 和"把渲染链接交给用户"这两件事当时只写在 skill `tuyaopen-miniapp`
> 的正文里，不在流程表上，于是照着表走的 agent 会跳过它们。

| 阶段 / 场景 | 在本 skill 内 | 跳子技能 |
|---|---|---|
| **0. 创建小程序，拿到 appid** | **先问用户**（见下面《第 0 步是一次提问》），再按回答走网页或 `devplat exec -- panel create-miniapp`。拿到后 `tuyaopen-cli miniapp meta set-appid <appid>` 抄回项目 | — |
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
| **5. 跑起来，把渲染链接交给用户** | `tuyaopen-cli miniapp preview --emit-url` 打出一行 `{"event":"preview_url","url":…}`，**把那个 URL 交给用户**并等他看过再往下走 | `tuyaopen-miniapp`（命令参数与门禁） |
| 6. 上线前 review（性能 / UX / release gate） | — | `tuyaopen-miniapp-performance-ux-guard` |
| 7. 上传自检 | [references/upload-checklist.md](references/upload-checklist.md) + `scripts/validate.mjs` | — |
| 8. 上传（内测包） | — | `tuyaopen-miniapp`（`tuyaopen-cli miniapp upload`，命令行可做） |
| 9. 提审 / 发布 / 上线 | [只能在网页上做 —— 见下节](#提审发布与绑定只能在网页上做) | — |
| 10. 绑定面板小程序到产品 | [只能在网页上做，且必须在第 8 步之后 —— 见下节](#提审发布与绑定只能在网页上做) | — |
| —— 找文档 / 查 API / 查报错 | [references/info-lookup.md](references/info-lookup.md)（`search_help.py` / `fetch_doc.py` / `validate.mjs`） | — |

**规则**：先用本 skill 定位 + 基础约束，再按上表派单。AI **不能**跳过本
skill 直接进品类 skill；也**不能**跳过 conventions 直接写代码。

### 品类 skill 默认没装 —— 这是本节存在的原因

上表第 3 步派给的六个品类 skill 属于 `scenario` 安装组，**`tuyaopen-cli skills
install --all` 不会装它们**。它们互斥：做灯的人同时装上扫地机、IPC、插座的
手册，不会多出三项能力，只会给 agent 多出三个不相干的候选去挑。

所以本表就是它们的**唯一可见入口**。一个没装的 skill 在 agent 的上下文里
完全不存在 —— 看不到名字、看不到描述、无从"顺便发现"。你现在读到的这张
表，就是那六个 skill 在被装上之前唯一留下的痕迹。

判断品类后，先装再用：

```bash
tuyaopen-cli skills install --ids tuyaopen-miniapp-lamp-panel     # 照明
tuyaopen-cli skills install --ids tuyaopen-miniapp-socket-panel   # 插座 / 电工
tuyaopen-cli skills install --ids tuyaopen-miniapp-robot-vacuum   # 扫地机
tuyaopen-cli skills install --ids tuyaopen-miniapp-ipc-panel      # 摄像头 / IPC
tuyaopen-cli skills install --ids tuyaopen-miniapp-electrician-timing  # 电工定时
tuyaopen-cli skills install --ids tuyaopen-miniapp-energy-stats   # 能耗统计
tuyaopen-cli skills install --group scenario                      # 六个全装（少见：一次只做一个品类）
```

（命令写作裸 `tuyaopen-cli`；若这台机器上它不在 `PATH`，先按 skill
`tuyaopen-shared` § 1 解析一次。）

**装完要让 agent 真正读到它**：新装的 skill 不会进入当前会话的上下文，
需要重新加载 skill 列表或开一个新会话，再按品类 skill 的内容继续。

**产品品类不在上面六项里**（例如温控器、门锁、传感器）：没有对应的品类
skill，就留在本 skill + `tuyaopen-miniapp-ray-common` +
`tuyaopen-miniapp-smart-ui` 里做，**不要**挑一个"最像的"品类 skill 套用 ——
品类手册里的 DP 语义、组件选型和状态机是按那个品类写死的，套错比没有更糟。

## 第 0 步是一次提问，不是一格表

<code data-type="tag" style="color:#ff4d4f">内测第四轮：agent 从没问过，于是 appid 一直是空的，⑤⑧⑨ⓐ–ⓔ 全部走不了</code>

appid **只能由平台签发**，`tuyaopen-cli` 侧没有任何命令能创建它，`meta set-appid`
只是把一个已有的 appid 抄进项目。所以在写第一行面板代码之前，**停下来问用户**：

> 这个项目要配一个手机面板。两条路：
> 1. **新建面板小程序**（新项目的默认选择）—— 你去开发者平台建一个，我给你链接和步骤，建完把 appid 给我
> 2. **复用已有小程序** —— 直接把 appid 给我
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
| `uploaded` | `upload` 成功 | ⓒ 提审 → ⓓ 发布 → ⓔ 绑定 |
| `bound` | `panel bind` 完成 | 完 |

`appid` 是否已 `meta set-appid`，从 `.tuyaopen/` 读，与上面的状态正交 ——
没有它，`built` 之后一步都走不了。

### Definition of Done —— 报告"完成"之前逐条核对

- [ ] 用户被**问过**新建还是复用面板小程序
- [ ] appid 已 `meta set-appid` 写进项目
- [ ] `build` 成功
- [ ] **用户拿到过一个能打开的渲染链接，并且看过**（拿不到时见 ⑧ 的降级方案）
- [ ] `upload` 成功
- [ ] 提审 / 发布 / 绑定三个链接（或三条 `devplat` 命令的结果）已交给用户

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
⑨ upload          ← P2，要 appid
                                                  ⓒ panel miniapp-submit-version-review → 提审
                                                  ⓓ panel miniapp-release → 上线
                                                  ⓔ panel bind --ui-id … --product-id … → 面板绑产品
```

**前置关系，不满足就不要硬跑**（命令会自己告诉你，但白跑一次是白跑）：
`⑥` 要 ④ 先做（`sync-schema` 会说没有 pid）；`⑨` 要 ⑤ 先做（`upload` 会说没有 appid）；
`⑤` 要 ⓑ 先做（appid 只能由平台签发）。

**ⓐ–ⓔ 那一列不是「只能上网页」** —— 每一步都有 `tuya-devplat-cli` 命令，只是可能被授权集拦住。
完整链路、两个「绑定」的区别、以及三条硬性注意事项在下面的《创建 → 绑定 PID 的完整链路》一节，动手前先读它。

## 做完要给用户一个能打开的渲染链接

<code data-type="tag" style="color:#ff4d4f">第二轮的直接反馈：面板"编译成功"了，用户一次都没看见它长什么样</code>

`build` 产出的是一个 `dist/`，**没有人能看**。把它变成能看的东西是 `preview`：

```bash
tuyaopen-cli miniapp preview --emit-url
```

它会在 dev server 就绪的那一刻，往 **stdout** 打一行

```json
{"event":"preview_url","url":"http://127.0.0.1:<port>/#/pages/…"}
```

然后**阻塞住**（server 得活着，链接才有效）。所以：

1. **拿到那行就立刻把 URL 交给用户**，让他在浏览器里打开 —— 别等命令结束，它不会结束。
2. 人类可读的提示走 stderr，别去解析它；`--emit-url` 那一行才是机器通道。
3. 想**自己**确认渲染对不对，用 `preview --screenshot <path>`：它截一张 PNG 然后**退出**，
   信封里同时带 `url` 和 `screenshot` 路径。这条是给你看的，`--emit-url` 那条是给用户的。
4. 结束预览就 Ctrl+C（或杀掉进程）。用户还要看的时候别提前关掉。

> **别只报告"编译成功"。** 一个用户看不见的面板，对他等于没做。`miniapp build` 成功时的
> 信封里已经带了 `nextStep`，直接照它做。

> **`preview` / `install` 在独立 CLI 上也能跑了（0.1.0-beta.14 起）。**
> 此前不行：npm 包不带共享运行时，`preview` 会拿到
> `{"ok":false,"error":"MiniApp runtime not ready: miniapp.runtime.error.vendorMissing"}`，
> `install` 会要 `--extension-path`。**现在包里带了**，CLI 默认就从自己的安装目录找。
>
> 首次 `miniapp install --yes` 约 30s（铺开内置 tarball + 拉公网传递依赖），之后走缓存。
>
> **版本低于 beta.14 时**才需要下面的降级方案。判据是跑一句
> `tuyaopen-cli miniapp install --dry-run --json` 看 `runtimeVendorPresent`：
> `true` 就直接往下走；`false` 说明这份安装缺 payload，报的是
> `config:runtime_vendor_missing` 并会**打印它查过的路径**。
>
> **撞到这堵墙时不要放弃整条链**（第四轮就是这么丢掉 ⑨ 和 ⓐ–ⓔ 的）。降级方案：
> 1. 升级 CLI：`npm i -g @tuya/tuyaopen-cli --registry https://registry-npm.tuya-inc.top/`；或
> 2. 在 TuyaOpen IDE 里打开这个工程跑预览；或
> 3. 跳过 ⑧，直接 ⑨ `upload`，让用户用手机扫**内测版二维码**在真机上看 ——
>    真机预览本来就比 mock bridge 更接近真实；
> 4. 无论走哪条，**都要明确告诉用户"面板你还没看过"**，别让"build 成功"
>    冒充"面板做好了"。

**预览里看到的设备是模拟的**：它注入一个 mock bridge，DP 来自已绑定产品（有 pid 时）或
模板自己的 `src/devices/schema.ts`。stderr 上会写清这次用的是哪一种、几个 DP ——
**如果只有 1 个 DP，DP 驱动的 UI 就不会渲染**，那不是渲染 bug，是该先 `bind-product` +
`sync-schema`（顺序表里的 ⑤）。

## 创建 → 绑定 PID 的完整链路 —— 有三层，别只看第一层

涂鸦平台侧的创建 / 提审 / 发布 / 绑定，**并不是"只能在网页上做"** ——
`tuyaopen-cli` CLI 没有这些命令，但 `tuya-devplat-cli` 的 `panel` 组里有一整套
（实测 2026-08-21，读的是随插件分发的那份源码）：

```
panel create-miniapp                    ← 建小程序、拿 miniProgramId(appid)
panel miniapp-next-version              ← 算下一个版本号（跨 dev/review/online 取最大再 +1）
panel miniapp-submit-version-review     ← 生成版本并提交审核，轮询到 status=9
panel miniapp-task-poll                 ← 上一步 5 分钟超时后接着轮
panel miniapp-version-status            ← 查 reviewStatus / grayState / versionType
panel miniapp-release / -release-wait    ← 审核通过后发布上线（灰度 100%）
panel bind --ui-id <uiId> --product-id <pid>   ← 把面板绑到产品
panel save-standard-relation             ← 绑完登记进沙箱产物列表
product release-ui                       ← 公版面板可选
```

**`tuyaopen-cli schema list` 是 `tuyaopen-cli` 的权威，不是另一个 CLI 的权威。**
用它证明 `tuyaopen-cli miniapp publish` 不存在是对的；用它推断"平台侧没有命令行
办法"就错了 —— 内测第二轮完全没走到 create→bind，一半原因就是旧文案叫 agent
别去找。走 `tuyaopen-cli devplat exec -- panel …`（见 skill `tuyaopen-cloud`）。

**所以完整链路是三层，从上往下试：**

| 层 | 谁做 | 覆盖什么 |
|---|---|---|
| ① `tuyaopen-cli miniapp *` | 本地 | 模板、运行时、appid 记录、DP schema、构建、预览、上传包体（§0） |
| ② `tuya-devplat-cli panel *` | 平台 API | 建小程序、版本、提审、发布、**绑面板到产品** |
| ③ 网页 | 人 | ② 不可用时的兜底（下面的 URL 表） |

**②「不可用」有一个非常具体的形态，必须先读 skill `tuyaopen-cloud` 的 Trap 1**：
`panel --help` **按你的授权集过滤**，实测在未授权账号上它只列 7 条、**不列 `bind`**，
而 `bind` 是存在的。请求一条没权限的命令返回

```json
{"ok":false,"code":"API_NOT_AUTHORIZED","error":"Not authorized: 'panel bind' is not in your authorized API set. Do NOT retry…"}
```

**把它读成「去找开发者要这个 API 的权限」，绝不要读成「这个命令不存在」，也不要重试。**
第二轮完全没走到 create→bind，一半原因就是本节旧文案叫它别找。

### 两个都叫「绑定」的东西，不是一回事

这是这条链上最容易错的一步：

| | `tuyaopen-cli project bind-product --pid <pid>` | `tuya-devplat-cli panel bind --ui-id <uiId> --product-id <pid>` |
|---|---|---|
| 改的是 | **本地**：`tuyaopen.project.ini` 的 `[product]` | **平台**：产品上挂哪个面板 |
| 谁需要它 | `miniapp sync-schema`、DP 代码生成 | 手机 App 打开这个产品时显示哪个面板 |
| 不做的后果 | 本地拿不到 DP，schema 是占位的 | App 里看不到你的面板 |

**两个都要做，顺序是先本地再平台**，而且 `panel bind` 的 `--ui-id` **不是** appid：
从 `panel create-miniapp` 的返回里读，或按 `tuyaopen-cloud` 记的反查链走。

### 三条硬性注意事项（都来自 devplat-cli 自己的文档）

1. **一个沙箱项目一辈子只能有一个 miniProgramId。** 调 `create-miniapp` 之前**永远先找现有的**。
2. **不要从 `extendInfo.miniProgramId` 或 `resourceId` 猜 miniappId** —— 老数据很杂。
   正确反查链：`sandbox/resource/query {resourceTypes:['panel']}` → `extendInfo.conversationId`
   → `panel ai-status --conversation-id <cid>` → `miniapp_id`。只有这条链查不到才 `create-miniapp`。
3. **一个产品同时只能绑一个面板**，绑新的会替换旧的（`panel bind` 自带预检，会把被替换的面板信息
   一并返回；`--force` 跳过预检）。

> **一个尚未确认的边界，别当成已知**：这些 `panel miniapp-*` 命令的文案写的是
> 「Create a new miniapp for a product (**Vision**)」并反复提到**沙箱**。它们在一个用
> `product create` 建出来的普通 TuyaOpen 产品上是否同样适用，**没有验证过**。
> 所以顺序是：先试 ②，`API_NOT_AUTHORIZED` → 要权限；报错指向沙箱/Vision → 退到 ③，
> 并把那条错误原文记进反馈。**不要因为它写着 Vision 就不试**，也不要假装它一定能用。

## ③ 兜底：网页步骤与要拼好的 URL

上一节的 ② 层不可用时走这里。这四个步骤既不在本 skill、也不在 `tuyaopen-cli` CLI、
也不在 IDE 内——开浏览器去涂鸦开发者平台做。AI 走到这四步时必须**明确
告诉用户"这一步要去网页"并给出拼好参数的网址**，不要停在这里干等，更不要编一条
`tuyaopen-cli miniapp publish` / `submit` / `review` / `bind` 之类的命令——
`tuyaopen-cli` 的 `miniapp` 组只有 `build` / `install` / `meta` / `preview` /
`sync-schema` / `template` / `upload` 七条，跑 `tuyaopen-cli schema list --json`
可以自己核实。

**网址要带参数拼好，不要丢一个光秃秃的首页过去。** IDE 就是在点击时把参数拼
进 URL 的（`src/host/externalLinkHandlers.ts`），一点直达那一页那一个 tab；
只给基础域名等于让用户自己去几十个产品、几十个小程序里翻。

> **`upload` 成功的信封现在自己带着这三步。** `data.webSteps` 里是拼好参数的
> `versionPageUrl`（提审 + 发布）与 `bindProductUrl`（绑产品）、`order`（三步的
> **顺序**）、`pairingPrereqs`（配网前提），`next_steps` 是同两条 URL，`hint` 把这些
> 连成一段可以直接念给用户的话。

### ⚠ 顺序是硬的：发布 → 绑定 → 才配网

**先配网会拿到品类默认面板**，你刚做的那个不会出现，手机上也不会有任何提示说明原因，
**只能删掉设备重新配网**。所以这三步必须在用户动手配网**之前**就说清楚：

1. 提审 → 发布（网页）
2. 把发布后的面板绑定到产品（网页）
3. **然后**才让用户去手机配网

内测第八轮就是把「去配网」和「去提审绑定」放在同一段里讲的，没有说顺序要紧。

### ⚠ 配网还需要三样东西齐全

智能生活 / 涂鸦智能 App 的「添加设备」要 **PID + UUID + AuthKey** 三者齐备，缺任何一个
都会在添加环节失败，而且**报错不会指回这里**。让用户去配网之前先确认：

- 产品 PID —— `tuyaopen-cli project info --json`
- 模组里的授权码 —— `tuyaopen-cli firmware auth-status --port <口> --json`
  读**设备上实际有什么**；`tuyaopen-cli firmware authorize` 写一对进去。
  **不要用 `license list` 判断设备状态** —— 它列的是这台电脑上存着的码，
  和模组里有没有是两回事（而且 `--full` 会把 AuthKey 明文打出来）

**烧录整片固件不等于授权码还在。** 如果 App 提示未授权，先查这一条，别去查配网。

### ⚠ 参数缺失时**不要自己拼 URL**

取不到参数时信封**不给链接**，只在 `webSteps.blocked` 里说缺哪个前置。这时正确的动作是
**把缺的前置补上再重跑**，不是自己造一个 URL。

绑定页的 `id=` 是**产品 PID**，不是小程序 appid —— 名字叫 `projectId` 的那个字段装的是
PID。第八轮实测：agent 在 `bindProductUrl` 为空时自己拼了一条，把 appid 填进了 `id=`，
那会打开一个**真实存在但完全无关**的产品页，用户点进去看不出哪里不对。

| # | 步骤 | 为什么命令行做不了 | 打开哪个 URL |
|---|---|---|---|
| 1 | **拿到 appid**（选已有 or 新建） | 新建只能在平台做：devplat 的 `miniapp` 组只有 `list` / `debug-token` / `upload-version`，**没有 create**。`tuyaopen-cli miniapp meta set-appid <appid>` 只是把一个**已有的** appid 写进项目元数据 | **先看账号里已有的**（多数情况这一步就够了，不用开浏览器）：`tuyaopen-cli devplat exec --yes -- miniapp list --format json` → 拿 `miniProgramId` / `miniProgramName`，**把这份清单摆给用户挑**。要新建才开 `https://platform.tuya.com/miniapp/` —— 唯一不带参数的一步，因为参数要指的那个东西还不存在。两条路的收尾一样：`tuyaopen-cli miniapp meta set-appid <appid>` |
| 2 | **提审** | 审核是平台上有真人审核员的工作流，CLI 里没有对应接口 | `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>` |
| 3 | **发布 / 灰度 / 上线 / 回滚** | 影响这款产品线上**所有**终端用户，刻意不放到命令行 | 同第 2 步的版本管理页 |
| 4 | **把面板小程序绑定到产品** | 绑定关系挂在产品上，不在项目里，本地任何东西都断言不了 | `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` |

> **别一上来就把用户推去建新的。** 绝大多数测试账号里已经有小程序了，
> `miniapp list` 一条命令就能拿到。正确的顺序是：**先列，摆给用户挑，
> 挑不到再建**。
>
> **忘了设也不会让你瞎猜**：`miniapp upload` 在 appid 缺失（或不属于本账号）时
> 返回 `config` / `no_appid`，信封的 `data.candidates` 里**直接带着这个账号的
> 候选清单**（`appId` + `name`，不含私钥），`hint` 同时给出「挑一个」和
> 「去平台建一个」两条路。
>
> 注意 `data.candidates` 的两种空：`null` 是**没查到**（没登录 / 断网），
> `[]` 才是**查到了、账号里确实没有**。`candidatesKnown` 是同一件事的布尔形式。
> 不要把前者读成后者 —— 那会让你去建一个其实早就存在的小程序。

### 两个参数分别是什么、从哪读

两个都从 `source/miniapp/project.tuya.json` 读（读不到再退到
`<project>/project.tuya.json`——IDE 也是按这两个候选顺序试的），并且都要
URL 编码（IDE 用的是 `encodeURIComponent`）：

| 占位符 | JSON 字段 | 实际装的是什么 | 为空说明什么 |
|---|---|---|---|
| `<appid>` | `appid` | **小程序 id**，就是 `tuyaopen-cli miniapp meta set-appid` 写进去的值 | 平台上还没创建这个小程序 → 先做第 **1** 步。此时没有任何东西可提审、可发布 |
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

1. **上传（upload）** —— `tuyaopen-cli miniapp upload`（或 IDE MiniApp 页面的
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
或查 skill `tuyaopen-shared` 的 `references/ROUTING.md` 路由表。

**取不到**（`config` / `no_manifest_cache`）：跑 `tuyaopen-cli manifests sync` 把目录拉下来，
再重试。这是它唯一的失败模式。

需要长期固定在项目里（跟 git 走、可 review）时才装：
`tuyaopen-cli skills install --ids <id>`。平时不需要。
