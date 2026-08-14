---
id: obs-experience-score-check
priority: MEDIUM
category: Observability > Release
---

# 周期性使用体验评分工具体检

## Rule
上线前和重点版本回归时应使用小程序体验评分或等效工具做周期体检，并将低分项回流到优化清单。

## Bad
```md
上线前只人工点击主流程，没有记录启动、渲染、包体、资源和错误项评分。
```
缺少统一评分基线，问题只能靠主观反馈发现。

## Good
```md
- 体验评分：92/100
- 扣分项：主包资源偏大、首屏同步 API 3 次
- 回流规则：命中 `launch-resource-cdn`、`launch-sync-api`
```
把工具评分结果映射到 skill 规则，形成准入和召回闭环。

## Why
体验评分工具能用统一口径发现启动、资源和渲染风险。周期体检可避免优化只停留在一次性人工检查。
