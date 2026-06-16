---
name: miniapp/ray-common
description: 面向 Ray 小程序开发提供以索引为先的文档导航与实现约束，在用户进行页面或 UI 搭建、组件封装与改造、Ray API 与设备能力集成、生命周期与路由、图片转代码、多语言与样式、或排障与升级时使用；实现前须依据 references/ray/INDEX.md 与路由文档定位能力，禁止虚构 API 与生命周期钩子。
---

# RayCommonDevelopSkill

## 概述 {#description}

本技能是 Ray 小程序开发的「地图」：主文件只负责分区、导航与强约束，细节一律下沉到 `references/`。工作流为先选区、再读 `references/ray/INDEX.md`（Section | Key | Title）与对应 `references/router/task-*.md`，每次仅打开 1 个入口索引与 1～2 个目标文档，不足再增量追加；禁止跳过索引猜测 API、生命周期或组件属性。输出须区分 **`文档确认`**（来自当前已读文档）与 **`经验推断`**（文档未覆盖时的保守假设）。同步脚本 `scripts/index.js` 不再生成 `_meta.json`，导航以 `INDEX.md` 与目录内文件为准。

## 适用场景 {#scene}

- **A 区（页面 / UI）**：新建页面、弹窗、表单、列表、设置页、布局或界面改造。先读 `references/router/task-ui.md`；常查 `references/ray/framework/page.md`、`references/ray/component/**`、smart-ui skill。
- **B 区（组件封装 / 改造）**：抽组件、改组件、复用与规范结构。先读 `references/router/task-component.md`；常查 `references/ray/framework/component.md`、smart-ui skill、`references/ray/component/**`。
- **C 区（Ray API / 设备能力）**：调用 Ray API、连接通信、上传下载、监听事件。先读 `references/router/task-api.md`；经 `references/ray/INDEX.md` 定位到 `references/ray/api/<key>/` 下对应 `*.md` / `*.mdx`。
- **D 区（生命周期 / 路由 / Framework）**：页面生命周期、路由、事件、样式、混合开发、插件、渲染机制。先读 `references/router/task-framework.md`；常查 `references/ray/framework/*.md`。
- **E 区（图片转代码）**：截图、草图、设计稿还原为 Ray 页面或组件。先读 `references/router/task-image-to-code.md`；常查 smart-ui skill、`references/ray/component/**`、`references/rules/tag-mapping.md`。
- **F 区（i18n / 样式 / 版本）**：多语言、CSS Modules、Less、smart-ui 版本对齐。先读 `references/router/task-style-i18n.md`；常查 `references/rules/i18n.md`、`references/ray/framework/css.md`。
- **G 区（排障 / 升级 / 兼容）**：报错、版本兼容、升级迁移、文档冲突。先读 `references/router/task-debug.md`；常查 `references/ray/guide/**`、`references/rules/anti-hallucination.md`。

**选区**：多区并存时只选一个**主区**（按最终产物判断，不按关键词数量）；其余为次区，主区完成后再按需补读。示例：设置页带开关与输入框 → A；表单抽成组件 → B；P2P 下载 → C；`onLoad` / 路由参数 → D；按图还原 → E；全文案 i18n → F；升级后不兼容 → G。

## 搭配使用 {#cusage}
- ** smart-ui-skill **：Smart UI 组件库 skill，配合使用可快速搭建符合设计规范的页面和组件，提升开发效率和界面一致性。


## 工作流程 {#workflow}

1. 读主区对应的 `references/router/task-*.md`。
2. 按路由指引打开 `references/ray/INDEX.md`，用 Section（如 `api`、`component`、`framework`、`guide`）与 Key 拼出路径，再读具体 `*.md` / `*.mdx`。
3. 命中后最多再读 1～2 个文档；仍不足则沿同区增量扩展，**禁止**跨区乱读或一次性扫完整个 `references/`。

**须配合阅读的规则文件**：`references/rules/tag-mapping.md`（标签映射、禁止小写 HTML 标签）、`references/rules/i18n.md`（多语言与 `Strings.getLang`）、`references/rules/anti-hallucination.md`（防幻觉与未命中处理）、`references/rules/output-contract.md`（输出格式与引用说明）。

**默认协议**：UI 优先 smart-ui，无法满足再退回 Ray 原生组件；页面默认 `/pages`，组件默认 `/components`；涉及文案时补读 `references/rules/i18n.md`；文档未命中须明确说明「未在文档中找到」，不得静默猜测。

## 注意事项 {#tip}

- 禁止使用小写 HTML 标签（如 `div`、`span`）。
- 禁止混入 `wx.*`、`my.*` 等非 Ray 业务 API。
- 禁止虚构 Ray 生命周期、Ray API、smart-ui 的 props 或事件。
- 禁止在未通过索引定位前批量加载大量 `references` 文档。
- 禁止在业务代码中硬编码中文文案。
