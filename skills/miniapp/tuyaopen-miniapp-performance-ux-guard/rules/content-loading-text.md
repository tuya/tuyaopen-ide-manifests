---
id: content-loading-text
priority: LOW
category: Content > Copy
---

# Loading 文案使用标准省略号

## Rule
Loading/等待类文案使用 `…`（省略号）结尾，保持一致的文案风格。

## Bad
```js
ty.showToast({ title: 'Loading...' });
ty.showToast({ title: '加载中...' });
```
使用三个英文句号而非 Unicode 省略号，排版不统一。

## Good
```js
ty.showToast({ title: '加载中…' });
ty.showToast({ title: '提交中…' });
```
使用标准省略号字符 U+2026。

## Why
统一的文案风格体现产品品质。省略号是正确的排版字符，三个句号在某些字体下间距不一致。
