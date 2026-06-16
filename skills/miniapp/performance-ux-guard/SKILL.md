---
name: miniapp-performance-ux-guard
description: >-
  Reviews and improves Tuya 小程序/miniapp/Ray quality in one package: build guardrails, launch/first-screen performance, release review gates, and design-to-code/component architecture. Use when implementing or modifying pages/components/forms/lists/dialogs/async flows; fixing bugs, UI, interaction, loading/error/empty states, or i18n copy; optimizing 启动性能、首屏、白屏、FMP、包体积、分包、预加载、骨架屏、数据预取、缓存、CDN、Smart UI 按需加载、Ray 通信、react-dom、内存缓存; doing review、上线前检查、准入、release gate、quality grade、召回、体验度量、埋点闭环、告警阈值; or working from MasterGo、设计稿、UI还原、组件拆分、Smart UI、Dialog、Overlay、ActionSheet、弹窗、抽屉、底部面板.
---

# Miniapp Performance UX Guard

## 概述 {#description}

本技能服务于涂鸦 Ray/miniapp 项目代码下限、项目性能、体验与发布质量治理，覆盖日常功能开发护栏、启动/首屏优化、上线前评审门禁、以及 MasterGo 设计稿还原与组件架构设计四类高频任务。它的价值不只是“多一份规则”，而是把 AI 锁回项目真实约束里：优先沿现有项目模式改代码，先补下限，再做性能、评审和设计落地，避免 AI 在上下文不足时凭空发明组件、状态流、接口能力或不适配小程序/Ray 的泛化方案。

## 快速上手 {#quick-start}

1. **接手 AI 写的代码**：可以直接说“别重构大架构，先按我项目现有模式补齐 loading、失败反馈、防重复提交和 i18n”。
2. **需求描述模糊**：可以直接说“先帮我收敛方向，哪些复用现有组件，哪些地方真的需要新写，不要先脑补一套实现”。
3. **设计稿落地**：可以直接说“按设计稿还原，但优先复用 Smart UI 和项目已有组件，不要新造一套组件体系”。
4. **首页变慢或体验差**：可以直接说“先告诉我最值得动的 3-5 个点，按收益排序，不要给一堆泛泛建议”。
5. **准备上线**：可以直接说“先把阻断发布的问题挑出来，再告诉我能不能发版”。
6. **上下文不完整**：可以直接说“如果证据不够，先列假设和缺口，不要编造接口、埋点或性能数据”。

## 适用场景 {#scene}

- **守住代码下限**：接手 AI 或新同学写的页面 / 组件 / 表单 / 列表 / 弹窗 / 异步链路时，优先补齐 loading / error / empty / disabled、防重复提交、i18n、埋点和验证证据，避免只修 happy path。
- **减少 AI 幻觉**：当需求只有一句话、只有截图、或者上下文缺失时，要求 AI 先对齐项目现有组件、请求封装、状态流和埋点口径，再动手实现；确认不了的地方显式写假设与缺口，不编造 API、组件能力或性能结论。
- **明确 AI 方向**：当你不希望 AI 一上来就大改架构、乱拆目录、乱造 hooks/store/工具层时，用本技能把它收回到“沿现有模式增量修改、优先复用、最小可验证落地”的轨道上。
- **启动与首屏优化**：排查白屏、首屏慢、主包超限、分包、预加载、数据预取、缓存、CDN、Smart UI 按需加载、Ray 通信、同步 API 阻塞、误引 `react-dom` 等问题时，优先给出最有收益、最适合 Tuya miniapp / Ray 约束的优化顺序，而不是泛化建议。
- **评审与发布门禁**：做代码 review、上线前检查、准入 / 召回、体验度量、告警阈值、埋点闭环、Release Gate、Quality Grade 时，先给阻断问题，再给结论与验证缺口，避免“看起来很全但没有放行判断”的空泛评审。
- **设计还原与组件架构**：根据 MasterGo / 设计稿还原页面，做 Smart UI 映射、组件拆分、弹窗 / 抽屉 / 底部面板方案，优先复用现有组件、样式变量和页面结构，不轻易新造一层 UI 体系。
- **组合任务**：既有设计还原又要落代码，再兼顾首屏或发布质量时，按设计、开发、性能、评审的顺序逐步收口，避免 AI 并行乱跳或一步到位大重构。

## 搭配使用 {#usage}

- **目录结构**：本 Skill 位于 `skills/miniapp-performance-ux-guard/`，目录内直接包含 4 个内部 workflow：`build-guard.md`、`launch-performance.md`、`review-gate.md`、`design-component.md`，以及共用的 `rules/`、`templates/`、`references/`、`anti-patterns.md`、`rubric.md`、`examples.md`。
- **安装与调用**：安装 `miniapp-performance-ux-guard` 一个 Skill 即可，不要求再安装拆分版独立 Skill；触发后先做场景路由，再进入对应 workflow，不要在总控层直接展开完整审查。
- **前置依赖**：目标最好是可读取源码的 Tuya miniapp / Ray 项目；若当前上下文缺少仓库代码、设计稿、构建脚本、性能数据或截图证据，只输出可验证假设与缺口，不伪造结论。
- **资料读取策略**：`anti-patterns.md` 永远优先；其余资料按任务读取。日常开发优先 `templates/` + 对应规则，启动优化优先 `references/wiki-optimizations.md`，设计还原优先 `references/smart-ui-mapping.md` / `references/component-architecture.md` / `references/app-css-variables.md`，发布评审优先 `rubric.md` / `templates/pre-release-checklist.md` / 对应 `rules/<rule-id>.md`。
- **验证方式**：优先运行项目已有的最小范围 lint / build / test；UI 自证默认走 `references/miniapp-devtools-feedback.md` 的 Manual 路径，当前环境存在 DevTools MCP 时再追加自动化截图、快照和日志采集。

## 注意事项 {#tip}

- 这个 Skill 最适合在能看到源码的 Tuya miniapp / Ray 项目里使用；如果你还能提供报错、截图、录屏、设计稿、日志或性能数据，建议会更准。
- 如果你只想做最小修改，可以直接说“不要大重构”“不要改目录结构”“优先复用现有组件 / 工具 / 样式变量”，Skill 会按这个边界收口。
- 如果你是接手 AI 生成的代码，也可以直接说明“先按项目现有模式收口”，Skill 会优先补代码下限，而不是先发明新架构、新 hooks 或新状态流。
- 如果上下文还不完整，Skill 会先列出假设、缺口和下一步最需要补的证据；这时继续补代码片段、交互路径或性能数据，比让 AI 硬猜更有效。
- 这个 Skill 默认按 Tuya 小程序 / Ray 的约束给建议；如果你的问题其实是后端、固件、IoT 平台配置或非小程序项目，请直接说明，避免方向跑偏。
- 示例和代码默认优先使用 Ray 小程序写法；如果你更希望看到原生小程序、TSX 或项目里已有的特定写法，可以直接点明。

## 路由原则

先判断用户意图，再读取最窄的内部 workflow。不要在总控里执行完整评审或读取全部规则。

## Routing Matrix

| Intent | Read | First action |
|---|---|---|
| 写功能、修 bug、补交互、改页面/组件 | `build-guard.md` | 输出 Build Guardrails |
| 启动慢、首屏慢、白屏、FMP、包体、分包、预加载、缓存 | `launch-performance.md` | 对照 Wiki 19 项基线 |
| review、上线前检查、准入、召回、体验度量、发布门禁 | `review-gate.md` | 先查 anti-patterns 和 Gate |
| MasterGo、设计稿还原、Smart UI、组件拆分、弹窗/抽屉/底部面板 | `design-component.md` | 先做组件映射/拆分方案 |
| 多个意图同时出现 | 对应多个 workflow | 按 Design → Build → Launch → Review 顺序执行 |

默认策略：

1. 普通开发优先 `build-guard.md`，不要直接进入 Deep Review。
2. 明确提到启动/首屏/包体时追加 `launch-performance.md`。
3. 明确提到 review/上线/准入时使用 `review-gate.md`。
4. 明确提到设计稿/组件架构时先使用 `design-component.md`。
5. 这些 workflow 都随 `miniapp-performance-ux-guard` 一起发布和安装，不依赖同级独立 Skill。

## Internal Workflows

- `build-guard.md`：日常开发、修 bug、交互反馈、异步状态、i18n、验证护栏
- `launch-performance.md`：启动、首屏、包体、预加载、缓存、骨架屏、Ray 通信优化
- `review-gate.md`：代码 review、上线前检查、Release Gate、Quality Grade、验证缺口
- `design-component.md`：设计稿还原、Smart UI 复用、组件拆分、弹窗/抽屉/底部面板

## Shared References

内部 workflow 按需读取，避免一次性全部加载：

- `anti-patterns.md`：最高优先级反模式清单
- `rules/`：62 条离散规则
- `templates/`：异步状态机、请求包装器、埋点、反馈归因、发布检查清单
- `references/miniapp-best-practices.md`：小程序开发最佳实践和体验评分基础检查
- `references/developer-quality-contract.md`：开发者高质量代码契约
- `references/wiki-optimizations.md`：Tuya Wiki 启动性能 19 项基线和公共资源缓存补充
- `references/smart-ui-mapping.md`：Smart UI 映射
- `references/component-architecture.md`：组件拆分策略
- `references/app-css-variables.md`：框架内置 `--app-*` 设计 Token 反查表（颜色/字号/间距/圆角，UI 还原时反查 rgba/字面量）
- `references/miniapp-devtools-feedback.md`：UI 自检反馈流程（默认 Manual：用户截图贴回；可选 Automated：环境有 DevTools MCP 时自动化）
- `rubric.md`：Release Gate + Quality Grade
- `examples.md`：评审与输出样例

## Shared Quality Rules

- 先匹配场景，再读取对应规则；避免全量读规则造成噪音。
- `anti-patterns.md` 优先级最高，命中即标记。
- Build 阶段关注“下限保障”，Review/Release 阶段关注“风险阻断”。
- 开发型任务默认遵循 `references/developer-quality-contract.md`。
- 建议必须可执行、可定位、可验证。
- 不为了追求“看起来快”破坏正确性。
- 不引入与需求无关的大型重构。
- Bad/Good 示例默认优先使用 Ray 小程序写法；确需展示原生模板语法时补充 Ray/TSX 等价示例。
- 安装者只需要安装本 Skill；不要要求用户额外安装 `miniapp-build-guard`、`miniapp-launch-performance`、`miniapp-review-gate` 或 `miniapp-design-component`。

## Output

只负责路由时输出：

```markdown
## Skill Routing
- Build guardrails: `build-guard.md`
- Launch performance: `launch-performance.md`
- Review gate: skipped
- Design/component: skipped
```

随后按选中的内部 workflow 执行。
