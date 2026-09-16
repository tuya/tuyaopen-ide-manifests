# Review Gate Workflow

## Quick Start

以代码审查姿态工作：先给问题，按严重级别排序，再给 Gate、Grade、验证缺口。不要把总结放在问题前。

## Required References

按需读取：

- `anti-patterns.md`
- `references/developer-quality-contract.md`
- `rubric.md`
- `templates/pre-release-checklist.md`
- `references/wiki-optimizations.md`
- `references/miniapp-best-practices.md`
- `references/miniapp-devtools-feedback.md`
- 命中问题对应的 `rules/<rule-id>.md`

## Release Gate

硬性门禁，任一不达标 = BLOCKED：

| Gate | Threshold |
|---|---|
| 主包体积 | <=2MB |
| Blocking 问题 | 0 |
| 关键按钮反馈 | 均有 loading/禁用 |
| 首屏阻塞请求 | <=1 |
| 启动同步 API | <=2 |
| 关键路径埋点 | 覆盖合理 |
| 敏感信息 | 无明文 |
| 硬编码中文 | 注释外无中文 |
| 验证证据 | 已提供或说明缺口 |

## Review Order

1. 确认评审范围：暂存区、PR、指定文件或当前改动。
2. 先查 `anti-patterns.md`，命中即标记。
3. 再按风险域检查：启动/包体、setData/渲染、交互反馈、列表滚动、网络缓存、可观测性、无障碍、布局适配、i18n、测试验证。
4. 检查是否满足 `developer-quality-contract.md` 的 Definition of Done。
5. Deep Review 必须输出 `Release Gate`、`Quality Grade`、`Wiki Baseline`、`MCP Evidence`。
6. MCP/浏览器证据可用时执行最小自检；不可用时标记 `Not Available`，不伪造证据。

## Output Template

```markdown
## Findings
1. [Blocking] `rule-id` 问题标题
   - Location: `path`
   - Why it matters: ...
   - Fix: ...

## Release Gate: PASS / BLOCKED
- 主包体积: ...
- Blocking 问题: ...
- **Gate Result: ...**

## Quality Grade: A/B/C/D
- Blocking: 0 / High: 1 / Medium: 3

## Wiki Baseline
- Launch Optimization Coverage: 15/19
- Feedback Loop Readiness: 准入=强，召回=中，度量=中

## Verification Gaps
- Not run: ...
- Residual risk: ...

## MCP Evidence
- Available / Not Available
```

## Boundaries

- Findings 优先于总结，按严重级别排序
- 不把建议写成泛泛而谈，必须能定位和验证
- 只评审本次相关变更；发现无关历史问题时注明是否阻断本次发布
