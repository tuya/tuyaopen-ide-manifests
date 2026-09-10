# UI 自检反馈流程

本流程用于在代码修改后做 UI 自证——把"输出代码 → 渲染执行 → 感知误差 → 修正代码"变成闭环。AI 不能只说"已按设计实现"，必须基于真实证据 review。

## 两种执行路径

| 路径 | 触发条件 | 执行者 | 适用场景 |
|---|---|---|---|
| **Manual（默认）** | 当前环境没检测到小程序 DevTools 类 MCP | AI 列待采集证据 → **用户**用 IDE / 模拟器截图 + 抓控制台后粘贴回 AI → AI review | 大多数开发者环境 |
| **Automated（可选）** | 当前环境配置了支持小程序 DevTools 的 MCP（提供 `take_snapshot` / `take_screenshot` / `get_console_logs` / `click` / `evaluate` 等通用能力） | AI 直接调用 MCP 工具自动化执行同一套流程 | 已自行配置 MCP 的高级用户 |

> AI 不假设具体 MCP 厂牌、版本或安装方式；本 skill **不引导用户安装 MCP**（具体配置方式因厂牌而异，超出 skill 职责）。检测到对应工具就走 Automated，没有就走 Manual。

## Manual 路径（默认）

### Step 1 — AI 输出"待采集证据"清单

AI 先告诉用户要看什么，再让用户去采集：

- **关键状态截图**：default / loading / error / empty / disabled / 弹窗 / 半屏 / 长列表滚动 等业务可能出现的状态
- **关键交互序列**：点击/滑动后的预期反馈（loading 出现、按钮 disabled、文本变化、错误提示弹出等）
- **控制台日志**：error / warn 级别的条目（可摘取关键报错文案）
- **业务可见行为**（必要时）：用户用自然语言描述实际看到的现象（按钮按下后无反应、loading 一直转、文本错位等），AI 据此判定是否需要补充更多证据

### Step 2 — 用户在自己环境采集

用户按清单操作：

1. 在 IDE 模拟器 / 真机预览中复现各状态
2. 系统截图工具截图（每个状态一张即可）
3. 控制台 error / warn 复制
4. 必要时用自然语言补一句实际感知（如"按钮点击后没任何反应"）

### Step 3 — AI 基于证据 review

拿到证据后，AI 按下方 [Output requirements](#output-requirements) 给出 `Evidence` / `Risk` / `Next actions`。

> 用户暂时不贴证据时，AI **不要伪造结论**；输出 `UI Evidence: Not Provided`，并列出仍需补充的证据清单。

## Automated 路径（可选）

当前环境有小程序 DevTools 类 MCP 时，AI 直接调用工具完成同一套流程。常见工具能力（命名可能因厂牌略异）：

- `take_screenshot`：视觉渲染结果，判断页面长什么样
- `take_snapshot`：DOM / 可访问结构，判断布局和关键元素是否存在
- `get_console_logs`：运行时日志（建议带 `level=warn`、`level=error`）
- `webview_evaluate` / `service_evaluate`：在视图层 / 逻辑层读取必要状态
- `click`：模拟点击 / 触发交互

### Invocation protocol

- 调用任意 MCP 工具前先读取对应 descriptor/schema，确认参数结构和必填字段
- 优先用最小参数集，失败后再逐步加可选参数
- 不要静默自动安装、自动启动或伪造验证结果；工具不可用就 fall back 到 Manual 路径

### Pre-check

1. 确认小程序预览实例已启动且页面可见
2. 先抓一次快照，定位可交互元素的 uid
3. 开始前清空日志读取缓冲（`get_console_logs`，不保留旧日志）

### Baseline capture

改动验证前至少采集：

1. 页面结构快照：`take_snapshot`
2. 首帧截图：`take_screenshot`
3. 控制台状态：`get_console_logs`（`level=warn`、`level=error`）

### Interaction verification loop

对每条关键交互执行一次闭环：

1. `take_snapshot` 定位目标按钮 uid
2. `click` 执行交互
3. 再次 `take_snapshot`，确认状态变化（如 loading、禁用、文本变化）
4. `take_screenshot` 保存交互后画面
5. `get_console_logs` 拉取本次交互新增日志

异步链路场景下，可用 `service_evaluate` / `webview_evaluate` 读取必要的逻辑层状态（如 `getApp()` / `getCurrentPages()` 等小程序全局 API 暴露的数据），验证：

- 页面状态是否进入预期分支
- 错误分支是否展示提示
- 重试入口是否可用

> 注意：小程序 Webview 渲染层通常不暴露标准 DOM API（`document.querySelector` 拿不到 Ray / 原生模板节点），不要假设可通过 `evaluate` 跑 DOM 查询。要看渲染结果用 `take_snapshot` / `take_screenshot`，要看状态用 service 层 `evaluate`。

## Output requirements

把自检结果并入最终结论，至少给出：

1. `Evidence`
   - 截图数量与关键页面说明
   - 控制台 error / warn 统计（含代表性信息）
   - 核心交互是否通过
2. `Risk`
   - 是否存在阻断问题（error、交互无反馈、状态不一致）
3. `Next actions`
   - 需要立即修复的项
   - 可后续优化项

## Failure handling

- 若用户无法采集证据（IDE 未启动、页面未加载、截图工具报错）→ 明确说明阻塞原因，标记 `UI Evidence: Blocked`
- 若 Automated 路径下 MCP 工具调用失败 → 先尝试 fall back 到 Manual 路径让用户手动补证据，不要直接放弃自检
- 若日志持续出现 `error` → 默认升级为 `High`，需解释影响范围
- 若仅有 `warn` 且不影响主链路 → 标记为 `Medium` 并建议跟踪
- AI **不得**静默跳过自检步骤，也**不得**在没有证据时伪造结论
