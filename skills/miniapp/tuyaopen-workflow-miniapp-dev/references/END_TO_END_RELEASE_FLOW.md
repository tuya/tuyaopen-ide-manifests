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
> **撞到这堵墙时不要放弃整条链**（第四轮就是这么丢掉 ⑨ 和 ⓑ–ⓖ 的）。降级方案：
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

## 创建 → 发布 → 绑定 PID 的完整链路 —— 六步皆支持 CLI，含网页兜底

`tuyaopen-cli` 自己没有平台侧命令，但 `tuya-devplat-cli` 的 `panel` 与 `miniapp` 组里有，
经 `tuyaopen-cli devplat exec` 转发即可。**本节只排顺序**；wrapper 长什么样、
每条命令的入参出参、状态码表、失败形态、超时，全在 skill `tuyaopen-miniapp`。

| # | 步骤 | 谁做 | 用什么 |
|---|---|---|---|
| ⓑ | 建小程序，拿 appid | 命令 | `panel create-miniapp`；返回的 `miniProgramId` **就是** appid，随后 `tuyaopen-cli miniapp meta set-appid <appid>` 记进项目 |
| ⓒ | 算下一个版本号 | 命令 | `panel miniapp-next-version`，**在 upload 之前**跑，把 `nextVersion` 喂给 `upload --version` |
| ⓓ | **提审** | 命令优先（网页兜底） | `miniapp ui-info-set`（设置 4 项属性） + `miniapp submit-review --miniapp-id <appid> --version-id <versionId>`；若 CLI 缺少命令或图片未就绪走网页提审：`https://platform.tuya.com/miniapp/version?miniProgramId=<appid>` |
| ⓔ | 查审核状态 | 命令 | `panel miniapp-version-status`，agent 自己隔一会儿查一次 |
| ⓕ | 发布上线 | 命令 | `panel miniapp-release`，前置是 ⓔ 报审核通过；全量 100%，不是灰度 |
| ⓖ | **把面板绑到产品** | 命令优先（网页兜底） | `panel ui-list --product-id <PID> --code PRIVATE`（从返回的 private 面板列表中匹配 `miniappId` 提取 `uiId`） + `panel bind --ui-id <uiId> --product-id <PID>`；若手写面板未查到 uiId 走网页绑定：`https://platform.tuya.com/pmg/step?id=<PID>&tab=operation#PRIVATE` —— `id=` 是**产品 PID**，永远不是 appid |

**`tuyaopen-cli schema list` 是 `tuyaopen-cli` 的权威，不是另一个 CLI 的权威。**
用它证明 `tuyaopen-cli miniapp publish` 不存在是对的；用它推断"平台侧没有命令行
办法"就错了 —— 内测第二轮完全没走到 create→bind，一半原因就是旧文案叫 agent
别去找。走 `tuyaopen-cli devplat exec`（见 skill `tuyaopen-miniapp` 与 `tuyaopen-cloud`）。

### 提审与绑定的自动化闭环与网页兜底

在早期的 `tuya-devplat-cli` 中，提审命令 `panel miniapp-submit-version-review` 依赖沙箱 AI 会话（`--conversation-id`），而 `panel bind` 所需的 `--ui-id` 也未在手写面板链路明确透出，因此历史指引将其退避至网页操作。

在最新的 `tuya-devplat-cli`（提交 `3625a165` 及以上）中，**提审与绑定已实现完整的命令行闭环**：

- **提审自动化**：
  1. **设置 4 项提审属性**：`basicinfo.set:1.0`（单次写 1 项，须填齐 `iotUiName`、`iotUiEnName`、`iotUiPreviewPicture`、`iotUiEnPreviewPicture`）：
     ```bash
     tuyaopen-cli devplat exec --yes -- miniapp ui-info-set --miniapp-id <appid> --type iotUiName --value "智能面板" --format json
     tuyaopen-cli devplat exec --yes -- miniapp ui-info-set --miniapp-id <appid> --type iotUiEnName --value "Smart Panel" --format json
     tuyaopen-cli devplat exec --yes -- miniapp ui-info-set --miniapp-id <appid> --type iotUiPreviewPicture --value "https://..." --format json
     tuyaopen-cli devplat exec --yes -- miniapp ui-info-set --miniapp-id <appid> --type iotUiEnPreviewPicture --value "https://..." --format json
     ```
     审核预检只要求 URL 非空；若开发期尚无最终截图，可先用产品详情里的类目默认图
     拼成托管 URL（例如 `https://images.tuyacn.com/<detail.data.icon 或 category icon>`）。
     正式发布前建议替换为真实面板截图。
  2. **提交审核**：调用 `miniapp submit-review`（底层通过 `version.audit.check:1.0` 预检后发起 `version.review:3.0`，已获得授权）：
     ```bash
     tuyaopen-cli devplat exec --yes -- miniapp submit-review --miniapp-id <appid> --version-id <versionId> --format json
     ```
     `versionId` 来自 `tuyaopen-cli miniapp upload` 的返回值或 `panel miniapp-version-status`。
  3. **等待审核完成**：提审后不要立即 release。审核通常约 **2 分钟**（实测可能 40 秒到几分钟），用 `panel miniapp-version-status` 轮询，直到 `reviewStatus == 2`。
  4. **网页兜底**：若本地 devplat-cli 版本过旧缺少 `submit-review`，或提审封面图尚未就绪，自动降级至网页提审链接 `data.webSteps.versionPageUrl`。

- **绑定自动化**：
  1. **查询 Panel UI ID**：`panel ui-list --code PRIVATE` 查询属于该产品的私有面板：
     ```bash
     tuyaopen-cli devplat exec --yes -- panel ui-list --product-id <PID> --code PRIVATE --format json
     ```
     在返回的列表中根据 `miniappId` 匹配出真实的 `uiId`（**注意：`--ui-id` 是 Panel UI ID，绝不是 appid**）。
  2. **绑定产品**：
     ```bash
     tuyaopen-cli devplat exec --yes -- panel bind --ui-id <uiId> --product-id <PID> --format json
     ```
  3. **绑定成功后用当前面板验证**：不要用 `panel ui-list` 的 `isSelected` 判断绑定结果——该字段的语义与 `/api/v5/product/getUIProperty` 不一致。执行：
     ```bash
     tuyaopen-cli devplat exec --yes -- product ui-property --product-id <PID> --format json
     ```
     返回的 `uiId` 必须等于刚绑定的 `uiId`。
  4. **网页兜底**：若返回列表中未匹配到 `uiId`，走网页绑定链接 `data.webSteps.bindProductUrl`，严禁猜测或伪造参数。

这两条命令均需要账号具备对应 API 权限。若请求返回 `API_NOT_AUTHORIZED`，请参考 skill `tuyaopen-cloud` 的 Trap 1 申请权限，不要读成"命令不存在"。

### 两个都叫「绑定」的东西，不是一回事

这是这条链上最容易错的一步：

| | `tuyaopen-cli project bind-product --pid <pid>` | `tuya-devplat-cli panel bind --ui-id <uiId> --product-id <pid>` |
|---|---|---|
| 改的是 | **本地**：`tuyaopen.project.ini` 的 `[product]`；若 `source/miniapp` 存在，还会同步 `project.tuya.json.projectId` | **平台**：产品上挂哪个面板 |
| 谁需要它 | `miniapp sync-schema`、DP 代码生成 | 手机 App 打开这个产品时显示哪个面板 |
| 不做的后果 | 本地拿不到 DP，schema 是占位的 | App 里看不到你的面板 |

**两个都要做，顺序是先本地再平台。** 两条命令均可直接通过 CLI 运行；平台绑定依赖先通过 `panel ui-list --product-id <PID> --code PRIVATE` 提取 `uiId`。

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
> 所以顺序是：**先试命令**；`API_NOT_AUTHORIZED` → 去要这个 API 的权限；
> 报错指向沙箱 / Vision → 退回网页那条路，并把那条错误原文记进反馈。
> **不要因为它写着 Vision 就不试**，也不要假装它一定能用。

## 提审与绑定的网页兜底直达链接（以及 CLI 转发）

提审与绑定可通过 `tuyaopen-cli devplat exec --yes -- ...` 进行命令行操作（详见下文《提审与绑定的自动化闭环与网页兜底》）。
若本地命令缺失、前置物料未齐或用户更倾向于在网页控制台中操作，AI 应当**给出拼好参数的网址作为兜底**。**不要编造不存在的一级命令**——
`tuyaopen-cli` 的 `miniapp` 组只有 `build` / `install` / `meta` / `preview` /
`sync-schema` / `template` / `upload` 七条，跑 `tuyaopen-cli schema list --json`
可以核实。**平台提审、发布与绑定走 `tuyaopen-cli devplat exec` 转发，不在 `miniapp` 一级组里。**

**网址要带参数拼好，不要丢一个光秃秃的首页过去。** IDE 就是在点击时把参数拼
进 URL 的（`src/host/externalLinkHandlers.ts`），一点直达那一页那一个 tab；
只给基础域名等于让用户自己去几十个产品、几十个小程序里翻。

> **`upload` 成功的信封自己带着这些 URL。** `data.webSteps` 里是拼好参数的
> `versionPageUrl`（版本管理页 —— 提审在这里，发布也可以在这里）与
> `bindProductUrl`（绑产品）、`order`（顺序）、`pairingPrereqs`（配网前提），
> `next_steps` 是同两条 URL，`hint` 把这些连成一段可以直接念给用户的话。
> 发布这一步现在也可以不开浏览器 —— `panel miniapp-release` 就是它。

### ⚠ 顺序是硬的：发布 → 绑定 → 才配网

**先配网会拿到品类默认面板**，你刚做的那个不会出现，手机上也不会有任何提示说明原因，
**只能删掉设备重新配网**。所以这几步必须在用户动手配网**之前**就说清楚：

1. 提审 —— CLI 优先：先补齐四项 UI 属性（`miniapp ui-info-set`），经用户确认后执行 `miniapp submit-review`；不可撤回
2. 审核通过后发布 —— `panel miniapp-version-status` 确认 `reviewStatus == 2`，再执行 `panel miniapp-release`
3. 绑定产品 —— 先用 `panel ui-list --code PRIVATE` 匹配 `miniappId` 并取得唯一 `uiId`，经用户确认后执行 `panel bind`
4. **然后**才让用户去手机配网

发布这一步换成了命令，**并不改变这个顺序** —— 绑定绑的仍然是一个已经上线的面板。

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

| # | 步骤 | 命令行能不能做 | 打开哪个 URL |
|---|---|---|---|
| 1 | **拿到 appid**（选已有 or 新建） | **能，两条路都能。** 先看账号里已有的：`tuyaopen-cli devplat exec --yes -- miniapp list --format json` → 拿 `miniProgramId` / `miniProgramName`，**把这份清单摆给用户挑**（这条命令的原始输出含每个小程序的私钥，wrapper 已经替你打码 —— 见 skill `tuyaopen-miniapp`）。要新建就 `panel create-miniapp`。两条路的收尾一样：`tuyaopen-cli miniapp meta set-appid <appid>` | 只在两条命令都不通时才开 `https://platform.tuya.com/miniapp/` —— 唯一不带参数的一步，因为参数要指的那个东西还不存在 |
| 2 | **提审** | **能。** 优先调用 `miniapp ui-info-set`（设置 4 项属性） + `miniapp submit-review --miniapp-id <appid> --version-id <versionId>`；若命令缺失或图片未上传则降级走网页 | `https://platform.tuya.com/miniapp/version?miniProgramId=<appid>` |
| 3 | **发布 / 上线** | **能** —— `panel miniapp-release`，前置是审核已通过；全量 100%，没有灰度和回滚参数 | 想在网页上做也行：同第 2 步的版本管理页 |
| 4 | **把面板小程序绑定到产品** | **能。** 优先调用 `panel ui-list --product-id <PID> --code PRIVATE` 查询 `uiId`，再调用 `panel bind --ui-id <uiId> --product-id <PID>`；若未匹配到 uiId 降级走网页 | `https://platform.tuya.com/pmg/step?id=<projectId>&tab=operation#PRIVATE` |

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

### 上传 / 提审 / 发布 / 绑定是四件不同的事

四件事按顺序发生，**均具备命令行入口**，同时支持网页链接兜底：

1. **上传（upload）** —— `tuyaopen-cli miniapp upload`（或 IDE MiniApp 页面的
   「上传」按钮）在平台上登记一个**版本**。**有 CLI 命令。**
   包只是给你和团队内测用，终端用户看不到。
2. **提审** —— 设置 4 项属性（`miniapp ui-info-set`）后把版本送进审核（`miniapp submit-review`）。**有 CLI 命令**，但提审不可撤回，执行前必须确认属性完整并征得用户同意；命令缺失或图片未就绪时降级走网页兜底 URL（第 2 步的 URL）。
3. **发布（上线）** —— 审核通过后把版本放出去。**有 CLI 命令**：先
   `panel miniapp-version-status` 确认通过（`reviewStatus == 2`），再 `panel miniapp-release`。
4. **绑定** —— 第 4 步，把**已发布**的小程序挂到产品上，面板才真的能到这款
   产品的设备上。**有 CLI 命令**：先通过 `panel ui-list --product-id <PID> --code PRIVATE` 解析出真实 `uiId`，再调用 `panel bind --ui-id <uiId> --product-id <PID>`；未匹配到或参数异常时降级走网页兜底 URL。

**顺序是死的：不能先绑定再发布。** 第 4 件绑的是一个**已经发布**的小程序，
第 3 件没做完就没有东西可挂。IDE 给出的正是这个顺序——发布是 STEP 1、绑定是
STEP 2（见 `media/webview/help/miniapp-step3.*.md`）。所以：`upload` 绿了
**不等于**已提审，提审了**不等于**已发布，已发布**也不等于**已经能到设备上。
照实说四件里做完了哪几件，别让"上传成功"顶替"已上线"。

> **别把两种"绑定"搞混。** 本 skill 其他地方（第 2.5 步、
> [platform-cache.md](platform-cache.md)）说的"绑定 /
> 绑产品"是**把产品 PID 绑到项目上**，为的是能同步 DP schema，属于开发前置；
> 这里第 4 步说的是**把已发布的小程序绑到产品上**，属于上线动作。两者只在一
> 点上相连：前者写进 `projectId` 的那个 PID，正是后者 URL 里 `id=` 要用的值。

平台在审核时到底查什么（包大小、i18n、禁用 API、权限说明），见
[upload-checklist.md](upload-checklist.md)；命令行那一侧
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
   `fetch_doc.py` / `search_help.py` 查实际文档，见 [info-lookup.md](info-lookup.md)

## References（按需加载）
