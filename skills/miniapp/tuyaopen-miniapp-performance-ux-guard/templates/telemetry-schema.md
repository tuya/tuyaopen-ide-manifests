# 功能驱动的埋点建议指南

Build 模式下涉及埋点时，AI 应**根据当前功能点**自主分析并给出合理的埋点建议，而非套用固定 schema。

## 埋点建议维度

针对每个功能点，从以下四个维度给出建议：

### 1. 埋点位置（Where）

分析当前功能的关键用户路径，识别需要埋点的位置：

- **页面级**：进入页面、离开页面、首屏渲染完成
- **操作级**：按钮点击、表单提交、滑动/切换等交互
- **流程级**：异步操作开始/成功/失败/重试、支付/确认等关键链路节点
- **异常级**：接口报错、超时、兜底逻辑触发、降级命中

### 2. 服务指标（What to Measure）

根据功能性质推荐需要关注的指标：

| 功能类型 | 推荐指标 |
|---------|---------|
| 页面加载 | 首屏耗时、数据请求耗时、渲染耗时、可交互时间 |
| 用户操作 | 操作成功率、操作耗时、操作频次、放弃率 |
| 网络请求 | 接口成功率、响应时间 P50/P95、超时率、重试次数 |
| 列表/滚动 | 加载更多次数、滚动深度、卡顿帧率 |
| 表单 | 填写完成率、校验失败次数、提交成功率 |
| 多媒体 | 加载耗时、播放/预览成功率、失败原因分布 |
| 弹窗/引导 | 曝光次数、点击率、关闭率、转化路径 |

### 3. 参数设计（What to Report）

每个埋点事件的参数应区分「基础参数」和「业务参数」。基础参数优先由埋点 API 或小程序 `reportExperienceEvent` 封装统一补齐，业务代码不要重复手填。

**基础参数**（由 API / 小程序封装补齐）：

- `page` / `pagePath` — 当前页面路径
- `miniProgramId` / `miniProgramVersion` — 小程序标识和版本
- `deviceModel` / `networkType` — 设备和网络上下文

**业务必填参数**（anti-patterns.md 铁律，缺失即标记）：

- `action` — 用户操作标识（如 `click_generate`、`submit_form`）
- `result` — 操作结果（success / fail / timeout）

**强烈推荐**（缺失时在 review 中标记为 Medium）：

- `duration` — 操作或加载耗时（ms）
- `errorCode` — 失败时的错误码
- `requestId` — 后端请求 ID，用于前后端日志串联
- `sessionId` — 会话 ID，用于关联同一用户的连续行为

**按需选用**（业务参数，根据功能自行设计）：

- 与当前功能直接相关的业务字段（如图片生成场景的风格 ID、分辨率；列表场景的列表长度、当前页码）
- 命名清晰、语义明确，便于后续数据分析

## 输出格式

AI 在给出埋点建议时，按以下结构输出：

```markdown
### 埋点建议 — [功能名称]

#### 埋点位置
| 位置 | 事件名 | 触发时机 |
|------|--------|---------|
| 页面进入 | `page_enter` | onLoad 触发 |
| 生成按钮点击 | `click_generate` | 用户点击生成按钮 |
| 生成结果返回 | `generate_result` | 接口返回成功/失败 |

#### 关键指标
- 生成成功率 = `generate_result(result=success)` / `click_generate`
- 生成耗时 P95 = `generate_result.duration` 的 P95 值
- 首屏加载耗时 = `page_ready.duration`

#### 事件参数
**click_generate**:
- `action`, `styleId`, `resolution`

**generate_result**:
- `action`, `result`, `duration`, `errorCode`, `requestId`
```

## 关联规则

- `obs-key-metrics`
- `obs-feedback-schema`
- `obs-trace-correlation`
