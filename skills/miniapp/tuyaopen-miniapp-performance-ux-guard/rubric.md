# Miniapp UX/Performance Rubric

双轨评审体系：**Release Gate**（硬性 Pass/Blocked）+ **Quality Grade**（软性 A-D 参考）。

## Track 1 — Release Gate（硬性，二元判定）

Deep Review 必须输出。任一不达标 = BLOCKED。

| 门禁项 | 阈值 | 规则 |
|--------|------|------|
| 主包体积 | ≤2MB | `launch-package-budget` |
| Blocking 级问题 | 0 个 | 全规则 |
| 关键操作按钮反馈 | 均有 loading/禁用 | `ix-button-feedback` |
| 首屏阻塞请求 | ≤1 个 | `perf-serial-requests` |
| 启动同步 API | ≤2 次 | `launch-sync-api` |
| 关键路径埋点覆盖 | 合理且完整 | `obs-feedback-schema` |
| 硬编码中文 | 注释外无中文 | `code-no-hardcoded-chinese` |
| 验证证据 | 已提供或说明缺口 | `code-validation-evidence` |

## Track 2 — Quality Grade（软性，基于问题计数）

基于发现问题的严重级别计数，给出 A-D 等级：

| Grade | 条件 | 建议 |
|-------|------|------|
| A | 0 Blocking + 0 High + Medium ≤3 | 可上线，体验风险低 |
| B | 0 Blocking + High ≤2 | 可合并，建议排期优化 |
| C | 0 Blocking + High ≤5 | 存在明显体验风险，建议修复后再合并 |
| D | 存在 Blocking，或 High >5，或 Release Gate BLOCKED | 不建议合并，需先处理高风险问题 |

### Severity 定义

- `Blocking`：导致明显卡顿、交互中断、功能不可用，或触犯 Release Gate 硬性条件
- `High`：体验明显退化，需在合并前处理
- `Medium`：建议优化，可跟踪排期

## MCP 证据

MCP 自检证据（截图、日志、交互验证）为 **optional**，标记为 `Evidence Available` 或 `Evidence Not Available`，**不影响 Grade 或 Gate 判定**。

建议附以下证据（如可用）：

- `take_snapshot`：关键交互前后结构变化
- `take_screenshot`：关键状态截图
- `get_console_logs`：warn/error 摘要

## 强烈建议阈值（不达标扣分但不阻断）

| 指标 | 阈值 | 不达标影响 |
|------|------|-----------|
| 首屏 P95 | ≤3s | 标记为 High |
| 交互反馈延迟 | ≤200ms | 标记为 High |
| 长列表虚拟化 | >50 项 | 标记为 Medium |
| 四态覆盖 | 完整 | 标记为 Medium |
| 定时器清理 | 完整 | 标记为 Medium |
| 召回阈值配置 | 已配置 | 标记为 Medium |
| Ray Smart UI 按需加载 | 已启用 | 标记为 High |
| 首屏通信数据量 | 仅传可见字段/首批数据 | 标记为 High |
| 体验评分体检 | 已记录并回流规则 | 标记为 Medium |
| react-dom | 未进入 Ray 小程序包 | 标记为 High |
| 公共依赖复用缓存 | 已评估基础库/CDN/容器缓存 | 标记为 Medium |
| 项目模式一致性 | 复用已有封装 | 标记为 High |

## Wiki baseline checkpoints (must mention in review)

每次评审需额外给出两个结论：

1. `Launch Optimization Coverage`
   - 重点核查：分包、全局注入控制、Smart UI 按需加载、资源 CDN、通信数据量、基础库内置能力、减少同步 API、避免启动重计算、首屏渐进渲染、数据预取、缓存、骨架屏、体验评分、去 react-dom、子 UI 配置前置拉取、预加载、包体预算、无用代码清理、内存缓存；另补充公共依赖复用缓存评估。
2. `Feedback Loop Readiness`
   - 重点核查：是否形成准入阶段门禁、召回阶段复盘（含报警阈值）、体验指标闭环（含合理埋点 + 小程序基础参数封装 + 链路追踪）。

## Required output template

```markdown
## Release Gate: PASS / BLOCKED
- 主包体积: 1.8MB PASS
- Blocking 问题: 0 PASS
- 按钮反馈: 完整 PASS
- 启动同步 API: 2 次 PASS
- 关键路径埋点: 覆盖合理 PASS
- 硬编码中文: 无 PASS
- **Gate Result: PASS**

## Quality Grade: B
- Blocking: 0 / High: 1 / Medium: 4

## Findings
1. [High] `obs-feedback-schema` 生成流程缺少失败场景埋点
2. [Medium] `ix-button-feedback` 创建链路缺少明确 loading 态
3. [Medium] `perf-lifecycle-cleanup` 轮询定时器未在 onUnload 清理

## MCP Evidence: Available / Not Available

## Wiki Baseline
- Launch Optimization Coverage: 15/19
- Feedback Loop Readiness: 准入=强，召回=中，度量=中
```
