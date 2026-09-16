---
id: code-no-hardcoded-chinese
priority: HIGH
category: Code Quality > i18n
---

# 代码中禁止硬编码中文，文案必须走 i18n

## Rule
提交的代码中，除注释外不允许出现硬编码的中文或英文用户可见文案。所有面向用户的文案必须：
1. 提取到 `src/i18n/strings.ts`，同时写入 `en` 和 `zh` 两个语言
2. 代码中通过 `I18n.t("key")` 引用
3. 带变量的文案使用 `utils/i18n.ts` 中的 `i18nWithArgs(i18nKey, values)`，占位符格式为 `${name}`

## Bad (Ray 小程序)

```tsx
showToast({ title: "操作成功" });

<Text>加载失败，请重试</Text>

const message = count > 0
  ? `${count} 个项目已更新`
  : "暂无数据";

const durationText = `执行时间${days}天`;
```

硬编码中文，无法国际化，切换语言时文案不变。

## Good (Ray 小程序)

```ts
// src/i18n/strings.ts
export default {
  "en": {
    "toast_action_success": "Action completed",
    "error_load_retry": "Loading failed, please retry",
    "items_updated": "${count} items updated",
    "execution_days": "Execution time ${days} days",
    "empty_no_data": "No data"
  },
  "zh": {
    "toast_action_success": "操作成功",
    "error_load_retry": "加载失败，请重试",
    "items_updated": "${count} 个项目已更新",
    "execution_days": "执行时间${days}天",
    "empty_no_data": "暂无数据"
  }
}
```

```tsx
import { i18nWithArgs } from '@/utils/i18n';

showToast({ title: I18n.t("toast_action_success") });

<Text>{I18n.t("error_load_retry")}</Text>

const message = count > 0
  ? i18nWithArgs("items_updated", { count })
  : I18n.t("empty_no_data");

const durationText = i18nWithArgs("execution_days", { days });
```

通过 i18n 引用，支持多语言切换；`执行时间8天` 这类动态文案应把 `8` 作为参数传入。

## AI Workflow（生成代码时必须执行）

当 AI 生成或修改包含用户可见文案的代码时：

1. **识别文案**：扫描生成的代码，找出所有用户可见的中文或英文硬编码字符串
2. **生成 key**：用 `snake_case` 命名（如 `download_success`、`generate_failed_retry`）
3. **双语写入**：同时在 `src/i18n/strings.ts` 的 `en` 和 `zh` 中添加对应翻译
4. **代码替换**：将硬编码文案替换为 `I18n.t("key")`
5. **带参数的文案**：使用 `${param}` 占位符，并通过 `i18nWithArgs` 替换，如 `"${points} credits refunded"` / `"${points}积分已退还"`

### Key 命名规范

| 场景 | Key 格式 | 示例 |
|------|----------|------|
| Toast 提示 | `toast_<action>_<result>` | `toast_download_success` |
| 按钮文案 | `btn_<action>` | `btn_regenerate` |
| 状态文案 | `status_<state>` | `status_generating` |
| 错误提示 | `error_<context>` | `error_network_timeout` |
| 页面标题 | `page_<name>_title` | `page_image_title` |
| 通用文案 | `<module>_<description>` | `card_expired_hint` |

## Exceptions
- 代码注释中的中文：允许（不影响运行时）
- 开发阶段临时调试文案：允许但必须在提交前替换
- 非用户可见的日志/错误码：建议英文，但不强制阻断

## Why
硬编码中文导致应用无法国际化，在海外市场无法使用。即使当前只面向中文用户，后续国际化改造成本极高（需逐文件排查替换）。从编码阶段就使用 i18n 机制可以零成本支持多语言。
