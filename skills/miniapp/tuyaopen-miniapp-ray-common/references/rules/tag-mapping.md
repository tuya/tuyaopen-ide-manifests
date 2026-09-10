# 标签映射规则

## 目标

在 Ray 页面和组件代码中，按组件优先级选择实现，不要回退到普通 HTML 标签习惯。

## 必须遵守

- 禁止使用小写 HTML 标签，如 `div`、`span`
- 必须使用 Ray 标签，如 `View`、`Text`、`ScrollView`
- 组件优先级：先品类/业务组件，再 smart-ui 组件，最后 Ray 原生组件

## 推荐路径

1. 先在品类/业务 skill 中定位目标组件
2. 若业务组件未命中，再在 smart-ui skill 中定位目标组件
3. 若 smart-ui 未命中，再读 `references/ray/INDEX.md`，按 `component` 的 Key 进入 `references/ray/component/<key>/`（或同名文档）查 Ray 原生组件说明

## 常见语义映射

- 容器 -> `View`
- 行内文本 -> `Text`
- 滚动区域 -> `ScrollView`
- 表单输入 -> 优先 `Field` 或 `Input`
- 弹窗容器 -> 优先 `Popup` / `Dialog`
- 进度展示 -> 优先 `Progress`

## 注意

- 语义映射只能帮助定位文档，不能替代文档确认
- 如果组件看起来“像”某个业务组件或 smart-ui 组件，也必须读到对应文档后再使用
