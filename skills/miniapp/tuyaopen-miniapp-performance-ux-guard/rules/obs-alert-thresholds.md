---
id: obs-alert-thresholds
priority: MEDIUM-HIGH
category: Observability > Alerting
---

# 体验关键指标阈值与报警

## Rule
体验关键指标必须设置异常阈值和报警规则，达到阈值时自动触发召回流程。

## Bad
```js
// 埋点数据上报后只存不看，无阈值、无报警、无召回
sendMetrics(payload);
// （无后续监控动作）
```
直到用户大量投诉才发现问题。

## Good
```js
// 定义阈值规则：超阈即报警并触发归因/召回流程
defineAlerts([
  { metric: 'first_screen_p95_ms', threshold: 3000, action: 'page' },
  { metric: 'critical_op_failure_rate', threshold: 0.05, action: 'notify' },
  { metric: 'page_error_rate', threshold: 0.01, action: 'report' },
]);
```
触发后自动通知相关负责人并生成归因报告。

## Why
主动监控比被动投诉效率高几个数量级。没有阈值和报警的埋点体系不算完整的召回能力。
