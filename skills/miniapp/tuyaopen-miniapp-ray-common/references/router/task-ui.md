# UI / 页面路线卡

## 什么时候进入这里

- 用户要新建页面、设置页、弹窗、表单、列表、卡片、导航栏、空态或普通界面改造
- 用户重点在“界面长什么样”和“用什么组件搭出来”

## 推荐路径

1. 先在品类/业务 skill 中查找组件文档（业务组件优先）
2. 若业务组件不满足，再在 smart-ui skill 中查找组件文档
3. 若 smart-ui 仍不满足，再读 `references/ray/INDEX.md`，用 `Section = component` 的 Key 进入 `references/ray/component/<key>/`（或同名文档），在目录内定位目标组件说明
4. 涉及页面结构时，补读 `references/ray/framework/page.md`

## 常见组件入口

- 业务组件：优先在品类/业务 skill 中按业务域定位
- 通用 UI 组件：在 smart-ui skill 中按组件名定位
- 原生回退：在 `references/ray/INDEX.md` 查 component 的 Key，再进 `references/ray/component/<key>/` 按文件名定位

## 没命中时怎么办

- 如果 smart-ui skill 没有目标组件，再去 Ray 原生组件链路
- 如果 Ray 原生组件也没有，说明“未在文档中找到”，并退回基础标签实现
- 不要因为组件语义相似就猜 props 或事件

## 离开前检查

- 是否仍有小写 HTML 标签
- 是否组件 props 全来自对应 skill 文档
- 是否需要补读 `references/rules/i18n.md`
- 是否需要补读 `references/rules/smart-ui-version.md`
