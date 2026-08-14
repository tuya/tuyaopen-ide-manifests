# 无障碍访问（Accessibility）

[AI-generated summary: 本文档介绍了小程序中无障碍访问的实现方式，通过ARIA属性和语义角色提供读屏模式支持，帮助视障人士更好地使用应用。文档详细列举了可用的无障碍属性及其用法，并展示了组件库内置的无障碍支持。覆盖内容：role、aria-label、aria-labelledby、aria-describedby、aria-disabled、aria-hidden、aria-checked、aria-selected、aria-expanded、aria-haspopup、aria-live、aria-atomic、aria-relevant、aria-required、aria-flowto、aria-valuetext、aria-valuemin、aria-valuemax、aria-valuenow、tabindex、Button、Input、Textarea、Checkbox、Radio、Switch、Slider、Picker、Navigator]

## 概述

为了更好地满足视障人士对于小程序的访问需求，小程序支持配置无障碍访问属性。

无障碍特性在读屏模式下可以访问，iOS可通过设置->通用->辅助功能->旁白打开，Android可通过设置->无障碍->TalkBack打开。

以 View 组件为例，开发者可以增加`role`和`aria-label`属性。 其中`role`表示组件的角色，当设置为'img'时，读屏模式下聚焦后系统会朗读出'图像'。设置为'button'时，聚焦后后系统朗读出'按钮'。 `aria-label`表示组件附带的额外信息，聚焦后系统会自动朗读出来。

## 无障碍属性
以下 ARIA 属性可作为 props 直接传入任意组件，实现自定义无障碍语义。

| 属性 | 说明 |
| --- | --- |
| role | 语义角色，如 `button`、`checkbox`、`slider`、`link` 等 |
| aria-label | 朗读文本，辅助技术读取此值描述元素 |
| aria-labelledby | 引用其他元素的 id，辅助技术将该元素的文本作为当前元素的标签（适用于有独立标题的区域） |
| aria-describedby | 引用其他元素的 id，辅助技术将该元素的文本作为当前元素的描述信息 |
| aria-disabled | 元素是否处于禁用状态 |
| aria-hidden | 为 `'true'` 时辅助技术忽略该元素及其子树，适用于纯装饰性内容 |
| aria-checked | 元素是否处于选中状态（适用于 `checkbox`、`radio`、`switch`） |
| aria-selected | 元素是否处于选中状态（适用于列表项、Tab 等可选中场景） |
| aria-expanded | 元素是否处于展开状态（适用于折叠面板等） |
| aria-haspopup | 元素是否具有弹出层（如下拉菜单） |
| aria-live | 实时区域更新策略，可选值：`off`（默认，不播报）、`polite`（内容更新完成后播报）、`assertive`（立即打断当前播报） |
| aria-atomic | 与 `aria-live` 配合，为 `'true'` 时辅助技术整体播报实时区域，为 `'false'` 时只播报变化部分 |
| aria-relevant | 与 `aria-live` 配合，指定哪类变化触发播报，可选值：`additions`、`removals`、`text`、`all` |
| aria-required | 表单元素是否为必填项（适用于 `input`、`textarea` 等） |
| aria-flowto | 指定阅读顺序的下一个元素 id，覆盖默认文档顺序 |
| aria-valuetext | 范围类元素当前值的人类可读文本（优先于 `aria-valuenow` 被朗读） |
| aria-valuemin | 范围类元素的最小值（适用于 `slider`） |
| aria-valuemax | 范围类元素的最大值（适用于 `slider`） |
| aria-valuenow | 范围类元素的当前值（适用于 `slider`） |
| tabindex | 元素在 Tab 键导航中的顺序；`0` 表示可聚焦，`-1` 表示不可聚焦 |

## 组件库内置 ARIA 属性

以下组件会内置对应的 ARIA 属性，开发者无需手动传入：

| 组件 | 无障碍属性 |
| --- | --- |
| Button | `role="button"` `aria-disabled` |
| Input / Textarea | `aria-disabled` |
| Checkbox | `role="checkbox"` `aria-checked` `aria-disabled` |
| Radio | `role="radio"` `aria-checked` `aria-disabled` |
| Switch | `role="switch"` `aria-checked` `aria-disabled` |
| Slider | `role="slider"` `aria-valuemin` `aria-valuemax` `aria-valuenow` `aria-disabled` |
| Picker | `aria-haspopup="true"` `aria-disabled` |
| Navigator | `role="link"` `tabindex="0"` |

## 示例代码

### 为 View 添加 role 和 aria-label

```jsx | sandbox previewTitle="自定义无障碍属性"
import React from 'react';
import { View, Text } from '@ray-js/ray';

export default function AccessibilityDemo() {
  return (
    <View
      role="button"
      aria-label="关闭对话框"
      tabindex="0"
      style={{ padding: '20rpx', background: '#f0f0f0', display: 'inline-block' }}
    >
      <Text>x</Text>
    </View>
  );
}
```

## 常见问题

**为什么给 `Button` 传了 `role` 却没有效果？**

`Button` 内部已内置 `role="button"`，若传入自定义 `role` 会被内置值覆盖。如需自定义语义角色，请使用 `View` 等无内置 role 的元素。

**`aria-label` 和组件内部文字哪个会被朗读？**

当同时存在 `aria-label` 和组件内部文本时，辅助技术通常优先朗读 `aria-label`。建议当组件内部文字足以描述语义时，不额外设置 `aria-label`；对于纯图标按钮等缺乏文字说明的场景，务必设置 `aria-label`。

**`tabindex` 的值如何选择？**

通常只使用 `0` 和 `-1`：`0` 将元素加入默认 Tab 顺序，`-1` 使元素可通过脚本聚焦但不出现在 Tab 顺序中。不建议使用正整数，因为会破坏自然 Tab 顺序。
