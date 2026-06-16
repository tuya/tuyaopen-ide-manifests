---
name: miniapp-smart-ui
description: 面向 Ray 小程序 smart-ui，基于 meta-first 工作流协助生成与修改页面与组件。在用户提出 UI 搭建、组件改造、表单与反馈交互、导航展示、图片转代码或 smart-ui 排障升级时使用；仅覆盖 smart-ui，实现前须查阅 _meta.json 与组件文档，禁止虚构 props、事件与能力。
---

## 概述 {#description}

本 skill 是 Ray 小程序 **smart-ui** 的专项开发入口，采用 **meta-first** 流程（先索引、再文档、最后输出），不使用任务分区。目标是在有据可查的前提下完成页面与组件的设计、改造与排障，避免对文档未载明的能力进行猜测。

## 适用场景 {#scene}

- 搭建或调整 smart-ui 页面、布局与组件组合。
- 表单、反馈类交互、导航与展示类 UI 的实现或改造。
- 图片转代码、参考稿落地为 smart-ui 结构。
- smart-ui 相关报错、样式或行为不符合预期时的定位与升级。

当前**仅**处理 smart-ui，不作为通用 Ray API 或设备能力开发总入口。若用户目标超出 smart-ui，应先说明超出当前范围，再给出最小必要的外部建议。

## 搭配使用 {#usage}
- ** requirement-creating-guide-skill **：需求生成指南 skill，配合使用可产出符合小程序面板规范的需求文档。
- ** ray-common-develop-skill **：Ray 小程序开发 skill，配合使用可在更广泛的 Ray 开发场景中提供文档导航与实现约束，提升开发效率和代码质量。

## 工作流程 {#workflow}

1. **先读索引**：读取 `references/smart-ui/_meta.json`，按 `englishName`、`chineseName`、`category` 初筛候选组件。
2. **再读文档**：读取 1～2 个候选组件对应的 `references/smart-ui/*.md`；信息不足时再增量补读 1～2 个相关文档。不允许一次性扫完整个 `references/smart-ui/` 目录，须按需增量读取。
3. **最后输出**：先给结论，再给依据与实现建议；文档未覆盖时须显式说明「未在文档中找到」，禁止静默猜测。

输出时需区分两类信息：**文档确认**（明确来自当前已读文档）与**经验推断**（文档未覆盖、基于上下文的保守假设）。涉及能力说明时，优先引用组件文档中的 props、events、示例与注意事项。

**默认约定**：UI 优先 smart-ui；无法满足时再考虑 Ray 原生组件。页面生成默认放在 `/pages`，组件默认放在 `/components`。若涉及文案，提醒接入 i18n，避免在业务代码中硬编码中文。

## 注意事项 {#tip}

- 禁止使用小写 HTML 标签（如 `div`、`span`）。
- 禁止混入 `wx.*`、`my.*` 等非 Ray 业务 API。
- 禁止虚构 smart-ui 的 props、事件或版本能力。
- 禁止在未通过 `_meta.json` 定位前一次性加载大量文档。
- 禁止在业务代码中硬编码中文文案。
