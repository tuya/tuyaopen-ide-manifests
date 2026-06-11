# Lifecycle / Route / Framework 路线卡

## 什么时候进入这里

- 用户在问页面生命周期、路由、页面参数、样式机制、事件机制、混合开发、插件、渲染
- 用户重点不在“长什么样”，而在“框架怎么工作”

## 推荐路径

1. 先读 `references/ray/INDEX.md`，在 `Section = framework` 的行里确认 Key（如 `page`、`event`、`advanced`）
2. 打开 `references/ray/framework/<主题>.md`，或 Key 对应子目录下的文档（如 `framework/advanced/`）
3. 根据主题进入具体文档：
   - 页面：`page.md`
   - 组件：`component.md`
   - 样式：`css.md`
   - 事件：`event.md`
   - 跨端 API：`api.md`
   - 混合开发：`mixed-development.md`
   - 渲染：`render.md`
   - 插件：`plugins.md`
   - 实现原理：`implementation.md`

## 处理原则

- 先回答机制，再落到代码
- 如果问题同时涉及页面代码与框架规则，先在这里确认规则，再回 A 区或 B 区读组件文档
- 不要把 React、小程序、Ray 的概念直接混同

## 常见补充文档

- 多语言：`references/rules/i18n.md`
- 输出格式：`references/rules/output-contract.md`

## 离开前检查

- 生命周期名称是否真实存在
- 是否区分了路由接口和页面生命周期
- 是否把推断和文档确认分开写了
