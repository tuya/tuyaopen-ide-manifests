# Upload Checklist — Tuya Panel MiniApp 审核验收标准

> 本清单分为**必过**（不满足直接拒审）和**建议**（影响审核速度 / 上线
> 后体验）。每条都给出**自动检测方式**（`validate.mjs` 已实现的）和
> **人工核对**（脚本查不出来的）。

---

## A. 必过清单（不满足审核拒绝）

### A1. `project.tuya.json` 必填字段

| 字段 | 要求 | validate.mjs 检测 |
|---|---|---|
| `appid` | 非空，长度 ≥ 16 字符 | ✓ |
| `appVersion` | semver 格式 `X.Y.Z` | ✓ |
| `projectId` | 非空 | ✓ |
| `type` | 必须 `panel-app` | ✓ |
| `devMode` | 必须 `ray` | ✓ |
| `compileType` | 必须 `miniprogram` | ✓ |
| `dependencies.BaseKit` | 必须存在，semver | ✓ |
| `dependencies.MiniKit` | 必须存在 | ✓ |
| `dependencies.DeviceKit` | 必须存在 | ✓ |
| `baseversion` | 非空 | ✓ |

### A2. `app.config.ts` 必填字段

```ts
export const thing = {
  window: { /* 至少有 backgroundColor / navigationBarTitleText */ },
  pages: [/* 至少一个页面 */],
};
```

每个 `pages[i]` 都必须在 `src/<path>/index.tsx` 真实存在。

### A3. 必备页面

- **首页**：`pages` 数组第一个，作为打开面板的默认页
- **关于 / 设置入口**：通过 `ty.openFunctionalSettings()` 或自建页面调起
- **隐私协议入口**：通常用 `ty.openOfficialPanel({ panelType: 'privacy' })`
  或自建页面渲染 `i18n('privacy.policy.content')` 内容

### A4. DP 完整性

- `src/devices/schema.ts` 中的 DP **必须**与 Tuya 平台云端配置一致
  （IDE "Sync DPs from Cloud" 保证）
- 代码里读 / 写的 DP `code` 必须在 schema 里存在
- DP 的 `mode` 决定可读 / 可写：`ro` 的 DP 不准 `.set()`

### A5. 禁用 API 不出现

代码全文 grep（validate.mjs 实现，自动跳过 `src/ty-shim.ts`）：

```
fetch\s*\(           ← 必须为 0 命中
XMLHttpRequest       ← 必须为 0 命中
localStorage         ← 必须为 0 命中（ty-shim.ts 除外）
sessionStorage       ← 必须为 0 命中
document\.cookie     ← 必须为 0 命中
window\.open         ← 必须为 0 命中
eval\s*\(            ← 必须为 0 命中
new Function         ← 必须为 0 命中
apiRequestByAtop     ← 必须为 0 命中
```

### A6. 包大小限制

| 项 | 限额 | 检测 |
|---|---|---|
| 主包 `dist/tuya/` 大小 | ≤ 4 MiB | ✓ |
| 总包（含分包） | ≤ 20 MiB | ✓ |

资源（图片 / 字体 / 视频）必须放 `cdn/` 目录，构建时上传 CDN，**不打进
主包**。

### A7. i18n 双语支持

- `project.tuya.json.i18n` 应该为 `true`（模板默认 `false`，需手动打开）
- 必须至少有 `en` 和 `zh` 两个 locale 的资源文件（如 `src/i18n/en.json` + `src/i18n/zh.json`）
- 代码里**无硬编码文案**（JSX 字面值 / `ty.showToast` 的 `title`
  等文案必须经 `t()`）—— [conventions.md Rule 5](conventions.md#rule-5)

> **模板说明**：脚手架模板（`media/miniapp-template/`）默认 `i18n: false`，
> 文案为硬编码英文（作为起始占位符）。这是**开发起点**，不是上线状态。
> 上传前必须：① 将所有文案替换为 `t('key')` 调用；② 创建 `src/i18n/en.json` +
> `src/i18n/zh.json`；③ 将 `project.tuya.json.i18n` 改为 `true`。
> validate.mjs 的中文扫描只能发现中文硬编码，**无法检测硬编码英文** —— 英文
> 硬编码同样不符合审核要求，人工检查时须一并处理。

---

## B. 强烈建议清单

### B1. 性能门槛

- 首屏渲染时间 ≤ 2s（弱网 ≤ 4s）
- FMP（First Meaningful Paint）≤ 1.5s
- 图片走 CDN + 适当压缩
- 无大型 setData（一次 ≤ 100KB）

### B2. 体验门槛

- 所有 async 操作有 loading 态
- 所有失败有错误提示（不要静默吞错）
- 所有空数据有空态展示
- 防重复提交（按钮点击后 disable 直到 promise resolve）

### B3. 可访问性

- 所有 `<View>` 充当按钮时加 `aria-role="button"`
- 触摸目标 ≥ 44×44pt
- 配色对比度 WCAG AA（小字 ≥ 4.5:1，大字 ≥ 3:1）
- 图片有 `alt` / `aria-label`

### B4. 网络请求白名单

如果用了 `<Image src="https://..."/>` 或其他外部资源，对应 host 必须在
Tuya 平台「网络请求白名单」里登记。审核时随机抽查请求 host。

### B5. 隐私 / 权限说明

如果用到这些 API，必须在 Tuya 平台后台勾选对应权限**并填写使用说明**：

| API | 权限 |
|---|---|
| `ty.getLocation` | 位置 |
| `ty.chooseImage` / `ty.chooseVideo` | 相册 |
| `ty.scanCode` | 摄像头 |
| `ty.getUserInfo` | 用户信息 |
| `ty.requestPayment` | 支付 |
| `ty.subscribeMessage` | 通知 |

使用说明必须诚实，审核员会真的看。

---

## C. 上传前自检流程

### 步骤 1：跑自动化检查

```bash
cd source/miniapp
node .agents/skills/miniapp/panel-foundation/scripts/validate.mjs
```

退出码：
- `0` = ready，可以上传
- `1` = 有警告，可以上传但建议修
- `2` = 有错误，**不能上传**

### 步骤 2：人工核对（脚本查不出来的）

- [ ] 在 Tuya 平台后台「权限管理」里勾了对应权限并填了说明
- [ ] 在「网络请求白名单」里登记了所有外部 host
- [ ] 「面板基础信息」填了：图标、名称、品类、描述
- [ ] 「面板兼容产品」选了至少一个 PID
- [ ] 提交描述 / changelog 写清楚了本版本变化（审核会读）

### 步骤 3：本地真机测试

- [ ] 涂鸦智能 App 扫码预览（一次完整用户路径）
- [ ] 多种网络（5G / Wi-Fi / 弱网）下点击响应不卡
- [ ] 中英切换 → 字符串无残留中文
- [ ] 关闭应用再打开 → 状态正确恢复

### 步骤 4：构建包检查

```bash
ray build --target tuya       # 生产构建
du -sh dist/tuya              # 主包大小
find cdn -size +500k          # 找超过 500KB 的资源
```

### 步骤 5：上传

走 IDE 的 MiniApp 页面「上传」按钮。**不要**在审核中心绕过 IDE 上传未签名包。

---

## D. 常见拒审原因 Top 10

| # | 原因 | 触发 | 防御 |
|---|---|---|---|
| 1 | 主包超 4 MiB | 把 PNG / 字体打进 src/ | 移到 `cdn/` |
| 2 | 硬编码中文 | `<Text>开关</Text>` / `ty.showToast({ title: '错误' })` | 走 i18n |
| 3 | 用了 `fetch` | 直接调 OpenAPI | 改 cloud-api |
| 4 | 隐私权限未说明 | 用 `ty.getLocation` 没填使用说明 | 后台填说明 |
| 5 | 网络白名单缺 | 加载外站图片 | 后台加白名单 |
| 6 | DP 实现错位 | 读 / 写一个 schema 不存在的 code | 验证 schema |
| 7 | 设计不一致 | 自造 Button 颜色乱用 | 用 smart-ui |
| 8 | 真机崩溃 | 没处理离线态 / 没 dp 时白屏 | 兜底 UI |
| 9 | 控件无障碍缺失 | 全靠颜色区分状态 | 加 aria + 文字 |
| 10 | i18n 资源不全 | 只有中文 zh.json | 补 en.json |

---

## E. 自动化检查脚本对照

`scripts/validate.mjs` 检查项与本清单的对应：

| 检查 | 清单条目 |
|---|---|
| `project.tuya.json` 字段完整性 | A1 |
| `src/app.config.{ts,js}` 解析 + `pages` 数组检查 | A2 |
| 页面文件存在性 | A2 |
| `src/devices/schema.ts` 存在 + `lampSchemaMap` 导出 | A4 |
| 禁用 API grep（跳过 ty-shim.ts） | A5 |
| `dist/` 大小 | A6 |
| `cdn/` 单文件大小检查 | A6 + B1 |
| `i18n` 字段 + 中文硬编码扫描 | A7 |
| `useState` 用于 DP 嗅探 | 反模式（[Rule 1](conventions.md#rule-1)） |

剩下（隐私 / 权限 / 网络白名单 / 真机测试）**必须人工**，脚本查不到。
