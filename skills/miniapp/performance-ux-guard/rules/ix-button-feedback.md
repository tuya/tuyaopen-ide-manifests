---
id: ix-button-feedback
priority: HIGH
category: Interaction > Feedback
---

# 关键操作按钮即时视觉反馈

## Rule

关键操作按钮必须具备即时视觉反馈（loading/禁用/hover 态），禁止点击无反馈。

## Bad

```jsx
<Button onTap={onActionTap}>
  {label}
</Button>
```

触发后按钮没有 loading、disabled 或状态文案，用户无法判断操作是否已响应。

## Good

```jsx
<Button
  onTap={onActionTap}
  loading={state.submitting}
  disabled={state.submitting}
>
  {state.submitting ? labels.processing : labels.action}
</Button>
```

关键操作同时具备 loading、禁用和状态文案，反馈与防重提交保持一致。

## Why

无反馈的按钮让用户产生疑虑并可能重复点击。即时反馈是交互体验的基础，200ms 内未有反馈用户即感知到延迟。
