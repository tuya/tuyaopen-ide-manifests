# 信息查找：什么场景跑什么脚本

**回答任何开发问题前先按这张决策表查信息，不要凭记忆回答**。

| 问题类型 | 第一步 | 命令 |
|---|---|---|
| 报错 / 运行时异常 / 平台行为不符预期 | 帮助中心 FAQ | `python3 scripts/search_help.py "<报错关键词>" --limit 5` |
| API 参数 / 返回值 / 类型签名 | 官方 API schema | `python3 scripts/fetch_doc.py "https://developer.tuya.com/cn/miniapp/develop/ray/api/..."` |
| hook 用法（useProps / useActions / useStructuredProps...） | panel-sdk schema | `python3 scripts/fetch_doc.py --api <hookName> --source panel-sdk` |
| 组件 props / 事件 / 用法 | 官方文档 | `python3 scripts/fetch_doc.py "https://developer.tuya.com/cn/miniapp/develop/ray/component/..."` |
| 指南 / 架构 / 流程类 | 官方文档 | `python3 scripts/fetch_doc.py "https://developer.tuya.com/cn/miniapp/..."` |
| 不知道 URL，只知道关键词 | 搜索文档索引 | `python3 scripts/fetch_doc.py --search "<关键词>" --fetch` |
| 「这个项目当前能不能上线」 | 自动化自检 | `node scripts/validate.mjs` |

**脚本无任何额外依赖**：仅需 Python 3 标准库 + `curl`（Linux/macOS 预装；
Windows 10 1803+ 内置 curl）。

**脚本调用路径**：从项目根目录或 `source/miniapp/` 均可用相对路径
`.agents/skills/miniapp/smart-panel-dev/scripts/`；技能内部引用用 `scripts/` 简写。

## 禁止凭记忆回答的 5 类问题

1. **API 参数 / 返回值** —— 必先 `fetch_doc.py --api <name>` 或给完整 URL
2. **报错原因 / 解决方案** —— 必先 `search_help.py "<报错关键词>"`
3. **组件 props / 事件签名** —— 必先 `fetch_doc.py` 查文档
4. **Hook 行为细节**（如 `useProps` 是否会触发 rerender、`useStructuredProps` 怎么注册）—— 必查 panel-sdk schema
5. **上传 / 审核规则、包大小限额、权限声明** —— 必跑 `validate.mjs` 或查 upload-checklist.md

---

## 1. 跑 `validate.mjs` 做上线自检

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
 ✓ <category>SchemaMap exported from schema (required by createDpKit)
 ✓ src/devices/index.ts uses createDpKit pattern
 ✓ no forbidden APIs in src/ (ty-shim.ts exempted)
 ✗ project.tuya.json.appid is empty — must be set before upload
 ✗ project.tuya.json.projectId is empty
 ⚠ project.tuya.json.i18n is false — set to true for international audit

 result: 2 error(s), 1 warning(s) — NOT READY for upload
```

**退出码**：`0` = ready，`1` = warnings only，`2` = errors（阻塞上传）。

**注意**：
- 空模板的 `appid` / `projectId` 为空属于正常情况（IDE 创建项目时自动填入），
  不影响开发调试，**上传前**必须在 Tuya 平台获取并填写。
- 模板 `i18n: false` + 硬编码英文文案是**开发起点**，不是上线状态。上传前
  必须补充 `src/i18n/en.json` + `zh.json`，将所有文案改为 `t('key')` 调用。
- `<category>SchemaMap` 检查项里的 `<category>` 因品类而异——灯具是
  `lampSchemaMap`、插座是 `switchSchemaMap`、摄像头模板可能是 `ipcSchemaMap`
  等。脚本按 `src/devices/schema.ts` 实际导出的命名校验，不强行要求是 `lamp`。

---

## 2. 查帮助中心 — `search_help.py`

当遇到编译报错、运行时异常、上传失败、API 行为不符预期等问题时，**先查
Tuya 帮助中心**，再凭记忆回答。帮助中心面板小程序分类（`Cefowhf7gadrn`）
有 160+ 篇针对开发者的 FAQ，覆盖绝大多数常见坑。

### 用法

```bash
# 按关键词搜索（推荐，精准）
python3 scripts/search_help.py "Ray 第三方库报错"
python3 scripts/search_help.py "包体积超限怎么处理" --limit 5
python3 scripts/search_help.py "真机预览无法加载"

# 只输出 URL（供后续 WebFetch 读取详情）
python3 scripts/search_help.py "调试模式" --url-only

# 导出全部文章列表（用于概览 / 批量读取）
python3 scripts/search_help.py --list-all
```

脚本自动管理 Cookie / CSRF（首次运行联网获取，之后从缓存复用）。

### 常用触发场景 → 建议关键词

| 场景 | 关键词 |
|---|---|
| 编译 / 构建报错 | 报错关键字，如 `"缺少服务提供者"` `"ESModule CommonJS混用"` |
| 上传 / 审核失败 | `"上传代码包"` `"审核拒绝"` `"提交审核"` |
| 真机预览 / 扫码异常 | `"真机预览"` `"扫码体验"` `"当前App版本无法支持"` |
| 调试工具问题 | `"调试模式"` `"开发者工具"` `"IDE调试"` |
| API 行为不符预期 | API 名称，如 `"publishDps"` `"getDeviceInfo"` `"saveDevProperty"` |
| 多语言 / i18n 相关 | `"多语言"` `"上传多语言"` |
| 权限 / 隐私 / 认证 | `"授权"` `"麦克风权限"` `"IDE授权"` |

### 标准流程

```
1. python3 scripts/search_help.py "<关键词>" --limit 5
2. 从输出的 URL 中选最相关的 1–2 篇
3. 用 WebFetch 读取详情页（https://support.tuya.com/zh/help/_detail?id=<id>）
4. 综合帮助页内容 + 当前代码上下文给出答案
```

### 技术实现

帮助中心（support.tuya.com）是 Next.js SSR 应用，数据通过客户端 API 加载：

- **搜索接口**：`POST https://support.tuya.com/api/v2/search`
- **Body 格式**：`{"input": {"uri": "help", "cateCode": "<分类>", "keyword": "<词>", "offset": N, "limit": N}}`
- **认证**：页面 Cookie 中的 `csrf-token` 值需作为 `x-csrf-token` 请求头传入
- **注意**：`keyword` 不能为空（空字符串返回 0 结果）；这是全文搜索接口，非分类浏览
- **面板小程序分类码**：`Cefowhf7gadrn`（一级父分类：小程序端 `608030`）

---

## 3. 查官方文档 — `fetch_doc.py`

`developer.tuya.com/cn/miniapp/...` 是 Next.js 静态导出站点
（`nextExport: true`）。页面 HTML 是空壳，内容在独立 JS chunk 里。
**WebFetch 只能获取空 HTML；用 `fetch_doc.py` 才能拿到正文。**

### 用法

```bash
# 1. 直接获取文档页面（guide / solution / 概念类）
python3 scripts/fetch_doc.py "https://developer.tuya.com/cn/miniapp/develop/ray/guide/overview"
python3 scripts/fetch_doc.py "https://developer.tuya.com/cn/miniapp/solution-panel/ability/common/multi-language"

# 2. 直接获取 API 参考页（自动识别，走 schema CDN）
python3 scripts/fetch_doc.py "https://developer.tuya.com/cn/miniapp/develop/ray/api/device-control/dp/publishDps"

# 3. 按 API 名称直接查（最快，无需 URL）
python3 scripts/fetch_doc.py --api publishDps               # ray-js（默认）
python3 scripts/fetch_doc.py --api useProps --source panel-sdk
python3 scripts/fetch_doc.py --api checkOTAUpdateInfo

# 4. 在 4500+ 页文档中搜索
python3 scripts/fetch_doc.py --search "多语言"
python3 scripts/fetch_doc.py --search "useStructuredProps" --fetch    # 搜索+获取第一条
python3 scripts/fetch_doc.py --search "OTA" --limit 5
```

可用 `--source` 值：`ray-js`（默认）、`panel-sdk`、`mothra-framework`、`lock-sdk`

### 常用文档地址（先翻这里，再考虑 search）

| 文档 | 地址 |
|---|---|
| Ray 组件总览 | https://developer.tuya.com/cn/miniapp/develop/ray/component |
| Ray API 总览 | https://developer.tuya.com/cn/miniapp/develop/ray/api/base/canIUse |
| panel-sdk（useProps / useActions） | https://developer.tuya.com/cn/miniapp/develop/panel-sdk |
| smart-ui 组件库 | https://developer.tuya.com/cn/miniapp/develop/smart-ui |

### 技术原理

- **guide/solution 页**：MDX 编译进 chunk JS → 提取 `children:"TEXT"` 节点重构 Markdown
- **API 参考页**：页面只有 `<SchemaDoc source="ray-js" name="publishDps">` → 脚本自动识别，
  改从 `https://images.tuyacn.com/smart/doc/schemas/{source}.json` 拉取结构化数据，
  输出参数表格 + 类型 + 返回值 + 示例
- **搜索**：下载 `_buildManifest.js`（含全部 4500+ 路由），本地路径匹配，首次下载后缓存 24 h

### 局限性

- guide 页代码块内关键字（`import`, `const` 等）会混入正文（MDX 编译产物）
- API schema 数据来自 CDN，某些新增 API 可能短暂缺失

### AI 使用规范

- 查 API 签名 / 参数前**先用 `--api` 或直接给 URL** 拿到文档，不要凭记忆猜
- 报错信息里有 API 名称时，直接 `--api <name>` 查参数说明
- 不知道确切 URL 时先 `--search` 找，再 fetch
