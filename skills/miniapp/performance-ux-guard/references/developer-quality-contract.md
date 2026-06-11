# Developer Quality Contract

用于让 AI 直接帮助开发者写出高质量小程序代码。所有开发型任务默认遵循本契约，review/上线任务用它校验实现质量。

## Before Coding

1. 先读相邻代码，确认项目现有模式：状态管理、请求封装、组件库、i18n、埋点、样式组织。
2. 明确变更类型：新功能、bugfix、重构、UI 还原、性能优化、上线检查。
3. 给出本次适用的 5-8 条 Build Guardrails，不要照搬全量规则。
4. 优先复用项目已有工具和组件；自研前说明为什么已有能力不满足。

## During Coding

- 状态：异步链路至少有 loading/error/empty/success；副作用操作有防重提交。
- 请求：统一超时、错误处理、重试/恢复策略；无依赖请求并发执行。
- 渲染：避免整对象 setData、大列表一次性渲染、渲染路径重计算。
- 文案：用户可见文案走 i18n；错误提示可理解、可恢复。
- 组件：Props 类型明确；避免 `any`、重复造轮子和页面内堆叠复杂 UI。
- 生命周期：定时器、监听器、轮询、订阅必须在卸载时清理。
- 可观测性：关键异步流程有 result、duration、errorCode、requestId/sessionId 等归因字段。

## After Coding

1. 运行或说明未运行的验证：lint、typecheck、unit test、构建、页面自测。MCP/DevTools 仅在工具已安装且页面实例可用时执行，并标明 `Available` / `Not Available`。
2. 输出 Self-Check：每条 Guardrail 必须 PASS 或说明已修复。
3. 标出残余风险：依赖后端、容器能力、弱网、低端机、真实包体数据等。
4. 如果改动触达启动路径、公共组件、请求层、埋点或 i18n，升级到对应专项 skill 复核。

## Definition of Done

- 功能正确，不破坏已有行为。
- 无新增硬编码中文、敏感日志、生产 `console.log`。
- 关键交互有反馈，失败有可恢复路径。
- 性能敏感路径没有明显反模式。
- 代码局部、可读、可维护；没有无关重构。
- 验证结果清楚；无法验证的部分明确说明。
