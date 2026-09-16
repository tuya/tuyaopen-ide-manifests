---
id: obs-release-gate
priority: HIGH
category: Observability > Release Gate
---

# 发布前体验准入门禁

## Rule
发布前必须通过体验准入门禁：主包 ≤2MB、启动阶段同步 API ≤2 次、首屏阻塞请求 ≤1 个、关键交互反馈 ≤200ms、必填埋点字段完整、无 Blocking 级问题。

## Bad
```js
// 代码通过功能测试即发布，无体验维度的准入检查
if (functionalTestsPass) {
  release();
}
```
功能正确但体验与埋点未纳入发布门槛。

## Good
```js
// 发布流程中加入自动化/AI 体验门禁：包体、启动路径、交互反馈、埋点完整度
assertExperienceGate({
  mainPackageMB: '<=2',
  startupSyncApiCount: '<=2',
  firstScreenBlockingRequests: '<=1',
  criticalInteractionMs: '<=200',
  telemetryRequiredFields: 'complete',
  blockingIssues: 0,
});
release();
```
不达标则阻断发布并输出修复建议。

## Why
没有门禁的发布流程意味着体验问题只能靠线上用户投诉发现。准入门禁把问题拦截在发布前，成本最低。
