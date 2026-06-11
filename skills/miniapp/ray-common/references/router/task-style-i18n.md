# i18n / 样式 / 版本检查路线卡

## 什么时候进入这里

- 用户重点在多语言接入、样式文件组织、Less、CSS Modules、文案规范
- 用户使用了 smart-ui，需要确认版本能力或兼容性

## 推荐路径

1. 先读 `references/rules/i18n.md`
2. 样式相关补读 `references/ray/framework/css.md`
3. 使用 smart-ui 时，版本相关补读 `references/rules/smart-ui-version.md`
4. 如果最终目标仍是页面或组件实现，再回 A 区或 B 区完成代码生成

## 处理原则

- i18n 规则优先级高于组件实现细节
- 样式问题先确认 Ray 的样式机制，再落具体写法
- smart-ui 版本检查基于项目依赖和 smart-ui skill 文档，不依赖本 skill 的本地 smart-ui 文档

## 离开前检查

- 文案是否全部使用 `Strings.getLang`
- 是否仍有硬编码中文
- 是否说明了 smart-ui 版本检查结果
