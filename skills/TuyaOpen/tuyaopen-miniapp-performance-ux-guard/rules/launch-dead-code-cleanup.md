---
id: launch-dead-code-cleanup
priority: MEDIUM
category: Launch > Package
---

# Dead Code Cleanup

## Rule
定期清理无用代码、无用资源和废弃依赖，避免包体积膨胀。

## Bad
```text
历史迭代遗留 3 个未使用页面、5 个废弃组件，仍被打包
```
死代码持续进包，体积与解析成本只增不减。

## Good
```text
使用构建工具 tree-shaking + 定期执行依赖审计（如 depcheck），CI 流程中加入包体变化告警
```
有工具链与 CI 约束，避免无用代码持续进包。

## Why
无用代码随迭代累积，每次构建都增加下载和解析成本。定期清理是控制包体预算的基本纪律。
