---
id: form-input-type
priority: MEDIUM
category: Form > Input
---

# Input 组件需设置正确的 type 与 confirm-type

## Rule
input 组件必须设置正确的 type 和 confirm-type，让系统弹出匹配键盘。

## Bad
```ttml
<input type="text" />
```
手机号等数字场景弹出全键盘，用户需切换到数字键盘。

## Good
```ttml
<input type="number" />
<!-- 或电话/验证码等： -->
<input type="digit" />
```
用于电话/金额等场景时直接弹出数字键盘，减少切换成本。

## Why
正确的输入类型减少用户切换键盘的操作成本，提升输入效率与准确率。
