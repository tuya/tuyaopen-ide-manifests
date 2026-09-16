# 组件封装 / 改造路线卡

## 什么时候进入这里

- 用户要封装复用组件、拆分页面块、改组件接口、规范组件结构
- 用户给的是已有 TSX 组件代码，希望抽象或重构

## 推荐路径

1. 先读 `references/ray/framework/component.md`
2. 如果组件承担页面容器职责，补读 `references/ray/framework/page.md`
3. 如果组件依赖业务组件，先到对应品类/业务 skill 查文档
4. 若业务组件不满足，再到 smart-ui skill 查对应组件文档
5. 若仍不满足，再读 `references/ray/INDEX.md` 中 `Section = component` 的 Key，进入 `references/ray/component/<key>/`（或同名 `*.md`）查原生组件能力

## 处理原则

- 先判断它是“业务组件”还是“通用组件”
- 先保留已有职责边界，再决定是否拆子组件
- 不要在未查文档时扩展业务组件或 smart-ui 组件的 props 设计

## 常见补充文档，只有判断需要的时候才读取

- 样式组织：`references/ray/framework/css.md`
- 事件处理：`references/ray/framework/event.md`
- 多语言：`references/rules/i18n.md`

## 离开前检查

- 导入是否重复
- 组件边界是否清晰
- 文案是否都经由 `Strings.getLang`
- 是否混入了文档之外的 props / 事件
