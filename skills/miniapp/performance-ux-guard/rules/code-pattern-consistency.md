---
id: code-pattern-consistency
priority: HIGH
category: Code Quality
---

# 遵循项目既有模式

## Rule
新增或修改代码前必须先参考相邻实现，复用项目已有的状态管理、请求封装、组件、i18n、埋点和样式组织方式。

## Bad
```ts
// 页面内新建一套 request、toast、loading 和埋点逻辑
```
绕过项目已有工具会制造重复逻辑，后续维护和排查成本高。

## Good
```ts
// 复用当前模块已有 service、hooks、i18n key 和 toast/error 处理工具
```
沿用既有模式，让新代码和项目其它部分保持一致。

## Why
高质量代码首先要融入当前项目。即使单段实现正确，如果风格、封装和错误处理与项目不一致，也会增加回归风险。
