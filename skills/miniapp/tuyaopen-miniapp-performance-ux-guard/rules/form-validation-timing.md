---
id: form-validation-timing
priority: LOW-MEDIUM
category: Form > Validation
---

# 表单校验时机：失焦或提交，而非每次击键

## Rule
表单校验应在失焦时或提交时触发，避免每次击键都弹错误提示。

## Bad
```js
onInput(e) {
  this.validateField(e.detail.value); // 每次输入都校验并 showToast
}
```
用户还没输完就看到错误信息。

## Good
```js
onBlur(e) { this.validateField(e.detail.value); }
onSubmit() { this.validateForm(); }
```
bindblur 时校验单字段，submit 时校验全表单；首次提交后可切换为实时校验。

## Why
过早校验打断输入流程，给用户压力。正确的时机能平衡即时反馈与输入体验。
