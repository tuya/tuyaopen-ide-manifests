---
id: a11y-touch-target
priority: MEDIUM
category: Accessibility > Touch
---

# Minimum Touch Target Size and Spacing

## Rule
可点击元素的触摸目标尺寸不得小于 44×44pt（88×88rpx），且相邻目标间距 ≥8pt。若设计稿中的视觉元素确实小于 88rpx，不要强行放大视觉尺寸；优先使用 `::before` / `::after` 伪元素把实际可点击热区隐式扩展到 88×88rpx。

## Bad (Ray 小程序)
```tsx
<View className="closeIcon" onClick={onClose}>
  <Icon type="close" />
</View>
```

```less
.closeIcon {
  width: 60rpx;
  height: 60rpx;
}
```
视觉和实际热区都只有 60rpx，难以准确命中。

## Good (Ray 小程序)
```tsx
<View className="closeIcon closeIconHitArea" onClick={onClose}>
  <Icon type="close" />
</View>
```

```less
.closeIcon {
  position: relative;
  width: 60rpx;
  height: 60rpx;
}

.closeIconHitArea::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 88rpx;
  height: 88rpx;
  transform: translate(-50%, -50%);
}
```
视觉尺寸保持设计稿的 60rpx，同时实际触摸热区扩展到 88rpx。

## Why
过小的触摸目标导致用户频繁误触或难以命中，尤其影响老年用户和运动场景。WCAG 2.5.5 要求至少 44×44 CSS px。
