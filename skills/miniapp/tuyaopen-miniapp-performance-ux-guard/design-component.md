# Design Component Workflow

## Quick Start

先做结构分析和组件方案，再编码。目标不是像素堆叠，而是可复用、可维护、交互完整的 UI。

## Workflow

### Step 1 — Design Input

- 用户提供 MasterGo 链接时，先获取 DSL，再分析结构。
- DSL 获取失败时，改为人工分析截图/描述，不阻塞。
- 未提供设计稿时，基于现有项目组件和页面结构实现。
- 编码前确认现有组件、样式变量、i18n、图片资源和交互状态。

### Step 2 — Component Mapping

优先读取：

- `references/smart-ui-mapping.md`
- `references/component-architecture.md`
- `references/developer-quality-contract.md`
- `references/miniapp-best-practices.md`
- `references/miniapp-devtools-feedback.md`
- `anti-patterns.md`

组件选择顺序：

1. 项目已有公共组件
2. `@ray-js/smart-ui` 或项目约定组件库
3. 包装组件库组件
4. 自研组件（仅在 API 不满足需求时，并说明原因）

弹窗、抽屉、底部面板、选择器等通用容器更严格：先复用或包装组件库，自研前需要开发者确认。

### Step 3 — Component Split

命中任一条件先输出拆分方案，等待确认后编码：

- 2+ 页面共享同类 UI
- 3+ 功能分区或明显复杂交互
- 页面文件会承担数据、状态、渲染、弹窗等多重职责
- 后续会复用、扩展或做 A/B 配置

拆分时保持 Props 类型清晰，不用 `any` 兜底。扩展已有组件前先评估性价比：简单新增参数、slot、样式变量且能保持向下兼容时，优先增量扩展；如果改动会显著增加老组件复杂度、影响既有业务逻辑或引入兼容风险，可以 fork / 新建组件，但需说明原因和迁移边界。

### Step 4 — Implementation Guardrails

UI 实现仍需满足基础体验：

- 关键操作有反馈和防重提交
- 空状态、错误态、加载态完整
- 触摸目标 >=44pt / 88rpx
- 底部操作栏适配 safe area
- 弹窗/半屏阻止滚动穿透
- 用户可见文案走 i18n
- 图片资源有 alt/aria-label 或明确装饰属性
- 拿到设计稿的颜色 / 字号 / 间距 / 圆角值，**先去 `references/app-css-variables.md` 反查框架内置的 `--app-*` 变量**，匹配到就用 `var(--app-XX)`，**不要直接写 `rgba()` / `#xxx` / 像素字面量**（否则 dark mode 不会跟随）。规则见 `rules/design-theme-css-vars.md`。

### Step 5 — UI Self-Proof

编码完成后增加自证步骤，不能只说“已按设计实现”：

1. 产出覆盖设计稿关键状态的证据：默认态、loading、error、empty、disabled、弹窗/半屏、长列表或滚动区域。
2. 默认走 Manual 路径：AI 列出"待采集证据"清单，由用户在 IDE 模拟器 / 真机预览中截图 + 抓控制台日志后贴回，AI 再据此 review。流程见 `references/miniapp-devtools-feedback.md`。
3. 当前环境若已配置支持小程序 DevTools 的 MCP（提供 `take_snapshot` / `take_screenshot` / `get_console_logs` / `click` / `evaluate` 等通用能力），AI 可自动化执行同一套流程；本 skill 不假设具体 MCP 厂牌、不引导用户安装。
4. 用户暂时无法提供证据时，**不得伪造结论**；输出 `UI Evidence: Not Provided` 并列出仍需补充的证据清单。

## Output

```markdown
## Component Plan
- Reuse: `Dialog`, `Button`
- New components: `TemplateCard`, `PreviewFooter`
- Reason: ...

## Build Guardrails
- i18n: required
- a11y: touch target + aria label
- interaction: loading/error/empty

## Verification
- Visual states checked: loading/error/empty/success
- MCP Evidence: Available / Not Available
- Screenshots/logs/interaction self-check: ...
```

## Boundaries

- 不因设计稿视觉差异直接放弃组件库
- 不为拆分而拆分，粒度以复用和职责清晰为准
- UI 还原不应牺牲交互反馈、无障碍和启动性能
