---
id: launch-resource-cdn
priority: HIGH
category: Launch > Resources
---

# 重资源上 CDN，勿打入代码包

## Rule
包内重资源（图片、字体、大 JSON）必须上 CDN，禁止打入代码包

## Bad
```js
<Image src="/assets/logo.png" />
// project: assets/logo.png ~200KB, fonts/custom.woff2 in repo
```
将 logo.png（200KB）和字体文件直接放在项目 assets 目录 — 增大包体。

## Good
```js
<Image src="https://cdn.example.com/static/logo.png" />
```
资源上传 CDN，代码中引用 CDN URL，配合缓存策略。

## Why
包内资源增大下载体积，而 CDN 资源可利用缓存与就近分发，不影响包体大小。
