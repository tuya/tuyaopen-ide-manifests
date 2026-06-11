# Build Guard Workflow

## Quick Start

目标：让开发者在普通开发中直接得到可合并、可维护、可验证的小程序代码。默认先读相邻实现，再输出本次 Build Guardrails，最后用 Self-Check 收口。

## Workflow

### Step 1 — Discover Local Patterns

编码前先确认：

- 页面/组件的状态管理、请求封装、错误处理、i18n、埋点写法
- 是否已有可复用组件、hooks、service、utils
- 变更是否触达启动、公共组件、请求层、埋点或 i18n；触达则追加对应专项流程

### Step 2 — Enforce Build Gate

日常开发的最低门禁。命中任一 Blocking 必须先修复，再继续交付：

| Gate | Blocking condition |
|---|---|
| i18n | 注释外新增用户可见硬编码中文 |
| Async state | 异步数据流没有 loading/error/empty/success 中的必要状态 |
| Duplicate submit | 副作用操作没有 submitting guard 或没有 `finally` 释放 |
| Button feedback | 关键按钮触发异步操作但没有 loading/disabled 反馈 |
| Error recovery | 请求失败只记录日志，没有错误态、toast、重试或返回路径 |
| setData granularity | 小程序状态更新整对象替换，未使用路径更新 |
| High-frequency update | scroll/input/touchmove 中直接 setData 且未节流/合并 |
| Lifecycle cleanup | 定时器、监听器、订阅在页面卸载时未清理 |
| Validation | 未运行可用验证，也未说明不能运行的原因 |

### Step 3 — Output Build Guardrails

输出 5-8 条本次适用护栏，不照搬全量规则：

1. 异步操作使用 `templates/async-state-machine.md` 模板（loading/error/empty/success）
2. 网络请求使用 `templates/request-wrapper.md` 模板（timeout + retry + error handling）
3. 副作用操作必须防重复提交（submitting flag + finally 释放）
4. setData 使用路径更新，禁止整对象替换
5. 页面 `onUnload` 清理所有定时器和监听器
6. 用户可见文案提取到项目 i18n，代码中禁止硬编码中文
7. 关键按钮有 loading/disabled/错误提示
8. 列表、滚动、动画路径避免高频 setData
9. 优先运行项目已有校验脚本；本仓库可使用 `./scripts/pre-commit-check.sh src`。该脚本是本地静态检查，不是 MCP。MCP/DevTools 仅用于页面快照、截图、日志和交互自测，有可用实例时再执行。

### Step 4 — Read Only Needed References

按需读取共享资料：

- `references/developer-quality-contract.md`
- `references/miniapp-best-practices.md`
- `templates/async-state-machine.md`
- `templates/request-wrapper.md`
- `anti-patterns.md`
- 相关规则：`rules/perf-*.md`, `rules/ix-*.md`, `rules/list-*.md`, `rules/content-*.md`, `rules/code-*.md`

不要一次性读取全部规则。先根据任务类型匹配，再读取对应规则。

### Step 5 — Implement

- 优先复用项目已有组件、工具和请求封装
- 只改与任务相关的文件，不做无关重构
- 涉及用户可见文案时同步 i18n
- 涉及异步流程时保留成功、失败、重试或恢复路径
- Props/参数类型明确，避免 `any` 和魔法值
- 不新增生产 `console.log`、敏感日志、硬编码中文

### Step 6 — Verify and Self-Check

编码后运行或说明未运行的验证。逐条对照 Build Guardrails 输出 PASS/FAIL；有 FAIL 先修复。

```markdown
## Build Guardrails
- [x] 异步四态
- [x] 防重提交
- [x] 验证：lint

## Self-Check
| Guardrail | Status | Evidence |
|-----------|--------|----------|
| 防重提交 | PASS | `submitTask` 有 submitting guard |
| 验证 | PASS | `ReadLints` 无错误 |
```

## Build Gate Result
- i18n: PASS / BLOCKED
- async state: PASS / BLOCKED
- duplicate submit: PASS / BLOCKED
- button feedback: PASS / BLOCKED
- error recovery: PASS / BLOCKED
- setData granularity: PASS / BLOCKED
- high-frequency update: PASS / BLOCKED
- lifecycle cleanup: PASS / BLOCKED
- validation: PASS / BLOCKED

## Script Coverage

有项目脚本时优先运行范围最窄的可用校验。本仓库的 `./scripts/pre-commit-check.sh src` 覆盖可机械检查的下限：

- BLOCK: 注释外硬编码中文、敏感信息 console 输出
- WARN: 生产 console、空 catch、疑似整对象 setData、同步 storage/system API、高频 handler 附近 setData

脚本没有覆盖的门禁必须通过代码审查和 Self-Check 给出证据。

## MCP / DevTools Coverage

MCP 不是默认必跑项，也不是 `pre-commit-check.sh` 的一部分。只有当前环境安装并启动了对应小程序 DevTools MCP（如 `user-miniapp-devtools`），且页面可预览时，才执行快照、截图、日志和关键交互验证。不可用时输出 `MCP Evidence: Not Available`，并说明原因。

## Escalate When

- 启动、首屏、包体、缓存：追加 `launch-performance.md`
- 设计稿、组件拆分、Smart UI：追加 `design-component.md`
- 上线前检查、review、准入：使用 `review-gate.md`
