# Internal Component Library（内部组件库优先）

**实现新功能前，必须优先检查是否有内部组件库组件可用，避免重复造轮子。**

## Tuya Smart UI

组件库地址：https://developer.tuya.com/material/smartui?smartVersion=2.x&comId=help-getting-started

使用优先级：

1. **Smart UI 组件直接可用** → 直接使用，不自研
2. **Smart UI 组件需轻量微调** → 基于 Smart UI 扩展（slot/props/样式变量），不 fork 重写
3. **项目内已有业务组件可用** → 直接复用（先搜索 `src/components/` 目录），不重复造轮子
4. **项目内组件需轻量微调** → 扩展已有组件的 Props/Slot，保持向后兼容
5. **改动较大或影响旧业务逻辑** → 可以 fork / 新建组件，但需说明影响面、复用成本和迁移边界
6. **完全无匹配** → 自研，但需设计为可复用组件放入 `src/components/`

硬性约束：

- **禁止** 在页面文件内直接新写功能等价的临时弹窗/抽屉/底部面板来替代 `Dialog` / `Overlay` / `ActionSheet`
- **禁止** 因为"设计稿长得不一样"就绕过组件库；必须先尝试"组件库组件 + 外层样式包装"的方案
- 如果最终判断必须自研或 fork，输出中必须明确写出：`为什么现有组件不满足`、`为什么增量扩展性价比不高`、`准备复用还是新建公共组件`、`是否已获开发者确认`

## 常见映射

| UI 元素 | Smart UI 组件 | 使用场景 |
|---------|--------------|---------|
| 导航栏 | `NavBar` | 页面顶部导航 |
| 弹窗/对话框 | `Dialog` / `Overlay` | 确认操作、信息展示 |
| 轻提示 | `Toast` | 操作反馈 |
| 按钮 | `Button` | 主操作/次操作 |
| 加载 | `Loading` | 异步等待 |
| 下拉刷新 | `PullRefresh` | 列表刷新 |
| 标签页 | `Tab` | 内容切换 |
| 表单控件 | `Field` / `Switch` / `Picker` | 表单输入 |
| 图片预览 | `ImagePreview` | 大图查看 |
| 操作面板 | `ActionSheet` | 底部弹出选项 |

## 项目内组件复用

编码前必须先扫描当前仓库 `src/components/` 目录，识别已有的公共组件。常见做法：

1. 列出 `src/components/` 下的所有组件目录
2. 将本次需要的 UI 元素与已有组件做匹配
3. 匹配到的直接 import 使用，**禁止在页面内重新实现相同功能**
4. 如已有组件只是缺少轻量能力，通过扩展 Props/Slot 解决；如果会显著影响旧业务逻辑，可新建组件并说明原因

## 检查时机

- **Build 模式**：生成 UI 代码前，先搜索 `src/components/` 匹配已有组件，再匹配 Smart UI
- **Review 模式**：检查是否有"仓库中已有组件但新写了一份"的情况
- **输出标注**：在 Build Guardrails 中标注哪些复用了项目组件、哪些使用了 Smart UI、哪些是自研；若出现自研弹窗/底部面板，必须附原因与确认状态
