---
id: code-validation-evidence
priority: HIGH
category: Code Quality
---

# 提供验证证据或验证缺口

## Rule
完成代码修改后必须说明已执行的验证，或明确哪些验证未执行以及原因。

## Bad
```md
已修改完成。
```
没有 lint、类型检查、测试、页面自测或风险说明，开发者无法判断是否可合并。

## Good
```md
验证：
- ReadLints: pass
- 页面自测: 已覆盖 loading/error/success
- 未运行构建: 当前环境缺少依赖，风险为包体变化未确认
```
验证结果和缺口清楚，方便开发者继续接手。

## Why
高质量代码不只看实现，还要能被验证。明确证据和缺口可以降低合并风险，避免“看起来改好了”的不确定状态。
