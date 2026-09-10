---
id: content-error-message
priority: LOW-MEDIUM
category: Content > Copy
---

# 错误提示需说明问题并给出下一步

## Rule
错误提示必须包含「问题说明 + 下一步操作」，禁止只显示错误码或技术信息。

## Bad
```js
ty.showToast({ title: 'Error: 500' });
ty.showToast({ title: '请求失败' });
```
用户不知如何处理。

## Good
```js
ty.showToast({ title: '网络连接失败，请检查网络后重试' });
```
说明原因并给出可执行的操作建议。

## Why
技术性错误信息对用户毫无意义。好的错误提示降低用户焦虑并引导下一步操作。
